# `SecaoFormulario/` — SecaoFormularioSeplag

## Objetivo

Agrupar campos de um formulário em uma seção **não expansível**, com cabeçalho composto por
ícone em destaque (badge), título, descrição e uma linha divisória separando o conteúdo.

## Responsabilidade principal

Cobrir o caso de seção fixa dentro de um [`CardSeplag`](../Card/) — o conteúdo está sempre
visível, sem toggle.

## Ponto de entrada

[`index.tsx`](./index.tsx) — implementado com `forwardRef<HTMLElement>`.

```ts
export { SecaoFormularioSeplag } from "./SecaoFormulario";
export type { SecaoFormularioSeplagProps } from "./SecaoFormulario";
```

> Exporta nomeado **e** `default`. `displayName = "SecaoFormularioSeplag"` é definido
> explicitamente (necessário por causa do `forwardRef`).

## Quando usar cada contêiner

| Componente | Colapsável | Ícone | Divisor no cabeçalho |
| --- | --- | --- | --- |
| [`PanelSeplag`](../PanelSeplag/) | não | solto, sem badge | não |
| **`SecaoFormularioSeplag`** | **não** | **badge arredondado** | **sim** |
| [`AccordionCardSeplag`](../AccordionCard/) | sim | solto, sem badge | não |

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `cols` | `"12"` | Grid via `classesCssSeplag` |
| `title` | — | Título do cabeçalho |
| `description` | — | Texto de apoio abaixo do título |
| `icon` | — | Classe do ícone (ex.: `"pi pi-briefcase"`), renderizado dentro do badge |
| `iconElement` | — | Substitui o badge padrão por um nó próprio |
| `headerRight` | — | Conteúdo alinhado à direita do cabeçalho |
| `noPadding` | `false` | Remove o padding da área de conteúdo |
| `id` | — | `id` + base dos `data-testid` |
| `className` | — | Classes do contêiner interno |
| `classNameHeader` | — | Classes do cabeçalho |
| `ariaLabel` | — | Fallback: `title` (aplicado apenas quando não há cabeçalho) |
| `children` | — | Conteúdo da seção |

### Estrutura

```html
<section ref id data-testid class="{colClass}" aria-label="{ariaLabel|title se SEM header}">
  <div class="secao {className}">
    <!-- header: só quando title || description || icon || headerRight -->
    <header class="header {classNameHeader}" data-testid="{id}-header">
      <span class="badge"><i class="{icon}" /></span>
      <div class="textos">
        <strong class="titulo">{title}</strong>
        <span class="descricao">{description}</span>
      </div>
      <div class="ml-auto">{headerRight}</div>
    </header>
    <div class="conteudo|semPadding" data-testid="{id}-content">{children}</div>
  </div>
</section>
```

### Estilo

[`SecaoFormulario.module.css`](./SecaoFormulario.module.css) — cores via variáveis do tema
PrimeReact (`--surface-*`, `--primary-*`, `--text-color*`), com fallback literal em cada
`var()` para o caso de o tema não estar carregado.

## Exemplo

```tsx
<SecaoFormularioSeplag
  cols="12"
  icon="pi pi-briefcase"
  title="Identificação do quadro"
  description="Combinação utilizada para controlar o quantitativo."
>
  <div className="grid p-fluid">
    <DropdownFieldSeplag name="cargoId" control={control} label="Cargo" cols="12 md:4" />
  </div>
</SecaoFormularioSeplag>
```
