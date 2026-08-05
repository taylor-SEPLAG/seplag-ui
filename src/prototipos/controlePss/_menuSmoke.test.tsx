// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PainelGeralPssContent } from "./PainelGeralPssContent";
import { ProcessosSeletivosContent } from "./ProcessosSeletivosContent";
import { ControleVagasPssContent } from "./ControleVagasPssContent";
import { IntegracaoSiesContent } from "./IntegracaoSiesContent";
import { CertamesListContent } from "./certame/CertamesListContent";
import { CertameFormContent } from "./certame/CertameFormContent";
import { controlePssStore } from "./controlePssStore";
import { definicoesEtapasPss, etapasBloqueadas, etapasManuais, gerarEtapasDoProcesso, progressoProcesso } from "./fluxoPssUtils";
import { calcularDivergenciasSies } from "./divergenciaSiesUtils";
import { camposDeParaPss, construirResumoPorSecretaria, gerarRegistroDePara, podeEfetivarIngresso, statusGeralDoProcesso } from "./deParaIngressoUtils";
import type { SituacaoProcessoPss } from "./types";

afterEach(() => { cleanup(); localStorage.clear(); });

const cases = [
  ["Painel Geral", PainelGeralPssContent],
  ["Processos Seletivos", ProcessosSeletivosContent],
  ["Controle de Vagas", ControleVagasPssContent],
  ["Integração SIES", IntegracaoSiesContent],
  ["Cadastro de Certames", CertamesListContent],
  ["Formulário de Certame", CertameFormContent],
] as const;

