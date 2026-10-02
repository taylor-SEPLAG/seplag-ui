import { Fragment, useEffect, useState } from "react";
import { V2RgaHistoryDetails } from "./V2RgaHistoryDetails";
import { V2CommissionedValuesSummary } from "./V2CommissionedValues";
import { V2MatrixEditor } from "./V2Fields";
import { V2Status } from "./V2Shared";
import { v2Date, v2CommissionedViewValues, v2TableDisplayId, v2EditalNames, v2Structure, v2Status, v2Versions, type V2Cargo, type V2Record } from "./v2Store";
import "../tabelaVencimentos/tabelaVencimentosSpacing.css";

function Values({ record, records }: { record: V2Record; records: V2Record[] }) {
  if (record.remuneracao) {
    const values = v2CommissionedViewValues(records, record);
    return <div className="v2-history-commission-summary"><V2CommissionedValuesSummary subsidy={values.subsidy} percent={values.percent} /></div>;
  }
  return v2Structure(record) === "fixo"
    ? <div className="v2-commission-readonly"><strong>Valor Fixo</strong><span>{record.matrix.rows[0]?.values[0] || "—"}</span></div>
    : <V2MatrixEditor matrix={record.matrix} readOnly />;
}

export function V2HistoryModal({ record, records, cargo, onClose }: {
  record: V2Record; records: V2Record[]; cargo: V2Cargo; onClose: () => void;
}) {
  const ownVersions = v2Versions(records, record.tableId);
  const priorVersions: V2Record[] = [];
  const visited = new Set(ownVersions.map((item) => item.id));
  let previousId = record.previousId;
  while (previousId) {
    const previous = records.find((item) => item.id === previousId);
    if (!previous || priorVersions.some((item) => item.id === previous.id)) break;
    if (!visited.has(previous.id)) priorVersions.push(previous);
    previousId = previous.previousId;
  }
  const versions = [...ownVersions, ...priorVersions].sort((a, b) => b.version - a.version || b.inicio.localeCompare(a.inicio));
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"valores" | "info" | "rga">("valores");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const pages = Math.max(1, Math.ceil(versions.length / pageSize));
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { onClose(); } };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [onClose]);
  const changePage = (next: number) => { setPage(next); setExpandedId(null); };
  return <div className="tv-profile-list-overlay" role="presentation" onMouseDown={onClose}>
    <section className="tv-journey-history-modal v2-version-history" role="dialog" aria-modal="true" aria-labelledby="v2-history-title" onMouseDown={(event) => event.stopPropagation()}>
      <header><div><h2 id="v2-history-title">{record.kind === "excecao" ? "Histórico da exceção" : "Histórico da jornada"}</h2>
        <p><strong>{cargo.nome}</strong> · {v2TableDisplayId(record)} · {record.kind === "padrao" ? "Jornada: " + record.jornada : (record.perfil || "Todos os perfis") + " · " + (record.local || "Todos os locais")}</p>
      </div><button type="button" aria-label="Fechar" onClick={onClose}><i className="pi pi-times" /></button></header>
      <div className="tv-journey-history-divider" />
      <div className="tv-journey-history-toolbar"><strong>Versões</strong><span>{versions.length} {versions.length === 1 ? "registro" : "registros"}</span></div>
      <div className="tv-scroll tv-journey-history-grid-wrap">
        <table className="tv-journey-history-grid" aria-label="Versões da tabela de vencimentos">
          <thead><tr>{["Versão", "Ano", "Início da vigência", "Fim da vigência", "Origem da alteração", "Situação", "Alterado por", "Última alteração", "Ações"].map((label) => <th key={label}>{label}</th>)}</tr></thead>
          <tbody>{versions.slice(page * pageSize, (page + 1) * pageSize).map((version) => {
            const expanded = expandedId === version.id;
            const rga = version.events.find((event) => event.label === "RGA aplicado");
            const origin = version.origem === "RGA" ? "RGA" : version.origem === "Manual" ? version.previousId ? "Alteração manual" : "Cadastro inicial" : version.origem;
            const lastEvent = [...version.events].sort((a, b) => b.when.localeCompare(a.when))[0];
            const lastWhen = lastEvent?.when || version.criadoEm;
            const linkEnd = version.links.length && version.links.every((link) => link.fim) ? version.links.map((link) => link.fim!).sort().at(-1) : undefined;
            const end = linkEnd && (!version.fim || linkEnd < version.fim) ? linkEnd : version.fim;
            const lastActor = lastEvent?.actor || version.responsavel;
            const reference = records.find((item) => item.id === version.proporcional?.referenciaId);
            const info = [
              ["Cargo", cargo.nome], ["Carreira", cargo.carreira], ["Identificador da tabela", v2TableDisplayId(version)],
              ...(version.kind === "padrao" ? [["Jornada", version.jornada || "—"]] : [["Perfil Profissional", version.perfil || "Todos"], ["Local de Lotação", version.local || "Todos"], ["Horas trabalhadas", version.horasTrabalhadas || "Todas"]]),
              ["Tipo(s) de Vínculo", version.links.map((link) => link.tipo).join(", ")],
              ["Edital / Processo Seletivo", v2EditalNames(version.editais || []) || "—"],
              ...(cargo.comissionado ? [["Estrutura de Vencimento", v2Structure(version) === "fixo" ? "Valor Fixo" : "Tabela por Nível e Classe"]] : []),
              ["Data início da vigência", v2Date(version.inicio)], ["Data fim da vigência", v2Date(end)],
              ["Responsável pela última alteração", lastActor], ["Data e hora da última alteração", new Date(lastWhen).toLocaleDateString("pt-BR") + " às " + new Date(lastWhen).toLocaleTimeString("pt-BR")],
              ["Origem da alteração", origin], ["Base legal", version.baseLegal || "—"],
              ...(version.proporcional ? [["Tabela de referência utilizada", reference ? reference.jornada + " · V" + reference.version : version.referencia || "—"], ["Percentual aplicado", version.proporcional.percentual.toLocaleString("pt-BR") + "%"], ["Ajuste manual", version.origem === "Ajustada manualmente" ? "Sim" : "Não"]] : []),
            ];
            return <Fragment key={version.id}>
              <tr className={expanded ? "tv-history-version-open" : undefined}>
                <td><span className="tv-history-version-label">{"V" + version.version}</span></td><td>{version.inicio.slice(0, 4)}</td>
                <td>{v2Date(version.inicio)}</td><td>{v2Date(end)}</td>
                <td><span className={"tv-history-origin-tag" + (rga ? " rga" : "")}>{origin}{rga?.percent !== undefined ? " · " + rga.percent.toLocaleString("pt-BR") + "%" : ""}</span></td>
                <td><V2Status value={v2Status(version)} /></td><td>{lastActor}</td><td>{new Date(lastWhen).toLocaleDateString("pt-BR") + " às " + new Date(lastWhen).toLocaleTimeString("pt-BR")}</td>
                <td><button type="button" className="tv-history-expand-button" aria-label={(expanded ? "Recolher" : "Expandir") + " detalhes da versão V" + version.version} aria-expanded={expanded} onClick={() => { setExpandedId(expanded ? null : version.id); setTab("valores"); }}><i className={"pi " + (expanded ? "pi-angle-up" : "pi-angle-down")} /></button></td>
              </tr>
              {expanded && <tr className="tv-history-version-detail-row"><td colSpan={9}><section className="tv-history-version-detail">
                <header><h3>Tabela de vencimentos — {version.inicio.slice(0, 4)}</h3><div className="tv-history-detail-tags">
                  {rga && <span className="tv-history-origin-tag rga">{version.origem === "RGA em lote" ? "RGA em lote" : "RGA"} · {rga.percent?.toLocaleString("pt-BR") || "—"}%</span>}<V2Status value={v2Status(version)} />
                </div></header>
                <nav className="tv-tabs" aria-label={"Detalhes da versão " + "V" + version.version}>
                  <button type="button" className={tab === "valores" ? "active" : ""} onClick={() => setTab("valores")}>{version.remuneracao ? "Parâmetros remuneratórios" : "Tabela de valores"}</button>
                  <button type="button" className={tab === "info" ? "active" : ""} onClick={() => setTab("info")}>Informações adicionais</button>
                  {rga && <button type="button" className={tab === "rga" ? "active" : ""} onClick={() => setTab("rga")}>RGA</button>}
                </nav>
                {tab === "valores" ? <div className="tv-history-matrix"><Values record={version} records={records} /></div> : tab === "info" ? <div className="tv-history-additional-info">
                  <div className="tv-history-info-grid">{info.map(([label, value]) => <div key={label} className="tv-history-data-item"><small>{label}</small><strong>{value}</strong></div>)}</div>
                  <div className="tv-history-info-observation"><small>Observação</small><p>{version.observacao || "—"}</p></div>
                </div> : rga && <V2RgaHistoryDetails version={version} previous={records.find((item) => item.id === version.previousId)} audit={rga} />}
              </section></td></tr>}
            </Fragment>;
          })}</tbody>
        </table>
        <div className="tv-journey-history-pager" aria-label="Paginação do histórico">
          <button type="button" disabled={page === 0} aria-label="Primeira página" onClick={() => changePage(0)}><i className="pi pi-angle-double-left" /></button>
          <button type="button" disabled={page === 0} aria-label="Página anterior" onClick={() => changePage(page - 1)}><i className="pi pi-angle-left" /></button>
          <span aria-current="page">{page + 1}</span>
          <button type="button" disabled={page === pages - 1} aria-label="Próxima página" onClick={() => changePage(page + 1)}><i className="pi pi-angle-right" /></button>
          <button type="button" disabled={page === pages - 1} aria-label="Última página" onClick={() => changePage(pages - 1)}><i className="pi pi-angle-double-right" /></button>
          <select aria-label="Itens por página" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); changePage(0); }}>{[10, 20, 50].map((size) => <option key={size}>{size}</option>)}</select>
        </div>
      </div>

    </section>
  </div>;
}
