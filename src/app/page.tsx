import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCheck, CheckCircle2, Lock } from "lucide-react";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";

const HOW_IT_WORKS = [
  {
    icon: "/landing/icon-mode-portrait.svg",
    title: "1. Crie sua conta",
    description: "Cadastro rápido, sem burocracia, para começar a organizar sua trajetória profissional.",
  },
  {
    icon: "/landing/icon-rocket-launch.svg",
    title: "2. Envie currículo e LinkedIn",
    description: "Envie os arquivos ou cole o conteúdo — você pode complementar manualmente o que quiser.",
  },
  {
    icon: "/landing/icon-sparkles.svg",
    title: "3. Revise e confirme seu perfil",
    description: "Você revisa o que foi identificado e confirma antes de qualquer análise ser gerada.",
  },
  {
    icon: "/landing/icon-trophy.svg",
    title: "4. Defina seu contexto-alvo",
    description: "Diga qual área e cargo você busca para receber diagnósticos direcionados ao seu objetivo.",
  },
];

const PROFILE_ANALYSIS_ITEMS = [
  "identificar seus principais pontos fortes;",
  "encontrar experiências descritas de forma genérica;",
  "descobrir competências pouco evidenciadas;",
  "entender o que melhorar primeiro.",
];

const FIT_DIAGNOSIS_ITEMS = [
  "identificar requisitos já atendidos;",
  "entender quais lacunas realmente importam;",
  "diferenciar falta de experiência de falta de evidência;",
  "priorizar oportunidades com mais clareza.",
];

const WHAT_YOU_GET = [
  "Diagnósticos explicáveis, com evidências",
  "Recomendações priorizadas",
  "Identificação clara de lacunas",
  "Plano de ações",
  "Histórico e reanálises",
];

