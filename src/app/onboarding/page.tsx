import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { getOnboardingState } from "@/features/onboarding/get-state";
import { OnboardingShell } from "@/features/onboarding/onboarding-shell";
import { ONBOARDING_STEP_IDS, stepPath, type OnboardingStepId } from "@/features/onboarding/step-config";
import { IdentificationStep } from "@/features/onboarding/steps/identification-step";
import { DocumentUploadStep } from "@/features/onboarding/steps/document-upload-step";
import { TargetContextStep } from "@/features/onboarding/steps/target-context-step";
import { CompletionStep } from "@/features/onboarding/steps/completion-step";

export const metadata = { title: "Onboarding — CareerTwin" };
export const dynamic = "force-dynamic";
// Server Actions inherit the segment's limit. Without this, the AI stages are
// killed at the platform default, well before they can finish. 60s is the
// Hobby-plan ceiling — raising it further requires a plan upgrade.
export const maxDuration = 60;

/** Renders one of the 4 numbered Figma steps directly — used both for the natural flow and for "voltar" to an already-completed step. */
function renderNumberedStep(
  step: OnboardingStepId,
  state: Awaited<ReturnType<typeof getOnboardingState>>,
) {
  const index = ONBOARDING_STEP_IDS.indexOf(step);
  const backHref = index > 0 ? stepPath(ONBOARDING_STEP_IDS[index - 1]!) : "/";

  switch (step) {
    case "personal-data":
      return <IdentificationStep defaultValues={state.personalData} />;
    case "resume":
      return (
        <DocumentUploadStep
          documentType="resume"
          activeStep="resume"
          backHref={backHref}
          completedSteps={state.completedNumberedSteps}
          heading="Envie seu currículo"
          subheading="Adicione seu currículo em PDF ou DOCX. Também é possível colar o conteúdo em texto."
          dropzoneTitle="Adicione seu currículo"
          contentLabel="Conteúdo do currículo"
          contentPlaceholder="Cole aqui o texto completo do seu currículo"
          existingDocument={state.resumeDocument}
        />
      );
    case "linkedin":
      return (
        <DocumentUploadStep
          documentType="linkedin"
          activeStep="linkedin"
          backHref={backHref}
          completedSteps={state.completedNumberedSteps}
          heading="Adicione seu perfil do LinkedIn"
          subheading="Envie o PDF exportado do LinkedIn ou cole abaixo as informações do seu perfil."
          dropzoneTitle="Adicione seu perfil"
          contentLabel="Conteúdo do LinkedIn"
          contentPlaceholder="Cole aqui as informações do seu perfil do LinkedIn"
          existingDocument={state.linkedinDocument}
        />
      );
    case "target-context":
      return <TargetContextStep backHref={backHref} completedSteps={state.completedNumberedSteps} defaultValues={state.targetContext} />;
  }
}

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const { step: requestedStepParam } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/onboarding");

  const state = await getOnboardingState(supabase, user.id);

  // "Voltar" support: a valid ?step= that isn't further than the furthest step actually reached always wins,
  // regardless of the natural business state (RF: "mantenha os dados preenchidos caso o usuário volte").
  const requestedStep = ONBOARDING_STEP_IDS.find((id) => id === requestedStepParam);
  const furthestIndex = ONBOARDING_STEP_IDS.indexOf(state.numberedStep);
  if (requestedStep && ONBOARDING_STEP_IDS.indexOf(requestedStep) <= furthestIndex) {
    return <OnboardingShell>{renderNumberedStep(requestedStep, state)}</OnboardingShell>;
  }

  // Full-page design (no OnboardingShell photo panel) per Figma 180:995/199:1375.
  if (state.step === "completed") {
    return <CompletionStep />;
  }

  return (
    <OnboardingShell>
      {state.step === "identification" ? renderNumberedStep("personal-data", state) : null}
      {state.step === "resume_upload" ? renderNumberedStep("resume", state) : null}
      {state.step === "linkedin_upload" ? renderNumberedStep("linkedin", state) : null}
      {state.step === "target_context" ? renderNumberedStep("target-context", state) : null}
    </OnboardingShell>
  );
}
