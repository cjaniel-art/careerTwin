import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import type { Core1Gap } from "@/config/schemas/core1";
import { FeedbackForm } from "@/features/feedback/feedback-form";
import { ReportHeader } from "@/features/core-1/report/report-header";
import { ExecutiveSummaryCard } from "@/features/core-1/report/executive-summary-card";
import { IppCard } from "@/features/core-1/report/ipp-card";
import { ConfidenceCard } from "@/features/core-1/report/confidence-card";
import { SectionNav, type ReportSection } from "@/features/core-1/report/section-nav";
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
import { ReanalysisSection } from "@/features/core-1/report/reanalysis-section";
import { ReportDisclaimer } from "@/features/core-1/report/report-disclaimer";

export const metadata = { title: "Relatório de Análise de Perfil — CareerTwin" };
export const dynamic = "force-dynamic";

const REPORT_SECTIONS: ReportSection[] = [
  { id: "visao-geral", label: "Visão geral" },
  { id: "dimensoes", label: "Dimensões" },
  { id: "forcas", label: "Forças" },
  { id: "lacunas", label: "Lacunas" },
  { id: "recomendacoes", label: "Recomendações" },
  { id: "plano-evolucao", label: "Plano de evolução" },
  { id: "inconsistencias", label: "Inconsistências" },
];

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
      "id, status, confidence_band, confidence_reasons, missing_information, conflicts, previous_analysis_id, target_context_version_id, profile_version_id, completed_at, profile_versions(version_number)",
    )
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!analysis) redirect("/app/analise-perfil");
  if (analysis.status !== "completed") redirect(`/app/analise-perfil/processando/${analysisId}`);

  const [{ data: result }, { data: dimensions }, { data: recommendations }, { data: feedback }, { data: targetContext }] =
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
      supabase
        .from("analysis_feedback")
        .select("usefulness_score, specificity, application_intent, comment")
        .eq("analysis_id", analysisId)
        .eq("user_id", user.id)
        .maybeSingle(),
      analysis.target_context_version_id
        ? supabase.from("target_context_versions").select("target_role").eq("id", analysis.target_context_version_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const recommendationIds = (recommendations ?? []).map((r) => r.id);
  const { data: actionRows } = recommendationIds.length
    ? await supabase
        .from("actions")
        .select("id, status, recommendation_id")
        .eq("user_id", user.id)
        .in("recommendation_id", recommendationIds)
    : { data: [] as { id: string; status: string; recommendation_id: string }[] };

  const recommendationTitleById = new Map((recommendations ?? []).map((r) => [r.id, r.title]));
  const actionPreviewRows = (actionRows ?? []).map((a) => ({
    id: a.id,
    status: a.status,
    title: recommendationTitleById.get(a.recommendation_id) ?? "",
  }));

  const snapshot = (result?.calculation_snapshot ?? {}) as { gaps?: Core1Gap[] };
  const gaps = snapshot.gaps ?? [];
  const profileVersion = Array.isArray(analysis.profile_versions) ? analysis.profile_versions[0] : analysis.profile_versions;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <ReportHeader
        completedAt={analysis.completed_at}
        targetRole={targetContext?.target_role ?? null}
        profileVersionNumber={profileVersion?.version_number ?? null}
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
          conflicts={(analysis.conflicts as string[] | null) ?? []}
        />
      </div>

      <SectionNav sections={REPORT_SECTIONS} />

      <div id="visao-geral" className="flex flex-col gap-8 scroll-mt-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <StrengthsCard mainStrength={result?.main_strength ?? ""} />
          <GapsCard gaps={gaps} />
          <TopRecommendationsCard recommendations={recommendations ?? []} />
        </div>

        <NextBestActionBanner action={result?.next_best_action ?? ""} />
      </div>

      <div className="flex flex-col gap-6">
        <div className="scroll-mt-24">
          <DimensionsSection dimensions={dimensions ?? []} />
        </div>
        <div className="scroll-mt-24">
          <StrengthsSection mainStrength={result?.main_strength ?? ""} />
        </div>
        <div className="scroll-mt-24">
          <GapsSection gaps={gaps} />
        </div>
        <div className="scroll-mt-24">
          <RecommendationsSection recommendations={recommendations ?? []} analysisId={analysisId} />
        </div>
        <div className="scroll-mt-24">
          <ActionPlanPreview actions={actionPreviewRows} />
        </div>
        <div className="scroll-mt-24">
          <SourceConflictsSection conflicts={(analysis.conflicts as string[] | null) ?? []} />
        </div>
      </div>

      <ReanalysisSection />

      <div className="rounded-lg border border-border p-4">
        <h2 className="text-base font-semibold text-foreground">Seu feedback</h2>
        <div className="mt-3">
          <FeedbackForm
            analysisId={analysisId}
            redirectTo={`/app/analise-perfil/${analysisId}`}
            showApplicationIntent={false}
            existing={feedback ?? null}
          />
        </div>
      </div>

      <ReportDisclaimer />
    </main>
  );
}
