import * as simulacaoModelo from "./simulacaoExecucaoModelo";
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

const resultadoApto = (): simulacaoModelo.ResultadoSimulacao => ({
  grupos: [
    {
      id: 1,
      grupo: "Grupo aplicável",
      versao: 1,
      competencia: "2026-05",
      inicioVigencia: "01/01/2026",
      fimVigencia: "-",
      situacao: "ATIVO",
      criterios: {
        regimes: [],
        tipos: [],
        orgaos: [],
        unidades: [],
        carreiras: [],
        cargos: [],
      },
      peso: 1,
      pendencias: 0,
      chave: "1:1",
      vinculosIds: ["demo-1"],
    },
  ],
  total: 1,
  impedimentos: [],
  apta: true,
});
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(simulacaoModelo, "simularExecucao").mockImplementation(
    resultadoApto,
  );
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
    "cargos",
    "carreiras",
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
  fireEvent.click(screen.getByRole("button", { name: "Simular execução" }));
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
  fireEvent.click(screen.getByRole("button", { name: "Simular execução" }));
  await waitFor(() =>
    expect(
      [
        ...document.querySelectorAll(
          ".prototype-processamento-folha-page-form .p-error",
        ),
      ].map((erro) => erro.textContent),
    ).toEqual([]),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Executar Processamento" }),
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
  const opcoes = await abrir("folhaPagamentoId");
  fireEvent.click(opcoes.getByRole("option", { name: /99.*FOLHA TEMPOR/ }));
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

it("organiza o processamento nos três blocos com seletor único da folha e ações no rodapé", () => {
  render(
    <MemoryRouter>
      <PrototiposFolhaProcessamentoFormPage />
    </MemoryRouter>,
  );
  for (const nome of [
    "Dados do Processamento",
    "Abrangência",
    "Grupo de Eleitos",
  ])
    expect(screen.getByRole("region", { name: nome })).toBeTruthy();
  const dados = within(
    screen.getByRole("region", { name: "Dados do Processamento" }),
  );
  expect(dados.getByText("Folha de Pagamento")).toBeTruthy();
  expect(dados.queryByText("Número da Folha")).toBeNull();
  expect(dados.queryByText("Nome da Folha")).toBeNull();
  expect(
    document
      .getElementById("folhaPagamentoId")
      ?.closest('[aria-required="true"]'),
  ).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "Cancelar" })
      .closest(".prototype-processamento-folha-footer"),
  ).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "Executar Processamento" })
      .closest(".prototype-processamento-folha-footer"),
  ).toBeTruthy();
  expect(screen.getByText(/Independe da abrangência/)).toBeTruthy();
});

