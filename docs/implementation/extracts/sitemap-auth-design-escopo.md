# Extração estruturada — Sitemap, PRD 00, Estilo Visual, Escopo do MVP e Jornada do Usuário

> Documento de extração (sem interpretação criativa, sem código). Termos de domínio mantidos em português. Rotas, hex codes, nomes de campo e copy são reproduzidos literalmente entre aspas/blocos de código quando aplicável.

---

## Fontes

| # | Documento | Caminho | Propósito | Versão / Data |
| --- | --- | --- | --- | --- |
| 1 | Sitemap — CareerTwin MVP | `Insumos para Desenvolvimento/Sitemap — CareerTwin MVP 3ab7f20949da80968e8cf5d14bc4d553.md` | Mapa funcional de navegação do MVP (páginas, rotas, agrupamentos, regras de acesso e redirecionamento). Não substitui PRDs, Arquitetura, Modelo de Dados, regras de negócio, contratos de processamento nem critérios de aceite. | Criado em 28/07/2026 · Última atualização 28/07/2026 · **Versão 1.1** · Status: "Mapa funcional de navegação do MVP" |
| 2 | PRD — 00 Site Público, Home/LP e Autenticação | `Insumos para Desenvolvimento/PRD — 00 Site Público, Home LP e Autenticação 3ab7f20949da80e7b436c58db23c47d5.md` | Requisitos funcionais e não funcionais do site público (Home/LP, Termos, Privacidade) e da autenticação (cadastro, login, recuperação/redefinição de senha, sessão, exclusão de conta). | Criado em 28/07/2026 17:54 (sem número de versão explícito) |
| 3 | Leitura do estilo visual | `Insumos para Desenvolvimento/Leitura do estilo visual 3ab7f20949da80eab65eff25bfed4f00.md` | Identidade visual da marca CareerTwin: paleta, tipografia, composição, uso de logo, iconografia, fotografia, Design System (shadcn/ui), grid/responsividade, tom verbal e diretrizes para o Claude Code. | Criado em 28/07/2026 17:15 (sem número de versão explícito) |
| 4 | Escopo do MVP | `Produto - Experiência, funcionalidades e evolução do MVP/Escopo do MVP 3ab7f20949da80718a43c623a4c38b4d.md` | Define objetivo do MVP, plataforma/público, funcionalidades core (Core 1 e Core 2), funcionalidades incluídas, fora de escopo, experiência gratuita, oferta simulada e critérios de sucesso/qualidade. | Criado em 27/07/2026 23:13 (sem número de versão explícito) |
| 5 | Jornada do Usuário | `Produto - Experiência, funcionalidades e evolução do MVP/Jornada do Usuário 3ab7f20949da80c8b747fbdc73a515de.md` | Jornada passo a passo do usuário, do descobrimento até reanálise/feedback, com objetivos, ações, respostas do sistema e exceções por etapa. | Criado em 27/07/2026 23:14 (sem número de versão explícito) |

Nota: os nomes de arquivo contêm caracteres acentuados e um sufixo hexadecimal (ID do Notion); foram confirmados via `ls` antes da leitura.

---

## Sitemap completo

O produto possui **exatamente dois módulos core**: Core 1 — Análise de Perfil e Core 2 — Diagnóstico de Aderência. Dashboard, perfil, histórico, ações, créditos, ofertas simuladas e conta são **superfícies de apoio**.

Jornada recomendada (não obrigatória tecnicamente):
```
Site → Cadastro ou login → Onboarding → Confirmação do Thin Twin → Definição do contexto-alvo → Core 1 → Core 2 → Ações e reanálises
```
"O Core 1 é recomendado antes do Core 2, mas não constitui uma dependência técnica obrigatória para o Core 2."

### 1. Site público

| Rota | Página | Conteúdo/seções |
| --- | --- | --- |
| `/` | Home / Landing Page | Header, Hero, Problema, Como funciona, Core 1 — Análise de Perfil, Core 2 — Diagnóstico de Aderência, O que o usuário recebe, Autenticidade e confiança, Limitações do produto, CTA final, Footer |
| `/termos` | Termos de Uso | condições de utilização; responsabilidades do usuário; limitações do CareerTwin; propriedade intelectual; regras da conta; condições relacionadas ao uso de IA; suspensão e exclusão; informações jurídicas. Conteúdo jurídico final pendente de aprovação. |
| `/privacidade` | Política de Privacidade | dados coletados; finalidades; bases de tratamento; serviços utilizados; retenção; exclusão; segurança; direitos do titular; contato de privacidade. Deve refletir a política vigente de Segurança, Privacidade e Retenção. |

Navegação do header público: Como funciona; Análise de Perfil; Diagnóstico de Aderência; Entrar; Criar conta (as três primeiras podem apontar para seções da própria LP).

CTAs por estado do visitante/usuário:
- Visitante: Criar minha conta; Entrar; Ver como funciona.
- Autenticado com onboarding pendente: Continuar onboarding.
- Autenticado com onboarding concluído: Acessar dashboard.

"O site não deverá apresentar dashboard, histórico, ações ou créditos como módulos core adicionais."

### 2. Autenticação

| Rota | Página | Campos/conteúdo |
| --- | --- | --- |
| `/cadastro` | Criar conta | e-mail; senha; confirmação dos Termos de Uso; confirmação da Política de Privacidade; consentimentos opcionais separados (quando aplicáveis); ação para criar conta; link para login |
| `/login` | Login | e-mail; senha; mostrar/ocultar senha; entrar; recuperar senha; link para cadastro |
| `/recuperar-senha` | Recuperar senha | e-mail; enviar instruções; confirmação neutra; voltar para login |
| `/redefinir-senha` | Redefinir senha | nova senha; confirmação da senha; validação do link; mensagem de link inválido; mensagem de link expirado; confirmação da redefinição; ação para retornar ao login |

Fluxo pós-cadastro:
```
Cadastro concluído → Verificação de e-mail, quando habilitada → /onboarding
```
"A obrigatoriedade de verificação de e-mail permanece sujeita à decisão registrada no Decision Log."

Redirecionamento pós-login:
```
Login
├── Onboarding não concluído → /onboarding
└── Onboarding concluído → /app/dashboard
```
Retorno a rota protegida de origem só é permitido se: a rota pertence à aplicação; o usuário possui autorização; as pré-condições da funcionalidade estão atendidas; não há redirecionamento externo arbitrário.

"A resposta [de recuperação de senha] não deverá revelar se o e-mail possui conta cadastrada."

### 3. Onboarding

Rota principal: `/onboarding` — implementado como uma única rota com etapas internas, controladas por **estado persistido** (não apenas parâmetros de URL), para: controlar sequência; impedir avanço indevido por alteração de URL; permitir retomada; preservar checkpoints; evitar rotas diferentes para estados transitórios.

Estrutura interna (9 etapas):
1. Boas-vindas — explicação da jornada; materiais necessários; uso das informações; princípios de autenticidade; possibilidade de sair e continuar depois; expectativa de processamento sem promessa de tempo exato; CTA para começar.
2. Identificação — nome completo obrigatório; cidade opcional; estado opcional. **Não coletados no MVP**: data de nascimento, CEP, logradouro, número, complemento, bairro, endereço residencial completo. Nome/cidade/estado permanecem separados do Thin Twin e não influenciam IPP, IAO, confiança ou recomendações.
3. Envio do currículo — upload PDF; upload DOCX; texto colado; formatos e limites; progresso; validação; substituição; tratamento de erro; nova tentativa. **Obrigatório para concluir o onboarding.**
4. Envio do LinkedIn — PDF exportado; texto colado; URL opcional como referência; instruções de exportação; validação; substituição; tratamento de erro. A URL não será acessada automaticamente, não é fonte única, não substitui o conteúdo obrigatório do LinkedIn.
5. Processamento — validação; extração; OCR quando necessário; normalização; identificação de conflitos; criação do rascunho do Thin Twin; processamento prolongado; extração parcial; falha recuperável; nova tentativa. "O processamento deverá continuar mesmo quando o usuário sair da página."
6. Revisão do Thin Twin — Resumo, Conflitos e itens de atenção, Experiências, Projetos, Competências, Ferramentas, Formação, Certificações, Evidências. Usuário pode confirmar/editar/adicionar/remover/resolver divergências/consultar fonte/consultar confiança da extração. Competências e ferramentas permanecem separadas. Contexto-alvo não integra o Thin Twin.
7. Confirmação do Thin Twin — resumo; conflitos críticos pendentes; nível de completude; indicação das fontes; confirmação explícita; criação de versão imutável do Thin Twin. "Conflitos críticos devem bloquear a confirmação." "A confirmação não poderá transformar inferências não confirmadas em fatos profissionais."
8. Contexto-alvo — área de interesse; cargo-alvo; especialidade (quando aplicável); senioridade desejada; até três sugestões de cargo; confirmação do contexto-alvo. É separado do Thin Twin, possui versionamento próprio, gera `target_context_version`, pode mudar sem criar nova versão do Thin Twin. Sugestões de cargo são apoio, não "carreira ideal ou definitiva".
9. Conclusão — confirmação da conclusão; resumo do Thin Twin; resumo do contexto-alvo; próximo passo; CTA para iniciar a Análise de Perfil. Destino recomendado: `/app/analise-perfil`.

### 4. Aplicação autenticada

Rota base `/app` redireciona para `/app/dashboard`.

