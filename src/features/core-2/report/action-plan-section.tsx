import { Circle, CheckCircle2, CircleDot, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button";
import { advanceActionStatusAction, convertCore2ActionCandidateToActionAction } from "@/features/actions/actions";
import { ACTIONS_CONFIG } from "@/config/engine/actions";
import { ACTION_HORIZON_LABELS, LIKERT_LABELS } from "@/lib/result-labels";
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

export interface Core2ActionPreviewRow {
  id: string;
  status: string;
  title: string;
  suggestedAction: string;
}

export interface Core2ActionCandidateRow {
  id: string;
  title: string;
  reasoning: string;
  horizon: string;
  impact: number;
  effort: number;
}

/**
 * §7 (Plano de ação) — mesma experiência de "Suas ações" +
 * "disponíveis para conversão" que o ActionPlanBody do Core 1
 * (analise-perfil): ações reais rastreáveis (tabela `actions`, via
 * core2_action_candidate_id) com progressão de status, e os candidatos
 * ainda não convertidos (`core2_action_candidates`) com botão "Converter
 * em ação". Compartilha o mesmo limite global ACTIONS_CONFIG.maximum e a
 * mesma advanceActionStatusAction do Core 1 — nenhuma lógica nova de
 * avanço de status, só uma nova origem para convertX.
 */
export function ActionPlanSection({
  analysisId,
  actions,
  candidates,
  atLimit,
}: {
  analysisId: string;
  actions: Core2ActionPreviewRow[];
  candidates: Core2ActionCandidateRow[];
  atLimit: boolean;
}) {
  const currentPath = `/app/aderencia/${analysisId}`;

  return (
    <Card id="plano-de-acao">
      <CardHeader>
        <CardTitle>Plano de ação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
              Converta uma ação sugerida em ação rastreável para começar a acompanhar sua evolução aqui.
            </p>
          )}
        </div>

        {candidates.length > 0 ? (
          <div>
            <p className="mb-3 text-xs font-medium uppercase text-muted-foreground">Ações sugeridas disponíveis para conversão</p>
            <ul className="space-y-2">
              {candidates.map((c) => (
                <li key={c.id} className="rounded-md border border-border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{ACTION_HORIZON_LABELS[c.horizon] ?? c.horizon}</Badge>
                    <Badge variant="secondary">Impacto {LIKERT_LABELS[c.impact]}</Badge>
                    <Badge variant="secondary">Esforço {LIKERT_LABELS[c.effort]}</Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">{c.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.reasoning}</p>
                  <form action={convertCore2ActionCandidateToActionAction} className="mt-2">
                    <input type="hidden" name="actionCandidateId" value={c.id} />
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
                Você já tem {ACTIONS_CONFIG.maximum} ações ativas. Conclua uma para converter outra sugestão.
              </p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
