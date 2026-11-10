// Motor de cálculo do impacto de uma suspensão de férias na folha (Arts. 16 e 17).
//
// Implementa as regras alinhadas na reunião de 04/11/2026 (Janne, Ronaldo, Débora):
//   - Regime de competência: o fato gerador das férias é o USUFRUTO.
//   - O adiantamento é pago na folha do mês ANTERIOR ao mês do usufruto.
//   - Remuneração e 1/3 constitucional são proporcionais aos dias EFETIVAMENTE usufruídos.
//   - A cada competência há confronto automático: direito × usufruído × pago.
//   - Dias que saem de uma competência já paga: estorno do adiantamento (devolução).
//   - Dias que entram numa competência: novo adiantamento, na folha anterior ao novo usufruto.
//   - Mesma competência (mesma quantidade de dias): recálculo interno, sem devolução.
//
// Documentação completa: docs/ferias-motor-calculo-suspensao.md. Funções puras, sem React/DOM.
// O módulo de Férias expõe DIAS; os valores (R$) só são calculados quando a remuneração é informada
// (uso exclusivo da Folha / testes).

import { calcularAdiantamento } from "./regrasFolha";
import type { FundamentoSuspensao } from "./regrasSuspensao";

export interface IntervaloGozo {
  inicio: string;
  fim: string;
}

export interface EntradaMotorSuspensao {
  /** Parcelas (intervalos de gozo) originais, em datas ISO inclusivas. */
  parcelas: IntervaloGozo[];
  fundamento: FundamentoSuspensao;
  /** Primeiro dia suspenso. Dias do gozo anteriores a esta data contam como usufruídos. */
  suspensaoInicio: string;
  /** Art. 17: último dia da suspensão (retorno = dia seguinte). */
  suspensaoFim?: string;
  /** Art. 16: último dia da licença (retorno = 1º dia útil seguinte). */
  licencaFim?: string;
  feriados?: string[];
  /** Competência (AAAA-MM) da folha em processamento no momento do registro. */
  competenciaFolhaCorrente: string;
  /** Força o entendimento de que o adiantamento já foi pago (true) ou não (false). Se omitido,
   * deriva da competência: pago quando a folha anterior à do usufruto é anterior à corrente. */
  adiantamentoPago?: boolean;
  remuneracaoMensal?: number;
}

export type TipoEventoMotor =
  | "ESTORNO_ADIANTAMENTO"
  | "NOVO_ADIANTAMENTO"
  | "RECALCULO_ADIANTAMENTO_PENDENTE"
  | "RECALCULO_MESMA_COMPETENCIA";

export interface EventoFolhaSuspensao {
  tipo: TipoEventoMotor;
  /** Competência (AAAA-MM) do usufruto a que o evento se refere. */
  competenciaUsufruto: string;
  /** Competência (AAAA-MM) da folha em que o evento é lançado. */
  competenciaFolha: string;
  /** Quantidade de dias envolvidos (sempre positiva). */
  dias: number;
  descricao: string;
  /** Preenchidos apenas quando `remuneracaoMensal` é informada. Positivo = a pagar; negativo = a descontar. */
  valorRemuneracao?: number;
  valorTerco?: number;
  valor?: number;
}

export interface LinhaCompetencia {
  competencia: string;
  diasOriginais: number;
  diasNovos: number;
  /** diasNovos − diasOriginais. */
  diferencaDias: number;
  adiantamentoPagoOriginal: boolean;
}

export interface ResultadoMotorSuspensao {
  diasTotais: number;
  diasUsufruidosAntes: number;
  diasSuspensos: number;
  diasRestantes: number;
  retorno: string;
  novasParcelas: IntervaloGozo[];
  novaDataTermino: string;
  competencias: LinhaCompetencia[];
  eventos: EventoFolhaSuspensao[];
  /** Soma líquida de dias estornados (≥ 0). */
  totalDiasEstornados: number;
  totalDiasNovoAdiantamento: number;
  /** Soma líquida em R$ (quando há remuneração informada). */
  saldoLiquido?: number;
}

