# `componentes/` — Catálogo de componentes

## Objetivo

Reunir todos os componentes React públicos do Design System SEPLAG e expô-los por meio de
um barrel curado.

## Responsabilidade principal

[`index.ts`](./index.ts) é a **superfície de componentes da biblioteca**. Ele decide o que
é API pública e o que permanece interno.

## Ponto de entrada

```ts
// src/index.ts
export * from "./componentes/index";
```

### Regra do barrel

Exportações são **nomeadas item a item**, nunca `export *` — com uma exceção deliberada na
linha 97: `export * from "./Fields"`, porque `Fields/index.ts` já é um barrel curado.

O arquivo também tem um efeito colateral na primeira linha:

```ts
import "./Loader/loader.css";
```

O CSS do loader é carregado sempre que o barrel é importado, garantindo o estilo do overlay
mesmo em consumo via subpath export.

## Organização do catálogo

| Área | Pastas |
| --- | --- |
| **Ações** | [`Botao`](./Botao/), [`GroupActions`](./GroupActions/), [`FormActions`](./FormActions/) |
| **Formulário — campos** | [`Fields`](./Fields/) (20 campos), [`CheckBoxSN`](./CheckBoxSN/), [`AutoComplete`](./AutoComplete/), [`DropdownBaseLegal`](./DropdownBaseLegal/), [`PickList`](./PickList/) |
| **Formulário — estrutura** | [`Rotulo`](./Rotulo/), [`FilterForm`](./FilterForm/), [`AnexarDocumento`](./AnexarDocumento/), [`ReactCrop`](./ReactCrop/) |
| **Dados** | [`TablePaginado`](./TablePaginado/), [`TabelaEditavel`](./TabelaEditavel/), [`TableGroup`](./TableGroup/), [`Accordion`](./Accordion/), [`ListaSimples`](./ListaSimples/), [`ListaBuscaAcao`](./ListaBuscaAcao/) |
| **Contêineres** | [`Card`](./Card/), [`PanelSeplag`](./PanelSeplag/), [`AccordionCard`](./AccordionCard/), [`Tabs`](./Tabs/), [`Divider`](./Divider/), [`EntityInfoCard`](./EntityInfoCard/) |
| **Overlays** | [`Modal`](./Modal/), [`ModalDelete`](./ModalDelete/), [`ModalDataMotivo`](./ModalDataMotivo/), [`Base64FileModal`](./Base64FileModal/) |
| **Feedback** | [`Mensagem`](./Mensagem/), [`Badge`](./Badge/), [`Loader`](./Loader/), [`SimpleLoader`](./SimpleLoader/), [`SkeletonSeplag`](./SkeletonSeplag/), [`SkeletonSimples`](./SkeletonSimples/) |
| **Exibição** | [`BarraProporcional`](./BarraProporcional/), [`ResumoValores`](./ResumoValores/) |
| **Layout** | [`layout/`](./layout/) (9 subpastas), [`NotFound`](./NotFound/) |
| **Permissão / navegação** | [`PermissaoNegadaRedirect`](./PermissaoNegadaRedirect/), [`UnsavedChangesWarning`](./UnsavedChangesWarning/) |
| **Negócio** | [`PaginaInicial`](./PaginaInicial/) |
| **Visual** | [`CustomIcons`](./CustomIcons/) |
| **Depreciados** | [`StatusByDataFimChip`](./StatusByDataFimChip/), [`StatusByFilterChip`](./StatusByFilterChip/) |

## Componentes-base

Dois componentes são dependência de quase todo o catálogo. Alterá-los propaga amplamente:

### [`BotaoSeplag`](./Botao/)
Usado por 24 componentes: `Badge`, `Modal`, `ModalDelete`, `Tabs`, `Accordion`,
`AccordionCard`, `Card`, `TableGroup`, `TablePaginado`, `TableRowActions`, `FormActions`,
`GroupActions`, `ListaBuscaAcao`, `NotFound`, `AppTopbar`, `AppProfile`, `AppSwitcher`,
`AutoComplete`, `ReactCrop`, `Base64FileModal`, `UnsavedChangesProvider`, `CPFField`,
`DropdownBaseLegal` (templates e chips) e `PaginaInicial/Cronograma`.

### [`RotuloSeplag`](./Rotulo/)
Usado por **todos os 20 campos** de `Fields/`, além de `PickList`, `AnexarDocumento` e
`AppProfile`. Responsável por: classe de grid (via `classesCssSeplag`), `<label htmlFor>`,
asterisco de obrigatório, tooltip de `info` e ícones laterais.

## Funcionalidades existentes

Panorama por área (o catálogo completo, com quantidades, está em §3.1 do
[documento de Objetivo](../../docs/objetivo-da-biblioteca-de-componentes.md)):

