// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { VidaFuncionalPage } from "./VidaFuncionalPage";
import {
  filtrosVazios,
  pesquisarPessoas,
  pesquisarEventos,
  indicadores,
} from "./model";
afterEach(cleanup);
it("localiza matrícula encerrada e aplica filtros ao mesmo vínculo", () => {
  expect(
    pesquisarPessoas({ ...filtrosVazios, matricula: "418920" }).map(
      (p) => p.id,
    ),
  ).toEqual(["3"]);
  expect(
    pesquisarPessoas({
      ...filtrosVazios,
      matricula: "418920",
      situacao: "Ativo",
    }),
  ).toEqual([]);
  expect(
    pesquisarPessoas({ ...filtrosVazios, nome: "jose antonio" }).map(
      (p) => p.id,
    ),
  ).toEqual(["4"]);
});
it("separa aposentadoria e preserva eventos simultâneos e retroativos", () => {
  expect(pesquisarEventos("carlos-1").map((e) => e.tipo)).toEqual([
    "Encerramento",
    "Ingresso",
  ]);
  expect(pesquisarEventos("carlos-2").map((e) => e.tipo)).toEqual(["Ingresso"]);
  const lista = pesquisarEventos("ana-1");
  expect(lista.filter((e) => e.data === "2026-10-01")).toHaveLength(2);
  expect(lista.map((e) => e.data)).toEqual(
    [...lista.map((e) => e.data)].sort().reverse(),
  );
  expect(
    pesquisarEventos("ana-1", "", "2024-04-01", "2024-04-01")[0].registradoEm,
  ).toContain("2024-05-14");
  expect(indicadores(new Date("2026-10-09T12:00:00Z"))).toEqual([8, 6, 4, 3]);
});
it('inclui históricos específicos de residência técnica e estágio nos filtros', () => {
  expect(pesquisarPessoas({...filtrosVazios,tipo:'Residente Técnico'}).map(p=>p.nome)).toContain('Camila Rodrigues Almeida');
  expect(pesquisarPessoas({...filtrosVazios,tipo:'Estagiário'}).map(p=>p.nome)).toContain('Lucas Henrique Costa');
  const residente = pesquisarEventos('camila-residente-1');
  const estagiario = pesquisarEventos('lucas-estagiario-1');
  expect(residente.map(e=>e.tipo)).toEqual(['Alteração de supervisão','Retorno ao exercício','Recesso remunerado','Ingresso']);
  expect(estagiario.map(e=>e.tipo)).toEqual(['Retorno ao exercício','Recesso remunerado','Prorrogação de contrato','Ingresso']);
  expect(residente.find(e=>e.tipo==='Ingresso')?.secoes['Dados da Residência']).toBeTruthy();
  expect(estagiario.find(e=>e.tipo==='Ingresso')?.secoes['Dados do Estágio']).toBeTruthy();
  expect([...residente,...estagiario].some(e=>e.tipo==='Férias'||e.tipo==='Progressão funcional')).toBe(false);
});
it("expande vários servidores, abre o histórico e preserva os accordions no retorno", () => {
  render(
    <MemoryRouter initialEntries={["/prototipos/sigep/vida-funcional"]}>
      <Routes>
        <Route
          path="/prototipos/sigep/vida-funcional"
          element={<VidaFuncionalPage />}
        />
        <Route
          path="/prototipos/sigep/vida-funcional/:pessoaId/vinculos"
          element={<VidaFuncionalPage />}
        />
        <Route
          path="/prototipos/sigep/vida-funcional/:pessoaId/vinculos/:vinculoId/historico"
          element={<VidaFuncionalPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.click(
    screen.getAllByRole("button", { name: "Expandir vínculos" })[0],
  );
  fireEvent.click(
    screen.getAllByRole("button", { name: "Expandir vínculos" })[0],
  );
  expect(screen.getAllByText("Vínculos do Servidor")).toHaveLength(2);
  fireEvent.click(
    screen.getAllByRole("link", { name: "Ver Histórico da Vida Funcional" })[0],
  );
  const jornada = screen.getByRole("button", { name: /Jornada de 30 para 40/ });
  const cargo = screen.getByRole("button", {
    name: /Designação para função de coordenação/,
  });
  fireEvent.click(jornada);
  fireEvent.click(cargo);
  expect(jornada.getAttribute("aria-expanded")).toBe("true");
  expect(cargo.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByText("Jornada anterior")).toBeTruthy();
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(jornada);
  expect(screen.queryByText("Jornada anterior")).toBeNull();
  fireEvent.click(screen.getAllByRole("link", { name: "Voltar" }).at(-1)!);
  expect(
    screen.getByRole("heading", { name: "Histórico Funcional" }),
  ).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "Página 1 de servidores" })
      .getAttribute("aria-current"),
  ).toBe("page");
  expect(
    (
      screen.getByRole("combobox", {
        name: "Registros por página de servidores",
      }) as HTMLSelectElement
    ).value,
  ).toBe("10");
  expect(screen.getAllByText("Vínculos do Servidor")).toHaveLength(2);
});
it("aplica tipo e situação também aos vínculos da grid interna", () => {
  render(
    <MemoryRouter initialEntries={["/prototipos/sigep/vida-funcional"]}>
      <Routes>
        <Route
          path="/prototipos/sigep/vida-funcional"
          element={<VidaFuncionalPage />}
        />
        <Route
          path="/prototipos/sigep/vida-funcional/:pessoaId/vinculos/:vinculoId/historico"
          element={<VidaFuncionalPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Tipo de Vínculo"), {
    target: { value: "Contrato Temporário" },
  });
  expect(screen.queryByText("Ana Paula Ribeiro")).toBeNull();
  fireEvent.click(
    screen.getAllByRole("button", { name: "Expandir vínculos" })[0],
  );
  const expandida = screen
    .getByText("Vínculos do Servidor")
    .closest(".vf-expanded") as HTMLElement;
  expect(within(expandida).getByText("Contrato Temporário")).toBeTruthy();
  expect(within(expandida).queryByText("Nomeado Efetivo")).toBeNull();
  fireEvent.change(screen.getByLabelText("Situação do Vínculo"), {
    target: { value: "Encerrado" },
  });
  expect(
    screen.getAllByRole("link", { name: "Ver Histórico da Vida Funcional" })
      .length,
  ).toBeGreaterThan(0);
});
it("redireciona a rota intermediária antiga para a consulta com o servidor expandido", () => {
  render(
    <MemoryRouter
      initialEntries={["/prototipos/sigep/vida-funcional/1/vinculos"]}
    >
      <Routes>
        <Route
          path="/prototipos/sigep/vida-funcional"
          element={<VidaFuncionalPage />}
        />
        <Route
          path="/prototipos/sigep/vida-funcional/:pessoaId/vinculos"
          element={<VidaFuncionalPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("heading", { name: "Histórico Funcional" }),
  ).toBeTruthy();
  expect(screen.getByText("Vínculos do Servidor")).toBeTruthy();
});
