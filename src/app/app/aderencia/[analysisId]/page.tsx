import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { Wordmark } from "@/components/wordmark";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutAction } from "@/features/auth/actions";
import { IAO_BAND_LABELS, MATCH_LABELS, RECOMMENDATION_LABELS } from "@/lib/result-labels";
import { FeedbackForm } from "@/features/feedback/feedback-form";

export const metadata = { title: "Resultado — Diagnóstico de Aderência — CareerTwin" };
export const dynamic = "force-dynamic";

export default async function JobAnalysisResultPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/app/aderencia/${analysisId}`);

  const { data: analysis } = await supabase
    .from("analyses")
    .select("id, status, confidence_band")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!analysis) redirect("/app/aderencia");
  if (analysis.status !== "completed") redirect(`/app/aderencia/processando/${analysisId}`);

  const [{ data: result }, { data: assessments }, { data: limits }, { data: feedback }] = await Promise.all([
    supabase.from("fit_analysis_results").select("*").eq("analysis_id", analysisId).single(),
    supabase
      .from("requirement_assessments")
      .select("requirement_id, match_status, reasoning, gap_type, requirements(description, criticality)")
      .eq("analysis_id", analysisId),
    supabase.from("analysis_limits").select("limit_type, reason").eq("analysis_id", analysisId),
    supabase
      .from("analysis_feedback")
      .select("usefulness_score, specificity, application_intent, comment")
      .eq("analysis_id", analysisId)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

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

      <Card>
        <CardHeader>
          <CardTitle>Resumo executivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">IAO</p>
              <p className="text-3xl font-bold text-foreground">{result?.iao_display_score}</p>
              <p className="text-sm text-muted-foreground">{IAO_BAND_LABELS[result?.iao_band ?? ""]}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Confiança</p>
              <p className="text-3xl font-bold text-foreground">
                {analysis.confidence_band === "high" ? "Alta" : analysis.confidence_band === "medium" ? "Média" : "Baixa"}
              </p>
            </div>
          </div>
          <div className="rounded-md bg-secondary p-3">
            <p className="text-sm font-semibold text-foreground">
              {RECOMMENDATION_LABELS[result?.recommendation_type ?? ""] ?? result?.recommendation_type}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{result?.recommendation_reasoning}</p>
          </div>
          {limits && limits.length > 0 ? (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              Limite de segurança aplicado: {limits.map((l) => l.reason).join("; ")}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            O IAO representa a correspondência observável entre seu perfil confirmado e os requisitos
            analisados. Ele não representa probabilidade de entrevista, aprovação ou contratação.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Requisitos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assessments?.map((a) => {
            const requirement = Array.isArray(a.requirements) ? a.requirements[0] : a.requirements;
            return (
              <div key={a.requirement_id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{requirement?.description}</p>
                  <span className="text-xs text-muted-foreground">{MATCH_LABELS[a.match_status] ?? a.match_status}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.reasoning}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Seu feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <FeedbackForm
            analysisId={analysisId}
            redirectTo={`/app/aderencia/${analysisId}`}
            showApplicationIntent
            existing={feedback ?? null}
          />
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Esta análise não representa probabilidade de entrevista, aprovação ou contratação. A decisão final é
        sempre sua.
      </p>
    </main>
  );
}
