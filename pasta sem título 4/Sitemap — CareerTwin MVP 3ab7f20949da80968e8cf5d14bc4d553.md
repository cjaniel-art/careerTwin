# Sitemap — CareerTwin MVP

Criado em: 28 de julho de 2026 17:52

# Sitemap — CareerTwin MVP

Criado em: 28 de julho de 2026

Última atualização: 28 de julho de 2026

Versão: 1.1

Status: Mapa funcional de navegação do MVP

Este Sitemap organiza as páginas e os fluxos de navegação do CareerTwin.

Ele não substitui:

- os PRDs;
- a Arquitetura;
- o Modelo de Dados;
- as regras de negócio;
- os contratos de processamento;
- os critérios de aceite.

A estrutura separa claramente:

1. **Site público e autenticação**;
2. **Aplicação autenticada**;
3. **Onboarding, Thin Twin e contexto-alvo**;
4. **Core 1 — Análise de Perfil**;
5. **Core 2 — Diagnóstico de Aderência**;
6. **Funcionalidades de apoio**.

O produto possui exatamente dois módulos core:

- Core 1 — Análise de Perfil;
- Core 2 — Diagnóstico de Aderência.

Dashboard, perfil, histórico, ações, créditos, ofertas simuladas e conta são superfícies de apoio.

As rotas apresentadas nesta página são referências funcionais para navegação. Alterações técnicas de caminho devem preservar o comportamento, os redirecionamentos e os controles de acesso, além de manter este Sitemap e os PRDs sincronizados.

---

## 1. Visão geral do sitemap

```
CareerTwin
│
├── Site público
│   ├── Home / Landing Page
│   ├── Termos de Uso
│   └── Política de Privacidade
│
├── Autenticação
│   ├── Criar conta
│   ├── Entrar
│   ├── Recuperar senha
│   └── Redefinir senha
│
├── Onboarding
│   ├── Boas-vindas
│   ├── Identificação
│   ├── Envio do currículo
│   ├── Envio do LinkedIn
│   ├── Processamento
│   ├── Revisão do Thin Twin
│   ├── Confirmação do Thin Twin
│   ├── Contexto-alvo
│   └── Conclusão
│
├── Aplicação autenticada
│   ├── Dashboard
│   ├── Meu perfil
│   ├── Core 1 — Análise de Perfil
│   ├── Core 2 — Diagnóstico de Aderência
│   ├── Ações
│   ├── Histórico
│   ├── Créditos e oferta simulada
│   └── Conta
│
└── Páginas de sistema
    ├── Acesso não autorizado
    ├── Página não encontrada
    ├── Erro temporário
    └── Manutenção
```

A jornada recomendada será:

```
Site
→ Cadastro ou login
→ Onboarding
→ Confirmação do Thin Twin
→ Definição do contexto-alvo
→ Core 1
→ Core 2
→ Ações e reanálises
```

O Core 1 é recomendado antes do Core 2, mas não constitui uma dependência técnica obrigatória para o Core 2.

---

# 2. Site público

## 2.1 Home / Landing Page

**Rota funcional**

```
/
```

### Seções da página

```
Home
├── Header
├── Hero
├── Problema
├── Como funciona
├── Core 1 — Análise de Perfil
├── Core 2 — Diagnóstico de Aderência
├── O que o usuário recebe
├── Autenticidade e confiança
├── Limitações do produto
├── CTA final
└── Footer
```

### Navegação do header

- Como funciona;
- Análise de Perfil;
- Diagnóstico de Aderência;
- Entrar;
- Criar conta.

As três primeiras opções poderão direcionar para seções da própria Landing Page, sem exigir páginas públicas independentes.

### CTAs

Para visitante:

- Criar minha conta;
- Entrar;
- Ver como funciona.

Para usuário autenticado com onboarding pendente:

- Continuar onboarding.

Para usuário autenticado com onboarding concluído:

- Acessar dashboard.

A Home deve apresentar:

