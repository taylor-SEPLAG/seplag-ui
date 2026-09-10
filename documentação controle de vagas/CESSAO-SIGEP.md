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

- manter e validar as questões registradas em `movimentação/cessão/DÚVIDAS.md`;

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

- Corrigida falha de renderização ao selecionar servidor com dois vínculos, causada pela ausência dos campos tipados e do cálculo dos vínculos selecionados.

- A seleção passou a listar todos os vínculos ativos da pessoa e permite escolher até dois vínculos específicos para serem abrangidos pela cessão.

- Corrigida a tela branca ao exibir vínculos: o componente de múltipla seleção estava sendo utilizado sem a respectiva importação na página do protótipo.

- Adicionado resumo progressivo em acordeão: cada etapa exibe os dados consolidados das etapas anteriores e permite retornar para edição.


- A etapa Documentos passou a permitir a vinculação manual do número do processo SIGADOC por modal. Esta solução é provisória e poderá ser substituída por integração automática com o SIGADOC.

- Corrigido o envio indevido ao vincular o processo SIGADOC: o formulário somente aceita submissão final na etapa 5 (Revisão).

- A navegação entre as etapas foi desacoplada da submissão HTML: Continuar na etapa 4 apenas abre a etapa 5, e o envio final ocorre exclusivamente pelo botão da Revisão.

- A etapa Revisão foi reorganizada em blocos editáveis de Servidor, Destino, Dados da cessão e Documentos; passou a consolidar hipótese, atividades, motivação, cargo/função e processo SIGADOC, bloqueando o envio enquanto o documento obrigatório não estiver vinculado.

- Removidos todos os registros simulados de cessão da listagem dos perfis Cessionário, Cedente e SEPLAG; indicadores e tabela passam a iniciar zerados/vazios.

- Substituído o alerta nativo após o envio por modal de confirmação no padrão do SIGEP, com mensagem de sucesso, número do processo SIGADOC e retorno controlado à listagem.

- As solicitações enviadas passaram a ser persistidas no armazenamento do protótipo e compartilhadas entre os perfis. O registro nasce em `AGUARDANDO_CEDENTE`, aparece para o cessionário como acompanhamento e para o respectivo órgão cedente como ação pendente.

## Planejamento da análise pelo órgão cedente

Situação atual: somente a listagem por perfil e a persistência da solicitação foram implementadas. A tela de análise/decisão do órgão cedente ainda não existe.

Fluxo proposto com base no Manual de Cessão e Remoção:

1. o Cedente abre uma solicitação em `AGUARDANDO_CEDENTE`;
2. confere integralmente os dados enviados pelo Cessionário e o processo SIGADOC;
3. a Unidade Sistêmica de Gestão de Pessoas analisa o pedido e instrui os autos;
4. registra ou vincula a manifestação da unidade de lotação;
5. registra ou vincula a manifestação técnica da área setorial;
6. submete a decisão ao dirigente máximo do órgão ou entidade cedente;
7. se autorizada, encaminha a solicitação à SEPLAG em `AGUARDANDO_SEPLAG`;
8. se houver insuficiência, devolve ao Cessionário para correção, com justificativa;
9. se indeferida, encerra a análise com decisão e motivação registradas.

Estrutura planejada para a tela:

- cabeçalho com identificação, situação e etapa atual;
- resumo somente leitura das etapas preenchidas pelo Cessionário;
- painel de verificações funcionais e impedimentos;
- seção de documentos sob responsabilidade do Cedente;
- seção de decisão do dirigente máximo;
- histórico e rastreabilidade;
- ações `Devolver para correção`, `Indeferir` e `Autorizar e encaminhar à SEPLAG`.

Pontos do manual que precisam ser refletidos:

- análise e instrução pela Unidade Sistêmica de Gestão de Pessoas;
- deliberação do dirigente máximo do Cedente;
- compatibilidade de atribuições quando o servidor estiver em estágio probatório;
- impedimento por evento concomitante incompatível;
- manifestação da unidade de lotação;
- manifestação técnica da área setorial;
- despacho de autorização ou indeferimento;
- encaminhamento à SEPLAG somente após autorização e instrução documental.
- Implementada a página de análise do órgão cedente, com conferência dos dados recebidos, verificações funcionais, referências dos documentos no SIGADOC e decisões persistidas de devolução, indeferimento ou autorização com encaminhamento à SEPLAG.

- Corrigida a tela branca ao abrir a análise do Cedente: os campos de verificação passaram a compartilhar corretamente o `react-hook-form control` exigido pelo componente `RadioButtonFieldSeplag`.

