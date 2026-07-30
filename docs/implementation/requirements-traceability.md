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
| Exclusão de conta | PRD 00 §Conta, Segurança §7 | RF-AUTH-029..034 | `/app/conta` | `deletion_requests` | metas 15/30 dias | `tests/integration/deletion.test.ts` | `account_deletion_requested` (versão mínima) | not_started |
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
| Identificação básica | PRD 01 §5, §11 | RF-ONB-011..020 | `/onboarding` (etapa 2) | `personal_data` | `tests/unit/personal-data.test.ts` | — | not_started |
| Upload de currículo | PRD 01 §12 | RF-ONB-021..038 | `/onboarding` (etapa 3) | `documents`, `document_extractions` | `tests/integration/upload.test.ts` | `resume_uploaded`, `upload_failed` | not_started |
| Upload de LinkedIn | PRD 01 §13 | RF-ONB-039..051 | `/onboarding` (etapa 4) | `documents` | `tests/integration/upload.test.ts` | `linkedin_uploaded` | not_started |
| Conteúdo mínimo | PRD 01 §14 | RF-ONB-052..054 | — | `documents.status = insufficient_content` | `tests/unit/content-validation.test.ts` | — | not_started |
| Segurança de upload | PRD 01 §15, Segurança §11 | RF-ONB-055..064 | — | `documents` | `tests/integration/upload-security.test.ts` | — | not_started |
| Pipeline de extração/OCR | PRD 01 §17–18 | RF-ONB-071..087 | worker | `document_extractions` | `tests/unit/extraction-pipeline.test.ts` | `twin_extraction_started/completed/failed` | not_started |
| Fila/idempotência/retomada | PRD 01 §19–20 | RF-ONB-088..100 | worker | `processing_jobs` | `tests/integration/jobs.test.ts` | — | not_started |
| Revisão do perfil | PRD 01 §30–31 | RF-ONB-113..127 | `/onboarding` (etapa 6) | `experiences`, `profile_skills`, etc. | `tests/e2e/onboarding.spec.ts` | `twin_review_started`, `twin_field_corrected/added/removed`, `twin_conflict_resolved` | not_started |
| Confirmação do Thin Twin | PRD 01 §32, Thin Twin §6/§11 | RF-ONB-128..133 | `/onboarding` (etapa 7) | `profile_versions` | `tests/unit/thin-twin-versioning.test.ts` | `twin_profile_confirmed`, `twin_version_created` | not_started |
| Contexto-alvo | PRD 01 §34 | RF-ONB-140..149 | `/onboarding` (etapa 8) | `target_contexts`, `target_context_versions` | `tests/unit/target-context.test.ts` | `target_role_defined/suggested/selected` | not_started |
| Conclusão | PRD 01 §36 | RF-ONB-150..155 | `/onboarding` (etapa 9) | `user_accounts.onboarding_status` | `tests/e2e/onboarding.spec.ts` | `onboarding_completed` | not_started |
| Retenção de arquivos | PRD 01 §37 | RF-ONB-104, 156–158 | — | `documents.retention_deadline` | `tests/integration/retention.test.ts` | — | not_started |

## Core 1 — Análise de Perfil (PRD 02, Motor, Guardrails)

| Área | Doc/Seção | Requisitos | Rota(s) | Tabela(s) | Fórmula/regra | Teste | Evento(s) | Status |
|---|---|---|---|---|---|---|---|---|
| Pré-condições e gatilho | PRD 02 §7 | — | `/app/analise-perfil` | — | bloqueio → `insufficient_data` | `tests/unit/core1-preconditions.test.ts` | `profile_analysis_blocked` | not_started |
| Congelamento de versões | PRD 02 §9, §12 | RF-C1-001..011 | — | `analyses` | chave de idempotência §12 | `tests/integration/core1-idempotency.test.ts` | `profile_analysis_started` | not_started |
| Cálculo do IPP | Motor §5–7 | — | — | `src/domain/scores/ipp.ts` | pesos 15/20/20/15/10/10/10; `Math.round` | `tests/unit/ipp-engine.test.ts` (9 testes, passando) | — | done |
| Confiança | Motor §13 | — | — | `src/domain/scores/confidence.ts` | pesos 30/30/25/15 | `tests/unit/confidence-engine.test.ts` (5 testes, passando) | — | done |
| Recomendações e priorização | PRD 02 §20–21 | RF-C1-029..041 | `/app/analise-perfil/[analysisId]` | `recommendations` | máx 8/3 destacadas; `priorityScore100` | `tests/unit/priority-engine.test.ts` (motor de priorização testado, 4 testes); UI/persistência não implementadas | `recommendation_viewed/selected` | in_progress |
| Tradução da experiência | PRD 02 §22 | RF-C1-042..050 | idem | — | validação de autenticidade obrigatória | `tests/unit/experience-translation.test.ts` (AUT-001..005) | `experience_suggestion_copied` | not_started |
| Plano de evolução / ações | PRD 02 §23 | RF-C1-051..056 | `/app/acoes` | `actions` | máx 5 ações | `tests/e2e/actions.spec.ts` | `action_started/completed` | not_started |
| Histórico/reanálise | PRD 02 §24–25 | RF-C1-057..068 | `/app/analise-perfil/comparar/[id]`, `/app/historico` | `analyses` | imutabilidade | `tests/integration/core1-reanalysis.test.ts` | `profile_reanalysis_started/completed` | not_started |
| Feedback | PRD 02 §26 | RF-C1-069..073 | idem resultado | `analysis_feedback` | 1 feedback principal/análise | `tests/unit/feedback.test.ts` | `analysis_feedback_submitted` | not_started |
| Créditos (Core 1) | PRD 02 §27 | RF-C1-074..076 | — | `credit_ledger` | gratuito no MVP | `tests/integration/credits.test.ts` | — | not_started |
| Guardrails de autenticidade | Guardrails §2–4, §7 | — | validador pós-IA | `authenticityValidation` | bloquear relatório se inflado | `tests/unit/authenticity-validator.test.ts` (AUT-001..005) | — | not_started |

