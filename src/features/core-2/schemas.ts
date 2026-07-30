import { z } from "zod";
import { CORE_2_CONFIG } from "@/config/engine/core2";

export const submitOpportunitySchema = z.object({
  title: z.string().trim().optional(),
  company: z.string().trim().optional(),
  referenceUrl: z.string().trim().optional(),
});

export const ALLOWED_OPPORTUNITY_EXTENSIONS = CORE_2_CONFIG.opportunity.allowedExtensions;
export const MAX_OPPORTUNITY_FILE_SIZE_BYTES = CORE_2_CONFIG.opportunity.maxFileSizeMb * 1024 * 1024;
