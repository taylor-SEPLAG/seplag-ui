# Controle de Vagas — Bolsistas

## Objetivo

O módulo controla as vagas ligadas aos cargos que possuem a opção **Controla vagas de bolsistas** marcada no cadastro de cargo. Ele registra a autorização legal, gera vagas individualizadas, distribui vagas para órgãos e acompanha sua ocupação.

Cargos como bolsista de nível médio, pós-graduação, apoio técnico ou residente técnico participam do módulo somente quando estiverem habilitados para esse controle.

## Telas

| Tela | Função |
| --- | --- |
| **Bolsistas** | Página inicial com acesso aos quadros e às vagas. |
| **Quadro Autorizado Bolsistas** | Cadastro, consulta, distribuição e versionamento legal dos quadros. |
| **Vagas Individualizadas Bolsistas** | Consulta das vagas criadas pelos quadros, sua distribuição e ocupação. |

As telas de quadro e de vagas possuem atalhos no breadcrumb para acesso direto entre si.

## Fluxo do módulo

1. O usuário cadastra ou identifica um cargo marcado com **Controla vagas de bolsistas**.
2. Cria um **Quadro Autorizado Bolsistas** para o cargo.
3. Informa quantidade autorizada, documento legal e data de início.
4. O sistema individualiza as vagas do quadro.
5. As vagas iniciam em **ESTADO DE MATO GROSSO**, portanto pendentes de distribuição.
6. A distribuição direciona vagas para órgãos.
7. Após distribuída, uma vaga pode ficar disponível, ser reservada por ingresso ou ser ocupada por bolsista.
8. Alterações legais são registradas por meio de nova versão, sem sobrescrever o histórico.

## Pré-requisito e exclusividade

Somente cargos habilitados no cadastro de cargo aparecem no campo **Cargo bolsista**.

Um cargo bolsista pode ter apenas um quadro autorizado vigente. O sistema impede um novo cadastro quando já existir quadro para o cargo.

## Cadastro do quadro

O cadastro exige:

- cargo bolsista;
- quantidade de vagas autorizadas;
- documento legal associado;
- data de início.

A data de início não pode ser futura. Não há situação **Agendada** para quadro de bolsista.

Cada quadro recebe código no padrão **QAB-0001**.

## Quadro Autorizado Bolsistas

A listagem possui filtros por quadro, cargo, órgão e situação, além de ações de visualização, edição, nova versão e expansão do histórico.

As situações possíveis são:

- **Ativo**: quadro em operação;
- **Extinto**: quadro em extinção progressiva, enquanto ainda houver vaga ocupada;
- **Encerrado**: quadro sem vagas operacionais.

### Indicadores da listagem

| Indicador | Regra |
| --- | --- |
| **Quadros cadastrados** | Total de quadros de bolsistas cadastrados. |
| **Cargos bolsistas vinculados** | Total de cargos com Controle de vagas de bolsistas marcado. |
| **Vagas bolsistas autorizadas** | Soma das vagas autorizadas dos quadros operacionais. |
| **Vagas bolsistas distribuídas** | Vagas de quadros ativos distribuídas formalmente a órgãos. |
| **Vagas pendentes de distribuição** | Vagas de quadros ativos que continuam em ESTADO DE MATO GROSSO. |

As colunas da lista são: quadro, cargo, órgão, vagas autorizadas, vagas distribuídas, vagas pendentes de distribuição, situação e ações.

## Distribuição e redistribuição

Uma vaga em **ESTADO DE MATO GROSSO** está pendente de distribuição e não pode ser ocupada.

A distribuição direciona vagas pendentes a um ou mais órgãos. Quando a distribuição é concluída, a vaga fica disponível se não houver reserva ou ocupação.

A redistribuição movimenta vagas já distribuídas entre órgãos. Distribuição e redistribuição geram nova versão do quadro e preservam o histórico.

Os quantitativos informados não podem exceder as vagas elegíveis.

## Vagas Individualizadas Bolsistas

A tela exige a seleção de um **Quadro Autorizado Bolsistas** para listar as vagas do quadro. Sem seleção, não são exibidas vagas.

### Situações da vaga

