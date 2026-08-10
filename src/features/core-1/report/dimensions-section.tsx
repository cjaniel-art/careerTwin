import { BarChart3 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DIMENSION_LABELS, RUBRIC_LEVEL_LABELS } from "@/lib/result-labels";

export interface DimensionRow {
  dimension: string;
  rubric_level: number;
  dimension_score: number;
  reasoning: string;
}

function rubricTone(level: number): string {
  if (level >= 3) return "bg-success/10 text-success";
  if (level === 2) return "bg-primary/10 text-primary";
  return "bg-destructive/10 text-destructive";
}

/**
 * §5 — as sete dimensões do IPP. Score → interpretação → evidência → ação,
 * mas evidenceRefs por dimensão não são persistidas hoje (profile_dimension_results
 * só guarda dimension/rubric_level/dimension_score/reasoning) — expandir mostra
 * a justificativa real do backend ("O que identificamos"), sem inventar
 * subseções que a análise não retorna. Ver nota de gap no fechamento do relatório.
 */
export function DimensionsSection({ dimensions }: { dimensions: DimensionRow[] }) {
  return (
    <Card id="dimensoes">
      <CardHeader>
        <CardTitle>Dimensões analisadas</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {dimensions.map((d) => {
            const label = DIMENSION_LABELS[d.dimension] ?? d.dimension;
            const interpretation = RUBRIC_LEVEL_LABELS[d.rubric_level] ?? "—";
            const score = Math.round(d.dimension_score);
            return (
              <AccordionItem key={d.dimension} value={d.dimension}>
                <AccordionTrigger>
                  <div className="flex w-full items-start gap-3 pr-2 text-left">
                    <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", rubricTone(d.rubric_level))}>
                      <BarChart3 className="size-3.5" aria-hidden />
                    </span>
                    <div className="flex w-full flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-foreground">{label}</span>
                        <span className="shrink-0 text-sm text-muted-foreground">
                          {interpretation} · {score}/100
                        </span>
                      </div>
                      <Progress value={score} aria-label={`${label}: ${score} de 100`} />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-xs font-medium uppercase text-muted-foreground">O que identificamos</p>
                  <p className="mt-1 text-sm leading-6 text-foreground">{d.reasoning}</p>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
