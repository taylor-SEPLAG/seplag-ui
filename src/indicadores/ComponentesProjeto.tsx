import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle,
  FiInfo,
  FiSearch,
} from "react-icons/fi";
import { normalizar, numero, variacao } from "./modelo";
import type { HistoriaProjeto, InsightProjeto } from "./types";

export function Ajuda({ texto }: { texto: string }) {
  const id = useId();
  return (
    <span className="ind-help">
      <button
        type="button"
        aria-label="Informação sobre o indicador"
        aria-describedby={id}
      >
        <FiHelpCircle aria-hidden="true" />
      </button>
      <span role="tooltip" id={id}>
        {texto}
      </span>
    </span>
  );
}
export function EstadoVazio({
  titulo = "Dado não informado",
  children,
}: {
  titulo?: string;
  children: ReactNode;
}) {
  return (
    <div className="ind-empty">
      <FiInfo aria-hidden="true" />
      <strong>{titulo}</strong>
      <p>{children}</p>
    </div>
  );
}
export function StatusHistoria({ situacao }: { situacao: string }) {
  const estado = normalizar(situacao);
  return (
    <span
      className={`ind-status ${estado === "finalizada" ? "is-done" : estado === "em andamento" ? "is-progress" : ""}`}
    >
      {situacao}
    </span>
  );
}
function Contador({
  valor,
  casas = 0,
}: {
  valor: number | null;
  casas?: number;
}) {
  const [visivel, setVisivel] = useState(0),
    anterior = useRef(0);
  useEffect(() => {
    if (valor === null) return;
    const inicial = anterior.current,
      alvo = valor,
      comeco = performance.now(),
      reduzido =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
        false;
    let frame = 0;
    const animar = (tempo: number) => {
      const progresso = reduzido
        ? 1
        : Math.max(0, Math.min(1, (tempo - comeco) / 650));
      setVisivel(inicial + (alvo - inicial) * (1 - (1 - progresso) ** 3));
      if (progresso < 1) frame = requestAnimationFrame(animar);
      else anterior.current = alvo;
    };
    frame = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(frame);
  }, [valor]);
  return <>{valor === null ? "Não informado" : numero(visivel, casas)}</>;
}
export function KpiProjeto({
  titulo,
  valor,
  sufixo = "",
  casas = 0,
  icone,
  ajuda,
  nota,
  periodo,
  anterior,
  comparar,
  onClick,
}: {
  titulo: string;
  valor: number | null;
  sufixo?: string;
  casas?: number;
  icone: ReactNode;
  ajuda: string;
  nota: string;
  periodo: string;
  anterior?: number | null;
  comparar?: boolean;
  onClick: () => void;
}) {
  const delta = variacao(valor, anterior ?? null);
  return (
    <article className="ind-kpi">
      <div className="ind-kpi-heading">
        <span className="ind-kpi-icon">{icone}</span>
        <span>{titulo}</span>
        <Ajuda texto={ajuda} />
      </div>
      <button
        type="button"
        className="ind-kpi-main"
        onClick={onClick}
        aria-label={`Detalhar ${titulo}`}
      >
        <strong className={valor === null ? "is-unavailable" : ""}>
          <Contador valor={valor} casas={casas} />
          {valor !== null && sufixo}
        </strong>
        <span>{nota}</span>
      </button>
      <div className="ind-kpi-footer">
        <small>{periodo}</small>
        {comparar && (
          <span
            className={`ind-variation ${delta !== null && delta > 0 ? "is-up" : ""}`}
            title="Comparação com recorte anterior de igual duração, quando presente no arquivo"
          >
            {delta === null ? (
              "Sem recorte anterior"
            ) : (
              <>
                {delta >= 0 ? <FiArrowUp /> : <FiArrowDown />}
                {numero(Math.abs(delta), 1)}%
              </>
            )}
          </span>
        )}
      </div>
    </article>
  );
}
export function CardInsight({
  insight,
  onClick,
  compacto = false,
}: {
  insight: InsightProjeto;
  onClick: () => void;
  compacto?: boolean;
}) {
  return (
    <article className={`ind-insight is-${insight.tom}`}>
      <div>
        <FiInfo aria-hidden="true" />
        <h3>{insight.titulo}</h3>
      </div>
      <strong>{insight.valor}</strong>
      <p>{insight.explicacao}</p>
      {!compacto && (
        <>
          <p className="ind-insight-impacto">
            <b>Possível impacto:</b> {insight.impacto}
          </p>
          <p className="ind-insight-question">{insight.pergunta}</p>
        </>
      )}
      <button type="button" className="ind-text-button" onClick={onClick}>
        Ver fundamento e histórias <FiChevronRight aria-hidden="true" />
      </button>
    </article>
  );
}
export function TabelaHistorias({
  historias,
  onHistoria,
  pessoa,
}: {
  historias: HistoriaProjeto[];
  onHistoria: (h: HistoriaProjeto) => void;
  pessoa?: string;
}) {
  const [busca, setBusca] = useState(""),
    [sprint, setSprint] = useState(""),
    [status, setStatus] = useState(""),
    [ordem, setOrdem] = useState<"codigo" | "sprint" | "pontos">("sprint"),
    [inversa, setInversa] = useState(false),
    [pagina, setPagina] = useState(0),
    [tamanho, setTamanho] = useState(15);
  const id = useId();
  const filtradas = historias
    .filter(
      (h) =>
        (!sprint || String(h.sprint) === sprint) &&
        (!status || h.situacao === status) &&
        normalizar(
          [
            h.codigo,
            h.titulo,
            h.modulo,
            h.menu,
            ...h.analistas,
            ...h.desenvolvedores,
          ].join(" "),
        ).includes(normalizar(busca)),
    )
    .sort((a, b) => {
      const comparacao =
        ordem === "codigo"
          ? a.codigo.localeCompare(b.codigo, undefined, { numeric: true })
          : ordem === "sprint"
            ? a.sprint - b.sprint
            : (a.pontos ?? -1) - (b.pontos ?? -1);
      return comparacao * (inversa ? -1 : 1);
    });
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / tamanho)),
    atual = Math.min(pagina, totalPaginas - 1),
    visiveis = filtradas.slice(atual * tamanho, (atual + 1) * tamanho);
  const selecionarOrdem = (campo: "codigo" | "sprint" | "pontos") => {
    if (ordem === campo) setInversa((v) => !v);
    else {
      setOrdem(campo);
      setInversa(false);
    }
    setPagina(0);
  };
  return (
    <div className="ind-history-list">
      <div className="ind-detail-filters">
        <label htmlFor={`${id}-busca`}>
          Buscar história
          <span className="ind-search">
            <FiSearch aria-hidden="true" />
            <input
              id={`${id}-busca`}
              type="search"
              value={busca}
              placeholder="US, título, pessoa ou módulo"
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(0);
              }}
            />
          </span>
        </label>
        <label htmlFor={`${id}-sprint`}>
          Sprint
          <select
            id={`${id}-sprint`}
            value={sprint}
            onChange={(e) => {
              setSprint(e.target.value);
              setPagina(0);
            }}
          >
            <option value="">Todas</option>
            {[...new Set(historias.map((h) => h.sprint))]
              .sort((a, b) => a - b)
              .map((n) => (
                <option key={n}>{n}</option>
              ))}
          </select>
        </label>
        <label htmlFor={`${id}-status`}>
          Situação
          <select
            id={`${id}-status`}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPagina(0);
            }}
          >
            <option value="">Todas</option>
            {[...new Set(historias.map((h) => h.situacao))].sort().map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="ind-table-scroll">
        <table className="ind-table">
          <thead>
            <tr>
              <th>
                <button type="button" onClick={() => selecionarOrdem("codigo")}>
                  US ↕
                </button>
              </th>
              <th>Título / módulo</th>
              <th>
                <button type="button" onClick={() => selecionarOrdem("sprint")}>
                  Sprint ↕
                </button>
              </th>
              <th>Squad</th>
              <th>
                Analista /{" "}
                {pessoa ? "outros desenvolvedores" : "desenvolvedores"}
              </th>
              <th>
                <button type="button" onClick={() => selecionarOrdem("pontos")}>
                  Pontos ↕
                </button>
              </th>
              <th>Situação</th>
              <th>Redmine</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((h) => (
              <tr key={h.id}>
                <td>
                  <button
                    type="button"
                    className="ind-code"
                    onClick={() => onHistoria(h)}
                  >
                    {h.codigo}
                  </button>
                </td>
                <td>
                  <span className="ind-story-title">{h.titulo}</span>
                  <small>
                    {h.modulo ?? "Módulo não informado"}
                    {h.menu ? ` · ${h.menu}` : ""}
                  </small>
                </td>
                <td>{h.sprint}</td>
                <td>{h.squads.join(", ") || "—"}</td>
                <td>
                  <b>{h.analistas.join(", ") || "Não informado"}</b>
                  <small>
                    {h.desenvolvedores
                      .filter((nome) => nome !== pessoa)
                      .join(", ") ||
                      (pessoa
                        ? "Sem outro desenvolvedor associado"
                        : "Desenvolvedor não informado")}
                  </small>
                </td>
                <td>{h.pontos ?? "—"}</td>
                <td>
                  <StatusHistoria situacao={h.situacao} />
                </td>
                <td>
                  {h.redmine ? (
                    <a
                      className="ind-code"
                      href={h.redmine}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir ${h.codigo} no Redmine`}
                    >
                      Redmine ↗
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {!visiveis.length && (
              <tr>
                <td colSpan={8}>
                  <EstadoVazio titulo="Nenhuma história neste detalhamento">
                    Ajuste a busca ou os filtros internos. Métricas sem
                    evidência na fonte não geram registros artificiais.
                  </EstadoVazio>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="ind-table-pagination">
        <span>{filtradas.length} registros</span>
        <div>
          <button
            type="button"
            className="ind-icon-button"
            disabled={atual === 0}
            aria-label="Página anterior"
            onClick={() => setPagina(atual - 1)}
          >
            <FiChevronLeft />
          </button>
          <span>
            {atual + 1} / {totalPaginas}
          </span>
          <button
            type="button"
            className="ind-icon-button"
            disabled={atual === totalPaginas - 1}
            aria-label="Próxima página"
            onClick={() => setPagina(atual + 1)}
          >
            <FiChevronRight />
          </button>
          <label>
            Por página
            <select
              value={tamanho}
              onChange={(e) => {
                setTamanho(Number(e.target.value));
                setPagina(0);
              }}
            >
              {[15, 30, 60].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
