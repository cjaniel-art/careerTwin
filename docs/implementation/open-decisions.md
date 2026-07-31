# Open Decisions — CareerTwin

Toda pendência abaixo é registrada, não resolvida silenciosamente. Nenhum item aqui deve ser lido como decisão aprovada. Classificação: `blocking` · `non_blocking` · `provisional` · `resolved_by_precedence` · `missing_asset` · `missing_external_configuration`.

---

## 1. Catálogo inicial de referências de cargo — `blocking` (parcial)

**Documentos afetados:** PRD 03 §7/§48/§49, Motor de Análise e Scores, Arquitetura §13.
**Texto literal:** "A criação e a aprovação do catálogo inicial de referências de cargo permanecem como dependência pendente [...] o Claude Code não deverá criar ou aprovar uma referência silenciosamente."
**Impacto:** bloqueia **apenas** o caminho "análise de cargo-alvo" do Core 2. A análise de vaga específica não depende disso e permanece totalmente implementável.
**Alternativas técnicas:**
1. Implementar a tabela `role_references`/`role_reference_versions`, a interface e os contratos completos, mas sem popular nenhum registro `approved` — o fluxo de cargo-alvo sempre retorna `insufficient_data` de forma correta e visível ao usuário. **(Recomendada.)**
2. Popular um catálogo sintético/de exemplo explicitamente marcado como não aprovado para fins de teste E2E, nunca em `approved`.
3. Não implementar a interface de cargo-alvo agora e adicioná-la depois.
**Decisão de implementação adotada nesta sessão:** alternativa 1. A infraestrutura (tabelas, endpoint, UI) é construída; o catálogo real fica vazio; qualquer tentativa de análise por cargo-alvo retorna `insufficient_data` de forma correta, nunca uma análise "definitiva" fabricada.

## 2. Janela gratuita de reanálise da mesma vaga — `blocking` (parcial)

**Documentos afetados:** PRD 03 §36, §39, §49; Decision Log item 34; Product One Page §19.
**Texto literal:** "A existência e a duração de um período gratuito para reanálise da mesma vaga permanecem pendentes de decisão [...] o Claude Code não deverá inventar um prazo."
**Impacto:** bloqueia apenas a regra de isenção de crédito específica para reanálise da mesma vaga após N dias. Não bloqueia reanálise em si (que sempre é possível, apenas com consumo normal de crédito quando não há outra isenção aplicável — falha técnica, resultado idêntico reutilizado etc., que **são** regras fechadas).
**Alternativas técnicas:**
1. Implementar `credit_reservations.exemption_type` com os 4 valores já fechados (`technical_retry`, `identical_result_reuse`, `pilot_grant`, `administrative_adjustment`) e **não** adicionar um quinto tipo `same_job_reanalysis_window` até a decisão ser registrada. **(Recomendada.)**
2. Implementar o campo como feature flag desligada por padrão, com valor de dias configurável mas não ativo.
**Decisão de implementação adotada nesta sessão:** alternativa 1. Reanálise de vaga sempre consome crédito normalmente (respeitando as isenções já fechadas), sem janela gratuita adicional.

## 3. Combinação lógica exata do conteúdo mínimo da vaga — `blocking` (parcial)

**Documentos afetados:** PRD 03 §9, §45 (`minimumContentRule: "pending_decision_log"`), §49.
**Texto literal:** "A combinação lógica exata entre esses critérios permanece pendente de registro no Decision Log [...] o Claude Code não deverá escolher silenciosamente uma regra booleana."
**Impacto:** os critérios individuais estão definidos (≥300 caracteres úteis; presença de responsabilidades/escopo; presença de requisitos estruturáveis; diversidade suficiente) — falta apenas a fórmula booleana (E/OU/pontuação) que os combina.
**Alternativas técnicas:**
1. Implementar validação conservadora: todos os critérios individuais devem passar (AND estrito) para não cair em `insufficient_data`; documentar exatamente essa regra como provisória e configurável via `CORE_2_CONFIG.opportunity.minimumContentRule`. **(Recomendada — mais segura, gera menos falsos positivos de "conteúdo suficiente".)**
2. Pontuação ponderada com limiar configurável.
**Decisão de implementação adotada nesta sessão:** alternativa 1, mantendo `minimumContentRule` como valor de configuração nomeado e documentado como provisório.

