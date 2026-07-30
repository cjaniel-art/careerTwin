# PRD — 00 Site Público, Home/LP e Autenticação

Criado em: 28 de julho de 2026 17:54

## 1. Resumo

| Item | Definição |
| --- | --- |
| Nome | Site Público, Home/LP e Autenticação |
| Identificador | PRD 00 |
| Usuários | Visitante e profissional autenticado |
| Objetivo | Apresentar o CareerTwin, converter visitantes em contas e controlar o acesso seguro à aplicação |
| Entrada | Acesso ao site, e-mail, senha e consentimentos obrigatórios |
| Saída | Conta criada ou sessão autenticada |
| Dependências | Identidade visual, Design System, serviço de autenticação, páginas legais, banco de dados e analytics |
| Desbloqueia | Onboarding e acesso posterior às funcionalidades liberadas |
| Plataforma | Aplicação web responsiva |
| Idioma | Português do Brasil |
| Design System | shadcn/ui com tokens CareerTwin |

---

## 2. Problema

Antes de utilizar o CareerTwin, o visitante precisa compreender:

- qual problema o produto resolve;
- para quem o produto foi criado;
- o que receberá ao utilizar a plataforma;
- como a experiência funciona;
- quais são os dois módulos core;
- como o produto preserva a autenticidade da trajetória profissional;
- quais são as limitações dos diagnósticos e scores;
- qual é o próximo passo para começar.

Além disso, o produto precisa permitir que o visitante crie uma conta, faça login e recupere seu acesso com segurança.

Sem uma experiência pública clara e um fluxo de autenticação confiável, o usuário pode abandonar a jornada antes do onboarding ou acessar uma rota incompatível com o estado da sua conta.

---

## 3. Objetivo

Permitir que o visitante:

- conheça a proposta de valor do CareerTwin;
- compreenda o funcionamento geral do produto;
- entenda a diferença entre Core 1 e Core 2;
- reconheça os princípios de autenticidade e explicabilidade;
- conheça as limitações do produto;
- inicie o cadastro;
- faça login;
- recupere a senha;
- acesse páginas legais.

Permitir que o usuário autenticado:

- encerre a sessão;
- acesse somente seus próprios dados e análises;
- seja direcionado para a etapa correta da jornada;
- solicite exclusão da conta;
- retorne ao onboarding ou dashboard conforme o estado da conta.

---

## 4. Usuários e estados de acesso

### Visitante

Pessoa não autenticada que acessa o site público.

Pode:

- navegar pela Home/LP;
- acessar Termos de Uso e Política de Privacidade;
- iniciar cadastro;
- fazer login;
- solicitar recuperação de senha.

Não pode:

- acessar onboarding;
- acessar dashboard;
- iniciar análises;
- consultar resultados;
- consultar histórico;
- acessar dados de usuários.

### Usuário autenticado com onboarding pendente

Pode:

- acessar ou retomar o onboarding;
- encerrar a sessão;
- acessar a gestão básica da conta;
- solicitar exclusão da conta.

Não pode utilizar Core 1 ou Core 2 até cumprir as respectivas pré-condições.

### Usuário autenticado com onboarding concluído

Pode:

- acessar o dashboard;
- acessar as funcionalidades liberadas;
- utilizar Core 1 e Core 2 conforme as pré-condições de cada PRD;
- atualizar seus dados;
- consultar histórico;
- encerrar a sessão;
- solicitar exclusão da conta.

O Core 1 é recomendado antes do Core 2, mas não deve ser implementado como dependência técnica obrigatória do Core 2.

---

## 5. Pré-condições

Para o site público:

- aplicação disponível;
- conteúdo institucional aprovado;
- identidade visual disponível;
- logos oficiais fornecidos;
- Style Guide CareerTwin disponível;
- páginas legais publicadas ou com conteúdo provisório claramente identificado.

Para autenticação:

- serviço de autenticação configurado;
- banco de dados e políticas de acesso configurados;
- origens autorizadas para redirecionamentos;
- política de senha definida;
- política de sessão definida;
- tratamento de sessão implementado;
- consentimentos obrigatórios registrados;
- ambientes de desenvolvimento, homologação e produção separados.

Decisões técnicas pendentes não devem ser preenchidas silenciosamente pelo Claude Code.

---

## 6. Páginas e rotas

