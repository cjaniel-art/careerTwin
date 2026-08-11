import { Circle, CheckCircle2, CircleDot, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button";
import { advanceActionStatusAction, convertRecommendationToActionAction } from "@/features/actions/actions";
import { ACTIONS_CONFIG } from "@/config/engine/actions";
import { RECOMMENDATION_CATEGORY_LABELS } from "@/lib/result-labels";
import { cn } from "@/lib/utils";

const ACTION_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  selected: "Selecionada",
  in_progress: "Em andamento",
  completed: "Concluída",
};

const ACTION_ADVANCE_LABELS: Record<string, string> = {
  pending: "Selecionar",
  selected: "Iniciar",
  in_progress: "Concluir",
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
  suggestedAction: string;
}

export interface RecommendationCandidateRow {
  id: string;
  title: string;
  problem: string;
  category: string;
}

/**
 * Miolo sem o Card wrapper — reaproveitado pela aba "Plano de evolução"
 * (ActionPlanPreview abaixo) e pelo NextBestActionSheet (aberto a partir do
 * banner "Ver plano de ação"), que já traz seu próprio cabeçalho de Sheet.
 * `actions`/`candidates` já vêm filtrados por analysisId por quem chama
 * (ver page.tsx) — cada análise só mostra as próprias ações e recomendações.
 */
export function ActionPlanBody({
  analysisId,
  actions,
  candidates,
  atLimit,
}: {
  analysisId: string;
  actions: ActionPreviewRow[];
  candidates: RecommendationCandidateRow[];
  atLimit: boolean;
}) {
  const currentPath = `/app/analise-perfil/${analysisId}`;

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-xs font-medium uppercase text-muted-foreground">Suas ações</p>
        {actions.length > 0 ? (
          <ul className="space-y-2">
            {actions.map((a) => {
              const StatusIcon = ACTION_STATUS_ICON[a.status] ?? Circle;
              const nextLabel = ACTION_ADVANCE_LABELS[a.status];
              return (
                <li
                  key={a.id}
                  className="flex flex-col gap-3 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-2.5">
                    <StatusIcon
                      className={cn("mt-0.5 size-4 shrink-0", ACTION_STATUS_TONE[a.status] ?? "text-muted-foreground")}
                      aria-hidden
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.title}</p>
                      {a.suggestedAction ? <p className="mt-0.5 text-sm text-muted-foreground">{a.suggestedAction}</p> : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 pl-6 sm:pl-0">
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {ACTION_STATUS_LABELS[a.status] ?? a.status}
                    </span>
                    {nextLabel ? (
                      <form action={advanceActionStatusAction}>
                        <input type="hidden" name="actionId" value={a.id} />
                        <input type="hidden" name="currentPath" value={currentPath} />
                        <SubmitButton size="sm" variant="secondary">
                          {nextLabel}
                        </SubmitButton>
                      </form>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Converta uma recomendação em ação para começar a acompanhar sua evolução aqui.
          </p>
        )}
      </div>

      {candidates.length > 0 ? (
        <div>
          <p className="mb-3 text-xs font-medium uppercase text-muted-foreground">Recomendações disponíveis para conversão</p>
          <ul className="space-y-2">
            {candidates.map((r) => (
              <li key={r.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{r.title}</p>
                  <Badge variant="outline" className="shrink-0">
                    {RECOMMENDATION_CATEGORY_LABELS[r.category] ?? r.category}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.problem}</p>
                <form action={convertRecommendationToActionAction} className="mt-2">
                  <input type="hidden" name="recommendationId" value={r.id} />
                  <input type="hidden" name="redirectTo" value={currentPath} />
                  <SubmitButton size="sm" disabled={atLimit}>
                    Converter em ação
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
          {atLimit ? (
            <p className="mt-2 text-xs text-destructive">
              Você já tem {ACTIONS_CONFIG.maximum} ações ativas. Conclua uma para converter outra recomendação.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * §11 — a lista completa de ações e recomendações disponíveis para conversão desta
 * análise fica embutida diretamente nesta aba, sem link para /app/acoes. Reaproveita
 * as mesmas server actions já usadas naquela página (convertRecommendationToActionAction,
 * advanceActionStatusAction) — nenhuma lógica nova de negócio, só nova superfície de UI.
 */
export function ActionPlanPreview(props: { analysisId: string; actions: ActionPreviewRow[]; candidates: RecommendationCandidateRow[]; atLimit: boolean }) {
  return (
    <Card id="plano-evolucao">
      <CardHeader>
        <CardTitle>Plano de evolução</CardTitle>
      </CardHeader>
      <CardContent>
        <ActionPlanBody {...props} />
      </CardContent>
    </Card>
  );
}
