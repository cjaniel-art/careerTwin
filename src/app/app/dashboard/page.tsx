import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IAO_BAND_LABELS, IPP_BAND_LABELS } from "@/lib/result-labels";

export const metadata = { title: "Dashboard — CareerTwin" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  queued: "Na fila",
  processing: "Em processamento",
  preliminary: "Preliminar",
  completed: "Concluída",
  insufficient_data: "Dados insuficientes",
  failed_retryable: "Falha — pode tentar novamente",
  failed_final: "Falha",
  cancelled: "Cancelada",
};

/** Reads real aggregated state (credits, last Core 1/Core 2 analyses, recent history) without recalculating anything client-side (Sitemap §4). */
export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/dashboard");

  const [{ data: creditAccount }, { data: lastProfileAnalysis }, { data: lastJobAnalysis }, { count: completedCount }, { data: recentAnalyses }] =
    await Promise.all([
      supabase.from("credit_accounts").select("available_credits, reserved_credits").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("analyses")
        .select("id, status, profile_analysis_results(ipp_display_score, ipp_band)")
        .eq("user_id", user.id)
        .eq("analysis_type", "profile_analysis")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("analyses")
        .select("id, status, fit_analysis_results(iao_display_score, iao_band)")
        .eq("user_id", user.id)
        .eq("analysis_type", "job_analysis")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("analyses")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("analyses")
        .select(
          `id, analysis_type, status, created_at,
           profile_analysis_results(ipp_display_score, ipp_band),
           fit_analysis_results(iao_display_score, iao_band),
           opportunity_versions(title, company)`,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const profileResult = Array.isArray(lastProfileAnalysis?.profile_analysis_results)
    ? lastProfileAnalysis.profile_analysis_results[0]
    : lastProfileAnalysis?.profile_analysis_results;
  const jobResult = Array.isArray(lastJobAnalysis?.fit_analysis_results)
    ? lastJobAnalysis.fit_analysis_results[0]
    : lastJobAnalysis?.fit_analysis_results;

  return (
    <main className="mx-auto max-w-content px-6 py-12">
      <h1 className="text-2xl font-semibold text-foreground">Olá, {user.email}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Créditos disponíveis</CardDescription>
            <CardTitle className="text-3xl">{creditAccount?.available_credits ?? 0}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {creditAccount?.reserved_credits ? `${creditAccount.reserved_credits} reservado(s)` : "Para novas análises"}
            </p>
            <Button asChild size="sm" variant="secondary">
              <Link href="/app/creditos">Ver</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Análise de Perfil</CardDescription>
            <CardTitle className="text-3xl">
              {lastProfileAnalysis?.status === "completed" ? profileResult?.ipp_display_score : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2">
            {lastProfileAnalysis?.status === "completed" && profileResult ? (
              <Badge variant="secondary">{IPP_BAND_LABELS[profileResult.ipp_band]}</Badge>
            ) : (
              <p className="text-sm text-muted-foreground">Ainda não realizada</p>
            )}
            <Button asChild size="sm" variant="secondary">
              <Link href={lastProfileAnalysis?.status === "completed" ? `/app/analise-perfil/${lastProfileAnalysis.id}` : "/app/analise-perfil"}>
                {lastProfileAnalysis?.status === "completed" ? "Ver" : "Fazer"}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Diagnóstico de Aderência</CardDescription>
            <CardTitle className="text-3xl">
              {lastJobAnalysis?.status === "completed" ? jobResult?.iao_display_score : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2">
            {lastJobAnalysis?.status === "completed" && jobResult ? (
              <Badge variant="secondary">{IAO_BAND_LABELS[jobResult.iao_band]}</Badge>
            ) : (
              <p className="text-sm text-muted-foreground">Ainda não realizado</p>
            )}
            <Button asChild size="sm" variant="secondary">
              <Link href={lastJobAnalysis?.status === "completed" ? `/app/aderencia/${lastJobAnalysis.id}` : "/app/aderencia"}>
                {lastJobAnalysis?.status === "completed" ? "Ver" : "Fazer"}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Análises concluídas</CardDescription>
            <CardTitle className="text-3xl">{completedCount ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No total, desde o início</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Análises recentes</CardTitle>
            <CardDescription>As últimas análises de perfil e diagnósticos de aderência</CardDescription>
          </div>
          <Button asChild size="sm" variant="secondary">
            <Link href="/app/historico">Ver histórico completo</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentAnalyses && recentAnalyses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAnalyses.map((a) => {
                  const isProfile = a.analysis_type === "profile_analysis";
                  const pResult = Array.isArray(a.profile_analysis_results) ? a.profile_analysis_results[0] : a.profile_analysis_results;
                  const fResult = Array.isArray(a.fit_analysis_results) ? a.fit_analysis_results[0] : a.fit_analysis_results;
                  const opportunity = Array.isArray(a.opportunity_versions) ? a.opportunity_versions[0] : a.opportunity_versions;
                  const href = isProfile ? `/app/analise-perfil/${a.id}` : `/app/aderencia/${a.id}`;
                  const title = isProfile
                    ? "Análise de Perfil"
                    : opportunity?.title
                      ? `Vaga: ${opportunity.title}`
                      : "Diagnóstico de Aderência";

                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-foreground">{title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={a.status === "completed" ? "success" : "outline"}>{STATUS_LABELS[a.status] ?? a.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.status === "completed" && isProfile && pResult ? `IPP ${pResult.ipp_display_score}` : null}
                        {a.status === "completed" && !isProfile && fResult ? `IAO ${fResult.iao_display_score}` : null}
                        {a.status !== "completed" ? "—" : null}
                      </TableCell>
                      <TableCell className="text-right">
                        {a.status === "completed" ? (
                          <Button asChild size="sm" variant="secondary">
                            <Link href={href}>Ver resultado</Link>
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma análise ainda.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
