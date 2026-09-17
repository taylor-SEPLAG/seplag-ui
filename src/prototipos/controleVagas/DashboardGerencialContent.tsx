import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useControleVagasStore } from "./controleVagasStore";
import { useControleVagasStore as useBolsistasStore } from "../controleVagasResidentes/controleVagasStore";
import { listarCargosBolsistas } from "../controleVagasResidentes/cargosBolsistasStore";
import { listarQuadrosComissionados, type ItemEstruturaComissionadaSalvo } from "../controleVagasComissionados/novoQuadroComissionadoStore";
import { listarQuadrosTemporarios } from "../controleVagasTemporarios/novoQuadroTemporarioStore";
import { listarCargosControleVagasTemporarias } from "../controleVagasTemporarios/cargosTemporariosStore";
import "./dashboardConsolidado.css";

type Tipo = "EFETIVOS" | "COMISSIONADOS" | "TEMPORARIOS" | "BOLSISTAS";
type Situacao = "ATIVO" | "EXTINTO" | "ENCERRADO";
type Resumo = { id: Tipo; nome: string; rota: string; quadros: number; ativos: number; extintos: number; encerrados: number; previstas: number; reais?: number; disponiveis: number; emOcupacao: number; ocupadas: number; pendentes?: number; orgaos: string[]; cargos?: number };

const tipos: { id: Tipo; nome: string }[] = [
  { id: "EFETIVOS", nome: "Vagas Efetivos" }, { id: "COMISSIONADOS", nome: "Vagas Comissionados" },
  { id: "TEMPORARIOS", nome: "Vagas Temporários" }, { id: "BOLSISTAS", nome: "Vagas Bolsistas" },
];
const rotas: Record<Tipo, string> = {
  EFETIVOS: "/prototipos/sigep/controle-vagas/efetivos/quadro-autorizado",
  COMISSIONADOS: "/prototipos/sigep/controle-vagas/comissionados/quadro-autorizado",
  TEMPORARIOS: "/prototipos/sigep/controle-vagas/temporarios/quadro-autorizado",
  BOLSISTAS: "/prototipos/sigep/controle-vagas/bolsistas/quadro-autorizado",
};
const n = (v: number) => v.toLocaleString("pt-BR");
const status = (q: { situacaoVigencia?: string; situacao?: string }): Situacao => {
  const v = q.situacaoVigencia ?? q.situacao ?? "ATIVO";
  return v === "EXTINTO" || v === "Extinto" ? "EXTINTO" : v === "ENCERRADO" || v === "Encerrada" || v === "Encerrado" ? "ENCERRADO" : "ATIVO";
};
function statusQuadros(qs: Array<{ situacaoVigencia?: string; situacao?: string }>) {
  return qs.reduce((a, q) => { a[status(q).toLowerCase() as "ativo" | "extinto" | "encerrado"] += 1; return a; }, { ativo: 0, extinto: 0, encerrado: 0 });
}
function dotacoes(itens: ItemEstruturaComissionadaSalvo[]): { vagas: number; cargos: number } {
  return itens.reduce((a, item) => {
    const local = item.dotacoes.reduce((s, d) => ({ vagas: s.vagas + d.cargos + d.funcoes, cargos: s.cargos + d.cargos + d.funcoes }), { vagas: 0, cargos: 0 });
    const filhos = dotacoes(item.subitens);
    return { vagas: a.vagas + local.vagas + filhos.vagas, cargos: a.cargos + local.cargos + filhos.cargos };
  }, { vagas: 0, cargos: 0 });
}

