import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TechnicalDashboardMetrics } from "@/infrastructure/database/admin-metrics";
import { StatCard, BreakdownChart } from "./admin-ui";

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

export function TechnicalTab({ metrics }: { metrics: TechnicalDashboardMetrics }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard label="Jobs travados (processando há mais de 15 min)" value={metrics.stuckJobs} />
        <StatCard label="Exclusões de conta pendentes" value={metrics.pendingAccountDeletions} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jobs por status (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownChart counts={metrics.jobsByStatus30Days} labels={JOB_STATUS_LABELS} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jobs com falha, por categoria (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownChart counts={metrics.failedJobsByErrorCategory30Days} labels={ERROR_CATEGORY_LABELS} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Problemas de documento (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <BreakdownChart counts={metrics.documentIssues30Days} labels={DOCUMENT_ISSUE_LABELS} />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Disponibilidade, latência, fila em tempo real e custo por token exigem observabilidade dedicada
        (Analytics §16: este deveria ser o &ldquo;Dashboard técnico&rdquo; alimentado por ela, não pelo banco operacional) —
        ainda não existe no projeto, então não é estimado aqui.
      </p>
    </div>
  );
}
