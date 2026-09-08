# Módulo de Cessão — SIGEP

## 1. Objetivo

Este documento registra a evolução funcional e de produto do módulo de Cessão do SIGEP. Deve ser atualizado durante a prototipação sempre que uma decisão for tomada, revista ou implementada.

O SIGEP substituirá o SEAP como sistema oficial de registro da vida funcional. Neste desenho, a aprovação e a efetivação da cessão passam a produzir diretamente os registros funcionais no SIGEP.

## 2. Fontes e limites

Fonte normativa inicial: **Manual de Cessão e Remoção dos Servidores Públicos Efetivos do Poder Executivo do Estado de Mato Grosso — 4ª edição, setembro de 2023**.

O manual fundamenta o fluxo administrativo, os participantes, os documentos, a publicação e os efeitos funcionais. Ele não define telas, APIs, modelo de permissões, arquitetura técnica nem os detalhes do futuro SIGEP. Esses elementos são decisões de produto e deverão ser validados com as áreas responsáveis.

Pontos operacionais posteriores a 2023 precisam ser confirmados antes da implantação em produção.

## 3. Escopo atual

O módulo será responsável por:

- cessão interna;
- cessão externa;
- solicitação e instrução;
- confirmação pelo órgão cedente;
- aprovação pela SEPLAG;
- publicação;
- efetivação na vida funcional;
- acompanhamento da vigência;
- prorrogação;
- retificação;
- devolução e encerramento;
- histórico e auditoria.

Nesta fase, foi iniciada apenas a listagem de cessões.

## 4. Fluxo simplificado aprovado

```text
SOLICITANTE — ÓRGÃO CESSIONÁRIO
Solicita a cessão
              ↓
SOLICITADO — ÓRGÃO CEDENTE
Confirma ou recusa a cessão
              ↓
SEPLAG
Aprova ou reprova a cessão
              ↓
PUBLICAÇÃO
              ↓
CESSÃO ATIVA
```

Segundo o manual, o processo começa pelo órgão cessionário, que protocola o pedido junto ao órgão de origem do servidor.

## 5. Perfis de acesso

### 5.1. Solicitante — órgão cessionário

Representa o órgão que pretende receber o servidor.

Responsabilidades planejadas:

- criar a solicitação;
- informar servidor, destino, motivo e período;
- anexar ou vincular documentos;
- enviar ao órgão cedente;
- corrigir solicitações devolvidas;
- acompanhar o processo.

### 5.2. Solicitado — órgão cedente

Representa o órgão de origem do servidor.

Responsabilidades planejadas:

- conferir a situação funcional;
- verificar documentos e impedimentos;
- consolidar a análise interna;
- confirmar, recusar ou devolver a solicitação.

A confirmação deverá representar a instrução pela Gestão de Pessoas, a manifestação interna necessária e a autorização da autoridade competente, mesmo que esses participantes não recebam perfis separados no primeiro protótipo.

### 5.3. SEPLAG

Representa o órgão central de Gestão de Pessoas.

Responsabilidades planejadas:

- analisar a instrução;
- verificar regras e impedimentos;
- aprovar, reprovar ou devolver;
- controlar a formalização e a publicação;
- efetivar a cessão no SIGEP após a publicação.

## 6. Decisões de produto

### 6.1. Entrada no módulo

O menu principal contém:

```text
Movimentação
└── Cessão
```

O item está posicionado imediatamente abaixo de Controle de Vagas.

### 6.2. Tipo de cessão

Ao iniciar uma nova solicitação, o usuário escolherá entre:

- interna;
- externa.

O SIGEP deverá validar essa escolha usando a classificação do órgão cessionário. A cessão é interna quando cedente e cessionário integram o Poder Executivo Estadual; caso contrário, é externa.

### 6.3. SIGEP como sistema de registro

Não haverá etapa de “lançamento no SEAP”. Após a aprovação e publicação, o próprio SIGEP deverá:

- ativar a cessão;
- alterar o órgão e a unidade de exercício;
- preservar lotação, vínculo e vaga ocupada;
- registrar o evento na vida funcional;
- aplicar a responsabilidade financeira autorizada;
- manter o histórico da movimentação.

### 6.4. Usuário do protótipo

Durante a prototipação, a tela de listagem possui um seletor de usuário no canto superior direito, na mesma linha do breadcrumb.

Esse seletor existe exclusivamente para testes e demonstrações. Ele simula:

- perfil;
- órgão de atuação;
- escopo de registros visíveis;
- tarefas aguardando a ação do perfil;
- disponibilidade do botão de nova solicitação.

No sistema definitivo, não haverá troca manual de usuário nessa tela. Usuário, órgão, perfis e permissões serão obtidos da autenticação e das autorizações do usuário logado.

## 7. Listagem de cessões

### 7.1. Estrutura implementada

- breadcrumb `Movimentação > Cessão`;
- seletor de usuário do protótipo;
- indicadores;
- pesquisa textual;
- filtro por tipo de cessão;
- filtro por situação;
- limpeza de filtros;
- tabela paginada;
- badges de situação;
- ação contextual por registro;
- dados demonstrativos.

### 7.2. Indicadores

- Aguardando minha ação;
- Em andamento;
- Aguardando publicação;
- Cessões ativas.