// --- Datas (UTC, imunes ao fuso/horário de verão) ---

function partes(isoData: string): [number, number, number] {
  const [a, m, d] = isoData.split("-").map(Number);
  return [a, m, d];
}

export function adicionarDiasIso(isoData: string, dias: number): string {
  const [a, m, d] = partes(isoData);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

export function diferencaDiasIso(inicio: string, fim: string): number {
  const [a1, m1, d1] = partes(inicio);
  const [a2, m2, d2] = partes(fim);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86_400_000);
}

export function competenciaAnterior(competencia: string): string {
  const [ano, mes] = competencia.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 2, 1));
  return data.toISOString().slice(0, 7);
}

export function proximoDiaUtilIso(isoData: string, feriados: string[] = []): string {
  const feriadosSet = new Set(feriados);
  let atual = adicionarDiasIso(isoData, 1);
  for (;;) {
    const [a, m, d] = partes(atual);
    const dow = new Date(Date.UTC(a, m - 1, d)).getUTCDay();
    if (dow !== 0 && dow !== 6 && !feriadosSet.has(atual)) return atual;
    atual = adicionarDiasIso(atual, 1);
  }
}

function expandirDias(intervalos: IntervaloGozo[]): string[] {
  const dias = new Set<string>();
  for (const { inicio, fim } of intervalos) {
    if (!inicio || !fim || fim < inicio) continue;
    for (let d = inicio; d <= fim; d = adicionarDiasIso(d, 1)) dias.add(d);
  }
  return [...dias].sort();
}

function agruparEmIntervalos(dias: string[]): IntervaloGozo[] {
  const ordenados = [...new Set(dias)].sort();
  const saida: IntervaloGozo[] = [];
  for (const dia of ordenados) {
    const ultimo = saida[saida.length - 1];
    if (ultimo && adicionarDiasIso(ultimo.fim, 1) === dia) ultimo.fim = dia;
    else saida.push({ inicio: dia, fim: dia });
  }
  return saida;
}

function contarPorCompetencia(dias: string[]): Record<string, number> {
  const mapa: Record<string, number> = {};
  for (const dia of dias) {
    const c = dia.slice(0, 7);
    mapa[c] = (mapa[c] ?? 0) + 1;
  }
  return mapa;
}

const maiorCompetencia = (a: string, b: string) => (a >= b ? a : b);

const rotuloCompetencia = (c: string) => `${c.slice(5, 7)}/${c.slice(0, 4)}`;

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/** Componentes do adiantamento: remuneração proporcional + 1/3 constitucional (RN-MOT-03). */
export function componentesAdiantamento(remuneracaoMensal: number, dias: number) {
  const valorRemuneracao = arredondar((remuneracaoMensal / 30) * dias);
  const total = calcularAdiantamento(remuneracaoMensal, dias);
  return { valorRemuneracao, valorTerco: arredondar(total - valorRemuneracao), valor: total };
}

const dataBr = (isoData: string) => `${isoData.slice(8, 10)}/${isoData.slice(5, 7)}/${isoData.slice(0, 4)}`;

/** Mensagens da validação de entrada do motor (RN-MOT-09). */
export const MENSAGENS_ENTRADA_MOTOR = {
  fimObrigatorioArt17: "Informe a data de fim da suspensão. Sem ela não é possível efetivar a suspensão nem calcular o retorno às férias.",
  fimObrigatorioArt16: "Informe a data de fim da licença. Sem ela não é possível efetivar a suspensão (Art. 16) nem calcular o retorno às férias.",
  fimAnteriorAoInicio: "A data de término da suspensão não pode ser anterior ao início.",
  inicioForaDaParcela: (inicio: string, fim: string) =>
    `A data de início da suspensão precisa estar dentro do período da parcela (${dataBr(inicio)} a ${dataBr(fim)}).`,
} as const;

/**
 * RN-MOT-09 — Valida a entrada antes de calcular/efetivar: data de fim obrigatória (Art. 17:
 * fim da suspensão; Art. 16: fim da licença), fim ≥ início e início dentro do período das
 * parcelas informadas. Retorna a mensagem do primeiro problema ou null quando a entrada é válida.
 * O sistema não efetiva a suspensão com entrada inválida.
 */
