// Runs one stage (dimensions or recommendations) of Core 1's Análise de
// Perfil. Dispatched by Vercel's runProfileAnalysisStage
// (src/features/core-1/actions.ts) instead of running the AI call inline —
// see that file's comment for why. This function acks the dispatch in well
// under a second and does the actual work in EdgeRuntime.waitUntil, so its
// budget is this project's Edge Function wall-clock ceiling (150s on the
// free plan), not Vercel's 60s Hobby-plan ceiling.
//
// This intentionally duplicates a slice of src/features/core-1/actions.ts,
// src/domain/scores/{ipp,confidence,priority}.ts and
// src/config/{schemas/core1,engine/core1,engine/confidence}.ts — Deno edge
// functions can't import the Next.js app's "@/..." tree. Keep the two in
// sync by hand; the Next.js versions remain the source of truth for the
// scoring formulas (Motor de Análise e Scores §4-§7/§13/§15).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import postgres from "npm:postgres@3";
import { z } from "npm:zod@3";
import { zodToJsonSchema } from "npm:zod-to-json-schema@3";

const MODEL = "claude-haiku-4-5-20251001"; // == EXTRACTION_MODEL in src/infrastructure/ai/index.ts
const ANTHROPIC_VERSION = "2023-06-01";
const EXTRACTION_TOOL_NAME = "emit_structured_output";
const MAX_OUTPUT_TOKENS = 16000; // == the Core 1 call sites in src/features/core-1/actions.ts
const RECOMMENDATIONS_MAXIMUM = 8; // == CORE_1_CONFIG.recommendations.maximum
const RECOMMENDATIONS_HIGHLIGHTED_MAXIMUM = 3; // == CORE_1_CONFIG.recommendations.highlightedMaximum

// ---- vault-backed secrets (Deno.env doesn't carry these; see the migration
// note in the dispatcher) — read once per cold start via a direct Postgres
// connection, then cached in module scope for the isolate's lifetime. ----
let secretsPromise: Promise<{ anthropicApiKey: string; dispatchSecret: string }> | null = null;
async function getSecrets() {
  if (!secretsPromise) {
    secretsPromise = (async () => {
      const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { max: 1 });
      try {
        const rows = await sql<{ name: string; decrypted_secret: string }[]>`
          select name, decrypted_secret from vault.decrypted_secrets
          where name in ('anthropic_api_key', 'edge_dispatch_secret')
        `;
        const byName = new Map(rows.map((r) => [r.name, r.decrypted_secret]));
        const anthropicApiKey = byName.get("anthropic_api_key");
        const dispatchSecret = byName.get("edge_dispatch_secret");
        if (!anthropicApiKey || !dispatchSecret) throw new Error("core1-analysis: missing vault secret(s)");
        return { anthropicApiKey, dispatchSecret };
      } finally {
        await sql.end();
      }
    })();
  }
  return secretsPromise;
}

function serviceClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
}

// ---- schemas (ported from src/config/schemas/{evidence,core1}.ts) ----
const evidenceReferenceSchema = z.object({
  sourceType: z.enum(["resume", "linkedin", "user"]),
  sourceId: z.string(),
  excerpt: z.string(),
  extractionConfidence: z.number().min(0).max(1).optional(),
});

const IPP_DIMENSIONS = [
  "objective_clarity",
  "experience_quality",
  "evidence_and_results",
  "skills_and_tools",
  "cross_source_consistency",
  "positioning_quality",
  "profile_completeness",
] as const;

const SCHEMA_VERSION_CORE_1 = "core-1/1.1" as const;

const gapSchema = z.object({
  type: z.enum(["competencia", "comunicacao", "evidencia", "posicionamento", "desconhecida"]),
  description: z.string(),
  evidenceRefs: z.array(evidenceReferenceSchema),
  missingInformation: z.array(z.string()),
});

const core1DimensionsOutputSchema = z.object({
  analysisType: z.literal("profile_analysis"),
  profileVersionId: z.string(),
  targetContextVersionId: z.string(),
  promptVersion: z.string(),
  schemaVersion: z.literal(SCHEMA_VERSION_CORE_1),
  rubricVersion: z.string(),
  confidenceAssessment: z.object({
    reasons: z.array(z.string()),
    missingInformation: z.array(z.string()),
    conflicts: z.array(z.string()),
  }),
  dimensionAssessments: z.array(
    z.object({
      dimension: z.enum(IPP_DIMENSIONS),
      rubricLevel: z.number().int().min(0).max(4),
      reasoning: z.string(),
      evidenceRefs: z.array(evidenceReferenceSchema),
      relatedRecommendationKeys: z.array(z.string()),
    }),
  ),
  diagnosis: z.object({
    summary: z.string(),
    mainStrength: z.string(),
    mainGap: z.string(),
    nextBestAction: z.string(),
  }),
  gaps: z.array(gapSchema),
  warnings: z.array(z.string()),
});

