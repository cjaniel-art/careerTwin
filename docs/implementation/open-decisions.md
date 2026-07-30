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
**Decisão de implementação adotada nesta sessão:** seguindo a autorização explícita do prompt mestre desta sessão ("na ausência de decisão técnica aprovada, você está autorizado a utilizar [...] Supabase Auth, PostgreSQL via Supabase, Supabase Storage privado"), usamos Supabase como baseline reversível. Nenhum projeto Supabase remoto foi provisionado nesta sessão — as migrations SQL são portáveis para qualquer Postgres com pequenas adaptações de RLS. Registrar aprovação formal no Decision Log antes de produção.

## 6. Style Guide CareerTwin vs. "Leitura do estilo visual" — `non_blocking`

**Documentos afetados:** PRD 00 §20, Sitemap §18, Leitura do estilo visual.
**Impacto:** nenhum — "Leitura do estilo visual" contém tokens de cor/tipografia/componentes suficientemente detalhados e é tratada como a fonte de tokens visuais vigente. Se um documento "Style Guide CareerTwin" separado existir e for adicionado ao repositório depois, os tokens devem ser reconciliados.

## 7. Assets oficiais de logo — `missing_asset`

**Documentos afetados:** Leitura do estilo visual, PRD 00 §5/RF-SITE-018/019.
**Regra:** "devem ser utilizados exclusivamente os arquivos oficiais fornecidos" — proibido redesenhar, reconstruir ou simular via CSS/texto/ícone/IA.
**Decisão de implementação adotada nesta sessão:** nenhum arquivo de logo foi encontrado no repositório. Usamos temporariamente um wordmark textual acessível ("CareerTwin" em Inter Semibold, cor `--foreground` ou `--primary` conforme contraste) no header/footer/landing, e **não** produzimos qualquer imitação gráfica do símbolo/logo. Substituir assim que os arquivos oficiais forem fornecidos.

## 8. Verificação obrigatória de e-mail no cadastro — `provisional`

**Documentos afetados:** PRD 00 §9/RF-AUTH-009, decisões pendentes #2.
**Decisão de implementação adotada nesta sessão:** Supabase Auth com confirmação de e-mail **desabilitada** por padrão no ambiente de desenvolvimento (facilita testes), mas a UI já implementa o estado "confirmação pendente" e o texto correspondente, pronta para ligar a exigência assim que decidido. Registrar decisão final antes de produção.

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

---

## Resumo por classificação

| Classificação | Quantidade | Itens |
|---|---|---|
| `blocking` (parcial, escopo restrito) | 5 | #1, #2, #3, #10, #12 |
| `provisional` | 5 | #5, #8, #9, #11, #18 |
| `missing_external_configuration` | 1 | #4 |
| `missing_asset` | 1 | #7 |
| `non_blocking` | 4 | #6, #15, #16, #17 |
| `resolved_by_precedence` | 2 | #13, #14 |

Nenhum item acima impede a implementação do restante do MVP. Todos os bloqueios são de escopo restrito (uma sub-funcionalidade específica retorna `insufficient_data` ou permanece com configuração provisória) e documentados em código com comentários e/ou constantes nomeadas apontando para este arquivo.
