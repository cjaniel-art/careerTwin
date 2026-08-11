import { HistorySheet } from "@/features/core-1/report/history-sheet";
import type { AnalysisHistoryRow } from "@/features/history/get-history";

/** §2 — heading + histórico. Sem ação de reanálise: diferente do Core 1, cada vaga é uma análise própria. */
export function ReportHeader({ historyItems }: { historyItems: AnalysisHistoryRow[] }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Relatório de Aderência à Vaga</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Análise da correspondência entre seu perfil e os requisitos desta vaga.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <HistorySheet items={historyItems} />
      </div>
    </div>
  );
}
