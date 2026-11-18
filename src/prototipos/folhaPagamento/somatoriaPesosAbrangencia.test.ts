// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { abrangenciaVazia } from "./abrangenciaGrupoCalculo";
import { calcularSomatoriaPesosAbrangencia } from "./somatoriaPesosAbrangencia";
import {
  carregarVersoesPesosAbrangencia,
  type VersaoPesosAbrangencia,
} from "./pesosAbrangenciasStore";
import { salvarGrupoCompetencia } from "./gruposCalculoCompetencia";

const versao: VersaoPesosAbrangencia = {
  numero: 2,
  inicio: "2026-11-16T12:00:00Z",
  fim: null,
  pesos: [10, 4, 3, 2, 1, 6],
};
afterEach(() => localStorage.clear());

it("soma cada critério preenchido uma vez, sem multiplicar pelas opções selecionadas", () => {
  const criterios = {
    ...abrangenciaVazia(),
    regimes: ["R1", "R2"],
    tipos: ["T1", "T2", "T3"],
    orgaos: ["O1", "O2"],
  };
  expect(calcularSomatoriaPesosAbrangencia(criterios, versao)).toEqual({
    versao: 2,
    total: 17,
  });
  expect(
    calcularSomatoriaPesosAbrangencia(
      { ...abrangenciaVazia(), carreiras: ["C1"], cargos: ["CG1"] },
      versao,
    ),
  ).toEqual({ versao: 2, total: 8 });
  expect(
    calcularSomatoriaPesosAbrangencia(
      { ...criterios, unidades: ["U1"], carreiras: ["C1"], cargos: ["CG1"] },
      versao,
    )?.total,
  ).toBe(26);
});

it("zera ao limpar os critérios e não inventa uma versão quando não há parametrização", () => {
  expect(calcularSomatoriaPesosAbrangencia(abrangenciaVazia(), versao)).toEqual(
    { versao: 2, total: 0 },
  );
  expect(
    calcularSomatoriaPesosAbrangencia({
      ...abrangenciaVazia(),
      regimes: ["R1"],
    }),
  ).toBeUndefined();
});

it("preserva pesos históricos e aceita a versão legada sem peso de cargo", () => {
  const legada = { ...versao, numero: 1, pesos: [100, 40, 30, 20, 10] };
  expect(carregarVersoesPesosAbrangencia(JSON.stringify([legada]))).toEqual([
    legada,
  ]);
  expect(
    calcularSomatoriaPesosAbrangencia(
      { ...abrangenciaVazia(), cargos: ["CG1"], unidades: ["U1"] },
      legada,
    ),
  ).toEqual({ versao: 1, total: 10 });
  expect(() => carregarVersoesPesosAbrangencia("[null]")).toThrow(
    "Dados inválidos",
  );
});

it("soma pesos fracionados sem exibir resíduos de ponto flutuante", () => {
  expect(
    calcularSomatoriaPesosAbrangencia(
      { ...abrangenciaVazia(), orgaos: ["O1"], regimes: ["R1"] },
      { ...versao, pesos: [0.1, 0.2, 0, 0, 0, 0] },
    )?.total,
  ).toBe(0.3);
});

it("preserva a versão dos pesos e a soma da versão anterior ao versionar um grupo", () => {
  const criterios = { ...abrangenciaVazia(), regimes: ["R1"] };
  const grupo = {
    id: 123,
    grupo: "Grupo",
    situacao: "ATIVO",
    inicioVigencia: "01/05/2026",
    fimVigencia: "-",
    abrangencia: criterios,
    pesosAplicados: calcularSomatoriaPesosAbrangencia(criterios, versao),
  };
  salvarGrupoCompetencia("2026-05", grupo);
  const nova = { ...versao, numero: 3, pesos: [10, 7, 3, 2, 1, 6] };
  salvarGrupoCompetencia(
    "2026-05",
    {
      ...grupo,
      inicioVigencia: "10/05/2026",
      pesosAplicados: calcularSomatoriaPesosAbrangencia(criterios, nova),
    },
    true,
  );
  const dados = JSON.parse(
    localStorage.getItem("sigep:grupos-calculo:competencias:v1")!,
  );
  expect(
    dados["2026-05"].versoes[123].map((g: typeof grupo) => g.pesosAplicados),
  ).toEqual([
    { versao: 3, total: 7 },
    { versao: 2, total: 4 },
  ]);
  expect(grupo.pesosAplicados).toEqual({ versao: 2, total: 4 });
});
