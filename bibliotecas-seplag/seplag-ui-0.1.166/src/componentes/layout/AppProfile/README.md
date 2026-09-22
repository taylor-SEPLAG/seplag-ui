# `layout/AppProfile/` — AppProfileSeplag

> Documentação completa do módulo de layout: [`../README.md`](../README.md)

## Objetivo

Bloco de identidade do usuário na sidebar: avatar, nome, vínculo atual e menu de opções
(Perfil, Alterar Senha, Alterar Vínculo, Sair), com dois modais embutidos.

## Responsabilidade principal

Concentrar as ações de conta do usuário em todos os sistemas SEPLAG. **Não executa** troca
de senha nem de vínculo — coleta os dados e delega via callbacks.

## Ponto de entrada

[`AppProfile.tsx`](./AppProfile.tsx) — 306 linhas.

```ts
export { AppProfileSeplag } from "./layout/AppProfile/AppProfile";
export type { AppProfileSeplagProps } from "./layout/AppProfile/AppProfile";
```

## Funcionalidades

### Props

| Prop | Papel |
| --- | --- |
| `nomeApresentacao` | Nome exibido |
| `numrVinculoAtual` | Exibido como "Vínculo {n}" |
| `vinculos` | `IVinculoSeplag[]` — listados no modal de troca |
| `avatarSrc` | Default: `assets/img/default-avatar.jpg` |
| `onLogout` | Callback do item "Sair" |
| `onAlterarSenha(atual, nova, confirmar)` | Callback do modal de senha |
| `onSelecionarVinculo(vinculo)` | Callback do modal de vínculo |
| `collapsed` | `false` — alterna entre menu expandido e flyout |

### Dois modos de menu

| Modo | Comportamento |
| --- | --- |
| Expandido (`collapsed = false`) | `CSSTransition` revela `<ul class="layout-profile-expanded">` abaixo do nome |
| Recolhido (`collapsed = true`) | `OverlayPanel` posicionado à direita da sidebar, com `Tooltip` no avatar |

No modo recolhido, o cálculo de posição considera a largura da sidebar:

```tsx
const sidebarRect = event.currentTarget.closest(".layout-sidebar")?.getBoundingClientRect();
const rect = sidebarRect
  ? new DOMRect(buttonRect.x, buttonRect.top, sidebarRect.right - buttonRect.x, buttonRect.height)
  : buttonRect;
```

Coordenado por [`sidebarFlyoutRegistry`](../Config/sidebarFlyoutRegistry.ts) — apenas um
flyout aberto por vez.

### Modal "Trocar a Senha"

`ModalSeplag` (23rem) com três `Password` do PrimeReact dentro de `RotuloSeplag`:

| Campo | Configuração |
| --- | --- |
| Senha Atual | `feedback={false}` |
| Nova Senha | `weakLabel="Fraco"`, `mediumLabel="Médio"`, `strongLabel="Forte"`, `promptLabel="Entra com a Nova Senha"` |
| Confirma Nova Senha | `feedback={false}` |

Ao confirmar: chama `onAlterarSenha(senhaAtual, senhaNova, confirmarSenha)`, fecha o modal e
**limpa os três estados**.

### Modal "Alterar Vínculo"

`ModalSeplag` (60rem) com `DataTable` de seleção única, filtrando
`vinculos.filter((v) => v.statVinculo === "ATIVO")`.

Colunas: seleção · `numrVinculo` · `statVinculo` · `unidade.descUnidade` · `orgao.descOrgao`.

Ao confirmar: se houver seleção, chama `onSelecionarVinculo(vinculoSelected)` e recolhe o menu.

### Identificadores

`app-profile` · `app-profile-avatar` · `app-profile-toggle` · `app-profile-perfil` ·
`app-profile-alterar-senha` · `app-profile-alterar-vinculo` · `app-profile-sair` ·
`app-profile-senha-modal` (+ `-atual`, `-nova`, `-confirmar`) ·
`app-profile-vinculo-modal` · `app-profile-vinculo-table`.

## Dependências

- **Externas:** `primereact/overlaypanel`, `primereact/csstransition`, `primereact/tooltip`,
  `primereact/password`, `primereact/datatable`, `primereact/column`
- **Internas:** [`@componentes/Botao`](../../Botao/), [`@componentes/Modal`](../../Modal/),
  [`@componentes/Rotulo`](../../Rotulo/), [`../Config/menu`](../Config/menu.ts) (tipo
  `IVinculoSeplag`), [`../Config/sidebarFlyoutRegistry`](../Config/sidebarFlyoutRegistry.ts),
  `assets/img/default-avatar.jpg`, [`AppProfile.module.css`](./AppProfile.module.css)

