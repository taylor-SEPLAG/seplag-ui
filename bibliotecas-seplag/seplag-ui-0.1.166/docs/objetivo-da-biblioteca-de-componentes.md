# Objetivo da biblioteca de componentes

> Documento oficial de propósito do pacote `@seplag/ui-lib-react-18`.
> Complementa o documento [Arquitetura da biblioteca de componentes](./arquitetura-da-biblioteca-de-componentes.md).
>
> Convenção: afirmações sem marcação são **fatos verificados no código-fonte**.
> Interpretações e intenções não comprovadas aparecem marcadas como **Hipótese**.

---

## 1. Propósito principal

`@seplag/ui-lib-react-18` é o **Design System padrão da SEPLAG-MT** distribuído como pacote
npm para as aplicações React da Secretaria de Estado de Planejamento e Gestão de Mato Grosso.

A descrição declarada em `package.json` é literal:

> *"Design System padrão Seplag — biblioteca de componentes React"*

E a página inicial do site de documentação (`src/App.tsx`) declara o propósito operacional:

> *"Importe, valide e experimente componentes padrão da SEPLAG. Garanta consistência e
> qualidade antes da publicação em produção."*

Em termos concretos, a biblioteca entrega **quatro coisas ao mesmo tempo**:

1. **Vocabulário visual** — componentes prontos, com cores, espaçamentos e tipografia
   institucionais (`src/tokens/colors.ts`).
2. **Casca de aplicação** — o layout completo (sidebar, topbar, perfil, rodapé, troca de
   sistema) que faz um sistema novo "parecer SEPLAG" no primeiro dia
   (`src/componentes/layout/`).
3. **Infraestrutura transversal** — autenticação OAuth2, factory de cliente HTTP com
   tratamento padronizado de erro, sistema de notificações e loader global
   (`src/lib/`, `src/provider/`).
4. **Andaime de desenvolvimento** — CLI `seplag-generate` que gera a estrutura de um CRUD
   completo a partir de templates (`src/_generator/`, `src/template/`).

### 1.1 Escopo institucional

O `src/type/sistemas.ts` e o `src/componentes/layout/AppSwitcher/sistemasSeplag.tsx`
identificam **nove sistemas** como público-alvo:

| Sistema | URL registrada |
| --- | --- |
| Gestão de Pessoas | `/gestao/app` |
| Folha | `/folha/app` |
| e-Social | `/integracao/app` |
| Perícia | `#` (ainda não publicado) |
| Consignado | `#` |
| Contagem de Tempo | `#` |
| Aposentadoria | `#` |
| Conformidade | `#` |
| Auditoria | `#` |

**Hipótese:** os `#` indicam sistemas planejados ou ainda não integrados ao ecossistema.
O código não registra o motivo.

---

## 2. Problemas que a biblioteca resolve

### P-01 — Divergência visual entre sistemas do mesmo órgão

**Problema:** nove sistemas construídos por equipes e em momentos diferentes tendiam a
divergir em cor de botão, formato de rótulo, comportamento de tabela e texto de mensagem.

**Solução no código:**
- `src/tokens/colors.ts` centraliza a paleta com o comentário explícito
  *"Importe daqui ao invés de definir cores localmente nos componentes."*
- `BotaoSeplag` expõe 5 variantes fixas (`base`, `save`, `back`, `clear`, `icon`) com estilos
  pré-definidos, além de wrappers semânticos (`BotaoSalvarSeplag`, `BotaoVoltarSeplag`,
  `BotaoConsultarSeplag`, `BotaoAdicionarSeplag`, `BotaoFecharSeplag`, `BotaoLimparFiltroSeplag`).
- `AppPrimeReactProviderSeplag` fixa a configuração do PrimeReact (`zIndex`, `ripple`,
  `filterMatchModeOptions`) — o comentário no arquivo diz: *"Compartilhada para evitar
  divergência entre aplicações."*
- `institucional.ts` centraliza o texto do órgão para *"evitar divergência de redação"*.

### P-02 — Boilerplate repetitivo de formulário

