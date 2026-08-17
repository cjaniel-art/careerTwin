import type { TechnicalDashboardMetrics } from "@/infrastructure/database/admin-metrics";
import { StatCard, InteractiveBarChart, DonutTextChart } from "./admin-ui";
import { buildSeriesConfig } from "./chart-config";

const JOB_STATUS_LABELS: Record<string, string> = {
  queued: "Na fila",
  processing: "Processando",
  completed: "Concluído",
  partially_completed: "Parcialmente concluído",
  failed: "Falhou",
  cancelled: "Cancelado",
  expired: "Expirado",
};

const ERROR_CATEGORY_LABELS: Record<string, string> = {
  validation: "Validação",
  authorization: "Autorização",
  file_processing: "Processamento de arquivo",
  provider_timeout: "Timeout do provedor de IA",
  provider_unavailable: "Provedor de IA indisponível",
  invalid_schema: "Schema inválido",
  invalid_model_output: "Saída do modelo inválida",
  persistence: "Persistência",
  credit: "Crédito",
  retention: "Retenção",
  unknown: "Desconhecido",
};

const DOCUMENT_ISSUE_LABELS: Record<string, string> = {
  insufficient_content: "Conteúdo insuficiente",
  failed_retryable: "Falhou (pode tentar de novo)",
  failed_final: "Falhou (definitivo)",
};

const jobStatusConfig = buildSeriesConfig(Object.keys(JOB_STATUS_LABELS), JOB_STATUS_LABELS);
const errorCategoryConfig = buildSeriesConfig(Object.keys(ERROR_CATEGORY_LABELS), ERROR_CATEGORY_LABELS);
const documentIssueConfig = buildSeriesConfig(Object.keys(DOCUMENT_ISSUE_LABELS), DOCUMENT_ISSUE_LABELS);

export function TechnicalTab({ metrics }: { metrics: TechnicalDashboardMetrics }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard label="Jobs travados (processando há mais de 15 min)" value={metrics.stuckJobs} />
        <StatCard label="Exclusões de conta pendentes" value={metrics.pendingAccountDeletions} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DonutTextChart title="Jobs por status" data={metrics.jobsSeries} config={jobStatusConfig} />
        <DonutTextChart title="Jobs com falha, por categoria" data={metrics.failedJobsSeries} config={errorCategoryConfig} />
      </div>

      <InteractiveBarChart title="Problemas de documento" data={metrics.documentIssuesSeries} config={documentIssueConfig} />

      <p className="text-xs text-muted-foreground">
        Disponibilidade, latência, fila em tempo real e custo por token exigem observabilidade dedicada
        (Analytics §16: este deveria ser o &ldquo;Dashboard técnico&rdquo; alimentado por ela, não pelo banco operacional) —
        ainda não existe no projeto, então não é estimado aqui.
      </p>
    </div>
  );
}
