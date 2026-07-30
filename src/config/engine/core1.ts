import { CONFIDENCE_CONFIG } from "./confidence";

/**
 * Core 1 (Análise de Perfil / IPP) engine configuration.
 * Source: PRD 02 §32 (`CORE_1_CONFIG`, literal block) + Motor de Análise e
 * Scores §5–§7/§15. Values are reproduced exactly — do not round, rebalance,
 * or duplicate them elsewhere (Guardrails §5: "backend calcula scores [...]
 * utilizando regras versionadas").
 */
export const CORE_1_CONFIG = {
  ipp: {
    weights: {
      objectiveClarity: 0.15,
      experienceQuality: 0.2,
      evidenceAndResults: 0.2,
      skillsAndTools: 0.15,
      crossSourceConsistency: 0.1,
      positioningQuality: 0.1,
      profileCompleteness: 0.1,
    },
    levels: {
      low: [0, 39],
      developing: [40, 59],
      good: [60, 79],
      high: [80, 100],
    },
    rubricLevels: [0, 1, 2, 3, 4],
  },
  confidence: CONFIDENCE_CONFIG,
  recommendations: {
    maximum: 8,
    highlightedMaximum: 3,
    actionPlanMaximum: 5,
    priorityWeights: {
      impact: 0.4,
      urgency: 0.25,
      effortBenefit: 0.2,
      confidence: 0.15,
    },
  },
  processing: {
    attemptTimeoutSeconds: 300,
    maxAttempts: 3,
    stalledJobMinutes: 10,
  },
  feedback: {
    utilityScale: [1, 2, 3, 4, 5],
    specificityOptions: ["yes", "partially", "no"],
  },
} as const;

export const IPP_DIMENSIONS = [
  "objective_clarity",
  "experience_quality",
  "evidence_and_results",
  "skills_and_tools",
  "cross_source_consistency",
  "positioning_quality",
  "profile_completeness",
] as const;

export type IppDimension = (typeof IPP_DIMENSIONS)[number];

/** Maps snake_case dimension keys (DB/schema) to the camelCase config weight keys. */
export const IPP_DIMENSION_WEIGHT_KEY: Record<IppDimension, keyof typeof CORE_1_CONFIG.ipp.weights> = {
  objective_clarity: "objectiveClarity",
  experience_quality: "experienceQuality",
  evidence_and_results: "evidenceAndResults",
  skills_and_tools: "skillsAndTools",
  cross_source_consistency: "crossSourceConsistency",
  positioning_quality: "positioningQuality",
  profile_completeness: "profileCompleteness",
};
