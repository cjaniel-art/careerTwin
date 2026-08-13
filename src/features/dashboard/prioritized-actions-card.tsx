import Link from "next/link";
import { ArrowRight, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetCircleClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ActionPlanBody, type ActionPreviewRow, type RecommendationCandidateRow } from "@/features/core-1/report/action-plan-preview";
import type { PrioritizedAction, SeverityLevel } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

const SEVERITY_BADGE_VARIANT: Record<SeverityLevel, "destructive" | "warning" | "success"> = {
  Alta: "destructive",
  Média: "warning",
  Baixa: "success",
};

/**
 * Resumo (top 3 por prioridade) só com título + severidade — sem barra de
 * progresso/percentual (proibido pela spec). O CTA abre o mesmo Sheet de
 * plano de ação real (ActionPlanBody, com ações rastreáveis desta análise
 * de perfil) já usado no NextBestActionBanner do relatório — não navega
 * para /app/acoes (que mistura ações de todas as análises do usuário).
 */
export function PrioritizedActionsCard({
  summary,
  analysisId,
  actionRows,
  candidates,
  atLimit,
  className,
}: {
  summary: PrioritizedAction[];
  analysisId: string | null;
  actionRows: ActionPreviewRow[];
  candidates: RecommendationCandidateRow[];
  atLimit: boolean;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
        <ListChecks className="size-4 text-muted-foreground" aria-hidden />
        <CardTitle className="text-base font-semibold">Planos de ação priorizados</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-2">
        {summary.length > 0 ? (
          <ol className="flex flex-col gap-3">
            {summary.map((action) => (
              <li key={action.priority} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                  {action.priority}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{action.title}</span>
                <Badge variant={SEVERITY_BADGE_VARIANT[action.severity]}>{action.severity}</Badge>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">Ainda não há uma Análise de Perfil concluída.</p>
        )}

        {analysisId ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" className="mt-auto h-auto py-2">
                Ver plano de ação completo
                <ArrowRight className="size-3.5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent showCloseButton={false} className="w-full gap-0 border-none bg-transparent p-0 sm:w-[45%] sm:max-w-none">
              <div className="flex h-full items-start">
                <SheetCircleClose />
                <div className="flex h-full flex-1 flex-col bg-card px-8">
                  <div className="border-b border-border py-4">
                    <p className="text-xs text-muted-foreground">Desta análise</p>
                    <p className="text-2xl font-semibold text-foreground">Plano de ação</p>
                  </div>
                  <div className="flex flex-1 flex-col overflow-y-auto py-6">
                    <ActionPlanBody analysisId={analysisId} actions={actionRows} candidates={candidates} atLimit={atLimit} />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Button asChild variant="secondary" className="mt-auto h-auto py-2">
            <Link href="/app/analise-perfil">
              Fazer Análise de Perfil
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
