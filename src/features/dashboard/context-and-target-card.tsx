import { Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { IppDimensionRow, ProfileContext } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

/** rubric_level (0-4, profile_dimension_results) → cor da barra. Mesmo corte de "bom" (>=3) do relatório real (dimensions-section.tsx). */
function rubricBarColor(level: number): string {
  if (level >= 3) return "bg-success";
  if (level === 2) return "bg-warning";
  return "bg-destructive";
}

/**
 * Contexto atual + as 7 dimensões reais do IPP (profile_dimension_results,
 * pesos de CORE_1_CONFIG.ipp.weights) — UM único card (decisão explícita do
 * usuário), dados reais da última Análise de Perfil concluída. Visual: barra
 * única por pilar (maior, mais legível) em vez do par barra+rótulo compacto —
 * não há um "objetivo-alvo" real por dimensão para comparar lado a lado.
 */
export function ContextAndTargetCard({
  context,
  dimensions,
  className,
}: {
  context: ProfileContext | null;
  dimensions: IppDimensionRow[];
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
        <Briefcase className="size-4 text-muted-foreground" aria-hidden />
        <CardTitle className="text-base font-semibold">Contexto e pilares do perfil</CardTitle>
      </CardHeader>
      <CardContent className="grid min-h-0 flex-1 grid-cols-1 gap-6 pt-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contexto atual</p>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Área</p>
            <p className="text-xl font-semibold text-foreground">{context?.area ?? "Não informado"}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Nível</p>
            <p className="text-xl font-semibold text-foreground">{context?.level ?? "Não informado"}</p>
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-3 border-t border-border pt-5 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <p className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">Pilares do IPP</p>
          {dimensions.length > 0 ? (
            <ul
              className={cn(
                "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-3",
                "[scrollbar-color:hsl(var(--border))_transparent] [scrollbar-width:thin]",
                "[&::-webkit-scrollbar]:w-1.5",
                "[&::-webkit-scrollbar-track]:bg-transparent",
                "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
              )}
            >
              {dimensions.map((dimension) => (
                <li key={dimension.key} className="shrink-0">
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-sm text-foreground" title={dimension.name}>
                      {dimension.name}
                      <span className="ml-1.5 text-xs text-muted-foreground">{Math.round(dimension.weight * 100)}%</span>
                    </span>
                    <span className="shrink-0 text-lg font-semibold tabular-nums text-foreground" aria-label={dimension.levelLabel}>
                      {dimension.score}
                    </span>
                  </div>
                  <Progress
                    value={dimension.score}
                    indicatorClassName={rubricBarColor(dimension.rubricLevel)}
                    aria-label={`${dimension.name}: ${dimension.score} de 100, ${dimension.levelLabel}`}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Ainda não há uma Análise de Perfil concluída.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
