// @vitest-environment jsdom
import type { ReactNode } from "react";
import "fake-indexeddb/auto";
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
import {
  EditarCicloContent,
  GestaoCiclosContent,
  VisualizarCicloContent,
} from "./GestaoCiclosPage";
import {
  calendarioCiclo,
  DUPLICADO,
  excluirCiclo,
  listarCiclos,
  salvarCiclo,
  type CicloCronograma,
} from "./ciclosRepository";
const ciclo = (
  competencia: string,
  descricao = "Evento do ciclo",
): CicloCronograma => ({
  competencia,
  configuracao: {
    tituloCiclo: "Eventos gerais",
    secoes: [
      {
        id: 1,
        titulo: "Eventos",
        marcador: "is-main",
        eventos: [
          {
            periodo: `03/${competencia.slice(5)}/${competencia.slice(0, 4)} - 03/${competencia.slice(5)}/${competencia.slice(0, 4)}`,
            descricao,
            status: "Agendado",
          },
        ],
      },
    ],
  },
});
beforeEach(async () => {
  localStorage.clear();
  await listarCiclos();
  await new Promise<void>((resolve, reject) => {
    const r = indexedDB.open("sigep-cronograma-ciclos", 1);
    r.onsuccess = () => {
      const db = r.result,
        tx = db.transaction(["ciclos", "meta"], "readwrite");
      tx.objectStore("ciclos").clear();
      tx.objectStore("meta").clear();
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onabort = () => reject(tx.error);
    };
  });
});
afterEach(cleanup);
it("impede duplicidade transacional, inclusive em criações concorrentes", async () => {
  const resultados = await Promise.allSettled([
    salvarCiclo(ciclo("2026-11"), true),
    salvarCiclo(ciclo("2026-11"), true),
  ]);
  expect(resultados.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  expect(resultados.find((r) => r.status === "rejected")).toMatchObject({
    reason: Error(DUPLICADO),
  });
  expect(await listarCiclos()).toHaveLength(1);
});
it("edita e exclui somente o ciclo escolhido e não recria ciclo excluído por edição antiga", async () => {
  await salvarCiclo(ciclo("2026-11", "Novembro"), true);
  await salvarCiclo(ciclo("2026-12", "Dezembro"), true);
  await salvarCiclo(ciclo("2026-11", "Alterado"), false);
  expect(
    (await listarCiclos())[1].configuracao.secoes[0].eventos[0].descricao,
  ).toBe("Dezembro");
  await excluirCiclo("2026-11");
  await expect(salvarCiclo(ciclo("2026-11"), false)).rejects.toThrow(
    "não existe mais",
  );
  expect((await listarCiclos()).map((c) => c.competencia)).toEqual(["2026-12"]);
});
it("migra fonte existente uma vez e não a restaura após exclusão", async () => {
  localStorage.setItem(
    "prototipos.folha.cronograma",
    JSON.stringify({
      ...ciclo("2026-06").configuracao,
      tituloCiclo: "Junho/2026",
    }),
  );
  expect((await listarCiclos()).map((c) => c.competencia)).toEqual(["2026-06"]);
  await excluirCiclo("2026-06");
  expect(await listarCiclos()).toEqual([]);
  expect(localStorage.getItem("prototipos.folha.cronograma")).toBeTruthy();
});
it("mostra apenas ciclos cadastrados e desabilita meses existentes sem cadastrar rascunho", async () => {
  const ano = new Intl.DateTimeFormat("en", {
    year: "numeric",
    timeZone: "America/Cuiaba",
  }).format(new Date());
  await salvarCiclo(ciclo(`${ano}-11`), true);
  render(
    <MemoryRouter>
      <GestaoCiclosContent />
    </MemoryRouter>,
  );
  await screen.findByText(`Novembro/${ano}`);
  expect(screen.getAllByRole("columnheader").map((h) => h.textContent)).toEqual(
    ["Ciclo (Mês/Ano)", "Quantidade de eventos", "Última atualização", "Ações"],
  );
  fireEvent.click(screen.getByRole("button", { name: "Novo ciclo" }));
  const f = within(screen.getByRole("dialog"));
  expect(
    (f.getByRole("option", { name: "novembro" }) as HTMLOptionElement).disabled,
  ).toBe(true);
  fireEvent.change(f.getByLabelText("Mês"), { target: { value: "12" } });
  fireEvent.click(f.getByRole("button", { name: "Cancelar" }));
  expect(await listarCiclos()).toHaveLength(1);
});
it("visualiza exclusivamente o ciclo escolhido sem ações de alteração", async () => {
  await salvarCiclo(ciclo("2027-02", "Evento fevereiro"), true);
  await salvarCiclo(ciclo("2027-03", "Evento março"), true);
  render(
    <MemoryRouter initialEntries={["/ciclos/2027-02"]}>
      <Routes>
        <Route
          path="/ciclos/:competencia"
          element={<VisualizarCicloContent />}
        />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByRole("heading", { name: /fevereiro de 2027/i });
  expect(
    screen.queryByRole("button", { name: "Configurar cronograma" }),
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: /Lista/ }));
  expect(screen.getByText("Evento fevereiro")).toBeTruthy();
  expect(screen.queryByText("Evento março")).toBeNull();
  expect(calendarioCiclo(ciclo("2027-02")).competencia).toBe("2027-02");
});
it("exclui somente após confirmação e exibe estado vazio", async () => {
  const ano = new Intl.DateTimeFormat("en", {
    year: "numeric",
    timeZone: "America/Cuiaba",
  }).format(new Date());
  await salvarCiclo(ciclo(`${ano}-11`), true);
  render(
    <MemoryRouter>
      <GestaoCiclosContent />
    </MemoryRouter>,
  );
  await screen.findByText(`Novembro/${ano}`);
  fireEvent.click(
    screen.getByRole("button", { name: `Excluir Novembro/${ano}` }),
  );
  const modal = within(screen.getByRole("dialog"));
  expect(modal.getByText(/Todos os eventos vinculados/)).toBeTruthy();
  expect(await listarCiclos()).toHaveLength(1);
  fireEvent.click(modal.getByRole("button", { name: "Excluir" }));
  await waitFor(() =>
    expect(
      screen.getByText("Nenhum ciclo cadastrado para o ano selecionado."),
    ).toBeTruthy(),
  );
});

