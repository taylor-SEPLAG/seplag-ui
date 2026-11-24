import type { HistoriaProjeto, SprintProjeto } from "./types";
import { diasUteis } from "./analiseModelo";

export const CHAVE_SIMPLES = "sigep:analise-simples:v1";
export const CRITERIOS = [
  {
    nome: "Regras de negócio",
    opcoes: [
      "Poucas regras, simples e conhecidas",
      "Várias regras e exceções",
      "Muitas regras interdependentes",
    ],
  },
  {
    nome: "Fluxos e telas",
    opcoes: [
      "Fluxo simples",
      "Múltiplos fluxos ou situações",
      "Fluxos complexos com diversos cenários",
    ],
  },
  {
    nome: "Dependências",
    opcoes: [
      "Sem dependências relevantes",
      "Dependências internas",
      "Múltiplas integrações ou módulos",
    ],
  },
  {
    nome: "Validação dos requisitos",
    opcoes: [
      "Uma área envolvida e regras definidas",
      "Necessidade de alinhamentos",
      "Múltiplas áreas ou decisões pendentes",
    ],
  },
];
export interface Classificacao {
  us: string;
  analista: string;
  criterios: number[];
  registradoEm: string;
}
export interface Levantamento {
  us: string;
  analista: string;
  inicio: string;
  envio: string;
  aprovacao: string;
}
export interface Alocacao {
  id: string;
  analista: string;
  entrada: string;
  saida: string;
  dedicacao: "Integral" | "Parcial";
  percentual: number | null;
}
export interface BaseSimples {
  versao: 1;
  classificacoes: Classificacao[];
  levantamentos: Levantamento[];
  alocacoes: Alocacao[];
  feriados: string[];
}
export const novaBaseSimples = (): BaseSimples => ({
  versao: 1,
  classificacoes: [],
  levantamentos: [],
  alocacoes: [],
  feriados: [],
});
export const dataValida = (v: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
export const totalICA = (c: Classificacao | undefined) =>
  c ? c.criterios.reduce((a, b) => a + b, 0) : null;
export const faixaICA = (c: Classificacao | undefined) => {
  const n = totalICA(c);
  return n === null
    ? "Não classificada"
    : n <= 6
      ? "Baixa"
      : n <= 9
        ? "Média"
        : "Alta";
};
export const mediaSimples = (valores: (number | null)[]) => {
  const v = valores.filter((n): n is number => n !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};
export function unicas(historias: HistoriaProjeto[]) {
  const mapa = new Map<string, HistoriaProjeto>();
  for (const h of historias) {
    const anterior = mapa.get(h.codigo);
    mapa.set(
      h.codigo,
      anterior
        ? {
            ...h,
            analistas: [...new Set([...anterior.analistas, ...h.analistas])],
          }
        : h,
    );
  }
  return [...mapa.values()];
}
export function classificacaoUS(base: BaseSimples, us: string) {
  return base.classificacoes.filter((c) => c.us === us).at(-1);
}
export function tempoUS(base: BaseSimples, us: string) {
  const r = base.levantamentos.find((l) => l.us === us);
  return r?.inicio && r.envio
    ? diasUteis(r.inicio, r.envio, base.feriados)
    : null;
}
export function capacidadeSprint(
  base: BaseSimples,
  sprint: SprintProjeto,
  analista = "",
) {
  if (!dataValida(sprint.inicio) || !sprint.fim || !dataValida(sprint.fim))
    return null;
  const fim = sprint.fim;
  const registros = base.alocacoes.filter(
    (a) =>
      (!analista || a.analista === analista) &&
      a.entrada <= fim &&
      (!a.saida || a.saida >= sprint.inicio),
  );
  if (!registros.length) return null;
  const nomes = [...new Set(registros.map((a) => a.analista))];
  const integral = new Set(
    registros.filter((a) => a.dedicacao === "Integral").map((a) => a.analista),
  ).size;
  const parcial = new Set(
    registros.filter((a) => a.dedicacao === "Parcial").map((a) => a.analista),
  ).size;
  // FTE médio diário no período, incluindo entradas, saídas e alterações de dedicação.
  const dias: string[] = [];
  for (
    const d = new Date(sprint.inicio + "T00:00:00Z");
    d.toISOString().slice(0, 10) <= fim;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    const dia = d.toISOString().slice(0, 10);
    if (
      d.getUTCDay() !== 0 &&
      d.getUTCDay() !== 6 &&
      !base.feriados.includes(dia)
    )
      dias.push(dia);
  }
  const fte =
    registros.some((a) => a.percentual === null) || !dias.length
      ? null
      : dias.reduce(
          (soma, dia) =>
            soma +
            registros
              .filter((a) => a.entrada <= dia && (!a.saida || a.saida >= dia))
              .reduce((n, a) => n + (a.percentual ?? 0) / 100, 0),
          0,
        ) / dias.length;
  return { ativos: nomes.length, integral, parcial, fte, registros };
}
export function validarBaseSimples(valor: unknown): valor is BaseSimples {
  if (!valor || typeof valor !== "object") return false;
  const b = valor as BaseSimples;
  const texto = (v: unknown): v is string =>
    typeof v === "string" && v.trim().length > 0;
  const us = (v: unknown) => typeof v === "string" && /^US\d+$/.test(v);
  if (
    b.versao !== 1 ||
    !Array.isArray(b.classificacoes) ||
    !Array.isArray(b.levantamentos) ||
    !Array.isArray(b.alocacoes) ||
    !Array.isArray(b.feriados)
  )
    return false;
  if (!b.feriados.every((d) => typeof d === "string" && dataValida(d)))
    return false;
  if (
    !b.classificacoes.every(
      (c) =>
        c &&
        us(c.us) &&
        texto(c.analista) &&
        Array.isArray(c.criterios) &&
        c.criterios.length === 4 &&
        c.criterios.every((n) => Number.isInteger(n) && n >= 1 && n <= 3) &&
        texto(c.registradoEm) &&
        Number.isFinite(Date.parse(c.registradoEm)),
    )
  )
    return false;
  if (
    !b.levantamentos.every(
      (l) =>
        l &&
        us(l.us) &&
        texto(l.analista) &&
        dataValida(l.inicio) &&
        typeof l.envio === "string" &&
        (!l.envio || (dataValida(l.envio) && l.envio >= l.inicio)) &&
        typeof l.aprovacao === "string" &&
        (!l.aprovacao ||
          (dataValida(l.aprovacao) && l.aprovacao >= (l.envio || l.inicio))),
    )
  )
    return false;
  if (new Set(b.levantamentos.map((l) => l.us)).size !== b.levantamentos.length)
    return false;
  if (
    !b.alocacoes.every(
      (a) =>
        a &&
        texto(a.id) &&
        texto(a.analista) &&
        dataValida(a.entrada) &&
        typeof a.saida === "string" &&
        (!a.saida || (dataValida(a.saida) && a.saida >= a.entrada)) &&
        ["Integral", "Parcial"].includes(a.dedicacao) &&
        (a.percentual === null ||
          (Number.isFinite(a.percentual) &&
            a.percentual > 0 &&
            a.percentual <= 100 &&
            (a.dedicacao !== "Integral" || a.percentual === 100) &&
            (a.dedicacao !== "Parcial" || a.percentual < 100))),
    )
  )
    return false;
  if (new Set(b.alocacoes.map((a) => a.id)).size !== b.alocacoes.length)
    return false;
  return !b.alocacoes.some((a, i) =>
    b.alocacoes.some(
      (outro, j) =>
        i < j &&
        a.analista === outro.analista &&
        a.entrada <= (outro.saida || "9999-12-31") &&
        outro.entrada <= (a.saida || "9999-12-31"),
    ),
  );
}
