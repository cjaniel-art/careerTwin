import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OnboardingDashboardMetrics } from "@/infrastructure/database/admin-metrics";
import { StatCard, BreakdownChart, InteractiveBarChart } from "./admin-ui";
import { buildSeriesConfig } from "./chart-config";

const ONBOARDING_STATUS_LABELS: Record<string, string> = {
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  profile_review: "Revisão do perfil",
  target_context_pending: "Contexto-alvo pendente",
  completed: "Concluído",
};

const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  awaiting_upload: "Aguardando upload",
  uploading: "Enviando",
  validating: "Validando",
  queued: "Na fila",
  processing: "Processando",
  ready: "Pronto",
  insufficient_content: "Conteúdo insuficiente",
  failed_retryable: "Falhou (pode tentar de novo)",
  failed_final: "Falhou (definitivo)",
  deleted: "Excluído",
};

const documentStatusConfig = buildSeriesConfig(Object.keys(DOCUMENT_STATUS_LABELS), DOCUMENT_STATUS_LABELS);

export function OnboardingTab({ metrics }: { metrics: OnboardingDashboardMetrics }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard label="Thin Twin confirmado" value={metrics.thinTwinConfirmed} />
        <StatCard label="Contexto-alvo confirmado" value={metrics.targetContextConfirmed} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversão por etapa do onboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownChart counts={metrics.byOnboardingStatus} labels={ONBOARDING_STATUS_LABELS} />
          </CardContent>
        </Card>

        <InteractiveBarChart title="Documentos por status" data={metrics.documentsSeries} config={documentStatusConfig} />
      </div>

      <p className="text-xs text-muted-foreground">
        Duração por etapa, abandono e retomada exigem os eventos derivados do catálogo de Analytics
        (`onboarding_step_completed`, `onboarding_abandoned`, `onboarding_resumed`), que ainda não são
        persistidos — não estimados aqui.
      </p>
    </div>
  );
}
