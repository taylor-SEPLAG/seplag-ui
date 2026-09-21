# Guia do módulo de Vagas Comissionadas

## Finalidade

O módulo de Vagas Comissionadas organiza a estrutura autorizada de cada órgão e transforma seus quantitativos em vagas individualizadas para consulta operacional.

Ele responde a duas perguntas:

1. Qual é a estrutura autorizada de um órgão, incluindo cargos em comissão e funções de confiança?
2. Quais vagas derivam dessa estrutura e qual é a situação de cada uma?

O Quadro Autorizado é a fonte de dados. As Vagas Individualizadas são derivadas das dotações cadastradas no quadro.

## Conceitos principais

| Conceito | Significado |
| --- | --- |
| Órgão | Unidade responsável pelo quadro. Um órgão possui um único quadro no fluxo atual. |
| Quadro comissionado | Registro da estrutura organizacional autorizada de um órgão. |
| Código QC | Identificador funcional persistente, como QC-0001. Ele não muda com reordenação da lista nem com nova versão. |
| Versão | Registro histórico de uma alteração salva no quadro. As versões da mesma série mantêm o mesmo código QC. |
| Base legal | Documento que fundamenta estrutura e dotações autorizadas. |
| Nível | Camada da estrutura organizacional, como NÍVEL DE DIREÇÃO SUPERIOR. |
| Item e subitem | Nós da hierarquia organizacional dentro de um nível. |
| Dotação | Quantitativo de cargos e/ou funções ligado a um perfil e a um cargo DGA. |
| Cargo | Código DGA, como DGA-2 ou DGA-8. |
| Perfil profissional | Denominação profissional associada ao DGA em uma dotação. |
| Vaga individualizada | Posição gerada por cada unidade do quantitativo autorizado. |

## Visão do fluxo

~~~mermaid
flowchart LR
  A[Selecionar órgão] --> B[Informar base legal e vigência]
  B --> C[Montar níveis, itens, subitens e dotações]
  C --> D[Salvar quadro]
  D --> E[Consultar e versionar quadro]
  E --> F[Selecionar quadro nas vagas individualizadas]
  F --> G[Consultar vagas por DGA, perfil, natureza e situação]
~~~

## Telas e como usar

### Entrada do módulo

Rota: /prototipos/sigep/controle-vagas/comissionados

A tela inicial apresenta dois caminhos:

- **Quadro Autorizado:** cadastro, consulta e versionamento da estrutura.
- **Vagas Individualizadas:** consulta das posições geradas pelo quadro.

Use o Quadro Autorizado sempre que a alteração for estrutural ou legal. Use Vagas Individualizadas para localizar uma posição específica.

### Quadro de Vagas Comissionados

Rota: /prototipos/sigep/controle-vagas/comissionados/quadro-autorizado

Esta é a tela principal de gestão dos quadros.

#### Indicadores

| Indicador | Cálculo |
| --- | --- |
| Quadros cadastrados | Quantidade de quadros vigentes, um por série de versionamento. |
| Órgãos vinculados | Quantidade de órgãos dos quadros vigentes. |
| Cargos em comissão autorizados | Soma dos quantitativos de cargos em comissão. |
| Funções de confiança autorizadas | Soma dos quantitativos de funções de confiança. |
| Total de vagas comissionadas | Soma de cargos em comissão e funções de confiança. |

Os indicadores consideram somente a versão mais recente de cada quadro. Versões anteriores não duplicam os totais.

#### Filtros

- **Quadro:** pesquisa pelo código QC ou pelo nome.
- **Órgão:** permite selecionar um ou mais órgãos.
- **Situação:** Ativo, Extinto ou Encerrado.
- **Limpar:** restaura todos os filtros.

#### Tabela e ações

A tabela mostra o código QC, órgão, totais de cargos e funções, situação e ações.

- **Olho:** abre o resumo do quadro em modal.
- **Mais:** inicia nova versão quando o quadro está Ativo.
- **Seta:** abre ou fecha o histórico de versões anteriores.

O modal de visualização apresenta nome, órgão, versão, quantidade de níveis, itens e subitens, cargos autorizados e funções autorizadas.

### Novo Quadro Comissionado

Rota: /prototipos/sigep/controle-vagas/comissionados/quadro-autorizado/novo

Esta tela cadastra a estrutura autorizada de um órgão.

#### Base legal

Vincule o documento que fundamenta a estrutura. O quadro não pode ser salvo sem ao menos uma base legal.

#### Identificação do quadro

Informe o nome do quadro e o órgão ao qual ele pertence.

