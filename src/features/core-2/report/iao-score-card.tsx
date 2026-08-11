import { HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IAO_BAND_LABELS } from "@/lib/result-labels";

const IAO_BAND_DESCRIPTIONS: Record<string, string> = {
  low_observable_fit: "Seu perfil atende poucos dos requisitos observáveis desta vaga.",
  partial_fit: "Seu perfil atende parte dos requisitos, com lacunas relevantes a considerar.",
  good_observable_fit: "Seu perfil atende boa parte dos requisitos obrigatórios e demonstra potencial para atender aos requisitos desejáveis.",
  high_observable_fit: "Seu perfil atende à maioria dos requisitos observáveis desta vaga.",
};

function ScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  return (
    <div className="relative flex size-36 shrink-0 items-center justify-center">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center" aria-hidden>
        <span className="text-3xl font-bold text-foreground">{clamped}</span>
        <span className="text-sm text-muted-foreground">de 100</span>
      </div>
    </div>
  );
}

/**
 * IAO isolado da confiança e da recomendação (ver ConfidenceCard/RecommendationCard,
 * nunca a mesma área visual). Score e faixa vêm prontos do backend
 * (fit_analysis_results.iao_display_score/iao_band) — nunca recalculados aqui.
 */
export function IaoScoreCard({ score, band }: { score: number; band: string }) {
  const bandLabel = IAO_BAND_LABELS[band] ?? band;
  const description = IAO_BAND_DESCRIPTIONS[band];

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Índice de Aderência Observável (IAO)</CardTitle>
        <Tooltip>
          <TooltipTrigger aria-label="O que é o IAO?" className="text-muted-foreground hover:text-foreground">
            <HelpCircle className="size-4" />
          </TooltipTrigger>
          <TooltipContent className="max-w-64">
            Indica o grau de correspondência observável entre seu perfil confirmado e os requisitos desta vaga.
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="flex flex-1 items-center gap-6" aria-label={`IAO ${score} de 100`}>
        <ScoreRing score={score} />
        <div>
          <p className="text-lg font-bold text-foreground">{bandLabel}</p>
          {description ? <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p> : null}
        </div>
      </CardContent>
      <div className="border-t border-border px-6 py-3">
        <p className="text-center text-xs leading-5 text-muted-foreground">
          O IAO não representa probabilidade de contratação, convite para entrevista ou decisão do recrutador.
        </p>
      </div>
    </Card>
  );
}
