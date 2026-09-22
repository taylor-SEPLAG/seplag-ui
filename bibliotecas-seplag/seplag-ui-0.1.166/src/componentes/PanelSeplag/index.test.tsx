import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PanelSeplag } from "./index";

describe("PanelSeplag — comportamento existente", () => {
  it("mantém padding no contêiner e cabeçalho sem fundo no modo padrão", () => {
    render(
      <PanelSeplag id="dados" title="Dados pessoais" description="Identificação">
        <p>conteúdo</p>
      </PanelSeplag>,
    );

    const container = screen.getByTestId("dados").firstElementChild;
    expect(container?.className).toContain("p-2");
    expect(container?.className).toContain("gap-2");

    const header = screen.getByTestId("dados-header");
    expect(header.className).not.toContain("surface-50");
    expect(header.className).not.toContain("border-bottom-1");
  });

  it("não renderiza cabeçalho quando não há title, description, icon nem trailing", () => {
    render(
      <PanelSeplag id="vazio">
        <p>conteúdo</p>
      </PanelSeplag>,
    );

    expect(screen.queryByTestId("vazio-header")).toBeNull();
  });

  it("mantém aria-label quando não há rótulo visível", () => {
    render(
      <PanelSeplag id="sem-titulo" ariaLabel="Seção sem título">
        <p>conteúdo</p>
      </PanelSeplag>,
    );

    expect(screen.getByTestId("sem-titulo").getAttribute("aria-label")).toBe("Seção sem título");
  });

  it("dispensa aria-label quando o título já rotula a seção", () => {
    render(<PanelSeplag id="com-titulo" title="Endereço" />);

    expect(screen.getByTestId("com-titulo").getAttribute("aria-label")).toBeNull();
  });
});

describe("PanelSeplag — trailing", () => {
  it("renderiza o conteúdo à direita, empurrado por ml-auto", () => {
    render(<PanelSeplag id="p" title="Redução" trailing={<span>0 vaga(s)</span>} />);

    const trailing = screen.getByTestId("p-trailing");
    expect(trailing.className).toContain("ml-auto");
    expect(trailing.textContent).toBe("0 vaga(s)");
  });

  it("sozinho já faz o cabeçalho existir", () => {
    render(<PanelSeplag id="p" trailing={<span>contador</span>} />);

    expect(screen.getByTestId("p-header")).not.toBeNull();
  });

  it("sozinho não é rótulo visível: o aria-label é preservado", () => {
    render(<PanelSeplag id="p" ariaLabel="Painel" trailing={<span>contador</span>} />);

    expect(screen.getByTestId("p").getAttribute("aria-label")).toBe("Painel");
  });
});

describe("PanelSeplag — headerVariant filled", () => {
  it("tira o padding do contêiner e passa para cabeçalho e conteúdo", () => {
    render(
      <PanelSeplag id="p" title="Redução" headerVariant="filled">
        <p>tabela</p>
      </PanelSeplag>,
    );

    const container = screen.getByTestId("p").firstElementChild;
    expect(container?.className).not.toContain("p-2");
    expect(container?.className).toContain("overflow-hidden");

    expect(screen.getByTestId("p-header").className).toContain("p-3");
    expect(screen.getByTestId("p-content").className).toContain("p-3");
  });

  it("desenha a faixa tintada com a linha divisória", () => {
    render(<PanelSeplag id="p" title="Redução" headerVariant="filled" />);

    const header = screen.getByTestId("p-header");
    expect(header.className).toContain("surface-50");
    expect(header.className).toContain("border-bottom-1");
  });

  it("sem cabeçalho, volta ao contêiner com padding", () => {
    render(
      <PanelSeplag id="p" headerVariant="filled">
        <p>só conteúdo</p>
      </PanelSeplag>,
    );

    const container = screen.getByTestId("p").firstElementChild;
    expect(container?.className).toContain("p-2");
    expect(screen.getByTestId("p-content").className).toBe("");
  });
});