it("exige simulação apta, não executa ao simular e invalida ao alterar e restaurar parâmetros", async () => {
  const executar = vi.spyOn(folhaPagamentoService, "executarFolha");
  render(
    <MemoryRouter>
      <PrototiposFolhaProcessamentoFormPage />
    </MemoryRouter>,
  );
  const botao = screen.getByRole("button", {
    name: "Executar Processamento",
  }) as HTMLButtonElement;
  expect(botao.disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Simular execução" }));
  await waitFor(() => expect(botao.disabled).toBe(false));
  expect(executar).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("radio", { name: "Parcial" }));
  await screen.findByText(
    "Os parâmetros da execução foram alterados. Realize uma nova simulação para atualizar o resultado.",
  );
  expect(botao.disabled).toBe(true);
  fireEvent.click(screen.getByRole("radio", { name: "Total" }));
  expect(botao.disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Simular execução" }));
  await waitFor(() => expect(botao.disabled).toBe(false));
});
it("não habilita execução quando não existem grupos ou quando não há vínculos", async () => {
  const simular = vi.mocked(simulacaoModelo.simularExecucao);
  simular.mockReturnValueOnce({
    grupos: [],
    total: null,
    apta: false,
    impedimentos: [],
  });
  render(
    <MemoryRouter>
      <PrototiposFolhaProcessamentoFormPage />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Simular execução" }));
  await screen.findByText("Nenhum Grupo de Cálculo encontrado");
  expect(
    (
      screen.getByRole("button", {
        name: "Executar Processamento",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  const vazio = resultadoApto();
  vazio.total = 0;
  vazio.apta = false;
  vazio.grupos[0].vinculosIds = [];
  simular.mockReturnValueOnce(vazio);
  fireEvent.click(screen.getByRole("button", { name: "Simular execução" }));
  await screen.findByText("Nenhum vínculo elegível encontrado");
  expect(
    (
      screen.getByRole("button", {
        name: "Executar Processamento",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
});

it("simula com grupos e vínculos do protótipo sem gravar dados nem executar cálculo", async () => {
  vi.mocked(simulacaoModelo.simularExecucao).mockRestore();
  const grupo = {
    id: 500,
    grupo: "Grupo parametrizado para consulta",
    competencia: "2026-05",
    versao: 1,
    situacao: "ATIVO",
    inicioVigencia: "01/01/2026",
    fimVigencia: "-",
    abrangencia: {
      regimes: [],
      tipos: [],
      orgaos: ["seplag"],
      unidades: [],
      carreiras: [],
      cargos: [],
    },
    pesosAplicados: { versao: 1, total: 10 },
    pendencias: 0,
  };
  localStorage.setItem(
    "sigep:grupos-calculo:competencias:v1",
    JSON.stringify({
      "2026-05": { grupos: [grupo], versoes: { 500: [grupo] } },
    }),
  );
  const executar = vi.spyOn(folhaPagamentoService, "executarFolha");
  render(
    <MemoryRouter>
      <PrototiposFolhaProcessamentoFormPage />
    </MemoryRouter>,
  );
  const retrato = () =>
    JSON.stringify(
      Object.keys(localStorage)
        .sort()
        .map((k) => [k, localStorage.getItem(k)]),
    );
  const antes = retrato();
  fireEvent.click(screen.getByRole("button", { name: "Simular execução" }));
  await screen.findByText(/1 grupos de cálculo encontrados/);
  expect(screen.getByText("Grupo parametrizado para consulta")).toBeTruthy();
  expect(executar).not.toHaveBeenCalled();
  expect(retrato()).toBe(antes);
  expect(
    (
      screen.getByRole("button", {
        name: "Executar Processamento",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false);
});

it("aplica os pesos globais ativos a todos os grupos, inclusive de competência anterior e com somas antigas salvas", async () => {
  vi.mocked(simulacaoModelo.simularExecucao).mockRestore();
  const simular = vi.spyOn(simulacaoModelo, "simularExecucao");
  const base = {
    competencia: "2026-05",
    versao: 2,
    situacao: "ATIVO",
    inicioVigencia: "01/01/2026",
    fimVigencia: "-",
    pendencias: 0,
  };
  const geral = {
    ...base,
    id: 1,
    grupo: "Geral",
    abrangencia: {
      regimes: [],
      tipos: [],
      orgaos: [],
      unidades: [],
      carreiras: [],
      cargos: [],
    },
    pesosAplicados: { versao: 1, total: 999 },
  };
  const efetivos = {
    ...base,
    id: 2,
    grupo: "Efetivos",
    abrangencia: { ...geral.abrangencia, tipos: ["Nomeado Efetivo"] },
    pesosAplicados: { versao: 1, total: 0 },
  };
  localStorage.setItem(
    "sigep:grupos-calculo:competencias:v1",
    JSON.stringify({
      "2026-05": {
        grupos: [geral, efetivos],
        versoes: { 1: [geral], 2: [efetivos] },
      },
    }),
  );
  localStorage.setItem(
    "sigep:pesos-abrangencias:v1",
    JSON.stringify([
      {
        numero: 4,
        inicio: "2026-11-25T12:00:00Z",
        fim: null,
        pesos: [10, 4, 3, 2, 1, 6],
      },
    ]),
  );
  render(
    <MemoryRouter>
      <PrototiposFolhaProcessamentoFormPage />
    </MemoryRouter>,
  );
  const antes = localStorage.getItem("sigep:grupos-calculo:competencias:v1");
  fireEvent.click(screen.getByRole("button", { name: "Simular execução" }));
  await screen.findByText(/2 grupos de cálculo encontrados/);
  const resultado = simular.mock.results[0]
    .value as simulacaoModelo.ResultadoSimulacao;
  expect(resultado.apta).toBe(true);
  expect(resultado.impedimentos).toEqual([]);
  expect(resultado.grupos.find((g) => g.id === 1)!.peso).toBe(0);
  expect(resultado.grupos.find((g) => g.id === 1)!.vinculosIds).toEqual([]);
  expect(resultado.grupos.find((g) => g.id === 2)!.peso).toBe(3);
  expect(
    resultado.grupos.find((g) => g.id === 2)!.vinculosIds.length,
  ).toBeGreaterThan(0);
  expect(localStorage.getItem("sigep:grupos-calculo:competencias:v1")).toBe(
    antes,
  );
  expect(
    (
      screen.getByRole("button", {
        name: "Executar Processamento",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false);
});

it("demonstra ausência de grupos sem consultar dados nem executar, e permite voltar à simulação real", async () => {
  const executar = vi.spyOn(folhaPagamentoService, "executarFolha");
  render(
    <MemoryRouter>
      <PrototiposFolhaProcessamentoFormPage />
    </MemoryRouter>,
  );
  const parametrosAntes =
    document.getElementById("folhaPagamentoId")?.textContent;
  fireEvent.click(
    screen.getByRole("button", { name: "Demonstrar sem grupos" }),
  );
  await screen.findByText("Nenhum Grupo de Cálculo encontrado");
  expect(screen.getByText(/Demonstração do cenário sem grupos/)).toBeTruthy();
  expect(simulacaoModelo.simularExecucao).not.toHaveBeenCalled();
  expect(executar).not.toHaveBeenCalled();
  expect(
    (
      screen.getByRole("button", {
        name: "Executar Processamento",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(document.getElementById("folhaPagamentoId")?.textContent).toBe(
    parametrosAntes,
  );
  fireEvent.click(screen.getByRole("button", { name: "Simular execução" }));
  await screen.findByText("Simulação concluída");
  expect(screen.queryByText(/Demonstração do cenário sem grupos/)).toBeNull();
  expect(
    (
      screen.getByRole("button", {
        name: "Executar Processamento",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false);
});
