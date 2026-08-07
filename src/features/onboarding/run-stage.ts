export type ClientStage = "resume" | "linkedin" | "profile" | "analysis";

export interface StageResponse {
  ok: boolean;
  done: boolean;
  redirectTo?: string;
  /** "analysis" stage only — which half of Core 1 is in flight, for accurate UI progress. */
  analysisStatus?: "processing" | "preliminary" | "completed" | "failed_retryable";
}

/**
 * `keepalive` matters here: the background prewarm fires during onboarding and
 * the user navigates to the next step immediately after, which would otherwise
 * cancel the in-flight request and abandon the extraction.
 */
export async function postStage(stage: ClientStage): Promise<StageResponse> {
  const response = await fetch("/api/onboarding/process", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ stage }),
    keepalive: true,
  });
  if (!response.ok) return { ok: false, done: false };
  return (await response.json()) as StageResponse;
}

/**
 * Repeats a stage until it reports completion. A stage returns `done: false`
 * when it spent its budget waiting on another request's in-flight work — the
 * next call picks up a fresh 60s window rather than dying at the platform limit.
 *
 * Each of those rounds costs the server-side wait (tens of seconds), so this
 * cannot spin hot; the cap is a backstop against a stage that never settles,
 * which would otherwise loop forever behind a screen that looks like progress.
 */
export const MAX_STAGE_ROUNDS = 10;

/**
 * The "analysis" stage no longer runs its AI call inside the round itself —
 * it dispatches the core1-analysis Supabase Edge Function and returns almost
 * immediately, then relies on later rounds to see the DB flip to done. Without
 * a real gap between rounds, MAX_STAGE_ROUNDS would burn through in well
 * under a second. pollIntervalMs adds that gap; the higher round count covers
 * two sequential edge-function stages (dimensions, then recommendations),
 * each with its own ~150s wall-clock ceiling.
 */
export const ANALYSIS_STAGE_POLL_OPTIONS = { maxRounds: 110, pollIntervalMs: 3000 };

export async function runStageToCompletion(
  stage: ClientStage,
  onRound?: (result: StageResponse) => void,
  options?: { maxRounds?: number; pollIntervalMs?: number },
): Promise<StageResponse> {
  const maxRounds = options?.maxRounds ?? MAX_STAGE_ROUNDS;
  const pollIntervalMs = options?.pollIntervalMs ?? 0;
  for (let round = 0; round < maxRounds; round++) {
    const result = await postStage(stage);
    onRound?.(result);
    if (!result.ok || result.done) return result;
    if (pollIntervalMs > 0) await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
  return { ok: false, done: false };
}
