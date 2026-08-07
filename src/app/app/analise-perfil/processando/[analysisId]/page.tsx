import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { runProfileAnalysisStage } from "@/features/core-1/actions";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Processando análise — CareerTwin" };
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function ProfileAnalysisProcessingPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/app/analise-perfil/processando/${analysisId}`);

  const { data: analysis } = await supabase
    .from("analyses")
    .select("id, status")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!analysis) redirect("/app/analise-perfil");
  if (analysis.status === "completed") redirect(`/app/analise-perfil/${analysisId}`);

  // "preliminary" = stage 1 (dimensions) done, stage 2 (recommendations)
  // still pending. runProfileAnalysisStage no longer runs the AI call itself —
  // it dispatches the core1-analysis Supabase Edge Function (which has a
  // longer wall-clock budget than Vercel's 60s) and returns right away, so
  // this render can't redirect straight back to itself: with nothing left to
  // wait on, that would fire dozens of redirects per second and hit the
  // browser's redirect-loop guard long before the edge function finishes. A
  // meta-refresh instead gives each poll a real few-second gap.
  if (analysis.status === "processing" || analysis.status === "preliminary") {
    const result = await runProfileAnalysisStage(analysisId);
    if (result.ok && result.done) redirect(`/app/analise-perfil/${analysisId}`);
    if (result.ok) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
          {/* Next.js hoists <meta>/<title>/<link> rendered anywhere in the tree into <head>. */}
          <meta httpEquiv="refresh" content={`3;url=/app/analise-perfil/processando/${analysisId}`} />
          <Card className="max-w-md">
            <CardContent className="space-y-4 pt-6">
              <h1 className="text-lg font-semibold text-foreground">Preparando sua Análise de Perfil</h1>
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
            Tente novamente. Nenhum crédito foi consumido.
          </p>
          <Button asChild>
            <Link href="/app/analise-perfil">Voltar</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
