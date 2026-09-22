// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarraProporcionalSeplag } from ".";

describe("BarraProporcionalSeplag", () => {
  it("representa os valores recebidos de forma proporcional", () => {
    const { container } = render(
      <BarraProporcionalSeplag
        ariaLabel="Distribuição do processamento"
        segmentos={[
          { id: "sucesso", valor: 75, cor: "#16a34a" },
          { id: "erro", valor: 25, cor: "#dc2626" },
        ]}
      />,
    );

    const segmentos = container.querySelectorAll<HTMLElement>("[data-barra-segmento]");
    expect(segmentos).toHaveLength(2);
    expect(segmentos[0]).toHaveStyle({ width: "75%", backgroundColor: "#16a34a" });
    expect(segmentos[1]).toHaveStyle({ width: "25%", backgroundColor: "#dc2626" });
    expect(screen.getByRole("img", { name: "Distribuição do processamento" })).toBeInTheDocument();
  });

  it("usa o total informado como base e preserva a parcela sem segmento", () => {
    const { container } = render(
      <BarraProporcionalSeplag
        total={200}
        segmentos={[{ id: "processado", valor: 50, cor: "rgb(37, 99, 235)" }]}
      />,
    );

    expect(container.querySelector<HTMLElement>("[data-barra-segmento]")).toHaveStyle({
      width: "25%",
    });
  });

  it("ignora valores inválidos sem aplicar regras de negócio", () => {
    const { container } = render(
      <BarraProporcionalSeplag
        segmentos={[
          { id: "negativo", valor: -10, cor: "#dc2626" },
          { id: "invalido", valor: Number.NaN, cor: "#64748b" },
        ]}
      />,
    );

    expect(container.querySelectorAll("[data-barra-segmento]")).toHaveLength(0);
  });
});
