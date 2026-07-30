import type { ZodType } from "zod";
import { AiOutputValidationError } from "@/application/ports/ai-provider";

/**
 * 3-stage retry strategy — Prompts e Schemas §12, verbatim:
 * 1st failure: resend only the structural error, ask for a corrected JSON
 *              without changing valid content.
 * 2nd failure: repair prompt with reduced context, explicit schema, and the
 *              list of invalid fields.
 * 3rd failure: stop and surface a recoverable failure — never accept a
 *              partially-corrupted JSON, never fabricate missing fields.
 */
export interface RawCompletionFn {
  (args: { systemPrompt: string; userContent: string; temperature?: number; maxOutputTokens?: number }): Promise<{
    text: string;
    modelVersion: string;
  }>;
}

function tryParseJson(text: string): unknown {
  // Models sometimes wrap JSON in a markdown fence despite instructions not to.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1] : text;
  return JSON.parse(candidate!);
}

export async function completeWithSchemaRepair<T>(
  promptId: string,
  generate: RawCompletionFn,
  args: { systemPrompt: string; userContent: string; temperature?: number; maxOutputTokens?: number },
  schema: ZodType<T>,
): Promise<{ data: T; modelVersion: string; repairAttempts: number }> {
  let lastError: unknown;
  let modelVersion = "unknown";

  for (let attempt = 0; attempt < 3; attempt++) {
    const repairNote =
      attempt === 0
        ? ""
        : attempt === 1
          ? `\n\nThe previous response failed schema validation: ${describeError(lastError)}. Return corrected JSON only, without changing any field that was already valid.`
          : `\n\nSTRICT REPAIR MODE. The previous response still failed validation: ${describeError(lastError)}. Return ONLY the JSON object matching the schema exactly — no prose, no markdown fence, no extra fields.`;

    const result = await generate({
      ...args,
      systemPrompt: args.systemPrompt + repairNote,
    });
    modelVersion = result.modelVersion;

    try {
      const parsed = tryParseJson(result.text);
      const validated = schema.parse(parsed);
      return { data: validated, modelVersion, repairAttempts: attempt };
    } catch (error) {
      lastError = error;
    }
  }

  throw new AiOutputValidationError(promptId, 3, lastError);
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 500);
  return "invalid output";
}
