import { describe, expect, it } from "vitest";
import {
  CodigoErroAgendamento,
  validarFracionamento,
  validarAntecedencia,
  validarPeriodoAquisitivoCompletado,
  calcularAlertaConcessivo,
  validarSemSobreposicao,
  prazosAgendamento,
  validarPrazoRegistroFerias,
} from "./regrasAgendamento";

describe("RN017 — Prazos do agendamento pelo mês do usufruto", () => {
  it("registro até o dia 05 e validação até o dia 09 do mês anterior ao usufruto", () => {
    expect(prazosAgendamento("2026-12-01")).toEqual({ limiteRegistro: "2026-11-05", limiteValidacao: "2026-11-09" });
  });

  it("usufruto em janeiro: prazos caem em dezembro do ano anterior", () => {
    expect(prazosAgendamento("2027-01-15")).toEqual({ limiteRegistro: "2026-12-05", limiteValidacao: "2026-12-09" });
  });

  it("aceita registro no próprio dia 05", () => {
    expect(validarPrazoRegistroFerias("2026-11-05", "2026-12-01").sucesso).toBe(true);
  });

  it("bloqueia registro a partir do dia 06 do mês anterior", () => {
    const r = validarPrazoRegistroFerias("2026-11-06", "2026-12-20");
    expect(r.erro_codigo).toBe(CodigoErroAgendamento.PRAZO_REGISTRO_ENCERRADO);
    expect(r.mensagem).toContain("05/11/2026");
  });
});

describe("RN-AGD-01 — Fracionamento", () => {
  it("aceita etapa única de 30 dias", () => {
    expect(validarFracionamento([{ inicio: "2026-11-01", fim: "2026-11-30", dias: 30 }]).sucesso).toBe(true);
  });

  it("aceita 2 etapas de 15 dias com intervalo >= 10 dias", () => {
    const r = validarFracionamento([
      { inicio: "2026-11-01", fim: "2026-11-15", dias: 15 },
      { inicio: "2026-11-26", fim: "2026-12-10", dias: 15 },
    ]);
    expect(r.sucesso).toBe(true);
  });

  it("aceita 20+10 (combinação da RN) e também 10+10+10", () => {
    expect(
      validarFracionamento([
        { inicio: "2026-11-01", fim: "2026-11-20", dias: 20 },
        { inicio: "2026-12-01", fim: "2026-12-10", dias: 10 },
      ]).sucesso,
    ).toBe(true);
    expect(
      validarFracionamento([
        { inicio: "2026-11-01", fim: "2026-11-10", dias: 10 },
        { inicio: "2026-11-21", fim: "2026-11-30", dias: 10 },
        { inicio: "2026-12-11", fim: "2026-12-20", dias: 10 },
      ]).sucesso,
    ).toBe(true);
  });

  it("rejeita mais de 3 etapas", () => {
    const r = validarFracionamento([
      { inicio: "2026-01-01", fim: "2026-01-10", dias: 10 },
      { inicio: "2026-02-01", fim: "2026-02-10", dias: 10 },
      { inicio: "2026-03-01", fim: "2026-03-10", dias: 10 },
      { inicio: "2026-04-01", fim: "2026-04-05", dias: 5 },
    ]);
    expect(r.erro_codigo).toBe(CodigoErroAgendamento.FRACIONAMENTO_EXCEDE_ETAPAS);
  });

  it("rejeita etapa menor que 10 dias", () => {
    const r = validarFracionamento([{ inicio: "2026-11-01", fim: "2026-11-08", dias: 8 }]);
    expect(r.erro_codigo).toBe(CodigoErroAgendamento.PARCELA_ABAIXO_DO_MINIMO);
  });

  it("rejeita combinação não prevista (ex.: 20+15)", () => {
    const r = validarFracionamento([
      { inicio: "2026-11-01", fim: "2026-11-20", dias: 20 },
      { inicio: "2026-12-01", fim: "2026-12-15", dias: 15 },
    ]);
    expect(r.erro_codigo).toBe(CodigoErroAgendamento.COMBINACAO_NAO_PERMITIDA);
  });

  it("rejeita intervalo menor que 10 dias entre etapas", () => {
    const r = validarFracionamento([
      { inicio: "2026-11-01", fim: "2026-11-15", dias: 15 },
      { inicio: "2026-11-20", fim: "2026-12-04", dias: 15 }, // 5 dias de intervalo
    ]);
    expect(r.erro_codigo).toBe(CodigoErroAgendamento.INTERVALO_ENTRE_ETAPAS);
  });
});

