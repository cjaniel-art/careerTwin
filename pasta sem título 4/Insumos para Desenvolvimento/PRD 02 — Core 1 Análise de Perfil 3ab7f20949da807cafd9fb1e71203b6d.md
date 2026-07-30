# PRD 02 — Core 1: Análise de Perfil

Criado em: 27 de julho de 2026 23:16

> **Módulo responsável por transformar o Thin Twin confirmado e o contexto-alvo versionado em um diagnóstico explicável sobre currículo, LinkedIn, posicionamento, evidências e prioridades de evolução.**
> 

---

## Papel deste documento

Este PRD detalha os requisitos funcionais, regras de negócio, contratos, estados, eventos, critérios de aceite e decisões de implementação do **Core 1 — Análise de Perfil**.

O Core 1 começa quando o usuário:

- possui conta ativa;
- possui sessão autenticada;
- concluiu o PRD 01;
- confirmou uma versão do Thin Twin;
- definiu área de interesse, cargo-alvo e senioridade desejada.

As etapas anteriores são regidas por:

- **PRD 00 — Site Público, Home/LP e Autenticação**;
- **PRD 01 — Onboarding e Perfil**.

A análise de aderência a cargo ou vaga é regida por:

- **PRD 03 — Core 2: Diagnóstico de Aderência**.

As fórmulas, rubricas, pesos, faixas, regras de confiança e contratos do motor são definidos por:

- **CareerTwin — Motor de Análise e Scores**.

Este documento deve ser implementado em conjunto com:

- **CareerTwin — Fonte Canônica de Contexto vigente**;
- **CareerTwin — Product One Page**;
- **CareerTwin — Prompts e Schemas**;
- **CareerTwin — Guardrails**;
- **CareerTwin — Modelo de Dados**;
- **CareerTwin — Arquitetura**;
- **CareerTwin — Privacidade e Segurança**;
- **CareerTwin — Analytics**;
- **CareerTwin — Qualidade e Casos de Teste**;
- **CareerTwin — Style Guide para Claude Code**;
- **Design System baseado em shadcn/ui**;
- **Decision Log**.

Em caso de divergência, deve ser aplicada a regra de precedência definida na Product One Page.

Nenhuma regra do motor poderá ser alterada silenciosamente no código.

---

## 1. Resumo

| Item | Definição |
| --- | --- |
| Nome | Core 1 — Análise de Perfil |
| Identificador | PRD 02 |
| Usuário | Profissional autenticado com onboarding concluído |
| Objetivo | Diagnosticar a prontidão observável do perfil e priorizar melhorias |
| Entrada | Thin Twin confirmado e contexto-alvo versionado |
| Score | Índice de Prontidão do Perfil — IPP |
| Confiança | Calculada separadamente do IPP |
| Saída | Diagnóstico, recomendações e plano de evolução |
| Dependência | PRD 00 e PRD 01 concluídos |
| Desbloqueia | Ações de melhoria, reanálise e continuidade para o Core 2 |
| Plataforma | Aplicação web responsiva |
| Idioma | Português do Brasil |
| Design System | shadcn/ui com tokens CareerTwin |
| Limite de recomendações | Até 8 |
| Recomendações destacadas | Até 3 |
| Limite do plano de ações | Até 5 |
| Processamento | Assíncrono, determinístico, versionado e auditável |

---

## 2. Problema

O usuário frequentemente não sabe:

- como seu perfil está sendo apresentado;
- se currículo e LinkedIn comunicam o mesmo posicionamento;
- quais experiências estão genéricas;
- quais competências estão apenas declaradas;
- quais informações precisam de evidência;
- quais inconsistências existem entre as fontes;
- se o objetivo profissional está claro;
- se o perfil comunica a senioridade desejada;
- quais lacunas exigem desenvolvimento;
- quais problemas podem ser resolvidos por comunicação;
- o que deve ser corrigido primeiro.

Ferramentas genéricas costumam entregar listas extensas, sugestões sem contexto ou notas que não explicam como foram calculadas.

O CareerTwin precisa transformar informações confirmadas em um diagnóstico:

- específico;
- explicável;
- rastreável;
- seguro;
- proporcional ao objetivo;
- executável;
- sem inventar experiências ou resultados.

---

## 3. Objetivo

Gerar uma análise explicável e acionável sobre:

- clareza do objetivo profissional;
- qualidade das experiências;
- evidências e resultados;
- competências e ferramentas;
- consistência entre currículo e LinkedIn;
- posicionamento profissional;
- completude do perfil;
- comunicação da trajetória;
- prioridades de evolução.

Permitir que o usuário:

- compreenda seu IPP;
- visualize o nível de confiança;
- entenda como cada dimensão afetou o score;
- identifique forças;
- identifique lacunas;
- diferencie competência, comunicação, evidência e posicionamento;
- receba sugestões de reformulação;
- selecione ações;
- acompanhe o progresso;
- envie feedback;
- atualize o perfil;
- realize reanálise.

---

## 4. Limite de responsabilidade

Este PRD cobre:

- início da Análise de Perfil;
- validação das pré-condições;
- congelamento das versões de entrada;
- interpretação das informações profissionais;
- cálculo determinístico do IPP;
- cálculo separado do nível de confiança;
- diagnóstico geral;
- pontos fortes;
- fragilidades;
- inconsistências;
- recomendações;
- tradução da experiência;
- priorização;
- plano de evolução;
- seleção e acompanhamento de ações;
- histórico da análise;
- feedback;
- reanálise.

Este PRD não cobre:

- criação de conta;
- autenticação;
- onboarding;
- extração de arquivos;
- edição do Thin Twin;
- cálculo do IAO;
- análise de vaga;
- recomendação de candidatura;
- busca de vagas;
- edição direta de currículo;
- edição direta do LinkedIn;
- geração completa de currículo;
- preparação para entrevista;
- pagamento real;
- assinatura;
- coaching humano.

---

## 5. Princípios obrigatórios

### Autenticidade

O Core 1 utilizará somente:

- informações presentes em fontes válidas;
- informações estruturadas no Thin Twin;
- informações confirmadas pelo usuário;
- contexto-alvo confirmado e versionado.

O sistema não pode:

