import type {
  AiCompletionRequest,
  AiCompletionResult,
  AiProvider,
  PdfToMarkdownRequest,
  PdfToMarkdownResult,
} from "@/application/ports/ai-provider";

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

  /**
   * Returns placeholder Markdown long enough to clear the minimum-useful-content
   * threshold, so the pipeline stays exercisable without an API key. It carries
   * no information from the actual PDF — nothing here reads the bytes.
   */
  async convertPdfToMarkdown(request: PdfToMarkdownRequest): Promise<PdfToMarkdownResult> {
    return {
      markdown: [
        "# Documento convertido pelo adapter sintético de desenvolvimento",
        "",
        "Este conteúdo não foi lido do PDF enviado — o adapter sintético não interpreta arquivos.",
        `Prompt: ${request.promptId}. Tamanho do arquivo recebido: ${request.pdf.byteLength} bytes.`,
        "",
        "## Experiência profissional",
        "",
        "- Cargo sintético em empresa sintética (2022 — atual): responsabilidade sintética de desenvolvimento.",
        "- Cargo sintético anterior em outra empresa sintética (2019 — 2022): responsabilidade sintética de desenvolvimento.",
      ].join("\n"),
      modelVersion: this.modelVersion,
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
    experiences: insufficientContent
      ? []
      : [
          {
            experienceKey: "exp-1",
            company: "Empresa identificada no documento (adapter sintético)",
            role: "Cargo identificado no documento (adapter sintético)",
            startDate: "2022-01",
            endDate: null,
            responsibilities: ["Responsabilidade identificada no documento (adapter sintético)."],
            projects: [],
            tools: [],
            results: ["Resultado identificado no documento (adapter sintético)."],
            evidenceRefs: [],
            confirmationStatus: "extracted",
          },
        ],
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

/**
 * Core 1 (P-005) fixture. Never computes rubricLevel from anything but the
 * plain counts the caller provides (JSON in `content`) — it must NOT decide
 * the final IPP (that stays exclusively backend math in src/domain/scores/ipp.ts),
 * only produce plausible per-dimension classifications for the engine to score.
 */
function synthesizeCore1Output(content: string) {
  let counts = { experienceCount: 0, evidenceCount: 0, skillCount: 0, toolCount: 0 };
  try {
    counts = { ...counts, ...JSON.parse(content) };
  } catch {
    // keep zeros — insufficient data is a legitimate, expected outcome here
  }

  const levelFromCount = (count: number, thresholds: [number, number, number]): 0 | 1 | 2 | 3 | 4 => {
    if (count <= 0) return 0;
    if (count < thresholds[0]) return 1;
    if (count < thresholds[1]) return 2;
    if (count < thresholds[2]) return 3;
    return 4;
  };

  const dimension = (
    dim: string,
    rubricLevel: 0 | 1 | 2 | 3 | 4,
    reasoning: string,
  ) => ({ dimension: dim, rubricLevel, reasoning, evidenceRefs: [], relatedRecommendationKeys: [] });

  return {
    analysisType: "profile_analysis",
    profileVersionId: "synthetic",
    targetContextVersionId: "synthetic",
    promptVersion: "1.0.0",
    schemaVersion: "core-1/1.1",
    rubricVersion: "synthetic",
    confidenceAssessment: {
      reasons: ["Avaliação gerada pelo adapter sintético de desenvolvimento."],
      missingInformation: counts.experienceCount === 0 ? ["Nenhuma experiência confirmada no perfil."] : [],
      conflicts: [],
    },
    dimensionAssessments: [
      dimension(
        "objective_clarity",
        3,
        "Contexto-alvo confirmado com área, cargo e senioridade definidos (avaliação sintética).",
      ),
      dimension(
        "experience_quality",
        levelFromCount(counts.experienceCount, [1, 2, 4]),
        `Perfil confirmado possui ${counts.experienceCount} experiência(s) estruturada(s) (avaliação sintética).`,
      ),
      dimension(
        "evidence_and_results",
        levelFromCount(counts.evidenceCount, [1, 2, 4]),
        `Perfil confirmado possui ${counts.evidenceCount} evidência(s) associada(s) (avaliação sintética).`,
      ),
      dimension(
        "skills_and_tools",
        levelFromCount(counts.skillCount + counts.toolCount, [2, 5, 10]),
        `Perfil confirmado possui ${counts.skillCount} competência(s) e ${counts.toolCount} ferramenta(s) (avaliação sintética).`,
      ),
      dimension("cross_source_consistency", 3, "Nenhum conflito crítico pendente no perfil confirmado (avaliação sintética)."),
      dimension(
        "positioning_quality",
        levelFromCount(counts.experienceCount, [1, 2, 4]),
        "Posicionamento estimado a partir da quantidade de experiências estruturadas (avaliação sintética).",
      ),
      dimension(
        "profile_completeness",
        levelFromCount(counts.experienceCount + counts.skillCount + counts.toolCount + counts.evidenceCount, [2, 5, 10]),
        "Completude estimada pela soma de itens estruturados no perfil confirmado (avaliação sintética).",
      ),
    ],
    diagnosis: {
      summary: "Diagnóstico gerado pelo adapter sintético de desenvolvimento — não é uma análise real de IA.",
      mainStrength:
        counts.experienceCount > 0
          ? "Experiência profissional estruturada e confirmada."
          : "Contexto-alvo definido com clareza.",
      mainGap:
        counts.evidenceCount === 0
          ? "Faltam evidências concretas associadas às experiências confirmadas."
          : "Poucas competências e ferramentas confirmadas.",
      nextBestAction: "Complementar o perfil com mais evidências e competências antes de avançar para o Core 2.",
    },
    strengths:
      counts.experienceCount > 0
        ? [{ title: "Experiência confirmada", description: "Ao menos uma experiência foi confirmada no perfil.", evidenceRefs: [] }]
        : [],
    gaps: [
      {
        type: "evidencia" as const,
        description: "Poucas evidências concretas (resultados, entregas, projetos) confirmadas no perfil.",
        evidenceRefs: [],
        missingInformation: ["Resultados ou entregas específicas por experiência."],
      },
    ],
    recommendations: [
      {
        recommendationKey: "add-evidence-1",
        category: "evidencia" as const,
        title: "Adicione evidências às suas experiências",
        problem: "Suas experiências confirmadas têm poucas evidências concretas associadas.",
        reasoning: "Evidências concretas aumentam a confiança e a especificidade do diagnóstico.",
        evidenceRefs: [],
        missingEvidence: ["Resultados quantitativos ou qualitativos por experiência"],
        suggestedAction: "Descreva um resultado, entrega ou projeto concreto para cada experiência confirmada.",
        expectedOutcome: "Diagnóstico mais específico e recomendações mais precisas nas próximas análises.",
        impact: 4,
        effort: 2,
        urgency: 3,
        confidence: 4,
        completionCriteria: "Ao menos uma evidência concreta adicionada a cada experiência confirmada.",
      },
    ],
    experienceTranslations: [],
    actionCandidates: [],
    authenticityValidation: { warnings: [], blockedClaims: [] },
    warnings: ["Análise gerada pelo adapter sintético de desenvolvimento — não é uma análise real de IA."],
  };
}

/**
 * Core 2 structuring fixture (P-007/P-008 combined). Derives a small,
 * deterministic set of requirements from simple keyword presence — never
 * invents a "blocking" requirement without an explicit textual cue, matching
 * PRD 03 §11 ("blocking exige evidência textual explícita").
 */
function synthesizeOpportunityStructure(content: string) {
  const lower = content.toLowerCase();
  const insufficientContent = content.trim().length < 300;
  const excerpt = (needle: string) => content.slice(Math.max(0, lower.indexOf(needle) - 20), Math.max(0, lower.indexOf(needle)) + 80) || content.slice(0, 100);

  const requirements: unknown[] = insufficientContent
    ? []
    : [
        {
          requirementId: "req-experience-1",
          description: "Experiência prévia relevante para a vaga.",
          category: "experience",
          criticality: "mandatory",
          isCritical: true,
          applicability: "applicable",
          extractionConfidence: 0.75,
          sourceExcerpt: excerpt("experi"),
          ambiguous: false,
          userConfirmed: false,
        },
        {
          requirementId: "req-skill-1",
          description: "Conhecimento das ferramentas e tecnologias mencionadas na vaga.",
          category: "skill",
          criticality: "desired",
          isCritical: false,
          applicability: "applicable",
          extractionConfidence: 0.6,
          sourceExcerpt: excerpt("conhec"),
          ambiguous: true,
          userConfirmed: false,
        },
      ];

  if (lower.includes("presencial") || lower.includes("obrigatóri")) {
    requirements.push({
      requirementId: "req-location-1",
      description: "Disponibilidade para o modelo de trabalho exigido pela vaga.",
      category: "location",
      criticality: "blocking",
      isCritical: true,
      applicability: "applicable",
      extractionConfidence: 0.8,
      sourceExcerpt: excerpt("presencial") || excerpt("obrigatóri"),
      ambiguous: false,
      userConfirmed: false,
    });
  }

  return {
    schemaVersion: "opportunity-structure/1.1",
    opportunityType: "job",
    opportunityVersionId: "synthetic",
    title: "",
    company: "",
    sourceType: "pasted_text",
    requirements,
    responsibilities: [],
    senioritySignals: [],
    ambiguities: insufficientContent ? ["Conteúdo insuficiente para estruturar a vaga."] : [],
    warnings: ["Estruturação gerada pelo adapter sintético de desenvolvimento — não é uma extração real de IA."],
  };
}

/**
 * Core 2 diagnosis fixture (P-009). Never assigns matchFactor/weight/IAO —
 * only a matchStatus per requirement, exactly like the real schema demands.
 */
function synthesizeCore2Output(content: string) {
  let input = { experienceCount: 0, evidenceCount: 0, requirementIds: [] as string[], hasBlocking: false };
  try {
    input = { ...input, ...JSON.parse(content) };
  } catch {
    // insufficient/absent structured input -> everything below stays "unknown"
  }

  const hasProfile = input.experienceCount > 0;
  const requirementAssessments = input.requirementIds.map((id, index) => {
    if (id.startsWith("req-location") || id.includes("blocking")) {
      return {
        requirementId: id,
        matchStatus: "unknown" as const,
        reasoning: "Nenhuma informação específica de localização foi fornecida para esta oportunidade (avaliação sintética).",
        profileEvidence: [],
        gapType: "desconhecida" as const,
        assessmentConfidence: 0.5,
      };
    }
    const matchStatus = hasProfile
      ? (index === 0 ? ("confirmed_match" as const) : ("partial_match" as const))
      : ("evidence_gap" as const);
    return {
      requirementId: id,
      matchStatus,
      reasoning: hasProfile
        ? "Experiência confirmada no perfil sustenta este requisito (avaliação sintética)."
        : "Perfil confirmado não possui evidência suficiente para este requisito (avaliação sintética).",
      profileEvidence: [],
      gapType: hasProfile ? undefined : ("evidencia" as const),
      assessmentConfidence: hasProfile ? 0.75 : 0.4,
    };
  });

  return {
    analysisType: "job_fit_analysis",
    profileVersionId: "synthetic",
    targetContextVersionId: "synthetic",
    opportunityVersionId: "synthetic",
    promptVersion: "1.0.0",
    schemaVersion: "core-2/1.1",
    rubricVersion: "synthetic",
    confidenceAssessment: {
      reasons: ["Avaliação gerada pelo adapter sintético de desenvolvimento."],
      missingInformation: hasProfile ? [] : ["Nenhuma experiência confirmada no perfil."],
      conflicts: [],
    },
    requirementAssessments,
    seniorityAssessment: {
      expected: "mid",
      observed: hasProfile ? "mid" : "insufficient_data",
      signals: [],
      gaps: [],
      assessmentConfidence: hasProfile ? 0.7 : 0.3,
    },
    strengths: [],
    gaps: [],
    risks: input.hasBlocking
      ? [
          {
            riskKey: "risk-location-1",
            type: "location_mismatch" as const,
            title: "Modalidade de trabalho não confirmada",
            description: "A vaga exige uma modalidade específica e não há informação fornecida para esta oportunidade.",
            severity: "medium" as const,
            requirementIds: input.requirementIds.filter((id) => id.startsWith("req-location")),
            evidenceRefs: [],
            mitigableBeforeApplication: true,
          },
        ]
      : [],
    recommendationCandidate: {
      scope: "application" as const,
      type: hasProfile ? "apply_with_adjustments" : "develop_gaps_before_applying",
      reasoning: "Candidato gerado pelo adapter sintético — a recomendação final é calculada pelo backend.",
      relatedRequirementIds: input.requirementIds,
    },
    actionCandidates: [],
    authenticityValidation: { warnings: [], blockedClaims: [] },
    warnings: ["Análise gerada pelo adapter sintético de desenvolvimento — não é uma análise real de IA."],
  };
}

const SYNTHETIC_BUILDERS: Record<string, (content: string) => unknown> = {
  "P-001": (content) => synthesizeProfileExtraction(content, "resume"),
  "P-002": (content) => synthesizeProfileExtraction(content, "linkedin"),
  "P-005": (content) => synthesizeCore1Output(content),
  "P-007": (content) => synthesizeOpportunityStructure(content),
  "P-009": (content) => synthesizeCore2Output(content),
};
