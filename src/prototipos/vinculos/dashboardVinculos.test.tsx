import { criarExcelVinculos } from "./exportarDashboardVinculos";
// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { DashboardVinculosPage } from "./DashboardVinculosPage";
import {
  VinculoV2ConsultaPage,
  VinculoV2DetalhesPage,
  type Vinculo,
} from "./VinculoV2Page";
import { resumoVinculos } from "./dashboardVinculosModel";
import {
  filtrarVinculos,
  filtrosVinculosVazios,
  urlConsultaVinculos,
} from "./vinculosConsulta";

const criar = (id: string, campos: Partial<Vinculo> = {}): Vinculo => ({
  id,
  tipo: "Contrato Temporário",
  nome: "Servidor de Teste",
  cpf: "123.456.789-00",
  nascimento: "01/01/1990",
  matricula: id,
  numero: "1",
  regime: "Regime Especial",
  carreira: "Saúde",
  cargo: "Técnico",
  perfil: "Saúde",
  jornada: "40 horas",
  orgao: "Órgão de Teste",
  setor: "Unidade de Teste",
  inicio: "2020-01-01",
  termino: "2021-01-01",
  situacao: "Ativo",
  ...campos,
});
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

it("distingue pessoas únicas e vínculos e não considera data fim prevista como vacância", () => {
  const lista = [
    criar("1"),
    criar("2", { cpf: "12345678900" }),
    criar("3", { vacanciaData: "2026-01-10", vacanciaForma: "Aposentadoria" }),
  ];
  const resumo = resumoVinculos(lista, ["Contrato Temporário"]);
  expect(resumo).toMatchObject({
    total: 3,
    vigentes: 2,
    encerrados: 1,
    pessoasVigentes: 1,
    pessoasEncerradas: 1,
  });
  expect(resumo.linhas[0]).toMatchObject({
    total: 3,
    principalForma: "Aposentadoria",
  });
});

it("exige os dois dados de vacância e filtra datas inclusivamente, mesmo com data futura", () => {
  const lista = [
    criar("1", { vacanciaData: "2026-01-01" }),
    criar("2", { vacanciaForma: "Exoneração" }),
    criar("3", {
      vacanciaData: "2026-01-01",
      vacanciaForma: "Término de contrato",
    }),
    criar("4", {
      vacanciaData: "2026-12-31",
      vacanciaForma: "Término de Contrato",
    }),
    criar("5", { vacanciaData: "2999-01-01", vacanciaForma: "Aposentadoria" }),
  ];
  const filtros = {
    ...filtrosVinculosVazios,
    situacao: "Encerrado",
    forma: "Término de Contrato",
    inicio: "2026-01-01",
    fim: "2026-12-31",
  };
  expect(filtrarVinculos(lista, filtros).map((v) => v.id)).toEqual(["3", "4"]);
  expect(
    filtrarVinculos(lista, { ...filtrosVinculosVazios, situacao: "Encerrado" }),
  ).toHaveLength(3);
  expect(filtrarVinculos(lista, { ...filtros, inicio: "2027-01-01" })).toEqual(
    [],
  );
});

it("agrega a principal forma normalizada e mantém percentuais sobre registros", () => {
  const lista = [
    criar("1", {
      vacanciaData: "2026-01-01",
      vacanciaForma: "Término de contrato",
    }),
    criar("2", {
      vacanciaData: "2026-01-02",
      vacanciaForma: "Término de Contrato",
    }),
    criar("3", { vacanciaData: "2026-01-03", vacanciaForma: "Exoneração" }),
    criar("4"),
  ];
  const resumo = resumoVinculos(lista, ["Contrato Temporário", "Bolsista"]);
  expect(resumo.formas[0]).toEqual({
    nome: "Término de Contrato",
    quantidade: 2,
  });
  expect(resumo.linhas[0]).toMatchObject({
    vigentes: 1,
    encerrados: 3,
    total: 4,
    principalForma: "Término de Contrato",
  });
  expect(resumo.linhas[1]).toMatchObject({ total: 0, principalForma: "—" });
});

