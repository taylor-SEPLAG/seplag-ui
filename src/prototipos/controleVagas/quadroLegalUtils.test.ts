import { describe, expect, it } from "vitest";
import { encerrarOcupacao, registrarEfetivoExercicio } from "./ocupacoes";
import {
  aplicarAlteracaoQuadroLegal,
  reconciliarQuadroAposVacanciaEmExtincao,
} from "./quadroLegalUtils";
import type { OcupacaoVaga, QuadroAutorizadoRow, Vaga } from "./types";
import { gerarNomeVaga } from "./vagaUtils";

const vaga = (id: string, estado: Vaga["estado"]): Vaga => ({
  id,
  sequencial: Number(id.at(-1)),
  quadroAutorizadoId: 1,
  quadroCodigo: "QA-TESTE",
  tipo: "EFETIVO",
  lei: "Lei anterior",
  carreira: "Carreira teste",
  cargo: "Cargo teste",
  perfilProfissional: "",
  orgaoTitular: "SEPLAG",
  destinacaoPrevistaLei: "SEPLAG",
  criadaEm: "01/01/2025",
  inicioVigencia: "01/01/2025",
  estado,
  situacaoLegal: "REGULAR",
  historico: [],
});

const quadro: QuadroAutorizadoRow = {
  id: 1,
  codigo: "QA-TESTE",
  tipoQuadro: "Efetivo",
  vinculo: "Servidor efetivo",
  regime: "Estatutário",
  carreira: "Carreira teste",
  cargo: "Cargo teste",
  perfilProfissional: "",
  orgao: "SEPLAG",
  abrangencia: "SEPLAG",
  situacaoVigencia: "ATIVO",
  extincaoProgressivaEmAndamento: true,
  dataInicioExtincaoProgressiva: "2026-08-01",
  autorizadas: 1,
  ocupadas: 1,
  comprometidas: 0,
  bloqueadas: 0,
  inicioVigencia: "01/08/2026",
  fimVigencia: "",
  ato: "Lei de extinção",
  processo: "SEPLAG-PRO-TESTE",
  situacao: "Vigente",
  versao: 2,
  atualizadoEm: "01/08/2026",
};

const ocupacao: OcupacaoVaga = {
  id: "OCU-TESTE",
  vagaId: "VAG-2",
  pessoaId: "PES-1",
  pessoaNome: "Pessoa teste",
  cpf: "***",
  vinculoId: "VIN-1",
  matricula: "1",
  tipoVinculo: "EFETIVO",
  orgaoVinculo: "SEPLAG",
  orgaoLotacao: "SEPLAG",
  orgaoExercicio: "SEPLAG",
  cargo: "Cargo teste",
  efetivoExercicioEm: "01/01/2025",
  situacao: "ATIVA",
  eventos: [],
};

