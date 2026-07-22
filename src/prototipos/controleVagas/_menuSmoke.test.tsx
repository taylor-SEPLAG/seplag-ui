// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ControleVagasRegrasContent } from "./ControleVagasRegrasContent";
import { QuadroAutorizadoContent } from "./QuadroAutorizadoContent";
import { DashboardGerencialContent } from "./DashboardGerencialContent";
import { VagasIndividualizadasContent } from "./VagasIndividualizadasContent";
import { TitularidadeCessoesContent } from "./TitularidadeCessoesContent";
import { ProjecoesVagasContent } from "./ProjecoesVagasContent";
import { DistribuicaoIndividualContent } from "./DistribuicaoIndividualContent";
import { controleVagasStore } from "./controleVagasStore";

afterEach(cleanup);
const cases = [
  ["Dashboard gerencial", DashboardGerencialContent],
  ["Regras e Parâmetros", ControleVagasRegrasContent],
  ["Quadro Autorizado", QuadroAutorizadoContent],
  ["Vagas Individualizadas", VagasIndividualizadasContent],
  ["Exercício e Cessões", TitularidadeCessoesContent],
  ["Projeções", ProjecoesVagasContent],
  ["Distribuição", DistribuicaoIndividualContent],
] as const;

describe("menus do Controle de Vagas", () => {
  it.each(cases)("renderiza %s", (_nome, Component) => {
    const result = render(<MemoryRouter><Component /></MemoryRouter>);
    expect(result.container.firstElementChild).not.toBeNull();
  });

  it("separa edição pré-vigência de nova versão", () => {
    const result = render(<MemoryRouter><QuadroAutorizadoContent /></MemoryRouter>);
    expect(result.getAllByTitle("Edição indisponível após a vigência")[0].hasAttribute("disabled")).toBe(true);
    expect(result.getByTitle("Editar antes da vigência").hasAttribute("disabled")).toBe(false);
    expect(result.getAllByTitle("Criar nova versão")[0].querySelector(".pi-plus")).toBeTruthy();
  });
  it("abre os dados do quadro em modal e diferencia a criação de nova versão", () => {
    const result = render(<MemoryRouter><QuadroAutorizadoContent /></MemoryRouter>);
    fireEvent.click(result.getAllByTitle("Visualizar")[0]);
    const dialog = result.getByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(dialog.querySelector("button.is-primary .pi-plus")).toBeTruthy();
  });
  it("usa a evolução legal existente na rota de nova versão", () => {
    const result = render(<MemoryRouter initialEntries={["/prototipos/sigep/controle-vagas/quadro-autorizado/1/nova-versao"]}><Routes><Route path="/prototipos/sigep/controle-vagas/quadro-autorizado/:id/nova-versao" element={<QuadroAutorizadoContent />} /></Routes></MemoryRouter>);
    expect(result.getByText("Evolução do quadro legal")).toBeTruthy();
    expect(result.getByText("Ampliação legal")).toBeTruthy();
    expect(result.getByText("Redução legal")).toBeTruthy();
    expect(result.getByText("Transformação")).toBeTruthy();
    expect(result.getByText("Extinção progressiva")).toBeTruthy();
    const buscaLegal = result.getByLabelText("Buscar documentos legais associados");
    fireEvent.focus(buscaLegal);
    const primeiraNorma = result.container.querySelector('input[type="checkbox"]');
    expect(primeiraNorma).toBeTruthy();
    fireEvent.click(primeiraNorma!);
    fireEvent.click(result.getByText("Simular impacto legal"));
    expect(result.getByText("Resultado da simulação")).toBeTruthy();
    fireEvent.click(result.getByText("Registrar nova versão"));
    expect(result.getByRole("dialog", { name: "Registrar nova versão?" })).toBeTruthy();
    expect(result.getByText("Confirmar e registrar")).toBeTruthy();
  });
  it("renderiza a rota de nova autorização", () => {
    const result = render(<MemoryRouter initialEntries={["/prototipos/sigep/controle-vagas/quadro-autorizado/novo"]}><QuadroAutorizadoContent /></MemoryRouter>);
    expect(result.getAllByText("Nova autorização").length).toBeGreaterThan(0);
    expect(result.getByText("Como a lei definiu a alocação das vagas? *")).toBeTruthy();
  });
  it("ativa, recolhe e expande o painel de especificação", () => {
    const result = render(<MemoryRouter><DashboardGerencialContent /></MemoryRouter>);
    fireEvent.click(result.getByTitle("Visualização do desenvolvedor"));
    expect(result.getByLabelText("Especificação do componente")).toBeTruthy();
    fireEvent.click(result.getByTitle("Recolher painel"));
    expect(result.getByLabelText("Painel de visualização recolhido")).toBeTruthy();
    fireEvent.click(result.getByTitle("Expandir painel"));
    expect(result.getByLabelText("Especificação do componente")).toBeTruthy();
  });
  it("abre a validação visual da área de negócio", async () => {
    const result = render(<MemoryRouter><DashboardGerencialContent /></MemoryRouter>);
    fireEvent.click(result.getByTitle("Validação da área de negócio"));
    expect(result.container.querySelector("aside.prototype-business-panel")).toBeTruthy();
    expect(result.getByText("Identificação do avaliador")).toBeTruthy();
    fireEvent.change(result.getByLabelText("E-mail"), { target: { value: "avaliador@seplag.mt.gov.br" } });
    fireEvent.change(result.getByLabelText("Senha"), { target: { value: "teste-local" } });
    fireEvent.click(result.getByText("Entrar para avaliar"));
    expect(await result.findByText("avaliador")).toBeTruthy();
    const indicador = result.getByTitle("Validar: Cargos legais");
    fireEvent.click(indicador);
    expect(result.getByText("O que este item representa")).toBeTruthy();
    fireEvent.click(result.getByText("Aprovar"));
    expect(result.getByText("Aprovado")).toBeTruthy();
  });
  it("possui as fontes necessárias para a Fase 10", () => {
    const state = controleVagasStore.getState();
    const ocupacoesAtivas = state.ocupacoes.filter((item) => item.situacao === "ATIVA");
    expect(new Set(state.vagas.map((vaga) => `${vaga.quadroCodigo}|${vaga.cargo}`)).size).toBeGreaterThan(0);
    expect(state.vagas.every((vaga) => Boolean(vaga.lei && vaga.orgaoTitular))).toBe(true);
    expect(state.vagas.filter((vaga) => vaga.estado === "OCUPADA").every((vaga) => ocupacoesAtivas.some((ocupacao) => ocupacao.vagaId === vaga.id))).toBe(true);
    expect(ocupacoesAtivas.every((ocupacao) => state.vagas.some((vaga) => vaga.id === ocupacao.vagaId && vaga.estado === "OCUPADA"))).toBe(true);
    expect(state.cessoes.some((item) => item.situacao === "ATIVA")).toBe(true);
    expect(state.excecoesJudiciais.some((item) => item.situacao === "ATIVA")).toBe(true);
    expect(state.vagas.some((vaga) => vaga.situacaoLegal === "EM_EXTINCAO" || vaga.situacaoLegal === "EXTINTA")).toBe(true);
    expect(state.fatoresProjecao.some((fator) => fator.categoria.includes("APOSENTADORIA") && fator.vinculoIds?.length)).toBe(true);
    expect(state.metodologias.some((item) => item.status === "VIGENTE")).toBe(true);
    expect(controleVagasStore.historico().length).toBeGreaterThan(0);
  });});
