# Guia para gerar US no chat

Este guia define como uma História de Usuário deve ser criada no chat antes de ser aplicada ao arquivo modelo no Google Drive.

## Objetivo

Gerar o conteúdo completo da US em texto, respeitando o padrão usado pelo projeto SIGEP/SEPLAG, para que o usuário possa revisar, ajustar o modelo se necessário e autorizar a edição do arquivo no Drive.

## Princípio principal

O modelo de arquivo não é restritivo quanto à quantidade de conteúdo.

A US deve ser escrita conforme a necessidade funcional do cenário. Não existe limite fixo para:

- Premissas.
- Critérios de aceitação.
- Fluxos funcionais.
- Passos dentro de cada fluxo.
- Campos da descrição da tela.
- Mensagens e confirmações.
- Ações.
- Regras de negócio.
- Itens, subitens ou observações.

Se a US exigir mais itens do que o modelo contém, o conteúdo deve ser gerado mesmo assim. O usuário adapta o modelo quando necessário.

## Estrutura esperada da US

A US deve ser gerada seguindo esta ordem:

1. Histórico de alterações.
2. Identificação da US.
3. Descrição.
4. Premissas.
5. Critérios de aceitação.
6. Fluxos funcionais.
7. Descrição da tela.
8. Mensagens e confirmações.
9. Ações.
10. Regras de negócio.
11. Protótipo.

As seções `Matriz de permissões` e `Documentos/Legislação` devem ser mantidas no arquivo modelo, mas normalmente não precisam ser preenchidas ou alteradas no chat, salvo solicitação explícita.

## Identificação

Manter o prefixo `USXXX`.

Exemplo:

```text
Nome: USXXX - Listar Quadros Autorizados
```

Não substituir `USXXX` por numeração sequencial, a menos que o usuário peça explicitamente.

## Descrição

Usar o formato:

```text
Como [perfil do usuário],
Eu quero [objetivo funcional],
Para que [benefício ou resultado esperado].
```

A descrição deve ser específica para a funcionalidade da US e evitar texto genérico.

## Premissas

As premissas devem registrar condições, dependências e limites do cenário.

Não existe quantidade obrigatória. Criar apenas as premissas necessárias para deixar a US clara.

Exemplos de premissas úteis:

- Dependência de outra US.
- Dados que já devem existir.
- Escopo que pertence ou não pertence à US.
- Comportamento esperado do sistema antes da ação do usuário.
- Restrições legais, funcionais ou de regra de negócio.

## Critérios de aceitação

Os critérios devem ser objetivos e testáveis.

Quando o modelo possuir identificadores como `CA01`, `CA02`, `CA03`, eles devem ser preservados. No chat, gerar os critérios já com os identificadores.

Formato recomendado:

```text
CA01 - [Nome do critério]
Dado que [contexto],
Quando [ação ou evento],
Então [resultado esperado].
```

Se o critério não precisar de `Quando`, pode ser escrito de forma mais direta, desde que continue testável.

## Fluxos funcionais

Cada fluxo deve representar uma jornada funcional clara.

Não juntar fluxos diferentes em um só. Se a US tiver mais de um comportamento relevante, criar mais de um fluxo.

Formato recomendado:

```text
Fluxo - [Nome do fluxo funcional]
[Passo do fluxo]
[Passo do fluxo]
[Passo do fluxo]
```

No conteúdo do chat, os passos podem ser listados em sequência. Na edição do arquivo, não inserir numeração manual se o modelo já possuir lista numerada.

## Descrição da tela

Para cada grupo de tela, usar a estrutura:

```text
Descrição da tela - Grupo: [Nome do Grupo]
```

A tabela do grupo deve possuir exatamente estas colunas:

```text
Nome | Tipo | Editável | Obrigatório | Tamanho | Orientações/Observações
```

Preencher os campos conforme a necessidade da US. Não é obrigatório limitar a quantidade de linhas à quantidade existente no modelo.

## Mensagens e confirmações

Usar o grupo:

```text
Grupo: Mensagens e Confirmações
```

A tabela deve possuir exatamente estas colunas:

```text
Ação | Mensagem
```

Cada mensagem deve estar vinculada a uma ação ou situação clara.

## Ações

A tabela de ações deve possuir exatamente estas colunas:

```text
Botão | Cor | Ação | Orientações/Observações
```

As ações devem indicar o comportamento esperado do botão ou comando da tela.

## Regras de negócio

As regras devem ser objetivas, rastreáveis e independentes de layout.

Quando o modelo possuir identificadores como `RN001`, `RN002`, `RN003`, eles devem ser preservados. No chat, gerar as regras já com os identificadores.

Formato recomendado:

```text
RN001 - [Regra de negócio]
```

## Protótipo

Informar a URL da tela quando existir.

Exemplo:

```text
URL: http://localhost:5173/#/prototipos/sigep/controle-vagas/quadro-autorizado
Tela: Quadro Autorizado
```

## Validação antes de editar o Drive

Antes de aplicar no arquivo do Drive, o conteúdo gerado no chat deve ser revisado pelo usuário.

Somente editar o arquivo quando o usuário confirmar explicitamente.
