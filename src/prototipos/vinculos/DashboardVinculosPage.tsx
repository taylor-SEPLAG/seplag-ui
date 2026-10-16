import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";

import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { TIPOS, todos } from "./VinculoV2Page";
import { exportarDashboardVinculos } from "./exportarDashboardVinculos";
import { resumoVinculos } from "./dashboardVinculosModel";
import {
  filtrarVinculos,
  filtrosVinculosVazios,
  FORMAS_VACANCIA,
  urlConsultaVinculos,
  type FiltrosVinculos,
} from "./vinculosConsulta";
import "./vinculoV2.css";
import "./dashboardVinculos.css";

const numero = (valor: number) => valor.toLocaleString("pt-BR");
const percentual = (parte: number, total: number) =>
  `${(total ? (parte / total) * 100 : 0).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
const VERDE = "#10B981";
const CINZA = "#64748B";

function linhasRotulo(texto: string) {
  const linhas = [""];
  texto.split(" ").forEach((palavra) => {
    const ultima = linhas.length - 1;
    if (`${linhas[ultima]} ${palavra}`.trim().length > 17 && linhas[ultima])
      linhas.push(palavra);
    else linhas[ultima] = `${linhas[ultima]} ${palavra}`.trim();
  });
  return linhas;
}

export function DashboardVinculosPage() {
  const [registros, setRegistros] = useState(todos);
  const [filtros, setFiltros] = useState<FiltrosVinculos>(
    filtrosVinculosVazios,
  );
  const [exportando, setExportando] = useState(false);
  const [erroExportacao, setErroExportacao] = useState("");
  const [atualizado, setAtualizado] = useState(() => new Date());
  const atualizar = () => { setRegistros(todos()); setAtualizado(new Date()); };
  useEffect(() => {

    window.addEventListener("focus", atualizar);
    window.addEventListener("storage", atualizar);
    window.addEventListener("sigep:vinculos:atualizados", atualizar);
    return () => {
      window.removeEventListener("focus", atualizar);
      window.removeEventListener("storage", atualizar);
      window.removeEventListener("sigep:vinculos:atualizados", atualizar);
    };
  }, []);
  const tipos = [
    ...new Set<string>([...TIPOS, ...registros.map((v) => v.tipo)]),
  ];
  const orgaos = [
    ...new Set(registros.map((v) => v.orgao).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const tiposContexto = filtros.tipo
    ? tipos.filter((tipo) => tipo === filtros.tipo)
    : tipos;
  const resumo = resumoVinculos(
    filtrarVinculos(registros, filtros),
    tiposContexto,
  );
  const exportar = async () => {
    setExportando(true); setErroExportacao("");
    try { await exportarDashboardVinculos(registros, filtros, tiposContexto); }
    catch { setErroExportacao("Não foi possível exportar o Excel. Tente novamente."); }
    finally { setExportando(false); }
  };
  const invalido =
    Boolean(filtros.inicio && filtros.fim && filtros.inicio > filtros.fim);
  const atualizarFiltro = (campo: keyof FiltrosVinculos, valor: string) => {
    setRegistros(todos());
    setFiltros((atual) => ({
      ...atual,
      [campo]: valor,
      ...(campo === "situacao" && valor !== "Encerrado"
        ? { forma: "", inicio: "", fim: "" }
        : {}),
    }));
  };
  const consulta = (
    tipo = filtros.tipo,
    situacao = filtros.situacao,
    forma = filtros.forma,
  ) =>
    urlConsultaVinculos({
      ...filtros,
      tipo,
      situacao,
      forma: situacao === "Encerrado" ? forma : "",
      inicio: filtros.inicio,
      fim: filtros.fim,
    });
  const maximo = Math.max(
    1,
    ...resumo.linhas.flatMap((linha) => [linha.vigentes, linha.encerrados]),
  );
  const escala = Math.max(1, Math.ceil(maximo / 5));
  const teto = escala * 5;
  const larguraGrafico = Math.max(780, resumo.linhas.length * 110 + 60);
  const passo = (larguraGrafico - 60) / Math.max(1, resumo.linhas.length);
  const fracaoVigentes = resumo.total ? resumo.vigentes / resumo.total : 0;

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <main className="dv-shell">
        <div className="dv-frame">
          <BreadcrumbSeplag divided homeTo="/prototipos/sigep" items={[
            { label: "Vínculos Funcionais", to: "/prototipos/sigep/vinculos-funcionais" },
            { label: "Dashboard" },
          ]} />
          <div className="v2v-page dv-page">
            <header className="dv-heading">
              <div>
                <h1>Dashboard de Vínculos</h1>
                <p>Acompanhe a quantidade de pessoas com vínculo vigente e encerrado por Tipo de Vínculo.</p>
              </div>
              <div className="dv-update">
                <small>Última atualização: {atualizado.toLocaleString("pt-BR", { timeZone: "America/Cuiaba" })}</small>
                <div className="dv-update-actions">
                  <button type="button" onClick={atualizar}><i className="pi pi-refresh" aria-hidden="true" />Atualizar dados</button>
                  <button type="button" className="dv-export-excel" disabled={exportando} aria-busy={exportando} onClick={exportar}><i className="pi pi-download" aria-hidden="true" />{exportando ? "Exportando..." : "Exportar Excel"}</button>
                </div>
              </div>
            </header>
            {erroExportacao && <p role="alert">{erroExportacao}</p>}
            <section
              className="v2v-panel v2v-filters dv-filters"
              aria-label="Filtros do dashboard"
            >
              <label>
                Tipo de Vínculo
                <select
                  value={filtros.tipo}
                  onChange={(e) => atualizarFiltro("tipo", e.target.value)}
                >
                  <option value="">Todos</option>
                  {tipos.map((tipo) => (
                    <option key={tipo}>{tipo}</option>
                  ))}
                </select>
              </label>
              <label>
                Órgão/Entidade
                <select
                  value={filtros.orgao}
                  onChange={(e) => atualizarFiltro("orgao", e.target.value)}
                >
                  <option value="">Todos</option>
                  {orgaos.map((orgao) => (
                    <option key={orgao}>{orgao}</option>
                  ))}
                </select>
              </label>
              <label>
                Situação
                <select
                  value={filtros.situacao}
                  onChange={(e) => atualizarFiltro("situacao", e.target.value)}
                >
                  <option value="">Todas</option>
                  <option>Vigente</option>
                  <option>Encerrado</option>
                </select>
              </label>
              {filtros.situacao === "Encerrado" && (
                <>
                  <label>
                    Forma de Vacância
                    <select
                      value={filtros.forma}
                      onChange={(e) => atualizarFiltro("forma", e.target.value)}
                    >
                      <option value="">Todas</option>
                      {FORMAS_VACANCIA.map((forma) => (
                        <option key={forma}>{forma}</option>
                      ))}
                    </select>
                  </label>
                </>
              )}
                  <label>
                    Período inicial
                    <input
                      type="date"
                      value={filtros.inicio}
                      onChange={(e) =>
                        atualizarFiltro("inicio", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Período final
                    <input
                      type="date"
                      min={filtros.inicio || undefined}
                      value={filtros.fim}
                      onChange={(e) => atualizarFiltro("fim", e.target.value)}
                    />
                  </label>
              <div className="v2v-filter-actions">
                <button
                  type="button"
                  className="v2v-secondary"
                  onClick={() => {
                    setRegistros(todos());
                    setFiltros(filtrosVinculosVazios);
                  }}
                >
                  <i className="pi pi-refresh" aria-hidden="true" />
                  Limpar filtros
                </button>
              </div>
            </section>
            <h2 className="dv-section-title">Visão geral</h2>
            <section
              className="v2v-kpis dv-kpis"
              aria-label="Indicadores de vínculos"
            >
              {[
                {
                  titulo: "Tipos de Vínculo",
                  valor: tiposContexto.length,
                  icone: "pi-tags",
                  classe: "dv-kpi-types",
                },
                {
                  titulo: "Pessoas com vínculo vigente",
                  valor: resumo.pessoasVigentes,
                  icone: "pi-user",
                  classe: "v2v-kpi-active",
                },
                {
                  titulo: "Pessoas com vínculo encerrado",
                  valor: resumo.pessoasEncerradas,
                  icone: "pi-user",
                  classe: "v2v-kpi-closed",
                },
                {
                  titulo: "Total de vínculos",
                  valor: resumo.total,
                  icone: "pi-link",
                  classe: "dv-kpi-total",
                },
              ].map((card) => (
                <article key={card.titulo} className={card.classe}>
                  <i className={`pi ${card.icone}`} aria-hidden="true" />
                  <div>
                    <span>{card.titulo}</span>
                    <strong>{numero(card.valor)}</strong>
                  </div>
                  <i className={`pi ${card.icone} dv-kpi-background-icon`} aria-hidden="true" />
                </article>
              ))}
            </section>
            {invalido && (
              <p className="v2v-error" role="alert">
                O período final deve ser igual ou posterior ao período
                inicial.
              </p>
            )}
            {!resumo.total && !invalido && (
              <p className="v2v-empty" role="status">
                Nenhum vínculo encontrado para os filtros informados.
              </p>
            )}
            <h2 className="dv-section-title">Gráficos gerenciais</h2>
            <div className="dv-charts">
              <section
                className="v2v-panel dv-bars-panel"
                aria-labelledby="dv-bars-title"
              >
                <h2 id="dv-bars-title">
                  Vigentes x Encerrados por Tipo de Vínculo
                </h2>
                <div className="dv-chart-legend">
                  <span>
                    <i style={{ background: "linear-gradient(90deg,#10B981,#047857)" }} />
                    Vigentes
                  </span>
                  <span>
                    <i style={{ background: "linear-gradient(90deg,#64748B,#475569)" }} />
                    Encerrados
                  </span>
                </div>
                <div
                  className="dv-chart-scroll"
                  tabIndex={0}
                  aria-label="Gráfico por tipo de vínculo; role horizontalmente para consultar todos os tipos"
                >
                  <svg
                    width={larguraGrafico}
                    height="350"
                    role="group"
                    aria-label="Quantidade de vínculos vigentes e encerrados por tipo"
                  >
                    <defs>
                      <linearGradient id="dv-vigentes-gradient" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#047857" /></linearGradient>
                      <linearGradient id="dv-encerrados-gradient" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#64748B" /><stop offset="100%" stopColor="#475569" /></linearGradient>
                    </defs>
                    {Array.from({ length: 6 }, (_, i) => (
                      <g key={i}>
                        <line
                          x1="45"
                          x2={larguraGrafico - 10}
                          y1={270 - i * 48}
                          y2={270 - i * 48}
                          stroke="#e2e8ef"
                        />
                        <text
                          x="35"
                          y={274 - i * 48}
                          textAnchor="end"
                          className="dv-axis-label"
                        >
                          {numero(i * escala)}
                        </text>
                      </g>
                    ))}
                    {resumo.linhas.map((linha, indice) => {
                      const x = 45 + passo * indice + passo / 2;
                      return (
                        <g key={linha.tipo}>
                          {[
                            {
                              situacao: "Vigente",
                              quantidade: linha.vigentes,
                              cor: VERDE,
                              offset: -27,
                            },
                            {
                              situacao: "Encerrado",
                              quantidade: linha.encerrados,
                              cor: CINZA,
                              offset: 3,
                            },
                          ].map((barra) => (
                            <Link
                              key={barra.situacao}
                              to={consulta(linha.tipo, barra.situacao)}
                              aria-label={`${linha.tipo}: ${numero(barra.quantidade)} ${barra.situacao === "Vigente" ? "vigentes" : "encerrados"}`}
                            >
                              <title>
                                {linha.tipo} — {barra.situacao}:{" "}
                                {numero(barra.quantidade)}
                              </title>
                              <rect
                                x={x + barra.offset}
                                y={270 - (barra.quantidade / teto) * 240}
                                width="24"
                                height={(barra.quantidade / teto) * 240}
                                rx="2"
                                fill={barra.situacao === "Vigente" ? "url(#dv-vigentes-gradient)" : "url(#dv-encerrados-gradient)"}
                              />
                              <text
                                x={x + barra.offset + 12}
                                y={262 - (barra.quantidade / teto) * 240}
                                textAnchor="middle"
                                className="dv-bar-value"
                              >
                                {numero(barra.quantidade)}
                              </text>
                            </Link>
                          ))}
                          <text
                            x={x}
                            y="294"
                            textAnchor="middle"
                            className="dv-axis-label"
                          >
                            {linhasRotulo(linha.tipo).map((texto, i) => (
                              <tspan key={i} x={x} dy={i ? 14 : 0}>
                                {texto}
                              </tspan>
                            ))}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                <p className="dv-chart-hint">
                  Selecione uma barra para consultar os vínculos. Role
                  horizontalmente para visualizar todos os tipos.
                </p>
              </section>
              <div className="dv-side-charts">
                <section
                  className="v2v-panel"
                  aria-labelledby="dv-distribuicao-title"
                >
                  <h2 id="dv-distribuicao-title">Distribuição geral</h2>
                  <div className="dv-donut">
                    <svg
                      viewBox="0 0 200 200"
                      role="img"
                      aria-label={`Distribuição: ${resumo.vigentes} vínculos vigentes e ${resumo.encerrados} encerrados`}
                    >
                      <defs>
                        <linearGradient id="dv-donut-vigentes" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#047857" /></linearGradient>
                        <linearGradient id="dv-donut-encerrados" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#64748B" /><stop offset="100%" stopColor="#475569" /></linearGradient>
                      </defs>
                      <circle
                        cx="100"
                        cy="100"
                        r="76"
                        fill="none"
                        stroke="#ebeff3"
                        strokeWidth="20"
                      />
                      {resumo.total > 0 && (
                        <g transform="rotate(-90 100 100)">
                          <circle
                            cx="100"
                            cy="100"
                            r="76"
                            fill="none"
                            stroke="url(#dv-donut-vigentes)"
                            strokeWidth="20"
                            pathLength="100"
                            strokeDasharray={`${fracaoVigentes * 100} 100`}
                          />
                          <circle
                            cx="100"
                            cy="100"
                            r="76"
                            fill="none"
                            stroke="url(#dv-donut-encerrados)"
                            strokeWidth="20"
                            pathLength="100"
                            strokeDasharray={`${(1 - fracaoVigentes) * 100} 100`}
                            strokeDashoffset={-fracaoVigentes * 100}
                          />
                        </g>
                      )}
                    </svg>
                    <div>
                      <strong>{numero(resumo.total)}</strong>
                      <span>Total de vínculos</span>
                    </div>
                  </div>
                  <div className="dv-distribution-legend">
                    <Link to={consulta(undefined, "Vigente")}>
                      <i style={{ background: "linear-gradient(90deg,#10B981,#047857)" }} />
                      <span>Vigentes</span>
                      <strong>
                        {numero(resumo.vigentes)} —{" "}
                        {percentual(resumo.vigentes, resumo.total)}
                      </strong>
                    </Link>
                    <Link to={consulta(undefined, "Encerrado")}>
                      <i style={{ background: "linear-gradient(90deg,#64748B,#475569)" }} />
                      <span>Encerrados</span>
                      <strong>
                        {numero(resumo.encerrados)} —{" "}
                        {percentual(resumo.encerrados, resumo.total)}
                      </strong>
                    </Link>
                  </div>
                </section>
                <section
                  className="v2v-panel"
                  aria-labelledby="dv-formas-title"
                >
                  <h2 id="dv-formas-title">Formas de Vacância</h2>
                  {resumo.formas.map((forma) => (
                    <Link
                      className="dv-vacancy-bar"
                      key={forma.nome}
                      to={consulta(undefined, "Encerrado", forma.nome)}
                    >
                      <span>
                        {forma.nome}
                        <strong>
                          {numero(forma.quantidade)} —{" "}
                          {percentual(forma.quantidade, resumo.encerrados)}
                        </strong>
                      </span>
                      <span className="dv-track">
                        <span
                          style={{
                            width: `${resumo.encerrados ? (forma.quantidade / resumo.encerrados) * 100 : 0}%`,
                          }}
                        />
                      </span>
                    </Link>
                  ))}
                  {!resumo.formas.length && (
                    <p className="dv-muted">
                      Nenhum vínculo encerrado no contexto selecionado.
                    </p>
                  )}
                </section>
              </div>
            </div>
            <section
              className="v2v-panel dv-summary"
              aria-labelledby="dv-summary-title"
            >
              <h2 id="dv-summary-title">Resumo por Tipo de Vínculo</h2>
              <div className="v2v-table-wrap">
                <table className="v2v-table">
                  <thead>
                    <tr>
                      {[
                        "Tipo de Vínculo",
                        "Vigentes",
                        "Encerrados",
                        "Total",
                        "% Vigentes",
                        "Principal Forma de Vacância",
                      ].map((coluna) => (
                        <th key={coluna}>{coluna}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resumo.linhas.map((linha) => (
                      <tr key={linha.tipo}>
                        <td>
                          <Link to={consulta(linha.tipo)}>{linha.tipo}</Link>
                        </td>
                        <td>
                          <Link
                            className="dv-count"
                            to={consulta(linha.tipo, "Vigente")}
                            aria-label={`Consultar ${linha.vigentes} vínculos vigentes de ${linha.tipo}`}
                          >
                            {numero(linha.vigentes)}
                          </Link>
                        </td>
                        <td>
                          <Link
                            className="dv-count dv-count-closed"
                            to={consulta(linha.tipo, "Encerrado")}
                            aria-label={`Consultar ${linha.encerrados} vínculos encerrados de ${linha.tipo}`}
                          >
                            {numero(linha.encerrados)}
                          </Link>
                        </td>
                        <td>{numero(linha.total)}</td>
                        <td>{percentual(linha.vigentes, linha.total)}</td>
                        <td>{linha.principalForma}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th scope="row">Total</th>
                      <td>{numero(resumo.vigentes)}</td>
                      <td>{numero(resumo.encerrados)}</td>
                      <td>{numero(resumo.total)}</td>
                      <td>{percentual(resumo.vigentes, resumo.total)}</td>
                      <td>—</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
            {resumo.formasARevisar > 0 && (
              <p className="dv-info" role="status">
                <i className="pi pi-exclamation-triangle" aria-hidden="true" />
                {numero(resumo.formasARevisar)} vínculo(s) encerrado(s) possuem
                Forma de Vacância incompatível com o tipo ou não cadastrada.
                Estão incluídos nos totais e agrupados como “Forma de Vacância a
                revisar”.
              </p>
            )}
            <p className="dv-info">
              <i className="pi pi-info-circle" aria-hidden="true" />
              Para vínculos encerrados, são consideradas a Data de Vacância e a
              Forma de Vacância registrada no encerramento do vínculo. A
              existência de uma Data Fim prevista não caracteriza, isoladamente,
              um vínculo como encerrado.
            </p>
          </div>
        </div>
      </main>
    </PrototypeSystemPage>
  );
}
