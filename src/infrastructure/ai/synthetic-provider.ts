import type { AiCompletionRequest, AiCompletionResult, AiProvider } from "@/application/ports/ai-provider";

/**
 * Development/test adapter. Never calls a real model — produces a
 * deterministic, schema-valid payload from lightweight heuristics over the
 * (synthetic, locally-authored) input text. Exists so the onboarding/Core 1/
 * Core 2 pipelines can be exercised end-to-end without an AI_PROVIDER_API_KEY
 * or any external cost, per the prompt mestre: "implemente adapters de
 * desenvolvimento/teste com dados exclusivamente sintéticos [...] mantenha
 * mocks fora do caminho de produção."
 *
 * This adapter must never be selected when NODE_ENV=production — see
 * src/infrastructure/ai/index.ts.
 */
export class SyntheticAiProvider implements AiProvider {
  readonly providerName = "synthetic-dev";
  readonly modelVersion = "synthetic-dev/1.0";

  async complete<T>(request: AiCompletionRequest<T>): Promise<AiCompletionResult<T>> {
    const builder = SYNTHETIC_BUILDERS[request.promptId];
    if (!builder) {
      throw new Error(
        `SyntheticAiProvider has no fixture for prompt "${request.promptId}". ` +
          `Add one in src/infrastructure/ai/synthetic-provider.ts or configure AI_PROVIDER_API_KEY.`,
      );
    }
    const raw = builder(request.userContent);
    const data = request.schema.parse(raw);

    return {
      data,
      modelVersion: this.modelVersion,
      promptVersion: request.promptVersion,
      schemaVersion: typeof raw === "object" && raw && "schemaVersion" in raw ? String((raw as Record<string, unknown>).schemaVersion) : "n/a",
      repairAttempts: 0,
    };
  }
}

/**
 * Extremely simple heuristics — count words, guess a couple of fields from
 * naive keyword search. This is intentionally not a good extractor; it only
 * needs to be schema-valid and stable so downstream code can be tested.
 */
function synthesizeProfileExtraction(content: string, documentType: "resume" | "linkedin") {
  const usefulChars = content.trim().length;
  const insufficientContent = usefulChars < 300;

  return {
    schemaVersion: "profile-extraction/1.1",
    documentType,
    sourceId: "synthetic-source",
    language: "pt-BR",
    extractionStatus: insufficientContent ? "insufficient_content" : "complete",
    professionalIdentity: {
      currentArea: "Não determinado (extração sintética)",
      currentRole: "Não determinado (extração sintética)",
      observedSeniority: { value: "mid", status: "hypothesis", extractionConfidence: 0.3 },
    },
    experiences: [],
    competencies: [],
    tools: [],
    education: [],
    certifications: [],
    conflicts: [],
    warnings: insufficientContent
      ? ["Conteúdo insuficiente para extração (adapter sintético de desenvolvimento)."]
      : ["Extração gerada pelo adapter sintético de desenvolvimento — não é uma extração real de IA."],
  };
}

const SYNTHETIC_BUILDERS: Record<string, (content: string) => unknown> = {
  "P-001": (content) => synthesizeProfileExtraction(content, "resume"),
  "P-002": (content) => synthesizeProfileExtraction(content, "linkedin"),
};
