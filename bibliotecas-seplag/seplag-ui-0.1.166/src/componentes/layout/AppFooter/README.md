# `layout/AppFooter/` — AppFooterSeplag

> Documentação completa do módulo de layout: [`../README.md`](../README.md)

## Objetivo

Rodapé institucional da aplicação.

## Responsabilidade principal

Exibir o texto institucional padrão ou conteúdo customizado. É o menor componente do módulo
de layout (12 linhas).

## Ponto de entrada

[`AppFooter.tsx`](./AppFooter.tsx).

```ts
export { AppFooterSeplag } from "./layout/AppFooter/AppFooter";
export type { AppFooterSeplagProps } from "./layout/AppFooter/AppFooter";
```

## Funcionalidades

### Props

| Prop | Tipo | Papel |
| --- | --- | --- |
| `text` | `string` | Texto exibido quando não há `children` |
| `children` | `ReactNode` | Conteúdo customizado — **tem precedência sobre `text`** |

### Implementação

```tsx
export function AppFooterSeplag({ children, text }: AppFooterSeplagProps) {
  return (
    <div className="layout-footer" id="app-footer" data-testid="app-footer">
      {children ?? <span>{text}</span>}
    </div>
  );
}
```

A classe `layout-footer` vem de [`../layout/Layout.css`](../layout/Layout.css) (CSS global).

### Uso pelo `LayoutSeplag`

```tsx
<AppFooterSeplag text={footerText}>{footerChildren}</AppFooterSeplag>
```

Onde `footerText` tem default
[`SEPLAG_NOME_ORGAO_SEPLAG`](../Config/institucional.ts) e `footerChildren` é opcional.

## Dependências

- **Externas:** `react` (tipo `ReactNode`)
- **Internas:** nenhuma — depende apenas da classe CSS global `layout-footer`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`layout/Layout.tsx`](../layout/) | Único consumidor interno |
| [`Config/institucional`](../Config/institucional.ts) | Fonte do texto default (via `LayoutSeplag`) |
| [`NotFound`](../../NotFound/) | Usa o mesmo texto institucional no painel da 404 |

## Fluxos importantes

```
Config/institucional.ts
   SEPLAG_NOME_ORGAO_SEPLAG
      │  (default de LayoutSeplagProps.footerText)
      ▼
<LayoutSeplag footerText={...} footerChildren={...}>
      └─ <AppFooterSeplag text={footerText}>{footerChildren}</AppFooterSeplag>
            │
            └─ children ?? <span>{text}</span>
```

Para um rodapé customizado, passe `footerChildren` ao `LayoutSeplag`; o `footerText` é
ignorado nesse caso.

## Arquivos críticos

Nenhum. É o menor componente do módulo (12 linhas) e não contém lógica — o risco está apenas
na classe global `layout-footer`, definida em [`../layout/Layout.css`](../layout/Layout.css).

## Débitos específicos deste arquivo

| Severidade | Item |
| --- | --- |
| Baixa | **Sem `Readonly<>` nas props** | Diverge do padrão dominante da biblioteca (`props: Readonly<Props>`). |
| Baixa | **`children ?? <span>{text}</span>`** | Com `children` e sem `text`, o rodapé fica vazio silenciosamente. Sem nenhum dos dois, renderiza `<span></span>`. |
| Baixa | **Dependência de CSS global** | A classe `layout-footer` é definida em `Layout.css`; usar o componente fora do `LayoutSeplag` exige importar esse CSS. |
| Baixa | **Sem `<footer>` semântico** | Usa `<div>` em vez do elemento HTML `<footer>`. |
| Baixa | Sem testes. |

## Documentos relacionados

- [`../README.md`](../README.md) — documentação completa do módulo de layout
- [`../Config/README.md`](../Config/README.md)
