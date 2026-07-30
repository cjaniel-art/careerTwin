# Modelo de Dados

Criado em: 27 de julho de 2026 23:23

## 1. Objetivo

O modelo de dados deve garantir:

- isolamento entre usuários;
- rastreabilidade;
- versionamento;
- explicabilidade;
- integridade referencial;
- imutabilidade de versões confirmadas;
- separação entre dados pessoais e profissionais;
- retenção e exclusão;
- suporte ao Thin Twin;
- suporte ao contexto-alvo;
- suporte ao Core 1;
- suporte ao Core 2;
- suporte a créditos simulados;
- suporte aos analytics;
- recuperação de falhas;
- evolução sem perda de histórico.

O modelo assume PostgreSQL via Supabase como baseline técnico proposto.

Caso outro provedor seja adotado, deverá preservar:

- as mesmas entidades;
- as mesmas relações;
- as mesmas restrições;
- o mesmo isolamento;
- o mesmo comportamento de versionamento;
- a mesma rastreabilidade.

O Claude Code deverá utilizar este documento como contrato conceitual de persistência.

Não deverá:

- criar entidades de negócio silenciosamente;
- alterar relações para simplificar o código;
- armazenar dados pessoais em estruturas profissionais;
- substituir relações essenciais por JSONB;
- remover versionamento;
- alterar enums sem atualizar os contratos relacionados;
- realizar mudanças manuais diretamente em produção.

---

## 2. Princípios de modelagem

- autenticação separada dos dados da conta;
- dados pessoais separados do Thin Twin;
- Thin Twin separado do contexto-alvo;
- perfil lógico separado de suas versões;
- contexto-alvo lógico separado de suas versões;
- oportunidade lógica separada de suas versões;
- referência de cargo separada de vagas enviadas pelo usuário;
- versões confirmadas imutáveis;
- análises concluídas imutáveis;
- score separado da confiança;
- classificações da IA separadas dos cálculos do backend;
- resultados brutos separados dos resultados finais;
- limites de segurança registrados;
- recomendações associadas à análise;
- recomendações associadas a evidências e requisitos;
- ações associadas às recomendações;
- arquivos separados dos dados extraídos;
- documentos originais tratados como temporários;
- créditos controlados por reserva e ledger;
- consentimentos versionados;
- eventos técnicos separados dos eventos de produto;
- identificadores e versões preservados em toda análise;
- regras determinísticas fora de payloads livres da IA.

A ausência de informação não deverá ser armazenada como ausência confirmada de competência.

Inferências não deverão ser armazenadas como fatos profissionais confirmados.

---

## 3. Convenções

### Identificadores

Utilizar UUID.

### Datas e horários

Utilizar UTC no banco por meio de `timestamptz`.

Datas profissionais sem horário poderão utilizar `date`.

### Nomes

Utilizar `snake_case` em:

- tabelas;
- campos;
- índices;
- constraints;
- enums;
- funções;
- migrations.

Os contratos de aplicação e schemas de IA poderão utilizar `camelCase`, com mapeamento explícito na camada de aplicação.

### Timestamps padrão

- `created_at`;
- `updated_at`;
- `deleted_at`, somente quando necessário;
- `confirmed_at`, para confirmações;
- `completed_at`, para conclusões;
- `expires_at`, quando houver expiração.

### Valores monetários

Valores financeiros simulados deverão ser armazenados em centavos.

Exemplo:

```
R$ 29,90 = 2990
```

Utilizar:

- `price_cents`;
- `currency`, com valor inicial `BRL`.

### Scores

Scores de zero a cem deverão utilizar `numeric(5,2)` durante o cálculo.

O valor inteiro apresentado ao usuário poderá ser armazenado separadamente quando necessário.

### Confianças

Confianças de zero a um deverão utilizar `numeric(4,3)` e possuir constraint:

```
0 <= valor <= 1
```

### Escalas de um a cinco

Impacto, esforço, urgência e confiança de recomendações deverão utilizar `smallint` com constraint:

```
valor between 1 and 5
```

### Dados flexíveis

JSONB poderá ser utilizado para:

- snapshots imutáveis;
- payloads de IA já validados;
- metadados;
- configurações versionadas;
- listas de motivos;
- informações ausentes;
- warnings;
- detalhes de alteração.

JSONB não deverá substituir:

- usuários;
- versões;
- experiências;
- competências;
- ferramentas;
- evidências;
- oportunidades;
- requisitos;
- análises;
- recomendações;
- ações;
- créditos;
- relações de propriedade.

