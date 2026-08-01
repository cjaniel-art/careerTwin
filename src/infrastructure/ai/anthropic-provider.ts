import Anthropic from "@anthropic-ai/sdk";
import type { AiCompletionRequest, AiCompletionResult, AiProvider } from "@/application/ports/ai-provider";
import { requireEnv } from "@/lib/env";
import { completeWithSchemaRepair } from "./schema-repair";

const DEFAULT_MODEL = "claude-sonnet-5";

/**
 * Real AI adapter. Requires AI_PROVIDER_API_KEY (see .env.example and
 * docs/implementation/open-decisions.md #4) — constructing this without it
 * throws MissingEnvironmentConfigError immediately, rather than falling back
 * to a mock silently.
 */
export class AnthropicAiProvider implements AiProvider {
  readonly providerName = "anthropic";
  readonly modelVersion: string;
  private readonly client: Anthropic;

  constructor() {
    const apiKey = requireEnv("AI_PROVIDER_API_KEY");
    this.modelVersion = process.env.AI_PROVIDER_MODEL || DEFAULT_MODEL;
    this.client = new Anthropic({ apiKey });
  }

  async complete<T>(request: AiCompletionRequest<T>): Promise<AiCompletionResult<T>> {
    const { data, modelVersion, repairAttempts } = await completeWithSchemaRepair(
      request.promptId,
      async ({ systemPrompt, userContent, maxOutputTokens }) => {
        // `temperature` is deprecated/rejected by the Claude 5 family models used here — omitted rather than sent.
        const response = await this.client.messages.create({
          model: this.modelVersion,
          max_tokens: maxOutputTokens ?? 4096,
          system: systemPrompt,
          messages: [{ role: "user", content: userContent }],
        });
        const text = response.content
          .filter((block): block is Anthropic.TextBlock => block.type === "text")
          .map((block) => block.text)
          .join("\n");
        return { text, modelVersion: response.model };
      },
      {
        systemPrompt: request.systemPrompt,
        userContent: request.userContent,
        temperature: request.temperature,
        maxOutputTokens: request.maxOutputTokens,
      },
      request.schema,
    );

    return {
      data,
      modelVersion,
      promptVersion: request.promptVersion,
      schemaVersion: "n/a", // filled by the caller from the parsed payload when present
      repairAttempts,
    };
  }
}