**Problema:** cada campo de formulário exigia repetir: `<Controller>`, montagem de `rules`
de obrigatoriedade, `<label>` com asterisco, classe de grid, renderização de erro,
`aria-invalid`, `aria-describedby`, `data-testid`.

**Solução no código:** o subsistema `src/componentes/Fields/` — **19 componentes de campo**
que encapsulam todo esse ciclo. O consumidor escreve:

```tsx
<TextFieldSeplag
  name="nome"
  label="Nome"
  control={control}
  required
  cols="12 6"
  getFormErrorMessage={obterMensagemErro}
/>
```

E recebe: grid responsivo, rótulo com asterisco, validação de obrigatório que rejeita
espaços em branco, `id`/`data-testid` derivados do `name`, atributos ARIA e mensagem
de erro com `id` correlacionado.

O hook `useMensagemErroFormularioSeplag` existe explicitamente para esse fim — seu JSDoc diz:
*"Elimina a duplicação da função `obterMensagemErro` / `getFormErrorMessage` em todos os
componentes de formulário do sistema."*

### P-03 — Tratamento inconsistente de erro de API

**Problema:** cada tela tratava erro HTTP de um jeito; mensagens do backend chegavam em
formatos diferentes (`message`, `error`, `fieldsValidation[]`, ou até HTTP 200 com corpo de erro).

**Solução no código:** `createBaseApiSliceSeplag` centraliza:
- Injeção do `Bearer` token, com lista de `publicEndpoints` isentos.
- `extractErrorMessage` com precedência definida:
  `fieldsValidation[0].message` → `message` → `error` → `Erro {status}` → `"Erro desconhecido"`.
- Detecção de **erro disfarçado de 200**: corpo com `keyError` + `message` é convertido em
  `CUSTOM_ERROR`.
- Toast automático de erro, com escape via `extraOptions.naoExibirMensagemErro`.
- Log de depuração ligável por `localStorage["seplag:debugApi"]`, com `Authorization` mascarado.

### P-04 — Repetição do fluxo "filtro → busca → paginação"

**Problema:** toda tela de listagem reimplementava debounce, reset de página ao mudar filtro,
mínimo de caracteres para disparar busca, e perda de filtro ao navegar e voltar.

**Solução no código:** `useFiltersSeplag` resolve os cinco pontos de uma vez:

| Necessidade | Mecanismo |
| --- | --- |
| Debounce seletivo | `debouncedFields` + `useDebouncedValueSeplag` (400 ms padrão) |
| Mínimo de caracteres | `minChars` (3 padrão) — bloqueia busca com `0 < len < minChars` |
| Validação custom por campo | `isValidField(campo, valor)` — ex.: campo com máscara incompleta |
| Reset automático de página | Página volta a 0 sempre que os filtros mudam |
| Persistência entre navegações | `storageKey` → `localStorage` com `{ filters, page, rows }` |

Também expõe `resetAll`, `resetField` e `refetch` (repete a última busca com os mesmos argumentos).

### P-05 — Reimplementação da casca da aplicação

**Problema:** cada sistema novo reconstruía sidebar, topbar, menu com permissão, perfil de
usuário, troca de vínculo e rodapé.

**Solução no código:** `LayoutSeplag` entrega tudo isso em um único componente, incluindo:
- Dois modos de menu (`static` que empurra o conteúdo, `overlay` que flutua sobre ele).
- Comportamento responsivo (`window.innerWidth > 1024` define desktop) com backdrop no mobile.
- Sidebar recolhida com *flyouts* posicionados e tooltip, coordenados por
  `sidebarFlyoutRegistry` para que só um fique aberto.
- Menu recursivo de profundidade arbitrária (`AppSubmenuSeplag` ↔ `AppSubmenuItemSeplag`).
- Detecção de rota ativa com suporte a parâmetros dinâmicos (`:id` vira `[^/]+`).
- Modais de troca de senha e de vínculo já montados no `AppProfileSeplag`.

### P-06 — Controle de acesso por menu e por rota

