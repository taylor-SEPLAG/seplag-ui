import { describe, expect, it } from "vitest";
import { CodigoErroRecesso, validarSolicitacaoRecesso, type SolicitacaoRecessoInput } from "./validarSolicitacaoRecesso";

function subtrairDias(iso: string, dias: number): string {
  const data = new Date(`${iso}T00:00:00`);
  data.setDate(data.getDate() - dias);
  return data.toISOString().slice(0, 10);
}

function entradaResidenteBase(overrides: Partial<SolicitacaoRecessoInput> = {}): SolicitacaoRecessoInput {
  const data_inicio_recesso = "2026-06-01";
  return {
    tipo_vinculo: "RESIDENTE",
    data_inicio_contrato: "2025-01-01",
    data_fim_contrato: "2027-01-01",
    data_inicio_recesso,
    data_solicitacao: subtrairDias(data_inicio_recesso, 60),
    quantidade_dias_solicitados: 10,
    numero_parcela: 1,
    saldo_dias_disponivel: 30,
    ...overrides,
  };
}

function entradaEstagiarioBase(overrides: Partial<SolicitacaoRecessoInput> = {}): SolicitacaoRecessoInput {
  const data_inicio_recesso = "2026-06-01";
  return {
    tipo_vinculo: "ESTAGIARIO",
    data_inicio_contrato: subtrairDias(data_inicio_recesso, 150), // 5 meses -> saldo proporcional de 12,5 dias
    data_fim_contrato: "2027-01-01",
    data_inicio_recesso,
    data_solicitacao: subtrairDias(data_inicio_recesso, 35),
    quantidade_dias_solicitados: 10,
    numero_parcela: 1,
    saldo_dias_disponivel: 15,
    ...overrides,
  };
}

describe("validarSolicitacaoRecesso — RESIDENTE", () => {
  it("falha por carência do período aquisitivo com 6 meses de contrato", () => {
    const data_inicio_contrato = "2026-01-01";
    const data_inicio_recesso = "2026-07-01"; // só 6 meses depois
    const resultado = validarSolicitacaoRecesso(
      entradaResidenteBase({
        data_inicio_contrato,
        data_inicio_recesso,
        data_solicitacao: subtrairDias(data_inicio_recesso, 60),
      }),
    );
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro_codigo).toBe(CodigoErroRecesso.CARENCIA_PERIODO_AQUISITIVO);
  });

  it("falha por parcela abaixo do mínimo (5 dias)", () => {
    const resultado = validarSolicitacaoRecesso(entradaResidenteBase({ quantidade_dias_solicitados: 5 }));
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro_codigo).toBe(CodigoErroRecesso.PARCELA_ABAIXO_DO_MINIMO);
  });

  it("falha por parcela acima do máximo (35 dias)", () => {
    const resultado = validarSolicitacaoRecesso(
      entradaResidenteBase({ quantidade_dias_solicitados: 35, saldo_dias_disponivel: 35 }),
    );
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro_codigo).toBe(CodigoErroRecesso.PARCELA_ACIMA_DO_MAXIMO);
  });

  it("falha por antecedência insuficiente na 1ª parcela (menos de 60 dias)", () => {
    const data_inicio_recesso = "2026-06-01";
    const resultado = validarSolicitacaoRecesso(
      entradaResidenteBase({ data_inicio_recesso, data_solicitacao: subtrairDias(data_inicio_recesso, 59), numero_parcela: 1 }),
    );
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro_codigo).toBe(CodigoErroRecesso.ANTECEDENCIA_INSUFICIENTE);
  });

  it("falha por antecedência insuficiente na 2ª parcela (menos de 45 dias)", () => {
    const data_inicio_recesso = "2026-06-01";
    const resultado = validarSolicitacaoRecesso(
      entradaResidenteBase({ data_inicio_recesso, data_solicitacao: subtrairDias(data_inicio_recesso, 44), numero_parcela: 2 }),
    );
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro_codigo).toBe(CodigoErroRecesso.ANTECEDENCIA_INSUFICIENTE);
  });

  it("falha quando o número da parcela excede 3", () => {
    const data_inicio_recesso = "2026-06-01";
    const resultado = validarSolicitacaoRecesso(
      entradaResidenteBase({
        data_inicio_recesso,
        data_solicitacao: subtrairDias(data_inicio_recesso, 45),
        numero_parcela: 4,
      }),
    );
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro_codigo).toBe(CodigoErroRecesso.PARCELAMENTO_MAXIMO_EXCEDIDO);
  });

  it("falha quando os dias solicitados excedem o saldo disponível", () => {
    const resultado = validarSolicitacaoRecesso(
      entradaResidenteBase({ quantidade_dias_solicitados: 20, saldo_dias_disponivel: 15 }),
    );
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro_codigo).toBe(CodigoErroRecesso.SALDO_INSUFICIENTE);
  });

  it("falha quando o recesso ultrapassa o fim do contrato", () => {
    const data_fim_contrato = "2026-06-15";
    const data_inicio_recesso = "2026-06-10"; // +10 dias ultrapassa 2026-06-15
    const resultado = validarSolicitacaoRecesso(
      entradaResidenteBase({
        data_fim_contrato,
        data_inicio_recesso,
        data_solicitacao: subtrairDias(data_inicio_recesso, 60),
      }),
    );
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro_codigo).toBe(CodigoErroRecesso.LIMITE_CONTRATO_EXCEDIDO);
  });

  it("sucesso para solicitação válida de residente", () => {
    const resultado = validarSolicitacaoRecesso(entradaResidenteBase());
    expect(resultado.sucesso).toBe(true);
    expect(resultado.erro_codigo).toBe("");
  });
});

