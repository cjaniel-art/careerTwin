import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { documentStoragePath, TEMPORARY_DOCUMENTS_BUCKET } from "@/infrastructure/storage/document-storage";
import { resolveDocumentText } from "@/infrastructure/storage/document-markdown";
import { getAiProvider, EXTRACTION_MODEL } from "@/infrastructure/ai";
import {
  profileExtractionSchema,
  profileExperiencesExtractionSchema,
  profileSkillsExtractionSchema,
  type ProfileExtraction,
} from "@/config/schemas/profile-extraction";
import { PROMPT_CATALOG, delimitUntrustedDocument } from "@/config/prompts/catalog";
import { ONBOARDING_CONFIG } from "@/config/engine/onboarding";
import { trackEvent } from "@/infrastructure/analytics";
import { ANALYTICS_EVENTS } from "@/infrastructure/analytics/events";

/**
 * The onboarding processing pipeline, as plain functions rather than Server
 * Actions: it is driven from a Route Handler so the browser can fire stages
 * without awaiting them (background prewarming) and run the résumé and
 * LinkedIn chains concurrently. Next serializes Server Actions per client,
 * which would defeat both.
 */

export type DocumentStage = "resume" | "linkedin";
export type PipelineStage = DocumentStage | "profile" | "profile_reconsolidation" | "analysis";

export interface StageResult {
  ok: boolean;
  /** False means "call me again" — the stage ran out of budget, not that it failed. */
  done: boolean;
  redirectTo?: string;
  /** "analysis" stage only — which half of Core 1 is in flight, for accurate UI progress (see runAnalysisStage). */
  analysisStatus?: "processing" | "preliminary" | "completed" | "failed_retryable";
}

const TERMINAL_STATUSES = ["ready", "insufficient_content", "failed_final"];

/**
 * A request that dies mid-extraction leaves the row stuck in `processing`.
 * The platform kills a function at 60s, so anything still `processing` past
 * that ceiling has no owner left alive and is safe to take over.
 */
const STALE_PROCESSING_MS = 75_000;

/** How long a stage waits on another request's in-flight work before handing the turn back to the client. */
const WAIT_FOR_OWNER_MS = 40_000;
const POLL_INTERVAL_MS = 2_000;

/**
 * Compare-and-set on `documents.status`. Two concurrent requests both see
 * `queued`, both issue the UPDATE, and Postgres row locking lets exactly one
 * match — the loser gets zero rows back and knows someone else owns the work.
 * This is what keeps the background prewarm from double-paying for extraction
 * when the completion screen starts the same document.
 */
async function claimDocument(
  supabase: SupabaseClient,
  documentId: string,
): Promise<"claimed" | "owned_by_other" | "done" | "missing"> {
  const { data: document } = await supabase
    .from("documents")
    .select("status, updated_at")
    .eq("id", documentId)
    .maybeSingle();
  if (!document) return "missing";
  if (TERMINAL_STATUSES.includes(document.status)) return "done";

  const claimable = ["queued", "failed_retryable"];
  const stuckSince = Date.now() - new Date(document.updated_at).getTime();
  if (document.status === "processing" && stuckSince > STALE_PROCESSING_MS) claimable.push("processing");

  const { data: claimed } = await supabase
    .from("documents")
    .update({ status: "processing" })
    .eq("id", documentId)
    .in("status", claimable)
    .select("id");

  return claimed && claimed.length > 0 ? "claimed" : "owned_by_other";
}

async function waitForOwner(supabase: SupabaseClient, documentId: string): Promise<boolean> {
  const deadline = Date.now() + WAIT_FOR_OWNER_MS;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    const { data } = await supabase.from("documents").select("status").eq("id", documentId).maybeSingle();
    if (!data) return true;
    if (TERMINAL_STATUSES.includes(data.status) || data.status === "failed_retryable") return true;
  }
  return false;
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
async function readCachedText(supabase: SupabaseClient, userId: string, documentId: string): Promise<string | null> {
  const { data } = await supabase.storage.from(TEMPORARY_DOCUMENTS_BUCKET).download(documentTextPath(userId, documentId));
  return data ? await data.text() : null;
}

