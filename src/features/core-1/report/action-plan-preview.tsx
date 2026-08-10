import Link from "next/link";
import { Circle, CheckCircle2, CircleDot, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ACTION_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  selected: "Selecionada",
  in_progress: "Em andamento",
  completed: "Concluída",
};

const ACTION_STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Circle,
  selected: CircleDot,
  in_progress: Clock,
  completed: CheckCircle2,
};

const ACTION_STATUS_TONE: Record<string, string> = {
  pending: "text-muted-foreground",
  selected: "text-primary",
  in_progress: "text-primary",
  completed: "text-success",
};

export interface ActionPreviewRow {
  id: string;
  status: string;
  title: string;
}

/**
 * §11 — o produto já tem um plano de ações real (/app/acoes: máx. 5 ações,
 * pendente→selecionada→em andamento→concluída). Ele não agrupa por horizonte
 * temporal (imediato/7 dias/30 dias) — não existe esse campo no domínio, então
 * esta seção não inventa essa estrutura; mostra as ações desta análise e leva
 * para o plano completo, preservando a decisão de produto já implementada.
 */
export function ActionPlanPreview({ actions }: { actions: ActionPreviewRow[] }) {
  return (
    <Card id="plano-evolucao">
      <CardHeader>
        <CardTitle>Plano de evolução</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.length > 0 ? (
          <ul className="space-y-2">
            {actions.map((a) => {
              const StatusIcon = ACTION_STATUS_ICON[a.status] ?? Circle;
              return (
                <li key={a.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                  <StatusIcon className={cn("size-4 shrink-0", ACTION_STATUS_TONE[a.status] ?? "text-muted-foreground")} aria-hidden />
                  <span className="min-w-0 flex-1 text-sm text-foreground">{a.title}</span>
                  <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                    {ACTION_STATUS_LABELS[a.status] ?? a.status}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Converta uma recomendação em ação para começar a acompanhar sua evolução aqui.
          </p>
        )}
        <Button asChild variant="tertiary" size="sm">
          <Link href="/app/acoes">Ver plano de ações completo</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