- inventar experiências;
- criar métricas;
- criar resultados;
- adicionar responsabilidades;
- atribuir ferramentas não informadas;
- atribuir certificações;
- elevar senioridade;
- transformar colaboração em liderança;
- transformar participação em responsabilidade integral.

### Explicabilidade

Toda conclusão relevante deverá responder:

1. o que foi identificado;
2. qual dimensão foi afetada;
3. qual evidência sustenta a conclusão;
4. como isso influenciou o score;
5. qual ação é recomendada.

### Observabilidade

Ausência de evidência não significa ausência de competência.

Utilizar:

- “não observado nos materiais”;
- “não confirmado”;
- “pouco evidenciado”;
- “requer complemento do usuário”.

Evitar:

- “você não possui”;
- “você não sabe”;
- “você não tem experiência”;

salvo quando o usuário tiver confirmado explicitamente a ausência.

### Não discriminação

Não podem influenciar IPP, confiança, recomendações ou prioridades:

- nome;
- cidade;
- estado;
- idade;
- gênero;
- raça ou etnia;
- fotografia;
- estado civil;
- religião;
- orientação sexual;
- condição de saúde;
- deficiência;
- qualquer atributo sensível ou protegido.

### Linguagem segura

O Core 1 não deve afirmar:

- que o usuário será contratado;
- que o usuário possui determinada chance de contratação;
- que o IPP mede empregabilidade;
- que o IPP mede valor profissional;
- que uma recomendação garante entrevista;
- que uma carreira é ideal ou definitiva.

---

## 6. Usuários e estados de acesso

### Usuário elegível

Possui:

- conta ativa;
- sessão autenticada;
- onboarding concluído;
- Thin Twin confirmado;
- contexto-alvo válido e versionado.

Pode:

- iniciar o Core 1;
- visualizar análises anteriores;
- acompanhar ações;
- atualizar o perfil;
- realizar reanálise conforme a política vigente.

### Usuário com dados insuficientes

Possui sessão válida, mas alguma pré-condição está ausente ou inválida.

Pode:

- visualizar o que está faltando;
- retornar ao PRD 01;
- corrigir o perfil ou o contexto-alvo.

Não pode gerar análise definitiva.

### Usuário com análise em andamento

Pode:

- sair da página;
- retornar posteriormente;
- acompanhar o estado;
- visualizar a análise anterior, quando existir.

Não pode iniciar análise idêntica em paralelo.

### Usuário com análise concluída

Pode:

- visualizar o relatório;
- consultar evidências;
- selecionar recomendações;
- iniciar ou concluir ações;
- copiar sugestões;
- enviar feedback;
- iniciar reanálise quando elegível.

---

## 7. Pré-condições

Para iniciar o Core 1, devem existir:

- conta ativa;
- sessão autenticada;
- onboarding concluído;
- currículo válido no histórico do perfil;
- LinkedIn válido no histórico do perfil;
- Thin Twin confirmado;
- `thin_twin_version` válida;
- área de interesse definida;
- cargo-alvo definido;
- senioridade desejada definida;
- `target_context_version` válida;
- ausência de conflito crítico não resolvido;
- versão ativa do motor;
- versão ativa da rubrica;
- consentimentos obrigatórios válidos.

Quando uma pré-condição estiver ausente:

```
analysis_status = "insufficient_data"
```

O sistema deverá informar exatamente o que falta e apresentar a ação de correção adequada.

O MVP não gerará análise definitiva com Thin Twin provisório.

---

## 8. Entradas

### Entradas profissionais

- versão confirmada do Thin Twin;
- experiências;
- projetos;
- competências;
- ferramentas;
- resultados;
- evidências;
- formação;
- certificações;
- inconsistências registradas;
- senioridade observável;
- currículo estruturado;
- LinkedIn estruturado.

### Contexto-alvo

- área de interesse;
- cargo-alvo;
- especialidade, quando aplicável;
- senioridade desejada;
- versão do contexto-alvo.

### Metadados obrigatórios

- usuário;
- versão do Thin Twin;
- versão do contexto-alvo;
- versão do motor;
- versão da rubrica;
- versão do prompt;
- versão do schema;
- versão da configuração;
- idioma;
- data e hora da solicitação.

### Dados proibidos

Não devem ser enviados ao motor:

- nome;
- cidade;
- estado;
- e-mail;
- tokens;
- credenciais;
- arquivos originais;
- atributos sensíveis;
- identificadores desnecessários.

---

## 9. Fluxo principal

1. O usuário acessa o Core 1.
2. O sistema verifica autenticação e autorização.
3. O sistema verifica as pré-condições.
4. O sistema apresenta o contexto da análise.
5. O usuário inicia a análise.
6. O sistema cria uma solicitação idempotente.
7. O sistema congela as versões do Thin Twin e do contexto-alvo.
8. O sistema registra as versões do motor, rubrica, prompt, schema e configuração.
9. A IA interpreta e classifica as informações.
10. O backend valida a estrutura intermediária.
11. O backend aplica a rubrica.
12. O backend calcula o IPP.
13. O backend calcula a confiança separadamente.
14. O motor identifica forças e lacunas.
15. O motor gera recomendações.
16. O backend calcula a prioridade.
17. O motor gera até cinco ações.
18. O sistema valida autenticidade e completude.
19. O sistema persiste o resultado.
20. O usuário visualiza o relatório.
21. O usuário seleciona uma recomendação ou ação.
22. O sistema solicita feedback.
23. O usuário poderá atualizar o perfil e realizar reanálise.

---

## 10. Arquitetura do motor

O motor será híbrido.

### Responsabilidade da IA

A IA poderá:

- interpretar;
- classificar;
- resumir;
- identificar padrões;
- mapear evidências;
- propor recomendações;
- sugerir reformulações;
- redigir explicações.

### Responsabilidade do backend

O backend deverá:

- validar entradas;
- congelar versões;
- validar schemas;
- aplicar rubricas;
- calcular o IPP;
- calcular a confiança;
- calcular prioridades;
- aplicar limites e regras determinísticas;
- bloquear saídas inválidas;
- persistir versões;
- registrar auditoria.

### Regra

A IA não poderá atribuir livremente uma nota de zero a cem.

A IA produzirá níveis de rubrica estruturados. O backend converterá os níveis em scores e aplicará os pesos.

---

## 11. Máquina de estados da análise

