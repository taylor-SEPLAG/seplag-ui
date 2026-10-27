import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModalSeplag } from "../../componentes/Modal";
import { PaginacaoV2 } from "../vinculos/VinculoV2Page";
import {
  BASE_LICENCAS as BASE,
  carregarEventos,
  rotuloDuracao,
  NATUREZAS,
  filtrosVazios,
  filtrarEventos,
  type FiltrosLicencas,
  type EventoLicenca,
} from "./model";
import { Ambiente } from "./AmbienteLicencas";
import { camposHistorico } from "./HistoricoEvento";
import "./licencas.css";

function Situacao({ valor }: { valor: EventoLicenca["situacao"] }) {
  return (
    <span
      className={`v2v-status v2v-status-${valor.toLocaleLowerCase("pt-BR")}`}
    >
      {valor}
    </span>
  );
}

export function ParametrizacaoLicencasPage() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState(carregarEventos);
  const [expandidos, setExpandidos] = useState<Set<string>>(
    () => new Set(registros[0] ? [registros[0].id] : []),
  );
  const [filtros, setFiltros] = useState<FiltrosLicencas>({ ...filtrosVazios });
  const alterarFiltro = (campo: keyof FiltrosLicencas, valor: string) => {
    setFiltros((anteriores) => ({ ...anteriores, [campo]: valor }));
    setPagina(1);
  };
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [vinculos, setVinculos] = useState<EventoLicenca | null>(null);
  const [visualizacao, setVisualizacao] = useState<{
    evento: EventoLicenca;
    versao: number;
  } | null>(null);
  useEffect(() => {
    const atualizar = () => setRegistros(carregarEventos());
    const timer = window.setInterval(atualizar, 30000);
    window.addEventListener("focus", atualizar);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", atualizar);
    };
  }, []);
  const filtrados = filtrarEventos(registros, filtros);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const atual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((atual - 1) * porPagina, atual * porPagina);
  return (
    <Ambiente titulo="Parametrização de Ocorrências">
      <div className="pl-version-list">
        <p className="v2v-description">
          Gerencie os parâmetros de licenças, afastamentos e ausências
          aplicáveis aos servidores.
        </p>
        <section
          className="v2v-kpis pl-kpis"
          aria-label="Indicadores de ocorrências"
        >
          {[
            {
              label: "Total de Ocorrências Cadastradas",
              icone: "pi-list",
              cor: "total",
              valor: registros.length,
            },
            {
              label: "Licenças",
              icone: "pi-file",
              cor: "licenca",
              valor: registros.filter((e) => e.natureza === "Licença").length,
            },
            {
              label: "Afastamentos",
              icone: "pi-sign-out",
              cor: "afastamento",
              valor: registros.filter((e) => e.natureza === "Afastamento")
                .length,
            },
            {
              label: "Ausências",
              icone: "pi-calendar-minus",
              cor: "ausencia",
              valor: registros.filter((e) => e.natureza === "Ausência").length,
            },
          ].map((item) => (
            <article key={item.cor} className={`pl-kpi-${item.cor}`}>
              <i className={`pi ${item.icone}`} aria-hidden="true" />
              <div>
                <span>{item.label}</span>
                <strong>{item.valor}</strong>
              </div>
            </article>
          ))}
        </section>
        <section
          className="v2v-filters pl-filtros pl-version-filters"
          aria-label="Filtros de consulta"
        >
          <label>
            Código
            <input
              value={filtros.codigo ?? ""}
              onChange={(e) => alterarFiltro("codigo", e.target.value)}
              placeholder="Buscar por código"
            />
          </label>
          <label>
            Nome da Ocorrência
            <input
              value={filtros.nome ?? ""}
              onChange={(e) => alterarFiltro("nome", e.target.value)}
              placeholder="Buscar por nome"
            />
          </label>
          <label>
            Tipo
            <select
              value={filtros.natureza}
              onChange={(e) => alterarFiltro("natureza", e.target.value)}
            >
              <option value="">Todas</option>
              {NATUREZAS.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            Situação
            <select
              value={filtros.situacao}
              onChange={(e) => alterarFiltro("situacao", e.target.value)}
            >
              <option value="">Todas</option>
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </label>
          <button
            type="button"
            className="v2v-primary"
            onClick={() => {
              setFiltros({ ...filtrosVazios });
              setPagina(1);
            }}
          >
            <i className="pi pi-refresh" aria-hidden="true" /> Limpar filtro
          </button>
        </section>
        <div className="pl-version-toolbar">
          <button
            type="button"
            className="v2v-primary"
            onClick={() => navigate(`${BASE}/novo`)}
          >
            <i className="pi pi-plus" aria-hidden="true" /> Nova Parametrização
          </button>
        </div>
        <div className="pl-grid-scroll">
          <table
            className="v2v-table pl-table pl-version-table"
            aria-label="Ocorrências parametrizadas"
          >
            <thead>
              <tr>
                {["Código", "Ocorrência", "Tipo", "Situação", "Ação"].map(
                  (c) => (
                    <th scope="col" key={c}>
                      {c}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {visiveis.map((e) => {
                const aberto = expandidos.has(e.id);
                const publicacoes = [...(e.historico ?? [])].sort(
                  (a, b) => b.versao - a.versao,
                );
                const versoes = publicacoes.length
                  ? publicacoes.map((v, i) => ({
                      numero: v.versao,
                      dados: i === 0 ? e : v.dados,
                      atual: i === 0,
                    }))
                  : [{ numero: 1, dados: e, atual: true }];
                const primeira = publicacoes.at(-1);
                if (primeira?.anteriores && primeira.versao > 1)
                  versoes.push({
                    numero: Math.max(1, primeira.versao - 1),
                    dados: primeira.anteriores,
                    atual: false,
                  });
                return (
                  <Fragment key={e.id}>
                    <tr>
                      <td>{e.codigo}</td>
                      <td>
                        <span className="pl-nome">{e.nome}</span>
                        <small className="pl-descricao">{e.descricao}</small>
                      </td>
                      <td>
                        <span
                          className={`pl-tag pl-natureza-${NATUREZAS.indexOf(e.natureza)}`}
                        >
                          {e.natureza}
                        </span>
                      </td>
                      <td>
                        <Situacao valor={e.situacao} />
                      </td>
                      <td>
                        <button
                          className="pl-version-toggle"
                          type="button"
                          aria-label={`${aberto ? "Recolher" : "Expandir"} versões da ocorrência ${e.codigo}`}
                          aria-expanded={aberto}
                          aria-controls={`versoes-${e.id}`}
                          onClick={() =>
                            setExpandidos((anteriores) => {
                              const novos = new Set(anteriores);
                              if (novos.has(e.id)) novos.delete(e.id);
                              else novos.add(e.id);
                              return novos;
                            })
                          }
                        >
                          <i
                            className={`pi pi-chevron-${aberto ? "up" : "down"}`}
                            aria-hidden="true"
                          />
                        </button>
                      </td>
                    </tr>
                    {aberto && (
                      <tr
                        className="pl-version-expanded"
                        id={`versoes-${e.id}`}
                      >
                        <td colSpan={5}>
                          <section
                            className="pl-version-panel"
                            aria-label={`Versões da ocorrência ${e.codigo}`}
                          >
                            <h3>
                              <i className="pi pi-history" aria-hidden="true" />{" "}
                              Histórico de Versões Cadastradas
                            </h3>
                            <table
                              className="v2v-table pl-history-table"
                              aria-label={`Histórico de versões de ${e.nome}`}
                            >
                              <thead>
                                <tr>
                                  {[
                                    "Versão",
                                    "Data de vigência",
                                    "Prazo máximo",
                                    "Vínculos autorizados",
                                    "Situação",
                                    "Ações",
                                  ].map((c) => (
                                    <th scope="col" key={c}>
                                      {c}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {versoes.map((v, i) => (
                                  <tr key={i}>
                                    <td>
                                      <strong>{`v${v.numero}${v.atual ? " (Atual)" : ""}`}</strong>
                                    </td>
                                    <td>
                                      {v.dados.configuracao?.inicioVigencia?.replace(
                                        /^(\d{4})-(\d{2})-(\d{2})$/,
                                        "$3/$2/$1",
                                      ) || "Não informada"}
                                    </td>
                                    <td>{rotuloDuracao(v.dados)}</td>
                                    <td>
                                      <button
                                        type="button"
                                        className="pl-vinculos-link"
                                        onClick={() => setVinculos(v.dados)}
                                      >
                                        {v.dados.vinculos.length}{" "}
                                        {v.dados.vinculos.length === 1
                                          ? "Vínculo"
                                          : "Vínculos"}
                                      </button>
                                    </td>
                                    <td>
                                      <Situacao
                                        valor={v.atual ? e.situacao : "Inativo"}
                                      />
                                    </td>
                                    <td>
                                      <div className="pl-version-actions">
                                        <button
                                          type="button"
                                          title="Visualizar versão"
                                          aria-label={`Visualizar versão ${v.numero} da ocorrência ${e.codigo}`}
                                          onClick={() =>
                                            setVisualizacao({
                                              evento: v.dados,
                                              versao: v.numero,
                                            })
                                          }
                                        >
                                          <i
                                            className="pi pi-eye"
                                            aria-hidden="true"
                                          />
                                        </button>
                                        {v.atual && (
                                          <button
                                            type="button"
                                            title="Editar versão atual"
                                            aria-label={`Editar ocorrência ${e.codigo}`}
                                            onClick={() =>
                                              navigate(`${BASE}/${e.id}/editar`)
                                            }
                                          >
                                            <i
                                              className="pi pi-pencil"
                                              aria-hidden="true"
                                            />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </section>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {!visiveis.length && (
                <tr>
                  <td colSpan={5} className="v2v-empty">
                    Nenhum registro encontrado para os filtros informados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginacaoV2
          nome="ocorrências"
          pagina={atual}
          totalPaginas={totalPaginas}
          porPagina={porPagina}
          mudarPagina={setPagina}
          mudarPorPagina={(q) => {
            setPorPagina(q);
            setPagina(1);
          }}
        />
      </div>
      <ModalSeplag
        visible={Boolean(vinculos)}
        titulo={`Tipos de vínculo autorizados (${vinculos?.vinculos.length ?? 0})`}
        fechar={() => setVinculos(null)}
        hideFooter
        tamanho="620px"
      >
        <div className="prototype-carreira-org-list prototype-tipo-vinculo-regimes-list">
          <p>
            <strong>Código {vinculos?.codigo}</strong> — {vinculos?.nome}
          </p>
          <ul>
            {vinculos?.vinculos.map((v, i) => (
              <li key={v}>
                <i className="pi pi-book" aria-hidden="true" />
                <strong>{i + 1}.</strong> <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </ModalSeplag>
      <ModalSeplag
        visible={Boolean(visualizacao)}
        titulo={`Visualizar versão v${visualizacao?.versao ?? ""}`}
        fechar={() => setVisualizacao(null)}
        hideFooter
        tamanho="min(94vw, 760px)"
      >
        {visualizacao && (
          <div className="pl-version-details">
            <h3>{visualizacao.evento.nome}</h3>
            {Object.entries(camposHistorico(visualizacao.evento)).map(
              ([grupo, campos]) => (
                <section key={grupo}>
                  <h4>{grupo}</h4>
                  <dl>
                    {Object.entries(campos).map(([campo, valor]) => (
                      <div key={campo}>
                        <dt>{campo}</dt>
                        <dd>{valor || "Não informado"}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ),
            )}
          </div>
        )}
      </ModalSeplag>
    </Ambiente>
  );
}
