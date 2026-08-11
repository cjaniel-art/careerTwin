import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CORE2_GAP_TYPE_LABELS, MATCH_LABELS, REQUIREMENT_CATEGORY_LABELS } from "@/lib/result-labels";
import { cn } from "@/lib/utils";
import type { RequirementRow } from "./derive";

const MATCH_TONE: Record<string, string> = {
  confirmed_match: "text-success",
  partial_match: "text-success",
  communication_gap: "text-amber-600 dark:text-amber-400",
  evidence_gap: "text-amber-600 dark:text-amber-400",
  unknown: "text-muted-foreground",
  not_observed: "text-destructive",
  confirmed_mismatch: "text-destructive",
};

/**
 * §7 (Competências) — comparação real das competências/ferramentas exigidas pela vaga
 * (requirements.category "skill"/"tool") contra o que o perfil confirmado demonstra,
 * reaproveitando os mesmos requirement_assessments já usados na aba Requisitos —
 * nenhuma comparação nova é inventada aqui.
 */
export function CompetenciesSection({ rows }: { rows: RequirementRow[] }) {
  const competencies = rows.filter((r) => r.category === "skill" || r.category === "tool");

  return (
    <Card id="competencias">
      <CardHeader>
        <CardTitle>Competências</CardTitle>
      </CardHeader>
      <CardContent>
        {competencies.length > 0 ? (
          <ul className="space-y-2">
            {competencies.map((row) => (
              <li key={row.id} className="rounded-md border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{row.description}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline">{REQUIREMENT_CATEGORY_LABELS[row.category] ?? row.category}</Badge>
                    <span className={cn("text-xs font-medium", MATCH_TONE[row.matchStatus])}>
                      {MATCH_LABELS[row.matchStatus] ?? row.matchStatus}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{row.reasoning}</p>
                {row.gapType ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Categoria da lacuna: {CORE2_GAP_TYPE_LABELS[row.gapType] ?? row.gapType}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma competência ou ferramenta estruturada para esta vaga.</p>
        )}
      </CardContent>
    </Card>
  );
}
