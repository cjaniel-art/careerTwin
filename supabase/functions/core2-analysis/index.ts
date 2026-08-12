// Runs the Core 2 (Diagnóstico de Aderência) P-009 diagnosis for one
// analysis. Dispatched by Vercel's runJobAnalysisStage
// (src/features/core-2/actions.ts) instead of running the AI call inline —
// confirmed in production that the inline version got killed by Vercel's
// function ceiling mid-call, which both stranded the analysis row in
// "processing" forever and left its credit reservation stuck (the code's own
// catch block, which would release it, never got to run — the platform
// terminated the function first). This function acks the dispatch in well
// under a second and does the actual work in EdgeRuntime.waitUntil, so its
// budget is this project's Edge Function wall-clock ceiling (150s on the
// free plan), not Vercel's function ceiling. Mirrors core1-analysis/index.ts.
//
// This intentionally duplicates a slice of src/features/core-2/actions.ts,
// src/domain/scores/{iao,confidence,recommendation}.ts,
// src/features/analysis/profile-context.ts and
// src/config/{schemas/core2,engine/core2,engine/confidence}.ts — Deno edge
// functions can't import the Next.js app's "@/..." tree. Keep the two in
// sync by hand; the Next.js versions remain the source of truth for the
// scoring formulas (Motor de Análise e Scores).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import postgres from "npm:postgres@3";
import { z } from "npm:zod@3";
import { zodToJsonSchema } from "npm:zod-to-json-schema@3";

const MODEL = "claude-haiku-4-5-20251001"; // == EXTRACTION_MODEL in src/infrastructure/ai/index.ts
const ANTHROPIC_VERSION = "2023-06-01";
const EXTRACTION_TOOL_NAME = "emit_structured_output";
const MAX_OUTPUT_TOKENS = 16000;

// ---- vault-backed secrets (shared with core1-analysis) ----
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
        if (!anthropicApiKey || !dispatchSecret) throw new Error("core2-analysis: missing vault secret(s)");
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

// ---- schemas (ported from src/config/schemas/{evidence,core2}.ts) ----
const evidenceReferenceSchema = z.object({
  sourceType: z.enum(["resume", "linkedin", "user"]),
  sourceId: z.string(),
  excerpt: z.string(),
  extractionConfidence: z.number().min(0).max(1).optional(),
});

const AI_GAP_TYPES_PT = ["competencia", "experiencia", "formacao_certificacao", "comunicacao", "evidencia", "posicionamento", "desconhecida"] as const;
const SCHEMA_VERSION_CORE_2 = "core-2/1.2" as const;

const strengthSchema = z.object({
  title: z.string(),
  description: z.string(),
  relatedRequirementIds: z.array(z.string()),
  evidenceRefs: z.array(evidenceReferenceSchema),
});

const actionCandidateSchema = z.object({
  actionKey: z.string(),
  title: z.string(),
  reasoning: z.string(),
  suggestedAction: z.string(),
  horizon: z.enum(["before_applying", "during_process", "long_term"]),
  impact: z.number().int().min(1).max(5),
  effort: z.number().int().min(1).max(5),
  successCriteria: z.string(),
  relatedRequirementIds: z.array(z.string()),
});

const riskSchema = z.object({
  riskKey: z.string(),
  type: z.enum([
    "blocking_requirement", "mandatory_gap", "seniority_mismatch", "location_mismatch",
    "work_authorization", "language_requirement", "certification_requirement",
    "insufficient_evidence", "ambiguous_requirement", "data_quality", "target_misalignment",
  ]),
  title: z.string(),
  description: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  requirementIds: z.array(z.string()),
  evidenceRefs: z.array(evidenceReferenceSchema),
  mitigableBeforeApplication: z.boolean(),
});

const seniorityAssessmentSchema = z.object({
  expected: z.enum(["intern", "junior", "mid", "senior"]),
  observed: z.enum(["insufficient_data", "intern", "junior", "mid", "senior"]),
  signals: z.array(z.string()),
  gaps: z.array(z.string()),
  assessmentConfidence: z.number().min(0).max(1),
});

