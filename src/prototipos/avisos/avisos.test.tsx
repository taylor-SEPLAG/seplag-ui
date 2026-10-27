// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AvisosContent } from "./AvisosContent";
import {
  categoriaAviso,
  filtrarAvisos,
  useInformativos,
  type Comunicado,
} from "./model";
import {
  atualizarInformativosPaginaInicial,
  informativosIniciais,
} from "../paginaInicial/informativos";

const avisos: Comunicado[] = [
  ...informativosIniciais,
  {
    id: 4,
    icon: "pi pi-refresh",
    destaque: "is-update",
    titulo: "Atualização do cronograma",
    dataPostagem: "17/06/2026",
    texto: "Novos marcos publicados.\nConsulte a competência atual.",
  },
];
function montar() {
  return render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<AvisosContent avisos={avisos} />} />
        <Route
          path="/prototipos/sigep/pagina-inicial"
          element={<p>Destino Página Inicial</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
}
afterEach(() => {
  cleanup();
  atualizarInformativosPaginaInicial(informativosIniciais);
});

it("classifica pelos metadados registrados, preserva a fonte e filtra título e conteúdo", () => {
  expect(avisos.map(categoriaAviso)).toEqual([
    "urgente",
    "informativo",
    "regra",
    "atualizacao",
  ]);
  expect(filtrarAvisos(avisos, "FERIAS", "regra")).toHaveLength(1);
  expect(filtrarAvisos(avisos, "novos marcos", "atualizacao")).toEqual([
    avisos[3],
  ]);
  expect(filtrarAvisos(avisos, "novos marcos", "urgente")).toEqual([]);
  expect(informativosIniciais).toHaveLength(3);
});

it("mostra contadores e combina resumo, busca e dropdown", () => {
  montar();
  const lista = screen.getByRole("region", { name: "Comunicados disponíveis" });
  expect(within(lista).getAllByRole("article")).toHaveLength(4);
  fireEvent.click(screen.getByRole("button", { name: "Regras 1" }));
  expect(
    (screen.getByLabelText("Tipo de aviso") as HTMLSelectElement).value,
  ).toBe("regra");
  expect(within(lista).getAllByRole("article")).toHaveLength(1);
  fireEvent.change(screen.getByLabelText("Buscar comunicado"), {
    target: { value: "inexistente" },
  });
  expect(screen.getByText("Nenhum comunicado encontrado.")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Limpar filtro" }));
  expect(within(lista).getAllByRole("article")).toHaveLength(4);
  fireEvent.change(screen.getByLabelText("Tipo de aviso"), {
    target: { value: "atualizacao" },
  });
  expect(
    screen
      .getByRole("button", { name: "Atualizações 1" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
});

it("abre o conteúdo completo no modal existente, sem ações de cadastro", () => {
  montar();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Ler comunicado: Atualização do cronograma",
    }),
  );
  const modal = screen.getByRole("dialog", {
    name: "Atualização do cronograma",
  });
  expect(within(modal).getByText(/Novos marcos publicados/).textContent).toBe(
    avisos[3].texto,
  );
  expect(within(modal).getByText("17/06/2026")).toBeTruthy();
  expect(within(modal).getByText("Atualização")).toBeTruthy();
  expect(
    screen.queryByRole("button", {
      name: /Salvar|Enviar|Editar|Excluir|Cadastrar/,
    }),
  ).toBeNull();
  fireEvent.click(within(modal).getByRole("button", { name: "Fechar" }));
});

it("Voltar retorna à Página Inicial e fonte vazia não cria comunicados", () => {
  montar();
  fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
  expect(screen.getByText("Destino Página Inicial")).toBeTruthy();
  cleanup();
  render(
    <MemoryRouter>
      <AvisosContent avisos={[]} />
    </MemoryRouter>,
  );
  expect(screen.getByText("Nenhum comunicado disponível.")).toBeTruthy();
  expect(screen.queryAllByRole("article")).toHaveLength(0);
});

it("reflete publicação, alteração e exclusão da mesma fonte compartilhada", () => {
  function Consulta() {
    return <AvisosContent avisos={useInformativos()} />;
  }
  render(
    <MemoryRouter>
      <Consulta />
    </MemoryRouter>,
  );
  expect(screen.getAllByRole("article")).toHaveLength(3);
  act(() => atualizarInformativosPaginaInicial(avisos));
  expect(screen.getAllByRole("article")).toHaveLength(4);
  fireEvent.click(
    screen.getByRole("button", {
      name: "Ler comunicado: Atualização do cronograma",
    }),
  );
  act(() =>
    atualizarInformativosPaginaInicial(
      avisos.map((aviso) =>
        aviso.id === 4
          ? { ...aviso, texto: "Conteúdo atualizado no Painel." }
          : aviso,
      ),
    ),
  );
  expect(
    within(screen.getByRole("dialog")).getByText(
      "Conteúdo atualizado no Painel.",
    ),
  ).toBeTruthy();
  act(() => atualizarInformativosPaginaInicial([]));
  expect(screen.getByText("Nenhum comunicado disponível.")).toBeTruthy();
});

it("exibe o novo comunicado na categoria correspondente após adicionar", () => {
  atualizarInformativosPaginaInicial(informativosIniciais);
  function Lista() { return <AvisosContent avisos={useInformativos()} />; }
  render(<MemoryRouter><Lista /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText("Buscar comunicado"), { target: { value: "busca anterior" } });
  fireEvent.click(screen.getByRole("button", { name: "Novo Informativo" }));
  fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Nova atualização" } });
  fireEvent.change(screen.getByLabelText("Texto"), { target: { value: "Atualização cadastrada agora" } });
  fireEvent.click(screen.getByRole("button", { name: "Atualização", exact: true }));
  fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
  expect((screen.getByLabelText("Tipo de aviso") as HTMLSelectElement).value).toBe("atualizacao");
  expect((screen.getByLabelText("Buscar comunicado") as HTMLInputElement).value).toBe("");
  expect(screen.getByRole("heading", { name: "Nova atualização" })).toBeTruthy();
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(screen.queryByRole("dialog")).toBeNull();
});
