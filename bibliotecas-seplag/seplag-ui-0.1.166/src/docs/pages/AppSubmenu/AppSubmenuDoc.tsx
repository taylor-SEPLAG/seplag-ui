import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { AppSubmenuSeplag } from "@componentes/layout/AppSubmenu/AppSubmenu";
import type { IMenuSeplag } from "@componentes/layout/Config/menu";
import "@componentes/layout/layout/Layout.css";
import "primereact/resources/themes/saga-blue/theme.css";

// ---------------------------------------------------------------------------
// Dados de exemplo
// ---------------------------------------------------------------------------

const exampleItems: IMenuSeplag[] = [
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
        to: "#pessoas",
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
      {
        label: "Empresas",
        icon: "pi pi-building",
        to: "#empresas",
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
    ],
  },
  {
    label: "Relatórios",
    icon: "pi pi-chart-bar",
    visibleOnMenu: true,
    visibleOnRouter: true,
    items: [
      {
        label: "Mensal",
        icon: "pi pi-circle-on",
        to: "#mensal",
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Seções
// ---------------------------------------------------------------------------

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "O AppSubmenuSeplag renderiza recursivamente os itens do menu. Itens com `visibleOnMenu: false` são ocultados. Clique nos itens com seta para expandir submenus.",
    example: (
      <div
        className="layout-sidebar layout-sidebar-dark"
        style={{
          position: "relative",
          width: 250,
          minHeight: 300,
          borderRadius: 8,
        }}
      >
        <AppSubmenuSeplag
          items={exampleItems}
          className="layout-menu"
          root={true}
          onMenuItemClick={(e) => console.log(e)}
        />
      </div>
    ),
    code: `import { AppSubmenuSeplag } from "@seplag/ui-lib-react-18";
import type { IMenuSeplag } from "@seplag/ui-lib-react-18";

// Geralmente usado via AppMenuSeplag, mas pode ser usado diretamente:

const items: IMenuSeplag[] = [
  {
    label: "Início",
    icon: "pi pi-home",
    to: "/",
    visibleOnMenu: true,
    visibleOnRouter: true,
  },
];

<AppSubmenuSeplag
  items={items}
  className="layout-menu"
  root={true}
  onMenuItemClick={(e) => console.log(e)}
/>`,
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

const props: DocProp[] = [
  {
    name: "items",
    type: "IMenuSeplag[] | null | undefined",
    required: true,
    description: "Lista de itens do submenu a renderizar.",
  },
  {
    name: "onMenuItemClick",
    type: "(event: { originalEvent: any; item: IMenuSeplag[] }) => void",
    required: true,
    description: "Callback disparado ao clicar em um item.",
  },
  {
    name: "root",
    type: "boolean",
    defaultValue: "false",
    description: "Indica se é o nível raiz do menu (altera estilos de abertura).",
  },
  {
    name: "className",
    type: "string",
    description: "Classe CSS aplicada ao `<ul>` gerado.",
  },
];

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function AppSubmenuDoc() {
  return (
    <DocPage
      title="AppSubmenu"
      description="Renderiza recursivamente os itens de menu, filtrando por visibleOnMenu e detectando a rota ativa automaticamente. Usado internamente pelo AppMenuSeplag."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import { AppSubmenuSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
