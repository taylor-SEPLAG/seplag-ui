// Regras de pagamento e folha do módulo de férias — RN-FOL-01 a RN-FOL-05, a tabela de decisão
// de cenários de pagamento e os impactos financeiros de suspensão/cancelamento
// (RN-CAN-02/03, RN-SUS-04/09/10). Funções puras, sem React/DOM.
//
// Este é um motor financeiro de DEMONSTRAÇÃO: em produção o cálculo/compensação ocorre na Folha
// (SIGEP). As funções aqui modelam as decisões descritas nas RNs para que a UI do protótipo
// possa exibir o impacto esperado sem depender de integração.

// --- Parâmetros ---
const JANELA_ADIANTAMENTO_DIAS = 60; // RN-FOL-02
const TERCO_CONSTITUCIONAL = 1 / 3; // adiantamento = remuneração + 1/3
const RETROACAO_ANOS_PADRAO = 5; // RN-FOL-04

function paraData(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function diasEntre(inicioIso: string, fimIso: string): number {
  return Math.round((paraData(fimIso).getTime() - paraData(inicioIso).getTime()) / 86_400_000);
}

/** Competência (AAAA-MM) de uma data ISO. RN-FOL-01: fato gerador = mês do gozo. */
export function competenciaDoGozo(dataInicioGozo: string): string {
  return dataInicioGozo.slice(0, 7);
}

/**
 * RN-FOL-02 — Valor do adiantamento de férias: remuneração proporcional aos dias de gozo + 1/3
 * constitucional, calculado sobre o salário vigente. Base mensal de 30 dias.
 */
export function calcularAdiantamento(remuneracaoMensal: number, diasGozo: number): number {
  const base = (remuneracaoMensal / 30) * diasGozo;
  return arredondar(base * (1 + TERCO_CONSTITUCIONAL));
}

function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/**
 * RN-FOL-02 — O gozo entra na janela de adiantamento quando o início está dentro dos próximos
 * `JANELA_ADIANTAMENTO_DIAS` dias a partir da data de processamento (inclusive), e ainda não
 * começou.
 */
export function dentroDaJanelaAdiantamento(
  dataProcessamento: string,
  dataInicioGozo: string,
  janelaDias: number = JANELA_ADIANTAMENTO_DIAS,
): boolean {
  const antecedencia = diasEntre(dataProcessamento, dataInicioGozo);
  return antecedencia >= 0 && antecedencia <= janelaDias;
}

/**
 * RN-FOL-03 — Reajuste salarial (ex.: RGA) após o adiantamento. Na competência do gozo,
 * recalcula o valor devido com a nova remuneração e devolve a diferença a acertar:
 *   > 0  → complemento a pagar
 *   < 0  → desconto
 *   = 0  → nenhuma ação
 */
export function diferencaPorReajuste(
  remuneracaoOriginal: number,
  remuneracaoNova: number,
  diasGozo: number,
): number {
  const pago = calcularAdiantamento(remuneracaoOriginal, diasGozo);
  const devido = calcularAdiantamento(remuneracaoNova, diasGozo);
  return arredondar(devido - pago);
}

export type AcaoConfronto = "NENHUMA" | "COMPLEMENTO" | "DESCONTO";

/**
 * RN-FOL-05 — Confronto direito × usufruído × pago a cada folha:
 *   pago < devido → COMPLEMENTO; pago > devido → DESCONTO; iguais → NENHUMA.
 * Aqui `devido` representa o valor financeiro correspondente ao efetivamente usufruído.
 */
export function confrontoFolha(valorDevido: number, valorPago: number): {
  acao: AcaoConfronto;
  diferenca: number;
} {
  const diferenca = arredondar(valorDevido - valorPago);
  if (diferenca > 0) return { acao: "COMPLEMENTO", diferenca };
  if (diferenca < 0) return { acao: "DESCONTO", diferenca };
  return { acao: "NENHUMA", diferenca: 0 };
}

/** RN-FOL-04 — Marco de retroação: data limite para trás a partir de hoje (padrão 5 anos). */
export function limiteRetroacao(hoje: string, anos: number = RETROACAO_ANOS_PADRAO): string {
  const data = paraData(hoje);
  data.setFullYear(data.getFullYear() - anos);
  return data.toISOString().slice(0, 10);
}

// --- Tabela de decisão de cenários de pagamento (página 6 do documento) ---

export type EventoFinanceiro =
  | "AGENDAMENTO"
  | "GOZO_ENTRA_JANELA"
  | "CANCELAMENTO_FORA_JANELA"
  | "CANCELAMENTO_APOS_PAGAMENTO"
  | "SUSPENSAO_ART16"
  | "SUSPENSAO_ART17_ANTES_PAGAMENTO"
  | "SUSPENSAO_ART17_APOS_PAGAMENTO"
  | "REAJUSTE_APOS_ADIANTAMENTO"
  | "RETOMADA_ART16"
  | "REAGENDAMENTO_ART17";

export type TipoLancamentoFolha =
  | "NENHUM"
  | "ADIANTAMENTO"
  | "DEBITO_PROXIMA_FOLHA"
  | "BLOQUEIO_ADIANTAMENTO"
  | "DEBITO_DIFERIDO"
  | "CONFRONTO_COMPETENCIA"
  | "RECALCULO_DIFERENCA"
  | "COMPENSACAO_DEBITO";

export interface DecisaoFinanceira {
  /** O adiantamento já havia sido processado quando o evento ocorreu? */
  adiantamentoJaPago: boolean;
  lancamento: TipoLancamentoFolha;
  descricao: string;
}

/**
 * Tabela de decisão da RN (cenários de pagamento). Mapeia cada evento para o impacto esperado
 * em folha, replicando a tabela da página 6 do documento consolidado.
 */
export function decisaoFinanceira(evento: EventoFinanceiro): DecisaoFinanceira {
  switch (evento) {
    case "AGENDAMENTO":
      return { adiantamentoJaPago: false, lancamento: "NENHUM", descricao: "Nenhuma ação financeira imediata." };
    case "GOZO_ENTRA_JANELA":
      return { adiantamentoJaPago: false, lancamento: "ADIANTAMENTO", descricao: "Processa adiantamento na folha corrente." };
    case "CANCELAMENTO_FORA_JANELA":
      return { adiantamentoJaPago: false, lancamento: "NENHUM", descricao: "Nenhuma ação financeira." };
    case "CANCELAMENTO_APOS_PAGAMENTO":
      return { adiantamentoJaPago: true, lancamento: "DEBITO_PROXIMA_FOLHA", descricao: "Gera débito integral; desconta na próxima folha." };
    case "SUSPENSAO_ART16":
      return { adiantamentoJaPago: true, lancamento: "CONFRONTO_COMPETENCIA", descricao: "Confronto automático por competência (motorFolhaSuspensao): estorna os dias que saem de competência já paga e adianta os que entram em nova competência; se o usufruto permanece no mês, apenas recalcula." };
    case "SUSPENSAO_ART17_ANTES_PAGAMENTO":
      return { adiantamentoJaPago: false, lancamento: "BLOQUEIO_ADIANTAMENTO", descricao: "Bloqueia adiantamento; libera no novo agendamento." };
    case "SUSPENSAO_ART17_APOS_PAGAMENTO":
      return { adiantamentoJaPago: true, lancamento: "CONFRONTO_COMPETENCIA", descricao: "Confronto automático por competência (motorFolhaSuspensao): devolve o adiantamento dos dias não usufruídos na competência original e paga novo adiantamento na folha anterior ao novo usufruto. Mesmo mês: apenas recalcula." };
    case "REAJUSTE_APOS_ADIANTAMENTO":
      return { adiantamentoJaPago: true, lancamento: "RECALCULO_DIFERENCA", descricao: "Recalcula na competência do gozo; paga diferença ou desconta." };
    case "RETOMADA_ART16":
      return { adiantamentoJaPago: true, lancamento: "NENHUM", descricao: "Nenhuma ação financeira adicional." };
    case "REAGENDAMENTO_ART17":
      return { adiantamentoJaPago: false, lancamento: "COMPENSACAO_DEBITO", descricao: "Compensa débito registrado na folha desta competência." };
    default: {
      const _exaustivo: never = evento;
      return _exaustivo;
    }
  }
}

/**
 * RN-CAN-03 — Débito integral do adiantamento quando o cancelamento ocorre após o pagamento
 * (antes do gozo). Retorna o valor a descontar na próxima folha.
 */
export function debitoCancelamentoAposPagamento(remuneracaoMensal: number, diasGozo: number): number {
  return calcularAdiantamento(remuneracaoMensal, diasGozo);
}

/**
 * Valor proporcional (remuneração + 1/3) aos dias não usufruídos na suspensão após o pagamento.
 * O tratamento por competência (estorno × novo adiantamento × recálculo no mesmo mês) está em
 * `calcularImpactoSuspensao` (motorFolhaSuspensao.ts); esta função fornece apenas o valor base.
 */
export function debitoSuspensaoArt17(remuneracaoMensal: number, diasNaoUsufruidos: number): number {
  return calcularAdiantamento(remuneracaoMensal, diasNaoUsufruidos);
}
