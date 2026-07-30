# PRD 01 — Onboarding e Perfil

Criado em: 27 de julho de 2026 23:15

> **Etapa responsável por coletar os materiais profissionais, estruturar e confirmar o Thin Twin e registrar separadamente o contexto-alvo do usuário.**
> 

---

## Papel deste documento

Este PRD detalha os requisitos funcionais, regras de negócio, estados, eventos, critérios de aceite e decisões de implementação do onboarding e da construção do perfil profissional estruturado do CareerTwin.

Este documento começa quando o usuário já possui uma conta ativa e uma sessão autenticada.

Cadastro, login, recuperação de senha, sessão, proteção de rotas, logout e exclusão da conta são definidos pelo:

> **PRD 00 — Site Público, Home/LP e Autenticação**
> 

As funcionalidades posteriores são definidas por:

- **PRD 02 — Core 1: Análise de Perfil**;
- **PRD 03 — Core 2: Diagnóstico de Aderência**;
- **CareerTwin — Motor de Análise e Scores**.

As definições deste documento devem ser implementadas em conjunto com:

- **CareerTwin — Fonte Canônica de Contexto vigente**;
- **CareerTwin — Product One Page**;
- **CareerTwin — Arquitetura**;
- **CareerTwin — Modelo de Dados**;
- **CareerTwin — Privacidade e Segurança**;
- **CareerTwin — Analytics**;
- **CareerTwin — Style Guide para Claude Code**;
- **Design System baseado em shadcn/ui**;
- **Decision Log**.

Em caso de divergência, deve ser aplicada a regra de precedência definida na Product One Page.

---

## 1. Resumo

| Item | Definição |
| --- | --- |
| Nome | Onboarding e Perfil |
| Identificador | PRD 01 |
| Usuário | Profissional autenticado |
| Objetivo | Criar um Thin Twin confiável, rastreável, versionado e confirmado |
| Entrada | Nome, localização opcional, currículo e LinkedIn |
| Saída | Thin Twin confirmado e contexto-alvo definido |
| Dependência | PRD 00 concluído, conta ativa e sessão autenticada |
| Desbloqueia | Core 1 e Core 2 conforme as pré-condições de cada módulo |
| Plataforma | Aplicação web responsiva |
| Idioma | Português do Brasil |
| Design System | shadcn/ui com tokens CareerTwin |
| Limite de arquivos | 10 MB e até 50 páginas por documento |
| Retenção de arquivos originais | Até 24 horas após elegibilidade para exclusão |
| Processamento | Assíncrono, rastreável, idempotente e recuperável |

---

## 2. Problema

O CareerTwin precisa compreender a trajetória profissional do usuário sem exigir o preenchimento de um formulário profissional extenso.

Currículo e LinkedIn podem:

- estar incompletos;
- possuir estruturas diferentes;
- apresentar informações divergentes;
- utilizar linguagem genérica;
- omitir competências relevantes;
- apresentar datas ou cargos inconsistentes;
- conter informações difíceis de interpretar;
- apresentar experiências sem contexto ou evidência;
- estar desatualizados;
- possuir diferentes níveis de detalhamento;
- repetir o mesmo conteúdo;
- estar protegidos por senha;
- estar compostos somente por imagens;
- conter texto corrompido ou insuficiente.

O produto não pode utilizar diretamente informações extraídas sem que o usuário tenha oportunidade de revisá-las.

Antes de gerar qualquer análise, o CareerTwin precisa:

1. receber materiais válidos;
2. validar segurança, tipo e integridade;
3. extrair as informações profissionais;
4. identificar a origem de cada informação;
5. identificar possíveis divergências;
6. estruturar um rascunho do Thin Twin;
7. permitir correções e complementações;
8. obter a confirmação do usuário;
9. registrar uma versão imutável do Thin Twin;
10. registrar separadamente o contexto-alvo.

Sem essa etapa, o Core 1 e o Core 2 podem produzir recomendações baseadas em informações incorretas, incompletas ou não confirmadas.

---

## 3. Objetivo

Permitir que o usuário:

- inicie ou retome o onboarding;
- informe seu nome;
- informe opcionalmente cidade e estado;
- envie o currículo;
- envie o conteúdo do LinkedIn;
- acompanhe upload, validação e processamento;
- compreenda o que está sendo extraído;
- revise os dados profissionais identificados;
- identifique divergências entre currículo e LinkedIn;
- corrija informações incorretas;
- remova informações;
- complemente seu perfil;
- confirme uma versão do Thin Twin;
- defina seu contexto-alvo;
- conclua o onboarding;
- acesse o Core 1;
- prepare os dados necessários para o Core 2.

O onboarding deve minimizar esforço manual sem retirar do usuário o controle sobre as informações utilizadas pela inteligência artificial.

---

## 4. Limite de responsabilidade

Este PRD cobre:

- identificação básica do usuário no onboarding;
- localização opcional por cidade e estado;
- envio do currículo;
- envio do LinkedIn;
- validação dos materiais;
- análise de segurança dos arquivos;
- processamento e extração;
- OCR de documentos elegíveis;
- criação do rascunho do Thin Twin;
- revisão e confirmação do perfil;
- identificação e resolução de divergências;
- normalização de cargos e períodos;
- organização de competências e ferramentas;
- versionamento do Thin Twin;
- definição do contexto-alvo;
- conclusão do onboarding;
- retenção e exclusão dos arquivos temporários;
- recuperação de processamentos interrompidos.

Este PRD não cobre:

- criação da conta;
- login;
- recuperação de senha;
- controle geral da sessão;
- exclusão da conta;
- Home/LP;
- cálculo do IPP;
- geração das recomendações do Core 1;
- cálculo do IAO;
- diagnóstico de cargo ou vaga;
- dashboard detalhado;
- pagamento;
- edição automática de currículo ou LinkedIn;
- orientação vocacional completa.

---

## 5. Princípio de minimização de dados pessoais

O MVP coletará somente os dados pessoais necessários para identificação e personalização básica da experiência.

### Dados coletados

- nome completo — obrigatório;
- cidade — opcional;
- estado — opcional.

### Dados não coletados no MVP

- data de nascimento;
- CEP;
- logradouro;
- número;
- complemento;
- bairro;
- endereço residencial completo.

### Regras

Os dados pessoais:

- não fazem parte do Thin Twin profissional;
- não influenciam IPP;
- não influenciam IAO;
- não influenciam o nível de confiança profissional;
- não influenciam recomendações;
- não determinam senioridade;
- não determinam aderência;
- não devem ser enviados ao modelo de IA sem necessidade;
- devem ser armazenados separadamente dos dados profissionais.

Cidade e estado somente poderão ser utilizados em análises futuras de localidade quando:

- o usuário autorizar;
- a vaga possuir requisito geográfico explícito;
- a finalidade estiver claramente informada.

---

## 6. Usuários e estados de acesso

### Usuário autenticado com onboarding não iniciado

Pode:

- acessar a introdução do onboarding;
- iniciar o preenchimento;
- encerrar a sessão.

Não pode:

- acessar o Core 1;
- acessar resultados;
- iniciar análise baseada em perfil não confirmado.