Navegação principal: Início; Meu perfil; Análise de Perfil; Diagnóstico de Aderência; Ações; Histórico; Créditos; Conta.
Somente **Análise de Perfil** e **Diagnóstico de Aderência** são módulos core; as demais (Início, Meu perfil, Ações, Histórico, Créditos, Conta) são superfícies de apoio e "não deverão receber PRDs core adicionais nem ser apresentadas como novos módulos do produto".

**Dashboard** — `/app/dashboard`
Estrutura: Saudação e próxima ação; Estado do onboarding; Estado do Thin Twin; Contexto-alvo atual; Última Análise de Perfil; Último IPP concluído; Último Diagnóstico de Aderência; Vagas analisadas; Ações pendentes/em andamento/concluídas; Créditos disponíveis; Histórico recente; Atalhos.
Atalhos: Atualizar meu perfil; Alterar contexto-alvo; Fazer Análise de Perfil; Analisar cargo-alvo; Analisar uma vaga; Ver ações; Ver histórico; Fazer reanálise.
Regras: apoia Core 1 e Core 2; reflete estados persistidos pelo backend; não recalcula scores; não altera relatórios anteriores; não é fonte de verdade operacional; não é módulo core.

**Meu perfil** — `/app/perfil`, subáreas (rotas, abas ou estados internos): `/resumo`, `/experiencias`, `/projetos`, `/competencias`, `/ferramentas`, `/formacao`, `/certificacoes`, `/contexto-alvo`, `/documentos`, `/versoes`.
- Resumo: cargo atual observado; área atual observada; senioridade observável; contexto-alvo atual; completude; alertas; última atualização.
- Experiências: empresas; cargos; períodos; responsabilidades; projetos; resultados; evidências.
- Projetos: profissionais; acadêmicos; pessoais relevantes; competências relacionadas; ferramentas relacionadas.
- Competências: confirmadas; domínio; tipo; experiências relacionadas; evidências.
- Ferramentas: tecnologias; plataformas; frameworks; softwares; categoria; experiências relacionadas.
- Formação e certificações: cursos; instituições; períodos; situação; certificações.
- Contexto-alvo: área de interesse; cargo-alvo; especialidade; senioridade desejada; versão atual; histórico de versões (separado do Thin Twin).
- Documentos: currículo atual; LinkedIn atual; estado dos materiais; substituir material; data do último processamento. "Arquivos originais já excluídos não deverão ser disponibilizados novamente."
- Versões: Versões do Thin Twin (versão, data, origem da alteração, análises relacionadas, estado de confirmação) e Versões do contexto-alvo (versão, data, cargo, especialidade, senioridade desejada, análises relacionadas). "Alterações do contexto-alvo não devem criar uma nova versão do Thin Twin."

**Core 1 — Análise de Perfil** — `/app/analise-perfil`
Sitemap interno: Página inicial, Processamento, Resultado, Recomendações, Tradução da experiência, Plano de evolução, Comparação de reanálise.
- Entrada (`/app/analise-perfil`): objetivo da análise; versão do Thin Twin; versão do contexto-alvo; cargo-alvo; senioridade desejada; pré-condições; última análise; CTA iniciar; CTA revisar perfil; CTA alterar contexto-alvo. Bloqueia análise se faltar Thin Twin confirmado, contexto-alvo válido ou outra pré-condição do PRD 02.
- Processamento: `/app/analise-perfil/processando/[analysisId]` — estado funcional atual; mensagem de processamento; possibilidade de sair; preservação do progresso; link para análise anterior; tratamento de falha; falhas técnicas não consomem créditos.
- Resultado: `/app/analise-perfil/[analysisId]` — Resumo executivo, IPP, Confiança, Dimensões, Pontos fortes, Fragilidades, Recomendações, Tradução da experiência, Plano de evolução, Evidências, Feedback. IPP e confiança apresentados separadamente. "O resultado não poderá apresentar IPP como chance de contratação, alterar relatórios anteriores, recalcular scores no frontend."
- Comparação de reanálise: `/app/analise-perfil/comparar/[analysisId]` — IPP anterior/atual; diferença por dimensão; melhorias; lacunas resolvidas/novas; ações concluídas; confiança anterior/atual; versões de Thin Twin e contexto-alvo utilizadas. Só exibida quando os resultados forem "funcionalmente comparáveis".

**Core 2 — Diagnóstico de Aderência** — `/app/aderencia`
Sitemap interno: Escolher tipo de análise, Analisar cargo-alvo, Analisar vaga específica, Revisar vaga, Processamento, Resultado, Comparação de reanálise.
"O acesso ao Core 2 não depende tecnicamente da conclusão do Core 1." Depende das pré-condições do PRD 03.
- Escolha do tipo: `/app/aderencia` — opções Analisar cargo-alvo / Analisar vaga específica; explica diferença entre referência de cargo e descrição concreta de vaga.
- Análise de cargo-alvo: `/app/aderencia/cargo` — contexto-alvo atual; cargo-alvo; especialidade; senioridade desejada; referência de cargo utilizada; versão da referência; limitações da referência; CTA iniciar; CTA alterar contexto-alvo. Só referência de cargo com status **aprovado** gera diagnóstico definitivo; sem referência aprovada → estado de dados insuficientes, sem calcular IAO definitivo, sem criar referência silenciosamente.
- Nova análise de vaga: `/app/aderencia/vaga/nova` — título da vaga; empresa; URL opcional; texto colado; upload de PDF; validação; limites; saldo simulado; informação sobre consumo do crédito; CTA continuar. URL é apenas referência, não é acessada automaticamente, não substitui texto/PDF.
- Revisão da vaga: `/app/aderencia/vaga/[jobId]/revisao` — Resumo, Responsabilidades, Requisitos obrigatórios, Requisitos desejáveis, Diferenciais, Complementares, Impeditivos, Requisitos ambíguos, Senioridade, Localização e modalidade, Confirmação. Usuário pode corrigir requisitos, alterar criticidade incorreta, marcar requisito não aplicável, revisar ambiguidades, confirmar oportunidade. "Cidade e estado do cadastro pessoal não devem ser utilizados para calcular aderência geográfica." Localização/modalidade só usam dados fornecidos especificamente para a oportunidade.
- Processamento: `/app/aderencia/processando/[analysisId]` — comparação em andamento; análise de requisitos; cálculo determinístico do IAO; análise de riscos; validação da recomendação; tratamento de falha; possibilidade de sair; falhas técnicas não consomem créditos.
- Resultado: `/app/aderencia/[analysisId]` — Resumo executivo, IAO, Confiança, Recomendação, Requisitos, Pontos fortes, Lacunas, Senioridade, Riscos e bloqueadores, Plano de ações, Evidências, Intenção de candidatura, Feedback. Saída deve conter exatamente uma recomendação (de vaga OU de cargo-alvo). IAO e confiança separados. "O resultado não poderá apresentar o IAO como probabilidade de entrevista, aprovação ou contratação."
- Comparação: `/app/aderencia/comparar/[analysisId]` — só disponível quando mesma vaga+estrutura de requisitos compatível, ou mesma referência de cargo. Vagas diferentes / referências de cargo diferentes / resultados incompatíveis não devem ser comparados como evolução direta.

**Ações** — `/app/acoes`
Estrutura: Todas, Pendentes, Em andamento, Concluídas, Core 1, Core 2.
Cada ação: título; origem; tipo de análise; prioridade; horizonte ou prazo; critério de sucesso; status; análise relacionada.
Estados: pendente; em andamento; concluída.
Alterar status: não altera retroativamente IPP/IAO/recomendação; não consome crédito. "Uma nova avaliação exige reanálise."

**Histórico** — `/app/historico`
Estrutura: Todas as análises, Análises de Perfil, Análises de cargo, Análises de vaga, Reanálises, Versões do Thin Twin, Versões do contexto-alvo.
Cada análise mostra: tipo; título; data; score; confiança; versão do Thin Twin; versão do contexto-alvo (quando aplicável); versão da vaga ou referência; status; ação para ver resultado; ação para reanálise (quando elegível). "Abrir um relatório já gerado não deverá consumir crédito." "Análises anteriores não deverão ser sobrescritas."

**Créditos e oferta** — `/app/creditos`
Conteúdo MVP: saldo simulado; créditos utilizados; histórico de reservas/consumos/restaurações; análise gratuita utilizada; oferta simulada; confirmação da intenção de compra.
Oferta simulada:
```
Pacote Novas Oportunidades
R$ 29,90
5 créditos
Validade exibida de 30 dias
```
"Preço, quantidade de créditos e validade são hipóteses de monetização." **Não haverá**: checkout; cartão; cobrança; assinatura; pagamento real; integração com meio de pagamento. Usuário só confirma intenção de compra.
Regras: ledger é fonte de verdade dos créditos; falhas técnicas não consomem créditos; retentativas técnicas não consomem créditos; relatórios já gerados permanecem acessíveis; abrir relatório não consome crédito; restaurar crédito gera nova transação; ausência de saldo não bloqueia acesso ao histórico. Política de reanálise gratuita da mesma vaga **continua pendente**.

**Conta** — `/app/conta`
Estrutura: Informações da conta, Segurança, Privacidade, Consentimentos, Sair, Excluir conta.
- Informações da conta: e-mail; nome; cidade opcional; estado opcional. Não apresentar: data de nascimento; CEP; endereço residencial completo.
- Segurança: alterar senha; visualizar/revogar sessões (quando suportado); sair da conta.
- Privacidade: Termos de Uso; Política de Privacidade; consentimentos; informações sobre retenção; informações sobre uso de IA; solicitação de exclusão.
- Exclusão: confirmação explícita; consequências; status da solicitação; prazo dos sistemas ativos; tratamento dos backups; falha de processamento; conclusão. "A exclusão da conta deverá seguir o PRD 00 e a política vigente de Segurança, Privacidade e Retenção."

