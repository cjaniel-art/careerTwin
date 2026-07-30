import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { logoutAction } from "@/features/auth/actions";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Onboarding — CareerTwin" };

/**
 * Stub — the full 9-step onboarding flow (PRD 01) is not implemented in this
 * session (see relatório final / docs/implementation/requirements-traceability.md).
 * This page only proves the authenticated flow reaches this route correctly
 * and lets the signed-in user log out.
 */
export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/onboarding");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Wordmark />
      <div className="max-w-md space-y-3">
        <h1 className="text-2xl font-semibold text-foreground">Vamos organizar sua trajetória profissional</h1>
        <p className="text-sm text-muted-foreground">
          Você está autenticado como <strong>{user.email}</strong>. O fluxo completo de onboarding (envio de
          currículo e LinkedIn, revisão do Thin Twin, contexto-alvo) ainda não foi implementado nesta sessão.
        </p>
      </div>
      <form action={logoutAction}>
        <Button type="submit" variant="secondary">
          Sair
        </Button>
      </form>
    </main>
  );
}