const core2OutputSchema = z.object({
  analysisType: z.literal("job_fit_analysis"),
  profileVersionId: z.string(),
  targetContextVersionId: z.string(),
  opportunityVersionId: z.string(),
  promptVersion: z.string(),
  schemaVersion: z.literal(SCHEMA_VERSION_CORE_2),
  rubricVersion: z.string(),
  confidenceAssessment: z.object({
    reasons: z.array(z.string()),
    missingInformation: z.array(z.string()),
    conflicts: z.array(z.string()),
  }),
  requirementAssessments: z.array(
    z.object({
      requirementId: z.string(),
      matchStatus: z.enum([
        "confirmed_match", "partial_match", "communication_gap", "evidence_gap",
        "unknown", "not_observed", "confirmed_mismatch",
      ]),
      reasoning: z.string(),
      profileEvidence: z.array(evidenceReferenceSchema),
      gapType: z.enum(AI_GAP_TYPES_PT).optional(),
      assessmentConfidence: z.number().min(0).max(1),
    }),
  ),
  seniorityAssessment: seniorityAssessmentSchema,
  strengths: z.array(strengthSchema),
  gaps: z.array(z.unknown()),
  risks: z.array(riskSchema),
  recommendationCandidate: z.object({
    scope: z.enum(["application", "target_role"]),
    type: z.string(),
    reasoning: z.string(),
    relatedRequirementIds: z.array(z.string()),
  }),
  actionCandidates: z.array(actionCandidateSchema),
  authenticityValidation: z.object({ warnings: z.array(z.string()), blockedClaims: z.array(z.string()) }),
  warnings: z.array(z.string()),
});

// ---- engine config (ported from src/config/engine/core2.ts) ----
const CORE_2_CONFIG = {
  iao: {
    requirementWeights: { mandatory: 3.0, desired: 1.5, differential: 1.0, complementary: 0.5, blocking: 4.0 },
    matchFactors: {
      confirmed_match: 1.0, partial_match: 0.65, communication_gap: 0.55,
      evidence_gap: 0.4, unknown: 0.2, not_observed: 0.0, confirmed_mismatch: 0.0,
    },
    bands: { low: [0, 39], partial: [40, 59], good: [60, 79], high: [80, 100] },
    caps: {
      blockingRequirement: 49,
      multipleCriticalMandatoryGaps: 59,
      strongSeniorityMismatch: 59,
      minimumBlockingConfidence: 0.75,
    },
    recommendationPrecedence: [
      "insufficient_data", "blocking_requirement", "strong_seniority_mismatch",
      "multiple_critical_mandatory_gaps", "iao_0_39", "iao_40_59", "iao_60_79", "iao_80_100",
    ] as const,
  },
  confidence: {
    weights: { inputCompleteness: 0.3, userConfirmation: 0.3, evidenceTraceability: 0.25, sourceConsistency: 0.15 },
    levels: { low: [0, 0.49], medium: [0.5, 0.79], high: [0.8, 1] },
  },
};

const GAP_TYPE_FROM_AI_SCHEMA: Record<string, string> = {
  competencia: "competency",
  experiencia: "experience",
  formacao_certificacao: "education_or_certification",
  comunicacao: "communication",
  evidencia: "evidence",
  posicionamento: "positioning",
  desconhecida: "unknown",
};

type RequirementCriticality = keyof typeof CORE_2_CONFIG.iao.requirementWeights;
type MatchStatus = keyof typeof CORE_2_CONFIG.iao.matchFactors;
type IaoBand = "low_observable_fit" | "partial_fit" | "good_observable_fit" | "high_observable_fit";
type AppliedCap = "blocking_requirement" | "multiple_critical_mandatory_gaps" | "seniority_mismatch";

class InsufficientScoringDataError extends Error {
  constructor() {
    super("calculateIao: no applicable requirements to score (denominator is zero)");
    this.name = "InsufficientScoringDataError";
  }
}

