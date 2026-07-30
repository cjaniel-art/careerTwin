# Segurança, Privacidade e Retenção

Criado em: 27 de julho de 2026 23:24

## 1. Objetivo

Proteger os dados pessoais e profissionais do usuário durante todo o ciclo de vida:

- coleta;
- envio;
- armazenamento;
- processamento;
- análise;
- consulta;
- atualização;
- versionamento;
- compartilhamento com fornecedores autorizados;
- retenção;
- exclusão;
- recuperação de incidentes.

Este documento define controles operacionais e técnicos para o MVP.

Ele não substitui:

- Política de Privacidade pública;
- Termos de Uso;
- contratos com fornecedores;
- avaliação jurídica;
- registros formais exigidos pela organização.

A implementação deverá preservar:

- confidencialidade;
- integridade;
- disponibilidade;
- rastreabilidade;
- isolamento entre usuários;
- minimização;
- controle do usuário;
- exclusão auditável.

O Claude Code deverá utilizar esta página como contrato de segurança e privacidade da implementação.

O Claude Code não poderá:

- alterar prazos de retenção;
- ampliar a coleta de dados;
- criar novos usos para os dados;
- habilitar compartilhamento com fornecedores;
- alterar consentimentos;
- remover controles de acesso;
- flexibilizar requisitos de segurança;
- registrar dados sensíveis para facilitar depuração;

sem decisão formal registrada no Decision Log.

---

## 2. Princípios

### Minimização

Coletar, armazenar, transmitir e processar somente os dados necessários para a finalidade declarada.

Não coletar um dado apenas porque ele poderá ser útil no futuro.

### Finalidade

Utilizar os dados somente para:

- operar a conta;
- criar e manter o Thin Twin;
- manter o contexto-alvo;
- processar documentos;
- gerar análises;
- apresentar recomendações;
- preservar histórico;
- executar ações solicitadas pelo usuário;
- melhorar o produto quando houver autorização e base adequadas;
- proteger a plataforma.

### Separação

Dados pessoais devem permanecer separados dos dados profissionais utilizados pela inteligência artificial.

Também devem permanecer separados:

- autenticação;
- dados pessoais;
- Thin Twin;
- contexto-alvo;
- oportunidades;
- análises;
- analytics;
- logs técnicos;
- dados de pesquisa.

### Transparência

O usuário deverá conseguir compreender:

- quais dados são coletados;
- por que são utilizados;
- quais dados são enviados à IA;
- quais fornecedores participam do processamento;
- por quanto tempo os dados são mantidos;
- como corrigir informações;
- como solicitar exclusão;
- como revogar consentimentos opcionais.

### Controle do usuário

Permitir:

- revisão;
- correção;
- atualização;
- confirmação;
- exclusão;
- revogação de consentimentos opcionais;
- consulta ao status de exclusão.

### Segurança por padrão

Toda funcionalidade deve nascer com:

- acesso mínimo;
- storage privado;
- autenticação e autorização;
- logs seguros;
- validação de entradas;
- retenção definida;
- exclusão prevista;
- tratamento de falhas;
- testes de isolamento.

### Privacidade por padrão

A configuração inicial deverá utilizar:

- menor coleta;
- menor retenção;
- menor exposição;
- menor compartilhamento;
- menor acesso administrativo.

---

## 3. Classificação dos dados

### Restritos

- senhas;
- tokens;
- cookies de sessão;
- chaves administrativas;
- chaves de integração;
- segredos;
- credenciais de banco;
- URLs assinadas ainda válidas;
- dados internos de autenticação;
- chaves de criptografia.

Esses dados:

- não devem ser enviados à IA;
- não devem ser enviados para analytics;
- não devem aparecer em logs;
- não devem ser expostos ao frontend quando forem server-side;
- devem possuir acesso estritamente controlado.

### Confidenciais pessoais

- nome completo;
- e-mail;
- cidade;
- estado;
- dados da conta;
- registros de consentimento;
- solicitação de exclusão;
- dados de contato utilizados em pesquisa.

Não serão coletados no MVP:

- data de nascimento;
- CEP;
- rua;
- número;
- complemento;
- bairro;
- endereço residencial completo;
- dados de cartão.

