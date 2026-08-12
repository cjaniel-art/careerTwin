import { CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Core1Strength } from "@/config/schemas/core1";
import { GAP_TYPE_LABELS } from "@/lib/result-labels";
import { EvidenceList } from "./evidence-list";

/** Análises geradas antes do campo `title` existir não têm rótulo curto — deriva um a partir do início da descrição. */
function shortTitle(item: { title?: string; description: string }): string {
  if (item.title) return item.title;
  const firstSentence = item.description.split(/(?<=[.;])\s/)[0] ?? item.description;
  return firstSentence.length > 70 ? `${firstSentence.slice(0, 70).trimEnd()}…` : firstSentence;
}

/**
 * §6 — pontos fortes reais de profile_analysis_results.calculation_snapshot.strengths
 * (mesmo payload validado que o backend gravou, mesmo enum de tipo que gap.type — daí
 * reaproveitar GAP_TYPE_LABELS). Análises concluídas antes desse campo existir não têm
 * strengths; nesse caso cai no único main_strength já persistido, em vez de ficar vazia.
 */
export function StrengthsSection({ strengths, mainStrength }: { strengths: Core1Strength[]; mainStrength: string }) {
  if (strengths.length === 0) {
    if (!mainStrength) return null;
    return (
      <Card id="forcas">
        <CardHeader>
          <CardTitle>Pontos fortes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 rounded-md border border-border p-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="size-3.5" aria-hidden />
            </span>
            <p className="text-sm leading-6 text-foreground">{mainStrength}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="forcas">
      <CardHeader>
        <CardTitle>Pontos fortes</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {strengths.map((strength, i) => (
            <AccordionItem key={i} value={`strength-${i}`}>
              <AccordionTrigger>
                <div className="flex w-full items-center gap-3 pr-2 text-left">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                    <CheckCircle2 className="size-3.5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-foreground">{shortTitle(strength)}</span>
                  <Badge variant="outline" className="shrink-0">
                    {GAP_TYPE_LABELS[strength.type] ?? strength.type}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-foreground">{strength.description}</p>
                {strength.evidenceRefs.length > 0 ? (
                  <div className="mt-2">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Evidências</p>
                    <EvidenceList evidenceRefs={strength.evidenceRefs} />
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