## 4. Provedor de IA — `missing_external_configuration`

**Documentos afetados:** Arquitetura §13, Segurança §12.
**Impacto:** nenhuma chamada real a um provedor de IA pode ocorrer sem `AI_PROVIDER_API_KEY`. A interface `AiProvider` (porta) é implementada; um adapter de desenvolvimento com dados sintéticos permite testar o pipeline sem custo/rede; o adapter de produção falha explicitamente (`MissingEnvironmentConfigError`) se a chave não estiver configurada.
**Ação:** documentado em `.env.example`. Nenhuma chave fictícia foi criada.

## 5. Provedores definitivos de Auth/DB/Storage — `provisional`

**Documentos afetados:** Arquitetura §2, §13; Modelo de Dados §1.
**Texto literal:** Supabase Auth/PostgreSQL/Storage são citados como "baseline técnico proposto", não decisão fechada.
**Decisão de implementação adotada nesta sessão:** seguindo a autorização explícita do prompt mestre desta sessão ("na ausência de decisão técnica aprovada, você está autorizado a utilizar [...] Supabase Auth, PostgreSQL via Supabase, Supabase Storage privado"), usamos Supabase como baseline reversível. Um projeto Supabase remoto de desenvolvimento (`careertwin-dev`, plano gratuito) **foi** provisionado nesta sessão, com autorização explícita do Product Owner, para validar RLS/RPCs/idempotência com dados reais — todas as 21 migrations estão aplicadas e testadas ao vivo nele. As migrations SQL continuam portáveis para qualquer Postgres com pequenas adaptações de RLS. Registrar aprovação formal do provedor definitivo (e do projeto de produção) no Decision Log antes do lançamento.

## 6. Style Guide CareerTwin vs. "Leitura do estilo visual" — `non_blocking`

**Documentos afetados:** PRD 00 §20, Sitemap §18, Leitura do estilo visual.
**Impacto:** nenhum — "Leitura do estilo visual" contém tokens de cor/tipografia/componentes suficientemente detalhados e é tratada como a fonte de tokens visuais vigente. Se um documento "Style Guide CareerTwin" separado existir e for adicionado ao repositório depois, os tokens devem ser reconciliados.

## 7. Assets oficiais de logo — `resolved_by_precedence`

**Documentos afetados:** Leitura do estilo visual, PRD 00 §5/RF-SITE-018/019.
**Regra:** "devem ser utilizados exclusivamente os arquivos oficiais fornecidos" — proibido redesenhar, reconstruir ou simular via CSS/texto/ícone/IA.
**Resolvido em 30/07/2026:** o Product Owner forneceu um arquivo Figma com a home redesenhada, contendo o símbolo gráfico da marca como elemento vetorial real (não print). Baixamos o asset exportado diretamente do Figma (`public/logo-icon.svg`, `#F84606`) — nunca redesenhado ou recriado por CSS/IA — e usamos no componente `Wordmark` em todo o app. O texto "CareerTwin" continua como texto real (Inter Semibold), não como imagem vetorizada de fonte: os arquivos exportados do Figma para o texto/tagline eram paths de fonte convertidos (pesados, não selecionáveis, ruins para acessibilidade), então optamos por recriar apenas o texto como HTML real, mantendo o símbolo gráfico fiel ao asset original.

## 8. Verificação obrigatória de e-mail no cadastro — `provisional`

