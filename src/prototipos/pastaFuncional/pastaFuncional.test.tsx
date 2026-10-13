// @vitest-environment jsdom
import "fake-indexeddb/auto";
import { Blob as BlobNode, File as FileNode } from "node:buffer";
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
import { PastaFuncionalPage } from "./PastaFuncionalPage";
import {
  agruparServidores,
  documentosDoServidor,
  filtrarDocumentos,
  filtrosDocumentosVazios,
  filtrosServidoresVazios,
  vinculosFiltrados,
} from "./model";
import {
  anexarDocumentoManual,
  incorporarDocumentoValidado,
  listarDocumentosPersistidos,
  obterArquivo,
} from "./pastaFuncionalStore";
import type { DocumentoFuncional, UsuarioPasta, VinculoPasta } from "./types";

const usuario: UsuarioPasta = {
  nome: "Usuário de teste",
  orgao: "SEPLAG",
  perfil: "CENTRAL",
  podeAnexar: true,
};
const vinculo = (
  id: string,
  campos: Partial<VinculoPasta> = {},
): VinculoPasta => ({
  id,
  cpf: "000.000.000-00",
  nome: "João Silva",
  matricula: "327305",
  numero: "1",
  tipo: "Nomeado Efetivo",
  situacao: "Ativo",
  orgao: "SEPLAG",
  unidade: "Gestão de Pessoas",
  inicio: "2020-01-01",
  ...campos,
});
const doc = (
  id: string,
  campos: Partial<DocumentoFuncional> = {},
): DocumentoFuncional => ({
  id,
  cpf: "000.000.000-00",
  nome: "RG",
  categoria: "Cadastrais",
  tipoDocumento: "RG",
  origem: "Cadastro da Pessoa Física",
  moduloOrigem: "Pessoa Física",
  origemId: id,
  anexadoEm: "2026-10-12T13:00:00Z",
  anexadoPor: "Usuário de origem",
  orgaoResponsavel: "SEPLAG",
  arquivoNome: "rg.txt",
  arquivoTipo: "text/plain",
  observacao: "Registro de teste",
  validado: true,
  ...campos,
});
const montar = (entrada = "/prototipos/sigep/pasta-funcional") =>
  render(
    <MemoryRouter initialEntries={[entrada]}>
      <Routes>
        <Route
          path="/prototipos/sigep/pasta-funcional"
          element={<PastaFuncionalPage />}
        />
        <Route
          path="/prototipos/sigep/pasta-funcional/:servidorId"
          element={<PastaFuncionalPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
const limparBanco = () =>
  new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase("sigep-pasta-funcional");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
beforeEach(async () => {
  vi.stubGlobal("Blob", BlobNode);
  vi.stubGlobal("File", FileNode);
  localStorage.clear();
  await limparBanco();
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("agrega uma pessoa por CPF e não duplica documentos cadastrais ao trocar vínculo", () => {
  const servidores = agruparServidores([
    vinculo("1"),
    vinculo("2", { cpf: "00000000000", numero: "2", orgao: "SES" }),
  ]);
  expect(servidores).toHaveLength(1);
  const lista = [
    doc("pessoal"),
    doc("funcional1", { categoria: "Vínculo Funcional", vinculoId: "1" }),
    doc("funcional2", { categoria: "Vínculo Funcional", vinculoId: "2" }),
  ];
  expect(
    documentosDoServidor([...lista, lista[0]], servidores[0], usuario, "1").map(
      (d) => d.id,
    ),
  ).toEqual(["pessoal", "funcional1"]);
  expect(
    documentosDoServidor(lista, servidores[0], usuario, "2").map((d) => d.id),
  ).toEqual(["pessoal", "funcional2"]);
  const setorial: UsuarioPasta = { ...usuario, perfil: "SETORIAL" };
  expect(
    documentosDoServidor(lista, servidores[0], setorial).map((d) => d.id),
  ).toEqual(["pessoal", "funcional1"]);
});

it("aplica filtros de vínculo ao mesmo registro e período pela data/hora do anexo", () => {
  const servidor = agruparServidores([
    vinculo("1"),
    vinculo("2", {
      situacao: "Encerrado",
      matricula: "999",
      tipo: "Contrato Temporário",
    }),
  ])[0];
  expect(
    vinculosFiltrados(
      servidor,
      {
        ...filtrosServidoresVazios,
        busca: "joao",
        tipo: "Contrato Temporário",
        situacao: "Ativo",
      },
      usuario,
    ),
  ).toEqual([]);
  expect(
    vinculosFiltrados(
      servidor,
      { ...filtrosServidoresVazios, busca: "999", situacao: "Encerrado" },
      usuario,
    ),
  ).toHaveLength(1);
  const lista = [
    doc("1", { dataDocumento: "2000-01-01" }),
    doc("2", { anexadoEm: "2026-10-13T13:00:00Z" }),
  ];
  expect(
    filtrarDocumentos(lista, "Cadastrais", {
      ...filtrosDocumentosVazios,
      inicio: "2026-10-12",
      fim: "2026-10-12",
    }).map((d) => d.id),
  ).toEqual(["1"]);
  expect(filtrarDocumentos(lista, "Ingresso", filtrosDocumentosVazios)).toEqual(
    [],
  );
  expect(
    filtrarDocumentos(lista, "Todos", {
      ...filtrosDocumentosVazios,
      inicio: "2027-01-01",
      fim: "2026-01-01",
    }),
  ).toEqual([]);
});

it("persiste o arquivo original e incorpora uma origem uma única vez", async () => {
  const original = new Blob(["conteúdo original"], { type: "text/plain" });
  await incorporarDocumentoValidado(doc("origem-unica"), original);
  await incorporarDocumentoValidado(
    doc("origem-unica", { nome: "Não substituir" }),
    new Blob(["alterado"]),
  );
  const salvos = await listarDocumentosPersistidos();
  expect(salvos).toHaveLength(1);
  expect(salvos[0].nome).toBe("RG");
  const arquivo = await obterArquivo(salvos[0]);
  expect(arquivo.size).toBe(original.size);
  expect(arquivo.type).toBe("text/plain");
  expect(await arquivo.text()).toBe("conteúdo original");
});

it("ordena anexos pelo instante real mesmo com fusos diferentes", () => {
  const lista = [
    doc("utc", { anexadoEm: "2026-10-12T14:00:00Z" }),
    doc("local", { anexadoEm: "2026-10-12T10:30:00-04:00" }),
  ];
  expect(
    filtrarDocumentos(lista, "Todos", filtrosDocumentosVazios).map((d) => d.id),
  ).toEqual(["local", "utc"]);
});

it("impede anexo sem permissão, ingresso manual, arquivos vazios e formatos não permitidos", async () => {
  const arquivo = new File(["texto"], "arquivo.txt", { type: "text/plain" });
  await expect(
    anexarDocumentoManual(doc("1"), arquivo, { ...usuario, podeAnexar: false }),
  ).rejects.toThrow("perfil");
  await expect(
    anexarDocumentoManual(
      doc("1", { categoria: "Ingresso" }),
      arquivo,
      usuario,
    ),
  ).rejects.toThrow("módulo de origem");
  await expect(
    anexarDocumentoManual(doc("1"), new File([], "arquivo.txt"), usuario),
  ).rejects.toThrow("não vazio");
  await expect(
    anexarDocumentoManual(
      doc("1"),
      new File(["script"], "arquivo.html"),
      usuario,
    ),
  ).rejects.toThrow("Utilize PDF");
  expect(await listarDocumentosPersistidos()).toHaveLength(0);
});

it("consulta todos os servidores, pesquisa CPF, abre pasta e preserva filtros no retorno", async () => {
  montar();
  await waitFor(() =>
    expect(
      screen.getAllByRole("link", { name: /^Ver documentos de/ }),
    ).toHaveLength(10),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Próxima página de servidores da Pasta Funcional",
    }),
  );
  expect(
    screen
      .getByRole("button", {
        name: "Página 2 de servidores da Pasta Funcional",
      })
      .getAttribute("aria-current"),
  ).toBe("page");
  fireEvent.change(
    screen.getByPlaceholderText("Digite o nome, CPF ou matrícula..."),
    { target: { value: "000.000.001-00" } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Pesquisar" }));
  fireEvent.click(
    screen.getByRole("link", { name: "Ver documentos de Ana Paula Ribeiro" }),
  );
  expect(screen.getByRole("button", { name: "Todos (9)" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Cadastrais (0)" }));
  expect(
    screen.getByText("Nenhum documento encontrado nesta categoria."),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("link", { name: "Voltar" }));
  expect(
    (
      screen.getByPlaceholderText(
        "Digite o nome, CPF ou matrícula...",
      ) as HTMLInputElement
    ).value,
  ).toBe("000.000.001-00");
});

it("anexa documento cadastral, atualiza abas e conserva nome do usuário e arquivo após recarregar", async () => {
  const tela = montar("/prototipos/sigep/pasta-funcional/00000000000");
  await screen.findByRole("button", { name: "Anexar documento" });
  fireEvent.click(screen.getByRole("button", { name: "Anexar documento" }));
  const modal = screen.getByRole("dialog", { name: "Anexar documento" });
  fireEvent.change(within(modal).getByLabelText(/Categoria/), {
    target: { value: "Cadastrais" },
  });
  expect(within(modal).queryByLabelText(/Vínculo relacionado/)).toBeNull();
  expect(within(modal).queryByRole("option", { name: "Ingresso" })).toBeNull();
  fireEvent.change(within(modal).getByLabelText(/Arquivo/), {
    target: {
      files: [
        new File(["registro de teste"], "rg.txt", { type: "text/plain" }),
      ],
    },
  });
  fireEvent.submit(
    within(modal)
      .getByRole("button", { name: "Anexar documento" })
      .closest("form")!,
  );
  await screen.findByText("Documento anexado com sucesso.");
  expect(screen.getByRole("button", { name: "Cadastrais (1)" })).toBeTruthy();
  const seletor = screen.getByLabelText(
    "Vínculo consultado",
  ) as HTMLSelectElement;
  fireEvent.change(seletor, { target: { value: "demo-3" } });
  expect(screen.getByRole("button", { name: "Cadastrais (1)" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Ver detalhes de RG" }));
  const detalhes = screen.getByRole("dialog", {
    name: "Detalhes do documento",
  });
  expect(
    within(detalhes).getByText("Cadastro Manual — Pasta Funcional"),
  ).toBeTruthy();
  expect(within(detalhes).getByText("ROBERTO JUNIOR")).toBeTruthy();
  expect(within(detalhes).getByText("Pessoa Física")).toBeTruthy();
  fireEvent.click(
    within(detalhes).getByRole("button", { name: "Fechar", exact: true }),
  );
  tela.unmount();
  montar("/prototipos/sigep/pasta-funcional/00000000000?vinculo=demo-3");
  await screen.findByRole("button", { name: "Cadastrais (1)" });
  expect(screen.getByText("rg.txt")).toBeTruthy();
});

it("nega acesso direto a servidor de outro órgão para perfil setorial", async () => {
  localStorage.setItem("prototype-ingresso-perfil-variacao", "SETORIAL");
  localStorage.setItem("prototype-ingresso-orgao-atuacao", "SEPLAG");
  montar("/prototipos/sigep/pasta-funcional/00000000400");
  expect(screen.getByRole("alert").textContent).toContain(
    "acesso não autorizado",
  );
  expect(screen.queryByRole("button", { name: "Anexar documento" })).toBeNull();
});
