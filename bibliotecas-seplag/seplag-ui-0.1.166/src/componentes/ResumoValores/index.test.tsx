import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SEPLAG_ERROR_TEXT, SEPLAG_INFO_TEXT } from "../../tokens/colors";
import { ResumoValoresSeplag } from "./index";

describe("ResumoValoresSeplag", () => {
  it("renderiza rótulo e valor de cada item", () => {
    render(
      <ResumoValoresSeplag
        id="distribuicao"
        itens={[
          { id: "distribuidas", rotulo: "Já distribuídas", valor: "5 vagas" },
          { id: "pendentes", rotulo: "Pendente de distribuição", valor: "25 vagas" },
        ]}
      />,
    );

    expect(screen.getByText("Já distribuídas")).not.toBeNull();
    expect(screen.getByText("5 vagas")).not.toBeNull();
    expect(screen.getByTestId("distribuicao-pendentes").textContent).toBe(
      "Pendente de distribuição25 vagas",
    );
  });

  it("omite o rótulo quando não informado", () => {
    render(
      <ResumoValoresSeplag
        id="selecao"
        itens={[{ id: "sel", valor: "0 vaga(s) selecionada(s)" }]}
      />,
    );

    expect(screen.getByTestId("selecao-sel").textContent).toBe("0 vaga(s) selecionada(s)");
  });

  it("aplica a cor do token correspondente à severidade", () => {
    render(
      <ResumoValoresSeplag
        itens={[
          { id: "a", valor: "10" },
          { id: "b", valor: "-3", severidade: "erro" },
        ]}
      />,
    );

    expect(screen.getByText("10")).toHaveStyle({ color: SEPLAG_INFO_TEXT });
    expect(screen.getByText("-3")).toHaveStyle({ color: SEPLAG_ERROR_TEXT });
  });

  it("não renderiza nada com lista vazia", () => {
    const { container } = render(<ResumoValoresSeplag itens={[]} />);

    expect(container.firstElementChild).toBeNull();
  });

  it("expõe um grupo nomeado para leitores de tela", () => {
    render(
      <ResumoValoresSeplag ariaLabel="Saldo da distribuição" itens={[{ id: "a", valor: "10" }]} />,
    );

    expect(screen.getByRole("group", { name: "Saldo da distribuição" })).not.toBeNull();
  });
});