### Usuário autenticado com onboarding em andamento

Pode:

- continuar da última etapa salva;
- atualizar os dados preenchidos;
- substituir materiais;
- acompanhar o processamento;
- revisar o perfil extraído.

### Usuário autenticado com revisão pendente

Pode:

- revisar o Thin Twin;
- corrigir informações;
- adicionar informações;
- remover informações;
- resolver divergências;
- confirmar o perfil.

Não pode acessar o Core 1 enquanto o Thin Twin não estiver confirmado.

### Usuário autenticado com perfil confirmado e contexto-alvo pendente

Pode:

- visualizar o perfil confirmado;
- definir seu contexto-alvo;
- atualizar o perfil, gerando nova versão quando aplicável.

Não pode acessar o Core 1 enquanto o contexto-alvo obrigatório não estiver definido.

### Usuário autenticado com onboarding concluído

Pode:

- acessar o Core 1;
- acessar as funcionalidades liberadas;
- atualizar currículo ou LinkedIn;
- criar nova versão do Thin Twin;
- alterar o contexto-alvo;
- realizar futuras reanálises.

---

## 7. Pré-condições

Para iniciar o onboarding, o usuário deverá possuir:

- conta ativa;
- sessão autenticada;
- consentimentos obrigatórios registrados;
- acesso autorizado à rota de onboarding;
- vínculo válido entre conta e perfil;
- redirecionamento compatível com seu estado de jornada.

As regras de autenticação e proteção de acesso são regidas pelo PRD 00.

---

## 8. Estrutura do onboarding

O onboarding será simplificado e dividido em etapas orientadas.

### Etapas principais

1. Boas-vindas e explicação da jornada;
2. identificação básica;
3. envio do currículo;
4. envio do LinkedIn;
5. validação e processamento;
6. revisão do perfil profissional;
7. confirmação do Thin Twin;
8. definição do contexto-alvo;
9. conclusão.

O usuário não deverá preencher manualmente um formulário profissional extenso antes da extração.

As informações profissionais serão extraídas do currículo e do LinkedIn e apresentadas posteriormente para revisão.

---

## 9. Fluxo principal

1. O usuário autenticado acessa o onboarding.
2. O sistema verifica o estado atual.
3. O sistema apresenta a introdução e explica as etapas.
4. O usuário informa seu nome.
5. O usuário pode informar cidade e estado.
6. O usuário envia o currículo.
7. O usuário envia o conteúdo do LinkedIn.
8. O sistema valida extensão, MIME type, tamanho, integridade e segurança.
9. O sistema registra o início do processamento.
10. O sistema tenta extração textual nativa.
11. Quando necessário, o sistema executa OCR.
12. O sistema extrai e normaliza as informações.
13. O sistema identifica possíveis divergências, duplicidades e baixa diversidade entre fontes.
14. O sistema cria um rascunho do Thin Twin.
15. O usuário inicia a revisão.
16. O usuário confirma, corrige, remove ou adiciona informações.
17. O usuário resolve conflitos críticos.
18. O usuário confirma o perfil.
19. O sistema cria uma versão imutável do Thin Twin.
20. O usuário informa ou confirma seu contexto-alvo.
21. O sistema registra área de interesse, cargo-alvo, especialidade quando aplicável e senioridade desejada em versão própria.
22. O sistema conclui o onboarding.
23. O usuário é direcionado para o Core 1.

---

## 10. Continuidade e salvamento

### RF-ONB-001

O sistema deve registrar o estado do onboarding por usuário.

### RF-ONB-002

O usuário deve poder sair e retomar o onboarding.

### RF-ONB-003

Ao retornar, o sistema deve direcionar o usuário para a última etapa válida não concluída.

### RF-ONB-004

Dados válidos já salvos não devem ser perdidos após atualização da página ou nova sessão.

### RF-ONB-005

O sistema deve impedir que um usuário acesse os dados de onboarding de outro usuário.

### RF-ONB-006

O sistema deve apresentar o progresso da jornada de forma clara.

### RF-ONB-007

O usuário deve poder retornar a etapas anteriores enquanto o onboarding não estiver concluído.

### RF-ONB-008

O retorno a uma etapa anterior não deve apagar silenciosamente dados já confirmados.

### RF-ONB-009

O sistema deve registrar checkpoints das etapas de processamento.

### RF-ONB-010

Processamentos interrompidos devem ser retomados do último checkpoint válido.

---

## 11. Requisitos funcionais — Identificação básica

### RF-ONB-011

O sistema deve coletar o nome completo do usuário.

### RF-ONB-012

O usuário poderá informar cidade e estado opcionalmente.

### RF-ONB-013

O usuário deve poder editar os dados antes de concluir o onboarding.

### RF-ONB-014

O sistema deve validar o preenchimento do nome completo.

### RF-ONB-015

O sistema não deve coletar data de nascimento no MVP.

### RF-ONB-016

O sistema não deve coletar endereço residencial completo no MVP.

### RF-ONB-017

Os dados pessoais devem ser armazenados separadamente do contexto profissional.

### RF-ONB-018

Nome, cidade e estado não devem fazer parte do Thin Twin profissional.

### RF-ONB-019

Dados pessoais não devem influenciar:

- IPP;
- IAO;
- nível de confiança profissional;
- recomendações;
- diagnóstico de aderência;
- recomendação de candidatura.

### RF-ONB-020

Dados pessoais não devem ser enviados desnecessariamente ao modelo de IA.

---

## 12. Requisitos funcionais — Currículo

### RF-ONB-021

O currículo deve ser obrigatório para a conclusão do onboarding.

### RF-ONB-022

O sistema deve aceitar:

- PDF;
- DOCX;
- texto colado.

### RF-ONB-023

O sistema não deve aceitar:

- DOC legado;
- ZIP;
- arquivos compactados;
- imagens isoladas;
- HTML;
- RTF;
- arquivos executáveis;
- arquivos com macros;
- arquivos protegidos por senha.

### RF-ONB-024

Cada arquivo poderá possuir no máximo:

- 10 MB;
- 50 páginas;
- nome original de 120 caracteres.

### RF-ONB-025

Texto colado poderá possuir até 100.000 caracteres.

### RF-ONB-026

O sistema deve validar:

- extensão;
- MIME type real;
- presença de conteúdo;
- tamanho;
- quantidade de páginas;
- possibilidade de leitura;
- ausência de arquivo vazio;
- integridade;
- proteção por senha;
- compatibilidade com processamento;
- presença de conteúdo malicioso.

### RF-ONB-027

O usuário deve visualizar o estado do upload.

### RF-ONB-028

O usuário deve visualizar o progresso do upload.

### RF-ONB-029

O usuário deve visualizar o estado do processamento.

### RF-ONB-030

O usuário deve poder cancelar o upload enquanto ele estiver em andamento.

### RF-ONB-031

O usuário deve poder tentar novamente após falha.

### RF-ONB-032

O usuário deve poder remover um arquivo ainda não processado.

### RF-ONB-033

O usuário deve poder substituir o currículo.

### RF-ONB-034

A substituição deve registrar nova origem documental.

### RF-ONB-035

Quando o perfil estiver confirmado, a substituição poderá gerar nova versão do Thin Twin após revisão.

