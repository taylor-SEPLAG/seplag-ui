# `Modal/` — ModalSeplag

## Objetivo

Diálogo padrão da plataforma SEPLAG, com cabeçalho, área de conteúdo em grid e rodapé de
ações pré-montado (Fechar + ação principal).

## Responsabilidade principal

Padronizar o comportamento e a aparência de todos os diálogos, evitando que cada tela monte
seu próprio `Dialog` do PrimeReact com rodapé, divisores e `zIndex` diferentes.

## Ponto de entrada

[`index.tsx`](./index.tsx) — exporta `ModalSeplag` (nomeado e default) e `ModalSeplagProps`.

## Funcionalidades existentes

### Props

| Prop | Default | Papel |
| --- | --- | --- |
| `id` | `"modal-seplag"` | Base de todos os `data-testid` |
| `visible` | — | Controlado pelo consumidor |
| `fechar` | — | Chamado pelo botão Fechar e pelo `onHide` |
| `funcAcao` | — | Chamado pelo botão de ação |
| `titulo` | — | `string \| ReactNode` |
| `children` | — | Renderizado dentro de `<div className="grid p-fluid">` |
| `labelFechar` / `labelAcao` | `"Fechar"` / `"Enviar"` | Rótulos dos botões |
| `iconFechar` / `iconAcao` | `pi pi-times` / `pi pi-check` | Ícones |
| `isSubmit` | `false` | Define `type="submit"` no botão de ação |
| `onlyClose` | `false` | Oculta o botão de ação |
| `hideFooter` | `false` | Remove o rodapé inteiro |
| `customFooter` | — | Substitui o rodapé padrão |
| `alignFooter` | `"right"` | Alinhamento dos botões |
| `showFooterDivider` / `showHeaderDivider` | `true` | Linhas divisórias |
| `tamanho` / `altura` | `"auto"` | `width` / `height` do diálogo |
| `overflow` | `"auto"` | `contentStyle.overflow` |
| `draggable` | `false` | Diálogo arrastável |
| `closeOnEscape` | `true` | Fecha com ESC |
| `ariaLabel` | — | Fallback: `titulo` se for string, senão `"Modal"` |

### Rodapé

Ordem de precedência:

```
hideFooter        → footer = undefined
customFooter      → <div className={footerDividerClassName}>{customFooter}</div>
padrão            → <BotaoVoltarSeplag id="{id}-fechar"> + <BotaoSalvarSeplag id="{id}-acao">
                     (o segundo omitido quando onlyClose)
```

O botão de ação recebe `autoFocus`.

### Identificadores

| Elemento | `data-testid` |
| --- | --- |
| Diálogo | `{id}` |
| Botão fechar | `{id}-fechar` |
| Botão de ação | `{id}-acao` |
| "X" do cabeçalho | `{id}-close-x` (via `pt.closeButton`) |

### Memoização

`handleClose`, `handleAction` (`useCallback`), `footerClassName`, `dialogStyle` e
`footerContent` (`useMemo`) — evitam recriar o rodapé a cada render do conteúdo.

## Dependências

### Externas
- `primereact/dialog` — `Dialog`

### Internas
- [`../Botao`](../Botao/) — `BotaoSalvarSeplag`, `BotaoVoltarSeplag`
- [`style.module.css`](./style.module.css) — `modalSeplag-footer-divider`,
  `modalSeplag-botoes-footer`, `modalSeplag-botoes-footer-right`, `modalSeplag-header-border`,
  `modalSeplag-wrapper`, `margin-app-entre-button`, `margin-superior-simples`, `quebrar-texto`

## Módulos relacionados

| Consumidor | Uso |
| --- | --- |
| [`layout/AppProfile`](../layout/AppProfile/) | Dois modais: troca de senha e troca de vínculo |
| [`UnsavedChangesWarning`](../UnsavedChangesWarning/) | `customFooter` com "Sim"/"Cancelar" |

Componentes relacionados que **não** usam `ModalSeplag`:
[`ModalDelete`](../ModalDelete/), [`Base64FileModal`](../Base64FileModal/) e
[`ReactCrop`](../ReactCrop/) montam `Dialog` diretamente.

## Fluxos importantes

```
Consumidor
  const [visivel, setVisivel] = useState(false)
      │
      ▼
<ModalSeplag id="editar-servidor" visible={visivel}
             titulo="Editar servidor" tamanho="40rem"
             labelAcao="Salvar" funcAcao={handleSalvar}
             fechar={() => setVisivel(false)}>
      │
      ├─ header  = titulo
      ├─ footer  = useMemo(...) → BotaoVoltarSeplag + BotaoSalvarSeplag
      ├─ onHide  = handleClose → fechar()
      └─ content = <div class="modalSeplag-wrapper"><div class="grid p-fluid">{children}</div></div>
                    └─ campos de Fields/ com cols funcionam normalmente aqui
```

O wrapper `grid p-fluid` significa que campos com `cols="12 6"` já se organizam corretamente
dentro do modal.

## Arquivos críticos

- [`index.tsx`](./index.tsx) — 159 linhas; base de todos os diálogos com rodapé padrão.

## Observações técnicas e débitos identificados

| Severidade | Item | Detalhe |
| --- | --- | --- |
| Média | **`fechar` acumula dois papéis** | É chamado tanto pelo botão "Fechar" quanto pelo `onHide` (ESC, clique no X, clique fora). Não há como distinguir cancelamento explícito de fechamento incidental. |
| Baixa | **`isSubmit` sem `<form>` próprio** | `type="submit"` só funciona se o consumidor envolver o modal (ou seu conteúdo) em um `<form>`. O componente não valida nem documenta essa exigência. |
| Baixa | **`showFooterDivider` também afeta o `customFooter`** | Quando `customFooter` é usado, o divisor ainda é aplicado no wrapper — comportamento não documentado nas props. |
| Baixa | **`altura` default `"auto"`** | Combinado com `contentStyle: { flex: 1 }`, pode gerar layouts inconsistentes em conteúdos altos sem `altura` explícita. |
| Baixa | **Sem `blockScroll`** | O `Dialog` não recebe `blockScroll`; a rolagem da página permanece ativa por trás do modal. |
| Baixa | **Sem testes** | Sem cobertura. |

## Documentos relacionados

- [Arquitetura da biblioteca](../../../docs/arquitetura-da-biblioteca-de-componentes.md) — §3.6
- [`Botao/README.md`](../Botao/README.md) · [`ModalDelete/README.md`](../ModalDelete/README.md)
