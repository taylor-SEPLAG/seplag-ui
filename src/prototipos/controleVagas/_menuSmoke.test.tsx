// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ControleVagasRegrasContent } from "./ControleVagasRegrasContent";
import { QuadroAutorizadoContent } from "./QuadroAutorizadoContent";
import { DashboardGerencialContent } from "./DashboardGerencialContent";
import { VagasIndividualizadasContent } from "./VagasIndividualizadasContent";
import { ComprometimentosVagasContent } from "./ComprometimentosVagasContent";
import { OcupacoesNominaisContent } from "./OcupacoesNominaisContent";
import { TitularidadeCessoesContent } from "./TitularidadeCessoesContent";
import { ProjecoesVagasContent } from "./ProjecoesVagasContent";
import { DistribuicaoIndividualContent } from "./DistribuicaoIndividualContent";
import { SaldosControleVagasContent } from "./SaldosControleVagasContent";
import { controleVagasStore } from "./controleVagasStore";

afterEach(cleanup);
const cases = [
  ["Dashboard gerencial", DashboardGerencialContent],
  ["Regras e Parâmetros", ControleVagasRegrasContent],
  ["Quadro Autorizado", QuadroAutorizadoContent],
  ["Vagas Individualizadas", VagasIndividualizadasContent],
  ["Comprometimentos", ComprometimentosVagasContent],
  ["Ocupações Nominais", OcupacoesNominaisContent],
  ["Exercício e Cessões", TitularidadeCessoesContent],
  ["Projeções", ProjecoesVagasContent],
  ["Distribuição", DistribuicaoIndividualContent],
  ["Saldos", SaldosControleVagasContent],
] as const;

describe("menus do Controle de Vagas", () => {
  it.each(cases)("renderiza %s", (_nome, Component) => {
    const result = render(<MemoryRouter><Component /></MemoryRouter>);
    expect(result.container.firstElementChild).not.toBeNull();
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
