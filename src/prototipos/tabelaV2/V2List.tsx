import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { V2CreateTableModal } from "./V2CreateTableModal";
import { V2HistoryModal } from "./V2History";
import { V2PageFrame, V2RecordStatus, V2Status, V2Tags } from "./V2Shared";
import { V2_BASE, V2_CARGOS, v2Date, v2Hours, v2EditalNames, v2TableDisplayId, v2Latest, v2CanVersion, v2Read, v2RecordTypes, v2Status, type V2Cargo, type V2Record } from "./v2Store";

import { V2CoveragePanel, V2CoverageSummary } from "./V2Coverage";
import { v2Coverage, V2_COVERAGE_TOOLTIP } from "./v2CoverageModel";


export function V2List() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [records, setRecords] = useState(v2Read);
  const [createTable, setCreateTable] = useState<{ cargo: V2Cargo; jornada?: string } | null>(null);
  const openCreateTable = (cargo: V2Cargo, jornada?: string) => {
    if (cargo.comissionado) {
      const query = new URLSearchParams({ cargo: String(cargo.id) });
      const selectedJourney = jornada || cargo.jornadas[0];
      if (selectedJourney) query.set("jornada", selectedJourney);
      nav(V2_BASE + "/novo?" + query.toString());
      return;
    }
    setCreateTable({ cargo, jornada });
  };
  useEffect(() => {
    const refresh = () => setRecords(v2Read());
    window.addEventListener("v2-records-updated", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(refresh, 60000);
    return () => {
      window.removeEventListener("v2-records-updated", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      window.clearInterval(timer);
    };
  }, []);
  const [cargoFilter, setCargoFilter] = useState("");
  const [expanded, setExpanded] = useState<number | null>(Number(params.get("cargo")) || null);
  const [menu, setMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [modal, setModal] = useState<{ record: V2Record; mode: "history" } | null>(null);
  const latest = v2Latest(records);
  const missingJourneys = (cargo: V2Cargo) => cargo.jornadas.filter(item =>
    !latest.some(record => record.cargoId === cargo.id && record.kind === "padrao" && record.jornada === item));
  const cargos = V2_CARGOS.filter(cargo => !cargoFilter || cargo.id === Number(cargoFilter));
  const rows = (cargo: V2Cargo, kind: "padrao" | "excecao") =>
    latest.filter(record => record.cargoId === cargo.id && record.kind === kind);
  const originTag = (record: V2Record) => {
    const reference = records.find((item) => item.id === record.proporcional?.referenciaId) ||
      records.find((item) => record.referencia === item.tableId + " V" + item.version);
    const hours = v2Hours(reference?.jornada || record.referencia?.match(/\d+\s*(?:horas|h)\b/)?.[0] || "");
    const proportional = record.origem === "Proporcional";
    const tone = record.origem === "Referência" ? " is-reference" : proportional ? " is-proportional" : record.origem === "Ajustada manualmente" ? " is-adjusted" : record.origem === "RGA em lote" ? " rga" : "";
    return <span className={"tv-origin-tag" + tone} title={record.referencia}>
      {proportional && hours ? "Proporcional " + hours + "h" : record.origem}
    </span>;
  };
  const actions = (record: V2Record) => <div className="v2-actions tv-journey-actions tv-journey-split-actions">
    <button type="button" className="tv-journey-view-button" title="Visualizar" aria-label={"Visualizar " + record.tableId} onClick={() => nav(V2_BASE + "/visualizar?registro=" + encodeURIComponent(record.id))}><i className="pi pi-eye" /></button>
    <button type="button" className="tv-journey-history-button" title="Mais ações" aria-label={"Mais ações de " + record.tableId} aria-expanded={menu === record.id}
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        setMenuPosition({ top: box.bottom + 3, left: Math.max(8, box.right - 155) });
        setMenu(menu === record.id ? null : record.id);
      }}><i className="pi pi-chevron-down" /></button>
    {menu === record.id && createPortal(<div className="v2-action-menu" style={{ top: menuPosition.top, left: menuPosition.left }}>
      {v2Status(record) === "Vigente" && v2CanVersion(record) && <button type="button" onClick={() => nav(V2_BASE + "/versionar?registro=" + record.id)}><i className="pi pi-copy" /> Versionar</button>}
      {v2Status(record) === "Vigente" && <button type="button" onClick={() => { setMenu(null); nav(V2_BASE + "/aplicar-rga?registro=" + record.id); }}><i className="pi pi-percentage" /> Aplicar RGA</button>}
      <button type="button" onClick={() => { setMenu(null); setModal({ record, mode: "history" }); }}><i className="pi pi-history" /> Histórico</button>
    </div>, document.body)}
  </div>;
  return <V2PageFrame>
    {params.get("salvo") && <p className="v2-success tv-save-success" role="status"><i className="pi pi-check-circle" /> Tabela de Vencimentos cadastrada com sucesso.</p>}
    {params.get("rga") && <p className="v2-success tv-save-success" role="status"><i className="pi pi-check-circle" /> RGA aplicado com sucesso.{params.get("quantidade") && " " + params.get("quantidade") + " nova(s) versão(ões) foram geradas."}</p>}
    <div className="v2-list-actions">
      <div className="v2-filters">
        <label>Código do Cargo ou Nome do Cargo<select value={cargoFilter} onChange={(event) => setCargoFilter(event.target.value)}><option value="">Todos</option>{V2_CARGOS.map((cargo) => <option key={cargo.id} value={cargo.id}>{String(cargo.id).padStart(4, "0") + " - " + cargo.nome}</option>)}</select></label>
        <button type="button" className="v2-button-primary v2-clear-filters" onClick={() => setCargoFilter("")}><i className="pi pi-refresh" aria-hidden="true" /> Limpar filtros</button>
      </div>
      <div className="v2-filter-buttons">
        <button type="button" className="v2-button-primary v2-rga-lote" onClick={() => nav(V2_BASE + "/rga-em-lote")}><i className="pi pi-percentage" /> Aplicar RGA em lote</button>
      </div>
    </div>
    <div className="v2-table-wrap prototype-ingressos-teste-table-shell v2-main-table-shell"><table className="v2-table v2-cargos tv-cargo-accordion-table">
      <thead><tr><th>Código do cargo</th><th>Cargo</th><th>Comissionado</th><th>Jornadas</th><th className="v2-link-count-column">Qtd. Tipos de Vínculo</th><th className="v2-table-count-column">Qtd. Tabelas</th><th className="v2-coverage-column">Cobertura das Tabelas<span className="v2-coverage-help" tabIndex={0} title={V2_COVERAGE_TOOLTIP} aria-label={V2_COVERAGE_TOOLTIP}><i className="pi pi-info-circle" aria-hidden="true" /></span></th><th>Ação</th></tr></thead>
      <tbody>{cargos.map((cargo) => <Fragment key={cargo.id}>
        <tr><td>{String(cargo.id).padStart(4, "0")}</td><td>{cargo.nome}</td>
          <td><span className={"v2-neutral-tag v2-commission-tag " + (cargo.comissionado ? "is-commissioned" : "is-not-commissioned")}>{cargo.comissionado ? "Comissionado" : "Não comissionado"}</span></td>
          <td><span className="v2-neutral-tag">{cargo.jornadas.length} {cargo.jornadas.length === 1 ? "jornada" : "jornadas"}</span></td>
          <td className="v2-link-count-cell"><span className="v2-neutral-tag">{new Set(cargo.vinculos.map((link) => link.tipo)).size}</span></td>
          <td className="v2-table-count-cell"><span className="v2-neutral-tag" title="Total de tabelas cadastradas, sem contar versões.">{latest.filter((record) => record.cargoId === cargo.id).length}</span></td>
          <td><V2CoverageSummary coverage={v2Coverage(cargo, records)} /></td>
          <td><button type="button" className="v2-expand tv-cargo-expand" aria-label={expanded === cargo.id ? "Recolher cargo" : "Expandir cargo"} aria-expanded={expanded === cargo.id}
            onClick={() => setExpanded(expanded === cargo.id ? null : cargo.id)}><i className={"pi " + (expanded === cargo.id ? "pi-chevron-up" : "pi-chevron-down")} /></button></td>
        </tr>
        {expanded === cargo.id && <tr className="v2-expanded-row"><td colSpan={8}><div className="v2-expanded">
          <V2CoveragePanel cargo={cargo} records={records} />
          <div className="v2-section-head"><h3>Tabelas cadastradas para o cargo</h3><button type="button" className="v2-button-primary" onClick={() => openCreateTable(cargo)}><i className="pi pi-plus" /> Cadastrar Tabela</button></div>
          <div className="v2-table-wrap"><table className="v2-table v2-inner" aria-label={"Tabelas cadastradas para " + cargo.nome}><thead><tr><th className="v2-id-cell">ID</th><th>Jornada</th><th>Tipo(s) de Vínculo</th>{!cargo.comissionado && <th>Edital</th>}<th>Versão</th><th>Ano</th><th>Vigência</th><th>Situação</th><th>Origem</th><th>Ações</th></tr></thead>
            <tbody>{cargo.jornadas.map((availableJourney) => <Fragment key={availableJourney}>{rows(cargo, "padrao").filter((record) => record.jornada === availableJourney).map((record) => <tr key={record.id}><td className="v2-id-cell">{v2TableDisplayId(record)}</td>
              <td><span className={"tv-journey-tag " + (record.jornada === "20 horas" ? "tone-0" : record.jornada === "30 horas" ? "tone-1" : record.jornada === "40 horas" ? "tone-2" : "tone-3")}>{record.jornada}</span></td><td><V2Tags tipos={v2RecordTypes(record)} /></td>{!cargo.comissionado && <td>{record.editais?.length ? <V2Tags tipos={record.editais.map((id) => v2EditalNames([id]))} itemLabel="editais" /> : "—"}</td>}<td>{"V" + record.version}</td><td>{record.inicio.slice(0, 4)}</td>
              <td>{v2Date(record.inicio)} – {record.fim ? v2Date(record.fim) : "Atual"}</td>
              <td><V2RecordStatus record={record} /></td><td>{originTag(record)}</td><td>{actions(record)}</td>
            </tr>)}
            {missingJourneys(cargo).filter((item) => item === availableJourney).map((item) => <tr key={"empty-" + item}><td className="v2-id-cell">—</td>
              <td><span className={"tv-journey-tag " + (item === "20 horas" ? "tone-0" : item === "30 horas" ? "tone-1" : item === "40 horas" ? "tone-2" : "tone-3")}>{item}</span></td>
              <td>—</td>{!cargo.comissionado && <td>—</td>}<td>—</td><td>—</td><td>—</td><td><V2Status value="Sem tabela cadastrada" /></td><td>—</td>
              <td><button type="button" className="v2-button-primary v2-journey-create" title="Cadastrar Tabela"
                aria-label={"Cadastrar tabela para " + item + " do cargo " + cargo.nome}
                onClick={() => openCreateTable(cargo, item)}><i className="pi pi-plus" /></button></td>
            </tr>)}
            </Fragment>)}
            {!rows(cargo, "padrao").length && !missingJourneys(cargo).length && <tr><td colSpan={cargo.comissionado ? 9 : 10} className="v2-empty">{cargo.comissionado ? "Nenhuma tabela encontrada para os filtros informados." : "Sem tabela cadastrada."}</td></tr>}</tbody></table></div>
          <div className="v2-exception-create tv-exception-register-action"><button type="button" className="v2-button-secondary tv-exception-create" onClick={() => nav(V2_BASE + "/excecao/nova?cargo=" + cargo.id)}><i className="pi pi-plus" /> Cadastrar Exceção</button></div>
          <div className="v2-section-head"><h3>Exceções cadastradas</h3></div>
          <div className="v2-table-wrap"><table className="v2-table v2-inner"><thead><tr><th className="v2-id-cell">ID</th><th>Tipo(s) de Vínculo</th>{!cargo.comissionado && <th>Edital</th>}<th>Perfil Profissional</th><th>Local de Lotação</th><th>Horas trabalhadas</th><th>Versão</th><th>Ano</th><th>Vigência</th><th>Situação</th><th>Ações</th></tr></thead>
            <tbody>{rows(cargo, "excecao").map((record) => <tr key={record.id}><td className="v2-id-cell">{v2TableDisplayId(record)}</td>
              <td><V2Tags tipos={v2RecordTypes(record)} /></td>{!cargo.comissionado && <td>{record.editais?.length ? <V2Tags tipos={record.editais.map((id) => v2EditalNames([id]))} itemLabel="editais" /> : "—"}</td>}<td>{record.perfil || "Todos"}</td><td>{record.local || "Todos"}</td><td>{record.horasTrabalhadas || "Todas"}</td>
              <td>{"V" + record.version}</td><td>{record.inicio.slice(0, 4)}</td><td>{v2Date(record.inicio)} – {record.fim ? v2Date(record.fim) : "Atual"}</td>
              <td><V2RecordStatus record={record} /></td><td>{actions(record)}</td>
            </tr>)}{!rows(cargo, "excecao").length && <tr><td colSpan={cargo.comissionado ? 10 : 11} className="v2-empty">Nenhuma exceção cadastrada.</td></tr>}</tbody></table></div>
        </div></td></tr>}
      </Fragment>)}</tbody></table></div>
    {!cargos.length && <p className="v2-empty">Nenhum cargo encontrado para os filtros informados.</p>}
    {createTable && <V2CreateTableModal cargo={createTable.cargo} records={records} initialJourney={createTable.jornada} onClose={() => setCreateTable(null)} onContinue={(jornada, referenceId) => {
      const query = new URLSearchParams({ cargo: String(createTable.cargo.id), jornada });
      if (referenceId) query.set("referencia", referenceId);
      nav(V2_BASE + "/novo?" + query.toString());
    }} />}
    {modal && <V2HistoryModal record={modal.record} records={records} cargo={V2_CARGOS.find((item) => item.id === modal.record.cargoId)!} onClose={() => setModal(null)} />}
  </V2PageFrame>;
}