export function validarEntradaSuspensao(
  entrada: Pick<EntradaMotorSuspensao, "parcelas" | "fundamento" | "suspensaoInicio" | "suspensaoFim" | "licencaFim">,
): string | null {
  const fim = entrada.fundamento === "ART_17" ? entrada.suspensaoFim : entrada.licencaFim;
  if (!fim) {
    return entrada.fundamento === "ART_17" ? MENSAGENS_ENTRADA_MOTOR.fimObrigatorioArt17 : MENSAGENS_ENTRADA_MOTOR.fimObrigatorioArt16;
  }
  if (!entrada.suspensaoInicio || fim < entrada.suspensaoInicio) return MENSAGENS_ENTRADA_MOTOR.fimAnteriorAoInicio;
  const dias = expandirDias(entrada.parcelas);
  if (dias.length && (entrada.suspensaoInicio < dias[0] || entrada.suspensaoInicio > dias[dias.length - 1])) {
    return MENSAGENS_ENTRADA_MOTOR.inicioForaDaParcela(dias[0], dias[dias.length - 1]);
  }
  return null;
}

/**
 * Calcula o novo calendário de gozo e o impacto na folha, competência a competência.
 * A entrada deve ter sido validada por `validarEntradaSuspensao` (RN-MOT-09).
 */
