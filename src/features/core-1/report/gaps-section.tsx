import { AlertCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Core1Gap } from "@/config/schemas/core1";
import { GAP_TYPE_LABELS } from "@/lib/result-labels";
import { EvidenceList } from "./evidence-list";

/**
 * §7 — lacunas reais de profile_analysis_results.calculation_snapshot.gaps
 * (mesmo payload validado que o backend gravou). Nunca traduz ausência de
 * evidência em ausência de competência — o texto vem literalmente do que a
 * análise escreveu, que já segue essa regra na origem (P-005's prompt).
 */
export function GapsSection({ gaps }: { gaps: Core1Gap[] }) {
  if (gaps.length === 0) return null;
  return (
    <Card id="lacunas">
      <CardHeader>
        <CardTitle>Lacunas identificadas</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {gaps.map((gap, i) => (
            <AccordionItem key={i} value={`gap-${i}`}>
              <AccordionTrigger>
                <div className="flex w-full items-center gap-3 pr-2 text-left">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <AlertCircle className="size-3.5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 text-sm text-foreground">{gap.description}</span>
                  <Badge variant="outline" className="shrink-0">
                    {GAP_TYPE_LABELS[gap.type] ?? gap.type}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {gap.missingInformation.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium uppercase text-muted-foreground">O que ajudaria a confirmar</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-foreground">
                      {gap.missingInformation.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {gap.evidenceRefs.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Evidências</p>
                    <EvidenceList evidenceRefs={gap.evidenceRefs} />
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
