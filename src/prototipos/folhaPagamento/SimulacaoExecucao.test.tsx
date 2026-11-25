// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SimulacaoExecucao } from "./SimulacaoExecucao";
import type {
  GrupoResultado,
  ResultadoSimulacao,
  VinculoSimulacao,
} from "./simulacaoExecucaoModelo";
const grupo = (ids: string[] = []): GrupoResultado => ({
  id: 1,
  grupo: "Grupo de teste",
  chave: "1",
  versao: 4,
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
  peso: 10,
  pendencias: 0,
  vinculosIds: ids,
});
afterEach(cleanup);
const montar = (
  resultado: ResultadoSimulacao,
  consultar: (
    ids: string[],
    inicio: number,
    quantidade: number,
  ) => VinculoSimulacao[] = vi.fn(() => [] as VinculoSimulacao[]),
) =>
  render(
    <MemoryRouter>
      <SimulacaoExecucao
        resultado={resultado}
        invalida={false}
        onSimular={() => {}}
        consultar={consultar}
      />
    </MemoryRouter>,
  );
it("mostra zero grupos e vínculos não consultados com impedimento vermelho", () => {
  montar({ grupos: [], total: null, apta: false, impedimentos: [] });
  expect(screen.getByText("Nenhum Grupo de Cálculo encontrado")).toBeTruthy();
  expect(screen.queryByText(/0 vínculos/)).toBeNull();
  expect(document.querySelector(".simulacao-faixa.is-erro")).toBeTruthy();
  expect(screen.queryByRole("table")).toBeNull();
});
it("mantém a grid com grupo e zero vínculos e alerta amarelo", () => {
  montar({ grupos: [grupo()], total: 0, apta: false, impedimentos: [] });
  expect(screen.getByText("Nenhum vínculo elegível encontrado")).toBeTruthy();
  expect(screen.getByText("Grupo de teste")).toBeTruthy();
  expect(screen.queryByRole("link", { name: /Grupo de teste/ })).toBeNull();
  expect(document.querySelector(".simulacao-faixa.is-alerta")).toBeTruthy();
  expect(document.querySelector(".simulacao-indicadores")).toBeNull();
  expect(screen.getByText("Nenhum vínculo")).toBeTruthy();
  expect(screen.getByText("01/01/2026 — Atual")).toBeTruthy();
});
it("carrega apenas a página dos vínculos ao expandir o grupo", () => {
  const ids = Array.from({ length: 25 }, (_, i) => String(i + 1)),
    consultar = vi.fn((todos: string[], inicio: number, tamanho: number) =>
      todos.slice(inicio, inicio + tamanho).map((id) => ({
        id,
        matricula: id,
        nome: "Servidor " + id,
        numero: "1",
        tipo: "Efetivo",
        regime: "Civil",
        orgao: "SEPLAG",
        setor: "Central",
        cargo: "Analista",
        carreira: "Gestão",
        inicio: "2020-01-01",
        termino: "",
        situacao: "Ativo",
      })),
    );
  montar(
    { grupos: [grupo(ids)], total: 25, apta: true, impedimentos: [] },
    consultar,
  );
  expect(consultar).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: "Expandir Grupo de teste" }),
  );
  expect(
    screen.getByRole("heading", { name: "Grupo de teste · V4" }),
  ).toBeTruthy();
  expect(consultar.mock.calls.at(-1)?.slice(1)).toEqual([0, 10]);
  expect(screen.getByText("Servidor 1")).toBeTruthy();
  expect(screen.queryByText("Servidor 11")).toBeNull();
  fireEvent.click(
    within(
      screen.getByRole("navigation", {
        name: "Paginação dos vínculos de Grupo de teste",
      }),
    ).getByRole("button", { name: /next page|próxima página/i }),
  );
  expect(consultar.mock.calls.at(-1)?.slice(1)).toEqual([10, 10]);
  expect(screen.getByText("Servidor 11")).toBeTruthy();
  expect(screen.queryByText("Servidor 1")).toBeNull();
});

it("consolida o cenário misto em faixa e resumo, sem cards nem repetição de vínculos", () => {
  const geral = { ...grupo(), grupo: "Geral" },
    efetivos = {
      ...grupo(["1", "2", "3", "4"]),
      id: 2,
      chave: "2",
      grupo: "Efetivos",
      versao: 2,
    };
  montar({ grupos: [geral, efetivos], total: 4, apta: true, impedimentos: [] });
  expect(screen.getByText("Simulação concluída")).toBeTruthy();
  expect(
    screen.getByText("2 grupos de cálculo encontrados · 4 vínculos elegíveis"),
  ).toBeTruthy();
  expect(
    screen.getByRole("heading", { name: "Grupos encontrados" }),
  ).toBeTruthy();
  expect(screen.getAllByRole("columnheader").map((c) => c.textContent)).toEqual(
    ["", "Grupo de Cálculo", "Versão", "Vigência", "Vínculos encontrados"],
  );
  expect(screen.getAllByText("Nenhum vínculo")).toHaveLength(1);
  expect(screen.getByText("2 grupos encontrados")).toBeTruthy();
  expect(screen.getByText("4 vínculos elegíveis")).toBeTruthy();
  expect(document.querySelector(".simulacao-indicadores")).toBeNull();
  expect(screen.queryByText(/Abrangência encontrada/)).toBeNull();
  expect(document.querySelectorAll(".simulacao-faixa.is-sucesso")).toHaveLength(
    1,
  );
});

it("pagina os grupos sem alterar os totais consolidados e reinicia ao simular", () => {
  const grupos = Array.from({ length: 14 }, (_, i) => ({
    ...grupo([String(i)]),
    id: i + 1,
    chave: String(i + 1),
    grupo: "Grupo " + (i + 1),
  }));
  montar({ grupos, total: 14, apta: true, impedimentos: [] });
  expect(screen.getByText("Grupo 1")).toBeTruthy();
  expect(screen.queryByText("Grupo 11")).toBeNull();
  const navegacao = within(
    screen.getByRole("navigation", {
      name: "Paginação dos grupos encontrados",
    }),
  );
  fireEvent.click(
    navegacao.getByRole("button", { name: /next page|próxima página/i }),
  );
  expect(screen.queryByText("Grupo 1")).toBeNull();
  expect(screen.getByText("Grupo 11")).toBeTruthy();
  expect(screen.getByText("14 grupos encontrados")).toBeTruthy();
  expect(screen.getByText("14 vínculos elegíveis")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Simular execução" }));
  expect(screen.getByText("Grupo 1")).toBeTruthy();
  expect(screen.queryByText("Grupo 11")).toBeNull();
});
