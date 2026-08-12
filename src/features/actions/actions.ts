"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { ACTIONS_CONFIG } from "@/config/engine/actions";
import { trackEvent } from "@/infrastructure/analytics";
import { ANALYTICS_EVENTS } from "@/infrastructure/analytics/events";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/acoes");
  return { supabase, user };
}

const ACTIVE_STATUSES = ["pending", "selected", "in_progress"] as const;

/**
 * Converts a recommendation into a tracked action (RF-C1-051..056 / PRD 03
 * "Limite do plano: até 5 ações"). Selecting/starting/completing an action
 * never recalculates IPP/IAO — those stay frozen on the analysis that
 * produced the recommendation.
 */
export async function convertRecommendationToActionAction(formData: FormData): Promise<void> {
  const recommendationId = formData.get("recommendationId");
  const redirectTo = formData.get("redirectTo");
  if (typeof recommendationId !== "string") return;

  const { supabase, user } = await requireUser();

  const { count } = await supabase
    .from("actions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ACTIVE_STATUSES);

  if ((count ?? 0) >= ACTIONS_CONFIG.maximum) {
    if (typeof redirectTo === "string") redirect(`${redirectTo}?erro=limite-acoes`);
    return;
  }

  const { error } = await supabase.from("actions").insert({
    user_id: user.id,
    recommendation_id: recommendationId,
    status: "pending",
  });
  if (error) {
    console.error("convertRecommendationToActionAction: insert failed:", error.message);
    return;
  }

  await supabase.from("recommendations").update({ status: "converted_to_action" }).eq("id", recommendationId);

  trackEvent(ANALYTICS_EVENTS.recommendationSelected, { userId: user.id });

  revalidatePath("/app/acoes");
  if (typeof redirectTo === "string") revalidatePath(redirectTo);
}

/**
 * Core 2 equivalent of convertRecommendationToActionAction, above — converts
 * a core2_action_candidates row instead of a recommendations row. Shares the
 * same `actions` table, the same global ACTIONS_CONFIG.maximum cap (Core 1
 * and Core 2 actions count against the same 5-action limit — see the
 * docstring on ACTIONS_CONFIG), and the same status state machine, so
 * advanceActionStatusAction below works unmodified for either origin.
 */
export async function convertCore2ActionCandidateToActionAction(formData: FormData): Promise<void> {
  const actionCandidateId = formData.get("actionCandidateId");
  const redirectTo = formData.get("redirectTo");
  if (typeof actionCandidateId !== "string") return;

  const { supabase, user } = await requireUser();

  const { count } = await supabase
    .from("actions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("status", ACTIVE_STATUSES);

  if ((count ?? 0) >= ACTIONS_CONFIG.maximum) {
    if (typeof redirectTo === "string") redirect(`${redirectTo}?erro=limite-acoes`);
    return;
  }

  const { error } = await supabase.from("actions").insert({
    user_id: user.id,
    core2_action_candidate_id: actionCandidateId,
    status: "pending",
  });
  if (error) {
    console.error("convertCore2ActionCandidateToActionAction: insert failed:", error.message);
    return;
  }

  await supabase.from("core2_action_candidates").update({ status: "converted_to_action" }).eq("id", actionCandidateId);

  trackEvent(ANALYTICS_EVENTS.recommendationSelected, { userId: user.id });

  revalidatePath("/app/acoes");
  if (typeof redirectTo === "string") revalidatePath(redirectTo);
}

const ACTION_STATUS_TRANSITIONS: Record<string, string> = {
  pending: "selected",
  selected: "in_progress",
  in_progress: "completed",
};

/** Advances an action one step along pendente → selecionada → em andamento → concluída. */
export async function advanceActionStatusAction(formData: FormData): Promise<void> {
  const actionId = formData.get("actionId");
  const currentPath = formData.get("currentPath");
  if (typeof actionId !== "string") return;
  const { supabase, user } = await requireUser();

  const { data: action } = await supabase
    .from("actions")
    .select("id, status")
    .eq("id", actionId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!action) return;

  const nextStatus = ACTION_STATUS_TRANSITIONS[action.status];
  if (!nextStatus) return;

  const patch: Record<string, unknown> = { status: nextStatus };
  if (nextStatus === "in_progress") patch.started_at = new Date().toISOString();
  if (nextStatus === "completed") patch.completed_at = new Date().toISOString();

  await supabase.from("actions").update(patch).eq("id", actionId);

  trackEvent(ANALYTICS_EVENTS.actionStatusChanged, { userId: user.id, properties: { actionStatus: nextStatus as "pending" | "selected" | "in_progress" | "completed" } });
  if (nextStatus === "in_progress") trackEvent(ANALYTICS_EVENTS.actionStarted, { userId: user.id });
  if (nextStatus === "completed") trackEvent(ANALYTICS_EVENTS.actionCompleted, { userId: user.id });

  revalidatePath("/app/acoes");
  if (typeof currentPath === "string") revalidatePath(currentPath);
}
