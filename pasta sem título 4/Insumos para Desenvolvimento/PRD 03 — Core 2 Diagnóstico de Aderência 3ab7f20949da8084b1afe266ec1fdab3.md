# PRD 03 — Core 2: Diagnóstico de Aderência

Criado em: 27 de julho de 2026 23:16

> **Módulo responsável por comparar o Thin Twin confirmado com um cargo-alvo ou uma vaga específica, calcular o Índice de Aderência Observável e apoiar uma decisão de priorização sem prometer entrevista, aprovação ou contratação.**
> 

---

## Papel deste documento

Este PRD detalha os requisitos funcionais, regras de negócio, contratos, estados, eventos, critérios de aceite e decisões de implementação do **Core 2 — Diagnóstico de Aderência**.

O Core 2 começa quando o usuário:

- possui conta ativa;
- possui sessão autenticada;
- concluiu o PRD 01;
- confirmou uma versão do Thin Twin;
- possui cargo-alvo definido ou uma vaga válida;
- possui as versões necessárias do motor e das rubricas.

As etapas anteriores são regidas por:

- **PRD 00 — Site Público, Home/LP e Autenticação**;
- **PRD 01 — Onboarding e Perfil**;
- **PRD 02 — Core 1: Análise de Perfil**.

As fórmulas, pesos, fatores de correspondência, limites, confiança e regras de recomendação são definidos por:

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
- **CareerTwin — Incidentes**;
- **CareerTwin — Style Guide para Claude Code**;
- **Design System baseado em shadcn/ui**;
- **Decision Log**.

Em caso de divergência, deve ser aplicada a regra de precedência definida na Product One Page.

Nenhuma regra de score, confiança, criticidade, limite ou recomendação poderá ser alterada silenciosamente no código.

---

## 1. Resumo

| Item | Definição |
| --- | --- |
| Nome | Core 2 — Diagnóstico de Aderência |
| Identificador | PRD 03 |
| Usuário | Profissional autenticado com Thin Twin confirmado |
| Objetivo | Avaliar a correspondência observável entre perfil e cargo ou vaga |
| Tipos de análise | Cargo-alvo e vaga específica |
| Entrada principal | Thin Twin confirmado e referência do cargo ou vaga estruturada |
| Score | Índice de Aderência Observável — IAO |
| Confiança | Calculada separadamente do IAO |
| Saída | Diagnóstico, requisitos, lacunas, riscos e recomendação |
| Dependências | PRD 00 e PRD 01; PRD 02 recomendado, mas não obrigatório |
| Plataforma | Aplicação web responsiva |
| Idioma | Português do Brasil |
| Design System | shadcn/ui com tokens CareerTwin |
| Processamento | Assíncrono, determinístico, versionado e auditável |
| Limite do plano | Até 5 ações |
| Vaga em PDF | Até 10 MB e 50 páginas |
| Texto da vaga | Até 100.000 caracteres |
| Retenção do arquivo original | Até 24 horas após elegibilidade para exclusão |

---

## 2. Problema

O usuário frequentemente não sabe:

- se seu perfil está alinhado ao cargo desejado;
- se atende aos requisitos obrigatórios de uma vaga;
- quais requisitos estão apenas parcialmente atendidos;
- quais competências existem, mas estão mal comunicadas;
- quais afirmações precisam de evidência;
- quais lacunas exigem desenvolvimento real;
- quais condições podem bloquear a candidatura;
- se a senioridade observável é compatível com a oportunidade;
- quais riscos precisam ser considerados;
- se vale a pena priorizar a vaga;
- quais ajustes podem ser realizados antes da candidatura.

Descrições de vagas podem:

- misturar requisitos obrigatórios e desejáveis;
- utilizar linguagem ambígua;
- conter requisitos contraditórios;
- apresentar expectativas excessivas;
- omitir informações importantes;
- tratar diferenciais como obrigatórios;
- incluir condições impeditivas;
- não deixar clara a senioridade;
- apresentar responsabilidades sem critérios objetivos.

O CareerTwin precisa transformar essas informações em um diagnóstico:

- específico;
- explicável;
- rastreável;
- proporcional;
- versionado;
- baseado em evidências;
- seguro para apoiar decisões;
- sem apresentar o score como probabilidade de contratação.

---

## 3. Objetivo

Permitir que o usuário:

- analise sua aderência a um cargo-alvo;
- analise uma vaga específica;
- envie a vaga por texto ou PDF;
- registre título, empresa e URL de referência;
- revise a estrutura da oportunidade;
- compreenda os requisitos identificados;
- visualize requisitos obrigatórios, desejáveis, diferenciais, complementares e impeditivos;
- identifique requisitos ambíguos;
- visualize o IAO;
- visualize a confiança separadamente;
- compreenda como cada requisito afetou o score;
- identifique forças;
- diferencie tipos de lacuna;
- identifique riscos e bloqueadores;
- receba recomendação de priorização;
- organize ajustes antes da candidatura;
- registre intenção de candidatura;
- envie feedback;
- consulte histórico;
- realize nova análise após atualizar o perfil ou a vaga.

---

## 4. Limite de responsabilidade

Este PRD cobre:

- análise por cargo-alvo;
- análise por vaga específica;
- envio e validação da vaga;
- estruturação da oportunidade;
- revisão de requisitos ambíguos ou críticos;
- versionamento da vaga;
- comparação entre perfil e requisitos;
- cálculo determinístico do IAO;
- cálculo separado da confiança;
- aplicação de limites de segurança;
- classificação de correspondência;
- identificação de lacunas;
- análise de senioridade observável;
- identificação de riscos e bloqueadores;
- recomendação para cargo-alvo;
- recomendação de candidatura para vaga;
- plano de até cinco ações;
- histórico;
- reanálise;
- intenção de candidatura;
- feedback;
- consumo e restauração de créditos.

Este PRD não cobre:

- criação de conta;
- login;
- onboarding;
- edição direta do Thin Twin;
- Core 1;
- cálculo do IPP;
- busca automática de vagas;
- scraping de sites;
- leitura automática de qualquer URL;
- candidatura automática;
- envio de candidatura;
- comunicação com recrutadores;
- preparação para entrevista;
- negociação de proposta;
- decisão automatizada de seleção;
- pagamento real;
- assinatura;
- ranking entre usuários;
- garantia de entrevista ou contratação.

---

## 5. Princípios obrigatórios

### Autenticidade

O Core 2 utilizará apenas:

- Thin Twin confirmado;
- contexto-alvo versionado, quando a análise for por cargo-alvo ou quando for utilizado explicitamente como contexto;
- vaga fornecida pelo usuário; ou
- referência interna e versionada de cargo-alvo;
- evidências rastreáveis;
- requisitos estruturados e validados.

O sistema não pode:

- inventar experiências;
- criar competências;
- criar resultados;
- atribuir ferramentas não informadas;
- adicionar certificações;
- presumir autorização de trabalho;
- presumir disponibilidade para mudança;
- presumir domínio de idioma;
- elevar senioridade;
- transformar colaboração em liderança;
- declarar um requisito como atendido sem evidência suficiente.

### Explicabilidade

Toda conclusão relevante deverá responder:

1. qual requisito foi analisado;
2. qual criticidade foi atribuída;
3. qual evidência da oportunidade sustenta a interpretação;
4. qual evidência do perfil foi utilizada;
5. qual estado de correspondência foi atribuído;
6. como o requisito contribuiu para o IAO;
7. qual risco ou ação está relacionado.

### Observabilidade

Ausência de evidência não significa ausência definitiva de competência.

O sistema deverá utilizar expressões como:

- “não observado nos materiais”;
- “não confirmado”;
- “pouco evidenciado”;
- “dados insuficientes”;
- “requer confirmação do usuário”.

### Não discriminação

Não podem influenciar IAO, confiança, recomendação ou prioridade:

- nome;
- idade;
- gênero;
- raça ou etnia;
- fotografia;
- estado civil;
- religião;
- orientação sexual;
- condição de saúde;
- deficiência;
- cidade;
- estado;
- qualquer atributo sensível ou protegido.

Quando a oportunidade apresentar uma condição geográfica explícita, sua avaliação deverá utilizar informações fornecidas especificamente para o contexto da oportunidade, como:

