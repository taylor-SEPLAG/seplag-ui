// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { loadFolhaCronogramaState } from "../PrototiposPage";
import { useCronogramaFolha } from "./useCronogramaFolha";
import { adaptarCronograma, EVENTO_CRONOGRAMA_ATUALIZADO } from "./model";

const chave = "prototipos.folha.cronograma";
const novaFonte = {
  tituloCiclo: "Novembro/2026",
  secoes: [
    {
      id: 8,
      titulo: "Folha complementar",
      marcador: "is-main",
      eventos: [
        {
          periodo: "01/11 - 02/11 - 18:00",
          descricao: "Prazo atualizado na origem",
          status: "Pendente",
        },
      ],
    },
  ],
};
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

it("inclui os eventos demonstrativos de junho, novembro e dezembro na Folha", () => {
  const fonte = loadFolhaCronogramaState();
  const antes = JSON.stringify(fonte);
  const calendario = adaptarCronograma(fonte);
  expect(calendario.eventos).toHaveLength(36);
  expect(calendario.eventos.filter(e => e.inicio.startsWith("2026-11"))).toHaveLength(12);
  expect(calendario.eventos.filter(e => e.inicio.startsWith("2026-12"))).toHaveLength(12);
  expect(calendario.eventos.every((e) => e.competencia === "2026-06")).toBe(
    true,
  );
  expect(calendario.tipos).toHaveLength(2);
  expect(calendario.semData).toBe(0);
  expect(calendario.eventos[0].inicio).toBe("2026-06-03");
  expect(JSON.stringify(fonte)).toBe(antes);
  expect(localStorage.getItem(chave)).not.toBeNull();
});

function Consulta() {
  const calendario = useCronogramaFolha();
  return (
    <div>
      <h1>{calendario.titulo}</h1>
      {calendario.eventos.map((e) => (
        <p key={e.id}>{e.nome}</p>
      ))}
    </div>
  );
}

it("consulta acompanha o sinal de atualização da origem sem criar ou modificar registros", () => {
  render(<Consulta />);
  expect(screen.getByRole("heading").textContent).toContain("Junho/2026");
  const registro = JSON.stringify(novaFonte);
  act(() => {
    localStorage.setItem(chave, registro);
    window.dispatchEvent(new Event(EVENTO_CRONOGRAMA_ATUALIZADO));
  });
  expect(screen.getByText("Prazo atualizado na origem")).toBeTruthy();
  expect(localStorage.getItem(chave)).toBe(registro);
});

it("acompanha atualização em outra aba e respeita cronograma vazio sem recriar os dados de demonstração", () => {
  render(<Consulta />);
  act(() => {
    localStorage.setItem(chave, JSON.stringify(novaFonte));
    window.dispatchEvent(new StorageEvent("storage", { key: chave }));
  });
  expect(screen.getByText("Prazo atualizado na origem")).toBeTruthy();
  act(() => {
    localStorage.setItem(
      chave,
      JSON.stringify({ tituloCiclo: "Novembro/2026", secoes: [] }),
    );
    window.dispatchEvent(new Event(EVENTO_CRONOGRAMA_ATUALIZADO));
  });
  expect(loadFolhaCronogramaState().secoes).toEqual([]);
  expect(screen.queryByText("Prazo atualizado na origem")).toBeNull();
});

it("integra exemplos aos dados salvos uma vez e preserva eventos personalizados", () => {
  const inicial = loadFolhaCronogramaState();
  const principal = inicial.secoes[0];
  principal.eventos = principal.eventos.filter(e => !e.periodo.includes("/11/2026") && !e.periodo.includes("/12/2026"));
  principal.eventos.push({ periodo: "01/11/2026 - 01/11/2026 - 10:00", descricao: "Evento personalizado", status: "Agendado" });
  localStorage.setItem(chave, JSON.stringify(inicial));
  localStorage.removeItem(chave + ".exemplos-nov-dez-2026");
  const primeiro = loadFolhaCronogramaState();
  expect(primeiro.secoes[0].eventos.some(e => e.descricao === "Evento personalizado")).toBe(true);
  expect(loadFolhaCronogramaState()).toEqual(primeiro);
});

it("carrega novembro e dezembro no calendario de um cronograma ja salvo", () => {
  localStorage.setItem(chave, JSON.stringify({ tituloCiclo: "Junho/2026", secoes: [{ id: 1, titulo: "Folha principal", marcador: "is-main", eventos: [] }, { id: 2, titulo: "Rescis\u00e3o - Folha 31", marcador: "is-rescission", eventos: [] }] }));
  const dados = adaptarCronograma(loadFolhaCronogramaState());
  expect(dados.eventos.filter(e => e.inicio.startsWith("2026-11"))).toHaveLength(12);
  expect(dados.eventos.filter(e => e.inicio.startsWith("2026-12"))).toHaveLength(12);
});
