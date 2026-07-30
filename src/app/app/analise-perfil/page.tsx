import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { checkCore1Preconditions, startProfileAnalysisAction } from "@/features/core-1/actions";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutAction } from "@/features/auth/actions";

export const metadata = { title: "Análise de Perfil — CareerTwin" };
export const dynamic = "force-dynamic";

export default async function ProfileAnalysisEntryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/analise-perfil");

  const preconditions = await checkCore1Preconditions();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
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
          <CardTitle>Análise de Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Vamos analisar como seu perfil confirmado está sendo comunicado: forças, lacunas observáveis e
            recomendações priorizadas. O resultado não representa probabilidade de contratação.
          </p>

          {!preconditions.ok ? (
            <div className="rounded-md bg-secondary p-4 text-sm text-foreground">
              <p className="font-medium">Antes de continuar, você precisa concluir:</p>
              <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                {preconditions.missing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {!preconditions.missing.includes("conta em processo de exclusão") ? (
                <Button asChild size="sm" className="mt-4">
                  <Link href="/onboarding">Continuar onboarding</Link>
                </Button>
              ) : null}
            </div>
          ) : (
            <form action={startProfileAnalysisAction}>
              <Button type="submit">Iniciar Análise de Perfil</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
