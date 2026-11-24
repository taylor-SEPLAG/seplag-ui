import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "primereact/sidebar";
import { Dialog } from "primereact/dialog";
import {
  FiActivity,
  FiBarChart2,
  FiCheckCircle,
  FiChevronDown,
  FiDownload,
  FiExternalLink,
  FiFileText,
  FiFilter,
  FiRefreshCw,
  FiUpload,
  FiX,
} from "react-icons/fi";
import {
  AbasProjeto,
  type ContextoProjeto,
  type DetalheProjeto,
} from "./AbasProjeto";
import { StatusHistoria, TabelaHistorias } from "./ComponentesProjeto";
import {
  compararRecorteAnterior,
  calcularCapacitySprint,
  filtrarHistorias,
  filtrosIniciais,
  nomesUnicos,
  primeirasAparicoes,
  resumir,
} from "./modelo";
import {
  baixarArquivo,
  exportarExcel,
  exportarPDF,
  exportarPNG,
  textoExecutivo,
} from "./exportacoes";
import { graficosAtivos } from "./registroGraficos";
import { importarPlanilha } from "./importacao";
import { ajustarEscopoProjeto } from "./ajustesEscopo";
import baseInicial from "./dados-iniciais.json";
import type { DadosProjeto, HistoriaProjeto } from "./types";
import logoEstado from "../assets/img/logo-seplag-sigep.png";
import "./indicadores.css";
import ProdutividadeAnalise from "./ProdutividadeAnalise";
import FluxoAnalise from "./FluxoAnalise";

