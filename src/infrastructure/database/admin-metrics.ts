import { createSupabaseServiceClient } from "./supabase-service-client";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ExecutiveDashboardMetrics {
  users: { total: number; newLast7Days: number; newLast30Days: number; daily: { date: string; signups: number; active: number }[] };
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

/** Últimos N dias (incluindo hoje), como "AAAA-MM-DD", em ordem cronológica. */
function dailyBuckets(days: number): string[] {
  return Array.from({ length: days }, (_, i) => new Date(Date.now() - (days - 1 - i) * DAY_MS).toISOString().slice(0, 10));
}

/** Fonte é sempre o banco operacional (analyses/user_accounts/purchase_intents), nunca eventos de analytics — ver Analytics §2 "fonte de verdade". */
export async function getExecutiveDashboardMetrics(): Promise<ExecutiveDashboardMetrics> {
  const supabase = createSupabaseServiceClient();
  const now = Date.now();
  const since7Days = new Date(now - 7 * DAY_MS).toISOString();
  const since30Days = new Date(now - 30 * DAY_MS).toISOString();

  const [
    { count: totalUsers },
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
    supabase.from("user_accounts").select("onboarding_status, created_at"),
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
  const newLast7Days = (accounts ?? []).filter((a) => (a.created_at as string) >= since7Days).length;
  const newLast30Days = (accounts ?? []).filter((a) => (a.created_at as string) >= since30Days).length;

  const days = dailyBuckets(30);
  const signupsByDay = new Map(days.map((d) => [d, 0]));
  for (const a of accounts ?? []) {
    const day = (a.created_at as string).slice(0, 10);
    if (signupsByDay.has(day)) signupsByDay.set(day, (signupsByDay.get(day) ?? 0) + 1);
  }
  const activeByDay = new Map(days.map((d) => [d, 0]));
  for (const u of authUsers) {
    const day = u.last_sign_in_at?.slice(0, 10);
    if (day && activeByDay.has(day)) activeByDay.set(day, (activeByDay.get(day) ?? 0) + 1);
  }
  const daily = days.map((date) => ({ date, signups: signupsByDay.get(date) ?? 0, active: activeByDay.get(date) ?? 0 }));

  return {
    users: { total: totalUsers ?? 0, newLast7Days, newLast30Days, daily },
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

export interface OnboardingDashboardMetrics {
  byOnboardingStatus: Record<string, number>;
  thinTwinConfirmed: number;
  targetContextConfirmed: number;
  documentsByStatus: Record<string, number>;
}

/** Conversão por etapa + confirmações — banco operacional (user_accounts/professional_profiles/target_contexts/documents). */
export async function getOnboardingDashboardMetrics(): Promise<OnboardingDashboardMetrics> {
  const supabase = createSupabaseServiceClient();

  const [{ data: accounts }, { count: thinTwinConfirmed }, { count: targetContextConfirmed }, { data: documents }] = await Promise.all([
    supabase.from("user_accounts").select("onboarding_status"),
    supabase.from("professional_profiles").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("target_contexts").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("documents").select("status"),
  ]);

  return {
    byOnboardingStatus: countBy((accounts ?? []).map((a) => ({ key: a.onboarding_status as string }))),
    thinTwinConfirmed: thinTwinConfirmed ?? 0,
    targetContextConfirmed: targetContextConfirmed ?? 0,
    documentsByStatus: countBy((documents ?? []).map((d) => ({ key: d.status as string }))),
  };
}

export interface ProductDashboardMetrics {
  completedByType: Record<string, number>;
  usefulnessAverage: number | null;
  usefulnessDistribution: Record<string, number>;
  specificityDistribution: Record<string, number>;
  confidenceDistribution: Record<string, number>;
  recommendationsSelected: number;
  actionsStarted: number;
  actionsCompleted: number;
  feedbackCount: number;
}

/** Qualidade percebida e uso das análises concluídas — banco operacional (analyses/analysis_feedback/recommendations/actions). */
export async function getProductDashboardMetrics(): Promise<ProductDashboardMetrics> {
  const supabase = createSupabaseServiceClient();

  const [{ data: completedAnalyses }, { data: feedbackRows }, { count: recommendationsSelected }, { count: actionsStarted }, { count: actionsCompleted }] =
    await Promise.all([
      supabase.from("analyses").select("analysis_type, confidence_band").eq("status", "completed"),
      supabase.from("analysis_feedback").select("usefulness_score, specificity"),
      supabase.from("recommendations").select("*", { count: "exact", head: true }).eq("status", "selected"),
      supabase.from("actions").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
      supabase.from("actions").select("*", { count: "exact", head: true }).eq("status", "completed"),
    ]);

  const feedback = feedbackRows ?? [];
  const usefulnessAverage = feedback.length > 0 ? feedback.reduce((sum, f) => sum + f.usefulness_score, 0) / feedback.length : null;

  return {
    completedByType: countBy((completedAnalyses ?? []).map((a) => ({ key: a.analysis_type as string }))),
    usefulnessAverage,
    usefulnessDistribution: countBy(feedback.map((f) => ({ key: String(f.usefulness_score) }))),
    specificityDistribution: countBy(feedback.map((f) => ({ key: f.specificity as string }))),
    confidenceDistribution: countBy((completedAnalyses ?? []).filter((a) => a.confidence_band).map((a) => ({ key: a.confidence_band as string }))),
    recommendationsSelected: recommendationsSelected ?? 0,
    actionsStarted: actionsStarted ?? 0,
    actionsCompleted: actionsCompleted ?? 0,
    feedbackCount: feedback.length,
  };
}

export interface TechnicalDashboardMetrics {
  jobsByStatus30Days: Record<string, number>;
  stuckJobs: number;
  failedJobsByErrorCategory30Days: Record<string, number>;
  documentIssues30Days: Record<string, number>;
  pendingAccountDeletions: number;
}

/**
 * Sinais técnicos que já existem no banco operacional. Disponibilidade, latência,
 * fila em tempo real e custo por token exigem observabilidade dedicada (Analytics
 * §16 "Dashboard técnico" — fonte principal deveria ser essa, não este banco) e
 * ainda não existem no projeto — não inventados aqui.
 */
export async function getTechnicalDashboardMetrics(): Promise<TechnicalDashboardMetrics> {
  const supabase = createSupabaseServiceClient();
  const since30Days = new Date(Date.now() - 30 * DAY_MS).toISOString();
  const stuckSince = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const [{ data: jobs }, { count: stuckJobs }, { data: failedJobs }, { data: documents }, { count: pendingAccountDeletions }] = await Promise.all([
    supabase.from("processing_jobs").select("status").gte("created_at", since30Days),
    supabase.from("processing_jobs").select("*", { count: "exact", head: true }).eq("status", "processing").lt("started_at", stuckSince),
    supabase.from("processing_jobs").select("error_category").eq("status", "failed").gte("created_at", since30Days),
    supabase.from("documents").select("status").in("status", ["failed_retryable", "failed_final", "insufficient_content"]).gte("created_at", since30Days),
    supabase.from("user_accounts").select("*", { count: "exact", head: true }).eq("status", "deletion_pending"),
  ]);

  return {
    jobsByStatus30Days: countBy((jobs ?? []).map((j) => ({ key: j.status as string }))),
    stuckJobs: stuckJobs ?? 0,
    failedJobsByErrorCategory30Days: countBy((failedJobs ?? []).map((j) => ({ key: (j.error_category as string) ?? "unknown" }))),
    documentIssues30Days: countBy((documents ?? []).map((d) => ({ key: d.status as string }))),
    pendingAccountDeletions: pendingAccountDeletions ?? 0,
  };
}
