# Extração estruturada — Arquitetura, Modelo de Dados, Segurança/Privacidade/Retenção, Analytics, Incidentes

> Documento de extração literal, sem paráfrase de nomes de tabelas/campos/enums/prazos/eventos, destinado a servir de base direta para migrations SQL, políticas de RLS e instrumentação de analytics do CareerTwin.

---

## Fontes

| Documento | Caminho | Propósito | Data |
| --- | --- | --- | --- |
| Arquitetura | `Engenharia - Arquitetura, dados e confiabilidade da plataforma/Arquitetura 3ab7f20949da80ffa723e92a08b9d056.md` | Visão de alto nível dos componentes técnicos, split de responsabilidades IA/backend, processamento assíncrono, idempotência, ambientes, segredos, estratégia de falha, requisitos não funcionais e decisões arquiteturais pendentes. | Criado em 27 de julho de 2026, 23:20 |
| Modelo de Dados | `Engenharia - Arquitetura, dados e confiabilidade da plataforma/Modelo de Dados 3ab7f20949da80e5be92de2ff76cfaa3.md` | Contrato conceitual de persistência: todas as entidades, campos, tipos, enums, relações, RLS, índices e regras de migration do PostgreSQL/Supabase. | Criado em 27 de julho de 2026, 23:23 |
| Segurança, Privacidade e Retenção | `Engenharia - Arquitetura, dados e confiabilidade da plataforma/Segurança, Privacidade e Retenção 3ab7f20949da80ce8d3de1f0e0396255.md` | Controles operacionais e técnicos de segurança, classificação de dados, retenção, exclusão, consentimento, controle de acesso e critérios de bloqueio de release. | Criado em 27 de julho de 2026, 23:24 |
| Analytics | `Engenharia - Arquitetura, dados e confiabilidade da plataforma/Analytics 3ab7f20949da801f805cf55bb457e9cb.md` | Catálogo canônico de eventos de produto, convenções de nome, propriedades permitidas/proibidas, funil, métricas e dashboards. | Criado em 27 de julho de 2026, 23:25 |
| Incidentes | `Engenharia - Arquitetura, dados e confiabilidade da plataforma/Incidentes 3ab7f20949da803dbbc1d7684347d565.md` | Processo operacional de incidentes: categorias, severidade, papéis, fluxo de resposta, contenção por categoria, comunicação, post-mortem, runbooks e exercícios. | Criado em 27 de julho de 2026, 23:25 |

Nenhum dos cinco documentos possui número de versão explícito além da data de criação acima. Todos tratam o "Claude Code" como agente de implementação que não pode preencher lacunas com decisões silenciosas.

---

## Arquitetura (completo)

### Papel do Claude Code

O Claude Code não é um componente do produto, não participa do runtime, não é fonte de regras de negócio, não pode redefinir decisões fechadas, não pode preencher lacunas documentais com decisões silenciosas, e deve interromper a implementação específica quando houver contradição ou decisão pendente relevante.

### Decisões confirmadas (Status arquitetural §2)

- aplicação web responsiva;
- autenticação obrigatória;
- perfil profissional persistente e versionado;
- contexto-alvo versionado separadamente do Thin Twin;
- oportunidades versionadas;
- arquivos originais temporários;
- IA responsável por extração, interpretação, normalização e classificação;
- backend responsável pelo cálculo de scores, confiança, prioridade e limites;
- análises associadas às versões utilizadas;
- dados pessoais separados do contexto profissional;
- somente dois módulos core;
- nenhum pagamento real no MVP;
- falhas técnicas e reprocessamentos não consomem créditos;
- relatórios concluídos não são sobrescritos;
- regras determinísticas permanecem versionadas e auditáveis.

### Baseline técnico proposto (não é decisão fechada — precisa de registro no Decision Log)

- frontend web;
- TypeScript como linguagem principal;
- framework web compatível com React e SSR quando necessário;
- shadcn/ui como base do Design System;
- Tailwind CSS para estilos e tokens;
- Lucide React para iconografia;
- **Supabase Auth**;
- **PostgreSQL via Supabase Database**;
- **Supabase Storage** para arquivos temporários;
- API/backend/funções server-side;
- provedor de modelo de linguagem (não escolhido);
- fila durável e processamento assíncrono;
- analytics de produto;
- monitoramento técnico;
- rotinas automáticas de retenção e exclusão;
- testes automatizados;
- migrations versionadas;
- CI/CD.

O Claude Code pode sugerir alternativas técnicas, mas **não pode decidir silenciosamente**: regras de produto; pesos/fatores/fórmulas; estados funcionais; política de créditos; retenção de dados; critérios de segurança; provedores definitivos; limites operacionais; mudanças de escopo.

### Visão de alto nível (diagrama textual §3)

```
Usuário → Aplicação Web (Site público/auth, Onboarding, Thin Twin, Contexto-alvo, Core 1, Core 2, Funcionalidades de apoio)
→ API/Backend (Autorização, Regras de negócio, Versionamento, Orquestração de jobs, Validação de schemas, Motor de scores, Gestão de créditos, Auditoria)
→ PostgreSQL | Storage | Fila/Worker | Serviço de IA | Analytics
```

**Regra explícita "must not":** o serviço de IA **não deverá acessar diretamente** o banco de dados, o storage ou os dados de outros usuários. Toda interação com IA deverá ser orquestrada pelo backend. Regras críticas não devem ser deslocadas para o frontend ou para prompts por conveniência.

### Componentes (§4)

**4.1 Aplicação web** — responsável por landing, cadastro/login, onboarding, upload, revisão do Thin Twin, contexto-alvo, Core 1, Core 2, dashboard, histórico, ações, feedback, créditos simulados, configurações, exclusão de conta. Dashboard/histórico/ações/créditos/configurações são superfícies de apoio, **não** um terceiro módulo core.
Regras "must not": não acessar diretamente dados de outro usuário; não expor chaves administrativas; não calcular scores no cliente; não armazenar documentos profissionais em cache permanente; não confiar em permissões só de interface; não usar Core 1 como pré-condição técnica obrigatória do Core 2; não apresentar análise incompleta como definitiva.

**4.2 Autenticação** — baseline proposto: Supabase Auth. Responsabilidades: criação de conta, login, logout, recuperação de senha, gestão de sessão, identificação segura, proteção de rotas, revogação de acesso, suporte à exclusão de conta. Requisitos: e-mails normalizados; senhas nunca armazenadas diretamente pela aplicação; tokens protegidos; expiração de sessão; revogação de tokens; proteção contra tentativas excessivas; mensagens neutras na recuperação de senha; origens de redirecionamento autorizadas; registro de eventos críticos; nenhum usuário pode consultar recursos de outro usuário. Política de senha/confirmação de e-mail/duração de sessão/redirecionamentos ficam pendentes no PRD 00 e no Decision Log.

**4.3 API e backend** — responsável por validar autenticação/autorização, resolver usuário da sessão, gerar URLs seguras de upload, validar arquivos, iniciar processamentos, montar contexto mínimo para IA, chamar modelos, validar respostas estruturadas, calcular scores/confiança/prioridade, aplicar limites e ordem de precedência, persistir resultados, reservar/confirmar/liberar créditos, gerar versões, controlar retenção, registrar eventos técnicos, impedir acesso indevido, preservar idempotência.
**Regra central:** toda operação usa o identificador derivado da sessão autenticada; o backend **não deve confiar** em `user_id` enviado livremente pelo cliente. Toda análise deve validar que perfil, contexto-alvo, oportunidade, documentos, recomendações e créditos pertencem ao mesmo usuário.

**4.4 Banco de dados** — baseline proposto: PostgreSQL via Supabase. Diretrizes: chaves primárias UUID; timestamps em UTC; integridade referencial; migrations versionadas; controle de acesso em nível de linha (RLS) ou equivalente; separação entre dados pessoais e profissionais; registros imutáveis para versões confirmadas e análises concluídas; exclusão lógica apenas onde necessária; exclusão física conforme política de retenção; JSONB apenas para estruturas flexíveis/versionadas (não para substituir entidades e relações essenciais); índices para consultas críticas; restrições únicas em operações idempotentes; nomenclatura consistente com o Modelo de Dados.
Toda análise deve registrar: `profile_version_id`; `target_context_version_id`; `opportunity_version_id`; versão do motor; versão da configuração; versão da rubrica; versão do prompt; versão do schema; versão do modelo.
Diretrizes para Claude Code: nenhuma alteração manual direta em produção; toda mudança estrutural usa migration; migrations revisáveis, idempotentes quando aplicável, compatíveis com rollback; políticas de acesso testadas para proprietário/usuário diferente/anônimo; seeds só com dados sintéticos; não criar campos não previstos para simplificar; divergências entre Modelo de Dados e necessidade de código devem ser registradas antes da migration.

**4.5 Armazenamento de arquivos** — baseline proposto: Supabase Storage. Arquivos temporários: currículo, LinkedIn, vaga, documentos complementares autorizados, artefatos intermediários de extração. Diretrizes: buckets privados; acesso por URL assinada; prazo curto de validade; caminho relacionado a usuário e documento; validação de extensão/MIME/tamanho; verificação de arquivos protegidos; análise de segurança; **nenhuma URL pública permanente**; exclusão automática após processamento; não usar nome original como identificador; não registrar conteúdo integral em logs.
Estrutura sugerida:
```
temporary-documents/
  user_id/
    document_id/
      source_file
      processing_artifact
```
Documentos originais **não fazem parte** do Thin Twin. Só permanecem persistidos: informações profissionais estruturadas, confirmadas, e evidências mínimas necessárias.

**4.6 Processamento assíncrono** — modelado como job assíncrono.
Tipos de job: `extração de currículo`; `extração de LinkedIn`; `consolidação do Thin Twin`; `estruturação de oportunidade`; `Core 1`; `Core 2`; `reanálise`; `exclusão de documentos`; `exclusão de conta` (ver nomes de enum exatos na tabela `processing_jobs` do Modelo de Dados).
Estados técnicos do job: `queued`; `processing`; `completed`; `partially_completed`; `failed`; `cancelled`; `expired`. Esses estados são **somente técnicos** — não substituem estado do documento, da análise, da recomendação, do crédito, ou o estado apresentado na interface. `partially_completed` **não autoriza** apresentação de relatório como definitivo.
Requisitos: fila durável; idempotência; retentativas limitadas; timeout; correlação por `job_id` e por `analysis_id` quando aplicável; registro de erro categorizado; recuperação após interrupção; não duplicar análises/versões; não consumir crédito duas vezes; não apresentar sucesso antes da persistência completa; suportar cancelamento quando tecnicamente seguro.

**4.7 Integração com IA** — provedor acessado somente pelo backend ou workers autorizados.
Backend deve: selecionar somente dados necessários; remover dados pessoais não utilizados; separar Thin Twin e contexto-alvo; delimitar documentos como dados não confiáveis; aplicar prompt versionado; exigir saída estruturada; validar schema/enums; verificar referências de evidência e autenticidade; executar retentativas controladas; registrar modelo e versão; **impedir score livre**; **impedir prioridade final definida pela IA**; persistir somente resultados validados.
Lista explícita "o provedor de IA não deverá receber": nome completo sem necessidade; e-mail; endereço residencial; data de nascimento; senha; tokens de autenticação; dados financeiros; documentos de outros usuários; histórico irrelevante; identificadores internos desnecessários; instruções administrativas; segredos da aplicação.
A IA retorna classificações, evidências, justificativas e candidatos a recomendações. Scores, confiança, prioridade, limites e recomendação final são calculados/confirmados pelo backend.

**4.8 Motor de scores** — executa no backend. Responsabilidades: receber classificações estruturadas; validar valores permitidos; aplicar rubricas e pesos; mapear estados de correspondência aos fatores oficiais; excluir requisitos não aplicáveis; normalizar denominador quando necessário; calcular IPP; calcular IAO bruto; aplicar limites ao IAO final; calcular confiança e prioridade; aplicar ordem de precedência; validar recomendação final; registrar todas as versões utilizadas; preservar explicabilidade. **A IA não pode retornar o score final como fonte de verdade.** As mesmas entradas confirmadas + mesmas versões de configuração devem produzir o mesmo resultado matemático (determinismo).

**4.9 Analytics e observabilidade** — separação explícita entre analytics de produto e observabilidade técnica. Nomes canônicos de eventos definidos exclusivamente na página Analytics; implementação não cria nomes alternativos. Analytics não deve receber: currículo; LinkedIn; descrição integral de vaga; evidências textuais; nome completo; e-mail em texto aberto; dados pessoais desnecessários; prompts ou respostas integrais da IA. Observabilidade técnica mede: disponibilidade, erros, latência, filas, jobs, retentativas, chamadas de IA, conformidade de schemas, consumo de recursos, custo por análise, reservas/confirmações de crédito, falhas de retenção, incidentes de segurança. Logs usam identificadores técnicos e metadados mínimos; conteúdo profissional integral, segredos e tokens não devem ser registrados.

### Fluxo técnico — Onboarding (§5, 16 passos)

1. usuário autenticado inicia/retoma onboarding; 2. backend cria/recupera estado do onboarding; 3. usuário informa nome e opcionalmente cidade/estado; 4. frontend solicita URL segura de upload; 5. arquivo enviado ao bucket privado; 6. backend cria `document` e `processing_job`; 7. worker valida segurança/formato/conteúdo; 8. texto extraído; 9. IA estrutura dados profissionais; 10. backend valida schema e evidências; 11. dados extraídos persistidos como rascunho; 12. usuário revisa/corrige/adiciona/rejeita; 13. confirmação cria versão imutável do Thin Twin; 14. objetivo profissional confirmado em versão separada do contexto-alvo; 15. rotina de retenção exclui arquivos temporários; 16. eventos canônicos de conclusão registrados. Dados pessoais não devem ser incorporados ao Thin Twin nem enviados à IA sem necessidade.

