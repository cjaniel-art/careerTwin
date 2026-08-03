import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { Wordmark } from "@/components/wordmark";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutAction } from "@/features/auth/actions";
import { advanceActionStatusAction, convertRecommendationToActionAction } from "@/features/actions/actions";
import { ACTIONS_CONFIG } from "@/config/engine/actions";

export const metadata = { title: "Plano de ações — CareerTwin" };
export const dynamic = "force-dynamic";

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

export default async function ActionsPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/acoes");

  const [{ data: actions }, { data: candidates }] = await Promise.all([
    supabase
      .from("actions")
      .select("id, status, user_notes, created_at, recommendations(title, problem, suggested_action, category)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("recommendations")
      .select("id, title, problem, suggested_action, category, priority_order, status, analysis_id")
      .in("status", ["generated", "highlighted"])
      .order("priority_order", { ascending: true }),
  ]);

  const activeActions = (actions ?? []).filter((a) => a.status !== "completed");
  const completedActions = (actions ?? []).filter((a) => a.status === "completed");
  const atLimit = activeActions.length >= ACTIONS_CONFIG.maximum;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/app/dashboard">
          <Wordmark />
        </Link>
        <form action={logoutAction}>
          <SubmitButton variant="tertiary" size="sm">
            Sair
          </SubmitButton>
        </form>
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Plano de ações</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Até {ACTIONS_CONFIG.maximum} ações simultâneas. Selecionar, iniciar ou concluir uma ação não altera o
        score já calculado — para atualizar o resultado, faça uma nova análise.
      </p>

      {erro === "limite-acoes" ? (
        <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          Você já tem {ACTIONS_CONFIG.maximum} ações ativas. Conclua ou aguarde antes de adicionar outra.
        </p>
      ) : null}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Suas ações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeActions.length > 0 ? (
            activeActions.map((a) => {
              const rec = Array.isArray(a.recommendations) ? a.recommendations[0] : a.recommendations;
              const nextLabel = ACTION_ADVANCE_LABELS[a.status];
              return (
                <div key={a.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{rec?.title}</p>
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {ACTION_STATUS_LABELS[a.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{rec?.suggested_action}</p>
                  {nextLabel ? (
                    <form action={advanceActionStatusAction} className="mt-2">
                      <input type="hidden" name="actionId" value={a.id} />
                      <SubmitButton size="sm" variant="secondary">
                        {nextLabel}
                      </SubmitButton>
                    </form>
                  ) : null}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma ação ativa ainda.</p>
          )}
        </CardContent>
      </Card>

      {candidates && candidates.length > 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Recomendações disponíveis para conversão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {candidates.map((r) => (
              <div key={r.id} className="rounded-md border border-border p-3">
                <p className="text-sm font-medium text-foreground">{r.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{r.problem}</p>
                <form action={convertRecommendationToActionAction} className="mt-2">
                  <input type="hidden" name="recommendationId" value={r.id} />
                  <input type="hidden" name="redirectTo" value="/app/acoes" />
                  <SubmitButton size="sm" disabled={atLimit}>
                    Converter em ação
                  </SubmitButton>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {completedActions.length > 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Concluídas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedActions.map((a) => {
              const rec = Array.isArray(a.recommendations) ? a.recommendations[0] : a.recommendations;
              return (
                <p key={a.id} className="text-sm text-muted-foreground line-through">
                  {rec?.title}
                </p>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}
