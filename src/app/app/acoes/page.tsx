import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  advanceActionStatusAction,
  convertCore2ActionCandidateToActionAction,
  convertRecommendationToActionAction,
} from "@/features/actions/actions";
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

  const [{ data: actions }, { data: candidates }, { data: core2Candidates }] = await Promise.all([
    supabase
      .from("actions")
      .select(
        "id, status, user_notes, created_at, recommendations(title, problem, suggested_action, category), core2_action_candidates(title, reasoning, suggested_action)",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("recommendations")
      .select("id, title, problem, suggested_action, category, priority_order, status, analysis_id")
      .in("status", ["generated", "highlighted"])
      .order("priority_order", { ascending: true }),
    supabase
      .from("core2_action_candidates")
      .select("id, title, reasoning, suggested_action, horizon, analysis_id")
      .eq("status", "generated")
      .order("created_at", { ascending: false }),
  ]);

  const activeActions = (actions ?? []).filter((a) => a.status !== "completed");
  const completedActions = (actions ?? []).filter((a) => a.status === "completed");
  const atLimit = activeActions.length >= ACTIONS_CONFIG.maximum;

  // Cada `actions` row vem de uma origem só (recommendation_id XOR
  // core2_action_candidate_id — ver 20260101000030_core2_action_candidates.sql),
  // então só um dos dois embeds abaixo vem preenchido por linha.
  function titleAndAction(a: { recommendations: unknown; core2_action_candidates: unknown }) {
    const rec = Array.isArray(a.recommendations) ? a.recommendations[0] : a.recommendations;
    const candidate = Array.isArray(a.core2_action_candidates) ? a.core2_action_candidates[0] : a.core2_action_candidates;
    const source = (rec ?? candidate) as { title?: string; suggested_action?: string } | null;
    return { title: source?.title ?? "", suggestedAction: source?.suggested_action ?? "" };
  }

  const conversionCandidates = [
    ...(candidates ?? []).map((r) => ({ origin: "core1" as const, id: r.id, title: r.title, description: r.problem })),
    ...(core2Candidates ?? []).map((c) => ({ origin: "core2" as const, id: c.id, title: c.title, description: c.reasoning })),
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
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
              const { title, suggestedAction } = titleAndAction(a);
              const nextLabel = ACTION_ADVANCE_LABELS[a.status];
              return (
                <div key={a.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {ACTION_STATUS_LABELS[a.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{suggestedAction}</p>
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

      {conversionCandidates.length > 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Recomendações disponíveis para conversão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {conversionCandidates.map((c) => (
              <div key={`${c.origin}-${c.id}`} className="rounded-md border border-border p-3">
                <p className="text-sm font-medium text-foreground">{c.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                <form
                  action={c.origin === "core1" ? convertRecommendationToActionAction : convertCore2ActionCandidateToActionAction}
                  className="mt-2"
                >
                  <input type="hidden" name={c.origin === "core1" ? "recommendationId" : "actionCandidateId"} value={c.id} />
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
              const { title } = titleAndAction(a);
              return (
                <p key={a.id} className="text-sm text-muted-foreground line-through">
                  {title}
                </p>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}
