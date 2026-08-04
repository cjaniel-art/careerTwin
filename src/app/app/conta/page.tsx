import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAccountDialog } from "@/features/account/delete-account-dialog";

export const metadata = { title: "Sua conta — CareerTwin" };
export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/conta");

  const [{ data: account }, { data: personalData }] = await Promise.all([
    supabase.from("user_accounts").select("created_at").eq("user_id", user.id).single(),
    supabase.from("personal_data").select("full_name, city, state").eq("user_id", user.id).maybeSingle(),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
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
          {erro === "exclusao" ? (
            <p className="rounded-md bg-destructive/10 p-3 text-destructive">
              Não foi possível excluir sua conta agora. Tente novamente.
            </p>
          ) : null}
          <p className="text-muted-foreground">
            A exclusão remove imediatamente e para sempre seus dados pessoais, Thin Twin, contextos-alvo,
            documentos, oportunidades, análises, recomendações, ações e feedbacks. Essa ação não pode ser desfeita.
          </p>
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </main>
  );
}