### 5. Páginas de sistema
| Rota | Página |
| --- | --- |
| `/403` | Acesso não autorizado |
| `/404` | Página não encontrada |
| `/erro` | Erro temporário |
| `/manutencao` | Manutenção |

Devem: explicar o estado; preservar o tom de voz do CareerTwin; apresentar ação de recuperação; não exibir detalhes técnicos sensíveis; não expor informações de outros usuários; não revelar credenciais/tokens/identificadores internos; oferecer retorno seguro para Home, login ou dashboard conforme o contexto.

### 6. Navegação recomendada

Header público: Logo · Como funciona · Análise de Perfil · Diagnóstico de Aderência · Entrar · Criar conta.
Sidebar autenticada: Início · Meu perfil · Análise de Perfil · Diagnóstico de Aderência · Ações · Histórico · Créditos · Conta.
Menu mobile autenticado: mesmos itens da sidebar em `Sheet` ou menu lateral. Barra inferior eventual (só): Início · Perfil · Analisar · Ações · Menu.
Requisitos de interface de navegação: respeitar Style Guide CareerTwin; funcionar com teclado; foco visível; rótulos textuais; não depender apenas de ícones; preservar acesso aos mesmos destinos.

### 7. Regras de acesso e redirecionamento (seção 16)
```
Visitante acessa rota protegida        → /login?redirect=rota-original
Usuário autenticado sem onboarding concluído → /onboarding
Usuário autenticado com onboarding concluído → /app/dashboard
Usuário tenta acessar Core 1 sem Thin Twin confirmado → /onboarding ou /app/perfil
Usuário tenta acessar Core 1 sem contexto-alvo válido → /app/perfil/contexto-alvo
Usuário tenta acessar Core 2 sem Thin Twin confirmado → /onboarding ou /app/perfil
Usuário tenta analisar cargo sem contexto-alvo → /app/perfil/contexto-alvo
Usuário tenta analisar cargo sem referência aprovada → Estado de dados insuficientes
Usuário tenta analisar vaga sem conteúdo válido → /app/aderencia/vaga/nova
Usuário tenta iniciar análise de vaga sem crédito disponível → /app/creditos
```
Falta de crédito NÃO deve impedir: abrir análises anteriores; consultar histórico; atualizar ações; enviar feedback; atualizar o perfil; alterar o contexto-alvo.

Regras gerais: autorização validada no backend; frontend não é a única proteção; usuário não acessa recursos de outro usuário; backend não confia em `user_id` enviado livremente pelo cliente; redirecionamentos externos arbitrários não são permitidos; Core 1 não é pré-condição técnica obrigatória do Core 2.

### 8. Mapa consolidado de rotas (literal, seção 17)
```
/
├── /termos
├── /privacidade
├── /cadastro
├── /login
├── /recuperar-senha
├── /redefinir-senha
├── /onboarding
│
├── /app
│   ├── /dashboard
│   │
│   ├── /perfil
│   │   ├── /resumo
│   │   ├── /experiencias
│   │   ├── /projetos
│   │   ├── /competencias
│   │   ├── /ferramentas
│   │   ├── /formacao
│   │   ├── /certificacoes
│   │   ├── /contexto-alvo
│   │   ├── /documentos
│   │   └── /versoes
│   │
│   ├── /analise-perfil
│   │   ├── /processando/[analysisId]
│   │   ├── /[analysisId]
│   │   └── /comparar/[analysisId]
│   │
│   ├── /aderencia
│   │   ├── /cargo
│   │   ├── /vaga/nova
│   │   ├── /vaga/[jobId]/revisao
│   │   ├── /processando/[analysisId]
│   │   ├── /[analysisId]
│   │   └── /comparar/[analysisId]
│   │
│   ├── /acoes
│   ├── /historico
│   ├── /creditos
│   └── /conta
│
├── /403
├── /404
├── /erro
└── /manutencao
```
Regra para implementação: Claude Code não deve criar páginas fora do escopo; não criar terceiro módulo core; não alterar requisitos dos PRDs; não transformar subárea em funcionalidade independente sem decisão; não resolver silenciosamente conflitos de rota; não incluir pagamento real; não incluir candidatura automática; não incluir funcionalidades posteriores à decisão de candidatura. Ao alterar rota: preservar comportamento; preservar proteção de acesso; atualizar links internos; atualizar redirecionamentos; atualizar eventos aplicáveis; sincronizar Sitemap e PRDs; registrar decisão quando material.

---

## PRD 00 — Site Público e Autenticação (completo)

### Resumo
Identificador: PRD 00. Usuários: Visitante e profissional autenticado. Objetivo: "Apresentar o CareerTwin, converter visitantes em contas e controlar o acesso seguro à aplicação". Entrada: acesso ao site, e-mail, senha e consentimentos obrigatórios. Saída: conta criada ou sessão autenticada. Plataforma: aplicação web responsiva. Idioma: português do Brasil. Design System: **shadcn/ui com tokens CareerTwin**.

### Usuários e estados de acesso
- **Visitante**: pode navegar Home/LP, Termos, Privacidade, iniciar cadastro, login, recuperar senha. Não pode: acessar onboarding, dashboard, iniciar análises, consultar resultados/histórico, acessar dados de usuários.
- **Autenticado com onboarding pendente**: pode acessar/retomar onboarding, encerrar sessão, gestão básica da conta, solicitar exclusão. Não pode usar Core 1/Core 2 até cumprir pré-condições.
- **Autenticado com onboarding concluído**: acessa dashboard, funcionalidades liberadas, Core 1/Core 2 (conforme pré-condições), atualiza dados, consulta histórico, encerra sessão, solicita exclusão. "O Core 1 é recomendado antes do Core 2, mas não deve ser implementado como dependência técnica obrigatória do Core 2."

### Pré-condições
Site público: aplicação disponível; conteúdo institucional aprovado; identidade visual disponível; logos oficiais fornecidos; Style Guide CareerTwin disponível; páginas legais publicadas ou com conteúdo provisório claramente identificado.
Autenticação: serviço de autenticação configurado; banco de dados e políticas de acesso configurados; origens autorizadas para redirecionamentos; política de senha definida; política de sessão definida; tratamento de sessão implementado; consentimentos obrigatórios registrados; ambientes dev/homolog/produção separados.
"Decisões técnicas pendentes não devem ser preenchidas silenciosamente pelo Claude Code."

### Rotas (tabela oficial do PRD 00 — seção 6)
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

*(Ver seção "Conflitos ou ambiguidades internas" — esta tabela usa `/dashboard`, enquanto o Sitemap usa `/app/dashboard`.)*

Mudanças de rota permitidas pela Arquitetura desde que: comportamento preservado; redirecionamentos atualizados; eventos de analytics mantidos; PRDs e Sitemap sincronizados; escopo da funcionalidade inalterado.

### Fluxo — Home/LP
1. Visitante acessa a Home. 2. Sistema registra visualização permitida. 3. Visitante conhece proposta de valor. 4. Entende como funciona. 5. Conhece Core 1. 6. Conhece Core 2. 7. Lê princípios de autenticidade e limitações. 8. Seleciona CTA. 9. Sistema direciona para cadastro ou login. 10. Após autenticação, direciona para onboarding ou dashboard conforme estado.

### Fluxo — Cadastro
1. Acessa `/cadastro`. 2. Informa e-mail. 3. Cria senha. 4. Confirma termos obrigatórios. 5. Sistema valida campos. 6. Sistema verifica se a conta já existe. 7. Sistema cria a conta. 8. Registra consentimentos aplicáveis. 9. Sessão iniciada, quando permitido pela configuração. 10. Usuário direcionado para onboarding.
"Caso a configuração exija verificação de e-mail, o sistema deverá apresentar o estado de confirmação pendente antes de liberar o acesso autenticado."
"Mensagens relacionadas à existência da conta devem preservar a segurança e não expor informações de terceiros."

### Fluxo — Login
1. Acessa `/login`. 2. Informa e-mail e senha. 3. Sistema valida credenciais. 4. Sessão criada. 5. Sistema verifica estado da conta. 6. Onboarding pendente → onboarding. 7. Onboarding concluído → dashboard. 8. Rota protegida de origem válida → sistema pode retornar o usuário a ela.
Destino de retorno deve: pertencer à aplicação; estar autorizado; ser compatível com as permissões do usuário; não permitir redirecionamentos externos arbitrários.

### Fluxo — Recuperação de senha
1. Acessa recuperação. 2. Informa e-mail. 3. Sistema valida formato. 4. Sistema solicita envio das instruções. 5. Interface apresenta mensagem neutra. 6. Usuário acessa link válido. 7. Informa e confirma nova senha. 8. Sistema atualiza credencial. 9. Usuário direcionado para login ou sessão iniciada, conforme configuração.
"A mensagem não deve revelar se um e-mail está cadastrado."
Link deve: possuir validade limitada; ser de uso único; ser invalidado após utilização; ser rejeitado quando expirado ou incorreto.