### Confidenciais profissionais

- currículo;
- conteúdo do LinkedIn;
- experiências;
- responsabilidades;
- projetos;
- competências;
- ferramentas;
- resultados;
- evidências;
- formação;
- certificações;
- contexto-alvo;
- vagas;
- requisitos;
- análises;
- scores;
- confiança;
- recomendações;
- ações;
- comentários livres;
- feedbacks profissionais.

### Internos

- configurações;
- versões de prompt;
- versões de schema;
- versões do motor;
- métricas agregadas;
- custos;
- indicadores operacionais;
- logs técnicos sem conteúdo profissional;
- relatórios de qualidade;
- informações de incidentes.

### Públicos

- conteúdo institucional;
- páginas públicas;
- documentação publicada;
- Política de Privacidade;
- Termos de Uso;
- materiais de marca autorizados.

A classificação pública deverá ser explícita. Um dado não deverá ser considerado público apenas porque foi encontrado em um currículo, LinkedIn ou vaga.

---

## 4. Dados pessoais e inteligência artificial

A inteligência artificial deverá receber somente o contexto necessário para a tarefa.

Não devem ser enviados ao modelo:

- nome completo, salvo necessidade excepcional e justificada;
- e-mail;
- cidade ou estado sem necessidade geográfica;
- data de nascimento;
- CEP;
- endereço residencial;
- credenciais;
- senhas;
- tokens;
- URLs assinadas;
- chaves;
- dados financeiros;
- identificadores internos desnecessários;
- documentos de outros usuários;
- histórico não relacionado à tarefa.

Como regra, o contexto deverá utilizar:

- identificadores técnicos não diretamente identificáveis;
- versão do Thin Twin;
- versão do contexto-alvo;
- versão da oportunidade;
- informações profissionais mínimas;
- evidências estritamente necessárias.

Cidade e estado somente poderão ser utilizados em análise quando:

- houver requisito geográfico explícito;
- o uso for necessário para a análise;
- a finalidade estiver informada;
- somente a informação mínima for utilizada.

Dados pessoais não influenciam:

- IPP;
- IAO;
- confiança profissional;
- recomendações;
- classificação de senioridade;
- prioridade de candidatura.

O backend deverá remover dados proibidos antes da chamada ao provedor de IA.

A remoção não deverá depender apenas das instruções do prompt.

---

## 5. Retenção

A retenção deverá ser definida por tipo de dado e finalidade.

### Arquivos originais

| Artefato | Retenção máxima inicial |
| --- | --- |
| Currículo original elegível | Até 24 horas |
| LinkedIn original elegível | Até 24 horas |
| Vaga original elegível | Até 24 horas |
| Imagens geradas para OCR após sucesso | Até 6 horas |
| PDF temporário produzido para OCR | Até 6 horas |
| Artefatos de tentativa com falha | Até 24 horas |
| Arquivos rejeitados | Somente pelo período necessário para registrar e concluir a rejeição |

Um arquivo torna-se elegível para exclusão quando:

1. o processamento aplicável terminou;
2. os dados necessários foram persistidos;
3. a integridade do resultado foi validada;
4. não existe nova tentativa ativa;
5. o arquivo não é necessário para uma correção em andamento.

Meta operacional:

> **99% dos arquivos originais elegíveis devem ser excluídos em até 24 horas.**
> 

### Dados estruturados

Podem permanecer enquanto a conta estiver ativa:

- Thin Twin;
- versões do Thin Twin;
- contexto-alvo e versões;
- evidências mínimas;
- oportunidades confirmadas;
- versões das oportunidades;
- análises;
- scores;
- confiança;
- recomendações;
- ações;
- feedbacks;
- consentimentos;
- eventos necessários para operação e auditoria.

### Conteúdo textual integral

Conteúdo integral extraído de currículo, LinkedIn ou vaga não deverá ser mantido indefinidamente por padrão.

Após a estruturação e confirmação, deverão permanecer somente:

- dados estruturados necessários;
- snippets mínimos de evidência;
- metadados necessários;
- informações exigidas para rastreabilidade.

### Logs técnicos

Prazo inicial:

- até 30 dias para logs técnicos operacionais sem conteúdo profissional.

Prazos diferentes deverão ser documentados conforme:

- finalidade;
- risco;
- necessidade de investigação;
- obrigação aplicável;
- custo;
- impacto de privacidade.

Logs não deverão ser mantidos indefinidamente.

### Exclusão da conta

Metas operacionais:

- sistemas ativos: até 15 dias;
- remoção ou expiração em backups: até 30 dias.

Os prazos deverão ser apresentados como metas operacionais enquanto a política jurídica definitiva não estiver aprovada.

---

## 6. Fluxo de exclusão dos arquivos

1. processamento termina com sucesso ou falha final;
2. sistema confirma a persistência dos dados necessários;
3. sistema verifica se existe retentativa ativa;
4. arquivo recebe `retention_deadline`;
5. job automático identifica arquivos elegíveis;
6. arquivo é removido do storage;
7. artefatos intermediários são removidos;
8. registro é atualizado com `deleted_at`;
9. confirmação de exclusão é registrada;
10. falhas geram nova tentativa;
11. falhas persistentes geram alerta;
12. atraso acima do prazo gera incidente;
13. exceções são justificadas e auditadas.

### Operação mínima

- job de exclusão executado pelo menos a cada hora;
- alerta preventivo após 18 horas;
- incidente quando o prazo de 24 horas for excedido;
- retentativas limitadas;
- idempotência;
- registro da elegibilidade;
- registro das tentativas;
- registro da confirmação;
- monitoramento da taxa de exclusão.

### Regras

- excluir um arquivo duas vezes não deve gerar erro irreversível;
- arquivo ausente deve ser tratado como estado seguro quando a exclusão estiver confirmada;
- exclusão do storage e atualização do banco devem permanecer consistentes;
- falha de atualização do banco após exclusão deve ser recuperável;
- artefatos não devem ser mantidos indefinidamente para depuração;
- acesso administrativo ao arquivo deve ser registrado.

O Claude Code deverá implementar testes para:

- arquivo elegível;
- arquivo com retentativa ativa;
- arquivo já excluído;
- falha temporária de storage;
- falha permanente;
- execução duplicada do job;
- atraso além do prazo.

---

## 7. Exclusão da conta

Fluxo mínimo:

1. usuário autenticado solicita exclusão;
2. sistema apresenta o escopo da exclusão;
3. usuário confirma explicitamente;
4. sistema registra a solicitação;
5. conta entra em `deletion_pending`;
6. novas análises e uploads são bloqueados;
7. sessões ativas são encerradas quando aplicável;
8. jobs em andamento são interrompidos ou finalizados de forma segura;
9. arquivos temporários são excluídos;
10. dados pessoais são excluídos;
11. Thin Twin e versões são excluídos;
12. contextos-alvo são excluídos;
13. oportunidades e requisitos são excluídos;
14. análises e resultados são excluídos;
15. recomendações e ações são excluídas;
16. feedbacks identificáveis são excluídos;
17. identificadores pessoais em analytics são removidos ou anonimizados conforme política;
18. conta de autenticação é removida;
19. conclusão nos sistemas ativos é registrada;
20. dados em backups expiram ou são removidos conforme o prazo;
21. status final é disponibilizado ao usuário quando aplicável.

### Regras

A exclusão deverá ser:

- idempotente;
- rastreável;
- auditável;
- recuperável após falha;
- executada em etapas;
- protegida contra exclusão do usuário errado;
- associada a uma solicitação confirmada.

A solicitação deverá registrar:

- identificador;
- usuário;
- data;
- confirmação;
- status;
- prazo de sistemas ativos;
- prazo de backups;
- falhas;
- conclusão.

Registros que precisem permanecer por obrigação legítima deverão ser:

- minimizados;
- protegidos;
- separados dos dados ativos;
- desvinculados quando possível;
- documentados.

Uma exclusão não deverá ser considerada concluída apenas porque a conta deixou de aparecer na interface.

---

## 8. Consentimentos

Os consentimentos deverão ser separados por finalidade.

### Tratamento necessário para o serviço

Abrange o processamento necessário para:

- criar e operar a conta;
- receber documentos;
- criar o Thin Twin;
- manter o contexto-alvo;
- gerar análises;
- manter o histórico;
- apresentar recomendações;
- executar exclusões;
- proteger a plataforma.

Esse tratamento deverá possuir registro e base adequada.

### Consentimento opcional para melhoria

Poderá abranger uso autorizado de dados:

- anonimizados;
- selecionados;
- minimizados;
- separados de identificadores diretos;

para:

- melhorar prompts;
- avaliar qualidade;
- criar casos de teste;
- analisar falhas;
- desenvolver o produto.

A recusa ao consentimento opcional:

- não impede o cadastro;
- não impede o onboarding;
- não impede o Core 1;
- não impede o Core 2;
- não reduz a qualidade intencionalmente;
- não altera créditos.

### Registro

Cada consentimento deverá registrar:

- tipo;
- versão da política;
- status;
- origem;
- data;
- revogação, quando aplicável.

### Revogação

A revogação deverá:

- impedir novos usos opcionais;
- não alterar retroativamente tratamentos já concluídos de forma válida;
- atualizar o registro;
- ser refletida nos processos relacionados.

O Claude Code não deverá combinar consentimentos diferentes em uma única opção genérica.

---

## 9. Controle de acesso

### Usuário

Acessa somente:

- seus dados pessoais;
- seu Thin Twin;
- seus contextos-alvo;
- seus documentos;
- suas oportunidades;
- suas análises;
- suas recomendações;
- suas ações;
- seus feedbacks;
- seus créditos;
- suas solicitações.

### Aplicação

Utiliza permissões mínimas para cada operação.

O frontend não deverá possuir:

- chave administrativa;
- service role;
- acesso irrestrito ao banco;
- acesso irrestrito ao storage;
- segredos de fornecedores.

### Backend

Deve:

- derivar o usuário da sessão;
- validar propriedade;
- não confiar em `user_id` enviado livremente;
- validar relações entre recursos;
- limitar cada chamada à operação necessária;
- registrar operações críticas.

### Serviços internos e workers

Devem acessar somente:

- jobs necessários;
- documentos relacionados;
- análise relacionada;
- usuário proprietário;
- recursos exigidos pela execução.

O uso de service role deverá permanecer restrito ao ambiente server-side e não elimina a necessidade de validação de propriedade.

### Administração

O acesso administrativo deverá ser:

- excepcional;
- temporário quando possível;
- baseado em menor privilégio;
- justificado;
- auditado;
- revisado;
- revogado quando não for mais necessário.

### Desenvolvimento

Desenvolvedores e Claude Code não devem possuir acesso irrestrito a dados reais de produção.

Desenvolvimento, testes, seeds e fixtures devem utilizar dados sintéticos.

---

## 10. Proteções técnicas

Controles mínimos:

- HTTPS;
- criptografia em trânsito;
- criptografia em repouso oferecida pelo provedor;
- autenticação;
- autorização server-side;
- Row Level Security ou mecanismo equivalente;
- buckets privados;
- URLs assinadas e temporárias;
- menor privilégio;
- segregação de ambientes;
- migrations versionadas;
- gerenciamento de segredos;
- rotação de credenciais;
- proteção de branches;
- revisão de código;
- análise de dependências;
- testes de autorização;
- logs de auditoria;
- backups protegidos;
- alertas;
- rate limiting;
- proteção contra abuso;
- validação de entradas;
- validação de schemas;
- sanitização;
- prevenção de prompt injection;
- idempotência;
- proteção contra processamento duplicado;
- monitoramento de exclusões;
- tratamento de incidentes.

### Sessões

A implementação deverá considerar:

- expiração;
- revogação;
- logout;
- invalidação após exclusão;
- proteção de cookies;
- redirecionamentos autorizados;
- recuperação de senha segura;
- mensagens neutras.

Política de senha, confirmação de e-mail e duração da sessão permanecem dependentes de decisão registrada no PRD 00 e no Decision Log.

### Dependências

O Claude Code deverá:

- utilizar dependências mantidas;
- evitar bibliotecas desnecessárias;
- revisar pacotes com vulnerabilidades conhecidas;
- manter lockfile;
- não executar scripts não confiáveis;
- registrar exceções de segurança;
- não desabilitar verificações para concluir um build.

---

## 11. Upload seguro

Validar antes do processamento:

- allowlist de extensões;
- tipo real do arquivo;
- MIME type;
- tamanho;
- quantidade de páginas;
- estrutura;
- checksum;
- proteção por senha;
- conteúdo mínimo;
- presença de malware;
- tentativas excessivas;
- autenticação;
- autorização.

Rejeitar:

- executáveis;
- scripts;
- arquivos compactados não autorizados;
- arquivos protegidos quando não suportados;
- conteúdo acima dos limites;
- arquivo corrompido;
- tipo incompatível;
- arquivo malicioso;
- upload anônimo;
- conteúdo sem material profissional mínimo quando a etapa exigir esse conteúdo.

### Regras

- gerar nome interno;
- não utilizar o nome original como caminho;
- não executar o arquivo;
- manter em bucket privado;
- utilizar URL assinada;
- limitar validade da URL;
- não incluir documento ou texto completo em mensagens da fila;
- não incluir credenciais, tokens ou URLs assinadas em analytics;
- calcular checksum;
- impedir que um usuário acesse o upload de outro usuário;
- excluir o arquivo segundo a política de retenção.

### Processamento

Extração, OCR e antimalware deverão ocorrer:

- em ambiente isolado;
- com recursos limitados;
- sem acesso desnecessário a segredos;
- sem executar macros ou scripts;
- com timeout;
- com registro técnico seguro.

O Claude Code não deverá remover verificações de arquivo para acelerar o desenvolvimento.

---

## 12. Segurança da integração com IA

### Acesso

Chamadas ao provedor deverão ocorrer somente:

- pelo backend;
- por worker autorizado;
- com credenciais server-side;
- com correlação técnica;
- dentro do fluxo autorizado.

### Contexto

Enviar somente:

- Thin Twin necessário;
- contexto-alvo necessário;
- oportunidade necessária;
- evidências mínimas;
- schema;
- instruções versionadas.

### Isolamento

Cada chamada deverá estar associada a:

- usuário;
- versão do Thin Twin;
- versão do contexto-alvo;
- versão da oportunidade, quando aplicável;
- análise;
- job;
- prompt;
- schema;
- modelo.

Contexto não deverá ser reutilizado entre usuários.

### Prompt injection

Currículos, conteúdos do LinkedIn e vagas deverão ser tratados como dados não confiáveis.

O sistema deverá:

- delimitar documentos;
- ignorar instruções encontradas no conteúdo;
- utilizar schemas com enums;
- limitar ferramentas;
- validar a saída;
- bloquear comportamento não permitido;
- registrar padrões suspeitos quando aplicável.

### Saída

Toda resposta deverá passar por:

- parse;
- validação estrutural;
- validação de tipos;
- validação de enums;
- validação de evidências;
- validação de autenticidade;
- validação de dados proibidos;
- validação de propriedade;
- cálculo determinístico no backend.

### Fornecedor

Antes da adoção definitiva, avaliar:

- região de processamento;
- retenção de entradas e saídas;
- uso para treinamento;
- controles de segurança;
- subfornecedores;
- exclusão;
- disponibilidade;
- registros contratuais;
- resposta a incidentes.

Nenhuma opção de treinamento com dados do usuário deverá ser ativada sem autorização e decisão formal.

### Claude Code

O Claude Code não deverá:

- inserir prompts completos com dados reais em testes;
- copiar documentos reais para fixtures;
- registrar respostas integrais;
- expor chaves do provedor;
- alterar políticas do fornecedor;
- habilitar armazenamento adicional;
- adicionar ferramentas externas ao agente sem aprovação.

---

## 13. Ameaças prioritárias

| Ameaça | Controle preventivo | Controle detectivo | Resposta |
| --- | --- | --- | --- |
| Acesso entre usuários | RLS e validação server-side | Testes e logs de autorização | Bloquear acesso e abrir incidente |
| Vazamento por URL pública | Storage privado e URL assinada | Verificação de configuração | Revogar URL, excluir objeto e corrigir política |
| Exposição de segredo | Gerenciador e menor privilégio | Scanning de repositório | Rotacionar e investigar |
| Prompt injection | Delimitação, schemas e ferramentas limitadas | Validação de saída | Ignorar instrução ou interromper |
| Upload malicioso | Allowlist, MIME real e antimalware | Logs de rejeição | Rejeitar, isolar e registrar |
| Invenção factual da IA | Evidências, guardrails e QA | Validador de autenticidade | Bloquear resultado |
| Usuário ou versão incorreta | Validação de propriedade e versões | Auditoria de vínculos | Interromper e abrir incidente |
| Duplicação de crédito | Reserva, idempotência e ledger | Reconciliação | Liberar ou restaurar crédito |
| Retenção indevida | Jobs automáticos e alertas | Métrica de arquivos vencidos | Excluir e abrir incidente |
| Exposição em logs | Redação e allowlist de campos | Scanning e revisão | Remover, restringir e investigar |
| Exclusão incompleta | Orquestração e estados | Reconciliação de recursos | Retomar exclusão e registrar evidência |
| Dependência vulnerável | Scanning e atualização | Alertas de vulnerabilidade | Atualizar, mitigar ou remover |
| Conta comprometida | Sessão, rate limit e revogação | Eventos de autenticação | Revogar sessões e proteger conta |
| Migration insegura | Revisão e homologação | Testes de integridade | Interromper deploy e recuperar |
| Backup inacessível ou exposto | Criptografia e acesso restrito | Teste e auditoria | Corrigir configuração e investigar |
| Analytics com dados profissionais | Catálogo e payload mínimo | Auditoria de eventos | Interromper envio e corrigir |
| Dados reais no ambiente de desenvolvimento | Dados sintéticos | Revisão e scanning | Remover, rotacionar e investigar |

A matriz deverá ser revisada quando:

- uma nova funcionalidade for criada;
- um novo fornecedor for adotado;
- um novo tipo de dado for coletado;
- um novo fluxo de upload for adicionado;
- ocorrer incidente relevante.

---

## 14. Logs seguros

### Não registrar

- currículo integral;
- LinkedIn integral;
- vaga integral;
- evidências textuais extensas;
- comentários livres integrais;
- nome completo sem necessidade;
- e-mail em texto aberto;
- cidade ou estado sem necessidade;
- endereço;
- data de nascimento;
- senha;
- tokens;
- cookies;
- URLs assinadas;
- chaves;
- segredos;
- prompts completos com dados profissionais;
- respostas integrais da IA;
- dados financeiros;
- stack trace em mensagem visível ao usuário.

### Registrar

- identificadores técnicos;
- `correlation_id`;
- `job_id`;
- `analysis_id`;
- tipo de operação;
- status;
- duração;
- código de erro;
- categoria de erro;
- versão do modelo;
- versão do prompt;
- versão do schema;
- versão do motor;
- versão da configuração;
- número da tentativa;
- tamanho aproximado do payload;
- quantidade de tokens;
- resultado da validação;
- limite aplicado;
- confirmação de exclusão;
- operação administrativa relevante.

### Regras

- utilizar allowlist de campos;
- mascarar identificadores quando necessário;
- limitar acesso;
- definir retenção;
- proteger exportações;
- impedir analytics de receber logs técnicos integrais;
- não registrar payload por padrão;
- revisar logs adicionados pelo Claude Code;
- não utilizar `console.log` com dados operacionais em produção;
- não transformar logs em uma cópia paralela do banco.

---

## 15. Backups

A estratégia deverá definir:

- periodicidade;
- escopo;
- retenção;
- criptografia;
- controle de acesso;
- região;
- responsável;
- monitoramento;
- teste de restauração;
- exclusão;
- recuperação de desastre.

### Regras

- backups devem permanecer separados do ambiente ativo;
- acesso deve ser restrito;
- credenciais devem ser independentes quando aplicável;
- dados excluídos devem expirar ou ser removidos dentro da meta definida;
- backups não devem ser utilizados para consultas operacionais;
- restauração deve ocorrer em ambiente controlado;
- testes devem utilizar menor quantidade de dados necessária;
- resultados dos testes devem ser registrados;
- falhas de backup devem gerar alerta;
- restauração não deverá reativar contas ou dados excluídos sem tratamento.

Backups não devem ser considerados uma solução válida até que uma restauração tenha sido testada com sucesso.

O Claude Code não deverá assumir:

- provedor;
- frequência;
- retenção detalhada;
- região;
- objetivo de recuperação;

sem decisão arquitetural registrada.

---

## 16. Secure Development Lifecycle

Antes de liberar uma funcionalidade:

1. revisar requisitos e documentos relacionados;
2. identificar dados coletados e processados;
3. revisar finalidade;
4. revisar minimização;
5. revisar modelo de ameaça;
6. revisar autenticação;
7. revisar autorização;
8. revisar políticas de RLS;
9. revisar storage;
10. revisar uploads;
11. revisar chamadas à IA;
12. revisar schemas;
13. revisar logs;
14. revisar analytics;
15. revisar retenção;
16. revisar exclusão;
17. revisar segredos;
18. executar análise de dependências;
19. executar testes de isolamento;
20. executar testes de segurança;
21. executar testes de privacidade;
22. executar QA da IA;
23. revisar migrations;
24. atualizar documentação;
25. obter aprovação quando houver decisão pendente.

### Testes mínimos

- usuário acessando o próprio recurso;
- usuário tentando acessar recurso de outro usuário;
- acesso anônimo;
- alteração de `user_id` no payload;
- upload malicioso;
- arquivo de tipo falso;
- URL assinada expirada;
- documento de outro usuário;
- prompt injection;
- schema inválido;
- dado pessoal enviado à IA;
- dado profissional enviado a analytics;
- segredo registrado;
- exclusão duplicada;
- exclusão parcialmente concluída;
- job de retenção atrasado;
- backup restaurado;
- migration com dados existentes.

### Diretrizes para Claude Code

Toda alteração funcional deverá incluir, quando aplicável:

- migration;
- política de acesso;
- validação;
- teste;
- log seguro;
- evento de analytics aprovado;
- rotina de retenção;
- tratamento de exclusão;
- documentação.

O Claude Code deverá interromper a parte afetada quando não existir definição suficiente sobre:

- finalidade;
- consentimento;
- retenção;
- fornecedor;
- acesso;
- exclusão;
- política de sessão;
- backup;
- dados enviados à IA.

---

## 17. Critérios de bloqueio de release

A release deverá ser bloqueada quando houver:

- usuário acessando dado de outro usuário;
- política de acesso ausente em tabela de usuário;
- autorização implementada somente na interface;
- bucket público;
- arquivo acessível por URL permanente;
- arquivo não excluído conforme a política;
- exclusão de conta incompleta;
- exclusão associada ao usuário errado;
- segredo exposto;
- segredo versionado no repositório;
- dado pessoal enviado indevidamente à IA;
- documento de outro usuário enviado à IA;
- analytics contendo currículo, LinkedIn, vaga ou evidência textual;
- logs contendo conteúdo sensível;
- senha, token ou chave em log;
- saída de IA persistida sem validação;
- prompt injection alterando comportamento do sistema;
- falha crítica de RLS;
- upload malicioso executável;
- antimalware ou validação obrigatória desativados;
- backup sem proteção;
- restauração nunca testada antes da entrada em produção;
- retenção sem job ou monitoramento;
- exclusão sem rastreabilidade;
- falha crítica sem alerta;
- migration destrutiva sem aprovação;
- dependência crítica vulnerável sem mitigação;
- consentimento opcional bloqueando o produto;
- coleta de data de nascimento, CEP ou endereço residencial;
- uso de dados pessoais no IPP, IAO, confiança ou recomendações;
- dados reais de produção utilizados em seeds, fixtures ou desenvolvimento;
- alteração silenciosa de prazo, finalidade, fornecedor ou regra de segurança.

A liberação somente poderá ocorrer após:

1. correção;
2. reteste;
3. registro da evidência;
4. revisão dos documentos afetados;
5. registro no Decision Log quando houver mudança de decisão.

> **A implementação não deve depender apenas da IA, da interface ou da boa intenção do código. Segurança, privacidade, retenção e isolamento precisam ser garantidos por contratos, políticas, validações, infraestrutura, testes e monitoramento.**
>