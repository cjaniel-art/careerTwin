import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { logoutAction } from "@/features/auth/actions";
import { IAO_BAND_LABELS, IPP_BAND_LABELS, RECOMMENDATION_LABELS } from "@/lib/result-labels";

export const metadata = { title: "Histórico — CareerTwin" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  queued: "Na fila",
  processing: "Em processamento",
  preliminary: "Preliminar",
  completed: "Concluída",
  insufficient_data: "Dados insuficientes",
  failed_retryable: "Falha — pode tentar novamente",
  failed_final: "Falha",
  cancelled: "Cancelada",
};

export default async function HistoryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/historico");

  const { data: analyses } = await supabase
    .from("analyses")
    .select(
      `id, analysis_type, status, created_at, completed_at,
       profile_analysis_results(ipp_display_score, ipp_band),
       fit_analysis_results(iao_display_score, iao_band, recommendation_type),
       opportunity_versions(title, company)`,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/app/dashboard">
          <Wordmark />
        </Link>
        <form action={logoutAction}>
          <Button type="submit" variant="tertiary" size="sm">
            Sair
          </Button>
        </form>
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Histórico de análises</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Todas as suas análises de perfil e diagnósticos de aderência, mais recentes primeiro. Análises
        concluídas são imutáveis.
      </p>

      <div className="mt-6 space-y-3">
        {analyses && analyses.length > 0 ? (
          analyses.map((a) => {
            const profileResult = Array.isArray(a.profile_analysis_results)
              ? a.profile_analysis_results[0]
              : a.profile_analysis_results;
            const fitResult = Array.isArray(a.fit_analysis_results) ? a.fit_analysis_results[0] : a.fit_analysis_results;
            const opportunity = Array.isArray(a.opportunity_versions) ? a.opportunity_versions[0] : a.opportunity_versions;

            const isProfile = a.analysis_type === "profile_analysis";
            const href = isProfile ? `/app/analise-perfil/${a.id}` : `/app/aderencia/${a.id}`;
            const title = isProfile
              ? "Análise de Perfil"
              : opportunity?.title
                ? `Vaga: ${opportunity.title}${opportunity.company ? ` — ${opportunity.company}` : ""}`
                : "Diagnóstico de Aderência";

            return (
              <Card key={a.id}>
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}{" "}
                      · {STATUS_LABELS[a.status] ?? a.status}
                      {a.status === "completed" && isProfile && profileResult
                        ? ` · IPP ${profileResult.ipp_display_score} — ${IPP_BAND_LABELS[profileResult.ipp_band]}`
                        : null}
                      {a.status === "completed" && !isProfile && fitResult
                        ? ` · IAO ${fitResult.iao_display_score} — ${IAO_BAND_LABELS[fitResult.iao_band]} — ${
                            RECOMMENDATION_LABELS[fitResult.recommendation_type] ?? fitResult.recommendation_type
                          }`
                        : null}
                    </p>
                  </div>
                  {a.status === "completed" ? (
                    <Button asChild size="sm" variant="secondary">
                      <Link href={href}>Ver resultado</Link>
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma análise ainda.</p>
        )}
      </div>
    </main>
  );
}
