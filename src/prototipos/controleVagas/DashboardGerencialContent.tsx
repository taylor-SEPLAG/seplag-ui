import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MultiSelect } from "primereact/multiselect";
import { CONTROLE_VAGAS_BASE_PATH as BASE } from "./constants";
import { useControleVagasStore } from "./controleVagasStore";
import {
  construirDashboard,
  situacoesLegais,
  type DashboardFiltros,
  type DashboardGrupo,
} from "./dashboardSelectors";
import { orgaosBaseTemporaria } from "./baseTemporaria";
import { SpecArea, SpecificationMode } from "../shared/visualizationModes";
import {
  dashboardAlertSpecifications,
  dashboardBlockSpecifications,
  dashboardBusinessItems,
  dashboardFilterSpecifications,
  dashboardKpiSpecifications,
  dashboardScreenSpecification,
} from "./DashboardSpecifications";
import "./dashboardControleVagas.css";
import "./dashboardGerencial.css";

const hoje = "2026-07-21";
const prioridadeLabel = {
  REGULAR: "Regular",
  ATENCAO: "Atencao",
  CRITICA: "Critica",
  DIVERGENTE: "Divergencia de conciliacao",
} as const;
const legalLabel = {
  REGULAR: "Regular",
  EM_EXTINCAO: "Em extincao",
  EXTINTA: "Extinta",
  EM_TRANSFORMACAO: "Em transformacao",
} as const;
const filtrosIniciais: DashboardFiltros = {
  dataReferencia: hoje,
  orgao: [],
  tipo: [],
  carreira: [],
  cargo: [],
  situacaoLegal: [],
};
const indicadoresDashboardIds = [
  "Cargos legais",
  "Quadros vigentes",
  "Vagas legais",
  "Ocupadas",
  "Disponiveis",
  "Em ocupação",
  "Pendente de ato de distribuicao",
  "Situacoes legais especiais",
] as const;
type IndicadorDashboardId = (typeof indicadoresDashboardIds)[number];

