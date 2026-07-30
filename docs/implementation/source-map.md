# Source Map — CareerTwin

Inventário de todos os documentos-fonte encontrados no repositório em `/Users/macbook/Documents/Projeto CareerTwin`, sua finalidade, posição na regra de precedência e status. Base para `requirements-traceability.md` e `open-decisions.md`.

Todos os documentos foram lidos integralmente (via agentes de extração paralelos) e sintetizados em `docs/implementation/extracts/*.md`. Este source-map referencia os extracts, não os arquivos originais, para navegação.

**Nota (30/07/2026):** as pastas de documentos-fonte originais (exportadas do Notion) foram removidas do repositório a pedido do Product Owner após a conclusão da implementação, para manter no GitHub apenas o projeto de software. Os `extracts/*.md` abaixo passam a ser a única cópia literal do conteúdo desses documentos dentro deste repositório — as referências a seções específicas (ex.: "PRD 03 §35") em `open-decisions.md`/`requirements-traceability.md` continuam verificáveis neles.

## Regra de precedência aplicada (conforme os próprios documentos)

1. Instruções explícitas mais recentes do Product Owner (nenhuma além do prompt mestre desta sessão — o campo "Product Owner" no Product One Page está com placeholder `[Nome do Product Owner]`, não preenchido).
2. Decision Log (35 decisões consolidadas + 1 pendência explícita).
3. Fonte Canônica de Contexto vigente — **documento não encontrado no repositório** (citado por várias fontes como existente, ausente fisicamente).
4. Product One Page (v1.2, 29/07/2026).
5. PRDs 00, 01, 02, 03.
6. Documentos técnicos: Motor de Análise e Scores, Thin Twin, Modelo de Dados, Prompts e Schemas, Arquitetura, Segurança, Analytics, Guardrails, Qualidade e Casos de Teste, Incidentes.
7. Leitura do estilo visual, Sitemap, Escopo do MVP, Jornada do Usuário, VICP, Hipóteses, Modelo de Negócio, Visão e Estratégia (pesquisa/produto — usados como contexto, não como fonte de regra técnica isolada quando há conflito com PRDs/docs técnicos).

## Documentos encontrados

| # | Título | Pasta | Linhas | Data/versão interna | Nível de precedência | Extract correspondente |
|---|---|---|---|---|---|---|
| 1 | Decision Log | Estratégia | 75 | 27/07/2026 23:12 | 2 | `extracts/estrategia-produto.md` |
| 2 | Hipóteses | Estratégia | 33 | 27/07/2026 23:12 | 7 | `extracts/estrategia-produto.md` |
| 3 | Modelo de Negócio | Estratégia | 48 | 27/07/2026 23:12 | 7 | `extracts/estrategia-produto.md` |
| 4 | VICP e Público-Alvo | Estratégia | 33 | 27/07/2026 23:11 | 7 | `extracts/estrategia-produto.md` |
| 5 | Visão e Estratégia do Produto | Estratégia | 58 | 27/07/2026 23:10 | 7 | `extracts/estrategia-produto.md` |
| 6 | Product One Page | Insumos | 1987 | v1.2, 29/07/2026 | 4 | `extracts/estrategia-produto.md` |
| 7 | Sitemap — CareerTwin MVP | Insumos | 1628 | v1.1, 28/07/2026 | 7 (mapa de navegação — não substitui PRDs) | `extracts/sitemap-auth-design-escopo.md` |
| 8 | PRD — 00 Site Público, Home LP e Autenticação | Insumos | 1099 | 28/07/2026 17:54 | 5 | `extracts/sitemap-auth-design-escopo.md` |
| 9 | Leitura do estilo visual | Insumos | 770 | 28/07/2026 17:15 | 7 (mas é a única fonte de tokens visuais — tratada como autoritativa para design na ausência de "Style Guide CareerTwin" formal) | `extracts/sitemap-auth-design-escopo.md` |
| 10 | PRD 01 — Onboarding e Perfil | Insumos | 2405 | 27/07/2026 23:15 | 5 | `extracts/onboarding-thintwin.md` |
| 11 | PRD 02 — Core 1 Análise de Perfil | Insumos | 2117 | 27/07/2026 23:16 | 5 | `extracts/core1-motor-guardrails.md` |
| 12 | PRD 03 — Core 2 Diagnóstico de Aderência | Insumos | 2725 | 27/07/2026 23:16 | 5 | `extracts/core2-prompts-qualidade.md` |
| 13 | Escopo do MVP | Produto | 250 | 27/07/2026 23:13 | 7 | `extracts/sitemap-auth-design-escopo.md` |
| 14 | Jornada do Usuário | Produto | 428 | 27/07/2026 23:14 | 7 | `extracts/sitemap-auth-design-escopo.md` |
| 15 | Thin Twin | Inteligência Artificial | 617 | 27/07/2026 23:00 | 6 | `extracts/onboarding-thintwin.md` |
| 16 | Motor de Análise e Scores | Inteligência Artificial | 806 | 27/07/2026 23:03 | 6 (mas é a fonte canônica das fórmulas — maior peso técnico que os PRDs em caso de conflito numérico) | `extracts/core1-motor-guardrails.md` |
| 17 | Prompts e Schemas | Inteligência Artificial | 710 | 27/07/2026 23:05 | 6 | `extracts/core2-prompts-qualidade.md` |
| 18 | Guardrails | Inteligência Artificial | 447 | 27/07/2026 23:05 | 6 | `extracts/core1-motor-guardrails.md` |
| 19 | Qualidade e Casos de Teste | Inteligência Artificial | 778 | 27/07/2026 23:06 | 6 | `extracts/core2-prompts-qualidade.md` |
| 20 | Arquitetura | Engenharia | 1022 | 27/07/2026 23:20 | 6 | `extracts/engenharia-arquitetura-dados-seguranca.md` |
| 21 | Modelo de Dados | Engenharia | 2017 | 27/07/2026 23:23 | 6 | `extracts/engenharia-arquitetura-dados-seguranca.md` |
| 22 | Segurança, Privacidade e Retenção | Engenharia | 1123 | 27/07/2026 23:24 | 6 | `extracts/engenharia-arquitetura-dados-seguranca.md` |
| 23 | Analytics | Engenharia | 683 | 27/07/2026 23:25 | 6 | `extracts/engenharia-arquitetura-dados-seguranca.md` |
| 24 | Incidentes | Engenharia | 821 | 27/07/2026 23:25 | 6 | `extracts/engenharia-arquitetura-dados-seguranca.md` |