### Fluxo técnico — Core 1 (§6, 18 passos)

1. usuário solicita Análise de Perfil; 2. backend verifica auth/autorização; 3. verifica Thin Twin confirmado; 4. verifica contexto-alvo confirmado; 5. análise criada com chave de idempotência; 6. `profile_version_id` e `target_context_version_id` congelados; 7. versões de motor/config/rubrica/prompt/schema registradas; 8. job assíncrono criado; 9. contexto profissional mínimo montado; 10. IA classifica 7 dimensões em níveis 0–4; 11. IA relaciona evidências e gera recomendações candidatas; 12. backend valida schema/enums/evidências/autenticidade; 13. backend calcula IPP, confiança, prioridade; 14. relatório e resultados persistidos; 15. análise passa a concluída; 16. crédito confirmado somente quando aplicável e após sucesso; 17. eventos canônicos registrados; 18. usuário visualiza relatório. Falha técnica libera reserva de crédito e permite nova tentativa.

### Fluxo técnico — Core 2 (§7, 21 passos)

1. usuário inicia análise de cargo/vaga; 2. backend valida auth/autorização; 3. descrição/documento recebido e validado; 4. oportunidade criada ou reutilizada de forma idempotente; 5. IA estrutura requisitos; 6. backend valida schema/criticidades/ambiguidades/evidências de origem; 7. usuário revisa e confirma oportunidade estruturada; 8. versão imutável da oportunidade criada; 9. backend verifica Thin Twin e contexto-alvo confirmados; 10. `profile_version_id`, `target_context_version_id`, `opportunity_version_id` congelados; 11. crédito reservado quando operação exigir consumo; 12. job assíncrono criado; 13. IA classifica cada requisito nos estados permitidos; 14. backend valida classificações/evidências/autenticidade; 15. backend calcula IAO bruto, confiança, prioridade; 16. backend aplica limites de segurança e ordem de precedência; 17. backend define recomendação final; 18. relatório e resultados persistidos; 19. crédito confirmado somente após sucesso; 20. eventos canônicos registrados; 21. usuário visualiza relatório.
Em análise de cargo-alvo, deve-se usar referência de cargo aprovada e versionada; na ausência, o sistema não deve apresentar análise definitiva como se usasse catálogo validado. Falhas técnicas liberam reserva e não geram consumo. **Core 1 não é pré-condição técnica obrigatória para Core 2.**

### Idempotência (§8)

Operações críticas que exigem chave de idempotência: criação de análise; geração de job; criação de oportunidade; criação de versão; reserva de crédito; confirmação de crédito; restauração/liberação de crédito; reanálise; exclusão de conta; envio de feedback.
Repetir a mesma solicitação **não pode**: criar análises/jobs/versões duplicadas; consumir múltiplos créditos; gerar oportunidades duplicadas; executar exclusões inconsistentes; sobrescrever relatórios anteriores.
Diretrizes: implementar restrições únicas no banco; tratar repetição concorrente (não só sequencial); testar requisições duplicadas e retentativas após timeout; manter reserva e confirmação de crédito como operações separadas; não usar apenas estado em memória; registrar chave, escopo, resultado e expiração da operação.

### Ambientes (§9)

Dev: dados sintéticos, credenciais separadas, modelos/prompts em teste, logs detalhados, nenhuma info real sem autorização, integrações isoladas/simuladas.
Homologação: estrutura próxima de produção, casos de teste, validação de migrations, testes de regressão/segurança/retenção/idempotência, simulação de falhas, validação de créditos.
Produção: acessos restritos, chaves exclusivas, logs protegidos, monitoramento, backups, alertas, políticas de retenção ativas, rotinas de exclusão, auditoria de operações críticas.
Ambientes não compartilham: banco; bucket; chaves; tokens; usuários; filas; logs sensíveis; configurações administrativas.

### Configuração e segredos (§10)

Segredos incluem: chaves de IA; chaves administrativas; tokens; credenciais de banco; segredos de integrações; chaves de analytics; chaves de monitoramento. Regras: nunca versionar em repositório; nunca expor ao frontend; menor privilégio; rotacionar após exposição; separar por ambiente; limitar acesso administrativo; registrar responsáveis; auditar alterações; não incluir segredos em logs/mensagens de erro. **Pesos, fatores, faixas e limites do motor não são segredos**, mas devem ficar em configuração versionada e protegida contra alteração não autorizada.

### Estratégia de falha (§11)

Em falha: não exibir resultado parcial como definitivo; não persistir saída inválida; não confirmar consumo de crédito; liberar eventual reserva; preservar dados/etapas válidas; registrar código e categoria do erro; permitir retentativa segura; mensagem compreensível; impedir vazamento de detalhes internos; impedir processamento duplicado; preservar relatórios anteriores; abrir incidente quando houver impacto relevante. Falhas recuperáveis e finais devem ter estados distintos. Retentativa técnica não cria nova cobrança nem substitui silenciosamente análise concluída.

### Requisitos não funcionais (§12)

**Segurança:** isolamento entre usuários; comunicação criptografada; storage privado; RLS ou equivalente; acesso administrativo controlado; validação de arquivos; minimização de dados; segregação de ambientes; auditoria de operações críticas; proteção contra prompt injection; prevenção de vazamento de segredos; dependências mantidas/revisadas.
**Disponibilidade:** MVP prioriza estabilidade do fluxo principal, sem compromisso público de SLA.
**Desempenho (metas iniciais, referências operacionais):** mediana inferior a 60 segundos; **p95 inferior a 120 segundos**.
**Rastreabilidade:** toda análise registra usuário; `profile_version_id`; `target_context_version_id`; `opportunity_version_id` quando aplicável; versão do prompt/schema/modelo/rubrica/motor/configuração; `job_id`; data; score bruto; score final; confiança; limites aplicados; resultado; erros.
**Qualidade de código:** TypeScript modo estrito; validação de contratos em runtime; lint/formatação automatizados; testes unitários para regras determinísticas; testes de integração para banco/autorização/storage/jobs/créditos; testes de contrato para schemas de IA; testes end-to-end para fluxos críticos; dependências externas encapsuladas; código sem segredos/dados pessoais de teste; migrations revisadas; documentação atualizada junto com mudanças de comportamento.
**Acessibilidade:** componentes acessíveis; navegação por teclado; foco visível; HTML semântico; rótulos/mensagens de erro adequados; contraste; responsividade desktop/tablet/mobile; uso do Design System.

### Decisões arquiteturais pendentes (§13 — lista completa)

framework definitivo do frontend; forma de hospedagem; provedor definitivo de autenticação; provedor definitivo de banco de dados; provedor definitivo de storage; runtime do backend; tecnologia da fila; estratégia de workers; **provedor de IA**; **provedor de analytics**; **provedor de monitoramento**; política de regiões; estratégia de backup; ferramenta de gestão de segredos; estratégia de CI/CD; limites máximos de arquivo; metas formais de disponibilidade; política de recuperação de desastre; estratégia de escalabilidade; política de custos e limites de uso; política de observabilidade e retenção de logs; política definitiva de confirmação de e-mail e sessão; **catálogo aprovado de referências de cargo** para análise por cargo-alvo.

Quando uma pendência impedir implementação segura, o Claude Code deve: identificar a pendência; indicar documento/contrato afetado; apresentar alternativas técnicas; evitar alterações irreversíveis; solicitar decisão antes de continuar; preservar o restante da implementação que não depender da decisão.

---

## Modelo de Dados (completo — a tabela por tabela)

**Convenções gerais:** IDs = UUID. Datas/horas = `timestamptz` em UTC (datas profissionais sem horário podem usar `date`). Nomenclatura de banco = `snake_case` (tabelas, campos, índices, constraints, enums, funções, migrations); contratos de aplicação/schemas de IA podem usar `camelCase` com mapeamento explícito. Timestamps padrão: `created_at`, `updated_at`, `deleted_at` (só quando necessário), `confirmed_at`, `completed_at`, `expires_at` (quando houver expiração). Valores monetários simulados em **centavos** (`price_cents`, `currency` inicial `BRL`; ex.: R$ 29,90 = 2990). Scores 0–100 → `numeric(5,2)`. Confianças 0–1 → `numeric(4,3)` com constraint `0 <= valor <= 1`. Escalas de recomendação (impacto/esforço/urgência/confiança) 1–5 → `smallint` com constraint `valor between 1 and 5`. JSONB permitido só para: snapshots imutáveis; payloads de IA já validados; metadados; configurações versionadas; listas de motivos; informações ausentes; warnings; detalhes de alteração — **não pode substituir** usuários, versões, experiências, competências, ferramentas, evidências, oportunidades, requisitos, análises, recomendações, ações, créditos, relações de propriedade.

Princípios de modelagem chave: autenticação separada dos dados da conta; dados pessoais separados do Thin Twin; Thin Twin separado do contexto-alvo; entidade lógica separada de suas versões (perfil, contexto-alvo, oportunidade); referência de cargo separada de vagas do usuário; versões confirmadas e análises concluídas são imutáveis; score separado da confiança; classificações da IA separadas dos cálculos do backend; resultados brutos separados dos finais; recomendações associadas a evidências e requisitos; documentos originais são temporários; créditos controlados por reserva e ledger; consentimentos versionados; eventos técnicos separados dos de produto. **A ausência de informação não deve ser armazenada como ausência confirmada de competência. Inferências não devem ser armazenadas como fatos profissionais confirmados.**

### 4.1 Usuário e conta

#### `auth.users`
Gerenciada pelo provedor de autenticação. O identificador de auth é usado como identificador principal do usuário em todas as tabelas de domínio.

#### `user_accounts`
| Campo | Tipo | Descrição |
| --- | --- | --- |
| `user_id` | UUID | PK e FK para `auth.users.id` |
| `status` | enum | Estado da conta |
| `locale` | text | Idioma da interface |
| `timezone` | text | Fuso horário |
| `onboarding_status` | enum | Estado funcional do onboarding |
| `created_at` | timestamptz | Criação |
| `updated_at` | timestamptz | Atualização |
| `deletion_requested_at` | timestamptz nullable | Solicitação de exclusão |

`status` enum: `active`; `blocked`; `deletion_pending`.
`onboarding_status` enum: `not_started`; `in_progress`; `profile_review`; `target_context_pending`; `completed`.
O estado do onboarding não substitui os estados dos documentos, jobs, perfil ou contexto-alvo.

### 4.2 Dados pessoais

#### `personal_data`
| Campo | Tipo | Regra |
| --- | --- | --- |
| `user_id` | UUID | PK e FK para `user_accounts.user_id` |
| `full_name` | text | Obrigatório |
| `city` | text nullable | Opcional |
| `state` | text nullable | Opcional |
| `created_at` | timestamptz | Obrigatório |
| `updated_at` | timestamptz | Obrigatório |

**Explicitamente fora do MVP** (não devem ser coletados): data de nascimento; CEP; rua; número; complemento; bairro; endereço residencial completo.

Regras: relação um-para-um com o usuário; acesso restrito; **não** faz parte do Thin Twin; **não** faz parte do contexto-alvo; **não** influencia IPP; **não** influencia IAO; **não** influencia confiança; **não** influencia recomendações; **não** enviar à IA sem necessidade explícita; **não** enviar a analytics; cidade e estado só podem ser usados para requisito geográfico quando houver finalidade válida e autorização adequada (ver contradição na seção "Conflitos" abaixo).

### 4.3 Perfil profissional (Thin Twin)

#### `professional_profiles`
Representa o Thin Twin lógico do usuário.
| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador do perfil |
| `user_id` | UUID | Proprietário |
| `current_version_id` | UUID nullable | Versão confirmada atual |
| `status` | enum | Estado do perfil |
| `created_at` | timestamptz | Criação |
| `updated_at` | timestamptz | Atualização |

Restrições: um perfil lógico por usuário; `user_id` único; `current_version_id` deve pertencer ao mesmo perfil.
`status` enum: `draft`; `under_review`; `confirmed`; `archived`.

#### `profile_versions`
Cada versão imutável do Thin Twin.
| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador da versão |
| `profile_id` | UUID | Perfil lógico |
| `version_number` | integer | Número sequencial |
| `previous_version_id` | UUID nullable | Versão anterior |
| `status` | enum | Estado da versão |
| `change_reason` | text | Motivo da versão |
| `source_type` | enum | Origem da mudança |
| `change_summary` | JSONB | Campos adicionados, alterados e removidos |
| `snapshot` | JSONB | Snapshot validado da versão |
| `snapshot_hash` | text | Hash do conteúdo confirmado |
| `confirmed_by_user_id` | UUID nullable | Usuário que confirmou |
| `confirmed_at` | timestamptz nullable | Data da confirmação |
| `created_at` | timestamptz | Criação |

`status` enum: `draft`; `confirmed`; `superseded`; `archived`.
`source_type` enum: `initial_onboarding`; `resume_update`; `linkedin_update`; `manual_edit`; `conflict_resolution`; `professional_update`; `system_migration`.

Regras: `version_number` único por perfil; versão confirmada não pode ser alterada; alteração profissional relevante cria nova versão; alteração apenas visual/ortográfica não cria versão; alteração do contexto-alvo não cria versão do Thin Twin; análises apontam para `profile_version_id`; análises antigas não são alteradas após nova versão; atualização de `current_version_id` deve ocorrer na mesma transação que confirma a nova versão.

### 4.4 Contexto-alvo

O objetivo profissional **não pertence** ao Thin Twin.

#### `target_contexts`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `user_id` | UUID |
| `current_version_id` | UUID nullable |
| `status` | enum |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

Restrições: um contexto-alvo lógico ativo por usuário; `current_version_id` deve pertencer ao mesmo contexto.

