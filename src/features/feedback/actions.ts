"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";

const SPECIFICITY_VALUES = ["yes", "partially", "no"] as const;
const APPLICATION_INTENT_VALUES = ["apply", "apply_after_adjustments", "not_apply", "undecided", "not_applicable"] as const;

/** RF-C1-069..073 / RF-C2-058..061 — one feedback per analysis (analysis_feedback unique(analysis_id, user_id)). */
export async function submitAnalysisFeedbackAction(formData: FormData): Promise<void> {
  const analysisId = formData.get("analysisId");
  const redirectTo = formData.get("redirectTo");
  const usefulnessRaw = formData.get("usefulnessScore");
  const specificity = formData.get("specificity");
  const applicationIntent = formData.get("applicationIntent");
  const comment = formData.get("comment");

  if (typeof analysisId !== "string") return;

  const usefulnessScore = Number(usefulnessRaw);
  if (!Number.isInteger(usefulnessScore) || usefulnessScore < 1 || usefulnessScore > 5) return;
  if (typeof specificity !== "string" || !SPECIFICITY_VALUES.includes(specificity as (typeof SPECIFICITY_VALUES)[number])) return;
  if (
    typeof applicationIntent === "string" &&
    applicationIntent.length > 0 &&
    !APPLICATION_INTENT_VALUES.includes(applicationIntent as (typeof APPLICATION_INTENT_VALUES)[number])
  ) {
    return;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: analysis } = await supabase
    .from("analyses")
    .select("id")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!analysis) return;

  const { error } = await supabase.from("analysis_feedback").upsert(
    {
      analysis_id: analysisId,
      user_id: user.id,
      usefulness_score: usefulnessScore,
      specificity,
      application_intent: typeof applicationIntent === "string" && applicationIntent.length > 0 ? applicationIntent : null,
      comment: typeof comment === "string" && comment.trim().length > 0 ? comment.trim() : null,
    },
    { onConflict: "analysis_id,user_id" },
  );
  if (error) {
    console.error("submitAnalysisFeedbackAction: upsert failed:", error.message);
    return;
  }

  if (typeof redirectTo === "string") revalidatePath(redirectTo);
}
