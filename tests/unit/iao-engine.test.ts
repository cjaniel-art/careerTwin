import { describe, expect, it } from "vitest";
import { calculateIao, type RequirementForScoring } from "@/domain/scores/iao";

function req(overrides: Partial<RequirementForScoring> & Pick<RequirementForScoring, "requirementId">): RequirementForScoring {
  return {
    criticality: "mandatory",
    isCritical: true,
    applicability: "applicable",
    matchStatus: "confirmed_match",
    extractionConfidence: 0.9,
    ...overrides,
  };
}

describe("calculateIao — Qualidade e Casos de Teste, casos IAO-001..007", () => {
  it("IAO-001: confirmed_match uses the official factor 1.00", () => {
    const result = calculateIao({
      requirements: [req({ requirementId: "r1", matchStatus: "confirmed_match" })],
      strongSeniorityMismatch: false,
    });
    expect(result.requirementScores[0]!.factor).toBe(1.0);
    expect(result.rawScore).toBe(100);
  });

  it("IAO-002: evidence_gap uses the official factor 0.40, not the legacy 0.30", () => {
    const result = calculateIao({
      requirements: [req({ requirementId: "r1", matchStatus: "evidence_gap" })],
      strongSeniorityMismatch: false,
    });
    expect(result.requirementScores[0]!.factor).toBe(0.4);
    expect(result.requirementScores[0]!.factor).not.toBe(0.3);
  });

  it("IAO-003: partial_match uses the official factor 0.65", () => {
    const result = calculateIao({
      requirements: [req({ requirementId: "r1", matchStatus: "partial_match" })],
      strongSeniorityMismatch: false,
    });
    expect(result.requirementScores[0]!.factor).toBe(0.65);
  });

  it("IAO-004: two or more critical mandatory gaps cap the final IAO at 59", () => {
    const result = calculateIao({
      requirements: [
        req({ requirementId: "r1", matchStatus: "confirmed_match" }),
        req({ requirementId: "r2", criticality: "mandatory", isCritical: true, matchStatus: "confirmed_mismatch", extractionConfidence: 0.9 }),
        req({ requirementId: "r3", criticality: "mandatory", isCritical: true, matchStatus: "confirmed_mismatch", extractionConfidence: 0.9 }),
      ],
      strongSeniorityMismatch: false,
    });
    expect(result.appliedCaps).toContain("multiple_critical_mandatory_gaps");
    expect(result.finalScore).toBeLessThanOrEqual(59);
    expect(result.finalScore).toBeLessThanOrEqual(result.rawScore);
  });

  it("IAO-005: a confirmed blocking requirement caps the final IAO at 49 and prevents apply_now", () => {
    const result = calculateIao({
      requirements: [
        req({ requirementId: "r1", matchStatus: "confirmed_match" }),
        req({
          requirementId: "r2",
          criticality: "blocking",
          isCritical: true,
          matchStatus: "confirmed_mismatch",
          extractionConfidence: 0.9,
        }),
      ],
      strongSeniorityMismatch: false,
    });
    expect(result.appliedCaps).toContain("blocking_requirement");
    expect(result.finalScore).toBeLessThanOrEqual(49);
  });

  it("IAO-005b: a blocking mismatch below the 0.75 confidence threshold does NOT trigger the cap unreviewed", () => {
    const result = calculateIao({
      requirements: [
        req({ requirementId: "r1", matchStatus: "confirmed_match" }),
        req({
          requirementId: "r2",
          criticality: "blocking",
          isCritical: true,
          matchStatus: "confirmed_mismatch",
          extractionConfidence: 0.5, // below minimumBlockingConfidence (0.75)
        }),
      ],
      strongSeniorityMismatch: false,
    });
    expect(result.appliedCaps).not.toContain("blocking_requirement");
  });

  it("IAO-006: a low-confidence/ambiguous requirement is scored with its unknown factor (0.20), not silently promoted", () => {
    const result = calculateIao({
      requirements: [req({ requirementId: "r1", matchStatus: "unknown", extractionConfidence: 0.3 })],
      strongSeniorityMismatch: false,
    });
    expect(result.requirementScores[0]!.factor).toBe(0.2);
  });

  it("IAO-007: not_applicable requirements are excluded from both numerator and denominator", () => {
    const withExtra = calculateIao({
      requirements: [
        req({ requirementId: "r1", matchStatus: "confirmed_match" }),
        req({ requirementId: "r2", matchStatus: "not_observed", applicability: "not_applicable" }),
      ],
      strongSeniorityMismatch: false,
    });
    const withoutExtra = calculateIao({
      requirements: [req({ requirementId: "r1", matchStatus: "confirmed_match" })],
      strongSeniorityMismatch: false,
    });
    expect(withExtra.rawScore).toBe(withoutExtra.rawScore);
    expect(withExtra.requirementScores.find((r) => r.requirementId === "r2")!.excluded).toBe(true);
  });

  it("applies the strong seniority mismatch cap (59) independently of requirement caps", () => {
    const result = calculateIao({
      requirements: [req({ requirementId: "r1", matchStatus: "confirmed_match" })],
      strongSeniorityMismatch: true,
    });
    expect(result.appliedCaps).toEqual(["seniority_mismatch"]);
    expect(result.finalScore).toBeLessThanOrEqual(59);
  });

  it("is deterministic: identical inputs always produce identical output (RNF-C2-007)", () => {
    const input = {
      requirements: [req({ requirementId: "r1", matchStatus: "partial_match" })],
      strongSeniorityMismatch: false,
    };
    expect(calculateIao(input)).toEqual(calculateIao(input));
  });

  it("rejects an empty requirement list rather than producing a fabricated score", () => {
    expect(() => calculateIao({ requirements: [], strongSeniorityMismatch: false })).toThrow();
  });
});
