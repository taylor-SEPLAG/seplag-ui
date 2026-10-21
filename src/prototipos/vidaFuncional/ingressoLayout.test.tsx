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
import { eventos, vinculos } from "./model";
afterEach(cleanup);
const outrosTipos = [
  ...new Set(eventos.filter((e) => e.tipo !== "Ingresso").map((e) => e.tipo)),
];
it.each(outrosTipos)(
  "aplica os cards e preserva os campos da ocorrência %s",
  (tipo) => {
    const evento = eventos.find((e) => e.tipo === tipo)!;
    const vinculo = vinculos.find((v) => v.id === evento.vinculoId)!;
    render(
      <MemoryRouter
        initialEntries={[
          `/prototipos/sigep/vida-funcional/${vinculo.pessoaId}/vinculos/${vinculo.id}/historico`,
        ]}
      >
        <Routes>
          <Route
            path="/prototipos/sigep/vida-funcional/:pessoaId/vinculos/:vinculoId/historico"
            element={<VidaFuncionalPage />}
          />
        </Routes>
      </MemoryRouter>,
    );
    const botao = screen
      .getAllByRole("button")
      .find((b) => b.getAttribute("aria-controls") === `detalhe-${evento.id}`)!;
    fireEvent.click(botao);
    const painel = document.getElementById(`detalhe-${evento.id}`)!;
    expect(painel.classList.contains("vf-detalhes--cards")).toBe(true);
    const secoes = [...painel.querySelectorAll("section")];
    expect(secoes.at(-1)?.querySelector("h3")?.textContent).toBe(
      "Registro da ocorrência",
    );
    for (const [titulo, campos] of Object.entries(evento.secoes)) {
      const secao = secoes.find(
        (s) => s.querySelector("h3")?.textContent === titulo,
      )!;
      expect(secao.querySelector("h3 > i[aria-hidden=true]")).toBeTruthy();
      const exibidos = [...secao.querySelectorAll("dl > div")];
      for (const [campo, valor] of Object.entries(campos)) {
        const dado = exibidos.find(
          (div) => div.querySelector("dt")?.textContent === campo,
        );
        if (/^documento(?:\b|\/)/i.test(campo)) expect(dado).toBeUndefined();
        else expect(dado?.querySelector("dd")?.textContent).toBe(valor);
      }
    }
  },
);
function abrir(pessoa: string, vinculo: string, titulo: string) {
  render(
    <MemoryRouter
      initialEntries={[
        `/prototipos/sigep/vida-funcional/${pessoa}/vinculos/${vinculo}/historico`,
      ]}
    >
      <Routes>
        <Route
          path="/prototipos/sigep/vida-funcional/:pessoaId/vinculos/:vinculoId/historico"
          element={<VidaFuncionalPage />}
        />
      </Routes>
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole("button", { name: new RegExp(titulo) }));
  const painel = document.querySelector(".vf-detalhes--cards")!;
  return {
    painel,
    secoes: [...painel.querySelectorAll("section")],
    escopo: within(painel as HTMLElement),
  };
}
it("organiza o ingresso de aposentado nos quatro blocos da referência", () => {
  const { secoes, escopo } = abrir(
    "2",
    "carlos-2",
    "Criação do vínculo de aposentado",
  );
  expect(secoes.map((s) => s.querySelector("h3")?.textContent)).toEqual([
    "Dados do Ingresso",
    "Dados Funcionais",
    "Detalhes do Exercício",
    "Origem e Registro",
  ]);
  expect(within(secoes[0]).getByText("Número do ingresso")).toBeTruthy();
  expect(within(secoes[0]).queryByText("Cargo/Função")).toBeNull();
  expect(within(secoes[1]).getByText("Cargo/Função")).toBeTruthy();
  expect(within(secoes[1]).queryByText("Jornada")).toBeNull();
  expect(within(secoes[2]).getByText("Sem jornada de exercício")).toBeTruthy();
  expect(within(secoes[2]).getByText("Referência")).toBeTruthy();
  expect(
    within(secoes[3]).getByText("Aposentadoria do vínculo efetivo"),
  ).toBeTruthy();
  expect(within(secoes[3]).getByText("128450 / 1")).toBeTruthy();
  expect(within(secoes[3]).getByText("01/07/2025 10:30:00")).toBeTruthy();
  expect(escopo.getByText("Concluído").className).toContain("v2v-status-ativo");
  expect(escopo.queryByText("Documento/Ato")).toBeNull();
  expect(escopo.queryByText("Data da convocação")).toBeNull();
});
it("preserva edital, classificação no certame e posse do ingresso efetivo", () => {
  const { secoes } = abrir("1", "ana-1", "Ingresso no serviço público");
  expect(within(secoes[0]).getByText("Edital 001/2017")).toBeTruthy();
  expect(within(secoes[0]).getByText("12º lugar")).toBeTruthy();
  expect(within(secoes[1]).getByText("Analista Administrativo")).toBeTruthy();
  expect(within(secoes[2]).getByText("Data da posse")).toBeTruthy();
  expect(within(secoes[2]).getByText("30 horas semanais")).toBeTruthy();
  expect(within(secoes[2]).getAllByText("15/03/2018")).toHaveLength(2);
  expect(within(secoes[3]).queryByText("Vínculo anterior")).toBeNull();
  expect(within(secoes[0]).queryByText("Data da convocação")).toBeNull();
});
it('exibe a data da convocação para processo seletivo sem usar a data de exercício como substituta',()=>{
  const {secoes}=abrir('3','mariana-1','Ingresso no serviço público');
  const campo=[...secoes[0].querySelectorAll('dl > div')].find(div=>div.querySelector('dt')?.textContent==='Data da convocação');
  expect(campo?.querySelector('dd')?.textContent).toBe('—');
});
it('preserva a data da convocação informada na origem do processo seletivo',()=>{
  const ingresso=eventos.find(e=>e.vinculoId==='mariana-1'&&e.tipo==='Ingresso')!;
  const dados=ingresso.secoes['Dados do Ingresso'];
  const anterior=dados['Data da convocação'];
  try {
    dados['Data da convocação']='20/02/2020';
    const {secoes}=abrir('3','mariana-1','Ingresso no serviço público');
    expect(within(secoes[0]).getByText('20/02/2020')).toBeTruthy();
  } finally {
    if(anterior===undefined)delete dados['Data da convocação'];else dados['Data da convocação']=anterior;
  }
});
