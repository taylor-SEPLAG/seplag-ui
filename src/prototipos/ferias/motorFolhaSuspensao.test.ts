import { describe, expect, it } from "vitest";
import { calcularImpactoSuspensao, competenciaAnterior, componentesAdiantamento } from "./motorFolhaSuspensao";

describe("motorFolhaSuspensao — calendário", () => {
  it("Art. 17 (exemplo da ata): 30 dias, 2 usufruídos, suspensão 03/12 a 21/12 → retorno 22/12 e término 18/01", () => {
    const r = calcularImpactoSuspensao({
      parcelas: [{ inicio: "2026-12-01", fim: "2026-12-30" }],
      fundamento: "ART_17",
      suspensaoInicio: "2026-12-03",
      suspensaoFim: "2026-12-21",
      competenciaFolhaCorrente: "2026-12",
    });
    expect(r.diasUsufruidosAntes).toBe(2);
    expect(r.diasSuspensos).toBe(19);
    expect(r.diasRestantes).toBe(28);
    expect(r.retorno).toBe("2026-12-22");
    expect(r.novaDataTermino).toBe("2027-01-18");
    expect(r.novasParcelas).toEqual([
      { inicio: "2026-12-01", fim: "2026-12-02" },
      { inicio: "2026-12-22", fim: "2027-01-18" },
    ]);
  });

  it("Art. 16: retorno no 1º dia útil após a licença", () => {
    const r = calcularImpactoSuspensao({
      parcelas: [{ inicio: "2026-10-26", fim: "2026-11-24" }],
      fundamento: "ART_16",
      suspensaoInicio: "2026-11-02",
      licencaFim: "2026-11-06", // sexta
      competenciaFolhaCorrente: "2026-11",
    });
    expect(r.retorno).toBe("2026-11-09"); // segunda
    expect(r.diasUsufruidosAntes).toBe(7);
    expect(r.diasRestantes).toBe(23);
  });

  it("suspensão após o fim das férias não altera nada", () => {
    const r = calcularImpactoSuspensao({
      parcelas: [{ inicio: "2026-12-01", fim: "2026-12-10" }],
      fundamento: "ART_17",
      suspensaoInicio: "2026-12-20",
      suspensaoFim: "2026-12-25",
      competenciaFolhaCorrente: "2026-12",
    });
    expect(r.diasRestantes).toBe(0);
    expect(r.novaDataTermino).toBe("2026-12-10");
  });
});

describe("motorFolhaSuspensao — folha por competência", () => {
  it("restante cai em janeiro: estorna dezembro e adianta janeiro na folha de dezembro", () => {
    // 15 dias (07/12 a 21/12), adiantamento pago em novembro; usufruiu 2 dias, suspensão de 07/12... retorno 22/12.
    const r = calcularImpactoSuspensao({
      parcelas: [{ inicio: "2026-12-07", fim: "2026-12-21" }],
      fundamento: "ART_17",
      suspensaoInicio: "2026-12-09",
      suspensaoFim: "2026-12-21",
      competenciaFolhaCorrente: "2026-12",
    });
    // usufruídos: 07 e 08 (2). Restantes 13 → de 22/12 a 03/01: 10 em dezembro, 3 em janeiro.
    expect(r.competencias).toEqual([
      { competencia: "2026-12", diasOriginais: 15, diasNovos: 12, diferencaDias: -3, adiantamentoPagoOriginal: true },
      { competencia: "2027-01", diasOriginais: 0, diasNovos: 3, diferencaDias: 3, adiantamentoPagoOriginal: false },
    ]);
    const estorno = r.eventos.find((e) => e.tipo === "ESTORNO_ADIANTAMENTO");
    expect(estorno).toMatchObject({ competenciaUsufruto: "2026-12", competenciaFolha: "2026-12", dias: 3 });
    const novo = r.eventos.find((e) => e.tipo === "NOVO_ADIANTAMENTO");
    expect(novo).toMatchObject({ competenciaUsufruto: "2027-01", competenciaFolha: "2026-12", dias: 3 });
    expect(r.totalDiasEstornados).toBe(3);
    expect(r.totalDiasNovoAdiantamento).toBe(3);
  });

  it("mesmo mês e mesma quantidade de dias: recálculo interno, sem devolução", () => {
    const r = calcularImpactoSuspensao({
      parcelas: [{ inicio: "2026-12-01", fim: "2026-12-10" }],
      fundamento: "ART_17",
      suspensaoInicio: "2026-12-04",
      suspensaoFim: "2026-12-08",
      competenciaFolhaCorrente: "2026-12",
    });
    // 3 usufruídos + 7 restantes a partir de 09/12 → termina 15/12; tudo em dezembro.
    expect(r.eventos).toHaveLength(1);
    expect(r.eventos[0].tipo).toBe("RECALCULO_MESMA_COMPETENCIA");
    expect(r.totalDiasEstornados).toBe(0);
    expect(r.totalDiasNovoAdiantamento).toBe(0);
  });

  it("adiantamento ainda não pago: apenas recalcula a base, sem estorno", () => {
    const r = calcularImpactoSuspensao({
      parcelas: [{ inicio: "2026-12-07", fim: "2026-12-21" }],
      fundamento: "ART_17",
      suspensaoInicio: "2026-12-09",
      suspensaoFim: "2026-12-21",
      competenciaFolhaCorrente: "2026-11", // folha de novembro ainda aberta
    });
    expect(r.eventos.some((e) => e.tipo === "ESTORNO_ADIANTAMENTO")).toBe(false);
    expect(r.eventos.find((e) => e.competenciaUsufruto === "2026-12")?.tipo).toBe("RECALCULO_ADIANTAMENTO_PENDENTE");
  });

  it("calcula valores: remuneração proporcional + 1/3 sobre os dias do evento", () => {
    const r = calcularImpactoSuspensao({
      parcelas: [{ inicio: "2026-12-07", fim: "2026-12-21" }],
      fundamento: "ART_17",
      suspensaoInicio: "2026-12-09",
      suspensaoFim: "2026-12-21",
      competenciaFolhaCorrente: "2026-12",
      remuneracaoMensal: 3000,
    });
    // 3 dias: 3000/30*3 = 300; terço = 100; total 400.
    expect(r.eventos.find((e) => e.tipo === "ESTORNO_ADIANTAMENTO")).toMatchObject({ valorRemuneracao: -300, valorTerco: -100, valor: -400 });
    expect(r.eventos.find((e) => e.tipo === "NOVO_ADIANTAMENTO")).toMatchObject({ valor: 400 });
    expect(r.saldoLiquido).toBe(0);
  });
});

describe("motorFolhaSuspensao — utilitários", () => {
  it("competência anterior atravessa o ano", () => {
    expect(competenciaAnterior("2027-01")).toBe("2026-12");
    expect(competenciaAnterior("2026-12")).toBe("2026-11");
  });

  it("componentes: remuneração + 1/3", () => {
    expect(componentesAdiantamento(3000, 10)).toEqual({ valorRemuneracao: 1000, valorTerco: 333.33, valor: 1333.33 });
  });
});
