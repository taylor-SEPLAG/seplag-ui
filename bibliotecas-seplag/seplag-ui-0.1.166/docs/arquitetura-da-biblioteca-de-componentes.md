# Arquitetura da biblioteca de componentes

> Documento oficial de arquitetura do pacote `@seplag/ui-lib-react-18`.
> Base normativa para desenvolvimento futuro no modelo **Spec Driven Development**.
>
> Convenção deste documento: afirmações sem marcação são **fatos verificados no código-fonte**.
> Tudo que for interpretação, suposição ou intenção não comprovada aparece explicitamente
> marcado como **Hipótese**.

---

## 1. Identificação

| Item | Valor |
| --- | --- |
| Pacote | `@seplag/ui-lib-react-18` |
| Versão (`package.json`) | `0.1.107` |
| Versão (`VERSION`, usada pela pipeline) | `1.0.0.57` |
| Entrypoint público | `src/index.ts` → `dist/index.js` |
| Tipos | `dist/index.d.ts` |
| Formato de build | ESM apenas (`formats: ["es"]`) |
| Binário CLI | `seplag-generate` → `dist/_generator/generate.js` |
| Registry | GitLab SEPLAG (`http://git.seplag.mt.gov.br/api/v4/projects/CI_PROJECT_ID/packages/npm/`) |

---

## 2. Visão arquitetural

### 2.1 Natureza do artefato

A biblioteca é um **Design System em forma de pacote npm** — uma camada de apresentação
compartilhada entre as aplicações React da SEPLAG-MT. Ela **não é uma aplicação**: o
`src/App.tsx` e o `src/main.tsx` existem apenas para servir o *site de documentação*
(`src/docs/`), e são explicitamente excluídos da emissão de tipos em `vite.config.ts`.

O repositório produz **dois artefatos distintos a partir da mesma base de código**:

| Modo | Comando | Saída | Propósito |
| --- | --- | --- | --- |
| Biblioteca | `npm run build` | `dist/` | Pacote npm consumido pelas aplicações |
| Aplicação | `npm run build:app` | `dist-app/` | Site de documentação (Docker + Nginx) |

