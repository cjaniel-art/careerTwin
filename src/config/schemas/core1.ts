import { z } from "zod";
import { evidenceReferenceSchema } from "./evidence";
import { IPP_DIMENSIONS } from "@/config/engine/core1";

/**
 * Schema do Core 1 (P-005/P-006/P-010) — Prompts e Schemas §8.
 * Deliberately excludes: the final IPP, confidence score, priority, and
 * priorityOrder — those are backend-only outputs (PRD 02 §19-21, Guardrails §5).
 */
export const SCHEMA_VERSION_CORE_1 = "core-1/1.2" as const;

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

const gapSchema = z.object({
  type: z.enum(["competencia", "comunicacao", "evidencia", "posicionamento", "desconhecida"]),
  description: z.string(),
  evidenceRefs: z.array(evidenceReferenceSchema),
  missingInformation: z.array(z.string()),
});

const strengthSchema = z.object({
  type: z.enum(["competencia", "comunicacao", "evidencia", "posicionamento", "desconhecida"]),
  description: z.string(),
  evidenceRefs: z.array(evidenceReferenceSchema),
});

/**
 * Stage 1 of Core 1 (P-005) — dimension classification + diagnosis. Split
 * from recommendation generation (below) because the single combined call
 * reasoning over 7 dimensions and up to 8 evidence-grounded recommendations
 * routinely exceeded Vercel's 60s function ceiling in production. Each stage
 * is its own request, chained by the caller (mirrors the résumé/LinkedIn
 * read+extract split in features/onboarding/pipeline.ts).
 *
 * `experienceTranslations`/`actionCandidates`/`authenticityValidation` from the
 * original combined schema are dropped, not carried into either stage: nothing
 * downstream ever persisted or read them. `strengths` (mirrors `gaps` — a
 * structured list, not the single-sentence `diagnosis.mainStrength` headline)
 * was re-added so the report can list every strength the model identified,
 * not just one (see StrengthsSection).
 */
export const core1DimensionsOutputSchema = z.object({
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
  strengths: z.array(strengthSchema),
  gaps: z.array(gapSchema),
  warnings: z.array(z.string()),
});

/** Stage 2 of Core 1 (P-005) — recommendations, generated from stage 1's diagnosis/gaps as context. */
export const core1RecommendationsOutputSchema = z.object({
  recommendations: z.array(recommendationCandidateSchema),
  warnings: z.array(z.string()),
});

export type Core1DimensionsOutput = z.infer<typeof core1DimensionsOutputSchema>;
export type Core1RecommendationsOutput = z.infer<typeof core1RecommendationsOutputSchema>;
export type Core1Gap = z.infer<typeof gapSchema>;
export type Core1Strength = z.infer<typeof strengthSchema>;
