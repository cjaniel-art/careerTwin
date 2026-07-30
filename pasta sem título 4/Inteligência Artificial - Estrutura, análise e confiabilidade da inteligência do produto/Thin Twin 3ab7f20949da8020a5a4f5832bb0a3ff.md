# Thin Twin

Criado em: 27 de julho de 2026 23:00

## 1. Definição

O **Thin Twin** é a representação profissional estruturada, persistente, confirmada e versionada da trajetória do usuário.

Ele reúne os fatos profissionais necessários para que o CareerTwin possa:

- analisar currículo e LinkedIn;
- compreender a trajetória profissional;
- identificar competências, ferramentas e evidências;
- avaliar posicionamento;
- comparar o perfil com cargos e vagas;
- gerar recomendações;
- acompanhar atualizações;
- realizar reanálises;
- preservar o histórico das versões.

O Thin Twin não é:

- memória livre de uma conversa;
- histórico integral de mensagens;
- perfil psicológico;
- currículo gerado automaticamente;
- reprodução integral dos documentos originais;
- conjunto de inferências tratadas como fatos;
- representação definitiva do valor profissional do usuário;
- registro do objetivo profissional.

O objetivo profissional será mantido separadamente em uma versão do contexto-alvo.

---

## 2. Princípios do Thin Twin

### Estruturado

As informações devem ser armazenadas em campos e entidades definidos, e não somente como texto livre.

### Rastreável

Cada informação deve indicar sua origem e a evidência utilizada.

### Confirmado

Informações extraídas ou inferidas não se tornam fatos profissionais até serem confirmadas pelo usuário.

### Versionado

Alterações profissionais relevantes geram uma nova versão do perfil.

### Persistente

O perfil estruturado permanece disponível entre análises e acessos.

### Minimalista

Somente informações necessárias para entregar a experiência devem ser mantidas.

### Separado dos dados pessoais

Nome, e-mail, cidade, estado, data de nascimento, endereço e outras informações pessoais não fazem parte do Thin Twin profissional.

---

## 3. Fontes de informação

O Thin Twin poderá utilizar:

- currículo;
- LinkedIn;
- informações profissionais adicionadas pelo usuário;
- correções realizadas pelo usuário;
- evidências profissionais adicionadas;
- atualizações posteriores dos materiais.

O objetivo profissional não faz parte do Thin Twin.

Ele pertence ao contexto-alvo versionado, utilizado em conjunto com o perfil nas análises.

A descrição de uma vaga também não faz parte do Thin Twin.

Ela pertence ao contexto de uma análise específica do Core 2.

---

## 4. Estrutura conceitual

### 4.1 Identidade profissional

- área atual;
- cargo atual;
- especialidade;
- senioridade observável;
- resumo profissional;
- situação profissional atual;
- localização profissional relevante, quando informada;
- idiomas informados;
- disponibilidade informada.

A senioridade observável deverá permanecer identificada como fato confirmado ou inferência, conforme sua origem.

### 4.2 Contexto-alvo relacionado

O contexto-alvo será mantido separadamente do Thin Twin e poderá conter:

- área-alvo;
- cargo-alvo;
- senioridade desejada;
- tipo de transição;
- contexto da busca;
- preferências profissionais explicitamente informadas.

O contexto-alvo deverá possuir versão própria:

```
target_context_version
```

As análises utilizarão uma versão confirmada do Thin Twin e uma versão confirmada do contexto-alvo.

### 4.3 Experiências

Cada experiência poderá conter:

- empresa, organização ou contexto;
- cargo ou função;
- tipo de vínculo, quando informado;
- data inicial;
- data final;
- situação atual;
- descrição;
- responsabilidades;
- projetos;
- ferramentas;
- competências relacionadas;
- resultados;
- evidências;
- escopo de atuação;
- sinais de senioridade;
- fonte.

### 4.4 Projetos

Cada projeto poderá conter:

- nome;
- contexto;
- objetivo;
- papel do usuário;
- atividades;
- ferramentas;
- competências;
- entregas;
- resultados;
- período;
- experiência relacionada;
- evidências.

### 4.5 Competências

Cada competência poderá registrar:

- nome normalizado;
- termo original;
- tipo;
- domínio ou categoria;
- experiências relacionadas;
- projetos relacionados;
- nível declarado, quando informado;
- evidências;
- fonte;
- confiança de extração;
- confirmação do usuário;
- versão da taxonomia.

Tipos possíveis:

- técnica;
- método;
- domínio;
- gestão;
- liderança;
- comunicação;
- colaboração;
- negócio;
- idioma.

Ferramentas e tecnologias específicas devem ser armazenadas separadamente das competências.

A presença de uma competência não significa domínio avançado.

### 4.6 Resultados e evidências

Uma evidência poderá ser:

- entrega;
- projeto;
- responsabilidade;
- resultado qualitativo;
- resultado quantitativo;
- reconhecimento;
- promoção;
- ampliação de escopo;
- certificação;
- portfólio;
- exemplo profissional.

