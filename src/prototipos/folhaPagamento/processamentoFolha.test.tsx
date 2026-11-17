// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useForm } from "react-hook-form";
import { DomHandler } from "primereact/utils";
import { PrototiposFolhaProcessamentoFormPage } from "../PrototiposPage";
import { AbrangenciaProcessamentoFolha } from "./AbrangenciaProcessamentoFolha";
import type { CatalogoAbrangencia } from "./abrangenciaGrupoCalculo";
import type { ProcessamentoFolhaForm } from "./types";
import { criteriosDoProcessamento } from "./regrasProcessamentoFolha";
import { folhaPagamentoService } from "./folhaPagamentoService";

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(DomHandler, "absolutePosition").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
const abrir = async (campo: string) => {
  fireEvent.click(document.getElementById(campo)!);
  return within(await screen.findByRole("listbox"));
};
const fechar = (campo: string) =>
  fireEvent.click(document.getElementById(campo)!);
const catalogo: CatalogoAbrangencia = {
  regimes: [{ value: "ESTATUTARIO CIVIL", label: "Estatutário Civil" }],
  tipos: [
    {
      value: "TV1",
      label: "Nomeado Efetivo",
      regimes: ["ESTATUTARIO CIVIL"],
      possuiCarreira: true,
    },
  ],
  carreiras: [{ value: "CAR", label: "Carreira teste", orgaos: ["seduc"] }],
  orgaos: [
    { value: "seduc", label: "SEDUC" },
    { value: "seplag", label: "SEPLAG" },
  ],
  unidades: [
    { value: "U1", label: "Unidade SEDUC", orgao: "seduc" },
    { value: "U2", label: "Unidade SEPLAG", orgao: "seplag" },
  ],
  cargos: [
    {
      value: "CG1",
      label: "Professor",
      tipos: ["TV1"],
      carreirasPorTipo: { TV1: "CAR" },
    },
  ],
};
function Campos({
  salvar,
  valores = {},
}: {
  salvar: (data: ProcessamentoFolhaForm) => void;
  valores?: ProcessamentoFolhaForm;
}) {
  const { control, setValue, handleSubmit } = useForm<ProcessamentoFolhaForm>({
    defaultValues: { tipoExecucao: "TOTAL", ...valores },
  });
  return (
    <form onSubmit={handleSubmit(salvar)}>
      <div className="grid">
        <AbrangenciaProcessamentoFolha
          control={control}
          setValue={setValue}
          catalogo={catalogo}
          grupoEleitosOptions={[
            { label: "Nenhum", value: "" },
            { label: "Eleitos teste", value: "GE" },
          ]}
          original={criteriosDoProcessamento(valores, catalogo)}
          getError={() => null}
        />
      </div>
      <button type="submit">Aplicar</button>
    </form>
  );
}

it("bloqueia somente os campos parametrizados no Total e os vazios no Parcial", () => {
  render(
    <MemoryRouter>
      <PrototiposFolhaProcessamentoFormPage />
    </MemoryRouter>,
  );
  const competenciaInicial = document.getElementById("competencia")!;
  const competenciaFinal = document.getElementById("competenciaFinal")!;
  expect(competenciaInicial.classList.contains("p-dropdown")).toBe(true);
  expect(competenciaInicial.classList.contains("p-disabled")).toBe(false);
  expect(competenciaInicial.closest('[aria-required="true"]')).toBeTruthy();
  expect(competenciaFinal.classList.contains("p-disabled")).toBe(true);
  expect(competenciaFinal.closest('[aria-required="true"]')).toBeNull();
  expect(
    [...document.querySelectorAll(".p-multiselect")].map((e) => e.id),
  ).toEqual([
    "regimesJuridicos",
    "tiposVinculo",
    "orgaos",
    "unidades",
    "carreiras",
    "cargos",
  ]);
  expect(document.querySelectorAll(".p-multiselect.p-disabled")).toHaveLength(
    3,
  );
  for (const campo of ["regimesJuridicos", "tiposVinculo", "orgaos"])
    expect(
      document.getElementById(campo)?.classList.contains("p-disabled"),
    ).toBe(true);
  for (const campo of ["carreiras", "unidades", "cargos", "grupoEleitos"])
    expect(
      document.getElementById(campo)?.classList.contains("p-disabled"),
    ).toBe(false);
  expect(screen.getByText("Grupo de eleitos")).toBeTruthy();
  for (const label of ["Setor", "Categoria", "Subcategoria"])
    expect(screen.queryByText(label)).toBeNull();
  fireEvent.click(screen.getByRole("radio", { name: "Parcial" }));
  expect(competenciaFinal.classList.contains("p-disabled")).toBe(true);
  expect(document.querySelectorAll(".p-multiselect.p-disabled")).toHaveLength(
    3,
  );
  for (const campo of ["carreiras", "unidades", "cargos"])
    expect(
      document.getElementById(campo)?.classList.contains("p-disabled"),
    ).toBe(true);
  expect(
    document.getElementById("grupoEleitos")?.classList.contains("p-disabled"),
  ).toBe(false);
});

