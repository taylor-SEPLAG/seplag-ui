import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { NumberFieldSeplag } from "../Fields/NumberField";
import { TabelaEditavelSeplag } from "./index";

interface Orgao {
  id: number;
  nome: string;
  disponiveis: number;
}

const ORGAOS: Orgao[] = [
  { id: 1, nome: "SEMA", disponiveis: 2 },
  { id: 2, nome: "SEPLAG", disponiveis: 2 },
  { id: 3, nome: "SEFAZ", disponiveis: 1 },
];

describe("TabelaEditavelSeplag — estrutura", () => {
  it("renderiza uma tabela semântica com cabeçalhos de coluna", () => {
    render(
      <TabelaEditavelSeplag
        id="t"
        items={ORGAOS}
        getKey={(o) => o.id}
        ariaLabel="Distribuição por órgão"
        columns={[
          { id: "orgao", header: "Órgão", field: "nome" },
          { id: "disponiveis", header: "Disponíveis", field: "disponiveis", align: "right" },
        ]}
      />,
    );

    const tabela = screen.getByRole("table", { name: "Distribuição por órgão" });
    expect(within(tabela).getAllByRole("columnheader")).toHaveLength(2);
    expect(within(tabela).getAllByRole("row")).toHaveLength(4); // 1 cabeçalho + 3 linhas
  });

  it("lê o valor por field quando não há body", () => {
    render(
      <TabelaEditavelSeplag
        id="t"
        items={ORGAOS}
        getKey={(o) => o.id}
        columns={[{ id: "orgao", header: "Órgão", field: "nome" }]}
      />,
    );

    expect(screen.getByTestId("t-cell-1-orgao").textContent).toBe("SEMA");
    expect(screen.getByTestId("t-cell-3-orgao").textContent).toBe("SEFAZ");
  });

  it("body tem precedência sobre field", () => {
    render(
      <TabelaEditavelSeplag
        id="t"
        items={ORGAOS}
        getKey={(o) => o.id}
        columns={[{ id: "orgao", header: "Órgão", field: "nome", body: (o) => `[${o.nome}]` }]}
      />,
    );

    expect(screen.getByTestId("t-cell-1-orgao").textContent).toBe("[SEMA]");
  });

  it("exibe a mensagem de vazio ocupando todas as colunas", () => {
    render(
      <TabelaEditavelSeplag
        id="t"
        items={[]}
        getKey={(o: Orgao) => o.id}
        emptyMessage="Nada por aqui."
        columns={[
          { id: "orgao", header: "Órgão" },
          { id: "disponiveis", header: "Disponíveis" },
        ]}
      />,
    );

    const celulaVazia = screen.getByTestId("t-vazio");
    expect(celulaVazia.textContent).toBe("Nada por aqui.");
    expect(celulaVazia.getAttribute("colspan")).toBe("2");
  });

  it("aplica classe por linha via rowClassName", () => {
    render(
      <TabelaEditavelSeplag
        id="t"
        items={ORGAOS}
        getKey={(o) => o.id}
        rowClassName={(o) => (o.id === 2 ? "travada" : undefined)}
        columns={[{ id: "orgao", header: "Órgão", field: "nome" }]}
      />,
    );

    expect(screen.getByTestId("t-row-2").className).toBe("travada");
    expect(screen.getByTestId("t-row-1").className).toBe("");
  });
});

