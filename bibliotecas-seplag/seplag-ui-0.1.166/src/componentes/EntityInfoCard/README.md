# `EntityInfoCard/` — EntityInfoCardSeplag

## Objetivo

Exibir um resumo de identificação de entidade — tipicamente nome e documento (CPF/CNPJ) — em
um cartão destacado no topo de uma tela.

## Responsabilidade principal

Dar contexto ao usuário sobre **de quem** é o registro que está sendo editado ou consultado,
com marcação semântica de lista de definições (`<dl>`/`<dt>`/`<dd>`).

## Ponto de entrada

[`index.tsx`](./index.tsx) — 50 linhas.

```ts
export { EntityInfoCardSeplag } from "./EntityInfoCard";
export type { EntityInfoCardSeplagProps } from "./EntityInfoCard";
```

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `id` | `"entity-info-card"` | `id` + `data-testid` |
| `nameLabel` | — | Rótulo do primeiro campo (`string \| null`) |
| `nameValue` | — | Valor do primeiro campo — exibido em **maiúsculas** (`uppercase`) |
| `documentLabel` | — | Rótulo do segundo campo |
| `documentValue` | — | Valor do segundo campo |
| `titulo` | — | Título opcional em `<h5>` |
| `className` | `"col-12"` | Classe do wrapper de grid |
| `cardClassName` | `"p-3 border-1 border-300 border-round bg-blue-50"` | Classe do cartão |

Valores `null`/`undefined` são substituídos por `—` (travessão, constante `EMPTY`).

### Estrutura

```html
<div class="{className}" style="box-sizing: border-box">
  <div id data-testid class="{cardClassName}" style="box-sizing: border-box">
    <h5 class="mb-3 text-blue-900"><strong>{titulo}</strong></h5>   <!-- só se titulo -->
    <dl class="flex flex-column m-0">
      <div class="flex align-items-start mb-2">
        <dt class="font-medium text-gray-700 mr-2">{nameLabel}:</dt>
        <dd class="m-0 text-gray-900 uppercase">{nameValue ?? "—"}</dd>
      </div>
      <div class="flex align-items-start">
        <dt class="font-medium text-gray-700 mr-2">{documentLabel}:</dt>
        <dd class="m-0 text-gray-900">{documentValue ?? "—"}</dd>
      </div>
    </dl>
  </div>
</div>
```

O estilo padrão é totalmente construído com classes utilitárias do PrimeFlex
(`bg-blue-50`, `border-300`, `text-blue-900`, `text-gray-700`), sem literais de cor.

## Dependências

### Externas
Nenhuma. HTML puro com classes PrimeFlex.

### Internas
Nenhuma. É folha do grafo — junto com [`ListaSimples`](../ListaSimples/), um dos poucos
componentes sem dependência alguma.

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`Card`](../Card/) | Contêiner típico; o `EntityInfoCard` costuma ser o primeiro filho |
| [`uteis`](../../uteis/) | `formatCPFSeplag` / `formatCNPJSeplag` para formatar `documentValue` |
| [`Badge`](../Badge/) | Alternativa para exibir status junto à identificação (via `actions` do `CardSeplag`) |

Nenhum componente da biblioteca consome `EntityInfoCardSeplag` internamente.

## Fluxos importantes

```tsx
<CardSeplag title="Dependentes" handleVoltar={voltar}>
  <EntityInfoCardSeplag
    id="servidor-info"
    titulo="Servidor"
    nameLabel="Nome"
    nameValue={servidor?.nome ?? null}
    documentLabel="CPF"
    documentValue={servidor ? formatCPFSeplag(servidor.cpf) : null}
  />

  <TablePaginadoSeplag data={dependentes} columns={colunas} ... />
</CardSeplag>
```

Enquanto os dados carregam, ambos os valores exibem `—` — não é preciso renderização
condicional no consumidor.

## Arquivos críticos

Nenhum. Componente pequeno, sem dependências e sem lógica.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Baixa | **Exatamente dois campos** | A estrutura é fixa: nome + documento. Não há como exibir um terceiro campo (matrícula, vínculo, órgão) sem usar outro componente. O nome genérico `EntityInfoCard` sugere flexibilidade que não existe. |
| Baixa | **`uppercase` fixo no primeiro valor** | `nameValue` é sempre exibido em maiúsculas, sem prop de controle. |
| Baixa | **Sem `cols`** | Usa `className` com default `"col-12"` em vez da prop `cols` + `classesCssSeplag` adotada por [`Card`](../Card/), [`PanelSeplag`](../PanelSeplag/), [`Divider`](../Divider/) e [`Mensagem`](../Mensagem/). Inconsistente com §3.5. |
| Baixa | **Rótulos `string \| null` obrigatórios** | Os quatro campos são obrigatórios no tipo, mas aceitam `null` — na prática, opcionais. `nameLabel?: string` seria mais claro. |
| Baixa | **Sem `visible`** | Diverge de vários componentes da biblioteca que aceitam `visible` para renderização condicional. |
| Baixa | **Sem skeleton** | Durante o carregamento exibe `—`; um estado de esqueleto ([`SkeletonSeplag`](../SkeletonSeplag/)) daria melhor percepção de progresso. |
| Baixa | Sem testes. |
| Positivo | **Marcação semântica** | `<dl>`/`<dt>`/`<dd>` é a estrutura HTML correta para pares rótulo-valor — leitores de tela anunciam a relação. |
| Positivo | **Sem literais de cor** | Usa apenas classes utilitárias do PrimeFlex. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.5, §3.8
- [`Card/README.md`](../Card/README.md) · [`uteis/README.md`](../../uteis/README.md)