| Área | O que a pasta entrega |
| --- | --- |
| Campos de formulário | 20 campos com padrão dual-mode (com e sem `react-hook-form`), validação centralizada e ARIA |
| Dados | Tabela paginada lazy, agrupamento, expansão, ações de linha adaptativas e listas leves |
| Contêineres | Moldura de tela, seções, abas, separador e cartão de identificação |
| Overlays | Diálogo padrão, confirmação de exclusão, coleta de data + motivo e visualizador de arquivo base64 |
| Feedback | Mensagem inline, badge, overlay de carregamento e skeletons |
| Layout | Casca completa: sidebar com menu por permissão, topbar, perfil, seletor de sistemas e rodapé |
| Permissão | Filtro de menu, guarda de rota e grupo de ações condicionado a permissão |
| Negócio | `PaginaInicialSeplag` (Cronograma + Informativos) — exceção arquitetural |

## Dependências

### Externas (todas peer dependencies)
`react` · `primereact` · `primeflex` · `primeicons` · `react-hook-form` ·
`react-router-dom` · `@reduxjs/toolkit` · `react-redux` · `react-transition-group` ·
`react-icons` (uso único) · `react-cropper` · `date-fns` (única dependência direta)

### Internas
`componentes/` depende de [`uteis/`](../uteis/), [`tokens/`](../tokens/),
[`interfaces/`](../interfaces/), [`type/`](../type/), [`hooks/`](../hooks/),
[`provider/`](../provider/) e [`app/`](../app/) — sempre nessa direção descendente, sem ciclos
entre camadas.

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`hooks/`](../hooks/) | `useFiltersSeplag`, `useToastSeplag`, `useMensagemErroFormularioSeplag` |
| [`provider/`](../provider/) | Contextos exigidos por vários componentes (toast, PrimeReact) |
| [`uteis/`](../uteis/) | `classesCssSeplag` (prop `cols`), datas, CPF/CNPJ, base64 |
| [`tokens/`](../tokens/) | Paleta institucional |
| [`interfaces/`](../interfaces/) | `ResultsSeplag<T>`, `IPermissionResponseSeplag` |
| [`app/`](../app/) | Contrato de store exigido pelo `LoaderSeplag` |
| [`../docs/`](../docs/) | Site de documentação com exemplos executáveis de cada componente |

## Fluxos importantes

Ver §7 do [documento de Arquitetura](../../docs/arquitetura-da-biblioteca-de-componentes.md)
para os diagramas completos de:

- Fluxo de formulário (`useForm` → `Fields` → `RotuloSeplag` → `FieldError`)
- Fluxo de listagem paginada (`useFiltersSeplag` → RTK Query → `TablePaginadoSeplag`)
- Fluxo de notificação (`useToastSeplag` / `toastService` → `<Toast>`)
- Fluxo de autenticação e casca (`OAuth2LibSeplag` → `AuthThanosProviderSeplag` → `LayoutSeplag`)
- Fluxo de guarda de alterações não salvas

## Arquivos críticos

- [`index.ts`](./index.ts) — barrel público; remover uma linha é *breaking change*.
- [`Botao/index.tsx`](./Botao/index.tsx) e [`Rotulo/index.tsx`](./Rotulo/index.tsx) —
  componentes-base.
- [`Fields/utils/resolveFieldRules.ts`](./Fields/utils/resolveFieldRules.ts) — núcleo de
  validação de todos os campos.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **Exportações incompletas** | `BotaoEditarSeplag` e `BotaoRemoverSeplag` existem em `Botao/index.tsx` mas não estão no barrel — ambos são usados internamente por `PaginaInicial` (`Cronograma` e `Informativos`). `SkeletonSeplagProps` e `TableRowActionsSeplagProps` também ficam de fora. Ver R-08. |
| Média | **Import de asset no barrel** | Linha 159: `export { default as LogoSeplagBrancoVazado } from "../assets/img/LOGO SEPLAG - BRANCO VAZADO.svg";` — o nome do arquivo contém espaços e o caminho sobe um nível (`../assets`), fora de `componentes/`. |
| Média | **`PaginaInicial` no catálogo** | É o único módulo com chamadas HTTP, papéis de negócio e dependência de store do consumidor. Ver R-02. |
| Baixa | **Convenção de arquivo inconsistente** | A maioria usa `index.tsx`; `NotFound`, `StatusByDataFimChip`, `StatusByFilterChip`, `PaginaInicial` e todo `layout/*` (exceto `AppSwitcher` e `AppTopbar`) usam `<Nome>.tsx`. |
| Baixa | **Depreciados ainda exportados** | `StatusByDataFimChipSeplag` e `StatusByFilterChipSeplag` estão marcados `@deprecated` no barrel, com orientação para usar `BadgeSeplag` diretamente. |
| Baixa | **Mistura de alias e caminho relativo** | Alguns arquivos usam `@componentes/Botao`, a maioria usa `../Botao`. Funcional, mas inconsistente. Ver §5.2 do documento de Arquitetura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../docs/arquitetura-da-biblioteca-de-componentes.md)
- [Objetivo da biblioteca](../../docs/objetivo-da-biblioteca-de-componentes.md)
- README de cada subpasta desta pasta
