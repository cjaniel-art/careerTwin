import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvidenceList } from "@/features/core-1/report/evidence-list";
import { MATCH_LABELS } from "@/lib/result-labels";
import type { RequirementRow } from "./derive";

/**
 * §7 (Evidências) — rastreabilidade requisito → conclusão → evidência real,
 * usando o mesmo evidenceByRequirement persistido em calculation_snapshot
 * (antes descartado após o cálculo do IAO).
 */
export function EvidenceSection({ rows }: { rows: RequirementRow[] }) {
  const withEvidence = rows.filter((r) => r.evidenceRefs.length > 0);

  return (
    <Card id="evidencias">
      <CardHeader>
        <CardTitle>Evidências</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {withEvidence.length > 0 ? (
          withEvidence.map((row) => (
            <div key={row.id} className="rounded-md border border-border p-3">
              <p className="text-sm font-medium text-foreground">{row.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Conclusão: {MATCH_LABELS[row.matchStatus] ?? row.matchStatus}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{row.reasoning}</p>
              <EvidenceList evidenceRefs={row.evidenceRefs} />
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma evidência registrada nesta análise.</p>
        )}
      </CardContent>
    </Card>
  );
}
