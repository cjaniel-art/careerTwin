import type { AiProvider } from "@/application/ports/ai-provider";
import { env, isProduction, MissingEnvironmentConfigError } from "@/lib/env";
import { AnthropicAiProvider } from "./anthropic-provider";
import { SyntheticAiProvider } from "./synthetic-provider";

let cached: AiProvider | undefined;

/**
 * Faster model, used everywhere a Vercel Hobby function (60s ceiling) has
 * proven unreliable on the provider's default model (Sonnet 5) — pass as
 * `model` on AiCompletionRequest. Originally scoped to mechanical extraction
 * (P-001/P-002 résumé/LinkedIn, P-007 opportunity structuring, P-013 PDF
 * vision), where the choice is free: those calls don't need Sonnet's
 * reasoning quality.
 *
 * Core 1 (P-005 dimensions + P-005-recommendations) is different: that call
 * IS the analytical judgment users see. It stayed on Sonnet 5 through an
 * earlier fix that split it into two requests specifically to fit the 60s
 * ceiling, and still timed out twice in separate production sessions after
 * that split shipped — isolated, one stage measured ~33s on Sonnet 5, well
 * inside budget, but under real production conditions (network to Anthropic,
 * concurrent load) it repeatedly exceeded 60s anyway. Moved here to Haiku
 * as a reliability trade against analysis depth, not a cost/speed
 * preference — revisit if the platform's duration ceiling is ever raised
 * (Vercel Pro allows up to 800s).
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