**Problema:** esconder itens de menu e bloquear rotas conforme as permissões do usuário.

**Solução no código:** `src/componentes/layout/Config/menu.ts`:
- `getPermissionsSeplag(storageKey)` lê o array de papéis do `localStorage`.
- `hasPermissionByKeysSeplag(keys, permissions, adminRole)` — `ROLE_ADMIN` libera tudo.
- `hasPermissionByRouteListSeplag(menu, ...)` percorre a árvore, marca `visibleOnRouter`/
  `visibleOnMenu` e aplica **herança de visibilidade**: um item pai com filhos, mas sem
  nenhum filho visível, é ocultado. Itens com `label === null` nunca aparecem no menu
  (mas podem permanecer roteáveis).
- `deepCloneMenuSeplag(items)` — necessário porque `hasPermissionByRouteListSeplag` **muta**
  o array recebido.
- `PermissaoNegadaRedirectSeplag` cobre o caso de acesso direto por URL: exibe um toast de
  atenção (uma única vez, via `useRef`) e redireciona com `<Navigate replace>`.

### P-07 — Perda de dados por navegação acidental

**Problema:** usuário preenche um formulário longo e sai da tela sem salvar.

**Solução no código:** `UnsavedChangesProviderSeplag` intercepta a History API do navegador
(`pushState`/`replaceState`), o evento `popstate` e o `beforeunload`, exibindo um modal de
confirmação. As telas sinalizam o estado sujo com `useUnsavedChangesSyncSeplag(isDirty)` e
podem proteger ações arbitrárias com `useUnsavedChangesSeplag().guard(acao)`.

### P-08 — Feedback de carregamento e de operação

**Problema:** cada tela inventava seu spinner e sua mensagem de sucesso.

**Solução no código:**
- `LoaderSeplag` — overlay global com o brasão do Estado, dirigido por contador Redux
  (`loaderSliceSeplag`), permitindo requisições concorrentes sem "piscar".
- `SimpleLoaderSeplag` — mesma aparência, controlada por prop booleana, sem Redux.
- `SkeletonSeplag` / `SkeletonSimplesSeplag` — placeholders de carregamento.
- `useToastSeplag` — atalhos semânticos: `toastPreset("created"|"updated"|"deleted")` gera
  *"Registro cadastrado/atualizado/excluído com sucesso!"*, além de `toastSucesso`,
  `toastErro`, `toastAtencao` e `printToast`.

### P-09 — Acessibilidade e testabilidade tratadas caso a caso

**Problema:** `data-testid` ausente ou inconsistente inviabiliza testes E2E; atributos ARIA
esquecidos comprometem a acessibilidade.

**Solução no código:** convenção sistemática (detalhada em §3.4 do documento de Arquitetura):
`id` e `data-testid` derivados do `name`, sufixos determinísticos para partes internas
(`-error`, `-fechar`, `-acao`, `-toggle`, `-remover`), `aria-invalid` e `aria-describedby`
correlacionados ao nó de erro, e `BotaoSeplag` gerando `data-testid` a partir do `label`
quando nenhum é informado.

### P-10 — Tempo de partida de um CRUD novo

**Problema:** criar uma tela de cadastro completa (listagem, filtro, formulário, criar,
editar, visualizar, rotas, slices RTK Query) parte do zero toda vez.

**Solução no código:** o binário `seplag-generate` (`src/_generator/generate.js`, 303 linhas)
e os templates de `src/template/`. Os arquivos usam extensão `.hbs`, mas **não usam Handlebars**:
`generate.js` implementa um renderizador próprio que substitui `{{helper chave}}` por meio de
regex, com os helpers `pascalCase`, `camelCase`, `kebabCase`, `constantCase` e `lowerCase`.

```
Container.tsx · List.tsx · Filter.tsx · Table.tsx · Form.tsx
Create.tsx · Edit.tsx · View.tsx · PageRoutes.ts
Request.ts · Response.ts
feat/ → Buscar · BuscarPorId · ListAll · CreateSlice · UpdateSlice · DeleteSlice
```