---

## 4. Entidades principais

## 4.1 Usuário e conta

### `auth.users`

Gerenciada pelo provedor de autenticação.

O identificador de autenticação deverá ser utilizado como identificador principal do usuário nas tabelas de domínio.

### `user_accounts`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `user_id` | UUID | PK e referência a `auth.users.id` |
| `status` | enum | Estado da conta |
| `locale` | text | Idioma da interface |
| `timezone` | text | Fuso horário |
| `onboarding_status` | enum | Estado funcional do onboarding |
| `created_at` | timestamptz | Criação |
| `updated_at` | timestamptz | Atualização |
| `deletion_requested_at` | timestamptz nullable | Solicitação de exclusão |

Status permitidos:

- `active`;
- `blocked`;
- `deletion_pending`.

Estados iniciais do onboarding:

- `not_started`;
- `in_progress`;
- `profile_review`;
- `target_context_pending`;
- `completed`.

O estado do onboarding não substitui os estados dos documentos, jobs, perfil ou contexto-alvo.

---

## 4.2 Dados pessoais

### `personal_data`

| Campo | Tipo | Regra |
| --- | --- | --- |
| `user_id` | UUID | PK e FK para `user_accounts.user_id` |
| `full_name` | text | Obrigatório |
| `city` | text nullable | Opcional |
| `state` | text nullable | Opcional |
| `created_at` | timestamptz | Obrigatório |
| `updated_at` | timestamptz | Obrigatório |

Não pertencem ao MVP:

- data de nascimento;
- CEP;
- rua;
- número;
- complemento;
- bairro;
- endereço residencial completo.

### Regras

- relação um para um com o usuário;
- acesso restrito;
- não fazer parte do Thin Twin;
- não fazer parte do contexto-alvo;
- não influenciar IPP;
- não influenciar IAO;
- não influenciar confiança;
- não influenciar recomendações;
- não enviar à IA sem necessidade explícita;
- não enviar a analytics;
- cidade e estado somente poderão ser utilizados para requisito geográfico quando houver finalidade válida e autorização adequada.

---

## 4.3 Perfil profissional

### `professional_profiles`

Representa o Thin Twin lógico do usuário.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador do perfil |
| `user_id` | UUID | Proprietário |
| `current_version_id` | UUID nullable | Versão confirmada atual |
| `status` | enum | Estado do perfil |
| `created_at` | timestamptz | Criação |
| `updated_at` | timestamptz | Atualização |

Restrições:

- um perfil lógico por usuário;
- `user_id` único;
- `current_version_id` deve pertencer ao mesmo perfil.

Status:

- `draft`;
- `under_review`;
- `confirmed`;
- `archived`.

### `profile_versions`

Representa cada versão imutável do Thin Twin.

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

Status:

- `draft`;
- `confirmed`;
- `superseded`;
- `archived`.

Origens possíveis:

- `initial_onboarding`;
- `resume_update`;
- `linkedin_update`;
- `manual_edit`;
- `conflict_resolution`;
- `professional_update`;
- `system_migration`.

### Regras

- `version_number` único por perfil;
- versão confirmada não pode ser alterada;
- alteração profissional relevante cria nova versão;
- alteração apenas visual ou ortográfica não cria versão;
- alteração do contexto-alvo não cria versão do Thin Twin;
- análises apontam para `profile_version_id`;
- análises antigas não são alteradas após uma nova versão;
- atualização de `current_version_id` deve ocorrer na mesma transação que confirma a nova versão.

---

## 4.4 Contexto-alvo

O objetivo profissional não pertence ao Thin Twin.

### `target_contexts`

Representa o contexto-alvo lógico do usuário.

| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `user_id` | UUID |
| `current_version_id` | UUID nullable |
| `status` | enum |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

Restrições:

- um contexto-alvo lógico ativo por usuário;
- `current_version_id` deve pertencer ao mesmo contexto.

### `target_context_versions`

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

Senioridades permitidas:

- `intern`;
- `junior`;
- `mid`;
- `senior`.

Tipos de transição:

- `same_role`;
- `new_specialty`;
- `new_role`;
- `new_area`;
- `return_to_market`;
- `not_informed`.

Contextos de busca:

- `unemployed`;
- `employed_seeking_change`;
- `career_transition`;
- `returning_to_work`;
- `not_informed`.

### Regras

