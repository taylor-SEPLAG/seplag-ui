import { Link } from "react-router-dom";
import { useState } from 'react';
import type { Vinculo } from "./VinculoV2Page";
import {
  situacaoDoVinculo,
  urlConsultaVinculos,
  type FiltrosVinculos,
} from "./vinculosConsulta";

export function consolidarOrgaoTipo(registros: Vinculo[]) {
  const orgaos = new Map<
    string,
    Map<string, { tipo: string; ativos: number; encerrados: number }>
  >();
  for (const r of registros) {
    const orgao = r.orgao?.trim() || "Não informado";
    if (!orgaos.has(orgao)) orgaos.set(orgao, new Map());
    const tipos = orgaos.get(orgao)!;
    if (!tipos.has(r.tipo))
      tipos.set(r.tipo, { tipo: r.tipo, ativos: 0, encerrados: 0 });
    const item = tipos.get(r.tipo)!;
    if (situacaoDoVinculo(r) === "Ativo") item.ativos++;
    else item.encerrados++;
  }
  return [...orgaos]
    .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
    .map(([orgao, tipos]) => ({
      orgao,
      tipos: [...tipos.values()].sort((a, b) =>
        a.tipo.localeCompare(b.tipo, "pt-BR"),
      ),
      total: [...tipos.values()].reduce(
        (s, t) => s + t.ativos + t.encerrados,
        0,
      ),
    }));
}
function quebrar(texto: string) {
  const linhas = [""];
  for (const palavra of texto.split(" ")) {
    const i = linhas.length - 1;
    if (linhas[i] && `${linhas[i]} ${palavra}`.length > 19)
      linhas.push(palavra);
    else linhas[i] = `${linhas[i]} ${palavra}`.trim();
  }
  return linhas;
}
export function GraficoOrgaoTipoSituacao({
  registros,
  filtros,
}: {
  registros: Vinculo[];
  filtros: FiltrosVinculos;
}) {
  const [orgaoSelecionado, setOrgaoSelecionado] = useState('');
  const todosGrupos = consolidarOrgaoTipo(registros);
  const selecao = todosGrupos.some(g => g.orgao === orgaoSelecionado) ? orgaoSelecionado : '';
  const grupos = selecao ? todosGrupos.filter(g => g.orgao === selecao) : todosGrupos;
  const passo = 132,
    intervalo = 34,
    margem = 58;
  const largura = Math.max(
    820,
    margem + grupos.reduce((s, g) => s + g.tipos.length * passo + intervalo, 0),
  );
  const base = 302,
    altura = 260;
  const teto = Math.max(
    1,
    ...grupos.flatMap((g) => g.tipos.map((t) => t.ativos + t.encerrados)),
  );
  const unidade = Math.max(1, Math.ceil(teto / 5)),
    limite = unidade * 5;
  const linhas = Math.max(
    1,
    ...grupos.flatMap((g) => g.tipos.map((t) => quebrar(t.tipo).length)),
  );
  const yOrgao = base + linhas * 15 + 48;
  let acumulado = margem;
  return (
    <section
      className="v2v-panel dv-orgao-panel"
      aria-labelledby="dv-orgao-title"
    >
      <h2 id="dv-orgao-title">Vínculos ativos e encerrados por órgão</h2>
      <label className="dv-orgao-select">Selecione o órgão
        <select value={selecao} onChange={e => setOrgaoSelecionado(e.target.value)}>
          <option value="">Todos os órgãos</option>
          {todosGrupos.map(g => <option key={g.orgao} value={g.orgao}>{g.orgao}</option>)}
        </select>
      </label>
      <p className="dv-chart-hint">
        Órgãos agrupados por tipo de vínculo, com as situações empilhadas. Os
        totais respeitam os filtros selecionados.
      </p>
      {!grupos.length ? (
        <p role="status" className="dv-muted">
          Nenhum vínculo encontrado para os filtros informados.
        </p>
      ) : (
        <>
          <div className="dv-orgao-chart-layout dv-orgao-status-layout">
            <div className="dv-chart-legend dv-orgao-legend">
              <span>
                <i className="dv-status-ativo" />
                Ativos
              </span>
              <span>
                <i className="dv-status-encerrado" />
                Encerrados
              </span>
            </div>
            <div
              className="dv-chart-scroll"
              tabIndex={0}
              role="region"
              aria-label="Gráfico de vínculos por órgão, tipo e situação; role horizontalmente para visualizar"
            >
              <svg
                width={largura}
                height={yOrgao + 52}
                style={{
                  width: largura,
                  minWidth: largura,
                  height: yOrgao + 52,
                }}
                role="group"
                aria-label="Quantidade de vínculos por órgão, tipo e situação"
              >
                <defs>
                  <linearGradient id="dv-orgao-ativos" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#10B981"/><stop offset="100%" stopColor="#047857"/></linearGradient>
                  <linearGradient id="dv-orgao-encerrados" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#64748B"/><stop offset="100%" stopColor="#475569"/></linearGradient>
                </defs>
                <text x={margem} y={16} className="dv-axis-label">
                  Quantidade de vínculos
                </text>
                {Array.from({ length: 6 }, (_, i) => (
                  <g key={i}>
                    <line
                      x1={margem}
                      x2={largura - 12}
                      y1={base - (i * altura) / 5}
                      y2={base - (i * altura) / 5}
                      stroke="currentColor"
                      className="dv-orgao-gridline"
                    />
                    <text
                      x={margem - 12}
                      y={base - (i * altura) / 5 + 4}
                      textAnchor="end"
                      className="dv-axis-label"
                    >
                      {i * unidade}
                    </text>
                  </g>
                ))}
                {grupos.map((g) => {
                  const inicio = acumulado;
                  acumulado += g.tipos.length * passo + intervalo;
                  return (
                    <g key={g.orgao}>
                      {g.tipos.map((t, i) => {
                        const x = inicio + i * passo + passo / 2;
                        const total = t.ativos + t.encerrados;
                        return (
                          <g key={t.tipo}>
                            {[
                              {
                                situacao: "Ativo",
                                n: t.ativos,
                                offset: 0,
                                classe: "dv-status-ativo",
                              },
                              {
                                situacao: "Encerrado",
                                n: t.encerrados,
                                offset: t.ativos,
                                classe: "dv-status-encerrado",
                              },
                            ].map(
                              (s) =>
                                s.n > 0 && (
                                  <Link
                                    key={s.situacao}
                                    to={urlConsultaVinculos({
                                      ...filtros,
                                      orgao:
                                        g.orgao === "Não informado"
                                          ? ""
                                          : g.orgao,
                                      tipo: t.tipo,
                                      situacao: s.situacao,
                                    })}
                                    aria-label={`${g.orgao}, ${t.tipo}, ${s.situacao}: ${s.n} vínculos`}
                                  >
                                    <title>
                                      {g.orgao} · {t.tipo} · {s.situacao}: {s.n}
                                    </title>
                                    <rect
                                      x={x - 24}
                                      y={
                                        base -
                                        ((s.offset + s.n) / limite) * altura
                                      }
                                      width={48}
                                      height={(s.n / limite) * altura}
                                      className={s.classe}
                                    />
                                    {(s.n / limite) * altura > 18 && (
                                      <text
                                        x={x}
                                        y={
                                          base -
                                          ((s.offset + s.n / 2) / limite) *
                                            altura +
                                          4
                                        }
                                        textAnchor="middle"
                                        fill="white"
                                        fontSize={12}
                                      >
                                        {s.n}
                                      </text>
                                    )}
                                  </Link>
                                ),
                            )}
                            <text
                              x={x}
                              y={base - (total / limite) * altura - 8}
                              textAnchor="middle"
                              className="dv-bar-value"
                            >
                              {total}
                            </text>
                            <text
                              x={x}
                              y={base + 21}
                              textAnchor="middle"
                              className="dv-axis-label"
                            >
                              {quebrar(t.tipo).map((linha, j) => (
                                <tspan key={j} x={x} dy={j ? 15 : 0}>
                                  {linha}
                                </tspan>
                              ))}
                            </text>
                          </g>
                        );
                      })}
                      <line
                        x1={inicio + 5}
                        x2={acumulado - intervalo - 5}
                        y1={yOrgao - 19}
                        y2={yOrgao - 19}
                        stroke="currentColor"
                        className="dv-orgao-gridline"
                      />
                      <text
                        x={(inicio + acumulado - intervalo) / 2}
                        y={yOrgao}
                        textAnchor="middle"
                        className="dv-bar-value"
                      >
                        {g.orgao} · Total: {g.total}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
          <p className="dv-chart-hint">
            Selecione um segmento para consultar os vínculos do órgão, tipo e
            situação correspondentes.
          </p>
        </>
      )}
    </section>
  );
}
