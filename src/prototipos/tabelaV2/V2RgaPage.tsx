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
  const [preview, setPreview] = useState<V2Record[]>([]);
  const [pendingRecords, setPendingRecords] = useState<V2Record[]>([]);
  const [snapshot, setSnapshot] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const allSelected = candidates.length > 0 && candidates.every((record) => selected.includes(record.id));
  const sourceFor = (record: V2Record) => records.find((item) => item.id === record.previousId);
  const cargoFor = (record: V2Record) => V2_CARGOS.find((cargo) => cargo.id === record.cargoId)?.nome || "—";
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
    <div className="v2-wizard-tabs">{["Seleção das Tabelas", "Parâmetros do RGA", "Pré-visualização"].map((label, index) =>
      <button type="button" key={label} className={step === index ? "active" : ""} disabled={index > step} onClick={() => setStep(index)}>{label}</button>)}</div>

    {step === 0 && <section className="v2-panel"><h2>Seleção das Tabelas</h2>
      <div className="v2-note">Selecione as Tabelas de Vencimentos vigentes que receberão a aplicação do RGA. Todas as Tabelas selecionadas terão uma nova versão gerada com os valores reajustados e origem “RGA em lote”.</div>
      <div className="v2-table-wrap"><table className="v2-table" aria-label="Tabelas vigentes para RGA em lote">
        <thead><tr>
          <th><input type="checkbox" aria-label="Selecionar todas as tabelas vigentes" checked={allSelected} disabled={!candidates.length}
            onChange={(event) => setSelected(event.target.checked ? candidates.map((record) => record.id) : [])} /></th>
          <th>Código do Cargo</th><th>Cargo</th><th>Jornada</th><th>Tipo(s) de Vínculo</th><th>Versão vigente</th><th>Vigência</th>
        </tr></thead>
        <tbody>{candidates.map((record) => <tr key={record.id}>
          <td><input type="checkbox" aria-label={"Selecionar " + record.tableId} checked={selected.includes(record.id)}
            onChange={(event) => toggle(record.id, event.target.checked)} /></td>
          <td>{String(record.cargoId).padStart(4, "0")}</td><td>{cargoFor(record)}</td><td>{record.jornada}</td>
          <td><V2Tags tipos={v2VisibleLinks(record).map((link) => link.tipo)} /></td>
          <td>V{record.version}</td><td>{v2Date(record.inicio)} – {record.fim ? v2Date(record.fim) : "Atual"}</td>
        </tr>)}
        {!candidates.length && <tr><td colSpan={7} className="v2-empty">Nenhuma tabela vigente disponível.</td></tr>}
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

    {step === 2 && <section className="v2-panel"><h2>Pré-visualização</h2>
      <div className="v2-info-grid">
        <div><small>Ano do RGA</small><strong>{year}</strong></div>
        <div><small>Percentual do RGA</small><strong>{rateLabel(percent)}</strong></div>
        <div><small>Início da vigência</small><strong>{v2Date(start)}</strong></div>
        <div><small>Fim da vigência do RGA</small><strong>{end ? v2Date(end) : "Atual"}</strong></div>
        <div><small>Tabelas selecionadas</small><strong>{selected.length}</strong></div>
        <div><small>Novas versões</small><strong>{preview.length}</strong></div>
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

    {confirm && <div className="v2-overlay" role="presentation" onMouseDown={() => setConfirm(false)}><section className="v2-modal v2-confirm" role="dialog" aria-modal="true" aria-labelledby="v2-confirm-title" onMouseDown={(event) => event.stopPropagation()}>
      <header><h2 id="v2-confirm-title">Confirmar aplicação de RGA em lote</h2><button type="button" className="v2-icon-plain" aria-label="Fechar" onClick={() => setConfirm(false)}><i className="pi pi-times" /></button></header>
      <div className="v2-confirm-body"><div className="v2-info-grid">
        <div><small>Ano do RGA</small><strong>{year}</strong></div>
        <div><small>Fim da vigência do RGA</small><strong>{end ? v2Date(end) : "Atual"}</strong></div>
        <div><small>Percentual do RGA</small><strong>{rateLabel(percent)}</strong></div>
        <div><small>Data de início da vigência</small><strong>{v2Date(start)}</strong></div>
        <div><small>Tabelas selecionadas</small><strong>{selected.length}</strong></div>
        <div><small>Novas versões</small><strong>{preview.length}</strong></div>
        <div><small>Base Legal</small><strong>{baseLegal}</strong></div>
      </div>
      <p>Todas as Tabelas selecionadas terão uma nova versão criada com os valores reajustados pelo percentual informado e origem “RGA em lote”. Deseja continuar?</p></div>
      <div className="v2-footer"><button type="button" className="v2-button-secondary" onClick={() => setConfirm(false)}>Cancelar</button>
        <button type="button" className="v2-button-primary" onClick={apply}>Confirmar aplicação</button></div>
    </section></div>}
  </V2PageFrame>;
}