async function ensureDocumentText(supabase: SupabaseClient, userId: string, documentId: string): Promise<string> {
  const { data: document } = await supabase
    .from("documents")
    .select("id, storage_path, mime_type, original_filename")
    .eq("id", documentId)
    .single();
  if (!document?.storage_path) return "";

  const cached = await readCachedText(supabase, userId, documentId);
  if (cached !== null) return cached;

  const textPath = documentTextPath(userId, documentId);
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

function buildExperiencesExtractionSystemPrompt(documentType: string): string {
  return [
    "Você é o motor de extração profissional do CareerTwin, etapa de experiências.",
    "Extraia apenas a identidade profissional e as experiências presentes no documento fornecido, com evidência e confiança de extração.",
    "Ignore competências, ferramentas, formação e certificações — isso é extraído em uma etapa separada.",
    "Nunca invente experiências, métricas ou resultados não presentes no material.",
    "Marque inferências como inferência/hipótese, nunca como fato confirmado.",
    `Tipo de documento: ${documentType}.`,
    // Measured directly against a real 13-experience profile: extracting
    // everything in one call took 64-70s even with a conciseness instruction
    // and numeric caps — over the 60s function ceiling. Splitting into this
    // and buildSkillsExtractionSystemPrompt, run concurrently, is what
    // actually closed the gap.
    "Seja direto e conciso em cada campo de texto (1-2 frases por item, nunca um parágrafo longo).",
    "Para cada experiência, extraia no máximo 3 responsabilidades e no máximo 2 resultados/evidências — escolha os mais relevantes e quantificáveis, nunca liste tudo que houver no documento.",
    "Retorne exclusivamente um JSON válido no formato do schema fornecido, sem texto adicional.",
  ].join(" ");
}

function buildSkillsExtractionSystemPrompt(documentType: string): string {
  return [
    "Você é o motor de extração profissional do CareerTwin, etapa de competências.",
    "Extraia apenas competências, ferramentas, formação, certificações e conflitos entre fontes presentes no documento fornecido, com evidência e confiança de extração.",
    "Ignore experiências e identidade profissional — isso é extraído em uma etapa separada.",
    "Nunca invente competências, ferramentas, formação ou certificações não presentes no material.",
    "Marque inferências como inferência/hipótese, nunca como fato confirmado.",
    `Tipo de documento: ${documentType}.`,
    "Seja direto e conciso em cada campo de texto (1-2 frases por item, nunca um parágrafo longo).",
    "Em education, para cada item de formação use exatamente os campos: institution (nome da instituição), course (nome do curso/programa), degreeType (ex.: \"Bacharelado\", \"Tecnólogo\", \"Pós-Graduação\", \"Curso de Extensão\"), startDate e endDate no formato \"AAAA-MM\" (ou null se desconhecido), status (\"completed\" | \"in_progress\" | \"incomplete\"), confirmationStatus e extractionConfidence.",
    "Em certifications, para cada certificação use exatamente os campos: name, issuer (ou null se não identificado — nunca invente um emissor), completionDate no formato \"AAAA-MM\" (ou null), confirmationStatus e extractionConfidence.",
    "Retorne exclusivamente um JSON válido no formato do schema fornecido, sem texto adicional.",
  ].join(" ");
}

/**
 * Reads and extracts one document. Assumes the caller already claimed it, and
 * always leaves the row in a terminal or retryable state so the claim is never
 * held past the end of this call.
 */
async function processDocument(supabase: SupabaseClient, userId: string, documentId: string): Promise<void> {
  const { data: document } = await supabase
    .from("documents")
    .select("id, document_type, storage_path, content_hash, mime_type, original_filename")
    .eq("id", documentId)
    .single();
  if (!document) return;

  const idempotencyKey = `doc-extraction-${document.content_hash}`;
  const { data: job } = await supabase
    .from("processing_jobs")
    .insert({
      user_id: userId,
      job_type: document.document_type === "resume" ? "resume_extraction" : "linkedin_extraction",
      resource_type: "documents",
      resource_id: documentId,
      status: "processing",
      idempotency_key: idempotencyKey,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .maybeSingle();
  // A duplicate idempotency_key just means this document was processed before
  // (a retry after failure). Job bookkeeping is for traceability, not a
  // dependency of extraction — proceed without a job row rather than fail.

  const content = await ensureDocumentText(supabase, userId, documentId);

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
    const documentType = document.document_type as "resume" | "linkedin";
    const userContent = delimitUntrustedDocument(documentType, content);
    // Two independent schema halves run concurrently rather than one combined
    // call — see profileExperiencesExtractionSchema's doc comment for the
    // direct measurement behind this. The round's wall-clock time becomes the
    // slower of the two, not their sum.
    const [experiencesResult, skillsResult] = await Promise.all([
      provider.complete({
        promptId,
        promptVersion: prompt.version,
        systemPrompt: buildExperiencesExtractionSystemPrompt(documentType),
        userContent,
        schema: profileExperiencesExtractionSchema,
        model: EXTRACTION_MODEL,
        maxOutputTokens: Math.min(24000, 6000 + content.length),
      }),
      provider.complete({
        promptId,
        promptVersion: prompt.version,
        systemPrompt: buildSkillsExtractionSystemPrompt(documentType),
        userContent,
        schema: profileSkillsExtractionSchema,
        model: EXTRACTION_MODEL,
        maxOutputTokens: Math.min(16000, 4000 + content.length),
      }),
    ]);

    const isInsufficient =
      experiencesResult.data.extractionStatus === "insufficient_content" ||
      skillsResult.data.extractionStatus === "insufficient_content";
    const isFailed = experiencesResult.data.extractionStatus === "failed" || skillsResult.data.extractionStatus === "failed";
    const extractionStatus = isInsufficient ? "insufficient_content" : isFailed ? "failed" : "complete";

    const merged: ProfileExtraction = {
      schemaVersion: experiencesResult.data.schemaVersion,
      documentType: experiencesResult.data.documentType,
      sourceId: experiencesResult.data.sourceId,
      language: experiencesResult.data.language,
      extractionStatus,
      professionalIdentity: experiencesResult.data.professionalIdentity,
      experiences: experiencesResult.data.experiences,
      competencies: skillsResult.data.competencies,
      tools: skillsResult.data.tools,
      education: skillsResult.data.education,
      certifications: skillsResult.data.certifications,
      conflicts: skillsResult.data.conflicts,
      warnings: [...experiencesResult.data.warnings, ...skillsResult.data.warnings],
    };
    // Defense in depth: the two halves are independently schema-valid, but
    // never persist the merge itself without validating it also conforms to
    // the shape every downstream reader (consolidateExtractedExperiences,
    // Core 1) expects.
    const validated = profileExtractionSchema.parse(merged);

    await supabase.from("document_extractions").insert({
      document_id: documentId,
      schema_version: validated.schemaVersion,
      prompt_version: prompt.version,
      model_version: experiencesResult.modelVersion,
      status: validated.extractionStatus,
      validated_payload: validated,
      warnings: validated.warnings,
      completed_at: new Date().toISOString(),
    });

    await supabase
      .from("documents")
      .update({ status: validated.extractionStatus === "failed" ? "failed_final" : "ready", processed_at: new Date().toISOString() })
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

/**
 * Advances one document by a single unit of work, then returns.
 *
 * Reading and extracting are deliberately never done in the same request:
 * together they run past 86s for a PDF that needs visual reading, and the
 * platform kills a function at 60s. Splitting them keeps each request to at
 * most one model call; the caller loops until `done`.
 *
 * Safe to call concurrently from the background prewarm and the completion
 * screen — the claim guarantees at most one of them does the work.
 */
export async function runDocumentStage(
  supabase: SupabaseClient,
  userId: string,
  stage: DocumentStage,
): Promise<StageResult> {
  const { data: document } = await supabase
    .from("documents")
    .select("id, status")
    .eq("user_id", userId)
    .eq("document_type", stage)
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!document) return { ok: true, done: true };

  const claim = await claimDocument(supabase, document.id);
  if (claim === "done" || claim === "missing") return { ok: true, done: true };

  if (claim === "owned_by_other") {
    // Another request (usually the background prewarm) is already on it.
    const settled = await waitForOwner(supabase, document.id);
    return { ok: true, done: settled };
  }

  if ((await readCachedText(supabase, userId, document.id)) === null) {
    try {
      await ensureDocumentText(supabase, userId, document.id);
    } catch (error) {
      await supabase.from("documents").update({ status: "failed_retryable" }).eq("id", document.id);
      throw error;
    }
    // Hand the claim back so the next call can pick up the extraction half.
    await supabase.from("documents").update({ status: "queued" }).eq("id", document.id);
    return { ok: true, done: false };
  }

  await processDocument(supabase, userId, document.id);
  return { ok: true, done: true };
}

/** RF-ONB-128..133 — confirmation creates the immutable Thin Twin version. No user action needed. */
async function confirmProfile(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data: profile } = await supabase.from("professional_profiles").select("id").eq("user_id", userId).single();
  if (!profile) return;

  const { data: draftVersion } = await supabase
    .from("profile_versions")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("status", "draft")
    .maybeSingle();
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
      confirmed_by_user_id: userId,
      confirmed_at: new Date().toISOString(),
      snapshot,
      snapshot_hash: snapshotHash,
    })
    .eq("id", draftVersion.id);

  await supabase
    .from("professional_profiles")
    .update({ status: "confirmed", current_version_id: draftVersion.id })
    .eq("id", profile.id);

  trackEvent(ANALYTICS_EVENTS.twinProfileConfirmed, { userId });
}

