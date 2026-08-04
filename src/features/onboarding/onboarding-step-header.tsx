import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEP_IDS, STEP_META, STEP_PROGRESS_PERCENT, type OnboardingStepId } from "./step-config";

function MobileWordmark() {
  return (
    <Image
      src="/logo-onboarding-mobile.svg"
      alt="CareerTwin"
      width={210.8}
      height={51}
      style={{ width: "210.8px", height: "51px" }}
    />
  );
}

function BackButton({ backHref }: { backHref: string }) {
  return (
    <Link
      href={backHref}
      aria-label="Voltar"
      className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background shadow-xs"
    >
      <ArrowLeft className="size-4" />
    </Link>
  );
}

function StepsRow({ activeStep, completedSteps }: { activeStep: OnboardingStepId; completedSteps: OnboardingStepId[] }) {
  return (
    <ol className="flex min-w-0 items-start overflow-x-auto">
      {ONBOARDING_STEP_IDS.map((step, index) => {
        const meta = STEP_META[step];
        const isActive = step === activeStep;
        const isDone = completedSteps.includes(step) && !isActive;
        return (
          <li key={step} className="flex items-start">
            <div className="flex flex-col items-center gap-[3px]">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full font-nunito text-base",
                  isDone && "bg-success text-success-foreground",
                  isActive && "bg-primary text-primary-foreground",
                  !isDone && !isActive && "border border-[#bdbdbd] text-[#bdbdbd]",
                )}
              >
                {isDone ? <Check className="size-4" /> : meta.number}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap font-nunito text-sm",
                  isDone && "text-success",
                  isActive && "text-primary",
                  !isDone && !isActive && "text-[#abb6bf]",
                )}
              >
                {meta.label}
              </span>
            </div>
            {index < ONBOARDING_STEP_IDS.length - 1 ? (
              <div className="flex w-[41px] flex-col items-start px-2 pb-2 pt-[15px]">
                <div className={cn("h-px w-full", isDone ? "bg-success" : "bg-[#bdbdbd]")} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function ProgressBar({ activeStep }: { activeStep: OnboardingStepId }) {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width]"
        style={{ width: `${STEP_PROGRESS_PERCENT[activeStep]}%` }}
      />
    </div>
  );
}

/**
 * Back button + 4-step indicator + thin progress bar, matching the Figma stepper exactly.
 * Mobile (no photo panel, so no wordmark elsewhere) puts the back button and a centered wordmark in their
 * own row above the steps, with a 19px steps→progressbar gap and a 24px gap to the content below — desktop
 * keeps the back button inline with the steps and uses 0px / 40px for those same two gaps, per the Figma refs.
 */
export function OnboardingStepHeader({
  activeStep,
  completedSteps,
  backHref,
}: {
  activeStep: OnboardingStepId;
  completedSteps: OnboardingStepId[];
  backHref: string;
}) {
  return (
    <div className="mb-6 w-full lg:mb-10">
      <div className="mb-10 flex items-center justify-between lg:hidden">
        <BackButton backHref={backHref} />
        <MobileWordmark />
        <div className="size-9" aria-hidden />
      </div>
      <div className="flex flex-col gap-[19px] lg:hidden">
        <StepsRow activeStep={activeStep} completedSteps={completedSteps} />
        <ProgressBar activeStep={activeStep} />
      </div>

      <div className="hidden items-center justify-between gap-6 py-6 lg:flex">
        <BackButton backHref={backHref} />
        <StepsRow activeStep={activeStep} completedSteps={completedSteps} />
      </div>
      <div className="hidden lg:block">
        <ProgressBar activeStep={activeStep} />
      </div>
    </div>
  );
}
