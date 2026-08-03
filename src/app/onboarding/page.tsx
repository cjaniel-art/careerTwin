import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { getOnboardingState } from "@/features/onboarding/get-state";
import { logoutAction } from "@/features/auth/actions";
import { Wordmark } from "@/components/wordmark";
import { SubmitButton } from "@/components/submit-button";
import { OnboardingProgress } from "@/features/onboarding/onboarding-progress";
import { WelcomeStep } from "@/features/onboarding/steps/welcome-step";
import { IdentificationStep } from "@/features/onboarding/steps/identification-step";
import { DocumentUploadStep } from "@/features/onboarding/steps/document-upload-step";
import { ProcessingStep } from "@/features/onboarding/steps/processing-step";
import { ReviewStep } from "@/features/onboarding/steps/review-step";
import { TargetContextStep } from "@/features/onboarding/steps/target-context-step";
import { CompletionStep } from "@/features/onboarding/steps/completion-step";

export const metadata = { title: "Onboarding — CareerTwin" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/onboarding");

  const state = await getOnboardingState(supabase, user.id);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Wordmark />
        <form action={logoutAction}>
          <SubmitButton variant="tertiary" size="sm">
            Sair
          </SubmitButton>
        </form>
      </div>

      <OnboardingProgress currentStep={state.step} />

      <div className="mt-8">
        {state.step === "welcome" || state.step === "identification" ? <WelcomeStep /> : null}
        {state.step === "identification" ? <IdentificationStep /> : null}
        {state.step === "resume_upload" ? (
          <DocumentUploadStep
            documentType="resume"
            title="Envio do currículo"
            description="Envie seu currículo em PDF ou DOCX. Também é possível colar o conteúdo em texto."
          />
        ) : null}
        {state.step === "linkedin_upload" ? (
          <DocumentUploadStep
            documentType="linkedin"
            title="Envio do LinkedIn"
            description="Envie o PDF exportado do LinkedIn ou cole o conteúdo do seu perfil."
          />
        ) : null}
        {state.step === "processing" ? (
          <ProcessingStep resumeStatus={state.resumeStatus} linkedinStatus={state.linkedinStatus} />
        ) : null}
        {state.step === "review" ? <ReviewStep userId={user.id} /> : null}
        {state.step === "target_context" ? <TargetContextStep /> : null}
        {state.step === "completed" ? <CompletionStep /> : null}
      </div>
    </main>
  );
}
