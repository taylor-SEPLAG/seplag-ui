import { BadgeSeplag } from "@componentes/Badge";
import "primereact/resources/themes/saga-blue/theme.css";
import { useState } from "react";
import { DocPage, PlaygroundCode, type DocProp, type DocSection } from "../../components/DocPage";

// ---------------------------------------------------------------------------
// Dados de exemplo
// ---------------------------------------------------------------------------

const today = new Date();
const fmt = (d: Date) =>
  d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const exampleDates = {
  hoje: fmt(today),
  futuro: fmt(new Date(today.getTime() + 1000 * 60 * 60 * 24 * 7)),
  passado: fmt(new Date(today.getTime() - 1000 * 60 * 60 * 24 * 7)),
};

function isAtivoByDataFim(dataFim: string | null): boolean {
  if (!dataFim) return true;

  const [dia, mes, ano] = dataFim.split("/").map(Number);
  const dataFimDate = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return hoje < dataFimDate;
}

function renderStatusByDataFim(dataFim: string | null) {
  const ativo = isAtivoByDataFim(dataFim);
  return (
    <BadgeSeplag
      label={ativo ? "ATIVO" : "INATIVO"}
      variant={ativo ? "success" : "neutral"}
      minWidth={120}
    />
  );
}

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------

function StatusByDataFimChipPlayground() {
  const [selected, setSelected] = useState<"hoje" | "futuro" | "passado" | "null">("hoje");

  const dataFim = selected === "null" ? null : exampleDates[selected];

  const dataFimAttr = dataFim ? `"${dataFim}"` : "null";
  const generatedCode = [
    'import { StatusByDataFimChipSeplag } from "@seplag/ui-lib-react-18";',
    "",
    `<StatusByDataFimChipSeplag dataFim={${dataFimAttr}} />`,
  ].join("\n");

  return (
    <div className="botao-playground">
      <div className="botao-playground-preview">
        <div>{renderStatusByDataFim(dataFim)}</div>
      </div>

      <div className="botao-playground-controls">
        <div className="pg-field">
          <label htmlFor="datafim-select" className="pg-label">
            dataFim
          </label>
          <select
            id="datafim-select"
            className="pg-select"
            value={selected}
            onChange={(e) => setSelected(e.target.value as any)}
          >
            <option value="hoje">Hoje ({exampleDates.hoje})</option>
            <option value="futuro">Futuro ({exampleDates.futuro})</option>
            <option value="passado">Passado ({exampleDates.passado})</option>
            <option value="null">Null (sem data)</option>
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
      "Este componente está deprecated. Para novos desenvolvimentos, use BadgeSeplag com regra explícita de status no domínio da aplicação.",
    example: (
      <div style={{ display: "flex", gap: 12 }}>
        <BadgeSeplag label="Ativo" variant="success" />
        <BadgeSeplag label="Inativo" variant="neutral" />
      </div>
    ),
    code: `const ativo = Boolean(dataFim) ? isBefore(new Date(), parse(dataFim, "dd/MM/yyyy", new Date())) : true;

<BadgeSeplag
  label={ativo ? "ATIVO" : "INATIVO"}
  variant={ativo ? "success" : "neutral"}
/>`,
  },
  {
    title: "Playground",
    description: "Teste o comportamento do chip com diferentes valores de `dataFim`.",
    example: <StatusByDataFimChipPlayground />,
    code: "",
  },
  {
    title: "Uso básico",
    description: "Exemplo de migração com datas fixas para visualizar estados Ativo / Inativo.",
    example: (
      <div style={{ display: "flex", gap: 12 }}>
        <div>{renderStatusByDataFim(exampleDates.futuro)}</div>
        <div>{renderStatusByDataFim(exampleDates.passado)}</div>
        <div>{renderStatusByDataFim(null)}</div>
      </div>
    ),
    code: `import { BadgeSeplag } from "@seplag/ui-lib-react-18";

const ativo = dataFim ? isAtivoByDataFim(dataFim) : true;

<BadgeSeplag
  label={ativo ? "ATIVO" : "INATIVO"}
  variant={ativo ? "success" : "neutral"}
  minWidth={120}
/>`,
  },
];

const props: DocProp[] = [
  {
    name: "dataFim",
    type: "string | null",
    description: "Data final no formato dd/MM/yyyy. Quando ausente, considera ativo.",
  },
];

export default function StatusByDataFimChipDoc() {
  return (
    <DocPage
      title="StatusByDataFimChip"
      badge="Deprecated"
      since="v0.0.1"
      description="Componente legado de chip de status por data. Prefira BadgeSeplag com mapeamento de status no consumidor."
      importStatement={'import { BadgeSeplag } from "@seplag/ui-lib-react-18";'}
      sections={sections}
      props={props}
    />
  );
}
