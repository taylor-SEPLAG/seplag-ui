# `ResumoValores/` — ResumoValoresSeplag

## Objetivo

Exibir uma faixa de totalizadores: pares rótulo/valor com o valor em destaque colorido.

## Responsabilidade principal

Padronizar o "quanto tem / quanto falta" que acompanha tabelas de alocação — o contador no
cabeçalho do painel e as faixas de saldo acima e abaixo da tabela.

É **puramente apresentacional**: não soma, não formata e não conhece a origem dos números.
Cada valor chega pronto do consumidor, com unidade inclusive (`"25 vagas"`).

## Ponto de entrada

[`index.tsx`](./index.tsx) + [`style.module.css`](./style.module.css).

```ts
export { ResumoValoresSeplag } from "./ResumoValores";
export type {
  ResumoValorSeplag, ResumoValorSeveridadeSeplag, ResumoValoresSeplagProps,
} from "./ResumoValores";
```

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `itens` | — | `readonly ResumoValorSeplag[]`; lista vazia retorna `null` |
| `variante` | `"inline"` | `"inline"` (não ocupa a linha) ou `"barra"` (largura total) |
| `alinhamento` | `"direita"` | `"esquerda"` \| `"direita"` \| `"entre"` |
| `id` | — | `id` do raiz e base dos `data-testid` |
| `className` | — | Classes extras no raiz |
| `ariaLabel` | `"Resumo"` | Nome acessível do `role="group"` |

### Item

```ts
interface ResumoValorSeplag {
  id: string | number;
  rotulo?: ReactNode;   // omitido → o valor aparece sozinho
  valor: ReactNode;
  severidade?: "neutro" | "info" | "sucesso" | "alerta" | "erro";  // default: "info"
}
```

`rotulo` opcional cobre os dois formatos observados: o contador de uma frase só
(`"0 vaga(s) selecionada(s)"`) e o par descritivo (`Já distribuídas` · `5 vagas`).

### Variantes

| Variante | Uso previsto |
| --- | --- |
| `inline` | No `trailing` do [`PanelSeplag`](../PanelSeplag/) — o `ml-auto` do painel já empurra para a direita |
| `barra` | Faixa de largura total acima ou abaixo de uma tabela |

### Cores

Todas de [`tokens/colors`](../../tokens/colors.ts) — `SEPLAG_INFO_TEXT`, `SEPLAG_SUCCESS_TEXT`,
`SEPLAG_WARNING_TEXT`, `SEPLAG_ERROR_TEXT`, `SEPLAG_GRAY_800` para o valor e `SEPLAG_GRAY_600`
para o rótulo. Nenhum literal de cor no componente (RA-07).

O default `"info"` reflete o padrão das telas de quadro de vagas, onde todo totalizador é azul.

### Divisão CSS Module × inline

Layout (flex, gap, tamanhos) fica em [`style.module.css`](./style.module.css); cor fica inline,
porque um CSS Module não consegue importar as constantes de `tokens/`.

### Semântica

`<div role="group" aria-label>` com um `<span>` por item — rótulo em `<span>` esmaecido e valor
em `<strong>`. Não usa `<dl>/<dt>/<dd>`: um `<dd>` sem `<dt>` seria inválido, e `rotulo` é
opcional. Leitores de tela leem cada par como uma frase contínua ("Já distribuídas 5 vagas").

`data-testid`: `` `${id}-${item.id}` `` por item, quando `id` é informado.

## Dependências

### Externas
Nenhuma. HTML puro.

### Internas
- [`../../tokens/colors`](../../tokens/colors.ts)

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`PanelSeplag`](../PanelSeplag/) | Consumidor previsto, pelo slot `trailing` |
| [`BarraProporcional`](../BarraProporcional/) | Também apresentacional, mas mostra **proporção** entre partes; este mostra **valores absolutos** rotulados |
| [`Badge`](../Badge/) | Para um único rótulo com fundo colorido, não uma faixa de pares |

## Fluxos importantes

```tsx
<PanelSeplag
  title="Redução por órgão de distribuição"
  description="Somente vagas disponíveis podem ser reduzidas."
  headerVariant="filled"
  trailing={
    <ResumoValoresSeplag itens={[{ id: "sel", valor: `${selecionadas} vaga(s) selecionada(s)` }]} />
  }
>
  <ResumoValoresSeplag
    variante="barra"
    itens={[
      { id: "distribuidas", rotulo: "Já distribuídas", valor: `${distribuidas} vagas` },
      { id: "pendentes", rotulo: "Pendente de distribuição", valor: `${pendentes} vagas` },
    ]}
  />

  <TabelaEditavelSeplag ... />

  <ResumoValoresSeplag
    variante="barra"
    itens={[
      { id: "aDistribuir", rotulo: "A distribuir nesta versão", valor: `${aDistribuir} vagas` },
      {
        id: "saldo",
        rotulo: "Saldo pendente após operação",
        valor: `${saldo} vagas`,
        severidade: saldo < 0 ? "erro" : "info",
      },
    ]}
  />
</PanelSeplag>
```

## Arquivos críticos

- [`index.tsx`](./index.tsx) — arquivo único, sem dependência de componentes.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Baixa | **Sem `cols`** | Como [`ListaSimples`](../ListaSimples/) e [`ListaBuscaAcao`](../ListaBuscaAcao/), não aceita a prop `cols` do grid da biblioteca. |
| Baixa | **Formatação é do consumidor** | O componente não formata número nem pluraliza. `"1 vagas"` é responsabilidade de quem chama — proposital, para não embutir regra de idioma, mas é uma pegadinha fácil. |
| Baixa | **Sem truncamento** | `white-space: nowrap` por item e `flex-wrap` no contêiner: em telas estreitas os itens quebram em várias linhas em vez de truncar. |
| Positivo | **Cores 100% de tokens** | Diferente de [`ListaBuscaAcao`](../ListaBuscaAcao/), não tem nenhum literal de cor. |
| Positivo | **Com testes** | [`index.test.tsx`](./index.test.tsx) cobre rótulo opcional, severidade, lista vazia e o `role="group"`. |

## Documentos relacionados

- [`PanelSeplag/README.md`](../PanelSeplag/README.md) — slot `trailing` e `headerVariant`
- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — RA-07
