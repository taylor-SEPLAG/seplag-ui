import {
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiUsers,
} from "react-icons/fi";
import "./App.css";
import pkg from "../package.json";
import { DocsLayout, DocsRenderer } from "./docs/layout/DocsLayout";
import {
  PrototiposAnexarDocumentoPage,
  PrototiposAposentadoriaPage,
  PrototiposAuditoriaPage,
  PrototiposCargoFormPage,
  PrototiposCargoPage,
  PrototiposCargoTesteFormPage,
  PrototiposCargoTestePage,
  PrototiposCategoriaPage,
  PrototiposCategoriaFormPage,
  PrototiposCategoriaTesteFormPage,
  PrototiposCategoriaTestePage,
  PrototiposComponentesPage,
  PrototiposControleVagasConfiguracaoFormPage,
  PrototiposControleVagasPage,
  PrototiposControleVagasConfiguracaoPage,
  PrototiposControleVagasQuadroAutorizadoFormPage,
  PrototiposControleVagasQuadroAutorizadoPage,
  PrototiposControleVagasConsultaSaldoPage,
  PrototiposControleVagasVagasNumeradasPage,
  PrototiposControleVagasVagasNumeradasFormPage,
  PrototiposControleVagasHistoricoPage,
  PrototiposControleVagasIntegracaoPage,
  PrototiposDocumentosVinculadosPage,
  PrototiposEstruturaOrganizacionalPage,
  PrototiposSituacaoVigenciaPage,
  PrototiposConformidadePage,
  PrototiposConsignadoPage,
  PrototiposContagemTempoPage,
  PrototiposESocialPage,
  PrototiposFolhaGrupoEleitoFormPage,
  PrototiposFolhaGrupoEleitosPage,
  PrototiposFolhaGrupoCalculoFormPage,
  PrototiposFolhaGruposCalculoPage,
  PrototiposFolhaCompetenciasPage,
  PrototiposFolhaCronogramaPage,
  PrototiposFolhaFichaFinanceiraPage,
  PrototiposFolhaPagamentoFormPage,
  PrototiposFolhaPagamentoLogPage,
  PrototiposFolhaPagamentoPage,
  PrototiposFolhaProcessamentoFormPage,
  PrototiposFolhaSolicitacoesAjustesPage,
  PrototiposFolhaTabelaReferenciaVigenciaFormPage,
  PrototiposFolhaTabelasReferenciaPage,
  PrototiposFolhaValorReferenciaVigenciaFormPage,
  PrototiposFolhaConformidadePage,
  PrototiposFolhaPenhoraJudicialPage,
  PrototiposFolhaCatalogoRubricasPage,
  PrototiposFolhaCatalogoRubricaViewPage,
  PrototiposFolhaPage,
  PrototiposMatrizValidacaoTesteFormPage,
  PrototiposMatrizValidacaoTestePage,
  PrototiposPage,
  PrototiposPericiaPage,
  PrototiposSigepPage,
  PrototiposSigepRegimeJuridicoNovoPage,
  PrototiposSigepRegimeJuridicoPage,
  PrototiposSigepRegimeJuridicoTesteNovoPage,
  PrototiposSigepRegimeJuridicoTestePage,
  PrototiposTipoVinculoTesteFormPage,
  PrototiposTipoVinculoTestePage,
} from "./prototipos/PrototiposPage";
import {
  PrototiposSicadBaseConhecimentoPage,
  PrototiposSicadFilaOcorrenciasPage,
  PrototiposSicadMinhasOcorrenciasPage,
  PrototiposSicadNovaOcorrenciaPage,
  PrototiposSicadOcorrenciaDetalhePage,
  PrototiposSicadOcorrenciasDashboardPage,
  PrototiposSicadOcorrenciasRelatoriosPage,
  PrototiposSicadPage,
} from "./prototipos/sicad/PrototiposSicadPage";

