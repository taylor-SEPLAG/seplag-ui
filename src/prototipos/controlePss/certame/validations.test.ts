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
 podeEditarCertame,
 podeRegistrarParalisacao,
 podeRegistrarProrrogacaoValidade,
 podeRegistrarRetificacaoEdital,
 podeRegistrarRetificacaoHomologacao,
 podeRegistrarRetificacaoHomologacaoParcial,
 podeRegistrarRetomadaCronograma,
 gerarNumeroCertame,
 situacaoAtualDoHistorico,
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
  expect(certameDuplicado(certamesMock, { numeroConcurso:"00000099999", tipoCertame:"PSS", anoConcurso:2026 })).toBe(false);
 });
});

describe("RN003/RN019 — podeRegistrarRetificacaoEdital (ER142)", () => {
 it("permite quando o histórico já tem um registro Aberto e a situação atual é Abertura", () => {
  expect(podeRegistrarRetificacaoEdital(historico("ABERTO"))).toBe(true);
 });

 it("bloqueia quando o histórico não tem nenhum registro Aberto", () => {
  expect(podeRegistrarRetificacaoEdital([])).toBe(false);
 });

 it("permite quando a situação atual é Paralisação (RN019)", () => {
  expect(podeRegistrarRetificacaoEdital(historico("ABERTO", "PARALISADO"))).toBe(true);
 });

 it("bloqueia quando a situação atual já avançou para Homologado (RN019)", () => {
  expect(podeRegistrarRetificacaoEdital(historico("ABERTO", "HOMOLOGADO"))).toBe(false);
 });
});

describe("RN004 — homologacaoVigenteSemCancelamento", () => {
 it("bloqueia nova Homologação quando a última já homologou sem cancelamento depois", () => {
  expect(homologacaoVigenteSemCancelamento(historico("ABERTO", "HOMOLOGADO"))).toBe(true);
 });

 it("permite nova Homologação após um Cancelamento/Anulação posterior à Homologação", () => {
  expect(homologacaoVigenteSemCancelamento(historico("ABERTO", "HOMOLOGADO", "CANCELADO_ANULADO"))).toBe(false);
 });

 it("permite a primeira Homologação de um certame sem homologação prévia", () => {
  expect(homologacaoVigenteSemCancelamento(historico("ABERTO"))).toBe(false);
 });

 it("bloqueia quando a Homologação Parcial vigente ainda não foi cancelada (Homologação e Parcial compartilham a guarda)", () => {
  expect(homologacaoVigenteSemCancelamento(historico("ABERTO", "HOMOLOGACAO_PARCIAL"))).toBe(true);
 });

 it("usa o cenário real do mock CERT-2026-002 (Aberto → Homologado, sem cancelamento) — bloqueia nova homologação", () => {
  const certame = certamesMock.find((item) => item.id === "CERT-2026-002")!;
  expect(homologacaoVigenteSemCancelamento(certame.historicoSituacoes)).toBe(true);
 });
});

describe("RN005 — podeRegistrarRetificacaoHomologacao (ER145)", () => {
 it("permite quando há um Homologado (completo) prévio no histórico", () => {
  expect(podeRegistrarRetificacaoHomologacao(historico("ABERTO", "HOMOLOGADO"))).toBe(true);
 });

 it("bloqueia quando não há nenhum Homologado no histórico", () => {
  expect(podeRegistrarRetificacaoHomologacao(historico("ABERTO", "PARALISADO"))).toBe(false);
 });

 it("bloqueia quando só há Homologação Parcial (não basta — precisa da completa)", () => {
  expect(podeRegistrarRetificacaoHomologacao(historico("ABERTO", "HOMOLOGACAO_PARCIAL"))).toBe(false);
 });
});

describe("RN017 — podeRegistrarRetificacaoHomologacaoParcial", () => {
 it("permite quando há uma Homologação Parcial prévia", () => {
  expect(podeRegistrarRetificacaoHomologacaoParcial(historico("ABERTO", "HOMOLOGACAO_PARCIAL"))).toBe(true);
 });

 it("bloqueia quando só há Homologação completa (não basta — precisa da parcial)", () => {
  expect(podeRegistrarRetificacaoHomologacaoParcial(historico("ABERTO", "HOMOLOGADO"))).toBe(false);
 });
});

