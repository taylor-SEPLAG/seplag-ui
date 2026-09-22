# `layout/AppTopbar/` — AppTopbarSeplag

> Documentação completa do módulo de layout: [`../README.md`](../README.md)

## Objetivo

Barra superior da aplicação: botão hambúrguer animado, identificação do sistema e ambiente,
e seletor de sistemas.

## Responsabilidade principal

Camada fina de apresentação. Todo o estado do menu vive no [`LayoutSeplag`](../layout/) —
a topbar apenas recebe `isSidebarVisible` e dispara `onToggleMenu`.

## Ponto de entrada

[`index.tsx`](./index.tsx) — 46 linhas.

```ts
export { AppTopbarSeplag } from "./layout/AppTopbar";
export type { AppTopbarSeplagProps } from "./layout/AppTopbar";
```

## Funcionalidades

### Props

| Prop | Tipo | Papel |
| --- | --- | --- |
| `isSidebarVisible` | `boolean` | Estado visual do hambúrguer e `aria-label` |
| `onToggleMenu` | `(event: React.MouseEvent) => void` | Alterna o menu |
| `currentSystem` | `string` | Nome do sistema atual |
| `ambienteSistema` | `string` | Ambiente (ex.: "Homologação") |
| `systemas` | `AppSystemItemSeplag[]` | Lista para o `AppSwitcherSeplag` (**nome com grafia divergente**) |

### Estrutura

```html
<div class={layout-topbar} id="app-topbar" data-testid="app-topbar">
  <BotaoSeplag unstyled id="app-topbar-menu-toggle" aria-label="Abrir menu|Fechar menu">
    <div class="menu-btn [open]"><div class="menu-burger"/></div>
  </BotaoSeplag>

  <div style="display:flex; align-items:center; gap:0.5rem">
    <span style="font-size:18px; font-weight:600; margin-right:10px">
      {currentSystem} - {ambienteSistema}
    </span>
    <AppSwitcherSeplag items={systemas} currentSystem={currentSystem} />
  </div>
</div>
```

O hambúrguer animado é puramente CSS: a classe `open` do
[`AppTopbar.module.css`](./AppTopbar.module.css) transforma as barras em "X".

`aria-label` alterna entre `"Fechar menu"` e `"Abrir menu"` conforme `isSidebarVisible`.

## Dependências

- **Externas:** nenhuma diretamente
- **Internas:** [`@componentes/Botao`](../../Botao/) — `BotaoSeplag`;
  [`@componentes/layout/AppSwitcher`](../AppSwitcher/) — `AppSwitcherSeplag`, `AppSystemItemSeplag`;
  [`AppTopbar.module.css`](./AppTopbar.module.css) — `layout-topbar`, `layout-menu-button`,
  `menu-link`, `menu-btn`, `open`, `menu-burger`

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`layout/Layout.tsx`](../layout/) | Fornece `onToggleMenu` e `isSidebarVisible` |
| [`AppSwitcher`](../AppSwitcher/) | Montado internamente |
| [`type/sistemas`](../../../type/sistemas.ts) | Origem dos valores de `currentSystem` |

## Fluxos importantes

```
LayoutSeplag
   estado: staticMenuInactive | overlayMenuActive | mobileMenuActive
      │  isSidebarOpen (derivado) · onToggleMenu
      ▼
<AppTopbarSeplag isSidebarVisible={isSidebarOpen} onToggleMenu={onToggleMenu}
                 currentSystem ambienteSistema systemas>
      │
      ├─ hambúrguer → onToggleMenu(event)
      │     └─ LayoutSeplag decide o que alternar (isDesktop × menuMode)
      │     └─ classe `open` anima as barras em "X" (CSS Module)
      │
      ├─ "{currentSystem} - {ambienteSistema}"
      │
      └─ <AppSwitcherSeplag items={systemas} currentSystem={currentSystem} />
```

O componente é **totalmente controlado**: não guarda estado próprio.

## Arquivos críticos

- [`index.tsx`](./index.tsx) — 46 linhas, sem lógica; o risco está concentrado em
  [`AppTopbar.module.css`](./AppTopbar.module.css), que define o posicionamento fixo da barra
  superior e a animação do hambúrguer.

## Débitos específicos deste arquivo

| Severidade | Item |
| --- | --- |
| Baixa | **`systemas` — grafia incorreta** | A prop pública se chama `systemas` (mistura de inglês e português) em vez de `sistemas`, que é o nome usado em [`LayoutSeplagProps`](../layout/Layout.tsx). Corrigir é *breaking change*. |
| Baixa | **Formato fixo do título** | `` `${currentSystem} - ${ambienteSistema}` `` é montado inline, sem prop de template. Não há como omitir o ambiente em produção sem passar string vazia (que deixaria o traço solto). |
| Baixa | **Estilos inline** | `fontSize: "18px"`, `fontWeight: 600`, `marginRight: "10px"` e o `flex` do contêiner estão inline, embora exista um CSS Module na pasta. |
| Baixa | **Sem `aria-expanded`** | O botão usa `aria-label` variável, mas não expõe `aria-expanded={isSidebarVisible}`. |
| Baixa | Sem testes. |

## Documentos relacionados

- [`../README.md`](../README.md) — documentação completa do módulo de layout
- [`../AppSwitcher/README.md`](../AppSwitcher/README.md)
