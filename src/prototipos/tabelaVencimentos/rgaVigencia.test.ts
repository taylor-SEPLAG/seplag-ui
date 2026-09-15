import { describe, expect, it } from "vitest";
import {
  isRgaVigenciaWithinTable,
  RGA_VIGENCIA_FORA_TABELA,
} from "./rgaVigencia";

describe("vigência do RGA", () => {
  it("aceita uma vigência contida no período da tabela", () => {
    expect(
      isRgaVigenciaWithinTable(
        "2026-01-01",
        "2026-12-31",
        "2026-01-01",
        "2026-12-31",
      ),
    ).toBe(true);
  });

  it("rejeita períodos sem interseção com a tabela", () => {
    expect(
      isRgaVigenciaWithinTable(
        "2026-01-01",
        "2026-12-31",
        "2025-12-31",
        undefined,
      ),
    ).toBe(false);
    expect(
      isRgaVigenciaWithinTable(
        "2026-01-01",
        "2026-12-31",
        "2027-01-01",
        undefined,
      ),
    ).toBe(false);
  });

  it("rejeita fim anterior ao início ou posterior ao limite da tabela", () => {
    expect(
      isRgaVigenciaWithinTable(
        "2026-01-01",
        "2026-12-31",
        "2026-06-01",
        "2026-05-31",
      ),
    ).toBe(false);
    expect(
      isRgaVigenciaWithinTable(
        "2026-01-01",
        "2026-12-31",
        "2026-06-01",
        "2027-01-01",
      ),
    ).toBe(false);
  });

  it("mantém a mensagem de validação definida", () => {
    expect(RGA_VIGENCIA_FORA_TABELA).toBe(
      "A vigência do RGA deve estar contida no período de vigência da Tabela de Vencimentos.",
    );
  });
});