Rotas funcionais previstas:

| Rota | Página | Acesso |
| --- | --- | --- |
| `/` | Home/Landing Page | Público |
| `/cadastro` | Cadastro | Público |
| `/login` | Login | Público |
| `/recuperar-senha` | Recuperação de senha | Público |
| `/redefinir-senha` | Redefinição de senha | Link válido |
| `/privacidade` | Política de Privacidade | Público |
| `/termos` | Termos de Uso | Público |
| `/onboarding` | Onboarding | Autenticado |
| `/dashboard` | Dashboard | Autenticado |

As rotas acima são as referências funcionais deste PRD.

Alterações de caminho poderão ser realizadas pela Arquitetura, desde que:

- o comportamento seja preservado;
- os redirecionamentos sejam atualizados;
- os eventos de analytics sejam mantidos;
- os PRDs e o Sitemap sejam sincronizados;
- a mudança não altere o escopo da funcionalidade.

---

## 7. Fluxo principal — Home/LP

1. O visitante acessa a Home.
2. O sistema registra a visualização permitida.
3. O visitante conhece a proposta de valor.
4. O visitante entende como o CareerTwin funciona.
5. O visitante conhece o Core 1.
6. O visitante conhece o Core 2.
7. O visitante lê os princípios de autenticidade e as limitações.
8. O visitante seleciona uma chamada para ação.
9. O sistema direciona para cadastro ou login.
10. Após a autenticação, o usuário é direcionado para o onboarding ou dashboard, conforme seu estado.

---

## 8. Fluxo principal — Cadastro

1. O visitante acessa a página de cadastro.
2. Informa o e-mail.
3. Cria uma senha.
4. Confirma os termos obrigatórios.
5. O sistema valida os campos.
6. O sistema verifica se a conta já existe.
7. O sistema cria a conta.
8. O sistema registra os consentimentos aplicáveis.
9. A sessão é iniciada, quando permitido pela configuração.
10. O usuário é direcionado para o onboarding.

Caso a configuração exija verificação de e-mail, o sistema deverá apresentar o estado de confirmação pendente antes de liberar o acesso autenticado.

Mensagens relacionadas à existência da conta devem preservar a segurança e não expor informações de terceiros.

---

## 9. Fluxo principal — Login

1. O visitante acessa a página de login.
2. Informa e-mail e senha.
3. O sistema valida as credenciais.
4. A sessão é criada.
5. O sistema verifica o estado da conta.
6. O usuário com onboarding pendente é direcionado para o onboarding.
7. O usuário com onboarding concluído é direcionado para o dashboard.
8. Quando houver uma rota protegida de origem válida, o sistema poderá retornar o usuário para essa rota.

O destino de retorno:

- deve pertencer à aplicação;
- deve estar autorizado;
- deve ser compatível com as permissões do usuário;
- não pode permitir redirecionamentos externos arbitrários.

---

## 10. Fluxo principal — Recuperação de senha

1. O visitante acessa a recuperação de senha.
2. Informa o e-mail.
3. O sistema valida o formato.
4. O sistema solicita o envio das instruções.
5. A interface apresenta uma mensagem neutra.
6. O usuário acessa um link válido.
7. Informa e confirma a nova senha.
8. O sistema atualiza a credencial.
9. O usuário é direcionado para o login ou tem a sessão iniciada, conforme a configuração adotada.

A mensagem não deve revelar se um e-mail está cadastrado.

O link deverá:

- possuir validade limitada;
- ser de uso único;
- ser invalidado após utilização;
- ser rejeitado quando estiver expirado ou incorreto.

---

## 11. Estrutura da Home/LP

A Home será a porta de entrada do CareerTwin.

Ela deverá apresentar, no mínimo:

### Header

- logo oficial;
- navegação para seções da página;
- chamada para login;
- chamada para cadastro;
- comportamento responsivo.

### Hero

- proposta de valor principal;
- explicação curta do produto;
- CTA primário para cadastro;
- CTA secundário para conhecer o funcionamento;
- elemento visual coerente com a identidade CareerTwin.

### Problema

Apresentar de forma clara problemas como:

- experiências mal comunicadas;
- currículo e LinkedIn pouco claros;
- dificuldade para identificar lacunas;
- falta de priorização;
- incerteza sobre aderência a cargos e vagas.

