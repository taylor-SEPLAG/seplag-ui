# `Botao/` — BotaoSeplag e variantes

## Objetivo

Padronizar todos os botões da plataforma SEPLAG sobre o `Button` do PrimeReact, com estilos
institucionais, controle de permissão e `data-testid` automático.

## Responsabilidade principal

É um dos **dois componentes-base** da biblioteca (junto com [`RotuloSeplag`](../Rotulo/)),
consumido por 24 outros componentes. Qualquer alteração de comportamento aqui propaga por
quase todo o catálogo.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 276 linhas.

```ts
// componentes/index.ts
export {
  BotaoAdicionarSeplag, BotaoChipSeplag, BotaoConsultarSeplag, BotaoFecharSeplag,
  BotaoIconSeplag, BotaoLimparFiltroSeplag, BotaoSalvarSeplag, BotaoSeplag, BotaoVoltarSeplag,
} from "./Botao";
export type { BotaoSeplagProps } from "./Botao";
```

## Funcionalidades existentes

### Arquitetura interna

`ButtonSeplag` é a **função privada** que concentra toda a lógica. Todos os exports públicos
são wrappers finos sobre ela, aplicando `variant`, `label`, `icon` e `type` padrão.

### Variantes de estilo (`variant`)

| Variante | Estilo aplicado |
| --- | --- |
| `base` (default) | `height 40`, `minWidth 120`, `borderRadius 4`; sem `outlined` adiciona `border: 0px` |
| `save` | Base + `color: white`, `backgroundColor: SEPLAG_PRIMARY` |
| `back` | Base + `color: SEPLAG_PRIMARY`, fundo branco, borda `SEPLAG_PRIMARY` |
| `clear` | `height 40`, `minWidth 40`, `borderRadius 4`, `border: 0px` |
| `icon` | `color: white`, `fontSize: 0.8rem` (sem dimensões) |

`unstyled: true` ignora todas as variantes e aplica apenas o `style` recebido.
`minWidth` sobrescreve o valor da variante quando informado.

### Componentes exportados

| Componente | Configuração |
| --- | --- |
| `BotaoSeplag` | Passa direto para `ButtonSeplag` |
| `BotaoSalvarSeplag` | `variant="save"`, label "Salvar", `pi pi-save`, `raised` |
| `BotaoVoltarSeplag` | `variant="back"`, label "Voltar", `pi pi-arrow-left`, `text`, `raised`, `type="button"` |
| `BotaoFecharSeplag` | `variant="back"`, label "Fechar", `text`, `raised`, `type="button"` |
| `BotaoAdicionarSeplag` | Label "Adicionar", `pi pi-plus` |
| `BotaoConsultarSeplag` | Label "Consultar", `pi pi-search` |
| `BotaoLimparFiltroSeplag` | `variant="clear"`, label "Limpar Filtro" |
| `BotaoIconSeplag` | `variant="icon"`, tooltip posicionado no topo |
| `BotaoChipSeplag` | `unstyled`, aceita `children` — usado pelo [`BadgeSeplag`](../Badge/) clicável |

Todos permitem sobrescrever o label: `props.label ?? "Salvar"`.

### Controle de permissão

```tsx
if (!shouldRenderButton(hasPermission)) return null;   // hasPermission !== false
if (!visible) return null;
```

`hasPermission` é `true` por default; apenas o valor explícito `false` oculta o botão.

### `data-testid` automático

`slugifyLabel(label)` normaliza (NFD), remove acentos, converte para minúsculas e troca
não-alfanuméricos por `-`. A precedência é:

```
data-testid explícito  →  slug do label  →  id  →  `botao-${variant}`
```

O `id` do elemento segue `id ?? resolvedTestId`. Exemplo: `label="Gerar Ofício"` →
`data-testid="gerar-oficio"`.

### `aria-label` automático

Todo botão expõe `aria-label`, resolvido na mesma lógica do `data-testid`:

```
aria-label explícito  →  label  →  tooltip
```

Isso dá nome acessível ao `BotaoIconSeplag` (que só tem ícone) a partir do seu `tooltip`, e torna
`getByRole("button", { name })` e `getByLabelText` confiáveis em todos os componentes. Quando não há
nenhuma das três fontes — caso do `BotaoChipSeplag` — o atributo não é emitido e o nome acessível
vem dos `children`.

## Dependências

### Externas
- `primereact/button` — `Button`, `ButtonProps`

### Internas
- [`../../tokens/colors`](../../tokens/colors.ts) — `SEPLAG_PRIMARY`