```
typeProfileAnalysisStatus=|"ready"|"validating_inputs"|"queued"|"interpreting"|"scoring"|"generating_recommendations"|"validating_output"|"completed"|"insufficient_data"|"failed_retryable"|"failed_final";
```

Esses estados representam o contrato funcional deste PRD e devem possuir mapeamento explícito para o enum canônico do Modelo de Dados.

Estados técnicos de job não devem substituir silenciosamente os estados funcionais da análise.

### RF-C1-001

O sistema deve persistir o estado da análise.

### RF-C1-002

A interface deve refletir o estado do backend.

### RF-C1-003

O usuário deve poder sair enquanto a análise estiver em andamento.

### RF-C1-004

O processamento deve continuar sem a página aberta.

### RF-C1-005

O usuário não deve iniciar duas análises idênticas simultaneamente.

### RF-C1-006

Falhas recuperáveis devem permitir nova tentativa.

### RF-C1-007

Falhas técnicas não devem consumir créditos.

---

## 12. Idempotência, fila e retentativas

### Chave de idempotência

```
userId
+ thinTwinVersion
+ targetContextVersion
+ motorVersion
+ rubricVersion
+ promptVersion
+ schemaVersion
+ configVersion
```

### Configuração inicial

- processamento assíncrono;
- fila durável;
- uma análise ativa por chave;
- timeout máximo por tentativa de 5 minutos;
- três tentativas automáticas;
- fila de mensagens com falha;
- checkpoints entre etapas.

### Retentativas

| Tentativa | Intervalo |
| --- | --- |
| Primeira | 15 segundos |
| Segunda | 60 segundos |
| Terceira | 5 minutos |
| Após a terceira falha | DLQ |

### RF-C1-008

Uma repetição não deve criar análises duplicadas.

### RF-C1-009

Uma repetição não deve gerar ações duplicadas.

### RF-C1-010

Uma repetição não deve consumir créditos adicionais.

### RF-C1-011

Uma análise concluída deve ser reutilizada quando todas as versões de entrada forem idênticas, salvo solicitação explícita e autorizada de nova execução.

---

## 13. Índice de Prontidão do Perfil — IPP

### Finalidade

O IPP mede a prontidão observável do perfil para comunicar:

- objetivo;
- experiências;
- competências;
- ferramentas;
- evidências;
- posicionamento;
- consistência entre currículo e LinkedIn.

O IPP não mede:

- valor profissional;
- empregabilidade;
- probabilidade de entrevista;
- probabilidade de contratação;
- aderência a vaga específica.

### Dimensões e pesos operacionais

| Dimensão | Peso |
| --- | --- |
| Clareza do objetivo profissional | 15% |
| Qualidade das experiências | 20% |
| Evidências e resultados | 20% |
| Competências e ferramentas | 15% |
| Consistência entre fontes | 10% |
| Qualidade do posicionamento | 10% |
| Completude do perfil | 10% |
| **Total** | **100%** |

Estes pesos seguem o documento **CareerTwin — Motor de Análise e Scores** e devem permanecer configuráveis e versionados.

### Escala por dimensão

Cada dimensão receberá nível de zero a quatro:

| Nível | Interpretação |
| --- | --- |
| 0 | Não observado ou material insuficiente |
| 1 | Muito fraco, genérico ou inconsistente |
| 2 | Parcialmente adequado |
| 3 | Adequado e claro |
| 4 | Forte, específico, consistente e sustentado |

Conversão:

```
dimensionScore= (rubricLevel/4)*100;
```

### Fórmula

```
IPP=Math.round(objectiveClarity*0.15+experienceQuality*0.20+evidenceAndResults*0.20+skillsAndTools*0.15+crossSourceConsistency*0.10+positioningQuality*0.10+profileCompleteness*0.10
);
```

Cada dimensão deverá estar na escala de zero a cem.

### Faixas

| Score | Nível |
| --- | --- |
| 0–39 | Baixa prontidão observável |
| 40–59 | Prontidão em desenvolvimento |
| 60–79 | Boa prontidão observável |
| 80–100 | Alta prontidão observável |

---

## 14. Rubrica das dimensões

### 14.1 Clareza do objetivo profissional

**Nível 0**

- cargo-alvo ausente;
- área e senioridade indefinidas;
- objetivo impossível de interpretar.

**Nível 1**

- objetivo amplo;
- múltiplos cargos desconectados;
- expressão genérica como “em busca de oportunidade”.

**Nível 2**

- cargo definido;
- especialidade ou senioridade pouco claras.

**Nível 3**

- cargo, área e senioridade coerentes;
- objetivo compreensível.

**Nível 4**

- objetivo específico;
- coerente com as experiências;
- claramente comunicado nos materiais.

### 14.2 Qualidade das experiências

**Nível 0**

- experiências ausentes ou ilegíveis.

**Nível 1**

- listas genéricas;
- verbos vagos;
- ausência de contexto.

**Nível 2**

- responsabilidades compreensíveis;
- pouca especificidade.

**Nível 3**

- contexto, atuação e entregas claros.

**Nível 4**

- descrições específicas;
- contribuição clara;
- alinhamento com o objetivo.

### 14.3 Evidências e resultados

**Nível 0**

- nenhuma evidência observável.

**Nível 1**

- afirmações sem exemplo, contexto ou entrega.

**Nível 2**

- algumas entregas, projetos ou resultados qualitativos.

**Nível 3**

- evidências consistentes em experiências relevantes.

**Nível 4**

- evidências claras;
- sustentadas no contexto;
- alinhadas ao objetivo;
- sem métricas inventadas.

### 14.4 Competências e ferramentas

**Nível 0**

- competências não observadas.

**Nível 1**

- lista genérica sem contexto.

**Nível 2**

- competências presentes, mas pouco conectadas às experiências.

**Nível 3**

- competências explicitadas e contextualizadas.

**Nível 4**

- competências e ferramentas sustentadas por experiências ou projetos.

### 14.5 Consistência entre currículo e LinkedIn

**Nível 0**

- fontes insuficientes para avaliar consistência; ou
- inconsistência material que impeça uma leitura confiável.

Conflitos críticos não resolvidos devem bloquear o início da análise conforme as pré-condições.

**Nível 1**

- múltiplas divergências de cargo, empresa ou período.

**Nível 2**

