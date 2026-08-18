# Controle de vagas 3.0

Data de consolidação: 18/08/2026.

Este documento registra as mudanças funcionais, visuais e de regra de negócio aplicadas no protótipo de Controle de Vagas durante o refinamento da versão 3.0. O objetivo é deixar claro o comportamento esperado das telas, o racional das decisões e os pontos que ainda precisam ser validados na modelagem definitiva.

## 1. Diretriz geral da versão 3.0

A versão 3.0 reorganiza o Controle de Vagas em torno de três ideias centrais:

- Quadro Autorizado é a origem legal do quantitativo.
- Versionamento é o mecanismo formal para alterar o quadro depois que ele está ativo.
- Distribuição, redistribuição e transformação passam a ser eventos versionados, com histórico rastreável.

Também foi reforçada a separação entre:

- Identificador técnico da vaga: deve ser único, imutável e não depender de quadro, cargo ou órgão.
- Nome da vaga: informação operacional exibida ao usuário, formada após a distribuição, podendo considerar cargo, órgão e sequencial.
- Quadro Autorizado: registro legal versionável, que pode receber ampliação, redução, distribuição, redistribuição, transformação e extinção progressiva.

## 2. Quadro Autorizado

### 2.1. Criação de novo quadro

A criação de novo Quadro Autorizado foi simplificada.

Foi removida a seção que perguntava:

- "Como a lei definiu a alocação das vagas?"
- "Não indicou órgãos específicos"
- "Indicou os órgãos, mas não definiu quantitativos"
- "Indicou os órgãos e o quantitativo de cada um"
- "Alocado pela lei"
- "Saldo sem alocação legal"

Com isso, a criação do quadro fica focada no cadastro do quantitativo autorizado, sem tentar resolver a distribuição legal nesse primeiro momento.

Texto atualizado:

- Antes: "Defina o total autorizado."
- Depois: "Defina o total de vagas autorizado."

Regra resultante:

- O quadro nasce com uma quantidade total autorizada.
- A alocação/distribuição das vagas passa a ser tratada posteriormente por versionamento.
- A tela de criação não precisa mais representar os três cenários de definição legal por órgão.

### 2.2. Vigência

A área de vigência foi ajustada visualmente para ficar mais limpa e direta.

Comportamento definido:

- A data de efeito deve carregar a data atual como padrão.
- A situação deve ser inferida pelo sistema, sem exigir que o usuário escolha manualmente.
- A interface deve apresentar a situação de forma resumida, evitando blocos explicativos desnecessários.

### 2.3. Ações da listagem

Foram ajustadas as ações exibidas por linha.

Mudanças:

- Se o quadro já estiver ativo/vigente, o botão de editar não deve aparecer.
- O botão de distribuir foi removido da listagem.
- A distribuição deixou de ser uma ação direta da tela principal e passou a ser uma operação de versionamento.

Regra resultante:

- Edição direta só existe antes da vigência.
- Quadro ativo deve ser alterado somente por nova versão.
- Distribuir vagas não é mais fluxo separado na listagem de Quadro Autorizado.

### 2.4. Menu lateral

O menu "Distribuição" foi removido do agrupamento "Controle de Vagas".

Comportamento atual:

- A rota técnica pode continuar existindo para compatibilidade e testes.
- A navegação principal não mostra mais "Distribuição".
- A distribuição passa a ser acessada dentro da criação de nova versão do Quadro Autorizado.

### 2.5. Coluna Órgão

A coluna "Órgão" da listagem de Quadro Autorizado foi alterada para representar a composição real da distribuição.

Antes:

- A célula mostrava apenas um texto simples, como "Pendente de ato de distribuição" ou um resumo parcial.

Depois:

- Quando há distribuição e saldo pendente, a célula mostra um resumo:
  - "Órgãos + Pendente"
- Ao clicar no resumo, abre um modal com a composição detalhada:
  - órgão
  - quantidade
  - percentual
  - pendente de distribuição, quando houver

Texto padronizado:

- Antes: "Pendente de ato de distribuição"
- Depois: "Pendente de distribuição"

Regra resultante:

- A listagem mantém uma linha por quadro.
- A célula de órgão não explode a tabela em várias linhas.
- O detalhe da distribuição fica disponível sob demanda em modal.