O órgão é o ponto central do cadastro. Quando já existe quadro para determinado órgão, ele aparece indisponível no seletor, identificado pelo código QC correspondente.

#### Vigência

Informe a data em que a estrutura passou a valer. A data não pode ser futura. Assim, o cadastro não produz quadros agendados: o quadro salvo entra como Ativo.

#### Estrutura organizacional

Monte a árvore da organização:

1. Adicione um nível.
2. Adicione itens dentro do nível.
3. Adicione subitens quando houver desdobramento organizacional.
4. Adicione dotações em cada item ou subitem.

Uma dotação informa perfil profissional, cargo DGA, quantidade de cargos em comissão e quantidade de funções de confiança.

O resumo por DGA permite consultar os quantitativos e abrir cada cargo para visualizar os perfis associados.

#### Salvar

O botão fica habilitado quando houver:

- Nome do quadro.
- Órgão.
- Data de vigência válida.
- Base legal vinculada.
- Pelo menos um nível.
- Motivo de versionamento, quando aplicável.

### Nova versão do quadro

Rota: /prototipos/sigep/controle-vagas/comissionados/quadro-autorizado/:id/nova-versao

A ação de nova versão copia o quadro vigente para um rascunho editável.

1. Acione **Mais** na linha do quadro ativo.
2. Revise a estrutura copiada.
3. Informe o motivo da alteração.
4. Salve a nova versão.

A versão somente aparece na listagem após o salvamento. Abrir a ação ou abandonar o formulário não incrementa a versão exibida.

O código QC não muda entre versões.

| Série | Versão | Código |
| --- | --- | --- |
| Estrutura da POLITEC | 1 | QC-0001 |
| Estrutura da POLITEC atualizada | 2 | QC-0001 |

### Vagas Individualizadas Comissionados

Rota: /prototipos/sigep/controle-vagas/comissionados/vagas

Esta tela é consultiva. Ela converte as dotações do quadro selecionado em vagas individuais.

Ao abrir a tela, os indicadores ficam zerados, os filtros dependentes ficam bloqueados e a tabela fica vazia. Selecione um quadro para iniciar a consulta.

#### Como uma vaga é gerada

Cada unidade de quantidade informada em uma dotação gera uma vaga.

| Cargo | Perfil profissional | Cargos | Funções | Vagas geradas |
| --- | --- | ---: | ---: | --- |
| DGA-8 | Assistente Técnico I | 2 | 0 | DGA-8-C-001 e DGA-8-C-002 |
| DGA-2 | Diretor-Geral | 0 | 1 | DGA-2-F-001 |

A letra **C** identifica cargo em comissão. A letra **F** identifica função de confiança.

#### Indicadores

A primeira linha mostra quadro, órgãos vinculados, cargos autorizados, funções autorizadas e total de vagas. A segunda linha divide os totais por natureza e situação:

- Cargos disponíveis, em ocupação e ocupados.
- Funções disponíveis, em ocupação e ocupadas.

#### Filtros e tabela

Depois de selecionar o quadro, é possível filtrar por nível, cargo DGA, perfil profissional com multiseleção, natureza e situação.

A tabela apresenta nome da vaga, nível e caminho organizacional, cargo DGA, perfil profissional, natureza, situação e ação de visualizar.

O modal de detalhe exibe quadro e versão de origem, órgão, estrutura, cargo, perfil, natureza, situação, início de vigência e referências da base legal.

## Regras de negócio

### Exclusividade por órgão

Um novo quadro não pode ser cadastrado para órgão que já possua quadro no módulo. A exceção é a nova versão do mesmo quadro, que mantém o órgão da série existente.

### Código QC persistente

O código QC é gravado no cadastro e compartilhado por todas as versões do quadro.

Registros antigos sem código recebem um código na primeira leitura e ele é salvo no armazenamento local. O código não depende de ordem alfabética, filtros ou inclusão de outros órgãos.

### Situações de quadro

| Situação | Uso |
| --- | --- |
| Ativo | Quadro vigente e apto a receber nova versão. |
| Extinto | Quadro cuja base legal ou estrutura foi extinta. |
| Encerrado | Quadro encerrado sem operação vigente. |

### Situações de vaga

| Situação | Significado |
| --- | --- |
| Disponível | Vaga autorizada sem ocupante. |
| Em ocupação | Vaga reservada por processo de ingresso de servidor comissionado. |
| Ocupada | Vaga vinculada a servidor em exercício. |

## Dados e dependências técnicas

### Componentes principais

