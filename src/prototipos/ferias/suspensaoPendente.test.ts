import { afterEach, describe, expect, it, vi } from "vitest";
import { elegivelParaQuitacaoAutomatica, podeSuspender } from "./regrasReabertura";
import { CHAVE_FLUXO_SUSPENSAO_ART17, FLUXOS_PADRAO, iniciarProcesso, obterFluxo } from "./fluxoAprovacao";
import { registrosBase } from "./feriasMockDados";
import type { FeriasRegistro } from "./FeriasPages";

afterEach(() => vi.useRealTimers());

function registroComPendencia(): FeriasRegistro {
  const base = registrosBase.find((r) => r.situacao === "EM ABERTO")!;
  return {
    ...base,
    parcelas: [{ id: 1, inicio: "2026-11-01", fim: "2026-11-30", dias: 30 }],
    folhaHomologada: false,
    suspensaoPendente: {
      dados: { fundamento: "ART_17", causa: "Convocação", prazoEstimadoDias: 10, suspensaoInicio: "2026-11-05", suspensaoFim: "2026-11-14" },
      processo: iniciarProcesso(obterFluxo(FLUXOS_PADRAO, CHAVE_FLUXO_SUSPENSAO_ART17), "x")!,
      solicitadoPor: "Gestor",
      solicitadoEm: "04/11/2026",
    },
  };
}

describe("RN-FLX-09 — agendamento preservado até a aprovação", () => {
  it("não quita automaticamente enquanto a suspensão aguarda validação", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 5, 12)); // após o fim original (30/11)
    const pendente = registroComPendencia();
    expect(elegivelParaQuitacaoAutomatica(pendente)).toBe(false);
    expect(elegivelParaQuitacaoAutomatica({ ...pendente, suspensaoPendente: undefined })).toBe(true);
  });

  it("não permite abrir outra suspensão sobre uma pendente", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 5, 12));
    const pendente = registroComPendencia();
    expect(podeSuspender(pendente)).toBe(false);
    expect(podeSuspender({ ...pendente, suspensaoPendente: undefined })).toBe(true);
  });
});
