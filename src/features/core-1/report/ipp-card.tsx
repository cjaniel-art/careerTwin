import { HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IPP_BAND_LABELS } from "@/lib/result-labels";

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
 * §3 (Card 2) — IPP isolado da confiança (ver ConfidenceCard, nunca a mesma área visual).
 * Score e faixa vêm prontos do backend (profile_analysis_results.ipp_display_score/ipp_band) —
 * este componente só apresenta, nunca deriva ou recalcula.
 */
export function IppCard({ score, band }: { score: number; band: string }) {
  const bandLabel = IPP_BAND_LABELS[band] ?? band;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">IPP — Índice de Prontidão do Perfil</CardTitle>
        <Tooltip>
          <TooltipTrigger aria-label="O que é o IPP?" className="text-muted-foreground hover:text-foreground">
            <HelpCircle className="size-4" />
          </TooltipTrigger>
          <TooltipContent className="max-w-64">
            O IPP avalia a prontidão observável da comunicação do seu perfil com base nas informações confirmadas.
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="flex flex-1 items-center gap-6" aria-label={`IPP ${score} de 100`}>
        <ScoreRing score={score} />
        <div>
          <p className="text-lg font-bold text-foreground">{bandLabel}</p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            O IPP avalia a prontidão observável da comunicação do seu perfil.
          </p>
        </div>
      </CardContent>
      <div className="border-t border-border px-6 py-3">
        <p className="text-center text-xs leading-5 text-muted-foreground">
          O IPP não representa empregabilidade, valor profissional ou probabilidade de contratação.
        </p>
      </div>
    </Card>
  );
}
