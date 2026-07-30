# Extração — Estratégia e Produto (CareerTwin)

Documento de extração estruturada, gerado por leitura completa de 6 fontes canônicas da pasta "Estratégia" e "Insumos para Desenvolvimento". Todos os termos de domínio foram preservados em português. Números, campos, enums e limiares foram mantidos exatamente como no original.

---

## Fontes

| # | Documento | Caminho | Propósito | Data/Versão interna |
|---|---|---|---|---|
| 1 | Decision Log | `Estratégia - Direção, posicionamento e decisões do projeto/Decision Log 3ab7f20949da8088b488d99a9f2b7809.md` | Registro oficial de decisões do projeto, com regra de precedência entre documentos. **Segunda fonte de maior precedência**, atrás apenas de decisões recentes do Product Owner. | Criado em: 27 de julho de 2026 23:12 |
| 2 | Hipóteses | `Estratégia - Direção, posicionamento e decisões do projeto/Hipóteses 3ab7f20949da80bdbbd6eea23b445b80.md` | Lista as hipóteses prioritárias de valor do produto e a estrutura de campos para rastreá-las. | Criado em: 27 de julho de 2026 23:12 |
| 3 | Modelo de Negócio | `Estratégia - Direção, posicionamento e decisões do projeto/Modelo de Negócio 3ab7f20949da80eda444fd4bda5b3a25.md` | Define o modelo B2C, a experiência gratuita, a oferta simulada de créditos e os princípios de monetização. | Criado em: 27 de julho de 2026 23:12 |
| 4 | VICP e Público-Alvo | `Estratégia - Direção, posicionamento e decisões do projeto/VICP e Público-Alvo 3ab7f20949da80e8a51aeffc82b8d18e.md` | Define o público-alvo inicial, situações atendidas, necessidades e exclusões do ICP. | Criado em: 27 de julho de 2026 23:11 |
| 5 | Visão e Estratégia do Produto | `Estratégia - Direção, posicionamento e decisões do projeto/Visão e Estratégia do Produto 3ab7f20949da809bbfbdef4b1578fb35.md` | Declaração de visão, problema, proposta de valor, posicionamento, estratégia inicial e princípios (o que o produto deve/não deve fazer). | Criado em: 27 de julho de 2026 23:10 |
| 6 | Product One Page | `Insumos para Desenvolvimento/Product One Page 3aa7f20949da8068860bd07076322b3f.md` | Documento executivo mestre — visão geral, problema, público, proposta de valor, fluxo completo, todas as seções funcionais (site, cadastro, onboarding, Thin Twin, Core 1, Core 2, dashboard, histórico, reanálise, feedback, modelo de negócio, métricas, princípios, riscos, critérios de sucesso, fora de escopo). | Criado em: 27 de julho de 2026 16:52; **Versão da One Page: 1.2**; **Última atualização: 29 de julho de 2026** |

Nota sobre precedência declarada nos próprios documentos (Decision Log e Product One Page, seção "Regra de precedência"): 1) decisões mais recentes do Product Owner; 2) Decision Log; 3) Fonte Canônica de Contexto (não lida nesta extração — não estava entre os 6 arquivos fornecidos); 4) Product One Page; 5) PRDs; 6) documentos técnicos (Motor, Thin Twin, Modelo de Dados, Prompts, Schemas, Arquitetura, Analytics); 7) pesquisas, pitches, protótipos e versões antigas.

Campo **Product Owner** no Product One Page está com valor placeholder não preenchido: `[Nome do Product Owner]` — ver seção "Conflitos ou ambiguidades internas".

---

## Decision Log (approved decisions)

**Observação estrutural importante:** o documento Decision Log define um *schema* de campos por decisão (ID; título; contexto; decisão; justificativa; impacto; responsável; data; status; documentos afetados; decisão substituída) e um enum de status (`proposta`, `aprovada`, `substituída`, `revogada`) destinado a entradas individuais futuras. No entanto, o conteúdo atual do documento **não popula esse schema por item** — ele apresenta uma lista única de 35 "Decisões consolidadas" em formato de bullets, sem ID, data ou status individuais atribuídos a cada uma. Portanto, não há um "status verbatim" per-entrada disponível no documento; todas as 35 devem ser tratadas como o conjunto de decisões atualmente vigente (funcionalmente equivalentes a `aprovada`/consolidada), até que sejam formalmente migradas para o schema individual. Isso deve ser tratado como uma lacuna documental, não como uma inferência de status.

Lista completa e literal das 35 decisões consolidadas (numeração adicionada nesta extração para rastreabilidade; texto original preservado):

