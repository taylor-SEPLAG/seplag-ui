// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CalendarioContent } from "./CalendarioContent";
import {
  adaptarCronograma,
  dataBR,
  diasCalendario,
  eventosDoDia,
  eventosDoMes,
  mudarMes,
  proximoEvento,
  situacaoEvento,
  vencimento,
  type FonteCronograma,
} from "./model";

const agora = new Date("2026-06-12T12:00:00-04:00");
const fonte: FonteCronograma = {
  tituloCiclo: "Ciclo de folha de pagamento — Junho/2026",
  secoes: [
    {
      id: 1,
      titulo: "Folha principal",
      marcador: "is-main",
      eventos: [
        {
          periodo: "14/06 - 16/06 - 18:00",
          descricao: "Envio de documentos",
          status: "Agendado",
        },
        {
          periodo: "14/06 - 14/06 - 18:00",
          descricao: "Carga de consignados",
          status: "Em Andamento",
        },
        {
          periodo: "14/06 - 14/06 - 17:00",
          descricao: "Consolidação",
          status: "Concluído",
        },
        { periodo: "14/06 - 14/06 - 16:00", descricao: "Evento sem situação" },
      ],
    },
    {
      id: 2,
      titulo: "Rescisão — Folha 31",
      marcador: "is-rescission",
      observacao: "Conferir desligamentos",
      eventos: [
        {
          periodo: "14/06 - 14/06 - 11:00",
          descricao: "Cancelamento de pagamento",
          status: "Pendente",
        },
      ],
    },
  ],
};
afterEach(cleanup);
const calendario = () => adaptarCronograma(fonte, agora);
const montar = () =>
  render(
    <MemoryRouter>
      <CalendarioContent calendario={calendario()} agora={agora} />
    </MemoryRouter>,
  );

it("usa o ano da competência e mantém os eventos em cada dia do período, inclusive entre meses", () => {
  const dados = calendario();
  expect(dados.competencia).toBe("2026-06");
  expect(eventosDoDia(dados.eventos, "2026-06-14")).toHaveLength(5);
  expect(eventosDoDia(dados.eventos, "2026-06-15")).toHaveLength(1);
  expect(eventosDoDia(dados.eventos, "2026-06-16")).toHaveLength(1);
  expect(eventosDoDia(dados.eventos, "2026-06-17")).toHaveLength(0);
  const atravessado = adaptarCronograma({
    tituloCiclo: "Dezembro/2027",
    secoes: [
      {
        id: 5,
        titulo: "Extra",
        eventos: [
          {
            periodo: "30/12 - 02/01 - 10:30",
            descricao: "Período",
            status: "Pendente",
          },
        ],
      },
    ],
  });
  expect(atravessado.eventos[0].fim).toBe("2028-01-02");
  expect(eventosDoMes(atravessado.eventos, "2028-01")).toHaveLength(1);
});

it("não conclui eventos pendentes nem eventos sem situação só porque a data passou", () => {
  const dados = calendario();
  const passado = new Date("2026-10-12T12:00:00-04:00");
  expect(
    situacaoEvento(
      dados.eventos.find((e) => e.nome === "Envio de documentos")!,
      passado,
    ).nome,
  ).toBe("Atrasado");
  expect(
    situacaoEvento(
      dados.eventos.find((e) => e.nome === "Carga de consignados")!,
      passado,
    ).nome,
  ).toBe("Em andamento");
  expect(
    situacaoEvento(
      dados.eventos.find((e) => e.nome === "Consolidação")!,
      passado,
    ).nome,
  ).toBe("Concluído");
  expect(
    situacaoEvento(
      dados.eventos.find((e) => e.nome === "Evento sem situação")!,
      passado,
    ).nome,
  ).toBe("Não informado");
});

it("calcula o prazo em Cuiabá, destaca os sete dias e prioriza o pendente mais próximo", () => {
  const dados = calendario();
  const proximo = proximoEvento(dados.eventos, agora)!;
  expect(proximo.nome).toBe("Cancelamento de pagamento");
  expect(vencimento(proximo)).toBe(Date.parse("2026-06-14T15:00:00Z"));
  expect(situacaoEvento(proximo, agora).nome).toBe("Próximo do vencimento");
  expect(
    situacaoEvento(proximo, new Date("2026-06-01T12:00:00-04:00")).nome,
  ).toBe("Pendente");
  expect(
    proximoEvento(dados.eventos, new Date("2026-10-12T12:00:00-04:00")),
  ).toBeUndefined();
});

