# `CustomIcons/` — Ícones customizados dos sistemas SEPLAG

## Objetivo

Fornecer os nove ícones SVG que representam os sistemas corporativos da SEPLAG no seletor de
sistemas.

## Responsabilidade principal

Substituir uma dependência de biblioteca de ícones por SVGs inline versionados no
repositório, garantindo consistência visual e ausência de requisição externa.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 144 linhas.

```ts
export {
  BankNoteSeplag, ChartBreakoutSquareSeplag, ClipboardCheckSeplag, CoinsHandSeplag,
  FileCheckSeplag, MedicalCircleSeplag, StickerSquareSeplag, UserCheckSeplag, UserPlusSeplag,
} from "./CustomIcons";
```

## Funcionalidades existentes

### Catálogo

| Componente | Sistema representado |
| --- | --- |
| `UserCheckSeplag` | Gestão de Pessoas |
| `BankNoteSeplag` | Folha |
| `MedicalCircleSeplag` | Perícia |
| `CoinsHandSeplag` | Consignado |
| `ChartBreakoutSquareSeplag` | Contagem de Tempo |
| `StickerSquareSeplag` | e-Social |
| `UserPlusSeplag` | Aposentadoria |
| `ClipboardCheckSeplag` | Conformidade |
| `FileCheckSeplag` | Auditoria |

### Formato

Todos seguem o mesmo padrão — **sem props**:

```tsx
const UserCheckSeplag = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="..." stroke="#005494" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
```

Características comuns: `60×60`, `viewBox="0 0 60 60"`, `fill="none"`, traço `#005494`
(azul institucional), `strokeLinecap`/`strokeLinejoin` arredondados. A `strokeWidth` varia
entre `3` e `4` conforme o ícone.

**Hipótese:** os desenhos correspondem ao conjunto *Untitled UI* — o estilo (viewBox 60×60
com traço, nomes como `bank-note`, `chart-breakout-square`, `clipboard-check`,
`sticker-square`, `coins-hand`) é característico dessa biblioteca. O código não registra a
origem nem licença.

## Dependências

Nenhuma. São funções que devolvem JSX puro.

## Módulos relacionados

| Módulo | Uso |
| --- | --- |
| [`layout/AppSwitcher/sistemasSeplag.tsx`](../layout/AppSwitcher/sistemasSeplag.tsx) | **Único consumidor interno** — instancia cada ícone com `React.createElement(Componente)` |
| [`layout/AppSwitcher`](../layout/AppSwitcher/) | Renderiza `AppSystemItemSeplag.icon` quando é `ReactNode` |
| [`type/sistemas`](../../type/sistemas.ts) | Rótulos dos mesmos nove sistemas |

## Fluxos importantes

```
CustomIcons (9 componentes SVG)
      │
      ▼
sistemasSeplag.tsx
      icon: React.createElement(UserCheckSeplag)
      │
      ▼
AppSystemItemSeplag { id, label, url, icon: ReactNode }
      │
      ▼
AppSwitcherSeplag
      typeof item.icon === "string"
        ? <i className={item.icon} style={{ fontSize: "3rem" }} />   ← PrimeIcons
        : item.icon                                                   ← CustomIcons
```

O `AppSystemItemSeplag.icon` aceita `string | ReactNode`, permitindo tanto classes PrimeIcons
quanto estes componentes.

## Arquivos críticos

Nenhum. Componentes estáticos e isolados.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **Sem props** | Tamanho (`60×60`) e cor (`#005494`) são **fixos**. Não é possível reutilizar os ícones em outro contexto (menu, badge, cabeçalho) sem CSS externo forçando `width`/`height`/`stroke`. Aceitar `size` e `color` seria uma extensão natural. |
| Média | **Cor hardcoded** | `#005494` repetido em todos os nove SVGs, sem constante em [`tokens/colors`](../../tokens/colors.ts) — e esse azul **não corresponde** a nenhum token existente (`SEPLAG_PRIMARY` é `#2196F3`). Viola **RA-07**. Ver R-04. |
| Baixa | **Sem acessibilidade** | Nenhum SVG tem `role="img"`, `aria-label` ou `<title>`. No `AppSwitcherSeplag` o rótulo textual está ao lado, o que mitiga o problema **nesse** contexto. |
| Baixa | **`strokeWidth` inconsistente** | Varia entre `3` e `4` entre os ícones, gerando peso visual desigual na grade do seletor. |
| Baixa | **Origem e licença não documentadas** | Não há comentário indicando a fonte dos desenhos. |
| Baixa | **Fora do padrão de pasta** | Nove componentes públicos em um único `index.tsx`, sem subarquivos — dificulta localizar e alterar um ícone específico. |
| Baixa | **Import de `React` sem uso** | O arquivo não importa React (JSX transform automático), mas `sistemasSeplag.tsx` importa para usar `React.createElement` — poderia usar JSX diretamente (`icon: <UserCheckSeplag />`). |
| Baixa | Sem testes. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-04, RA-07
- [Objetivo da biblioteca](../../../docs/objetivo-da-biblioteca-de-componentes.md) — §1.1
- [`layout/AppSwitcher/README.md`](../layout/AppSwitcher/README.md) · [`tokens/README.md`](../../tokens/README.md)
