# Implementation Plan — CareerTwin MVP

Baseado em `source-map.md`, `requirements-traceability.md` e `open-decisions.md`. Segue as fases do prompt mestre. Cada fase lista entregáveis, testes e critério de conclusão.

## Fase 0 — Auditoria e fundação — **concluída**
- Inventário de documentos (24 arquivos, `source-map.md`).
- Extração completa via 6 agentes paralelos (`docs/implementation/extracts/`).
- Node.js 24 instalado localmente (ambiente não tinha Node/Homebrew — ver relatório final).
- Next.js 15 (App Router) + React 19 + TypeScript estrito + Tailwind + ESLint + Prettier + Vitest + Playwright configurados.
- Estrutura de pastas (`src/{app,components,features,domain,application,infrastructure,lib,config}`, `tests/`, `supabase/{migrations,policies}`, `docs/`).
- `src/lib/env.ts` (validação Zod de env vars, falha explícita), `src/lib/errors/`, `src/lib/security/correlation.ts`.
- `.env.example`, `.gitignore`.
- Critério de conclusão: `npm run build` e `npm run typecheck` passam. **Atendido.**

## Fase 1 — Design System, site e autenticação
Entregáveis:
- Tokens Tailwind/CSS a partir de "Leitura do estilo visual" (`tailwind.config.ts`, `globals.css`) — **concluído na Fase 0**.
- Componentes shadcn/ui base (Button, Card, Input, etc.) instalados e personalizados com os tokens.
- Layout público (`src/app/(public)/layout.tsx`), landing page, `/termos`, `/privacidade`.
- Supabase Auth: cadastro, login, recuperação/redefinição de senha, logout.
- Middleware de proteção de rotas + redirecionamento por estado de conta.
- Estados de interface completos (loading/empty/error/disabled/hover/focus).
Testes: `tests/e2e/site.spec.ts`, `tests/e2e/auth.spec.ts`, `tests/unit/auth-messages.test.ts`.
Critério de conclusão: fluxo cadastro→onboarding e login→dashboard funcionam via Playwright contra um Supabase local ou mock de auth.