- proposta de valor;
- problema;
- funcionamento geral;
- Core 1;
- Core 2;
- princípios de autenticidade;
- limitações dos diagnósticos e scores;
- chamadas para cadastro e login.

O site não deverá apresentar dashboard, histórico, ações ou créditos como módulos core adicionais.

---

## 2.2 Termos de Uso

```
/termos
```

Conteúdo:

- condições de utilização;
- responsabilidades do usuário;
- limitações do CareerTwin;
- propriedade intelectual;
- regras da conta;
- condições relacionadas ao uso de inteligência artificial;
- suspensão e exclusão;
- informações jurídicas.

O conteúdo jurídico final permanece dependente de aprovação específica.

---

## 2.3 Política de Privacidade

```
/privacidade
```

Conteúdo:

- dados coletados;
- finalidades;
- bases de tratamento;
- serviços utilizados;
- retenção;
- exclusão;
- segurança;
- direitos do titular;
- contato de privacidade.

A página pública deve refletir a política vigente de Segurança, Privacidade e Retenção.

---

# 3. Autenticação

## 3.1 Criar conta

```
/cadastro
```

Conteúdo:

- e-mail;
- senha;
- confirmação dos Termos de Uso;
- confirmação da Política de Privacidade;
- consentimentos opcionais separados, quando aplicáveis;
- ação para criar conta;
- link para login.

Consentimentos opcionais não podem bloquear o acesso ao serviço principal.

Após o cadastro:

```
Cadastro concluído
        ↓
Verificação de e-mail, quando habilitada
        ↓
/onboarding
```

A obrigatoriedade de verificação de e-mail permanece sujeita à decisão registrada no Decision Log.

---

## 3.2 Login

```
/login
```

Conteúdo:

- e-mail;
- senha;
- mostrar ou ocultar senha;
- entrar;
- recuperar senha;
- link para cadastro.

### Redirecionamento

```
Login
│
├── Onboarding não concluído
│   └── /onboarding
│
└── Onboarding concluído
    └── /app/dashboard
```

Quando houver uma rota protegida de origem válida, o usuário poderá retornar a ela depois do login, desde que:

- a rota pertença à aplicação;
- o usuário possua autorização;
- as pré-condições da funcionalidade estejam atendidas;
- não exista redirecionamento externo arbitrário.

---

## 3.3 Recuperar senha

```
/recuperar-senha
```

Conteúdo:

- e-mail;
- enviar instruções;
- confirmação neutra;
- voltar para login.

A resposta não deverá revelar se o e-mail possui conta cadastrada.

---

## 3.4 Redefinir senha

```
/redefinir-senha
```

Conteúdo:

- nova senha;
- confirmação da senha;
- validação do link;
- mensagem de link inválido;
- mensagem de link expirado;
- confirmação da redefinição;
- ação para retornar ao login.

---

# 4. Onboarding

O onboarding poderá ser implementado como uma única rota com etapas internas.

Isso ajuda a:

- controlar a sequência pelo estado persistido;
- impedir avanço indevido por alteração de URL;
- permitir retomada;
- preservar checkpoints;
- evitar rotas diferentes para estados transitórios.

## Rota principal

```
/onboarding
```

## Estrutura interna

```
/onboarding
│
├── Etapa 1 — Boas-vindas
├── Etapa 2 — Identificação
├── Etapa 3 — Currículo
├── Etapa 4 — LinkedIn
├── Etapa 5 — Processamento
├── Etapa 6 — Revisão do Thin Twin
├── Etapa 7 — Confirmação do Thin Twin
├── Etapa 8 — Contexto-alvo
└── Etapa 9 — Conclusão
```

O passo atual deve ser controlado pelo estado persistido do onboarding, não somente por parâmetros presentes na URL.

---

## 4.1 Boas-vindas

```
/onboarding
```

Conteúdo:

