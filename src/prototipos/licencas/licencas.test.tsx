// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DomHandler } from "primereact/utils";
// JSDOM não calcula dimensões; estes testes validam as ações sem posicionar o overlay.
beforeEach(() => {
  vi.spyOn(DomHandler, "absolutePosition").mockImplementation(() => {});
});
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { ParametrizacaoLicencasPage } from "./ParametrizacaoLicencasPage";
import { ParametrizacaoLicencasFormPage } from "./FormularioLicenca";
import {
  BASE_LICENCAS as BASE,
  STORAGE_LICENCAS,
  CATEGORIAS,
  eventosIniciais,
  filtrosVazios,
  filtrarEventos,
  carregarEventos,
  salvarEvento,
  clonarEvento,
  rotuloDuracao,
  configuracaoDoEvento,
} from "./model";
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
});
function montar() {
  render(
    <MemoryRouter initialEntries={[BASE]}>
      <Routes>
        <Route path="/prototipos/sigep/documentos-legais/novo" element={<RetornoDocumentoTeste/>}/>
        <Route path={BASE} element={<ParametrizacaoLicencasPage />} />
        <Route
          path={`${BASE}/novo`}
          element={<ParametrizacaoLicencasFormPage />}
        />
        <Route
          path={`${BASE}/:id/editar`}
          element={<ParametrizacaoLicencasFormPage />}
        />
        <Route
          path={`${BASE}/:id/clonar`}
          element={<ParametrizacaoLicencasFormPage clonar />}
        />
      </Routes>
    </MemoryRouter>,
  );
}
function RetornoDocumentoTeste(){
  const navigate=useNavigate(),location=useLocation();
  return <button onClick={()=>navigate(new URLSearchParams(location.search).get('returnTo')!)}>Retornar à parametrização</button>;
}
it('preserva o preenchimento ao acessar o cadastro de amparo legal e retornar',()=>{
  montar();
  fireEvent.click(screen.getByRole('button',{name:'Nova Parametrização'}));
  fireEvent.change(screen.getByLabelText('Nome do Evento (Exibido no Lançamento) *'),{target:{value:'Rascunho preservado'}});
  selecionarAmparoLegal();
  fireEvent.click(screen.getByRole('button',{name:'Novo Cadastro'}));
  fireEvent.click(screen.getByRole('button',{name:'Retornar à parametrização'}));
  expect((screen.getByLabelText('Nome do Evento (Exibido no Lançamento) *') as HTMLInputElement).value).toBe('Rascunho preservado');
  expect(screen.getAllByRole('button',{name:'Remover LC nº 500/2026'}).length).toBeGreaterThan(0);
  expect(screen.getByLabelText('Tipo *')).toBeTruthy();
  expect(sessionStorage.getItem(`sigep-licencas-rascunho:${BASE}/novo`)).toBeNull();
});
it("migra códigos antigos preservando os dados e os códigos numéricos existentes", () => {
  const antigos = eventosIniciais.map((e, i) => ({
    ...e,
    codigo: i === 1 ? "001" : `LEG-${i}`,
    descricao: "Descrição preservada",
  }));
  localStorage.setItem(STORAGE_LICENCAS, JSON.stringify(antigos));
  const dados = carregarEventos();
  expect(dados.map((e) => e.codigo)).toEqual(["2", "1", "3", "4", "5"]);
  expect(dados.map((e) => e.id)).toEqual(antigos.map((e) => e.id));
  expect(dados.every((e) => e.descricao === "Descrição preservada")).toBe(true);
  expect(carregarEventos()).toEqual(dados);
});
it("exibe os vínculos autorizados em uma lista no modal", () => {
  montar();
  fireEvent.click(
    screen.getByRole("button", {
      name: "Ver vínculos autorizados do evento 1",
    }),
  );
  const modal = within(
    screen.getByRole("dialog", { name: "Tipos de vínculo autorizados (4)" }),
  );
  expect(modal.getByText("Código 1")).toBeTruthy();
  expect(modal.getAllByRole("listitem")).toHaveLength(4);
  for (const vinculo of eventosIniciais[0].vinculos)
    expect(modal.getByText(vinculo, { exact: false })).toBeTruthy();
});
it("preserva os cinco eventos e os valores de duração da referência", () => {
  const dados = carregarEventos();
  expect(dados).toHaveLength(5);
  expect(dados.filter((e) => e.natureza === "Licença")).toHaveLength(2);
  expect(dados.filter((e) => e.natureza === "Afastamento")).toHaveLength(1);
  expect(dados.filter((e) => e.natureza === "Ausência")).toHaveLength(2);
  expect(dados.map(rotuloDuracao)).toEqual([
    "8 Dias Corridos",
    "Sem limite",
    "1 Dia Útil",
    "Sem limite",
    "Por horas",
  ]);
  expect(dados[0].parentesco).toBe(true);
  expect(dados[2].recorrencia).toBe("1x / 12m");
  expect(dados[4].situacao).toBe("Inativo");
});
it("combina texto sem acentos, natureza, categoria e situação", () => {
  expect(
    filtrarEventos(eventosIniciais, {
      ...filtrosVazios,
      busca: "doacao",
      categoria: CATEGORIAS[3],
      natureza: "Ausência",
      situacao: "Ativo",
    }).map((e) => e.codigo),
  ).toEqual(["3"]);
  expect(
    filtrarEventos(eventosIniciais, {
      ...filtrosVazios,
      busca: "1",
      natureza: "Ausência",
    }),
  ).toHaveLength(0);
});
it("clona com novo identificador, exige código único e preserva o original", () => {
  const original = carregarEventos()[0],
    copia = clonarEvento(original);
  expect(copia.id).not.toBe(original.id);
  expect(copia.codigo).toBe("6");
  expect(() =>
    salvarEvento({ ...copia, codigo: "1" }, carregarEventos()),
  ).toThrow(/código único/);
  salvarEvento({ ...copia, codigo: "6" }, carregarEventos());
  expect(carregarEventos()).toHaveLength(6);
  expect(carregarEventos().find((e) => e.id === original.id)).toEqual(original);
});
it("inativa e reativa apenas após confirmação e mantém indicadores e filtros", async () => {
  montar();
  await acaoEvento("1", "Inativar");
  expect(localStorage.getItem(STORAGE_LICENCAS)).toBeNull();
  fireEvent.click(
    within(screen.getByRole("dialog", { name: "Inativar Evento" })).getByRole(
      "button",
      { name: "Cancelar" },
    ),
  );
  expect(
    screen.getByRole("button", { name: "Ações do evento 1" }),
  ).toBeTruthy();
  await acaoEvento("1", "Inativar");
  fireEvent.click(
    within(screen.getByRole("dialog", { name: "Inativar Evento" })).getByRole(
      "button",
      { name: "Confirmar" },
    ),
  );
  expect(carregarEventos().find((e) => e.codigo === "1")?.situacao).toBe(
    "Inativo",
  );
  fireEvent.change(screen.getByLabelText("Situação"), {
    target: { value: "Inativo" },
  });
  expect(
    within(
      screen.getByRole("table", { name: "Eventos parametrizados" }),
    ).getAllByRole("row"),
  ).toHaveLength(3);
  await acaoEvento("1", "Reativar");
  fireEvent.click(
    within(screen.getByRole("dialog", { name: "Reativar Evento" })).getByRole(
      "button",
      { name: "Confirmar" },
    ),
  );
  expect(carregarEventos().find((e) => e.codigo === "1")?.situacao).toBe(
    "Ativo",
  );
});
it("abre a clonagem preenchida e salva uma nova parametrização", async () => {
  montar();
  await acaoEvento("1", "Duplicar");
  expect(
    (
      screen.getByLabelText(
        "Nome do Evento (Exibido no Lançamento) *",
      ) as HTMLInputElement
    ).value,
  ).toContain("Luto");
  expect(
    (screen.getByLabelText("Nomeado Efetivo") as HTMLInputElement).checked,
  ).toBe(true);
  fireEvent.change(screen.getByLabelText("Data Início Vigência *"), {
    target: { value: "2026-10-20" },
  });
  selecionarAmparoLegal();
  fireEvent.click(screen.getByRole("button", { name: "Pai / Mãe" }));
  expect(
    (screen.getByLabelText("Código Interno *") as HTMLInputElement).readOnly,
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Salvar e Publicar" }));
  expect(carregarEventos()).toHaveLength(6);
  expect(
    within(
      screen.getByRole("table", { name: "Eventos parametrizados" }),
    ).getByText("6"),
  ).toBeTruthy();
});
it("cadastra e edita um evento sem duplicar o registro existente", async () => {
  montar();
  fireEvent.click(screen.getByRole("button", { name: "Nova Parametrização" }));
  fireEvent.change(screen.getByLabelText("Data Início Vigência *"), {
    target: { value: "2026-10-20" },
  });
  selecionarAmparoLegal();
  fireEvent.change(
    screen.getByLabelText("Nome do Evento (Exibido no Lançamento) *"),
    { target: { value: "Evento de demonstração" } },
  );
  fireEvent.change(screen.getByLabelText("Categoria (Tabela de Domínio) *"), {
    target: { value: CATEGORIAS[0] },
  });
  fireEvent.click(screen.getByLabelText("Nomeado Efetivo"));
  fireEvent.click(screen.getByRole("button", { name: "Salvar e Publicar" }));
  expect(carregarEventos()).toHaveLength(6);
  const id = carregarEventos().find((e) => e.codigo === "6")!.id;
  await acaoEvento("6", "Editar");
  fireEvent.change(
    screen.getByLabelText("Nome do Evento (Exibido no Lançamento) *"),
    { target: { value: "Evento revisado" } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Salvar e Publicar" }));
  expect(carregarEventos()).toHaveLength(6);
  expect(carregarEventos().find((e) => e.id === id)?.nome).toBe(
    "Evento revisado",
  );
});
it("pagina os resultados e reinicia a página ao combinar filtros", () => {
  localStorage.setItem(
    STORAGE_LICENCAS,
    JSON.stringify(
      Array.from({ length: 12 }, (_, i) => ({
        ...eventosIniciais[0],
        id: `teste-${i}`,
        codigo: `${300 + i}`,
        nome: `Exemplo ${i}`,
      })),
    ),
  );
  montar();
  expect(
    within(
      screen.getByRole("table", { name: "Eventos parametrizados" }),
    ).getAllByRole("row"),
  ).toHaveLength(11);
  fireEvent.click(
    screen.getByRole("button", { name: "Próxima página de eventos" }),
  );
  expect(
    within(
      screen.getByRole("table", { name: "Eventos parametrizados" }),
    ).getAllByRole("row"),
  ).toHaveLength(3);
  fireEvent.change(screen.getByLabelText("Código ou Nome do Evento"), {
    target: { value: "311" },
  });
  expect(screen.getByText("311")).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "Página 1 de eventos" })
      .getAttribute("aria-current"),
  ).toBe("page");
  fireEvent.change(screen.getByLabelText("Tipo"), {
    target: { value: "Ausência" },
  });
  expect(
    screen.getByText("Nenhum registro encontrado para os filtros informados."),
  ).toBeTruthy();
});