### RF-ONB-036

O Core 1 não deve ser liberado sem currículo válido.

### RF-ONB-037

A interface deve informar claramente formatos e limites aceitos.

### RF-ONB-038

O sistema não deve truncar ou descartar páginas silenciosamente.

---

## 13. Requisitos funcionais — LinkedIn

### RF-ONB-039

O conteúdo do LinkedIn deve ser obrigatório para a conclusão do onboarding.

### RF-ONB-040

O sistema deve aceitar:

- PDF exportado do LinkedIn;
- texto colado.

### RF-ONB-041

O PDF do LinkedIn seguirá os mesmos limites e regras de segurança do currículo.

### RF-ONB-042

A URL pública do LinkedIn poderá ser armazenada como referência.

### RF-ONB-043

A URL pública não poderá ser utilizada como única fonte da análise no MVP.

### RF-ONB-044

O sistema não deve depender de scraping do LinkedIn.

### RF-ONB-045

O usuário deve visualizar o estado do envio e do processamento.

### RF-ONB-046

O usuário deve poder tentar novamente após falha.

### RF-ONB-047

O usuário deve poder substituir o conteúdo do LinkedIn.

### RF-ONB-048

A substituição deve registrar nova origem documental.

### RF-ONB-049

Quando o perfil estiver confirmado, a substituição poderá gerar nova versão após revisão.

### RF-ONB-050

O Core 1 não deve ser liberado sem conteúdo válido do LinkedIn.

### RF-ONB-051

A interface deve explicar como exportar ou copiar as informações do LinkedIn.

---

## 14. Critério mínimo de conteúdo válido

### Currículo

O currículo será considerado minimamente válido quando possuir:

- pelo menos 300 caracteres úteis;
- pelo menos uma seção profissional reconhecível;
- pelo menos um dos seguintes:
    - experiência;
    - projeto;
    - formação;
    - atividade acadêmica relevante;
    - trabalho voluntário;
    - estágio.

### LinkedIn

O LinkedIn será considerado minimamente válido quando possuir:

- pelo menos 300 caracteres úteis;
- pelo menos duas categorias entre:
    - título profissional;
    - resumo;
    - experiências;
    - projetos;
    - formação;
    - competências.

### Regras complementares

O sistema também deve considerar:

- diversidade das informações;
- repetição excessiva;
- presença de conteúdo profissional;
- texto composto somente por menus;
- conteúdo corrompido;
- ausência de contexto.

### RF-ONB-052

O número de caracteres não deve ser o único critério de validade.

### RF-ONB-053

Conteúdo insuficiente deve gerar orientação clara para reenvio ou complemento.

### RF-ONB-054

O usuário não deve confirmar um Thin Twin definitivo baseado somente em conteúdo abaixo do mínimo.

---

## 15. Segurança de upload

### RF-ONB-055

O sistema deve utilizar allowlist de extensões.

### RF-ONB-056

O sistema deve identificar o tipo real do arquivo.

### RF-ONB-057

O arquivo deve receber nome interno gerado pelo sistema.

### RF-ONB-058

O sistema deve calcular checksum.

### RF-ONB-059

O sistema deve realizar verificação antimalware antes da extração.

### RF-ONB-060

Os arquivos devem permanecer fora de diretórios públicos.

### RF-ONB-061

Os arquivos não devem ser executados.

### RF-ONB-062

O acesso ao arquivo deve exigir autorização.

### RF-ONB-063

Mensagens de fila não devem conter o documento ou o texto completo.

### RF-ONB-064

Credenciais, tokens e URLs assinadas não devem ser enviados para analytics.

---

## 16. Upload e tempos de operação

### Metas de upload

- tempo esperado: até 30 segundos;
- aviso de conexão lenta: após 30 segundos sem progresso;
- timeout do cliente: 120 segundos.

### Metas de processamento

| Processamento | Mediana | Percentil 95 |
| --- | --- | --- |
| Texto nativo | Até 30 s | Até 60 s |
| OCR | Até 90 s | Até 180 s |

Timeout máximo por tentativa: 5 minutos.

### RF-ONB-065

O upload deve ocorrer preferencialmente por URL assinada ou mecanismo equivalente.

### RF-ONB-066

O usuário deve visualizar o percentual de upload.

### RF-ONB-067

Após 10 segundos de processamento, o sistema deve informar que a operação continua.

### RF-ONB-068

Após 60 segundos, o sistema deve apresentar mensagem de processamento prolongado.

### RF-ONB-069

O usuário não deve precisar manter a página aberta para que o processamento continue.

### RF-ONB-070

Após 5 minutos, a tentativa deve ser encerrada como falha recuperável.

---

## 17. Extração de documentos

### Pipeline definido

1. validação de segurança;
2. detecção de tipo;
3. extração textual nativa;
4. detecção de necessidade de OCR;
5. OCR quando aplicável;
6. normalização;
7. estruturação;
8. validação do resultado;
9. criação do rascunho do Thin Twin.

### Tecnologia de referência do MVP

- Apache Tika 3.x para detecção e extração;
- OCRmyPDF com Tesseract `por+eng` para PDFs escaneados;
- ClamAV ou serviço equivalente para antimalware;
- worker isolado e containerizado;
- interface interna `DocumentExtractor`.

Essas escolhas são substituíveis por decisão arquitetural registrada, desde que o contrato seja preservado.

### Contrato de extração

```
typeDocumentExtractionResult= {
  documentId:string;
  detectedMimeType:string;
  pageCount?:number;
  text:string;
  metadata:Record<string,unknown>;
  extractionMethod:"native"|"ocr"|"mixed";
  extractionConfidence:number;
  warnings:string[];
};
```

### RF-ONB-071

O sistema deve extrair, quando disponível:

- área atual;
- cargo atual;
- situação profissional;
- cargos anteriores;
- empresas;
- períodos;
- responsabilidades;
- projetos;
- competências;
- ferramentas;
- resultados;
- evidências;
- formação;
- certificações;
- sinais de senioridade observável.

### RF-ONB-072

Cada informação extraída deve registrar:

- fonte;
- tipo de fonte;
- trecho mínimo de evidência;
- localização, quando disponível;
- confiança;
- status de confirmação;
- data da extração.

A confiança da extração indica a segurança da interpretação do campo. Ela não é IPP, IAO nem confiança final de uma análise.

### RF-ONB-073

O sistema deve distinguir:

- currículo;
- LinkedIn;
- complemento do usuário;
- correção do usuário;
- inferência da IA.

### RF-ONB-074

O sistema deve identificar divergências e duplicidades.

### RF-ONB-075

O sistema deve normalizar informações equivalentes sem apagar a origem original.

### RF-ONB-076

Inferências não devem ser armazenadas como fatos confirmados.

### RF-ONB-077

Informações com baixa confiança devem ser destacadas.

### RF-ONB-078

Falhas parciais devem ser apresentadas sem perder dados processados.

### RF-ONB-079

A extração não deve calcular IPP ou IAO.

### RF-ONB-080

A extração não deve gerar recomendação definitiva de carreira.

---

## 18. OCR

### Critério inicial para acionamento