describe("RN-AGD-02 — Antecedência mínima", () => {
  it("aceita 30 dias ou mais de antecedência", () => {
    expect(validarAntecedencia("2026-10-01", "2026-10-31").sucesso).toBe(true);
  });

  it("rejeita menos de 30 dias sem autorização da chefia", () => {
    const r = validarAntecedencia("2026-10-01", "2026-10-20");
    expect(r.erro_codigo).toBe(CodigoErroAgendamento.ANTECEDENCIA_INSUFICIENTE);
  });

  it("dispensa a antecedência com autorização expressa da chefia", () => {
    expect(validarAntecedencia("2026-10-01", "2026-10-05", true).sucesso).toBe(true);
  });
});

describe("RN-AGD-06 — Período aquisitivo completado", () => {
  it("permite agendar período já encerrado", () => {
    expect(
      validarPeriodoAquisitivoCompletado({ inicio: "2024-01-01", fim: "2024-12-31" }, "2026-10-26").sucesso,
    ).toBe(true);
  });

  it("bloqueia período ainda em curso (fim no futuro)", () => {
    const r = validarPeriodoAquisitivoCompletado({ inicio: "2026-01-01", fim: "2026-12-31" }, "2026-10-26");
    expect(r.erro_codigo).toBe(CodigoErroAgendamento.PERIODO_AQUISITIVO_EM_CURSO);
  });

  it("bloqueia quando o fim do período aquisitivo é indeterminado", () => {
    const r = validarPeriodoAquisitivoCompletado({ inicio: "2026-01-01", fim: "" }, "2026-10-26");
    expect(r.erro_codigo).toBe(CodigoErroAgendamento.PERIODO_AQUISITIVO_EM_CURSO);
  });
});

describe("RN-AGD-07 — Alerta de período concessivo", () => {
  it("calcula o fim do concessivo 12 meses após o fim do aquisitivo", () => {
    const alerta = calcularAlertaConcessivo("2025-12-31", "2026-01-01");
    expect(alerta?.fimConcessivo).toBe("2026-12-31");
  });

  it("alerta quando faltam 60 dias ou menos para o vencimento", () => {
    // fim concessivo 2026-12-31; hoje 60 dias antes
    const alerta = calcularAlertaConcessivo("2025-12-31", "2026-11-01");
    expect(alerta?.alertar).toBe(true);
    expect(alerta?.vencido).toBe(false);
  });

  it("não alerta quando o vencimento está distante", () => {
    const alerta = calcularAlertaConcessivo("2025-12-31", "2026-06-01");
    expect(alerta?.alertar).toBe(false);
  });

  it("marca como vencido quando o concessivo já passou", () => {
    const alerta = calcularAlertaConcessivo("2024-12-31", "2026-10-26");
    expect(alerta?.vencido).toBe(true);
    expect(alerta?.alertar).toBe(true);
  });

  it("respeita o prazo de alerta parametrizado", () => {
    const alerta = calcularAlertaConcessivo("2025-12-31", "2026-10-01", 120);
    expect(alerta?.alertar).toBe(true);
  });

  it("retorna null quando o período aquisitivo não tem fim definido", () => {
    expect(calcularAlertaConcessivo("", "2026-10-26")).toBeNull();
  });
});

describe("RN-AGD-05 — Sobreposição de agendamento", () => {
  it("permite período sem interseção com os existentes", () => {
    const r = validarSemSobreposicao(
      { inicio: "2026-12-01", fim: "2026-12-15" },
      [{ inicio: "2026-10-01", fim: "2026-10-15" }],
    );
    expect(r.sucesso).toBe(true);
  });

  it("bloqueia período que se sobrepõe a um existente", () => {
    const r = validarSemSobreposicao(
      { inicio: "2026-10-10", fim: "2026-10-20" },
      [{ inicio: "2026-10-01", fim: "2026-10-15" }],
    );
    expect(r.erro_codigo).toBe(CodigoErroAgendamento.AGENDAMENTO_SOBREPOSTO);
  });

  it("bloqueia sobreposição de um único dia nas bordas", () => {
    const r = validarSemSobreposicao(
      { inicio: "2026-10-15", fim: "2026-10-25" },
      [{ inicio: "2026-10-01", fim: "2026-10-15" }],
    );
    expect(r.erro_codigo).toBe(CodigoErroAgendamento.AGENDAMENTO_SOBREPOSTO);
  });
});
