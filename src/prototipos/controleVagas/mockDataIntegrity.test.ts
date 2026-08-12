import { describe, expect, it } from "vitest";
import { quadrosAutorizadosMock } from "./mockData";
import { gerarVagasDoQuadro } from "./vagaUtils";

describe("integridade dos exemplos de quadros autorizados", () => {
  it("mantém códigos únicos e sequenciais de QA-0001 a QA-0012", () => {
    const codigos = quadrosAutorizadosMock
      .map((quadro) => quadro.codigo)
      .sort((a, b) => a.localeCompare(b));
    const esperados = Array.from(
      { length: 12 },
      (_, indice) => `QA-${String(indice + 1).padStart(4, "0")}`,
    );

    expect(codigos).toEqual(esperados);
    expect(new Set(codigos).size).toBe(12);
  });

  it("fecha autorizadas como ocupadas mais disponíveis", () => {
    quadrosAutorizadosMock.forEach((quadro) => {
      const vagas = gerarVagasDoQuadro(quadro);
      const ocupadas = vagas.filter((vaga) => vaga.estado === "OCUPADA").length;
      const disponiveis = vagas.filter(
        (vaga) => vaga.estado === "DISPONIVEL",
      ).length;

      expect(vagas).toHaveLength(quadro.autorizadas);
      expect(ocupadas + disponiveis).toBe(quadro.autorizadas);
    });
  });
});