describe("TabelaEditavelSeplag — rodapé", () => {
  it("não renderiza tfoot quando nenhuma coluna declara footer", () => {
    render(
      <TabelaEditavelSeplag
        id="t"
        items={ORGAOS}
        getKey={(o) => o.id}
        columns={[{ id: "orgao", header: "Órgão", field: "nome" }]}
      />,
    );

    expect(screen.queryByTestId("t-footer")).toBeNull();
  });

  it("basta uma coluna declarar footer para o rodapé existir", () => {
    render(
      <TabelaEditavelSeplag
        id="t"
        items={ORGAOS}
        getKey={(o) => o.id}
        columns={[
          { id: "orgao", header: "Órgão", field: "nome" },
          {
            id: "disponiveis",
            header: "Disponíveis",
            field: "disponiveis",
            footer: (itens) => itens.reduce((soma, o) => soma + o.disponiveis, 0),
          },
        ]}
      />,
    );

    expect(screen.getByTestId("t-footer")).not.toBeNull();
    expect(screen.getByTestId("t-footer-orgao").textContent).toBe("");
    expect(screen.getByTestId("t-footer-disponiveis").textContent).toBe("5");
  });

  it("aceita footer como ReactNode, não só função", () => {
    render(
      <TabelaEditavelSeplag
        id="t"
        items={ORGAOS}
        getKey={(o) => o.id}
        columns={[{ id: "orgao", header: "Órgão", field: "nome", footer: <strong>Total</strong> }]}
      />,
    );

    expect(screen.getByTestId("t-footer-orgao").textContent).toBe("Total");
  });
});

describe("TabelaEditavelSeplag — disabled", () => {
  it("chega ao body pelo terceiro argumento em vez de ser aplicado sozinho", () => {
    const body = vi.fn(() => null);

    render(
      <TabelaEditavelSeplag
        id="t"
        items={[ORGAOS[0]]}
        getKey={(o) => o.id}
        disabled
        columns={[{ id: "qtd", header: "Qtd", body }]}
      />,
    );

    expect(body).toHaveBeenCalledWith(ORGAOS[0], 0, { disabled: true });
  });

  it("é false por padrão", () => {
    const body = vi.fn(() => null);

    render(
      <TabelaEditavelSeplag
        id="t"
        items={[ORGAOS[0]]}
        getKey={(o) => o.id}
        columns={[{ id: "qtd", header: "Qtd", body }]}
      />,
    );

    expect(body).toHaveBeenCalledWith(ORGAOS[0], 0, { disabled: false });
  });
});

describe("TabelaEditavelSeplag — integração com react-hook-form", () => {
  function Harness({
    bloqueado,
    onSubmit,
  }: {
    readonly bloqueado?: boolean;
    readonly onSubmit: (dados: { itens: { reduzir: number }[] }) => void;
  }) {
    const { control, handleSubmit } = useForm({
      defaultValues: { itens: ORGAOS.map(() => ({ reduzir: 0 })) },
    });

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <TabelaEditavelSeplag
          id="reducao"
          items={ORGAOS}
          getKey={(o) => o.id}
          disabled={bloqueado}
          columns={[
            { id: "orgao", header: "Órgão", field: "nome" },
            { id: "disponiveis", header: "Disponíveis", field: "disponiveis", align: "right" },
            {
              id: "reduzir",
              header: "Quantidade a reduzir",
              width: "10rem",
              body: (orgao, indice, { disabled }) => (
                <NumberFieldSeplag
                  name={`itens.${indice}.reduzir`}
                  control={control}
                  semMoldura
                  disabled={disabled}
                  min={0}
                  max={orgao.disponiveis}
                />
              ),
            },
          ]}
        />
        <button type="submit">enviar</button>
      </form>
    );
  }

  it("os campos das células entram no payload do formulário", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<Harness onSubmit={onSubmit} />);

    await user.clear(screen.getByTestId("itens.0.reduzir"));
    await user.type(screen.getByTestId("itens.0.reduzir"), "2");
    await user.click(screen.getByRole("button", { name: "enviar" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].itens).toEqual([
      { reduzir: 2 },
      { reduzir: 0 },
      { reduzir: 0 },
    ]);
  });

  it("o disabled da tabela desabilita os campos que o body repassou", () => {
    render(<Harness bloqueado onSubmit={vi.fn()} />);

    expect(screen.getByTestId("itens.0.reduzir")).toBeDisabled();
    expect(screen.getByTestId("itens.1.reduzir")).toBeDisabled();
  });

  it("sem disabled os campos ficam editáveis", () => {
    render(<Harness onSubmit={vi.fn()} />);

    expect(screen.getByTestId("itens.0.reduzir")).not.toBeDisabled();
  });
});
