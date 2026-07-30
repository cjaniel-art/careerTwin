# Arquitetura

Criado em: 27 de julho de 2026 23:20

## 1. Objetivo

A arquitetura do CareerTwin deve suportar:

- aplicação web responsiva;
- autenticação individual;
- envio e processamento de documentos;
- criação e versionamento do Thin Twin;
- criação e versionamento separado do contexto-alvo;
- estruturação e versionamento de oportunidades;
- análises com inteligência artificial;
- cálculo determinístico de IPP, IAO, confiança e prioridade;
- histórico de análises;
- acompanhamento de ações;
- reanálises;
- créditos simulados;
- analytics;
- exclusão de dados;
- observabilidade;
- recuperação de falhas.

A arquitetura deve priorizar simplicidade operacional no MVP sem comprometer:

- segurança;
- isolamento entre usuários;
- rastreabilidade;
- qualidade da IA;
- proteção de dados;
- idempotência;
- testabilidade;
- capacidade de evolução.

O CareerTwin será implementado com apoio do Claude Code.

O Claude Code atuará como agente de desenvolvimento e deverá seguir os documentos canônicos, PRDs, contratos, schemas, decisões arquiteturais, critérios de aceite e Style Guide do projeto.

O Claude Code:

- não é um componente do produto;
- não participa do runtime da aplicação;
- não é fonte de regras de negócio;
- não pode redefinir decisões fechadas;
- não pode preencher lacunas documentais com decisões silenciosas;
- deve interromper a implementação específica quando houver contradição ou decisão pendente relevante.

---

## 2. Status arquitetural

### Decisões confirmadas

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

### Baseline técnico proposto

- frontend web;
- TypeScript como linguagem principal da aplicação;
- framework web compatível com React e renderização server-side quando necessário;
- shadcn/ui como base do Design System;
- Tailwind CSS para estilos e tokens;
- Lucide React para iconografia;
- Supabase Auth;
- PostgreSQL via Supabase Database;
- Supabase Storage para arquivos temporários;
- API, backend ou funções server-side;
- provedor de modelo de linguagem;
- fila durável e processamento assíncrono;
- analytics de produto;
- monitoramento técnico;
- rotinas automáticas de retenção e exclusão;
- testes automatizados;
- migrations versionadas;
- CI/CD.

O baseline técnico é uma proposta e deverá ser registrado no Decision Log antes de ser tratado como arquitetura definitiva.

O uso do Claude Code não transforma uma proposta em decisão aprovada.

O Claude Code poderá sugerir alternativas técnicas, mas não poderá decidir silenciosamente:

- regras de produto;
- pesos, fatores ou fórmulas;
- estados funcionais;
- política de créditos;
- retenção de dados;
- critérios de segurança;
- provedores definitivos;
- limites operacionais;
- mudanças de escopo.

---

## 3. Visão de alto nível

```
Usuário
   │
   ▼
Aplicação Web
   │
   ├── Site público e autenticação
   ├── Onboarding
   ├── Thin Twin
   ├── Contexto-alvo
   ├── Core 1
   ├── Core 2
   └── Funcionalidades de apoio
   │
   ▼
API / Backend
   │
   ├── Autorização
   ├── Regras de negócio
   ├── Versionamento
   ├── Orquestração de jobs
   ├── Validação de schemas
   ├── Motor de scores
   ├── Gestão de créditos
   └── Auditoria
   │
   ├─────────────┬─────────────┬──────────────┬──────────────┐
   ▼             ▼             ▼              ▼              ▼
PostgreSQL    Storage      Fila / Worker   Serviço de IA   Analytics
   │             │             │              │              │
   └── Perfis ───┴── Arquivos ─┴── Análises ──┴── Eventos ───┘
```

O serviço de IA não deverá acessar diretamente o banco de dados, o storage ou os dados de outros usuários.

Toda interação com IA deverá ser orquestrada pelo backend.

O Claude Code deverá implementar as camadas respeitando seus limites de responsabilidade. Regras críticas não deverão ser deslocadas para o frontend ou para prompts apenas por conveniência de implementação.

---

## 4. Componentes

## 4.1 Aplicação web

Responsável por:

- landing page;
- cadastro e login;
- onboarding;
- upload;
- revisão do Thin Twin;
- definição do contexto-alvo;
- apresentação do Core 1;
- apresentação do Core 2;
- dashboard;
- histórico;
- ações;
- feedback;
- créditos simulados;
- configurações;
- exclusão da conta.

