import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  BadgeSeplag,
  BotaoAdicionarSeplag,
  BotaoIconSeplag,
  BotaoLimparFiltroSeplag,
  BreadcrumbSeplag,
  CardSeplag,
  DropdownFieldSeplag,
  ModalSeplag,
  TablePaginadoSeplag,
  TextFieldSeplag,
  type ColumnMetaSeplag,
} from "../../componentes";
import type { ResultsSeplag } from "../../interfaces/Results";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import "./cessoesList.css";

type TipoCessao = "INTERNA" | "EXTERNA";
type SituacaoCessao = "RASCUNHO" | "AGUARDANDO_CEDENTE" | "DEVOLVIDA" | "INDEFERIDA" | "AGUARDANDO_SEPLAG" | "AGUARDANDO_PUBLICACAO" | "PUBLICADA" | "ATIVA" | "EM_PRORROGACAO" | "ENCERRADA";
type PerfilAcesso = "SOLICITANTE_CESSIONARIO" | "SOLICITADO_CEDENTE" | "SEPLAG";

interface UsuarioPrototype {
  id: string;
  nome: string;
  perfil: PerfilAcesso;
  perfilLabel: string;
  orgao: string;
}

interface CessaoListItem {
  id: string;
  servidor: string;
  matricula: string;
  tipo: TipoCessao;
  orgaoCedente: string;
  orgaoCessionario: string;
  inicio: string;
  fim: string;
  etapaAtual: string;
  situacao: SituacaoCessao;
}

interface FiltrosCessao {
  termo: string;
  tipo: TipoCessao | "";
  situacao: SituacaoCessao | "";
  orgaoCessionario: string;
  orgaoCedente: string;
  etapaAtual: string;
}

const USUARIO_STORAGE_KEY = "sigep-prototype-cessoes-user";
const usuariosPrototype: UsuarioPrototype[] = [
  { id: "cessionario-seplag", nome: "Camila Rodrigues", perfil: "SOLICITANTE_CESSIONARIO", perfilLabel: "Solicitante — órgão cessionário", orgao: "SEPLAG" },
  { id: "cedente-sefaz", nome: "Bruno Almeida", perfil: "SOLICITADO_CEDENTE", perfilLabel: "Solicitado — órgão cedente", orgao: "SEFAZ" },
  { id: "analista-seplag", nome: "Fernanda Nunes", perfil: "SEPLAG", perfilLabel: "SEPLAG — aprovação central", orgao: "SEPLAG" },
];

const perfilOpcaoLabel: Record<PerfilAcesso, string> = {
  SOLICITANTE_CESSIONARIO: "Cessionário",
  SOLICITADO_CEDENTE: "Cedente",
  SEPLAG: "SEPLAG",
};

const REGISTROS_STORAGE_KEY = "sigep-prototype-cessoes-registros";

function carregarRegistros(): CessaoListItem[] {
  try {
    const salvo = window.localStorage.getItem(REGISTROS_STORAGE_KEY);
    return salvo ? JSON.parse(salvo) as CessaoListItem[] : [];
  } catch {
    return [];
  }
}

const criarOpcoesOrgao = (orgaos: string[]) => [
  { label: "Todos", value: "" },
  ...Array.from(new Set(orgaos)).sort((a, b) => a.localeCompare(b, "pt-BR")).map((orgao) => ({ label: orgao, value: orgao })),
];

const tipoOptions = [
  { label: "Todos", value: "" },
  { label: "Interna", value: "INTERNA" },
  { label: "Externa", value: "EXTERNA" },
];

const situacaoLabels: Record<SituacaoCessao, string> = {
  RASCUNHO: "Rascunho",
  AGUARDANDO_CEDENTE: "Aguardando confirmação do cedente",
  DEVOLVIDA: "Devolvida para correção",
  INDEFERIDA: "Indeferida pelo cedente",
  AGUARDANDO_SEPLAG: "Aguardando aprovação da SEPLAG",
  AGUARDANDO_PUBLICACAO: "Aguardando publicação",
  PUBLICADA: "Publicada — aguardando início",
  ATIVA: "Ativa",
  EM_PRORROGACAO: "Em prorrogação",
  ENCERRADA: "Encerrada",
};

const situacaoOptions = [
  { label: "Todas", value: "" },
  ...Object.entries(situacaoLabels).map(([value, label]) => ({ value, label })),
];

const badgeStyles: Record<SituacaoCessao, { color: string; bg: string }> = {
  RASCUNHO: { color: "#475467", bg: "#f2f4f7" },
  AGUARDANDO_CEDENTE: { color: "#8a5c00", bg: "#fff1cf" },
  DEVOLVIDA: { color: "#9a3412", bg: "#ffedd5" },
  INDEFERIDA: { color: "#b42318", bg: "#fee4e2" },
  AGUARDANDO_SEPLAG: { color: "#0b6199", bg: "#e9f3fc" },
  AGUARDANDO_PUBLICACAO: { color: "#6b3fa0", bg: "#f1e9fb" },
  PUBLICADA: { color: "#175cd3", bg: "#eaf2ff" },
  ATIVA: { color: "#147441", bg: "#e2f5e8" },
  EM_PRORROGACAO: { color: "#8a5c00", bg: "#fff1cf" },
  ENCERRADA: { color: "#475467", bg: "#eaecf0" },
};

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function toResults(content: CessaoListItem[], page: number, rows: number): ResultsSeplag<CessaoListItem> {
  const totalPages = Math.max(1, Math.ceil(content.length / rows));
  const pageActual = Math.min(page, totalPages - 1);
  const paged = content.slice(pageActual * rows, pageActual * rows + rows);
  return { content: paged, totalPages, totalRecords: content.length, size: rows, sizePage: rows, pageActual, first: pageActual === 0, last: pageActual === totalPages - 1, numberOfElements: paged.length, number: pageActual, empty: paged.length === 0 };
}

function usuarioInicial() {
  const salvo = window.localStorage.getItem(USUARIO_STORAGE_KEY);
  return usuariosPrototype.find((item) => item.id === salvo)?.id ?? usuariosPrototype[0].id;
}

