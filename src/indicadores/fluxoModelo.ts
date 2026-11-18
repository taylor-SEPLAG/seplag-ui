import {
  dataValida,
  diasUteis,
  distintas,
  faixaPontos,
  liquida,
  media,
  percentil,
  type BaseAnalise,
} from "./analiseModelo";
import type { HistoriaProjeto, SprintProjeto } from "./types";

export const ETAPAS_FLUXO = [
  "Backlog",
  "Levantamento",
  "Especificação/Prototipação",
  "Validação com Cliente",
  "Ajustes",
  "Pronta para Desenvolvimento",
] as const;
export type EtapaFluxo =
  (typeof ETAPAS_FLUXO)[number] | "Cancelada" | "Suspensa";
export const ATIVAS_FLUXO: readonly string[] = ETAPAS_FLUXO.slice(1, 5);
export const MOTIVOS_BLOQUEIO = [
  "Validação do cliente",
  "Definição de regra de negócio",
  "Dependência de outro módulo",
  "Dependência técnica",
  "Falta de informação",
  "Mudança de prioridade",
  "Outros",
];
export const MOTIVOS_ESPERA = [
  "Aguardando retorno do cliente",
  "Aguardando alinhamento técnico",
  "Aguardando definição de regra",
  "Dependência de outro módulo",
  "Aguardando disponibilidade da equipe",
  "Outros",
];
export const CHAVE_FLUXO = "sigep:analise-fluxo:v1";
export interface MovimentoFluxo {
  id: string;
  us: string;
  origem: EtapaFluxo | null;
  destino: EtapaFluxo;
  instante: string;
  analista: string;
  motivo: string;
  fonte: "Registro WIP" | "Histórico da análise";
  precisao: "dia" | "instante";
}
export interface ImpedimentoFluxo {
  id: string;
  us: string;
  inicio: string;
  fim: string | null;
  motivo: string;
  responsavel: string;
  observacao: string;
  tipo: "Bloqueio" | "Espera";
}
export interface LimitesFluxo {
  equipe: number | null;
  analistas: Record<string, number>;
  etapas: Partial<Record<EtapaFluxo, number>>;
  aging: Record<string, { atencao: number; critico: number }>;
  inatividade: number | null;
  horasDia: number | null;
  apontamentosCompletos: string[];
}
export interface DadosFluxo {
  versao: 1;
  movimentos: MovimentoFluxo[];
  impedimentos: ImpedimentoFluxo[];
  limites: LimitesFluxo;
}
export const novoFluxo = (): DadosFluxo => ({
  versao: 1,
  movimentos: [],
  impedimentos: [],
  limites: {
    equipe: null,
    analistas: {},
    etapas: {},
    aging: {},
    inatividade: null,
    horasDia: null,
    apontamentosCompletos: [],
  },
});
const formatoDataCuiaba = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "America/Cuiaba",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
export const dataCuiaba = (instante: string) =>
  formatoDataCuiaba.format(new Date(instante));
export const diaMovimento = (m: MovimentoFluxo) =>
  m.precisao === "dia" ? m.instante : dataCuiaba(m.instante);
export const instanteValido = (s: unknown): s is string =>
  typeof s === "string" &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(
    s,
  ) &&
  dataValida(s.slice(0, 10)) &&
  Number.isFinite(Date.parse(s));
const ordem = (a: MovimentoFluxo, b: MovimentoFluxo) =>
  diaMovimento(a).localeCompare(diaMovimento(b)) ||
  (a.precisao !== b.precisao
    ? a.precisao === "dia"
      ? -1
      : 1
    : a.precisao === "instante"
      ? Date.parse(a.instante) - Date.parse(b.instante)
      : 0) ||
  a.id.localeCompare(b.id);