describe("validarSolicitacaoRecesso — ESTAGIÁRIO", () => {
  it("falha por antecedência insuficiente (10 dias)", () => {
    const data_inicio_recesso = "2026-06-01";
    const resultado = validarSolicitacaoRecesso(
      entradaEstagiarioBase({
        data_inicio_recesso,
        data_solicitacao: subtrairDias(data_inicio_recesso, 10),
      }),
    );
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro_codigo).toBe(CodigoErroRecesso.ANTECEDENCIA_INSUFICIENTE);
  });

  it("sucesso: 10 dias solicitados com 35 dias de antecedência e saldo disponível", () => {
    const resultado = validarSolicitacaoRecesso(entradaEstagiarioBase());
    expect(resultado.sucesso).toBe(true);
    expect(resultado.erro_codigo).toBe("");
  });

  it("não exige carência: aceita recesso logo no início do contrato, respeitando o saldo proporcional", () => {
    const data_inicio_recesso = "2026-06-01";
    const resultado = validarSolicitacaoRecesso(
      entradaEstagiarioBase({
        data_inicio_contrato: subtrairDias(data_inicio_recesso, 60), // 2 meses -> saldo proporcional de 5 dias
        quantidade_dias_solicitados: 5,
        saldo_dias_disponivel: 10,
      }),
    );
    expect(resultado.sucesso).toBe(true);
  });

  it("falha por parcela abaixo do mínimo (3 dias)", () => {
    const resultado = validarSolicitacaoRecesso(entradaEstagiarioBase({ quantidade_dias_solicitados: 3 }));
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro_codigo).toBe(CodigoErroRecesso.PARCELA_ABAIXO_DO_MINIMO);
  });

  it("falha quando os dias solicitados excedem o saldo proporcional ao tempo de contrato", () => {
    const data_inicio_recesso = "2026-06-01";
    const resultado = validarSolicitacaoRecesso(
      entradaEstagiarioBase({
        data_inicio_contrato: subtrairDias(data_inicio_recesso, 60), // 2 meses -> saldo proporcional de 5 dias
        quantidade_dias_solicitados: 10,
        saldo_dias_disponivel: 30, // saldo da base é maior, mas o proporcional ao tempo decorrido é só 5
      }),
    );
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro_codigo).toBe(CodigoErroRecesso.SALDO_INSUFICIENTE);
  });

  it("falha quando o recesso ultrapassa o fim do contrato", () => {
    const data_fim_contrato = "2026-06-05";
    const data_inicio_recesso = "2026-06-01"; // +10 dias ultrapassa 2026-06-05
    const resultado = validarSolicitacaoRecesso(
      entradaEstagiarioBase({
        data_fim_contrato,
        data_inicio_recesso,
        data_solicitacao: subtrairDias(data_inicio_recesso, 35),
      }),
    );
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro_codigo).toBe(CodigoErroRecesso.LIMITE_CONTRATO_EXCEDIDO);
  });
});

describe("validarSolicitacaoRecesso — vínculo inválido", () => {
  it("falha quando tipo_vinculo não é RESIDENTE nem ESTAGIARIO", () => {
    const resultado = validarSolicitacaoRecesso(
      entradaResidenteBase({ tipo_vinculo: "COMISSIONADO" as unknown as SolicitacaoRecessoInput["tipo_vinculo"] }),
    );
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro_codigo).toBe(CodigoErroRecesso.VINCULO_INVALIDO);
  });
});