- explicação da jornada;
- materiais necessários;
- uso das informações;
- princípios de autenticidade;
- possibilidade de sair e continuar depois;
- expectativa de processamento sem promessa de tempo exato;
- CTA para começar.

---

## 4.2 Identificação

Conteúdo:

- nome completo obrigatório;
- cidade opcional;
- estado opcional.

Não serão coletados no MVP:

- data de nascimento;
- CEP;
- logradouro;
- número;
- complemento;
- bairro;
- endereço residencial completo.

Nome, cidade e estado:

- permanecem separados do Thin Twin;
- não influenciam IPP;
- não influenciam IAO;
- não influenciam confiança;
- não influenciam recomendações.

---

## 4.3 Envio do currículo

Conteúdo:

- upload de PDF;
- upload de DOCX;
- texto colado;
- formatos e limites;
- progresso;
- validação;
- substituição;
- tratamento de erro;
- nova tentativa.

O currículo é obrigatório para concluir o onboarding.

---

## 4.4 Envio do LinkedIn

Conteúdo:

- PDF exportado;
- texto colado;
- URL opcional como referência;
- instruções de exportação;
- validação;
- substituição;
- tratamento de erro.

A URL:

- não será acessada automaticamente;
- não deve ser utilizada como única fonte da análise;
- não substitui o conteúdo obrigatório do LinkedIn.

---

## 4.5 Processamento

Conteúdo:

- validação;
- extração;
- OCR, quando necessário;
- normalização;
- identificação de conflitos;
- criação do rascunho do Thin Twin;
- processamento prolongado;
- extração parcial;
- falha recuperável;
- nova tentativa.

O processamento deverá continuar mesmo quando o usuário sair da página.

---

## 4.6 Revisão do Thin Twin

Estrutura:

```
Revisão do Thin Twin
├── Resumo
├── Conflitos e itens de atenção
├── Experiências
├── Projetos
├── Competências
├── Ferramentas
├── Formação
├── Certificações
└── Evidências
```

O usuário poderá:

- confirmar;
- editar;
- adicionar;
- remover;
- resolver divergências;
- consultar a fonte;
- consultar a confiança da extração.

Competências e ferramentas deverão permanecer separadas.

O contexto-alvo não integra o Thin Twin e não deve aparecer como um campo interno dessa revisão.

---

## 4.7 Confirmação do Thin Twin

Conteúdo:

- resumo das informações;
- conflitos críticos pendentes;
- nível de completude;
- indicação das fontes utilizadas;
- confirmação explícita;
- criação de versão imutável do Thin Twin.

Conflitos críticos devem bloquear a confirmação.

A confirmação não poderá transformar inferências não confirmadas em fatos profissionais.

---

## 4.8 Contexto-alvo

Conteúdo:

- área de interesse;
- cargo-alvo;
- especialidade, quando aplicável;
- senioridade desejada;
- até três sugestões de cargo;
- confirmação do contexto-alvo.

O contexto-alvo:

- é separado do Thin Twin;
- possui versionamento próprio;
- deve gerar uma `target_context_version`;
- pode ser alterado sem criar nova versão do Thin Twin.

As sugestões de cargo devem ser apresentadas como apoio à escolha, e não como carreira ideal ou definitiva.

---

## 4.9 Conclusão

Conteúdo:

- confirmação da conclusão do onboarding;
- resumo do Thin Twin;
- resumo do contexto-alvo;
- próximo passo;
- CTA para iniciar a Análise de Perfil.

Destino recomendado:

```
/app/analise-perfil
```

O Core 1 é o próximo passo recomendado, mas o Core 2 poderá ser acessado quando suas próprias pré-condições estiverem atendidas.

---

# 5. Estrutura da aplicação autenticada

## Rota base

```
/app
```

Essa rota deverá redirecionar para:

```
/app/dashboard
```

## Navegação principal

```
Aplicação
├── Início
├── Meu perfil
├── Análise de Perfil
├── Diagnóstico de Aderência
├── Ações
├── Histórico
├── Créditos
└── Conta
```

