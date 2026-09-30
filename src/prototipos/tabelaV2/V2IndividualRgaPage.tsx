import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BotaoSalvarSeplag, BotaoSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { DocumentosLegaisAssociadosSeplag } from "@componentes/DocumentosLegaisAssociados";
import { useDocumentosLegaisAssociaveis } from "../documentosLegais/documentosLegaisStore";
import { V2Form } from "./V2Form";
import { V2PageFrame } from "./V2Shared";
import { V2_BASE, V2_CARGOS, v2ApplyIndividualRga, v2Date, v2Persist, v2Read, v2Status, v2Structure, type V2Record } from "./v2Store";
import "../tabelaVencimentos/tabelaVencimentosSpacing.css";

const formatPercent = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 5);
  return digits ? (Number(digits) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%" : "";
};
const amount = (value: string) => Number(value.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
const difference = (before: string, after: string) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount(after) - amount(before));

export function V2IndividualRgaPage({ sourceId }: { sourceId: string }) {
  const nav = useNavigate();
  const documents = useDocumentosLegaisAssociaveis();
  const [records] = useState(v2Read);
  const snapshot = useRef(JSON.stringify(records));
  const source = records.find((record) => record.id === sourceId);
  const cargo = V2_CARGOS.find((item) => item.id === source?.cargoId);
  const [tab, setTab] = useState<"identificacao" | "valores" | "rga">("rga");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [percent, setPercent] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [legalId, setLegalId] = useState("");
  const [observation, setObservation] = useState("");
  const [simulation, setSimulation] = useState<{ record: V2Record; records: V2Record[] } | null>(null);
  const [applied, setApplied] = useState(false);
  const [stale, setStale] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const invalidate = () => {
    if (simulation || applied) setStale(true);
    setSimulation(null); setApplied(false); setConfirm(false); setError("");
  };
  const checkSnapshot = () => {
    if (JSON.stringify(v2Read()) === snapshot.current) return true;
    invalidate(); setError("Os dados da tabela foram alterados. Abra novamente a aplicação de RGA e refaça a simulação.");
    return false;
  };
  const simulate = () => {
    setError("");
    const legal = documents.find((document) => document.id === legalId);
    const rate = Number(percent.replace("%", "").replace(",", "."));
    const result = v2ApplyIndividualRga(records, sourceId, rate, start, end, legal?.titulo || "", legalId, observation.trim(), year);
    if (!result.ok) { setSimulation(null); setApplied(false); setError(result.message); return; }
    if (!checkSnapshot()) return;
    setApplied(false); setStale(false); setSimulation({ record: result.record, records: result.records });
  };
  const apply = () => {
    if (!simulation || !checkSnapshot()) return;
    v2Persist(simulation.records.map(record => record.id === simulation.record.id ? { ...record, observacao: observation.trim() } : record));
    snapshot.current = JSON.stringify(v2Read());
    setApplied(true); setConfirm(false); setError("");
  };
  const finish = () => {
    if (!simulation || !applied || !checkSnapshot()) return;
    nav(V2_BASE + "?rga=1&cargo=" + source?.cargoId);
  };
  if (!source || v2Status(source) !== "Vigente") return <V2PageFrame title="Aplicar RGA">
    <p role="alert" className="v2-error">Selecione uma tabela vigente.</p>
    <BotaoVoltarSeplag type="button" label="Voltar" onClick={() => nav(V2_BASE)} />
  </V2PageFrame>;
  const previewRows = source.remuneracao ? [
    ...(source.remuneracao.tipo === "subsidio" ? [{ key: "subsidio", nivel: "Subsídio", classe: "", before: source.remuneracao.tipo === "subsidio" ? source.remuneracao.valor : source.remuneracao.baseCalculo || "", after: simulation?.record.remuneracao?.tipo === "subsidio" ? simulation.record.remuneracao.valor : simulation?.record.remuneracao?.baseCalculo }] : []),
    ...(source.remuneracao.tipo === "gratificacao" ? [{ key: "gratificacao", nivel: "Gratificação", classe: "", before: source.remuneracao.valorCalculado || "", after: simulation?.record.remuneracao?.valorCalculado }] : []),
  ] : source.matrix.rows.flatMap((row, rowIndex) => row.values.map((value, columnIndex) => ({
    key: rowIndex + "-" + columnIndex, nivel: row.name, classe: source.matrix.columns[columnIndex],
    before: value, after: simulation?.record.matrix.rows[rowIndex]?.values[columnIndex],
  })));
  const effectiveEnd = end || source.fim;
  return <V2PageFrame title="Aplicar RGA">
    <nav className="v2-wizard-tabs" aria-label="Abas da aplicação de RGA">
      <button type="button" className={tab === "identificacao" ? "active" : ""} onClick={() => setTab("identificacao")}>Identificação e vigência</button>
      {v2Structure(source) === "matriz" && <button type="button" className={tab === "valores" ? "active" : ""} onClick={() => setTab("valores")}>Valores por Nível e Classe</button>}
      <button type="button" className={tab === "rga" ? "active" : ""} onClick={() => setTab("rga")}>Aplicação de RGA</button>
    </nav>
    {tab !== "rga" && <V2Form kind={source.kind} sourceId={source.id} view embedded viewStep={tab === "identificacao" ? 0 : 1} />}
    {tab === "rga" && <section className="prototype-novo-ingresso-panel tv-rga-panel tv-tab-panel active">
      <div className="tv-rga-heading">
        <div><h3><span className="prototype-novo-ingresso-panel-icon"><i className="pi pi-percentage" /></span><span>Aplicação de RGA</span></h3></div>
        <div className="tv-rga-actions">
          <BotaoSeplag type="button" label="Simular aplicação" disabled={applied} icon="pi pi-calculator" onClick={simulate} />
          <BotaoSalvarSeplag type="button" label="Aplicar RGA" disabled={!simulation || stale || applied} onClick={() => setConfirm(true)} />
        </div>
      </div>
      <div className="tv-rga-info"><i className="pi pi-info-circle" /><span>{cargo?.comissionado
        ? "O RGA será aplicado sobre o subsídio vigente e refletido no valor da gratificação conforme o percentual cadastrado."
        : "O RGA será calculado sobre os valores atualmente informados na seção Valores por Nível e Classe desta versão."}</span></div>
      <div className="tv-rga-main-grid">
        <div className="tv-rga-parameters"><h4>Parametrização da RGA</h4>
          <div className="tv-rga-fields">
            <label><span>Ano do RGA<em>*</em></span><input disabled={applied} inputMode="numeric" value={year} onChange={(event) => { invalidate(); setYear(event.target.value.replace(/\D/g, "").slice(0, 4)); }} /></label>
            <label><span>Percentual do RGA<em>*</em></span><input disabled={applied} inputMode="numeric" placeholder="0,00%" value={percent} onChange={(event) => { invalidate(); setPercent(formatPercent(event.target.value)); }} /></label>
            <label><span>Data início da vigência do RGA<em>*</em></span><input disabled={applied} type="date" value={start} onChange={(event) => { invalidate(); setStart(event.target.value); }} /></label>
            <label><span>Data fim da vigência do RGA</span><input disabled={applied} type="date" min={start || undefined} value={end} onChange={(event) => { invalidate(); setEnd(event.target.value); }} /></label>
            <div className="prototype-ingresso-field tv-base-legal-field tv-rga-legal">
              <DocumentosLegaisAssociadosSeplag label="Base legal da RGA" disabled={applied} required options={documents} value={legalId ? [legalId] : []}
                onChange={(ids) => { invalidate(); setLegalId(ids[ids.length - 1] || ""); }} onVisualizar={(document) => nav("/prototipos/sigep/documentos-legais/" + document.id)}
                placeholder="Buscar documentos legais..." exibirNovoCadastro={false} compact expandirAoAbrir />
            </div>
            <label className="wide"><span>Observação</span><textarea disabled={applied} rows={3} maxLength={2000} value={observation} onChange={(event) => setObservation(event.target.value)} /></label>
          </div>
        </div>
        <aside className="tv-rga-summary"><h4>Resumo da aplicação</h4><dl>
          <div><dt>Cargo</dt><dd>{cargo?.nome}</dd></div>
          <div><dt>Jornada</dt><dd><span className={"tv-journey-tag " + (source.jornada === "20 horas" ? "tone-0" : source.jornada === "30 horas" ? "tone-1" : source.jornada === "40 horas" ? "tone-2" : "tone-3")}>{source.jornada}</span></dd></div>
          <div><dt>Versão de origem</dt><dd>V{source.version}</dd></div>
          <div><dt>{applied ? "Versão atual" : "Versão em edição"}</dt><dd>V{simulation?.record.version || source.version + 1}</dd></div>
          <div><dt>Vigência da nova versão</dt><dd>{start ? v2Date(start) + " – " + (effectiveEnd ? v2Date(effectiveEnd) : "Atual") : "—"}</dd></div>
          <div><dt>Vigência do RGA</dt><dd>{start ? v2Date(start) + " – " + (effectiveEnd ? v2Date(effectiveEnd) : "Atual") : "—"}</dd></div>
          <div><dt>{cargo?.comissionado ? "Valores reajustados" : "Quantidade de valores da matriz"}</dt><dd>{simulation ? previewRows.length : "—"}</dd></div>
          <div><dt>Percentual da RGA</dt><dd>{percent || "—"}</dd></div>
          <div><dt>Reflexo nos servidores</dt><dd><span className="tv-status vigente">Automático</span></dd></div>
          <div><dt>Status da RGA</dt><dd><span className={"tv-status " + (applied ? "vigente" : simulation ? "futura" : "sem-tabela")}>{applied ? "Aplicada" : stale ? "Simulação desatualizada" : simulation ? "Simulação realizada" : "Não simulada"}</span></dd></div>
        </dl></aside>
      </div>
      {applied && <div className="tv-save-success" role="status"><i className="pi pi-check-circle" /><span>RGA aplicado com sucesso. A nova versão V{simulation?.record.version} foi salva.</span></div>}
      {stale && <div className="tv-rga-alert-error" role="alert"><i className="pi pi-exclamation-circle" /><span>As informações utilizadas na última simulação foram alteradas. Realize uma nova simulação do RGA para atualizar os resultados.</span></div>}
      {error && <div className="tv-rga-alert-error" role="alert"><i className="pi pi-exclamation-circle" /><span>{error}</span></div>}
      <div className="tv-rga-preview"><h4>Pré-visualização dos novos valores</h4><div className="tv-scroll">
        <table><thead><tr><th>{cargo?.comissionado ? "Referência" : "Nível"}</th>{!cargo?.comissionado && <th>Classe</th>}<th>Valor base</th><th>Percentual RGA</th><th>Valor com RGA</th><th>Diferença</th></tr></thead>
          <tbody>{simulation ? previewRows.map((row) => <tr key={row.key}><td>{row.nivel}</td>{!cargo?.comissionado && <td>{row.classe}</td>}<td>{row.before}</td><td>{percent}</td><td>{row.after}</td><td>+ {difference(row.before, row.after || row.before)}</td></tr>)
            : <tr><td colSpan={cargo?.comissionado ? 5 : 6} className="tv-rga-empty">Execute a simulação para visualizar os novos valores.</td></tr>}</tbody>
        </table>
      </div></div>
      <div className="tv-rga-rules"><h4>Regras do reflexo automático</h4><div>
        <p><i className="pi pi-calendar" /><span>A nova versão da tabela de vencimentos passa a vigorar a partir da data de início informada.</span></p>
        <p><i className="pi pi-users" /><span>{cargo?.comissionado ? "O subsídio será reajustado e o valor da gratificação será recalculado pelo percentual vigente." : "Todos os servidores vinculados a esta tabela terão o reflexo automático em sua remuneração-base conforme o respectivo Nível e Classe."}</span></p>
        <p><i className="pi pi-file" /><span>Rubricas adicionais que possuam regra própria de incidência de RGA deverão ser tratadas separadamente.</span></p>
      </div></div>
    </section>}
    <div className="tv-form-actions">
      <BotaoVoltarSeplag type="button" label="Voltar" onClick={() => nav(V2_BASE + "?cargo=" + source.cargoId)} />
      {tab === "rga" && <div className="tv-form-actions-primary"><BotaoSalvarSeplag type="button" label="Finalizar" disabled={!applied || stale} onClick={finish} /></div>}
    </div>
    {confirm && simulation && <div className="tv-profile-list-overlay" role="presentation">
      <section className="tv-version-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="v2-individual-rga-confirm">
        <header><div className="tv-version-confirm-icon" aria-hidden="true"><i className="pi pi-percentage" /></div><div><h2 id="v2-individual-rga-confirm">Aplicar RGA</h2><p>Confirme a geração da nova versão da tabela.</p></div><button type="button" className="tv-version-confirm-close" aria-label="Fechar" onClick={() => setConfirm(false)}><i className="pi pi-times" /></button></header>
        <div className="tv-version-confirm-content"><p>{cargo?.comissionado ? "O RGA será aplicado ao subsídio vigente do cargo comissionado e a gratificação será recalculada pelo percentual vigente." : "O RGA será aplicado aos valores desta versão da tabela de vencimentos."} A versão anterior permanecerá disponível no histórico. Deseja continuar?</p></div>
        <footer><BotaoVoltarSeplag type="button" label="Cancelar" onClick={() => setConfirm(false)} /><BotaoSalvarSeplag type="button" label="Confirmar aplicação" onClick={apply} /></footer>
      </section>
    </div>}
  </V2PageFrame>;
}
