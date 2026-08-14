"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const CHART_CONFIG = {
  signups: { label: "Novos cadastros", color: "hsl(var(--primary))" },
  active: { label: "Usuários ativos", color: "hsl(var(--success))" },
} satisfies ChartConfig;

type SeriesKey = keyof typeof CHART_CONFIG;

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/** Padrão "Bar Chart - Interactive" do ui.shadcn — dois totais clicáveis trocam a série exibida. */
export function UsersChart({ data }: { data: { date: string; signups: number; active: number }[] }) {
  const [activeSeries, setActiveSeries] = React.useState<SeriesKey>("signups");

  const totals = React.useMemo(
    () => ({
      signups: data.reduce((sum, d) => sum + d.signups, 0),
      active: data.reduce((sum, d) => sum + d.active, 0),
    }),
    [data],
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b border-border p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4">
          <CardTitle className="text-base">Usuários</CardTitle>
          <CardDescription>Últimos 30 dias</CardDescription>
        </div>
        <div className="flex">
          {(Object.keys(CHART_CONFIG) as SeriesKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSeries(key)}
              className={cn(
                "flex flex-1 flex-col justify-center gap-1 border-t border-border px-6 py-4 text-left even:border-l sm:border-l sm:border-t-0 sm:px-8 sm:py-6",
                activeSeries === key ? "bg-secondary/40" : "",
              )}
            >
              <span className="text-xs text-muted-foreground">{CHART_CONFIG[key].label}</span>
              <span className="text-lg font-bold leading-none text-foreground sm:text-2xl">{totals[key]}</span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:p-6">
        <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[220px] w-full">
          <BarChart data={data} margin={{ left: 12, right: 12 }} accessibilityLayer>
            <CartesianGrid vertical={false} strokeOpacity={0.3} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} tickFormatter={formatDate} />
            <ChartTooltip content={<ChartTooltipContent className="w-[160px]" labelFormatter={(value) => formatDate(value as string)} />} />
            <Bar dataKey={activeSeries} fill={`var(--color-${activeSeries})`} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
