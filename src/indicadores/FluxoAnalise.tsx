import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Dialog } from "primereact/dialog";
import { Sidebar } from "primereact/sidebar";
import {
  FiActivity,
  FiDownload,
  FiFilter,
  FiPlus,
  FiSettings,
  FiUpload,
} from "react-icons/fi";
import type { ContextoProjeto } from "./AbasProjeto";
import { EstadoVazio, KpiProjeto } from "./ComponentesProjeto";
import {
  criarIdRegistroAnalise,
  diasUteis,
  distintas,
  faixaPontos,
  liquida,
  media,
  novaBaseAnalise,
  percentil,
  validarBaseAnalise,
  type BaseAnalise,
} from "./analiseModelo";
import { filtrarHistorias, nomesUnicos, numero } from "./modelo";
import { baixarArquivo } from "./exportacoes";
import { GraficoFluxo, type SerieFluxo, type PontoFluxo } from "./GraficoFluxo";
import { graficosFluxo } from "./registroFluxo";
import {
  ATIVAS_FLUXO,
  CHAVE_FLUXO,
  ETAPAS_FLUXO,
  MOTIVOS_BLOQUEIO,
  MOTIVOS_ESPERA,
  auditarSequenciaFluxo,
  diasImpedimento,
  capacityFluxo,
  conclusoesFluxo,
  dataCuiaba,
  datasEntre,
  diaMovimento,
  estadosEm,
  fluxoSprint,
  limiteIdade,
  novoFluxo,
  picoObservadoFluxo,
  resumirCiclos,
  serieHistorica,
  unirMovimentos,
  validarFluxo,
  type DadosFluxo,
  type EstadoFluxo,
  type EtapaFluxo,
  type ImpedimentoFluxo,
  type MovimentoFluxo,
} from "./fluxoModelo";
import "./fluxoAnalise.css";