---

## 3. Funcionalidades centrais

### 3.1 Panorama por área

| Área | Componentes / módulos | Nº |
| --- | --- | --- |
| **Campos de formulário** | `TextField`, `TextAreaField`, `EmailField`, `NumberField`, `CurrencyField`, `MaskField`, `TelefoneComercialField`, `CPFField`, `CNPJField`, `DateField`, `DateTimeField`, `FieldsetDateField`, `DropdownField`, `MultiSelectField`, `CheckboxField`, `CheckboxList`, `RadioButtonField`, `SwitchField`, `SearchField`, `ImageUploadField` | 20 |
| **Formulário — apoio** | `RotuloSeplag`, `CheckboxSNSeplag`, `AutoCompleteSeplag`, `DropdownBaseLegalSeplag`, `FilterFormSeplag`, `FilterActionsSeplag`, `FormActionsSeplag`, `AnexarDocumentoSeplag`, `PickListSeplag`, `ImageCropperSeplag` | 10 |
| **Ações** | `BotaoSeplag` + 8 variantes, `GroupActionsSeplag` | 2 famílias |
| **Dados** | `TablePaginadoSeplag`, `TableGroupHeaderSeplag`, `TableGroupFooterSeplag`, `AccordionSeplag`, `ListaSimplesSeplag`, `ListaBuscaAcaoSeplag` | 6 |
| **Contêineres** | `CardSeplag`, `PanelSeplag`, `AccordionCardSeplag`, `TabsSeplag`, `DividerSeplag`, `EntityInfoCardSeplag` | 6 |
| **Overlays** | `ModalSeplag`, `ModalDeleteSeplag`, `Base64FileModalSeplag` | 3 |
| **Feedback** | `MensagemSeplag`, `BadgeSeplag` + 5 variantes, `LoaderSeplag`, `SimpleLoaderSeplag`, `SkeletonSeplag`, `SkeletonSimplesSeplag`, `ToastProviderSeplag` + `useToastSeplag` | 7 famílias |
| **Layout** | `LayoutSeplag`, `AppTopbarSeplag`, `AppMenuSeplag`, `AppSubmenuSeplag`, `AppSubmenuItemSeplag`, `AppProfileSeplag`, `AppSwitcherSeplag`, `AppFooterSeplag`, `NotFoundSeplag` | 9 |
| **Permissão** | `getPermissionsSeplag`, `hasPermissionByKeysSeplag`, `hasPermissionByRouteListSeplag`, `deepCloneMenuSeplag`, `PermissaoNegadaRedirectSeplag` | 5 |
| **Infraestrutura** | `OAuth2LibSeplag`, `createBaseApiSliceSeplag`, `AuthThanosProviderSeplag`, `AppPrimeReactProviderSeplag` | 4 |
| **Hooks** | `useFiltersSeplag`, `useDebouncedValueSeplag`, `useToastSeplag`, `useMensagemErroFormularioSeplag`, `useUnsavedChangesSeplag`, `useUnsavedChangesSyncSeplag` | 6 |
| **Utilitários** | datas, CPF/CNPJ, base64, grid, validações | ~20 funções |
| **Negócio** | `PaginaInicialSeplag` (Cronograma + Informativos) | 1 |
| **Ícones** | 9 `CustomIcons` (SVG dos sistemas SEPLAG) | 9 |

### 3.2 Funcionalidades que só existem por serem transversais

Recursos que não fazem sentido em um componente isolado e justificam a existência da lib:

- **Padrão dual-mode** (com e sem `react-hook-form`) replicado em 21 componentes.
- **Opções inativas** (`Fields/utils/inactiveOption.ts`): options com `inactive: true` recebem
  badge vermelho "Inativo", são reordenadas para o fim da lista e disparam toast de atenção
  ao serem selecionadas. Vale para `DropdownFieldSeplag` e `MultiSelectFieldSeplag`.
- **Virtual scroller adaptativo**: ativado apenas acima de 200 itens (`itemSize: 43`), para
  que painéis pequenos encolham naturalmente — comentário explica o bug do PrimeReact que
  motivou a regra.
