import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFieldArray, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { BotaoIconSeplag } from "../Botao";
import { NumberFieldSeplag } from "../Fields/NumberField";
import { TabelaEditavelSeplag } from "./index";

/**
 * Verifica que "adicionar e remover linhas, com a ação só nas linhas novas" é obtido por
 * composição, sem nenhuma prop nova na TabelaEditavelSeplag: as linhas são o `items`, e a
 * coluna de ação é um `body` que devolve `null` nas linhas travadas.
 */

interface Linha {
  orgaoId: number | null;
  atual: number;
  adicionar: number;
  travada: boolean;
}

const LINHAS_PERSISTIDAS: Linha[] = [
  { orgaoId: 3, atual: 1, adicionar: 0, travada: true },
  { orgaoId: 1, atual: 2, adicionar: 0, travada: true },
  { orgaoId: 2, atual: 2, adicionar: 0, travada: true },
];

function Harness({ onSubmit }: { readonly onSubmit: (dados: { linhas: Linha[] }) => void }) {
  const { control, handleSubmit } = useForm<{ linhas: Linha[] }>({
    defaultValues: { linhas: LINHAS_PERSISTIDAS },
  });
  // `fields[].id` é a chave estável que o getKey precisa: linhas novas não têm id de servidor.
  const { fields, append, remove } = useFieldArray({ control, name: "linhas" });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <button
        type="button"
        onClick={() => append({ orgaoId: null, atual: 0, adicionar: 1, travada: false })}
      >
        Adicionar destinação
      </button>

      <TabelaEditavelSeplag
        id="dest"
        items={fields}
        getKey={(linha) => linha.id}
        columns={[
          {
            id: "orgao",
            header: "Órgão",
            body: (linha) => <span>{linha.orgaoId ?? "Selecione"}</span>,
          },
          { id: "atual", header: "Quantidade atual", field: "atual", align: "right" },
          {
            id: "adicionar",
            header: "A adicionar",
            align: "right",
            body: (_linha, indice) => (
              <NumberFieldSeplag
                name={`linhas.${indice}.adicionar`}
                control={control}
                semMoldura
                min={0}
              />
            ),
          },
          {
            id: "acoes",
            header: "Ações",
            width: "5rem",
            align: "center",
            // A regra inteira do requisito 3 mora aqui.
            body: (linha, indice) =>
              linha.travada ? null : (
                <BotaoIconSeplag
                  icon="pi pi-trash"
                  aria-label={`Remover linha ${indice + 1}`}
                  onClick={() => remove(indice)}
                />
              ),
          },
        ]}
      />
      <button type="submit">enviar</button>
    </form>
  );
}

const contarLinhas = () => screen.getAllByRole("row").length - 1; // desconta o cabeçalho
const contarLixeiras = () => screen.queryAllByRole("button", { name: /Remover linha/ }).length;

describe("TabelaEditavelSeplag — linhas dinâmicas por composição", () => {
  it("começa só com as linhas persistidas e nenhuma lixeira", () => {
    render(<Harness onSubmit={vi.fn()} />);

    expect(contarLinhas()).toBe(3);
    expect(contarLixeiras()).toBe(0);
  });

  it("cada clique no botão acrescenta uma linha ao final", async () => {
    const user = userEvent.setup();
    render(<Harness onSubmit={vi.fn()} />);

    const adicionar = screen.getByRole("button", { name: "Adicionar destinação" });
    await user.click(adicionar);
    expect(contarLinhas()).toBe(4);

    await user.click(adicionar);
    await user.click(adicionar);
    expect(contarLinhas()).toBe(6);
  });

  it("a lixeira aparece apenas nas linhas novas", async () => {
    const user = userEvent.setup();
    render(<Harness onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Adicionar destinação" }));
    await user.click(screen.getByRole("button", { name: "Adicionar destinação" }));

    expect(contarLinhas()).toBe(5);
    expect(contarLixeiras()).toBe(2);
  });

  it("remover uma linha nova não embaralha os valores das demais", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    const adicionar = screen.getByRole("button", { name: "Adicionar destinação" });
    await user.click(adicionar);
    await user.click(adicionar);

    // Marca as duas linhas novas com valores distintos.
    const campoA = screen.getByTestId("linhas.3.adicionar");
    const campoB = screen.getByTestId("linhas.4.adicionar");
    await user.clear(campoA);
    await user.type(campoA, "7");
    await user.clear(campoB);
    await user.type(campoB, "9");

    // Remove a primeira das novas: a que sobra tem de manter o 9, não herdar o 7.
    await user.click(screen.getAllByRole("button", { name: /Remover linha/ })[0]);

    expect(contarLinhas()).toBe(4);
    expect(screen.getByTestId("linhas.3.adicionar")).toHaveValue("9");

    await user.click(screen.getByRole("button", { name: "enviar" }));
    expect(onSubmit.mock.calls[0][0].linhas).toHaveLength(4);
    expect(onSubmit.mock.calls[0][0].linhas[3].adicionar).toBe(9);
  });

  it("removendo todas as novas, volta ao estado inicial sem lixeiras", async () => {
    const user = userEvent.setup();
    render(<Harness onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Adicionar destinação" }));
    await user.click(screen.getAllByRole("button", { name: /Remover linha/ })[0]);

    expect(contarLinhas()).toBe(3);
    expect(contarLixeiras()).toBe(0);
  });
});