function HomePage() {
  const sistemas = [
    {
      sigla: "SIGEP",
      titulo: "Gestao de Pessoas",
      descricao: "Protótipos de cadastro, cargos, regime jurídico, categorias e componentes reutilizáveis.",
      status: "Em prototipação",
      to: "/prototipos/sigep",
      links: [
        { label: "Categoria", to: "/prototipos/sigep/categoria" },
        { label: "Cargo", to: "/prototipos/sigep/cargo" },
        { label: "Regime Jurídico", to: "/prototipos/sigep/regime-juridico" },
        { label: "Controle de Vagas", to: "/prototipos/sigep/controle-vagas" },
        { label: "Componentes", to: "/prototipos/sigep/componentes" },
      ],
    },
    {
      sigla: "SICAD",
      titulo: "Sistema de Concessão de Adiantamento",
      descricao: "Protótipos do SICAD separados do SIGEP, usando a biblioteca de componentes da SEPLAG.",
      status: "Em prototipação",
      to: "/prototipos/sicad",
      links: [
        { label: "Tela inicial", to: "/prototipos/sicad" },
      ],
    },
    {
      sigla: "FOLHA",
      titulo: "Folha de Pagamento",
      descricao: "Protótipos para grupos de cálculo, folhas por competência, rubricas e cálculos.",
      status: "Em evolução",
      to: "/prototipos/folha",
      links: [
        { label: "Competências da Folha", to: "/prototipos/folha/processamento/competencias" },
        { label: "Processamento da Folha", to: "/prototipos/folha/processamento/processamento-folha" },
        { label: "Folha de Pagamento", to: "/prototipos/folha/processamento/folha-pagamento" },
        { label: "Grupo de Eleitos", to: "/prototipos/folha/grupo-eleitos" },
        { label: "Grupos de Cálculo", to: "/prototipos/folha/grupos-calculo" },
        { label: "Catálogo de Rubricas", to: "/prototipos/folha/catalogo-rubricas" },
      ],
    },
    {
      sigla: "GERAL",
      titulo: "Demais Protótipos",
      descricao: "Atalhos para estudos de perícia, consignado, eSocial, auditoria e conformidade.",
      status: "Mapa geral",
      to: "/prototipos",
      links: [
        { label: "Todos os protótipos", to: "/prototipos" },
        { label: "Documentação", to: "/docs" },
      ],
    },
  ];

  const versoes = [
    {
      versao: "0.0.7",
      titulo: "Biblioteca ativa",
      descricao: "Versão usada hoje pelo projeto em src/componentes.",
    },
    {
      versao: "0.0.18",
      titulo: "Referência de desenvolvimento",
      descricao: "Versão externa armazenada em bibliotecas-seplag para consulta e migração.",
    },
  ];

  return (
    <div className="app-container">
      <nav className="main-nav">
        <div className="nav-content">
          <div className="logo-group">
            <span className="logo-seplag">SEPLAG</span>
            <span className="logo-divider">/</span>
            <span className="logo-ds">Portal UI</span>
          </div>
          <div className="nav-actions">
            <Link to="/docs" className="nav-link">
              Documentação
            </Link>
            <Link to="/prototipos" className="nav-link">
              Protótipos
            </Link>
            <div className="version-tag">v{pkg.version}</div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <section className="portal-hero">
          <div className="portal-hero-copy">
            <span className="kicker">Ambiente de protótipos e componentes</span>
            <h1>Portal SEPLAG UI</h1>
            <p>
              Centralize protótipos por sistema, acompanhe versões da biblioteca
              visual e acesse rapidamente as telas em construção.
            </p>
            <div className="action-buttons">
              <Link to="/prototipos" className="btn-primary">
                Abrir protótipos
              </Link>
              <Link to="/docs" className="btn-secondary">
                Ver documentação
              </Link>
              <Link to="/calendario" className="btn-secondary">
                Ver calendário
              </Link>
            </div>
          </div>
          <div className="portal-summary" aria-label="Resumo do portal">
            <div>
              <strong>2</strong>
              <span>Sistemas ativos</span>
            </div>
            <div>
              <strong>2</strong>
              <span>Versões mapeadas</span>
            </div>
            <div>
              <strong>+10</strong>
              <span>Protótipos</span>
            </div>
          </div>
        </section>

        <section className="home-section" aria-labelledby="sistemas-title">
          <div className="section-heading">
            <span className="card-label">Sistemas</span>
            <h2 id="sistemas-title">Protótipos por sistema</h2>
          </div>
          <div className="systems-grid">
            {sistemas.map((sistema) => (
              <article className="system-card" key={sistema.sigla}>
                <div className="system-card-header">
                  <span className="system-code">{sistema.sigla}</span>
                  <span className="system-status">{sistema.status}</span>
                </div>
                <h3>{sistema.titulo}</h3>
                <p>{sistema.descricao}</p>
                <div className="system-links">
                  {sistema.links.map((link) => (
                    <Link key={link.to} to={link.to}>
                      {link.label}
                    </Link>
                  ))}
                </div>
                <Link to={sistema.to} className="card-action">
                  Abrir área
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section home-two-columns">
          <div className="library-panel">
            <div className="section-heading">
              <span className="card-label">Bibliotecas</span>
              <h2>Versões disponíveis</h2>
            </div>
            <div className="version-list">
              {versoes.map((item) => (
                <div className="version-card" key={item.versao}>
                  <span className="version-number">v{item.versao}</span>
                  <div>
                    <strong>{item.titulo}</strong>
                    <p>{item.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="library-panel package-panel">
            <div className="section-heading">
              <span className="card-label">Pacote atual</span>
              <h2>{pkg.name}</h2>
            </div>
            <p>
              A versão ativa continua em <strong>src/componentes</strong>. As
              pastas em <strong>bibliotecas-seplag</strong> servem como acervo
              para comparação e migração futura.
            </p>
            <code>npm install @seplag/ui-lib-react-18</code>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <p>
          Desenvolvido pela Coordenadoria de Desenvolvimento de Soluções de TI -
          SEPLAG-MT.
        </p>
        <p>© {new Date().getFullYear()} Governo do Estado de Mato Grosso</p>
      </footer>
    </div>
  );
}

type CalendarDay = {
  day: string;
  month: number;
  year: number;
  muted?: boolean;
};

type CalendarEvent = {
  start: number;
  end: number;
  track: number;
  label: string;
  type: string;
  area?: "sigep" | "esocial";
};

const calendarMonthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getCalendarWeeks = (date: Date): CalendarDay[][] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstCell = new Date(year, month, 1 - firstDay.getDay());
  const lastDay = new Date(year, month + 1, 0);
  const totalCells = firstDay.getDay() + lastDay.getDate() > 35 ? 42 : 35;

  return Array.from({ length: totalCells / 7 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const cellDate = new Date(firstCell);
      cellDate.setDate(firstCell.getDate() + weekIndex * 7 + dayIndex);

      return {
        day: String(cellDate.getDate()),
        month: cellDate.getMonth(),
        year: cellDate.getFullYear(),
        muted: cellDate.getMonth() !== month,
      };
    }),
  );
};

function CalendarioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const today = useMemo(() => new Date(), []);
  const todayMonthDate = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today],
  );
  const [visibleMonthDate, setVisibleMonthDate] = useState(todayMonthDate);
  const [activeTimelineItem, setActiveTimelineItem] = useState<string | null>(
    null,
  );
  const [selectedTimelineItem, setSelectedTimelineItem] = useState<string | null>(
    null,
  );
  const isCalendarioRoute = location.pathname === "/calendario";
  const isProcessoRoute = location.pathname === "/calendario/processo";
  const menuItems = [
    { label: "Calendário", to: "/calendario", icon: FiCalendar },
    { label: "Processo", to: "/calendario/processo", icon: FiFileText },
    { label: "Integrantes", to: "/calendario/integrantes", icon: FiUsers },
  ];
  const weekdays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
  const juneEvents = [
    [
      { start: 1, end: 7, track: 2, label: "SPRINT DEV - 16", type: "green" },
      { start: 1, end: 7, track: 3, label: "SPRINT TESTE - 15", type: "mint" },
      { start: 1, end: 7, track: 4, label: "[ESOCIAL] SPRINT DEV 5", type: "green" },
      { start: 1, end: 7, track: 5, label: "[ESOCIAL] SPRINT TESTE - 4", type: "mint" },
      { start: 5, end: 5, track: 1, label: "FERIADO", type: "holiday" },
      { start: 6, end: 6, track: 1, label: "FERIADO", type: "holiday" },
    ],
    [
      { start: 1, end: 4, track: 2, label: "SPRINT DEV - 16", type: "green" },
      { start: 1, end: 4, track: 3, label: "SPRINT TESTE - 15", type: "mint" },
      { start: 1, end: 4, track: 4, label: "[ESOCIAL] SPRINT DEV 5", type: "green" },
      { start: 1, end: 4, track: 5, label: "[ESOCIAL] SPRINT TESTE - 4", type: "mint" },
      { start: 2, end: 4, track: 6, label: "Liberação das US aos Devs", type: "magenta" },
      { start: 5, end: 5, track: 2, label: "REVIEW", type: "cyan" },
      { start: 5, end: 5, track: 3, label: "Entrega Sprint 15", type: "red" },
      { start: 5, end: 5, track: 2, label: "REVIEW", type: "cyan", area: "esocial" },
      { start: 5, end: 5, track: 3, label: "Entrega Sprint 4", type: "red", area: "esocial" },
      { start: 6, end: 6, track: 2, label: "Refinamento Sprint 17", type: "rose" },
      { start: 6, end: 6, track: 4, label: "Refinamento Sprint 6", type: "rose", area: "esocial" },
      { start: 6, end: 7, track: 6, label: "Mapeamento DBA", type: "magenta", area: "esocial" },
      { start: 6, end: 7, track: 6, label: "MAPEAMENTO DBA", type: "magenta" },
    ],
    [
      { start: 1, end: 2, track: 6, label: "MAPEAMENTO DBA", type: "magenta" },
      { start: 1, end: 2, track: 6, label: "Mapeamento DBA", type: "magenta", area: "esocial" },
      { start: 2, end: 2, track: 2, label: "Planning Sprint 17", type: "orange" },
      { start: 2, end: 2, track: 4, label: "Planning eSocial Sprint 6", type: "orange" },
      { start: 3, end: 7, track: 2, label: "SPRINT DEV - 17", type: "blue" },
      { start: 3, end: 7, track: 3, label: "SPRINT TESTE - 16", type: "lightBlue" },
      { start: 3, end: 7, track: 4, label: "[ESOCIAL] SPRINT 6", type: "blue" },
      { start: 3, end: 7, track: 5, label: "[ESOCIAL] SPRINT TESTE - 5", type: "lightBlue" },
    ],
    [
      { start: 1, end: 7, track: 2, label: "SPRINT DEV - 17", type: "blue" },
      { start: 1, end: 7, track: 3, label: "SPRINT TESTE - 16", type: "lightBlue" },
      { start: 1, end: 7, track: 4, label: "[ESOCIAL] SPRINT DEV 6", type: "blue" },
      { start: 1, end: 7, track: 5, label: "[ESOCIAL] SPRINT TESTE - 5", type: "lightBlue" },
    ],
    [
      { start: 1, end: 3, track: 2, label: "SPRINT DEV - 17", type: "blue" },
      { start: 1, end: 3, track: 3, label: "SPRINT TESTE - 16", type: "lightBlue" },
      { start: 1, end: 3, track: 4, label: "[ESOCIAL] SPRINT DEV 6", type: "blue" },
      { start: 1, end: 3, track: 5, label: "[ESOCIAL] SPRINT TESTE - 5", type: "lightBlue" },
    ],
  ];
  const julyEvents = [
    [
      { start: 1, end: 3, track: 2, label: "SPRINT DEV - 17", type: "blue" },
      { start: 1, end: 3, track: 3, label: "SPRINT TESTE - 16", type: "lightBlue" },
      { start: 1, end: 3, track: 4, label: "[ESOCIAL] SPRINT DEV 6", type: "blue" },
      { start: 1, end: 3, track: 5, label: "[ESOCIAL] SPRINT TESTE - 5", type: "lightBlue" },
      { start: 4, end: 4, track: 2, label: "REVIEW", type: "cyan" },
      { start: 4, end: 4, track: 3, label: "RETRO", type: "cyan" },
      { start: 4, end: 4, track: 4, label: "Entrega Sprint 16", type: "red" },
      { start: 4, end: 4, track: 4, label: "RETRO", type: "cyan", area: "esocial" },
      { start: 4, end: 4, track: 4, label: "Entrega Sprint 5", type: "red", area: "esocial" },
      { start: 5, end: 5, track: 2, label: "Refinamento Sprint 18", type: "rose" },
      { start: 5, end: 5, track: 4, label: "Refinamento eSocial Sprint 7", type: "rose" },
      { start: 6, end: 6, track: 2, label: "Planning Sprint 18", type: "orange" },
      { start: 6, end: 6, track: 3, label: "Planning eSocial Sprint 7", type: "orange" },
      { start: 5, end: 7, track: 4, label: "SPRINT TESTE - 17", type: "mint" },
      { start: 5, end: 7, track: 5, label: "[ESOCIAL] SPRINT TESTE - 6", type: "lightBlue" },
      { start: 5, end: 6, track: 6, label: "MAPEAMENTO DBA", type: "magenta" },
    ],
    [
      { start: 2, end: 7, track: 2, label: "SPRINT TESTE - 17", type: "mint" },
      { start: 2, end: 7, track: 3, label: "SPRINT DEV - 18", type: "green" },
      { start: 2, end: 7, track: 4, label: "[ESOCIAL] SPRINT DEV 7", type: "blue" },
      { start: 2, end: 7, track: 5, label: "[ESOCIAL] SPRINT TESTE - 6", type: "lightBlue" },
    ],
    [
      { start: 2, end: 3, track: 2, label: "Entrega 1 - Sprint 17 Folha de Inativos", type: "red" },
      { start: 1, end: 7, track: 5, label: "SPRINT DEV - 18", type: "green" },
      { start: 1, end: 7, track: 6, label: "[ESOCIAL] SPRINT DEV 7", type: "blue" },
    ],
    [
      { start: 1, end: 2, track: 2, label: "SPRINT DEV - 18", type: "green" },
      { start: 1, end: 2, track: 3, label: "[ESOCIAL] SPRINT DEV 7", type: "blue" },
      { start: 3, end: 3, track: 2, label: "REVIEW", type: "cyan" },
      { start: 3, end: 3, track: 4, label: "Entrega Sprint 18 e eSocial Sprint 7", type: "red" },
      { start: 4, end: 4, track: 2, label: "Refinamento Sprint 19", type: "rose" },
      { start: 4, end: 4, track: 4, label: "Refinamento eSocial Sprint 8", type: "rose" },
      { start: 4, end: 5, track: 6, label: "MAPEAMENTO DBA", type: "magenta" },
      { start: 5, end: 5, track: 2, label: "Planning Sprint 19", type: "orange" },
      { start: 5, end: 5, track: 3, label: "Planning eSocial Sprint 8", type: "orange" },
      { start: 6, end: 7, track: 2, label: "SPRINT DEV - 19", type: "blue" },
      { start: 6, end: 7, track: 3, label: "SPRINT TESTE - 18", type: "lightBlue" },
      { start: 6, end: 7, track: 4, label: "[ESOCIAL] SPRINT DEV 8", type: "blue" },
      { start: 6, end: 7, track: 5, label: "[ESOCIAL] SPRINT TESTE - 7", type: "lightBlue" },
    ],
    [
      { start: 1, end: 7, track: 2, label: "SPRINT DEV - 19", type: "blue" },
      { start: 1, end: 7, track: 3, label: "SPRINT TESTE - 18", type: "lightBlue" },
      { start: 1, end: 7, track: 4, label: "[ESOCIAL] SPRINT DEV 8", type: "blue" },
      { start: 1, end: 7, track: 5, label: "[ESOCIAL] SPRINT TESTE - 7", type: "lightBlue" },
    ],
  ];
  const staticMonthData: Record<
    string,
    { weeks: CalendarDay[][]; events: CalendarEvent[][] }
  > = {
    "2026-06": { weeks: getCalendarWeeks(new Date(2026, 5, 1)), events: juneEvents },
    "2026-07": { weeks: getCalendarWeeks(new Date(2026, 6, 1)), events: julyEvents },
  };
  const visibleMonthKey = getMonthKey(visibleMonthDate);
  const visibleWeeks =
    staticMonthData[visibleMonthKey]?.weeks ?? getCalendarWeeks(visibleMonthDate);
  const visibleEvents =
    staticMonthData[visibleMonthKey]?.events ??
    visibleWeeks.map(() => [] as CalendarEvent[]);
  const visibleMonth = {
    title: calendarMonthNames[visibleMonthDate.getMonth()],
    weeks: visibleWeeks,
    events: visibleEvents,
    label: `Calendário de ${calendarMonthNames[
      visibleMonthDate.getMonth()
    ].toLowerCase()} de ${visibleMonthDate.getFullYear()}`,
  };
  const normalizeCalendarLabel = (label: string) =>
    label
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  const isEventHighlighted = (eventLabel: string) => {
    const activeItem = activeTimelineItem ?? selectedTimelineItem;

    if (!activeItem) {
      return false;
    }

    const eventKey = normalizeCalendarLabel(eventLabel);
    const timelineKey = normalizeCalendarLabel(activeItem);

    return eventKey.includes(timelineKey) || timelineKey.includes(eventKey);
  };
  const isTimelineHighlighted = (timelineLabel: string) => {
    const activeItem = activeTimelineItem ?? selectedTimelineItem;

    if (!activeItem) {
      return false;
    }

    const eventKey = normalizeCalendarLabel(activeItem);
    const timelineKey = normalizeCalendarLabel(timelineLabel);

    return eventKey.includes(timelineKey) || timelineKey.includes(eventKey);
  };
  const isPreviousSprintEvent = (eventLabel: string) => {
    const eventKey = normalizeCalendarLabel(eventLabel);

    return [
      "sprint dev - 16",
      "sprint teste - 15",
      "[esocial] sprint dev 5",
      "[esocial] sprint teste - 4",
    ].includes(eventKey);
  };
  const getCalendarEventTrack = (
    event: CalendarEvent,
    area: { id: string },
  ) => {
    if (area.id !== "esocial") {
      return event.track;
    }

    return event.track >= 4 ? event.track - 2 : event.track;
  };
  const getEventsByArea = (area: "sigep" | "esocial") =>
    visibleMonth.events.map((weekEvents) =>
      weekEvents.filter((event) => {
        const isEsocial = event.area === "esocial" || /esocial/i.test(event.label);
        const isHoliday = event.type === "holiday";

        return area === "esocial"
          ? isEsocial || isHoliday
          : event.area !== "esocial" && !isEsocial;
      }),
    );
  const calendarAreas = [
    {
      id: "sigep",
      title: "SIGEP",
      events: getEventsByArea("sigep"),
    },
    {
      id: "esocial",
      title: "eSocial",
      events: getEventsByArea("esocial"),
    },
  ];
  const sigepCalendarArea = calendarAreas[0];
  const esocialCalendarArea = calendarAreas[1];
  const renderCalendarCard = (area: (typeof calendarAreas)[number]) => (
    <div
      className="calendar-month-card"
      aria-label={`${visibleMonth.label} - ${area.title}`}
    >
      <div className="calendar-month-title">
        {visibleMonth.title}
        <span>{visibleMonthDate.getFullYear()}</span>
        <strong>{area.title}</strong>
      </div>
      <div className="calendar-weekdays">
        {weekdays.map((weekday) => (
          <span key={`${area.id}-${visibleMonth.title}-${weekday}`}>
            {weekday}
          </span>
        ))}
      </div>
      <div className="calendar-weeks">
        {visibleMonth.weeks.map((week, weekIndex) => (
          <div
            className="calendar-week"
            key={`${area.id}-${visibleMonth.title}-week-${weekIndex}`}
          >
            {week.map((day, dayIndex) => (
              <div
                className={`calendar-day-cell${day.muted ? " is-muted" : ""}${
                  day.day === String(today.getDate()) &&
                  day.month === today.getMonth() &&
                  day.year === today.getFullYear()
                    ? " is-today"
                    : ""
                }`}
                key={`${area.id}-${visibleMonth.title}-${weekIndex}-${dayIndex}`}
                style={{ gridColumn: dayIndex + 1 }}
              >
                <span>{day.day}</span>
              </div>
            ))}
            {area.events[weekIndex].map((event) => (
              <div
                className={`calendar-event is-${event.type}${
                  isEventHighlighted(event.label) ? " is-highlighted" : ""
                }${isPreviousSprintEvent(event.label) ? " is-previous-sprint" : ""}`}
                key={`${area.id}-${visibleMonth.title}-${event.label}-${event.start}-${event.track}`}
                onBlur={() => setActiveTimelineItem(null)}
                onClick={() =>
                  setSelectedTimelineItem((current) =>
                    current === event.label ? null : event.label,
                  )
                }
                onFocus={() => setActiveTimelineItem(event.label)}
                onMouseEnter={() => setActiveTimelineItem(event.label)}
                onMouseLeave={() => setActiveTimelineItem(null)}
                onKeyDown={(eventKey) => {
                  if (eventKey.key === "Enter" || eventKey.key === " ") {
                    eventKey.preventDefault();
                    setSelectedTimelineItem((current) =>
                      current === event.label ? null : event.label,
                    );
                  }
                }}
                role="button"
                style={{
                  gridColumn: `${event.start} / ${event.end + 1}`,
                  gridRow: getCalendarEventTrack(event, area),
                }}
                tabIndex={0}
              >
                {event.label}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
  const sprintAtivaPorMes: Record<string, { title: string; period: string }> = {
    "2026-06": {
      title: "Sprint 17",
      period: "16 de junho a 30 de junho",
    },
    "2026-07": {
      title: "Sprint 18",
      period: "06 de julho a 20 de julho",
    },
  };
  const sprintAtiva = sprintAtivaPorMes[visibleMonthKey] ?? {
    title: `Sprint ${visibleMonthDate.getMonth() + 18}`,
    period: `${visibleMonth.title} de ${visibleMonthDate.getFullYear()}`,
  };
  const sprintPrazoPorMes: Record<
    string,
    { title: string; endDate: Date; endLabel: string }
  > = {
    "2026-06": {
      title: "Sprint 17 e Sprint Teste 16",
      endDate: new Date(2026, 5, 30),
      endLabel: "30 de junho",
    },
    "2026-07": {
      title: "Sprint 18 e Sprint Teste 17",
      endDate: new Date(2026, 6, 20),
      endLabel: "20 de julho",
    },
  };
  const sprintPrazo = sprintPrazoPorMes[visibleMonthKey];
  const getDiasRestantes = (endDate: Date) =>
    Math.max(
        0,
        Math.ceil(
          (new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
          ).getTime() -
            new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );
  const diasRestantesSprint = sprintPrazo
    ? getDiasRestantes(sprintPrazo.endDate)
    : null;
  const esocialSprintAtivaPorMes: Record<string, { title: string; period: string }> = {
    "2026-06": {
      title: "eSocial Sprint 6",
      period: "16 de junho a 30 de junho",
    },
    "2026-07": {
      title: "eSocial Sprint 7",
      period: "06 de julho a 20 de julho",
    },
  };
  const esocialSprintAtiva = esocialSprintAtivaPorMes[visibleMonthKey] ?? {
    title: `eSocial Sprint ${visibleMonthDate.getMonth() + 7}`,
    period: `${visibleMonth.title} de ${visibleMonthDate.getFullYear()}`,
  };
  const esocialSprintPrazoPorMes: Record<
    string,
    { title: string; endDate: Date; endLabel: string }
  > = {
    "2026-06": {
      title: "eSocial Sprint 6 e Sprint Teste 5",
      endDate: new Date(2026, 5, 30),
      endLabel: "30 de junho",
    },
    "2026-07": {
      title: "eSocial Sprint 7 e Sprint Teste 6",
      endDate: new Date(2026, 6, 20),
      endLabel: "20 de julho",
    },
  };
  const esocialSprintPrazo = esocialSprintPrazoPorMes[visibleMonthKey];
  const diasRestantesEsocialSprint = esocialSprintPrazo
    ? getDiasRestantes(esocialSprintPrazo.endDate)
    : null;
  const isViewingCurrentMonth = visibleMonthKey === getMonthKey(todayMonthDate);
  const handlePreviousMonth = () => {
    setVisibleMonthDate(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  };
  const handleNextMonth = () => {
    setVisibleMonthDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  };
  const handleToday = () => {
    setVisibleMonthDate(todayMonthDate);
  };
  const timelineLegend = [
    { label: "Sprint DEV", type: "blue" },
    { label: "Sprint Teste", type: "lightBlue" },
    { label: "Liberação", type: "magenta" },
    { label: "Mapeamento DBA", type: "magenta" },
    { label: "Review", type: "cyan" },
    { label: "Refinamento", type: "rose" },
    { label: "Planejamento", type: "orange" },
    { label: "Entrega", type: "red" },
  ];
  const esocialTimelineLegend = [
    { label: "Sprint DEV", type: "blue" },
    { label: "Sprint Teste", type: "lightBlue" },
    { label: "Mapeamento DBA", type: "magenta" },
    { label: "Refinamento", type: "rose" },
    { label: "Planejamento", type: "orange" },
    { label: "Entrega", type: "red" },
  ];
  const timelineMilestonesByMonth: Record<
    string,
    Array<{ period: string; title: string; type: string }>
  > = {
    "2026-06": [
      { title: "Sprint Dev - 16", period: "01 de jun. - 10 de jun.", type: "green" },
      { title: "Sprint Teste - 15", period: "01 de jun. - 10 de jun.", type: "mint" },
      { title: "Review", period: "11 de jun.", type: "cyan" },
      { title: "Entrega Sprint 15", period: "11 de jun.", type: "red" },
      { title: "Refinamento Sprint 17", period: "12 de jun.", type: "rose" },
      { title: "Liberação das US aos Devs", period: "08 de jun. - 09 de jun.", type: "magenta" },
      { title: "Mapeamento DBA", period: "12 de jun. - 14 de jun.", type: "magenta" },
      { title: "Planning Sprint 17", period: "15 de jun.", type: "orange" },
      { title: "Sprint Dev - 17", period: "16 de jun. - 30 de jun.", type: "blue" },
      { title: "Sprint Teste - 16", period: "16 de jun. - 30 de jun.", type: "lightBlue" },
    ],
    "2026-07": [
      { title: "Review", period: "01 de jul.", type: "cyan" },
      { title: "Entrega Sprint 16", period: "01 de jul.", type: "red" },
      { title: "Refinamento Sprint 18", period: "02 de jul.", type: "rose" },
      { title: "Planning Sprint 18", period: "03 de jul.", type: "orange" },
      { title: "Sprint Teste - 17", period: "03 de jul. - 11 de jul.", type: "mint" },
      { title: "Sprint Dev - 18", period: "06 de jul. - 20 de jul.", type: "green" },
      { title: "Mapeamento DBA", period: "22 de jul. - 23 de jul.", type: "magenta" },
      { title: "Review", period: "21 de jul.", type: "cyan" },
      { title: "Entrega Sprint 18", period: "21 de jul.", type: "red" },
      { title: "Refinamento Sprint 19", period: "22 de jul.", type: "rose" },
      { title: "Planning Sprint 19", period: "23 de jul.", type: "orange" },
      { title: "Sprint Dev - 19", period: "24 de jul. - 31 de jul.", type: "blue" },
      { title: "Sprint Teste - 18", period: "24 de jul. - 31 de jul.", type: "lightBlue" },
    ],
  };
  const timelineMilestones = timelineMilestonesByMonth[visibleMonthKey] ?? [];
  const esocialTimelineMilestonesByMonth: Record<
    string,
    Array<{ period: string; title: string; type: string }>
  > = {
    "2026-06": [
      { title: "[ESOCIAL] SPRINT DEV 5", period: "01 de jun. - 10 de jun.", type: "green" },
      { title: "[ESOCIAL] SPRINT TESTE - 4", period: "01 de jun. - 10 de jun.", type: "mint" },
      { title: "Review", period: "11 de jun.", type: "cyan" },
      { title: "Entrega Sprint 4", period: "11 de jun.", type: "red" },
      { title: "Refinamento Sprint 6", period: "12 de jun.", type: "rose" },
      { title: "Mapeamento DBA", period: "12 de jun. - 15 de jun.", type: "magenta" },
      { title: "Planning eSocial Sprint 6", period: "15 de jun.", type: "orange" },
      { title: "[ESOCIAL] SPRINT 6", period: "16 de jun. - 20 de jun.", type: "blue" },
      { title: "[ESOCIAL] SPRINT DEV 6", period: "21 de jun. - 30 de jun.", type: "blue" },
      { title: "[ESOCIAL] SPRINT TESTE - 5", period: "16 de jun. - 30 de jun.", type: "lightBlue" },
    ],
    "2026-07": [
      { title: "[ESOCIAL] SPRINT DEV 6", period: "01 de jul. - 03 de jul.", type: "blue" },
      { title: "[ESOCIAL] SPRINT TESTE - 5", period: "01 de jul. - 03 de jul.", type: "lightBlue" },
      { title: "Entrega Sprint 5", period: "01 de jul.", type: "red" },
      { title: "Refinamento eSocial Sprint 7", period: "02 de jul.", type: "rose" },
      { title: "Planning eSocial Sprint 7", period: "03 de jul.", type: "orange" },
      { title: "[ESOCIAL] SPRINT DEV 7", period: "06 de jul. - 20 de jul.", type: "blue" },
      { title: "[ESOCIAL] SPRINT TESTE - 6", period: "03 de jul. - 18 de jul.", type: "lightBlue" },
      { title: "Entrega Sprint 18 e eSocial Sprint 7", period: "21 de jul.", type: "red" },
      { title: "Refinamento eSocial Sprint 8", period: "22 de jul.", type: "rose" },
      { title: "Planning eSocial Sprint 8", period: "23 de jul.", type: "orange" },
      { title: "[ESOCIAL] SPRINT DEV 8", period: "24 de jul. - 31 de jul.", type: "blue" },
      { title: "[ESOCIAL] SPRINT TESTE - 7", period: "24 de jul. - 31 de jul.", type: "lightBlue" },
    ],
  };
  const esocialTimelineMilestones =
    esocialTimelineMilestonesByMonth[visibleMonthKey] ?? [];
  const sigepProcessSteps = [
    {
      title: "Refinamento",
      description:
        "PO, analistas e time tecnico detalham as necessidades e alinham regras de negocio.",
      meta: "Entrada: demandas priorizadas",
    },
    {
      title: "Planning",
      description:
        "As historias sao estimadas, fatiadas e selecionadas para a sprint de desenvolvimento.",
      meta: "Saida: sprint planejada",
    },
    {
      title: "Sprint DEV",
      description:
        "Desenvolvedores implementam as US, integram servicos, ajustam telas e preparam evidencias.",
      meta: "Duracao media: 15 dias",
    },
    {
      title: "Sprint Teste",
      description:
        "QA valida a entrega da sprint DEV passada. O teste é sempre realizado em D-1 da entrega anterior, nao da entrega atual.",
      meta: "Referencia: sprint DEV anterior",
    },
    {
      title: "Review",
      description:
        "O incremento e apresentado, validado com os envolvidos e preparado para entrega.",
      meta: "Marco de validacao",
    },
    {
      title: "Entrega",
      description:
        "A versao aprovada segue para publicacao, comunicacao e acompanhamento pos-entrega.",
      meta: "Fim do ciclo",
    },
  ];
  const sigepDefinitionCards = [
    {
      title: "DoR do desenvolvimento",
      items: [
        "User Story detalhada (regra de negócio)",
        "Critérios de aceite definidos",
        "Protótipo anexado",
        "Estimativa técnica (Story Points)",
        "Mapeamento de alteração/criação DBA",
      ],
    },
    {
      title: "DoD do desenvolvimento",
      items: [
        "Desenvolvimento concluído e disponível no ambiente de DEV",
        "Code Review realizado",
        "Testes de critérios de aceite realizados",
        "Aprovação com PO/Analistas",
      ],
    },
    {
      title: "DoR de teste",
      items: [
        "Regras de negócio claras",
        "Critérios de aceite definidos",
        "Cenários de teste mapeados e escritos",
        "Massa de dados identificada",
        "Desenvolvimento disponível no ambiente de teste",
      ],
    },
    {
      title: "DoD de teste",
      items: [
        "Critérios de aceite validados",
        "Sem defeitos críticos",
        "Aprovação com PO/Analistas",
        "Entrega disponível no ambiente de Homologação",
      ],
    },
  ];

  return (
    <div className="calendar-shell">
      <aside className="calendar-sidebar" aria-label="Menu do calendário">
        <button
          type="button"
          className="calendar-sidebar-back"
          aria-label="Voltar para a tela anterior"
          onClick={() => navigate("/")}
        >
          <FiArrowLeft aria-hidden="true" />
        </button>
        <nav className="calendar-sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/calendario"}
                className={({ isActive }) =>
                  `calendar-sidebar-link${isActive ? " is-active" : ""}`
                }
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <main className="calendar-content">
        {isCalendarioRoute ? (
          <section className="calendar-main-panel">
            <header className="calendar-panel-header calendar-main-header">
              <div>
                <FiCalendar aria-hidden="true" />
                <h1>Calendário de Entregas - SIGEP</h1>
              </div>
              <div className="calendar-month-nav" aria-label="Navegação de mês">
                <button
                  type="button"
                  aria-label="Mês anterior"
                  onClick={handlePreviousMonth}
                >
                  <FiChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="calendar-today-button"
                  aria-label="Voltar para o mês atual"
                  onClick={handleToday}
                  disabled={isViewingCurrentMonth}
                >
                  Hoje
                </button>
                <button
                  type="button"
                  aria-label="Próximo mês"
                  onClick={handleNextMonth}
                >
                  <FiChevronRight aria-hidden="true" />
                </button>
              </div>
            </header>
            <div className="calendar-months">
              <details className="calendar-accordion" open>
                <summary>SIGEP</summary>
                <div className="calendar-accordion-body">
                  <div className="calendar-planning-layout">
                    <aside className="calendar-timeline-card">
                      <header>
                        <span>LINHA DO TEMPO</span>
                        <h2>
                          {visibleMonth.title} {visibleMonthDate.getFullYear()}
                        </h2>
                      </header>
                      <section className="calendar-timeline-section">
                        <h3>Legenda</h3>
                        <div className="calendar-timeline-legend">
                          {timelineLegend.map((item) => (
                            <div key={item.label}>
                              <span className={`calendar-timeline-swatch is-${item.type}`} />
                              <span>{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                      <section className="calendar-timeline-section">
                        <h3>Marcos</h3>
                        <ol className="calendar-timeline-milestones">
                          {timelineMilestones.map((item) => (
                            <li
                              className={`is-${item.type}${
                                isTimelineHighlighted(item.title) ? " is-highlighted" : ""
                              }`}
                              key={`${item.period}-${item.title}`}
                              onBlur={() => setActiveTimelineItem(null)}
                              onFocus={() => setActiveTimelineItem(item.title)}
                              onMouseEnter={() => setActiveTimelineItem(item.title)}
                              onMouseLeave={() => setActiveTimelineItem(null)}
                              tabIndex={0}
                            >
                              <strong>{item.title}</strong>
                              <time>{item.period}</time>
                            </li>
                          ))}
                        </ol>
                      </section>
                    </aside>
                    <div className="calendar-planning-main">
                      <section className="calendar-active-sprint-row" aria-label="Sprint ativa">
                        <div className="calendar-active-sprint-card">
                          <span>SPRINT ATIVA</span>
                          <strong>{sprintAtiva.title}</strong>
                          <p>{sprintAtiva.period}</p>
                        </div>
                        {sprintPrazo && diasRestantesSprint !== null ? (
                          <div className="calendar-sprint-countdown-card">
                            <span>ENCERRAMENTO</span>
                            <strong>{diasRestantesSprint} dias</strong>
                            <p>
                              {sprintPrazo.title} - ate {sprintPrazo.endLabel}
                            </p>
                          </div>
                        ) : null}
                        <div className="calendar-sprint-duration-card">
                          <span>DURAÇÃO</span>
                          <strong>30 dias</strong>
                          <p>15 de desenvolvimento e 15 de teste</p>
                        </div>
                      </section>
                      {renderCalendarCard(sigepCalendarArea)}
                    </div>
                  </div>
                </div>
              </details>

              <details className="calendar-accordion" open>
                <summary>ESOCIAL</summary>
                <div className="calendar-accordion-body">
                  <div className="calendar-planning-layout">
                    <aside className="calendar-timeline-card">
                      <header>
                        <span>LINHA DO TEMPO</span>
                        <h2>
                          {visibleMonth.title} {visibleMonthDate.getFullYear()}
                        </h2>
                      </header>
                      <section className="calendar-timeline-section">
                        <h3>Legenda</h3>
                        <div className="calendar-timeline-legend">
                          {esocialTimelineLegend.map((item) => (
                            <div key={item.label}>
                              <span className={`calendar-timeline-swatch is-${item.type}`} />
                              <span>{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                      <section className="calendar-timeline-section">
                        <h3>Marcos</h3>
                        <ol className="calendar-timeline-milestones">
                          {esocialTimelineMilestones.map((item) => (
                            <li
                              className={`is-${item.type}${
                                isTimelineHighlighted(item.title) ? " is-highlighted" : ""
                              }`}
                              key={`${item.period}-${item.title}`}
                              onBlur={() => setActiveTimelineItem(null)}
                              onFocus={() => setActiveTimelineItem(item.title)}
                              onMouseEnter={() => setActiveTimelineItem(item.title)}
                              onMouseLeave={() => setActiveTimelineItem(null)}
                              tabIndex={0}
                            >
                              <strong>{item.title}</strong>
                              <time>{item.period}</time>
                            </li>
                          ))}
                        </ol>
                      </section>
                    </aside>
                    <div className="calendar-planning-main">
                      <section className="calendar-active-sprint-row" aria-label="Sprint ativa eSocial">
                        <div className="calendar-active-sprint-card">
                          <span>SPRINT ATIVA</span>
                          <strong>{esocialSprintAtiva.title}</strong>
                          <p>{esocialSprintAtiva.period}</p>
                        </div>
                        {esocialSprintPrazo && diasRestantesEsocialSprint !== null ? (
                          <div className="calendar-sprint-countdown-card">
                            <span>ENCERRAMENTO</span>
                            <strong>{diasRestantesEsocialSprint} dias</strong>
                            <p>
                              {esocialSprintPrazo.title} - ate {esocialSprintPrazo.endLabel}
                            </p>
                          </div>
                        ) : null}
                        <div className="calendar-sprint-duration-card">
                          <span>DURAÇÃO</span>
                          <strong>30 dias</strong>
                          <p>15 de desenvolvimento e 15 de teste</p>
                        </div>
                      </section>
                      {renderCalendarCard(esocialCalendarArea)}
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </section>
        ) : null}

        {isProcessoRoute ? (
          <section className="calendar-main-panel">
            <header className="calendar-panel-header">
              <FiFileText aria-hidden="true" />
              <h1>Processo de Desenvolvimento do SIGEP</h1>
            </header>
            <div className="calendar-process-content">
              <section className="calendar-process-overview" aria-label="Resumo do processo">
                <div>
                  <span>CICLO CONTINUO</span>
                  <strong>Refinar, desenvolver, testar e entregar</strong>
                  <p>
                    O fluxo organiza as atividades do SIGEP em sprints conectadas,
                    mantendo alinhamento entre negocio, desenvolvimento, testes e
                    entrega.
                  </p>
                </div>
              </section>

              <ol className="sigep-flow" aria-label="Fluxograma do processo de desenvolvimento do SIGEP">
                {sigepProcessSteps.map((step, index) => (
                  <li className="sigep-flow-step" key={step.title}>
                    <div className="sigep-flow-node">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <h2>{step.title}</h2>
                      <p>{step.description}</p>
                      <small>{step.meta}</small>
                    </div>
                  </li>
                ))}
              </ol>

              <section className="sigep-definitions" aria-label="DoR e DoD do desenvolvimento e teste">
                {sigepDefinitionCards.map((card) => (
                  <article className="sigep-definition-card" key={card.title}>
                    <h2>{card.title}</h2>
                    <ul>
                      {card.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </section>

              <section className="calendar-process-notes" aria-label="Pontos de controle">
                <article>
                  <strong>Controle de escopo</strong>
                  <p>
                    Demandas entram no ciclo apos priorizacao e refinamento, evitando
                    mudancas sem avaliacao durante a sprint.
                  </p>
                </article>
                <article>
                  <strong>Qualidade integrada</strong>
                  <p>
                    Testes acompanham o desenvolvimento e sustentam a decisao de
                    apresentar, ajustar ou liberar a entrega.
                  </p>
                </article>
                <article>
                  <strong>Melhoria continua</strong>
                  <p>
                    Review e retrospectiva alimentam os proximos refinamentos e
                    reduzem riscos do ciclo seguinte.
                  </p>
                </article>
              </section>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/calendario/*" element={<CalendarioPage />} />
      <Route path="/prototipos" element={<PrototiposPage />} />
      <Route path="/prototipos/sicad" element={<PrototiposSicadPage />} />
      <Route
        path="/prototipos/sicad/ocorrencias/nova"
        element={<PrototiposSicadNovaOcorrenciaPage />}
      />
      <Route
        path="/prototipos/sicad/ocorrencias/minhas"
        element={<PrototiposSicadMinhasOcorrenciasPage />}
      />
      <Route
        path="/prototipos/sicad/ocorrencias/fila"
        element={<PrototiposSicadFilaOcorrenciasPage />}
      />
      <Route
        path="/prototipos/sicad/ocorrencias/dashboard"
        element={<PrototiposSicadOcorrenciasDashboardPage />}
      />
      <Route
        path="/prototipos/sicad/ocorrencias/relatorios"
        element={<PrototiposSicadOcorrenciasRelatoriosPage />}
      />
      <Route
        path="/prototipos/sicad/ocorrencias/base-conhecimento"
        element={<PrototiposSicadBaseConhecimentoPage />}
      />
      <Route
        path="/prototipos/sicad/ocorrencias/:id"
        element={<PrototiposSicadOcorrenciaDetalhePage />}
      />
      <Route
        path="/ocorrencias/nova"
        element={<PrototiposSicadNovaOcorrenciaPage />}
      />
      <Route
        path="/ocorrencias/minhas"
        element={<PrototiposSicadMinhasOcorrenciasPage />}
      />
      <Route
        path="/ocorrencias/fila"
        element={<PrototiposSicadFilaOcorrenciasPage />}
      />
      <Route
        path="/ocorrencias/dashboard"
        element={<PrototiposSicadOcorrenciasDashboardPage />}
      />
      <Route
        path="/ocorrencias/relatorios"
        element={<PrototiposSicadOcorrenciasRelatoriosPage />}
      />
      <Route
        path="/ocorrencias/base-conhecimento"
        element={<PrototiposSicadBaseConhecimentoPage />}
      />
      <Route
        path="/ocorrencias/:id"
        element={<PrototiposSicadOcorrenciaDetalhePage />}
      />
      <Route path="/prototipos/sigep" element={<PrototiposSigepPage />} />
      <Route
        path="/prototipos/sigep/componentes"
        element={<PrototiposComponentesPage />}
      />
      <Route
        path="/prototipos/sigep/componentes/situacao-vigencia"
        element={<PrototiposSituacaoVigenciaPage />}
      />
      <Route
        path="/prototipos/sigep/componentes/documentos-vinculados"
        element={<PrototiposDocumentosVinculadosPage />}
      />
      <Route
        path="/prototipos/sigep/componentes/anexar-documento"
        element={<PrototiposAnexarDocumentoPage />}
      />
      <Route
        path="/prototipos/sigep/componentes/estrutura-organizacional"
        element={<PrototiposEstruturaOrganizacionalPage />}
      />
      <Route
        path="/prototipos/sigep/regime-juridico"
        element={<PrototiposSigepRegimeJuridicoPage />}
      />
      <Route
        path="/prototipos/sigep/controle-vagas"
        element={<PrototiposControleVagasPage />}
      />
      <Route
        path="/prototipos/sigep/controle-vagas/configuracao"
        element={<PrototiposControleVagasConfiguracaoPage />}
      />
      <Route
        path="/prototipos/sigep/controle-vagas/configuracao/novo"
        element={<PrototiposControleVagasConfiguracaoFormPage />}
      />
      <Route
        path="/prototipos/sigep/controle-vagas/configuracao/:id/editar"
        element={<PrototiposControleVagasConfiguracaoFormPage />}
      />
      <Route
        path="/prototipos/sigep/controle-vagas/quadro-autorizado"
        element={<PrototiposControleVagasQuadroAutorizadoPage />}
      />
      <Route
        path="/prototipos/sigep/controle-vagas/quadro-autorizado/novo"
        element={<PrototiposControleVagasQuadroAutorizadoFormPage />}
      />
      <Route
        path="/prototipos/sigep/controle-vagas/quadro-autorizado/:id/editar"
        element={<PrototiposControleVagasQuadroAutorizadoFormPage />}
      />
      <Route
        path="/prototipos/sigep/controle-vagas/consulta-saldo"
        element={<PrototiposControleVagasConsultaSaldoPage />}
      />
      <Route
        path="/prototipos/sigep/controle-vagas/vagas-numeradas"
        element={<PrototiposControleVagasVagasNumeradasPage />}
      />
      <Route
        path="/prototipos/sigep/controle-vagas/vagas-numeradas/novo"
        element={<PrototiposControleVagasVagasNumeradasFormPage />}
      />
      <Route
        path="/prototipos/sigep/controle-vagas/vagas-numeradas/:id/editar"
        element={<PrototiposControleVagasVagasNumeradasFormPage />}
      />
      <Route
        path="/prototipos/sigep/controle-vagas/historico"
        element={<PrototiposControleVagasHistoricoPage />}
      />
      <Route
        path="/prototipos/sigep/controle-vagas/integracao"
        element={<PrototiposControleVagasIntegracaoPage />}
      />
      <Route
        path="/prototipos/sigep/categoria"
        element={<PrototiposCategoriaPage />}
      />
      <Route
        path="/prototipos/sigep/cargo"
        element={<PrototiposCargoPage />}
      />
      <Route
        path="/prototipos/sigep/cargo/novo"
        element={<PrototiposCargoFormPage />}
      />
      <Route
        path="/prototipos/sigep/categoria/novo"
        element={<PrototiposCategoriaFormPage />}
      />
      <Route
        path="/prototipos/sigep/categoria/:id/editar"
        element={<PrototiposCategoriaFormPage />}
      />
      <Route
        path="/prototipos/sigep/regime-juridico/novo"
        element={<PrototiposSigepRegimeJuridicoNovoPage />}
      />
      <Route
        path="/prototipos/sigep/cargo-concurso-teste/regime-juridico"
        element={<PrototiposSigepRegimeJuridicoTestePage />}
      />
      <Route
        path="/prototipos/sigep/cargo-concurso-teste/regime-juridico/novo"
        element={<PrototiposSigepRegimeJuridicoTesteNovoPage />}
      />
      <Route
        path="/prototipos/sigep/cargo-concurso-teste/regime-juridico/:id/editar"
        element={<PrototiposSigepRegimeJuridicoTesteNovoPage />}
      />
      <Route
        path="/prototipos/sigep/cargo-concurso-teste/categoria"
        element={<PrototiposCategoriaTestePage />}
      />
      <Route
        path="/prototipos/sigep/cargo-concurso-teste/categoria/novo"
        element={<PrototiposCategoriaTesteFormPage />}
      />
      <Route
        path="/prototipos/sigep/cargo-concurso-teste/categoria/:id/editar"
        element={<PrototiposCategoriaTesteFormPage />}
      />
      <Route
        path="/prototipos/sigep/cargo-concurso-teste/cargo"
        element={<PrototiposCargoTestePage />}
      />
      <Route
        path="/prototipos/sigep/cargo-concurso-teste/cargo/novo"
        element={<PrototiposCargoTesteFormPage />}
      />
      <Route
        path="/prototipos/sigep/cargo-concurso-teste/cargo/:id/editar"
        element={<PrototiposCargoTesteFormPage />}
      />
      <Route
        path="/prototipos/sigep/cargo-concurso-teste/tipo-vinculo"
        element={<PrototiposTipoVinculoTestePage />}
      />
      <Route
        path="/prototipos/sigep/cargo-concurso-teste/tipo-vinculo/novo"
        element={<PrototiposTipoVinculoTesteFormPage />}
      />
      <Route
        path="/prototipos/sigep/cargo-concurso-teste/tipo-vinculo/:id/editar"
        element={<PrototiposTipoVinculoTesteFormPage />}
      />
      <Route
        path="/prototipos/sigep/cargo-concurso-teste/matriz-validacao"
        element={<PrototiposMatrizValidacaoTestePage />}
      />
      <Route
        path="/prototipos/sigep/cargo-concurso-teste/matriz-validacao/novo"
        element={<PrototiposMatrizValidacaoTesteFormPage />}
      />
      <Route
        path="/prototipos/sigep/cargo-concurso-teste/matriz-validacao/:id/editar"
        element={<PrototiposMatrizValidacaoTesteFormPage />}
      />
      <Route path="/prototipos/folha" element={<PrototiposFolhaPage />} />
      <Route
        path="/prototipos/folha/cronograma"
        element={<PrototiposFolhaCronogramaPage />}
      />
      <Route
        path="/prototipos/folha/processamento/competencias"
        element={<PrototiposFolhaCompetenciasPage />}
      />
      <Route
        path="/prototipos/folha/processamento/folha-pagamento"
        element={<PrototiposFolhaPagamentoPage />}
      />
      <Route
        path="/prototipos/folha/processamento/processamento-folha"
        element={
          <PrototiposFolhaPagamentoPage
            title="Processamento da Folha"
            variant="processamento"
          />
        }
      />
      <Route
        path="/prototipos/folha/processamento/processamento-folha/novo"
        element={<PrototiposFolhaProcessamentoFormPage />}
      />
      <Route
        path="/prototipos/folha/processamento/solicitacoes-ajustes"
        element={<PrototiposFolhaSolicitacoesAjustesPage />}
      />
      <Route
        path="/prototipos/folha/processamento/folha-pagamento/novo"
        element={<PrototiposFolhaPagamentoFormPage />}
      />
      <Route
        path="/prototipos/folha/processamento/folha-pagamento/:id/editar"
        element={<PrototiposFolhaPagamentoFormPage />}
      />
      <Route
        path="/prototipos/folha/processamento/folha-pagamento/:id/visualizar"
        element={<PrototiposFolhaPagamentoFormPage />}
      />
      <Route
        path="/prototipos/folha/processamento/folha-pagamento/execucoes/:execucaoId/log"
        element={<PrototiposFolhaPagamentoLogPage />}
      />
      <Route
        path="/prototipos/folha/grupos-folha"
        element={<Navigate to="/prototipos/folha/grupos-calculo" replace />}
      />
      <Route
        path="/prototipos/folha/grupos-folha/novo"
        element={<Navigate to="/prototipos/folha/grupos-calculo/novo" replace />}
      />
      <Route
        path="/prototipos/folha/grupos-folha/:id/editar"
        element={<Navigate to="/prototipos/folha/grupos-calculo" replace />}
      />
      <Route
        path="/prototipos/folha/catalogo-rubricas"
        element={<PrototiposFolhaCatalogoRubricasPage />}
      />
      <Route
        path="/prototipos/folha/catalogo-rubricas/:id"
        element={<PrototiposFolhaCatalogoRubricaViewPage />}
      />
      <Route
        path="/prototipos/folha/grupo-eleitos"
        element={<PrototiposFolhaGrupoEleitosPage />}
      />
      <Route
        path="/prototipos/folha/tabelas-referencia"
        element={<PrototiposFolhaTabelasReferenciaPage />}
      />
      <Route
        path="/prototipos/folha/tabelas-referencia/:tabelaId/vigencias/novo"
        element={<PrototiposFolhaTabelaReferenciaVigenciaFormPage />}
      />
      <Route
        path="/prototipos/folha/tabelas-referencia/:tabelaId/vigencias/:vigenciaId/editar"
        element={<PrototiposFolhaTabelaReferenciaVigenciaFormPage />}
      />
      <Route
        path="/prototipos/folha/valores-referencia/:codigo/vigencias/novo"
        element={<PrototiposFolhaValorReferenciaVigenciaFormPage />}
      />
      <Route
        path="/prototipos/folha/valores-referencia/:codigo/vigencias/:vigenciaId/editar"
        element={<PrototiposFolhaValorReferenciaVigenciaFormPage />}
      />
      <Route
        path="/prototipos/folha/relatorios/conformidade"
        element={<PrototiposFolhaConformidadePage />}
      />
      <Route
        path="/prototipos/folha/lancamento-financeiro/ficha-financeira"
        element={<PrototiposFolhaFichaFinanceiraPage />}
      />
      <Route
        path="/prototipos/folha/grupo-eleitos/novo"
        element={<PrototiposFolhaGrupoEleitoFormPage />}
      />
      <Route
        path="/prototipos/folha/grupos-calculo"
        element={<PrototiposFolhaGruposCalculoPage />}
      />
      <Route
        path="/prototipos/folha/grupos-calculo/novo"
        element={<PrototiposFolhaGrupoCalculoFormPage />}
      />
      <Route
        path="/prototipos/folha/grupos-calculo/:id/editar"
        element={<PrototiposFolhaGrupoCalculoFormPage />}
      />
      <Route
        path="/prototipos/folha/penhora-judicial"
        element={<PrototiposFolhaPenhoraJudicialPage />}
      />
      <Route path="/prototipos/pericia" element={<PrototiposPericiaPage />} />
      <Route
        path="/prototipos/consignado"
        element={<PrototiposConsignadoPage />}
      />
      <Route
        path="/prototipos/contagem-tempo"
        element={<PrototiposContagemTempoPage />}
      />
      <Route path="/prototipos/e-social" element={<PrototiposESocialPage />} />
      <Route
        path="/prototipos/aposentadoria"
        element={<PrototiposAposentadoriaPage />}
      />
      <Route
        path="/prototipos/conformidade"
        element={<PrototiposConformidadePage />}
      />
      <Route path="/prototipos/auditoria" element={<PrototiposAuditoriaPage />} />
      <Route path="/docs" element={<DocsLayout />}>
        <Route path=":id" element={<DocsRenderer />} />
        <Route index element={<DocsRenderer />} />
      </Route>
    </Routes>
  );
}

export default App;
