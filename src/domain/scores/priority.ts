import { CORE_1_CONFIG } from "@/config/engine/core1";

/**
 * Recommendation prioritization — Core 1.
 * Source: Motor de Análise e Scores §15; PRD 02 §21 (exact formula + ordering).
 * The AI proposes impact/effort/urgency/confidence (1–5); the backend is the
 * only place priority is computed (RF-C1-038, Guardrails §5).
 */

export type LikertScale = 1 | 2 | 3 | 4 | 5;

export interface PriorityInput {
  id: string;
  impact: LikertScale;
  effort: LikertScale;
  urgency: LikertScale;
  confidence: LikertScale;
}

export interface PriorityResult {
  id: string;
  priorityScore: number;
  priorityScore100: number;
  priorityOrder: number;
}

function assertLikert(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new RangeError(`${name} must be an integer between 1 and 5, got ${value}`);
  }
}

/**
 * priority = impact*0.40 + urgency*0.25 + effortBenefit*0.20 + confidence*0.15
 * where effortBenefit = 6 - effort. priorityScore100 = round((priority/5)*100).
 */
export function calculatePriority(input: PriorityInput): Omit<PriorityResult, "priorityOrder"> {
  assertLikert("impact", input.impact);
  assertLikert("effort", input.effort);
  assertLikert("urgency", input.urgency);
  assertLikert("confidence", input.confidence);

  const { priorityWeights } = CORE_1_CONFIG.recommendations;
  const effortBenefit = 6 - input.effort;
  const priorityScore =
    input.impact * priorityWeights.impact +
    input.urgency * priorityWeights.urgency +
    effortBenefit * priorityWeights.effortBenefit +
    input.confidence * priorityWeights.confidence;

  const priorityScore100 = Math.round((priorityScore / 5) * 100);

  return { id: input.id, priorityScore, priorityScore100 };
}

/**
 * Orders recommendations by priorityScore100 desc, impact desc, effort asc,
 * confidence desc (PRD 02 §21) and assigns 1-based priorityOrder.
 */
export function orderByPriority(inputs: PriorityInput[]): PriorityResult[] {
  const scored = inputs.map((input) => ({ input, ...calculatePriority(input) }));

  scored.sort((a, b) => {
    if (b.priorityScore100 !== a.priorityScore100) return b.priorityScore100 - a.priorityScore100;
    if (b.input.impact !== a.input.impact) return b.input.impact - a.input.impact;
    if (a.input.effort !== b.input.effort) return a.input.effort - b.input.effort;
    return b.input.confidence - a.input.confidence;
  });

  return scored.map(({ input: _input, ...rest }, index) => ({ ...rest, priorityOrder: index + 1 }));
}
