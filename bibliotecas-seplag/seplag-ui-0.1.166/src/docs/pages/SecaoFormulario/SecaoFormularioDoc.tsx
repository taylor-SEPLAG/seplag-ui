import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { SecaoFormularioSeplag } from "@componentes/SecaoFormulario";
import { useState } from "react";

function SecaoFormularioPlayground() {
  const [noPadding, setNoPadding] = useState(false);
  const [corDeFundoConteudoAtiva, setCorDeFundoConteudoAtiva] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <input
            type="checkbox"
            checked={noPadding}
            onChange={(e) => setNoPadding(e.target.checked)}
          />
          noPadding
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <input
            type="checkbox"
            checked={corDeFundoConteudoAtiva}
            onChange={(e) => setCorDeFundoConteudoAtiva(e.target.checked)}
          />
          corDeFundoConteudoAtiva
        </label>
      </div>

      <div className="grid">
        <SecaoFormularioSeplag
          cols="12"
          title="Dados do contrato"
          description="Informações contratuais do certame"
          icon="pi pi-file"
          noPadding={noPadding}
          corDeFundoConteudoAtiva={corDeFundoConteudoAtiva}
        >
          <div className="col-12 md:col-6">
            <label htmlFor="sf-playground-numero" style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>
              Número do contrato
            </label>
            <input id="sf-playground-numero" type="text" placeholder="0000/2026" style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: 6 }} />
          </div>
          <div className="col-12 md:col-6">
            <label htmlFor="sf-playground-valor" style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>
              Valor
            </label>
            <input id="sf-playground-valor" type="text" placeholder="R$ 0,00" style={{ width: "100%", padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: 6 }} />
          </div>
        </SecaoFormularioSeplag>
      </div>
    </div>
  );
}

const sections: DocSection[] = [
  {
    title: "Playground",
    description:
      "Alterne noPadding e corDeFundoConteudoAtiva para ver como a seção se adapta ao redor do conteúdo do formulário.",
    example: <SecaoFormularioPlayground />,
    code: `import { useState } from "react";
import { SecaoFormularioSeplag } from "@seplag/ui-lib-react-18";

const [noPadding, setNoPadding] = useState(false);
const [corDeFundoConteudoAtiva, setCorDeFundoConteudoAtiva] = useState(false);

<SecaoFormularioSeplag
  cols="12"
  title="Dados do contrato"
  description="Informações contratuais do certame"
  icon="pi pi-file"
  noPadding={noPadding}
  corDeFundoConteudoAtiva={corDeFundoConteudoAtiva}
>
  <div className="col-12 md:col-6">
    <TextField label="Número do contrato" />
  </div>
  <div className="col-12 md:col-6">
    <CurrencyField label="Valor" />
  </div>
</SecaoFormularioSeplag>`,
  },
  {
    title: "Uso básico",
    description:
      "Cabeçalho com ícone em destaque (badge), título e descrição, seguido de um divisor acima do conteúdo — que fica sempre visível (não colapsa).",
    example: (
      <div className="grid">
        <SecaoFormularioSeplag cols="12" title="Dados gerais" description="Identificação do certame" icon="pi pi-info-circle">
          <p style={{ margin: 0 }}>Conteúdo do formulário aqui.</p>
        </SecaoFormularioSeplag>
      </div>
    ),
    code: `<SecaoFormularioSeplag
  cols="12"
  title="Dados gerais"
  description="Identificação do certame"
  icon="pi pi-info-circle"
>
  <p>Conteúdo do formulário aqui.</p>
</SecaoFormularioSeplag>`,
  },
  {
    title: "headerRight e iconElement customizado",
    description: "Use headerRight para exibir um badge de situação e iconElement para substituir o ícone padrão por qualquer nó React.",
    example: (
      <div className="grid">
        <SecaoFormularioSeplag
          cols="12"
          title="Contratação e custos"
          description="Modalidade de contratação e valores"
          iconElement={<span style={{ fontSize: "1.1rem" }}>💰</span>}
          headerRight={
            <span style={{ background: "#dcfce7", color: "#166534", padding: "0.2rem 0.6rem", borderRadius: 999, fontSize: "0.8rem", fontWeight: 600 }}>
              Preenchido
            </span>
          }
        >
          <p style={{ margin: 0 }}>Conteúdo do formulário aqui.</p>
        </SecaoFormularioSeplag>
      </div>
    ),
    code: `<SecaoFormularioSeplag
  cols="12"
  title="Contratação e custos"
  description="Modalidade de contratação e valores"
  iconElement={<CustomIcon />}
  headerRight={<BadgeSeplag label="Preenchido" variant="success" />}
>
  {/* ... */}
</SecaoFormularioSeplag>`,
  },
];

const props: DocProp[] = [
  { name: "cols", type: "string", description: 'Coluna(s) do grid responsivo (PrimeFlex). Aceita 1 a 3 valores: "col" | "col md:col" | "col md:col lg:col". Padrão interno: "12".' },
  { name: "title", type: "string", description: "Título exibido no cabeçalho da seção." },
  { name: "description", type: "string", description: "Texto de apoio exibido abaixo do título." },
  { name: "icon", type: "string", description: 'Classe CSS do ícone (ex.: "pi pi-briefcase"), exibido dentro do badge padrão.' },
  { name: "iconElement", type: "ReactNode", description: "Substitui o badge padrão por um nó próprio (ex.: um SVG)." },
  { name: "headerRight", type: "ReactNode", description: "Conteúdo à direita do cabeçalho (ex.: um badge de situação)." },
  { name: "noPadding", type: "boolean", defaultValue: "false", description: "Remove o padding interno da área de conteúdo." },
  { name: "corDeFundoHeaderAtiva", type: "boolean", defaultValue: "true", description: "Aplica cor de fundo ao cabeçalho." },
  { name: "corDeFundoHeader", type: "string", defaultValue: "var(--primary-50)", description: "Cor de fundo do cabeçalho quando corDeFundoHeaderAtiva é true." },
  { name: "corDeFundoConteudoAtiva", type: "boolean", defaultValue: "false", description: "Aplica cor de fundo à área de conteúdo." },
  { name: "corDeFundoConteudo", type: "string", defaultValue: "var(--primary-50)", description: "Cor de fundo do conteúdo quando corDeFundoConteudoAtiva é true." },
  { name: "id", type: "string", description: "Identificador HTML do elemento raiz e base dos data-testid." },
  { name: "className", type: "string", description: "Classes CSS adicionais no contêiner principal." },
  { name: "classNameHeader", type: "string", description: "Classes CSS adicionais no cabeçalho." },
  { name: "ariaLabel", type: "string", description: "Rótulo ARIA para acessibilidade (se omitido, usa title)." },
  { name: "children", type: "ReactNode", description: "Conteúdo da seção." },
];

export default function SecaoFormularioDoc() {
  return (
    <DocPage
      title="SecaoFormulario"
      badge="Estável"
      since="v0.1.153"
      description="Seção de formulário não expansível: cabeçalho com ícone em destaque, título, descrição e uma linha divisória acima do conteúdo, que fica sempre visível. Diferente do AccordionCardSeplag, não colapsa; diferente do PanelSeplag, o ícone recebe um badge e o cabeçalho é separado do conteúdo por um divisor."
      importStatement={`import { SecaoFormularioSeplag } from "@seplag/ui-lib-react-18";
import type { SecaoFormularioSeplagProps } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