const CHAVE = "sigep:indicadores-projeto:v1";
const ABAS = [
  { id: "visao", titulo: "Visão Geral" },
  { id: "sprints", titulo: "Evolução das Sprints" },
  { id: "capacity", titulo: "Capacity e Equipe" },
  { id: "pessoas", titulo: "Analistas e Desenvolvedores" },
  { id: "complexidade", titulo: "Complexidade" },
  { id: "squads", titulo: "Squads e Módulos" },
  { id: "riscos", titulo: "Riscos e Insights" },
];
function carregarBase(): { dados: DadosProjeto; erro: string } {
  try {
    const json = localStorage.getItem(CHAVE);
    if (!json) return { dados: baseInicial as DadosProjeto, erro: "" };
    const dados = JSON.parse(json) as DadosProjeto;
    if (
      dados.versao !== 1 ||
      !Array.isArray(dados.historias) ||
      !Array.isArray(dados.sprints) ||
      !dados.sprints.length ||
      !dados.historias.every(
        (h) =>
          /^US\d+$/.test(h.codigo) &&
          h.sprint >= 18 &&
          h.sprint <= 23 &&
          Array.isArray(h.desenvolvedores) &&
          Array.isArray(h.analistas) &&
          Array.isArray(h.squads) &&
          Array.isArray(h.linhas),
      )
    )
      throw new Error("Base inválida");
    // Uma nova base fornecida no projeto substitui importações anteriores.
    // Importações feitas depois desta atualização continuam sendo preservadas.
    const importacaoSalva = Date.parse(dados.importadoEm);
    if (
      !Number.isFinite(importacaoSalva) ||
      importacaoSalva < Date.parse(baseInicial.importadoEm)
    ) {
      return { dados: baseInicial as DadosProjeto, erro: "" };
    }
    return { dados: ajustarEscopoProjeto(dados), erro: "" };
  } catch {
    return {
      dados: baseInicial as DadosProjeto,
      erro: "Não foi possível ler a importação salva. O painel está usando a base original fornecida.",
    };
  }
}
export default function DashboardProjeto({
  secaoAnalise = false,
}: { secaoAnalise?: boolean } = {}) {
  const abas = secaoAnalise
    ? [
        { id: "analise", titulo: "Produtividade da Análise" },
        // Fluxo WIP preservado no código; oculto nesta versão simplificada.
      ]
    : ABAS;
  const [estado, setEstado] = useState(carregarBase),
    dados = estado.dados;
  const [rascunho, setRascunho] = useState(() => filtrosIniciais(dados)),
    [filtros, setFiltros] = useState(rascunho),
    [aba, setAba] = useState(secaoAnalise ? "analise" : "visao"),
    [foco, setFoco] = useState<number | null>(null);
  const [detalhe, setDetalhe] = useState<DetalheProjeto | null>(null),
    [historia, setHistoria] = useState<HistoriaProjeto | null>(null);
  const [importando, setImportando] = useState(false),
    [mensagem, setMensagem] = useState(""),
    [erro, setErro] = useState(estado.erro),
    [exportacao, setExportacao] = useState(false),
    [ocupado, setOcupado] = useState(false),
    [resumoAberto, setResumoAberto] = useState(false),
    [seletorPNG, setSeletorPNG] = useState(false),
    [graficoEscolhido, setGraficoEscolhido] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(
    () => window.matchMedia?.("(min-width: 760px)").matches ?? true,
  );
  const arquivo = useRef<HTMLInputElement>(null),
    id = useId(),
    tabsRef = useRef<HTMLDivElement>(null);
  const historias = useMemo(
    () => filtrarHistorias(dados, filtros),
    [dados, filtros],
  );
  const primeiras = useMemo(() => primeirasAparicoes(dados.historias), [dados]);
  const resumo = useMemo(
    () => resumir(historias, primeiras),
    [historias, primeiras],
  );
  const anterior = useMemo(() => {
    const registros = compararRecorteAnterior(dados, filtros);
    return registros ? resumir(registros, primeiras) : null;
  }, [dados, filtros, primeiras]);
  const sprints = useMemo(
    () =>
      dados.sprints
        .filter((s) => s.numero >= filtros.inicial && s.numero <= filtros.final)
        .map((s) => {
          const registros = historias.filter((h) => h.sprint === s.numero);
          return {
            numero: s.numero,
            periodo: s.periodo,
            historias: registros,
            resumo: resumir(registros, primeiras),
            capacity: calcularCapacitySprint(s, registros),
          };
        }),
    [dados, filtros.inicial, filtros.final, historias, primeiras],
  );
  const periodo =
    filtros.inicial === filtros.final
      ? `Sprint ${filtros.inicial}`
      : `Sprints ${filtros.inicial} a ${filtros.final}`;
  const abrir = useCallback((novo: DetalheProjeto) => setDetalhe(novo), []);
  const filtrarModulo = useCallback((modulo: string) => {
    setFiltros((f) => ({ ...f, modulo }));
    setRascunho((f) => ({ ...f, modulo }));
    setMensagem(`Filtro de módulo aplicado: ${modulo}.`);
  }, []);
  const ctx: ContextoProjeto = useMemo(
    () => ({
      dados,
      historias,
      filtros,
      primeiras,
      periodo,
      resumo,
      anterior,
      sprints,
      foco,
      abrir,
      destacar: setFoco,
      filtrarModulo,
    }),
    [
      dados,
      historias,
      filtros,
      primeiras,
      periodo,
      resumo,
      anterior,
      sprints,
      foco,
      abrir,
      filtrarModulo,
    ],
  );
  const opcoes = useMemo(
    () => ({
      squad: nomesUnicos(dados.historias.flatMap((h) => h.squads)),
      analista: nomesUnicos(dados.historias.flatMap((h) => h.analistas)),
      desenvolvedor: nomesUnicos(
        dados.historias.flatMap((h) => h.desenvolvedores),
      ),
      modulo: nomesUnicos(
        dados.historias.map((h) => h.modulo ?? "Não informado"),
      ),
      situacao: nomesUnicos(dados.historias.map((h) => h.situacao)),
    }),
    [dados],
  );
  const selecionarAba = (nova: string) => {
    setAba(nova);
    setExportacao(false);
  };
  const tecladoAbas = (e: KeyboardEvent<HTMLButtonElement>, indice: number) => {
    let destino = indice;
    if (e.key === "ArrowRight") destino = (indice + 1) % abas.length;
    else if (e.key === "ArrowLeft")
      destino = (indice - 1 + abas.length) % abas.length;
    else if (e.key === "Home") destino = 0;
    else if (e.key === "End") destino = abas.length - 1;
    else return;
    e.preventDefault();
    selecionarAba(abas[destino].id);
    tabsRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      .item(destino)
      ?.focus();
  };
  const aplicar = () => {
    if (rascunho.inicial > rascunho.final) {
      setErro("A sprint inicial deve ser menor ou igual à sprint final.");
      return;
    }
    setFiltros({ ...rascunho });
    setFoco(null);
    setErro("");
    setMensagem("Filtros aplicados a todas as abas.");
  };
  const limpar = () => {
    const inicio = filtrosIniciais(dados);
    setRascunho(inicio);
    setFiltros(inicio);
    setFoco(null);
    setErro("");
    setMensagem("Filtros restaurados para o período disponível na planilha.");
    window.dispatchEvent(new Event("sigep:analise-limpar"));
  };
  const importar = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setErro("Selecione uma planilha no formato .xlsx.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErro("Selecione uma planilha de até 25 MB.");
      return;
    }
    setImportando(true);
    setErro("");
    try {
      const nova = await importarPlanilha(await file.arrayBuffer(), file.name);
      setEstado({ dados: nova, erro: "" });
      const inicio = filtrosIniciais(nova);
      setRascunho(inicio);
      setFiltros(inicio);
      setFoco(null);
      setDetalhe(null);
      setHistoria(null);
      try {
        localStorage.setItem(CHAVE, JSON.stringify(nova));
        setMensagem(
          `Planilha atualizada: ${nova.historias.length} registros nas Sprints ${inicio.inicial} a ${inicio.final}.`,
        );
      } catch {
        setMensagem(
          "Dados importados nesta sessão. O navegador não permitiu salvar a base localmente.",
        );
      }
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível ler a planilha. A base anterior foi preservada.",
      );
    } finally {
      setImportando(false);
      if (arquivo.current) arquivo.current.value = "";
    }
  };
  const executarExportacao = async (acao: () => Promise<void> | void) => {
    setOcupado(true);
    setErro("");
    setExportacao(false);
    try {
      await acao();
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível exportar o relatório.",
      );
    } finally {
      setOcupado(false);
    }
  };
  const resumoTexto = useMemo(
    () => textoExecutivo(dados, historias, filtros),
    [dados, historias, filtros],
  );
  const historicoUS = historia
    ? dados.historias.filter((h) => h.codigo === historia.codigo)
    : [];
  return (
    <section
      className="calendar-main-panel sigep-indicadores"
      aria-labelledby={`${id}-titulo`}
    >
      <div className="ind-institutional">
        <img src={logoEstado} alt="Governo do Estado de Mato Grosso — SEPLAG" />
        <div>
          <span>SIGEP</span>
          <b>INDICADORES DO PROJETO</b>
        </div>
        <span className="ind-source-badge">
          <FiCheckCircle aria-hidden="true" /> Dados da planilha
        </span>
      </div>
      <div className="ind-page-intro">
        <nav className="ind-breadcrumb" aria-label="Navegação estrutural">
          <Link to="/">Início</Link>
          <span>/</span>
          <Link to="/calendario/indicadores">Indicadores</Link>
          <span>/</span>
          <span aria-current="page">
            {secaoAnalise
              ? "Produtividade da Análise"
              : "Indicadores do Projeto"}
          </span>
        </nav>
        <div className="ind-page-heading">
          <div>
            <h1 id={`${id}-titulo`}>
              {aba === "fluxo"
                ? "Gestão do Fluxo de Análise"
                : aba === "analise"
                  ? "Produtividade e Capacidade da Análise"
                  : "Dashboard Gerencial — Projeto SIGEP"}
            </h1>
            <p>
              {aba === "fluxo"
                ? "Monitoramento do trabalho em andamento, tempo de ciclo, gargalos e capacidade de conclusão das análises."
                : aba === "analise"
                  ? "Acompanhamento da demanda, complexidade e capacidade dos analistas de requisitos."
                  : "Acompanhamento de capacidade, produtividade, complexidade e evolução das entregas."}
            </p>
          </div>
          <div className="ind-page-actions">
            <input
              ref={arquivo}
              className="ind-file-input"
              type="file"
              accept=".xlsx"
              aria-label="Selecionar planilha do projeto"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importar(file);
              }}
            />
            <button
              type="button"
              className="ind-button secondary"
              disabled={importando}
              onClick={() => arquivo.current?.click()}
            >
              <FiUpload aria-hidden="true" />
              {importando ? "Importando..." : "Atualizar dados da planilha"}
            </button>
            <div className="ind-export-menu">
              <button
                type="button"
                className="ind-button"
                disabled={ocupado || importando}
                aria-expanded={
                  ["analise", "fluxo"].includes(aba) ? undefined : exportacao
                }
                aria-controls={
                  ["analise", "fluxo"].includes(aba)
                    ? undefined
                    : `${id}-exportacao`
                }
                aria-haspopup={
                  ["analise", "fluxo"].includes(aba) ? "dialog" : undefined
                }
                onClick={() =>
                  aba === "fluxo"
                    ? window.dispatchEvent(new Event("sigep:fluxo-relatorio"))
                    : aba === "analise"
                      ? window.dispatchEvent(
                          new Event("sigep:analise-relatorio"),
                        )
                      : setExportacao((v) => !v)
                }
              >
                <FiDownload aria-hidden="true" />
                {ocupado ? "Gerando relatório..." : "Exportar relatório"}
                <FiChevronDown aria-hidden="true" />
              </button>
              {exportacao && (
                <div id={`${id}-exportacao`} className="ind-export-popover">
                  <button
                    type="button"
                    onClick={() =>
                      void executarExportacao(() =>
                        exportarPDF(
                          dados,
                          historias,
                          filtros,
                          abas.find((a) => a.id === aba)!.titulo,
                        ),
                      )
                    }
                  >
                    Dashboard em PDF (aba atual)
                  </button>
                  <button
                    type="button"
                    disabled={!graficosAtivos.size}
                    title={
                      !graficosAtivos.size
                        ? "Não há gráficos nesta aba."
                        : undefined
                    }
                    onClick={() => {
                      setGraficoEscolhido(
                        graficosAtivos.keys().next().value ?? "",
                      );
                      setSeletorPNG(true);
                      setExportacao(false);
                    }}
                  >
                    Gráfico como PNG
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void executarExportacao(() =>
                        exportarExcel(dados, historias, filtros),
                      )
                    }
                  >
                    Dados filtrados em Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResumoAberto(true);
                      setExportacao(false);
                    }}
                  >
                    Gerar resumo executivo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="ind-source-line">
          <span>
            <FiFileText aria-hidden="true" /> {dados.arquivo}
          </span>
          <span>
            Última importação:{" "}
            <time dateTime={dados.importadoEm}>
              {new Date(dados.importadoEm).toLocaleString("pt-BR", {
                timeZone: "America/Cuiaba",
                dateStyle: "short",
                timeStyle: "short",
              })}
            </time>
          </span>
        </div>
      </div>
      {erro && (
        <div role="alert" className="ind-feedback is-error">
          <FiActivity aria-hidden="true" />
          <span>{erro}</span>
          <button
            type="button"
            aria-label="Fechar mensagem"
            onClick={() => setErro("")}
          >
            <FiX />
          </button>
        </div>
      )}
      <span className="ind-sr-only" role="status" aria-live="polite">
        {mensagem}
      </span>
      <details
        className="ind-filters"
        open={filtrosAbertos}
        onToggle={(e) => setFiltrosAbertos(e.currentTarget.open)}
      >
        <summary>
          <FiFilter aria-hidden="true" /> Filtros de análise{" "}
          <span>{periodo}</span>
          <FiChevronDown aria-hidden="true" />
        </summary>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            aplicar();
          }}
        >
          <div className="ind-filter-grid">
            <label htmlFor={`${id}-inicial`}>
              Sprint inicial
              <select
                id={`${id}-inicial`}
                value={rascunho.inicial}
                onChange={(e) =>
                  setRascunho((f) => ({
                    ...f,
                    inicial: Number(e.target.value),
                  }))
                }
              >
                {dados.sprints.map((s) => (
                  <option key={s.numero} value={s.numero}>
                    Sprint {s.numero}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor={`${id}-final`}>
              Sprint final
              <select
                id={`${id}-final`}
                value={rascunho.final}
                onChange={(e) =>
                  setRascunho((f) => ({ ...f, final: Number(e.target.value) }))
                }
              >
                {dados.sprints.map((s) => (
                  <option key={s.numero} value={s.numero}>
                    Sprint {s.numero}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor={`${id}-comparar`}>
              Comparar com sprint anterior
              <select
                id={`${id}-comparar`}
                value={String(rascunho.comparar)}
                onChange={(e) =>
                  setRascunho((f) => ({
                    ...f,
                    comparar: e.target.value === "true",
                  }))
                }
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </label>
            {(
              [
                ["squad", "Squad", "Todas"],
                ["analista", "Analista", "Todos"],
                ["desenvolvedor", "Desenvolvedor", "Todos"],
                ["modulo", "Módulo", "Todos"],
                ["situacao", "Situação da história", "Todas"],
              ] as const
            ).map(([campo, label, todos]) => (
              <label htmlFor={`${id}-${campo}`} key={campo}>
                {label}
                <select
                  id={`${id}-${campo}`}
                  value={rascunho[campo]}
                  onChange={(e) =>
                    setRascunho((f) => ({ ...f, [campo]: e.target.value }))
                  }
                >
                  <option value="">{todos}</option>
                  {opcoes[campo].map((valor) => (
                    <option key={valor} value={valor}>
                      {campo === "squad" ? `Squad ${valor}` : valor}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="ind-filter-actions">
            <span>Os filtros são preservados ao navegar entre as abas.</span>
            <button type="button" className="ind-button ghost" onClick={limpar}>
              <FiRefreshCw aria-hidden="true" />
              Limpar filtros
            </button>
            <button type="submit" className="ind-button">
              <FiFilter aria-hidden="true" />
              Aplicar filtros
            </button>
          </div>
        </form>
      </details>
      <div
        className="ind-tabs"
        role="tablist"
        aria-label="Análises do projeto"
        ref={tabsRef}
      >
        {abas.map((item, i) => (
          <button
            type="button"
            role="tab"
            key={item.id}
            id={`${id}-tab-${item.id}`}
            aria-selected={aba === item.id}
            aria-controls={`${id}-painel`}
            tabIndex={aba === item.id ? 0 : -1}
            onClick={() => selecionarAba(item.id)}
            onKeyDown={(e) => tecladoAbas(e, i)}
          >
            {item.titulo}
          </button>
        ))}
      </div>
      <div className="ind-period-bar">
        <div>
          <span className="ind-period-pill">
            <FiBarChart2 aria-hidden="true" />
            {periodo}
          </span>
          <span>
            {sprints[0]?.periodo.split(" a ")[0]} —{" "}
            {sprints.at(-1)?.periodo.split(" a ").at(-1)}
            <b>{historias.length} registros no recorte</b>
          </span>
        </div>
        <div className="ind-focus-control">
          <label htmlFor={`${id}-foco`}>
            Destacar sprint
            <select
              id={`${id}-foco`}
              value={foco ?? ""}
              onChange={(e) =>
                setFoco(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">Todas</option>
              {sprints.map((s) => (
                <option key={s.numero} value={s.numero}>
                  Sprint {s.numero}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="ind-icon-button"
            title="Restaurar visualização"
            aria-label="Restaurar destaque e zoom dos gráficos"
            onClick={() => {
              setFoco(null);
              for (const r of graficosAtivos.values()) r.chart.resetZoom();
            }}
          >
            <FiRefreshCw aria-hidden="true" />
          </button>
        </div>
      </div>
      <div
        className="ind-tab-content"
        role="tabpanel"
        id={`${id}-painel`}
        aria-labelledby={`${id}-tab-${aba}`}
      >
        {aba === "fluxo" ? (
          <FluxoAnalise ctx={ctx} />
        ) : aba === "analise" ? (
          <ProdutividadeAnalise ctx={ctx} />
        ) : (
          <AbasProjeto aba={aba} ctx={ctx} />
        )}
      </div>
      <footer className="ind-page-footer">
        <details>
          <summary>Origem, critérios de contagem e qualidade dos dados</summary>
          <p>
            Somente as abas e os períodos das Sprints 18 a 23. Uma US por
            sprint; uma história distinta por código. Desenvolvedores
            compartilhados mantêm todas as associações. Estimativas ausentes
            permanecem desconhecidas.
          </p>
          {["analise", "fluxo"].includes(aba) ? (
            <p>
              Conclusões da análise exigem registros próprios de conclusão da
              especificação. Aprovações, rodadas e horas ativas exigem
              evidências específicas; a situação de desenvolvimento não
              substitui esses registros. Disponibilidade da equipe e FTE são
              calculados apenas das alocações cadastradas, sem inferência pela
              atribuição de histórias.
            </p>
          ) : (
            <p>
              Conclusão usa a situação da última aparição da US no recorte. A
              taxa representa conclusões confirmadas, com cobertura de situação
              indicada nos cards. Desenvolvedores disponíveis são os nomes
              distintos atribuídos às histórias por sprint. Aprovação em QA,
              homologação e FTE exigem evidências próprias.
            </p>
          )}
          <p>
            {dados.historicosIgnorados} linhas históricas ou sem vínculo com o
            período atual ignoradas. {dados.removidas} US explicitamente
            removida(s) do escopo excluída(s) das contagens.
          </p>
          {dados.avisos.map((aviso, i) => (
            <p key={i}>{aviso.mensagem}</p>
          ))}
        </details>
        <span>SIGEP · Indicadores do Projeto · {periodo}</span>
      </footer>
      <Sidebar
        visible={Boolean(detalhe)}
        position="right"
        onHide={() => setDetalhe(null)}
        className="ind-detail-drawer"
        style={{ width: "min(1040px, 100vw)" }}
        header={
          <div>
            <span className="ind-eyebrow">{periodo}</span>
            <h2>{detalhe?.titulo}</h2>
          </div>
        }
      >
        {detalhe && (
          <>
            <div className="ind-detail-intro">
              {detalhe.valor && <strong>{detalhe.valor}</strong>}
              <p>{detalhe.formula}</p>
              <span>Fonte: {dados.arquivo}</span>
            </div>
            <div className="ind-detail-actions">
              <span>{detalhe.historias.length} registros relacionados</span>
              <button
                type="button"
                className="ind-button secondary"
                onClick={() =>
                  void executarExportacao(() =>
                    exportarExcel(
                      dados,
                      detalhe.historias,
                      filtros,
                      "sigep-detalhamento",
                    ),
                  )
                }
              >
                <FiDownload aria-hidden="true" />
                Exportar detalhamento
              </button>
            </div>
            <TabelaHistorias
              key={detalhe.titulo}
              historias={detalhe.historias}
              onHistoria={setHistoria}
              pessoa={detalhe.pessoa}
            />
          </>
        )}
      </Sidebar>
      <Dialog
        visible={Boolean(historia)}
        onHide={() => setHistoria(null)}
        header={historia?.codigo}
        className="ind-story-dialog"
        style={{ width: "min(850px, 95vw)" }}
        modal
        footer={
          <button
            type="button"
            className="ind-button secondary"
            onClick={() => setHistoria(null)}
          >
            Fechar
          </button>
        }
      >
        {historia && (
          <>
            <h2>{historia.titulo}</h2>
            <dl className="ind-story-fields">
              <div>
                <dt>Módulo / menu</dt>
                <dd>
                  {historia.modulo ?? "Não informado"} /{" "}
                  {historia.menu ?? "Não informado"}
                </dd>
              </div>
              <div>
                <dt>Sprints associadas</dt>
                <dd>{historicoUS.map((h) => h.sprint).join(", ")}</dd>
              </div>
              <div>
                <dt>Analista</dt>
                <dd>{historia.analistas.join(", ") || "Não informado"}</dd>
              </div>
              <div>
                <dt>Desenvolvedores</dt>
                <dd>
                  {historia.desenvolvedores.join(", ") || "Não informado"}
                </dd>
              </div>
              <div>
                <dt>Squad registrada</dt>
                <dd>{historia.squads.join(", ") || "Não informado"}</dd>
              </div>
              <div>
                <dt>Complexidade</dt>
                <dd>
                  {historia.pontos === null
                    ? "Não informada"
                    : `${historia.pontos} pontos`}
                </dd>
              </div>
              <div>
                <dt>Situação</dt>
                <dd>
                  <StatusHistoria situacao={historia.situacao} />
                </dd>
              </div>
              <div>
                <dt>Dependências</dt>
                <dd>{historia.dependencias.join(", ") || "Não informadas"}</dd>
              </div>
              <div>
                <dt>QA associado (não comprova aprovação)</dt>
                <dd>{historia.qa.join(", ") || "Não informado"}</dd>
              </div>
              <div>
                <dt>Período original</dt>
                <dd>{historia.periodoOriginal}</dd>
              </div>
            </dl>
            <p className="ind-note">
              Origem: {historia.aba}, linha(s) {historia.linhas.join(", ")}.{" "}
              {historia.observacoes}
            </p>
            <div className="ind-story-links">
              {historia.redmine && (
                <a
                  className="ind-button secondary"
                  href={historia.redmine}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir Redmine <FiExternalLink aria-hidden="true" />
                </a>
              )}
              {historia.documento && (
                <a
                  className="ind-text-button"
                  href={historia.documento}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Documento da US <FiExternalLink aria-hidden="true" />
                </a>
              )}
            </div>
            <h3>Histórico de aparições</h3>
            <div className="ind-table-scroll">
              <table className="ind-table">
                <thead>
                  <tr>
                    <th>Sprint</th>
                    <th>Desenvolvedores</th>
                    <th>Pontos</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoUS.map((h) => (
                    <tr key={h.id}>
                      <td>{h.sprint}</td>
                      <td>{h.desenvolvedores.join(", ") || "Não informado"}</td>
                      <td>{h.pontos ?? "—"}</td>
                      <td>{h.situacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Dialog>
      <Dialog
        visible={resumoAberto}
        onHide={() => setResumoAberto(false)}
        header="Resumo executivo — Projeto SIGEP"
        className="ind-export-dialog"
        style={{ width: "min(860px, 95vw)" }}
        modal
        footer={
          <div className="ind-dialog-actions">
            <button
              type="button"
              className="ind-button secondary"
              onClick={() => setResumoAberto(false)}
            >
              Fechar
            </button>
            <button
              type="button"
              className="ind-button"
              onClick={() =>
                baixarArquivo(
                  new Blob([resumoTexto], { type: "text/plain;charset=utf-8" }),
                  "sigep-resumo-executivo.txt",
                )
              }
            >
              <FiDownload aria-hidden="true" />
              Baixar resumo
            </button>
          </div>
        }
      >
        <textarea
          className="ind-executive-text"
          aria-label="Resumo executivo gerado"
          value={resumoTexto}
          readOnly
        />
      </Dialog>
      <Dialog
        visible={seletorPNG}
        onHide={() => setSeletorPNG(false)}
        header="Exportar gráfico como PNG"
        className="ind-export-dialog"
        style={{ width: "min(540px, 95vw)" }}
        modal
        footer={
          <div className="ind-dialog-actions">
            <button
              type="button"
              className="ind-button secondary"
              onClick={() => setSeletorPNG(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="ind-button"
              disabled={!graficoEscolhido}
              onClick={() =>
                void executarExportacao(() => {
                  exportarPNG(graficoEscolhido);
                  setSeletorPNG(false);
                })
              }
            >
              Exportar PNG
            </button>
          </div>
        }
      >
        <label className="ind-export-chart-label">
          Gráfico da aba atual
          <select
            value={graficoEscolhido}
            onChange={(e) => setGraficoEscolhido(e.target.value)}
          >
            {[...graficosAtivos].map(([chave, g]) => (
              <option key={chave} value={chave}>
                {g.titulo}
              </option>
            ))}
          </select>
        </label>
      </Dialog>
    </section>
  );
}