O discriminador é `mode === "app"` em [vite.config.ts](../vite.config.ts#L31-L32).

### 2.2 Estratégia de empacotamento

O build da biblioteca usa `preserveModules: true` com `preserveModulesRoot: src`
([vite.config.ts:99-100](../vite.config.ts#L99-L100)). Consequências arquiteturais diretas:

- A árvore de arquivos de `src/` é **espelhada** em `dist/` (um `.js` + um `.d.ts` por módulo).
- Isso viabiliza os *subpath exports* declarados em `package.json`
  (`"./*": { "import": "./dist/*.js" }`), permitindo `import ... from "@seplag/ui-lib-react-18/componentes/Botao"`.
- **A estrutura de pastas de `src/` é, portanto, contrato público.** Renomear ou mover
  uma pasta é *breaking change* mesmo que o barrel `src/index.ts` permaneça idêntico.

O CSS é injetado em runtime via `vite-plugin-css-injected-by-js` com
`relativeCSSInjection: true` — não há folha de estilo separada para o consumidor importar.
Os `.css`/`.module.css` viajam embutidos nos módulos JS que os importam.

### 2.3 Camadas

```
┌──────────────────────────────────────────────────────────────────────┐
│  src/index.ts            ← barrel público (única superfície oficial)  │
└──────────────────────────────────────────────────────────────────────┘
        │
        ├── src/componentes/index.ts   ← barrel de componentes (re-export explícito)
        │      ├── Componentes de apresentação  (Botao, Badge, Card, Divider…)
        │      ├── Componentes de formulário    (Fields/*, Rotulo, CheckBoxSN…)
        │      ├── Componentes de dados         (TablePaginado, TableGroup, Accordion…)
        │      ├── Componentes de layout        (layout/*)
        │      └── Componentes de negócio       (PaginaInicial, DropdownBaseLegal)
        │
        ├── src/provider/    ← Providers de contexto (PrimeReact, Toast, Auth)
        ├── src/hooks/       ← Hooks transversais (filtros, toast, mensagem de erro)
        ├── src/lib/         ← Infraestrutura (OAuth2, factory de RTK Query)
        ├── src/uteis/       ← Funções puras (datas, CPF/CNPJ, base64, grid)
        ├── src/tokens/      ← Tokens de design (cores)
        ├── src/interfaces/  ← Contratos de dados da API (paginação, permissão)
        └── src/type/        ← Enums de domínio (sistemas, status)

  Fora do grafo público:
        ├── src/app/         ← store Redux vazio + hooks tipados (uso interno)
        ├── src/docs/        ← site de documentação (não empacotado na lib)
        └── src/_generator/  ← CLI de scaffolding (empacotado como bin)
```

### 2.4 Direção de dependência

A regra observada no código é **descendente e sem ciclos entre camadas**:

```
componentes  →  hooks  →  provider  →  lib  →  uteis / tokens / interfaces / type
```

Exemplos verificados:
- `componentes/Fields/*` → `componentes/Rotulo`, `uteis/manipulaData`, `uteis/validacoes/*`.
- `hooks/mensagemErro` → `uteis/getErrorMessageInObject`.
- `lib/createBaseApiSliceSeplag` → `provider/printToast/toastService`.
- `componentes/Fields/utils/inactiveOption` → `hooks/toast/useToast` → `provider/printToast/ToastContext`.

**Não há import de `componentes/` dentro de `uteis/`, `tokens/`, `interfaces/` ou `type/`** — a
camada de utilitários permanece livre de React. Exceção: `hooks/mensagemErro/useMensagemErroFormulario.tsx`
retorna JSX, mas não depende de nenhum componente da lib.

---

## 3. Padrões utilizados

### 3.1 Padrão de nomenclatura — sufixo `Seplag`

**Toda a superfície pública é sufixada com `Seplag`**: componentes (`BotaoSeplag`),
props (`BotaoSeplagProps`), hooks (`useToastSeplag`), utilitários (`formatCPFSeplag`),
tipos (`ResultsSeplag`), tokens (`SEPLAG_PRIMARY`, prefixados) e constantes
(`TIPO_DOCUMENTO_MAP_DEFAULT_SEPLAG`).

**Hipótese:** o objetivo é evitar colisão de nomes no espaço global do consumidor, que
já importa `primereact` e outros pacotes com nomes genéricos (`Button`, `Card`, `Toast`).
O código não documenta a motivação, mas a aplicação da regra é sistemática — as únicas
exceções são componentes internos não exportados (`FieldError`, `ItemTemplate`,
`ChipSelecionado`, `SelectedDocumentItem`, `TextPreview`, `LoaderIcon`, `DropdownInner`).

### 3.2 Padrão dual-mode (RHF / standalone)

**Este é o padrão arquitetural mais importante da biblioteca.** Praticamente todo
componente de formulário implementa **duas variantes de renderização no mesmo arquivo**,
discriminadas pela presença da prop `control`:

```tsx
if (!control) {
  // Modo standalone: value + onChange controlados pelo consumidor
  // Erro vem exclusivamente de getFormErrorMessage(name)
  return <RotuloSeplag ...>{/* input "cru" */}</RotuloSeplag>;
}

// Modo react-hook-form: <Controller> gerencia valor e validação
return (
  <RotuloSeplag ...>
    <Controller name={name} control={control} rules={resolvedRules} render={...} />
  </RotuloSeplag>
);
```

Aplicado em: `TextField`, `TextAreaField`, `EmailField`, `NumberField`, `CurrencyField`,
`MaskField`, `TelefoneComercialField`, `CPFField`, `CNPJField`, `DateField`, `DateTimeField`,
`FieldsetDateField`, `DropdownField`, `MultiSelectField`, `CheckboxField`, `CheckboxList`,
`RadioButtonField`, `SwitchField`, `SearchField`, `CheckBoxSN` e `DropdownBaseLegal`
(neste último via componente `StandaloneDropdown`).

### 3.3 Padrão de resolução de regras de validação

Centralizado em [`Fields/utils/resolveFieldRules.ts`](../src/componentes/Fields/utils/resolveFieldRules.ts).
Três funções compõem o pipeline:

1. `mergeConstraintRules(constraints, rules)` — injeta `maxLength`/`minLength`/`min`/`max`
   com mensagens padrão em português, **sem sobrescrever** regras já declaradas pelo consumidor.
2. `resolveFieldRules(label, required, rules)` — mescla a validação de obrigatoriedade com
   as `rules` customizadas, garantindo que **`required` sempre execute antes** das validações
   custom. Suporta `validate` como função única ou como objeto de validadores nomeados.
3. `isFieldObrigatorio(required, resolvedRules)` — decide se o asterisco vermelho aparece no rótulo.

`buildRequiredValidate` rejeita strings compostas apenas de espaços (`/[^\s]/`), não apenas `""`.

**Exceção ao padrão:** `DateField`, `DateTimeField`, `FieldsetDateField`, `EmailField` e
`CNPJField` só chamam `resolveFieldRules` **quando o consumidor passa `rules`**; caso contrário
usam um builder local (`buildDateRules`, `buildEmailRules`, `buildCNPJRules`). Isso significa que
`required` produz mensagens ligeiramente diferentes conforme o caminho — ver §8.

### 3.4 Padrão de acessibilidade e testabilidade

Convenção aplicada de forma consistente em todos os campos:

| Elemento | Regra |
| --- | --- |
| `id` do input | `String(name)` (modo standalone) ou `field.name` (modo RHF) |
| `data-testid` | Igual ao `id` |
| `id` do erro | `` `${inputId}-error` `` |
| `aria-invalid` | `true` quando há erro; `undefined` caso contrário (nunca `false`) |
| `aria-describedby` | Aponta para o `id` do erro **apenas quando há mensagem** |
| Erro externo | `ensureErrorNodeId(node, id)` clona o nó React para garantir o `id` |

Para elementos compostos, o padrão é derivar sufixos determinísticos:
`` `${id}-fechar` ``, `` `${id}-acao` ``, `` `row-${rowId}-editar` ``, `` `${cardTestId}-toggle` ``.
`BotaoSeplag` deriva automaticamente um `data-testid` a partir do `label` via `slugifyLabel`
quando nenhum é informado.

### 3.5 Padrão de grid responsivo — prop `cols`

`uteis/Grid.ts` (`classesCssSeplag`) converte uma string de até 3 tokens em classes PrimeFlex:

```
"12 6 3"  →  " col-12 md:col-6 lg:col-3"
```

Usado por `RotuloSeplag`, `CardSeplag`, `DividerSeplag`, `PanelSeplag` e `MensagemSeplag`.
Todos os `Fields` propagam `cols` para o `RotuloSeplag` que os envolve.

**Violação conhecida:** `DropdownBaseLegalSeplag` monta a classe manualmente
(`` className={`col-${cols}`} ``), o que quebra para valores multi-token como `"12 6"` —
produz `col-12 6`, uma classe inválida. Ver §8.

### 3.6 Padrão de composição sobre configuração

Componentes complexos aceitam *slots* de renderização em vez de props booleanas acumuladas:

- `TablePaginadoSeplag`: `columns[].body`, `rowExpansionTemplate`, `renderBotoes`, `extraAcoes`,
  `header`, `footer`, `grouping.headerTemplate`, `grouping.footerTemplate`.
- `AccordionSeplag`: `groupBy`, `renderExpansion`.
- `ListaBuscaAcaoSeplag`: `getTitle`, `getDescription`, `renderAction`.
- `ListaSimplesSeplag`: `columns[].body` ou `renderItem`.
- `ModalSeplag`: `customFooter`.

### 3.7 Padrão de serviço-singleton para desacoplamento

Três registries de módulo (estado global fora do React) resolvem dependências circulares
ou inversão de controle:

| Arquivo | Padrão | Motivo |
| --- | --- | --- |
| [`provider/printToast/toastService.ts`](../src/provider/printToast/toastService.ts) | Service locator | Permite que `createBaseApiSliceSeplag` (não-React) dispare toasts |
| [`layout/Config/sidebarFlyoutRegistry.ts`](../src/componentes/layout/Config/sidebarFlyoutRegistry.ts) | Mutex de UI | Garante um único flyout aberto na sidebar recolhida |
| [`PaginaInicial/paginaInicialApi.ts`](../src/componentes/PaginaInicial/paginaInicialApi.ts) | Registry de injeção | Permite que a lib injete endpoints RTK Query na apiSlice do host |

### 3.8 Padrão de wrapper sobre PrimeReact

A biblioteca **não implementa widgets do zero**. Cada componente encapsula um widget
PrimeReact e aplica: tokens de cor SEPLAG, textos em português, `data-testid`, atributos ARIA
e defaults institucionais.

Componentes construídos sem base PrimeReact (HTML puro + estilo inline/CSS Module):
`EntityInfoCardSeplag`, `ListaSimplesSeplag`, `ListaBuscaAcaoSeplag`, `AccordionCardSeplag`,
`TabsSeplag`, `PanelSeplag`, `TableGroupHeaderSeplag`, `TableGroupFooterSeplag`,
`NotFoundSeplag`, `CustomIcons` e `MensagemSeplag`.

---

## 4. Regras arquiteturais

Regras derivadas do código existente. São **normativas** para novas implementações.

### RA-01 — A única superfície pública é `src/index.ts`
Nada é considerado API pública se não estiver alcançável a partir de `src/index.ts`.
Componentes exportam também `default` no próprio arquivo, mas o barrel usa **exports nomeados**.

### RA-02 — `src/componentes/index.ts` re-exporta explicitamente, nunca com `export *`
Exceção única e deliberada: `export * from "./Fields"` (linha 97), porque `Fields/index.ts`
já é um barrel curado. Toda outra exportação é nomeada item a item, o que dá controle
preciso sobre o que vaza para o consumidor.

### RA-03 — Todo símbolo público termina em `Seplag`
Inclui tipos e interfaces. Constantes usam prefixo `SEPLAG_` ou sufixo `_SEPLAG`.

### RA-04 — Componentes de formulário devem suportar os dois modos
Se um novo campo receber `control`, deve funcionar também sem ele (`value`/`onChange`).

### RA-05 — Rótulo e grid vêm do `RotuloSeplag`
Nenhum campo desenha o próprio `<label>`. `RotuloSeplag` é responsável por: classe de grid,
`<label htmlFor>`, asterisco de obrigatório, tooltip de `info` e ícones laterais.

### RA-06 — Validação passa por `resolveFieldRules`
Regras de `required` nunca são escritas manualmente no `<Controller>`.

### RA-07 — Cores vêm de `src/tokens/colors.ts`
O próprio arquivo declara: *"Importe daqui ao invés de definir cores localmente nos componentes."*
**Regra amplamente violada hoje** — ver §8.

### RA-08 — Dependências pesadas são `peerDependencies`, nunca `dependencies`
`package.json` tem **uma única** `dependency` (`date-fns`). React, PrimeReact, Redux Toolkit,
react-hook-form, react-router-dom etc. são peers. `vite.config.ts` marca todos como `external`
via `isExternal`, garantindo instância única no bundle final do consumidor.

### RA-09 — Estrutura de pastas de `src/` é contrato público
Consequência de `preserveModules` + subpath exports (§2.2).

### RA-10 — Textos de interface em português (pt-BR)
Mensagens, placeholders, labels e rótulos. Nomes de identificadores de código misturam
português e inglês — não há regra observável.

### RA-11 — Menus devem ser clonados antes de filtrar por permissão
`hasPermissionByRouteListSeplag` **muta o array de entrada** (atribui `visibleOnRouter`,
`visibleOnMenu` e reatribui `item.items`). `deepCloneMenuSeplag` existe exatamente para isso
e é exportado no barrel público. Chamar o filtro sobre a constante de menu do host corrompe
o estado entre renders.

### RA-12 — Componentes não devem instanciar `<Toast>` próprio
O `ToastProviderSeplag` monta um `<Toast>` único e o registra no `toastService`.
`DropdownBaseLegalSeplag` viola esta regra — ver §8.

---

## 5. Convenções técnicas

### 5.1 Ferramental

| Ferramenta | Versão / configuração |
| --- | --- |
| TypeScript | `~5.9.3`, `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` |
| Vite | `8.1.4` |
| ESLint | `9.x` flat config; `quotes: double`, `eqeqeq: always` (null ignorado), `no-explicit-any: warn` |
| Prettier | `printWidth: 100`, `tabWidth: 2`, aspas duplas, `trailingComma: all`, `endOfLine: lf` |
| Testes | Vitest 4 + Testing Library + jsdom (`environment` global, `globals` desligado); setup em `src/test/setup.ts`. Convenções em [`src/README.md` → Arquitetura de testes](../src/README.md#arquitetura-de-testes) |

A lib também **publica sua própria config de ESLint** para os consumidores, via
`"./eslint-config": "./eslint-config.js"` em `package.json`.

### 5.2 Aliases de importação

Definidos em [vite.config.ts:37-50](../vite.config.ts#L37-L50) — **12 aliases**.
Declarados em `tsconfig.app.json` — **apenas 2** (`@componentes/*` e `@type/*`).

Aliases efetivamente usados em `src/` (fora de `src/docs/`): `@componentes` e `@type`.
Os demais (`@uteis`, `@hooks`, `@provider`, `@lib`, `@app`, `@assets`, `@config`,
`@routes`, `@pages`, `@features`) **não são utilizados** e, se usados, quebrariam o
`tsc` por ausência no `paths`. Além disso, `@routes`, `@pages`, `@features` e `@config`
apontam para diretórios que **não existem**.

**Convenção efetiva:** dentro de `src/componentes/`, o padrão dominante é **caminho relativo**
(`../Botao`, `../../uteis`). O alias `@componentes` aparece em uma minoria de arquivos —
uma inconsistência estilística, não funcional (o build resolve ambos e nada vaza para o `dist`).

### 5.3 Convenções de estilo

Três abordagens coexistem, sem regra explícita de escolha:

| Abordagem | Onde |
| --- | --- |
| CSS Modules (`*.module.css`) | `Badge`, `Card`, `Modal`, `Table`, `TableGroup`, `AppTopbar`, `AppProfile`, `AppSwitcher`, `NotFound`, `Accordion`, `AutoComplete`, `DropdownBaseLegal`, `PaginaInicial/*`, `Rotulo` |
| CSS global (`*.css`) | `Loader/loader.css`, `Rotulo/style.css`, `Fields/DateField.css`, `Fields/DateTimeField.css`, `Fields/DropdownField.css`, `Fields/MultiSelectField.css`, `TablePaginado/TableGlobal.css`, `layout/layout/Layout.css` |
| Estilo inline | `Botao`, `Badge`, `Tabs`, `Mensagem`, `EntityInfoCard`, `ListaSimples`, `ListaBuscaAcao`, `AccordionCard`, `DropdownBaseLegal` |

Classes utilitárias do **PrimeFlex** (`flex`, `col-12`, `gap-2`, `border-round`) são usadas
livremente em todos os componentes.

### 5.4 Convenção de `pt` (PassThrough)

Atributos que o PrimeReact não expõe diretamente são injetados via a API `pt`:

```tsx
pt={{ input: { root: { name: field.name, "data-testid": field.name, autoComplete } } }}
```

Usado em `DateField`, `DateTimeField`, `FieldsetDateField`, `DropdownField`, `MultiSelectField`,
`SearchField`, `AnexarDocumento`, `TablePaginado` (para `id`/`data-testid` por linha) e `Modal`.

---

## 6. Separação de responsabilidades

| Módulo | Responsabilidade | Não faz |
| --- | --- | --- |
| `componentes/` | Renderização e interação | Chamadas HTTP (exceto `PaginaInicial`), regra de negócio de domínio |
| `componentes/Fields/` | Ligação entre input PrimeReact e react-hook-form | Definir o schema do formulário |
| `componentes/layout/` | Casca da aplicação (sidebar, topbar, perfil, rodapé) | Autenticar; apenas recebe callbacks |
| `componentes/PaginaInicial/` | Feature completa (UI + API + permissão) | — é a exceção arquitetural da lib |
| `hooks/` | Lógica de UI reutilizável e sem visual | Renderizar (exceto `useMensagemErroFormularioSeplag`, que devolve JSX) |
| `provider/` | Contextos React e configuração global | Lógica de domínio |
| `lib/` | Infraestrutura: OAuth2 e factory de apiSlice | Renderizar |
| `uteis/` | Funções puras | Importar React ou PrimeReact |
| `tokens/` | Constantes de design | Qualquer lógica |
| `interfaces/` | Contratos de dados da API | — |
| `type/` | Enums de domínio (sistemas, status) | — |
| `app/` | Store Redux de referência + hooks tipados | — não é exportado publicamente |
| `docs/` | Site de documentação viva | — não é empacotado na lib |
| `_generator/` + `template/` | CLI de scaffolding de CRUD | — |

---

## 7. Fluxo de comunicação entre componentes

### 7.1 Fluxo de formulário (o mais frequente)

```
Aplicação consumidora
  │  useForm<TFormulario>()  →  { control, errors, handleSubmit }
  │
  ├─► useMensagemErroFormularioSeplag(errors) ──► obterMensagemErro(nome): ReactNode
  │                                                    │
  ▼                                                    ▼
<CardSeplag>                                    (prop getFormErrorMessage)
  └─► <FilterFormSeplag> | <form>
        └─► <TextFieldSeplag name control rules getFormErrorMessage cols />
              │
              ├─► resolveFieldRules(label, required, rules)   ← merge de validações
              ├─► <RotuloSeplag cols obrigatorio htmlFor>     ← grid + label + asterisco
              │     └─► <Controller>                          ← react-hook-form
              │           └─► <InputText> (PrimeReact)
              │                 └─► sanitizeTextFieldValueSeplag(...)  ← saneamento
              └─► <FieldError id={`${name}-error`}>           ← <small class="p-error">
        └─► <FormActionsSeplag onGoBack onSave />
              └─► <DividerSeplag /> + <BotaoVoltarSeplag> + <BotaoSalvarSeplag>
```

**Precedência de erro** (idêntica em todos os campos):
`getFormErrorMessage(name)` **vence** `fieldState.error.message`. A prop é marcada
`@deprecated` nos tipos, mas mantida por compatibilidade retroativa.

### 7.2 Fluxo de listagem paginada com filtros

```
useForm<TFiltros>()  ──┐
                       ▼
              useFiltersSeplag({ control, getValues, reset, defaultValues, onSearch,
                                 debouncedFields, minChars, storageKey })
                       │
                       ├── useWatch(control)  → serializa com JSON.stringify (chave de estabilidade)
                       ├── useDebouncedValueSeplag(campos debounced, 400ms)
                       ├── bloqueia busca se algum campo string tiver 0 < len < minChars
                       ├── bloqueia busca se isValidField(campo, valor) === false
                       ├── reseta page → 0 quando os filtros mudam
                       ├── persiste { filters, page, rows } em localStorage[storageKey]
                       └── dispara onSearch(filters, page, rows)
                                 │
                                 ▼
                       RTK Query (apiSlice do host)
                                 │  ResultsSeplag<T>
                                 ▼
              <TablePaginadoSeplag data columns rows handleOnPageChange
                                   hasEventoAcao handleEdit handleDelete … />
                       ├─► <TableRowActionsSeplag>   ← ≥3 ações vira <SplitButton>
                       ├─► useConfirmacaoExclusaoSeplag(handleDelete)
                       └─► <ModalDeleteSeplag>       ← confirmação embutida
```

`useFiltersSeplag` devolve `{ page, rows, onPageChange, resetAll, resetField, refetch }`.
`onPageChange` é ligado diretamente ao `handleOnPageChange` da tabela.

### 7.3 Fluxo de notificação (toast)

```
<ToastProviderSeplag>                       ← monta <Toast/> único do PrimeReact
   ├── ContextToastSeplag.Provider({ toastRef })
   └── useEffect → toastService.register(show)
                              │
        ┌─────────────────────┴─────────────────────┐
        ▼                                           ▼
useToastSeplag()  (componentes React)      toastService.show()  (código não-React)
  toastPreset / toastSucesso / toastErro     └── createBaseApiSliceSeplag
  toastAtencao / printToast                       (erro HTTP → toast automático)
                                                  └── Fields/utils/inactiveOption
                                                       (seleção de item inativo)
```

O `toastService` é a ponte que permite a camada de infraestrutura notificar a UI **sem
depender de React**. `unregister()` no cleanup evita referência pendurada.

### 7.4 Fluxo de autenticação e casca da aplicação

```
OAuth2LibSeplag(config)      ← instanciado pela aplicação consumidora
      │
      ▼
<AuthThanosProviderSeplag authThanos isAuthenticated onAuthenticated>
      │  initSeplag()  → valida localStorage["tk"] | troca ?code por token | redireciona p/ authorize
      │  loadUserInfoSeplag() → onAuthenticated(resp.contaAcesso)
      │  startTokenAutoRefreshSeplag() → poll de 10s, dispara onTokenExpired 60s antes de expirar
      │  setOnTokenExpiredSeplag → updateTokenSeplag() ou logoutSeplag() em caso de falha
      │
      └─ (isAuthenticated ? children : loaderSeplag())
                 │
                 ▼
         <LayoutSeplag currentSystem sistemas menuItems vinculos onLogout … >
              ├── <AppProfileSeplag>   → modais de troca de senha e de vínculo
              ├── <AppMenuSeplag>      → <AppSubmenuSeplag> → <AppSubmenuItemSeplag> (recursivo)
              │                            └── sidebarFlyoutRegistry (1 flyout por vez)
              ├── <AppTopbarSeplag>    → <AppSwitcherSeplag> (troca de sistema)
              ├── {children ?? <Outlet/>}   ← react-router-dom
              └── <AppFooterSeplag>
```

`AppSubmenuSeplag` e `AppSubmenuItemSeplag` formam uma **recursão mútua** para renderizar
menus de profundidade arbitrária. Ambos contêm uma **cópia literal duplicada** da função
`isRouteActive` (~30 linhas) — ver §8.

### 7.5 Fluxo de guarda de alterações não salvas

```
<UnsavedChangesProviderSeplag>
   │  isDirtyRef (useRef — não causa re-render)
   │  monkey-patch de history.pushState / history.replaceState
   │  listener de popstate + beforeunload
   │
   ├── useUnsavedChangesSyncSeplag(formState.isDirty)   ← tela sincroniza o estado sujo
   └── useUnsavedChangesSeplag().guard(action)          ← ação arbitrária protegida
              │
              ▼
        <ModalSeplag customFooter> "Sim" / "Cancelar"
```

Padrão notável: o provider **intercepta a History API do navegador** para capturar navegações
do react-router antes que ocorram, restaurando os métodos originais no cleanup.

### 7.6 Fluxo de erro de API

```
createBaseApiSliceSeplag({ reducerPath, baseUrl, getToken, publicEndpoints, tagTypes, debug })
      │
      ├── prepareHeaders → Bearer token, exceto para endpoints em publicEndpoints
      │
      └── baseQueryWithReauth
            ├── mede duração (performance.now)
            ├── se debug: logApiCall() com Authorization mascarado
            ├── extraOptions.naoExibirMensagemErro === true → retorna sem toast
            ├── result.error → extractErrorMessage() → toastService.show(severity: "error")
            └── HTTP 200 com corpo contendo `keyError` + `message`
                  → converte em erro CUSTOM_ERROR e dispara toast
```

`extractErrorMessage` tem precedência definida:
`fieldsValidation[0].message` → `message` → `error` → `Erro {status}: …` → `"Erro desconhecido"`.

O flag `debug` cai para `localStorage.getItem("seplag:debugApi") === "true"` quando não informado.

---

## 8. Riscos técnicos, acoplamentos e violações arquiteturais

Cada item traz evidência no código. Severidade é uma avaliação; a evidência não é.

### R-01 — Acoplamento implícito ao formato do store Redux do consumidor · **Alto**

Dois pontos leem uma estrutura de store que a biblioteca **não define nem valida**:

| Local | Caminho lido | Contrato exigido do host |
| --- | --- | --- |
| [`Loader/index.tsx:5-6`](../src/componentes/Loader/index.tsx#L5-L6) | `state.loaderReducer.count` / `.message` | registrar `loaderSliceSeplag` sob a chave `loaderReducer` |
| [`PaginaInicial/permissions.ts:31-33`](../src/componentes/PaginaInicial/permissions.ts#L31-L33) | `state.userReducer.user.contaAcesso.authorities` | slice `userReducer` com essa forma exata |

Não há erro em tempo de compilação nem em runtime se o host divergir: `LoaderSeplag` simplesmente
nunca aparece e `usePaginaInicialPermissionsSeplag` retorna tudo `false`.
`src/app/store/store.ts` declara `reducer: {}`, então o `RootState` interno é vazio — a tipagem
de `useAppSelectorSeplag` não protege nada.

**Diretriz:** documentar esse contrato de forma explícita ou migrar para props/contexto.

### R-02 — `PaginaInicial` viola a separação de camadas · **Alto**

É o único módulo de `componentes/` que:
- Declara endpoints HTTP (`/v1/ciclo-pagamento`, `/v1/informativos`) e assume tags
  `"CicloPagamento"` e `"Informativos"` registradas na apiSlice do host.
- Depende de um registry mutável de módulo (`configurarPaginaInicialSeplag`) que **lança
  exceção em runtime** se não for chamado antes do primeiro render.
- Codifica papéis de negócio (`ROLE_CICLO_PAGAMENTO_*`, `ROLE_INFORMATIVO_*`).
- Faz cache do resultado em variáveis de módulo (`let cronogramaApi`, `let informativosApi`),
  o que **impede troca de apiSlice em runtime** e vaza estado entre testes.

`Cronograma/index.tsx` tem 897 linhas — o maior arquivo do repositório.

### R-03 — Aliases divergentes entre Vite e TypeScript · **Médio**

`vite.config.ts` define 12 aliases; `tsconfig.app.json` define 2. Quatro apontam para
diretórios inexistentes (`src/routes`, `src/pages`, `src/features`, `src/config`), que
também aparecem no `include` do `vite-plugin-dts`. Usar `@uteis` ou `@hooks` compila no
Vite e falha no `tsc`.

### R-04 — Tokens de cor não são a única fonte da verdade · **Médio**

`tokens/colors.ts` instrui a não definir cores localmente, mas há literais hexadecimais
espalhados por, no mínimo: `AccordionCard` (`#e2e8f0`, `#f8fafc`, `#1e293b`, `#475569`),
`AppSwitcher` (`#D8D8D8`, `#005494`, `#1FA1FC66`), `CustomIcons` (`#005494` em todos os SVGs),
`DropdownBaseLegal` (`#1351b4`, `#e11d48`, `#6e6a6a`, `#9ca3af`), `ListaBuscaAcao`
(`#e2e8f0`, `#64748b`, `#0f172a`, `#6b7280`, `#030213`), `AnexarDocumento`
(`#e5e7eb`, `#f0f9ff`, `#bfdbfe`, `#dc2626`, `#1e40af`), `AppSubmenuItem` (`#7EA9C9`),
`Rotulo` (`#6c757d`) e `TIPO_COR_MAP_DEFAULT_SEPLAG`.

Consequência: mudar a identidade visual exige varredura manual, não troca de token.

### R-05 — `dangerouslySetInnerHTML` em dois componentes · **Médio (segurança)**

| Componente | Linha | Condição |
| --- | --- | --- |
| [`MensagemSeplag`](../src/componentes/Mensagem/index.tsx#L104) | `allowHtml` default **`true`** + regex detecta tag | Renderiza HTML arbitrário por padrão |
| [`ModalDeleteSeplag`](../src/componentes/ModalDelete/index.tsx#L65) | `typeof message === "string"` | Sempre renderiza como HTML |

Se `message` contiver conteúdo vindo de API ou de entrada do usuário, há vetor de XSS.
Não há sanitização. **Diretriz:** inverter o default de `allowHtml` para `false`, ou sanitizar.

### R-06 — Código duplicado em pontos sensíveis · **Médio**

| Duplicação | Locais |
| --- | --- |
| `isRouteActive` (~30 linhas, idênticas) | `AppSubmenu.tsx` e `AppSubmenuItem.tsx` |
| `normalizar()` (NFD + lowercase) | `DropdownField.tsx` e `MultiSelectField.tsx` |
| `base64 → Blob` | `uteis/base64ParaBlob.ts` e `Base64FileModal/index.tsx` (`base64ToBlob`) |
| `toBase64` | `uteis/toBase64.ts` e `ReactCrop/utils.ts` (órfão) |
| `applyOverlayPosition` + loop de `requestAnimationFrame` | `AppSubmenuItem.tsx` e `AppProfile.tsx` |
| Bloco `virtualScrollerOptions` (>200 itens → `itemSize: 43`) | `DropdownField.tsx` e `MultiSelectField.tsx` |

### R-07 — Módulos órfãos · **Baixo**

Verificado por análise do grafo de imports (239 arquivos `.ts`/`.tsx` de todo o `src/`,
incluindo `src/docs/`):

| Arquivo | Situação |
| --- | --- |
| `src/componentes/Mensagem/message.ts` | Slice Redux **nunca importado**; depende de `RootState` do store interno vazio |
| `src/componentes/ReactCrop/utils.ts` | Duplicata de `uteis/toBase64.ts`, **nunca importado** |
| `src/uteis/RouteMixins.ts` | **Nunca importado** e ausente do barrel `uteis/index.ts` |

Todos são empacotados em `dist/` por causa de `preserveModules`.

### R-08 — Exportações públicas incompletas · **Baixo**

| Símbolo | Situação |
| --- | --- |
| `BotaoEditarSeplag`, `BotaoRemoverSeplag` | Definidos em `Botao/index.tsx`, **não exportados** no barrel. `BotaoRemoverSeplag` é usado internamente pelo `Cronograma`. |
| `CPFFieldSeplagProps` | Interface **local** ao arquivo, não exportada nem movida para `Fields/types/` |
| `CurrencyFieldSeplagProps` | Não existe — `CurrencyFieldSeplag` reusa `NumberFieldSeplagProps` |
| `FieldsetDateFieldSeplagProps` | Não existe — reusa `DateFieldSeplagProps` |
| `useAppDispatchSeplag` / `useAppSelectorSeplag` | Não exportados, embora `LoaderSeplag` dependa do store do consumidor |
| `SkeletonSeplagProps` | Exportado no arquivo, ausente do barrel |
| `TableRowActionsSeplagProps` | Exportado no arquivo, ausente do barrel |
| `AnexarDocumentoSeplagProps` | Presente no barrel ✔ |

### R-09 — `DropdownBaseLegalSeplag` diverge do padrão da lib · **Médio**

- Monta `<Toast>` próprio em vez de usar `ToastProviderSeplag` (viola RA-12).
- Desenha o próprio `<label>` em vez de usar `RotuloSeplag` (viola RA-05).
- Usa `` `col-${cols}` `` em vez de `classesCssSeplag` — quebra com `cols="12 6"` (viola RA-05/§3.5).
- Não usa `resolveFieldRules`; monta `rules` manualmente (viola RA-06).
- Cores hardcoded.
- Depende de `react-router-dom` (`<Link>`) — obriga o componente a viver dentro de um Router.

### R-10 — Divergência de versionamento · **Médio**

`package.json` diz `0.1.107`; o arquivo `VERSION` diz `1.0.0.57`. A pipeline
(`.gitlab-ci.yml`, estágio `increment_version`) incrementa o 4º segmento de `VERSION`
e faz commit, mas o estágio `deploy` executa `npm publish`, que publica a versão de
`package.json`. **Os dois números não estão sincronizados por nenhum script.**

### R-11 — `OAuth2LibSeplag`: pontos de atenção · **Médio**

- `state` fixo em `"xyz"` ([`OAuth2Lib.ts:105`](../src/lib/OAuth2Seplag/OAuth2Lib.ts#L105)) — não
  oferece proteção CSRF real.
- Sem PKCE, o `clientSecret` é embutido no bundle do navegador (`btoa(clientId:clientSecret)`).
- Token persistido em `localStorage` sob a chave `"tk"` — legível por qualquer script na origem.
- `startTokenAutoRefreshSeplag` cria um `setInterval` que **nunca é limpo** pelo
  `AuthThanosProviderSeplag` (não há `clearInterval` no cleanup do `useEffect`).
- `updateTokenSeplag` **não recalcula `expiryDate`** nem regrava no `localStorage` — após
  o primeiro refresh, `expiryDate` fica `undefined` e o `?? 0` do intervalo passa a
  disparar o callback a cada 10 segundos.
- `AuthThanosProviderSeplag.onAuthenticated` recebe `any`.

### R-12 — `useFiltersSeplag` depende de `JSON.stringify` para estabilidade · **Baixo**

`useWatch` + `JSON.stringify(watchedValuesRaw)` como chave de `useMemo`
([`useFiltersSeplag.ts:72-74`](../src/hooks/filters/useFiltersSeplag.ts#L72-L74)) — o mesmo
padrão em `useDebouncedValueSeplag`. Funciona para filtros simples, mas: perde `Date`/`undefined`,
depende da ordem das chaves e custa O(n) por render. Há 5 supressões de
`react-hooks/exhaustive-deps` no arquivo.

### R-13 — `useDebouncedValueSeplag`: `useRef` sem valor inicial · **Baixo**

`useRef<ReturnType<typeof setTimeout>>()` ([linha 9](../src/hooks/filters/useDebouncedValueSeplag.ts#L9))
— sem argumento. Em `@types/react` 19+ isso passa a ser erro de tipo. Hoje o pacote fixa
`@types/react ^18.3.5`, então compila.

### R-14 — Hooks chamados após early return condicional · **Baixo**

`DateTimeField.tsx` faz `if (!visible) return null;` **antes** de `useId()`
([linhas 51-53](../src/componentes/Fields/DateTimeField.tsx#L51-L53)). Se `visible` alternar
entre renders, a ordem dos hooks muda — violação das Rules of Hooks.
`CurrencyField` e `SwitchField` já corrigiram isso movendo `useState` para antes do return
(há inclusive um comentário explicando em `CurrencyField.tsx:56`).

### R-17 — `htmlFor` ausente em 10 campos no modo react-hook-form · **Médio (acessibilidade)**

`RotuloSeplag` só renderiza `<label htmlFor>` quando recebe a prop `htmlFor`; sem ela, cai em
um `<div>` com as mesmas classes e **os três `data-testid` (`rotulo-*`) ficam `undefined`**.

Dez campos passam `htmlFor` no modo standalone mas o **omitem** no ramo `<Controller>`:
`CNPJField`, `CPFField`, `CheckboxField`, `CheckboxList`, `CurrencyField`, `DropdownField`,
`EmailField`, `NumberField`, `RadioButtonField` e `SearchField`.

Consequência: nesses campos, leitores de tela não associam o rótulo ao input no modo que é
justamente o mais usado nos formulários da plataforma. Os demais nove campos passam
corretamente.

### R-15 — `README.md` excluído do pacote publicado · **Baixo**

`.npmignore` lista `README.md`. O consumidor que instala o pacote não recebe a documentação
principal (24 KB).

### R-16 — Cobertura de testes muito baixa · **Médio**

Existem **5 arquivos de teste versionados** (70 casos) para 172 módulos fora de `src/docs/`:
`app/hook/hooks.test.ts`, `app/store/store.test.ts`, `componentes/AutoComplete/index.test.tsx`,
`componentes/Fields/TextField.test.tsx` e `componentes/Botao/index.test.tsx`.

O componente-base `BotaoSeplag` **passou a ter cobertura**: 57 casos, 100% de statements,
branches e functions, com a especificação SDD em [`componentes/Botao/README.md`](../src/componentes/Botao/README.md#testes).
Segue sem cobertura o outro componente-base (`RotuloSeplag`), além de `TablePaginadoSeplag`,
`resolveFieldRules`, `useFiltersSeplag`, `createBaseApiSliceSeplag`, `OAuth2LibSeplag` e
`hasPermissionByRouteListSeplag`.

A pipeline (`.gitlab-ci.yml`) **continua não executando `npm test`** em nenhum estágio — os
scripts `test`, `test:watch` e `test:coverage` existem no `package.json`, mas só rodam localmente.
Como o estágio `deploy` roda `npm publish` a cada commit em `DESENVOLVIMENTO`, uma regressão de
comportamento é publicada sem barreira; o único portão é o `tsc` do `npm run build`.

**Direção definida para fechar isso:** uma *allowlist de testes bloqueantes*. Componentes com
testes completos e cobertura suficiente entram numa lista; só os testes dessa lista barram o
release, enquanto os demais rodam com `allow_failure` para dar visibilidade sem travar a
publicação. O portão aperta a cada componente concluído, sem exigir cobertura da biblioteca
inteira de uma vez. `Botao` é o primeiro candidato à lista.

---

## 9. Dependências críticas

### 9.1 Peer dependencies (contratos com o consumidor)

| Peer | Faixa | Papel na arquitetura | Impacto se ausente/divergente |
| --- | --- | --- | --- |
| `react` / `react-dom` | `>=18` | Runtime | Tudo quebra |
| `primereact` | `>=10 <11` | **Base de quase todos os componentes** | Faixa fechada em `<11`: migração para v11 é trabalho de porte |
| `primeflex` | `>=3` | Classes de grid e utilitárias (`col-*`, `flex`, `gap-*`) | Layout colapsa; `classesCssSeplag` gera classes sem efeito |
| `primeicons` | `>=7` | Todos os ícones `pi pi-*` | Ícones somem |
| `react-hook-form` | `>=7` | Todo o subsistema `Fields` | Formulários inutilizáveis |
| `@reduxjs/toolkit` | `>=2` | `createBaseApiSliceSeplag`, `loaderSlice` | `LoaderSeplag` e a factory de API quebram |
| `react-redux` | `>=9` | `useAppSelectorSeplag`, `usePaginaInicialPermissionsSeplag` | `LoaderSeplag`/`PaginaInicial` quebram |
| `react-router-dom` | `>=6` | `LayoutSeplag`, `AppSubmenu*`, `NotFound`, `PermissaoNegadaRedirect`, `DropdownBaseLegal` | Esses componentes exigem `<Router>` no host |
| `react-transition-group` | `>=4` | `CSSTransition` (via PrimeReact) em menu e perfil | Animações do menu quebram |
| `react-icons` | `>=5` | **Um único uso**: `TbGridDots` no `AppSwitcher` | Peer pesado para uso mínimo — candidato a substituição por SVG local |
| `react-cropper` | `>=2` | `ImageCropperSeplag` | Recorte de imagem quebra |
| `react-google-recaptcha` | `>=3` | **Nenhum uso encontrado em `src/`** | Peer declarado sem consumidor — candidato a remoção |

### 9.2 Dependência direta

`date-fns ^4.1.0` — único pacote instalado junto com a lib. Usado em `uteis/manipulaData.ts`,
`Fields/DateTimeFieldUtils.ts`, `DropdownBaseLegal/helpers/documentoLegalHelpers.ts` e
`StatusByDataFimChip`. Também é declarado como `external` no build, então **não é
inlined** — o consumidor recebe a dependência transitiva.

### 9.3 Dependências implícitas não declaradas

| Recurso | Onde é assumido |
| --- | --- |
| `localStorage` disponível | `OAuth2Lib`, `useFilterStorageSeplag`, `getPermissionsSeplag`, `isDebugEnabled` |
| Locale PrimeReact `"pt"` registrado | `DateField`, `DateTimeField`, `FieldsetDateField` usam `locale="pt"`; `DateTimeFieldUtils` chama `updateLocaleOptions(..., "pt")` no **carregamento do módulo** (efeito colateral em import) |
| Chave `permissions_key` no `localStorage` | `getPermissionsSeplag()` (default configurável) |
| Chave `tk` no `localStorage` | Token OAuth2 |
| Papel `ROLE_ADMIN` | `hasPermissionByKeysSeplag` e `usePaginaInicialPermissionsSeplag` |
| Propriedade `inactive` nas options | `Fields/utils/inactiveOption.isOptionInactive` |
| Slice `loaderReducer` no store | `LoaderSeplag` |
| Slice `userReducer` no store | `usePaginaInicialPermissionsSeplag` |

---

## 10. Diretrizes para futuras implementações

### 10.1 Checklist para um novo componente

1. **Pasta** `src/componentes/<NomeDoComponente>/` com `index.tsx` (ou `<Nome>.tsx` quando
   a pasta agrupar mais de um componente público, como `TableGroup`).
2. **Nome** `<Nome>Seplag`; interface de props `<Nome>SeplagProps` exportada.
3. **Props sempre `Readonly<...>`** no parâmetro do componente — padrão dominante no repositório.
4. **Exportação** nomeada em `src/componentes/index.ts` (componente **e** tipo de props).
   Manter a ordenação por área temática já existente no barrel.
5. **`id` + `data-testid`** em todo elemento interativo; sufixos determinísticos para partes.
   Expor também **`aria-label`**, com precedência `aria-label` explícito → label/texto → `tooltip`.
6. **Cores** exclusivamente de `src/tokens/colors.ts` (RA-07).
7. **Grid** via `cols` + `classesCssSeplag`, nunca com string de classe montada à mão.
8. **Textos** em pt-BR, com default sensato e prop de override.
9. **`README.md`** na pasta do componente, seguindo o modelo dos demais.
10. **Página de documentação** em `src/docs/pages/<Nome>/<Nome>Doc.tsx` + registro em
    `src/docs/config.ts`.
11. **Spec de testes (SDD)** na seção `## Testes` do `README.md` do componente — tabela de casos
    com ID, escrita **antes** do código do teste.
12. **Teste** colocado na pasta do componente, com o mesmo nome-base do arquivo-fonte
    (`index.tsx` → `index.test.tsx`), no padrão AAA e com os três casos canônicos: render correto,
    variações de estilo e todas as props preenchidas. Convenções completas em
    [`src/README.md` → Arquitetura de testes](../src/README.md#arquitetura-de-testes);
    referência de implementação em [`componentes/Botao/index.test.tsx`](../src/componentes/Botao/index.test.tsx).

### 10.2 Checklist para um novo campo de formulário

Além do checklist acima:

13. Arquivo em `src/componentes/Fields/<Nome>Field.tsx`.
14. Props em `src/componentes/Fields/types/<Nome>FieldSeplagProps.ts` e re-export em
    `Fields/types.ts` **e** em `Fields/index.ts`.
15. Suportar os dois modos (`control` presente / ausente) — RA-04.
16. Usar `resolveFieldRules` + `mergeConstraintRules` + `isFieldObrigatorio` — RA-06.
17. Envolver com `<RotuloSeplag nome={label} cols obrigatorio htmlFor>` — RA-05.
18. Renderizar erro com `<FieldError id={errorId}>` no modo RHF e `ensureErrorNodeId` no
    modo standalone.
19. Preservar a precedência `getFormErrorMessage` > `fieldState.error`.
20. **Chamar todos os hooks antes de qualquer `return` condicional** (evitar R-14).
21. Cobrir no teste também o **estado de erro** (mensagem, `aria-invalid`, `aria-describedby`),
    além dos três casos canônicos.

### 10.3 Diretrizes de evolução (dívida priorizada)

| Prioridade | Ação | Resolve |
| --- | --- | --- |
| 1 | Tornar explícito o contrato de store: exportar `useAppSelectorSeplag` e documentar as chaves `loaderReducer`/`userReducer`, ou trocar por props/contexto | R-01 |
| 2 | Inverter default de `MensagemSeplag.allowHtml` para `false`; sanitizar ou tipar `ModalDeleteSeplag.message` como `ReactNode` puro | R-05 |
| 3 | Corrigir `OAuth2LibSeplag.updateTokenSeplag` (recalcular `expiryDate` + regravar `localStorage`) e limpar o `setInterval` no unmount do provider | R-11 |
| 4 | Sincronizar `VERSION` e `package.json` no estágio `increment_version` da pipeline | R-10 |
| 5 | Alinhar aliases entre `vite.config.ts` e `tsconfig.app.json`; remover os que apontam para diretórios inexistentes | R-03 |
| 6 | Extrair `isRouteActive`, `normalizar`, `applyOverlayPosition` e a config de virtual scroller para módulos compartilhados | R-06 |
| 7 | Alinhar `DropdownBaseLegalSeplag` aos padrões (RotuloSeplag, toastService, `classesCssSeplag`, `resolveFieldRules`) | R-09 |
| 8 | Remover órfãos (`Mensagem/message.ts`, `ReactCrop/utils.ts`, `RouteMixins.ts`) ou integrá-los | R-07 |
| 9 | Extrair `PaginaInicial` para um pacote próprio, ou parametrizar endpoints e papéis por props | R-02 |
| 10 | Substituir literais de cor por tokens | R-04 |
| 11 | Elevar cobertura componente a componente (SDD) e adicionar à pipeline uma *allowlist de testes bloqueantes*, começando por `Botao` — feito: arquitetura de testes + `Botao` a 100% | R-16 |
| 12 | Passar `htmlFor` nos 10 campos que o omitem no modo `<Controller>` | R-17 |
| 13 | Remover peer `react-google-recaptcha` (sem uso em `src/`) e avaliar substituir `react-icons` (uso único: `TbGridDots` no `AppSwitcher`) por SVG local | §9.1 |

### 10.4 Regras de compatibilidade

- **Não remover exportações** do barrel sem major bump.
- **Não renomear pastas** de `src/` — são subpath exports públicos (RA-09).
- **Não promover peer a dependency** — quebra a instância única (RA-08).
- Depreciações usam `@deprecated` no JSDoc e são mantidas: `getFormErrorMessage` (todos os
  Fields), `StatusByDataFimChipSeplag`, `StatusByFilterChipSeplag`.

---

## 11. Mapa de arquivos críticos

| Arquivo | Por que é crítico |
| --- | --- |
| [`src/index.ts`](../src/index.ts) | Única superfície pública |
| [`src/componentes/index.ts`](../src/componentes/index.ts) | Barrel curado — controla o que é API |
| [`vite.config.ts`](../vite.config.ts) | Dual-build, `preserveModules`, externals, aliases, dts |
| [`package.json`](../package.json) | Peers, exports, subpath exports, bin |
| [`src/componentes/Fields/utils/resolveFieldRules.ts`](../src/componentes/Fields/utils/resolveFieldRules.ts) | Núcleo de validação de **todos** os campos |
| [`src/componentes/Rotulo/index.tsx`](../src/componentes/Rotulo/index.tsx) | Envelope visual de todo campo |
| [`src/uteis/Grid.ts`](../src/uteis/Grid.ts) | Tradução da prop `cols` para o grid |
| [`src/tokens/colors.ts`](../src/tokens/colors.ts) | Fonte da verdade cromática |
| [`src/lib/createBaseApiSliceSeplag.ts`](../src/lib/createBaseApiSliceSeplag.ts) | Contrato de erro de API + integração com toast |
| [`src/lib/OAuth2Seplag/OAuth2Lib.ts`](../src/lib/OAuth2Seplag/OAuth2Lib.ts) | Autenticação de todos os sistemas |
| [`src/provider/printToast/toastService.ts`](../src/provider/printToast/toastService.ts) | Ponte não-React → UI |
| [`src/componentes/layout/Config/menu.ts`](../src/componentes/layout/Config/menu.ts) | Modelo de menu + filtro de permissão (mutação!) |
| [`src/componentes/TablePaginado/index.tsx`](../src/componentes/TablePaginado/index.tsx) | Componente de dados mais usado |
| [`src/hooks/filters/useFiltersSeplag.ts`](../src/hooks/filters/useFiltersSeplag.ts) | Orquestra filtro + paginação + persistência |

---

## 12. Documentos relacionados

- [Objetivo da biblioteca de componentes](./objetivo-da-biblioteca-de-componentes.md)
- `README.md` na raiz — guia de uso e instalação
- `README.md` em cada pasta de `src/componentes/` — documentação local por componente
- Site de documentação viva: `npm run start` → `/seplagui/docs`
