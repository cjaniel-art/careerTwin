import { redirect } from "next/navigation";
import { ArrowLeftRight, BarChart3, ListChecks, ShieldAlert, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { getOnboardingState } from "@/features/onboarding/get-state";
import { getAnalysisHistory } from "@/features/history/get-history";
import { ACTIONS_CONFIG } from "@/config/engine/actions";
import type { Core1Gap, Core1Strength } from "@/config/schemas/core1";
import { ReportHeader } from "@/features/core-1/report/report-header";
import { ExecutiveSummaryCard } from "@/features/core-1/report/executive-summary-card";
import { IppCard } from "@/features/core-1/report/ipp-card";
import { ConfidenceCard } from "@/features/core-1/report/confidence-card";
import { ReportTabsRoot, ReportTabsList, ReportTabsTrigger, ReportTabsContent } from "@/features/core-1/report/report-tabs";
import { StrengthsCard } from "@/features/core-1/report/strengths-card";
import { GapsCard } from "@/features/core-1/report/gaps-card";
import { TopRecommendationsCard } from "@/features/core-1/report/top-recommendations-card";
import { NextBestActionBanner } from "@/features/core-1/report/next-best-action-banner";
import { DimensionsSection } from "@/features/core-1/report/dimensions-section";
import { StrengthsSection } from "@/features/core-1/report/strengths-section";
import { GapsSection } from "@/features/core-1/report/gaps-section";
import { RecommendationsSection } from "@/features/core-1/report/recommendations-section";
import { SourceConflictsSection } from "@/features/core-1/report/source-conflicts-section";
import { ActionPlanPreview } from "@/features/core-1/report/action-plan-preview";
import { ReportDisclaimer } from "@/features/core-1/report/report-disclaimer";

export const metadata = { title: "Relatório de Análise de Perfil — CareerTwin" };
export const dynamic = "force-dynamic";

export default async function ProfileAnalysisResultPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/app/analise-perfil/${analysisId}`);

  const { data: analysis } = await supabase
    .from("analyses")
    .select(
      "id, status, confidence_band, confidence_reasons, missing_information, conflicts, previous_analysis_id, target_context_version_id, completed_at",
    )
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!analysis) redirect("/app/analise-perfil");
  if (analysis.status !== "completed") redirect(`/app/analise-perfil/processando/${analysisId}`);

  const [{ data: result }, { data: dimensions }, { data: recommendations }, { data: targetContext }, onboardingState, history] =
    await Promise.all([
      supabase
        .from("profile_analysis_results")
        .select("ipp_display_score, ipp_band, diagnosis, main_strength, main_gap, next_best_action, calculation_snapshot")
        .eq("analysis_id", analysisId)
        .single(),
      supabase
        .from("profile_dimension_results")
        .select("dimension, rubric_level, dimension_score, reasoning")
        .eq("analysis_id", analysisId),
      supabase
        .from("recommendations")
        .select(
          "id, recommendation_key, category, title, problem, reasoning, suggested_action, expected_outcome, completion_criteria, impact, effort, urgency, confidence, priority_order, status",
        )
        .eq("analysis_id", analysisId)
        .order("priority_order", { ascending: true }),
      analysis.target_context_version_id
        ? supabase.from("target_context_versions").select("target_role").eq("id", analysis.target_context_version_id).maybeSingle()
        : Promise.resolve({ data: null }),
      getOnboardingState(supabase, user.id),
      getAnalysisHistory(supabase, user.id, "profile_analysis"),
    ]);

  const recommendationIds = (recommendations ?? []).map((r) => r.id);
  const [{ data: actionRows }, { count: activeActionsCount }] = await Promise.all([
    recommendationIds.length
      ? supabase
          .from("actions")
          .select("id, status, recommendation_id")
          .eq("user_id", user.id)
          .in("recommendation_id", recommendationIds)
      : Promise.resolve({ data: [] as { id: string; status: string; recommendation_id: string }[] }),
    supabase
      .from("actions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("status", ["pending", "selected", "in_progress"]),
  ]);

  const recommendationById = new Map((recommendations ?? []).map((r) => [r.id, r]));
  const actionPreviewRows = (actionRows ?? []).map((a) => ({
    id: a.id,
    status: a.status,
    title: recommendationById.get(a.recommendation_id)?.title ?? "",
    suggestedAction: recommendationById.get(a.recommendation_id)?.suggested_action ?? "",
  }));
  const candidateRecommendations = (recommendations ?? [])
    .filter((r) => r.status === "generated" || r.status === "highlighted")
    .map((r) => ({ id: r.id, title: r.title, problem: r.problem, category: r.category }));
  const atActionsLimit = (activeActionsCount ?? 0) >= ACTIONS_CONFIG.maximum;

  const snapshot = (result?.calculation_snapshot ?? {}) as { gaps?: Core1Gap[]; strengths?: Core1Strength[] };
  const gaps = snapshot.gaps ?? [];
  const strengths = snapshot.strengths ?? [];
  const conflicts = (analysis.conflicts as string[] | null) ?? [];

  return (
    <main className="flex w-full flex-col gap-8 px-6 py-10 lg:px-10">
      <ReportHeader
        completedAt={analysis.completed_at}
        targetRole={targetContext?.target_role ?? null}
        existingResumeDocument={onboardingState.resumeDocument}
        existingLinkedinDocument={onboardingState.linkedinDocument}
        targetContextDefaults={onboardingState.targetContext}
        historyItems={history}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ExecutiveSummaryCard
          summary={result?.diagnosis ?? ""}
          mainStrength={result?.main_strength ?? ""}
          mainGap={result?.main_gap ?? ""}
          nextBestAction={result?.next_best_action ?? ""}
        />
        <IppCard score={result?.ipp_display_score ?? 0} band={result?.ipp_band ?? ""} />
        <ConfidenceCard
          level={analysis.confidence_band ?? ""}
          reasons={(analysis.confidence_reasons as string[] | null) ?? []}
          missingInformation={(analysis.missing_information as string[] | null) ?? []}
          conflicts={conflicts}
        />
      </div>

      <ReportTabsRoot defaultValue="visao-geral">
        <ReportTabsList>
          <ReportTabsTrigger value="visao-geral">
            <ArrowLeftRight className="size-4" aria-hidden />
            Visão geral
          </ReportTabsTrigger>
          <ReportTabsTrigger value="dimensoes">
            <BarChart3 className="size-4" aria-hidden />
            Dimensões
          </ReportTabsTrigger>
          <ReportTabsTrigger value="forcas">
            <Sparkles className="size-4" aria-hidden />
            Forças
          </ReportTabsTrigger>
          {gaps.length > 0 ? (
            <ReportTabsTrigger value="lacunas">
              <AlertTriangle className="size-4" aria-hidden />
              Lacunas
            </ReportTabsTrigger>
          ) : null}
          <ReportTabsTrigger value="recomendacoes">
            <ListChecks className="size-4" aria-hidden />
            Recomendações
          </ReportTabsTrigger>
          <ReportTabsTrigger value="plano-evolucao">
            <TrendingUp className="size-4" aria-hidden />
            Plano de evolução
          </ReportTabsTrigger>
          {conflicts.length > 0 ? (
            <ReportTabsTrigger value="inconsistencias">
              <ShieldAlert className="size-4" aria-hidden />
              Inconsistências
            </ReportTabsTrigger>
          ) : null}
        </ReportTabsList>

        <ReportTabsContent value="visao-geral" className="flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <StrengthsCard strengths={strengths} mainStrength={result?.main_strength ?? ""} />
            <GapsCard gaps={gaps} />
            <TopRecommendationsCard recommendations={recommendations ?? []} />
          </div>

          <NextBestActionBanner
            action={result?.next_best_action ?? ""}
            analysisId={analysisId}
            actions={actionPreviewRows}
            candidates={candidateRecommendations}
            atLimit={atActionsLimit}
          />
        </ReportTabsContent>

        <ReportTabsContent value="dimensoes">
          <DimensionsSection dimensions={dimensions ?? []} />
        </ReportTabsContent>
        <ReportTabsContent value="forcas">
          <StrengthsSection strengths={strengths} mainStrength={result?.main_strength ?? ""} />
        </ReportTabsContent>
        {gaps.length > 0 ? (
          <ReportTabsContent value="lacunas">
            <GapsSection gaps={gaps} />
          </ReportTabsContent>
        ) : null}
        <ReportTabsContent value="recomendacoes">
          <RecommendationsSection recommendations={recommendations ?? []} analysisId={analysisId} />
        </ReportTabsContent>
        <ReportTabsContent value="plano-evolucao">
          <ActionPlanPreview
            analysisId={analysisId}
            actions={actionPreviewRows}
            candidates={candidateRecommendations}
            atLimit={atActionsLimit}
          />
        </ReportTabsContent>
        {conflicts.length > 0 ? (
          <ReportTabsContent value="inconsistencias">
            <SourceConflictsSection conflicts={conflicts} />
          </ReportTabsContent>
        ) : null}
      </ReportTabsRoot>

      <ReportDisclaimer />
    </main>
  );
}
