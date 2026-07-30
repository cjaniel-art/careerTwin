import { z } from "zod";
import { evidenceReferenceSchema } from "./evidence";

/**
 * Schema do Core 2 (P-009/P-010) — Prompts e Schemas §10.
 * Deliberately excludes: referenceValue, match factor, requirement weight,
 * weighted contribution, IAO raw/final, applied caps, and the final
 * recommendation — all backend-only (PRD 03 §18/§34, Guardrails §5).
 *
 * Note: gapType here uses the Portuguese values from the literal AI schema —
 * map through GAP_TYPE_FROM_AI_SCHEMA (src/config/engine/core2.ts) before
 * persisting to requirement_assessments.gap_type (English contract enum, see
 * docs/implementation/open-decisions.md #14).
 */
export const SCHEMA_VERSION_CORE_2 = "core-2/1.1" as const;

const AI_GAP_TYPES_PT = ["competencia", "experiencia", "formacao_certificacao", "comunicacao", "evidencia", "posicionamento", "desconhecida"] as const;

export const core2OutputSchema = z.object({
  analysisType: z.literal("job_fit_analysis"),
  profileVersionId: z.string(),
  targetContextVersionId: z.string(),
  opportunityVersionId: z.string(),
  promptVersion: z.string(),
  schemaVersion: z.literal(SCHEMA_VERSION_CORE_2),
  rubricVersion: z.string(),
  confidenceAssessment: z.object({
    reasons: z.array(z.string()),
    missingInformation: z.array(z.string()),
    conflicts: z.array(z.string()),
  }),
  requirementAssessments: z.array(
    z.object({
      requirementId: z.string(),
      matchStatus: z.enum([
        "confirmed_match", "partial_match", "communication_gap", "evidence_gap",
        "unknown", "not_observed", "confirmed_mismatch",
      ]),
      reasoning: z.string(),
      profileEvidence: z.array(evidenceReferenceSchema),
      gapType: z.enum(AI_GAP_TYPES_PT).optional(),
      assessmentConfidence: z.number().min(0).max(1),
    }),
  ),
  seniorityAssessment: z.object({
    expected: z.enum(["intern", "junior", "mid", "senior"]),
    observed: z.enum(["insufficient_data", "intern", "junior", "mid", "senior"]),
    signals: z.array(z.string()),
    gaps: z.array(z.string()),
    assessmentConfidence: z.number().min(0).max(1),
  }),
  strengths: z.array(z.unknown()),
  gaps: z.array(z.unknown()),
  risks: z.array(
    z.object({
      riskKey: z.string(),
      type: z.enum([
        "blocking_requirement", "mandatory_gap", "seniority_mismatch", "location_mismatch",
        "work_authorization", "language_requirement", "certification_requirement",
        "insufficient_evidence", "ambiguous_requirement", "data_quality", "target_misalignment",
      ]),
      title: z.string(),
      description: z.string(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      requirementIds: z.array(z.string()),
      evidenceRefs: z.array(evidenceReferenceSchema),
      mitigableBeforeApplication: z.boolean(),
    }),
  ),
  // Candidate only — never the final, backend-validated recommendation.
  recommendationCandidate: z.object({
    scope: z.enum(["application", "target_role"]),
    type: z.string(),
    reasoning: z.string(),
    relatedRequirementIds: z.array(z.string()),
  }),
  actionCandidates: z.array(z.unknown()),
  authenticityValidation: z.object({ warnings: z.array(z.string()), blockedClaims: z.array(z.string()) }),
  warnings: z.array(z.string()),
});

export type Core2Output = z.infer<typeof core2OutputSchema>;
