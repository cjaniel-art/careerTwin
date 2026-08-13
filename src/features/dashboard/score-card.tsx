"use client";

import { ArrowDown, ArrowUp, Info } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ScoreCardProps {
  title: string;
  value: number;
  max: number;
  label: string;
  description: string;
  delta: number;
  deltaPeriodLabel?: string;
  className?: string;
}

/**
 * Donut de score reutilizado por IPP e IAO (mesmo componente, props diferentes —
 * ver critério de aceite da spec). Usa recharts.Pie diretamente (sem o wrapper
 * ChartContainer de components/ui/chart.tsx) porque é um anel estático de valor
 * único, sem legenda/tooltip de série — o wrapper existe para gráficos
 * multi-série como o de evolução do IPP.
 */
export function ScoreCard({ title, value, max, label, description, delta, deltaPeriodLabel = "vs últimos 30 dias", className }: ScoreCardProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const donutData = [
    { name: "value", value: percentage },
    { name: "rest", value: 100 - percentage },
  ];
  const isPositive = delta >= 0;

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex-row items-center gap-1.5 space-y-0 pb-0">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger aria-label={`Sobre ${title}`}>
              <Info className="size-3.5 text-muted-foreground" aria-hidden />
            </TooltipTrigger>
            <TooltipContent>{description}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-3 pt-4">
        <div
          className="relative flex h-36 w-36 items-center justify-center"
          role="img"
          aria-label={`${title}: ${value} de ${max} pontos. ${label}.`}
        >
          <PieChart width={144} height={144}>
            <Pie
              data={donutData}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              innerRadius={54}
              outerRadius={68}
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill="hsl(var(--primary))" />
              <Cell fill="hsl(var(--secondary))" />
            </Pie>
          </PieChart>
          <div className="absolute flex flex-col items-center" aria-hidden>
            <span className="text-4xl font-semibold tabular-nums text-foreground">{value}</span>
            <span className="text-xs text-muted-foreground">de {max}</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 rounded-full border-transparent px-2.5 py-1 text-xs font-medium",
            isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
          )}
        >
          {isPositive ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />}
          {isPositive ? "+" : ""}
          {delta} pts
        </Badge>
        <p className="text-xs text-muted-foreground">{deltaPeriodLabel}</p>
      </CardContent>
    </Card>
  );
}