### 2.6. Histórico de versões

O histórico expandido da tela Quadro Autorizado foi ajustado.

Remoções:

- O painel "Distribuição por órgão" foi removido de dentro do histórico.
- O histórico deve focar em versões do quadro, não repetir a composição distributiva atual.

Inclusões:

- Foi adicionada paginação ao histórico de versões.
- A paginação usa o componente `Paginator` do PrimeReact.
- Opções de página: 5, 10 e 20 registros.

Comportamento esperado:

- Ao expandir uma linha do quadro, o usuário visualiza apenas a tabela de versões anteriores.
- Quando houver muitas versões, a navegação ocorre pela paginação.

## 3. Versionamento do Quadro Autorizado

### 3.1. Operações disponíveis

O versionamento foi reorganizado para concentrar as alterações formais do quadro.

Operações mantidas/adicionadas:

- Ampliação legal
- Redução legal
- Transformação
- Extinção progressiva
- Distribuição
- Redistribuição

Operações removidas da nova versão:

- Inclusão de órgão
- Exclusão de órgão

Racional:

- Inclusão e exclusão de órgão isoladas geravam ambiguidade.
- Distribuição e redistribuição representam melhor os efeitos reais sobre vagas.
- Alterações relevantes devem gerar nova versão rastreável.

### 3.2. Observação

O campo "Justificativa" foi renomeado para "Observação".

Aplicável às operações:

- Ampliação legal
- Redução legal
- Transformação
- Extinção progressiva
- Distribuição
- Redistribuição

Regra:

- Observação não é obrigatória em nenhuma operação.
- A obrigatoriedade fica concentrada em base legal, processo e dados essenciais da operação.

### 3.3. Data de efeito

Regra definida:

- O campo "Data de efeito" deve iniciar preenchido com a data atual.

Objetivo:

- Reduzir preenchimento manual repetitivo.
- Alinhar o protótipo com a decisão de simplificar o fluxo de vigência/agendamento.

## 4. Distribuição como versionamento

### 4.1. Mudança de fluxo

A distribuição passou a ser uma opção dentro de "Nova versão do quadro".

Antes:

- Distribuição existia como tela/menu separado.
- O quadro tinha botão de ação para distribuir.

Depois:

- O usuário entra no Quadro Autorizado.
- Clica em criar nova versão.
- Escolhe a operação "Distribuição".
- Informa os órgãos e quantidades dentro do versionamento.

### 4.2. Padrão visual do dropdown

Foi corrigido o componente de seleção de órgão para usar o padrão da biblioteca.

Problema identificado:

- O dropdown usado inicialmente na distribuição dentro do versionamento era o `<select>` nativo.
- A tela original de distribuição usava o componente padrão da biblioteca, com busca e estilo próprio.

Resultado:

- A distribuição no versionamento passou a usar o padrão visual/componentizado da biblioteca.
- A experiência fica consistente entre telas.

### 4.3. Evitar duplicidade de órgão

Regra implementada:

- Se um órgão já foi adicionado em uma linha de distribuição, ele não deve aparecer novamente na lista ao adicionar outra linha.

Comportamento:

- Órgãos já selecionados são filtrados das opções disponíveis.
- A exceção é a própria linha em edição, que pode manter seu valor atual.

Objetivo:

- Evitar distribuição duplicada para o mesmo órgão.
- Forçar que cada órgão apareça uma única vez por operação.

### 4.4. Distribuição incremental

Foi ajustado o comportamento quando o quadro já possui vagas distribuídas.

Antes:

- Ao abrir nova distribuição, a tela começava como se nada tivesse sido distribuído.
- Isso permitia confusão entre quantidade atual e nova quantidade.

Depois:

- A grade mostra os órgãos já distribuídos como linhas existentes.
- Essas linhas têm:
  - órgão bloqueado
  - quantidade atual
  - campo "A adicionar"
- O usuário pode acrescentar novas vagas ao órgão existente.
- O usuário não pode remover órgão já distribuído.
- O usuário não pode reduzir a quantidade atual.

Colunas atuais:

- Órgão
- Quantidade atual
- A adicionar
- Ações

Regras:

