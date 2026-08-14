import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoToTabButton } from "@/features/core-1/report/report-tabs";
import { cn } from "@/lib/utils";
import { DISTRIBUTION_BUCKET_LABELS, type DistributionBucket } from "./derive";

const BUCKET_COLORS: Record<DistributionBucket, string> = {
  matched: "bg-success",
  partial: "bg-success/50",
  low_evidence: "bg-amber-500",
  unmatched: "bg-destructive",
  not_applicable: "bg-muted-foreground/30",
};

/**
 * Mesmo mapeamento de cor da barra/legenda acima, em tom de texto — exportado
 * para RequirementsSection colorir o status de cada requisito na aba
 * "Requisitos da vaga", permitindo correlação visual com este card.
 */
export const BUCKET_TEXT_COLORS: Record<DistributionBucket, string> = {
  matched: "text-success",
  partial: "text-success",
  low_evidence: "text-amber-600 dark:text-amber-400",
  unmatched: "text-destructive",
  not_applicable: "text-muted-foreground",
};

export interface DistributionEntry {
  bucket: DistributionBucket;
  count: number;
  percent: number;
}

/** §6.5 — distribuição real por match_status/applicability (ver computeDistribution em derive.ts). */
export function AdherenceDistributionCard({ distribution }: { distribution: DistributionEntry[] }) {
  const visible = distribution.filter((d) => d.count > 0);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">Distribuição de aderência</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary" role="img" aria-label="Distribuição de aderência dos requisitos">
          {visible.map((d) => (
            <div key={d.bucket} className={cn("h-full", BUCKET_COLORS[d.bucket])} style={{ width: `${d.percent}%` }} title={`${DISTRIBUTION_BUCKET_LABELS[d.bucket]}: ${d.count} (${d.percent}%)`} />
          ))}
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {visible.map((d) => (
            <li key={d.bucket} className="flex items-center gap-2 text-sm">
              <span className={cn("size-2.5 shrink-0 rounded-full", BUCKET_COLORS[d.bucket])} aria-hidden />
              <span className="text-foreground">{DISTRIBUTION_BUCKET_LABELS[d.bucket]}</span>
              <span className="text-muted-foreground">
                {d.count} ({d.percent}%)
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <div className="border-t border-border px-6 py-3">
        <GoToTabButton tab="requisitos">Ver requisitos não atendidos</GoToTabButton>
      </div>
    </Card>
  );
}