1. nome oficial: CareerTwin;
2. categoria: mentor de carreira com inteligência artificial;
3. mercado inicial: Brasil;
4. modelo inicial: B2C;
5. público inicial: profissionais de tecnologia, produto e design;
6. jornada coberta: preparação e decisão antes da candidatura;
7. o produto possui somente dois módulos core;
8. Core 1: Análise de Perfil, com IPP;
9. Core 2: Diagnóstico de Aderência, com IAO;
10. currículo e LinkedIn são obrigatórios para a criação do perfil no MVP;
11. nome completo é obrigatório;
12. cidade e estado são opcionais;
13. data de nascimento, CEP e endereço residencial completo não serão coletados no MVP;
14. dados pessoais não influenciam IPP, IAO, confiança ou recomendações;
15. o Thin Twin profissional é persistente, confirmado, rastreável e versionado;
16. o objetivo profissional é mantido em um contexto-alvo versionado separadamente do Thin Twin;
17. o Core 1 é a sequência recomendada após o onboarding, mas não é pré-condição técnica obrigatória do Core 2;
18. o IPP utiliza sete dimensões com pesos de 15%, 20%, 20%, 15%, 10%, 10% e 10%;
19. as dimensões do IPP utilizam rubrica de zero a quatro;
20. o IAO é calculado requisito a requisito, considerando criticidade, correspondência, confiança da extração e limites de segurança;
21. score e confiança são sempre calculados e apresentados separadamente;
22. scores não representam probabilidade de entrevista, aprovação ou contratação;
23. a inteligência artificial interpreta, estrutura, classifica e explica;
24. o backend valida contratos e calcula scores, confiança, prioridade e limites de forma determinística;
25. recomendações devem estar relacionadas a evidências ou lacunas identificadas;
26. o CareerTwin não pode inventar experiências, resultados, métricas, competências ou senioridade;
27. dashboard, histórico, ações, créditos e conta são funcionalidades de apoio;
28. o PRD 04 permanecerá fora do escopo por enquanto;
29. não haverá pagamento real no MVP;
30. créditos e oferta poderão ser simulados para validar intenção de compra;
31. falhas técnicas e reprocessamentos não consomem créditos;
32. relatórios já gerados permanecem acessíveis;
33. a métrica principal será a Taxa de Análise Acionável;
34. o prazo gratuito para reanálise da mesma vaga permanece como decisão pendente e não deverá ser definido silenciosamente na implementação; **(status funcional: pendente, explicitamente aberta — não confundir com as demais, que são consolidadas)**;
35. decisões técnicas apresentadas como baseline somente se tornam definitivas após aprovação neste Decision Log.

Regra de encerramento do log: quando uma decisão for alterada, o registro anterior deve receber o status **substituída** ou **revogada**, preservando rastreabilidade. Não há, no conteúdo atual, nenhuma decisão marcada como substituída ou revogada.

---

## Product One Page — resumo canônico

**Ficha (seção 1 — Visão geral):**

| Campo | Valor |
|---|---|
| Produto | CareerTwin |
| Categoria | Mentor de carreira com inteligência artificial |
| Modelo de negócio | B2C |
| Mercado inicial | Brasil |
| Público inicial | Profissionais de tecnologia, produto e design |
| Plataforma | Aplicação web responsiva |
| Idioma inicial | Português do Brasil |
| Escopo da jornada | Até a preparação e decisão de candidatura |
| Funcionalidades core | Core 1 e Core 2 |
| Fase atual | Preparação para implementação do MVP |
| Status da validação | Hipóteses ainda não validadas com usuários |
| Product Owner | `[Nome do Product Owner]` (placeholder não preenchido) |
| Versão da One Page | 1.2 |
| Última atualização | 29 de julho de 2026 |

**O que é:** mentor de carreira com inteligência artificial para profissionais de tecnologia, produto e design. Ajuda o usuário a compreender e melhorar seu posicionamento, comunicar melhor experiências reais e avaliar aderência a cargos/vagas **antes da candidatura**.

**Para quem é:** ver seção ICP abaixo.

**O que NÃO faz / não é (consolidado das seções "não deverá" e "fora do escopo"):**
- não inventa experiências, competências, resultados ou métricas;
- não promete entrevistas, aprovações ou contratações;
- não apresenta scores como probabilidade de contratação/aprovação/entrevista;
- não substitui recrutadores;
- não atua como job board, ATS, plataforma de recrutamento ou candidatura automática;
- não faz busca automática de vagas, scraping do LinkedIn, leitura automática de URL;
- não faz preparação para entrevistas, simulador de entrevistas, networking, mensagens a recrutadores, negociação de ofertas, acompanhamento pós-contratação, coaching humano;
- não edita diretamente currículo/LinkedIn nem gera/exporta currículo completo;
- não é app mobile nativo; não é B2B/B2B2C;
- não há pagamento real, assinatura recorrente real, integração de meios de pagamento ou coleta de dados de cartão no MVP;
- não faz comparação entre usuários, ranking, gamificação;
- não faz orientação vocacional completa nem recomendação definitiva de carreira;
- não atua depois da decisão de candidatura no MVP (lista completa "Fora do escopo do MVP" na seção 28).