Dashboard, histórico, ações, créditos e configurações são superfícies de apoio e não constituem um terceiro módulo core.

### Regras

- não acessar diretamente dados de outro usuário;
- não expor chaves administrativas;
- não calcular scores no cliente;
- não armazenar documentos profissionais em cache permanente;
- não confiar em permissões implementadas somente na interface;
- não utilizar o Core 1 como pré-condição técnica obrigatória do Core 2;
- derivar permissões e estados a partir de informações validadas pelo backend;
- apresentar resultados parciais ou de baixa confiança com o estado adequado;
- não apresentar uma análise incompleta como definitiva;
- utilizar componentes reutilizáveis;
- preservar HTML semântico e acessibilidade;
- implementar estados de hover, focus, loading, disabled, empty e error;
- manter consistência entre desktop, tablet e mobile;
- utilizar exclusivamente os logos oficiais sem distorção ou reconstrução.

### Diretrizes para Claude Code

- reutilizar componentes shadcn/ui antes de criar componentes do zero;
- aplicar os tokens CareerTwin por meio do Tailwind CSS;
- utilizar Inter como tipografia principal;
- utilizar Lucide React para iconografia;
- manter componentes desacoplados das páginas;
- evitar lógica de negócio em componentes visuais;
- não utilizar dados fictícios em entregáveis finais;
- não criar textos, métricas, clientes, depoimentos ou resultados não aprovados;
- não alterar o Style Guide para acomodar uma implementação mais simples.

---

## 4.2 Autenticação

Baseline proposto: Supabase Auth.

Responsabilidades:

- criação de conta;
- login;
- logout;
- recuperação de senha;
- gerenciamento de sessão;
- identificação segura do usuário;
- proteção das rotas autenticadas;
- revogação de acesso;
- suporte à exclusão da conta.

### Requisitos

- e-mails normalizados;
- senhas nunca armazenadas diretamente pela aplicação;
- tokens protegidos;
- expiração de sessão;
- revogação de tokens;
- proteção contra tentativas excessivas;
- mensagens neutras na recuperação de senha;
- origens de redirecionamento autorizadas;
- registro de eventos críticos;
- nenhum usuário pode consultar recursos de outro usuário.

Caso outro provedor seja adotado, deverá oferecer controles equivalentes.

O Claude Code não deverá assumir regras pendentes de autenticação. Política de senha, confirmação de e-mail, duração da sessão e redirecionamentos finais deverão seguir o PRD 00 e o Decision Log.

---

## 4.3 API e backend

O backend será a camada responsável pela execução das regras críticas.

Responsabilidades:

- validar autenticação e autorização;
- receber solicitações da aplicação;
- resolver o usuário a partir da sessão;
- gerar URLs seguras de upload;
- validar arquivos;
- iniciar processamentos;
- montar o contexto mínimo para IA;
- chamar modelos;
- validar respostas estruturadas;
- calcular scores;
- calcular confiança;
- calcular prioridade;
- aplicar limites e ordem de precedência;
- persistir resultados;
- reservar, confirmar ou liberar créditos;
- gerar versões;
- controlar retenção;
- registrar eventos técnicos;
- impedir acesso indevido;
- preservar idempotência.

### Regra central

Toda operação deverá utilizar o identificador derivado da sessão autenticada.

O backend não deve confiar em um `user_id` enviado livremente pelo cliente.

Toda análise deverá validar que perfil, contexto-alvo, oportunidade, documentos, recomendações e créditos pertencem ao mesmo usuário.

### Diretrizes para implementação

- contratos de entrada e saída deverão possuir validação em runtime;
- erros deverão utilizar códigos estáveis e mensagens seguras;
- funções críticas deverão ser pequenas, testáveis e determinísticas;
- regras do motor não deverão ser duplicadas em controllers, componentes ou prompts;
- mudanças em contratos deverão gerar nova versão quando alterarem comportamento;
- operações críticas deverão aceitar chave de idempotência;
- integrações externas deverão ser encapsuladas por interfaces ou adaptadores;
- mocks e fixtures deverão ser utilizados somente em testes e desenvolvimento;
- o Claude Code deverá criar ou atualizar testes junto com alterações funcionais.

---

## 4.4 Banco de dados

Baseline proposto: PostgreSQL via Supabase.

Responsabilidades:

