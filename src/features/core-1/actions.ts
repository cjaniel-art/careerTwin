"use server";

import { createHash, randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { getAiProvider, EXTRACTION_MODEL } from "@/infrastructure/ai";
import { core1DimensionsOutputSchema, core1RecommendationsOutputSchema } from "@/config/schemas/core1";
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
type EnsuredAnalysisRow =
  | { ok: true; analysisId: string; alreadyCompleted: boolean }
  | { ok: false; reason: "preconditions" | "db_error" };

/** Shared by startProfileAnalysisAction and runInitialProfileAnalysis — creates/reuses the analyses row without deciding what happens next. */
async function ensureProfileAnalysisRow(): Promise<EnsuredAnalysisRow> {
  const { supabase, user } = await requireUser();
  const preconditions = await checkCore1Preconditions();
  if (!preconditions.ok) return { ok: false, reason: "preconditions" };

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
    return { ok: true, analysisId: existing.id, alreadyCompleted: true };
  }

  const analysisId = existing?.id ?? randomUUID();
  // A prior failure must be retryable — otherwise the processing page never
  // calls runProfileAnalysis again (it only runs while status === "processing")
  // and the user is stuck re-reading the same failure forever.
  const isRetry = existing?.status === "failed_retryable";

  if (!existing || isRetry) {
    if (isRetry) {
      const { error: updateError } = await supabase
        .from("analyses")
        .update({ status: "processing", started_at: new Date().toISOString(), completed_at: null })
        .eq("id", analysisId);
      if (updateError) return { ok: false, reason: "db_error" };
    } else {
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
      if (insertError) return { ok: false, reason: "db_error" };
    }
    trackEvent(ANALYTICS_EVENTS.profileAnalysisStarted, { userId: user.id, analysisId, analysisType: "profile_analysis" });
  }

  return { ok: true, analysisId, alreadyCompleted: false };
}

export async function startProfileAnalysisAction(): Promise<void> {
  const row = await ensureProfileAnalysisRow();
  if (!row.ok) {
    redirect(row.reason === "preconditions" ? "/app/analise-perfil?insuficiente=1" : "/app/analise-perfil?erro=1");
  }
  if (row.alreadyCompleted) {
    redirect(`/app/analise-perfil/${row.analysisId}`);
  }
  redirect(`/app/analise-perfil/processando/${row.analysisId}`);
}

export interface ProfileAnalysisStageResult {
  ok: boolean;
  /** False means "call me again" — this stage finished its own request but the pipeline isn't done. */
  done: boolean;
}

/**
 * Runs exactly one stage of the Core 1 pipeline for an analysis already in
 * `processing` (dimensions) or `preliminary` (recommendations), then
 * returns — never both in one call. The combined single-call version of this
 * (dimension classification + up to 8 evidence-grounded recommendations)
 * routinely exceeded Vercel's 60s function ceiling in production. The caller
 * (the onboarding pipeline's client-side loop, or the processing page's
 * self-redirect) is responsible for calling again while `done` is false.
 */
export async function runProfileAnalysisStage(analysisId: string): Promise<ProfileAnalysisStageResult> {
  const { supabase, user } = await requireUser();

  const { data: analysis } = await supabase
    .from("analyses")
    .select("id, status, profile_version_id, target_context_version_id")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .single();
  if (!analysis) return { ok: false, done: false };
  if (analysis.status === "completed") return { ok: true, done: true };
  if (analysis.status === "preliminary") return runRecommendationsStage(supabase, user.id, analysisId, analysis);
  if (analysis.status !== "processing") return { ok: false, done: false };

  return runDimensionsStage(supabase, user.id, analysisId, analysis);
}

type AnalysesClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function runDimensionsStage(
  supabase: AnalysesClient,
  userId: string,
  analysisId: string,
  analysis: { profile_version_id: string; target_context_version_id: string },
): Promise<ProfileAnalysisStageResult> {
  // Idempotent: ensureProfileAnalysisRow resets a failed_retryable analysis
  // straight back to "processing" on retry — if stage 1's results already
  // exist (this stage itself failed downstream, or the request died after
  // persisting but before returning), skip straight to stage 2 rather than
  // re-billing and re-running the model call.
  const { data: existingResult } = await supabase
    .from("profile_analysis_results")
    .select("analysis_id")
    .eq("analysis_id", analysisId)
    .maybeSingle();
  if (existingResult) {
    await supabase.from("analyses").update({ status: "preliminary" }).eq("id", analysisId);
    return { ok: true, done: false };
  }

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
      systemPrompt: buildDimensionsSystemPrompt(),
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
      schema: core1DimensionsOutputSchema,
      // Root cause of the production timeouts, found by measuring directly:
      // NOT the model being slow — a too-tight maxOutputTokens truncated the
      // response for a realistic profile, which fails schema.parse, which
      // triggers up to 3 sequential schema-repair attempts inside this one
      // call, each re-paying the full generation. A single untruncated
      // generation is comfortably fast; three of them chained is what blew
      // past 60s. Fixed at the source (below) rather than by choosing a
      // faster model. Kept on Haiku regardless: for structured
      // classification against a fixed rubric this is adequate quality,
      // and it's cheaper than Sonnet with no measured quality complaint —
      // not a reliability workaround.
      model: EXTRACTION_MODEL,
      // 16000 measured comfortably sufficient for a 5-experience profile with
      // the conciseness instruction above (dimensions/actions.ts's buildDimensionsSystemPrompt);
      // the previous formula computed as low as ~6750 tokens for that same
      // profile and truncated.
      maxOutputTokens: 16000,
    });

    const assessments: DimensionAssessment[] = result.data.dimensionAssessments.map((d) => ({
      dimension: d.dimension,
      rubricLevel: d.rubricLevel as 0 | 1 | 2 | 3 | 4,
      reasoning: d.reasoning,
    }));
    const ipp = calculateIpp(assessments);

    const confidence = calculateConfidence(
      {
        inputCompleteness: experienceCount > 0 ? 0.8 : 0.3,
        userConfirmation: 1.0,
        evidenceTraceability: evidenceCount > 0 ? 0.7 : 0.3,
        sourceConsistency: 0.9,
      },
      { reasons: result.data.confidenceAssessment.reasons, missingInformation: result.data.confidenceAssessment.missingInformation },
    );

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
      // `gaps` rides along in this jsonb blob purely so stage 2 — a separate
      // request — can read it back; there is no other place to hand off
      // stage 1's intermediate output between the two calls.
      calculation_snapshot: { ipp, confidence, gaps: result.data.gaps },
    });

    await supabase
      .from("analyses")
      .update({
        status: "preliminary",
        confidence_score: confidence.score,
        confidence_band: confidence.level,
        confidence_reasons: confidence.reasons,
        missing_information: confidence.missingInformation,
        model_version: result.modelVersion,
        prompt_version: prompt.version,
        schema_version: result.data.schemaVersion,
      })
      .eq("id", analysisId);

    return { ok: true, done: false };
  } catch (err) {
    await failAnalysis(supabase, analysisId, err);
    trackEvent(ANALYTICS_EVENTS.profileAnalysisFailed, { userId, analysisId, analysisType: "profile_analysis" });
    return { ok: false, done: false };
  }
}