O OCR deverá ser acionado quando:

- houver menos de 20 caracteres úteis por página; ou
- mais de 70% das páginas não possuírem texto extraível.

### RF-ONB-081

O sistema deve tentar extração nativa antes do OCR.

### RF-ONB-082

O sistema deve registrar quando o conteúdo for obtido por OCR.

### RF-ONB-083

O sistema deve utilizar português e inglês como idiomas iniciais.

### RF-ONB-084

O resultado do OCR deve possuir nível de confiança.

### RF-ONB-085

Informações extraídas por OCR devem ser encaminhadas para revisão.

### RF-ONB-086

Se mais de 30% das páginas permanecerem ilegíveis, o documento deve ser classificado como parcialmente processado.

### RF-ONB-087

Nenhuma informação de baixa confiança deve ser tratada como fato confirmado.

---

## 19. Fila, retentativas e idempotência

O processamento deverá utilizar fila durável.

Configuração inicial:

- fila de validação;
- fila de extração;
- fila de OCR;
- fila de mensagens com falha;
- uma operação ativa por documento e usuário;
- visibility timeout de 6 minutos;
- três tentativas automáticas.

### Retentativas

| Tentativa | Intervalo |
| --- | --- |
| Primeira | 15 segundos |
| Segunda | 60 segundos |
| Terceira | 5 minutos |
| Após a terceira falha | DLQ |

### Chave de idempotência

```
userId + documentType + fileChecksum + extractorVersion
```

### RF-ONB-088

A repetição da mesma mensagem não deve criar documento duplicado.

### RF-ONB-089

A repetição não deve criar versões duplicadas.

### RF-ONB-090

A repetição não deve consumir crédito.

### RF-ONB-091

Dois processamentos idênticos não devem ocorrer simultaneamente.

### RF-ONB-092

Após a terceira falha, o job deve ser enviado para DLQ.

---

## 20. Recuperação após interrupção

### Estados do processamento

```
typeDocumentProcessingStatus=|"uploaded"|"validating"|"validated"|"queued"|"extracting"|"ocr_required"|"ocr_processing"|"normalizing"|"draft_created"|"awaiting_review"|"completed"|"failed_retryable"|"failed_final";
```

Esses estados representam a visão funcional deste PRD e devem possuir mapeamento explícito para o enum canônico de processamento definido no Modelo de Dados. A implementação não deve criar strings alternativas silenciosamente.

### RF-ONB-093

Cada etapa deve salvar um checkpoint.

### RF-ONB-094

Após interrupção, o job deve retomar do último checkpoint válido.

### RF-ONB-095

Etapas concluídas não devem ser repetidas sem necessidade.

### RF-ONB-096

Jobs sem atualização por dez minutos devem ser considerados travados.

### RF-ONB-097

Jobs travados devem retornar à fila.

### RF-ONB-098

O usuário deve poder solicitar tentativa manual após falha final.

### RF-ONB-099

O reenvio não será necessário enquanto o arquivo original estiver disponível.

### RF-ONB-100

Se o arquivo já tiver sido excluído, o usuário deverá enviá-lo novamente.

---

## 21. Arquivos protegidos por senha

### RF-ONB-101

Arquivos protegidos por senha não devem ser processados.

### RF-ONB-102

O sistema não deve solicitar ou armazenar a senha do arquivo.

### RF-ONB-103

O sistema não deve tentar remover a proteção.

### RF-ONB-104

O arquivo rejeitado deve ser excluído assim que tecnicamente possível.

### RF-ONB-105

O usuário deve poder enviar uma versão sem proteção ou colar o texto.

### RF-ONB-106

A rejeição não deve consumir crédito.

---

## 22. LinkedIn com conteúdo duplicado

A repetição entre currículo e LinkedIn não invalidará o material.

Quando a sobreposição textual ou semântica for superior a 85%:

```
source_diversity = low
```

### RF-ONB-107

O sistema deve identificar conteúdos repetidos.

### RF-ONB-108

A mesma evidência não deve ser contabilizada duas vezes.

### RF-ONB-109

O sistema deve registrar baixa diversidade de fontes.

### RF-ONB-110

A repetição não deve reduzir diretamente o IPP.

### RF-ONB-111

A repetição pode reduzir a força de corroboração entre fontes.

### RF-ONB-112

O sistema pode recomendar complementação do LinkedIn.

---

## 23. Thin Twin — Perfil profissional estruturado

O Thin Twin é uma representação persistente, estruturada, rastreável, versionada e confirmada da trajetória profissional do usuário.

Ele não é uma memória livre de conversa com inteligência artificial.

### Conteúdo possível

#### Posicionamento profissional observado

- área atual observada;
- cargo atual;
- senioridade observável;
- situação profissional, quando informada.

#### Experiências

- empresa, organização ou contexto;
- cargo ou função;
- período;
- descrição;
- responsabilidades;
- projetos;
- ferramentas;
- resultados;
- evidências.

#### Competências

- competência;
- domínio e tipo;
- experiência relacionada;
- fonte;
- evidência;
- confirmação do usuário.

#### Formação e certificações

- instituição;
- curso;
- período;
- situação;
- certificações.

#### Rastreabilidade

- fontes;
- trechos mínimos de evidência;
- confiança da extração;
- estado de confirmação;
- conflitos;
- versão do Thin Twin.

Não integram o Thin Twin:

- nome, e-mail, cidade ou estado;
- dados de autenticação;
- área-alvo, cargo-alvo, especialidade ou senioridade desejada;
- vagas, análises, recomendações, ações ou feedbacks.

Dados pessoais permanecem separados. O objetivo profissional pertence ao contexto-alvo e possui versionamento próprio.

---

## 24. Campos mínimos de uma experiência

Uma experiência deverá possuir:

- cargo ou função;
- empresa, organização ou contexto;
- data inicial, ao menos com o ano;
- data final ou indicação de atividade atual;
- pelo menos uma responsabilidade, entrega, projeto ou descrição contextual.

Campos opcionais:

- localização;
- modalidade;
- tipo de contrato;
- ferramentas;
- competências;
- projetos;
- resultados;
- métricas;
- evidências;
- equipe;
- stakeholders.

Contextos aceitos:

- trabalho autônomo;
- consultoria;
- estágio;
- voluntariado;
- projeto acadêmico;
- projeto pessoal;
- empresa confidencial.

Nenhuma métrica será obrigatória.

---

## 25. Taxonomia de competências

A CareerTwin utilizará uma taxonomia interna controlada e versionada.

### Categorias iniciais

1. Engenharia de Software;
2. Dados e Analytics;
3. Inteligência Artificial;
4. Infraestrutura, Cloud e DevOps;
5. Segurança;
6. Qualidade e Testes;
7. Produto;
8. Design;
9. Pesquisa;
10. Negócios e Estratégia;
11. Métodos e Processos;
12. Gestão e Liderança;
13. Comunicação e Colaboração;
14. Idiomas;
15. Outras competências profissionais.

### Estrutura

```
typeCanonicalSkill= {
  id:string;
  canonicalName:string;
  skillDomain:string;
  skillType:string;
  aliases:string[];
  description?:string;
  status:"active"|"deprecated"|"pending_review";
  taxonomyVersion:string;
};
```

