import {
  CORE_1_CONFIG,
  IPP_DIMENSIONS,
  IPP_DIMENSION_WEIGHT_KEY,
  type IppDimension,
} from "@/config/engine/core1";
import type { ConfidenceResult } from "./confidence";

/**
 * IPP (Índice de Prontidão do Perfil) — deterministic backend calculation.
 * Source: Motor de Análise e Scores §4–§7; PRD 02 §13/§19.
 *
 * The AI never returns this score — it only classifies each dimension into a
 * rubric level (0–4, "Motor §5: A IA não poderá atribuir livremente uma nota
 * de zero a cem"). This module converts validated rubric levels into the
 * final IPP, entirely in the backend.
 */

export type IppLevel = "low_readiness" | "developing_readiness" | "good_readiness" | "high_readiness";

export interface DimensionAssessment {
  dimension: IppDimension;
  /** Integer 0–4, already validated against the rubric by the caller. */
  rubricLevel: 0 | 1 | 2 | 3 | 4;
  reasoning: string;
}

export interface IppDimensionResult {
  dimension: IppDimension;
  rubricLevel: 0 | 1 | 2 | 3 | 4;
  score: number;
  weight: number;
  weightedContribution: number;
  reasoning: string;
}

export interface IppResult {
  score: number;
  level: IppLevel;
  dimensions: IppDimensionResult[];
}

function levelForIpp(score: number): IppLevel {
  const { low, developing, good, high } = CORE_1_CONFIG.ipp.levels;
  if (score >= high[0]) return "high_readiness";
  if (score >= good[0]) return "good_readiness";
  if (score >= developing[0]) return "developing_readiness";
  if (score >= low[0]) return "low_readiness";
  throw new RangeError(`IPP score out of range: ${score}`);
}

/**
 * Calculates the IPP from validated per-dimension rubric levels.
 * Requires exactly the 7 canonical dimensions, each exactly once — this is
 * enforced so a missing or duplicated dimension fails loudly instead of
 * silently producing a wrong weighted average (Guardrails §13: "falhar de
 * forma explícita é preferível a gerar um diagnóstico incorreto").
 */
export function calculateIpp(assessments: DimensionAssessment[]): IppResult {
  const byDimension = new Map(assessments.map((a) => [a.dimension, a]));
  if (byDimension.size !== assessments.length) {
    throw new Error("calculateIpp: duplicate dimension in assessments");
  }
  for (const dimension of IPP_DIMENSIONS) {
    if (!byDimension.has(dimension)) {
      throw new Error(`calculateIpp: missing required dimension "${dimension}"`);
    }
  }

  const dimensions: IppDimensionResult[] = IPP_DIMENSIONS.map((dimension) => {
    const assessment = byDimension.get(dimension)!;
    if (assessment.rubricLevel < 0 || assessment.rubricLevel > 4) {
      throw new RangeError(`calculateIpp: rubricLevel out of range for "${dimension}"`);
    }
    const weightKey = IPP_DIMENSION_WEIGHT_KEY[dimension];
    const weight = CORE_1_CONFIG.ipp.weights[weightKey];
    // Motor §5: pontuação da dimensão = nível da rubrica ÷ 4 × 100
    const score = (assessment.rubricLevel / 4) * 100;
    const weightedContribution = score * weight;
    return {
      dimension,
      rubricLevel: assessment.rubricLevel,
      score,
      weight,
      weightedContribution,
      reasoning: assessment.reasoning,
    };
  });

  const rawScore = dimensions.reduce((sum, d) => sum + d.weightedContribution, 0);
  const score = Math.round(rawScore);

  return { score, level: levelForIpp(score), dimensions };
}

export interface IppReport {
  ipp: IppResult;
  confidence: ConfidenceResult;
}