- cada versão confirmada é imutável;
- mudança de área, cargo ou senioridade cria nova versão;
- a versão anterior permanece disponível;
- análises registram `target_context_version_id`;
- atualização do contexto-alvo não altera o Thin Twin;
- atualização do contexto-alvo não altera análises anteriores.

---

## 4.5 Experiências

### `experiences`

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

Tipos de vínculo:

- `internship`;
- `employee`;
- `contractor`;
- `freelance`;
- `founder`;
- `volunteer`;
- `academic`;
- `other`;
- `not_informed`.

### `experience_responsibilities`

| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `experience_id` | UUID |
| `description` | text |
| `confirmation_status` | enum |
| `inference_status` | enum |
| `created_at` | timestamptz |

### `projects`

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

### Estados de confirmação

- `extracted`;
- `confirmed`;
- `corrected`;
- `added`;
- `rejected`;
- `in_conflict`;
- `unconfirmed`.

### Estados de inferência

- `fact`;
- `inference`;
- `hypothesis`;
- `suggestion`.

Somente informações com estado de confirmação:

- `confirmed`;
- `corrected`;
- `added`;

podem ser tratadas como fatos profissionais.

---

## 4.6 Competências e ferramentas

Competências e ferramentas deverão ser armazenadas separadamente.

### `skills`

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

Tipos de competência:

- `technical`;
- `method`;
- `domain`;
- `management`;
- `leadership`;
- `communication`;
- `collaboration`;
- `business`;
- `language`;
- `other`.

### `profile_skills`

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

### `experience_skills`

Relaciona competência e experiência.

| Campo | Tipo |
| --- | --- |
| `experience_id` | UUID |
| `profile_skill_id` | UUID |
| `relationship_type` | enum |
| `created_at` | timestamptz |

### `tools`

Catálogo normalizado de ferramentas e tecnologias.

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

### `profile_tools`

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

### `experience_tools`

Relaciona ferramenta e experiência.

### Regras

- uma competência não deve ser armazenada como ferramenta;
- uma ferramenta não deve ser armazenada como domínio;
- `skill_type`, `skill_domain` e `tool_category` possuem funções diferentes;
- o termo original deve ser preservado;
- o termo normalizado deve registrar a versão da taxonomia;
- termo desconhecido não deve ser descartado silenciosamente;
- competência ou ferramenta sem evidência não deve ser tratada como domínio confirmado;
- evidências devem ser associadas pelas tabelas de relacionamento.

---

## 4.7 Evidências

### `evidences`

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

Tipos:

- `responsibility`;
- `delivery`;
- `project`;
- `qualitative_result`;
- `quantitative_result`;
- `promotion`;
- `recognition`;
- `scope_expansion`;
- `education`;
- `certification`;
- `portfolio`;
- `professional_example`.

### Relacionamentos

- `experience_evidences`;
- `project_evidences`;
- `profile_skill_evidences`;
- `profile_tool_evidences`;
- `recommendation_evidences`;
- `requirement_assessment_evidences`.

### Regras

- evidência deve preservar contexto mínimo;
- evidência não deve conter dados pessoais desnecessários;
- o mesmo fato repetido em currículo e LinkedIn não conta como duas evidências independentes;
- snippets devem ser mínimos e suficientes;
- ausência de evidência deve ser representada no diagnóstico, e não por evidência fictícia;
- evidências rejeitadas não podem sustentar análises futuras;
- uma análise deve preservar as referências de evidência utilizadas no momento da execução.

---

## 4.8 Formação e certificações

### `education_records`

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

### `certifications`

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

### `languages`

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

Formação, certificação ou idioma inferido não deverá ser confirmado automaticamente.

---

## 4.9 Documentos

### `documents`

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

Tipos:

- `resume`;
- `linkedin`;
- `job_description`;
- `pasted_text`;
- `authorized_supporting_document`.

Origens:

- `file_upload`;
- `pasted_text`;
- `manual_entry`.

Estados funcionais:

- `awaiting_upload`;
- `uploading`;
- `validating`;
- `queued`;
- `processing`;
- `ready`;
- `insufficient_content`;
- `failed_retryable`;
- `failed_final`;
- `deleted`.

### `document_extractions`

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

### Regras

- arquivos são temporários;
- buckets devem ser privados;
- `storage_path` não pode ser uma URL pública;
- textos integrais não devem ser persistidos indefinidamente;
- conteúdo extraído integral deve seguir política de retenção;
- snippets mínimos podem permanecer como evidências;
- arquivos deletados não devem continuar acessíveis;
- o hash poderá apoiar detecção de duplicidade e idempotência;
- o documento pertence exclusivamente ao usuário;
- documento não confirmado não deve criar fatos automaticamente.

