// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinhaDoTempoSeplag } from ".";

describe("LinhaDoTempoSeplag", () => {
  it("renderiza os itens na ordem recebida com seus conteudos", () => {
    render(
      <LinhaDoTempoSeplag
        titulo="Linha do tempo"
        itens={[
          {
            id: 1,
            titulo: "Registro importado",
            data: "24/06/2026 08:41",
            dataIso: "2026-06-24T08:41:00",
            descricao: "Status: importado",
            metadados: "Usuario 302478",
            variante: "info",
            icone: "pi pi-download",
          },
          {
            id: 2,
            titulo: "Registro validado",
            variante: "success",
          },
        ]}
      />,
    );

    const itens = screen.getAllByRole("listitem");
    expect(itens).toHaveLength(2);
    expect(itens[0].textContent).toContain("Registro importado");
    expect(itens[1].textContent).toContain("Registro validado");
    expect(screen.getByText("24/06/2026 08:41").getAttribute("datetime")).toBe(
      "2026-06-24T08:41:00",
    );
    expect(screen.getByText("Status: importado")).toBeTruthy();
    expect(screen.getByText("Usuario 302478")).toBeTruthy();
  });

  it("renderiza a mensagem configurada quando nao ha itens", () => {
    render(<LinhaDoTempoSeplag itens={[]} mensagemVazia="Ainda nao existem ocorrencias." />);

    expect(screen.getByRole("status").textContent).toContain("Ainda nao existem ocorrencias.");
  });

  it("permite identificar a linha do tempo com um rotulo acessivel", () => {
    render(
      <LinhaDoTempoSeplag
        ariaLabel="Historico do registro"
        itens={[{ id: "evento", titulo: "Evento" }]}
      />,
    );

    expect(screen.getByRole("region", { name: "Historico do registro" })).toBeTruthy();
  });
});