## Core 2 — Diagnóstico de Aderência (PRD 03, Prompts e Schemas, Qualidade)

| Área | Doc/Seção | Requisitos | Rota(s) | Tabela(s) | Fórmula/regra | Teste | Evento(s) | Status |
|---|---|---|---|---|---|---|---|---|
| Escolha do tipo de análise | PRD 03 §6 | — | `/app/aderencia` | — | — | `tests/e2e/core2.spec.ts` | — | not_started |
| Referência de cargo-alvo | PRD 03 §7 | — | `/app/aderencia/cargo` | `role_references`, `role_reference_versions` | `blocking` (open-decisions #1) | `tests/unit/target-role.test.ts` | `target_role_analysis_started/completed` | blocked (parcial) |
| Entrada/estruturação de vaga | PRD 03 §8–10 | RF-C2-001..004 | `/app/aderencia/vaga/nova` | `opportunities`, `opportunity_versions`, `requirements` | `blocking` (open-decisions #3) | `tests/unit/opportunity-validation.test.ts` | `opportunity_upload_started/completed`, `opportunity_validation_failed` | in_progress |
| Classificação de criticidade | PRD 03 §11 | — | — | `requirements.criticality` | confiança < 0,75 não aciona limite | `tests/unit/criticality-classification.test.ts` | — | not_started |
| Revisão/confirmação da vaga | PRD 03 §12 | RF-C2-005..012 | `/app/aderencia/vaga/[jobId]/revisao` | `opportunity_versions` | imutabilidade após confirmação | `tests/e2e/core2.spec.ts` | `opportunity_structuring_completed`, `opportunity_confirmed` | not_started |
| Cálculo do IAO | PRD 03 §23–25, Motor | — | — | `src/domain/scores/iao.ts` | pesos por criticidade + fatores + caps 49/59/59 | `tests/unit/iao-engine.test.ts` (11 testes, casos IAO-001..007, passando) | — | done |
| Confiança (Core 2) | Motor §13 | RF-C2-035..041 | — | `src/domain/scores/confidence.ts` (compartilhado) | mesma fórmula do Core 1 | `tests/unit/confidence-engine.test.ts` | — | done |
| Riscos e bloqueadores | PRD 03 §30 | — | resultado | `analysis_limits` | localização nunca usa `personal_data` (open-decisions #12) | `tests/unit/risk-detection.test.ts` | — | not_started |
| Recomendação final | PRD 03 §31–32 | — | resultado | `fit_analysis_results.recommendation_type` | precedência determinística (8 níveis) | `tests/unit/recommendation-precedence.test.ts` (13 testes, passando) — persistência/UI não implementadas | `job_recommendation_received` | in_progress |
| Plano de ações (Core 2) | PRD 03 §35 | RF-C2-042..047 | `/app/acoes` | `actions` | máx 5 | `tests/e2e/actions.spec.ts` | `opportunity_action_started/completed` | not_started |
| Histórico/reanálise | PRD 03 §36 | RF-C2-048..052 | `/app/aderencia/comparar/[id]` | `analyses` | comparável só se mesma vaga/referência | `tests/integration/core2-reanalysis.test.ts` | `fit_reanalysis_started/completed` | not_started |
| Intenção de candidatura | PRD 03 §37 | RF-C2-053..057 | resultado | `analysis_feedback.application_intent` | não altera IAO | `tests/unit/application-intent.test.ts` | `application_intent_submitted` | not_started |
| Feedback (Core 2) | PRD 03 §38 | RF-C2-058..061 | resultado | `analysis_feedback` | igual ao Core 1 | `tests/unit/feedback.test.ts` | `analysis_feedback_submitted` | not_started |
| Créditos (Core 2) | PRD 03 §39, §45 | RF-C2-062..065 | `/app/creditos` | `credit_accounts`, `credit_reservations`, `credit_ledger` | 1 análise gratuita; reserva→confirmação | `tests/integration/credits.test.ts` | `credit_consumed`, `credit_restored` | not_started |
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
| Dashboard | Sitemap §4 | `/app/dashboard` | leitura agregada, sem cálculo | not_started |
| Meu perfil | Sitemap §4 | `/app/perfil/*` | `professional_profiles`, `profile_versions` | not_started |
| Histórico | Sitemap §4 | `/app/historico` | `analyses` | not_started |
| Ações | Sitemap §4 | `/app/acoes` | `actions` | not_started |
| Créditos e oferta simulada | Sitemap §4, Modelo de Negócio | `/app/creditos` | `credit_accounts`, `purchase_intents` | not_started |
| Conta | Sitemap §4, Segurança §7 | `/app/conta` | `deletion_requests`, `consent_records` | not_started |

## Analytics e observabilidade

| Área | Doc/Seção | Componente | Status |
|---|---|---|---|
| Catálogo canônico de eventos | Analytics (completo) | `src/infrastructure/analytics/events.ts` | not_started |
| Adapter de analytics | Arquitetura §4.9 | `src/infrastructure/analytics/` | not_started |
| Observabilidade técnica | Arquitetura §12, Segurança §14 | `src/infrastructure/monitoring/` | not_started |
| Runbooks de incidente | Incidentes §15 | `docs/runbooks/*.md` | not_started |

Este documento é atualizado conforme cada área é implementada e testada — ver `implementation-plan.md` para a ordem de execução.
