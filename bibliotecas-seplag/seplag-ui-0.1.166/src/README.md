# `src/` — Índice do código-fonte

Ponto de partida da documentação técnica do pacote `@seplag/ui-lib-react-18`.

## Documentos globais

| Documento                                                                                       | Conteúdo                                                                                                                          |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [Arquitetura da biblioteca de componentes](../docs/arquitetura-da-biblioteca-de-componentes.md) | Visão arquitetural, padrões, regras (RA-01 a RA-12), convenções, fluxos, riscos (R-01 a R-16), dependências críticas e diretrizes |
| [Objetivo da biblioteca de componentes](../docs/objetivo-da-biblioteca-de-componentes.md)       | Propósito, problemas resolvidos (P-01 a P-10), funcionalidades centrais e relações entre componentes                              |

## Estrutura

```
src/
├── index.ts            ← SUPERFÍCIE PÚBLICA da biblioteca
├── componentes/        ← catálogo de componentes React
├── hooks/              ← hooks transversais
├── provider/           ← providers de contexto
├── lib/                ← infraestrutura (OAuth2, factory de apiSlice)
├── uteis/              ← funções puras
├── tokens/             ← tokens de design (cores)
├── interfaces/         ← contratos de dados da API
├── type/               ← enums de domínio
├── app/                ← store Redux de referência (interno)
├── assets/             ← imagens (logos, avatar)
├── _generator/         ← CLI seplag-generate
├── template/           ← templates do CLI
├── docs/               ← site de documentação (não empacotado)
├── test/               ← setup do Vitest
├── App.tsx · main.tsx  ← casca do site de documentação (excluídos do build da lib)
└── index.css · App.css
```

## Índice de READMEs

### Módulos transversais

| Módulo                  | README                                                                        |
| ----------------------- | ----------------------------------------------------------------------------- |
| Catálogo de componentes | [`componentes/`](./componentes/README.md)                                     |
| Hooks transversais      | [`hooks/`](./hooks/README.md)                                                 |
| Providers               | [`provider/`](./provider/README.md)                                           |
| Infraestrutura          | [`lib/`](./lib/README.md)                                                     |
| Utilitários puros       | [`uteis/`](./uteis/README.md)                                                 |
| Tokens de design        | [`tokens/`](./tokens/README.md)                                               |
| Contratos de API        | [`interfaces/`](./interfaces/README.md)                                       |
| Enums de domínio        | [`type/`](./type/README.md)                                                   |
| Store de referência     | [`app/`](./app/README.md)                                                     |
| CLI de scaffolding      | [`_generator/`](./_generator/README.md) · [`template/`](./template/README.md) |

### Componentes — Ações

[`Botao/`](./componentes/Botao/README.md) ·
[`FormActions/`](./componentes/FormActions/README.md) ·
[`GroupActions/`](./componentes/GroupActions/README.md)

### Componentes — Formulário

[`Fields/`](./componentes/Fields/README.md) (20 campos) ·
[`Rotulo/`](./componentes/Rotulo/README.md) ·
[`CheckBoxSN/`](./componentes/CheckBoxSN/README.md) ·
[`AutoComplete/`](./componentes/AutoComplete/README.md) ·
[`DropdownBaseLegal/`](./componentes/DropdownBaseLegal/README.md) ·
[`PickList/`](./componentes/PickList/README.md) ·
[`FilterForm/`](./componentes/FilterForm/README.md) ·
[`AnexarDocumento/`](./componentes/AnexarDocumento/README.md) ·
[`ReactCrop/`](./componentes/ReactCrop/README.md)

### Componentes — Dados

[`TablePaginado/`](./componentes/TablePaginado/README.md) ·
[`TableGroup/`](./componentes/TableGroup/README.md) ·
[`Accordion/`](./componentes/Accordion/README.md) ·
[`ListaSimples/`](./componentes/ListaSimples/README.md) ·
[`ListaBuscaAcao/`](./componentes/ListaBuscaAcao/README.md)