### Como funciona

Apresentar a jornada resumida:

1. criar a conta;
2. enviar currículo e LinkedIn;
3. revisar e confirmar o Thin Twin;
4. definir o contexto-alvo;
5. receber a Análise de Perfil;
6. avaliar aderência a cargo ou vaga;
7. acompanhar recomendações e ações.

A comunicação poderá condensar essa jornada em menos passos, desde que não altere o funcionamento do produto nem prometa funcionalidades fora do escopo.

### Core 1 — Análise de Perfil

Deverá explicar que o Core 1 ajuda o usuário a:

- compreender como seu perfil está sendo apresentado;
- identificar forças e fragilidades;
- melhorar a comunicação de experiências;
- identificar necessidades de evidência;
- priorizar recomendações;
- organizar ações.

### Core 2 — Diagnóstico de Aderência

Deverá explicar que o Core 2 ajuda o usuário a:

- comparar seu perfil com um cargo ou vaga;
- identificar requisitos atendidos;
- diferenciar tipos de lacuna;
- compreender riscos e bloqueadores;
- apoiar a decisão de candidatura.

### O que o usuário recebe

Apresentar benefícios como:

- diagnósticos explicáveis;
- recomendações priorizadas;
- tradução de experiências reais;
- identificação de lacunas;
- plano de ações;
- histórico e reanálises, quando disponíveis.

### Autenticidade e confiança

Apresentar que o CareerTwin:

- utiliza informações fornecidas ou confirmadas;
- não inventa experiências;
- não cria resultados falsos;
- diferencia fatos de inferências;
- apresenta evidências;
- apresenta confiança separadamente dos scores;
- não substitui recrutadores.

### Limitações

Apresentar que o CareerTwin:

- não garante entrevista;
- não garante contratação;
- não representa a decisão de recrutadores;
- não apresenta IPP ou IAO como probabilidade de aprovação;
- não realiza candidatura automática;
- não funciona como job board;
- não funciona como ATS;
- encerra sua jornada antes da candidatura.

### CTA final

- chamada para criar uma conta;
- alternativa para fazer login;
- mensagem coerente com a proposta de valor.

### Footer

- logo oficial;
- resumo institucional;
- links de navegação;
- Termos de Uso;
- Política de Privacidade;
- acesso ao login;
- informação de direitos autorais, quando definida.

---

## 12. Requisitos funcionais — Site público

### RF-SITE-001

O sistema deve disponibilizar uma Home pública e responsiva.

### RF-SITE-002

A Home deve apresentar o problema resolvido pelo CareerTwin.

### RF-SITE-003

A Home deve apresentar a proposta de valor.

### RF-SITE-004

A Home deve explicar o funcionamento geral da experiência.

### RF-SITE-005

A Home deve apresentar o Core 1 — Análise de Perfil.

### RF-SITE-006

A Home deve apresentar o Core 2 — Diagnóstico de Aderência.

### RF-SITE-007

A Home deve apresentar os princípios de autenticidade.

### RF-SITE-008

A Home deve apresentar as limitações do produto e dos scores.

### RF-SITE-009

A Home deve possuir CTA para cadastro.

### RF-SITE-010

A Home deve possuir CTA para login.

### RF-SITE-011

O CTA secundário “Ver como funciona” deve direcionar para a seção correspondente da página ou para conteúdo equivalente.

### RF-SITE-012

O header deve permanecer utilizável em desktop, tablet e mobile.

### RF-SITE-013

O footer deve disponibilizar acesso aos Termos de Uso e à Política de Privacidade.

### RF-SITE-014

O conteúdo público deve ser apresentado em português do Brasil.

### RF-SITE-015

O sistema deve adaptar as chamadas para usuários autenticados.

### RF-SITE-016

Usuários autenticados com onboarding pendente devem receber chamada para continuar o onboarding.

### RF-SITE-017

Usuários autenticados com onboarding concluído devem receber chamada para acessar o dashboard.

### RF-SITE-018

O site deve utilizar os arquivos oficiais de logo fornecidos pelo projeto.

### RF-SITE-019

O logo deve ser aplicado sem distorção, reconstrução, recoloração ou alteração de proporção.

### RF-SITE-020

A interface deve utilizar shadcn/ui como base do Design System e seguir o Style Guide CareerTwin.

