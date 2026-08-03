import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { Wordmark } from "@/components/wordmark";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutAction } from "@/features/auth/actions";
import { requestAccountDeletionAction } from "@/features/account/actions";

export const metadata = { title: "Sua conta — CareerTwin" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/conta");

  const [{ data: account }, { data: personalData }, { data: deletionRequest }] = await Promise.all([
    supabase.from("user_accounts").select("status, created_at").eq("user_id", user.id).single(),
    supabase.from("personal_data").select("full_name, city, state").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("deletion_requests")
      .select("status, requested_at, active_systems_deadline, backup_deadline")
      .eq("user_id", user.id)
      .order("requested_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const deletionPending = account?.status === "deletion_pending";

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

      <h1 className="text-2xl font-semibold text-foreground">Sua conta</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Seus dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">E-mail:</span> <span className="text-foreground">{user.email}</span>
          </p>
          {personalData?.full_name ? (
            <p>
              <span className="text-muted-foreground">Nome:</span>{" "}
              <span className="text-foreground">{personalData.full_name}</span>
            </p>
          ) : null}
          {personalData?.city ? (
            <p>
              <span className="text-muted-foreground">Localização:</span>{" "}
              <span className="text-foreground">
                {personalData.city}
                {personalData.state ? `, ${personalData.state}` : ""}
              </span>
            </p>
          ) : null}
          <p>
            <span className="text-muted-foreground">Conta criada em:</span>{" "}
            <span className="text-foreground">
              {account?.created_at
                ? new Date(account.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
                : "—"}
            </span>
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Excluir conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {deletionPending && deletionRequest ? (
            <div className="rounded-md bg-secondary p-3 text-foreground">
              <p className="font-medium">Solicitação de exclusão registrada.</p>
              <p className="mt-1 text-muted-foreground">
                Sua conta está em processo de exclusão desde{" "}
                {new Date(deletionRequest.requested_at).toLocaleDateString("pt-BR")}. Novas análises e envios de
                documentos ficam bloqueados enquanto o processo está em andamento. Seus dados nos sistemas ativos
                devem ser removidos até{" "}
                {new Date(deletionRequest.active_systems_deadline).toLocaleDateString("pt-BR")}, e cópias de
                backup até {new Date(deletionRequest.backup_deadline).toLocaleDateString("pt-BR")}.
              </p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground">
                A exclusão remove permanentemente seus dados pessoais, Thin Twin, contextos-alvo, documentos,
                oportunidades, análises, recomendações, ações e feedbacks. Essa ação não pode ser desfeita.
              </p>
              <form action={requestAccountDeletionAction}>
                <SubmitButton variant="destructive" size="sm">
                  Solicitar exclusão da conta
                </SubmitButton>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