- contas e dados pessoais mínimos;
- Thin Twin;
- versões do perfil;
- contextos-alvo e suas versões;
- experiências;
- competências;
- ferramentas;
- evidências;
- documentos;
- oportunidades e suas versões;
- requisitos;
- análises;
- resultados;
- scores;
- confiança;
- recomendações;
- ações;
- feedbacks;
- créditos;
- reservas de crédito;
- consentimentos;
- exclusões;
- jobs;
- auditoria.

### Diretrizes

- chaves primárias UUID;
- timestamps em UTC;
- integridade referencial;
- migrations versionadas;
- controle de acesso em nível de linha ou mecanismo equivalente;
- separação entre dados pessoais e profissionais;
- registros imutáveis para versões confirmadas e análises concluídas;
- exclusão lógica apenas onde necessária;
- exclusão física conforme a política de retenção;
- JSONB apenas para estruturas flexíveis e versionadas;
- não utilizar JSONB para substituir entidades e relações essenciais;
- índices para consultas críticas;
- restrições únicas em operações idempotentes;
- nomes de tabelas, campos, constraints e enums consistentes com o Modelo de Dados.

Toda análise deverá registrar, conforme aplicável:

- `profile_version_id`;
- `target_context_version_id`;
- `opportunity_version_id`;
- versão do motor;
- versão da configuração;
- versão da rubrica;
- versão do prompt;
- versão do schema;
- versão do modelo.

### Diretrizes para Claude Code

- nenhuma alteração manual direta em produção;
- toda mudança estrutural deve utilizar migration;
- migrations devem ser revisáveis, idempotentes quando aplicável e compatíveis com rollback operacional;
- políticas de acesso devem ser testadas para proprietário, usuário diferente e acesso anônimo;
- seeds devem utilizar somente dados sintéticos;
- o código gerado não deverá criar campos não previstos apenas para simplificar a implementação;
- divergências entre o Modelo de Dados e a necessidade de código deverão ser registradas antes da migration.

---

## 4.5 Armazenamento de arquivos

Baseline proposto: Supabase Storage.

Arquivos temporários:

- currículo;
- LinkedIn;
- vaga;
- documentos complementares autorizados;
- artefatos intermediários de extração, quando necessários.

### Diretrizes

- buckets privados;
- acesso por URL assinada;
- prazo curto de validade;
- caminho relacionado ao usuário e ao documento;
- validação de extensão;
- validação de MIME type;
- validação de tamanho;
- verificação de arquivos protegidos;
- análise de segurança;
- nenhuma URL pública permanente;
- exclusão automática após processamento;
- não utilizar o nome original do arquivo como identificador;
- não registrar conteúdo integral em logs.

### Estrutura sugerida

```
temporary-documents/
  user_id/
    document_id/
      source_file
      processing_artifact
```

Os documentos originais não fazem parte do Thin Twin.

Após o processamento e o período necessário para revisão ou recuperação, deverão ser excluídos conforme a política de retenção.

Somente informações profissionais estruturadas, confirmadas e evidências mínimas necessárias deverão permanecer persistidas.

---

## 4.6 Processamento assíncrono

Extração e geração de análises podem superar o tempo adequado para uma requisição síncrona.

O processamento deverá ser modelado como job assíncrono.

### Tipos de job

- extração de currículo;
- extração de LinkedIn;
- consolidação do Thin Twin;
- estruturação de oportunidade;
- Core 1;
- Core 2;
- reanálise;
- exclusão de documentos;
- exclusão de conta.

### Estados técnicos do job

- `queued`;
- `processing`;
- `completed`;
- `partially_completed`;
- `failed`;
- `cancelled`;
- `expired`.

Esses estados representam somente o processamento técnico.

Eles não substituem:

- estado do documento;
- estado da análise;
- estado da recomendação;
- estado do crédito;
- estado apresentado na interface.

O estado `partially_completed` não autoriza a apresentação de um relatório como definitivo.

Os estados funcionais devem ser definidos nos PRDs e no Modelo de Dados, com mapeamento explícito para os estados técnicos.

### Requisitos

- fila durável;
- idempotência;
- retentativas limitadas;
- timeout;
- correlação por `job_id`;
- correlação por `analysis_id`, quando aplicável;
- registro de erro categorizado;
- recuperação após interrupção;
- não duplicar análises;
- não criar versões duplicadas;
- não consumir crédito duas vezes;
- não apresentar sucesso antes da persistência completa;
- suportar cancelamento quando tecnicamente seguro.

