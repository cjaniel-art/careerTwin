"use server";

import { createHash, randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { getAiProvider } from "@/infrastructure/ai";
import { core1OutputSchema } from "@/config/schemas/core1";
import { PROMPT_CATALOG } from "@/config/prompts/catalog";
import { calculateIpp, type DimensionAssessment } from "@/domain/scores/ipp";
import { calculateConfidence } from "@/domain/scores/confidence";
import { orderByPriority, type PriorityInput, type LikertScale } from "@/domain/scores/priority";
import { CORE_1_CONFIG } from "@/config/engine/core1";
import {
  ENGINE_VERSION,
  IPP_RUBRIC_VERSION,
  CORE_1_CONFIG_VERSION,
} from "@/config/engine/versions";
import { isAccountDeletionPending } from "@/lib/account-status";
import { trackEvent } from "@/infrastructure/analytics";
import { ANALYTICS_EVENTS } from "@/infrastructure/analytics/events";
import { fetchProfileContext, fetchTargetContext } from "@/features/analysis/profile-context";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/analise-perfil");
  return { supabase, user };
}

export interface Core1Preconditions {
  ok: boolean;
  missing: string[];
  profileVersionId?: string;
  profileVersionNumber?: number;
  targetContextVersionId?: string;
  targetContextVersionNumber?: number;
}

/** PRD 02 §7 — re-checked server-side on every entry, never trusted from the client. */
export async function checkCore1Preconditions(): Promise<Core1Preconditions> {
  const { supabase, user } = await requireUser();
  const missing: string[] = [];

  if (await isAccountDeletionPending(supabase, user.id)) {
    missing.push("conta em processo de exclusão");
    return { ok: false, missing };
  }

  const { data: profile, error: profileError } = await supabase
    .from("professional_profiles")
    .select("id, status, current_version_id, profile_versions!professional_profiles_current_version_fk(id, version_number, status)")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError) console.error("checkCore1Preconditions: professional_profiles query failed:", profileError.message);

  if (!profile || profile.status !== "confirmed" || !profile.current_version_id) {
    missing.push("Thin Twin confirmado");
  }

  const { data: targetContext, error: targetContextError } = await supabase
    .from("target_contexts")
    .select(
      "id, status, current_version_id, target_context_versions!target_contexts_current_version_fk(id, version_number, confirmation_status)",
    )
    .eq("user_id", user.id)
    .maybeSingle();
  if (targetContextError) console.error("checkCore1Preconditions: target_contexts query failed:", targetContextError.message);

  if (!targetContext || targetContext.status !== "confirmed" || !targetContext.current_version_id) {
    missing.push("contexto-alvo confirmado");
  }

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  const profileVersion = Array.isArray(profile!.profile_versions)
    ? profile!.profile_versions[0]
    : profile!.profile_versions;
  const targetContextVersion = Array.isArray(targetContext!.target_context_versions)
    ? targetContext!.target_context_versions[0]
    : targetContext!.target_context_versions;

  return {
    ok: true,
    missing: [],
    profileVersionId: profile!.current_version_id!,
    profileVersionNumber: profileVersion?.version_number,
    targetContextVersionId: targetContext!.current_version_id!,
    targetContextVersionNumber: targetContextVersion?.version_number,
  };
}

/**
 * Starts (or reuses) a profile analysis. Freezes the Thin Twin and
 * target-context versions, runs the pipeline synchronously (see Fase 3/4
 * notes on the lack of a real queue/worker in this environment), persists
 * the backend-computed IPP/confidence/priority, and redirects to the result.
 */
