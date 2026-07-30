import { describe, expect, it } from "vitest";
import {
  determineApplicationRecommendation,
  determineTargetRoleRecommendation,
  type RecommendationSignals,
} from "@/domain/scores/recommendation";

function signals(overrides: Partial<RecommendationSignals>): RecommendationSignals {
  return {
    band: "high_observable_fit",
    confidenceLevel: "high",
    appliedCaps: [],
    insufficientData: false,
    ...overrides,
  };
}

describe("determineApplicationRecommendation (PRD 03 §31, 8-level precedence)", () => {
  it("insufficient_data always wins, even with a high band", () => {
    expect(determineApplicationRecommendation(signals({ insufficientData: true }))).toBe("insufficient_data");
  });

  it("low confidence forces insufficient_data even with a high band (RF-C2-041)", () => {
    expect(determineApplicationRecommendation(signals({ confidenceLevel: "low" }))).toBe("insufficient_data");
  });

  it("a confirmed blocker prevents apply_now regardless of band", () => {
    expect(
      determineApplicationRecommendation(signals({ appliedCaps: ["blocking_requirement"] })),
    ).toBe("do_not_prioritize");
  });

  it("iao 80-100 with no caps and sufficient confidence -> apply_now", () => {
    expect(determineApplicationRecommendation(signals({}))).toBe("apply_now");
  });

  it("iao 60-79 -> apply_with_adjustments", () => {
    expect(determineApplicationRecommendation(signals({ band: "good_observable_fit" }))).toBe(
      "apply_with_adjustments",
    );
  });

  it("iao 40-59 -> develop_gaps_before_applying", () => {
    expect(determineApplicationRecommendation(signals({ band: "partial_fit" }))).toBe(
      "develop_gaps_before_applying",
    );
  });

  it("iao 0-39 -> do_not_prioritize", () => {
    expect(determineApplicationRecommendation(signals({ band: "low_observable_fit" }))).toBe(
      "do_not_prioritize",
    );
  });

  it("never returns a target-role enum value", () => {
    const validValues = [
      "apply_now",
      "apply_with_adjustments",
      "develop_gaps_before_applying",
      "do_not_prioritize",
      "insufficient_data",
    ];
    for (const band of ["low_observable_fit", "partial_fit", "good_observable_fit", "high_observable_fit"] as const) {
      expect(validValues).toContain(determineApplicationRecommendation(signals({ band })));
    }
  });
});

describe("determineTargetRoleRecommendation (PRD 03 §32)", () => {
  it("insufficient_data wins over everything", () => {
    expect(determineTargetRoleRecommendation(signals({ insufficientData: true }))).toBe(
      "insufficient_data",
    );
  });

  it("seniority mismatch -> reassess_target_context, never a job-specific value", () => {
    expect(
      determineTargetRoleRecommendation(signals({ appliedCaps: ["seniority_mismatch"] })),
    ).toBe("reassess_target_context");
  });

  it("iao 80-100 with no caps -> ready_to_prioritize", () => {
    expect(determineTargetRoleRecommendation(signals({}))).toBe("ready_to_prioritize");
  });

  it("iao 60-79 -> prioritize_with_adjustments", () => {
    expect(determineTargetRoleRecommendation(signals({ band: "good_observable_fit" }))).toBe(
      "prioritize_with_adjustments",
    );
  });

  it("iao 0-39 -> reassess_target_context (never 'apply' language)", () => {
    const result = determineTargetRoleRecommendation(signals({ band: "low_observable_fit" }));
    expect(result).toBe("reassess_target_context");
    expect(result).not.toMatch(/apply/);
  });
});
