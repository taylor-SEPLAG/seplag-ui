// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PaginaInicialContent } from "./PaginaInicialContent";
import {
  contarCronogramasAtivos,
  funcionalidades,
  menuDisponivel,
} from "./model";
import {
  atualizarInformativosPaginaInicial,
  informativosIniciais,
  listarInformativosPaginaInicial,
} from "./informativos";
import type { IMenuSeplag } from "../../componentes/layout/Config/menu";
import { adaptarCronograma } from "../cronograma/model";

const menu: IMenuSeplag[] = [
  { label: "Painel Informativo", icon: "pi pi-home", to: "/painel" },
  {
    label: "Cadastro",
    icon: "",
    items: [
      { label: "Pessoas", icon: "pi pi-users", to: "/pessoas" },
      {
        label: "Vínculos Funcionais",
        icon: "",
        to: "/vinculos",
        items: [
          { label: "Histórico Funcional", icon: "", to: "/vida" },
          {
            label: "Pasta Funcional do Servidor",
            icon: "",
            to: "/pasta",
            permissionKeys: ["pasta"],
          },
          { label: "Oculta", icon: "", to: "/oculta", visibleOnMenu: false },
          {
            label: "Desabilitada",
            icon: "",
            to: "/desabilitada",
            disabled: true,
          },
        ],
      },
      { label: "Backlog", icon: "", url: "#", items: [] },
    ],
  },
];

function montar(avisos = 3, cronogramas = 1) {
  render(
    <MemoryRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PaginaInicialContent
              menu={menuDisponivel(menu)}
              nomeUsuario="ROBERTO JUNIOR"
              avisos={avisos}
              cronogramas={cronogramas}
            />
          }
        />
        <Route path="/vida" element={<p>Destino Vida Funcional</p>} />
        <Route path="/pessoas" element={<p>Destino Pessoas</p>} />
        <Route path="/painel" element={<p>Destino Informativos</p>} />
        <Route
          path="/prototipos/sigep/avisos-importantes"
          element={<p>Destino Avisos</p>}
        />
        <Route
          path="/prototipos/sigep/cronograma"
          element={<p>Destino Cronograma</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
}
afterEach(() => {
  cleanup();
  atualizarInformativosPaginaInicial(informativosIniciais);
});

it("o card apresenta o próximo prazo da origem e abre o calendário de consulta", () => {
  const proximo = adaptarCronograma({
    tituloCiclo: "Novembro/2026",
    secoes: [
      {
        id: 1,
        titulo: "Folha principal",
        eventos: [
          {
            periodo: "01/11 - 02/11 - 18:00",
            descricao: "Prazo prioritário",
            status: "Pendente",
          },
        ],
      },
    ],
  }).eventos[0];
  render(
    <MemoryRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PaginaInicialContent
              menu={menuDisponivel(menu)}
              nomeUsuario="ROBERTO JUNIOR"
              avisos={0}
              cronogramas={1}
              proximo={proximo}
            />
          }
        />
        <Route
          path="/prototipos/sigep/cronograma"
          element={<p>Calendário de consulta</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByText("Próximo evento: Prazo prioritário")).toBeTruthy();
  expect(screen.getByText("Prazo: 02/11/2026 às 18:00")).toBeTruthy();
  expect(screen.queryByRole("link", { name: "Configurar cronograma" })).toBeNull();
  fireEvent.click(screen.getByRole("link", { name: "Cronograma — Ver detalhes" }));
  expect(screen.getByText("Calendário de consulta")).toBeTruthy();
});

it("personaliza a saudação, ordena os módulos e não cria rota para agrupador indisponível", () => {
  montar();
  const saudacao = screen.getByRole("heading", { name: "Olá, Roberto!" });
  expect(saudacao.textContent).toContain("👋");
  expect(saudacao.querySelector('[aria-hidden="true"]')).toBeTruthy();
  const acessos = screen
    .getAllByRole("link")
    .filter((link) => link.textContent?.includes("Acessar"));
  expect(acessos.map((link) => link.getAttribute("href"))).toEqual([
    "/painel",
    "/pessoas",
    "/vinculos",
  ]);
  expect(
    screen
      .getByText("Em definição")
      .closest("article")
      ?.getAttribute("aria-disabled"),
  ).toBe("true");
  expect(screen.queryByText("Favoritos")).toBeNull();
});

it("exibe a data atual e mantém somente a busca do cabeçalho global", () => {
  montar();
  expect(screen.queryByRole("combobox")).toBeNull();
  const data = document.querySelector("time")!;
  expect(data.textContent).toContain(
    new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
      timeZone: "America/Cuiaba",
    }).format(new Date()),
  );
});
it("prioriza favoritos sem navegar e restaura a ordem ao desmarcar", () => {
  montar();
  const acessos = () =>
    screen
      .getAllByRole("link")
      .filter((link) => link.textContent?.includes("Acessar"))
      .map((link) => link.getAttribute("href"));
  fireEvent.click(
    screen.getByRole("button", { name: "Adicionar aos favoritos: Pessoas" }),
  );
  expect(acessos()).toEqual(["/pessoas", "/painel", "/vinculos"]);
  expect(
    screen
      .getByRole("button", { name: "Remover dos favoritos: Pessoas" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  expect(screen.getByRole("heading", { name: "Olá, Roberto!" })).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Remover dos favoritos: Pessoas" }),
  );
  expect(acessos()).toEqual(["/painel", "/pessoas", "/vinculos"]);
  expect(
    screen.queryByRole("button", { name: /favoritos: Pasta Funcional/ }),
  ).toBeNull();
  expect(
    funcionalidades(menuDisponivel(menu, ["pasta"])).some(
      (item) => item.caminho === "/pasta",
    ),
  ).toBe(true);
});
it("mantém os dois cards em estado vazio e navega para seus detalhes", () => {
  montar(0, 0);
  expect(screen.queryByText("Nenhum comunicado ativo")).toBeNull();
  expect(screen.queryByText("Nenhum cronograma ativo.")).toBeNull();
  expect(
    screen.getByText("Acompanhe o calendário e os eventos da folha."),
  ).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "Ver detalhes" }).getAttribute("href"),
  ).toBe("/prototipos/sigep/avisos-importantes");
  fireEvent.click(
    screen.getByRole("link", { name: "Cronograma — Ver detalhes" }),
  );
  expect(screen.getByText("Destino Cronograma")).toBeTruthy();
});

