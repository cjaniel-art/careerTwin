# Analytics

Criado em: 27 de julho de 2026 23:25

## 1. Objetivo

Analytics deve responder:

- onde o usuário abandona;
- se conclui o cadastro;
- se conclui o onboarding;
- se confirma o Thin Twin;
- se define o contexto-alvo;
- se conclui o Core 1;
- se considera a análise útil;
- se percebe especificidade;
- se seleciona uma recomendação;
- se inicia ou conclui uma ação;
- se utiliza o Core 2;
- se retorna;
- se realiza uma reanálise;
- se demonstra intenção de compra.

Falhas técnicas, latência, jobs, filas, chamadas de IA, schemas e custos devem ser tratados prioritariamente pela observabilidade técnica, e não pelo analytics de produto.

---

## 2. Princípios

### Minimização

Não enviar conteúdo profissional ou pessoal desnecessário.

### Consistência

Eventos seguem uma convenção única e este documento funciona como catálogo canônico.

### Rastreabilidade

Cada evento possui versão do contrato e versão do fluxo quando aplicável.

### Qualidade

Eventos devem ser documentados, validados e testados.

### Separação

Analytics de produto, logs técnicos, observabilidade e auditoria não devem ser confundidos.

### Privacidade

Nenhum dado pessoal direto deve ser enviado quando um identificador pseudônimo for suficiente.

### Fonte de verdade

Analytics registra comportamento observado.

Não deve ser utilizado como fonte de verdade para:

- saldo de créditos;
- status de análises;
- scores;
- versões do perfil;
- consentimentos;
- exclusões;
- permissões.

Essas informações permanecem no banco operacional.

---

## 3. Convenção de nomes

Formato:

```
objeto_ação
```

Exemplos:

- `signup_started`;
- `resume_uploaded`;
- `profile_analysis_completed`;
- `recommendation_selected`.

Regras:

- utilizar inglês;
- utilizar `snake_case`;
- utilizar ação no passado quando concluída;
- um evento deve representar uma ação observável;
- não criar eventos duplicados com nomes diferentes;
- não incluir valores variáveis no nome;
- não criar nomes dinamicamente;
- documentar alterações de significado;
- versionar mudanças de contrato.

Os PRDs devem referenciar este catálogo e não criar nomes alternativos para a mesma ação.

---

## 4. Propriedades comuns

Todo evento deverá considerar:

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

Dados profissionais e scores devem ser enviados somente de forma agregada, como:

- faixa de IPP;
- faixa de IAO;
- nível de confiança;
- quantidade de recomendações;
- quantidade de requisitos;
- presença de limite aplicado;
- categoria da recomendação.

Não enviar:

- nome completo;
- e-mail;
- cidade;
- estado;
- endereço;
- data de nascimento;
- currículo;
- LinkedIn;
- descrição integral da vaga;
- experiências em texto;
- evidências em texto;
- recomendações em texto;
- comentários livres;
- prompts;
- respostas integrais da IA;
- senhas;
- tokens;
- credenciais;
- URLs assinadas.

---

## 5. Eventos de aquisição

- `landing_viewed`;
- `landing_primary_cta_clicked`;
- `landing_secondary_cta_clicked`;
- `signup_started`;
- `signup_completed`;
- `login_started`;
- `login_completed`;
- `login_failed`.

Propriedades úteis:

- origem;
- campanha;
- página;
- tipo de CTA;
- destino do CTA;
- dispositivo;
- primeira visita;
- usuário novo ou recorrente;
- categoria segura de erro.

Eventos relacionados à recuperação de senha, logout, páginas legais e bloqueio de rotas podem ser adicionados conforme o PRD 00, utilizando os nomes registrados no catálogo.

---

## 6. Eventos de onboarding

- `onboarding_started`;
- `onboarding_resumed`;
- `resume_uploaded`;
- `linkedin_uploaded`;
- `upload_failed`;
- `onboarding_completed`.

Eventos adicionais de diagnóstico:

- `onboarding_step_viewed`;
- `onboarding_step_completed`;
- `resume_validation_failed`;
- `linkedin_validation_failed`;
- `resume_replaced`;
- `linkedin_replaced`;
- `onboarding_abandoned`.

Propriedades permitidas:

- tipo do documento;
- tamanho em faixa;
- formato;
- etapa;
- duração;
- método de extração;
- quantidade de tentativas;
- categoria do erro;
- origem da retomada.

`onboarding_abandoned` deve ser calculado como evento derivado. O intervalo de inatividade utilizado para caracterizar abandono deve permanecer configurável e documentado.

---

## 7. Eventos do Thin Twin e contexto-alvo

### Thin Twin

- `twin_extraction_started`;
- `twin_extraction_completed`;
- `twin_extraction_failed`;
- `twin_review_started`;
- `twin_field_corrected`;
- `twin_field_added`;
- `twin_field_removed`;
- `twin_conflict_resolved`;
- `twin_profile_confirmed`;
- `twin_version_created`.

### Contexto-alvo

- `target_role_defined`;
- `target_role_suggested`;
- `target_role_selected`.

