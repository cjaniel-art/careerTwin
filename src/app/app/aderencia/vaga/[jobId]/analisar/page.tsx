import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { checkJobAnalysisPreconditions, startJobAnalysisAction } from "@/features/core-2/actions";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutAction } from "@/features/auth/actions";

export const metadata = { title: "Iniciar diagnóstico — CareerTwin" };
export const dynamic = "force-dynamic";

export default async function StartJobAnalysisPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId: opportunityId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/app/aderencia/vaga/${opportunityId}/analisar`);

  const preconditions = await checkJobAnalysisPreconditions(opportunityId);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
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
          <CardTitle>Vaga confirmada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {preconditions.existingAnalysisId
              ? "Esta vaga já foi analisada com os dados atuais do seu perfil. Você pode rever o resultado sem consumir um novo crédito."
              : "Estamos prontos para comparar seu perfil com os requisitos desta oportunidade."}
            {!preconditions.existingAnalysisId &&
              (preconditions.hasCredits
                ? " Esta análise consumirá 1 crédito."
                : " Você não possui créditos disponíveis para esta análise.")}
          </p>

          {!preconditions.ok ? (
            <div className="rounded-md bg-secondary p-4 text-sm text-foreground">
              <p className="font-medium">Antes de continuar, você precisa concluir:</p>
              <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                {preconditions.missing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : preconditions.existingAnalysisId ? (
            <Button asChild>
              <Link href={`/app/aderencia/${preconditions.existingAnalysisId}`}>Ver resultado</Link>
            </Button>
          ) : !preconditions.hasCredits ? (
            <Button asChild>
              <Link href="/app/creditos">Ver créditos</Link>
            </Button>
          ) : (
            <form action={startJobAnalysisAction}>
              <input type="hidden" name="opportunityId" value={opportunityId} />
              <SubmitButton>Iniciar Diagnóstico de Aderência</SubmitButton>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