#### `target_context_versions`
| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador da versão |
| `target_context_id` | UUID | Contexto lógico |
| `version_number` | integer | Número sequencial |
| `previous_version_id` | UUID nullable | Versão anterior |
| `target_area` | text | Área de interesse |
| `target_role` | text | Cargo-alvo |
| `normalized_role` | text nullable | Cargo normalizado |
| `desired_seniority` | enum | Senioridade desejada |
| `transition_type` | enum nullable | Tipo de transição |
| `search_context` | enum nullable | Contexto da busca |
| `preferences` | JSONB | Preferências explicitamente informadas |
| `confirmation_status` | enum | Estado de confirmação |
| `confirmed_at` | timestamptz nullable | Confirmação |
| `created_at` | timestamptz | Criação |

`desired_seniority` enum: `intern`; `junior`; `mid`; `senior`.
`transition_type` enum: `same_role`; `new_specialty`; `new_role`; `new_area`; `return_to_market`; `not_informed`.
`search_context` enum: `unemployed`; `employed_seeking_change`; `career_transition`; `returning_to_work`; `not_informed`.

Regras: cada versão confirmada é imutável; mudança de área/cargo/senioridade cria nova versão; versão anterior permanece disponível; análises registram `target_context_version_id`; atualização do contexto-alvo não altera o Thin Twin nem análises anteriores.

### 4.5 Experiências

#### `experiences`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `profile_version_id` | UUID |
| `company_name` | text |
| `role_title` | text |
| `normalized_role` | text nullable |
| `employment_type` | enum nullable |
| `start_date` | date nullable |
| `end_date` | date nullable |
| `is_current` | boolean |
| `description` | text nullable |
| `scope_summary` | text nullable |
| `confirmation_status` | enum |
| `inference_status` | enum |
| `created_at` | timestamptz |

`employment_type` enum: `internship`; `employee`; `contractor`; `freelance`; `founder`; `volunteer`; `academic`; `other`; `not_informed`.

#### `experience_responsibilities`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `experience_id` | UUID |
| `description` | text |
| `confirmation_status` | enum |
| `inference_status` | enum |
| `created_at` | timestamptz |

#### `projects`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `experience_id` | UUID nullable |
| `profile_version_id` | UUID |
| `name` | text |
| `context` | text nullable |
| `objective` | text nullable |
| `user_role` | text nullable |
| `activities` | JSONB |
| `deliverables` | JSONB |
| `results` | JSONB |
| `start_date` | date nullable |
| `end_date` | date nullable |
| `confirmation_status` | enum |
| `created_at` | timestamptz |

**Estados de confirmação** (usado em `experiences`, `experience_responsibilities`, `projects`, `profile_skills`, `profile_tools`, `evidences`, `education_records`, `certifications`, `languages`, e onde indicado): `extracted`; `confirmed`; `corrected`; `added`; `rejected`; `in_conflict`; `unconfirmed`.
**Estados de inferência** (usado em `experiences`, `experience_responsibilities`, `profile_skills`, `evidences`): `fact`; `inference`; `hypothesis`; `suggestion`.

Somente informações com estado de confirmação `confirmed`, `corrected` ou `added` podem ser tratadas como fatos profissionais.

### 4.6 Competências e ferramentas

Competências e ferramentas são armazenadas **separadamente**.

#### `skills`
Catálogo normalizado de competências.
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `normalized_name` | text |
| `skill_type` | enum |
| `skill_domain` | text nullable |
| `aliases` | text[] |
| `taxonomy_version` | text |
| `status` | enum |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

`skill_type` enum: `technical`; `method`; `domain`; `management`; `leadership`; `communication`; `collaboration`; `business`; `language`; `other`.

#### `profile_skills`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `profile_version_id` | UUID |
| `skill_id` | UUID |
| `original_term` | text |
| `declared_level` | text nullable |
| `extraction_confidence` | numeric(4,3) nullable |
| `confirmation_status` | enum |
| `inference_status` | enum |
| `created_at` | timestamptz |

#### `experience_skills`
Relaciona competência e experiência.
| Campo | Tipo |
| --- | --- |
| `experience_id` | UUID |
| `profile_skill_id` | UUID |
| `relationship_type` | enum |
| `created_at` | timestamptz |

#### `tools`
Catálogo normalizado de ferramentas/tecnologias.
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `normalized_name` | text |
| `tool_category` | text nullable |
| `aliases` | text[] |
| `taxonomy_version` | text |
| `status` | enum |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

#### `profile_tools`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `profile_version_id` | UUID |
| `tool_id` | UUID |
| `original_term` | text |
| `usage_context` | text nullable |
| `declared_level` | text nullable |
| `extraction_confidence` | numeric(4,3) nullable |
| `confirmation_status` | enum |
| `created_at` | timestamptz |

#### `experience_tools`
Relaciona ferramenta e experiência (campos não detalhados no documento além da relação).

Regras: uma competência não deve ser armazenada como ferramenta e vice-versa; `skill_type`, `skill_domain` e `tool_category` têm funções diferentes; termo original deve ser preservado; termo normalizado registra a versão da taxonomia; termo desconhecido não deve ser descartado silenciosamente; competência/ferramenta sem evidência não deve ser tratada como domínio confirmado; evidências associadas pelas tabelas de relacionamento.

### 4.7 Evidências

#### `evidences`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `profile_version_id` | UUID |
| `evidence_type` | enum |
| `summary` | text |
| `context` | text nullable |
| `source_document_id` | UUID nullable |
| `source_type` | enum |
| `source_snippet` | text nullable |
| `source_locator` | text nullable |
| `extraction_confidence` | numeric(4,3) nullable |
| `confirmation_status` | enum |
| `inference_status` | enum |
| `created_at` | timestamptz |

`evidence_type` enum: `responsibility`; `delivery`; `project`; `qualitative_result`; `quantitative_result`; `promotion`; `recognition`; `scope_expansion`; `education`; `certification`; `portfolio`; `professional_example`.

Tabelas de relacionamento: `experience_evidences`; `project_evidences`; `profile_skill_evidences`; `profile_tool_evidences`; `recommendation_evidences`; `requirement_assessment_evidences`.

Regras: evidência preserva contexto mínimo; **não deve conter dados pessoais desnecessários** (regra de conteúdo, sem constraint técnica explícita — ver "Conflitos"); mesmo fato repetido em currículo e LinkedIn não conta como duas evidências independentes; snippets mínimos e suficientes; ausência de evidência representada no diagnóstico (não por evidência fictícia); evidências rejeitadas não sustentam análises futuras; análise preserva as referências de evidência usadas no momento da execução.

### 4.8 Formação e certificações

#### `education_records`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `profile_version_id` | UUID |
| `institution` | text |
| `course` | text |
| `degree_type` | text nullable |
| `field` | text nullable |
| `start_date` | date nullable |
| `end_date` | date nullable |
| `status` | enum |
| `confirmation_status` | enum |
| `created_at` | timestamptz |

#### `certifications`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `profile_version_id` | UUID |
| `name` | text |
| `issuer` | text nullable |
| `issued_at` | date nullable |
| `expires_at` | date nullable |
| `credential_id` | text nullable |
| `credential_url` | text nullable |
| `confirmation_status` | enum |
| `created_at` | timestamptz |

#### `languages`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `profile_version_id` | UUID |
| `language_name` | text |
| `declared_level` | text nullable |
| `certification` | text nullable |
| `usage_context` | text nullable |
| `confirmation_status` | enum |
| `created_at` | timestamptz |

Formação, certificação ou idioma inferido **não deve ser confirmado automaticamente**.

### 4.9 Documentos

#### `documents`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `user_id` | UUID |
| `document_type` | enum |
| `source_type` | enum |
| `storage_path` | text nullable |
| `original_filename` | text nullable |
| `mime_type` | text nullable |
| `size_bytes` | bigint nullable |
| `content_hash` | text nullable |
| `status` | enum |
| `page_count` | integer nullable |
| `character_count` | integer nullable |
| `retention_deadline` | timestamptz nullable |
| `processed_at` | timestamptz nullable |
| `deleted_at` | timestamptz nullable |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

`document_type` enum: `resume`; `linkedin`; `job_description`; `pasted_text`; `authorized_supporting_document`.
`source_type` enum: `file_upload`; `pasted_text`; `manual_entry`.
`status` enum (estados funcionais): `awaiting_upload`; `uploading`; `validating`; `queued`; `processing`; `ready`; `insufficient_content`; `failed_retryable`; `failed_final`; `deleted`.

#### `document_extractions`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `document_id` | UUID |
| `schema_version` | text |
| `prompt_version` | text |
| `model_version` | text |
| `status` | enum |
| `validated_payload` | JSONB nullable |
| `warnings` | JSONB |
| `created_at` | timestamptz |
| `completed_at` | timestamptz nullable |

Regras: arquivos são temporários; buckets devem ser privados; `storage_path` **não pode** ser URL pública; textos integrais não persistem indefinidamente; conteúdo extraído integral segue política de retenção; snippets mínimos podem permanecer como evidências; arquivos deletados não continuam acessíveis; hash apoia detecção de duplicidade e idempotência; documento pertence exclusivamente ao usuário; documento não confirmado não cria fatos automaticamente.

### 4.10 Jobs

#### `processing_jobs`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `user_id` | UUID |
| `job_type` | enum |
| `resource_type` | enum |
| `resource_id` | UUID |
| `analysis_id` | UUID nullable |
| `status` | enum |
| `attempt_count` | integer |
| `max_attempts` | integer |
| `idempotency_key` | text |
| `correlation_id` | UUID |
| `error_code` | text nullable |
| `error_category` | enum nullable |
| `error_message_safe` | text nullable |
| `available_at` | timestamptz |
| `started_at` | timestamptz nullable |
| `completed_at` | timestamptz nullable |
| `expires_at` | timestamptz nullable |
| `created_at` | timestamptz |

`job_type` enum: `resume_extraction`; `linkedin_extraction`; `profile_consolidation`; `opportunity_structuring`; `profile_analysis`; `target_role_analysis`; `job_analysis`; `reanalysis`; `document_deletion`; `account_deletion`.
`status` enum (estados técnicos — idênticos aos do §4.6 da Arquitetura): `queued`; `processing`; `completed`; `partially_completed`; `failed`; `cancelled`; `expired`.
`error_category` enum: `validation`; `authorization`; `file_processing`; `provider_timeout`; `provider_unavailable`; `invalid_schema`; `invalid_model_output`; `persistence`; `credit`; `retention`; `unknown`.

Regras: `idempotency_key` única dentro do escopo da operação; job técnico não substitui o estado funcional do recurso; `partially_completed` não autoriza relatório definitivo; falha registra erro seguro; stack traces e segredos não vão em mensagens visíveis; retentativa não cria nova análise ou novo consumo; o mesmo job não pode ser processado simultaneamente por dois workers; operações expiradas tratadas explicitamente.

### 4.11 Análises

#### `analyses`
Tabela base de todas as análises.
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `user_id` | UUID |
| `analysis_type` | enum |
| `profile_version_id` | UUID |
| `target_context_version_id` | UUID |
| `opportunity_version_id` | UUID nullable |
| `role_reference_version_id` | UUID nullable |
| `previous_analysis_id` | UUID nullable |
| `status` | enum |
| `idempotency_key` | text |
| `input_hash` | text |
| `model_version` | text |
| `prompt_version` | text |
| `schema_version` | text |
| `rubric_version` | text |
| `engine_version` | text |
| `configuration_version` | text |
| `confidence_score` | numeric(4,3) nullable |
| `confidence_band` | enum nullable |
| `confidence_reasons` | JSONB |
| `missing_information` | JSONB |
| `conflicts` | JSONB |
| `warnings` | JSONB |
| `started_at` | timestamptz nullable |
| `completed_at` | timestamptz nullable |
| `created_at` | timestamptz |

`analysis_type` enum: `profile_analysis`; `target_role_analysis`; `job_analysis`.
`status` enum (estados funcionais): `draft`; `queued`; `processing`; `preliminary`; `completed`; `insufficient_data`; `failed_retryable`; `failed_final`; `cancelled`.
`confidence_band` enum: `low`; `medium`; `high`.

**Regras por tipo:**
- `profile_analysis`: exige `profile_version_id` e `target_context_version_id`; não usa `opportunity_version_id` nem `role_reference_version_id`.
- `target_role_analysis`: exige `profile_version_id`, `target_context_version_id` e `role_reference_version_id`; não usa `opportunity_version_id`.
- `job_analysis`: exige `profile_version_id`, `target_context_version_id` e `opportunity_version_id`; não usa `role_reference_version_id`.

#### `profile_analysis_results`
| Campo | Tipo |
| --- | --- |
| `analysis_id` | UUID |
| `ipp_score` | numeric(5,2) |
| `ipp_display_score` | smallint |
| `ipp_band` | enum |
| `diagnosis` | text |
| `main_strength` | text |
| `main_gap` | text |
| `next_best_action` | text |
| `calculation_snapshot` | JSONB |
| `created_at` | timestamptz |

`ipp_band` enum: `low_readiness`; `developing_readiness`; `good_readiness`; `high_readiness`.

#### `profile_dimension_results`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `analysis_id` | UUID |
| `dimension` | enum |
| `rubric_level` | smallint |
| `dimension_score` | numeric(5,2) |
| `weight` | numeric(5,4) |
| `weighted_contribution` | numeric(6,3) |
| `reasoning` | text |
| `created_at` | timestamptz |

`dimension` enum (as 7 dimensões do Core 1): `objective_clarity`; `experience_quality`; `evidence_and_results`; `skills_and_tools`; `cross_source_consistency`; `positioning_quality`; `profile_completeness`.
`rubric_level` deve estar entre **zero e quatro**.