## Auditoria do que o Cedente deve verificar

A tela do Cedente deve operacionalizar os seguintes pontos do Manual de Cessão e Remoção, sem transformar automaticamente a análise discricionária em aprovação:

### Pedido recebido

- presença do ofício de solicitação;
- motivação e interesse público;
- hipótese da cessão;
- período determinado e limite de cinco anos;
- antecedência mínima de 60 dias;
- órgão e unidade de exercício, com seu código;
- atividades a serem desempenhadas;
- definição do ônus e do reembolso, quando aplicável;
- atos anteriores, quando se tratar de prorrogação.

### Servidor e vínculo

- vínculo efetivo ou emprego público abrangido pelas regras; não há cessão de exclusivamente comissionado ou temporário;
- situação funcional e vida funcional atualizadas;
- ausência de evento concomitante impeditivo;
- eventual obrigação de permanência após licença para qualificação;
- impedimento por PAD quando a legislação da carreira assim determinar, com declaração quando exigida;
- permissão e regras específicas da carreira;
- estágio probatório: somente cessão interna e compatibilidade entre atribuições;
- dois vínculos: exercício de cargo em comissão, seleção dos vínculos, opção remuneratória e manifestação do servidor;
- regra própria para militar, inclusive hipótese de agregação.

### Ônus

- aplicação da regra geral conforme cessão interna ou externa;
- identificação das exceções por carreira, órgão, finalidade e fonte de recursos;
- necessidade de manifestação dos órgãos nos casos especiais;
- existência e regularidade do reembolso quando aplicável.

### Instrução e decisão do Cedente

- manifestação da unidade de lotação;
- manifestação técnica da área setorial;
- despacho de autorização ou indeferimento pelo dirigente máximo ou delegado com delegação publicada;
- processo SIGADOC devidamente instruído;
- encaminhamento à SEPLAG somente quando autorizado e completo;
- orientação de que o servidor não pode se afastar antes da publicação no DOE.

### Ajustes necessários na tela implementada

- substituir verificações genéricas por itens objetivos;
- oferecer respostas `Sim`, `Não` e `Não se aplica`;
- exibir automaticamente condições conhecidas do cadastro funcional;
- tornar estágio probatório, PAD, dois vínculos, militar e regras especiais condicionais;
- incluir despacho opcional de solicitação de manifestação da unidade de lotação;
- registrar evidência, fundamento e observação nas verificações relevantes;
- não tratar todos os itens como aprovação automática: a autorização permanece decisão do dirigente máximo.
- Replanejada e implementada a análise do órgão cedente em quatro blocos correspondentes às etapas recebidas: Servidor e vínculos, Destino, Dados da cessão e Documentos. Cada bloco pode ser aprovado ou devolvido para correção, com comentário obrigatório. O encaminhamento à SEPLAG somente é liberado após a aprovação integral e a vinculação da manifestação da lotação, manifestação técnica e despacho do dirigente. O indeferimento permanece uma decisão separada e fundamentada.


- Implementada a tela de correção do Cessionário na rota /prototipos/sigep/movimentacao/cessoes/:id/corrigir: abre na primeira etapa devolvida, sinaliza etapas com alerta, exibe os comentários do Cedente, mantém etapas aprovadas somente para consulta, exige a conclusão de todas as correções e reencaminha os blocos alterados como 'Revisar novamente'.


- Regra revisada para reenvio após correção: ao retornar ao Cedente, todos os blocos da análise recebem o estado 'Revisar novamente', inclusive os aprovados no ciclo anterior. Os comentários anteriores são retirados da análise corrente e permanecem preservados somente no histórico.


- Implementado o modo de análise da SEPLAG reutilizando o componente-base da análise do Cedente. A SEPLAG confere novamente os quatro blocos, consulta os documentos do Cedente sem editá-los, vincula a manifestação técnica do órgão central e pode devolver ao Cedente para complementação ou concluir a análise e encaminhar para publicação.


### Conclusão da análise central pela SEPLAG

- A SEPLAG marca cada bloco como conforme ou solicita complementação ao órgão cedente.
- Blocos com dados obrigatórios ausentes não podem ser marcados como conformes.
- Os documentos produzidos pelo órgão cedente são apresentados para consulta, sem edição pela SEPLAG.
- A manifestação técnica central registra referência SIGADOC, conclusão, observação/fundamentação, responsável e data.
- A conclusão favorável altera a situação para **Aguardando publicação** e a etapa atual para **Publicação**.
- A devolução da SEPLAG segue para o órgão cedente, responsável por complementar a instrução.
