"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, Clock, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const CONFIDENCE_BADGE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  high: CheckCircle2,
  medium: Clock,
  low: Clock,
};

/**
 * §4 (Card 3) — sempre uma seção própria, nunca misturada visualmente ao IPP (ver IppCard).
 * reasons/missingInformation/conflicts vêm de analyses.confidence_reasons/missing_information/conflicts —
 * reais, gerados pelo backend; nunca inventados aqui.
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
  const [expanded, setExpanded] = useState(false);
  const label = CONFIDENCE_LABELS[level] ?? level;
  const copy = CONFIDENCE_COPY[level];
  const improvementItems = missingInformation.slice(0, 3);
  const hasDetails = reasons.length > 0 || conflicts.length > 0;
  const BadgeIcon = CONFIDENCE_BADGE_ICON[level];

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
        <Badge variant={CONFIDENCE_BADGE_VARIANT[level] ?? "outline"} className="w-fit">
          {BadgeIcon ? <BadgeIcon className="size-3" aria-hidden /> : null}
          {label}
        </Badge>
        {copy ? <p className="text-sm leading-6 text-muted-foreground">{copy}</p> : null}
        {improvementItems.length > 0 ? (
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">O que ajudaria a melhorar esta análise</p>
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
        {expanded ? (
          <div className="space-y-3 border-t border-border pt-3">
            {reasons.length > 0 ? (
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Por que essa confiança</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-foreground">
                  {reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {conflicts.length > 0 ? (
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Conflitos identificados</p>
                <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-foreground">
                  {conflicts.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
      {hasDetails ? (
        <div className="border-t border-border px-6 py-3">
          <Button variant="tertiary" size="sm" onClick={() => setExpanded((v) => !v)} className="gap-1">
            {expanded ? "Ocultar detalhes" : "Ver detalhes"}
            <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} aria-hidden />
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
