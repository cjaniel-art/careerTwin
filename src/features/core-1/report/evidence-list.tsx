import type { EvidenceReference } from "@/config/schemas/evidence";

const SOURCE_LABELS: Record<string, string> = {
  resume: "Currículo",
  linkedin: "LinkedIn",
  user: "Confirmado por você",
};

/** Reusable "Ver evidências" list (§14) — fonte + trecho real, nunca inventado. Used wherever evidenceRefs exist. */
export function EvidenceList({ evidenceRefs }: { evidenceRefs: EvidenceReference[] }) {
  if (evidenceRefs.length === 0) return null;
  return (
    <ul className="mt-2 space-y-2">
      {evidenceRefs.map((ref, i) => (
        <li key={i} className="rounded-md bg-secondary p-2 text-xs text-foreground">
          <span className="font-medium">{SOURCE_LABELS[ref.sourceType] ?? ref.sourceType}:</span> “{ref.excerpt}”
        </li>
      ))}
    </ul>
  );
}
