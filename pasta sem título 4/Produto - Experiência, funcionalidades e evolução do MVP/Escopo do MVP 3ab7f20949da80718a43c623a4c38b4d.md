# Escopo do MVP

Criado em: 27 de julho de 2026 23:13

## 1. Objetivo do MVP

O MVP do CareerTwin deverá validar se o produto consegue transformar currículo, LinkedIn, objetivo profissional e oportunidades em diagnósticos específicos, explicáveis e acionáveis.

O produto deverá ajudar o usuário a:

- compreender como seu perfil está sendo apresentado;
- melhorar a comunicação do currículo e do LinkedIn;
- comunicar melhor experiências reais;
- identificar lacunas de competência, comunicação ou evidência;
- priorizar ações;
- avaliar a aderência observável a cargos e vagas;
- tomar decisões antes de se candidatar.

O MVP acompanha o usuário até a **preparação e decisão de candidatura**.

---

## 2. Definição resumida

> **O usuário acessa o CareerTwin, cria sua conta, envia currículo e LinkedIn, confirma seu perfil profissional estruturado, define seu objetivo profissional, utiliza o Core 1 para compreender e melhorar seu posicionamento e utiliza o Core 2 para avaliar sua aderência a um cargo ou vaga antes de se candidatar.**
> 

---

## 3. Plataforma e público

| Elemento | Definição |
| --- | --- |
| Plataforma | Aplicação web responsiva |
| Mercado | Brasil |
| Modelo | B2C |
| Público | Profissionais de tecnologia, produto e design |
| Senioridade | Estágio a sênior |
| Idioma | Português do Brasil |
| Jornada coberta | Preparação e decisão de candidatura |

---

## 4. Funcionalidades core

O CareerTwin possui duas funcionalidades core.

### Core 1 — Análise de Perfil

Analisa:

- currículo;
- LinkedIn;
- Thin Twin confirmado;
- contexto do objetivo profissional.

Entrega:

- Índice de Prontidão do Perfil — IPP;
- diagnóstico explicável;
- pontos fortes;
- lacunas observáveis;
- recomendações;
- sugestões de reformulação;
- plano de ações priorizado.

### Core 2 — Diagnóstico de Aderência

Compara o perfil confirmado com:

- um cargo-alvo; ou
- uma vaga específica.

Entrega:

- Índice de Aderência Observável — IAO;
- requisitos atendidos;
- correspondências parciais;
- lacunas de comunicação ou evidência;
- lacunas profissionais observáveis;
- riscos e possíveis bloqueadores;
- recomendação de priorização.

---

## 5. Funcionalidades incluídas

### Aquisição e acesso

- site institucional;
- cadastro com e-mail e senha;
- login;
- logout;
- recuperação de senha;
- área autenticada.

### Onboarding

- nome completo obrigatório;
- cidade e estado opcionais;
- envio de currículo;
- envio do LinkedIn;
- processamento dos materiais;
- revisão das informações extraídas;
- confirmação do Thin Twin;
- definição do objetivo profissional.

### Perfil profissional

- Thin Twin estruturado;
- edição e confirmação dos dados;
- versionamento do perfil;
- versionamento separado do contexto-alvo;
- associação das análises às versões utilizadas;
- atualização de currículo e LinkedIn.

### Core 1

- Análise de Perfil;
- IPP;
- diagnóstico geral;
- recomendações;
- tradução da experiência;
- plano de ações.

### Core 2

- análise por cargo-alvo;
- envio de vaga;
- estruturação da oportunidade;
- IAO;
- diagnóstico dos requisitos;
- recomendação de priorização.

### Funcionalidades de apoio

- dashboard;
- histórico;
- ações pendentes, em andamento e concluídas;
- reanálise;
- feedback;
- créditos simulados;
- intenção de compra;
- configurações da conta;
- solicitação de exclusão.

---

## 6. Fora do escopo

Não fazem parte do MVP:

- busca automática de vagas;
- scraping do LinkedIn;
- leitura automática de qualquer URL;
- candidatura automática;
- tracker de candidaturas;
- preparação para entrevistas;
- simulador de entrevistas;
- networking;
- mensagens para recrutadores;
- negociação de ofertas;
- acompanhamento após contratação;
- coaching humano;
- edição direta do currículo;
- edição direta do LinkedIn;
- geração completa e exportação de currículo;
- aplicativo mobile nativo;
- B2B ou B2B2C;
- pagamento real;
- assinatura recorrente;
- integração com plataformas de cursos;
- comparação entre usuários;
- ranking;
- gamificação;
- orientação vocacional completa.

---

## 7. Experiência gratuita

O usuário terá acesso a:

- uma Análise de Perfil completa;
- uma análise de vaga específica;
- recomendações;
- plano de ações;
- dashboard;
- histórico;
- reanálise durante o piloto, conforme as regras aprovadas no Decision Log e no PRD 03.

---

## 8. Oferta simulada

O MVP apresentará uma oferta sem cobrança real.

### Pacote Novas Oportunidades

| Item | Hipótese |
| --- | --- |
| Conteúdo | Cinco créditos para análises de vagas |
| Preço | R$ 29,90 |
| Validade | 30 dias |
| Pagamento real | Não será implementado |
| Dados de cartão | Não serão coletados |
| Conversão medida | Intenção explícita de compra |

Preço, quantidade de créditos e validade permanecem como hipóteses de validação.

---

## 9. Critérios gerais de sucesso

O MVP deverá permitir que o usuário:

- compreenda a proposta do CareerTwin;
- crie uma conta;
- conclua o onboarding;
- envie currículo e LinkedIn;
- revise e confirme o Thin Twin;
- defina o objetivo profissional;
- conclua o Core 1;
- compreenda o IPP e seu nível de confiança;
- selecione pelo menos uma ação;
- envie uma vaga;
- conclua o Core 2;
- compreenda o IAO e seu nível de confiança;
- utilize a análise para apoiar uma decisão;
- consulte o histórico;
- atualize o perfil;
- realize uma reanálise;
- envie feedback;
- registre intenção de compra;
- solicite exclusão da conta.

---

## 10. Critérios de qualidade

O MVP não estará pronto quando houver:

- invenção factual crítica;
- análise associada ao usuário errado;
- score sem explicação ou sem confiança separada;
- falha no fluxo principal;
- exposição indevida de dados;
- perda do vínculo entre análise, versão do perfil e versão do objetivo;
- ausência dos eventos essenciais de analytics;
- falha na exclusão dos arquivos temporários;
- impossibilidade de corrigir informações extraídas.