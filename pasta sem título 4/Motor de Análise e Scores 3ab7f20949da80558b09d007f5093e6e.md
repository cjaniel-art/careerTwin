# Motor de Análise e Scores

Criado em: 27 de julho de 2026 23:03

## 1. Princípio de arquitetura

O Motor de Análise e Scores será híbrido.

### Responsabilidade da IA

- extrair informações profissionais;
- interpretar conteúdos;
- normalizar entidades;
- relacionar informações;
- classificar dimensões e requisitos;
- identificar evidências;
- identificar possíveis lacunas;
- gerar justificativas;
- sugerir ações;
- produzir textos explicativos.

### Responsabilidade do backend

- validar entradas e schemas;
- congelar as versões utilizadas;
- aplicar rubricas;
- calcular IPP;
- calcular IAO;
- calcular confiança;
- calcular prioridade;
- aplicar pesos, faixas e limites;
- verificar bloqueadores;
- validar autenticidade;
- registrar versões;
- persistir resultados;
- impedir duplicidades;
- controlar créditos;
- registrar auditoria.

A IA não deverá atribuir livremente scores de zero a cem.

Pesos, fatores, faixas e limites deverão permanecer em configuração versionada e não poderão ser alterados silenciosamente no código.

---

## 2. Pipeline geral

1. selecionar a versão confirmada do Thin Twin;
2. selecionar a versão confirmada do contexto-alvo;
3. selecionar a versão da vaga, quando aplicável;
4. montar o contexto mínimo necessário;
5. remover dados pessoais e sensíveis;
6. validar as entradas;
7. identificar conflitos críticos;
8. executar o prompt correspondente;
9. validar o resultado estruturado;
10. corrigir ou repetir saídas inválidas;
11. classificar dimensões ou requisitos;
12. relacionar evidências;
13. calcular o score no backend;
14. calcular a confiança separadamente;
15. aplicar limites e bloqueadores;
16. classificar lacunas;
17. gerar recomendações;
18. calcular prioridades;
19. executar validações de autenticidade;
20. persistir resultado e metadados;
21. apresentar relatório explicável.

Análises definitivas somente poderão utilizar um Thin Twin confirmado.

---

## 3. Tipos de análise

### Extração de perfil

Transforma currículo e LinkedIn em dados profissionais estruturados.

### Consolidação do Thin Twin

Relaciona, normaliza e identifica conflitos entre as fontes profissionais.

### Análise de Perfil

Produz o diagnóstico do Core 1 e calcula o IPP.

### Estruturação de cargo ou vaga

Transforma uma referência de cargo ou descrição de vaga em requisitos estruturados.

### Diagnóstico de Aderência

Compara o perfil confirmado com os requisitos no Core 2 e calcula o IAO.

### Tradução de experiência

Sugere melhorias de comunicação sem alterar os fatos profissionais.

### Priorização

Ordena recomendações e ações considerando impacto, urgência, esforço e confiança.

---

## 4. IPP — Índice de Prontidão do Perfil

### Definição

O IPP mede a prontidão observável do perfil para comunicar:

- objetivo profissional;
- experiências;
- competências;
- ferramentas;
- evidências;
- posicionamento;
- consistência entre currículo e LinkedIn;
- completude das informações.

O IPP não mede:

- valor profissional;
- empregabilidade;
- probabilidade de entrevista;
- probabilidade de contratação;
- aderência a uma vaga específica.

O resultado deve sempre ser acompanhado por:

- decomposição por dimensão;
- justificativas;
- evidências;
- nível de confiança;
- recomendações;
- disclaimer.

---

## 5. Dimensões do IPP

| Dimensão | Peso |
| --- | --- |
| Clareza do objetivo profissional | 15% |
| Qualidade das descrições de experiência | 20% |
| Evidências e resultados | 20% |
| Competências e ferramentas explicitadas | 15% |
| Consistência entre currículo e LinkedIn | 10% |
| Qualidade do posicionamento | 10% |
| Completude das informações | 10% |
| **Total** | **100%** |

