import { z } from "zod";
import { ONBOARDING_CONFIG } from "@/config/engine/onboarding";

export const personalDataSchema = z.object({
  fullName: z.string().trim().min(1, "Informe seu nome completo."),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
});

export const targetContextSchema = z.object({
  targetArea: z.string().trim().min(1, "Informe a área de interesse."),
  targetRole: z.string().trim().min(1, "Informe o cargo-alvo."),
  desiredSeniority: z.enum(["intern", "junior", "mid", "senior"], {
    errorMap: () => ({ message: "Selecione a senioridade desejada." }),
  }),
});

export const manualExperienceSchema = z.object({
  companyName: z.string().trim().min(1, "Informe a empresa ou contexto."),
  roleTitle: z.string().trim().min(1, "Informe o cargo ou função."),
  description: z.string().trim().optional(),
});

export const ALLOWED_DOCUMENT_EXTENSIONS = ONBOARDING_CONFIG.documents.allowedExtensions;
export const MAX_FILE_SIZE_BYTES = ONBOARDING_CONFIG.documents.maxFileSizeMb * 1024 * 1024;
