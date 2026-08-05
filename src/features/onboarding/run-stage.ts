export type ClientStage = "resume" | "linkedin" | "profile" | "analysis";

export interface StageResponse {
  ok: boolean;
  done: boolean;
  redirectTo?: string;
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
const MAX_ROUNDS = 10;

export async function runStageToCompletion(stage: ClientStage): Promise<StageResponse> {
  for (let round = 0; round < MAX_ROUNDS; round++) {
    const result = await postStage(stage);
    if (!result.ok || result.done) return result;
  }
  return { ok: false, done: false };
}
