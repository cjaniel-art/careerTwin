import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

/** §9 — bloco de destaque final. Texto principal vem de profile_analysis_results.next_best_action. */
export function NextBestActionBanner({ action }: { action: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <TrendingUp className="size-5" aria-hidden />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">Próxima ação recomendada</p>
        <p className="mt-1 text-base font-medium text-foreground">{action}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Este é o próximo passo indicado com base na sua análise mais recente.
        </p>
      </div>
      <Button asChild size="lg" className="shrink-0">
        <Link href="/app/acoes">
          Ver plano de ação
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