- pequenas divergências;
- informações desatualizadas;
- fontes excessivamente repetidas.

**Nível 3**

- fontes majoritariamente consistentes.

**Nível 4**

- fontes consistentes, atualizadas e complementares.

### 14.6 Qualidade do posicionamento

**Nível 0**

- posicionamento ausente.

**Nível 1**

- perfil genérico ou desconectado do objetivo.

**Nível 2**

- posicionamento parcialmente reconhecível.

**Nível 3**

- proposta profissional clara e coerente.

**Nível 4**

- especialidade, contribuição, senioridade observável e diferenciais claros.

### 14.7 Completude das informações

**Nível 0**

- dados essenciais ausentes.

**Nível 1**

- experiências, formação ou períodos incompletos.

**Nível 2**

- estrutura básica preenchida.

**Nível 3**

- informações necessárias presentes.

**Nível 4**

- perfil completo, revisado, confirmado e rastreável.

---

## 15. Requisitos funcionais — IPP

### RF-C1-012

O sistema deve calcular o IPP no backend.

### RF-C1-013

A IA não deve produzir diretamente o score final.

### RF-C1-014

O sistema deve apresentar o IPP em escala de zero a cem.

### RF-C1-015

O sistema deve apresentar a faixa correspondente.

### RF-C1-016

O sistema deve apresentar cada dimensão separadamente.

### RF-C1-017

Cada dimensão deve apresentar:

- score;
- nível da rubrica;
- justificativa;
- evidências;
- impacto no IPP;
- ação relacionada, quando aplicável.

### RF-C1-018

O sistema deve apresentar a principal força.

### RF-C1-019

O sistema deve apresentar a principal lacuna.

### RF-C1-020

O sistema deve apresentar a próxima melhor ação.

### RF-C1-021

O sistema deve apresentar disclaimer sobre o significado do IPP.

---

## 16. Nível de confiança

A confiança será calculada separadamente do IPP.

### Componentes

| Componente | Peso |
| --- | --- |
| Completude das entradas | 30% |
| Confirmação do usuário | 30% |
| Rastreabilidade das evidências | 25% |
| Consistência entre fontes | 15% |
| **Total** | **100%** |

### Fórmula

```
confidenceScore=inputCompleteness*0.30+userConfirmation*0.30+evidenceTraceability*0.25+sourceConsistency*0.15;
```

Cada componente deverá estar entre zero e um.

### Faixas

| Score | Nível |
| --- | --- |
| 0,00–0,49 | Baixa confiança |
| 0,50–0,79 | Média confiança |
| 0,80–1,00 | Alta confiança |

### RF-C1-022

A confiança deve ser apresentada separadamente do IPP.

### RF-C1-023

A confiança não deve alterar matematicamente o IPP.

### RF-C1-024

O sistema deve explicar os motivos do nível de confiança.

### RF-C1-025

O sistema deve informar dados ausentes.

### RF-C1-026

O sistema deve informar conflitos relevantes.

### RF-C1-027

Baixa confiança deve gerar aviso de análise preliminar.

### RF-C1-028

Score alto com confiança baixa não deve produzir linguagem definitiva.

---

## 17. Tipos de lacuna utilizados pelo Core 1

O Core 1 deverá identificar:

### Competência

Utilizar quando:

- uma habilidade relevante precisa ser desenvolvida; e
- a ausência foi confirmada pelo usuário.

Sem confirmação, usar:

> Competência não observada nos materiais.
> 

### Comunicação

Utilizar quando:

- a experiência existe;
- a descrição está genérica;
- faltam contexto, escopo ou clareza;
- o problema pode ser corrigido sem desenvolver nova competência.

### Evidência

Utilizar quando:

- a competência ou entrega é declarada;
- falta exemplo, projeto, contexto ou resultado.

### Posicionamento

Utilizar quando:

- área, cargo, especialidade ou senioridade estão confusos;
- currículo e LinkedIn comunicam propostas diferentes;
- o título profissional não permite reconhecer o objetivo.

### Desconhecida

Utilizar quando os dados são insuficientes para classificar com segurança.

O Core 1 não deve forçar uma classificação.

---

## 18. Estrutura do relatório

### 18.1 Cabeçalho

- título da análise;
- data;
- status;
- versão do perfil;
- versão do contexto-alvo;
- nível de confiança;
- ação para acessar evidências.

### 18.2 Resumo executivo

- IPP;
- faixa do IPP;
- diagnóstico geral;
- principal força;
- principal lacuna;
- próxima ação recomendada;
- disclaimer.

### 18.3 Dimensões do IPP

Para cada dimensão:

- score;
- interpretação;
- evidências;
- justificativa;
- impacto;
- recomendação relacionada.

### 18.4 Pontos fortes

- elementos bem comunicados;
- competências evidenciadas;
- experiências relevantes;
- consistências entre fontes;
- posicionamento reconhecível.

### 18.5 Fragilidades e lacunas

- descrições genéricas;
- inconsistências;
- falta de evidência;
- posicionamento pouco claro;
- incompletude;
- dados insuficientes.

### 18.6 Recomendações

- currículo;
- LinkedIn;
- posicionamento;
- evidências;
- competências.

### 18.7 Tradução da experiência

- texto original;
- problema identificado;
- competências implícitas;
- sugestão de reformulação;
- termos reconhecidos pelo mercado;
- evidências;
- alerta de autenticidade.

### 18.8 Plano de evolução

Até cinco ações distribuídas entre:

- ação imediata;
- próximos sete dias;
- próximos 30 dias.

### 18.9 Próximos passos

- atualizar currículo;
- atualizar LinkedIn;
- complementar evidências;
- revisar o Thin Twin;
- realizar reanálise;
- avançar para o Core 2.

---

## 19. Contrato do resultado do IPP

```
typeIppResult= {
  score:number;
  level:|"baixa_prontidao"|"em_desenvolvimento"|"boa_prontidao"|"alta_prontidao";
  confidence:ConfidenceResult;
  dimensions:IppDimensionResult[];
  mainStrength:string;
  mainGap:string;
  nextBestAction:string;
  evidenceRefs:EvidenceReference[];
  disclaimer:string;
};
```

