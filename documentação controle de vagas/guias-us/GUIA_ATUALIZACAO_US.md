# Guia para analisar e atualizar uma História de Usuário (US)

Este guia define como analisar uma US existente, propor uma nova versão e, somente após autorização explícita, editar o documento no Google Drive.

Ele complementa os guias de geração e edição de US. Deve ser usado quando o pedido for, por exemplo: “analise esta US”, “mostre como atualizar”, “compare como está e como ficará” ou “atualize a US para uma nova regra”.

## 1. Objetivo

Uma atualização de US deve preservar a rastreabilidade entre requisito, regra, tela, origem do dado e critério de teste. A proposta deve distinguir claramente:

- texto que existe na versão/aba analisada;
- lacunas identificadas na análise;
- texto que deve ser substituído;
- texto que deve ser incluído;
- conteúdo que pertence a outra US e não deve ser detalhado nesta.

Não apresentar uma síntese ou inferência como se fosse uma frase que já existe no documento.

A proposta de atualização deve preservar também o **formato nativo de cada seção da US**. Tabelas só podem ser usadas nas seções que já são tabelas no documento. Não criar tabelas apenas para comparar ou resumir conteúdo textual.

## 2. Antes de analisar

1. Ler os guias `GUIA_GERACAO_US_NO_CHAT.md`, `GUIA_EDICAO_US_NO_DRIVE.md` e `GUIA_COMPLETO_GERACAO_E_EDICAO_US.md`.
2. Abrir o documento e a **aba exata** indicada pelo usuário.
3. Confirmar no conteúdo lido o nome da US, a versão e o histórico de alterações.
4. Ler a US inteira: descrição, premissas, critérios, fluxos, tabelas de tela, mensagens, ações, regras e protótipos.
5. Analisar o protótipo e as regras relacionadas, quando disponíveis.
6. Separar requisito confirmado, comportamento atual do protótipo, mock e pendência de decisão.

Se o documento possuir mais de uma aba, não usar conteúdo de outra aba como se pertencesse à aba solicitada.

## 3. Regra de segurança: análise antes de edição

Não editar o Google Drive apenas porque o usuário pediu análise ou proposta de atualização.

Antes da edição, apresentar a proposta no chat e aguardar autorização explícita para editar o documento. A análise deve informar se alguma mudança exige nova linha de tabela, novo critério, nova regra ou novo fluxo.

## 4. Formato obrigatório da resposta de análise

Abrir a resposta deixando claro qual documento e qual aba foram analisados. Em seguida, usar esta sequência, omitindo somente se a seção não exigir mudança:

1. Histórico de alterações;
2. Identificação da US;
3. Descrição;
4. Premissas;
5. Critérios de aceitação;
6. Fluxos funcionais;
7. Descrição da tela;
8. Mensagens e confirmações;
9. Ações;
10. Regras de negócio;
11. Protótipo e divergências identificadas.

Para cada alteração, usar uma das marcações abaixo:

- **Como está**: copiar apenas texto realmente presente na aba analisada.
- **Atualizar para**: apresentar a nova redação completa.
- **Substituir esta premissa/critério/regra**: copiar o trecho atual e fornecer o substituto.
- **Incluir após**: indicar o ponto exato de inserção e fornecer o novo texto.
- **Manter sem alteração**: usar somente quando o trecho foi efetivamente analisado e não precisa mudar.
- **Lacuna identificada**: usar quando a informação não existe no documento; nunca escrever que ela “está” na US.

Ao apresentar a proposta, manter o formato da seção de origem:

- histórico de alterações: tabela com as colunas existentes no documento, normalmente `Data | Versão | Descrição | Autor`;
- descrição, premissas, critérios de aceitação e fluxos funcionais: texto e listas, conforme o modelo;
- descrição da tela: tabela com seis colunas;
- mensagens e confirmações: tabela com duas colunas;
- ações: tabela com quatro colunas;
- regras de negócio: tabela com duas colunas, quando esse for o formato da US analisada.

Não converter uma tabela existente em narrativa. Por exemplo, se o Histórico de alterações estiver em tabela, a análise deve mostrar a linha atual e a linha proposta no mesmo formato tabular; não deve escrevê-las em uma frase separada por travessões.

## 5. Histórico de alterações

Verificar se a versão indicada na aba corresponde à última linha do histórico. Se houver divergência, registrá-la antes de propor conteúdo funcional.

Para uma atualização, propor uma nova linha com:

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| data da revisão | próxima versão definida pelo projeto | resumo objetivo do que mudou | autor definido pelo usuário ou padrão do documento |

Não alterar versões já registradas.

Na proposta exibida no chat, usar a própria tabela de histórico para mostrar a alteração. Exemplo:

**Como está**

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 25/09/2026 | 1.0 | Criação da US. | Taylor A. Santos |

**Incluir após a última linha**

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| data da revisão | próxima versão | resumo objetivo da atualização | autor definido no documento |

## 6. Descrição, premissas e escopo

### Descrição

Manter o formato:

```text
Como [perfil],
Eu quero [objetivo],
Para que [benefício].
```

Atualizar a descrição somente quando o objetivo funcional mudou. Uma mudança de cálculo ou de fonte de dados pode exigir ajuste no benefício, sem transformar a descrição em detalhamento técnico.

### Premissas

Usar premissas para dependências, limites, origem dos dados, comportamento anterior à ação do usuário e delimitação de escopo.

