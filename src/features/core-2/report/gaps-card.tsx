import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RequirementRow } from "./derive";
import { GoToTabButton } from "@/features/core-1/report/report-tabs";
import { CORE2_GAP_TYPE_LABELS } from "@/lib/result-labels";

/**
 * §6.3 — lacunas reais: requisitos com gap_type preenchido (requirement_assessments.gap_type,
 * já persistido pelo backend). Nunca traduz "não observado" em "não possui a competência" —
 * o texto vem do requisito real, só rotulado pelo tipo de lacuna.
 */
export function GapsCard({ rows }: { rows: RequirementRow[] }) {
  const gaps = rows.filter((r) => r.gapType !== null);
  const preview = gaps.slice(0, 4);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <CardTitle className="text-base">Principais lacunas</CardTitle>
        <Badge variant="secondary">{gaps.length}</Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2.5">
        {preview.length > 0 ? (
          preview.map((row) => (
            <div key={row.id} className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0 flex-1 text-sm text-foreground">{row.description}</span>
              <Badge variant="outline" className="shrink-0">
                {row.gapType ? (CORE2_GAP_TYPE_LABELS[row.gapType] ?? row.gapType) : ""}
              </Badge>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma lacuna identificada nesta análise.</p>
        )}
      </CardContent>
      <div className="border-t border-border px-6 py-3">
        <GoToTabButton tab="lacunas">Ver todas as lacunas</GoToTabButton>
      </div>
    </Card>
  );
}