vi.mock("@componentes/layout/layout/Layout", () => ({
  LayoutSeplag: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));
it("cria o ciclo somente ao salvar a configuração no editor existente", async () => {
  render(
    <MemoryRouter
      initialEntries={[
        "/prototipos/sigep/cronograma/configurar/2028-04?novo=1",
      ]}
    >
      <Routes>
        <Route
          path="/prototipos/sigep/cronograma/configurar/:competencia"
          element={<EditarCicloContent />}
        />
        <Route
          path="/prototipos/sigep/cronograma/ciclos"
          element={<p>Ciclos salvos</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByText("Título do ciclo");
  expect(await listarCiclos()).toHaveLength(0);
  fireEvent.click(screen.getByRole("button", { name: "Nova seção" }));
  fireEvent.click(screen.getByRole("button", { name: "Adicionar evento" }));
  fireEvent.change(screen.getByLabelText("Descrição do evento"), {
    target: { value: "Reunião de planejamento" },
  });
  expect(await listarCiclos()).toHaveLength(0);
  expect(localStorage.getItem("prototipos.folha.cronograma")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  await screen.findByText("Ciclos salvos");
  const salvos = await listarCiclos();
  expect(salvos).toHaveLength(1);
  expect(salvos[0].competencia).toBe("2028-04");
  expect(salvos[0].configuracao.secoes[0].eventos[0].descricao).toBe(
    "Reunião de planejamento",
  );
});

it("abre Configurar cronograma ao continuar um novo ciclo", async () => {
  render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<GestaoCiclosContent />} />
        <Route
          path="/prototipos/sigep/cronograma/configurar/:competencia"
          element={<p>Configuração do novo ciclo</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
  await waitFor(() =>
    expect(
      (screen.getByRole("button", { name: "Novo ciclo" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false),
  );
  expect(
    screen.getByRole("heading", { name: "Gestão de Ciclos do Cronograma" }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Novo ciclo" }));
  const modal = within(screen.getByRole("dialog"));
  fireEvent.change(modal.getByLabelText("Mês"), { target: { value: "04" } });
  fireEvent.click(modal.getByRole("button", { name: "Continuar" }));
  await screen.findByText("Configuração do novo ciclo");
  expect(await listarCiclos()).toHaveLength(0);
});

it("lista meses dos cronogramas legados com as quantidades correspondentes", async () => {
  const fonte = {
    tituloCiclo: "Junho/2026",
    secoes: [
      {
        id: 1,
        titulo: "Eventos",
        marcador: "is-main",
        eventos: [
          ...ciclo("2026-06").configuracao.secoes[0].eventos,
          ...ciclo("2026-11").configuracao.secoes[0].eventos,
          ...ciclo("2026-12").configuracao.secoes[0].eventos,
        ],
      },
    ],
  };
  localStorage.setItem("prototipos.folha.cronograma", JSON.stringify(fonte));
  const ciclos = await listarCiclos();
  expect(
    ciclos.map((c) => [
      c.competencia,
      c.configuracao.secoes.reduce((n, s) => n + s.eventos.length, 0),
    ]),
  ).toEqual([
    ["2026-06", 1],
    ["2026-11", 1],
    ["2026-12", 1],
  ]);
  await excluirCiclo("2026-11");
  expect((await listarCiclos()).map((c) => c.competencia)).toEqual([
    "2026-06",
    "2026-12",
  ]);
});
it("corrige a migração antiga e preserva ciclos cadastrados separadamente", async () => {
  const fonte = {
    tituloCiclo: "Junho/2026",
    secoes: [
      {
        id: 1,
        titulo: "Eventos",
        marcador: "is-main",
        eventos: [
          ...ciclo("2026-06").configuracao.secoes[0].eventos,
          ...ciclo("2026-11").configuracao.secoes[0].eventos,
        ],
      },
    ],
  };
  localStorage.setItem("prototipos.folha.cronograma", JSON.stringify(fonte));
  await new Promise<void>((resolve, reject) => {
    const r = indexedDB.open("sigep-cronograma-ciclos", 1);
    r.onsuccess = () => {
      const db = r.result,
        tx = db.transaction(["ciclos", "meta"], "readwrite");
      tx.objectStore("meta").put(true, "migrado");
      tx.objectStore("ciclos").put({
        competencia: "2026-06",
        configuracao: fonte,
      });
      tx.objectStore("ciclos").put(ciclo("2026-08", "Evento agosto"));
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onabort = () => reject(tx.error);
    };
  });
  const ciclos = await listarCiclos();
  expect(ciclos.map((c) => c.competencia)).toEqual([
    "2026-06",
    "2026-08",
    "2026-11",
  ]);
  expect(ciclos[0].configuracao.secoes[0].eventos).toHaveLength(1);
  expect(ciclos[1].configuracao.secoes[0].eventos[0].descricao).toBe(
    "Evento agosto",
  );
});

it("registra a última atualização ao salvar e exibe data e hora de Cuiabá", async () => {
  try {
    vi.setSystemTime(new Date("2026-05-20T18:32:00Z"));
    await salvarCiclo(ciclo("2026-11"), true);
    expect((await listarCiclos())[0].atualizadoEm).toBe(
      "2026-05-20T18:32:00.000Z",
    );
    vi.setSystemTime(new Date("2026-06-18T14:21:00Z"));
    await salvarCiclo(ciclo("2026-11", "Atualizado"), false);
    expect((await listarCiclos())[0].atualizadoEm).toBe(
      "2026-06-18T14:21:00.000Z",
    );
    render(
      <MemoryRouter>
        <GestaoCiclosContent />
      </MemoryRouter>,
    );
    expect(await screen.findByText("18/06/2026 10:21")).toBeTruthy();
  } finally {
    vi.useRealTimers();
  }
});
it("preenche a atualização inicial dos registros antigos uma vez e mantém a data persistida", async () => {
  localStorage.setItem(
    "prototipos.folha.cronograma",
    JSON.stringify({
      ...ciclo("2026-06").configuracao,
      tituloCiclo: "Junho/2026",
    }),
  );
  const antes = Date.now();
  const primeiro = (await listarCiclos())[0];
  expect(Date.parse(primeiro.atualizadoEm!)).toBeGreaterThanOrEqual(antes);
  expect(Date.parse(primeiro.atualizadoEm!)).toBeLessThanOrEqual(Date.now());
  expect((await listarCiclos())[0].atualizadoEm).toBe(primeiro.atualizadoEm);
});

it("abre a configuração em modo somente leitura pelo ícone antes de editar", async () => {
  const ano = new Intl.DateTimeFormat("en", {
    year: "numeric",
    timeZone: "America/Cuiaba",
  }).format(new Date());
  await salvarCiclo(ciclo(ano + "-11", "Evento para consulta"), true);
  const antes = await listarCiclos();
  render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<GestaoCiclosContent />} />
        <Route
          path="/prototipos/sigep/cronograma/configurar/:competencia"
          element={<EditarCicloContent />}
        />
      </Routes>
    </MemoryRouter>,
  );
  const visualizar = await screen.findByRole("button", {
    name: "Visualizar Novembro/" + ano,
  });
  const linha = visualizar.closest("tr")!;
  expect(
    within(linha)
      .getAllByRole("button")
      .map((b) => b.getAttribute("aria-label")),
  ).toEqual([
    "Visualizar Novembro/" + ano,
    "Editar Novembro/" + ano,
    "Excluir Novembro/" + ano,
  ]);
  fireEvent.click(visualizar);
  const campos = await screen.findByRole("group", {
    name: "Configuração do cronograma em modo de visualização",
  });
  expect((campos as HTMLFieldSetElement).disabled).toBe(true);
  expect(
    screen.getByLabelText("Descrição do evento").matches(":disabled"),
  ).toBe(true);
  expect(
    (screen.getByLabelText("Descrição do evento") as HTMLInputElement).value,
  ).toBe("Evento para consulta");
  expect(screen.queryByRole("button", { name: "Salvar" })).toBeNull();
  expect(campos.querySelector('[draggable="true"]')).toBeNull();
  expect(await listarCiclos()).toEqual(antes);
});

it("sugere a referência anterior mais recente e copia no editor sem cadastrar até salvar", async () => {
  await salvarCiclo(ciclo("2026-11", "Referência novembro"), true);
  await salvarCiclo(ciclo("2026-12", "Referência dezembro"), true);
  await salvarCiclo(ciclo("2027-02", "Ciclo futuro"), true);
  const anteriores = await listarCiclos();
  render(
    <MemoryRouter initialEntries={["/?ano=2027"]}>
      <Routes>
        <Route path="/" element={<GestaoCiclosContent />} />
        <Route
          path="/prototipos/sigep/cronograma/configurar/:competencia"
          element={<EditarCicloContent />}
        />
        <Route
          path="/prototipos/sigep/cronograma/ciclos"
          element={<p>Retornou aos ciclos</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
  await waitFor(() =>
    expect(
      (screen.getByRole("button", { name: "Novo ciclo" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false),
  );
  fireEvent.click(screen.getByRole("button", { name: "Novo ciclo" }));
  const modal = within(screen.getByRole("dialog"));
  expect(modal.queryByLabelText("Ciclo de referência")).toBeNull();
  fireEvent.change(modal.getByLabelText("Mês"), { target: { value: "01" } });
  fireEvent.click(
    modal.getByRole("switch", { name: "Utilizar ciclo anterior como base" }),
  );
  const ref = modal.getByLabelText("Ciclo de referência") as HTMLSelectElement;
  expect(ref.value).toBe("2026-12");
  expect(Array.from(ref.options).map((o) => o.value)).toEqual([
    "2027-02",
    "2026-12",
    "2026-11",
  ]);
  fireEvent.click(modal.getByRole("button", { name: "Continuar" }));
  await screen.findByText(
    /Este cronograma foi iniciado com base no ciclo de Dezembro/,
  );
  expect(
    (screen.getByLabelText("Descrição do evento") as HTMLInputElement).value,
  ).toBe("Referência dezembro");
  expect(await listarCiclos()).toEqual(anteriores);
  fireEvent.change(screen.getByLabelText("Descrição do evento"), {
    target: { value: "Evento independente" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  await screen.findByText("Retornou aos ciclos");
  const salvos = await listarCiclos();
  expect(salvos).toHaveLength(4);
  expect(
    salvos.find((c) => c.competencia === "2026-12")!.configuracao.secoes[0]
      .eventos[0].descricao,
  ).toBe("Referência dezembro");
  const novo = salvos.find((c) => c.competencia === "2027-01")!;
  expect(novo.configuracao.secoes[0].eventos[0].descricao).toBe(
    "Evento independente",
  );
  expect(novo.configuracao.secoes[0].eventos[0].periodo).toContain(
    "03/01/2027",
  );
});
it("mantém reaproveitamento indisponível sem referências e permite cancelar cópia sem salvar", async () => {
  render(
    <MemoryRouter>
      <GestaoCiclosContent />
    </MemoryRouter>,
  );
  await waitFor(() =>
    expect(
      (screen.getByRole("button", { name: "Novo ciclo" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false),
  );
  fireEvent.click(screen.getByRole("button", { name: "Novo ciclo" }));
  const modal = within(screen.getByRole("dialog"));
  fireEvent.change(modal.getByLabelText("Mês"), { target: { value: "12" } });
  expect(
    (
      modal.getByRole("switch", {
        name: "Utilizar ciclo anterior como base",
      }) as HTMLInputElement
    ).disabled,
  ).toBe(true);
  fireEvent.click(modal.getByRole("button", { name: "Cancelar" }));
  expect(await listarCiclos()).toEqual([]);
});
it("voltar do editor descarta o ciclo copiado", async () => {
  await salvarCiclo(ciclo("2026-11"), true);
  const antes = await listarCiclos();
  render(
    <MemoryRouter
      initialEntries={["/configurar/2026-12?novo=1&referencia=2026-11"]}
    >
      <Routes>
        <Route
          path="/configurar/:competencia"
          element={<EditarCicloContent />}
        />
        <Route
          path="/prototipos/sigep/cronograma/ciclos"
          element={<p>Cópia cancelada</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByText(/Este cronograma foi iniciado com base/);
  fireEvent.click(
    screen.getByRole("link", { name: "Gestão de Ciclos do Cronograma" }),
  );
  await screen.findByText("Cópia cancelada");
  expect(await listarCiclos()).toEqual(antes);
});

it("exibe horários e aviso ao ajustar o último dia do mês na cópia", async () => {
  const origem = ciclo("2026-01", "Evento de fechamento");
  origem.configuracao.secoes[0].eventos[0].periodo =
    "31/01/2026 - 31/01/2026 - 18:00";
  await salvarCiclo(origem, true);
  render(
    <MemoryRouter
      initialEntries={["/configurar/2026-02?novo=1&referencia=2026-01"]}
    >
      <Routes>
        <Route
          path="/configurar/:competencia"
          element={<EditarCicloContent />}
        />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByText(/último dia válido/);
  expect(
    (screen.getByLabelText("Data início do evento") as HTMLInputElement).value,
  ).toBe("28/02/2026 18:00");
  expect(
    (screen.getByLabelText("Data fim do evento") as HTMLInputElement).value,
  ).toBe("28/02/2026 18:00");
  expect(await listarCiclos()).toHaveLength(1);
});

it("identifica a visualização no título e breadcrumb e retorna pelo botão ao final", async () => {
  await salvarCiclo(ciclo("2026-11"), true);
  const antes = await listarCiclos();
  render(
    <MemoryRouter initialEntries={["/configurar/2026-11?visualizar=1"]}>
      <Routes>
        <Route
          path="/configurar/:competencia"
          element={<EditarCicloContent />}
        />
        <Route
          path="/prototipos/sigep/cronograma/ciclos"
          element={<p>Gestão de ciclos retornada</p>}
        />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByRole("heading", {
    name: "Visualizar configuração do cronograma",
  });
  expect(
    screen.getAllByText("Visualizar configuração do cronograma"),
  ).toHaveLength(2);
  const voltar = screen.getByRole("button", { name: "Voltar" });
  expect(voltar.closest(".prototype-folha-home-modal-actions")).toBeTruthy();
  fireEvent.click(voltar);
  await screen.findByText("Gestão de ciclos retornada");
  expect(await listarCiclos()).toEqual(antes);
});

it("abre a cópia usando referência de um mês posterior ao destino", async () => {
  await salvarCiclo(ciclo("2026-12", "Referência posterior"), true);
  render(
    <MemoryRouter
      initialEntries={["/configurar/2026-09?novo=1&referencia=2026-12"]}
    >
      <Routes>
        <Route
          path="/configurar/:competencia"
          element={<EditarCicloContent />}
        />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByText(
    /Este cronograma foi iniciado com base no ciclo de Dezembro/,
  );
  expect(
    (screen.getByLabelText("Data início do evento") as HTMLInputElement).value,
  ).toContain("03/09/2026");
  expect(
    (screen.getByLabelText("Descrição do evento") as HTMLInputElement).value,
  ).toBe("Referência posterior");
  expect(await listarCiclos()).toHaveLength(1);
});