**Documentos afetados:** PRD 00 §9/RF-AUTH-009, decisões pendentes #2.
**Histórico:** apesar deste item originalmente registrar a confirmação de e-mail como "desabilitada por padrão", o projeto `careertwin-dev` estava, na prática, com `mailer_autoconfirm=false` (confirmação **exigida**) durante a maior parte desta sessão — descoberto ao vivo quando o cadastro real caía na tela "Confirme seu e-mail". Isso também causou bloqueios reais de teste: o SMTP padrão do Supabase free tier tem um limite de envio muito baixo, e várias tentativas de cadastro consecutivas nesta sessão esbarraram em `over_email_send_rate_limit`.
**Decisão de implementação adotada nesta sessão (atualizada):** a pedido explícito do Product Owner, ao publicar o ambiente de homologação (`https://careertwin-nine.vercel.app`, ver `final-report.md`), `mailer_autoconfirm` foi definido como `true` via Supabase Management API (`PATCH /v1/projects/{ref}/config/auth`) — cadastro agora entra direto, sem exigir confirmação por e-mail, verificado ao vivo na URL pública. Isso vale para o projeto `careertwin-dev` inteiro (dev e homologação, que compartilham o mesmo projeto Supabase — ver decisão sobre banco único no `final-report.md`). A UI ainda implementa o estado "confirmação pendente" e o texto correspondente (tela `/cadastro/confirme-seu-email`), pronta para religar a exigência assim que decidido. Registrar decisão final e (se a exigência for religada) configurar um provedor de SMTP customizado antes de produção — o limite do Supabase free tier não é viável para uso real.

## 9. Política de senha e duração/renovação de sessão — `provisional`

**Documentos afetados:** PRD 00 §5, decisões pendentes #3/#4.
**Decisão de implementação adotada nesta sessão:** política mínima razoável (senha ≥ 8 caracteres, Supabase Auth default de sessão) documentada como provisória em código; não apresentada como definitiva na UI.

## 10. Duração da janela de observação da Taxa de Análise Acionável — `blocking` (parcial, métrica apenas)

**Documentos afetados:** Product One Page §22, Analytics.
**Impacto:** bloqueia apenas o cálculo/publicação da métrica agregada "Taxa de Análise Acionável" como indicador oficial. Não bloqueia nenhuma funcionalidade de usuário. Os eventos subjacentes (`analysis_feedback_submitted`, seleção/conclusão de ações) são implementados normalmente; o dashboard analítico apresentaria utilidade e ação separadamente, sem consolidar em uma taxa única, até a janela ser definida. (Não implementamos um dashboard analítico interno de métricas de produto nesta sessão — fora do escopo de telas do usuário final; registrado para quando essa ferramenta for construída.)

## 11. Conteúdo jurídico final de Termos de Uso / Política de Privacidade — `provisional`

**Documentos afetados:** PRD 00 §5, decisões pendentes #5/#6.
**Decisão de implementação adotada nesta sessão:** as páginas `/termos` e `/privacidade` são implementadas com estrutura completa e texto **provisório**, claramente identificado como tal, cobrindo os pontos obrigatórios listados no Sitemap/PRD 00 (dados coletados, finalidades, retenção, exclusão, direitos do titular). Não deve ser publicado como conteúdo jurídico final sem revisão humana/jurídica.

## 12. Regra de RN sobre localização em `requirements.category = 'location'` vs. proibição de dados pessoais no IAO — `blocking` (parcial)

**Documentos afetados:** Modelo de Dados §4.2/§4.12, Segurança §4/§17 (conflito interno identificado na extração de Engenharia, item 1).
**Impacto:** bloqueia apenas a avaliação automática de requisitos de categoria `location` no cálculo do IAO. Requisitos dessa categoria continuam sendo estruturados e exibidos normalmente; apenas seu `match_status` não é preenchido a partir de `personal_data.city/state` — isso exigiria informação específica da oportunidade (fornecida pelo usuário só para aquele contexto, não seu cadastro pessoal), o que o motor determinístico já respeita por design.
**Decisão de implementação adotada nesta sessão:** requisitos `category = 'location'` nunca leem `personal_data`; quando não houver informação específica fornecida pelo usuário para aquela oportunidade, o requisito recebe `match_status = 'unknown'`. Nenhuma exceção categórica é implementada sem essa informação específica.

## 13. `requirements.is_critical` (boolean) redundante com `criticality` — `resolved_by_precedence`

