import { z } from "zod";

// PRD 00 §5: "política exata de senha" is a decision pendente — this is a
// provisional minimum, not a final policy (docs/implementation/open-decisions.md #9).
const passwordSchema = z.string().min(8, "A senha deve ter pelo menos 8 caracteres.");

export const signUpSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: passwordSchema,
  acceptedTerms: z.literal(true, { errorMap: () => ({ message: "É necessário aceitar os Termos de Uso." }) }),
  acceptedPrivacy: z.literal(true, {
    errorMap: () => ({ message: "É necessário aceitar a Política de Privacidade." }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
});

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });
