# Extração estruturada — Onboarding e Thin Twin

> Documento de extração técnica gerado a partir das fontes abaixo. Termos de domínio, nomes de campos, nomes de estados e valores de enum foram preservados exatamente como aparecem nas fontes (não traduzidos, não parafraseados) para servir de base a um modelo de dados e a schemas Zod.

---

## Fontes

| Documento | Caminho | Propósito | Data/versão |
| --- | --- | --- | --- |
| **PRD 01 — Onboarding e Perfil** | `Insumos para Desenvolvimento/PRD 01 — Onboarding e Perfil 3ab7f20949da80709bd3fedb60202c71.md` | Requisitos funcionais, regras de negócio, estados, eventos, critérios de aceite e decisões de implementação do onboarding e da construção do perfil profissional estruturado (Thin Twin) do CareerTwin. Cobre da autenticação já concluída até a liberação do Core 1. | Criado em: 27 de julho de 2026 23:15 |
| **Thin Twin** | `Inteligência Artificial - Estrutura, análise e confiabilidade da inteligência do produto/Thin Twin 3ab7f20949da8020a5a4f5832bb0a3ff.md` | Define o Thin Twin como representação profissional estruturada, persistente, confirmada e versionada: princípios, estrutura conceitual, metadados obrigatórios, estados de confirmação, confiança de extração, tratamento de inferências, normalização, resolução de conflitos, versionamento, ciclo de vida, invariantes e um objeto conceitual de exemplo. | Criado em: 27 de julho de 2026 23:00 |

Ambos os documentos se referenciam mutuamente e citam dependências externas não lidas nesta tarefa: PRD 00 (Site Público, Home/LP e Autenticação), PRD 02 (Core 1), PRD 03 (Core 2), CareerTwin — Fonte Canônica de Contexto vigente, CareerTwin — Product One Page, CareerTwin — Arquitetura, CareerTwin — Modelo de Dados, CareerTwin — Privacidade e Segurança, CareerTwin — Analytics, CareerTwin — Style Guide para Claude Code, Decision Log, Prompts e Schemas.

---

## PRD 01 — Onboarding e Perfil (completo)

### Resumo executivo (seção 1 do PRD)

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

O documento cobre explicitamente até: identificação básica, localização opcional, envio de currículo, envio de LinkedIn, validação, análise de segurança, processamento/extração, OCR, criação do rascunho do Thin Twin, revisão/confirmação, identificação e resolução de divergências, normalização de cargos/períodos, organização de competências/ferramentas, versionamento do Thin Twin, definição do contexto-alvo, conclusão do onboarding, retenção/exclusão de arquivos temporários, e recuperação de processamentos interrompidos.

Fora de escopo do PRD 01: criação de conta, login, recuperação de senha, sessão, exclusão de conta, Home/LP, cálculo de IPP, geração de recomendações do Core 1, cálculo de IAO, diagnóstico de cargo/vaga, dashboard, pagamento, edição automática de currículo/LinkedIn, orientação vocacional completa.

### Estrutura do onboarding (9 etapas principais, seção 8)

1. Boas-vindas e explicação da jornada;
2. identificação básica;
3. envio do currículo;
4. envio do LinkedIn;
5. validação e processamento;
6. revisão do perfil profissional;
7. confirmação do Thin Twin;
8. definição do contexto-alvo;
9. conclusão.

O usuário **não** preenche formulário profissional extenso — os dados profissionais são extraídos de currículo/LinkedIn e apresentados depois para revisão.

### Fluxo principal detalhado (seção 9, passo a passo numerado no PRD)

1. Usuário autenticado acessa o onboarding.
2. Sistema verifica o estado atual.
3. Sistema apresenta introdução e explica etapas.
4. Usuário informa nome.
5. Usuário pode informar cidade e estado.
6. Usuário envia currículo.
7. Usuário envia conteúdo do LinkedIn.
8. Sistema valida extensão, MIME type, tamanho, integridade e segurança.
9. Sistema registra início do processamento.
10. Sistema tenta extração textual nativa.
11. Quando necessário, sistema executa OCR.
12. Sistema extrai e normaliza informações.
13. Sistema identifica possíveis divergências, duplicidades e baixa diversidade entre fontes.
14. Sistema cria rascunho do Thin Twin.
15. Usuário inicia revisão.
16. Usuário confirma, corrige, remove ou adiciona informações.
17. Usuário resolve conflitos críticos.
18. Usuário confirma o perfil.
19. Sistema cria versão imutável do Thin Twin.
20. Usuário informa ou confirma seu contexto-alvo.
21. Sistema registra área de interesse, cargo-alvo, especialidade (quando aplicável) e senioridade desejada em versão própria.
22. Sistema conclui o onboarding.
23. Usuário é direcionado para o Core 1.

### Princípio de minimização de dados pessoais (seção 5)

**Dados coletados:**
- `nome completo` — **obrigatório**;
- `cidade` — opcional;
- `estado` — opcional.

**Dados explicitamente NÃO coletados no MVP:**
- data de nascimento;
- CEP;
- logradouro;
- número;
- complemento;
- bairro;
- endereço residencial completo.

**Regras:** dados pessoais não fazem parte do Thin Twin profissional; não influenciam IPP, IAO, nível de confiança profissional, recomendações; não determinam senioridade nem aderência; não devem ser enviados ao modelo de IA sem necessidade; devem ser armazenados separadamente dos dados profissionais.

Cidade/estado só poderão ser usados em análises futuras de localidade quando: usuário autorizar; vaga possuir requisito geográfico explícito; finalidade estiver claramente informada.

### Campos de identificação básica — nome exato dos campos e regras (seções 5, 11)

| Campo | Tipo/obrigatoriedade | Regras |
| --- | --- | --- |
| `nome completo` | string, **obrigatório** | RF-ONB-011 (coleta), RF-ONB-014 (deve validar preenchimento) |
| `cidade` | string, opcional | RF-ONB-012 |
| `estado` | string, opcional | RF-ONB-012 |
| data de nascimento | **não coletado** | RF-ONB-015 |
| endereço residencial completo | **não coletado** | RF-ONB-016 |

RF-ONB-013: usuário deve poder editar dados antes de concluir o onboarding.
RF-ONB-017: dados pessoais armazenados separadamente do contexto profissional.
RF-ONB-018: nome, cidade e estado não fazem parte do Thin Twin profissional.
RF-ONB-019: dados pessoais não influenciam IPP, IAO, nível de confiança profissional, recomendações, diagnóstico de aderência, recomendação de candidatura.
RF-ONB-020: dados pessoais não devem ser enviados desnecessariamente ao modelo de IA.

### Requisitos de currículo (seção 12)

- RF-ONB-021: **obrigatório** para conclusão do onboarding.
- RF-ONB-022: formatos aceitos: **PDF**, **DOCX**, **texto colado**.
- RF-ONB-023: formatos/rejeitados: DOC legado, ZIP, arquivos compactados, imagens isoladas, HTML, RTF, arquivos executáveis, arquivos com macros, **arquivos protegidos por senha**.
- RF-ONB-024: limites por arquivo — **máximo 10 MB**; **máximo 50 páginas**; **nome original de até 120 caracteres**.
- RF-ONB-025: texto colado — **até 100.000 caracteres**.
- RF-ONB-026: validações obrigatórias — extensão; MIME type real; presença de conteúdo; tamanho; quantidade de páginas; possibilidade de leitura; ausência de arquivo vazio; integridade; proteção por senha; compatibilidade com processamento; presença de conteúdo malicioso.
- RF-ONB-027/028/029: usuário deve ver estado do upload, progresso do upload e estado do processamento.
- RF-ONB-030: usuário pode cancelar upload em andamento.
- RF-ONB-031: usuário pode tentar novamente após falha.
- RF-ONB-032: usuário pode remover arquivo ainda não processado.
- RF-ONB-033: usuário pode substituir o currículo.
- RF-ONB-034: substituição registra nova origem documental.
- RF-ONB-035: se perfil já confirmado, substituição pode gerar nova versão do Thin Twin após revisão.
- RF-ONB-036: Core 1 não liberado sem currículo válido.
- RF-ONB-037: interface deve informar claramente formatos e limites aceitos.
- RF-ONB-038: sistema não deve truncar ou descartar páginas silenciosamente.

### Requisitos de LinkedIn (seção 13)

- RF-ONB-039: conteúdo do LinkedIn **obrigatório** para conclusão do onboarding.
- RF-ONB-040: formatos aceitos: **PDF exportado do LinkedIn**; **texto colado**. (Não é upload de imagem nem outro formato.)
- RF-ONB-041: PDF do LinkedIn segue os mesmos limites/regras de segurança do currículo (10 MB, 50 páginas, etc.).
- RF-ONB-042: **URL pública do LinkedIn** poderá ser armazenada apenas como **referência**.
- RF-ONB-043: URL pública **não pode ser fonte única** da análise no MVP.
- RF-ONB-044: sistema não deve depender de scraping do LinkedIn.
- RF-ONB-045: usuário deve visualizar estado do envio e do processamento.
- RF-ONB-046: usuário pode tentar novamente após falha.
- RF-ONB-047: usuário pode substituir o conteúdo do LinkedIn.
- RF-ONB-048: substituição registra nova origem documental.
- RF-ONB-049: se perfil confirmado, substituição pode gerar nova versão após revisão.
- RF-ONB-050: Core 1 não liberado sem conteúdo válido do LinkedIn.
- RF-ONB-051: interface deve explicar como exportar/copiar informações do LinkedIn.

**Regra de negócio confirmatória:** RN-ONB-010 — URL pública do LinkedIn não é fonte suficiente. RN-ONB-011 — o produto não realiza scraping do LinkedIn.

### Critério mínimo de conteúdo válido (seção 14)

**Currículo:**
- pelo menos **300 caracteres úteis**;
- pelo menos uma seção profissional reconhecível;
- pelo menos um dos seguintes: experiência; projeto; formação; atividade acadêmica relevante; trabalho voluntário; estágio.

**LinkedIn:**
- pelo menos **300 caracteres úteis**;
- pelo menos **duas categorias** entre: título profissional; resumo; experiências; projetos; formação; competências.

**Regras complementares:** o sistema também deve considerar diversidade das informações, repetição excessiva, presença de conteúdo profissional, texto composto somente por menus, conteúdo corrompido, ausência de contexto.

- RF-ONB-052: número de caracteres não deve ser o único critério de validade.
- RF-ONB-053: conteúdo insuficiente deve gerar orientação clara para reenvio/complemento.
- RF-ONB-054: usuário não deve confirmar Thin Twin definitivo baseado somente em conteúdo abaixo do mínimo.

### Segurança de upload (seção 15)

- RF-ONB-055: allowlist de extensões.
- RF-ONB-056: identificação do tipo real do arquivo (MIME sniffing, não apenas extensão).
- RF-ONB-057: arquivo recebe **nome interno gerado pelo sistema**.
- RF-ONB-058: cálculo de **checksum**.
- RF-ONB-059: verificação **antimalware** antes da extração.
- RF-ONB-060: arquivos fora de diretórios públicos.
- RF-ONB-061: arquivos não devem ser executados.
- RF-ONB-062: acesso ao arquivo exige autorização.
- RF-ONB-063: mensagens de fila não devem conter o documento nem o texto completo.
- RF-ONB-064: credenciais, tokens e URLs assinadas não enviados para analytics.

### Upload e tempos de operação (seção 16)

**Metas de upload:**
- tempo esperado: até 30 segundos;
- aviso de conexão lenta: após 30 segundos sem progresso;
- timeout do cliente: **120 segundos**.

**Metas de processamento:**

| Processamento | Mediana | Percentil 95 |
| --- | --- | --- |
| Texto nativo | Até 30 s | Até 60 s |
| OCR | Até 90 s | Até 180 s |

Timeout máximo por tentativa: **5 minutos**.

- RF-ONB-065: upload preferencialmente por **URL assinada** ou mecanismo equivalente.
- RF-ONB-066: usuário visualiza percentual de upload.
- RF-ONB-067: após **10 segundos** de processamento, sistema informa que a operação continua.
- RF-ONB-068: após **60 segundos**, sistema apresenta mensagem de processamento prolongado.
- RF-ONB-069: usuário não precisa manter a página aberta para o processamento continuar.
- RF-ONB-070: após **5 minutos**, tentativa é encerrada como **falha recuperável**.

### Pipeline de extração de documentos (seção 17)

**Pipeline definido (ordem):**
1. validação de segurança;
2. detecção de tipo;
3. extração textual nativa;
4. detecção de necessidade de OCR;
5. OCR quando aplicável;
6. normalização;
7. estruturação;
8. validação do resultado;
9. criação do rascunho do Thin Twin.

**Tecnologia de referência do MVP** (substituível por decisão arquitetural registrada, mantendo o contrato):
- Apache Tika 3.x (detecção e extração);
- OCRmyPDF com Tesseract `por+eng` (PDFs escaneados);
- ClamAV ou serviço equivalente (antimalware);
- worker isolado e containerizado;
- interface interna `DocumentExtractor`.

**Contrato de extração (tipo exato dado no PRD):**

```ts
type DocumentExtractionResult = {
  documentId: string;
  detectedMimeType: string;
  pageCount?: number;
  text: string;
  metadata: Record<string, unknown>;
  extractionMethod: "native" | "ocr" | "mixed";
  extractionConfidence: number;
  warnings: string[];
};
```

**Campos que o sistema deve extrair quando disponível (RF-ONB-071):** área atual; cargo atual; situação profissional; cargos anteriores; empresas; períodos; responsabilidades; projetos; competências; ferramentas; resultados; evidências; formação; certificações; sinais de senioridade observável.

**Metadados por informação extraída (RF-ONB-072):** fonte; tipo de fonte; trecho mínimo de evidência; localização (quando disponível); confiança; status de confirmação; data da extração. *Nota explícita do PRD: "A confiança da extração indica a segurança da interpretação do campo. Ela não é IPP, IAO nem confiança final de uma análise."*

- RF-ONB-073: sistema distingue: currículo; LinkedIn; complemento do usuário; correção do usuário; inferência da IA.
- RF-ONB-074: identifica divergências e duplicidades.
- RF-ONB-075: normaliza informações equivalentes sem apagar origem original.
- RF-ONB-076: inferências não armazenadas como fatos confirmados.
- RF-ONB-077: informações com baixa confiança devem ser destacadas.
- RF-ONB-078: falhas parciais apresentadas sem perder dados processados.
- RF-ONB-079: extração não calcula IPP ou IAO.
- RF-ONB-080: extração não gera recomendação definitiva de carreira.

### OCR (seção 18)

**Critério de acionamento do OCR:**
- menos de **20 caracteres úteis por página**; ou
- mais de **70% das páginas** sem texto extraível.

- RF-ONB-081: tenta extração nativa antes do OCR.
- RF-ONB-082: registra quando o conteúdo foi obtido por OCR.
- RF-ONB-083: idiomas iniciais — **português e inglês**.
- RF-ONB-084: resultado do OCR possui nível de confiança.
- RF-ONB-085: informações extraídas por OCR são encaminhadas para revisão.
- RF-ONB-086: se **mais de 30% das páginas** permanecerem ilegíveis, documento é classificado como **"parcialmente processado"**.
- RF-ONB-087: nenhuma informação de baixa confiança é tratada como fato confirmado.

### Fila, retentativas e idempotência (seção 19)

**Configuração inicial da fila:**
- fila de validação;
- fila de extração;
- fila de OCR;
- fila de mensagens com falha (DLQ);
- uma operação ativa por documento e usuário;
- **visibility timeout de 6 minutos**;
- **três tentativas automáticas**.

**Tabela de retentativas:**

| Tentativa | Intervalo |
| --- | --- |
| Primeira | 15 segundos |
| Segunda | 60 segundos |
| Terceira | 5 minutos |
| Após a terceira falha | DLQ |

**Chave de idempotência (formato exato):**

```
userId + documentType + fileChecksum + extractorVersion
```

- RF-ONB-088: repetição da mesma mensagem não cria documento duplicado.
- RF-ONB-089: repetição não cria versões duplicadas.
- RF-ONB-090: repetição não consome crédito.
- RF-ONB-091: dois processamentos idênticos não ocorrem simultaneamente.
- RF-ONB-092: após terceira falha, job vai para DLQ.

### Recuperação após interrupção (seção 20)

**Enum de estados do processamento do documento (nome e valor exato do tipo dado no PRD):**

```ts
type DocumentProcessingStatus =
  | "uploaded"
  | "validating"
  | "validated"
  | "queued"
  | "extracting"
  | "ocr_required"
  | "ocr_processing"
  | "normalizing"
  | "draft_created"
  | "awaiting_review"
  | "completed"
  | "failed_retryable"
  | "failed_final";
```

O PRD ressalta: *"Esses estados representam a visão funcional deste PRD e devem possuir mapeamento explícito para o enum canônico de processamento definido no Modelo de Dados. A implementação não deve criar strings alternativas silenciosamente."* — ou seja, este enum é a visão funcional/contrato do PRD 01, não necessariamente o enum final do banco (mapeamento explícito exigido, sem strings alternativas ad hoc).

- RF-ONB-093: cada etapa salva um checkpoint.
- RF-ONB-094: após interrupção, job retoma do último checkpoint válido.
- RF-ONB-095: etapas concluídas não são repetidas sem necessidade.
- RF-ONB-096: jobs sem atualização por **dez minutos** são considerados travados.
- RF-ONB-097: jobs travados retornam à fila.
- RF-ONB-098: usuário pode solicitar tentativa manual após falha final.
- RF-ONB-099: reenvio não é necessário enquanto o arquivo original estiver disponível.
- RF-ONB-100: se arquivo já excluído, usuário deve enviá-lo novamente.

### Arquivos protegidos por senha (seção 21)

- RF-ONB-101: arquivos protegidos por senha **não devem ser processados**.
- RF-ONB-102: sistema não deve solicitar ou armazenar a senha do arquivo.
- RF-ONB-103: sistema não deve tentar remover a proteção.
- RF-ONB-104: arquivo rejeitado deve ser **excluído assim que tecnicamente possível**.
- RF-ONB-105: usuário pode enviar versão sem proteção ou colar o texto.
- RF-ONB-106: rejeição não consome crédito.

### LinkedIn com conteúdo duplicado (seção 22)

Repetição entre currículo e LinkedIn não invalida o material. Quando sobreposição textual/semântica **superior a 85%**:

```
source_diversity = low
```

- RF-ONB-107: sistema identifica conteúdos repetidos.
- RF-ONB-108: a mesma evidência não é contabilizada duas vezes.
- RF-ONB-109: sistema registra baixa diversidade de fontes.
- RF-ONB-110: repetição não reduz diretamente o IPP.
- RF-ONB-111: repetição pode reduzir a força de corroboração entre fontes.
- RF-ONB-112: sistema pode recomendar complementação do LinkedIn.

### Requisitos funcionais — Revisão do perfil (seção 30)

**Estrutura da revisão (ordem das seções na UI):**
1. Resumo;
2. conflitos e itens de atenção;
3. experiências;
4. projetos;
5. competências;
6. ferramentas;
7. formação;
8. certificações;
9. confirmação final.

(O contexto-alvo é definido em etapa **separada**, após a confirmação do Thin Twin.)

- RF-ONB-113: sistema apresenta perfil extraído antes de análise definitiva.
- RF-ONB-114: conteúdo organizado em seções compreensíveis.
- RF-ONB-115: usuário pode confirmar; editar; remover; adicionar informações.
- RF-ONB-116: usuário pode complementar experiências, responsabilidades, projetos, competências, ferramentas, resultados, evidências, formação e certificações.
- RF-ONB-117: divergências apresentadas para resolução.
- RF-ONB-118: sistema diferencia visualmente: informação extraída; informação adicionada; informação corrigida; informação confirmada; baixa confiança; divergência; inferência não confirmada.
- RF-ONB-119: usuário pode escolher a informação correta.
- RF-ONB-120: usuário pode editar quando nenhuma opção estiver correta.
- RF-ONB-121: referência original preservada após correção.
- RF-ONB-122: correção do usuário prevalece sobre a extração.
- RF-ONB-123: autoria da correção deve ser registrada.
- RF-ONB-124: somente informações fornecidas ou confirmadas podem ser fatos profissionais.
- RF-ONB-125: Core 1 não liberado antes da confirmação do Thin Twin **e** da existência de um contexto-alvo válido.
- RF-ONB-126: conflitos críticos bloqueiam confirmação.
- RF-ONB-127: conflitos não críticos podem permanecer registrados.

### Layout da revisão (seção 31)

**Desktop:** navegação lateral; conteúdo principal central; painel de evidências à direita; barra de ações fixa; indicador de progresso.

**Mobile:** navegação sequencial; uma seção por vez; evidências em `Sheet` ou `Drawer`; barra de ações fixa inferior.

**Cada item deve mostrar:** conteúdo; fonte; status; confiança; divergências; evidência; editar; confirmar; remover.

**Componentes shadcn/ui citados:** `Card`, `Tabs`, `Accordion`, `Badge`, `Alert`, `Dialog`, `Sheet`, `Progress`, `Button`, `Tooltip`, `Skeleton`.

**Regras de UX:** conflitos críticos aparecem primeiro; usuário pode salvar e continuar depois; alterações não descartadas silenciosamente; ações destrutivas exigem confirmação; confirmação final só liberada após requisitos obrigatórios; informações conflitantes ou de baixa confiança não podem ser confirmadas em massa.

### Requisitos funcionais — Confirmação do perfil (seção 32)

- RF-ONB-128: sistema solicita **ação explícita** para confirmar o Thin Twin.
- RF-ONB-129: interface informa que as análises utilizarão os dados revisados.
- RF-ONB-130: a confirmação deve registrar: usuário; data e hora; versão; fontes; campos confirmados; conflitos resolvidos; conflitos remanescentes; nível de completude.
- RF-ONB-131: confirmação não transforma inferências em fatos automaticamente.
- RF-ONB-132: inferências só integram fatos após confirmação do usuário.
- RF-ONB-133: após confirmação, sistema cria **versão imutável** do Thin Twin.

### Definição de conflito crítico (seção 29)

Um conflito é **crítico** quando: (1) envolve informações incompatíveis; (2) afeta um fato profissional central; (3) pode alterar significativamente análise ou score; (4) não pode ser resolvido automaticamente com segurança.

**Exemplos críticos:** empresas diferentes para a mesma experiência; cargos materialmente diferentes; emprego atual em uma fonte e encerrado em outra; datas com diferença superior a **seis meses**; formação existente em uma fonte e ausente/negada em outra; certificação obrigatória conflitante; senioridade incompatível; experiência duplicada com informações conflitantes.

**Exemplos não críticos:** capitalização; abreviação; pequenas diferenças de redação; mês ausente em uma fonte; descrição mais detalhada em uma fonte; nome fantasia vs. razão social; diferença de até um mês.

**Regra de bloqueio:** conflitos críticos de empresa, cargo, período principal, situação atual, formação, certificação obrigatória, senioridade observável **devem bloquear a confirmação do Thin Twin até resolução**. Divergências do contexto-alvo são tratadas na etapa própria, não como conflito interno do Thin Twin.

### Retomada / continuidade (seção 10)

- RF-ONB-001: sistema registra o estado do onboarding por usuário.
- RF-ONB-002: usuário pode sair e retomar.
- RF-ONB-003: ao retornar, sistema direciona para a **última etapa válida não concluída**.
- RF-ONB-004: dados válidos já salvos não são perdidos após refresh ou nova sessão.
- RF-ONB-005: sistema impede acesso a dados de onboarding de outro usuário.
- RF-ONB-006: progresso da jornada apresentado de forma clara.
- RF-ONB-007: usuário pode retornar a etapas anteriores enquanto onboarding não concluído.
- RF-ONB-008: retorno a etapa anterior não apaga silenciosamente dados já confirmados.
- RF-ONB-009: sistema registra checkpoints das etapas de processamento.
- RF-ONB-010: processamentos interrompidos retomam do último checkpoint válido.

### Requisitos funcionais — Conclusão do onboarding (seção 36)

O onboarding é concluído **somente** quando (RF-ONB-150):
- nome estiver válido;
- currículo estiver válido;
- LinkedIn estiver válido;
- extração estiver concluída ou revisada;
- conflitos críticos estiverem resolvidos;
- Thin Twin estiver confirmado;
- área de interesse estiver definida;
- cargo-alvo estiver definido;
- senioridade desejada estiver definida.

- RF-ONB-151: sistema registra status de conclusão.
- RF-ONB-152: sistema registra o evento correspondente.
- RF-ONB-153: após conclusão, usuário direcionado para o Core 1.
- RF-ONB-154: usuário pode retornar para atualizar o perfil.
- RF-ONB-155: atualizações posteriores seguem revisão, confirmação e versionamento.

### Regras de negócio gerais (seção 38, RN-ONB-001 a 020)

1. RN-ONB-001: Currículo e LinkedIn são obrigatórios.
2. RN-ONB-002: Somente informações fornecidas ou confirmadas podem ser fatos.
3. RN-ONB-003: Inferências não podem ser armazenadas como fatos confirmados.
4. RN-ONB-004: Dados pessoais não influenciam análises, scores ou recomendações.
5. RN-ONB-005: Dados pessoais permanecem separados do contexto profissional.
6. RN-ONB-006: Arquivos originais são temporários.
7. RN-ONB-007: Usuário só acessa seus próprios documentos e perfis.
8. RN-ONB-008: Políticas de acesso devem existir no backend e banco.
9. RN-ONB-009: Falhas técnicas não consomem créditos.
10. RN-ONB-010: URL pública do LinkedIn não é fonte suficiente.
11. RN-ONB-011: O produto não realiza scraping do LinkedIn.
12. RN-ONB-012: A IA não pode: inventar experiências; criar métricas; criar resultados; atribuir ferramentas não informadas; adicionar certificações; modificar cargos sem confirmação; elevar senioridade sem evidências; transformar colaboração em liderança; transformar participação em responsabilidade integral.
13. RN-ONB-013: A correção mais recente confirmada prevalece em conflitos.
14. RN-ONB-014: Nome, cidade e estado não integram o Thin Twin profissional.
15. RN-ONB-015: A conclusão do onboarding não consome crédito.
16. RN-ONB-016: Consentimentos opcionais não bloqueiam o produto.
17. RN-ONB-017: Linguagem deve ser clara, acolhedora e não julgadora.
18. RN-ONB-018: Ausência de evidência não significa ausência de competência.
19. RN-ONB-019: Nenhuma informação deve ser descartada silenciosamente.
20. RN-ONB-020: Nenhum limite ou regra pode ser alterado sem versionamento.

### Requisitos não funcionais (seção 42)

- RNF-ONB-001 Responsividade: desktop, tablet, mobile.
- RNF-ONB-002 Acessibilidade: HTML semântico, navegação por teclado, foco visível, labels, mensagens acessíveis, contraste, progresso compreensível.
- RNF-ONB-003 Segurança: arquivos e dados protegidos por autenticação e autorização.
- RNF-ONB-004 Isolamento: nenhum usuário acessa dados de outro.
- RNF-ONB-005 Integridade: falhas não corrompem informações salvas.
- RNF-ONB-006 Rastreabilidade: toda informação profissional possui origem e confirmação.
- RNF-ONB-007 Performance: operações demoradas informam estado/progresso.
- RNF-ONB-008 Idempotência: repetições não criam registros duplicados.
- RNF-ONB-009 Observabilidade: jobs, falhas, tempos e exclusões possuem monitoramento técnico.
- RNF-ONB-010 Design System: shadcn/ui, Tailwind CSS, tokens CareerTwin, Lucide React, componentes acessíveis.
- RNF-ONB-011 Identidade: logos oficiais sem distorção/reconstrução.
- RNF-ONB-012 Configuração: limites, tempos e regras em configuração versionada.

### Configuração funcional inicial (bloco de código exato, seção 43)

```ts
export const ONBOARDING_CONFIG = {
  documents: {
    allowedExtensions: ["pdf", "docx", "txt"],
    maxFileSizeMb: 10,
    maxPages: 50,
    maxOriginalFileNameCharacters: 120,
    maxPastedTextCharacters: 100_000,
    passwordProtectedFiles: "reject",
  },

  upload: {
    timeoutSeconds: 120,
    slowConnectionWarningSeconds: 30,
  },

  processing: {
    nativeMedianSeconds: 30,
    nativeP95Seconds: 60,
    ocrMedianSeconds: 90,
    ocrP95Seconds: 180,
    attemptTimeoutSeconds: 300,
    maxAttempts: 3,
    visibilityTimeoutSeconds: 360,
    stalledJobMinutes: 10,
  },

  retention: {
    originalFileHours: 24,
    successfulIntermediateHours: 6,
    failedIntermediateHours: 24,
    technicalLogDays: 30,
  },

  content: {
    minimumUsefulCharacters: 300,
    duplicateSourceThreshold: 0.85,
    ocrMinimumCharactersPerPage: 20,
    ocrPagesWithoutTextThreshold: 0.70,
  },

  limits: {
    experiences: 30,
    projects: 50,
    skills: 150,
    tools: 100,
    education: 20,
    certifications: 50,
    evidencePerExperience: 20,
    responsibilitiesPerExperience: 30,
  },

  personalData: {
    fullName: "required",
    city: "optional",
    state: "optional",
    birthDate: "not_collected",
    postalCode: "not_collected",
    fullAddress: "not_collected",
  },
} as const;
```

*(Nota: no bloco original do documento, `allowedExtensions` inclui `"txt"` — vale observar que a seção 12 (RF-ONB-022) lista os formatos aceitos de currículo como "PDF; DOCX; texto colado" sem mencionar upload de arquivo `.txt` propriamente — ver seção "Conflitos ou ambiguidades internas" abaixo.)*

### Critérios de aceite explícitos (seção 44 — lista completa, 48 itens)

O PRD será considerado atendido quando:

1. usuário autenticado conseguir iniciar o onboarding;
2. usuário conseguir sair e retomar;
3. sistema preservar etapas concluídas;
4. usuário informar nome;
5. cidade e estado forem opcionais;
6. data de nascimento e endereço não forem coletados;
7. dados pessoais permanecerem separados;
8. currículo puder ser enviado nos formatos permitidos;
9. LinkedIn puder ser enviado nos formatos permitidos;
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
24. sistema criar rascunho do Thin Twin;
25. cada informação possuir origem;
26. inferências não forem tratadas como fatos;
27. divergências forem identificadas;
28. conflitos críticos bloquearem confirmação;
29. usuário conseguir corrigir, adicionar e remover;
30. revisão utilizar experiência guiada;
31. usuário confirmar explicitamente o perfil;
32. confirmação criar versão imutável;
33. versões anteriores não forem sobrescritas;
34. análises registrarem a versão utilizada;
35. competências e ferramentas forem armazenadas separadamente;
36. cargos e períodos forem normalizados com rastreabilidade;
37. usuário definir área, cargo, especialidade (quando aplicável) e senioridade desejada;
38. alteração do contexto-alvo criar `target_context_version` sem alterar o Thin Twin;
39. Core 1 só for liberado após Thin Twin confirmado e contexto-alvo válido;
40. arquivos temporários forem excluídos no prazo;
41. falhas técnicas não consumirem créditos;
42. dados profissionais não forem enviados para analytics;
43. interface funcionar em desktop, tablet e mobile;
44. experiência atender requisitos mínimos de acessibilidade;
45. shadcn/ui for utilizado como base;
46. logos oficiais forem utilizados sem distorção;
47. limites e configurações forem versionados;
48. nenhuma informação for descartada silenciosamente.

### Mensagens essenciais (conteúdo textual exato — seção 40)

| Contexto | Texto |
| --- | --- |
| Introdução | "Vamos organizar sua trajetória profissional para criar análises mais confiáveis e úteis." |
| Currículo | "Envie seu currículo em PDF ou DOCX. Também é possível colar o conteúdo em texto." |
| LinkedIn | "Envie o PDF exportado do LinkedIn ou cole o conteúdo do seu perfil." |
| Upload concluído | "Material recebido. Agora vamos validar e organizar o conteúdo." |
| Processamento | "Estamos organizando suas informações profissionais. Isso pode levar alguns instantes." |
| Processamento prolongado | "O processamento está levando mais tempo que o normal. Você pode continuar depois; seu progresso será preservado." |
| OCR | "Este documento não possui texto pesquisável. Vamos tentar reconhecer o conteúdo das páginas." |
| Baixa confiança | "Não conseguimos confirmar esta informação com segurança. Revise antes de continuar." |
| Divergência | "Encontramos informações diferentes no currículo e no LinkedIn. Escolha a versão correta ou edite o conteúdo." |
| Extração parcial | "Conseguimos processar parte das informações. Revise o conteúdo identificado e reenvie o material que apresentou problema." |
| Erro técnico | "Não foi possível processar este material agora. Tente novamente. Seu progresso foi preservado." |
| Arquivo protegido | "Este arquivo está protegido por senha. Envie uma versão sem proteção ou cole o conteúdo em texto." |
| Conteúdo insuficiente | "O conteúdo recebido não possui informações profissionais suficientes para criar um perfil confiável. Envie outro documento ou complemente o conteúdo em texto." |
| Conteúdo repetido | "Seu currículo e LinkedIn apresentam conteúdos muito semelhantes. Isso não impede a análise, mas informações complementares no LinkedIn podem aumentar a qualidade do diagnóstico." |
| Confirmação | "Confirme se estas informações representam corretamente sua trajetória. As próximas análises utilizarão esta versão do perfil." |
| Perfil confirmado | "Seu perfil profissional foi confirmado. Agora vamos definir seu contexto-alvo." |
| Onboarding concluído | "Seu perfil está pronto. Agora você pode iniciar sua Análise de Perfil." |

### Analytics (seção 41 — nomes de eventos exatos)

**Onboarding (eventos principais):** `onboarding_started`, `onboarding_resumed`, `resume_uploaded`, `linkedin_uploaded`, `upload_failed`, `onboarding_completed`.

**Onboarding (eventos de diagnóstico):** `onboarding_step_viewed`, `onboarding_step_completed`, `resume_validation_failed`, `linkedin_validation_failed`, `resume_replaced`, `linkedin_replaced`, `onboarding_abandoned`.

**Thin Twin:** `twin_extraction_started`, `twin_extraction_completed`, `twin_extraction_failed`, `twin_review_started`, `twin_field_corrected`, `twin_field_added`, `twin_field_removed`, `twin_conflict_resolved`, `twin_profile_confirmed`, `twin_version_created`.

**Contexto-alvo:** `target_role_defined`, `target_role_suggested`, `target_role_selected`.

Eventos de OCR, jobs, exclusão de arquivos e falhas técnicas pertencem à observabilidade/auditoria e **não** devem virar eventos de produto sem registro prévio no catálogo canônico de Analytics.

**Propriedades permitidas:** etapa; status; tipo de documento; formato; categoria do erro; duração; quantidade de divergências; quantidade de correções; confiança agregada; versão do Thin Twin; versão do contexto-alvo; método de extração; quantidade de tentativas; origem da retomada.

**Dados proibidos em analytics:** nome completo; cidade; estado; e-mail; currículo; LinkedIn; texto de experiências; evidências; tokens; URLs privadas; documentos; conteúdo extraído.

---

## Thin Twin — estrutura completa

### Definição e o que o Thin Twin NÃO é

O Thin Twin é a "representação profissional estruturada, persistente, confirmada e versionada da trajetória do usuário". Ele reúne fatos profissionais para: analisar currículo/LinkedIn; compreender trajetória; identificar competências, ferramentas e evidências; avaliar posicionamento; comparar perfil com cargos/vagas; gerar recomendações; acompanhar atualizações; realizar reanálises; preservar histórico de versões.

**Explicitamente, o Thin Twin NÃO é:** memória livre de uma conversa; histórico integral de mensagens; perfil psicológico; currículo gerado automaticamente; reprodução integral dos documentos originais; conjunto de inferências tratadas como fatos; representação definitiva do valor profissional do usuário; registro do objetivo profissional (isso pertence ao contexto-alvo, separado).

### Princípios (7, seção 2)

1. **Estruturado** — campos e entidades definidos, não somente texto livre.
2. **Rastreável** — cada informação indica origem e evidência utilizada.
3. **Confirmado** — extrações/inferências não viram fatos até confirmação do usuário.
4. **Versionado** — alterações profissionais relevantes geram nova versão do perfil.
5. **Persistente** — disponível entre análises e acessos.
6. **Minimalista** — só o necessário para a experiência.
7. **Separado dos dados pessoais** — nome, e-mail, cidade, estado, data de nascimento, endereço não fazem parte do Thin Twin profissional.

### Fontes de informação (seção 3)

Currículo; LinkedIn; informações profissionais adicionadas pelo usuário; correções do usuário; evidências profissionais adicionadas; atualizações posteriores dos materiais.

O objetivo profissional **não** faz parte do Thin Twin (pertence ao contexto-alvo versionado). A descrição de uma vaga também **não** faz parte do Thin Twin (pertence ao contexto de uma análise específica do Core 2).

### Estrutura conceitual completa (seção 4)

**4.1 Identidade profissional:** área atual; cargo atual; especialidade; senioridade observável; resumo profissional; situação profissional atual; localização profissional relevante (quando informada); idiomas informados; disponibilidade informada. A senioridade observável permanece identificada como fato confirmado ou inferência, conforme sua origem.

**4.2 Contexto-alvo relacionado** (mantido separadamente): área-alvo; cargo-alvo; senioridade desejada; tipo de transição; contexto da busca; preferências profissionais explicitamente informadas. Possui versão própria `target_context_version`. Análises usam uma versão confirmada do Thin Twin **e** uma versão confirmada do contexto-alvo.

**4.3 Experiências, cada uma pode conter:** empresa/organização/contexto; cargo ou função; tipo de vínculo (quando informado); data inicial; data final; situação atual; descrição; responsabilidades; projetos; ferramentas; competências relacionadas; resultados; evidências; escopo de atuação; sinais de senioridade; fonte.

**4.4 Projetos, cada um pode conter:** nome; contexto; objetivo; papel do usuário; atividades; ferramentas; competências; entregas; resultados; período; experiência relacionada; evidências.

**4.5 Competências, cada uma pode registrar:** nome normalizado; termo original; tipo; domínio ou categoria; experiências relacionadas; projetos relacionados; nível declarado (quando informado); evidências; fonte; confiança de extração; confirmação do usuário; versão da taxonomia.

*Tipos possíveis de competência:* técnica; método; domínio; gestão; liderança; comunicação; colaboração; negócio; idioma.

Ferramentas/tecnologias específicas são armazenadas separadamente das competências. A presença de uma competência não significa domínio avançado.

**4.6 Resultados e evidências.** Uma evidência pode ser: entrega; projeto; responsabilidade; resultado qualitativo; resultado quantitativo; reconhecimento; promoção; ampliação de escopo; certificação; portfólio; exemplo profissional. Cada evidência deve preservar contexto para evitar interpretações exageradas. A mesma evidência não deve ser contabilizada mais de uma vez só por aparecer no currículo e no LinkedIn.

**4.7 Formação:** instituição; curso; tipo; área; data inicial; data final; situação; fonte; confirmação.

**4.8 Certificações:** nome; instituição emissora; data; validade (quando informada); identificador (quando informado); fonte; confirmação.

**4.9 Idiomas:** idioma; nível declarado; certificação (quando existente); contexto de uso; fonte; confirmação.

**4.10 Histórico** (relacionado ao Thin Twin, não parte dos fatos armazenados): versões do perfil; documentos utilizados em cada versão; alterações profissionais; análises associadas; versão do contexto-alvo utilizada; recomendações e ações relacionadas; datas de atualização. *Análises, vagas, recomendações, ações e feedbacks são entidades relacionadas ao Thin Twin, mas não fazem parte dos fatos profissionais armazenados no perfil.*

### Metadados obrigatórios por informação profissional relevante (seção 5, tabela exata)

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

`extraction_confidence` ≠ confirmação do usuário, ≠ confiança da análise, ≠ score, ≠ aderência.

### Estados de confirmação (seção 6, nomes exatos)

- **Extraído** — identificada em uma fonte, ainda não revisada.
- **Confirmado** — validada pelo usuário sem alteração.
- **Corrigido** — extraída e depois alterada pelo usuário.
- **Adicionado** — inserida diretamente pelo usuário.
- **Rejeitado** — removida ou indicada como incorreta.
- **Em conflito** — versões incompatíveis entre fontes.
- **Não confirmado** — sem confirmação suficiente para ser usada como fato.

**Somente os estados Confirmado, Corrigido e Adicionado podem ser tratados como fatos profissionais.**

*(Nota de correspondência: no PRD 01, seção 30/RF-ONB-118, os estados visuais citados são "informação extraída; informação adicionada; informação corrigida; informação confirmada; baixa confiança; divergência; inferência não confirmada" — nomenclatura equivalente mas não idêntica em capitalização/fraseado ao Thin Twin; ver seção de conflitos abaixo.)*

### Confiança da extração (seção 7)

- **Alta confiança:** informação explícita; contexto claro; sem conflito entre fontes; estrutura facilmente interpretável.
- **Média confiança:** informação provável; contexto parcial; alguma ambiguidade; evidência indireta.
- **Baixa confiança:** informação incompleta; estrutura ambígua; conflito relevante; inferência necessária; ausência de contexto.

A confiança da extração: não substitui confirmação do usuário; não representa confiança do Core 1/Core 2; não transforma inferências em fatos; deve ser registrada de forma compatível com os schemas técnicos.

### Tratamento de inferências (seção 8)

A IA pode identificar sinais/hipóteses: competência implícita; possível escopo de atuação; possível senioridade; relação entre experiências; possível inconsistência; potencial palavra-chave.

Devem ser armazenados como: inferência; sugestão; hipótese; item a confirmar. Uma inferência **não pode ser promovida automaticamente a fato**.

**Exemplo dado no documento:**
Fonte: "Acompanhava o planejamento das entregas do time."
Interpretação permitida: "Existe um possível sinal de coordenação ou acompanhamento de entregas."
Interpretação proibida: "O usuário liderava a equipe."

### Normalização (seção 9)

O Thin Twin mantém dois valores: **termo original** e **termo normalizado**.

| Termo original | Termo normalizado |
| --- | --- |
| "PO" | Product Owner |
| "Figma" | Figma |
| "gestão de backlog" | Backlog Management |
| "levantamento de requisitos" | Requirements Analysis |

Regras: facilita comparações; reduz duplicidades; melhora matching; não altera o significado original; preserva o termo utilizado pelo usuário; registra a versão da taxonomia utilizada; não descarta termos desconhecidos silenciosamente.

### Resolução de conflitos (seção 10)

Quando currículo e LinkedIn divergem, o sistema deve: (1) identificar o conflito; (2) apresentar as duas versões; (3) indicar as fontes; (4) solicitar confirmação ou correção do usuário; (5) registrar a decisão; (6) preservar o histórico da alteração.

**Exemplos de conflito:** datas diferentes; cargos diferentes; responsabilidades incompatíveis; formação divergente; ferramenta presente em apenas uma fonte; empresa com nomes diferentes; situação profissional inconsistente.

Diferenças **complementares** entre currículo e LinkedIn não devem ser tratadas automaticamente como conflitos. O sistema não deve escolher silenciosamente uma das versões.

### Versionamento (seção 11)

**Gera nova versão do Thin Twin** quando há alteração profissional relevante em: experiência; cargo; empresa ou contexto; período; responsabilidade; projeto; competência; ferramenta com evidência; resultado; formação; certificação; evidência profissional; conflito crítico resolvido; substituição de currículo; substituição do LinkedIn.

Alterações no **objetivo profissional NÃO geram nova versão do Thin Twin** — geram nova `target_context_version`.

Alterações estritamente pessoais, administrativas, visuais ou ortográficas não geram nova versão profissional.

**Cada versão registra:** identificador; número da versão; data de criação; motivo; origem da alteração; responsável pela alteração; itens adicionados; itens alterados; itens removidos; versão anterior; confirmação do usuário.

**Regra de associação — toda análise registra:** `profile_version_id`; `target_context_version_id`; data da análise; versão do motor; versão do prompt; versão da rubrica. Análises antigas não devem ser recalculadas ou modificadas silenciosamente quando o perfil/objetivo mudar.

### Ciclo de vida (seção 12, sequência numerada exata)

1. documentos são recebidos;
2. conteúdos são extraídos;
3. dados são normalizados;
4. possíveis conflitos são identificados;
5. rascunho do Thin Twin é criado;
6. usuário revisa;
7. usuário confirma, corrige, adiciona ou rejeita informações;
8. **versão inicial do Thin Twin é persistida**;
9. contexto-alvo é confirmado separadamente;
10. análises utilizam as versões confirmadas;
11. alterações relevantes geram novas versões;
12. histórico permanece disponível sem sobrescrever resultados anteriores.

### O que "confirmado" significa

No Thin Twin, "Confirmado" é um dos estados de confirmação por campo/informação individual: "Informação validada pelo usuário sem alteração." No nível do perfil como um todo, o PRD 01 usa `confirmation_status: "confirmed"` no `profile_metadata` do objeto conceitual (seção 15) para indicar que a versão do Thin Twin foi confirmada — ou seja, o termo "confirmado" se aplica tanto a campos individuais quanto ao status geral da versão do perfil.

### Dados que NÃO pertencem ao Thin Twin (seção 13, lista completa)

nome; e-mail; cidade; estado; senha; endereço residencial completo; data de nascimento; dados de cartão; objetivo profissional; descrições de vagas; conteúdo integral dos documentos originais; conversas irrelevantes; atributos sensíveis não necessários; avaliações psicológicas; inferências sobre personalidade; inferências sobre saúde; inferências sobre origem étnica; inferências políticas ou religiosas; probabilidade de contratação; ranking do usuário.

*(Compare com PRD 01, seção 23, "Não integram o Thin Twin": nome, e-mail, cidade ou estado; dados de autenticação; área-alvo, cargo-alvo, especialidade ou senioridade desejada; vagas, análises, recomendações, ações ou feedbacks — lista mais curta, mas consistente.)*

### Invariantes (seção 14, lista numerada exata — 12 itens)

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

### Estrutura conceitual de objeto (JSON exato, seção 15)

O documento marca este exemplo explicitamente como **conceitual**: *"Os schemas técnicos definitivos deverão ser versionados separadamente no documento Prompts e Schemas e refletidos no Modelo de Dados."*

**Objeto do perfil (Thin Twin):**

```json
{
  "profile_id": "profile_123",
  "profile_version_id": "profile_version_4",
  "version_number": 4,
  "professional_identity": {
    "current_area": "Produto",
    "current_role": "Product Analyst",
    "observed_seniority": {
      "value": "mid",
      "status": "inference",
      "confidence": 0.72
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
    "created_at": "ISO-8601",
    "updated_at": "ISO-8601",
    "previous_version_id": "profile_version_3",
    "confirmation_status": "confirmed"
  }
}
```

**Objeto do contexto-alvo (armazenado separadamente):**

```json
{
  "target_context_version_id": "target_context_version_2",
  "target_area": "Produto",
  "target_role": "Product Manager",
  "desired_seniority": "mid",
  "confirmation_status": "confirmed",
  "previous_version_id": "target_context_version_1"
}
```

### Taxonomias associadas ao Thin Twin (definidas no PRD 01, seções 25–28)

**Competência canônica (`CanonicalSkill`):**

```ts
type CanonicalSkill = {
  id: string;
  canonicalName: string;
  skillDomain: string;
  skillType: string;
  aliases: string[];
  description?: string;
  status: "active" | "deprecated" | "pending_review";
  taxonomyVersion: string;
};
```
Categorias de domínio (15): Engenharia de Software; Dados e Analytics; Inteligência Artificial; Infraestrutura, Cloud e DevOps; Segurança; Qualidade e Testes; Produto; Design; Pesquisa; Negócios e Estratégia; Métodos e Processos; Gestão e Liderança; Comunicação e Colaboração; Idiomas; Outras competências profissionais.
No banco: campos podem ser persistidos como `skill_domain` e `skill_type`.

**Ferramenta canônica (`CanonicalTool`):**

```ts
type CanonicalTool = {
  id: string;
  canonicalName: string;
  vendor?: string;
  toolCategory: string;
  aliases: string[];
  versions?: string[];
  taxonomyVersion: string;
};
```
Categorias (15): linguagens de programação; frameworks e bibliotecas; bancos de dados; dados e BI; cloud; DevOps e infraestrutura; testes e qualidade; segurança; produto e gestão; design e prototipação; pesquisa; colaboração; CRM e vendas; inteligência artificial e automação; outras ferramentas.
No banco: campo pode ser persistido como `tool_category`.

**Cargo normalizado (`NormalizedRole`):**

```ts
type NormalizedRole = {
  originalTitle: string;
  canonicalTitle?: string;
  roleFamily?: string;
  specialty?: string;
  seniority?: "intern" | "junior" | "mid" | "senior";
  track?: "individual_contributor" | "management" | "unknown";
  confidence: number;
  confirmedByUser: boolean;
};
```
Regra: título original nunca substituído; normalização não depende só do título; responsabilidades/escopo/contexto considerados; títulos como analista, especialista, consultor, coordenador não determinam senioridade; IA pode sugerir, classificação só confirmada após revisão; mapeamentos versionados.

**Período de experiência (`ExperiencePeriod`):**

```ts
type ExperiencePeriod = {
  startDate: string;
  endDate: string | null;
  startPrecision: "month" | "year";
  endPrecision: "month" | "year" | "ongoing";
  ongoing: boolean;
};
```
Regras: formato preferencial `YYYY-MM`; datas somente com ano permitidas; "atual" normalizado como `ongoing`; data final não pode ser anterior à inicial; períodos sobrepostos permitidos (gera alerta, não bloqueio); duração total da carreira não soma períodos simultâneos duas vezes; datas originais permanecem como evidência.

**Campos mínimos de uma experiência (seção 24 do PRD 01):**
Obrigatórios: cargo ou função; empresa/organização/contexto; data inicial (ao menos ano); data final ou indicação de atividade atual; pelo menos uma responsabilidade/entrega/projeto/descrição contextual.
Opcionais: localização; modalidade; tipo de contrato; ferramentas; competências; projetos; resultados; métricas; evidências; equipe; stakeholders.
Contextos aceitos: trabalho autônomo; consultoria; estágio; voluntariado; projeto acadêmico; projeto pessoal; empresa confidencial.
Nenhuma métrica é obrigatória.

**Limites de registros (seção 35 do PRD 01):**

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

Regras: limites não geram corte silencioso; usuário deve ser informado; nenhum item descartado; itens podem ser consolidados; casos excepcionais podem ser avaliados; limites são configuráveis e versionados.

---

## Contexto-alvo

O contexto-alvo é **coberto (parcialmente) em ambos os documentos**, mas nenhum dos dois define seu schema técnico definitivo — ambos remetem a "Prompts e Schemas" / "Modelo de Dados" para a versão final.

### O que os dois documentos dizem, combinado

**Definição/posição:** o contexto-alvo é o objetivo profissional do usuário, mantido **separadamente** do Thin Twin, com **versionamento próprio** (`target_context_version`). Não faz parte dos fatos profissionais do Thin Twin.

**Campos citados (PRD 01, RF-ONB-140 e seção 34):**
- área de interesse;
- cargo-alvo;
- especialidade (quando aplicável);
- senioridade desejada.

**Campos citados (Thin Twin, seção 4.2, "Contexto-alvo relacionado"):**
- área-alvo;
- cargo-alvo;
- senioridade desejada;
- tipo de transição;
- contexto da busca;
- preferências profissionais explicitamente informadas.

*(Nota: PRD 01 usa "área de interesse", Thin Twin usa "área-alvo" — provável mesmo conceito, nomes distintos; ver seção de conflitos.)*

**Fluxo de definição (PRD 01, seção 34):**
- RF-ONB-140: antes de concluir o onboarding, usuário informa ou confirma área de interesse, cargo-alvo, especialidade (quando aplicável), senioridade desejada.
- RF-ONB-141: usuário pode informar manualmente o cargo.
- RF-ONB-142: sistema pode sugerir **até três cargos relacionados**.
- RF-ONB-143: sugestões são apoio à decisão.
- RF-ONB-144: sugestões não são apresentadas como carreira ideal/definitiva.
- RF-ONB-145: usuário escolhe uma sugestão ou informa o cargo final.
- RF-ONB-146: contexto-alvo pode ser alterado posteriormente **sem** criar nova versão do Thin Twin.
- RF-ONB-147: a alteração cria nova `target_context_version` e preserva as versões anteriores utilizadas por análises.
- RF-ONB-148: sistema distingue: senioridade observável; senioridade atual informada; senioridade desejada.
- RF-ONB-149: sistema não deve elevar artificialmente a senioridade.

**Estados de interface do contexto-alvo (PRD 01, seção 39):** pendente; sugestões disponíveis; cargo informado; senioridade pendente; contexto confirmado.

**Eventos de analytics (PRD 01, seção 41):** `target_role_defined`; `target_role_suggested`; `target_role_selected`.

**Objeto conceitual (Thin Twin, seção 15):**
```json
{
  "target_context_version_id": "target_context_version_2",
  "target_area": "Produto",
  "target_role": "Product Manager",
  "desired_seniority": "mid",
  "confirmation_status": "confirmed",
  "previous_version_id": "target_context_version_1"
}
```

**Regra de associação a análises (Thin Twin, seção 11):** toda análise registra `profile_version_id` **e** `target_context_version_id`, além de data da análise, versão do motor, versão do prompt, versão da rubrica.

**Invariante (Thin Twin, seção 14, item 4):** toda análise baseada em objetivo deve possuir uma versão do contexto-alvo.

**Invariante (Thin Twin, seção 14, item 12):** alteração do objetivo profissional não modifica os fatos profissionais nem as análises anteriores.

### O que NÃO é coberto por nenhum dos dois documentos

Nenhum dos dois documentos apresenta: schema técnico/Zod definitivo do contexto-alvo; regras de validação de campo (tipos, enums permitidos além de `desired_seniority` e "senioridade desejada" como conceito); regras de retenção/expiração do contexto-alvo; regras completas de "tipo de transição" e "contexto da busca" (citados apenas uma vez, sem detalhamento, na seção 4.2 do Thin Twin); processo de exclusão do contexto-alvo. Isso fica remetido a **Prompts e Schemas** e **Modelo de Dados**, não lidos nesta tarefa.

---

## Estados e transições

### Máquina de estados — Onboarding (visão geral, PRD 01 seção 6 + seção 39)

Estados de acesso do usuário (seção 6, nomes descritivos do PRD, não enum literal):
1. **Onboarding não iniciado** — pode acessar introdução, iniciar preenchimento, encerrar sessão; não pode acessar Core 1/resultados/análise.
2. **Onboarding em andamento** — pode continuar da última etapa salva, atualizar dados, substituir materiais, acompanhar processamento, revisar perfil extraído.
3. **Revisão pendente** — pode revisar Thin Twin, corrigir, adicionar, remover, resolver divergências, confirmar perfil; não pode acessar Core 1 enquanto Thin Twin não confirmado.
4. **Perfil confirmado e contexto-alvo pendente** — pode visualizar perfil confirmado, definir contexto-alvo, atualizar perfil (gerando nova versão quando aplicável); não pode acessar Core 1 enquanto contexto-alvo obrigatório não definido.
5. **Onboarding concluído** — pode acessar Core 1, funcionalidades liberadas, atualizar currículo/LinkedIn, criar nova versão do Thin Twin, alterar contexto-alvo, realizar reanálises futuras.

Estados gerais da interface (seção 39): onboarding não iniciado; onboarding em andamento; onboarding pausado; etapa concluída; etapa bloqueada; onboarding concluído.

### Máquina de estados — Identificação (seção 39)

formulário inicial; preenchimento parcial; campo inválido; salvamento; dados salvos; falha.

### Máquina de estados — Upload (seção 39)

aguardando arquivo; arquivo selecionado; validação; arquivo válido; arquivo inválido; upload; upload concluído; falha; cancelamento; substituição.

### Máquina de estados — Processamento de documento (enum literal, seção 20)

```ts
type DocumentProcessingStatus =
  | "uploaded"
  | "validating"
  | "validated"
  | "queued"
  | "extracting"
  | "ocr_required"
  | "ocr_processing"
  | "normalizing"
  | "draft_created"
  | "awaiting_review"
  | "completed"
  | "failed_retryable"
  | "failed_final";
```

Estados descritivos equivalentes citados na seção 39 (nomenclatura de interface, não literal de enum): em fila; extração nativa; OCR necessário; OCR em andamento; normalização; rascunho criado; processamento prolongado; extração parcial; baixa confiança; falha recuperável; falha final.

*(Nota: o PRD deixa explícito que este enum representa a "visão funcional" e exige "mapeamento explícito para o enum canônico de processamento definido no Modelo de Dados" — ou seja, este não é necessariamente o enum final de banco de dados.)*

### Máquina de estados — Revisão (seção 39)

não iniciada; em andamento; divergência pendente; conflito crítico; baixa confiança; alterações não salvas; concluída; confirmação pendente.

### Máquina de estados — Perfil / Thin Twin (nível de versão) (seção 39)

rascunho; não confirmado; confirmado; nova versão pendente; nova versão criada.

Estados de confirmação por **campo/informação individual** (Thin Twin, seção 6): Extraído; Confirmado; Corrigido; Adicionado; Rejeitado; Em conflito; Não confirmado. Apenas Confirmado, Corrigido e Adicionado contam como fatos profissionais.

### Máquina de estados — Contexto-alvo (seção 39)

pendente; sugestões disponíveis; cargo informado; senioridade pendente; contexto confirmado.

### Transições/gates de acesso explícitos (regras de bloqueio consolidadas)

- Core 1 bloqueado sem currículo válido (RF-ONB-036).
- Core 1 bloqueado sem LinkedIn válido (RF-ONB-050).
- Core 1 bloqueado até Thin Twin confirmado e contexto-alvo válido (RF-ONB-125, RF-ONB-039 seção 6).
- Conflitos críticos bloqueiam a confirmação do Thin Twin (RF-ONB-126, seção 29 "Regra de bloqueio").
- Onboarding só é concluído com todos os 9 pré-requisitos listados em RF-ONB-150.
- Jobs travados (sem atualização por 10 min) retornam à fila (RF-ONB-096/097).
- Após 3 tentativas falhas, job vai para DLQ (seção 19).
- Após 5 minutos, tentativa é encerrada como "falha recuperável" (RF-ONB-070).

---

## Regras de retenção/exclusão mencionadas aqui

### Tabela de retenção (PRD 01, seção 37)

| Artefato | Retenção |
| --- | --- |
| Arquivo original elegível | Até 24 horas |
| Imagens de OCR após sucesso | Até 6 horas |
| PDF temporário de OCR | Até 6 horas |
| Artefatos de tentativa com falha | Até 24 horas |
| Logs técnicos sem conteúdo profissional | 30 dias |
| Conteúdo estruturado confirmado | Conforme política da conta |

**Meta operacional:** "99% dos arquivos originais elegíveis excluídos em até 24 horas."

**Elegibilidade para exclusão** — um arquivo é elegível quando: (1) a extração terminar; (2) o conteúdo estruturado estiver persistido; (3) a integridade estiver validada; (4) não existir nova tentativa ativa.

**Operação:** job de exclusão a cada hora; alerta após 18 horas; incidente após 24 horas; novas tentativas automáticas; registro da elegibilidade; registro das tentativas; registro da confirmação.

**Requisitos relacionados:**
- RF-ONB-104: arquivo rejeitado (ex.: protegido por senha) deve ser excluído assim que tecnicamente possível.
- RF-ONB-156: artefatos não devem ser mantidos indefinidamente para depuração.
- RF-ONB-157: acesso administrativo deve ser registrado.
- RF-ONB-158: a fila deve armazenar apenas identificadores (não o documento nem texto completo — reforça RF-ONB-063).
- RN-ONB-006: arquivos originais são temporários.
- RF-ONB-099/100: reenvio não é necessário enquanto o arquivo original estiver disponível; se já excluído, usuário deve reenviar.

Estes valores também aparecem replicados no bloco `ONBOARDING_CONFIG.retention` (seção 43): `originalFileHours: 24`, `successfulIntermediateHours: 6`, `failedIntermediateHours: 24`, `technicalLogDays: 30`.

O documento Thin Twin **não** aborda retenção/exclusão de arquivos — esse tema é tratado exclusivamente no PRD 01.

---

## Conflitos ou ambiguidades internas

1. **Nomenclatura do campo de área-alvo — "área de interesse" vs. "área-alvo".**
   PRD 01 (seção 3, Objetivo; seção 34, RF-ONB-140; seção 44, item 37) usa consistentemente **"área de interesse"**.
   Thin Twin (seção 4.2) usa **"área-alvo"**: *"O contexto-alvo será mantido separadamente do Thin Twin e poderá conter: área-alvo; cargo-alvo; senioridade desejada; tipo de transição; contexto da busca; preferências profissionais explicitamente informadas."*
   O objeto JSON conceitual do Thin Twin (seção 15) usa a chave `"target_area"`, que é ambígua entre os dois termos. Não fica claro se são sinônimos ou conceitos distintos (ex.: "área de interesse" mais amplo/exploratório vs. "área-alvo" mais definido).

2. **Campos do contexto-alvo — "especialidade" citada só no PRD 01.**
   PRD 01 lista explicitamente **"especialidade, quando aplicável"** como um dos quatro campos do contexto-alvo a definir antes de concluir o onboarding (RF-ONB-140, seção 44 item 37).
   Thin Twin (seção 4.2) **não menciona "especialidade"** entre os campos do contexto-alvo — lista área-alvo, cargo-alvo, senioridade desejada, tipo de transição, contexto da busca, preferências. O objeto JSON conceitual do contexto-alvo (Thin Twin seção 15) também não inclui campo de especialidade.
   Isso é uma lacuna, não necessariamente uma contradição — mas o esquema técnico final precisa decidir se "especialidade" do contexto-alvo existe como campo próprio.

3. **"Tipo de transição" e "contexto da busca" — citados uma única vez, sem detalhamento.**
   Aparecem apenas no Thin Twin (seção 4.2), sem qualquer explicação de valores possíveis, formato, ou se são obrigatórios/opcionais. O PRD 01 não menciona esses dois campos em nenhum lugar (nem na seção 34 de requisitos funcionais do contexto-alvo, nem nas mensagens, nem no objeto de configuração). Ambiguidade: não está claro se esses campos fazem parte do MVP ou são aspiração futura.

4. **Formato de arquivo `.txt` no `ONBOARDING_CONFIG` vs. seção de requisitos de currículo.**
   O bloco de configuração (PRD 01, seção 43) lista `allowedExtensions: ["pdf", "docx", "txt"]` — incluindo upload de arquivo `.txt`.
   A seção de requisitos funcionais de currículo (seção 12, RF-ONB-022) especifica que o sistema deve aceitar "PDF; DOCX; texto colado" — ou seja, texto colado via campo de formulário, não necessariamente um upload de arquivo `.txt`. A seção 23 (RF-ONB-023) lista formatos rejeitados e não menciona `.txt` nem para aceitar nem para rejeitar como arquivo. Não fica explícito se `allowedExtensions: ["...", "txt"]` no objeto de configuração se refere a um upload de arquivo de texto puro (distinto de "colar texto" em um textarea) ou é apenas a representação técnica interna do mecanismo de "texto colado". Vale confirmar na Arquitetura/Modelo de Dados.

5. **Estados de confirmação por campo — nomenclatura levemente distinta entre os dois documentos.**
   Thin Twin (seção 6) define formalmente 7 estados com nomes precisos: Extraído, Confirmado, Corrigido, Adicionado, Rejeitado, Em conflito, Não confirmado.
   PRD 01 (seção 30, RF-ONB-118) lista o que a interface deve "diferenciar visualmente": "informação extraída; informação adicionada; informação corrigida; informação confirmada; baixa confiança; divergência; inferência não confirmada." Os termos "baixa confiança", "divergência" e "inferência não confirmada" (PRD 01) não mapeiam 1:1 para "Em conflito" e "Não confirmado" (Thin Twin) — o PRD 01 parece tratar "baixa confiança" como um atributo/estado visual adicional que o Thin Twin não lista como estado de confirmação formal (no Thin Twin, confiança é um eixo separado — seção 7 — não um estado de confirmação). Isto sugere que "estado de confirmação" (Thin Twin) e "estado visual da revisão" (PRD 01) são dois conceitos relacionados mas não idênticos, e a implementação precisa decidir se são o mesmo enum ou dois enums compostos.

6. **Contagem de dados pessoais coletados — "Não integram o Thin Twin" (PRD 01) vs. "Dados que não pertencem ao Thin Twin" (Thin Twin).**
   Não é uma contradição, mas uma diferença de escopo/detalhamento a notar: a lista do PRD 01 (seção 23) é curta — nome, e-mail, cidade, estado; dados de autenticação; área-alvo/cargo-alvo/especialidade/senioridade desejada; vagas/análises/recomendações/ações/feedbacks. A lista do Thin Twin (seção 13) é muito mais extensa, incluindo categorias sensíveis nunca mencionadas no PRD 01 (avaliações psicológicas; inferências sobre saúde, origem étnica, opiniões políticas/religiosas; probabilidade de contratação; ranking do usuário). O PRD 01 não contradiz isso, mas também não reforça essas proibições adicionais — um leitor apenas do PRD 01 não saberia que essas categorias sensíveis são explicitamente vedadas.

7. **Onde a versão inicial do Thin Twin é "criada" vs. "persistida".**
   PRD 01 (seção 9, passo 19; seção 32, RF-ONB-133) usa a expressão "o sistema cria uma versão imutável do Thin Twin" após a confirmação.
   Thin Twin (seção 12, ciclo de vida, passo 8) usa "versão inicial do Thin Twin é persistida" — após o passo 7 ("usuário confirma, corrige, adiciona ou rejeita informações"). Não é uma contradição de fato, mas os verbos ("criar" vs. "persistir") e a ordenação de passos diferem ligeiramente em granularidade; ambos os documentos concordam que a confirmação do usuário precede a criação da versão imutável.

Nenhuma contradição de fato (valores numéricos, limites, nomes de campos centrais) foi encontrada entre os dois documentos — as divergências acima são de nomenclatura, nível de detalhe, ou lacunas de cobertura, não de regras conflitantes entre si.