#### `fit_analysis_results`
| Campo | Tipo |
| --- | --- |
| `analysis_id` | UUID |
| `iao_raw_score` | numeric(5,2) |
| `iao_final_score` | numeric(5,2) |
| `iao_display_score` | smallint |
| `iao_band` | enum |
| `recommendation_type` | enum |
| `recommendation_reasoning` | text |
| `calculation_snapshot` | JSONB |
| `created_at` | timestamptz |

`iao_band` enum: `low_observable_fit`; `partial_fit`; `good_observable_fit`; `high_observable_fit`.
`recommendation_type` enum — **para vaga**: `apply_now`; `apply_with_adjustments`; `develop_gaps_before_applying`; `do_not_prioritize`; `insufficient_data`.
`recommendation_type` enum — **para cargo-alvo**: `ready_to_prioritize`; `prioritize_with_adjustments`; `develop_before_prioritizing`; `reassess_target_context`; `insufficient_data`.

#### `analysis_limits`
Registra todos os limites aplicados ao resultado.
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `analysis_id` | UUID |
| `limit_type` | enum |
| `maximum_score` | smallint nullable |
| `reason` | text |
| `requirement_ids` | UUID[] |
| `applied` | boolean |
| `created_at` | timestamptz |

`limit_type` enum: `confirmed_blocker`; `multiple_critical_mandatory_gaps`; `strong_seniority_mismatch`; `insufficient_data_restriction`; `other_versioned_rule`.

Regras: confiança armazenada separadamente do score; baixa confiança não altera silenciosamente IPP/IAO; score bruto e final preservados; análises concluídas são imutáveis; reanálise cria novo registro, relacionado via `previous_analysis_id`; versões de entrada e configuração obrigatórias; saída bruta não validada da IA não é tratada como resultado; alterações futuras no motor não recalculam análises antigas silenciosamente.

### 4.12 Oportunidades, referências e requisitos

#### `opportunities`
Oportunidade lógica cadastrada pelo usuário.
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `user_id` | UUID |
| `current_version_id` | UUID nullable |
| `status` | enum |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

`status` enum: `draft`; `confirmed`; `archived`.

#### `opportunity_versions`
Versão imutável da vaga.
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `opportunity_id` | UUID |
| `version_number` | integer |
| `previous_version_id` | UUID nullable |
| `title` | text |
| `company` | text nullable |
| `source_type` | enum |
| `source_document_id` | UUID nullable |
| `reference_url` | text nullable |
| `content_hash` | text |
| `structured_snapshot` | JSONB |
| `confirmation_status` | enum |
| `confirmed_at` | timestamptz nullable |
| `created_at` | timestamptz |

`source_type` enum: `pasted_text`; `pdf`; `manual_entry`.

#### `role_references`
Referência lógica aprovada de cargo.
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `normalized_role` | text |
| `area` | text |
| `status` | enum |
| `current_version_id` | UUID nullable |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

#### `role_reference_versions`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `role_reference_id` | UUID |
| `version_number` | integer |
| `seniority` | enum |
| `reference_snapshot` | JSONB |
| `source_method` | text |
| `approval_status` | enum |
| `approved_by` | UUID nullable |
| `approved_at` | timestamptz nullable |
| `created_at` | timestamptz |

Uma análise por cargo-alvo só pode usar referência com estado **aprovado**.

#### `requirements`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `opportunity_version_id` | UUID nullable |
| `role_reference_version_id` | UUID nullable |
| `description` | text |
| `normalized_name` | text nullable |
| `category` | enum |
| `criticality` | enum |
| `is_critical` | boolean |
| `applicability` | enum |
| `extraction_confidence` | numeric(4,3) |
| `source_excerpt` | text |
| `ambiguous` | boolean |
| `user_confirmed` | boolean |
| `created_at` | timestamptz |

`category` enum: `skill`; `tool`; `experience`; `responsibility`; `education`; `certification`; `seniority`; `scope`; `location`; `language`; `other`.
`criticality` enum: `mandatory`; `desired`; `differential`; `complementary`; `blocking`.
`applicability` enum: `applicable`; `not_applicable`; `unknown`.

O estado impeditivo é representado por `criticality = blocking`; **não deve existir um booleano independente** que possa contradizer a criticidade (nota: a tabela ainda tem `is_critical` boolean — ver "Conflitos"). Cada requisito pertence a **exatamente uma origem**: uma versão de oportunidade OU uma versão de referência de cargo (nunca ambas).

#### `requirement_assessments`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `analysis_id` | UUID |
| `requirement_id` | UUID |
| `match_status` | enum |
| `match_factor` | numeric(4,3) |
| `criticality_weight` | numeric(4,2) |
| `requirement_confidence` | numeric(4,3) |
| `assessment_confidence` | numeric(4,3) |
| `weighted_contribution` | numeric(7,4) |
| `reasoning` | text |
| `gap_type` | enum nullable |
| `created_at` | timestamptz |

`match_status` enum: `confirmed_match`; `partial_match`; `communication_gap`; `evidence_gap`; `unknown`; `not_observed`; `confirmed_mismatch`.
`gap_type` enum: `competency`; `experience`; `education_or_certification`; `communication`; `evidence`; `positioning`; `unknown`.

Regras: fatores e pesos preenchidos pelo backend; **não armazenar** `reference_value`; **não utilizar valores antigos de 100, 60, 30 e zero** (legado explicitamente proibido); estado produzido pela IA deve ser validado; evidências do perfil relacionadas pela tabela específica; `not_observed` não significa ausência confirmada; requisito `not_applicable` não entra no cálculo; requisitos ambíguos reduzem confiança mas não mudam criticidade silenciosamente; classificações e cálculos preservados para auditoria.

### 4.13 Recomendações e ações

#### `recommendations`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `analysis_id` | UUID |
| `recommendation_key` | text |
| `category` | enum |
| `title` | text |
| `problem` | text |
| `reasoning` | text |
| `suggested_action` | text |
| `expected_outcome` | text |
| `completion_criteria` | text |
| `impact` | smallint |
| `effort` | smallint |
| `urgency` | smallint |
| `confidence` | smallint |
| `priority_score` | numeric(5,2) |
| `priority_order` | integer |
| `status` | enum |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

`category` enum: `competency`; `communication`; `evidence`; `positioning`.
`status` enum: `generated`; `highlighted`; `selected`; `dismissed`; `converted_to_action`.

Regras: impacto/esforço/urgência/confiança em escala 1–5; `priority_score` calculado pelo backend; `priority_order` não depende da ordem de geração da IA; recomendações têm critério de conclusão; recomendações duplicadas consolidadas; **até oito recomendações por análise**; **até três recomendações destacadas**; recomendações sem evidência registram a ausência; recomendação não pode inventar fatos.

#### `recommendation_evidences`
| Campo | Tipo |
| --- | --- |
| `recommendation_id` | UUID |
| `evidence_id` | UUID |
| `relationship_type` | enum |
| `created_at` | timestamptz |

#### `recommendation_requirements`
Relaciona recomendações do Core 2 aos requisitos que as originaram.
| Campo | Tipo |
| --- | --- |
| `recommendation_id` | UUID |
| `requirement_id` | UUID |
| `created_at` | timestamptz |

#### `actions`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `user_id` | UUID |
| `recommendation_id` | UUID |
| `status` | enum |
| `user_notes` | text nullable |
| `started_at` | timestamptz nullable |
| `completed_at` | timestamptz nullable |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

`status` enum: `pending`; `selected`; `in_progress`; `completed`.

Regras: **uma análise pode gerar até cinco ações no plano**; ação pertence ao mesmo usuário da recomendação; conclusão da ação não altera análise anterior; eventual reanálise cria novo registro; ações não devem ser apagadas quando a recomendação permanecer no histórico.

### 4.14 Feedbacks

#### `analysis_feedback`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `analysis_id` | UUID |
| `user_id` | UUID |
| `usefulness_score` | smallint |
| `specificity` | enum |
| `intended_action_id` | UUID nullable |
| `application_intent` | enum nullable |
| `comment` | text nullable |
| `created_at` | timestamptz |

`specificity` enum: `yes`; `partially`; `no`.
`application_intent` enum: `apply`; `apply_after_adjustments`; `not_apply`; `undecided`; `not_applicable`.

Restrições: `usefulness_score` entre 1 e 5; **um feedback principal por usuário e análise**; comentário não deve ser enviado automaticamente para analytics; feedback não altera score ou relatório; feedback pode orientar pesquisa e evolução futura.

### 4.15 Créditos e monetização simulada

#### `credit_accounts`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `user_id` | UUID |
| `available_credits` | integer |
| `reserved_credits` | integer |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

Restrições: uma conta de crédito por usuário; saldo disponível nunca negativo; saldo reservado nunca negativo; créditos reservados não podem ser consumidos novamente.

#### `credit_reservations`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `user_id` | UUID |
| `analysis_id` | UUID |
| `amount` | integer |
| `status` | enum |
| `exemption_type` | enum nullable |
| `policy_version` | text |
| `idempotency_key` | text |
| `reserved_at` | timestamptz nullable |
| `confirmed_at` | timestamptz nullable |
| `released_at` | timestamptz nullable |
| `expires_at` | timestamptz nullable |
| `created_at` | timestamptz |

`status` enum: `reserved`; `confirmed`; `released`; `expired`; `exempt`.
`exemption_type` enum (isenções inicialmente permitidas): `technical_retry`; `identical_result_reuse`; `pilot_grant`; `administrative_adjustment`. A gratuidade para reanálise da mesma vaga só deve ser adicionada após decisão formal no Decision Log.

#### `credit_ledger`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `user_id` | UUID |
| `analysis_id` | UUID nullable |
| `reservation_id` | UUID nullable |
| `transaction_type` | enum |
| `amount` | integer |
| `balance_after` | integer |
| `idempotency_key` | text |
| `reason` | text |
| `policy_version` | text |
| `created_at` | timestamptz |

`transaction_type` enum: `grant`; `consumption`; `restoration`; `expiration`; `adjustment`.

Regras: reserva não é consumo definitivo; consumo só ocorre após análise concluída com sucesso; falha técnica libera a reserva; reprocessamento técnico não gera novo consumo; reutilização de resultado idêntico não gera novo consumo quando a política aprovada assim definir; saldo não muda sem registro correspondente no ledger; cada transação tem chave de idempotência; alterações administrativas têm motivo; **o ledger é imutável**; correções usam lançamento compensatório, não alteração retroativa.

#### `purchase_intents`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `user_id` | UUID |
| `offer_key` | text |
| `offer_version` | text |
| `price_cents` | integer |
| `currency` | text |
| `credits_displayed` | integer |
| `validity_days_displayed` | integer |
| `status` | enum |
| `created_at` | timestamptz |

`status` enum: `viewed`; `clicked`; `confirmed_intent`; `dismissed`. **Nenhum dado de cartão será armazenado no MVP.**

### 4.16 Consentimento e exclusão

#### `consent_records`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `user_id` | UUID |
| `consent_type` | enum |
| `policy_version` | text |
| `status` | enum |
| `source` | enum |
| `recorded_at` | timestamptz |
| `revoked_at` | timestamptz nullable |

`status` enum: `granted`; `revoked`; `not_applicable`. Consentimentos e registros necessários ao serviço devem permanecer diferenciados.

#### `deletion_requests`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `user_id` | UUID |
| `status` | enum |
| `requested_at` | timestamptz |
| `confirmed_at` | timestamptz nullable |
| `active_systems_deadline` | timestamptz |
| `backup_deadline` | timestamptz |
| `completed_at` | timestamptz nullable |
| `failure_reason` | text nullable |
| `created_at` | timestamptz |

`status` enum: `requested`; `confirmed`; `processing`; `active_systems_completed`; `backup_removal_pending`; `completed`; `failed`; `cancelled`.

A exclusão deve abranger, conforme política aplicável: dados pessoais; Thin Twin; versões; contexto-alvo; documentos; oportunidades; análises; recomendações; ações; feedbacks; identificadores pessoais; arquivos temporários. Registros mantidos por obrigação legítima devem ser minimizados, desvinculados quando possível, protegidos e documentados.

### 4.17 Auditoria

#### `audit_logs`
| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `user_id` | UUID nullable |
| `actor_type` | enum |
| `actor_id` | UUID nullable |
| `action` | text |
| `resource_type` | text |
| `resource_id` | UUID nullable |
| `result` | enum |
| `correlation_id` | UUID nullable |
| `metadata` | JSONB |
| `created_at` | timestamptz |

Ações relevantes a registrar: alteração de permissões; acesso administrativo; exclusão; exportação; alteração de consentimento; concessão/consumo de crédito; liberação de reserva; criação/falha/conclusão de análise; confirmação de versão; alteração de configuração do motor; incidente; execução de operação administrativa.

O log **não deve armazenar**: documentos integrais; currículos; conteúdo integral do LinkedIn; descrições integrais de vaga; evidências textuais extensas; senhas; tokens; segredos; respostas integrais da IA; dados pessoais desnecessários.

### 5. Relações principais (diagrama textual)

```
auth_user
 ├── user_account
 ├── personal_data
 ├── professional_profile
 │    └── profile_versions
 │         ├── experiences → responsibilities, projects, skills, tools, evidences
 │         ├── education
 │         ├── certifications
 │         └── languages
 ├── target_context → target_context_versions
 ├── documents → document_extractions
 ├── opportunities → opportunity_versions → requirements
 ├── analyses
 │    ├── profile_analysis_result → profile_dimension_results
 │    ├── fit_analysis_result → requirement_assessments, analysis_limits
 │    ├── recommendations → recommendation_evidences, recommendation_requirements, actions
 │    └── analysis_feedback
 ├── processing_jobs
 ├── credit_account → credit_reservations, credit_ledger
 ├── purchase_intents
 ├── consent_records
 └── deletion_requests

role_reference → role_reference_versions → requirements
```

