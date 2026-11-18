import ExcelJS from "exceljs";
import { expect, it } from "vitest";
import {
  importarPlanilha,
  separarPessoas,
  textoCelula,
  urlSegura,
} from "./importacao";

it("identifica cabeçalhos por nome, exclui histórico e Sprint 24 e une duplicidades", async () => {
  const livro = new ExcelJS.Workbook(),
    aba = livro.addWorksheet("SPRINT 23 - ATUAL");
  aba.addRow([
    "Pontos",
    "Dev",
    "US",
    "SPRINT",
    "Analista",
    "Módulo",
    "Squad",
    "Andamento",
    "Complexidade",
  ]);
  aba.addRow([
    null,
    "1 - Ana",
    "US001 - História antiga",
    "02/09/2026 - 17/09/2026",
    "Taylor",
    "Pessoas",
    "1",
    null,
    13,
  ]);
  aba.addRow([
    null,
    "1 - Ana, 2 - Bruno",
    "US002 - História atual",
    "16/11/2026 - 01/12/2026",
    "Isabeli",
    "Folha",
    "1, 2",
    "Em andamento",
    5,
  ]);
  aba.addRow([
    null,
    "3 - Carla",
    "US002 - História atual",
    "16/11/2026 - 01/12/2026",
    "Isabeli",
    "Folha",
    "3",
    null,
    5,
  ]);
  aba.addRow([
    null,
    "Ana",
    "[US REMOVIDA-NÃO DESENVOLVER] US003",
    "16/11/2026 - 01/12/2026",
    "Isabeli",
    "Folha",
    "1",
    null,
    3,
  ]);
  aba.addRow([null, null, "US004 - Sem período", null, "Taylor"]);
  livro.addWorksheet("SPRINT 24").addRows([
    ["US", "SPRINT"],
    ["US999 - Não importar", "03/12/2026 - 17/12/2026"],
  ]);
  livro.addWorksheet("BACKLOG SIGEP").addRows([
    ["US", "SPRINT"],
    ["US998 - Não importar", "16/11/2026 - 01/12/2026"],
  ]);
  const dados = await importarPlanilha(
    await livro.xlsx.writeBuffer(),
    "exemplo.xlsx",
  );
  expect(dados.historias).toHaveLength(1);
  expect(dados.historias[0]).toMatchObject({
    codigo: "US002",
    sprint: 23,
    pontos: 5,
    desenvolvedores: ["Ana", "Bruno", "Carla"],
    squads: ["1", "2", "3"],
    linhas: [3, 4],
  });
  expect(dados.historicosIgnorados).toBe(2);
  expect(dados.removidas).toBe(1);
  expect(dados.avisos.some((a) => a.tipo === "duplicidade")).toBe(true);
});
it("usa o início da sprint e o término predominante, preservando o ano original inconsistente", async () => {
  const livro = new ExcelJS.Workbook(),
    aba = livro.addWorksheet("SPRINT 21");
  aba.addRows([
    ["US", "SPRINT", "Complexidade"],
    ["US001 - Uma", "07/10/2026 - 22/10/2026", null],
    ["US002 - Outra", "07/10/2026 - 22/10/2015", "3,5"],
  ]);
  const dados = await importarPlanilha(
    await livro.xlsx.writeBuffer(),
    "datas.xlsx",
  );
  expect(dados.historias).toHaveLength(2);
  expect(dados.sprints[0].fim).toBe("2026-10-22");
  expect(dados.historias[1].periodoOriginal).toContain("2015");
  expect(dados.historias[1].pontos).toBe(3.5);
  expect(dados.historias[0].pontos).toBeNull();
  expect(dados.avisos.find((a) => a.tipo === "periodo")?.linhas).toEqual([3]);
});
it("mantém as férias apenas na Sprint 23 ao reimportar a planilha", async () => {
  const livro = new ExcelJS.Workbook();
  livro.addWorksheet("SPRINT 22").addRows([
    ["US", "SPRINT", "Complexidade"],
    ["US302 - Gestão de Férias", "23/10/2026 - 11/11/2026", 8],
  ]);
  livro.addWorksheet("SPRINT 23").addRows([
    ["US", "SPRINT", "Complexidade"],
    ["US302 - Gestão de Férias", "16/11/2026 - 01/12/2026", 8],
    ["US400 - Outra história", "16/11/2026 - 01/12/2026", 5],
  ]);
  const dados = await importarPlanilha(
    await livro.xlsx.writeBuffer(),
    "reimportada.xlsx",
  );
  expect(dados.historias.map((h) => [h.codigo, h.sprint])).toEqual([
    ["US302", 23],
    ["US400", 23],
  ]);
  expect(dados.replanejadas).toHaveLength(1);
  expect(dados.replanejadas![0]).toMatchObject({
    historia: { codigo: "US302", sprint: 22, pontos: 8, linhas: [2] },
    sprintDestino: 23,
  });
  expect(dados.removidas).toBe(0);
});
it("rejeita fontes sem as abas do recorte e não executa conteúdo de células", async () => {
  const livro = new ExcelJS.Workbook();
  livro.addWorksheet("BACKLOG").addRows([
    ["US", "Sprint"],
    ["US001 - Fora do recorte", "01/01/2026 - 02/01/2026"],
  ]);
  await expect(
    importarPlanilha(await livro.xlsx.writeBuffer(), "sem-sprints.xlsx"),
  ).rejects.toThrow("Sprints 18 a 23");
  expect(
    textoCelula({
      text: { richText: [{ text: "US001" }, { text: " — Detalhes" }] },
      hyperlink: "javascript:alert(1)",
    }),
  ).toBe("US001 — Detalhes");
  expect(
    urlSegura({ text: "abrir", hyperlink: "javascript:alert(1)" }),
  ).toBeNull();
  expect(urlSegura({ hyperlink: "http://redmine/issues/123" })).toBe(
    "http://redmine/issues/123",
  );
  expect(separarPessoas("1 - Ana, 2 - Bruno\n3 - Ana")).toEqual([
    "Ana",
    "Bruno",
  ]);
});
