import { describe, expect, it } from "vitest";
import { controleVagasStore } from "./controleVagasStore";
import { atribuirVagaAutomaticaAoIngresso, atualizarSituacaoReserva, regularizarVagaPendente } from "./integracaoIngressoVagas";

const base = controleVagasStore.getState();
const vagaLivre = base.vagas.find(vaga => vaga.tipo === "EFETIVO" && vaga.estado === "DISPONIVEL" && vaga.situacaoLegal === "REGULAR")!;
const quadro = base.quadros.find(item => item.id === vagaLivre.quadroAutorizadoId)!;
const dados = {
  chaveIngresso: "edital-1:candidato-1",
  ingressoId: "candidato-1",
  editalId: "edital-1",
  numeroEdital: "001/2026",
  processo: "PROC-ING-001",
    tipoProcesso: "Concurso",
  pessoaId: "PES-1",
  pessoaNome: "Pessoa de Teste",
  cargo: quadro.cargo,
  carreira: quadro.carreira,
  orgao: vagaLivre.orgaoTitular,
  vinculo: quadro.vinculo,
} as const;

describe("Integração de ingresso e vagas efetivas", () => {
  it("reserva automaticamente uma vaga regular e impede nova reserva para o mesmo ingresso", () => {
    const state = { ...base, quadros: [quadro], vagas: [vagaLivre], comprometimentos: [], ocupacoes: [] };
    const reserva = atribuirVagaAutomaticaAoIngresso(state, dados);
    expect(reserva.bloqueado).toBeUndefined();
    expect(reserva.state.vagas[0].estado).toBe("EM_OCUPACAO");
    expect(reserva.state.comprometimentos).toHaveLength(1);
    expect(atribuirVagaAutomaticaAoIngresso(reserva.state, dados).state.comprometimentos).toHaveLength(1);
  });

  it("bloqueia o ingresso somente quando não existe quadro compatível", () => {
    const resultado = atribuirVagaAutomaticaAoIngresso({ ...base, quadros: [], vagas: [], comprometimentos: [], ocupacoes: [] }, dados);
    expect(resultado.bloqueado).toContain("Quadro Autorizado");
  });

  it("reconhece Nomeado Efetivo como vínculo compatível com Servidor efetivo", () => {
    const resultado = atribuirVagaAutomaticaAoIngresso(
      { ...base, quadros: [quadro], vagas: [vagaLivre], comprometimentos: [], ocupacoes: [] },
      { ...dados, vinculo: "Nomeado Efetivo" },
    );
    expect(resultado.bloqueado).toBeUndefined();
    expect(resultado.vagaId).toBe(vagaLivre.id);
  });

  it("cria vaga pendente de distribuição sem bloquear quando o órgão ainda não recebeu vagas do quadro", () => {
    const state = { ...base, quadros: [{ ...quadro, autorizadas: 1 }], vagas: [], comprometimentos: [], ocupacoes: [] };
    const reserva = atribuirVagaAutomaticaAoIngresso(state, dados);
    expect(reserva.state.vagas[0].situacaoLastro).toBe("PENDENTE_DISTRIBUICAO");
    expect(reserva.state.vagas[0].estado).toBe("EM_OCUPACAO");
  });

  it("cria vaga pendente de ampliação quando o órgão já possui vagas distribuídas, mas nenhuma está disponível", () => {
    const state = { ...base, quadros: [{ ...quadro, autorizadas: 1 }], vagas: [{ ...vagaLivre, estado: "OCUPADA" as const }], comprometimentos: [], ocupacoes: [] };
    const reserva = atribuirVagaAutomaticaAoIngresso(state, dados);
    expect(reserva.state.vagas.at(-1)?.situacaoLastro).toBe("PENDENTE_AMPLIACAO");
  });

  it("regulariza a vaga pendente sem perder a reserva e o seu histórico", () => {
    const reservado = atribuirVagaAutomaticaAoIngresso({ ...base, quadros: [{ ...quadro, autorizadas: 0 }], vagas: [], comprometimentos: [], ocupacoes: [] }, dados);
    const regularizado = regularizarVagaPendente(reservado.state, reservado.vagaId!, {
      identificadorRegular: "VAG-REG-0001",
      processo: "PROC-AMP-001",
      motivo: "Ampliação do Quadro Autorizado.",
    });
    expect(regularizado.bloqueado).toBeUndefined();
    expect(regularizado.state.vagas[0]).toMatchObject({ provisoria: false, situacaoLastro: "REGULAR", identificadorRegular: "VAG-REG-0001", estado: "EM_OCUPACAO" });
    expect(regularizado.state.comprometimentos).toHaveLength(1);
    expect(regularizado.state.vagas[0].historico.at(-1)?.titulo).toBe("Vaga pendente regularizada");
  });

  it("conclui ou cancela a reserva sem duplicar ocupações", () => {
    const inicial = atribuirVagaAutomaticaAoIngresso({ ...base, quadros: [quadro], vagas: [vagaLivre], comprometimentos: [], ocupacoes: [] }, dados);
    const concluido = atualizarSituacaoReserva(inicial.state, dados.chaveIngresso, "Ingresso Concluído");
    expect(concluido.state.vagas[0].estado).toBe("OCUPADA");
    expect(concluido.state.ocupacoes).toHaveLength(1);
    expect(atualizarSituacaoReserva(concluido.state, dados.chaveIngresso, "Ingresso Concluído").state.ocupacoes).toHaveLength(1);

    const reservado = atribuirVagaAutomaticaAoIngresso({ ...base, quadros: [quadro], vagas: [vagaLivre], comprometimentos: [], ocupacoes: [] }, { ...dados, chaveIngresso: "edital-1:candidato-2", ingressoId: "candidato-2", tipoProcesso: "Processo Seletivo" });
    const cancelado = atualizarSituacaoReserva(reservado.state, "edital-1:candidato-2", "Posse Negada");
    expect(cancelado.state.vagas[0].estado).toBe("DISPONIVEL");
    expect(cancelado.state.ocupacoes).toHaveLength(0);
  });

  it("não aceita ingresso cancelado para concurso", () => {
    const reservado = atribuirVagaAutomaticaAoIngresso({ ...base, quadros: [quadro], vagas: [vagaLivre], comprometimentos: [], ocupacoes: [] }, dados);
    expect(atualizarSituacaoReserva(reservado.state, dados.chaveIngresso, "Ingresso Cancelado").bloqueado).toContain("Processo Seletivo");
  });

  it.each(["Posse Negada", "Tornado sem efeito", "Exoneração de oficio", "Encerrado por desistência"] as const)("libera a vaga quando o ingresso termina por %s", (situacao) => {
    const reservado = atribuirVagaAutomaticaAoIngresso({ ...base, quadros: [quadro], vagas: [vagaLivre], comprometimentos: [], ocupacoes: [] }, dados);
    const encerrado = atualizarSituacaoReserva(reservado.state, dados.chaveIngresso, situacao);
    expect(encerrado.bloqueado).toBeUndefined();
    expect(encerrado.state.vagas[0].estado).toBe("DISPONIVEL");
    expect(encerrado.state.comprometimentos[0].situacao).toBe("CANCELADO");
  });
});