Os totais respeitam o usuário simulado.

### 7.3. Visibilidade por perfil

- Cessionário: visualiza cessões em que seu órgão é o destinatário.
- Cedente: visualiza cessões em que seu órgão é a origem.
- SEPLAG: visualiza todas as cessões.

### 7.4. Colunas

- servidor e matrícula;
- tipo;
- cessionário;
- cedente;
- período;
- etapa atual;
- situação;
- ações.

### 7.5. Ações ainda não implementadas

Os botões de nova solicitação, análise e visualização ainda não possuem telas próprias. No protótipo atual, apenas informam que a funcionalidade será criada em etapa posterior.

## 8. Situações consideradas

- Rascunho;
- Aguardando confirmação do cedente;
- Devolvida para correção;
- Aguardando aprovação da SEPLAG;
- Aguardando publicação;
- Publicada — aguardando início;
- Ativa;
- Em prorrogação;
- Encerrada.

Esta relação ainda poderá ser revista quando as telas de solicitação, análise, publicação, prorrogação e encerramento forem detalhadas.

## 9. Pendências

- definir o formulário de nova solicitação;
- detalhar diferenças entre cessão interna e externa;
- definir os documentos obrigatórios por modalidade;
- definir a tela de confirmação do cedente;
- definir a tela de aprovação da SEPLAG;
- definir publicação e assinatura do ato;
- definir apresentação do servidor no destino;
- definir prorrogação e encerramento;
- confirmar regras financeiras com Folha e Financeiro;
- confirmar regras por carreira;
- definir autenticação e autorização reais;
- validar integrações com SIGADOC e PAEP/DOE.

## 10. Histórico de alterações

### 04/09/2026

- Criado o menu `Movimentação > Cessão`.
- Posicionado o menu abaixo de Controle de Vagas.
- Criada a listagem inicial de cessões.
- Adicionados indicadores, filtros, tabela, situações e dados demonstrativos.
- Adicionado seletor de usuário exclusivo do protótipo.
- Aplicado escopo de registros e tarefas conforme usuário, órgão e perfil simulados.
- Registrado que o produto final utilizará o usuário autenticado, sem troca manual na página.
- Corrigida a grade dos indicadores para quatro colunas no desktop, duas em telas médias e uma em telas pequenas.
- Consolidados órgão cedente e órgão cessionário na coluna `Movimentação`.
- Corrigidas as quebras de palavras e definidas larguras mínimas para preservar a leitura da tabela.
- Simplificado o seletor de usuário do protótipo, mantendo perfil e órgão no texto de apoio.
- Ajustados o botão de limpar filtros e as ações contextuais por perfil e situação.
- Compactado o seletor de usuário do protótipo para caber na mesma faixa visual do `BreadcrumbSeplag`.
- Removidos os nomes pessoais do seletor do protótipo; o controle apresenta somente os perfis `Cessionário`, `Cedente` e `SEPLAG`.
- Alterado o campo de pesquisa para `Nome, CPF, matrícula` e removida a coluna `Solicitação` da listagem.
- Substituída a coluna `Movimentação` pelas colunas `Cessionário` e `Cedente`, com filtros independentes por órgão.
- Adicionado o filtro `Etapa atual`; os filtros foram ordenados conforme as colunas e o botão `Limpar filtros` passou a ocupar a mesma faixa no desktop.
- Adicionado espaçamento entre a faixa de filtros e a tabela de resultados.
- Removido o vínculo da apresentação do servidor; a busca passou a considerar somente nome e matrícula.
- Alinhado à esquerda o botão `Nova solicitação de cessão`.
- Definido o subtítulo da listagem: `Solicite, acompanhe e gerencie os processos de cessão de servidores.`
## 11. Nova solicitação de cessão

Ao acionar `Nova solicitação de cessão`, o sistema abre um modal de escolha da modalidade. Cada modalidade possui rota própria:

- cessão interna: `/prototipos/sigep/movimentacao/cessoes/nova/interna`;
- cessão externa: `/prototipos/sigep/movimentacao/cessoes/nova/externa`.

A tela de cessão interna foi organizada nas etapas:

1. Servidor;
2. Destino;
3. Dados da cessão;
4. Documentos;
5. Revisão.

A implementação contempla, com base no manual, seleção do servidor e vínculo, órgão cedente, unidade de exercício no cessionário, hipótese da cessão, cargo ou função, atividades, motivação, período, ônus da cessão interna, documentos por responsabilidade e envio ao órgão cedente. Também informa a antecedência mínima de 60 dias, o limite de cinco anos e a proibição de afastamento antes da publicação.

A tela externa possui somente rota e estado reservado. Seus campos específicos ainda serão detalhados antes da implementação.

- Refinada a tela de cessão interna: painel mais compacto, busca reduzida, aviso simplificado, etapas progressivas e orientação inicial para seleção do servidor.

- Removida da etapa Servidor a orientação textual exibida abaixo da busca antes da seleção.

- A etapa Servidor passou a separar pessoa e vínculo ativo; admite dois vínculos somente como exceção para exercício de cargo em comissão e exige a opção remuneratória prevista no Manual.

- Ajustado o alinhamento das etapas para manter o ícone imediatamente ao lado do número e do título.