Somente os seguintes itens representam módulos core:

- Análise de Perfil;
- Diagnóstico de Aderência.

São superfícies de apoio:

- Início;
- Meu perfil;
- Ações;
- Histórico;
- Créditos;
- Conta.

Essas superfícies não deverão receber PRDs core adicionais nem ser apresentadas como novos módulos do produto.

---

# 6. Dashboard

## Rota

```
/app/dashboard
```

## Estrutura

```
Dashboard
├── Saudação e próxima ação
├── Estado do onboarding
├── Estado do Thin Twin
├── Contexto-alvo atual
├── Última Análise de Perfil
├── Último IPP concluído
├── Último Diagnóstico de Aderência
├── Vagas analisadas
├── Ações pendentes
├── Ações em andamento
├── Ações concluídas
├── Créditos disponíveis
├── Histórico recente
└── Atalhos
```

## Atalhos

- Atualizar meu perfil;
- Alterar contexto-alvo;
- Fazer Análise de Perfil;
- Analisar cargo-alvo;
- Analisar uma vaga;
- Ver ações;
- Ver histórico;
- Fazer reanálise.

O dashboard deve:

- apoiar Core 1 e Core 2;
- refletir estados persistidos pelo backend;
- não recalcular scores;
- não alterar relatórios anteriores;
- não funcionar como fonte de verdade operacional;
- não ser apresentado como módulo core.

---

# 7. Meu perfil

## Rota principal

```
/app/perfil
```

## Subáreas

```
/app/perfil
├── /resumo
├── /experiencias
├── /projetos
├── /competencias
├── /ferramentas
├── /formacao
├── /certificacoes
├── /contexto-alvo
├── /documentos
└── /versoes
```

Os caminhos internos poderão ser implementados como:

- rotas;
- abas;
- estados internos da página.

A escolha técnica deverá preservar o comportamento descrito.

### Resumo

- cargo atual observado;
- área atual observada;
- senioridade observável;
- contexto-alvo atual;
- completude;
- alertas;
- última atualização.

### Experiências

- empresas;
- cargos;
- períodos;
- responsabilidades;
- projetos;
- resultados;
- evidências.

### Projetos

- projetos profissionais;
- projetos acadêmicos;
- projetos pessoais relevantes;
- competências relacionadas;
- ferramentas relacionadas.

### Competências

- competências confirmadas;
- domínio;
- tipo;
- experiências relacionadas;
- evidências.

### Ferramentas

- tecnologias;
- plataformas;
- frameworks;
- softwares;
- categoria;
- experiências relacionadas.

### Formação e certificações

- cursos;
- instituições;
- períodos;
- situação;
- certificações.

### Contexto-alvo

- área de interesse;
- cargo-alvo;
- especialidade;
- senioridade desejada;
- versão atual;
- histórico de versões.

O contexto-alvo deverá permanecer separado do Thin Twin.

### Documentos

- currículo atual;
- LinkedIn atual;
- estado dos materiais;
- substituir material;
- data do último processamento.

Arquivos originais já excluídos não deverão ser disponibilizados novamente.

A página poderá mostrar:

- metadados;
- estado do documento;
- versão;
- conteúdo estruturado correspondente.

### Versões

Apresentar separadamente:

#### Versões do Thin Twin

- versão;
- data;
- origem da alteração;
- análises relacionadas;
- estado de confirmação.

#### Versões do contexto-alvo

- versão;
- data;
- cargo;
- especialidade;
- senioridade desejada;
- análises relacionadas.

Alterações do contexto-alvo não devem criar uma nova versão do Thin Twin.

---

# 8. Core 1 — Análise de Perfil

## Rota principal

```
/app/analise-perfil
```

## Sitemap interno

```
/app/analise-perfil
├── Página inicial
├── Processamento
├── Resultado
├── Recomendações
├── Tradução da experiência
├── Plano de evolução
└── Comparação de reanálise
```

