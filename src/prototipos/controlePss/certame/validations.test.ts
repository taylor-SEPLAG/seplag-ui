// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { certamesMock } from "./mock";
import type { SituacaoHistoricoCertame } from "./types";
import {
 calcularPrazoPrestacaoContas,
 calcularValidadeDias,
 certameDuplicado,
 dataEfeitoAnteriorPublicacao,
 homologacaoVigenteSemCancelamento,
 podeRegistrarRetificacaoEdital,
 podeRegistrarRetificacaoHomologacao,
 proximoNumeroCertame,
} from "./validations";

function historico(...tipos:SituacaoHistoricoCertame["tipo"][]):SituacaoHistoricoCertame[] {
 return tipos.map((tipo, indice) => ({ id:`SIT-${indice}`, certameId:"CERT-X", tipo, dataEfeito:"01/01/2026", registradoEm:"01/01/2026 09:00", usuario:"TESTE" }));
}

describe("RN-23 — certameDuplicado (ER143)", () => {
 it("bloqueia quando já existe certame do mesmo número, tipo e ano", () => {
  // CERT-2026-001 é PSS, numeroConcurso 00000000001, anoConcurso 2026
  expect(certameDuplicado(certamesMock, { numeroConcurso:"00000000001", tipoCertame:"PSS", anoConcurso:2026 })).toBe(true);
 });

 it("não bloqueia quando o tipo é diferente, mesmo com número e ano iguais", () => {
  expect(certameDuplicado(certamesMock, { numeroConcurso:"00000000001", tipoCertame:"CONCURSO_PUBLICO", anoConcurso:2026 })).toBe(false);
 });

 it("não bloqueia quando o ano é diferente", () => {
  expect(certameDuplicado(certamesMock, { numeroConcurso:"00000000001", tipoCertame:"PSS", anoConcurso:2027 })).toBe(false);
 });

 it("não bloqueia contra si mesmo ao editar (idIgnorado)", () => {
  expect(certameDuplicado(certamesMock, { numeroConcurso:"00000000001", tipoCertame:"PSS", anoConcurso:2026 }, "CERT-2026-001")).toBe(false);
 });

 it("não bloqueia um número inédito", () => {
  expect(certameDuplicado(certamesMock, { numeroConcurso:"00000000999", tipoCertame:"PSS", anoConcurso:2026 })).toBe(false);
 });
});

describe("RN-24a — podeRegistrarRetificacaoEdital (ER142)", () => {
 it("permite quando o histórico já tem um registro Aberto", () => {
  expect(podeRegistrarRetificacaoEdital(historico("ABERTO"))).toBe(true);
 });

 it("bloqueia quando o histórico não tem nenhum registro Aberto", () => {
  expect(podeRegistrarRetificacaoEdital([])).toBe(false);
 });
});

describe("RN-24b — homologacaoVigenteSemCancelamento (ER144)", () => {
 it("bloqueia nova Homologação quando a última já homologou sem cancelamento depois", () => {
  expect(homologacaoVigenteSemCancelamento(historico("ABERTO", "HOMOLOGADO"))).toBe(true);
 });

 it("permite nova Homologação após um Cancelamento/Anulação posterior à Homologação", () => {
  expect(homologacaoVigenteSemCancelamento(historico("ABERTO", "HOMOLOGADO", "CANCELADO_ANULADO"))).toBe(false);
 });

 it("permite a primeira Homologação de um certame sem homologação prévia", () => {
  expect(homologacaoVigenteSemCancelamento(historico("ABERTO"))).toBe(false);
 });

 it("usa o cenário real do mock CERT-2026-002 (Aberto → Homologado, sem cancelamento) — bloqueia nova homologação", () => {
  const certame = certamesMock.find((item) => item.id === "CERT-2026-002")!;
  expect(homologacaoVigenteSemCancelamento(certame.historicoSituacoes)).toBe(true);
 });
});

describe("RN-24c — podeRegistrarRetificacaoHomologacao (ER145)", () => {
 it("permite quando há um Homologado prévio no histórico", () => {
  expect(podeRegistrarRetificacaoHomologacao(historico("ABERTO", "HOMOLOGADO"))).toBe(true);
 });

 it("bloqueia quando não há nenhum Homologado no histórico", () => {
  expect(podeRegistrarRetificacaoHomologacao(historico("ABERTO", "PARALISADO"))).toBe(false);
 });
});

describe("RN-24d — dataEfeitoAnteriorPublicacao", () => {
 it("bloqueia data de efeito anterior à publicação do edital", () => {
  expect(dataEfeitoAnteriorPublicacao("01/01/2026", "10/02/2026")).toBe(true);
 });

 it("permite data de efeito igual ou posterior à publicação do edital", () => {
  expect(dataEfeitoAnteriorPublicacao("10/02/2026", "10/02/2026")).toBe(false);
  expect(dataEfeitoAnteriorPublicacao("15/03/2026", "10/02/2026")).toBe(false);
 });

 it("não bloqueia quando alguma das datas está ausente", () => {
  expect(dataEfeitoAnteriorPublicacao(undefined, "10/02/2026")).toBe(false);
  expect(dataEfeitoAnteriorPublicacao("10/02/2026", undefined)).toBe(false);
 });
});

describe("funções pré-existentes continuam corretas (regressão)", () => {
 it("proximoNumeroCertame soma 1 ao total de certames do exercício", () => {
  expect(proximoNumeroCertame(2026, certamesMock)).toBe(String(certamesMock.filter((item) => item.anoConcurso === 2026).length + 1).padStart(11, "0"));
 });

 it("calcularPrazoPrestacaoContas soma 48h (2 dias) à data de efeito", () => {
  expect(calcularPrazoPrestacaoContas("10/02/2026")).toBe("12/02/2026");
 });

 it("calcularValidadeDias calcula a diferença em dias entre publicação e validade", () => {
  expect(calcularValidadeDias("10/02/2026", "10/02/2027")).toBe(365);
 });
});
