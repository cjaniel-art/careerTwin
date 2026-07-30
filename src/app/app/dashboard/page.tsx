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
 * Partial — reads real aggregated state (credits, last Core 1/Core 2
 * analyses) without recalculating anything client-side (Sitemap §4).
 * Histórico completo, contexto-alvo e ações pendentes ainda não foram
 * implementados nesta sessão — ver relatório final.
 */
export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/dashboard");

  const [{ data: creditAccount }, { data: lastProfileAnalysis }, { data: lastJobAnalysis }] = await Promise.all([
    supabase.from("credit_accounts").select("available_credits").eq("user_id", user.id).single(),
    supabase
      .from("analyses")
      .select("id, status, profile_analysis_results(ipp_display_score)")
      .eq("user_id", user.id)
      .eq("analysis_type", "profile_analysis")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("analyses")
      .select("id, status, fit_analysis_results(iao_display_score)")
      .eq("user_id", user.id)
      .eq("analysis_type", "job_analysis")
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

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Olá, {user.email}</h1>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="secondary">
            <Link href="/app/historico">Histórico</Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/app/acoes">Ações</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Créditos disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-bold text-foreground">{creditAccount?.available_credits ?? 0}</p>
            <Button asChild size="sm" variant="secondary">
              <Link href="/app/creditos">Ver créditos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Análise de Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lastProfileAnalysis?.status === "completed" ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Última análise: IPP {lastProfileAnalysis.profile_analysis_results?.[0]?.ipp_display_score}
                </p>
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/app/analise-perfil/${lastProfileAnalysis.id}`}>Ver resultado</Link>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Diagnóstico de Aderência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lastJobAnalysis?.status === "completed" ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Última análise: IAO {lastJobAnalysis.fit_analysis_results?.[0]?.iao_display_score}
                </p>
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/app/aderencia/${lastJobAnalysis.id}`}>Ver resultado</Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Você ainda não analisou uma vaga.</p>
                <Button asChild size="sm">
                  <Link href="/app/aderencia">Analisar vaga ou cargo</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
