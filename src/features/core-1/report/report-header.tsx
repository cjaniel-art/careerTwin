import Link from "next/link";
import { Calendar, ChevronDown, History, RefreshCw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { startProfileAnalysisAction } from "@/features/core-1/actions";

function MetaChip({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
      <Icon className="size-3.5 text-muted-foreground" aria-hidden />
      {children}
    </span>
  );
}

function TargetContextChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
      <Target className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold text-foreground">{value}</span>
      </span>
    </span>
  );
}

/**
 * §1 — heading + metadados leves (data, contexto-alvo, histórico, reanálise).
 * Todos os valores vêm do backend. startProfileAnalysisAction já é idempotente por versão de
 * perfil/contexto-alvo (ver ensureProfileAnalysisRow): sem uma mudança real no Thin Twin ou no
 * objetivo, reanalisar aqui volta para esta mesma análise em vez de criar uma nova.
 */
export function ReportHeader({
  completedAt,
  targetRole,
}: {
  completedAt: string | null;
  targetRole: string | null;
}) {
  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) +
      " · " +
      new Date(completedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Relatório de Análise de Perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">Diagnóstico da comunicação do seu perfil profissional</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {formattedDate ? <MetaChip icon={Calendar}>{formattedDate}</MetaChip> : null}
        {targetRole ? <TargetContextChip label="Contexto-alvo" value={targetRole} /> : null}
        <Button asChild variant="secondary" size="sm">
          <Link href="/app/historico">
            <History className="size-4" aria-hidden />
            Histórico de análises
            <ChevronDown className="size-3.5" aria-hidden />
          </Link>
        </Button>
        <form action={startProfileAnalysisAction}>
          <SubmitButton variant="secondary" size="sm">
            <RefreshCw className="size-4" aria-hidden />
            Reanalisar perfil
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
