import { useState } from "react";
import { useDocumentosLegaisAssociaveis } from "../documentosLegais/documentosLegaisStore";
import { v2Currency, v2Date, type V2Event, type V2Record } from "./v2Store";

const monetaryValue = (value: string) => Number(v2Currency(value).replace(/[^\d,-]/g, "").replace(",", "."));
const currency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
const dateTime = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString("pt-BR") + " às " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

export function V2RgaHistoryDetails({ version, previous, audit }: { version: V2Record; previous?: V2Record; audit: V2Event }) {
  const [legalPreview, setLegalPreview] = useState(false);
  const documents = useDocumentosLegaisAssociaveis();
  const legal = documents.find((document) => document.id === version.baseLegalId);
  const percent = audit.percent === undefined ? "—" : audit.percent.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
  const before = audit.before || previous?.matrix;
  const after = audit.after || version.matrix;
  const rows = version.remuneracao ? [
    { nivel: "Subsídio", classe: "—", before: previous?.remuneracao?.tipo === "subsidio" ? previous.remuneracao.valor : previous?.remuneracao?.baseCalculo,
      after: version.remuneracao.tipo === "subsidio" ? version.remuneracao.valor : version.remuneracao.baseCalculo },
    ...(version.remuneracao.tipo === "gratificacao" ? [{ nivel: "Gratificação", classe: "—", before: previous?.remuneracao?.valorCalculado, after: version.remuneracao.valorCalculado }] : []),
  ] : after.rows.flatMap((row, rowIndex) => row.values.map((value, columnIndex) => ({
    nivel: row.name, classe: after.columns[columnIndex], before: before?.rows[rowIndex]?.values[columnIndex], after: value,
  })));
  const fields = [
    ["Ano do RGA", audit.year || version.inicio.slice(0, 4)], ["Percentual do RGA", percent],
    ["Data início da vigência do RGA", v2Date(version.inicio)],
    ["Versão de origem", previous ? "V" + previous.version : version.referencia?.match(/V\d+\b/)?.[0] || "—"],
    ["Tipo de aplicação", audit.applicationType || (audit.year ? "Individual" : "Em lote")],
    ["Data fim da vigência do RGA", v2Date(version.fim)],
    ["Data e hora da aplicação", dateTime(audit.when)], ["Responsável pela aplicação", audit.actor || version.responsavel],
  ];
  return <div className="tv-history-rga">
    <section className="tv-history-rga-section tv-history-rga-data-section">
      <div className="tv-history-rga-data-grid">{fields.map(([label, value]) => <div className="tv-history-data-item" key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
      <div className="tv-history-rga-meta">
        <div className="tv-history-data-item"><small>Base legal do RGA</small><div className="tv-legal-file">
          <i className="pi pi-file-pdf" aria-hidden="true" /><span>{audit.baseLegal || version.baseLegal || "—"}</span>
          {(audit.baseLegal || version.baseLegal) && <button type="button" title="Visualizar arquivo" aria-label="Visualizar arquivo" onClick={() => setLegalPreview(true)}><i className="pi pi-eye" /></button>}
        </div></div>
        <div className="tv-history-data-item"><small>Observação</small><p>{version.observacao || "—"}</p></div>
      </div>
    </section>
    <section className="tv-history-rga-section">
      <h4>Valores aplicados pelo RGA</h4><div className="tv-scroll">
        <table className="tv-history-rga-values" aria-label="Valores aplicados pelo RGA">
          <thead><tr>{["Nível", "Classe", "Valor base", "Percentual RGA", "Valor com RGA", "Diferença"].map((label) => <th key={label}>{label}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => {
            const difference = row.before && row.after ? (Math.round(monetaryValue(row.after) * 100) - Math.round(monetaryValue(row.before) * 100)) / 100 : undefined;
            return <tr key={index}><td>{row.nivel}</td><td>{row.classe}</td><td>{row.before ? v2Currency(row.before) : "—"}</td><td>{percent}</td><td>{row.after ? v2Currency(row.after) : "—"}</td>
              <td className={difference !== undefined && difference > 0 ? "tv-rga-positive" : undefined}>{difference === undefined ? "—" : (difference > 0 ? "+ " : "") + currency(difference)}</td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </section>
    {legalPreview && <div className="tv-legal-preview-overlay" role="presentation" onMouseDown={() => setLegalPreview(false)}>
      <section className="tv-legal-preview" role="dialog" aria-modal="true" aria-label="Visualização da Base legal" onMouseDown={(event) => event.stopPropagation()}>
        <header><div><h3>Base legal do RGA</h3><p>{audit.baseLegal || version.baseLegal}</p></div>
          <button type="button" aria-label="Fechar visualização" onClick={() => setLegalPreview(false)}><i className="pi pi-times" /></button></header>
        <div className="tv-legal-preview-content"><i className="pi pi-file-pdf" aria-hidden="true" /><strong>{legal?.titulo || audit.baseLegal || version.baseLegal}</strong><span>{legal?.descricao || "Pré-visualização do documento de Base legal."}</span></div>
      </section>
    </div>}
  </div>;
}