```
typeIppDimensionResult= {
  dimension:|"objective_clarity"|"experience_quality"|"evidence_and_results"|"skills_and_tools"|"cross_source_consistency"|"positioning_quality"|"profile_completeness";
  rubricLevel:0|1|2|3|4;
  score:number;
  weight:number;
  weightedContribution:number;
  reasoning:string;
  evidenceRefs:EvidenceReference[];
  relatedRecommendationIds:string[];
};
```

```
typeConfidenceResult= {
  score:number;
  level:"low"|"medium"|"high";
  reasons:string[];
  missingInformation:string[];
  conflicts:SourceConflict[];
};
```

---

## 20. Recomendações

### Categorias canônicas

```
typeRecommendationCategory=|"competencia"|"comunicacao"|"evidencia"|"posicionamento";
```

### Estrutura

```
typeRecommendation= {
  id:string;
  category:RecommendationCategory;
  title:string;
  problem:string;
  suggestedAction:string;
  reasoning:string;
  evidenceRefs:EvidenceReference[];
  impact:1|2|3|4|5;
  effort:1|2|3|4|5;
  urgency:1|2|3|4|5;
  confidence:1|2|3|4|5;
  priorityScore:number;
  priorityOrder:number;
  completionCriteria:string;
  status:"pending"|"in_progress"|"completed";
};
```

A IA poderá propor:

- categoria;
- problema;
- ação;
- justificativa;
- evidências;
- impacto;
- esforço;
- urgência;
- confiança.

O backend deverá:

- validar os valores;
- calcular `priorityScore`;
- determinar `priorityOrder`;
- consolidar duplicidades;
- persistir o resultado final.

### RF-C1-029

O Core 1 deve gerar no máximo oito recomendações.

### RF-C1-030

O relatório deve destacar no máximo três recomendações.

### RF-C1-031

Cada recomendação deve possuir:

- categoria;
- problema;
- justificativa;
- evidência ou ausência de evidência;
- ação;
- impacto;
- esforço;
- urgência;
- confiança;
- prioridade;
- critério de conclusão.

### RF-C1-032

Recomendações duplicadas devem ser consolidadas.

### RF-C1-033

Recomendações com a mesma causa raiz devem ser agrupadas.

### RF-C1-034

O sistema deve evitar listas genéricas ou excessivamente longas.

### RF-C1-035

O usuário deve poder visualizar as evidências.

### RF-C1-036

O usuário deve poder selecionar uma recomendação.

### RF-C1-037

O usuário deve poder alterar o status para pendente, em andamento ou concluída.

---

## 21. Priorização

Impacto, urgência, esforço e confiança utilizarão escala de um a cinco.

### Fórmula

```
effortBenefit=6-effort;priorityScore=impact*0.40+urgency*0.25+effortBenefit*0.20+confidence*0.15;priorityScore100=Math.round((priorityScore/5)*100);
```

### Ordenação

1. `priorityScore100` decrescente;
2. impacto decrescente;
3. esforço crescente;
4. confiança decrescente.

### RF-C1-038

O cálculo da prioridade deve ocorrer no backend.

### RF-C1-039

Os pesos devem ser configuráveis e versionados.

### RF-C1-040

A interface não precisa exibir a fórmula completa por padrão, mas deve permitir compreender os fatores.

### RF-C1-041

A prioridade não pode ser definida apenas pela ordem de geração da IA.

---

## 22. Tradução da experiência

A tradução da experiência melhora a comunicação sem criar conteúdo novo.

### Estrutura

```
typeExperienceTranslation= {
  originalText:string;
  identifiedIssue:string;
  implicitSkills:string[];
  suggestedText:string;
  marketTerms:string[];
  evidenceRefs:EvidenceReference[];
  authenticityWarning?:string;
};
```

### Validação obrigatória

Antes de entregar uma sugestão, verificar:

- todas as responsabilidades aparecem nas fontes;
- nenhuma ferramenta foi adicionada;
- nenhuma métrica foi criada;
- nenhuma senioridade foi ampliada;
- nenhum resultado foi presumido;
- o texto não altera o papel real.

### RF-C1-042

O sistema deve apresentar o texto original.

### RF-C1-043

O sistema deve explicar o problema identificado.

### RF-C1-044

O sistema pode apresentar competências implícitas como hipótese.

### RF-C1-045

Competências implícitas não devem ser armazenadas como fatos sem confirmação.

### RF-C1-046

O sistema deve apresentar a sugestão de reformulação.

### RF-C1-047

O sistema deve apresentar as evidências utilizadas.

### RF-C1-048

O usuário deve poder copiar a sugestão.

### RF-C1-049

A cópia não deve editar automaticamente currículo ou LinkedIn.

### RF-C1-050

Quando a sugestão for mais específica que o texto original, exibir:

> Use esta sugestão somente se ela representar com precisão uma atividade que você realmente realizou.
> 

---

## 23. Plano de evolução

O plano poderá conter até cinco ações.

### Horizontes

- imediata;
- próximos sete dias;
- próximos 30 dias.

### Tipos

```
typeActionType=|"update_resume"|"update_linkedin"|"improve_positioning"|"detail_experience"|"organize_evidence"|"develop_skill"|"build_project"|"analyze_job";
```

### Estrutura

```
typeEvolutionAction= {
  id:string;
  title:string;
  description:string;
  type:ActionType;
  priority:"high"|"medium"|"low";
  timeframe:"immediate"|"7_days"|"30_days";
  successCriteria:string;
  sourceRecommendationIds:string[];
  status:"pending"|"in_progress"|"completed";
};
```

### RF-C1-051

Cada ação deve ser específica e executável.

### RF-C1-052

Cada ação deve estar ligada a pelo menos uma recomendação.

### RF-C1-053

Cada ação deve possuir critério de sucesso.

### RF-C1-054

O usuário deve poder iniciar e concluir ações.

### RF-C1-055

Alterar o status de uma ação não deve consumir crédito.

### RF-C1-056

Ações concluídas devem permanecer no histórico.

---

## 24. Histórico e versionamento

Cada análise deverá registrar:

```
typeProfileAnalysisMetadata= {
  analysisId:string;
  userId:string;
  thinTwinVersion:number;
  targetContextVersion:number;
  motorVersion:string;
  rubricVersion:string;
  promptVersion:string;
  schemaVersion:string;
  configVersion:string;
  createdAt:string;
  completedAt?:string;
  status:ProfileAnalysisStatus;
};
```