### Componentes — Contêineres

[`Card/`](./componentes/Card/README.md) ·
[`PanelSeplag/`](./componentes/PanelSeplag/README.md) ·
[`AccordionCard/`](./componentes/AccordionCard/README.md) ·
[`Tabs/`](./componentes/Tabs/README.md) ·
[`Divider/`](./componentes/Divider/README.md) ·
[`EntityInfoCard/`](./componentes/EntityInfoCard/README.md)

### Componentes — Overlays e feedback

[`Modal/`](./componentes/Modal/README.md) ·
[`ModalDelete/`](./componentes/ModalDelete/README.md) ·
[`Base64FileModal/`](./componentes/Base64FileModal/README.md) ·
[`Mensagem/`](./componentes/Mensagem/README.md) ·
[`Badge/`](./componentes/Badge/README.md) ·
[`Loader/`](./componentes/Loader/README.md) ·
[`SimpleLoader/`](./componentes/SimpleLoader/README.md) ·
[`SkeletonSeplag/`](./componentes/SkeletonSeplag/README.md) ·
[`SkeletonSimples/`](./componentes/SkeletonSimples/README.md)

### Componentes — Layout e navegação

[`layout/`](./componentes/layout/README.md) —
[`layout/`](./componentes/layout/layout/README.md) ·
[`Config/`](./componentes/layout/Config/README.md) ·
[`AppTopbar/`](./componentes/layout/AppTopbar/README.md) ·
[`AppSwitcher/`](./componentes/layout/AppSwitcher/README.md) ·
[`AppProfile/`](./componentes/layout/AppProfile/README.md) ·
[`AppMenu/`](./componentes/layout/AppMenu/README.md) ·
[`AppSubmenu/`](./componentes/layout/AppSubmenu/README.md) ·
[`AppSubmenuItem/`](./componentes/layout/AppSubmenuItem/README.md) ·
[`AppFooter/`](./componentes/layout/AppFooter/README.md)

[`NotFound/`](./componentes/NotFound/README.md) ·
[`PermissaoNegadaRedirect/`](./componentes/PermissaoNegadaRedirect/README.md) ·
[`UnsavedChangesWarning/`](./componentes/UnsavedChangesWarning/README.md)

### Componentes — Negócio e visual

[`PaginaInicial/`](./componentes/PaginaInicial/README.md) —
[`Cronograma/`](./componentes/PaginaInicial/Cronograma/README.md) ·
[`Informativos/`](./componentes/PaginaInicial/Informativos/README.md)

[`CustomIcons/`](./componentes/CustomIcons/README.md)

### Componentes — Depreciados

[`StatusByDataFimChip/`](./componentes/StatusByDataFimChip/README.md) ·
[`StatusByFilterChip/`](./componentes/StatusByFilterChip/README.md)

## Pastas sem README próprio

As pastas abaixo são detalhes internos de implementação, documentados no README do módulo pai:

