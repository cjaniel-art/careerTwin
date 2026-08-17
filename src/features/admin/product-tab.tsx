import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductDashboardMetrics } from "@/infrastructure/database/admin-metrics";
import type { ChartConfig } from "@/components/ui/chart";
import { StatCard, BreakdownChart, MultiBarChart } from "./admin-ui";

const ANALYSIS_TYPE_LABELS: Record<string, string> = {
  profile_analysis: "Análise de Perfil",
  target_role_analysis: "Análise por cargo-alvo",
  job_analysis: "Aderência à vaga",
};

const ANALYSES_BY_TYPE_CHART_CONFIG = {
  completed: { label: "Concluídas", color: "hsl(var(--primary))" },
  failed: { label: "Falhou", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

const SPECIFICITY_LABELS: Record<string, string> = {
  yes: "Sim",
  partially: "Parcialmente",
  no: "Não",
};

const CONFIDENCE_LABELS: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const USEFULNESS_LABELS: Record<string, string> = { "1": "1", "2": "2", "3": "3", "4": "4", "5": "5" };

export function ProductTab({ metrics }: { metrics: ProductDashboardMetrics }) {
  const analysesByTypeData = Object.keys(ANALYSIS_TYPE_LABELS)
    .map((type) => ({
      label: ANALYSIS_TYPE_LABELS[type]!,
      completed: metrics.completedByType[type] ?? 0,
      failed: metrics.failedByType[type] ?? 0,
    }))
    .filter((row) => row.completed > 0 || row.failed > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          label="Utilidade média"
          value={metrics.usefulnessAverage !== null ? metrics.usefulnessAverage.toFixed(1) : "—"}
          hint={`de ${metrics.feedbackCount} feedback(s)`}
        />
        <StatCard label="Recomendações selecionadas" value={metrics.recommendationsSelected} />
        <StatCard label="Ações em andamento" value={metrics.actionsStarted} />
        <StatCard label="Ações concluídas" value={metrics.actionsCompleted} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Análises concluídas por tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiBarChart data={analysesByTypeData} config={ANALYSES_BY_TYPE_CHART_CONFIG} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Utilidade (nota 1-5)</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownChart counts={metrics.usefulnessDistribution} labels={USEFULNESS_LABELS} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Especificidade percebida</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownChart counts={metrics.specificityDistribution} labels={SPECIFICITY_LABELS} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Confiança agregada</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownChart counts={metrics.confidenceDistribution} labels={CONFIDENCE_LABELS} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
