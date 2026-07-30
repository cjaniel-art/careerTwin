import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { logoutAction } from "@/features/auth/actions";

export const metadata = { title: "Diagnóstico de Aderência — CareerTwin" };
export const dynamic = "force-dynamic";

export default async function FitDiagnosisEntryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/aderencia");

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

      <h1 className="mb-2 text-2xl font-semibold text-foreground">Diagnóstico de Aderência</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Compare seu perfil confirmado com um cargo-alvo ou uma vaga específica.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Analisar cargo-alvo</CardTitle>
            <CardDescription>
              Compara seu perfil com expectativas de referência associadas ao cargo desejado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" size="sm">
              <Link href="/app/aderencia/cargo">Continuar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Analisar uma vaga específica</CardTitle>
            <CardDescription>Cole a descrição de uma vaga para identificar requisitos, lacunas e riscos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm">
              <Link href="/app/aderencia/vaga/nova">Continuar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