Quando uma capacidade tiver US própria, a US atual deve informar apenas sua dependência ou efeito. Exemplo:

> Os quantitativos exibidos consideram versões válidas do quadro. O registro e a validação das versões pertencem à US específica de versionamento.

Não copiar para uma US de consulta o fluxo de edição de outra US.

## 7. Critérios de aceitação

Preservar os identificadores existentes `CA01`, `CA02` e assim por diante.

Critérios de aceitação são texto, não tabela. Para critérios alterados, apresentar o identificador e a redação integral substituta no mesmo formato da US:

```text
CA14 – Nome do critério
Dado que [contexto], quando [ação ou evento], então [resultado verificável].
```

Para critérios novos, informar o ponto de inclusão, escrever cada novo `CAxx` separadamente e indicar se os critérios posteriores devem ser renumerados pelo documento. Não usar tabela com colunas como “Critério” e “Como deve ficar”, salvo se a própria US analisada tiver critérios em tabela.

Todo critério deve ser testável e declarar contexto, ação/evento e resultado. Evitar critérios que apenas repitam o nome de um campo.

## 8. Fluxos funcionais

Atualizar apenas os passos que mudam. Informar claramente, por exemplo:

```text
Fluxo – Consultar cargos
Substituir o passo 4 por:
[novo passo]
```

Não misturar jornadas diferentes. Não detalhar fluxo de uma operação que pertence a US separada; referenciar a dependência em uma etapa de consulta, se necessário.

## 9. Descrição da tela

Toda proposta de alteração nesta seção deve estar em tabela, preservando estas colunas:

| Nome | Tipo | Editável | Obrigatório | Tamanho | Orientações/Observações |
|---|---|---:|---:|---|---|

Para um grupo existente:

- identificar a linha atual que será substituída ou removida;
- apresentar a linha substituta ou nova linha na mesma estrutura;
- declarar a origem do dado no formato `Origem: entidade/tela; campo, evento ou regra.`;
- explicar cálculos derivados, evitando termos vagos como “valor do sistema”.

Para grupo novo, apresentar o título `Grupo: [nome]` e a tabela completa do grupo.

## 10. Mensagens, ações e regras de negócio

### Mensagens e confirmações

Manter a tabela:

| Ação | Mensagem |
|---|---|

Mensagens devem refletir a regra atual. Remover ou substituir mensagens que prometam comportamento não existente, como criação automática de vagas quando a regra passou a exigir autorização formal.

### Ações

Manter a tabela:

| Botão | Cor | Ação | Orientações/Observações |
|---|---|---|---|

Uma US consultiva pode conter ações de navegação e visualização, mas não deve documentar edição, exclusão ou registro de nova versão como se fossem parte dela.

### Regras de negócio

Manter a tabela:

| Nº | Descrição da regra |
|---|---|

Preservar `RN001`, `RN002` e os demais identificadores existentes. Ao substituir uma regra, mostrar a redação atual e a redação nova. Para regra nova, indicar o ponto de inclusão e renumerar somente após a aprovação.

As regras devem ser independentes de layout. Uma boa regra permite validar o comportamento sem depender da posição de um botão na tela.

## 11. Comparação com o protótipo

Ao analisar o protótipo, separar três situações:

1. **Aderente:** requisito já refletido na tela e nos dados simulados.
2. **Pendente no protótipo:** requisito definido para a US, mas ainda ausente ou divergente da implementação.
3. **Fora de escopo:** recurso existente na tela, mas que pertence a outra US; registrar a dependência sem absorver seu fluxo.

Não usar dados fictícios do protótipo como regra de negócio sem decisão explícita do usuário.

## 12. Checklist antes de entregar a proposta

- Documento e aba corretos foram lidos.
- Nenhuma frase foi atribuída à US sem estar presente nela.
- Foi diferenciada lacuna de texto existente.
- Histórico de alterações foi avaliado.
- A descrição continua no formato de História de Usuário.
- `CAxx` e `RNxxx` foram preservados ou a renumeração foi claramente indicada.
- Alterações de tela foram apresentadas somente em tabelas com as seis colunas padrão.
- Fontes e fórmulas dos indicadores foram documentadas.
- Fluxos de outras USs não foram indevidamente incorporados.
- Mensagens, ações, regras e protótipo estão coerentes entre si.
- A proposta foi apresentada no chat antes de qualquer edição no Drive.

## 13. Checklist antes de editar o Google Drive

Editar somente após autorização explícita do usuário.

Antes da alteração:

1. Confirmar novamente o documento, a aba e a revisão atual.
2. Verificar se há linhas suficientes nas tabelas; se não houver, avisar o usuário antes de reestruturar o modelo.
3. Preservar títulos numerados, cabeçalhos, identificadores, matriz de permissões e documentos/legislação.
4. Editar células e campos previstos individualmente.
5. Usar a revisão atual do documento para evitar sobrescrever alterações concorrentes.
6. Reler o trecho modificado e validar estrutura, listas e tabelas após a edição.

## 14. Modelo curto para pedidos futuros

Quando o usuário pedir uma atualização de US, seguir esta instrução:

> Leia o `GUIA_ATUALIZACAO_US.md` e os demais guias da pasta `guias-us`. Analise somente a aba indicada da US, compare-a com as regras e o protótipo atuais e apresente uma proposta “Como está → Como ficará”. Não edite o Google Drive até eu autorizar explicitamente.