### Estrutura da Home/LP (mínimo obrigatório)
- **Header**: logo oficial; navegação para seções; chamada para login; chamada para cadastro; comportamento responsivo.
- **Hero**: proposta de valor principal; explicação curta do produto; CTA primário para cadastro; CTA secundário para conhecer o funcionamento; elemento visual coerente com a identidade.
- **Problema**: experiências mal comunicadas; currículo e LinkedIn pouco claros; dificuldade para identificar lacunas; falta de priorização; incerteza sobre aderência a cargos e vagas.
- **Como funciona** (jornada resumida): 1. criar a conta; 2. enviar currículo e LinkedIn; 3. revisar e confirmar o Thin Twin; 4. definir o contexto-alvo; 5. receber a Análise de Perfil; 6. avaliar aderência a cargo ou vaga; 7. acompanhar recomendações e ações. (Pode condensar em menos passos sem alterar funcionamento nem prometer fora do escopo.)
- **Core 1**: explicar que ajuda a compreender como o perfil está sendo apresentado; identificar forças e fragilidades; melhorar comunicação de experiências; identificar necessidades de evidência; priorizar recomendações; organizar ações.
- **Core 2**: explicar que ajuda a comparar perfil com cargo/vaga; identificar requisitos atendidos; diferenciar tipos de lacuna; compreender riscos e bloqueadores; apoiar decisão de candidatura.
- **O que o usuário recebe**: diagnósticos explicáveis; recomendações priorizadas; tradução de experiências reais; identificação de lacunas; plano de ações; histórico e reanálises (quando disponíveis).
- **Autenticidade e confiança**: usa informações fornecidas/confirmadas; não inventa experiências; não cria resultados falsos; diferencia fatos de inferências; apresenta evidências; apresenta confiança separadamente dos scores; não substitui recrutadores.
- **Limitações**: não garante entrevista; não garante contratação; não representa decisão de recrutadores; não apresenta IPP/IAO como probabilidade de aprovação; não realiza candidatura automática; não funciona como job board; não funciona como ATS; encerra jornada antes da candidatura.
- **CTA final**: chamada para criar conta; alternativa para login; mensagem coerente com a proposta de valor.
- **Footer**: logo oficial; resumo institucional; links de navegação; Termos de Uso; Política de Privacidade; acesso ao login; informação de direitos autorais (quando definida).

### Requisitos funcionais — Site público
- RF-SITE-001: Home pública e responsiva.
- RF-SITE-002: apresentar o problema resolvido.
- RF-SITE-003: apresentar a proposta de valor.
- RF-SITE-004: explicar o funcionamento geral.
- RF-SITE-005: apresentar Core 1 — Análise de Perfil.
- RF-SITE-006: apresentar Core 2 — Diagnóstico de Aderência.
- RF-SITE-007: apresentar princípios de autenticidade.
- RF-SITE-008: apresentar limitações do produto e dos scores.
- RF-SITE-009: CTA para cadastro.
- RF-SITE-010: CTA para login.
- RF-SITE-011: CTA secundário "Ver como funciona" deve direcionar para a seção correspondente ou conteúdo equivalente.
- RF-SITE-012: header utilizável em desktop, tablet, mobile.
- RF-SITE-013: footer com acesso a Termos de Uso e Política de Privacidade.
- RF-SITE-014: conteúdo público em português do Brasil.
- RF-SITE-015: adaptar chamadas para usuários autenticados.
- RF-SITE-016: onboarding pendente → chamada para continuar onboarding.
- RF-SITE-017: onboarding concluído → chamada para acessar dashboard.
- RF-SITE-018: usar arquivos oficiais de logo fornecidos pelo projeto.
- RF-SITE-019: logo aplicado sem distorção, reconstrução, recoloração ou alteração de proporção.
- RF-SITE-020: interface deve usar shadcn/ui como base do Design System e seguir o Style Guide CareerTwin.

### Requisitos funcionais — Cadastro
- RF-AUTH-001: criação de conta com e-mail e senha.
- RF-AUTH-002: validar formato do e-mail.
- RF-AUTH-003: validar senha conforme política configurada.
- RF-AUTH-004: campo de senha alterna visível/oculto.
- RF-AUTH-005: solicitar confirmação dos Termos de Uso e da Política de Privacidade.
- RF-AUTH-006: consentimentos opcionais (quando aplicáveis) não podem ser condição para criar conta ou usar o serviço principal; finalidade, dados utilizados e possibilidade de revogação devem ser claros.
- RF-AUTH-007: impedir criação duplicada de conta com o mesmo identificador, respeitando segurança da mensagem exibida.
- RF-AUTH-008: após cadastro concluído, direcionar para onboarding.
- RF-AUTH-009: se verificação de e-mail habilitada, apresentar instruções e estado de confirmação pendente.
- RF-AUTH-010: registrar início e conclusão do cadastro com eventos do catálogo de Analytics.

### Requisitos funcionais — Login e sessão
- RF-AUTH-011: login com e-mail e senha.
- RF-AUTH-012: erro neutro para credenciais inválidas.
- RF-AUTH-013: criar sessão após autenticação válida.
- RF-AUTH-014: manter sessão conforme política de segurança configurada.
- RF-AUTH-015: permitir encerramento da sessão.
- RF-AUTH-016: após logout, sem acesso a rotas/dados protegidos.
- RF-AUTH-017: bloquear rotas protegidas para visitantes.
- RF-AUTH-018: ao tentar acessar rota protegida, visitante é direcionado para login.
- RF-AUTH-019: após login, direcionar para a etapa adequada da jornada.
- RF-AUTH-020: impedir redirecionamentos para destinos externos não autorizados.
- RF-AUTH-021: usuário acessa somente seus próprios dados e análises.
- RF-AUTH-022: políticas de acesso aplicadas no backend e no banco de dados, não apenas na interface; permissões não dependem exclusivamente de estado do frontend, parâmetros do cliente ou identificadores na URL.

### Requisitos funcionais — Recuperação de senha
- RF-AUTH-023: permitir solicitar recuperação de senha por e-mail.
- RF-AUTH-024: resposta não confirma se o e-mail está cadastrado.
- RF-AUTH-025: link de recuperação com validade limitada.
- RF-AUTH-026: rejeitar links inválidos, expirados ou já utilizados.
- RF-AUTH-027: usuário informa e confirma nova senha.
- RF-AUTH-028: após redefinição bem-sucedida, apresentar confirmação e próximo passo claro.

### Requisitos funcionais — Conta e exclusão
- RF-AUTH-029: usuário autenticado pode solicitar exclusão da conta.
- RF-AUTH-030: solicitação de exclusão exige confirmação explícita.
- RF-AUTH-031: sistema informa que a solicitação abrange (conforme política aplicável): dados pessoais; dados de autenticação; Thin Twin e suas versões; contextos-alvo e suas versões; oportunidades vinculadas; análises; recomendações; ações; histórico; feedbacks; documentos armazenados; identificadores pessoais. Interface também informa quando algum registro precisa ser mantido temporariamente por obrigação legal, segurança, prevenção de fraude, auditoria ou integridade operacional.
- RF-AUTH-032: meta operacional de exclusão dos sistemas ativos **até 15 dias**.
- RF-AUTH-033: meta operacional de remoção/expiração nos backups **até 30 dias**, conforme política técnica de backup.
- RF-AUTH-034: após confirmação, o sistema deve: registrar o pedido; impedir novas operações incompatíveis; informar status ao usuário; executar de forma idempotente; preservar trilha de auditoria; registrar conclusão ou falha.

### Requisitos não funcionais
- RNF-SITE-001 Responsividade: funcionar em desktop, tablet, mobile.
- RNF-SITE-002 Acessibilidade: HTML semântico; navegação por teclado; foco visível; labels associados aos campos; mensagens acessíveis; contraste adequado.
- RNF-SITE-003 Performance: carregamento rápido; otimização de imagens; otimização de fontes; carregar apenas recursos necessários; sem scripts desnecessários.
- RNF-SITE-004 SEO: título; descrição; metadados básicos; URL canônica; estrutura indexável; configuração de indexação apropriada. Páginas de login, cadastro, recuperação, redefinição e áreas autenticadas não devem ser indexadas quando incompatível com a estratégia de SEO/segurança.
- RNF-SITE-005 Segurança: credenciais, tokens e segredos nunca em logs, analytics, mensagens de erro, ferramentas de monitoramento, código-fonte, repositório.
- RNF-SITE-006 Privacidade: dados pessoais não enviados a analytics além do estritamente necessário e permitido; usar identificadores pseudônimos quando suficientes.
- RNF-SITE-007 Compatibilidade: navegadores modernos oficialmente suportados (lista definitiva pendente de decisão).
- RNF-SITE-008 Design System: shadcn/ui como base; Tailwind CSS para estilização; tokens do Style Guide CareerTwin; Lucide React para iconografia; arquivos oficiais da marca.

### Regras de negócio
- RN-SITE-001: site não é um terceiro módulo core.
- RN-SITE-002: comunicação apresenta apenas funcionalidades existentes ou previstas no escopo aprovado do MVP.
- RN-SITE-003: não pode prometer contratação, entrevista, aprovação ou sucesso profissional garantido.
- RN-SITE-004: não pode apresentar IPP/IAO como probabilidade de contratação/entrevista, decisão de recrutadores, ou medida absoluta do valor profissional.
- RN-SITE-005: linguagem clara, acolhedora e não julgadora.
- RN-SITE-006: não afirmar que hipóteses ainda não validadas são resultados comprovados.
- RN-SITE-007: depoimentos, números, empresas atendidas, resultados ou métricas não podem ser inventados.
- RN-SITE-008: produto apresentado como "mentor de carreira com inteligência artificial".
- RN-SITE-009: escopo comunicado termina na preparação e decisão de candidatura.
- RN-AUTH-001: somente usuários autenticados acessam funcionalidades core.
- RN-AUTH-002: usuário acessa somente os próprios dados e análises.
- RN-AUTH-003: tratamento necessário à prestação do serviço deve possuir base adequada e registro.
- RN-AUTH-004: consentimentos opcionais não podem bloquear o uso do produto principal.
- RN-AUTH-005: autenticação não deve coletar dados profissionais.
- RN-AUTH-006: dados pessoais coletados no onboarding não devem influenciar IPP, IAO, confiança, senioridade, recomendações, prioridade de candidatura.
- RN-AUTH-007: mensagens de autenticação não devem expor a existência de contas de terceiros.
- RN-AUTH-008: falhas de autenticação não devem consumir créditos.

