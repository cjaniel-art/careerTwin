import {
  CORE_2_CONFIG,
  type ApplicationRecommendation,
  type TargetRoleRecommendation,
} from "@/config/engine/core2";
import type { ConfidenceLevel } from "@/config/engine/confidence";
import type { AppliedCap, IaoBand } from "./iao";

/**
 * Deterministic recommendation precedence for Core 2 — the AI never chooses
 * this (PRD 03 §31: "A IA não poderá ignorar ou reordenar essa precedência").
 * Two separate, non-interchangeable rule sets: job-specific (§31) and
 * target-role (§32). A result must contain exactly one of the two shapes
 * (PRD 03 §34: "não deverão coexistir uma recomendação de vaga e uma
 * recomendação de cargo no mesmo resultado").
 */

export interface RecommendationSignals {
  band: IaoBand;
  confidenceLevel: ConfidenceLevel;
  appliedCaps: AppliedCap[];
  /** True when a hard structural precondition is missing (no confirmed job/role
   *  data, no approved role reference, unresolved critical conflicts, etc.) —
   *  always wins over every other rule (index 0 in both precedence chains). */
  insufficientData: boolean;
}

function bandKey(band: IaoBand): "iao_0_39" | "iao_40_59" | "iao_60_79" | "iao_80_100" {
  switch (band) {
    case "low_observable_fit":
      return "iao_0_39";
    case "partial_fit":
      return "iao_40_59";
    case "good_observable_fit":
      return "iao_60_79";
    case "high_observable_fit":
      return "iao_80_100";
  }
}

/** PRD 03 §31 — 8-level precedence, first applicable rule wins. */
export function determineApplicationRecommendation(
  signals: RecommendationSignals,
): ApplicationRecommendation {
  if (signals.insufficientData || signals.confidenceLevel === "low") return "insufficient_data";
  if (signals.appliedCaps.includes("blocking_requirement")) return "do_not_prioritize";
  if (signals.appliedCaps.includes("seniority_mismatch")) return "do_not_prioritize";
  if (signals.appliedCaps.includes("multiple_critical_mandatory_gaps")) {
    return "develop_gaps_before_applying";
  }

  const key = bandKey(signals.band);
  const order = CORE_2_CONFIG.iao.recommendationPrecedence;
  const index = order.indexOf(key);
  const belowIndex = order.indexOf("iao_40_59");
  const goodIndex = order.indexOf("iao_60_79");
  const highIndex = order.indexOf("iao_80_100");

  if (index === highIndex) return "apply_now";
  if (index === goodIndex) return "apply_with_adjustments";
  if (index === belowIndex) return "develop_gaps_before_applying";
  return "do_not_prioritize"; // iao_0_39
}

/** PRD 03 §32 — target-role precedence (structural rules first, then IAO bands). */
export function determineTargetRoleRecommendation(
  signals: RecommendationSignals,
): TargetRoleRecommendation {
  if (signals.insufficientData || signals.confidenceLevel === "low") return "insufficient_data";
  if (
    signals.appliedCaps.includes("seniority_mismatch") ||
    signals.appliedCaps.includes("blocking_requirement")
  ) {
    return "reassess_target_context";
  }
  if (signals.appliedCaps.includes("multiple_critical_mandatory_gaps")) {
    return "develop_before_prioritizing";
  }

  switch (signals.band) {
    case "high_observable_fit":
      return "ready_to_prioritize";
    case "good_observable_fit":
      return "prioritize_with_adjustments";
    case "partial_fit":
      return "develop_before_prioritizing";
    case "low_observable_fit":
      return "reassess_target_context";
  }
}