O Claude Code não deverá criar estados adicionais sem atualizar os documentos de contrato e os testes correspondentes.

---

## 4.7 Integração com inteligência artificial

O provedor de IA será acessado somente pelo backend ou por workers autorizados.

### O backend deverá

- selecionar somente os dados necessários;
- remover dados pessoais não utilizados;
- separar Thin Twin e contexto-alvo;
- delimitar documentos como dados não confiáveis;
- aplicar prompt versionado;
- exigir saída estruturada;
- validar schema;
- validar enums;
- verificar referências de evidência;
- verificar autenticidade;
- executar retentativas controladas;
- registrar modelo e versão;
- impedir score livre;
- impedir prioridade final definida pela IA;
- persistir somente resultados validados.

### O provedor de IA não deverá receber

- nome completo sem necessidade;
- e-mail;
- endereço residencial;
- data de nascimento;
- senha;
- tokens de autenticação;
- dados financeiros;
- documentos de outros usuários;
- histórico irrelevante;
- identificadores internos desnecessários;
- instruções administrativas;
- segredos da aplicação.

A IA deverá retornar classificações, evidências, justificativas e candidatos a recomendações.

Scores, confiança, prioridade, limites e recomendação final deverão ser calculados ou confirmados pelo backend conforme o Motor de Análise e Scores.

### Diretrizes para Claude Code

- prompts devem permanecer versionados fora de componentes visuais;
- schemas devem possuir uma fonte única de verdade;
- a validação de saída deve ocorrer antes de qualquer persistência;
- dados de teste não devem ser misturados com prompts de produção;
- erros do provedor devem ser convertidos para categorias internas estáveis;
- chamadas devem possuir timeout, retentativas limitadas e correlação;
- o conteúdo integral de prompts e respostas não deve ser enviado para analytics;
- nenhuma alteração de modelo, prompt ou schema deverá ocorrer sem testes de regressão.

---

## 4.8 Motor de scores

O Motor de Análise e Scores será executado no backend.

Responsabilidades:

- receber classificações estruturadas;
- validar os valores permitidos;
- aplicar rubricas;
- aplicar pesos;
- mapear estados de correspondência aos fatores oficiais;
- excluir requisitos não aplicáveis;
- normalizar o denominador quando necessário;
- calcular IPP;
- calcular IAO bruto;
- aplicar limites ao IAO final;
- calcular confiança;
- calcular prioridade;
- aplicar a ordem de precedência;
- validar a recomendação final;
- registrar todas as versões utilizadas;
- preservar explicabilidade.

A IA não poderá retornar o score final como fonte de verdade.

O motor deverá preservar separadamente:

- classificações produzidas pela IA;
- cálculo bruto;
- cálculo final;
- confiança;
- limites aplicados;
- recomendação final;
- evidências;
- versões de configuração.

As mesmas entradas confirmadas e as mesmas versões de configuração deverão produzir o mesmo resultado matemático.

### Diretrizes para Claude Code

- implementar o motor como módulo determinístico e independente do framework visual;
- manter pesos, fatores, faixas e limites em configuração versionada;
- não duplicar fórmulas em múltiplos arquivos;
- criar testes unitários para valores de fronteira, caps, bloqueadores e denominadores;
- impedir valores fora dos enums e intervalos permitidos;
- preservar precisão durante o cálculo e arredondar somente no ponto definido;
- registrar a versão da configuração utilizada em cada análise;
- não alterar fórmulas para fazer testes passarem sem decisão aprovada.

---

## 4.9 Analytics e observabilidade

A arquitetura deverá separar:

### Analytics de produto

Mede comportamento do usuário e validação das hipóteses.

Os nomes canônicos dos eventos deverão ser definidos exclusivamente na página **Analytics**.

A implementação não deverá criar nomes alternativos para o mesmo evento.

Analytics não deverá receber:

- currículo;
- LinkedIn;
- descrição integral de vaga;
- evidências textuais;
- nome completo;
- e-mail em texto aberto;
- dados pessoais desnecessários;
- prompts ou respostas integrais da IA.

### Observabilidade técnica

Mede:

- disponibilidade;
- erros;
- latência;
- filas;
- jobs;
- retentativas;
- chamadas de IA;
- conformidade de schemas;
- consumo de recursos;
- custo por análise;
- reservas e confirmações de crédito;
- falhas de retenção;
- incidentes de segurança.

