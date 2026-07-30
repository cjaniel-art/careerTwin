# Requirements Traceability Matrix — CareerTwin

Granularidade: por área funcional (cada área agrupa uma faixa de requisitos `RF-*`/`RN-*`/`RNF-*` do documento de origem — os IDs individuais estão nos extracts em `docs/implementation/extracts/` e nos PRDs originais). Status é atualizado ao longo da implementação; não declarar `done` sem teste correspondente passando.

Status: `not_started` · `in_progress` · `done` · `blocked` (referencia `open-decisions.md`).

## Site público e autenticação (PRD 00)

| Área | Doc/Seção | Requisitos | Rota(s) | Tabela(s) | Regra de negócio | Teste | Evento(s) analytics | Status |
|---|---|---|---|---|---|---|---|---|
| Landing page | PRD 00 §Home/LP, Sitemap §1 | RF-SITE-001..020 | `/` | — | RN-SITE-001..009 | manual (browser, ver relatório final) | `landing_viewed`, `landing_primary_cta_clicked`, `landing_secondary_cta_clicked` (não instrumentados ainda) | in_progress |
| Termos / Privacidade | PRD 00, Sitemap §1 | RF-SITE-013 | `/termos`, `/privacidade` | — | conteúdo provisório (open-decisions #11) | manual | — | done (conteúdo provisório) |
| Cadastro | PRD 00 §Cadastro | RF-AUTH-001..010 | `/cadastro` | `auth.users`, `user_accounts`, `consent_records` | RN-AUTH-001..008 | verificado ao vivo no navegador contra Supabase real (ver relatório final); sem teste automatizado ainda | `signup_started`, `signup_completed` (não instrumentados ainda) | in_progress |
| Login/Sessão | PRD 00 §Login | RF-AUTH-011..022 | `/login` | `auth.users`, `user_accounts` | RN-AUTH-001..008 | verificado ao vivo no navegador; sem teste automatizado ainda | `login_started`, `login_completed`, `login_failed` (não instrumentados ainda) | in_progress |
| Recuperação de senha | PRD 00 §Recuperação | RF-AUTH-023..028 | `/recuperar-senha`, `/redefinir-senha` | `auth.users` | mensagem neutra obrigatória | implementado, não testado ao vivo (requer e-mail real) | (aguardando registro no catálogo canônico) | in_progress |
| Exclusão de conta | PRD 00 §Conta, Segurança §7 | RF-AUTH-029..034 | `/app/conta` | `deletion_requests`, `user_accounts.status` | metas 15/30 dias | verificado ao vivo: passos 1-6 dos 21 do fluxo (solicitação registrada, `deletion_pending`, novas análises/uploads/vagas bloqueados com mensagem específica) — passos 7-21 (expurgo real de todas as tabelas, remoção da conta de auth, expiração de backups) exigem worker, ausente neste ambiente (open-decisions #22, mesma limitação do #20); sem teste automatizado dedicado | `account_deletion_requested` (não instrumentado) | in_progress |
| Proteção de rotas / redirecionamento | PRD 00, Sitemap §7 | RF-AUTH-017..022 | middleware global | `user_accounts.onboarding_status` | backend nunca confia em `user_id` do cliente | verificado ao vivo: `/onboarding` sem sessão redireciona para `/login?redirect=%2Fonboarding` | — | done |

## Banco de dados e segurança (Modelo de Dados, Segurança)

| Área | Doc/Seção | Tabelas | Regra | Teste | Status |
|---|---|---|---|---|---|
| Schema completo | Modelo de Dados §4.1–4.17 | todas — 13 migrations em `supabase/migrations/` | convenções §1, integridade §6 | Aplicado e testado ao vivo em projeto Supabase real (`careertwin-dev`); sem suíte automatizada de schema | done |
| RLS | Modelo de Dados §7, Segurança §9 | todas com `user_id` (direto ou por cadeia) | 7 testes mínimos por entidade (§7) | Testado ao vivo com SQL real (dono/outro usuário/anônimo/`user_id` malicioso/cadeia indireta/imutabilidade) — ver relatório final; sem suíte automatizada reexecutável | done (verificado manualmente; falta suíte automatizada) |
| Idempotência | Arquitetura §8, Modelo de Dados §6 | `analyses`, `credit_reservations`, `credit_ledger`, `processing_jobs` | chaves únicas `(user_id, idempotency_key)` implementadas no schema | não testado (nenhum use-case de aplicação as exercita ainda) | in_progress |
| Retenção/exclusão | Segurança §5–7 | `documents`, `deletion_requests` | colunas/índices parciais implementados no schema; nenhum job de exclusão automática implementado | not_started | not_started |

## Onboarding e Thin Twin (PRD 01, Thin Twin)

| Área | Doc/Seção | Requisitos | Rota(s) | Tabela(s) | Teste | Evento(s) | Status |
|---|---|---|---|---|---|---|---|
| Identificação básica | PRD 01 §5, §11 | RF-ONB-011..020 | `/onboarding` (etapa 2) | `personal_data` | verificado ao vivo no navegador; sem teste automatizado | — | in_progress |
| Upload de currículo | PRD 01 §12 | RF-ONB-021..038 | `/onboarding` (etapa 3) | `documents`, `document_extractions` | verificado ao vivo (texto colado); upload de arquivo real não testado; sem teste automatizado | `resume_uploaded`, `upload_failed` (não instrumentados) | in_progress |
| Upload de LinkedIn | PRD 01 §13 | RF-ONB-039..051 | `/onboarding` (etapa 4) | `documents` | verificado ao vivo (texto colado); sem teste automatizado | `linkedin_uploaded` (não instrumentado) | in_progress |
| Conteúdo mínimo | PRD 01 §14 | RF-ONB-052..054 | — | `documents.status = insufficient_content` | `tests/unit/content-validation.test.ts` | — | not_started |
| Segurança de upload | PRD 01 §15, Segurança §11 | RF-ONB-055..064 | — | `documents` | `tests/integration/upload-security.test.ts` | — | not_started |
| Pipeline de extração/OCR | PRD 01 §17–18 | RF-ONB-071..087 | processamento síncrono (sem worker/fila real — ver relatório final) | `document_extractions` | verificado ao vivo via adapter sintético; sem OCR real, sem teste automatizado | `twin_extraction_started/completed/failed` (não instrumentados) | in_progress |
| Fila/idempotência/retomada | PRD 01 §19–20 | RF-ONB-088..100 | worker | `processing_jobs` | `tests/integration/jobs.test.ts` | — | not_started |
| Revisão do perfil | PRD 01 §30–31 | RF-ONB-113..127 | `/onboarding` (etapa 6) | `experiences`, `profile_skills`, etc. | verificado ao vivo (adicionar experiência manual); edição/remoção de itens extraídos não implementada; sem teste automatizado | `twin_review_started` etc. (não instrumentados) | in_progress |
| Confirmação do Thin Twin | PRD 01 §32, Thin Twin §6/§11 | RF-ONB-128..133 | `/onboarding` (etapa 7) | `profile_versions` | verificado ao vivo: versão confirmada, imutável (testado que UPDATE é bloqueado); sem teste automatizado | `twin_profile_confirmed`, `twin_version_created` (não instrumentados) | in_progress |
| Contexto-alvo | PRD 01 §34 | RF-ONB-140..149 | `/onboarding` (etapa 8) | `target_contexts`, `target_context_versions` | verificado ao vivo; sugestão automática de cargo não implementada; sem teste automatizado | `target_role_defined` etc. (não instrumentados) | in_progress |
| Conclusão | PRD 01 §36 | RF-ONB-150..155 | `/onboarding` (etapa 9) | `user_accounts.onboarding_status` | verificado ao vivo: as 9 precondições são revalidadas no servidor antes de concluir; sem teste automatizado | `onboarding_completed` (não instrumentado) | in_progress |
| Retenção de arquivos | PRD 01 §37 | RF-ONB-104, 156–158 | — | `documents.retention_deadline` | `tests/integration/retention.test.ts` | — | not_started |

## Core 1 — Análise de Perfil (PRD 02, Motor, Guardrails)

| Área | Doc/Seção | Requisitos | Rota(s) | Tabela(s) | Fórmula/regra | Teste | Evento(s) | Status |
|---|---|---|---|---|---|---|---|---|
| Pré-condições e gatilho | PRD 02 §7 | — | `/app/analise-perfil` | — | bloqueio → mensagem de dados faltantes | verificado ao vivo (perfil/contexto-alvo não confirmados bloqueiam corretamente); sem teste automatizado | `profile_analysis_blocked` (não instrumentado) | in_progress |
| Congelamento de versões | PRD 02 §9, §12 | RF-C1-001..011 | — | `analyses` | chave de idempotência §12 | verificado ao vivo: 2ª chamada reutiliza a análise existente (0 duplicatas); sem teste automatizado | `profile_analysis_started` (não instrumentado) | in_progress |
| Cálculo do IPP | Motor §5–7 | — | — | `src/domain/scores/ipp.ts` | pesos 15/20/20/15/10/10/10; `Math.round` | `tests/unit/ipp-engine.test.ts` (9 testes, passando) | — | done |
| Confiança | Motor §13 | — | — | `src/domain/scores/confidence.ts` | pesos 30/30/25/15 | `tests/unit/confidence-engine.test.ts` (5 testes, passando) | — | done |
| Recomendações e priorização | PRD 02 §20–21 | RF-C1-029..041 | `/app/analise-perfil/[analysisId]` | `recommendations` | máx 8/3 destacadas; `priorityScore100` | `tests/unit/priority-engine.test.ts` (motor de priorização testado, 4 testes); UI/persistência não implementadas | `recommendation_viewed/selected` | in_progress |
| Tradução da experiência | PRD 02 §22 | RF-C1-042..050 | idem | — | validação de autenticidade obrigatória | não implementada nesta sessão | `experience_suggestion_copied` | not_started |
| Plano de evolução / ações | PRD 02 §23 | RF-C1-051..056 | `/app/acoes` | `actions`, `recommendations.status` | até 5 ações ativas (`ACTIONS_CONFIG.maximum`, compartilhado com Core 2); pendente→selecionada→em andamento→concluída; não recalcula IPP/IAO | verificado ao vivo: conversão de recomendação em ação, transição completa de status, limite de 5 ações ativas (botão desabilitado no servidor e no cliente); sem teste automatizado dedicado | `action_started/completed` (não instrumentados) | done (Core 1 — único core com `recommendations` itemizadas hoje; Core 2 não gera candidatos, ver nota na seção Core 2) |
| Histórico/reanálise | PRD 02 §24–25 | RF-C1-057..068 | `/app/analise-perfil/comparar/[id]`, `/app/historico` | `analyses` | imutabilidade | verificado ao vivo em `/app/historico` (lista Core 1 + Core 2, ordenada, com score/banda); tela de comparação lado a lado não implementada | `profile_reanalysis_started/completed` (não instrumentado) | in_progress |
| Feedback | PRD 02 §26 | RF-C1-069..073 | idem resultado | `analysis_feedback` | 1 feedback principal/análise (`unique(analysis_id, user_id)`, upsert) | verificado ao vivo: envio de nota de utilidade (1–5), especificidade e comentário; estado "já enviado" ao revisitar; sem teste automatizado dedicado | `analysis_feedback_submitted` (não instrumentado) | done |
| Créditos (Core 1) | PRD 02 §27 | RF-C1-074..076 | — | `credit_ledger` | gratuito no MVP (Core 1 não consome crédito) | verificado ao vivo (nenhuma reserva/consumo gerado pelo Core 1) | — | done |
| Guardrails de autenticidade | Guardrails §2–4, §7 | — | validador pós-IA | `authenticityValidation` | bloquear relatório se inflado | schema reserva o campo `authenticityValidation`; validador de bloqueio automático não implementado | — | in_progress |

## Core 2 — Diagnóstico de Aderência (PRD 03, Prompts e Schemas, Qualidade)

| Área | Doc/Seção | Requisitos | Rota(s) | Tabela(s) | Fórmula/regra | Teste | Evento(s) | Status |
|---|---|---|---|---|---|---|---|---|
| Escolha do tipo de análise | PRD 03 §6 | — | `/app/aderencia` | — | — | verificado ao vivo (hub linka vaga específica e cargo-alvo) | — | done |
| Referência de cargo-alvo | PRD 03 §7 | — | `/app/aderencia/cargo` | `role_references`, `role_reference_versions` | `blocking` (open-decisions #1) | `tests/unit/target-role.test.ts` | `target_role_analysis_started/completed` | blocked (parcial) |
| Entrada/estruturação de vaga | PRD 03 §8–10 | RF-C2-001..004 | `/app/aderencia/vaga/nova` | `opportunities`, `opportunity_versions`, `requirements` | texto colado + IA (P-007) estrutura requisitos | verificado ao vivo end-to-end (3 requisitos extraídos e persistidos após fix de RLS — migration `...000020`); sem teste automatizado dedicado | `opportunity_upload_started/completed` (não instrumentado — ver Fase 8) | done |
| Classificação de criticidade | PRD 03 §11 | — | — | `requirements.criticality` | confiança < 0,75 não aciona limite | verificado ao vivo (obrigatório/desejável/impeditivo classificados); regra de confiança coberta indiretamente por `tests/unit/iao-engine.test.ts` (via `extractionConfidence`) | — | in_progress |
| Revisão/confirmação da vaga | PRD 03 §12 | RF-C2-005..012 | `/app/aderencia/vaga/[jobId]/revisao` | `opportunity_versions` | imutabilidade após confirmação (`confirmation_status`) | verificado ao vivo (marcar não aplicável + confirmar vaga); sem teste automatizado dedicado | `opportunity_confirmed` (não instrumentado) | done |
| Cálculo do IAO | PRD 03 §23–25, Motor | — | — | `src/domain/scores/iao.ts` | pesos por criticidade + fatores + caps 49/59/59 | `tests/unit/iao-engine.test.ts` (11 testes, casos IAO-001..007, passando) + verificado ao vivo (IAO=77) | — | done |
| Confiança (Core 2) | Motor §13 | RF-C2-035..041 | — | `src/domain/scores/confidence.ts` (compartilhado) | mesma fórmula do Core 1 | `tests/unit/confidence-engine.test.ts` + verificado ao vivo (banda "Alta") | — | done |
| Riscos e bloqueadores | PRD 03 §30 | — | resultado | `analysis_limits` | localização nunca usa `personal_data` (open-decisions #12) | persistência wired e coberta indiretamente por `tests/unit/iao-engine.test.ts` (caps); não observado ao vivo pois o fixture sintético não gerou `confirmed_mismatch` nesta execução | — | in_progress |
| Recomendação final | PRD 03 §31–32 | — | resultado | `fit_analysis_results.recommendation_type` | precedência determinística (8 níveis) | `tests/unit/recommendation-precedence.test.ts` (13 testes, passando) + verificado ao vivo (persistência e UI: "Aplicar com ajustes") | `job_recommendation_received` (não instrumentado) | done |
| Plano de ações (Core 2) | PRD 03 §35 | RF-C2-042..047 | `/app/acoes` | `actions` | máx 5 (compartilhado com Core 1, ver seção Core 1) | `/app/acoes` já existe e listaria ações de qualquer core, mas o Core 2 não gera `recommendations` itemizadas (só a recomendação única em `fit_analysis_results.recommendation_type`) — não há candidato para converter em ação ainda | `opportunity_action_started/completed` | not_started |
| Histórico/reanálise | PRD 03 §36 | RF-C2-048..052 | `/app/aderencia/comparar/[id]`, `/app/historico` | `analyses` | comparável só se mesma vaga/referência | verificado ao vivo em `/app/historico` (Core 2 listado com IAO/banda/recomendação) + idempotência (reuso sem reconsumo de crédito) verificada via `startJobAnalysisAction`; tela de comparação lado a lado não implementada | `fit_reanalysis_started/completed` | in_progress |
| Intenção de candidatura | PRD 03 §37 | RF-C2-053..057 | resultado (dentro do formulário de feedback) | `analysis_feedback.application_intent` | não altera IAO | verificado ao vivo (campo persiste corretamente, não usado em nenhum cálculo) | `application_intent_submitted` (não instrumentado) | done |
| Feedback (Core 2) | PRD 03 §38 | RF-C2-058..061 | resultado | `analysis_feedback` | igual ao Core 1, mais `application_intent` (intenção de candidatura) | verificado ao vivo: mesmo fluxo do Core 1 com o campo adicional de intenção de candidatura persistido corretamente; sem teste automatizado dedicado | `analysis_feedback_submitted` (não instrumentado) | done |
| Créditos (Core 2) | PRD 03 §39, §45 | RF-C2-062..065 | `/app/creditos` | `credit_accounts`, `credit_reservations`, `credit_ledger` | 1 crédito gratuito de boas-vindas; reserva→confirmação/liberação via RPC `SECURITY DEFINER` | verificado ao vivo end-to-end: reserva (1→0), confirmação, ledger, e reuso idempotente sem cobrança dupla (após fix de RLS — migration `...000021`); sem teste automatizado dedicado | `credit_consumed`, `credit_restored` (não instrumentados) | done |
| Retenção da vaga | PRD 03 §40 | RF-C2-066..068 | — | `documents.retention_deadline` | 24h | `tests/integration/retention.test.ts` | — | not_started |

## Prompts, schemas e validação de IA

| Área | Doc/Seção | Componente | Teste | Status |
|---|---|---|---|---|
| Catálogo de prompts P-001..012 | Prompts e Schemas §2 | `src/config/prompts/` | `tests/unit/prompt-contract.test.ts` | not_started |
| Schemas Zod (extração, Core 1, oportunidade, Core 2) | Prompts e Schemas §6–10 | `src/config/schemas/` | `tests/unit/schema-validation.test.ts` (6 testes, passando) | done |
| Pipeline de validação (10 etapas) | Prompts e Schemas §11 | `src/application/use-cases/validate-ai-output.ts` | `tests/unit/validation-pipeline.test.ts` | not_started |
| Retentativa de reparo de schema | Prompts e Schemas §12 | `src/infrastructure/ai/` | `tests/unit/schema-repair.test.ts` | not_started |
| Prompt injection | Guardrails §9, Prompts e Schemas §5 | delimitação de contexto | `tests/unit/prompt-injection.test.ts` (SEC-001..003) | not_started |

## Funcionalidades de apoio

| Área | Doc/Seção | Rota(s) | Tabela(s) | Status |
|---|---|---|---|---|
| Dashboard | Sitemap §4 | `/app/dashboard` | leitura agregada, sem cálculo | done |
| Meu perfil | Sitemap §4 | `/app/perfil/*` | `professional_profiles`, `profile_versions` | not_started |
| Histórico | Sitemap §4 | `/app/historico` | `analyses` | done |
| Ações | Sitemap §4 | `/app/acoes` | `actions` | done |
| Créditos e oferta simulada | Sitemap §4, Modelo de Negócio | `/app/creditos` | `credit_accounts`, `purchase_intents` | done |
| Conta | Sitemap §4, Segurança §7 | `/app/conta` | `deletion_requests`, `consent_records` | in_progress (exclusão parcial — ver linha "Exclusão de conta"; `consent_records` ainda não é gravado nem exibido) |

## Analytics e observabilidade

| Área | Doc/Seção | Componente | Status |
|---|---|---|---|
| Catálogo canônico de eventos | Analytics (completo) | `src/infrastructure/analytics/events.ts` (todos os nomes do documento) | done |
| Porta + adapter de analytics | Arquitetura §4.9 | `src/application/ports/analytics.ts`, `src/infrastructure/analytics/console-adapter.ts` (sem provedor real — open-decisions #23) | done |
| Instrumentação backend (~22 eventos do funil signup→Core1→Core2→créditos→exclusão) | Analytics §17 ("emitidos preferencialmente pelo backend, após persistência") | `src/features/*/actions.ts` | verificado ao vivo (`login_completed`, `purchase_intent_confirmed` observados no log com envelope correto, `user_id` hasheado, sem PII); `tests/unit/analytics-payload.test.ts` (6 testes) | done |
| Eventos de página/client-side (`landing_viewed`, `credits_viewed`, `paywall_viewed`, `onboarding_abandoned` e demais eventos derivados) | Analytics §5–§6 | catalogados em `events.ts`, não disparados | not_started |
| Observabilidade técnica | Arquitetura §12, Segurança §14 | `src/infrastructure/monitoring/` | not_started |
| Runbooks de incidente | Incidentes §15 | `docs/runbooks/*.md` | not_started |

Este documento é atualizado conforme cada área é implementada e testada — ver `implementation-plan.md` para a ordem de execução.
