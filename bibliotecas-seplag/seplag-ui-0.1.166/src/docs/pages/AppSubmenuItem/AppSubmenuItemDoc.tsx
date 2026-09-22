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
    label: "Item simples",
    icon: "pi pi-home",
    to: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
  },
  {
    label: "Item com submenu",
    icon: "pi pi-chart-bar",
    visibleOnMenu: true,
    visibleOnRouter: true,
    items: [
      {
        label: "Sub-item 1",
        icon: "pi pi-circle-on",
        to: "#sub1",
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
      {
        label: "Sub-item 2",
        icon: "pi pi-circle-on",
        to: "#sub2",
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
      "O AppSubmenuItemSeplag é o componente interno que renderiza cada item do menu. Clique em 'Item com submenu' para ver a animação de abertura.",
    example: (
      <div
        className="layout-sidebar layout-sidebar-dark"
        style={{
          position: "relative",
          width: 250,
          minHeight: 200,
          borderRadius: 8,
        }}
      >
        <AppMenuSeplag items={exampleMenu} onMenuItemClick={(e) => console.log(e)} />
      </div>
    ),
    code: `// Componente de uso interno — normalmente não é instanciado diretamente.
// Para renderizar o menu, use AppMenuSeplag.

import { AppMenuSeplag } from "@seplag/ui-lib-react-18";
import type { IMenuSeplag } from "@seplag/ui-lib-react-18";

const menu: IMenuSeplag[] = [
  {
    label: "Relatórios",
    icon: "pi pi-chart-bar",
    visibleOnMenu: true,
    visibleOnRouter: true,
    items: [
      {
        label: "Mensal",
        icon: "pi pi-circle-on",
        to: "/relatorios/mensal",
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
    ],
  },
];

<AppMenuSeplag items={menu} onMenuItemClick={(e) => console.log(e)} />`,
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

const props: DocProp[] = [
  {
    name: "item",
    type: "IMenuSeplag",
    required: true,
    description: "Dados do item de menu a renderizar.",
  },
  {
    name: "className",
    type: "string",
    required: true,
    description: "Classes CSS aplicadas ao `<li>` (ex: active-menuitem).",
  },
  {
    name: "active",
    type: "boolean",
    defaultValue: "false",
    description: "Indica se o item (ou algum filho) está ativo na rota atual.",
  },
  {
    name: "root",
    type: "boolean",
    defaultValue: "false",
    description: "Indica se o item está no nível raiz do menu.",
  },
  {
    name: "onMenuClick",
    type: "(event: { originalEvent: any; item: IMenuSeplag[] }) => void",
    required: true,
    description: "Callback propagado ao AppSubmenu filho.",
  },
  {
    name: "onMenuItemClick",
    type: "(event: MouseEvent, item: IMenuSeplag) => void",
    required: true,
    description: "Callback disparado ao clicar no link do item.",
  },
];

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function AppSubmenuItemDoc() {
  return (
    <DocPage
      title="AppSubmenuItem"
      description="Item individual do menu lateral. Renderiza ícone, label e submenu colapsável com animação. Componente interno do AppSubmenuSeplag."
      badge="Estável"
      since="v0.0.1"
      importStatement={`// Componente interno — acesse via AppMenuSeplag`}
      sections={sections}
      props={props}
    />
  );
}
