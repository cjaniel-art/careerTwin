import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = { title: "Política de Privacidade — CareerTwin" };

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-foreground">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Conteúdo provisório — pendente de revisão jurídica antes da publicação (ver
          docs/implementation/open-decisions.md #11). Reflete as regras vigentes do documento interno
          &ldquo;Segurança, Privacidade e Retenção&rdquo;.
        </p>

        <div className="prose prose-neutral mt-8 max-w-none space-y-6 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-lg font-semibold">1. Dados que coletamos</h2>
            <p>
              Dados pessoais mínimos (nome completo obrigatório; cidade e estado opcionais). Não coletamos
              data de nascimento, CEP ou endereço residencial completo. Dados profissionais extraídos do seu
              currículo e LinkedIn, sempre revisáveis e corrigíveis por você antes da confirmação.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">2. Como usamos seus dados</h2>
            <p>
              Dados pessoais nunca influenciam os índices IPP e IAO, a confiança das análises ou as
              recomendações. Eles são armazenados separadamente dos dados profissionais e não são enviados à
              inteligência artificial sem necessidade explícita.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">3. Retenção</h2>
            <p>
              Arquivos originais enviados (currículo, LinkedIn, vaga) são temporários e excluídos em até 24
              horas após o processamento ser concluído com segurança. Dados estruturados e confirmados
              permanecem enquanto sua conta estiver ativa. Logs técnicos sem conteúdo profissional são
              mantidos por até 30 dias.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">4. Exclusão de conta</h2>
            <p>
              Ao solicitar a exclusão da sua conta, buscamos concluir a remoção nos sistemas ativos em até 15
              dias e a remoção/expiração em backups em até 30 dias, conforme metas operacionais vigentes.
              Alguns registros podem ser mantidos temporariamente por obrigação legal, segurança, prevenção
              de fraude ou auditoria — você será informado quando isso se aplicar.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">5. Segurança</h2>
            <p>
              Seus documentos são armazenados em local privado, com acesso controlado por autenticação e
              autorização. Nunca compartilhamos seus documentos ou dados profissionais com outros usuários.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">6. Seus direitos</h2>
            <p>
              Você pode revisar, corrigir, exportar informações do seu perfil e solicitar a exclusão da sua
              conta a qualquer momento pelas configurações da conta.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
