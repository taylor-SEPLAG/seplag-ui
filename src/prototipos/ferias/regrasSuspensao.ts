// Regras de suspensão de férias — Art. 16 (licença gestante/adotante/paternidade) e
// Art. 17 (superior interesse público), conforme o documento consolidado de RN do SIGEP
// (RN-SUS-01 a RN-SUS-10). Funções puras, sem React/DOM.
//
// Diferença estrutural em relação ao estado genérico `SUSPENSO` do protótipo: aqui a suspensão
// carrega o fundamento legal (Art. 16 vs. Art. 17), que determina retomada automática, prazo e
// impacto financeiro.

export type FundamentoSuspensao = "ART_16" | "ART_17";

export const CodigoErroSuspensao = {
  SEM_SOBREPOSICAO_LICENCA: "SEM_SOBREPOSICAO_LICENCA",
  CAUSA_OBRIGATORIA: "CAUSA_OBRIGATORIA",
  PRAZO_ACIMA_DO_MAXIMO: "PRAZO_ACIMA_DO_MAXIMO",
  AUTORIZACAO_PENDENTE: "AUTORIZACAO_PENDENTE",
} as const;

export type CodigoErroSuspensao =
  (typeof CodigoErroSuspensao)[keyof typeof CodigoErroSuspensao];

export interface ResultadoSuspensao {
  sucesso: boolean;
  erro_codigo: CodigoErroSuspensao | "";
  mensagem: string;
}

// --- Parâmetros ---
const ART17_PRAZO_MAXIMO_DIAS = 60; // RN-SUS-07
const ART17_ALERTA_DIAS_VENCIMENTO = 5; // RN-SUS-07

