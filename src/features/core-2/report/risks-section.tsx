import { AlertOctagon, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Core2Risk, Core2SeniorityAssessment } from "@/config/schemas/core2";
import { EvidenceList } from "@/features/core-1/report/evidence-list";
import { RISK_SEVERITY_LABELS, RISK_TYPE_LABELS, SENIORITY_LEVEL_LABELS } from "@/lib/result-labels";
import { cn } from "@/lib/utils";
import type { RequirementRow } from "./derive";

const SEVERITY_BADGE_VARIANT: Record<string, "destructive" | "outline" | "success"> = {
  critical: "destructive",
  high: "destructive",
  medium: "outline",
  low: "success",
};

function RiskCard({ risk }: { risk: Core2Risk }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{risk.title}</p>
        <Badge variant={SEVERITY_BADGE_VARIANT[risk.severity] ?? "outline"}>
          {RISK_SEVERITY_LABELS[risk.severity] ?? risk.severity}
        </Badge>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{RISK_TYPE_LABELS[risk.type] ?? risk.type}</p>
      <p className="mt-2 text-sm text-foreground">{risk.description}</p>
      {risk.evidenceRefs.length > 0 ? <EvidenceList evidenceRefs={risk.evidenceRefs} /> : null}
    </div>
  );
}

/**
 * §7 (Riscos) — riscos reais (calculation_snapshot.risks), com bloqueadores
 * (type="blocking_requirement" ou severidade "critical") sempre exibidos à
 * parte, senioridade esperada vs. observada, e requisitos críticos em aberto
 * (obrigatórios/impeditivos sem match confirmado) — tudo derivado de dados
 * já persistidos, nada calculado no frontend.
 */
export function RisksSection({
  risks,
  seniority,
  rows,
}: {
  risks: Core2Risk[];
  seniority: Core2SeniorityAssessment | null;
  rows: RequirementRow[];
}) {
  const blockers = risks.filter((r) => r.type === "blocking_requirement" || r.severity === "critical");
  const otherRisks = risks.filter((r) => !blockers.includes(r));
  const criticalOpenRequirements = rows.filter(
    (r) => (r.criticality === "mandatory" || r.criticality === "blocking") && r.matchStatus !== "confirmed_match",
  );
  const seniorityMismatch = seniority && seniority.observed !== "insufficient_data" && seniority.observed !== seniority.expected;

  return (
    <div className="flex flex-col gap-6">
      <Card id="riscos">
        <CardHeader>
          <CardTitle>Bloqueadores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {blockers.length > 0 ? (
            blockers.map((risk) => <RiskCard key={risk.riskKey} risk={risk} />)
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum bloqueador confirmado.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Outros riscos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {otherRisks.length > 0 ? (
            otherRisks.map((risk) => <RiskCard key={risk.riskKey} risk={risk} />)
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum outro risco identificado.</p>
          )}
        </CardContent>
      </Card>

      {seniority ? (
        <Card>
          <CardHeader>
            <CardTitle>Senioridade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Esperada pela vaga:</span>
              <span className="font-medium text-foreground">{SENIORITY_LEVEL_LABELS[seniority.expected] ?? seniority.expected}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">Observada no perfil:</span>
              <span className={cn("font-medium", seniorityMismatch ? "text-destructive" : "text-foreground")}>
                {SENIORITY_LEVEL_LABELS[seniority.observed] ?? seniority.observed}
              </span>
            </div>
            {seniority.signals.length > 0 ? (
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Sinais observados</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-foreground">
                  {seniority.signals.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          {criticalOpenRequirements.length > 0 ? (
            <ShieldAlert className="size-4 shrink-0 text-destructive" aria-hidden />
          ) : (
            <AlertOctagon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          )}
          <CardTitle>Requisitos críticos em aberto</CardTitle>
        </CardHeader>
        <CardContent>
          {criticalOpenRequirements.length > 0 ? (
            <ul className="space-y-2">
              {criticalOpenRequirements.map((r) => (
                <li key={r.id} className="text-sm text-foreground">
                  {r.description}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum requisito obrigatório ou impeditivo em aberto.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
