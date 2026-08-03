import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { Wordmark } from "@/components/wordmark";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { logoutAction } from "@/features/auth/actions";
import { SubmitOpportunityForm } from "@/features/core-2/submit-opportunity-form";

export const metadata = { title: "Nova análise de vaga — CareerTwin" };
export const dynamic = "force-dynamic";

export default async function NewJobOpportunityPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/aderencia/vaga/nova");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/app/dashboard">
          <Wordmark />
        </Link>
        <form action={logoutAction}>
          <SubmitButton variant="tertiary" size="sm">
            Sair
          </SubmitButton>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analisar uma vaga específica</CardTitle>
          <CardDescription>
            Cole a descrição da vaga para identificar requisitos, lacunas, riscos e pontos de aderência.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubmitOpportunityForm />
        </CardContent>
      </Card>
    </main>
  );
}