- preferência de modalidade;
- disponibilidade para trabalho presencial;
- disponibilidade para mudança;
- região de interesse;
- autorização aplicável fornecida pelo usuário.

Essas informações deverão permanecer separadas dos dados pessoais de identificação e não poderão alterar o IAO ou a recomendação sem finalidade explícita, aplicabilidade confirmada e regras documentadas.

### Linguagem segura

O Core 2 não deve afirmar:

- que o usuário será entrevistado;
- que o usuário será aprovado;
- que o usuário será contratado;
- que o IAO representa chance de contratação;
- que o IAO mede valor profissional;
- que uma vaga é definitivamente adequada;
- que o usuário deve desistir de sua carreira;
- “não se candidate” como ordem absoluta.

---

## 6. Tipos de análise

### 6.1 Cargo-alvo

Compara o Thin Twin confirmado com expectativas de referência frequentemente associadas:

- ao cargo escolhido;
- à especialidade;
- à senioridade desejada;
- ao contexto profissional correspondente.

A análise por cargo-alvo não representa um padrão universal.

Ela deverá informar que:

- empresas podem utilizar títulos diferentes;
- escopos variam;
- senioridades variam;
- uma referência de cargo não substitui uma vaga real;
- o resultado deve ser interpretado como orientação.

### 6.2 Vaga específica

Compara o Thin Twin confirmado com uma descrição concreta fornecida pelo usuário.

A vaga poderá ser enviada por:

- texto colado;
- PDF.

Metadados opcionais:

- título;
- empresa;
- URL de referência.

A URL será apenas uma referência e não será acessada automaticamente no MVP.

---

## 7. Referência do cargo-alvo

A análise por cargo-alvo dependerá de uma referência interna, estruturada e versionada.

### Estrutura

```
typeTargetRoleReference= {
  id:string;
  roleFamily:string;
  canonicalTitle:string;
  specialty?:string;
  seniority:"intern"|"junior"|"mid"|"senior";
  requirements:OpportunityRequirement[];
  version:string;
  status:"draft"|"approved"|"deprecated";
  approvedAt?:string;
};
```

### Regras

- somente referências com status `approved` poderão gerar IAO definitivo;
- a referência deverá ser versionada;
- o relatório deverá registrar a versão utilizada;
- a referência não poderá ser criada silenciosamente para cada usuário;
- requisitos ambíguos não poderão ser tratados como obrigatórios;
- não será realizada pesquisa automática na internet durante a análise;
- quando não houver referência aprovada, o resultado será `insufficient_data`;
- o usuário deverá poder ajustar o cargo ou a senioridade.

A criação e a aprovação do catálogo inicial de referências de cargo permanecem como dependência pendente. Enquanto não houver referência aprovada para a combinação solicitada:

- o sistema deverá retornar `insufficient_data`;
- a análise não deverá gerar IAO definitivo;
- o Claude Code não deverá criar ou aprovar uma referência silenciosamente.

### Recomendação para cargo-alvo

```
typeTargetRoleRecommendation=|"ready_to_prioritize"|"prioritize_with_adjustments"|"develop_before_prioritizing"|"reassess_target_context"|"insufficient_data";
```

Essa recomendação não deve utilizar linguagem de candidatura a uma vaga inexistente.

---

## 8. Entrada de vaga específica

### Formatos

O sistema deve aceitar:

- PDF;
- texto colado.

### Limites

- até 10 MB;
- até 50 páginas;
- até 100.000 caracteres em texto colado;
- nome original de arquivo com até 120 caracteres.

### Arquivos não aceitos

- DOC;
- DOCX;
- imagens isoladas;
- ZIP;
- arquivos compactados;
- HTML;
- RTF;
- executáveis;
- arquivos com macros;
- arquivos protegidos por senha.

### Regras

- a vaga em PDF seguirá as regras de segurança de upload do PRD 01;
- o sistema deverá validar extensão e MIME type real;
- o arquivo deverá passar por verificação antimalware;
- o arquivo original será temporário;
- nenhum conteúdo será truncado silenciosamente;
- o usuário poderá substituir o arquivo;
- a substituição deverá criar nova versão quando houver mudança de conteúdo.

---

## 9. Conteúdo mínimo da vaga

A vaga deverá possuir conteúdo profissional suficiente para permitir a identificação confiável de responsabilidades e requisitos.

O critério funcional mínimo deverá considerar:

- pelo menos 300 caracteres úteis;
- presença de responsabilidades ou escopo da função;
- presença de requisitos estruturáveis;
- diversidade suficiente para distinguir contexto, responsabilidades e requisitos.

A combinação lógica exata entre esses critérios permanece pendente de registro no Decision Log.

Enquanto essa decisão não estiver fechada:

- a validação deverá permanecer configurável e versionada;
- o Claude Code não deverá escolher silenciosamente uma regra booleana;
- conteúdo duvidoso deverá resultar em `insufficient_data`;
- nenhuma recomendação definitiva deverá ser produzida.

O sistema também deverá avaliar:

- presença de conteúdo profissional;
- repetição excessiva;
- conteúdo composto somente por navegação;
- texto corrompido;
- ausência de contexto;
- descrição excessivamente curta;
- incompatibilidade entre título e conteúdo.

### RF-C2-001

O número de caracteres não deve ser o único critério de validade.

### RF-C2-002

Conteúdo insuficiente deve resultar em `insufficient_data`.

### RF-C2-003

O sistema deve informar exatamente o que precisa ser complementado.

### RF-C2-004

Uma vaga incompleta não deve gerar recomendação definitiva.

---

## 10. Estruturação da oportunidade

O sistema deverá identificar:

- requisitos obrigatórios;
- requisitos desejáveis;
- diferenciais;
- itens complementares;
- requisitos impeditivos;
- responsabilidades;
- competências técnicas;
- ferramentas;
- experiência esperada;
- formação;
- certificações;
- senioridade;
- escopo;
- localização;
- autorização de trabalho;
- idioma;
- disponibilidade para viagem ou mudança;
- outras condições explícitas.

### Categorias canônicas

```
typeRequirementCategory=|"skill"|"tool"|"experience"|"responsibility"|"education"|"certification"|"seniority"|"scope"|"location"|"language"|"other";
```

### Criticidades

```
typeRequirementCriticality=|"mandatory"|"desired"|"differential"|"complementary"|"blocking";
```

### Estrutura

```
typeOpportunityRequirement= {
  id:string;
  category:RequirementCategory;
  description:string;
  criticality:RequirementCriticality;
  isCritical:boolean;
  applicability:|"applicable"|"not_applicable"|"unknown";
  extractionConfidence:number;
  sourceExcerpt:string;
  ambiguous:boolean;
  userConfirmed:boolean;
};
```

---

## 11. Regras de classificação da criticidade

### Obrigatório

Utilizar quando a fonte indicar termos como:

- obrigatório;
- necessário;
- requisito;
- imprescindível;
- exigido;
- deve possuir;
- experiência mínima.

A simples presença em uma lista não torna o requisito obrigatório.

### Desejável

Utilizar quando a fonte indicar:

- desejável;
- preferencial;
- seria interessante;
- considerado um plus;
- vantagem.

### Diferencial

Utilizar quando a fonte apresentar explicitamente:

- diferencial;
- vantagem competitiva;
- fator adicional;
- “nice to have”.

### Complementar

Utilizar para:

- contexto;
- responsabilidade de apoio;
- característica não eliminatória;
- item informativo;
- expectativa periférica.

### Impeditivo

Utilizar somente quando existir uma condição explícita que possa impedir a candidatura ou contratação, como:

- autorização legal de trabalho;
- localização obrigatória;
- modalidade presencial incompatível;
- idioma mínimo obrigatório;
- certificação legal;
- disponibilidade obrigatória;
- habilitação exigida;
- outra condição claramente eliminatória.

### Regras adicionais

- requisitos ambíguos devem ser marcados como ambíguos;
- requisito ambíguo não pode ser convertido silenciosamente em obrigatório;
- `blocking` exige evidência textual explícita;
- `isCritical = true` somente quando a essencialidade estiver explícita ou for confirmada pelo usuário;
- criticidade com confiança inferior a 0,75 não pode acionar limite de segurança sem revisão;
- o usuário poderá corrigir criticidade ou descrição antes da análise definitiva.