---

## 13. Requisitos funcionais — Cadastro

### RF-AUTH-001

O sistema deve permitir criação de conta com e-mail e senha.

### RF-AUTH-002

O sistema deve validar o formato do e-mail.

### RF-AUTH-003

O sistema deve validar a senha conforme a política configurada.

### RF-AUTH-004

O campo de senha deve permitir alternar entre conteúdo visível e oculto.

### RF-AUTH-005

O sistema deve solicitar a confirmação dos Termos de Uso e da Política de Privacidade.

### RF-AUTH-006

Consentimentos opcionais, quando aplicáveis, não devem ser condição para criar a conta ou utilizar o serviço principal.

A finalidade, os dados utilizados e a possibilidade de revogação devem ser apresentados claramente.

### RF-AUTH-007

O sistema deve impedir a criação duplicada de conta com o mesmo identificador, respeitando a segurança da mensagem exibida.

### RF-AUTH-008

Após o cadastro concluído, o sistema deve direcionar o usuário para o onboarding.

### RF-AUTH-009

Caso a verificação de e-mail esteja habilitada, o sistema deve apresentar instruções e estado de confirmação pendente.

### RF-AUTH-010

O sistema deve registrar o início e a conclusão do cadastro utilizando os eventos definidos no catálogo de Analytics.

---

## 14. Requisitos funcionais — Login e sessão

### RF-AUTH-011

O sistema deve permitir login com e-mail e senha.

### RF-AUTH-012

O sistema deve apresentar erro neutro para credenciais inválidas.

### RF-AUTH-013

O sistema deve criar uma sessão após autenticação válida.

### RF-AUTH-014

O sistema deve manter a sessão conforme a política de segurança configurada.

### RF-AUTH-015

O sistema deve permitir o encerramento da sessão.

### RF-AUTH-016

Após o logout, o usuário não deve manter acesso a rotas ou dados protegidos.

### RF-AUTH-017

O sistema deve bloquear rotas protegidas para visitantes.

### RF-AUTH-018

Ao tentar acessar uma rota protegida, o visitante deve ser direcionado para o login.

### RF-AUTH-019

Após o login, o sistema deve direcionar o usuário para a etapa adequada da jornada.

### RF-AUTH-020

O sistema deve impedir redirecionamentos para destinos externos não autorizados.

### RF-AUTH-021

O usuário deve acessar somente seus próprios dados e análises.

### RF-AUTH-022

Políticas de acesso devem ser aplicadas no backend e no banco de dados, e não apenas na interface.

Permissões não devem depender exclusivamente de:

- estado do frontend;
- parâmetros enviados pelo cliente;
- identificadores presentes na URL.

---

## 15. Requisitos funcionais — Recuperação de senha

### RF-AUTH-023

O sistema deve permitir solicitar recuperação de senha por e-mail.

### RF-AUTH-024

A resposta da solicitação não deve confirmar se o e-mail está cadastrado.

### RF-AUTH-025

O link de recuperação deve possuir validade limitada.

### RF-AUTH-026

O sistema deve rejeitar links inválidos, expirados ou já utilizados.

### RF-AUTH-027

O usuário deve informar e confirmar a nova senha.

### RF-AUTH-028

Após a redefinição bem-sucedida, o sistema deve apresentar confirmação e próximo passo claro.

---

## 16. Requisitos funcionais — Conta e exclusão

### RF-AUTH-029

O usuário autenticado deve poder solicitar exclusão da conta.

### RF-AUTH-030

A solicitação de exclusão deve exigir confirmação explícita.

### RF-AUTH-031

O sistema deve informar que a solicitação abrange, conforme a política aplicável:

- dados pessoais;
- dados de autenticação;
- Thin Twin e suas versões;
- contextos-alvo e suas versões;
- oportunidades vinculadas ao usuário;
- análises;
- recomendações;
- ações;
- histórico;
- feedbacks;
- documentos armazenados;
- identificadores pessoais.

A interface também deverá informar quando algum registro precisar ser mantido temporariamente por obrigação legal, segurança, prevenção de fraude, auditoria ou integridade operacional.

### RF-AUTH-032

A meta operacional de exclusão dos sistemas ativos deve ser de até 15 dias.

### RF-AUTH-033