const recommendationCandidateSchema = z.object({
  recommendationKey: z.string(),
  category: z.enum(["competencia", "comunicacao", "evidencia", "posicionamento"]),
  title: z.string(),
  problem: z.string(),
  reasoning: z.string(),
  evidenceRefs: z.array(evidenceReferenceSchema),
  missingEvidence: z.array(z.string()),
  suggestedAction: z.string(),
  expectedOutcome: z.string(),
  impact: z.number().int().min(1).max(5),
  effort: z.number().int().min(1).max(5),
  urgency: z.number().int().min(1).max(5),
  confidence: z.number().int().min(1).max(5),
  completionCriteria: z.string(),
});

const core1RecommendationsOutputSchema = z.object({
  recommendations: z.array(recommendationCandidateSchema),
  warnings: z.array(z.string()),
});

// ---- scoring config (ported from src/config/engine/{core1,confidence}.ts) ----
const CORE_1_CONFIG = {
  ipp: {
    weights: {
      objective_clarity: 0.15,
      experience_quality: 0.2,
      evidence_and_results: 0.2,
      skills_and_tools: 0.15,
      cross_source_consistency: 0.1,
      positioning_quality: 0.1,
      profile_completeness: 0.1,
    } as Record<(typeof IPP_DIMENSIONS)[number], number>,
    levels: { low: [0, 39], developing: [40, 59], good: [60, 79], high: [80, 100] },
  },
  confidence: {
    weights: { inputCompleteness: 0.3, userConfirmation: 0.3, evidenceTraceability: 0.25, sourceConsistency: 0.15 },
    levels: { low: [0, 0.49], medium: [0.5, 0.79], high: [0.8, 1] },
  },
  recommendations: {
    priorityWeights: { impact: 0.4, urgency: 0.25, effortBenefit: 0.2, confidence: 0.15 },
  },
};

// ---- scoring (ported from src/domain/scores/{ipp,confidence,priority}.ts) ----
function levelForIpp(score: number): "low_readiness" | "developing_readiness" | "good_readiness" | "high_readiness" {
  const { low, developing, good, high } = CORE_1_CONFIG.ipp.levels;
  if (score >= high[0]) return "high_readiness";
  if (score >= good[0]) return "good_readiness";
  if (score >= developing[0]) return "developing_readiness";
  return "low_readiness";
}

function calculateIpp(
  assessments: { dimension: (typeof IPP_DIMENSIONS)[number]; rubricLevel: number; reasoning: string }[],
) {
  const byDimension = new Map(assessments.map((a) => [a.dimension, a]));
  const dimensions = IPP_DIMENSIONS.map((dimension) => {
    const assessment = byDimension.get(dimension);
    if (!assessment) throw new Error(`calculateIpp: missing required dimension "${dimension}"`);
    const weight = CORE_1_CONFIG.ipp.weights[dimension];
    const score = (assessment.rubricLevel / 4) * 100;
    const weightedContribution = score * weight;
    return { dimension, rubricLevel: assessment.rubricLevel, score, weight, weightedContribution, reasoning: assessment.reasoning };
  });
  const score = Math.round(dimensions.reduce((sum, d) => sum + d.weightedContribution, 0));
  return { score, level: levelForIpp(score), dimensions };
}

function calculateConfidence(
  components: { inputCompleteness: number; userConfirmation: number; evidenceTraceability: number; sourceConsistency: number },
  context: { reasons?: string[]; missingInformation?: string[]; conflicts?: string[] } = {},
) {
  const { weights, levels } = CORE_1_CONFIG.confidence;
  const raw =
    components.inputCompleteness * weights.inputCompleteness +
    components.userConfirmation * weights.userConfirmation +
    components.evidenceTraceability * weights.evidenceTraceability +
    components.sourceConsistency * weights.sourceConsistency;
  const score = Math.round(raw * 1000) / 1000;
  const level = score >= levels.high[0] ? "high" : score >= levels.medium[0] ? "medium" : "low";
  return { score, level, reasons: context.reasons ?? [], missingInformation: context.missingInformation ?? [], conflicts: context.conflicts ?? [] };
}