### Estados da interface (obrigatórios)
- **Site público**: carregando; conteúdo disponível; navegação mobile aberta; visitante não autenticado; autenticado com onboarding pendente; autenticado com onboarding concluído; falha de carregamento parcial; indisponibilidade temporária.
- **Cadastro**: formulário inicial; preenchimento inválido; envio em andamento; ação alternativa para conta existente; cadastro concluído; confirmação de e-mail pendente; falha temporária.
- **Login**: formulário inicial; credenciais inválidas; envio em andamento; sessão criada; conta indisponível; falha temporária.
- **Recuperação de senha**: solicitação inicial; solicitação em andamento; instruções enviadas; link válido; link inválido; link expirado; senha redefinida; falha temporária.
- **Sessão**: sessão válida; sessão expirada; logout em andamento; logout concluído; acesso não autorizado.
- **Exclusão**: solicitação inicial; confirmação pendente; solicitação registrada; processamento em andamento; exclusão concluída; falha de processamento.
"Os estados funcionais devem ser implementados com valores consistentes entre interface, backend e banco de dados."

### Mensagens essenciais (copy provisória — requer aprovação do PO antes de publicar)
- **Hero**: "Melhore seu posicionamento profissional e entenda sua aderência às oportunidades antes de se candidatar."
- **Subtítulo**: "O CareerTwin analisa seu currículo, LinkedIn e oportunidades de interesse para gerar diagnósticos explicáveis, recomendações priorizadas e ações práticas."
- **Autenticidade**: "O CareerTwin não inventa experiências e não promete contratação. A proposta é ajudar você a comunicar melhor sua trajetória real e tomar decisões mais estratégicas."
- **Cadastro concluído**: "Sua conta foi criada. Agora vamos organizar as informações necessárias para sua primeira análise."
- **Login inválido**: "Não foi possível entrar com os dados informados. Revise as informações ou recupere sua senha."
- **Recuperação de senha**: "Se houver uma conta associada a este e-mail, você receberá as instruções para redefinir sua senha."
- **Sessão expirada**: "Sua sessão expirou. Entre novamente para continuar com segurança."
- **Acesso protegido**: "Entre na sua conta para acessar esta área."
- **Exclusão de conta**: "Sua solicitação de exclusão foi registrada. Informaremos o andamento conforme os prazos aplicáveis."

### Analytics
Eventos canônicos: `landing_viewed`; `landing_primary_cta_clicked`; `landing_secondary_cta_clicked`; `signup_started`; `signup_completed`; `login_started`; `login_completed`; `login_failed`.
Eventos adicionais (recuperação de senha; redefinição de senha; logout; bloqueio de rota; visualização de páginas legais; solicitação de exclusão) só devem ser implementados após registro no catálogo canônico de Analytics (nomes, triggers, propriedades).
`account_deletion_requested` só pode ser usado no analytics de produto quando sua utilização mínima estiver de acordo com a Política de Privacidade. O registro operacional da exclusão permanece no banco e na trilha de auditoria.
Propriedades permitidas: origem do acesso; campanha (quando disponível); página; tipo de CTA; destino do CTA; status da autenticação; etapa da jornada; dispositivo; categoria segura do erro; versão do fluxo.
**Dados proibidos em analytics**: senha; token de sessão; token de recuperação; e-mail em texto aberto; nome completo; cidade; estado; endereço; data de nascimento; currículo; LinkedIn; descrição de vaga; conteúdo profissional; comentários livres; URLs assinadas; credenciais; segredos.

### Critérios de aceite (30 itens, seção 22)
1. Home pública disponível em desktop, tablet e mobile. 2. Visitante compreende problema e proposta de valor. 3. Core 1 e Core 2 apresentados sem criar um terceiro módulo core. 4. Princípios de autenticidade apresentados. 5. Limitações e disclaimers apresentados. 6. CTAs funcionais para cadastro e login. 7. Autenticados recebem CTA compatível com seu estado. 8. Site usa logos oficiais sem distorção. 9. Interface segue Design System baseado em shadcn/ui. 10. Visitante consegue criar conta com e-mail e senha. 11. Consentimentos obrigatórios registrados. 12. Consentimentos opcionais não bloqueiam o cadastro. 13. Usuário consegue fazer login. 14. Credenciais inválidas recebem mensagem segura. 15. Usuário consegue solicitar recuperação de senha. 16. Recuperação não revela se a conta existe. 17. Usuário consegue redefinir a senha com link válido. 18. Rotas protegidas bloqueiam visitantes. 19. Usuário autenticado acessa somente os próprios dados. 20. Redirecionamento pós-login considera o estado do onboarding. 21. Usuário consegue encerrar a sessão. 22. Usuário consegue solicitar exclusão da conta. 23. Termos de Uso e Política de Privacidade acessíveis. 24. Credenciais e tokens não enviados para analytics. 25. Eventos essenciais registrados com nomes canônicos. 26. Experiência atende requisitos mínimos de acessibilidade. 27. Conteúdo não promete contratação nem inventa resultados. 28. Falhas de autenticação não consomem créditos. 29. Permissões validadas no backend e no banco. 30. Claude Code não redefine decisões pendentes silenciosamente.

### Fora do escopo deste PRD
Onboarding e extração de documentos; criação/revisão do Thin Twin; definição detalhada do contexto-alvo; Core 1; Core 2; dashboard detalhado; histórico detalhado; gestão detalhada de ações; créditos e ofertas; pagamento real; assinatura recorrente; login social; autenticação por biometria; aplicativo mobile nativo; candidatura automática; job board; ATS; editor de currículo; edição direta do LinkedIn. "Dashboard, histórico, ações, créditos e conta são superfícies de apoio e não constituem módulos core adicionais."

### Decisões pendentes (não devem ser resolvidas silenciosamente)
1. Aprovação do Supabase Auth ou outro provedor no Decision Log. 2. Obrigatoriedade de confirmação de e-mail. 3. Política exata de senha. 4. Duração, renovação e revogação da sessão. 5. Conteúdo jurídico final dos Termos de Uso. 6. Conteúdo jurídico final da Política de Privacidade. 7. Ferramenta definitiva de analytics. 8. Política de cookies e consentimento correspondente. 9. Domínio oficial. 10. Metadados finais de SEO. 11. Copy final da Home. 12. Imagens finais da Home. 13. Detalhamento operacional da exclusão da conta. 14. Navegadores oficialmente suportados.
Regras enquanto pendentes: Claude Code não escolhe solução definitiva silenciosamente; valores provisórios permanecem configuráveis; decisões materiais são registradas no Decision Log; conteúdos provisórios não são publicados como finais.

---

## Design tokens e estilo visual

Definição resumida do estilo: **"Minimalismo corporativo contemporâneo, com estética editorial premium, linguagem human-centered tech e foco em evolução profissional."**
Palavras-chave: Clareza · Evolução · Direção · Confiança · Proximidade · Estratégia · Movimento · Profissionalismo · Tecnologia humana · Sofisticação acessível.
Design System: **shadcn/ui personalizado com os tokens visuais da CareerTwin**.

### Paleta cromática (hex exatos)
Cores principais:
- Laranja CareerTwin: `#FF5A1F`
- Preto profundo: `#111111`
- Branco: `#FFFFFF`
- Off-white: `#F5F5F4`

Cores auxiliares:
- Cinza claro: `#E7E7E5`
- Cinza médio: `#8A8A87`
- Pêssego claro: `#FBE4D8`
- Laranja escuro: `#D9440C`

Direção de uso: branco/off-white dominam (leveza, organização, legibilidade); preto sustenta autoridade da marca e acabamento premium; laranja é cor de movimento/ação/direcionamento, usado em CTAs, palavras-chave, ícones, indicadores de progresso, linhas, marcadores, estados de foco, elementos institucionais, detalhes de marca; pêssego claro só como apoio visual (fundos, grafismos ampliados, áreas secundárias). "O laranja não deve competir com o conteúdo."

Proporção cromática recomendada: 55% branco/off-white; 25% preto ou cinza escuro; 15% cinzas e tons neutros; 5% laranja de destaque.

### Tipografia
Família principal: **Inter**.
Pesos: Inter Regular (textos corridos); Inter Medium (subtítulos, navegação, campos, rótulos); Inter Semibold (títulos, botões, chamadas); Inter Bold (títulos de alto impacto).
Direção: títulos curtos, diretos e memoráveis; palavras estratégicas em laranja; entrelinha confortável; hierarquia visual evidente; poucas variações de peso por composição; títulos de seção em caixa alta com espaçamento ampliado; redução do espaçamento entre letras em títulos grandes; textos corridos com contraste/tamanho adequados.
Exemplo de construção de copy: "Evolua. Reposicione-se. **Conquiste.**"
**Evitar**: tipografias decorativas; serifas clássicas como família principal; excesso de pesos tipográficos; títulos longos; textos condensados; uso excessivo de caixa alta; baixo contraste.

