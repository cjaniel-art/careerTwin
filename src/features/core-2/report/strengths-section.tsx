import { CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Core2Strength } from "@/config/schemas/core2";
import { EvidenceList } from "@/features/core-1/report/evidence-list";
import type { RequirementRow } from "./derive";

/** Análises geradas antes do campo `title` existir não têm rótulo curto — deriva um a partir do início da descrição. */
function shortTitle(strength: Core2Strength): string {
  if (strength.title) return strength.title;
  const firstSentence = strength.description.split(/(?<=[.;])\s/)[0] ?? strength.description;
  return firstSentence.length > 70 ? `${firstSentence.slice(0, 70).trimEnd()}…` : firstSentence;
}

/** §7 (Forças) — pontos fortes reais (calculation_snapshot.strengths), ligados aos requisitos que endereçam. */
export function StrengthsSection({ strengths, rows }: { strengths: Core2Strength[]; rows: RequirementRow[] }) {
  if (strengths.length === 0) {
    return (
      <Card id="forcas">
        <CardHeader>
          <CardTitle>Pontos fortes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum ponto forte identificado nesta análise.</p>
        </CardContent>
      </Card>
    );
  }

  const descriptionById = new Map(rows.map((r) => [r.id, r.description]));

  return (
    <Card id="forcas">
      <CardHeader>
        <CardTitle>Pontos fortes</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {strengths.map((strength, i) => {
            const relatedDescriptions = strength.relatedRequirementIds.map((id) => descriptionById.get(id)).filter(Boolean) as string[];
            return (
              <AccordionItem key={i} value={`strength-${i}`}>
                <AccordionTrigger>
                  <div className="flex w-full items-center gap-3 pr-2 text-left">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                      <CheckCircle2 className="size-3.5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1 text-sm text-foreground">{shortTitle(strength)}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-foreground">{strength.description}</p>
                  {relatedDescriptions.length > 0 ? (
                    <div className="mt-2">
                      <p className="text-xs font-medium uppercase text-muted-foreground">Requisitos relacionados</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-foreground">
                        {relatedDescriptions.map((d, idx) => (
                          <li key={idx}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {strength.evidenceRefs.length > 0 ? (
                    <div className="mt-2">
                      <p className="text-xs font-medium uppercase text-muted-foreground">Evidências</p>
                      <EvidenceList evidenceRefs={strength.evidenceRefs} />
                    </div>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