describe("extinção progressiva do quadro", () => {
  it("extingue disponíveis e mantém ocupadas no quantitativo até a vacância", () => {
    const resultado = aplicarAlteracaoQuadroLegal(
      [vaga("VAG-1", "DISPONIVEL"), vaga("VAG-2", "OCUPADA")],
      {
        tipo: "EXTINCAO_PROGRESSIVA",
        quantidade: 1,
        lei: "Lei de extinção",
        processo: "SEPLAG-PRO-TESTE",
        dataEfeito: "2026-08-01",
      },
    );

    expect(resultado.quantitativoAnterior).toBe(2);
    expect(resultado.quantitativoPosterior).toBe(1);
    expect(resultado.vagas.find((item) => item.id === "VAG-1")?.situacaoLegal)
      .toBe("EXTINTA");
    expect(resultado.vagas.find((item) => item.id === "VAG-2")?.situacaoLegal)
      .toBe("EM_EXTINCAO");
  });

  it("mantém a vaga comprometida até a conclusão do processo ativo", () => {
    const resultado = aplicarAlteracaoQuadroLegal(
      [vaga("VAG-1", "DISPONIVEL"), vaga("VAG-2", "OCUPADA")],
      {
        tipo: "EXTINCAO_PROGRESSIVA",
        lei: "Lei de extinção",
        processo: "SEPLAG-PRO-TESTE",
        dataEfeito: "2026-08-01",
        vagaIdsBloqueados: ["VAG-1"],
      },
    );

    expect(resultado.alteradas).toHaveLength(2);
    expect(resultado.quantitativoPosterior).toBe(2);
    expect(resultado.vagas.find((item) => item.id === "VAG-1")?.situacaoLegal)
      .toBe("EM_EXTINCAO");
    expect(resultado.alertas[0]).toContain("permanecerá(ão) controlada(s)");
  });
  it("extingue a vaga na vacância e conclui a vigência do quadro", () => {
    const vagaEmExtincao = {
      ...vaga("VAG-2", "OCUPADA"),
      situacaoLegal: "EM_EXTINCAO" as const,
    };
    const encerramento = encerrarOcupacao(
      vagaEmExtincao,
      ocupacao,
      "2026-10-15",
      "Aposentadoria",
    );
    const quadroExtinto = reconciliarQuadroAposVacanciaEmExtincao(
      quadro,
      [encerramento.vaga],
      "2026-10-15",
    );

    expect(encerramento.vaga.situacaoLegal).toBe("EXTINTA");
    expect(quadroExtinto.situacaoVigencia).toBe("EXTINTO");
    expect(quadroExtinto.dataExtincao).toBe("2026-10-15");
    expect(quadroExtinto.autorizadas).toBe(0);
    expect(quadroExtinto.situacao).toBe("Encerrada");
  });

  it("bloqueia nova ocupação em vaga que está em extinção", () => {
    const vagaEmExtincao = {
      ...vaga("VAG-2", "DISPONIVEL"),
      situacaoLegal: "EM_EXTINCAO" as const,
    };

    expect(() =>
      registrarEfetivoExercicio(vagaEmExtincao, {
        pessoaId: "PES-2",
        pessoaNome: "Outra pessoa",
        cpf: "***",
        vinculoId: "VIN-2",
        matricula: "2",
        tipoVinculo: "EFETIVO",
        orgaoVinculo: "SEPLAG",
        orgaoExercicio: "SEPLAG",
        efetivoExercicioEm: "2026-08-02",
      }),
    ).toThrow("A vaga está em extinção");
  });
});
describe("ampliação legal do quadro", () => {
  it("cria novas vagas disponíveis e pendentes de distribuição", () => {
    const vagaDistribuida: Vaga = {
      ...vaga("VAG-1", "OCUPADA"),
      orgaoDistribuicaoInicial: "SEPLAG",
      atoDistribuicaoInicial: "Decreto anterior",
      inicioVigenciaDistribuicao: "01/01/2025",
    };

    const resultado = aplicarAlteracaoQuadroLegal([vagaDistribuida], {
      tipo: "AMPLIACAO",
      quantidade: 2,
      lei: "Lei de ampliação",
      processo: "SEPLAG-PRO-AMPLIACAO",
      dataEfeito: "2026-08-01",
    });

    expect(resultado.criadas).toHaveLength(2);
    resultado.criadas.forEach((novaVaga) => {
      expect(novaVaga.estado).toBe("DISPONIVEL");
      expect(novaVaga.situacaoLegal).toBe("REGULAR");
      expect(novaVaga.destinacaoPrevistaLei).toBe(
        "Pendente de distribuição",
      );
      expect(novaVaga.orgaoDistribuicaoInicial).toBeUndefined();
      expect(novaVaga.atoDistribuicaoInicial).toBeUndefined();
      expect(novaVaga.inicioVigenciaDistribuicao).toBeUndefined();
    });
    expect(resultado.vagas[0].orgaoDistribuicaoInicial).toBe("SEPLAG");
  });
});

