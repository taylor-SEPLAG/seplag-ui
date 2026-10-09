import { Fragment, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { CardSeplag } from "../../componentes/Card";
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
const TIPOS_INGRESSO = new Set<Tipo>([
  "Nomeado Efetivo", "Exclusivamente Comissionado", "Contrato Temporário", "Contrato Temporário Vínculo Único",
  "Residente Técnico", "Estagiário", "Bolsista",
]);
type Situacao = "Ativo" | "Encerrado" | "Inativo";
type Vinculo = {
  id: string; tipo: Tipo; nome: string; cpf: string; nascimento: string; matricula: string; numero: string;
  regime: string; carreira: string; cargo: string; perfil: string; jornada: string; orgao: string; setor: string;
  inicio: string; termino: string; situacao: Situacao; vacanciaData?: string; vacanciaForma?: string; observacao?: string;
};
type Pessoa = Pick<Vinculo, "nome" | "cpf" | "nascimento" | "matricula">;
type Campos = Pick<Vinculo, "regime" | "carreira" | "cargo" | "perfil" | "jornada" | "orgao" | "setor" | "inicio" | "matricula"> & { vacanciaData: string; vacanciaForma: string; observacao: string };
const PESSOAS: Pessoa[] = [
  { nome: "João Silva", cpf: "000.000.000-00", nascimento: "12/04/1988", matricula: "327305" },
  { nome: "Maria Souza", cpf: "111.111.111-11", nascimento: "03/09/1992", matricula: "418920" },
  { nome: "Ana Costa", cpf: "333.333.333-33", nascimento: "21/06/1985", matricula: "529104" },
  { nome: "Carlos Pereira", cpf: "222.222.222-22", nascimento: "17/11/1990", matricula: "621438" },
  { nome: "Helena Martins", cpf: "444.444.444-44", nascimento: "08/02/1962", matricula: "738211" },
  { nome: "Roberto Almeida", cpf: "555.555.555-55", nascimento: "19/07/1960", matricula: "815437" },
  { nome: "Carla Nunes", cpf: "666.666.666-66", nascimento: "05/03/1981", matricula: "674208" },
  { nome: "Pedro Lima", cpf: "777.777.777-77", nascimento: "22/10/1987", matricula: "902314" },
];
const BASE_REGISTROS: Vinculo[] = [
  { id: "demo-1", tipo: "Nomeado Efetivo", ...PESSOAS[0], numero: "1", regime: "Estatutário Civil", carreira: "Gestão Governamental", cargo: "Analista Administrativo", perfil: "Gestão de Pessoas", jornada: "40 horas", orgao: "SEPLAG", setor: "Unidade Central", inicio: "2023-07-15", termino: "", situacao: "Ativo" },
  { id: "demo-2", tipo: "Contrato Temporário", ...PESSOAS[1], numero: "1", regime: "Regime Especial", carreira: "Profissionais da Saúde", cargo: "Técnico de Enfermagem", perfil: "Saúde", jornada: "40 horas", orgao: "SES", setor: "Hospital Regional", inicio: "2026-09-02", termino: "2027-09-01", situacao: "Ativo" },
  { id: "demo-3", tipo: "Exclusivamente Comissionado", ...PESSOAS[0], numero: "2", regime: "Regime Misto", carreira: "", cargo: "Assessor Especial", perfil: "Assessoria", jornada: "40 horas", orgao: "SEPLAG", setor: "Gabinete", inicio: "2026-02-12", termino: "", situacao: "Ativo" },
  { id: "demo-4", tipo: "Estagiário", ...PESSOAS[2], numero: "1", regime: "Sem Vínculo Empregatício", carreira: "", cargo: "Estagiário", perfil: "Administração", jornada: "20 horas", orgao: "SEPLAG", setor: "Unidade Central", inicio: "2026-02-12", termino: "2027-02-12", situacao: "Ativo" },
  { id: "demo-5", tipo: "Estabilizado Constitucionalmente", ...PESSOAS[4], numero: "1", regime: "Estatutário Civil", carreira: "Profissionais da Educação", cargo: "Professor", perfil: "Educação", jornada: "30 horas", orgao: "SEDUC", setor: "Escola Estadual", inicio: "2001-02-01", termino: "", situacao: "Inativo", vacanciaData: "2024-06-30", vacanciaForma: "Aposentadoria", observacao: "Aposentadoria registrada após o encerramento das atividades." },
  { id: "demo-6", tipo: "Servidor Permutado", ...PESSOAS[5], numero: "1", regime: "Estatutário Civil", carreira: "Profissionais da Saúde", cargo: "Técnico de Enfermagem", perfil: "Saúde", jornada: "40 horas", orgao: "SES", setor: "Hospital Regional", inicio: "2003-08-15", termino: "", situacao: "Inativo", vacanciaData: "2025-12-31", vacanciaForma: "Aposentadoria" },
  { id: "demo-7", tipo: "Empossado em Cargo Eletivo", ...PESSOAS[6], numero: "1", regime: "Regime Misto", carreira: "", cargo: "Chefe de Gabinete", perfil: "Assessoria", jornada: "40 horas", orgao: "SEPLAG", setor: "Gabinete", inicio: "2023-01-02", termino: "", situacao: "Encerrado", vacanciaData: "2025-04-15", vacanciaForma: "Exoneração" },
  { id: "demo-8", tipo: "Designação AVNM", ...PESSOAS[7], numero: "1", regime: "Regime Especial", carreira: "", cargo: "Designação AVNM", perfil: "Assessoria", jornada: "30 horas", orgao: "SEFAZ", setor: "Unidade Fazendária", inicio: "2024-03-01", termino: "", situacao: "Encerrado", vacanciaData: "2026-03-01", vacanciaForma: "Término de contrato", observacao: "Designação encerrada pelo término da vigência." },
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
const PERFIS_POR_CARGO: Record<string, string[]> = {
  "Analista Administrativo": ["Gestão de Pessoas", "Administração"],
  "Professor": ["Educação"],
  "Técnico de Enfermagem": ["Saúde"],
  "Residente Técnico": ["Saúde"],
  "Assessor Especial": ["Assessoria"],
  "Chefe de Gabinete": ["Assessoria"],
};
const JORNADAS_POR_CARGO: Record<string, string[]> = {
  "Analista Administrativo": ["40 horas"],
  "Professor": ["20 horas", "30 horas", "40 horas"],
  "Técnico de Enfermagem": ["30 horas", "40 horas"],
  "Residente Técnico": ["20 horas", "30 horas", "40 horas"],
  "Assessor Especial": ["40 horas", "Dedicação exclusiva"],
  "Chefe de Gabinete": ["40 horas", "Dedicação exclusiva"],
};
function opcoesCargo(config: Config, cargo: string) {
  const perfis = config.perfis.filter((perfil) => !PERFIS_POR_CARGO[cargo] || PERFIS_POR_CARGO[cargo].includes(perfil));
  const jornadas = config.jornadas.filter((jornada) => !JORNADAS_POR_CARGO[cargo] || JORNADAS_POR_CARGO[cargo].includes(jornada));
  return { perfis: perfis.length ? perfis : config.perfis, jornadas: jornadas.length ? jornadas : config.jornadas };
}
const NOMES_DEMO = ["Adriana", "Bruno", "Camila", "Daniel", "Elisa", "Fábio", "Giovana", "Hugo", "Isabela", "Marcos"];
const SOBRENOMES_DEMO = ["Almeida", "Barbosa", "Cardoso", "Dias", "Ferreira", "Gomes", "Lima", "Mendes", "Oliveira", "Ribeiro"];
const REGISTROS_ADICIONAIS: Vinculo[] = TIPOS.flatMap((tipo, indiceTipo) =>
  Array.from({ length: 5 }, (_, indice) => {
    const sequencia = indiceTipo * 5 + indice;
    const config = configTipo(tipo);
    const cargo = config.cargos[indice % config.cargos.length];
    const opcoes = opcoesCargo(config, cargo);
    const orgao = ORGAOS[indiceTipo % ORGAOS.length];
    const cpfNumerico = String(80000000000 + sequencia);
    const situacao: Situacao = indice === 3 ? "Inativo" : indice === 4 ? "Encerrado" : "Ativo";
    return {
      id: `demo-extra-${sequencia + 1}`, tipo,
      nome: `${NOMES_DEMO[sequencia % NOMES_DEMO.length]} ${SOBRENOMES_DEMO[Math.floor(sequencia / NOMES_DEMO.length)]}`,
      cpf: `${cpfNumerico.slice(0, 3)}.${cpfNumerico.slice(3, 6)}.${cpfNumerico.slice(6, 9)}-${cpfNumerico.slice(9)}`,
      nascimento: `15/06/${1980 + (sequencia % 20)}`,
      matricula: String(800001 + sequencia), numero: "1",
      regime: config.regimes[0], carreira: config.carreiras[0] ?? "", cargo,
      perfil: opcoes.perfis[0], jornada: opcoes.jornadas[0],
      orgao, setor: SETORES[orgao][indice % SETORES[orgao].length],
      inicio: "2022-01-10", termino: "", situacao,
      vacanciaData: situacao === "Ativo" ? "" : situacao === "Inativo" ? "2024-06-30" : "2025-03-31",
      vacanciaForma: situacao === "Ativo" ? "" : situacao === "Inativo" ? "Aposentadoria" : "Término de contrato",
    };
  }),
);
const emptyCampos: Campos = { matricula: "", regime: "", carreira: "", cargo: "", perfil: "", jornada: "", orgao: "", setor: "", inicio: "", vacanciaData: "", vacanciaForma: "", observacao: "" };
function salvos(): Vinculo[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE) || "[]");
    return Array.isArray(parsed) ? parsed as Vinculo[] : [];
  } catch { return []; }
}
function todos(): Vinculo[] {
  const registros = salvos();
  const exemplos = [...BASE_REGISTROS, ...REGISTROS_ADICIONAIS];
  return [...exemplos.filter((v) => !registros.some((salvo) => salvo.id === v.id)), ...registros];
}
const HOJE = (() => { const data = new Date(); return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`; })();
function situacaoDoVinculo(v: Pick<Vinculo, "vacanciaData" | "vacanciaForma">): Situacao {
  if (!v.vacanciaData || !v.vacanciaForma || v.vacanciaData > HOJE) return "Ativo";
  return v.vacanciaForma === "Aposentadoria" ? "Inativo" : "Encerrado";
}
function SituacaoTag({ situacao }: { situacao: Situacao }) {
  return <span className={`v2v-status v2v-status-${situacao.toLowerCase()}`}>{situacao}</span>;
}
const gerarId = () => `v2-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const normalizar = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
const digitosCpf = (value: string) => value.replace(/\D/g, "").slice(0, 11);
function mascararCpf(value: string) {
  const digitos = digitosCpf(value);
  const partes = [digitos.slice(0, 3), digitos.slice(3, 6), digitos.slice(6, 9)].filter(Boolean);
  return partes.join(".") + (digitos.length > 9 ? `-${digitos.slice(9)}` : "");
}
const dataBr = (value: string) => value ? value.split("-").reverse().join("/") : "—";
type PaginacaoV2Props = { nome: string; pagina: number; totalPaginas: number; porPagina: number; mudarPagina: (pagina: number) => void; mudarPorPagina: (quantidade: number) => void };
function PaginacaoV2({ nome, pagina, totalPaginas, porPagina, mudarPagina, mudarPorPagina }: PaginacaoV2Props) {
  return <nav className="v2v-pagination" aria-label={`Paginação de ${nome}`}>
    <button type="button" aria-label={`Primeira página de ${nome}`} disabled={pagina === 1} onClick={() => mudarPagina(1)}><i className="pi pi-angle-double-left" aria-hidden="true" /></button>
    <button type="button" aria-label={`Página anterior de ${nome}`} disabled={pagina === 1} onClick={() => mudarPagina(pagina - 1)}><i className="pi pi-angle-left" aria-hidden="true" /></button>
    {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => <button type="button" key={numero} className={numero === pagina ? "is-current" : ""} aria-label={`Página ${numero} de ${nome}`} aria-current={numero === pagina ? "page" : undefined} onClick={() => mudarPagina(numero)}>{numero}</button>)}
    <button type="button" aria-label={`Próxima página de ${nome}`} disabled={pagina === totalPaginas} onClick={() => mudarPagina(pagina + 1)}><i className="pi pi-angle-right" aria-hidden="true" /></button>
    <button type="button" aria-label={`Última página de ${nome}`} disabled={pagina === totalPaginas} onClick={() => mudarPagina(totalPaginas)}><i className="pi pi-angle-double-right" aria-hidden="true" /></button>
    <select aria-label={`Registros por página de ${nome}`} value={porPagina} onChange={(event) => mudarPorPagina(Number(event.target.value))}>{[10, 20, 50].map((opcao) => <option key={opcao} value={opcao}>{opcao}</option>)}</select>
  </nav>;
}
function layout(title: string, action: React.ReactNode, children: React.ReactNode, situacao?: Situacao) {
  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
    <main className="prototype-page-content prototype-page-content--white v2v-shell">
      <CardSeplag
        title={situacao ? <span className="v2v-title-status">{title}<SituacaoTag situacao={situacao} /></span> : title}
        cols="12"
        cardHeaderClassNames="prototype-carreira-card v2v-card"
        headerNavigation={<BreadcrumbSeplag divided items={[{ label: "Cadastro" }, { label: "Vínculos Funcionais" }, { label: "Vínculo V2", to: BASE }, ...(title === "Gestão de Vínculos" ? [] : [{ label: title }])]} />}
      >
        <div className="v2v-page">
          {title === "Gestão de Vínculos" && <p className="v2v-description">Consulte os vínculos cadastrados e a situação de cada servidor por tipo de vínculo.</p>}
          {action && <div className="v2v-toolbar">{action}</div>}
          {children}
        </div>
      </CardSeplag>
    </main>
  </PrototypeSystemPage>;
}
export function VinculoV2ConsultaPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [registros] = useState(todos);
  const [filtros, setFiltros] = useState({ tipo: "", busca: "", lotacao: "" });
  const [expandido, setExpandido] = useState<string | null>(params.get("expand"));
  const [porPaginaTipos, setPorPaginaTipos] = useState(10);
  const [paginaTipos, setPaginaTipos] = useState(() => { const indice = TIPOS.findIndex((tipo) => tipo === params.get("expand")); return indice < 0 ? 1 : Math.floor(indice / 10) + 1; });
  const [porPaginaServidores, setPorPaginaServidores] = useState(10);
  const [paginaServidores, setPaginaServidores] = useState(1);
  const atualizarFiltro = (campo: keyof typeof filtros, valor: string) => { setFiltros((atual) => ({ ...atual, [campo]: valor })); setPaginaTipos(1); setPaginaServidores(1); };
  const ativos = registros.filter((v) => situacaoDoVinculo(v) === "Ativo");
  const inativos = registros.filter((v) => situacaoDoVinculo(v) === "Inativo");
  const encerrados = registros.filter((v) => situacaoDoVinculo(v) === "Encerrado");
  const lotacoes = [...new Set(ativos.map((v) => v.setor).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const filtrados = registros.filter((v) => {
    const termo = normalizar(filtros.busca.trim());
    const digits = filtros.busca.replace(/\D/g, "");
    return (!filtros.tipo || v.tipo === filtros.tipo) && (!filtros.lotacao || v.setor === filtros.lotacao)
      && (!termo || normalizar(v.nome).includes(termo) || v.matricula.includes(filtros.busca.trim()) || (digits.length > 0 && v.cpf.replace(/\D/g, "").includes(digits)));
  });
  const tiposVisiveis = TIPOS.filter((tipo) => (!filtros.tipo || filtros.tipo === tipo) && (!(filtros.busca || filtros.lotacao) || filtrados.some((v) => v.tipo === tipo)));
  const totalPaginasTipos = Math.max(1, Math.ceil(tiposVisiveis.length / porPaginaTipos));
  const paginaTiposAtual = Math.min(paginaTipos, totalPaginasTipos);
  const tiposPaginados = tiposVisiveis.slice((paginaTiposAtual - 1) * porPaginaTipos, paginaTiposAtual * porPaginaTipos);
  return layout("Gestão de Vínculos", null, <>
    <section className="v2v-kpis" aria-label="Indicadores de vínculos">
      <article className="v2v-kpi-active"><i className="pi pi-check-circle" aria-hidden="true" /><div><span>Vínculos Ativos</span><strong>{ativos.length}</strong></div></article>
      <article className="v2v-kpi-inactive"><i className="pi pi-pause-circle" aria-hidden="true" /><div><span>Vínculos Inativos</span><strong>{inativos.length}</strong></div></article>
      <article className="v2v-kpi-closed"><i className="pi pi-times-circle" aria-hidden="true" /><div><span>Vínculos Encerrados</span><strong>{encerrados.length}</strong></div></article>
    </section>
    <section className="v2v-panel v2v-filters" aria-label="Filtros de consulta">
      <label>Tipo de Vínculo<select value={filtros.tipo} onChange={(e) => atualizarFiltro("tipo", e.target.value)}><option value="">Todos</option>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></label>
      <label>Servidor / CPF / Matrícula<input value={filtros.busca} onChange={(e) => atualizarFiltro("busca", e.target.value)} placeholder="Buscar servidor, CPF ou matrícula" /></label>
      <label>Lotação<select value={filtros.lotacao} onChange={(e) => atualizarFiltro("lotacao", e.target.value)}><option value="">Todas</option>{lotacoes.map((lotacao) => <option key={lotacao}>{lotacao}</option>)}</select></label>
      <div className="v2v-filter-actions"><button className="v2v-primary" type="button" onClick={() => { setFiltros({ tipo: "", busca: "", lotacao: "" }); setPaginaTipos(1); setPaginaServidores(1); }}><i className="pi pi-refresh" aria-hidden="true" />Limpar filtro</button></div>
    </section>    <section className="v2v-panel" aria-label="Tipos de vínculo"><div className="v2v-table-wrap"><table className="v2v-table"><thead><tr><th>Código</th><th>Tipo de Vínculo</th><th>Quantidade de Vínculos</th><th>Ação</th></tr></thead><tbody>
      {tiposPaginados.map((tipo) => { const idx = TIPOS.indexOf(tipo); const linhas = filtrados.filter((v) => v.tipo === tipo); const aberto = expandido === tipo; const totalPaginas = Math.max(1, Math.ceil(linhas.length / porPaginaServidores)); const paginaAtual = Math.min(paginaServidores, totalPaginas); return <Fragment key={tipo}><tr><td>{idx + 1}</td><td><strong>{tipo}</strong></td><td>{linhas.length}</td><td><button type="button" className="v2v-icon-action" aria-label={aberto ? "Recolher" : "Visualizar"} title={aberto ? "Recolher" : "Visualizar"} aria-expanded={aberto} onClick={() => { setExpandido(aberto ? null : tipo); setPaginaServidores(1); }}><i className={`pi ${aberto ? "pi-chevron-up" : "pi-chevron-down"}`} aria-hidden="true" /></button></td></tr>
        {aberto && <tr className="v2v-expanded-row"><td colSpan={4}><div className="v2v-expanded">{TIPOS_INGRESSO.has(tipo) && <div className="v2v-origin-notice" role="note"><i className="pi pi-info-circle" aria-hidden="true" /><div><strong>O cadastro desse Vínculo ocorre pelo módulo de Ingresso. Não é permitido cadastrá-lo manualmente nesta tela.</strong><span>Os vínculos ativos são gerados automaticamente durante a conclusão do processo de ingresso.</span></div></div>}<div className="v2v-expanded-head"><div><strong>Servidores com Vínculo</strong><span>{linhas.length} vínculo(s) neste tipo</span></div>{!TIPOS_INGRESSO.has(tipo) && <button type="button" className="v2v-primary" onClick={() => navigate(`${BASE}/novo?tipo=${encodeURIComponent(tipo)}`)}><i className="pi pi-plus" />Cadastrar Vínculo</button>}</div><div className="v2v-table-wrap"><table className="v2v-table v2v-inner-table"><thead><tr><th>Matrícula</th><th>Nº do Vínculo</th><th>Servidor</th><th>CPF</th><th>Lotação</th><th>Cargo/Função</th><th>Data de Início</th><th>Situação</th><th>Ação</th></tr></thead><tbody>{linhas.slice((paginaAtual - 1) * porPaginaServidores, paginaAtual * porPaginaServidores).map((v) => <tr key={v.id}><td>{v.matricula}</td><td>{v.numero}</td><td>{v.nome}</td><td>{v.cpf}</td><td>{v.setor || "—"}</td><td>{v.cargo}</td><td>{dataBr(v.inicio)}</td><td><SituacaoTag situacao={situacaoDoVinculo(v)} /></td><td><button type="button" className="v2v-icon-action" aria-label="Ver detalhes" title="Ver detalhes" onClick={() => navigate(`${BASE}/${v.id}?tipo=${encodeURIComponent(tipo)}`)}><i className="pi pi-eye" aria-hidden="true" /></button></td></tr>)}{linhas.length === 0 && <tr><td colSpan={9} className="v2v-empty">{TIPOS_INGRESSO.has(tipo) ? "Nenhum vínculo ativo encontrado para este Tipo de Vínculo." : "Nenhum vínculo ativo encontrado neste tipo."}</td></tr>}</tbody></table></div><PaginacaoV2 nome="servidores" pagina={paginaAtual} totalPaginas={totalPaginas} porPagina={porPaginaServidores} mudarPagina={setPaginaServidores} mudarPorPagina={(quantidade) => { setPorPaginaServidores(quantidade); setPaginaServidores(1); }} /></div></td></tr>}</Fragment>; })}
      {tiposVisiveis.length === 0 && <tr><td colSpan={4} className="v2v-empty">Nenhum vínculo encontrado para os filtros informados.</td></tr>}
    </tbody></table></div><PaginacaoV2 nome="tipos de vínculo" pagina={paginaTiposAtual} totalPaginas={totalPaginasTipos} porPagina={porPaginaTipos} mudarPagina={(numero) => { setPaginaTipos(numero); setExpandido(null); setPaginaServidores(1); }} mudarPorPagina={(quantidade) => { setPorPaginaTipos(quantidade); setPaginaTipos(1); setExpandido(null); }} /></section>
  </>);
}

export function VinculoV2CadastroPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();
  const [existente] = useState(() => id ? todos().find((v) => v.id === id) : undefined);
  const tipoInicial = existente?.tipo ?? TIPOS.find((t) => t === params.get("tipo")) ?? TIPOS[0];
  const [tipo, setTipo] = useState<Tipo>(tipoInicial);
  const config = configTipo(tipo);
  const opcoes = opcoesCargo(config, existente?.cargo ?? config.cargos[0] ?? "");
  const [cpf, setCpf] = useState(existente?.cpf ?? "");
  const [pessoa, setPessoa] = useState<Pessoa | null>(existente ?? null);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);
  const [campos, setCampos] = useState<Campos>(() => ({
    ...emptyCampos,
    regime: existente?.regime ?? config.regimes[0] ?? "",
    carreira: existente?.carreira ?? config.carreiras[0] ?? "",
    cargo: existente?.cargo ?? config.cargos[0] ?? "",
    perfil: existente?.perfil ?? opcoes.perfis[0] ?? "",
    jornada: existente?.jornada ?? opcoes.jornadas[0] ?? "",
    matricula: existente?.matricula ?? "",
    orgao: existente?.orgao ?? "",
    setor: existente?.setor ?? "",
    inicio: existente?.inicio ?? "",
    vacanciaData: existente?.vacanciaData ?? "",
    vacanciaForma: existente?.vacanciaForma ?? "",
    observacao: existente?.observacao ?? "",
  }));
  const [erro, setErro] = useState("");
  const [registros] = useState(todos);
  const candidatos: Pessoa[] = [...new Map([...registros, ...PESSOAS].map((registro) => [digitosCpf(registro.cpf), { nome: registro.nome, cpf: registro.cpf, nascimento: registro.nascimento, matricula: registro.matricula }])).values()];
  const consultaCpf = digitosCpf(cpf);
  const sugestoes = consultaCpf.length >= 3 ? candidatos.filter((candidato) => digitosCpf(candidato.cpf).includes(consultaCpf)) : candidatos;
  const numeroVinculo = existente?.numero ?? (pessoa ? String(Math.max(0, ...registros.filter((v) => v.cpf === pessoa.cpf).map((v) => Number(v.numero) || 0)) + 1) : "");
  const situacao = situacaoDoVinculo(campos);
  const opcoesAtuais = opcoesCargo(config, campos.cargo);
  const atualizar = (campo: keyof Campos, valor: string) => setCampos((atual) => ({ ...atual, [campo]: valor }));
  const voltar = () => navigate(existente ? `${BASE}/${existente.id}?tipo=${encodeURIComponent(existente.tipo)}` : `${BASE}?expand=${encodeURIComponent(tipo)}`);
  const mudarTipo = (valor: Tipo) => {
    const proxima = configTipo(valor);
    setTipo(valor);
    const opcoes = opcoesCargo(proxima, proxima.cargos[0] ?? "");
    setCampos((atual) => ({ ...atual, regime: proxima.regimes[0] ?? "", carreira: proxima.carreiras[0] ?? "", cargo: proxima.cargos[0] ?? "", perfil: opcoes.perfis[0] ?? "", jornada: opcoes.jornadas[0] ?? "" }));
  };
  const selecionarPessoa = (selecionada: Pessoa) => {
    setCpf(selecionada.cpf);
    setPessoa(selecionada);
    setMostrarSugestoes(false);
    setIndiceAtivo(-1);
    setErro("");
    atualizar("matricula", selecionada.matricula);
  };
  const salvar = (evento: FormEvent) => {
    evento.preventDefault();
    if (!existente && TIPOS_INGRESSO.has(tipo)) { setErro("Este Tipo de Vínculo é gerado pelo módulo de Ingresso e não permite cadastro manual."); return; }
    if (!pessoa) { setErro("Selecione um CPF da lista antes de salvar."); return; }
    if (!campos.matricula.trim() || !campos.regime || !campos.cargo || !campos.perfil || !campos.jornada || !campos.orgao || !campos.setor || !campos.inicio || (config.carreiras.length > 0 && !campos.carreira)) {
      setErro("Preencha todos os campos obrigatórios do vínculo."); return;
    }
    if (Boolean(campos.vacanciaData) !== Boolean(campos.vacanciaForma)) {
      setErro("Informe a Data de Vacância e a Forma de Vacância juntas."); return;
    }
    if (campos.vacanciaData && campos.vacanciaData < campos.inicio) {
      setErro("A Data de Vacância não pode ser anterior ao início do exercício."); return;
    }
    const novo: Vinculo = {
      ...existente,
      id: existente?.id ?? gerarId(), tipo, ...pessoa, ...campos,
      matricula: campos.matricula.trim(), numero: numeroVinculo,
      termino: existente?.termino ?? "", situacao,
    };
    localStorage.setItem(STORAGE, JSON.stringify([...salvos().filter((v) => v.id !== novo.id), novo]));
    navigate(`${BASE}/${novo.id}?tipo=${encodeURIComponent(tipo)}`);
  };
  if (id && !existente) return layout("Editar Vínculo", null, <div className="v2v-notice">Vínculo não encontrado.</div>);
  if (!existente && TIPOS_INGRESSO.has(tipoInicial)) return layout("Cadastrar Vínculo", null,
    <div className="v2v-origin-notice" role="alert"><i className="pi pi-info-circle" aria-hidden="true" /><strong>Este Tipo de Vínculo é gerado pelo módulo de Ingresso e não permite cadastro manual.</strong></div>);
  return layout(existente ? "Editar Vínculo" : "Cadastrar Vínculo", null, <form onSubmit={salvar} className="v2v-form">
    <section className="v2v-panel v2v-form-section v2v-server-section" aria-labelledby="v2v-servidor-title">
      <header className="v2v-section-header"><i className="pi pi-user" aria-hidden="true" /><div><h2 id="v2v-servidor-title">Dados do Servidor</h2><p>Identifique o servidor e o tipo de vínculo.</p></div></header>
      <div className="v2v-section-body v2v-form-grid v2v-grid-three">
        <label>CPF <em>*</em><span className="v2v-cpf-dropdown">
          <input role="combobox" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded={mostrarSugestoes && sugestoes.length > 0} aria-controls="v2v-cpf-options" aria-activedescendant={indiceAtivo >= 0 && mostrarSugestoes ? `v2v-cpf-option-${indiceAtivo}` : undefined} value={cpf} readOnly={Boolean(existente)} onChange={(e) => { const valor = mascararCpf(e.target.value); setCpf(valor); setPessoa(null); setMostrarSugestoes(true); setIndiceAtivo(-1); setCampos((atual) => ({ ...atual, matricula: "" })); setErro(""); }} onFocus={() => { if (!existente) setMostrarSugestoes(true); }} onClick={() => { if (!existente) setMostrarSugestoes(true); }} onBlur={() => setMostrarSugestoes(false)} onKeyDown={(e) => { if (e.key === "ArrowDown" && sugestoes.length) { e.preventDefault(); setMostrarSugestoes(true); setIndiceAtivo((indice) => (indice + 1) % sugestoes.length); } else if (e.key === "ArrowUp" && sugestoes.length) { e.preventDefault(); setIndiceAtivo((indice) => indice <= 0 ? sugestoes.length - 1 : indice - 1); } else if (e.key === "Enter" && mostrarSugestoes && sugestoes.length) { e.preventDefault(); selecionarPessoa(sugestoes[indiceAtivo >= 0 ? indiceAtivo : 0]); } else if (e.key === "Escape") { setMostrarSugestoes(false); setIndiceAtivo(-1); } }} placeholder="000.000.000-00" inputMode="numeric" autoComplete="off" maxLength={14} />
          <i className="pi pi-chevron-down" aria-hidden="true" />
          {mostrarSugestoes && sugestoes.length > 0 && <ul id="v2v-cpf-options" role="listbox">{sugestoes.map((candidato, indice) => <li key={candidato.cpf} id={`v2v-cpf-option-${indice}`} role="option" aria-selected={indice === indiceAtivo} tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => selecionarPessoa(candidato)} onKeyDown={(e) => { if (e.key === "Enter") selecionarPessoa(candidato); }}>{candidato.cpf} — {candidato.nome}</li>)}</ul>}
        </span></label>
        <label>Nome <em>*</em><input value={pessoa?.nome ?? ""} readOnly placeholder="Nome da Pessoa Física" /></label>
        <label>Tipo de Vínculo <em>*</em><select value={tipo} disabled={Boolean(existente)} onChange={(e) => mudarTipo(e.target.value as Tipo)}>{TIPOS.filter((opcao) => !TIPOS_INGRESSO.has(opcao) || opcao === tipo).map((opcao) => <option key={opcao}>{opcao}</option>)}</select></label>
      </div>
      {mostrarSugestoes && consultaCpf.length >= 3 && sugestoes.length === 0 && <div className="v2v-notice"><i className="pi pi-info-circle" aria-hidden="true" />CPF não encontrado no cadastro de Pessoa Física. <button type="button" className="v2v-link" onClick={() => navigate(`/prototipos/sigep/pessoa-fisica/novo?cpf=${encodeURIComponent(cpf)}`)}>Cadastrar Pessoa Física</button></div>}
    </section>
    <section className="v2v-panel v2v-form-section" aria-labelledby="v2v-vinculo-title">
      <header className="v2v-section-header"><i className="pi pi-id-card" aria-hidden="true" /><div><h2 id="v2v-vinculo-title">Dados do Vínculo</h2><p>Informe a matrícula e o número do vínculo.</p></div></header>
      <div className="v2v-section-body v2v-form-grid v2v-grid-two">
        <label>Matrícula <em>*</em><input value={campos.matricula} readOnly={Boolean(existente)} onChange={(e) => atualizar("matricula", e.target.value)} /></label>
        <label>Nº do Vínculo <em>*</em><input value={numeroVinculo} readOnly /></label>
      </div>
    </section>
    <section className="v2v-panel v2v-form-section" aria-labelledby="v2v-caracteristicas-title">
      <header className="v2v-section-header"><i className="pi pi-briefcase" aria-hidden="true" /><div><h2 id="v2v-caracteristicas-title">Características do Vínculo</h2><p>Informe as características funcionais e a vigência do vínculo.</p></div></header>
      <div className="v2v-section-body v2v-form-grid v2v-grid-four">
        <label>Regime Jurídico <em>*</em><select value={campos.regime} onChange={(e) => atualizar("regime", e.target.value)}>{config.regimes.map((opcao) => <option key={opcao}>{opcao}</option>)}</select></label>
        <label>Carreira{config.carreiras.length > 0 && <em>*</em>}<select value={campos.carreira} disabled={!config.carreiras.length} onChange={(e) => atualizar("carreira", e.target.value)}>{!config.carreiras.length && <option value="">Não se aplica</option>}{config.carreiras.map((opcao) => <option key={opcao}>{opcao}</option>)}</select></label>
        <label>Cargo <em>*</em><select value={campos.cargo} onChange={(e) => { const proximas = opcoesCargo(config, e.target.value); setCampos((atual) => ({ ...atual, cargo: e.target.value, perfil: proximas.perfis[0] ?? "", jornada: proximas.jornadas[0] ?? "" })); }}>{config.cargos.map((opcao) => <option key={opcao}>{opcao}</option>)}</select></label>
        <label>Perfil Profissional <em>*</em><select value={campos.perfil} onChange={(e) => atualizar("perfil", e.target.value)}>{opcoesAtuais.perfis.map((opcao) => <option key={opcao}>{opcao}</option>)}</select></label>
        <label>Jornada de Trabalho <em>*</em><select value={campos.jornada} onChange={(e) => atualizar("jornada", e.target.value)}>{opcoesAtuais.jornadas.map((opcao) => <option key={opcao}>{opcao}</option>)}</select></label>
        <label>Órgão/Entidade <em>*</em><select value={campos.orgao} onChange={(e) => setCampos((atual) => ({ ...atual, orgao: e.target.value, setor: "" }))}><option value="">Selecione...</option>{ORGAOS.map((orgao) => <option key={orgao} value={orgao}>{orgao}</option>)}</select></label>
        <label>Lotação <em>*</em><select value={campos.setor} disabled={!campos.orgao} onChange={(e) => atualizar("setor", e.target.value)}><option value="">Selecione...</option>{(SETORES[campos.orgao] ?? []).map((setor) => <option key={setor} value={setor}>{setor}</option>)}</select></label>
        <label>Data de Início do Exercício <em>*</em><input type="date" value={campos.inicio} onChange={(e) => atualizar("inicio", e.target.value)} /></label>
        <div className="v2v-status-field"><span>Situação do Vínculo</span><div><SituacaoTag situacao={situacao} /><small>Calculada automaticamente</small></div></div>
        <label>Data de Vacância{campos.vacanciaForma && <em>*</em>}<input type="date" value={campos.vacanciaData} onChange={(e) => atualizar("vacanciaData", e.target.value)} /></label>
        <label>Forma de Vacância{campos.vacanciaData && <em>*</em>}<select value={campos.vacanciaForma} onChange={(e) => atualizar("vacanciaForma", e.target.value)}><option value="">Selecione...</option><option>Exoneração</option><option>Término de contrato</option><option>Aposentadoria</option></select></label>
      </div>
    </section>
    <section className="v2v-panel v2v-form-section" aria-labelledby="v2v-observacao-title">
      <header className="v2v-section-header"><i className="pi pi-file-edit" aria-hidden="true" /><div><h2 id="v2v-observacao-title">Observação</h2><p>Registre informações complementares sobre o vínculo.</p></div></header>
      <div className="v2v-section-body"><label>Observação<textarea value={campos.observacao} maxLength={500} placeholder="Registre uma observação, se necessário." onChange={(e) => atualizar("observacao", e.target.value)} /></label><small className="v2v-character-count">{campos.observacao.length}/500</small></div>
    </section>
    {erro && <div className="v2v-error" role="alert">{erro}</div>}
    <div className="v2v-form-actions"><button type="button" className="v2v-secondary" onClick={voltar}><i className="pi pi-arrow-left" aria-hidden="true" />Voltar</button><button type="submit" className="v2v-primary" disabled={!pessoa}><i className="pi pi-check" aria-hidden="true" />Salvar</button></div>
  </form>);
}