**Relações obrigatórias de toda análise:** `user_id`, `profile_version_id`, `target_context_version_id`, `engine_version`, `configuration_version`, `rubric_version`, `prompt_version`, `schema_version`, `model_version`. Adicional: `job_analysis` → `opportunity_version_id`; `target_role_analysis` → `role_reference_version_id`.

### 6. Integridade (restrições mínimas — lista completa)

um usuário possui no máximo um `personal_data`; um usuário possui no máximo um `professional_profile`; um usuário possui no máximo um `target_context` ativo; uma versão pertence ao seu perfil lógico; uma versão de contexto pertence ao seu contexto lógico; uma versão de oportunidade pertence à sua oportunidade; números de versão únicos dentro da entidade lógica; versões confirmadas imutáveis; análises concluídas imutáveis; perfil/contexto-alvo/oportunidade de uma análise pertencem ao mesmo usuário; análise por vaga exige `opportunity_version_id`; análise por cargo exige `role_reference_version_id`; análise de perfil não aceita oportunidade nem referência de cargo; recomendação pertence à análise; ação pertence ao mesmo usuário da recomendação; feedback pertence ao mesmo usuário da análise; documento pertence ao usuário; oportunidade pertence ao usuário; crédito pertence ao usuário autenticado; reserva pertence ao mesmo usuário da análise; requisito pertence a exatamente uma origem; assessment pertence a requisito usado pela análise; evidência associada pertence à versão do perfil utilizada; `rubric_level` entre zero e quatro; scores entre zero e cem; confianças entre zero e um; escalas de recomendação entre um e cinco; saldo de crédito não pode ser negativo; `idempotency_key` única dentro do escopo definido; análise concluída não pode retornar ao estado de processamento; nova execução após mudança de entrada cria nova análise; resultados antigos não são sobrescritos.

**Constraints obrigatórias** (impedir): requisito simultaneamente ligado a vaga e referência de cargo; requisito sem nenhuma origem; análise com combinações inválidas de tipo e referência; consumo de crédito sem reserva confirmável (salvo isenção aprovada); duas versões com o mesmo número; duas contas de crédito para o mesmo usuário; dois perfis lógicos para o mesmo usuário; dois contextos-alvo ativos para o mesmo usuário; valores de score/confiança fora dos intervalos permitidos.

### 7. Row Level Security

Todas as tabelas com dados de usuário devem ter política de acesso baseada no usuário autenticado.
**Regra direta** (tabela com `user_id`): `resource.user_id = auth.uid()`.
**Regra por cadeia de propriedade** (tabela sem `user_id` direto): política valida a relação até o proprietário. Exemplos citados: `recommendation → analysis → user_id → auth.uid()`; `experience → profile_version → professional_profile → user_id → auth.uid()`.

Regras adicionais: usuários anônimos não acessam dados autenticados; um usuário não acessa dados de outro; escrita valida propriedade (não só leitura); identificadores enviados pelo cliente não substituem a sessão; service role somente em rotinas server-side autorizadas e nunca exposta no frontend; rotinas administrativas registram auditoria; políticas cobrem `select`/`insert`/`update`/`delete`; **versões confirmadas bloqueiam `update`**; **análises concluídas bloqueiam `update`**; operações de worker validam propriedade antes de usar service role.

**Testes mínimos de RLS por entidade de usuário:** 1. proprietário acessa; 2. outro usuário não acessa; 3. anônimo não acessa; 4. tentativa de trocar `user_id` é bloqueada; 5. cadeia indireta de propriedade é respeitada; 6. service role funciona só server-side; 7. versão imutável não pode ser alterada pelo usuário.

### 8. Índices

**Básicos:** `user_id`; `profile_id`; `profile_version_id`; `target_context_id`; `target_context_version_id`; `opportunity_id`; `opportunity_version_id`; `role_reference_version_id`; `analysis_id`; `requirement_id`; `document_id`; `status`; `created_at`; `retention_deadline`; `idempotency_key`; `content_hash`; `analysis_type`; `job_type`; `correlation_id`.

**Únicos:** `user_accounts(user_id)`; `personal_data(user_id)`; `professional_profiles(user_id)`; `target_contexts(user_id)`; `credit_accounts(user_id)`; `profile_versions(profile_id, version_number)`; `target_context_versions(target_context_id, version_number)`; `opportunity_versions(opportunity_id, version_number)`; `role_reference_versions(role_reference_id, version_number)`; `analyses(user_id, idempotency_key)`; `credit_reservations(user_id, idempotency_key)`; `credit_ledger(user_id, idempotency_key)`; `processing_jobs(user_id, idempotency_key)`.

**Compostos:** `(user_id, created_at desc)`; `(user_id, status, created_at desc)`; `(profile_id, version_number desc)`; `(target_context_id, version_number desc)`; `(opportunity_id, version_number desc)`; `(analysis_id, priority_order)`; `(analysis_id, requirement_id)`; `(analysis_id, dimension)`; `(retention_deadline, deleted_at)`; `(status, available_at)`; `(job_type, status, available_at)`; `(user_id, analysis_type, created_at desc)`.

**Parciais recomendados:** jobs `queued`; jobs `processing`; documentos com retenção vencida e `deleted_at` nulo; reservas `reserved`; solicitações de exclusão não concluídas; contas `deletion_pending`.

### 9. Migrations

Toda alteração deve: possuir migration versionada; ser revisável; ser testada em homologação; preservar integridade; registrar backfill; considerar compatibilidade retroativa; ter estratégia de recuperação; evitar alteração manual em produção; atualizar tipos gerados/schemas de validação/testes/documentação.

**Ordem recomendada:** 1. adicionar estrutura nova compatível; 2. liberar código capaz de ler estrutura antiga e nova; 3. executar backfill; 4. validar dados; 5. adicionar constraints; 6. mudar leitura principal; 7. remover estrutura antiga só após validação; 8. registrar conclusão.

**Alterações destrutivas que exigem aprovação explícita:** remoção de coluna; remoção de tabela; alteração incompatível de enum; mudança de tipo com risco de perda; reescrita de versões confirmadas; alteração retroativa de análises; exclusão em massa; mudança de política de RLS; mudança de propriedade; mudança de regra de créditos.

Estrutura de repositório recomendada:
```
supabase/
  migrations/
  seed.sql
  tests/
src/
  db/{generated, repositories, queries, validators}
  domain/{profile, target-context, opportunities, analyses, recommendations, credits}
```

---

## Segurança, Privacidade e Retenção (completo)

### O que o Claude Code não pode fazer sem decisão formal registrada no Decision Log

alterar prazos de retenção; ampliar a coleta de dados; criar novos usos para os dados; habilitar compartilhamento com fornecedores; alterar consentimentos; remover controles de acesso; flexibilizar requisitos de segurança; registrar dados sensíveis para facilitar depuração.

### Classificação dos dados (§3)

**Restritos:** senhas; tokens; cookies de sessão; chaves administrativas; chaves de integração; segredos; credenciais de banco; URLs assinadas ainda válidas; dados internos de autenticação; chaves de criptografia. Não devem ir à IA, a analytics, a logs, nem ao frontend quando server-side; acesso estritamente controlado.

**Confidenciais pessoais:** nome completo; e-mail; cidade; estado; dados da conta; registros de consentimento; solicitação de exclusão; dados de contato usados em pesquisa. **Não coletados no MVP:** data de nascimento; CEP; rua; número; complemento; bairro; endereço residencial completo; dados de cartão.

**Confidenciais profissionais:** currículo; conteúdo do LinkedIn; experiências; responsabilidades; projetos; competências; ferramentas; resultados; evidências; formação; certificações; contexto-alvo; vagas; requisitos; análises; scores; confiança; recomendações; ações; comentários livres; feedbacks profissionais.

**Internos:** configurações; versões de prompt/schema/motor; métricas agregadas; custos; indicadores operacionais; logs técnicos sem conteúdo profissional; relatórios de qualidade; informações de incidentes.

**Públicos:** conteúdo institucional; páginas públicas; documentação publicada; Política de Privacidade; Termos de Uso; materiais de marca autorizados. Um dado não é público apenas por ter sido encontrado em currículo, LinkedIn ou vaga.

### Dados pessoais e IA (§4)

**Não enviar ao modelo:** nome completo (salvo necessidade excepcional e justificada); e-mail; cidade/estado sem necessidade geográfica; data de nascimento; CEP; endereço residencial; credenciais; senhas; tokens; URLs assinadas; chaves; dados financeiros; identificadores internos desnecessários; documentos de outros usuários; histórico não relacionado à tarefa.

O contexto deve usar: identificadores técnicos não diretamente identificáveis; versão do Thin Twin; versão do contexto-alvo; versão da oportunidade; informações profissionais mínimas; evidências estritamente necessárias.

Cidade/estado só podem ser usados em análise quando: houver requisito geográfico explícito; o uso for necessário para a análise; a finalidade estiver informada; somente a informação mínima for utilizada.

**Dados pessoais não influenciam:** IPP; IAO; confiança profissional; recomendações; classificação de senioridade; prioridade de candidatura. O backend deve remover dados proibidos antes da chamada ao provedor de IA — a remoção não deve depender apenas das instruções do prompt.

### Retenção (§5 — números exatos)

| Artefato | Retenção máxima inicial |
| --- | --- |
| Currículo original elegível | **Até 24 horas** |
| LinkedIn original elegível | **Até 24 horas** |
| Vaga original elegível | **Até 24 horas** |
| Imagens geradas para OCR após sucesso | **Até 6 horas** |
| PDF temporário produzido para OCR | **Até 6 horas** |
| Artefatos de tentativa com falha | **Até 24 horas** |
| Arquivos rejeitados | Somente o período necessário para registrar e concluir a rejeição |

Elegibilidade para exclusão: 1. processamento terminou; 2. dados necessários persistidos; 3. integridade validada; 4. sem nova tentativa ativa; 5. arquivo não necessário para correção em andamento.

**Meta operacional: 99% dos arquivos originais elegíveis devem ser excluídos em até 24 horas.**

**Dados estruturados:** podem permanecer enquanto a conta estiver ativa — Thin Twin, versões, contexto-alvo e versões, evidências mínimas, oportunidades confirmadas e versões, análises, scores, confiança, recomendações, ações, feedbacks, consentimentos, eventos necessários para operação e auditoria.

**Conteúdo textual integral** (currículo/LinkedIn/vaga): não mantido indefinidamente por padrão; após estruturação/confirmação, ficam só dados estruturados necessários, snippets mínimos de evidência, metadados necessários, e informações exigidas para rastreabilidade.

**Logs técnicos:** **até 30 dias** para logs técnicos operacionais sem conteúdo profissional. Prazos diferentes devem ser documentados conforme finalidade/risco/necessidade de investigação/obrigação/custo/impacto de privacidade. Não mantidos indefinidamente.

**Exclusão de conta (metas operacionais):** sistemas ativos: **até 15 dias**; remoção/expiração em backups: **até 30 dias**. Apresentados como metas operacionais até a política jurídica definitiva ser aprovada.

### Fluxo de exclusão de arquivos (§6, 13 passos)

1. processamento termina (sucesso ou falha final); 2. sistema confirma persistência dos dados necessários; 3. verifica retentativa ativa; 4. arquivo recebe `retention_deadline`; 5. job automático identifica arquivos elegíveis; 6. arquivo removido do storage; 7. artefatos intermediários removidos; 8. registro atualizado com `deleted_at`; 9. confirmação de exclusão registrada; 10. falhas geram nova tentativa; 11. falhas persistentes geram alerta; 12. atraso acima do prazo gera incidente; 13. exceções justificadas e auditadas.

**Operação mínima:** job de exclusão executado **pelo menos a cada hora**; **alerta preventivo após 18 horas**; **incidente quando o prazo de 24 horas for excedido**; retentativas limitadas; idempotência; registro de elegibilidade/tentativas/confirmação; monitoramento da taxa de exclusão.

Regras: excluir um arquivo duas vezes não gera erro irreversível; arquivo ausente é tratado como estado seguro quando exclusão confirmada; exclusão do storage e atualização do banco permanecem consistentes; falha de atualização do banco após exclusão deve ser recuperável; artefatos não mantidos indefinidamente para depuração; acesso administrativo ao arquivo é registrado.

### Exclusão da conta (§7, 21 passos)

1. usuário autenticado solicita exclusão; 2. sistema apresenta escopo; 3. usuário confirma explicitamente; 4. sistema registra solicitação; 5. conta entra em `deletion_pending`; 6. novas análises e uploads bloqueados; 7. sessões ativas encerradas quando aplicável; 8. jobs em andamento interrompidos ou finalizados com segurança; 9. arquivos temporários excluídos; 10. dados pessoais excluídos; 11. Thin Twin e versões excluídos; 12. contextos-alvo excluídos; 13. oportunidades e requisitos excluídos; 14. análises e resultados excluídos; 15. recomendações e ações excluídas; 16. feedbacks identificáveis excluídos; 17. identificadores pessoais em analytics removidos ou anonimizados conforme política; 18. conta de autenticação removida; 19. conclusão nos sistemas ativos registrada; 20. dados em backups expiram/removidos conforme prazo; 21. status final disponibilizado ao usuário quando aplicável.

Regras: exclusão idempotente, rastreável, auditável, recuperável após falha, executada em etapas, protegida contra exclusão do usuário errado, associada a solicitação confirmada. Uma exclusão não é considerada concluída apenas porque a conta deixou de aparecer na interface.

### Consentimentos (§8)

Separados por finalidade: **tratamento necessário para o serviço** (criar/operar conta, receber documentos, criar Thin Twin, manter contexto-alvo, gerar análises, manter histórico, apresentar recomendações, executar exclusões, proteger a plataforma) vs. **consentimento opcional para melhoria** (uso de dados anonimizados/selecionados/minimizados/separados de identificadores diretos, para melhorar prompts, avaliar qualidade, criar casos de teste, analisar falhas, desenvolver o produto).

