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