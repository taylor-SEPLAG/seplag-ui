import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { useForm } from "react-hook-form";
import { TextFieldSeplag } from "./TextField";

vi.mock("primereact/inputtext", () => ({
  InputText: ({ className, ...props }: any) => <input className={className} {...props} />,
}));

type FormData = { teste: string };

function FormHarness(props: {
  readonly rules?: any;
  readonly getFormErrorMessage?: (name: string) => React.ReactNode;
}) {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: { teste: "" },
  });

  return (
    <form onSubmit={handleSubmit(() => undefined)}>
      <TextFieldSeplag<FormData>
        name="teste"
        label="Nome da Etapa"
        control={control}
        required
        rules={props.rules}
        getFormErrorMessage={props.getFormErrorMessage}
      />
      <button type="submit">enviar</button>
    </form>
  );
}

describe("TextFieldSeplag", () => {
  it("mostra mensagem de obrigatório mesmo com rules custom", async () => {
    const user = userEvent.setup();

    render(
      <FormHarness
        rules={{
          minLength: { value: 3, message: "Mínimo 3 caracteres" },
          maxLength: { value: 10, message: "Máximo 10 caracteres" },
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "enviar" }));

    expect(screen.queryByText("Nome da Etapa é obrigatório")).not.toBeNull();
  });

  it("mantém prioridade para getFormErrorMessage legado", async () => {
    const user = userEvent.setup();

    render(
      <FormHarness getFormErrorMessage={() => <small className="p-error">Erro legado</small>} />,
    );

    await user.click(screen.getByRole("button", { name: "enviar" }));

    expect(screen.queryByText("Erro legado")).not.toBeNull();
  });

  it("usa erro interno quando getFormErrorMessage retorna null", async () => {
    const user = userEvent.setup();

    render(<FormHarness getFormErrorMessage={() => null} />);

    await user.click(screen.getByRole("button", { name: "enviar" }));

    expect(screen.queryByText("Nome da Etapa é obrigatório")).not.toBeNull();
  });

  it("funciona sem control e sanitiza valor informado", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    // O modo standalone é um input controlado (`value={value ?? ""}`): sem estado no
    // consumidor, cada tecla é descartada e só o último caractere chega ao onChange.
    function StandaloneHarness() {
      const [valor, setValor] = React.useState("");

      return (
        <TextFieldSeplag
          name={"teste" as any}
          label="Campo livre"
          value={valor}
          onChange={(novoValor: string) => {
            setValor(novoValor);
            onChange(novoValor);
          }}
          noSpaces
        />
      );
    }

    render(<StandaloneHarness />);

    await user.type(screen.getByRole("textbox"), "a b c");

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall).toBe("abc");
  });

  it("expõe atributos de acessibilidade quando há erro", async () => {
    const user = userEvent.setup();

    render(<FormHarness getFormErrorMessage={() => null} />);
    await user.click(screen.getByRole("button", { name: "enviar" }));

    const input = screen.getByRole("textbox");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("teste-error");
    expect(screen.getByText("Nome da Etapa é obrigatório").id).toBe("teste-error");
  });
});