Cada evidência deverá preservar o contexto necessário para evitar interpretações exageradas.

A mesma evidência não deverá ser contabilizada mais de uma vez apenas por aparecer no currículo e no LinkedIn.

### 4.7 Formação

- instituição;
- curso;
- tipo;
- área;
- data inicial;
- data final;
- situação;
- fonte;
- confirmação.

### 4.8 Certificações

- nome;
- instituição emissora;
- data;
- validade, quando informada;
- identificador, quando informado;
- fonte;
- confirmação.

### 4.9 Idiomas

- idioma;
- nível declarado;
- certificação, quando existente;
- contexto de uso;
- fonte;
- confirmação.

### 4.10 Histórico

O histórico relacionado ao Thin Twin poderá apresentar:

- versões do perfil;
- documentos utilizados em cada versão;
- alterações profissionais;
- análises associadas;
- versão do contexto-alvo utilizada;
- recomendações e ações relacionadas;
- datas de atualização.

Análises, vagas, recomendações, ações e feedbacks são entidades relacionadas ao Thin Twin, mas não fazem parte dos fatos profissionais armazenados no perfil.

---

## 5. Metadados obrigatórios

Cada informação profissional relevante deverá registrar:

| Campo | Finalidade |
| --- | --- |
| `source_type` | Identificar currículo, LinkedIn ou usuário |
| `source_id` | Relacionar o dado à fonte específica |
| `evidence_snippet` | Preservar o trecho mínimo que sustenta o dado |
| `extraction_confidence` | Indicar a confiança da extração |
| `confirmation_status` | Indicar se foi confirmado pelo usuário |
| `created_at` | Registrar criação |
| `updated_at` | Registrar atualização |
| `profile_version_id` | Identificar a versão do Thin Twin |
| `normalization_status` | Indicar se o termo foi normalizado |
| `inference_status` | Diferenciar fato, interpretação e sugestão |

O campo `extraction_confidence` representa a confiança na extração e não deve ser confundido com:

- confirmação do usuário;
- confiança da análise;
- score;
- aderência.

---

## 6. Estados de confirmação

### Extraído

Informação identificada em uma fonte, ainda não revisada.

### Confirmado

Informação validada pelo usuário sem alteração.

### Corrigido

Informação extraída e posteriormente alterada pelo usuário.

### Adicionado

Informação inserida diretamente pelo usuário.

### Rejeitado

Informação removida ou indicada como incorreta.

### Em conflito

Informação possui versões incompatíveis entre as fontes.

### Não confirmado

Informação não possui confirmação suficiente para ser utilizada como fato.

Somente os estados **confirmado**, **corrigido** e **adicionado** podem ser tratados como fatos profissionais.

---

## 7. Confiança da extração

A confiança da extração indica a segurança do sistema ao identificar uma informação na fonte.

### Alta confiança

- informação explícita;
- contexto claro;
- sem conflito entre fontes;
- estrutura facilmente interpretável.

### Média confiança

- informação provável;
- contexto parcial;
- alguma ambiguidade;
- evidência indireta.

### Baixa confiança

- informação incompleta;
- estrutura ambígua;
- conflito relevante;
- inferência necessária;
- ausência de contexto.

A confiança da extração:

- não substitui a confirmação do usuário;
- não representa confiança do Core 1 ou do Core 2;
- não transforma inferências em fatos;
- deverá ser registrada de forma compatível com os schemas técnicos.

---

## 8. Tratamento de inferências

A inteligência artificial poderá identificar sinais e hipóteses, como:

- competência implícita;
- possível escopo de atuação;
- possível senioridade;
- relação entre experiências;
- possível inconsistência;
- potencial palavra-chave.

Esses elementos devem ser armazenados como:

- inferência;
- sugestão;
- hipótese;
- item a confirmar.

Uma inferência não poderá ser promovida automaticamente a fato.

### Exemplo

Fonte:

> “Acompanhava o planejamento das entregas do time.”
> 

Interpretação permitida:

> “Existe um possível sinal de coordenação ou acompanhamento de entregas.”
> 

Interpretação proibida:

> “O usuário liderava a equipe.”
> 

---

## 9. Normalização

O Thin Twin poderá manter dois valores:

- termo original;
- termo normalizado.

### Exemplo

| Termo original | Termo normalizado |
| --- | --- |
| “PO” | Product Owner |
| “Figma” | Figma |
| “gestão de backlog” | Backlog Management |
| “levantamento de requisitos” | Requirements Analysis |

A normalização:

- facilita comparações;
- reduz duplicidades;
- melhora o matching;
- não deve alterar o significado original;
- deve preservar o termo utilizado pelo usuário;
- deve registrar a versão da taxonomia utilizada;
- não deve descartar termos desconhecidos silenciosamente.

---

## 10. Resolução de conflitos

Quando currículo e LinkedIn apresentarem informações diferentes, o sistema deverá:

1. identificar o conflito;
2. apresentar as duas versões;
3. indicar as fontes;
4. solicitar confirmação ou correção do usuário;
5. registrar a decisão;
6. preservar o histórico da alteração.