---

## 8.1 Entrada da análise

```
/app/analise-perfil
```

Conteúdo:

- objetivo da análise;
- versão do Thin Twin;
- versão do contexto-alvo;
- cargo-alvo;
- senioridade desejada;
- pré-condições;
- última análise;
- CTA para iniciar;
- CTA para revisar o perfil;
- CTA para alterar o contexto-alvo.

O sistema deve bloquear a análise quando faltar:

- Thin Twin confirmado;
- contexto-alvo válido;
- qualquer outra pré-condição definida no PRD 02.

---

## 8.2 Processamento

```
/app/analise-perfil/processando/[analysisId]
```

Conteúdo:

- estado funcional atual;
- mensagem de processamento;
- possibilidade de sair;
- preservação do progresso;
- link para análise anterior;
- tratamento de falha;
- informação de que falhas técnicas não consomem créditos.

---

## 8.3 Resultado

```
/app/analise-perfil/[analysisId]
```

Estrutura:

```
Resultado do Core 1
├── Resumo executivo
├── IPP
├── Confiança
├── Dimensões
├── Pontos fortes
├── Fragilidades
├── Recomendações
├── Tradução da experiência
├── Plano de evolução
├── Evidências
└── Feedback
```

O IPP e a confiança deverão ser apresentados separadamente.

O resultado não poderá:

- apresentar IPP como chance de contratação;
- alterar relatórios anteriores;
- recalcular scores no frontend.

---

## 8.4 Comparação de reanálise

```
/app/analise-perfil/comparar/[analysisId]
```

Conteúdo:

- IPP anterior;
- IPP atual;
- diferença por dimensão;
- melhorias;
- lacunas resolvidas;
- novas lacunas;
- ações concluídas;
- confiança anterior;
- confiança atual;
- versões de Thin Twin e contexto-alvo utilizadas.

A comparação somente deverá ser apresentada quando os resultados forem funcionalmente comparáveis.

---

# 9. Core 2 — Diagnóstico de Aderência

## Rota principal

```
/app/aderencia
```

## Sitemap interno

```
/app/aderencia
├── Escolher tipo de análise
├── Analisar cargo-alvo
├── Analisar vaga específica
├── Revisar vaga
├── Processamento
├── Resultado
└── Comparação de reanálise
```

O acesso ao Core 2 não depende tecnicamente da conclusão do Core 1.

O Core 2 depende das pré-condições específicas definidas pelo PRD 03.

---

## 9.1 Escolha do tipo de análise

```
/app/aderencia
```

Opções:

- Analisar cargo-alvo;
- Analisar vaga específica.

A página deverá explicar a diferença entre:

- uma referência de cargo;
- uma descrição concreta de vaga.

---

## 9.2 Análise de cargo-alvo

```
/app/aderencia/cargo
```

Conteúdo:

- contexto-alvo atual;
- cargo-alvo;
- especialidade;
- senioridade desejada;
- referência de cargo utilizada;
- versão da referência;
- limitações da referência;
- CTA para iniciar;
- CTA para alterar contexto-alvo.

Somente uma referência de cargo com status aprovado poderá gerar um diagnóstico definitivo.

Quando não existir referência aprovada:

- o sistema deverá apresentar dados insuficientes;
- não deverá calcular IAO definitivo;
- deverá permitir alteração do contexto-alvo;
- não deverá criar uma referência silenciosamente.

---

## 9.3 Nova análise de vaga

```
/app/aderencia/vaga/nova
```

Conteúdo:

- título da vaga;
- empresa;
- URL opcional;
- texto colado;
- upload de PDF;
- validação;
- limites;
- saldo simulado;
- informação sobre consumo do crédito;
- CTA para continuar.

A URL:

- será somente uma referência;
- não será acessada automaticamente;
- não substituirá o texto ou PDF da vaga.

---

## 9.4 Revisão da vaga

```
/app/aderencia/vaga/[jobId]/revisao
```

