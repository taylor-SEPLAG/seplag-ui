import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import {
  AppSidebarVersionSeplag,
  TipoSistemaVersaoSeplag,
  type SistemaVersaoSeplag,
} from "@componentes/layout/AppSidebarVersion/AppSidebarVersion";
import { useState } from "react";

const sistemasDemo: SistemaVersaoSeplag[] = [
  {
    nome: "Front-end",
    tipo: TipoSistemaVersaoSeplag.FRONTEND,
    versoes: [
      { label: "Versão", valor: "1.0.24" },
      { label: "Build", valor: "651" },
    ],
  },
  {
    nome: "API SIGEP",
    tipo: TipoSistemaVersaoSeplag.BACKEND,
    versoes: [
      { label: "Versão", valor: "3.2.1" },
      { label: "Commit", valor: "a1b2c3d" },
    ],
  },
];

function AppSidebarVersionPlayground() {
  const [collapsed, setCollapsed] = useState(false);
  const [aberturas, setAberturas] = useState(0);

  return (
    <div>
      <div style={{ marginBottom: "0.75rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <input type="checkbox" checked={collapsed} onChange={(e) => setCollapsed(e.target.checked)} />
          collapsed (menu recolhido)
        </label>
        <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Aberturas do modal: {aberturas}</span>
      </div>

      <div style={{ background: "#1e293b", padding: "0.5rem", borderRadius: 6, maxWidth: 260 }}>
        <AppSidebarVersionSeplag
          sistemas={sistemasDemo}
          collapsed={collapsed}
          onOpen={() => setAberturas((n) => n + 1)}
        />
      </div>
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Clique no botão \"Versões\" para abrir o modal com as versões de cada sistema. Alterne collapsed para ver o botão sem rótulo (usado quando o menu lateral está recolhido). O contador de aberturas usa onOpen.",
    example: <AppSidebarVersionPlayground />,
    code: `import { useState } from "react";
import { AppSidebarVersionSeplag, TipoSistemaVersaoSeplag } from "@seplag/ui-lib-react-18";

const sistemas = [
  {
    nome: "Front-end",
    tipo: TipoSistemaVersaoSeplag.FRONTEND,
    versoes: [
      { label: "Versão", valor: "1.0.24" },
      { label: "Build", valor: "651" },
    ],
  },
  {
    nome: "API SIGEP",
    tipo: TipoSistemaVersaoSeplag.BACKEND,
    versoes: [
      { label: "Versão", valor: "3.2.1" },
      { label: "Commit", valor: "a1b2c3d" },
    ],
  },
];

const [collapsed, setCollapsed] = useState(false);

<AppSidebarVersionSeplag
  sistemas={sistemas}
  collapsed={collapsed}
  onOpen={() => console.log("modal de versões aberto")}
/>`,
  },
  {
    title: "Ícone customizado por sistema",
    description: "Use icone para sobrescrever o ícone padrão (definido por tipo) em um sistema específico.",
    example: (
      <div style={{ background: "#1e293b", padding: "0.5rem", borderRadius: 6, maxWidth: 260 }}>
        <AppSidebarVersionSeplag
          sistemas={[
            {
              nome: "Serviço de arquivos",
              icone: "pi pi-cloud",
              versoes: [{ valor: "2.0.0" }],
            },
          ]}
        />
      </div>
    ),
    code: `<AppSidebarVersionSeplag
  sistemas={[
    { nome: "Serviço de arquivos", icone: "pi pi-cloud", versoes: [{ valor: "2.0.0" }] },
  ]}
/>`,
  },
];

const props: DocProp[] = [
  { name: "sistemas", type: "SistemaVersaoSeplag[]", defaultValue: "[]", description: "Sistemas e suas versões, exibidos no modal de versões do menu lateral." },
  { name: "collapsed", type: "boolean", description: "Quando true, oculta o rótulo \"Versões\" do botão (usado com o menu lateral recolhido)." },
  { name: "onOpen", type: "() => void", description: "Callback disparado ao abrir o modal de versões. Se sistemas estiver vazio e onOpen não for informado, o componente não renderiza nada." },
];

export default function AppSidebarVersionDoc() {
  return (
    <DocPage
      title="AppSidebarVersion"
      badge="Estável"
      since="v0.1.153"
      description="Botão do menu lateral que abre um modal com as versões (frontend/backend) dos sistemas envolvidos. Suporta atalho Ctrl+C para copiar o JSON bruto das versões quando o modal está aberto."
      importStatement={`import { AppSidebarVersionSeplag, TipoSistemaVersaoSeplag } from "@seplag/ui-lib-react-18";
import type { AppSidebarVersionSeplagProps, SistemaVersaoSeplag, VersaoValorSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
