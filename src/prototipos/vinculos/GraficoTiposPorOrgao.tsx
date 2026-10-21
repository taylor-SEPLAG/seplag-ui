import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import type { Vinculo } from "./VinculoV2Page";
import { urlConsultaVinculos, type FiltrosVinculos } from "./vinculosConsulta";
import { situacaoDoVinculo } from "./vinculosConsulta";
import { GraficoOrgaoTipoSituacao } from "./GraficoOrgaoTipoSituacao";

export function agruparTiposPorOrgao(
  registros: Pick<Vinculo, "orgao" | "tipo">[],
) {
  const grupos = new Map<string, Map<string, number>>();
  for (const registro of registros) {
    const orgao = registro.orgao?.trim() || "Não informado";
    if (!grupos.has(orgao)) grupos.set(orgao, new Map());
    const tipos = grupos.get(orgao)!;
    tipos.set(registro.tipo, (tipos.get(registro.tipo) ?? 0) + 1);
  }
  return [...grupos]
    .map(([orgao, tipos]) => ({
      orgao,
      tipos,
      total: [...tipos.values()].reduce((s, n) => s + n, 0),
    }))
    .sort(
      (a, b) => b.total - a.total || a.orgao.localeCompare(b.orgao, "pt-BR"),
    );
}
const cores = [
  "#0877c9",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#e45365",
  "#06b6d4",
  "#526582",
  "#b45309",
  "#4f46e5",
  "#65a30d",
  "#be185d",
  "#0f766e",
  "#9333ea",
  "#ea580c",
  "#0369a1",
  "#a16207",
  "#15803d",
  "#c026d3",
  "#475569",
  "#d97706",
  "#0e7490",
];
export function agruparTiposPorCargo(
  registros: Pick<Vinculo, "cargo" | "perfil" | "tipo">[],
) {
  return agruparTiposPorOrgao(
    registros.map((r) => ({
      tipo: r.tipo,
      orgao: [r.cargo?.trim() || "Cargo não informado", r.perfil?.trim()]
        .filter(Boolean)
        .join(" / "),
    })),
  );
}

