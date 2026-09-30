import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { V2PageFrame, V2Tags } from "./V2Shared";
import { V2_BASE, V2_CARGOS, v2ApplyRga, v2Date, v2Persist, v2Read, v2RgaCandidates, v2VisibleLinks, type V2Record } from "./v2Store";

export function V2RgaPage() {
  const nav = useNavigate();
  const [records] = useState(v2Read);
  const [step, setStep] = useState(0);
  const [percent, setPercent] = useState("");
  const [start, setStart] = useState("");
  const [baseLegal, setBaseLegal] = useState("");
  const [observation, setObservation] = useState("");
  const candidates = v2RgaCandidates(records);
  const [selected, setSelected] = useState<string[]>([]);
  const [preview, setPreview] = useState<V2Record[]>([]);
  const [pendingRecords, setPendingRecords] = useState<V2Record[]>([]);
  const [snapshot, setSnapshot] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const selectedRows = candidates.filter((record) => selected.includes(record.id));
  const eligibleCount = selectedRows.reduce((sum, record) => sum + v2VisibleLinks(record).filter((link) => link.incideRga).length, 0);
  const splits = selectedRows.filter((record) => v2VisibleLinks(record).some((link) => !link.incideRga));
  const next = () => {
    setError("");
    if (step === 0) {
      if (!Number(percent) || Number(percent) <= 0 || !start || !baseLegal.trim()) { setError("Informe percentual, data início da vigência e Base Legal."); return; }
      setStep(1); return;
    }
    if (step === 1) {
      const result = v2ApplyRga(records, selected, Number(percent), start, baseLegal, observation);
      if (!result.ok) { setError(result.message); return; }
      setPreview(result.created); setPendingRecords(result.records); setSnapshot(JSON.stringify(records)); setStep(2);
    }
  };
  const apply = () => {
    setError("");
    const fresh = v2Read();
    if (JSON.stringify(fresh) !== snapshot) { setConfirm(false); setError("Os dados das tabelas foram alterados. Revise a seleção antes de confirmar."); setStep(1); return; }
    v2Persist(pendingRecords); nav(V2_BASE + "?rga=1");
  };
  return <V2PageFrame title="Aplicar RGA em lote">
    <div className="v2-wizard-tabs">{["Dados do RGA", "Selecionar tabelas", "Resumo da aplicação"].map((label, index) =>
      <button type="button" key={label} className={step === index ? "active" : ""} disabled={index > step} onClick={() => setStep(index)}>{label}</button>)}</div>
    {step === 0 && <section className="v2-panel"><h2>Dados do RGA</h2><div className="v2-form-grid">
      <label><span>Percentual de RGA (%) <span className="v2-required">*</span></span><input type="number" min="0" step="0.01" value={percent} onChange={(event) => setPercent(event.target.value)} /></label>
      <label><span>Data início da vigência <span className="v2-required">*</span></span><input type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
      <label><span>Base Legal <span className="v2-required">*</span></span><input value={baseLegal} onChange={(event) => setBaseLegal(event.target.value)} /></label>
      <label className="v2-wide">Observação<textarea rows={3} value={observation} onChange={(event) => setObservation(event.target.value)} /></label>
    </div></section>}
    {step === 1 && <section className="v2-panel"><h2>Tabelas elegíveis</h2><p>Somente Tipos de Vínculo com incidência de RGA receberão novos valores.</p>
      <div className="v2-table-wrap"><table className="v2-table"><thead><tr><th>Seleção</th><th>Cargo</th><th>Jornada</th><th>Tipo(s) de Vínculo</th><th>Versão</th><th>Vigência</th><th>Incide RGA?</th></tr></thead><tbody>
        {candidates.map((record) => <tr key={record.id}><td><input type="checkbox" aria-label={"Selecionar " + record.tableId} checked={selected.includes(record.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, record.id] : selected.filter((item) => item !== record.id))} /></td>
          <td>{V2_CARGOS.find((cargo) => cargo.id === record.cargoId)?.nome}</td><td>{record.jornada}</td><td><V2Tags tipos={v2VisibleLinks(record).map((link) => link.tipo)} /></td><td>V{record.version}</td><td>{v2Date(record.inicio)} – {v2Date(record.fim)}</td>
          <td>{v2VisibleLinks(record).map((link) => <div key={link.tipo}>{link.tipo}: {link.incideRga ? "Sim" : "Não"}</div>)}</td></tr>)}
        {!candidates.length && <tr><td colSpan={7} className="v2-empty">Nenhuma tabela elegível para RGA.</td></tr>}
      </tbody></table></div>
      {!!splits.length && <div className="v2-note">As tabelas {splits.map((record) => record.tableId).join(", ")} serão separadas: os vínculos sem incidência permanecerão com os valores anteriores.</div>}
    </section>}
    {step === 2 && <section className="v2-panel"><h2>Resumo da aplicação</h2><div className="v2-info-grid">
      <div><small>Percentual</small><strong>{Number(percent).toLocaleString("pt-BR")}%</strong></div><div><small>Data de vigência</small><strong>{v2Date(start)}</strong></div>
      <div><small>Tabelas selecionadas</small><strong>{selected.length}</strong></div><div><small>Vínculos contemplados</small><strong>{eligibleCount}</strong></div>
      <div><small>Novas versões ou tabelas</small><strong>{preview.length}</strong></div><div><small>Separações necessárias</small><strong>{splits.length}</strong></div>
    </div><div className="v2-table-wrap"><table className="v2-table"><thead><tr><th>Tabela de origem</th><th>Jornada</th><th>Tipos de Vínculo contemplados</th><th>Resultado</th></tr></thead><tbody>{preview.map((record, index) => <tr key={record.id}><td>{selectedRows[index]?.tableId} V{selectedRows[index]?.version}</td><td>{record.jornada}</td><td>{record.links.map((link) => link.tipo).join(", ")}</td><td>{record.tableId} V{record.version}</td></tr>)}</tbody></table></div>
      <div className="v2-note">A confirmação criará novas versões e registrará o percentual, os valores anteriores e os valores resultantes no histórico.</div>
    </section>}
    {error && <p role="alert" className="v2-error">{error}</p>}
    <div className="v2-footer"><button type="button" className="v2-button-secondary" onClick={() => step ? setStep(step - 1) : nav(V2_BASE)}>Voltar</button>
      <button type="button" className="v2-button-primary" onClick={step === 2 ? () => setConfirm(true) : next}>{step === 2 ? "Confirmar Aplicação" : "Avançar"}</button></div>
    {confirm && <div className="v2-overlay" role="presentation" onMouseDown={() => setConfirm(false)}><section className="v2-modal v2-confirm" role="dialog" aria-modal="true" aria-labelledby="v2-confirm-title" onMouseDown={(event) => event.stopPropagation()}>
      <header><h2 id="v2-confirm-title">Confirmar aplicação de RGA</h2><button type="button" className="v2-icon-plain" aria-label="Fechar" onClick={() => setConfirm(false)}><i className="pi pi-times" /></button></header>
      <p>Aplicar {Number(percent).toLocaleString("pt-BR")}% em {selected.length} tabela(s), contemplando {eligibleCount} vínculo(s)?</p>
      <div className="v2-footer"><button type="button" className="v2-button-secondary" onClick={() => setConfirm(false)}>Cancelar</button><button type="button" className="v2-button-primary" onClick={apply}>Confirmar Aplicação</button></div>
    </section></div>}
  </V2PageFrame>;
}