O contexto-alvo é separado do Thin Twin e possui versionamento próprio.

Propriedades permitidas:

- quantidade de experiências;
- quantidade de conflitos;
- confiança agregada;
- duração da revisão;
- quantidade de correções;
- versão do Thin Twin;
- versão do contexto-alvo.

Não enviar o conteúdo dos campos profissionais.

---

## 8. Eventos do Core 1

- `profile_analysis_started`;
- `profile_analysis_completed`;
- `profile_analysis_failed`;
- `profile_analysis_viewed`;
- `recommendation_viewed`;
- `recommendation_selected`;
- `action_started`;
- `action_completed`;
- `experience_suggestion_copied`;
- `profile_reanalysis_started`;
- `profile_reanalysis_completed`;
- `analysis_feedback_submitted`.

Eventos adicionais:

- `profile_analysis_blocked`;
- `profile_analysis_reused`;
- `profile_analysis_low_confidence`;
- `ipp_dimension_viewed`;
- `evidence_viewed`;
- `recommendation_status_changed`;
- `action_status_changed`.

Propriedades permitidas:

- faixa de IPP;
- nível de confiança;
- quantidade de recomendações;
- categoria da recomendação;
- prioridade;
- status da ação;
- duração;
- versão do Thin Twin;
- versão do contexto-alvo;
- versão do motor;
- versão da rubrica;
- versão do prompt;
- categoria do erro;
- origem da reanálise.

Não enviar texto das recomendações, evidências ou sugestões.

---

## 9. Eventos do Core 2

### Eventos canônicos

- `job_analysis_started`;
- `job_analysis_completed`;
- `job_analysis_failed`;
- `job_analysis_viewed`;
- `job_recommendation_received`;
- `analysis_feedback_submitted`.

### Eventos adicionais

- `target_role_analysis_started`;
- `target_role_analysis_completed`;
- `opportunity_upload_started`;
- `opportunity_upload_completed`;
- `opportunity_validation_failed`;
- `opportunity_structuring_completed`;
- `opportunity_confirmed`;
- `iao_requirement_viewed`;
- `application_intent_submitted`;
- `opportunity_action_started`;
- `opportunity_action_completed`;
- `fit_reanalysis_started`;
- `fit_reanalysis_completed`.

Propriedades permitidas:

- tipo de análise;
- faixa de IAO;
- nível de confiança;
- quantidade de requisitos;
- quantidade por criticidade;
- quantidade por correspondência;
- quantidade de riscos;
- presença de limite aplicado;
- tipo de recomendação;
- intenção de candidatura;
- duração;
- versão do Thin Twin;
- versão do contexto-alvo;
- versão da vaga;
- versão da referência de cargo;
- versão do motor;
- versão da rubrica;
- versão do prompt;
- categoria do erro.

Não enviar texto integral da vaga, requisitos, evidências ou recomendações.

---

## 10. Eventos de feedback

- `analysis_feedback_submitted`;
- `csat_submitted`;
- `specificity_feedback_submitted`.

Propriedades permitidas:

- tipo de análise;
- utilidade;
- especificidade;
- intenção de ação;
- intenção de candidatura;
- etapa da jornada.

Comentários livres devem permanecer no banco operacional protegido.

Não devem ser enviados integralmente para o fornecedor de analytics.

O mesmo envio de feedback não deve gerar eventos duplicados com nomes diferentes.

---

## 11. Eventos de monetização simulada

- `credits_viewed`;
- `paywall_viewed`;
- `package_selected`;
- `purchase_intent_confirmed`;
- `purchase_intent_abandoned`;
- `credit_consumed`;
- `credit_restored`.

Propriedades permitidas:

- identificador da oferta;
- preço exibido;
- quantidade de créditos;
- validade exibida;
- faixa do saldo anterior;
- faixa do saldo posterior;
- motivo categorizado da restauração;
- tipo da análise relacionada.

O MVP não possui pagamento real.

Não criar eventos como:

- `payment_completed`;
- `subscription_created`;
- `card_added`;

enquanto essas funcionalidades não fizerem parte do escopo.

O ledger de créditos permanece como fonte de verdade para consumo e restauração.

---

## 12. Eventos de privacidade

Esses eventos devem permanecer preferencialmente em auditoria interna:

- `consent_recorded`;
- `consent_revoked`;
- `account_deletion_requested`;
- `account_deleted`;
- `document_deleted`;
- `document_deletion_failed`.

Uma versão mínima de `account_deletion_requested` pode ser utilizada no analytics de produto quando estiver de acordo com a Política de Privacidade e a política de consentimento.

Analytics não substitui os registros operacionais e de auditoria necessários para comprovar:

- consentimento;
- revogação;
- solicitação de exclusão;
- execução da exclusão;
- falha de exclusão.

---

## 13. Funil principal

### Aquisição e ativação

```
landing_viewed
→ signup_started
→ signup_completed
→ onboarding_started
→ resume_uploaded
→ linkedin_uploaded
→ twin_profile_confirmed
→ target_role_defined
→ onboarding_completed
→ profile_analysis_completed
```

### Geração de valor