**Estrutura oficial do produto — exatamente dois módulos core:**
1. **Core 1 — Análise de Perfil** (com IPP — Índice de Prontidão do Perfil);
2. **Core 2 — Diagnóstico de Aderência** (com IAO — Índice de Aderência Observável).

Funcionalidades/superfícies de apoio (explicitamente **não** core): site; cadastro e autenticação; onboarding; Thin Twin; contexto-alvo; dashboard; histórico; recomendações; ações; reanálise; feedback; créditos; ofertas simuladas; gestão da conta.

**Monetização (básico — ver seção dedicada "Modelo de Negócio" abaixo para detalhes):** B2C, acesso individual, monetização por créditos após entrega inicial de valor; oferta simulada "Pacote Novas Oportunidades"; sem pagamento real no MVP.

**Posicionamento:** mentor de carreira com IA que ajuda a compreender apresentação do perfil, melhorar comunicação de currículo/LinkedIn, diferenciar lacunas reais de problemas de comunicação/evidência, priorizar ações, avaliar aderência observável a cargos/vagas, e decidir prioridades antes da candidatura.

**Tese central (seção 2 — Problema):**
> "Em muitos casos, a experiência existe, mas está mal organizada, pouco evidenciada ou desconectada do objetivo profissional."

O produto diferencia: desenvolvimento de competência; desenvolvimento de experiência; melhoria de comunicação; melhoria de evidência; ajuste de posicionamento; revisão do contexto-alvo; incompatibilidade objetiva com um requisito.

**Fluxo principal (seção 6):**
> Site → Cadastro e autenticação → Onboarding → Currículo e LinkedIn → Revisão e confirmação do Thin Twin → Definição do contexto-alvo → Core 1 → Core 2 → Ações e reanálises

Fluxo resumido: Site → Onboarding → Core 1 → Core 2. Revisão do Thin Twin e definição do contexto-alvo são etapas obrigatórias mesmo não aparecendo no fluxo resumido.

Relação Core 1 / Core 2: Core 1 recomendado antes, mas **não é dependência técnica obrigatória** do Core 2. Core 2 por vaga depende de Thin Twin confirmado + vaga válida. Core 2 por cargo depende também de contexto-alvo e referência de cargo aprovados.

**Definição resumida do MVP (seção 30, literal):**
> "O usuário acessa o CareerTwin, cria sua conta, envia currículo e LinkedIn, revisa e confirma uma versão do seu Thin Twin, define um contexto-alvo separado e versionado, utiliza o Core 1 para compreender e melhorar seu posicionamento e utiliza o Core 2 para avaliar sua aderência a um cargo ou vaga antes de decidir se deve priorizar uma candidatura."

### Detalhamento funcional relevante do Product One Page (para requisitos)

**Dados pessoais coletados no MVP:** nome completo (obrigatório); cidade (opcional); estado (opcional). **Não coletados:** data de nascimento; CEP; logradouro; número; complemento; bairro; endereço residencial completo. Dados pessoais não fazem parte do Thin Twin, não influenciam IPP/IAO/confiança/recomendações/senioridade/prioridade de candidatura, não são enviados à IA sem necessidade, e são armazenados separadamente dos dados profissionais. Cidade/estado só podem ser usados em análise de requisito geográfico com autorização do usuário + requisito geográfico explícito na oportunidade + finalidade informada + regra registrada em documento aplicável.

**Currículo:** obrigatório. Entradas aceitas: PDF; DOCX; texto colado. Sistema deve validar tipo/tamanho, verificar integridade, rejeitar arquivos protegidos não processáveis, analisar segurança, extrair texto, usar OCR quando aplicável, identificar conteúdo insuficiente, evitar duplicados, manter rastreabilidade, excluir arquivo original conforme política de retenção.

**LinkedIn:** obrigatório. Entradas aceitas: PDF exportado; texto colado. URL pública pode ser registrada como referência, mas **não é acessada automaticamente** nem usada como única fonte no MVP. MVP explicitamente **não realiza**: scraping do LinkedIn; login em conta do LinkedIn; navegação automática em perfil público; edição direta do perfil.

**Thin Twin:** estrutura persistente, rastreável e versionada. Pode conter: experiências; cargos; empresas; períodos; responsabilidades; projetos; entregas; competências; ferramentas; resultados; formação; certificações; evidências profissionais; áreas de atuação observadas; sinais observáveis de senioridade; conflitos entre fontes; origem das informações; histórico de versões. Competências e ferramentas armazenadas separadamente. Cada informação relevante mantém: fonte; trecho mínimo de evidência; confiança da extração; estado de confirmação; versão correspondente.
NÃO fazem parte do Thin Twin: nome; e-mail; cidade; estado; dados de autenticação; objetivo profissional; cargo-alvo; senioridade desejada; preferências de oportunidade; vaga analisada.
Confirmação cria versão imutável; versões anteriores não são sobrescritas e permanecem vinculadas às análises que as usaram. Inferência da IA não pode ser armazenada como fato confirmado.

