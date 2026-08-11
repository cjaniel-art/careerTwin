import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetCircleClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ActionPlanBody, type ActionPreviewRow, type RecommendationCandidateRow } from "./action-plan-preview";

/**
 * §9 — bloco de destaque final. Texto principal vem de profile_analysis_results.next_best_action.
 * "Ver plano de ação" abre um Sheet com o plano de AÇÕES DESTA análise (mesmos
 * actions/candidates já filtrados por analysisId da aba "Plano de evolução" —
 * nunca o /app/acoes global, que mistura ações de todas as análises do usuário).
 */
export function NextBestActionBanner({
  action,
  analysisId,
  actions,
  candidates,
  atLimit,
}: {
  action: string;
  analysisId: string;
  actions: ActionPreviewRow[];
  candidates: RecommendationCandidateRow[];
  atLimit: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <TrendingUp className="size-5" aria-hidden />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">Próxima ação recomendada</p>
        <p className="mt-1 text-base font-medium text-foreground">{action}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Este é o próximo passo indicado com base na sua análise mais recente.
        </p>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button size="lg" className="shrink-0">
            Ver plano de ação
            <ArrowRight className="size-4" aria-hidden />
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
                <ActionPlanBody analysisId={analysisId} actions={actions} candidates={candidates} atLimit={atLimit} />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