**Documentos afetados:** Modelo de Dados §4.12 (contradição interna do próprio documento, identificada na extração).
**Resolução aplicada:** tratamos `is_critical` como coluna **gerada** (`GENERATED ALWAYS AS (criticality IN ('mandatory','blocking')) STORED`), preservando o campo citado no Modelo de Dados sem permitir que ele contradiga `criticality` — não é uma decisão de produto, é a única leitura consistente com a própria regra do documento ("não deverá existir um booleano independente que possa contradizer a criticidade").

## 14. `gapType` em inglês (PRD 03) vs. português (schema JSON de Prompts e Schemas) — `resolved_by_precedence`

**Documentos afetados:** PRD 03 §28, Prompts e Schemas §10.
**Resolução aplicada:** a saída bruta e validada da IA usa os valores em português definidos no schema JSON (fonte mais específica e operacional); o backend mapeia para o enum interno em inglês do contrato TypeScript do PRD 03 (`competency`, `experience`, `education_or_certification`, `communication`, `evidence`, `positioning`, `unknown`) antes de persistir em `requirement_assessments.gap_type`. O mapeamento fica centralizado em um único módulo (`src/config/schemas`), nunca duplicado.

## 15. Fluxo de "zero créditos" / oferta simulada de créditos adicionais — `non_blocking`

**Documentos afetados:** PRD 03 §39, §50 (documento "Gestão de Créditos" citado mas ausente do repositório).
**Impacto:** nenhum documento descreve tela/fluxo detalhado além de "Pacote Novas Oportunidades" (R$ 29,90 hipotético, 5 créditos, 30 dias, intenção de compra sem cobrança real) do Product One Page/Escopo do MVP/Sitemap.
**Decisão de implementação adotada nesta sessão:** implementamos a tela `/app/creditos` com saldo, histórico do ledger e a oferta simulada exatamente como descrita nesses três documentos (que **são** suficientes para essa tela); quando o saldo chega a zero, o usuário vê a oferta simulada e pode registrar intenção de compra — sem bloquear histórico, ações, perfil, ou Core 1, conforme regra explícita do Sitemap §7.

## 16. Retenção de eventos de analytics — `non_blocking`

**Documentos afetados:** Segurança §5, Analytics (conflito identificado na extração de Engenharia, item 4).
**Impacto:** nenhuma funcionalidade de usuário depende disso. Adotamos a retenção padrão do provedor de analytics escolhido (adapter substituível) até decisão formal.

## 17. Navegadores oficialmente suportados / SEO final / domínio oficial / política de cookies — `non_blocking`

**Documentos afetados:** PRD 00, decisões pendentes #8–#14.
**Decisão de implementação adotada nesta sessão:** suporte a navegadores modernos evergreen (últimas 2 versões de Chrome/Firefox/Safari/Edge) via Tailwind/Next.js defaults; metadados de SEO básicos implementados de forma genérica; sem política de cookies formal implementada (nenhum cookie de terceiros/tracking foi adicionado nesta sessão).

## 18. Baseline técnico geral (Next.js/TS/Tailwind/shadcn/Vitest/Playwright) — `provisional`

Conforme autorizado explicitamente pelo prompt mestre desta sessão. Registrado aqui como não definitivo até aprovação no Decision Log real do produto.

## 19. Proteção contra senha vazada (HaveIBeenPwned) desabilitada no projeto Supabase — `missing_external_configuration`

**Origem:** advisor de segurança do Supabase (`auth_leaked_password_protection`), projeto `careertwin-dev`.
**Impacto:** nenhum bloqueio funcional — é uma configuração do painel de Auth (Authentication → Policies), não exposta pelas ferramentas MCP disponíveis nesta sessão, portanto não pôde ser ativada programaticamente.
**Ação recomendada:** habilitar manualmente antes de produção em qualquer projeto Supabase real (não apenas o de desenvolvimento criado nesta sessão).

## 20. Processamento síncrono em vez de fila/worker real — `provisional`

