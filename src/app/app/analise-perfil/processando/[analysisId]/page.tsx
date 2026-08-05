import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { runProfileAnalysis } from "@/features/core-1/actions";
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

  if (analysis.status === "processing") {
    const result = await runProfileAnalysis(analysisId);
    if (result.ok) redirect(`/app/analise-perfil/${analysisId}`);
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
