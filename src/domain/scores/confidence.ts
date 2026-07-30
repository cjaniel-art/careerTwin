import { CONFIDENCE_CONFIG, type ConfidenceLevel } from "@/config/engine/confidence";

/**
 * Confidence is always calculated separately from IPP/IAO and never alters
 * them mathematically (Motor §13, Guardrails §5/§12). This is the single
 * implementation shared by Core 1 and Core 2 — do not reimplement elsewhere.
 */
export interface ConfidenceComponents {
  /** 0..1 — how complete the inputs were. */
  inputCompleteness: number;
  /** 0..1 — how much of the relevant content the user explicitly confirmed. */
  userConfirmation: number;
  /** 0..1 — how traceable conclusions are to evidence. */
  evidenceTraceability: number;
  /** 0..1 — how consistent the sources (résumé/LinkedIn/job posting) were. */
  sourceConsistency: number;
}

export interface ConfidenceResult {
  score: number;
  level: ConfidenceLevel;
  reasons: string[];
  missingInformation: string[];
  conflicts: string[];
}

function assertUnitInterval(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`ConfidenceComponents.${name} must be between 0 and 1, got ${value}`);
  }
}

function levelFor(score: number): ConfidenceLevel {
  const { low, medium, high } = CONFIDENCE_CONFIG.levels;
  if (score >= high[0]) return "high";
  if (score >= medium[0]) return "medium";
  if (score >= low[0]) return "low";
  throw new RangeError(`Confidence score out of range: ${score}`);
}

export function calculateConfidence(
  components: ConfidenceComponents,
  context: { reasons?: string[]; missingInformation?: string[]; conflicts?: string[] } = {},
): ConfidenceResult {
  assertUnitInterval("inputCompleteness", components.inputCompleteness);
  assertUnitInterval("userConfirmation", components.userConfirmation);
  assertUnitInterval("evidenceTraceability", components.evidenceTraceability);
  assertUnitInterval("sourceConsistency", components.sourceConsistency);

  const { weights } = CONFIDENCE_CONFIG;
  const score =
    components.inputCompleteness * weights.inputCompleteness +
    components.userConfirmation * weights.userConfirmation +
    components.evidenceTraceability * weights.evidenceTraceability +
    components.sourceConsistency * weights.sourceConsistency;

  // Round to 3 decimals to match the numeric(4,3) column precision.
  const rounded = Math.round(score * 1000) / 1000;

  return {
    score: rounded,
    level: levelFor(rounded),
    reasons: context.reasons ?? [],
    missingInformation: context.missingInformation ?? [],
    conflicts: context.conflicts ?? [],
  };
}
