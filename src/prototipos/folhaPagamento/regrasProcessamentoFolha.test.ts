import { describe, expect, it } from "vitest";
import {
  abrangenciaVazia,
  type CatalogoAbrangencia,
} from "./abrangenciaGrupoCalculo";
import { normalizarCriteriosDaFolha } from "./abrangenciaFolhaPagamento";
import {
  ajustarProcessamento,
  campoProcessamentoBloqueado,
  criteriosDoProcessamento,
  opcoesProcessamento,
  parametrosExecucao,
  validarAbrangenciaProcessamento,
  valoresProcessamento,
} from "./regrasProcessamentoFolha";

const c: CatalogoAbrangencia = {
  regimes: [
    { value: "CIVIL", label: "Civil" },
    { value: "ESPECIAL", label: "Especial" },
  ],
  tipos: [
    { value: "EF", label: "Efetivo", regimes: ["CIVIL"], possuiCarreira: true },
    {
      value: "TEMP",
      label: "Temporário",
      regimes: ["ESPECIAL"],
      possuiCarreira: false,
    },
  ],
  orgaos: [
    { value: "O1", label: "Órgão 1" },
    { value: "O2", label: "Órgão 2" },
  ],
  unidades: [
    { value: "U1", label: "Unidade 1", orgao: "O1" },
    { value: "U2", label: "Unidade 2", orgao: "O2" },
  ],
  carreiras: [
    { value: "ADM", label: "Administração", orgaos: ["O1"] },
    { value: "EDU", label: "Educação", orgaos: ["O2"] },
  ],
  cargos: [
    {
      value: "A",
      label: "Analista",
      tipos: ["EF"],
      carreirasPorTipo: { EF: "ADM" },
    },
    {
      value: "P",
      label: "Professor",
      tipos: ["EF"],
      carreirasPorTipo: { EF: "EDU" },
    },
    {
      value: "T",
      label: "Auxiliar temporário",
      tipos: ["TEMP"],
      carreirasPorTipo: {},
    },
  ],
};
const original = {
  ...abrangenciaVazia(),
  regimes: ["CIVIL"],
  tipos: ["EF"],
  orgaos: ["O1", "O2"],
};
const folha = {
  abrangenciaRegimeJuridico: original.regimes,
  abrangenciaTipoVinculo: original.tipos,
  orgaos: original.orgaos,
};
const ids = (opcoes: { value: string }[]) => opcoes.map((o) => o.value);

