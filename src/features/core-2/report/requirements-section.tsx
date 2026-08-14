import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvidenceList } from "@/features/core-1/report/evidence-list";
import { CRITICALITY_LABELS, MATCH_LABELS, REQUIREMENT_CATEGORY_LABELS } from "@/lib/result-labels";
import { bucketFor, type RequirementRow } from "./derive";
import { CRITICALITY_TONE } from "./criticality-summary-card";
import { BUCKET_TEXT_COLORS } from "./adherence-distribution-card";
import { cn } from "@/lib/utils";

const CRITICALITY_ORDER = ["blocking", "mandatory", "desired", "differential", "complementary"] as const;

/** §7 (Requisitos da vaga) — todos os requisitos reais, agrupados por criticidade, com status/confiança/evidências/justificativa. */
export function RequirementsSection({ rows }: { rows: RequirementRow[] }) {
  if (rows.length === 0) {
    return (
      <Card id="requisitos">
        <CardHeader>
          <CardTitle>Requisitos da vaga</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum requisito estruturado para esta vaga.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="requisitos">
      <CardHeader>
        <CardTitle>Requisitos da vaga</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {CRITICALITY_ORDER.map((criticality) => {
          const group = rows.filter((r) => r.criticality === criticality);
          if (group.length === 0) return null;
          const tone = CRITICALITY_TONE[criticality] ?? CRITICALITY_TONE.blocking!;
          return (
            <div key={criticality}>
              <p
                className={cn(
                  "mb-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide",
                  tone.bg,
                  tone.number,
                )}
              >
                {CRITICALITY_LABELS[criticality] ?? criticality} ({group.length})
              </p>
              <Accordion type="single" collapsible className="w-full">
                {group.map((row) => (
                  <AccordionItem key={row.id} value={row.id}>
                    <AccordionTrigger>
                      <div className="flex w-full flex-wrap items-center gap-2 pr-2 text-left">
                        <span className="min-w-0 flex-1 text-sm text-foreground">{row.description}</span>
                        <Badge variant="outline" className="shrink-0">
                          {REQUIREMENT_CATEGORY_LABELS[row.category] ?? row.category}
                        </Badge>
                        <span className={cn("shrink-0 text-xs font-medium", BUCKET_TEXT_COLORS[bucketFor(row)])}>
                          {MATCH_LABELS[row.matchStatus] ?? row.matchStatus}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-foreground">{row.reasoning}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Confiança da avaliação: {Math.round(row.assessmentConfidence * 100)}%
                      </p>
                      {row.evidenceRefs.length > 0 ? (
                        <div className="mt-2">
                          <p className="text-xs font-medium uppercase text-muted-foreground">Evidências</p>
                          <EvidenceList evidenceRefs={row.evidenceRefs} />
                        </div>
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
