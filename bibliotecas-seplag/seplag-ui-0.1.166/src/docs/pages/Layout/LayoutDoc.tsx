import type { AppSystemItemSeplag } from "@componentes/layout/AppSwitcher";
import type { IMenuSeplag, IVinculoSeplag } from "@componentes/layout/Config/menu";
import { LayoutSeplag } from "@componentes/layout/layout/Layout";
import { useState } from "react";
import logoPlaceholder from "../../../assets/img/LOGO SEPLAG - BRANCO VAZADO.svg";
import { DocPage, PlaygroundCode, type DocProp, type DocSection } from "../../components/DocPage";
import "./LayoutDoc.css";

// ---------------------------------------------------------------------------
// Dados de exemplo
// ---------------------------------------------------------------------------

const exampleSistemas: AppSystemItemSeplag[] = [
  { id: "sgi", label: "SGI", url: "#", icon: "pi pi-briefcase" },
  { id: "siagro", label: "SIAGRO", url: "#", icon: "pi pi-chart-bar" },
  { id: "portal", label: "Portal", url: "#", icon: "pi pi-globe" },
];

const exampleVinculos: IVinculoSeplag[] = [
  {
    numrVinculo: "001",
    statVinculo: "ATIVO",
    unidade: { descUnidade: "STI" },
    orgao: { descOrgao: "SEPLAG" },
  },
  {
    numrVinculo: "002",
    statVinculo: "ATIVO",
    unidade: { descUnidade: "Coordenadoria de Sistemas" },
    orgao: { descOrgao: "SEPLAG" },
  },
];