A meta operacional de remoção ou expiração nos backups deve ser de até 30 dias, conforme a política técnica de backup.

### RF-AUTH-034

Após a confirmação da solicitação, o sistema deve:

- registrar o pedido;
- impedir novas operações incompatíveis;
- informar o status ao usuário;
- executar o processo de forma idempotente;
- preservar a trilha de auditoria necessária;
- registrar a conclusão ou falha.

---

## 17. Requisitos não funcionais

### RNF-SITE-001 — Responsividade

As páginas devem funcionar em desktop, tablet e mobile.

### RNF-SITE-002 — Acessibilidade

A interface deve utilizar:

- HTML semântico;
- navegação por teclado;
- foco visível;
- labels associados aos campos;
- mensagens acessíveis;
- contraste adequado.

### RNF-SITE-003 — Performance

A Home deve priorizar:

- carregamento rápido;
- otimização de imagens;
- otimização de fontes;
- carregamento apenas dos recursos necessários;
- ausência de scripts desnecessários.

### RNF-SITE-004 — SEO

A Home e as páginas públicas devem possuir:

- título;
- descrição;
- metadados básicos;
- URL canônica;
- estrutura indexável;
- configuração de indexação apropriada.

Páginas de login, cadastro, recuperação, redefinição e áreas autenticadas não devem ser indexadas quando isso for incompatível com a estratégia de SEO e segurança.

### RNF-SITE-005 — Segurança

Credenciais, tokens e segredos nunca devem ser registrados em:

- logs;
- analytics;
- mensagens de erro;
- ferramentas de monitoramento;
- código-fonte;
- repositório.

### RNF-SITE-006 — Privacidade

Dados pessoais não devem ser enviados para analytics além do estritamente necessário e permitido.

Identificadores pseudônimos devem ser utilizados quando suficientes.

### RNF-SITE-007 — Compatibilidade

A aplicação deve funcionar nas versões modernas dos navegadores oficialmente suportados pelo projeto.

A lista definitiva permanece pendente de decisão.

### RNF-SITE-008 — Design System

Os componentes de interface devem utilizar:

- shadcn/ui como base;
- Tailwind CSS para estilização;
- tokens definidos no Style Guide CareerTwin;
- Lucide React para iconografia;
- arquivos oficiais da marca.

---

## 18. Regras de negócio

### RN-SITE-001

O site não deve ser tratado como um terceiro módulo core.

### RN-SITE-002

A comunicação deve apresentar apenas funcionalidades existentes ou previstas no escopo aprovado do MVP.

### RN-SITE-003

A comunicação não pode prometer:

- contratação;
- entrevista;
- aprovação;
- sucesso profissional garantido.

### RN-SITE-004

A comunicação não pode apresentar IPP ou IAO como:

- probabilidade de contratação;
- probabilidade de entrevista;
- decisão de recrutadores;
- medida absoluta do valor profissional.

### RN-SITE-005

O site deve utilizar linguagem clara, acolhedora e não julgadora.

### RN-SITE-006

O site não deve afirmar que hipóteses ainda não validadas são resultados comprovados.

### RN-SITE-007

Depoimentos, números, empresas atendidas, resultados ou métricas não podem ser inventados.

### RN-SITE-008

O produto deve ser apresentado como mentor de carreira com inteligência artificial.

### RN-SITE-009

O escopo comunicado deve terminar na preparação e decisão de candidatura.

### RN-AUTH-001

Somente usuários autenticados podem acessar funcionalidades core.

### RN-AUTH-002

O usuário pode acessar somente os próprios dados e análises.

### RN-AUTH-003

O tratamento necessário à prestação do serviço deve possuir base adequada e registro.

### RN-AUTH-004

Consentimentos opcionais não podem bloquear o uso do produto principal.

### RN-AUTH-005

A autenticação não deve coletar dados profissionais.

### RN-AUTH-006

Dados pessoais coletados posteriormente no onboarding não devem influenciar:

- IPP;
- IAO;
- confiança;
- senioridade;
- recomendações;
- prioridade de candidatura.

### RN-AUTH-007

Mensagens de autenticação não devem expor a existência de contas de terceiros.

### RN-AUTH-008

Falhas de autenticação não devem consumir créditos.

---

## 19. Estados da interface

### Site público

