import { expect, it } from "vitest";
import base from "./dados-iniciais.json";
import { textoExecutivo } from "./exportacoes";
import { filtrarHistorias, filtrosIniciais } from "./modelo";
import type { DadosProjeto } from "./types";

it("preserva a primeira aparição no recorte mesmo quando o filtro de pessoa oculta a associação anterior", () => {
  const referencia = (base as DadosProjeto).historias[0];
  const historias = [
    {
      ...referencia,
      id: "S18-US999",
      codigo: "US999",
      sprint: 18,
      desenvolvedores: ["Ana"],
    },
    {
      ...referencia,
      id: "S19-US999",
      codigo: "US999",
      sprint: 19,
      desenvolvedores: ["Bruno"],
    },
  ];
  const dados = {
    ...base,
    historias,
    sprints: (base as DadosProjeto).sprints.filter(
      (s) => s.numero === 18 || s.numero === 19,
    ),
  } as DadosProjeto;
  const filtros = { ...filtrosIniciais(dados), desenvolvedor: "Bruno" };
  expect(textoExecutivo(dados, [historias[1]], filtros)).toContain(
    "1 reaparições",
  );
});
it("não transforma a ausência de estimativa em zero nos relatórios e preserva zero explicitamente informado", () => {
  const dados = base as DadosProjeto,
    filtros = filtrosIniciais(dados),
    historia = dados.historias[0];
  expect(
    textoExecutivo(dados, [{ ...historia, pontos: null }], filtros),
  ).toContain("Pontos estimados: Não informado");
  expect(
    textoExecutivo(dados, [{ ...historia, pontos: 0 }], filtros),
  ).toContain("Pontos estimados: 0");
});
it("preserva as remanescentes da Sprint 22 no relatório filtrado apenas pela Sprint 23", () => {
  const dados = base as DadosProjeto;
  const filtros = { ...filtrosIniciais(dados), inicial: 23, final: 23 };
  expect(
    textoExecutivo(dados, filtrarHistorias(dados, filtros), filtros),
  ).toContain("4 reaparições");
  const danielle = { ...filtros, analista: "Danielle" };
  expect(
    textoExecutivo(dados, filtrarHistorias(dados, danielle), danielle),
  ).toContain("3 reaparições");
});
it("informa equipe e capacity por sprint com jornada de 8 horas", () => {
  const dados = base as DadosProjeto;
  const filtros = filtrosIniciais(dados);
  const texto = textoExecutivo(dados, dados.historias, filtros);
  expect(texto).toContain(
    "Desenvolvedores disponíveis no período: 12 nomes distintos",
  );
  expect(texto).toContain("Jornada diária: 8 h por desenvolvedor.");
  expect(texto).toContain("Capacity bruta planejada no período: 4.880 h.");
  expect(texto).toContain("capacity diária: 88 h; capacity bruta: 1.056 h.");
  for (const [sprint, quantidade] of [
    [18, 7],
    [19, 7],
    [20, 7],
    [21, 7],
    [22, 12],
    [23, 11],
  ]) {
    expect(texto).toContain(
      `Sprint ${sprint}: ${quantidade} desenvolvedores disponíveis.`,
    );
  }
  const sprint22 = { ...filtros, inicial: 22, final: 22 };
  const filtrado = textoExecutivo(
    dados,
    filtrarHistorias(dados, sprint22),
    sprint22,
  );
  expect(filtrado).toContain("Sprint 22: 12 desenvolvedores disponíveis.");
  expect(filtrado).toContain("Capacity bruta planejada no período: 1.248 h.");
  expect(filtrado).not.toContain("Sprint 23: 11 desenvolvedores disponíveis.");
  expect(filtrado).not.toContain("headcount disponível");
});
