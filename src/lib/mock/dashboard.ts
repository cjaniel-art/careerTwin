/**
 * Tipos compartilhados pelos cards da Dashboard (src/features/dashboard/*).
 * Os dados em si vêm do Supabase, montados em src/app/app/dashboard/page.tsx —
 * este arquivo só define o contrato que os componentes esperam receber.
 */

export type SeverityLevel = "Alta" | "Média" | "Baixa";

export interface ProfileContext {
  area: string;
  level: string;
}

/** Uma das 7 dimensões reais do IPP (profile_dimension_results + pesos de CORE_1_CONFIG.ipp.weights). */
export interface IppDimensionRow {
  key: string;
  name: string;
  weight: number;
  score: number;
  rubricLevel: number;
  levelLabel: string;
}

export interface Opportunity {
  role: string;
  iao: number;
  adherence: SeverityLevel;
  reportUrl: string;
}

export interface IppHistoryPoint {
  date: string;
  value: number;
}

export interface IppEvolution {
  current: number;
  previous: number;
  delta: number;
  deltaPeriodLabel: string;
  history: IppHistoryPoint[];
}

export interface PrioritizedAction {
  priority: number;
  title: string;
  severity: SeverityLevel;
}