export function adaptarMovimentos(base: BaseAnalise): MovimentoFluxo[] {
  const mapa: Record<string, EtapaFluxo> = {
    "Demanda recebida": "Backlog",
    Levantamento: "Levantamento",
    "Conclusão do levantamento": "Especificação/Prototipação",
    Especificação: "Especificação/Prototipação",
    Prototipação: "Especificação/Prototipação",
    "Conclusão da especificação": "Especificação/Prototipação",
    "Envio para validação": "Validação com Cliente",
    "Aguardando validação": "Validação com Cliente",
    "Validação com cliente": "Validação com Cliente",
    "Retorno da validação": "Ajustes",
    Ajustes: "Ajustes",
    Reaberta: "Ajustes",
    "Aprovação final": "Pronta para Desenvolvimento",
    Cancelada: "Cancelada",
    Suspensa: "Suspensa",
  };
  const ultimo = new Map<string, EtapaFluxo>();
  return [...base.transicoes]
    .sort((a, b) => a.data.localeCompare(b.data) || a.id.localeCompare(b.id))
    .flatMap((t) => {
      const destino = mapa[t.etapa];
      if (!destino) return [];
      const origem = ultimo.get(t.us) ?? null;
      ultimo.set(t.us, destino);
      return [
        {
          id: `analise:${t.id}`,
          us: t.us,
          origem,
          destino,
          instante: t.data,
          analista: t.analista,
          motivo: t.etapa,
          fonte: "Histórico da análise" as const,
          precisao: "dia" as const,
        },
      ];
    });
}
export const unirMovimentos = (base: BaseAnalise, fluxo: DadosFluxo) =>
  [...adaptarMovimentos(base), ...fluxo.movimentos].sort(ordem);
