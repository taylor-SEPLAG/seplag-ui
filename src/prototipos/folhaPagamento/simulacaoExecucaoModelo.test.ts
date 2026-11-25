// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  abrangenciaVazia,
  type CatalogoAbrangencia,
} from "./abrangenciaGrupoCalculo";
import {
  simularExecucao,
  type GrupoSimulacao,
  type VinculoSimulacao,
  type ParametrosSimulacao,
} from "./simulacaoExecucaoModelo";
import { consultarGruposCompetencia } from "./gruposCalculoCompetencia";
const catalogo: CatalogoAbrangencia = {
  regimes: [],
  tipos: [],
  carreiras: [],
  cargos: [],
  unidades: [],
  orgaos: [
    { value: "seplag", label: "SEPLAG" },
    { value: "seduc", label: "SEDUC" },
  ],
};
const grupo = (
  id = 1,
  orgaos: string[] = [],
  peso: number | null = 0,
): GrupoSimulacao => ({
  id,
  grupo: "Grupo " + id,
  versao: 1,
  competencia: "2026-05",
  inicioVigencia: "01/01/2026",
  fimVigencia: "-",
  situacao: "ATIVO",
  criterios: { ...abrangenciaVazia(), orgaos },
  peso,
  pendencias: 0,
});
const vinculo = (id = "1", orgao = "SEPLAG"): VinculoSimulacao => ({
  id,
  matricula: id,
  nome: "Servidor " + id,
  numero: "1",
  tipo: "Nomeado Efetivo",
  regime: "Estatutário Civil",
  orgao,
  setor: "Central",
  cargo: "Analista",
  carreira: "Gestão",
  inicio: "2023-01-01",
  termino: "",
  situacao: "Ativo",
});
const parametros: ParametrosSimulacao = {
  folhaPagamentoId: 1,
  competenciaInicial: "05/2026",
  tipoExecucao: "TOTAL",
  criterios: abrangenciaVazia(),
};
beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());
it("localiza grupos antes dos vínculos e não consulta vínculos se nenhum grupo é aplicável", () => {
  const consultar = vi.fn(() => [vinculo()]);
  const resultado = simularExecucao(
    parametros,
    { grupos: () => [], vinculos: consultar },
    catalogo,
  );
  expect(consultar).not.toHaveBeenCalled();
  expect(resultado.total).toBeNull();
  expect(resultado.grupos).toEqual([]);
  expect(resultado.apta).toBe(false);
});
it("distingue grupos sem vínculos de ausência de grupo e mantém todos os grupos com zero", () => {
  const r = simularExecucao(
    parametros,
    { grupos: () => [grupo(1, ["seduc"])], vinculos: () => [vinculo()] },
    catalogo,
  );
  expect(r.grupos).toHaveLength(1);
  expect(r.total).toBe(0);
  expect(r.grupos[0].vinculosIds).toEqual([]);
  expect(r.apta).toBe(false);
});
it("atribui cada vínculo somente ao grupo de maior peso sem duplicar totais", () => {
  const grupos = [grupo(), grupo(2, ["seplag"], 10), grupo(3, ["seduc"], 20)],
    vinculos = [vinculo(), vinculo(), vinculo("2", "SEDUC")],
    antes = JSON.stringify({ grupos, vinculos });
  const r = simularExecucao(
    parametros,
    { grupos: () => grupos, vinculos: () => vinculos },
    catalogo,
  );
  expect(r.total).toBe(2);
  expect(r.grupos.map((g) => g.vinculosIds.length)).toEqual([0, 1, 1]);
  expect(r.apta).toBe(true);
  expect(JSON.stringify({ grupos, vinculos })).toBe(antes);
});
it("considera competência, versões, vigência, situação e filtros antes da busca dos vínculos", () => {
  const consultar = vi.fn(() => [vinculo()]);
  const g = grupo();
  const r = simularExecucao(
    { ...parametros, criterios: { ...abrangenciaVazia(), orgaos: ["seduc"] } },
    {
      grupos: () => [
        { ...g, criterios: { ...abrangenciaVazia(), orgaos: ["seplag"] } },
        { ...g, id: 2, situacao: "RASCUNHO" },
        { ...g, id: 3, inicioVigencia: "01/06/2026" },
        { ...g, id: 4, fimVigencia: "30/04/2026" },
      ],
      vinculos: consultar,
    },
    catalogo,
  );
  expect(r.total).toBeNull();
  expect(consultar).not.toHaveBeenCalled();
  const versoes = simularExecucao(
    parametros,
    {
      grupos: () => [
        g,
        { ...g, versao: 2 },
        { ...g, versao: 3, situacao: "RASCUNHO" },
      ],
      vinculos: () => [vinculo()],
    },
    catalogo,
  );
  expect(versoes.grupos.map((g) => g.versao)).toEqual([2]);
});
it("filtra vínculos pelo período e pelo Grupo de Eleitos", () => {
  const r = simularExecucao(
    { ...parametros, grupoEleitos: "Selecionados" },
    {
      grupos: () => [grupo()],
      eleitos: () => ["1", "3", "4"],
      vinculos: () => [
        vinculo(),
        vinculo("2"),
        { ...vinculo("3"), inicio: "2026-06-01" },
        { ...vinculo("4"), situacao: "Encerrado", vacanciaData: "2026-04-30" },
      ],
    },
    catalogo,
  );
  expect(r.total).toBe(1);
  expect(r.grupos[0].vinculosIds).toEqual(["1"]);
  const consultar = vi.fn(() => [vinculo()]);
  const semComposicao = simularExecucao(
    { ...parametros, grupoEleitos: "Desconhecido" },
    { grupos: () => [grupo()], vinculos: consultar },
    catalogo,
  );
  expect(semComposicao.apta).toBe(false);
  expect(semComposicao.impedimentos[0]).toContain("composição");
  expect(consultar).not.toHaveBeenCalled();
});
it("bloqueia empates, falta de peso em sobreposição e pendências funcionais", () => {
  for (const pesos of [
    [1, 1],
    [1, null],
  ]) {
    const r = simularExecucao(
      parametros,
      {
        grupos: () => [grupo(1, [], pesos[0]), grupo(2, [], pesos[1])],
        vinculos: () => [vinculo()],
      },
      catalogo,
    );
    expect(r.apta).toBe(false);
    expect(r.impedimentos.length).toBeGreaterThan(0);
    expect(r.total).toBe(0);
  }
  const r = simularExecucao(
    parametros,
    {
      grupos: () => [{ ...grupo(), pendencias: 1 }],
      vinculos: () => [vinculo()],
    },
    catalogo,
  );
  expect(r.apta).toBe(false);
  expect(r.impedimentos[0]).toContain("pendências");
});
it("consulta grupos sem migrar, gravar ou replicar competências", () => {
  const base = {
    id: 1,
    grupo: "Grupo",
    situacao: "ATIVO",
    inicioVigencia: "01/01/2026",
    fimVigencia: "-",
    versao: 1,
  };
  const salvar = vi.spyOn(Storage.prototype, "setItem");
  expect(consultarGruposCompetencia("2026-05", [base], {})).toHaveLength(1);
  expect(salvar).not.toHaveBeenCalled();
  expect(localStorage.length).toBe(0);
  localStorage.setItem(
    "sigep:grupos-calculo:competencias:v1",
    JSON.stringify({ "2026-05": { grupos: [], versoes: {} } }),
  );
  salvar.mockClear();
  expect(consultarGruposCompetencia("2026-05", [base], {})).toEqual([]);
  expect(consultarGruposCompetencia("2026-06", [base], {})).toEqual([]);
  expect(salvar).not.toHaveBeenCalled();
});
it("rejeita períodos inválidos antes de consultar dados", () => {
  const consulta = vi.fn(() => []);
  expect(() =>
    simularExecucao(
      {
        ...parametros,
        competenciaInicial: "06/2026",
        competenciaFinal: "05/2026",
      },
      { grupos: consulta, vinculos: () => [] },
      catalogo,
    ),
  ).toThrow("período");
  expect(consulta).not.toHaveBeenCalled();
});
