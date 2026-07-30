import { z } from "zod";
import { evidenceReferenceSchema } from "./evidence";
import { IPP_DIMENSIONS } from "@/config/engine/core1";

/**
 * Schema do Core 1 (P-005/P-006/P-010) — Prompts e Schemas §8.
 * Deliberately excludes: the final IPP, confidence score, priority, and
 * priorityOrder — those are backend-only outputs (PRD 02 §19-21, Guardrails §5).
 */
export const SCHEMA_VERSION_CORE_1 = "core-1/1.1" as const;

export const recommendationCandidateSchema = z.object({
  recommendationKey: z.string(),
  category: z.enum(["competencia", "comunicacao", "evidencia", "posicionamento"]),
  title: z.string(),
  problem: z.string(),
  reasoning: z.string(),
  evidenceRefs: z.array(evidenceReferenceSchema),
  missingEvidence: z.array(z.string()),
  suggestedAction: z.string(),
  expectedOutcome: z.string(),
  impact: z.number().int().min(1).max(5),
  effort: z.number().int().min(1).max(5),
  urgency: z.number().int().min(1).max(5),
  confidence: z.number().int().min(1).max(5),
  completionCriteria: z.string(),
});

export const core1OutputSchema = z.object({
  analysisType: z.literal("profile_analysis"),
  profileVersionId: z.string(),
  targetContextVersionId: z.string(),
  promptVersion: z.string(),
  schemaVersion: z.literal(SCHEMA_VERSION_CORE_1),
  rubricVersion: z.string(),
  confidenceAssessment: z.object({
    reasons: z.array(z.string()),
    missingInformation: z.array(z.string()),
    conflicts: z.array(z.string()),
  }),
  dimensionAssessments: z.array(
    z.object({
      dimension: z.enum(IPP_DIMENSIONS),
      rubricLevel: z.number().int().min(0).max(4),
      reasoning: z.string(),
      evidenceRefs: z.array(evidenceReferenceSchema),
      relatedRecommendationKeys: z.array(z.string()),
    }),
  ),
  diagnosis: z.object({
    summary: z.string(),
    mainStrength: z.string(),
    mainGap: z.string(),
    nextBestAction: z.string(),
  }),
  strengths: z.array(
    z.object({ title: z.string(), description: z.string(), evidenceRefs: z.array(evidenceReferenceSchema) }),
  ),
  gaps: z.array(
    z.object({
      type: z.enum(["competencia", "comunicacao", "evidencia", "posicionamento", "desconhecida"]),
      description: z.string(),
      evidenceRefs: z.array(evidenceReferenceSchema),
      missingInformation: z.array(z.string()),
    }),
  ),
  recommendations: z.array(recommendationCandidateSchema),
  experienceTranslations: z.array(
    z.object({
      originalText: z.string(),
      identifiedIssue: z.string(),
      implicitSkills: z.array(z.string()),
      suggestedText: z.string(),
      marketTerms: z.array(z.string()),
      evidenceRefs: z.array(evidenceReferenceSchema),
      authenticityWarning: z.string().optional(),
    }),
  ),
  actionCandidates: z.array(z.unknown()),
  authenticityValidation: z.object({ warnings: z.array(z.string()), blockedClaims: z.array(z.string()) }),
  warnings: z.array(z.string()),
});

export type Core1Output = z.infer<typeof core1OutputSchema>;