async function runRecommendationsStage(
  supabase: AnalysesClient,
  userId: string,
  analysisId: string,
  analysis: { profile_version_id: string; target_context_version_id: string },
): Promise<ProfileAnalysisStageResult> {
  const { data: stage1 } = await supabase
    .from("profile_analysis_results")
    .select("calculation_snapshot, diagnosis, main_strength, main_gap, next_best_action, ipp_band")
    .eq("analysis_id", analysisId)
    .single();
  // The status gate in runProfileAnalysisStage guarantees stage 1 completed
  // before this stage can run — a missing row here means the data was lost
  // some other way, not a normal retry case.
  if (!stage1) return { ok: false, done: false };

  const { data: dimensionRows } = await supabase
    .from("profile_dimension_results")
    .select("dimension, rubric_level, reasoning")
    .eq("analysis_id", analysisId);

  const [profileContext, targetContext] = await Promise.all([
    fetchProfileContext(supabase, analysis.profile_version_id),
    fetchTargetContext(supabase, analysis.target_context_version_id),
  ]);

  const snapshot = stage1.calculation_snapshot as { gaps?: unknown };

  try {
    const provider = getAiProvider();
    const prompt = PROMPT_CATALOG["P-005-recommendations"]!;
    const result = await provider.complete({
      promptId: "P-005-recommendations",
      promptVersion: prompt.version,
      systemPrompt: buildRecommendationsSystemPrompt(),
      userContent: JSON.stringify({
        targetContext,
        // Condensed, not the full profileContext: stage 1 already reasoned
        // over the full text and distilled it into diagnosis/gaps below. A
        // real 24-experience/37-evidence profile, measured directly against
        // production, consistently exceeded 60s here when re-sending every
        // full experience (responsibilities, results, evidenceRefs) again —
        // this keeps just enough identity (id/company/role) and evidence
        // text for evidenceRefs to still cite real sourceIds/excerpts.
        experiences: profileContext.experiences.map((e) => ({ id: e.id, companyName: e.companyName, roleTitle: e.roleTitle })),
        skills: profileContext.skills.map((s) => ({ id: s.id, name: s.name })),
        tools: profileContext.tools.map((t) => ({ id: t.id, name: t.name })),
        evidences: profileContext.evidences.map((e) => ({ id: e.id, summary: e.summary, sourceType: e.sourceType })),
        analysis: {
          diagnosis: {
            summary: stage1.diagnosis,
            mainStrength: stage1.main_strength,
            mainGap: stage1.main_gap,
            nextBestAction: stage1.next_best_action,
          },
          dimensionAssessments: dimensionRows ?? [],
          gaps: snapshot.gaps ?? [],
        },
      }),
      schema: core1RecommendationsOutputSchema,
      // See the model/maxOutputTokens comments on the dimensions call above —
      // same root cause and same fix. Measured directly: at max_tokens 8000
      // without the conciseness instruction, this call truncated (stop_reason
      // "max_tokens") for a 5-experience/8-recommendation profile. With the
      // conciseness instruction, the same profile completed cleanly in 3495
      // output tokens — 16000 leaves ample margin for larger profiles.
      model: EXTRACTION_MODEL,
      maxOutputTokens: 16000,
    });

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

    // Idempotent: clears any partial insert from a previous failed attempt.
    // Safe before "completed" — the immutability trigger on `analyses` only
    // blocks further writes once status flips there, at the very end below.
    await supabase.from("recommendations").delete().eq("analysis_id", analysisId);

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

    await supabase.from("analyses").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", analysisId);

    trackEvent(ANALYTICS_EVENTS.profileAnalysisCompleted, {
      userId,
      analysisId,
      analysisType: "profile_analysis",
      properties: {
        ippBand: stage1.ipp_band,
        recommendationCount: result.data.recommendations.length,
      },
    });

    return { ok: true, done: true };
  } catch (err) {
    await failAnalysis(supabase, analysisId, err);
    trackEvent(ANALYTICS_EVENTS.profileAnalysisFailed, { userId, analysisId, analysisType: "profile_analysis" });
    return { ok: false, done: false };
  }
}

async function failAnalysis(supabase: AnalysesClient, analysisId: string, err: unknown): Promise<void> {
  // TEMP DEBUG (remove once root-caused): persist the raw failure into the
  // otherwise-unused `warnings` column since server console.error isn't reachable here.
  const debugDetail =
    err instanceof Error
      ? [err.message, err.cause instanceof Error ? err.cause.message : JSON.stringify(err.cause)].filter(Boolean)
      : [JSON.stringify(err)];
  await supabase.from("analyses").update({ status: "failed_retryable", warnings: debugDetail }).eq("id", analysisId);
  console.error("runProfileAnalysisStage failed:", err instanceof Error ? err.message : err);
}

/**
 * Creates the analysis row and runs exactly one stage of it — called from
 * the onboarding pipeline's client-side loop (features/onboarding/pipeline.ts),
 * which calls this again while `done` is false, one request per stage. Not a
 * loop-to-completion itself: doing both stages here would reintroduce the
 * same timeout risk runProfileAnalysisStage's split exists to avoid.
 */