**Contexto-alvo:** separado do Thin Twin, versionamento próprio, gera `target_context_version`. Contém: área de interesse; cargo-alvo; especialidade (quando aplicável); senioridade desejada. Pode ser alterado sem criar nova versão do Thin Twin. Sistema pode sugerir cargos relacionados (não são fatos, não são orientação vocacional definitiva, precisam confirmação do usuário).

**Core 1 — IPP (Índice de Prontidão do Perfil):**

| Dimensão | Peso |
|---|---|
| Clareza do objetivo profissional | 15% |
| Qualidade das experiências | 20% |
| Evidências e resultados | 20% |
| Competências e ferramentas | 15% |
| Consistência entre fontes | 10% |
| Qualidade do posicionamento | 10% |
| Completude do perfil | 10% |

Rubrica por dimensão: 0 a 4. Backend valida níveis, aplica pesos, calcula contribuições, normaliza, calcula IPP, aplica faixa correspondente, registra versões. IA não retorna o IPP final como fonte de verdade. Confiança calculada e apresentada separadamente; **confiança não altera matematicamente o IPP**. IPP não representa: valor profissional; empregabilidade; probabilidade de entrevista/contratação; decisão de recrutadores; comparação absoluta entre pessoas.

**Recomendações do Core 1 — 4 categorias canônicas:** Competência; Comunicação; Evidência; Posicionamento. Cada recomendação tem: categoria; título; problema; ação sugerida; justificativa; evidência (ou indicação de ausência); impacto; esforço; urgência; confiança; prioridade; critério de conclusão. Impacto/esforço/urgência/confiança em escala 1–5. Limites: até 8 recomendações; até 3 em destaque; até 5 ações no plano principal. Backend valida valores, calcula prioridade, ordena, consolida duplicadas — IA não define livremente a prioridade final.

**Plano de ações do Core 1:** até 5 ações prioritárias. Status possíveis: pendente; em andamento; concluída. Selecionar/iniciar/concluir ações **não altera retroativamente** o IPP já calculado; reanálise gera novo resultado.

**Core 2 — IAO (Índice de Aderência Observável):** calculado requisito a requisito, considerando criticidade, peso, estado de correspondência, fator, confiança, contribuição, evidências, tipo de lacuna. Backend valida requisitos, exclui não aplicáveis, aplica pesos, normaliza, calcula IAO, aplica limites, calcula confiança separadamente, valida recomendação, registra versões. IA não retorna o IAO final como fonte de verdade. IAO não representa: probabilidade de entrevista/contratação; decisão do recrutador; valor profissional; garantia de candidatura adequada.

Categorias de requisito da vaga: competência; ferramenta; experiência; responsabilidade; formação; certificação; senioridade; escopo; localização; idioma; outro.
Criticidade do requisito: obrigatório; desejável; diferencial; complementar; impeditivo.
Estados possíveis por requisito: correspondência confirmada; correspondência parcial; lacuna de comunicação; lacuna de evidência; desconhecido; não observado; incompatibilidade confirmada. ("Não observado" ≠ ausência confirmada; "incompatibilidade confirmada" exige evidência/confirmação suficiente.)

Tipos de lacuna (Core 2): Competência; Experiência; Formação ou certificação; Comunicação; Evidência; Posicionamento; Desconhecida.

Recomendação por cargo-alvo (uma das 5): pronto para priorizar; priorizar com ajustes; desenvolver antes de priorizar; reavaliar contexto-alvo; dados insuficientes. Quando não existir referência de cargo aprovada, resultado deve ser "Dados insuficientes" (referência não pode ser criada silenciosamente durante a análise).

Recomendação sobre candidatura a vaga específica (uma das 5): aplicar agora; aplicar com ajustes; desenvolver lacunas antes de aplicar; não priorizar esta vaga neste momento; dados insuficientes. Regras determinísticas/limites prevalecem sobre recomendação textual da IA; precedência detalhada fica no Motor de Análise e Scores (documento não lido nesta extração). Interface **não pode** usar a frase "Não se candidate." — decisão final sempre com o usuário.

**Dashboard:** não é terceira funcionalidade core; não é fonte de verdade dos dados; reflete estados persistidos pelo backend; não recalcula scores no frontend.

**Histórico/versionamento:** cada análise registra, quando aplicável: `thin_twin_version`; `target_context_version`; versão da oportunidade; versão da referência de cargo; versão do motor; versão da rubrica; versão do prompt; versão do schema; versão da configuração. Análises anteriores não são sobrescritas; alteração de contexto-alvo não cria nova versão do Thin Twin.

