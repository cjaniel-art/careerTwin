import type { SupabaseClient } from "@supabase/supabase-js";
import type { OnboardingStepId } from "./step-config";

/**
 * Server-persisted onboarding state (PRD 01 §10: "sistema registra o estado
 * do onboarding por usuário [...] não apenas parâmetros de URL"). Derived
 * fresh from the database on every page load — never trust client state.
 */
export type OnboardingStep =
  | "identification"
  | "resume_upload"
  | "linkedin_upload"
  | "processing"
  | "target_context"
  | "completed";

export interface DocumentSummary {
  id: string;
  status: string;
  originalFilename: string | null;
}

export interface OnboardingState {
  step: OnboardingStep;
  /** Furthest of the 4 numbered Figma steps the user has reached — bounds how far "voltar" can go and where the wizard lands by default. */
  numberedStep: OnboardingStepId;
  completedNumberedSteps: OnboardingStepId[];
  personalDataSaved: boolean;
  personalData: { fullName: string; city: string | null; state: string | null } | null;
  resumeDocumentId: string | null;
  resumeStatus: string | null;
  resumeDocument: DocumentSummary | null;
  linkedinDocumentId: string | null;
  linkedinStatus: string | null;
  linkedinDocument: DocumentSummary | null;
  profileId: string | null;
  profileVersionId: string | null;
  targetContextConfirmed: boolean;
  targetContext: { targetArea: string; targetRole: string; desiredSeniority: string } | null;
}

export async function getOnboardingState(supabase: SupabaseClient, userId: string): Promise<OnboardingState> {
  const [{ data: personalData }, { data: documents }, { data: profile }, { data: targetContext }] =
    await Promise.all([
      supabase.from("personal_data").select("full_name, city, state").eq("user_id", userId).maybeSingle(),
      supabase
        .from("documents")
        .select("id, document_type, status, original_filename")
        .eq("user_id", userId)
        .in("document_type", ["resume", "linkedin"])
        .neq("status", "deleted")
        .order("created_at", { ascending: false }),
      supabase
        .from("professional_profiles")
        .select("id, current_version_id")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase.from("target_contexts").select("id, current_version_id, status").eq("user_id", userId).maybeSingle(),
    ]);

  const { data: targetContextVersion } = targetContext?.current_version_id
    ? await supabase
        .from("target_context_versions")
        .select("target_area, target_role, desired_seniority")
        .eq("id", targetContext.current_version_id)
        .maybeSingle()
    : { data: null };

  const resume = documents?.find((d) => d.document_type === "resume") ?? null;
  const linkedin = documents?.find((d) => d.document_type === "linkedin") ?? null;

  const personalDataSaved = !!personalData;
  const resumeReady = resume?.status === "ready" || resume?.status === "insufficient_content";
  const linkedinReady = linkedin?.status === "ready" || linkedin?.status === "insufficient_content";
  const targetContextConfirmed = targetContext?.status === "confirmed";

  let step: OnboardingStep;
  if (!personalDataSaved) step = "identification";
  else if (!resume) step = "resume_upload";
  else if (!linkedin) step = "linkedin_upload";
  else if (!resumeReady || !linkedinReady) step = "processing";
  else if (!targetContextConfirmed) step = "target_context";
  else step = "completed";

  const numberedStep: OnboardingStepId =
    step === "identification"
      ? "personal-data"
      : step === "resume_upload"
        ? "resume"
        : step === "target_context" || step === "completed"
          ? "target-context"
          : "linkedin"; // linkedin_upload, processing: LinkedIn is the furthest *numbered* step reached — processing is a transitional screen, not a 5th step.

  const completedNumberedSteps: OnboardingStepId[] = (
    ["personal-data", "resume", "linkedin", "target-context"] as OnboardingStepId[]
  ).filter((s) => {
    if (s === "personal-data") return personalDataSaved;
    if (s === "resume") return !!resume;
    if (s === "linkedin") return !!linkedin;
    return targetContextConfirmed;
  });

  return {
    step,
    numberedStep,
    completedNumberedSteps,
    personalDataSaved,
    personalData: personalData ? { fullName: personalData.full_name, city: personalData.city, state: personalData.state } : null,
    resumeDocumentId: resume?.id ?? null,
    resumeStatus: resume?.status ?? null,
    resumeDocument: resume ? { id: resume.id, status: resume.status, originalFilename: resume.original_filename } : null,
    linkedinDocumentId: linkedin?.id ?? null,
    linkedinStatus: linkedin?.status ?? null,
    linkedinDocument: linkedin ? { id: linkedin.id, status: linkedin.status, originalFilename: linkedin.original_filename } : null,
    profileId: profile?.id ?? null,
    profileVersionId: profile?.current_version_id ?? null,
    targetContextConfirmed,
    targetContext: targetContextVersion
      ? {
          targetArea: targetContextVersion.target_area,
          targetRole: targetContextVersion.target_role,
          desiredSeniority: targetContextVersion.desired_seniority,
        }
      : null,
  };
}
