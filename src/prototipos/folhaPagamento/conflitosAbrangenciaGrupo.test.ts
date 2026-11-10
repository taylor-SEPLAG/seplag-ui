import { expect, it } from "vitest";
import {
  abrangenciaVazia,
  type CatalogoAbrangencia,
  type CriteriosAbrangencia,
} from "./abrangenciaGrupoCalculo";
import {
  abrangenciaLegadaGrupo,
  identificarConflitosAbrangencia,
  type GrupoParaConflito,
} from "./conflitosAbrangenciaGrupo";

const catalogo: CatalogoAbrangencia = {
  regimes: [{ value: "R", label: "Regime" }],
  tipos: [
    { value: "T", label: "Efetivo", regimes: ["R"], possuiCarreira: true },
  ],
  carreiras: [],
  cargos: [],
  orgaos: ["seduc", "seplag", "pge"].map((value) => ({
    value,
    label: value.toUpperCase(),
  })),
  unidades: [
    { value: "U1", label: "Unidade SEDUC", orgao: "seduc" },
    { value: "U2", label: "Unidade PGE", orgao: "pge" },
  ],
};
const grupo = (
  id: number,
  criterios: Partial<CriteriosAbrangencia> = {},
  extra: Partial<GrupoParaConflito> = {},
): GrupoParaConflito => ({
  id,
  grupo: `Grupo ${id}`,
  competencia: "2026-11",
  situacao: "ATIVO",
  abrangencia: { ...abrangenciaVazia(), ...criterios },
  ...extra,
});
const verificar = (atual: GrupoParaConflito, grupos: GrupoParaConflito[]) =>
  identificarConflitosAbrangencia(atual, grupos, "2026-11", catalogo);

it("lista todos os grupos com sobreposição parcial e os valores da interseção", () => {
  const atual = grupo(1, { orgaos: ["seduc", "seplag"] });
  const conflitos = verificar(atual, [
    grupo(2, { orgaos: ["seplag", "pge"] }),
    grupo(3, { orgaos: ["seduc"] }),
  ]);
  expect(conflitos).toHaveLength(2);
  expect(conflitos[0].criterios).toEqual([
    { campo: "orgaos", valores: ["seplag"] },
  ]);
});
it("ignora a própria versão, competências diferentes e versões encerradas", () => {
  const atual = grupo(1, { regimes: ["R"] });
  expect(
    verificar(atual, [
      atual,
      grupo(2, { regimes: ["R"] }, { competencia: "2026-10" }),
      grupo(3, { regimes: ["R"] }, { situacao: "ENCERRADO" }),
    ]),
  ).toEqual([]);
});
it("não considera conflitantes grupos com órgãos distintos", () => {
  expect(
    verificar(grupo(1, { orgaos: ["seduc"] }), [grupo(2, { orgaos: ["pge"] })]),
  ).toEqual([]);
});
it("permite filho mais específico mesmo quando critérios do pai são herdados implicitamente", () => {
  const pai = grupo(1, { regimes: ["R"], tipos: ["T"] });
  const filho = grupo(2, { orgaos: ["seduc"] }, { herdaDe: pai.grupo });
  expect(verificar(filho, [pai, filho])).toEqual([]);
  expect(verificar(pai, [pai, filho])).toEqual([]);
});
it("permite sobreposição válida ao longo de múltiplos níveis", () => {
  const pai = grupo(1, { tipos: ["T"] });
  const filho = grupo(2, { orgaos: ["seduc"] }, { herdaDe: pai.grupo });
  const neto = grupo(3, { unidades: ["U1"] }, { herdaDe: filho.grupo });
  expect(verificar(neto, [pai, filho, neto])).toEqual([]);
  expect(verificar(pai, [pai, filho, neto])).toEqual([]);
});
it("bloqueia pai e filho com configurações idênticas", () => {
  const pai = grupo(1, { tipos: ["T"] });
  const filho = grupo(2, {}, { herdaDe: pai.grupo });
  expect(verificar(filho, [pai, filho]).map((g) => g.id)).toEqual([1]);
});
it("não confunde unidades e órgãos incompatíveis com uma sobreposição real", () => {
  expect(
    verificar(grupo(1, { unidades: ["U1"] }), [grupo(2, { orgaos: ["pge"] })]),
  ).toEqual([]);
});
it("bloqueia a sobreposição entre irmãos mesmo que ambos sejam mais restritos que o pai", () => {
  const pai = grupo(1, { tipos: ["T"] });
  const filho = grupo(2, { orgaos: ["seduc", "pge"] }, { herdaDe: pai.grupo });
  const irmao = grupo(3, { orgaos: ["pge"] }, { herdaDe: pai.grupo });
  expect(verificar(filho, [pai, filho, irmao]).map((g) => g.id)).toEqual([3]);
});

it("reconhece os tipos legados sem converter Contratados e Comissionados em abrangência universal", () => {
  const catalogoCompleto: CatalogoAbrangencia = {
    ...catalogo,
    tipos: [
      ...catalogo.tipos,
      {
        value: "TEMP",
        label: "Contrato Temporário",
        regimes: ["R"],
        possuiCarreira: false,
      },
      {
        value: "TEMP_UNICO",
        label: "Contrato Temporário Vínculo Único",
        regimes: ["R"],
        possuiCarreira: false,
      },
      {
        value: "COM",
        label: "Exclusivamente Comissionado",
        regimes: ["R"],
        possuiCarreira: false,
      },
    ],
  };
  const contratado = abrangenciaLegadaGrupo(
    { tipoVinculo: "Contratado", orgaoSetor: "Todos" },
    catalogoCompleto,
  );
  const comissionado = abrangenciaLegadaGrupo(
    { tipoVinculo: "Comissionado", orgaoSetor: "Todos" },
    catalogoCompleto,
  );
  expect(contratado.tipos).toEqual(["TEMP", "TEMP_UNICO"]);
  expect(comissionado.tipos).toEqual(["COM"]);
  const efetivos = grupo(1, { tipos: ["T"] });
  expect(
    identificarConflitosAbrangencia(
      efetivos,
      [grupo(2, contratado), grupo(3, comissionado)],
      "2026-11",
      catalogoCompleto,
    ),
  ).toEqual([]);
});

it("preserva critérios explícitos salvos em vez de substituí-los pela descrição antiga", () => {
  const criterios = { ...abrangenciaVazia(), tipos: ["T"], orgaos: ["pge"] };
  expect(
    abrangenciaLegadaGrupo(
      {
        abrangencia: criterios,
        tipoVinculo: "Contratado",
        orgaoSetor: "SEDUC",
      },
      catalogo,
    ),
  ).toEqual(criterios);
});
