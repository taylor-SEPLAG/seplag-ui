import { describe, expect, it } from "vitest";
import { quadrosAutorizadosMock } from "./mockData";
import { gerarVagasDoQuadro } from "./vagaUtils";
import { calcularPosicaoVaga } from "./distribuicaoIndividual";

describe("destinação legal das vagas individualizadas", () => {
  it("respeita os quantitativos de todos os órgãos definidos em cada quadro", () => {
    const quadrosComRateio = quadrosAutorizadosMock.filter(
      (quadro) => quadro.quantitativosLegaisPorOrgao?.length,
    );

    expect(quadrosComRateio.length).toBeGreaterThan(0);
    quadrosComRateio.forEach((quadro) => {
      const vagas = gerarVagasDoQuadro(quadro);
      quadro.quantitativosLegaisPorOrgao?.forEach(({ orgao, quantidade }) => {
        expect(
          vagas.filter((vaga) => vaga.orgaoDistribuicaoInicial === orgao),
          `${quadro.codigo} — ${orgao}`,
        ).toHaveLength(quantidade);
      });
    });
  });

  it("mantém vagas sem destinação formal como disponíveis, mas pendentes de ato", () => {
    const quadro = quadrosAutorizadosMock.find(
      (item) => item.codigo === "QA-0012",
    );
    expect(quadro).toBeDefined();
    const vagas = gerarVagasDoQuadro(quadro!);
    const pendentes = vagas.filter(
      (vaga) =>
        vaga.estado === "DISPONIVEL" &&
        calcularPosicaoVaga(vaga, [], "2026-08-12").situacaoDistribuicao ===
          "PENDENTE_ATO",
    );

    expect(vagas).toHaveLength(30);
    expect(pendentes).toHaveLength(30);
  });

  it("preserva o órgão informado nos quadros legados que já possuem destinação", () => {
    const destinosEsperados = new Map([
      ["QA-0001", "SEPLAG"],
      ["QA-0002", "SES"],
      ["QA-0003", "SEFAZ"],
      ["QA-0006", "PJC"],
    ]);

    destinosEsperados.forEach((orgao, codigo) => {
      const quadro = quadrosAutorizadosMock.find((item) => item.codigo === codigo);
      expect(quadro, codigo).toBeDefined();
      const vagas = gerarVagasDoQuadro(quadro!);

      expect(vagas.every((vaga) => vaga.orgaoDistribuicaoInicial === orgao), codigo).toBe(true);
      expect(
        vagas.filter((vaga) => calcularPosicaoVaga(vaga, [], "2026-08-12").situacaoDistribuicao === "PENDENTE_ATO"),
        codigo,
      ).toHaveLength(0);
    });
  });});