import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartAreaAnalyses, type DailyAnalysesPoint } from "@/features/dashboard/chart-area-analyses";
import { AnalysesDataTable, type AnalysisRow } from "@/features/dashboard/analyses-data-table";
import { IAO_BAND_LABELS, IPP_BAND_LABELS } from "@/lib/result-labels";

export const metadata = { title: "Dashboard — CareerTwin" };
export const dynamic = "force-dynamic";

interface RawAnalysis {
  id: string;
  analysis_type: string;
  status: string;
  created_at: string;
  profile_analysis_results: { ipp_display_score: number; ipp_band: string } | { ipp_display_score: number; ipp_band: string }[] | null;
  fit_analysis_results: { iao_display_score: number; iao_band: string } | { iao_display_score: number; iao_band: string }[] | null;
  opportunity_versions: { title: string; company: string | null } | { title: string; company: string | null }[] | null;
}

function first<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function buildDailySeries(analyses: RawAnalysis[], days: number): DailyAnalysesPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets = new Map<string, { perfil: number; aderencia: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), { perfil: 0, aderencia: 0 });
  }
  for (const a of analyses) {
    const key = a.created_at.slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    if (a.analysis_type === "profile_analysis") bucket.perfil += 1;
    else bucket.aderencia += 1;
  }
  return Array.from(buckets.entries()).map(([date, v]) => ({ date, ...v }));
}

function toRows(analyses: RawAnalysis[]): AnalysisRow[] {
  return analyses.map((a) => {
    const isProfile = a.analysis_type === "profile_analysis";
    const profileResult = first(a.profile_analysis_results);
    const fitResult = first(a.fit_analysis_results);
    const opportunity = first(a.opportunity_versions);

    return {
      id: a.id,
      type: isProfile ? "profile_analysis" : "job_analysis",
      title: isProfile ? "Análise de Perfil" : opportunity?.title ? `Vaga: ${opportunity.title}` : "Diagnóstico de Aderência",
      createdAt: a.created_at,
      status: a.status,
      score: a.status === "completed" ? (isProfile ? profileResult?.ipp_display_score : fitResult?.iao_display_score) ?? null : null,
      band: a.status === "completed" ? (isProfile ? profileResult?.ipp_band : fitResult?.iao_band) ?? null : null,
      href: a.status === "completed" ? (isProfile ? `/app/analise-perfil/${a.id}` : `/app/aderencia/${a.id}`) : null,
    };
  });
}

/** Reads real aggregated state (credits, last Core 1/Core 2 analyses, full history for chart/table) without recalculating anything client-side (Sitemap §4). */
export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/dashboard");

  const analysesSelect = `id, analysis_type, status, created_at,
     profile_analysis_results(ipp_display_score, ipp_band),
     fit_analysis_results(iao_display_score, iao_band),
     opportunity_versions(title, company)`;

  const [{ data: creditAccount }, { data: lastProfileAnalysis }, { data: lastJobAnalysis }, { count: completedCount }, { data: allAnalyses }] =
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
      supabase.from("analyses").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed"),
      supabase.from("analyses").select(analysesSelect).eq("user_id", user.id).order("created_at", { ascending: false }).limit(500),
    ]);

  const profileResult = first(lastProfileAnalysis?.profile_analysis_results ?? null);
  const jobResult = first(lastJobAnalysis?.fit_analysis_results ?? null);
  const rawAnalyses = (allAnalyses ?? []) as RawAnalysis[];
  const chartData = buildDailySeries(rawAnalyses, 90);
  const tableRows = toRows(rawAnalyses);

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

      <div className="mt-6">
        <ChartAreaAnalyses data={chartData} />
      </div>

      <div className="mt-6">
        <AnalysesDataTable data={tableRows} />
      </div>
    </main>
  );
}