// ---- scoring (ported from src/domain/scores/{iao,confidence,recommendation}.ts) ----
function bandForIao(score: number): IaoBand {
  const { low, partial, good, high } = CORE_2_CONFIG.iao.bands;
  if (score >= high[0]) return "high_observable_fit";
  if (score >= good[0]) return "good_observable_fit";
  if (score >= partial[0]) return "partial_fit";
  return "low_observable_fit";
}

interface RequirementForScoring {
  requirementId: string;
  criticality: RequirementCriticality;
  isCritical: boolean;
  applicability: "applicable" | "not_applicable" | "unknown";
  matchStatus: MatchStatus;
  extractionConfidence: number;
}

function calculateIao(input: { requirements: RequirementForScoring[]; strongSeniorityMismatch: boolean }) {
  if (input.requirements.length === 0) throw new Error("calculateIao: at least one requirement is required");

  let numerator = 0;
  let denominator = 0;
  const requirementScores = input.requirements.map((req) => {
    const excluded = req.applicability === "not_applicable";
    const weight = CORE_2_CONFIG.iao.requirementWeights[req.criticality];
    const factor = CORE_2_CONFIG.iao.matchFactors[req.matchStatus];
    const weightedContribution = weight * factor * req.extractionConfidence;
    if (!excluded) {
      numerator += weightedContribution;
      denominator += weight * req.extractionConfidence;
    }
    return { requirementId: req.requirementId, weight, factor, weightedContribution, excluded };
  });

  if (denominator === 0) throw new InsufficientScoringDataError();

  const rawScore = Math.round((100 * numerator) / denominator);
  const appliedCaps: AppliedCap[] = [];
  let finalScore = rawScore;
  const { caps } = CORE_2_CONFIG.iao;

  const hasConfirmedBlocker = input.requirements.some(
    (r) => r.applicability !== "not_applicable" && r.criticality === "blocking" && r.matchStatus === "confirmed_mismatch" && r.extractionConfidence >= caps.minimumBlockingConfidence,
  );
  if (hasConfirmedBlocker) {
    appliedCaps.push("blocking_requirement");
    finalScore = Math.min(finalScore, caps.blockingRequirement);
  }

  const criticalMandatoryGaps = input.requirements.filter(
    (r) => r.applicability !== "not_applicable" && r.criticality === "mandatory" && r.isCritical && r.matchStatus === "confirmed_mismatch" && r.extractionConfidence >= caps.minimumBlockingConfidence,
  ).length;
  if (criticalMandatoryGaps >= 2) {
    appliedCaps.push("multiple_critical_mandatory_gaps");
    finalScore = Math.min(finalScore, caps.multipleCriticalMandatoryGaps);
  }

  if (input.strongSeniorityMismatch) {
    appliedCaps.push("seniority_mismatch");
    finalScore = Math.min(finalScore, caps.strongSeniorityMismatch);
  }

  return { rawScore, finalScore, displayScore: finalScore, band: bandForIao(finalScore), appliedCaps, requirementScores };
}

function calculateConfidence(
  components: { inputCompleteness: number; userConfirmation: number; evidenceTraceability: number; sourceConsistency: number },
  context: { reasons?: string[]; missingInformation?: string[]; conflicts?: string[] } = {},
) {
  const { weights, levels } = CORE_2_CONFIG.confidence;
  const raw =
    components.inputCompleteness * weights.inputCompleteness +
    components.userConfirmation * weights.userConfirmation +
    components.evidenceTraceability * weights.evidenceTraceability +
    components.sourceConsistency * weights.sourceConsistency;
  const score = Math.round(raw * 1000) / 1000;
  const level = score >= levels.high[0] ? "high" : score >= levels.medium[0] ? "medium" : "low";
  return { score, level, reasons: context.reasons ?? [], missingInformation: context.missingInformation ?? [], conflicts: context.conflicts ?? [] };
}

const SENIORITY_ORDER = ["intern", "junior", "mid", "senior"] as const;

