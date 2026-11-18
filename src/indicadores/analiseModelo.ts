import type { HistoriaProjeto } from "./types";
export const criarIdRegistroAnalise = () => `${Date.now()}-${crypto.randomUUID()}`;

export const ETAPAS = [
  "Levantamento",
  "Especificação",
  "Prototipação",
  "Aguardando validação",
  "Validação com cliente",
  "Ajustes",
  "Aprovação final",
  "Acompanhamento de desenvolvimento",
  "Acompanhamento de testes",
] as const;
export const ATIVIDADES = [
  ...ETAPAS.filter((e) => e !== "Aguardando validação"),
  "Alinhamentos técnicos",
  "Suporte aos desenvolvedores",
  "Apoio ao QA",
  "Análise de defeitos",
  "Reuniões internas",
  "Outras atividades",
];
export const MOTIVOS = [
  "Mudança de regra de negócio pelo cliente",
  "Alteração de escopo",
  "Nova decisão técnica",
  "Inconsistência identificada na análise",
  "Ajuste após testes",
  "Integração ou dependência não prevista",
  "Outros",
];
export interface AtividadeAnalise {
  id: string;
  analista: string;
  sprint: number;
  us: string;
  modulo: string;
  tipo: string;
  inicio: string;
  fim: string;
  horas: number;
  situacao: string;
  impedimento: string;
  observacao: string;
  motivo: string;
}
export interface TransicaoAnalise {
  id: string;
  analista: string;
  sprint: number;
  us: string;
  etapa: string;
  data: string;
  estimativa: number | null;
  dimensoes: number[] | null;
}
export interface AlocacaoAnalise {
  id: string;
  analista: string;
  sprint: number;
  dias: number;
  jornada: number;
  dedicacao: number;
  reunioes: number;
  ferias: number;
  afastamentos: number;
  apoio: number;
  imprevistos: number;
}
export interface ConfigAnalise {
  margem: number;
  carga: number;
  wip: number | null;
  prazo: number | null;
  retrabalho: number | null;
  baixa: number;
  media: number;
  feriados: string[];
  pendenciasIniciais?: number | null;
  jornadaFte?: number;
}
export interface BaseAnalise {
  versao: 1;
  atividades: AtividadeAnalise[];
  transicoes: TransicaoAnalise[];
  alocacoes: AlocacaoAnalise[];
  config: ConfigAnalise;
}
export const novaBaseAnalise = (): BaseAnalise => ({
  versao: 1,
  atividades: [],
  transicoes: [],
  alocacoes: [],
  config: {
    margem: 85,
    carga: 100,
    wip: null,
    prazo: null,
    retrabalho: null,
    baixa: 8,
    media: 13,
    feriados: [],
    pendenciasIniciais: null,
    jornadaFte: 8,
  },
});
export function diasUteis(
  inicio: string,
  fim: string,
  feriados: string[] = [],
): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(inicio) || !/^\d{4}-\d{2}-\d{2}$/.test(fim))
    return null;
  const a = new Date(`${inicio}T00:00:00Z`),
    b = new Date(`${fim}T00:00:00Z`);
  if (!dataValida(inicio) || !dataValida(fim) || b < a) return null;
  let n = 0;
  for (
    a.setUTCDate(a.getUTCDate() + 1);
    a <= b;
    a.setUTCDate(a.getUTCDate() + 1)
  )
    if (
      ![0, 6].includes(a.getUTCDay()) &&
      !feriados.includes(a.toISOString().slice(0, 10))
    )
      n++;
  return n;
}
export const liquida = (a: AlocacaoAnalise) =>
  (a.dias * a.jornada * a.dedicacao) / 100 -
  a.reunioes -
  a.ferias -
  a.afastamentos -
  a.apoio -
  a.imprevistos;
export const fteAnalise = (a: AlocacaoAnalise, jornadaReferencia: number) =>
  (a.jornada * a.dedicacao) / 100 / jornadaReferencia;
export const media = (a: number[]) =>
  a.length ? a.reduce((s, n) => s + n, 0) / a.length : null;
export function percentil(a: number[], p: number) {
  if (!a.length) return null;
  const sorted = [...a].sort((x, y) => x - y),
    i = (sorted.length - 1) * p,
    lo = Math.floor(i);
  return sorted[lo] + (sorted[Math.ceil(i)] - sorted[lo]) * (i - lo);
}
export const distintas = (historias: HistoriaProjeto[]) => [
  ...new Map(
    [...historias]
      .sort((a, b) => a.sprint - b.sprint)
      .map((h) => [h.codigo, h]),
  ).values(),
];
export const faixaPontos = (p: number | null) =>
  p === null
    ? "Sem pontuação"
    : p >= 1 && p <= 3
      ? "1 a 3 pontos"
      : [5, 8, 13].includes(p)
        ? `${p} pontos`
        : "Outras pontuações";