**Reanálise:** congela novas versões de entrada; cria novo resultado; preserva relatório anterior; registra versões usadas; compara apenas quando entradas comparáveis; evita duplicação; respeita idempotência. Regras de créditos: erro técnico não consome crédito; reprocessamento técnico não consome novo crédito; tentativa automática não consome crédito; relatório já gerado não exige crédito para reabrir; atualizar ações/feedback não consome crédito; análise idêntica reutilizada não consome novo crédito. **Pendente:** existência e duração de um período gratuito para reanálise da mesma vaga — "Nenhum período deverá ser implementado silenciosamente pelo Claude Code."

**Feedback pós-análise:**
- Utilidade (escala 1–5): 1 nada útil; 2 pouco útil; 3 parcialmente útil; 4 útil; 5 muito útil.
- Especificidade (respostas): sim; parcialmente; não.
- Comportamento pretendido: recomendação selecionada; primeira ação pretendida; intenção de candidatura; clareza da recomendação; confiança para tomar decisão; comentário opcional.
- Regras: feedback não altera IPP nem IAO nem a recomendação já emitida; comentário não é tratado como fato profissional; comentários livres ficam no banco operacional protegido e não são enviados integralmente ao analytics externo; mesmo envio não gera eventos duplicados.

---

## ICP / VICP e Público-Alvo

**Definição literal (VICP e Público-Alvo, bloco de destaque):**
> "Profissionais brasileiros, de estágio a sênior, que atuam ou desejam atuar em tecnologia, produto ou design, estão em recolocação, transição ou busca por uma oportunidade melhor, já possuem currículo e LinkedIn e enfrentam dificuldade para compreender, comunicar e melhorar seu posicionamento profissional."

Definição equivalente e mais detalhada no Product One Page (seção 3):
> "Profissionais brasileiros, de estágio a sênior, que atuam ou desejam atuar em tecnologia, produto ou design, em recolocação, transição de carreira ou busca por uma oportunidade melhor, que já possuem currículo e LinkedIn, mas não sabem como melhorar seu posicionamento ou avaliar oportunidades de forma estruturada."

**Áreas atendidas no MVP:** Tecnologia; Produto; Design.

**Senioridades atendidas:** Estágio; Júnior; Pleno; Sênior.

**Situações profissionais/atendidas (consolidando VICP + Product One Page):**
- recolocação após desligamento;
- transição de carreira;
- transição/mudança de função ou especialidade;
- busca por oportunidade melhor enquanto empregado;
- preparação para candidaturas mais direcionadas (apenas no Product One Page).

**Necessidades principais (VICP):**
- compreender como o perfil está sendo apresentado;
- melhorar a comunicação do currículo e do LinkedIn;
- comunicar experiências reais com mais clareza;
- identificar competências, resultados e evidências;
- diferenciar lacunas reais de problemas de comunicação;
- saber quais melhorias priorizar;
- avaliar a aderência observável a cargos e vagas;
- decidir quais oportunidades priorizar antes da candidatura.

**Condições esperadas do usuário inicial (Product One Page):** possui currículo; possui LinkedIn; aceita revisar informações extraídas; possui ou consegue definir um contexto-alvo; deseja compreender o que melhorar; deseja avaliar cargos/vagas antes de se candidatar.

**Fora do ICP inicial (VICP, lista literal):**
- profissionais de áreas não suportadas no MVP;
- pessoas sem currículo ou conteúdo equivalente;
- pessoas sem LinkedIn ou conteúdo profissional equivalente;
- recrutadores e empresas;
- usuários que buscam candidatura automática;
- usuários que buscam exclusivamente preparação para entrevistas;
- posições executivas altamente especializadas.

Nota do Product One Page: "outras áreas profissionais não serão oficialmente suportadas durante o MVP"; "o produto poderá receber usuários fora do ICP durante testes, mas não deverá comunicar suporte oficial sem decisão registrada."

---

## Hipóteses

**Hipótese principal / de valor (bloco de destaque, idêntico em Hipóteses e Product One Page seção 5):**
> "O CareerTwin gera valor quando identifica algo relevante que o usuário ainda não havia percebido e transforma esse diagnóstico em pelo menos uma ação concreta que ele deseja executar."

**Status:** "ainda não testada diretamente com usuários" (Hipóteses) / "não validada" (Product One Page) — consistentes.

**Hipóteses prioritárias (numeradas 1–8, literal do documento Hipóteses):**
1. O usuário percebe a análise como específica, útil e relacionada ao seu contexto profissional. — status: não informado individualmente.
2. O usuário identifica algo relevante que ainda não havia percebido sobre seu perfil. — status: não informado individualmente.
3. O usuário seleciona, inicia ou conclui pelo menos uma recomendação. — status: não informado individualmente.
4. O Diagnóstico de Aderência apoia uma decisão de priorização sobre um cargo ou uma vaga. — status: não informado individualmente.
5. Explicações, evidências e indicação do nível de confiança aumentam a confiança do usuário na análise. — status: não informado individualmente.
6. O envio de currículo e LinkedIn não gera abandono excessivo antes da entrega de valor. — status: não informado individualmente.
7. O usuário retorna para atualizar o perfil, realizar uma reanálise ou analisar novas oportunidades. — status: não informado individualmente.
8. Parte dos usuários demonstra intenção explícita de pagar por novas análises. — status: não informado individualmente.

