import { describe, expect, it } from "vitest";
import { quadrosAutorizadosMock, vagasIndividualizadasMock } from "./mockData";
import { movimentosVagasIndividuaisMock } from "./distribuicaoIndividualMock";
import { calcularPosicaoVaga } from "./distribuicaoIndividual";
import { gerarVagasDoQuadro } from "./vagaUtils";
import {
  calcularStatusOperacionalVigenciaSeplag,
  STATUS_OPERACIONAL_VIGENCIA,
} from "../../componentes/SituacaoVigencia";

describe("integridade dos exemplos de quadros autorizados", () => {
  it("mantém códigos únicos e 11 novos quadros efetivos", () => {
    const codigos = quadrosAutorizadosMock
      .map((quadro) => quadro.codigo)
      .sort((a, b) => a.localeCompare(b));
    expect(new Set(codigos).size).toBe(codigos.length);
    const efetivos = quadrosAutorizadosMock.filter((quadro) => quadro.tipoQuadro === "Efetivo");
    expect(efetivos).toHaveLength(11);
    expect(efetivos.map((quadro) => quadro.codigo)).toEqual(
      Array.from({ length: 11 }, (_, indice) => `QA-${String(indice + 15).padStart(4, "0")}`),
    );
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

  it("mantém os novos quadros efetivos ativos", () => {
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

    quadrosAutorizadosMock
      .filter((quadro) => quadro.tipoQuadro === "Efetivo")
      .forEach((quadro) => {
        expect(statusPorCodigo.get(quadro.codigo)).toBe(STATUS_OPERACIONAL_VIGENCIA.ATIVO);
        expect(quadro.ocupadas).toBe(0);
        expect(quadro.comprometidas).toBe(0);
      });
  });

  it("não usa redistribuição para manter a vaga no mesmo órgão", () => {
    movimentosVagasIndividuaisMock
      .filter((movimento) => movimento.tipo === "REDISTRIBUICAO")
      .forEach((movimento) => {
        expect(movimento.orgaoAnterior).toBeTruthy();
        expect(movimento.orgaoPosterior).toBeTruthy();
        expect(movimento.orgaoPosterior).not.toBe(movimento.orgaoAnterior);
      });
  });

  it("inicia os novos quadros efetivos sem distribuição formal", () => {
    const dataReferencia = "2026-07-23";
    const vagas = vagasIndividualizadasMock.filter(
      (vaga) => vaga.tipo === "EFETIVO",
    );
    const idsVagas = new Set(vagas.map((vaga) => vaga.id));
    const posicoes = vagas.map((vaga) =>
      calcularPosicaoVaga(vaga, movimentosVagasIndividuaisMock, dataReferencia),
    );
    const distribuidas = posicoes.filter(
      (posicao) => posicao.situacaoDistribuicao === "DISTRIBUIDA",
    );
    const pendentes = posicoes.filter(
      (posicao) => posicao.situacaoDistribuicao === "PENDENTE_ATO",
    );

    expect(distribuidas).toHaveLength(0);
    expect(pendentes).toHaveLength(vagas.length);
    expect(movimentosVagasIndividuaisMock.some((movimento) => idsVagas.has(movimento.vagaId))).toBe(false);
  });
});