export function calcularImpactoSuspensao(entrada: EntradaMotorSuspensao): ResultadoMotorSuspensao {
  const diasOriginais = expandirDias(entrada.parcelas);
  const usufruidos = diasOriginais.filter((d) => d < entrada.suspensaoInicio);
  const restantes = diasOriginais.filter((d) => d >= entrada.suspensaoInicio);

  const fimSuspensao = entrada.fundamento === "ART_17" ? entrada.suspensaoFim : entrada.licencaFim;
  const retorno = !fimSuspensao
    ? entrada.suspensaoInicio
    : entrada.fundamento === "ART_17"
      ? adicionarDiasIso(fimSuspensao, 1)
      : proximoDiaUtilIso(fimSuspensao, entrada.feriados);

  // RN-MOT-01: o motor recebe só a parcela suspensa; cada dia restante dela é deslocado pelo mesmo
  // intervalo (suspensão + eventual espera até o dia útil). Dias usufruídos não se movem.
  const deslocamento = Math.max(0, diferencaDiasIso(entrada.suspensaoInicio, retorno));
  const novosRestantes = restantes.map((d) => adicionarDiasIso(d, deslocamento));
  const diasNovos = [...usufruidos, ...novosRestantes];
  const novasParcelas = agruparEmIntervalos(diasNovos);

  const contOrig = contarPorCompetencia(diasOriginais);
  const contNovo = contarPorCompetencia(diasNovos);
  const corrente = entrada.competenciaFolhaCorrente;
  const competencias = [...new Set([...Object.keys(contOrig), ...Object.keys(contNovo)])].sort();

  const pagoOriginal = (c: string): boolean => {
    if ((contOrig[c] ?? 0) === 0) return false;
    if (entrada.adiantamentoPago !== undefined) return entrada.adiantamentoPago;
    // A folha corrente ainda está aberta (pagamento no fim do mês): só é "pago" o que saiu antes.
    return competenciaAnterior(c) < corrente;
  };

  const linhas: LinhaCompetencia[] = [];
  const eventos: EventoFolhaSuspensao[] = [];
  const rem = entrada.remuneracaoMensal;
  const comValor = (dias: number, sinal: 1 | -1) => {
    if (rem === undefined) return {};
    const c = componentesAdiantamento(rem, dias);
    return { valorRemuneracao: sinal * c.valorRemuneracao, valorTerco: sinal * c.valorTerco, valor: sinal * c.valor };
  };

  for (const c of competencias) {
    const orig = contOrig[c] ?? 0;
    const novo = contNovo[c] ?? 0;
    const diff = novo - orig;
    const pago = pagoOriginal(c);
    linhas.push({ competencia: c, diasOriginais: orig, diasNovos: novo, diferencaDias: diff, adiantamentoPagoOriginal: pago });

    const folhaAdiantamento = maiorCompetencia(competenciaAnterior(c), corrente);

    if (diff === 0) {
      if (orig > 0) {
        // RN-MOT-06: mesma competência, mesma quantidade de dias — recalcula, sem devolução.
        eventos.push({
          tipo: "RECALCULO_MESMA_COMPETENCIA",
          competenciaUsufruto: c,
          competenciaFolha: maiorCompetencia(c, corrente),
          dias: 0,
          descricao: `Competência ${rotuloCompetencia(c)}: usufruto permanece no mês (${orig} dia(s)); recálculo interno, sem devolução.`,
          ...(rem === undefined ? {} : { valorRemuneracao: 0, valorTerco: 0, valor: 0 }),
        });
      }
      continue;
    }

    if (diff < 0) {
      const removidos = -diff;
      if (pago) {
        // RN-MOT-04: dias que saíram de uma competência já adiantada são devolvidos na folha dessa competência.
        eventos.push({
          tipo: "ESTORNO_ADIANTAMENTO",
          competenciaUsufruto: c,
          competenciaFolha: maiorCompetencia(c, corrente),
          dias: removidos,
          descricao: `Estorno do adiantamento de ${removidos} dia(s) não usufruído(s) em ${rotuloCompetencia(c)}.`,
          ...comValor(removidos, -1),
        });
      } else {
        // RN-MOT-07: adiantamento ainda não pago — apenas reduz a base de cálculo.
        eventos.push({
          tipo: "RECALCULO_ADIANTAMENTO_PENDENTE",
          competenciaUsufruto: c,
          competenciaFolha: folhaAdiantamento,
          dias: removidos,
          descricao: `Adiantamento de ${rotuloCompetencia(c)} ainda não pago: base reduzida em ${removidos} dia(s).`,
          ...(rem === undefined ? {} : { valorRemuneracao: 0, valorTerco: 0, valor: 0 }),
        });
      }
      continue;
    }

    // diff > 0
    if (orig === 0 || pago) {
      // RN-MOT-05: dias que passaram a ocorrer nesta competência são adiantados na folha anterior ao usufruto.
      eventos.push({
        tipo: "NOVO_ADIANTAMENTO",
        competenciaUsufruto: c,
        competenciaFolha: folhaAdiantamento,
        dias: diff,
        descricao: `Adiantamento de ${diff} dia(s) a usufruir em ${rotuloCompetencia(c)}, na folha de ${rotuloCompetencia(folhaAdiantamento)}.`,
        ...comValor(diff, 1),
      });
    } else {
      eventos.push({
        tipo: "RECALCULO_ADIANTAMENTO_PENDENTE",
        competenciaUsufruto: c,
        competenciaFolha: folhaAdiantamento,
        dias: diff,
        descricao: `Adiantamento de ${rotuloCompetencia(c)} ainda não pago: base ampliada em ${diff} dia(s).`,
        ...(rem === undefined ? {} : { valorRemuneracao: 0, valorTerco: 0, valor: 0 }),
      });
    }
  }

  const totalDiasEstornados = eventos.filter((e) => e.tipo === "ESTORNO_ADIANTAMENTO").reduce((s, e) => s + e.dias, 0);
  const totalDiasNovoAdiantamento = eventos.filter((e) => e.tipo === "NOVO_ADIANTAMENTO").reduce((s, e) => s + e.dias, 0);

  return {
    diasTotais: diasOriginais.length,
    diasUsufruidosAntes: usufruidos.length,
    diasSuspensos: deslocamento,
    diasRestantes: restantes.length,
    retorno,
    novasParcelas,
    novaDataTermino: diasNovos.length ? diasNovos[diasNovos.length - 1] : "",
    competencias: linhas,
    eventos,
    totalDiasEstornados,
    totalDiasNovoAdiantamento,
    ...(rem === undefined ? {} : { saldoLiquido: arredondar(eventos.reduce((s, e) => s + (e.valor ?? 0), 0)) }),
  };
}
