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
