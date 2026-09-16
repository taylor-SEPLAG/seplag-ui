# Padrão visual — Controle de Vagas

Este documento define o padrão visual e de componentes das telas de listagem do **Controle de Vagas**. A referência é a tela **Quadro Servidores Efetivos**.

## Aplicação do padrão

A referência deve orientar as telas de Efetivos, Temporários, Comissionados e Bolsistas. As diferenças de dados e de regra de negócio podem reduzir filtros, KPIs ou colunas; elas não justificam trocar os componentes, a hierarquia visual ou o comportamento comum da listagem.

## Referência: Quadro Servidores Efetivos

Rota: `/#/prototipos/sigep/controle-vagas/quadro-autorizado`

| Área | Componente/padrão | Contrato visual e comportamental |
| --- | --- | --- |
| Casca do sistema | `PrototypeSystemPage` | Topbar SIGEP, menu lateral, área central e rodapé compartilhados. |
| Navegação contextual | `BreadcrumbVagas` + `BreadcrumbSeplag` | Breadcrumb no topo do conteúdo; atalho à lista de vagas no lado direito quando aplicável. |
| Cabeçalho | `prototype-quadro-header` | Título de 1,25rem, descrição de apoio, linha divisória inferior e espaço antes dos KPIs. |
| KPIs | `prototype-quadro-kpis` | Cinco cartões em grade, borda superior azul, ícone em fundo azul-claro, rótulo e valor. O grid reduz para duas e uma colunas em telas menores. |
| Filtros | `TextFieldSeplag`, `DropdownFieldSeplag`, `BotaoLimparFiltroSeplag` | Rótulo SEPLAG, campo com altura uniforme, ícone de busca no texto, dropdown com limpar e botão azul de limpar filtros. |
| Barra de ação | `prototype-quadro-table-toolbar` + `BotaoAdicionarSeplag` | Faixa cinza-clara antes da tabela, com botão primário `Novo Quadro`. |
| Tabela | `TablePaginadoSeplag` | Grade com cabeçalho cinza-claro, linhas zebradas, bordas, ordenação, paginação e seletor de linhas por página. |
| Células | `BadgeSeplag` e corpos de coluna | Código e informações secundárias em duas linhas quando necessário; quantitativos centralizados; situação como badge compacto. |
| Ações | `BotaoIconSeplag` em `prototype-quadro-actions` | Visualizar em azul. Ação `Criar nova versão` usa ícone `+` verde. Edição e exclusão só existem nos estados permitidos pela regra de negócio. |
| Histórico | `prototype-quadro-expander` + expansão do `TablePaginadoSeplag` | Seta discreta, sem fundo azul permanente, na última coluna. A expansão mostra versões anteriores e paginação quando necessário. |
| Detalhes e confirmações | `ModalSeplag`, `ModalDeleteSeplag`, `MensagemSeplag` | Usados para visualização, confirmação e feedback quando o fluxo exigir. |

## Quadro de Vagas Comissionados

Rota: `/#/prototipos/sigep/controle-vagas/comissionados/quadro-autorizado`

### Componentes presentes

| Área | Implementação atual |
| --- | --- |
| Casca e navegação | `PrototypeSystemPage`, `BreadcrumbVagas`, `BreadcrumbSeplag` e atalho para Vagas Comissionados. |
| Cabeçalho | `prototype-quadro-header`. |
| KPIs | `prototype-quadro-kpis`, com: Quadros cadastrados, Órgãos vinculados, Cargos em comissão autorizados, Funções de confiança autorizadas e Dotações registradas. |
| Filtros | `TextFieldSeplag`, `DropdownFieldSeplag` e `BotaoLimparFiltroSeplag`. |
| Barra de ação | `prototype-quadro-table-toolbar` e `BotaoAdicionarSeplag`. |
| Tabela | `TablePaginadoSeplag`, com ordenação, paginação e seletor de linhas por página. |
| Situação | `BadgeSeplag` compacto. |
| Ações | `BotaoIconSeplag` para visualizar e criar nova versão. |
| Histórico | Expansão de linha com `prototype-quadro-expander` e tabela de versões anteriores. |

### Diferenças válidas por regra de negócio

- Os filtros **Cargo** e **Tipo de vínculo** não se aplicam ao quadro comissionado e permanecem ausentes.
- As colunas de ocupação, comprometimento, disponibilidade e pendência de distribuição pertencem ao controle individualizado de Efetivos e não integram esta listagem.
- As colunas próprias são: **Quadro, Órgão, Cargos, Funções, Situação e Ações**.
- A listagem apresenta a versão atual de cada quadro; as anteriores ficam na expansão da linha.

