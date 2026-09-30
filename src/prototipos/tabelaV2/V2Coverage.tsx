import { useEffect, useId, useRef, useState } from "react";
import { V2Status } from "./V2Shared";
import { v2EditalNames, type V2Cargo, type V2Record } from "./v2Store";
import { v2Coverage, V2_COVERAGE_INFO, type CargoCoverage } from "./v2CoverageModel";

export function V2CoverageSummary({ coverage, detailed = false }: { coverage: CargoCoverage; detailed?: boolean }) {
  return <div className={"v2-coverage-summary coverage-" + coverage.status.toLowerCase().replaceAll(" ", "-")}>
    <span className="v2-coverage-tag">{coverage.status}</span>
    {coverage.total > 0 && <span className="v2-coverage-count">{coverage.covered} de {coverage.total} combinações{detailed ? " vigentes" : ""}</span>}
    {detailed && coverage.total > 0 && <span className="v2-coverage-progress" role="progressbar" aria-label="Cobertura das tabelas" aria-valuemin={0} aria-valuemax={coverage.total} aria-valuenow={coverage.covered} aria-valuetext={Math.round(coverage.percent) + "%"}><span style={{ width: coverage.percent + "%" }} /></span>}
  </div>;
}

export function V2CoveragePanel({ cargo, records }: { cargo: V2Cargo; records: V2Record[] }) {
  const coverage = v2Coverage(cargo, records);
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const [detailsKey, setDetailsKey] = useState<string | null>(null);
  const detailsCell = coverage.cells.find((cell) => cell.jornada + "|" + cell.tipo === detailsKey);
  const types = [...new Set(cargo.vinculos.map((link) => link.tipo))];
  return <section className="v2-coverage-panel" aria-label={"Cobertura de " + cargo.nome}>
    <button type="button" className="v2-coverage-toggle" aria-label="Cobertura por Jornada e Tipo de Vínculo" aria-expanded={open} aria-controls={bodyId}
      onClick={() => { setOpen(!open); if (open) setDetailsKey(null); }}>
      <span className="v2-coverage-toggle-title"><i className="pi pi-table" aria-hidden="true" />Cobertura por Jornada e Tipo de Vínculo
        <i className="pi pi-info-circle v2-coverage-help" title={V2_COVERAGE_INFO} aria-hidden="true" />
      </span>
      <i className={"pi " + (open ? "pi-chevron-up" : "pi-chevron-down")} aria-hidden="true" />
    </button>
    {open && <div className="v2-coverage-body" id={bodyId}>
      <div className="v2-coverage-detail-summary"><V2CoverageSummary coverage={coverage} detailed /></div>
      <div className="v2-table-wrap"><table className="v2-table" aria-label="Matriz de cobertura"><thead><tr><th>Jornada</th>{types.map((tipo) => <th key={tipo}>{tipo}</th>)}</tr></thead>
        <tbody>{[...new Set(cargo.jornadas)].map((jornada) => <tr key={jornada}>
          <td><span className={"tv-journey-tag " + (jornada === "20 horas" ? "tone-0" : jornada === "30 horas" ? "tone-1" : jornada === "40 horas" ? "tone-2" : "tone-3")}>{jornada}</span></td>
          {types.map((tipo) => {
            const cell = coverage.cells.find((item) => item.jornada === jornada && item.tipo === tipo)!;
            const key = jornada + "|" + tipo;
            return <td key={tipo}><div className={"v2-coverage-cell cell-" + cell.status.toLowerCase().replaceAll(" ", "-")}>
              {cell.status !== "Não aplicável" && <i aria-hidden="true" className={"pi " + (cell.status === "Vigente" ? "pi-check-circle" : cell.status === "Futura" ? "pi-clock" : "pi-times-circle")} />}
              <V2Status value={cell.status} />
              {cell.status !== "Vigente" && cell.details.some((detail) => detail.edital) && <button type="button" className="v2-coverage-details-button" aria-label={"Ver detalhes de " + jornada + " — " + tipo} aria-expanded={detailsKey === key} onClick={() => setDetailsKey(detailsKey === key ? null : key)}>Ver detalhes</button>}
            </div></td>;
          })}
        </tr>)}</tbody>
      </table></div>
      {!coverage.total && <p className="v2-muted">Não há combinações exigidas para este cargo.</p>}
      {detailsCell && <div className="v2-coverage-details">
        <h3>Detalhamento por edital</h3>
        <div className="v2-table-wrap"><table className="v2-table" aria-label="Detalhamento por edital"><thead><tr><th>Jornada</th><th>Tipo de Vínculo</th><th>Edital</th><th>Situação</th><th>Tabela associada</th></tr></thead>
          <tbody>{detailsCell.details.map((detail) => <tr key={detail.edital || "geral"}><td>{detailsCell.jornada}</td><td>{detailsCell.tipo}</td><td>{detail.edital ? v2EditalNames([detail.edital]) : "Geral"}</td><td><V2Status value={detail.status} /></td><td>{detail.record ? detail.record.tableId + " · V" + detail.record.version : "—"}</td></tr>)}</tbody>
        </table></div>
      </div>}
    </div>}
  </section>;
}