### Componentes / convenções de UI (shadcn/ui)
Tecnologias recomendadas: shadcn/ui (componentes); Radix UI (primitivas acessíveis); Tailwind CSS (estilização); class-variance-authority (variantes); Lucide React (iconografia); função `cn()` (composição de classes).
Princípios: usar componentes shadcn/ui antes de criar do zero; personalizar via tokens; preservar acessibilidade original; criar variantes em vez de duplicar componentes; manter componentes desacoplados das páginas; evitar mudanças que dificultem updates do shadcn; **não usar o visual padrão do shadcn sem adaptação à CareerTwin**; não misturar bibliotecas de UI sem justificativa técnica.
Componentes prioritários: Button; Card; Input; Textarea; Select; Checkbox; Radio Group; Switch; Badge; Progress; Tabs; Accordion; Dialog; Sheet; Dropdown Menu; Tooltip; Popover; Command; Table; Skeleton; Alert; Sonner; Avatar; Separator; Breadcrumb; Pagination.

Mapeamento de tokens visuais:
| Token | Valor |
| --- | --- |
| Primary | `#FF5A1F` |
| Background | `#FFFFFF` ou `#F5F5F4` |
| Foreground | `#111111` |
| Border | `#E7E7E5` |
| Ring / focus | laranja CareerTwin (garantindo contraste e acessibilidade) |
| Destructive | cor semântica própria — "O laranja da marca não deve representar erro." |

Cards: cantos entre 12–20px; bordas em cinza claro; fundo branco; sombra suave; conteúdo objetivo; poucos níveis de informação; CTA claramente identificado.
Botão primário: fundo laranja; texto branco; peso semibold; raio entre 10–14px; hover em laranja escuro (`#D9440C`); estado de foco visível; estado disabled claro; loading consistente.
Botão secundário: fundo branco; borda cinza; texto preto; hover em off-white.
Botão terciário: fundo transparente; texto preto ou laranja; feedback de hover discreto.
Regras de experiência: uma ação principal por seção; textos curtos e escaneáveis; navegação previsível; estados de foco visíveis; contraste compatível com acessibilidade; componentes consistentes entre desktop e mobile; evitar excesso de informação em um único card; evitar modais quando página/seção for mais adequada; evitar animações decorativas sem função.

### Grid e responsividade
- Desktop: 12 colunas; margens laterais 64–96px; gutters 24–32px; largura máxima 1280–1440px.
- Tablet: 8 colunas; margens 32–48px; gutters 20–24px.
- Mobile: 4 colunas; margens 20–24px; gutters 16px.
Comportamento: preservar hierarquia em todos os tamanhos; não apenas reduzir elementos; reorganizar blocos conforme o espaço; manter CTAs acessíveis; evitar textos muito largos; preservar contraste e legibilidade; alternar entre logo horizontal e símbolo isolado quando necessário; "Nunca criar uma nova composição do logo para mobile."

### Iconografia
Traço linear; geometria simples; cantos arredondados; espessura consistente; alta legibilidade; predominância do laranja. Biblioteca recomendada: **Lucide Icons** via pacote `lucide-react`.
Regras: manter um único estilo de traço; preservar proporções; tamanhos consistentes; ícone semanticamente relacionado ao conteúdo; não misturar bibliotecas sem justificativa; usar preto, branco ou laranja conforme o contexto.
**Evitar**: ícones 3D; ícones preenchidos misturados com lineares; ilustrações excessivamente detalhadas; múltiplas espessuras de traço; símbolos genéricos sem relação com a mensagem.

### Logo — regras obrigatórias e o que fazer se faltar asset
Versões previstas: logo horizontal (headers, menus, barras de navegação, rodapés, assinaturas, dashboards, landing pages, apresentações horizontais); logo vertical (capas, páginas institucionais, telas de abertura, peças promocionais, cards de marca, materiais verticais, sinalização, apresentações institucionais); símbolo isolado (apenas quando o contexto já identifica a CareerTwin ou há restrição de espaço — favicon, avatar, badge, ícone de app, marcador, interface mobile compacta, grafismo institucional).

**Regra principal**: "Devem ser utilizados exclusivamente os arquivos oficiais fornecidos pelo projeto." O logo **não deve** ser redesenhado, reconstruído, reinterpretado ou simulado por CSS, texto, tipografia, ícones, SVG manual ou IA.

Regras obrigatórias de integridade (lista "Nunca"): preservar proporção original; nunca esticar/comprimir; nunca inclinar; nunca rotacionar; nunca deformar; nunca alterar o desenho; nunca modificar geometria interna; nunca alterar espaçamento entre símbolo/nome/assinatura; nunca trocar a tipografia do wordmark; nunca reescrever "CareerTwin" para simular o logo; nunca mudar as cores (exceto versão oficial correspondente); nunca aplicar gradientes; nunca adicionar contornos; nunca adicionar brilhos; nunca aplicar sombras pesadas; nunca aplicar efeitos 3D em interfaces; nunca reorganizar manualmente os elementos; nunca recortar partes essenciais; **"nunca utilizar uma captura de tela quando houver um arquivo oficial disponível."**

Aplicação digital: usar `object-fit: contain`; nunca usar `object-fit: cover`; definir uma dimensão principal e manter a outra automática; preservar `aspect-ratio`; manter área de proteção ao redor do logo (margem mínima ≈ altura de um dos círculos superiores do símbolo); usar versão horizontal em desktop sempre que houver espaço; usar símbolo isolado oficial em espaços muito compactos; usar logo vertical só quando a composição justificar estrutura empilhada.

**O que fazer se os assets de logo estiverem faltando**: os documentos lidos **não especificam um procedimento de fallback explícito** para a ausência dos arquivos oficiais de logo. O que existe é: (a) PRD 00 (seção 5, Pré-condições) lista "logos oficiais fornecidos" como pré-condição para o site público, ao lado de "Decisões técnicas pendentes não devem ser preenchidas silenciosamente pelo Claude Code"; (b) a regra de integridade do logo proíbe qualquer reconstrução, simulação ou substituição por CSS/texto/ícone/IA quando o arquivo não está disponível ou é insuficiente. A combinação dessas duas regras implica que, na ausência do asset oficial, o Claude Code não deve criar um substituto — mas nenhum dos cinco documentos define o que exibir no lugar (ex.: placeholder, texto puro, wordmark tipográfico temporário). **Isto é uma lacuna, não uma instrução — deve ser tratado como decisão pendente/Decision Log**, e não resolvido silenciosamente.

### Diretrizes gerais "Não fazer" (design), consolidadas
- Não usar o visual padrão do shadcn sem adaptação à marca.
- Não misturar bibliotecas de UI/ícones sem justificativa técnica.
- Não inventar métricas, clientes, depoimentos ou resultados.
- Não usar lorem ipsum em entregáveis finais.
- Não usar `object-fit: cover` no logo.
- Não redesenhar/recolorir/reorganizar/distorcer o logo (lista completa acima).
- Não usar o laranja da marca para representar erro (usar cor semântica destrutiva própria).
- Não aplicar animações decorativas sem função; não usar modais quando página/seção for mais adequada.

### Diretrizes de implementação (seção 13, lista completa para o Claude Code)
1. Utilizar shadcn/ui como base do Design System. 2. Usar Tailwind CSS para estilos e tokens. 3. Reutilizar componentes shadcn antes de criar novos. 4. Utilizar Inter como tipografia principal. 5. Usar os tokens cromáticos definidos. 6. Manter o laranja restrito a ações e destaques. 7. Preservar bastante espaço em branco. 8. Usar grid consistente. 9. Criar componentes reutilizáveis. 10. Preservar HTML semântico e acessibilidade. 11. Usar Lucide React para iconografia. 12. Utilizar exclusivamente os arquivos oficiais do logo. 13. Selecionar corretamente entre logo horizontal, vertical e símbolo isolado. 14. Nunca distorcer, redesenhar, recolorir ou reorganizar o logo. 15. Usar `object-fit: contain`. 16. Nunca usar `object-fit: cover` no logo. 17. Não inventar métricas, clientes, depoimentos ou resultados. 18. Não usar lorem ipsum em entregáveis finais. 19. Criar estados de hover, focus, loading, disabled e error. 20. Manter consistência entre desktop, tablet e mobile.

### Tom verbal
Características: profissional; humana; clara; confiante; estratégica; próxima; direta; inspiradora sem exagero; orientada à ação.
Estrutura recomendada: **"Verbo de transformação + benefício concreto."**
Verbos preferenciais: evoluir; reposicionar; planejar; desenvolver; transformar; conectar; avançar; conquistar; direcionar; decidir.
Exemplos de copy: "Evolua com direção." · "Reposicione-se com clareza." · "Transforme intenção em ação." · "Conquiste novas possibilidades." · "Sua carreira pode avançar com estratégia." · "Clareza para decidir. Estratégia para evoluir." · "Seu próximo passo começa com direção."
**Evitar**: clichês motivacionais; promessas irreais; excesso de adjetivos; frases excessivamente longas; linguagem agressiva; discurso frio; tom burocrático; afirmações sem evidência.

---

## Escopo do MVP

### Objetivo do MVP
"O MVP do CareerTwin deverá validar se o produto consegue transformar currículo, LinkedIn, objetivo profissional e oportunidades em diagnósticos específicos, explicáveis e acionáveis." Ajuda o usuário a: compreender como seu perfil está sendo apresentado; melhorar a comunicação do currículo e LinkedIn; comunicar melhor experiências reais; identificar lacunas de competência/comunicação/evidência; priorizar ações; avaliar aderência observável a cargos e vagas; tomar decisões antes de se candidatar. "O MVP acompanha o usuário até a **preparação e decisão de candidatura**."

