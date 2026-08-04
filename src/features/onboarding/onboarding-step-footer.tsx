import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";

/**
 * Separator + back/continue buttons, matching the Figma footer (step 1 has no back button, step 4 uses the
 * success color). Figma pins this to the bottom of the frame (absolute bottom-0) rather than a fixed gap
 * below the content, so `mt-auto` — not a fixed margin — is what reproduces that here.
 */
export function OnboardingStepFooter({
  backHref,
  continueLabel = "Continuar",
  variant = "primary",
  disabled,
  continueSlot,
}: {
  backHref?: string;
  continueLabel?: string;
  variant?: "primary" | "success";
  disabled?: boolean;
  /** Overrides the default submit button — used by steps that can skip straight to the next step without resubmitting. */
  continueSlot?: React.ReactNode;
}) {
  return (
    <div className="mt-auto flex w-full flex-col items-start">
      <div className="flex w-full flex-col items-start py-4">
        <div className="h-px w-full bg-border" />
      </div>
      <div className="flex w-full items-center gap-5">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Voltar"
            className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background shadow-xs"
          >
            <ArrowLeft className="size-4" />
          </Link>
        ) : null}
        {continueSlot ?? (
          <SubmitButton variant={variant} disabled={disabled} className="h-9 flex-1 rounded-lg">
            {continueLabel}
          </SubmitButton>
        )}
      </div>
    </div>
  );
}
