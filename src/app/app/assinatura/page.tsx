import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCheck } from "lucide-react";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { confirmPurchaseIntentAction } from "@/features/credits/actions";
import { getCreditHistory } from "@/features/credits/get-history";
import { CreditHistorySheet } from "@/features/credits/history-sheet";
import { SIMULATED_OFFER } from "@/config/engine/offer";

const FREE_PLAN_FEATURES = [
  "1 Análise de Perfil completa",
  "1 análise de vaga específica",
  "Recomendações e ações priorizadas",
  "Dashboard e histórico de análises",
];

/** Os dois primeiros itens usam SIMULATED_OFFER — nunca hardcode créditos/validade separadamente do config. */
function proPlanFeatures(): string[] {
  return [
    `${SIMULATED_OFFER.creditsDisplayed} créditos para análises de vagas`,
    `Créditos válidos por ${SIMULATED_OFFER.validityDaysDisplayed} dias`,
    "Diagnóstico de aderência e lacunas",
    "Lacunas e recomendações",
  ];
}

/** Plano Full — só o card visual por enquanto, sem oferta/RPC própria (preço fixo, sem SIMULATED_OFFER). */
const FULL_PLAN_FEATURES = [
  "Análises de vaga ilimitadas",
  "Sem contador de créditos enquanto o plano estiver ativo",
  "Diagnóstico de aderência e lacunas",
  "Lacunas e recomendações",
];

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

  const [{ data: account }, creditHistory, { data: lastIntent }] = await Promise.all([
    supabase.from("credit_accounts").select("available_credits, reserved_credits").eq("user_id", user.id).maybeSingle(),
    getCreditHistory(supabase, user.id),
    supabase
      .from("purchase_intents")
      .select("status, created_at, validity_days_displayed")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const intentExpiresAt =
    lastIntent?.status === "confirmed_intent"
      ? new Date(new Date(lastIntent.created_at).getTime() + lastIntent.validity_days_displayed * 24 * 60 * 60 * 1000)
      : null;

  return (
    <main className="flex flex-col gap-6 px-8 py-6">
      {motivo === "sem-credito" ? (
        <p className="rounded-md bg-secondary p-3 text-sm text-foreground">
          Você não tem créditos disponíveis para uma nova análise de vaga. Seu histórico, ações e perfil
          continuam disponíveis normalmente.
        </p>
      ) : null}

      <h1 className="text-2xl font-bold text-foreground">Assinatura</h1>

      <div className="flex flex-col gap-6 md:flex-row">
        <Card className="md:flex-1">
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

        <Card className="md:flex-1">
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-3xl font-bold text-foreground">{creditHistory.length}</p>
              <p className="text-sm text-muted-foreground">{creditHistory.length === 1 ? "movimentação" : "movimentações"}</p>
            </div>
            <CreditHistorySheet items={creditHistory} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Card de destaque com foto — tamanho fixo (299x488), igual ao Figma */}
        <div className="relative h-[488px] w-full shrink-0 overflow-hidden rounded-2xl bg-black xl:w-[299px]">
          <Image
            src="/landing/pricing-card-photo.svg"
            alt=""
            fill
            sizes="299px"
            className="pointer-events-none object-cover"
          />
          <div className="absolute inset-x-0 top-0 p-8">
            <p className="text-xl font-bold leading-tight text-white">
              Prepare-se melhor
              <br />
              antes de se candidatar.
            </p>
            <p className="mt-4 text-sm leading-6 text-white/90">
              Analise seu perfil, identifique o que precisa melhorar e concentre sua energia nas oportunidades
              mais alinhadas ao seu momento profissional.
            </p>
            <ArrowRight className="mt-6 h-6 w-6 text-white" aria-hidden />
          </div>
        </div>

        {/* Plano gratuito — expansivo, ocupa o espaço restante */}
        <div className="flex h-[488px] min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border shadow-sm">
          <div className="flex flex-1 flex-col justify-between gap-8 bg-card px-6 pb-6 pt-7">
            <div className="space-y-2">
              <p className="text-base font-medium text-foreground">experiência gratuita</p>
              <div className="flex items-end gap-1.5">
                <p className="text-4xl font-semibold text-foreground">Grátis</p>
                <div className="flex flex-col text-xs leading-tight text-muted-foreground">
                  <span>para</span>
                  <span>começar</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-sm leading-6 text-foreground">
                Entenda como seu perfil está sendo apresentado e descubra o que melhorar.
              </p>
              <Button asChild variant="secondary" className="h-auto w-full rounded-lg py-3 text-sm">
                <Link href="/app/analise-perfil">Continuar gratuitamente</Link>
              </Button>
            </div>
          </div>
          <div className="space-y-5 border-t border-border bg-card px-6 py-6">
            <p className="text-sm font-medium text-foreground">Inclui:</p>
            <ul className="space-y-3">
              {FREE_PLAN_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span className="text-xs text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pacote em destaque — expansivo, ocupa o espaço restante */}
        <div className="flex h-[488px] min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border shadow-sm">
          <div className="flex flex-1 flex-col justify-between gap-8 bg-gradient-to-b from-[#f1f0fb] to-card dark:from-[#2a2440] px-6 pb-6 pt-7">
            <div className="space-y-2">
              <p className="text-base font-medium text-foreground">pacote em destaque</p>
              <div className="flex items-end gap-1.5">
                <p className="text-4xl font-semibold text-foreground">
                  R$ {(SIMULATED_OFFER.priceCents / 100).toFixed(2).replace(".", ",")}
                </p>
                <div className="flex flex-col text-xs leading-tight text-muted-foreground">
                  <span>Por</span>
                  <span>pacote</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm leading-6 text-foreground">
                Para quem está avaliando novas vagas e quer decidir quais candidaturas realmente vale a pena
                priorizar. Preço, créditos e validade são hipóteses de monetização — sem cobrança real nem
                coleta de dados de cartão.
              </p>
              {lastIntent?.status === "confirmed_intent" && intentExpiresAt ? (
                <p className="rounded-lg bg-secondary p-3 text-center text-sm text-foreground">
                  Seu pacote expira no dia{" "}
                  {intentExpiresAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}.
                </p>
              ) : (
                <form action={confirmPurchaseIntentAction}>
                  <SubmitButton className="h-auto w-full rounded-lg py-3 text-sm">Tenho interesse</SubmitButton>
                </form>
              )}
            </div>
          </div>
          <div className="space-y-5 border-t border-border bg-card px-6 py-6">
            <p className="text-sm font-medium text-foreground">Features:</p>
            <ul className="space-y-3">
              {proPlanFeatures().map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span className="text-xs text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Plano Full — só o card visual por enquanto, sem oferta/RPC própria (ver FULL_PLAN_FEATURES) */}
        <div className="flex h-[488px] min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border shadow-sm">
          <div className="flex flex-1 flex-col justify-between gap-8 bg-gradient-to-b from-primary/10 to-card px-6 pb-6 pt-7">
            <div className="space-y-2">
              <p className="text-base font-medium text-foreground">plano full</p>
              <div className="flex items-end gap-1.5">
                <p className="text-4xl font-semibold text-foreground">R$ 59,99</p>
                <div className="flex flex-col text-xs leading-tight text-muted-foreground">
                  <span>Por</span>
                  <span>mês</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm leading-6 text-foreground">
                Para quem está em busca ativa e faz várias candidaturas em paralelo — analise quantas
                vagas precisar, sem se preocupar com o contador de créditos. Preço e condições são
                hipóteses de monetização — sem cobrança real nem coleta de dados de cartão.
              </p>
              <Button type="button" className="h-auto w-full rounded-lg py-3 text-sm">
                Tenho interesse
              </Button>
            </div>
          </div>
          <div className="space-y-5 border-t border-border bg-card px-6 py-6">
            <p className="text-sm font-medium text-foreground">Features:</p>
            <ul className="space-y-3">
              {FULL_PLAN_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span className="text-xs text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