export function DashboardGerencialContent() {
  const efetivos = useControleVagasStore();
  const bolsistas = useBolsistasStore();
  const navigate = useNavigate();
  const [selecionados, setSelecionados] = useState<Tipo[]>(tipos.map((t) => t.id));
  const [orgao, setOrgao] = useState("");
  const [situacao, setSituacao] = useState<Situacao | "">("");

  const dados = useMemo<Resumo[]>(() => {
    const qe = efetivos.quadros.filter((q) => q.tipoQuadro === "Efetivo");
    const ide = new Set(qe.map((q) => q.id)); const ve = efetivos.vagas.filter((v) => ide.has(v.quadroAutorizadoId));
    const idsVagasEfetivas = new Set(ve.map((v) => v.id));
    const ce = new Set(efetivos.comprometimentos.filter((x) => x.situacao === "ATIVO" && idsVagasEfetivas.has(x.vagaId)).map((x) => x.vagaId));
    const oe = new Set(efetivos.ocupacoes.filter((x) => x.situacao === "ATIVA" && idsVagasEfetivas.has(x.vagaId)).map((x) => x.vagaId)); const se = statusQuadros(qe);
    const qb = bolsistas.quadros.filter((q) => q.codigo.startsWith("QAB-"));
    const idb = new Set(qb.map((q) => q.id)); const vb = bolsistas.vagas.filter((v) => idb.has(v.quadroAutorizadoId));
    const idsVagasBolsistas = new Set(vb.map((v) => v.id));
    const cb = new Set(bolsistas.comprometimentos.filter((x) => x.situacao === "ATIVO" && idsVagasBolsistas.has(x.vagaId)).map((x) => x.vagaId));
    const ob = new Set(bolsistas.ocupacoes.filter((x) => x.situacao === "ATIVA" && idsVagasBolsistas.has(x.vagaId)).map((x) => x.vagaId)); const sb = statusQuadros(qb);
    const qc = listarQuadrosComissionados(); const sc = statusQuadros(qc);
    const tc = qc.reduce((a, q) => { const x = dotacoes(q.niveis.flatMap((nivel) => nivel.itens)); return { vagas: a.vagas + x.vagas, cargos: a.cargos + x.cargos }; }, { vagas: 0, cargos: 0 });
    const qt = listarQuadrosTemporarios(); const st = statusQuadros(qt);
    const pt = qt.reduce((a, q) => a + q.cargos.reduce((s, c) => s + c.quantidadeVagas, 0), 0);
    return [
      { id: "EFETIVOS", nome: "Efetivos", rota: rotas.EFETIVOS, quadros: qe.length, ativos: se.ativo, extintos: se.extinto, encerrados: se.encerrado, previstas: qe.reduce((a, q) => a + q.autorizadas, 0), disponiveis: ve.filter((v) => v.estado === "DISPONIVEL" && !ce.has(v.id)).length, emOcupacao: ce.size, ocupadas: oe.size, pendentes: ve.filter((v) => !v.orgaoDistribuicaoInicial && v.orgaoTitular === "ESTADO DE MATO GROSSO").length, orgaos: [...new Set(qe.map((q) => q.orgao).filter(Boolean))] },
      { id: "COMISSIONADOS", nome: "Comissionados", rota: rotas.COMISSIONADOS, quadros: qc.length, ativos: sc.ativo, extintos: sc.extinto, encerrados: sc.encerrado, previstas: tc.vagas, disponiveis: tc.vagas, emOcupacao: 0, ocupadas: 0, orgaos: [...new Set(qc.map((q) => q.orgao).filter(Boolean))], cargos: tc.cargos },
      { id: "TEMPORARIOS", nome: "Temporários", rota: rotas.TEMPORARIOS, quadros: qt.length, ativos: st.ativo, extintos: st.extinto, encerrados: st.encerrado, previstas: pt, reais: qt.reduce((a, q) => a + q.vagasReais, 0), disponiveis: pt, emOcupacao: 0, ocupadas: 0, orgaos: [...new Set(qt.map((q) => String((q.certame as { orgaoResponsavel?: string; orgao?: string }).orgaoResponsavel ?? (q.certame as { orgao?: string }).orgao ?? "")).filter(Boolean))], cargos: listarCargosControleVagasTemporarias().length },
      { id: "BOLSISTAS", nome: "Bolsistas", rota: rotas.BOLSISTAS, quadros: qb.length, ativos: sb.ativo, extintos: sb.extinto, encerrados: sb.encerrado, previstas: qb.reduce((a, q) => a + q.autorizadas, 0), disponiveis: vb.filter((v) => v.estado === "DISPONIVEL" && !cb.has(v.id)).length, emOcupacao: cb.size, ocupadas: ob.size, pendentes: vb.filter((v) => !v.orgaoDistribuicaoInicial && v.orgaoTitular === "ESTADO DE MATO GROSSO").length, orgaos: [...new Set(qb.map((q) => q.orgao).filter(Boolean))], cargos: listarCargosBolsistas().length },
    ];
  }, [efetivos, bolsistas]);

  const orgaos = [...new Set(dados.flatMap((d) => d.orgaos))].sort();
  const visiveis = dados.filter((d) => selecionados.includes(d.id) && (!orgao || d.orgaos.includes(orgao)) && (!situacao || d[situacao.toLowerCase() as "ativos" | "extintos" | "encerrados"] > 0));
  const soma = (campo: keyof Pick<Resumo, "quadros" | "previstas" | "reais" | "disponiveis" | "emOcupacao" | "ocupadas" | "pendentes">) => visiveis.reduce((a, d) => a + (d[campo] ?? 0), 0);
  const total = soma("previstas"); const pendentes = visiveis.some((d) => d.pendentes !== undefined); const temporarios = visiveis.some((d) => d.id === "TEMPORARIOS");
  const alternar = (tipo: Tipo) => setSelecionados((atual) => atual.includes(tipo) ? atual.length === 1 ? atual : atual.filter((x) => x !== tipo) : [...atual, tipo]);
  const limpar = () => { setSelecionados(tipos.map((t) => t.id)); setOrgao(""); setSituacao(""); };

  return <main className="controle-vagas-dashboard">
    <section className="controle-vagas-dashboard-header"><span>CONTROLE DE VAGAS</span><h1>Dashboard de vagas</h1><p>Acompanhe os quadros e as vagas das modalidades selecionadas.</p></section>
    <section className="controle-vagas-dashboard-card controle-vagas-dashboard-filters">
      <div className="controle-vagas-dashboard-field controle-vagas-dashboard-types"><span>Tipos de vagas</span><div>{tipos.map((tipo) => <label key={tipo.id}><input type="checkbox" checked={selecionados.includes(tipo.id)} onChange={() => alternar(tipo.id)} /><span>{tipo.nome}</span></label>)}</div></div>
      <label className="controle-vagas-dashboard-field"><span>Órgão</span><select value={orgao} onChange={(e) => setOrgao(e.target.value)}><option value="">Todos</option>{orgaos.map((x) => <option key={x}>{x}</option>)}</select></label>
      <label className="controle-vagas-dashboard-field"><span>Situação do quadro</span><select value={situacao} onChange={(e) => setSituacao(e.target.value as Situacao | "")}><option value="">Todas</option><option value="ATIVO">Ativo</option><option value="EXTINTO">Extinto</option><option value="ENCERRADO">Encerrado</option></select></label>
      <button type="button" className="controle-vagas-dashboard-clear" onClick={limpar}><i className="pi pi-refresh" /> Limpar</button>
    </section>
    <section className="controle-vagas-dashboard-kpis"><Kpi label="Quadros cadastrados" value={soma("quadros")} icon="pi pi-file" tone="blue" /><Kpi label="Vagas previstas/autorizadas" value={total} icon="pi pi-verified" tone="blue" /><Kpi label="Vagas disponíveis" value={soma("disponiveis")} icon="pi pi-check-circle" tone="green" /><Kpi label="Vagas em ocupação" value={soma("emOcupacao")} icon="pi pi-user-plus" tone="orange" /><Kpi label="Vagas ocupadas" value={soma("ocupadas")} icon="pi pi-users" tone="purple" />{pendentes && <Kpi label="Pendentes de distribuição" value={soma("pendentes")} icon="pi pi-share-alt" tone="orange" />}{temporarios && <Kpi label="Vagas temporárias reais" value={soma("reais")} icon="pi pi-list" tone="blue" />}</section>
    <section className="controle-vagas-dashboard-grid">
      <article className="controle-vagas-dashboard-card controle-vagas-dashboard-distribution"><header><div><h2>Distribuição das vagas</h2><p>Composição das vagas previstas ou autorizadas.</p></div></header><div className="controle-vagas-dashboard-ring"><strong>{n(total)}</strong><span>vagas</span></div><ul><Legenda label="Disponíveis" value={soma("disponiveis")} tone="green" /><Legenda label="Em ocupação" value={soma("emOcupacao")} tone="orange" /><Legenda label="Ocupadas" value={soma("ocupadas")} tone="purple" /></ul></article>
      <article className="controle-vagas-dashboard-card controle-vagas-dashboard-bars"><header><div><h2>Vagas por modalidade</h2><p>Compare os quantitativos dentro da seleção.</p></div></header>{visiveis.length ? visiveis.map((d) => <button type="button" key={d.id} onClick={() => navigate(d.rota)}><span>{d.nome}<small>{n(d.quadros)} quadro(s)</small></span><i><b style={{ width: total ? Math.max(d.previstas / total * 100, 2) + "%" : "0%" }} /></i><strong>{n(d.previstas)}</strong></button>) : <p className="controle-vagas-dashboard-empty">Nenhuma modalidade atende aos filtros selecionados.</p>}</article>
    </section>
    <section className="controle-vagas-dashboard-card controle-vagas-dashboard-table-card"><header><div><h2>Resumo por modalidade</h2><p>Os indicadores respeitam os tipos, órgão e situação selecionados.</p></div></header><div className="controle-vagas-dashboard-table-wrap"><table><thead><tr><th>Modalidade</th><th>Quadros</th><th>Previstas / autorizadas</th><th>Disponíveis</th><th>Em ocupação</th><th>Ocupadas</th><th>Pendentes de distribuição</th><th>Ações</th></tr></thead><tbody>{visiveis.map((d) => <tr key={d.id}><td><strong>{d.nome}</strong><small>{d.cargos === undefined ? "Quadros autorizados" : n(d.cargos) + " cargo(s) vinculado(s)"}</small></td><td>{n(d.quadros)}</td><td>{n(d.previstas)}</td><td className="positive">{n(d.disponiveis)}</td><td>{n(d.emOcupacao)}</td><td>{n(d.ocupadas)}</td><td>{d.pendentes === undefined ? "—" : n(d.pendentes)}</td><td><button type="button" aria-label={"Abrir " + d.nome} onClick={() => navigate(d.rota)}><i className="pi pi-arrow-right" /></button></td></tr>)}{!visiveis.length && <tr><td colSpan={8} className="controle-vagas-dashboard-empty">Nenhuma informação encontrada.</td></tr>}</tbody></table></div></section>
    <section className="controle-vagas-dashboard-card controle-vagas-dashboard-alerts"><header><div><h2>Pontos de atenção</h2><p>Leitura operacional da seleção atual.</p></div></header><div><Alerta icon="pi pi-share-alt" title="Vagas pendentes de distribuição" value={pendentes ? soma("pendentes") : 0} description="Aplicável aos quadros efetivos e bolsistas." /><Alerta icon="pi pi-user-plus" title="Vagas em processo de ocupação" value={soma("emOcupacao")} description="Há processos de ingresso ou ocupação em andamento." /><Alerta icon="pi pi-times-circle" title="Quadros extintos ou encerrados" value={visiveis.reduce((a, d) => a + d.extintos + d.encerrados, 0)} description="As vagas sem ocupante desses quadros não ficam disponíveis." /></div></section>
  </main>;
}
function Kpi({ label, value, icon, tone }: { label: string; value: number; icon: string; tone: string }) { return <article className={"controle-vagas-dashboard-kpi " + tone}><i className={icon} /><div><span>{label}</span><strong>{n(value)}</strong></div></article>; }
function Legenda({ label, value, tone }: { label: string; value: number; tone: string }) { return <li><i className={tone} /><span>{label}</span><strong>{n(value)}</strong></li>; }
function Alerta({ icon, title, value, description }: { icon: string; title: string; value: number; description: string }) { return <article><i className={icon} /><div><strong>{title}</strong><span>{description}</span></div><b>{n(value)}</b></article>; }


