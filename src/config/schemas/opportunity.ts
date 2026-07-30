import { z } from "zod";
import { REQUIREMENT_CATEGORIES } from "@/config/engine/core2";

/**
 * Schema de oportunidade estruturada (P-007/P-008) — Prompts e Schemas §9.
 * "A simples presença de um item em uma lista não deverá transformá-lo
 * automaticamente em requisito obrigatório" — criticality classification is
 * an explicit AI output field, validated, never inferred by list position.
 */
export const SCHEMA_VERSION_OPPORTUNITY_STRUCTURE = "opportunity-structure/1.1" as const;

export const opportunityRequirementSchema = z.object({
  requirementId: z.string(),
  description: z.string(),
  category: z.enum(REQUIREMENT_CATEGORIES),
  criticality: z.enum(["mandatory", "desired", "differential", "complementary", "blocking"]),
  isCritical: z.boolean(),
  applicability: z.enum(["applicable", "not_applicable", "unknown"]),
  extractionConfidence: z.number().min(0).max(1),
  sourceExcerpt: z.string(),
  ambiguous: z.boolean(),
  userConfirmed: z.boolean(),
});

export const opportunityStructureSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION_OPPORTUNITY_STRUCTURE),
  opportunityType: z.enum(["job", "target_role"]),
  opportunityVersionId: z.string(),
  title: z.string(),
  company: z.string(),
  sourceType: z.enum(["pasted_text", "pdf", "manual_entry"]),
  requirements: z.array(opportunityRequirementSchema),
  responsibilities: z.array(z.string()),
  senioritySignals: z.array(z.string()),
  ambiguities: z.array(z.string()),
  warnings: z.array(z.string()),
});

export type OpportunityStructure = z.infer<typeof opportunityStructureSchema>;