const defaultMenu: IMenuSeplag[] = [
  {
    label: "Início",
    icon: "pi pi-home",
    to: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
  },
  {
    label: "Cadastro",
    icon: "pi pi-file-edit",
    visibleOnMenu: true,
    visibleOnRouter: true,
    items: [
      {
        label: "Pessoas",
        icon: "pi pi-users",
        to: "#",
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
      {
        label: "Cargos",
        icon: "pi pi-briefcase",
        to: "#",
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
    ],
  },
  {
    label: "Relatórios",
    icon: "pi pi-chart-bar",
    to: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
  },
  {
    label: "Configurações",
    icon: "pi pi-cog",
    to: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
  },
];

// ---------------------------------------------------------------------------
// Mini editor de itens de menu
// ---------------------------------------------------------------------------

interface MenuEditorGrandChild {
  id: number;
  label: string;
  icon: string;
}

interface MenuEditorChild {
  id: number;
  label: string;
  icon: string;
  children: MenuEditorGrandChild[];
}

interface MenuEditorItem {
  id: number;
  label: string;
  icon: string;
  children: MenuEditorChild[];
}

let nextId = 100;

function toIMenu(items: MenuEditorItem[]): IMenuSeplag[] {
  return items.map((item) => ({
    label: item.label,
    icon: item.icon,
    to: item.children.length === 0 ? "#" : undefined,
    visibleOnMenu: true,
    visibleOnRouter: true,
    items:
      item.children.length > 0
        ? item.children.map((c) => ({
            label: c.label,
            icon: c.icon,
            to: c.children.length === 0 ? "#" : undefined,
            visibleOnMenu: true,
            visibleOnRouter: true,
            items:
              c.children.length > 0
                ? c.children.map((gc) => ({
                    label: gc.label,
                    icon: gc.icon,
                    to: "#",
                    visibleOnMenu: true,
                    visibleOnRouter: true,
                  }))
                : undefined,
          }))
        : undefined,
  }));
}

const ICON_OPTIONS = [
  "pi pi-home",
  "pi pi-file-edit",
  "pi pi-users",
  "pi pi-briefcase",
  "pi pi-chart-bar",
  "pi pi-cog",
  "pi pi-bell",
  "pi pi-star",
  "pi pi-folder",
  "pi pi-list",
  "pi pi-search",
  "pi pi-table",
  "pi pi-calendar",
  "pi pi-map-marker",
  "pi pi-bookmark",
  "pi pi-shield",
];

interface MenuEditorProps {
  readonly items: MenuEditorItem[];
  readonly onChange: (items: MenuEditorItem[]) => void;
}

interface MenuEditorChildProps {
  readonly itemId: number;
  readonly child: MenuEditorChild;
  readonly onUpdateChild: (
    parentId: number,
    childId: number,
    field: "label" | "icon",
    value: string,
  ) => void;
  readonly onAddGrandChild: (parentId: number, childId: number) => void;
  readonly onRemoveChild: (parentId: number, childId: number) => void;
  readonly onUpdateGrandChild: (
    parentId: number,
    childId: number,
    grandChildId: number,
    field: "label" | "icon",
    value: string,
  ) => void;
  readonly onRemoveGrandChild: (parentId: number, childId: number, grandChildId: number) => void;
}

function cloneItems(items: MenuEditorItem[]): MenuEditorItem[] {
  return items.map((item) => ({
    ...item,
    children: item.children.map((child) => ({
      ...child,
      children: child.children.map((grandChild) => ({ ...grandChild })),
    })),
  }));
}

function updateRootItem(
  items: MenuEditorItem[],
  id: number,
  field: "label" | "icon",
  value: string,
) {
  const nextItems = cloneItems(items);
  const item = nextItems.find((entry) => entry.id === id);

  if (!item) {
    return items;
  }

  item[field] = value;
  return nextItems;
}

function updateChildItem(
  items: MenuEditorItem[],
  parentId: number,
  childId: number,
  field: "label" | "icon",
  value: string,
) {
  const nextItems = cloneItems(items);
  const parent = nextItems.find((entry) => entry.id === parentId);
  const child = parent?.children.find((entry) => entry.id === childId);

  if (!child) {
    return items;
  }

  child[field] = value;
  return nextItems;
}

function updateGrandChildItem(
  items: MenuEditorItem[],
  parentId: number,
  childId: number,
  grandChildId: number,
  field: "label" | "icon",
  value: string,
) {
  const nextItems = cloneItems(items);
  const parent = nextItems.find((entry) => entry.id === parentId);
  const child = parent?.children.find((entry) => entry.id === childId);
  const grandChild = child?.children.find((entry) => entry.id === grandChildId);

  if (!grandChild) {
    return items;
  }

  grandChild[field] = value;
  return nextItems;
}

function MenuEditorChildRow({
  itemId,
  child,
  onUpdateChild,
  onAddGrandChild,
  onRemoveChild,
  onUpdateGrandChild,
  onRemoveGrandChild,
}: Readonly<MenuEditorChildProps>) {
  return (
    <div className="menu-editor-child-group">
      <div className="menu-editor-row menu-editor-child">
        <span className="menu-editor-child-arrow">↳</span>
        <select
          className="pg-select menu-editor-icon-select"
          value={child.icon}
          onChange={(e) => onUpdateChild(itemId, child.id, "icon", e.target.value)}
          title="Ícone"
        >
          {ICON_OPTIONS.map((iconOption) => (
            <option key={iconOption} value={iconOption}>
              {iconOption.replace("pi pi-", "")}
            </option>
          ))}
        </select>
        <input
          className="pg-input menu-editor-label-input"
          value={child.label}
          onChange={(e) => onUpdateChild(itemId, child.id, "label", e.target.value)}
          placeholder="Label"
        />
        <button
          type="button"
          className="menu-editor-btn menu-editor-btn--add"
          title="Adicionar sub-sub-item"
          onClick={() => onAddGrandChild(itemId, child.id)}
        >
          <i className="pi pi-plus" />
        </button>
        <button
          type="button"
          className="menu-editor-btn menu-editor-btn--remove"
          title="Remover sub-item"
          onClick={() => onRemoveChild(itemId, child.id)}
        >
          <i className="pi pi-trash" />
        </button>
      </div>

      {child.children.map((grandChild) => (
        <div key={grandChild.id} className="menu-editor-row menu-editor-grandchild">
          <span className="menu-editor-child-arrow" style={{ marginLeft: "1.5rem" }}>
            ↳
          </span>
          <select
            className="pg-select menu-editor-icon-select"
            value={grandChild.icon}
            onChange={(e) =>
              onUpdateGrandChild(itemId, child.id, grandChild.id, "icon", e.target.value)
            }
            title="Ícone"
          >
            {ICON_OPTIONS.map((iconOption) => (
              <option key={iconOption} value={iconOption}>
                {iconOption.replace("pi pi-", "")}
              </option>
            ))}
          </select>
          <input
            className="pg-input menu-editor-label-input"
            value={grandChild.label}
            onChange={(e) =>
              onUpdateGrandChild(itemId, child.id, grandChild.id, "label", e.target.value)
            }
            placeholder="Label"
          />
          <button
            type="button"
            className="menu-editor-btn menu-editor-btn--remove"
            title="Remover sub-sub-item"
            onClick={() => onRemoveGrandChild(itemId, child.id, grandChild.id)}
          >
            <i className="pi pi-trash" />
          </button>
        </div>
      ))}
    </div>
  );
}

function MenuEditor({ items, onChange }: MenuEditorProps) {
  const addItem = () =>
    onChange([
      ...items,
      {
        id: nextId++,
        label: "Novo Item",
        icon: "pi pi-circle",
        children: [],
      },
    ]);

  const removeItem = (id: number) => onChange(items.filter((i) => i.id !== id));

  const updateItem = (id: number, field: "label" | "icon", value: string) =>
    onChange(updateRootItem(items, id, field, value));

  const addChild = (parentId: number) =>
    onChange(
      items.map((i) =>
        i.id === parentId
          ? {
              ...i,
              children: [
                ...i.children,
                {
                  id: nextId++,
                  label: "Sub-item",
                  icon: "pi pi-circle",
                  children: [],
                },
              ],
            }
          : i,
      ),
    );

  const removeChild = (parentId: number, childId: number) => {
    const nextItems = cloneItems(items);
    const parent = nextItems.find((entry) => entry.id === parentId);

    if (!parent) {
      return;
    }

    parent.children = parent.children.filter((child) => child.id !== childId);
    onChange(nextItems);
  };

  const updateChild = (parentId: number, childId: number, field: "label" | "icon", value: string) =>
    onChange(updateChildItem(items, parentId, childId, field, value));

  const addGrandChild = (parentId: number, childId: number) => {
    const nextItems = cloneItems(items);
    const parent = nextItems.find((entry) => entry.id === parentId);
    const child = parent?.children.find((entry) => entry.id === childId);

    if (!child) {
      return;
    }

    child.children.push({
      id: nextId++,
      label: "Sub-sub-item",
      icon: "pi pi-circle",
    });
    onChange(nextItems);
  };

  const removeGrandChild = (parentId: number, childId: number, gcId: number) => {
    const nextItems = cloneItems(items);
    const parent = nextItems.find((entry) => entry.id === parentId);
    const child = parent?.children.find((entry) => entry.id === childId);

    if (!child) {
      return;
    }

    child.children = child.children.filter((grandChild) => grandChild.id !== gcId);
    onChange(nextItems);
  };

  const updateGrandChild = (
    parentId: number,
    childId: number,
    gcId: number,
    field: "label" | "icon",
    value: string,
  ) => onChange(updateGrandChildItem(items, parentId, childId, gcId, field, value));

  return (
    <div className="menu-editor">
      {items.map((item, idx) => (
        <div key={item.id} className="menu-editor-item">
          <div className="menu-editor-row">
            <span className="menu-editor-index">{idx + 1}</span>
            <select
              className="pg-select menu-editor-icon-select"
              value={item.icon}
              onChange={(e) => updateItem(item.id, "icon", e.target.value)}
              title="Ícone"
            >
              {ICON_OPTIONS.map((ic) => (
                <option key={ic} value={ic}>
                  {ic.replace("pi pi-", "")}
                </option>
              ))}
            </select>
            <input
              className="pg-input menu-editor-label-input"
              value={item.label}
              onChange={(e) => updateItem(item.id, "label", e.target.value)}
              placeholder="Label"
            />
            <button
              type="button"
              className="menu-editor-btn menu-editor-btn--add"
              title="Adicionar sub-item"
              onClick={() => addChild(item.id)}
            >
              <i className="pi pi-plus" />
            </button>
            <button
              type="button"
              className="menu-editor-btn menu-editor-btn--remove"
              title="Remover item"
              onClick={() => removeItem(item.id)}
            >
              <i className="pi pi-trash" />
            </button>
          </div>

          {item.children.map((child) => (
            <MenuEditorChildRow
              key={child.id}
              itemId={item.id}
              child={child}
              onUpdateChild={updateChild}
              onAddGrandChild={addGrandChild}
              onRemoveChild={removeChild}
              onUpdateGrandChild={updateGrandChild}
              onRemoveGrandChild={removeGrandChild}
            />
          ))}
        </div>
      ))}

      <button type="button" className="menu-editor-btn menu-editor-btn--add-root" onClick={addItem}>
        <i className="pi pi-plus" /> Adicionar item de menu
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

const defaultEditorMenu: MenuEditorItem[] = defaultMenu.map((item, i) => ({
  id: i + 1,
  label: item.label ?? "",
  icon: item.icon ?? "pi pi-circle",
  children:
    item.items?.map((c, j) => ({
      id: (i + 1) * 10 + j,
      label: c.label ?? "",
      icon: c.icon ?? "pi pi-circle",
      children: [],
    })) ?? [],
}));

function LayoutPlayground() {
  const [nomeSistema, setNomeSistema] = useState("SGI");
  const [ambienteSistema, setAmbienteSistema] = useState("HOMOLOGAÇÃO");
  const [footerText, setFooterText] = useState("SEPLAG - STI - Coordenadoria de Sistemas");
  const [vinculo, setVinculo] = useState<IVinculoSeplag>(exampleVinculos[0]);
  const [editorItems, setEditorItems] = useState<MenuEditorItem[]>(defaultEditorMenu);

  const menuItems = toIMenu(editorItems);

  const handleSelecionarVinculo = (novoVinculo: IVinculoSeplag) => {
    setVinculo(novoVinculo);
  };

  const generatedCode = `import { LayoutSeplag } from "@seplag/ui-lib-react-18";

<Route
  element={
    <LayoutSeplag
      nomeSistema="${nomeSistema}"
      ambienteSistema="${ambienteSistema}"
      sistemas={sistemas}
      logoSrc={logoSrc}
      logoHref="/login"
      menuItems={menuItems}
      footerText="${footerText}"
      nomeApresentacao={user.nome}
      numrVinculoAtual={vinculo.numrVinculo}
      vinculos={user.vinculos}
      onLogout={handleLogout}
      onAlterarSenha={handleAlterarSenha}
      onSelecionarVinculo={handleSelecionarVinculo}
    />
  }
>
  <Route path="dashboard" element={<Dashboard />} />
</Route>`;

  return (
    <div className="botao-playground">
      <div className="botao-playground-preview" style={{ padding: 0, display: "block" }}>
        <div
          className="layout-playground-preview"
          style={{
            height: 560,
            overflow: "hidden",
            borderRadius: "inherit",
            position: "relative",
            transform: "translateZ(0)",
          }}
        >
          <LayoutSeplag
            nomeSistema={nomeSistema}
            ambienteSistema={ambienteSistema}
            sistemas={exampleSistemas}
            logoSrc={logoPlaceholder}
            logoHref="#"
            menuItems={menuItems}
            footerText={footerText}
            nomeApresentacao="João da Silva"
            numrVinculoAtual={vinculo.numrVinculo}
            vinculos={exampleVinculos}
            onLogout={() => {}}
            onAlterarSenha={() => {}}
            onSelecionarVinculo={handleSelecionarVinculo}
          >
            <div className="layout-playground-content">
              <i className="pi pi-th-large" style={{ fontSize: "3rem", color: "#ced4da" }} />
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    color: "#495057",
                  }}
                >
                  Área de Conteúdo
                </p>
                <p
                  style={{
                    margin: "0.25rem 0 0",
                    fontSize: "0.85rem",
                    color: "#6c757d",
                  }}
                >
                  Aqui será renderizado o{" "}
                  <code style={{ fontSize: "0.8rem" }}>&lt;Outlet /&gt;</code> com as páginas do
                  sistema.
                </p>
              </div>
            </div>
          </LayoutSeplag>
        </div>
      </div>

      <div className="botao-playground-controls">
        <div className="pg-field">
          <label htmlFor="pg-layout-nome" className="pg-label">
            nomeSistema
          </label>
          <input
            id="pg-layout-nome"
            className="pg-input"
            type="text"
            value={nomeSistema}
            onChange={(e) => setNomeSistema(e.target.value)}
            placeholder="Ex: SGI"
          />
        </div>

        <div className="pg-field">
          <label htmlFor="pg-layout-ambiente" className="pg-label">
            ambienteSistema
          </label>
          <select
            id="pg-layout-ambiente"
            className="pg-select"
            value={ambienteSistema}
            onChange={(e) => setAmbienteSistema(e.target.value)}
          >
            <option>PRODUÇÃO</option>
            <option>HOMOLOGAÇÃO</option>
            <option>DESENVOLVIMENTO</option>
          </select>
        </div>

        <div className="pg-field">
          <label htmlFor="pg-layout-footer" className="pg-label">
            footerText
          </label>
          <input
            id="pg-layout-footer"
            className="pg-input"
            type="text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            placeholder="Texto do rodapé"
          />
        </div>

        <div className="pg-field" style={{ alignItems: "flex-start" }}>
          <span className="pg-label" style={{ paddingTop: "0.5rem" }}>
            menuItems
          </span>
          <div style={{ flex: 1 }}>
            <MenuEditor items={editorItems} onChange={setEditorItems} />
          </div>
        </div>
      </div>

      <PlaygroundCode code={generatedCode} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Seções e props
// ---------------------------------------------------------------------------

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Preview do layout completo. Clique no hambúrguer para abrir/fechar a sidebar. Edite os itens do menu, escolha o modo e veja o resultado em tempo real.",
    example: <LayoutPlayground />,
    code: "",
  },
  {
    title: "Integração com React Router",
    description:
      "O Layout usa <Outlet /> internamente. Configure-o como element de uma rota pai e declare as rotas filhas normalmente.",
    example: <></>,
    code: `import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LayoutSeplag } from "@seplag/ui-lib-react-18";

const router = createBrowserRouter([
  {
    path: "/app",
    element: (
      <LayoutSeplag
        nomeSistema="SGI"
        ambienteSistema="PRODUÇÃO"
        menuMode="static"
        sistemas={sistemas}
        logoSrc={logoSrc}
        logoHref="/login"
        menuItems={menuItems}
        footerText="SEPLAG - STI"
        nomeApresentacao={user.nome}
        numrVinculoAtual={vinculo.numrVinculo}
        vinculos={user.vinculos}
        onLogout={handleLogout}
        onAlterarSenha={handleAlterarSenha}
        onSelecionarVinculo={handleSelecionarVinculo}
      />
    ),
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "pessoas",   element: <Pessoas />   },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}`,
  },
  {
    title: "Montando o menu com permissões",
    description:
      "Use hasPermissionByRouteListSeplag para filtrar os itens com base nas permissões do usuário antes de passar para o Layout.",
    example: <></>,
    code: `import { hasPermissionByRouteListSeplag, type IMenuSeplag } from "@seplag/ui-lib-react-18";

const menuBase: IMenuSeplag[] = [
  { label: "Início", icon: "pi pi-home", to: "/app/inicio" },
  {
    label: "Cadastro",
    icon: "pi pi-file-edit",
    items: [
      {
        label: "Pessoas",
        icon: "pi pi-users",
        to: "/app/pessoas",
        permissionKeys: ["PESSOAS_LISTAR"],
      },
    ],
  },
];

const menuFiltrado = hasPermissionByRouteListSeplag(menuBase);

<LayoutSeplag menuItems={menuFiltrado} menuMode="static" ... />`,
  },
];

const props: DocProp[] = [
  {
    name: "nomeSistema",
    type: "string",
    required: true,
    description: "Nome do sistema exibido na topbar.",
  },
  {
    name: "ambienteSistema",
    type: "string",
    required: true,
    description: 'Ambiente exibido na topbar, ex: "PRODUÇÃO".',
  },
  {
    name: "menuMode",
    type: '"static" | "overlay"',
    defaultValue: '"static"',
    required: false,
    description:
      '"static": sidebar empurra/recolhe o conteúdo com o hambúrguer. "overlay": sidebar flutua sobre o conteúdo, fechar ao clicar fora.',
  },
  {
    name: "sistemas",
    type: "AppSystemItemSeplag[]",
    required: true,
    description: "Lista de sistemas para o AppSwitcher na topbar.",
  },
  {
    name: "logoSrc",
    type: "string",
    required: true,
    description: "URL ou import da imagem do logo exibida no topo da sidebar.",
  },
  {
    name: "logoHref",
    type: "string",
    defaultValue: '"#"',
    required: false,
    description: "Destino do link ao clicar no logo.",
  },
  {
    name: "menuItems",
    type: "IMenuSeplag[]",
    required: true,
    description:
      "Itens do menu lateral. Use hasPermissionByRouteListSeplag para filtrar por permissão.",
  },
  {
    name: "footerText",
    type: "string",
    required: false,
    description: "Texto simples exibido no rodapé.",
  },
  {
    name: "footerChildren",
    type: "ReactNode",
    required: false,
    description: "Conteúdo customizado para o rodapé (substitui footerText).",
  },
  {
    name: "children",
    type: "ReactNode",
    required: false,
    description: "Conteúdo da área principal. Quando omitido usa <Outlet /> do react-router-dom.",
  },
  {
    name: "nomeApresentacao",
    type: "string",
    required: true,
    description: "Nome do usuário exibido no perfil da sidebar.",
  },
  {
    name: "numrVinculoAtual",
    type: "string | number",
    required: true,
    description: "Número do vínculo ativo exibido no perfil.",
  },
  {
    name: "vinculos",
    type: "IVinculo[]",
    required: true,
    description: "Lista de vínculos disponíveis para troca no perfil.",
  },
  {
    name: "avatarSrc",
    type: "string",
    required: false,
    description: "URL da foto de perfil. Usa avatar padrão se omitido.",
  },
  {
    name: "onLogout",
    type: "() => void",
    required: true,
    description: "Callback chamado ao clicar em Sair.",
  },
  {
    name: "onAlterarSenha",
    type: "(senhaAtual, senhaNova, confirmarSenha) => void",
    required: true,
    description: "Callback chamado ao confirmar a troca de senha.",
  },
  {
    name: "onSelecionarVinculo",
    type: "(vinculo: IVinculo) => void",
    required: true,
    description: "Callback chamado ao trocar o vínculo ativo.",
  },
];

export default function LayoutDoc() {
  return (
    <DocPage
      title="Layout"
      description="Shell completo da aplicação SEPLAG — topbar, sidebar com menu e perfil, área de conteúdo via <Outlet /> e rodapé configurável. Integra todos os componentes de navegação em um único componente prop-driven."
      badge="Estável"
      since="v0.0.1"
      sections={sections}
      props={props}
    />
  );
}
