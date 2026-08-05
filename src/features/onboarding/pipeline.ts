import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { documentStoragePath, TEMPORARY_DOCUMENTS_BUCKET } from "@/infrastructure/storage/document-storage";
import { resolveDocumentText } from "@/infrastructure/storage/document-markdown";
import { getAiProvider, EXTRACTION_MODEL } from "@/infrastructure/ai";
import { profileExtractionSchema, type ProfileExtraction } from "@/config/schemas/profile-extraction";
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
export type PipelineStage = DocumentStage | "profile" | "analysis";

export interface StageResult {
  ok: boolean;
  /** False means "call me again" — the stage ran out of budget, not that it failed. */
  done: boolean;
  redirectTo?: string;
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
 * Copies each successfully extracted document's experiences/results into
 * `experiences`/`evidences` on the new draft version. Only the most recent
 * ready extraction per document type is used. `profile_skills`/`profile_tools`
 * are NOT populated here: they reference the shared `skills`/`tools` catalog
 * tables, which only allow curator/service-role writes — there is no
 * client-safe way to create a new skill/tool entry on demand in this
 * environment.
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

export async function runAnalysisStage(): Promise<StageResult> {
  const { runInitialProfileAnalysis } = await import("@/features/core-1/actions");
  const result = await runInitialProfileAnalysis();
  if (!result.ok) return { ok: false, done: false };
  return {
    ok: true,
    done: true,
    redirectTo: result.analysisId ? `/app/analise-perfil/${result.analysisId}` : "/app/analise-perfil",
  };
}