| Situação | Significado |
| --- | --- |
| **Pendente de distribuição** | Vaga em ESTADO DE MATO GROSSO; não pode ser ocupada. |
| **Disponível** | Vaga distribuída e sem reserva ou ocupação. |
| **Em ocupação** | Vaga reservada por processo de ingresso ainda não concluído. |
| **Ocupada** | Vaga distribuída e preenchida por bolsista. |
| **Extinta** | Vaga retirada por redução ou extinção legal. |
| **Encerrada** | Vaga sem operação após o encerramento do quadro. |

A tela permite filtrar por quadro, órgão, bolsista e situação, bem como visualizar o resumo e o histórico da vaga.

### Indicadores das vagas individualizadas

Os dois primeiros são gerais do módulo:

| Indicador | Regra |
| --- | --- |
| **Quadros cadastrados** | Total de quadros de bolsistas cadastrados. |
| **Cargos bolsistas vinculados** | Total de cargos habilitados para controlar vagas de bolsistas. |

Os demais dependem do quadro selecionado. Sem quadro selecionado, todos ficam em zero:

| Indicador | Regra |
| --- | --- |
| **Vagas bolsistas autorizadas** | Quantidade autorizada no quadro. |
| **Vagas bolsistas distribuídas** | Vagas do quadro distribuídas para órgãos. |
| **Vagas pendentes de distribuição** | Vagas do quadro ainda em ESTADO DE MATO GROSSO. |
| **Vagas bolsistas disponíveis** | Vagas distribuídas sem reserva ou ocupação. |
| **Vagas bolsistas em ocupação** | Vagas reservadas por ingresso em andamento. |
| **Vagas bolsistas ocupadas** | Vagas distribuídas preenchidas por bolsista. |

## Nova versão e evolução legal

Uma nova versão exige:

- documento legal;
- processo SIGADOC;
- data de efeito não futura;
- dados exigidos pela operação escolhida.

A primeira versão possui evolução **Criação**. Cada versão posterior apresenta a evolução legal que a originou. A expansão do histórico mostra todas as versões, inclusive a versão atual, em ordem decrescente.

### Operações legais

| Operação | Efeito |
| --- | --- |
| **Ampliação legal** | Cria novas vagas depois do último sequencial. |
| **Redução legal** | Extingue vagas livres, regulares e sem comprometimento. |
| **Distribuição** | Distribui vagas pendentes para órgãos. |
| **Redistribuição** | Move vagas distribuídas entre órgãos. |
| **Atualização da base legal** | Atualiza o fundamento legal sem alterar quantitativos. |
| **Extinção progressiva** | Encerra o quadro sem interromper vagas já ocupadas. |

### Redução legal

A redução somente alcança vagas disponíveis, regulares e sem comprometimento ativo. Vagas ocupadas, em processo de ocupação, comprometidas ou já extintas não podem ser reduzidas.

As vagas reduzidas são extintas imediatamente e recebem registro no histórico.

### Extinção progressiva e encerramento

1. Ao iniciar a extinção de quadro ativo, vagas livres e pendentes são extintas imediatamente.
2. Vagas ocupadas permanecem até sua desocupação. Enquanto houver ocupação, o quadro fica **Extinto** e o total autorizado corresponde apenas às vagas ainda ocupadas.
3. Na desocupação da última vaga, ela também é extinta e o quadro fica **Encerrado** com zero vagas autorizadas, distribuídas, pendentes, disponíveis e em ocupação.

Uma vaga de quadro extinto nunca volta a ficar disponível. Vagas distribuídas em quadros extintos ou encerrados deixam de ser operacionais e são preservadas apenas no histórico.

## Histórico e rastreabilidade

Cada vaga mantém os eventos de criação, distribuição, redistribuição, ocupação, desocupação e alteração legal.

O histórico de versões do quadro apresenta versão, cargo, órgão, vigência, vagas autorizadas, evolução legal, situação e visualização.

## Persistência do protótipo

Os dados do módulo de bolsistas são mantidos em memória durante a execução do protótipo. Ao recarregar a página, alterações de quadros, versões, distribuições e ocupações retornam ao conjunto de dados inicial.

A persistência definitiva depende de integração com a API e a base de dados do SIGEP.
