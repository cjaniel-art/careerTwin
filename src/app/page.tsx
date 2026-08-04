import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCheck, Lock, Plus } from "lucide-react";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";
import { Button } from "@/components/ui/button";

const HOW_IT_WORKS = [
  {
    icon: "/landing/icon-mode-portrait.svg",
    title: "1. Entenda sua rota",
    description: "Avalie seu momento atual e receba uma análise personalizada sobre seus objetivos.",
  },
  {
    icon: "/landing/icon-rocket-launch.svg",
    title: "2. Defina seu norte",
    description: "Monte um plano de carreira sob medida com metas claras e trilhas recomendadas.",
  },
  {
    icon: "/landing/icon-sparkles.svg",
    title: "3. Adquira o conhecimento",
    description: "Acesse conteúdos, cursos e mentorias práticos para desenvolver habilidades que geram valor.",
  },
  {
    icon: "/landing/icon-trophy.svg",
    title: "4. Conquiste seu lugar",
    description: "Avalie seu momento atual e receba uma análise personalizada sobre seus objetivos.",
  },
];

const CHALLENGE_ITEMS = [
  {
    title: "Seu perfil não mostra tudo o que você entrega",
    description:
      "Experiências valiosas podem perder força quando aparecem de forma genérica, sem contexto, impacto ou evidências.",
  },
  {
    title: "Você tenta melhorar sem saber por onde começar",
    description:
      "Currículo, LinkedIn, competências e posicionamento exigem ajustes diferentes. Sem direção, é fácil investir tempo no que gera pouco resultado.",
  },
  {
    title: "Cada candidatura parece uma aposta",
    description:
      "Sem entender a aderência entre seu perfil e a oportunidade, fica mais difícil saber onde você tem mais força e o que precisa ajustar.",
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

export default function HomePage() {
  return (
    <>
      <main>
        {/* Hero — foge do limite global de 1440px (único bloco full-bleed do site, por pedido explícito) */}
        <section className="relative ml-[calc(50%-50vw)] w-screen overflow-hidden bg-foreground text-white">
          {/* Header flutua transparente sobre o hero, sem fundo próprio */}
          <LandingHeader />
          {/* Mobile: altura segue a proporção natural do asset dedicado; botão fica na faixa inferior, após a foto */}
          <div className="relative md:hidden">
            <Image
              src="/landing/hero-mobile.svg"
              alt=""
              width={428}
              height={942}
              priority
              className="block h-auto w-full"
            />
            <div className="absolute inset-0 flex flex-col px-6 pb-6 pt-[158px]">
              <div className="max-w-xl">
                <h1 className="whitespace-nowrap text-[11vw] font-medium leading-[normal] tracking-normal">
                  Evolua.
                  <br />
                  Reposicione-se.
                  <br />
                  <span className="text-primary">Conquiste</span>
                </h1>
                <p className="mt-[3.7vw] text-[3.1vw] font-semibold leading-[4.3vw] tracking-[-0.0657px] text-white">
                  Clareza sobre seu perfil, direção para sua carreira e decisões melhores antes de se candidatar.
                </p>
              </div>
              <Button asChild className="mt-auto h-auto w-full rounded-md px-4 py-2 text-sm">
                <Link href="/cadastro">
                  <ArrowRight className="h-4 w-4" aria-hidden />
                  Começe agora
                </Link>
              </Button>
            </div>
          </div>

          {/* Desktop */}
          <div className="relative hidden md:block">
            <Image
              src="/landing/hero.svg"
              alt=""
              width={1440}
              height={813}
              priority
              className="pointer-events-none absolute right-0 top-0"
            />
            <div className="relative mx-auto max-w-content px-14 pb-32 pt-[242px]">
              <div className="relative max-w-xl">
                <h1 className="text-7xl font-medium leading-[normal] tracking-normal">
                  Evolua.
                  <br />
                  Reposicione-se.
                  <br />
                  <span className="text-primary">Conquiste</span>
                </h1>
                <p className="mt-6 text-xl font-semibold leading-7 tracking-[-0.1px] text-white">
                  Clareza sobre seu perfil, direção para sua carreira e decisões melhores antes de se candidatar.
                </p>
                <Button asChild className="mt-[27px] h-auto rounded-md px-4 py-2 text-sm">
                  <Link href="/cadastro">
                    <ArrowRight className="h-4 w-4" aria-hidden />
                    Começe agora
                  </Link>
                </Button>
                <p className="mt-[27px] flex items-center gap-2 text-sm font-medium text-white/80">
                  <Lock className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  Rápido <span className="text-primary">•</span> Seguro <span className="text-primary">•</span>{" "}
                  Sem complicação
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* O desafio — foto sangra até a borda da viewport no desktop, como no Figma */}
        <section className="pt-20 pb-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-6">
            <div className="order-2 relative h-[280px] w-full overflow-hidden lg:order-1 lg:h-auto lg:w-1/2 lg:min-h-[420px] lg:rounded-r-[88px]">
              <Image
                src="/landing/desafio-photo.png"
                alt="Profissional refletindo sobre sua trajetória"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="contents lg:order-2 lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:gap-[36px]">
              <div className="order-1 px-6 md:px-14 lg:px-0 lg:pl-16 lg:pr-14">
                <p className="text-2xl font-semibold tracking-tight text-primary">O desafio</p>
                <p className="text-3xl font-semibold tracking-tight text-foreground">
                  Seu talento pode ser maior do que o seu perfil demonstra
                </p>
                <div className="mt-[13px] h-[3px] w-[69px] bg-primary" />
                <p className="mt-[13px] text-base leading-7 text-[#2e2c2c]">
                  Currículo, LinkedIn e objetivo profissional nem sempre contam a mesma história. Sem um
                  diagnóstico claro, fica difícil entender o que está limitando seu posicionamento e o que
                  melhorar primeiro.
                </p>
              </div>
              <div className="order-3 flex flex-col gap-[14px] px-6 md:px-14 lg:px-0 lg:pl-16 lg:pr-14">
                {CHALLENGE_ITEMS.map((item, index) => (
                  <div key={item.title} className="contents">
                    {index > 0 ? <div className="h-px w-full bg-border" /> : null}
                    <div className="border-l-[3px] border-primary pl-6">
                      <p className="text-xl font-semibold tracking-tight text-foreground">{item.title}</p>
                      <p className="mt-1 text-base leading-7 text-[#2e2c2c]">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-[34px] px-6 md:px-[176px]">
            <div className="mx-auto flex max-w-content flex-col items-center gap-[30px] text-center md:flex-row md:items-center md:text-left">
              <Image
                src="/landing/icon-quote-right.svg"
                alt=""
                width={96}
                height={96}
                className="h-20 w-20 shrink-0 md:h-24 md:w-24"
              />
              <p className="text-2xl font-semibold leading-snug tracking-tight text-foreground">
                O problema nem sempre é falta de experiência. Muitas vezes, ela está mal organizada, pouco
                evidenciada ou desconectada do seu objetivo profissional.
              </p>
            </div>
          </div>
        </section>

        <div className="px-6 md:px-14">
          <hr className="mx-auto max-w-content border-border" />
        </div>

        {/* Como funciona */}
        <section id="como-funciona" className="px-6 py-16 md:px-14">
          <div className="mx-auto max-w-content">
            <div className="flex flex-col items-center gap-[11px] text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Como <span className="text-primary">funciona</span>
              </h2>
              <p className="text-lg font-semibold text-foreground">
                Um processo simples para transformar clareza em ação.
              </p>
            </div>
            <div className="mt-6">
              <div className="-mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
                {HOW_IT_WORKS.map((step) => (
                  <div
                    key={step.title}
                    className="flex w-[85%] shrink-0 snap-center flex-col items-center gap-7 rounded-lg border border-border px-6 py-14 text-center sm:w-auto sm:shrink"
                  >
                    <Image src={step.icon} alt="" width={104} height={104} />
                    <div className="space-y-[11px]">
                      <p className="text-xl font-semibold tracking-tight text-foreground">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center gap-2 sm:hidden">
                {HOW_IT_WORKS.map((step, index) => (
                  <span
                    key={step.title}
                    className={`h-[13px] w-[13px] rounded-full ${index === 0 ? "bg-primary" : "bg-[#d6d6d6]"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="px-6 md:px-14">
          <hr className="mx-auto max-w-content border-border" />
        </div>

        {/* Nossa solução — Core 1 e Core 2 — fotos sangram até a borda da viewport no desktop, como no Figma */}
        <section id="solucao" className="space-y-9 pb-20 pt-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-6">
            <div className="contents lg:order-1 lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:gap-[13px]">
              <div className="order-1 px-6 md:px-14 lg:px-0 lg:pl-14 lg:pr-16">
                <p className="text-2xl font-semibold tracking-tight">
                  <span className="text-primary">Análise </span>de Perfil
                </p>
                <p className="text-3xl font-semibold tracking-tight text-foreground">
                  Descubra como seu perfil está sendo apresentado
                </p>
                <div className="mt-[13px] h-[3px] w-[69px] bg-primary" />
                <p className="mt-[13px] max-w-xl text-base leading-7 text-[#2e2c2c]">
                  O CareerTwin analisa seu currículo, LinkedIn e objetivo profissional para mostrar o que
                  fortalece seu posicionamento e o que ainda precisa ser melhor comunicado.
                </p>
              </div>
              <ul className="order-3 space-y-1 px-6 md:px-14 lg:px-0 lg:pl-14 lg:pr-16">
                {PROFILE_ANALYSIS_ITEMS.map((item) => (
                  <li key={item} className="flex items-end gap-4">
                    <CheckCheck className="h-6 w-6 shrink-0 text-primary" aria-hidden />
                    <span className="text-base leading-7 text-[#2e2c2c]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-2 relative h-[280px] w-full overflow-hidden lg:order-2 lg:h-auto lg:w-1/2 lg:min-h-[325px] lg:rounded-l-[88px]">
              <Image
                src="/landing/feature-photo-1.png"
                alt="Profissional analisando seu perfil"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch">
            <div className="order-2 relative h-[280px] w-full overflow-hidden lg:order-1 lg:h-auto lg:w-1/2 lg:min-h-[333px] lg:rounded-r-[88px]">
              <Image
                src="/landing/feature-photo-2.png"
                alt="Profissional avaliando uma oportunidade"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="contents lg:order-2 lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:gap-3">
              <div className="order-1 px-6 md:px-14 lg:px-0 lg:pl-16 lg:pr-14">
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  Diagnóstico de <span className="text-primary">Aderência</span>
                </p>
                <p className="text-3xl font-semibold tracking-tight text-foreground">
                  Entenda o quanto uma oportunidade combina com seu perfil
                </p>
                <div className="mt-3 h-[3px] w-[69px] bg-primary" />
                <p className="mt-3 max-w-xl text-base leading-7 text-[#2e2c2c]">
                  Compare sua trajetória com um cargo ou uma vaga específica e veja correspondências, lacunas e
                  pontos de atenção antes de decidir se candidatar.
                </p>
              </div>
              <ul className="order-3 space-y-1 px-6 md:px-14 lg:px-0 lg:pl-16 lg:pr-14">
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

        {/* CTA final */}
        <section className="px-6 pb-20 md:px-14">
          <div className="mx-auto flex max-w-content flex-col items-center gap-[30px] rounded-2xl bg-foreground px-8 py-8 text-center text-white md:flex-row md:px-12 md:text-left">
            <Image src="/landing/cta-rocket-launch.svg" alt="" width={94} height={94} className="shrink-0" />
            <div className="flex-1 space-y-[11px]">
              <p className="text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
                Pronto para evoluir com mais clareza?
              </p>
              <p className="text-lg">Crie sua conta gratuita e comece sua primeira análise.</p>
            </div>
            <Button asChild className="h-auto w-full shrink-0 rounded-md px-4 py-2 text-sm md:w-auto">
              <Link href="/cadastro">
                <Plus className="h-4 w-4" aria-hidden />
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