| Pasta                                                                                         | Documentada em                                                                                                                                 |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `componentes/Fields/types/` · `Fields/utils/`                                                 | [`Fields/README.md`](./componentes/Fields/README.md)                                                                                           |
| `componentes/DropdownBaseLegal/helpers/` · `hooks/` · `templates/` · `ChipDropdownBaseLegal/` | [`DropdownBaseLegal/README.md`](./componentes/DropdownBaseLegal/README.md)                                                                     |
| `hooks/filters/` · `hooks/toast/` · `hooks/mensagemErro/`                                     | [`hooks/README.md`](./hooks/README.md)                                                                                                         |
| `provider/AppPrimeReactProvider/` · `AuthThanosProvider/` · `printToast/`                     | [`provider/README.md`](./provider/README.md)                                                                                                   |
| `lib/OAuth2Seplag/`                                                                           | [`lib/README.md`](./lib/README.md)                                                                                                             |
| `uteis/cpfCnpj/` · `uteis/validacoes/`                                                        | [`uteis/README.md`](./uteis/README.md)                                                                                                         |
| `interfaces/permissao/`                                                                       | [`interfaces/README.md`](./interfaces/README.md)                                                                                               |
| `app/hook/` · `app/store/`                                                                    | [`app/README.md`](./app/README.md)                                                                                                             |
| `template/feat/`                                                                              | [`template/README.md`](./template/README.md)                                                                                                   |
| `assets/img/`                                                                                 | — imagens estáticas (logos do Estado/SEPLAG, avatar padrão)                                                                                    |
| `test/`                                                                                       | — `setup.ts` (matchers do jest-dom + `cleanup` global), referenciado por `vite.config.ts`. Ver [Arquitetura de testes](#arquitetura-de-testes) |
| `docs/`                                                                                       | — site de documentação viva; registro de páginas em `docs/config.ts`                                                                           |

## Arquitetura de testes

### Stack e configuração

| Item         | Valor                                                                |
| ------------ | -------------------------------------------------------------------- |
| Runner       | Vitest 4.1 (`environment: "jsdom"` global)                           |
| Biblioteca   | `@testing-library/react` 16.3 + `@testing-library/user-event` 14.6   |
| Matchers     | `@testing-library/jest-dom` 7                                        |
| Configuração | [`vite.config.ts`](../vite.config.ts) — bloco `test`                 |
| Setup global | [`test/setup.ts`](./test/setup.ts) — matchers + `afterEach(cleanup)` |

```bash
npm test                                        # suíte completa, execução única
npm run test:watch                              # modo interativo (re-roda ao salvar)
npm run test:coverage                           # suíte completa + relatório de cobertura

npx vitest run src/componentes/Botao            # um arquivo ou pasta
npx vitest src/componentes/Botao                # o mesmo, em modo watch
npx vitest run -t "BotaoSalvarSeplag"           # filtra por nome do describe/it
npx vitest --ui                                 # interface web (@vitest/ui)
```

> **Type-check:** o script `tsc` do `npm run build` roda sobre o `tsconfig.json` raiz, que é um
> _solution file_ (`files: []` + `references`) — ele **sai com sucesso sem verificar nada**. Para
> checar os tipos de verdade, incluindo os arquivos de teste, use **`npx tsc --build`**.

Duas decisões da configuração que afetam como o teste é escrito:

- **`environment: "jsdom"` é global** — não use o pragma `// @vitest-environment jsdom`; ele é
  redundante.
- **`globals` fica desligado** — importe `describe`, `it`, `expect`, `vi` explicitamente de
  `"vitest"`. Como consequência o RTL não registra auto-cleanup sozinho, por isso o
  `afterEach(cleanup)` mora no `setup.ts`; **não** repita esse `afterEach` nos arquivos de teste.

### SDD — Specification Driven Development

A especificação vem antes do código. O fluxo é sempre este:

1. Escrever a **spec** na seção `## Testes` do `README.md` da pasta do componente — uma tabela de
   casos com ID, cenário e assert principal.
2. Criar o `.test.tsx` com os `describe`/`it` **vazios**, já com os comentários `// Arrange`,
   `// Act`, `// Assert`.
3. Implementar cada caso até passar. Cada linha da tabela corresponde a **exatamente um** `it(...)`,
   rastreável pelo ID em comentário.
4. Mudou o comportamento? Atualize **primeiro** a spec no README, depois o teste, depois o código.

O README do componente é a fonte da verdade sobre o que está coberto — quem for alterar o componente
lê a spec antes de tocar no código.

### Colocation e nomenclatura

O arquivo de teste fica **na mesma pasta do componente**, com o mesmo nome-base do arquivo-fonte:

| Fonte                  | Teste                       |
| ---------------------- | --------------------------- |
| `Botao/index.tsx`      | `Botao/index.test.tsx`      |
| `Fields/TextField.tsx` | `Fields/TextField.test.tsx` |

- `describe` recebe o **nome exato do símbolo exportado** (`describe("BotaoSalvarSeplag", ...)`).
- Use **`it`**, não `test`.
- Descrição do caso em pt-BR, começando com `"Deveria "`.

### Padrão AAA

Todo `it` tem os três comentários, nesta ordem, mesmo quando um bloco é trivial:

```tsx
it("Deveria renderizar o BotaoSalvarSeplag corretamente", () => {
  // Arrange
  const label = "Salvar";

  // Act
  render(<BotaoSalvarSeplag label={label} />);

  // Assert
  expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
});
```

Quando não há interação, o `render` é o **Act**.

### Estrutura mínima obrigatória

Todo componente tem, no mínimo, estes três casos:

```tsx
describe("{Nome do componente aqui}", () => {
  it("Deveria renderizar o {Nome do componente aqui} corretamente", () => {
    // Arrange
    // Act
    // Assert
  });
  it("Deveria renderizar o {Nome do componente aqui} com suas variações de estilo", () => {
    // Arrange
    // Act
    // Assert
  });
  it("Deveria renderizar o {Nome do componente aqui} com todas as suas props preenchidas", () => {
    // Arrange
    // Act
    // Assert
  });
});
```

**Regra da variação de estilo** — o segundo caso só se aplica a componentes que realmente têm
variação visual (`variant`, `severity`, `size`, `unstyled`, `outlined`). Componentes sem variação
substituem esse caso pelo comportamento mais próximo — normalmente
`"Deveria renderizar o X com seus valores padrão"` — e **registram a substituição na tabela do
README**, para que a ausência seja uma decisão explícita e não um esquecimento.

Casos além dos três são bem-vindos; marque-os como **SUGESTÃO** na spec e agrupe-os num `describe`
próprio ao final do arquivo.

### Consultas — ordem de preferência

Da melhor para a pior. Só desça um nível quando o anterior for impossível:

1. `getByRole("button", { name })` — valida a árvore de acessibilidade junto com o render.
2. `getByLabelText(...)` — apoia-se no `aria-label`.
3. `getByTestId(...)` — elementos sem semântica própria.
4. `container.querySelector(...)` — **último recurso**: ícones e classes internas do PrimeReact, que
   não expõem role nem nome acessível.

Para asserção de **presença**, use `getBy*` (falha com o diagnóstico do Testing Library) em vez de
`queryBy*` + `not.toBeNull()`. `queryBy*` serve para asserção de **ausência**
(`expect(screen.queryBy...).not.toBeInTheDocument()`).

### Acessibilidade

Todo componente interativo deve expor `aria-label`, com a precedência:

```
aria-label explícito  →  label/texto visível  →  tooltip
```

Nomes em **pt-BR** (RA-10). Além de acessibilidade, é o que torna `getByRole`/`getByLabelText`
confiáveis e reduz a dependência de `data-testid` nos testes.

### PrimeReact: quando mockar o widget

Quase todo componente da biblioteca é um wrapper sobre um widget PrimeReact. A regra:

| Situação                                                                                                     | Decisão                                                                     |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| O que se testa é o que o wrapper **repassa** ao widget (`style`, `id`, `data-testid`, `aria-label`, classes) | **Não mockar** — renderize o widget real, senão o teste não prova nada      |
| O widget traz overlay, portal, timer ou medição de layout que deixa o teste frágil                           | **Mockar** com `vi.mock("primereact/...")`, preservando as props relevantes |

Exemplos no repositório: [`Botao/index.test.tsx`](./componentes/Botao/index.test.tsx) renderiza o
`Button` real; [`AutoComplete/index.test.tsx`](./componentes/AutoComplete/index.test.tsx) e
[`Fields/TextField.test.tsx`](./componentes/Fields/TextField.test.tsx) mockam o widget.

### Asserção de estilo inline

`toHaveStyle` resolve via `getComputedStyle`, e sem o CSS do PrimeReact carregado o jsdom não
devolve `background-color` nem `border-color` — a asserção falha mesmo com o estilo correto no
elemento. Para componentes cujo contrato é o **`style` inline** (caso do `Botao`, que calcula o
merge de variante + `style` + `minWidth`), compare direto em `element.style`, normalizando o valor
esperado pelo mesmo parser CSS do jsdom. Veja o helper `esperarEstilo` em
[`Botao/index.test.tsx`](./componentes/Botao/index.test.tsx) — com ele `#2196F3` e
`rgb(33, 150, 243)` são equivalentes sem o teste precisar conhecer a normalização.

### Referência de implementação

[`Botao/index.test.tsx`](./componentes/Botao/index.test.tsx) é o piloto desta arquitetura: 11
componentes, 57 casos, 100% de statements/branches/functions, com a spec SDD em
[`Botao/README.md`](./componentes/Botao/README.md#testes). Use-o como modelo.

### Providers necessários por componente

A maioria renderiza sem wrapper nenhum. Os que exigem contexto:

| Wrapper                              | Componentes                                                                                          | Sem ele                                                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `<MemoryRouter>`                     | `Layout`, `AppSubmenu`, `AppSubmenuItem`, `NotFound`, `PermissaoNegadaRedirect`, `DropdownBaseLegal` | lança `useLocation() may be used only in the context of a <Router>`    |
| `<Provider store>` (react-redux)     | `Loader`, `PaginaInicial`                                                                            | lança "could not find react-redux context"                             |
| `UnsavedChangesProviderSeplag`       | `useUnsavedChangesSeplag` e consumidores                                                             | lança erro explícito                                                   |
| `ToastProviderSeplag`                | `useToastSeplag`, `DropdownField`, `MultiSelectField`, `GroupActions`                                | não quebra (contexto default é no-op), mas não dá para asserir o toast |
| `configurarPaginaInicialSeplag(...)` | `PaginaInicialSeplag`                                                                                | lança em runtime                                                       |

Campos de `Fields/` **não** precisam de `FormProvider`: o `control` sempre chega por prop, então
basta um harness local com `useForm` — ver `FormHarness` em
[`Fields/TextField.test.tsx`](./componentes/Fields/TextField.test.tsx).

Componentes com estado em variável de módulo (`toastService`, `sidebarFlyoutRegistry`,
`paginaInicialApi`) **vazam entre testes** — resete-os no `beforeEach` do arquivo.

### Checklist de PR

- [ ] Spec na seção `## Testes` do README do componente
- [ ] Arquivo de teste na mesma pasta, mesmo nome-base
- [ ] Os três casos canônicos (ou a substituição justificada do caso de estilo)
- [ ] Comentários `// Arrange` · `// Act` · `// Assert` em todos os casos
- [ ] `aria-label` exposto e usado nas consultas
- [ ] `npm test` verde
- [ ] `npm run build` verde (os testes entram no `tsc` estrito)

## Pendências gerais da biblioteca

Itens levantados e **deliberadamente adiados** porque quebram compatibilidade ou derrubariam o
build de imediato. Devem ser tratados em **hotfix futuro**, não no fluxo normal de feature.

Pendências restritas a um componente ficam na seção `## Observações técnicas e débitos
identificados` do README dele; aqui só o que é transversal.

### P-A — `tsc` do projeto não verifica nenhum arquivo

**Severidade: alta.** [`tsconfig.json`](../tsconfig.json) é um arquivo-solução: só tem
`references`, sem `files` nem `include`. Consequência medida:

```
tsc --noEmit                      →   0 arquivos
tsc -p tsconfig.app.json --noEmit → 267 arquivos
```

Isso atinge o script `build` (`tsc && vite build`): o `tsc` ali passa sempre, sem checar nada.
O `vite-plugin-dts` usa `tsconfigPath: "./tsconfig.app.json"`, mas cobre apenas
`src/componentes`, `src/hooks` e afins — **`src/docs` nunca é verificado**.

Enquanto não for corrigido, use `npx tsc -p tsconfig.app.json --noEmit` para checagem real.

> A linha "`npm run build` verde (os testes entram no `tsc` estrito)" do
> [Checklist de PR](#checklist-de-pr) acima **não é verdadeira hoje** por causa disto.

**Correção proposta:** trocar `tsc` por `tsc -b` (ou `-p tsconfig.app.json`) nos scripts
`build`, `dev`, `pack` e `package` do `package.json`. **Depende de P-B.**

### P-B — Dois erros de tipo pré-existentes bloqueiam P-A

**Severidade: alta** (bloqueante para P-A). Aparecem assim que a verificação real é ligada:

| Arquivo                                 | Ocorrências         | Erro                                                                   |
| --------------------------------------- | ------------------- | ---------------------------------------------------------------------- |
| `docs/pages/AppTopbar/AppTopbarDoc.tsx` | 2 (linhas 49 e 146) | `Property 'nomeSistema' does not exist on type 'AppTopbarSeplagProps'` |
| `docs/pages/Layout/LayoutDoc.tsx`       | 1 (linha 560)       | idem, em `LayoutSeplagProps`                                           |

As páginas de documentação passam uma prop que os componentes não têm mais. Ligar P-A **quebra
o build** até isto ser resolvido — por isso os dois andam juntos.

### P-C — `margin-left-auto` no `PanelSeplag` não existe

**Severidade: baixa.** A classe usada para empurrar o ícone de `iconPosition="right"` em
[`PanelSeplag/index.tsx`](./componentes/PanelSeplag/index.tsx) não existe no PrimeFlex nem no
CSS do projeto — confirmado por busca, zero ocorrências. Hoje o ícone da direita não é
empurrado.

**Não é retrocompatível:** trocar por `ml-auto` corrige, mas **muda o layout de toda tela que
usa `iconPosition="right"` hoje**. O slot `trailing`, adicionado depois, já nasceu com a classe
certa. Ver [`PanelSeplag/README.md`](./componentes/PanelSeplag/README.md).

### P-D — `readOnly` e `semMoldura` só em 2 dos 20 campos

**Severidade: baixa.** [`NumberFieldSeplag`](./componentes/Fields/NumberField.tsx) e
[`DropdownFieldSeplag`](./componentes/Fields/DropdownField.tsx) têm as duas props; o
`MultiSelectFieldSeplag` tem um `readOnly` próprio, com semântica diferente (permite abrir o
painel para visualizar). Os outros 17 não têm nenhuma.

Estender é **aditivo e incremental** — não bloqueia nada, mas até lá "campo em célula de
tabela" só funciona com esses dois. Ver [`Fields/README.md`](./componentes/Fields/README.md).

### P-E — `CurrencyFieldSeplag` ignora `min`

**Severidade: baixa.** [`CurrencyField.tsx`](./componentes/Fields/CurrencyField.tsx) rejeita a
tecla quando o valor passaria de `max`, mas **não trata `min`** — embora reuse
`NumberFieldSeplagProps`, que declara a prop. Um `min` informado é silenciosamente ignorado.

## Como navegar

- **Vou usar um componente** → README da pasta do componente (props, fluxos, exemplos).
- **Vou criar um componente novo** → §10.1 e §10.2 do documento de
  [Arquitetura](../docs/arquitetura-da-biblioteca-de-componentes.md).
- **Preciso entender uma decisão de projeto** → §3 (padrões) e §4 (regras) do documento de
  Arquitetura.
- **Vou escrever testes** → [Arquitetura de testes](#arquitetura-de-testes) acima, e a seção
  `## Testes` do README do componente (spec SDD).
- **Vou priorizar dívida técnica** → [Pendências gerais](#pendências-gerais-da-biblioteca)
  acima (P-A a P-E, para hotfix), depois §8 (riscos R-01 a R-16) e §10.3 (plano priorizado).
- **Quero ver o componente funcionando** → `npm run start` → `/seplagui/docs`.
