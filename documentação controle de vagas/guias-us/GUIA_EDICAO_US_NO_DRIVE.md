# Guia para editar US no Google Drive

Este guia define como aplicar uma US gerada no chat em um arquivo modelo do Google Drive.

## Objetivo

Editar uma cópia do modelo de US no Google Drive mantendo a estrutura, a formatação e os elementos fixos do documento.

## Regra principal de edição

Editar apenas o conteúdo que estiver dentro de colchetes `[ ]`.

Não alterar títulos, numeração estrutural, nomes de seções, cabeçalhos de tabela, identificadores ou blocos fixos do modelo, salvo solicitação explícita do usuário.

Exemplos de conteúdo editável:

```text
[Nome da US]
[Descrever uma premissa]
[Nome do critério de aceitação]
[Descrever um dos critérios de aceitação]
[Nome de um fluxo funcional]
[Passo do fluxo]
```

Exemplos de conteúdo que deve ser preservado:

```text
1. Descrição
2. Premissas
3. Critérios de aceitação
CA01
RN001
Matriz de permissões
Documentos/Legislação
```

## Procedimento antes da edição

1. Localizar o arquivo exato no Google Drive.
2. Confirmar que o arquivo está na pasta correta do projeto.
3. Confirmar que o arquivo não está na lixeira.
4. Ler o texto do documento.
5. Ler as tabelas do documento.
6. Verificar se o modelo é compatível com a US gerada.
7. Informar ao usuário se o arquivo está compatível ou se precisa ser ajustado.
8. Editar somente após autorização explícita do usuário.

## Pasta de referência no Drive

Usar a pasta:

```text
Meu Drive > SIGEP > CONTROLE DE VAGAS
```

Ao localizar arquivos com nomes parecidos, escolher apenas o documento ativo dentro dessa pasta. Não editar arquivos da lixeira ou cópias antigas sem confirmação.

## Como aplicar o conteúdo

O conteúdo gerado no chat deve ser transferido para os campos do modelo.

Ao editar:

- Preservar a estrutura do documento.
- Preservar estilos e tabelas existentes.
- Preservar a numeração das seções.
- Preservar identificadores `CAxx`.
- Preservar identificadores `RNxxx`.
- Preservar os blocos `Fluxo - ...` separadamente.
- Não transformar vários fluxos em um único fluxo.
- Não inserir numeração manual em listas quando o modelo já controla a numeração.
- Não apagar colunas da tabela.
- Não alterar `Matriz de permissões` e `Documentos/Legislação`, salvo pedido explícito.

## Quantidade de conteúdo

O modelo não limita a quantidade de itens da US.

Se a US precisar de mais premissas, critérios, fluxos, regras ou linhas de tabela do que o modelo possui, gerar o conteúdo completo no chat e avisar que o usuário pode adaptar o modelo para receber os itens adicionais.

Não reduzir a US para caber na quantidade de linhas existentes.

## Critérios de aceitação

Quando o modelo possuir linhas como:

```text
CA01 - [Nome do critério de aceitação]
[Descrever um dos critérios de aceitação]
```

Editar apenas os trechos dentro de `[ ]`.

Resultado esperado:

```text
CA01 - Seleção do cenário
Dado que o usuário esteja na tela Novo Quadro, quando selecionar a opção indicada, então o sistema deve aplicar o comportamento esperado.
```

Não remover `CA01`, `CA02`, `CA03` etc.

## Fluxos funcionais

Quando o modelo possuir:

```text
Fluxo - [Nome de um fluxo funcional]
[Passo do fluxo]
```

Editar apenas o nome entre colchetes e os passos entre colchetes.

Cada fluxo funcional deve permanecer separado.

Se a US possuir dois fluxos, preencher dois blocos de fluxo. Se possuir três, preencher três blocos. Se possuir mais fluxos do que o modelo, gerar todo o conteúdo e avisar que o modelo precisa de novos blocos.

## Descrição da tela

Cada grupo deve seguir o título:

```text
Descrição da tela - Grupo: [Nome do Grupo]
```

A tabela deve manter exatamente estas colunas:

```text
Nome | Tipo | Editável | Obrigatório | Tamanho | Orientações/Observações
```

Preencher somente o conteúdo das linhas editáveis. Não alterar os cabeçalhos.

## Mensagens e confirmações

O grupo deve manter o nome:

```text
Grupo: Mensagens e Confirmações
```

A tabela deve manter exatamente estas colunas:

```text
Ação | Mensagem
```

Cada linha deve conter uma ação/situação e a mensagem correspondente.

## Ações

A tabela deve manter exatamente estas colunas:

```text
Botão | Cor | Ação | Orientações/Observações
```

Preencher botões, cor, ação e orientação conforme a funcionalidade da US.

## Regras de negócio

Quando o modelo possuir:

```text
RN001 - [Descrição da regra de negócio]
```

Editar apenas o trecho dentro de `[ ]`.

Resultado esperado:

```text
RN001 - O sistema deve apresentar apenas a versão atual do Quadro Autorizado na linha principal da listagem.
```

Não remover `RN001`, `RN002`, `RN003` etc.

## Conferência após edição

Após editar o arquivo, conferir:

- Se o nome da US foi atualizado.
- Se a descrição está no formato correto.
- Se os critérios mantiveram `CAxx`.
- Se as regras mantiveram `RNxxx`.
- Se os fluxos permanecem separados.
- Se os títulos numerados continuam iguais.
- Se as tabelas mantiveram as colunas corretas.
- Se `Matriz de permissões` e `Documentos/Legislação` foram preservados.
- Se não houve edição em arquivo errado, duplicado ou na lixeira.

## Resposta final ao usuário

Ao finalizar a edição, informar:

- Nome do arquivo editado.
- Confirmação de que a estrutura foi preservada.
- Pontos principais preenchidos.
- Qualquer limitação encontrada, como necessidade de o usuário ampliar o modelo para receber mais itens.