```
profile_analysis_completed
→ recommendation_viewed
→ recommendation_selected
→ action_started
→ action_completed
```

### Core 2

```
job_analysis_started
→ job_analysis_completed
→ job_recommendation_received
→ application_intent_submitted
```

### Monetização simulada

```
paywall_viewed
→ package_selected
→ purchase_intent_confirmed
```

Os fluxos de Core 2, ação e monetização não devem ser tratados como uma única sequência obrigatória.

---

## 14. Métrica principal

### Taxa de Análise Acionável

Uma análise é acionável quando:

- utilidade igual a 4 ou 5; e
- pelo menos uma recomendação ou ação relacionada foi selecionada, iniciada ou concluída.

### Definição operacional

```
Análises úteis com ação
÷
Análises concluídas com janela de observação encerrada
```

A métrica deve considerar somente análises:

- concluídas com sucesso;
- visualizadas pelo usuário;
- com possibilidade de envio de feedback;
- cuja janela de observação tenha terminado.

### Janela de observação

A duração exata da janela ainda precisa ser registrada no Decision Log.

Enquanto essa decisão estiver pendente:

- o dashboard deve apresentar separadamente análises úteis e análises com ação;
- a Taxa de Análise Acionável não deve ser publicada como indicador oficial;
- nenhuma janela deve ser definida silenciosamente pelo Claude Code.

---

## 15. Métricas de produto

### Aquisição

- visitas;
- CTR de cadastro;
- início de cadastro;
- conclusão de cadastro.

### Ativação

- conclusão do onboarding;
- confirmação do Thin Twin;
- definição do contexto-alvo;
- conclusão do Core 1;
- tempo até o primeiro valor.

### Valor

- CSAT;
- especificidade percebida;
- recomendações visualizadas;
- recomendações selecionadas;
- ações iniciadas;
- ações concluídas;
- Taxa de Análise Acionável.

### Core 2

- análises iniciadas;
- análises concluídas;
- recomendação recebida;
- intenção de candidatura;
- ações relacionadas à oportunidade.

### Retenção

- retorno em sete dias;
- retorno em 30 dias;
- reanálise;
- atualização do perfil;
- nova vaga analisada.

### Monetização

- visualização do paywall;
- seleção do pacote;
- intenção de compra.

### Qualidade percebida

- utilidade;
- especificidade;
- confiança percebida;
- feedback enviado;
- compreensão dos diagnósticos.

Taxa de sucesso técnico, falhas de schema, retentativas, latência e custo devem ser obtidos da observabilidade técnica.

---

## 16. Dashboards recomendados

### Dashboard executivo

- usuários;
- ativação;
- Taxa de Análise Acionável;
- retenção;
- intenção de compra;
- falhas críticas agregadas.

### Dashboard de onboarding

- conversão por etapa;
- duração;
- erro de upload;
- abandono;
- retomada;
- confirmação do Thin Twin;
- definição do contexto-alvo.

### Dashboard de produto e IA

- conclusão por tipo de análise;
- utilidade;
- especificidade;
- confiança agregada;
- recomendações selecionadas;
- ações iniciadas;
- ações concluídas;
- feedback.

### Dashboard técnico

Deve utilizar observabilidade técnica como fonte principal para:

- disponibilidade;
- erros;
- latência;
- filas;
- jobs travados;
- falhas de schema;
- chamadas de IA;
- banco;
- storage;
- custo;
- exclusões pendentes.

Dados técnicos agregados podem ser apresentados junto aos indicadores de produto, mas não devem depender exclusivamente dos eventos de analytics.

---

## 17. Qualidade dos eventos

Antes de produção:

- validar nome;
- validar versão;
- validar propriedades;
- validar tipos;
- testar disparo único;
- testar idempotência;
- testar ordem;
- testar ambiente;
- testar origem client e server;
- testar usuário anônimo e autenticado;
- impedir conteúdo pessoal ou profissional;
- impedir eventos duplicados;
- documentar trigger;
- documentar responsável;
- validar métrica relacionada;
- validar dashboard;
- validar consentimento quando aplicável.

Eventos não documentados não devem ser enviados à produção.

Eventos de conclusão devem ser emitidos preferencialmente pelo backend, após a persistência bem-sucedida da operação.

---

## 18. Catálogo de eventos

O Notion deverá possuir uma base com:

| Campo | Descrição |
| --- | --- |
| Evento | Nome canônico |
| Descrição | Ação representada |
| Trigger | Momento exato de disparo |
| Origem | Client, server, worker ou derived |
| Propriedades | Campos permitidos |
| Dados proibidos | Campos sensíveis ou profissionais |
| Área | Fluxo relacionado |
| PRD | Documento de origem |
| Responsável | DRI |
| Status | Proposto, implementado, validado ou descontinuado |
| Versão | Versão do contrato |
| Métrica | Indicador relacionado |
| Dashboard | Onde é utilizado |

Esta página é a fonte canônica para os nomes dos eventos.

Quando um PRD, implementação ou dashboard utilizar outro nome para a mesma ação, o nome definido neste catálogo deverá prevalecer após revisão e atualização dos documentos relacionados.