**Nenhuma dependência de outro componente** — é folha do grafo.

## Módulos relacionados

Consumidores diretos (24): `Badge`, `Modal`, `ModalDelete`, `Tabs`, `Accordion`,
`AccordionCard`, `Card`, `TableGroup`, `TablePaginado`, `TableRowActions`, `FormActions`,
`GroupActions`, `ListaBuscaAcao`, `NotFound`, `AppTopbar`, `AppProfile`, `AppSwitcher`,
`AutoComplete`, `ReactCrop`, `Base64FileModal`, `UnsavedChangesProvider`, `Fields/CPFField`,
`DropdownBaseLegal` (templates/chips) e `PaginaInicial/Cronograma`.

## Fluxos importantes

**Resolução de estilo:**

```
props → { variant, unstyled, outlined, style, minWidth }
   │
   ├─ unstyled? ────────────────► mergedStyle = style
   │
   └─ switch(variant)
        save  → { ...saveBotaoStyle, ...style }
        back  → { ...backBotaoStyle, ...style }
        clear → { ...clearFilterBotaoStyle, ...style }
        icon  → { ...iconBotaoStyle, ...style }
        base  → { ...baseBotaoStyle, ...style } + (outlined ? {} : { border: "0px" })
   │
   └─ minWidth? → { ...mergedStyle, minWidth }
```

O `style` do consumidor sempre **sobrescreve** o da variante (espalhado depois).

## Testes

Arquivo: [`index.test.tsx`](./index.test.tsx) · execução: `npm test`

