import { describe, expect, it } from "vitest";
import { quadrosAutorizadosMock } from "./mockData";
import { gerarVagasDoQuadro } from "./vagaUtils";
import {
  calcularStatusOperacionalVigenciaSeplag,
  STATUS_OPERACIONAL_VIGENCIA,
} from "../../componentes/SituacaoVigencia";

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

  it("usa somente Agendado, Ativo, Encerrado e Extinto nos 12 quadros", () => {
    const dataReferencia = new Date(2026, 7, 14);
    const statusPorCodigo = new Map(
      quadrosAutorizadosMock.map((quadro) => [
        quadro.codigo,
        quadro.extincaoProgressivaEmAndamento &&
        calcularStatusOperacionalVigenciaSeplag({ situacao: quadro.situacaoVigencia, dataAtivacao: quadro.dataAtivacao, dataEncerramento: quadro.dataEncerramento, dataExtincao: quadro.dataExtincao }, dataReferencia) ===
          STATUS_OPERACIONAL_VIGENCIA.ATIVO
          ? STATUS_OPERACIONAL_VIGENCIA.ENCERRADO
          : calcularStatusOperacionalVigenciaSeplag({ situacao: quadro.situacaoVigencia, dataAtivacao: quadro.dataAtivacao, dataEncerramento: quadro.dataEncerramento, dataExtincao: quadro.dataExtincao }, dataReferencia),
      ]),
    );

    expect(statusPorCodigo.get("QA-0008")).toBe(
      STATUS_OPERACIONAL_VIGENCIA.AGENDADO,
    );
    expect(statusPorCodigo.get("QA-0003")).toBe(
      STATUS_OPERACIONAL_VIGENCIA.ENCERRADO,
    );
    expect(statusPorCodigo.get("QA-0009")).toBe(
      STATUS_OPERACIONAL_VIGENCIA.ENCERRADO,
    );
    expect(statusPorCodigo.get("QA-0010")).toBe(
      STATUS_OPERACIONAL_VIGENCIA.EXTINTO,
    );

    quadrosAutorizadosMock
      .filter((quadro) => statusPorCodigo.get(quadro.codigo) === "ENCERRADO")
      .forEach((quadro) => {
        expect(quadro.autorizadas).toBe(quadro.ocupadas);
        expect(quadro.comprometidas).toBe(0);
      });

    const extinto = quadrosAutorizadosMock.find(
      (quadro) => statusPorCodigo.get(quadro.codigo) === "EXTINTO",
    );
    expect(extinto).toMatchObject({
      autorizadas: 0,
      ocupadas: 0,
      comprometidas: 0,
    });
  });
});