export function DashboardGerencialContent() {
  const state = useControleVagasStore();
  const navigate = useNavigate();
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [detalhe, setDetalhe] = useState<DashboardGrupo | null>(null);
  const [indicadoresVisiveis, setIndicadoresVisiveis] = useState<
    Record<IndicadorDashboardId, boolean>
  >(
    () =>
      Object.fromEntries(indicadoresDashboardIds.map((id) => [id, true])) as Record<
        IndicadorDashboardId,
        boolean
      >,
  );

  const dados = useMemo(() => construirDashboard(state, filtros), [state, filtros]);
  const orgaos = orgaosBaseTemporaria
    .map((item) => item.nome)
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
  const carreiras = [...new Set(state.vagas.map((vaga) => vaga.carreira))].sort();
  const cargos = [...new Set(state.vagas.map((vaga) => vaga.cargo))].sort();
  const eventos = state.movimentos
    .filter((item) => ["DISTRIBUICAO", "REDISTRIBUICAO"].includes(item.tipo))
    .sort((a, b) => b.registradoEm.localeCompare(a.registradoEm))
    .slice(0, 5);

  const indicadores = [
    {
      label: "Cargos legais",
      valor: dados.resumo.cargos,
      hint: "Cargos distintos",
      icon: "pi pi-briefcase",
      cor: "blue",
      onClick: () => navigate(`${BASE}/quadro-autorizado`),
    },
    {
      label: "Quadros vigentes",
      valor: dados.resumo.quadros,
      hint: "Origens legais",
      icon: "pi pi-file-check",
      cor: "blue",
      onClick: () => navigate(`${BASE}/quadro-autorizado`),
    },
    {
      label: "Vagas legais",
      valor: dados.resumo.vagasLegais,
      hint: "Limite vigente",
      icon: "pi pi-balance-scale",
      cor: "blue",
      onClick: () => navigate(`${BASE}/vagas`),
    },
    {
      label: "Ocupadas",
      valor: dados.resumo.ocupadas,
      hint: `${dados.resumo.vagasLegais ? Math.round((dados.resumo.ocupadas / dados.resumo.vagasLegais) * 100) : 0}% do quadro`,
      icon: "pi pi-users",
      cor: "green",
      onClick: () => navigate(`${BASE}/vagas?estado=OCUPADA`),
    },
    {
      label: "Disponiveis",
      valor: dados.resumo.disponiveis,
      hint: `${dados.resumo.livres} livres`,
      icon: "pi pi-check-circle",
      cor: "cyan",
      onClick: () => navigate(`${BASE}/vagas?estado=DISPONIVEL`),
    },
    {
      label: "Em ocupação",
      valor: dados.resumo.comprometidas,
      hint: "Disponiveis vinculadas a ingressos ativos",
      icon: "pi pi-flag",
      cor: "purple",
      onClick: () => navigate(`${BASE}/vagas?comprometimento=OCUPACAO`),
    },
{
      label: "Pendente de ato de distribuicao",
      valor: dados.resumo.naoDistribuidas,
      hint: `${dados.resumo.disponiveisNaoDistribuidas} disponiveis`,
      icon: "pi pi-sitemap",
      cor: "orange",
      onClick: () => navigate(`${BASE}/distribuicao`),
    },
    {
      label: "Situacoes legais especiais",
      valor: dados.resumo.situacoesLegaisEspeciais,
      hint: "Extincao ou transformacao",
      icon: "pi pi-exclamation-triangle",
      cor: "red",
      onClick: () => navigate(`${BASE}/vagas?legal=ESPECIAL`),
    },
  ] satisfies {
    label: IndicadorDashboardId;
    valor: number;
    hint: string;
    icon: string;
    cor: string;
    onClick: () => void;
  }[];

  const alertas = [
    {
      icon: "pi pi-exclamation-triangle",
      kind: "critical",
      titulo: "Quadros sem saldo livre",
      valor: dados.grupos.filter((grupo) => grupo.disponiveisLivres === 0).length,
      rota: "quadro-autorizado",
    },
    {
      icon: "pi pi-gavel",
      kind: "warning",
      titulo: "Ocupacoes judiciais extraquadro",
      valor: dados.resumo.judiciais,
      rota: "vagas?legal=DECISAO_JUDICIAL",
    },
    {
      icon: "pi pi-ban",
      kind: "warning",
      titulo: "Vagas em extincao",
      valor: dados.resumo.emExtincao,
      rota: "vagas?legal=EM_EXTINCAO",
    },
  ];

  return (
    <SpecificationMode
      screen={dashboardScreenSpecification}
      businessItems={dashboardBusinessItems}
    >
      <div className="prototype-dash-page prototype-management-dashboard">
        <header className="prototype-dash-header">
          <div>
            <h1>Dashboard Gerencial</h1>
          </div>
          <div className="prototype-dash-header-actions">
            <small>
              Dados consolidados em
              <br />
              <strong>21/07/2026 08:15</strong>
            </small>
            <button onClick={() => window.print()}>
              <i className="pi pi-download" /> Exportar visao
            </button>
          </div>
        </header>

        <section className="prototype-management-filter-accordion">
          <SpecArea metadata={dashboardBlockSpecifications.filters}>
            <button
              className="prototype-management-filter-trigger"
              onClick={() => setFiltrosAbertos((aberto) => !aberto)}
              aria-expanded={filtrosAbertos}
            >
              <span>
                <i className="pi pi-filter" />
                <strong>Filtros da consulta</strong>
                <small>Orgaos, carreira, cargo e situacao legal</small>
              </span>
              <i className={`pi ${filtrosAbertos ? "pi-chevron-up" : "pi-chevron-down"}`} />
            </button>
          </SpecArea>
          {filtrosAbertos && (
            <div className="prototype-dash-filters management">
              <Filtro
                label="Órgão"
                metadata={dashboardFilterSpecifications["Órgão"]}
              >
                <MultiSelect
                  value={filtros.orgao}
                  onChange={(event) => setFiltros({ ...filtros, orgao: event.value ?? [] })}
                  options={orgaos.map((valor) => ({ label: valor, value: valor }))}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Todos"
                  display="chip"
                  filter
                  showClear
                  maxSelectedLabels={2}
                  selectedItemsLabel="{0} órgãos selecionados"
                />
              </Filtro>
              <Filtro label="Tipo" metadata={dashboardFilterSpecifications["Tipo"]}>
                <MultiSelect
                  value={filtros.tipo}
                  onChange={(event) => setFiltros({ ...filtros, tipo: event.value ?? [] })}
                  options={[{ label: "Efetivo", value: "EFETIVO" }, { label: "Comissionado", value: "COMISSIONADO" }]}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Efetivos e comissionados"
                  display="chip"
                  showClear
                />
              </Filtro>
              <Filtro label="Carreira" metadata={dashboardFilterSpecifications["Carreira"]}>
                <MultiSelect
                  value={filtros.carreira}
                  onChange={(event) => setFiltros({ ...filtros, carreira: event.value ?? [] })}
                  options={carreiras.map((valor) => ({ label: valor, value: valor }))}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Todas"
                  display="chip"
                  filter
                  showClear
                  maxSelectedLabels={2}
                  selectedItemsLabel="{0} carreiras selecionadas"
                />
              </Filtro>
              <Filtro label="Cargo" metadata={dashboardFilterSpecifications["Cargo"]}>
                <MultiSelect
                  value={filtros.cargo}
                  onChange={(event) => setFiltros({ ...filtros, cargo: event.value ?? [] })}
                  options={cargos.map((valor) => ({ label: valor, value: valor }))}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Todos"
                  display="chip"
                  filter
                  showClear
                  maxSelectedLabels={2}
                  selectedItemsLabel="{0} cargos selecionados"
                />
              </Filtro>
              <Filtro
                label="Situacao legal"
                metadata={dashboardFilterSpecifications["Situacao legal"]}
              >
                <MultiSelect
                  value={filtros.situacaoLegal}
                  onChange={(event) => setFiltros({ ...filtros, situacaoLegal: event.value ?? [] })}
                  options={situacoesLegais.map((valor) => ({ label: legalLabel[valor], value: valor }))}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Todas"
                  display="chip"
                  showClear
                  maxSelectedLabels={2}
                  selectedItemsLabel="{0} situações selecionadas"
                />
              </Filtro>
              <SpecArea metadata={dashboardFilterSpecifications["Indicadores exibidos"]}>
                <fieldset className="prototype-dashboard-indicator-controls">
                  <legend>Indicadores exibidos</legend>
                  <p>Escolha quais quadros aparecem no Dashboard.</p>
                  <div>
                    {indicadoresDashboardIds.map((id) => (
                      <label key={id} className="prototype-dashboard-switch">
                        <input
                          type="checkbox"
                          checked={indicadoresVisiveis[id]}
                          onChange={() =>
                            setIndicadoresVisiveis((atuais) => ({
                              ...atuais,
                              [id]: !atuais[id],
                            }))
                          }
                        />
                        <span aria-hidden="true">
                          <i />
                        </span>
                        <strong>{id}</strong>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </SpecArea>
              <div className="prototype-management-filter-actions">
                <SpecArea metadata={dashboardFilterSpecifications["Limpar"]}>
                  <button
                    className="prototype-management-clear-filter"
                    onClick={() => setFiltros(filtrosIniciais)}
                  >
                    <i className="pi pi-filter-slash" /> Limpar
                  </button>
                </SpecArea>
              </div>
            </div>
          )}
        </section>

        <section className="prototype-dash-kpis management unified">
          {indicadores
            .filter((item) => indicadoresVisiveis[item.label])
            .map((item) => (
              <Kpi key={item.label} {...item} />
            ))}
        </section>

        <div className="prototype-dash-grid controle-vagas-management-top">
          <SpecArea metadata={dashboardBlockSpecifications.composition}>
            <section className="prototype-dash-card management-status">
              <CardHeader
                titulo="Composicao do quadro"
                subtitulo={`Posicao em ${filtros.dataReferencia.split("-").reverse().join("/")}`}
              />
              <div className="prototype-management-composition">
                <div
                  className="ring"
                  style={{
                    background: `conic-gradient(#278bc4 0 ${
                      dados.resumo.vagasLegais
                        ? (dados.resumo.ocupadas / dados.resumo.vagasLegais) * 100
                        : 0
                    }%,#31a565 0)`,
                  }}
                >
                  <span>
                    <strong>{dados.resumo.vagasLegais}</strong>
                    <small>vagas legais</small>
                  </span>
                </div>
                <ul>
                  <li>
                    <i className="occupied" />
                    <span>Ocupadas</span>
                    <strong>{dados.resumo.ocupadas}</strong>
                  </li>
                  <li>
                    <i className="available" />
                    <span>Disponiveis livres</span>
                    <strong>{dados.resumo.livres}</strong>
                  </li>
                  <li>
                    <i className="committed" />
                    <span>Em ocupação</span>
                    <strong>{dados.resumo.comprometidas}</strong>
                  </li>
                </ul>
              </div>
            </section>
          </SpecArea>
          <section className="prototype-dash-card alerts">
            <CardHeader
              titulo="Alertas gerenciais"
              subtitulo="Situacoes que exigem analise"
            />
            <div className="prototype-dash-alert-list">
              {alertas.map((alerta) => (
                <SpecArea
                  key={alerta.titulo}
                  metadata={dashboardAlertSpecifications[alerta.titulo]}
                >
                  <button
                    className={alerta.kind}
                    onClick={() => navigate(`${BASE}/${alerta.rota}`)}
                  >
                    <i className={alerta.icon} />
                    <div>
                      <strong>{alerta.titulo}</strong>
                      <span>Abrir memoria e registros de origem</span>
                    </div>
                    <b>{alerta.valor}</b>
                    <i className="pi pi-chevron-right" />
                  </button>
                </SpecArea>
              ))}
            </div>
          </section>
        </div>

        <SpecArea metadata={dashboardBlockSpecifications.table}>
          <section className="prototype-dash-card priority management-table">
            <CardHeader
              titulo="Quadro estrategico por autorizacao, cargo e orgao"
              subtitulo="Origem rastreavel: quadro legal, vagas, ocupacoes, comprometimentos e distribuicao"
            >
              <button onClick={() => navigate(`${BASE}/vagas`)}>
                Ver vagas <i className="pi pi-arrow-right" />
              </button>
            </CardHeader>
            <div className="prototype-dash-table">
              <table>
                <thead>
                  <tr>
                    <th>Prioridade</th>
                    <th>Quadro autorizado</th>
                    <th>Cargo, carreira e lei</th>
                    <th>Órgão</th>
                    <th className="num">Legais</th>
                    <th className="num">Ocupadas</th>
                    <th className="num">Livres</th>
                    <th className="num">Em ocupação</th>
                    <th className="num">Judiciais</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {dados.grupos.map((grupo) => (
                    <tr key={grupo.chave}>
                      <td>
                        <span
                          className={`prototype-management-priority ${grupo.prioridade.toLowerCase()}`}
                        >
                          {prioridadeLabel[grupo.prioridade]}
                        </span>
                      </td>
                      <td>
                        <strong>{grupo.quadroCodigo}</strong>
                      </td>
                      <td>
                        <strong>{grupo.cargo}</strong>
                        <small>
                          {grupo.carreira} | {grupo.lei}
                        </small>
                      </td>
                      <td>
                        <strong>{grupo.orgao}</strong>
                        <small>{grupo.tipo === "EFETIVO" ? "Efetivo" : "Comissionado"}</small>
                      </td>
                      <td className="num">{grupo.vagasLegais}</td>
                      <td className="num">
                        {grupo.ocupadas}
                        <small>{grupo.percentualOcupacao}%</small>
                      </td>
                      <td
                        className={`num ${grupo.disponiveisLivres === 0 ? "danger" : "positive"}`}
                      >
                        <strong>{grupo.disponiveisLivres}</strong>
                      </td>
                      <td className="num">{grupo.disponiveisComprometidas}</td>
                      <td className="num">{grupo.judiciais}</td>
                      <td>
                        <button onClick={() => setDetalhe(grupo)}>
                          <i className="pi pi-chevron-right" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </SpecArea>

        <div className="prototype-dash-grid management-bottom">
          <SpecArea metadata={dashboardBlockSpecifications.recent}>
            <section className="prototype-dash-card">
              <CardHeader
                titulo="Distribuicoes recentes"
                subtitulo="Distribuicao inicial e redistribuicao"
              >
                <button onClick={() => navigate(`${BASE}/distribuicao`)}>Ver todas</button>
              </CardHeader>
              <div className="prototype-dash-recent-list">
                {eventos.map((movimento) => (
                  <article key={movimento.id}>
                    <i className="pi pi-history blue" />
                    <div>
                      <span>{movimento.tipo.replaceAll("_", " ")}</span>
                      <strong>{movimento.vagaId}</strong>
                      <small>
                        {movimento.dataEfeito} | {movimento.ato}
                      </small>
                    </div>
                    {movimento.retroativo && <b className="orange">Retroativo</b>}
                  </article>
                ))}
              </div>
            </section>
          </SpecArea>
        </div>

        {detalhe && (
          <DetalheGrupo
            grupo={detalhe}
            onClose={() => setDetalhe(null)}
            onNavigate={(rota) => navigate(`${BASE}/${rota}`)}
          />
        )}
      </div>
    </SpecificationMode>
  );
}

function Filtro({
  label,
  metadata,
  children,
}: {
  label: string;
  metadata: import("../shared/visualizationModes").SpecificationMetadata;
  children: React.ReactNode;
}) {
  return (
    <SpecArea metadata={metadata}>
      <label>
        <span>{label}</span>
        {children}
      </label>
    </SpecArea>
  );
}

function Kpi({
  label,
  valor,
  hint,
  icon,
  cor,
  onClick,
}: {
  label: string;
  valor: number;
  hint: string;
  icon: string;
  cor: string;
  onClick: () => void;
}) {
  return (
    <SpecArea metadata={dashboardKpiSpecifications[label]}>
      <button className={`prototype-dash-kpi ${cor}`} onClick={onClick}>
        <i className={icon} />
        <div>
          <span>{label}</span>
          <strong>{valor.toLocaleString("pt-BR")}</strong>
          <small>{hint}</small>
        </div>
        <i className="pi pi-arrow-right arrow" />
      </button>
    </SpecArea>
  );
}

function CardHeader({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo: string;
  children?: React.ReactNode;
}) {
  return (
    <header>
      <div>
        <h2>{titulo}</h2>
        <p>{subtitulo}</p>
      </div>
      {children}
    </header>
  );
}

function DetalheGrupo({
  grupo,
  onClose,
  onNavigate,
}: {
  grupo: DashboardGrupo;
  onClose: () => void;
  onNavigate: (rota: string) => void;
}) {
  return (
    <div className="prototype-dash-backdrop" onMouseDown={onClose}>
      <section
        className="prototype-dash-modal management-detail"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span>Memoria gerencial</span>
            <h2>{grupo.cargo}</h2>
            <p>
              {grupo.quadroCodigo} | {grupo.carreira} | {grupo.orgao} | {grupo.lei}
            </p>
          </div>
          <button onClick={onClose}>
            <i className="pi pi-times" />
          </button>
        </header>
        <div className="prototype-dash-detail-status">
          <span className={grupo.prioridade.toLowerCase()}>
            {prioridadeLabel[grupo.prioridade]}
          </span>
          <div>
            <strong>{grupo.percentualOcupacao}%</strong>
            <small>ocupacao do quadro legal</small>
          </div>
        </div>
        <div className="prototype-dash-detail-context">
          <span>
            Órgão atual da vaga: <strong>{grupo.orgao}</strong>
          </span>
        </div>
        <div className="prototype-dash-detail-numbers">
          <div>
            <span>Vagas legais</span>
            <strong>{grupo.vagasLegais}</strong>
          </div>
          <div>
            <span>Ocupadas</span>
            <strong>{grupo.ocupadas}</strong>
          </div>
          <div className="available">
            <span>Disponiveis livres</span>
            <strong>{grupo.disponiveisLivres}</strong>
          </div>
          <div>
            <span>Em ocupação</span>
            <strong>{grupo.disponiveisComprometidas}</strong>
          </div>
          <div>
            <span>Em extincao</span>
            <strong>{grupo.emExtincao}</strong>
          </div>
          <div>
            <span>Excedentes judiciais</span>
            <strong>{grupo.judiciais}</strong>
          </div>
        </div>
        <section className="prototype-management-occupants">
          <h3>Quem compoe as ocupacoes</h3>
          <div>
            <table>
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th>Matricula / vinculo</th>
                  <th>Vaga</th>
                  <th>Orgao de exercicio</th>
                  <th>Efetivo exercicio</th>
                </tr>
              </thead>
              <tbody>
                {grupo.ocupacoes.slice(0, 8).map((ocupacao) => (
                  <tr key={ocupacao.id}>
                    <td>{ocupacao.pessoaNome}</td>
                    <td>
                      {ocupacao.matricula}
                      <small>{ocupacao.vinculoId}</small>
                    </td>
                    <td>{ocupacao.vagaId}</td>
                    <td>{ocupacao.orgaoExercicio}</td>
                    <td>{ocupacao.efetivoExercicioEm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {grupo.ocupacoes.length > 8 && (
            <small>Exibindo 8 de {grupo.ocupacoes.length} ocupacoes.</small>
          )}
        </section>
        <div className="prototype-dash-detail-actions">
          <button
            onClick={() =>
              onNavigate(
                `vagas?cargo=${encodeURIComponent(grupo.cargo)}&orgao=${encodeURIComponent(grupo.orgao)}`,
              )
            }
          >
            <i className="pi pi-list" /> Vagas
          </button>
          <button onClick={() => onNavigate("distribuicao")}>
            <i className="pi pi-sitemap" /> Distribuicao
          </button>
        </div>
        <footer>
          <button onClick={onClose}>Fechar</button>
        </footer>
      </section>
    </div>
  );
}