---

## 4.10 Jobs

### `processing_jobs`

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

Tipos:

- `resume_extraction`;
- `linkedin_extraction`;
- `profile_consolidation`;
- `opportunity_structuring`;
- `profile_analysis`;
- `target_role_analysis`;
- `job_analysis`;
- `reanalysis`;
- `document_deletion`;
- `account_deletion`.

Estados técnicos:

- `queued`;
- `processing`;
- `completed`;
- `partially_completed`;
- `failed`;
- `cancelled`;
- `expired`.

Categorias de erro:

- `validation`;
- `authorization`;
- `file_processing`;
- `provider_timeout`;
- `provider_unavailable`;
- `invalid_schema`;
- `invalid_model_output`;
- `persistence`;
- `credit`;
- `retention`;
- `unknown`.

### Regras

- `idempotency_key` deve ser única dentro do escopo da operação;
- job técnico não substitui o estado funcional do recurso;
- `partially_completed` não autoriza relatório definitivo;
- falha deve registrar erro seguro;
- stack traces e segredos não devem ser armazenados em mensagens visíveis;
- retentativa não deve criar nova análise ou novo consumo;
- o mesmo job não pode ser processado simultaneamente por dois workers;
- operações expiradas devem ser tratadas explicitamente.

---

## 4.11 Análises

### `analyses`

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

Tipos:

- `profile_analysis`;
- `target_role_analysis`;
- `job_analysis`.

Estados funcionais:

- `draft`;
- `queued`;
- `processing`;
- `preliminary`;
- `completed`;
- `insufficient_data`;
- `failed_retryable`;
- `failed_final`;
- `cancelled`.

Faixas de confiança:

- `low`;
- `medium`;
- `high`.

### Regras por tipo

#### `profile_analysis`

- exige `profile_version_id`;
- exige `target_context_version_id`;
- não utiliza `opportunity_version_id`;
- não utiliza `role_reference_version_id`.

#### `target_role_analysis`

- exige `profile_version_id`;
- exige `target_context_version_id`;
- exige `role_reference_version_id`;
- não utiliza `opportunity_version_id`.

#### `job_analysis`

- exige `profile_version_id`;
- exige `target_context_version_id`;
- exige `opportunity_version_id`;
- não utiliza `role_reference_version_id`.

### `profile_analysis_results`

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

Faixas:

- `low_readiness`;
- `developing_readiness`;
- `good_readiness`;
- `high_readiness`.

### `profile_dimension_results`

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

Dimensões:

- `objective_clarity`;
- `experience_quality`;
- `evidence_and_results`;
- `skills_and_tools`;
- `cross_source_consistency`;
- `positioning_quality`;
- `profile_completeness`.

`rubric_level` deve estar entre zero e quatro.

### `fit_analysis_results`

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

Faixas:

- `low_observable_fit`;
- `partial_fit`;
- `good_observable_fit`;
- `high_observable_fit`.

Recomendações para vaga:

- `apply_now`;
- `apply_with_adjustments`;
- `develop_gaps_before_applying`;
- `do_not_prioritize`;
- `insufficient_data`.

Recomendações para cargo-alvo:

- `ready_to_prioritize`;
- `prioritize_with_adjustments`;
- `develop_before_prioritizing`;
- `reassess_target_context`;
- `insufficient_data`.

### `analysis_limits`

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

Tipos:

- `confirmed_blocker`;
- `multiple_critical_mandatory_gaps`;
- `strong_seniority_mismatch`;
- `insufficient_data_restriction`;
- `other_versioned_rule`.

### Regras

- confiança é armazenada separadamente do score;
- baixa confiança não altera silenciosamente IPP ou IAO;
- score bruto e final devem ser preservados;
- análises concluídas são imutáveis;
- uma reanálise cria novo registro;
- `previous_analysis_id` relaciona reanálises;
- versões de entrada e configuração são obrigatórias;
- saída bruta não validada da IA não deve ser tratada como resultado;
- alterações futuras no motor não recalculam análises antigas silenciosamente.

---

## 4.12 Oportunidades, referências e requisitos

### `opportunities`

Representa uma oportunidade lógica cadastrada pelo usuário.

| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `user_id` | UUID |
| `current_version_id` | UUID nullable |
| `status` | enum |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

Status:

- `draft`;
- `confirmed`;
- `archived`.

### `opportunity_versions`

Representa uma versão imutável da vaga.

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

