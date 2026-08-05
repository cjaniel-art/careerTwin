import type { AiProvider } from "@/application/ports/ai-provider";
import { env, isProduction, MissingEnvironmentConfigError } from "@/lib/env";
import { AnthropicAiProvider } from "./anthropic-provider";
import { SyntheticAiProvider } from "./synthetic-provider";

let cached: AiProvider | undefined;

/**
 * Faster/cheaper model — pass as `model` on AiCompletionRequest. Used for
 * mechanical extraction (P-001/P-002 résumé/LinkedIn, P-007 opportunity
 * structuring, P-013 PDF vision) and for Core 1's two analysis calls
 * (P-005 dimensions + P-005-recommendations).
 *
 * The Core 1 calls were suspected, at first, of needing Sonnet 5's judgment
 * quality and of being slow specifically because of that — but measuring
 * directly showed the real production timeouts (FUNCTION_INVOCATION_TIMEOUT,
 * Vercel's 60s ceiling) came from something else: an under-sized
 * maxOutputTokens truncated the response for a realistic profile, which
 * fails schema validation, which triggers up to 3 sequential schema-repair
 * attempts inside one call — each re-paying the full generation cost. That's
 * fixed at the source now (see the maxOutputTokens/system-prompt comments at
 * the Core 1 call sites: a higher ceiling plus an explicit
 * conciseness instruction). Haiku stays there anyway because, once
 * measured, it produced fine output for this structured-classification task
 * at meaningfully lower cost — not as a quality-for-reliability trade.
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