Logs deverão utilizar identificadores técnicos e metadados mínimos.

Conteúdo profissional integral, segredos e tokens não deverão ser registrados.

O Claude Code deverá reutilizar o catálogo canônico de eventos e não deverá criar eventos por conveniência local sem atualização da página Analytics.

---

## 5. Fluxo técnico — Onboarding

1. usuário autenticado inicia ou retoma o onboarding;
2. backend cria ou recupera o estado do onboarding;
3. usuário informa nome e, opcionalmente, cidade e estado;
4. frontend solicita URL segura de upload;
5. arquivo é enviado ao bucket privado;
6. backend cria `document` e `processing_job`;
7. worker valida segurança, formato e conteúdo;
8. texto é extraído;
9. serviço de IA estrutura os dados profissionais;
10. backend valida o schema e as evidências;
11. dados extraídos são persistidos como rascunho;
12. usuário revisa, corrige, adiciona ou rejeita informações;
13. confirmação cria uma versão imutável do Thin Twin;
14. objetivo profissional é confirmado em uma versão separada do contexto-alvo;
15. rotina de retenção exclui os arquivos temporários;
16. eventos canônicos de conclusão são registrados.

Dados pessoais não deverão ser incorporados ao Thin Twin nem enviados à IA sem necessidade.

O Claude Code deverá implementar o fluxo conforme os estados, limites, mensagens e critérios definidos no PRD 01, sem reinterpretar regras de conteúdo, upload ou versionamento.

---

## 6. Fluxo técnico — Core 1

1. usuário solicita a Análise de Perfil;
2. backend verifica autenticação e autorização;
3. backend verifica Thin Twin confirmado;
4. backend verifica contexto-alvo confirmado;
5. análise é criada com chave de idempotência;
6. `profile_version_id` e `target_context_version_id` são congelados;
7. versões do motor, configuração, rubrica, prompt e schema são registradas;
8. job assíncrono é criado;
9. contexto profissional mínimo é montado;
10. IA classifica as sete dimensões em níveis de zero a quatro;
11. IA relaciona evidências e gera recomendações candidatas;
12. backend valida schema, enums, evidências e autenticidade;
13. backend calcula IPP, confiança e prioridade;
14. relatório e resultados são persistidos;
15. análise passa para o estado concluído;
16. crédito é confirmado somente quando aplicável e após o sucesso;
17. eventos canônicos são registrados;
18. usuário visualiza o relatório.

Uma falha técnica deverá liberar eventual reserva de crédito e permitir nova tentativa.

O Claude Code deverá utilizar o PRD 02, o Motor de Análise e Scores, Prompts e Schemas e Qualidade da IA como contratos complementares desta sequência.

---

## 7. Fluxo técnico — Core 2

1. usuário inicia a análise de um cargo ou vaga;
2. backend valida autenticação e autorização;
3. descrição ou documento é recebido e validado;
4. oportunidade é criada ou reutilizada de forma idempotente;
5. IA estrutura os requisitos;
6. backend valida schema, criticidades, ambiguidades e evidências de origem;
7. usuário revisa e confirma a oportunidade estruturada;
8. uma versão imutável da oportunidade é criada;
9. backend verifica Thin Twin e contexto-alvo confirmados;
10. `profile_version_id`, `target_context_version_id` e `opportunity_version_id` são congelados;
11. crédito é reservado quando a operação exigir consumo;
12. job assíncrono é criado;
13. IA classifica cada requisito utilizando os estados permitidos;
14. backend valida classificações, evidências e autenticidade;
15. backend calcula IAO bruto, confiança e prioridade;
16. backend aplica limites de segurança e ordem de precedência;
17. backend define a recomendação final;
18. relatório e resultados são persistidos;
19. crédito é confirmado somente após o sucesso;
20. eventos canônicos são registrados;
21. usuário visualiza o relatório.

Em análise de cargo-alvo, deverá ser utilizada uma referência de cargo aprovada e versionada.

Na ausência dessa referência, o sistema não deverá apresentar uma análise definitiva como se utilizasse um catálogo validado.

Falhas técnicas deverão liberar a reserva de crédito e não gerar consumo.

O Core 1 não é uma pré-condição técnica obrigatória para iniciar o Core 2.

O Claude Code deverá utilizar o PRD 03, o Motor de Análise e Scores, Prompts e Schemas e Guardrails como contratos complementares desta sequência.

---

## 8. Idempotência

