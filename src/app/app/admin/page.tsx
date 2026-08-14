import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { isAdminEmail } from "@/lib/admin";
import { getExecutiveDashboardMetrics } from "@/infrastructure/database/admin-metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Dashboard executivo — CareerTwin" };
export const dynamic = "force-dynamic";

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

function StatCard({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function BreakdownList({ counts, labels }: { counts: Record<string, number>; labels: Record<string, string> }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">Sem dados ainda.</p>;
  return (
    <ul className="space-y-2">
      {entries.map(([key, count]) => (
        <li key={key} className="flex items-center justify-between text-sm">
          <span className="text-foreground">{labels[key] ?? key}</span>
          <span className="font-medium text-foreground">{count}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function AdminExecutiveDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/admin");
  if (!isAdminEmail(user.email)) redirect("/app/dashboard");

  const metrics = await getExecutiveDashboardMetrics();

  return (
    <main className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard executivo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dados agregados do banco operacional — não usa eventos de analytics como fonte (ver Analytics §2).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Usuários" value={metrics.users.total} />
        <StatCard label="Novos usuários (7 dias)" value={metrics.users.newLast7Days} />
        <StatCard label="Novos usuários (30 dias)" value={metrics.users.newLast30Days} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ativação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatCard label="Análises de Perfil concluídas" value={metrics.activation.profileAnalysesCompleted} />
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Por etapa do onboarding</p>
              <BreakdownList counts={metrics.activation.byOnboardingStatus} labels={ONBOARDING_STATUS_LABELS} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Retenção</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <StatCard label="Ativos (7 dias)" value={metrics.retention.activeLast7Days} />
            <StatCard label="Ativos (30 dias)" value={metrics.retention.activeLast30Days} />
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Intenção de compra</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList counts={metrics.purchaseIntent.byStatus} labels={PURCHASE_INTENT_STATUS_LABELS} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Falhas críticas (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList counts={metrics.failures.last30DaysByType} labels={ANALYSIS_TYPE_LABELS} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