function paraData(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function iso(data: Date): string {
  return data.toISOString().slice(0, 10);
}

function diasEntre(inicioIso: string, fimIso: string): number {
  return Math.round((paraData(fimIso).getTime() - paraData(inicioIso).getTime()) / 86_400_000);
}

function adicionarDias(isoData: string, dias: number): string {
  const data = paraData(isoData);
  data.setDate(data.getDate() + dias);
  return iso(data);
}

function sucesso(): ResultadoSuspensao {
  return { sucesso: true, erro_codigo: "", mensagem: "Suspensão válida." };
}

function falha(erro_codigo: CodigoErroSuspensao, mensagem: string): ResultadoSuspensao {
  return { sucesso: false, erro_codigo, mensagem };
}

/** true quando a data ISO cai em sábado, domingo ou num dos feriados informados. Usado para o
 * alerta não-bloqueante de retorno da suspensão (decisão de reunião: avisar, nunca ajustar). */
export function ehFimDeSemanaOuFeriado(isoData: string, feriados: string[] = []): boolean {
  if (!isoData) return false;
  const data = paraData(isoData);
  const diaSemana = data.getDay();
  return diaSemana === 0 || diaSemana === 6 || feriados.includes(isoData);
}

/** Último dia da suspensão: início + (dias - 1), inclusivo. */
export function fimSuspensao(inicioIso: string, dias: number): string {
  if (!inicioIso || dias < 1) return "";
  return adicionarDias(inicioIso, dias - 1);
}

/**
 * Próximo dia útil a partir de uma data (exclusive): pula sábados, domingos e os feriados
 * informados (lista de datas ISO). Usado para a retomada automática do Art. 16 (RN-SUS-02).
 */
export function proximoDiaUtil(isoData: string, feriados: string[] = []): string {
  const feriadosSet = new Set(feriados);
  let data = paraData(isoData);
  do {
    data = paraData(adicionarDias(iso(data), 1));
  } while (data.getDay() === 0 || data.getDay() === 6 || feriadosSet.has(iso(data)));
  return iso(data);
}

export interface SobreposicaoLicenca {
  /** Datas do período de férias em curso. */
  feriasInicio: string;
  feriasFim: string;
  /** Datas da licença concedida. */
  licencaInicio: string;
  licencaFim: string;
}

/**
 * RN-SUS-01 — Gatilho de suspensão automática (Art. 16): verifica se a licença se sobrepõe ao
 * período de férias em curso. Só então a suspensão automática deve ser registrada.
 */
export function licencaSobrepoeFerias(dados: SobreposicaoLicenca): boolean {
  return dados.licencaInicio <= dados.feriasFim && dados.feriasInicio <= dados.licencaFim;
}

export interface RetomadaArt16 {
  /** Primeiro dia útil após o término da licença (RN-SUS-02). */
  dataRetomada: string;
  /** Saldo de dias remanescentes a usufruir na retomada (RN-SUS-03). */
  saldoRemanescente: number;
}

/**
 * RN-SUS-02 e RN-SUS-03 — Calcula a retomada automática do Art. 16. A data de retomada é o
 * primeiro dia útil após o fim da licença; o saldo remanescente é `diasTotaisAgendados −
 * diasJaUsufruidosAntesDaSuspensao`.
 */
export function calcularRetomadaArt16(
  diasTotaisAgendados: number,
  diasJaUsufruidos: number,
  licencaFim: string,
  feriados: string[] = [],
): RetomadaArt16 {
  const saldoRemanescente = Math.max(0, diasTotaisAgendados - diasJaUsufruidos);
  return {
    dataRetomada: proximoDiaUtil(licencaFim, feriados),
    saldoRemanescente,
  };
}

export interface SolicitacaoSuspensaoArt17 {
  /** Descrição detalhada da causa motivadora (RN-SUS-05). */
  causa: string;
  /** Prazo estimado em dias corridos (RN-SUS-05 / RN-SUS-07: máx. 60). */
  prazoEstimadoDias: number;
  /** Autorização expressa do dirigente máximo registrada (RN-SUS-06). */
  autorizadoPeloDirigente: boolean;
}

/**
 * RN-SUS-05, RN-SUS-06 e RN-SUS-07 — Valida a solicitação de suspensão por interesse público:
 * exige causa detalhada, prazo de no máximo 60 dias e autorização do dirigente máximo.
 */
export function validarSuspensaoArt17(solicitacao: SolicitacaoSuspensaoArt17): ResultadoSuspensao {
  if (!solicitacao.causa.trim()) {
    return falha(
      CodigoErroSuspensao.CAUSA_OBRIGATORIA,
      "A suspensão por superior interesse público exige descrição detalhada da causa motivadora.",
    );
  }
  if (solicitacao.prazoEstimadoDias > ART17_PRAZO_MAXIMO_DIAS) {
    return falha(
      CodigoErroSuspensao.PRAZO_ACIMA_DO_MAXIMO,
      `O prazo de suspensão por interesse público é limitado a ${ART17_PRAZO_MAXIMO_DIAS} dias corridos ` +
        `(informado: ${solicitacao.prazoEstimadoDias} dias).`,
    );
  }
  if (!solicitacao.autorizadoPeloDirigente) {
    return falha(
      CodigoErroSuspensao.AUTORIZACAO_PENDENTE,
      "A suspensão só é efetivada com autorização expressa do dirigente máximo do órgão ou entidade.",
    );
  }
  return sucesso();
}

/**
 * RN-SUS-05 e RN-SUS-07 — Valida a SOLICITAÇÃO (registro pela setorial): causa detalhada e prazo
 * de no máximo 60 dias. A autorização do dirigente (RN-SUS-06) não é exigida aqui: é conferida
 * pelo órgão central na aprovação, que é o que efetiva a suspensão (validarSuspensaoArt17).
 */
export function validarSolicitacaoSuspensaoArt17(
  solicitacao: Omit<SolicitacaoSuspensaoArt17, "autorizadoPeloDirigente">,
): ResultadoSuspensao {
  return validarSuspensaoArt17({ ...solicitacao, autorizadoPeloDirigente: true });
}

export interface AlertaPrazoArt17 {
  /** Último dia da suspensão (início + prazo). */
  fimPrazo: string;
  diasRestantes: number;
  /** Alerta quando faltam 5 dias ou menos (RN-SUS-07). */
  alertar: boolean;
  vencido: boolean;
}

/**
 * RN-SUS-07 — Alerta de proximidade do vencimento do prazo de 60 dias da suspensão Art. 17.
 */
export function alertaPrazoArt17(
  inicioSuspensao: string,
  prazoDias: number,
  hoje: string,
): AlertaPrazoArt17 {
  const fimPrazo = adicionarDias(inicioSuspensao, prazoDias);
  const diasRestantes = diasEntre(hoje, fimPrazo);
  return {
    fimPrazo,
    diasRestantes,
    alertar: diasRestantes <= ART17_ALERTA_DIAS_VENCIMENTO,
    vencido: diasRestantes < 0,
  };
}
