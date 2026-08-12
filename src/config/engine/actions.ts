/**
 * Plano de ações — up to 5 concurrently active actions PER ANALYSIS (Core 1
 * or Core 2), not account-wide: each analysis has its own independent
 * action list and its own cap. convertRecommendationToActionAction /
 * convertCore2ActionCandidateToActionAction count only the actions whose
 * origin (recommendation/action candidate) belongs to that specific
 * analysis before allowing another conversion.
 */
export const ACTIONS_CONFIG = {
  maximum: 5,
} as const;