Cada dimensão recebe um nível de zero a quatro:

| Nível | Interpretação |
| --- | --- |
| 0 | Não observado ou material insuficiente |
| 1 | Muito fraco, genérico ou inconsistente |
| 2 | Parcialmente adequado |
| 3 | Adequado e claro |
| 4 | Forte, específico, consistente e sustentado |

### Conversão da dimensão

```
pontuação da dimensão = nível da rubrica ÷ 4 × 100
```

### Fórmula

```
IPP =
clareza do objetivo × 0,15
+ qualidade das experiências × 0,20
+ evidências e resultados × 0,20
+ competências e ferramentas × 0,15
+ consistência entre fontes × 0,10
+ qualidade do posicionamento × 0,10
+ completude × 0,10
```

O resultado deverá ser arredondado para um número inteiro entre zero e cem.

---

## 6. Rubrica operacional do IPP

### 6.1 Clareza do objetivo profissional

#### Nível 0

Objetivo ausente, contraditório ou impossível de interpretar.

#### Nível 1

Área ampla, múltiplos cargos desconectados ou uso apenas de expressões genéricas.

#### Nível 2

Cargo definido, mas especialidade ou senioridade pouco claras.

#### Nível 3

Cargo, área e senioridade coerentes e compreensíveis.

#### Nível 4

Objetivo específico, confirmado, coerente com a trajetória e claramente comunicado.

### 6.2 Qualidade das descrições de experiência

#### Nível 0

Experiências ausentes ou impossíveis de interpretar.

#### Nível 1

Cargos e empresas presentes, mas sem contexto, responsabilidades ou entregas.

#### Nível 2

Responsabilidades compreensíveis, porém genéricas ou pouco específicas.

#### Nível 3

Contexto, atuação e entregas apresentados com clareza.

#### Nível 4

Experiências claras, específicas, contextualizadas e adequadas ao objetivo profissional.

### 6.3 Evidências e resultados

#### Nível 0

Nenhuma evidência observável.

#### Nível 1

Afirmações genéricas sem exemplos, entregas ou contexto.

#### Nível 2

Algumas entregas ou resultados qualitativos pouco contextualizados.

#### Nível 3

Evidências consistentes nas experiências mais relevantes.

#### Nível 4

Evidências claras, contextualizadas, rastreáveis e alinhadas ao objetivo, sem métricas inventadas.

### 6.4 Competências e ferramentas

#### Nível 0

Competências e ferramentas não observadas.

#### Nível 1

Lista genérica sem relação com experiências ou projetos.

#### Nível 2

Competências presentes, mas pouco conectadas às experiências.

#### Nível 3

Competências e ferramentas contextualizadas e sustentadas por experiências.

#### Nível 4

Competências, ferramentas e formas de utilização claramente evidenciadas e alinhadas ao objetivo.

### 6.5 Consistência entre currículo e LinkedIn

#### Nível 0

Conflito crítico não resolvido.

#### Nível 1

Múltiplas divergências relevantes de cargo, empresa ou período.

#### Nível 2

Pequenas divergências ou informações desatualizadas.

#### Nível 3

Fontes majoritariamente consistentes.

#### Nível 4

Fontes consistentes, atualizadas e complementares.

A repetição do mesmo conteúdo nas duas fontes não reduz diretamente o IPP. Ela apenas não deverá ser contabilizada como uma segunda evidência independente.

### 6.6 Qualidade do posicionamento

#### Nível 0

Posicionamento ausente ou incompatível com o objetivo.

#### Nível 1

Apresentação ampla, genérica ou contraditória.

#### Nível 2

Posicionamento parcialmente reconhecível.

#### Nível 3

Proposta profissional clara e coerente.

#### Nível 4

Especialidade, contribuição, senioridade observável e diferenciais claramente comunicados.

### 6.7 Completude das informações

#### Nível 0

Faltam diversas informações essenciais.

#### Nível 1

Experiências, períodos, formação ou outras informações relevantes estão muito incompletos.

#### Nível 2

