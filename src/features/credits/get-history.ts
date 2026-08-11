import type { SupabaseClient } from "@supabase/supabase-js";

export interface CreditHistoryRow {
  id: string;
  title: string;
  subtitle: string | null;
  dateLabel: string;
  timeLabel: string;
  amount: number;
}

/** Shared by the "Histórico" card and CreditHistorySheet on /app/assinatura. */
export async function getCreditHistory(supabase: SupabaseClient, userId: string): Promise<CreditHistoryRow[]> {
  const { data: ledger } = await supabase
    .from("credit_ledger")
    .select("id, amount, reason, created_at, analysis_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const analysisIds = Array.from(
    new Set((ledger ?? []).map((entry) => entry.analysis_id).filter((id): id is string => Boolean(id))),
  );

  const { data: analyses } =
    analysisIds.length > 0
      ? await supabase.from("analyses").select("id, opportunity_versions(title, company)").in("id", analysisIds)
      : { data: [] as { id: string; opportunity_versions: { title: string | null; company: string | null } | { title: string | null; company: string | null }[] | null }[] };

  const vagaByAnalysisId = new Map<string, { title: string; company: string | null }>();
  for (const a of analyses ?? []) {
    const opportunity = Array.isArray(a.opportunity_versions) ? a.opportunity_versions[0] : a.opportunity_versions;
    if (opportunity?.title) {
      vagaByAnalysisId.set(a.id, { title: opportunity.title, company: opportunity.company });
    }
  }

  return (ledger ?? []).map((entry) => {
    // Grants (welcome credit, purchase intent) have no analysis_id — fall back to the ledger reason as the title.
    // The purchase-intent grant reason is verbose (see ct_grant_purchase_credits) — shorten it for display.
    const vaga = entry.analysis_id ? vagaByAnalysisId.get(entry.analysis_id) : undefined;
    const title = entry.reason.startsWith("Créditos do pacote") ? "Novo pacote de crédito" : entry.reason;
    const createdAt = new Date(entry.created_at);
    return {
      id: entry.id,
      title: vaga?.title ?? title,
      subtitle: vaga?.company ?? null,
      dateLabel: createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }),
      timeLabel: createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      amount: entry.amount,
    };
  });
}
