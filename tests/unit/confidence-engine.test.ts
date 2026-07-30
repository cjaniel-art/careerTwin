import { describe, expect, it } from "vitest";
import { calculateConfidence } from "@/domain/scores/confidence";

describe("calculateConfidence", () => {
  it("applies the exact weights from Motor de Análise e Scores §13", () => {
    const result = calculateConfidence({
      inputCompleteness: 1,
      userConfirmation: 1,
      evidenceTraceability: 1,
      sourceConsistency: 1,
    });
    expect(result.score).toBe(1);
    expect(result.level).toBe("high");
  });

  it("computes a weighted score matching 0.30/0.30/0.25/0.15", () => {
    const result = calculateConfidence({
      inputCompleteness: 0.8,
      userConfirmation: 0.6,
      evidenceTraceability: 0.4,
      sourceConsistency: 0.2,
    });
    // 0.8*0.30 + 0.6*0.30 + 0.4*0.25 + 0.2*0.15 = 0.24+0.18+0.10+0.03 = 0.55
    expect(result.score).toBeCloseTo(0.55, 3);
    expect(result.level).toBe("medium");
  });

  it("bands correctly at the low/medium/high boundaries", () => {
    expect(
      calculateConfidence({
        inputCompleteness: 0.49,
        userConfirmation: 0.49,
        evidenceTraceability: 0.49,
        sourceConsistency: 0.49,
      }).level,
    ).toBe("low");
    expect(
      calculateConfidence({
        inputCompleteness: 0.5,
        userConfirmation: 0.5,
        evidenceTraceability: 0.5,
        sourceConsistency: 0.5,
      }).level,
    ).toBe("medium");
    expect(
      calculateConfidence({
        inputCompleteness: 0.8,
        userConfirmation: 0.8,
        evidenceTraceability: 0.8,
        sourceConsistency: 0.8,
      }).level,
    ).toBe("high");
  });

  it("rejects components outside [0,1]", () => {
    expect(() =>
      calculateConfidence({
        inputCompleteness: 1.5,
        userConfirmation: 0,
        evidenceTraceability: 0,
        sourceConsistency: 0,
      }),
    ).toThrow(RangeError);
  });

  it("never receives personal data — components are purely numeric by type", () => {
    // Structural guarantee: ConfidenceComponents has no room for name/email/etc.
    const result = calculateConfidence({
      inputCompleteness: 0.7,
      userConfirmation: 0.7,
      evidenceTraceability: 0.7,
      sourceConsistency: 0.7,
    });
    expect(Object.keys(result)).toEqual(["score", "level", "reasons", "missingInformation", "conflicts"]);
  });
});
