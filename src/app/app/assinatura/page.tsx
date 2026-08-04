import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { confirmPurchaseIntentAction } from "@/features/credits/actions";
import { SIMULATED_OFFER } from "@/config/engine/offer";

export const metadata = { title: "Assinatura — CareerTwin" };
export const dynamic = "force-dynamic";

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string }>;
}) {
  const { motivo } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/assinatura");

  const [{ data: account }, { data: ledger }, { data: lastIntent }] = await Promise.all([
    supabase.from("credit_accounts").select("available_credits, reserved_credits").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("credit_ledger")
      .select("transaction_type, amount, balance_after, reason, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("purchase_intents")
      .select("status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      {motivo === "sem-credito" ? (
        <p className="mb-6 rounded-md bg-secondary p-3 text-sm text-foreground">
          Você não tem créditos disponíveis para uma nova análise de vaga. Seu histórico, ações e perfil
          continuam disponíveis normalmente.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Seus créditos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{account?.available_credits ?? 0}</p>
          <p className="text-sm text-muted-foreground">
            {account?.reserved_credits ? `${account.reserved_credits} reservado(s) em análises em andamento.` : "disponíveis"}
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pacote Novas Oportunidades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-2xl font-bold text-foreground">
            R$ {(SIMULATED_OFFER.priceCents / 100).toFixed(2).replace(".", ",")}
          </p>
          <p className="text-sm text-muted-foreground">
            {SIMULATED_OFFER.creditsDisplayed} créditos para novas análises de vagas · validade de{" "}
            {SIMULATED_OFFER.validityDaysDisplayed} dias
          </p>
          <p className="text-xs text-muted-foreground">
            Preço, quantidade de créditos e validade são hipóteses de monetização. Não haverá cobrança real
            nem coleta de dados de cartão.
          </p>
          {lastIntent?.status === "confirmed_intent" ? (
            <p className="rounded-md bg-secondary p-3 text-sm text-foreground">
              Você já registrou intenção de compra deste pacote.
            </p>
          ) : (
            <form action={confirmPurchaseIntentAction}>
              <SubmitButton>Registrar intenção de compra</SubmitButton>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ledger && ledger.length > 0 ? (
            ledger.map((entry, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
                <span className="text-foreground">{entry.reason}</span>
                <span className={entry.amount >= 0 ? "text-foreground" : "text-muted-foreground"}>
                  {entry.amount >= 0 ? "+" : ""}
                  {entry.amount}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma movimentação ainda.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