Total: 24 documentos `.md`, ~22.900 linhas / ~78.000 palavras. Nenhum outro tipo de arquivo (config, asset visual, logo) foi encontrado no repositório além destes 24 Markdown e um `.DS_Store`.

## Documentos citados mas ausentes do repositório

Estes nomes aparecem repetidamente nos 24 documentos como dependências ou fontes de maior precedência, mas **não existem fisicamente** no repositório:

| Documento citado | Onde é citado | Impacto |
|---|---|---|
| **Fonte Canônica de Contexto** | Decision Log, Product One Page, PRD 01/02/03, Arquitetura | Citada como 3ª posição na hierarquia de precedência (acima do Product One Page). Ausência não bloqueia trabalho — os documentos existentes já são suficientemente detalhados — mas qualquer decisão futura que alegue basear-se nela deve ser verificada. |
| **Style Guide CareerTwin** (nome formal citado em PRD 00 e Sitemap) | PRD 00 §20/RNF-SITE-008, Sitemap §18 | Tratado como possivelmente o mesmo artefato que "Leitura do estilo visual" (não confirmado nos documentos). Usamos "Leitura do estilo visual" como fonte de tokens visuais — ver `open-decisions.md`. |
| **Catálogo de Referências de Cargo** | PRD 03 §7, §48, §50 | Citado apenas como nome + shape de tipo (`TargetRoleReference`), sem conteúdo. Bloqueia definitivamente a análise por cargo-alvo do Core 2 — ver `open-decisions.md` (blocking). |
| **Gestão de Créditos** (documento dedicado) | PRD 03 §50 | Citado como documento relacionado; teria detalhes sobre fluxo de "zero créditos" e oferta simulada de créditos adicionais que faltam no PRD 03. Ausente do repositório. |
| **Design System e tokens** (arquivo/spec dedicado, além da "Leitura do estilo visual") | Prompt mestre desta sessão | Não encontrado como artefato separado — "Leitura do estilo visual" é o único documento de design encontrado. |
| **Assets e logos oficiais** | Leitura do estilo visual, PRD 00 §5 | Nenhum arquivo de imagem/SVG encontrado no repositório (`find` por `.svg`/`.png`/`*logo*` não retornou nada). Ver `open-decisions.md` (`missing_asset`). |
| **Relatório de Benchmarking** | Prompt mestre desta sessão | Não encontrado no repositório. |
| **Relatório de desk research** | Prompt mestre desta sessão (mencionado indiretamente em Hipóteses: "desk research, benchmarking, pitches e protótipos são fontes de hipótese, não evidência de validação") | Não encontrado como arquivo separado no repositório. |

## Documentos aparentemente duplicados ou substituídos

Nenhuma duplicata literal foi encontrada. Observações relevantes:
- O **Product One Page** (v1.2) parece ser uma consolidação atualizada e sincronizada com o **Decision Log** (datas de atualização próximas — 27/07 e 29/07/2026), sem contradições factuais entre os dois nos números-chave (pesos do IPP, preço da oferta simulada, público-alvo).
- O **Sitemap** usa `/app/dashboard` como rota do dashboard; o **PRD 00** usa `/dashboard` na sua tabela de rotas oficiais. Isto não é uma duplicata de documento, mas uma divergência de conteúdo entre dois documentos de precedência diferente — resolvida por precedência (PRD 00, nível 5, prevalece sobre Sitemap, nível 7) e registrada em `open-decisions.md` como `resolved_by_precedence`.

## Numeração de fontes que se auto-corrigem (não são conflitos, mas merecem nota)

O Motor de Análise e Scores explicitamente corrige um "valor antigo de referência" (fator de `evidence_gap` no IAO: 30% legado → 0,40 oficial vigente, confirmado também no doc de Qualidade). Isso não é uma divergência a resolver — é uma migração de valor já decidida nos próprios documentos; registrado aqui apenas para que nenhuma implementação use por engano o valor de 0,30.
