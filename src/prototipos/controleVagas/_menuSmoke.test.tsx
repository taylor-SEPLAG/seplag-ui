// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ControleVagasRegrasContent } from "./ControleVagasRegrasContent";
import { QuadroAutorizadoContent } from "./QuadroAutorizadoContent";
import { DashboardGerencialContent } from "./DashboardGerencialContent";
import { VagasIndividualizadasContent } from "./VagasIndividualizadasContent";
import { DistribuicaoIndividualContent } from "./DistribuicaoIndividualContent";
import { controleVagasStore } from "./controleVagasStore";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const cases = [
  ["Dashboard gerencial", DashboardGerencialContent],
  ["Regras e Parâmetros", ControleVagasRegrasContent],
  ["Quadro Autorizado", QuadroAutorizadoContent],
  ["Vagas Individualizadas", VagasIndividualizadasContent],
  ["Distribuição", DistribuicaoIndividualContent],
] as const;

function CurrentPath() {
  const location = useLocation();
  return <output aria-label="Rota atual">{location.pathname}{location.search}</output>;
}

describe("menus do Controle de Vagas", () => {
  it.each(cases)("renderiza %s", (_nome, Component) => {
    const result = render(
      <MemoryRouter>
        <Component />
      </MemoryRouter>,
    );
    expect(result.container.firstElementChild).not.toBeNull();
  });

  it("separa edição pré-vigência de nova versão", () => {
    const result = render(
      <MemoryRouter>
        <QuadroAutorizadoContent />
      </MemoryRouter>,
    );
    const editar = result.getAllByLabelText("Editar");
    expect(editar.every((botao) => !botao.hasAttribute("disabled"))).toBe(true);
    expect(result.queryByLabelText("Distribuir vagas")).toBeNull();
    expect(
      result.getAllByLabelText("Criar nova versão")[0].querySelector(".pi-plus"),
    ).toBeTruthy();
  });

  it("resume órgãos no quadro e não repete a distribuição no histórico", () => {
    const result = render(
      <MemoryRouter>
        <QuadroAutorizadoContent />
      </MemoryRouter>,
    );
    const resumoOrgaos = result.getAllByRole("button", { name: /órgãos \+ pendente/i });
    expect(resumoOrgaos.length).toBeGreaterThan(0);
    fireEvent.click(resumoOrgaos[0]);
    expect(result.getByRole("dialog", { name: /Órgãos do quadro/i })).toBeTruthy();
    expect(result.getAllByText("Pendente de distribuição").length).toBeGreaterThan(0);
    fireEvent.click(result.getAllByLabelText("Abrir detalhes do quadro")[0]);
    expect(result.queryByText("Distribuição por órgão")).toBeNull();
    expect(result.queryByText("Posição atual das vagas distribuídas e pendentes.")).toBeNull();
  });

  it("abre os dados do quadro em modal e diferencia a criação de nova versão", () => {
    const result = render(
      <MemoryRouter>
        <QuadroAutorizadoContent />
      </MemoryRouter>,
    );
    fireEvent.click(result.getAllByLabelText("Visualizar")[0]);
    const dialog = result.getByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(dialog.textContent).toContain("Criar nova versão");
  });

  it("usa a evolução legal existente na rota de nova versão", () => {
    const result = render(
      <MemoryRouter
        initialEntries={[
          "/prototipos/sigep/controle-vagas/quadro-autorizado/1/nova-versao",
        ]}
      >
        <Routes>
          <Route
            path="/prototipos/sigep/controle-vagas/quadro-autorizado/:id/nova-versao"
            element={<QuadroAutorizadoContent />}
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(result.getByText("Nova versão do quadro")).toBeTruthy();
    expect(result.getByText("Ampliação legal")).toBeTruthy();
    expect(result.getByText("Redução legal")).toBeTruthy();
    expect(result.getByText("Transformação")).toBeTruthy();
    expect(result.getByText("Extinção progressiva")).toBeTruthy();
    expect(result.getByText("Distribuição")).toBeTruthy();
    expect(result.getByText("Redistribuição")).toBeTruthy();
    expect(result.queryByText("Inclusão de órgão")).toBeNull();
    expect(result.queryByText("Exclusão de órgão")).toBeNull();
    expect(result.getByText("Observação")).toBeTruthy();
    expect(result.queryByText("Justificativa")).toBeNull();
    fireEvent.click(result.getByText("Distribuição"));
    expect(result.getByText("Destinações da distribuição")).toBeTruthy();
    expect(result.getAllByText("Quantidade atual").length).toBeGreaterThan(0);
    expect(result.getAllByText("A adicionar *").length).toBeGreaterThan(0);
    expect(result.getByText("Adicionar destinação")).toBeTruthy();
    fireEvent.click(result.getByText("Redistribuição"));
    expect(result.getByText("Órgão atual das vagas")).toBeTruthy();
    expect(result.getByText("Novo órgão das vagas")).toBeTruthy();
    fireEvent.click(result.getByText("Ampliação legal"));
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
    const result = render(
      <MemoryRouter
        initialEntries={["/prototipos/sigep/controle-vagas/quadro-autorizado/novo"]}
      >
        <QuadroAutorizadoContent />
      </MemoryRouter>,
    );
    expect(result.getAllByText("Novo Quadro").length).toBeGreaterThan(0);
    expect(result.getByText("Quantidade autorizada")).toBeTruthy();
    expect(result.queryByText("Como a lei definiu a alocação das vagas?")).toBeNull();
  });

  it("ativa, recolhe e expande o painel de especificação", () => {
    const result = render(
      <MemoryRouter>
        <DashboardGerencialContent />
      </MemoryRouter>,
    );
    fireEvent.click(result.getByTitle("Visualização do desenvolvedor"));
    expect(result.getByLabelText("Especificação do componente")).toBeTruthy();
    fireEvent.click(result.getByTitle("Recolher painel"));
    expect(result.getByLabelText("Painel de visualização recolhido")).toBeTruthy();
    fireEvent.click(result.getByTitle("Expandir painel"));
    expect(result.getByLabelText("Especificação do componente")).toBeTruthy();
  });

  it("abre a validação visual da área de negócio", async () => {
    const result = render(
      <MemoryRouter>
        <DashboardGerencialContent />
      </MemoryRouter>,
    );
    fireEvent.click(result.getByTitle("Validação da área de negócio"));
    expect(result.container.querySelector("aside.prototype-business-panel")).toBeTruthy();
    expect(result.getByText("Identificação do avaliador")).toBeTruthy();
    fireEvent.change(result.getByLabelText("E-mail"), {
      target: { value: "avaliador@seplag.mt.gov.br" },
    });
    fireEvent.change(result.getByLabelText("Senha"), { target: { value: "teste-local" } });
    fireEvent.click(result.getByText("Entrar para avaliar"));
    expect(await result.findByText("avaliador")).toBeTruthy();
    const indicador = result.getByTitle("Validar: Cargos legais");
    fireEvent.click(indicador);
    expect(result.getByText("O que este item representa")).toBeTruthy();
    fireEvent.click(result.getByText("Aprovar"));
    expect(result.getByText("Aprovado")).toBeTruthy();
  });

  it("consolida avaliações por avaliador para o administrador", async () => {
    localStorage.setItem(
      "prototype-review-user",
      JSON.stringify({
        id: "admin-1",
        email: "admin@seplag.mt.gov.br",
        name: "Administrador",
        role: "ADMIN",
      }),
    );
    localStorage.setItem(
      "prototype-reviews",
      JSON.stringify([
        {
          id: "review-1",
          prototypeId: "SIGEP",
          prototypeVersion: "controle-vagas-prototipo-atual",
          screenId: "CV-DASH",
          componentId: "CV-DASH-KPI-001",
          componentTitle: "Cargos legais",
          reviewerId: "reviewer-1",
          reviewerName: "Danielle Cruz",
          reviewerEmail: "danielle@seplag.mt.gov.br",
          status: "APROVADO",
          comment: "Validado",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]),
    );
    const result = render(
      <MemoryRouter>
        <DashboardGerencialContent />
      </MemoryRouter>,
    );
    fireEvent.click(result.getByTitle("Validação da área de negócio"));
    expect(await result.findByText("Acompanhamento da validação")).toBeTruthy();
    expect(result.getByText("Danielle Cruz")).toBeTruthy();
    expect(result.getByText("Por componente")).toBeTruthy();
    expect(result.getAllByText("Pendências").length).toBeGreaterThan(0);
  });

  it("controla individualmente os indicadores do Dashboard", () => {
    const result = render(
      <MemoryRouter>
        <DashboardGerencialContent />
      </MemoryRouter>,
    );
    const possuiCartao = (nome: string) =>
      [...result.container.querySelectorAll("button.prototype-dash-kpi")].some((item) =>
        item.textContent?.includes(nome),
      );
    expect(result.container.querySelector(".prototype-dash-kpis.management.unified")).toBeTruthy();
    expect(possuiCartao("Cargos legais")).toBe(true);
    fireEvent.click(result.getByText("Filtros da consulta"));
    const controle = result.getByLabelText("Cargos legais");
    expect((controle as HTMLInputElement).checked).toBe(true);
    fireEvent.click(controle);
    expect((controle as HTMLInputElement).checked).toBe(false);
    expect(possuiCartao("Cargos legais")).toBe(false);
  });

  it("direciona pendências ao Quadro Autorizado e não oferece atalho para Distribuição", () => {
    const result = render(
      <MemoryRouter initialEntries={["/prototipos/sigep/controle-vagas/dashboard"]}>
        <DashboardGerencialContent />
        <CurrentPath />
      </MemoryRouter>,
    );
    const indicador = [...result.container.querySelectorAll("button.prototype-dash-kpi")]
      .find((item) => item.textContent?.includes("Pendente de ato de distribuicao"));
    expect(indicador).toBeTruthy();
    fireEvent.click(indicador!);
    expect(result.getByLabelText("Rota atual").textContent).toBe(
      "/prototipos/sigep/controle-vagas/quadro-autorizado",
    );
    fireEvent.click(result.getByRole("button", { name: /Pendentes de ato de distribuição/ }));
    expect(result.getByLabelText("Rota atual").textContent).toBe(
      "/prototipos/sigep/controle-vagas/quadro-autorizado",
    );
    expect(result.queryByRole("button", { name: "Ver todas" })).toBeNull();
    expect(result.container.innerHTML).not.toContain("/distribuicao");
  });

  it("possui as fontes necessárias para a Fase 10", () => {
    const state = controleVagasStore.getState();
    const ocupacoesAtivas = state.ocupacoes.filter((item) => item.situacao === "ATIVA");
    expect(new Set(state.vagas.map((vaga) => `${vaga.quadroCodigo}|${vaga.cargo}`)).size).toBeGreaterThan(0);
    expect(state.vagas.every((vaga) => Boolean(vaga.lei && vaga.orgaoTitular))).toBe(true);
    expect(
      state.vagas
        .filter((vaga) => vaga.estado === "OCUPADA")
        .every((vaga) => ocupacoesAtivas.some((ocupacao) => ocupacao.vagaId === vaga.id)),
    ).toBe(true);
    expect(
      ocupacoesAtivas.every((ocupacao) =>
        state.vagas.some((vaga) => vaga.id === ocupacao.vagaId && vaga.estado === "OCUPADA"),
      ),
    ).toBe(true);
    expect(state.excecoesJudiciais.some((item) => item.situacao === "ATIVA")).toBe(true);
    expect(
      state.vagas.some(
        (vaga) => vaga.situacaoLegal === "EM_EXTINCAO" || vaga.situacaoLegal === "EXTINTA",
      ),
    ).toBe(true);
    expect(controleVagasStore.historico().length).toBeGreaterThan(0);
  });
});
