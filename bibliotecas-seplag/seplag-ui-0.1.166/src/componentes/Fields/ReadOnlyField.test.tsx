import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { DropdownFieldSeplag } from "./DropdownField";
import { NumberFieldSeplag } from "./NumberField";

type FormData = { quantidadeAtual: number; orgaoId: number | null };

const ORGAOS = [
  { id: 1, nome: "SEMA" },
  { id: 2, nome: "SEPLAG" },
  { id: 3, nome: "SEFAZ" },
];

/**
 * Reproduz o uso previsto na célula de tabela: campo somente-leitura ao lado de um editável,
 * ambos registrados no mesmo formulário.
 */
function FormHarness(props: {
  readonly readOnly?: boolean;
  readonly onSubmit: (dados: FormData) => void;
}) {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { quantidadeAtual: 2, orgaoId: 1 },
  });

  return (
    <form onSubmit={handleSubmit(props.onSubmit)}>
      <NumberFieldSeplag<FormData>
        name="quantidadeAtual"
        label="Quantidade atual"
        control={control}
        readOnly={props.readOnly}
        semMoldura
      />
      <DropdownFieldSeplag<FormData>
        name="orgaoId"
        label="Órgão"
        control={control}
        options={ORGAOS}
        optionLabel="nome"
        optionValue="id"
        readOnly={props.readOnly}
        semMoldura
      />
      <button type="submit">enviar</button>
    </form>
  );
}

describe("NumberFieldSeplag — readOnly", () => {
  it("marca o input como readOnly sem desabilitá-lo", () => {
    render(<FormHarness readOnly onSubmit={vi.fn()} />);

    const input = screen.getByTestId("quantidadeAtual");
    expect(input).toHaveAttribute("readonly");
    expect(input).not.toBeDisabled();
  });

  it("ignora digitação mas mantém o valor no payload do formulário", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<FormHarness readOnly onSubmit={onSubmit} />);

    await user.type(screen.getByTestId("quantidadeAtual"), "99");
    await user.click(screen.getByRole("button", { name: "enviar" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].quantidadeAtual).toBe(2);
  });

  it("continua focável pelo teclado, ao contrário de disabled", async () => {
    const user = userEvent.setup();

    render(<FormHarness readOnly onSubmit={vi.fn()} />);

    await user.tab();

    expect(screen.getByTestId("quantidadeAtual")).toHaveFocus();
  });

  it("sem readOnly permanece editável", async () => {
    const user = userEvent.setup();

    render(<FormHarness onSubmit={vi.fn()} />);

    const input = screen.getByTestId("quantidadeAtual");
    expect(input).not.toHaveAttribute("readonly");

    await user.clear(input);
    await user.type(input, "7");
    expect(input).toHaveValue("7");
  });
});

describe("DropdownFieldSeplag — readOnly", () => {
  it("não abre o painel ao clicar", async () => {
    const user = userEvent.setup();

    render(<FormHarness readOnly onSubmit={vi.fn()} />);

    await user.click(screen.getByTestId("orgaoId"));

    expect(screen.queryByText("SEPLAG")).toBeNull();
    expect(document.querySelector(".p-dropdown-panel")).toBeNull();
  });

  it("não abre o painel pelas teclas que normalmente o abrem", async () => {
    const user = userEvent.setup();

    render(<FormHarness readOnly onSubmit={vi.fn()} />);

    screen.getByTestId("orgaoId").focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{ArrowDown}");

    expect(document.querySelector(".p-dropdown-panel")).toBeNull();
  });

  it("mantém o valor selecionado no payload do formulário", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<FormHarness readOnly onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "enviar" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].orgaoId).toBe(1);
  });

  it("exibe o rótulo da opção e esconde o botão de limpar", () => {
    render(<FormHarness readOnly onSubmit={vi.fn()} />);

    expect(document.querySelector(".p-dropdown-label")?.textContent).toBe("SEMA");
    expect(document.querySelector(".p-dropdown-clear-icon")).toBeNull();
  });

  it("ignora caractere imprimível, que no modo editável abriria o painel e buscaria", async () => {
    const user = userEvent.setup();

    render(<FormHarness readOnly onSubmit={vi.fn()} />);

    screen.getByTestId("orgaoId").focus();
    await user.keyboard("s");

    expect(document.querySelector(".p-dropdown-panel")).toBeNull();
    expect(document.querySelector(".p-dropdown-label")?.textContent).toBe("SEMA");
  });

  it("sem readOnly o painel abre normalmente", async () => {
    const user = userEvent.setup();

    render(<FormHarness onSubmit={vi.fn()} />);

    await user.click(screen.getByTestId("orgaoId"));

    expect(document.querySelector(".p-dropdown-panel")).not.toBeNull();
  });
});

describe("semMoldura", () => {
  it("não emite classe de grid nem rótulo em nenhum dos dois campos", () => {
    const { container } = render(<FormHarness onSubmit={vi.fn()} />);

    expect(container.querySelector("[class*='md:col-']")).toBeNull();
    expect(container.querySelector(".content-rotulo")).toBeNull();
    expect(screen.queryByText("Quantidade atual")).toBeNull();
    expect(screen.queryByText("Órgão")).toBeNull();
  });

  // Sem esta classe o campo assume a largura intrínseca do controle (~177px no InputNumber)
  // e estoura contêineres estreitos, como célula de tabela.
  it("marca os campos para ocuparem a largura do contêiner", () => {
    render(<FormHarness onSubmit={vi.fn()} />);

    expect(document.querySelector(".p-inputnumber")?.className).toContain(
      "seplag-field-sem-moldura",
    );
    expect(document.querySelector(".p-dropdown")?.className).toContain("seplag-field-sem-moldura");
  });

  it("não aplica a classe de largura quando a moldura está presente", () => {
    render(
      <NumberFieldSeplag
        name={"solto" as never}
        label="Com moldura"
        value={1}
        onChange={vi.fn()}
      />,
    );

    expect(document.querySelector(".p-inputnumber")?.className).not.toContain(
      "seplag-field-sem-moldura",
    );
  });
});