Origens:

- `pasted_text`;
- `pdf`;
- `manual_entry`.

### `role_references`

Representa uma referência lógica aprovada de cargo.

| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `normalized_role` | text |
| `area` | text |
| `status` | enum |
| `current_version_id` | UUID nullable |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

### `role_reference_versions`

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

Uma análise por cargo-alvo somente deverá utilizar uma referência com estado aprovado.

### `requirements`

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

Categorias:

- `skill`;
- `tool`;
- `experience`;
- `responsibility`;
- `education`;
- `certification`;
- `seniority`;
- `scope`;
- `location`;
- `language`;
- `other`.

Criticidades:

- `mandatory`;
- `desired`;
- `differential`;
- `complementary`;
- `blocking`.

Aplicabilidades:

- `applicable`;
- `not_applicable`;
- `unknown`.

O estado impeditivo deverá ser representado por:

```
criticality = blocking
```

Não deverá existir um booleano independente que possa contradizer a criticidade.

Cada requisito deverá pertencer a exatamente uma origem:

- uma versão de oportunidade; ou
- uma versão de referência de cargo.

### `requirement_assessments`

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

Estados:

- `confirmed_match`;
- `partial_match`;
- `communication_gap`;
- `evidence_gap`;
- `unknown`;
- `not_observed`;
- `confirmed_mismatch`.

Tipos de lacuna:

- `competency`;
- `experience`;
- `education_or_certification`;
- `communication`;
- `evidence`;
- `positioning`;
- `unknown`.

### Regras

- fatores e pesos são preenchidos pelo backend;
- não armazenar `reference_value`;
- não utilizar valores antigos de 100, 60, 30 e zero;
- o estado produzido pela IA deve ser validado;
- evidências do perfil devem ser relacionadas pela tabela específica;
- `not_observed` não significa ausência confirmada;
- requisito `not_applicable` não entra no cálculo;
- requisitos ambíguos reduzem confiança, mas não mudam criticidade silenciosamente;
- classificações e cálculos devem ser preservados para auditoria.

---

## 4.13 Recomendações e ações

### `recommendations`

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

Categorias:

- `competency`;
- `communication`;
- `evidence`;
- `positioning`.

Status:

- `generated`;
- `highlighted`;
- `selected`;
- `dismissed`;
- `converted_to_action`.

### Regras

- impacto, esforço, urgência e confiança utilizam escala de um a cinco;
- `priority_score` é calculado pelo backend;
- `priority_order` não deve depender da ordem de geração da IA;
- recomendações devem possuir critério de conclusão;
- recomendações duplicadas devem ser consolidadas;
- até oito recomendações por análise;
- até três recomendações destacadas;
- recomendações sem evidência devem registrar a ausência;
- recomendação não pode inventar fatos.

### `recommendation_evidences`

| Campo | Tipo |
| --- | --- |
| `recommendation_id` | UUID |
| `evidence_id` | UUID |
| `relationship_type` | enum |
| `created_at` | timestamptz |

### `recommendation_requirements`

Relaciona recomendações do Core 2 aos requisitos que as originaram.

| Campo | Tipo |
| --- | --- |
| `recommendation_id` | UUID |
| `requirement_id` | UUID |
| `created_at` | timestamptz |

### `actions`

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

Status:

- `pending`;
- `selected`;
- `in_progress`;
- `completed`.

### Regras

- uma análise pode gerar até cinco ações no plano;
- ação pertence ao mesmo usuário da recomendação;
- conclusão da ação não altera uma análise anterior;
- eventual reanálise cria novo registro;
- ações não devem ser apagadas quando a recomendação permanecer no histórico.

---

## 4.14 Feedbacks

### `analysis_feedback`

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

Especificidade:

- `yes`;
- `partially`;
- `no`.

Intenção relacionada à oportunidade:

- `apply`;
- `apply_after_adjustments`;
- `not_apply`;
- `undecided`;
- `not_applicable`.

### Restrições

- `usefulness_score` entre um e cinco;
- um feedback principal por usuário e análise;
- comentário não deve ser enviado automaticamente para analytics;
- feedback não altera score ou relatório;
- feedback pode orientar pesquisa e evolução futura.

---

## 4.15 Créditos e monetização simulada

### `credit_accounts`

| Campo | Tipo |
| --- | --- |
| `id` | UUID |
| `user_id` | UUID |
| `available_credits` | integer |
| `reserved_credits` | integer |
| `created_at` | timestamptz |
| `updated_at` | timestamptz |

