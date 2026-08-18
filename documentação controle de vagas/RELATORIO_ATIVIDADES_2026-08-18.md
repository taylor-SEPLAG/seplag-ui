# Relatório de atividades — Controle de Vagas 3.0

**Data:** 18/08/2026  
**Projeto:** SIGEP — SEPLAG UI  
**Módulo:** Controle de Vagas 3.0

## 1. Objetivo do trabalho

Durante a conversa foi realizada uma revisão funcional e técnica do módulo Controle de Vagas, com foco em Quadros Autorizados, Vagas Individualizadas e versionamento. O trabalho combinou análise das histórias de usuário, consolidação das regras de negócio e atualização do protótipo React existente.

As alterações foram feitas localmente no projeto. Nenhum commit ou envio para o repositório remoto foi realizado durante esta etapa.

## 2. Decisões funcionais consolidadas

### 2.1 Quadro Autorizado

- O Quadro Autorizado representa a origem legal do quantitativo de vagas de um cargo.
- Cada cargo pode possuir somente um Quadro Autorizado atual.
- Alterações posteriores à entrada em vigor devem ocorrer por versionamento.
- A versão inicial é a versão 1 e registra a evolução **Criação**.
- Um quadro pode ser criado com quantidade autorizada igual a zero, permitindo receber vagas posteriormente por transformação.
- As situações consideradas são **Agendado**, **Ativo**, **Encerrado** e **Extinto**.
- A listagem deve apresentar somente a versão atual na linha principal e disponibilizar as versões anteriores no histórico expansível.

### 2.2 Quantitativos

- **Autorizadas:** quantitativo legal vigente.
- **Ocupadas:** vagas com ocupação ativa.
- **Comprometidas:** classificação complementar de vagas relacionadas a processo ativo; não deve ser somada novamente ao total autorizado.
- **Disponíveis:** vagas formalmente distribuídas e sem ocupação ativa.
- **Pendentes de distribuição:** vagas existentes que ainda não receberam distribuição formal.
- Relação consolidada: **Autorizadas = Ocupadas + Disponíveis + Pendentes de distribuição**.

### 2.3 Criação e identificação das vagas

- As vagas são criadas quando o quadro entra em situação Ativo.
- Se a quantidade autorizada for zero, nenhum registro de vaga é criado.
- Cada vaga possui um **ID técnico único e imutável**.
- O **Nome da vaga** é uma informação operacional diferente do ID técnico.
- Vagas pendentes de distribuição existem internamente e possuem ID técnico, mas ainda não possuem Nome da vaga.
- O Nome da vaga deve ser atribuído pela distribuição formal.
- Vagas pendentes de distribuição não aparecem na tela Vagas Individualizadas.

### 2.4 Evoluções do histórico

Foi consolidada a seguinte ordem de evoluções possíveis:

1. Criação;
2. Ampliação;
3. Redução;
4. Transformação - Origem;
5. Transformação - Destino;
6. Extinção progressiva;
7. Distribuição;
8. Redistribuição - Origem;
9. Redistribuição - Destino.

Inclusão e exclusão de órgão não são operações próprias de versionamento da US5. A inclusão ocorre pela distribuição e a indisponibilidade de um órgão decorre de sua situação cadastral ou de fluxo específico.

### 2.5 Versão agendada existente

- A existência de uma versão Agendada não deve bloquear automaticamente um novo versionamento.
- O sistema deve informar o número e a data de efeito da versão já agendada.
- Se o usuário continuar, a versão agendada anterior deve ser **substituída**.
- A versão substituída deve permanecer no histórico.
- A nova versão fica Ativa quando a data de efeito for atual ou passada e Agendada quando a data for futura.
- Somente uma versão Agendada válida pode permanecer para cada quadro.

## 3. Revisão das histórias de usuário

### 3.1 US195 — Listagem de Quadros Autorizados

Foi realizada revisão completa da história de listagem, abrangendo:

- premissas;
- critérios de aceitação;
- fluxos funcionais;
- descrição da tela;
- regras de negócio;
- cards, filtros, ordenação e paginação;
- ações disponíveis conforme a situação do quadro;
- acesso ao histórico pelo acordeão;
- modal Visualizar em modo somente leitura;
- disponibilidade de Criar nova versão para quadros Ativos.

O modal Visualizar foi incluído no escopo da US1. O campo **Abrangência** foi considerado desnecessário e removido do modal do protótipo. O bloco passou a se chamar **Destinação e quantitativos**.

### 3.2 US196 — Histórico de versões

Foi analisada e reescrita a história de consulta ao histórico. O protótipo recebeu um exemplo completo contendo todas as evoluções na ordem consolidada, permitindo validar a nomenclatura e a apresentação do histórico.

