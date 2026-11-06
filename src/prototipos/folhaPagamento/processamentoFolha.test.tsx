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
import { MemoryRouter } from "react-router-dom";
import { useForm } from "react-hook-form";
import { DomHandler } from "primereact/utils";
import { PrototiposFolhaProcessamentoFormPage } from "../PrototiposPage";
import { AbrangenciaProcessamentoFolha } from "./AbrangenciaProcessamentoFolha";
import type { CatalogoAbrangencia } from "./abrangenciaGrupoCalculo";
import type { ProcessamentoFolhaForm } from "./types";

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
    defaultValues: { tipoExecucao: "PARCIAL", ...valores },
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
          disabled={false}
          getError={() => null}
        />
      </div>
      <button type="submit">Aplicar</button>
    </form>
  );
}

it("exibe os seis campos na ordem da imagem e preserva o bloqueio da execução total", () => {
  render(
    <MemoryRouter>
      <PrototiposFolhaProcessamentoFormPage />
    </MemoryRouter>,
  );
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
    6,
  );
  expect(screen.getByText("Grupo de eleitos")).toBeTruthy();
  for (const label of ["Setor", "Categoria", "Subcategoria"])
    expect(screen.queryByText(label)).toBeNull();
  fireEvent.click(screen.getByRole("radio", { name: "Parcial" }));
  expect(document.querySelectorAll(".p-multiselect.p-disabled")).toHaveLength(
    0,
  );
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
});