Operações críticas devem aceitar uma chave de idempotência.

Aplicável a:

- criação de análise;
- geração de job;
- criação de oportunidade;
- criação de versão;
- reserva de crédito;
- confirmação de crédito;
- restauração ou liberação de crédito;
- reanálise;
- exclusão de conta;
- envio de feedback.

### Resultado esperado

Repetir a mesma solicitação não poderá:

- criar análises duplicadas;
- criar jobs duplicados;
- criar versões duplicadas;
- consumir múltiplos créditos;
- gerar oportunidades duplicadas;
- executar exclusões inconsistentes;
- sobrescrever relatórios anteriores.

Quando todas as entradas e versões forem idênticas, o sistema poderá reutilizar um resultado existente conforme a regra definida nos PRDs.

A chave de idempotência não deverá ser utilizada para reaproveitar um resultado quando qualquer versão relevante tiver mudado.

### Diretrizes para Claude Code

- implementar restrições únicas no banco quando aplicável;
- tratar repetição concorrente, e não apenas repetição sequencial;
- testar requisições duplicadas e retentativas após timeout;
- manter reserva e confirmação de crédito como operações separadas;
- não utilizar apenas estado em memória para garantir idempotência;
- registrar a chave, o escopo, o resultado e a expiração da operação.

---

## 9. Ambientes

### Desenvolvimento

- dados sintéticos;
- credenciais separadas;
- modelos e prompts em teste;
- logs técnicos detalhados;
- nenhuma informação real sem autorização;
- integrações externas isoladas ou simuladas.

### Homologação

- estrutura próxima da produção;
- casos de teste;
- validação de migrations;
- testes de regressão;
- testes de segurança;
- testes de retenção;
- testes de idempotência;
- simulação de falhas;
- validação de créditos.

### Produção

- acessos restritos;
- chaves exclusivas;
- logs protegidos;
- monitoramento;
- backups;
- alertas;
- políticas de retenção ativas;
- rotinas de exclusão;
- auditoria de operações críticas.

Os ambientes não devem compartilhar:

- banco;
- bucket;
- chaves;
- tokens;
- usuários;
- filas;
- logs sensíveis;
- configurações administrativas.

### Diretrizes para Claude Code

- nunca utilizar credenciais reais em arquivos versionados;
- criar arquivos de exemplo sem valores secretos;
- manter variáveis de ambiente documentadas;
- separar configurações por ambiente;
- impedir execução acidental de testes destrutivos em produção;
- utilizar dados sintéticos em seeds, fixtures e testes;
- não assumir que desenvolvimento e produção possuem as mesmas permissões.

---

## 10. Configuração e segredos

Segredos devem permanecer em gerenciador apropriado.

Inclui:

- chaves de IA;
- chaves administrativas;
- tokens;
- credenciais de banco;
- segredos de integrações;
- chaves de analytics;
- chaves de monitoramento.

Regras:

- nunca versionar em repositório;
- nunca expor ao frontend;
- utilizar menor privilégio;
- rotacionar após exposição;
- separar por ambiente;
- limitar acesso administrativo;
- registrar responsáveis;
- auditar alterações;
- não incluir segredos em logs ou mensagens de erro.

Pesos, fatores, faixas e limites do motor não são segredos, mas devem permanecer em configuração versionada e protegida contra alteração não autorizada.

### Diretrizes para Claude Code

- utilizar nomes claros e estáveis para variáveis de ambiente;
- validar variáveis obrigatórias na inicialização;
- falhar explicitamente quando uma configuração crítica estiver ausente;
- não criar fallback inseguro para segredo ausente;
- não imprimir valores secretos durante debug;
- não inserir chaves em exemplos, testes, documentação ou mensagens de erro;
- não modificar configurações de produção sem instrução explícita.

---

## 11. Estratégia de falha

Em caso de falha:

- não exibir resultado parcial como definitivo;
- não persistir saída inválida;
- não confirmar consumo de crédito;
- liberar eventual reserva;
- preservar dados e etapas válidas;
- registrar código e categoria do erro;
- permitir retentativa segura;
- apresentar mensagem compreensível;
- impedir vazamento de detalhes internos;
- impedir processamento duplicado;
- preservar relatórios anteriores;
- abrir incidente quando houver impacto relevante.

Falhas recuperáveis e finais deverão possuir estados distintos.

Uma retentativa técnica não deverá criar uma nova cobrança nem substituir silenciosamente uma análise concluída.