it("transporta o contexto completo na URL de consulta", () => {
  const filtros = {
    tipo: "Contrato Temporário",
    orgao: "SES",
    situacao: "Encerrado",
    forma: "Exoneração",
    inicio: "2026-01-01",
    fim: "2026-12-31",
  };
  const params = new URLSearchParams(
    urlConsultaVinculos(filtros).split("?")[1],
  );
  Object.entries(filtros).forEach(([campo, valor]) =>
    expect(params.get(campo)).toBe(valor),
  );
  expect(params.get("expand")).toBe(filtros.tipo);
});

it("sinaliza formas incompatíveis sem mudar os totais ou indicar término de contrato para efetivos", () => {
  const lista = [
    criar("1", {
      tipo: "Nomeado Efetivo",
      vacanciaData: "2026-01-01",
      vacanciaForma: "Término de Contrato",
    }),
  ];
  const resumo = resumoVinculos(lista, ["Nomeado Efetivo"]);
  expect(resumo).toMatchObject({ encerrados: 1, total: 1, formasARevisar: 1 });
  expect(resumo.linhas[0].principalForma).toBe("Forma de Vacância a revisar");
  expect(resumo.formas).toEqual([
    { nome: "Forma de Vacância a revisar", quantidade: 1 },
  ]);
  expect(
    filtrarVinculos(lista, {
      ...filtrosVinculosVazios,
      situacao: "Encerrado",
      forma: "Término de Contrato",
    }),
  ).toEqual([]);
  expect(
    filtrarVinculos(lista, {
      ...filtrosVinculosVazios,
      situacao: "Encerrado",
      forma: "Forma de Vacância a revisar",
    }),
  ).toHaveLength(1);
});

it("recalcula cards e gráficos, aplica filtros na consulta e preserva contexto ao voltar dos detalhes", () => {
  localStorage.setItem(
    "prototype-vinculos-v2",
    JSON.stringify([
      criar("teste-1"),
      criar("teste-2", { cpf: "12345678900" }),
      criar("teste-3", {
        cpf: "987.654.321-00",
        vacanciaData: "2026-01-15",
        vacanciaForma: "Exoneração",
      }),
    ]),
  );
  render(
    <MemoryRouter initialEntries={["/prototipos/sigep/dashboard-vinculos"]}>
      <Routes>
        <Route
          path="/prototipos/sigep/dashboard-vinculos"
          element={<DashboardVinculosPage />}
        />
        <Route
          path="/prototipos/sigep/vinculos-v2"
          element={<VinculoV2ConsultaPage />}
        />
        <Route
          path="/prototipos/sigep/vinculos-v2/:id"
          element={<VinculoV2DetalhesPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Órgão/Entidade"), {
    target: { value: "Órgão de Teste" },
  });
  const indicadores = screen.getByRole("region", {
    name: "Indicadores de vínculos",
  });
  expect(indicadores.textContent).toContain("Pessoas com vínculo vigente1");
  expect(indicadores.textContent).toContain("Pessoas com vínculo encerrado1");
  expect(indicadores.textContent).toContain("Total de vínculos3");
  expect(screen.queryByLabelText("Forma de Vacância")).toBeNull();
  fireEvent.change(screen.getByLabelText("Situação"), {
    target: { value: "Encerrado" },
  });
  fireEvent.change(screen.getByLabelText("Forma de Vacância"), {
    target: { value: "Exoneração" },
  });
  fireEvent.change(screen.getByLabelText("Período inicial"), {
    target: { value: "2026-01-01" },
  });
  expect(indicadores.textContent).toContain("Total de vínculos1");
  fireEvent.click(
    screen.getByRole("link", {
      name: "Consultar 1 vínculos encerrados de Contrato Temporário",
    }),
  );
  expect(
    screen.getByRole("heading", { name: "Gestão de Vínculos" }),
  ).toBeTruthy();
  expect(screen.getByLabelText("Contexto da consulta").textContent).toContain(
    "Órgão de Teste · Encerrado · Exoneração",
  );
  expect(screen.getAllByRole("button", { name: "Ver detalhes" })).toHaveLength(
    1,
  );
  fireEvent.click(screen.getByRole("button", { name: "Ver detalhes" }));
  expect(screen.getByText("987.654.321-00")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
  expect(screen.getAllByRole("button", { name: "Ver detalhes" })).toHaveLength(
    1,
  );
  fireEvent.click(
    within(
      screen.getByRole("region", { name: "Filtros de consulta" }),
    ).getByRole("button", { name: "Limpar filtro" }),
  );
  expect(screen.queryByLabelText("Contexto da consulta")).toBeNull();
});

it("limpa filtros de vacância ao escolher vigente e atualiza dados após retorno do foco", () => {
  render(
    <MemoryRouter>
      <DashboardVinculosPage />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Situação"), {
    target: { value: "Encerrado" },
  });
  fireEvent.change(screen.getByLabelText("Forma de Vacância"), {
    target: { value: "Falecimento" },
  });
  fireEvent.change(screen.getByLabelText("Situação"), {
    target: { value: "Vigente" },
  });
  expect(screen.queryByLabelText("Forma de Vacância")).toBeNull();
  localStorage.setItem(
    "prototype-vinculos-v2",
    JSON.stringify([criar("novo-registro")]),
  );
  fireEvent(window, new Event("focus"));
  fireEvent.change(screen.getByLabelText("Órgão/Entidade"), {
    target: { value: "Órgão de Teste" },
  });
  expect(
    screen.getByRole("region", { name: "Indicadores de vínculos" }).textContent,
  ).toContain("Total de vínculos1");
});