---

## 12. Revisão e confirmação da vaga

Antes da comparação definitiva, o sistema deverá apresentar:

- título;
- empresa;
- origem;
- responsabilidades principais;
- requisitos por criticidade;
- requisitos ambíguos;
- possíveis bloqueadores;
- senioridade identificada;
- localização e modalidade, quando disponíveis.

### RF-C2-005

O usuário deve confirmar que o conteúdo corresponde à vaga desejada.

### RF-C2-006

O usuário deve poder corrigir título e empresa.

### RF-C2-007

O usuário deve poder corrigir um requisito estruturado.

### RF-C2-008

O usuário deve poder alterar criticidade quando a extração estiver incorreta.

### RF-C2-009

O usuário deve poder marcar requisito como não aplicável.

### RF-C2-010

Requisitos ambíguos ou impeditivos devem receber destaque.

### RF-C2-011

A vaga confirmada deve gerar uma versão imutável.

### RF-C2-012

A confirmação deve registrar usuário, data, conteúdo, requisitos e versão.

---

## 13. Versionamento da vaga

```
typeJobOpportunityVersion= {
  jobId:string;
  version:number;
  userId:string;
  title?:string;
  company?:string;
  referenceUrl?:string;
  sourceType:"pasted_text"|"pdf";
  sourceHash:string;
  structuredRequirements:OpportunityRequirement[];
  confirmedAt:string;
  createdAt:string;
};
```

### Regras

Geram nova versão:

- substituição do PDF;
- alteração do texto da vaga;
- inclusão ou remoção de requisito;
- alteração de criticidade;
- correção de bloqueador;
- alteração de responsabilidade relevante;
- alteração de senioridade identificada.

Não geram nova versão do conteúdo:

- correção de capitalização;
- alteração de formatação;
- correção de título sem alteração da vaga;
- atualização da URL de referência.

### RF-C2-013

Versões anteriores não devem ser sobrescritas.

### RF-C2-014

Cada análise deve registrar a versão da vaga utilizada.

### RF-C2-015

Alterações posteriores não devem modificar análises anteriores.

---

## 14. Fluxo principal — Cargo-alvo

1. O usuário acessa o Core 2.
2. O sistema verifica autenticação e autorização.
3. O sistema verifica o Thin Twin.
4. O usuário confirma cargo e senioridade.
5. O sistema localiza uma referência aprovada.
6. O sistema apresenta a referência e suas limitações.
7. O usuário inicia a análise.
8. O sistema congela as versões de entrada.
9. O sistema compara perfil e requisitos.
10. O backend calcula o IAO.
11. O backend calcula a confiança.
12. O sistema identifica forças, lacunas e riscos.
13. O sistema gera recomendação para o cargo-alvo.
14. O sistema gera até cinco ações.
15. O sistema valida autenticidade.
16. O resultado é persistido.
17. O relatório é apresentado.

---

## 15. Fluxo principal — Vaga específica

1. O usuário inicia uma análise de vaga.
2. Informa título e empresa, quando disponíveis.
3. Cola o texto ou envia PDF.
4. O sistema valida segurança e conteúdo.
5. O sistema extrai o texto.
6. O sistema estrutura os requisitos.
7. O usuário revisa e confirma a vaga.
8. O sistema cria uma versão imutável.
9. O sistema congela as versões do Thin Twin e da vaga.
10. O sistema compara requisitos e perfil.
11. O backend calcula o IAO.
12. O backend calcula a confiança.
13. O backend aplica limites de segurança.
14. O sistema identifica bloqueadores e riscos.
15. O sistema gera recomendação de candidatura.
16. O sistema gera até cinco ações.
17. O sistema valida autenticidade.
18. O resultado é persistido.
19. O relatório é apresentado.
20. O usuário informa intenção de candidatura.
21. O sistema solicita feedback.

---

## 16. Pré-condições

### Para análise por cargo

- conta ativa;
- sessão autenticada;
- Thin Twin confirmado;
- `thin_twin_version` válida;
- cargo-alvo definido;
- senioridade desejada definida;
- `target_context_version` válida;
- referência aprovada de cargo;
- ausência de conflito crítico;
- motor e rubrica ativos.

### Para análise por vaga

- conta ativa;
- sessão autenticada;
- Thin Twin confirmado;
- `thin_twin_version` válida;
- vaga válida;
- versão confirmada da vaga;
- requisitos estruturados;
- ausência de conflito crítico;
- motor e rubrica ativos.

Quando uma pré-condição estiver ausente:

```
analysis_status = "insufficient_data"
```

O sistema deverá informar o dado ausente e a ação de correção.

---

## 17. Entradas do motor

### Perfil

- versão confirmada do Thin Twin;
- experiências;
- projetos;
- competências;
- ferramentas;
- resultados;
- evidências;
- formação;
- certificações;
- senioridade observável;
- conflitos registrados.

### Oportunidade

Para cargo:

- referência aprovada;
- cargo;
- especialidade;
- senioridade;
- versão da referência.

Para vaga:

- versão confirmada da vaga;
- requisitos estruturados;
- título;
- empresa;
- conteúdo estruturado.

### Metadados

- usuário;
- tipo de análise;
- versão do Thin Twin;
- versão do contexto-alvo, quando aplicável;
- versão da vaga ou da referência;
- versão do motor;
- versão da rubrica;
- versão do prompt;
- versão do schema;
- versão da configuração;
- versão do modelo;
- data e hora.

### Dados proibidos

Não devem ser enviados ao motor:

- nome;
- e-mail;
- cidade;
- estado;
- idade;
- fotografia;
- atributos sensíveis;
- credenciais;
- tokens;
- arquivo original;
- identificadores desnecessários.

---

## 18. Arquitetura do motor

O motor será híbrido.

### Responsabilidade da IA

A IA poderá:

- interpretar a oportunidade;
- estruturar requisitos;
- classificar criticidade;
- mapear evidências;
- identificar correspondências;
- identificar lacunas;
- explicar riscos;
- redigir recomendações.

### Responsabilidade do backend

O backend deverá:

- validar entradas;
- congelar versões;
- validar schemas;
- aplicar pesos;
- aplicar fatores de correspondência;
- calcular IAO bruto;
- aplicar limites;
- calcular confiança;
- calcular recomendações permitidas;
- aplicar a precedência determinística das recomendações;
- aplicar regras de segurança;
- bloquear saídas inválidas;
- persistir auditoria.

### Regra

A IA não poderá atribuir livremente o IAO final.

---

## 19. Máquina de estados

```
typeFitAnalysisStatus=|"ready"|"validating_opportunity"|"structuring_requirements"|"awaiting_opportunity_review"|"queued"|"matching_requirements"|"scoring"|"evaluating_risks"|"generating_recommendation"|"validating_output"|"completed"|"preliminary"|"insufficient_data"|"failed_retryable"|"failed_final";
```

Esses estados representam o contrato funcional do Core 2.

Os jobs técnicos deverão utilizar o enum canônico da Arquitetura:

- `queued`;
- `processing`;
- `completed`;
- `partially_completed`;
- `failed`;
- `cancelled`;
- `expired`.

Deverá existir um mapeamento explícito entre estado funcional e estado técnico. A implementação não deverá criar strings alternativas silenciosamente.

### RF-C2-016

O sistema deve persistir o estado.

### RF-C2-017

A interface deve refletir o estado do backend.

### RF-C2-018

O usuário deve poder sair durante o processamento.

### RF-C2-019

O processamento deve continuar sem a página aberta.

### RF-C2-020

O usuário não deve iniciar análises idênticas simultaneamente.

### RF-C2-021

Falhas recuperáveis devem permitir nova tentativa.

### RF-C2-022

Falhas técnicas não devem consumir créditos.

---

## 20. Fila, idempotência e retentativas

### Chave para cargo-alvo

```
userId
+ thinTwinVersion
+ targetContextVersion
+ targetRoleReferenceVersion
+ motorVersion
+ rubricVersion
+ promptVersion
+ schemaVersion
+ configVersion
```

### Chave para vaga

```
userId
+ thinTwinVersion
+ jobVersion
+ motorVersion
+ rubricVersion
+ promptVersion
+ schemaVersion
+ configVersion
```

### Configuração inicial