### Regras

- preservar o termo original;
- associar a uma competência canônica quando houver confiança;
- registrar domínio e tipo separadamente;
- não inferir nível de domínio sem evidência;
- exigir contexto para competências comportamentais;
- não tratar adjetivos como competências confirmadas automaticamente;
- manter termos desconhecidos como `pending_review`;
- não descartar termos silenciosamente.

No banco de dados, os campos correspondentes poderão ser persistidos como `skill_domain` e `skill_type`.

---

## 26. Taxonomia de ferramentas

Ferramentas serão armazenadas separadamente das competências.

### Categorias

1. linguagens de programação;
2. frameworks e bibliotecas;
3. bancos de dados;
4. dados e BI;
5. cloud;
6. DevOps e infraestrutura;
7. testes e qualidade;
8. segurança;
9. produto e gestão;
10. design e prototipação;
11. pesquisa;
12. colaboração;
13. CRM e vendas;
14. inteligência artificial e automação;
15. outras ferramentas.

### Estrutura

```
typeCanonicalTool= {
  id:string;
  canonicalName:string;
  vendor?:string;
  toolCategory:string;
  aliases:string[];
  versions?:string[];
  taxonomyVersion:string;
};
```

### Regras

- tecnologia específica deve ser tratada como ferramenta;
- competência deve representar capacidade profissional;
- versões só serão registradas quando informadas;
- aliases deverão normalizar siglas e nomes;
- o termo original deverá ser preservado;
- ferramentas desconhecidas deverão ser mantidas para revisão.

No banco de dados, o campo correspondente poderá ser persistido como `tool_category`.

---

## 27. Normalização de cargos

### Estrutura

```
typeNormalizedRole= {
  originalTitle:string;
  canonicalTitle?:string;
  roleFamily?:string;
  specialty?:string;
  seniority?:"intern"|"junior"|"mid"|"senior";
  track?:"individual_contributor"|"management"|"unknown";
  confidence:number;
  confirmedByUser:boolean;
};
```

### Regras

- o título original nunca será substituído;
- a normalização não dependerá somente do título;
- responsabilidades, escopo e contexto deverão ser considerados;
- títulos como analista, especialista, consultor e coordenador não determinam senioridade;
- a IA poderá sugerir classificação;
- a classificação só será confirmada após revisão;
- os mapeamentos deverão ser versionados.

---

## 28. Normalização de períodos

```
typeExperiencePeriod= {
  startDate:string;
  endDate:string|null;
  startPrecision:"month"|"year";
  endPrecision:"month"|"year"|"ongoing";
  ongoing:boolean;
};
```

### Regras

- formato preferencial: `YYYY-MM`;
- datas somente com ano serão permitidas;
- “atual” e equivalentes serão normalizados como `ongoing`;
- data final não poderá ser anterior à inicial;
- períodos sobrepostos serão permitidos;
- sobreposição gera alerta, não bloqueio automático;
- atividades simultâneas são válidas;
- duração total da carreira não soma períodos simultâneos duas vezes;
- datas originais permanecem como evidência.

---

## 29. Definição de conflito crítico

Um conflito será crítico quando:

1. envolver informações incompatíveis;
2. afetar um fato profissional central;
3. puder alterar significativamente análise ou score;
4. não puder ser resolvido automaticamente com segurança.

### Exemplos críticos

- empresas diferentes para a mesma experiência;
- cargos materialmente diferentes;
- emprego atual em uma fonte e encerrado em outra;
- datas com diferença superior a seis meses;
- formação existente em uma fonte e ausente ou negada em outra;
- certificação obrigatória conflitante;
- senioridade incompatível;
- experiência duplicada com informações conflitantes.

### Exemplos não críticos

- capitalização;
- abreviação;
- pequenas diferenças de redação;
- mês ausente em uma fonte;
- descrição mais detalhada em uma fonte;
- nome fantasia versus razão social;
- diferença de até um mês.

### Regra de bloqueio

Conflitos críticos de:

- empresa;
- cargo;
- período principal;
- situação atual;
- formação;
- certificação obrigatória;
- senioridade observável;

devem bloquear a confirmação do Thin Twin até resolução. Divergências do contexto-alvo devem ser tratadas na etapa própria e não como conflito interno do Thin Twin.

---

## 30. Requisitos funcionais — Revisão do perfil

### Estrutura da revisão

1. Resumo;
2. conflitos e itens de atenção;
3. experiências;
4. projetos;
5. competências;
6. ferramentas;
7. formação;
8. certificações;
9. confirmação final.

O contexto-alvo é definido em etapa separada após a confirmação do Thin Twin.

### RF-ONB-113

O sistema deve apresentar o perfil extraído antes de análise definitiva.

### RF-ONB-114

O sistema deve organizar o conteúdo em seções compreensíveis.

### RF-ONB-115

O usuário deve poder:

- confirmar;
- editar;
- remover;
- adicionar informações.

### RF-ONB-116

O usuário deve poder complementar experiências, responsabilidades, projetos, competências, ferramentas, resultados, evidências, formação e certificações.

### RF-ONB-117

Divergências devem ser apresentadas para resolução.

### RF-ONB-118

O sistema deve diferenciar visualmente:

- informação extraída;
- informação adicionada;
- informação corrigida;
- informação confirmada;
- baixa confiança;
- divergência;
- inferência não confirmada.

### RF-ONB-119

O usuário deve poder escolher a informação correta.

### RF-ONB-120

O usuário deve poder editar quando nenhuma opção estiver correta.

### RF-ONB-121

A referência original deve ser preservada após correção.

### RF-ONB-122

A correção do usuário prevalece sobre a extração.

### RF-ONB-123

A autoria da correção deve ser registrada.

### RF-ONB-124

Somente informações fornecidas ou confirmadas podem ser fatos profissionais.

### RF-ONB-125

O Core 1 não deve ser liberado antes da confirmação do Thin Twin e da existência de um contexto-alvo válido.

### RF-ONB-126

Conflitos críticos devem bloquear confirmação.

### RF-ONB-127

Conflitos não críticos poderão permanecer registrados.

---

## 31. Layout da revisão

### Desktop

- navegação lateral;
- conteúdo principal central;
- painel de evidências à direita;
- barra de ações fixa;
- indicador de progresso.

### Mobile

- navegação sequencial;
- uma seção por vez;
- evidências em Sheet ou Drawer;
- barra de ações fixa inferior.

### Cada item deverá mostrar

- conteúdo;
- fonte;
- status;
- confiança;
- divergências;
- evidência;
- editar;
- confirmar;
- remover.

### Componentes shadcn/ui

- `Card`;
- `Tabs`;
- `Accordion`;
- `Badge`;
- `Alert`;
- `Dialog`;
- `Sheet`;
- `Progress`;
- `Button`;
- `Tooltip`;
- `Skeleton`.

### Regras de UX

- conflitos críticos aparecem primeiro;
- o usuário pode salvar e continuar depois;
- alterações não são descartadas silenciosamente;
- ações destrutivas exigem confirmação;
- confirmação final só é liberada após requisitos obrigatórios;
- informações conflitantes ou de baixa confiança não podem ser confirmadas em massa.

