import type { AiProvider } from "@/application/ports/ai-provider";
import { env, isProduction, MissingEnvironmentConfigError } from "@/lib/env";
import { AnthropicAiProvider } from "./anthropic-provider";
import { SyntheticAiProvider } from "./synthetic-provider";

let cached: AiProvider | undefined;

/**
 * Cheaper/faster model for mechanical extraction and structuring calls
 * (P-001/P-002 resume/LinkedIn extraction, P-007 opportunity structuring) —
 * pass as `model` on AiCompletionRequest. The analytical engines (Core 1/
 * Core 2, P-005/P-009) deliberately keep the provider's default model.
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
