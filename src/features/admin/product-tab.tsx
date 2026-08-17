import type { ProductDashboardMetrics } from "@/infrastructure/database/admin-metrics";
import { StatCard, InteractiveBarChart, DonutTextChart } from "./admin-ui";
import { buildSeriesConfig } from "./chart-config";

const ANALYSIS_TYPE_LABELS: Record<string, string> = {
  profile_analysis: "Análise de Perfil",
  target_role_analysis: "Análise por cargo-alvo",
  job_analysis: "Aderência à vaga",
};

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

const analysisTypeConfig = buildSeriesConfig(Object.keys(ANALYSIS_TYPE_LABELS), ANALYSIS_TYPE_LABELS);
const usefulnessConfig = buildSeriesConfig(Object.keys(USEFULNESS_LABELS), USEFULNESS_LABELS);
const specificityConfig = buildSeriesConfig(Object.keys(SPECIFICITY_LABELS), SPECIFICITY_LABELS);
const confidenceConfig = buildSeriesConfig(Object.keys(CONFIDENCE_LABELS), CONFIDENCE_LABELS);

export function ProductTab({ metrics }: { metrics: ProductDashboardMetrics }) {
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

      <InteractiveBarChart title="Análises concluídas por tipo" data={metrics.completedByTypeSeries} config={analysisTypeConfig} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DonutTextChart title="Utilidade (nota 1-5)" data={metrics.usefulnessSeries} config={usefulnessConfig} />
        <DonutTextChart title="Especificidade percebida" data={metrics.specificitySeries} config={specificityConfig} />
        <DonutTextChart title="Confiança agregada" data={metrics.confidenceSeries} config={confidenceConfig} />
      </div>
    </div>
  );
}