---

## 32. Requisitos funcionais — Confirmação do perfil

### RF-ONB-128

O sistema deve solicitar ação explícita para confirmar o Thin Twin.

### RF-ONB-129

A interface deve informar que as análises utilizarão os dados revisados.

### RF-ONB-130

A confirmação deve registrar:

- usuário;
- data e hora;
- versão;
- fontes;
- campos confirmados;
- conflitos resolvidos;
- conflitos remanescentes;
- nível de completude.

### RF-ONB-131

A confirmação não deve transformar inferências em fatos automaticamente.

### RF-ONB-132

Inferências só poderão integrar fatos após confirmação do usuário.

### RF-ONB-133

Após a confirmação, o sistema deve criar versão imutável do Thin Twin.

---

## 33. Versionamento

### Atualização relevante

Geram nova versão:

- inclusão ou remoção de experiência;
- alteração de empresa;
- alteração de cargo;
- alteração relevante de período;
- nova responsabilidade;
- novo projeto;
- nova competência confirmada;
- nova ferramenta com evidência;
- novo resultado;
- nova formação;
- nova certificação;
- substituição de currículo;
- substituição de LinkedIn;
- correção de conflito crítico.

Não geram nova versão:

- correção ortográfica;
- capitalização;
- formatação;
- alteração visual;
- reordenação sem mudança semântica;
- texto auxiliar de interface.

### Contexto-alvo

Área de interesse, cargo-alvo, especialidade quando aplicável e senioridade desejada utilizarão versionamento separado:

```
target_context_version
```

### RF-ONB-134

A primeira confirmação deve criar a versão inicial.

### RF-ONB-135

Atualizações relevantes devem gerar nova versão.

### RF-ONB-136

Versões anteriores não devem ser sobrescritas.

### RF-ONB-137

Cada versão deve registrar identificador, usuário, data, origem, campos alterados, confirmação e vínculo anterior.

### RF-ONB-138

Cada análise deve registrar a versão utilizada.

### RF-ONB-139

Atualização de perfil não deve alterar análises anteriores.

---

## 34. Requisitos funcionais — Contexto-alvo

### RF-ONB-140

Antes de concluir o onboarding, o usuário deve informar ou confirmar:

- área de interesse;
- cargo-alvo;
- especialidade, quando aplicável;
- senioridade desejada.

### RF-ONB-141

O usuário deve poder informar manualmente o cargo.

### RF-ONB-142

O sistema poderá sugerir até três cargos relacionados.

### RF-ONB-143

Sugestões devem ser apoio à decisão.

### RF-ONB-144

Sugestões não devem ser apresentadas como carreira ideal ou definitiva.

### RF-ONB-145

O usuário deve escolher uma sugestão ou informar o cargo final.

### RF-ONB-146

O contexto-alvo poderá ser alterado posteriormente sem criar nova versão do Thin Twin.

### RF-ONB-147

A alteração deve criar nova `target_context_version` e preservar as versões anteriores utilizadas por análises.

### RF-ONB-148

O sistema deve distinguir:

- senioridade observável;
- senioridade atual informada;
- senioridade desejada.

### RF-ONB-149

O sistema não deve elevar artificialmente a senioridade.

---

## 35. Limites de registros

| Entidade | Limite |
| --- | --- |
| Experiências | 30 |
| Projetos | 50 |
| Competências | 150 |
| Ferramentas | 100 |
| Formações | 20 |
| Certificações | 50 |
| Evidências por experiência | 20 |
| Responsabilidades por experiência | 30 |

### Regras

- os limites não geram corte silencioso;
- o usuário deverá ser informado;
- nenhum item será descartado;
- itens poderão ser consolidados;
- casos excepcionais poderão ser avaliados;
- os limites serão configuráveis e versionados.

---

## 36. Requisitos funcionais — Conclusão do onboarding

### RF-ONB-150

O onboarding será concluído somente quando:

- nome estiver válido;
- currículo estiver válido;
- LinkedIn estiver válido;
- extração estiver concluída ou revisada;
- conflitos críticos estiverem resolvidos;
- Thin Twin estiver confirmado;
- área de interesse estiver definida;
- cargo-alvo estiver definido;
- senioridade desejada estiver definida.

### RF-ONB-151

O sistema deve registrar o status de conclusão.

### RF-ONB-152

O sistema deve registrar o evento correspondente.

### RF-ONB-153

Após a conclusão, o usuário deve ser direcionado para o Core 1.

### RF-ONB-154

O usuário deve poder retornar para atualizar o perfil.

### RF-ONB-155

Atualizações posteriores devem seguir revisão, confirmação e versionamento.

---

## 37. Retenção e exclusão de arquivos

### Retenção

| Artefato | Retenção |
| --- | --- |
| Arquivo original elegível | Até 24 horas |
| Imagens de OCR após sucesso | Até 6 horas |
| PDF temporário de OCR | Até 6 horas |
| Artefatos de tentativa com falha | Até 24 horas |
| Logs técnicos sem conteúdo profissional | 30 dias |
| Conteúdo estruturado confirmado | Conforme política da conta |

### Meta operacional

> 99% dos arquivos originais elegíveis excluídos em até 24 horas.
> 

### Elegibilidade

Um arquivo será elegível quando:

1. a extração terminar;
2. o conteúdo estruturado estiver persistido;
3. a integridade estiver validada;
4. não existir nova tentativa ativa.

### Operação

- job de exclusão a cada hora;
- alerta após 18 horas;
- incidente após 24 horas;
- novas tentativas automáticas;
- registro da elegibilidade;
- registro das tentativas;
- registro da confirmação.

### RF-ONB-156

Artefatos não devem ser mantidos indefinidamente para depuração.

### RF-ONB-157

O acesso administrativo deve ser registrado.

### RF-ONB-158

A fila deve armazenar apenas identificadores.

---

## 38. Regras de negócio

### RN-ONB-001

Currículo e LinkedIn são obrigatórios.

### RN-ONB-002

Somente informações fornecidas ou confirmadas podem ser fatos.

### RN-ONB-003

Inferências não podem ser armazenadas como fatos confirmados.

### RN-ONB-004

Dados pessoais não influenciam análises, scores ou recomendações.

### RN-ONB-005

Dados pessoais permanecem separados do contexto profissional.

### RN-ONB-006

Arquivos originais são temporários.

### RN-ONB-007

O usuário só pode acessar seus próprios documentos e perfis.

### RN-ONB-008

Políticas de acesso devem existir no backend e banco.

### RN-ONB-009

Falhas técnicas não consomem créditos.

### RN-ONB-010

URL pública do LinkedIn não é fonte suficiente.

### RN-ONB-011

O produto não realiza scraping do LinkedIn.

### RN-ONB-012

A IA não pode:

- inventar experiências;
- criar métricas;
- criar resultados;
- atribuir ferramentas não informadas;
- adicionar certificações;
- modificar cargos sem confirmação;
- elevar senioridade sem evidências;
- transformar colaboração em liderança;
- transformar participação em responsabilidade integral.

### RN-ONB-013

A correção mais recente confirmada prevalece em conflitos.