### Exemplos de conflito

- datas diferentes;
- cargos diferentes;
- responsabilidades incompatíveis;
- formação divergente;
- ferramenta presente em apenas uma fonte;
- empresa com nomes diferentes;
- situação profissional inconsistente.

Diferenças complementares entre currículo e LinkedIn não devem ser tratadas automaticamente como conflitos.

O sistema não deverá escolher silenciosamente uma das versões.

---

## 11. Versionamento

Uma nova versão do Thin Twin deverá ser criada quando houver alteração profissional relevante em:

- experiência;
- cargo;
- empresa ou contexto;
- período;
- responsabilidade;
- projeto;
- competência;
- ferramenta com evidência;
- resultado;
- formação;
- certificação;
- evidência profissional;
- conflito crítico resolvido;
- substituição de currículo;
- substituição do LinkedIn.

Alterações no objetivo profissional não devem gerar uma nova versão do Thin Twin.

Área-alvo, cargo-alvo e senioridade desejada deverão gerar uma nova:

```
target_context_version
```

Alterações estritamente pessoais, administrativas, visuais ou ortográficas não devem gerar nova versão profissional.

### Cada versão deverá registrar

- identificador;
- número da versão;
- data de criação;
- motivo;
- origem da alteração;
- responsável pela alteração;
- itens adicionados;
- itens alterados;
- itens removidos;
- versão anterior;
- confirmação do usuário.

### Regra de associação

Toda análise deve registrar:

- `profile_version_id`;
- `target_context_version_id`;
- data da análise;
- versão do motor;
- versão do prompt;
- versão da rubrica.

Análises antigas não devem ser recalculadas ou modificadas silenciosamente quando o perfil ou o objetivo mudar.

---

## 12. Ciclo de vida

1. documentos são recebidos;
2. conteúdos são extraídos;
3. dados são normalizados;
4. possíveis conflitos são identificados;
5. rascunho do Thin Twin é criado;
6. usuário revisa;
7. usuário confirma, corrige, adiciona ou rejeita informações;
8. versão inicial do Thin Twin é persistida;
9. contexto-alvo é confirmado separadamente;
10. análises utilizam as versões confirmadas;
11. alterações relevantes geram novas versões;
12. histórico permanece disponível sem sobrescrever resultados anteriores.

---

## 13. Dados que não pertencem ao Thin Twin

- nome;
- e-mail;
- cidade;
- estado;
- senha;
- endereço residencial completo;
- data de nascimento;
- dados de cartão;
- objetivo profissional;
- descrições de vagas;
- conteúdo integral dos documentos originais;
- conversas irrelevantes;
- atributos sensíveis não necessários;
- avaliações psicológicas;
- inferências sobre personalidade;
- inferências sobre saúde;
- inferências sobre origem étnica;
- inferências políticas ou religiosas;
- probabilidade de contratação;
- ranking do usuário.

---

## 14. Invariantes

O sistema deve garantir que:

1. nenhum fato profissional seja criado sem fonte ou confirmação;
2. nenhuma inferência seja armazenada como fato confirmado;
3. toda análise possua uma versão confirmada do Thin Twin;
4. toda análise baseada em objetivo possua uma versão do contexto-alvo;
5. versões anteriores não sejam sobrescritas;
6. dados pessoais não influenciem scores, confiança ou recomendações;
7. exclusões e correções sejam rastreáveis;
8. o usuário acesse apenas seu próprio Thin Twin;
9. evidências sejam mínimas, contextualizadas e suficientes;
10. confiança de extração seja distinta da confirmação do usuário;
11. ausência de informação não seja interpretada automaticamente como ausência de competência;
12. alteração do objetivo profissional não modifique os fatos profissionais nem as análises anteriores.

---

## 15. Estrutura conceitual de objeto

```
{
  "profile_id":"profile_123",
  "profile_version_id":"profile_version_4",
  "version_number":4,
  "professional_identity": {
    "current_area":"Produto",
    "current_role":"Product Analyst",
    "observed_seniority": {
      "value":"mid",
      "status":"inference",
      "confidence":0.72
    }
  },
  "experiences": [],
  "projects": [],
  "competencies": [],
  "tools": [],
  "education": [],
  "certifications": [],
  "languages": [],
  "profile_metadata": {
    "created_at":"ISO-8601",
    "updated_at":"ISO-8601",
    "previous_version_id":"profile_version_3",
    "confirmation_status":"confirmed"
  }
}
```

O contexto-alvo deverá ser armazenado separadamente:

```
{
  "target_context_version_id":"target_context_version_2",
  "target_area":"Produto",
  "target_role":"Product Manager",
  "desired_seniority":"mid",
  "confirmation_status":"confirmed",
  "previous_version_id":"target_context_version_1"
}
```

Esses exemplos são conceituais.

Os schemas técnicos definitivos deverão ser versionados separadamente no documento **Prompts e Schemas** e refletidos no **Modelo de Dados**.