function determineApplicationRecommendation(signals: {
  band: IaoBand;
  confidenceLevel: "low" | "medium" | "high";
  appliedCaps: AppliedCap[];
  insufficientData: boolean;
}): string {
  if (signals.insufficientData || signals.confidenceLevel === "low") return "insufficient_data";
  if (signals.appliedCaps.includes("blocking_requirement")) return "do_not_prioritize";
  if (signals.appliedCaps.includes("seniority_mismatch")) return "do_not_prioritize";
  if (signals.appliedCaps.includes("multiple_critical_mandatory_gaps")) return "develop_gaps_before_applying";

  switch (signals.band) {
    case "high_observable_fit":
      return "apply_now";
    case "good_observable_fit":
      return "apply_with_adjustments";
    case "partial_fit":
      return "develop_gaps_before_applying";
    case "low_observable_fit":
      return "do_not_prioritize";
  }
}

function mapIaoBand(band: string): IaoBand {
  switch (band) {
    case "low_observable_fit":
    case "partial_fit":
    case "good_observable_fit":
    case "high_observable_fit":
      return band;
    default:
      return "low_observable_fit";
  }
}

// ---- prompt (verbatim from src/features/core-2/actions.ts's buildDiagnosisSystemPrompt) ----
function buildDiagnosisSystemPrompt(): string {
  return [
    "Você é o motor de Diagnóstico de Aderência (Core 2) do CareerTwin.",
    "A mensagem do usuário contém o texto real de cada requisito da vaga (requirements) e o conteúdo real e completo do perfil confirmado (experiências, projetos, competências, ferramentas, evidências, formação, certificações, idiomas) — baseie toda a avaliação exclusivamente nesse conteúdo.",
    "Para cada requisito em requirements, use o campo id como requirementId na sua resposta e atribua um estado de correspondência permitido comparando o texto do requisito ao conteúdo do perfil.",
    "Você NUNCA calcula o IAO final, a confiança final, os limites de segurança nem a recomendação final — isso é feito pelo backend.",
    "Nunca invente experiências, competências ou resultados não presentes no perfil confirmado.",
    'Em profileEvidence, use sourceId = o id real do item citado (experience/evidence/skill/tool) exatamente como veio na entrada, sourceType conforme a origem (resume/linkedin/user), e excerpt com um trecho real do conteúdo — nunca invente ids ou trechos.',
    "assessmentConfidence deve refletir sua confiança real na avaliação daquele requisito específico, com base no quanto o perfil fornecido permite avaliá-lo — não deve ser 0 apenas porque o perfil é enxuto; se não houver base alguma para avaliar, use matchStatus \"unknown\" com uma confiança condizente, não confiança zero indiscriminadamente.",
    "Retorne exclusivamente um JSON válido no formato do schema fornecido, sem texto adicional.",
    "Os campos abaixo aceitam SOMENTE os valores literais listados — use exatamente esses tokens (em inglês/português conforme mostrado), nunca sinônimos, traduções ou variações:",
    'requirementAssessments[].matchStatus: "confirmed_match" | "partial_match" | "communication_gap" | "evidence_gap" | "unknown" | "not_observed" | "confirmed_mismatch".',
    'requirementAssessments[].gapType (quando aplicável): "competencia" | "experiencia" | "formacao_certificacao" | "comunicacao" | "evidencia" | "posicionamento" | "desconhecida".',
    'seniorityAssessment.expected e seniorityAssessment.observed: "intern" | "junior" | "mid" | "senior" (observed também aceita "insufficient_data").',
    'risks[].type: "blocking_requirement" | "mandatory_gap" | "seniority_mismatch" | "location_mismatch" | "work_authorization" | "language_requirement" | "certification_requirement" | "insufficient_evidence" | "ambiguous_requirement" | "data_quality" | "target_misalignment".',
    'risks[].severity: "low" | "medium" | "high" | "critical".',
    'actionCandidates[].horizon: "before_applying" | "during_process" | "long_term".',
    'recommendationCandidate.scope: "application" | "target_role".',
    "Em strengths, liste todos os pontos fortes reais e relevantes do perfil frente a esta vaga específica (não apenas um), cada um ligado aos requirementIds que ele endereça e com evidenceRefs reais. Se não houver pontos fortes claros, retorne um array vazio em vez de inventar um. Cada item tem title (rótulo curto, 3-6 palavras, ex: \"Experiência sólida em metodologias ágeis\") e description (explicação completa em 1-2 frases) — nunca repita o title dentro do description nem use o texto completo como title.",
    "Em actionCandidates, gere no máximo 5 ações priorizadas e acionáveis para melhorar a candidatura, cada uma endereçando uma lacuna ou risco real identificado, com successCriteria objetivo e relatedRequirementIds preenchido quando aplicável.",
  ].join(" ");
}

