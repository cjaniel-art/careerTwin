import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Core1Strength } from "@/config/schemas/core1";
import { GAP_TYPE_LABELS } from "@/lib/result-labels";
import { GoToTabButton } from "./report-tabs";

/** Análises geradas antes do campo `title` existir não têm rótulo curto — deriva um a partir do início da descrição. */
function shortTitle(item: { title?: string; description: string }): string {
  if (item.title) return item.title;
  const firstSentence = item.description.split(/(?<=[.;])\s/)[0] ?? item.description;
  return firstSentence.length > 70 ? `${firstSentence.slice(0, 70).trimEnd()}…` : firstSentence;
}

/**
 * §6 (Card-resumo A) — prévia dos pontos fortes reais (calculation_snapshot.strengths,
 * mesmo enum de tipo que gap.type — daí reaproveitar GAP_TYPE_LABELS aqui). Análises
 * concluídas antes desse campo existir não têm strengths; nesse caso cai no único
 * main_strength já persistido em profile_analysis_results, em vez de mostrar o card vazio.
 */
export function StrengthsCard({ strengths, mainStrength }: { strengths: Core1Strength[]; mainStrength: string }) {
  const preview = strengths.slice(0, 4);
  const count = strengths.length > 0 ? strengths.length : mainStrength ? 1 : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <CardTitle className="text-base">Pontos fortes</CardTitle>
        <Badge variant="secondary">{count}</Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2.5">
        {preview.length > 0 ? (
          preview.map((strength, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{shortTitle(strength)}</span>
              <Badge variant="outline" className="shrink-0">
                {GAP_TYPE_LABELS[strength.type] ?? strength.type}
              </Badge>
            </div>
          ))
        ) : mainStrength ? (
          <div className="flex items-start gap-2 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            {mainStrength}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum ponto forte identificado nesta análise.</p>
        )}
      </CardContent>
      <div className="border-t border-border px-6 py-3">
        <GoToTabButton tab="forcas">Ver todos</GoToTabButton>
      </div>
    </Card>
  );
}
