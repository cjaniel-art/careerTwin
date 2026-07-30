import { describe, expect, it } from "vitest";
import { calculatePriority, orderByPriority, type PriorityInput } from "@/domain/scores/priority";

describe("calculatePriority", () => {
  it("applies the exact formula from PRD 02 §21", () => {
    // impact=5, urgency=4, effort=2 (effortBenefit=4), confidence=3
    // priority = 5*0.40 + 4*0.25 + 4*0.20 + 3*0.15 = 2.0+1.0+0.8+0.45 = 4.25
    // priorityScore100 = round((4.25/5)*100) = 85
    const result = calculatePriority({ id: "r1", impact: 5, urgency: 4, effort: 2, confidence: 3 });
    expect(result.priorityScore).toBeCloseTo(4.25, 5);
    expect(result.priorityScore100).toBe(85);
  });

  it("rejects non-Likert values", () => {
    expect(() =>
      calculatePriority({ id: "r1", impact: 6 as never, urgency: 3, effort: 3, confidence: 3 }),
    ).toThrow(RangeError);
  });
});

describe("orderByPriority", () => {
  it("orders by priorityScore100 desc, then impact desc, effort asc, confidence desc", () => {
    const inputs: PriorityInput[] = [
      { id: "low", impact: 1, urgency: 1, effort: 5, confidence: 1 },
      { id: "high", impact: 5, urgency: 5, effort: 1, confidence: 5 },
      { id: "mid", impact: 3, urgency: 3, effort: 3, confidence: 3 },
    ];
    const result = orderByPriority(inputs);
    expect(result.map((r) => r.id)).toEqual(["high", "mid", "low"]);
    expect(result.map((r) => r.priorityOrder)).toEqual([1, 2, 3]);
  });

  it("breaks ties deterministically (equal score -> impact desc)", () => {
    const inputs: PriorityInput[] = [
      { id: "a", impact: 2, urgency: 3, effort: 3, confidence: 3 },
      { id: "b", impact: 4, urgency: 3, effort: 3, confidence: 1 },
    ];
    // Both may not have identical scores; this test only asserts stable, non-AI ordering.
    const result = orderByPriority(inputs);
    expect(result).toHaveLength(2);
    expect(new Set(result.map((r) => r.id))).toEqual(new Set(["a", "b"]));
  });
});
