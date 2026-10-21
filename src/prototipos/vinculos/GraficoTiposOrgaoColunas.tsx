import { coresDashboard } from './dashboardTema';
import { useId } from "react";
import type { Vinculo } from "./VinculoV2Page";
import { situacaoDoVinculo } from "./vinculosConsulta";
import {
  gruposTipoOrgao,
  gruposTipoCargo,
  naoInformado,
} from "./dashboardAbasModel";
function linhas(texto: string) {
  const resultado = [""];
  for (const palavra of texto.split(" ")) {
    const i = resultado.length - 1;
    if (resultado[i] && `${resultado[i]} ${palavra}`.length > 19)
      resultado.push(palavra);
    else resultado[i] = `${resultado[i]} ${palavra}`.trim();
  }
  return resultado;
}
export function GraficoTiposOrgaoColunas({
  registros,
  orgao,
  abrir,
  porCargo = false,
  limite = Infinity,
}: {
  registros: Vinculo[];
  orgao?: string;
  abrir: (titulo: string, itens: Vinculo[]) => void;
  porCargo?: boolean;
  limite?: number;
}) {
  const grupos = (
      porCargo
        ? gruposTipoCargo(registros)
        : gruposTipoOrgao(registros, orgao)
    ).slice(0, limite),
    id = useId().replace(/:/g, "");
  const max = Math.max(1, ...grupos.flatMap((g) => [g.vigentes, g.encerrados]));
  const unidade = Math.max(1, Math.ceil(max / 5)),
    teto = unidade * 5;
  const largura = Math.max(800, grupos.length * 135 + 60),
    passo = (largura - 60) / Math.max(1, grupos.length),
    base = 278;
  const rotulos = grupos.map((g) => {
    const v = g.itens[0];
    return {
      tipo: v.tipo,
      orgao: porCargo ? naoInformado(v.cargo) : naoInformado(v.orgao),
    };
  });
  const altura =
    base +
    Math.max(3, ...rotulos.map((r) => linhas(r.tipo).length)) * 15 +
    (orgao ? 40 : 65) +
    (porCargo ? 45 : 0);
  const titulo = porCargo
    ? "Tipos de vínculo por cargo"
    : "Tipos de vínculo por órgão";
  return (
    <section className="v2v-panel da-card" aria-label={titulo}>
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
      {!grupos.length ? (
        <p role="status">
          Nenhum vínculo encontrado para os filtros informados.
        </p>
      ) : (
        <div
          className="da-tipos-columns"
          tabIndex={0}
          role="region"
          aria-label={`${titulo}; role horizontalmente para visualizar todos os tipos`}
        >
          <svg
            width={largura}
            height={altura}
            role="group"
            aria-label={`Vínculos ativos e encerrados: ${titulo}`}
          >
            <defs>
              <linearGradient id={`${id}-ativo`} x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor={coresDashboard.ativo} />
                <stop offset="100%" stopColor={coresDashboard.ativo} />
              </linearGradient>
              <linearGradient
                id={`${id}-encerrado`}
                x1="0"
                y1="1"
                x2="0"
                y2="0"
              >
                <stop offset="0%" stopColor={coresDashboard.encerrado} />
                <stop offset="100%" stopColor={coresDashboard.encerrado} />
              </linearGradient>
            </defs>
            {Array.from({ length: 6 }, (_, i) => (
              <g key={i}>
                <line
                  x1={45}
                  x2={largura - 10}
                  y1={base - i * 48}
                  y2={base - i * 48}
                  stroke="#e2e8ef"
                />
                <text
                  x={33}
                  y={base - i * 48 + 4}
                  textAnchor="end"
                  className="dv-axis-label"
                >
                  {i * unidade}
                </text>
              </g>
            ))}
            {grupos.map((g, i) => {
              const x = 60 + i * passo + passo / 2;
              return (
                <g key={g.nome}>
                  {[
                    { nome: "Ativo", n: g.vigentes, dx: -27, cor: "ativo" },
                    {
                      nome: "Encerrado",
                      n: g.encerrados,
                      dx: 3,
                      cor: "encerrado",
                    },
                  ].map((s) => (
                    <g
                      key={s.nome}
                      role="button"
                      tabIndex={0}
                      aria-label={`${g.nome}: ${s.n} ${s.nome === "Ativo" ? "ativos" : "encerrados"}`}
                      onClick={() =>
                        abrir(
                          `${g.nome} · ${s.nome}`,
                          g.itens.filter(
                            (v) => situacaoDoVinculo(v) === s.nome,
                          ),
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          abrir(
                            `${g.nome} · ${s.nome}`,
                            g.itens.filter(
                              (v) => situacaoDoVinculo(v) === s.nome,
                            ),
                          );
                        }
                      }}
                    >
                      <title>
                        {g.nome} · {s.nome}: {s.n}
                      </title>
                      <rect
                        x={x + s.dx}
                        y={base - (s.n / teto) * 240}
                        width={24}
                        height={(s.n / teto) * 240}
                        rx={2}
                        fill={`url(#${id}-${s.cor})`}
                      />
                      <text
                        x={x + s.dx + 12}
                        y={base - (s.n / teto) * 240 - 8}
                        textAnchor="middle"
                        className="dv-bar-value"
                      >
                        {s.n}
                      </text>
                    </g>
                  ))}
                  <text
                    x={x}
                    y={base + 24}
                    textAnchor="middle"
                    className="dv-axis-label"
                  >
                    {linhas(rotulos[i].tipo).map((l, j) => (
                      <tspan key={j} x={x} dy={j ? 15 : 0}>
                        {l}
                      </tspan>
                    ))}
                  </text>
                  {!orgao && (
                    <text
                      x={x}
                      y={altura - (porCargo ? 55 : 15)}
                      textAnchor="middle"
                      className="dv-axis-label"
                    >
                      {linhas(rotulos[i].orgao).map((l, j) => (
                        <tspan key={j} x={x} dy={j ? 15 : 0}>
                          {l}
                        </tspan>
                      ))}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </section>
  );
}
