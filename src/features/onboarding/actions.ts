"use server";

import { randomUUID } from "node:crypto";
import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { uploadDocument } from "@/infrastructure/storage/document-storage";
import { extractDocumentText } from "@/infrastructure/storage/document-text-extraction";
import { getAiProvider, EXTRACTION_MODEL } from "@/infrastructure/ai";
import { profileExtractionSchema, type ProfileExtraction } from "@/config/schemas/profile-extraction";
import { PROMPT_CATALOG, delimitUntrustedDocument } from "@/config/prompts/catalog";
import { ONBOARDING_CONFIG } from "@/config/engine/onboarding";
import { personalDataSchema, targetContextSchema } from "./schemas";
import { isAccountDeletionPending } from "@/lib/account-status";
import { trackEvent } from "@/infrastructure/analytics";
import { ANALYTICS_EVENTS } from "@/infrastructure/analytics/events";

export interface OnboardingActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/onboarding");
  return { supabase, user };
}

export async function savePersonalDataAction(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const parsed = personalDataSchema.safeParse({
    fullName: formData.get("fullName"),
    city: formData.get("city") || undefined,
    state: formData.get("state") || undefined,
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return { fieldErrors: { fullName: flat.fullName?.[0] ?? "" } };
  }

  const { supabase, user } = await requireUser();
  // Personal data is stored separately from professional data (RN-ONB-014)
  // and is never sent to the AI or used in scoring (RN-ONB-004).
  const { error } = await supabase.from("personal_data").upsert(
    {
      user_id: user.id,
      full_name: parsed.data.fullName,
      city: parsed.data.city ?? null,
      state: parsed.data.state ?? null,
    },
    { onConflict: "user_id" },
  );
  if (error) return { error: "Não foi possível salvar seus dados agora. Tente novamente." };

  revalidatePath("/onboarding");
  redirect("/onboarding");
}

/** RF-ONB-021..038 / RF-ONB-039..051 — résumé and LinkedIn upload share one path. */
export async function uploadDocumentAction(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const documentType = formData.get("documentType");
  if (documentType !== "resume" && documentType !== "linkedin") {
    return { error: "Tipo de documento inválido." };
  }

  const file = formData.get("file");
  const pastedText = formData.get("pastedText");
  const hasFile = file instanceof File && file.size > 0;
  const hasText = typeof pastedText === "string" && pastedText.trim().length > 0;

  if (!hasFile && !hasText) {
    return { error: "Envie um arquivo ou cole o conteúdo em texto." };
  }

  const { supabase, user } = await requireUser();

  if (await isAccountDeletionPending(supabase, user.id)) {
    return { error: "Sua conta está em processo de exclusão. Não é possível enviar novos documentos." };
  }

  const documentId = randomUUID();

  let storagePath: string | null = null;
  let contentHash: string;
  let mimeType: string;
  let sizeBytes: number;
  let originalFilename: string | null = null;
  let sourceType: "file_upload" | "pasted_text";

  if (hasFile) {
    const uploadedFile = file as File;
    const extension = uploadedFile.name.split(".").pop()?.toLowerCase() ?? "";
    const allowedExtensions: readonly string[] = ONBOARDING_CONFIG.documents.allowedExtensions;
    if (!allowedExtensions.includes(extension)) {
      return { error: "Formato de arquivo não suportado. Envie PDF, DOCX ou cole o conteúdo em texto." };
    }
    if (uploadedFile.size > ONBOARDING_CONFIG.documents.maxFileSizeMb * 1024 * 1024) {
      return { error: `O arquivo excede o limite de ${ONBOARDING_CONFIG.documents.maxFileSizeMb} MB.` };
    }
    const buffer = Buffer.from(await uploadedFile.arrayBuffer());
    contentHash = createHash("sha256").update(buffer).digest("hex");
    mimeType = uploadedFile.type || "application/octet-stream";
    sizeBytes = uploadedFile.size;
    originalFilename = uploadedFile.name.slice(0, ONBOARDING_CONFIG.documents.maxOriginalFileNameCharacters);
    sourceType = "file_upload";

    const { path } = await uploadDocument(supabase, {
      userId: user.id,
      documentId,
      filename: originalFilename,
      file: new Blob([buffer], { type: mimeType }),
      contentType: mimeType,
    });
    storagePath = path;
  } else {
    const text = (pastedText as string).slice(0, ONBOARDING_CONFIG.documents.maxPastedTextCharacters);
    contentHash = createHash("sha256").update(text).digest("hex");
    mimeType = "text/plain";
    sizeBytes = Buffer.byteLength(text);
    sourceType = "pasted_text";
  }

  // Replacing a document creates a new row rather than mutating an existing
  // one, matching RF-ONB-034/048 ("substituição registra nova origem
  // documental") — the old row is superseded, never rewritten in place.
  await supabase
    .from("documents")
    .update({ status: "deleted", deleted_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("document_type", documentType)
    .neq("status", "deleted");

  const { error: insertError } = await supabase.from("documents").insert({
    id: documentId,
    user_id: user.id,
    document_type: documentType,
    source_type: sourceType,
    storage_path: storagePath,
    original_filename: originalFilename,
    mime_type: mimeType,
    size_bytes: sizeBytes,
    content_hash: contentHash,
    status: "queued",
  });
  if (insertError) return { error: "Não foi possível registrar o documento agora. Tente novamente." };

  trackEvent(documentType === "resume" ? ANALYTICS_EVENTS.resumeUploaded : ANALYTICS_EVENTS.linkedinUploaded, {
    userId: user.id,
    properties: { documentType },
  });

  // Pasted text is processed directly from the request (no storage round-trip needed).
  await processDocument(documentId, hasFile ? undefined : (pastedText as string));

  revalidatePath("/onboarding");
  redirect("/onboarding");
}

/**
 * Processing "job" — modeled through processing_jobs for traceability
 * (queued -> processing -> completed/failed), executed synchronously within
 * the request in this implementation (no queue/worker infrastructure is
 * provisioned in this environment). A production deployment should move the
 * body of this function behind a real queue without changing its contract.
 */
async function processDocument(documentId: string, pastedText?: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { data: document } = await supabase
    .from("documents")
    .select("id, document_type, storage_path, content_hash, mime_type, original_filename")
    .eq("id", documentId)
    .single();
  if (!document) return;

  const idempotencyKey = `doc-extraction-${document.content_hash}`;
  const { data: job, error: jobInsertError } = await supabase
    .from("processing_jobs")
    .insert({
      user_id: user.id,
      job_type: document.document_type === "resume" ? "resume_extraction" : "linkedin_extraction",
      resource_type: "documents",
      resource_id: documentId,
      status: "processing",
      idempotency_key: idempotencyKey,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (jobInsertError) {
    // Job bookkeeping is for traceability/observability, not a hard
    // dependency of extraction itself — log loudly instead of failing the
    // whole upload, but never swallow this silently (a previous version of
    // this code did, and it hid a missing RLS policy for weeks of "testing").
    console.error("processing_jobs insert failed:", jobInsertError.message);
  }

  let content = pastedText ?? "";
  if (!content && document.storage_path) {
    const { data: fileData } = await supabase.storage.from("temporary-documents").download(document.storage_path);
    if (fileData) {
      const buffer = Buffer.from(await fileData.arrayBuffer());
      content = await extractDocumentText({
        buffer,
        mimeType: document.mime_type ?? "",
        filename: document.original_filename,
      });
    }
  }

  const usefulChars = content.trim().length;
  if (usefulChars < ONBOARDING_CONFIG.content.minimumUsefulCharacters) {
    await supabase.from("documents").update({ status: "insufficient_content" }).eq("id", documentId);
    if (job) await supabase.from("processing_jobs").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", job.id);
    await maybeAutoConfirmProfile(supabase, user.id);
    return;
  }

  try {
    const provider = getAiProvider();
    const promptId = document.document_type === "resume" ? "P-001" : "P-002";
    const prompt = PROMPT_CATALOG[promptId]!;
    const result = await provider.complete({
      promptId,
      promptVersion: prompt.version,
      systemPrompt: buildExtractionSystemPrompt(document.document_type),
      userContent: delimitUntrustedDocument(document.document_type, content),
      schema: profileExtractionSchema,
      model: EXTRACTION_MODEL,
      // Default (4096) truncates mid-JSON before any of the required arrays
      // (experiences/competencies/tools/...) are written for real, content-rich
      // resumes and LinkedIn exports — every schema-repair retry fails
      // identically since the arrays are simply missing, not malformed.
      // Scales with input text length; 16000 ceiling matches the proven-safe
      // cap already used for this same model in Core 2's structuring step.
      maxOutputTokens: Math.min(16000, 6000 + Math.floor(content.length / 4)),
    });

    await supabase.from("document_extractions").insert({
      document_id: documentId,
      schema_version: result.data.schemaVersion,
      prompt_version: prompt.version,
      model_version: result.modelVersion,
      status: result.data.extractionStatus,
      validated_payload: result.data,
      warnings: result.data.warnings,
      completed_at: new Date().toISOString(),
    });

    await supabase
      .from("documents")
      .update({ status: result.data.extractionStatus === "failed" ? "failed_final" : "ready", processed_at: new Date().toISOString() })
      .eq("id", documentId);

    if (job) {
      await supabase.from("processing_jobs").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", job.id);
    }

    await maybeAutoConfirmProfile(supabase, user.id);
  } catch (err) {
    await supabase.from("documents").update({ status: "failed_retryable" }).eq("id", documentId);
    if (job) {
      await supabase
        .from("processing_jobs")
        .update({
          status: "failed",
          error_category: "invalid_model_output",
          error_message_safe: "Falha ao processar o documento. Tente novamente.",
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    }
    throw err;
  }
}

/**
 * There is no "Revise seu perfil" step anymore — once both résumé and
 * LinkedIn have reached a terminal ready state (ready or
 * insufficient_content), the draft Thin Twin version is created and
 * confirmed automatically, right here, instead of waiting on a user click.
 * Called from both processDocument exit points, so it fires regardless of
 * which of the two documents finishes last.
 */
async function maybeAutoConfirmProfile(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string): Promise<void> {
  const { data: documents } = await supabase
    .from("documents")
    .select("document_type, status")
    .eq("user_id", userId)
    .in("document_type", ["resume", "linkedin"])
    .neq("status", "deleted");

  const isTerminalReady = (status: string | undefined) => status === "ready" || status === "insufficient_content";
  const resumeStatus = documents?.find((d) => d.document_type === "resume")?.status;
  const linkedinStatus = documents?.find((d) => d.document_type === "linkedin")?.status;
  if (!isTerminalReady(resumeStatus) || !isTerminalReady(linkedinStatus)) return;

  const { data: profile } = await supabase.from("professional_profiles").select("status").eq("user_id", userId).maybeSingle();
  if (profile?.status === "confirmed") return;

  await ensureProfileDraft();
  await confirmProfileAction();
}

function buildExtractionSystemPrompt(documentType: string): string {
  return [
    "Você é o motor de extração profissional do CareerTwin.",
    "Extraia apenas informações presentes no documento fornecido, com evidência e confiança de extração.",
    "Nunca invente experiências, ferramentas, métricas ou resultados não presentes no material.",
    "Marque inferências como inferência/hipótese, nunca como fato confirmado.",
    `Tipo de documento: ${documentType}.`,
    "Retorne exclusivamente um JSON válido no formato do schema fornecido, sem texto adicional.",
  ].join(" ");
}

/** Retries processing for whichever résumé/LinkedIn document last failed recoverably. */
export async function retryDocumentProcessingAction(): Promise<void> {
  const { supabase, user } = await requireUser();
  const { data: documents } = await supabase
    .from("documents")
    .select("id, document_type, status")
    .eq("user_id", user.id)
    .eq("status", "failed_retryable")
    .in("document_type", ["resume", "linkedin"]);

  for (const doc of documents ?? []) {
    await supabase.from("documents").update({ status: "queued" }).eq("id", doc.id);
    await processDocument(doc.id);
  }

  revalidatePath("/onboarding");
}

/**
 * Creates the draft Thin Twin version and consolidates both extracted
 * documents into it (see consolidateExtractedExperiences below — a partial
 * P-003: experiences/evidences only, no conflict resolution/normalization
 * yet). Called from maybeAutoConfirmProfile — must NOT call
 * revalidatePath/redirect itself, since it also runs as a plain async
 * helper (not a Server Action) when invoked from there.
 */
export async function ensureProfileDraft(): Promise<void> {
  const { supabase, user } = await requireUser();

  let { data: profile } = await supabase
    .from("professional_profiles")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    const { data: created } = await supabase
      .from("professional_profiles")
      .insert({ user_id: user.id, status: "draft" })
      .select("id, status")
      .single();
    profile = created;
  }
  if (!profile) return;

  const { data: existingDraft } = await supabase
    .from("profile_versions")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("status", "draft")
    .maybeSingle();
  if (existingDraft) return;

  const { count } = await supabase
    .from("profile_versions")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id);

  const { data: newVersion } = await supabase
    .from("profile_versions")
    .insert({
      profile_id: profile.id,
      version_number: (count ?? 0) + 1,
      status: "draft",
      source_type: "initial_onboarding",
      change_reason: "Rascunho inicial gerado a partir de currículo e LinkedIn.",
    })
    .select("id")
    .single();
  if (!newVersion) return;

  await consolidateExtractedExperiences(supabase, user.id, newVersion.id);
}

/**
 * P-003 (partial) — copies each successfully extracted document's
 * experiences/results into `experiences`/`evidences` on the new draft
 * version. Only the most recent ready extraction per document type
 * (resume/linkedin) is used. `profile_skills`/`profile_tools` are NOT
 * populated here: they reference the shared `skills`/`tools` catalog tables,
 * which (like `role_references`, open-decisions.md #1) only allow curator/
 * service-role writes — there is no client-safe way to create a new skill/
 * tool entry on demand in this environment. Competencies/tools stay
 * reviewer-added-only until that catalog exists.
 */
async function consolidateExtractedExperiences(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  profileVersionId: string,
): Promise<void> {
  const { data: documents } = await supabase
    .from("documents")
    .select("id, document_type, created_at, document_extractions(validated_payload, status, completed_at)")
    .eq("user_id", userId)
    .in("document_type", ["resume", "linkedin"])
    .eq("status", "ready")
    .order("created_at", { ascending: false });
  if (!documents) return;

  const latestByType = new Map<string, { id: string; document_type: string; validated_payload: unknown }>();
  for (const doc of documents) {
    if (latestByType.has(doc.document_type)) continue;
    const extractions = Array.isArray(doc.document_extractions) ? doc.document_extractions : [doc.document_extractions];
    const extraction = extractions.find((e) => e && (e.status === "complete" || e.status === "partial") && e.validated_payload);
    if (extraction) latestByType.set(doc.document_type, { id: doc.id, document_type: doc.document_type, validated_payload: extraction.validated_payload });
  }

  for (const doc of latestByType.values()) {
    const payload = doc.validated_payload as Pick<ProfileExtraction, "experiences"> | null;
    if (!payload?.experiences?.length) continue;

    for (const exp of payload.experiences) {
      const { data: insertedExperience } = await supabase
        .from("experiences")
        .insert({
          profile_version_id: profileVersionId,
          company_name: exp.company,
          role_title: exp.role,
          start_date: toSqlDate(exp.startDate),
          end_date: toSqlDate(exp.endDate),
          is_current: !exp.endDate,
          description: [...exp.responsibilities, ...exp.projects].join(" ") || null,
          confirmation_status: "extracted",
        })
        .select("id")
        .single();
      if (!insertedExperience) continue;

      const results = exp.results.map((summary) => ({
        profile_version_id: profileVersionId,
        evidence_type: /\d/.test(summary) ? "quantitative_result" : "qualitative_result",
        summary,
        source_document_id: doc.id,
        source_type: doc.document_type,
        confirmation_status: "extracted",
      }));
      if (results.length > 0) await supabase.from("evidences").insert(results);
    }
  }
}

/** Extraction dates are "YYYY-MM" or "YYYY-MM-DD"; anything else is left null rather than risk an invalid date. */
function toSqlDate(value: string | null): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`;
  return null;
}

/** RF-ONB-128..133 — confirmation creates the immutable Thin Twin version. Called automatically by maybeAutoConfirmProfile, no user action needed. */
export async function confirmProfileAction(): Promise<void> {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("professional_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  const { data: draftVersion } = await supabase
    .from("profile_versions")
    .select("id")
    .eq("profile_id", profile!.id)
    .eq("status", "draft")
    .single();
  if (!draftVersion) return;

  const { data: experiences } = await supabase
    .from("experiences")
    .select("id, company_name, role_title, confirmation_status")
    .eq("profile_version_id", draftVersion.id);

  const snapshot = { experiences: experiences ?? [] };
  const snapshotHash = createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");

  await supabase
    .from("profile_versions")
    .update({
      status: "confirmed",
      confirmed_by_user_id: user.id,
      confirmed_at: new Date().toISOString(),
      snapshot,
      snapshot_hash: snapshotHash,
    })
    .eq("id", draftVersion.id);

  await supabase
    .from("professional_profiles")
    .update({ status: "confirmed", current_version_id: draftVersion.id })
    .eq("id", profile!.id);

  trackEvent(ANALYTICS_EVENTS.twinProfileConfirmed, { userId: user.id });

  revalidatePath("/onboarding");
}

export async function saveTargetContextAction(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const parsed = targetContextSchema.safeParse({
    targetArea: formData.get("targetArea"),
    targetRole: formData.get("targetRole"),
    desiredSeniority: formData.get("desiredSeniority"),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return {
      fieldErrors: {
        targetArea: flat.targetArea?.[0] ?? "",
        targetRole: flat.targetRole?.[0] ?? "",
        desiredSeniority: flat.desiredSeniority?.[0] ?? "",
      },
    };
  }

  const { supabase, user } = await requireUser();
  let { data: targetContext } = await supabase
    .from("target_contexts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!targetContext) {
    const { data: created } = await supabase
      .from("target_contexts")
      .insert({ user_id: user.id, status: "draft" })
      .select("id")
      .single();
    targetContext = created;
  }
  if (!targetContext) return { error: "Não foi possível salvar seu contexto-alvo agora." };

  const { count } = await supabase
    .from("target_context_versions")
    .select("id", { count: "exact", head: true })
    .eq("target_context_id", targetContext.id);

  const { data: version } = await supabase
    .from("target_context_versions")
    .insert({
      target_context_id: targetContext.id,
      version_number: (count ?? 0) + 1,
      target_area: parsed.data.targetArea,
      target_role: parsed.data.targetRole,
      desired_seniority: parsed.data.desiredSeniority,
      confirmation_status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (version) {
    await supabase
      .from("target_contexts")
      .update({ status: "confirmed", current_version_id: version.id })
      .eq("id", targetContext.id);
    trackEvent(ANALYTICS_EVENTS.targetRoleDefined, { userId: user.id });
  }

  revalidatePath("/onboarding");
  redirect("/onboarding");
}

/** RF-ONB-150..155 — the 9 preconditions are re-checked server-side, not trusted from the client. */
export async function completeOnboardingAction(): Promise<void> {
  const { supabase, user } = await requireUser();
  const { getOnboardingState } = await import("./get-state");
  const state = await getOnboardingState(supabase, user.id);

  if (state.step !== "completed") {
    redirect("/onboarding");
  }

  await supabase.from("user_accounts").update({ onboarding_status: "completed" }).eq("user_id", user.id);
  trackEvent(ANALYTICS_EVENTS.onboardingCompleted, { userId: user.id });

  // Runs the first Análise de Perfil inline so it's already ready when the
  // user lands on the result page — best-effort: on failure they land on
  // the plain entry page instead and can retry from there like any other
  // analysis.
  const { runInitialProfileAnalysis } = await import("@/features/core-1/actions");
  const result = await runInitialProfileAnalysis();

  redirect(result.ok && result.analysisId ? `/app/analise-perfil/${result.analysisId}` : "/app/analise-perfil");
}