export async function startProfileAnalysisAction(): Promise<void> {
  const { supabase, user } = await requireUser();
  const preconditions = await checkCore1Preconditions();
  if (!preconditions.ok) {
    redirect("/app/analise-perfil?insuficiente=1");
  }

  const idempotencyKey = [
    "profile_analysis",
    preconditions.profileVersionId,
    preconditions.targetContextVersionId,
    ENGINE_VERSION,
    IPP_RUBRIC_VERSION,
    CORE_1_CONFIG_VERSION,
  ].join(":");

  const { data: existing } = await supabase
    .from("analyses")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existing?.status === "completed") {
    redirect(`/app/analise-perfil/${existing.id}`);
  }

  const analysisId = existing?.id ?? randomUUID();

  if (!existing) {
    const { error: insertError } = await supabase.from("analyses").insert({
      id: analysisId,
      user_id: user.id,
      analysis_type: "profile_analysis",
      profile_version_id: preconditions.profileVersionId,
      target_context_version_id: preconditions.targetContextVersionId,
      status: "processing",
      idempotency_key: idempotencyKey,
      input_hash: createHash("sha256").update(idempotencyKey).digest("hex"),
      rubric_version: IPP_RUBRIC_VERSION,
      engine_version: ENGINE_VERSION,
      configuration_version: CORE_1_CONFIG_VERSION,
      started_at: new Date().toISOString(),
    });
    if (insertError) {
      redirect("/app/analise-perfil?erro=1");
    }
    trackEvent(ANALYTICS_EVENTS.profileAnalysisStarted, { userId: user.id, analysisId, analysisType: "profile_analysis" });
  }

  redirect(`/app/analise-perfil/processando/${analysisId}`);
}

/**
 * Runs the actual analysis pipeline for an analysis already in `processing`.
 * Separated from startProfileAnalysisAction so the processing page can
 * trigger it (simulating the async worker picking up the job).
 */
export async function runProfileAnalysis(analysisId: string): Promise<{ ok: boolean }> {
  const { supabase, user } = await requireUser();

  const { data: analysis } = await supabase
    .from("analyses")
    .select("id, status, profile_version_id, target_context_version_id")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .single();
  if (!analysis || analysis.status !== "processing") return { ok: analysis?.status === "completed" };

  const [profileContext, targetContext] = await Promise.all([
    fetchProfileContext(supabase, analysis.profile_version_id),
    fetchTargetContext(supabase, analysis.target_context_version_id),
  ]);
  const experienceCount = profileContext.experiences.length;
  const evidenceCount = profileContext.evidences.length;

  try {
    const provider = getAiProvider();
    const prompt = PROMPT_CATALOG["P-005"]!;
    const result = await provider.complete({
      promptId: "P-005",
      promptVersion: prompt.version,
      systemPrompt: buildCore1SystemPrompt(),
      userContent: JSON.stringify({
        targetContext,
        experiences: profileContext.experiences,
        projects: profileContext.projects,
        skills: profileContext.skills,
        tools: profileContext.tools,
        evidences: profileContext.evidences,
        education: profileContext.education,
        certifications: profileContext.certifications,
        languages: profileContext.languages,
      }),
      schema: core1OutputSchema,
    });

    const assessments: DimensionAssessment[] = result.data.dimensionAssessments.map((d) => ({
      dimension: d.dimension,
      rubricLevel: d.rubricLevel as 0 | 1 | 2 | 3 | 4,
      reasoning: d.reasoning,
    }));
    const ipp = calculateIpp(assessments);

    const hasExperience = experienceCount > 0;
    const hasEvidence = evidenceCount > 0;
    const confidence = calculateConfidence(
      {
        inputCompleteness: hasExperience ? 0.8 : 0.3,
        userConfirmation: 1.0,
        evidenceTraceability: hasEvidence ? 0.7 : 0.3,
        sourceConsistency: 0.9,
      },
      { reasons: result.data.confidenceAssessment.reasons, missingInformation: result.data.confidenceAssessment.missingInformation },
    );

    const priorityInputs: PriorityInput[] = result.data.recommendations
      .slice(0, CORE_1_CONFIG.recommendations.maximum)
      .map((r) => ({
        id: r.recommendationKey,
        impact: asLikert(r.impact),
        effort: asLikert(r.effort),
        urgency: asLikert(r.urgency),
        confidence: asLikert(r.confidence),
      }));
    const prioritized = orderByPriority(priorityInputs);

    await supabase.from("profile_dimension_results").insert(
      ipp.dimensions.map((d) => ({
        analysis_id: analysisId,
        dimension: d.dimension,
        rubric_level: d.rubricLevel,
        dimension_score: d.score,
        weight: d.weight,
        weighted_contribution: d.weightedContribution,
        reasoning: d.reasoning,
      })),
    );

    await supabase.from("profile_analysis_results").insert({
      analysis_id: analysisId,
      ipp_score: ipp.score,
      ipp_display_score: ipp.score,
      ipp_band: mapIppBand(ipp.level),
      diagnosis: result.data.diagnosis.summary,
      main_strength: result.data.diagnosis.mainStrength,
      main_gap: result.data.diagnosis.mainGap,
      next_best_action: result.data.diagnosis.nextBestAction,
      calculation_snapshot: { ipp, confidence },
    });

    if (result.data.recommendations.length > 0) {
      await supabase.from("recommendations").insert(
        result.data.recommendations.slice(0, CORE_1_CONFIG.recommendations.maximum).map((r) => {
          const p = prioritized.find((x) => x.id === r.recommendationKey)!;
          return {
            analysis_id: analysisId,
            recommendation_key: r.recommendationKey,
            category: mapRecommendationCategory(r.category),
            title: r.title,
            problem: r.problem,
            reasoning: r.reasoning,
            suggested_action: r.suggestedAction,
            expected_outcome: r.expectedOutcome,
            completion_criteria: r.completionCriteria,
            impact: r.impact,
            effort: r.effort,
            urgency: r.urgency,
            confidence: r.confidence,
            priority_score: p.priorityScore100,
            priority_order: p.priorityOrder,
            status: p.priorityOrder <= CORE_1_CONFIG.recommendations.highlightedMaximum ? "highlighted" : "generated",
          };
        }),
      );
    }

    await supabase
      .from("analyses")
      .update({
        status: "completed",
        confidence_score: confidence.score,
        confidence_band: confidence.level,
        confidence_reasons: confidence.reasons,
        missing_information: confidence.missingInformation,
        model_version: result.modelVersion,
        prompt_version: prompt.version,
        schema_version: result.data.schemaVersion,
        completed_at: new Date().toISOString(),
      })
      .eq("id", analysisId);

    trackEvent(ANALYTICS_EVENTS.profileAnalysisCompleted, {
      userId: user.id,
      analysisId,
      analysisType: "profile_analysis",
      properties: {
        ippBand: mapIppBand(ipp.level),
        confidenceLevel: confidence.level,
        recommendationCount: result.data.recommendations.length,
      },
    });

    return { ok: true };
  } catch (err) {
    await supabase.from("analyses").update({ status: "failed_retryable" }).eq("id", analysisId);
    trackEvent(ANALYTICS_EVENTS.profileAnalysisFailed, { userId: user.id, analysisId, analysisType: "profile_analysis" });
    console.error("runProfileAnalysis failed:", err instanceof Error ? err.message : err);
    return { ok: false };
  }
}

