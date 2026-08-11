import { AlertCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvidenceList } from "@/features/core-1/report/evidence-list";
import { CORE2_GAP_TYPE_LABELS, CRITICALITY_LABELS } from "@/lib/result-labels";
import type { RequirementRow } from "./derive";

/** §7 (Lacunas) — todas as lacunas reais (requirement_assessments.gap_type preenchido), com justificativa, criticidade do requisito e evidências. */
export function GapsSection({ rows }: { rows: RequirementRow[] }) {
  const gaps = rows.filter((r) => r.gapType !== null);
  if (gaps.length === 0) {
    return (
      <Card id="lacunas">
        <CardHeader>
          <CardTitle>Lacunas identificadas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhuma lacuna identificada nesta análise.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="lacunas">
      <CardHeader>
        <CardTitle>Lacunas identificadas</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {gaps.map((row) => (
            <AccordionItem key={row.id} value={row.id}>
              <AccordionTrigger>
                <div className="flex w-full items-center gap-3 pr-2 text-left">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <AlertCircle className="size-3.5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-foreground">{row.description}</span>
                  <Badge variant="outline" className="shrink-0">
                    {row.gapType ? (CORE2_GAP_TYPE_LABELS[row.gapType] ?? row.gapType) : ""}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-foreground">{row.reasoning}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Criticidade do requisito: {CRITICALITY_LABELS[row.criticality] ?? row.criticality}
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
      </CardContent>
    </Card>
  );
}
