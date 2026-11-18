import { expect, it } from "vitest";
import base from "./dados-iniciais.json";
import { textoExecutivo } from "./exportacoes";
import { filtrosIniciais } from "./modelo";
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
