import { AlertTriangle, HelpCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GoToTabButton } from "@/features/core-1/report/report-tabs";
import { RECOMMENDATION_LABELS } from "@/lib/result-labels";
import { cn } from "@/lib/utils";

/**
 * Mapping visual isolado por tipo de recomendação — nunca decidido no frontend
 * (o tipo vem pronto de fit_analysis_results.recommendation_type, calculado
 * pelo backend em determineApplicationRecommendation). Cobre os 5 tipos de
 * escopo "application" (job_analysis) e, por reuso futuro, os de "target_role".
 */
const RECOMMENDATION_VISUALS: Record<string, { icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  apply_now: { icon: ThumbsUp, tone: "bg-success text-success-foreground" },
  apply_with_adjustments: { icon: ThumbsUp, tone: "bg-success text-success-foreground" },
  ready_to_prioritize: { icon: ThumbsUp, tone: "bg-success text-success-foreground" },
  prioritize_with_adjustments: { icon: ThumbsUp, tone: "bg-success text-success-foreground" },
  develop_gaps_before_applying: { icon: AlertTriangle, tone: "bg-amber-500 text-white" },
  develop_before_prioritizing: { icon: AlertTriangle, tone: "bg-amber-500 text-white" },
  do_not_prioritize: { icon: ThumbsDown, tone: "bg-destructive text-destructive-foreground" },
  reassess_target_context: { icon: AlertTriangle, tone: "bg-amber-500 text-white" },
  insufficient_data: { icon: HelpCircle, tone: "bg-muted text-muted-foreground" },
};

export function RecommendationCard({ type, reasoning }: { type: string; reasoning: string }) {
  const visual = RECOMMENDATION_VISUALS[type] ?? RECOMMENDATION_VISUALS.insufficient_data!;
  const Icon = visual.icon;
  const label = RECOMMENDATION_LABELS[type] ?? type;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Recomendação geral</CardTitle>
        <Tooltip>
          <TooltipTrigger aria-label="O que é a recomendação geral?" className="text-muted-foreground hover:text-foreground">
            <HelpCircle className="size-4" />
          </TooltipTrigger>
          <TooltipContent className="max-w-64">
            Combina o IAO, a confiança da análise e eventuais riscos identificados — nunca calculada apenas pelo score.
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", visual.tone)} aria-hidden>
            <Icon className="size-5" />
          </span>
          <p className="text-lg font-bold leading-tight text-foreground">{label}</p>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{reasoning}</p>
      </CardContent>
      <div className="border-t border-border px-6 py-3">
        <GoToTabButton tab="plano-de-acao" variant="success" size="default" className="w-full">
          Ver plano de ação
        </GoToTabButton>
      </div>
    </Card>
  );
}