### RN-ONB-014

Nome, cidade e estado não integram o Thin Twin profissional.

### RN-ONB-015

A conclusão do onboarding não consome crédito.

### RN-ONB-016

Consentimentos opcionais não bloqueiam o produto.

### RN-ONB-017

A linguagem deve ser clara, acolhedora e não julgadora.

### RN-ONB-018

Ausência de evidência não significa ausência de competência.

### RN-ONB-019

Nenhuma informação deve ser descartada silenciosamente.

### RN-ONB-020

Nenhum limite ou regra pode ser alterado sem versionamento.

---

## 39. Estados da interface

### Estados gerais

- onboarding não iniciado;
- onboarding em andamento;
- onboarding pausado;
- etapa concluída;
- etapa bloqueada;
- onboarding concluído.

### Identificação

- formulário inicial;
- preenchimento parcial;
- campo inválido;
- salvamento;
- dados salvos;
- falha.

### Upload

- aguardando arquivo;
- arquivo selecionado;
- validação;
- arquivo válido;
- arquivo inválido;
- upload;
- upload concluído;
- falha;
- cancelamento;
- substituição.

### Processamento

- em fila;
- extração nativa;
- OCR necessário;
- OCR em andamento;
- normalização;
- rascunho criado;
- processamento prolongado;
- extração parcial;
- baixa confiança;
- falha recuperável;
- falha final.

### Revisão

- não iniciada;
- em andamento;
- divergência pendente;
- conflito crítico;
- baixa confiança;
- alterações não salvas;
- concluída;
- confirmação pendente.

### Perfil

- rascunho;
- não confirmado;
- confirmado;
- nova versão pendente;
- nova versão criada.

### Contexto-alvo

- pendente;
- sugestões disponíveis;
- cargo informado;
- senioridade pendente;
- contexto confirmado.

---

## 40. Mensagens essenciais

### Introdução

> Vamos organizar sua trajetória profissional para criar análises mais confiáveis e úteis.
> 

### Currículo

> Envie seu currículo em PDF ou DOCX. Também é possível colar o conteúdo em texto.
> 

### LinkedIn

> Envie o PDF exportado do LinkedIn ou cole o conteúdo do seu perfil.
> 

### Upload concluído

> Material recebido. Agora vamos validar e organizar o conteúdo.
> 

### Processamento

> Estamos organizando suas informações profissionais. Isso pode levar alguns instantes.
> 

### Processamento prolongado

> O processamento está levando mais tempo que o normal. Você pode continuar depois; seu progresso será preservado.
> 

### OCR

> Este documento não possui texto pesquisável. Vamos tentar reconhecer o conteúdo das páginas.
> 

### Baixa confiança

> Não conseguimos confirmar esta informação com segurança. Revise antes de continuar.
> 

### Divergência

> Encontramos informações diferentes no currículo e no LinkedIn. Escolha a versão correta ou edite o conteúdo.
> 

### Extração parcial

> Conseguimos processar parte das informações. Revise o conteúdo identificado e reenvie o material que apresentou problema.
> 

### Erro técnico

> Não foi possível processar este material agora. Tente novamente. Seu progresso foi preservado.
> 

### Arquivo protegido

> Este arquivo está protegido por senha. Envie uma versão sem proteção ou cole o conteúdo em texto.
> 

### Conteúdo insuficiente

> O conteúdo recebido não possui informações profissionais suficientes para criar um perfil confiável. Envie outro documento ou complemente o conteúdo em texto.
> 

### Conteúdo repetido

> Seu currículo e LinkedIn apresentam conteúdos muito semelhantes. Isso não impede a análise, mas informações complementares no LinkedIn podem aumentar a qualidade do diagnóstico.
> 

### Confirmação

> Confirme se estas informações representam corretamente sua trajetória. As próximas análises utilizarão esta versão do perfil.
> 

### Perfil confirmado

> Seu perfil profissional foi confirmado. Agora vamos definir seu contexto-alvo.
> 

### Onboarding concluído

> Seu perfil está pronto. Agora você pode iniciar sua Análise de Perfil.
> 

---

## 41. Analytics

### Onboarding

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

Eventos de OCR, jobs, exclusão de arquivos e falhas técnicas pertencem à observabilidade ou auditoria e não devem ser criados como eventos de produto sem registro prévio no catálogo canônico de Analytics.

### Propriedades permitidas

- etapa;
- status;
- tipo de documento;
- formato;
- categoria do erro;
- duração;
- quantidade de divergências;
- quantidade de correções;
- confiança agregada;
- versão do Thin Twin;
- versão do contexto-alvo;
- método de extração;
- quantidade de tentativas;
- origem da retomada.

### Dados proibidos

- nome completo;
- cidade;
- estado;
- e-mail;
- currículo;
- LinkedIn;
- texto de experiências;
- evidências;
- tokens;
- URLs privadas;
- documentos;
- conteúdo extraído.

---

## 42. Requisitos não funcionais

### RNF-ONB-001 — Responsividade

O onboarding deve funcionar em desktop, tablet e mobile.

### RNF-ONB-002 — Acessibilidade

A interface deve possuir HTML semântico, navegação por teclado, foco visível, labels, mensagens acessíveis, contraste e progresso compreensível.

### RNF-ONB-003 — Segurança

Arquivos e dados devem ser protegidos por autenticação e autorização.

### RNF-ONB-004 — Isolamento

Nenhum usuário deve acessar dados de outro usuário.

### RNF-ONB-005 — Integridade

Falhas não devem corromper informações salvas.

### RNF-ONB-006 — Rastreabilidade

Toda informação profissional deve possuir origem e confirmação.

### RNF-ONB-007 — Performance

Operações demoradas devem informar estado e progresso.

### RNF-ONB-008 — Idempotência

Repetições não devem criar registros duplicados.

### RNF-ONB-009 — Observabilidade

Jobs, falhas, tempos e exclusões devem possuir monitoramento técnico.

### RNF-ONB-010 — Design System

A interface deve utilizar shadcn/ui, Tailwind CSS, tokens CareerTwin, Lucide React e componentes acessíveis.

### RNF-ONB-011 — Identidade

A interface deve utilizar logos oficiais sem distorção ou reconstrução.

### RNF-ONB-012 — Configuração

Limites, tempos e regras devem permanecer em configuração versionada.

---

## 43. Configuração funcional inicial

Os valores abaixo representam o contrato funcional inicial do MVP. Alterações materiais devem ser versionadas e registradas no Decision Log; escolhas de infraestrutura permanecem subordinadas à Arquitetura.