Restrições:

- uma conta de crédito por usuário;
- saldo disponível nunca negativo;
- saldo reservado nunca negativo;
- créditos reservados não podem ser consumidos novamente.

### `credit_reservations`

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

Status:

- `reserved`;
- `confirmed`;
- `released`;
- `expired`;
- `exempt`.

Isenções inicialmente permitidas:

- `technical_retry`;
- `identical_result_reuse`;
- `pilot_grant`;
- `administrative_adjustment`.

A eventual gratuidade para reanálise da mesma vaga somente deverá ser adicionada após decisão formal no Decision Log.

### `credit_ledger`

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

Tipos:

- `grant`;
- `consumption`;
- `restoration`;
- `expiration`;
- `adjustment`.

### Regras

- reserva não representa consumo definitivo;
- consumo somente ocorre após análise concluída com sucesso;
- falha técnica libera a reserva;
- reprocessamento técnico não cria novo consumo;
- reutilização de resultado idêntico não cria novo consumo quando a política aprovada assim definir;
- saldo não deve ser alterado sem registro correspondente no ledger;
- cada transação deverá possuir chave de idempotência;
- alterações administrativas deverão possuir motivo;
- o ledger é imutável;
- correções deverão usar lançamento compensatório, e não alteração retroativa.

### `purchase_intents`

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

Status:

- `viewed`;
- `clicked`;
- `confirmed_intent`;
- `dismissed`.

Nenhum dado de cartão será armazenado no MVP.

---

## 4.16 Consentimento e exclusão

### `consent_records`

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

Status:

- `granted`;
- `revoked`;
- `not_applicable`.

Consentimentos e registros necessários ao serviço deverão permanecer diferenciados.

### `deletion_requests`

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

Status:

- `requested`;
- `confirmed`;
- `processing`;
- `active_systems_completed`;
- `backup_removal_pending`;
- `completed`;
- `failed`;
- `cancelled`.

### Regras

A exclusão deverá abranger, conforme a política aplicável:

- dados pessoais;
- Thin Twin;
- versões;
- contexto-alvo;
- documentos;
- oportunidades;
- análises;
- recomendações;
- ações;
- feedbacks;
- identificadores pessoais;
- arquivos temporários.

Registros que precisarem ser mantidos por obrigação legítima deverão ser:

- minimizados;
- desvinculados quando possível;
- protegidos;
- documentados.

---

## 4.17 Auditoria

### `audit_logs`

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

Ações relevantes:

- alteração de permissões;
- acesso administrativo;
- exclusão;
- exportação;
- alteração de consentimento;
- concessão ou consumo de crédito;
- liberação de reserva;
- criação, falha ou conclusão de análise;
- confirmação de versão;
- alteração de configuração do motor;
- incidente;
- execução de operação administrativa.

### Regras

O log não deverá armazenar:

- documentos integrais;
- currículos;
- conteúdo integral do LinkedIn;
- descrições integrais de vaga;
- evidências textuais extensas;
- senhas;
- tokens;
- segredos;
- respostas integrais da IA;
- dados pessoais desnecessários.

Metadados devem ser mínimos, estruturados e suficientes para investigação.

---

## 5. Relações principais

```
auth_user
 ├── user_account
 ├── personal_data
 ├── professional_profile
 │    └── profile_versions
 │         ├── experiences
 │         │    ├── responsibilities
 │         │    ├── projects
 │         │    ├── skills
 │         │    ├── tools
 │         │    └── evidences
 │         ├── education
 │         ├── certifications
 │         └── languages
 ├── target_context
 │    └── target_context_versions
 ├── documents
 │    └── document_extractions
 ├── opportunities
 │    └── opportunity_versions
 │         └── requirements
 ├── analyses
 │    ├── profile_analysis_result
 │    │    └── profile_dimension_results
 │    ├── fit_analysis_result
 │    │    ├── requirement_assessments
 │    │    └── analysis_limits
 │    ├── recommendations
 │    │    ├── recommendation_evidences
 │    │    ├── recommendation_requirements
 │    │    └── actions
 │    └── analysis_feedback
 ├── processing_jobs
 ├── credit_account
 │    ├── credit_reservations
 │    └── credit_ledger
 ├── purchase_intents
 ├── consent_records
 └── deletion_requests

role_reference
 └── role_reference_versions
      └── requirements
```

### Relações obrigatórias da análise

Toda análise deve estar associada a:

```
user_id
profile_version_id
target_context_version_id
engine_version
configuration_version
rubric_version
prompt_version
schema_version
model_version
```