- fila durável;
- uma análise ativa por chave;
- timeout máximo de 5 minutos;
- três tentativas automáticas;
- checkpoints;
- fila de mensagens com falha.

### Retentativas

| Tentativa | Intervalo |
| --- | --- |
| Primeira | 15 segundos |
| Segunda | 60 segundos |
| Terceira | 5 minutos |
| Após a terceira falha | DLQ |

### RF-C2-023

Repetições não devem criar análises duplicadas.

### RF-C2-024

Repetições não devem criar ações duplicadas.

### RF-C2-025

Repetições não devem consumir créditos adicionais.

### RF-C2-026

Análises concluídas devem ser reutilizadas quando todas as versões forem idênticas, salvo nova execução autorizada.

---

## 21. Estados de correspondência

```
typeMatchStatus=|"confirmed_match"|"partial_match"|"communication_gap"|"evidence_gap"|"unknown"|"not_observed"|"confirmed_mismatch";
```

| Estado | Fator | Exibição |
| --- | --- | --- |
| `confirmed_match` | 1,00 | Atendido com evidência |
| `partial_match` | 0,65 | Parcialmente atendido |
| `communication_gap` | 0,55 | Lacuna de comunicação |
| `evidence_gap` | 0,40 | Informado, mas não comprovado |
| `unknown` | 0,20 | Dados insuficientes |
| `not_observed` | 0,00 | Não observado |
| `confirmed_mismatch` | 0,00 | Incompatibilidade confirmada |

Requisitos com `applicability = "not_applicable"` serão excluídos do cálculo.

### Regras

- `confirmed_match` exige evidência rastreável;
- `partial_match` exige correspondência parcial observável;
- `communication_gap` indica experiência provável, mas mal descrita;
- `evidence_gap` indica declaração sem sustentação suficiente;
- `unknown` indica dados insuficientes;
- `not_observed` não deve ser apresentado como ausência confirmada;
- `confirmed_mismatch` exige evidência ou confirmação da incompatibilidade.

---

## 22. Pesos por criticidade

| Criticidade | Peso |
| --- | --- |
| Obrigatório | 3,0 |
| Desejável | 1,5 |
| Diferencial | 1,0 |
| Complementar | 0,5 |
| Impeditivo | 4,0 |

```
constREQUIREMENT_WEIGHTS= {
  mandatory:3.0,
  desired:1.5,
  differential:1.0,
  complementary:0.5,
  blocking:4.0,
}asconst;
```

Os pesos devem permanecer configuráveis e versionados.

---

## 23. Índice de Aderência Observável — IAO

### Finalidade

O IAO mede a correspondência observável entre:

- Thin Twin confirmado; e
- requisitos do cargo-alvo ou vaga.

O IAO não representa:

- probabilidade de entrevista;
- probabilidade de aprovação;
- probabilidade de contratação;
- decisão do recrutador;
- valor profissional;
- garantia de adequação cultural.

### Cálculo por requisito

```
weightedMatch=requirementWeight*matchFactor*extractionConfidence;
```

### Fórmula bruta

```
IAO_RAW=100*sum(weightedMatch)/sum(requirementWeight*extractionConfidence);
```

### Arredondamento

```
IAO_RAW=Math.round(IAO_RAW);
```

### Regras

- requisitos não aplicáveis são excluídos;
- requisitos ambíguos reduzem a confiança;
- criticidade não confirmada não aciona bloqueio;
- o score deve ser calculado no backend;
- categorias podem ser apresentadas como decomposição explicativa;
- os antigos pesos fixos por dimensão não devem ser utilizados no cálculo final;
- o cálculo oficial é feito por requisito, criticidade, correspondência e confiança de extração.

---

## 24. Limites de segurança do IAO

### 24.1 Requisito impeditivo não atendido

Aplicar quando:

- o requisito é explicitamente aplicável;
- `criticality = "blocking"`;
- `extractionConfidence >= 0.75`;
- o requisito foi confirmado;
- o estado é `confirmed_mismatch`.

```
IAO_FINAL=Math.min(IAO_RAW,49);
```

A recomendação de vaga não poderá ser `apply_now`.

### 24.2 Dois ou mais obrigatórios críticos não atendidos

Aplicar quando:

- existem pelo menos dois requisitos;
- `criticality = "mandatory"`;
- `isCritical = true`;
- criticidade confirmada;
- estado `confirmed_mismatch`.

```
IAO_FINAL=Math.min(IAO_RAW,59);
```

### 24.3 Senioridade fortemente incompatível

Aplicar quando:

- a senioridade exigida está clara;
- o escopo observado está materialmente distante;
- a confiança é média ou alta;
- a incompatibilidade está sustentada por sinais observáveis.

```
IAO_FINAL=Math.min(IAO_RAW,59);
```

### 24.4 Confiança baixa

Confiança baixa:

- não altera matematicamente o IAO;
- altera a apresentação;
- marca o resultado como preliminar;
- solicita complementação;
- impede `apply_now` automático;
- pode produzir `insufficient_data`.

### Registro

Todo limite aplicado deve ser persistido em `appliedCaps`.

---

## 25. Faixas do IAO

| Score | Nível |
| --- | --- |
| 0–39 | Baixa aderência observável |
| 40–59 | Aderência parcial |
| 60–79 | Boa aderência observável |
| 80–100 | Alta aderência observável |

A faixa deverá ser apresentada com o score e a confiança.

---

## 26. Saída por requisito

```
typeRequirementMatch= {
  requirementId:string;
  requirement:string;
  criticality:RequirementCriticality;
  weight:number;
  status:MatchStatus;
  factor:number;
  confidence:number;
  contribution:number;
  profileEvidence:EvidenceReference[];
  explanation:string;
  gapType?:GapType;
};
```

### RF-C2-027

Cada requisito deve apresentar criticidade.

### RF-C2-028

Cada requisito deve apresentar correspondência.

### RF-C2-029

Cada requisito deve apresentar explicação.

### RF-C2-030

Correspondências positivas devem possuir evidência.

### RF-C2-031

Lacunas devem possuir tipo.

### RF-C2-032

Requisitos ambíguos devem apresentar confiança.

### RF-C2-033

O usuário deve poder consultar o trecho da oportunidade.

### RF-C2-034

O usuário deve poder consultar a evidência do perfil.

---

## 27. Nível de confiança

A confiança será calculada separadamente do IAO.

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

### Faixas

| Score | Nível |
| --- | --- |
| 0,00–0,49 | Baixa confiança |
| 0,50–0,79 | Média confiança |
| 0,80–1,00 | Alta confiança |

### RF-C2-035

A confiança deve aparecer separadamente.

### RF-C2-036

A confiança não deve alterar o IAO.

### RF-C2-037

O sistema deve explicar os motivos da confiança.

### RF-C2-038

O sistema deve informar dados ausentes.

### RF-C2-039

O sistema deve informar requisitos ambíguos.

### RF-C2-040

Baixa confiança deve gerar resultado preliminar.

### RF-C2-041

IAO alto com baixa confiança não deve gerar recomendação definitiva.

---

## 28. Tipos de lacuna

```
typeGapType=|"competency"|"experience"|"education_or_certification"|"communication"|"evidence"|"positioning"|"unknown";
```

### Competência

Utilizar quando:

- a oportunidade exige uma habilidade;
- não existe evidência observável;
- o usuário confirma que não possui a habilidade.

Sem confirmação:

> Competência não observada nos materiais.
> 

### Experiência

Utilizar quando:

- a responsabilidade ou contexto é relevante;
- não existe experiência compatível confirmada.

### Formação ou certificação

Utilizar quando:

- a qualificação é exigida;
- o requisito está claro;
- não consta no Thin Twin confirmado.

### Comunicação

Utilizar quando:

- a experiência provavelmente existe;
- o material está genérico;
- faltam contexto, escopo ou clareza.

### Evidência

Utilizar quando:

- a competência é declarada;
- falta exemplo, projeto, contexto, entrega ou resultado.

### Posicionamento

Utilizar quando:

- cargo, área, especialidade ou senioridade estão confusos;
- o perfil não comunica o contexto exigido.

### Desconhecida

Utilizar quando os dados são insuficientes.

O sistema não deve forçar uma classificação.

---

## 29. Senioridade observável

A senioridade não deve ser inferida apenas pelo título ou tempo de experiência.

