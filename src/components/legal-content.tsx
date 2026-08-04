/** Conteúdo provisório — pendente de revisão jurídica antes da publicação (ver docs/implementation/open-decisions.md #11). */
export function TermsContent() {
  return (
    <div className="prose prose-neutral max-w-none space-y-6 text-sm leading-relaxed text-foreground">
      <section>
        <h2 className="text-lg font-semibold">1. O que é o CareerTwin</h2>
        <p>
          O CareerTwin é um mentor de carreira com inteligência artificial que ajuda profissionais brasileiros de
          tecnologia, produto e design a compreender seu posicionamento e sua aderência a cargos e vagas, até a
          preparação e decisão de candidatura.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">2. Responsabilidades do usuário</h2>
        <p>
          Você é responsável pela veracidade das informações fornecidas (currículo, LinkedIn, dados de contexto
          profissional) e por revisar e confirmar as informações extraídas antes de utilizá-las em análises.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">3. Limitações do CareerTwin</h2>
        <p>
          O CareerTwin não garante entrevistas, aprovações ou contratações. Os índices apresentados (IPP e IAO)
          não representam probabilidade de contratação nem substituem a decisão de recrutadores. O produto não
          realiza candidatura automática e não funciona como job board ou ATS.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">4. Propriedade intelectual</h2>
        <p>
          As marcas, o design e o software do CareerTwin pertencem à CareerTwin. O conteúdo profissional que você
          envia permanece seu; ele é utilizado apenas para gerar suas próprias análises.
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
          Você pode solicitar a exclusão da sua conta a qualquer momento em Conta → Privacidade → Solicitar
          exclusão. Consulte a Política de Privacidade para os prazos aplicáveis.
        </p>
      </section>
    </div>
  );
}

/** Conteúdo provisório — pendente de revisão jurídica antes da publicação (ver docs/implementation/open-decisions.md #11). Reflete as regras vigentes do documento interno "Segurança, Privacidade e Retenção". */
export function PrivacyContent() {
  return (
    <div className="prose prose-neutral max-w-none space-y-6 text-sm leading-relaxed text-foreground">
      <section>
        <h2 className="text-lg font-semibold">1. Dados que coletamos</h2>
        <p>
          Dados pessoais mínimos (nome completo obrigatório; cidade e estado opcionais). Não coletamos data de
          nascimento, CEP ou endereço residencial completo. Dados profissionais extraídos do seu currículo e
          LinkedIn, sempre revisáveis e corrigíveis por você antes da confirmação.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">2. Como usamos seus dados</h2>
        <p>
          Dados pessoais nunca influenciam os índices IPP e IAO, a confiança das análises ou as recomendações.
          Eles são armazenados separadamente dos dados profissionais e não são enviados à inteligência artificial
          sem necessidade explícita.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">3. Retenção</h2>
        <p>
          Arquivos originais enviados (currículo, LinkedIn, vaga) são temporários e excluídos em até 24 horas
          após o processamento ser concluído com segurança. Dados estruturados e confirmados permanecem enquanto
          sua conta estiver ativa. Logs técnicos sem conteúdo profissional são mantidos por até 30 dias.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">4. Exclusão de conta</h2>
        <p>
          Ao solicitar a exclusão da sua conta, buscamos concluir a remoção nos sistemas ativos em até 15 dias e
          a remoção/expiração em backups em até 30 dias, conforme metas operacionais vigentes. Alguns registros
          podem ser mantidos temporariamente por obrigação legal, segurança, prevenção de fraude ou auditoria —
          você será informado quando isso se aplicar.
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
          Você pode revisar, corrigir, exportar informações do seu perfil e solicitar a exclusão da sua conta a
          qualquer momento pelas configurações da conta.
        </p>
      </section>
    </div>
  );
}
