import { ChevronRight, CheckCircle2, Clock, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetCircleClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CONFIDENCE_LABELS } from "@/lib/result-labels";

const CONFIDENCE_COPY: Record<string, string> = {
  high: "Alta confiança: o perfil foi confirmado e as principais conclusões possuem evidências rastreáveis.",
  medium: "Existem informações suficientes para orientar seus próximos passos, mas alguns pontos ainda precisam de confirmação.",
  low: "Baixa confiança: faltam informações ou existem divergências importantes. Este resultado deve ser considerado preliminar.",
};

const CONFIDENCE_BADGE_VARIANT: Record<string, "success" | "outline" | "destructive"> = {
  high: "success",
  medium: "outline",
  low: "destructive",
};

const CONFIDENCE_BADGE_CLASSNAME: Record<string, string> = {
  medium: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

const CONFIDENCE_BADGE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  high: CheckCircle2,
  medium: Clock,
  low: Clock,
};

/**
 * §4 (Card 3) — sempre uma seção própria, nunca misturada visualmente ao IPP (ver IppCard).
 * reasons/missingInformation/conflicts vêm de analyses.confidence_reasons/missing_information/conflicts —
 * reais, gerados pelo backend; nunca inventados aqui. "Ver detalhes" abre um Sheet com o relatório
 * completo (todas as razões/itens/conflitos, não só a prévia de até 3 itens do card).
 */
export function ConfidenceCard({
  level,
  reasons,
  missingInformation,
  conflicts,
}: {
  level: string;
  reasons: string[];
  missingInformation: string[];
  conflicts: string[];
}) {
  const label = CONFIDENCE_LABELS[level] ?? level;
  const copy = CONFIDENCE_COPY[level];
  const improvementItems = missingInformation.slice(0, 3);
  const hasDetails = reasons.length > 0 || missingInformation.length > 0 || conflicts.length > 0;
  const BadgeIcon = CONFIDENCE_BADGE_ICON[level];
  const badgeClassName = cn("w-fit", CONFIDENCE_BADGE_CLASSNAME[level]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Confiança da análise</CardTitle>
        <Tooltip>
          <TooltipTrigger aria-label="O que é a confiança da análise?" className="text-muted-foreground hover:text-foreground">
            <HelpCircle className="size-4" />
          </TooltipTrigger>
          <TooltipContent className="max-w-64">
            Indica o quanto as informações disponíveis sustentam as conclusões desta análise.
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <Badge variant={CONFIDENCE_BADGE_VARIANT[level] ?? "outline"} className={badgeClassName}>
          {BadgeIcon ? <BadgeIcon className="size-3" aria-hidden /> : null}
          {label}
        </Badge>
        {copy ? <p className="text-sm leading-6 text-muted-foreground">{copy}</p> : null}
        {improvementItems.length > 0 ? (
          <div>
            <p className="text-sm font-semibold text-foreground">O que ajudaria a melhorar esta análise</p>
            <ul className="mt-2 space-y-1.5">
              {improvementItems.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-foreground">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
      {hasDetails ? (
        <div className="border-t border-border px-6 py-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-1">
                Ver detalhes
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent showCloseButton={false} className="w-full gap-0 border-none bg-transparent p-0 sm:w-[45%] sm:max-w-none">
              <div className="flex h-full items-start">
                <SheetCircleClose />

                <div className="flex h-full flex-1 flex-col bg-card px-8">
                  <div className="border-b border-border py-4">
                    <p className="text-xs text-muted-foreground">Relatório de</p>
                    <p className="text-2xl font-semibold text-foreground">Confiança da análise</p>
                  </div>

                  <div className="flex flex-1 flex-col gap-7 overflow-y-auto py-6">
                    <div>
                      <Badge variant={CONFIDENCE_BADGE_VARIANT[level] ?? "outline"} className={badgeClassName}>
                        {BadgeIcon ? <BadgeIcon className="size-3" aria-hidden /> : null}
                        {label}
                      </Badge>
                      {copy ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p> : null}
                    </div>
                    {missingInformation.length > 0 ? (
                      <div>
                        <p className="text-sm font-semibold text-foreground">O que ajudaria a melhorar esta análise</p>
                        <ul className="mt-2 space-y-1.5">
                          {missingInformation.map((item) => (
                            <li key={item} className="flex gap-2 text-sm text-foreground">
                              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {reasons.length > 0 ? (
                      <div>
                        <p className="text-sm font-semibold text-foreground">Por que essa confiança</p>
                        <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-foreground">
                          {reasons.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {conflicts.length > 0 ? (
                      <div>
                        <p className="text-sm font-semibold text-foreground">Conflitos identificados</p>
                        <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-foreground">
                          {conflicts.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      ) : null}
    </Card>
  );
}
