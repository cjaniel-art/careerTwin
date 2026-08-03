"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export interface DailyAnalysesPoint {
  date: string;
  perfil: number;
  aderencia: number;
}

const chartConfig = {
  perfil: { label: "Análise de Perfil", color: "hsl(16, 95%, 50%)" },
  aderencia: { label: "Diagnóstico de Aderência", color: "hsl(16, 95%, 75%)" },
} satisfies ChartConfig;

export function ChartAreaAnalyses({ data }: { data: DailyAnalysesPoint[] }) {
  const [range, setRange] = React.useState("90d");

  const filteredData = React.useMemo(() => {
    const days = range === "30d" ? 30 : range === "7d" ? 7 : 90;
    return data.slice(-days);
  }, [data, range]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Análises ao longo do tempo</CardTitle>
          <CardDescription>Análises de perfil e diagnósticos de aderência criados por dia</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(value) => value && setRange(value)}
            variant="outline"
            className="hidden sm:flex"
          >
            <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">Últimos 30 dias</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 dias</ToggleGroupItem>
          </ToggleGroup>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger size="sm" className="w-36 sm:hidden" aria-label="Selecionar período">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">Últimos 3 meses</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillPerfil" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-perfil)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-perfil)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillAderencia" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-aderencia)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-aderencia)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => new Date(value).toLocaleDateString("pt-BR", { month: "short", day: "numeric" })}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => new Date(value as string).toLocaleDateString("pt-BR", { month: "short", day: "numeric" })}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="aderencia" type="natural" fill="url(#fillAderencia)" stroke="var(--color-aderencia)" stackId="a" />
            <Area dataKey="perfil" type="natural" fill="url(#fillPerfil)" stroke="var(--color-perfil)" stackId="a" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
