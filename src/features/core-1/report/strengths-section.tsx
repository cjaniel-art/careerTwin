import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * §6 — o schema atual do Core 1 (core1DimensionsOutputSchema) não retorna uma
 * lista de pontos fortes; só existe profile_analysis_results.main_strength
 * (um único texto). Renderizar múltiplos itens exigiria inventar conteúdo que
 * a análise não produziu, o que viola a regra de autenticidade — por isso esta
 * seção apresenta o único ponto forte real, sem fabricar itens adicionais.
 * Sinalizado no fechamento do relatório como gap para uma futura extensão do backend.
 */
export function StrengthsSection({ mainStrength }: { mainStrength: string }) {
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
