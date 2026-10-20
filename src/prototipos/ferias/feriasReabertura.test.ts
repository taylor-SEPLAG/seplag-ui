import { afterEach, describe, expect, it, vi } from "vitest";
import {
  podeCancelar,
  cancelarBloqueadoPelaFolha,
  podeSuspender,
  podeReativar,
  reativarBloqueadaPelaFolha,
} from "./regrasReabertura";
import type { FeriasRegistro } from "./FeriasPages";

afterEach(() => {
  vi.useRealTimers();
});

function registro(parcial: Partial<FeriasRegistro>): FeriasRegistro {
  return {
    id: 1,
    servidorNome: "Servidor Teste",
    matricula: "000001",
    cpf: "",
    orgao: "SEPLAG/MT",
    orgaoColetivo: "OUTRO",
    setor: "Setor Teste",
    cargo: "Cargo Teste",
    cargoGestao: false,
    tipoVinculo: "Efetivo",
    tipo: "Individual",
    origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "2026-01-01",
    periodoAquisitivoFim: "2026-12-31",
    parcelas: [{ id: 1, inicio: "2026-11-01", fim: "2026-11-15", dias: 15 }],
    situacao: "EM ABERTO",
    substitutos: [],
    responsavelLancamento: "RH Setorial",
    lancadoEm: "2026-09-01 09:00",
    ...parcial,
  };
}

describe("Cancelamento (RN 1)", () => {
  it("permite cancelar quando hoje é anterior ao início do usufruto e a folha não foi homologada", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 1, 12));
    expect(podeCancelar(registro({ situacao: "EM ABERTO" }))).toBe(true);
  });

  it("permite cancelar também durante o usufruto (hoje entre início e fim)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 5, 12));
    expect(podeCancelar(registro({ situacao: "EM ABERTO" }))).toBe(true);
  });

  it("bloqueia cancelar quando o usufruto já terminou", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 20, 12));
    expect(podeCancelar(registro({ situacao: "EM ABERTO" }))).toBe(false);
  });

  it("bloqueia cancelar quando a folha já foi homologada/paga, mesmo antes do início", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 1, 12));
    const registroComFolha = registro({ situacao: "EM ABERTO", folhaHomologada: true });
    expect(podeCancelar(registroComFolha)).toBe(false);
    expect(cancelarBloqueadoPelaFolha(registroComFolha)).toBe(true);
  });

  it("não sinaliza bloqueio por folha quando o motivo real é a data (usufruto já terminou)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 20, 12));
    const registroComFolha = registro({ situacao: "EM ABERTO", folhaHomologada: true });
    expect(cancelarBloqueadoPelaFolha(registroComFolha)).toBe(false);
  });

  it("não oferece cancelar para registros fora de Em Aberto", () => {
    expect(podeCancelar(registro({ situacao: "SUSPENSO" }))).toBe(false);
    expect(podeCancelar(registro({ situacao: "AGUARDANDO VALIDAÇÃO" }))).toBe(false);
  });
});

describe("Suspensão (RN 2)", () => {
  it("permite suspender antes ou durante o usufruto, enquanto Em Aberto e sem folha homologada", () => {
    expect(podeSuspender(registro({ situacao: "EM ABERTO" }))).toBe(true);
  });

  it("bloqueia suspender quando a folha já foi homologada/paga", () => {
    expect(podeSuspender(registro({ situacao: "EM ABERTO", folhaHomologada: true }))).toBe(false);
  });

  it("não permite suspender fora de Em Aberto", () => {
    expect(podeSuspender(registro({ situacao: "SUSPENSO" }))).toBe(false);
    expect(podeSuspender(registro({ situacao: "CANCELADO" }))).toBe(false);
  });
});

describe("Reabertura-padrão (RN 3.1 / 3.3)", () => {
  it("permite reabrir um registro Suspenso ou Cancelado antes do início original, sem folha homologada", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 1, 12));
    expect(podeReativar(registro({ situacao: "SUSPENSO" }))).toBe(true);
    expect(podeReativar(registro({ situacao: "CANCELADO" }))).toBe(true);
  });

  it("bloqueia a reabertura assim que a data de início original chega", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 1, 12));
    expect(podeReativar(registro({ situacao: "SUSPENSO" }))).toBe(false);
  });

  it("bloqueia a reabertura direta quando a folha já foi homologada/paga, mesmo antes do início", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 1, 12));
    const registroComFolha = registro({ situacao: "SUSPENSO", folhaHomologada: true });
    expect(podeReativar(registroComFolha)).toBe(false);
    expect(reativarBloqueadaPelaFolha(registroComFolha)).toBe(true);
  });

  it("não sinaliza bloqueio por folha quando o motivo real é a data (usufruto já iniciado)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 5, 12));
    const registroComFolha = registro({ situacao: "SUSPENSO", folhaHomologada: true });
    expect(reativarBloqueadaPelaFolha(registroComFolha)).toBe(false);
  });

  it("não oferece reabertura para registros Em Aberto ou Quitado", () => {
    expect(podeReativar(registro({ situacao: "EM ABERTO" }))).toBe(false);
    expect(podeReativar(registro({ situacao: "QUITADO" }))).toBe(false);
  });
});