### 3.3 US197 — Cadastrar Quadro Autorizado

Foram consolidadas as seguintes regras:

- base legal obrigatória e proveniente do módulo Documentação;
- tipo de vínculo, regime jurídico, carreira e cargo obrigatórios;
- carreira sempre obrigatória;
- perfil profissional opcional;
- quantidade autorizada inteira e maior ou igual a zero;
- criação do código no padrão QA-XXXX;
- criação da versão 1;
- ativação imediata ou agendamento conforme a data;
- criação íntegra das vagas na ativação;
- separação entre ID técnico e Nome da vaga;
- ausência de distribuição no cadastro inicial.

### 3.4 US198 — Editar e excluir Quadro Autorizado

Foi definido que edição e exclusão diretas são permitidas somente para quadros Agendados, ainda sem efeitos e sem dependências operacionais.

Também foi definido e implementado no protótipo:

- campo obrigatório **Motivo da exclusão**;
- limite de 500 caracteres;
- espaços em branco não são considerados motivo válido;
- botão de confirmação desabilitado enquanto o motivo não for preenchido;
- limpeza do campo ao abrir, cancelar ou concluir a ação.

Os códigos específicos de permissão foram retirados da história nesta fase, conforme decisão de não tratar permissões detalhadas agora.

### 3.5 US199 — Versionar Quadro Autorizado

A história foi reestruturada para tratar somente:

- Ampliação;
- Redução;
- Transformação;
- Extinção progressiva.

Distribuição e Redistribuição devem ser especificadas em histórias próprias, embora continuem disponíveis no protótipo atual para evolução e validação visual.

Foram definidos critérios gerais de simulação e critérios específicos para cada operação, pois os dados, cálculos e impedimentos são diferentes.

## 4. Alterações realizadas no protótipo

### 4.1 Listagem e cards

- Padronização dos cards da tela Quadro Autorizado com a tela Vagas Individualizadas.
- Inclusão do card **Pendente de distribuição**.
- Ajuste da nomenclatura de **Pendente de ato** para **Pendente de distribuição** nos pontos revisados.
- Organização dos cards para apresentação na mesma linha quando houver espaço disponível.

### 4.2 Modal Visualizar

- Remoção do campo Abrangência.
- Renomeação do agrupamento para **Destinação e quantitativos**.
- Manutenção dos dados legais, funcionais, quantitativos e de vigência em modo somente leitura.

### 4.3 Modal de exclusão

O componente compartilhado de exclusão passou a aceitar conteúdo complementar e desabilitação do botão de confirmação. No fluxo de Quadro Autorizado foi incluído o campo obrigatório de motivo, contador de caracteres e validação antes da exclusão.

### 4.4 Histórico de versões

- Correção das nomenclaturas das evoluções.
- Inclusão de um exemplo com Criação, Ampliação, Redução, Transformação - Origem, Transformação - Destino, Extinção progressiva, Distribuição, Redistribuição - Origem e Redistribuição - Destino.
- Padronização da grafia com hífen entre operação e lado do movimento.

### 4.5 Substituição de versão agendada

O fluxo de versionamento passou a:

- localizar uma versão futura do mesmo quadro;
- informar versão e data programada;
- calcular a próxima numeração considerando a versão agendada;
- exibir o botão **Substituir e registrar**;
- preservar a versão substituída no histórico;
- atribuir situação Ativo ou Agendado à nova versão conforme a data de efeito.

### 4.6 Validação antes da simulação

O botão Simular permanece desabilitado enquanto faltar algum campo obrigatório. A própria função de simulação também possui proteção para impedir resultado incompleto.

A validação considera, conforme a operação:

- base legal;
- Processo SIGADOC;
- data de efeito;
- quantidade;
- quadro de destino;
- vagas selecionadas;
- órgãos de origem e destino;
- quantidades por órgão;
- limites de vagas elegíveis.

### 4.7 Estrutura comum das simulações

As simulações passaram a apresentar contexto de versionamento, data de efeito, situação resultante, quantitativos e impactos específicos. Foram removidas informações repetidas em cada operação.

### 4.8 Simulação de Ampliação

- Consolidação do versionamento no formato `versão atual → nova versão`.
- Exibição apenas de quantidade atual, ampliação e quantidade resultante.
- Remoção dos campos redundantes Vagas geradas e Vagas afetadas.
- Mensagem resumida sobre a criação das vagas pendentes de distribuição.
- Relação completa das vagas criadas.
- Paginação de 10 registros quando o total ultrapassar 10.
- Colunas reduzidas para Sequencial e Nome da vaga.
- Para vagas ainda pendentes de distribuição, o Nome permanece não atribuído.

### 4.9 Simulação de Redução

