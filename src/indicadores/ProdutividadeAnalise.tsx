import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Dialog } from "primereact/dialog";
import { Sidebar } from "primereact/sidebar";
import {
  FiActivity,
  FiDownload,
  FiPlus,
  FiSettings,
  FiUsers,
} from "react-icons/fi";
import type { ContextoProjeto } from "./AbasProjeto";
import type { HistoriaProjeto } from "./types";
import { GraficoProjeto, type SerieProjeto } from "./GraficoProjeto";
import { EstadoVazio, KpiProjeto, TabelaHistorias } from "./ComponentesProjeto";
import { baixarArquivo } from "./exportacoes";
import { numero, nomesUnicos, normalizar } from "./modelo";
import { RoscaAnalise } from "./RoscaAnalise";
import {
  ATIVIDADES,
  criarIdRegistroAnalise,
  ETAPAS,
  MOTIVOS,
  diasUteis,
  distintas,
  estadoUS,
  etapaAtual,
  faixaPontos,
  fteAnalise,
  liquida,
  media,
  novaBaseAnalise,
  percentil,
  temposUS,
  validarBaseAnalise,
  type BaseAnalise,
} from "./analiseModelo";
import "./produtividadeAnalise.css";

const CHAVE = "sigep:analise:v1";
const CORES = [
  "#087bb5",
  "#10a69c",
  "#5b7cc7",
  "#e2a43c",
  "#8c78b8",
  "#52978a",
  "#e18e6d",
  "#679fc0",
  "#be6e97",
  "#627588",
  "#a59742",
];
const TRANSICOES = [
  ...ETAPAS,
  "Conclusão do levantamento",
  "Conclusão da especificação",
  "Envio para validação",
  "Retorno da validação",
  "Cancelada",
  "Reaberta",
  "Demanda recebida",
];
const FAIXAS = [
  "1 a 3 pontos",
  "5 pontos",
  "8 pontos",
  "13 pontos",
  "Outras pontuações",
  "Sem pontuação",
];
type Filtros = {
  analistas: string[];
  complexidade: string;
  situacao: string;
  etapa: string;
};
const vazio = (): Filtros => ({
  analistas: [],
  complexidade: "",
  situacao: "",
  etapa: "",
});
type Detalhe = {
  titulo: string;
  formula: string;
  historias: HistoriaProjeto[];
  registros?: object[];
};
function carregar(): { base: BaseAnalise; erro: string } {
  try {
    const valor = localStorage.getItem(CHAVE);
    if (!valor) return { base: novaBaseAnalise(), erro: "" };
    const base: unknown = JSON.parse(valor);
    if (!validarBaseAnalise(base)) throw Error();
    return { base, erro: "" };
  } catch {
    return {
      base: novaBaseAnalise(),
      erro: "Leitura dos registros locais indisponível. O conteúdo salvo foi preservado; exporte uma cópia antes de substituir os dados.",
    };
  }
}
export default function ProdutividadeAnalise({
  ctx,
}: {
  ctx: ContextoProjeto;
}) {
  const [inicial] = useState(carregar),
    [base, setBase] = useState(inicial.base),
    [mensagem, setMensagem] = useState(inicial.erro);
  const [rascunho, setRascunho] = useState(vazio),
    [filtros, setFiltros] = useState(vazio);
  const [modal, setModal] = useState(""),
    [detalhe, setDetalhe] = useState<Detalhe | null>(null),
    [cardAtivo, setCardAtivo] = useState("");
  const [selecoes, setSelecoes] = useState<Record<string, number>>({});
  const [sprintDetalhe, setSprintDetalhe] = useState(""),
    [analistaDetalhe, setAnalistaDetalhe] = useState("");
  const [modo, setModo] = useState("Quantidade de histórias"),
    [agrupamento, setAgrupamento] = useState("Sprint"),
    [sprintComplexidade, setSprintComplexidade] = useState("");
  const [ocupado, setOcupado] = useState(false),
    [simulacao, setSimulacao] = useState({
      pessoas: 1,
      dias: 10,
      jornada: 6,
      reserva: 0,
      ferias: 0,
      afastamentos: 0,
      demanda: 0,
    });
  const backup = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const abrirRelatorio = () => setModal("relatorio");
    const limparFiltros = () => {
      setRascunho(vazio());
      setFiltros(vazio());
      setSelecoes({});
    };
    window.addEventListener("sigep:analise-relatorio", abrirRelatorio);
    window.addEventListener("sigep:analise-limpar", limparFiltros);
    return () => {
      window.removeEventListener("sigep:analise-relatorio", abrirRelatorio);
      window.removeEventListener("sigep:analise-limpar", limparFiltros);
    };
  }, []);
  const salvar = (nova: BaseAnalise) => {
    if (!validarBaseAnalise(nova)) {
      setMensagem(
        "Confira os campos: datas válidas, horas não negativas, seis dimensões entre 1 e 3 e alocações únicas por sprint. Nenhum registro foi alterado.",
      );
      return false;
    }
    try {
      if (inicial.erro) {
        const anterior = localStorage.getItem(CHAVE);
        if (anterior && !localStorage.getItem(`${CHAVE}:recuperacao`))
          localStorage.setItem(`${CHAVE}:recuperacao`, anterior);
      }
      localStorage.setItem(CHAVE, JSON.stringify(nova));
      setBase(nova);
      setMensagem(
        "Registro salvo neste navegador. Faça backup para preservar o histórico.",
      );
      return true;
    } catch {
      setMensagem(
        "Não foi possível salvar. O registro não foi alterado. Verifique o armazenamento do navegador.",
      );
      return false;
    }
  };
  const nomes = nomesUnicos([
    ...ctx.dados.historias.flatMap((h) => h.analistas),
    ...base.alocacoes.map((a) => a.analista),
  ]);
  const escopo = ctx.historias.filter(
    (h) =>
      h.analistas.length > 0 &&
      (!filtros.analistas.length ||
        h.analistas.some((a) => filtros.analistas.includes(a))) &&
      (!filtros.complexidade ||
        faixaPontos(h.pontos) === filtros.complexidade) &&
      (!filtros.etapa ||
        estadoUS(base.transicoes, h.codigo, ctx.filtros.final)?.etapa ===
          filtros.etapa) &&
      (!filtros.situacao ||
        (filtros.situacao === "Sem registro"
          ? !estadoUS(base.transicoes, h.codigo, ctx.filtros.final)
          : filtros.situacao === "Concluída"
            ? base.transicoes.some(
                (t) =>
                  t.us === h.codigo &&
                  t.sprint <= ctx.filtros.final &&
                  t.etapa === "Conclusão da especificação",
              )
            : estadoUS(base.transicoes, h.codigo, ctx.filtros.final)?.etapa ===
              filtros.situacao)),
  );
  const historias = distintas(escopo),
    codigos = new Set(historias.map((h) => h.codigo));
  const pessoaAceita = (a: string) =>
    (!ctx.filtros.analista || a === ctx.filtros.analista) &&
    (!filtros.analistas.length || filtros.analistas.includes(a));
  const periodoAceita = (s: number) =>
    s >= ctx.filtros.inicial && s <= ctx.filtros.final;
  const atividades = base.atividades.filter(
    (a) =>
      periodoAceita(a.sprint) &&
      pessoaAceita(a.analista) &&
      (a.us
        ? codigos.has(a.us) &&
          escopo.some((h) => h.codigo === a.us && h.sprint === a.sprint)
        : !filtros.complexidade &&
          !filtros.situacao &&
          !filtros.etapa &&
          !ctx.filtros.squad &&
          !ctx.filtros.desenvolvedor &&
          !ctx.filtros.situacao &&
          (!ctx.filtros.modulo || a.modulo === ctx.filtros.modulo)),
  );
  const transicoes = base.transicoes.filter(
    (t) =>
      t.sprint <= ctx.filtros.final &&
      codigos.has(t.us) &&
      pessoaAceita(t.analista),
  );
  const alocacoes = base.alocacoes.filter(
    (a) => periodoAceita(a.sprint) && pessoaAceita(a.analista),
  );
  const restrito = Boolean(
    ctx.filtros.modulo ||
    ctx.filtros.squad ||
    ctx.filtros.desenvolvedor ||
    ctx.filtros.situacao ||
    filtros.complexidade ||
    filtros.situacao ||
    filtros.etapa,
  );
  const sprints = ctx.sprints.map((s) => s.numero),
    analistas = nomesUnicos(escopo.flatMap((h) => h.analistas));
  const tempos = historias.map((h) => ({
    us: h.codigo,
    ...temposUS(transicoes, h.codigo, base.config.feriados),
  }));
  const concluidas = historias.filter((h) =>
    transicoes.some(
      (t) =>
        t.us === h.codigo &&
        periodoAceita(t.sprint) &&
        t.etapa === "Conclusão da especificação",
    ),
  );
  const valores = (campo: "analise" | "validacao" | "ciclo") =>
    tempos.flatMap((t) => (t[campo] === null ? [] : [t[campo]!]));
  const capacitySprint = (s: number) => {
    const linhas = alocacoes.filter((a) => a.sprint === s),
      esperados = nomesUnicos(
        escopo.filter((h) => h.sprint === s).flatMap((h) => h.analistas),
      );
    return !restrito &&
      linhas.length &&
      esperados.every((n) => linhas.some((a) => a.analista === n))
      ? linhas.reduce((v, a) => v + liquida(a), 0)
      : null;
  };
  const capacidades = sprints.map(capacitySprint),
    capacity =
      capacidades.length && capacidades.every((v) => v !== null)
        ? capacidades.reduce<number>((s, v) => s + v!, 0)
        : null;
  const demandaSprint = sprints.map((s) => {
    const hs = distintas(escopo.filter((h) => h.sprint === s));
    const es = hs.map(
      (h) =>
        transicoes
          .filter(
            (t) => t.us === h.codigo && t.sprint === s && t.estimativa !== null,
          )
          .at(-1)?.estimativa ?? null,
    );
    return es.length && es.every((v) => v !== null)
      ? es.reduce<number>((v, n) => v + n!, 0)
      : null;
  });
  const demanda =
    demandaSprint.length && demandaSprint.every((v) => v !== null)
      ? demandaSprint.reduce<number>((s, v) => s + v!, 0)
      : null;
  const carga =
    capacity !== null && capacity > 0 && demanda !== null
      ? (demanda / capacity) * 100
      : null;
  const horas = atividades.length
    ? atividades.reduce((s, a) => s + a.horas, 0)
    : null;
  const retrabalho = atividades.filter((a) => a.motivo),
    horasRetrabalho = retrabalho.reduce((s, a) => s + a.horas, 0);
  const wip = (s: number) => {
    const hs = distintas(escopo.filter((h) => h.sprint <= s));
    const conhecidos = hs.filter((h) => estadoUS(transicoes, h.codigo, s));
    return conhecidos.length
      ? conhecidos.filter(
          (h) =>
            !["Aprovação final", "Cancelada"].includes(
              estadoUS(transicoes, h.codigo, s)!.etapa,
            ),
        ).length
      : null;
  };
  const filtrosTexto = `${ctx.periodo} · ${ctx.filtros.analista || filtros.analistas.join(", ") || "Todos os analistas"} · ${ctx.filtros.modulo || "Todos os módulos"} · ${ctx.filtros.squad || "Todas as squads"} · ${filtros.complexidade || "Todas as complexidades"} · ${filtros.situacao || "Todas as situações da análise"} · ${filtros.etapa || "Todas as etapas"} · situação da história: ${ctx.filtros.situacao || "Todas"} · desenvolvedor: ${ctx.filtros.desenvolvedor || "Todos"}`;
  const abrir = (
    titulo: string,
    formula: string,
    hs = escopo,
    registros?: object[],
  ) => {
    setSprintDetalhe("");
    setAnalistaDetalhe("");
    setDetalhe({ titulo, formula, historias: hs, registros });
  };
  const serie = (
    nome: string,
    v: (number | null)[],
    i: number,
    tipo?: "line",
  ): SerieProjeto => ({ nome, valores: v, cor: CORES[i % CORES.length], tipo });
  const indisponivel =
    "Aguardando informações: registre atividades e transições da análise. Situação de desenvolvimento não comprova escrita ou aprovação.";
  const kpis = [
    {
      titulo: "Histórias atribuídas",
      valor: historias.length || (escopo.length ? 0 : null),
      formula:
        "Contagem de códigos de US distintos no recorte, com analista atribuído. Reaparições não criam novas histórias.",
      hs: historias,
      nota: `${escopo.length} registros por sprint; sem ranking individual`,
    },
    {
      titulo: "Histórias com análise concluída",
      valor: transicoes.some(
        (t) =>
          t.etapa === "Conclusão da especificação" && periodoAceita(t.sprint),
      )
        ? concluidas.length
        : null,
      formula:
        "US distintas com transição explícita de conclusão da especificação no período.",
      hs: concluidas,
      nota: "Conclusão da especificação registrada",
    },
    {
      titulo: "Complexidade média",
      valor: media(
        historias.flatMap((h) => (h.pontos === null ? [] : [h.pontos])),
      ),
      formula:
        "Soma dos story points conhecidos / histórias pontuadas; última aparição por US. Não representa horas ou o índice interno de análise.",
      hs: historias.filter((h) => h.pontos !== null),
      nota: `${historias.filter((h) => h.pontos !== null).length}/${historias.length} US pontuadas · story points`,
    },
    {
      titulo: "Tempo médio de análise",
      valor: media(valores("analise")),
      formula:
        "Média de dias úteis decorridos entre início do levantamento e conclusão da especificação. Exclui a data inicial, fins de semana e feriados cadastrados.",
      hs: historias.filter((h) =>
        tempos.some((t) => t.us === h.codigo && t.analise !== null),
      ),
      nota: `${valores("analise").length} US com datas · dias úteis`,
      sufixo: " d",
    },
    {
      titulo: "Tempo médio de validação",
      valor: media(valores("validacao")),
      formula:
        "Média de dias úteis entre primeiro envio ao cliente e aprovação final. Espera externa não equivale a trabalho ativo.",
      hs: historias.filter((h) =>
        tempos.some((t) => t.us === h.codigo && t.validacao !== null),
      ),
      nota: `${valores("validacao").length} US com datas · dias úteis`,
      sufixo: " d",
    },
    {
      titulo: "Capacity da equipe",
      valor: capacity,
      formula:
        "Σ(dias úteis × jornada × dedicação) − reuniões − férias − afastamentos − apoio − trabalho não planejado. Requer alocação em todas as sprints selecionadas. Filtros de história não permitem ratear capacity.",
      hs: historias,
      nota: "Disponibilidade líquida cadastrada",
      sufixo: " h",
    },
    {
      titulo: "Índice de carga planejada",
      valor: carga,
      formula:
        "Σ horas estimadas de análise por US/sprint / Σ capacity líquida das sprints × 100. Exige estimativa de todas as US de cada sprint; story points não são convertidos em horas.",
      hs: historias,
      nota: "100% de ocupação não é uma meta",
      sufixo: "%",
    },
    {
      titulo: "Demandas simultâneas",
      valor: wip(ctx.filtros.final),
      formula:
        "US com etapa registrada até a última sprint, exceto aprovadas ou canceladas. É um retrato ao final da sprint, com cobertura parcial quando faltam transições.",
      hs: historias.filter((h) => {
        const t = estadoUS(transicoes, h.codigo);
        return t && !["Aprovação final", "Cancelada"].includes(t.etapa);
      }),
      nota: `Sprint anterior: ${numero(wip(ctx.filtros.final - 1))} · somente US acompanhadas`,
    },
  ];
  const grupos =
    agrupamento === "Sprint"
      ? sprints.map(String)
      : agrupamento === "Analista"
        ? analistas
        : agrupamento === "Módulo"
          ? nomesUnicos(historias.map((h) => h.modulo || "Não informado"))
          : FAIXAS;
  const grupoAceita = (h: HistoriaProjeto, grupo: string) =>
    agrupamento === "Sprint"
      ? escopo.some((x) => x.codigo === h.codigo && String(x.sprint) === grupo)
      : agrupamento === "Analista"
        ? h.analistas.includes(grupo)
        : agrupamento === "Módulo"
          ? (h.modulo || "Não informado") === grupo
          : faixaPontos(h.pontos) === grupo;
  const complexas = distintas(
    escopo.filter(
      (h) => !sprintComplexidade || String(h.sprint) === sprintComplexidade,
    ),
  );
  const backlog = sprints.map((s) => wip(s));
  const fluxoCompleto =
    !restrito &&
    !ctx.filtros.analista &&
    !filtros.analistas.length &&
    base.config.pendenciasIniciais != null;
  const fluxo = Array.from({ length: 6 }, (_, i) => i + 18).map((s) => {
    const ts = base.transicoes.filter((t) => t.sprint === s);
    const primeiras = (etapa: string) =>
      new Set(
        ts
          .filter(
            (t) =>
              t.etapa === etapa &&
              !base.transicoes.some(
                (a) => a.us === t.us && a.etapa === etapa && a.sprint < s,
              ),
          )
          .map((t) => t.us),
      ).size;
    return {
      sprint: s,
      entradas: primeiras("Demanda recebida"),
      aprovadas: primeiras("Aprovação final"),
      canceladas: primeiras("Cancelada"),
    };
  });
  const saldoBacklog = sprints.map((s) =>
    fluxoCompleto
      ? base.config.pendenciasIniciais! +
        fluxo
          .filter((f) => f.sprint <= s)
          .reduce((v, f) => v + f.entradas - f.aprovadas - f.canceladas, 0)
      : null,
  );
  const ultimaData = ctx.dados.sprints.find(
    (s) => s.numero === ctx.filtros.final,
  )?.fim;
  const abertas = historias.filter((h) => {
    const t = estadoUS(transicoes, h.codigo);
    return t && !["Aprovação final", "Cancelada"].includes(t.etapa);
  });
  const esperas = transicoes
    .filter((t) => t.etapa === "Envio para validação")
    .map((t) => {
      const retorno = transicoes
        .filter(
          (r) =>
            r.us === t.us &&
            r.data >= t.data &&
            ["Retorno da validação", "Aprovação final"].includes(r.etapa),
        )
        .sort((a, b) => a.data.localeCompare(b.data))[0];
      return {
        us: t.us,
        envio: t.data,
        retorno: retorno?.data ?? null,
        dias: retorno
          ? diasUteis(t.data, retorno.data, base.config.feriados)
          : ultimaData
            ? diasUteis(t.data, ultimaData, base.config.feriados)
            : null,
      };
    });
  const resumoSprint = sprints.map((s, i) => ({
    sprint: s,
    historias: distintas(escopo.filter((h) => h.sprint === s)).length,
    mediaPontos: media(
      distintas(escopo.filter((h) => h.sprint === s)).flatMap((h) =>
        h.pontos === null ? [] : [h.pontos],
      ),
    ),
    capacity: capacidades[i],
    demanda: demandaSprint[i],
    carga:
      capacidades[i] !== null &&
      capacidades[i]! > 0 &&
      demandaSprint[i] !== null
        ? (demandaSprint[i]! / capacidades[i]!) * 100
        : null,
    excesso:
      capacidades[i] !== null && demandaSprint[i] !== null
        ? Math.max(0, demandaSprint[i]! - capacidades[i]!)
        : null,
    wip: backlog[i],
    fte: alocacoes.some((a) => a.sprint === s)
      ? alocacoes
          .filter((a) => a.sprint === s)
          .reduce((v, a) => v + fteAnalise(a, base.config.jornadaFte ?? 8), 0)
      : null,
  }));
  const complementares = [
    ...analistas.map((a) => ({
      nome: `WIP · ${a}`,
      valor: transicoes.some((t) => t.analista === a)
        ? abertas.filter((h) => estadoUS(transicoes, h.codigo)?.analista === a)
            .length
        : null,
      unidade: "US",
      formula:
        "US abertas com última transição atribuída ao analista. Cobertura restrita ao histórico registrado.",
    })),
    {
      nome: "Histórias aguardando aprovação",
      valor: transicoes.length
        ? abertas.filter((h) =>
            ["Aguardando validação", "Validação com cliente"].includes(
              etapaAtual(estadoUS(transicoes, h.codigo)?.etapa) ?? "",
            ),
          ).length
        : null,
      unidade: "US",
      formula:
        "US abertas cuja última etapa é de espera ou validação com cliente.",
    },
    {
      nome: "Tempo médio de resposta do cliente",
      valor: media(
        esperas
          .filter((e) => e.retorno)
          .flatMap((e) => (e.dias === null ? [] : [e.dias])),
      ),
      unidade: "dias úteis",
      formula:
        "Dias úteis por rodada entre envio e retorno; somente rodadas encerradas.",
    },
    {
      nome: "Espera acumulada por validação",
      valor: esperas.some((e) => e.dias !== null)
        ? esperas.reduce((s, e) => s + (e.dias ?? 0), 0)
        : null,
      unidade: "dias úteis",
      formula:
        "Soma de dias úteis das rodadas. Rodadas abertas medidas até o fim da sprint selecionada; pode somar esperas simultâneas.",
    },
    {
      nome: "Validações acima do prazo",
      valor:
        base.config.prazo !== null && esperas.some((e) => e.dias !== null)
          ? new Set(
              esperas
                .filter((e) => e.dias !== null && e.dias > base.config.prazo!)
                .map((e) => e.us),
            ).size
          : null,
      unidade: "US",
      formula:
        "US com espera de validação acima do prazo configurado. Sem prazo, não há classificação.",
    },
    {
      nome: "Idade média das pendências acompanhadas",
      valor: media(
        abertas.flatMap((h) => {
          const inicio = transicoes.find(
            (t) => t.us === h.codigo && t.etapa === "Levantamento",
          );
          const dias =
            inicio && ultimaData
              ? diasUteis(inicio.data, ultimaData, base.config.feriados)
              : null;
          return dias === null ? [] : [dias];
        }),
      ),
      unidade: "dias úteis",
      formula:
        "Dias úteis entre início do levantamento e fim da sprint, somente US abertas com início conhecido.",
    },
    {
      nome: "Histórias sem estimativa de pontos",
      valor: historias.length
        ? historias.filter((h) => h.pontos === null).length
        : null,
      unidade: "US",
      formula:
        "US distintas cuja última aparição não possui story points. Não representa ausência de estimativa em horas.",
    },
    {
      nome: "Demandas inseridas durante a sprint",
      valor: null,
      unidade: "US",
      formula:
        "Exige data de entrada e fotografia do planejamento inicial; primeira aparição na planilha não comprova entrada durante a sprint.",
    },
    {
      nome: "Tempo sem movimentação",
      valor: media(
        abertas.flatMap((h) => {
          const t = estadoUS(transicoes, h.codigo);
          const d =
            t && ultimaData
              ? diasUteis(t.data, ultimaData, base.config.feriados)
              : null;
          return d === null ? [] : [d];
        }),
      ),
      unidade: "dias úteis",
      formula:
        "Média de dias úteis entre última transição e fim da sprint selecionada; consulte cada US no detalhamento.",
    },
    {
      nome: "Crescimento do backlog global",
      valor: null,
      unidade: "US",
      formula:
        "Saldo inicial + entradas reais − aprovações − cancelamentos. O saldo inicial global e as datas de recebimento não estão disponíveis na planilha.",
    },
    ...resumoSprint.map((s) => ({
      nome: `Histórias por FTE · Sprint ${s.sprint}`,
      valor: s.fte && s.fte > 0 ? s.historias / s.fte : null,
      unidade: "US/FTE",
      formula:
        "US distintas atribuídas na sprint / FTE nominal cadastrado. FTE exige cadastro de dedicação; não indica disponibilidade líquida.",
    })),
  ];
  const report = () => ({
    periodo: ctx.periodo,
    filtros: filtrosTexto,
    fonte: ctx.dados.arquivo,
    indicadores: kpis.map((k) => ({
      indicador: k.titulo,
      resultado: k.valor ?? "Dados não disponíveis",
      formula: k.formula,
    })),
    historias,
    atividades,
    transicoes,
    alocacoes,
    config: base.config,
  });
  const executar = async (acao: () => Promise<void>) => {
    setOcupado(true);
    try {
      await acao();
      setMensagem("Arquivo gerado com os filtros aplicados.");
    } catch (e) {
      setMensagem(e instanceof Error ? e.message : "Falha ao gerar arquivo.");
    } finally {
      setOcupado(false);
    }
  };
  const exportar = async (tipo: "excel" | "pdf", detalheAtual?: Detalhe) => {
    const r = report();
    if (tipo === "excel") {
      const { Workbook } = await import("exceljs");
      const wb = new Workbook();
      const tabelas: [string, object[]][] = detalheAtual
        ? [
            ["Detalhamento", detalheAtual.registros ?? detalheAtual.historias],
            [
              "Critérios",
              [
                {
                  fonte: ctx.dados.arquivo,
                  filtros: filtrosTexto,
                  sprintDetalhe,
                  analistaDetalhe,
                  formula: detalheAtual.formula,
                },
              ],
            ],
          ]
        : [
            ["Indicadores", r.indicadores],
            ["Resumo por sprint", resumoSprint],
            ["Indicadores complementares", complementares],
            [
              "Relatório gerencial",
              Object.entries(resumosRelatorio).map(([tema, resultado]) => ({
                tema,
                resultado,
              })),
            ],
            ["Histórias", historias],
            ["Atividades", atividades],
            ["Transições e rodadas", transicoes],
            ["Alocações", alocacoes],
            ["Parâmetros", [base.config]],
            [
              "Riscos",
              riscos.map((x) => ({
                indicador: x[0],
                resultado: x[1],
                tendencia: x[2],
                situacao: x[3],
              })),
            ],
            [
              "Metodologia",
              [
                {
                  fonte: r.fonte,
                  filtros: r.filtros,
                  conclusao: conclusao,
                  feriados: base.config.feriados.join(", "),
                },
              ],
            ],
          ];
      for (const [nome, linhas] of tabelas) {
        const ws = wb.addWorksheet(nome);
        const chaves = [...new Set(linhas.flatMap((l) => Object.keys(l)))];
        ws.addRow(chaves.length ? chaves : ["Aguardando informações"]);
        linhas.forEach((l) =>
          ws.addRow(
            chaves.map((c) => {
              const v = (l as Record<string, unknown>)[c];
              return typeof v === "object" ? JSON.stringify(v) : v;
            }),
          ),
        );
        ws.getRow(1).font = { bold: true };
        ws.columns.forEach((c) => {
          c.width = 26;
        });
      }
      baixarArquivo(
        new Blob([await wb.xlsx.writeBuffer()], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        "sigep-analise.xlsx",
      );
    } else {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      let y = 18;
      const escrever = (texto: string) => {
        const linhas = doc.splitTextToSize(texto, 178) as string[];
        for (const linha of linhas) {
          if (y > 278) {
            doc.addPage();
            y = 18;
          }
          doc.text(linha, 16, y);
          y += 5;
        }
        y += 4;
      };
      doc.setFontSize(15);
      escrever("SIGEP - Produtividade e Capacidade da Análise");
      doc.setFontSize(10);
      escrever(`Fonte: ${r.fonte}. ${r.filtros}`);
      r.indicadores.forEach((k) => {
        escrever(
          `${k.indicador}: ${typeof k.resultado === "number" ? numero(k.resultado, 2) : k.resultado}`,
        );
        escrever(k.formula);
      });
      for (const tema of [
        "Evolução das histórias atribuídas",
        "Análises concluídas",
        "Complexidade",
        "Distribuição das atividades",
        "Levantamento e especificação",
        "Validação com cliente",
        "Rodadas de revisão",
        "Retrabalho",
        "Capacity versus demanda",
        "Tamanho da equipe",
        "Backlog e demandas simultâneas",
        "Riscos identificados",
        "Recomendações de melhoria",
      ]) {
        escrever(tema);
        escrever(resumosRelatorio[tema] ?? indisponivel);
      }
      escrever(`Conclusão executiva: ${conclusao}`);
      complementares.forEach((m) =>
        escrever(
          `${m.nome}: ${m.valor === null ? "Dados não disponíveis" : numero(m.valor, 1) + " " + m.unidade}. ${m.formula}`,
        ),
      );
      baixarArquivo(doc.output("blob"), "sigep-relatorio-analise.pdf");
    }
  };
  const riscos = [
    [
      "Demanda/capacity",
      carga === null ? "Dados não disponíveis" : `${numero(carga, 1)}%`,
      "Sem comparação suficiente",
      carga === null
        ? "Aguardando informações"
        : carga > base.config.carga
          ? "Demanda superior à disponibilidade"
          : carga >= base.config.margem
            ? "Atenção à carga"
            : "Capacidade com margem",
    ],
    [
      "Backlog",
      numero(saldoBacklog.at(-1)),
      "Saldo inicial + entradas − aprovações − cancelamentos registrados",
      saldoBacklog.some((s) => s !== null && s < 0)
        ? "Inconsistência: saídas excedem o saldo e as entradas"
        : "Sem limite configurado",
    ],
    [
      "Complexidade",
      numero(kpis[2].valor, 1),
      "Última pontuação por US",
      "Informativo · story points",
    ],
    [
      "Tempo de validação",
      numero(kpis[4].valor, 1),
      "Sem comparação suficiente",
      base.config.prazo === null
        ? "Sem prazo configurado"
        : kpis[4].valor === null
          ? "Aguardando informações"
          : kpis[4].valor > base.config.prazo
            ? "Acima do prazo configurado"
            : "Dentro do prazo configurado",
    ],
    [
      "Demandas simultâneas",
      numero(wip(ctx.filtros.final)),
      "Retrato ao final da sprint",
      base.config.wip === null
        ? "Sem limite de WIP"
        : wip(ctx.filtros.final) === null
          ? "Aguardando informações"
          : wip(ctx.filtros.final)! > base.config.wip
            ? "Acima do limite definido"
            : "Dentro do limite definido",
    ],
    [
      "Retrabalho",
      horas
        ? `${numero((horasRetrabalho / horas) * 100, 1)}%`
        : "Dados não disponíveis",
      "Somente horas registradas",
      base.config.retrabalho === null
        ? "Sem referência configurada"
        : horas
          ? (horasRetrabalho / horas) * 100 > base.config.retrabalho
            ? "Acima da referência"
            : "Dentro da referência"
          : "Aguardando informações",
    ],
  ];
  const ultimo = resumoSprint.at(-1),
    penultimo = resumoSprint.at(-2);
  const comparar = (
    atual: number | null | undefined,
    anterior: number | null | undefined,
  ) =>
    atual == null || anterior == null
      ? "Sem comparação suficiente"
      : atual > anterior
        ? "Aumentou"
        : atual < anterior
          ? "Diminuiu"
          : "Permaneceu estável";
  riscos[0][2] = `${comparar(ultimo?.carga, penultimo?.carga)} · duas últimas sprints`;
  riscos[1][2] = `${comparar(saldoBacklog.at(-1), saldoBacklog.at(-2))} · duas últimas sprints`;
  riscos[2][2] = `${comparar(ultimo?.mediaPontos, penultimo?.mediaPontos)} · duas últimas sprints`;
  riscos[4][2] = `${comparar(backlog.at(-1), backlog.at(-2))} · duas últimas sprints`;
  const insights: string[] = [];
  if (
    ultimo &&
    penultimo &&
    ultimo.capacity !== null &&
    penultimo.capacity !== null &&
    ultimo.historias > penultimo.historias &&
    ultimo.capacity === penultimo.capacity
  )
    insights.push(
      "A quantidade de demandas atribuídas cresceu, enquanto a capacidade cadastrada permaneceu estável nas duas últimas sprints.",
    );
  if (
    base.config.wip !== null &&
    wip(ctx.filtros.final)! > base.config.wip &&
    wip(ctx.filtros.final) !== null
  )
    insights.push(
      "O número de demandas simultâneas acompanhadas ultrapassou o limite de WIP definido para a equipe.",
    );
  const conclusao = `${historias.length} histórias distintas em ${escopo.length} registros. ${historias.filter((h) => h.pontos === null).length} histórias sem pontuação. ${carga === null ? "Não há evidência suficiente para concluir se a capacidade acompanha a demanda. Complete alocações e estimativas de análise." : `Carga planejada calculada: ${numero(carga, 1)}%. ${riscos[0][3]}.`} Atribuições, conclusões de análise e aprovação são medidas distintas. ${insights.join(" ")}`;
  const resumosRelatorio: Record<string, string> = {
    "Evolução das histórias atribuídas": sprints
      .map(
        (s) =>
          `Sprint ${s}: ${distintas(escopo.filter((h) => h.sprint === s)).length} US`,
      )
      .join("; "),
    "Análises concluídas": `${numero(kpis[1].valor)}. Exige conclusão explícita da especificação.`,
    Complexidade: `${numero(kpis[2].valor, 2)} story points em média. Índice interno separado, proposto e configurável.`,
    "Distribuição das atividades": atividades.length
      ? ATIVIDADES.map(
          (t) =>
            `${t}: ${numero(
              atividades
                .filter((a) => a.tipo === t)
                .reduce((s, a) => s + a.horas, 0),
              1,
            )} h`,
        ).join("; ")
      : indisponivel,
    "Levantamento e especificação": `${numero(kpis[3].valor, 1)} dias úteis; ${valores("analise").length} US com datas.`,
    "Validação com cliente": `${numero(kpis[4].valor, 1)} dias úteis; espera externa não atribuída automaticamente aos analistas.`,
    "Rodadas de revisão":
      tempos
        .filter((t) => t.aprovacao && t.rodadas !== null)
        .map((t) => `${t.us}: ${t.rodadas} rodada(s)`)
        .join("; ") || indisponivel,
    Retrabalho: horas
      ? `${numero(horasRetrabalho, 1)} h; ${numero((horasRetrabalho / horas) * 100, 1)}% das horas registradas. Revisões por mudança de negócio não equivalem a falhas.`
      : indisponivel,
    "Capacity versus demanda": `${numero(capacity, 1)} h líquidas; ${numero(demanda, 1)} h estimadas; ${numero(carga, 1)}% de carga.`,
    "Tamanho da equipe": resumoSprint
      .map(
        (s) =>
          `Sprint ${s.sprint}: ${alocacoes.filter((a) => a.sprint === s.sprint).length || "não informado"} alocações; ${numero(s.fte, 2)} FTE (jornada de referência configurada: ${base.config.jornadaFte ?? 8} h/dia)`,
      )
      .join("; "),
    "Backlog e demandas simultâneas": sprints
      .map(
        (s, i) =>
          `Sprint ${s}: ${numero(backlog[i])} abertas acompanhadas; backlog com saldo inicial: ${numero(saldoBacklog[i])}`,
      )
      .join("; "),
    "Riscos identificados": riscos
      .map((r) => `${r[0]}: ${r[1]} - ${r[3]}`)
      .join("; "),
    "Recomendações de melhoria":
      "Completar datas, horas, estimativas e alocações ausentes; acordar limites de gestão antes de classificar riscos. Preservar o histórico das rodadas e registrar as causas das revisões.",
  };
  const registrar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      str = (k: string) => String(f.get(k) ?? "").trim(),
      num = (k: string) => Number(str(k));
    const id = criarIdRegistroAnalise(),
      analista =
        nomes.find((n) => normalizar(n) === normalizar(str("analista"))) ??
        str("analista"),
      sprint = num("sprint"),
      us = str("us").toUpperCase();
    let nova: BaseAnalise = { ...base };
    if (
      (modal === "atividade" || modal === "transicao") &&
      us &&
      !ctx.dados.historias.some((h) => h.codigo === us && h.sprint === sprint)
    ) {
      setMensagem(
        "A US selecionada não está vinculada à sprint informada. Selecione a sprint correta.",
      );
      return;
    }
    if (modal === "atividade") {
      if (str("fim") && str("fim") < str("inicio")) {
        setMensagem("A conclusão deve ser posterior ao início.");
        return;
      }
      nova = {
        ...base,
        atividades: [
          ...base.atividades,
          {
            id,
            analista,
            sprint,
            us,
            modulo: str("modulo"),
            tipo: str("tipo"),
            inicio: str("inicio"),
            fim: str("fim"),
            horas: num("horas"),
            situacao: str("situacao"),
            impedimento: str("impedimento"),
            observacao: str("observacao"),
            motivo: str("motivo"),
          },
        ],
      };
    } else if (modal === "transicao") {
      const dimensoes = Array.from({ length: 6 }, (_, i) => str(`dim${i}`));
      if (dimensoes.some(Boolean) && !dimensoes.every(Boolean)) {
        setMensagem(
          "Preencha as seis dimensões ou deixe todas sem informação.",
        );
        return;
      }
      const historico = base.transicoes
        .filter((t) => t.us === us)
        .sort((a, b) => a.data.localeCompare(b.data));
      if (
        historico.at(-1) &&
        (str("data") < historico.at(-1)!.data ||
          sprint < historico.at(-1)!.sprint)
      ) {
        setMensagem(
          "A transição deve preservar a ordem cronológica do histórico.",
        );
        return;
      }
      nova = {
        ...base,
        transicoes: [
          ...base.transicoes,
          {
            id,
            analista,
            sprint,
            us,
            etapa: str("etapa"),
            data: str("data"),
            estimativa: str("estimativa") === "" ? null : num("estimativa"),
            dimensoes:
              str("dim0") === ""
                ? null
                : Array.from({ length: 6 }, (_, i) => num(`dim${i}`)),
          },
        ],
      };
    } else if (modal === "alocacao") {
      if (
        base.alocacoes.some(
          (a) => a.analista === analista && a.sprint === sprint,
        )
      ) {
        setMensagem(
          "Já existe alocação para este analista nesta sprint. Remova o registro anterior antes de corrigir.",
        );
        return;
      }
      const a = {
        id,
        analista,
        sprint,
        dias: num("dias"),
        jornada: num("jornada"),
        dedicacao: num("dedicacao"),
        reunioes: num("reunioes"),
        ferias: num("ferias"),
        afastamentos: num("afastamentos"),
        apoio: num("apoio"),
        imprevistos: num("imprevistos"),
      };
      if (liquida(a) < 0) {
        setMensagem("Os descontos excedem as horas alocadas.");
        return;
      }
      nova = { ...base, alocacoes: [...base.alocacoes, a] };
    } else if (modal === "config") {
      if (num("baixa") >= num("media") || num("margem") >= num("carga")) {
        setMensagem("Os limites devem estar em ordem crescente.");
        return;
      }
      nova = {
        ...base,
        config: {
          margem: num("margem"),
          carga: num("carga"),
          baixa: num("baixa"),
          media: num("media"),
          wip: str("wip") === "" ? null : num("wip"),
          prazo: str("prazo") === "" ? null : num("prazo"),
          retrabalho: str("retrabalho") === "" ? null : num("retrabalho"),
          feriados: str("feriados")
            .split(/[\s,;]+/)
            .filter(Boolean),
          pendenciasIniciais:
            str("pendenciasIniciais") === "" ? null : num("pendenciasIniciais"),
          jornadaFte: num("jornadaFte"),
        },
      };
      if (nova.config.feriados.some((d) => !/^\d{4}-\d{2}-\d{2}$/.test(d))) {
        setMensagem("Informe feriados no formato AAAA-MM-DD.");
        return;
      }
    }
    if (modal === "atividade" && us) {
      const novas: typeof base.transicoes = [];
      const adicionar = (etapa: string, data: string) => {
        if (!base.transicoes.some((t) => t.us === us && t.etapa === etapa))
          novas.push({
            id: `${id}-${novas.length}`,
            analista,
            sprint,
            us,
            etapa,
            data,
            estimativa: null,
            dimensoes: null,
          });
      };
      if (["Levantamento", "Especificação"].includes(str("tipo"))) {
        adicionar(str("tipo"), str("inicio"));
        if (str("situacao") === "Concluída" && str("fim"))
          adicionar(
            str("tipo") === "Levantamento"
              ? "Conclusão do levantamento"
              : "Conclusão da especificação",
            str("fim"),
          );
      }
      nova = {
        ...nova,
        transicoes: [...nova.transicoes, ...novas].sort(
          (a, b) => a.data.localeCompare(b.data) || a.id.localeCompare(b.id),
        ),
      };
    }
    if (salvar(nova)) setModal("");
  };
  const opcoesUS = useMemo(() => distintas(ctx.dados.historias), [ctx.dados]);
  const inputNumero = (
    nome: string,
    label: string,
    padrao?: number,
    min = 0,
    max?: number,
    obrigatorio = true,
  ) => (
    <label key={nome}>
      {label}
      <input
        name={nome}
        type="number"
        min={min}
        max={max}
        step="0.01"
        defaultValue={padrao}
        required={obrigatorio}
      />
    </label>
  );
  const grafico = (
    id: string,
    titulo: string,
    labels: string[],
    series: SerieProjeto[],
    formula: string,
    selecionar?: (i: number, j: number) => void,
    horizontal = false,
    tipo: "bar" | "line" = "bar",
    empilhado = true,
  ) => (
    <GraficoProjeto
      id={`analise-${id}`}
      titulo={titulo}
      periodo={ctx.periodo}
      labels={labels}
      series={series}
      descricao={formula}
      horizontal={horizontal}
      tipo={tipo}
      empilhado={empilhado}
      selecionado={
        ctx.foco !== null &&
        (labels.includes(String(ctx.foco)) ||
          labels.includes(`Sprint ${ctx.foco}`))
          ? labels.findIndex(
              (l) => l === String(ctx.foco) || l === `Sprint ${ctx.foco}`,
            )
          : (selecoes[id] ?? null)
      }
      onSelecionar={(i, j) => {
        setSelecoes((s) => ({ ...s, [id]: i }));
        if (selecionar) {
          selecionar(i, j);
          return;
        }
        const sprint = Number(labels[i]);
        let registros = atividades.filter(
          (a) =>
            (!sprints.includes(sprint) || a.sprint === sprint) &&
            (!ATIVIDADES.includes(series[j]?.nome) ||
              a.tipo === series[j].nome) &&
            (!MOTIVOS.includes(series[j]?.nome) || a.motivo === series[j].nome),
        );
        if (id === "ativo")
          registros = registros.filter((a) =>
            historias.some(
              (h) => h.codigo === a.us && grupoAceita(h, labels[i]),
            ),
          );
        const hs = escopo.filter(
          (h) =>
            (!sprints.includes(sprint) || h.sprint === sprint) &&
            (!registros.length || registros.some((a) => a.us === h.codigo)),
        );
        abrir(
          `${titulo} · ${labels[i]} · ${series[j]?.nome ?? ""}`,
          formula,
          hs,
          id === "fluxo"
            ? transicoes.filter((t) => t.sprint === sprint)
            : registros,
        );
      }}
    />
  );
  const detalheFiltrado = detalhe
    ? {
        ...detalhe,
        historias: detalhe.historias.filter(
          (h) =>
            (!sprintDetalhe || String(h.sprint) === sprintDetalhe) &&
            (!analistaDetalhe || h.analistas.includes(analistaDetalhe)),
        ),
        registros: detalhe.registros?.filter((r) => {
          const v = r as Record<string, unknown>;
          return (
            (!sprintDetalhe ||
              v.sprint === undefined ||
              String(v.sprint) === sprintDetalhe) &&
            (!analistaDetalhe ||
              v.analista === undefined ||
              v.analista === analistaDetalhe)
          );
        }),
      }
    : null;
  return (
    <div className="analise-painel">
      <div className="ind-section-heading">
        <div>
          <span className="ind-eyebrow">Gestão sustentável da demanda</span>
          <h2>Produtividade e Capacidade da Análise</h2>
          <p>
            Acompanhamento da demanda, complexidade, esforço e capacidade dos
            analistas de requisitos.
          </p>
        </div>
      </div>
      <div className="analise-aviso">
        <FiActivity />
        <span>
          Dados reais da planilha e registros complementares. Story points não
          são horas. Atribuição não comprova escrita ou aprovação. Indicadores
          parciais mostram sua cobertura.
        </span>
      </div>
      <form
        className="ind-filters analise-filtros"
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
              {nomes.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            <small>
              Sem seleção: todos. Use Ctrl/⌘ para selecionar vários.
            </small>
          </label>
          <label>
            Complexidade
            <select
              value={rascunho.complexidade}
              onChange={(e) =>
                setRascunho({ ...rascunho, complexidade: e.target.value })
              }
            >
              <option value="">Todas</option>
              {FAIXAS.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            Situação da análise
            <select
              value={rascunho.situacao}
              onChange={(e) =>
                setRascunho({ ...rascunho, situacao: e.target.value })
              }
            >
              <option value="">Todas</option>
              {[
                "Sem registro",
                "Concluída",
                "Aguardando validação",
                "Ajustes",
                "Aprovação final",
                "Cancelada",
              ].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            Etapa atual da história
            <select
              value={rascunho.etapa}
              onChange={(e) =>
                setRascunho({ ...rascunho, etapa: e.target.value })
              }
            >
              <option value="">Todas</option>
              {TRANSICOES.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="ind-filter-actions">
          <small>Sprint, módulo e squad: filtros globais acima.</small>
          <button
            className="ind-button secondary"
            type="button"
            onClick={() => {
              setRascunho(vazio());
              setFiltros(vazio());
            }}
          >
            Limpar filtros da análise
          </button>
          <button className="ind-button" type="submit">
            Aplicar filtros da análise
          </button>
        </div>
      </form>
      <div className="analise-acoes">
        <button className="ind-button" onClick={() => setModal("atividade")}>
          <FiPlus /> Registrar atividade
        </button>
        <button
          className="ind-button secondary"
          onClick={() => setModal("transicao")}
        >
          Registrar transição / validação
        </button>
        <button
          className="ind-button secondary"
          onClick={() => setModal("alocacao")}
        >
          <FiUsers /> Cadastrar alocação
        </button>
        <button
          className="ind-button secondary"
          onClick={() => setModal("simular")}
        >
          Simular Capacity
        </button>
        <button
          className="ind-button secondary"
          onClick={() => setModal("config")}
        >
          <FiSettings /> Parâmetros
        </button>
        <button
          className="ind-button secondary"
          onClick={() => setModal("relatorio")}
        >
          <FiDownload /> Gerar Relatório da Análise
        </button>
      </div>
      {mensagem && (
        <p role="status" className="ind-feedback">
          {mensagem}
          <button
            aria-label="Fechar aviso da análise"
            onClick={() => setMensagem("")}
          >
            ×
          </button>
        </p>
      )}
      <p className="analise-fonte">
        Fonte: {ctx.dados.arquivo} + registros locais · {filtrosTexto}
      </p>
      <div className="ind-kpi-grid">
        {kpis.map((k) => (
          <div
            key={k.titulo}
            className={cardAtivo === k.titulo ? "analise-selecionado" : ""}
          >
            <KpiProjeto
              titulo={k.titulo}
              valor={k.valor}
              casas={k.titulo.includes("méd") || k.sufixo === "%" ? 1 : 0}
              sufixo={k.sufixo}
              icone={<FiActivity />}
              ajuda={k.formula}
              nota={
                k.valor === null
                  ? "Dados não disponíveis · Aguardando informações"
                  : k.nota
              }
              periodo={ctx.periodo}
              onClick={() => {
                setCardAtivo(k.titulo);
                abrir(
                  k.titulo,
                  k.formula,
                  k.hs,
                  k.titulo.includes("Capacity")
                    ? alocacoes
                    : k.titulo.includes("Tempo")
                      ? tempos
                      : undefined,
                );
              }}
            />
          </div>
        ))}
      </div>
      <section>
        <div className="analise-controles">
          <h3>Evolução das histórias por analista</h3>
          <label>
            Medida
            <select value={modo} onChange={(e) => setModo(e.target.value)}>
              {[
                "Quantidade de histórias",
                "Pontos estimados",
                "Análises concluídas",
                "Em análise",
                "Reaparições",
              ].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
        {grafico(
          "evolucao",
          "Histórias por analista e sprint",
          sprints.map((s) => `Sprint ${s}`),
          analistas.map((a, i) =>
            serie(
              a,
              sprints.map((s) => {
                const hs = distintas(
                  escopo.filter(
                    (h) => h.sprint === s && h.analistas.includes(a),
                  ),
                );
                return modo === "Pontos estimados"
                  ? hs.some((h) => h.pontos !== null)
                    ? hs.reduce((v, h) => v + (h.pontos ?? 0), 0)
                    : null
                  : modo === "Análises concluídas"
                    ? transicoes.length
                      ? hs.filter((h) =>
                          transicoes.some(
                            (t) =>
                              t.us === h.codigo &&
                              t.sprint === s &&
                              t.etapa === "Conclusão da especificação",
                          ),
                        ).length
                      : null
                    : modo === "Em análise"
                      ? transicoes.length
                        ? hs.filter((h) => {
                            const t = estadoUS(transicoes, h.codigo, s);
                            return (
                              t &&
                              ![
                                "Conclusão da especificação",
                                "Aprovação final",
                                "Cancelada",
                              ].includes(t.etapa)
                            );
                          }).length
                        : null
                      : modo === "Reaparições"
                        ? hs.filter(
                            (h) => (ctx.primeiras.get(h.codigo) ?? s) < s,
                          ).length
                        : hs.length;
              }),
              i,
            ),
          ),
          "US distintas por analista em cada sprint. Associações compartilhadas não devem ser somadas como total global.",
          (i, j) => {
            const hs = escopo.filter(
              (h) =>
                h.sprint === sprints[i] && h.analistas.includes(analistas[j]),
            );
            const antes = distintas(
              escopo.filter(
                (h) =>
                  h.sprint === sprints[i] - 1 &&
                  h.analistas.includes(analistas[j]),
              ),
            ).length;
            abrir(
              `${analistas[j]} · Sprint ${sprints[i]}`,
              `Atribuições distintas. Variação: ${antes ? `${numero(((distintas(hs).length - antes) / antes) * 100, 1)}%` : "sem base anterior"}.`,
              hs,
            );
          },
        )}
      </section>
      <div className="analise-controles">
        <h3>Complexidade das histórias por analista</h3>
        <label>
          Sprint da complexidade
          <select
            value={sprintComplexidade}
            onChange={(e) => setSprintComplexidade(e.target.value)}
          >
            <option value="">Todas no recorte</option>
            {sprints.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {grafico(
        "complexidade",
        "Faixas de story points",
        analistas,
        FAIXAS.map((f, i) =>
          serie(
            f,
            analistas.map(
              (a) =>
                complexas.filter(
                  (h) => h.analistas.includes(a) && faixaPontos(h.pontos) === f,
                ).length,
            ),
            i,
          ),
        ),
        `Última pontuação por US. Média: ${numero(media(complexas.flatMap((h) => (h.pontos === null ? [] : [h.pontos]))), 1)}; total conhecido: ${numero(complexas.reduce((s, h) => s + (h.pontos ?? 0), 0))}; ≥8 pontos: ${complexas.some((h) => h.pontos !== null) ? numero((complexas.filter((h) => h.pontos !== null && h.pontos >= 8).length / complexas.filter((h) => h.pontos !== null).length) * 100, 1) + "%" : "Dados não disponíveis"}.`,
        (i, j) =>
          abrir(
            `${analistas[i]} · ${FAIXAS[j]}`,
            "Faixa de story points; não corresponde a horas de análise.",
            complexas.filter(
              (h) =>
                h.analistas.includes(analistas[i]) &&
                faixaPontos(h.pontos) === FAIXAS[j],
            ),
          ),
        true,
      )}
      {grafico(
        "complexidade-evolucao",
        "Evolução da complexidade · story points",
        sprints.map(String),
        [
          serie(
            "Média de pontos por US pontuada",
            resumoSprint.map((s) => s.mediaPontos),
            0,
            "line",
          ),
        ],
        "Soma dos pontos conhecidos / US distintas pontuadas na sprint. Sem pontuação não é zero; valores pertencem ao planejamento de desenvolvimento.",
        (i) =>
          abrir(
            `Complexidade · Sprint ${sprints[i]}`,
            "Média dos story points conhecidos nesta sprint, distinta do índice interno de análise.",
            escopo.filter((h) => h.sprint === sprints[i]),
          ),
        false,
        "line",
        false,
      )}
      <details className="analise-metodo">
        <summary>
          Índice interno de complexidade da análise · proposta configurável
        </summary>
        <p>
          Seis dimensões, 1 a 3 cada: regras de negócio; fluxos e exceções;
          integrações; incerteza; áreas na validação; impacto em outros módulos.
          Total 6–18. Baixa: 6–{base.config.baixa}; média:{" "}
          {base.config.baixa + 1}–{base.config.media}; alta:{" "}
          {base.config.media + 1}–18. Cadastre os critérios nas transições. Sem
          conversão para horas.
        </p>
        <p>
          {transicoes.some((t) => t.dimensoes)
            ? transicoes
                .filter((t) => t.dimensoes)
                .map(
                  (t) =>
                    `${t.us}: ${t.dimensoes!.reduce((s, n) => s + n, 0)} pontos internos`,
                )
                .join(" · ")
            : "Aguardando informações: preencha as seis dimensões por US."}
        </p>
      </details>
      <div className="analise-controles">
        <h3>Tempo do ciclo de análise</h3>
        <label>
          Agrupar ciclo por
          <select
            value={agrupamento}
            onChange={(e) => setAgrupamento(e.target.value)}
          >
            {["Sprint", "Analista", "Complexidade", "Módulo"].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="ind-chart-grid">
        {grafico(
          "ciclo",
          "Tempo de ciclo · dias úteis",
          grupos,
          [
            serie(
              "Média",
              grupos.map((g) =>
                media(
                  historias
                    .filter((h) => grupoAceita(h, g))
                    .flatMap((h) => {
                      const t = tempos.find((t) => t.us === h.codigo)?.ciclo;
                      return t === null || t === undefined ? [] : [t];
                    }),
                ),
              ),
              0,
            ),
            serie(
              "Mediana",
              grupos.map((g) =>
                percentil(
                  historias
                    .filter((h) => grupoAceita(h, g))
                    .flatMap((h) => {
                      const t = tempos.find((t) => t.us === h.codigo)?.ciclo;
                      return t === null || t === undefined ? [] : [t];
                    }),
                  0.5,
                ),
              ),
              1,
            ),
            serie(
              "Percentil 85",
              grupos.map((g) =>
                percentil(
                  historias
                    .filter((h) => grupoAceita(h, g))
                    .flatMap((h) => {
                      const t = tempos.find((t) => t.us === h.codigo)?.ciclo;
                      return t === null || t === undefined ? [] : [t];
                    }),
                  0.85,
                ),
              ),
              3,
            ),
          ],
          "Dias úteis entre levantamento e aprovação, apenas US com ambas as datas. Não somar média, mediana e P85.",
          (i) =>
            abrir(
              `Ciclo · ${grupos[i]}`,
              "Dias úteis decorridos, distintos das horas trabalhadas.",
              historias.filter((h) => grupoAceita(h, grupos[i])),
              tempos.filter((t) =>
                historias.some(
                  (h) => h.codigo === t.us && grupoAceita(h, grupos[i]),
                ),
              ),
            ),
          true,
          "bar",
          false,
        )}
        {grafico(
          "ativo",
          "Trabalho ativo por etapa · horas",
          grupos,
          ATIVIDADES.slice(0, 6).map((t, i) =>
            serie(
              t,
              grupos.map((g) => {
                const ids = new Set(
                  historias
                    .filter((h) => grupoAceita(h, g))
                    .map((h) => h.codigo),
                );
                const as = atividades.filter(
                  (a) =>
                    ids.has(a.us) &&
                    a.tipo === t &&
                    (agrupamento !== "Sprint" || String(a.sprint) === g),
                );
                return as.length ? as.reduce((s, a) => s + a.horas, 0) : null;
              }),
              i,
            ),
          ),
          "Horas efetivamente registradas. Períodos de espera aparecem separadamente na validação.",
          undefined,
          true,
        )}
      </div>
      <h3>Validação e Aprovação dos Requisitos</h3>
      <div className="ind-chart-grid">
        {grafico(
          "rodadas",
          "Rodadas de validação",
          ["Primeira", "Segunda", "Terceira", "Quatro ou mais"],
          [
            serie(
              "Histórias aprovadas",
              [1, 2, 3, 4].map((n) =>
                tempos.some((t) => t.aprovacao && t.rodadas !== null)
                  ? tempos.filter(
                      (t) =>
                        t.aprovacao &&
                        (n === 4 ? t.rodadas! >= 4 : t.rodadas === n),
                    ).length
                  : null,
              ),
              0,
            ),
          ],
          "Conta envios para validação anteriores à aprovação; cada rodada permanece no histórico.",
          (i) => {
            const ts = tempos.filter(
              (t) =>
                t.aprovacao &&
                (i === 3 ? t.rodadas! >= 4 : t.rodadas === i + 1),
            );
            abrir(
              "Rodadas de validação",
              "Histórias aprovadas e quantidade de envios registrados.",
              historias.filter((h) => ts.some((t) => t.us === h.codigo)),
              ts,
            );
          },
        )}
        {grafico(
          "espera",
          "Tempo de espera do cliente · dias úteis",
          sprints.map(String),
          [
            serie(
              "Espera entre envio e retorno",
              sprints.map((s) => {
                const ds = transicoes
                  .filter(
                    (t) => t.sprint === s && t.etapa === "Envio para validação",
                  )
                  .flatMap((t) => {
                    const retorno = transicoes
                      .filter(
                        (r) =>
                          r.us === t.us &&
                          r.data >= t.data &&
                          ["Retorno da validação", "Aprovação final"].includes(
                            r.etapa,
                          ),
                      )
                      .sort((a, b) => a.data.localeCompare(b.data))[0];
                    const d = retorno
                      ? diasUteis(t.data, retorno.data, base.config.feriados)
                      : null;
                    return d === null ? [] : [d];
                  });
                return media(ds);
              }),
              3,
            ),
          ],
          "Média por rodada encerrada. Tempo externo não é hora trabalhada pelo analista.",
        )}
        {grafico(
          "validacoes",
          "Situação das validações",
          [
            "Aguardando validação",
            "Validação com cliente",
            "Ajustes",
            "Aprovação final",
          ],
          [
            serie(
              "Histórias",
              [
                "Aguardando validação",
                "Validação com cliente",
                "Ajustes",
                "Aprovação final",
              ].map((e) =>
                transicoes.length
                  ? historias.filter(
                      (h) =>
                        etapaAtual(estadoUS(transicoes, h.codigo)?.etapa) === e,
                    ).length
                  : null,
              ),
              1,
            ),
          ],
          "Última transição registrada por US no período; sem inferência a partir do desenvolvimento.",
          (i) =>
            abrir(
              "Situação da validação",
              "Última etapa registrada.",
              historias.filter(
                (h) =>
                  etapaAtual(estadoUS(transicoes, h.codigo)?.etapa) ===
                  [
                    "Aguardando validação",
                    "Validação com cliente",
                    "Ajustes",
                    "Aprovação final",
                  ][i],
              ),
            ),
        )}
        <article className="ind-chart-card">
          <h3>Cobertura das validações</h3>
          <p>
            Primeira rodada:{" "}
            {tempos.some((t) => t.aprovacao && t.rodadas)
              ? `${numero((tempos.filter((t) => t.aprovacao && t.rodadas === 1).length / tempos.filter((t) => t.aprovacao && t.rodadas).length) * 100, 1)}%`
              : "Dados não disponíveis"}
          </p>
          <p>Tempo médio: {numero(kpis[4].valor, 1)} dias úteis</p>
          <p>
            Prazo esperado:{" "}
            {base.config.prazo === null
              ? "Não configurado"
              : `${base.config.prazo} dias úteis`}
          </p>
          <p>
            Rodadas são armazenadas separadamente, sem sobrescrever os envios e
            retornos anteriores.
          </p>
        </article>
      </div>
      <h3>Retrabalho e alterações de requisitos</h3>
      {grafico(
        "retrabalho",
        "Revisões por sprint",
        sprints.map(String),
        [
          serie(
            "US revisadas",
            sprints.map((s) =>
              atividades.some((a) => a.sprint === s)
                ? new Set(
                    retrabalho
                      .filter((a) => a.sprint === s && a.us)
                      .map((a) => a.us),
                  ).size
                : null,
            ),
            0,
          ),
          serie(
            "Alterações registradas",
            sprints.map((s) =>
              atividades.some((a) => a.sprint === s)
                ? retrabalho.filter((a) => a.sprint === s).length
                : null,
            ),
            1,
          ),
          serie(
            "Reabertas após aprovação",
            sprints.map((s) =>
              transicoes.some((t) => t.sprint === s)
                ? transicoes.filter(
                    (t) =>
                      t.sprint === s &&
                      t.etapa === "Reaberta" &&
                      transicoes.some(
                        (a) =>
                          a.us === t.us &&
                          a.etapa === "Aprovação final" &&
                          a.data < t.data,
                      ),
                  ).length
                : null,
            ),
            3,
          ),
        ],
        `Esforço de retrabalho: ${horas ? numero((horasRetrabalho / horas) * 100, 1) + "%" : "Dados não disponíveis"}. Horas de retrabalho / horas totais registradas × 100. Mudanças de negócio são distintas de correções.`,
        (i) =>
          abrir(
            `Revisões · Sprint ${sprints[i]}`,
            "Atividades com causa de revisão explicitamente registrada.",
            escopo.filter(
              (h) =>
                h.sprint === sprints[i] &&
                retrabalho.some((a) => a.us === h.codigo),
            ),
            retrabalho.filter((a) => a.sprint === sprints[i]),
          ),
      )}
      {grafico(
        "horas-retrabalho",
        "Horas de retrabalho por motivo",
        sprints.map(String),
        MOTIVOS.map((m, i) =>
          serie(
            m,
            sprints.map((s) =>
              atividades.some((a) => a.sprint === s)
                ? retrabalho
                    .filter((a) => a.sprint === s && a.motivo === m)
                    .reduce((v, a) => v + a.horas, 0)
                : null,
            ),
            i,
          ),
        ),
        "Horas ativas apontadas com causa. Uma reaparição de US não confirma retrabalho.",
      )}
      <h3>Demanda versus Capacity dos Analistas</h3>
      {grafico(
        "capacity",
        "Disponibilidade e demanda · horas",
        sprints.map(String),
        [
          serie("Capacity líquida", capacidades, 1),
          {
            ...serie(
              "Carga planejada (%)",
              resumoSprint.map((s) => s.carga),
              4,
              "line",
            ),
            eixo: "percentual",
          },
          serie(
            "Excesso de demanda",
            resumoSprint.map((s) => s.excesso),
            6,
          ),
          serie(
            "Demanda estimada",
            sprints.map((s) => {
              const hs = distintas(escopo.filter((h) => h.sprint === s));
              const es = hs.map(
                (h) =>
                  transicoes
                    .filter(
                      (t) =>
                        t.us === h.codigo &&
                        t.sprint === s &&
                        t.estimativa !== null,
                    )
                    .at(-1)?.estimativa ?? null,
              );
              return es.length && es.every((v) => v !== null)
                ? es.reduce<number>((v, n) => v + n!, 0)
                : null;
            }),
            0,
          ),
          serie(
            "Horas realizadas",
            sprints.map((s) =>
              atividades.some((a) => a.sprint === s)
                ? atividades
                    .filter((a) => a.sprint === s)
                    .reduce((v, a) => v + a.horas, 0)
                : null,
            ),
            3,
          ),
        ],
        "Capacity exige alocação explícita e descontos. Estimativas de análise informadas em horas, sem conversão de pontos. Filtros por história não rateiam a capacidade.",
        (i) =>
          abrir(
            `Capacity · Sprint ${sprints[i]}`,
            "Dias úteis × jornada × dedicação − indisponibilidades.",
            escopo.filter((h) => h.sprint === sprints[i]),
            alocacoes.filter((a) => a.sprint === sprints[i]),
          ),
        false,
        "bar",
        false,
      )}
      <p>
        Faixas propostas configuráveis: &lt;{base.config.margem}% com margem;{" "}
        {base.config.margem}–{base.config.carga}% atenção; &gt;
        {base.config.carga}% demanda superior à disponibilidade. Cobertura
        incompleta de alocação mantém a capacity indisponível.
      </p>
      <h3>Quantidade de demandas simultâneas</h3>
      {grafico(
        "wip",
        "Histórias abertas por etapa",
        sprints.map(String),
        ETAPAS.filter((e) => e !== "Aprovação final").map((e, i) =>
          serie(
            e,
            sprints.map((s) =>
              transicoes.some((t) => t.sprint <= s)
                ? historias.filter(
                    (h) =>
                      etapaAtual(estadoUS(transicoes, h.codigo, s)?.etapa) ===
                      e,
                  ).length
                : null,
            ),
            i,
          ),
        ),
        "Retratos ao final da sprint. Média de WIP: " +
          numero(media(backlog.filter((v): v is number => v !== null)), 1) +
          ". Pico observado: " +
          (backlog.some((v) => v !== null)
            ? numero(
                Math.max(...backlog.filter((v): v is number => v !== null)),
              )
            : "Dados não disponíveis") +
          ". Não representa pico diário sem histórico completo.",
        (i, j) =>
          abrir(
            `Demandas simultâneas · Sprint ${sprints[i]}`,
            "Última transição da US até esta sprint.",
            historias.filter(
              (h) =>
                etapaAtual(
                  estadoUS(transicoes, h.codigo, sprints[i])?.etapa,
                ) === ETAPAS.filter((e) => e !== "Aprovação final")[j],
            ),
          ),
        false,
        "line",
      )}
      <h3>Distribuição do tempo de trabalho</h3>
      {grafico(
        "atividades-analista",
        "Distribuição das atividades por analista · horas",
        nomes.filter(pessoaAceita),
        ATIVIDADES.map((t, i) =>
          serie(
            t,
            nomes
              .filter(pessoaAceita)
              .map((a) =>
                atividades.some((v) => v.analista === a)
                  ? atividades
                      .filter((v) => v.analista === a && v.tipo === t)
                      .reduce((s, v) => s + v.horas, 0)
                  : null,
              ),
            i,
          ),
        ),
        "Somente horas registradas, incluindo atividades gerais. Não representa ranking de produtividade.",
        (i, j) => {
          const nome = nomes.filter(pessoaAceita)[i];
          abrir(
            `${nome} · ${ATIVIDADES[j]}`,
            "Horas apontadas por atividade e analista.",
            historias.filter((h) => h.analistas.includes(nome)),
            atividades.filter(
              (a) => a.analista === nome && a.tipo === ATIVIDADES[j],
            ),
          );
        },
        true,
      )}
      <RoscaAnalise
        labels={ATIVIDADES}
        valores={ATIVIDADES.map((t) =>
          atividades.length
            ? atividades
                .filter((a) => a.tipo === t)
                .reduce((s, a) => s + a.horas, 0)
            : null,
        )}
        cores={CORES}
        periodo={ctx.periodo}
        onSelecionar={(i) =>
          abrir(
            ATIVIDADES[i],
            "Horas ativas registradas na categoria / total de horas registradas × 100.",
            historias.filter((h) =>
              atividades.some(
                (a) => a.us === h.codigo && a.tipo === ATIVIDADES[i],
              ),
            ),
            atividades.filter((a) => a.tipo === ATIVIDADES[i]),
          )
        }
      />
      <div className="ind-chart-grid">
        {grafico(
          "distribuicao",
          "Horas por tipo de atividade",
          ATIVIDADES,
          [
            serie(
              "Horas registradas",
              ATIVIDADES.map((t) =>
                atividades.length
                  ? atividades
                      .filter((a) => a.tipo === t)
                      .reduce((s, a) => s + a.horas, 0)
                  : null,
              ),
              0,
            ),
          ],
          "Apontamentos ativos; suporte e reuniões contam como trabalho. Horas ausentes não são inventadas.",
          (i) =>
            abrir(
              ATIVIDADES[i],
              `${numero(atividades.filter((a) => a.tipo === ATIVIDADES[i]).reduce((s, a) => s + a.horas, 0))} h; ${horas ? numero((atividades.filter((a) => a.tipo === ATIVIDADES[i]).reduce((s, a) => s + a.horas, 0) / horas) * 100, 1) + "%" : "sem total registrado"}.`,
              historias.filter((h) =>
                atividades.some(
                  (a) => a.tipo === ATIVIDADES[i] && a.us === h.codigo,
                ),
              ),
              atividades.filter((a) => a.tipo === ATIVIDADES[i]),
            ),
          true,
        )}
        {grafico(
          "distribuicao-sprint",
          "Atividades por sprint · horas",
          sprints.map(String),
          ATIVIDADES.map((t, i) =>
            serie(
              t,
              sprints.map((s) =>
                atividades.some((a) => a.sprint === s)
                  ? atividades
                      .filter((a) => a.sprint === s && a.tipo === t)
                      .reduce((v, a) => v + a.horas, 0)
                  : null,
              ),
              i,
            ),
          ),
          "Distribuição do trabalho efetivamente apontado; pode ter cobertura parcial.",
        )}
      </div>
      <h3>Demandas recebidas versus concluídas</h3>
      {grafico(
        "fluxo",
        "Entradas, aprovações e pendências",
        sprints.map(String),
        [
          serie(
            "Primeiras aparições na planilha",
            sprints.map(
              (s) =>
                distintas(
                  escopo.filter(
                    (h) =>
                      h.sprint === s &&
                      (ctx.primeiras.get(h.codigo) ?? s) === s,
                  ),
                ).length,
            ),
            0,
            "line",
          ),
          serie(
            "Análises aprovadas",
            sprints.map((s) =>
              transicoes.length
                ? new Set(
                    transicoes
                      .filter(
                        (t) => t.sprint === s && t.etapa === "Aprovação final",
                      )
                      .map((t) => t.us),
                  ).size
                : null,
            ),
            1,
            "line",
          ),
          serie(
            "Canceladas",
            sprints.map((s) =>
              transicoes.length
                ? new Set(
                    transicoes
                      .filter((t) => t.sprint === s && t.etapa === "Cancelada")
                      .map((t) => t.us),
                  ).size
                : null,
            ),
            3,
            "line",
          ),
          serie("Pendências acompanhadas (WIP)", backlog, 4, "line"),
          serie("Backlog com saldo inicial", saldoBacklog, 6, "line"),
          serie(
            "Recebimentos explicitamente registrados",
            sprints.map((s) =>
              fluxoCompleto
                ? fluxo.find((f) => f.sprint === s)!.entradas
                : null,
            ),
            2,
            "line",
          ),
        ],
        "Pendências finais = iniciais + entradas − conclusões − cancelamentos. Cadastre saldo antes da Sprint 18 nos parâmetros e registre 'Demanda recebida'. Primeira aparição na planilha não confirma recebimento. Filtros de história/pessoa não rateiam o saldo global.",
        undefined,
        false,
        "line",
        false,
      )}
      <h3>Evolução do tamanho da equipe de análise</h3>
      {grafico(
        "equipe",
        "Equipe registrada e FTE",
        sprints.map(String),
        [
          serie(
            "Analistas com alocação",
            sprints.map((s) =>
              alocacoes.some((a) => a.sprint === s)
                ? alocacoes.filter((a) => a.sprint === s && liquida(a) > 0)
                    .length
                : null,
            ),
            0,
            "line",
          ),
          serie(
            "FTE nominal alocado",
            sprints.map((s) =>
              alocacoes.some((a) => a.sprint === s)
                ? alocacoes
                    .filter((a) => a.sprint === s)
                    .reduce(
                      (v, a) => v + fteAnalise(a, base.config.jornadaFte ?? 8),
                      0,
                    )
                : null,
            ),
            1,
            "line",
          ),
        ],
        `FTE = Σ(jornada × dedicação / 100) / jornada de referência (${base.config.jornadaFte ?? 8} h/dia; proposta configurável). Cadastro por sprint confirma período e dedicação. Menções na planilha não comprovam disponibilidade; ausência de atribuição não indica saída.`,
        (i) =>
          abrir(
            `Equipe · Sprint ${sprints[i]}`,
            `FTE = Σ(jornada × dedicação / 100) / ${base.config.jornadaFte ?? 8} h de referência configurada; alocação não substitui capacity líquida.`,
            escopo.filter((h) => h.sprint === sprints[i]),
            alocacoes.filter((a) => a.sprint === sprints[i]),
          ),
        false,
        "line",
        false,
      )}
      <section className="ind-chart-card">
        <h3>Saúde da Equipe de Análise</h3>
        <div className="ind-table-scroll">
          <table className="ind-table">
            <thead>
              <tr>
                {["Indicador", "Resultado", "Tendência", "Situação"].map(
                  (t) => (
                    <th key={t}>{t}</th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {riscos.map((r) => (
                <tr key={r[0]}>
                  {r.map((v, i) => (
                    <td key={i}>
                      {i === 0 ? (
                        <button
                          className="ind-text-button"
                          onClick={() =>
                            abrir(
                              r[0],
                              `${r[1]}. ${r[2]}. ${r[3]}. Consulte os parâmetros e a cobertura antes de concluir.`,
                              escopo,
                            )
                          }
                        >
                          {v}
                        </button>
                      ) : (
                        v
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>{conclusao}</p>
        <details>
          <summary>Indicadores complementares e cobertura</summary>
          <div className="ind-table-scroll">
            <table className="ind-table">
              <thead>
                <tr>
                  <th>Indicador</th>
                  <th>Resultado</th>
                  <th>Fórmula e cobertura</th>
                </tr>
              </thead>
              <tbody>
                {complementares.map((m) => (
                  <tr key={m.nome}>
                    <td>
                      <button
                        className="ind-text-button"
                        onClick={() =>
                          abrir(
                            m.nome,
                            m.formula,
                            escopo,
                            m.nome.includes("valida") ||
                              m.nome.includes("cliente")
                              ? esperas
                              : transicoes,
                          )
                        }
                      >
                        {m.nome}
                      </button>
                    </td>
                    <td>
                      {m.valor === null
                        ? "Dados não disponíveis"
                        : `${numero(m.valor, 1)} ${m.unidade}`}
                    </td>
                    <td>{m.formula}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>
      <section className="ind-chart-card">
        <h3>Registro de Atividades da Análise</h3>
        {!atividades.length ? (
          <EstadoVazio titulo="Aguardando informações">
            Registre analista, sprint, atividade, datas e horas; associe uma US
            ou cadastre trabalho geral. As transições e validações têm histórico
            próprio.
          </EstadoVazio>
        ) : (
          <div className="ind-table-scroll">
            <table className="ind-table">
              <thead>
                <tr>
                  <th>Analista / sprint</th>
                  <th>US / atividade</th>
                  <th>Datas</th>
                  <th>Horas / situação</th>
                  <th>Motivo / impedimento</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {atividades.map((a) => (
                  <tr key={a.id}>
                    <td>
                      {a.analista} · {a.sprint}
                    </td>
                    <td>
                      {a.us || "Geral"} · {a.tipo}
                    </td>
                    <td>
                      {a.inicio} — {a.fim || "Em aberto"}
                    </td>
                    <td>
                      {numero(a.horas, 1)} h · {a.situacao}
                    </td>
                    <td>
                      {a.motivo || a.impedimento || "—"}
                      <small>{a.observacao}</small>
                    </td>
                    <td>
                      <button
                        className="ind-text-button"
                        onClick={() =>
                          salvar({
                            ...base,
                            atividades: base.atividades.filter(
                              (x) => x.id !== a.id,
                            ),
                          })
                        }
                      >
                        Excluir atividade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <details>
          <summary>Alocações cadastradas</summary>
          {alocacoes.map((a) => (
            <p key={a.id}>
              {a.analista} · Sprint {a.sprint} · {numero(liquida(a), 1)} h
              líquidas{" "}
              <button
                className="ind-text-button"
                onClick={() =>
                  salvar({
                    ...base,
                    alocacoes: base.alocacoes.filter((x) => x.id !== a.id),
                  })
                }
              >
                Remover alocação
              </button>
            </p>
          ))}
        </details>
        <div className="analise-acoes">
          <button
            className="ind-button secondary"
            onClick={() =>
              baixarArquivo(
                new Blob([JSON.stringify(base, null, 2)], {
                  type: "application/json",
                }),
                "sigep-analise-backup.json",
              )
            }
          >
            Exportar backup dos registros
          </button>
          <button
            className="ind-button secondary"
            onClick={() => backup.current?.click()}
          >
            Restaurar backup
          </button>
          <input
            hidden
            ref={backup}
            type="file"
            accept=".json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const b: unknown = JSON.parse(await file.text());
                if (!validarBaseAnalise(b)) throw Error("Backup inválido.");
                const unir = <T extends { id: string }>(a: T[], b: T[]) => [
                  ...new Map([...a, ...b].map((x) => [x.id, x])).values(),
                ];
                salvar({
                  ...base,
                  atividades: unir(base.atividades, b.atividades),
                  transicoes: unir(base.transicoes, b.transicoes),
                  alocacoes: unir(base.alocacoes, b.alocacoes),
                });
              } catch {
                setMensagem(
                  "Backup inválido ou ilegível. Os registros atuais foram preservados.",
                );
              }
              e.target.value = "";
            }}
          />
        </div>
        <small>
          Armazenamento local neste navegador. O backup reúne todas as sprints e
          analistas, independentemente dos filtros. A restauração combina
          registros por identificador e preserva os parâmetros atuais.
        </small>
      </section>
      <Sidebar
        visible={!!detalhe}
        position="right"
        onHide={() => setDetalhe(null)}
        className="ind-detail-drawer"
        style={{ width: "min(1040px,100vw)" }}
        header={detalhe?.titulo}
      >
        {detalheFiltrado && (
          <>
            <div className="ind-detail-intro">
              <p>{detalheFiltrado.formula}</p>
              <p>Fonte: {ctx.dados.arquivo} + registros complementares</p>
              <small>{filtrosTexto}</small>
            </div>
            <div className="ind-detail-filters">
              <label>
                Sprint do detalhamento
                <select
                  value={sprintDetalhe}
                  onChange={(e) => setSprintDetalhe(e.target.value)}
                >
                  <option value="">Todas</option>
                  {sprints.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Analista do detalhamento
                <select
                  value={analistaDetalhe}
                  onChange={(e) => setAnalistaDetalhe(e.target.value)}
                >
                  <option value="">Todos</option>
                  {nomes.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>
            <button
              className="ind-button secondary"
              disabled={ocupado}
              onClick={() =>
                void executar(() => exportar("excel", detalheFiltrado))
              }
            >
              Exportar registros detalhados
            </button>
            {detalheFiltrado.registros && (
              <details open>
                <summary>
                  Registros de origem ({detalheFiltrado.registros.length})
                </summary>
                {detalheFiltrado.registros.length ? (
                  <div className="analise-registros">
                    {detalheFiltrado.registros.map((r, i) => (
                      <dl key={i}>
                        {Object.entries(r).map(([k, v]) => (
                          <div key={k}>
                            <dt>{k}</dt>
                            <dd>
                              {v === null
                                ? "Dados não disponíveis"
                                : typeof v === "object"
                                  ? JSON.stringify(v)
                                  : String(v)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ))}
                  </div>
                ) : (
                  <EstadoVazio titulo="Aguardando informações">
                    Ainda não há registros complementares para o cálculo.
                  </EstadoVazio>
                )}
              </details>
            )}
            <TabelaHistorias
              key={detalheFiltrado.titulo}
              historias={detalheFiltrado.historias}
              onHistoria={(h) =>
                abrir(
                  `${h.codigo} · histórico da análise`,
                  "Histórico de transições preservado; as rodadas não são sobrescritas.",
                  [h],
                  base.transicoes.filter((t) => t.us === h.codigo),
                )
              }
            />
          </>
        )}
      </Sidebar>
      <Dialog
        visible={!!modal}
        onHide={() => setModal("")}
        modal
        className="ind-story-dialog analise-dialog"
        style={{ width: "min(820px,95vw)" }}
        header={
          {
            atividade: "Registro de Atividades da Análise",
            transicao: "Transição da história e validação",
            alocacao: "Alocação do analista por sprint",
            simular: "Simulação de capacidade",
            config: "Parâmetros de gestão",
            relatorio: "Gerar Relatório da Análise",
          }[modal]
        }
      >
        {modal === "simular" ? (
          <>
            <p className="analise-aviso">
              SIMULAÇÃO · não altera registros históricos nem indicadores reais.
            </p>
            <div className="analise-form-grid">
              {(
                [
                  ["pessoas", "Quantidade de analistas"],
                  ["dias", "Dias úteis"],
                  ["jornada", "Horas produtivas por dia"],
                  [
                    "reserva",
                    "Horas da equipe reservadas a reuniões e suporte",
                  ],
                  ["ferias", "Férias da equipe (h)"],
                  ["afastamentos", "Afastamentos da equipe (h)"],
                  ["demanda", "Demanda estimada (h)"],
                ] as const
              ).map(([k, l]) => (
                <label key={k}>
                  {l}
                  <input
                    type="number"
                    min="0"
                    step={k === "pessoas" || k === "dias" ? 1 : 0.5}
                    value={simulacao[k]}
                    onChange={(e) =>
                      setSimulacao({
                        ...simulacao,
                        [k]: Math.max(0, Number(e.target.value)),
                      })
                    }
                  />
                </label>
              ))}
            </div>
            {(() => {
              const cap =
                simulacao.pessoas * simulacao.dias * simulacao.jornada -
                simulacao.reserva -
                simulacao.ferias -
                simulacao.afastamentos;
              return cap < 0 ? (
                <p role="alert">Os descontos excedem a disponibilidade.</p>
              ) : (
                <>
                  <p>
                    Capacity líquida simulada: <b>{numero(cap, 1)} h</b> ·
                    Carga:{" "}
                    <b>
                      {cap
                        ? numero((simulacao.demanda / cap) * 100, 1) + "%"
                        : "Dados não disponíveis"}
                    </b>{" "}
                    · Excesso: {numero(Math.max(0, simulacao.demanda - cap), 1)}{" "}
                    h
                  </p>
                  {grafico(
                    "simulacao",
                    "SIMULAÇÃO · capacidade e demanda",
                    ["Cenário"],
                    [
                      serie("Disponibilidade simulada", [cap], 1),
                      serie("Demanda simulada", [simulacao.demanda], 0),
                    ],
                    "Analistas × dias úteis × horas produtivas − reservas − férias − afastamentos.",
                    () => {
                      setModal("");
                      abrir(
                        "SIMULAÇÃO · capacidade e demanda",
                        "Cenário hipotético; não faz parte dos indicadores reais.",
                        [],
                        [{ ...simulacao, capacityLiquida: cap }],
                      );
                    },
                    false,
                    "bar",
                    false,
                  )}
                </>
              );
            })()}
          </>
        ) : modal === "relatorio" ? (
          <>
            <p>
              Relatório com 13 tópicos gerenciais, fórmulas, fonte, filtros,
              cobertura e conclusão fundamentada. Resultados ausentes são
              identificados. Simulações não integram os resultados reais.
            </p>
            <p>{conclusao}</p>
            <div className="analise-acoes">
              <button
                className="ind-button"
                disabled={ocupado}
                onClick={() => void executar(() => exportar("pdf"))}
              >
                Exportar PDF
              </button>
              <button
                className="ind-button secondary"
                disabled={ocupado}
                onClick={() => void executar(() => exportar("excel"))}
              >
                Exportar Excel
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={registrar}>
            <div className="analise-form-grid">
              {modal !== "config" && (
                <>
                  <label>
                    Analista
                    <input
                      name="analista"
                      list="analise-analistas"
                      required
                      placeholder="Nome do analista"
                    />
                  </label>
                  <datalist id="analise-analistas">
                    {nomes.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </datalist>
                  <label>
                    Sprint
                    <select name="sprint" required>
                      {ctx.dados.sprints.map((s) => (
                        <option key={s.numero}>{s.numero}</option>
                      ))}
                    </select>
                  </label>
                </>
              )}
              {(modal === "atividade" || modal === "transicao") && (
                <label>
                  História (US){modal === "atividade" && " · opcional"}
                  <select name="us" required={modal === "transicao"}>
                    <option value="">Atividade geral</option>
                    {opcoesUS.map((h) => (
                      <option key={h.codigo} value={h.codigo}>
                        {h.codigo} · {h.titulo}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {modal === "atividade" && (
                <>
                  <label>
                    Módulo
                    <input name="modulo" list="analise-modulos" />
                    <datalist id="analise-modulos">
                      {nomesUnicos(
                        ctx.dados.historias.flatMap((h) =>
                          h.modulo ? [h.modulo] : [],
                        ),
                      ).map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </datalist>
                  </label>
                  <label>
                    Tipo de atividade
                    <select name="tipo">
                      {ATIVIDADES.map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Data de início
                    <input type="date" name="inicio" required />
                  </label>
                  <label>
                    Data de conclusão
                    <input type="date" name="fim" />
                  </label>
                  {inputNumero("horas", "Horas dedicadas", undefined, 0)}
                  <label>
                    Situação
                    <select name="situacao">
                      {["Em andamento", "Concluída", "Impedida"].map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Motivo do retrabalho
                    <select name="motivo">
                      <option value="">Não se aplica / não confirmado</option>
                      {MOTIVOS.map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Motivo de impedimento
                    <input name="impedimento" />
                  </label>
                  <label>
                    Observação opcional
                    <textarea name="observacao" />
                  </label>
                </>
              )}
              {modal === "transicao" && (
                <>
                  <label>
                    Transição
                    <select name="etapa">
                      {TRANSICOES.map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Data da transição
                    <input type="date" name="data" required />
                  </label>
                  {inputNumero(
                    "estimativa",
                    "Estimativa de análise (h) · opcional",
                    undefined,
                    0,
                    undefined,
                    false,
                  )}
                  <fieldset className="analise-dimensoes">
                    <legend>
                      Índice interno proposto · opcional, preencha as seis
                      dimensões
                    </legend>
                    {[
                      "Regras de negócio",
                      "Fluxos e exceções",
                      "Integrações e dependências",
                      "Incerteza dos requisitos",
                      "Áreas na validação",
                      "Impacto em outros módulos",
                    ].map((n, i) => (
                      <label key={n}>
                        {n}
                        <select name={`dim${i}`}>
                          <option value="">Não informado</option>
                          {[1, 2, 3].map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </fieldset>
                  <p>
                    Para cada rodada, registre “Envio para validação” e “Retorno
                    da validação”. Registre a aprovação final separadamente. O
                    histórico anterior será preservado.
                  </p>
                </>
              )}
              {modal === "alocacao" && (
                <>
                  {inputNumero(
                    "dias",
                    "Dias úteis da sprint",
                    undefined,
                    0,
                    31,
                  )}
                  {inputNumero(
                    "jornada",
                    "Jornada diária (h)",
                    undefined,
                    0,
                    24,
                  )}
                  {inputNumero(
                    "dedicacao",
                    "Dedicação ao SIGEP (%)",
                    undefined,
                    0,
                    100,
                  )}
                  {inputNumero("reunioes", "Reuniões fixas (h)", 0)}
                  {inputNumero("ferias", "Férias (h)", 0)}
                  {inputNumero("afastamentos", "Afastamentos (h)", 0)}
                  {inputNumero("apoio", "Atividades de apoio (h)", 0)}
                  {inputNumero(
                    "imprevistos",
                    "Trabalho não planejado / outras indisponibilidades (h)",
                    0,
                  )}
                  <p>
                    O cadastro confirma a alocação nesta sprint. Repita em cada
                    sprint de atuação; não inferimos entradas ou saídas pela
                    planilha.
                  </p>
                </>
              )}
              {modal === "config" && (
                <>
                  {inputNumero(
                    "jornadaFte",
                    "Jornada de referência do FTE (h/dia) · proposta configurável",
                    base.config.jornadaFte ?? 8,
                    0.01,
                    24,
                  )}
                  {inputNumero(
                    "pendenciasIniciais",
                    "Pendências no início da Sprint 18 · opcional",
                    base.config.pendenciasIniciais ?? undefined,
                    0,
                    undefined,
                    false,
                  )}
                  {inputNumero(
                    "margem",
                    "Início da faixa de atenção (%)",
                    base.config.margem,
                    0,
                  )}
                  {inputNumero(
                    "carga",
                    "Limite superior de carga (%)",
                    base.config.carga,
                    0,
                  )}
                  {inputNumero(
                    "baixa",
                    "Máximo do índice de baixa complexidade",
                    base.config.baixa,
                    6,
                    16,
                  )}
                  {inputNumero(
                    "media",
                    "Máximo do índice de média complexidade",
                    base.config.media,
                    7,
                    17,
                  )}
                  {inputNumero(
                    "wip",
                    "Limite de WIP · opcional",
                    base.config.wip ?? undefined,
                    0,
                    undefined,
                    false,
                  )}
                  {inputNumero(
                    "prazo",
                    "Prazo de validação (dias úteis) · opcional",
                    base.config.prazo ?? undefined,
                    0,
                    undefined,
                    false,
                  )}
                  {inputNumero(
                    "retrabalho",
                    "Referência de retrabalho (%) · opcional",
                    base.config.retrabalho ?? undefined,
                    0,
                    100,
                    false,
                  )}
                  <label>
                    Feriados · AAAA-MM-DD separados por vírgulas
                    <textarea
                      name="feriados"
                      defaultValue={base.config.feriados.join(", ")}
                    />
                  </label>
                  <p>
                    Parâmetros de gestão propostos, sem caráter de padrão
                    universal. Dias úteis excluem fins de semana e os feriados
                    informados.
                  </p>
                </>
              )}
            </div>
            <div className="analise-acoes">
              <button className="ind-button" type="submit">
                Salvar registro
              </button>
              <button
                className="ind-button secondary"
                type="button"
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