### Definição resumida (framing dos dois módulos core, literal)
> "O usuário acessa o CareerTwin, cria sua conta, envia currículo e LinkedIn, confirma seu perfil profissional estruturado, define seu objetivo profissional, utiliza o Core 1 para compreender e melhorar seu posicionamento e utiliza o Core 2 para avaliar sua aderência a um cargo ou vaga antes de se candidatar."

### Plataforma e público
| Elemento | Definição |
| --- | --- |
| Plataforma | Aplicação web responsiva |
| Mercado | Brasil |
| Modelo | B2C |
| Público | Profissionais de tecnologia, produto e design |
| Senioridade | Estágio a sênior |
| Idioma | Português do Brasil |
| Jornada coberta | Preparação e decisão de candidatura |

### Funcionalidades core
"O CareerTwin possui duas funcionalidades core."
**Core 1 — Análise de Perfil**: analisa currículo; LinkedIn; Thin Twin confirmado; contexto do objetivo profissional. Entrega: IPP (Índice de Prontidão do Perfil); diagnóstico explicável; pontos fortes; lacunas observáveis; recomendações; sugestões de reformulação; plano de ações priorizado.
**Core 2 — Diagnóstico de Aderência**: compara perfil confirmado com um cargo-alvo ou uma vaga específica. Entrega: IAO (Índice de Aderência Observável); requisitos atendidos; correspondências parciais; lacunas de comunicação/evidência; lacunas profissionais observáveis; riscos e possíveis bloqueadores; recomendação de priorização.

### O que está IN (funcionalidades incluídas)
- **Aquisição e acesso**: site institucional; cadastro com e-mail e senha; login; logout; recuperação de senha; área autenticada.
- **Onboarding**: nome completo obrigatório; cidade e estado opcionais; envio de currículo; envio do LinkedIn; processamento dos materiais; revisão das informações extraídas; confirmação do Thin Twin; definição do objetivo profissional.
- **Perfil profissional**: Thin Twin estruturado; edição e confirmação dos dados; versionamento do perfil; versionamento separado do contexto-alvo; associação das análises às versões utilizadas; atualização de currículo e LinkedIn.
- **Core 1**: Análise de Perfil; IPP; diagnóstico geral; recomendações; tradução da experiência; plano de ações.
- **Core 2**: análise por cargo-alvo; envio de vaga; estruturação da oportunidade; IAO; diagnóstico dos requisitos; recomendação de priorização.
- **Funcionalidades de apoio**: dashboard; histórico; ações pendentes/em andamento/concluídas; reanálise; feedback; créditos simulados; intenção de compra; configurações da conta; solicitação de exclusão.

### O que está OUT (fora do escopo)
Busca automática de vagas; scraping do LinkedIn; leitura automática de qualquer URL; candidatura automática; tracker de candidaturas; preparação para entrevistas; simulador de entrevistas; networking; mensagens para recrutadores; negociação de ofertas; acompanhamento após contratação; coaching humano; edição direta do currículo; edição direta do LinkedIn; geração completa e exportação de currículo; aplicativo mobile nativo; B2B ou B2B2C; pagamento real; assinatura recorrente; integração com plataformas de cursos; comparação entre usuários; ranking; gamificação; orientação vocacional completa.

### Experiência gratuita
Usuário tem acesso a: uma Análise de Perfil completa; uma análise de vaga específica; recomendações; plano de ações; dashboard; histórico; reanálise durante o piloto (conforme regras aprovadas no Decision Log e no PRD 03).

### Oferta simulada
Pacote Novas Oportunidades:
| Item | Hipótese |
| --- | --- |
| Conteúdo | Cinco créditos para análises de vagas |
| Preço | R$ 29,90 |
| Validade | 30 dias |
| Pagamento real | Não será implementado |
| Dados de cartão | Não serão coletados |
| Conversão medida | Intenção explícita de compra |
"Preço, quantidade de créditos e validade permanecem como hipóteses de validação."

### Critérios gerais de sucesso
O MVP deve permitir que o usuário: compreenda a proposta do CareerTwin; crie uma conta; conclua o onboarding; envie currículo e LinkedIn; revise e confirme o Thin Twin; defina o objetivo profissional; conclua o Core 1; compreenda o IPP e seu nível de confiança; selecione pelo menos uma ação; envie uma vaga; conclua o Core 2; compreenda o IAO e seu nível de confiança; utilize a análise para apoiar uma decisão; consulte o histórico; atualize o perfil; realize uma reanálise; envie feedback; registre intenção de compra; solicite exclusão da conta.

### Critérios de qualidade (o MVP NÃO está pronto se houver)
Invenção factual crítica; análise associada ao usuário errado; score sem explicação ou sem confiança separada; falha no fluxo principal; exposição indevida de dados; perda do vínculo entre análise/versão do perfil/versão do objetivo; ausência dos eventos essenciais de analytics; falha na exclusão dos arquivos temporários; impossibilidade de corrigir informações extraídas.

---

## Jornada do Usuário

Jornada principal (literal):
> **Site → Cadastro e autenticação → Onboarding → Currículo e LinkedIn → Extração → Revisão e confirmação do Thin Twin → Definição do objetivo profissional → Core 1 → Core 2 → Ações → Atualização e reanálise**

"O Core 1 representa a sequência recomendada após o onboarding, mas não é uma pré-condição técnica obrigatória para o Core 2."

### Etapa 1 — Descoberta
Objetivo: entender o que é o CareerTwin e decidir se vale iniciar a experiência. Ações: acessa o site; lê a proposta de valor; entende como o produto funciona; consulta os dois módulos core; inicia o cadastro ou faz login. Resposta do sistema: apresenta problema resolvido; proposta de valor; funcionamento geral; Core 1; Core 2; compromisso com autenticidade; limitações; chamadas para cadastro e login. Resultado esperado: usuário entende que o CareerTwin analisa perfil/cargos/vagas, gera diagnósticos explicáveis, não promete entrevista/contratação, não inventa experiências, exige currículo e LinkedIn, acompanha até a preparação e decisão de candidatura.

### Etapa 2 — Cadastro e autenticação
Objetivo: criar conta e acessar área individual. Ações: informa e-mail; cria senha; aceita termos obrigatórios; confirma cadastro (quando necessário); faz login. Resposta do sistema: valida dados; cria conta; registra consentimentos obrigatórios; inicia sessão; direciona ao onboarding no primeiro acesso; direciona à área autenticada nos acessos seguintes. Exceções: e-mail já cadastrado; senha inválida; confirmação de e-mail pendente (quando aplicável); falha de autenticação; sessão expirada; recuperação de senha.

### Etapa 3 — Dados pessoais
Objetivo: completar informações básicas da conta. Dados coletados: nome completo obrigatório; cidade opcional; estado opcional. Não coletados no MVP: data de nascimento; CEP; endereço residencial completo. Regras: esses dados não fazem parte do Thin Twin profissional; não influenciam IPP; não influenciam IAO; não influenciam a confiança; não influenciam recomendações; não devem ser enviados desnecessariamente à IA; devem permanecer separados do perfil profissional.

### Etapa 4 — Envio do currículo
Objetivo: fornecer a principal fonte da trajetória profissional. Formatos: PDF; DOCX; texto colado. Estados: aguardando envio; validando; enviando; processando; concluído; conteúdo insuficiente; arquivo protegido; formato inválido; falha de processamento. Resultado esperado: currículo validado e encaminhado para extração.

### Etapa 5 — Envio do LinkedIn
Objetivo: complementar a visão profissional e permitir comparação entre fontes. Formatos: PDF exportado; texto colado. A URL pode ser armazenada como referência, mas não é fonte única nem implica leitura automática. Resultado esperado: conteúdo validado e encaminhado para extração.

### Etapa 6 — Extração do perfil
Objetivo do sistema: transformar currículo e LinkedIn em perfil profissional estruturado. Informações extraídas: cargos; empresas; períodos; experiências; responsabilidades; projetos; competências; ferramentas; resultados; formação; certificações; evidências; possíveis divergências. Estados: extração iniciada; extração concluída; extração parcial; baixa confiança; falha técnica; conteúdo insuficiente. Resultado esperado: rascunho do Thin Twin criado, com informações rastreáveis às fontes.

### Etapa 7 — Revisão e confirmação
Objetivo: validar o que o sistema entendeu antes de receber análises. Ações: confirma; corrige; remove; adiciona experiências; adiciona competências; adiciona resultados; complementa responsabilidades; revisa formação; revisa certificações; resolve divergências. **Regra central**: "Somente informações fornecidas ou confirmadas pelo usuário serão tratadas como fatos profissionais." Resultado esperado: versão imutável e confirmada do Thin Twin criada.

### Etapa 8 — Objetivo profissional
Objetivo: definir o contexto das análises. Informações: área de interesse; cargo-alvo; senioridade desejada. Apoio do sistema: pode sugerir até três cargos relacionados às experiências identificadas. Limite: "O sistema não deve afirmar qual é a carreira ideal para o usuário nem tratar uma sugestão como decisão profissional." Resultado esperado: versão do contexto-alvo confirmada separadamente da versão do Thin Twin.

### Etapa 9 — Core 1
Objetivo: compreender como o perfil está sendo apresentado e o que deve melhorar. Ações: inicia a análise; aguarda o processamento; consulta o IPP; consulta o nível de confiança; lê o diagnóstico; consulta recomendações; analisa sugestões de reformulação; seleciona uma ação. Resultado esperado: usuário entende o que está bem comunicado; quais informações têm evidências; quais lacunas são observáveis; quais problemas são de comunicação ou evidência; quais informações permanecem incertas; o que deve fazer primeiro.

