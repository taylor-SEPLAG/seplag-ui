import { describe, expect, it } from "vitest";
import {
  abrangenciaVazia,
  ajustarAbrangencia,
  filtrarVinculosElegiveis,
  opcoesAbrangencia,
  temAbrangencia,
  type CatalogoAbrangencia,
} from "./abrangenciaGrupoCalculo";

const catalogo: CatalogoAbrangencia = {
  regimes: [
    { value: "Civil", label: "Civil" },
    { value: "Misto", label: "Misto" },
    { value: "Especial", label: "Especial" },
  ],
  tipos: [
    {
      value: "efe",
      label: "Efetivo",
      regimes: ["Civil", "Misto"],
      possuiCarreira: true,
    },
    {
      value: "com",
      label: "Comissionado",
      regimes: ["Misto"],
      possuiCarreira: false,
    },
    {
      value: "temp",
      label: "Temporário",
      regimes: ["Especial"],
      possuiCarreira: false,
    },
  ],
  carreiras: [
    { value: "ADM", label: "Administração", orgaos: ["seplag", "sefaz"] },
    { value: "EDU", label: "Educação", orgaos: ["seduc"] },
  ],
  orgaos: ["seplag", "sefaz", "seduc"].map((value) => ({
    value,
    label: value.toUpperCase(),
  })),
  unidades: [
    { value: "u1", label: "Unidade Central", orgao: "seplag" },
    { value: "u2", label: "Escola", orgao: "seduc" },
  ],
  cargos: [
    {
      value: "analista",
      label: "Analista",
      tipos: ["efe"],
      carreirasPorTipo: { efe: "ADM" },
    },
    {
      value: "prof",
      label: "Professor",
      tipos: ["efe"],
      carreirasPorTipo: { efe: "EDU" },
    },
    {
      value: "assessor",
      label: "Assessor",
      tipos: ["com"],
      carreirasPorTipo: {},
    },
    {
      value: "auxiliar",
      label: "Auxiliar",
      tipos: ["temp"],
      carreirasPorTipo: {},
    },
  ],
};
const base = () => abrangenciaVazia();
describe("abrangência do grupo de cálculo", () => {
  it("lista todos os cadastros quando não há restrições", () => {
    const opcoes = opcoesAbrangencia(base(), catalogo);
    for (const campo of Object.keys(base()) as (keyof ReturnType<
      typeof base
    >)[])
      expect(opcoes[campo]).toHaveLength(catalogo[campo].length);
    expect(temAbrangencia(base())).toBe(false);
    expect(temAbrangencia({ ...base(), cargos: ["prof"] })).toBe(true);
  });
  it("aceita vários regimes por tipo e união das seleções de um mesmo filtro", () => {
    expect(
      opcoesAbrangencia({ ...base(), regimes: ["Misto"] }, catalogo).tipos.map(
        (t) => t.value,
      ),
    ).toEqual(["efe", "com"]);
    expect(
      opcoesAbrangencia(
        { ...base(), regimes: ["Civil", "Especial"] },
        catalogo,
      ).tipos.map((t) => t.value),
    ).toEqual(["efe", "temp"]);
  });
  it("remove seleções incompatíveis em cascata e mantém as demais", () => {
    const anteriores = {
      ...base(),
      regimes: ["Civil"],
      tipos: ["com", "efe"],
      carreiras: ["ADM"],
      orgaos: ["seplag", "seduc"],
      unidades: ["u1", "u2"],
      cargos: ["analista", "assessor"],
    };
    expect(ajustarAbrangencia(anteriores, catalogo)).toEqual({
      ...anteriores,
      tipos: ["efe"],
      orgaos: ["seplag"],
      unidades: ["u1"],
      cargos: ["analista"],
    });
    const alterados = ajustarAbrangencia(
      { ...anteriores, regimes: ["Especial"] },
      catalogo,
    );
    expect(alterados.tipos).toEqual([]);
    expect(alterados.carreiras).toEqual([]);
    expect(alterados.cargos).toEqual([]);
  });
  it("desconsidera carreira para vínculos sem carreira e mantém opções ao limpar o pai", () => {
    const f = ajustarAbrangencia(
      { ...base(), tipos: ["com"], carreiras: ["ADM"] },
      catalogo,
    );
    expect(f.carreiras).toEqual([]);
    expect(opcoesAbrangencia(f, catalogo).carreiraAtiva).toBe(false);
    expect(opcoesAbrangencia(f, catalogo).cargos.map((c) => c.value)).toEqual([
      "assessor",
    ]);
    expect(
      opcoesAbrangencia(
        { ...base(), orgaos: ["seduc"] },
        catalogo,
      ).unidades.map((u) => u.value),
    ).toEqual(["u2"]);
    expect(opcoesAbrangencia(base(), catalogo).unidades).toHaveLength(2);
  });
  it("combina tipo, carreira, órgão, unidade e cargo para identificar vínculos elegíveis", () => {
    const vinculo = {
      id: "1",
      tipo: "Efetivo",
      regime: "Civil",
      carreira: "Administração",
      orgao: "SEPLAG",
      setor: "Unidade Central",
      cargo: "Analista",
    };
    const registros = [
      vinculo,
      { ...vinculo, id: "2", orgao: "SEDUC" },
      {
        ...vinculo,
        id: "3",
        tipo: "Comissionado",
        cargo: "Assessor",
        carreira: "",
      },
    ];
    const filtros = {
      regimes: ["Civil"],
      tipos: ["efe"],
      carreiras: ["ADM"],
      orgaos: ["seplag"],
      unidades: ["u1"],
      cargos: ["analista"],
    };
    expect(
      filtrarVinculosElegiveis(registros, filtros, catalogo).map((v) => v.id),
    ).toEqual(["1"]);
    expect(filtrarVinculosElegiveis(registros, base(), catalogo)).toHaveLength(
      3,
    );
    expect(
      filtrarVinculosElegiveis(
        registros,
        { ...base(), tipos: ["com"] },
        catalogo,
      ).map((v) => v.id),
    ).toEqual(["3"]);
  });
});