A estrutura básica está preenchida, mas existem lacunas relevantes.

#### Nível 3

As informações necessárias para a análise estão presentes.

#### Nível 4

O perfil está completo, revisado, confirmado e possui fontes rastreáveis.

---

## 7. Faixas do IPP

| Pontuação | Interpretação |
| --- | --- |
| 0–39 | Baixa prontidão observável |
| 40–59 | Prontidão em desenvolvimento |
| 60–79 | Boa prontidão observável |
| 80–100 | Alta prontidão observável |

A interface deverá explicar:

- o que o IPP mede;
- o que ele não mede;
- quais dimensões influenciaram o resultado;
- quais evidências foram utilizadas;
- quais ações podem melhorar o perfil.

---

## 8. IAO — Índice de Aderência Observável

### Definição

O IAO representa o grau de correspondência observável entre:

- o Thin Twin confirmado;
- uma referência aprovada de cargo; ou
- uma vaga específica estruturada.

O IAO não representa:

- probabilidade de entrevista;
- probabilidade de contratação;
- decisão do recrutador;
- valor profissional do usuário.

O score deve ser calculado requisito a requisito.

Cada requisito deverá possuir:

- descrição;
- categoria;
- criticidade;
- confiança da extração;
- trecho de origem;
- estado de correspondência;
- evidências do perfil;
- justificativa;
- contribuição para o score.

---

## 9. Requisitos e pesos do IAO

### Categorias possíveis

- competência;
- ferramenta;
- experiência;
- responsabilidade;
- formação;
- certificação;
- senioridade;
- escopo;
- localidade;
- idioma;
- outro requisito profissional.

### Criticidade

| Criticidade | Peso |
| --- | --- |
| Obrigatório | 3,0 |
| Desejável | 1,5 |
| Diferencial | 1,0 |
| Complementar | 0,5 |
| Impeditivo | 4,0 |

Requisitos ambíguos deverão:

- ser identificados como ambíguos;
- reduzir a confiança da análise;
- manter o trecho original;
- não ser transformados silenciosamente em obrigatórios ou impeditivos.

O motor deverá registrar a confiança da extração de cada requisito em escala de zero a um.

---

## 10. Estados de correspondência

| Estado | Fator |
| --- | --- |
| Correspondência confirmada | 1,00 |
| Correspondência parcial | 0,65 |
| Lacuna de comunicação | 0,55 |
| Lacuna de evidência | 0,40 |
| Desconhecido por dados insuficientes | 0,20 |
| Não observado | 0,00 |
| Incompatibilidade confirmada | 0,00 |

### Correspondência confirmada

Existe correspondência explícita e evidência profissional suficiente.

### Correspondência parcial

Existe experiência próxima ou compatibilidade parcial, mas o escopo não atende completamente ao requisito.

### Lacuna de comunicação

A experiência pode existir, mas não está apresentada com clareza suficiente nos materiais.

### Lacuna de evidência

A competência ou experiência é declarada, mas não possui exemplo, entrega ou contexto suficiente.

### Desconhecido

Não existem informações suficientes para concluir se o requisito foi atendido.

### Não observado

Não foi encontrada evidência nos materiais analisados.

Não significa ausência definitiva da competência.

### Incompatibilidade confirmada

Existe informação confirmada que demonstra incompatibilidade com o requisito.

---

## 11. Cálculo do IAO

### Contribuição por requisito

```
contribuição ponderada =
peso da criticidade
× fator de correspondência
× confiança da extração
```

### Score bruto

```
IAO bruto =
100
× soma das contribuições ponderadas
÷ soma dos pesos dos requisitos multiplicados pela confiança da extração
```

O resultado deverá ser arredondado para um número inteiro entre zero e cem.

### Limites de segurança

#### Requisito impeditivo confirmado

Quando um requisito impeditivo:

- for claramente aplicável;
- possuir confiança de extração igual ou superior a 0,75;
- estiver confirmado como não atendido;

aplicar:

```
IAO final = no máximo 49
```

A recomendação não poderá ser **aplicar agora**.

