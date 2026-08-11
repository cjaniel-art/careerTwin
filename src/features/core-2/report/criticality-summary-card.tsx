import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoToTabButton } from "@/features/core-1/report/report-tabs";
import type { CriticalityBucket } from "./derive";

const PLURAL_LABELS: Record<string, string> = {
  mandatory: "Obrigatórios",
  desired: "Desejáveis",
  differential: "Diferenciais",
  complementary: "Complementares",
  blocking: "Impeditivo",
};

/** §6.4 — contagens reais de requirements/requirement_assessments por criticidade, nunca inventadas. */
export function CriticalitySummaryCard({ buckets }: { buckets: CriticalityBucket[] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">Requisitos da vaga por criticidade</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-wrap gap-3">
        {buckets.map((bucket) => (
          <div key={bucket.criticality} className="min-w-24 flex-1 rounded-lg border border-border p-3">
            <p className="text-2xl font-bold text-foreground">{bucket.total}</p>
            <p className="text-sm font-medium text-foreground">{PLURAL_LABELS[bucket.criticality] ?? bucket.label}</p>
            <p className="text-xs text-muted-foreground">
              {bucket.met} {bucket.met === 1 ? "atendido" : "atendidos"}
            </p>
          </div>
        ))}
      </CardContent>
      <div className="border-t border-border px-6 py-3">
        <GoToTabButton tab="requisitos">Ver todos os requisitos</GoToTabButton>
      </div>
    </Card>
  );
}