**Documentos afetados:** Arquitetura §4.6, PRD 01 §19, PRD 02 §12, PRD 03 §20 (todos especificam fila durável + worker + retentativas 15s/60s/5min + DLQ).
**Decisão de implementação adotada nesta sessão:** como este ambiente não tem uma fila/worker provisionados, a extração de documentos e a análise do Core 1 rodam de forma síncrona dentro da própria requisição do usuário, mas usando exatamente o mesmo modelo de dados (`processing_jobs`, `analyses.status`) que uma fila real usaria — a troca por um worker de verdade não deve exigir mudança de schema, apenas mover a chamada de `runProfileAnalysis`/`processDocument` para fora da requisição HTTP. Idempotência, versionamento e não-consumo de crédito em falha técnica foram implementados e testados normalmente.

## 21. Mutação de créditos via RPC `SECURITY DEFINER` em vez de política de RLS de escrita — `resolved_by_precedence`

**Documentos afetados:** Modelo de Dados §4.14–4.16 (`credit_accounts`, `credit_reservations`, `credit_ledger`), Segurança §17 (lista "duplicação de crédito" como bloqueador de release).
**Problema encontrado via teste ao vivo:** essas três tabelas tinham apenas política de `SELECT`, assumindo (como o restante do Modelo de Dados) um processo de service-role/worker para gravar créditos — que não existe neste ambiente (ver item #20). Uma política de escrita simples com `owner_id = auth.uid()` (o padrão usado para `processing_jobs`/`requirements`, migrations `...000016`/`...000020`) seria insegura aqui: permitiria a um usuário autenticado definir `available_credits` para qualquer valor via `PostgREST`, exatamente a classe de vulnerabilidade que a Segurança §17 proíbe.
**Resolução aplicada:** migration `...000021_credit_rpc_functions.sql` adiciona três funções `SECURITY DEFINER` (`ct_reserve_credit`, `ct_confirm_credit_reservation`, `ct_release_credit_reservation`) que resolvem o usuário exclusivamente via `auth.uid()` (nunca um `user_id` vindo do cliente), aplicam as regras de negócio reais (reservar somente se houver saldo; confirmar/liberar somente uma reserva própria em status `reserved`) e são as únicas formas de gravação nessas tabelas — nenhuma política de `INSERT`/`UPDATE` foi adicionada. `search_path` fixado e `EXECUTE` restrito à role `authenticated` (não `anon`), seguindo o mesmo endurecimento já aplicado em `ct_handle_new_user` (migration `...000015`). Fluxo completo (reserva → confirmação → decremento de saldo → reuso idempotente sem cobrança dupla) verificado ao vivo no projeto `careertwin-dev`.

## 22. Exclusão de conta — apenas os passos 1-6 do fluxo de 21 passos (Segurança §7) implementados — `provisional`

**Documentos afetados:** Segurança §7 (fluxo de 21 passos), Modelo de Dados §4.16 (`deletion_requests`).
**Impacto:** `/app/conta` permite ao usuário solicitar exclusão; a solicitação é registrada (`deletion_requests.status='requested'`, prazos de 15/30 dias calculados), a conta entra em `deletion_pending`, e novas análises/uploads/vagas são bloqueados com mensagem específica (passos 1-6, verificados ao vivo). Os passos 7-21 — interromper jobs em andamento, excluir dados pessoais/Thin Twin/contextos-alvo/oportunidades/análises/recomendações/ações/feedbacks, anonimizar analytics, remover a conta de `auth.users`, expirar backups, expor status final — **não são executados**: exigem um worker assíncrono (mesma limitação estrutural do item #20, que este ambiente não possui). Uma solicitação de exclusão hoje fica permanentemente em `requested`, bloqueando a conta sem nunca concluir a exclusão real dos dados.
**Ação recomendada:** antes de produção, implementar o worker/job de exclusão (ou um processo administrativo manual documentado) que execute os passos 7-21 dentro dos prazos registrados em `active_systems_deadline`/`backup_deadline`, e trate contas presas em `deletion_pending` sem exclusão real como um incidente (Segurança §13, "atraso acima do prazo gera incidente" — mesma regra usada para exclusão de arquivos, §6).

## 23. Provedor de analytics de produto — `provisional`

**Documentos afetados:** Analytics (documento inteiro não cita nenhum fornecedor), Arquitetura §2/§13 ("provedor definitivo de analytics" listado como decisão arquitetural pendente).
**Decisão de implementação adotada nesta sessão:** implementamos o catálogo canônico completo de eventos (`src/infrastructure/analytics/events.ts`, todos os nomes do documento Analytics §5–§12, não apenas os disparados nesta sessão), a porta `AnalyticsPort` (`src/application/ports/analytics.ts`) com propriedades permitidas tipadas explicitamente (nunca um `Record<string, unknown>` livre — enviar um campo proibido como nome completo, e-mail ou texto de recomendação é erro de compilação, não uma disciplina de runtime) e um `ConsoleAnalyticsAdapter` que registra o envelope validado no stdout. Nenhum fornecedor real (Mixpanel, Amplitude, Segment etc.) foi integrado ou contatado. `userId` é sempre hasheado (SHA-256) antes de sair da função `trackEvent` — nunca é enviado em texto puro ao adapter.
**Eventos efetivamente disparados nesta sessão** (backend, após persistência bem-sucedida, por `trackEvent`): `signup_completed`, `login_completed`, `login_failed`, `resume_uploaded`, `linkedin_uploaded`, `twin_profile_confirmed`, `target_role_defined`, `onboarding_completed`, `profile_analysis_started/completed/failed`, `recommendation_selected`, `action_started/completed`, `action_status_changed`, `analysis_feedback_submitted`, `application_intent_submitted`, `opportunity_confirmed`, `job_analysis_started/completed/failed`, `job_recommendation_received`, `credit_consumed`, `credit_restored`, `purchase_intent_confirmed`, `account_deletion_requested`. O restante do catálogo (eventos de página/visualização como `landing_viewed`, `credits_viewed`, `paywall_viewed`, eventos derivados como `onboarding_abandoned`, e eventos client-side) está nomeado e tipado, mas não disparado — não há client-side analytics nesta sessão (nenhum SDK de terceiro foi adicionado ao bundle do navegador).
**Ação recomendada:** registrar o provedor definitivo no Decision Log antes de produção e implementar `AnalyticsPort` para ele — nenhum call site precisa mudar.

## 24. Consolidação da extração de IA no Thin Twin — corrigida parcialmente (experiências/evidências); competências/ferramentas continuam bloqueadas — `blocking` (parcial)

**Documentos afetados:** Prompts e Schemas §2 (P-003 "Consolidação do Thin Twin"), PRD 01 §30–31 (revisão do perfil), Modelo de Dados §4.2 (`profile_skills`, `profile_tools`).
**Problema encontrado ao responder a uma pergunta direta do Product Owner sobre completude dos PRDs** (não durante teste ao vivo de rotina — auditoria adicional motivada pela pergunta): `document_extractions.validated_payload` (a saída real de P-001/P-002) era gravado e **nunca lido em nenhum lugar do código**. A função `ensureProfileDraft`, cujo comentário afirmava implementar P-003, na verdade só criava uma `profile_versions` vazia — a única forma de uma experiência entrar em `experiences` era o usuário adicionar manualmente (`addExperienceAction`). O adapter sintético mascarava isso porque sempre retornava `experiences: []`, então esse caminho nunca foi exercitado pelos testes ao vivo anteriores desta sessão.
**Correção aplicada:** `synthetic-provider.ts` agora retorna uma experiência de exemplo (com `results`) quando o conteúdo é suficiente, e `consolidateExtractedExperiences()` (nova função em `src/features/onboarding/actions.ts`, chamada dentro de `ensureProfileDraft`) lê a extração mais recente e bem-sucedida de cada tipo de documento (currículo/LinkedIn) e popula `experiences`/`evidences` na versão draft. Verificado ao vivo ponta a ponta: currículo + LinkedIn colados → 2 experiências e 2 evidências aparecem automaticamente na revisão → Thin Twin confirmado → Core 1 calcula IPP a partir desses dados reais (não mais placeholders manuais).
**O que continua bloqueado:** `profile_skills`/`profile_tools` (competências/ferramentas) referenciam as tabelas de catálogo compartilhado `skills`/`tools`, que só têm política de `SELECT` para o cliente — o mesmo padrão de "catálogo vazio, sem processo de curadoria" do item #1 (`role_references`). Popular esses dados a partir da extração exigiria uma função `SECURITY DEFINER` para find-or-create de skill/tool (análoga às RPCs de crédito do item #21), ou um catálogo pré-populado por um curador. Enquanto isso não existir, a dimensão "Competências e ferramentas" do IPP fica sempre em nível 0 para qualquer usuário, mesmo com extração bem-sucedida — isso é uma limitação de fidelidade real do Core 1, não apenas de uma funcionalidade periférica.
**Ação recomendada:** decidir a estratégia de catálogo de skills/tools (find-or-create automático vs. curadoria manual vs. taxonomia externa) antes de produção — sem isso, a dimensão de competências do IPP nunca reflete o perfil real do usuário.

## 25. Cor primária da marca atualizada (`#FF5A1F` → `#F84606`) — `resolved_by_precedence`

**Documentos afetados:** Leitura do estilo visual (paleta cromática), `tailwind.config.ts`, `src/app/globals.css`.
**Contexto:** ao implementar a home redesenhada a partir de um novo arquivo Figma fornecido pelo Product Owner (30/07/2026), o laranja usado nesse arquivo (`#F84606`) era ligeiramente diferente do laranja original da "Leitura do estilo visual" (`#FF5A1F`).
**Decisão do Product Owner:** atualizar o token em todo o app para `#F84606`, não manter duas cores de marca diferentes entre a home e o restante das telas. Aplicado em `--primary`/`--primary-dark`/`--ring` (`src/app/globals.css`) — `--primary-dark` recalculado proporcionalmente (mesma queda de luminosidade do esquema anterior) para `#C23705`. Nenhum outro token da paleta foi alterado.
**Verificado ao vivo:** login, dashboard e demais telas já construídas refletem o novo laranja automaticamente (usam o token, nunca hex hardcoded).

## 26. Home redesenhada a partir de Figma — logo oficial adotado, seção de métricas/depoimento omitida

**Documentos afetados:** PRD 00 (landing page), Leitura do estilo visual, Guardrails (não inventar métricas/depoimentos).
**Contexto:** Product Owner forneceu um link do Figma com uma nova versão da home. Implementada via `get_design_context` (MCP Figma), com os assets de imagem/ícone baixados e commitados em `public/landing/` (as URLs do Figma expiram em ~7 dias).
**Decisões tomadas com o Product Owner:**
- O símbolo gráfico do header/footer do Figma foi adotado como o logo oficial (ver item #7, resolvido).
- Uma seção do Figma ("Resultados que transformam carreiras": "4x mais chances de promoção", "70%", "85%", "2.500+ profissionais", e um depoimento fabricado de "Juliana Martins, Product Designer") foi **omitida** — confirmado pelo Product Owner como placeholder, e a própria seção já era uma imagem estática colada no Figma, não componentes editáveis. Manter essa seção violaria a regra "não inventar métricas, clientes, depoimentos ou resultados".
- O texto dos 4 passos de "Como funciona" no Figma mencionava "cursos e mentorias" — funcionalidade que o produto não tem. Substituído pelo copy real do fluxo de onboarding (criar conta → enviar currículo/LinkedIn → revisar perfil → definir contexto-alvo), já validado no restante do app.
- As seções "Autenticidade e confiança", "O que você recebe" e "Limitações do produto" (não presentes no Figma, mas já implementadas e obrigatórias pelos guardrails de produto) foram preservadas, adaptadas ao novo estilo visual.

Nenhum item acima impede a implementação do restante do MVP. Todos os bloqueios são de escopo restrito (uma sub-funcionalidade específica retorna `insufficient_data` ou permanece com configuração provisória) e documentados em código com comentários e/ou constantes nomeadas apontando para este arquivo.