describe("redução legal do quadro", () => {
  it("reduz somente vagas disponíveis, regulares e sem comprometimento ativo", () => {
    const resultado = aplicarAlteracaoQuadroLegal(
      [
        vaga("VAG-1", "DISPONIVEL"),
        vaga("VAG-2", "OCUPADA"),
        vaga("VAG-3", "DISPONIVEL"),
      ],
      {
        tipo: "REDUCAO",
        quantidade: 3,
        lei: "Lei de redução",
        processo: "SEPLAG-PRO-REDUCAO",
        dataEfeito: "2026-08-01",
        vagaIds: ["VAG-1", "VAG-2", "VAG-3"],
        vagaIdsBloqueados: ["VAG-3"],
      },
    );

    expect(resultado.alteradas.map((item) => item.id)).toEqual(["VAG-1"]);
    expect(resultado.vagas.find((item) => item.id === "VAG-1")?.situacaoLegal)
      .toBe("EXTINTA");
    expect(resultado.vagas.find((item) => item.id === "VAG-2")?.situacaoLegal)
      .toBe("REGULAR");
    expect(resultado.vagas.find((item) => item.id === "VAG-3")?.situacaoLegal)
      .toBe("REGULAR");
    expect(resultado.quantitativoPosterior).toBe(2);
    expect(resultado.alertas).toContain(
      "A redução foi limitada a 1 vaga(s) disponível(is), regular(es) e sem comprometimento.",
    );
  });
});
describe("transformação entre Quadros Autorizados", () => {
  it("transforma vagas livres e ocupadas e continua o sequencial do destino", () => {
    const resultado = aplicarAlteracaoQuadroLegal(
      [vaga("VAG-1", "DISPONIVEL"), vaga("VAG-2", "OCUPADA"), vaga("VAG-3", "DISPONIVEL")],
      {
        tipo: "TRANSFORMACAO",
        quantidade: 3,
        lei: "Lei de transformação",
        processo: "SEPLAG-PRO-TRANSFORMACAO",
        dataEfeito: "2026-08-01",
        novoCargo: "Cargo destino",
        novaCarreira: "Carreira destino",
        quadroDestinoId: 9,
        quadroDestinoCodigo: "QA-DESTINO",
        maiorSequencialDestino: 10,
      },
    );

    expect(resultado.quantitativoAnterior).toBe(3);
    expect(resultado.quantitativoPosterior).toBe(0);
    expect(resultado.criadas.map((item) => item.sequencial)).toEqual([11, 12, 13]);
    expect(resultado.criadas.map((item) => item.estado)).toEqual(["DISPONIVEL", "DISPONIVEL", "OCUPADA"]);
    expect(resultado.criadas.every((item) => item.quadroAutorizadoId === 9)).toBe(true);
    expect(resultado.criadas.every((item) => item.quadroCodigo === "QA-DESTINO")).toBe(true);
    expect(resultado.criadas.every((item) => item.cargo === "Cargo destino")).toBe(true);
    expect(resultado.criadas.map((item) => item.id)).toEqual(["VAG-3", "VAG-1", "VAG-2"]);
    expect(resultado.criadas[0].historico.at(-1)?.descricao).toContain("ID técnico preservado");
  });

  it("permite transformação parcial", () => {
    const resultado = aplicarAlteracaoQuadroLegal(
      [vaga("VAG-1", "DISPONIVEL"), vaga("VAG-2", "OCUPADA")],
      {
        tipo: "TRANSFORMACAO",
        quantidade: 1,
        lei: "Lei de transformação",
        processo: "SEPLAG-PRO-TRANSFORMACAO",
        dataEfeito: "2026-08-01",
        novoCargo: "Cargo destino",
        quadroDestinoId: 9,
        quadroDestinoCodigo: "QA-DESTINO",
        maiorSequencialDestino: 0,
      },
    );

    expect(resultado.quantitativoPosterior).toBe(1);
    expect(resultado.alteradas).toHaveLength(1);
    expect(resultado.criadas).toHaveLength(1);
  });

  it("preserva o ID técnico e usa o órgão atual no novo Nome da vaga", () => {
    const origem = {
      ...vaga("VAG-ORIGEM", "DISPONIVEL"),
      orgaoDistribuicaoInicial: "SEPLAG",
      atoDistribuicaoInicial: "Decreto inicial",
      inicioVigenciaDistribuicao: "01/01/2026",
    };
    const resultado = aplicarAlteracaoQuadroLegal([origem], {
      tipo: "TRANSFORMACAO",
      quantidade: 1,
      lei: "Lei de transformação",
      processo: "SEPLAG-PRO-TRANSFORMACAO",
      dataEfeito: "2026-08-01",
      novoCargo: "Cargo destino",
      quadroDestinoId: 9,
      quadroDestinoCodigo: "QA-DESTINO",
      maiorSequencialDestino: 10,
      distribuicaoAtualPorVagaId: {
        "VAG-ORIGEM": {
          orgao: "SEFAZ",
          ato: "Decreto de redistribuição",
          inicioVigencia: "01/07/2026",
        },
      },
    });

    const transformada = resultado.criadas[0];
    expect(transformada.id).toBe("VAG-ORIGEM");
    expect(transformada.nome).toBe(gerarNomeVaga("SEFAZ", "Cargo destino", 11));
    expect(transformada.orgaoDistribuicaoInicial).toBe("SEFAZ");
    expect(transformada.atoDistribuicaoInicial).toBe("Decreto de redistribuição");
    expect(transformada.inicioVigenciaDistribuicao).toBe("01/07/2026");
  });
  it("mantém sem Nome da vaga quando a transformação continua pendente de distribuição", () => {
    const origem = {
      ...vaga("VAG-PENDENTE", "DISPONIVEL"),
      nome: undefined,
      orgaoDistribuicaoInicial: undefined,
    };
    const resultado = aplicarAlteracaoQuadroLegal([origem], {
      tipo: "TRANSFORMACAO",
      quantidade: 1,
      lei: "Lei de transformação",
      processo: "SEPLAG-PRO-TRANSFORMACAO",
      dataEfeito: "2026-08-01",
      novoCargo: "Cargo destino",
      quadroDestinoId: 9,
      quadroDestinoCodigo: "QA-DESTINO",
      maiorSequencialDestino: 10,
    });

    const transformada = resultado.criadas[0];
    expect(transformada.id).toBe("VAG-PENDENTE");
    expect(transformada.nome).toBeUndefined();
    expect(transformada.orgaoDistribuicaoInicial).toBeUndefined();
    expect(transformada.historico.at(-1)?.descricao).toContain("Nome da vaga não atribuído");
  });
  it("atualiza a base legal sem alterar vagas ou quantitativos", () => {
    const original = vaga("VAG-1", "DISPONIVEL");
    const resultado = aplicarAlteracaoQuadroLegal([original], {
      tipo: "ATUALIZACAO_BASE_LEGAL",
      lei: "Lei complementar atualizada",
      processo: "SEPLAG-PRO-LEGAL",
      dataEfeito: "2026-08-19",
    });

    expect(resultado.alertas).toEqual([]);
    expect(resultado.criadas).toEqual([]);
    expect(resultado.alteradas).toEqual([]);
    expect(resultado.vagas).toEqual([original]);
    expect(resultado.quantitativoAnterior).toBe(1);
    expect(resultado.quantitativoPosterior).toBe(1);
  });
});
