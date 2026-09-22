import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { AppMenuSeplag } from "@componentes/layout/AppMenu/AppMenu";
import type { IMenuSeplag } from "@componentes/layout/Config/menu";
import "@componentes/layout/layout/Layout.css";
import "primereact/resources/themes/saga-blue/theme.css";

// ---------------------------------------------------------------------------
// Dados de exemplo
// ---------------------------------------------------------------------------

const exampleMenu: IMenuSeplag[] = [
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
    description: "Clique nos itens com seta para expandir os submenus.",
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
        <AppMenuSeplag items={exampleMenu} onMenuItemClick={(e) => console.log(e)} />
      </div>
    ),
    code: `import { AppMenuSeplag } from "@seplag/ui-lib-react-18";
import type { IMenuSeplag } from "@seplag/ui-lib-react-18";

const menu: IMenuSeplag[] = [
  {
    label: "Início",
    icon: "pi pi-home",
    to: "/",
    visibleOnMenu: true,
    visibleOnRouter: true,
  },
  {
    label: "Cadastro",
    icon: "pi pi-file-edit",
    visibleOnMenu: true,
    visibleOnRouter: true,
    items: [
      { label: "Pessoas", icon: "pi pi-users", to: "/pessoas", visibleOnMenu: true, visibleOnRouter: true },
    ],
  },
];

<AppMenuSeplag
  items={menu}
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
    type: "IMenuSeplag[]",
    required: true,
    description:
      "Lista de itens do menu. Itens sem rotas filhas visíveis são filtrados automaticamente.",
  },
  {
    name: "onMenuItemClick",
    type: "(event: any) => void",
    required: true,
    description: "Callback disparado ao clicar em um item do menu.",
  },
];

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function AppMenuDoc() {
  return (
    <DocPage
      title="AppMenu"
      description="Menu lateral da aplicação. Recebe um array de IMenuSeplag e renderiza os itens filtrados pelo campo visibleOnRouter via AppSubmenuSeplag."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import { AppMenuSeplag } from "@seplag/ui-lib-react-18";\nimport type { IMenuSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