export async function runInitialProfileAnalysis(): Promise<{ ok: boolean; done: boolean; analysisId?: string }> {
  const row = await ensureProfileAnalysisRow();
  if (!row.ok) return { ok: false, done: false };
  if (row.alreadyCompleted) return { ok: true, done: true, analysisId: row.analysisId };
  const result = await runProfileAnalysisStage(row.analysisId);
  return { ok: result.ok, done: result.done, analysisId: row.analysisId };
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

function buildDimensionsSystemPrompt(): string {
  return [
    "Você é o motor de Análise de Perfil (Core 1) do CareerTwin, etapa de classificação de dimensões.",
    "A mensagem do usuário contém o conteúdo real e completo do perfil confirmado (experiências, projetos, competências, ferramentas, evidências, formação, certificações, idiomas) e o contexto-alvo — baseie toda a análise exclusivamente nesse conteúdo, nunca em suposições.",
    "Classifique cada uma das sete dimensões do IPP em um nível de rubrica de 0 a 4, com justificativa concreta referenciando o conteúdo fornecido, e identifique as lacunas (gaps) do perfil frente ao contexto-alvo.",
    "As recomendações são geradas em uma etapa separada, com base neste diagnóstico — não as gere aqui.",
    "Você NUNCA calcula o IPP final nem a confiança final — isso é feito pelo backend.",
    "Nunca invente experiências, resultados, métricas ou competências não presentes no perfil confirmado.",
    'Em evidenceRefs, use sourceId = o id real do item citado (experience/evidence/skill/tool) exatamente como veio na entrada, sourceType conforme a origem (resume/linkedin/user), e excerpt com um trecho real do conteúdo — nunca invente ids ou trechos.',
    "Se o perfil fornecido estiver vazio ou quase vazio em uma dimensão, reflita isso honestamente com rubricLevel baixo, em vez de gerar texto genérico como se houvesse conteúdo.",
    // Verbose output was the actual cause of production timeouts — see the
    // model/maxOutputTokens comments on the call site below. For a profile
    // with 24 experiences (measured directly via a real production account),
    // this alone still wasn't enough margin against the extra latency of the
    // real Vercel→Anthropic network path (isolated calls from a dev machine
    // measured comfortably under 60s; the same call in production did not) —
    // an explicit cap on evidenceRefs per dimension is the next lever.
    "Seja direto e conciso em cada campo de texto (1-2 frases por campo, nunca um parágrafo longo).",
    "Em cada dimensão, cite no máximo 2 evidenceRefs — as mais representativas, não todas as aplicáveis.",
    "Retorne exclusivamente um JSON válido no formato do schema fornecido, sem texto adicional.",
  ].join(" ");
}

function buildRecommendationsSystemPrompt(): string {
  return [
    "Você é o motor de Análise de Perfil (Core 1) do CareerTwin, etapa de geração de recomendações.",
    "A mensagem do usuário contém identificadores do perfil confirmado (experiências, competências, ferramentas e evidências — apenas id e um resumo curto, não o texto completo), o contexto-alvo, e o diagnóstico, as dimensões classificadas e as lacunas já identificados em uma etapa anterior desta mesma análise — gere recomendações a partir desse diagnóstico, sem reavaliar as dimensões do zero.",
    `Gere no máximo ${CORE_1_CONFIG.recommendations.maximum} recomendações, cada uma endereçando uma lacuna real identificada.`,
    "Você NUNCA calcula a prioridade final das recomendações — isso é feito pelo backend a partir de impact/effort/urgency/confidence.",
    "Nunca invente experiências, resultados, métricas ou competências não presentes no perfil confirmado.",
    // Fields were condensed to fit a large profile (24+ experiences measured
    // in production) inside 60s — only id/company/role and id/summary are
    // available now, not the original full text, so excerpt must be built
    // from what's actually in this message.
    'Em evidenceRefs, use sourceId = o id real do item citado exatamente como veio na entrada, sourceType conforme a origem (resume/linkedin/user), e excerpt com o resumo fornecido para aquele item — nunca invente ids ou trechos que não estejam na entrada.',
    "Seja direto e conciso em cada campo de texto (1-2 frases por campo, nunca um parágrafo longo).",
    "Retorne exclusivamente um JSON válido no formato do schema fornecido, sem texto adicional.",
  ].join(" ");
}
