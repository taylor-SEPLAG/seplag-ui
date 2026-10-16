export type TipoVinculoRecesso = "RESIDENTE" | "ESTAGIARIO";

export interface SolicitacaoRecessoInput {
  tipo_vinculo: TipoVinculoRecesso;
  data_inicio_contrato: string;
  data_fim_contrato: string;
  data_solicitacao: string;
  data_inicio_recesso: string;
  quantidade_dias_solicitados: number;
  numero_parcela: number;
  saldo_dias_disponivel: number;
}

export interface ResultadoValidacaoRecesso {
  sucesso: boolean;
  erro_codigo: string;
  mensagem: string;
}

export const CodigoErroRecesso = {
  VINCULO_INVALIDO: "VINCULO_INVALIDO",
  CARENCIA_PERIODO_AQUISITIVO: "CARENCIA_PERIODO_AQUISITIVO",
  ANTECEDENCIA_INSUFICIENTE: "ANTECEDENCIA_INSUFICIENTE",
  PARCELA_ABAIXO_DO_MINIMO: "PARCELA_ABAIXO_DO_MINIMO",
  PARCELA_ACIMA_DO_MAXIMO: "PARCELA_ACIMA_DO_MAXIMO",
  NUMERO_PARCELA_INVALIDO: "NUMERO_PARCELA_INVALIDO",
  PARCELAMENTO_MAXIMO_EXCEDIDO: "PARCELAMENTO_MAXIMO_EXCEDIDO",
  SALDO_INSUFICIENTE: "SALDO_INSUFICIENTE",
  LIMITE_CONTRATO_EXCEDIDO: "LIMITE_CONTRATO_EXCEDIDO",
} as const;

// --- Regras do Residente (Lei nº 15.400/2026 e normas do Executivo) ---
const RESIDENTE_MESES_CARENCIA = 12;
const RESIDENTE_ANTECEDENCIA_1A_PARCELA = 60;
const RESIDENTE_ANTECEDENCIA_DEMAIS_PARCELAS = 45;
const RESIDENTE_DIAS_MIN_PARCELA = 10;
const RESIDENTE_DIAS_MAX_PARCELA = 30;
const RESIDENTE_PARCELAS_MAXIMAS = 3;

// --- Regras do Estagiário (Lei nº 11.788/2008 e normas do Executivo) ---
const ESTAGIARIO_ANTECEDENCIA_MINIMA = 30;
const ESTAGIARIO_DIAS_MIN_PARCELA = 5;
const ESTAGIARIO_DIAS_MAX_PARCELA = 30;
const ESTAGIARIO_DIAS_SALDO_POR_MES = 2.5;
const ESTAGIARIO_DIAS_POR_MES_CONTRATO = 30;

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

function calcularFimRecesso(dataInicioRecesso: string, quantidadeDias: number): Date {
  const fim = paraData(dataInicioRecesso);
  fim.setDate(fim.getDate() + (quantidadeDias - 1));
  return fim;
}

function sucesso(): ResultadoValidacaoRecesso {
  return { sucesso: true, erro_codigo: "", mensagem: "Solicitação de recesso válida." };
}

function falha(erro_codigo: string, mensagem: string): ResultadoValidacaoRecesso {
  return { sucesso: false, erro_codigo, mensagem };
}

function validarLimiteContrato(
  dataInicioRecesso: string,
  quantidadeDias: number,
  dataFimContrato: string,
): ResultadoValidacaoRecesso | null {
  const fimRecesso = calcularFimRecesso(dataInicioRecesso, quantidadeDias);
  if (fimRecesso.getTime() > paraData(dataFimContrato).getTime()) {
    return falha(
      CodigoErroRecesso.LIMITE_CONTRATO_EXCEDIDO,
      `O recesso terminaria em ${fimRecesso.toISOString().slice(0, 10)}, após o fim do contrato ` +
      `(${dataFimContrato}).`,
    );
  }
  return null;
}

