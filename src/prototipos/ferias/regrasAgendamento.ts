// Regras de agendamento de férias comuns derivadas do documento consolidado de RN do SIGEP
// (RN-AGD-01 a RN-AGD-07). Funções puras, sem dependência de React/DOM, isoladas num módulo
// à parte pelo mesmo motivo de Fast Refresh descrito em feriasMockDados.ts.
//
// Base normativa citada no documento: LC 04/90 art. 97 §5º (2019) e Decreto Estadual 656/2020 (MT).

export interface ParcelaAgendamento {
  inicio: string; // ISO yyyy-mm-dd
  fim: string; // ISO yyyy-mm-dd
  dias: number;
}

export interface PeriodoAquisitivoInfo {
  /** Início do período aquisitivo (ISO). */
  inicio: string;
  /** Fim do período aquisitivo (ISO). Vazio = ainda em curso / indeterminado. */
  fim: string;
}

export const CodigoErroAgendamento = {
  FRACIONAMENTO_EXCEDE_ETAPAS: "FRACIONAMENTO_EXCEDE_ETAPAS",
  PARCELA_ABAIXO_DO_MINIMO: "PARCELA_ABAIXO_DO_MINIMO",
  COMBINACAO_NAO_PERMITIDA: "COMBINACAO_NAO_PERMITIDA",
  INTERVALO_ENTRE_ETAPAS: "INTERVALO_ENTRE_ETAPAS",
  ANTECEDENCIA_INSUFICIENTE: "ANTECEDENCIA_INSUFICIENTE",
  SALDO_INSUFICIENTE: "SALDO_INSUFICIENTE",
  AGENDAMENTO_SOBREPOSTO: "AGENDAMENTO_SOBREPOSTO",
  PERIODO_AQUISITIVO_EM_CURSO: "PERIODO_AQUISITIVO_EM_CURSO",
  PRAZO_REGISTRO_ENCERRADO: "PRAZO_REGISTRO_ENCERRADO",
} as const;

export type CodigoErroAgendamento =
  (typeof CodigoErroAgendamento)[keyof typeof CodigoErroAgendamento];

export interface ResultadoRegra {
  sucesso: boolean;
  erro_codigo: CodigoErroAgendamento | "";
  mensagem: string;
}

// --- Parâmetros (RN-AGD-01, 02, 07) ---
const FRACIONAMENTO_MAX_ETAPAS = 3;
const PARCELA_DIAS_MINIMO = 10;
const INTERVALO_MINIMO_ENTRE_ETAPAS = 10; // dias corridos
const ANTECEDENCIA_MINIMA_PADRAO = 30; // dias corridos
const CONCESSIVO_MESES = 12;
const ALERTA_CONCESSIVO_DIAS_PADRAO = 60; // parametrizável pela gestão de pessoas

// Combinações de fracionamento permitidas pela RN-AGD-01 (conjuntos de dias por etapa,
// independentes da ordem): (a) 3×10; (b) 2×15; (c) 20+10. Uma única etapa de 30 também é
// válida (férias não fracionadas).
const COMBINACOES_PERMITIDAS: number[][] = [
  [30],
  [15, 15],
  [20, 10],
  [10, 10, 10],
];

