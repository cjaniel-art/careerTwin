import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetCircleClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ActionPlanBody, type ActionPreviewRow, type RecommendationCandidateRow } from "@/features/core-1/report/action-plan-preview";

/**
 * Botão + Sheet reutilizados pelos cards da Dashboard que apontam para o
 * plano de ação (real, rastreável) desta Análise de Perfil — mesmo padrão do
 * NextBestActionBanner do relatório. Evita triplicar o Sheet em
 * PrioritizedActionsCard, StrengthsCard e GapsCard.
 */
export function ActionPlanSheetButton({
  label,
  analysisId,
  actionRows,
  candidates,
  atLimit,
  className = "mt-auto h-auto py-2",
}: {
  label: string;
  analysisId: string;
  actionRows: ActionPreviewRow[];
  candidates: RecommendationCandidateRow[];
  atLimit: boolean;
  className?: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" className={className}>
          {label}
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
  );
}