export function estadoUS(
  transicoes: TransicaoAnalise[],
  us: string,
  sprint = Infinity,
) {
  return transicoes
    .filter((t) => t.us === us && t.sprint <= sprint)
    .sort((a, b) => a.data.localeCompare(b.data) || a.id.localeCompare(b.id))
    .at(-1);
}
export function temposUS(
  transicoes: TransicaoAnalise[],
  us: string,
  feriados: string[] = [],
) {
  const ts = transicoes
    .filter((t) => t.us === us)
    .sort((a, b) => a.data.localeCompare(b.data));
  const inicio = ts.find((t) => t.etapa === "Levantamento");
  const especificacao = ts.find(
    (t) => t.etapa === "Conclusão da especificação",
  );
  const envio = ts.find((t) => t.etapa === "Envio para validação");
  const aprovacao = ts.findLast((t) => t.etapa === "Aprovação final");
  return {
    analise:
      inicio && especificacao
        ? diasUteis(inicio.data, especificacao.data, feriados)
        : null,
    validacao:
      envio && aprovacao
        ? diasUteis(envio.data, aprovacao.data, feriados)
        : null,
    ciclo:
      inicio && aprovacao
        ? diasUteis(inicio.data, aprovacao.data, feriados)
        : null,
    rodadas: envio
      ? ts.filter(
          (t) =>
            t.etapa === "Envio para validação" &&
            (!aprovacao || t.data <= aprovacao.data),
        ).length
      : null,
    aprovacao,
  };
}
export function dataValida(d: unknown): d is string {
  if (typeof d !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const data = new Date(`${d}T00:00:00Z`);
  return Number.isFinite(+data) && data.toISOString().slice(0, 10) === d;
}
export const etapaAtual = (etapa?: string) =>
  ({
    "Envio para validação": "Aguardando validação",
    "Retorno da validação": "Ajustes",
    "Conclusão do levantamento": "Especificação",
    "Conclusão da especificação": "Aguardando validação",
    Reaberta: "Ajustes",
  })[etapa ?? ""] ?? etapa;
export function validarBaseAnalise(valor: unknown): valor is BaseAnalise {
  if (!valor || typeof valor !== "object") return false;
  const b = valor as BaseAnalise;
  return (
    b.versao === 1 &&
    Array.isArray(b.atividades) &&
    Array.isArray(b.transicoes) &&
    Array.isArray(b.alocacoes) &&
    !!b.config &&
    Number.isFinite(b.config.jornadaFte ?? 8) &&
    (b.config.jornadaFte ?? 8) > 0 &&
    (b.config.jornadaFte ?? 8) <= 24 &&
    [b.config.margem, b.config.carga, b.config.baixa, b.config.media].every(
      (n) => typeof n === "number" && Number.isFinite(n),
    ) &&
    b.config.margem >= 0 &&
    b.config.carga > b.config.margem &&
    b.config.baixa >= 6 &&
    b.config.media > b.config.baixa &&
    b.config.media <= 17 &&
    [
      b.config.wip,
      b.config.prazo,
      b.config.retrabalho,
      b.config.pendenciasIniciais ?? null,
    ].every(
      (n) =>
        n === null || (typeof n === "number" && Number.isFinite(n) && n >= 0),
    ) &&
    Array.isArray(b.config.feriados) &&
    b.config.feriados.every(dataValida) &&
    b.atividades.every(
      (a) =>
        !!a &&
        typeof a.id === "string" &&
        typeof a.analista === "string" &&
        typeof a.us === "string" &&
        typeof a.horas === "number" &&
        Number.isFinite(a.horas) &&
        a.horas >= 0 &&
        Number.isInteger(a.sprint) &&
        a.sprint >= 18 &&
        a.sprint <= 23 &&
        [a.modulo, a.situacao, a.impedimento, a.observacao, a.motivo].every(
          (v) => typeof v === "string",
        ) &&
        ATIVIDADES.includes(a.tipo) &&
        dataValida(a.inicio) &&
        (a.fim === "" || (dataValida(a.fim) && a.fim >= a.inicio)),
    ) &&
    b.transicoes.every(
      (t) =>
        !!t &&
        typeof t.id === "string" &&
        typeof t.us === "string" &&
        /^US\d+$/.test(t.us) &&
        dataValida(t.data) &&
        typeof t.etapa === "string" &&
        typeof t.analista === "string" &&
        Number.isInteger(t.sprint) &&
        t.sprint >= 18 &&
        t.sprint <= 23 &&
        (t.estimativa === null ||
          (typeof t.estimativa === "number" &&
            Number.isFinite(t.estimativa) &&
            t.estimativa >= 0)) &&
        (t.dimensoes === null ||
          (Array.isArray(t.dimensoes) &&
            t.dimensoes.length === 6 &&
            t.dimensoes.every((n) => Number.isInteger(n) && n >= 1 && n <= 3))),
    ) &&
    b.alocacoes.every(
      (a) =>
        !!a &&
        typeof a.id === "string" &&
        typeof a.analista === "string" &&
        Number.isInteger(a.sprint) &&
        a.sprint >= 18 &&
        a.sprint <= 23 &&
        [
          a.dias,
          a.jornada,
          a.dedicacao,
          a.reunioes,
          a.ferias,
          a.afastamentos,
          a.apoio,
          a.imprevistos,
        ].every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0) &&
        a.dedicacao <= 100 &&
        a.jornada <= 24 &&
        a.dias <= 31 &&
        liquida(a) >= 0,
    ) &&
    new Set(b.alocacoes.map((a) => `${a.analista}:${a.sprint}`)).size ===
      b.alocacoes.length
  );
}
