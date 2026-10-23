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
  regraDoVinculo,
  validarEvento,
} from "./model";
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
});
it('abre o histórico pela grid e informa quando não há alterações', async () => {
  montar();
  await acaoEvento('1', 'Histórico');
  const modal = within(screen.getByRole('dialog', { name: 'Histórico de Alterações' }));
  expect(modal.getByText('Nenhuma alteração registrada para esta ocorrência.')).toBeTruthy();
});
it('exibe valores anteriores e novos agrupados na publicação', async () => {
  const original = eventosIniciais[1];
  salvarEvento({...original, nome: 'Nome revisado', configuracao: {...configuracaoDoEvento(original), inicioVigencia: '2026-01-01'}}, carregarEventos());
  const salvo = carregarEventos().find(e => e.id === original.id)!;
  expect(salvo.historico![0].anteriores?.nome).toBe(original.nome);
  montar();
  await acaoEvento('2', 'Histórico');
  const modal = within(screen.getByRole('dialog', { name: 'Histórico de Alterações' }));
  expect(modal.getByText(original.nome)).toBeTruthy();
  expect(modal.getAllByText('Nome revisado').length).toBeGreaterThan(0);
  expect(modal.getByText('Valor anterior')).toBeTruthy();
  expect(modal.getByText('Responsável não registrado')).toBeTruthy();
});
it('atualiza os cards financeiros por vínculo e preserva valores ao alterar a seleção', () => {
  montar();
  fireEvent.click(screen.getByRole('button', { name: 'Nova Parametrização' }));
  expect(screen.queryByLabelText('Categoria (Tabela de Domínio) *')).toBeNull();
  expect(screen.getByLabelText('Observação')).toBeTruthy();
  expect(screen.getByText(/Selecione ao menos um tipo de vínculo na seção 2/)).toBeTruthy();
  fireEvent.click(screen.getByText('Selecione uma ou mais opções'));
  fireEvent.click(screen.getByLabelText('Contrato Temporário'));
  if (screen.queryByRole('button', {name: 'Avançar'})) fireEvent.click(screen.getByRole('button', {name: 'Avançar'}));
  fireEvent.click(screen.getByRole('tab', { name: 'Efeitos financeiros por tipo de vínculo' }));
  let financeiro = within(screen.getByRole('region', { name: 'Efeitos financeiros: Contrato Temporário' }));
  fireEvent.change(financeiro.getByLabelText(/A partir de qual dia/), { target: { value: '5' } });
  fireEvent.click(screen.getByRole('tab', { name: 'Dados da parametrização' }));
  expect(screen.queryByRole('region', { name: 'Efeitos financeiros: Contrato Temporário' })).toBeNull();
  fireEvent.click(screen.getByLabelText('Residente Técnico'));
  expect((financeiro.getByLabelText(/A partir de qual dia/) as HTMLInputElement).value).toBe('5');
  fireEvent.click(screen.getByLabelText('Contrato Temporário'));
  expect(screen.queryByRole('region', { name: 'Efeitos financeiros: Contrato Temporário' })).toBeNull();
  fireEvent.click(screen.getByLabelText('Contrato Temporário'));
  if (screen.queryByRole('button', {name: 'Avançar'})) fireEvent.click(screen.getByRole('button', {name: 'Avançar'}));
  fireEvent.click(screen.getByRole('tab', { name: 'Efeitos financeiros por tipo de vínculo' }));
  financeiro = within(screen.getByRole('region', { name: 'Efeitos financeiros: Contrato Temporário' }));
  expect((financeiro.getByLabelText(/A partir de qual dia/) as HTMLInputElement).value).toBe('5');
  fireEvent.click(within(financeiro.getByRole('group', { name: 'Suspende a remuneração do servidor? *' })).getByLabelText('Não'));
  expect(financeiro.queryByLabelText(/A partir de qual dia/)).toBeNull();
  expect((within(financeiro.getByRole('group', { name: 'Gera ônus remuneratório para o órgão de origem? *' })).getByLabelText('Não') as HTMLInputElement).checked).toBe(true);
});
it('libera a segunda aba somente após avançar sem salvar o cadastro', () => {
  montar();
  fireEvent.click(screen.getByRole('button', {name: 'Nova Parametrização'}));
  const aba = screen.getByRole('tab', {name: 'Efeitos financeiros por tipo de vínculo'}) as HTMLButtonElement;
  expect(aba.disabled).toBe(true);
  fireEvent.click(aba);
  expect(screen.getByRole('tab', {name: 'Dados da parametrização'}).getAttribute('aria-selected')).toBe('true');
  fireEvent.click(screen.getByRole('button', {name: 'Avançar'}));
  expect(aba.disabled).toBe(false);
  expect(aba.getAttribute('aria-selected')).toBe('true');
  expect(screen.getByRole('button', {name: 'Salvar e Publicar'})).toBeTruthy();
  expect(localStorage.getItem(STORAGE_LICENCAS)).toBeNull();
});
it('valida o dia inicial da suspensão antes de publicar', () => {
  const base = clonarEvento(eventosIniciais[1]);
  const configuracao = { ...configuracaoDoEvento(base), inicioVigencia: '2026-10-20', efeitosFinanceiros: Object.fromEntries(base.vinculos.map(v => [v, { geraOnus: false, suspendeRemuneracao: true, diaInicioSuspensao: 0 }])) };
  expect(() => salvarEvento({ ...base, configuracao }, carregarEventos())).toThrow(/dia inicial da suspensão/);
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
        <Route path={`${BASE}/:id/visualizar`} element={<ParametrizacaoLicencasFormPage visualizar />} />
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
  fireEvent.change(screen.getByLabelText('Nome da Ocorrência (Exibido no Lançamento) *'),{target:{value:'Rascunho preservado'}});
  selecionarAmparoLegal();
  fireEvent.click(screen.getByRole('button',{name:'Novo Cadastro'}));
  fireEvent.click(screen.getByRole('button',{name:'Retornar à parametrização'}));
  expect((screen.getByLabelText('Nome da Ocorrência (Exibido no Lançamento) *') as HTMLInputElement).value).toBe('Rascunho preservado');
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
      name: "Ver vínculos autorizados da ocorrência 1",
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
it("remove a inativação manual das ações", () => {
  montar();
  fireEvent.click(screen.getByRole("button", { name: "Ações da ocorrência 1" }));
  expect(screen.queryByText("Inativar")).toBeNull();
});
it("inativa ao atingir a data fim e preserva datas futuras", () => {
  const base = eventosIniciais[1];
  localStorage.setItem(STORAGE_LICENCAS, JSON.stringify([{...base, configuracao: {...configuracaoDoEvento(base), fimVigencia: '2000-01-01'}}]));
  expect(carregarEventos()[0].situacao).toBe('Inativo');
  localStorage.setItem(STORAGE_LICENCAS, JSON.stringify([{...base, configuracao: {...configuracaoDoEvento(base), fimVigencia: '2999-01-01'}}]));
  expect(carregarEventos()[0].situacao).toBe('Ativo');
});
it("permite configurar a exigência de documentos", () => {
  montar();
  fireEvent.click(screen.getByRole('button', {name: 'Nova Parametrização'}));
  fireEvent.click(screen.getByLabelText('Sim, obrigatório'));
  expect((screen.getByLabelText('Sim, obrigatório') as HTMLInputElement).checked).toBe(true);
});
it("abre a clonagem preenchida e salva uma nova parametrização", async () => {
  montar();
  await acaoEvento("1", "Duplicar");
  expect(
    (
      screen.getByLabelText(
        "Nome da Ocorrência (Exibido no Lançamento) *",
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
  if (screen.queryByRole('button', {name: 'Avançar'})) fireEvent.click(screen.getByRole('button', {name: 'Avançar'}));
  fireEvent.click(screen.getByRole("button", { name: "Salvar e Publicar" }));
  expect(carregarEventos()).toHaveLength(6);
  expect(
    within(
      screen.getByRole("table", { name: "Ocorrências parametrizadas" }),
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
    screen.getByLabelText("Nome da Ocorrência (Exibido no Lançamento) *"),
    { target: { value: "Evento de demonstração" } },
  );
  fireEvent.click(screen.getByLabelText("Nomeado Efetivo"));
  if (screen.queryByRole('button', {name: 'Avançar'})) fireEvent.click(screen.getByRole('button', {name: 'Avançar'}));
  fireEvent.click(screen.getByRole('tab', { name: 'Efeitos financeiros por tipo de vínculo' }));
  const financeiro = within(screen.getByRole('region', { name: 'Efeitos financeiros: Nomeado Efetivo' }));
  const suspensao = within(financeiro.getByRole('group', { name: 'Suspende a remuneração do servidor? *' }));
  fireEvent.click(suspensao.getByLabelText('Sim'));
  fireEvent.change(financeiro.getByLabelText(/A partir de qual dia/), { target: { value: '3' } });
  if (screen.queryByRole('button', {name: 'Avançar'})) fireEvent.click(screen.getByRole('button', {name: 'Avançar'}));
  fireEvent.click(screen.getByRole("button", { name: "Salvar e Publicar" }));
  expect(carregarEventos()).toHaveLength(6);
  const id = carregarEventos().find((e) => e.codigo === "6")!.id;
  expect(carregarEventos().find(e => e.id === id)?.configuracao?.efeitosFinanceiros?.Efetivo).toEqual({ geraOnus: true, suspendeRemuneracao: true, diaInicioSuspensao: 3 });
  await acaoEvento("6", "Editar");
  expect((screen.getByLabelText(/A partir de qual dia/) as HTMLInputElement).value).toBe('3');
  fireEvent.change(
    screen.getByLabelText("Nome da Ocorrência (Exibido no Lançamento) *"),
    { target: { value: "Evento revisado" } },
  );
  if (screen.queryByRole('button', {name: 'Avançar'})) fireEvent.click(screen.getByRole('button', {name: 'Avançar'}));
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
      screen.getByRole("table", { name: "Ocorrências parametrizadas" }),
    ).getAllByRole("row"),
  ).toHaveLength(11);
  fireEvent.click(
    screen.getByRole("button", { name: "Próxima página de ocorrências" }),
  );
  expect(
    within(
      screen.getByRole("table", { name: "Ocorrências parametrizadas" }),
    ).getAllByRole("row"),
  ).toHaveLength(3);
  fireEvent.change(screen.getByLabelText("Código"), {
    target: { value: "311" },
  });
  expect(screen.getByText("311")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Nome da Ocorrência"), { target: { value: "Exemplo 10" } });
  expect(screen.getByText("Nenhum registro encontrado para os filtros informados.")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Nome da Ocorrência"), { target: { value: "Exemplo 11" } });
  expect(screen.getByText("311")).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "Página 1 de ocorrências" })
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
    screen.getByRole("button", { name: "Ações da ocorrência " + codigo }),
  );
  fireEvent.click(await screen.findByRole("menuitem", { name: acao }));
}
it("visualiza os detalhes do registro sem alterar seus dados", () => {
  montar();
  fireEvent.click(screen.getByRole("button", { name: "Visualizar Ocorrência 1" }));
  expect(screen.getAllByText('Visualizar Parametrização').length).toBeGreaterThan(0);
  const campos = screen.getByRole('group', {name: 'Parametrização em modo de leitura'}) as HTMLFieldSetElement;
  expect(campos.disabled).toBe(true);
  expect((screen.getByLabelText('Nome da Ocorrência (Exibido no Lançamento) *') as HTMLInputElement).value).toBe('Licença por Falecimento / Luto');
  expect(screen.queryByRole('button', {name: 'Salvar e Publicar'})).toBeNull();
  expect(screen.queryByRole('button', {name: 'Novo Cadastro'})).toBeNull();
  if (screen.queryByRole('button', {name: 'Avançar'})) fireEvent.click(screen.getByRole('button', {name: 'Avançar'}));
  fireEvent.click(screen.getByRole('tab', {name: 'Efeitos financeiros por tipo de vínculo'}));
  expect(screen.getByRole('region', {name: 'Efeitos financeiros: Nomeado Efetivo'})).toBeTruthy();
  expect(localStorage.getItem(STORAGE_LICENCAS)).toBeNull();
  fireEvent.click(screen.getByRole('button', {name: 'Voltar'}));
  expect(screen.getByRole('table', {name: 'Ocorrências parametrizadas'})).toBeTruthy();
});
it("mostra as ações correspondentes à situação de cada registro", async () => {
  montar();
  fireEvent.click(screen.getByRole("button", { name: "Ações da ocorrência 5" }));
  expect(await screen.findByRole("menuitem", { name: "Editar" })).toBeTruthy();
  expect(screen.getByRole("menuitem", { name: "Duplicar" })).toBeTruthy();
  expect(screen.getByRole("menuitem", { name: "Reativar" })).toBeTruthy();
  expect(screen.queryByRole("menuitem", { name: "Inativar" })).toBeNull();
});
it("publica todas as regras do HTML e preserva as versões anteriores ao editar", async () => {
  montar();
  fireEvent.click(screen.getByRole("button", { name: "Nova Parametrização" }));
  fireEvent.change(
    screen.getByLabelText("Nome da Ocorrência (Exibido no Lançamento) *"),
    { target: { value: "Parametrização completa" } },
  );
  fireEvent.change(screen.getByLabelText("Data Início Vigência *"), {
    target: { value: "2026-10-20" },
  });
  fireEvent.change(screen.getByLabelText("Data Fim Vigência"), {
    target: { value: "2027-10-20" },
  });
  selecionarAmparoLegal();
  fireEvent.change(
    screen.getByLabelText("Observação"),
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
  const regras = within(screen.getByRole("region", { name: "Regras: Residente T\u00e9cnico" }));
  fireEvent.click(regras.getByLabelText("Sem Limite de Dias"));
  expect(
    (regras.getByLabelText("Dias Máximos Permitidos (Dias corridos) *") as HTMLInputElement)
      .disabled,
  ).toBe(true);
  fireEvent.click(
    regras.getByText("Dia Integral", { selector: "summary span" }),
  );
  fireEvent.click(regras.getByLabelText("Por Horas"));
  fireEvent.change(regras.getByLabelText("Possui Trava de Recorrência? *"), {
    target: { value: "true" },
  });
  fireEvent.change(regras.getByLabelText("Quantidade de ocorrências"), {
    target: { value: "2" },
  });
  fireEvent.change(regras.getByLabelText("Intervalo de recorrência"), {
    target: { value: "3" },
  });
  fireEvent.change(regras.getByLabelText("Unidade de recorrência"), {
    target: { value: "Anos" },
  });
  fireEvent.change(screen.getByLabelText("Exige Parentesco? *"), {
    target: { value: "true" },
  });
  selecionarAmparoLegal();
  fireEvent.click(screen.getByRole("button", { name: "Pai / Mãe" }));
  fireEvent.click(screen.getByRole("button", { name: "Tio(a)" }));
  if (screen.queryByRole('button', {name: 'Avançar'})) fireEvent.click(screen.getByRole('button', {name: 'Avançar'}));
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
    screen.getByLabelText("Nome da Ocorrência (Exibido no Lançamento) *"),
    { target: { value: "Parametrização revisada" } },
  );
  if (screen.queryByRole('button', {name: 'Avançar'})) fireEvent.click(screen.getByRole('button', {name: 'Avançar'}));
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

it('configura e preserva regras independentes por tipo de vinculo', async () => {
  montar();
  fireEvent.click(screen.getByRole('button', { name: 'Nova Parametriza\u00e7\u00e3o' }));
  expect(screen.queryByRole('region', { name: 'Regras: Nomeado Efetivo' })).toBeNull();
  fireEvent.change(screen.getByLabelText('Nome da Ocorr\u00eancia (Exibido no Lan\u00e7amento) *'), { target: { value: 'Regras por vinculo' } });
  fireEvent.change(screen.getByLabelText('Data In\u00edcio Vig\u00eancia *'), { target: { value: '2026-10-20' } });
  selecionarAmparoLegal();
  fireEvent.click(screen.getByLabelText('Nomeado Efetivo'));
  fireEvent.click(screen.getByLabelText('Contrato Tempor\u00e1rio'));
  let efetivo = within(screen.getByRole('region', { name: 'Regras: Nomeado Efetivo' }));
  const temporario = within(screen.getByRole('region', { name: 'Regras: Contrato Tempor\u00e1rio' }));
  fireEvent.change(efetivo.getByLabelText(/Dias M\u00e1ximos/), { target: { value: '8' } });
  fireEvent.change(temporario.getByLabelText(/Dias M\u00e1ximos/), { target: { value: '5' } });
  fireEvent.change(temporario.getByLabelText(/Possui Trava/), { target: { value: 'true' } });
  fireEvent.change(temporario.getByLabelText('Intervalo de recorr\u00eancia'), { target: { value: '12' } });
  expect((efetivo.getByLabelText(/Possui Trava/) as HTMLSelectElement).value).toBe('false');
  fireEvent.click(screen.getByLabelText('Nomeado Efetivo'));
  expect(screen.queryByRole('region', { name: 'Regras: Nomeado Efetivo' })).toBeNull();
  fireEvent.click(screen.getByLabelText('Nomeado Efetivo'));
  efetivo = within(screen.getByRole('region', { name: 'Regras: Nomeado Efetivo' }));
  expect((efetivo.getByLabelText(/Dias M\u00e1ximos/) as HTMLInputElement).value).toBe('8');
  fireEvent.click(screen.getByRole('button', { name: 'Avan\u00e7ar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Salvar e Publicar' }));
  const salvo = carregarEventos().find(e => e.nome === 'Regras por vinculo')!;
  expect(salvo.configuracao?.regrasPorVinculo?.Efetivo.quantidade).toBe(8);
  expect(salvo.configuracao?.regrasPorVinculo?.['Tempor\u00e1rio']).toMatchObject({ quantidade: 5, travaRecorrencia: true, recorrenciaIntervalo: 12 });
  await acaoEvento(salvo.codigo, 'Editar');
  expect((within(screen.getByRole('region', { name: 'Regras: Nomeado Efetivo' })).getByLabelText(/Dias M\u00e1ximos/) as HTMLInputElement).value).toBe('8');
  expect((within(screen.getByRole('region', { name: 'Regras: Contrato Tempor\u00e1rio' })).getByLabelText(/Dias M\u00e1ximos/) as HTMLInputElement).value).toBe('5');
});

it('valida o limite e a recorrencia de cada vinculo selecionado', () => {
  const base = structuredClone(eventosIniciais[0]);
  const regra = regraDoVinculo(base, 'Efetivo');
  const evento = { ...base, vinculos: ['Efetivo', 'Comissionado'], configuracao: {
    ...configuracaoDoEvento(base), inicioVigencia: '2026-01-01',
    regrasPorVinculo: { Efetivo: regra, Comissionado: { ...regra, quantidade: 0 } },
  } };
  expect(validarEvento(evento, [])).toContain('Exclusivamente Comissionado');
  evento.configuracao.regrasPorVinculo.Comissionado = { ...regra, travaRecorrencia: true, recorrenciaIntervalo: 0 };
  expect(validarEvento(evento, [])).toContain('recorr');
});