### Sinais

- autonomia;
- complexidade;
- escopo;
- tomada de decisão;
- responsabilidade por entregas;
- influência;
- mentoria;
- liderança formal;
- liderança técnica;
- impacto;
- abrangência dos projetos;
- interação com stakeholders.

### Estrutura

```
typeObservableSeniority= {
  expected:"intern"|"junior"|"mid"|"senior";
  observed:|"insufficient_data"|"intern"|"junior"|"mid"|"senior";
  confidence:ConfidenceResult;
  signals:SenioritySignal[];
  gaps:string[];
};
```

### Regras

O sistema não pode:

- transformar colaboração em gestão;
- transformar participação em ownership;
- transformar execução em estratégia;
- inferir liderança apenas pelo tempo;
- usar somente o título como evidência;
- elevar senioridade para aumentar o IAO.

---

## 30. Riscos e bloqueadores

### Categorias de risco

```
typeOpportunityRiskType=|"blocking_requirement"|"mandatory_gap"|"seniority_mismatch"|"location_mismatch"|"work_authorization"|"language_requirement"|"certification_requirement"|"insufficient_evidence"|"ambiguous_requirement"|"data_quality"|"target_misalignment";
```

### Estrutura

```
typeOpportunityRisk= {
  id:string;
  type:OpportunityRiskType;
  title:string;
  description:string;
  severity:"low"|"medium"|"high"|"critical";
  requirementIds:string[];
  evidenceRefs:EvidenceReference[];
  mitigableBeforeApplication:boolean;
};
```

### Regras

- bloqueadores devem ser explícitos;
- localização só será avaliada quando a vaga apresentar condição clara e houver informação específica fornecida pelo usuário para esse requisito;
- cidade e estado de identificação pessoal não poderão ser utilizados para calcular o IAO ou a recomendação;
- autorização de trabalho nunca será presumida;
- idioma obrigatório exige requisito explícito;
- certificação legal exige texto claro;
- um risco não pode ser criado sem justificativa;
- risco técnico ou ambíguo deve reduzir confiança, não criar incompatibilidade automática.

---

## 31. Recomendação de candidatura

### Opções permitidas

```
typeApplicationRecommendation=|"apply_now"|"apply_with_adjustments"|"develop_gaps_before_applying"|"do_not_prioritize"|"insufficient_data";
```

### Regra principal

A recomendação deverá considerar:

- IAO final;
- confiança;
- requisitos obrigatórios;
- requisitos impeditivos;
- relevância das lacunas;
- senioridade;
- possibilidade de ajuste;
- riscos;
- tempo provável para correção.

A recomendação não pode depender apenas do IAO.

### Precedência determinística

As regras deverão ser avaliadas nesta ordem:

1. dados insuficientes;
2. requisito impeditivo confirmado;
3. incompatibilidade forte de senioridade;
4. dois ou mais obrigatórios críticos incompatíveis;
5. IAO entre 0 e 39;
6. IAO entre 40 e 59;
7. IAO entre 60 e 79;
8. IAO entre 80 e 100.

A primeira regra aplicável deverá prevalecer sobre as regras posteriores.

A categoria final deverá continuar respeitando as condições descritas abaixo e os limites versionados no Motor de Análise e Scores. A IA não poderá ignorar ou reordenar essa precedência.

### Aplicar agora

Condições mínimas:

```
IAO >= 80
confiança média ou alta
nenhum requisito impeditivo não atendido
nenhuma incompatibilidade crítica de senioridade
nenhuma lacuna obrigatória crítica
```

### Aplicar com ajustes

Utilizar quando:

- `60 <= IAO <= 79`; ou
- a maior parte dos requisitos está atendida;
- as lacunas principais são comunicação ou evidência;
- os ajustes podem ser realizados antes da candidatura;
- não existe bloqueador confirmado.

### Desenvolver lacunas antes de aplicar

Utilizar quando:

- `40 <= IAO <= 59`; ou
- existem lacunas relevantes de competência ou experiência;
- há obrigatórios não atendidos;
- as lacunas podem ser desenvolvidas de forma realista.

### Não priorizar esta vaga

Utilizar quando:

- `IAO < 40`; ou
- existe bloqueador confirmado;
- o contexto é claramente incompatível;
- as lacunas críticas não são resolvíveis no curto prazo.

A interface deverá utilizar:

> Não priorizar esta vaga neste momento.
> 

Não utilizar:

> Não se candidate.
> 

### Dados insuficientes

Utilizar quando:

- a confiança é baixa;
- a vaga está incompleta;
- o Thin Twin não está confirmado;
- requisitos essenciais são ambíguos;
- conflitos críticos permanecem;
- a estrutura da oportunidade não é confiável.

---

## 32. Recomendação para cargo-alvo

A recomendação por cargo-alvo deverá aplicar a seguinte ordem:

1. `insufficient_data` quando não houver referência ou informações confiáveis;
2. `reassess_target_context` quando houver incompatibilidade estrutural ou forte diferença de senioridade;
3. `develop_before_prioritizing` quando houver lacunas críticas desenvolvíveis;
4. `reassess_target_context` para IAO entre 0 e 39;
5. `develop_before_prioritizing` para IAO entre 40 e 59;
6. `prioritize_with_adjustments` para IAO entre 60 e 79;
7. `ready_to_prioritize` para IAO entre 80 e 100.

A primeira regra aplicável deverá prevalecer.

### Pronto para priorizar

Utilizar quando:

- IAO igual ou superior a 80;
- confiança média ou alta;
- nenhuma incompatibilidade crítica;
- requisitos centrais observados.

### Priorizar com ajustes

Utilizar quando:

- IAO entre 60 e 79;
- lacunas principais são ajustáveis;
- não existe bloqueador estrutural.

### Desenvolver antes de priorizar

Utilizar quando:

- IAO entre 40 e 59;
- existem lacunas relevantes;
- o objetivo continua plausível.

### Reavaliar contexto-alvo

Utilizar quando:

- IAO abaixo de 40;
- senioridade está fortemente distante;
- especialidade não corresponde às experiências;
- existem incompatibilidades estruturais.

Essa recomendação não significa que o usuário deve abandonar a carreira. Ela indica necessidade de revisar cargo, especialidade, senioridade ou plano de desenvolvimento.

### Dados insuficientes

Utilizar quando não houver referência ou informações confiáveis.

---

## 33. Estrutura do relatório

### 33.1 Cabeçalho

- tipo de análise;
- cargo ou vaga;
- empresa, quando aplicável;
- data;
- status;
- versão do perfil;
- versão da vaga ou referência;
- versão do motor;
- confiança.

### 33.2 Resumo executivo

- IAO final;
- IAO bruto;
- faixa;
- confiança;
- recomendação;
- principal força;
- principal lacuna;
- principal risco;
- disclaimer;
- limites aplicados.

### 33.3 Visão dos requisitos

- atendidos;
- parcialmente atendidos;
- comunicação;
- evidência;
- desconhecidos;
- não observados;
- incompatibilidades;
- não aplicáveis.

### 33.4 Pontos fortes

- competências presentes;
- experiências relacionadas;
- ferramentas;
- evidências;
- formação;
- senioridade;
- diferenciais.

### 33.5 Lacunas

- competência;
- experiência;
- formação ou certificação;
- comunicação;
- evidência;
- posicionamento;
- desconhecida.

### 33.6 Riscos e bloqueadores

- requisitos impeditivos;
- obrigatórios críticos;
- localização;
- autorização;
- idioma;
- certificação;
- senioridade;
- qualidade dos dados.

### 33.7 Recomendação

- categoria;
- justificativa;
- condições favoráveis;
- riscos;
- ajustes recomendados;
- observações sobre confiança.

### 33.8 Plano

Até cinco ações:

- ação imediata;
- antes da candidatura;
- próximos 30 dias.

### 33.9 Evidências

- trecho da oportunidade;
- evidência do perfil;
- origem;
- confiança;
- explicação.

---

## 34. Contrato de saída

```
typeIaoRecommendation=| {
      analysisType:"job";
      category:ApplicationRecommendation;
    }| {
      analysisType:"target_role";
      category:TargetRoleRecommendation;
    };
```

