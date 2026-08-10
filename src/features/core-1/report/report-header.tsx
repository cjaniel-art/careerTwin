import Link from "next/link";
import { Calendar, ChevronDown, ChevronRight, GitBranch, History, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 ? <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden /> : null}
          {item.href ? (
            <Link href={item.href} className="text-muted-foreground hover:text-primary">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

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

/** §1 — breadcrumb + heading + metadados leves (data, versão do perfil, contexto-alvo, histórico). Todos os valores vêm do backend. */
export function ReportHeader({
  completedAt,
  targetRole,
  profileVersionNumber,
}: {
  completedAt: string | null;
  targetRole: string | null;
  profileVersionNumber: number | null;
}) {
  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) +
      " · " +
      new Date(completedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/app/dashboard" },
          { label: "Análise de perfil", href: "/app/analise-perfil" },
          { label: "Relatório" },
        ]}
      />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Relatório de Análise de Perfil</h1>
          <p className="mt-1 text-sm text-muted-foreground">Diagnóstico da comunicação do seu perfil profissional</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {formattedDate ? <MetaChip icon={Calendar}>{formattedDate}</MetaChip> : null}
          {profileVersionNumber ? <MetaChip icon={GitBranch}>Versão do perfil v{profileVersionNumber}</MetaChip> : null}
          {targetRole ? <TargetContextChip label="Contexto-alvo" value={targetRole} /> : null}
          <Button asChild variant="secondary" size="sm">
            <Link href="/app/historico">
              <History className="size-4" aria-hidden />
              Histórico de análises
              <ChevronDown className="size-3.5" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
