# `Card/` — CardSeplag

## Objetivo

Contêiner principal de conteúdo de tela: título, subtítulo, botão voltar, legenda, ações no
cabeçalho, rodapé e grid interno pronto para receber campos de formulário.

## Responsabilidade principal

Ser o **envelope padrão de uma página** nos sistemas SEPLAG. Define a moldura visual e
estabelece o contexto `grid` que faz a prop `cols` dos campos funcionar.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 163 linhas.

```ts
export { CardSeplag } from "./Card";
export type { CardSeplagProps } from "./Card";
```

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `id` | — | `id` + `data-testid` do `Card` |
| `cols` | `"12"` | Grid externo via `classesCssSeplag` |
| `title` | — | `string \| ReactNode` |
| `subtitle` | — | Renderizado como *pill* cinza |
| `subtitlePosition` | `"front"` | `"front"` (mesma linha) ou `"below"` (linha de baixo) |
| `handleVoltar` | — | Quando presente, adiciona `BotaoVoltarSeplag` à esquerda do título |
| `legenda` | — | `() => ReactNode` — bloco abaixo do título |
| `actions` | — | Conteúdo alinhado à direita do cabeçalho |
| `footer` | — | Renderizado após `children`, dentro do mesmo grid |
| `noPadding` | `false` | Remove o padding interno via CSS Module |
| `cardHeaderClassNames` | — | Classe adicional no `Card` |
| `style` | — | Estilo do wrapper de grid |
| `children` | — | Conteúdo |

### Duas montagens de cabeçalho

`title()` produz estruturas diferentes conforme `handleVoltar`:

**Com `handleVoltar`:**
```
<div class="col-12">
  <div class="grid" style="align-items:center">
    <div class="col-12">
      [BotaoVoltarSeplag] [<h5> título + subtítulo </h5>]  ...  [actions]
    </div>
    <div class="col-12">{legenda()}</div>
  </div>
  <hr/>
</div>
```

**Sem `handleVoltar`:**
```
<div class="col-12">
  <h5> título + subtítulo + legenda() </h5>  ...  [actions]
  <hr/>
</div>
```

> Note a diferença: **com** `handleVoltar`, a `legenda` fica em uma linha própria; **sem**,
> ela é renderizada **dentro do `<h5>`**, junto ao título.

### Estilo do subtítulo

Pill com fundo `var(--surface-100)`, borda `var(--surface-200)`, texto `var(--surface-500)`,
`borderRadius: 6px`, `fontSize: 0.78rem` — usa variáveis CSS do tema PrimeReact, não literais.

### Contexto de grid

O conteúdo é sempre envolvido em `<div className="grid">`, o que faz componentes com `cols`
(campos de `Fields/`, `PanelSeplag`, `DividerSeplag`, `MensagemSeplag`) se posicionarem
corretamente sem wrapper adicional.

## Dependências

### Externas
- `primereact/card` — `Card`

### Internas
- [`../../uteis/Grid`](../../uteis/Grid.ts) — `classesCssSeplag`
- [`../Botao`](../Botao/) — `BotaoVoltarSeplag`
- [`Card.module.css`](./Card.module.css) — classe `noPadding`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`Fields/`](../Fields/) | Campos dentro do `grid` do card |
| [`FilterForm`](../FilterForm/) | Formulário de filtros dentro do card |
| [`FormActions`](../FormActions/) | Rodapé de ações — pode ir em `footer` ou como último filho |
| [`TablePaginado`](../TablePaginado/) | Tabela dentro do card |
| [`PanelSeplag`](../PanelSeplag/) | Agrupamento **interno** ao card |
| [`Tabs`](../Tabs/) | Barra de abas dentro do card |

## Fluxos importantes

**Tela de listagem:**

```tsx
<CardSeplag id="lista-servidores" title="Servidores" subtitle={`${total} registros`}>
  <FilterFormSeplag>
    <TextFieldSeplag name="nome" label="Nome" control={control} cols="12 6" .../>
    <FilterActionsSeplag>
      <BotaoConsultarSeplag onClick={buscar} />
      <BotaoLimparFiltroSeplag onClick={resetAll} />
    </FilterActionsSeplag>
  </FilterFormSeplag>

  <TablePaginadoSeplag data={data} columns={colunas} rows={rows}
                       handleOnPageChange={onPageChange} hasEventoAcao
                       handleEdit={editar} handleDelete={excluir} />
</CardSeplag>
```

**Tela de formulário:**

```tsx
<CardSeplag
  id="editar-servidor"
  title="Editar servidor"
  subtitle={servidor?.matricula}
  subtitlePosition="below"
  handleVoltar={() => navigate(-1)}
  actions={<BadgeSeplag label={servidor?.situacao} variant="success" />}
>
  <form onSubmit={handleSubmit(salvar)}>
    <PanelSeplag title="Dados pessoais" cols="12">
      <TextFieldSeplag name="nome" control={control} cols="12 8" .../>
      <CPFFieldSeplag  name="cpf"  control={control} cols="12 4" .../>
    </PanelSeplag>
    <FormActionsSeplag onGoBack={() => navigate(-1)} isLoading={salvando} />
  </form>
</CardSeplag>
```

## Arquivos críticos

- [`index.tsx`](./index.tsx) — moldura padrão de praticamente toda tela da plataforma.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **Props sem `Readonly<>` e sem desestruturação** | O componente acessa `props.title`, `props.children` etc. diretamente, divergindo do padrão dominante da biblioteca (`Readonly<Props>` + desestruturação com defaults). |
| Média | **`legenda` renderizada em posições diferentes** | Com `handleVoltar`, vai para uma linha própria; sem, entra **dentro do `<h5>`**. Mesma prop, dois comportamentos, não documentado no tipo. |
| Baixa | **`legenda` é função, `actions`/`footer` são nós** | Inconsistência de API entre slots do mesmo componente: `legenda?: () => ReactNode` vs `actions?: ReactNode`. |
| Baixa | **`<hr/>` fixo** | O divisor abaixo do título é sempre renderizado quando há título, sem prop para desativar (contraste com `ModalSeplag`, que tem `showHeaderDivider`). |
| Baixa | **`minHeight: "35px"` condicional** | Aplicado ao `<h5>` apenas quando `subtitlePosition !== "below"`, para manter alinhamento — lógica visual sutil, sem comentário. |
| Baixa | **Cabeçalho não renderizado sem `title`** | `if (!props.title) return <></>` — `actions` e `legenda` também somem, mesmo que informados. |
| Baixa | **Sem testes** | Sem cobertura. |
| Positivo | **Usa variáveis CSS do tema** | O `subtitleStyle` referencia `var(--surface-*)` em vez de literais hexadecimais — boa prática, minoritária na biblioteca. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.5, §3.6
- [`PanelSeplag/README.md`](../PanelSeplag/README.md) · [`Fields/README.md`](../Fields/README.md)