it("abre a nova consulta de Avisos importantes pelo card da Página Inicial", () => {
  montar();
  expect(screen.queryByText("3 comunicados ativos")).toBeNull();
  fireEvent.click(screen.getByRole("link", { name: "Ver detalhes" }));
  expect(screen.getByText("Destino Avisos")).toBeTruthy();
});

it("não inclui filhos de módulos negados na navegação", () => {
  const negado = menuDisponivel([
    { label: "Restrito", icon: "", permissionKeys: ["admin"], items: menu },
  ]);
  expect(funcionalidades(negado)).toEqual([]);
});

it("deriva a quantidade dos comunicados compartilhados, inclusive após exclusão", () => {
  expect(listarInformativosPaginaInicial()).toHaveLength(
    informativosIniciais.length,
  );
  atualizarInformativosPaginaInicial(informativosIniciais.slice(1));
  expect(listarInformativosPaginaInicial()).toHaveLength(
    informativosIniciais.length - 1,
  );
  atualizarInformativosPaginaInicial([]);
  expect(listarInformativosPaginaInicial()).toHaveLength(0);
});

it("conta um ciclo com eventos ativos, não suas seções, e ignora ciclos concluídos", () => {
  const cronograma = {
    secoes: [
      { eventos: [{ periodo: "14/06 - 18/06 - 18:00" }] },
      { eventos: [{ periodo: "15/06 - 22/06 - 17:00" }] },
    ],
  };
  expect(contarCronogramasAtivos(cronograma, new Date(2026, 5, 16))).toBe(1);
  expect(contarCronogramasAtivos(cronograma, new Date(2026, 9, 12))).toBe(0);
  expect(contarCronogramasAtivos({ secoes: [] })).toBe(0);
});
