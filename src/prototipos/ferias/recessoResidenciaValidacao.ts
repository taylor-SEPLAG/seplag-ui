export type NumeroParcelaRecesso = "INTEGRAL" | 1 | 2 | 3;

export interface ValidarRecessoResidenciaInput {
  dataInicioResidencia: string;
  dataFimResidencia: string;
  dataSolicitacao: string;
  dataInicioRecesso: string;
  quantidadeDias: number;
  numeroParcela: NumeroParcelaRecesso;
  saldoDiasDisponivel: number;
}

export interface ResultadoValidacaoRecesso {
  sucesso: boolean;
  mensagem: string;
}

const DIAS_MINIMOS_PARCELA = 10;
const DIAS_MAXIMOS_PARCELA = 30;
const MESES_CARENCIA = 12;
const ANTECEDENCIA_INTEGRAL_OU_1A_PARCELA = 60;
const ANTECEDENCIA_2A_OU_3A_PARCELA = 45;

function paraData(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function diasEntre(inicioIso: string, fimIso: string): number {
  const inicio = paraData(inicioIso);
  const fim = paraData(fimIso);
  return Math.round((fim.getTime() - inicio.getTime()) / 86_400_000);
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

function ok(): ResultadoValidacaoRecesso {
  return { sucesso: true, mensagem: "Solicitação de recesso válida." };
}

function erro(mensagem: string): ResultadoValidacaoRecesso {
  return { sucesso: false, mensagem };
}

/**
 * Valida uma solicitação de recesso de médico/profissional residente do Poder Executivo
 * contra as regras de período aquisitivo, limite contratual, tamanho de parcela, saldo
 * disponível e antecedência mínima da solicitação.
 */
export function validarRecessoResidencia(input: ValidarRecessoResidenciaInput): ResultadoValidacaoRecesso {
  const {
    dataInicioResidencia,
    dataFimResidencia,
    dataSolicitacao,
    dataInicioRecesso,
    quantidadeDias,
    numeroParcela,
    saldoDiasDisponivel,
  } = input;

  // 1. Período aquisitivo mínimo: recesso só pode iniciar 12 meses (ou mais) após o início da residência.
  const marcoCarencia = adicionarMeses(dataInicioResidencia, MESES_CARENCIA);
  if (paraData(dataInicioRecesso).getTime() < marcoCarencia.getTime()) {
    return erro(
      `O recesso só pode ser iniciado a partir de ${marcoCarencia.toISOString().slice(0, 10)} ` +
      `(12 meses após o início da residência em ${dataInicioResidencia}).`,
    );
  }

  // 2. Limite contratual: o recesso precisa terminar antes do fim do contrato de residência.
  const fimRecesso = calcularFimRecesso(dataInicioRecesso, quantidadeDias);
  if (fimRecesso.getTime() > paraData(dataFimResidencia).getTime()) {
    return erro(
      `O recesso terminaria em ${fimRecesso.toISOString().slice(0, 10)}, após o fim do contrato ` +
      `de residência (${dataFimResidencia}).`,
    );
  }

  // 3. Tamanho da parcela: entre 10 e 30 dias.
  if (quantidadeDias < DIAS_MINIMOS_PARCELA || quantidadeDias > DIAS_MAXIMOS_PARCELA) {
    return erro(
      `A quantidade de dias (${quantidadeDias}) precisa estar entre ${DIAS_MINIMOS_PARCELA} ` +
      `e ${DIAS_MAXIMOS_PARCELA} dias.`,
    );
  }

  // 4. Saldo de dias: não pode exceder o saldo disponível.
  if (quantidadeDias > saldoDiasDisponivel) {
    return erro(
      `A quantidade solicitada (${quantidadeDias} dias) excede o saldo disponível (${saldoDiasDisponivel} dias).`,
    );
  }

  // 5. Antecedência da solicitação: 60 dias para integral/1ª parcela, 45 dias para 2ª/3ª parcela.
  const antecedenciaMinima = numeroParcela === "INTEGRAL" || numeroParcela === 1
    ? ANTECEDENCIA_INTEGRAL_OU_1A_PARCELA
    : ANTECEDENCIA_2A_OU_3A_PARCELA;
  const antecedenciaInformada = diasEntre(dataSolicitacao, dataInicioRecesso);
  if (antecedenciaInformada < antecedenciaMinima) {
    const rotuloParcela = numeroParcela === "INTEGRAL" ? "o período integral" : `a ${numeroParcela}ª parcela`;
    return erro(
      `Para ${rotuloParcela}, a solicitação precisa ter no mínimo ${antecedenciaMinima} dias de ` +
      `antecedência (informados: ${antecedenciaInformada} dias).`,
    );
  }

  return ok();
}
