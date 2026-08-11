import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateJobAnalysisSheet } from "@/features/core-2/create-job-analysis-sheet";
import { DeleteJobAnalysisButton } from "@/features/core-2/delete-job-analysis-button";

export const metadata = { title: "Aderência à Vaga — CareerTwin" };
export const dynamic = "force-dynamic";
// createAndRunJobAnalysisAction (invoked from CreateJobAnalysisSheet below) runs the
// P-007 + P-009 AI calls synchronously in a single request — same ceiling risk Core 1
// hit before it moved to a dedicated Edge Function (see runProfileAnalysisStage's
// comment in src/features/core-1/actions.ts). Core 2 doesn't have that split yet, so
// this is the platform-limit mitigation until it does.
export const maxDuration = 60;

export default async function JobAnalysisListPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/aderencia");

  const { data: analyses } = await supabase
    .from("analyses")
    .select(
      `id, created_at,
       opportunity_versions(title, company),
       fit_analysis_results(iao_display_score, risks_count)`,
    )
    .eq("user_id", user.id)
    .eq("analysis_type", "job_analysis")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  const analysisIds = (analyses ?? []).map((a) => a.id);
  const { data: gapRows } = analysisIds.length
    ? await supabase.from("requirement_assessments").select("analysis_id, gap_type").in("analysis_id", analysisIds)
    : { data: [] as { analysis_id: string; gap_type: string | null }[] };

  const gapCountByAnalysis = new Map<string, number>();
  for (const row of gapRows ?? []) {
    if (!row.gap_type) continue;
    gapCountByAnalysis.set(row.analysis_id, (gapCountByAnalysis.get(row.analysis_id) ?? 0) + 1);
  }

  return (
    <main className="flex flex-col gap-[21px] px-8 py-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-bold text-foreground">Aderência à Vaga</h1>
        <CreateJobAnalysisSheet />
      </div>

      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vaga</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-center">Lacunas</TableHead>
              <TableHead className="text-center">Riscos</TableHead>
              <TableHead>Score de aderência</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analyses && analyses.length > 0 ? (
              analyses.map((a) => {
                const opportunity = Array.isArray(a.opportunity_versions)
                  ? a.opportunity_versions[0]
                  : a.opportunity_versions;
                const result = Array.isArray(a.fit_analysis_results) ? a.fit_analysis_results[0] : a.fit_analysis_results;
                const createdAt = new Date(a.created_at);

                return (
                  <TableRow key={a.id}>
                    <TableCell className="whitespace-normal py-4">
                      <p className="font-medium text-foreground">{opportunity?.title ?? "Vaga sem título"}</p>
                      <p className="text-muted-foreground">{opportunity?.company ?? "—"}</p>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="font-medium text-foreground">
                        {createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </p>
                      <p className="text-muted-foreground">
                        {createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </p>
                    </TableCell>
                    <TableCell className="text-center font-bold text-foreground">
                      {String(gapCountByAnalysis.get(a.id) ?? 0).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="text-center font-bold text-foreground">
                      {String(result?.risks_count ?? 0).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="font-bold text-primary">
                      {result?.iao_display_score != null ? `${result.iao_display_score}%` : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <a
                          href={`/app/aderencia/${a.id}`}
                          aria-label="Ver relatório"
                          className="text-foreground hover:text-primary"
                        >
                          <FileText className="size-6" />
                        </a>
                        <DeleteJobAnalysisButton analysisId={a.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Nenhuma análise de aderência concluída ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
