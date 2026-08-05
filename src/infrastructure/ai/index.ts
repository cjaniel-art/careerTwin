import type { AiProvider } from "@/application/ports/ai-provider";
import { env, isProduction, MissingEnvironmentConfigError } from "@/lib/env";
import { AnthropicAiProvider } from "./anthropic-provider";
import { SyntheticAiProvider } from "./synthetic-provider";

let cached: AiProvider | undefined;

/**
 * Cheaper/faster model for mechanical extraction and structuring calls
 * (P-001/P-002 résumé/LinkedIn extraction, P-007 opportunity structuring,
 * P-013 PDF vision) — pass as `model` on AiCompletionRequest. The analytical
 * engines (Core 1/Core 2, P-005/P-009) deliberately keep the provider's
 * default model.
 *
 * Not just cost/speed: a single onboarding session fires up to 4 model calls
 * in quick succession (résumé, LinkedIn, then Core 1's two analysis stages).
 * Measured directly — an isolated Core 1 stage call takes ~33s on Sonnet 5,
 * comfortably inside the 60s function ceiling, but when all 4 calls in a
 * session ran on Sonnet 5 back-to-back, the same call took ~85s, over the
 * ceiling. Keeping extraction on Haiku halves the concurrent Sonnet-5 load
 * per session and keeps the analysis calls that actually need Sonnet's
 * quality within budget.
 */
export const EXTRACTION_MODEL = "claude-haiku-4-5-20251001";

/**
 * Selects the AI adapter. Production must never silently fall back to the
 * synthetic adapter — a missing key is a hard startup failure there. Non-
 * production environments without a key fall back to the synthetic adapter
 * so the app remains runnable/testable (docs/implementation/open-decisions.md #4).
 */
export function getAiProvider(): AiProvider {
  if (cached) return cached;

  if (env.AI_PROVIDER_API_KEY) {
    cached = new AnthropicAiProvider();
    return cached;
  }

  if (isProduction) {
    throw new MissingEnvironmentConfigError("AI_PROVIDER_API_KEY");
  }

  cached = new SyntheticAiProvider();
  return cached;
}

export type { AiProvider } from "@/application/ports/ai-provider";
