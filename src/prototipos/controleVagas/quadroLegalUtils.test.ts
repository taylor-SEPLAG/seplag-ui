import { describe, expect, it } from "vitest";
import { encerrarOcupacao, registrarEfetivoExercicio } from "./ocupacoes";
import {
  aplicarAlteracaoQuadroLegal,
  reconciliarQuadroAposVacanciaEmExtincao,
} from "./quadroLegalUtils";
import type { OcupacaoVaga, QuadroAutorizadoRow, Vaga } from "./types";

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
        quantidade: 99,
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
