import { cn } from "@/lib/utils";
import type { OnboardingStep } from "./get-state";

const STEP_LABELS: Record<OnboardingStep, string> = {
  welcome: "Boas-vindas",
  identification: "Identificação",
  resume_upload: "Currículo",
  linkedin_upload: "LinkedIn",
  processing: "Processamento",
  review: "Revisão",
  target_context: "Contexto-alvo",
  completed: "Conclusão",
};

const STEP_ORDER: OnboardingStep[] = [
  "identification",
  "resume_upload",
  "linkedin_upload",
  "processing",
  "review",
  "target_context",
  "completed",
];

export function OnboardingProgress({ currentStep }: { currentStep: OnboardingStep }) {
  const effectiveStep = currentStep === "welcome" ? "identification" : currentStep;
  const currentIndex = STEP_ORDER.indexOf(effectiveStep);

  return (
    <ol className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
      {STEP_ORDER.map((step, index) => (
        <li
          key={step}
          className={cn(
            "flex items-center gap-1.5",
            index === currentIndex && "text-primary",
            index < currentIndex && "text-foreground",
          )}
        >
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
              index === currentIndex && "border-primary bg-primary text-primary-foreground",
              index < currentIndex && "border-foreground bg-foreground text-background",
              index > currentIndex && "border-border",
            )}
          >
            {index + 1}
          </span>
          {STEP_LABELS[step]}
        </li>
      ))}
    </ol>
  );
}