- Linhas de distribuição existente são fixas.
- Linhas novas podem ser adicionadas e removidas.
- A distribuição desta versão só pode consumir saldo pendente.

### 4.5. Validação de limite

Foi adicionada validação para impedir que a distribuição ultrapasse o saldo pendente.

Comportamento esperado:

- Se o total "A adicionar" ultrapassar o saldo pendente, a operação fica inválida.
- O usuário recebe alerta visual.
- O botão de simular/registrar fica bloqueado enquanto houver excesso.

Exemplo:

- Já distribuídas: 5 vagas.
- Pendente de distribuição: 25 vagas.
- Se o usuário tentar adicionar 50 vagas, a tela deve alertar que passou do limite.

## 5. Redistribuição como versionamento

### 5.1. Nova operação

Foi adicionada a operação "Redistribuição" dentro do versionamento.

Objetivo:

- Registrar a movimentação formal de vagas entre órgãos.
- Manter o quadro versionado e auditável.

Campos principais:

- Órgão de origem
- Órgão de destino
- Quantidade de vagas
- Data de efeito
- Processo SIGADOC
- Observação

Regra:

- Redistribuição movimenta vagas já distribuídas.
- Não cria novas vagas.
- Não altera o quantitativo legal total.
- Deve respeitar vagas elegíveis e disponíveis para movimentação.

## 6. Transformação

### 6.1. Transformação por órgão de distribuição

A transformação foi reestruturada para trabalhar por órgão de distribuição.

Antes:

- Havia apenas um campo geral de quantidade.
- Não ficava claro de quais órgãos as vagas seriam transformadas.

Depois:

- A tela apresenta uma tabela com a composição por órgão.
- O usuário informa a quantidade a transformar por órgão.
- O usuário escolhe o Quadro Autorizado de destino.

Colunas da tabela:

- Órgão
- Distribuídas
- Disponíveis
- Ocupadas
- Comprometidas
- Elegíveis
- Quantidade a transformar
- Destino

### 6.2. Quadro Autorizado de destino

O campo "Quadro Autorizado de destino" foi movido para cima da tabela.

Racional:

- Primeiro o usuário define o destino da transformação.
- Depois informa as quantidades por órgão.
- A tabela passa a ter contexto antes do preenchimento das quantidades.

### 6.3. Elegibilidade das vagas

Regra definida:

- Só podem ser transformadas vagas disponíveis ou ocupadas.
- Vagas comprometidas não podem ser transformadas.

Detalhamento:

- Vagas disponíveis e regulares são elegíveis.
- Vagas ocupadas e regulares são elegíveis.
- Vagas com comprometimento ativo são bloqueadas.
- Vagas em situação legal especial devem ser tratadas com cautela e não devem entrar como elegíveis automaticamente.

### 6.4. Transformação gera duas versões

Regra confirmada:

- Uma transformação impacta o quadro de origem e o quadro de destino.
- Portanto, os dois quadros devem ganhar nova versão.

Efeitos:

- Quadro de origem:
  - reduz o quantitativo pelas vagas transformadas
  - registra "Transformação origem" no histórico
- Quadro de destino:
  - amplia o quantitativo pelas vagas recebidas
  - registra "Transformação destino" no histórico

Na tela de histórico, a evolução passou a diferenciar:

- Transformação origem
- Transformação destino

Racional:

- A operação é bilateral.
- O histórico precisa indicar se aquela versão perdeu vagas por transformação ou recebeu vagas por transformação.

## 7. Extinção progressiva

A extinção progressiva foi mantida como operação de versionamento.

Regra principal:

- A extinção progressiva bloqueia novas ocupações.
- Vagas ocupadas desaparecem do limite somente após vagarem.
- Vagas disponíveis podem ser extintas imediatamente, conforme a regra aplicada.

Comportamento esperado:

- O quadro pode ficar encerrado, mas ainda possuir ocupantes remanescentes.
- O quadro só fica efetivamente extinto quando não houver mais vagas ocupadas remanescentes.

## 8. Vagas Individualizadas

### 8.1. Identificador passou a ser "Nome da vaga"

Na interface de Vagas Individualizadas, o termo "Identificador" foi alterado para "Nome da vaga".

Locais ajustados:

- Cabeçalho da coluna
- Filtro de busca
- Placeholder de busca
- Textos de especificação da tela
- Texto de apoio no modal

