// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { atualizarVinculosCadastrados, vinculos as vidaVinculos, eventos as vidaEventos } from "../vidaFuncional/model";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { VinculoV2CadastroPage, VinculoV2ConsultaPage, VinculoV2DetalhesPage } from "./VinculoV2Page";

const montar = (inicio = "/prototipos/sigep/vinculos-v2") => render(<MemoryRouter initialEntries={[inicio]}><Routes>
  <Route path="/prototipos/sigep/vinculos-v2" element={<VinculoV2ConsultaPage />} />
  <Route path="/prototipos/sigep/vinculos-v2/novo" element={<VinculoV2CadastroPage />} />
  <Route path="/prototipos/sigep/vinculos-v2/:id/editar" element={<VinculoV2CadastroPage />} />
  <Route path="/prototipos/sigep/vinculos-v2/:id" element={<VinculoV2DetalhesPage />} />
</Routes></MemoryRouter>);
beforeEach(() => localStorage.clear());
afterEach(() => { vi.restoreAllMocks(); cleanup(); localStorage.clear(); atualizarVinculosCadastrados(); });

it("bloqueia o cadastro manual de Aposentado ao acessar a URL diretamente", () => {
  montar("/prototipos/sigep/vinculos-v2/novo?tipo=Aposentado");
  expect(screen.getByRole("alert").textContent).toContain("módulo de Aposentadoria e não permite cadastro manual");
  expect(screen.queryByRole("button", { name: "Cadastrar Vínculo" })).toBeNull();
  expect(screen.queryByRole("combobox", { name: /CPF/ })).toBeNull();
  expect(localStorage.getItem("prototype-vinculos-v2")).toBeNull();
});

it("preenche apenas o nome pelo CPF e não exibe identificadores antes do cadastro", () => {
  montar("/prototipos/sigep/vinculos-v2/novo?tipo=Provis%C3%B3rio");
  const cpf = screen.getByRole("combobox", { name: /CPF/ });
  expect(screen.queryByLabelText(/Matrícula/)).toBeNull();
  expect(screen.queryByLabelText(/Nº do Vínculo/)).toBeNull();
  fireEvent.change(cpf, { target: { value: "00000000000" } });
  expect(screen.getByDisplayValue("João Silva")).toBeTruthy();
  fireEvent.change(cpf, { target: { value: "111" } });
  fireEvent.change(cpf, { target: { value: "11111111111" } });
  expect(screen.getByDisplayValue("Maria Souza")).toBeTruthy();
  fireEvent.change(cpf, { target: { value: "99999999999" } });
  expect(screen.queryByLabelText(/Matrícula/)).toBeNull();
  expect(localStorage.getItem("prototype-vinculos-v2")).toBeNull();
  expect(screen.getByRole("button", { name: "Cadastrar Vínculo" }).hasAttribute("disabled")).toBe(true);
});

it("busca nome ou CPF no mesmo campo, combina matrícula e limpa os filtros internos", () => {
  montar();
  const linha = screen.getByText("Nomeado Efetivo", { selector: "strong" }).closest("tr") as HTMLTableRowElement;
  fireEvent.click(within(linha).getByRole("button", { name: "Visualizar" }));
  const filtros = screen.getByRole("region", { name: "Filtros de servidores de Nomeado Efetivo" });
  fireEvent.change(within(filtros).getByLabelText("Nome ou CPF"), { target: { value: "joao" } });
  expect(screen.getAllByRole("button", { name: "Ver detalhes" })).toHaveLength(1);
  fireEvent.change(within(filtros).getByLabelText("Nome ou CPF"), { target: { value: "000.000.000-00" } });
  fireEvent.change(within(filtros).getByLabelText("Matrícula"), { target: { value: "327305" } });
  expect(screen.getAllByRole("button", { name: "Ver detalhes" })).toHaveLength(1);
  fireEvent.change(within(filtros).getByLabelText("Matrícula"), { target: { value: "800001" } });
  expect(screen.queryByRole("button", { name: "Ver detalhes" })).toBeNull();
  expect(screen.getByText("Nenhum vínculo encontrado para os filtros informados.")).toBeTruthy();
  expect(within(linha).getAllByRole("cell")[2].textContent).toBe("6");
  fireEvent.click(within(filtros).getByRole("button", { name: "Limpar filtro" }));
  expect(screen.getAllByRole("button", { name: "Ver detalhes" })).toHaveLength(6);
});