export function GraficoTiposPorOrgao({
  registros,
  filtros,
  porCargo = false,
}: {
  registros: Vinculo[];
  filtros: FiltrosVinculos;
  porCargo?: boolean;
}) {
  if (!porCargo)
    return <GraficoOrgaoTipoSituacao registros={registros} filtros={filtros} />;
  const grupos = porCargo
    ? agruparTiposPorCargo(registros)
    : agruparTiposPorOrgao(
        registros.map((r) => ({ orgao: r.orgao, tipo: situacaoDoVinculo(r) })),
      );
  const titulo = porCargo
    ? "Tipos de vínculo por cargo/especialidade"
    : "Vínculos ativos e encerrados por órgão";
  const dimensao = porCargo ? "cargo/especialidade" : "órgão";
  const id = porCargo ? "dv-cargo-title" : "dv-orgao-title";
  const Segmento = ({
    children,
    to,
    rotulo,
  }: {
    children: ReactNode;
    to: string;
    rotulo: string;
  }) =>
    porCargo ? (
      <g role="img" aria-label={rotulo}>
        {children}
      </g>
    ) : (
      <Link to={to} aria-label={rotulo}>
        {children}
      </Link>
    );
  const tipos = porCargo
    ? [...new Set(registros.map((r) => r.tipo))].sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      )
    : ["Ativo", "Encerrado"];
  const cor = (i: number) =>
    porCargo ? cores[i % cores.length] : i === 0 ? "#10b981" : "#64748b";
  const teto = Math.max(1, ...grupos.map((g) => g.total));
  const largura = 1050,
    inicio = porCargo ? 360 : 180,
    comprimento = porCargo ? 610 : 790;
  return (
    <section className="v2v-panel dv-orgao-panel" aria-labelledby={id}>
      <h2 id={id}>{titulo}</h2>
      <p className="dv-chart-hint">
        Quantidade de vínculos {porCargo ? "por tipo" : "ativos e encerrados"}{" "}
        em cada {dimensao}, conforme os filtros selecionados.
      </p>
      {!grupos.length ? (
        <p role="status" className="dv-muted">
          Nenhum vínculo encontrado para os filtros informados.
        </p>
      ) : (
        <>
          <div className="dv-orgao-chart-layout">
            <div className="dv-chart-legend dv-orgao-legend">
              {tipos.map((tipo, i) => (
                <span key={tipo}>
                  <i style={{ background: cor(i) }} />
                  {porCargo ? tipo : tipo === "Ativo" ? "Ativos" : "Encerrados"}
                </span>
              ))}
            </div>
            <div
              className="dv-chart-scroll"
              tabIndex={0}
              role="region"
              aria-label={`Gráfico de tipos de vínculo por ${dimensao}; role horizontalmente para visualizar`}
            >
              <svg
                width={largura}
                viewBox={`0 0 ${largura} ${grupos.length * 54 + 48}`}
                height={grupos.length * 54 + 48}
                role="group"
                aria-label={`Quantidade de vínculos por ${dimensao} e ${porCargo ? "tipo" : "situação"}`}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <g key={i}>
                    <line
                      x1={inicio + (i * comprimento) / 4}
                      x2={inicio + (i * comprimento) / 4}
                      y1={12}
                      y2={grupos.length * 54 + 10}
                      stroke="#e2e8ef"
                    />
                    <text
                      x={inicio + (i * comprimento) / 4}
                      y={grupos.length * 54 + 32}
                      textAnchor="middle"
                      className="dv-axis-label"
                    >
                      {Math.ceil(teto / 4) * i}
                    </text>
                  </g>
                ))}
                {grupos.map((grupo, linha) => {
                  let acumulado = 0;
                  const escala = Math.ceil(teto / 4) * 4;
                  return (
                    <g key={grupo.orgao}>
                      <text
                        x={inicio - 14}
                        y={linha * 54 + 34}
                        textAnchor="end"
                        className="dv-axis-label"
                      >
                        <title>{grupo.orgao}</title>
                        {grupo.orgao.length > (porCargo ? 48 : 24)
                          ? `${grupo.orgao.slice(0, porCargo ? 47 : 23)}…`
                          : grupo.orgao}
                      </text>
                      {tipos.map((tipo, i) => {
                        const n = grupo.tipos.get(tipo) ?? 0;
                        if (!n) return null;
                        const x = inicio + (acumulado / escala) * comprimento;
                        acumulado += n;
                        const tamanho = (n / escala) * comprimento;
                        return (
                          <Segmento
                            key={tipo}
                            to={urlConsultaVinculos({
                              ...filtros,
                              orgao:
                                grupo.orgao === "Não informado"
                                  ? ""
                                  : grupo.orgao,
                              ...(porCargo ? { tipo } : { situacao: tipo }),
                            })}
                            rotulo={`${grupo.orgao}, ${tipo}: ${n} vínculos`}
                          >
                            <title>
                              {grupo.orgao} · {tipo}: {n} vínculos
                            </title>
                            <rect
                              x={x}
                              y={linha * 54 + 14}
                              width={tamanho}
                              height={30}
                              fill={cor(i)}
                              stroke="white"
                            />
                            {tamanho > 26 && (
                              <text
                                x={x + tamanho / 2}
                                y={linha * 54 + 34}
                                textAnchor="middle"
                                fill="white"
                                fontSize="12"
                              >
                                {n}
                              </text>
                            )}
                          </Segmento>
                        );
                      })}
                      <text
                        x={inicio + (grupo.total / escala) * comprimento + 10}
                        y={linha * 54 + 34}
                        className="dv-bar-value"
                      >
                        {grupo.total}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
          {!porCargo && (
            <p className="dv-chart-hint">
              Selecione um segmento para consultar os vínculos daquele órgão e
              situação.
            </p>
          )}
        </>
      )}
    </section>
  );
}
