import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { confirmOpportunityAction, markRequirementNotApplicableAction } from "@/features/core-2/actions";

export const metadata = { title: "Revisão da vaga — CareerTwin" };
export const dynamic = "force-dynamic";

const CRITICALITY_LABELS: Record<string, string> = {
  mandatory: "Obrigatório",
  desired: "Desejável",
  differential: "Diferencial",
  complementary: "Complementar",
  blocking: "Impeditivo",
};

export default async function ReviewOpportunityPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId: opportunityId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/app/aderencia/vaga/${opportunityId}/revisao`);

  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("id, status, current_version_id, opportunity_versions!opportunities_current_version_fk(id, title, company, confirmation_status)")
    .eq("id", opportunityId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!opportunity) redirect("/app/aderencia/vaga/nova");

  const version = Array.isArray(opportunity.opportunity_versions)
    ? opportunity.opportunity_versions[0]
    : opportunity.opportunity_versions;

  if (version?.confirmation_status === "confirmed") {
    redirect(`/app/aderencia/vaga/${opportunityId}/analisar`);
  }

  const { data: requirements } = await supabase
    .from("requirements")
    .select("id, description, category, criticality, applicability, ambiguous, extraction_confidence")
    .eq("opportunity_version_id", opportunity.current_version_id!);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Revise os requisitos identificados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Itens ambíguos precisam de atenção antes da análise. Você pode marcar um requisito como não
            aplicável ao seu contexto.
          </p>

          {requirements && requirements.length > 0 ? (
            <ul className="space-y-3">
              {requirements.map((r) => (
                <li key={r.id} className="rounded-md border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {CRITICALITY_LABELS[r.criticality] ?? r.criticality} · {r.category}
                        {r.ambiguous ? " · ambíguo" : ""}
                        {r.applicability === "not_applicable" ? " · marcado como não aplicável" : ""}
                      </p>
                    </div>
                    {r.applicability !== "not_applicable" ? (
                      <form action={markRequirementNotApplicableAction}>
                        <input type="hidden" name="requirementId" value={r.id} />
                        <input type="hidden" name="opportunityId" value={opportunityId} />
                        <SubmitButton size="sm" variant="tertiary">
                          Não aplicável
                        </SubmitButton>
                      </form>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-md bg-secondary p-3 text-sm text-muted-foreground">
              A descrição não possui informações suficientes para identificar requisitos estruturados.
            </p>
          )}

          <form action={confirmOpportunityAction}>
            <input type="hidden" name="opportunityId" value={opportunityId} />
            <SubmitButton disabled={!requirements || requirements.length === 0}>
              Confirmar vaga
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