it("lista os tipos, incluindo Aposentado, e mostra apenas vínculos ativos e encerrados", () => {
  montar();
  const tabela = screen.getByRole("region", { name: "Tipos de vínculo" });
  expect(within(tabela).getAllByRole("button", { name: "Visualizar" })).toHaveLength(10);
  expect((screen.getByRole("combobox", { name: "Registros por página de tipos de vínculo" }) as HTMLSelectElement).value).toBe("10");
  fireEvent.click(screen.getByRole("button", { name: "Próxima página de tipos de vínculo" }));
  expect(within(tabela).getAllByRole("button", { name: "Visualizar" })).toHaveLength(10);
  fireEvent.click(screen.getByRole("button", { name: "Primeira página de tipos de vínculo" }));
  fireEvent.change(screen.getByRole("combobox", { name: "Registros por página de tipos de vínculo" }), { target: { value: "20" } });
  expect(within(tabela).getAllByRole("button", { name: "Visualizar" })).toHaveLength(20);
  expect(within(tabela).getByText("Contrato Temporário Vínculo Único")).toBeTruthy();
  const kpis = screen.getByRole("region", { name: "Indicadores de vínculos" });
  expect(kpis.textContent).toContain("Vínculos Ativos64");
  expect(kpis.textContent).not.toContain("Vínculos Inativos");
  expect(kpis.textContent).toContain("Vínculos Encerrados44");
  fireEvent.click(screen.getByRole("button", { name: "Próxima página de tipos de vínculo" }));
  const aposentado = within(tabela).getByText("Aposentado", { exact: true }).closest("tr") as HTMLTableRowElement;
  fireEvent.click(within(aposentado).getByRole("button", { name: "Visualizar" }));
  expect(screen.getByRole("note").textContent).toContain("O cadastro desse Vínculo ocorre pelo módulo de Aposentadoria. Não é permitido cadastrá-lo manualmente nesta tela.");
  expect(screen.queryByRole("button", { name: "Cadastrar Vínculo" })).toBeNull();
  expect(screen.getByText("Nenhum vínculo encontrado para os filtros informados.")).toBeTruthy();
});