async function acaoEvento(codigo: string, acao: string) {
  fireEvent.click(
    screen.getByRole("button", { name: "Ações do evento " + codigo }),
  );
  fireEvent.click(await screen.findByRole("menuitem", { name: acao }));
}
it("visualiza os detalhes do registro sem alterar seus dados", () => {
  montar();
  fireEvent.click(screen.getByRole("button", { name: "Visualizar Evento 1" }));
  const modal = within(
    screen.getByRole("dialog", { name: "Visualizar Evento" }),
  );
  expect(modal.getByText("1 — Licença por Falecimento / Luto")).toBeTruthy();
  expect(modal.getByText("8 Dias Corridos")).toBeTruthy();
  expect(localStorage.getItem(STORAGE_LICENCAS)).toBeNull();
});
it("mostra as ações correspondentes à situação de cada registro", async () => {
  montar();
  fireEvent.click(screen.getByRole("button", { name: "Ações do evento 5" }));
  expect(await screen.findByRole("menuitem", { name: "Editar" })).toBeTruthy();
  expect(screen.getByRole("menuitem", { name: "Duplicar" })).toBeTruthy();
  expect(screen.getByRole("menuitem", { name: "Reativar" })).toBeTruthy();
  expect(screen.queryByRole("menuitem", { name: "Inativar" })).toBeNull();
});
it("publica todas as regras do HTML e preserva as versões anteriores ao editar", async () => {
  montar();
  fireEvent.click(screen.getByRole("button", { name: "Nova Parametrização" }));
  fireEvent.change(
    screen.getByLabelText("Nome do Evento (Exibido no Lançamento) *"),
    { target: { value: "Parametrização completa" } },
  );
  fireEvent.change(screen.getByLabelText("Data Início Vigência *"), {
    target: { value: "2026-10-20" },
  });
  fireEvent.change(screen.getByLabelText("Data Fim Vigência"), {
    target: { value: "2027-10-20" },
  });
  selecionarAmparoLegal();
  fireEvent.change(screen.getByLabelText("Categoria (Tabela de Domínio) *"), {
    target: { value: CATEGORIAS[2] },
  });
  fireEvent.change(
    screen.getByLabelText("Descrição Detalhada / Orientação Operacional"),
    { target: { value: "Orientação de lançamento" } },
  );
  fireEvent.click(screen.getByText("Selecione uma ou mais opções"));
  fireEvent.change(screen.getByLabelText("Buscar tipos de vínculo"), {
    target: { value: "RESIDENTE TECNICO" },
  });
  expect(screen.queryByLabelText("Nomeado Efetivo")).toBeNull();
  fireEvent.click(screen.getByLabelText("Residente Técnico"));
  fireEvent.change(screen.getByLabelText("Buscar tipos de vínculo"), {
    target: { value: "" },
  });
  fireEvent.click(screen.getByLabelText("Contrato Temporário Vínculo Único"));
  fireEvent.click(screen.getByLabelText("Sem Limite de Dias"));
  expect(
    (screen.getByLabelText("Dias Máximos Permitidos *") as HTMLInputElement)
      .disabled,
  ).toBe(true);
  fireEvent.click(
    screen.getByText("Dia Integral", { selector: "summary span" }),
  );
  fireEvent.click(screen.getByLabelText("Por Horas"));
  fireEvent.change(screen.getByLabelText("Possui Trava de Recorrência? *"), {
    target: { value: "true" },
  });
  fireEvent.change(screen.getByLabelText("Quantidade de ocorrências"), {
    target: { value: "2" },
  });
  fireEvent.change(screen.getByLabelText("Intervalo de recorrência"), {
    target: { value: "3" },
  });
  fireEvent.change(screen.getByLabelText("Unidade de recorrência"), {
    target: { value: "Anos" },
  });
  fireEvent.change(screen.getByLabelText("Exige Parentesco? *"), {
    target: { value: "true" },
  });
  selecionarAmparoLegal();
  fireEvent.click(screen.getByRole("button", { name: "Pai / Mãe" }));
  fireEvent.click(screen.getByRole("button", { name: "Tio(a)" }));
  fireEvent.click(screen.getByRole("button", { name: "Salvar e Publicar" }));
  const salvo = carregarEventos().find((e) => e.codigo === "6")!;
  expect(salvo.vinculos).toEqual(["Residente", "Temporário Único"]);
  expect(salvo.duracao).toBe("Sem limite");
  expect(salvo.recorrencia).toBe("2x / 3 Anos");
  expect(salvo.configuracao).toMatchObject({
    inicioVigencia: "2026-10-20",
    fimVigencia: "2027-10-20",
    orientacao: "Orientação de lançamento",
    abrangencias: ["Dia Integral", "Por Horas"],
    grausParentesco: ["Pai / Mãe", "Tio(a)"],
  });
  expect(salvo.historico).toHaveLength(1);
  await acaoEvento("6", "Editar");

  fireEvent.change(
    screen.getByLabelText("Nome do Evento (Exibido no Lançamento) *"),
    { target: { value: "Parametrização revisada" } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Salvar e Publicar" }));
  const revisado = carregarEventos().find((e) => e.codigo === "6")!;
  expect(revisado.historico).toHaveLength(2);
  expect(revisado.historico![0].dados.nome).toBe("Parametrização completa");
  expect(revisado.historico![1].dados.nome).toBe("Parametrização revisada");
  expect(clonarEvento(revisado).historico).toEqual([]);
});
it("valida vigência, abrangência, recorrência e parentesco antes de publicar", () => {
  const base = clonarEvento(eventosIniciais[0]);
  const configuracao = {
    ...configuracaoDoEvento(base),
    inicioVigencia: "2026-10-20",
    grausParentesco: ["Pai / Mãe"],
  };
  const evento = { ...base, configuracao };
  expect(() =>
    salvarEvento(
      {
        ...evento,
        configuracao: { ...configuracao, fimVigencia: "2026-10-19" },
      },
      carregarEventos(),
    ),
  ).toThrow(/fim da vigência/);
  expect(() =>
    salvarEvento(
      { ...evento, configuracao: { ...configuracao, abrangencias: [] } },
      carregarEventos(),
    ),
  ).toThrow(/abrangência/);
  expect(() =>
    salvarEvento(
      {
        ...evento,
        configuracao: {
          ...configuracao,
          travaRecorrencia: true,
          recorrenciaQuantidade: 0,
        },
      },
      carregarEventos(),
    ),
  ).toThrow(/recorrência/);
  expect(() =>
    salvarEvento(
      { ...evento, configuracao: { ...configuracao, grausParentesco: [] } },
      carregarEventos(),
    ),
  ).toThrow(/parentesco/);
  expect(localStorage.getItem(STORAGE_LICENCAS)).toBeNull();
});
it("não exibe os controles de publicação e histórico no cabeçalho", () => {
  montar();
  fireEvent.click(screen.getByRole("button", { name: "Nova Parametrização" }));
  expect(screen.queryByText("Nova publicação")).toBeNull();
  expect(screen.queryByRole("button", { name: "Histórico" })).toBeNull();
});
function selecionarAmparoLegal() {
  fireEvent.click(screen.getByLabelText("Buscar documentos legais associados"));
  const doc = within(screen.getByRole("listbox")).getByRole("checkbox", {
    name: /LC nº 500/,
  });
  if (!(doc as HTMLInputElement).checked) fireEvent.click(doc);
}
