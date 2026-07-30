/**
 * Confidence formula — shared by Core 1 (IPP) and Core 2 (IAO).
 * Source: Motor de Análise e Scores §13 (single canonical source for both cores).
 * Do not redefine these weights/bands anywhere else — import this module instead.
 */
export const CONFIDENCE_CONFIG = {
  weights: {
    inputCompleteness: 0.3,
    userConfirmation: 0.3,
    evidenceTraceability: 0.25,
    sourceConsistency: 0.15,
  },
  levels: {
    low: [0, 0.49],
    medium: [0.5, 0.79],
    high: [0.8, 1],
  },
} as const;

export type ConfidenceLevel = "low" | "medium" | "high";
