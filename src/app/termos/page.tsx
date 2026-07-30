import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = { title: "Termos de Uso — CareerTwin" };

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-foreground">Termos de Uso</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Conteúdo provisório — pendente de revisão jurídica antes da publicação (ver
          docs/implementation/open-decisions.md #11).
        </p>

        <div className="prose prose-neutral mt-8 max-w-none space-y-6 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-lg font-semibold">1. O que é o CareerTwin</h2>
            <p>
              O CareerTwin é um mentor de carreira com inteligência artificial que ajuda profissionais
              brasileiros de tecnologia, produto e design a compreender seu posicionamento e sua aderência a
              cargos e vagas, até a preparação e decisão de candidatura.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">2. Responsabilidades do usuário</h2>
            <p>
              Você é responsável pela veracidade das informações fornecidas (currículo, LinkedIn, dados de
              contexto profissional) e por revisar e confirmar as informações extraídas antes de utilizá-las
              em análises.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">3. Limitações do CareerTwin</h2>
            <p>
              O CareerTwin não garante entrevistas, aprovações ou contratações. Os índices apresentados (IPP
              e IAO) não representam probabilidade de contratação nem substituem a decisão de recrutadores.
              O produto não realiza candidatura automática e não funciona como job board ou ATS.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">4. Propriedade intelectual</h2>
            <p>
              As marcas, o design e o software do CareerTwin pertencem à CareerTwin. O conteúdo profissional
              que você envia permanece seu; ele é utilizado apenas para gerar suas próprias análises.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">5. Uso de inteligência artificial</h2>
            <p>
              O CareerTwin utiliza inteligência artificial para interpretar, estruturar e classificar suas
              informações profissionais. Índices, confiança e recomendações finais são calculados de forma
              determinística pelo backend, não livremente pela IA.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">6. Suspensão e exclusão de conta</h2>
            <p>
              Você pode solicitar a exclusão da sua conta a qualquer momento em Conta → Privacidade →
              Solicitar exclusão. Consulte a Política de Privacidade para os prazos aplicáveis.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
