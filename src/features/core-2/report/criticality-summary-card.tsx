import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoToTabButton } from "@/features/core-1/report/report-tabs";
import { cn } from "@/lib/utils";
import type { CriticalityBucket } from "./derive";

const PLURAL_LABELS: Record<string, string> = {
  mandatory: "Obrigatórios",
  desired: "Desejáveis",
  differential: "Diferenciais",
  complementary: "Complementares",
  blocking: "Impeditivo",
};

/**
 * Uma cor de acento por criticidade — só o número e o fundo do card mudam,
 * nunca transmitido só pela cor (o rótulo textual está sempre visível).
 * Exportado para RequirementsSection reaproveitar a mesma paleta nos
 * cabeçalhos de grupo da aba "Requisitos da vaga", permitindo correlação
 * visual direta com este card.
 */
export const CRITICALITY_TONE: Record<string, { number: string; bg: string }> = {
  mandatory: { number: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
  desired: { number: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  differential: { number: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  complementary: { number: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  blocking: { number: "text-muted-foreground", bg: "bg-muted-foreground/10" },
};

/** §6.4 — contagens reais de requirements/requirement_assessments por criticidade, nunca inventadas. */
export function CriticalitySummaryCard({ buckets }: { buckets: CriticalityBucket[] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">Requisitos da vaga por criticidade</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-wrap gap-3">
        {buckets.map((bucket) => {
          const tone = CRITICALITY_TONE[bucket.criticality] ?? CRITICALITY_TONE.blocking!;
          return (
            <div key={bucket.criticality} className={cn("min-w-24 flex-1 rounded-lg border border-border p-3", tone.bg)}>
              <p className={cn("text-2xl font-bold", tone.number)}>{bucket.total}</p>
              <p className="text-sm font-medium text-foreground">{PLURAL_LABELS[bucket.criticality] ?? bucket.label}</p>
              <p className="text-xs text-muted-foreground">
                {bucket.met} {bucket.met === 1 ? "atendido" : "atendidos"}
              </p>
            </div>
          );
        })}
      </CardContent>
      <div className="border-t border-border px-6 py-3">
        <GoToTabButton tab="requisitos">Ver todos os requisitos</GoToTabButton>
      </div>
    </Card>
  );
}