### Diretrizes para Claude Code

- utilizar erros tipados ou categorizados;
- não capturar exceções sem tratamento ou registro;
- não retornar stack trace ao usuário;
- registrar `correlation_id`, `job_id` e `analysis_id` quando aplicável;
- testar falhas de rede, timeout, JSON inválido, schema inválido e indisponibilidade do provedor;
- implementar compensação para reservas de crédito e artefatos temporários;
- evitar retentativas automáticas em erros não recuperáveis;
- manter mensagens de interface separadas dos detalhes técnicos.

---

## 12. Requisitos não funcionais iniciais

### Segurança

- isolamento entre usuários;
- comunicação criptografada;
- storage privado;
- controle de acesso em nível de linha ou equivalente;
- acesso administrativo controlado;
- validação de arquivos;
- minimização de dados;
- segregação de ambientes;
- auditoria de operações críticas;
- proteção contra prompt injection;
- prevenção de vazamento de segredos;
- dependências mantidas e revisadas.

### Disponibilidade

O MVP deverá priorizar estabilidade do fluxo principal, sem assumir compromisso público de SLA antes da validação operacional.

### Desempenho

Metas iniciais para análises:

- mediana inferior a 60 segundos;
- p95 inferior a 120 segundos.

Essas metas são referências operacionais e poderão ser revisadas com base nos testes e no volume real.

### Rastreabilidade

Toda análise deverá registrar:

- usuário;
- `profile_version_id`;
- `target_context_version_id`;
- `opportunity_version_id`, quando aplicável;
- versão do prompt;
- versão do schema;
- versão do modelo;
- versão da rubrica;
- versão do motor;
- versão da configuração;
- `job_id`;
- data;
- score bruto;
- score final;
- confiança;
- limites aplicados;
- resultado;
- erros.

### Qualidade de código

- TypeScript em modo estrito;
- validação de contratos em runtime;
- lint e formatação automatizados;
- testes unitários para regras determinísticas;
- testes de integração para banco, autorização, storage, jobs e créditos;
- testes de contrato para schemas da IA;
- testes end-to-end para fluxos críticos;
- dependências externas encapsuladas;
- código sem segredos ou dados pessoais de teste;
- migrations revisadas;
- documentação atualizada junto com mudanças de comportamento.

### Acessibilidade e interface

- componentes acessíveis;
- navegação por teclado;
- foco visível;
- HTML semântico;
- rótulos e mensagens de erro adequados;
- contraste compatível com acessibilidade;
- responsividade em desktop, tablet e mobile;
- uso do Design System CareerTwin.

O Claude Code deverá tratar esses requisitos como critérios de implementação e não como recomendações opcionais.

---

## 13. Decisões arquiteturais pendentes

Devem ser registradas no Decision Log:

- framework definitivo do frontend;
- forma de hospedagem;
- provedor definitivo de autenticação;
- provedor definitivo de banco de dados;
- provedor definitivo de storage;
- runtime do backend;
- tecnologia da fila;
- estratégia de workers;
- provedor de IA;
- provedor de analytics;
- provedor de monitoramento;
- política de regiões;
- estratégia de backup;
- ferramenta de gestão de segredos;
- estratégia de CI/CD;
- limites máximos de arquivo;
- metas formais de disponibilidade;
- política de recuperação de desastre;
- estratégia de escalabilidade;
- política de custos e limites de uso;
- política de observabilidade e retenção de logs;
- política definitiva de confirmação de e-mail e sessão;
- catálogo aprovado de referências de cargo para análise por cargo-alvo.

Antes do início de cada etapa com Claude Code, as decisões necessárias para aquela etapa deverão estar registradas no Decision Log ou em configuração explicitamente aprovada.

Quando uma decisão pendente impedir uma implementação segura, o Claude Code deverá:

1. identificar a pendência;
2. indicar o documento ou contrato afetado;
3. apresentar alternativas técnicas quando útil;
4. evitar alterações irreversíveis;
5. solicitar decisão antes de continuar aquela parte;
6. preservar o restante da implementação que não dependa da decisão.

Toda implementação deverá preservar rastreabilidade entre:

- requisito;
- decisão;
- contrato;
- código;
- migration;
- teste;
- evento de analytics;
- critério de aceite.

Nenhuma escolha pendente deverá ser considerada definitiva ou implementada de forma irreversível antes de aprovação e registro no Decision Log.