Especificação escrita **antes** do código (SDD). Cada linha das tabelas abaixo corresponde a
exatamente um `it(...)` do arquivo de teste, identificado pelo ID em comentário. Padrão AAA; consulta
preferencial por nome acessível / `aria-label`. Convenções gerais em
[`src/README.md` → Arquitetura de testes](../../README.md#arquitetura-de-testes).

### Esqueleto canônico

Os três casos obrigatórios, replicados para cada um dos 11 componentes exportados:

```tsx
describe("<NomeDoComponente>", () => {
  it("Deveria renderizar o <NomeDoComponente> corretamente", () => {
    // Arrange
    // Act
    // Assert
  });
  it("Deveria renderizar o <NomeDoComponente> com suas variações de estilo", () => { /* ... */ });
  it("Deveria renderizar o <NomeDoComponente> com todas as suas props preenchidas", () => { /* ... */ });
});
```

Os 11 componentes têm variação de estilo real, então nenhum precisou substituir o segundo caso.

### DOM de referência

Estrutura gerada pelo `Button` do PrimeReact (renderizado de verdade nos testes, sem mock):

```html
<button aria-label="Salvar" class="p-button p-component p-button-raised"
        id="salvar" data-testid="salvar"
        style="height: 40px; min-width: 120px; ... background-color: rgb(33, 150, 243);">
  <span class="p-button-icon p-c p-button-icon-left pi pi-save"></span>
  <span class="p-button-label p-c">Salvar</span>
</button>
```

Classes aplicadas conforme as props: `p-button-raised` (`raised`), `p-button-text` (`text`),
`p-button-outlined` (`outlined`), `p-button-danger` (`severity="danger"`) e `p-button-icon-only`
(há `icon`, sem `label` e sem `children`). Com `unstyled`, **nenhuma** classe é aplicada.

### `BotaoSeplag` — `BS`

| ID | Caso | Arrange | Act | Assert |
| --- | --- | --- | --- | --- |
| BS-01 | Renderiza corretamente | `label="Enviar"` | `render` | `getByRole("button", { name: "Enviar" })`; `aria-label="Enviar"`; `data-testid="enviar"`; `id="enviar"`; classe `p-button` |
| BS-02 | Variações de estilo | um render por `variant`: `base`, `save`, `back`, `clear`, `icon`, mais `unstyled` | `render` | estilo inline de cada variante conforme a tabela [Variantes de estilo](#variantes-de-estilo-variant); `unstyled` → sem `style` e sem classe `p-button` |
| BS-03 | Todas as props | `label`, `variant`, `icon`, `iconPos`, `tooltip`, `minWidth`, `style`, `hasPermission`, `visible`, `disabled`, `severity`, `raised`, `type`, `data-testid`, `id`, `onClick` | `render` + `click` | cada prop refletida no DOM; `onClick` chamado 1× |

### `BotaoAdicionarSeplag` — `BAD`

| ID | Caso | Arrange | Act | Assert |
| --- | --- | --- | --- | --- |
| BAD-01 | Renderiza corretamente | sem props | `render` | nome acessível `"Adicionar"`; `data-testid="adicionar"`; ícone `.pi-plus` à esquerda |
| BAD-02 | Variações de estilo | sem props / com `outlined` | `render` | base + `border: 0px`; com `outlined` a borda é mantida e a classe `p-button-outlined` aparece |
| BAD-03 | Todas as props | `label` custom, `icon`, `tooltip`, `minWidth`, `style`, `disabled`, `onClick` | `render` + `click` | label sobrescrito; `minWidth` vence a variante; `onClick` chamado |

### `BotaoSalvarSeplag` — `BSA`

| ID | Caso | Arrange | Act | Assert |
| --- | --- | --- | --- | --- |
| BSA-01 | Renderiza corretamente | sem props | `render` | nome acessível `"Salvar"`; `data-testid="salvar"`; ícone `.pi-save`; classe `p-button-raised` |
| BSA-02 | Variações de estilo | sem props / com `style` custom | `render` | `variant="save"`: `backgroundColor: #2196F3`, `color: white`, `height: 40px`; o `style` do consumidor sobrescreve a variante |
| BSA-03 | Todas as props | `label`, `icon`, `tooltip`, `minWidth`, `style`, `disabled`, `type`, `onClick` | `render` + `click` | props refletidas; com `disabled` o `onClick` **não** é chamado |

### `BotaoVoltarSeplag` — `BVO`

| ID | Caso | Arrange | Act | Assert |
| --- | --- | --- | --- | --- |
| BVO-01 | Renderiza corretamente | sem props | `render` | nome acessível `"Voltar"`; `data-testid="voltar"`; ícone `.pi-arrow-left`; `type="button"` |
| BVO-02 | Variações de estilo | sem props | `render` | `variant="back"`: `color: #2196F3`, `backgroundColor: white`, `borderColor: #2196F3`; classes `p-button-text` e `p-button-raised` |
| BVO-03 | Todas as props | `label`, `tooltip`, `minWidth`, `style`, `type="submit"`, `onClick` | `render` + `click` | `type` sobrescrevível; demais props refletidas |

### `BotaoFecharSeplag` — `BFE`

| ID | Caso | Arrange | Act | Assert |
| --- | --- | --- | --- | --- |
| BFE-01 | Renderiza corretamente | sem props | `render` | nome acessível `"Fechar"`; `data-testid="fechar"`; **sem** ícone; `type="button"` |
| BFE-02 | Variações de estilo | sem props | `render` | `variant="back"` + classes `p-button-text` / `p-button-raised` |
| BFE-03 | Todas as props | `label`, `icon`, `tooltip`, `minWidth`, `style`, `disabled`, `onClick` | `render` + `click` | props refletidas; `onClick` chamado |

### `BotaoConsultarSeplag` — `BCO`

| ID | Caso | Arrange | Act | Assert |
| --- | --- | --- | --- | --- |
| BCO-01 | Renderiza corretamente | sem props | `render` | nome acessível `"Consultar"`; `data-testid="consultar"`; ícone `.pi-search` |
| BCO-02 | Variações de estilo | sem props / `variant="save"` | `render` | base + `border: 0px`; `variant` sobrescrevível pelo consumidor |
| BCO-03 | Todas as props | `label`, `icon`, `tooltip`, `minWidth`, `style`, `type="submit"`, `onClick` | `render` + `click` | props refletidas; `onClick` chamado |

### `BotaoLimparFiltroSeplag` — `BLF`

| ID | Caso | Arrange | Act | Assert |
| --- | --- | --- | --- | --- |
| BLF-01 | Renderiza corretamente | sem props | `render` | nome acessível `"Limpar Filtro"`; `data-testid="limpar-filtro"` (espaço vira hífen) |
| BLF-02 | Variações de estilo | sem props / com `minWidth` | `render` | `variant="clear"`: `minWidth: 40px`, `height: 40px`, `border: 0px`; **não** herda `minWidth: 120` da base; `minWidth` prop sobrescreve |
| BLF-03 | Todas as props | `label`, `icon`, `tooltip`, `minWidth`, `style`, `disabled`, `onClick` | `render` + `click` | props refletidas; `onClick` chamado |

### `BotaoIconSeplag` — `BIC`

| ID | Caso | Arrange | Act | Assert |
| --- | --- | --- | --- | --- |
| BIC-01 | Renderiza corretamente | `icon="pi pi-cog"`, `tooltip="Configurar"` | `render` | `data-testid="botao-icon"` (fallback `botao-${variant}`); classe `p-button-icon-only`; `aria-label="Configurar"` derivado do tooltip |
| BIC-02 | Variações de estilo | `icon` | `render` | `variant="icon"`: `color: white`, `fontSize: 0.8rem`; **sem** `height` e sem `minWidth` |
| BIC-03 | Todas as props | `icon`, `aria-label` explícito, `tooltip`, `tooltipOptions`, `style`, `severity`, `disabled`, `onClick` | `render` + `click` | `aria-label` explícito vence o `tooltip`; `onClick` chamado |

### `BotaoChipSeplag` — `BCH`

| ID | Caso | Arrange | Act | Assert |
| --- | --- | --- | --- | --- |
| BCH-01 | Renderiza corretamente | `children="Documento X"` | `render` | nome acessível vem dos `children`; `type="button"`; `data-testid="botao-base"` |
| BCH-02 | Variações de estilo | sem `style` / com `style` custom | `render` | `unstyled`: **nenhuma** classe `p-button` e nenhum estilo de variante; só o `style` recebido é aplicado |
| BCH-03 | Todas as props | `children`, `style`, `className`, `onClick`, `type="submit"`, `tooltip`, `id` | `render` + `click` | props refletidas; `onClick` chamado |

### `BotaoEditarSeplag` — `BED`

| ID | Caso | Arrange | Act | Assert |
| --- | --- | --- | --- | --- |
| BED-01 | Renderiza corretamente | sem props | `render` | nome acessível `"Editar"`; `data-testid="editar"`; ícone `.pi-pencil`; `type="button"` |
| BED-02 | Variações de estilo | sem props | `render` | `variant="back"` + classe `p-button-text`; **sem** `p-button-raised` (diferença em relação a Voltar/Fechar) |
| BED-03 | Todas as props | `label`, `icon`, `tooltip`, `minWidth`, `style`, `disabled`, `type`, `onClick` | `render` + `click` | props refletidas; `onClick` chamado |

### `BotaoRemoverSeplag` — `BRE`

| ID | Caso | Arrange | Act | Assert |
| --- | --- | --- | --- | --- |
| BRE-01 | Renderiza corretamente | sem props | `render` | nome acessível `"Remover"`; `data-testid="remover"`; ícone `.pi-trash`; `type="button"` |
| BRE-02 | Variações de estilo | sem props | `render` | base **com** `outlined` → mantém a borda (sem `border: 0px`); classes `p-button-outlined` e `p-button-danger` |
| BRE-03 | Todas as props | `label`, `icon`, `tooltip`, `minWidth`, `style`, `severity`, `disabled`, `onClick` | `render` + `click` | props refletidas; com `disabled` o `onClick` **não** é chamado |

### Sugestões de cobertura adicional

Casos fora dos três obrigatórios, cobrindo a lógica de `ButtonSeplag` que é compartilhada pelos 11
componentes. Implementados no `describe("Botao — comportamentos transversais (SUGESTÃO)")`.

| ID | Caso | Por quê | Status |
| --- | --- | --- | --- |
| S-01 | `hasPermission={false}` não renderiza; `true`/ausente renderiza | Regra de permissão que protege 24 telas | ✅ |
| S-02 | `visible={false}` não renderiza; ausente renderiza | Retorna antes do cálculo de estilo | ✅ |
| S-03 | `onClick` dispara no clique; não dispara com `disabled` | Interação principal | ✅ |
| S-04 | Precedência do `data-testid`: explícito → slug do label → `id` → `botao-${variant}` | Contrato público documentado acima | ✅ |
| S-05 | `label="Gerar Ofício"` → `data-testid="gerar-oficio"` | **Canário de encoding** — ver nota abaixo | ✅ |
| S-06 | `id` final = `id ?? resolvedTestId` | Contrato público | ✅ |
| S-07 | `style` do consumidor vence a variante; `minWidth` vence os dois | Ordem de merge | ✅ |
| S-08 | `unstyled` ignora todas as variantes | | ✅ |
| S-09 | Label default sobrescrevível nos 10 wrappers (`it.each`) | Cobre os wrappers de uma vez | ✅ |
| S-10 | `type="button"` por padrão em Voltar/Fechar/Editar/Remover | Evita submit acidental dentro de `<form>` | ✅ |
| S-11 | Sem `tooltipOptions`, o tooltip abre no topo (`p-tooltip-top`); `{ position: "bottom" }` sobrescreve | Valida o default aplicado internamente, não só o repasse da prop | ✅ |
| S-12 | `BotaoIconSeplag` sem label deriva `aria-label` do `tooltip`; `aria-label` explícito tem precedência | Acessibilidade | ✅ |
| S-13 | `label` e `children` coexistem no DOM | Comportamento do `Button` do PrimeReact | ✅ |
| S-14 | **Regressão:** `label="!!!"` produz `data-testid=""` | Bug latente, ver abaixo | ✅ |

**Nota sobre o `S-05`.** A remoção de acento em `slugifyLabel` depende de `.normalize("NFD")` seguido
de uma faixa de caracteres combinantes (`U+0300`–`U+036F`) escrita com **caracteres literais** no
código-fonte, não com escapes Unicode. São bytes invisíveis no editor: qualquer coisa que renormalize
o arquivo para NFC (outro encoding, formatador, copy-paste) colapsa a faixa em silêncio, sem erro de
compilação nem de lint. Como o `data-testid` é contrato público consumido pelos testes E2E dos
sistemas SEPLAG, `"Gerar Ofício"` passaria a gerar `"gerar-of-cio"` e quebraria os seletores em
produção. O `S-05` existe para detectar isso.

**Nota sobre o `S-14`.** `slugifyLabel` retorna **string vazia** para labels compostos só de
símbolos. Como `""` não é nullish, o `??` da resolução do `data-testid` não cai para o `id` e o botão
fica com `data-testid=""` e `id=""`. O teste documenta o comportamento **atual**; ao corrigir
(`return slug || undefined;`) ele vira o teste de regressão da correção.

## Arquivos críticos

- [`index.tsx`](./index.tsx) — arquivo único; qualquer regressão afeta 24 componentes.
- [`index.test.tsx`](./index.test.tsx) — 57 casos (33 obrigatórios + 24 execuções das 14 sugestões,
  duas delas parametrizadas com `it.each`); cobertura de 100% em statements, branches e functions.
  Portão de qualquer alteração no arquivo acima.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **Exports faltando no barrel** | `BotaoEditarSeplag` (linha 250) e `BotaoRemoverSeplag` (linha 264) são definidos e exportados no arquivo, mas **não constam** em `componentes/index.ts`. Ambos são usados internamente por [`PaginaInicial`](../PaginaInicial/) — `BotaoRemoverSeplag` no `Cronograma` e no `Informativos`, `BotaoEditarSeplag` no `Informativos`. Ou seja, existe componente público dependendo de símbolos que os consumidores não conseguem importar. Ver R-08. |
| Média | **`props as any`** | `ButtonSeplag` faz `const { ... } = props as any` e `(props as any).children`, perdendo a tipagem da desestruturação. `BotaoSeplagProps` já declara `data-testid`, mas ainda **não declara `children`**, embora seja usado. |
| Baixa | **`tooltipOptions?: any`** | Tipo abre mão da tipagem do PrimeReact; `defaultTooltipOptions` também é `as any`. |
| Baixa | **Estilos como objetos de módulo** | Os 6 objetos de estilo (`baseBotaoStyle`, `saveBotaoStyle`, …) são constantes de módulo compartilhadas. São espalhados a cada render (`{ ...saveBotaoStyle, ...style }`), então não há mutação — mas também não há memoização do objeto resultante. |
| Baixa | **Cores parcialmente tokenizadas** | Usa `SEPLAG_PRIMARY`, mas `"white"` aparece como literal em `saveBotaoStyle`, `backBotaoStyle` e `iconBotaoStyle`, em vez de `SEPLAG_WHITE`. |
| Baixa | **`hasPermission` verificado tarde** | O `return null` por permissão ocorre **depois** do cálculo de `mergedStyle`, desperdiçando trabalho. O `visible` já retorna antes. |
| Baixa | **`slugifyLabel` pode retornar `""`** | Label só com símbolos (`"!!!"`) produz string vazia; como `""` não é nullish, o `??` não cai para o `id` e o botão fica com `data-testid=""`. Coberto pelo teste `S-14`; correção sugerida: `return slug \|\| undefined;`. |
| Baixa | **Faixa Unicode literal em `slugifyLabel`** | A remoção de acentos usa `U+0300`–`U+036F` escrito com caracteres combinantes literais, invisíveis no editor e sensíveis a renormalização do arquivo. Coberto pelo teste `S-05`. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.4, R-08
- [Objetivo da biblioteca](../../../docs/objetivo-da-biblioteca-de-componentes.md) — P-01
- [`tokens/README.md`](../../tokens/README.md)
