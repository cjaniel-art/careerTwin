import Link from "next/link";
import { ArrowRight, Briefcase, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Opportunity, SeverityLevel } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

const ADHERENCE_DOT: Record<SeverityLevel, string> = {
  Alta: "bg-success",
  Média: "bg-warning",
  Baixa: "bg-destructive",
};

const ADHERENCE_TEXT: Record<SeverityLevel, string> = {
  Alta: "text-success",
  Média: "text-warning",
  Baixa: "text-destructive",
};

function AdherenceIndicator({ level }: { level: SeverityLevel }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium">
      <span className={cn("size-2 shrink-0 rounded-full", ADHERENCE_DOT[level])} aria-hidden />
      <span className={ADHERENCE_TEXT[level]}>{level}</span>
    </span>
  );
}

/** Anel de progresso proporcional ao IAO real (não um contorno fixo) — value/100 preenche o arco. */
function IaoIndicator({ value }: { value: number }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const filled = Math.min(100, Math.max(0, value));
  const offset = circumference - (filled / 100) * circumference;

  return (
    <span className="relative inline-flex size-10 shrink-0 items-center justify-center" role="img" aria-label={`IAO: ${value} de 100`}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40" aria-hidden>
        <circle cx="20" cy="20" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
    </span>
  );
}

/**
 * Apenas Vaga | IAO | Aderência | Ação — sem Empresa, sem IPP, sem logos
 * (proibido explicitamente pela spec).
 */
export function OpportunitiesCard({ opportunities, className }: { opportunities: Opportunity[]; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Briefcase className="size-4 text-muted-foreground" aria-hidden />
          <CardTitle className="text-base font-semibold">Oportunidades recentes</CardTitle>
        </div>
        <Link href="/app/aderencia" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Ver todas as vagas
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-2">
        {/* Desktop/tablet: tabela. Mobile: lista de cards compactos (sem scroll horizontal). */}
        <div className="hidden overflow-hidden rounded-md border border-border md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Vaga</TableHead>
                <TableHead className="text-center">IAO</TableHead>
                <TableHead>Aderência</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity) => (
                <TableRow key={opportunity.role}>
                  <TableCell className="font-medium text-foreground">{opportunity.role}</TableCell>
                  <TableCell className="text-center">
                    <IaoIndicator value={opportunity.iao} />
                  </TableCell>
                  <TableCell>
                    <AdherenceIndicator level={opportunity.adherence} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="secondary" size="sm">
                      <Link href={opportunity.reportUrl}>
                        Ver relatório
                        <ExternalLink className="size-3.5" aria-hidden />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <ul className="flex flex-col gap-3 md:hidden">
          {opportunities.map((opportunity) => (
            <li key={opportunity.role}>
              <Link
                href={opportunity.reportUrl}
                className="flex items-center gap-3 rounded-md border border-border p-3 transition-colors hover:bg-secondary/60"
              >
                <IaoIndicator value={opportunity.iao} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{opportunity.role}</p>
                  <AdherenceIndicator level={opportunity.adherence} />
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>

        <p className="flex items-start gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          IAO = Índice de Aderência Observável. Reflete a compatibilidade entre seu perfil e os requisitos da vaga.
        </p>
      </CardContent>
    </Card>
  );
}
