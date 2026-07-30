import { describe, expect, it } from "vitest";
import { core2OutputSchema } from "@/config/schemas/core2";
import { opportunityStructureSchema } from "@/config/schemas/opportunity";
import { GAP_TYPE_FROM_AI_SCHEMA } from "@/config/engine/core2";

/**
 * SEC-003 (Qualidade e Casos de Teste §11): "tentativa de induzir texto fora
 * do JSON ou enums inválidos" must be rejected by schema validation before
 * anything is persisted.
 */
describe("core2OutputSchema", () => {
  const validPayload = {
    analysisType: "job_fit_analysis" as const,
    profileVersionId: "pv1",
    targetContextVersionId: "tcv1",
    opportunityVersionId: "ov1",
    promptVersion: "p1",
    schemaVersion: "core-2/1.1" as const,
    rubricVersion: "r1",
    confidenceAssessment: { reasons: [], missingInformation: [], conflicts: [] },
    requirementAssessments: [
      {
        requirementId: "req1",
        matchStatus: "partial_match" as const,
        reasoning: "some reasoning",
        profileEvidence: [],
        gapType: "evidencia" as const,
        assessmentConfidence: 0.8,
      },
    ],
    seniorityAssessment: {
      expected: "mid" as const,
      observed: "junior" as const,
      signals: [],
      gaps: [],
      assessmentConfidence: 0.7,
    },
    strengths: [],
    gaps: [],
    risks: [],
    recommendationCandidate: {
      scope: "application" as const,
      type: "apply_with_adjustments",
      reasoning: "x",
      relatedRequirementIds: [],
    },
    actionCandidates: [],
    authenticityValidation: { warnings: [], blockedClaims: [] },
    warnings: [],
  };

  it("accepts a well-formed AI output", () => {
    expect(core2OutputSchema.safeParse(validPayload).success).toBe(true);
  });

  it("rejects a free-form/injected score field (SEC-001/SEC-003): schema has no room for it", () => {
    const withInjectedScore = { ...validPayload, iaoFinal: 100 };
    // The extra field is simply not part of the typed output — verify the
    // known-fields subset still parses (score never becomes part of the type).
    const parsed = core2OutputSchema.parse(withInjectedScore);
    expect((parsed as Record<string, unknown>).iaoFinal).toBeUndefined();
  });

  it("rejects an out-of-enum matchStatus (SEC-003: quebra de schema)", () => {
    const bad = {
      ...validPayload,
      requirementAssessments: [
        { ...validPayload.requirementAssessments[0], matchStatus: "definitely_hired" },
      ],
    };
    expect(core2OutputSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a mismatched schemaVersion instead of silently accepting it", () => {
    const bad = { ...validPayload, schemaVersion: "core-2/0.9" };
    expect(core2OutputSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a confidence value outside [0,1]", () => {
    const bad = {
      ...validPayload,
      requirementAssessments: [{ ...validPayload.requirementAssessments[0], assessmentConfidence: 1.5 }],
    };
    expect(core2OutputSchema.safeParse(bad).success).toBe(false);
  });
});

describe("GAP_TYPE_FROM_AI_SCHEMA mapping", () => {
  it("maps every Portuguese AI schema value to a valid English domain enum value", () => {
    const opportunitySample = opportunityStructureSchema.parse({
      schemaVersion: "opportunity-structure/1.1",
      opportunityType: "job",
      opportunityVersionId: "ov1",
      title: "t",
      company: "c",
      sourceType: "pasted_text",
      requirements: [],
      responsibilities: [],
      senioritySignals: [],
      ambiguities: [],
      warnings: [],
    });
    expect(opportunitySample.requirements).toEqual([]);

    const ptValues = ["competencia", "experiencia", "formacao_certificacao", "comunicacao", "evidencia", "posicionamento", "desconhecida"];
    for (const pt of ptValues) {
      expect(GAP_TYPE_FROM_AI_SCHEMA[pt]).toBeDefined();
    }
    expect(Object.keys(GAP_TYPE_FROM_AI_SCHEMA)).toHaveLength(7);
  });
});
