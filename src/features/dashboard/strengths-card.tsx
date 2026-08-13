import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetCircleClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Core1Strength } from "@/config/schemas/core1";
import { StrengthsSection } from "@/features/core-1/report/strengths-section";
import { cn } from "@/lib/utils";

/** Análises geradas antes do campo `title` existir não têm rótulo curto — deriva um a partir do início da descrição. */
function shortTitle(item: { title?: string; description: string }): string {
  if (item.title) return item.title;
  const firstSentence = item.description.split(/(?<=[.;])\s/)[0] ?? item.description;
  return firstSentence.length > 70 ? `${firstSentence.slice(0, 70).trimEnd()}…` : firstSentence;
}

/**
 * O botão abre um Sheet com o conteúdo REAL do relatório de Análise de Perfil
 * (StrengthsSection, mesmo componente da aba "Forças" — título curto, e ao
 * expandir mostra a descrição completa + evidências), não uma lista solta.
 */
export function StrengthsCard({
  strengths,
  mainStrength,
  className,
}: {
  strengths: Core1Strength[];
  mainStrength: string;
  className?: string;
}) {
  const preview = strengths.slice(0, 5).map(shortTitle);

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
        <Sparkles className="size-4 text-muted-foreground" aria-hidden />
        <CardTitle className="text-base font-semibold">Forças</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-2">
        {preview.length > 0 ? (
          <ul className="space-y-2.5">
            {preview.map((strength) => (
              <li key={strength} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                <span className="min-w-0">{strength}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Ainda não há uma Análise de Perfil concluída.</p>
        )}

        {strengths.length > 0 || mainStrength ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" className="mt-auto h-auto py-2">
                Ver forças completas
                <ArrowRight className="size-3.5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent showCloseButton={false} className="w-full gap-0 border-none bg-transparent p-0 sm:w-[45%] sm:max-w-none">
              <div className="flex h-full items-start">
                <SheetCircleClose />
                <div className="flex h-full flex-1 flex-col overflow-y-auto bg-card px-8 py-6">
                  <p className="pb-4 text-xs text-muted-foreground">Desta análise de perfil</p>
                  <StrengthsSection strengths={strengths} mainStrength={mainStrength} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : null}
      </CardContent>
    </Card>
  );
}
