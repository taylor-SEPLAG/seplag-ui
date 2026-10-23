import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentosLegaisAssociadosSeplag } from "@componentes/DocumentosLegaisAssociados";
import { useDocumentosLegaisAssociaveis } from "../documentosLegais/documentosLegaisStore";
import { V2PageFrame, V2Tags } from "./V2Shared";
import {
  V2_BASE, V2_CARGOS, v2ApplyRga, v2Currency, v2Date, v2Persist, v2Read,
  v2RgaCandidates, v2VisibleLinks, type V2Record,
} from "./v2Store";

const rateValue = (value: string) => Number(value.replace("%", "").replace(",", "."));
const rateLabel = (value: string) => rateValue(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
const formatPercent = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 5);
  return digits ? (Number(digits) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%" : "";
};

export function V2RgaPage() {
  const nav = useNavigate();
  const documents = useDocumentosLegaisAssociaveis();
  const [records] = useState(v2Read);
  const [step, setStep] = useState(0);
  const [percent, setPercent] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [legalId, setLegalId] = useState("");
  const baseLegal = documents.find((document) => document.id === legalId)?.titulo || "";
  const [observation, setObservation] = useState("");
  const candidates = v2RgaCandidates(records);
  const [selected, setSelected] = useState<string[]>([]);
  const [cargoFilter, setCargoFilter] = useState("");
  const [tableFilter, setTableFilter] = useState("");
  const [preview, setPreview] = useState<V2Record[]>([]);
  const [pendingRecords, setPendingRecords] = useState<V2Record[]>([]);
  const [snapshot, setSnapshot] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const impactedCargoCount = new Set(preview.map((record) => record.cargoId)).size;
  const totalValues = preview.reduce((total, record) => total + record.matrix.rows.reduce(
    (count, row) => count + row.values.filter((value) => value.trim() !== "").length, 0,
  ), 0);
  const sourceFor = (record: V2Record) => records.find((item) => item.id === record.previousId);
  const cargoFor = (record: V2Record) => V2_CARGOS.find((cargo) => cargo.id === record.cargoId)?.nome || "—";
  const cargoOptions = [...new Map(candidates.map((record) => [String(record.cargoId), cargoFor(record)])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  const tableOptions = [...new Set(candidates.filter((record) => !cargoFilter || String(record.cargoId) === cargoFilter)
    .map((record) => record.tableId))].sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
  const visibleCandidates = candidates.filter((record) =>
    (!cargoFilter || String(record.cargoId) === cargoFilter) && (!tableFilter || record.tableId === tableFilter));
  const allSelected = visibleCandidates.length > 0 && visibleCandidates.every((record) => selected.includes(record.id));
  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => checked ? [...new Set([...current, id])] : current.filter((item) => item !== id));
  const next = () => {
    setError("");
    if (step === 0) {
      if (!selected.length) { setError("Selecione pelo menos uma Tabela de Vencimentos vigente."); return; }
      setStep(1);
      return;
    }
    if (!Number.isFinite(rateValue(percent)) || rateValue(percent) <= 0 || !start || !legalId) {
      setError("Informe percentual, data de início da vigência e Base Legal.");
      return;
    }
    const result = v2ApplyRga(records, selected, rateValue(percent), start, baseLegal, observation.trim(), undefined, { year, end, baseLegalId: legalId });
    if (!result.ok) { setError(result.message); return; }
    setPreview(result.created);
    setPendingRecords(result.records);
    setSnapshot(JSON.stringify(records));
    setStep(2);
  };
  const apply = () => {
    const fresh = v2Read();
    if (JSON.stringify(fresh) !== snapshot) {
      setConfirm(false);
      setError("Os dados das tabelas foram alterados. Revise a seleção antes de confirmar.");
      setStep(0);
      return;
    }
    v2Persist(pendingRecords);
    nav(V2_BASE + "?rga=1&quantidade=" + preview.length);
  };
  return <V2PageFrame title="Aplicar RGA em lote">
    <ol className="v2-rga-steps" aria-label="Etapas da aplicação">
      {["Seleção das Tabelas", "Parâmetros do RGA", "Pré-visualização"].map((label, index) =>
        <li key={label} className={step === index ? "active" : index < step ? "complete" : ""} aria-current={step === index ? "step" : undefined}>
          <button type="button" disabled={index > step} onClick={() => setStep(index)} aria-label={label}>
            <span className="v2-rga-step-number" aria-hidden="true">{index + 1}</span>
            <span>{label}</span>
            {step === index && <small>Etapa atual</small>}
          </button>
        </li>)}
    </ol>

    {step === 0 && <section className="v2-panel"><h2>Seleção das Tabelas</h2>
      <div className="v2-note">Selecione as Tabelas de Vencimentos vigentes que receberão a aplicação do RGA. Todas as Tabelas selecionadas terão uma nova versão gerada com os valores reajustados e origem “RGA em lote”.</div>
      <div className="v2-filters v2-rga-search">
        <label>Cargo<select value={cargoFilter} onChange={(event) => { setCargoFilter(event.target.value); setTableFilter(""); }}>
          <option value="">Todos os cargos</option>
          {cargoOptions.map(([id, nome]) => <option key={id} value={id}>{id.padStart(4, "0")} - {nome}</option>)}
        </select></label>
        <label>ID da tabela<select value={tableFilter} onChange={(event) => setTableFilter(event.target.value)}>
          <option value="">Todas as tabelas</option>
          {tableOptions.map((id) => <option key={id} value={id}>{id}</option>)}
        </select></label>
      </div>
      <div className="v2-table-wrap"><table className="v2-table" aria-label="Tabelas vigentes para RGA em lote">
        <thead><tr>
          <th><input type="checkbox" aria-label="Selecionar todas as tabelas vigentes" checked={allSelected} disabled={!visibleCandidates.length}
            onChange={(event) => setSelected((current) => event.target.checked
              ? [...new Set([...current, ...visibleCandidates.map((record) => record.id)])]
              : current.filter((id) => !visibleCandidates.some((record) => record.id === id)))} /></th>
          <th>Código do Cargo</th><th>Cargo</th><th>ID</th><th>Jornada</th><th>Tipo(s) de Vínculo</th><th>Versão vigente</th><th>Vigência</th>
        </tr></thead>
        <tbody>{visibleCandidates.map((record) => <tr key={record.id}>
          <td><input type="checkbox" aria-label={"Selecionar " + record.tableId} checked={selected.includes(record.id)}
            onChange={(event) => toggle(record.id, event.target.checked)} /></td>
          <td>{String(record.cargoId).padStart(4, "0")}</td><td>{cargoFor(record)}</td><td>{record.tableId}</td><td>{record.jornada}</td>
          <td><V2Tags tipos={v2VisibleLinks(record).map((link) => link.tipo)} /></td>
          <td>V{record.version}</td><td>{v2Date(record.inicio)} – {record.fim ? v2Date(record.fim) : "Atual"}</td>
        </tr>)}
        {!visibleCandidates.length && <tr><td colSpan={8} className="v2-empty">{candidates.length ? "Nenhuma tabela encontrada para a busca informada." : "Nenhuma tabela vigente disponível."}</td></tr>}
        </tbody>
      </table></div>
      <p className="v2-rga-selection-count">{selected.length} {selected.length === 1 ? "Tabela selecionada" : "Tabelas selecionadas"}</p>
    </section>}

    {step === 1 && <div className="v2-batch-parameters">
      <section className="v2-panel v2-batch-card" aria-labelledby="v2-batch-parameters-title">
        <header className="v2-batch-card-header"><i className="pi pi-percentage" aria-hidden="true" /><h2 id="v2-batch-parameters-title">Parâmetros do RGA</h2></header>
        <div className="v2-batch-card-body">
          <div className="v2-note v2-batch-info"><i className="pi pi-info-circle" aria-hidden="true" /><span>Os parâmetros informados nesta etapa serão aplicados a todos os cargos selecionados.</span></div>
          <div className="v2-form-grid v2-batch-grid">
            <label><span>Ano do RGA <span className="v2-required">*</span></span><input inputMode="numeric" maxLength={4} value={year} onChange={(event) => setYear(event.target.value.replace(/\D/g, "").slice(0, 4))} /></label>
            <label><span>Percentual do RGA <span className="v2-required">*</span></span><input inputMode="numeric" placeholder="0,00%" value={percent} onChange={(event) => setPercent(formatPercent(event.target.value))} /></label>
            <label><span>Data início da vigência do RGA <span className="v2-required">*</span></span><input type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
            <label><span>Data fim da vigência do RGA</span><input type="date" min={start || undefined} value={end} onChange={(event) => setEnd(event.target.value)} /></label>
            <div className="v2-legal-field"><DocumentosLegaisAssociadosSeplag label="Base legal da RGA" required options={documents} value={legalId ? [legalId] : []}
              onChange={(ids) => setLegalId(ids.find((id) => id !== legalId) || ids[0] || "")}
              placeholder="Buscar documentos legais..." exibirNovoCadastro={false} compact expandirAoAbrir /></div>
          </div>
          <p className="v2-batch-help">Para percentuais diferentes, realize aplicações em lote distintas.</p>
        </div>
      </section>
      <section className="v2-panel v2-batch-card" aria-labelledby="v2-batch-observation-title">
        <header className="v2-batch-card-header"><i className="pi pi-comment" aria-hidden="true" /><div><h2 id="v2-batch-observation-title">Observação</h2><p>Registre informações complementares sobre a tabela de vencimentos.</p></div></header>
        <div className="v2-batch-card-body v2-form-grid"><div className="v2-wide"><label htmlFor="v2-batch-observation">Observação</label><textarea id="v2-batch-observation" rows={6} maxLength={2000} value={observation} onChange={(event) => setObservation(event.target.value)} /><small className="v2-batch-counter">{observation.length}/2000</small></div></div>
      </section>
    </div>}

    {step === 2 && <section className="v2-panel v2-rga-preview-panel"><h2 id="v2-rga-summary-title" className="v2-rga-summary-title">Resumo da aplicação</h2>
      <div className="v2-info-grid v2-rga-summary" role="region" aria-labelledby="v2-rga-summary-title">
        <div><small>Tabelas selecionadas</small><strong>{selected.length}</strong></div>
        <div><small>Cargos impactados</small><strong>{impactedCargoCount}</strong></div>
        <div><small>Total de valores a recalcular</small><strong>{totalValues}</strong></div>
        <div><small>Percentual do RGA</small><strong>{rateLabel(percent)}</strong></div>
        <div><small>Vigência das novas versões</small><strong>{v2Date(start)} a {end ? v2Date(end) : "Atual"}</strong></div>
        <div><small>Base Legal</small><strong>{baseLegal}</strong></div>
      </div>
      <div className="v2-table-wrap"><table className="v2-table" aria-label="Pré-visualização do RGA em lote">
        <thead><tr><th>Cargo</th><th>Jornada</th><th>Tipo(s) de Vínculo</th><th>Versão atual</th><th>Nova versão</th><th>Percentual</th><th>Origem</th></tr></thead>
        <tbody>{preview.map((record) => <tr key={record.id}>
          <td>{cargoFor(record)}</td><td>{record.jornada}</td><td><V2Tags tipos={record.links.map((link) => link.tipo)} /></td>
          <td>V{sourceFor(record)?.version}</td><td>V{record.version}</td><td>{rateLabel(percent)}</td><td><span className="tv-origin-tag rga">RGA em lote</span></td>
        </tr>)}</tbody>
      </table></div>
      <div className="v2-rga-preview-values">{preview.map((record) => {
        const source = sourceFor(record);
        if (!source) return null;
        return <details key={record.id}><summary>{cargoFor(record)} · {record.jornada} · V{source.version} → V{record.version}</summary>
          <div className="v2-table-wrap"><table className="v2-table" aria-label={"Valores simulados de " + record.tableId}>
            <thead><tr><th>Nível / Classe</th><th>Valor vigente</th><th>RGA</th><th>Novo valor</th></tr></thead>
            <tbody>{record.matrix.rows.flatMap((row, rowIndex) => row.values.map((value, columnIndex) =>
              <tr key={rowIndex + ":" + columnIndex}><td>{row.name} / {record.matrix.columns[columnIndex]}</td>
                <td>{v2Currency(source.matrix.rows[rowIndex]?.values[columnIndex] || "")}</td>
                <td>{rateLabel(percent)}</td><td>{v2Currency(value)}</td></tr>))}</tbody>
          </table></div>
        </details>;
      })}</div>
    </section>}

    {error && <p role="alert" className="v2-error">{error}</p>}
    <div className="v2-footer"><button type="button" className="v2-button-secondary" onClick={() => step ? setStep(step - 1) : nav(V2_BASE)}>Voltar</button>
      <button type="button" className="v2-button-primary" disabled={step === 0 && !selected.length}
        onClick={step === 2 ? () => setConfirm(true) : next}>{step === 2 ? "Confirmar aplicação" : "Avançar"}</button></div>

    {confirm && <div className="v2-overlay" role="presentation" onMouseDown={() => setConfirm(false)}><section className="v2-modal v2-confirm v2-rga-confirm" role="dialog" aria-modal="true" aria-labelledby="v2-confirm-title" onMouseDown={(event) => event.stopPropagation()}>
      <header><h2 id="v2-confirm-title">Confirmar aplicação do RGA?</h2></header>
      <div className="v2-confirm-body">
        <p>A aplicação do RGA irá gerar novas versões das Tabelas de Vencimentos correspondentes {impactedCargoCount === 1 ? "ao cargo selecionado" : `aos ${impactedCargoCount} cargos selecionados`}, utilizando o percentual de {rateLabel(percent)}, com vigência a partir de {v2Date(start)}.</p>
        <p>Os servidores enquadrados nas novas versões terão o reflexo automático conforme a vigência da nova tabela.</p>
        <div className="v2-rga-confirm-notice"><i className="pi pi-info-circle" aria-hidden="true" /><span>As versões atualmente vigentes permanecerão inalteradas e disponíveis no histórico.</span></div>
        <div className="v2-info-grid v2-rga-confirm-summary">
        <div><small>Tabelas selecionadas</small><strong>{selected.length}</strong></div>
        <div><small>Cargos impactados</small><strong>{impactedCargoCount}</strong></div>
        <div><small>Percentual do RGA</small><strong>{rateLabel(percent)}</strong></div>
        <div><small>Vigência</small><strong>{v2Date(start)}{end ? ` a ${v2Date(end)}` : ""}</strong></div>
      </div>
      </div>
      <div className="v2-footer"><button type="button" className="v2-button-secondary" onClick={() => setConfirm(false)}><i className="pi pi-arrow-left" aria-hidden="true" /> Cancelar</button>
        <button type="button" className="v2-button-primary" onClick={apply}>Confirmar aplicação</button></div>
    </section></div>}
  </V2PageFrame>;
}
