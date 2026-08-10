import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RECOMMENDATION_CATEGORY_LABELS } from "@/lib/result-labels";
import { GoToTabButton, GoToTabRow } from "./report-tabs";
import type { RecommendationRow } from "./recommendations-section";

/**
 * §8 (Card-resumo C) — Top recomendações (recommendations.status="highlighted", já
 * calculado e ordenado pelo backend via priority_order). A UI nunca reordena ou recalcula.
 */
export function TopRecommendationsCard({ recommendations }: { recommendations: RecommendationRow[] }) {
  const top = recommendations.filter((r) => r.status === "highlighted").slice(0, 3);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <CardTitle className="text-base">Top {top.length || 3} recomendações</CardTitle>
        <Badge variant="secondary">{top.length}</Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-1">
        {top.length > 0 ? (
          top.map((r, i) => (
            <GoToTabRow
              key={r.id}
              tab="recomendacoes"
              className="-mx-1.5 flex items-center gap-3 rounded-md px-1.5 py-2 hover:bg-secondary"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{r.title}</span>
              <Badge variant="outline" className="shrink-0">
                {RECOMMENDATION_CATEGORY_LABELS[r.category] ?? r.category}
              </Badge>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </GoToTabRow>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma recomendação em destaque nesta análise.</p>
        )}
      </CardContent>
      <div className="border-t border-border px-6 py-3">
        <GoToTabButton tab="recomendacoes">Ver todas as recomendações</GoToTabButton>
      </div>
    </Card>
  );
}