```
typeIaoResult= {
  score:number;
  rawScore:number;
  level:|"low_fit"|"partial_fit"|"good_fit"|"high_fit";
  confidence:ConfidenceResult;
  requirementMatches:RequirementMatch[];
  strengths:string[];
  gaps:Array<{
    type:GapType;
    description:string;
    criticality:RequirementCriticality;
    evidenceRefs:EvidenceReference[];
  }>;
  risks:OpportunityRisk[];
  recommendation:IaoRecommendation;
  recommendationReasoning:string;
  appliedCaps:Array<|"blocking_requirement"|"multiple_critical_mandatory_gaps"|"seniority_mismatch"
  >;
  disclaimer:string;
};
```

```
typeFitAnalysisMetadata= {
  analysisId:string;
  userId:string;
  analysisType:"target_role"|"job";
  thinTwinVersion:number;
  targetContextVersion?:number;
  targetRoleReferenceVersion?:string;
  jobVersion?:number;
  motorVersion:string;
  rubricVersion:string;
  promptVersion:string;
  schemaVersion:string;
  configVersion:string;
  modelVersion:string;
  createdAt:string;
  completedAt?:string;
  status:FitAnalysisStatus;
};
```

```
typeFitAnalysisResult= {
  metadata:FitAnalysisMetadata;
  iao:IaoResult;
  actions:OpportunityAction[];
  authenticityValidation: {
    passed:boolean;
    warnings:string[];
    blockedClaims:string[];
  };
};
```

A saída deverá conter exatamente uma recomendação compatível com o tipo de análise. Não deverão coexistir uma recomendação de vaga e uma recomendação de cargo no mesmo resultado.

---

## 35. Plano de ações

O Core 2 poderá gerar até cinco ações.

### Tipos

```
typeOpportunityActionType=|"improve_communication"|"add_evidence"|"update_profile"|"clarify_requirement"|"develop_skill"|"gain_experience"|"obtain_certification"|"reassess_target"|"prepare_application";
```

### Estrutura

```
typeOpportunityAction= {
  id:string;
  title:string;
  description:string;
  type:OpportunityActionType;
  priority:"high"|"medium"|"low";
  timeframe:|"immediate"|"before_application"|"30_days";
  successCriteria:string;
  sourceRequirementIds:string[];
  status:"pending"|"in_progress"|"completed";
};
```

### RF-C2-042

Cada ação deve estar ligada a requisito, lacuna ou risco.

### RF-C2-043

Cada ação deve possuir critério de sucesso.

### RF-C2-044

Ações de curto prazo não devem sugerir aquisição irrealista de experiência.

### RF-C2-045

O sistema deve diferenciar ajuste de comunicação de desenvolvimento real.

### RF-C2-046

O usuário deve poder iniciar e concluir ações.

### RF-C2-047

Alterar o status não deve consumir crédito.

---

## 36. Histórico e reanálise

Cada análise deverá registrar:

- versão do Thin Twin;
- versão do contexto-alvo, quando aplicável;
- versão da vaga ou referência;
- versão do motor;
- versão da rubrica;
- versão da configuração;
- versão do prompt;
- versão do modelo;
- hashes das entradas;
- regras aplicadas;
- limites aplicados.

### Reanálise comparável

Uma comparação direta de IAO somente será permitida quando:

- o cargo de referência for o mesmo; ou
- a vaga for a mesma;
- a estrutura de requisitos permanecer compatível;
- a versão anterior estiver disponível.

### Regras

- não comparar vagas diferentes como evolução direta;
- nova vaga gera nova análise;
- nova versão do perfil gera nova análise;
- análise anterior permanece imutável;
- diferenças de confiança devem ser apresentadas;
- falhas técnicas não consomem crédito;
- análise idêntica deve reutilizar o resultado.

A existência e a duração de um período gratuito para reanálise da mesma vaga permanecem pendentes de decisão.

Enquanto essa política não estiver registrada no Decision Log:

- o Claude Code não deverá inventar um prazo;
- qualquer comportamento provisório deverá permanecer configurável;
- retentativas e reprocessamentos causados por falha técnica continuarão gratuitos.

### RF-C2-048

O usuário deve acessar análises anteriores.

### RF-C2-049

Abrir um relatório não deve consumir crédito.

### RF-C2-050

Reanálise deve gerar novo relatório.

### RF-C2-051

O relatório anterior não deve ser sobrescrito.

### RF-C2-052

A comparação poderá apresentar:

- IAO anterior;
- IAO atual;
- variação;
- requisitos que mudaram;
- lacunas resolvidas;
- novas lacunas;
- riscos alterados;
- diferença de confiança.

---

## 37. Intenção de candidatura

Após uma análise de vaga, o usuário poderá registrar:

```
typeApplicationIntent=|"will_apply"|"will_apply_after_adjustments"|"will_not_apply"|"undecided";
```

### RF-C2-053

O usuário deve poder informar sua intenção.

### RF-C2-054

A intenção não deve alterar o IAO.

### RF-C2-055

A intenção não deve alterar retroativamente a recomendação.

### RF-C2-056

O sistema deve registrar a versão da análise relacionada.

### RF-C2-057

A intenção poderá ser atualizada pelo usuário.

---

## 38. Feedback

Após o resultado, o usuário poderá avaliar:

### Utilidade

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

- comentário opcional;
- clareza da recomendação;
- confiança para tomar uma decisão.

### RF-C2-058

O feedback deve estar vinculado à análise.

### RF-C2-059

O feedback não deve alterar o IAO.

### RF-C2-060

O comentário não deve ser utilizado como fato profissional.

### RF-C2-061

O usuário deve poder atualizar o feedback durante o período permitido.

---

## 39. Créditos

### Experiência gratuita

Todos os créditos e ofertas do MVP são simulados. Não haverá pagamento real nem coleta de dados de cartão.

O MVP inclui:

- uma utilização do Core 1;
- uma análise de vaga específica pelo Core 2.

### Regras operacionais

- análise de cargo-alvo não consumirá crédito de vaga durante o piloto;
- análise de vaga confirmada consumirá um crédito;
- o crédito será reservado no início da análise;
- o crédito será efetivado após conclusão bem-sucedida;
- falha técnica restaurará a reserva;
- reprocessamento técnico não consumirá novo crédito;
- abrir relatório não consumirá crédito;
- atualizar intenção ou feedback não consumirá crédito;
- atualizar ações não consumirá crédito;
- uma análise idêntica reutilizada não consumirá novo crédito.

A política de reanálise gratuita da mesma vaga continua pendente. O prazo não deverá ser definido silenciosamente na implementação.

### RF-C2-062

O usuário deve ser informado antes do consumo.

### RF-C2-063

O sistema deve registrar reserva, consumo e restauração.

### RF-C2-064

Falhas técnicas não devem reduzir o saldo.

### RF-C2-065

A política deve permanecer configurável.

---

## 40. Retenção da vaga

### Arquivo original

O PDF original será temporário.

### Conteúdo persistido

Poderão ser persistidos:

- texto estruturado;
- trechos mínimos;
- requisitos;
- criticidades;
- confiança;
- versão;
- hash;
- título;
- empresa;
- URL de referência;
- análise;
- evidências necessárias.

### Prazo

O arquivo original será elegível para exclusão quando:

1. a extração terminar;
2. o conteúdo estruturado estiver persistido;
3. a integridade estiver validada;
4. não houver tentativa ativa.

Meta:

> 99% dos arquivos elegíveis excluídos em até 24 horas.
> 

### RF-C2-066

A exclusão deve ser automática.

### RF-C2-067

Falhas de exclusão devem gerar alerta.

### RF-C2-068

O arquivo não deve permanecer indefinidamente para depuração.

---

## 41. Layout da interface

### Entrada do Core 2

Deve apresentar duas opções:

- analisar cargo-alvo;
- analisar vaga específica.

### Análise de cargo

- cargo;
- especialidade;
- senioridade;
- explicação da referência;
- CTA;
- link para alterar objetivo.

### Análise de vaga

- título;
- empresa;
- URL opcional;
- texto ou PDF;
- formatos e limites;
- validação;
- revisão dos requisitos.

### Revisão da vaga

- resumo;
- obrigatórios;
- desejáveis;
- diferenciais;
- complementares;
- impeditivos;
- ambíguos;
- responsabilidades;
- senioridade;
- ação para corrigir;
- confirmação.

