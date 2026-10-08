import { Fragment, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import "./vinculoV2.css";

const BASE = "/prototipos/sigep/vinculos-v2";
const STORAGE = "prototype-vinculos-v2";
const TIPOS = [
  "Nomeado Efetivo", "Exclusivamente Comissionado", "Contrato Temporário", "Contrato Temporário Vínculo Único",
  "Residente Técnico", "Estagiário", "Bolsista", "Estabilizado Constitucionalmente", "Empossado em Cargo Eletivo",
  "Nomeado Conselheiro", "Designação AVNM", "Convocação ATO GOV", "Designação PTTC", "Pensão Especial",
  "Beneficiário de Aposentado", "Provisório", "Terceirizados", "Empregado Público", "Servidor Permutado", "Decisão Judicial",
] as const;
type Tipo = typeof TIPOS[number];
type Situacao = "Ativo" | "Inativo";
type Vinculo = {
  id: string; tipo: Tipo; nome: string; cpf: string; nascimento: string; matricula: string; numero: string;
  regime: string; carreira: string; cargo: string; perfil: string; jornada: string; orgao: string; setor: string;
  inicio: string; termino: string; situacao: Situacao;
};
type Pessoa = Pick<Vinculo, "nome" | "cpf" | "nascimento" | "matricula">;
type Campos = Pick<Vinculo, "regime" | "carreira" | "cargo" | "perfil" | "jornada" | "orgao" | "setor" | "inicio" | "termino" | "situacao" | "matricula">;
const PESSOAS: Pessoa[] = [
  { nome: "João Silva", cpf: "000.000.000-00", nascimento: "12/04/1988", matricula: "327305" },
  { nome: "Maria Souza", cpf: "111.111.111-11", nascimento: "03/09/1992", matricula: "418920" },
  { nome: "Ana Costa", cpf: "333.333.333-33", nascimento: "21/06/1985", matricula: "529104" },
  { nome: "Carlos Pereira", cpf: "222.222.222-22", nascimento: "17/11/1990", matricula: "621438" },
];
const BASE_REGISTROS: Vinculo[] = [
  { id: "demo-1", tipo: "Nomeado Efetivo", ...PESSOAS[0], numero: "1", regime: "Estatutário Civil", carreira: "Gestão Governamental", cargo: "Analista Administrativo", perfil: "Gestão de Pessoas", jornada: "40 horas", orgao: "SEPLAG", setor: "Unidade Central", inicio: "2023-07-15", termino: "", situacao: "Ativo" },
  { id: "demo-2", tipo: "Contrato Temporário", ...PESSOAS[1], numero: "1", regime: "Regime Especial", carreira: "Profissionais da Saúde", cargo: "Técnico de Enfermagem", perfil: "Saúde", jornada: "40 horas", orgao: "SES", setor: "Hospital Regional", inicio: "2026-09-02", termino: "2027-09-01", situacao: "Ativo" },
  { id: "demo-3", tipo: "Exclusivamente Comissionado", ...PESSOAS[0], numero: "2", regime: "Regime Misto", carreira: "", cargo: "Assessor Especial", perfil: "Assessoria", jornada: "40 horas", orgao: "SEPLAG", setor: "Gabinete", inicio: "2026-02-12", termino: "", situacao: "Ativo" },
  { id: "demo-4", tipo: "Estagiário", ...PESSOAS[2], numero: "1", regime: "Sem Vínculo Empregatício", carreira: "", cargo: "Estagiário", perfil: "Administração", jornada: "20 horas", orgao: "SEPLAG", setor: "Unidade Central", inicio: "2026-02-12", termino: "2027-02-12", situacao: "Ativo" },
];
const ORGAOS = ["SEPLAG", "SES", "SEDUC", "SEFAZ"];
const SETORES: Record<string, string[]> = {
  SEPLAG: ["Unidade Central", "Gabinete", "Coordenadoria de Gestão de Pessoas"],
  SES: ["Hospital Regional", "Gabinete", "Unidade Central"],
  SEDUC: ["Escola Estadual", "Gabinete", "Unidade Central"],
  SEFAZ: ["Unidade Fazendária", "Gabinete", "Unidade Central"],
};
type Config = { regimes: string[]; carreiras: string[]; cargos: string[]; perfis: string[]; jornadas: string[]; termino: boolean };
function configTipo(tipo: Tipo): Config {
  if (tipo === "Nomeado Efetivo" || tipo === "Estabilizado Constitucionalmente" || tipo === "Servidor Permutado")
    return { regimes: ["Estatutário Civil"], carreiras: ["Gestão Governamental", "Profissionais da Educação", "Profissionais da Saúde"], cargos: ["Analista Administrativo", "Professor", "Técnico de Enfermagem"], perfis: ["Gestão de Pessoas", "Educação", "Saúde"], jornadas: ["20 horas", "30 horas", "40 horas"], termino: false };
  if (tipo === "Contrato Temporário" || tipo === "Contrato Temporário Vínculo Único" || tipo === "Residente Técnico")
    return { regimes: ["Regime Especial"], carreiras: ["Profissionais da Saúde", "Profissionais da Educação"], cargos: ["Técnico de Enfermagem", "Professor", "Residente Técnico"], perfis: ["Saúde", "Educação"], jornadas: ["20 horas", "30 horas", "40 horas"], termino: true };
  if (tipo === "Estagiário" || tipo === "Bolsista" || tipo === "Beneficiário de Aposentado" || tipo === "Pensão Especial")
    return { regimes: ["Sem Vínculo Empregatício"], carreiras: [], cargos: [tipo], perfis: ["Administração", "Educação", "Saúde"], jornadas: ["20 horas", "30 horas"], termino: true };
  if (tipo === "Exclusivamente Comissionado" || tipo === "Nomeado Conselheiro" || tipo === "Empossado em Cargo Eletivo")
    return { regimes: ["Regime Misto"], carreiras: [], cargos: ["Assessor Especial", "Chefe de Gabinete", tipo], perfis: ["Assessoria", "Gestão de Pessoas"], jornadas: ["40 horas", "Dedicação exclusiva"], termino: false };
  return { regimes: ["Regime Especial", "Regime Misto"], carreiras: [], cargos: [tipo], perfis: ["Administração", "Assessoria"], jornadas: ["20 horas", "30 horas", "40 horas"], termino: true };
}
const emptyCampos: Campos = { matricula: "", regime: "", carreira: "", cargo: "", perfil: "", jornada: "", orgao: "", setor: "", inicio: "", termino: "", situacao: "Ativo" };
function salvos(): Vinculo[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE) || "[]");
    return Array.isArray(parsed) ? parsed as Vinculo[] : [];
  } catch { return []; }
}
const todos = () => [...BASE_REGISTROS, ...salvos()];
const normalizar = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
const dataBr = (value: string) => value ? value.split("-").reverse().join("/") : "—";
const cpfMascarado = (value: string) => value.replace(/^(\d{3})\.\d{3}\.\d{3}-(\d{2})$/, "$1.***.***-$2");
function layout(title: string, action: React.ReactNode, children: React.ReactNode) {
  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
    <main className="v2v-page">
      <BreadcrumbSeplag homeTo="/prototipos/sigep" items={[{ label: "Gestão de Pessoas" }, { label: "Vínculos", to: BASE }, { label: title }]} />
      <header className="v2v-heading"><h1>{title}</h1><p>Consulte os tipos de vínculo cadastrados e os servidores que possuem vínculos ativos em cada categoria.</p></header>
      <div className="v2v-toolbar">{action}</div>{children}
    </main>
  </PrototypeSystemPage>;
}
function downloadCsv(registros: Vinculo[]) {
  const linhas = [["Tipo de Vínculo", "Matrícula", "Nº do Vínculo", "Servidor", "CPF", "Órgão", "Cargo/Função", "Data de Início", "Situação"], ...registros.map((v) => [v.tipo, v.matricula, v.numero, v.nome, v.cpf, v.orgao, v.cargo, dataBr(v.inicio), v.situacao])];
  const csv = "\uFEFF" + linhas.map((linha) => linha.map((celula) => `"${String(celula).replaceAll('"', '""')}"`).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = "consulta-vinculos-v2.csv"; a.click(); URL.revokeObjectURL(url);
}
export function VinculoV2ConsultaPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [registros] = useState(todos);
  const [draft, setDraft] = useState({ tipo: "", busca: "", orgao: "" });
  const [filtros, setFiltros] = useState(draft);
  const [expandido, setExpandido] = useState<string | null>(params.get("expand"));
  const [pagina, setPagina] = useState(1);
  const ativos = registros.filter((v) => v.situacao === "Ativo");
  const filtrados = useMemo(() => ativos.filter((v) => {
    const termo = normalizar(filtros.busca.trim());
    const digits = filtros.busca.replace(/\D/g, "");
    return (!filtros.tipo || v.tipo === filtros.tipo) && (!filtros.orgao || v.orgao === filtros.orgao)
      && (!termo || normalizar(v.nome).includes(termo) || v.matricula.includes(filtros.busca.trim()) || (digits.length > 0 && v.cpf.replace(/\D/g, "").includes(digits)));
  }), [ativos, filtros]);
  const tiposVisiveis = TIPOS.filter((tipo) => (!filtros.tipo || filtros.tipo === tipo) && (!(filtros.busca || filtros.orgao) || filtrados.some((v) => v.tipo === tipo)));
  const voltar = <button type="button" className="v2v-secondary" onClick={() => navigate("/prototipos/sigep/vinculos-funcionais")}><i className="pi pi-arrow-left" />Voltar</button>;
  return layout("Consulta de Vínculos", <>{voltar}<button type="button" className="v2v-primary" onClick={() => downloadCsv(filtrados)}><i className="pi pi-download" />Exportar</button></>, <>
    <section className="v2v-kpis" aria-label="Indicadores de vínculos">
      <article><i className="pi pi-list" /><span>Tipos de Vínculo</span><strong>{TIPOS.length}</strong></article>
      <article><i className="pi pi-link" /><span>Vínculos Ativos</span><strong>{ativos.length}</strong></article>
      <article><i className="pi pi-check-circle" /><span>Tipos com Vínculos Ativos</span><strong>{new Set(ativos.map((v) => v.tipo)).size}</strong></article>
    </section>
    <section className="v2v-panel v2v-filters" aria-label="Filtros de consulta">
      <label>Tipo de Vínculo<select value={draft.tipo} onChange={(e) => setDraft({ ...draft, tipo: e.target.value })}><option value="">Todos</option>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></label>
      <label>Servidor / CPF / Matrícula<input value={draft.busca} onChange={(e) => setDraft({ ...draft, busca: e.target.value })} placeholder="Buscar servidor, CPF ou matrícula" onKeyDown={(e) => { if (e.key === "Enter") { setFiltros(draft); setPagina(1); } }} /></label>
      <label>Órgão<select value={draft.orgao} onChange={(e) => setDraft({ ...draft, orgao: e.target.value })}><option value="">Todos</option>{ORGAOS.map((o) => <option key={o}>{o}</option>)}</select></label>
      <div className="v2v-filter-actions"><button className="v2v-primary" type="button" onClick={() => { setFiltros(draft); setPagina(1); }}><i className="pi pi-search" />Pesquisar</button><button className="v2v-secondary" type="button" onClick={() => { const vazio = { tipo: "", busca: "", orgao: "" }; setDraft(vazio); setFiltros(vazio); setPagina(1); }}><i className="pi pi-refresh" />Limpar</button></div>
    </section>
    <section className="v2v-panel" aria-label="Tipos de vínculo"><div className="v2v-table-wrap"><table className="v2v-table"><thead><tr><th>Código</th><th>Tipo de Vínculo</th><th>Vínculos Ativos</th><th>Ação</th></tr></thead><tbody>
      {tiposVisiveis.map((tipo) => { const idx = TIPOS.indexOf(tipo); const linhas = filtrados.filter((v) => v.tipo === tipo); const aberto = expandido === tipo; const totalPaginas = Math.max(1, Math.ceil(linhas.length / 5)); const paginaAtual = Math.min(pagina, totalPaginas); return <Fragment key={tipo}><tr><td>TV-{String(idx + 1).padStart(3, "0")}</td><td><strong>{tipo}</strong></td><td>{linhas.length}</td><td><button type="button" className="v2v-link" aria-expanded={aberto} onClick={() => { setExpandido(aberto ? null : tipo); setPagina(1); }}><i className={`pi ${aberto ? "pi-chevron-up" : "pi-eye"}`} />{aberto ? "Recolher" : "Visualizar"}</button></td></tr>
        {aberto && <tr className="v2v-expanded-row"><td colSpan={4}><div className="v2v-expanded"><div className="v2v-expanded-head"><div><strong>Servidores com Vínculo Ativo</strong><span>{linhas.length} vínculo(s) ativo(s) neste tipo</span></div><button type="button" className="v2v-primary" onClick={() => navigate(`${BASE}/novo?tipo=${encodeURIComponent(tipo)}`)}><i className="pi pi-plus" />Cadastrar Vínculo</button></div><div className="v2v-table-wrap"><table className="v2v-table v2v-inner-table"><thead><tr><th>Matrícula</th><th>Nº do Vínculo</th><th>Servidor</th><th>CPF</th><th>Órgão</th><th>Cargo/Função</th><th>Data de Início</th><th>Situação</th><th>Ação</th></tr></thead><tbody>{linhas.slice((paginaAtual - 1) * 5, paginaAtual * 5).map((v) => <tr key={v.id}><td>{v.matricula}</td><td>{v.numero}</td><td>{v.nome}</td><td>{cpfMascarado(v.cpf)}</td><td>{v.orgao}</td><td>{v.cargo}</td><td>{dataBr(v.inicio)}</td><td><span className="v2v-active">Ativo</span></td><td><button type="button" className="v2v-link" onClick={() => navigate(`${BASE}/${v.id}?tipo=${encodeURIComponent(tipo)}`)}>Ver detalhes</button></td></tr>)}{linhas.length === 0 && <tr><td colSpan={9} className="v2v-empty">Nenhum vínculo ativo encontrado neste tipo.</td></tr>}</tbody></table></div><div className="v2v-pagination"><button type="button" disabled={paginaAtual === 1} onClick={() => setPagina(paginaAtual - 1)} aria-label="Página anterior"><i className="pi pi-chevron-left" /></button><span>Página {paginaAtual} de {totalPaginas}</span><button type="button" disabled={paginaAtual === totalPaginas} onClick={() => setPagina(paginaAtual + 1)} aria-label="Próxima página"><i className="pi pi-chevron-right" /></button></div></div></td></tr>}</Fragment>; })}
      {tiposVisiveis.length === 0 && <tr><td colSpan={4} className="v2v-empty">Nenhum vínculo encontrado para os filtros informados.</td></tr>}
    </tbody></table></div></section>
  </>);
}

