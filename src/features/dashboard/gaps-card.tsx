import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetCircleClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Core1Gap } from "@/config/schemas/core1";
import { GapsSection } from "@/features/core-1/report/gaps-section";
import { cn } from "@/lib/utils";

/** Análises geradas antes do campo `title` existir não têm rótulo curto — deriva um a partir do início da descrição. */
function shortTitle(item: { title?: string; description: string }): string {
  if (item.title) return item.title;
  const firstSentence = item.description.split(/(?<=[.;])\s/)[0] ?? item.description;
  return firstSentence.length > 70 ? `${firstSentence.slice(0, 70).trimEnd()}…` : firstSentence;
}

/**
 * O botão abre um Sheet com o conteúdo REAL do relatório de Análise de Perfil
 * (GapsSection, mesmo componente da aba "Lacunas" — título curto, e ao
 * expandir mostra a descrição completa + evidências), não uma lista solta.
 */
export function GapsCard({ gaps, className }: { gaps: Core1Gap[]; className?: string }) {
  const preview = gaps.slice(0, 5).map(shortTitle);

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
        <AlertTriangle className="size-4 text-muted-foreground" aria-hidden />
        <CardTitle className="text-base font-semibold">Lacunas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-2">
        {preview.length > 0 ? (
          <ul className="space-y-2.5">
            {preview.map((gap) => (
              <li key={gap} className="flex items-start gap-2 text-sm text-foreground">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0">{gap}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma lacuna identificada.</p>
        )}

        {gaps.length > 0 ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" className="mt-auto h-auto py-2">
                Ver lacunas completas
                <ArrowRight className="size-3.5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent showCloseButton={false} className="w-full gap-0 border-none bg-transparent p-0 sm:w-[45%] sm:max-w-none">
              <div className="flex h-full items-start">
                <SheetCircleClose />
                <div className="flex h-full flex-1 flex-col overflow-y-auto bg-card px-8 py-6">
                  <p className="pb-4 text-xs text-muted-foreground">Desta análise de perfil</p>
                  <GapsSection gaps={gaps} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : null}
      </CardContent>
    </Card>
  );
}
