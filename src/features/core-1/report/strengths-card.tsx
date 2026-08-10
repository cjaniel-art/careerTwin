import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * §6 (Card-resumo A) — o schema atual do Core 1 não retorna uma lista de pontos fortes,
 * só profile_analysis_results.main_strength (um único texto). Mostra o único item real,
 * sem fabricar itens adicionais para preencher a lista (ver StrengthsSection para a versão completa).
 */
export function StrengthsCard({ mainStrength }: { mainStrength: string }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <CardTitle className="text-base">Pontos fortes</CardTitle>
        <Badge variant="secondary">1</Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <ul className="space-y-2.5">
          <li className="flex items-start gap-2 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            {mainStrength}
          </li>
        </ul>
      </CardContent>
      <div className="border-t border-border px-6 py-3">
        <Button asChild variant="tertiary" size="sm">
          <Link href="#forcas">Ver todos</Link>
        </Button>
      </div>
    </Card>
  );
}
