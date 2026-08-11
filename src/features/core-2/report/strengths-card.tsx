import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Core2Strength } from "@/config/schemas/core2";
import { GoToTabButton } from "@/features/core-1/report/report-tabs";

/** §6.2 — prévia dos pontos fortes reais (fit_analysis_results.calculation_snapshot.strengths). */
export function StrengthsCard({ strengths }: { strengths: Core2Strength[] }) {
  const preview = strengths.slice(0, 4);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <CardTitle className="text-base">Principais pontos fortes</CardTitle>
        <Badge variant="secondary">{strengths.length}</Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2.5">
        {preview.length > 0 ? (
          preview.map((strength, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              {strength.description}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum ponto forte identificado nesta análise.</p>
        )}
      </CardContent>
      <div className="border-t border-border px-6 py-3">
        <GoToTabButton tab="forcas">Ver todas as forças</GoToTabButton>
      </div>
    </Card>
  );
}
