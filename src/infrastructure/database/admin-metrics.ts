import { createSupabaseServiceClient } from "./supabase-service-client";

const DAY_MS = 24 * 60 * 60 * 1000;

function sinceIso(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function countBy<T extends string>(rows: { key: T }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.key] = (counts[row.key] ?? 0) + 1;
  return counts;
}

/** Semana/mês = baldes diários; semestre/ano = baldes semanais (segunda-feira), senão o gráfico teria 180+ barras. */
function bucketGranularity(days: number): "day" | "week" {
  return days <= 60 ? "day" : "week";
}

function bucketKey(iso: string, granularity: "day" | "week"): string {
  if (granularity === "day") return iso.slice(0, 10);
  const d = new Date(iso);
  const dayOfWeek = (d.getUTCDay() + 6) % 7; // segunda = 0
  d.setUTCDate(d.getUTCDate() - dayOfWeek);
  return d.toISOString().slice(0, 10);
}

/** Baldes cobrindo os últimos `days` dias (incluindo hoje), em ordem cronológica, sem duplicar chave de semana. */
function dateBuckets(days: number, granularity: "day" | "week"): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();
  for (let i = days - 1; i >= 0; i--) {
    const key = bucketKey(new Date(Date.now() - i * DAY_MS).toISOString(), granularity);
    if (!seen.has(key)) {
      seen.add(key);
      keys.push(key);
    }
  }
  return keys;
}

export interface ExecutiveDashboardMetrics {
  users: { total: number; newInPeriod: number; daily: { date: string; signups: number; active: number }[] };
  activation: { byOnboardingStatus: Record<string, number>; profileAnalysesCompleted: number };
  /**
   * Analytics §14 (Taxa de Análise Acionável): a janela de observação ainda
   * não tem decisão registrada — por isso "análises úteis" e "análises com
   * ação" são mostradas separadas, sem calcular uma taxa combinada.
   */
  value: { analysesCompleted: number; usefulAnalyses: number; analysesWithFeedback: number; recommendationsSelected: number; actionsStarted: number; actionsCompleted: number };
  retention: { activeInPeriod: number };
  purchaseIntent: { byStatus: Record<string, number> };
  failures: { byType: Record<string, number> };
}

/** Fonte é sempre o banco operacional (analyses/user_accounts/purchase_intents), nunca eventos de analytics — ver Analytics §2 "fonte de verdade". */
export async function getExecutiveDashboardMetrics(days: number): Promise<ExecutiveDashboardMetrics> {
  const supabase = createSupabaseServiceClient();
  const since = sinceIso(days);

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
    supabase.from("analyses").select("*", { count: "exact", head: true }).eq("analysis_type", "profile_analysis").eq("status", "completed").gte("created_at", since),
    supabase.from("analyses").select("*", { count: "exact", head: true }).eq("status", "completed").gte("created_at", since),
    supabase.from("analysis_feedback").select("usefulness_score").gte("created_at", since),
    supabase.from("recommendations").select("*", { count: "exact", head: true }).eq("status", "selected").gte("updated_at", since),
    supabase.from("actions").select("*", { count: "exact", head: true }).eq("status", "in_progress").gte("started_at", since),
    supabase.from("actions").select("*", { count: "exact", head: true }).eq("status", "completed").gte("completed_at", since),
    supabase.from("purchase_intents").select("status").gte("created_at", since),
    supabase.from("analyses").select("analysis_type").in("status", ["failed_retryable", "failed_final"]).gte("created_at", since),
    // auth.users não é acessível via PostgREST comum — usa o Admin API do client de service-role.
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const byOnboardingStatus = countBy((accounts ?? []).map((a) => ({ key: a.onboarding_status as string })));
  const usefulAnalyses = (feedbackRows ?? []).filter((f) => f.usefulness_score >= 4).length;
  const byPurchaseIntentStatus = countBy((purchaseIntentRows ?? []).map((p) => ({ key: p.status as string })));
  const byType = countBy((failedAnalysisRows ?? []).map((a) => ({ key: a.analysis_type as string })));

  const authUsers = authUsersPage?.users ?? [];
  const activeInPeriod = authUsers.filter((u) => u.last_sign_in_at && u.last_sign_in_at >= since).length;
  const newInPeriod = (accounts ?? []).filter((a) => (a.created_at as string) >= since).length;

  const granularity = bucketGranularity(days);
  const buckets = dateBuckets(days, granularity);
  const signupsByBucket = new Map(buckets.map((b) => [b, 0]));
  for (const a of accounts ?? []) {
    const key = bucketKey(a.created_at as string, granularity);
    if (signupsByBucket.has(key)) signupsByBucket.set(key, (signupsByBucket.get(key) ?? 0) + 1);
  }
  const activeByBucket = new Map(buckets.map((b) => [b, 0]));
  for (const u of authUsers) {
    if (!u.last_sign_in_at) continue;
    const key = bucketKey(u.last_sign_in_at, granularity);
    if (activeByBucket.has(key)) activeByBucket.set(key, (activeByBucket.get(key) ?? 0) + 1);
  }
  const daily = buckets.map((date) => ({ date, signups: signupsByBucket.get(date) ?? 0, active: activeByBucket.get(date) ?? 0 }));

  return {
    users: { total: totalUsers ?? 0, newInPeriod, daily },
    activation: { byOnboardingStatus, profileAnalysesCompleted: profileAnalysesCompleted ?? 0 },
    value: {
      analysesCompleted: analysesCompleted ?? 0,
      usefulAnalyses,
      analysesWithFeedback: feedbackRows?.length ?? 0,
      recommendationsSelected: recommendationsSelected ?? 0,
      actionsStarted: actionsStarted ?? 0,
      actionsCompleted: actionsCompleted ?? 0,
    },
    retention: { activeInPeriod },
    purchaseIntent: { byStatus: byPurchaseIntentStatus },
    failures: { byType },
  };
}