describe("RN002 e RN003 — abrangência original", () => {
  it("mantém o original imutável e só configura campos vazios no Total", () => {
    const copia = structuredClone(original);
    expect(
      campoProcessamentoBloqueado("regimes", original, original, "TOTAL"),
    ).toBe(true);
    expect(
      campoProcessamentoBloqueado("carreiras", original, original, "TOTAL"),
    ).toBe(false);
    const novos = ajustarProcessamento(
      { ...original, carreiras: ["ADM"] },
      original,
      "TOTAL",
      c,
      "carreiras",
    );
    expect(novos.orgaos).toEqual(["O1", "O2"]);
    expect(novos.regimes).toEqual(["CIVIL"]);
    expect(
      ids(opcoesProcessamento(novos, original, "TOTAL", c).unidades),
    ).toEqual(["U1"]);
    expect(
      validarAbrangenciaProcessamento(
        { ...valoresProcessamento(novos), tipoExecucao: "TOTAL" },
        folha,
        c,
      ),
    ).toEqual({});
    expect(original).toEqual(copia);
  });
  it("impede alteração de campos originais mesmo com manipulação do formulário", () => {
    expect(
      validarAbrangenciaProcessamento(
        {
          ...valoresProcessamento(original),
          tipoExecucao: "TOTAL",
          orgaos: ["O1"],
        },
        folha,
        c,
      ).orgaos,
    ).toContain("originais");
    expect(
      ajustarProcessamento(
        { ...original, orgaos: ["O1"] },
        original,
        "TOTAL",
        c,
        "orgaos",
      ).orgaos,
    ).toEqual(["O1", "O2"]);
  });
  it("restringe o Parcial ao original e exige ao menos uma opção por critério parametrizado", () => {
    expect(
      ids(opcoesProcessamento(original, original, "PARCIAL", c).orgaos),
    ).toEqual(["O1", "O2"]);
    expect(
      opcoesProcessamento(original, original, "PARCIAL", c).cargos,
    ).toEqual([]);
    expect(
      campoProcessamentoBloqueado("cargos", original, original, "PARCIAL"),
    ).toBe(true);
    expect(
      validarAbrangenciaProcessamento(
        {
          ...valoresProcessamento(original),
          tipoExecucao: "PARCIAL",
          orgaos: ["O1"],
        },
        folha,
        c,
      ),
    ).toEqual({});
    expect(
      validarAbrangenciaProcessamento(
        {
          ...valoresProcessamento(original),
          tipoExecucao: "PARCIAL",
          orgaos: [],
        },
        folha,
        c,
      ).orgaos,
    ).toContain("ao menos uma");
    expect(
      validarAbrangenciaProcessamento(
        {
          ...valoresProcessamento(original),
          tipoExecucao: "PARCIAL",
          cargos: ["A"],
        },
        folha,
        c,
      ).cargos,
    ).toContain("original");
  });
});
describe("RN012 e RN013 — filtros combinados e bidirecionais", () => {
  it("filtra regime, vínculo, carreira, órgão e unidade a partir do cargo", () => {
    const atual = { ...abrangenciaVazia(), cargos: ["P"] };
    const opcoes = opcoesProcessamento(atual, abrangenciaVazia(), "TOTAL", c);
    expect(ids(opcoes.regimes)).toEqual(["CIVIL"]);
    expect(ids(opcoes.tipos)).toEqual(["EF"]);
    expect(ids(opcoes.carreiras)).toEqual(["EDU"]);
    expect(ids(opcoes.orgaos)).toEqual(["O2"]);
    expect(ids(opcoes.unidades)).toEqual(["U2"]);
  });
  it("filtra no sentido inverso a partir de unidade e de carreira", () => {
    const atual = { ...original, unidades: ["U2"] };
    const opcoes = opcoesProcessamento(atual, original, "TOTAL", c);
    expect(ids(opcoes.carreiras)).toEqual(["EDU"]);
    expect(ids(opcoes.cargos)).toEqual(["P"]);
    const inverso = opcoesProcessamento(
      { ...abrangenciaVazia(), carreiras: ["ADM"] },
      abrangenciaVazia(),
      "TOTAL",
      c,
    );
    expect(ids(inverso.cargos)).toEqual(["A"]);
    expect(ids(inverso.orgaos)).toEqual(["O1"]);
    expect(ids(inverso.tipos)).toEqual(["EF"]);
  });
  it("limpa unidades quando todos os órgãos são removidos e bloqueia o campo", () => {
    const base = { ...original, unidades: ["U1", "U2"] };
    const novos = ajustarProcessamento(
      { ...base, orgaos: [] },
      base,
      "PARCIAL",
      c,
      "orgaos",
    );
    expect(novos.unidades).toEqual([]);
    expect(
      campoProcessamentoBloqueado("unidades", novos, base, "PARCIAL"),
    ).toBe(true);
    expect(
      campoProcessamentoBloqueado(
        "unidades",
        { ...original, orgaos: [] },
        abrangenciaVazia(),
        "TOTAL",
      ),
    ).toBe(true);
  });
  it("reduz seleções dependentes no Parcial e nunca acrescenta opções externas", () => {
    const base = {
      ...original,
      carreiras: ["ADM", "EDU"],
      cargos: ["A", "P"],
      unidades: ["U1", "U2"],
    };
    const novos = ajustarProcessamento(
      { ...base, orgaos: ["O1"] },
      base,
      "PARCIAL",
      c,
      "orgaos",
    );
    expect(novos).toEqual({
      ...base,
      orgaos: ["O1"],
      carreiras: ["ADM"],
      cargos: ["A"],
      unidades: ["U1"],
    });
    expect(
      ajustarProcessamento(
        { ...novos, cargos: ["T"] },
        base,
        "PARCIAL",
        c,
        "cargos",
      ).cargos,
    ).toEqual([]);
  });
  it("trata cargos sem carreira pelos seus regimes e tipos sem inventar uma carreira", () => {
    const opcoes = opcoesProcessamento(
      { ...abrangenciaVazia(), cargos: ["T"] },
      abrangenciaVazia(),
      "TOTAL",
      c,
    );
    expect(ids(opcoes.tipos)).toEqual(["TEMP"]);
    expect(ids(opcoes.regimes)).toEqual(["ESPECIAL"]);
    expect(opcoes.carreiras).toEqual([]);
  });
});
it("envia critérios e competência inicial, mantendo Grupo de Eleitos independente", () => {
  const dados = {
    ...valoresProcessamento(original),
    tipoExecucao: "TOTAL" as const,
    competencia: "05/2026",
    grupoEleitos: "ELEITOS",
  };
  expect(parametrosExecucao(10, dados, c)).toEqual({
    folhaPagamentoId: 10,
    tipoExecucao: "TOTAL",
    competenciaInicial: "2026-05",
    criterios: original,
    grupoEleitos: "ELEITOS",
  });
  expect(
    criteriosDoProcessamento({ ...dados, grupoEleitos: "OUTRO" }, c),
  ).toEqual(original);
});
it("normaliza sem descartar critérios originais incompatíveis ou desconhecidos", () => {
  const base = normalizarCriteriosDaFolha(
    {
      ...folha,
      abrangenciaCarreiras: ["ADM"],
      abrangenciaCargos: ["INEXISTENTE"],
    },
    c,
  );
  expect(base.orgaos).toEqual(["O1", "O2"]);
  expect(base.cargos).toEqual(["INEXISTENTE"]);
  expect(
    validarAbrangenciaProcessamento(
      { ...valoresProcessamento(base), tipoExecucao: "TOTAL" },
      {
        ...folha,
        abrangenciaCarreiras: ["ADM"],
        abrangenciaCargos: ["INEXISTENTE"],
      },
      c,
    ).cargos,
  ).toContain("não encontrado");
});
it("preserva cargos legados sem metadados de tipo sem remover as restrições originais", () => {
  const catalogo = {
    ...c,
    cargos: [
      ...c.cargos,
      {
        value: "LEGADO",
        label: "Cargo legado",
        tipos: [],
        carreirasPorTipo: {},
      },
    ],
  };
  const base = { ...folha, abrangenciaCargos: ["LEGADO"] };
  const criterios = normalizarCriteriosDaFolha(base, catalogo);
  expect(
    validarAbrangenciaProcessamento(
      { ...valoresProcessamento(criterios), tipoExecucao: "TOTAL" },
      base,
      catalogo,
    ),
  ).toEqual({});
  expect(criterios.tipos).toEqual(["EF"]);
  expect(criterios.regimes).toEqual(["CIVIL"]);
  expect(criterios.cargos).toEqual(["LEGADO"]);
});