describe("RN018 — podeRegistrarProrrogacaoValidade", () => {
 it("permite quando há Homologação vigente sem cancelamento", () => {
  expect(podeRegistrarProrrogacaoValidade(historico("ABERTO", "HOMOLOGADO"))).toBe(true);
 });

 it("bloqueia quando ainda não houve nenhuma Homologação", () => {
  expect(podeRegistrarProrrogacaoValidade(historico("ABERTO"))).toBe(false);
 });

 it("bloqueia quando a Homologação já foi cancelada", () => {
  expect(podeRegistrarProrrogacaoValidade(historico("ABERTO", "HOMOLOGADO", "CANCELADO_ANULADO"))).toBe(false);
 });
});

describe("RN020 — podeRegistrarParalisacao", () => {
 it("permite a partir da Abertura", () => {
  expect(podeRegistrarParalisacao(historico("ABERTO"))).toBe(true);
 });

 it("permite a partir de uma Retificação de Edital", () => {
  expect(podeRegistrarParalisacao(historico("ABERTO", "RETIFICACAO_EDITAL"))).toBe(true);
 });

 it("bloqueia depois de Homologado", () => {
  expect(podeRegistrarParalisacao(historico("ABERTO", "HOMOLOGADO"))).toBe(false);
 });
});

describe("RN023 — podeRegistrarRetomadaCronograma", () => {
 it("permite quando a situação atual é Paralisação", () => {
  expect(podeRegistrarRetomadaCronograma(historico("ABERTO", "PARALISADO"))).toBe(true);
 });

 it("bloqueia quando a situação atual não é Paralisação", () => {
  expect(podeRegistrarRetomadaCronograma(historico("ABERTO"))).toBe(false);
 });
});

describe("situacaoAtualDoHistorico", () => {
 it("retorna o tipo do último registro do histórico", () => {
  expect(situacaoAtualDoHistorico(historico("ABERTO", "PARALISADO"))).toBe("PARALISADO");
 });

 it("assume Abertura quando o histórico está vazio (RN007)", () => {
  expect(situacaoAtualDoHistorico([])).toBe("ABERTO");
 });
});

describe("RN001 (Listagem) — podeEditarCertame", () => {
 it("permite Editar com o certame em Abertura", () => {
  expect(podeEditarCertame("ABERTO")).toBe(true);
 });

 it("permite Editar com o certame em Retificação de Edital", () => {
  expect(podeEditarCertame("RETIFICACAO_EDITAL")).toBe(true);
 });

 it("bloqueia Editar para as demais situações", () => {
  expect(podeEditarCertame("PARALISADO")).toBe(false);
  expect(podeEditarCertame("HOMOLOGADO")).toBe(false);
  expect(podeEditarCertame("HOMOLOGACAO_PARCIAL")).toBe(false);
  expect(podeEditarCertame("RETIFICACAO_HOMOLOGACAO")).toBe(false);
  expect(podeEditarCertame("RETIFICACAO_HOMOLOGACAO_PARCIAL")).toBe(false);
  expect(podeEditarCertame("PRORROGACAO_VALIDADE")).toBe(false);
  expect(podeEditarCertame("CANCELADO_ANULADO")).toBe(false);
  expect(podeEditarCertame("RETOMADA_CRONOGRAMA")).toBe(false);
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

describe("RN01/RN03 — gerarNumeroCertame (Número do Certame TCE-MT)", () => {
 it("gera o próximo sequencial do exercício, somando os dois tipos de certame", () => {
  // 2026 no mock: 5 certames (Concurso Público e PSS somados) — próximo é 6
  expect(gerarNumeroCertame(2026, certamesMock)).toBe("00000000006");
 });

 it("não soma certames de outro exercício", () => {
  // 2025 no mock: só 1 certame — próximo é 2, não continua a contagem de 2026
  expect(gerarNumeroCertame(2025, certamesMock)).toBe("00000000002");
 });

 it("reinicia a sequência para um exercício ainda sem nenhum certame", () => {
  expect(gerarNumeroCertame(2027, certamesMock)).toBe("00000000001");
 });
});

describe("funções pré-existentes continuam corretas (regressão)", () => {
 it("calcularPrazoPrestacaoContas soma 48h (2 dias) à data de efeito", () => {
  expect(calcularPrazoPrestacaoContas("10/02/2026")).toBe("12/02/2026");
 });

 it("calcularValidadeDias calcula a diferença em dias entre o resultado e a validade", () => {
  expect(calcularValidadeDias("10/02/2026", "10/02/2027")).toBe(365);
 });
});
