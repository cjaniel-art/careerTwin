"use server";

import { createHash, randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import {
  ENGINE_VERSION,
  IPP_RUBRIC_VERSION,
  CORE_1_CONFIG_VERSION,
} from "@/config/engine/versions";
import { isAccountDeletionPending } from "@/lib/account-status";
import { trackEvent } from "@/infrastructure/analytics";
import { ANALYTICS_EVENTS } from "@/infrastructure/analytics/events";
import { requireEnv } from "@/lib/env";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/analise-perfil");
  return { supabase, user };
}

export interface Core1Preconditions {
  ok: boolean;
  missing: string[];
  profileVersionId?: string;
  profileVersionNumber?: number;
  targetContextVersionId?: string;
  targetContextVersionNumber?: number;
}

/** PRD 02 §7 — re-checked server-side on every entry, never trusted from the client. */
export async function checkCore1Preconditions(): Promise<Core1Preconditions> {
  const { supabase, user } = await requireUser();
  const missing: string[] = [];

  if (await isAccountDeletionPending(supabase, user.id)) {
    missing.push("conta em processo de exclusão");
    return { ok: false, missing };
  }

  const { data: profile, error: profileError } = await supabase
    .from("professional_profiles")
    .select("id, status, current_version_id, profile_versions!professional_profiles_current_version_fk(id, version_number, status)")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError) console.error("checkCore1Preconditions: professional_profiles query failed:", profileError.message);

  if (!profile || profile.status !== "confirmed" || !profile.current_version_id) {
    missing.push("Thin Twin confirmado");
  }

  const { data: targetContext, error: targetContextError } = await supabase
    .from("target_contexts")
    .select(
      "id, status, current_version_id, target_context_versions!target_contexts_current_version_fk(id, version_number, confirmation_status)",
    )
    .eq("user_id", user.id)
    .maybeSingle();
  if (targetContextError) console.error("checkCore1Preconditions: target_contexts query failed:", targetContextError.message);

  if (!targetContext || targetContext.status !== "confirmed" || !targetContext.current_version_id) {
    missing.push("contexto-alvo confirmado");
  }

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  const profileVersion = Array.isArray(profile!.profile_versions)
    ? profile!.profile_versions[0]
    : profile!.profile_versions;
  const targetContextVersion = Array.isArray(targetContext!.target_context_versions)
    ? targetContext!.target_context_versions[0]
    : targetContext!.target_context_versions;

  return {
    ok: true,
    missing: [],
    profileVersionId: profile!.current_version_id!,
    profileVersionNumber: profileVersion?.version_number,
    targetContextVersionId: targetContext!.current_version_id!,
    targetContextVersionNumber: targetContextVersion?.version_number,
  };
}

/**
 * Starts (or reuses) a profile analysis. Freezes the Thin Twin and
 * target-context versions, runs the pipeline synchronously (see Fase 3/4
 * notes on the lack of a real queue/worker in this environment), persists
 * the backend-computed IPP/confidence/priority, and redirects to the result.
 */
type EnsuredAnalysisRow =
  | { ok: true; analysisId: string; alreadyCompleted: boolean }
  | { ok: false; reason: "preconditions" | "db_error" };

/** Shared by startProfileAnalysisAction and runInitialProfileAnalysis — creates/reuses the analyses row without deciding what happens next. */
async function ensureProfileAnalysisRow(): Promise<EnsuredAnalysisRow> {
  const { supabase, user } = await requireUser();
  const preconditions = await checkCore1Preconditions();
  if (!preconditions.ok) return { ok: false, reason: "preconditions" };

  const idempotencyKey = [
    "profile_analysis",
    preconditions.profileVersionId,
    preconditions.targetContextVersionId,
    ENGINE_VERSION,
    IPP_RUBRIC_VERSION,
    CORE_1_CONFIG_VERSION,
  ].join(":");

  const { data: existing } = await supabase
    .from("analyses")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existing?.status === "completed") {
    return { ok: true, analysisId: existing.id, alreadyCompleted: true };
  }

  const analysisId = existing?.id ?? randomUUID();
  // A prior failure must be retryable — otherwise the processing page never
  // calls runProfileAnalysis again (it only runs while status === "processing")
  // and the user is stuck re-reading the same failure forever.
  const isRetry = existing?.status === "failed_retryable";

  if (!existing || isRetry) {
    if (isRetry) {
      // Also clears stage_dispatched_at — otherwise a retry right after a
      // failed dispatch would look "recently dispatched" and runProfileAnalysisStage
      // would wait out the stale window before actually redispatching.
      const { error: updateError } = await supabase
        .from("analyses")
        .update({ status: "processing", started_at: new Date().toISOString(), completed_at: null, stage_dispatched_at: null })
        .eq("id", analysisId);
      if (updateError) return { ok: false, reason: "db_error" };
    } else {
      const { error: insertError } = await supabase.from("analyses").insert({
        id: analysisId,
        user_id: user.id,
        analysis_type: "profile_analysis",
        profile_version_id: preconditions.profileVersionId,
        target_context_version_id: preconditions.targetContextVersionId,
        status: "processing",
        idempotency_key: idempotencyKey,
        input_hash: createHash("sha256").update(idempotencyKey).digest("hex"),
        rubric_version: IPP_RUBRIC_VERSION,
        engine_version: ENGINE_VERSION,
        configuration_version: CORE_1_CONFIG_VERSION,
        started_at: new Date().toISOString(),
      });
      if (insertError) return { ok: false, reason: "db_error" };
    }
    trackEvent(ANALYTICS_EVENTS.profileAnalysisStarted, { userId: user.id, analysisId, analysisType: "profile_analysis" });
  }

  return { ok: true, analysisId, alreadyCompleted: false };
}

