import { ChevronDown, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetCircleClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { AnalysisHistoryRow } from "@/features/history/get-history";

/**
 * Mesmo padrão de Sheet do ConfidenceCard/ReanalysisSheet. `items` já vem
 * pronto de getAnalysisHistory (mesma função usada por /app/historico), então
 * este componente não faz nenhuma query própria.
 */
export function HistorySheet({ items }: { items: AnalysisHistoryRow[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm">
          <History className="size-4" aria-hidden />
          Histórico de análises
          <ChevronDown className="size-3.5" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent showCloseButton={false} className="w-full gap-0 border-none bg-transparent p-0 sm:w-[45%] sm:max-w-none">
        <div className="flex h-full items-start">
          <SheetCircleClose />

          <div className="flex h-full flex-1 flex-col bg-card px-8">
            <div className="border-b border-border py-4">
              <p className="text-xs text-muted-foreground">Todas as suas análises</p>
              <p className="text-2xl font-semibold text-foreground">Histórico de análises</p>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-6">
              {items.length > 0 ? (
                items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.dateLabel} · {item.statusLabel}
                        {item.scoreLabel ? ` · ${item.scoreLabel}` : null}
                      </p>
                    </div>
                    {item.isCompleted ? (
                      <Button asChild size="sm" variant="secondary" className="shrink-0">
                        <Link href={item.href}>Ver resultado</Link>
                      </Button>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma análise ainda.</p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