function paraData(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function diasEntre(inicioIso: string, fimIso: string): number {
  return Math.round((paraData(fimIso).getTime() - paraData(inicioIso).getTime()) / 86_400_000);
}

function adicionarMeses(iso: string, meses: number): Date {
  const data = paraData(iso);
  data.setMonth(data.getMonth() + meses);
  return data;
}

function sucesso(): ResultadoRegra {
  return { sucesso: true, erro_codigo: "", mensagem: "Agendamento válido." };
}

function falha(erro_codigo: CodigoErroAgendamento, mensagem: string): ResultadoRegra {
  return { sucesso: false, erro_codigo, mensagem };
}

function mesmaCombinacao(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const ordenar = (lista: number[]) => [...lista].sort((x, y) => x - y);
  const oa = ordenar(a);
  const ob = ordenar(b);
  return oa.every((valor, i) => valor === ob[i]);
}

/**
 * RN-AGD-01 — Fracionamento. Valida número de etapas (≤ 3), mínimo de 10 dias por etapa,
 * a combinação de dias (3×10, 2×15, 20+10 ou 30 único) e o intervalo mínimo de 10 dias
 * corridos entre o fim de uma etapa e o início da seguinte. As parcelas são ordenadas por
 * data de início antes de medir o intervalo.
 */
export function validarFracionamento(parcelas: ParcelaAgendamento[]): ResultadoRegra {
  if (parcelas.length === 0) {
    return falha(CodigoErroAgendamento.COMBINACAO_NAO_PERMITIDA, "Informe ao menos uma etapa de férias.");
  }
  if (parcelas.length > FRACIONAMENTO_MAX_ETAPAS) {
    return falha(
      CodigoErroAgendamento.FRACIONAMENTO_EXCEDE_ETAPAS,
      `As férias podem ser fracionadas em no máximo ${FRACIONAMENTO_MAX_ETAPAS} etapas (informadas: ${parcelas.length}).`,
    );
  }
  for (const parcela of parcelas) {
    if (parcela.dias < PARCELA_DIAS_MINIMO) {
      return falha(
        CodigoErroAgendamento.PARCELA_ABAIXO_DO_MINIMO,
        `Cada etapa precisa ter no mínimo ${PARCELA_DIAS_MINIMO} dias corridos (etapa de ${parcela.dias} dias).`,
      );
    }
  }
  const dias = parcelas.map((p) => p.dias);
  const combinacaoValida = COMBINACOES_PERMITIDAS.some((combo) => mesmaCombinacao(combo, dias));
  if (!combinacaoValida) {
    return falha(
      CodigoErroAgendamento.COMBINACAO_NAO_PERMITIDA,
      "A combinação de etapas não é permitida. Combinações válidas: 30 dias; 15+15; 20+10; 10+10+10.",
    );
  }
  const ordenadas = [...parcelas].sort((a, b) => a.inicio.localeCompare(b.inicio));
  for (let i = 1; i < ordenadas.length; i++) {
    const intervalo = diasEntre(ordenadas[i - 1].fim, ordenadas[i].inicio);
    if (intervalo < INTERVALO_MINIMO_ENTRE_ETAPAS) {
      return falha(
        CodigoErroAgendamento.INTERVALO_ENTRE_ETAPAS,
        `Entre as etapas deve transcorrer intervalo mínimo de ${INTERVALO_MINIMO_ENTRE_ETAPAS} dias corridos (intervalo informado: ${intervalo} dias).`,
      );
    }
  }
  return sucesso();
}

/**
 * RN-AGD-02 — Antecedência mínima de 30 dias corridos entre a solicitação e o início do gozo,
 * salvo autorização expressa da chefia (quando `autorizacaoChefia` é true, a regra é dispensada).
 * Substituída nas telas de Férias pela RN017 (registro até o dia 05 do mês anterior ao usufruto,
 * `validarPrazoRegistroFerias`); mantida apenas como referência e para os testes existentes.
 */
export function validarAntecedencia(
  dataSolicitacao: string,
  dataInicioGozo: string,
  autorizacaoChefia = false,
): ResultadoRegra {
  if (autorizacaoChefia) return sucesso();
  const antecedencia = diasEntre(dataSolicitacao, dataInicioGozo);
  if (antecedencia < ANTECEDENCIA_MINIMA_PADRAO) {
    return falha(
      CodigoErroAgendamento.ANTECEDENCIA_INSUFICIENTE,
      `O agendamento exige antecedência mínima de ${ANTECEDENCIA_MINIMA_PADRAO} dias corridos ` +
        `(informados: ${antecedencia} dias), salvo autorização expressa da chefia.`,
    );
  }
  return sucesso();
}

// --- RN017 (US302 — Tela Inicial): prazos do agendamento pelo mês do usufruto ---
const DIA_LIMITE_REGISTRO = 5; // registro até o dia 05 do mês anterior ao início do usufruto
const DIA_LIMITE_VALIDACAO = 9; // chefia aprova até o dia 09 desse mesmo mês

const doisDigitos = (n: number) => String(n).padStart(2, "0");
const dataBrIso = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;

/** Mês (AAAA-MM) anterior ao mês da data ISO informada. */
function mesAnterior(iso: string): string {
  const [ano, mes] = iso.split("-").map(Number);
  return mes === 1 ? `${ano - 1}-12` : `${ano}-${doisDigitos(mes - 1)}`;
}

export interface PrazosAgendamento {
  /** Último dia para registrar a solicitação: dia 05 do mês anterior ao início do usufruto. */
  limiteRegistro: string;
  /** Último dia para a chefia aprovar: dia 09 do mês anterior ao início do usufruto. A partir do
   * dia 10, a solicitação ainda "Aguardando Validação" é encerrada automaticamente. */
  limiteValidacao: string;
}

/** RN017 — Prazos do agendamento calculados a partir do início do usufruto (parcela mais antiga). */
export function prazosAgendamento(inicioUsufruto: string): PrazosAgendamento {
  const mes = mesAnterior(inicioUsufruto);
  return {
    limiteRegistro: `${mes}-${doisDigitos(DIA_LIMITE_REGISTRO)}`,
    limiteValidacao: `${mes}-${doisDigitos(DIA_LIMITE_VALIDACAO)}`,
  };
}

/**
 * RN017 — A solicitação de férias deve ser registrada até o dia 05 do mês anterior ao início do
 * usufruto. Ex.: usufruto a partir de 01/12 → registro até 05/11.
 */
export function validarPrazoRegistroFerias(hoje: string, inicioUsufruto: string): ResultadoRegra {
  const { limiteRegistro } = prazosAgendamento(inicioUsufruto);
  if (hoje > limiteRegistro) {
    return falha(
      CodigoErroAgendamento.PRAZO_REGISTRO_ENCERRADO,
      `A solicitação de férias deve ser registrada até o dia 05 do mês anterior ao início do usufruto. ` +
        `Para início em ${dataBrIso(inicioUsufruto)}, o prazo terminou em ${dataBrIso(limiteRegistro)}.`,
    );
  }
  return sucesso();
}

/**
 * RN-AGD-06 — Só é permitido agendar férias de período aquisitivo já completado. Dado o fim do
 * período aquisitivo e a data de referência (hoje), bloqueia quando o período ainda está em
 * curso (fim ausente ou no futuro em relação à referência).
 */
export function validarPeriodoAquisitivoCompletado(
  periodo: PeriodoAquisitivoInfo,
  hoje: string,
): ResultadoRegra {
  if (!periodo.fim || periodo.fim > hoje) {
    return falha(
      CodigoErroAgendamento.PERIODO_AQUISITIVO_EM_CURSO,
      "Não é possível agendar férias de período aquisitivo ainda em curso. O período precisa estar completado.",
    );
  }
  return sucesso();
}

export interface AlertaConcessivo {
  /** Último dia do período concessivo (12 meses após o fim do período aquisitivo). */
  fimConcessivo: string;
  /** Dias corridos entre hoje e o fim do período concessivo (negativo = já vencido). */
  diasRestantes: number;
  /** true quando faltam `alertaDias` ou menos para o vencimento (inclui já vencido). */
  alertar: boolean;
  /** true quando o período concessivo já venceu. */
  vencido: boolean;
}

/**
 * RN-AGD-07 — Período concessivo = 12 meses após o fim do período aquisitivo. Calcula o fim do
 * concessivo e sinaliza alerta quando faltam `alertaDias` (padrão 60, parametrizável) ou menos.
 * Retorna null quando o período aquisitivo não tem fim definido (ainda em curso).
 */
export function calcularAlertaConcessivo(
  periodoAquisitivoFim: string,
  hoje: string,
  alertaDias: number = ALERTA_CONCESSIVO_DIAS_PADRAO,
): AlertaConcessivo | null {
  if (!periodoAquisitivoFim) return null;
  const fimConcessivo = adicionarMeses(periodoAquisitivoFim, CONCESSIVO_MESES).toISOString().slice(0, 10);
  const diasRestantes = diasEntre(hoje, fimConcessivo);
  return {
    fimConcessivo,
    diasRestantes,
    alertar: diasRestantes <= alertaDias,
    vencido: diasRestantes < 0,
  };
}

/**
 * RN-AGD-05 — Vedação de agendamento sobreposto no mesmo vínculo. Recebe o período candidato e
 * os períodos já agendados (ativos) do mesmo servidor/vínculo e retorna erro se houver qualquer
 * interseção de datas.
 */
export function validarSemSobreposicao(
  candidato: { inicio: string; fim: string },
  agendadosAtivos: Array<{ inicio: string; fim: string }>,
): ResultadoRegra {
  const sobrepoe = agendadosAtivos.some(
    (existente) => candidato.inicio <= existente.fim && existente.inicio <= candidato.fim,
  );
  if (sobrepoe) {
    return falha(
      CodigoErroAgendamento.AGENDAMENTO_SOBREPOSTO,
      "Já existe um período de férias agendado que se sobrepõe às datas informadas para este servidor no mesmo vínculo.",
    );
  }
  return sucesso();
}