it("conta vínculos de todas as situações na coluna por tipo", () => {
  montar();
  const tabela = screen.getByRole("region", { name: "Tipos de vínculo" });
  expect(within(tabela).getByRole("columnheader", { name: "Quantidade de Vínculos" })).toBeTruthy();
  for (const tipo of ["Estabilizado Constitucionalmente", "Empossado em Cargo Eletivo"]) {
    const linha = within(tabela).getByText(tipo, { selector: "strong" }).closest("tr") as HTMLTableRowElement;
    expect(within(linha).getAllByRole("cell")[2].textContent).toBe("6");
  }
});
it("adiciona cinco registros por tipo com situações variadas", () => {
  montar();
  fireEvent.change(screen.getByRole("combobox", { name: "Registros por página de tipos de vínculo" }), { target: { value: "20" } });
  const tabela = screen.getByRole("region", { name: "Tipos de vínculo" });
  const linhas = Array.from(tabela.querySelectorAll("tbody > tr")).filter((linha) => linha.querySelector("button[aria-label='Visualizar']"));
  expect(linhas).toHaveLength(20);
  for (const linha of linhas) {
    const total = Number(within(linha as HTMLTableRowElement).getAllByRole("cell")[2].textContent);
    expect(total).toBeGreaterThanOrEqual(5);
    fireEvent.click(within(linha as HTMLTableRowElement).getByRole("button", { name: "Visualizar" }));
    const expandida = linha.nextElementSibling as HTMLTableRowElement;
    for (const situacao of ["Ativo", "Encerrado"]) {
      expect(within(expandida).getAllByText(situacao, { selector: ".v2v-status" }).length).toBeGreaterThan(0);
    }
  }
});
it("cadastra no tipo escolhido e preserva o número funcional do próximo vínculo", () => {
  montar();
  const linha = screen.getByText("Estabilizado Constitucionalmente", { selector: "strong" }).closest("tr") as HTMLTableRowElement;
  fireEvent.click(within(linha).getByRole("button", { name: "Visualizar" }));
  fireEvent.click(screen.getByRole("button", { name: "Cadastrar Vínculo" }));
  expect((screen.getByRole("combobox", { name: /Tipo de Vínculo/ }) as HTMLSelectElement).value).toBe("Estabilizado Constitucionalmente");
  expect((screen.getByRole("combobox", { name: /Tipo de Vínculo/ }) as HTMLSelectElement).disabled).toBe(true);
  fireEvent.change(screen.getByRole("combobox", { name: /CPF/ }), { target: { value: "000" } });
  fireEvent.click(screen.getByRole("option", { name: /000\.000\.000-00/ }));
  expect((screen.getByDisplayValue("João Silva") as HTMLInputElement).readOnly).toBe(true);
  expect(screen.queryByLabelText(/Matrícula/)).toBeNull();
  expect(screen.queryByLabelText(/Nº do Vínculo/)).toBeNull();
  const carreira = screen.getByRole("combobox", { name: "Carreira", exact: true });
  fireEvent.change(carreira, { target: { value: "" } });
  fireEvent.change(screen.getByLabelText(/Órgão\/Entidade/), { target: { value: "SEPLAG" } });
  fireEvent.change(screen.getByLabelText(/Lotação/), { target: { value: "Gabinete" } });

  fireEvent.change(screen.getByLabelText(/Data de Início/), { target: { value: "2026-10-08" } });
  fireEvent.click(screen.getByRole("button", { name: "Cadastrar Vínculo" }));
  const salvos = JSON.parse(localStorage.getItem("prototype-vinculos-v2") ?? "[]");
  expect(salvos[0]).toMatchObject({ tipo: "Estabilizado Constitucionalmente", cpf: "000.000.000-00", numero: "3", orgao: "SEPLAG", situacao: "Ativo", carreira: "" });
  expect(salvos[0].criacao.titulo).toBe("Vínculo cadastrado");
  atualizarVinculosCadastrados();
  expect(vidaVinculos.some(v => v.id === salvos[0].id && v.numero === 3)).toBe(true);
  expect(vidaEventos.find(e => e.vinculoId === salvos[0].id)?.titulo).toBe("Vínculo cadastrado");
  const sucesso = screen.getByRole("dialog", { name: "Vínculo cadastrado" });
  expect(within(sucesso).getByText("327305")).toBeTruthy();
  expect(within(sucesso).getByText("3", { exact: true })).toBeTruthy();
  fireEvent.click(within(sucesso).getByRole("button", { name: "Visualizar vínculo" }));
  expect(screen.getByRole("heading", { name: /Detalhes do Vínculo/ })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Editar Vínculo" })).toBeNull();
  expect(screen.getByRole("button", { name: "Voltar" }).closest(".v2v-detail-actions")).toBeTruthy();
});

it.each(["Fechar", "Close"])("preserva o cadastro ao fechar o modal por %s, após uma falha de gravação", (acao) => {
  montar("/prototipos/sigep/vinculos-v2/novo?tipo=Provis%C3%B3rio");
  fireEvent.change(screen.getByRole("combobox", { name: /CPF/ }), { target: { value: "00000000000" } });
  fireEvent.change(screen.getByLabelText(/Órgão\/Entidade/), { target: { value: "SEPLAG" } });
  fireEvent.change(screen.getByLabelText(/Lotação/), { target: { value: "Gabinete" } });
  fireEvent.change(screen.getByLabelText(/Data de Início/), { target: { value: "2026-10-08" } });
  const gravacao = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => { throw new Error("Falha de gravação"); });
  fireEvent.click(screen.getByRole("button", { name: "Cadastrar Vínculo" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByRole("alert").textContent).toContain("Não foi possível cadastrar");
  expect(localStorage.getItem("prototype-vinculos-v2")).toBeNull();
  gravacao.mockRestore();
  fireEvent.click(screen.getByRole("button", { name: "Cadastrar Vínculo" }));
  const sucesso = screen.getByRole("dialog", { name: "Vínculo cadastrado" });
  fireEvent.click(within(sucesso).getByRole("button", { name: acao, exact: true }));
  expect(screen.getByRole("heading", { name: "Gestão de Vínculos" })).toBeTruthy();
  const salvos = JSON.parse(localStorage.getItem("prototype-vinculos-v2") || "[]");
  expect(salvos).toHaveLength(1);
  expect(salvos[0].numero).toBe("3");
});

it("mostra Órgão/Entidade antes de Lotação e limita as lotações ao órgão", () => {
  montar("/prototipos/sigep/vinculos-v2/novo?tipo=Provis%C3%B3rio");
  const orgao = screen.getByLabelText(/Órgão\/Entidade/) as HTMLSelectElement;
  const lotacao = screen.getByLabelText(/Lotação/) as HTMLSelectElement;
  expect(lotacao.disabled).toBe(true);
  fireEvent.change(orgao, { target: { value: "SEPLAG" } });
  expect(lotacao.disabled).toBe(false);
  fireEvent.change(lotacao, { target: { value: "Gabinete" } });
  fireEvent.change(orgao, { target: { value: "SES" } });
  expect(lotacao.value).toBe("");
  expect(within(lotacao).getByRole("option", { name: "Hospital Regional" })).toBeTruthy();
  expect(within(lotacao).queryByRole("option", { name: "Coordenadoria de Gestão de Pessoas" })).toBeNull();
});

it("exibe Órgão/Entidade antes de Lotação nos detalhes", () => {
  montar("/prototipos/sigep/vinculos-v2/demo-1");
  const orgao = screen.getByText("Órgão/Entidade", { selector: "small" });
  const lotacao = screen.getByText("Lotação", { selector: "small" });
  expect(orgao.compareDocumentPosition(lotacao) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(orgao.parentElement?.textContent).toBe("Órgão/EntidadeSEPLAG");
  expect(lotacao.parentElement?.textContent).toBe("LotaçãoUnidade Central");
});
it("aplica filtros e abre detalhes sem permitir edição", () => {
  montar();
  fireEvent.change(screen.getByLabelText("Tipo de Vínculo"), { target: { value: "Contrato Temporário" } });
  expect(screen.getByRole("region", { name: "Tipos de vínculo" }).querySelectorAll("tbody > tr")).toHaveLength(1);
  expect(screen.queryByLabelText("Lotação")).toBeNull();
  expect(screen.queryByLabelText("Servidor / CPF / Matrícula")).toBeNull();
  expect(within(screen.getByRole("region", { name: "Filtros de consulta" })).queryByRole("button", { name: "Pesquisar" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Limpar filtro" }));
  expect(screen.getByRole("region", { name: "Tipos de vínculo" }).querySelectorAll("tbody > tr")).toHaveLength(10);
  fireEvent.change(screen.getByLabelText("Tipo de Vínculo"), { target: { value: "Contrato Temporário" } });
  const linha = screen.getByText("Contrato Temporário", { selector: "strong" }).closest("tr") as HTMLTableRowElement;
  fireEvent.click(within(linha).getByRole("button", { name: "Visualizar" }));
  const servidor = screen.getByText("Maria Souza").closest("tr") as HTMLTableRowElement;
  fireEvent.click(within(servidor).getByRole("button", { name: "Ver detalhes" }));
  expect(screen.getByRole("heading", { name: /Detalhes do Vínculo/ })).toBeTruthy();
  expect(screen.getByText("418920")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Salvar Vínculo" })).toBeNull();
});
it("pagina os servidores de um tipo sem confundir o número do vínculo com a posição na grade", () => {
  const extras = Array.from({ length: 11 }, (_, indice) => ({
    id: `pagina-${indice}`, tipo: "Provisório", nome: `Servidor ${indice + 1}`, cpf: `555.555.555-${String(indice).padStart(2, "0")}`,
    matricula: `70000${indice}`, numero: String(indice + 4), cargo: "Provisório", orgao: "SEPLAG", inicio: "2026-01-01", situacao: "Ativo",
  }));
  localStorage.setItem("prototype-vinculos-v2", JSON.stringify(extras));
  montar();
  fireEvent.click(screen.getByRole("button", { name: "Próxima página de tipos de vínculo" }));
  const tipo = screen.getByText("Provisório", { selector: "strong" }).closest("tr") as HTMLTableRowElement;
  fireEvent.click(within(tipo).getByRole("button", { name: "Visualizar" }));
  expect(screen.getAllByRole("button", { name: "Ver detalhes" })).toHaveLength(10);
  fireEvent.click(screen.getByRole("button", { name: "Próxima página de servidores" }));
  expect(screen.getAllByRole("button", { name: "Ver detalhes" })).toHaveLength(6);
  const ultimaLinha = screen.getByText("Servidor 11").closest("tr") as HTMLTableRowElement;
  expect(within(ultimaLinha).getByText("14", { selector: "td" })).toBeTruthy();
});
it("informa a origem pelo Ingresso sem bloquear a consulta dos vínculos", () => {
  montar();
  const linha = screen.getByText("Nomeado Efetivo", { selector: "strong" }).closest("tr") as HTMLTableRowElement;
  fireEvent.click(within(linha).getByRole("button", { name: "Visualizar" }));
  expect(screen.getByRole("note").textContent).toContain("O cadastro desse Vínculo ocorre pelo módulo de Ingresso.");
  expect(screen.queryByRole("button", { name: "Cadastrar Vínculo" })).toBeNull();
  expect(screen.getAllByRole("button", { name: "Ver detalhes" }).length).toBeGreaterThan(0);
});

it("mantém o aviso e mostra vínculos para tipo originado pelo Ingresso", () => {
  montar();
  const linha = screen.getByText("Residente Técnico", { selector: "strong" }).closest("tr") as HTMLTableRowElement;
  fireEvent.click(within(linha).getByRole("button", { name: "Visualizar" }));
  expect(screen.getByRole("note")).toBeTruthy();
  expect(screen.getAllByRole("button", { name: "Ver detalhes" })).toHaveLength(5);
  expect(screen.queryByRole("button", { name: "Cadastrar Vínculo" })).toBeNull();
});

it.each([
  "Nomeado Efetivo", "Exclusivamente Comissionado", "Contrato Temporário", "Contrato Temporário Vínculo Único",
  "Residente Técnico", "Estagiário", "Bolsista",
])("bloqueia o cadastro direto de %s", (tipo) => {
  montar(`/prototipos/sigep/vinculos-v2/novo?tipo=${encodeURIComponent(tipo)}`);
  expect(screen.getByRole("alert").textContent).toContain("Este Tipo de Vínculo é gerado pelo módulo de Ingresso e não permite cadastro manual.");
  expect(screen.queryByRole("button", { name: "Salvar Vínculo" })).toBeNull();
  expect(localStorage.getItem("prototype-vinculos-v2")).toBeNull();
});
it.each([
  { data: "2024-01-10", forma: "Exoneração", esperada: "Encerrado" },
  { data: "2024-01-10", forma: "Término de contrato", esperada: "Encerrado" },
  { data: "2024-01-10", forma: "Aposentadoria", esperada: "Encerrado" },
  { data: "2024-01-10", forma: "Falecimento", esperada: "Encerrado" },
  { data: "2999-01-10", forma: "Exoneração", esperada: "Encerrado" },
])("calcula a situação $esperada para $forma em $data", ({ data, forma, esperada }) => {
  montar("/prototipos/sigep/vinculos-v2/demo-1/editar");
  fireEvent.change(screen.getByLabelText(/Data de Vacância/), { target: { value: data } });
  fireEvent.change(screen.getByLabelText(/Forma de Vacância/), { target: { value: forma } });
  expect(screen.getByText(esperada, { selector: ".v2v-status" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  const salvos = JSON.parse(localStorage.getItem("prototype-vinculos-v2") ?? "[]");
  expect(salvos[0]).toMatchObject({ id: "demo-1", vacanciaData: data, vacanciaForma: forma, situacao: esperada });
  expect(screen.getByRole("heading", { name: /Detalhes do Vínculo/ })).toBeTruthy();
  expect(screen.getAllByText(esperada, { selector: ".v2v-status" }).length).toBeGreaterThan(0);
});

it("exige data e forma de vacância juntas", () => {
  montar("/prototipos/sigep/vinculos-v2/demo-1/editar");
  fireEvent.change(screen.getByLabelText(/Data de Vacância/), { target: { value: "2024-01-10" } });
  expect(screen.getByText("Ativo", { selector: ".v2v-status" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  expect(screen.getByRole("alert").textContent).toContain("Informe a Data de Vacância e a Forma de Vacância juntas.");
  expect(localStorage.getItem("prototype-vinculos-v2")).toBeNull();
});

it("mantém ativo com apenas a forma de vacância e encerra quando a data também é preenchida", () => {
  montar("/prototipos/sigep/vinculos-v2/demo-1/editar");
  fireEvent.change(screen.getByLabelText(/Forma de Vacância/), { target: { value: "Aposentadoria" } });
  expect(screen.getByText("Ativo", { selector: ".v2v-status" })).toBeTruthy();
  fireEvent.change(screen.getByLabelText(/Data de Vacância/), { target: { value: "2999-01-10" } });
  expect(screen.getByText("Encerrado", { selector: ".v2v-status" })).toBeTruthy();
  fireEvent.change(screen.getByLabelText(/Data de Vacância/), { target: { value: "" } });
  expect(screen.getByText("Ativo", { selector: ".v2v-status" })).toBeTruthy();
});

it("mantém vínculo encerrado acessível na Gestão de Vínculos", () => {
  montar("/prototipos/sigep/vinculos-v2/demo-1/editar");
  fireEvent.change(screen.getByLabelText(/Data de Vacância/), { target: { value: "2024-01-10" } });
  fireEvent.change(screen.getByLabelText(/Forma de Vacância/), { target: { value: "Exoneração" } });
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
  expect(screen.getByRole("heading", { name: "Gestão de Vínculos" })).toBeTruthy();
  expect(screen.getAllByText("Encerrado", { selector: ".v2v-status" }).length).toBeGreaterThan(0);
  const kpis = screen.getByRole("region", { name: "Indicadores de vínculos" });
  expect(kpis.textContent).toContain("Vínculos Ativos63");
  expect(kpis.textContent).not.toContain("Vínculos Inativos");
  expect(kpis.textContent).toContain("Vínculos Encerrados45");
});
it("organiza o formulário e ajusta perfil e jornada ao cargo", () => {
  montar("/prototipos/sigep/vinculos-v2/demo-1/editar");
  for (const titulo of ["Dados do Servidor", "Dados do Vínculo", "Características do Vínculo", "Observação"]) {
    expect(screen.getByRole("heading", { name: titulo })).toBeTruthy();
  }
  expect((screen.getByDisplayValue("João Silva") as HTMLInputElement).readOnly).toBe(true);
  expect((screen.getByDisplayValue("000.000.000-00") as HTMLInputElement).readOnly).toBe(true);
  expect((screen.getByDisplayValue("327305") as HTMLInputElement).readOnly).toBe(true);
  fireEvent.change(screen.getByRole("combobox", { name: /Cargo/ }), { target: { value: "Professor" } });
  expect((screen.getByRole("combobox", { name: /Perfil Profissional/ }) as HTMLSelectElement).value).toBe("Educação");
  expect((screen.getByRole("combobox", { name: /Jornada de Trabalho/ }) as HTMLSelectElement).value).toBe("20 horas");
});
it.each([
  { tipo: "Estabilizado Constitucionalmente", nome: "Helena Martins", situacao: "Encerrado", forma: "Aposentadoria" },
  { tipo: "Empossado em Cargo Eletivo", nome: "Carla Nunes", situacao: "Encerrado", forma: "Exoneração" },
])("consulta o vínculo $situacao de $nome", ({ tipo, nome, situacao, forma }) => {
  montar();
  const linha = screen.getByText(tipo, { selector: "strong" }).closest("tr") as HTMLTableRowElement;
  fireEvent.click(within(linha).getByRole("button", { name: "Visualizar" }));
  const servidor = screen.getByText(nome).closest("tr") as HTMLTableRowElement;
  expect(within(servidor).getByText(situacao)).toBeTruthy();
  fireEvent.click(within(servidor).getByRole("button", { name: "Ver detalhes" }));
  expect(screen.getByRole("heading", { name: /Detalhes do Vínculo/ })).toBeTruthy();
  expect(screen.getByText(forma)).toBeTruthy();
});
it("lista CPFs ao clicar, aplica máscara e filtra após três dígitos", () => {
  montar("/prototipos/sigep/vinculos-v2/novo?tipo=Provis%C3%B3rio");
  const campoCpf = screen.getByRole("combobox", { name: /CPF/ }) as HTMLInputElement;
  fireEvent.click(campoCpf);
  expect(within(screen.getByRole("listbox")).getAllByRole("option")).toHaveLength(108);
  fireEvent.change(campoCpf, { target: { value: "11" } });
  expect(campoCpf.value).toBe("11");
  expect(screen.getByRole("listbox")).toBeTruthy();
  fireEvent.change(campoCpf, { target: { value: "1111" } });
  expect(campoCpf.value).toBe("111.1");
  expect(screen.getByRole("option", { name: /111\.111\.111-11/ })).toBeTruthy();
  fireEvent.keyDown(campoCpf, { key: "ArrowDown" });
  fireEvent.keyDown(campoCpf, { key: "Enter" });
  expect(campoCpf.value).toBe("111.111.111-11");
  expect((screen.getByDisplayValue("Maria Souza") as HTMLInputElement).readOnly).toBe(true);
  expect(screen.queryByRole("listbox")).toBeNull();
});
