import { CORE_2_CONFIG, type MatchStatus, type RequirementCriticality } from "@/config/engine/core2";

/**
 * IAO (Índice de Aderência Observável) — deterministic backend calculation.
 * Source: PRD 03 §21–§25 ("IAO — Índice de Aderência à Oportunidade" section
 * of the Core 2 extract); Motor de Análise e Scores.
 *
 * The AI classifies each requirement's matchStatus (Prompts e Schemas §10,
 * `core-2/1.1` schema) but never computes weights, factors, contributions, or
 * the final score — the backend does, using this module (PRD 03 §18/§34:
 * "A saída da IA NÃO deve conter [...] fator numérico [...] IAO bruto [...] IAO final").
 */

export type IaoBand = "low_observable_fit" | "partial_fit" | "good_observable_fit" | "high_observable_fit";
export type AppliedCap = "blocking_requirement" | "multiple_critical_mandatory_gaps" | "seniority_mismatch";

/**
 * Thrown when every requirement is either excluded (not_applicable) or has a
 * zero weighted contribution (e.g. every requirement assessed at 0 confidence
 * for a very sparse profile) — there's nothing to divide by. This is expected,
 * user-recoverable "not enough signal" data, not a technical failure: callers
 * should map it to the same `insufficient_data` outcome used when a job has no
 * requirements at all, not to a generic retryable error.
 */
export class InsufficientScoringDataError extends Error {
  constructor() {
    super("calculateIao: no applicable requirements to score (denominator is zero)");
    this.name = "InsufficientScoringDataError";
  }
}

export interface RequirementForScoring {
  requirementId: string;
  criticality: RequirementCriticality;
  isCritical: boolean;
  applicability: "applicable" | "not_applicable" | "unknown";
  /** AI-classified match state, already validated against the enum. */
  matchStatus: MatchStatus;
  /** 0..1 — confidence of the extraction/classification for this requirement. */
  extractionConfidence: number;
}

export interface RequirementScoreResult {
  requirementId: string;
  weight: number;
  factor: number;
  weightedContribution: number;
  excluded: boolean;
}

export interface IaoCalculationInput {
  requirements: RequirementForScoring[];
  /** True only when a seniority assessment (computed elsewhere) found a strong,
   *  confidently-observed mismatch (Motor/PRD 03 §24.3). Never derived from title alone. */
  strongSeniorityMismatch: boolean;
}

export interface IaoResult {
  rawScore: number;
  finalScore: number;
  displayScore: number;
  band: IaoBand;
  appliedCaps: AppliedCap[];
  requirementScores: RequirementScoreResult[];
}

function assertUnitInterval(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${name} must be between 0 and 1, got ${value}`);
  }
}

function bandFor(score: number): IaoBand {
  const { low, partial, good, high } = CORE_2_CONFIG.iao.bands;
  if (score >= high[0]) return "high_observable_fit";
  if (score >= good[0]) return "good_observable_fit";
  if (score >= partial[0]) return "partial_fit";
  if (score >= low[0]) return "low_observable_fit";
  throw new RangeError(`IAO score out of range: ${score}`);
}

/**
 * weightedMatch = requirementWeight * matchFactor * extractionConfidence
 * IAO_RAW = round(100 * sum(weightedMatch) / sum(requirementWeight * extractionConfidence))
 * not_applicable requirements are excluded from both numerator and denominator.
 */
export function calculateIao(input: IaoCalculationInput): IaoResult {
  if (input.requirements.length === 0) {
    throw new Error("calculateIao: at least one requirement is required");
  }

  let numerator = 0;
  let denominator = 0;
  const requirementScores: RequirementScoreResult[] = input.requirements.map((req) => {
    assertUnitInterval(`extractionConfidence(${req.requirementId})`, req.extractionConfidence);
    const excluded = req.applicability === "not_applicable";
    const weight = CORE_2_CONFIG.iao.requirementWeights[req.criticality];
    const factor = CORE_2_CONFIG.iao.matchFactors[req.matchStatus];
    const weightedContribution = weight * factor * req.extractionConfidence;

    if (!excluded) {
      numerator += weightedContribution;
      denominator += weight * req.extractionConfidence;
    }

    return { requirementId: req.requirementId, weight, factor, weightedContribution, excluded };
  });

  if (denominator === 0) {
    throw new InsufficientScoringDataError();
  }

  const rawScore = Math.round((100 * numerator) / denominator);

  // ---- Safety caps (PRD 03 §24, applied in order; each is independent, not exclusive) ----
  const appliedCaps: AppliedCap[] = [];
  let finalScore = rawScore;
  const { caps } = CORE_2_CONFIG.iao;

  const hasConfirmedBlocker = input.requirements.some(
    (r) =>
      !isExcluded(r) &&
      r.criticality === "blocking" &&
      r.matchStatus === "confirmed_mismatch" &&
      r.extractionConfidence >= caps.minimumBlockingConfidence,
  );
  if (hasConfirmedBlocker) {
    appliedCaps.push("blocking_requirement");
    finalScore = Math.min(finalScore, caps.blockingRequirement);
  }

  const criticalMandatoryGaps = input.requirements.filter(
    (r) =>
      !isExcluded(r) &&
      r.criticality === "mandatory" &&
      r.isCritical &&
      r.matchStatus === "confirmed_mismatch" &&
      r.extractionConfidence >= caps.minimumBlockingConfidence,
  ).length;
  if (criticalMandatoryGaps >= 2) {
    appliedCaps.push("multiple_critical_mandatory_gaps");
    finalScore = Math.min(finalScore, caps.multipleCriticalMandatoryGaps);
  }

  if (input.strongSeniorityMismatch) {
    appliedCaps.push("seniority_mismatch");
    finalScore = Math.min(finalScore, caps.strongSeniorityMismatch);
  }

  return {
    rawScore,
    finalScore,
    displayScore: finalScore,
    band: bandFor(finalScore),
    appliedCaps,
    requirementScores,
  };
}

function isExcluded(r: RequirementForScoring): boolean {
  return r.applicability === "not_applicable";
}