A recusa ao consentimento opcional: não impede cadastro, onboarding, Core 1 ou Core 2; não reduz qualidade intencionalmente; não altera créditos.

Cada consentimento registra: tipo; versão da política; status; origem; data; revogação quando aplicável. Revogação: impede novos usos opcionais; não altera retroativamente tratamentos já concluídos de forma válida; atualiza o registro; é refletida nos processos relacionados. O Claude Code não deve combinar consentimentos diferentes em uma única opção genérica.

### Controle de acesso (§9)

**Usuário** acessa somente: seus dados pessoais, Thin Twin, contextos-alvo, documentos, oportunidades, análises, recomendações, ações, feedbacks, créditos, solicitações.
**Aplicação:** permissões mínimas por operação; frontend **não** tem chave administrativa, service role, acesso irrestrito a banco/storage, ou segredos de fornecedores.
**Backend:** deriva usuário da sessão; valida propriedade; não confia em `user_id` enviado livremente; valida relações entre recursos; limita cada chamada à operação necessária; registra operações críticas.
**Serviços internos/workers:** acessam somente jobs necessários, documentos relacionados, análise relacionada, usuário proprietário, recursos exigidos pela execução. Service role restrita ao server-side e não elimina a necessidade de validação de propriedade.
**Administração:** acesso excepcional, temporário quando possível, menor privilégio, justificado, auditado, revisado, revogado quando não necessário.
**Desenvolvimento:** desenvolvedores e Claude Code não têm acesso irrestrito a dados reais de produção; dev/testes/seeds/fixtures usam dados sintéticos.

### Proteções técnicas (§10)

HTTPS; criptografia em trânsito e em repouso (do provedor); autenticação; autorização server-side; RLS ou equivalente; buckets privados; URLs assinadas e temporárias; menor privilégio; segregação de ambientes; migrations versionadas; gerenciamento de segredos; rotação de credenciais; proteção de branches; revisão de código; análise de dependências; testes de autorização; logs de auditoria; backups protegidos; alertas; rate limiting; proteção contra abuso; validação de entradas/schemas; sanitização; prevenção de prompt injection; idempotência; proteção contra processamento duplicado; monitoramento de exclusões; tratamento de incidentes.

### Upload seguro (§11)

**Validar antes do processamento:** allowlist de extensões; tipo real do arquivo; MIME type; tamanho; quantidade de páginas; estrutura; checksum; proteção por senha; conteúdo mínimo; presença de malware; tentativas excessivas; autenticação; autorização.
**Rejeitar:** executáveis; scripts; arquivos compactados não autorizados; arquivos protegidos quando não suportados; conteúdo acima dos limites; arquivo corrompido; tipo incompatível; arquivo malicioso; upload anônimo; conteúdo sem material profissional mínimo quando exigido.
Regras: gerar nome interno (não usar nome original como caminho); não executar o arquivo; bucket privado; URL assinada com validade limitada; não incluir documento/texto completo em mensagens da fila; não incluir credenciais/tokens/URLs assinadas em analytics; calcular checksum; impedir acesso cruzado entre usuários; excluir conforme retenção.
Processamento (extração/OCR/antimalware): ambiente isolado, recursos limitados, sem acesso desnecessário a segredos, sem macros/scripts, com timeout, com registro técnico seguro.

### Segurança da integração com IA (§12)

Acesso somente pelo backend/worker autorizado, com credenciais server-side, correlação técnica, dentro do fluxo autorizado.
Contexto enviado: só Thin Twin necessário, contexto-alvo necessário, oportunidade necessária, evidências mínimas, schema, instruções versionadas.
Isolamento: cada chamada associada a usuário, versão do Thin Twin, versão do contexto-alvo, versão da oportunidade (quando aplicável), análise, job, prompt, schema, modelo. **Contexto não deve ser reutilizado entre usuários.**

**Defesas contra prompt injection (na camada de dados/sistema):** currículos, LinkedIn e vagas são tratados como **dados não confiáveis**. O sistema deve: delimitar documentos; ignorar instruções encontradas no conteúdo; usar schemas com enums; limitar ferramentas; validar a saída; bloquear comportamento não permitido; registrar padrões suspeitos quando aplicável.

**Saída da IA:** toda resposta passa por parse; validação estrutural; validação de tipos; validação de enums; validação de evidências; validação de autenticidade; validação de dados proibidos; validação de propriedade; cálculo determinístico no backend.

**Fornecedor de IA** (antes da adoção definitiva, avaliar): região de processamento; retenção de entradas/saídas; uso para treinamento; controles de segurança; subfornecedores; exclusão; disponibilidade; registros contratuais; resposta a incidentes. **Nenhuma opção de treinamento com dados do usuário deve ser ativada sem autorização e decisão formal.**

Claude Code não deve: inserir prompts completos com dados reais em testes; copiar documentos reais para fixtures; registrar respostas integrais; expor chaves do provedor; alterar políticas do fornecedor; habilitar armazenamento adicional; adicionar ferramentas externas ao agente sem aprovação.

### Ameaças prioritárias (§13 — matriz completa)

| Ameaça | Controle preventivo | Controle detectivo | Resposta |
| --- | --- | --- | --- |
| Acesso entre usuários | RLS e validação server-side | Testes e logs de autorização | Bloquear acesso e abrir incidente |
| Vazamento por URL pública | Storage privado e URL assinada | Verificação de configuração | Revogar URL, excluir objeto e corrigir política |
| Exposição de segredo | Gerenciador e menor privilégio | Scanning de repositório | Rotacionar e investigar |
| Prompt injection | Delimitação, schemas e ferramentas limitadas | Validação de saída | Ignorar instrução ou interromper |
| Upload malicioso | Allowlist, MIME real e antimalware | Logs de rejeição | Rejeitar, isolar e registrar |
| Invenção factual da IA | Evidências, guardrails e QA | Validador de autenticidade | Bloquear resultado |
| Usuário ou versão incorreta | Validação de propriedade e versões | Auditoria de vínculos | Interromper e abrir incidente |
| Duplicação de crédito | Reserva, idempotência e ledger | Reconciliação | Liberar ou restaurar crédito |
| Retenção indevida | Jobs automáticos e alertas | Métrica de arquivos vencidos | Excluir e abrir incidente |
| Exposição em logs | Redação e allowlist de campos | Scanning e revisão | Remover, restringir e investigar |
| Exclusão incompleta | Orquestração e estados | Reconciliação de recursos | Retomar exclusão e registrar evidência |
| Dependência vulnerável | Scanning e atualização | Alertas de vulnerabilidade | Atualizar, mitigar ou remover |
| Conta comprometida | Sessão, rate limit e revogação | Eventos de autenticação | Revogar sessões e proteger conta |
| Migration insegura | Revisão e homologação | Testes de integridade | Interromper deploy e recuperar |
| Backup inacessível ou exposto | Criptografia e acesso restrito | Teste e auditoria | Corrigir configuração e investigar |
| Analytics com dados profissionais | Catálogo e payload mínimo | Auditoria de eventos | Interromper envio e corrigir |
| Dados reais no ambiente de desenvolvimento | Dados sintéticos | Revisão e scanning | Remover, rotacionar e investigar |

### Logs seguros (§14)

**Não registrar:** currículo integral; LinkedIn integral; vaga integral; evidências textuais extensas; comentários livres integrais; nome completo sem necessidade; e-mail em texto aberto; cidade/estado sem necessidade; endereço; data de nascimento; senha; tokens; cookies; URLs assinadas; chaves; segredos; prompts completos com dados profissionais; respostas integrais da IA; dados financeiros; stack trace em mensagem visível ao usuário.

**Registrar:** identificadores técnicos; `correlation_id`; `job_id`; `analysis_id`; tipo de operação; status; duração; código de erro; categoria de erro; versão do modelo/prompt/schema/motor/configuração; número da tentativa; tamanho aproximado do payload; quantidade de tokens; resultado da validação; limite aplicado; confirmação de exclusão; operação administrativa relevante.

### Backups (§15)

Deve definir: periodicidade; escopo; retenção; criptografia; controle de acesso; região; responsável; monitoramento; teste de restauração; exclusão; recuperação de desastre. Backups devem permanecer separados do ambiente ativo; dados excluídos expiram/são removidos dentro da meta definida; **backups não devem ser considerados uma solução válida até que uma restauração tenha sido testada com sucesso**. Claude Code não deve assumir provedor, frequência, retenção detalhada, região ou objetivo de recuperação sem decisão arquitetural registrada.

### Secure Development Lifecycle (§16, 25 passos antes de liberar funcionalidade)

Inclui revisar: requisitos, dados coletados/processados, finalidade, minimização, modelo de ameaça, autenticação, autorização, RLS, storage, uploads, chamadas à IA, schemas, logs, analytics, retenção, exclusão, segredos; executar: análise de dependências, testes de isolamento/segurança/privacidade, QA da IA; revisar migrations; atualizar documentação; obter aprovação quando houver decisão pendente.

**Testes mínimos:** usuário no próprio recurso; usuário em recurso de outro; acesso anônimo; alteração de `user_id` no payload; upload malicioso; arquivo de tipo falso; URL assinada expirada; documento de outro usuário; prompt injection; schema inválido; dado pessoal enviado à IA; dado profissional enviado a analytics; segredo registrado; exclusão duplicada; exclusão parcialmente concluída; job de retenção atrasado; backup restaurado; migration com dados existentes.

### Critérios de bloqueio de release (§17 — lista completa, literal)

A release deve ser bloqueada quando houver:
- usuário acessando dado de outro usuário;
- política de acesso ausente em tabela de usuário;
- autorização implementada somente na interface;
- bucket público;
- arquivo acessível por URL permanente;
- arquivo não excluído conforme a política;
- exclusão de conta incompleta;
- exclusão associada ao usuário errado;
- segredo exposto;
- segredo versionado no repositório;
- dado pessoal enviado indevidamente à IA;
- documento de outro usuário enviado à IA;
- analytics contendo currículo, LinkedIn, vaga ou evidência textual;
- logs contendo conteúdo sensível;
- senha, token ou chave em log;
- saída de IA persistida sem validação;
- prompt injection alterando comportamento do sistema;
- falha crítica de RLS;
- upload malicioso executável;
- antimalware ou validação obrigatória desativados;
- backup sem proteção;
- restauração nunca testada antes da entrada em produção;
- retenção sem job ou monitoramento;
- exclusão sem rastreabilidade;
- falha crítica sem alerta;
- migration destrutiva sem aprovação;
- dependência crítica vulnerável sem mitigação;
- consentimento opcional bloqueando o produto;
- coleta de data de nascimento, CEP ou endereço residencial;
- **uso de dados pessoais no IPP, IAO, confiança ou recomendações**;
- dados reais de produção utilizados em seeds, fixtures ou desenvolvimento;
- alteração silenciosa de prazo, finalidade, fornecedor ou regra de segurança.

Liberação só após: 1. correção; 2. reteste; 3. registro da evidência; 4. revisão dos documentos afetados; 5. registro no Decision Log quando houver mudança de decisão.

---

## Analytics (completo)

### Princípios

Minimização (não enviar conteúdo profissional/pessoal desnecessário); consistência (este documento é o catálogo canônico); rastreabilidade (versão do contrato e do fluxo por evento); qualidade (documentados, validados, testados); separação (analytics ≠ logs técnicos ≠ observabilidade ≠ auditoria); privacidade (nenhum dado pessoal direto quando pseudônimo bastar); **fonte de verdade** — analytics registra comportamento observado e **não** é fonte de verdade para saldo de créditos, status de análises, scores, versões do perfil, consentimentos, exclusões, permissões (essas ficam no banco operacional).

### Convenção de nomes

Formato `objeto_ação` (ex.: `signup_started`; `resume_uploaded`; `profile_analysis_completed`; `recommendation_selected`). Regras: inglês; `snake_case`; ação no passado quando concluída; um evento = uma ação observável; não duplicar eventos com nomes diferentes; não incluir valores variáveis no nome; não criar nomes dinamicamente; documentar alterações de significado; versionar mudanças de contrato. PRDs devem referenciar este catálogo, não criar nomes alternativos.

### Propriedades comuns a todo evento

| Propriedade | Descrição |
| --- | --- |
| `event_id` | Identificador único |
| `event_version` | Versão do contrato do evento |
| `anonymous_id` | Identificador antes do cadastro |
| `user_id_hash` | Identificador pseudônimo |
| `session_id` | Sessão |
| `occurred_at` | Data e hora em UTC |
| `platform` | Plataforma |
| `environment` | Development, staging ou production |
| `app_version` | Versão da aplicação |
| `flow_version` | Versão do fluxo |
| `source` | Client, server, worker ou derived |
| `analysis_id` | Análise relacionada, quando aplicável |
| `analysis_type` | Core 1, Core 2 por vaga ou Core 2 por cargo-alvo |
| `experiment_id` | Experimento aprovado, quando aplicável |

Dados profissionais/scores só de forma agregada: faixa de IPP; faixa de IAO; nível de confiança; quantidade de recomendações; quantidade de requisitos; presença de limite aplicado; categoria da recomendação.

**Nunca enviar** (lista completa e literal): nome completo; e-mail; cidade; estado; endereço; data de nascimento; currículo; LinkedIn; descrição integral da vaga; experiências em texto; evidências em texto; recomendações em texto; comentários livres; prompts; respostas integrais da IA; senhas; tokens; credenciais; URLs assinadas.

### Catálogo de eventos por área

**Aquisição:** `landing_viewed`; `landing_primary_cta_clicked`; `landing_secondary_cta_clicked`; `signup_started`; `signup_completed`; `login_started`; `login_completed`; `login_failed`. Propriedades: origem; campanha; página; tipo de CTA; destino do CTA; dispositivo; primeira visita; usuário novo/recorrente; categoria segura de erro.

