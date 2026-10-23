import { coresCategorias as cores } from './dashboardTema';
import { useState, type ReactNode } from "react";
import "./carreiraCargoAnalises.css";
import { Link } from "react-router-dom";
import { ModalSeplag } from "../../componentes/Modal";
import { PaginacaoV2, type Vinculo } from "./VinculoV2Page";
import { situacaoDoVinculo } from "./vinculosConsulta";
import {
  agruparAnalise,
  cargoEspecialidade,
  composicaoPorCargo,
  dadosAnalise,
  naoInformado,
  type FiltrosAnalise,
} from "./dashboardAbasModel";
type Grupo = ReturnType<typeof agruparAnalise>[number];
type Abrir = (titulo: string, itens: Vinculo[]) => void;
const pct = (n: number, total: number) =>
  `${(total ? (n / total) * 100 : 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
export function CarreiraCargoAnalises({
  registros,
  filtros,
  alterar,
  comparativo,
}: {
  registros: Vinculo[];
  filtros: FiltrosAnalise;
  alterar: (f: FiltrosAnalise) => void;
  comparativo: (titulo: string, grupos: Grupo[], abrir: Abrir) => ReactNode;
}) {
  const [modal, setModal] = useState<{
    titulo: string;
    grupos?: Grupo[];
    itens?: Vinculo[];
  } | null>(null);
  const [pagina, setPagina] = useState(1),
    [porPagina, setPorPagina] = useState(10);
  const abrir: Abrir = (titulo, itens) => {
    setPagina(1);
    setModal({ titulo, itens });
  };
  const abrirRanking = (titulo: string, grupos: Grupo[]) => {
    setPagina(1);
    setModal({ titulo, grupos });
  };
  const dados = dadosAnalise(registros, "cargo", filtros);
  const carreiras = agruparAnalise(dados, (v) => naoInformado(v.carreira)),
    cargos = agruparAnalise(dados, cargoEspecialidade);
  const opcoesCarreira = [
    ...new Set(registros.map((v) => naoInformado(v.carreira))),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const opcoesCargo = [
    ...new Set(
      registros
        .filter(
          (v) =>
            !filtros.carreira || naoInformado(v.carreira) === filtros.carreira,
        )
        .map(cargoEspecialidade),
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const limite = filtros.limite === "todos" ? Infinity : Number(filtros.limite);
  const rankLimite = Math.min(10, Number.isFinite(limite) ? limite : 5);
  function mudarCarreira(carreira: string) {
    const opcoes = registros.filter(
      (v) => !carreira || naoInformado(v.carreira) === carreira,
    );
    alterar({
      ...filtros,
      carreira,
      busca: opcoes.some(
        (v) =>
          cargoEspecialidade(v) === filtros.busca ||
          naoInformado(v.cargo) === filtros.busca,
      )
        ? filtros.busca
        : "",
      composicaoCargo: "",
    });
  }
  function ranking(titulo: string, grupos: Grupo[]) {
    const maxRanking = Math.max(1, ...grupos.map(g => g.total));
    return (
      <section className="v2v-panel da-card cc-ranking">
        <h2>{titulo}</h2>
        <div className="cc-rank-legend" aria-label="Legenda da situação dos vínculos">
          <span><i className="cc-rank-vigentes" aria-hidden="true" />Ativos</span>
          <span><i className="cc-rank-encerrados" aria-hidden="true" />Encerrados</span>
        </div>
        <div className="cc-ranking-body">
          {grupos.slice(0, rankLimite).map((g, i) => (
            <button
              type="button"
              className="cc-rank-row"
              key={g.nome}
              title={`${g.nome}: ${g.total} vínculos (${pct(g.total, dados.length)}) — ${g.vigentes} ativos e ${g.encerrados} encerrados`}
              onClick={() => abrir(g.nome, g.itens)}
            >
              <span className="cc-rank-position">{i + 1}</span>
              <span className="cc-rank-info">
                <span>
                  {g.nome}
                  <strong>
                    {g.total} · {pct(g.total, dados.length)}
                  </strong>
                </span>
                <span className="cc-rank-track" aria-hidden="true">
                  <span
                    className="cc-rank-vigentes"
                    style={{
                      width: `${(g.vigentes / maxRanking) * 100}%`,
                    }}
                  />
                  <span className="cc-rank-encerrados" style={{ width: `${(g.encerrados / maxRanking) * 100}%` }} />
                </span>
                <small className="cc-rank-counts">{g.vigentes} ativos · {g.encerrados} encerrados</small>
              </span>
            </button>
          ))}
          {!grupos.length && <p role="status">Nenhum vínculo encontrado.</p>}
        </div>
        <footer>
          <button
            type="button"
            className="v2v-link"
            onClick={() => abrirRanking(titulo, grupos)}
          >
            Ver todos<span className="sr-only"> — {titulo}</span>
            <i className="pi pi-arrow-right" aria-hidden="true" />
          </button>
        </footer>
      </section>
    );
  }
  const tipos = [...new Set(dados.map((v) => v.tipo))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const gruposComposicao = composicaoPorCargo(dados, filtros);
  const maxComposicao = Math.max(1, ...gruposComposicao.map((g) => g.total));
  const totalModal = modal?.grupos?.length ?? modal?.itens?.length ?? 0;
  const totalPaginas = Math.max(1, Math.ceil(totalModal / porPagina)),
    atual = Math.min(pagina, totalPaginas);
  const inicio = (atual - 1) * porPagina;
  return (
    <div className="cc-analises">
      <section
        className="v2v-panel da-filters cc-filters"
        aria-label="Filtros específicos da análise"
      >
        <label>
          Carreira
          <select
            value={filtros.carreira}
            onChange={(e) => mudarCarreira(e.target.value)}
          >
            <option value="">Todas</option>
            {opcoesCarreira.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Cargo/Especialidade
          <select
            value={filtros.busca}
            onChange={(e) =>
              alterar({
                ...filtros,
                busca: e.target.value,
                composicaoCargo: "",
              })
            }
          >
            <option value="">Todos</option>
            {filtros.busca && !opcoesCargo.includes(filtros.busca) && (
              <option value={filtros.busca}>{filtros.busca}</option>
            )}
            {opcoesCargo.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Quantidade de resultados
          <select
            value={filtros.limite}
            onChange={(e) => alterar({ ...filtros, limite: e.target.value })}
          >
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
            <option value="todos">Todos</option>
          </select>
        </label>
      </section>
      <section aria-labelledby="cc-carreira">
        <h2 className="cc-section-title" id="cc-carreira">
          <i className="pi pi-sitemap" aria-hidden="true" />
          Análise por Carreira
        </h2>
        <div className="cc-pair">
          {comparativo(
            "Ativos x Encerrados por Carreira",
            carreiras.slice(0, limite),
            abrir,
          )}
          {ranking("Ranking de Carreiras", carreiras)}
        </div>
      </section>
      <section aria-labelledby="cc-cargo">
        <h2 className="cc-section-title" id="cc-cargo">
          <i className="pi pi-briefcase" aria-hidden="true" />
          Análise por Cargo/Especialidade
        </h2>
        <div className="cc-pair">
          {comparativo(
            "Ativos x Encerrados por Cargo/Especialidade",
            cargos.slice(0, limite),
            abrir,
          )}
          {ranking("Ranking de Cargos/Especialidades", cargos)}
        </div>
      </section>
      <section
        className="v2v-panel da-card cc-composition"
        aria-labelledby="cc-composition"
      >
        <header>
          <h2 className="cc-section-title" id="cc-composition">
            <i className="pi pi-chart-bar" aria-hidden="true" />
            Composição dos Vínculos por Cargo
          </h2>
          <div className="cc-composition-filters">
            <label>
              Cargo/Especialidade da composição
              <select
                value={filtros.composicaoCargo ?? ""}
                onChange={(e) =>
                  alterar({ ...filtros, composicaoCargo: e.target.value })
                }
              >
                <option value="">Todos</option>
                {cargos.map((c) => (
                  <option key={c.nome}>{c.nome}</option>
                ))}
              </select>
            </label>
            <label>
              Cargos mais representativos
              <select
                value={filtros.composicaoLimite ?? "5"}
                onChange={(e) =>
                  alterar({ ...filtros, composicaoLimite: e.target.value })
                }
              >
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
              </select>
            </label>
          </div>
        </header>
        {tipos.length > 6 && (
          <details className="cc-type-selection">
            <summary>Tipos de vínculo para comparação</summary>
            <div>
              {tipos.map((t) => (
                <label key={t}>
                  <input
                    type="checkbox"
                    checked={
                      !filtros.tiposComposicao ||
                      filtros.tiposComposicao.includes(t)
                    }
                    onChange={(e) => {
                      const atual = filtros.tiposComposicao ?? tipos;
                      alterar({
                        ...filtros,
                        tiposComposicao: e.target.checked
                          ? [...atual, t]
                          : atual.filter((v) => v !== t),
                      });
                    }}
                  />
                  {t}
                </label>
              ))}
            </div>
            <button
              type="button"
              className="v2v-link"
              onClick={() =>
                alterar({ ...filtros, tiposComposicao: undefined })
              }
            >
              Selecionar todos
            </button>
          </details>
        )}
        <div className="cc-composition-legend">
          {tipos
            .filter(
              (t) =>
                gruposComposicao.some(g=>g.itens.some(v=>v.tipo===t)),
            )
            .map((t) => (
              <span key={t}>
                <i
                  style={{ background: cores[tipos.indexOf(t) % cores.length] }}
                />
                {t}
              </span>
            ))}
        </div>
        {gruposComposicao.map((g) => (
          <div key={g.nome} className="cc-composition-row">
            <span title={g.nome}>{g.nome}</span>
            <div
              className="cc-composition-bar"
              role="group"
              aria-label={`${g.nome}: ${g.total} vínculos`}
            >
              {tipos.map((t) => {
                const itens = g.itens.filter((v) => v.tipo === t);
                if (!itens.length) return null;
                return (
                  <button
                    type="button"
                    key={t}
                    style={{
                      width: `${(itens.length / maxComposicao) * 100}%`,
                      background: cores[tipos.indexOf(t) % cores.length],
                    }}
                    title={`${g.nome} · ${t}: ${itens.length} (${pct(itens.length, g.total)}) · Total: ${g.total}`}
                    aria-label={`${g.nome}, ${t}: ${itens.length} vínculos`}
                    onClick={() => abrir(`${g.nome} · ${t}`, itens)}
                  >
                    <span>{itens.length}</span>
                  </button>
                );
              })}
            </div>
            <strong>{g.total}</strong>
          </div>
        ))}
        {!gruposComposicao.length && (
          <p role="status">
            Nenhum vínculo encontrado para os filtros informados.
          </p>
        )}
      </section>
      <ModalSeplag
        visible={!!modal}
        titulo={modal?.titulo ?? "Consulta"}
        fechar={() => setModal(null)}
        hideFooter
        tamanho="1000px"
      >
        {modal && (
          <>
            <p>
              {totalModal} {modal.grupos ? "resultado(s)" : "vínculo(s)"}{" "}
              encontrado(s)
            </p>
            <div className="v2v-table-wrap">
              <table className="v2v-table">
                <thead>
                  <tr>
                    {(modal.grupos
                      ? [
                          "Posição",
                          "Nome",
                          "Ativos",
                          "Encerrados",
                          "Total",
                          "Participação",
                          "Ação",
                        ]
                      : [
                          "Servidor",
                          "Matrícula/Vínculo",
                          "Tipo",
                          "Órgão",
                          "Cargo/Especialidade",
                          "Situação",
                          "Ação",
                        ]
                    ).map((t) => (
                      <th key={t}>{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modal.grupos
                    ? modal.grupos
                        .slice(inicio, inicio + porPagina)
                        .map((g, i) => (
                          <tr key={g.nome}>
                            <td>{inicio + i + 1}</td>
                            <td>{g.nome}</td>
                            <td>{g.vigentes}</td>
                            <td>{g.encerrados}</td>
                            <td>{g.total}</td>
                            <td>{pct(g.total, dados.length)}</td>
                            <td>
                              <button
                                type="button"
                                className="v2v-link"
                                onClick={() => abrir(g.nome, g.itens)}
                              >
                                Consultar vínculos
                              </button>
                            </td>
                          </tr>
                        ))
                    : modal.itens
                        ?.slice(inicio, inicio + porPagina)
                        .map((v) => (
                          <tr key={v.id}>
                            <td>{v.nome}</td>
                            <td>
                              {v.matricula} / {v.numero}
                            </td>
                            <td>{v.tipo}</td>
                            <td>{naoInformado(v.orgao)}</td>
                            <td>{cargoEspecialidade(v)}</td>
                            <td>
                              {situacaoDoVinculo(v) === "Ativo"
                                ? "Ativo"
                                : "Encerrado"}
                            </td>
                            <td>
                              <Link
                                to={`/prototipos/sigep/vinculos-v2/${v.id}`}
                              >
                                Consultar
                              </Link>
                            </td>
                          </tr>
                        ))}
                </tbody>
              </table>
            </div>
            <PaginacaoV2
              nome="consulta da análise"
              pagina={atual}
              totalPaginas={totalPaginas}
              porPagina={porPagina}
              mudarPagina={setPagina}
              mudarPorPagina={(n) => {
                setPorPagina(n);
                setPagina(1);
              }}
            />
          </>
        )}
      </ModalSeplag>
    </div>
  );
}