### RF-C1-057

Cada análise deve estar associada à versão do Thin Twin utilizada.

### RF-C1-058

Cada análise deve estar associada à versão do contexto-alvo utilizada.

### RF-C1-059

Cada análise deve registrar versão do motor, rubrica, prompt, schema e configuração.

### RF-C1-060

Análises anteriores não devem ser sobrescritas.

### RF-C1-061

Alterações futuras do perfil não devem modificar resultados anteriores.

### RF-C1-062

O usuário deve poder acessar relatórios anteriores.

### RF-C1-063

Abrir novamente um relatório não deve consumir crédito.

---

## 25. Reanálise

O usuário poderá realizar reanálise após:

- atualizar currículo;
- atualizar LinkedIn;
- corrigir o Thin Twin;
- adicionar evidências;
- adicionar experiência ou projeto;
- concluir recomendações;
- alterar o contexto-alvo;
- receber uma nova versão do motor autorizada.

### Regras

- a reanálise gera novo relatório;
- o relatório anterior permanece disponível;
- o novo relatório utiliza versões atualizadas;
- scores não são sobrescritos;
- diferenças devem ser comparáveis;
- falhas técnicas não consomem crédito;
- durante o piloto, a reanálise do Core 1 não consumirá créditos de análise de vaga;
- a política futura de monetização deverá ser configurável.

### RF-C1-064

O sistema deve informar quais versões serão utilizadas.

### RF-C1-065

O sistema deve informar se nenhuma alteração relevante foi identificada.

### RF-C1-066

O sistema deve impedir reanálises idênticas em paralelo.

### RF-C1-067

O sistema deve preservar histórico e diferenças.

### RF-C1-068

A comparação poderá apresentar:

- variação do IPP;
- variação por dimensão;
- ações concluídas;
- novas forças;
- lacunas resolvidas;
- novas lacunas.

---

## 26. Feedback

Após a análise, o usuário poderá avaliar:

### Utilidade

Escala de um a cinco:

- 1 — nada útil;
- 2 — pouco útil;
- 3 — parcialmente útil;
- 4 — útil;
- 5 — muito útil.

### Especificidade

- sim;
- parcialmente;
- não.

### Campos adicionais

- primeira ação pretendida;
- comentário opcional.

### RF-C1-069

O usuário deve poder enviar feedback uma vez por versão da análise.

### RF-C1-070

O usuário deve poder atualizar o feedback enquanto a política configurada permitir.

### RF-C1-071

O feedback não deve alterar retroativamente o score.

### RF-C1-072

O comentário não deve ser utilizado como fato profissional sem confirmação e incorporação ao Thin Twin.

### RF-C1-073

O sistema deve registrar a análise avaliada.

---

## 27. Créditos

### Regras do MVP

- a primeira utilização do Core 1 faz parte da experiência gratuita;
- falha técnica não consome crédito;
- reprocessamento por falha não consome crédito;
- abrir relatório não consome crédito;
- selecionar ou atualizar ações não consome crédito;
- copiar sugestão não consome crédito;
- durante o piloto, reanálise do Core 1 permanece disponível sem consumir créditos de vaga.

A política futura do Core 1 deverá ser configurável e não poderá ser codificada de forma irreversível.

### RF-C1-074

O sistema deve registrar no ledger qualquer reserva, consumo, restauração ou ajuste aplicável.

O não consumo causado por falha técnica deverá permanecer registrado na auditoria.

### RF-C1-075

Nenhuma falha técnica deve reduzir o saldo.

### RF-C1-076

O usuário deve ser informado antes de qualquer operação futura que possa consumir crédito.

---

## 28. Layout da interface

### Página de entrada

Deve apresentar:

- objetivo da análise;
- materiais e versões utilizadas;
- pré-condições;
- estimativa de etapas, sem prometer tempo exato;
- CTA para iniciar;
- link para revisar o perfil.

### Processamento

Deve apresentar:

- estado atual;
- mensagem clara;
- possibilidade de sair;
- preservação do progresso;
- acesso a relatório anterior, quando existir.

### Relatório — desktop

- cabeçalho da análise;
- resumo executivo;
- cards de IPP e confiança;
- navegação lateral ou por âncoras;
- dimensões;
- forças;
- lacunas;
- recomendações;
- tradução da experiência;
- plano;
- feedback.

### Relatório — mobile

- fluxo vertical;
- cards empilhados;
- navegação resumida;
- evidências em Sheet;
- ações fixas somente quando necessárias.

### Componentes shadcn/ui

Utilizar preferencialmente:

- `Card`;
- `Progress`;
- `Badge`;
- `Tabs`;
- `Accordion`;
- `Alert`;
- `Tooltip`;
- `Sheet`;
- `Dialog`;
- `DropdownMenu`;
- `Button`;
- `Checkbox`;
- `RadioGroup`;
- `Textarea`;
- `Skeleton`;
- `Toast`.

### Regras de UX

- não utilizar apenas cor para comunicar score ou status;
- apresentar rótulos textuais;
- evidências devem estar acessíveis;
- score e confiança devem ser visualmente distintos;
- a próxima ação deve aparecer antes de listas secundárias;
- o usuário não deve receber oito recomendações com o mesmo destaque;
- ações destrutivas ou irreversíveis exigem confirmação;
- mensagens devem ser acolhedoras e não julgadoras.

---

## 29. Mensagens essenciais

### Análise disponível

> Seu perfil está confirmado e pronto para a Análise de Perfil.
> 

### Início

> Vamos analisar como seu currículo, LinkedIn e posicionamento comunicam sua trajetória e seu objetivo profissional.
> 

### Processamento

> Estamos analisando seu perfil e organizando recomendações prioritárias. Você pode continuar depois; seu progresso será preservado.
> 

### Dados insuficientes

> Ainda faltam informações para gerar uma análise confiável. Revise os itens indicados antes de continuar.
> 

### Baixa confiança

> Esta análise possui baixa confiança porque faltam informações ou existem divergências importantes. Complete os dados indicados antes de considerar o resultado definitivo.
> 

### Média confiança

> Existem informações suficientes para orientar seus próximos passos, mas alguns pontos ainda precisam de confirmação.
> 

### Alta confiança