it("aceita marcos de um dia e denuncia datas inválidas sem inventar datas", () => {
  const dados = adaptarCronograma({
    tituloCiclo: "Julho/2027",
    secoes: [
      {
        id: 5,
        titulo: "Extra",
        eventos: [
          { periodo: "15/07 - 10:00", descricao: "Um dia", status: "Pendente" },
          {
            periodo: "31/02 - 01/03",
            descricao: "Inválido",
            status: "Pendente",
          },
        ],
      },
    ],
  });
  expect(dados.eventos[0].inicio).toBe("2027-07-15");
  expect(dados.eventos[0].fim).toBe("2027-07-15");
  expect(dados.semData).toBe(1);
});

it("monta a grade começando na segunda-feira e navega na virada do ano", () => {
  expect(diasCalendario("2026-06")[0]).toBe("2026-06-01");
  expect(diasCalendario("2026-07")[0]).toBe("2026-06-29");
  expect(diasCalendario("2026-06")).toHaveLength(35);
  expect(diasCalendario("2026-08")).toHaveLength(42);
  expect(diasCalendario("2027-02")).toHaveLength(28);
  expect(mudarMes("2026-12", 1)).toBe("2027-01");
  expect(mudarMes("2026-01", -1)).toBe("2025-12");
});

it("limita os marcos por célula e mostra todos os eventos nos detalhes do dia", () => {
  montar();
  const dia = screen.getByRole("button", { name: "14/06/2026 — 5 eventos" });
  expect(dia.querySelectorAll(".sigep-cronograma-marco")).toHaveLength(2);
  expect(dia.querySelector(".sigep-cronograma-mais")?.textContent).toBe("+3");
  fireEvent.click(dia);
  const detalhes = screen.getByRole("region", {
    name: "Eventos da data selecionada",
  });
  const cabecalho = within(detalhes).getByRole("heading", {
    level: 2,
    name: /Eventos de 14\/06\/2026/,
  });
  expect(cabecalho.querySelector(".pi-calendar")).not.toBeNull();
  expect(within(detalhes).getAllByRole("heading", { level: 3 })).toHaveLength(
    5,
  );
  expect(within(detalhes).getByText("Conferir desligamentos")).toBeTruthy();
  expect(within(detalhes).getByText("Concluído")).toBeTruthy();
  expect(within(detalhes).getByText("Não informado")).toBeTruthy();
  expect(within(detalhes).getByText("5 eventos")).toBeTruthy();
  const linhas = Array.from(
    detalhes.querySelectorAll<HTMLElement>(".sigep-cronograma-evento"),
  );
  expect(linhas.map((linha) => linha.style.backgroundColor)).toContain(
    "rgb(243, 247, 255)",
  );
  expect(linhas.map((linha) => linha.style.backgroundColor)).toContain(
    "rgb(255, 244, 234)",
  );
  const marcos = Array.from(
    dia.querySelectorAll<HTMLElement>(".sigep-cronograma-marco"),
  );
  expect(
    marcos.every((marco) => marco.style.color === "rgb(255, 255, 255)"),
  ).toBe(true);
  fireEvent.click(
    screen.getByRole("button", { name: "17/06/2026 — 0 eventos" }),
  );
  expect(
    screen.getByText("Nenhum evento programado para esta data."),
  ).toBeTruthy();
});

it("filtra nas duas visualizações e retorna da lista ao dia correspondente", () => {
  montar();
  fireEvent.change(screen.getByLabelText("Buscar evento"), {
    target: { value: "ENVIO" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Lista" }));
  const lista = document.querySelector(".sigep-cronograma-lista")!;
  expect(lista.querySelectorAll("button")).toHaveLength(1);
  fireEvent.click(within(lista as HTMLElement).getByRole("button"));
  expect(
    screen
      .getByRole("button", { name: "14/06/2026 — 1 eventos" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Limpar filtro" }));
  fireEvent.change(screen.getByLabelText("Tipo de folha"), {
    target: { value: "2" },
  });
  expect(
    screen.getByRole("button", { name: "14/06/2026 — 1 eventos" }),
  ).toBeTruthy();
});

it("mês sem cronograma tem mensagem própria e a tela não permite nenhuma manutenção", () => {
  montar();
  fireEvent.click(screen.getByRole("button", { name: "Próximo mês" }));
  expect(
    screen.getByText("Nenhum cronograma disponível para este período."),
  ).toBeTruthy();
  expect(
    screen.queryByRole("button", {
      name: /Salvar|Excluir|Concluir|Reprogramar|Editar|Adicionar/i,
    }),
  ).toBeNull();
  const vazio = adaptarCronograma({ tituloCiclo: "Junho/2026", secoes: [] });
  expect(vazio.eventos).toEqual([]);
  expect(dataBR("2026-06-01")).toBe("01/06/2026");
});