function DadoDetalhe({ nome, valor }: { nome: string; valor: React.ReactNode }) {
  return <div><small>{nome}</small><strong>{valor}</strong></div>;
}

export function VinculoV2DetalhesPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();
  const vinculo = todos().find((v) => v.id === id);
  const voltar = () => navigate(`${BASE}?expand=${encodeURIComponent(params.get("tipo") || vinculo?.tipo || "")}`);
  if (!vinculo) return layout("Detalhes do Vínculo", null, <><div className="v2v-notice">Vínculo não encontrado.</div><div className="v2v-form-actions v2v-detail-actions"><button type="button" className="v2v-secondary" onClick={voltar}><i className="pi pi-arrow-left" aria-hidden="true" />Voltar</button></div></>);
  const situacao = situacaoDoVinculo(vinculo);

  return layout("Detalhes do Vínculo", null, <>
    <section className="v2v-panel v2v-form-section v2v-server-section" aria-labelledby="v2v-servidor-title"><header className="v2v-section-header"><i className="pi pi-user" aria-hidden="true" /><div><h2 id="v2v-servidor-title">Dados do Servidor</h2></div></header><div className="v2v-section-body v2v-detail-grid v2v-grid-three"><DadoDetalhe nome="Nome" valor={vinculo.nome} /><DadoDetalhe nome="CPF" valor={vinculo.cpf} /><DadoDetalhe nome="Tipo de Vínculo" valor={vinculo.tipo} /></div></section>
    <section className="v2v-panel v2v-form-section" aria-labelledby="v2v-vinculo-title"><header className="v2v-section-header"><i className="pi pi-id-card" aria-hidden="true" /><div><h2 id="v2v-vinculo-title">Dados do Vínculo</h2></div></header><div className="v2v-section-body v2v-detail-grid v2v-grid-two"><DadoDetalhe nome="Matrícula" valor={vinculo.matricula} /><DadoDetalhe nome="Nº do Vínculo" valor={vinculo.numero} /></div></section>
    <section className="v2v-panel v2v-form-section" aria-labelledby="v2v-caracteristicas-title"><header className="v2v-section-header"><i className="pi pi-briefcase" aria-hidden="true" /><div><h2 id="v2v-caracteristicas-title">Características do Vínculo</h2></div></header><div className="v2v-section-body v2v-detail-grid v2v-grid-four"><DadoDetalhe nome="Regime Jurídico" valor={vinculo.regime} /><DadoDetalhe nome="Carreira" valor={vinculo.carreira || "Não se aplica"} /><DadoDetalhe nome="Cargo" valor={vinculo.cargo} /><DadoDetalhe nome="Perfil Profissional" valor={vinculo.perfil} /><DadoDetalhe nome="Jornada de Trabalho" valor={vinculo.jornada} /><DadoDetalhe nome="Órgão/Entidade" valor={vinculo.orgao || "Não informado"} /><DadoDetalhe nome="Lotação" valor={vinculo.setor || "Não informada"} /><DadoDetalhe nome="Data de Início do Exercício" valor={dataBr(vinculo.inicio)} /><DadoDetalhe nome="Situação do Vínculo" valor={<SituacaoTag situacao={situacao} />} /><DadoDetalhe nome="Data de Vacância" valor={vinculo.vacanciaData ? dataBr(vinculo.vacanciaData) : "Não informada"} /><DadoDetalhe nome="Forma de Vacância" valor={vinculo.vacanciaForma || "Não informada"} /></div></section>
    <section className="v2v-panel v2v-form-section" aria-labelledby="v2v-observacao-title"><header className="v2v-section-header"><i className="pi pi-file-edit" aria-hidden="true" /><div><h2 id="v2v-observacao-title">Observação</h2></div></header><div className="v2v-section-body v2v-detail-grid"><DadoDetalhe nome="Observação" valor={vinculo.observacao || "Não informada"} /></div></section>
    <div className="v2v-form-actions v2v-detail-actions"><button type="button" className="v2v-secondary" onClick={voltar}><i className="pi pi-arrow-left" aria-hidden="true" />Voltar</button></div>
  </>, situacao);
}