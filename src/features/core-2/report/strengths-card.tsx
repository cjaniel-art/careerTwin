import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Core2Strength } from "@/config/schemas/core2";
import { GoToTabButton } from "@/features/core-1/report/report-tabs";

/** Análises geradas antes do campo `title` existir não têm rótulo curto — deriva um a partir do início da descrição. */
function shortTitle(strength: Core2Strength): string {
  if (strength.title) return strength.title;
  const firstSentence = strength.description.split(/(?<=[.;])\s/)[0] ?? strength.description;
  return firstSentence.length > 70 ? `${firstSentence.slice(0, 70).trimEnd()}…` : firstSentence;
}

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
            <div key={i} className="flex items-center gap-2.5 text-sm text-foreground">
              <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{shortTitle(strength)}</span>
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
