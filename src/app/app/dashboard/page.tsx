import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { logoutAction } from "@/features/auth/actions";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Dashboard — CareerTwin" };

/**
 * Stub — a real dashboard reads aggregated state from the domain tables
 * (professional_profiles, target_contexts, analyses, actions, credit_accounts)
 * without recalculating anything client-side (Sitemap §4). Not implemented
 * this session; this page only proves route protection + session resolution.
 */
export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/dashboard");

  const { data: creditAccount } = await supabase
    .from("credit_accounts")
    .select("available_credits")
    .eq("user_id", user.id)
    .single();

  return (
    <main className="mx-auto max-w-content px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Wordmark />
        <form action={logoutAction}>
          <Button type="submit" variant="secondary" size="sm">
            Sair
          </Button>
        </form>
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Olá, {user.email}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Este é um painel provisório. O dashboard completo (estado do perfil, contexto-alvo, última análise,
        ações pendentes, histórico) ainda não foi implementado nesta sessão.
      </p>

      <Card className="mt-8 max-w-xs">
        <CardHeader>
          <CardTitle className="text-base">Créditos disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{creditAccount?.available_credits ?? 0}</p>
        </CardContent>
      </Card>
    </main>
  );
}
