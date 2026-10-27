import { afterEach, describe, expect, it, vi } from "vitest";
import {
  podeCancelar,
  cancelarBloqueadoPelaFolha,
  podeSuspender,
  elegivelParaQuitacaoAutomatica,
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

describe("Quitação automática", () => {
  afterEach(() => vi.useRealTimers());

  it("fica elegível quando Em Aberto e hoje é posterior ao fim de todas as parcelas", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 20, 12));
    expect(elegivelParaQuitacaoAutomatica(registro({ situacao: "EM ABERTO" }))).toBe(true);
  });

  it("não quita enquanto o usufruto não terminou", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 5, 12));
    expect(elegivelParaQuitacaoAutomatica(registro({ situacao: "EM ABERTO" }))).toBe(false);
  });

  it("não se aplica a situações diferentes de Em Aberto", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 20, 12));
    expect(elegivelParaQuitacaoAutomatica(registro({ situacao: "SUSPENSO" }))).toBe(false);
    expect(elegivelParaQuitacaoAutomatica(registro({ situacao: "AGUARDANDO VALIDAÇÃO" }))).toBe(false);
  });

  it("não é bloqueada pela folha homologada/paga — só o cancelamento é", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 20, 12));
    expect(elegivelParaQuitacaoAutomatica(registro({ situacao: "EM ABERTO", folhaHomologada: true }))).toBe(true);
  });
});