export interface OnboardingDashboardMetrics {
  byOnboardingStatus: Record<string, number>;
  thinTwinConfirmed: number;
  targetContextConfirmed: number;
  documentsByStatus: Record<string, number>;
}

/** Conversão por etapa + confirmações, entre usuários/documentos criados no período — banco operacional. */
export async function getOnboardingDashboardMetrics(days: number): Promise<OnboardingDashboardMetrics> {
  const supabase = createSupabaseServiceClient();
  const since = sinceIso(days);

  const [{ data: accounts }, { count: thinTwinConfirmed }, { count: targetContextConfirmed }, { data: documents }] = await Promise.all([
    supabase.from("user_accounts").select("onboarding_status").gte("created_at", since),
    supabase.from("professional_profiles").select("*", { count: "exact", head: true }).eq("status", "confirmed").gte("created_at", since),
    supabase.from("target_contexts").select("*", { count: "exact", head: true }).eq("status", "confirmed").gte("created_at", since),
    supabase.from("documents").select("status").gte("created_at", since),
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
  failedByType: Record<string, number>;
  usefulnessAverage: number | null;
  usefulnessDistribution: Record<string, number>;
  specificityDistribution: Record<string, number>;
  confidenceDistribution: Record<string, number>;
  recommendationsSelected: number;
  actionsStarted: number;
  actionsCompleted: number;
  feedbackCount: number;
}

/** Qualidade percebida e uso das análises concluídas no período — banco operacional (analyses/analysis_feedback/recommendations/actions). */
export async function getProductDashboardMetrics(days: number): Promise<ProductDashboardMetrics> {
  const supabase = createSupabaseServiceClient();
  const since = sinceIso(days);

  const [
    { data: completedAnalyses },
    { data: failedAnalyses },
    { data: feedbackRows },
    { count: recommendationsSelected },
    { count: actionsStarted },
    { count: actionsCompleted },
  ] = await Promise.all([
    supabase.from("analyses").select("analysis_type, confidence_band").eq("status", "completed").gte("created_at", since),
    supabase.from("analyses").select("analysis_type").in("status", ["failed_retryable", "failed_final"]).gte("created_at", since),
    supabase.from("analysis_feedback").select("usefulness_score, specificity").gte("created_at", since),
    supabase.from("recommendations").select("*", { count: "exact", head: true }).eq("status", "selected").gte("updated_at", since),
    supabase.from("actions").select("*", { count: "exact", head: true }).eq("status", "in_progress").gte("started_at", since),
    supabase.from("actions").select("*", { count: "exact", head: true }).eq("status", "completed").gte("completed_at", since),
  ]);

  const feedback = feedbackRows ?? [];
  const usefulnessAverage = feedback.length > 0 ? feedback.reduce((sum, f) => sum + f.usefulness_score, 0) / feedback.length : null;

  return {
    completedByType: countBy((completedAnalyses ?? []).map((a) => ({ key: a.analysis_type as string }))),
    failedByType: countBy((failedAnalyses ?? []).map((a) => ({ key: a.analysis_type as string }))),
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
  jobsByStatus: Record<string, number>;
  stuckJobs: number;
  failedJobsByErrorCategory: Record<string, number>;
  documentIssues: Record<string, number>;
  pendingAccountDeletions: number;
}

/**
 * Sinais técnicos que já existem no banco operacional. Disponibilidade, latência,
 * fila em tempo real e custo por token exigem observabilidade dedicada (Analytics
 * §16 "Dashboard técnico" — fonte principal deveria ser essa, não este banco) e
 * ainda não existem no projeto — não inventados aqui.
 */
export async function getTechnicalDashboardMetrics(days: number): Promise<TechnicalDashboardMetrics> {
  const supabase = createSupabaseServiceClient();
  const since = sinceIso(days);
  const stuckSince = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const [{ data: jobs }, { count: stuckJobs }, { data: failedJobs }, { data: documents }, { count: pendingAccountDeletions }] = await Promise.all([
    supabase.from("processing_jobs").select("status").gte("created_at", since),
    supabase.from("processing_jobs").select("*", { count: "exact", head: true }).eq("status", "processing").lt("started_at", stuckSince),
    supabase.from("processing_jobs").select("error_category").eq("status", "failed").gte("created_at", since),
    supabase.from("documents").select("status").in("status", ["failed_retryable", "failed_final", "insufficient_content"]).gte("created_at", since),
    supabase.from("user_accounts").select("*", { count: "exact", head: true }).eq("status", "deletion_pending"),
  ]);

  return {
    jobsByStatus: countBy((jobs ?? []).map((j) => ({ key: j.status as string }))),
    stuckJobs: stuckJobs ?? 0,
    failedJobsByErrorCategory: countBy((failedJobs ?? []).map((j) => ({ key: (j.error_category as string) ?? "unknown" }))),
    documentIssues: countBy((documents ?? []).map((d) => ({ key: d.status as string }))),
    pendingAccountDeletions: pendingAccountDeletions ?? 0,
  };
}
