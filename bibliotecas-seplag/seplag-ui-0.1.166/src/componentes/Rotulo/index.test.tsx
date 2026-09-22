import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RotuloSeplag from "./index";

describe("RotuloSeplag", () => {
  it("envolve o campo em moldura com classe de grid e rótulo por padrão", () => {
    const { container } = render(
      <RotuloSeplag nome="Quantidade" cols="12 6" htmlFor="qtd">
        <input id="qtd" />
      </RotuloSeplag>,
    );

    expect(container.querySelector(".col-12.md\\:col-6")).not.toBeNull();
    expect(container.querySelector(".content-rotulo")).not.toBeNull();
    expect(screen.getByText("Quantidade")).not.toBeNull();
  });

  it("com semMoldura devolve apenas o campo, sem grid e sem rótulo", () => {
    const { container } = render(
      <RotuloSeplag nome="Quantidade" cols="12 6" htmlFor="qtd" semMoldura>
        <input id="qtd" />
      </RotuloSeplag>,
    );

    // Nenhum wrapper: o <input> é o único elemento renderizado.
    expect(container.firstElementChild?.tagName).toBe("INPUT");
    expect(container.querySelector("[class*='col-']")).toBeNull();
    expect(container.querySelector(".content-rotulo")).toBeNull();
    expect(screen.queryByText("Quantidade")).toBeNull();
  });

  it("semMoldura não anula hidden", () => {
    const { container } = render(
      <RotuloSeplag nome="Quantidade" hidden semMoldura>
        <input id="qtd" />
      </RotuloSeplag>,
    );

    expect(container.firstElementChild).toBeNull();
  });
});