### Ajustes realizados para aderência ao padrão

- A tabela usa `TablePaginadoSeplag`; a implementação manual anterior foi removida.
- Os filtros usam os componentes de campo SEPLAG; foram removidos o input e o dropdown montados localmente.
- A barra, cabeçalho, KPIs, tabela, paginação e botões reutilizam as classes estruturais de Efetivos.
- O badge de situação foi limitado ao tamanho do conteúdo.
- Órgão, Cargos e Funções são centralizados no cabeçalho e nas células.
- O botão de edição foi substituído por `Criar nova versão` para quadros ativos.
- O expansor de versões passou a usar o mesmo botão discreto de Efetivos.

## Regras de evolução

1. Reutilize componentes de `src/componentes` antes de criar controles locais.
2. Use `TablePaginadoSeplag` em listagens administrativas paginadas.
3. Mantenha `prototype-quadro-page`, `prototype-quadro-header`, `prototype-quadro-kpis`, `prototype-quadro-card`, `prototype-quadro-library-filters`, `prototype-quadro-table-toolbar` e `prototype-quadro-library-table` como a estrutura base.
4. Use `BotaoIconSeplag` para ações e `prototype-quadro-expander` para expansão de histórico.
5. Mantenha KPIs e dados específicos de cada modalidade, mas preserve tamanho, espaçamento, tipografia, bordas, cores e responsividade do padrão.

## Padrão visual: cadastro de quadro autorizado

A tela de referência é **Novo Quadro** de Servidores Efetivos. Todo cadastro do Controle de Vagas deve manter a mesma moldura, tipografia, espaçamentos e componentes de apresentação, preservando somente os campos necessários a cada modalidade.

| Área | Componente ou classe padrão | Regra visual |
| --- | --- | --- |
| Página e cabeçalho | `prototype-quadro-page` e `prototype-quadro-header` | Fundo cinza-claro da área de trabalho; título e descrição alinhados à esquerda, sem selo adicional no cabeçalho. |
| Mensagens | `MensagemSeplag` | Sucesso e validações aparecem no padrão institucional de alerta. |
| Organização do formulário | `prototype-quadro-form` | Seções empilhadas, com intervalo uniforme de `1rem`. |
| Base legal | `BaseLegalVinculada` e `prototype-base-legal-card` | Primeiro bloco do cadastro, com o componente institucional de documentos legais associados. |
| Seções | `prototype-quadro-form section` | Cartão branco com borda, título, ícone em fundo azul-claro, descrição e divisor no cabeçalho. |
| Vigência | `DateFieldSeplag` ou composição equivalente | Campo de data acompanhado pelo cartão de situação calculada. |
| Ações finais | `prototype-quadro-form-actions` + `BotaoVoltarSeplag` + `BotaoSalvarSeplag` | Barra branca com borda, ações alinhadas à direita e espaçamento institucional. |

### Cadastro de Vagas Comissionados

O cadastro de comissionados segue o padrão acima para página, cabeçalho, Base legal, mensagens, cartões, vigência e rodapé. Os editores de **nível, item, subitem e dotação** permanecem próprios porque permitem a árvore organizacional ilimitada e os quantitativos por simbologia, cargo e função. O resumo por simbologia também permanece como componente específico do domínio.
## Vagas individualizadas: comissionados

A tela de **Vagas Individualizadas — Comissionados** é consultiva e deriva suas posições da versão mais recente de cada Quadro de Vagas Comissionados. Não reutiliza carreira, concurso, ingresso, ocupação ou distribuição dos Servidores Efetivos.

- Cada quantidade de `Cargo em comissão` e `Função de confiança` de uma dotação gera uma posição individualizada.
- O identificador segue `QC-xxxx-SIMBOLOGIA-C/F-nnn`.
- A posição herda quadro, órgão, versão, estrutura, perfil, simbologia, base legal e vigência.
- A tabela utiliza os componentes padrão `TextFieldSeplag`, `DropdownFieldSeplag`, `BotaoLimparFiltroSeplag`, `TablePaginadoSeplag`, `BadgeSeplag` e `ModalSeplag`.
- O cadastro de posições é automático; a tela não permite inclusão, edição ou exclusão manual.
- Enquanto o módulo não recebe nomeações, a situação exibida reflete apenas a vigência da versão: `Ativa` ou `Vigência futura`.