/**
 * Creates the draft Thin Twin version and consolidates both extracted
 * documents into it (a partial P-003: experiences/evidences only, no conflict
 * resolution/normalization yet).
 */
async function ensureProfileDraft(supabase: SupabaseClient, userId: string): Promise<void> {
  let { data: profile } = await supabase
    .from("professional_profiles")
    .select("id, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile) {
    const { data: created } = await supabase
      .from("professional_profiles")
      .insert({ user_id: userId, status: "draft" })
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

  await consolidateExtractedExperiences(supabase, userId, newVersion.id);
}

/**
 * Copies each successfully extracted document's experiences/results/
 * education/certifications into `experiences`/`evidences`/`education_records`/
 * `certifications` on the new draft version. Only the most recent ready
 * extraction per document type is used. `profile_skills`/`profile_tools`
 * are NOT populated here: they reference the shared `skills`/`tools` catalog
 * tables, which only allow curator/service-role writes — there is no
 * client-safe way to create a new skill/tool entry on demand in this
 * environment. `education_records`/`certifications` have no such
 * restriction (owner-scoped RLS, same as `experiences`), so they belong here.
 */
async function consolidateExtractedExperiences(
  supabase: SupabaseClient,
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
    const payload = doc.validated_payload as Pick<ProfileExtraction, "experiences" | "education" | "certifications"> | null;
    if (!payload) continue;

    for (const exp of payload.experiences ?? []) {
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

    if (payload.education?.length) {
      await supabase.from("education_records").insert(
        payload.education.map((edu) => ({
          profile_version_id: profileVersionId,
          institution: edu.institution,
          course: edu.course,
          degree_type: edu.degreeType,
          start_date: toSqlDate(edu.startDate),
          end_date: toSqlDate(edu.endDate),
          status: edu.status,
          confirmation_status: "extracted",
        })),
      );
    }

    if (payload.certifications?.length) {
      await supabase.from("certifications").insert(
        payload.certifications.map((cert) => ({
          profile_version_id: profileVersionId,
          name: cert.name,
          issuer: cert.issuer,
          issued_at: toSqlDate(cert.completionDate),
          confirmation_status: "extracted",
        })),
      );
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

export async function runProfileStage(supabase: SupabaseClient, userId: string): Promise<StageResult> {
  const { data: profile } = await supabase
    .from("professional_profiles")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  if (profile?.status !== "confirmed") {
    await ensureProfileDraft(supabase, userId);
    await confirmProfile(supabase, userId);
  }

  await supabase.from("user_accounts").update({ onboarding_status: "completed" }).eq("user_id", userId);
  trackEvent(ANALYTICS_EVENTS.onboardingCompleted, { userId });
  return { ok: true, done: true };
}

/**
 * Same consolidation as runProfileStage's first branch, but unconditional —
 * used by the "Reanalisar perfil" Sheet (src/features/core-1/report/reanalysis-sheet.tsx),
 * where the profile is already confirmed and creating + confirming a fresh
 * draft version from newly re-uploaded documents is exactly the point.
 * Never called from the initial onboarding pipeline, which already gates on
 * `status !== "confirmed"` inside runProfileStage itself — this is a
 * separate stage precisely so that gate is never touched.
 */
export async function runProfileReconsolidationStage(supabase: SupabaseClient, userId: string): Promise<StageResult> {
  await ensureProfileDraft(supabase, userId);
  await confirmProfile(supabase, userId);
  return { ok: true, done: true };
}

export async function runAnalysisStage(): Promise<StageResult> {
  const { runInitialProfileAnalysis } = await import("@/features/core-1/actions");
  const result = await runInitialProfileAnalysis();
  if (!result.ok) return { ok: false, done: false, analysisStatus: result.status };
  // Analysis is itself two model calls (dimensions, then recommendations),
  // each dispatched to a Supabase Edge Function and polled for rather than
  // run inline — see runProfileAnalysisStage's comment. `done: false` here
  // means "call this stage again", handled by the client's
  // runStageToCompletion loop like any other stage.
  if (!result.done) return { ok: true, done: false, analysisStatus: result.status };
  return {
    ok: true,
    done: true,
    analysisStatus: result.status,
    redirectTo: result.analysisId ? `/app/analise-perfil/${result.analysisId}` : "/app/analise-perfil",
  };
}
