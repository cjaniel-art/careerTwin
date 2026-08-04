/** The four numbered onboarding steps shown in the Figma stepper (Dados pessoais → Currículo → LinkedIn → Objetivo profissional). */
export const ONBOARDING_STEP_IDS = ["personal-data", "resume", "linkedin", "target-context"] as const;
export type OnboardingStepId = (typeof ONBOARDING_STEP_IDS)[number];

export const STEP_META: Record<OnboardingStepId, { number: number; label: string }> = {
  "personal-data": { number: 1, label: "Dados pessoais" },
  resume: { number: 2, label: "Currículo" },
  linkedin: { number: 3, label: "Linkedin" },
  "target-context": { number: 4, label: "objetivo" },
};

/** Matches the exact fill widths from the Figma progress bar (not a linear 25/50/75/100 split). */
export const STEP_PROGRESS_PERCENT: Record<OnboardingStepId, number> = {
  "personal-data": 17,
  resume: 33,
  linkedin: 62,
  "target-context": 85,
};

export function stepPath(step: OnboardingStepId): string {
  return `/onboarding?step=${step}`;
}
