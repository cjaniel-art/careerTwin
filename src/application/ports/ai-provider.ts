import type { ZodType } from "zod";

/**
 * AiProvider — the only way application code talks to a language model.
 * Never call a provider SDK directly from a use case or route; go through
 * this port so the provider is swappable and every call is uniformly
 * validated (Arquitetura §4.7: "provedor acessado somente pelo backend").
 */
export interface AiCompletionRequest<T> {
  promptId: string;
  promptVersion: string;
  /** Assembled per the instruction hierarchy in config/prompts/catalog.ts. */
  systemPrompt: string;
  /** User-turn content — already includes any delimited untrusted document text. */
  userContent: string;
  /** Output schema the raw model response is validated against before returning. */
  schema: ZodType<T>;
  /** Low temperature by default — this is extraction/classification, not creative writing. */
  temperature?: number;
  maxOutputTokens?: number;
  /**
   * Overrides the provider's default model for this call only. Use for
   * lower-reasoning, mechanical tasks (document extraction, opportunity
   * structuring) where a cheaper/faster model is adequate — leave unset for
   * the analytical engines (Core 1/Core 2) that need the default model's
   * judgment quality.
   */
  model?: string;
}

export interface AiCompletionResult<T> {
  data: T;
  modelVersion: string;
  promptVersion: string;
  schemaVersion: string;
  /** Number of repair attempts consumed (0 = valid on first try). */
  repairAttempts: number;
}

export class AiOutputValidationError extends Error {
  constructor(
    readonly promptId: string,
    readonly attempts: number,
    override readonly cause: unknown,
  ) {
    super(`AI output for ${promptId} failed schema validation after ${attempts} attempt(s).`);
    this.name = "AiOutputValidationError";
  }
}

export interface AiProvider {
  readonly providerName: string;
  readonly modelVersion: string;
  complete<T>(request: AiCompletionRequest<T>): Promise<AiCompletionResult<T>>;
}