Estrutura:

```
Revisão da vaga
├── Resumo
├── Responsabilidades
├── Requisitos obrigatórios
├── Requisitos desejáveis
├── Diferenciais
├── Complementares
├── Impeditivos
├── Requisitos ambíguos
├── Senioridade
├── Localização e modalidade
└── Confirmação
```

O usuário poderá:

- corrigir requisitos;
- alterar uma criticidade incorreta;
- marcar um requisito como não aplicável;
- revisar ambiguidades;
- confirmar a oportunidade.

Cidade e estado do cadastro pessoal não devem ser utilizados para calcular aderência geográfica.

Condições de localização ou modalidade somente poderão utilizar informações fornecidas especificamente para o contexto da oportunidade.

---

## 9.5 Processamento

```
/app/aderencia/processando/[analysisId]
```

Conteúdo:

- comparação em andamento;
- análise de requisitos;
- cálculo determinístico do IAO;
- análise de riscos;
- validação da recomendação;
- tratamento de falha;
- possibilidade de sair;
- informação de que falhas técnicas não consomem créditos.

---

## 9.6 Resultado

```
/app/aderencia/[analysisId]
```

Estrutura:

```
Resultado do Core 2
├── Resumo executivo
├── IAO
├── Confiança
├── Recomendação
├── Requisitos
├── Pontos fortes
├── Lacunas
├── Senioridade
├── Riscos e bloqueadores
├── Plano de ações
├── Evidências
├── Intenção de candidatura
└── Feedback
```

A saída deverá apresentar exatamente uma recomendação compatível com o tipo da análise:

- recomendação de vaga; ou
- recomendação de cargo-alvo.

O IAO e a confiança deverão permanecer separados.

O resultado não poderá apresentar o IAO como probabilidade de entrevista, aprovação ou contratação.

---

## 9.7 Comparação

```
/app/aderencia/comparar/[analysisId]
```

Disponível somente quando as análises utilizarem:

- a mesma vaga e estrutura de requisitos compatível; ou
- a mesma referência de cargo.

Não deverão ser comparadas como evolução direta:

- duas vagas diferentes;
- referências de cargo diferentes;
- resultados sem compatibilidade suficiente.

---

# 10. Ações

## Rota

```
/app/acoes
```

## Estrutura

```
Ações
├── Todas
├── Pendentes
├── Em andamento
├── Concluídas
├── Core 1
└── Core 2
```

Cada ação deve apresentar:

- título;
- origem;
- tipo de análise;
- prioridade;
- horizonte ou prazo;
- critério de sucesso;
- status;
- análise relacionada.

Estados:

- pendente;
- em andamento;
- concluída.

Alterar o status de uma ação:

- não altera retroativamente IPP;
- não altera retroativamente IAO;
- não altera a recomendação emitida;
- não consome crédito.

Uma nova avaliação exige reanálise.

---

# 11. Histórico

## Rota

```
/app/historico
```

## Estrutura

```
Histórico
├── Todas as análises
├── Análises de Perfil
├── Análises de cargo
├── Análises de vaga
├── Reanálises
├── Versões do Thin Twin
└── Versões do contexto-alvo
```

Cada análise deverá mostrar:

- tipo;
- título;
- data;
- score;
- confiança;
- versão do Thin Twin;
- versão do contexto-alvo, quando aplicável;
- versão da vaga ou referência;
- status;
- ação para ver resultado;
- ação para realizar reanálise, quando elegível.

Abrir um relatório já gerado não deverá consumir crédito.

Análises anteriores não deverão ser sobrescritas.

---

# 12. Créditos e oferta

## Rota

```
/app/creditos
```

## Conteúdo do MVP

- saldo simulado;
- créditos utilizados;
- histórico de reservas, consumos e restaurações;
- análise gratuita utilizada;
- oferta simulada;
- confirmação da intenção de compra.

### Oferta simulada

