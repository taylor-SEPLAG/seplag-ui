import { BadgeSeplag } from "@componentes/Badge";
import "primereact/resources/themes/saga-blue/theme.css";
import { useState } from "react";
import { DocPage, PlaygroundCode, type DocProp, type DocSection } from "../../components/DocPage";

// ---------------------------------------------------------------------------
// Dados de exemplo
// ---------------------------------------------------------------------------

const examples = ["ATIVO", "INATIVO", "PENDENTE", "CANCELADO"];

function resolveStatusVariant(descStatus: string | null): "success" | "warning" | "neutral" {
  const raw = descStatus?.trim().toUpperCase() || "PENDENTE";

  if (raw === "ATIVO") return "success";
  if (raw === "PENDENTE") return "warning";
  return "neutral";
}

function renderStatusByFilter(descStatus: string | null) {
  return (
    <BadgeSeplag
      label={descStatus || "PENDENTE"}
      variant={resolveStatusVariant(descStatus)}
      minWidth={120}
    />
  );
}

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

function StatusByFilterChipPlayground() {
  const [value, setValue] = useState<string>(examples[0]);

  const generatedCode = `import { StatusByFilterChipSeplag } from "@seplag/ui-lib-react-18";

<StatusByFilterChipSeplag descStatus="${value}" />`;

  return (
    <div className="botao-playground">
      <div className="botao-playground-preview">
        <div>{renderStatusByFilter(value)}</div>
      </div>

      <div className="botao-playground-controls">
        <div className="pg-field">
          <label htmlFor="descstatus-select" className="pg-label">
            descStatus
          </label>
          <select
            id="descstatus-select"
            className="pg-select"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          >
            {examples.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
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
    title: "Depreciação",
    description:
      "Este componente está deprecated. Para novos desenvolvimentos, use BadgeSeplag com mapeamento explícito entre status e variant.",
    example: (
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <BadgeSeplag label="ATIVO" variant="success" />
        <BadgeSeplag label="PENDENTE" variant="warning" />
        <BadgeSeplag label="INATIVO" variant="neutral" />
      </div>
    ),
    code: `const statusVariantMap = {
  ATIVO: "success",
  PENDENTE: "warning",
  INATIVO: "neutral",
};

<BadgeSeplag
  label={descStatus}
  variant={statusVariantMap[descStatus] ?? "neutral"}
/>`,
  },
  {
    title: "Playground",
    description: "Teste o chip com diferentes valores textuais de status.",
    example: <StatusByFilterChipPlayground />,
    code: "",
  },
  {
    title: "Uso básico",
    description: "Variações de status por mapeamento explícito para BadgeSeplag.",
    example: (
      <div style={{ display: "flex", gap: 12 }}>
        {examples.map((ex) => (
          <div key={ex}>{renderStatusByFilter(ex)}</div>
        ))}
      </div>
    ),
    code: `import { BadgeSeplag } from "@seplag/ui-lib-react-18";

const statusVariantMap = {
  ATIVO: "success",
  PENDENTE: "warning",
  INATIVO: "neutral",
};

<BadgeSeplag
  label={descStatus}
  variant={statusVariantMap[descStatus] ?? "neutral"}
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "descStatus",
    type: "string | null",
    description: "Descrição textual do status. Normaliza e mapeia para uma chave de status.",
  },
];

export default function StatusByFilterChipDoc() {
  return (
    <DocPage
      title="StatusByFilterChip"
      badge="Deprecated"
      since="v0.0.1"
      description="Componente legado de chip por string de status. Prefira BadgeSeplag com mapeamento no consumidor."
      importStatement={'import { BadgeSeplag } from "@seplag/ui-lib-react-18";'}
      sections={sections}
      props={props}
    />
  );
}
