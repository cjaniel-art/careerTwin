import { redirect } from "next/navigation";
import { AlertTriangle, Eye, FileText, LayoutGrid, ListChecks, Settings2, ShieldAlert, Sparkles } from "lucide-react";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import type { Core2Risk, Core2SeniorityAssessment, Core2Strength } from "@/config/schemas/core2";
import type { GapType, RequirementCategory, RequirementCriticality } from "@/config/engine/core2";
import type { EvidenceReference } from "@/config/schemas/evidence";
import { LIMIT_TYPE_LABELS, RECOMMENDATION_LABELS } from "@/lib/result-labels";
import { ACTIONS_CONFIG } from "@/config/engine/actions";
import { ReportHeader } from "@/features/core-2/report/report-header";
import { JobSummaryCard } from "@/features/core-2/report/job-summary-card";
import { IaoScoreCard } from "@/features/core-2/report/iao-score-card";
import { ConfidenceCard } from "@/features/core-1/report/confidence-card";
import { RecommendationCard } from "@/features/core-2/report/recommendation-card";
import { ReportTabsRoot, ReportTabsList, ReportTabsTrigger, ReportTabsContent } from "@/features/core-1/report/report-tabs";
import { MatchSummaryCard } from "@/features/core-2/report/match-summary-card";
import { StrengthsCard } from "@/features/core-2/report/strengths-card";
import { GapsCard } from "@/features/core-2/report/gaps-card";
import { CriticalitySummaryCard } from "@/features/core-2/report/criticality-summary-card";
import { AdherenceDistributionCard } from "@/features/core-2/report/adherence-distribution-card";
import { RequirementsSection } from "@/features/core-2/report/requirements-section";
import { CompetenciesSection } from "@/features/core-2/report/competencies-section";
import { GapsSection } from "@/features/core-2/report/gaps-section";
import { StrengthsSection } from "@/features/core-2/report/strengths-section";
import { RisksSection } from "@/features/core-2/report/risks-section";
import { ActionPlanSection } from "@/features/core-2/report/action-plan-section";
import { EvidenceSection } from "@/features/core-2/report/evidence-section";
import { computeCriticalityBuckets, computeDistribution, computeMatchSummary, type RequirementRow } from "@/features/core-2/report/derive";

export const metadata = { title: "Relatório de Aderência à Vaga — CareerTwin" };
export const dynamic = "force-dynamic";

interface CalculationSnapshot {
  strengths?: Core2Strength[];
  risks?: Core2Risk[];
  seniorityAssessment?: Core2SeniorityAssessment;
  evidenceByRequirement?: Record<string, EvidenceReference[]>;
}