// ---- Anthropic call + 3-stage schema repair (ported from
// src/infrastructure/ai/{anthropic-provider,schema-repair}.ts — identical to core1-analysis) ----
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

// ---- profile/requirements context (ported from src/features/analysis/profile-context.ts) ----
// deno-lint-ignore no-explicit-any
async function fetchProfileContext(supabase: any, profileVersionId: string) {
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
    projects: (projects ?? []).map((p: Record<string, unknown>) => ({
      id: p.id, name: p.name, context: p.context, objective: p.objective,
      userRole: p.user_role, activities: p.activities, deliverables: p.deliverables, results: p.results,
    })),
    skills: (profileSkills ?? []).map((s: { id: string; original_term: string; declared_level: string | null; skills: { normalized_name: string; skill_type: string } | { normalized_name: string; skill_type: string }[] | null }) => {
      const skill = Array.isArray(s.skills) ? s.skills[0] : s.skills;
      return { id: s.id, name: skill?.normalized_name ?? s.original_term, skillType: skill?.skill_type ?? "other", originalTerm: s.original_term, declaredLevel: s.declared_level };
    }),
    tools: (profileTools ?? []).map((t: { id: string; original_term: string; usage_context: string | null; declared_level: string | null; tools: { normalized_name: string } | { normalized_name: string }[] | null }) => {
      const tool = Array.isArray(t.tools) ? t.tools[0] : t.tools;
      return { id: t.id, name: tool?.normalized_name ?? t.original_term, originalTerm: t.original_term, usageContext: t.usage_context, declaredLevel: t.declared_level };
    }),
    evidences: (evidences ?? []).map((e: Record<string, unknown>) => ({
      id: e.id, evidenceType: e.evidence_type, summary: e.summary, context: e.context,
      sourceType: e.source_type, sourceSnippet: e.source_snippet,
    })),
    education: (education ?? []).map((e: Record<string, unknown>) => ({ id: e.id, institution: e.institution, degree: e.degree, fieldOfStudy: e.field_of_study })),
    certifications: certifications ?? [],
    languages: languages ?? [],
  };
}

// deno-lint-ignore no-explicit-any
async function fetchRequirementsContext(supabase: any, opportunityVersionId: string) {
  const { data } = await supabase
    .from("requirements")
    .select("id, description, category, criticality, applicability, source_excerpt")
    .eq("opportunity_version_id", opportunityVersionId)
    .neq("applicability", "not_applicable");
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id, description: r.description, category: r.category, criticality: r.criticality, sourceExcerpt: r.source_excerpt,
  }));
}