| Arquivo | Responsabilidade |
| --- | --- |
| src/prototipos/controleVagasComissionados/VagasComissionadosContent.tsx | Página inicial do módulo. |
| src/prototipos/controleVagasComissionados/QuadroAutorizadoComissionadoLista.tsx | Listagem, filtros, indicadores, visualização e histórico. |
| src/prototipos/controleVagasComissionados/NovoQuadroComissionadoContent.tsx | Cadastro e versionamento do quadro. |
| src/prototipos/controleVagasComissionados/VagasIndividualizadasContent.tsx | Geração e consulta das vagas individuais. |
| src/prototipos/controleVagasComissionados/novoQuadroComissionadoStore.ts | Modelo, carga inicial da POLITEC, persistência e código QC. |
| src/prototipos/controleVagasComissionados/QuadroAutorizadoContent.tsx | Roteador exclusivo do fluxo comissionado. |

### Bibliotecas e componentes

O módulo depende de React, React Router, React Hook Form, PrimeReact e dos componentes SEPLAG para campos, botões, badges, breadcrumb, tabela e modal.

### Persistência atual

O protótipo usa localStorage do navegador.

| Chave | Conteúdo |
| --- | --- |
| sigep:quadros-comissionados:cadastros:v1 | Quadros efetivamente salvos. |
| sigep:quadros-comissionados:rascunho:v1 | Rascunho aberto para cadastro ou versionamento. |

Os dados pertencem ao navegador e à máquina em uso. Essa persistência não substitui banco de dados, API, auditoria institucional, permissões ou controle de acesso.

### Fonte de referência inicial

O quadro da POLITEC foi incorporado a partir do Anexo I do Decreto nº 2.252/2026. A planilha serviu como referência de carga inicial; o módulo não consulta a planilha em tempo real.

## Limites atuais do protótipo

- Não há integração com backend.
- Não há fluxo de ingresso, nomeação, posse ou exercício.
- Todas as vagas derivadas do quadro começam como Disponíveis.
- As situações Em ocupação e Ocupada dependem da integração com processos responsáveis.
- A visualização do quadro é um resumo; a árvore completa pode ser a próxima evolução do modal.
- A lista de órgãos disponíveis para cadastro é definida no protótipo e deve ser integrada ao cadastro organizacional em produção.

## Evolução recomendada

1. Substituir localStorage por API e banco de dados.
2. Integrar órgãos e documentos legais aos cadastros institucionais.
3. Criar fluxo de alteração de situação do quadro: Ativo, Extinto e Encerrado.
4. Integrar vagas aos processos de ingresso e ocupação.
5. Registrar histórico e auditoria de cada alteração.
6. Expandir o modal do quadro para navegar pela árvore de níveis, itens, subitens e dotações.

## Proposta pendente de aprovação: Importar estrutura de outro quadro

**Status: aguardando aprovação do cliente.**

A proposta acrescenta a ação **Importar estrutura** ao bloco **Estrutura organizacional** do cadastro e do versionamento de quadro comissionado.

### Fluxo proposto

1. O usuário aciona **Importar estrutura**, ao lado de **Adicionar nível**.
2. O sistema abre um modal com os quadros comissionados salvos.
3. O usuário seleciona o quadro de origem e consulta uma prévia com código QC, órgão, versão, níveis, itens, subitens e dotações.
4. O usuário confirma a importação.
5. O sistema substitui a estrutura em edição pela cópia importada.

A origem sempre será a versão mais recente salva de cada quadro. Rascunhos não aparecerão na seleção.

### Dados importados

- Níveis.
- Itens e subitens.
- Nomes da estrutura.
- Perfis profissionais.
- Cargo ou DGA de cada dotação.

### Dados zerados ou não importados

| Tratamento | Dados |
| --- | --- |
| Zerados | Quantidade de cargos e quantidade de funções em cada dotação. |
| Não importados | Nome do novo quadro, órgão, base legal, vigência, situação, versão e motivo de versionamento. |

Exemplo: uma dotação de origem com perfil Diretor-Geral da POLITEC, DGA-2, zero cargos e uma função será importada com o mesmo perfil e DGA, mas com zero cargos e zero funções.

### Proteção contra perda de dados

Se já houver estrutura preenchida no formulário, o modal exibirá um aviso: a importação substituirá todos os níveis, itens, subitens e dotações atuais. A ação exigirá confirmação explícita.

### Prévia da origem

| Quadro | Órgão | Versão | Estrutura |
| --- | --- | ---: | --- |
| QC-0001 — Estrutura organizacional da POLITEC | POLITEC | 1 | 7 níveis, 136 itens e subitens |

A implementação poderá registrar tecnicamente a origem, por exemplo: “Estrutura importada de QC-0001, versão 1”. Essa referência não cria vínculo de versionamento nem copia a base legal do quadro de origem.
