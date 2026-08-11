import type { SupabaseClient } from "@supabase/supabase-js";
import { ANALYSIS_STATUS_LABELS, IAO_BAND_LABELS, IPP_BAND_LABELS, RECOMMENDATION_LABELS } from "@/lib/result-labels";

export interface AnalysisHistoryRow {
  id: string;
  href: string;
  title: string;
  dateLabel: string;
  statusLabel: string;
  scoreLabel: string | null;
  isCompleted: boolean;
}

/** Shared by /app/historico (full page) and HistorySheet (report Sheet) so both list the exact same rows. */
export async function getAnalysisHistory(supabase: SupabaseClient, userId: string): Promise<AnalysisHistoryRow[]> {
  const { data: analyses } = await supabase
    .from("analyses")
    .select(
      `id, analysis_type, status, created_at,
       profile_analysis_results(ipp_display_score, ipp_band),
       fit_analysis_results(iao_display_score, iao_band, recommendation_type),
       opportunity_versions(title, company)`,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (analyses ?? []).map((a) => {
    const profileResult = Array.isArray(a.profile_analysis_results) ? a.profile_analysis_results[0] : a.profile_analysis_results;
    const fitResult = Array.isArray(a.fit_analysis_results) ? a.fit_analysis_results[0] : a.fit_analysis_results;
    const opportunity = Array.isArray(a.opportunity_versions) ? a.opportunity_versions[0] : a.opportunity_versions;

    const isProfile = a.analysis_type === "profile_analysis";
    const href = isProfile ? `/app/analise-perfil/${a.id}` : `/app/aderencia/${a.id}`;
    const title = isProfile
      ? "Análise de Perfil"
      : opportunity?.title
        ? `Vaga: ${opportunity.title}${opportunity.company ? ` — ${opportunity.company}` : ""}`
        : "Diagnóstico de Aderência";

    const scoreLabel =
      a.status === "completed" && isProfile && profileResult
        ? `IPP ${profileResult.ipp_display_score} — ${IPP_BAND_LABELS[profileResult.ipp_band]}`
        : a.status === "completed" && !isProfile && fitResult
          ? `IAO ${fitResult.iao_display_score} — ${IAO_BAND_LABELS[fitResult.iao_band]} — ${
              RECOMMENDATION_LABELS[fitResult.recommendation_type] ?? fitResult.recommendation_type
            }`
          : null;

    return {
      id: a.id,
      href,
      title,
      dateLabel: new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }),
      statusLabel: ANALYSIS_STATUS_LABELS[a.status] ?? a.status,
      scoreLabel,
      isCompleted: a.status === "completed",
    };
  });
}