### Etapa 10 — Core 2
Objetivo: compreender aderência observável a um cargo ou vaga. Possibilidades: analisar cargo-alvo (quando existir referência aprovada); colar descrição de vaga; enviar vaga em PDF. Ações: informa/envia dados da oportunidade; revisa e confirma conteúdo estruturado; inicia análise; consulta IAO; consulta nível de confiança; analisa requisitos; consulta lacunas/riscos/bloqueadores; lê recomendação final. Resultado esperado: usuário entende se deve priorizar agora; priorizar com ajustes; desenvolver lacunas antes de priorizar; não priorizar; ou complementar informações antes de decidir. "O resultado não representa probabilidade de entrevista ou contratação."

### Etapa 11 — Ações
Objetivo: transformar recomendações em execução. Estados da ação: pendente; selecionada; em andamento; concluída. Ações possíveis: atualizar currículo; atualizar LinkedIn; complementar uma experiência; adicionar evidências; melhorar posicionamento; desenvolver uma competência; analisar uma nova oportunidade.

### Etapa 12 — Atualização e reanálise
Gatilhos: novo currículo; novo LinkedIn; correção do Thin Twin; nova evidência; recomendação concluída; mudança de objetivo profissional. Resposta do sistema: cria nova versão do Thin Twin quando há alteração nos fatos profissionais; cria nova versão do contexto-alvo quando há alteração no objetivo profissional; mantém versões anteriores; associa cada análise às versões utilizadas; preserva histórico; informa previamente quando a operação consumir crédito. "Falhas técnicas e reprocessamentos não devem consumir créditos." A gratuidade de reanálise da mesma vaga segue regra do Decision Log e PRD 03.

### Etapa 13 — Feedback
Após cada análise, o sistema pode perguntar:
- **Utilidade** (escala 1–5): "Quão útil foi esta análise para decidir o que fazer a seguir?"
- **Especificidade**: sim / parcialmente / não.
- **Complementos**: primeira ação pretendida; intenção de candidatura; comentário opcional.

### Fluxos alternativos (literais)
- Usuário recorrente: "Login → Área autenticada → Consultar histórico, atualizar perfil ou iniciar nova análise."
- Atualização do perfil: "Área autenticada → Atualizar currículo ou LinkedIn → Revisar alterações → Criar nova versão do Thin Twin → Reanalisar."
- Alteração do objetivo profissional: "Área autenticada → Atualizar objetivo → Confirmar novo contexto-alvo → Iniciar nova análise."
- Análise de nova vaga: "Área autenticada → Analisar vaga → Enviar descrição → Revisar e confirmar vaga → Core 2."
- Exclusão da conta: "Configurações → Solicitar exclusão → Confirmar solicitação → Processamento da exclusão."

---

## Conflitos ou ambiguidades internas

1. **Rota do Dashboard diverge entre Sitemap e PRD 00.**
   - Sitemap (seções 3.2, 5, 6, 16, 17): usa consistentemente `/app/dashboard` (ex.: "Login │ ├── Onboarding não concluído │ └── /onboarding │ └── Onboarding concluído │ └── /app/dashboard"; rota base `/app` "deverá redirecionar para: `/app/dashboard`"; regra de redirecionamento "Usuário autenticado com onboarding concluído ↓ /app/dashboard"; mapa consolidado de rotas lista `/dashboard` aninhado sob `/app`).
   - PRD 00 (seção 6, tabela de rotas): lista a rota como `/dashboard` (sem prefixo `/app`) — `| \`/dashboard\` | Dashboard | Autenticado |`.
   - Não fica claro qual documento é a referência de caminho técnico definitivo. O próprio Sitemap declara em sua seção 18 que "Rotas e navegação" tem como documento principal "Sitemap e Arquitetura", o que sugeriria priorizar `/app/dashboard`, mas o PRD 00 nunca é explicitamente subordinado ao Sitemap nesse ponto — e o Sitemap também afirma que "Em caso de divergência, a implementação não deverá escolher silenciosamente uma interpretação. O conflito deverá ser encaminhado ao Decision Log antes de alterar o comportamento do produto."

2. **PRD 00 não usa o prefixo `/app` em nenhuma rota autenticada, enquanto o Sitemap trata `/app` como rota-base de toda a aplicação autenticada.**
   - PRD 00 tabela de rotas (seção 6) lista apenas `/onboarding` e `/dashboard` como rotas autenticadas, sem qualquer menção a `/app`.
   - Sitemap seção 5 define explicitamente: "Rota base `/app`" que "deverá redirecionar para: `/app/dashboard`", e todas as demais rotas autenticadas (perfil, análise de perfil, aderência, ações, histórico, créditos, conta) aparecem aninhadas sob `/app` nas seções 6–13 e no mapa consolidado (seção 17). O PRD 00 simplesmente não cobre essas rotas (fora do seu escopo declarado na seção 23), então a ausência do prefixo pode ser apenas incompletude do PRD 00 e não necessariamente uma contradição deliberada — mas o texto literal diverge.

3. **Onboarding: número e nomeação de etapas variam conforme o documento, sem contradição explícita, mas com escopos diferentes.**
   - Sitemap (seção 4): onboarding tem 9 etapas internas dentro da rota `/onboarding` (Boas-vindas, Identificação, Currículo, LinkedIn, Processamento, Revisão do Thin Twin, Confirmação do Thin Twin, Contexto-alvo, Conclusão).
   - Jornada do Usuário: usa uma numeração de 13 "etapas" que cobre toda a jornada do produto (Descoberta, Cadastro e autenticação, Dados pessoais, Currículo, LinkedIn, Extração, Revisão e confirmação, Objetivo profissional, Core 1, Core 2, Ações, Atualização e reanálise, Feedback) — não é uma contradição de conteúdo (as etapas de onboarding do Sitemap mapeiam para um subconjunto das etapas da Jornada), mas os dois documentos usam a palavra "etapa" com escopos e contagens diferentes, o que pode gerar confusão se alguém tentar mapear "Etapa N" de um documento diretamente para o outro.

4. **Ambiguidade proposital em duas regras de redirecionamento do Sitemap (seção 16), que usam "ou" sem critério de desempate:**
   - "Usuário tenta acessar Core 1 sem Thin Twin confirmado ↓ `/onboarding` ou `/app/perfil`"
   - "Usuário tenta acessar Core 2 sem Thin Twin confirmado ↓ `/onboarding` ou `/app/perfil`"
   - Nenhum dos cinco documentos define a condição que decide entre as duas opções (por exemplo, se o onboarding nunca foi iniciado versus já foi concluído mas o Thin Twin perdeu a confirmação). O próprio Sitemap reconhece esse tipo de lacuna como concluída por outros documentos ("Em caso de divergência, ... O conflito deverá ser encaminhado ao Decision Log").

5. **Falta de procedimento explícito para ausência de assets de logo.**
   - "Leitura do estilo visual" define regras rígidas de integridade do logo (nunca redesenhar, reconstruir, simular via CSS/texto/ícone/IA, ou usar captura de tela quando há arquivo oficial disponível) mas não define o que fazer **quando não há arquivo oficial disponível**.
   - PRD 00 (seção 5) lista "logos oficiais fornecidos" como pré-condição do site público e também instrui, de forma geral, que "Decisões técnicas pendentes não devem ser preenchidas silenciosamente pelo Claude Code" — mas isso é uma regra geral de governança, não uma instrução específica de fallback visual (placeholder, texto, ausência de logo). Tratar como lacuna a ser resolvida via Decision Log, não como conflito de conteúdo.

6. **Nome do documento de estilo vs. nome citado nos PRDs.**
   - PRD 00 (RF-SITE-020, RNF-SITE-008, seção 24 "Dependências de implementação") e o Sitemap (seção 18, tabela "Status documental das áreas" — linha "Identidade e componentes") referem-se a um documento chamado **"Style Guide CareerTwin"** como a fonte canônica de tokens e componentes.
   - O arquivo efetivamente fornecido e lido para esta extração chama-se **"Leitura do estilo visual"**. Não há, nos cinco documentos, uma afirmação explícita de que "Leitura do estilo visual" e "Style Guide CareerTwin" são o mesmo artefato — podem ser documentos distintos (um de leitura/briefing de marca, outro de especificação técnica de Design System) ou o mesmo documento com nomes diferentes em fases diferentes. Isto deve ser confirmado antes de tratar "Leitura do estilo visual" como substituto completo do "Style Guide CareerTwin" citado nos requisitos.

7. **Objetivo profissional / contexto-alvo: "especialidade" presente no Sitemap e ausente na Jornada do Usuário.**
   - Sitemap (seção 4.8, Contexto-alvo): campos incluem "área de interesse; cargo-alvo; **especialidade, quando aplicável**; senioridade desejada; até três sugestões de cargo; confirmação".
   - Jornada do Usuário (Etapa 8 — Objetivo profissional): lista apenas "área de interesse; cargo-alvo; senioridade desejada" — sem menção a "especialidade". Não é necessariamente uma contradição (a Jornada pode estar resumindo), mas é uma omissão que vale confirmar antes de definir o formulário definitivo de contexto-alvo, já que o campo é citado como obrigatório/condicional em outros pontos do Sitemap (ex.: seção 7, "Meu perfil › Contexto-alvo" e seção 9.2 "Análise de cargo-alvo").

Nenhuma das divergências acima foi resolvida nesta extração — conforme a regra repetida em todos os documentos-fonte ("o conflito deverá ser encaminhado ao Decision Log antes de alterar o comportamento do produto"), a resolução cabe ao Decision Log/Product Owner, não a uma escolha silenciosa na implementação.
