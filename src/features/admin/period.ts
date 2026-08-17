export const PERIOD_OPTIONS = [
  { value: "week", label: "Última semana", days: 7 },
  { value: "month", label: "Último mês", days: 30 },
  { value: "semester", label: "Último semestre", days: 182 },
  { value: "year", label: "Último ano", days: 365 },
] as const;

export type PeriodValue = (typeof PERIOD_OPTIONS)[number]["value"];

export function daysForPeriod(period: string | undefined): number {
  return PERIOD_OPTIONS.find((o) => o.value === period)?.days ?? 30;
}

export function labelForPeriod(period: string | undefined): string {
  return PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? "Último mês";
}
