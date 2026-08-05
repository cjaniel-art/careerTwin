"use server";

import { randomUUID } from "node:crypto";
import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { uploadDocument, documentStoragePath, TEMPORARY_DOCUMENTS_BUCKET } from "@/infrastructure/storage/document-storage";
import { resolveDocumentText } from "@/infrastructure/storage/document-markdown";
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

    // Pasted text goes to storage like any upload: extraction runs in a later
    // request now, so in-memory content from this one is no longer reachable.
    const { path } = await uploadDocument(supabase, {
      userId: user.id,
      documentId,
      filename: "conteudo-colado.txt",
      file: new Blob([text], { type: mimeType }),
      contentType: mimeType,
    });
    storagePath = path;
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

  // No extraction here: the upload steps only persist. Everything is processed
  // one stage at a time after "Concluir configuração" (runOnboardingStageAction).
  revalidatePath("/onboarding");
  redirect("/onboarding");
}

/** Where the resolved plain-text/Markdown form of a document is cached, next to the original. */
function documentTextPath(userId: string, documentId: string): string {
  return documentStoragePath(userId, documentId, "document.md");
}

/**
 * Resolves a document to text once and caches the result in storage.
 *
 * Caching is what makes the visual PDF fallback affordable: reading a
 * text-layer-less PDF costs a model call, and without this every schema-repair
 * retry and every "Tentar novamente" would pay for it again.
 */
async function ensureDocumentText(documentId: string): Promise<string> {
  const { supabase, user } = await requireUser();

  const { data: document } = await supabase
    .from("documents")
    .select("id, storage_path, mime_type, original_filename")
    .eq("id", documentId)
    .single();
  if (!document?.storage_path) return "";

  const textPath = documentTextPath(user.id, documentId);
  const { data: cached } = await supabase.storage.from(TEMPORARY_DOCUMENTS_BUCKET).download(textPath);
  if (cached) return await cached.text();

  const { data: original } = await supabase.storage.from(TEMPORARY_DOCUMENTS_BUCKET).download(document.storage_path);
  if (!original) return "";

  const resolved = await resolveDocumentText({
    buffer: Buffer.from(await original.arrayBuffer()),
    mimeType: document.mime_type ?? "",
    filename: document.original_filename,
  });

  // Upload failure here is recoverable — it costs a re-read next time, so it
  // must not fail the extraction that already has its text in hand.
  const { error: cacheError } = await supabase.storage
    .from(TEMPORARY_DOCUMENTS_BUCKET)
    .upload(textPath, new Blob([resolved.text], { type: "text/markdown" }), { contentType: "text/markdown", upsert: true });
  if (cacheError) console.error("document text cache upload failed:", cacheError.message);

  return resolved.text;
}

/**
 * Processing "job" — modeled through processing_jobs for traceability
 * (queued -> processing -> completed/failed), executed synchronously within
 * the request in this implementation (no queue/worker infrastructure is
 * provisioned in this environment). A production deployment should move the
 * body of this function behind a real queue without changing its contract.
 *
 * One document per request, by design: a single Vercel invocation is capped at
 * 60s, and résumé + LinkedIn extraction together routinely exceed that.
 */
async function processDocument(documentId: string): Promise<void> {
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

  const content = await ensureDocumentText(documentId);

  const usefulChars = content.trim().length;
  if (usefulChars < ONBOARDING_CONFIG.content.minimumUsefulCharacters) {
    await supabase.from("documents").update({ status: "insufficient_content" }).eq("id", documentId);
    if (job) await supabase.from("processing_jobs").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", job.id);
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
      // Truncated JSON comes back as "trailing required arrays missing", which
      // schema repair can never fix — it retries at the same budget and fails
      // identically 3x. The structured output is routinely *larger* than the
      // source text (every experience carries evidence + confidence), so the
      // budget is sized above input length, not as a fraction of it. This is a
      // ceiling, not a reservation: unused tokens are neither billed nor waited on.
      maxOutputTokens: Math.min(32000, 8000 + content.length),
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

/**
 * Creates the draft Thin Twin version and consolidates both extracted
 * documents into it (see consolidateExtractedExperiences below — a partial
 * P-003: experiences/evidences only, no conflict resolution/normalization
 * yet). Called from the "profile" stage — must NOT call
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

/** RF-ONB-128..133 — confirmation creates the immutable Thin Twin version. Called automatically by the "profile" stage, no user action needed. */
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

export type OnboardingStage =
  | "read_resume"
  | "resume"
  | "read_linkedin"
  | "linkedin"
  | "profile"
  | "analysis";

export interface OnboardingStageResult {
  ok: boolean;
  /** Next stage to run, or null when the chain is finished. */
  next: OnboardingStage | null;
  redirectTo?: string;
}

/**
 * Runs a single stage of the post-"Concluir configuração" pipeline. The client
 * chains the stages, one request each, so no single Vercel invocation has to
 * fit résumé extraction + LinkedIn extraction + Thin Twin + Análise de Perfil
 * inside the 60s function limit. A failed stage is returned as-is so
 * "Tentar novamente" resumes from it instead of redoing the whole chain.
 */
export async function runOnboardingStageAction(stage: OnboardingStage): Promise<OnboardingStageResult> {
  const { supabase, user } = await requireUser();

  // RF-ONB-150..155 — preconditions re-checked server-side on every stage, not trusted from the client.
  const { getOnboardingState } = await import("./get-state");
  const state = await getOnboardingState(supabase, user.id);
  if (state.step !== "completed") redirect("/onboarding");

  try {
    switch (stage) {
      // Reading is split from extraction because a PDF with no text layer costs
      // a model call of its own — bundled with extraction it would exceed 60s.
      // For an ordinary PDF this stage is local parsing and returns in ms.
      case "read_resume":
      case "read_linkedin": {
        const documentId = stage === "read_resume" ? state.resumeDocumentId : state.linkedinDocumentId;
        if (documentId) await ensureDocumentText(documentId);
        return { ok: true, next: stage === "read_resume" ? "resume" : "linkedin" };
      }

      case "resume":
      case "linkedin": {
        const documentId = stage === "resume" ? state.resumeDocumentId : state.linkedinDocumentId;
        if (documentId) {
          const { data: document } = await supabase.from("documents").select("status").eq("id", documentId).single();
          // Already extracted on an earlier attempt — skip instead of paying for it twice.
          if (document?.status !== "ready" && document?.status !== "insufficient_content") {
            await supabase.from("documents").update({ status: "queued" }).eq("id", documentId);
            await processDocument(documentId);
          }
        }
        return { ok: true, next: stage === "resume" ? "read_linkedin" : "profile" };
      }

      case "profile": {
        const { data: profile } = await supabase
          .from("professional_profiles")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle();
        if (profile?.status !== "confirmed") {
          await ensureProfileDraft();
          await confirmProfileAction();
        }
        await supabase.from("user_accounts").update({ onboarding_status: "completed" }).eq("user_id", user.id);
        trackEvent(ANALYTICS_EVENTS.onboardingCompleted, { userId: user.id });
        return { ok: true, next: "analysis" };
      }

      case "analysis": {
        const { runInitialProfileAnalysis } = await import("@/features/core-1/actions");
        const result = await runInitialProfileAnalysis();
        if (!result.ok) return { ok: false, next: "analysis" };
        return {
          ok: true,
          next: null,
          redirectTo: result.analysisId ? `/app/analise-perfil/${result.analysisId}` : "/app/analise-perfil",
        };
      }
    }
  } catch (err) {
    console.error(`runOnboardingStageAction(${stage}) failed:`, err);
    return { ok: false, next: stage };
  }
}