export function PrototiposCessoesPage() {
  const navigate = useNavigate();
  const [modalTipoAberto, setModalTipoAberto] = useState(false);
  const [registros, setRegistros] = useState<CessaoListItem[]>(carregarRegistros);
  useEffect(() => {
    const atualizar = () => setRegistros(carregarRegistros());
    atualizar();
    window.addEventListener("storage", atualizar);
    window.addEventListener("sigep-cessoes-updated", atualizar);
    return () => {
      window.removeEventListener("storage", atualizar);
      window.removeEventListener("sigep-cessoes-updated", atualizar);
    };
  }, []);
  const { control, watch, reset } = useForm<FiltrosCessao>({ defaultValues: { termo: "", tipo: "", situacao: "", orgaoCessionario: "", orgaoCedente: "", etapaAtual: "" } });
  const [usuarioId, setUsuarioId] = useState(usuarioInicial);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(10);
  const termo = watch("termo");
  const tipo = watch("tipo");
  const situacao = watch("situacao");
  const orgaoCessionario = watch("orgaoCessionario");
  const orgaoCedente = watch("orgaoCedente");
  const etapaAtual = watch("etapaAtual");
  const usuario = usuariosPrototype.find((item) => item.id === usuarioId) ?? usuariosPrototype[0];
  const orgaoCessionarioOptions = useMemo(() => criarOpcoesOrgao(registros.map((item) => item.orgaoCessionario)), [registros]);
  const orgaoCedenteOptions = useMemo(() => criarOpcoesOrgao(registros.map((item) => item.orgaoCedente)), [registros]);
  const etapaOptions = useMemo(() => criarOpcoesOrgao(registros.map((item) => item.etapaAtual)), [registros]);

  const registrosVisiveis = useMemo(() => {
    if (usuario.perfil === "SEPLAG") return registros;
    if (usuario.perfil === "SOLICITANTE_CESSIONARIO") return registros.filter((item) => item.orgaoCessionario === usuario.orgao);
    return registros.filter((item) => item.orgaoCedente.split(" / ").includes(usuario.orgao));
  }, [registros, usuario]);

  const filtrados = useMemo(() => {
    const query = normalize(termo.trim());
    return registrosVisiveis.filter((item) => {
      const texto = normalize([item.servidor, item.matricula].join(" "));
      return (!query || texto.includes(query)) && (!tipo || item.tipo === tipo) && (!situacao || item.situacao === situacao) && (!orgaoCessionario || item.orgaoCessionario === orgaoCessionario) && (!orgaoCedente || item.orgaoCedente === orgaoCedente) && (!etapaAtual || item.etapaAtual === etapaAtual);
    });
  }, [registrosVisiveis, termo, tipo, situacao, orgaoCessionario, orgaoCedente, etapaAtual]);

  const aguardandoMinhaAcao = registrosVisiveis.filter((item) =>
    (usuario.perfil === "SOLICITANTE_CESSIONARIO" && item.situacao === "DEVOLVIDA") ||
    (usuario.perfil === "SOLICITADO_CEDENTE" && item.situacao === "AGUARDANDO_CEDENTE") ||
    (usuario.perfil === "SEPLAG" && item.situacao === "AGUARDANDO_SEPLAG"),
  ).length;

  const indicadores = [
    { label: "Aguardando minha ação", value: aguardandoMinhaAcao, icon: "pi pi-inbox", tone: "amber" },
    { label: "Em andamento", value: registrosVisiveis.filter((item) => !["ATIVA", "ENCERRADA"].includes(item.situacao)).length, icon: "pi pi-clock", tone: "blue" },
    { label: "Aguardando publicação", value: registrosVisiveis.filter((item) => item.situacao === "AGUARDANDO_PUBLICACAO").length, icon: "pi pi-file-export", tone: "purple" },
    { label: "Cessões ativas", value: registrosVisiveis.filter((item) => item.situacao === "ATIVA").length, icon: "pi pi-check-circle", tone: "green" },
  ];

  const columns: ColumnMetaSeplag<CessaoListItem>[] = [
    { header: "Servidor", body: (row) => <div className="prototype-cessoes-person"><strong>{row.servidor}</strong><small>Matrícula: {row.matricula}</small></div> },
    { header: "Tipo", body: (row) => <span>{row.tipo === "INTERNA" ? "Interna" : "Externa"}</span> },
    { header: "Cessionário", field: "orgaoCessionario" },
    { header: "Cedente", field: "orgaoCedente" },
    { header: "Período", body: (row) => <div className="prototype-cessoes-period"><span>{row.inicio}</span><small>até {row.fim}</small></div> },
    { header: "Etapa atual", field: "etapaAtual" },
    { header: "Situação", body: (row) => <BadgeSeplag label={situacaoLabels[row.situacao]} color={badgeStyles[row.situacao].color} bg={badgeStyles[row.situacao].bg} border="transparent" size="sm" /> },
  ];

  const data = toResults(filtrados, page, rows);
  const limpar = () => { reset({ termo: "", tipo: "", situacao: "", orgaoCessionario: "", orgaoCedente: "", etapaAtual: "" }); setPage(0); };
  const trocarUsuario = (id: string) => {
    window.localStorage.setItem(USUARIO_STORAGE_KEY, id);
    setUsuarioId(id);
    limpar();
  };
  const acaoDaLinha = (row: CessaoListItem) => {
    if (usuario.perfil === "SOLICITANTE_CESSIONARIO" && row.situacao === "DEVOLVIDA") return { label: "Corrigir solicitação", icon: "pi pi-pencil" };
    if (usuario.perfil === "SOLICITADO_CEDENTE" && row.situacao === "AGUARDANDO_CEDENTE") return { label: "Confirmar cessão", icon: "pi pi-check-circle" };
    if (usuario.perfil === "SEPLAG" && row.situacao === "AGUARDANDO_SEPLAG") return { label: "Analisar cessão", icon: "pi pi-search" };
    return { label: "Visualizar cessão", icon: "pi pi-eye" };
  };

  return <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
    <div className="prototype-page-content prototype-page-content--white prototype-cessoes-page">
      <div className="prototype-cessoes-breadcrumb-row">
        <BreadcrumbSeplag divided className="prototype-doc-breadcrumb" items={[{ label: "Movimentação" }, { label: "Cessão" }]} />
        <label className="prototype-cessoes-user-switcher">
          <span><i className="pi pi-users" aria-hidden="true" /> Simular perfil</span>
          <select value={usuarioId} onChange={(event) => trocarUsuario(event.target.value)} aria-label="Trocar perfil do protótipo">
            {usuariosPrototype.map((item) => <option key={item.id} value={item.id}>{perfilOpcaoLabel[item.perfil]}</option>)}
          </select>
          <small>{usuario.perfilLabel} • Órgão {usuario.orgao}. Recurso exclusivo do protótipo.</small>
        </label>
      </div>
      <CardSeplag title="Cessões" cols="12" cardHeaderClassNames="prototype-regime-card prototype-ingressos-card">
        <div className="col-12 prototype-cessoes-content">
          <p className="prototype-ingressos-teste-support">Solicite, acompanhe e gerencie os processos de cessão de servidores.</p>
          <hr className="prototype-ingressos-teste-header-divider" />

          <section className="prototype-ingressos-teste-indicators prototype-cessoes-indicators" aria-label="Indicadores de cessões">
            {indicadores.map((item) => <article key={item.label} className={`prototype-ingressos-teste-indicator prototype-ingressos-teste-indicator--${item.tone}`}>
              <span className="prototype-ingressos-teste-indicator-icon" aria-hidden="true"><i className={item.icon} /></span>
              <div><span>{item.label}</span><strong>{item.value.toLocaleString("pt-BR")}</strong></div>
            </article>)}
          </section>

          <div className="grid prototype-cessoes-filters">
            <TextFieldSeplag name="termo" control={control} label="Nome, matrícula" placeholder="Pesquisar" cols="12" getFormErrorMessage={() => null} />
            <DropdownFieldSeplag name="tipo" control={control} label="Tipo" options={tipoOptions} optionLabel="label" optionValue="value" placeholder="Todos" cols="12" getFormErrorMessage={() => null} onChange={() => setPage(0)} />
            <DropdownFieldSeplag name="orgaoCessionario" control={control} label="Cessionário" options={orgaoCessionarioOptions} optionLabel="label" optionValue="value" placeholder="Todos" cols="12" getFormErrorMessage={() => null} onChange={() => setPage(0)} />
            <DropdownFieldSeplag name="orgaoCedente" control={control} label="Cedente" options={orgaoCedenteOptions} optionLabel="label" optionValue="value" placeholder="Todos" cols="12" getFormErrorMessage={() => null} onChange={() => setPage(0)} />
            <DropdownFieldSeplag name="etapaAtual" control={control} label="Etapa atual" options={etapaOptions} optionLabel="label" optionValue="value" placeholder="Todas" cols="12" getFormErrorMessage={() => null} onChange={() => setPage(0)} />
            <DropdownFieldSeplag name="situacao" control={control} label="Situação" options={situacaoOptions} optionLabel="label" optionValue="value" placeholder="Todas" cols="12" getFormErrorMessage={() => null} onChange={() => setPage(0)} />
            <div className="prototype-cessoes-clear"><BotaoLimparFiltroSeplag type="button" label="Limpar filtros" icon="pi pi-refresh" onClick={limpar} /></div>
          </div>

          {usuario.perfil === "SOLICITANTE_CESSIONARIO" && <div className="prototype-cessoes-actions"><BotaoAdicionarSeplag label="Nova solicitação de cessão" onClick={() => setModalTipoAberto(true)} /></div>}

          <div className="prototype-cessoes-table">
            <TablePaginadoSeplag key={usuarioId} dataKey="id" data={data} rows={rows} rowsPerPage={[10, 25, 50]} paginator={filtrados.length > 10} lazy={false} selectionMode={null} columns={columns} hasEventoAcao handleAdicionar={null} handleEdit={null} handleDelete={null} handleView={null}
              handleOnPageChange={(event) => { setPage(event.page ?? 0); setRows(event.rows ?? 10); }} actionHeader="Ações" renderBotoes={(row) => {
                const acao = acaoDaLinha(row);
                const analisarComoCedente = usuario.perfil === "SOLICITADO_CEDENTE" && row.situacao === "AGUARDANDO_CEDENTE";
                const corrigirComoCessionario = usuario.perfil === "SOLICITANTE_CESSIONARIO" && row.situacao === "DEVOLVIDA";
                const analisarComoSeplag = usuario.perfil === "SEPLAG" && row.situacao === "AGUARDANDO_SEPLAG";
                return <BotaoIconSeplag type="button" icon={acao.icon} tooltip={`${acao.label}: ${row.id}`} aria-label={`${acao.label}: ${row.id}`} onClick={() => analisarComoCedente ? navigate(`/prototipos/sigep/movimentacao/cessoes/${row.id}/analise-cedente`) : corrigirComoCessionario ? navigate(`/prototipos/sigep/movimentacao/cessoes/${row.id}/corrigir`) : analisarComoSeplag ? navigate(`/prototipos/sigep/movimentacao/cessoes/${row.id}/analise-seplag`) : window.alert(`${acao.label}: tela a implementar na próxima etapa.`)} />;
              }} emptyMessage="Nenhuma cessão foi encontrada para os filtros informados." />
          </div>
        </div>
      </CardSeplag>
    </div>
    <ModalSeplag visible={modalTipoAberto} titulo="Nova solicitação de cessão" fechar={() => setModalTipoAberto(false)} hideFooter tamanho="680px">
      <div className="col-12 prototype-cessoes-type-intro">Selecione o tipo de cessão para iniciar a solicitação.</div>
      <div className="col-12 prototype-cessoes-type-options">
        <button type="button" className="prototype-cessoes-type-card" onClick={() => navigate("/prototipos/sigep/movimentacao/cessoes/nova/interna")}>
          <i className="pi pi-building" aria-hidden="true" /><span><strong>Cessão interna</strong><small>Entre órgãos ou entidades do Poder Executivo Estadual.</small></span><i className="pi pi-arrow-right" aria-hidden="true" />
        </button>
        <button type="button" className="prototype-cessoes-type-card" onClick={() => navigate("/prototipos/sigep/movimentacao/cessoes/nova/externa")}>
          <i className="pi pi-globe" aria-hidden="true" /><span><strong>Cessão externa</strong><small>Para órgão ou entidade não integrante do Poder Executivo Estadual.</small></span><i className="pi pi-arrow-right" aria-hidden="true" />
        </button>
      </div>
    </ModalSeplag>
  </PrototypeSystemPage>;
}