**Onboarding:** `onboarding_started`; `onboarding_resumed`; `resume_uploaded`; `linkedin_uploaded`; `upload_failed`; `onboarding_completed`. Diagnóstico adicional: `onboarding_step_viewed`; `onboarding_step_completed`; `resume_validation_failed`; `linkedin_validation_failed`; `resume_replaced`; `linkedin_replaced`; `onboarding_abandoned` (evento **derivado**, com janela de inatividade configurável e documentada). Propriedades: tipo do documento; tamanho em faixa; formato; etapa; duração; método de extração; quantidade de tentativas; categoria do erro; origem da retomada.

**Thin Twin:** `twin_extraction_started`; `twin_extraction_completed`; `twin_extraction_failed`; `twin_review_started`; `twin_field_corrected`; `twin_field_added`; `twin_field_removed`; `twin_conflict_resolved`; `twin_profile_confirmed`; `twin_version_created`.
**Contexto-alvo:** `target_role_defined`; `target_role_suggested`; `target_role_selected`. Propriedades: quantidade de experiências; quantidade de conflitos; confiança agregada; duração da revisão; quantidade de correções; versão do Thin Twin; versão do contexto-alvo. **Não enviar** conteúdo dos campos profissionais.

**Core 1:** `profile_analysis_started`; `profile_analysis_completed`; `profile_analysis_failed`; `profile_analysis_viewed`; `recommendation_viewed`; `recommendation_selected`; `action_started`; `action_completed`; `experience_suggestion_copied`; `profile_reanalysis_started`; `profile_reanalysis_completed`; `analysis_feedback_submitted`. Adicionais: `profile_analysis_blocked`; `profile_analysis_reused`; `profile_analysis_low_confidence`; `ipp_dimension_viewed`; `evidence_viewed`; `recommendation_status_changed`; `action_status_changed`. Propriedades: faixa de IPP; nível de confiança; quantidade de recomendações; categoria da recomendação; prioridade; status da ação; duração; versão do Thin Twin/contexto-alvo/motor/rubrica/prompt; categoria do erro; origem da reanálise. **Não enviar** texto das recomendações, evidências ou sugestões.

**Core 2 (canônicos):** `job_analysis_started`; `job_analysis_completed`; `job_analysis_failed`; `job_analysis_viewed`; `job_recommendation_received`; `analysis_feedback_submitted`. Adicionais: `target_role_analysis_started`; `target_role_analysis_completed`; `opportunity_upload_started`; `opportunity_upload_completed`; `opportunity_validation_failed`; `opportunity_structuring_completed`; `opportunity_confirmed`; `iao_requirement_viewed`; `application_intent_submitted`; `opportunity_action_started`; `opportunity_action_completed`; `fit_reanalysis_started`; `fit_reanalysis_completed`. Propriedades: tipo de análise; faixa de IAO; nível de confiança; quantidade de requisitos; quantidade por criticidade; quantidade por correspondência; quantidade de riscos; presença de limite aplicado; tipo de recomendação; intenção de candidatura; duração; versões (Thin Twin/contexto-alvo/vaga/referência de cargo/motor/rubrica/prompt); categoria do erro. **Não enviar** texto integral da vaga, requisitos, evidências ou recomendações.

**Feedback:** `analysis_feedback_submitted`; `csat_submitted`; `specificity_feedback_submitted`. Propriedades: tipo de análise; utilidade; especificidade; intenção de ação; intenção de candidatura; etapa da jornada. Comentários livres ficam no banco operacional protegido, nunca integralmente no fornecedor de analytics.

**Monetização simulada:** `credits_viewed`; `paywall_viewed`; `package_selected`; `purchase_intent_confirmed`; `purchase_intent_abandoned`; `credit_consumed`; `credit_restored`. Propriedades: identificador da oferta; preço exibido; quantidade de créditos; validade exibida; faixa do saldo anterior; faixa do saldo posterior; motivo categorizado da restauração; tipo da análise relacionada. O MVP não tem pagamento real — **não criar** `payment_completed`, `subscription_created`, `card_added` enquanto fora de escopo. O ledger de créditos é a fonte de verdade para consumo/restauração.

**Privacidade** (preferencialmente em auditoria interna, não em analytics de produto): `consent_recorded`; `consent_revoked`; `account_deletion_requested`; `account_deleted`; `document_deleted`; `document_deletion_failed`. Uma versão mínima de `account_deletion_requested` pode ir ao analytics de produto se estiver de acordo com a Política de Privacidade e a política de consentimento.

### Funil principal (literal)

Aquisição/ativação: `landing_viewed → signup_started → signup_completed → onboarding_started → resume_uploaded → linkedin_uploaded → twin_profile_confirmed → target_role_defined → onboarding_completed → profile_analysis_completed`.
Geração de valor: `profile_analysis_completed → recommendation_viewed → recommendation_selected → action_started → action_completed`.
Core 2: `job_analysis_started → job_analysis_completed → job_recommendation_received → application_intent_submitted`.
Monetização simulada: `paywall_viewed → package_selected → purchase_intent_confirmed`.
Core 2, ação e monetização não devem ser tratados como uma única sequência obrigatória.

### Métrica principal — Taxa de Análise Acionável

Análise acionável quando: utilidade = 4 ou 5 **e** pelo menos uma recomendação/ação relacionada foi selecionada, iniciada ou concluída.
Fórmula: `Análises úteis com ação ÷ Análises concluídas com janela de observação encerrada`.
Considera só análises: concluídas com sucesso; visualizadas pelo usuário; com possibilidade de envio de feedback; com janela de observação terminada.
**A duração exata da janela ainda precisa ser registrada no Decision Log.** Enquanto pendente: dashboard apresenta separadamente análises úteis e análises com ação; a métrica não deve ser publicada como indicador oficial; nenhuma janela deve ser definida silenciosamente pelo Claude Code.

### Qualidade dos eventos (checklist pré-produção)

validar nome; validar versão; validar propriedades; validar tipos; testar disparo único; testar idempotência; testar ordem; testar ambiente; testar origem client e server; testar usuário anônimo e autenticado; impedir conteúdo pessoal ou profissional; impedir eventos duplicados; documentar trigger; documentar responsável; validar métrica relacionada; validar dashboard; validar consentimento quando aplicável. **Eventos não documentados não devem ser enviados à produção.** Eventos de conclusão devem ser emitidos preferencialmente pelo backend, após a persistência bem-sucedida da operação.

### Catálogo de eventos (schema da base Notion)

Campos: Evento; Descrição; Trigger; Origem (client/server/worker/derived); Propriedades; Dados proibidos; Área; PRD; Responsável (DRI); Status (proposto/implementado/validado/descontinuado); Versão; Métrica; Dashboard. Esta página é a **fonte canônica** dos nomes de eventos — em caso de divergência com PRD/implementação/dashboard, o nome definido aqui prevalece após revisão.

---

## Incidentes (completo)

### Definição de incidente

Evento não planejado que: interrompe o serviço; degrada significativamente o serviço; expõe ou ameaça dados; permite acesso entre usuários; associa dados/análises ao usuário incorreto; produz análises incorretas de forma sistêmica; compromete a integridade do IPP/IAO; ignora bloqueadores/limites/regras determinísticas; causa perda ou duplicação de dados; consome/restaura créditos incorretamente; impede exclusões dentro da política; viola guardrails críticos; compromete a rastreabilidade de uma análise. Um bug isolado sem impacto material pode ser tratado como defeito. Um alerta não é automaticamente um incidente (pode virar falso positivo, defeito, degradação ou incidente declarado). Pode ser declarado manualmente a partir de: suporte; feedback de usuário; revisão de qualidade; auditoria; teste interno; alerta técnico.

### Categorias (§3 — completo)

- **Disponibilidade:** aplicação indisponível; login indisponível; banco indisponível; storage indisponível; fila parada; worker indisponível; provedor de IA indisponível; análises permanentemente travadas.
- **Segurança:** acesso indevido; falha de isolamento entre usuários; segredo exposto; conta comprometida; tentativa de exploração; vulnerabilidade crítica; falha relevante de RLS; uso indevido de credencial administrativa.
- **Privacidade:** dado enviado ao destinatário incorreto; documento/URL tornado público; retenção indevida; falha de exclusão; dado pessoal enviado à IA indevidamente; dado pessoal/profissional enviado a analytics; acesso administrativo sem justificativa/registro.
- **Integridade:** análise associada ao usuário incorreto; versão incorreta do Thin Twin; versão incorreta do contexto-alvo; vaga/referência de cargo incorreta; score calculado incorretamente; bloqueador/limite não aplicado; crédito duplicado; perda/alteração indevida de histórico; sobrescrita silenciosa de relatório.
- **Qualidade da análise:** invenção factual crítica; recomendação incompatível com evidências; requisito classificado incorretamente em escala; bloqueador ignorado; ausência de evidências apresentada como correspondência; falha sistêmica de schema; resultado parcial apresentado como definitivo; conteúdo ofensivo/discriminatório/impróprio.
- **Operacional:** custo anormal; jobs acumulados; exclusões atrasadas; backup falho; deploy incorreto; migration incorreta; falha de rollback; eventos de analytics incorretos ou duplicados.

### Severidade (§4)

Considera: quantidade de usuários; duração; sensibilidade dos dados; possibilidade de acesso entre usuários; reversibilidade; impacto sobre decisões profissionais; impacto financeiro; impacto legal/reputacional; existência de alternativa; recorrência.

**SEV-1 — Crítica.** Exemplos: vazamento confirmado; acesso entre usuários; documento profissional público em produção; análise vinculada ao usuário incorreto; perda relevante/irreversível de dados; sistema amplamente indisponível; segredo de produção exposto; alteração não autorizada de scores em escala; risco legal/reputacional grave. Resposta: declarar imediatamente; atribuir Incident Commander; interromper/isolar componente; preservar evidências; suspender novas operações quando necessário; informar liderança; envolver segurança e privacidade; avaliar comunicação aos usuários afetados; avaliar obrigações legais.

**SEV-2 — Alta.** Exemplos: funcionalidade core indisponível para muitos usuários; análises incorretas em escala; bloqueadores/limites não aplicados; créditos consumidos indevidamente em escala; jobs críticos travados; exclusões significativamente atrasadas; vulnerabilidade relevante sem exploração confirmada; falha recorrente de geração/validação de relatórios. Resposta: investigação prioritária; conter impacto; interromper novas análises afetadas quando necessário; informar Produto e Engenharia; atualizações periódicas; identificar usuários/registros afetados.

**SEV-3 — Média.** Exemplos: degradação parcial; falha com alternativa disponível; erro limitado e reversível; analytics incorreto; relatório incompleto sem risco crítico; falha de integração sem perda de dados; atraso operacional dentro de margem recuperável.

**SEV-4 — Baixa.** Exemplos: defeito visual; pequena inconsistência; falha sem impacto material; problema interno sem efeito perceptível; alerta sem impacto confirmado. Pode ficar como defeito de backlog, salvo recorrência sistêmica.

### Metas operacionais iniciais (§5 — propostas, exigem aprovação no Decision Log)

| Severidade | Reconhecimento | Atualizações |
| --- | --- | --- |
| SEV-1 | Até 15 minutos | A cada 30 minutos |
| SEV-2 | Até 30 minutos | A cada 60 minutos |
| SEV-3 | Até 1 dia útil | Conforme avanço |
| SEV-4 | Backlog | Sem cadência obrigatória |

Reconhecimento = confirmar recebimento + iniciar triagem + atribuir responsável + registrar incidente. Não são SLA contratual nem compromisso público; podem ser revisadas; não substituem obrigações específicas de segurança/privacidade.

### Papéis (§6)

Incident Commander (coordena, define prioridades, mantém linha do tempo, solicita interrupções, garante comunicação, acompanha até o encerramento); Responsável técnico (investiga, reproduz quando seguro, identifica componentes, executa contenção/mitigação, valida recuperação); Comunicação (atualiza stakeholders, prepara comunicação a usuários, mantém consistência, registra comunicações); Segurança e privacidade (avalia exposição de dados, preserva evidências, recomenda revogação de acessos, avalia impacto sobre titulares, orienta comunicações e obrigações); Product Owner (avalia impacto na jornada, decide suspensão de funcionalidades, avalia relatórios/usuários afetados, coordena correções, prioriza ações posteriores). Uma pessoa pode acumular papéis no MVP, mas responsabilidades explícitas, IC identificado, nenhuma ação crítica sem responsável.

### Fluxo de resposta (§7, 18 passos)

1. detectar; 2. registrar evidências iniciais; 3. avaliar se declara incidente; 4. classificar categoria/severidade; 5. atribuir IC; 6. identificar sistemas/usuários/registros afetados; 7. conter impacto; 8. preservar evidências; 9. mitigar causa imediata; 10. comunicar internamente; 11. comunicar usuários quando necessário; 12. recuperar serviço; 13. validar dados/análises/créditos; 14. monitorar estabilidade; 15. declarar resolvido; 16. post-mortem quando aplicável; 17. acompanhar ações corretivas; 18. encerrar incidente. Durante a resposta: não apagar evidências necessárias; não alterar relatórios silenciosamente; não consumir créditos por tentativas técnicas; não expor detalhes internos ao usuário; não executar correções em massa sem validação; não usar produção como ambiente de experimentação.

### Registro do incidente (§8 — campos completos)

