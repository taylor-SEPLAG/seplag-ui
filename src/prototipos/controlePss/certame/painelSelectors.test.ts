// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { certamesMock } from "./mock";
import {
 bucketStatusCertame,
 certameAtivo,
 documentosPendentes,
 homologacaoDeVagasPendente,
 inscricoesAbertas,
 prazoVenceEmAteDias,
 proximosPrazos,
 totalVagas,
 totalVagasPcd,
} from "./painelSelectors";

const HOJE = new Date(2026, 6, 29); // 29/07/2026 — mesma data de CONTROLE_PSS_DATA_REFERENCIA

function certame(id:string) {
 const item = certamesMock.find((c) => c.id === id);
 if (!item) throw new Error(`certame ${id} não encontrado no mock`);
 return item;
}

describe("bucketStatusCertame", () => {
 it("mapeia as 9 situações para os 5 grupos do Painel sem exceção", () => {
  certamesMock.forEach((item) => expect(["ELABORACAO", "PUBLICADA", "ANALISE", "HOMOLOGADO", "CANCELADO"]).toContain(bucketStatusCertame(item)));
 });

 it("classifica os certames do mock nos grupos esperados", () => {
  expect(bucketStatusCertame(certame("CERT-2026-001"))).toBe("PUBLICADA"); // ABERTO
  expect(bucketStatusCertame(certame("CERT-2026-002"))).toBe("HOMOLOGADO");
  expect(bucketStatusCertame(certame("CERT-2025-014"))).toBe("ANALISE"); // PARALISADO
  expect(bucketStatusCertame(certame("CERT-2026-003"))).toBe("CANCELADO");
  expect(bucketStatusCertame(certame("CERT-2026-005"))).toBe("ANALISE"); // PRORROGACAO_VALIDADE
 });
});

describe("certameAtivo", () => {
 it("considera cancelado como o único grupo inativo", () => {
  expect(certameAtivo(certame("CERT-2026-003"))).toBe(false);
  expect(certameAtivo(certame("CERT-2026-001"))).toBe(true);
  expect(certameAtivo(certame("CERT-2026-002"))).toBe(true);
 });
});

describe("totalVagas / totalVagasPcd", () => {
 it("soma as vagas dos cargos do certame", () => {
  expect(totalVagas(certame("CERT-2026-004"))).toBe(15);
  expect(totalVagasPcd(certame("CERT-2026-004"))).toBe(2);
 });

 it("retorna 0 quando não há vaga PCD", () => {
  expect(totalVagasPcd(certame("CERT-2026-003"))).toBe(0);
 });
});

describe("inscricoesAbertas", () => {
 it("está aberta para CERT-2026-004 na data de referência (05/07 a 20/08/2026)", () => {
  expect(inscricoesAbertas(certame("CERT-2026-004"), HOJE)).toBe(true);
 });

 it("já encerrou para CERT-2026-001 (fim em 28/02/2026)", () => {
  expect(inscricoesAbertas(certame("CERT-2026-001"), HOJE)).toBe(false);
 });
});

describe("documentosPendentes", () => {
 it("aponta o Demonstrativo LRF como pendente em CERT-2026-004 (RN-20)", () => {
  const pendentes = documentosPendentes(certame("CERT-2026-004"));
  expect(pendentes.map((item) => item.tipo)).toEqual(["DEMONSTRATIVO_LRF"]);
 });

 it("aponta a Publicação do certame licitatório como pendente em CERT-2026-005, empresa contratada (RN-21)", () => {
  const pendentes = documentosPendentes(certame("CERT-2026-005"));
  expect(pendentes.map((item) => item.tipo)).toEqual(["PUBLICACAO_CERTAME_LICITATORIO"]);
 });

 it("não acusa pendência para um certame com todos os documentos obrigatórios anexados", () => {
  expect(documentosPendentes(certame("CERT-2026-001"))).toHaveLength(0);
 });
});

describe("prazoVenceEmAteDias", () => {
 it("CERT-2026-004 vence em 1 dia (30/07/2026) — dentro da janela de 15 dias", () => {
  expect(prazoVenceEmAteDias(certame("CERT-2026-004"), HOJE, 15)).toBe(true);
 });

 it("certames com prazo já vencido há meses não entram na janela de 15 dias", () => {
  expect(prazoVenceEmAteDias(certame("CERT-2026-001"), HOJE, 15)).toBe(false);
 });
});

describe("homologacaoDeVagasPendente", () => {
 it("CERT-2026-005 tem resultado divulgado (10/07/2026) mas ainda não está no grupo Homologado", () => {
  expect(homologacaoDeVagasPendente(certame("CERT-2026-005"), HOJE)).toBe(true);
 });

 it("um certame já homologado não conta como pendência", () => {
  expect(homologacaoDeVagasPendente(certame("CERT-2026-002"), HOJE)).toBe(false);
 });

 it("um certame sem data de resultado não conta como pendência", () => {
  expect(homologacaoDeVagasPendente(certame("CERT-2026-001"), HOJE)).toBe(false);
 });
});

describe("proximosPrazos", () => {
 it("lista apenas prazos futuros ou do próprio dia, ordenados do mais próximo ao mais distante", () => {
  const prazos = proximosPrazos(certamesMock, HOJE, 20);
  expect(prazos.every((item) => item.diasRestantes >= 0)).toBe(true);
  expect(prazos).toEqual([...prazos].sort((a, b) => a.diasRestantes - b.diasRestantes));
  expect(prazos.some((item) => item.certameId === "CERT-2026-004")).toBe(true);
 });
});
