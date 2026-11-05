import { describe, expect, it } from "vitest";
import {
  competenciaDoGozo,
  calcularAdiantamento,
  dentroDaJanelaAdiantamento,
  diferencaPorReajuste,
  confrontoFolha,
  limiteRetroacao,
  decisaoFinanceira,
  debitoCancelamentoAposPagamento,
  debitoSuspensaoArt17,
} from "./regrasFolha";

describe("RN-FOL-01 — competência do gozo", () => {
  it("usa o mês do início do gozo como fato gerador", () => {
    expect(competenciaDoGozo("2026-11-09")).toBe("2026-11");
  });
});

describe("RN-FOL-02 — adiantamento e janela de 60 dias", () => {
  it("calcula remuneração proporcional + 1/3 constitucional (30 dias = salário + 1/3)", () => {
    expect(calcularAdiantamento(3000, 30)).toBe(4000);
  });

  it("calcula proporcional para parcela de 15 dias", () => {
    // (3000/30)*15 = 1500; +1/3 = 2000
    expect(calcularAdiantamento(3000, 15)).toBe(2000);
  });

  it("inclui gozo que começa dentro de 60 dias", () => {
    expect(dentroDaJanelaAdiantamento("2026-10-01", "2026-11-15")).toBe(true);
  });

  it("exclui gozo que começa além de 60 dias", () => {
    expect(dentroDaJanelaAdiantamento("2026-10-01", "2027-01-15")).toBe(false);
  });

  it("exclui gozo que já começou (antecedência negativa)", () => {
    expect(dentroDaJanelaAdiantamento("2026-10-01", "2026-09-20")).toBe(false);
  });
});

describe("RN-FOL-03 — reajuste salarial após o adiantamento", () => {
  it("devolve diferença positiva a complementar quando o salário sobe", () => {
    // 30 dias: original 4000, novo 4400 -> +400
    expect(diferencaPorReajuste(3000, 3300, 30)).toBe(400);
  });

  it("devolve diferença negativa a descontar quando o salário cai", () => {
    expect(diferencaPorReajuste(3300, 3000, 30)).toBe(-400);
  });

  it("zero quando não há reajuste", () => {
    expect(diferencaPorReajuste(3000, 3000, 30)).toBe(0);
  });
});

describe("RN-FOL-05 — confronto direito × usufruído × pago", () => {
  it("nenhuma ação quando pago = devido", () => {
    expect(confrontoFolha(4000, 4000).acao).toBe("NENHUMA");
  });

  it("complemento quando pago < devido", () => {
    expect(confrontoFolha(4000, 3500)).toEqual({ acao: "COMPLEMENTO", diferenca: 500 });
  });

  it("desconto quando pago > devido", () => {
    expect(confrontoFolha(3500, 4000)).toEqual({ acao: "DESCONTO", diferenca: -500 });
  });
});

describe("RN-FOL-04 — retroação", () => {
  it("retrocede 5 anos por padrão", () => {
    expect(limiteRetroacao("2026-10-26")).toBe("2021-10-26");
  });

  it("aceita janela parametrizada", () => {
    expect(limiteRetroacao("2026-10-26", 3)).toBe("2023-10-26");
  });
});

describe("Tabela de decisão — cenários de pagamento (página 6)", () => {
  it("agendamento: nenhuma ação, sem adiantamento pago", () => {
    const d = decisaoFinanceira("AGENDAMENTO");
    expect(d.adiantamentoJaPago).toBe(false);
    expect(d.lancamento).toBe("NENHUM");
  });

  it("gozo entra na janela: processa adiantamento", () => {
    expect(decisaoFinanceira("GOZO_ENTRA_JANELA").lancamento).toBe("ADIANTAMENTO");
  });

  it("cancelamento fora da janela: nenhuma ação", () => {
    expect(decisaoFinanceira("CANCELAMENTO_FORA_JANELA").lancamento).toBe("NENHUM");
  });

  it("cancelamento após pagamento: débito na próxima folha", () => {
    const d = decisaoFinanceira("CANCELAMENTO_APOS_PAGAMENTO");
    expect(d.adiantamentoJaPago).toBe(true);
    expect(d.lancamento).toBe("DEBITO_PROXIMA_FOLHA");
  });

  it("suspensão Art. 16: confronto por competência (motorFolhaSuspensao)", () => {
    const d = decisaoFinanceira("SUSPENSAO_ART16");
    expect(d.adiantamentoJaPago).toBe(true);
    expect(d.lancamento).toBe("CONFRONTO_COMPETENCIA");
  });

  it("suspensão Art. 17 antes do pagamento: bloqueia adiantamento", () => {
    const d = decisaoFinanceira("SUSPENSAO_ART17_ANTES_PAGAMENTO");
    expect(d.adiantamentoJaPago).toBe(false);
    expect(d.lancamento).toBe("BLOQUEIO_ADIANTAMENTO");
  });

  it("suspensão Art. 17 após o pagamento: confronto por competência", () => {
    expect(decisaoFinanceira("SUSPENSAO_ART17_APOS_PAGAMENTO").lancamento).toBe("CONFRONTO_COMPETENCIA");
  });

  it("reajuste após adiantamento: recálculo de diferença", () => {
    expect(decisaoFinanceira("REAJUSTE_APOS_ADIANTAMENTO").lancamento).toBe("RECALCULO_DIFERENCA");
  });

  it("retomada Art. 16: nenhuma ação adicional", () => {
    expect(decisaoFinanceira("RETOMADA_ART16").lancamento).toBe("NENHUM");
  });

  it("reagendamento Art. 17: compensa débito pendente nesta competência", () => {
    const d = decisaoFinanceira("REAGENDAMENTO_ART17");
    expect(d.adiantamentoJaPago).toBe(false);
    expect(d.lancamento).toBe("COMPENSACAO_DEBITO");
  });
});

describe("Impactos financeiros de cancelamento e suspensão", () => {
  it("RN-CAN-03: débito integral do adiantamento no cancelamento após pagamento", () => {
    expect(debitoCancelamentoAposPagamento(3000, 30)).toBe(4000);
  });

  it("RN-SUS-10: débito proporcional aos dias não usufruídos (Art. 17 após pagamento)", () => {
    // 10 dias não usufruídos de salário 3000 -> (3000/30*10)*4/3 = 1333.33
    expect(debitoSuspensaoArt17(3000, 10)).toBe(1333.33);
  });
});