Nenhuma das 8 hipóteses tem, no documento, um resultado ou critério de sucesso individualmente atribuído — apenas a estrutura de campos esperada (ID; afirmação; categoria; prioridade; evidência atual; método de validação; métrica; critério de sucesso; resultado; status), ainda não preenchida por item.

**Reforço do Product One Page (seção 5):** o primeiro ciclo de testes deve verificar se o CareerTwin: apresenta análises percebidas como específicas; gera clareza sobre o que melhorar; ajuda a priorizar ações; melhora a comunicação de experiências reais; diferencia desenvolvimento de melhoria de comunicação; apoia a decisão sobre candidatura; incentiva atualização de currículo/LinkedIn; gera interesse por novas análises; gera intenção de retorno; gera intenção de pagamento. Explicitamente: "desk research, benchmarking, pitches e protótipos são fontes de hipótese e contexto, não evidência de validação do produto."

---

## Modelo de Negócio

**Definição (bloco de destaque, Modelo de Negócio):**
> "B2C, com acesso individual pelo profissional e monetização por créditos após a entrega inicial de valor."

**Experiência gratuita (Modelo de Negócio):**
- uma utilização completa do Core 1 — Análise de Perfil;
- uma utilização do Core 2 para análise de vaga específica;
- acesso às recomendações;
- plano de ações;
- dashboard;
- histórico;
- reanálise durante o piloto, conforme as regras de crédito registradas no Decision Log e no PRD 03.

Comparar com Product One Page (seção 21), levemente diferente na redação: "reanálise **de perfil** durante o piloto" (mais específico, ver Conflitos abaixo).

**Oferta simulada — Pacote Novas Oportunidades:**

| Elemento | Hipótese |
|---|---|
| Conteúdo | Cinco créditos para novas análises de vagas |
| Preço | R$ 29,90 |
| Validade | 30 dias |
| Pagamento real | Não haverá cobrança nem coleta de dados de cartão no MVP |
| Métrica | Intenção explícita de compra |

(Product One Page seção 21 repete com "Conteúdo: Cinco análises de vagas" — equivalente.)

**O que será validado:** percepção de valor; interesse por novas análises; compreensão dos créditos; aceitação do preço; preferência entre pacote e assinatura; intenção explícita de compra; intenção de retorno.

**Princípios de monetização:** ocorrer somente após entrega inicial de valor; ser transparente; não bloquear relatórios já gerados; não prometer entrevistas/aprovações/contratações; não explorar vulnerabilidade emocional; não vender dados pessoais ou profissionais. (Product One Page acrescenta: "informar o consumo antes da análise".)

**O que é real vs. simulado no MVP (consolidado):**
- REAL: ledger de créditos como fonte operacional para reserva, consumo, restauração, expiração (quando aplicável) e ajustes; confirmação de intenção de compra pelo usuário.
- SIMULADO/AUSENTE: cobrança real; coleta de dados de cartão; assinatura recorrente real; preço/quantidade de créditos/validade são "hipóteses de monetização", não valores fechados.

---

## Visão e Estratégia

**Visão (bloco de destaque, literal):**
> "Ser o mentor de carreira digital de referência para profissionais brasileiros, ajudando cada pessoa a transformar sua trajetória real em um posicionamento mais claro e alinhado às oportunidades que deseja priorizar."

**Problema:** profissionais em recolocação, transição ou busca por melhores oportunidades têm experiências relevantes mas dificuldade de comunicá-las de forma clara, estratégica, evidenciada e alinhada ao objetivo profissional.

**Proposta de valor (bloco de destaque):**
> "O CareerTwin transforma currículo, LinkedIn, objetivo profissional e oportunidades em diagnósticos explicáveis, recomendações práticas e ações priorizadas."

(Nota: Product One Page usa redação levemente diferente — "currículo, LinkedIn, contexto-alvo e oportunidades de interesse" em vez de "objetivo profissional" — ver Conflitos.)

**Estratégia inicial (tabela):**

| Elemento | Definição |
|---|---|
| Mercado | Brasil |
| Modelo | B2C |
| Plataforma | Aplicação web responsiva |
| Público | Profissionais de tecnologia, produto e design |
| Senioridade | Estágio a sênior |
| Jornada | Preparação e decisão antes da candidatura |
| Core 1 | Análise de Perfil |
| Core 2 | Diagnóstico de Aderência |