function validarResidente(input: SolicitacaoRecessoInput): ResultadoValidacaoRecesso {
  const {
    data_inicio_contrato,
    data_fim_contrato,
    data_solicitacao,
    data_inicio_recesso,
    quantidade_dias_solicitados,
    numero_parcela,
    saldo_dias_disponivel,
  } = input;

  // 1. Carência do período aquisitivo: 12 meses corridos, sem proporcionalidade.
  const marcoCarencia = adicionarMeses(data_inicio_contrato, RESIDENTE_MESES_CARENCIA);
  if (paraData(data_inicio_recesso).getTime() < marcoCarencia.getTime()) {
    return falha(
      CodigoErroRecesso.CARENCIA_PERIODO_AQUISITIVO,
      `O residente só pode gozar recesso a partir de ${marcoCarencia.toISOString().slice(0, 10)} ` +
      `(12 meses após o início do contrato em ${data_inicio_contrato}). O direito não é proporcional.`,
    );
  }

  // 2. Antecedência: 60 dias para integral/1ª parcela, 45 dias para a 2ª ou 3ª.
  const antecedenciaMinima = numero_parcela === 1
    ? RESIDENTE_ANTECEDENCIA_1A_PARCELA
    : RESIDENTE_ANTECEDENCIA_DEMAIS_PARCELAS;
  const antecedenciaInformada = diasEntre(data_solicitacao, data_inicio_recesso);
  if (antecedenciaInformada < antecedenciaMinima) {
    return falha(
      CodigoErroRecesso.ANTECEDENCIA_INSUFICIENTE,
      `A solicitação precisa de no mínimo ${antecedenciaMinima} dias de antecedência ` +
      `(informados: ${antecedenciaInformada} dias).`,
    );
  }

  // 3. Tamanho da parcela: 10 a 30 dias.
  if (quantidade_dias_solicitados < RESIDENTE_DIAS_MIN_PARCELA) {
    return falha(
      CodigoErroRecesso.PARCELA_ABAIXO_DO_MINIMO,
      `A quantidade de dias (${quantidade_dias_solicitados}) é menor que o mínimo permitido ` +
      `por parcela (${RESIDENTE_DIAS_MIN_PARCELA} dias).`,
    );
  }
  if (quantidade_dias_solicitados > RESIDENTE_DIAS_MAX_PARCELA) {
    return falha(
      CodigoErroRecesso.PARCELA_ACIMA_DO_MAXIMO,
      `A quantidade de dias (${quantidade_dias_solicitados}) excede o máximo permitido ` +
      `por parcela (${RESIDENTE_DIAS_MAX_PARCELA} dias).`,
    );
  }

  // 4. Parcelamento máximo: até 3 parcelas.
  if (numero_parcela < 1) {
    return falha(CodigoErroRecesso.NUMERO_PARCELA_INVALIDO, "O número da parcela precisa ser 1, 2 ou 3.");
  }
  if (numero_parcela > RESIDENTE_PARCELAS_MAXIMAS) {
    return falha(
      CodigoErroRecesso.PARCELAMENTO_MAXIMO_EXCEDIDO,
      `O recesso do residente é parcelável em no máximo ${RESIDENTE_PARCELAS_MAXIMAS} etapas ` +
      `(parcela informada: ${numero_parcela}).`,
    );
  }

  // 5. Saldo disponível e limite do contrato.
  if (quantidade_dias_solicitados > saldo_dias_disponivel) {
    return falha(
      CodigoErroRecesso.SALDO_INSUFICIENTE,
      `A quantidade solicitada (${quantidade_dias_solicitados} dias) excede o saldo disponível ` +
      `(${saldo_dias_disponivel} dias).`,
    );
  }
  const erroContrato = validarLimiteContrato(data_inicio_recesso, quantidade_dias_solicitados, data_fim_contrato);
  if (erroContrato) return erroContrato;

  return sucesso();
}

