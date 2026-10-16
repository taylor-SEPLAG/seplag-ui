// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ModuleNavigationCard } from "./ModuleNavigationCard";
import { MenuCardsContent } from "../MenuCardsContent";
import { CadastroGeralContent } from "../cadastro/CadastroGeralContent";
import { ControleVagasGeralContent } from "../controleVagas/ControleVagasGeralContent";
import { IngressoGeralContent } from "../ingresso/IngressoGeralContent";
import { VinculosFuncionaisGeralContent } from "../vinculos/VinculosFuncionaisGeralContent";
import { ControleCertameGeralContent } from "../controlePss/ControleCertameGeralContent";
import { VacanciaGeralContent } from "../vacancia/VacanciaGeralContent";
import { VagasEfetivosContent } from "../controleVagas/VagasEfetivosContent";
import { VagasTemporariosContent } from "../controleVagasTemporarios/VagasTemporariosContent";
import { VagasResidentesContent } from "../controleVagasResidentes/VagasResidentesContent";
import { VagasComissionadosContent } from "../controleVagasComissionados/VagasComissionadosContent";

afterEach(cleanup);
it("o retorno de uma modalidade de Vacância usa o card sem mudar a rota nem os modais", () => {
  render(
    <MemoryRouter initialEntries={["/vacancia/exoneracao"]}>
      <Routes>
        <Route
          path="/vacancia/:modalidade"
          element={<VacanciaGeralContent />}
        />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByRole("link").getAttribute("href")).toBe(
    "/prototipos/sigep/vacancia",
  );
  expect(
    screen.getByRole("link").classList.contains("sigep-module-navigation-card"),
  ).toBe(true);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    screen.getByRole("button", {
      name: "Abrir informações legais sobre Exoneração",
    }),
  ).toBeTruthy();
});
const props = {
  id: "pessoa-fisica",
  titulo: "Pessoa Física",
  descricao: "Consulte os dados cadastrais.",
  icone: "pi pi-user",
  modulo: "Pessoas",
  destino: "/pessoas",
};

it("navega pela superfície do card e herda a identidade do módulo", () => {
  render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<ModuleNavigationCard {...props} />} />
        <Route path="/pessoas" element={<p>Consulta existente</p>} />
      </Routes>
    </MemoryRouter>,
  );
  const card = screen.getByRole("link", { name: "Acessar Pessoa Física" });
  expect(card.style.getPropertyValue("--sigep-cor-modulo")).toBe(
    "var(--sigep-modulo-pessoas)",
  );
  expect(card.querySelector(".sigep-module-navigation-icon i")?.className).toBe(
    "pi pi-user",
  );
  fireEvent.click(card);
  expect(screen.getByText("Consulta existente")).toBeTruthy();
});

it("preserva funcionalidades em definição visíveis sem link", () => {
  render(
    <MemoryRouter>
      <ModuleNavigationCard {...props} disponivel={false} />
    </MemoryRouter>,
  );
  expect(screen.queryByRole("link")).toBeNull();
  expect(
    screen
      .getByText("Em definição")
      .closest("article")
      ?.getAttribute("aria-disabled"),
  ).toBe("true");
});

it("respeita as chaves de permissão e mantém suporte a uma cor específica", () => {
  const { rerender } = render(
    <MemoryRouter>
      <ModuleNavigationCard
        {...props}
        permissionKeys={["consultar-pessoas"]}
        permissoes={[]}
      />
    </MemoryRouter>,
  );
  expect(screen.queryByText("Pessoa Física")).toBeNull();
  rerender(
    <MemoryRouter>
      <ModuleNavigationCard
        {...props}
        permissionKeys={["consultar-pessoas"]}
        permissoes={["consultar-pessoas"]}
        cor="var(--sigep-modulo-pessoas)"
      />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("link").style.getPropertyValue("--sigep-cor-modulo"),
  ).toBe("var(--sigep-modulo-pessoas)");
});

it("Pessoas conserva seus cinco cards, uma rota disponível e quatro funcionalidades em definição", () => {
  const itens = [
    props,
    { ...props, titulo: "Pessoa Jurídica", icone: "pi pi-building" },
    { ...props, titulo: "Dependente", icone: "pi pi-users" },
    { ...props, titulo: "Tipo Dependência", icone: "pi pi-tags" },
    { ...props, titulo: "Representante Legal", icone: "pi pi-id-card" },
  ].map((item, indice) => ({
    titulo: item.titulo,
    descricao: item.descricao,
    icone: item.icone,
    destino:
      indice === 0 ? "/prototipos/sigep/pessoas/327305/vinculos" : undefined,
  }));
  render(
    <MemoryRouter>
      <MenuCardsContent
        titulo="Pessoas"
        descricao="Selecione uma área."
        itens={itens}
      />
    </MemoryRouter>,
  );
  expect(
    screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
  ).toEqual(itens.map((item) => item.titulo));
  expect(screen.getAllByText("Em definição")).toHaveLength(4);
  expect(screen.getByRole("link").getAttribute("href")).toBe(itens[0].destino);
});

it.each([
  [
    "Cadastro",
    CadastroGeralContent,
    10,
    "/prototipos/sigep/pessoas/327305/vinculos",
  ],
  [
    "Controle de Vagas",
    ControleVagasGeralContent,
    5,
    "/prototipos/sigep/controle-vagas/dashboard",
  ],
  ["Ingresso", IngressoGeralContent, 5, "/prototipos/sigep/ingressos/dashboard"],
  [
    "Vínculos Funcionais",
    VinculosFuncionaisGeralContent,
    5,
    "/prototipos/sigep/dashboard-vinculos",
  ],
  [
    "Controle de Certame",
    ControleCertameGeralContent,
    5,
    "/prototipos/sigep/controle-pss/certames",
  ],
  [
    "Vacância",
    VacanciaGeralContent,
    9,
    "/prototipos/sigep/vacancia/exoneracao",
  ],
  [
    "Efetivos",
    VagasEfetivosContent,
    2,
    "/prototipos/sigep/controle-vagas/quadro-autorizado",
  ],
  [
    "Temporários",
    VagasTemporariosContent,
    2,
    "/prototipos/sigep/controle-vagas/temporarios/quadro-autorizado",
  ],
  [
    "Bolsistas",
    VagasResidentesContent,
    2,
    "/prototipos/sigep/controle-vagas/bolsistas/quadro-autorizado",
  ],
  [
    "Comissionados",
    VagasComissionadosContent,
    3,
    "/prototipos/sigep/controle-vagas/comissionados/quadro-autorizado",
  ],
] as const)(
  "%s utiliza o componente global sem mudar a quantidade nem o primeiro destino",
  (_nome, Content, quantidade, destino) => {
    render(
      <MemoryRouter>
        <Content />
      </MemoryRouter>,
    );
    const cards = screen.getAllByRole("link");
    expect(cards).toHaveLength(quantidade);
    expect(cards[0].getAttribute("href")).toBe(destino);
    expect(
      cards.every((card) =>
        card.classList.contains("sigep-module-navigation-card"),
      ),
    ).toBe(true);
  },
);
