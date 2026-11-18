import { memo, useState } from "react";
import {
  FiActivity,
  FiCheckCircle,
  FiFileText,
  FiLayers,
  FiRepeat,
  FiTarget,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { GraficoProjeto, type SerieProjeto } from "./GraficoProjeto";
import {
  Ajuda,
  CardInsight,
  EstadoVazio,
  KpiProjeto,
} from "./ComponentesProjeto";
import {
  FAIXAS,
  agrupar,
  calcularCapacity,
  concluida,
  faixaComplexidade,
  gerarInsights,
  homologada,
  iniciada,
  nomesUnicos,
  numero,
  percentual,
  qaAprovada,
  reapareceu,
  tendencia,
  ultimasHistorias,
  variacao,
} from "./modelo";
import type {
  CapacityEntrada,
  DadosProjeto,
  FiltrosProjeto,
  GrupoProjeto,
  HistoriaProjeto,
  MetricaGrupo,
  ResumoProjeto,
} from "./types";

export interface DetalheProjeto {
  titulo: string;
  formula: string;
  historias: HistoriaProjeto[];
  valor?: string;
  pessoa?: string;
}
export interface ContextoProjeto {
  dados: DadosProjeto;
  historias: HistoriaProjeto[];
  filtros: FiltrosProjeto;
  primeiras: Map<string, number>;
  periodo: string;
  resumo: ResumoProjeto;
  anterior: ResumoProjeto | null;
  sprints: {
    numero: number;
    periodo: string;
    historias: HistoriaProjeto[];
    resumo: ResumoProjeto;
  }[];
  foco: number | null;
  abrir: (detalhe: DetalheProjeto) => void;
  destacar: (sprint: number) => void;
  filtrarModulo: (modulo: string) => void;
}
const CORES = [
  "#087bb5",
  "#10a69c",
  "#5b7cc7",
  "#e2a43c",
  "#8c78b8",
  "#52978a",
  "#e18e6d",
  "#679fc0",
];
const porcentagem = (numerador: number, denominador: number) =>
  denominador ? (numerador / denominador) * 100 : null;
const idsSprint = (ctx: ContextoProjeto) =>
  ctx.sprints.map((s) => `Sprint ${s.numero}`);
const foco = (ctx: ContextoProjeto) =>
  ctx.foco === null
    ? null
    : ctx.sprints.findIndex((s) => s.numero === ctx.foco);
function abrirSprint(
  ctx: ContextoProjeto,
  i: number,
  titulo = "Detalhamento da sprint",
  historias?: HistoriaProjeto[],
  formula = "Registros únicos de US vinculados ao período desta sprint na planilha.",
) {
  const sprint = ctx.sprints[i];
  if (!sprint) return;
  ctx.destacar(sprint.numero);
  ctx.abrir({
    titulo: `${titulo} — Sprint ${sprint.numero}`,
    formula: `${sprint.periodo}. ${formula}`,
    historias: historias ?? sprint.historias,
    valor: `${historias?.length ?? sprint.historias.length} registros`,
  });
}
function GraficoVolume({
  ctx,
  id = "volume-sprints",
}: {
  ctx: ContextoProjeto;
  id?: string;
}) {
  return (
    <GraficoProjeto
      id={id}
      titulo="Histórias registradas por sprint"
      descricao="Histórias novas e remanescentes no período, considerando o histórico da base. Clique nas barras para consultar a origem."
      periodo={ctx.periodo}
      labels={idsSprint(ctx)}
      empilhado
      selecionado={foco(ctx)}
      series={[
        {
          nome: "Primeira aparição",
          cor: CORES[0],
          valores: ctx.sprints.map((s) => s.resumo.novas),
        },
        {
          nome: "Reaparições",
          cor: CORES[3],
          valores: ctx.sprints.map((s) => s.resumo.reaparecidas),
        },
      ]}
      onSelecionar={(i, serie) =>
        abrirSprint(
          ctx,
          i,
          serie ? "Histórias reaparecidas" : "Primeira aparição",
          ctx.sprints[i].historias.filter(
            (h) => reapareceu(h, ctx.primeiras) === Boolean(serie),
          ),
          "A primeira aparição considera todo o histórico da base. Histórias de sprints anteriores continuam remanescentes ao filtrar uma única sprint.",
        )
      }
    />
  );
}
function GraficoPontos({
  ctx,
  id = "pontos-sprints",
}: {
  ctx: ContextoProjeto;
  id?: string;
}) {
  return (
    <GraficoProjeto
      id={id}
      titulo="Pontos estimados por sprint"
      descricao="Estimativas registradas, sem equivalência presumida com pontos entregues ou horas."
      periodo={ctx.periodo}
      labels={idsSprint(ctx)}
      tipo="line"
      alternavel
      selecionado={foco(ctx)}
      series={[
        {
          nome: "Pontos estimados",
          cor: CORES[1],
          valores: ctx.sprints.map((s) =>
            s.resumo.pontuadas ? s.resumo.pontos : null,
          ),
        },
      ]}
      onSelecionar={(i) =>
        abrirSprint(
          ctx,
          i,
          "Estimativas da sprint",
          ctx.sprints[i].historias,
          "A soma considera apenas pontuações informadas; células vazias permanecem desconhecidas.",
        )
      }
    />
  );
}
function VisaoGeral({ ctx }: { ctx: ContextoProjeto }) {
  const r = ctx.resumo,
    a = ctx.anterior,
    insights = gerarInsights(ctx.historias, ctx.primeiras);
  const cards = [
    {
      titulo: "Histórias distintas",
      valor: r.distintas,
      anterior: a?.distintas,
      icone: <FiLayers />,
      nota: "US contadas uma única vez no recorte",
      ajuda:
        "Quantidade de códigos de US diferentes no período. A mesma US em sprints diferentes conta apenas uma vez.",
      historias: ultimasHistorias(ctx.historias),
    },
    {
      titulo: "Registros nas sprints",
      valor: r.registros,
      anterior: a?.registros,
      icone: <FiFileText />,
      nota: "Presenças de histórias em cada sprint",
      ajuda:
        "Cada combinação US + sprint conta uma vez. Reaparições em outras sprints são preservadas.",
      historias: ctx.historias,
    },
    {
      titulo: "Histórias concluídas",
      valor: r.concluidas,
      anterior: a?.concluidas,
      icone: <FiCheckCircle />,
      nota: `Situação conhecida em ${r.conhecidas}/${r.distintas} US`,
      ajuda:
        "Conclusões confirmadas pela situação da última aparição da US no recorte. Situação ausente não é interpretada como conclusão. Finalizada não comprova QA ou homologação.",
      historias: ultimasHistorias(ctx.historias).filter(concluida),
    },
    {
      titulo: "Pontos estimados",
      valor: r.pontuadas ? r.pontos : null,
      anterior: a?.pontuadas ? a.pontos : null,
      icone: <FiTarget />,
      nota: "Estimativas registradas; não são entregas",
      ajuda:
        "Soma dos story points informados em cada sprint. A reaparição da US pode registrar pontos novamente. Não corresponde a velocidade de entrega.",
      historias: ctx.historias.filter((h) => h.pontos !== null),
    },
    {
      titulo: "Desenvolvedores disponíveis",
      valor: r.desenvolvedores,
      anterior: a?.desenvolvedores,
      icone: <FiUsers />,
      nota: "Nomes distintos atribuídos às histórias",
      ajuda:
        "Nomes distintos na coluna Dev das histórias filtradas. Um nome conta uma vez por sprint e uma vez no total do período, mesmo quando aparece em várias US.",
      historias: ctx.historias.filter((h) => h.desenvolvedores.length),
    },
    {
      titulo: "Histórias reaparecidas",
      valor: r.reaparecidas,
      anterior: a?.reaparecidas,
      icone: <FiRepeat />,
      nota: "Registros já presentes em outra sprint",
      ajuda:
        "Registros de uma US que já apareceu em sprint anterior no histórico da base, mesmo fora do intervalo selecionado. Reaparição não significa automaticamente atraso ou retrabalho.",
      historias: ctx.historias.filter((h) => reapareceu(h, ctx.primeiras)),
    },
    {
      titulo: "Taxa de conclusão",
      valor: r.taxaConclusao,
      anterior: a?.taxaConclusao,
      icone: <FiActivity />,
      nota: "Conclusões confirmadas / US comprometidas",
      ajuda: `Histórias distintas concluídas / histórias distintas comprometidas × 100. ${r.distintas - r.conhecidas} histórias não têm situação na última aparição; a taxa representa apenas conclusões comprovadas.`,
      historias: ultimasHistorias(ctx.historias),
      sufixo: "%",
      casas: 1,
    },
    {
      titulo: "Complexidade média",
      valor: r.media,
      anterior: a?.media,
      icone: <FiTrendingUp />,
      nota: `${r.pontuadas} registros com pontuação`,
      ajuda:
        "Soma dos pontos / registros com pontuação. Células vazias são excluídas da média e não se tornam zero.",
      historias: ctx.historias.filter((h) => h.pontos !== null),
      casas: 2,
    },
  ];
  return (
    <>
      <div className="ind-kpi-grid">
        {cards.map((c) => (
          <KpiProjeto
            key={c.titulo}
            {...c}
            periodo={ctx.periodo}
            comparar={ctx.filtros.comparar}
            onClick={() =>
              ctx.abrir({
                titulo: c.titulo,
                formula: c.ajuda,
                historias: c.historias,
                valor: `${numero(c.valor, c.casas ?? 0)}${c.sufixo ?? ""}`,
              })
            }
          />
        ))}
      </div>
      <div className="ind-charts-grid">
        <GraficoVolume ctx={ctx} />
        <GraficoPontos ctx={ctx} />
      </div>
      <div className="ind-section-heading">
        <div>
          <h2>Leitura gerencial</h2>
          <p>O que os dados sustentam neste recorte.</p>
        </div>
      </div>
      <div className="ind-insights-grid">
        {insights.slice(0, 3).map((i) => (
          <CardInsight
            key={i.id}
            insight={i}
            compacto
            onClick={() =>
              ctx.abrir({
                titulo: i.titulo,
                formula: `${i.explicacao} ${i.impacto}`,
                valor: i.valor,
                historias: i.historias,
              })
            }
          />
        ))}
      </div>
    </>
  );
}
function EvolucaoSprints({ ctx }: { ctx: ContextoProjeto }) {
  return (
    <>
      <div className="ind-charts-grid">
        <GraficoVolume ctx={ctx} id="evolucao-volume" />
        <GraficoPontos ctx={ctx} id="evolucao-pontos" />
      </div>
      <GraficoProjeto
        id="planejado-concluido"
        titulo="Planejado versus conclusão confirmada"
        periodo={ctx.periodo}
        descricao="QA e homologação só são contabilizados quando têm situação explícita. Nomes de responsáveis não comprovam aprovação."
        labels={idsSprint(ctx)}
        selecionado={foco(ctx)}
        series={[
          {
            nome: "Histórias comprometidas",
            cor: CORES[0],
            valores: ctx.sprints.map((s) => s.resumo.registros),
          },
          {
            nome: "Desenvolvimento concluído",
            cor: CORES[1],
            valores: ctx.sprints.map((s) => s.resumo.concluidas),
          },
          {
            nome: "Aprovadas em QA",
            cor: CORES[2],
            valores: ctx.sprints.map((s) =>
              s.historias.some((h) => h.qaSituacao)
                ? s.historias.filter(qaAprovada).length
                : null,
            ),
          },
          {
            nome: "Homologadas",
            cor: CORES[3],
            valores: ctx.sprints.map((s) =>
              s.historias.some((h) => h.homologacao)
                ? s.historias.filter(homologada).length
                : null,
            ),
          },
          {
            nome: "Conclusão confirmada (%)",
            cor: "#24475f",
            tipo: "line",
            eixo: "percentual",
            valores: ctx.sprints.map((s) => s.resumo.taxaConclusao),
          },
        ]}
        onSelecionar={(i, serie) => {
          const h = ctx.sprints[i].historias;
          abrirSprint(
            ctx,
            i,
            "Planejamento e conclusão",
            serie === 1
              ? h.filter(concluida)
              : serie === 2
                ? h.filter(qaAprovada)
                : serie === 3
                  ? h.filter(homologada)
                  : h,
          );
        }}
      />
      <div className="ind-table-scroll">
        <table className="ind-table">
          <caption>Resumo por sprint · {ctx.periodo}</caption>
          <thead>
            <tr>
              <th>Sprint</th>
              <th>Registros</th>
              <th>Desenvolvedores disponíveis</th>
              <th>Variação do escopo</th>
              <th>Pontos</th>
              <th>Pontuadas / sem estimativa</th>
              <th>Média</th>
              <th>Concluídas</th>
              <th>Conclusão confirmada</th>
            </tr>
          </thead>
          <tbody>
            {ctx.sprints.map((s, i) => (
              <tr key={s.numero}>
                <td>
                  <button
                    className="ind-code"
                    type="button"
                    onClick={() => abrirSprint(ctx, i)}
                  >
                    Sprint {s.numero}
                  </button>
                </td>
                <td>{s.resumo.registros}</td>
                <td>{s.resumo.desenvolvedores}</td>
                <td>
                  {i
                    ? percentual(
                        variacao(
                          s.resumo.registros,
                          ctx.sprints[i - 1].resumo.registros,
                        ),
                      )
                    : "Sem anterior"}
                </td>
                <td>
                  {s.resumo.pontuadas ? s.resumo.pontos : "Não informado"}
                </td>
                <td>
                  {s.resumo.pontuadas} / {s.resumo.semPontos}
                </td>
                <td>{numero(s.resumo.media, 2)}</td>
                <td>{numero(s.resumo.concluidas)}</td>
                <td>{percentual(s.resumo.taxaConclusao)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ind-note">
        Crescimento de escopo não comprova aumento de produtividade. Uma etapa
        sem situação registrada é apresentada como não informada.
      </p>
    </>
  );
}
function SimuladorCapacity({ ctx }: { ctx: ContextoProjeto }) {
  const [entrada, setEntrada] = useState<CapacityEntrada>({
    pessoas: null,
    dias: null,
    jornada: null,
    dedicacao: null,
    suporte: 0,
    afastamentos: 0,
    outras: 0,
  });
  const capacidade = calcularCapacity(entrada);
  const campos: [keyof CapacityEntrada, string, number?][] = [
    ["pessoas", "Desenvolvedores"],
    ["dias", "Dias úteis"],
    ["jornada", "Horas por dia"],
    ["dedicacao", "Dedicação (%)", 100],
    ["suporte", "Horas de suporte"],
    ["afastamentos", "Férias / afastamentos (h)"],
    ["outras", "Outras indisponibilidades (h)"],
  ];
  return (
    <details className="ind-simulator">
      <summary>
        Simulador de Capacity <span>Simulação · não são dados históricos</span>
      </summary>
      <div className="ind-simulator-body">
        <p>
          Informe os parâmetros do cenário. A simulação não altera a planilha
          nem converte horas em story points.
        </p>
        <div className="ind-simulator-fields">
          {campos.map(([campo, label, max]) => (
            <label key={campo} htmlFor={`capacity-${campo}`}>
              {label}
              <input
                id={`capacity-${campo}`}
                type="number"
                min={0}
                max={max}
                step={campo === "pessoas" || campo === "dias" ? 1 : 0.5}
                value={entrada[campo] ?? ""}
                placeholder="Informe"
                onChange={(e) =>
                  setEntrada((v) => ({
                    ...v,
                    [campo]:
                      e.target.value === ""
                        ? ["suporte", "afastamentos", "outras"].includes(campo)
                          ? 0
                          : null
                        : Number(e.target.value),
                  }))
                }
              />
            </label>
          ))}
        </div>
        {capacidade ? (
          <>
            <div className="ind-mini-grid">
              <div>
                <span>Capacity bruta</span>
                <strong>{numero(capacidade.bruta, 1)} h</strong>
              </div>
              <div>
                <span>Indisponível / sem dedicação</span>
                <strong>{numero(capacidade.indisponivel, 1)} h</strong>
              </div>
              <div>
                <span>Capacity líquida simulada</span>
                <strong>{numero(capacidade.liquida, 1)} h</strong>
              </div>
              <div>
                <span>FTE simulado (dedicação)</span>
                <strong>{numero(capacidade.fte, 2)}</strong>
              </div>
            </div>
            {capacidade.excesso && (
              <p role="alert" className="ind-error">
                As reservas superam as horas alocadas. Revise as
                indisponibilidades deste cenário.
              </p>
            )}
            <GraficoProjeto
              id="capacity-simulada"
              titulo="Capacity bruta versus disponível — simulação"
              periodo={`${ctx.periodo} · parâmetros simulados pelo usuário`}
              labels={["Cenário simulado"]}
              altura={220}
              series={[
                {
                  nome: "Bruta (h)",
                  cor: CORES[0],
                  valores: [capacidade.bruta],
                },
                {
                  nome: "Indisponível (h)",
                  cor: CORES[3],
                  valores: [capacidade.indisponivel],
                },
                {
                  nome: "Líquida (h)",
                  cor: CORES[1],
                  valores: [capacidade.liquida],
                },
              ]}
              onSelecionar={() =>
                ctx.abrir({
                  titulo: "Origem da simulação de capacity",
                  valor: `${numero(capacidade.liquida, 1)} horas líquidas`,
                  formula: `Bruta: ${entrada.pessoas} profissionais × ${entrada.dias} dias × ${entrada.jornada} horas. Dedicação: ${entrada.dedicacao}%. Líquida = horas alocadas − suporte − afastamentos − outras indisponibilidades. Não há vínculo com o esforço de uma US nem horas efetivamente utilizadas registradas.`,
                  historias: [],
                })
              }
            />
            <p className="ind-note">
              Carga planejada / FTE simulado:{" "}
              {capacidade.fte && ctx.resumo.pontuadas
                ? `${numero(ctx.resumo.pontos / capacidade.fte, 2)} pontos por FTE`
                : "Não calculável"}
              . Razão de planejamento do cenário, sem equivalência entre horas e
              pontos.
            </p>
          </>
        ) : (
          <EstadoVazio titulo="Preencha os parâmetros do cenário">
            Informe desenvolvedores, dias, jornada e dedicação para calcular a
            capacity simulada.
          </EstadoVazio>
        )}
      </div>
    </details>
  );
}
function CapacityEquipe({ ctx }: { ctx: ContextoProjeto }) {
  const ultima = ctx.sprints.at(-1),
    anterior = ctx.sprints.at(-2),
    nomes = nomesUnicos(
      ultima?.historias.flatMap((h) => h.desenvolvedores) ?? [],
    ),
    antes = nomesUnicos(
      anterior?.historias.flatMap((h) => h.desenvolvedores) ?? [],
    );
  const grupos = [
    {
      titulo: "Primeira associação nesta comparação",
      nomes: nomes.filter((n) => !antes.includes(n)),
    },
    {
      titulo: "Permaneceram nas atribuições",
      nomes: nomes.filter((n) => antes.includes(n)),
    },
    {
      titulo: "Não reapareceram nas atribuições",
      nomes: antes.filter((n) => !nomes.includes(n)),
    },
  ];
  return (
    <>
      <div className="ind-charts-grid">
        <GraficoProjeto
          id="equipe-evolucao"
          titulo="Desenvolvedores disponíveis por sprint"
          periodo={ctx.periodo}
          descricao={`Nomes distintos atribuídos às histórias, contados uma vez por sprint. ${ctx.resumo.semDev} registros do recorte sem desenvolvedor informado.`}
          labels={idsSprint(ctx)}
          tipo="line"
          selecionado={foco(ctx)}
          series={[
            {
              nome: "Desenvolvedores disponíveis",
              cor: CORES[0],
              valores: ctx.sprints.map((s) => s.resumo.desenvolvedores),
            },
            {
              nome: "FTE (não informado)",
              cor: CORES[3],
              valores: ctx.sprints.map(() => null),
            },
          ]}
          onSelecionar={(i) => {
            const sprint = ctx.sprints[i];
            ctx.destacar(sprint.numero);
            ctx.abrir({
              titulo: `Desenvolvedores disponíveis — Sprint ${sprint.numero}`,
              valor: `${sprint.resumo.desenvolvedores} desenvolvedores`,
              formula: `Nomes distintos atribuídos às histórias desta sprint: ${nomesUnicos(sprint.historias.flatMap((h) => h.desenvolvedores)).join(", ") || "nenhum nome informado"}.`,
              historias: sprint.historias.filter(
                (h) => h.desenvolvedores.length,
              ),
            });
          }}
        />
        <article className="ind-panel">
          <h3>Composição das atribuições</h3>
          <p className="ind-muted">
            {anterior && ultima
              ? `Sprint ${anterior.numero} → Sprint ${ultima.numero}`
              : "Selecione pelo menos duas sprints para comparar."}
          </p>
          <p className="ind-note">
            Ausência de um nome na sprint seguinte não comprova desligamento.
          </p>
          {grupos.map((g) => (
            <div key={g.titulo} className="ind-team-group">
              <b>{g.titulo}</b>
              <div className="ind-person-chips">
                {g.nomes.length ? (
                  g.nomes.map((nome) => (
                    <button
                      type="button"
                      key={nome}
                      onClick={() =>
                        ctx.abrir({
                          titulo: `Detalhamento de atividades — ${nome}`,
                          pessoa: nome,
                          formula:
                            "Comparação de nomes efetivamente registrados nas atribuições das duas sprints, sem inferir contratação ou desligamento.",
                          historias: ctx.historias.filter((h) =>
                            h.desenvolvedores.includes(nome),
                          ),
                        })
                      }
                    >
                      {nome}
                    </button>
                  ))
                ) : (
                  <span>Sem ocorrência identificada</span>
                )}
              </div>
            </div>
          ))}
        </article>
      </div>
      <div className="ind-mini-grid">
        <div>
          <span>Capacity bruta histórica</span>
          <strong>Não informado</strong>
        </div>
        <div>
          <span>Capacity líquida histórica</span>
          <strong>Não informado</strong>
        </div>
        <div>
          <span>Horas efetivamente utilizadas</span>
          <strong>Não informado</strong>
        </div>
        <div>
          <span>Carga planejada / FTE disponível</span>
          <strong>Não informado</strong>
          <small>Dedicação e jornada não informadas.</small>
        </div>
      </div>
      <SimuladorCapacity ctx={ctx} />
      <div className="ind-section-heading">
        <div>
          <h2>Demanda e capacidade</h2>
          <p>
            Desenvolvedores contados pelas atribuições. Esforço em pontos e
            capacidade em horas são apresentados separadamente.
          </p>
        </div>
      </div>
      <div className="ind-charts-grid">
        <GraficoProjeto
          id="demanda-historias"
          titulo="Demanda de histórias e conclusão"
          periodo={ctx.periodo}
          labels={idsSprint(ctx)}
          selecionado={foco(ctx)}
          series={[
            {
              nome: "Comprometidas",
              cor: CORES[0],
              valores: ctx.sprints.map((s) => s.resumo.registros),
            },
            {
              nome: "Concluídas",
              cor: CORES[1],
              valores: ctx.sprints.map((s) => s.resumo.concluidas),
            },
          ]}
          onSelecionar={(i, serie) =>
            abrirSprint(
              ctx,
              i,
              "Demanda de histórias",
              serie ? ctx.sprints[i].historias.filter(concluida) : undefined,
            )
          }
        />
        <GraficoProjeto
          id="demanda-pontos"
          titulo="Pontos estimados e conclusão registrada"
          periodo={ctx.periodo}
          labels={idsSprint(ctx)}
          selecionado={foco(ctx)}
          series={[
            {
              nome: "Pontos estimados",
              cor: CORES[0],
              valores: ctx.sprints.map((s) =>
                s.resumo.pontuadas ? s.resumo.pontos : null,
              ),
            },
            {
              nome: "Pontos com conclusão registrada",
              cor: CORES[1],
              valores: ctx.sprints.map((s) => s.resumo.pontosConcluidos),
            },
          ]}
          onSelecionar={(i, serie) =>
            abrirSprint(
              ctx,
              i,
              "Pontos da sprint",
              serie
                ? ctx.sprints[i].historias.filter(concluida)
                : ctx.sprints[i].historias.filter((h) => h.pontos !== null),
            )
          }
        />
      </div>
    </>
  );
}
function GraficoPessoas({
  ctx,
  dimensao,
}: {
  ctx: ContextoProjeto;
  dimensao: "analistas" | "desenvolvedores";
}) {
  const [metrica, setMetrica] = useState<MetricaGrupo>("distintas"),
    [crescente, setCrescente] = useState(false);
  const grupo = agrupar(ctx.historias, dimensao, ctx.primeiras).sort((a, b) => {
    const valor = (g: GrupoProjeto) =>
      metrica === "modulos"
        ? new Set(g.historias.map((h) => h.modulo)).size
        : (g[metrica] ?? -1);
    return (valor(a) - valor(b)) * (crescente ? 1 : -1);
  });
  const porModulo = nomesUnicos(
    ctx.historias.map((h) => h.modulo ?? "Não informado"),
  );
  const series: SerieProjeto[] =
    metrica === "modulos"
      ? porModulo.map((modulo, i) => ({
          nome: modulo,
          cor: CORES[i % CORES.length],
          valores: grupo.map(
            (g) =>
              ultimasHistorias(
                g.historias.filter(
                  (h) => (h.modulo ?? "Não informado") === modulo,
                ),
              ).length,
          ),
        }))
      : [
          {
            nome:
              metrica === "distintas"
                ? "Histórias distintas"
                : metrica === "registros"
                  ? "Registros por sprint"
                  : metrica === "pontos"
                    ? "Pontos estimados"
                    : "Conclusões confirmadas",
            cor: dimensao === "analistas" ? CORES[0] : CORES[1],
            valores: grupo.map((g) =>
              metrica === "pontos" && !g.pontuadas ? null : g[metrica],
            ),
          },
        ];
  const titulo =
    dimensao === "analistas"
      ? "Histórias por analista"
      : "Histórias por desenvolvedor";
  return (
    <div className="ind-people-chart">
      <div className="ind-inline-controls">
        <label>
          Métrica
          <select
            value={metrica}
            onChange={(e) => setMetrica(e.target.value as MetricaGrupo)}
          >
            <option value="distintas">Histórias distintas atribuídas</option>
            <option value="registros">Registros por sprint</option>
            <option value="pontos">Pontos estimados associados</option>
            <option value="concluidas">Histórias concluídas</option>
            <option value="modulos">Distribuição por módulo</option>
          </select>
        </label>
        <label>
          Ordenação
          <select
            value={String(crescente)}
            onChange={(e) => setCrescente(e.target.value === "true")}
          >
            <option value="false">Decrescente</option>
            <option value="true">Crescente</option>
          </select>
        </label>
      </div>
      <GraficoProjeto
        id={`pessoas-${dimensao}`}
        titulo={titulo}
        descricao="Associações registradas na fonte; este gráfico não é um ranking de produtividade individual."
        periodo={ctx.periodo}
        labels={grupo.map((g) => g.nome)}
        series={series}
        horizontal
        empilhado={metrica === "modulos"}
        altura={Math.max(300, grupo.length * 34)}
        onSelecionar={(i, serie) => {
          const g = grupo[i];
          ctx.abrir({
            titulo: `Detalhamento de atividades — ${g.nome}`,
            pessoa: dimensao === "desenvolvedores" ? g.nome : undefined,
            valor: `${g.distintas} histórias distintas · ${g.registros} registros`,
            formula:
              "Uma história compartilhada é associada a cada pessoa participante, mantendo uma única contagem nos totais globais. Pontos associados são os pontos integrais da história e não uma divisão de esforço individual.",
            historias:
              metrica === "modulos"
                ? g.historias.filter(
                    (h) => (h.modulo ?? "Não informado") === porModulo[serie],
                  )
                : g.historias,
          });
        }}
      />
    </div>
  );
}
function DistribuicaoCarga({ ctx }: { ctx: ContextoProjeto }) {
  const [dimensao, setDimensao] = useState<
      "modulo" | "faixa" | "situacao" | "sprint"
    >("sprint"),
    [pontos, setPontos] = useState(false);
  const devs = agrupar(ctx.historias, "desenvolvedores", ctx.primeiras).filter(
    (g) => g.nome !== "Não informado",
  );
  const categoria = (h: HistoriaProjeto) =>
    dimensao === "faixa"
      ? faixaComplexidade(h)
      : dimensao === "sprint"
        ? `Sprint ${h.sprint}`
        : dimensao === "modulo"
          ? (h.modulo ?? "Não informado")
          : h.situacao;
  const categorias = nomesUnicos(ctx.historias.map(categoria));
  return (
    <>
      <div className="ind-inline-controls">
        <label>
          Composição da carga
          <select
            value={dimensao}
            onChange={(e) => setDimensao(e.target.value as typeof dimensao)}
          >
            <option value="sprint">Sprint</option>
            <option value="modulo">Módulo</option>
            <option value="faixa">Faixa de complexidade</option>
            <option value="situacao">Situação</option>
          </select>
        </label>
      </div>
      <GraficoProjeto
        id="carga-distribuicao"
        titulo="Composição das associações por desenvolvedor"
        descricao="Participação em registros de US; pontos não são divididos entre participantes."
        periodo={ctx.periodo}
        labels={devs.map((g) => g.nome)}
        horizontal
        empilhado
        altura={Math.max(320, devs.length * 34)}
        series={categorias.map((cat, i) => ({
          nome: cat,
          cor: CORES[i % CORES.length],
          valores: devs.map(
            (g) => g.historias.filter((h) => categoria(h) === cat).length,
          ),
        }))}
        onSelecionar={(i, serie) =>
          ctx.abrir({
            titulo: `Detalhamento de atividades — ${devs[i].nome}`,
            pessoa: devs[i].nome,
            formula: `Associações na dimensão ${dimensao}: ${categorias[serie]}.`,
            historias: devs[i].historias.filter(
              (h) => categoria(h) === categorias[serie],
            ),
          })
        }
      />
      <article className="ind-panel ind-heatmap">
        <div className="ind-section-heading">
          <div>
            <h3>Mapa de associações por sprint</h3>
            <p>{ctx.periodo}</p>
          </div>
          <label>
            Métrica
            <select
              value={String(pontos)}
              onChange={(e) => setPontos(e.target.value === "true")}
            >
              <option value="false">Quantidade de US</option>
              <option value="true">Pontos registrados</option>
            </select>
          </label>
        </div>
        <div className="ind-table-scroll">
          <table className="ind-table">
            <thead>
              <tr>
                <th>Desenvolvedor</th>
                {ctx.sprints.map((s) => (
                  <th key={s.numero}>Sprint {s.numero}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {devs.map((g) => (
                <tr key={g.nome}>
                  <th>{g.nome}</th>
                  {ctx.sprints.map((s) => {
                    const registros = g.historias.filter(
                        (h) => h.sprint === s.numero,
                      ),
                      valor = pontos
                        ? registros
                            .filter((h) => h.pontos !== null)
                            .reduce((n, h) => n + h.pontos!, 0)
                        : registros.length,
                      informado =
                        registros.length > 0 &&
                        (!pontos || registros.some((h) => h.pontos !== null));
                    return (
                      <td key={s.numero}>
                        <button
                          type="button"
                          className="ind-heat-cell"
                          style={{
                            background: informado
                              ? `rgba(8,123,181,${0.1 + Math.min(0.45, valor / (pontos ? 160 : 24))})`
                              : "#f3f6f9",
                          }}
                          disabled={!informado}
                          title={
                            informado
                              ? `${g.nome} · Sprint ${s.numero} · ${valor} ${pontos ? "pontos" : "US"}`
                              : "Sem associação ou estimativa registrada"
                          }
                          onClick={() =>
                            ctx.abrir({
                              titulo: `${g.nome} — Sprint ${s.numero}`,
                              pessoa: g.nome,
                              valor: `${valor} ${pontos ? "pontos associados" : "US associadas"}`,
                              formula:
                                "Associações efetivamente registradas. Célula neutra representa informação insuficiente; não comprova indisponibilidade da pessoa.",
                              historias: registros,
                            })
                          }
                        >
                          {informado ? valor : "—"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="ind-note">
          Células neutras não indicam desligamento nem disponibilidade.
          Histórias compartilhadas aparecem para cada participante.
        </p>
      </article>
    </>
  );
}
function Pessoas({ ctx }: { ctx: ContextoProjeto }) {
  const devs = agrupar(ctx.historias, "desenvolvedores", ctx.primeiras);
  return (
    <>
      <div className="ind-charts-grid">
        <GraficoPessoas ctx={ctx} dimensao="analistas" />
        <GraficoPessoas ctx={ctx} dimensao="desenvolvedores" />
      </div>
      <div className="ind-table-scroll">
        <table className="ind-table">
          <caption>Associações dos desenvolvedores · {ctx.periodo}</caption>
          <thead>
            <tr>
              <th>Desenvolvedor</th>
              <th>US distintas</th>
              <th>Concluídas</th>
              <th>Pontos associados</th>
              <th>Pontos com conclusão</th>
              <th>Módulos</th>
              <th>Squads registradas</th>
              <th>US compartilhadas</th>
            </tr>
          </thead>
          <tbody>
            {devs.map((g) => (
              <tr key={g.nome}>
                <th>
                  <button
                    type="button"
                    className="ind-code"
                    onClick={() =>
                      ctx.abrir({
                        titulo: `Detalhamento de atividades — ${g.nome}`,
                        pessoa: g.nome,
                        formula:
                          "Participações por desenvolvedor, sem duplicar a história nos totais globais.",
                        historias: g.historias,
                      })
                    }
                  >
                    {g.nome}
                  </button>
                </th>
                <td>{g.distintas}</td>
                <td>{numero(g.concluidas)}</td>
                <td>{g.pontuadas ? g.pontos : "Não informado"}</td>
                <td>{numero(g.pontosConcluidos)}</td>
                <td>
                  {nomesUnicos(
                    g.historias.map((h) => h.modulo ?? "Não informado"),
                  ).join(", ")}
                </td>
                <td>
                  {nomesUnicos(g.historias.flatMap((h) => h.squads)).join(
                    ", ",
                  ) || "Não informado"}
                </td>
                <td>
                  {
                    ultimasHistorias(
                      g.historias.filter((h) => h.desenvolvedores.length > 1),
                    ).length
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DistribuicaoCarga ctx={ctx} />
    </>
  );
}
function Complexidade({ ctx }: { ctx: ContextoProjeto }) {
  const medias = ctx.sprints.map((s) => s.resumo.media),
    ultima = ctx.sprints.at(-1),
    anterior = ctx.sprints.at(-2),
    delta =
      ultima && anterior
        ? variacao(ultima.resumo.media, anterior.resumo.media)
        : null;
  return (
    <>
      <div className="ind-mini-grid">
        <div>
          <span>Complexidade média no recorte</span>
          <strong>{numero(ctx.resumo.media, 2)} pontos</strong>
        </div>
        <div>
          <span>Registros sem estimativa</span>
          <strong>{ctx.resumo.semPontos}</strong>
        </div>
        <div>
          <span>Histórias pontuadas com 8+ pontos</span>
          <strong>{percentual(ctx.resumo.oitoOuMais)}</strong>
        </div>
        <div>
          <span>Última sprint × anterior</span>
          <strong>
            {delta === null
              ? "Não informado"
              : `${delta > 0 ? "+" : ""}${percentual(delta)}`}
          </strong>
          <small>Somente histórias pontuadas.</small>
        </div>
      </div>
      <div className="ind-charts-grid">
        <GraficoProjeto
          id="complexidade-media"
          titulo="Evolução da complexidade média"
          descricao="Estimativas ausentes são excluídas da média; a tendência descreve o recorte e não prevê esforço futuro."
          periodo={ctx.periodo}
          labels={idsSprint(ctx)}
          tipo="line"
          selecionado={foco(ctx)}
          series={[
            { nome: "Média de pontos", cor: CORES[1], valores: medias },
            {
              nome: "Tendência linear no recorte",
              cor: "#8ba4b6",
              valores: tendencia(medias),
              tracejada: true,
            },
          ]}
          onSelecionar={(i) =>
            abrirSprint(
              ctx,
              i,
              "Complexidade da sprint",
              undefined,
              `Média: ${numero(ctx.sprints[i].resumo.media, 2)}. ${ctx.sprints[i].resumo.pontuadas} histórias pontuadas e ${ctx.sprints[i].resumo.semPontos} sem estimativa.`,
            )
          }
        />
        <GraficoProjeto
          id="complexidade-faixas"
          titulo="Distribuição por faixa de complexidade"
          periodo={ctx.periodo}
          labels={idsSprint(ctx)}
          empilhado
          selecionado={foco(ctx)}
          series={FAIXAS.map((faixa, i) => ({
            nome: faixa,
            cor: CORES[i % CORES.length],
            valores: ctx.sprints.map(
              (s) =>
                s.historias.filter((h) => faixaComplexidade(h) === faixa)
                  .length,
            ),
          }))}
          onSelecionar={(i, serie) =>
            abrirSprint(
              ctx,
              i,
              FAIXAS[serie],
              ctx.sprints[i].historias.filter(
                (h) => faixaComplexidade(h) === FAIXAS[serie],
              ),
            )
          }
        />
      </div>
      <GraficoProjeto
        id="complexidade-oito"
        titulo="Participação de histórias com 8 pontos ou mais"
        descricao="Histórias com 8+ pontos / histórias pontuadas × 100. Ausências de estimativa não equivalem a zero."
        periodo={ctx.periodo}
        labels={idsSprint(ctx)}
        tipo="line"
        selecionado={foco(ctx)}
        series={[
          {
            nome: "8+ pontos entre as pontuadas (%)",
            cor: CORES[2],
            valores: ctx.sprints.map((s) => s.resumo.oitoOuMais),
          },
        ]}
        onSelecionar={(i) =>
          abrirSprint(
            ctx,
            i,
            "Histórias com 8 pontos ou mais",
            ctx.sprints[i].historias.filter(
              (h) => h.pontos !== null && h.pontos >= 8,
            ),
          )
        }
      />
    </>
  );
}
function EntregasQualidade({ ctx }: { ctx: ContextoProjeto }) {
  const unicas = ultimasHistorias(ctx.historias),
    conhecidas = unicas.some((h) => h.situacao !== "Não informado"),
    qaDisponivel = unicas.some((h) => h.qaSituacao),
    homDisponivel = unicas.some((h) => h.homologacao);
  const etapas = [
    { nome: "Planejadas", historias: unicas, valor: unicas.length },
    {
      nome: "Desenvolvimento iniciado",
      historias: unicas.filter(iniciada),
      valor: conhecidas ? unicas.filter(iniciada).length : null,
    },
    {
      nome: "Desenvolvimento concluído",
      historias: unicas.filter(concluida),
      valor: ctx.resumo.concluidas,
    },
    {
      nome: "Enviadas para QA",
      historias: unicas.filter((h) => h.qaSituacao),
      valor: qaDisponivel ? unicas.filter((h) => h.qaSituacao).length : null,
    },
    {
      nome: "Aprovadas em QA",
      historias: unicas.filter(qaAprovada),
      valor: qaDisponivel ? unicas.filter(qaAprovada).length : null,
    },
    {
      nome: "Homologadas",
      historias: unicas.filter(homologada),
      valor: homDisponivel ? unicas.filter(homologada).length : null,
    },
  ];
  return (
    <>
      <article className="ind-panel">
        <div className="ind-section-heading">
          <div>
            <h3>Funil de entrega — evidências disponíveis</h3>
            <p>{ctx.periodo} · situação da última aparição de cada US.</p>
          </div>
          <Ajuda texto="A ausência de dados de QA ou homologação não é convertida em zero. Finalizada comprova apenas a conclusão registrada na fonte." />
        </div>
        <div className="ind-funnel">
          {etapas.map((e, i) => (
            <button
              type="button"
              key={e.nome}
              className={e.valor === null ? "is-missing" : ""}
              style={{
                width: `${100 - i * 6}%`,
                animationDelay: `${i * 80}ms`,
              }}
              onClick={() =>
                ctx.abrir({
                  titulo: e.nome,
                  valor: numero(e.valor),
                  formula:
                    e.valor === null
                      ? "Dado de QA/homologação não disponível na fonte atual. Atribuir um responsável QA ou indicar ambiente de teste não comprova aprovação."
                      : "US distintas na última aparição, com evidência explícita da etapa na situação registrada.",
                  historias: e.historias,
                })
              }
            >
              <span>{e.nome}</span>
              <strong>{numero(e.valor)}</strong>
              <small>
                {i === 0
                  ? "Base planejada"
                  : e.valor === null
                    ? "Dado não disponível"
                    : `${percentual(porcentagem(e.valor, unicas.length))} da base · conversão da etapa anterior: ${percentual(etapas[i - 1].valor ? (e.valor / etapas[i - 1].valor!) * 100 : null)}`}
              </small>
            </button>
          ))}
        </div>
        <p className="ind-note">
          Dado de QA/homologação não disponível na fonte atual. A conclusão
          registrada não substitui validação em testes.
        </p>
      </article>
      <div className="ind-charts-grid">
        <GraficoVolume ctx={ctx} id="qualidade-reaparecidas" />
        <GraficoProjeto
          id="reaparecimento-percentual"
          titulo="Percentual de reaparições por sprint"
          periodo={ctx.periodo}
          labels={idsSprint(ctx)}
          tipo="line"
          selecionado={foco(ctx)}
          series={[
            {
              nome: "Reaparições / registros (%)",
              cor: CORES[3],
              valores: ctx.sprints.map((s) =>
                porcentagem(s.resumo.reaparecidas, s.resumo.registros),
              ),
            },
          ]}
          onSelecionar={(i) =>
            abrirSprint(
              ctx,
              i,
              "Reaparições",
              ctx.sprints[i].historias.filter((h) =>
                reapareceu(h, ctx.primeiras),
              ),
              "Reaparição confirma a presença em sprints diferentes. O motivo não está estruturado na fonte; não se presume atraso ou retrabalho.",
            )
          }
        />
      </div>
      <div className="ind-section-heading">
        <div>
          <h2>Qualidade, testes e homologação</h2>
          <p>
            Integração com evidências específicas de QA, defeitos e homologação.
          </p>
        </div>
      </div>
      <div className="ind-quality-grid">
        {[
          "Defeitos por sprint",
          "Histórias devolvidas para correção",
          "Reprovações em QA",
          "Reprovações em homologação",
          "Aprovações sem ressalvas",
          "Tempo médio de correção",
          "Taxa de retrabalho",
        ].map((t) => (
          <article className="ind-panel" key={t}>
            <h3>{t}</h3>
            <strong className="ind-unavailable">Não informado</strong>
            <p>
              Sem registro específico na planilha. Requer integração com Redmine
              ou controle de testes.
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
function SquadsModulos({ ctx }: { ctx: ContextoProjeto }) {
  const [squads, setSquads] = useState<string[]>([]),
    [metrica, setMetrica] = useState<
      | "distintas"
      | "concluidas"
      | "pontos"
      | "media"
      | "reaparecidas"
      | "pontosConcluidos"
      | "disponiveis"
    >("distintas");
  const todas = agrupar(ctx.historias, "squads", ctx.primeiras),
    grupos = todas.filter((g) => !squads.length || squads.includes(g.nome)),
    modulos = agrupar(ctx.historias, "modulo", ctx.primeiras);
  const menus = nomesUnicos(
    ctx.historias.map((h) => h.menu ?? "Não informado"),
  ).map((nome) => ({
    nome,
    historias: ctx.historias.filter(
      (h) => (h.menu ?? "Não informado") === nome,
    ),
  }));
  const opcoes = {
    distintas: "Histórias distintas atribuídas",
    concluidas: "Conclusões confirmadas",
    pontos: "Pontos estimados",
    media: "Complexidade média",
    reaparecidas: "Reaparições",
    pontosConcluidos: "Pontos com conclusão",
    disponiveis: "Desenvolvedores disponíveis",
  };
  return (
    <>
      <div className="ind-inline-controls">
        <label>
          Métrica da squad
          <select
            value={metrica}
            onChange={(e) => setMetrica(e.target.value as typeof metrica)}
          >
            {Object.entries(opcoes).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="ind-squad-selection">
          <legend>Squads no gráfico (sem seleção: todas)</legend>
          {todas.map((g) => (
            <label key={g.nome}>
              <input
                type="checkbox"
                checked={squads.includes(g.nome)}
                onChange={() =>
                  setSquads((v) =>
                    v.includes(g.nome)
                      ? v.filter((n) => n !== g.nome)
                      : [...v, g.nome],
                  )
                }
              />
              {g.nome === "Não informado" ? g.nome : `Squad ${g.nome}`}
            </label>
          ))}
        </fieldset>
      </div>
      <div className="ind-charts-grid">
        <GraficoProjeto
          id="squads-comparativo"
          titulo="Comparativo por squad registrada"
          descricao="Usa exclusivamente a coluna Squad. Números nos textos dos desenvolvedores não são utilizados como composição histórica."
          periodo={ctx.periodo}
          labels={grupos.map((g) =>
            g.nome === "Não informado" ? g.nome : `Squad ${g.nome}`,
          )}
          series={[
            {
              nome: opcoes[metrica],
              cor: CORES[0],
              valores: grupos.map((g) =>
                metrica === "disponiveis"
                  ? g.desenvolvedores
                  : metrica === "pontos" && !g.pontuadas
                    ? null
                    : g[metrica],
              ),
            },
          ]}
          onSelecionar={(i) =>
            ctx.abrir({
              titulo: `Squad ${grupos[i].nome}`,
              valor:
                metrica === "disponiveis"
                  ? `${grupos[i].desenvolvedores} desenvolvedores disponíveis`
                  : `${grupos[i].distintas} histórias distintas`,
              formula:
                metrica === "disponiveis"
                  ? "Quantidade de nomes distintos atribuídos às histórias da squad no período selecionado."
                  : "Agrupamento pela coluna Squad da linha de origem, sem inferir composição histórica a partir de texto livre.",
              historias: grupos[i].historias,
            })
          }
        />
        <GraficoProjeto
          id="modulos-distribuicao"
          titulo="Distribuição por módulo"
          descricao="Classificações da coluna Módulo/Funcionalidade. Clique para aplicar o módulo aos filtros globais."
          periodo={ctx.periodo}
          labels={modulos.map((g) => g.nome)}
          horizontal
          series={[
            {
              nome: "Histórias distintas",
              cor: CORES[1],
              valores: modulos.map((g) => g.distintas),
            },
          ]}
          onSelecionar={(i) => {
            ctx.filtrarModulo(modulos[i].nome);
            ctx.abrir({
              titulo: `Módulo — ${modulos[i].nome}`,
              formula:
                "Filtro global aplicado com base na classificação original Módulo/Funcionalidade.",
              historias: modulos[i].historias,
            });
          }}
        />
      </div>
      <GraficoProjeto
        id="menus-distribuicao"
        titulo="Distribuição por menu de origem"
        descricao="Dimensão complementar da coluna Menu, preservada separadamente da classificação de módulo."
        periodo={ctx.periodo}
        labels={menus.map((g) => g.nome)}
        horizontal
        altura={Math.max(320, menus.length * 34)}
        series={[
          {
            nome: "Histórias distintas",
            cor: CORES[2],
            valores: menus.map((g) => ultimasHistorias(g.historias).length),
          },
        ]}
        onSelecionar={(i) =>
          ctx.abrir({
            titulo: `Menu — ${menus[i].nome}`,
            formula:
              "Histórias associadas ao menu registrado na planilha, sem inventar categorias de módulo.",
            historias: menus[i].historias,
          })
        }
      />
      <div className="ind-table-scroll">
        <table className="ind-table">
          <caption>Módulos e respectivas associações · {ctx.periodo}</caption>
          <thead>
            <tr>
              <th>Módulo</th>
              <th>US distintas</th>
              <th>Pontos</th>
              <th>Desenvolvedores associados</th>
              <th>Analistas</th>
              <th>Sprints</th>
              <th>Situações</th>
            </tr>
          </thead>
          <tbody>
            {modulos.map((g) => (
              <tr key={g.nome}>
                <th>
                  <button
                    className="ind-code"
                    type="button"
                    onClick={() => ctx.filtrarModulo(g.nome)}
                  >
                    {g.nome}
                  </button>
                </th>
                <td>{g.distintas}</td>
                <td>{g.pontuadas ? g.pontos : "Não informado"}</td>
                <td>
                  {nomesUnicos(
                    g.historias.flatMap((h) => h.desenvolvedores),
                  ).join(", ") || "Não informado"}
                </td>
                <td>
                  {nomesUnicos(g.historias.flatMap((h) => h.analistas)).join(
                    ", ",
                  )}
                </td>
                <td>
                  {[...new Set(g.historias.map((h) => h.sprint))]
                    .sort((a, b) => a - b)
                    .join(", ")}
                </td>
                <td>
                  {nomesUnicos(g.historias.map((h) => h.situacao)).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function RiscosInsights({ ctx }: { ctx: ContextoProjeto }) {
  const insights = gerarInsights(ctx.historias, ctx.primeiras);
  return (
    <>
      <div className="ind-section-heading">
        <div>
          <h2>O que os indicadores estão nos mostrando?</h2>
          <p>
            Regras determinísticas, dados rastreáveis e perguntas para apoiar a
            discussão do time.
          </p>
        </div>
      </div>
      <div className="ind-insights-grid">
        {insights.map((i) => (
          <CardInsight
            key={i.id}
            insight={i}
            onClick={() =>
              ctx.abrir({
                titulo: i.titulo,
                valor: i.valor,
                formula: `${i.explicacao} ${i.impacto} Pergunta para o time: ${i.pergunta}`,
                historias: i.historias,
              })
            }
          />
        ))}
      </div>
      <article className="ind-panel">
        <h3>Qualidade e rastreabilidade da base</h3>
        <div className="ind-mini-grid">
          <div>
            <span>Sem desenvolvedor</span>
            <strong>{ctx.resumo.semDev}</strong>
          </div>
          <div>
            <span>Sem estimativa</span>
            <strong>{ctx.resumo.semPontos}</strong>
          </div>
          <div>
            <span>Sem situação</span>
            <strong>{ctx.resumo.semSituacao}</strong>
          </div>
          <div>
            <span>Históricos fora do período ignorados</span>
            <strong>{ctx.dados.historicosIgnorados}</strong>
          </div>
        </div>
        <ul className="ind-source-warnings">
          {ctx.dados.avisos.map((a, i) => (
            <li key={`${a.tipo}-${i}`}>
              {a.mensagem}
              {a.linhas?.length ? ` Linhas: ${a.linhas.join(", ")}.` : ""}
            </li>
          ))}
        </ul>
      </article>
    </>
  );
}
export const AbasProjeto = memo(function AbasProjeto({
  aba,
  ctx,
}: {
  aba: string;
  ctx: ContextoProjeto;
}) {
  if (!ctx.historias.length)
    return (
      <EstadoVazio titulo="Nenhuma história encontrada">
        Ajuste os filtros para consultar os dados do período. Os indicadores não
        são preenchidos com valores fictícios.
      </EstadoVazio>
    );
  if (aba === "visao") return <VisaoGeral ctx={ctx} />;
  if (aba === "sprints") return <EvolucaoSprints ctx={ctx} />;
  if (aba === "capacity") return <CapacityEquipe ctx={ctx} />;
  if (aba === "pessoas") return <Pessoas ctx={ctx} />;
  if (aba === "complexidade") return <Complexidade ctx={ctx} />;
  if (aba === "qualidade") return <EntregasQualidade ctx={ctx} />;
  if (aba === "squads") return <SquadsModulos ctx={ctx} />;
  return <RiscosInsights ctx={ctx} />;
});