## Módulos relacionados

| Módulo | Relação |
| --- | --- |
| [`../layout`](../layout/) | Monta o componente na sidebar e fornece `collapsed` |
| [`../Config/menu`](../Config/menu.ts) | Tipo `IVinculoSeplag` |
| [`../Config/sidebarFlyoutRegistry`](../Config/sidebarFlyoutRegistry.ts) | Coordena o flyout com os itens de menu |
| [`../AppSubmenuItem`](../AppSubmenuItem/) | Usa o mesmo padrão de flyout e o mesmo `applyOverlayPosition` |
| [`../../Modal`](../../Modal/) · [`../../Rotulo`](../../Rotulo/) | Modais de senha e vínculo |
| [`../../../lib/OAuth2Seplag`](../../../lib/OAuth2Seplag/) | `onLogout` normalmente chama `logoutSeplag()` |

## Fluxos importantes

**Troca de senha:**

```
"Alterar Senha" → overlayRef.hide() + setExibirTelaSenha(true)
      │
      ▼
<ModalSeplag titulo="Trocar a Senha" tamanho="23rem" labelAcao="Alterar">
   3 × <RotuloSeplag><Password/></RotuloSeplag>   (atual, nova, confirmar)
      │
      └─ "Alterar" → handleAlterarSenha()
            ├─ onAlterarSenha(senhaAtual, senhaNova, confirmarSenha)   ← consumidor valida e chama a API
            ├─ setExibirTelaSenha(false)
            └─ limpa os três estados
```

**Troca de vínculo:**

```
"Alterar Vínculo" → overlayRef.hide() + setExibirTelaVinculo(true)
      │
      ▼
<ModalSeplag titulo="Alterar Vínculo" tamanho="60rem">
   <DataTable value={vinculos.filter(v => v.statVinculo === "ATIVO")} selectionMode="single">
      colunas: seleção · numrVinculo · statVinculo · unidade.descUnidade · orgao.descOrgao
      │
      └─ "Alterar" → handleSelecionarVinculo()
            └─ vinculoSelected? → onSelecionarVinculo(vinculo) + setExpanded(false)
```

**Menu expandido × flyout:** `collapsed` determina se as opções aparecem em um
`CSSTransition` abaixo do nome ou em um `OverlayPanel` posicionado à direita da sidebar.

## Arquivos críticos

- [`AppProfile.tsx`](./AppProfile.tsx) — 306 linhas; concentra as ações de conta do usuário
  (incluindo troca de senha) de todos os sistemas SEPLAG.

## Débitos específicos deste arquivo

| Severidade | Item |
| --- | --- |
| **Média** | **`applyOverlayPosition` duplicado** — mesma lógica de `style.cssText +=` com `!important` e loop de 5 `requestAnimationFrame` presente em [`AppSubmenuItem.tsx`](../AppSubmenuItem/AppSubmenuItem.tsx). Ver R-06. |
| Média | **Senhas em `useState` de componente** | `senhaAtual`, `senhaNova` e `confirmarSenha` vivem no estado do React até o `handleAlterarSenha` limpá-los. Se o usuário fechar o modal pelo "Fechar" ou pelo ESC, **os valores permanecem em memória** — só o caminho de confirmação limpa. |
| Média | **Sem validação de confirmação** | O componente não verifica se `senhaNova === confirmarSenha` nem exige comprimento mínimo; a validação inteira fica a cargo do consumidor. |
| Baixa | **Item "Perfil" sem ação** | O `BotaoSeplag` de "Perfil" não tem `onClick` — é um item de menu inerte. |
| Baixa | **Filtro de vínculo por literal** | `v.statVinculo === "ATIVO"` usa string literal em vez de [`StatusKeySeplag.ATIVO`](../../../type/status.ts). |
| Baixa | **`style.cssText +=` acumulativo** | A string de estilo cresce a cada reposicionamento. |
| Baixa | **`z-index: 1100` fixo** | Precisa acompanhar a escala de [`AppPrimeReactProviderSeplag`](../../../provider/AppPrimeReactProvider/), que não é consultada aqui. |
| Baixa | Sem testes. |

## Documentos relacionados

- [`../README.md`](../README.md) — documentação completa do módulo de layout
- [`../Config/README.md`](../Config/README.md) · [`../../Modal/README.md`](../../Modal/README.md)
- [Arquitetura da biblioteca](../../../../docs/arquitetura-da-biblioteca-de-componentes.md) — R-06
