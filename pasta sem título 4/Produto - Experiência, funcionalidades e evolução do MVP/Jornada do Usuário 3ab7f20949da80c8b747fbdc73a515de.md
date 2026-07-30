# Jornada do Usuário

Criado em: 27 de julho de 2026 23:14

## 1. Jornada principal

> **Site → Cadastro e autenticação → Onboarding → Currículo e LinkedIn → Extração → Revisão e confirmação do Thin Twin → Definição do objetivo profissional → Core 1 → Core 2 → Ações → Atualização e reanálise**
> 

O Core 1 representa a sequência recomendada após o onboarding, mas não é uma pré-condição técnica obrigatória para o Core 2.

---

## 2. Etapa 1 — Descoberta

### Objetivo do usuário

Entender o que é o CareerTwin e decidir se vale iniciar a experiência.

### Ações do usuário

- acessa o site;
- lê a proposta de valor;
- entende como o produto funciona;
- consulta os dois módulos core;
- inicia o cadastro ou faz login.

### Resposta do sistema

O site apresenta:

- problema resolvido;
- proposta de valor;
- funcionamento geral;
- Core 1;
- Core 2;
- compromisso com autenticidade;
- limitações;
- chamadas para cadastro e login.

### Resultado esperado

O usuário entende que o CareerTwin:

- analisa perfil, cargos e vagas;
- gera diagnósticos explicáveis;
- não promete entrevista ou contratação;
- não inventa experiências;
- exige currículo e LinkedIn;
- acompanha a jornada até a preparação e decisão de candidatura.

---

## 3. Etapa 2 — Cadastro e autenticação

### Objetivo do usuário

Criar uma conta e acessar sua área individual.

### Ações

- informa e-mail;
- cria senha;
- aceita os termos obrigatórios;
- confirma o cadastro, quando necessário;
- faz login.

### Resposta do sistema

- valida os dados;
- cria a conta;
- registra os consentimentos obrigatórios;
- inicia a sessão;
- direciona ao onboarding no primeiro acesso;
- direciona à área autenticada nos acessos seguintes.

### Exceções

- e-mail já cadastrado;
- senha inválida;
- confirmação de e-mail pendente, quando aplicável;
- falha de autenticação;
- sessão expirada;
- recuperação de senha.

---

## 4. Etapa 3 — Dados pessoais

### Objetivo do usuário

Completar as informações básicas da conta.

### Dados coletados

- nome completo obrigatório;
- cidade opcional;
- estado opcional.

Não serão coletados no MVP:

- data de nascimento;
- CEP;
- endereço residencial completo.

### Regras

Esses dados:

- não fazem parte do Thin Twin profissional;
- não influenciam o IPP;
- não influenciam o IAO;
- não influenciam a confiança;
- não influenciam recomendações;
- não devem ser enviados desnecessariamente à IA;
- devem permanecer separados do perfil profissional.

---

## 5. Etapa 4 — Envio do currículo

### Objetivo do usuário

Fornecer a principal fonte de sua trajetória profissional.

### Formatos aceitos

- PDF;
- DOCX;
- texto colado.

### Estados

- aguardando envio;
- validando;
- enviando;
- processando;
- concluído;
- conteúdo insuficiente;
- arquivo protegido;
- formato inválido;
- falha de processamento.

### Resultado esperado

O currículo é validado e encaminhado para extração.

---

## 6. Etapa 5 — Envio do LinkedIn

### Objetivo do usuário

Complementar a visão profissional e permitir comparação entre as fontes.

### Formatos aceitos

- PDF exportado;
- texto colado.

A URL poderá ser armazenada como referência, mas não será utilizada como fonte única nem implicará leitura automática do LinkedIn.

### Resultado esperado

O conteúdo é validado e encaminhado para extração.

---

## 7. Etapa 6 — Extração do perfil

### Objetivo do sistema

Transformar currículo e LinkedIn em um perfil profissional estruturado.

### Informações extraídas

- cargos;
- empresas;
- períodos;
- experiências;
- responsabilidades;
- projetos;
- competências;
- ferramentas;
- resultados;
- formação;
- certificações;
- evidências;
- possíveis divergências.

### Estados

- extração iniciada;
- extração concluída;
- extração parcial;
- baixa confiança;
- falha técnica;
- conteúdo insuficiente.

### Resultado esperado

Um rascunho do Thin Twin é criado, com informações rastreáveis às respectivas fontes.

---

## 8. Etapa 7 — Revisão e confirmação

### Objetivo do usuário

Validar o que o sistema entendeu antes de receber análises.

### Ações

- confirma informações;
- corrige informações;
- remove informações;
- adiciona experiências;
- adiciona competências;
- adiciona resultados;
- complementa responsabilidades;
- revisa formação;
- revisa certificações;
- resolve divergências.

