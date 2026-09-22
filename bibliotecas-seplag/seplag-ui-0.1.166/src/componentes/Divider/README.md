# `Divider/` — DividerSeplag

## Objetivo

Separador horizontal integrado ao grid responsivo da biblioteca.

## Responsabilidade principal

Encapsular o `Divider` do PrimeReact acrescentando a prop `cols`, para que o separador ocupe
a largura correta dentro de um `grid`.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 18 linhas, o menor componente do catálogo.

```ts
export { DividerSeplag } from "./Divider";
export type { DividerSeplagProps } from "./Divider";
```

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `cols` | `"12"` | Grid via `classesCssSeplag` |
| `className` | `""` | Classe adicional, concatenada após a de grid |

### Implementação

```tsx
const colClass = gridCss(cols);
const wrapperClass = className ? `${colClass} ${className}` : colClass;
return <Divider className={wrapperClass} />;
```

A classe de grid é aplicada **no próprio `Divider`**, não em um wrapper.

## Dependências

### Externas
- `primereact/divider` — `Divider`

### Internas
- [`../../uteis/Grid`](../../uteis/Grid.ts) — `classesCssSeplag`

## Módulos relacionados

| Consumidor | Uso |
| --- | --- |
| [`FormActions`](../FormActions/) | Renderiza `<DividerSeplag className="col-12" />` antes dos botões |

| Alternativa | Quando usar |
| --- | --- |
| **`DividerSeplag`** | Separação simples entre blocos, dentro de um `grid` |
| [`PanelSeplag`](../PanelSeplag/) | Agrupamento com borda, título e descrição |
| [`Card`](../Card/) | Já inclui um `<hr/>` abaixo do título |

## Fluxos importantes

```tsx
<CardSeplag title="Cadastro">
  <TextFieldSeplag name="nome" control={control} cols="12 6" .../>
  <TextFieldSeplag name="email" control={control} cols="12 6" .../>

  <DividerSeplag />                    {/* ocupa col-12 */}

  <TextFieldSeplag name="cep" control={control} cols="12 3" .../>
  <TextFieldSeplag name="logradouro" control={control} cols="12 9" .../>
</CardSeplag>
```

## Arquivos críticos

Nenhum. É o componente de menor superfície e menor risco da biblioteca.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Baixa | **Props do PrimeReact não repassadas** | `layout` (`"horizontal"`/`"vertical"`), `align`, `type` (`"solid"`/`"dashed"`/`"dotted"`) e `children` do `Divider` original **não são expostos** nem repassados. Só é possível usar o separador horizontal sólido padrão. |
| Baixa | **`className` duplicado no `FormActions`** | O único consumidor interno passa `className="col-12"`, resultando em `" col-12 col-12"` (a classe de grid default já é `col-12`). Redundante, mas sem efeito visual. |
| Baixa | **Sem `id`/`data-testid`** | Diverge da convenção da biblioteca (§3.4), embora seja um elemento puramente decorativo. |
| Baixa | Sem testes. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.5
- [`uteis/README.md`](../../uteis/README.md) · [`FormActions/README.md`](../FormActions/README.md)