- Consolidação do versionamento no formato `versão atual → nova versão`.
- Exibição de quantidade atual, redução e quantidade resultante.
- Correção do total de vagas elegíveis, que antes representava apenas as selecionadas.
- Separação entre vagas elegíveis e vagas selecionadas.
- Informação de ocupadas e comprometidas, esclarecendo que comprometidas podem incluir ocupadas.
- Seleção das vagas elegíveis do maior para o menor sequencial.
- Relação completa das vagas que serão extintas.
- Paginação de 10 registros quando o total ultrapassar 10.
- Colunas reduzidas para Sequencial e Nome da vaga.

### 4.10 Simulação de Transformação

- Correção do bloco que identificava incorretamente como Destino a tabela com vagas da origem.
- Remoção do resumo duplicado do quadro de destino.
- Resultado reorganizado em dois lados: Origem e Destino.
- Exibição das versões anterior e resultante de ambos os quadros.
- Exibição das fórmulas quantitativas da origem e do destino.
- Exibição das evoluções Transformação - Origem e Transformação - Destino.
- Relação completa das vagas transformadas.
- Paginação de 10 registros.
- Colunas: Sequencial, Nome atual, Nome resultante e Condição.
- Separação do ID técnico e do Nome da vaga no modelo.
- Preservação do ID técnico durante a transformação.
- Geração de novo Nome operacional conforme órgão, cargo de destino e sequencial do destino.
- Registro no histórico do Nome anterior, Nome resultante e preservação do ID técnico.

### 4.11 Simulação de Extinção progressiva

- Separação entre vagas extintas imediatamente, ocupadas mantidas até a vacância e comprometidas mantidas até a conclusão do processo.
- Exibição do total remanescente e da situação resultante Encerrado ou Extinto.
- Informação de bloqueio de novos ingressos.
- Vagas comprometidas deixaram de bloquear toda a operação.
- Vagas comprometidas permanecem Em extinção até a conclusão do processo ativo.

### 4.12 Distribuição e Redistribuição no protótipo

Mesmo fora do escopo da US5, as simulações existentes receberam complementos:

- contexto da nova versão;
- data de efeito e situação resultante;
- evolução Distribuição;
- saldos de origem e destino na Redistribuição;
- evoluções Redistribuição - Origem e Redistribuição - Destino.

## 5. Arquivos alterados

- `src/componentes/ModalDelete/index.tsx`
- `src/prototipos/controleVagas/QuadroAutorizadoContent.tsx`
- `src/prototipos/controleVagas/QuadroLegalOperacoes.tsx`
- `src/prototipos/controleVagas/mockData.ts`
- `src/prototipos/controleVagas/quadroAutorizado.css`
- `src/prototipos/controleVagas/quadroLegalUtils.ts`
- `src/prototipos/controleVagas/quadroLegalUtils.test.ts`
- `src/prototipos/controleVagas/types.ts`
- `src/prototipos/controleVagas/vagaUtils.ts`

## 6. Validações executadas

Após as alterações finais foram executados:

- testes do módulo Controle de Vagas: **93 testes aprovados em 15 arquivos**;
- build de produção com Vite: **concluído com sucesso**;
- geração das declarações TypeScript: **concluída com sucesso**.

## 7. Pendências e observações

- Os textos reescritos das histórias foram entregues no chat. Os documentos do Google Drive não foram alterados automaticamente e precisam receber o conteúdo aprovado.
- US6 e US7 ainda não foram detalhadas; permanecem inicialmente como cópias da US5, conforme orientação recebida.
- Distribuição e Redistribuição devem ser retiradas do escopo textual da US5 e tratadas em histórias específicas.
- O motivo da exclusão está validado na interface, mas o protótipo ainda não possui persistência real de auditoria em backend.
- A substituição de versão agendada está representada no estado local do protótipo; uma implementação definitiva deve persistir usuário, data, versão substituída e justificativa da substituição.
- O modelo passou a possuir o campo `nome` separado do `id`, mas dados legados do mock ainda usam identificadores com aparência operacional. Uma migração definitiva deve gerar IDs técnicos opacos e preencher explicitamente os nomes das vagas já distribuídas.
- A distribuição formal deverá ser responsável por atribuir o Nome da vaga quando ele ainda não existir.
- As alterações locais estão misturadas a mudanças já existentes no diretório de trabalho; antes de publicar, o escopo do commit deve ser revisado cuidadosamente.

## 8. Resultado do dia

O módulo passou a representar com maior fidelidade as regras consolidadas do Controle de Vagas 3.0. As histórias US1 a US5 foram revisadas, as principais inconsistências entre documentação e protótipo foram identificadas e as operações de versionamento receberam validações, simulações específicas, paginação e tratamento adequado de histórico, vagas comprometidas, versão agendada e identificação técnica das vagas.
