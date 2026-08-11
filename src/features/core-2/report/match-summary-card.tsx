import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GoToTabButton } from "@/features/core-1/report/report-tabs";
import type { MatchSummaryDimension } from "./derive";

export function MatchSummaryCard({ dimensions }: { dimensions: MatchSummaryDimension[] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">Resumo da correspondência</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {dimensions.length > 0 ? (
          dimensions.map((d) => (
            <div key={d.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-foreground">{d.label}</span>
                <span className="font-medium text-foreground">{d.percent}%</span>
              </div>
              <Progress value={d.percent} aria-label={d.label} aria-valuenow={d.percent} />
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Sem requisitos suficientes para compor este resumo.</p>
        )}
      </CardContent>
      <div className="border-t border-border px-6 py-3">
        <GoToTabButton tab="requisitos">Ver todos os detalhes</GoToTabButton>
      </div>
    </Card>
  );
}