#### Dois ou mais obrigatórios críticos não atendidos

Quando existirem dois ou mais requisitos obrigatórios críticos com incompatibilidade confirmada:

```
IAO final = no máximo 59
```

#### Senioridade fortemente incompatível

Quando o escopo observado estiver claramente distante da senioridade exigida e a conclusão possuir confiança média ou alta:

```
IAO final = no máximo 59
```

#### Confiança baixa

A confiança baixa não reduz automaticamente o IAO.

Ela altera a apresentação e a recomendação:

- resultado apresentado como preliminar;
- solicitação de informações adicionais;
- proibição de recomendação definitiva;
- proibição de recomendar automaticamente “aplicar agora”.

O relatório deverá apresentar o IAO bruto, o IAO final e todos os limites aplicados.

---

## 12. Faixas do IAO

| Pontuação | Interpretação |
| --- | --- |
| 0–39 | Baixa aderência observável |
| 40–59 | Aderência parcial |
| 60–79 | Boa aderência observável |
| 80–100 | Alta aderência observável |

As faixas não substituem a análise de:

- confiança;
- requisitos obrigatórios;
- requisitos impeditivos;
- senioridade;
- tipos de lacuna;
- riscos.

---

## 13. Confiança da análise

A confiança será calculada separadamente para IPP e IAO.

| Componente | Peso |
| --- | --- |
| Completude das entradas | 30% |
| Confirmação do usuário | 30% |
| Rastreabilidade das evidências | 25% |
| Consistência entre as fontes | 15% |
| **Total** | **100%** |

### Fórmula

```
confiança =
completude das entradas × 0,30
+ confirmação do usuário × 0,30
+ rastreabilidade das evidências × 0,25
+ consistência entre fontes × 0,15
```

Cada componente deverá estar entre zero e um.

### Faixas

| Resultado | Interpretação |
| --- | --- |
| 0,00–0,49 | Baixa confiança |
| 0,50–0,79 | Média confiança |
| 0,80–1,00 | Alta confiança |

A confiança não altera matematicamente o IPP ou o IAO.

Ela altera:

- linguagem da análise;
- força das conclusões;
- quantidade de ressalvas;
- necessidade de confirmação;
- recomendação final;
- possibilidade de solicitar complementação.

O resultado da confiança deverá registrar:

- score;
- faixa;
- motivos;
- informações ausentes;
- conflitos identificados.

---

## 14. Bloqueadores

Bloqueadores são requisitos impeditivos que podem alterar o IAO final e a recomendação.

Exemplos:

- autorização legal obrigatória para trabalho;
- localização obrigatória incompatível;
- presença física obrigatória incompatível;
- idioma obrigatório;
- certificação regulatória;
- formação legalmente exigida;
- disponibilidade explicitamente incompatível.

Um item somente deverá ser tratado como bloqueador quando:

- estiver claramente declarado;
- for realmente aplicável;
- possuir confiança de extração suficiente;
- a incompatibilidade estiver confirmada.

Requisitos ambíguos não devem ser transformados em bloqueadores.

O bloqueador deverá ser exibido separadamente e registrar:

- requisito;
- evidência da vaga;
- evidência ou incompatibilidade do perfil;
- confiança;
- limite aplicado;
- impacto na recomendação.

---

## 15. Motor de recomendação

### Classificação das lacunas

O motor deverá diferenciar:

- **lacuna de competência:** habilidade confirmadamente ainda não desenvolvida;
- **lacuna de experiência:** ausência confirmada de experiência relevante;
- **lacuna de formação ou certificação:** requisito formal claro não apresentado;
- **lacuna de comunicação:** experiência existente, mas mal comunicada;
- **lacuna de evidência:** competência declarada sem exemplo ou contexto;
- **lacuna de posicionamento:** objetivo, especialidade ou senioridade pouco claros;
- **lacuna desconhecida:** informações insuficientes para classificação segura.

Sem confirmação suficiente, utilizar expressões como:

- “não observado nos materiais”;
- “não confirmado”;
- “pouco evidenciado”;
- “requer complemento”.