// ---- the stage (ported from runJobAnalysis in src/features/core-2/actions.ts) ----
// deno-lint-ignore no-explicit-any
async function runJobAnalysis(supabase: any, apiKey: string, analysisId: string) {
  const { data: analysis } = await supabase
    .from("analyses")
    .select("id, status, user_id, profile_version_id, opportunity_version_id")
    .eq("id", analysisId)
    .maybeSingle();
  if (!analysis || analysis.status !== "processing") return;

  const [{ data: requirements }] = await Promise.all([
    supabase
      .from("requirements")
      .select("id, category, criticality, is_critical, applicability, extraction_confidence")
      .eq("opportunity_version_id", analysis.opportunity_version_id),
  ]);

  if (!requirements || requirements.length === 0) {
    await supabase.from("analyses").update({ status: "insufficient_data" }).eq("id", analysisId);
    await releaseReservation(supabase, analysisId, analysis.user_id, "Vaga sem requisitos estruturados — dados insuficientes.");
    return;
  }

  const [profileContext, requirementsContext] = await Promise.all([
    fetchProfileContext(supabase, analysis.profile_version_id),
    fetchRequirementsContext(supabase, analysis.opportunity_version_id),
  ]);

  try {
    const result = await completeWithSchema(
      apiKey,
      buildDiagnosisSystemPrompt(),
      JSON.stringify({
        requirements: requirementsContext,
        experiences: profileContext.experiences,
        projects: profileContext.projects,
        skills: profileContext.skills,
        tools: profileContext.tools,
        evidences: profileContext.evidences,
        education: profileContext.education,
        certifications: profileContext.certifications,
        languages: profileContext.languages,
      }),
      core2OutputSchema,
    );

    const assessmentByRequirement = new Map(result.requirementAssessments.map((a) => [a.requirementId, a]));

    const scoringInputs: RequirementForScoring[] = requirements.map((r: Record<string, unknown>) => {
      const assessment = assessmentByRequirement.get(r.id as string);
      return {
        requirementId: r.id as string,
        criticality: r.criticality as RequirementCriticality,
        isCritical: r.is_critical as boolean,
        applicability: r.applicability as RequirementForScoring["applicability"],
        matchStatus: (assessment?.matchStatus ?? "unknown") as MatchStatus,
        extractionConfidence: assessment?.assessmentConfidence ?? (r.extraction_confidence as number),
      };
    });

    const expected = result.seniorityAssessment.expected;
    const observed = result.seniorityAssessment.observed;
    const strongSeniorityMismatch =
      observed !== "insufficient_data" &&
      Math.abs(SENIORITY_ORDER.indexOf(expected) - SENIORITY_ORDER.indexOf(observed)) >= 2 &&
      result.seniorityAssessment.assessmentConfidence >= 0.5;

    const iao = calculateIao({ requirements: scoringInputs, strongSeniorityMismatch });

    const hasExperience = profileContext.experiences.length > 0;
    const confidence = calculateConfidence(
      {
        inputCompleteness: hasExperience ? 0.8 : 0.3,
        userConfirmation: 1.0,
        evidenceTraceability: profileContext.evidences.length > 0 ? 0.7 : 0.3,
        sourceConsistency: 0.85,
      },
      { reasons: result.confidenceAssessment.reasons, missingInformation: result.confidenceAssessment.missingInformation },
    );

    const recommendation = determineApplicationRecommendation({
      band: iao.band,
      confidenceLevel: confidence.level as "low" | "medium" | "high",
      appliedCaps: iao.appliedCaps,
      insufficientData: false,
    });

    const evidenceByRequirement: Record<string, unknown> = {};
    for (const a of result.requirementAssessments) {
      if (a.profileEvidence.length > 0) evidenceByRequirement[a.requirementId] = a.profileEvidence;
    }

    await supabase.from("requirement_assessments").insert(
      scoringInputs.map((s, i) => {
        const scoreDetail = iao.requirementScores[i]!;
        const assessment = assessmentByRequirement.get(s.requirementId);
        return {
          analysis_id: analysisId,
          requirement_id: s.requirementId,
          match_status: s.matchStatus,
          match_factor: scoreDetail.factor,
          criticality_weight: scoreDetail.weight,
          requirement_confidence: requirements.find((r: Record<string, unknown>) => r.id === s.requirementId)!.extraction_confidence,
          assessment_confidence: s.extractionConfidence,
          weighted_contribution: scoreDetail.weightedContribution,
          reasoning: assessment?.reasoning ?? "Sem avaliação da IA — tratado como dado insuficiente.",
          gap_type: assessment?.gapType ? GAP_TYPE_FROM_AI_SCHEMA[assessment.gapType] : null,
        };
      }),
    );

    if (iao.appliedCaps.length > 0) {
      await supabase.from("analysis_limits").insert(
        iao.appliedCaps.map((cap) => ({
          analysis_id: analysisId,
          limit_type: cap === "blocking_requirement" ? "confirmed_blocker" : cap === "seniority_mismatch" ? "strong_seniority_mismatch" : "multiple_critical_mandatory_gaps",
          maximum_score: cap === "blocking_requirement" ? CORE_2_CONFIG.iao.caps.blockingRequirement : CORE_2_CONFIG.iao.caps.multipleCriticalMandatoryGaps,
          reason: `Limite de segurança aplicado: ${cap}`,
          applied: true,
        })),
      );
    }

    await supabase.from("fit_analysis_results").insert({
      analysis_id: analysisId,
      iao_raw_score: iao.rawScore,
      iao_final_score: iao.finalScore,
      iao_display_score: iao.displayScore,
      iao_band: mapIaoBand(iao.band),
      recommendation_type: recommendation,
      recommendation_reasoning: result.recommendationCandidate.reasoning,
      calculation_snapshot: {
        iao,
        confidence,
        strengths: result.strengths,
        risks: result.risks,
        actionCandidates: result.actionCandidates,
        seniorityAssessment: result.seniorityAssessment,
        evidenceByRequirement,
      },
      risks_count: result.risks.length,
    });

    await supabase
      .from("analyses")
      .update({
        status: "completed",
        confidence_score: confidence.score,
        confidence_band: confidence.level,
        confidence_reasons: confidence.reasons,
        missing_information: confidence.missingInformation,
        model_version: MODEL,
        schema_version: SCHEMA_VERSION_CORE_2,
        completed_at: new Date().toISOString(),
      })
      .eq("id", analysisId);

    await confirmReservation(supabase, analysisId, analysis.user_id);
  } catch (err) {
    if (err instanceof InsufficientScoringDataError) {
      await supabase.from("analyses").update({ status: "insufficient_data" }).eq("id", analysisId);
      await releaseReservation(supabase, analysisId, analysis.user_id, "Dados insuficientes para gerar um diagnóstico confiável.");
      return;
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error(`core2-analysis: stage failed for analysis ${analysisId}:`, message);
    await supabase.from("analyses").update({ status: "failed_retryable", warnings: [message] }).eq("id", analysisId);
    await releaseReservation(supabase, analysisId, analysis.user_id, "Falha técnica — crédito restaurado.");
  }
}

/**
 * Thin wrappers around the SECURITY DEFINER RPCs — see
 * 20260101000026_credit_rpc_service_role.sql. This edge function calls
 * Postgres via SUPABASE_SERVICE_ROLE_KEY (no end-user session), so auth.uid()
 * is always null inside a regular RPC — these _service variants take the
 * user id explicitly instead and are locked to service_role via GRANT.
 */
// deno-lint-ignore no-explicit-any
async function confirmReservation(supabase: any, analysisId: string, userId: string): Promise<void> {
  const { error } = await supabase.rpc("ct_confirm_credit_reservation_service", {
    p_analysis_id: analysisId,
    p_user_id: userId,
    p_policy_version: "core-2-config/1.0.0",
  });
  if (error) console.error("confirmReservation: ct_confirm_credit_reservation_service failed:", error.message);
}

// deno-lint-ignore no-explicit-any
async function releaseReservation(supabase: any, analysisId: string, userId: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc("ct_release_credit_reservation_service", {
    p_analysis_id: analysisId,
    p_user_id: userId,
    p_policy_version: "core-2-config/1.0.0",
    p_reason: reason,
  });
  if (error) console.error("releaseReservation: ct_release_credit_reservation_service failed:", error.message);
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

  const { dispatchSecret, anthropicApiKey } = await getSecrets();
  if (req.headers.get("x-dispatch-secret") !== dispatchSecret) {
    return new Response("unauthorized", { status: 401 });
  }

  const analysisId = body.analysisId;
  const supabase = serviceClient();
  // deno-lint-ignore no-explicit-any
  (globalThis as any).EdgeRuntime.waitUntil(runJobAnalysis(supabase, anthropicApiKey, analysisId));

  return new Response(JSON.stringify({ ok: true, accepted: true }), {
    status: 202,
    headers: { "content-type": "application/json" },
  });
});