const demoCargos: V2Cargo[] = [
  { id: 1, nome: "Auditor Fiscal", carreira: "Administração Tributária", comissionado: false, jornadas: ["30 horas", "40 horas"], vinculos: ["Nomeado Efetivo", "Contrato Temporário"].map((tipo) => ({ tipo, jornadas: ["30 horas", "40 horas"] })), perfis: [] },
  { id: 2, nome: "Analista Administrativo", carreira: "Gestão Governamental", comissionado: false, jornadas: ["30 horas", "40 horas"], vinculos: ["Nomeado Efetivo", "Contrato Temporário"].map((tipo) => ({ tipo, jornadas: ["30 horas", "40 horas"] })), perfis: [] },
  { id: 3, nome: "Técnico de Desenvolvimento Econômico", carreira: "Desenvolvimento Econômico", comissionado: false, jornadas: ["20 horas", "30 horas", "40 horas"], vinculos: ["Nomeado Efetivo", "Contrato Temporário"].map((tipo) => ({ tipo, jornadas: ["20 horas", "30 horas", "40 horas"] })), perfis: [] },
];
const demoRecords: V2Record[] = demoCargos.slice(0, 2).flatMap((cargo) => cargo.jornadas.map((jornada, index) => ({
  id: "demo-" + cargo.id + "-" + index, tableId: "DEMO-" + cargo.id + "-" + index, version: 1, kind: "padrao" as const, cargoId: cargo.id, jornada, inicio: "2000-01-01",
  links: cargo.vinculos.filter((link) => cargo.id !== 2 || index !== 1 || link.tipo === "Nomeado Efetivo").map((link) => ({ tipo: link.tipo, inicio: "2000-01-01", incideRga: false })),
  matrix: { columns: ["A"], rows: [{ name: "001", values: ["R$ 4.500,00"] }] },
  baseLegal: "Dados demonstrativos", observacao: "", origem: "Manual" as const, responsavel: "Demonstração", criadoEm: "2000-01-01T00:00:00Z", events: [],
})));

export function V2CoverageDemo({ onClose }: { onClose: () => void }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const buttons = Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>("button") || []);
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); if (previous instanceof HTMLElement) previous.focus(); };
  }, [onClose]);
  return <div className="v2-overlay" onMouseDown={onClose}>
    <div className="v2-modal v2-coverage-demo" role="dialog" aria-modal="true" aria-labelledby="v2-coverage-demo-title" tabIndex={-1} ref={dialog} onMouseDown={(event) => event.stopPropagation()}>
      <header><div><h2 id="v2-coverage-demo-title">Demonstração de cobertura</h2><p>Três cargos fictícios para demonstrar os cenários de cobertura.</p></div><button type="button" className="v2-icon-plain" aria-label="Fechar demonstração" onClick={onClose}><i className="pi pi-times" /></button></header>
      <div className="v2-modal-body"><div className="v2-table-wrap"><table className="v2-table"><thead><tr><th>Código do cargo</th><th>Cargo</th><th>Jornadas</th><th>Cobertura das Tabelas</th><th>Ação</th></tr></thead>
        <tbody>{demoCargos.map((cargo) => <DemoRow key={cargo.id} cargo={cargo} expanded={expanded === cargo.id} onToggle={() => setExpanded(expanded === cargo.id ? null : cargo.id)} />)}</tbody>
      </table></div></div>
    </div>
  </div>;
}
function DemoRow({ cargo, expanded, onToggle }: { cargo: V2Cargo; expanded: boolean; onToggle: () => void }) {
  return <><tr><td>{String(cargo.id).padStart(4, "0")}</td><td>{cargo.nome}</td><td><span className="v2-neutral-tag">{cargo.jornadas.length} jornadas</span></td><td><V2CoverageSummary coverage={v2Coverage(cargo, demoRecords)} /></td><td><button type="button" className="v2-expand" aria-label={"Expandir demonstração de " + cargo.nome} aria-expanded={expanded} onClick={onToggle}><i className={"pi " + (expanded ? "pi-chevron-up" : "pi-chevron-down")} /></button></td></tr>
    {expanded && <tr><td colSpan={5}><V2CoveragePanel cargo={cargo} records={demoRecords} /></td></tr>}</>;
}