Além disso:

```
job_analysis
→ opportunity_version_id

target_role_analysis
→ role_reference_version_id
```

---

## 6. Integridade

Restrições mínimas:

- um usuário possui no máximo um `personal_data`;
- um usuário possui no máximo um `professional_profile`;
- um usuário possui no máximo um `target_context` ativo;
- uma versão pertence ao seu perfil lógico;
- uma versão de contexto pertence ao seu contexto lógico;
- uma versão de oportunidade pertence à sua oportunidade;
- números de versão são únicos dentro da entidade lógica;
- versões confirmadas são imutáveis;
- análises concluídas são imutáveis;
- perfil, contexto-alvo e oportunidade de uma análise pertencem ao mesmo usuário;
- análise por vaga exige `opportunity_version_id`;
- análise por cargo exige `role_reference_version_id`;
- análise de perfil não aceita oportunidade ou referência de cargo;
- recomendação pertence à análise;
- ação pertence ao mesmo usuário da recomendação;
- feedback pertence ao mesmo usuário da análise;
- documento pertence ao usuário;
- oportunidade pertence ao usuário;
- crédito pertence ao usuário autenticado;
- reserva pertence ao mesmo usuário da análise;
- requisito pertence a exatamente uma origem;
- assessment pertence a requisito usado pela análise;
- evidência associada pertence à versão do perfil utilizada;
- `rubric_level` permanece entre zero e quatro;
- scores permanecem entre zero e cem;
- confianças permanecem entre zero e um;
- escalas de recomendação permanecem entre um e cinco;
- saldo de crédito não pode ser negativo;
- `idempotency_key` é única dentro do escopo definido;
- análise concluída não pode retornar ao estado de processamento;
- uma nova execução após mudança de entrada deve criar nova análise;
- resultados antigos não devem ser sobrescritos.

### Constraints obrigatórias

O banco deverá possuir constraints para impedir:

- requisito simultaneamente ligado a vaga e referência de cargo;
- requisito sem nenhuma origem;
- análise com combinações inválidas de tipo e referência;
- consumo de crédito sem reserva confirmável, salvo isenção aprovada;
- duas versões com o mesmo número;
- duas contas de crédito para o mesmo usuário;
- dois perfis lógicos para o mesmo usuário;
- dois contextos-alvo ativos para o mesmo usuário;
- valores de score ou confiança fora dos intervalos permitidos.

O Claude Code não deverá depender apenas de validações da interface para garantir essas regras.

---

## 7. Row Level Security

Todas as tabelas com dados de usuário deverão possuir política de acesso baseada no usuário autenticado.

### Regra direta

Quando a tabela possuir `user_id`:

```
resource.user_id = auth.uid()
```

### Regra por cadeia de propriedade

Quando a tabela não possuir `user_id` diretamente, a política deverá validar a relação até o proprietário.

Exemplo:

```
recommendation
→ analysis
→ user_id
→ auth.uid()
```

Outro exemplo:

```
experience
→ profile_version
→ professional_profile
→ user_id
→ auth.uid()
```

### Regras

- usuários anônimos não acessam dados autenticados;
- um usuário não acessa dados de outro usuário;
- escrita deve validar propriedade, não apenas leitura;
- identificadores enviados pelo cliente não substituem a sessão;
- service role somente em rotinas server-side autorizadas;
- service role nunca deve ser exposta no frontend;
- rotinas administrativas devem registrar auditoria;
- políticas devem cobrir `select`, `insert`, `update` e `delete`;
- versões confirmadas devem bloquear `update`;
- análises concluídas devem bloquear `update`;
- operações de worker devem validar a propriedade antes de utilizar service role.

### Testes mínimos de RLS

Para cada entidade de usuário:

1. proprietário consegue acessar;
2. outro usuário não consegue acessar;
3. usuário anônimo não consegue acessar;
4. tentativa de trocar `user_id` é bloqueada;
5. cadeia indireta de propriedade é respeitada;
6. service role funciona somente no ambiente server-side;
7. versão imutável não pode ser alterada pelo usuário.

O Claude Code deverá criar os testes de autorização junto com as migrations correspondentes.

---

## 8. Índices

### Índices básicos

- `user_id`;
- `profile_id`;
- `profile_version_id`;
- `target_context_id`;
- `target_context_version_id`;
- `opportunity_id`;
- `opportunity_version_id`;
- `role_reference_version_id`;
- `analysis_id`;
- `requirement_id`;
- `document_id`;
- `status`;
- `created_at`;
- `retention_deadline`;
- `idempotency_key`;
- `content_hash`;
- `analysis_type`;
- `job_type`;
- `correlation_id`.

