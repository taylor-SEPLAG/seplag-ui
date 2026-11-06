import { describe, expect, it } from "vitest";
import {
  CodigoErroSuspensao,
  proximoDiaUtil,
  licencaSobrepoeFerias,
  calcularRetomadaArt16,
  validarSuspensaoArt17,
  alertaPrazoArt17,
} from "./regrasSuspensao";

describe("proximoDiaUtil", () => {
  it("pula o fim de semana: sexta -> segunda", () => {
    // 2026-10-30 é sexta; o próximo dia útil é segunda 2026-11-02
    expect(proximoDiaUtil("2026-10-30")).toBe("2026-11-02");
  });

  it("de um dia útil comum avança para o dia seguinte", () => {
    expect(proximoDiaUtil("2026-10-26")).toBe("2026-10-27"); // seg -> ter
  });

  it("pula feriados informados", () => {
    // sexta 2026-10-30, com segunda 2026-11-02 marcada como feriado -> cai em terça 11-03
    expect(proximoDiaUtil("2026-10-30", ["2026-11-02"])).toBe("2026-11-03");
  });
});

describe("RN-SUS-01 — gatilho de suspensão automática (Art. 16)", () => {
  it("detecta sobreposição da licença com as férias em curso", () => {
    expect(
      licencaSobrepoeFerias({
        feriasInicio: "2026-11-01",
        feriasFim: "2026-11-30",
        licencaInicio: "2026-11-10",
        licencaFim: "2027-03-10",
      }),
    ).toBe(true);
  });

  it("não dispara quando a licença não se sobrepõe às férias", () => {
    expect(
      licencaSobrepoeFerias({
        feriasInicio: "2026-11-01",
        feriasFim: "2026-11-30",
        licencaInicio: "2026-12-10",
        licencaFim: "2027-03-10",
      }),
    ).toBe(false);
  });
});

describe("RN-SUS-02 / RN-SUS-03 — retomada automática (Art. 16)", () => {
  it("retoma no primeiro dia útil após a licença e calcula o saldo remanescente", () => {
    // 30 dias agendados, 9 usufruídos antes da suspensão -> 21 remanescentes.
    // Licença termina sexta 2026-10-30 -> retomada segunda 2026-11-02.
    const r = calcularRetomadaArt16(30, 9, "2026-10-30");
    expect(r.saldoRemanescente).toBe(21);
    expect(r.dataRetomada).toBe("2026-11-02");
  });

  it("nunca retorna saldo negativo", () => {
    expect(calcularRetomadaArt16(15, 20, "2026-10-26").saldoRemanescente).toBe(0);
  });
});

describe("RN-SUS-05 / RN-SUS-06 / RN-SUS-07 — suspensão Art. 17", () => {
  const base = { causa: "Força-tarefa emergencial de fiscalização", prazoEstimadoDias: 30, autorizadoPeloDirigente: true };

  it("aceita solicitação com causa, prazo <= 60 e autorização do dirigente", () => {
    expect(validarSuspensaoArt17(base).sucesso).toBe(true);
  });

  it("rejeita quando falta causa detalhada", () => {
    expect(validarSuspensaoArt17({ ...base, causa: "   " }).erro_codigo).toBe(
      CodigoErroSuspensao.CAUSA_OBRIGATORIA,
    );
  });

  it("rejeita prazo acima de 60 dias", () => {
    expect(validarSuspensaoArt17({ ...base, prazoEstimadoDias: 61 }).erro_codigo).toBe(
      CodigoErroSuspensao.PRAZO_ACIMA_DO_MAXIMO,
    );
  });

  it("rejeita quando não há autorização do dirigente máximo", () => {
    expect(validarSuspensaoArt17({ ...base, autorizadoPeloDirigente: false }).erro_codigo).toBe(
      CodigoErroSuspensao.AUTORIZACAO_PENDENTE,
    );
  });
});

describe("RN-SUS-07 — alerta de prazo (Art. 17)", () => {
  it("alerta quando faltam 5 dias ou menos para o vencimento", () => {
    // início 2026-10-01, prazo 30 -> fim 2026-10-31; hoje 2026-10-27 -> faltam 4 dias
    const a = alertaPrazoArt17("2026-10-01", 30, "2026-10-27");
    expect(a.fimPrazo).toBe("2026-10-31");
    expect(a.alertar).toBe(true);
    expect(a.vencido).toBe(false);
  });

  it("não alerta quando ainda há folga no prazo", () => {
    const a = alertaPrazoArt17("2026-10-01", 60, "2026-10-10");
    expect(a.alertar).toBe(false);
  });

  it("marca vencido quando o prazo passou", () => {
    const a = alertaPrazoArt17("2026-08-01", 30, "2026-10-26");
    expect(a.vencido).toBe(true);
    expect(a.alertar).toBe(true);
  });
});
