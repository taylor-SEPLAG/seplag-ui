// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { NovaSolicitacaoLicencaPage } from './NovaSolicitacaoLicencaPage';
import { GestaoLicencasContent } from "./GestaoLicencasPage";
import { menuGestaoPessoas } from "../PrototiposPage";
import {
  GESTAO_LICENCAS_PATH,
  TITULO_GESTAO_LICENCAS,
  registrosLicencas,
  indicadoresLicencas,
  filtrosIniciais,
  filtrarLicencas,
} from "./model";

afterEach(cleanup);
it('pagina os resultados, altera o tamanho da página e reinicia ao filtrar',()=>{
  const registros=Array.from({length:23},(_,i)=>({...registrosLicencas[0],id:`pagina-${i}`,matricula:String(800000+i),nome:`Servidor ${i+1}`}));
  render(<MemoryRouter><GestaoLicencasContent registros={registros}/></MemoryRouter>);
  const paginacao=within(screen.getByRole('navigation',{name:'Paginação de licenças e afastamentos'}));
  expect(tabela().getAllByRole('row')).toHaveLength(11);
  expect((paginacao.getByRole('button',{name:'Primeira página de licenças e afastamentos'}) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(paginacao.getByRole('button',{name:'Próxima página de licenças e afastamentos'}));
  expect(tabela().getByText('Servidor 11')).toBeTruthy();
  fireEvent.click(paginacao.getByRole('button',{name:'Última página de licenças e afastamentos'}));
  expect(tabela().getAllByRole('row')).toHaveLength(4);
  expect((paginacao.getByRole('button',{name:'Próxima página de licenças e afastamentos'}) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(paginacao.getByRole('button',{name:'Página anterior de licenças e afastamentos'}));
  expect(tabela().getByText('Servidor 11')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Registros por página de licenças e afastamentos'),{target:{value:'20'}});
  expect(tabela().getAllByRole('row')).toHaveLength(21);
  fireEvent.click(paginacao.getByRole('button',{name:'Última página de licenças e afastamentos'}));
  fireEvent.change(screen.getByLabelText('Servidor'),{target:{value:'800000'}});
  expect(tabela().getByText('Servidor 1')).toBeTruthy();
  expect(paginacao.getByRole('button',{name:'Página 1 de licenças e afastamentos'}).getAttribute('aria-current')).toBe('page');
  fireEvent.click(screen.getByRole('button',{name:'Limpar filtro'}));
  expect(tabela().getAllByRole('row')).toHaveLength(21);
  fireEvent.change(screen.getByLabelText('Registros por página de licenças e afastamentos'),{target:{value:'50'}});
  expect(tabela().getAllByRole('row')).toHaveLength(24);
});
function montar() {
  render(
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<GestaoLicencasContent />}/>
        <Route path={`${GESTAO_LICENCAS_PATH}/:id/visualizar`} element={<NovaSolicitacaoLicencaPage visualizar />}/>
      </Routes>
    </MemoryRouter>,
  );
}
const tabela = () =>
  within(screen.getByRole("table", { name: "Licenças e afastamentos" }));

it("inclui o novo menu imediatamente depois de Parametrização de Ocorrências", () => {
  const filhos = menuGestaoPessoas.find(
    (m) => m.label === "Direitos e Benefícios",
  )!.items!;
  const indice = filhos.findIndex(
    (m) => m.label === "Parametrização de Ocorrências",
  );
  expect(filhos[indice + 1]).toMatchObject({
    label: TITULO_GESTAO_LICENCAS,
    to: GESTAO_LICENCAS_PATH,
    visibleOnMenu: true,
    visibleOnRouter: true,
  });
});
it("deriva os cinco indicadores dos sete registros sem situação de encaminhamento ao INSS", () => {
  expect(indicadoresLicencas(registrosLicencas).map((k) => k.valor)).toEqual([
    7, 0, 0, 6, 1,
  ]);
  expect(registrosLicencas.find((r) => r.matricula === "241244")).toMatchObject(
    { inicio: "2026-03-24", fim: "2026-04-07", dias: 8, situacao: "Em andamento" },
  );
  expect(indicadoresLicencas([]).map((k) => k.valor)).toEqual([
    0, 0, 0, 0, 0,
  ]);
  montar();
  expect(tabela().getAllByRole("row")).toHaveLength(8);
  const resumo = within(
    screen.getByRole("region", { name: "Resumo de licenças e afastamentos" }),
  );
  for (const k of indicadoresLicencas(registrosLicencas))
    expect(resumo.getByText(k.label).parentElement?.textContent).toBe(
      `${k.label}${k.valor}`,
    );
});
it("combina os cinco filtros e pesquisa sem diferenciar acentos ou maiúsculas", () => {
  expect(
    filtrarLicencas(registrosLicencas, {
      ...filtrosIniciais,
      orgao: "SES/MT",
      lotacao: "COORD. PLANEJ. E PROJETOS DE TI",
      servidor: " JOAO SILVA ",
      situacao: "Em andamento",
      tipoVinculo: "Residente Técnico",
    }).map((r) => r.matricula),
  ).toEqual(["327305"]);
  montar();
  fireEvent.change(screen.getByLabelText("Órgão"), {
    target: { value: "SES/MT" },
  });
  fireEvent.change(screen.getByLabelText("Setor / Lotação"), {
    target: { value: "COORD. PLANEJ. E PROJETOS DE TI" },
  });
  fireEvent.change(screen.getByLabelText("Servidor"), {
    target: { value: "JOAO" },
  });
  fireEvent.change(screen.getByLabelText("Situação"), {
    target: { value: "Em andamento" },
  });
  fireEvent.change(screen.getByLabelText("Tipo de vínculo"), {
    target: { value: "Residente Técnico" },
  });
  expect(tabela().getAllByRole("row")).toHaveLength(2);
  expect(tabela().getByText("João Silva")).toBeTruthy();
  expect(screen.getByText("Licenças").parentElement?.textContent).toBe(
    "Licenças7",
  );
  fireEvent.change(screen.getByLabelText("Servidor"), {
    target: { value: "327305" },
  });
  expect(tabela().getAllByRole("row")).toHaveLength(2);
  fireEvent.change(screen.getByLabelText("Situação"), {
    target: { value: "Encerrado" },
  });
  expect(tabela().getByRole("status").textContent).toContain("Nenhum registro");
  fireEvent.click(screen.getByRole("button", { name: "Limpar filtro" }));
  expect(tabela().getAllByRole("row")).toHaveLength(8);
  for (const label of [
    "Órgão",
    "Setor / Lotação",
    "Servidor",
    "Situação",
    "Tipo de vínculo",
  ])
    expect((screen.getByLabelText(label) as HTMLInputElement).value).toBe("");
});
it("restringe as lotações ao órgão e limpa a lotação ao trocar de órgão", () => {
  montar();
  fireEvent.change(screen.getByLabelText("Órgão"), {
    target: { value: "SECITEC/MT" },
  });
  const lotacao = screen.getByLabelText("Setor / Lotação") as HTMLSelectElement;
  expect(
    within(lotacao)
      .getAllByRole("option")
      .map((o) => o.textContent),
  ).toEqual(["Todos", "Escola Técnica — Cuiabá"]);
  fireEvent.change(lotacao, { target: { value: "Escola Técnica — Cuiabá" } });
  fireEvent.change(screen.getByLabelText("Órgão"), {
    target: { value: "UNEMAT/MT" },
  });
  expect(lotacao.value).toBe("");
  expect(tabela().getByText("Servidor UNEMAT (demonstração)")).toBeTruthy();
});
it("o olho mostra os dados do registro selecionado sem alterar a base", () => {
  const original = JSON.stringify(registrosLicencas);
  montar();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Visualizar licença de Claudio Luciano Capistrano de Camargo",
    }),
  );
  expect(screen.getAllByText('Visualizar solicitação de licença').length).toBeGreaterThan(0);
  expect((screen.getByRole('group', {name: 'Solicitação em modo de leitura'}) as HTMLFieldSetElement).disabled).toBe(true);
  expect((screen.getByLabelText('Data de Início *') as HTMLInputElement).value).toBe('2026-01-27');
  expect((screen.getByLabelText('Data de Término *') as HTMLInputElement).value).toBe('2026-02-16');
  expect((screen.getByLabelText('Quantidade de dias') as HTMLInputElement).value).toBe('20');
  expect(screen.queryByRole('button', {name: 'Efetivar Lançamento'})).toBeNull();
  expect(JSON.stringify(registrosLicencas)).toBe(original);
});
it("exibe a gestão sem abas nem seletor de perfil", () => {
  montar();
  expect(screen.queryByRole("tablist")).toBeNull();
  expect(screen.queryByRole("tab", { name: "Gestão" })).toBeNull();
  for (const nome of ["Perícia / Homologações", "Substituições"])
    expect(
      screen.queryByRole("tab", { name: nome }),
    ).toBeNull();
  expect(
    (
      screen.getByRole("button", {
        name: "Nova solicitação de licença",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false);
  expect(
    screen.queryByLabelText("Visualizando como"),
  ).toBeNull();
  for (const botao of screen.getAllByRole("button", {
    name: /Ações adicionais de/,
  }))
    expect((botao as HTMLButtonElement).disabled).toBe(true);
  expect(screen.queryByRole("button", { name: /Diretrizes/ })).toBeNull();
});