> Esta análise possui alta confiança porque o perfil foi confirmado e as principais conclusões possuem evidências rastreáveis.
> 

### IPP

> O IPP avalia a prontidão observável da comunicação do seu perfil. Ele não representa empregabilidade, valor profissional ou probabilidade de contratação.
> 

### Ausência de evidência

> Esta competência não foi observada com evidência suficiente nos materiais confirmados.
> 

### Sugestão de reformulação

> Use esta sugestão somente se ela representar com precisão uma atividade que você realmente realizou.
> 

### Falha técnica

> Não foi possível concluir a análise agora. Tente novamente. Nenhum crédito foi consumido.
> 

### Conclusão

> Sua Análise de Perfil está pronta. Comece pela ação destacada como prioridade.
> 

### Reanálise

> Seu perfil foi atualizado. Uma nova análise permitirá comparar a evolução sem alterar o relatório anterior.
> 

---

## 30. Analytics

### Eventos canônicos

- `profile_analysis_started`;
- `profile_analysis_completed`;
- `profile_analysis_failed`;
- `profile_analysis_viewed`;
- `recommendation_viewed`;
- `recommendation_selected`;
- `action_started`;
- `action_completed`;
- `experience_suggestion_copied`;
- `analysis_feedback_submitted`.

### Eventos adicionais

- `profile_analysis_blocked`;
- `profile_analysis_reused`;
- `profile_analysis_low_confidence`;
- `ipp_dimension_viewed`;
- `evidence_viewed`;
- `recommendation_status_changed`;
- `action_status_changed`;
- `profile_reanalysis_started`;
- `profile_reanalysis_completed`;
- `specificity_feedback_submitted`.

### Propriedades permitidas

- `analysis_id`;
- status;
- IPP em faixa agregada;
- nível de confiança;
- versão do Thin Twin;
- versão do contexto-alvo;
- versão do motor;
- versão da rubrica;
- versão do prompt;
- versão do schema;
- versão da configuração;
- quantidade de recomendações;
- categoria da recomendação;
- prioridade;
- status da ação;
- duração do processamento;
- categoria de erro;
- origem da reanálise.

Eventos de retentativa, fila, latência, schema e falha técnica pertencem prioritariamente à observabilidade e à auditoria, não ao analytics de produto.

### Dados proibidos

- nome;
- e-mail;
- cidade;
- estado;
- texto completo do currículo;
- texto completo do LinkedIn;
- texto de experiência;
- evidências em texto;
- sugestão integral;
- tokens;
- credenciais;
- atributos sensíveis.

---

## 31. Requisitos não funcionais

### RNF-C1-001 — Responsividade

O Core 1 deve funcionar em desktop, tablet e mobile.

### RNF-C1-002 — Acessibilidade

A interface deve utilizar:

- HTML semântico;
- navegação por teclado;
- foco visível;
- labels;
- contraste adequado;
- descrições textuais;
- mensagens acessíveis;
- componentes operáveis sem mouse.

### RNF-C1-003 — Segurança

Somente o usuário proprietário poderá acessar a análise.

### RNF-C1-004 — Isolamento

Políticas de acesso devem existir no backend e no banco de dados.

### RNF-C1-005 — Integridade

Falhas não devem corromper relatórios anteriores.

### RNF-C1-006 — Rastreabilidade

Toda conclusão deve possuir evidência ou indicação explícita de ausência de evidência.

### RNF-C1-007 — Determinismo

Com as mesmas entradas intermediárias validadas e as mesmas versões de motor, rubrica, prompt, schema e configuração, o backend deve produzir exatamente o mesmo IPP, confiança e prioridade.

### RNF-C1-008 — Idempotência

Repetições não devem criar análises ou ações duplicadas.

### RNF-C1-009 — Observabilidade

O sistema deve monitorar:

- duração;
- erros;
- retentativas;
- validações;
- confiança;
- completude dos relatórios;
- falhas de autenticidade.

### RNF-C1-010 — Qualidade

Pelo menos 95% dos relatórios processados com sucesso devem conter todas as seções obrigatórias.

### RNF-C1-011 — Evidência

100% das recomendações devem possuir justificativa e evidência ou indicação explícita de ausência de evidência.

### RNF-C1-012 — Design System

A interface deve utilizar shadcn/ui, Tailwind CSS, tokens CareerTwin, Lucide React e componentes acessíveis.

### RNF-C1-013 — Identidade

Os logos oficiais devem ser utilizados sem distorção, reconstrução ou alteração de proporção.

### RNF-C1-014 — Configuração

Pesos, faixas, limites e textos obrigatórios devem permanecer em configuração versionada.

---

## 32. Configuração funcional inicial

Os valores abaixo representam o contrato funcional vigente.

Alterações materiais devem ser versionadas e registradas no Decision Log.

O Claude Code não deve substituir esses valores silenciosamente.

```
exportconstCORE_1_CONFIG= {
  ipp: {
    weights: {
      objectiveClarity:0.15,
      experienceQuality:0.20,
      evidenceAndResults:0.20,
      skillsAndTools:0.15,
      crossSourceConsistency:0.10,
      positioningQuality:0.10,
      profileCompleteness:0.10,
    },

    levels: {
      low: [0,39],
      developing: [40,59],
      good: [60,79],
      high: [80,100],
    },

    rubricLevels: [0,1,2,3,4],
  },

  confidence: {
    weights: {
      inputCompleteness:0.30,
      userConfirmation:0.30,
      evidenceTraceability:0.25,
      sourceConsistency:0.15,
    },

    levels: {
      low: [0,0.49],
      medium: [0.50,0.79],
      high: [0.80,1],
    },
  },

  recommendations: {
    maximum:8,
    highlightedMaximum:3,
    actionPlanMaximum:5,

    priorityWeights: {
      impact:0.40,
      urgency:0.25,
      effortBenefit:0.20,
      confidence:0.15,
    },
  },

  processing: {
    attemptTimeoutSeconds:300,
    maxAttempts:3,
    stalledJobMinutes:10,
  },

  feedback: {
    utilityScale: [1,2,3,4,5],
    specificityOptions: ["yes","partially","no"],
  },
}asconst;
```

---

## 33. Critérios de aceite

O PRD será considerado atendido quando:

