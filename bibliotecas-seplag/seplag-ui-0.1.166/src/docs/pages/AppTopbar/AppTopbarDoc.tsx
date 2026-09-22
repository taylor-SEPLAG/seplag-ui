import { useState } from "react";
import { DocPage, PlaygroundCode, type DocSection, type DocProp } from "../../components/DocPage";
import { AppTopbarSeplag } from "@componentes/layout/AppTopbar";
import type { AppSystemItemSeplag } from "@componentes/layout/AppSwitcher";
import "primereact/resources/themes/saga-blue/theme.css";

// ---------------------------------------------------------------------------
// Dados de exemplo
// ---------------------------------------------------------------------------

const exampleSystems: AppSystemItemSeplag[] = [
  { id: "sgi", label: "SGI", url: "#", icon: "pi pi-briefcase" },
  { id: "siagro", label: "SIAGRO", url: "#", icon: "pi pi-chart-bar" },
  { id: "portal", label: "Portal", url: "#", icon: "pi pi-globe" },
];

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

function AppTopbarPlayground() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [nomeSistema, setNomeSistema] = useState("SGI");
  const [ambienteSistema, setAmbienteSistema] = useState("HOMOLOGAÇÃO");

  const generatedCode = `import { AppTopbarSeplag } from "@seplag/ui-lib-react-18";

const sistemas = [
  { id: "sgi",    label: "SGI",    url: "/sgi",    icon: "pi pi-briefcase" },
  { id: "siagro", label: "SIAGRO", url: "/siagro", icon: "pi pi-chart-bar" },
];

<AppTopbarSeplag
  nomeSistema="${nomeSistema}"
  ambienteSistema="${ambienteSistema}"
  isSidebarVisible={isSidebarVisible}
  systemas={sistemas}
  onToggleMenu={() => setIsSidebarVisible(v => !v)}
/>`;

  return (
    <div className="botao-playground">
      {/* Preview */}
      <div
        className="botao-playground-preview"
        style={{ padding: 0, overflow: "hidden", borderRadius: 8 }}
      >
        <AppTopbarSeplag
          nomeSistema={nomeSistema}
          ambienteSistema={ambienteSistema}
          isSidebarVisible={sidebarVisible}
          systemas={exampleSystems}
          onToggleMenu={() => setSidebarVisible((v) => !v)}
        />
        {sidebarVisible && (
          <div
            style={{
              background: "#f4f6f8",
              padding: "1rem 1.5rem",
              fontSize: "0.875rem",
              color: "#555",
              borderTop: "1px solid #ddd",
            }}
          >
            ← Sidebar visível (simulação)
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="botao-playground-controls">
        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-nome">
            nomeSistema
          </label>
          <input
            id="pg-nome"
            className="pg-input"
            type="text"
            value={nomeSistema}
            onChange={(e) => setNomeSistema(e.target.value)}
            placeholder="Ex: SGI"
          />
        </div>

        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-ambiente">
            ambienteSistema
          </label>
          <select
            id="pg-ambiente"
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
          <span className="pg-label">isSidebarVisible</span>
          <div className="pg-radio-group">
            {[true, false].map((v) => (
              <label
                key={String(v)}
                className={`pg-radio-btn${sidebarVisible === v ? " selected" : ""}`}
              >
                <input
                  type="radio"
                  name="pg-sidebar"
                  checked={sidebarVisible === v}
                  onChange={() => setSidebarVisible(v)}
                />
                {String(v)}
              </label>
            ))}
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
      "Experimente o AppTopbar. Clique no botão hambúrguer dentro do preview para alternar o estado da sidebar.",
    example: <AppTopbarPlayground />,
    code: "",
  },
  {
    title: "Uso básico",
    description: "Exemplo completo com gerenciamento de estado da sidebar.",
    example: (
      <div style={{ borderRadius: 8, overflow: "hidden" }}>
        <AppTopbarSeplag
          nomeSistema="SGI"
          ambienteSistema="PRODUÇÃO"
          isSidebarVisible={false}
          systemas={exampleSystems}
          onToggleMenu={() => {}}
        />
      </div>
    ),
    code: `import { AppTopbarSeplag } from "@seplag/ui-lib-react-18";
import { useState } from "react";

const sistemas = [
  { id: "sgi",    label: "SGI",    url: "/sgi",    icon: "pi pi-briefcase" },
  { id: "siagro", label: "SIAGRO", url: "/siagro", icon: "pi pi-chart-bar" },
];

function Layout() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <>
      <AppTopbarSeplag
        nomeSistema="SGI"
        ambienteSistema="PRODUÇÃO"
        isSidebarVisible={sidebarVisible}
        systemas={sistemas}
        onToggleMenu={() => setSidebarVisible(v => !v)}
      />
      {/* resto do layout */}
    </>
  );
}`,
  },
];

const props: DocProp[] = [
  {
    name: "nomeSistema",
    type: "string",
    required: true,
    description:
      "Nome do sistema exibido na topbar. Também é usado para destacar o sistema ativo no AppSwitcher.",
  },
  {
    name: "ambienteSistema",
    type: "string",
    required: true,
    description: 'Ambiente do sistema (ex: "PRODUÇÃO", "HOMOLOGAÇÃO"). Exibido ao lado do nome.',
  },
  {
    name: "systemas",
    type: "AppSystemItemSeplag[]",
    required: true,
    description: "Lista de sistemas disponíveis para o AppSwitcher.",
  },
  {
    name: "isSidebarVisible",
    type: "boolean",
    required: true,
    description: "Controla o estado visual do botão hambúrguer (aberto/fechado).",
  },
  {
    name: "onToggleMenu",
    type: "(event: any) => void",
    required: true,
    description: "Callback disparado ao clicar no botão hambúrguer para alternar a sidebar.",
  },
];

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function AppTopbarDoc() {
  return (
    <DocPage
      title="AppTopbar"
      badge="Estável"
      since="v0.0.1"
      description="Barra superior de navegação padrão do ecossistema SEPLAG. Exibe o nome e ambiente do sistema, o botão hambúrguer para controle da sidebar e o AppSwitcher para troca de sistemas."
      importStatement={`import { AppTopbarSeplag } from "@seplag/ui-lib-react-18";\nimport type { AppTopbarSeplagProps } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
