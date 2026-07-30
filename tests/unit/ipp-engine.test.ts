import { describe, expect, it } from "vitest";
import { calculateIpp, type DimensionAssessment } from "@/domain/scores/ipp";
import { IPP_DIMENSIONS } from "@/config/engine/core1";

function allDimensionsAt(level: 0 | 1 | 2 | 3 | 4): DimensionAssessment[] {
  return IPP_DIMENSIONS.map((dimension) => ({ dimension, rubricLevel: level, reasoning: "test" }));
}

describe("calculateIpp", () => {
  it("scores 0 when every dimension is at rubric level 0 (IPP-001 style: insufficient data)", () => {
    const result = calculateIpp(allDimensionsAt(0));
    expect(result.score).toBe(0);
    expect(result.level).toBe("low_readiness");
  });

  it("scores 100 when every dimension is at rubric level 4", () => {
    const result = calculateIpp(allDimensionsAt(4));
    expect(result.score).toBe(100);
    expect(result.level).toBe("high_readiness");
  });

  it("applies the exact weights 15/20/20/15/10/10/10 (Motor §5)", () => {
    // Set every dimension to level 4 (100) except objective_clarity at level 0 (0).
    // Expected: 100 - (100 * 0.15) = 85.
    const assessments = allDimensionsAt(4).map((a) =>
      a.dimension === "objective_clarity" ? { ...a, rubricLevel: 0 as const } : a,
    );
    const result = calculateIpp(assessments);
    expect(result.score).toBe(85);
  });

  it("converts rubric level to dimension score via level/4*100 (Motor §5)", () => {
    const assessments = allDimensionsAt(0).map((a) =>
      a.dimension === "experience_quality" ? { ...a, rubricLevel: 2 as const } : a,
    );
    const result = calculateIpp(assessments);
    const dim = result.dimensions.find((d) => d.dimension === "experience_quality")!;
    expect(dim.score).toBe(50); // 2/4 * 100
    expect(dim.weightedContribution).toBe(10); // 50 * 0.20
  });

  it("bands correctly at 0-39/40-59/60-79/80-100", () => {
    // uniform levels: 0->0, 1->25, 2->50, 3->75, 4->100
    expect(calculateIpp(allDimensionsAt(1)).level).toBe("low_readiness"); // 25
    expect(calculateIpp(allDimensionsAt(2)).level).toBe("developing_readiness"); // 50
    expect(calculateIpp(allDimensionsAt(3)).level).toBe("good_readiness"); // 75
    expect(calculateIpp(allDimensionsAt(4)).level).toBe("high_readiness"); // 100
  });

  it("is deterministic: identical inputs always produce identical output (RNF-C1-007)", () => {
    const input = allDimensionsAt(3);
    const a = calculateIpp(input);
    const b = calculateIpp(input);
    expect(a).toEqual(b);
  });

  it("throws when a required dimension is missing instead of silently defaulting", () => {
    const incomplete = allDimensionsAt(3).slice(0, 6);
    expect(() => calculateIpp(incomplete)).toThrow(/missing required dimension/);
  });

  it("throws on a duplicated dimension instead of silently overwriting", () => {
    const duplicated = [...allDimensionsAt(3), { dimension: "objective_clarity" as const, rubricLevel: 4 as const, reasoning: "dup" }];
    expect(() => calculateIpp(duplicated)).toThrow(/duplicate dimension/);
  });

  it("throws on an out-of-range rubric level (AI must never emit outside 0-4)", () => {
    const bad = allDimensionsAt(3).map((a) =>
      a.dimension === "profile_completeness" ? { ...a, rubricLevel: 5 as unknown as 4 } : a,
    );
    expect(() => calculateIpp(bad)).toThrow(RangeError);
  });
});