- **Busca normalizada**: campo `_search` pré-computado sem acentos (NFD + lowercase),
  evitando rodar normalização a cada tecla em listas grandes ("custo alto com 1500+ itens",
  conforme comentário em `MultiSelectField.tsx`).
- **`filterFields`**: permite filtrar por campos além do rótulo (ex.: sigla, CNPJ).
- **`keepLastDataOnEmpty`** no `TablePaginadoSeplag`: mantém o último resultado visível quando
  `data` fica `undefined` fora de um refetch, evitando que a grid "esvazie sozinha".
- **Ações de linha adaptativas**: `TableRowActionsSeplag` renderiza botões individuais até 2
  ações e converte automaticamente em `SplitButton` a partir de 3.
- **Exclusão com confirmação embutida**: `useConfirmacaoExclusaoSeplag` + `ModalDeleteSeplag`
  já vêm acoplados ao `TablePaginadoSeplag` — basta passar `handleDelete`.
- **`p-inputgroup` com busca por CPF**: `CPFFieldSeplag` com `showIcon` + `onSearch` dispara
  a busca ao completar a máscara (`onComplete`) ou ao clicar na lupa.

---

## 4. Principais fluxos de relação entre componentes

### 4.1 Grafo de dependência interna (quem usa quem)

```
                          ┌────────────────┐
                          │  tokens/colors │◄──── Botao, Badge, Mensagem, Tabs,
                          └────────────────┘      UnsavedChangesProvider
                          ┌────────────────┐
                          │   uteis/Grid   │◄──── Rotulo, Card, Divider, Panel, Mensagem
                          └────────────────┘
                                  ▲
                          ┌───────┴────────┐
                          │  RotuloSeplag  │◄──── TODOS os Fields, PickList,
                          └────────────────┘      AnexarDocumento, ImageUploadField,
                                                  AppProfile
                          ┌────────────────┐
                          │  BotaoSeplag   │◄──── Badge, Modal, ModalDelete, Tabs,
                          └───────┬────────┘      Accordion, AccordionCard, Card,
                                  │               TableGroup, TablePaginado, FormActions,
                                  │               GroupActions, ListaBuscaAcao, NotFound,
                                  │               AppTopbar, AppProfile, AppSwitcher,
                                  │               AutoComplete, ReactCrop, Base64FileModal,
                                  │               UnsavedChangesProvider, CPFField,
                                  │               DropdownBaseLegal, Cronograma
                                  ▼
                          ┌────────────────┐
                          │ModalDeleteSeplag│◄──── TablePaginado, GroupActions,
                          └────────────────┘      DropdownBaseLegal, Cronograma
```

`BotaoSeplag` e `RotuloSeplag` são os **dois componentes-base** da biblioteca: qualquer
alteração de comportamento neles propaga para quase todo o catálogo.

### 4.2 Relações de composição notáveis

| Composto | Compõe |
| --- | --- |
| `AccordionSeplag` | `TablePaginadoSeplag` (usa a tabela como motor de agrupamento/expansão) + `BotaoSeplag` |
| `TablePaginadoSeplag` | `TableRowActionsSeplag` + `useConfirmacaoExclusaoSeplag` + `ModalDeleteSeplag` + `BotaoAdicionarSeplag` |
| `LayoutSeplag` | `AppProfileSeplag` + `AppMenuSeplag` + `AppTopbarSeplag` + `AppFooterSeplag` |
| `AppTopbarSeplag` | `AppSwitcherSeplag` + `BotaoSeplag` |
| `AppProfileSeplag` | 2× `ModalSeplag` + `RotuloSeplag` + `DataTable` (vínculos) |
| `DropdownBaseLegalSeplag` | `Base64FileModalSeplag` + `ModalDeleteSeplag` + `BadgeSeplag` + `BotaoSeplag` |
| `BadgeSeplag` | `BotaoChipSeplag` quando clicável; `<span>` + `Tooltip` quando não |
| `FormActionsSeplag` | `DividerSeplag` + `BotaoVoltarSeplag` + `BotaoSalvarSeplag` |
| `ImageUploadFieldSeplag` | `RotuloSeplag` + `BotaoSeplag` + `ImageCropperSeplag` |
| `PaginaInicialSeplag` | `Cronograma` + `Informativos` (ambos → `DateTimeFieldSeplag`, `BadgeSeplag`, `ModalDeleteSeplag`) |
| `LoaderSeplag` / `SimpleLoaderSeplag` | ambos → `loaderSeplag()` (função de renderização compartilhada) |