- carregando;
- conteúdo disponível;
- navegação mobile aberta;
- visitante não autenticado;
- usuário autenticado com onboarding pendente;
- usuário autenticado com onboarding concluído;
- falha de carregamento parcial;
- indisponibilidade temporária.

### Cadastro

- formulário inicial;
- preenchimento inválido;
- envio em andamento;
- ação alternativa para conta existente;
- cadastro concluído;
- confirmação de e-mail pendente;
- falha temporária.

### Login

- formulário inicial;
- credenciais inválidas;
- envio em andamento;
- sessão criada;
- conta indisponível;
- falha temporária.

### Recuperação de senha

- solicitação inicial;
- solicitação em andamento;
- instruções enviadas;
- link válido;
- link inválido;
- link expirado;
- senha redefinida;
- falha temporária.

### Sessão

- sessão válida;
- sessão expirada;
- logout em andamento;
- logout concluído;
- acesso não autorizado.

### Exclusão

- solicitação inicial;
- confirmação pendente;
- solicitação registrada;
- processamento em andamento;
- exclusão concluída;
- falha de processamento.

Os estados funcionais devem ser implementados com valores consistentes entre interface, backend e banco de dados.

---

## 20. Mensagens essenciais

### Hero — copy provisória

> Melhore seu posicionamento profissional e entenda sua aderência às oportunidades antes de se candidatar.
> 

### Subtítulo — copy provisória

> O CareerTwin analisa seu currículo, LinkedIn e oportunidades de interesse para gerar diagnósticos explicáveis, recomendações priorizadas e ações práticas.
> 

### Autenticidade

> O CareerTwin não inventa experiências e não promete contratação. A proposta é ajudar você a comunicar melhor sua trajetória real e tomar decisões mais estratégicas.
> 

### Cadastro concluído

> Sua conta foi criada. Agora vamos organizar as informações necessárias para sua primeira análise.
> 

### Login inválido

> Não foi possível entrar com os dados informados. Revise as informações ou recupere sua senha.
> 

### Recuperação de senha

> Se houver uma conta associada a este e-mail, você receberá as instruções para redefinir sua senha.
> 

### Sessão expirada

> Sua sessão expirou. Entre novamente para continuar com segurança.
> 

### Acesso protegido

> Entre na sua conta para acessar esta área.
> 

### Exclusão de conta

> Sua solicitação de exclusão foi registrada. Informaremos o andamento conforme os prazos aplicáveis.
> 

As copies desta seção são provisórias e devem ser aprovadas pelo Product Owner antes da publicação.

---

## 21. Analytics

Eventos canônicos deste fluxo:

- `landing_viewed`;
- `landing_primary_cta_clicked`;
- `landing_secondary_cta_clicked`;
- `signup_started`;
- `signup_completed`;
- `login_started`;
- `login_completed`;
- `login_failed`.

Eventos adicionais relacionados a:

- recuperação de senha;
- redefinição de senha;
- logout;
- bloqueio de rota;
- visualização de páginas legais;
- solicitação de exclusão;

somente deverão ser implementados depois que seus nomes, triggers e propriedades forem registrados no catálogo canônico de Analytics.

`account_deletion_requested` poderá ser utilizado no analytics de produto somente quando sua utilização mínima estiver de acordo com a Política de Privacidade.

O registro operacional da exclusão deve permanecer no banco e na trilha de auditoria.

### Propriedades permitidas

- origem do acesso;
- campanha, quando disponível;
- página;
- tipo de CTA;
- destino do CTA;
- status da autenticação;
- etapa da jornada;
- dispositivo;
- categoria segura do erro;
- versão do fluxo.

### Dados proibidos

Nunca enviar para analytics:

- senha;
- token de sessão;
- token de recuperação;
- e-mail em texto aberto;
- nome completo;
- cidade;
- estado;
- endereço;
- data de nascimento;
- currículo;
- LinkedIn;
- descrição de vaga;
- conteúdo profissional;
- comentários livres;
- URLs assinadas;
- credenciais;
- segredos.

Analytics registra comportamento de produto.

Logs técnicos, auditoria, falhas de segurança e observabilidade não devem depender exclusivamente desses eventos.

---

## 22. Critérios de aceite

O PRD será considerado atendido quando:

