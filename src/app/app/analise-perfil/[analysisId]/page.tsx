import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutAction } from "@/features/auth/actions";
import { CONFIDENCE_LABELS, DIMENSION_LABELS, IPP_BAND_LABELS } from "@/lib/result-labels";
import { convertRecommendationToActionAction } from "@/features/actions/actions";

export const metadata = { title: "Resultado — Análise de Perfil — CareerTwin" };
export const dynamic = "force-dynamic";

export default async function ProfileAnalysisResultPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/app/analise-perfil/${analysisId}`);

  const { data: analysis } = await supabase
    .from("analyses")
    .select("id, status, confidence_band, created_at")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!analysis) redirect("/app/analise-perfil");
  if (analysis.status !== "completed") redirect(`/app/analise-perfil/processando/${analysisId}`);

  const [{ data: result }, { data: dimensions }, { data: recommendations }] = await Promise.all([
    supabase.from("profile_analysis_results").select("*").eq("analysis_id", analysisId).single(),
    supabase
      .from("profile_dimension_results")
      .select("dimension, rubric_level, dimension_score, reasoning")
      .eq("analysis_id", analysisId),
    supabase
      .from("recommendations")
      .select("id, recommendation_key, category, title, problem, suggested_action, reasoning, priority_order, status")
      .eq("analysis_id", analysisId)
      .order("priority_order", { ascending: true }),
  ]);

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

      <Card>
        <CardHeader>
          <CardTitle>Resumo executivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">IPP</p>
              <p className="text-3xl font-bold text-foreground">{result?.ipp_display_score}</p>
              <p className="text-sm text-muted-foreground">{IPP_BAND_LABELS[result?.ipp_band ?? ""]}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Confiança</p>
              <p className="text-3xl font-bold text-foreground">
                {CONFIDENCE_LABELS[analysis.confidence_band ?? ""] ?? "—"}
              </p>
            </div>
          </div>
          <p className="rounded-md bg-secondary p-3 text-sm text-foreground">{result?.diagnosis}</p>
          <p className="text-xs text-muted-foreground">
            O IPP mede a prontidão observável do seu perfil para comunicar sua trajetória. Ele não representa
            probabilidade de entrevista, aprovação ou contratação, nem o seu valor profissional.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Principal força e principal lacuna</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Força</p>
            <p className="text-sm text-foreground">{result?.main_strength}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Lacuna</p>
            <p className="text-sm text-foreground">{result?.main_gap}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Dimensões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dimensions?.map((d) => (
            <div key={d.dimension} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{DIMENSION_LABELS[d.dimension] ?? d.dimension}</p>
                <span className="text-sm text-muted-foreground">
                  Nível {d.rubric_level}/4 · {Math.round(d.dimension_score)}/100
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{d.reasoning}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recomendações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations && recommendations.length > 0 ? (
            recommendations.map((r) => (
              <div key={r.recommendation_key} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{r.title}</p>
                  {r.status === "highlighted" ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Destaque
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.problem}</p>
                <p className="mt-1 text-sm text-foreground">
                  <strong>Ação sugerida:</strong> {r.suggested_action}
                </p>
                {r.status === "generated" || r.status === "highlighted" ? (
                  <form action={convertRecommendationToActionAction} className="mt-2">
                    <input type="hidden" name="recommendationId" value={r.id} />
                    <input type="hidden" name="redirectTo" value={`/app/analise-perfil/${analysisId}`} />
                    <Button type="submit" size="sm" variant="secondary">
                      Converter em ação
                    </Button>
                  </form>
                ) : r.status === "converted_to_action" ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Já está no seu <Link href="/app/acoes" className="underline">plano de ações</Link>.
                  </p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma recomendação gerada nesta análise.</p>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Esta análise não representa probabilidade de entrevista, aprovação ou contratação.
      </p>
    </main>
  );
}
