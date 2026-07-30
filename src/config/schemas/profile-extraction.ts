import { z } from "zod";
import { evidenceReferenceSchema } from "./evidence";

/**
 * Schema de extração profissional (P-001/P-002) — Prompts e Schemas §6.
 * `schemaVersion` must match exactly; a validation failure here means the
 * output is rejected and retried per the 3-stage repair strategy (§12), never
 * persisted as-is (Guardrails §5/§13).
 */
export const SCHEMA_VERSION_PROFILE_EXTRACTION = "profile-extraction/1.1" as const;

const confirmationStatusSchema = z.enum([
  "extracted", "confirmed", "corrected", "added", "rejected", "in_conflict", "unconfirmed",
]);

export const profileExtractionSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION_PROFILE_EXTRACTION),
  documentType: z.enum(["resume", "linkedin"]),
  sourceId: z.string(),
  language: z.string(),
  extractionStatus: z.enum(["complete", "partial", "insufficient_content", "failed"]),
  professionalIdentity: z.object({
    currentArea: z.string(),
    currentRole: z.string(),
    observedSeniority: z.object({
      value: z.enum(["intern", "junior", "mid", "senior"]),
      status: z.enum(["fact", "inference", "hypothesis", "suggestion"]),
      extractionConfidence: z.number().min(0).max(1),
    }),
  }),
  experiences: z.array(
    z.object({
      experienceKey: z.string(),
      company: z.string(),
      role: z.string(),
      startDate: z.string(),
      endDate: z.string().nullable(),
      responsibilities: z.array(z.string()),
      projects: z.array(z.string()),
      tools: z.array(z.string()),
      results: z.array(z.string()),
      evidenceRefs: z.array(evidenceReferenceSchema),
      confirmationStatus: confirmationStatusSchema,
    }),
  ),
  competencies: z.array(
    z.object({
      originalTerm: z.string(),
      normalizedTerm: z.string(),
      skillType: z.enum([
        "technical", "method", "domain", "management", "leadership",
        "communication", "collaboration", "business", "language", "other",
      ]),
      skillDomain: z.string(),
      evidenceRefs: z.array(evidenceReferenceSchema),
      extractionConfidence: z.number().min(0).max(1),
      confirmationStatus: confirmationStatusSchema,
    }),
  ),
  tools: z.array(
    z.object({
      originalTerm: z.string(),
      normalizedTerm: z.string(),
      toolCategory: z.string(),
      evidenceRefs: z.array(evidenceReferenceSchema),
      extractionConfidence: z.number().min(0).max(1),
      confirmationStatus: confirmationStatusSchema,
    }),
  ),
  education: z.array(z.unknown()),
  certifications: z.array(z.unknown()),
  conflicts: z.array(
    z.object({
      conflictKey: z.string(),
      field: z.string(),
      sourceValues: z.array(z.unknown()),
      severity: z.enum(["low", "medium", "high"]),
      requiresUserReview: z.boolean(),
    }),
  ),
  warnings: z.array(z.string()),
});

export type ProfileExtraction = z.infer<typeof profileExtractionSchema>;