Racional:

- O identificador técnico da vaga deve ser imutável e interno.
- O texto exibido ao usuário representa o nome operacional da vaga.
- Esse nome pode depender da distribuição e da composição cargo + órgão + sequencial.

### 8.2. Remoção do destaque "Mais de um vínculo"

Foi removido o destaque visual "Mais de um vínculo".

Removidos:

- Selo no ocupante atual da tabela.
- Selo na lista de ocupantes do detalhe.
- KPI "Pessoas com mais de um vínculo".
- Filtro "Pessoa com mais de um vínculo".
- Regras visuais associadas a essa marcação.

Regra resultante:

- Se uma pessoa tiver mais de um vínculo, ela simplesmente aparece normalmente na lista.
- Cada vínculo/vaga deve continuar sendo representado como registro próprio.
- A interface não destaca essa condição como alerta ou exceção.

### 8.3. Integridade do identificador

Nas transcrições foi identificado que a seção "Integridade do identificador" não deveria permanecer no detalhe da vaga para o MVP.

Motivo:

- A seção apenas explicava a composição do nome da vaga.
- O histórico de ocupação ainda depende do ingresso/ocupação, que não está completo neste recorte.

Diretriz:

- O detalhe da vaga deve priorizar a vinculação legal e a posição distributiva.
- Informações de ocupação e histórico detalhado devem ser incrementadas quando o fluxo de ingresso/ocupação estiver consolidado.

## 9. Identificador técnico x nome da vaga

Foi reforçada a separação conceitual entre identificador técnico e nome da vaga.

### 9.1. Identificador técnico

Regra desejada:

- Deve ser único.
- Deve ser imutável.
- Não deve depender de quadro.
- Não deve depender de órgão.
- Não deve depender de cargo.
- Não deve depender do nome distribuído.

Racional:

- A vaga pode trocar de quadro.
- A vaga pode ser transformada para outro cargo.
- A vaga pode mudar de órgão por redistribuição.
- Se o identificador técnico carregar essas informações, ele deixa de ser estável.

Diretriz de modelagem:

- O identificador técnico deve ser apenas número ou chave interna.
- Exemplos possíveis:
  - sequencial global numérico
  - chave técnica interna
  - UUID interno, se adotado pela arquitetura

### 9.2. Nome da vaga

Regra desejada:

- O nome da vaga nasce ou se consolida após a distribuição.
- Deve ser o elemento exibido ao usuário.
- Pode seguir composição baseada em cargo, órgão e sequencial.

Exemplo conceitual:

- Cargo + Órgão + 0001

Observação:

- O nome da vaga é diferente do identificador técnico.
- O nome pode mudar conforme redistribuição ou transformação, desde que o histórico seja preservado.
- A decisão definitiva sobre imutabilidade do nome distribuído ainda precisa ser validada com a modelagem de dados.

## 10. Transcrições adicionadas ao projeto

Foram adicionadas ao projeto as transcrições do refinamento/planning da Sprint 18.

Pasta:

- `transcrições`

Arquivos adicionados:

- `[SIGEP] Refinamento_Planning - Sprint 18 - 2026_08_17 09_21 GMT-04_00 - Anotações do Gemini.docx`
- `[SIGEP] Refinamento_Planning - Sprint 18 - 2026_08_17 13_55 GMT-04_00 - Anotações do Gemini.docx`

Também foram geradas versões `.txt` para facilitar busca e análise local.

Principais pontos extraídos:

- Distribuição deve funcionar dentro do versionamento.
- Redistribuição também deve ser versionada.
- Transformação deve indicar origem e destino.
- Identificador técnico não deve ficar amarrado ao quadro.
- "Identificador" da interface deve ser tratado como nome da vaga.
- A seção de integridade do identificador deve ser removida do detalhe da vaga no MVP.
- Histórico detalhado de ocupação depende do avanço do fluxo de ingresso/ocupação.

## 11. Arquivos principais impactados no protótipo

Arquivos de tela e fluxo:

- `src/prototipos/PrototiposPage.tsx`
- `src/prototipos/controleVagas/QuadroAutorizadoContent.tsx`
- `src/prototipos/controleVagas/QuadroLegalOperacoes.tsx`
- `src/prototipos/controleVagas/VagasIndividualizadasContent.tsx`
- `src/prototipos/controleVagas/DistribuicaoIndividualContent.tsx`