### Regra central

Somente informações fornecidas ou confirmadas pelo usuário serão tratadas como fatos profissionais.

### Resultado esperado

Uma versão imutável e confirmada do Thin Twin é criada.

---

## 9. Etapa 8 — Objetivo profissional

### Objetivo do usuário

Definir o contexto das análises.

### Informações

- área de interesse;
- cargo-alvo;
- senioridade desejada.

### Apoio do sistema

Quando necessário, o sistema poderá sugerir até três cargos relacionados às experiências identificadas.

### Limite

O sistema não deve afirmar qual é a carreira ideal para o usuário nem tratar uma sugestão como decisão profissional.

### Resultado esperado

Uma versão do contexto-alvo é confirmada separadamente da versão do Thin Twin.

---

## 10. Etapa 9 — Core 1

### Objetivo do usuário

Compreender como seu perfil está sendo apresentado e o que deve melhorar.

### Ações

- inicia a análise;
- aguarda o processamento;
- consulta o IPP;
- consulta o nível de confiança;
- lê o diagnóstico;
- consulta recomendações;
- analisa sugestões de reformulação;
- seleciona uma ação.

### Resultado esperado

O usuário entende:

- o que está bem comunicado;
- quais informações possuem evidências;
- quais lacunas são observáveis;
- quais problemas são de comunicação ou evidência;
- quais informações permanecem incertas;
- o que deve fazer primeiro.

---

## 11. Etapa 10 — Core 2

### Objetivo do usuário

Compreender sua aderência observável a um cargo ou vaga.

### Possibilidades

- analisar o cargo-alvo, quando existir referência aprovada;
- colar uma descrição de vaga;
- enviar uma vaga em PDF.

### Ações

- informa ou envia os dados da oportunidade;
- revisa e confirma o conteúdo estruturado;
- inicia a análise;
- consulta o IAO;
- consulta o nível de confiança;
- analisa os requisitos;
- consulta lacunas, riscos e possíveis bloqueadores;
- lê a recomendação final.

### Resultado esperado

O usuário entende se deve:

- priorizar a oportunidade agora;
- priorizar com ajustes;
- desenvolver lacunas antes de priorizar;
- não priorizar a oportunidade;
- complementar informações antes de tomar uma decisão.

O resultado não representa probabilidade de entrevista ou contratação.

---

## 12. Etapa 11 — Ações

### Objetivo do usuário

Transformar recomendações em execução.

### Estados da ação

- pendente;
- selecionada;
- em andamento;
- concluída.

### Ações possíveis

- atualizar currículo;
- atualizar LinkedIn;
- complementar uma experiência;
- adicionar evidências;
- melhorar posicionamento;
- desenvolver uma competência;
- analisar uma nova oportunidade.

---

## 13. Etapa 12 — Atualização e reanálise

### Gatilhos

- novo currículo;
- novo LinkedIn;
- correção do Thin Twin;
- nova evidência;
- recomendação concluída;
- mudança de objetivo profissional.

### Resposta do sistema

- cria nova versão do Thin Twin quando houver alteração nos fatos profissionais;
- cria nova versão do contexto-alvo quando houver alteração no objetivo profissional;
- mantém as versões anteriores;
- associa cada análise às versões utilizadas;
- preserva o histórico;
- informa previamente quando a operação consumir crédito.

Falhas técnicas e reprocessamentos não devem consumir créditos.

A gratuidade de reanálise da mesma vaga deverá seguir a regra aprovada no Decision Log e no PRD 03.

---

## 14. Etapa 13 — Feedback

Após cada análise, o sistema poderá perguntar:

### Utilidade

> Quão útil foi esta análise para decidir o que fazer a seguir?
> 

Escala de 1 a 5.

### Especificidade

- sim;
- parcialmente;
- não.

### Complementos

- primeira ação pretendida;
- intenção de candidatura;
- comentário opcional.

---

## 15. Fluxos alternativos

### Usuário recorrente

> Login → Área autenticada → Consultar histórico, atualizar perfil ou iniciar nova análise.
> 

### Atualização do perfil

> Área autenticada → Atualizar currículo ou LinkedIn → Revisar alterações → Criar nova versão do Thin Twin → Reanalisar.
> 

### Alteração do objetivo profissional

> Área autenticada → Atualizar objetivo → Confirmar novo contexto-alvo → Iniciar nova análise.
> 

### Análise de nova vaga

> Área autenticada → Analisar vaga → Enviar descrição → Revisar e confirmar vaga → Core 2.
> 

### Exclusão da conta

> Configurações → Solicitar exclusão → Confirmar solicitação → Processamento da exclusão.
>