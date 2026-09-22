import { DocPage, type DocSection, type DocProp } from "../../components/DocPage";
import { DividerSeplag } from "@componentes/Divider";
import "primereact/resources/themes/saga-blue/theme.css";

const sections: DocSection[] = [
  {
    title: "Uso básico",
    description:
      'Linha separadora horizontal que ocupa toda a largura da grade (cols="12" por padrão). Ideal para dividir seções de formulários ou grupos de conteúdo.',
    example: (
      <div className="p-grid" style={{ width: "100%" }}>
        <div style={{ padding: "0.5rem 0", color: "#495057" }}>Seção superior</div>
        <DividerSeplag />
        <div style={{ padding: "0.5rem 0", color: "#495057" }}>Seção inferior</div>
      </div>
    ),
    code: `import { DividerSeplag } from "@seplag/ui-lib-react-18";

<DividerSeplag />`,
  },
  {
    title: "Largura parcial (cols)",
    description:
      'A prop "cols" segue o sistema de grid de 12 colunas. Use valores menores para divisores parciais.',
    example: (
      <div style={{ width: "100%" }}>
        <div
          style={{
            padding: "0.25rem 0",
            color: "#6c757d",
            fontSize: "0.85rem",
          }}
        >
          cols="12" (padrão)
        </div>
        <DividerSeplag cols="12" />
        <div
          style={{
            padding: "0.25rem 0",
            color: "#6c757d",
            fontSize: "0.85rem",
          }}
        >
          cols="6"
        </div>
        <DividerSeplag cols="6" />
        <div
          style={{
            padding: "0.25rem 0",
            color: "#6c757d",
            fontSize: "0.85rem",
          }}
        >
          cols="4"
        </div>
        <DividerSeplag cols="4" />
      </div>
    ),
    code: `<DividerSeplag cols="12" />
<DividerSeplag cols="6" />
<DividerSeplag cols="4" />`,
  },
  {
    title: "Dentro de um formulário",
    description: "Exemplo de uso típico separando blocos de campos em um formulário.",
    example: (
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <div style={{ fontWeight: 600, color: "#343a40" }}>Dados Pessoais</div>
        <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>Nome, CPF, data de nascimento…</div>
        <DividerSeplag />
        <div style={{ fontWeight: 600, color: "#343a40" }}>Endereço</div>
        <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>Logradouro, bairro, município…</div>
        <DividerSeplag />
        <div style={{ fontWeight: 600, color: "#343a40" }}>Contato</div>
        <div style={{ color: "#6c757d", fontSize: "0.9rem" }}>E-mail, telefone…</div>
      </div>
    ),
    code: `<DividerSeplag />`,
  },
];

const props: DocProp[] = [
  {
    name: "cols",
    type: "string",
    defaultValue: '"12"',
    required: false,
    description:
      "Número de colunas do grid (1–12) que o divisor deve ocupar. Segue o sistema de grid de 12 colunas da biblioteca.",
  },
  {
    name: "className",
    type: "string",
    defaultValue: '""',
    required: false,
    description: "Classe CSS adicional aplicada ao divisor.",
  },
];

export default function DividerDoc() {
  return (
    <DocPage
      title="DividerSeplag"
      description="Linha separadora horizontal baseada no Divider do PrimeReact, integrada ao sistema de grid SEPLAG. Utilizada para separar visualmente seções de formulários ou blocos de conteúdo."
      badge="Estável"
      since="v0.0.1"
      importStatement={`import { DividerSeplag } from "@seplag/ui-lib-react-18";`}
      sections={sections}
      props={props}
    />
  );
}