```
Pacote Novas Oportunidades
R$ 29,90
5 créditos
Validade exibida de 30 dias
```

Preço, quantidade de créditos e validade são hipóteses de monetização.

Não haverá:

- checkout;
- cartão;
- cobrança;
- assinatura;
- pagamento real;
- integração com meio de pagamento.

O usuário poderá apenas confirmar intenção de compra.

### Regras

- o ledger será a fonte de verdade dos créditos;
- falhas técnicas não consumirão créditos;
- retentativas técnicas não consumirão créditos;
- relatórios já gerados permanecerão acessíveis;
- abrir um relatório não consumirá crédito;
- restaurar crédito deverá gerar uma nova transação;
- a ausência de saldo não deverá bloquear o acesso ao histórico.

A política de reanálise gratuita da mesma vaga continua pendente e não deverá ser definida por esta página.

---

# 13. Conta

## Rota

```
/app/conta
```

## Estrutura

```
Conta
├── Informações da conta
├── Segurança
├── Privacidade
├── Consentimentos
├── Sair
└── Excluir conta
```

### Informações da conta

- e-mail;
- nome;
- cidade opcional;
- estado opcional.

Não apresentar:

- data de nascimento;
- CEP;
- endereço residencial completo.

### Segurança

- alterar senha;
- visualizar ou revogar sessões, quando suportado;
- sair da conta.

### Privacidade

- Termos de Uso;
- Política de Privacidade;
- consentimentos;
- informações sobre retenção;
- informações sobre o uso de inteligência artificial;
- solicitação de exclusão.

### Exclusão

- confirmação explícita;
- consequências;
- status da solicitação;
- prazo dos sistemas ativos;
- tratamento dos backups;
- falha de processamento;
- conclusão.

A exclusão da conta deverá seguir o PRD 00 e a política vigente de Segurança, Privacidade e Retenção.

---

# 14. Páginas de sistema

## Acesso não autorizado

```
/403
```

## Página não encontrada

```
/404
```

## Erro temporário

```
/erro
```

## Manutenção

```
/manutencao
```

Essas páginas devem:

- explicar o estado;
- preservar o tom de voz do CareerTwin;
- apresentar ação de recuperação;
- não exibir detalhes técnicos sensíveis;
- não expor informações de outros usuários;
- não revelar credenciais, tokens ou identificadores internos;
- oferecer retorno seguro para Home, login ou dashboard, conforme o contexto.

---

# 15. Navegação recomendada

## Header público

```
Logo
Como funciona
Análise de Perfil
Diagnóstico de Aderência
Entrar
Criar conta
```

## Sidebar autenticada

```
Início
Meu perfil
Análise de Perfil
Diagnóstico de Aderência
Ações
Histórico
Créditos
Conta
```

## Menu mobile autenticado

Utilizar os mesmos itens da sidebar em um `Sheet` ou menu lateral.

Uma eventual barra inferior poderá conter somente:

```
Início
Perfil
Analisar
Ações
Menu
```

A escolha final entre sidebar, menu lateral e barra inferior é uma decisão de interface.

Ela deverá:

- respeitar o Style Guide CareerTwin;
- funcionar com teclado;
- possuir foco visível;
- utilizar rótulos textuais;
- não depender apenas de ícones;
- preservar acesso aos mesmos destinos.

---

# 16. Regras de acesso e redirecionamento

```
Visitante acessa rota protegida
        ↓
/login?redirect=rota-original
```

```
Usuário autenticado sem onboarding concluído
        ↓
/onboarding
```

```
Usuário autenticado com onboarding concluído
        ↓
/app/dashboard
```

```
Usuário tenta acessar Core 1 sem Thin Twin confirmado
        ↓
/onboarding ou /app/perfil
```

```
Usuário tenta acessar Core 1 sem contexto-alvo válido
        ↓
/app/perfil/contexto-alvo
```

```
Usuário tenta acessar Core 2 sem Thin Twin confirmado
        ↓
/onboarding ou /app/perfil
```

