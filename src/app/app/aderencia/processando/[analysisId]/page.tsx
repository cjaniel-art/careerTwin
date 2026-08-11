import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { runJobAnalysis } from "@/features/core-2/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Processando diagnóstico — CareerTwin" };
export const dynamic = "force-dynamic";
// Same synchronous P-009 call as createAndRunJobAnalysisAction — see the maxDuration
// comment on /app/aderencia/page.tsx for why this is a stopgap, not a fix.
export const maxDuration = 300;

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

  if (analysis.status === "processing") {
    const result = await runJobAnalysis(analysisId);
    if (result.ok) redirect(`/app/aderencia/${analysisId}`);
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
