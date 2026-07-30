import { z } from "zod";

/** Shared by every AI output schema below (Prompts e Schemas §6-10). */
export const evidenceReferenceSchema = z.object({
  sourceType: z.enum(["resume", "linkedin", "user"]),
  sourceId: z.string(),
  excerpt: z.string(),
  extractionConfidence: z.number().min(0).max(1).optional(),
});
export type EvidenceReference = z.infer<typeof evidenceReferenceSchema>;
