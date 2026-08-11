import { Calendar } from "lucide-react";
import { HistorySheet } from "@/features/core-1/report/history-sheet";
import type { AnalysisHistoryRow } from "@/features/history/get-history";

function MetaChip({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
      <Icon className="size-3.5 text-muted-foreground" aria-hidden />
      {children}
    </span>
  );
}

function VersionChip({ label, version }: { label: string; version: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
      {label}
      <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">v{version}</span>
    </span>
  );
}

/** §2 — heading + metadados leves (data, versões, histórico). Sem ação de reanálise: diferente do Core 1, cada vaga é uma análise própria. */
export function ReportHeader({
  completedAt,
  profileVersionNumber,
  jobVersionNumber,
  historyItems,
}: {
  completedAt: string | null;
  profileVersionNumber: number | null;
  jobVersionNumber: number | null;
  historyItems: AnalysisHistoryRow[];
}) {
  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) +
      " · " +
      new Date(completedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Relatório de Aderência à Vaga</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Análise da correspondência entre seu perfil e os requisitos desta vaga.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {formattedDate ? <MetaChip icon={Calendar}>{formattedDate}</MetaChip> : null}
        {profileVersionNumber ? <VersionChip label="Versão do perfil" version={profileVersionNumber} /> : null}
        {jobVersionNumber ? <VersionChip label="Vaga analisada" version={jobVersionNumber} /> : null}
        <HistorySheet items={historyItems} />
      </div>
    </div>
  );
}
