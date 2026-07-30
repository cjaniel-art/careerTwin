# CareerTwin

Mentor de carreira com inteligência artificial para profissionais brasileiros de tecnologia, produto e design. Este repositório contém o MVP em implementação — ver `docs/implementation/` para a auditoria completa dos documentos-fonte, a matriz de rastreabilidade, as decisões pendentes e o plano de fases.

## Stack (baseline provisório — ver `docs/implementation/open-decisions.md` #18)

- Next.js 15 (App Router) + React 19 + TypeScript estrito
- Tailwind CSS + tokens da marca (`Leitura do estilo visual`) + shadcn/ui
- Supabase (Auth + Postgres + Storage)
- Zod para validação de contratos
- Vitest (unitário) + Playwright (E2E)

## Setup local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente: copie `.env.example` para `.env.local` e preencha os valores. Um projeto Supabase de desenvolvimento (`careertwin-dev`) já foi provisionado durante a implementação inicial — as credenciais públicas (URL e anon key) já estão em `.env.local` neste checkout; a `SUPABASE_SERVICE_ROLE_KEY` precisa ser obtida manualmente em [supabase.com/dashboard](https://supabase.com/dashboard) (Project Settings → API Keys) e não é necessária para os fluxos implementados até agora.

3. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse http://localhost:3000.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Roda o build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript em modo estrito, sem emitir arquivos |
| `npm run test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes end-to-end (Playwright) — requer app rodando |
| `npm run verify` | lint + typecheck + testes unitários |

## Banco de dados

As migrations vivem em `supabase/migrations/`, numeradas e aplicadas em ordem. Elas já foram aplicadas e testadas (RLS incluído) contra um projeto Supabase real durante esta sessão — ver o relatório final da sessão para o registro dos testes executados.

Para aplicar as migrations em um novo projeto Supabase (via [Supabase CLI](https://supabase.com/docs/guides/cli)):

```bash
supabase link --project-ref <seu-project-ref>
supabase db push
```

Ou aplique manualmente cada arquivo de `supabase/migrations/`, em ordem, via SQL editor do Supabase.

## Estrutura do projeto

```text
src/
  app/              # rotas Next.js (App Router)
  components/       # componentes de UI reutilizáveis (shadcn-style)
  features/         # lógica de UI por funcionalidade (auth, onboarding, core-1, core-2, ...)
  domain/           # regras de negócio puras — motores de score, sem I/O
  application/       # casos de uso (orquestração), ainda não implementado
  infrastructure/   # adapters para Supabase, IA, analytics, storage, jobs
  lib/              # validação, erros tipados, segurança, utilitários
  config/           # engine (pesos/faixas/caps), rubrics, prompts, schemas — fonte única de verdade
supabase/
  migrations/       # migrations SQL, numeradas e aplicadas em ordem
tests/
  unit/             # Vitest — principalmente os motores determinísticos
  integration/       # ainda não implementado
  e2e/              # ainda não implementado
docs/
  implementation/   # auditoria de documentos, rastreabilidade, decisões pendentes, plano
```

## Documentação obrigatória de implementação

- [`docs/implementation/source-map.md`](docs/implementation/source-map.md) — inventário dos 24 documentos-fonte e regra de precedência aplicada.
- [`docs/implementation/requirements-traceability.md`](docs/implementation/requirements-traceability.md) — matriz de rastreabilidade requisito → rota → tabela → teste → status.
- [`docs/implementation/open-decisions.md`](docs/implementation/open-decisions.md) — toda decisão pendente, classificada, nunca resolvida silenciosamente.
- [`docs/implementation/implementation-plan.md`](docs/implementation/implementation-plan.md) — plano de fases e critérios de conclusão.
- [`docs/implementation/extracts/`](docs/implementation/extracts/) — extração estruturada e literal de cada documento-fonte (base para as decisões de implementação acima).

## Guardrails de produto (resumo)

- O backend, nunca a IA, calcula IPP, IAO, confiança e prioridade.
- Nenhuma análise concluída é sobrescrita; reanálise sempre cria um novo registro.
- Dados pessoais (nome, cidade, estado) nunca influenciam scores, confiança ou recomendações, e nunca são enviados à IA sem necessidade.
- Currículo, LinkedIn e descrições de vaga são sempre tratados como dados não confiáveis, nunca como instruções.
- Sem pagamento real no MVP — créditos e oferta são simulados.

Ver `docs/implementation/extracts/core1-motor-guardrails.md` (extração literal do documento "Guardrails") para a lista completa.