1. a Home pública estiver disponível em desktop, tablet e mobile;
2. o visitante compreender o problema e a proposta de valor;
3. o Core 1 e o Core 2 forem apresentados sem criar um terceiro módulo core;
4. os princípios de autenticidade forem apresentados;
5. as limitações e disclaimers forem apresentados;
6. existirem CTAs funcionais para cadastro e login;
7. usuários autenticados receberem CTA compatível com seu estado;
8. o site utilizar os logos oficiais sem distorção;
9. a interface seguir o Design System baseado em shadcn/ui;
10. o visitante conseguir criar conta com e-mail e senha;
11. os consentimentos obrigatórios forem registrados;
12. consentimentos opcionais não bloquearem o cadastro;
13. o usuário conseguir fazer login;
14. credenciais inválidas receberem mensagem segura;
15. o usuário conseguir solicitar recuperação de senha;
16. a recuperação não revelar se a conta existe;
17. o usuário conseguir redefinir a senha com link válido;
18. rotas protegidas bloquearem visitantes;
19. o usuário autenticado acessar somente os próprios dados;
20. o redirecionamento pós-login considerar o estado do onboarding;
21. o usuário conseguir encerrar a sessão;
22. o usuário conseguir solicitar exclusão da conta;
23. Termos de Uso e Política de Privacidade estiverem acessíveis;
24. credenciais e tokens não forem enviados para analytics;
25. eventos essenciais forem registrados com os nomes canônicos;
26. a experiência atender aos requisitos mínimos de acessibilidade;
27. o conteúdo não prometer contratação ou inventar resultados;
28. falhas de autenticação não consumirem créditos;
29. permissões forem validadas no backend e no banco;
30. o Claude Code não redefinir decisões pendentes silenciosamente.

---

## 23. Fora do escopo deste PRD

Não fazem parte deste PRD:

- onboarding e extração de documentos;
- criação e revisão do Thin Twin;
- definição detalhada do contexto-alvo;
- Core 1;
- Core 2;
- dashboard detalhado;
- histórico detalhado;
- gestão detalhada de ações;
- créditos e ofertas;
- pagamento real;
- assinatura recorrente;
- login social;
- autenticação por biometria;
- aplicativo mobile nativo;
- candidatura automática;
- job board;
- ATS;
- editor de currículo;
- edição direta do LinkedIn.

Dashboard, histórico, ações, créditos e conta são superfícies de apoio e não constituem módulos core adicionais.

---

## 24. Dependências de implementação

- CareerTwin — Product One Page;
- CareerTwin — Fonte Canônica de Contexto vigente;
- PRD 01 — Onboarding e Perfil;
- PRD 02 — Core 1: Análise de Perfil;
- PRD 03 — Core 2: Diagnóstico de Aderência;
- CareerTwin — Style Guide para Claude Code;
- Design System baseado em shadcn/ui;
- Arquitetura;
- Modelo de Dados;
- Privacidade e Segurança;
- Analytics;
- Incidentes;
- Decision Log;
- ativos oficiais de logo horizontal, vertical e símbolo;
- Termos de Uso;
- Política de Privacidade;
- serviço de autenticação;
- banco de dados e políticas de acesso;
- plataforma de analytics;
- monitoramento técnico.

A implementação deve considerar as versões vigentes desses documentos.

Em caso de divergência, deve ser aplicada a regra de precedência definida na Product One Page.

---

## 25. Decisões pendentes

Os pontos abaixo ainda precisam de decisão ou aprovação antes da implementação definitiva:

1. aprovação do Supabase Auth ou de outro provedor no Decision Log;
2. obrigatoriedade de confirmação de e-mail;
3. política exata de senha;
4. duração, renovação e revogação da sessão;
5. conteúdo jurídico final dos Termos de Uso;
6. conteúdo jurídico final da Política de Privacidade;
7. ferramenta definitiva de analytics;
8. política de cookies e consentimento correspondente;
9. domínio oficial;
10. metadados finais de SEO;
11. copy final da Home;
12. imagens finais da Home;
13. detalhamento operacional da exclusão da conta;
14. navegadores oficialmente suportados.

Enquanto essas decisões estiverem pendentes:

- o Claude Code não deverá escolher uma solução definitiva silenciosamente;
- valores provisórios deverão permanecer configuráveis;
- decisões materiais deverão ser registradas no Decision Log;
- conteúdos provisórios não deverão ser publicados como finais.