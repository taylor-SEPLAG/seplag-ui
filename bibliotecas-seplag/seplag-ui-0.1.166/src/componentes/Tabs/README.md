# `Tabs/` — TabsSeplag

## Objetivo

Barra de abas construída sobre o grid do PrimeFlex, com suporte a dois modelos de controle
(por índice ou por valor) e bloqueio condicional de abas durante a criação de um registro.

## Responsabilidade principal

Navegar entre seções de um formulário longo. **Não renderiza o conteúdo das abas** — apenas
os botões; o consumidor decide o que exibir a partir do estado ativo.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 149 linhas.

```ts
export { TabsSeplag } from "./Tabs";
export type { TabItemSeplag, TabsSeplagProps } from "./Tabs";
```

## Funcionalidades existentes

### Modelo de item

```ts
interface TabItemSeplag<T = any> {
  id?: string;
  label: string;
  value?: T;
  disabled?: boolean;
  active?: boolean;
  icon?: string;
  index?: number;
  col?: string;   // ex.: "lg:col-3", "lg:col-2"
}
```

Chave de renderização (`getTabItemKey`): `item.id` → `String(item.value)` → `String(index)`.

### Dois modelos de controle

O componente suporta **duas APIs simultâneas**, por compatibilidade com o antigo
`MenuAbasSeplag`:

| Modelo | Props | Prioridade em `isTabActive` |
| --- | --- | --- |
| Por **valor** | `activeValue` + `onChange(value)` | 1ª — quando `activeValue !== undefined && item.value !== undefined` |
| Por **índice** | `activeIndex` + `onTabChange(item)` / `onTabChangeIndex(index)` | 2ª — quando `activeIndex !== undefined` |
| Por **item** | `item.active` | 3ª (fallback) |

`handleTabClick` segue a mesma precedência: `onChange` → `onTabChangeIndex` → `onTabChange`.

### Bloqueio de abas

```ts
isTabDisabled(item):
  isCreate && firstAbaLiberada !== undefined && item.value !== undefined
    → item.value !== firstAbaLiberada          // só a primeira aba é liberada
  senão
    → item.disabled || (disableTabsOnCreate && isCreate)
```

Cobre o caso "durante a criação, só a primeira aba está disponível; após salvar, todas
liberam".

### Estilo

| Estado | Cor de fundo |
| --- | --- |
| Ativa | `SEPLAG_PRIMARY` |
| Inativa | `SEPLAG_SECONDARY` |

Texto sempre `SEPLAG_WHITE`; borda `1px solid SEPLAG_BORDER_LIGHT`; altura fixa 44px;
`borderRadius: 0`; padding e margem zerados (abas coladas).

Largura: `col-12 md:col-6 {item.col ?? "lg:col-3"}` — 1 por linha no mobile, 2 no tablet,
4 no desktop (customizável por aba).

`maxWidth` opcional envolve a barra em um wrapper com largura máxima.

### Acessibilidade e identificação

`aria-pressed={active}` em cada botão. `data-testid`/`id`: `` `tab-${itemKey}` ``.

## Dependências

### Externas
Nenhuma diretamente (usa `BotaoSeplag`, que encapsula o PrimeReact).

### Internas
- [`@componentes/Botao`](../Botao/) — `BotaoSeplag`
- [`../../tokens/colors`](../../tokens/colors.ts) — `SEPLAG_PRIMARY`, `SEPLAG_SECONDARY`,
  `SEPLAG_WHITE`, `SEPLAG_BORDER_LIGHT`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`Card`](../Card/) | Contêiner típico da barra de abas |
| [`PanelSeplag`](../PanelSeplag/) | Agrupa o conteúdo de cada aba |
| [`UnsavedChangesWarning`](../UnsavedChangesWarning/) | `guard()` protege a troca de aba quando há alterações não salvas |

Nenhum componente da biblioteca consome `TabsSeplag` internamente.

## Fluxos importantes

**Modelo por valor (recomendado):**

```tsx
type Aba = "dados" | "endereco" | "documentos";
const [aba, setAba] = useState<Aba>("dados");

<TabsSeplag<Aba>
  activeValue={aba}
  onChange={setAba}
  isCreate={!servidorId}
  firstAbaLiberada="dados"
  items={[
    { label: "Dados pessoais", value: "dados",      icon: "pi pi-user" },
    { label: "Endereço",       value: "endereco",   icon: "pi pi-map-marker" },
    { label: "Documentos",     value: "documentos", icon: "pi pi-file" },
  ]}
/>

{aba === "dados"      && <AbaDados control={control} />}
{aba === "endereco"   && <AbaEndereco control={control} />}
{aba === "documentos" && <AbaDocumentos control={control} />}
```

Com `isCreate` e `firstAbaLiberada="dados"`, as abas Endereço e Documentos ficam
desabilitadas até o registro existir.

**Protegendo a troca de aba:**

```tsx
const { guard } = useUnsavedChangesSeplag();
<TabsSeplag activeValue={aba} onChange={(v) => guard(() => setAba(v))} items={abas} />
```

## Arquivos críticos

- [`index.tsx`](./index.tsx) — arquivo único.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **Duas APIs concorrentes** | `activeValue`/`onChange` e `activeIndex`/`onTabChange`/`onTabChangeIndex` coexistem por compatibilidade com o antigo `MenuAbasSeplag`. Não há tipo que impeça combinações inválidas (`activeValue` + `onTabChange`, por exemplo), e a precedência só é descoberta lendo o código. |
| Média | **Props declaradas e ignoradas** | `showRequiredLegend` e `legendPosition` são desestruturadas com prefixo `_` (`_showRequiredLegend`, `_legendPosition`) — ou seja, fazem parte da API pública mas **não têm efeito nenhum**. |
| Baixa | **Sem semântica ARIA de abas** | Usa `aria-pressed` (semântica de botão de alternância), não `role="tablist"`/`role="tab"`/`aria-selected`/`aria-controls`. Leitores de tela anunciam botões, não abas. |
| Baixa | **Sem navegação por teclado entre abas** | Não há tratamento de setas ←/→, esperado no padrão ARIA de tabs. |
| Baixa | **Não renderiza o conteúdo** | Diferente do `TabView` do PrimeReact, é apenas a barra — comportamento intencional, mas exige que o consumidor monte a renderização condicional. |
| Baixa | **`col` como string livre** | `item.col` recebe uma classe PrimeFlex crua (`"lg:col-2"`), fora da convenção `cols="12 6 3"` usada no restante da biblioteca (§3.5). |
| Baixa | **`T = any` no genérico** | Default `any` em `TabItemSeplag<T>` e `TabsSeplagProps<T>`. |
| Baixa | **Altura fixa 44px** | Sem prop de tamanho. |
| Baixa | **Sem testes** | Sem cobertura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.5
- [`Botao/README.md`](../Botao/README.md) · [`tokens/README.md`](../../tokens/README.md)
