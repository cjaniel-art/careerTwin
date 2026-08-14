import { createSupabaseServiceClient } from "./supabase-service-client";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ExecutiveDashboardMetrics {
  users: { total: number; newLast7Days: number; newLast30Days: number };
  activation: { byOnboardingStatus: Record<string, number>; profileAnalysesCompleted: number };
  /**
   * Analytics §14 (Taxa de Análise Acionável): a janela de observação ainda
   * não tem decisão registrada — por isso "análises úteis" e "análises com
   * ação" são mostradas separadas, sem calcular uma taxa combinada.
   */
  value: { analysesCompleted: number; usefulAnalyses: number; analysesWithFeedback: number; recommendationsSelected: number; actionsStarted: number; actionsCompleted: number };
  retention: { activeLast7Days: number; activeLast30Days: number };
  purchaseIntent: { byStatus: Record<string, number> };
  failures: { last30DaysByType: Record<string, number> };
}

function countBy<T extends string>(rows: { key: T }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.key] = (counts[row.key] ?? 0) + 1;
  return counts;
}

/** Fonte é sempre o banco operacional (analyses/user_accounts/purchase_intents), nunca eventos de analytics — ver Analytics §2 "fonte de verdade". */
export async function getExecutiveDashboardMetrics(): Promise<ExecutiveDashboardMetrics> {
  const supabase = createSupabaseServiceClient();
  const now = Date.now();
  const since7Days = new Date(now - 7 * DAY_MS).toISOString();
  const since30Days = new Date(now - 30 * DAY_MS).toISOString();

  const [
    { count: totalUsers },
    { count: newLast7Days },
    { count: newLast30Days },
    { data: accounts },
    { count: profileAnalysesCompleted },
    { count: analysesCompleted },
    { data: feedbackRows },
    { count: recommendationsSelected },
    { count: actionsStarted },
    { count: actionsCompleted },
    { data: purchaseIntentRows },
    { data: failedAnalysisRows },
    { data: authUsersPage },
  ] = await Promise.all([
    supabase.from("user_accounts").select("*", { count: "exact", head: true }),
    supabase.from("user_accounts").select("*", { count: "exact", head: true }).gte("created_at", since7Days),
    supabase.from("user_accounts").select("*", { count: "exact", head: true }).gte("created_at", since30Days),
    supabase.from("user_accounts").select("onboarding_status"),
    supabase.from("analyses").select("*", { count: "exact", head: true }).eq("analysis_type", "profile_analysis").eq("status", "completed"),
    supabase.from("analyses").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("analysis_feedback").select("usefulness_score"),
    supabase.from("recommendations").select("*", { count: "exact", head: true }).eq("status", "selected"),
    supabase.from("actions").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
    supabase.from("actions").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("purchase_intents").select("status"),
    supabase.from("analyses").select("analysis_type").in("status", ["failed_retryable", "failed_final"]).gte("created_at", since30Days),
    // auth.users não é acessível via PostgREST comum — usa o Admin API do client de service-role.
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const byOnboardingStatus = countBy((accounts ?? []).map((a) => ({ key: a.onboarding_status as string })));
  const usefulAnalyses = (feedbackRows ?? []).filter((f) => f.usefulness_score >= 4).length;
  const byPurchaseIntentStatus = countBy((purchaseIntentRows ?? []).map((p) => ({ key: p.status as string })));
  const last30DaysByType = countBy((failedAnalysisRows ?? []).map((a) => ({ key: a.analysis_type as string })));

  const authUsers = authUsersPage?.users ?? [];
  const activeLast7Days = authUsers.filter((u) => u.last_sign_in_at && u.last_sign_in_at >= since7Days).length;
  const activeLast30Days = authUsers.filter((u) => u.last_sign_in_at && u.last_sign_in_at >= since30Days).length;

  return {
    users: { total: totalUsers ?? 0, newLast7Days: newLast7Days ?? 0, newLast30Days: newLast30Days ?? 0 },
    activation: { byOnboardingStatus, profileAnalysesCompleted: profileAnalysesCompleted ?? 0 },
    value: {
      analysesCompleted: analysesCompleted ?? 0,
      usefulAnalyses,
      analysesWithFeedback: feedbackRows?.length ?? 0,
      recommendationsSelected: recommendationsSelected ?? 0,
      actionsStarted: actionsStarted ?? 0,
      actionsCompleted: actionsCompleted ?? 0,
    },
    retention: { activeLast7Days, activeLast30Days },
    purchaseIntent: { byStatus: byPurchaseIntentStatus },
    failures: { last30DaysByType },
  };
}