```
exportconstONBOARDING_CONFIG= {
  documents: {
    allowedExtensions: ["pdf","docx","txt"],
    maxFileSizeMb:10,
    maxPages:50,
    maxOriginalFileNameCharacters:120,
    maxPastedTextCharacters:100_000,
    passwordProtectedFiles:"reject",
  },

  upload: {
    timeoutSeconds:120,
    slowConnectionWarningSeconds:30,
  },

  processing: {
    nativeMedianSeconds:30,
    nativeP95Seconds:60,
    ocrMedianSeconds:90,
    ocrP95Seconds:180,
    attemptTimeoutSeconds:300,
    maxAttempts:3,
    visibilityTimeoutSeconds:360,
    stalledJobMinutes:10,
  },

  retention: {
    originalFileHours:24,
    successfulIntermediateHours:6,
    failedIntermediateHours:24,
    technicalLogDays:30,
  },

  content: {
    minimumUsefulCharacters:300,
    duplicateSourceThreshold:0.85,
    ocrMinimumCharactersPerPage:20,
    ocrPagesWithoutTextThreshold:0.70,
  },

  limits: {
    experiences:30,
    projects:50,
    skills:150,
    tools:100,
    education:20,
    certifications:50,
    evidencePerExperience:20,
    responsibilitiesPerExperience:30,
  },

  personalData: {
    fullName:"required",
    city:"optional",
    state:"optional",
    birthDate:"not_collected",
    postalCode:"not_collected",
    fullAddress:"not_collected",
  },
}asconst;
```

---

## 44. Critérios de aceite

O PRD será considerado atendido quando:

1. o usuário autenticado conseguir iniciar o onboarding;
2. o usuário conseguir sair e retomar;
3. o sistema preservar etapas concluídas;
4. o usuário informar nome;
5. cidade e estado forem opcionais;
6. data de nascimento e endereço não forem coletados;
7. dados pessoais permanecerem separados;
8. o currículo puder ser enviado nos formatos permitidos;
9. o LinkedIn puder ser enviado nos formatos permitidos;
10. limites de 10 MB e 50 páginas forem aplicados;
11. arquivos protegidos forem rejeitados com segurança;
12. arquivos forem validados por tipo real;
13. antimalware for aplicado;
14. upload apresentar progresso;
15. erros permitirem nova tentativa;
16. falhas em um documento não apagarem o outro;
17. conteúdo insuficiente for identificado;
18. PDFs de imagem acionarem OCR;
19. método de extração e confiança forem registrados;
20. processamentos forem assíncronos;
21. fila e retentativas forem implementadas;
22. idempotência impedir duplicidades;
23. interrupções forem recuperáveis;
24. o sistema criar rascunho do Thin Twin;
25. cada informação possuir origem;
26. inferências não forem tratadas como fatos;
27. divergências forem identificadas;
28. conflitos críticos bloquearem confirmação;
29. o usuário conseguir corrigir, adicionar e remover;
30. a revisão utilizar experiência guiada;
31. o usuário confirmar explicitamente o perfil;
32. a confirmação criar versão imutável;
33. versões anteriores não forem sobrescritas;
34. análises registrarem a versão utilizada;
35. competências e ferramentas forem armazenadas separadamente;
36. cargos e períodos forem normalizados com rastreabilidade;
37. o usuário definir área, cargo, especialidade quando aplicável e senioridade desejada;
38. alteração do contexto-alvo criar `target_context_version` sem alterar o Thin Twin;
39. o Core 1 só for liberado após Thin Twin confirmado e contexto-alvo válido;
40. arquivos temporários forem excluídos no prazo;
41. falhas técnicas não consumirem créditos;
42. dados profissionais não forem enviados para analytics;
43. a interface funcionar em desktop, tablet e mobile;
44. a experiência atender requisitos mínimos de acessibilidade;
45. shadcn/ui for utilizado como base;
46. logos oficiais forem utilizados sem distorção;
47. limites e configurações forem versionados;
48. nenhuma informação for descartada silenciosamente.

---

## 45. Fora do escopo deste PRD

- cadastro;
- login;
- recuperação de senha;
- gerenciamento geral da sessão;
- exclusão da conta;
- Home/LP;
- scraping do LinkedIn;
- leitura automática de URL pública;
- Core 1;
- IPP;
- Core 2;
- IAO;
- análise de vaga;
- recomendação de candidatura;
- edição direta de currículo;
- edição direta de LinkedIn;
- geração completa de currículo;
- orientação vocacional completa;
- busca automática de vagas;
- candidatura automática;
- pagamento;
- assinatura;
- aplicativo mobile nativo;
- coleta de data de nascimento;
- coleta de endereço residencial completo;
- consulta de CEP.

---

## 46. Dependências de implementação

- CareerTwin — Fonte Canônica de Contexto vigente;
- CareerTwin — Product One Page;
- PRD 00 — Site Público, Home/LP e Autenticação;
- PRD 02 — Core 1: Análise de Perfil;
- PRD 03 — Core 2: Diagnóstico de Aderência;
- CareerTwin — Motor de Análise e Scores;
- CareerTwin — Style Guide para Claude Code;
- Design System baseado em shadcn/ui;
- serviço de autenticação;
- banco de dados;
- armazenamento privado temporário;
- fila durável;
- worker de processamento;
- Apache Tika ou implementação equivalente;
- OCRmyPDF e Tesseract ou implementação equivalente;
- antimalware;
- integração com inteligência artificial;
- analytics;
- observabilidade e monitoramento;
- políticas de segurança e privacidade;
- processo de incidentes.

---

## 47. Definições desta versão

Os seguintes pontos compõem o contrato funcional inicial do MVP:

- tamanho máximo de documentos;
- quantidade máxima de páginas;
- limite de texto colado;
- formatos permitidos;
- rejeição de arquivos protegidos;
- tempos de upload;
- tempos de processamento;
- critérios mínimos de conteúdo;
- tratamento de PDFs escaneados;
- pipeline de extração;
- fila e retentativas;
- idempotência;
- retenção de artefatos;
- tratamento de conteúdo duplicado;
- taxonomia inicial de competências;
- taxonomia inicial de ferramentas;
- normalização de cargos;
- normalização de períodos;
- conflito crítico;
- atualização profissional relevante;
- campos mínimos de experiência;
- não coleta de CEP;
- não coleta de endereço;
- conteúdo inicial das mensagens;
- layout da revisão;
- limites de entidades;
- meta operacional de exclusão;
- arquivos protegidos;
- recuperação após interrupção.

Nenhum desses pontos deve ser redefinido silenciosamente pelo Claude Code. Tecnologias de extração, OCR, antimalware, filas e infraestrutura somente serão tratadas como baseline definitivo após aprovação na Arquitetura e no Decision Log.

---

## 48. Documentos relacionados

### Documento anterior

- PRD 00 — Site Público, Home/LP e Autenticação.

### Documentos posteriores

- PRD 02 — Core 1: Análise de Perfil;
- PRD 03 — Core 2: Diagnóstico de Aderência.

### Documentos transversais

- CareerTwin — Product One Page;
- CareerTwin — Fonte Canônica de Contexto vigente;
- CareerTwin — Motor de Análise e Scores;
- CareerTwin — Style Guide para Claude Code;
- Decision Log;
- Thin Twin;
- Modelo de Dados;
- Arquitetura;
- Privacidade e Segurança;
- Analytics;
- Incidentes;
- Qualidade da IA e Casos de Teste.

---

## 49. Definição resumida

> **O usuário autenticado informa seu nome, envia currículo e LinkedIn, acompanha a validação e o processamento, revisa e confirma um Thin Twin rastreável e versionado, define separadamente seu contexto-alvo e conclui o onboarding com as entradas necessárias para o Core 1 e o Core 2.**
>