**Princípios — o CareerTwin deverá:** preservar autenticidade; utilizar apenas informações fornecidas/confirmadas; explicar diagnósticos e recomendações; diferenciar ausência de evidência de ausência de competência; apresentar ações priorizadas; proteger dados pessoais e profissionais.

**Princípios — o CareerTwin não deverá:** inventar experiências/competências/resultados; prometer entrevistas/aprovações/contratações; apresentar scores como probabilidade de contratação; substituir recrutadores; atuar como job board, plataforma de recrutamento ou sistema de candidatura automática.

### Roadmap / fronteiras explícitas do MVP (Product One Page, seção 28 — "Fora do escopo do MVP", lista literal completa)

busca automática de vagas; scraping do LinkedIn; leitura automática de qualquer URL; candidatura automática; tracker de candidaturas; acompanhamento de processos seletivos; preparação para entrevistas; simulador de entrevistas; networking; mensagens para recrutadores; negociação de ofertas; acompanhamento após contratação; coaching humano; edição direta do currículo; edição direta do LinkedIn; geração completa e exportação de currículo; aplicativo mobile nativo; B2B; B2B2C; pagamento real; assinatura recorrente real; integração com meios de pagamento; coleta de dados de cartão; integrações com plataformas de cursos; comparação entre usuários; ranking; gamificação; orientação vocacional completa; recomendação definitiva de carreira; job board; ATS; recrutamento; seleção de candidatos; probabilidade de contratação; atuação após a decisão de candidatura.

Adicionalmente: "não deverá ser criado um PRD 04 para funcionalidades de apoio" (também no Decision Log, item 28 da lista consolidada); "novas funcionalidades somente poderão entrar no MVP após decisão explícita de escopo."

**Estado atual (seção 24 da Product One Page — tabela completa, relevante para priorização de trabalho):**

| Área | Estado |
|---|---|
| Visão do produto | Definida |
| Problema | Hipótese fundamentada em desk research |
| Público-alvo | Definido para teste |
| Proposta de valor | Definida, ainda não validada |
| Hipóteses | Registradas |
| Decision Log | Estruturado |
| Modelo de negócio | Hipótese definida |
| Escopo do MVP | Definido |
| Jornada do usuário | Definida |
| Site e autenticação | PRD detalhado existente |
| Onboarding e perfil | PRD detalhado existente |
| Thin Twin | Contrato definido |
| Contexto-alvo | Separado e versionado |
| Core 1 | PRD e contrato definidos |
| IPP | Dimensões, pesos e rubrica definidos |
| Core 2 | PRD e contrato definidos |
| IAO | Cálculo por requisito definido |
| Motor de análise | Documento unificado definido |
| Prompts e schemas | Contratos definidos |
| Guardrails | Definidos |
| Qualidade e casos de teste | Definidos |
| Arquitetura | Definida para implementação com Claude Code |
| Modelo de Dados | Definido |
| Privacidade e Segurança | Definidas |
| Analytics | Catálogo inicial definido |
| Incidentes | Processo inicial definido |
| Métrica principal | Definida, com janela pendente |
| Referências de cargo | Catálogo ainda pendente |
| Monetização | Oferta simulada definida |
| Pagamento real | Fora do MVP |
| Desenvolvimento | Preparação para implementação |
| Testes com usuários | Ainda não iniciados |
| Alpha | Planejado |
| Beta | Planejado |

**Prioridades atuais (seção 25, ordem literal 1–19):** 1) atualizar Fonte Canônica de Contexto; 2) sincronizar no Notion PRDs 00, 01, 02 e 03; 3) atualizar Sitemap; 4) atualizar Product HQ; 5) arquivar versões/páginas duplicadas; 6) consolidar ordem de leitura para o Claude Code; 7) aprovar baseline técnico no Decision Log; 8) resolver decisões pendentes do PRD 00; 9) definir janela da Taxa de Análise Acionável; 10) decidir política de reanálise gratuita da mesma vaga; 11) criar catálogo inicial de referências de cargo; 12) preparar repositório e ambientes; 13) implementar autenticação, site e onboarding; 14) implementar Thin Twin e contexto-alvo; 15) implementar Motor de Análise e Scores; 16) implementar Core 1 e Core 2; 17) instrumentar analytics e observabilidade; 18) executar casos de teste e exercícios de incidentes; 19) preparar alpha fechado.

**Métrica principal — Taxa de Análise Acionável (seção 22):** análise é acionável quando o usuário avalia o resultado com nota 4 ou 5 **e** seleciona/inicia/conclui pelo menos uma recomendação ou ação relacionada.
Fórmula operacional literal:
```
Análises úteis com ação
÷
Análises concluídas com janela de observação encerrada
```
Considera somente análises: concluídas com sucesso; visualizadas pelo usuário; elegíveis para feedback; com janela de observação encerrada. **Duração da janela ainda pendente de definição no Decision Log** — enquanto pendente, utilidade/seleção/ações iniciadas/ações concluídas devem ser apresentadas separadamente, e a Taxa não deve ser tratada como indicador oficial consolidado. "O Claude Code não deverá inventar uma duração." NPS não é a métrica principal do MVP.