export default async function JobAnalysisResultPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/app/aderencia/${analysisId}`);

  const { data: analysis } = await supabase
    .from("analyses")
    .select(
      "id, status, confidence_band, confidence_reasons, missing_information, conflicts, opportunity_version_id",
    )
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!analysis) redirect("/app/aderencia");
  if (analysis.status !== "completed") redirect(`/app/aderencia/processando/${analysisId}`);

  const [{ data: result }, { data: assessments }, { data: requirements }, { data: opportunityVersion }, { data: limits }] =
    await Promise.all([
      supabase.from("fit_analysis_results").select("*").eq("analysis_id", analysisId).single(),
      supabase
        .from("requirement_assessments")
        .select("requirement_id, match_status, reasoning, gap_type, assessment_confidence")
        .eq("analysis_id", analysisId),
      supabase
        .from("requirements")
        .select("id, description, category, criticality, applicability, extraction_confidence")
        .eq("opportunity_version_id", analysis.opportunity_version_id),
      supabase
        .from("opportunity_versions")
        .select("title, company, reference_url, created_at")
        .eq("id", analysis.opportunity_version_id)
        .maybeSingle(),
      supabase.from("analysis_limits").select("limit_type").eq("analysis_id", analysisId),
    ]);

  const snapshot = (result?.calculation_snapshot ?? {}) as CalculationSnapshot;
  const strengths = snapshot.strengths ?? [];
  const risks = snapshot.risks ?? [];
  const seniorityAssessment = snapshot.seniorityAssessment ?? null;
  const evidenceByRequirement = snapshot.evidenceByRequirement ?? {};

  const { data: actionCandidateRows } = await supabase
    .from("core2_action_candidates")
    .select("id, title, reasoning, suggested_action, horizon, impact, effort, status")
    .eq("analysis_id", analysisId)
    .order("created_at", { ascending: true });

  const actionCandidateIds = (actionCandidateRows ?? []).map((c) => c.id);
  const [{ data: actionRows }, { count: activeActionsCount }] = await Promise.all([
    actionCandidateIds.length
      ? supabase
          .from("actions")
          .select("id, status, core2_action_candidate_id")
          .eq("user_id", user.id)
          .in("core2_action_candidate_id", actionCandidateIds)
      : Promise.resolve({ data: [] as { id: string; status: string; core2_action_candidate_id: string }[] }),
    supabase
      .from("actions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("status", ["pending", "selected", "in_progress"]),
  ]);

  const actionCandidateById = new Map((actionCandidateRows ?? []).map((c) => [c.id, c]));
  const actionPreviewRows = (actionRows ?? []).map((a) => ({
    id: a.id,
    status: a.status,
    title: actionCandidateById.get(a.core2_action_candidate_id)?.title ?? "",
    suggestedAction: actionCandidateById.get(a.core2_action_candidate_id)?.suggested_action ?? "",
  }));
  const availableActionCandidates = (actionCandidateRows ?? [])
    .filter((c) => c.status === "generated")
    .map((c) => ({ id: c.id, title: c.title, reasoning: c.reasoning, horizon: c.horizon, impact: c.impact, effort: c.effort }));
  const atActionsLimit = (activeActionsCount ?? 0) >= ACTIONS_CONFIG.maximum;

  const assessmentByRequirement = new Map((assessments ?? []).map((a) => [a.requirement_id, a]));
  const rows: RequirementRow[] = (requirements ?? []).map((r) => {
    const assessment = assessmentByRequirement.get(r.id);
    return {
      id: r.id,
      description: r.description,
      category: r.category as RequirementCategory,
      criticality: r.criticality as RequirementCriticality,
      applicability: r.applicability as RequirementRow["applicability"],
      extractionConfidence: r.extraction_confidence,
      matchStatus: (assessment?.match_status ?? "unknown") as RequirementRow["matchStatus"],
      reasoning: assessment?.reasoning ?? "Sem avaliação registrada.",
      gapType: (assessment?.gap_type as GapType | null) ?? null,
      assessmentConfidence: assessment?.assessment_confidence ?? 0,
      evidenceRefs: evidenceByRequirement[r.id] ?? [],
    };
  });

  const criticalityBuckets = computeCriticalityBuckets(rows);
  const distribution = computeDistribution(rows);
  const matchSummary = computeMatchSummary(rows, seniorityAssessment);
  const conflicts = (analysis.conflicts as string[] | null) ?? [];

  const jobDate = opportunityVersion?.created_at
    ? new Date(opportunityVersion.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  return (
    <main className="flex w-full flex-col gap-8 px-6 py-10 lg:px-10">
      <ReportHeader />

      <JobSummaryCard
        job={{
          title: opportunityVersion?.title ?? "Vaga sem título",
          company: opportunityVersion?.company ?? "Empresa não informada",
          url: opportunityVersion?.reference_url ?? undefined,
        }}
        date={jobDate}
      />

      {limits && limits.length > 0 ? (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          Limite de segurança aplicado: {limits.map((l) => LIMIT_TYPE_LABELS[l.limit_type] ?? l.limit_type).join("; ")}
        </p>
      ) : null}

      <ReportTabsRoot defaultValue="visao-geral">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <IaoScoreCard score={result?.iao_display_score ?? 0} band={result?.iao_band ?? ""} />
          <ConfidenceCard
            level={analysis.confidence_band ?? ""}
            reasons={(analysis.confidence_reasons as string[] | null) ?? []}
            missingInformation={(analysis.missing_information as string[] | null) ?? []}
            conflicts={conflicts}
          />
          <RecommendationCard
            type={result?.recommendation_type ?? "insufficient_data"}
            reasoning={result?.recommendation_reasoning ?? RECOMMENDATION_LABELS[result?.recommendation_type ?? ""] ?? ""}
          />
        </div>

        <ReportTabsList>
          <ReportTabsTrigger value="visao-geral">
            <LayoutGrid className="size-4" aria-hidden />
            Visão geral
          </ReportTabsTrigger>
          <ReportTabsTrigger value="requisitos">
            <FileText className="size-4" aria-hidden />
            Requisitos da vaga
          </ReportTabsTrigger>
          <ReportTabsTrigger value="competencias">
            <Settings2 className="size-4" aria-hidden />
            Competências
          </ReportTabsTrigger>
          <ReportTabsTrigger value="lacunas">
            <AlertTriangle className="size-4" aria-hidden />
            Lacunas
          </ReportTabsTrigger>
          <ReportTabsTrigger value="forcas">
            <Sparkles className="size-4" aria-hidden />
            Forças
          </ReportTabsTrigger>
          <ReportTabsTrigger value="riscos">
            <ShieldAlert className="size-4" aria-hidden />
            Riscos
          </ReportTabsTrigger>
          <ReportTabsTrigger value="plano-de-acao">
            <ListChecks className="size-4" aria-hidden />
            Plano de ação
          </ReportTabsTrigger>
          <ReportTabsTrigger value="evidencias">
            <Eye className="size-4" aria-hidden />
            Evidências
          </ReportTabsTrigger>
        </ReportTabsList>

        <ReportTabsContent value="visao-geral" className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <MatchSummaryCard dimensions={matchSummary} />
            <StrengthsCard strengths={strengths} />
            <GapsCard rows={rows} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CriticalitySummaryCard buckets={criticalityBuckets} />
            <AdherenceDistributionCard distribution={distribution} />
          </div>
        </ReportTabsContent>

        <ReportTabsContent value="requisitos">
          <RequirementsSection rows={rows} />
        </ReportTabsContent>
        <ReportTabsContent value="competencias">
          <CompetenciesSection rows={rows} />
        </ReportTabsContent>
        <ReportTabsContent value="lacunas">
          <GapsSection rows={rows} />
        </ReportTabsContent>
        <ReportTabsContent value="forcas">
          <StrengthsSection strengths={strengths} rows={rows} />
        </ReportTabsContent>
        <ReportTabsContent value="riscos">
          <RisksSection risks={risks} seniority={seniorityAssessment} rows={rows} />
        </ReportTabsContent>
        <ReportTabsContent value="plano-de-acao">
          <ActionPlanSection
            analysisId={analysisId}
            actions={actionPreviewRows}
            candidates={availableActionCandidates}
            atLimit={atActionsLimit}
          />
        </ReportTabsContent>
        <ReportTabsContent value="evidencias">
          <EvidenceSection rows={rows} />
        </ReportTabsContent>
      </ReportTabsRoot>

      <p className="text-center text-xs leading-5 text-muted-foreground">
        O IAO mede a correspondência observável entre seu perfil confirmado e os requisitos desta vaga. Ele não
        representa probabilidade de entrevista, aprovação ou contratação. A decisão final é sempre sua.
      </p>
    </main>
  );
}