export default function HomePage() {
  return (
    <>
      <LandingHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-foreground px-6 pb-24 pt-16 text-white md:px-14 md:pb-32 md:pt-24">
          <Image
            src="/landing/hero-shapes.svg"
            alt=""
            width={708}
            height={683}
            className="pointer-events-none absolute right-[-8%] top-0 hidden h-auto w-[46%] max-w-none opacity-90 lg:block"
          />
          <Image
            src="/landing/hero-photo.png"
            alt="Profissional em ambiente de trabalho"
            width={600}
            height={720}
            className="pointer-events-none absolute right-[6%] top-16 hidden h-[85%] w-[34%] max-w-none rounded-2xl object-cover lg:block"
            priority
          />
          <div className="relative max-w-xl">
            <h1 className="text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
              Evolua.
              <br />
              Reposicione-se.
              <br />
              <span className="text-primary">Conquiste</span>
            </h1>
            <p className="mt-6 text-lg font-semibold tracking-tight text-white/90">
              Clareza sobre seu perfil, direção para sua carreira e decisões melhores antes de se candidatar.
            </p>
            <Button asChild className="mt-8">
              <Link href="/cadastro">
                <ArrowRight className="h-4 w-4" aria-hidden />
                Comece agora
              </Link>
            </Button>
            <p className="mt-6 flex items-center gap-2 text-sm font-medium text-white/80">
              <Lock className="h-5 w-5 shrink-0" aria-hidden />
              Rápido <span className="text-primary">•</span> Seguro <span className="text-primary">•</span> Sem
              complicação
            </p>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="px-6 py-20 md:px-14">
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
              Como <span className="text-primary">funciona</span>
            </h2>
            <p className="text-lg font-semibold text-foreground">
              Um processo simples para transformar clareza em ação.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step) => (
              <div
                key={step.title}
                className="flex flex-col items-center gap-7 rounded-lg border border-border px-6 py-10 text-center"
              >
                <Image src={step.icon} alt="" width={104} height={104} />
                <div className="space-y-2">
                  <p className="text-xl font-semibold tracking-tight text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Nossa solução — Core 1 e Core 2 */}
        <section id="solucao" className="space-y-9 bg-secondary/50 px-6 py-22 md:px-14">
          <div className="flex flex-col items-center gap-12 md:flex-row md:items-center">
            <div className="relative h-[280px] w-full shrink-0 overflow-hidden rounded-2xl md:h-[325px] md:w-[45%]">
              <Image
                src="/landing/feature-photo-1.png"
                alt="Profissional analisando seu perfil"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-2xl font-semibold tracking-tight">
                <span className="text-primary">Análise </span>de Perfil
              </p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                Descubra como seu perfil está sendo apresentado
              </p>
              <div className="h-[3px] w-[69px] bg-primary" />
              <p className="max-w-xl text-base leading-7 text-[#2e2c2c]">
                O CareerTwin analisa seu currículo, LinkedIn e objetivo profissional para mostrar o que
                fortalece seu posicionamento e o que ainda precisa ser melhor comunicado.
              </p>
              <ul className="space-y-1 pt-2">
                {PROFILE_ANALYSIS_ITEMS.map((item) => (
                  <li key={item} className="flex items-end gap-4">
                    <CheckCheck className="h-6 w-6 shrink-0 text-primary" aria-hidden />
                    <span className="text-base leading-7 text-[#2e2c2c]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <hr className="border-border" />

          <div className="flex flex-col items-center gap-12 md:flex-row-reverse md:items-center">
            <div className="relative h-[280px] w-full shrink-0 overflow-hidden rounded-2xl md:h-[333px] md:w-[46%]">
              <Image
                src="/landing/feature-photo-2.png"
                alt="Profissional avaliando uma oportunidade"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-2xl font-semibold tracking-tight">
                <span className="text-primary">Diagnóstico de </span>Aderência
              </p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                Entenda o quanto uma oportunidade combina com seu perfil
              </p>
              <div className="h-[3px] w-[69px] bg-primary" />
              <p className="max-w-xl text-base leading-7 text-[#2e2c2c]">
                Compare sua trajetória com um cargo ou uma vaga específica e veja correspondências, lacunas e
                pontos de atenção antes de decidir se candidatar.
              </p>
              <ul className="space-y-1 pt-2">
                {FIT_DIAGNOSIS_ITEMS.map((item) => (
                  <li key={item} className="flex items-end gap-4">
                    <CheckCheck className="h-6 w-6 shrink-0 text-primary" aria-hidden />
                    <span className="text-base leading-7 text-[#2e2c2c]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Valores / autenticidade e confiança */}
        <section id="valores" className="px-6 py-20 md:px-14">
          <div className="mx-auto max-w-3xl space-y-14">
            <div className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">Autenticidade e confiança</h2>
              <p className="mt-4 text-muted-foreground">
                O CareerTwin não inventa experiências e não promete contratação. A proposta é ajudar você a
                comunicar melhor sua trajetória real e tomar decisões mais estratégicas.
              </p>
            </div>

            <div>
              <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground">
                O que você recebe
              </h2>
              <ul className="mx-auto mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
                {WHAT_YOU_GET.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-secondary/50 p-6 text-center">
              <h2 className="text-lg font-semibold text-foreground">Limitações do produto</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                O CareerTwin não garante entrevista nem contratação, não representa a decisão de recrutadores,
                não apresenta seus resultados como probabilidade de aprovação, não realiza candidatura
                automática e não funciona como job board ou ATS. A jornada acompanha você até a preparação e
                decisão de candidatura.
              </p>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="px-6 pb-20 md:px-14">
          <div className="flex flex-col items-center gap-8 rounded-2xl bg-foreground px-8 py-10 text-center text-white md:flex-row md:gap-16 md:text-left">
            <Image src="/landing/cta-rocket-launch.svg" alt="" width={94} height={94} className="shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
                Pronto para evoluir
                <br className="hidden md:block" /> com mais clareza?
              </p>
              <p className="text-lg">Crie sua conta gratuita e comece sua primeira análise.</p>
            </div>
            <Button asChild className="w-full shrink-0 md:w-auto">
              <Link href="/cadastro">
                <ArrowRight className="h-4 w-4" aria-hidden />
                Criar conta gratuita
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