Arquivos de regras e tipos:

- `src/prototipos/controleVagas/types.ts`
- `src/prototipos/controleVagas/quadroLegalUtils.ts`
- `src/prototipos/controleVagas/vagaUtils.ts`

Arquivos de especificação:

- `src/prototipos/controleVagas/QuadroAutorizadoSpecifications.ts`
- `src/prototipos/controleVagas/VagasIndividualizadasSpecifications.ts`

Arquivos de estilo:

- `src/prototipos/controleVagas/quadroAutorizado.css`
- `src/prototipos/controleVagas/quadroLegalOperacoes.css`

Arquivos de teste:

- `src/prototipos/controleVagas/_menuSmoke.test.tsx`
- `src/prototipos/controleVagas/quadroLegalUtils.test.ts`

## 12. Validações executadas

Durante os ajustes, foram executadas validações de build e testes.

Comandos utilizados:

```bash
npm.cmd run build
```

```bash
.\node_modules\.bin\vitest.cmd run src\prototipos\controleVagas\_menuSmoke.test.tsx
```

```bash
.\node_modules\.bin\vitest.cmd run src\prototipos\controleVagas\_menuSmoke.test.tsx src\prototipos\controleVagas\quadroLegalUtils.test.ts
```

Resultado:

- Build passou.
- Smoke tests passaram.
- Testes de utilitários de quadro legal passaram.

## 13. Pendências e pontos de atenção

### 13.1. Modelagem definitiva do identificador técnico

Ainda precisa ser definido como o identificador técnico será persistido.

Ponto importante:

- O protótipo ainda possui funções que derivam identificadores a partir de órgão, cargo e sequencial.
- Isso deve ser tratado como nome operacional ou código de exibição, não como identificador técnico definitivo.

### 13.2. Nome da vaga em redistribuição

Precisa ser validado:

- O nome da vaga muda quando a vaga é redistribuída para outro órgão?
- Ou o nome original permanece e a redistribuição aparece apenas no histórico?

Recomendação:

- Se o nome mudar, preservar histórico do nome anterior.
- Se o nome não mudar, deixar claro que ele representa a primeira distribuição e não a posição atual.

### 13.3. Histórico da vaga individualizada

As transcrições indicam que o histórico detalhado de ocupação ainda não deve ser central no MVP.

Pendência:

- Validar se o protótipo deve remover totalmente os blocos de histórico/ocupantes do modal neste momento.
- Ou se eles permanecem apenas como antecipação visual de integrações futuras.

### 13.4. Transformação com vaga ocupada

A regra definida permite transformar vagas disponíveis ou ocupadas, desde que não estejam comprometidas.

Ponto de atenção:

- Para vagas ocupadas, a ocupação precisa acompanhar a vaga transformada ou ser vinculada ao novo registro de destino.
- Essa operação deve ser transacional na modelagem real.

### 13.5. Distribuição e saldo pendente

A distribuição incremental já impede exceder o saldo pendente no protótipo.

Na implementação real, a validação deve considerar:

- vagas extintas
- vagas em extinção
- vagas comprometidas
- vagas ocupadas
- data de efeito
- movimentos retroativos
- versão vigente do quadro

## 14. Resumo executivo

O Controle de Vagas 3.0 deixa de tratar distribuição como uma tela isolada e passa a concentrar as alterações formais no versionamento do Quadro Autorizado.

Principais ganhos:

- Menos ações soltas na listagem.
- Histórico mais coerente por versão.
- Distribuição e redistribuição formalizadas como operações versionadas.
- Transformação rastreada nos dois lados: origem e destino.
- Coluna de órgão mais limpa, com detalhe em modal.
- Vagas individualizadas usando o termo correto: "Nome da vaga".
- Remoção de destaque desnecessário para múltiplos vínculos.
- Separação conceitual entre identificador técnico e nome operacional da vaga.

Essa versão deixa o protótipo mais próximo do fluxo real esperado: quadro nasce por base legal, alterações relevantes geram versão, e a vaga mantém identidade própria mesmo quando seu contexto muda.