1. somente usuário autenticado e autorizado acessar o Core 1;
2. análise sem Thin Twin confirmado for bloqueada;
3. análise sem contexto-alvo válido for bloqueada;
4. o sistema informar exatamente os dados faltantes;
5. as versões de entrada forem congeladas;
6. a análise registrar Thin Twin, contexto-alvo, motor, rubrica, prompt, schema e configuração;
7. a IA não calcular livremente o IPP;
8. o backend calcular o IPP;
9. os pesos definidos forem aplicados;
10. cada dimensão apresentar score, justificativa e evidência;
11. a faixa do IPP for exibida;
12. o disclaimer do IPP for exibido;
13. a confiança for calculada separadamente;
14. a confiança não alterar o IPP;
15. motivos da confiança forem apresentados;
16. score alto com baixa confiança não gerar linguagem definitiva;
17. o relatório apresentar resumo executivo;
18. o relatório apresentar forças e fragilidades;
19. inconsistências entre fontes forem identificadas;
20. ausência de evidência não for descrita como ausência definitiva;
21. recomendações forem classificadas;
22. o Core 1 gerar no máximo oito recomendações;
23. no máximo três recomendações receberem destaque;
24. cada recomendação possuir justificativa e evidência;
25. recomendações duplicadas forem consolidadas;
26. prioridade ser calculada no backend;
27. o plano possuir no máximo cinco ações;
28. cada ação possuir critério de sucesso;
29. o usuário conseguir selecionar recomendações;
30. o usuário conseguir iniciar e concluir ações;
31. sugestões de reformulação preservarem os fatos;
32. nenhuma sugestão inventar métricas, ferramentas ou responsabilidades;
33. competências implícitas serem apresentadas como hipótese;
34. o usuário conseguir copiar sugestões;
35. copiar não editar diretamente os materiais;
36. análises anteriores não serem sobrescritas;
37. reanálise gerar nova versão;
38. relatórios idênticos não serem duplicados;
39. o usuário conseguir acessar o histórico;
40. o usuário conseguir enviar feedback;
41. feedback não alterar o score;
42. falhas técnicas não consumirem créditos;
43. abrir relatório não consumir crédito;
44. atualizar ações não consumir crédito;
45. eventos essenciais serem registrados;
46. dados profissionais não serem enviados para analytics;
47. a interface funcionar em desktop, tablet e mobile;
48. a experiência atender requisitos mínimos de acessibilidade;
49. shadcn/ui ser utilizado como base;
50. os logos oficiais serem utilizados sem distorção;
51. pesos e limites permanecerem versionados;
52. nenhuma regra do motor ser alterada silenciosamente.

---

## 34. Fora do escopo deste PRD

- cadastro;
- login;
- recuperação de senha;
- onboarding;
- upload e extração de arquivos;
- edição do Thin Twin;
- cálculo do IAO;
- análise de vaga;
- recomendação de candidatura;
- busca automática de vagas;
- scraping;
- candidatura automática;
- edição direta de currículo;
- edição direta do LinkedIn;
- exportação completa de currículo;
- preparação para entrevistas;
- simulação de entrevistas;
- networking;
- mensagens para recrutadores;
- negociação;
- coaching humano;
- pagamento real;
- assinatura recorrente;
- aplicativo mobile nativo.

---

## 35. Dependências de implementação

- CareerTwin — Fonte Canônica de Contexto vigente;
- CareerTwin — Product One Page;
- PRD 00 — Site Público, Home/LP e Autenticação;
- PRD 01 — Onboarding e Perfil;
- PRD 03 — Core 2: Diagnóstico de Aderência;
- CareerTwin — Motor de Análise e Scores;
- CareerTwin — Prompts e Schemas;
- CareerTwin — Guardrails;
- CareerTwin — Style Guide para Claude Code;
- Design System baseado em shadcn/ui;
- Thin Twin versionado;
- contexto-alvo versionado;
- serviço de autenticação;
- banco de dados;
- fila durável;
- worker do motor;
- integração com inteligência artificial;
- schemas de entrada e saída;
- Analytics;
- observabilidade e monitoramento;
- histórico;
- gestão de ações;
- Privacidade e Segurança;
- Qualidade e Casos de Teste;
- processo de Incidentes.

---

## 36. Decisões fechadas nesta versão

Estão definidos para o MVP:

- pré-condições;
- entradas;
- dados proibidos;
- arquitetura híbrida;
- separação entre Thin Twin e contexto-alvo;
- máquina de estados;
- idempotência;
- retentativas;
- dimensões do IPP;
- pesos do IPP;
- rubrica de zero a quatro;
- faixas do IPP;
- fórmula de confiança;
- faixas de confiança;
- tipos de lacuna;
- estrutura do relatório;
- contrato do resultado;
- versionamento de motor, rubrica, prompt, schema e configuração;
- categorias de recomendação;
- fórmula de prioridade;
- limite de oito recomendações;
- destaque de três recomendações;
- limite de cinco ações;
- tradução da experiência;
- status das ações;
- histórico;
- reanálise;
- feedback;
- regras de crédito;
- layout;
- mensagens;
- analytics;
- critérios de qualidade.

Nenhum desses pontos deve ser redefinido silenciosamente pelo Claude Code.

---

## 37. Documentos relacionados

### Documentos anteriores

- PRD 00 — Site Público, Home/LP e Autenticação;
- PRD 01 — Onboarding e Perfil.

### Documento posterior

- PRD 03 — Core 2: Diagnóstico de Aderência.

### Documentos transversais

- CareerTwin — Product One Page;
- CareerTwin — Fonte Canônica de Contexto vigente;
- CareerTwin — Motor de Análise e Scores;
- CareerTwin — Prompts e Schemas;
- CareerTwin — Guardrails;
- CareerTwin — Style Guide para Claude Code;
- Decision Log;
- Thin Twin;
- Modelo de Dados;
- Arquitetura;
- Privacidade e Segurança;
- Analytics;
- Incidentes;
- Qualidade e Casos de Teste.

---

## 38. Definição resumida

> **O usuário autenticado inicia a Análise de Perfil a partir de um Thin Twin confirmado e de um contexto-alvo válido e versionado. O CareerTwin calcula o IPP de forma determinística, apresenta a confiança separadamente, explica forças e lacunas, gera recomendações priorizadas e organiza até cinco ações sem inventar experiências, resultados ou competências.**
>