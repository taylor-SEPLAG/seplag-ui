import { describe, expect, it } from "vitest";
import { validarRecessoResidencia, type ValidarRecessoResidenciaInput } from "./recessoResidenciaValidacao";

function subtrairDias(iso: string, dias: number): string {
  const data = new Date(`${iso}T00:00:00`);
  data.setDate(data.getDate() - dias);
  return data.toISOString().slice(0, 10);
}

function adicionarDias(iso: string, dias: number): string {
  const data = new Date(`${iso}T00:00:00`);
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
}

/** Entrada base válida: residência de 2 anos, recesso iniciando bem depois da carência
 * de 12 meses e bem antes do fim do contrato, com saldo e antecedência confortáveis. */
function entradaBase(overrides: Partial<ValidarRecessoResidenciaInput> = {}): ValidarRecessoResidenciaInput {
  const dataInicioRecesso = "2026-06-01";
  return {
    dataInicioResidencia: "2025-01-01",
    dataFimResidencia: "2027-01-01",
    dataInicioRecesso,
    dataSolicitacao: subtrairDias(dataInicioRecesso, 60),
    quantidadeDias: 10,
    numeroParcela: 1,
    saldoDiasDisponivel: 30,
    ...overrides,
  };
}

describe("validarRecessoResidencia", () => {
  it("retorna sucesso para um bloco de 10 dias solicitado com 60 dias de antecedência (1ª parcela)", () => {
    const resultado = validarRecessoResidencia(entradaBase());
    expect(resultado.sucesso).toBe(true);
  });

  it("falha quando a antecedência é menor que 60 dias para a 1ª parcela/integral", () => {
    const dataInicioRecesso = "2026-06-01";
    const resultado = validarRecessoResidencia(
      entradaBase({
        dataInicioRecesso,
        dataSolicitacao: subtrairDias(dataInicioRecesso, 59),
        numeroParcela: "INTEGRAL",
      }),
    );
    expect(resultado.sucesso).toBe(false);
    expect(resultado.mensagem).toMatch(/antecedência/i);
  });

  it("falha quando a antecedência é menor que 45 dias para a 2ª/3ª parcela", () => {
    const dataInicioRecesso = "2026-06-01";
    const resultado = validarRecessoResidencia(
      entradaBase({
        dataInicioRecesso,
        dataSolicitacao: subtrairDias(dataInicioRecesso, 44),
        numeroParcela: 3,
      }),
    );
    expect(resultado.sucesso).toBe(false);
    expect(resultado.mensagem).toMatch(/antecedência/i);
  });

  it("aceita exatamente 45 dias de antecedência para a 2ª parcela", () => {
    const dataInicioRecesso = "2026-06-01";
    const resultado = validarRecessoResidencia(
      entradaBase({
        dataInicioRecesso,
        dataSolicitacao: subtrairDias(dataInicioRecesso, 45),
        numeroParcela: 2,
      }),
    );
    expect(resultado.sucesso).toBe(true);
  });

  it("falha quando a quantidade de dias excede o saldo disponível", () => {
    const resultado = validarRecessoResidencia(
      entradaBase({ quantidadeDias: 15, saldoDiasDisponivel: 10 }),
    );
    expect(resultado.sucesso).toBe(false);
    expect(resultado.mensagem).toMatch(/saldo/i);
  });

  it("falha quando o recesso começa antes de completar 12 meses de residência", () => {
    const resultado = validarRecessoResidencia(
      entradaBase({
        dataInicioResidencia: "2025-06-01",
        dataInicioRecesso: "2026-05-01", // só 11 meses depois do início
        dataSolicitacao: subtrairDias("2026-05-01", 60),
      }),
    );
    expect(resultado.sucesso).toBe(false);
    expect(resultado.mensagem).toMatch(/12 meses|período aquisitivo|recesso só pode/i);
  });

  it("falha quando o recesso terminaria depois do fim do contrato de residência", () => {
    const dataFimResidencia = "2026-06-15";
    const dataInicioRecesso = "2026-06-10"; // +10 dias ultrapassa 2026-06-15
    const resultado = validarRecessoResidencia(
      entradaBase({
        dataFimResidencia,
        dataInicioRecesso,
        dataSolicitacao: subtrairDias(dataInicioRecesso, 60),
        quantidadeDias: 10,
      }),
    );
    expect(resultado.sucesso).toBe(false);
    expect(resultado.mensagem).toMatch(/contrato/i);
  });

  it("falha quando a quantidade de dias é menor que 10", () => {
    const resultado = validarRecessoResidencia(entradaBase({ quantidadeDias: 5, saldoDiasDisponivel: 30 }));
    expect(resultado.sucesso).toBe(false);
    expect(resultado.mensagem).toMatch(/10/);
  });

  it("falha quando a quantidade de dias é maior que 30", () => {
    const resultado = validarRecessoResidencia(entradaBase({ quantidadeDias: 35, saldoDiasDisponivel: 35 }));
    expect(resultado.sucesso).toBe(false);
    expect(resultado.mensagem).toMatch(/30/);
  });

  it("aceita o recesso terminando exatamente no último dia do contrato", () => {
    const dataFimResidencia = "2026-06-19";
    const dataInicioRecesso = "2026-06-10"; // +9 dias = 2026-06-19, não ultrapassa
    const resultado = validarRecessoResidencia(
      entradaBase({
        dataFimResidencia,
        dataInicioRecesso,
        dataSolicitacao: subtrairDias(dataInicioRecesso, 60),
        quantidadeDias: 10,
      }),
    );
    expect(resultado.sucesso).toBe(true);
    expect(adicionarDias(dataInicioRecesso, 9)).toBe(dataFimResidencia);
  });
});