it("filtra períodos por início dos vigentes e vacância dos encerrados", () => {
  const vigente=criar("periodo-vigente",{inicio:"2026-10-01"});
  const encerrado=criar("periodo-encerrado",{inicio:"2020-01-01",vacanciaData:"2026-10-10",vacanciaForma:"Exoneração"});
  const fora=criar("periodo-fora",{inicio:"2025-01-01"});
  const filtros={...filtrosVinculosVazios,inicio:"2026-10-01",fim:"2026-10-14"};
  expect(filtrarVinculos([vigente,encerrado,fora],filtros)).toEqual([vigente,encerrado]);
  expect(filtrarVinculos([vigente,encerrado],{...filtros,situacao:"Vigente"})).toEqual([vigente]);
  expect(filtrarVinculos([vigente,encerrado],{...filtros,inicio:"2026-11-01"})).toEqual([]);
});
it("exporta Excel com filtros, registros únicos e totais da consulta", async () => {
  const a=criar("excel-a",{orgao:"SES",inicio:"2026-10-01"});
  const b=criar("excel-b",{orgao:"SEDUC"});
  const workbook=criarExcelVinculos([a,a,b],{...filtrosVinculosVazios,orgao:"SES"},[a.tipo]);
  expect(workbook.worksheets.map(s => s.name)).toEqual(["Resumo Geral","Resumo por Tipo","Formas de Vacância","Vínculos"]);
  const resumo=workbook.getWorksheet("Resumo Geral")!;
  let total: unknown;
  resumo.eachRow(row => { if(row.getCell(1).value==="Total de vínculos") total=row.getCell(2).value; });
  expect(total).toBe(1);
  const detalhes=workbook.getWorksheet("Vínculos")!;
  expect(detalhes.lastRow!.getCell(2).value).toBe("SES");
  expect(detalhes.autoFilter).toBeTruthy();
  expect((await workbook.xlsx.writeBuffer()).byteLength).toBeGreaterThan(0);
});