describe("menus do Controle PSS", () => {
  it.each(cases)("renderiza %s", (_nome, Component) => {
    const result = render(<MemoryRouter><Component /></MemoryRouter>);
    expect(result.container.firstElementChild).not.toBeNull();
  });

  it("gera a esteira padrão de etapas para qualquer processo novo", () => {
    const etapas = gerarEtapasDoProcesso({ processoId: "PSS-TESTE", etapaAtual: "CADASTRO_SIES", modalidadeExecucao: "PROPRIA", dataAbertura: "2026-01-05" });
    expect(etapas).toHaveLength(definicoesEtapasPss.length);
    expect(etapas.map((etapa) => etapa.ordem)).toEqual(definicoesEtapasPss.map((definicao) => definicao.ordem));
    expect(etapas.filter((etapa) => etapa.situacao === "CONCLUIDA")).toHaveLength(4);
    expect(etapas.find((etapa) => etapa.etapa === "CADASTRO_SIES")?.situacao).toBe("EM_ANDAMENTO");
    expect(etapas.every((etapa) => etapa.foraEscopoSistemico === false)).toBe(true);
  });

  it("marca as etapas do SIES como fora do escopo quando a execução é de empresa contratada", () => {
    const etapas = gerarEtapasDoProcesso({ processoId: "PSS-TESTE", etapaAtual: "INSCRICOES", modalidadeExecucao: "EMPRESA_CONTRATADA", dataAbertura: "2026-01-05" });
    const fora = etapas.filter((etapa) => etapa.foraEscopoSistemico);
    expect(fora.length).toBeGreaterThan(0);
    expect(fora.every((etapa) => etapa.fase === "SIES" && etapa.automacao === "MANUAL")).toBe(true);
  });

  it("aponta as etapas do fluxo apenas para os quatro destinos do menu", () => {
    const destinos = new Set(definicoesEtapasPss.map((definicao) => definicao.telaDestino));
    expect([...destinos].sort()).toEqual(["integracao-sies", "processos", "vagas"]);
    expect(definicoesEtapasPss.filter((definicao) => definicao.telaDestino === "processos")).toHaveLength(4);
    expect(definicoesEtapasPss.filter((definicao) => definicao.telaDestino === "vagas")).toHaveLength(2);
    expect(definicoesEtapasPss.filter((definicao) => definicao.telaDestino === "integracao-sies")).toHaveLength(7);
  });

  it("possui as fontes necessárias para o fluxo PSS", () => {
    const state = controlePssStore.getState();
    expect(state.processos.length).toBeGreaterThanOrEqual(4);
    expect(new Set(state.processos.map((processo) => processo.etapas[0].fase)).size).toBeGreaterThan(0);
    expect(state.processos.some((processo) => processo.modalidadeExecucao === "EMPRESA_CONTRATADA")).toBe(true);
    expect(state.processos.some((processo) => processo.situacao === "HOMOLOGADO")).toBe(true);
    expect(state.processos.some((processo) => etapasBloqueadas(processo).length > 0)).toBe(true);
    expect(state.processos.every((processo) => processo.etapas.length === definicoesEtapasPss.length)).toBe(true);
    expect(state.processos.every((processo) => progressoProcesso(processo).percentual >= 0)).toBe(true);
    expect(state.processos.some((processo) => etapasManuais(processo).length > 0)).toBe(true);
    expect(state.vagas.some((vaga) => !vaga.validadaContraSies)).toBe(true);
    expect(state.candidatos.some((candidato) => candidato.dentroVagasImediatas)).toBe(true);
    expect(state.candidatos.some((candidato) => candidato.cadastroReserva)).toBe(true);
    expect(state.publicacoes.some((publicacao) => publicacao.geracaoManual)).toBe(true);
    expect(state.integracoes).toHaveLength(4);
    expect(controlePssStore.historico().length).toBeGreaterThan(0);
  });

  it("apura divergências de cadastro entre SIGEP e SIES", () => {
    const state = controlePssStore.getState();
    const divergencias = calcularDivergenciasSies(state.vagas, state.processos, state.cargosSies);
    expect(divergencias.length).toBeGreaterThan(0);
    expect(divergencias.some((item) => item.tipo === "SEM_CORRESPONDENCIA_SIES")).toBe(true);
    expect(divergencias.some((item) => item.tipo === "CBO_DIVERGENTE")).toBe(true);
  });

  it("apresenta apenas os dados do Cadastro de Certames no Painel Geral", () => {
    const result = render(<MemoryRouter><PainelGeralPssContent /></MemoryRouter>);
    expect(result.getByText("Certames em acompanhamento")).toBeTruthy();
    expect(result.getByText("Cargos ofertados")).toBeTruthy();
    expect(result.getAllByText("Homologação").length).toBeGreaterThan(0);
    expect(result.container.querySelectorAll(".prototype-pss-kpi").length).toBe(6);
    expect(result.queryByText("Vagas por cargo")).toBeNull();
    expect(result.queryByText("Processos em acompanhamento")).toBeNull();
    expect(result.queryByText("Indicadores exibidos")).toBeNull();
  });

  it("lista os processos seletivos sem qualquer ação de cadastro", () => {
    const result = render(<MemoryRouter initialEntries={["/prototipos/sigep/controle-pss/processos"]}><Routes><Route path="/prototipos/sigep/controle-pss/processos" element={<ProcessosSeletivosContent />} /></Routes></MemoryRouter>);
    expect(result.getByText("Processos controlados")).toBeTruthy();
    expect(result.getByText(/Selecione um processo na lista/)).toBeTruthy();
    expect(result.queryByText("Novo processo")).toBeNull();
    expect(result.queryByText("Criar nova versão")).toBeNull();
    expect(result.container.querySelectorAll(".prototype-pss-step").length).toBe(0);
  });

  it("exibe o stepper vertical do processo selecionado pela rota", () => {
    const result = render(<MemoryRouter initialEntries={["/prototipos/sigep/controle-pss/processos/PSS-2026-004"]}><Routes><Route path="/prototipos/sigep/controle-pss/processos/:id" element={<ProcessosSeletivosContent />} /></Routes></MemoryRouter>);
    expect(result.getAllByText("PSS 004/2026").length).toBeGreaterThan(0);
    expect(result.getAllByText("Fase 1 — Documental (Sigadoc)").length).toBeGreaterThan(0);
    expect(result.getAllByText("Fase 2 — Gestão do concurso (SIES)").length).toBeGreaterThan(0);
    expect(result.getAllByText("Fase 3 — Controle de pessoas (SIGEP)").length).toBeGreaterThan(0);
    expect(result.container.querySelectorAll(".prototype-pss-step").length).toBe(definicoesEtapasPss.length);
    expect(result.container.querySelector(".prototype-pss-step.bloqueada")).toBeTruthy();
    expect(result.getByText("Impedimentos")).toBeTruthy();
  });

  it("expande uma etapa do stepper e aponta para o novo destino do menu", () => {
    const result = render(<MemoryRouter initialEntries={["/prototipos/sigep/controle-pss/processos/PSS-2026-003"]}><Routes><Route path="/prototipos/sigep/controle-pss/processos/:id" element={<ProcessosSeletivosContent />} /></Routes></MemoryRouter>);
    const cabecalho = result.getByText("1. Justificativa técnica da necessidade").closest("button")!;
    expect(cabecalho.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(cabecalho);
    expect(cabecalho.getAttribute("aria-expanded")).toBe("true");
    expect(result.getAllByText(/Abrir Processos Seletivos/).length).toBeGreaterThan(0);
  });

  it("prioriza o painel por secretaria e mantém o alerta de divergência em Controle de Vagas", () => {
    const result = render(<MemoryRouter initialEntries={["/prototipos/sigep/controle-pss/vagas?divergencia=SIM"]}><ControleVagasPssContent /></MemoryRouter>);
    expect(result.getByText("Painel de vagas por secretaria")).toBeTruthy();
    expect(result.getAllByText("Temporários ocupando").length).toBeGreaterThan(0);
    expect(result.getAllByText("Vagas disponíveis").length).toBeGreaterThan(0);
    expect(result.getAllByText("Divergente").length).toBeGreaterThan(0);
    expect(result.container.querySelector(".prototype-pss-vaga-alert")).toBeTruthy();
  });

  it("mapeia a situação do processo para os três estados do status geral", () => {
    const mapeamento: Record<SituacaoProcessoPss, string> = { EM_ELABORACAO: "ABERTO", EM_ANDAMENTO: "EM_ANDAMENTO", SUSPENSO: "EM_ANDAMENTO", HOMOLOGADO: "FECHADO", ENCERRADO: "FECHADO" };
    (Object.keys(mapeamento) as SituacaoProcessoPss[]).forEach((situacao) => {
      expect(statusGeralDoProcesso(situacao)).toBe(mapeamento[situacao]);
    });
  });

  it("gera o registro de-para de um candidato com convocação estruturada no SIES", () => {
    const state = controlePssStore.getState();
    const candidato = state.candidatos.find((item) => item.id === "CPS-002-0002")!;
    const processo = state.processos.find((item) => item.id === candidato.processoId)!;
    const vaga = state.vagas.find((item) => item.processoId === candidato.processoId && item.cargo === candidato.cargo)!;
    const convocacao = { ...state.convocacoes.find((item) => item.candidatoIds.includes(candidato.id))!, formaGeracao: "AUTOMATICA" as const };
    const registro = gerarRegistroDePara(candidato, processo, vaga, convocacao);
    expect(registro.candidatoId).toBe(candidato.id);
    expect(registro.cpf).toBe(candidato.cpf);
    expect(registro.processoNumero).toBe(processo.numero);
    expect(registro.lotacaoPretendida).toBe(vaga.lotacaoPrevista);
    expect(registro.situacaoCarga).toBe("CARREGADO");
    expect(registro.contingenciaManual).toBe(false);
    expect(podeEfetivarIngresso(registro)).toBe(true);
    expect(camposDeParaPss).toHaveLength(5);
  });

  it("marca contingência manual quando a convocação de origem é gerada manualmente", () => {
    const state = controlePssStore.getState();
    const candidato = state.candidatos.find((item) => item.id === "CPS-002-0002")!;
    const processo = state.processos.find((item) => item.id === candidato.processoId)!;
    const vaga = state.vagas.find((item) => item.processoId === candidato.processoId && item.cargo === candidato.cargo)!;
    const convocacao = state.convocacoes.find((item) => item.candidatoIds.includes(candidato.id))!;
    const registro = gerarRegistroDePara(candidato, processo, vaga, convocacao);
    expect(convocacao.formaGeracao).toBe("MANUAL");
    expect(registro.situacaoCarga).toBe("PENDENTE_CONVOCACAO_SIES");
    expect(registro.contingenciaManual).toBe(true);
    expect(registro.statusConvocacaoSies).toBeUndefined();
    expect(podeEfetivarIngresso(registro)).toBe(false);
  });

  it("consolida as vagas por secretaria a partir dos ingressos efetivados", () => {
    const state = controlePssStore.getState();
    expect(state.registrosDePara.length).toBeGreaterThan(0);
    expect(state.ingressos.some((item) => item.situacao === "EFETIVADO")).toBe(true);
    expect(state.ingressos.some((item) => item.situacao === "BLOQUEADO")).toBe(true);
    const resumo = construirResumoPorSecretaria(state.vagas, state.ingressos, state.processos);
    const sema = resumo.find((item) => item.orgao === "SEMA")!;
    expect(sema.temporariosOcupando).toBe(2);
    expect(sema.totalVagas).toBe(sema.vagasImediatas + sema.cadastroReserva);
    expect(sema.vagasDisponiveis).toBe(sema.totalVagas - sema.temporariosOcupando);
    expect(sema.lotacoes.length).toBeGreaterThan(0);
  });

  it("apresenta as duas abas da Integração SIES com os quatro sistemas e a nota de pendências", () => {
    const result = render(<MemoryRouter><IntegracaoSiesContent /></MemoryRouter>);
    expect(result.container.querySelectorAll(".prototype-pss-tabs button").length).toBe(2);
    expect(result.getByText("SIES — Sistema de Gestão de Concursos")).toBeTruthy();
    expect(result.getByText("IOMAT — Imprensa Oficial do Estado de Mato Grosso")).toBeTruthy();
    expect(result.getByText("Diário Oficial do Estado")).toBeTruthy();
    expect(result.getByText("TCE-MT — Tribunal de Contas do Estado")).toBeTruthy();
    expect(result.queryByText("Matriz de etapas e integrações")).toBeNull();
    const nota = result.getByText("Pontos para validação com a área de negócio").closest("button")!;
    expect(nota.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(nota);
    expect(nota.getAttribute("aria-expanded")).toBe("true");
    expect(result.container.querySelectorAll(".prototype-pss-int-pending li").length).toBeGreaterThan(0);
  });

  it("executa a carga de dados do de-para e exibe o status de convocação como leitura", () => {
    const result = render(<MemoryRouter><IntegracaoSiesContent /></MemoryRouter>);
    fireEvent.click(result.container.querySelectorAll(".prototype-pss-tabs button")[1]);
    expect(result.getByText("Mapeamento de campos SIES ↔ SIGEP")).toBeTruthy();
    expect(result.getByText("CPF do servidor")).toBeTruthy();
    expect(result.getAllByText(/Convocação (pendente|gerada|publicada|encerrada)|Sem convocação no SIES/).length).toBeGreaterThan(0);
    expect(result.queryByTitle("Registrar publicação")).toBeNull();
    const antes = controlePssStore.getState().registrosDePara.length;
    fireEvent.click(result.getByText(/Executar carga de dados/));
    const depois = controlePssStore.getState().registrosDePara.length;
    expect(depois).toBeGreaterThan(antes);
    expect(result.getByText(/registro\(s\) de-para gerados/)).toBeTruthy();
    controlePssStore.set("registrosDePara", (atuais) => atuais.slice(0, antes));
  });

  it("abre a contingência manual quando o ingresso não pode ser efetivado", () => {
    const result = render(<MemoryRouter initialEntries={["/prototipos/sigep/controle-pss/integracao-sies?aba=DEPARA"]}><IntegracaoSiesContent /></MemoryRouter>);
    expect(result.getByText("Ingresso do Servidor")).toBeTruthy();
    const acoes = result.getAllByText("Efetivar ingresso").map((item) => item.closest("button")!).filter((item) => !item.disabled);
    fireEvent.click(acoes[0]);
    expect(result.getByText("Contingência manual — RN07")).toBeTruthy();
    fireEvent.click(result.getByText("Registrar contingência"));
    expect(result.getByText(/Informe a justificativa/)).toBeTruthy();
    const campo = result.container.querySelector(".prototype-pss-ingresso-justificativa") as HTMLTextAreaElement;
    fireEvent.change(campo, { target: { value: "Convocação publicada em Word, conferida pela comissão do certame." } });
    fireEvent.click(result.getByText("Registrar contingência"));
    expect(controlePssStore.getState().ingressos.some((item) => item.contingenciaManual)).toBe(true);
  });

  it("ativa o painel de especificação do desenvolvedor no Painel Geral", () => {
    const result = render(<MemoryRouter><PainelGeralPssContent /></MemoryRouter>);
    fireEvent.click(result.getByTitle("Visualização do desenvolvedor"));
    expect(result.getByLabelText("Especificação do componente")).toBeTruthy();
    fireEvent.click(result.getByTitle("Recolher painel"));
    expect(result.getByLabelText("Painel de visualização recolhido")).toBeTruthy();
  });
});