### 4.3 Fluxo de uma tela CRUD completa

Montagem típica, ligando os blocos da biblioteca de ponta a ponta:

```
main.tsx / App.tsx do sistema consumidor
  └─ <Provider store>                              (react-redux — do host)
      └─ <AppPrimeReactProviderSeplag>             (lib)
          └─ <ToastProviderSeplag>                 (lib)
              └─ <AuthThanosProviderSeplag>        (lib — OAuth2LibSeplag)
                  └─ <BrowserRouter>               (react-router-dom — do host)
                      └─ <UnsavedChangesProviderSeplag>  (lib)
                          └─ <LayoutSeplag menuItems={menuFiltradoPorPermissao}>
                              └─ <Outlet/>
                                   │
                                   ├─ Tela de LISTAGEM
                                   │    <CardSeplag title handleVoltar>
                                   │      <FilterFormSeplag>
                                   │        <TextFieldSeplag/> <DropdownFieldSeplag/>
                                   │        <FilterActionsSeplag>
                                   │          <BotaoConsultarSeplag/> <BotaoLimparFiltroSeplag/>
                                   │      useFiltersSeplag({...}) → { page, rows, onPageChange }
                                   │      <TablePaginadoSeplag hasEventoAcao
                                   │           handleEdit handleView handleDelete handleAdicionar/>
                                   │
                                   └─ Tela de FORMULÁRIO
                                        useForm() + useMensagemErroFormularioSeplag(errors)
                                        useUnsavedChangesSyncSeplag(formState.isDirty)
                                        <CardSeplag>
                                          <TabsSeplag items activeValue onChange/>
                                          <PanelSeplag title>
                                            <TextFieldSeplag .../>  <DateFieldSeplag .../>
                                            <MultiSelectFieldSeplag .../>
                                          <FormActionsSeplag onGoBack onSave/>
                                        toastPreset("created") ao salvar
```

### 4.4 Fluxo de dados de listagem

```
Filtros (react-hook-form)
      │  useWatch
      ▼
useFiltersSeplag ──► debounce ──► validação (minChars / isValidField)
      │                                       │
      │                                       └─► bloqueia se inválido
      ├─► localStorage[storageKey] = { filters, page, rows }
      ▼
onSearch(filters, page, rows)   ← implementado pelo consumidor
      ▼
RTK Query (apiSlice criada por createBaseApiSliceSeplag)
      │
      ├─ erro ──► extractErrorMessage ──► toastService ──► <Toast> do ToastProviderSeplag
      │
      └─ sucesso ──► ResultsSeplag<T> ──► <TablePaginadoSeplag data={...}>
                                                │
                                                ├─ colunas customizadas (columns[].body)
                                                ├─ agrupamento (grouping + TableGroupHeader/Footer)
                                                ├─ expansão (rowExpansionTemplate)
                                                └─ ações (TableRowActionsSeplag → ModalDeleteSeplag)
```

O contrato de dados é `ResultsSeplag<T>` (`src/interfaces/Results.ts`) — o formato de página
do Spring Data, com os campos extras `pageActual`, `sizePage` e `totalRecords`.

### 4.5 Fluxo de notificação transversal

Três origens diferentes convergem para o mesmo `<Toast>`:

```
 (a) Componente React          useToastSeplag() ──► ContextToastSeplag.toastRef
 (b) Camada de API             toastService.show() ◄── createBaseApiSliceSeplag
 (c) Regra de campo inativo    toastService via useToastSeplag ◄── inactiveOption.ts
                                          │
                                          ▼
                          <ToastProviderSeplag> → <Toast/> (instância única)
```

