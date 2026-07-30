import { CONFIDENCE_CONFIG } from "./confidence";

/**
 * Core 2 (Diagnóstico de Aderência / IAO) engine configuration.
 * Source: PRD 03 §45 (`CORE_2_CONFIG`, literal block) + §21–§25/§31–§32.
 * `minimumContentRule` is left as the literal placeholder from the source
 * document — see docs/implementation/open-decisions.md #3 (blocking, partial).
 * `evidence_gap` factor is 0.40 (not the legacy/discarded 0.30 — Qualidade e
 * Casos de Teste, caso IAO-002).
 */
export const CORE_2_CONFIG = {
  opportunity: {
    allowedExtensions: ["pdf"],
    maxFileSizeMb: 10,
    maxPages: 50,
    maxOriginalFileNameCharacters: 120,
    maxPastedTextCharacters: 100_000,
    minimumUsefulCharacters: 300,
    minimumContentRule: "pending_decision_log",
    passwordProtectedFiles: "reject",
    originalFileRetentionHours: 24,
  },

  iao: {
    requirementWeights: {
      mandatory: 3.0,
      desired: 1.5,
      differential: 1.0,
      complementary: 0.5,
      blocking: 4.0,
    },

    matchFactors: {
      confirmed_match: 1.0,
      partial_match: 0.65,
      communication_gap: 0.55,
      evidence_gap: 0.4,
      unknown: 0.2,
      not_observed: 0.0,
      confirmed_mismatch: 0.0,
    },

    bands: {
      low: [0, 39],
      partial: [40, 59],
      good: [60, 79],
      high: [80, 100],
    },

    caps: {
      blockingRequirement: 49,
      multipleCriticalMandatoryGaps: 59,
      strongSeniorityMismatch: 59,
      minimumBlockingConfidence: 0.75,
    },

    /** First-match-wins precedence for job-specific (`job_analysis`) recommendations. */
    recommendationPrecedence: [
      "insufficient_data",
      "blocking_requirement",
      "strong_seniority_mismatch",
      "multiple_critical_mandatory_gaps",
      "iao_0_39",
      "iao_40_59",
      "iao_60_79",
      "iao_80_100",
    ] as const,
  },

  confidence: CONFIDENCE_CONFIG,

  actions: {
    maximum: 5,
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

  credits: {
    freeJobAnalyses: 1,
    targetRoleConsumesJobCreditDuringPilot: false,
    reserveBeforeProcessing: true,
    restoreOnTechnicalFailure: true,
  },
} as const;

export type RequirementCriticality = keyof typeof CORE_2_CONFIG.iao.requirementWeights;
export type MatchStatus = keyof typeof CORE_2_CONFIG.iao.matchFactors;

export const REQUIREMENT_CATEGORIES = [
  "skill", "tool", "experience", "responsibility", "education",
  "certification", "seniority", "scope", "location", "language", "other",
] as const;
export type RequirementCategory = (typeof REQUIREMENT_CATEGORIES)[number];

/** English contract enum (PRD 03 §28), as persisted in requirement_assessments.gap_type. */
export const GAP_TYPES = [
  "competency", "experience", "education_or_certification",
  "communication", "evidence", "positioning", "unknown",
] as const;
export type GapType = (typeof GAP_TYPES)[number];

/**
 * The AI output schema (Prompts e Schemas §10) uses Portuguese gap_type values.
 * This is the single, centralized mapping to the English domain enum — see
 * docs/implementation/open-decisions.md #14. Never duplicate this map elsewhere.
 */
export const GAP_TYPE_FROM_AI_SCHEMA: Record<string, GapType> = {
  competencia: "competency",
  experiencia: "experience",
  formacao_certificacao: "education_or_certification",
  comunicacao: "communication",
  evidencia: "evidence",
  posicionamento: "positioning",
  desconhecida: "unknown",
};

export const APPLICATION_RECOMMENDATION_TYPES = [
  "apply_now", "apply_with_adjustments", "develop_gaps_before_applying",
  "do_not_prioritize", "insufficient_data",
] as const;
export type ApplicationRecommendation = (typeof APPLICATION_RECOMMENDATION_TYPES)[number];

export const TARGET_ROLE_RECOMMENDATION_TYPES = [
  "ready_to_prioritize", "prioritize_with_adjustments", "develop_before_prioritizing",
  "reassess_target_context", "insufficient_data",
] as const;
export type TargetRoleRecommendation = (typeof TARGET_ROLE_RECOMMENDATION_TYPES)[number];
