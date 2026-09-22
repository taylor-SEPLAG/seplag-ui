# `AccordionCard/` — AccordionCardSeplag

## Objetivo

Cartão colapsável controlado: cabeçalho com ícone, título, área à direita e conteúdo que
expande/recolhe com animação CSS.

## Responsabilidade principal

Cobrir o caso de seção colapsável **sem tabela e sem paginação** — a contrapartida leve do
[`AccordionSeplag`](../Accordion/).

## Ponto de entrada

[`index.tsx`](./index.tsx) — 141 linhas.

```ts
export { AccordionCardSeplag } from "./AccordionCard";
export type { AccordionCardSeplagProps } from "./AccordionCard";
```

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `isOpen` | — | **Controlado pelo consumidor** (obrigatório) |
| `onToggle` | — | Callback do botão de alternância |
| `title` | — | Texto do cabeçalho |
| `id` | — | Base dos `data-testid` |
| `iconTitulo` | `"pi pi-users"` | Ícone à esquerda do título |
| `showIcon` | — | **Quando falsy, nenhum botão de alternância é renderizado** |
| `toggleElement` | — | Substitui o botão padrão |
| `headerRight` | — | Conteúdo entre o título e o botão |
| `children` | — | Conteúdo colapsável |
| `className` / `headerClassName` | — | Classes extras |
| `containerStyle` | `defaultCardStyle` | **Substitui** o estilo do cartão |
| `headerStyle` | `defaultHeaderTextStyle` | **Substitui** o estilo do título |
| `iconStyleOverride` | `defaultIconStyle` | **Substitui** o estilo do ícone |
| `toggleStyleOverride` | — | **Mesclado** com `defaultCollapseButtonStyle` |
| `contentStyle` | — | Estilo extra do wrapper de conteúdo |
| `transitionDuration` | `300` | Duração da animação (ms) |
| `transitionEasing` | `"ease"` | Função de easing |

### Animação de altura sem JavaScript

Técnica de `grid-template-rows` — anima altura desconhecida usando apenas CSS:

```tsx
<div style={{
  display: "grid",
  gridTemplateRows: isOpen ? "1fr" : "0fr",
  transition: `grid-template-rows ${transitionDuration}ms ${transitionEasing}`,
}}>
  <div style={{ overflow: "hidden", ...contentStyle }}>{children}</div>
</div>
```

Vantagem sobre `max-height`: a transição é sempre precisa, independentemente da altura real
do conteúdo. Dispensa `CSSTransition` do PrimeReact (usado no menu lateral).

### Botão de alternância

`BotaoSeplag` 32×32 com `pi pi-chevron-down`, girado por `transform`:
`rotate(0deg)` aberto, `rotate(-90deg)` fechado. `aria-expanded={isOpen}` e
`title` alternando entre `"Fechar"` e `"Abrir"`.

### Identificadores

`cardTestId` = `id == null ? "accordion-card" : \`accordion-card-${id}\`` ·
`toggleTestId` = `` `${cardTestId}-toggle` ``.

> Quando `id` é `null`/`undefined`, o `data-testid` fica no valor genérico
> `"accordion-card"` mas o atributo `id` do elemento fica `undefined`.

### Estilos default

Objetos de módulo, não tokens: `#e2e8f0` (borda), `#f8fafc` (fundo), `#1e293b` (título),
`#475569` (ícone e botão).

## Dependências

### Externas
- `react`

### Internas
- [`@componentes/Botao`](../Botao/) — `BotaoSeplag`

Não usa PrimeReact diretamente nem CSS Module — todo o estilo é inline.

## Módulos relacionados

| Alternativa | Quando usar |
| --- | --- |
| [`Accordion`](../Accordion/) | Lista **paginada** agrupada em acordeões, sobre `TablePaginadoSeplag` |
| **`AccordionCard`** | Seção colapsável avulsa, com estado controlado pelo consumidor |
| [`PanelSeplag`](../PanelSeplag/) | Seção **sempre visível**, com borda e título |
| [`Card`](../Card/) | Moldura de tela inteira |

Nenhum componente da biblioteca consome `AccordionCardSeplag` internamente.

## Fluxos importantes

**Um aberto por vez:**

```tsx
const [aberto, setAberto] = useState<number | null>(null);

{dependentes.map((d) => (
  <AccordionCardSeplag
    key={d.id}
    id={d.id}
    title={d.nome}
    iconTitulo="pi pi-user"
    showIcon
    isOpen={aberto === d.id}
    onToggle={() => setAberto(aberto === d.id ? null : d.id)}
    headerRight={<BadgeSeplag label={d.parentesco} size="xs" />}
  >
    <div className="grid">
      <TextFieldSeplag name={`dependentes.${i}.nome`} control={control} cols="12 6" .../>
    </div>
  </AccordionCardSeplag>
))}
```

**Vários abertos simultaneamente:**

```tsx
const [abertos, setAbertos] = useState<Set<number>>(new Set());
const alternar = (id: number) =>
  setAbertos((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
```

## Arquivos críticos

- [`index.tsx`](./index.tsx) — arquivo único.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **`showIcon` sem default e obscuro** | Sem `showIcon`, **nenhum botão de alternância é renderizado** — o cartão fica permanentemente no estado passado em `isOpen`, sem interação. O nome da prop não sugere "renderizar o controle de expansão"; `showToggle` seria mais claro. |
| Média | **Cores hardcoded** | `#e2e8f0`, `#f8fafc`, `#1e293b`, `#475569` nos objetos de estilo default. Viola **RA-07**. Ver R-04. |
| Baixa | **Estilos substituem em vez de mesclar** | `containerStyle`, `headerStyle` e `iconStyleOverride` **substituem** os defaults (`props ?? default`), enquanto `toggleStyleOverride` **mescla** (`{ ...default, ...override }`). Comportamento inconsistente entre props semelhantes. |
| Baixa | **Sem `cols`** | Não integra o grid da biblioteca; precisa de wrapper. |
| Baixa | **Todo o estilo inline** | Nenhum CSS Module na pasta, apesar do padrão comum na biblioteca. |
| Baixa | **`onToggle` opcional sem `type="button"`** | O `BotaoSeplag` do toggle não declara `type`; dentro de um `<form>`, pode disparar submit. |
| Baixa | **`title` opcional sem fallback** | Sem `title`, o `<span>` renderiza vazio ocupando espaço no cabeçalho. |
| Baixa | **`id` afeta `data-testid` e `id` de formas diferentes** | `data-testid` sempre presente; `id` só quando `id != null`. |
| Baixa | Sem testes. |
| Positivo | **Animação com `grid-template-rows`** | Técnica moderna, precisa e sem JavaScript de medição. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-04
- [`Accordion/README.md`](../Accordion/README.md) · [`PanelSeplag/README.md`](../PanelSeplag/README.md)
