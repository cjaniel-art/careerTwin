/**
 * Plano de ações — shared between Core 1 and Core 2 (both PRDs state "até 5
 * ações"; the `actions` table has no core-specific column, so the limit is
 * a single account-wide cap on concurrently active actions, not per-core).
 */
export const ACTIONS_CONFIG = {
  maximum: 5,
} as const;
