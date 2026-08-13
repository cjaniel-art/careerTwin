import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import type { Core1Gap, Core1Strength } from "@/config/schemas/core1";
import { CORE_1_CONFIG, IPP_DIMENSIONS, IPP_DIMENSION_WEIGHT_KEY } from "@/config/engine/core1";
import { CORE_2_CONFIG } from "@/config/engine/core2";
import { ACTIONS_CONFIG } from "@/config/engine/actions";
import { DIMENSION_LABELS, IAO_BAND_LABELS, IPP_BAND_LABELS, RUBRIC_LEVEL_LABELS } from "@/lib/result-labels";
import { ScoreCard } from "@/features/dashboard/score-card";
import { ContextAndTargetCard } from "@/features/dashboard/context-and-target-card";
import { OpportunitiesCard } from "@/features/dashboard/opportunities-card";
import { IppEvolutionCard } from "@/features/dashboard/ipp-evolution-card";
import { PrioritizedActionsCard } from "@/features/dashboard/prioritized-actions-card";
import { StrengthsCard } from "@/features/dashboard/strengths-card";
import { GapsCard } from "@/features/dashboard/gaps-card";
import { DashboardPageHeader } from "@/features/dashboard/dashboard-page-header";
import type { IppDimensionRow, Opportunity, PrioritizedAction, SeverityLevel } from "@/lib/mock/dashboard";

export const metadata = { title: "Dashboard — CareerTwin" };
export const dynamic = "force-dynamic";

interface ProfileCalculationSnapshot {
  strengths?: Core1Strength[];
  gaps?: Core1Gap[];
}

function severityFromUrgency(urgency: number): SeverityLevel {
  if (urgency >= 4) return "Alta";
  if (urgency >= 3) return "Média";
  return "Baixa";
}

/** good_observable_fit conta como "Alta" (boa aderência) na leitura resumida de 3 níveis do dashboard. */
function adherenceFromIaoBand(band: string | null): SeverityLevel {
  if (band === "high_observable_fit" || band === "good_observable_fit") return "Alta";
  if (band === "partial_fit") return "Média";
  return "Baixa";
}