### Relatório — desktop

- cabeçalho;
- cards de IAO e confiança;
- recomendação;
- riscos;
- requisitos;
- forças;
- lacunas;
- plano;
- evidências;
- feedback.

### Relatório — mobile

- fluxo vertical;
- cards empilhados;
- filtros simplificados;
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
- `RadioGroup`;
- `Checkbox`;
- `Textarea`;
- `Table`;
- `Skeleton`;
- `Toast`.

### Regras de UX

- IAO e confiança devem ser visualmente distintos;
- não utilizar apenas cor;
- recomendação deve aparecer com justificativa;
- bloqueadores devem receber destaque sem alarmismo;
- requisitos devem ser filtráveis por criticidade e estado;
- evidências devem permanecer acessíveis;
- “não priorizar” não deve parecer proibição;
- ações devem aparecer antes de detalhes secundários;
- linguagem deve ser clara e não julgadora.

---

## 42. Mensagens essenciais

### Entrada

> Compare seu perfil confirmado com um cargo-alvo ou uma vaga específica.
> 

### Cargo-alvo

> Esta análise utiliza expectativas de referência associadas ao cargo e à senioridade. Empresas podem adotar escopos diferentes.
> 

### Vaga

> Cole a descrição da vaga ou envie um PDF para identificar requisitos, lacunas, riscos e pontos de aderência.
> 

### URL

> A URL será armazenada apenas como referência. O CareerTwin não acessará o conteúdo automaticamente.
> 

### Conteúdo insuficiente

> A descrição não possui informações suficientes para gerar um diagnóstico confiável. Inclua responsabilidades e requisitos antes de continuar.
> 

### Revisão

> Revise os requisitos identificados. Itens ambíguos ou impeditivos precisam de atenção antes da análise.
> 

### Processamento

> Estamos comparando seu perfil com os requisitos da oportunidade. Você pode continuar depois; seu progresso será preservado.
> 

### Baixa confiança

> Este resultado é preliminar porque existem informações ausentes, ambíguas ou conflitantes. Complete os dados indicados antes de tomar uma decisão.
> 

### Bloqueador

> Encontramos uma condição explícita que pode limitar esta candidatura. Confirme se ela se aplica ao seu contexto.
> 

### IAO

> O IAO representa a correspondência observável entre seu perfil confirmado e os requisitos analisados. Ele não representa probabilidade de entrevista, aprovação ou contratação.
> 

### Aplicar agora

> Seu perfil apresenta alta correspondência observável e não foram identificados bloqueadores confirmados. Revise os requisitos antes de decidir.
> 

### Aplicar com ajustes

> A oportunidade apresenta boa correspondência, mas alguns ajustes de comunicação ou evidência podem fortalecer sua candidatura.
> 

### Desenvolver lacunas

> Existem lacunas relevantes que merecem desenvolvimento antes de priorizar esta oportunidade.
> 

### Não priorizar

> Esta vaga apresenta incompatibilidades ou bloqueadores relevantes. Considere não priorizá-la neste momento e concentre-se em oportunidades mais alinhadas.
> 

### Dados insuficientes

> Não há informações suficientes para uma recomendação confiável. Revise o perfil ou complemente a descrição da oportunidade.
> 

### Falha técnica

> Não foi possível concluir a análise agora. Tente novamente. Nenhum crédito foi consumido.
> 

---

## 43. Analytics

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

Eventos adicionais somente deverão ser implementados quando estiverem registrados no catálogo canônico de Analytics.

Consumo e restauração de créditos deverão permanecer no ledger como fonte operacional de verdade. Eventos de monetização, quando utilizados, deverão seguir a seção correspondente do catálogo de Analytics.

Exclusão de arquivos temporários, filas, retentativas, falhas de schema e latência pertencem à observabilidade ou à auditoria e não deverão ser tratados como eventos de produto.

### Propriedades permitidas

- `analysis_id`;
- tipo de análise;
- status;
- faixa do IAO;
- nível de confiança;
- tipo de recomendação;
- quantidade de requisitos;
- quantidade por criticidade;
- quantidade por correspondência;
- quantidade de riscos;
- presença de limite aplicado;
- versão do Thin Twin;
- versão do contexto-alvo, quando aplicável;
- versão da vaga;
- versão da referência;
- versão do motor;
- versão da rubrica;
- versão do prompt;
- versão do schema;
- versão da configuração;
- duração;
- categoria de erro;
- intenção de candidatura.

### Dados proibidos

- nome;
- e-mail;
- cidade;
- estado;
- texto completo da vaga;
- texto completo do currículo;
- texto do LinkedIn;
- evidências em texto;
- empresa em texto aberto, quando desnecessária;
- URL completa;
- tokens;
- credenciais;
- atributos sensíveis.

---

## 44. Requisitos não funcionais

### RNF-C2-001 — Responsividade

O Core 2 deve funcionar em desktop, tablet e mobile.

### RNF-C2-002 — Acessibilidade

A interface deve utilizar:

- HTML semântico;
- navegação por teclado;
- foco visível;
- labels;
- contraste adequado;
- mensagens acessíveis;
- descrições textuais;
- componentes operáveis sem mouse.

### RNF-C2-003 — Segurança

Somente o usuário proprietário poderá acessar vaga e análise.

### RNF-C2-004 — Isolamento

Políticas de acesso devem existir no backend e no banco.

### RNF-C2-005 — Integridade

Falhas não devem corromper versões anteriores.

### RNF-C2-006 — Rastreabilidade

Toda correspondência deve possuir evidência ou indicação explícita de ausência.

### RNF-C2-007 — Determinismo

Com as mesmas entradas intermediárias validadas e as mesmas versões de motor, rubrica, prompt, schema e configuração, o backend deve produzir o mesmo IAO, confiança, limites aplicados e recomendação.

### RNF-C2-008 — Idempotência

Repetições não devem criar análises, ações ou consumo duplicado.

### RNF-C2-009 — Observabilidade

O sistema deve monitorar:

- duração;
- erros;
- retentativas;
- confiança;
- distribuição de criticidades;
- limites aplicados;
- falhas de autenticidade;
- consumo e restauração de créditos;
- exclusão de arquivos.

### RNF-C2-010 — Qualidade estrutural

Pelo menos 95% dos relatórios concluídos devem conter todas as seções obrigatórias.

### RNF-C2-011 — Evidência

100% das correspondências positivas devem possuir evidência rastreável.

### RNF-C2-012 — Recomendação

100% das recomendações devem possuir justificativa.

### RNF-C2-013 — Design System

A interface deve utilizar shadcn/ui, Tailwind CSS, tokens CareerTwin, Lucide React e componentes acessíveis.

### RNF-C2-014 — Identidade

Os logos oficiais devem ser utilizados sem distorção ou reconstrução.

### RNF-C2-015 — Configuração

Pesos, fatores, faixas, limites e textos obrigatórios devem permanecer versionados.

---

## 45. Configuração funcional inicial

```
exportconstCORE_2_CONFIG= {
  opportunity: {
    allowedExtensions: ["pdf"],
    maxFileSizeMb:10,
    maxPages:50,
    maxOriginalFileNameCharacters:120,
    maxPastedTextCharacters:100_000,
    minimumUsefulCharacters:300,
    minimumContentRule:"pending_decision_log",
    passwordProtectedFiles:"reject",
    originalFileRetentionHours:24,
  },

  iao: {
    requirementWeights: {
      mandatory:3.0,
      desired:1.5,
      differential:1.0,
      complementary:0.5,
      blocking:4.0,
    },

    matchFactors: {
      confirmed_match:1.0,
      partial_match:0.65,
      communication_gap:0.55,
      evidence_gap:0.40,
      unknown:0.20,
      not_observed:0.0,
      confirmed_mismatch:0.0,
    },

    bands: {
      low: [0,39],
      partial: [40,59],
      good: [60,79],
      high: [80,100],
    },

    caps: {
      blockingRequirement:49,
      multipleCriticalMandatoryGaps:59,
      strongSeniorityMismatch:59,
      minimumBlockingConfidence:0.75,
    },

    recommendationPrecedence: ["insufficient_data","blocking_requirement","strong_seniority_mismatch","multiple_critical_mandatory_gaps","iao_0_39","iao_40_59","iao_60_79","iao_80_100",
    ],
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

  actions: {
    maximum:5,
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

  credits: {
    freeJobAnalyses:1,
    targetRoleConsumesJobCreditDuringPilot:false,
    reserveBeforeProcessing:true,
    restoreOnTechnicalFailure:true,
  },
}asconst;
```