## Fase 2 — Banco, migrations e segurança
Entregáveis:
- Migrations SQL completas para as ~30 tabelas do Modelo de Dados (`supabase/migrations/`), na ordem: contas → dados pessoais → Thin Twin/versões → contexto-alvo/versões → experiências/competências/ferramentas/evidências/formação → documentos → jobs → análises (Core 1 e Core 2) → oportunidades/requisitos/referências de cargo → recomendações/ações → feedback → créditos → consentimento/exclusão → auditoria.
- Políticas RLS por tabela (`supabase/policies/` ou embutidas nas migrations).
- Colunas geradas/constraints de integridade (ver `open-decisions.md` #13).
- Testes de RLS: proprietário / outro usuário / anônimo / `user_id` malicioso / cadeia de propriedade indireta / service role / imutabilidade de versão confirmada.
Testes: `tests/integration/schema.test.ts`, `tests/integration/rls.test.ts`.
Critério de conclusão: todos os testes de RLS passam contra uma instância Postgres local (Supabase CLI ou Postgres direto).

## Fase 3 — Onboarding, documentos e Thin Twin
Entregáveis: fluxo completo das 9 etapas do PRD 01; upload privado via URL assinada; pipeline de extração (adapter real + adapter de desenvolvimento sintético); revisão/confirmação; versionamento imutável; contexto-alvo separado; retomada; retenção/exclusão de arquivos.
Testes: `tests/e2e/onboarding.spec.ts`, `tests/unit/thin-twin-versioning.test.ts`, `tests/integration/upload.test.ts`, `tests/integration/retention.test.ts`.
Critério de conclusão: um usuário sintético completa onboarding e chega ao Core 1 com um Thin Twin confirmado e versionado.

## Fase 4 — Jobs e integração com IA
Entregáveis: abstração de job durável (fila + worker, idempotência, timeout, retentativas 15s/60s/5min, DLQ); porta `AiProvider` + adapter real + adapter de desenvolvimento; pipeline de validação de schema (10 etapas); versionamento de prompt/schema/modelo/config; proteção contra prompt injection.
Testes: `tests/integration/jobs.test.ts`, `tests/unit/schema-validation.test.ts`, `tests/unit/prompt-injection.test.ts`.
Critério de conclusão: um job simulado com falha é reprocessado corretamente sem duplicar análise nem consumir crédito.

## Fase 5 — Core 1
Entregáveis: motor determinístico do IPP (`src/domain/scores/ipp.ts`), confiança (`confidence.ts`), priorização (`priority.ts`) — cada um em arquivo único, sem duplicação de pesos; pipeline completo (congelamento de versões → IA classifica → backend calcula → persiste); UI de resultado; recomendações/ações; feedback; reanálise.
Testes: `tests/unit/ipp-engine.test.ts` (casos IPP-001..005 do doc de Qualidade), `tests/unit/confidence-engine.test.ts`, `tests/unit/priority-engine.test.ts`, `tests/unit/authenticity-validator.test.ts` (AUT-001..005), `tests/e2e/core1.spec.ts`.
Critério de conclusão: motor determinístico — mesmas entradas + mesmas versões produzem exatamente o mesmo IPP (teste de determinismo obrigatório, RNF-C1-007).

## Fase 6 — Core 2
Entregáveis: escolha cargo-alvo/vaga; upload/estruturação de vaga; revisão/confirmação imutável; motor determinístico do IAO (`src/domain/scores/iao.ts`) com caps de segurança e precedência de recomendação; riscos/bloqueadores; créditos (reserva→confirmação); histórico/reanálise; intenção de candidatura; feedback. Caminho de cargo-alvo implementado como infraestrutura completa mas funcionalmente bloqueado (`insufficient_data`) até haver catálogo aprovado (ver `open-decisions.md` #1).
Testes: `tests/unit/iao-engine.test.ts` (casos IAO-001..007), `tests/unit/recommendation-precedence.test.ts`, `tests/unit/risk-detection.test.ts`, `tests/integration/credits.test.ts`, `tests/e2e/core2.spec.ts`.
Critério de conclusão: os 7 casos de teste IAO do doc de Qualidade passam; análise de vaga específica funciona ponta a ponta; análise de cargo-alvo retorna `insufficient_data` de forma correta (não uma análise fabricada).

## Fase 7 — Funcionalidades de apoio
Entregáveis: dashboard (leitura agregada, sem recálculo), meu perfil, histórico, ações, créditos + oferta simulada + intenção de compra (sem pagamento real), conta (exclusão com fluxo de 21 passos do doc de Segurança).
Testes: `tests/e2e/dashboard.spec.ts`, `tests/e2e/actions.spec.ts`, `tests/integration/deletion.test.ts`.
Critério de conclusão: exclusão de conta idempotente e auditável funciona ponta a ponta contra dados sintéticos.

## Fase 8 — Analytics, observabilidade e incidentes
Entregáveis: catálogo canônico de eventos (`src/infrastructure/analytics/events.ts`, nomes exatos dos 5 extracts, nada além); adapter de analytics substituível; observabilidade técnica mínima (correlation IDs, métricas de job); runbooks para os incidentes prioritários (`docs/runbooks/`).
Testes: `tests/unit/analytics-payload.test.ts` (garante que nenhum campo proibido é enviado).
Critério de conclusão: teste unitário que falha se qualquer payload de evento contiver um dos campos da lista "nunca enviar".

## Fase 9 — QA e preparação de release
Entregáveis: suíte completa (unitários do motor, fronteira, schemas, idempotência, concorrência, integração, RLS, storage, retenção, exclusão, créditos, prompt injection, falha de provedor, E2E dos fluxos principais, acessibilidade), lint, typecheck, build de produção.
Critério de conclusão: `npm run verify` (lint + typecheck + testes unitários) e `npm run build` passam; critérios de bloqueio do alpha (Qualidade e Casos de Teste §16) revisados um a um.

---

## Ordem de dependências entre fases

```
Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 (Core 1)
                                            ↘ Fase 6 (Core 2, não depende tecnicamente do Core 1)
Fase 5, Fase 6 → Fase 7 → Fase 8 → Fase 9
```

Core 1 e Core 2 podem ser desenvolvidos em paralelo depois da Fase 4, pois nenhum é pré-condição técnica do outro (regra explícita repetida em todos os documentos) — mas ambos dependem de Fase 3 (Thin Twin confirmado) estar completa.

## Ritmo desta sessão

Dado o volume real do MVP (24 documentos-fonte, ~30 tabelas, dois motores determinísticos completos, IA, auth, uploads, testes), a fundação (Fase 0) e o modelo de dados/motor de scores (núcleo das Fases 2, 5 e 6) recebem prioridade nesta sessão por serem a parte mais irreversível e mais citada como bloqueadora de release em caso de erro (Segurança §17, Guardrails). Superfícies de apoio (Fase 7) e QA exaustivo (Fase 9) recebem cobertura proporcional ao tempo restante; o relatório final lista explicitamente o que ficou completo, parcial e pendente.
