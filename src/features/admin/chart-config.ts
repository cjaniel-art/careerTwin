import type { ChartConfig } from "@/components/ui/chart";

const SERIES_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--destructive))",
  "hsl(var(--warning))",
  "hsl(220 70% 60%)",
  "hsl(280 65% 60%)",
  "hsl(340 75% 55%)",
];

/** Monta um ChartConfig (label + cor por série) a partir das categorias possíveis — mesmas cores em qualquer indicador que reaproveite os mesmos rótulos. */
export function buildSeriesConfig(categories: string[], labels: Record<string, string>): ChartConfig {
  return Object.fromEntries(
    categories.map((key, i) => [key, { label: labels[key] ?? key, color: SERIES_COLORS[i % SERIES_COLORS.length] }]),
  ) satisfies ChartConfig;
}
