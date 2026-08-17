"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, Label, LabelList, Pie, PieChart, XAxis, YAxis } from "recharts";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

/** Mesmo padrão visual do ReportTabsList/ReportTabsTrigger (core-1/report/report-tabs.tsx) — abas sublinhadas em vez de pílula. */
export function AdminTabsList({ className, ...props }: React.ComponentProps<typeof TabsList>) {
  return (
    <TabsList
      className={cn(
        "h-auto w-full items-stretch justify-start gap-1 overflow-x-auto rounded-none border-b border-border bg-transparent p-0",
        className,
      )}
      {...props}
    />
  );
}

export function AdminTabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={cn(
        "h-auto flex-none items-center gap-1.5 whitespace-nowrap rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground shadow-none transition-colors",
        "data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none",
        "hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function StatCard({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const breakdownChartConfig = { count: { label: "Quantidade", color: "hsl(var(--primary))" } } satisfies ChartConfig;

/** Padrão "Bar Chart - Label" do ui.shadcn — colunas verticais com o valor escrito no topo de cada barra. */
export function BreakdownChart({ counts, labels }: { counts: Record<string, number>; labels: Record<string, string> }) {
  const data = Object.entries(counts)
    .map(([key, count]) => ({ label: labels[key] ?? key, count }))
    .sort((a, b) => b.count - a.count);

  if (data.length === 0) return <p className="text-sm text-muted-foreground">Sem dados ainda.</p>;

  return (
    <ChartContainer config={breakdownChartConfig} className="aspect-auto h-[250px] w-full">
      <BarChart data={data} margin={{ top: 20 }} accessibilityLayer>
        <CartesianGrid vertical={false} strokeOpacity={0.3} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} />
        <YAxis hide allowDecimals={false} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={8}>
          <LabelList position="top" offset={8} className="fill-foreground" fontSize={12} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

/** `value` é "AAAA-MM-DD" (balde diário) ou "AAAA-MM" (balde mensal, sem dia) — mesma convenção do UsersChart. */
function formatBucketDate(value: string): string {
  const isMonth = value.length === 7;
  const date = new Date(`${isMonth ? `${value}-01` : value}T00:00:00`);
  return date.toLocaleDateString("pt-BR", isMonth ? { month: "short", year: "numeric" } : { day: "2-digit", month: "short" });
}

/**
 * Padrão "Bar Chart - Interactive" do ui.shadcn — mesmo componente usado pelo UsersChart,
 * generalizado para N categorias: os totais no cabeçalho trocam qual série é exibida,
 * respeitando o filtro de período global (ver admin-metrics.ts `timeSeriesByCategory`).
 */
export function InteractiveBarChart({
  title,
  data,
  config,
}: {
  title: string;
  data: ({ date: string } & Record<string, string | number>)[];
  config: ChartConfig;
}) {
  const seriesKeys = React.useMemo(() => Object.keys(config), [config]);
  const [active, setActive] = React.useState<string | undefined>(seriesKeys[0]);

  const totals = React.useMemo(
    () => Object.fromEntries(seriesKeys.map((key) => [key, data.reduce((sum, row) => sum + Number(row[key] ?? 0), 0)])),
    [data, seriesKeys],
  );

  const activeKey = (active && seriesKeys.includes(active) ? active : seriesKeys[0]) ?? "";
  const hasData = Object.values(totals).some((value) => value > 0);

  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b border-border p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4">
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <div className="flex flex-wrap">
          {seriesKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={cn(
                "flex flex-1 flex-col justify-center gap-1 border-t border-border px-4 py-3 text-left even:border-l sm:border-l sm:border-t-0 sm:px-5 sm:py-4",
                activeKey === key ? "bg-secondary/40" : "",
              )}
            >
              <span className="text-xs text-muted-foreground">{String(config[key]?.label ?? key)}</span>
              <span className="text-lg font-bold leading-none text-foreground sm:text-xl">{totals[key] ?? 0}</span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 pb-4 sm:p-6">
        {hasData ? (
          <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
            <BarChart data={data} margin={{ left: 12, right: 12 }} accessibilityLayer>
              <CartesianGrid vertical={false} strokeOpacity={0.3} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} tick={{ fontSize: 12 }} tickFormatter={formatBucketDate} />
              <ChartTooltip content={<ChartTooltipContent className="w-[160px]" labelFormatter={(value) => formatBucketDate(value as string)} />} />
              <Bar dataKey={activeKey} fill={`var(--color-${activeKey})`} radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="px-4 py-8 text-sm text-muted-foreground">Sem dados ainda.</p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Padrão "Pie Chart - Donut with Text" do ui.shadcn — soma cada categoria da mesma
 * série temporal (mesma fonte de dados dos outros gráficos), com o total no centro
 * do donut. Sem interação de hover — só para indicadores com muitas categorias, onde
 * o cabeçalho clicável do Bar Chart - Interactive fica espremido demais.
 */
export function DonutTextChart({
  title,
  data,
  config,
}: {
  title: string;
  data: ({ date: string } & Record<string, string | number>)[];
  config: ChartConfig;
}) {
  const totals = React.useMemo(
    () =>
      Object.keys(config)
        .map((key) => ({
          key,
          label: String(config[key]?.label ?? key),
          value: data.reduce((sum, row) => sum + Number(row[key] ?? 0), 0),
          fill: `var(--color-${key})`,
        }))
        .filter((t) => t.value > 0),
    [data, config],
  );

  const total = totals.reduce((sum, t) => sum + t.value, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {totals.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Sem dados ainda.</p>
        ) : (
          <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie data={totals} dataKey="value" nameKey="label" innerRadius={60} strokeWidth={5}>
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {total.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 24} className="fill-muted-foreground text-xs">
                          Total
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