### Índices únicos

- `user_accounts(user_id)`;
- `personal_data(user_id)`;
- `professional_profiles(user_id)`;
- `target_contexts(user_id)`;
- `credit_accounts(user_id)`;
- `profile_versions(profile_id, version_number)`;
- `target_context_versions(target_context_id, version_number)`;
- `opportunity_versions(opportunity_id, version_number)`;
- `role_reference_versions(role_reference_id, version_number)`;
- `analyses(user_id, idempotency_key)`;
- `credit_reservations(user_id, idempotency_key)`;
- `credit_ledger(user_id, idempotency_key)`;
- `processing_jobs(user_id, idempotency_key)`.

### Índices compostos

- `(user_id, created_at desc)`;
- `(user_id, status, created_at desc)`;
- `(profile_id, version_number desc)`;
- `(target_context_id, version_number desc)`;
- `(opportunity_id, version_number desc)`;
- `(analysis_id, priority_order)`;
- `(analysis_id, requirement_id)`;
- `(analysis_id, dimension)`;
- `(retention_deadline, deleted_at)`;
- `(status, available_at)`;
- `(job_type, status, available_at)`;
- `(user_id, analysis_type, created_at desc)`.

### Índices parciais recomendados

- jobs em estado `queued`;
- jobs em estado `processing`;
- documentos com retenção vencida e `deleted_at` nulo;
- reservas em estado `reserved`;
- solicitações de exclusão ainda não concluídas;
- contas em estado `deletion_pending`.

Os índices definitivos deverão ser validados com consultas reais e planos de execução.

O Claude Code não deverá adicionar índices redundantes sem medir o impacto de escrita e armazenamento.

---

## 9. Migrations

Toda alteração deverá:

- possuir migration versionada;
- ser revisável;
- ser testada em homologação;
- preservar integridade;
- registrar backfill necessário;
- considerar compatibilidade com versões anteriores;
- possuir estratégia de recuperação;
- evitar alteração manual em produção;
- atualizar tipos gerados;
- atualizar schemas de validação;
- atualizar testes;
- atualizar documentação quando houver mudança de comportamento.

### Ordem recomendada para alterações complexas

1. adicionar estrutura nova compatível;
2. liberar código capaz de ler estrutura antiga e nova;
3. executar backfill;
4. validar dados;
5. adicionar constraints;
6. mudar a leitura principal;
7. remover estrutura antiga somente após validação;
8. registrar a conclusão.

### Alterações destrutivas

Exigem aprovação explícita:

- remoção de coluna;
- remoção de tabela;
- alteração incompatível de enum;
- mudança de tipo com risco de perda;
- reescrita de versões confirmadas;
- alteração retroativa de análises;
- exclusão em massa;
- mudança de política de RLS;
- mudança de propriedade;
- mudança de regra de créditos.

### Diretrizes para Claude Code

O Claude Code deverá:

- utilizar migrations como fonte de mudança estrutural;
- não editar produção diretamente;
- não criar campos para contornar uma regra de negócio;
- não utilizar JSONB como atalho para evitar modelagem;
- criar constraints no banco para invariantes críticas;
- criar índices junto com as consultas que os exigem;
- escrever testes de RLS;
- escrever testes de integridade;
- escrever testes de idempotência;
- validar migrations em banco limpo;
- validar migrations sobre uma versão anterior;
- utilizar dados sintéticos em seeds;
- regenerar tipos TypeScript após mudanças;
- manter compatibilidade entre banco, schemas e aplicação;
- registrar pendência quando o documento não definir uma regra necessária;
- interromper alterações destrutivas sem aprovação;
- não mudar enums, pesos, fatores ou estados silenciosamente.

### Estrutura recomendada no repositório

```
supabase/
  migrations/
  seed.sql
  tests/

src/
  db/
    generated/
    repositories/
    queries/
    validators/

src/
  domain/
    profile/
    target-context/
    opportunities/
    analyses/
    recommendations/
    credits/
```

Essa estrutura é uma recomendação de organização e poderá ser ajustada sem alterar as entidades, relações e invariantes deste documento.

> **O banco de dados não deve ser apenas um local de armazenamento. Ele deve impedir estados impossíveis, preservar versões, isolar usuários e permitir reconstruir como cada análise foi produzida.**
>