function orderByPriority(inputs: { id: string; impact: number; effort: number; urgency: number; confidence: number }[]) {
  const { priorityWeights } = CORE_1_CONFIG.recommendations;
  const scored = inputs.map((input) => {
    const effortBenefit = 6 - input.effort;
    const priorityScore =
      input.impact * priorityWeights.impact +
      input.urgency * priorityWeights.urgency +
      effortBenefit * priorityWeights.effortBenefit +
      input.confidence * priorityWeights.confidence;
    return { input, priorityScore100: Math.round((priorityScore / 5) * 100) };
  });
  scored.sort((a, b) => {
    if (b.priorityScore100 !== a.priorityScore100) return b.priorityScore100 - a.priorityScore100;
    if (b.input.impact !== a.input.impact) return b.input.impact - a.input.impact;
    if (a.input.effort !== b.input.effort) return a.input.effort - b.input.effort;
    return b.input.confidence - a.input.confidence;
  });
  return scored.map(({ input, priorityScore100 }, index) => ({ id: input.id, priorityScore100, priorityOrder: index + 1 }));
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

// ---- prompts (verbatim from src/features/core-1/actions.ts) ----
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
    "Seja direto e conciso em cada campo de texto (1-2 frases por campo, nunca um parágrafo longo).",
    "Em cada dimensão, cite no máximo 2 evidenceRefs — as mais representativas, não todas as aplicáveis.",
    "Retorne exclusivamente um JSON válido no formato do schema fornecido, sem texto adicional.",
  ].join(" ");
}

function buildRecommendationsSystemPrompt(): string {
  return [
    "Você é o motor de Análise de Perfil (Core 1) do CareerTwin, etapa de geração de recomendações.",
    "A mensagem do usuário contém identificadores do perfil confirmado (experiências, competências, ferramentas e evidências — apenas id e um resumo curto, não o texto completo), o contexto-alvo, e o diagnóstico, as dimensões classificadas e as lacunas já identificados em uma etapa anterior desta mesma análise — gere recomendações a partir desse diagnóstico, sem reavaliar as dimensões do zero.",
    `Gere no máximo ${RECOMMENDATIONS_MAXIMUM} recomendações, cada uma endereçando uma lacuna real identificada.`,
    "Você NUNCA calcula a prioridade final das recomendações — isso é feito pelo backend a partir de impact/effort/urgency/confidence.",
    "Nunca invente experiências, resultados, métricas ou competências não presentes no perfil confirmado.",
    'Em evidenceRefs, use sourceId = o id real do item citado exatamente como veio na entrada, sourceType conforme a origem (resume/linkedin/user), e excerpt com o resumo fornecido para aquele item — nunca invente ids ou trechos que não estejam na entrada.',
    "Seja direto e conciso em cada campo de texto (1-2 frases por campo, nunca um parágrafo longo).",
    "Retorne exclusivamente um JSON válido no formato do schema fornecido, sem texto adicional.",
  ].join(" ");
}

// ---- Anthropic call + 3-stage schema repair (ported from
// src/infrastructure/ai/{anthropic-provider,schema-repair}.ts) ----
function tryParseJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return JSON.parse(fenced ? fenced[1]! : text);
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 500);
  return "invalid output";
}

