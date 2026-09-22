import { useState } from "react";
import { DocPage, PlaygroundCode, type DocSection, type DocProp } from "../../components/DocPage";
import { AppSwitcherSeplag, type AppSystemItemSeplag } from "@componentes/layout/AppSwitcher";
import "primereact/resources/themes/saga-blue/theme.css";

// ---------------------------------------------------------------------------
// Dados de exemplo
// ---------------------------------------------------------------------------

const exampleItems: AppSystemItemSeplag[] = [
  {
    id: "sgi",
    label: "SGI",
    url: "#",
    icon: "pi pi-briefcase",
  },
  {
    id: "siagro",
    label: "SIAGRO",
    url: "#",
    icon: "pi pi-chart-bar",
  },
  {
    id: "seplag",
    label: "SEPLAG",
    url: "#",
    icon: "pi pi-building",
  },
];

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

function AppSwitcherPlayground() {
  const [currentSystem, setCurrentSystem] = useState("SGI");
  const [numItems, setNumItems] = useState(3);

  const items = exampleItems.slice(0, numItems);

  const itemsCode = items
    .map(
      (it) =>
        `  { id: "${it.id}", label: "${it.label}", url: "/app/${it.id}", icon: "${it.icon}" }`,
    )
    .join(",\n");

  const generatedCode = `import { AppSwitcherSeplag } from "@seplag/ui-lib-react-18";

const items = [
${itemsCode}
];

<AppSwitcherSeplag
  items={items}
  currentSystem="${currentSystem}"
/>`;

  return (
    <div className="botao-playground">
      {/* Preview */}
      <div
        className="botao-playground-preview"
        style={{
          background: "#005494",
          padding: "1rem 1.5rem",
          borderRadius: 8,
        }}
      >
        <AppSwitcherSeplag items={items} currentSystem={currentSystem} />
      </div>

      {/* Controles */}
      <div className="botao-playground-controls">
        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-current">
            currentSystem
          </label>
          <select
            id="pg-current"
            className="pg-select"
            value={currentSystem}
            onChange={(e) => setCurrentSystem(e.target.value)}
          >
            {exampleItems.map((it) => (
              <option key={it.id} value={it.label}>
                {it.label}
              </option>
            ))}
          </select>
        </div>

        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-numItems">
            número de sistemas
          </label>
          <select
            id="pg-numItems"
            className="pg-select"
            value={numItems}
            onChange={(e) => setNumItems(Number(e.target.value))}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
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
      "Experimente o AppSwitcher interativamente. O sistema selecionado como ativo fica destacado no painel.",
    example: <AppSwitcherPlayground />,
    code: "",
  },
  {
    title: "Com ícones customizados (ReactNode)",
    description:
      "O campo icon aceita tanto uma string de classe CSS (ex: PrimeIcons) quanto um ReactNode como componente.",
    example: (
      <div
        style={{
          background: "#005494",
          padding: "1rem 1.5rem",
          borderRadius: 8,
          display: "inline-flex",
        }}
      >
        <AppSwitcherSeplag
          currentSystem="SGI"
          items={[
            {
              id: "s1",
              label: "SGI",
              url: "#",
              icon: "pi pi-star",
            },
            {
              id: "s2",
              label: "Portal",
              url: "#",
              icon: "pi pi-globe",
            },
          ]}
        />
      </div>
    ),
    code: `import { AppSwitcherSeplag } from "@seplag/ui-lib-react-18";

<AppSwitcherSeplag
  currentSystem="SGI"
  items={[
    { id: "s1", label: "SGI",    url: "/sgi",    icon: "pi pi-star"  },
    { id: "s2", label: "Portal", url: "/portal", icon: "pi pi-globe" },
  ]}
/>`,
  },
  {
    title: "Abrindo em nova aba",
    description:
      'Defina target: "_blank" para abrir o sistema em uma nova aba com segurança (noopener, noreferrer).',
    example: (
      <div
        style={{
          background: "#005494",
          padding: "1rem 1.5rem",
          borderRadius: 8,
          display: "inline-flex",
        }}
      >
        <AppSwitcherSeplag
          items={[
            {
              id: "ext",
              label: "Externo",
              url: "#",
              target: "_blank",
              icon: "pi pi-external-link",
            },
          ]}
        />
      </div>
    ),
    code: `<AppSwitcherSeplag
  items={[
    {
      id: "ext",
      label: "Sistema Externo",
      url: "https://www.mt.gov.br",
      target: "_blank",
      icon: "pi pi-external-link",
    },
  ]}
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "items",
    type: "AppSystemItemSeplag[]",
    required: true,
    description: "Lista de sistemas disponíveis para navegação.",
  },
  {
    name: "currentSystem",
    type: "string",
    description: "Label do sistema atual. O item correspondente fica destacado no painel.",
  },
  {
    name: "className",
    type: "string",
    description: "Classe CSS adicional aplicada ao wrapper externo.",
  },
];

const itemProps: DocProp[] = [
  {
    name: "id",
    type: "string",
    required: true,
    description: "Identificador único do sistema.",
  },
  {
    name: "label",
    type: "string",
    required: true,
    description: "Nome exibido abaixo do ícone no painel.",
  },
  {
    name: "url",
    type: "string",
    required: true,
    description: "URL de destino ao clicar no sistema.",
  },
  {
    name: "target",
    type: '"_self" | "_blank"',
    defaultValue: '"_self"',
    description: "Define se a navegação ocorre na mesma aba ou em uma nova.",
  },
  {
    name: "icon",
    type: "string | ReactNode",
    description:
      "Ícone do sistema. String = classe CSS (ex: PrimeIcons). ReactNode = componente React.",
  },
];

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

const itemPropsSection: DocSection = {
  title: "Interface: AppSystemItemSeplag",
  description: "Estrutura de cada item da lista de sistemas passada para a prop items.",
  example: (
    <table className="doc-props-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Tipo</th>
          <th>Obrigatório</th>
          <th>Padrão</th>
          <th>Descrição</th>
        </tr>
      </thead>
      <tbody>
        {itemProps.map((p) => (
          <tr key={p.name}>
            <td>
              <code>{p.name}</code>
            </td>
            <td>
              <code>{p.type}</code>
            </td>
            <td>{p.required ? "✓" : "—"}</td>
            <td>{p.defaultValue ? <code>{p.defaultValue}</code> : "—"}</td>
            <td>{p.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
  code: "",
};

export default function AppSwitcherDoc() {
  return (
    <DocPage
      title="AppSwitcher"
      badge="Estável"
      since="v0.0.1"
      description="Botão de alternância entre sistemas do ecossistema SEPLAG. Exibe um painel com os sistemas cadastrados ao clicar no ícone de grid."
      importStatement={`import { AppSwitcherSeplag } from "@seplag/ui-lib-react-18";\nimport type { AppSystemItemSeplag } from "@seplag/ui-lib-react-18";`}
      sections={[...sections, itemPropsSection]}
      props={props}
    />
  );
}
