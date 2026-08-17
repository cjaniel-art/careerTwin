import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExecutiveDashboardMetrics } from "@/infrastructure/database/admin-metrics";
import { StatCard, BreakdownChart, InteractiveBarChart } from "./admin-ui";
import { buildSeriesConfig } from "./chart-config";
import { UsersChart } from "./users-chart";

const ONBOARDING_STATUS_LABELS: Record<string, string> = {
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  profile_review: "Revisão do perfil",
  target_context_pending: "Contexto-alvo pendente",
  completed: "Concluído",
};

const PURCHASE_INTENT_STATUS_LABELS: Record<string, string> = {
  viewed: "Visualizou",
  clicked: "Clicou",
  confirmed_intent: "Confirmou interesse",
  dismissed: "Dispensou",
};

const ANALYSIS_TYPE_LABELS: Record<string, string> = {
  profile_analysis: "Análise de Perfil",
  target_role_analysis: "Análise por cargo-alvo",
  job_analysis: "Aderência à vaga",
};

const purchaseIntentConfig = buildSeriesConfig(Object.keys(PURCHASE_INTENT_STATUS_LABELS), PURCHASE_INTENT_STATUS_LABELS);
const failuresConfig = buildSeriesConfig(Object.keys(ANALYSIS_TYPE_LABELS), ANALYSIS_TYPE_LABELS);

export function ExecutiveTab({ metrics, periodLabel }: { metrics: ExecutiveDashboardMetrics; periodLabel: string }) {
  return (
    <div className="flex flex-col gap-6">
      <UsersChart data={metrics.users.daily} periodLabel={periodLabel} total={metrics.users.total} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ativação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatCard label="Análises de Perfil concluídas" value={metrics.activation.profileAnalysesCompleted} />
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Por etapa do onboarding</p>
              <BreakdownChart counts={metrics.activation.byOnboardingStatus} labels={ONBOARDING_STATUS_LABELS} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Retenção</CardTitle>
          </CardHeader>
          <CardContent>
            <StatCard label="Ativos no período" value={metrics.retention.activeInPeriod} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Geração de valor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Análises concluídas" value={metrics.value.analysesCompleted} />
            <StatCard
              label="Análises úteis"
              value={metrics.value.usefulAnalyses}
              hint={`de ${metrics.value.analysesWithFeedback} com feedback (nota ≥ 4)`}
            />
            <StatCard label="Recomendações selecionadas" value={metrics.value.recommendationsSelected} />
            <StatCard label="Ações em andamento / concluídas" value={`${metrics.value.actionsStarted} / ${metrics.value.actionsCompleted}`} />
          </div>
          <p className="text-xs text-muted-foreground">
            Taxa de Análise Acionável não é calculada — Analytics §14 marca a janela de observação como decisão
            pendente (nenhuma janela deve ser definida silenciosamente).
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InteractiveBarChart title="Intenção de compra" data={metrics.purchaseIntent.series} config={purchaseIntentConfig} />
        <InteractiveBarChart title="Falhas críticas" data={metrics.failures.series} config={failuresConfig} />
      </div>
    </div>
  );
}