---

## 46. Critérios de aceite

O PRD será considerado atendido quando:

1. somente usuário autenticado e autorizado acessar o Core 2;
2. o usuário conseguir escolher cargo-alvo ou vaga;
3. análise sem Thin Twin confirmado for bloqueada;
4. análise por cargo utilizar referência aprovada;
5. a versão da referência ser registrada;
6. a análise informar que não existe padrão universal de cargo;
7. a vaga aceitar texto ou PDF;
8. a URL não ser utilizada como fonte automática;
9. limites de arquivo e texto serem aplicados;
10. arquivos protegidos serem rejeitados;
11. o upload aplicar validação de tipo e antimalware;
12. conteúdo insuficiente resultar em orientação;
13. o sistema estruturar requisitos;
14. requisitos possuírem categoria;
15. requisitos possuírem criticidade;
16. requisitos possuírem trecho de origem;
17. requisitos possuírem confiança;
18. requisitos ambíguos serem sinalizados;
19. requisitos ambíguos não virarem obrigatórios automaticamente;
20. bloqueadores exigirem evidência explícita;
21. o usuário conseguir revisar a vaga;
22. o usuário conseguir corrigir requisito;
23. o usuário conseguir alterar criticidade;
24. a vaga confirmada criar versão imutável;
25. versões anteriores não serem sobrescritas;
26. as versões de entrada serem congeladas;
27. a IA não calcular livremente o IAO;
28. o backend calcular o IAO;
29. pesos por criticidade serem aplicados;
30. fatores de correspondência serem aplicados;
31. requisitos não aplicáveis serem excluídos;
32. o IAO bruto ser registrado;
33. o IAO final ser registrado;
34. limites aplicados serem registrados;
35. bloqueador confirmado limitar o IAO a 49;
36. dois obrigatórios críticos incompatíveis limitarem o IAO a 59;
37. incompatibilidade forte de senioridade limitar o IAO a 59;
38. confiança ser calculada separadamente;
39. confiança não alterar o score;
40. baixa confiança impedir `apply_now`;
41. cada requisito apresentar estado de correspondência;
42. correspondência positiva possuir evidência;
43. lacunas serem diferenciadas;
44. ausência de evidência não ser tratada como ausência definitiva;
45. senioridade considerar sinais além do título;
46. riscos possuírem justificativa;
47. recomendação considerar score, confiança, requisitos e riscos;
48. recomendação de vaga utilizar uma das cinco categorias;
49. recomendação de cargo utilizar categoria adequada;
50. recomendação possuir justificativa;
51. “não se candidate” não ser utilizado;
52. o relatório apresentar disclaimer do IAO;
53. o relatório apresentar principal força;
54. o relatório apresentar principal lacuna;
55. o relatório apresentar principal risco;
56. o plano possuir no máximo cinco ações;
57. ações estarem ligadas a requisitos ou lacunas;
58. o usuário conseguir iniciar e concluir ações;
59. o usuário conseguir informar intenção de candidatura;
60. a intenção não alterar o score;
61. o usuário conseguir enviar feedback;
62. feedback não alterar o score;
63. análises anteriores permanecerem disponíveis;
64. reanálise gerar novo relatório;
65. vagas diferentes não serem comparadas como evolução direta;
66. análises idênticas serem reutilizadas;
67. falha técnica não consumir crédito;
68. consumo e restauração serem registrados;
69. arquivos temporários serem excluídos no prazo;
70. eventos essenciais serem registrados;
71. dados profissionais não serem enviados para analytics;
72. a interface funcionar em desktop, tablet e mobile;
73. a experiência atender requisitos mínimos de acessibilidade;
74. shadcn/ui ser utilizado como base;
75. logos oficiais serem utilizados sem distorção;
76. configurações permanecerem versionadas;
77. nenhuma regra ser alterada silenciosamente.

---

## 47. Fora do escopo deste PRD

- cadastro;
- login;
- recuperação de senha;
- onboarding;
- edição do Thin Twin;
- Core 1;
- cálculo do IPP;
- busca automática de vagas;
- scraping;
- leitura automática de URL;
- candidatura automática;
- envio de candidatura;
- tracker de candidatura;
- mensagens para recrutadores;
- preparação para entrevistas;
- simulador de entrevistas;
- networking;
- negociação;
- coaching humano;
- comparação entre usuários;
- ranking;
- decisão automatizada de recrutamento;
- pagamento real;
- assinatura recorrente;
- aplicativo mobile nativo.

---

## 48. Dependências de implementação

- CareerTwin — Fonte Canônica de Contexto vigente;
- CareerTwin — Product One Page;
- PRD 00 — Site Público, Home/LP e Autenticação;
- PRD 01 — Onboarding e Perfil;
- PRD 02 — Core 1: Análise de Perfil;
- CareerTwin — Motor de Análise e Scores;
- CareerTwin — Prompts e Schemas;
- CareerTwin — Guardrails;
- CareerTwin — Modelo de Dados;
- CareerTwin — Arquitetura;
- CareerTwin — Privacidade e Segurança;
- CareerTwin — Analytics;
- CareerTwin — Qualidade e Casos de Teste;
- CareerTwin — Incidentes;
- CareerTwin — Style Guide para Claude Code;
- Design System baseado em shadcn/ui;
- Thin Twin versionado;
- contexto-alvo versionado;
- catálogo versionado de referências de cargo;
- armazenamento privado temporário;
- pipeline de PDF;
- antimalware;
- fila durável;
- worker do motor;
- integração com inteligência artificial;
- schemas de entrada e saída;
- banco de dados;
- analytics;
- monitoramento;
- gestão de créditos;
- histórico;
- gestão de ações;
- políticas de segurança e acesso.

---

## 49. Decisões fechadas nesta versão

Estão definidos para o MVP:

- tipos de análise;
- referência versionada de cargo;
- formatos e limites da vaga;
- princípios de validação do conteúdo e uso de `insufficient_data`;
- estrutura dos requisitos;
- categorias;
- criticidades;
- revisão e confirmação;
- versionamento da vaga;
- pré-condições;
- arquitetura híbrida;
- máquina de estados;
- idempotência;
- retentativas;
- fatores de correspondência;
- pesos por criticidade;
- fórmula do IAO;
- faixas do IAO;
- limites de segurança;
- confiança separada;
- tipos de lacuna;
- senioridade observável;
- categorias de risco;
- recomendação de candidatura;
- recomendação para cargo;
- estrutura do relatório;
- contratos;
- limite de cinco ações;
- histórico;
- reanálise;
- intenção de candidatura;
- feedback;
- créditos;
- retenção;
- layout;
- mensagens;
- analytics;
- critérios de qualidade.

Permanecem pendentes:

- a combinação lógica exata dos critérios mínimos de conteúdo da vaga;
- a existência e a duração de um período gratuito para reanálise da mesma vaga;
- a criação e aprovação do catálogo inicial de referências de cargo.

Nenhum ponto fechado deve ser redefinido silenciosamente pelo Claude Code. Nenhuma pendência deve ser resolvida silenciosamente na implementação.

---

## 50. Documentos relacionados

### Documentos anteriores

- PRD 00 — Site Público, Home/LP e Autenticação;
- PRD 01 — Onboarding e Perfil;
- PRD 02 — Core 1: Análise de Perfil.

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
- Catálogo de Referências de Cargo;
- Arquitetura;
- Privacidade e Segurança;
- Analytics;
- Incidentes;
- Qualidade e Casos de Teste;
- Gestão de Créditos.

---

## 51. Definição resumida

> **O usuário autenticado compara seu Thin Twin confirmado com uma referência versionada de cargo vinculada ao contexto-alvo ou com uma vaga específica confirmada. O CareerTwin estrutura os requisitos, calcula o IAO no backend, apresenta confiança separadamente, explica correspondências, lacunas, riscos e bloqueadores e oferece uma recomendação de priorização sem tratar o score como probabilidade de contratação.**
>