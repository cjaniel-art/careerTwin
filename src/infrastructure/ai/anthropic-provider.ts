import Anthropic from "@anthropic-ai/sdk";
import { zodToJsonSchema } from "zod-to-json-schema";
import type {
  AiCompletionRequest,
  AiCompletionResult,
  AiProvider,
  PdfToMarkdownRequest,
  PdfToMarkdownResult,
} from "@/application/ports/ai-provider";
import { requireEnv } from "@/lib/env";
import { completeWithSchemaRepair } from "./schema-repair";

const DEFAULT_MODEL = "claude-sonnet-5";
const EXTRACTION_TOOL_NAME = "emit_structured_output";

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
    // Forces the exact output shape via tool-use instead of only describing it in
    // prose — the model previously had no machine-readable schema at all and
    // reliably returned JSON missing most required fields.
    const inputSchema = zodToJsonSchema(request.schema) as Anthropic.Tool.InputSchema;

    const { data, modelVersion, repairAttempts } = await completeWithSchemaRepair(
      request.promptId,
      async ({ systemPrompt, userContent, repairNote, maxOutputTokens }) => {
        // `temperature` is deprecated/rejected by the Claude 5 family models used here — omitted rather than sent.
        //
        // `cache_control` marks prompt-caching breakpoints (tool schema, system prompt,
        // and the (large, per-analysis-stable) userContent) — schema-repair retries
        // resend all three unchanged except for a small trailing repairNote block, so
        // this turns 2-3 near-duplicate full-price calls per analysis into 1 full-price
        // call + cheap cache reads. Cast at the call site: this SDK's stable (non-beta)
        // types predate cache_control, but the field is a long-GA, additive Messages API
        // param the runtime API accepts regardless of what these types declare.
        const params = {
          model: request.model ?? this.modelVersion,
          max_tokens: maxOutputTokens ?? 4096,
          system: [{ type: "text" as const, text: systemPrompt, cache_control: { type: "ephemeral" as const } }],
          messages: [
            {
              role: "user" as const,
              content: [
                { type: "text" as const, text: userContent, cache_control: { type: "ephemeral" as const } },
                ...(repairNote ? [{ type: "text" as const, text: repairNote }] : []),
              ],
            },
          ],
          tools: [
            {
              name: EXTRACTION_TOOL_NAME,
              description: "Emit the structured result. Must match the input schema exactly — every required field present.",
              input_schema: inputSchema,
              cache_control: { type: "ephemeral" as const },
            },
          ],
          tool_choice: { type: "tool", name: EXTRACTION_TOOL_NAME },
        };
        const response = await this.client.messages.create(params as unknown as Anthropic.MessageCreateParamsNonStreaming);
        const toolUse = response.content.find((block): block is Anthropic.ToolUseBlock => block.type === "tool_use");
        const text = toolUse ? JSON.stringify(toolUse.input) : "";
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

  /**
   * Sends the PDF itself, not parsed bytes: the API renders each page and
   * reads it visually as well as textually, which is what makes flattened /
   * scanned PDFs readable at all. No schema and no repair loop here — the
   * output is prose, so there is nothing to validate structurally; a bad
   * result surfaces downstream as insufficient content.
   */
  async convertPdfToMarkdown(request: PdfToMarkdownRequest): Promise<PdfToMarkdownResult> {
    // Same cast rationale as `cache_control` above: this SDK's stable types
    // predate the `document` content block, which the runtime API accepts.
    const params = {
      model: request.model ?? this.modelVersion,
      max_tokens: request.maxOutputTokens ?? 16000,
      system: [{ type: "text" as const, text: request.systemPrompt }],
      messages: [
        {
          role: "user" as const,
          content: [
            {
              type: "document" as const,
              source: {
                type: "base64" as const,
                media_type: "application/pdf" as const,
                data: request.pdf.toString("base64"),
              },
            },
            { type: "text" as const, text: request.instruction },
          ],
        },
      ],
    };
    const response = await this.client.messages.create(params as unknown as Anthropic.MessageCreateParamsNonStreaming);

    const markdown = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    return { markdown, modelVersion: response.model };
  }
}