export interface EstadoFluxo {
  historia: HistoriaProjeto;
  etapa: EtapaFluxo;
  analista: string;
  inicio: string | null;
  entradaEtapa: string;
  idade: number | null;
  idadeEtapa: number | null;
  wip: boolean;
  bloqueios: ImpedimentoFluxo[];
  historico: MovimentoFluxo[];
}
export function estadosEm(
  historias: HistoriaProjeto[],
  movimentos: MovimentoFluxo[],
  impedimentos: ImpedimentoFluxo[],
  dia: string,
  feriados: string[] = [],
  instanteLimite?: string,
): EstadoFluxo[] {
  if (!movimentos.length || !historias.length) return [];
  const porUS = new Map<string, MovimentoFluxo[]>();
  const limite = instanteLimite ? Date.parse(instanteLimite) : null;
  for (const m of movimentos) {
    const data = diaMovimento(m);
    if (
      data > dia ||
      (limite !== null &&
        (m.precisao === "instante"
          ? Date.parse(m.instante) > limite
          : data >= dia))
    )
      continue;
    const lista = porUS.get(m.us) ?? [];
    lista.push(m);
    porUS.set(m.us, lista);
  }
  return distintas(historias).flatMap((historia) => {
    const historico = (porUS.get(historia.codigo) ?? []).sort(ordem);
    const ultimo = historico.at(-1);
    if (!ultimo) return [];
    let inicio: string | null = null,
      entradaEtapa = diaMovimento(historico[0]);
    historico.forEach((m, i) => {
      const anterior = historico[i - 1];
      if (
        ATIVAS_FLUXO.includes(m.destino) &&
        anterior &&
        ["Pronta para Desenvolvimento", "Cancelada"].includes(anterior.destino)
      )
        inicio = m.destino === "Levantamento" ? diaMovimento(m) : null;
      else if (
        m.destino === "Levantamento" &&
        !inicio &&
        (!anterior || anterior.destino === "Backlog")
      )
        inicio = diaMovimento(m);
      if (i === 0 || m.destino !== historico[i - 1].destino)
        entradaEtapa = diaMovimento(m);
    });
    return [
      {
        historia,
        etapa: ultimo.destino,
        analista: ultimo.analista,
        inicio,
        entradaEtapa,
        idade: inicio
          ? diasUteis(
              inicio,
              ["Pronta para Desenvolvimento", "Cancelada"].includes(
                ultimo.destino,
              )
                ? entradaEtapa
                : dia,
              feriados,
            )
          : null,
        idadeEtapa: diasUteis(entradaEtapa, dia, feriados),
        wip: ATIVAS_FLUXO.includes(ultimo.destino),
        bloqueios: impedimentos.filter(
          (b) =>
            b.tipo === "Bloqueio" &&
            b.us === historia.codigo &&
            dataCuiaba(b.inicio) <= dia &&
            (!b.fim || dataCuiaba(b.fim) > dia),
        ),
        historico,
      },
    ];
  });
}
export interface ConclusaoFluxo {
  us: string;
  inicio: string | null;
  aprovacao: string;
  ciclo: number | null;
  analista: string;
  movimento: MovimentoFluxo;
  horasAtivas: number | null;
  esperaHoras: number | null;
  eficiencia: number | null;
  rodadas: number;
}
export function conclusoesFluxo(
  movimentos: MovimentoFluxo[],
  base: BaseAnalise,
  inicioPeriodo: string,
  fimPeriodo: string,
  horasDia: number | null,
  completos: string[] = [],
): ConclusaoFluxo[] {
  const saidas: ConclusaoFluxo[] = [];
  const codigos = [...new Set(movimentos.map((m) => m.us))];
  for (const us of codigos) {
    let inicio: string | null = null,
      aberto = false,
      ultima: EtapaFluxo | null = null,
      rodadas = 0;
    const ms = movimentos
      .filter((m) => m.us === us && diaMovimento(m) <= fimPeriodo)
      .sort(ordem);
    for (const m of ms) {
      const dia = diaMovimento(m);
      if (m.destino === "Levantamento" && !aberto) {
        inicio = dia;
        aberto = true;
        rodadas = 0;
      }
      if (ATIVAS_FLUXO.includes(m.destino)) aberto = true;
      if (m.destino === "Validação com Cliente" && ultima !== m.destino)
        rodadas++;
      if (m.destino === "Pronta para Desenvolvimento" && ultima !== m.destino) {
        const ciclo = inicio
          ? diasUteis(inicio, dia, base.config.feriados)
          : null;
        const atividades = base.atividades.filter(
          (a) =>
            a.us === us &&
            inicio &&
            a.inicio >= inicio &&
            a.fim &&
            a.fim <= dia &&
            ![
              "Acompanhamento de desenvolvimento",
              "Acompanhamento de testes",
              "Suporte aos desenvolvedores",
              "Apoio ao QA",
            ].includes(a.tipo),
        );
        const horasAtivas = atividades.length
          ? atividades.reduce((v, a) => v + a.horas, 0)
          : null;
        const horasCiclo =
          ciclo !== null && horasDia !== null ? ciclo * horasDia : null;
        const consistente =
          completos.includes(us) &&
          horasCiclo !== null &&
          horasCiclo > 0 &&
          horasAtivas !== null &&
          horasAtivas <= horasCiclo;
        if (dia >= inicioPeriodo)
          saidas.push({
            us,
            inicio,
            aprovacao: dia,
            ciclo,
            analista: m.analista,
            movimento: m,
            horasAtivas,
            esperaHoras: consistente ? horasCiclo! - horasAtivas! : null,
            eficiencia: consistente ? (horasAtivas! / horasCiclo!) * 100 : null,
            rodadas,
          });
        aberto = false;
        inicio = null;
        rodadas = 0;
      }
      if (m.destino === "Cancelada") {
        aberto = false;
        inicio = null;
        rodadas = 0;
      }
      ultima = m.destino;
    }
  }
  return [...new Map(saidas.map((s) => [s.us, s])).values()];
}
export function datasEntre(
  inicio: string,
  fim: string,
  uteis = false,
  feriados: string[] = [],
) {
  if (!dataValida(inicio) || !dataValida(fim) || fim < inicio) return [];
  const dias: string[] = [];
  for (
    const d = new Date(`${inicio}T12:00:00Z`);
    d <= new Date(`${fim}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    const dia = d.toISOString().slice(0, 10);
    if (!uteis || (![0, 6].includes(d.getUTCDay()) && !feriados.includes(dia)))
      dias.push(dia);
  }
  return dias;
}
export function serieHistorica(
  historias: HistoriaProjeto[],
  ms: MovimentoFluxo[],
  bloqueios: ImpedimentoFluxo[],
  dias: string[],
  feriados: string[] = [],
) {
  return dias.map((dia) => {
    const estados = estadosEm(historias, ms, bloqueios, dia, feriados);
    return {
      dia,
      estados,
      wip: estados.length ? estados.filter((e) => e.wip).length : null,
    };
  });
}
export function fluxoSprint(
  ms: MovimentoFluxo[],
  sprint: SprintProjeto,
  fim: string,
) {
  const ts = ms.filter(
    (m) =>
      diaMovimento(m) >= sprint.inicio &&
      diaMovimento(m) <= (sprint.fim && sprint.fim < fim ? sprint.fim : fim),
  );
  const anterior = (m: MovimentoFluxo) =>
    ms
      .filter((t) => t.us === m.us && ordem(t, m) < 0)
      .sort(ordem)
      .at(-1);
  const entradas = ts.filter(
    (m) =>
      ATIVAS_FLUXO.includes(m.destino) &&
      ((m.destino === "Levantamento" &&
        (!anterior(m) || anterior(m)!.destino === "Backlog")) ||
        (!!anterior(m) &&
          ["Pronta para Desenvolvimento", "Cancelada", "Suspensa"].includes(
            anterior(m)!.destino,
          ))),
  );
  const saidas = ts.filter(
    (m) =>
      ["Pronta para Desenvolvimento", "Cancelada", "Suspensa"].includes(
        m.destino,
      ) &&
      anterior(m) &&
      ATIVAS_FLUXO.includes(anterior(m)!.destino),
  );
  return {
    entradas,
    saidas,
    iniciosDesconhecidos: ts.filter(
      (m) =>
        ATIVAS_FLUXO.includes(m.destino) &&
        m.destino !== "Levantamento" &&
        (!anterior(m) || anterior(m)!.destino === "Backlog"),
    ),
    novas: entradas.filter(
      (m) =>
        !ms.some(
          (t) =>
            t.us === m.us &&
            ordem(t, m) < 0 &&
            ATIVAS_FLUXO.includes(t.destino),
        ),
    ),
    retomadas: entradas.filter((m) =>
      ms.some(
        (t) =>
          t.us === m.us && ordem(t, m) < 0 && ATIVAS_FLUXO.includes(t.destino),
      ),
    ),
  };
}
export function picoObservadoFluxo(
  historias: HistoriaProjeto[],
  ms: MovimentoFluxo[],
  inicio: string,
  fim: string,
  dias: { dia: string; estados: EstadoFluxo[]; wip: number | null }[],
  analista?: string,
) {
  const amostras = dias
    .filter((d) => d.dia >= inicio && d.dia <= fim && d.wip !== null)
    .map(
      (d) =>
        d.estados.filter((e) => e.wip && (!analista || e.analista === analista))
          .length,
    );
  const instantes = [
    ...new Set(
      ms
        .filter(
          (m) =>
            m.precisao === "instante" &&
            diaMovimento(m) >= inicio &&
            diaMovimento(m) <= fim,
        )
        .map((m) => m.instante),
    ),
  ];
  for (const instante of instantes) {
    const estados = estadosEm(
      historias,
      ms,
      [],
      dataCuiaba(instante),
      [],
      instante,
    );
    if (estados.length)
      amostras.push(
        estados.filter((e) => e.wip && (!analista || e.analista === analista))
          .length,
      );
  }
  return amostras.length ? Math.max(...amostras) : null;
}
export const resumirCiclos = (cs: ConclusaoFluxo[]) => {
  const vs = cs.flatMap((c) => (c.ciclo === null ? [] : [c.ciclo]));
  return {
    media: media(vs),
    mediana: percentil(vs, 0.5),
    p85: percentil(vs, 0.85),
    p95: percentil(vs, 0.95),
    maximo: vs.length ? Math.max(...vs) : null,
  };
};
export function limiteIdade(estado: EstadoFluxo, limites: LimitesFluxo) {
  return limites.aging[faixaPontos(estado.historia.pontos)] ?? null;
}
export const capacityFluxo = (
  base: BaseAnalise,
  sprint: number,
  analistas: string[],
) => {
  const as = base.alocacoes.filter(
    (a) =>
      a.sprint === sprint &&
      (!analistas.length || analistas.includes(a.analista)),
  );
  return as.length ? as.reduce((v, a) => v + liquida(a), 0) : null;
};
export function validarFluxo(v: unknown): v is DadosFluxo {
  if (!v || typeof v !== "object") return false;
  const f = v as DadosFluxo,
    etapas: readonly string[] = [...ETAPAS_FLUXO, "Cancelada", "Suspensa"];
  const numero = (n: unknown) =>
    typeof n === "number" && Number.isFinite(n) && n >= 0;
  return (
    f.versao === 1 &&
    Array.isArray(f.movimentos) &&
    Array.isArray(f.impedimentos) &&
    !!f.limites &&
    (f.limites.equipe === null || numero(f.limites.equipe)) &&
    !!f.limites.analistas &&
    Object.values(f.limites.analistas).every(numero) &&
    !!f.limites.etapas &&
    Object.entries(f.limites.etapas).every(
      ([k, n]) => etapas.includes(k) && numero(n),
    ) &&
    !!f.limites.aging &&
    Object.values(f.limites.aging).every(
      (a) =>
        !!a && numero(a.atencao) && numero(a.critico) && a.critico > a.atencao,
    ) &&
    Array.isArray(f.limites.apontamentosCompletos) &&
    f.limites.apontamentosCompletos.every(
      (us) => typeof us === "string" && /^US\d+$/.test(us),
    ) &&
    (f.limites.inatividade === null || numero(f.limites.inatividade)) &&
    (f.limites.horasDia === null ||
      (numero(f.limites.horasDia) &&
        f.limites.horasDia > 0 &&
        f.limites.horasDia <= 24)) &&
    f.movimentos.every(
      (m) =>
        !!m &&
        typeof m.id === "string" &&
        /^US\d+$/.test(m.us) &&
        (m.origem === null || etapas.includes(m.origem)) &&
        etapas.includes(m.destino) &&
        instanteValido(m.instante) &&
        m.precisao === "instante" &&
        m.fonte === "Registro WIP" &&
        typeof m.analista === "string" &&
        typeof m.motivo === "string",
    ) &&
    f.impedimentos.every(
      (b) =>
        !!b &&
        typeof b.id === "string" &&
        /^US\d+$/.test(b.us) &&
        instanteValido(b.inicio) &&
        (b.fim === null ||
          (instanteValido(b.fim) &&
            Date.parse(b.fim) >= Date.parse(b.inicio))) &&
        ["Bloqueio", "Espera"].includes(b.tipo) &&
        typeof b.motivo === "string" &&
        typeof b.responsavel === "string" &&
        typeof b.observacao === "string",
    ) &&
    new Set(f.movimentos.map((m) => m.id)).size === f.movimentos.length &&
    new Set(f.impedimentos.map((b) => b.id)).size === f.impedimentos.length
  );
}
export function auditarSequenciaFluxo(
  movimentos: MovimentoFluxo[],
): string | null {
  const anteriores = new Map<string, MovimentoFluxo>();
  for (const m of [...movimentos].sort(ordem)) {
    const anterior = anteriores.get(m.us);
    if (
      m.fonte === "Registro WIP" &&
      anterior &&
      m.origem !== null &&
      m.origem !== anterior.destino
    )
      return `${m.us}: origem ${m.origem} diverge da última etapa conhecida (${anterior.destino}).`;
    anteriores.set(m.us, m);
  }
  return null;
}
export function diasImpedimento(
  intervalos: ImpedimentoFluxo[],
  referencia: string,
  feriados: string[] = [],
  inicioPeriodo?: string,
) {
  const dias = new Set<string>();
  for (const intervalo of intervalos) {
    let inicio = dataCuiaba(intervalo.inicio);
    if (inicioPeriodo && inicio < inicioPeriodo) inicio = inicioPeriodo;
    const encerramento = intervalo.fim ? dataCuiaba(intervalo.fim) : referencia,
      fim = encerramento < referencia ? encerramento : referencia;
    for (const dia of datasEntre(inicio, fim, true, feriados))
      if (dia > dataCuiaba(intervalo.inicio)) dias.add(dia);
  }
  return dias.size;
}