const CORES = [
  "#087bb5",
  "#10a69c",
  "#5b7cc7",
  "#e2a43c",
  "#8c78b8",
  "#52978a",
  "#de8766",
  "#679fc0",
];
const FAIXAS = [
  "1 a 3 pontos",
  "5 pontos",
  "8 pontos",
  "13 pontos",
  "Outras pontuações",
  "Sem pontuação",
];
const TODOS_DESTINOS = [
  ...ETAPAS_FLUXO,
  "Cancelada",
  "Suspensa",
] as EtapaFluxo[];
type FiltrosFluxo = {
  analistas: string[];
  complexidade: string;
  etapa: string;
  situacao: string;
  bloqueadas: boolean;
};
const filtrosVazios = (): FiltrosFluxo => ({
  analistas: [],
  complexidade: "",
  etapa: "",
  situacao: "",
  bloqueadas: false,
});
type DetalheFluxo = {
  titulo: string;
  formula: string;
  estados: EstadoFluxo[];
  movimentos?: MovimentoFluxo[];
  bloqueios?: ImpedimentoFluxo[];
  alocacoes?: BaseAnalise["alocacoes"];
};
function lerBases() {
  let analise: BaseAnalise = novaBaseAnalise(),
    fluxo: DadosFluxo = novoFluxo();
  const avisos: string[] = [];
  try {
    const raw = localStorage.getItem("sigep:analise:v1");
    if (raw) {
      const b: unknown = JSON.parse(raw);
      if (!validarBaseAnalise(b)) throw Error();
      analise = b;
    }
  } catch {
    avisos.push(
      "Os registros complementares da análise não puderam ser lidos. A base salva foi preservada.",
    );
  }
  try {
    const raw = localStorage.getItem(CHAVE_FLUXO);
    if (raw) {
      const b: unknown = JSON.parse(raw);
      if (!validarFluxo(b)) throw Error();
      fluxo = b;
    }
  } catch {
    avisos.push(
      "O histórico WIP salvo não pôde ser lido. Faça uma cópia do armazenamento antes de substituí-lo.",
    );
  }
  return { analise, fluxo, avisos };
}
export default function FluxoAnalise({ ctx }: { ctx: ContextoProjeto }) {
  const [carregados] = useState(lerBases),
    base = carregados.analise;
  const [fluxo, setFluxo] = useState(carregados.fluxo),
    [mensagem, setMensagem] = useState(carregados.avisos.join(" "));
  const [hoje] = useState(() => dataCuiaba(new Date().toISOString()));
  const [rascunho, setRascunho] = useState(filtrosVazios),
    [filtros, setFiltros] = useState(filtrosVazios);
  const [modal, setModal] = useState(""),
    [detalhe, setDetalhe] = useState<DetalheFluxo | null>(null),
    [historiaSelecionada, setHistoriaSelecionada] = useState("");
  const [referenciaEscolhida, setReferenciaEscolhida] = useState(""),
    [modoWip, setModoWip] = useState("WIP atual"),
    [granularidade, setGranularidade] = useState("Diária"),
    [grupoThroughput, setGrupoThroughput] = useState("Sprint"),
    [corPontos, setCorPontos] = useState("Complexidade"),
    [grupoEficiencia, setGrupoEficiencia] = useState("Sprint");
  const [tipoImpedimento, setTipoImpedimento] = useState<"Bloqueio" | "Espera">(
      "Bloqueio",
    ),
    [encerrar, setEncerrar] = useState<ImpedimentoFluxo | null>(null),
    [ocupado, setOcupado] = useState(false);
  const [simEquipe, setSimEquipe] = useState(""),
    [simAnalistas, setSimAnalistas] = useState<Record<string, string>>({}),
    [simEtapas, setSimEtapas] = useState<Record<string, string>>({});
  const [analistaDetalhe, setAnalistaDetalhe] = useState(""),
    [etapaDetalhe, setEtapaDetalhe] = useState("");
  const arquivo = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const limpar = () => {
      setFiltros(filtrosVazios());
      setRascunho(filtrosVazios());
      setReferenciaEscolhida("");
    };
    const relatorio = () => setModal("relatorio");
    window.addEventListener("sigep:analise-limpar", limpar);
    window.addEventListener("sigep:fluxo-relatorio", relatorio);
    return () => {
      window.removeEventListener("sigep:analise-limpar", limpar);
      window.removeEventListener("sigep:fluxo-relatorio", relatorio);
    };
  }, []);
  const salvar = (proximo: DadosFluxo) => {
    if (!validarFluxo(proximo)) {
      setMensagem(
        "Confira os registros e limites. Datas devem incluir fuso horário e valores não podem ser negativos. Os dados anteriores foram preservados.",
      );
      return false;
    }
    const inconsistencia = auditarSequenciaFluxo(unirMovimentos(base, proximo));
    if (inconsistencia) {
      setMensagem(
        `Histórico inconsistente: ${inconsistencia} Os registros anteriores foram preservados.`,
      );
      return false;
    }
    try {
      const anterior = localStorage.getItem(CHAVE_FLUXO);
      if (
        carregados.avisos.length &&
        anterior &&
        !localStorage.getItem(`${CHAVE_FLUXO}:recuperacao`)
      )
        localStorage.setItem(`${CHAVE_FLUXO}:recuperacao`, anterior);
      localStorage.setItem(CHAVE_FLUXO, JSON.stringify(proximo));
      setFluxo(proximo);
      setMensagem(
        "Histórico salvo neste navegador. O status oficial da planilha e do Redmine não foi alterado.",
      );
      return true;
    } catch {
      setMensagem(
        "Não foi possível salvar. Nenhum registro foi alterado. Exporte um backup e verifique o armazenamento do navegador.",
      );
      return false;
    }
  };
  const sprintInicial = ctx.dados.sprints.find(
      (s) => s.numero === ctx.filtros.inicial,
    ),
    sprintFinal = ctx.dados.sprints.find((s) => s.numero === ctx.filtros.final);
  const inicio = sprintInicial?.inicio ?? "",
    limiteFim = sprintFinal?.fim ?? hoje,
    maxRef = limiteFim < hoje ? limiteFim : hoje;
  const referencia =
    referenciaEscolhida &&
    referenciaEscolhida >= inicio &&
    referenciaEscolhida <= maxRef
      ? referenciaEscolhida
      : maxRef;
  const movimentos = useMemo(() => unirMovimentos(base, fluxo), [base, fluxo]);
  const candidatas = useMemo(
    () =>
      distintas(
        filtrarHistorias(ctx.dados, {
          ...ctx.filtros,
          inicial: 18,
          analista: "",
        }),
      ),
    [ctx.dados, ctx.filtros],
  );
  const todosEstados = useMemo(
    () =>
      estadosEm(
        candidatas,
        movimentos,
        fluxo.impedimentos,
        referencia,
        base.config.feriados,
      ),
    [
      candidatas,
      movimentos,
      fluxo.impedimentos,
      referencia,
      base.config.feriados,
    ],
  );
  const estadoAceito = (e: EstadoFluxo) =>
    (!ctx.filtros.analista || e.analista === ctx.filtros.analista) &&
    (!filtros.analistas.length || filtros.analistas.includes(e.analista)) &&
    (!filtros.complexidade ||
      faixaPontos(e.historia.pontos) === filtros.complexidade) &&
    (!filtros.etapa || e.etapa === filtros.etapa) &&
    (!filtros.situacao ||
      (filtros.situacao === "Em andamento"
        ? e.wip
        : filtros.situacao === "Aprovada"
          ? e.etapa === "Pronta para Desenvolvimento"
          : e.etapa === filtros.situacao)) &&
    (!filtros.bloqueadas || (e.wip && e.bloqueios.length > 0));
  const estados = todosEstados.filter(estadoAceito),
    ids = new Set(estados.map((e) => e.historia.codigo)),
    historias = estados.map((e) => e.historia),
    ms = movimentos.filter((m) => ids.has(m.us));
  const conhecidos = estados.length > 0,
    abertas = estados.filter((e) => e.wip),
    aprovadas = conclusoesFluxo(
      ms,
      base,
      inicio,
      referencia,
      fluxo.limites.horasDia,
      fluxo.limites.apontamentosCompletos,
    ),
    ciclos = resumirCiclos(aprovadas);
  const nomes = nomesUnicos([
      ...ctx.dados.historias.flatMap((h) => h.analistas),
      ...movimentos.map((m) => m.analista),
      ...base.alocacoes.map((a) => a.analista),
    ]),
    analistas = nomesUnicos([
      ...estados.map((e) => e.analista),
      ...aprovadas.map((a) => a.analista),
    ]);
  const dias = datasEntre(inicio, referencia);
  const historico = serieHistorica(
    historias,
    ms,
    fluxo.impedimentos,
    dias,
    base.config.feriados,
  );
  const diasUteisPeriodo = new Set(
    datasEntre(inicio, referencia, true, base.config.feriados),
  );
  const histUteis = historico.filter((h) => diasUteisPeriodo.has(h.dia));
  const sprints = ctx.dados.sprints.filter(
    (s) => s.numero >= ctx.filtros.inicial && s.numero <= ctx.filtros.final,
  );
  const porSprint = sprints.map((s) => {
    const d = histUteis.filter(
      (h) => h.dia >= s.inicio && (!s.fim || h.dia <= s.fim),
    );
    const vs = d.flatMap((h) => (h.wip === null ? [] : [h.wip]));
    const fim = s.fim && s.fim < referencia ? s.fim : referencia;
    const hs =
      s.inicio <= referencia
        ? estadosEm(
            historias,
            ms,
            fluxo.impedimentos,
            fim,
            base.config.feriados,
          )
        : [];
    const fluxoS = fluxoSprint(ms, s, referencia);
    return {
      sprint: s.numero,
      inicio: s.inicio,
      fim,
      media: media(vs),
      pico: picoObservadoFluxo(historias, ms, s.inicio, fim, histUteis),
      final: hs.length ? hs.filter((e) => e.wip).length : null,
      aprovadas: aprovadas.filter(
        (a) => a.aprovacao >= s.inicio && (!s.fim || a.aprovacao <= s.fim),
      ),
      ...fluxoS,
    };
  });
  const bloqueios = fluxo.impedimentos.filter(
    (b) =>
      ids.has(b.us) &&
      dataCuiaba(b.inicio) <= referencia &&
      (!b.fim || dataCuiaba(b.fim) >= inicio),
  );
  const filtroPessoas = filtros.analistas.length
    ? filtros.analistas
    : ctx.filtros.analista
      ? [ctx.filtros.analista]
      : [];
  const capacityRestrita = Boolean(
    ctx.filtros.modulo ||
    ctx.filtros.squad ||
    ctx.filtros.desenvolvedor ||
    ctx.filtros.situacao ||
    filtros.complexidade ||
    filtros.etapa ||
    filtros.situacao ||
    filtros.bloqueadas,
  );
  const capacidades = sprints.map((s) =>
    capacityRestrita ? null : capacityFluxo(base, s.numero, filtroPessoas),
  );
  const idades = abertas.flatMap((e) => (e.idade === null ? [] : [e.idade])),
    envelhecidas = abertas.filter((e) => {
      const l = limiteIdade(e, fluxo.limites);
      return l && e.idade !== null && e.idade > l.atencao;
    });
  const temLimitesIdade = abertas.some((e) => limiteIdade(e, fluxo.limites));
  const filtrosTexto = `${ctx.periodo} · posição ${referencia} · ${ctx.filtros.analista || filtros.analistas.join(", ") || "Todos os analistas"} · ${ctx.filtros.modulo || "Todos os módulos"} · ${ctx.filtros.squad || "Todas as squads"} · ${filtros.complexidade || "Todas as complexidades"} · ${filtros.etapa || "Todas as etapas"} · ${filtros.situacao || "Todas as situações do fluxo"} · bloqueadas: ${filtros.bloqueadas ? "Sim" : "Não"} · situação da história: ${ctx.filtros.situacao || "Todas"} · desenvolvedor: ${ctx.filtros.desenvolvedor || "Todos"}`;
  const abrir = (
    titulo: string,
    formula: string,
    selecionados = estados,
    movimentosDetalhe?: MovimentoFluxo[],
    impedimentos?: ImpedimentoFluxo[],
    alocacoes?: BaseAnalise["alocacoes"],
  ) => {
    setAnalistaDetalhe("");
    setEtapaDetalhe("");
    setHistoriaSelecionada("");
    setDetalhe({
      titulo,
      formula,
      estados: selecionados,
      movimentos: movimentosDetalhe,
      bloqueios: impedimentos,
      alocacoes,
    });
  };
  const abrirHistoria = (e: EstadoFluxo) => {
    abrir(
      `${e.historia.codigo} · ${e.historia.titulo}`,
      "Movimentações reais. Datas sem horário preservam precisão diária; suporte de desenvolvimento/QA não reabre análise.",
      [e],
      e.historico,
      fluxo.impedimentos.filter((b) => b.us === e.historia.codigo),
    );
    setHistoriaSelecionada(e.historia.codigo);
  };
  const series = (
    nome: string,
    valores: SerieFluxo["valores"],
    i: number,
    tipo?: "line",
    tracejada = false,
  ): SerieFluxo => ({
    nome,
    valores,
    cor: CORES[i % CORES.length],
    tipo,
    tracejada,
  });
  const grafico = (
    id: string,
    titulo: string,
    labels: string[],
    ss: SerieFluxo[],
    unidade: string,
    formula: string,
    clique?: (i: number, j: number) => void,
    opcoes: {
      tipo?: "bar" | "line" | "scatter";
      empilhado?: boolean;
      horizontal?: boolean;
      area?: boolean;
      datas?: boolean;
    } = {},
  ) => (
    <GraficoFluxo
      id={id}
      titulo={titulo}
      periodo={ctx.periodo}
      labels={labels}
      series={ss}
      unidade={unidade}
      descricao={formula}
      {...opcoes}
      onSelecionar={
        clique ??
        ((i, j) => {
          const sprint = sprints.find(
            (s) =>
              String(s.numero) === labels[i] ||
              `Sprint ${s.numero}` === labels[i],
          );
          const fim =
            sprint?.fim && sprint.fim < referencia ? sprint.fim : referencia;
          const bs = bloqueios.filter(
            (b) =>
              !sprint ||
              (dataCuiaba(b.inicio) <= fim &&
                (!b.fim || dataCuiaba(b.fim) >= sprint.inicio)),
          );
          const es = sprint
            ? estadosEm(
                historias,
                ms,
                fluxo.impedimentos,
                fim,
                base.config.feriados,
              )
            : estados;
          abrir(
            `${titulo} · ${labels[i] ?? ss[j].nome}`,
            formula,
            id === "bloqueios-sprint"
              ? es.filter((e) =>
                  bs.some(
                    (b) => b.tipo === "Bloqueio" && b.us === e.historia.codigo,
                  ),
                )
              : es,
            ms.filter((m) => !sprint || diaMovimento(m) <= fim),
            bs,
          );
        })
      }
    />
  );
  const anteriorSprint = ctx.dados.sprints.find(
      (s) => s.numero === ctx.filtros.inicial - 1,
    ),
    anteriorFim = anteriorSprint?.fim;
  const estadosAnteriores = anteriorFim
    ? estadosEm(
        historias,
        ms,
        fluxo.impedimentos,
        anteriorFim,
        base.config.feriados,
      )
    : [];
  const wipAnterior = estadosAnteriores.length
    ? estadosAnteriores.filter((e) => e.wip).length
    : null;
  const kpis = [
    {
      titulo: "WIP atual",
      valor: conhecidos ? abertas.length : null,
      formula:
        "US distintas nas etapas Levantamento, Especificação/Prototipação, Validação ou Ajustes. Backlog, aprovação, cancelamento e suspensão ficam fora. Posição ao final da data selecionada.",
      nota: `${abertas.length} US com etapa ativa confirmada`,
      registros: abertas,
      anterior: wipAnterior,
    },
    {
      titulo: "Limite de WIP",
      valor: fluxo.limites.equipe,
      formula:
        "Limite de equipe explicitamente configurado. Não é inferido da jornada ou do número de analistas.",
      nota: "Parâmetro de gestão da equipe",
      registros: abertas,
    },
    {
      titulo: "Utilização do limite",
      valor:
        conhecidos && fluxo.limites.equipe !== null && fluxo.limites.equipe > 0
          ? (abertas.length / fluxo.limites.equipe) * 100
          : null,
      formula:
        "WIP atual / limite da equipe × 100. Limite zero não permite divisão.",
      nota: "Limite global da equipe · não é uma meta",
      registros: abertas,
      sufixo: "%",
    },
    {
      titulo: "Throughput",
      valor: conhecidos ? aprovadas.length : null,
      formula:
        "Quantidade de US distintas com entrada explícita em Pronta para Desenvolvimento no período. Não usa atribuições nem situação de desenvolvimento. Mais de uma aprovação da mesma US no período conta uma vez.",
      nota: `${aprovadas.length} US aprovadas no período`,
      registros: estados.filter((e) =>
        aprovadas.some((a) => a.us === e.historia.codigo),
      ),
      anterior:
        ctx.filtros.inicial === ctx.filtros.final &&
        anteriorSprint &&
        anteriorFim &&
        ms.some((m) => diaMovimento(m) <= anteriorFim)
          ? conclusoesFluxo(
              ms,
              base,
              anteriorSprint.inicio,
              anteriorFim,
              fluxo.limites.horasDia,
            ).length
          : null,
    },
    {
      titulo: "Cycle Time médio",
      valor: ciclos.media,
      formula:
        "Média de dias úteis entre início real do levantamento e aprovação final de US concluídas no período. Inclui espera; exclui data inicial, fins de semana e feriados cadastrados.",
      nota: `${aprovadas.filter((a) => a.ciclo !== null).length}/${aprovadas.length} aprovações com início conhecido`,
      registros: estados.filter((e) =>
        aprovadas.some((a) => a.us === e.historia.codigo && a.ciclo !== null),
      ),
      sufixo: " d",
    },
    {
      titulo: "Cycle Time P85",
      valor: ciclos.p85,
      formula:
        "Percentil 85 dos tempos de ciclo conhecidos das US aprovadas. Interpolação linear; não inclui histórias abertas.",
      nota: "85% da amostra de ciclos conhecidos",
      registros: estados.filter((e) =>
        aprovadas.some((a) => a.us === e.historia.codigo && a.ciclo !== null),
      ),
      sufixo: " d",
    },
    {
      titulo: "Histórias bloqueadas",
      valor: conhecidos
        ? abertas.filter((e) => e.bloqueios.length).length
        : null,
      formula:
        "US em WIP com intervalo explícito de bloqueio aberto na data de posição. Aguardar validação não comprova impedimento.",
      nota: "Somente impedimentos registrados",
      registros: abertas.filter((e) => e.bloqueios.length),
      anterior: estadosAnteriores.length
        ? estadosAnteriores.filter((e) => e.wip && e.bloqueios.length).length
        : null,
    },
    {
      titulo: "Aging WIP",
      valor: conhecidos && temLimitesIdade ? envelhecidas.length : null,
      formula:
        "US em WIP com idade em dias úteis acima do limite de atenção configurado para sua faixa de complexidade. Sem início ou limite conhecido não há classificação.",
      nota: `${abertas.filter((e) => e.idade !== null && limiteIdade(e, fluxo.limites)).length}/${abertas.length} US classificáveis`,
      registros: envelhecidas,
    },
  ];
  const historicoCfd =
    granularidade === "Diária"
      ? historico
      : granularidade === "Semanal"
        ? historico.filter(
            (h, i) =>
              new Date(`${h.dia}T12:00:00Z`).getUTCDay() === 5 ||
              i === historico.length - 1,
          )
        : porSprint
            .map((s) => historico.find((h) => h.dia === s.fim))
            .filter((h): h is (typeof historico)[number] => !!h);
  const gruposThroughput =
    grupoThroughput === "Sprint"
      ? sprints.map((s) => String(s.numero))
      : grupoThroughput === "Analista"
        ? analistas
        : grupoThroughput === "Módulo"
          ? nomesUnicos(historias.map((h) => h.modulo ?? "Não informado"))
          : FAIXAS;
  const aprovacoesGrupo = (g: string) =>
    aprovadas.filter((a) =>
      grupoThroughput === "Sprint"
        ? porSprint
            .find((s) => String(s.sprint) === g)
            ?.aprovadas.some((x) => x.us === a.us)
        : grupoThroughput === "Analista"
          ? a.analista === g
          : grupoThroughput === "Módulo"
            ? (historias.find((h) => h.codigo === a.us)?.modulo ??
                "Não informado") === g
            : faixaPontos(
                historias.find((h) => h.codigo === a.us)?.pontos ?? null,
              ) === g,
    );
  const gruposCor =
    corPontos === "Analista"
      ? analistas
      : corPontos === "Módulo"
        ? nomesUnicos(historias.map((h) => h.modulo ?? "Não informado"))
        : corPontos === "Sprint"
          ? sprints.map((s) => String(s.numero))
          : FAIXAS;
  const corGrupo = (us: string, analista: string, aprovacao?: string) => {
    const h = historias.find((h) => h.codigo === us);
    return corPontos === "Analista"
      ? analista
      : corPontos === "Módulo"
        ? (h?.modulo ?? "Não informado")
        : corPontos === "Sprint"
          ? String(
              sprints.find(
                (s) =>
                  (aprovacao ?? referencia) >= s.inicio &&
                  (!s.fim || (aprovacao ?? referencia) <= s.fim),
              )?.numero ?? "Sem sprint",
            )
          : faixaPontos(h?.pontos ?? null);
  };
  const pontosCycle = gruposCor.map((g, i) =>
    series(
      g,
      aprovadas
        .filter(
          (a) =>
            a.ciclo !== null && corGrupo(a.us, a.analista, a.aprovacao) === g,
        )
        .map((a) => ({
          x: Date.parse(`${a.aprovacao}T00:00:00Z`),
          y: a.ciclo!,
          us: a.us,
          label: `Aprovação ${a.aprovacao}`,
        })),
      i,
    ),
  );
  const gruposEf =
    grupoEficiencia === "Sprint"
      ? sprints.map((s) => String(s.numero))
      : grupoEficiencia === "Analista"
        ? analistas
        : FAIXAS;
  const eficienciaGrupo = (g: string) =>
    aprovadas.filter(
      (a) =>
        a.eficiencia !== null &&
        (grupoEficiencia === "Sprint"
          ? porSprint
              .find((s) => String(s.sprint) === g)
              ?.aprovadas.some((x) => x.us === a.us)
          : grupoEficiencia === "Analista"
            ? a.analista === g
            : faixaPontos(
                historias.find((h) => h.codigo === a.us)?.pontos ?? null,
              ) === g),
    );
  const resumoFluxo = porSprint.map((s) => ({
    sprint: s.sprint,
    entradas: s.entradas.length,
    novas: s.novas.length,
    retomadas: s.retomadas.length,
    iniciosAusentes: s.iniciosDesconhecidos.length,
    aprovadas: s.aprovadas.length,
    outrasSaidas: s.saidas.filter(
      (m) => m.destino !== "Pronta para Desenvolvimento",
    ).length,
    wip: s.final,
    media: s.media,
    pico: s.pico,
  }));
  const saldoEntradas = porSprint.reduce((v, s) => v + s.entradas.length, 0),
    saldoSaidas = porSprint.reduce((v, s) => v + s.saidas.length, 0);
  const insight =
    conhecidos &&
    porSprint.every((s) => s.iniciosDesconhecidos.length === 0) &&
    saldoEntradas > saldoSaidas
      ? "O volume iniciado ou retomado superou as saídas registradas, contribuindo para o aumento do WIP observado."
      : null;
  const tabelaEstados = (linhas: EstadoFluxo[]) => (
    <div className="ind-table-scroll">
      <table className="ind-table">
        <thead>
          <tr>
            {[
              "US / título",
              "Analista / módulo",
              "Etapa",
              "Início do fluxo",
              "Idade / etapa (dias úteis)",
              "Complexidade",
              "Situação / impedimento",
            ].map((t) => (
              <th key={t}>{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((e) => (
            <tr key={e.historia.codigo}>
              <td>
                <button
                  type="button"
                  className="ind-code"
                  onClick={() => abrirHistoria(e)}
                >
                  {e.historia.codigo}
                </button>
                <small>{e.historia.titulo}</small>
              </td>
              <td>
                {e.analista}
                <small>{e.historia.modulo ?? "Não informado"}</small>
              </td>
              <td>{e.etapa}</td>
              <td>{e.inicio ?? "Não informado"}</td>
              <td>
                {numero(e.idade)} / {numero(e.idadeEtapa)}
                {e.wip && (
                  <small
                    className={`fluxo-faixa-idade ${e.idade !== null && limiteIdade(e, fluxo.limites) && e.idade > limiteIdade(e, fluxo.limites)!.critico ? "is-critico" : e.idade !== null && limiteIdade(e, fluxo.limites) && e.idade > limiteIdade(e, fluxo.limites)!.atencao ? "is-atencao" : ""}`}
                  >
                    {e.idade === null
                      ? "Início não registrado"
                      : !limiteIdade(e, fluxo.limites)
                        ? "Sem prazo para esta complexidade"
                        : e.idade > limiteIdade(e, fluxo.limites)!.critico
                          ? "Crítico"
                          : e.idade > limiteIdade(e, fluxo.limites)!.atencao
                            ? "Atenção"
                            : "Dentro do prazo esperado"}
                  </small>
                )}
              </td>
              <td>
                {e.historia.pontos ?? "Sem pontuação"}
                <small>Story points</small>
              </td>
              <td>
                {e.wip ? "Em andamento" : e.etapa}
                <small>
                  {e.bloqueios.map((b) => b.motivo).join("; ") ||
                    "Sem bloqueio explícito"}
                </small>
              </td>
            </tr>
          ))}
          {!linhas.length && (
            <tr>
              <td colSpan={7}>
                <EstadoVazio titulo="Nenhuma história neste recorte">
                  Ajuste os filtros ou registre histórico complementar.
                </EstadoVazio>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  const registrar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget),
      txt = (k: string) => String(fd.get(k) ?? "").trim(),
      n = (k: string) => Number(txt(k)),
      opcional = (k: string) => (txt(k) === "" ? null : n(k)),
      id = criarIdRegistroAnalise();
    const horario = (k: string) =>
      `${txt(k)}${txt(k).length === 16 ? ":00" : ""}-04:00`;
    if (modal === "movimento") {
      const us = txt("us"),
        instante = horario("instante"),
        destino = txt("destino") as EtapaFluxo,
        analista = txt("analista"),
        anteriores = movimentos.filter((m) => m.us === us),
        ultimo = anteriores.at(-1);
      if (ultimo && diaMovimento(ultimo) > dataCuiaba(instante)) {
        setMensagem(
          "Para inserir eventos anteriores ao último registro, utilize a importação de histórico.",
        );
        return;
      }
      if (
        ultimo &&
        ultimo.precisao === "instante" &&
        Date.parse(instante) < Date.parse(ultimo.instante)
      ) {
        setMensagem(
          "A movimentação deve ser posterior ao último horário registrado.",
        );
        return;
      }
      if (ultimo?.destino === destino) {
        setMensagem(
          "A história já está nesta etapa. Registre um bloqueio ou espera sem criar uma movimentação duplicada.",
        );
        return;
      }
      if (
        ultimo &&
        ["Pronta para Desenvolvimento", "Cancelada", "Suspensa"].includes(
          ultimo.destino,
        ) &&
        ATIVAS_FLUXO.includes(destino) &&
        !txt("motivo")
      ) {
        setMensagem("Informe o motivo da reabertura ou retomada explícita.");
        return;
      }
      if (
        ultimo?.destino === "Backlog" &&
        destino === "Pronta para Desenvolvimento"
      ) {
        setMensagem(
          "Registre o início e a passagem pelo fluxo antes da aprovação.",
        );
        return;
      }
      if (
        salvar({
          ...fluxo,
          movimentos: [
            ...fluxo.movimentos,
            {
              id,
              us,
              origem: ultimo?.destino ?? null,
              destino,
              instante,
              analista,
              motivo: txt("motivo"),
              fonte: "Registro WIP",
              precisao: "instante",
            },
          ],
        })
      )
        setModal("");
    } else if (modal === "impedimento") {
      if (
        salvar({
          ...fluxo,
          impedimentos: [
            ...fluxo.impedimentos,
            {
              id,
              us: txt("us"),
              inicio: horario("inicio"),
              fim: txt("fim") ? horario("fim") : null,
              motivo: txt("motivo"),
              responsavel: txt("responsavel"),
              observacao: txt("observacao"),
              tipo: tipoImpedimento,
            },
          ],
        })
      )
        setModal("");
    } else if (modal === "encerrar" && encerrar) {
      if (
        salvar({
          ...fluxo,
          impedimentos: fluxo.impedimentos.map((b) =>
            b.id === encerrar.id ? { ...b, fim: horario("fim") } : b,
          ),
        })
      ) {
        setModal("");
        setEncerrar(null);
      }
    } else if (modal === "limites") {
      const aging: DadosFluxo["limites"]["aging"] = {};
      for (const f of FAIXAS) {
        const a = opcional(`aging-a-${f}`),
          c = opcional(`aging-c-${f}`);
        if (a === null && c === null) continue;
        if (a === null || c === null || c <= a) {
          setMensagem(
            `Preencha atenção e crítico em ordem crescente para ${f}.`,
          );
          return;
        }
        aging[f] = { atencao: a, critico: c };
      }
      const analistasLim: Record<string, number> = {},
        etapas: DadosFluxo["limites"]["etapas"] = {};
      nomes.forEach((a) => {
        const v = opcional(`analista-${a}`);
        if (v !== null) analistasLim[a] = v;
      });
      ETAPAS_FLUXO.forEach((et) => {
        const v = opcional(`etapa-${et}`);
        if (v !== null) etapas[et] = v;
      });
      const completos = txt("completos")
        .split(/[\s,;]+/)
        .filter(Boolean)
        .map((x) => x.toUpperCase());
      if (
        salvar({
          ...fluxo,
          limites: {
            equipe: opcional("equipe"),
            analistas: analistasLim,
            etapas,
            aging,
            inatividade: opcional("inatividade"),
            horasDia: opcional("horasDia"),
            apontamentosCompletos: completos,
          },
        })
      )
        setModal("");
    }
  };
  const importar = async (file: File) => {
    try {
      if (file.size > 10 * 1024 * 1024)
        throw Error("Selecione um histórico de até 10 MB.");
      const b: unknown = JSON.parse(await file.text());
      if (!validarFluxo(b))
        throw Error(
          "Histórico inválido. Use o modelo JSON disponibilizado no painel.",
        );
      if (
        b.movimentos.some(
          (m) => !ctx.dados.historias.some((h) => h.codigo === m.us),
        ) ||
        b.impedimentos.some(
          (m) => !ctx.dados.historias.some((h) => h.codigo === m.us),
        )
      )
        throw Error(
          "O histórico contém US que não estão na planilha atual. Atualize a planilha antes de importar.",
        );
      const verificarConflitos = <T extends { id: string }>(
        atuais: T[],
        novos: T[],
      ) => {
        for (const novo of novos) {
          const atual = atuais.find((a) => a.id === novo.id);
          if (
            atual &&
            Object.keys(atual).some(
              (k) =>
                (atual as Record<string, unknown>)[k] !==
                (novo as Record<string, unknown>)[k],
            )
          )
            throw Error(
              `O identificador ${novo.id} já existe com conteúdo diferente. A importação não sobrescreve histórico.`,
            );
        }
      };
      verificarConflitos(fluxo.movimentos, b.movimentos);
      verificarConflitos(fluxo.impedimentos, b.impedimentos);
      const unir = <T extends { id: string }>(a: T[], b: T[]) => [
        ...new Map([...a, ...b].map((x) => [x.id, x])).values(),
      ];
      salvar({
        ...fluxo,
        movimentos: unir(fluxo.movimentos, b.movimentos),
        impedimentos: unir(fluxo.impedimentos, b.impedimentos),
      });
    } catch (e) {
      setMensagem(
        e instanceof Error
          ? e.message
          : "Não foi possível importar o histórico.",
      );
    } finally {
      if (arquivo.current) arquivo.current.value = "";
    }
  };
  const exportarRelatorio = async () => {
    setOcupado(true);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ compress: true });
      let y = 18;
      const escrever = (texto: string) => {
        for (const linha of pdf.splitTextToSize(texto, 178) as string[]) {
          if (y > 278) {
            pdf.addPage();
            y = 18;
          }
          pdf.text(linha, 16, y);
          y += 5;
        }
        y += 4;
      };
      pdf.setFontSize(15);
      escrever("SIGEP - Gestão do Fluxo de Análise");
      pdf.setFontSize(10);
      escrever(
        `${filtrosTexto}. Fonte: ${ctx.dados.arquivo}; histórico complementar da análise e registros WIP.`,
      );
      escrever(
        "Cobertura parcial: somente histórias com movimentações registradas. Dados ausentes não foram reconstruídos a partir da sprint ou do status de desenvolvimento.",
      );
      kpis.forEach((k) =>
        escrever(
          `${k.titulo}: ${k.valor === null ? "Dados não disponíveis" : numero(k.valor, 2) + (k.sufixo ?? "")}. ${k.formula}`,
        ),
      );
      const topicos: [string, string][] = [
        ["WIP atual e histórico", JSON.stringify(resumoFluxo)],
        ["Limites de WIP", JSON.stringify(fluxo.limites)],
        [
          "WIP por analista",
          analistas
            .map(
              (a) => `${a}: ${abertas.filter((e) => e.analista === a).length}`,
            )
            .join("; ") || "Dados não disponíveis",
        ],
        [
          "CFD",
          "Distribuições diárias reconstruídas exclusivamente das movimentações registradas; áreas aprovadas são acumuladas até a data. Cancelamentos e suspensões são saídas próprias.",
        ],
        [
          "Aging WIP",
          `Média: ${numero(media(idades), 1)} dias úteis. Mediana: ${numero(percentil(idades, 0.5), 1)}. Sem início ou limites por complexidade, não há classificação.`,
        ],
        [
          "Throughput",
          aprovadas.map((a) => `${a.us}: ${a.aprovacao}`).join("; ") ||
            "Nenhuma aprovação registrada no recorte.",
        ],
        ["Cycle Time", JSON.stringify(ciclos)],
        [
          "Flow Efficiency",
          `Média conhecida: ${numero(media(aprovadas.flatMap((a) => (a.eficiencia === null ? [] : [a.eficiencia]))), 1)}%. Exige horas por dia configuradas e declaração de apontamentos completos por US; espera residual normalizada não é responsabilização do analista.`,
        ],
        [
          "Bloqueios",
          bloqueios
            .map(
              (b) =>
                `${b.us}: ${b.motivo}; ${b.inicio} a ${b.fim ?? "aberto"}; ${b.responsavel || "responsável não informado"}`,
            )
            .join("; ") || "Nenhum impedimento registrado.",
        ],
        [
          "Entradas versus saídas",
          `Entradas: ${saldoEntradas}; saídas definitivas ou suspensões: ${saldoSaidas}. Retorno da validação para ajustes não é nova entrada.`,
        ],
        [
          "Capacity versus WIP",
          sprints
            .map(
              (s, i) =>
                `Sprint ${s.numero}: ${numero(capacidades[i], 1)} h líquidas cadastradas; ${numero(porSprint[i].final)} US em WIP`,
            )
            .join("; "),
        ],
        [
          "Complexidade versus WIP",
          FAIXAS.map(
            (f) =>
              `${f}: ${abertas.filter((e) => faixaPontos(e.historia.pontos) === f).length} US`,
          ).join("; "),
        ],
        [
          "Gargalos identificados",
          insight ??
            "Não há evidência suficiente para concluir um gargalo global. Consulte distribuições e cobertura antes de classificar.",
        ],
        [
          "Recomendações de melhoria",
          "Completar o histórico e registrar bloqueios explicitamente; calibrar limites por analista, etapa e complexidade; conferir os apontamentos ativos antes de calcular eficiência; preservar as rodadas de validação.",
        ],
      ];
      topicos.forEach(([t, conteudo], i) => {
        escrever(`${i + 1}. ${t}`);
        escrever(conteudo);
      });
      for (const { chart, titulo } of graficosFluxo.values()) {
        pdf.addPage();
        y = 18;
        escrever(titulo);
        escrever(filtrosTexto);
        pdf.addImage(
          chart.toBase64Image(),
          "PNG",
          16,
          y,
          178,
          88,
          undefined,
          "FAST",
        );
      }
      baixarArquivo(pdf.output("blob"), "sigep-relatorio-fluxo.pdf");
      setMensagem(
        "Relatório de fluxo gerado com período, filtros, definições e fontes.",
      );
    } catch (e) {
      setMensagem(
        e instanceof Error ? e.message : "Não foi possível gerar o relatório.",
      );
    } finally {
      setOcupado(false);
    }
  };
  const inputLimite = (
    nome: string,
    label: string,
    valor?: number | null,
    max?: number,
  ) => (
    <label key={nome}>
      {label}
      <input
        name={nome}
        type="number"
        min="0"
        max={max}
        step="1"
        defaultValue={valor ?? ""}
        placeholder="Não configurado"
      />
    </label>
  );
  const detalheEstados =
    detalhe?.estados.filter(
      (e) =>
        (!analistaDetalhe || e.analista === analistaDetalhe) &&
        (!etapaDetalhe || e.etapa === etapaDetalhe),
    ) ?? [];
  const usDetalhe = new Set(detalheEstados.map((e) => e.historia.codigo));
  const historicoDetalhe = (
    detalhe?.movimentos ?? ms.filter((m) => usDetalhe.has(m.us))
  ).filter(
    (m) =>
      (!analistaDetalhe || m.analista === analistaDetalhe) &&
      (!etapaDetalhe || m.destino === etapaDetalhe),
  );
  return (
    <div className="fluxo-painel">
      <div className="fluxo-intro">
        <div>
          <span className="ind-eyebrow">Saúde do fluxo · Kanban</span>
          <h2>Gestão do Fluxo de Análise</h2>
          <p>
            Monitoramento do trabalho em andamento, tempo de ciclo, gargalos e
            capacidade de conclusão das análises.
          </p>
        </div>
        <span className="fluxo-cobertura">
          {todosEstados.length}/{candidatas.length} US com histórico
        </span>
      </div>
      <div className="fluxo-acoes">
        <button className="ind-button" onClick={() => setModal("movimento")}>
          <FiPlus /> Registrar movimentação
        </button>
        <button
          className="ind-button secondary"
          onClick={() => {
            setTipoImpedimento("Bloqueio");
            setModal("impedimento");
          }}
        >
          Registrar bloqueio / espera
        </button>
        <button
          className="ind-button secondary"
          onClick={() => setModal("limites")}
        >
          <FiSettings /> Limites e parâmetros
        </button>
        <button
          className="ind-button secondary"
          onClick={() => {
            setSimEquipe(
              fluxo.limites.equipe === null ? "" : String(fluxo.limites.equipe),
            );
            setSimAnalistas(
              Object.fromEntries(
                Object.entries(fluxo.limites.analistas).map(([a, v]) => [
                  a,
                  String(v),
                ]),
              ),
            );
            setSimEtapas(
              Object.fromEntries(
                Object.entries(fluxo.limites.etapas).map(([a, v]) => [
                  a,
                  String(v),
                ]),
              ),
            );
            setModal("simular");
          }}
        >
          Simular Limite de WIP
        </button>
        <button
          className="ind-button secondary"
          onClick={() => setModal("importar")}
        >
          <FiUpload /> Importar histórico
        </button>
        <button
          className="ind-button secondary"
          disabled={ocupado}
          onClick={() => setModal("relatorio")}
        >
          <FiDownload /> Exportar Relatório de Fluxo
        </button>
      </div>
      <form
        className="ind-filters fluxo-filtros"
        onSubmit={(e) => {
          e.preventDefault();
          setFiltros({ ...rascunho });
        }}
      >
        <div className="ind-filter-grid">
          <label>
            Comparar analistas
            <select
              multiple
              value={rascunho.analistas}
              onChange={(e) =>
                setRascunho({
                  ...rascunho,
                  analistas: Array.from(
                    e.target.selectedOptions,
                    (o) => o.value,
                  ),
                })
              }
            >
              {nomes.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label>
            Complexidade do fluxo
            <select
              value={rascunho.complexidade}
              onChange={(e) =>
                setRascunho({ ...rascunho, complexidade: e.target.value })
              }
            >
              <option value="">Todas</option>
              {FAIXAS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <label>
            Etapa da análise
            <select
              value={rascunho.etapa}
              onChange={(e) =>
                setRascunho({ ...rascunho, etapa: e.target.value })
              }
            >
              <option value="">Todas</option>
              {TODOS_DESTINOS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <label>
            Situação do fluxo
            <select
              value={rascunho.situacao}
              onChange={(e) =>
                setRascunho({ ...rascunho, situacao: e.target.value })
              }
            >
              <option value="">Todas</option>
              {[
                "Em andamento",
                "Aprovada",
                "Backlog",
                "Cancelada",
                "Suspensa",
              ].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <label>
            Somente histórias bloqueadas
            <select
              value={String(rascunho.bloqueadas)}
              onChange={(e) =>
                setRascunho({
                  ...rascunho,
                  bloqueadas: e.target.value === "true",
                })
              }
            >
              <option value="false">Não</option>
              <option value="true">Sim</option>
            </select>
          </label>
          <label>
            Data de posição
            <input
              type="date"
              value={referencia}
              min={inicio}
              max={maxRef}
              disabled={inicio > maxRef}
              onChange={(e) => setReferenciaEscolhida(e.target.value)}
            />
          </label>
        </div>
        <div className="ind-filter-actions">
          <small>Sprint, módulo e squad: filtros globais acima.</small>
          <button
            type="button"
            className="ind-button ghost"
            onClick={() => {
              setRascunho(filtrosVazios());
              setFiltros(filtrosVazios());
              setReferenciaEscolhida("");
            }}
          >
            Limpar filtros do fluxo
          </button>
          <button type="submit" className="ind-button">
            <FiFilter /> Aplicar filtros do fluxo
          </button>
        </div>
      </form>
      {mensagem && (
        <div role="status" className="ind-feedback">
          <span>{mensagem}</span>
          <button
            onClick={() => setMensagem("")}
            aria-label="Fechar aviso do fluxo"
          >
            ×
          </button>
        </div>
      )}
      <details className="fluxo-metodologia">
        <summary>
          <FiActivity /> Histórico e cobertura dos indicadores
        </summary>
        <p>
          Fonte: {ctx.dados.arquivo}, transições complementares e registros WIP.{" "}
          {candidatas.length - todosEstados.length} US sem movimentação
          registrada. Não usamos o status de desenvolvimento para inferir etapas
          da análise. Gráficos mostram a coorte conforme os filtros e a posição
          selecionada; médias usam fotografias diárias úteis. Picos também
          consideram movimentações com horário conhecido, sem inventar horários
          para registros antigos. Sem histórico completo, os resultados não
          representam o total do projeto.
        </p>
        <p>
          Movimentações antigas mantêm precisão de dia. Novos registros incluem
          horário e fuso America/Cuiaba. Retornos para ajustes dentro do mesmo
          ciclo não são novas entradas; somente uma reabertura explicitamente
          registrada após uma saída pode iniciar outra passagem. Suspensão sai
          temporariamente do WIP e preserva o início do ciclo para uma eventual
          retomada.
        </p>
        <p>{filtrosTexto}</p>
      </details>
      <section aria-label="Resumo executivo do WIP">
        <div className="ind-kpi-grid">
          {kpis.map((k) => (
            <KpiProjeto
              key={k.titulo}
              titulo={k.titulo}
              valor={k.valor}
              sufixo={k.sufixo}
              casas={k.sufixo ? 1 : 0}
              icone={<FiActivity />}
              ajuda={k.formula}
              nota={
                k.valor === null
                  ? "Dados não disponíveis · Aguardando informações"
                  : k.nota
              }
              periodo={`${ctx.periodo} · ${referencia}`}
              comparar={ctx.filtros.comparar && k.anterior !== undefined}
              anterior={k.anterior}
              onClick={() =>
                abrir(
                  k.titulo,
                  k.formula,
                  k.registros,
                  ms.filter((m) =>
                    k.registros.some((e) => e.historia.codigo === m.us),
                  ),
                )
              }
            />
          ))}
        </div>
      </section>
      <section aria-labelledby="fluxo-kanban-titulo">
        <div className="fluxo-section-title">
          <div>
            <span className="ind-eyebrow">01 · Fluxo visual</span>
            <h3 id="fluxo-kanban-titulo">Kanban da análise</h3>
          </div>
          <span className="fluxo-pilula">
            Consultivo · posição {referencia}
          </span>
        </div>
        <div className="fluxo-kanban">
          {ETAPAS_FLUXO.map((etapa, i) => {
            const es = estados.filter((e) => e.etapa === etapa),
              limite = fluxo.limites.etapas[etapa],
              excesso = limite !== undefined && es.length > limite;
            return (
              <section
                key={etapa}
                className={`fluxo-coluna${excesso ? " is-excesso" : ""}`}
                style={{ borderTopColor: CORES[i] }}
              >
                <header>
                  <h4>{etapa}</h4>
                  <strong>{conhecidos ? es.length : "—"}</strong>
                  <small>
                    {limite === undefined
                      ? "Limite não configurado"
                      : `Limite ${limite}${excesso ? ` · ${es.length - limite} acima` : ""}`}
                  </small>
                </header>
                {es.map((e) => (
                  <button
                    key={e.historia.codigo}
                    type="button"
                    className={`fluxo-us${e.bloqueios.length ? " is-bloqueada" : ""}`}
                    onClick={() => abrirHistoria(e)}
                  >
                    <span>
                      <b>{e.historia.codigo}</b>
                      {e.bloqueios.length > 0 && <em>Bloqueada</em>}
                    </span>
                    <strong>{e.historia.titulo}</strong>
                    <small>
                      {e.analista} ·{" "}
                      {e.historia.modulo ?? "Módulo não informado"}
                    </small>
                    <small>
                      {e.historia.pontos ?? "Sem"} pontos · Sprint{" "}
                      {e.historia.sprint}
                    </small>
                    <footer>
                      Etapa: {numero(e.idadeEtapa)} d · Idade: {numero(e.idade)}{" "}
                      d
                    </footer>
                  </button>
                ))}
                {!es.length && (
                  <p className="fluxo-coluna-vazia">
                    {conhecidos
                      ? "Nenhuma US neste recorte"
                      : "Aguardando histórico"}
                  </p>
                )}
              </section>
            );
          })}
        </div>
        {estados.some((e) => ["Cancelada", "Suspensa"].includes(e.etapa)) && (
          <details>
            <summary>Saídas próprias: canceladas e suspensas</summary>
            {tabelaEstados(
              estados.filter((e) =>
                ["Cancelada", "Suspensa"].includes(e.etapa),
              ),
            )}
          </details>
        )}
      </section>
      <section>
        <div className="fluxo-section-title">
          <div>
            <span className="ind-eyebrow">02 · Trabalho simultâneo</span>
            <h3>WIP por analista e evolução</h3>
          </div>
          <label>
            Medida de WIP
            <select
              value={modoWip}
              onChange={(e) => setModoWip(e.target.value)}
            >
              {["WIP atual", "WIP médio", "Pico de WIP"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="ind-chart-grid">
          {grafico(
            "wip-analistas",
            "WIP por analista",
            analistas,
            [
              ...ATIVAS_FLUXO.map((etapa, i) =>
                series(
                  etapa,
                  analistas.map((a) =>
                    modoWip === "WIP atual"
                      ? abertas.filter(
                          (e) => e.analista === a && e.etapa === etapa,
                        ).length
                      : modoWip === "WIP médio"
                        ? media(
                            histUteis
                              .filter((h) => h.wip !== null)
                              .map(
                                (h) =>
                                  h.estados.filter(
                                    (e) =>
                                      e.wip &&
                                      e.analista === a &&
                                      e.etapa === etapa,
                                  ).length,
                              ),
                          )
                        : null,
                  ),
                  i,
                ),
              ),
              ...(modoWip === "Pico de WIP"
                ? [
                    series(
                      "Pico observado",
                      analistas.map((a) =>
                        picoObservadoFluxo(
                          historias,
                          ms,
                          inicio,
                          referencia,
                          histUteis,
                          a,
                        ),
                      ),
                      0,
                    ),
                  ]
                : []),
              series(
                "Limite do analista",
                analistas.map((a) => fluxo.limites.analistas[a] ?? null),
                6,
                "line",
                true,
              ),
            ],
            "US",
            "WIP não é uma medida isolada de produtividade. Média e pico exigem movimentações históricas; picos por etapa não são somados.",
            (i) =>
              abrir(
                `${analistas[i]} · ${modoWip}`,
                "Distribuição do WIP, idade, bloqueios e histórico real do analista.",
                estados.filter((e) => e.analista === analistas[i]),
                ms.filter((m) => m.analista === analistas[i]),
              ),
            { horizontal: true, empilhado: modoWip !== "Pico de WIP" },
          )}
          {grafico(
            "wip-sprints",
            "Evolução do WIP por sprint",
            sprints.map((s) => `Sprint ${s.numero}`),
            [
              series(
                "WIP médio",
                porSprint.map((s) => s.media),
                0,
                "line",
              ),
              series(
                "Pico observado",
                porSprint.map((s) => s.pico),
                3,
                "line",
              ),
              series(
                "WIP no encerramento / posição",
                porSprint.map((s) => s.final),
                1,
                "line",
              ),
              series(
                "Limite da equipe",
                sprints.map(() => fluxo.limites.equipe),
                6,
                "line",
                true,
              ),
            ],
            "US",
            "Média de fotografias diárias úteis; pico também considera movimentações com horário registrado. Sprints futuras ou sem histórico permanecem desconhecidas.",
            (i) =>
              abrir(
                `Sprint ${sprints[i].numero} · histórico de WIP`,
                "Movimentações observadas dentro da sprint. Nenhuma data foi distribuída a partir do status atual.",
                estados,
                ms.filter(
                  (m) =>
                    diaMovimento(m) >= sprints[i].inicio &&
                    (!sprints[i].fim || diaMovimento(m) <= sprints[i].fim!),
                ),
              ),
            { tipo: "line" },
          )}
        </div>
        <div className="fluxo-section-title">
          <h3>Cumulative Flow Diagram (CFD)</h3>
          <label>
            Granularidade do CFD
            <select
              value={granularidade}
              onChange={(e) => setGranularidade(e.target.value)}
            >
              {["Diária", "Semanal", "Por sprint"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
        </div>
        <details className="fluxo-metodologia">
          <summary>Limites, média, pico e utilização por analista</summary>
          <div className="ind-table-scroll">
            <table className="ind-table">
              <thead>
                <tr>
                  {[
                    "Analista",
                    "WIP atual",
                    "Média observada",
                    "Pico observado",
                    "Limite",
                    "Acima do limite",
                    "Utilização",
                  ].map((t) => (
                    <th key={t}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analistas.map((a) => {
                  const atual = abertas.filter((e) => e.analista === a).length,
                    vs = histUteis
                      .filter((h) => h.wip !== null)
                      .map(
                        (h) =>
                          h.estados.filter((e) => e.wip && e.analista === a)
                            .length,
                      ),
                    limite = fluxo.limites.analistas[a];
                  return (
                    <tr key={a}>
                      <td>
                        <button
                          className="ind-text-button"
                          onClick={() =>
                            abrir(
                              a,
                              "US em andamento, histórico e limites explicitamente configurados.",
                              estados.filter((e) => e.analista === a),
                              ms.filter((m) => m.analista === a),
                            )
                          }
                        >
                          {a}
                        </button>
                      </td>
                      <td>{atual}</td>
                      <td>{numero(media(vs), 1)}</td>
                      <td>
                        {numero(
                          picoObservadoFluxo(
                            historias,
                            ms,
                            inicio,
                            referencia,
                            histUteis,
                            a,
                          ),
                        )}
                      </td>
                      <td>{limite ?? "Não configurado"}</td>
                      <td>
                        {limite === undefined
                          ? "Não configurado"
                          : Math.max(0, atual - limite)}
                      </td>
                      <td>
                        {limite !== undefined && limite > 0
                          ? `${numero((atual / limite) * 100, 1)}%`
                          : "Dados não disponíveis"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
        {grafico(
          "cfd",
          "Distribuição acumulada do fluxo",
          historicoCfd.map((h) => h.dia),
          [
            ...ETAPAS_FLUXO.map((et, i) =>
              series(
                et,
                historicoCfd.map((h) =>
                  h.estados.length
                    ? h.estados.filter((e) => e.etapa === et).length
                    : null,
                ),
                i,
              ),
            ),
            ...(["Cancelada", "Suspensa"] as const).map((et, i) =>
              series(
                et,
                historicoCfd.map((h) =>
                  h.estados.length
                    ? h.estados.filter((e) => e.etapa === et).length
                    : null,
                ),
                i + 6,
              ),
            ),
          ],
          "US",
          "Áreas das etapas conforme movimentações reais em cada data. Aprovações permanecem na área concluída até eventual reabertura explícita. Cancelamento e suspensão são faixas próprias. Use as legendas para selecionar etapas.",
          (i, j) => {
            const h = historicoCfd[i],
              et = [...ETAPAS_FLUXO, "Cancelada", "Suspensa"][j];
            if (h)
              abrir(
                `${h.dia} · ${et}`,
                "Histórias na etapa nesta data, reconstruídas exclusivamente do histórico.",
                h.estados.filter((e) => e.etapa === et),
                ms.filter((m) => diaMovimento(m) <= h.dia),
              );
          },
          { tipo: "line", empilhado: true, area: true },
        )}
      </section>
      <section>
        <div className="fluxo-section-title">
          <div>
            <span className="ind-eyebrow">03 · Aging WIP</span>
            <h3>Histórias em Envelhecimento</h3>
          </div>
          <span className="fluxo-pilula">
            Média {numero(media(idades), 1)} d · mediana{" "}
            {numero(percentil(idades, 0.5), 1)} d
          </span>
        </div>
        <div className="fluxo-mini-metricas">
          <span>
            Mais antiga:{" "}
            <b>
              {abertas
                .filter((e) => e.idade !== null)
                .sort((a, b) => b.idade! - a.idade!)[0]?.historia.codigo ??
                "Dados não disponíveis"}
            </b>
          </span>
          <span>
            Acima da atenção:{" "}
            <b>
              {temLimitesIdade
                ? envelhecidas.length
                : "Sem limites por complexidade"}
            </b>
          </span>
          <span>
            Sem movimentação recente:{" "}
            <b>
              {fluxo.limites.inatividade === null
                ? "Sem limite configurado"
                : abertas.filter(
                    (e) =>
                      e.idadeEtapa !== null &&
                      e.idadeEtapa > fluxo.limites.inatividade!,
                  ).length}
            </b>
          </span>
        </div>
        {grafico(
          "aging",
          "Idade das histórias abertas",
          abertas.map((e) => e.historia.codigo),
          [
            series(
              "Dias úteis em andamento",
              abertas.flatMap((e, i) =>
                e.idade === null
                  ? []
                  : [
                      {
                        x: i + 1,
                        y: e.idade,
                        us: e.historia.codigo,
                        label: e.etapa,
                      },
                    ],
              ),
              0,
            ),
          ],
          "dias úteis",
          "Cada ponto é uma US em WIP com início conhecido. Faixas de atenção e crítico dependem da complexidade configurada.",
          (i) => {
            const ponto = abertas.filter((e) => e.idade !== null)[i];
            if (ponto) abrirHistoria(ponto);
          },
          { tipo: "scatter" },
        )}
        {tabelaEstados(
          [...abertas].sort((a, b) => (b.idade ?? -1) - (a.idade ?? -1)),
        )}
        <div className="fluxo-aging-legenda">
          {FAIXAS.map((f) => {
            const l = fluxo.limites.aging[f];
            return (
              <span key={f}>
                {f}:{" "}
                {l
                  ? `atenção >${l.atencao} d · crítico >${l.critico} d`
                  : "limites não configurados"}
              </span>
            );
          })}
        </div>
      </section>
      <section>
        <div className="fluxo-section-title">
          <div>
            <span className="ind-eyebrow">04 · Saída do fluxo</span>
            <h3>Throughput — Análises concluídas</h3>
          </div>
          <label>
            Agrupar throughput
            <select
              value={grupoThroughput}
              onChange={(e) => setGrupoThroughput(e.target.value)}
            >
              {["Sprint", "Analista", "Módulo", "Complexidade"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
        </div>
        {grafico(
          "throughput",
          "Aprovações de análise",
          gruposThroughput,
          [
            series(
              "US aprovadas",
              gruposThroughput.map((g) =>
                conhecidos ? aprovacoesGrupo(g).length : null,
              ),
              1,
            ),
            ...(grupoThroughput === "Sprint"
              ? [
                  series(
                    "Novas entradas e retomadas",
                    porSprint.map((s) =>
                      s.final === null ? null : s.entradas.length,
                    ),
                    0,
                  ),
                  series(
                    "Média móvel de aprovações (3 sprints)",
                    porSprint.map((s, i) =>
                      s.final === null
                        ? null
                        : media(
                            porSprint
                              .slice(Math.max(0, i - 2), i + 1)
                              .filter((p) => p.final !== null)
                              .map((p) => p.aprovadas.length),
                          ),
                    ),
                    3,
                    "line",
                  ),
                ]
              : []),
          ],
          "US",
          "Somente aprovação explícita para desenvolvimento. Conclusão de especificação, atribuição e desenvolvimento não contam como aprovação.",
          (i) =>
            abrir(
              `Throughput · ${gruposThroughput[i]}`,
              "US distintas aprovadas no grupo; a última aprovação no período representa a US.",
              estados.filter((e) =>
                aprovacoesGrupo(gruposThroughput[i]).some(
                  (a) => a.us === e.historia.codigo,
                ),
              ),
              aprovacoesGrupo(gruposThroughput[i]).map((a) => a.movimento),
            ),
        )}
        {insight && <p className="fluxo-insight">{insight}</p>}
      </section>
      <section>
        <div className="fluxo-section-title">
          <div>
            <span className="ind-eyebrow">05 · Tempo e eficiência</span>
            <h3>Cycle Time e Flow Efficiency</h3>
          </div>
          <label>
            Diferenciar pontos por
            <select
              value={corPontos}
              onChange={(e) => setCorPontos(e.target.value)}
            >
              {["Analista", "Complexidade", "Módulo", "Sprint"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="fluxo-mini-metricas">
          {[
            ["Média", ciclos.media],
            ["Mediana", ciclos.mediana],
            ["P85", ciclos.p85],
            ["P95", ciclos.p95],
            ["Maior ciclo", ciclos.maximo],
          ].map(([n, v]) => (
            <span key={String(n)}>
              {n}: <b>{numero(v as number | null, 1)} d</b>
            </span>
          ))}
        </div>
        {grafico(
          "cycle",
          "Cycle Time das análises aprovadas",
          aprovadas.map((a) => a.us),
          [
            ...pontosCycle,
            ...(ciclos.p85 !== null
              ? [
                  series(
                    "P85",
                    aprovadas
                      .filter((a) => a.ciclo !== null)
                      .map((a) => ({
                        x: Date.parse(`${a.aprovacao}T00:00:00Z`),
                        y: ciclos.p85!,
                        us: a.us,
                        label: "Referência P85",
                      })),
                    6,
                    "line",
                    true,
                  ),
                ]
              : []),
          ],
          "dias úteis",
          "Data de aprovação × dias úteis entre início e aprovação. Histórias abertas não entram na amostra.",
          (i, j) => {
            const p = [
              ...pontosCycle,
              ...(ciclos.p85 !== null
                ? [
                    series(
                      "P85",
                      aprovadas
                        .filter((a) => a.ciclo !== null)
                        .map((a) => ({ x: 0, y: ciclos.p85!, us: a.us })),
                      6,
                    ),
                  ]
                : []),
            ][j]?.valores[i] as PontoFluxo | undefined;
            const e = estados.find((e) => e.historia.codigo === p?.us);
            if (e) abrirHistoria(e);
          },
          { tipo: "scatter", datas: true },
        )}
        <div className="fluxo-section-title">
          <h3>Trabalho ativo e espera normalizada</h3>
          <label>
            Agrupar eficiência
            <select
              value={grupoEficiencia}
              onChange={(e) => setGrupoEficiencia(e.target.value)}
            >
              {["Sprint", "Analista", "Complexidade"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </label>
        </div>
        {grafico(
          "eficiencia",
          "Composição do tempo de ciclo",
          gruposEf,
          [
            series(
              "Trabalho ativo registrado (média)",
              gruposEf.map((g) =>
                media(eficienciaGrupo(g).map((a) => a.horasAtivas!)),
              ),
              1,
            ),
            series(
              "Espera residual normalizada (média)",
              gruposEf.map((g) =>
                media(eficienciaGrupo(g).map((a) => a.esperaHoras!)),
              ),
              3,
            ),
          ],
          "horas",
          "Eficiência = horas ativas / (dias úteis de ciclo × horas/dia configuradas) × 100. Exige declaração de apontamentos completos por US e unidades compatíveis; resultado ausente quando ativo excede o ciclo normalizado.",
          (i) =>
            abrir(
              `Flow Efficiency · ${gruposEf[i]}`,
              "A espera residual não é atribuída automaticamente ao analista; confira os períodos explícitos de espera e a cobertura dos apontamentos.",
              estados.filter((e) =>
                eficienciaGrupo(gruposEf[i]).some(
                  (a) => a.us === e.historia.codigo,
                ),
              ),
              ms,
              bloqueios.filter((b) => b.tipo === "Espera"),
            ),
          { empilhado: true },
        )}
        <p className="fluxo-nota">
          Eficiência média conhecida:{" "}
          {numero(
            media(
              aprovadas.flatMap((a) =>
                a.eficiencia === null ? [] : [a.eficiencia],
              ),
            ),
            1,
          )}
          % · {aprovadas.filter((a) => a.eficiencia !== null).length}/
          {aprovadas.length} US com dados suficientes. Horas/dia:{" "}
          {numero(fluxo.limites.horasDia)}. Ausência de apontamento não é espera
          comprovada.
        </p>
        {grafico(
          "esperas",
          "Motivos de espera registrados",
          MOTIVOS_ESPERA,
          [
            series(
              "Períodos de espera",
              MOTIVOS_ESPERA.map((m) =>
                bloqueios.some((b) => b.tipo === "Espera")
                  ? bloqueios.filter(
                      (b) => b.tipo === "Espera" && b.motivo === m,
                    ).length
                  : null,
              ),
              3,
            ),
          ],
          "registros",
          "Períodos explicitamente cadastrados como espera. Uma espera não é automaticamente um bloqueio.",
          (i) =>
            abrir(
              MOTIVOS_ESPERA[i],
              "Histórias com períodos de espera neste motivo.",
              estados.filter((e) =>
                bloqueios.some(
                  (b) =>
                    b.tipo === "Espera" &&
                    b.motivo === MOTIVOS_ESPERA[i] &&
                    b.us === e.historia.codigo,
                ),
              ),
              undefined,
              bloqueios.filter(
                (b) => b.tipo === "Espera" && b.motivo === MOTIVOS_ESPERA[i],
              ),
            ),
        )}
      </section>
      <section>
        <div className="fluxo-section-title">
          <div>
            <span className="ind-eyebrow">06 · Impedimentos</span>
            <h3>Bloqueios e gargalos</h3>
          </div>
          <span className="fluxo-pilula">
            Bloqueio exige registro explícito
          </span>
        </div>
        <div className="ind-chart-grid">
          {grafico(
            "bloqueios",
            "Motivos dos bloqueios",
            MOTIVOS_BLOQUEIO,
            [
              series(
                "US distintas",
                MOTIVOS_BLOQUEIO.map((m) =>
                  bloqueios.some((b) => b.tipo === "Bloqueio")
                    ? new Set(
                        bloqueios
                          .filter(
                            (b) => b.tipo === "Bloqueio" && b.motivo === m,
                          )
                          .map((b) => b.us),
                      ).size
                    : null,
                ),
                6,
              ),
            ],
            "US",
            "Validação não é bloqueio automático. Uma US pode ter vários impedimentos, preservados individualmente.",
            (i) =>
              abrir(
                MOTIVOS_BLOQUEIO[i],
                "Intervalos de bloqueio pelo motivo, responsável e datas.",
                estados.filter((e) =>
                  bloqueios.some(
                    (b) =>
                      b.tipo === "Bloqueio" &&
                      b.motivo === MOTIVOS_BLOQUEIO[i] &&
                      b.us === e.historia.codigo,
                  ),
                ),
                undefined,
                bloqueios.filter(
                  (b) =>
                    b.tipo === "Bloqueio" && b.motivo === MOTIVOS_BLOQUEIO[i],
                ),
              ),
            { horizontal: true },
          )}
          {grafico(
            "bloqueios-sprint",
            "Histórias com bloqueio por sprint",
            sprints.map((s) => String(s.numero)),
            [
              series(
                "US com intervalo de bloqueio",
                sprints.map((s) =>
                  conhecidos
                    ? new Set(
                        bloqueios
                          .filter(
                            (b) =>
                              b.tipo === "Bloqueio" &&
                              dataCuiaba(b.inicio) <=
                                (s.fim && s.fim < referencia
                                  ? s.fim
                                  : referencia) &&
                              (!b.fim || dataCuiaba(b.fim) >= s.inicio),
                          )
                          .map((b) => b.us),
                      ).size
                    : null,
                ),
                6,
              ),
            ],
            "US",
            "Conta US cujo intervalo de bloqueio cruza o período observado da sprint; não soma registros repetidos.",
          )}
        </div>
        <div className="ind-chart-card">
          <h3>Registro de impedimentos e esperas</h3>
          <div className="fluxo-mini-metricas">
            <span>
              US com múltiplos bloqueios:{" "}
              <b>
                {conhecidos
                  ? estados.filter(
                      (e) =>
                        bloqueios.filter(
                          (b) =>
                            b.us === e.historia.codigo && b.tipo === "Bloqueio",
                        ).length > 1,
                    ).length
                  : "Dados não disponíveis"}
              </b>
            </span>
            <span>
              Dias bloqueados (soma por US):{" "}
              <b>
                {bloqueios.some((b) => b.tipo === "Bloqueio")
                  ? estados.reduce(
                      (v, e) =>
                        v +
                        diasImpedimento(
                          bloqueios.filter(
                            (b) =>
                              b.us === e.historia.codigo &&
                              b.tipo === "Bloqueio",
                          ),
                          referencia,
                          base.config.feriados,
                          inicio,
                        ),
                      0,
                    )
                  : "Dados não disponíveis"}
              </b>
            </span>
          </div>
          <details>
            <summary>Bloqueios por analista</summary>
            <div className="ind-table-scroll">
              <table className="ind-table">
                <thead>
                  <tr>
                    <th>Analista</th>
                    <th>US com bloqueio no período</th>
                    <th>Dias bloqueados por US (sem sobreposição)</th>
                  </tr>
                </thead>
                <tbody>
                  {analistas.map((a) => {
                    const es = estados.filter((e) => e.analista === a),
                      bs = bloqueios.filter(
                        (b) =>
                          b.tipo === "Bloqueio" &&
                          es.some((e) => e.historia.codigo === b.us),
                      );
                    return (
                      <tr key={a}>
                        <td>{a}</td>
                        <td>{new Set(bs.map((b) => b.us)).size}</td>
                        <td>
                          {es.reduce(
                            (v, e) =>
                              v +
                              diasImpedimento(
                                bs.filter((b) => b.us === e.historia.codigo),
                                referencia,
                                base.config.feriados,
                                inicio,
                              ),
                            0,
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </details>
          <div className="ind-table-scroll">
            <table className="ind-table">
              <thead>
                <tr>
                  {[
                    "US",
                    "Tipo / motivo",
                    "Início",
                    "Encerramento",
                    "Dias úteis",
                    "Responsável",
                    "Ação",
                  ].map((t) => (
                    <th key={t}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bloqueios.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <button
                        className="ind-code"
                        onClick={() => {
                          const e = estados.find(
                            (e) => e.historia.codigo === b.us,
                          );
                          if (e) abrirHistoria(e);
                        }}
                      >
                        {b.us}
                      </button>
                    </td>
                    <td>
                      {b.tipo} · {b.motivo}
                      <small>{b.observacao}</small>
                    </td>
                    <td>{b.inicio}</td>
                    <td>{b.fim ?? "Em aberto"}</td>
                    <td>
                      {diasImpedimento(
                        [b],
                        referencia,
                        base.config.feriados,
                        inicio,
                      )}
                    </td>
                    <td>{b.responsavel || "Não informado"}</td>
                    <td>
                      {!b.fim && (
                        <button
                          className="ind-text-button"
                          onClick={() => {
                            setEncerrar(b);
                            setModal("encerrar");
                          }}
                        >
                          Registrar encerramento
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!bloqueios.length && (
                  <tr>
                    <td colSpan={7}>
                      Aguardando registros explícitos de bloqueio ou espera.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section>
        <div className="fluxo-section-title">
          <div>
            <span className="ind-eyebrow">07 · Demanda e disponibilidade</span>
            <h3>Relação entre WIP, capacity e complexidade</h3>
          </div>
        </div>
        <div className="ind-chart-grid">
          {grafico(
            "capacity-quantidade",
            "Trabalho simultâneo e limite",
            sprints.map((s) => String(s.numero)),
            [
              series(
                "WIP na posição",
                porSprint.map((s) => s.final),
                0,
              ),
              series(
                "WIP médio",
                porSprint.map((s) => s.media),
                1,
                "line",
              ),
              series(
                "Limite da equipe",
                sprints.map(() => fluxo.limites.equipe),
                6,
                "line",
                true,
              ),
            ],
            "US",
            "Painel sincronizado por sprint. O limite é configurado a partir do fluxo, sem conversão da jornada de trabalho.",
          )}
          {grafico(
            "capacity-horas",
            "Disponibilidade e esforço do WIP",
            sprints.map((s) => String(s.numero)),
            [
              series("Capacity líquida cadastrada", capacidades, 1),
              series(
                "Estimativa explícita do WIP",
                porSprint.map((s) => {
                  if (s.final === null) return null;
                  const es = estadosEm(
                    historias,
                    ms,
                    fluxo.impedimentos,
                    s.fim,
                    base.config.feriados,
                  ).filter((e) => e.wip);
                  if (!es.length) return 0;
                  const vs = es.map(
                    (e) =>
                      base.transicoes
                        .filter(
                          (t) =>
                            t.us === e.historia.codigo &&
                            t.sprint === s.sprint &&
                            t.estimativa !== null,
                        )
                        .at(-1)?.estimativa ?? null,
                  );
                  return vs.every((v) => v !== null)
                    ? vs.reduce<number>((v, n) => v + n!, 0)
                    : null;
                }),
                0,
              ),
            ],
            "horas",
            "Unidades separadas do WIP. Capacity exige alocação líquida; estimativa exige horas de análise por US/sprint. Pontos não são convertidos em horas.",
            (i) =>
              abrir(
                `Sprint ${sprints[i].numero} · capacity e WIP`,
                "Disponibilidade e esforço são medidas em horas. Filtros por história não rateiam a capacity.",
                estados,
                ms.filter(
                  (m) =>
                    diaMovimento(m) >= sprints[i].inicio &&
                    diaMovimento(m) <= porSprint[i].fim,
                ),
                undefined,
                base.alocacoes.filter(
                  (a) =>
                    a.sprint === sprints[i].numero &&
                    (!filtroPessoas.length ||
                      filtroPessoas.includes(a.analista)),
                ),
              ),
          )}
        </div>
        {grafico(
          "complexidade",
          "Complexidade e idade do WIP",
          abertas.map((e) => e.historia.codigo),
          analistas.map((a, i) =>
            series(
              a,
              abertas
                .filter(
                  (e) =>
                    e.analista === a &&
                    e.historia.pontos !== null &&
                    e.idade !== null,
                )
                .map((e) => ({
                  x: e.historia.pontos!,
                  y: e.idade!,
                  us: e.historia.codigo,
                  label: `${e.etapa} · WIP do analista: ${abertas.filter((x) => x.analista === a).length}`,
                })),
              i,
            ),
          ),
          "dias úteis",
          "Eixo X: story points. Eixo Y: idade. Cada ponto é uma US; tooltip mostra o WIP do analista. Complexidade é contexto, sem equivalência automática em horas.",
          (i, j) => {
            const e = abertas.filter(
              (e) =>
                e.analista === analistas[j] &&
                e.historia.pontos !== null &&
                e.idade !== null,
            )[i];
            if (e) abrirHistoria(e);
          },
          { tipo: "scatter" },
        )}
        <div className="fluxo-mini-metricas">
          {sprints.map((s) => (
            <span key={s.numero}>
              Sprint {s.numero}:{" "}
              <b>
                {base.alocacoes.some((a) => a.sprint === s.numero)
                  ? base.alocacoes.filter(
                      (a) =>
                        a.sprint === s.numero &&
                        (!filtroPessoas.length ||
                          filtroPessoas.includes(a.analista)),
                    ).length
                  : "Não informado"}{" "}
                analistas cadastrados
              </b>
            </span>
          ))}
        </div>
      </section>
      <section>
        <div className="fluxo-section-title">
          <div>
            <span className="ind-eyebrow">08 · Balanço do fluxo</span>
            <h3>Entradas versus saídas</h3>
          </div>
        </div>
        {porSprint.some((s) => s.iniciosDesconhecidos.length > 0) && (
          <p className="fluxo-nota">
            Há US em etapas ativas sem movimentação de início conhecida. Elas
            compõem o WIP observado, mas sua entrada não é atribuída
            artificialmente a uma sprint; o balanço tem cobertura parcial.
          </p>
        )}
        {grafico(
          "entradas-saidas",
          "Balanço das movimentações",
          sprints.map((s) => String(s.numero)),
          [
            series(
              "Entradas novas",
              porSprint.map((s) => (s.final === null ? null : s.novas.length)),
              0,
              "line",
            ),
            series(
              "Retomadas / reaberturas explícitas",
              porSprint.map((s) =>
                s.final === null ? null : s.retomadas.length,
              ),
              4,
              "line",
            ),
            series(
              "Aprovações (passagens)",
              porSprint.map((s) =>
                s.final === null
                  ? null
                  : s.saidas.filter(
                      (m) => m.destino === "Pronta para Desenvolvimento",
                    ).length,
              ),
              1,
              "line",
            ),
            series(
              "Cancelamentos e suspensões",
              porSprint.map((s) =>
                s.final === null
                  ? null
                  : s.saidas.filter(
                      (m) => m.destino !== "Pronta para Desenvolvimento",
                    ).length,
              ),
              6,
              "line",
            ),
            series(
              "WIP na posição",
              porSprint.map((s) => s.final),
              3,
              "line",
            ),
          ],
          "US / passagens",
          "WIP final = inicial + entradas novas + retomadas − aprovações − cancelamentos − suspensões. Ajustes dentro do ciclo não são novas entradas. O balanço de passagens preserva reaberturas explícitas; throughput deduplica US.",
          (i) =>
            abrir(
              `Balanço · Sprint ${sprints[i].numero}`,
              "Movimentações de entrada e saída da sprint, incluindo retomadas explicitamente registradas.",
              estados,
              [...porSprint[i].entradas, ...porSprint[i].saidas],
            ),
          { tipo: "line" },
        )}
        {insight && <p className="fluxo-insight">{insight}</p>}
        <div className="ind-table-scroll">
          <table className="ind-table">
            <thead>
              <tr>
                {[
                  "Sprint",
                  "Entradas novas",
                  "Retomadas",
                  "Aprovações",
                  "Outras saídas",
                  "WIP final",
                ].map((t) => (
                  <th key={t}>{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resumoFluxo.map((s) => (
                <tr key={s.sprint}>
                  <td>{s.sprint}</td>
                  {[
                    s.novas,
                    s.retomadas,
                    s.aprovadas,
                    s.outrasSaidas,
                    s.wip,
                  ].map((v, i) => (
                    <td key={i}>
                      {s.wip === null ? "Dados não disponíveis" : numero(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <footer className="fluxo-footer">
        <span>
          {ctx.dados.arquivo} + histórico complementar · {ctx.periodo}
        </span>
        <button
          className="ind-text-button"
          onClick={() =>
            baixarArquivo(
              new Blob([JSON.stringify(fluxo, null, 2)], {
                type: "application/json",
              }),
              "sigep-historico-fluxo.json",
            )
          }
        >
          Exportar backup do histórico WIP
        </button>
      </footer>
      <Sidebar
        visible={!!detalhe}
        position="right"
        onHide={() => {
          setDetalhe(null);
          setHistoriaSelecionada("");
        }}
        className="ind-detail-drawer fluxo-drawer"
        style={{ width: "min(1100px,100vw)" }}
        header={detalhe?.titulo}
      >
        {detalhe && (
          <>
            <div className="ind-detail-intro">
              <p>{detalhe.formula}</p>
              <small>
                {filtrosTexto} · Fonte: {ctx.dados.arquivo} + histórico real da
                análise/WIP.
              </small>
            </div>
            <div className="ind-detail-filters">
              <label>
                Analista no detalhamento
                <select
                  value={analistaDetalhe}
                  onChange={(e) => setAnalistaDetalhe(e.target.value)}
                >
                  <option value="">Todos</option>
                  {nomes.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </label>
              <label>
                Etapa no detalhamento
                <select
                  value={etapaDetalhe}
                  onChange={(e) => setEtapaDetalhe(e.target.value)}
                >
                  <option value="">Todas</option>
                  {TODOS_DESTINOS.map((et) => (
                    <option key={et}>{et}</option>
                  ))}
                </select>
              </label>
              <button
                className="ind-button secondary"
                onClick={() =>
                  baixarArquivo(
                    new Blob(
                      [
                        JSON.stringify(
                          {
                            fonte: ctx.dados.arquivo,
                            periodo: ctx.periodo,
                            filtros: filtrosTexto,
                            formula: detalhe.formula,
                            estados: detalheEstados,
                            movimentos: historicoDetalhe,
                            alocacoes: detalhe.alocacoes?.filter(
                              (a) =>
                                !analistaDetalhe ||
                                a.analista === analistaDetalhe,
                            ),
                            bloqueios: (detalhe.bloqueios ?? bloqueios).filter(
                              (b) => usDetalhe.has(b.us),
                            ),
                          },
                          null,
                          2,
                        ),
                      ],
                      { type: "application/json" },
                    ),
                    "sigep-fluxo-detalhamento.json",
                  )
                }
              >
                Exportar registros do detalhamento
              </button>
            </div>
            {tabelaEstados(detalheEstados)}
            {historiaSelecionada &&
              (() => {
                const e = detalheEstados.find(
                    (e) => e.historia.codigo === historiaSelecionada,
                  ),
                  a = aprovadas.find((a) => a.us === historiaSelecionada);
                return e ? (
                  <>
                    <div className="fluxo-mini-metricas">
                      <span>
                        Início: <b>{e.inicio ?? "Não informado"}</b>
                      </span>
                      <span>
                        Aprovação no período:{" "}
                        <b>{a?.aprovacao ?? "Não registrada"}</b>
                      </span>
                      <span>
                        Ciclo: <b>{numero(a?.ciclo)} d úteis</b>
                      </span>
                      <span>
                        Rodadas:{" "}
                        <b>
                          {a?.rodadas ??
                            e.historico.filter(
                              (m) =>
                                m.destino === "Validação com Cliente" &&
                                m.origem !== m.destino,
                            ).length}
                        </b>
                      </span>
                      <span>
                        Horas ativas: <b>{numero(a?.horasAtivas, 1)} h</b>
                      </span>
                    </div>
                    {e.historia.redmine && (
                      <a
                        className="ind-code"
                        href={e.historia.redmine}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir história no Redmine ↗
                      </a>
                    )}
                  </>
                ) : null;
              })()}
            {detalhe.alocacoes && (
              <>
                <h3>Alocações que compõem a disponibilidade</h3>
                <div className="ind-table-scroll">
                  <table className="ind-table">
                    <thead>
                      <tr>
                        {[
                          "Analista",
                          "Sprint",
                          "Dias úteis",
                          "Jornada",
                          "Dedicação",
                          "Descontos (h)",
                          "Líquida (h)",
                        ].map((t) => (
                          <th key={t}>{t}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detalhe.alocacoes
                        .filter(
                          (a) =>
                            !analistaDetalhe || a.analista === analistaDetalhe,
                        )
                        .map((a) => (
                          <tr key={a.id}>
                            <td>{a.analista}</td>
                            <td>{a.sprint}</td>
                            <td>{a.dias}</td>
                            <td>{a.jornada}</td>
                            <td>{a.dedicacao}%</td>
                            <td>
                              {numero(
                                a.reunioes +
                                  a.ferias +
                                  a.afastamentos +
                                  a.apoio +
                                  a.imprevistos,
                                1,
                              )}
                            </td>
                            <td>{numero(liquida(a), 1)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <h3>Histórico de movimentações</h3>
            <div className="ind-table-scroll">
              <table className="ind-table">
                <thead>
                  <tr>
                    {[
                      "US",
                      "Origem",
                      "Destino",
                      "Data / hora",
                      "Analista",
                      "Motivo / fonte",
                    ].map((t) => (
                      <th key={t}>{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historicoDetalhe.map((m) => (
                    <tr key={m.id}>
                      <td>{m.us}</td>
                      <td>{m.origem ?? "Origem não registrada"}</td>
                      <td>{m.destino}</td>
                      <td>
                        {m.instante}
                        <small>
                          Precisão:{" "}
                          {m.precisao === "dia"
                            ? "dia (sem horário inferido)"
                            : "data e hora"}
                        </small>
                      </td>
                      <td>{m.analista}</td>
                      <td>
                        {m.motivo || "—"}
                        <small>{m.fonte}</small>
                      </td>
                    </tr>
                  ))}
                  {!historicoDetalhe.length && (
                    <tr>
                      <td colSpan={6}>Aguardando movimentações.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <h3>Permanência nas etapas</h3>
            <div className="ind-table-scroll">
              <table className="ind-table">
                <thead>
                  <tr>
                    <th>US / etapa</th>
                    <th>Entrada</th>
                    <th>Saída / posição</th>
                    <th>Dias úteis</th>
                  </tr>
                </thead>
                <tbody>
                  {detalheEstados.flatMap((e) => {
                    const mudancas = e.historico.filter(
                      (m, i) =>
                        i === 0 || m.destino !== e.historico[i - 1].destino,
                    );
                    return mudancas.map((m, i) => {
                      const fim = mudancas[i + 1]
                        ? diaMovimento(mudancas[i + 1])
                        : referencia;
                      return (
                        <tr key={m.id}>
                          <td>
                            {m.us} · {m.destino}
                          </td>
                          <td>{diaMovimento(m)}</td>
                          <td>{fim}</td>
                          <td>
                            {numero(
                              diasUteis(
                                diaMovimento(m),
                                fim,
                                base.config.feriados,
                              ),
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
            <h3>Períodos de bloqueio e espera</h3>
            {(detalhe.bloqueios ?? bloqueios)
              .filter((b) => usDetalhe.has(b.us))
              .map((b) => (
                <div className="fluxo-periodo" key={b.id}>
                  <b>
                    {b.us} · {b.tipo} · {b.motivo}
                  </b>
                  <p>
                    {b.inicio} → {b.fim ?? "Em aberto"} · responsável:{" "}
                    {b.responsavel || "Não informado"}
                  </p>
                  <small>{b.observacao}</small>
                </div>
              ))}
          </>
        )}
      </Sidebar>
      <Dialog
        visible={!!modal}
        onHide={() => setModal("")}
        modal
        className="ind-story-dialog fluxo-dialog"
        style={{ width: "min(920px,95vw)" }}
        header={
          {
            movimento: "Registrar movimentação da análise",
            impedimento: "Registrar bloqueio ou espera",
            encerrar: "Encerrar intervalo registrado",
            limites: "Limites e parâmetros do fluxo",
            simular: "Simular Limite de WIP",
            importar: "Importar histórico complementar",
            relatorio: "Exportar Relatório de Fluxo",
          }[modal]
        }
      >
        {modal === "simular" ? (
          <>
            <p className="fluxo-simulacao">
              SIMULAÇÃO · altera apenas estes alertas; não modifica limites
              reais ou histórico.
            </p>
            <label>
              Limite simulado da equipe
              <input
                type="number"
                min="0"
                value={simEquipe}
                onChange={(e) => setSimEquipe(e.target.value)}
              />
            </label>
            <p>
              {simEquipe === ""
                ? "Limite não informado"
                : `${conhecidos ? Math.max(0, abertas.length - Number(simEquipe)) : "Dados não disponíveis"} US acima do limite simulado da equipe`}
            </p>
            <div className="fluxo-form-grid">
              {analistas.map((a) => (
                <label key={a}>
                  Limite simulado · {a}
                  <input
                    type="number"
                    min="0"
                    value={simAnalistas[a] ?? ""}
                    onChange={(e) =>
                      setSimAnalistas({ ...simAnalistas, [a]: e.target.value })
                    }
                  />
                  <small>
                    WIP: {abertas.filter((e) => e.analista === a).length} ·
                    excesso:{" "}
                    {simAnalistas[a] !== undefined && simAnalistas[a] !== ""
                      ? Math.max(
                          0,
                          abertas.filter((e) => e.analista === a).length -
                            Number(simAnalistas[a]),
                        )
                      : "Não configurado"}
                  </small>
                </label>
              ))}
            </div>
            <h3>Simulação por etapa</h3>
            <div className="fluxo-form-grid">
              {ETAPAS_FLUXO.map((et) => (
                <label key={et}>
                  {et}
                  <input
                    type="number"
                    min="0"
                    value={simEtapas[et] ?? ""}
                    onChange={(e) =>
                      setSimEtapas({ ...simEtapas, [et]: e.target.value })
                    }
                  />
                  <small>
                    Histórias: {estados.filter((e) => e.etapa === et).length} ·
                    excesso:{" "}
                    {simEtapas[et] !== undefined && simEtapas[et] !== ""
                      ? Math.max(
                          0,
                          estados.filter((e) => e.etapa === et).length -
                            Number(simEtapas[et]),
                        )
                      : "Não configurado"}
                  </small>
                </label>
              ))}
            </div>
          </>
        ) : modal === "importar" ? (
          <>
            <p>
              Importe JSON com registros reais de movimentação e intervalos
              explícitos. Datas e horas devem incluir fuso (ISO 8601). A
              importação combina identificadores, preserva os parâmetros atuais
              e não altera a planilha.
            </p>
            <input
              type="file"
              accept=".json,application/json"
              ref={arquivo}
              aria-label="Arquivo de histórico WIP"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importar(f);
              }}
            />
            <div className="fluxo-acoes">
              <button
                className="ind-button secondary"
                onClick={() =>
                  baixarArquivo(
                    new Blob([JSON.stringify(novoFluxo(), null, 2)], {
                      type: "application/json",
                    }),
                    "sigep-modelo-historico-wip.json",
                  )
                }
              >
                Baixar modelo JSON vazio
              </button>
              <button
                className="ind-button secondary"
                onClick={() =>
                  baixarArquivo(
                    new Blob([JSON.stringify(fluxo, null, 2)], {
                      type: "application/json",
                    }),
                    "sigep-historico-fluxo.json",
                  )
                }
              >
                Exportar histórico atual
              </button>
            </div>
            <details>
              <summary>Campos do histórico</summary>
              <p>
                movimentos: id, us, origem (etapa ou null), destino, instante,
                analista, motivo, fonte “Registro WIP”, precisao “instante”.
                impedimentos: id, us, inicio, fim (ou null), motivo,
                responsavel, observacao, tipo “Bloqueio” ou “Espera”. Use as
                etapas exibidas no Kanban; “Cancelada” e “Suspensa” são saídas
                próprias.
              </p>
            </details>
          </>
        ) : modal === "relatorio" ? (
          <>
            <p>
              Relatório PDF com 14 tópicos, gráficos, período, filtros,
              definições e fontes. Históricos incompletos e métricas
              indisponíveis permanecem identificados. Simulações são excluídas.
            </p>
            <p>
              {conhecidos
                ? `${abertas.length} US em WIP observado; ${aprovadas.length} US aprovadas no período.`
                : "Aguardando movimentações para calcular métricas de fluxo."}
            </p>
            <button
              className="ind-button"
              disabled={ocupado}
              onClick={() => void exportarRelatorio()}
            >
              {ocupado ? "Gerando relatório..." : "Gerar PDF de fluxo"}
            </button>
            <small>
              Para PNG, utilize o botão de exportação de cada gráfico.
            </small>
          </>
        ) : (
          <form onSubmit={registrar}>
            <div className="fluxo-form-grid">
              {(modal === "movimento" || modal === "impedimento") && (
                <label>
                  História (US)
                  <select name="us" required>
                    <option value="">Selecione uma história</option>
                    {distintas(ctx.dados.historias).map((h) => (
                      <option key={h.codigo} value={h.codigo}>
                        {h.codigo} · {h.titulo}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {modal === "movimento" && (
                <>
                  <label>
                    Etapa de destino
                    <select name="destino" required>
                      {TODOS_DESTINOS.map((et) => (
                        <option key={et}>{et}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Data e hora da movimentação
                    <input type="datetime-local" name="instante" required />
                  </label>
                  <label>
                    Analista responsável
                    <input name="analista" list="fluxo-analistas" required />
                  </label>
                  <label>
                    Motivo / observação
                    <textarea name="motivo" />
                  </label>
                  <p>
                    A origem será a última etapa registrada. Reaberturas e
                    retomadas exigem motivo. Horários são registrados no fuso
                    America/Cuiaba. Suporte ao desenvolvimento e QA continua no
                    registro de atividades, sem reabrir o fluxo.
                  </p>
                </>
              )}
              {modal === "impedimento" && (
                <>
                  <label>
                    Tipo de intervalo
                    <select
                      value={tipoImpedimento}
                      onChange={(e) =>
                        setTipoImpedimento(
                          e.target.value as "Bloqueio" | "Espera",
                        )
                      }
                    >
                      <option>Bloqueio</option>
                      <option>Espera</option>
                    </select>
                  </label>
                  <label>
                    Motivo do intervalo
                    <select key={tipoImpedimento} name="motivo">
                      {(tipoImpedimento === "Bloqueio"
                        ? MOTIVOS_BLOQUEIO
                        : MOTIVOS_ESPERA
                      ).map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Início do intervalo
                    <input type="datetime-local" name="inicio" required />
                  </label>
                  <label>
                    Encerramento do intervalo · opcional
                    <input type="datetime-local" name="fim" />
                  </label>
                  <label>
                    Responsável pela resolução · opcional
                    <input name="responsavel" />
                  </label>
                  <label>
                    Observação
                    <textarea name="observacao" />
                  </label>
                </>
              )}
              {modal === "encerrar" && (
                <>
                  <p>
                    {encerrar?.us} · {encerrar?.motivo} · iniciado em{" "}
                    {encerrar?.inicio}
                  </p>
                  <label>
                    Data e hora de encerramento
                    <input type="datetime-local" name="fim" required />
                  </label>
                </>
              )}
              {modal === "limites" && (
                <>
                  <p className="fluxo-form-wide">
                    Limites em branco permanecem desconhecidos. Não há faixa
                    universal de WIP ou prazo único para complexidades
                    diferentes.
                  </p>
                  {inputLimite(
                    "equipe",
                    "Limite de WIP da equipe",
                    fluxo.limites.equipe,
                  )}
                  {inputLimite(
                    "inatividade",
                    "Dias úteis sem movimentação para atenção",
                    fluxo.limites.inatividade,
                  )}
                  {inputLimite(
                    "horasDia",
                    "Horas por dia para normalização do ciclo",
                    fluxo.limites.horasDia,
                    24,
                  )}
                  <label>
                    US com apontamentos ativos completos
                    <textarea
                      name="completos"
                      defaultValue={fluxo.limites.apontamentosCompletos.join(
                        ", ",
                      )}
                    />
                    <small>
                      Declare códigos separados por vírgula somente após
                      conferir todos os apontamentos. Sem esta declaração, a
                      eficiência permanece indisponível.
                    </small>
                  </label>
                  <fieldset className="fluxo-form-wide">
                    <legend>Limites por analista</legend>
                    <div className="fluxo-form-grid">
                      {nomes.map((a) =>
                        inputLimite(
                          `analista-${a}`,
                          a,
                          fluxo.limites.analistas[a],
                        ),
                      )}
                    </div>
                  </fieldset>
                  <fieldset className="fluxo-form-wide">
                    <legend>Limites por etapa</legend>
                    <div className="fluxo-form-grid">
                      {ETAPAS_FLUXO.map((et) =>
                        inputLimite(
                          `etapa-${et}`,
                          et,
                          fluxo.limites.etapas[et],
                        ),
                      )}
                    </div>
                  </fieldset>
                  <fieldset className="fluxo-form-wide">
                    <legend>Aging por complexidade · dias úteis</legend>
                    {FAIXAS.map((f) => (
                      <div className="fluxo-form-grid" key={f}>
                        {inputLimite(
                          `aging-a-${f}`,
                          `${f} · atenção`,
                          fluxo.limites.aging[f]?.atencao,
                        )}
                        {inputLimite(
                          `aging-c-${f}`,
                          `${f} · crítico`,
                          fluxo.limites.aging[f]?.critico,
                        )}
                      </div>
                    ))}
                  </fieldset>
                </>
              )}
            </div>
            <datalist id="fluxo-analistas">
              {nomes.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </datalist>
            <div className="fluxo-acoes">
              <button type="submit" className="ind-button">
                Salvar registro do fluxo
              </button>
              <button
                type="button"
                className="ind-button secondary"
                onClick={() => setModal("")}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
        {mensagem && <p role="status">{mensagem}</p>}
      </Dialog>
    </div>
  );
}
