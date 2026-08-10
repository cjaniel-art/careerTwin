import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button";
import { convertRecommendationToActionAction } from "@/features/actions/actions";
import { LIKERT_LABELS, RECOMMENDATION_CATEGORY_LABELS } from "@/lib/result-labels";

export interface RecommendationRow {
  id: string;
  recommendation_key: string;
  category: string;
  title: string;
  problem: string;
  reasoning: string;
  suggested_action: string;
  expected_outcome: string;
  completion_criteria: string;
  impact: number;
  effort: number;
  urgency: number;
  confidence: number;
  status: string;
}

function RecommendationCard({ r, analysisId, highlighted }: { r: RecommendationRow; analysisId: string; highlighted: boolean }) {
  return (
    <div
      id={`recomendacao-${r.recommendation_key}`}
      className={
        highlighted
          ? "rounded-lg border-2 border-primary/40 bg-primary/5 p-4"
          : "rounded-lg border border-border p-4"
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{RECOMMENDATION_CATEGORY_LABELS[r.category] ?? r.category}</Badge>
        <Badge variant="secondary">Impacto {LIKERT_LABELS[r.impact]}</Badge>
        <Badge variant="secondary">Esforço {LIKERT_LABELS[r.effort]}</Badge>
      </div>
      <p className="mt-2 text-base font-semibold text-foreground">{r.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{r.problem}</p>
      <p className="mt-2 text-sm text-foreground">
        <strong>Ação sugerida:</strong> {r.suggested_action}
      </p>

      <Accordion type="single" collapsible className="mt-1">
        <AccordionItem value="details" className="border-0">
          <AccordionTrigger className="py-2 text-xs font-medium text-muted-foreground hover:no-underline">
            Ver detalhes
          </AccordionTrigger>
          <AccordionContent className="space-y-2 pb-2">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Por que isso importa</p>
              <p className="mt-0.5 text-sm text-foreground">{r.reasoning}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Resultado esperado</p>
              <p className="mt-0.5 text-sm text-foreground">{r.expected_outcome}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Critério de conclusão</p>
              <p className="mt-0.5 text-sm text-foreground">{r.completion_criteria}</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>Urgência: {LIKERT_LABELS[r.urgency]}</span>
              <span>Confiança da recomendação: {LIKERT_LABELS[r.confidence]}</span>
            </div>
            <p className="text-xs italic text-muted-foreground">
              Evidências específicas desta recomendação não estão disponíveis nesta versão do relatório.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {r.status === "generated" || r.status === "highlighted" ? (
        <form action={convertRecommendationToActionAction} className="mt-2">
          <input type="hidden" name="recommendationId" value={r.id} />
          <input type="hidden" name="redirectTo" value={`/app/analise-perfil/${analysisId}`} />
          <SubmitButton size="sm" variant="secondary">
            Converter em ação
          </SubmitButton>
        </form>
      ) : r.status === "converted_to_action" ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Já está no seu{" "}
          <Link href="/app/acoes" className="underline">
            plano de ações
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}

/**
 * §8 — até 3 recomendações em destaque (recommendations.status="highlighted",
 * já calculado e persistido pelo backend via priority_order) e as demais numa
 * lista secundária expansível. A UI nunca reordena ou recalcula prioridade.
 */
export function RecommendationsSection({ recommendations, analysisId }: { recommendations: RecommendationRow[]; analysisId: string }) {
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recomendações prioritárias</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhuma recomendação gerada nesta análise.</p>
        </CardContent>
      </Card>
    );
  }

  const top = recommendations.filter((r) => r.status === "highlighted");
  const others = recommendations.filter((r) => r.status !== "highlighted");

  return (
    <Card id="recomendacoes">
      <CardHeader>
        <CardTitle>Recomendações prioritárias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {top.length > 0 ? (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">Top {top.length} recomendações</p>
            <div className="space-y-3">
              {top.map((r) => (
                <RecommendationCard key={r.id} r={r} analysisId={analysisId} highlighted />
              ))}
            </div>
          </div>
        ) : null}

        {others.length > 0 ? (
          <Accordion type="single" collapsible defaultValue="others">
            <AccordionItem value="others" className="border-0">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                Outras recomendações ({others.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {others.map((r) => (
                    <RecommendationCard key={r.id} r={r} analysisId={analysisId} highlighted={false} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : null}

        <Button asChild variant="tertiary" size="sm">
          <Link href="/app/acoes">Ver plano de ações completo</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