async function completeWithSchema<T>(apiKey: string, systemPrompt: string, userContent: string, schema: z.ZodType<T>): Promise<T> {
  const inputSchema = zodToJsonSchema(schema);
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    const repairNote =
      attempt === 0
        ? undefined
        : attempt === 1
          ? `\n\nThe previous response failed schema validation: ${describeError(lastError)}. Return corrected JSON only, without changing any field that was already valid.`
          : `\n\nSTRICT REPAIR MODE. The previous response still failed validation: ${describeError(lastError)}. Return ONLY the JSON object matching the schema exactly — no prose, no markdown fence, no extra fields.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": ANTHROPIC_VERSION },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: userContent, cache_control: { type: "ephemeral" } },
              ...(repairNote ? [{ type: "text", text: repairNote }] : []),
            ],
          },
        ],
        tools: [
          {
            name: EXTRACTION_TOOL_NAME,
            description: "Emit the structured result. Must match the input schema exactly — every required field present.",
            input_schema: inputSchema,
            cache_control: { type: "ephemeral" },
          },
        ],
        tool_choice: { type: "tool", name: EXTRACTION_TOOL_NAME },
      }),
    });

    if (!response.ok) {
      lastError = new Error(`Anthropic API ${response.status}: ${(await response.text()).slice(0, 500)}`);
      continue;
    }

    const body = await response.json();
    const toolUse = (body.content ?? []).find((block: { type: string }) => block.type === "tool_use");
    if (!toolUse) {
      lastError = new Error("no tool_use block in Anthropic response");
      continue;
    }

    try {
      const parsed = typeof toolUse.input === "string" ? tryParseJson(toolUse.input) : toolUse.input;
      return schema.parse(parsed);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("schema validation failed after 3 attempts");
}

// ---- profile/target context (ported from src/features/analysis/profile-context.ts) ----
// deno-lint-ignore no-explicit-any
async function fetchProfileContext(supabase: any, profileVersionId: string) {
  const [{ data: experiences }, { data: skills }, { data: tools }, { data: evidences }] = await Promise.all([
    supabase.from("experiences").select("id, company_name, role_title").eq("profile_version_id", profileVersionId),
    supabase
      .from("profile_skills")
      .select("id, original_term, skills(normalized_name)")
      .eq("profile_version_id", profileVersionId),
    supabase.from("profile_tools").select("id, original_term, tools(normalized_name)").eq("profile_version_id", profileVersionId),
    supabase
      .from("evidences")
      .select("id, summary, source_type")
      .eq("profile_version_id", profileVersionId),
  ]);

  return {
    experiences: (experiences ?? []).map((e: { id: string; company_name: string; role_title: string }) => ({
      id: e.id,
      companyName: e.company_name,
      roleTitle: e.role_title,
    })),
    skills: (skills ?? []).map((s: { id: string; original_term: string; skills: { normalized_name: string } | { normalized_name: string }[] | null }) => {
      const skill = Array.isArray(s.skills) ? s.skills[0] : s.skills;
      return { id: s.id, name: skill?.normalized_name ?? s.original_term };
    }),
    tools: (tools ?? []).map((t: { id: string; original_term: string; tools: { normalized_name: string } | { normalized_name: string }[] | null }) => {
      const tool = Array.isArray(t.tools) ? t.tools[0] : t.tools;
      return { id: t.id, name: tool?.normalized_name ?? t.original_term };
    }),
    evidences: (evidences ?? []).map((e: { id: string; summary: string; source_type: string }) => ({
      id: e.id,
      summary: e.summary,
      sourceType: e.source_type,
    })),
  };
}

// The dimensions call needs the fuller shape (responsibilities, projects,
// education, etc.) that runDimensionsStage sends today — the recommendations
// call above intentionally only needs the condensed id/name/summary shape
// (see the comment on the recommendations userContent in actions.ts).
// deno-lint-ignore no-explicit-any
async function fetchFullProfileContext(supabase: any, profileVersionId: string) {
  const [
    { data: experiences },
    { data: projects },
    { data: profileSkills },
    { data: profileTools },
    { data: evidences },
    { data: education },
    { data: certifications },
    { data: languages },
  ] = await Promise.all([
    supabase
      .from("experiences")
      .select("id, company_name, role_title, employment_type, start_date, end_date, is_current, description, scope_summary")
      .eq("profile_version_id", profileVersionId),
    supabase.from("projects").select("id, name, context, objective, user_role, activities, deliverables, results").eq("profile_version_id", profileVersionId),
    supabase.from("profile_skills").select("id, original_term, declared_level, skills(normalized_name, skill_type)").eq("profile_version_id", profileVersionId),
    supabase.from("profile_tools").select("id, original_term, usage_context, declared_level, tools(normalized_name)").eq("profile_version_id", profileVersionId),
    supabase.from("evidences").select("id, evidence_type, summary, context, source_type, source_snippet").eq("profile_version_id", profileVersionId),
    supabase.from("education_records").select("id, institution, degree, field_of_study").eq("profile_version_id", profileVersionId),
    supabase.from("certifications").select("id, name, issuer").eq("profile_version_id", profileVersionId),
    supabase.from("languages").select("id, language, proficiency").eq("profile_version_id", profileVersionId),
  ]);

  const experienceIds = (experiences ?? []).map((e: { id: string }) => e.id);
  const { data: responsibilities } =
    experienceIds.length > 0
      ? await supabase.from("experience_responsibilities").select("experience_id, description").in("experience_id", experienceIds)
      : { data: [] as { experience_id: string; description: string }[] };
  const responsibilitiesMap = new Map<string, string[]>();
  for (const r of responsibilities ?? []) {
    const list = responsibilitiesMap.get(r.experience_id) ?? [];
    list.push(r.description);
    responsibilitiesMap.set(r.experience_id, list);
  }

  return {
    experiences: (experiences ?? []).map((e: Record<string, unknown>) => ({
      id: e.id,
      companyName: e.company_name,
      roleTitle: e.role_title,
      employmentType: e.employment_type,
      startDate: e.start_date,
      endDate: e.end_date,
      isCurrent: e.is_current,
      description: e.description,
      scopeSummary: e.scope_summary,
      responsibilities: responsibilitiesMap.get(e.id as string) ?? [],
    })),
    projects: projects ?? [],
    skills: (profileSkills ?? []).map((s: { id: string; original_term: string; declared_level: string | null; skills: { normalized_name: string; skill_type: string } | { normalized_name: string; skill_type: string }[] | null }) => {
      const skill = Array.isArray(s.skills) ? s.skills[0] : s.skills;
      return { id: s.id, name: skill?.normalized_name ?? s.original_term, skillType: skill?.skill_type ?? "other", originalTerm: s.original_term, declaredLevel: s.declared_level };
    }),
    tools: (profileTools ?? []).map((t: { id: string; original_term: string; usage_context: string | null; declared_level: string | null; tools: { normalized_name: string } | { normalized_name: string }[] | null }) => {
      const tool = Array.isArray(t.tools) ? t.tools[0] : t.tools;
      return { id: t.id, name: tool?.normalized_name ?? t.original_term, originalTerm: t.original_term, usageContext: t.usage_context, declaredLevel: t.declared_level };
    }),
    evidences: (evidences ?? []).map((e: Record<string, unknown>) => ({
      id: e.id,
      evidenceType: e.evidence_type,
      summary: e.summary,
      context: e.context,
      sourceType: e.source_type,
      sourceSnippet: e.source_snippet,
    })),
    education: education ?? [],
    certifications: certifications ?? [],
    languages: languages ?? [],
  };
}

// deno-lint-ignore no-explicit-any
async function fetchTargetContext(supabase: any, targetContextVersionId: string) {
  const { data } = await supabase
    .from("target_context_versions")
    .select("target_area, target_role, desired_seniority, transition_type, search_context, preferences")
    .eq("id", targetContextVersionId)
    .maybeSingle();
  if (!data) return null;
  return {
    targetArea: data.target_area,
    targetRole: data.target_role,
    desiredSeniority: data.desired_seniority,
    transitionType: data.transition_type,
    searchContext: data.search_context,
    preferences: data.preferences,
  };
}

// ---- the two stages (ported from runDimensionsStage/runRecommendationsStage
// in src/features/core-1/actions.ts) ----
// deno-lint-ignore no-explicit-any
async function runDimensionsStage(supabase: any, apiKey: string, analysisId: string, analysis: { profile_version_id: string; target_context_version_id: string }) {
  const { data: existingResult } = await supabase.from("profile_analysis_results").select("analysis_id").eq("analysis_id", analysisId).maybeSingle();
  if (existingResult) {
    await supabase.from("analyses").update({ status: "preliminary", stage_dispatched_at: null }).eq("id", analysisId);
    return;
  }

  const [profileContext, targetContext] = await Promise.all([
    fetchFullProfileContext(supabase, analysis.profile_version_id),
    fetchTargetContext(supabase, analysis.target_context_version_id),
  ]);
  const experienceCount = profileContext.experiences.length;
  const evidenceCount = profileContext.evidences.length;

  const result = await completeWithSchema(
    apiKey,
    buildDimensionsSystemPrompt(),
    JSON.stringify({
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
    core1DimensionsOutputSchema,
  );

  const ipp = calculateIpp(result.dimensionAssessments.map((d) => ({ dimension: d.dimension, rubricLevel: d.rubricLevel, reasoning: d.reasoning })));
  const confidence = calculateConfidence(
    {
      inputCompleteness: experienceCount > 0 ? 0.8 : 0.3,
      userConfirmation: 1.0,
      evidenceTraceability: evidenceCount > 0 ? 0.7 : 0.3,
      sourceConsistency: 0.9,
    },
    { reasons: result.confidenceAssessment.reasons, missingInformation: result.confidenceAssessment.missingInformation },
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
    ipp_band: ipp.level,
    diagnosis: result.diagnosis.summary,
    main_strength: result.diagnosis.mainStrength,
    main_gap: result.diagnosis.mainGap,
    next_best_action: result.diagnosis.nextBestAction,
    calculation_snapshot: { ipp, confidence, gaps: result.gaps },
  });

  await supabase
    .from("analyses")
    .update({
      status: "preliminary",
      stage_dispatched_at: null,
      confidence_score: confidence.score,
      confidence_band: confidence.level,
      confidence_reasons: confidence.reasons,
      missing_information: confidence.missingInformation,
      model_version: MODEL,
      schema_version: SCHEMA_VERSION_CORE_1,
    })
    .eq("id", analysisId);
}

// deno-lint-ignore no-explicit-any
async function runRecommendationsStage(supabase: any, apiKey: string, analysisId: string, analysis: { profile_version_id: string; target_context_version_id: string }) {
  const { data: stage1 } = await supabase
    .from("profile_analysis_results")
    .select("calculation_snapshot, diagnosis, main_strength, main_gap, next_best_action")
    .eq("analysis_id", analysisId)
    .single();
  if (!stage1) throw new Error("runRecommendationsStage: missing stage 1 result");

  const { data: dimensionRows } = await supabase.from("profile_dimension_results").select("dimension, rubric_level, reasoning").eq("analysis_id", analysisId);

  const [profileContext, targetContext] = await Promise.all([
    fetchProfileContext(supabase, analysis.profile_version_id),
    fetchTargetContext(supabase, analysis.target_context_version_id),
  ]);

  const snapshot = stage1.calculation_snapshot as { gaps?: unknown };

  const result = await completeWithSchema(
    apiKey,
    buildRecommendationsSystemPrompt(),
    JSON.stringify({
      targetContext,
      experiences: profileContext.experiences,
      skills: profileContext.skills,
      tools: profileContext.tools,
      evidences: profileContext.evidences,
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
    core1RecommendationsOutputSchema,
  );

  const priorityInputs = result.recommendations.slice(0, RECOMMENDATIONS_MAXIMUM).map((r) => ({
    id: r.recommendationKey,
    impact: r.impact,
    effort: r.effort,
    urgency: r.urgency,
    confidence: r.confidence,
  }));
  const prioritized = orderByPriority(priorityInputs);

  await supabase.from("recommendations").delete().eq("analysis_id", analysisId);

  if (result.recommendations.length > 0) {
    await supabase.from("recommendations").insert(
      result.recommendations.slice(0, RECOMMENDATIONS_MAXIMUM).map((r) => {
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
          status: p.priorityOrder <= RECOMMENDATIONS_HIGHLIGHTED_MAXIMUM ? "highlighted" : "generated",
        };
      }),
    );
  }

  await supabase
    .from("analyses")
    .update({ status: "completed", stage_dispatched_at: null, completed_at: new Date().toISOString() })
    .eq("id", analysisId);
}

async function runStage(analysisId: string): Promise<void> {
  const { anthropicApiKey } = await getSecrets();
  const supabase = serviceClient();

  const { data: analysis } = await supabase
    .from("analyses")
    .select("id, status, profile_version_id, target_context_version_id")
    .eq("id", analysisId)
    .maybeSingle();
  if (!analysis) return;

  try {
    if (analysis.status === "processing") {
      await runDimensionsStage(supabase, anthropicApiKey, analysisId, analysis);
    } else if (analysis.status === "preliminary") {
      await runRecommendationsStage(supabase, anthropicApiKey, analysisId, analysis);
    }
    // Any other status means another invocation already finished this stage
    // (or the whole analysis) — nothing to do.
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`core1-analysis: stage failed for analysis ${analysisId}:`, message);
    await supabase
      .from("analyses")
      .update({ status: "failed_retryable", stage_dispatched_at: null, warnings: [message] })
      .eq("id", analysisId);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("expected POST", { status: 405 });

  let body: { analysisId?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response("invalid json body", { status: 400 });
  }
  if (typeof body.analysisId !== "string" || body.analysisId.length === 0) {
    return new Response("missing analysisId", { status: 400 });
  }

  const { dispatchSecret } = await getSecrets();
  if (req.headers.get("x-dispatch-secret") !== dispatchSecret) {
    return new Response("unauthorized", { status: 401 });
  }

  const analysisId = body.analysisId;
  // deno-lint-ignore no-explicit-any
  (globalThis as any).EdgeRuntime.waitUntil(runStage(analysisId));

  return new Response(JSON.stringify({ ok: true, accepted: true }), {
    status: 202,
    headers: { "content-type": "application/json" },
  });
});