---

## 5. O que a biblioteca **não** se propõe a fazer

Delimitação derivada do que o código deixa a cargo do consumidor:

| Fora do escopo | Quem faz |
| --- | --- |
| Definir o store Redux | Aplicação consumidora (a lib fornece `loaderSliceSeplag` para registrar) |
| Definir rotas | Aplicação consumidora (`LayoutSeplag` só renderiza `<Outlet/>`) |
| Definir endpoints da API | Aplicação consumidora (a lib fornece a *factory* `createBaseApiSliceSeplag`) — **exceção:** `PaginaInicial`, que declara endpoints próprios |
| Definir o schema de validação de formulário | Aplicação consumidora (`useForm` + `rules` por campo) |
| Carregar dados de dropdown/tabela | Aplicação consumidora (a lib recebe `options`/`data` prontos) |
| Autenticar de fato | `OAuth2LibSeplag` orquestra, mas o servidor de autorização é externo |
| Persistir preferências de usuário | Apenas filtros de tela, via `useFiltersSeplag({ storageKey })` |
| Tema escuro | `Layout.tsx` tem `layoutColorMode` fixo em `"light"`, sem setter |
| Internacionalização | Todos os textos são pt-BR literais; não há camada de i18n |

---

## 6. Modelo de consumo

### 6.1 Instalação

```bash
npm install @seplag/ui-lib-react-18
```

O registry é o GitLab da SEPLAG (`.npmrc` / `package.json:npmconfigset`). As
**peer dependencies** precisam estar instaladas no projeto consumidor
(ver §9.1 do documento de Arquitetura).

### 6.2 Formas de importação

```ts
// 1. Barrel público (recomendado)
import { BotaoSeplag, TablePaginadoSeplag } from "@seplag/ui-lib-react-18";

// 2. Subpath export (viabilizado por preserveModules)
import { BotaoSeplag } from "@seplag/ui-lib-react-18/componentes/Botao";

// 3. Configuração de ESLint compartilhada
// eslint.config.js do consumidor
import seplagConfig from "@seplag/ui-lib-react-18/eslint-config";
```

### 6.3 Documentação viva

O próprio repositório publica um site de documentação com exemplos executáveis:

```bash
npm run start      # dev server → /seplagui/docs
npm run build:app  # build estático → dist-app/
```

O registro de páginas fica em `src/docs/config.ts`; cada componente documentado tem
uma entrada com `id`, `label`, `category` e um `lazy(() => import(...))`.
A pipeline (`.gitlab-ci.yml`) constrói uma imagem Docker (Nginx) desse site e faz deploy
em Docker Swarm.

---

## 7. Indicadores do estado atual

| Indicador | Valor |
| --- | --- |
| Módulos TypeScript (fora de `src/docs/`) | 172 arquivos `.ts`/`.tsx` |
| Linhas de código-fonte (fora de `src/docs/`) | ~15.700 |
| Símbolos públicos distintos alcançáveis por `src/index.ts` | ~260 (componentes, tipos, hooks, utilitários e tokens) |
| Pastas de componente (nível superior de `componentes/`) | 40 |
| Pastas em `componentes/` (incluindo subpastas) | 57 |
| Campos de formulário | 20 |
| Arquivos de teste | 5 versionados (70 casos) |
| Módulos órfãos identificados | 3 |
| Dependências diretas | 1 (`date-fns`) |
| Peer dependencies | 12 (1 sem uso: `react-google-recaptcha`) |
| Maior arquivo | `PaginaInicial/Cronograma/index.tsx` — 897 linhas |

---

## 8. Documentos relacionados

- [Arquitetura da biblioteca de componentes](./arquitetura-da-biblioteca-de-componentes.md) —
  padrões, regras, riscos e diretrizes técnicas
- `README.md` na raiz — guia de uso e instalação
- `README.md` em cada pasta de `src/componentes/` — documentação local por componente