it("exige competência inicial válida e permite processar com competência final vazia", async () => {
  const executar = vi.spyOn(folhaPagamentoService, "executarFolha");
  render(
    <MemoryRouter initialEntries={["/processamento-teste"]}>
      <Routes>
        <Route
          path="/processamento-teste"
          element={<PrototiposFolhaProcessamentoFormPage />}
        />
        <Route
          path="/prototipos/folha/processamento/processamento-folha"
          element={<p>Retornou à listagem</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
  const inicial = document.getElementById("competencia")!;
  const final = document.getElementById("competenciaFinal")!;
  fireEvent.pointerUp(inicial.querySelector(".p-dropdown-clear-icon")!);
  expect(inicial.querySelector(".p-dropdown-label")?.textContent).toBe(
    "Selecione...",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Executar Processamento" }),
  );
  expect(
    await screen.findByText("Competência inicial é obrigatório"),
  ).toBeTruthy();
  expect(screen.queryByText("Registro cadastrado com sucesso!")).toBeNull();
  expect(final.classList.contains("p-disabled")).toBe(true);
  expect(final.querySelector(".p-dropdown-label")?.textContent).toBe(
    "Selecione...",
  );
  const opcoes = await abrir("competencia");
  expect(
    opcoes
      .getAllByRole("option")
      .every((opcao) => /^\d{2}\/\d{4}$/.test(opcao.textContent ?? "")),
  ).toBe(true);
  fireEvent.click(opcoes.getByRole("option", { name: "05/2026" }));
  await waitFor(() =>
    expect(inicial.querySelector(".p-dropdown-label")?.textContent).toBe(
      "05/2026",
    ),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Executar Processamento" }),
  );
  await waitFor(() =>
    expect(
      [
        ...document.querySelectorAll(
          ".prototype-processamento-folha-page-form .p-error",
        ),
      ].map((erro) => erro.textContent),
    ).toEqual([]),
  );
  expect(
    await screen.findByText("Registro cadastrado com sucesso!"),
  ).toBeTruthy();
  expect(executar).toHaveBeenCalledWith(
    expect.objectContaining({
      folhaPagamentoId: 1,
      tipoExecucao: "TOTAL",
      competenciaInicial: "2026-05",
      grupoEleitos: "",
      criterios: expect.objectContaining({
        orgaos: ["seplag", "mti"],
        carreiras: [],
        unidades: [],
        cargos: [],
      }),
    }),
  );
  expect(await screen.findByText("Retornou à listagem")).toBeTruthy();
});

it("normaliza os filtros legados da folha sem perder carreira, unidade ou grupo de eleitos", async () => {
  const salvar = vi.fn();
  render(
    <Campos
      salvar={salvar}
      valores={{
        regimesJuridicos: ["estatutario"],
        tiposVinculo: ["efetivo"],
        orgaos: ["SEDUC"],
        carreiras: ["CAR"],
        unidades: ["U1"],
        cargos: ["Professor"],
        grupoEleitos: "GE",
      }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));
  await waitFor(() =>
    expect(salvar).toHaveBeenCalledWith(
      expect.objectContaining({
        regimesJuridicos: ["ESTATUTARIO CIVIL"],
        tiposVinculo: ["TV1"],
        orgaos: ["seduc"],
        carreiras: ["CAR"],
        unidades: ["U1"],
        cargos: ["CG1"],
        grupoEleitos: "GE",
      }),
      expect.anything(),
    ),
  );
});

it("restaura o original ao trocar o tipo sem alterar competência nem Grupo de Eleitos", async () => {
  render(
    <MemoryRouter>
      <PrototiposFolhaProcessamentoFormPage />
    </MemoryRouter>,
  );
  let opcoes = await abrir("competencia");
  fireEvent.click(opcoes.getByRole("option", { name: "04/2026" }));
  opcoes = await abrir("grupoEleitos");
  expect(opcoes.getByRole("option", { name: "abc123" })).toBeTruthy();
  expect(opcoes.queryByRole("option", { name: "Teste 24/04/2026" })).toBeNull();
  fireEvent.click(opcoes.getByRole("option", { name: "abc123" }));
  opcoes = await abrir("carreiras");
  fireEvent.click(
    opcoes.getByRole("option", { name: "Profissionais da Administração" }),
  );
  fechar("carreiras");
  expect(document.getElementById("carreiras")?.textContent).toContain(
    "Profissionais da Administração",
  );
  fireEvent.click(screen.getByRole("radio", { name: "Parcial" }));
  expect(
    document.getElementById("carreiras")?.classList.contains("p-disabled"),
  ).toBe(true);
  expect(document.getElementById("carreiras")?.textContent).not.toContain(
    "Profissionais da Administração",
  );
  expect(document.getElementById("grupoEleitos")?.textContent).toContain(
    "abc123",
  );
  expect(document.getElementById("competencia")?.textContent).toContain(
    "04/2026",
  );
  fireEvent.click(screen.getByRole("radio", { name: "Total" }));
  expect(
    document.getElementById("carreiras")?.classList.contains("p-disabled"),
  ).toBe(false);
  expect(document.getElementById("grupoEleitos")?.textContent).toContain(
    "abc123",
  );
  expect(
    document
      .getElementById("competenciaFinal")
      ?.classList.contains("p-disabled"),
  ).toBe(true);
});

it("carrega a parametrização da nova folha selecionada sem reutilizar filtros da anterior", async () => {
  const base = folhaPagamentoService.listarFolhas()[0];
  const outra = {
    ...structuredClone(base),
    id: 999,
    numero: "99",
    nome: "Folha Temporários",
    competencia: "2026-04",
    orgaos: ["SEDUC"],
    abrangenciaRegimeJuridico: ["REGIME ESPECIAL"],
    abrangenciaTipoVinculo: ["TV003"],
    abrangenciaCarreiras: [],
    abrangenciaUnidades: [],
    abrangenciaCargos: [],
    regimeJuridico: "",
    cargo: "",
    grupoEleitos: "abc123",
  };
  vi.spyOn(folhaPagamentoService, "listarFolhas").mockReturnValue([
    base,
    outra,
  ]);
  render(
    <MemoryRouter>
      <PrototiposFolhaProcessamentoFormPage />
    </MemoryRouter>,
  );
  const opcoes = await abrir("numeroFolha");
  fireEvent.click(opcoes.getByRole("option", { name: "99" }));
  await waitFor(() =>
    expect(document.getElementById("regimesJuridicos")?.textContent).toContain(
      "REGIME ESPECIAL",
    ),
  );
  expect(document.getElementById("tiposVinculo")?.textContent).toContain(
    "Contrato Temporário",
  );
  expect(document.getElementById("orgaos")?.textContent).toContain("SEDUC");
  expect(document.getElementById("orgaos")?.textContent).not.toContain(
    "SEPLAG",
  );
  expect(document.getElementById("grupoEleitos")?.textContent).toContain(
    "abc123",
  );
  expect(document.getElementById("competencia")?.textContent).toContain(
    "04/2026",
  );
  expect(base.orgaos).toEqual(["SEPLAG", "MTI"]);
});

it("filtra unidades pelo órgão e envia os novos campos junto com o grupo de eleitos", async () => {
  const salvar = vi.fn();
  render(<Campos salvar={salvar} />);
  let opcoes = await abrir("orgaos");
  fireEvent.click(opcoes.getByRole("option", { name: "SEDUC" }));
  fechar("orgaos");
  opcoes = await abrir("unidades");
  expect(opcoes.queryByRole("option", { name: "Unidade SEPLAG" })).toBeNull();
  fireEvent.click(opcoes.getByRole("option", { name: "Unidade SEDUC" }));
  fechar("unidades");
  opcoes = await abrir("carreiras");
  fireEvent.click(opcoes.getByRole("option", { name: "Carreira teste" }));
  fechar("carreiras");
  opcoes = await abrir("grupoEleitos");
  fireEvent.click(opcoes.getByRole("option", { name: "Eleitos teste" }));
  fireEvent.click(screen.getByRole("button", { name: "Aplicar" }));
  await waitFor(() =>
    expect(salvar).toHaveBeenCalledWith(
      expect.objectContaining({
        orgaos: ["seduc"],
        unidades: ["U1"],
        carreiras: ["CAR"],
        grupoEleitos: "GE",
        setores: [],
        categorias: [],
        subcategorias: [],
      }),
      expect.anything(),
    ),
  );
  opcoes = await abrir("orgaos");
  fireEvent.click(opcoes.getByRole("option", { name: "SEDUC" }));
  fechar("orgaos");
  expect(
    document.getElementById("unidades")?.classList.contains("p-disabled"),
  ).toBe(true);
  expect(document.getElementById("unidades")?.textContent).not.toContain(
    "Unidade SEDUC",
  );
});
