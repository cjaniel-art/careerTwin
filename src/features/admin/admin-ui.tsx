"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
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

/** Substitui a antiga lista em texto por uma barra horizontal (ui.shadcn ChartContainer + recharts). */
export function BreakdownChart({ counts, labels }: { counts: Record<string, number>; labels: Record<string, string> }) {
  const data = Object.entries(counts)
    .map(([key, count]) => ({ label: labels[key] ?? key, count }))
    .sort((a, b) => b.count - a.count);

  if (data.length === 0) return <p className="text-sm text-muted-foreground">Sem dados ainda.</p>;

  return (
    <ChartContainer config={breakdownChartConfig} className="aspect-auto w-full" style={{ height: Math.max(72, data.length * 36) }}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }} accessibilityLayer>
        <CartesianGrid horizontal={false} strokeOpacity={0.3} />
        <XAxis type="number" hide />
        <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={150} tick={{ fontSize: 12 }} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} barSize={16} />
      </BarChart>
    </ChartContainer>
  );
}

/** Padrão "Bar Chart - Multiple" do ui.shadcn, na variante horizontal — mesmo layout do BreakdownChart, várias séries agrupadas por categoria, com legenda. */
export function MultiBarChart({
  data,
  config,
}: {
  data: ({ label: string } & Record<string, string | number>)[];
  config: ChartConfig;
}) {
  const seriesKeys = Object.keys(config);
  if (data.length === 0) return <p className="text-sm text-muted-foreground">Sem dados ainda.</p>;

  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: Math.max(100, data.length * 60) }}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }} accessibilityLayer>
        <CartesianGrid horizontal={false} strokeOpacity={0.3} />
        <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
        <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={150} tick={{ fontSize: 12 }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {seriesKeys.map((key) => (
          <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={4} />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