function iaoBandLabelForAverage(average: number): string {
  const { bands } = CORE_2_CONFIG.iao;
  if (average >= bands.high[0]) return IAO_BAND_LABELS.high_observable_fit ?? "";
  if (average >= bands.good[0]) return IAO_BAND_LABELS.good_observable_fit ?? "";
  if (average >= bands.partial[0]) return IAO_BAND_LABELS.partial_fit ?? "";
  return IAO_BAND_LABELS.low_observable_fit ?? "";
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/**
 * Dashboard com dados reais do Supabase (não mock) — os 7 pilares do IPP
 * (nomes/pesos de src/config/engine/core1.ts, scores de profile_dimension_results),
 * IPP/IAO da última análise concluída, oportunidades recentes, evolução do IPP,
 * plano de ação priorizado (recommendations, com Sheet de ações reais desta
 * análise) e forças/lacunas (calculation_snapshot). A auth já é garantida pelo
 * layout de /app (src/app/app/layout.tsx); repetimos aqui só para ter o
 * user.id nas queries.
 */
export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/dashboard");

  const [{ data: profileAnalyses }, { data: jobAnalyses }, { data: creditAccount }] = await Promise.all([
    supabase
      .from("analyses")
      .select("id, created_at, target_context_version_id, profile_analysis_results(ipp_display_score, ipp_band, main_strength, calculation_snapshot)")
      .eq("user_id", user.id)
      .eq("analysis_type", "profile_analysis")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("analyses")
      .select("id, created_at, fit_analysis_results(iao_display_score, iao_band, calculation_snapshot), opportunity_versions(title)")
      .eq("user_id", user.id)
      .eq("analysis_type", "job_analysis")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("credit_accounts").select("available_credits").eq("user_id", user.id).maybeSingle(),
  ]);
  const hasCredits = (creditAccount?.available_credits ?? 0) > 0;

  function first<T>(value: T | T[] | null | undefined): T | null {
    return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
  }

  const latestProfileAnalysis = profileAnalyses?.[0] ?? null;
  const previousProfileAnalysis = profileAnalyses?.[1] ?? null;
  const latestProfileResult = first(latestProfileAnalysis?.profile_analysis_results);
  const previousProfileResult = first(previousProfileAnalysis?.profile_analysis_results);

  const [{ data: dimensionRows }, { data: targetContext }, { data: recommendations }] = await Promise.all([
    latestProfileAnalysis
      ? supabase
          .from("profile_dimension_results")
          .select("dimension, rubric_level, dimension_score")
          .eq("analysis_id", latestProfileAnalysis.id)
      : Promise.resolve({ data: [] as { dimension: string; rubric_level: number; dimension_score: number }[] }),
    latestProfileAnalysis?.target_context_version_id
      ? supabase.from("target_context_versions").select("target_area, target_role").eq("id", latestProfileAnalysis.target_context_version_id).maybeSingle()
      : Promise.resolve({ data: null }),
    latestProfileAnalysis
      ? supabase
          .from("recommendations")
          .select("id, title, problem, category, suggested_action, urgency, priority_order, status")
          .eq("analysis_id", latestProfileAnalysis.id)
          .order("priority_order", { ascending: true })
      : Promise.resolve({
          data: [] as {
            id: string;
            title: string;
            problem: string;
            category: string;
            suggested_action: string;
            urgency: number;
            priority_order: number;
            status: string;
          }[],
        }),
  ]);

  // Mesmo padrão de /app/analise-perfil/[analysisId]: o plano de ação do Sheet
  // usa as ações REAIS e rastreáveis desta análise (tabela `actions`), não a
  // lista de recomendações crua — cada análise tem sua própria lista.
  const recommendationIds = (recommendations ?? []).map((r) => r.id);
  const { data: actionRowsRaw } = recommendationIds.length
    ? await supabase.from("actions").select("id, status, recommendation_id").eq("user_id", user.id).in("recommendation_id", recommendationIds)
    : { data: [] as { id: string; status: string; recommendation_id: string }[] };

  const recommendationById = new Map((recommendations ?? []).map((r) => [r.id, r]));
  const actionRows = (actionRowsRaw ?? []).map((a) => ({
    id: a.id,
    status: a.status,
    title: recommendationById.get(a.recommendation_id)?.title ?? "",
    suggestedAction: recommendationById.get(a.recommendation_id)?.suggested_action ?? "",
  }));
  const candidateRecommendations = (recommendations ?? [])
    .filter((r) => r.status === "generated" || r.status === "highlighted")
    .map((r) => ({ id: r.id, title: r.title, problem: r.problem, category: r.category }));
  const ACTIVE_ACTION_STATUSES = ["pending", "selected", "in_progress"];
  const atActionsLimit = (actionRowsRaw ?? []).filter((a) => ACTIVE_ACTION_STATUSES.includes(a.status)).length >= ACTIONS_CONFIG.maximum;

  const dimensionByKey = new Map((dimensionRows ?? []).map((row) => [row.dimension, row]));
  const ippDimensions: IppDimensionRow[] = latestProfileAnalysis
    ? IPP_DIMENSIONS.map((key) => {
        const row = dimensionByKey.get(key);
        const rubricLevel = row?.rubric_level ?? 0;
        return {
          key,
          name: DIMENSION_LABELS[key] ?? key,
          weight: CORE_1_CONFIG.ipp.weights[IPP_DIMENSION_WEIGHT_KEY[key]],
          score: Math.round(row?.dimension_score ?? 0),
          rubricLevel,
          levelLabel: RUBRIC_LEVEL_LABELS[rubricLevel] ?? "—",
        };
      })
    : [];

  const ippSnapshot = (latestProfileResult?.calculation_snapshot ?? {}) as ProfileCalculationSnapshot;
  const strengths = ippSnapshot.strengths ?? [];
  const gaps = ippSnapshot.gaps ?? [];

  const prioritizedActions: PrioritizedAction[] = (recommendations ?? []).slice(0, 5).map((r, index) => ({
    priority: index + 1,
    title: r.title,
    severity: severityFromUrgency(r.urgency),
  }));

  const ippCurrent = latestProfileResult?.ipp_display_score ?? 0;
  const ippPrevious = previousProfileResult?.ipp_display_score ?? ippCurrent;
  const ippHistory = [...(profileAnalyses ?? [])]
    .reverse()
    .map((a) => ({ date: formatShortDate(a.created_at), value: first(a.profile_analysis_results)?.ipp_display_score ?? 0 }));

  const latestJobAnalysis = jobAnalyses?.[0] ?? null;
  const latestJobResult = first(latestJobAnalysis?.fit_analysis_results);
  const iaoScores = (jobAnalyses ?? []).map((a) => first(a.fit_analysis_results)?.iao_display_score ?? 0);
  const iaoAverage = iaoScores.length > 0 ? Math.round(iaoScores.reduce((sum, v) => sum + v, 0) / iaoScores.length) : 0;

  const opportunities: Opportunity[] = (jobAnalyses ?? []).slice(0, 3).map((a) => {
    const result = first(a.fit_analysis_results);
    const opportunity = first(a.opportunity_versions);
    return {
      role: opportunity?.title ?? "Vaga sem título",
      iao: result?.iao_display_score ?? 0,
      adherence: adherenceFromIaoBand(result?.iao_band ?? null),
      reportUrl: `/app/aderencia/${a.id}`,
    };
  });

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <DashboardPageHeader hasCredits={hasCredits} />

      {/*
        Breakpoints alinhados ao threshold de 1280px da spec (Tailwind `xl`),
        não `lg` (1024px) — a sidebar fixa de 226px consome espaço real do
        conteúdo, então uma grade de 4/5 colunas em viewports de ~1024-1279px
        fica espremida (ex.: botão "Ver relatório" truncado). Nessa faixa
        (768-1279) as linhas ficam em 1-2 colunas, como a spec pede.
      */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ScoreCard
          title="IPP atual"
          value={Math.round(ippCurrent)}
          max={100}
          label={latestProfileResult ? (IPP_BAND_LABELS[latestProfileResult.ipp_band] ?? "—") : "Ainda não realizada"}
          description="Índice de Prontidão do Perfil"
          delta={Math.round(ippCurrent - ippPrevious)}
          deltaPeriodLabel="vs análise anterior"
          className="xl:h-[380px]"
        />
        <ScoreCard
          title="IAO médio"
          value={iaoAverage}
          max={100}
          label={jobAnalyses && jobAnalyses.length > 0 ? iaoBandLabelForAverage(iaoAverage) : "Ainda não realizado"}
          description="Índice de Aderência Observável"
          delta={Math.round((latestJobResult?.iao_display_score ?? iaoAverage) - iaoAverage)}
          deltaPeriodLabel="vs análise anterior"
          className="xl:h-[380px]"
        />
        <ContextAndTargetCard
          context={targetContext ? { area: targetContext.target_area, level: targetContext.target_role } : null}
          dimensions={ippDimensions}
          className="md:col-span-2 xl:col-span-2 xl:h-[380px]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <OpportunitiesCard opportunities={opportunities} className="xl:col-span-3" />
        <IppEvolutionCard
          evolution={{
            current: Math.round(ippCurrent),
            previous: Math.round(ippPrevious),
            delta: Math.round(ippCurrent - ippPrevious),
            deltaPeriodLabel: "vs análise anterior",
            history: ippHistory,
          }}
          className="xl:col-span-2"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <StrengthsCard strengths={strengths} mainStrength={latestProfileResult?.main_strength ?? ""} />
        <GapsCard gaps={gaps} />
        <PrioritizedActionsCard
          summary={prioritizedActions}
          analysisId={latestProfileAnalysis?.id ?? null}
          actionRows={actionRows}
          candidates={candidateRecommendations}
          atLimit={atActionsLimit}
        />
      </div>
    </main>
  );
}
