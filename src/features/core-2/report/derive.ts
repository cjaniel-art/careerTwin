import { CORE_2_CONFIG, type RequirementCategory, type RequirementCriticality } from "@/config/engine/core2";
import type { GapType } from "@/config/engine/core2";
import type { Core2SeniorityAssessment } from "@/config/schemas/core2";
import type { EvidenceReference } from "@/config/schemas/evidence";
import { CRITICALITY_LABELS } from "@/lib/result-labels";

export interface RequirementRow {
  id: string;
  description: string;
  category: RequirementCategory;
  criticality: RequirementCriticality;
  applicability: "applicable" | "not_applicable" | "unknown";
  extractionConfidence: number;
  matchStatus: keyof typeof CORE_2_CONFIG.iao.matchFactors;
  reasoning: string;
  gapType: GapType | null;
  assessmentConfidence: number;
  evidenceRefs: EvidenceReference[];
}

/**
 * Distribuição resumida da aderência (§6.5) — agrupa os 7 estados reais de
 * match_status (mais applicability="not_applicable") em 5 baldes visuais,
 * mantendo o estado detalhado disponível por requisito nas demais abas.
 */
export type DistributionBucket = "matched" | "partial" | "low_evidence" | "unmatched" | "not_applicable";

export const DISTRIBUTION_BUCKET_LABELS: Record<DistributionBucket, string> = {
  matched: "Atendidos",
  partial: "Parcialmente atendidos",
  low_evidence: "Pouco evidenciados",
  unmatched: "Não atendidos",
  not_applicable: "Não aplicável",
};

function bucketFor(row: RequirementRow): DistributionBucket {
  if (row.applicability === "not_applicable") return "not_applicable";
  switch (row.matchStatus) {
    case "confirmed_match":
      return "matched";
    case "partial_match":
      return "partial";
    case "communication_gap":
    case "evidence_gap":
    case "unknown":
      return "low_evidence";
    case "not_observed":
    case "confirmed_mismatch":
      return "unmatched";
  }
}

export function computeDistribution(rows: RequirementRow[]): { bucket: DistributionBucket; count: number; percent: number }[] {
  const buckets: DistributionBucket[] = ["matched", "partial", "low_evidence", "unmatched", "not_applicable"];
  const total = rows.length || 1;
  const counts = new Map<DistributionBucket, number>(buckets.map((b) => [b, 0]));
  for (const row of rows) counts.set(bucketFor(row), (counts.get(bucketFor(row)) ?? 0) + 1);
  return buckets.map((bucket) => {
    const count = counts.get(bucket) ?? 0;
    return { bucket, count, percent: Math.round((count / total) * 100) };
  });
}

const CRITICALITY_ORDER: RequirementCriticality[] = ["mandatory", "desired", "differential", "complementary", "blocking"];

export interface CriticalityBucket {
  criticality: RequirementCriticality;
  label: string;
  total: number;
  met: number;
}

/** "Atendido" aqui é estrito (confirmed_match) — parcial/comunicação/evidência não contam como atendido. */
export function computeCriticalityBuckets(rows: RequirementRow[]): CriticalityBucket[] {
  return CRITICALITY_ORDER.map((criticality) => {
    const group = rows.filter((r) => r.criticality === criticality);
    return {
      criticality,
      label: CRITICALITY_LABELS[criticality] ?? criticality,
      total: group.length,
      met: group.filter((r) => r.matchStatus === "confirmed_match").length,
    };
  }).filter((bucket) => bucket.total > 0);
}

export interface MatchSummaryDimension {
  label: string;
  percent: number;
}

/**
 * §6.1 — cada barra usa a média dos matchFactors reais (CORE_2_CONFIG.iao.matchFactors,
 * os mesmos pesos usados no cálculo oficial do IAO) para o subconjunto de requisitos
 * relevante, nunca um número inventado. "Sinais de senioridade" cai para o
 * seniorityAssessment persistido quando a vaga não tem requisito de categoria "seniority".
 */
export function computeMatchSummary(rows: RequirementRow[], seniority: Core2SeniorityAssessment | null): MatchSummaryDimension[] {
  const factor = (row: RequirementRow) => CORE_2_CONFIG.iao.matchFactors[row.matchStatus];
  const avgPercent = (group: RequirementRow[]): number | null =>
    group.length === 0 ? null : Math.round((group.reduce((sum, r) => sum + factor(r), 0) / group.length) * 100);

  const dimensions: MatchSummaryDimension[] = [];

  const mandatory = avgPercent(rows.filter((r) => r.criticality === "mandatory"));
  if (mandatory !== null) dimensions.push({ label: "Requisitos obrigatórios", percent: mandatory });

  const desired = avgPercent(rows.filter((r) => r.criticality === "desired"));
  if (desired !== null) dimensions.push({ label: "Requisitos desejáveis", percent: desired });

  const experience = avgPercent(rows.filter((r) => r.category === "experience"));
  if (experience !== null) dimensions.push({ label: "Experiência comprovada", percent: experience });

  const tools = avgPercent(rows.filter((r) => r.category === "tool"));
  if (tools !== null) dimensions.push({ label: "Ferramentas e tecnologias", percent: tools });

  const senioritySignals = avgPercent(rows.filter((r) => r.category === "seniority"));
  if (senioritySignals !== null) {
    dimensions.push({ label: "Sinais de senioridade", percent: senioritySignals });
  } else if (seniority) {
    const seniorityOrder = ["intern", "junior", "mid", "senior"] as const;
    const observedIndex = seniority.observed === "insufficient_data" ? -1 : seniorityOrder.indexOf(seniority.observed);
    const expectedIndex = seniorityOrder.indexOf(seniority.expected);
    const percent =
      observedIndex === -1
        ? Math.round(seniority.assessmentConfidence * 40)
        : observedIndex === expectedIndex
          ? 100
          : Math.abs(observedIndex - expectedIndex) === 1
            ? 60
            : 20;
    dimensions.push({ label: "Sinais de senioridade", percent });
  }

  return dimensions;
}
