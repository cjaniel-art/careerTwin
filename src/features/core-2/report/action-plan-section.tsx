import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Core2ActionCandidate } from "@/config/schemas/core2";
import { ACTION_HORIZON_LABELS, LIKERT_LABELS } from "@/lib/result-labels";
import type { RequirementRow } from "./derive";

/**
 * §7 (Plano de ação) — sugestões reais (calculation_snapshot.actionCandidates), somente
 * leitura: diferente do Core 1, ainda não existe conversão em `actions` rastreáveis
 * para o Core 2 (nenhuma server action equivalente a convertRecommendationToActionAction).
 */
export function ActionPlanSection({ actions, rows }: { actions: Core2ActionCandidate[]; rows: RequirementRow[] }) {
  const descriptionById = new Map(rows.map((r) => [r.id, r.description]));

  return (
    <Card id="plano-de-acao">
      <CardHeader>
        <CardTitle>Plano de ação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.length > 0 ? (
          actions.slice(0, 5).map((action) => {
            const related = action.relatedRequirementIds.map((id) => descriptionById.get(id)).filter(Boolean) as string[];
            return (
              <div key={action.actionKey} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{ACTION_HORIZON_LABELS[action.horizon] ?? action.horizon}</Badge>
                  <Badge variant="secondary">Impacto {LIKERT_LABELS[action.impact]}</Badge>
                  <Badge variant="secondary">Esforço {LIKERT_LABELS[action.effort]}</Badge>
                </div>
                <p className="mt-2 text-base font-semibold text-foreground">{action.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{action.reasoning}</p>
                <p className="mt-2 text-sm text-foreground">
                  <strong>Ação sugerida:</strong> {action.suggestedAction}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  <strong>Critério de sucesso:</strong> {action.successCriteria}
                </p>
                {related.length > 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">Relacionado a: {related.join("; ")}</p>
                ) : null}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma ação sugerida nesta análise.</p>
        )}
      </CardContent>
    </Card>
  );
}
