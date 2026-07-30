import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-persisted onboarding state (PRD 01 §10: "sistema registra o estado
 * do onboarding por usuário [...] não apenas parâmetros de URL"). Derived
 * fresh from the database on every page load — never trust client state.
 */
export type OnboardingStep =
  | "welcome"
  | "identification"
  | "resume_upload"
  | "linkedin_upload"
  | "processing"
  | "review"
  | "target_context"
  | "completed";

export interface OnboardingState {
  step: OnboardingStep;
  personalDataSaved: boolean;
  resumeDocumentId: string | null;
  resumeStatus: string | null;
  linkedinDocumentId: string | null;
  linkedinStatus: string | null;
  profileId: string | null;
  profileVersionId: string | null;
  profileConfirmed: boolean;
  targetContextConfirmed: boolean;
}

export async function getOnboardingState(supabase: SupabaseClient, userId: string): Promise<OnboardingState> {
  const [{ data: personalData }, { data: documents }, { data: profile }, { data: targetContext }] =
    await Promise.all([
      supabase.from("personal_data").select("user_id").eq("user_id", userId).maybeSingle(),
      supabase
        .from("documents")
        .select("id, document_type, status")
        .eq("user_id", userId)
        .in("document_type", ["resume", "linkedin"])
        .order("created_at", { ascending: false }),
      supabase
        .from("professional_profiles")
        .select("id, current_version_id, status")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("target_contexts")
        .select("id, current_version_id, status")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

  const resume = documents?.find((d) => d.document_type === "resume") ?? null;
  const linkedin = documents?.find((d) => d.document_type === "linkedin") ?? null;

  const personalDataSaved = !!personalData;
  const resumeReady = resume?.status === "ready" || resume?.status === "insufficient_content";
  const linkedinReady = linkedin?.status === "ready" || linkedin?.status === "insufficient_content";
  const profileConfirmed = profile?.status === "confirmed";
  const targetContextConfirmed = targetContext?.status === "confirmed";

  let step: OnboardingStep = "welcome";
  if (!personalDataSaved) step = "identification";
  else if (!resume) step = "resume_upload";
  else if (!linkedin) step = "linkedin_upload";
  else if (!resumeReady || !linkedinReady) step = "processing";
  else if (!profileConfirmed) step = "review";
  else if (!targetContextConfirmed) step = "target_context";
  else step = "completed";

  return {
    step,
    personalDataSaved,
    resumeDocumentId: resume?.id ?? null,
    resumeStatus: resume?.status ?? null,
    linkedinDocumentId: linkedin?.id ?? null,
    linkedinStatus: linkedin?.status ?? null,
    profileId: profile?.id ?? null,
    profileVersionId: profile?.current_version_id ?? null,
    profileConfirmed,
    targetContextConfirmed,
  };
}
