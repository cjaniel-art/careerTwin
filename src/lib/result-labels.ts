/** Shared PT-BR labels for score bands/recommendations/match statuses (Core 1 + Core 2 result screens, histórico). */

export const IPP_BAND_LABELS: Record<string, string> = {
  low_readiness: "Baixa prontidão observável",
  developing_readiness: "Prontidão em desenvolvimento",
  good_readiness: "Boa prontidão observável",
  high_readiness: "Alta prontidão observável",
};

export const IAO_BAND_LABELS: Record<string, string> = {
  low_observable_fit: "Baixa aderência observável",
  partial_fit: "Aderência parcial",
  good_observable_fit: "Boa aderência observável",
  high_observable_fit: "Alta aderência observável",
};

export const CONFIDENCE_LABELS: Record<string, string> = {
  low: "Baixa confiança",
  medium: "Média confiança",
  high: "Alta confiança",
};

export const RECOMMENDATION_LABELS: Record<string, string> = {
  apply_now: "Aplicar agora",
  apply_with_adjustments: "Aplicar com ajustes",
  develop_gaps_before_applying: "Desenvolver lacunas antes de aplicar",
  do_not_prioritize: "Não priorizar esta vaga neste momento",
  ready_to_prioritize: "Pronto para priorizar",
  prioritize_with_adjustments: "Priorizar com ajustes",
  develop_before_prioritizing: "Desenvolver antes de priorizar",
  reassess_target_context: "Reavaliar contexto-alvo",
  insufficient_data: "Dados insuficientes",
};

export const MATCH_LABELS: Record<string, string> = {
  confirmed_match: "Atendido com evidência",
  partial_match: "Parcialmente atendido",
  communication_gap: "Lacuna de comunicação",
  evidence_gap: "Informado, mas não comprovado",
  unknown: "Dados insuficientes",
  not_observed: "Não observado",
  confirmed_mismatch: "Incompatibilidade confirmada",
};

export const DIMENSION_LABELS: Record<string, string> = {
  objective_clarity: "Clareza do objetivo profissional",
  experience_quality: "Qualidade das experiências",
  evidence_and_results: "Evidências e resultados",
  skills_and_tools: "Competências e ferramentas",
  cross_source_consistency: "Consistência entre fontes",
  positioning_quality: "Qualidade do posicionamento",
  profile_completeness: "Completude do perfil",
};

/** Core 1 gap.type (profile_analysis_results.calculation_snapshot.gaps[].type) — Relatório de Análise de Perfil §7. */
export const GAP_TYPE_LABELS: Record<string, string> = {
  competencia: "Competência",
  comunicacao: "Comunicação",
  evidencia: "Evidência",
  posicionamento: "Posicionamento",
  desconhecida: "Dados insuficientes",
};

/** recommendations.category (DB enum, English) — display in PT-BR per Relatório de Análise de Perfil §8. */
export const RECOMMENDATION_CATEGORY_LABELS: Record<string, string> = {
  competency: "Competência",
  communication: "Comunicação",
  evidence: "Evidência",
  positioning: "Posicionamento",
};

/** profile_dimension_results.rubric_level (0-4, backend-assigned) — short interpretation only, never a score. */
export const RUBRIC_LEVEL_LABELS: Record<number, string> = {
  0: "Não observado",
  1: "Pouco evidenciado",
  2: "Em desenvolvimento",
  3: "Bom",
  4: "Muito bom",
};

/** Likert 1-5 fields on recommendations (impact/effort/urgency/confidence) — presentation-only labels. */
export const LIKERT_LABELS: Record<number, string> = {
  1: "Muito baixo",
  2: "Baixo",
  3: "Médio",
  4: "Alto",
  5: "Muito alto",
};
