import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { addLocale, localeOptions } from "primereact/api";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { DateFieldSeplag } from "./DateField";

/**
 * O campo renderiza o Calendar com `locale="pt"`, que quem consome a lib registra na própria
 * aplicação. Aqui basta reaproveitar as chaves do locale padrão: o teste não olha rótulo.
 */
addLocale("pt", localeOptions("en"));

type FormData = { data: string };

const DATA_INICIAL = "10/09/2026";
const LIMITE_MINIMO = new Date(2026, 8, 1); // 01/09/2026
const LIMITE_MAXIMO = new Date(2026, 8, 30); // 30/09/2026

/**
 * O Calendar do PrimeReact usa `minDate`/`maxDate` nos dois caminhos: a seleção no calendário
 * e a digitação. No caminho digitado o efeito não é recusar, é descartar em silêncio —
 * `updateValueOnInput` só chama `updateModel` quando `isValidSelection` passa, e o blur repinta
 * o input a partir do modelo. O formulário fica com o valor anterior sem que nada avise, e nem
 * a validação do formulário nem a do backend chegam a ver o que foi digitado.
 *
 * Aqui os limites devem valer só para o calendário: o que for digitado chega ao formulário.
 */
function Harness({
  minDate,
  maxDate,
  onSubmit,
}: {
  readonly minDate?: Date;
  readonly maxDate?: Date;
  readonly onSubmit: (dados: FormData) => void;
}) {
  const { control, handleSubmit, watch } = useForm<FormData>({
    defaultValues: { data: DATA_INICIAL },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DateFieldSeplag<FormData>
        name="data"
        label="Data"
        control={control}
        minDate={minDate}
        maxDate={maxDate}
      />
      {/* Espelha o estado do formulário: é ele que vai para o submit. */}
      <output data-testid="espelho">{String(watch("data"))}</output>
      <button type="submit">enviar</button>
    </form>
  );
}

/**
 * Digitação via evento de input em vez de `user.type`: a máscara do Calendar liga handlers
 * próprios de teclado, e o que interessa aqui é o valor completo chegando ao campo.
 */
function digitar(input: HTMLElement, valor: string) {
  fireEvent.input(input, { target: { value: valor } });
}

describe("DateFieldSeplag — limites e estado do formulário", () => {
  it("com minDate, a data digitada abaixo do limite chega ao formulário", () => {
    render(<Harness minDate={LIMITE_MINIMO} onSubmit={vi.fn()} />);

    digitar(screen.getByTestId("data"), "01/01/2020");

    expect(screen.getByTestId("espelho").textContent).toBe("01/01/2020");
  });

  it("com maxDate, a data digitada acima do limite chega ao formulário", () => {
    render(<Harness maxDate={LIMITE_MAXIMO} onSubmit={vi.fn()} />);

    digitar(screen.getByTestId("data"), "31/12/2030");

    expect(screen.getByTestId("espelho").textContent).toBe("31/12/2030");
  });

  it("o campo não volta sozinho para o valor anterior depois do blur", () => {
    render(<Harness minDate={LIMITE_MINIMO} onSubmit={vi.fn()} />);

    const input = screen.getByTestId("data");
    digitar(input, "01/01/2020");
    fireEvent.blur(input);

    expect(screen.getByTestId("espelho").textContent).toBe("01/01/2020");
    expect(input).toHaveValue("01/01/2020");
  });

  it("o submit leva a data digitada, não a anterior", async () => {
    const onSubmit = vi.fn();
    render(<Harness minDate={LIMITE_MINIMO} onSubmit={onSubmit} />);

    digitar(screen.getByTestId("data"), "01/01/2020");
    fireEvent.click(screen.getByRole("button", { name: "enviar" }));

    // O handleSubmit do react-hook-form valida de forma assíncrona.
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].data).toBe("01/01/2020");
  });

  it("sem limites, a data digitada continua chegando ao formulário", () => {
    render(<Harness onSubmit={vi.fn()} />);

    digitar(screen.getByTestId("data"), "05/05/2025");

    expect(screen.getByTestId("espelho").textContent).toBe("05/05/2025");
  });

  it("data dentro do intervalo continua chegando ao formulário uma única vez", () => {
    render(
      <Harness minDate={LIMITE_MINIMO} maxDate={LIMITE_MAXIMO} onSubmit={vi.fn()} />,
    );

    digitar(screen.getByTestId("data"), "15/09/2026");

    expect(screen.getByTestId("espelho").textContent).toBe("15/09/2026");
  });

  /**
   * Enquanto a máscara está incompleta o Calendar já limpa o modelo por conta própria — é o
   * comportamento que ele sempre teve e não é o que está em questão aqui. O que não pode
   * acontecer é o texto parcial ser gravado como se fosse uma data.
   */
  it("digitação incompleta não grava texto parcial no formulário", () => {
    render(<Harness minDate={LIMITE_MINIMO} onSubmit={vi.fn()} />);

    digitar(screen.getByTestId("data"), "01/0");

    expect(screen.getByTestId("espelho").textContent).not.toBe("01/0");
  });

  it("data impossível não é gravada como se fosse válida", () => {
    render(<Harness minDate={LIMITE_MINIMO} onSubmit={vi.fn()} />);

    digitar(screen.getByTestId("data"), "31/02/2026");

    expect(screen.getByTestId("espelho").textContent).not.toBe("31/02/2026");
  });
});