### Priorização das recomendações

Impacto, urgência, esforço e confiança deverão utilizar escala de um a cinco.

```
benefício de esforço = 6 − esforço

prioridade =
impacto × 0,40
+ urgência × 0,25
+ benefício de esforço × 0,20
+ confiança × 0,15
```

O resultado deverá ser convertido para uma escala de zero a cem.

Ordenar por:

1. requisito impeditivo ou obrigatório crítico;
2. prioridade decrescente;
3. impacto decrescente;
4. esforço crescente;
5. confiança decrescente.

Limites:

- até oito recomendações;
- até três recomendações destacadas;
- até cinco ações no plano;
- recomendações duplicadas devem ser consolidadas.

### Recomendação sobre a oportunidade

Opções permitidas:

- aplicar agora;
- aplicar com ajustes;
- desenvolver lacunas antes de aplicar;
- não priorizar esta vaga;
- dados insuficientes.

### Ordem de precedência

Uma regra de maior severidade sempre prevalece sobre a faixa do IAO.

1. **Dados insuficientes:** confiança baixa, descrição incompleta, Thin Twin não confirmado ou conflitos críticos.
2. **Bloqueador confirmado:** não priorizar a vaga.
3. **Senioridade fortemente incompatível:** desenvolver lacunas ou não priorizar, conforme possibilidade realista de evolução.
4. **Dois ou mais obrigatórios críticos não atendidos:** desenvolver lacunas antes de aplicar.
5. **IAO entre 0 e 39:** não priorizar a vaga.
6. **IAO entre 40 e 59:** desenvolver lacunas antes de aplicar.
7. **IAO entre 60 e 79:** aplicar com ajustes.
8. **IAO entre 80 e 100:** aplicar agora, desde que não exista regra anterior impeditiva.

A recomendação não poderá depender somente do score.

---

## 16. Explicabilidade

Todo score deverá permitir a reconstrução do resultado.

A análise deverá registrar:

- dimensões ou requisitos;
- pesos;
- fatores;
- classificações;
- evidências;
- justificativas;
- itens desconhecidos;
- nível de confiança;
- bloqueadores;
- score bruto;
- score final;
- limites aplicados;
- versão do Thin Twin;
- versão do contexto-alvo;
- versão da vaga, quando aplicável;
- versão do motor;
- versão da rubrica;
- versão da configuração;
- versão do prompt;
- versão do modelo;
- data da análise.

Cada conclusão relevante deverá responder:

1. o que foi identificado;
2. em qual fonte;
3. qual evidência sustenta a conclusão;
4. como afetou o resultado;
5. qual ação é recomendada.

Análises concluídas não deverão ser sobrescritas.

Uma reanálise deverá criar um novo resultado e preservar o vínculo com a análise anterior.

---

## 17. Falhas e fallback

Em caso de falha, o sistema deverá:

1. não apresentar score incompleto como definitivo;
2. não consumir crédito;
3. registrar o erro técnico;
4. preservar entradas válidas;
5. realizar nova tentativa quando for seguro;
6. apresentar mensagem clara ao usuário;
7. permitir nova tentativa;
8. não substituir informações ausentes por invenções;
9. impedir análises duplicadas;
10. impedir consumo duplicado de crédito;
11. reutilizar resultado idêntico quando todas as versões de entrada e configuração forem iguais;
12. manter logs sem dados pessoais desnecessários.

O Motor de Análise e Scores deve sempre:

- usar somente informações fornecidas ou confirmadas;
- preservar evidências;
- separar score de confiança;
- não tratar “não observado” como “não possui”;
- não utilizar dados pessoais ou sensíveis;
- não inventar experiências, métricas, ferramentas ou resultados;
- não apresentar scores como probabilidade de contratação;
- manter histórico e versionamento.

> **O objetivo do motor não é julgar o valor profissional de uma pessoa. Seu objetivo é gerar clareza, identificar prioridades e apoiar decisões de carreira com base em evidências observáveis.**
>