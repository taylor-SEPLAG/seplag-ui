import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { NumberFieldSeplag } from "./NumberField";

type FormData = { quantidade: number };

/**
 * O `onChange` do InputNumber entrega o valor cru, sem aplicar `min`/`max`. A exibição, por
 * outro lado, é reescrita a partir de `props.value` já clampada. Sem escutar também o
 * `onValueChange` — o canal por onde o PrimeReact devolve o valor corrigido —, o formulário
 * guarda um número e a tela mostra outro.
 */
function Harness({
  max,
  onSubmit,
}: {
  readonly max?: number;
  readonly onSubmit: (dados: FormData) => void;
}) {
  const { control, handleSubmit, watch } = useForm<FormData>({
    defaultValues: { quantidade: 0 },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <NumberFieldSeplag<FormData>
        name="quantidade"
        label="Quantidade"
        control={control}
        max={max}
        min={0}
        semMoldura
      />
      {/* Espelha o estado do formulário, como faz uma coluna derivada da tabela. */}
      <output data-testid="espelho">{String(watch("quantidade"))}</output>
      <button type="submit">enviar</button>
    </form>
  );
}

describe("NumberFieldSeplag — limites e estado do formulário", () => {
  it("não deixa o formulário guardar valor acima de max", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<Harness max={2} onSubmit={onSubmit} />);

    const input = screen.getByTestId("quantidade");
    await user.clear(input);
    await user.type(input, "10");

    expect(screen.getByTestId("espelho").textContent).toBe("2");
    expect(input).toHaveValue("2");

    await user.click(screen.getByRole("button", { name: "enviar" }));
    expect(onSubmit.mock.calls[0][0].quantidade).toBe(2);
  });

  it("exibição e estado do formulário não divergem ao insistir acima do limite", async () => {
    const user = userEvent.setup();

    render(<Harness max={2} onSubmit={vi.fn()} />);

    const input = screen.getByTestId("quantidade");
    const espelho = screen.getByTestId("espelho");

    await user.clear(input);
    await user.type(input, "1");
    expect(espelho.textContent).toBe(input.getAttribute("value"));

    // A sequência relatada: cada "0" extra empurrava o estado para 10, 20, 200 enquanto a
    // célula mostrava outra coisa.
    for (const _tecla of ["0", "0", "0", "0"]) {
      await user.type(input, "0");
      expect(espelho.textContent).toBe(input.getAttribute("value"));
      expect(Number(espelho.textContent)).toBeLessThanOrEqual(2);
    }
  });

  it("sem max, o valor digitado passa intacto", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<Harness onSubmit={onSubmit} />);

    const input = screen.getByTestId("quantidade");
    await user.clear(input);
    await user.type(input, "200");

    expect(screen.getByTestId("espelho").textContent).toBe("200");

    await user.click(screen.getByRole("button", { name: "enviar" }));
    expect(onSubmit.mock.calls[0][0].quantidade).toBe(200);
  });

  it("respeita min ao chegar em valor abaixo do limite", async () => {
    const user = userEvent.setup();

    render(<Harness max={100} onSubmit={vi.fn()} />);

    const input = screen.getByTestId("quantidade");
    await user.clear(input);
    await user.type(input, "5");
    await user.clear(input);

    // `min={0}` e `allowEmpty` padrão: limpar não pode deixar o formulário negativo nem NaN.
    expect(Number(screen.getByTestId("espelho").textContent || 0)).toBeGreaterThanOrEqual(0);
  });
});