/** Schema already validated these as integers 1..5 at runtime (core1.ts). */
function asLikert(n: number): LikertScale {
  return n as LikertScale;
}

function mapIppBand(level: string): "low_readiness" | "developing_readiness" | "good_readiness" | "high_readiness" {
  switch (level) {
    case "low_readiness":
    case "developing_readiness":
    case "good_readiness":
    case "high_readiness":
      return level;
    default:
      return "low_readiness";
  }
}

function mapRecommendationCategory(category: string): "competency" | "communication" | "evidence" | "positioning" {
  const map: Record<string, "competency" | "communication" | "evidence" | "positioning"> = {
    competencia: "competency",
    comunicacao: "communication",
    evidencia: "evidence",
    posicionamento: "positioning",
  };
  return map[category] ?? "evidence";
}

function buildCore1SystemPrompt(): string {
  return [
    "Você é o motor de Análise de Perfil (Core 1) do CareerTwin.",
    "A mensagem do usuário contém o conteúdo real e completo do perfil confirmado (experiências, projetos, competências, ferramentas, evidências, formação, certificações, idiomas) e o contexto-alvo — baseie toda a análise exclusivamente nesse conteúdo, nunca em suposições.",
    "Classifique cada uma das sete dimensões do IPP em um nível de rubrica de 0 a 4, com justificativa concreta referenciando o conteúdo fornecido.",
    "Você NUNCA calcula o IPP final, a confiança final, nem a prioridade das recomendações — isso é feito pelo backend.",
    "Nunca invente experiências, resultados, métricas ou competências não presentes no perfil confirmado.",
    'Em evidenceRefs, use sourceId = o id real do item citado (experience/evidence/skill/tool) exatamente como veio na entrada, sourceType conforme a origem (resume/linkedin/user), e excerpt com um trecho real do conteúdo — nunca invente ids ou trechos.',
    "Se o perfil fornecido estiver vazio ou quase vazio em uma dimensão, reflita isso honestamente com rubricLevel baixo, em vez de gerar texto genérico como se houvesse conteúdo.",
    "Retorne exclusivamente um JSON válido no formato do schema fornecido, sem texto adicional.",
  ].join(" ");
}