```
Usuário tenta analisar cargo sem contexto-alvo
        ↓
/app/perfil/contexto-alvo
```

```
Usuário tenta analisar cargo sem referência aprovada
        ↓
Estado de dados insuficientes
```

```
Usuário tenta analisar vaga sem conteúdo válido
        ↓
/app/aderencia/vaga/nova
```

```
Usuário tenta iniciar análise de vaga sem crédito disponível
        ↓
/app/creditos
```

A falta de crédito não deve impedir o usuário de:

- abrir análises anteriores;
- consultar histórico;
- atualizar ações;
- enviar feedback;
- atualizar o perfil;
- alterar o contexto-alvo.

### Regras gerais

- autorização deve ser validada no backend;
- o frontend não deve ser a única proteção;
- o usuário não pode acessar recursos de outro usuário;
- o backend não deve confiar em um `user_id` enviado livremente pelo cliente;
- redirecionamentos externos arbitrários não são permitidos;
- Core 1 não é pré-condição técnica obrigatória do Core 2.

---

# 17. Mapa consolidado de rotas

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

### Regra para implementação

O Claude Code deverá utilizar este mapa como referência de navegação, mas não deverá:

- criar páginas fora do escopo;
- criar um terceiro módulo core;
- alterar os requisitos definidos pelos PRDs;
- transformar uma subárea em funcionalidade independente sem decisão;
- resolver silenciosamente conflitos de rota;
- incluir pagamento real;
- incluir candidatura automática;
- incluir funcionalidades posteriores à decisão de candidatura.

Quando uma escolha técnica exigir alteração de rota:

1. preservar o comportamento;
2. preservar a proteção de acesso;
3. atualizar os links internos;
4. atualizar os redirecionamentos;
5. atualizar os eventos aplicáveis;
6. sincronizar o Sitemap e os PRDs;
7. registrar a decisão quando material.

---

# 18. Status documental das áreas

| Área | Documento principal |
| --- | --- |
| Site público, Home e autenticação | PRD 00 |
| Onboarding, documentos e processamento | PRD 01 |
| Thin Twin | Thin Twin e PRD 01 |
| Contexto-alvo | PRD 01 e Thin Twin |
| Análise de Perfil | PRD 02 |
| Diagnóstico de Aderência | PRD 03 |
| IPP e IAO | Motor de Análise e Scores |
| Prompts e contratos de IA | Prompts e Schemas |
| Guardrails | Guardrails |
| Dashboard | Product One Page e requisitos distribuídos |
| Meu perfil | PRD 01 e Product One Page |
| Ações | PRD 02, PRD 03 e Product One Page |
| Histórico | PRD 01, PRD 02, PRD 03 e Product One Page |
| Créditos e oferta simulada | Product One Page, Escopo do MVP e PRD 03 |
| Conta e exclusão | PRD 00 e Privacidade e Segurança |
| Rotas e navegação | Sitemap e Arquitetura |
| Dados e relacionamentos | Modelo de Dados |
| Segurança e retenção | Privacidade e Segurança |
| Eventos de produto | Analytics |
| Falhas operacionais | Incidentes |
| Casos de teste | Qualidade da IA e Casos de Teste |
| Identidade e componentes | Style Guide CareerTwin |

### Regra documental

O Sitemap define:

- hierarquia de navegação;
- agrupamento de páginas;
- destinos;
- visibilidade das áreas;
- regras gerais de redirecionamento.

O Sitemap não define:

- fórmula de score;
- regra de recomendação;
- schema de IA;
- estrutura definitiva do banco;
- processamento assíncrono;
- retenção;
- consumo de créditos;
- critérios funcionais detalhados.

Essas definições permanecem nos respectivos documentos canônicos.

Em caso de divergência, a implementação não deverá escolher silenciosamente uma interpretação. O conflito deverá ser encaminhado ao Decision Log antes de alterar o comportamento do produto.