export async function startProfileAnalysisAction(): Promise<void> {
  const row = await ensureProfileAnalysisRow();
  if (!row.ok) {
    redirect(row.reason === "preconditions" ? "/app/analise-perfil?insuficiente=1" : "/app/analise-perfil?erro=1");
  }
  if (row.alreadyCompleted) {
    redirect(`/app/analise-perfil/${row.analysisId}`);
  }
  redirect(`/app/analise-perfil/processando/${row.analysisId}`);
}

export interface ProfileAnalysisStageResult {
  ok: boolean;
  /** False means "call me again" — this stage finished its own request but the pipeline isn't done. */
  done: boolean;
  /**
   * The analysis row's status as of this call. Most rounds now just poll a
   * dispatched Edge Function rather than doing work themselves (see
   * runProfileAnalysisStage's comment), so callers can no longer infer
   * "dimensions just finished" from "this round returned done: false" the way
   * they could when each round was itself a synchronous stage — they need the
   * real status to know which half of the analysis is actually in flight.
   */
  status?: "processing" | "preliminary" | "completed" | "failed_retryable";
}

const STAGE_DISPATCH_STALE_MS = 160_000; // Edge Function wall-clock ceiling (150s on this project's free plan) + margin

/**
 * Runs exactly one stage of the Core 1 pipeline for an analysis already in
 * `processing` (dimensions) or `preliminary` (recommendations) — except it
 * doesn't actually run the AI call itself anymore. It used to, but the
 * combined-call version routinely exceeded Vercel's 60s function ceiling in
 * production, and splitting it into two calls (dimensions, then
 * recommendations) still wasn't reliably enough margin for a large real
 * profile once Vercel→Anthropic network latency was in the mix (measured:
 * isolated dev-machine calls stayed comfortably under 60s; the same calls in
 * production didn't). The AI call now runs in the core1-analysis Supabase
 * Edge Function instead (150s wall-clock ceiling on this project vs. Vercel's
 * 60s) — this function's only job is to dispatch it and report whether the
 * DB shows the stage done yet. `stage_dispatched_at` is the compare-and-set
 * claim that stops a poll round from re-dispatching a stage that's already
 * running (mirrors documents.status's claim in onboarding/pipeline.ts).
 */
export async function runProfileAnalysisStage(analysisId: string): Promise<ProfileAnalysisStageResult> {
  const { supabase, user } = await requireUser();

  const { data: analysis } = await supabase
    .from("analyses")
    .select("id, status, stage_dispatched_at")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .single();
  if (!analysis) return { ok: false, done: false };
  if (analysis.status === "completed") return { ok: true, done: true, status: "completed" };
  if (analysis.status !== "processing" && analysis.status !== "preliminary") {
    return { ok: false, done: false, status: analysis.status as ProfileAnalysisStageResult["status"] };
  }

  const dispatchedAt = analysis.stage_dispatched_at ? new Date(analysis.stage_dispatched_at).getTime() : 0;
  const recentlyDispatched = Date.now() - dispatchedAt < STAGE_DISPATCH_STALE_MS;

  if (!recentlyDispatched) {
    const staleThresholdIso = new Date(Date.now() - STAGE_DISPATCH_STALE_MS).toISOString();
    const { data: claimed } = await supabase
      .from("analyses")
      .update({ stage_dispatched_at: new Date().toISOString() })
      .eq("id", analysisId)
      .eq("status", analysis.status)
      .or(`stage_dispatched_at.is.null,stage_dispatched_at.lt.${staleThresholdIso}`)
      .select("id");

    if (claimed && claimed.length > 0) {
      await dispatchCore1AnalysisEdgeFunction(analysisId).catch((err) => {
        console.error("dispatchCore1AnalysisEdgeFunction failed:", err instanceof Error ? err.message : err);
      });
    }
  }

  return { ok: true, done: false, status: analysis.status };
}

async function dispatchCore1AnalysisEdgeFunction(analysisId: string): Promise<void> {
  const url = `${requireEnv("NEXT_PUBLIC_SUPABASE_URL")}/functions/v1/core1-analysis`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-dispatch-secret": requireEnv("EDGE_FUNCTION_DISPATCH_SECRET") },
      body: JSON.stringify({ analysisId }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`core1-analysis dispatch failed: ${response.status}`);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Creates the analysis row and runs exactly one stage of it — called from
 * the onboarding pipeline's client-side loop (features/onboarding/pipeline.ts),
 * which calls this again while `done` is false, one request per stage. Not a
 * loop-to-completion itself: doing both stages here would reintroduce the
 * same timeout risk runProfileAnalysisStage's split exists to avoid.
 */
export async function runInitialProfileAnalysis(): Promise<{
  ok: boolean;
  done: boolean;
  analysisId?: string;
  status?: ProfileAnalysisStageResult["status"];
}> {
  const row = await ensureProfileAnalysisRow();
  if (!row.ok) return { ok: false, done: false };
  if (row.alreadyCompleted) return { ok: true, done: true, analysisId: row.analysisId, status: "completed" };
  const result = await runProfileAnalysisStage(row.analysisId);
  return { ok: result.ok, done: result.done, analysisId: row.analysisId, status: result.status };
}