function validarEstagiario(input: SolicitacaoRecessoInput): ResultadoValidacaoRecesso {
  const {
    data_inicio_contrato,
    data_fim_contrato,
    data_solicitacao,
    data_inicio_recesso,
    quantidade_dias_solicitados,
    saldo_dias_disponivel,
  } = input;

  // 1. Sem carência — saldo proporcional a 2,5 dias a cada 30 dias de contrato decorridos.
  const diasDecorridos = diasEntre(data_inicio_contrato, data_inicio_recesso);
  const mesesDecorridos = Math.floor(diasDecorridos / ESTAGIARIO_DIAS_POR_MES_CONTRATO);
  const saldoProporcional = mesesDecorridos * ESTAGIARIO_DIAS_SALDO_POR_MES;

  // 2. Antecedência mínima de 30 dias para qualquer parcela.
  const antecedenciaInformada = diasEntre(data_solicitacao, data_inicio_recesso);
  if (antecedenciaInformada < ESTAGIARIO_ANTECEDENCIA_MINIMA) {
    return falha(
      CodigoErroRecesso.ANTECEDENCIA_INSUFICIENTE,
      `A solicitação precisa de no mínimo ${ESTAGIARIO_ANTECEDENCIA_MINIMA} dias de antecedência ` +
      `(informados: ${antecedenciaInformada} dias).`,
    );
  }

  // 3. Tamanho da parcela: 5 a 30 dias.
  if (quantidade_dias_solicitados < ESTAGIARIO_DIAS_MIN_PARCELA) {
    return falha(
      CodigoErroRecesso.PARCELA_ABAIXO_DO_MINIMO,
      `A quantidade de dias (${quantidade_dias_solicitados}) é menor que o mínimo permitido ` +
      `por parcela (${ESTAGIARIO_DIAS_MIN_PARCELA} dias).`,
    );
  }
  if (quantidade_dias_solicitados > ESTAGIARIO_DIAS_MAX_PARCELA) {
    return falha(
      CodigoErroRecesso.PARCELA_ACIMA_DO_MAXIMO,
      `A quantidade de dias (${quantidade_dias_solicitados}) excede o máximo permitido ` +
      `por parcela (${ESTAGIARIO_DIAS_MAX_PARCELA} dias).`,
    );
  }

  // 4. Saldo proporcional: não pode exceder nem o saldo calculado pelo tempo decorrido,
  // nem o saldo_dias_disponivel registrado na base.
  const saldoEfetivo = Math.min(saldoProporcional, saldo_dias_disponivel);
  if (quantidade_dias_solicitados > saldoEfetivo) {
    return falha(
      CodigoErroRecesso.SALDO_INSUFICIENTE,
      `A quantidade solicitada (${quantidade_dias_solicitados} dias) excede o saldo disponível ` +
      `(${saldoEfetivo} dias, calculado a partir de ${mesesDecorridos} mês(es) de contrato e do saldo ` +
      `registrado de ${saldo_dias_disponivel} dias).`,
    );
  }

  // 5. Limite do contrato.
  const erroContrato = validarLimiteContrato(data_inicio_recesso, quantidade_dias_solicitados, data_fim_contrato);
  if (erroContrato) return erroContrato;

  return sucesso();
}

/**
 * Valida uma solicitação de recesso remunerado, aplicando as regras de negócio específicas
 * para RESIDENTE (Lei nº 15.400/2026) ou ESTAGIÁRIO (Lei nº 11.788/2008).
 */
export function validarSolicitacaoRecesso(input: SolicitacaoRecessoInput): ResultadoValidacaoRecesso {
  if (input.tipo_vinculo === "RESIDENTE") return validarResidente(input);
  if (input.tipo_vinculo === "ESTAGIARIO") return validarEstagiario(input);
  return falha(
    CodigoErroRecesso.VINCULO_INVALIDO,
    `Tipo de vínculo "${String(input.tipo_vinculo)}" não suportado. Use RESIDENTE ou ESTAGIARIO.`,
  );
}
