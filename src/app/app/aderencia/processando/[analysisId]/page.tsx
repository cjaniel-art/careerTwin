import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { runJobAnalysisStage } from "@/features/core-2/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Processando diagnóstico — CareerTwin" };
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function JobAnalysisProcessingPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/app/aderencia/processando/${analysisId}`);

  const { data: analysis } = await supabase
    .from("analyses")
    .select("id, status")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!analysis) redirect("/app/aderencia");
  if (analysis.status === "completed") redirect(`/app/aderencia/${analysisId}`);

  // runJobAnalysisStage no longer runs the AI call itself — it dispatches the
  // core2-analysis Supabase Edge Function (which has a longer wall-clock
  // budget than Vercel's function ceiling) and returns right away, so this
  // render can't redirect straight back to itself: with nothing left to wait
  // on, that would fire dozens of redirects per second and hit the browser's
  // redirect-loop guard long before the edge function finishes. A meta-refresh
  // instead gives each poll a real few-second gap — mirrors
  // /app/analise-perfil/processando/[analysisId].
  if (analysis.status === "processing") {
    const result = await runJobAnalysisStage(analysisId);
    if (result.ok && result.done) redirect(`/app/aderencia/${analysisId}`);
    if (result.ok) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
          {/* Next.js hoists <meta>/<title>/<link> rendered anywhere in the tree into <head>. */}
          <meta httpEquiv="refresh" content={`3;url=/app/aderencia/processando/${analysisId}`} />
          <Card className="max-w-md">
            <CardContent className="space-y-4 pt-6">
              <h1 className="text-lg font-semibold text-foreground">Preparando seu Diagnóstico de Aderência</h1>
              <p className="text-sm text-muted-foreground">Isso pode levar alguns minutos. Esta página atualiza sozinha.</p>
            </CardContent>
          </Card>
        </main>
      );
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Card className="max-w-md">
        <CardContent className="space-y-4 pt-6">
          <h1 className="text-lg font-semibold text-foreground">Não foi possível concluir a análise agora</h1>
          <p className="text-sm text-muted-foreground">
            {analysis.status === "insufficient_data"
              ? "Não há requisitos suficientes para gerar um diagnóstico confiável."
              : "Tente novamente. Se um crédito havia sido reservado, ele foi restaurado."}
          </p>
          <Button asChild>
            <Link href="/app/aderencia">Voltar</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