**Referências iniciais de aprendizagem (seção 27, tabela — hipóteses de aprendizagem, não previsões comerciais):**

| Indicador | Referência inicial |
|---|---|
| Conclusão do Core 1 entre convidados | 70% |
| Avaliação quatro ou cinco | 60% |
| Recomendações consideradas específicas | 60% |
| Seleção de pelo menos uma ação | 50% |
| Ação iniciada ou concluída em sete dias | 40% |
| Uso do Core 2 ou reanálise | 30% |
| Intenção de compra confirmada | 20% |

---

## Conflitos ou ambiguidades internas

1. **Redação da experiência gratuita de reanálise.** Modelo de Negócio: "reanálise durante o piloto, conforme as regras de crédito registradas no Decision Log e no PRD 03" (sem qualificar o que é reanalisado). Product One Page, seção 21: "reanálise **de perfil** durante o piloto" (qualifica explicitamente como reanálise do Core 1/perfil, não menciona reanálise de vaga/Core 2 como gratuita durante o piloto). Isso é potencialmente relevante porque a experiência gratuita de Core 2 é descrita como "uma utilização do Core 2 para análise de vaga específica" (singular, sem menção a reanálise gratuita de vaga) em ambos os documentos — mas a frase mais genérica do Modelo de Negócio poderia ser lida como incluindo reanálise de vaga também. Não é uma contradição direta, mas uma ambiguidade de escopo que a implementação não deve resolver silenciosamente (consistente com o próprio princípio do Decision Log de não decidir silenciosamente scope).

2. **Proposta de valor — quais insumos são "transformados".** Visão e Estratégia do Produto: "O CareerTwin transforma **currículo, LinkedIn, objetivo profissional** e oportunidades em diagnósticos explicáveis..." Product One Page, seção 4: "O CareerTwin transforma **currículo, LinkedIn, contexto-alvo** e oportunidades de interesse em diagnósticos explicáveis..." O termo "objetivo profissional" (Visão) e "contexto-alvo" (Product One Page) referem-se ao mesmo conceito segundo a definição do Decision Log ("o objetivo profissional é mantido em um contexto-alvo versionado separadamente do Thin Twin") — portanto não é uma contradição semântica, mas uma inconsistência terminológica entre documentos que deveria ser padronizada (o termo canônico, mais recente e mais detalhado, parece ser "contexto-alvo").

3. **Product Owner indefinido vs. regra de precedência.** A regra de precedência (Decision Log e Product One Page) coloca "decisões mais recentes do Product Owner" no topo da hierarquia — acima até do próprio Decision Log. Porém o campo "Product Owner" no Product One Page está com valor placeholder `[Nome do Product Owner]`, não preenchido. Isso é uma lacuna documental: não há como identificar de quem são as "decisões do Product Owner" com base apenas nestes 6 documentos.

4. **Duas versões de "prazo/janela pendente" tratando do mesmo tema com nomes ligeiramente diferentes.** O Decision Log fala em "o prazo gratuito para reanálise da mesma vaga permanece como decisão pendente". O Product One Page (seção 19, Reanálise) fala em "a existência e a duração de um período gratuito para reanálise da mesma vaga permanecem pendentes de decisão" — consistente entre si, mas é uma pendência diferente da "janela de observação" da Taxa de Análise Acionável (seção 22), que é também pendente mas é uma métrica de observação, não um benefício de crédito. Como ambos são "prazos pendentes" e aparecem em contextos próximos (créditos/reanálise e métricas), há risco de confusão na implementação entre os dois prazos distintos — vale nomeá-los de forma inequívoca nos requisitos.

5. **Nenhuma contradição factual encontrada nos números-chave** (pesos do IPP somam 100% — 15+20+20+15+10+10+10; preço R$ 29,90, 30 dias, 5 créditos — idênticos em Modelo de Negócio e Product One Page; público-alvo, áreas e senioridades idênticos entre VICP e Product One Page; regra de precedência idêntica em Decision Log e Product One Page). Não há decisão no Decision Log que contradiga diretamente o Product One Page — a Product One Page parece ter sido atualizada (v1.2, 29/07/2026) em sincronia com as decisões consolidadas do Decision Log (27/07/2026).

6. **Documentos referenciados mas não fornecidos para esta extração:** "Fonte Canônica de Contexto" (citada como fonte de maior precedência que o Product One Page, mas não incluída nos 6 arquivos lidos) e "PRD 03" e "Motor de Análise e Scores" (citados como detentores de regras específicas — ex.: precedência entre score/regras determinísticas e recomendação textual da IA no Core 2). Qualquer requisito derivado desta extração que dependa desses documentos deve ser tratado como incompleto até que sejam lidos separadamente.
