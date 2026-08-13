"use client";

import * as React from "react";
import { ArrowUp, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { IppEvolution } from "@/lib/mock/dashboard";

const RANGE_OPTIONS = [
  { value: "30d", label: "Últimos 30 dias", points: 4 },
  { value: "90d", label: "Últimos 90 dias", points: 8 },
  { value: "6m", label: "Últimos 6 meses", points: 12 },
  { value: "1y", label: "Último ano", points: 12 },
] as const;

const chartConfig = {
  value: { label: "IPP", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export function IppEvolutionCard({ evolution, className }: { evolution: IppEvolution; className?: string }) {
  const [range, setRange] = React.useState<string>("90d");

  const points = RANGE_OPTIONS.find((option) => option.value === range)?.points ?? evolution.history.length;
  const filteredData = evolution.history.slice(-points);
  const isPositive = evolution.delta >= 0;

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-muted-foreground" aria-hidden />
          <CardTitle className="text-base font-semibold">Evolução do IPP</CardTitle>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger size="sm" className="w-40 bg-secondary" aria-label="Selecionar período de evolução do IPP">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-2">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Atual</p>
            <p className="text-2xl font-semibold tabular-nums text-foreground">{evolution.current}</p>
            <p className="text-xs text-muted-foreground">de 100</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Anterior</p>
            <p className="text-2xl font-semibold tabular-nums text-foreground">{evolution.previous}</p>
            <p className="text-xs text-muted-foreground">de 100</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Variação</p>
            <p className={`flex items-center justify-center gap-1 text-2xl font-semibold tabular-nums ${isPositive ? "text-success" : "text-destructive"}`}>
              {isPositive ? <ArrowUp className="size-4" aria-hidden /> : null}
              {isPositive ? "+" : ""}
              {evolution.delta} pts
            </p>
            <p className="text-xs text-muted-foreground">{evolution.deltaPeriodLabel}</p>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
          <AreaChart data={filteredData} accessibilityLayer role="img" aria-label="Gráfico de evolução do IPP ao longo do tempo">
            <defs>
              <linearGradient id="fillIppEvolution" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.4} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={8} width={28} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Area dataKey="value" type="natural" fill="url(#fillIppEvolution)" stroke="var(--color-value)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
