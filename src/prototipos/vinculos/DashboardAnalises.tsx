import { corSexo, coresDashboard } from './dashboardTema';
import { TiposVinculoPorSexo } from './TiposVinculoPorSexo';
import { useState } from "react";
import { Link } from "react-router-dom";
import { ModalSeplag } from "../../componentes/Modal";
import type { Vinculo } from "./VinculoV2Page";
import { situacaoDoVinculo } from "./vinculosConsulta";
import { GraficoTiposOrgaoColunas } from "./GraficoTiposOrgaoColunas";
import { CarreiraCargoAnalises } from "./CarreiraCargoAnalises";
import {
  agruparAnalise,
  cargoEspecialidade,
  dadosAnalise,
  gruposAnalise,
  naoInformado,
  sexoVinculo,
  type AbaDashboard,
  type FiltrosAnalise,
} from "./dashboardAbasModel";
type Grupo = ReturnType<typeof agruparAnalise>[number];
const percentual = (n: number, total: number) =>
  `${(total ? (n / total) * 100 : 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
function Comparativo({
  titulo,
  grupos,
  abrir,
}: {
  titulo: string;
  grupos: Grupo[];
  abrir: (titulo: string, itens: Vinculo[]) => void;
}) {
  const semEscolaridade = titulo === "Grau de Escolaridade" && grupos.length > 0 && grupos.every(g => g.nome === "Não informado");
  const max = Math.max(1, ...grupos.flatMap((g) => [g.vigentes, g.encerrados]));
  return (
    <section className="v2v-panel da-card">
      <h2>{titulo}</h2>
      {semEscolaridade && <p className="dv-info">Os vínculos apresentados não possuem informação de escolaridade disponível no cadastro.</p>}
      <div className="dv-chart-legend">
        <span>
          <i className="da-key-vigente" />
          Ativos
        </span>
        <span>
          <i className="da-key-encerrado" />
          Encerrados
        </span>
      </div>
      <div className="da-rows">
        {grupos.map((g) => (
          <div className="da-row" key={g.nome}>
            <button
              type="button"
              className="da-row-name"
              onClick={() => abrir(g.nome, g.itens)}
            >
              {g.nome}
              <small>Total: {g.total}</small>
            </button>
            <div className="da-bars">
              {[
                {
                  label: "Ativos",
                  n: g.vigentes,
                  classe: "da-vigente",
                  status: "Ativo",
                },
                {
                  label: "Encerrados",
                  n: g.encerrados,
                  classe: "da-encerrado",
                  status: "Encerrado",
                },
              ].map((s) => (
                <button
                  type="button"
                  key={s.status}
                  onClick={() =>
                    abrir(
                      `${g.nome} · ${s.label}`,
                      g.itens.filter((v) => situacaoDoVinculo(v) === s.status),
                    )
                  }
                  aria-label={`${g.nome}: ${s.n} ${s.label.toLowerCase()}`}
                  title={`${g.nome} · ${s.label}: ${s.n} (${percentual(s.n, g.total)}) · Ativos: ${g.vigentes} · Encerrados: ${g.encerrados} · Total: ${g.total}`}
                >
                  <span
                    className={s.classe}
                    style={{ width: `${(s.n / max) * 100}%` }}
                  />
                  <strong>{s.n}</strong>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!grupos.length && (
        <p role="status">
          Nenhum vínculo encontrado para os filtros informados.
        </p>
      )}
    </section>
  );
}
function Ranking({
  titulo,
  grupos,
  total,
  abrir,
}: {
  titulo: string;
  grupos: Grupo[];
  total: number;
  abrir: (titulo: string, itens: Vinculo[]) => void;
}) {
  const maxRanking = Math.max(1, ...grupos.map(g => g.total));
  return (
    <section className="v2v-panel da-card">
      <h2>{titulo}</h2>
      <div className="dv-chart-legend">
        <span>
          <i className="da-key-vigente" />
          Ativos
        </span>
        <span>
          <i className="da-key-encerrado" />
          Encerrados
        </span>
      </div>
      {grupos.map((g) => (
        <button
          className="da-ranking"
          type="button"
          key={g.nome}
          onClick={() => abrir(g.nome, g.itens)}
          title={`${g.nome}: ${g.total} (${percentual(g.total, total)}) · Ativos: ${g.vigentes} · Encerrados: ${g.encerrados}`}
        >
          <span>
            {g.nome}
            <strong>
              {g.total} · {percentual(g.total, total)}
            </strong>
          </span>
          <span className="dv-track da-ranking-track">
            <span
              className="da-vigente"
              style={{ width: `${(g.vigentes / maxRanking) * 100}%` }}
            />
            <span
              className="da-encerrado"
              style={{ width: `${(g.encerrados / maxRanking) * 100}%` }}
            />
          </span>
          <span className="da-ranking-counts">
            <span>Ativos: {g.vigentes}</span>
            <span>Encerrados: {g.encerrados}</span>
          </span>
        </button>
      ))}
      {!grupos.length && <p role="status">Nenhum vínculo encontrado.</p>}
    </section>
  );
}
export function DashboardAnalises({
  aba,
  registros,
  filtros,
  alterar,
}: {
  aba: Exclude<AbaDashboard, "geral">;
  registros: Vinculo[];
  filtros: FiltrosAnalise;
  alterar: (f: FiltrosAnalise) => void;
}) {
  const [consulta, setConsulta] = useState<{
    titulo: string;
    itens: Vinculo[];
  } | null>(null);
  const abrir = (titulo: string, itens: Vinculo[]) =>
    setConsulta({ titulo, itens });
  if (aba === "cargo")
    return (
      <CarreiraCargoAnalises
        registros={registros}
        filtros={filtros}
        alterar={alterar}
        comparativo={(titulo, grupos, abrir) => (
          <Comparativo titulo={titulo} grupos={grupos} abrir={abrir} />
        )}
      />
    );
  const dados = dadosAnalise(registros, aba, filtros),
    grupos = gruposAnalise(dados, aba);
  const limite = filtros.limite === "todos" ? Infinity : Number(filtros.limite);
  const carreiras = [
    ...new Set(registros.map((v) => naoInformado(v.carreira))),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const opcoesCargo = [
    ...new Set(registros.map((v) => naoInformado(v.cargo))),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const set = (campo: keyof FiltrosAnalise, valor: string | boolean) =>
    alterar({ ...filtros, [campo]: valor });
  const cargos = agruparAnalise(
    dados.filter(
      (v) => !filtros.busca || naoInformado(v.cargo) === filtros.busca,
    ),
    cargoEspecialidade,
  );
  const sexos = agruparAnalise(dados, sexoVinculo);
  let offset = 0;
  return (
    <>
      {aba === "carreira" && (
        <section
          className="v2v-panel da-filters"
          aria-label="Filtros específicos da análise"
        >
          <label>
            Cargo
            <select
              value={filtros.busca}
              onChange={(e) => set("busca", e.target.value)}
            >
              <option value="">Todos</option>
              {opcoesCargo.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            Selecionar Carreira
            <select
              value={filtros.carreira}
              onChange={(e) => set("carreira", e.target.value)}
            >
              <option value="">Todas</option>
              {carreiras.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Quantidade de resultados
            <select
              value={filtros.limite}
              onChange={(e) => set("limite", e.target.value)}
            >
              <option value="5">Top 5</option>
              <option value="10">Top 10</option>
              <option value="todos">Todos</option>
            </select>
          </label>
        </section>
      )}
      {aba === "perfil" ? (
        <div className="da-grid da-profile">
          <section className="v2v-panel da-card">
            <h2>Distribuição por Sexo</h2>
            <div className="dv-donut">
              <svg
                viewBox="0 0 200 200"
                role="group"
                aria-label="Distribuição de vínculos por sexo"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="76"
                  fill="none"
                  stroke={coresDashboard.trilha}
                  strokeWidth="20"
                />
                {sexos.map((g) => {
                  const parte = (g.total / Math.max(1, dados.length)) * 100;
                  const deslocamento = offset;
                  offset += parte;
                  return (
                    <g
                      key={g.nome}
                      role="button"
                      tabIndex={0}
                      aria-label={`${g.nome}: ${g.total} vínculos`}
                      onClick={() => abrir(`Sexo: ${g.nome}`, g.itens)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          abrir(`Sexo: ${g.nome}`, g.itens);
                        }
                      }}
                    >
                      <title>
                        {g.nome}: {g.total} ({percentual(g.total, dados.length)}
                        )
                      </title>
                      <circle
                        cx="100"
                        cy="100"
                        r="76"
                        fill="none"
                        stroke={corSexo(g.nome)}
                        strokeWidth="20"
                        pathLength="100"
                        strokeDasharray={`${parte} 100`}
                        strokeDashoffset={-deslocamento}
                        transform="rotate(-90 100 100)"
                      />
                    </g>
                  );
                })}
              </svg>
              <div>
                <strong>{dados.length}</strong>
                <span>Total de vínculos</span>
              </div>
            </div>
            {sexos.map((g) => (
              <button
                type="button"
                className="da-profile-key"
                key={g.nome}
                onClick={() => abrir(`Sexo: ${g.nome}`, g.itens)}
              >
                <i
                  style={{ background: corSexo(g.nome) }}
                />
                {g.nome === 'Não informado' && sexos.length === 1 ? `${g.nome} — 100%` : g.nome}
                <strong>
                  {g.nome === 'Não informado' && sexos.length === 1 ? g.total : `${g.total} · ${percentual(g.total, dados.length)}`}
                </strong>
              </button>
            ))}
            {!sexos.length && <p role="status">Nenhum vínculo encontrado.</p>}
          </section>
          <TiposVinculoPorSexo registros={dados} abrir={abrir} />
          <div className="da-profile-schooling">
            <Comparativo titulo="Grau de Escolaridade" grupos={grupos} abrir={abrir} />
          </div>
        </div>
      ) : (
        <div className="da-grid">
          <Comparativo
            titulo={`Ativos x Encerrados por ${aba === "orgao" ? "Órgão" : "Carreira"}`}
            grupos={grupos.slice(
              0,
              aba === "orgao" ? (filtros.todosOrgaos ? Infinity : 10) : limite,
            )}
            abrir={abrir}
          />
          <Ranking
            titulo={
              aba === "orgao"
                ? "Ranking dos Órgãos"
                : "Distribuição de Cargos por Carreira"
            }
            grupos={(aba === "carreira" ? cargos : grupos).slice(
              0,
              aba === "orgao" ? 5 : limite,
            )}
            total={dados.length}
            abrir={abrir}
          />
        </div>
      )}
      {aba === "orgao" && (
        <section
          className="da-orgao-tipos"
          aria-label="Análise por tipo de vínculo e órgão"
        >
          <div className="v2v-panel da-orgao-type-filter">
            <label>
              Selecione o órgão
              <select
                value={filtros.orgaoTipo ?? ""}
                onChange={(e) => set("orgaoTipo", e.target.value)}
              >
                <option value="">Todos os órgãos</option>
                {[...new Set(dados.map((v) => naoInformado(v.orgao)))]
                  .sort((a, b) => a.localeCompare(b, "pt-BR"))
                  .map((o) => (
                    <option key={o}>{o}</option>
                  ))}
              </select>
            </label>
          </div>
          <GraficoTiposOrgaoColunas
            registros={dados}
            orgao={filtros.orgaoTipo}
            abrir={abrir}
          />
        </section>
      )}
      <ModalSeplag
        visible={!!consulta}
        titulo={consulta?.titulo ?? "Vínculos"}
        fechar={() => setConsulta(null)}
        hideFooter
        tamanho="1000px"
      >
        {consulta && (
          <>
            <p>{consulta.itens.length} vínculo(s) encontrado(s)</p>
            <div className="v2v-table-wrap">
              <table className="v2v-table">
                <thead>
                  <tr>
                    {[
                      "Servidor",
                      "Matrícula/Vínculo",
                      "Tipo",
                      "Órgão",
                      "Cargo/Especialidade",
                      "Situação",
                      "Ação",
                    ].map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {consulta.itens.map((v) => (
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
                        <Link to={`/prototipos/sigep/vinculos-v2/${v.id}`}>
                          Consultar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </ModalSeplag>
    </>
  );
}
