import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Analisar cargo-alvo — CareerTwin" };
export const dynamic = "force-dynamic";

/**
 * Blocked by design (not a bug): no approved role-reference catalog exists
 * yet — docs/implementation/open-decisions.md #1. Per PRD 03 §7, "quando não
 * houver referência aprovada, o resultado é insufficient_data" and the
 * catalog must never be created silently. The infrastructure (tables,
 * queries) is fully implemented; only the catalog content is missing.
 */
export default async function TargetRoleAnalysisPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/aderencia/cargo");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <Link href="/app/dashboard">
          <Wordmark />
        </Link>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <h1 className="text-lg font-semibold text-foreground">Dados insuficientes</h1>
          <p className="text-sm text-muted-foreground">
            Ainda não existe um catálogo de referências de cargo aprovado para gerar um diagnóstico
            definitivo por cargo-alvo. Esta é uma dependência de configuração pendente, não um erro — ver{" "}
            <code>docs/implementation/open-decisions.md #1</code>.
          </p>
          <Button asChild variant="secondary">
            <Link href="/app/aderencia/vaga/nova">Analisar uma vaga específica</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