export function VinculoV2CadastroPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tipo = TIPOS.find((t) => t === params.get("tipo")) ?? TIPOS[0];
  const config = configTipo(tipo);
  const [cpf, setCpf] = useState("");
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [buscou, setBuscou] = useState(false);
  const [campos, setCampos] = useState<Campos>(() => ({ ...emptyCampos, regime: config.regimes[0] || "", carreira: config.carreiras[0] || "", cargo: config.cargos[0] || "", perfil: config.perfis[0] || "", jornada: config.jornadas[0] || "" }));
  const [erro, setErro] = useState("");
  const registros = useMemo(() => todos(), []);
  const numeroVinculo = pessoa ? String(Math.max(0, ...registros.filter((v) => v.cpf === pessoa.cpf).map((v) => Number(v.numero) || 0)) + 1) : "";
  const atualizar = (key: keyof Campos, value: string) => setCampos((atual) => ({ ...atual, [key]: value, ...(key === "orgao" ? { setor: "" } : {}) }));
  const pesquisarPessoa = () => { const encontrado = [...PESSOAS, ...registros.map((v) => ({ nome: v.nome, cpf: v.cpf, nascimento: v.nascimento, matricula: v.matricula }))].find((p) => p.cpf.replace(/\D/g, "") === cpf.replace(/\D/g, "") && cpf.replace(/\D/g, "").length === 11); setPessoa(encontrado ?? null); setBuscou(true); setErro(""); if (encontrado) atualizar("matricula", encontrado.matricula); };
  const salvar = (e: FormEvent) => { e.preventDefault(); if (!pessoa) { setErro("Pesquise uma Pessoa Física antes de salvar."); return; } if (!campos.matricula.trim() || !campos.cargo || !campos.perfil || !campos.jornada || !campos.orgao || !campos.setor || !campos.inicio || (config.termino && !campos.termino)) { setErro("Preencha todos os campos obrigatórios do vínculo."); return; } if (campos.termino && campos.termino < campos.inicio) { setErro("A data de término deve ser igual ou posterior à data de início."); return; } const novo: Vinculo = { id: `v2-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, tipo, ...pessoa, ...campos, matricula: campos.matricula.trim(), numero: numeroVinculo }; localStorage.setItem(STORAGE, JSON.stringify([...salvos(), novo])); navigate(`${BASE}?expand=${encodeURIComponent(tipo)}`); };
  const voltar = () => navigate(`${BASE}?expand=${encodeURIComponent(tipo)}`);
  return layout("Novo Vínculo", <button type="button" className="v2v-secondary" onClick={voltar}><i className="pi pi-arrow-left" />Voltar</button>, <form onSubmit={salvar} className="v2v-form">
    <section className="v2v-panel"><h2>Identificação da Pessoa Física</h2><label className="v2v-origin-type">Tipo de Vínculo<input value={tipo} readOnly /></label><div className="v2v-search-person"><label>CPF <em>*</em><input value={cpf} onChange={(e) => { setCpf(e.target.value); setPessoa(null); setBuscou(false); }} placeholder="000.000.000-00" inputMode="numeric" /></label><button type="button" className="v2v-primary" onClick={pesquisarPessoa}><i className="pi pi-search" />Pesquisar</button></div>
      {pessoa && <div className="v2v-person"><div><small>Nome completo</small><strong>{pessoa.nome}</strong></div><div><small>CPF</small><strong>{pessoa.cpf}</strong></div><div><small>Data de nascimento</small><strong>{pessoa.nascimento}</strong></div></div>}
      {buscou && !pessoa && <div className="v2v-notice"><i className="pi pi-info-circle" />CPF não encontrado no cadastro de Pessoa Física. <button type="button" className="v2v-link" onClick={() => navigate(`/prototipos/sigep/pessoa-fisica/novo?cpf=${encodeURIComponent(cpf)}`)}>Cadastrar Pessoa Física</button></div>}
    </section>
    {pessoa && <section className="v2v-panel"><h2>Dados do Vínculo</h2><div className="v2v-form-grid">
      <label>Tipo de Vínculo<input value={tipo} readOnly /></label><label>Nº do Vínculo<input value={numeroVinculo} readOnly /></label><label>Matrícula <em>*</em><input value={campos.matricula} onChange={(e) => atualizar("matricula", e.target.value)} /></label>
      <label>Regime Jurídico <em>*</em><select value={campos.regime} onChange={(e) => atualizar("regime", e.target.value)}>{config.regimes.map((v) => <option key={v}>{v}</option>)}</select></label>
      <label>Carreira{config.carreiras.length > 0 && <em>*</em>}<select value={campos.carreira} disabled={!config.carreiras.length} onChange={(e) => atualizar("carreira", e.target.value)}>{!config.carreiras.length && <option value="">Não se aplica</option>}{config.carreiras.map((v) => <option key={v}>{v}</option>)}</select></label>
      <label>Cargo/Função <em>*</em><select value={campos.cargo} onChange={(e) => atualizar("cargo", e.target.value)}>{config.cargos.map((v) => <option key={v}>{v}</option>)}</select></label>
      <label>Perfil <em>*</em><select value={campos.perfil} onChange={(e) => atualizar("perfil", e.target.value)}>{config.perfis.map((v) => <option key={v}>{v}</option>)}</select></label>
      <label>Jornada <em>*</em><select value={campos.jornada} onChange={(e) => atualizar("jornada", e.target.value)}>{config.jornadas.map((v) => <option key={v}>{v}</option>)}</select></label>
      <label>Órgão <em>*</em><select value={campos.orgao} onChange={(e) => atualizar("orgao", e.target.value)}><option value="">Selecione...</option>{ORGAOS.map((v) => <option key={v}>{v}</option>)}</select></label>
      <label>Unidade/Setor de Lotação <em>*</em><select value={campos.setor} disabled={!campos.orgao} onChange={(e) => atualizar("setor", e.target.value)}><option value="">Selecione...</option>{(SETORES[campos.orgao] || []).map((v) => <option key={v}>{v}</option>)}</select></label>
      <label>Data de Início <em>*</em><input type="date" value={campos.inicio} onChange={(e) => atualizar("inicio", e.target.value)} /></label>
      <label>Data de Término{config.termino && <em>*</em>}<input type="date" value={campos.termino} onChange={(e) => atualizar("termino", e.target.value)} /></label>
      <label>Situação do Vínculo<select value={campos.situacao} onChange={(e) => atualizar("situacao", e.target.value)}><option>Ativo</option><option>Inativo</option></select></label>
    </div></section>}
    {erro && <div className="v2v-error" role="alert">{erro}</div>}
    <div className="v2v-form-actions"><button type="button" className="v2v-secondary" onClick={voltar}>Cancelar</button><button type="submit" className="v2v-primary" disabled={!pessoa}>Salvar Vínculo</button></div>
  </form>);
}

export function VinculoV2DetalhesPage() {
  const navigate = useNavigate(); const { id } = useParams(); const [params] = useSearchParams();
  const vinculo = todos().find((v) => v.id === id);
  const voltar = () => navigate(`${BASE}?expand=${encodeURIComponent(params.get("tipo") || vinculo?.tipo || "")}`);
  return layout("Detalhes do Vínculo", <button type="button" className="v2v-secondary" onClick={voltar}><i className="pi pi-arrow-left" />Voltar</button>, vinculo ? <section className="v2v-panel"><h2>Dados do Vínculo</h2><div className="v2v-detail-grid">{[["Pessoa Física", vinculo.nome], ["CPF", vinculo.cpf], ["Matrícula", vinculo.matricula], ["Nº do Vínculo", vinculo.numero], ["Tipo de Vínculo", vinculo.tipo], ["Regime Jurídico", vinculo.regime], ["Carreira", vinculo.carreira || "Não se aplica"], ["Cargo/Função", vinculo.cargo], ["Perfil", vinculo.perfil], ["Jornada", vinculo.jornada], ["Órgão", vinculo.orgao], ["Setor/Lotação", vinculo.setor], ["Data de Início", dataBr(vinculo.inicio)], ["Data de Término", dataBr(vinculo.termino)], ["Situação do Vínculo", vinculo.situacao]].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div></section> : <div className="v2v-notice">Vínculo não encontrado.</div>);
}