`incident_id`; Título; Categoria; Severidade; Status; Ambiente; Início; Detecção; Declaração; Resolução; Encerramento; Fonte da detecção; Usuários afetados; Sistemas afetados; Dados afetados (categorias, sem conteúdo integral); Análises afetadas; Versões afetadas (perfil, contexto, vaga, motor, prompt, schema, rubrica); Descrição; Impacto; Causa; Mitigação; Correção; Incident Commander; Responsáveis técnicos; Linha do tempo; Comunicação; Auditoria; Post-mortem; Ações. **Não armazenar:** documentos integrais; senhas; tokens; chaves; prompts completos; respostas integrais da IA; dados pessoais desnecessários; URLs assinadas; stack traces com conteúdo profissional.

### Estados canônicos (§9)

`declared`; `investigating`; `identified`; `mitigating`; `monitoring`; `resolved`; `closed`; `reopened`. Devem ser implementados como enum compartilhado (evitar strings diferentes entre banco, backend e interface administrativa).

### Contenção por categoria (§10)

**Vazamento/acesso indevido:** interromper acesso; revogar sessões/tokens; rotacionar chaves; bloquear credenciais comprometidas; preservar logs; identificar dados/usuários afetados; verificar RLS; avaliar comunicação/obrigações.
**Arquivo público:** revogar URL; tornar bucket/objeto privado; remover permissões indevidas; excluir cópias temporárias; verificar registros de acesso; corrigir política de storage; validar outros objetos com mesma configuração.
**Falha sistêmica de análise:** interromper modelo/prompt/schema/fluxo afetado; bloquear novas análises quando necessário; identificar relatórios afetados; registrar versões; diferenciar falha da IA vs. determinística; corrigir e validar com testes; reprocessar só quando seguro; **não sobrescrever relatório anterior**; comunicar usuários afetados quando aplicável.
**Score/bloqueador/limite incorreto:** interromper cálculo/publicação; identificar versão do motor/rubrica; validar entradas e regras determinísticas; corrigir backend; identificar análises afetadas; marcar resultados inválidos/substituídos; gerar nova versão quando apropriado; **não alterar silenciosamente o histórico**.
**Consumo incorreto de crédito:** interromper novos consumos afetados; identificar transações pelo ledger; restaurar/ajustar por nova transação; **não alterar apenas o saldo agregado**; identificar usuários afetados; corrigir idempotência; validar que retentativas técnicas não consumiram créditos.
**Falha de exclusão:** identificar arquivos/usuários afetados; impedir novos atrasos; executar exclusão manual controlada quando necessário; investigar o job; manter novas tentativas automáticas; registrar evidência da exclusão; abrir incidente quando prazo ultrapassado; verificar outros arquivos processados pelo mesmo fluxo.

### Post-mortem (§12)

Obrigatório para: SEV-1; SEV-2; incidentes recorrentes; incidentes de segurança; incidentes de privacidade; falhas de isolamento entre usuários; falhas sistêmicas de IA; scores incorretos em escala; bloqueadores/limites ignorados; falhas relevantes de exclusão.
Estrutura: 1. resumo; 2. impacto; 3. usuários/dados/análises afetados; 4. linha do tempo; 5. detecção; 6. resposta; 7. causa raiz; 8. fatores contribuintes; 9. versões técnicas envolvidas; 10. o que funcionou; 11. o que não funcionou; 12. ações corretivas; 13. responsáveis/prazos/evidências. Sem culpabilização individual; diferencia causa raiz de fator contribuinte; diferencia falha de processo/código/configuração/modelo.

### Ações corretivas (§13)

Campos: identificador; título; incidente relacionado; categoria; prioridade operacional; responsável; prazo; status; critério de conclusão; evidência; risco mitigado.
Tipos: prevenção; detecção; contenção; recuperação; segurança; privacidade; qualidade; documentação; processo; treinamento.
Status: `open`; `in_progress`; `blocked`; `completed`; `cancelled`. Ação só é `completed` quando: critério de conclusão atendido; evidência registrada; risco residual avaliado. Ações críticas não são encerradas apenas porque o incidente foi resolvido.

### Monitoramento e alertas (§14)

Alertas mínimos: aumento relevante de erros; jobs travados; fila crescente; falha de login; falha de banco; falha de storage; falha do provedor de IA; falha de schema; latência elevada; custo anormal; **arquivos elegíveis próximos de 18 horas**; **arquivos elegíveis ainda presentes após 24 horas**; créditos negativos; consumo duplicado de crédito; falha de RLS; tentativa de acesso entre usuários; erro de backup; exclusões atrasadas; análise permanentemente em processamento; falha repetida de validação de resultado.
Um alerta possui: identificador; descrição; origem; responsável; condição; limite; janela de avaliação; canal; runbook; severidade sugerida; política de silenciamento; política de escalonamento.
Observabilidade técnica é a fonte principal dos alertas. Analytics de produto **não** deve ser o único mecanismo de detecção de: vazamentos; falhas de banco; falhas de fila; falhas de exclusão; falhas de RLS; consumo incorreto de créditos.

### Runbooks prioritários (§15 — lista completa)

provedor de IA indisponível; banco indisponível; storage indisponível; fila/worker parado; análise travada; falha de schema; resultado parcial publicado; score calculado incorretamente; bloqueador/limite não aplicado; análise associada ao usuário incorreto; arquivo original não excluído; arquivo/bucket público; acesso indevido; falha de RLS; segredo exposto; crédito consumido em duplicidade; deploy com erro; migration com erro; rollback de aplicação; rollback de prompt/schema/rubrica/motor.
Cada runbook contém: trigger; verificações iniciais; responsáveis; contenção; diagnóstico; recuperação; validação; comunicação; rollback; evidências obrigatórias.

### Critérios para declarar resolvido (§16)

impacto interrompido; serviço restaurado ou isolado com segurança; monitoramento estável; usuários afetados identificados; dados afetados verificados; análises afetadas identificadas; resultados incorretos marcados adequadamente; nenhuma sobrescrita silenciosa; créditos restaurados/ajustados pelo ledger; exclusões pendentes tratadas; vulnerabilidades imediatas contidas; comunicação final realizada quando aplicável; evidências preservadas; ações corretivas obrigatórias registradas. A causa raiz não precisa estar totalmente corrigida para resolver, desde que impacto terminado + contenção segura + risco residual documentado + correção definitiva com responsável e prazo. `closed` só após conclusão da documentação obrigatória.

### Exercícios pré-alpha (§17)

Simular: indisponibilidade do provedor de IA; fila/worker parado; arquivo original não excluído após o prazo; documento tornado público; análise associada ao usuário incorreto; falha de RLS; chave de produção exposta; invenção factual sistêmica; score calculado incorretamente; bloqueador/limite não aplicado; crédito consumido em duplicidade; deploy com necessidade de rollback; prompt/schema/motor com necessidade de rollback. Cada exercício valida: detecção; classificação; atribuição de papéis; contenção; preservação de evidências; comunicação; recuperação; correção de dados; restauração de créditos; capacidade de rollback; registro do incidente; geração de ações corretivas.

---

## Conflitos ou ambiguidades internas

### 1. Cidade/estado: proibição categórica vs. exceção condicional na influência sobre IAO/recomendações

**Modelo de Dados, §4.2 (`personal_data`), lista de regras:** "não influenciar IPP; não influenciar IAO; não influenciar confiança; não influenciar recomendações [...] cidade e estado somente poderão ser utilizados para requisito geográfico quando houver finalidade válida e autorização adequada."

**Segurança, §4:** "Cidade e estado somente poderão ser utilizados em análise quando: houver requisito geográfico explícito; o uso for necessário para a análise; a finalidade estiver informada; somente a informação mínima for utilizada." E logo depois: "Dados pessoais não influenciam: IPP; IAO; confiança profissional; recomendações; classificação de senioridade; prioridade de candidatura."

**Segurança, §17 (bloqueadores de release):** "uso de dados pessoais no IPP, IAO, confiança ou recomendações" é motivo de bloqueio de release.

Isso é uma contradição interna presente em **ambos** os documentos: a regra geral proíbe categoricamente que dados pessoais (incluindo cidade/estado, explicitamente listados como "confidenciais pessoais") influenciem o IAO ou as recomendações, mas na mesma seção se abre uma exceção condicional para requisitos geográficos — e o Modelo de Dados até modela `category = 'location'` como um valor válido do enum `requirements.category` (§4.12), o que pressupõe que alguma informação de localização entra no cálculo do `fit_analysis_results`/`requirement_assessments`. Nenhuma tabela do Modelo de Dados (nem `target_context_versions`, nem `professional_profiles`) armazena localização fora de `personal_data`. Como um requisito de categoria `location` seria avaliado sem usar `personal_data.city`/`state` — e sem violar a proibição de dados pessoais influenciarem o IAO — não está resolvido nos documentos. Recomenda-se registrar decisão explícita no Decision Log antes de implementar o cálculo de requisitos de categoria `location`.

### 2. `requirements.is_critical` (boolean) coexistindo com a proibição explícita de booleano paralelo à criticidade

**Modelo de Dados, §4.12:** a tabela `requirements` lista o campo `is_critical | boolean` entre seus campos. Na mesma seção, a regra diz: "O estado impeditivo deverá ser representado por: `criticality = blocking`. **Não deverá existir um booleano independente que possa contradizer a criticidade.**"

O próprio esquema definido no documento contém esse booleano independente (`is_critical`) ao lado do enum `criticality` (que já tem os valores `mandatory`, `desired`, `differential`, `complementary`, `blocking`). Isso é uma inconsistência interna do Modelo de Dados: o campo existe no schema, mas a regra de negócio do mesmo documento proíbe exatamente esse tipo de campo por poder "contradizer a criticidade". Antes de gerar a migration, é necessário esclarecer se `is_critical` é redundante/derivado de `criticality in ('mandatory','blocking')` (e portanto deve ser uma coluna gerada, não independente) ou se deve ser removido do schema.

### 3. Regra de conteúdo sem constraint técnica equivalente para PII em campos de texto livre

**Modelo de Dados, §4.7 (`evidences`):** regra declarada — "evidência não deve conter dados pessoais desnecessários" — mas os campos `summary`, `context`, `source_snippet` são `text` livre, sem qualquer mecanismo de redação/sanitização descrito no schema. O mesmo padrão se repete em `recommendations.problem/reasoning/suggested_action/expected_outcome` e em `analysis_feedback.comment`.

**Segurança, §17 (bloqueadores de release):** lista "dado pessoal enviado indevidamente à IA" e "logs contendo conteúdo sensível" como bloqueadores, mas não define um mecanismo técnico (constraint, trigger, validação de schema) para impedir que um snippet de evidência ou uma recomendação gerada capture inadvertidamente um nome, e-mail ou cidade mencionados no currículo/LinkedIn/vaga originais. A garantia depende inteiramente de processo (revisão do SDLC, QA da IA, guardrails de prompt) e não de constraint de banco — vale registrar como risco de implementação a ser mitigado com validação server-side antes da persistência.

### 4. Retenção de eventos de analytics não definida em nenhum dos cinco documentos

**Segurança, §5** define retenção explícita para: arquivos originais (24h/6h), dados estruturados (enquanto conta ativa), conteúdo textual integral (removido após estruturação), logs técnicos (30 dias) e exclusão de conta (15/30 dias). **Nenhuma dessas categorias cobre explicitamente os eventos de analytics de produto** (tabela separada de "logs técnicos" pela própria Arquitetura §4.9 e pelo Analytics §2 "Separação"). O Analytics doc também não define prazo de retenção para os eventos que ele cataloga. A única menção relacionada é em Segurança §7 (exclusão de conta), passo 17: "identificadores pessoais em analytics são removidos ou anonimizados conforme política" — que pressupõe uma "política" de anonimização de analytics não detalhada em nenhum dos documentos lidos. Isso é uma lacuna a esclarecer antes de configurar a retenção do provedor de analytics.

### 5. Arquitetura trata provedores como propostas; Modelo de Dados e Segurança já os referenciam como baseline ativo

**Arquitetura, §2 e §13:** classifica Supabase Auth/PostgreSQL/Supabase Storage como "baseline técnico proposto" e lista explicitamente "provedor definitivo de autenticação", "provedor definitivo de banco de dados" e "provedor definitivo de storage" como **decisões arquiteturais pendentes** a serem registradas no Decision Log.

**Modelo de Dados, §1:** "O modelo assume PostgreSQL via Supabase como baseline técnico proposto" (linguagem consistente, também trata como proposta).

**Segurança, §10 e §12** e o restante dos documentos usam formulações como "Row Level Security ou mecanismo equivalente" e "buckets privados" de forma agnóstica de provedor — portanto tecnicamente consistentes com o status de "proposta" da Arquitetura. Não há contradição direta de fato, mas vale nota: a especificidade técnica do Modelo de Dados (RLS via `auth.uid()`, convenção de nomenclatura do Supabase) já pressupõe Supabase como se fosse decisão fechada, enquanto a Arquitetura formalmente ainda o trata como proposta pendente de registro em Decision Log. Isso não é uma contradição de conteúdo, mas uma inconsistência de "status" que deve ser resolvida (registrar a decisão formalmente) antes de gerar migrations definitivas.

### 6. Nomenclatura de eventos de crédito no Analytics vs. enum do Modelo de Dados

**Analytics, §11:** eventos `credit_consumed` e `credit_restored` (convenção `objeto_ação`, verbo no particípio).
**Modelo de Dados, §4.15 (`credit_ledger.transaction_type`):** enum com valores `grant`; `consumption`; `restoration`; `expiration`; `adjustment` (substantivos, não particípios).

Não é uma contradição funcional (analytics e banco não precisam usar a mesma string), mas os nomes não são espelhados 1:1 (`credit_consumed` ↔ `consumption`; `credit_restored` ↔ `restoration`; não há evento de analytics para `expiration` nem para `adjustment`). Vale confirmar explicitamente no mapeamento de implementação que every `credit_ledger.transaction_type = 'expiration'` ou `'adjustment'` não deveria também disparar um evento de analytics correspondente (hoje nenhum dos dois tem evento canônico definido).
