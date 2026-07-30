import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { logoutAction } from "@/features/auth/actions";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Dashboard — CareerTwin" };
export const dynamic = "force-dynamic";

/**
 * Partial — reads real aggregated state (credits, last Core 1 analysis)
 * without recalculating anything client-side (Sitemap §4). Histórico
 * completo, contexto-alvo, ações pendentes e Core 2 ainda não implementados
 * nesta sessão — ver relatório final.
 */
export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/dashboard");

  const [{ data: creditAccount }, { data: lastAnalysis }] = await Promise.all([
    supabase.from("credit_accounts").select("available_credits").eq("user_id", user.id).single(),
    supabase
      .from("analyses")
      .select("id, status, created_at, profile_analysis_results(ipp_display_score, ipp_band)")
      .eq("user_id", user.id)
      .eq("analysis_type", "profile_analysis")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <main className="mx-auto max-w-content px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Wordmark />
        <form action={logoutAction}>
          <Button type="submit" variant="secondary" size="sm">
            Sair
          </Button>
        </form>
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Olá, {user.email}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Histórico completo, contexto-alvo, ações pendentes e Diagnóstico de Aderência ainda não foram
        implementados nesta sessão.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Créditos disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{creditAccount?.available_credits ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Análise de Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lastAnalysis?.status === "completed" ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Última análise: IPP {lastAnalysis.profile_analysis_results?.[0]?.ipp_display_score}
                </p>
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/app/analise-perfil/${lastAnalysis.id}`}>Ver resultado</Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Você ainda não fez sua Análise de Perfil.</p>
                <Button asChild size="sm">
                  <Link href="/app/analise-perfil">Fazer Análise de Perfil</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
