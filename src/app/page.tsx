import Link from "next/link";
import { CheckCircle2, FileSearch, ScanSearch, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero — PRD 00 §"Mensagens essenciais" (copy provisória) */}
        <section className="mx-auto max-w-content px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
              Mentor de carreira com inteligência artificial
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              Melhore seu posicionamento profissional e entenda sua aderência às oportunidades antes de se
              candidatar.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              O CareerTwin analisa seu currículo, LinkedIn e oportunidades de interesse para gerar
              diagnósticos explicáveis, recomendações priorizadas e ações práticas.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/cadastro">Criar minha conta</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href="#como-funciona">Ver como funciona</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Problema */}
        <section className="border-t border-border bg-secondary/50 py-16">
          <div className="mx-auto max-w-content px-6">
            <h2 className="text-2xl font-semibold text-foreground">O problema que resolvemos</h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Em muitos casos, a experiência existe, mas está mal organizada, pouco evidenciada ou
              desconectada do objetivo profissional. Currículo e LinkedIn pouco claros dificultam identificar
              lacunas reais, priorizar melhorias e avaliar aderência a cargos e vagas com confiança.
            </p>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="py-16">
          <div className="mx-auto max-w-content px-6">
            <h2 className="text-2xl font-semibold text-foreground">Como funciona</h2>
            <ol className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                "Crie sua conta",
                "Envie currículo e LinkedIn",
                "Revise e confirme seu perfil",
                "Defina seu contexto-alvo",
              ].map((step, index) => (
                <li key={step} className="flex gap-4 rounded-lg border border-border bg-card p-5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Core 1 */}
        <section id="core-1" className="border-t border-border py-16">
          <div className="mx-auto max-w-content px-6">
            <Card>
              <CardHeader>
                <ScanSearch className="mb-2 h-8 w-8 text-primary" aria-hidden />
                <CardTitle>Core 1 — Análise de Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>
                  Ajuda você a compreender como seu perfil está sendo apresentado: identifica forças e
                  fragilidades, melhora a comunicação das experiências, identifica necessidades de evidência
                  e organiza um plano de ações priorizado.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Core 2 */}
        <section id="core-2" className="py-4 pb-16">
          <div className="mx-auto max-w-content px-6">
            <Card>
              <CardHeader>
                <FileSearch className="mb-2 h-8 w-8 text-primary" aria-hidden />
                <CardTitle>Core 2 — Diagnóstico de Aderência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>
                  Compara seu perfil com um cargo-alvo ou uma vaga específica: identifica requisitos
                  atendidos, diferencia tipos de lacuna, explica riscos e bloqueadores e apoia sua decisão de
                  candidatura.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Autenticidade e confiança */}
        <section className="border-t border-border bg-secondary/50 py-16">
          <div className="mx-auto max-w-content px-6">
            <div className="flex items-start gap-4">
              <ShieldCheck className="mt-1 h-8 w-8 shrink-0 text-primary" aria-hidden />
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Autenticidade e confiança</h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  O CareerTwin não inventa experiências e não promete contratação. A proposta é ajudar você a
                  comunicar melhor sua trajetória real e tomar decisões mais estratégicas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* O que o usuário recebe */}
        <section className="py-16">
          <div className="mx-auto max-w-content px-6">
            <h2 className="text-2xl font-semibold text-foreground">O que você recebe</h2>
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {[
                "Diagnósticos explicáveis, com evidências",
                "Recomendações priorizadas",
                "Tradução de experiências reais",
                "Identificação clara de lacunas",
                "Plano de ações",
                "Histórico e reanálises",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Limitações */}
        <section className="border-t border-border py-16">
          <div className="mx-auto max-w-content px-6">
            <h2 className="text-2xl font-semibold text-foreground">Limitações do produto</h2>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              O CareerTwin não garante entrevista nem contratação, não representa a decisão de recrutadores,
              não apresenta seus resultados como probabilidade de aprovação, não realiza candidatura
              automática e não funciona como job board ou ATS. A jornada acompanha você até a preparação e
              decisão de candidatura.
            </p>
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-border bg-foreground py-16 text-background">
          <div className="mx-auto max-w-content px-6 text-center">
            <h2 className="text-2xl font-semibold">Pronto para evoluir com direção?</h2>
            <div className="mt-6 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/cadastro">Criar minha conta</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/login">Já tenho conta</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
