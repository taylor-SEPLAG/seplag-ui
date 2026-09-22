import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { DropdownFieldSeplag } from "./DropdownField";

const ORGAOS = [
  { id: 1, nome: "SEMA" },
  { id: 2, nome: "SEPLAG" },
  { id: 3, nome: "SEFAZ" },
  { id: 4, nome: "SAD" },
];

const rotulo = () => document.querySelector(".p-dropdown-label")?.textContent;
const opcoesDoPainel = () =>
  [...document.querySelectorAll(".p-dropdown-item")].map((item) => item.textContent);

/**
 * Com `appendTo="self"` cada painel fica dentro da raiz do próprio dropdown, e painéis já
 * abertos permanecem no DOM. Com mais de um campo em tela, a consulta precisa ser escopada.
 */
const opcoesDe = (testId: string) =>
  [...screen.getByTestId(testId).querySelectorAll(".p-dropdown-item")].map(
    (item) => item.textContent,
  );

function Controlado(props: {
  readonly value?: number | null;
  readonly valoresIndisponiveis?: readonly (string | number | null | undefined)[];
  readonly excludeIf?: (opcao: { id: number; nome: string }) => boolean;
}) {
  return (
    <DropdownFieldSeplag
      name="orgao"
      options={ORGAOS}
      optionLabel="nome"
      optionValue="id"
      value={props.value ?? null}
      onChange={vi.fn()}
      valoresIndisponiveis={props.valoresIndisponiveis}
      excludeIf={props.excludeIf}
      semMoldura
    />
  );
}

describe("DropdownFieldSeplag — valoresIndisponiveis", () => {
  it("remove do painel as opções já tomadas", async () => {
    const user = userEvent.setup();
    render(<Controlado valoresIndisponiveis={[2, 3]} />);

    await user.click(screen.getByTestId("orgao"));

    expect(opcoesDoPainel()).toEqual(["SAD", "SEMA"]);
  });

  // O motivo de a prop existir: a guarda do próprio valor é automática.
  it("nunca remove a opção do próprio valor, mesmo listada como indisponível", async () => {
    const user = userEvent.setup();
    render(<Controlado value={1} valoresIndisponiveis={[1, 2, 3]} />);

    expect(rotulo()).toBe("SEMA");

    await user.click(screen.getByTestId("orgao"));
    expect(opcoesDoPainel()).toEqual(["SAD", "SEMA"]);
  });

  it("sem a prop, todas as opções continuam disponíveis", async () => {
    const user = userEvent.setup();
    render(<Controlado />);

    await user.click(screen.getByTestId("orgao"));

    expect(opcoesDoPainel()).toHaveLength(4);
  });

  it("lista vazia não filtra nada", async () => {
    const user = userEvent.setup();
    render(<Controlado valoresIndisponiveis={[]} />);

    await user.click(screen.getByTestId("orgao"));

    expect(opcoesDoPainel()).toHaveLength(4);
  });

  it("entradas nulas de linhas não preenchidas são inofensivas", async () => {
    const user = userEvent.setup();
    render(<Controlado valoresIndisponiveis={[null, undefined, 2]} />);

    await user.click(screen.getByTestId("orgao"));

    expect(opcoesDoPainel()).toEqual(["SAD", "SEFAZ", "SEMA"]);
  });

  it("combina com excludeIf — os dois filtros se aplicam", async () => {
    const user = userEvent.setup();
    render(<Controlado valoresIndisponiveis={[2]} excludeIf={(orgao) => orgao.id === 4} />);

    await user.click(screen.getByTestId("orgao"));

    expect(opcoesDoPainel()).toEqual(["SEFAZ", "SEMA"]);
  });
});

describe("DropdownFieldSeplag — valoresIndisponiveis no modo react-hook-form", () => {
  /** Duas linhas escolhendo de uma lista compartilhada, como na tabela de destinações. */
  function DuasLinhas() {
    const { control, watch } = useForm({
      defaultValues: {
        linhas: [{ orgaoId: 1 as number | null }, { orgaoId: null as number | null }],
      },
    });
    const linhas = watch("linhas");
    const usados = linhas.map((linha) => linha.orgaoId);

    return (
      <>
        {linhas.map((_linha, indice) => (
          <DropdownFieldSeplag
            key={`linha-${indice === 0 ? "a" : "b"}`}
            name={`linhas.${indice}.orgaoId`}
            control={control}
            options={ORGAOS}
            optionLabel="nome"
            optionValue="id"
            valoresIndisponiveis={usados}
            semMoldura
          />
        ))}
      </>
    );
  }

  it("a segunda linha não oferece o que a primeira já escolheu", async () => {
    const user = userEvent.setup();
    render(<DuasLinhas />);

    await user.click(screen.getByTestId("linhas.1.orgaoId"));

    expect(opcoesDe("linhas.1.orgaoId")).toEqual(["SAD", "SEFAZ", "SEPLAG"]);
    expect(opcoesDe("linhas.1.orgaoId")).not.toContain("SEMA");
  });

  it("escolher na segunda linha retira a opção das demais, sem apagar a própria", async () => {
    const user = userEvent.setup();
    render(<DuasLinhas />);

    await user.click(screen.getByTestId("linhas.1.orgaoId"));
    await user.click(screen.getByText("SEPLAG"));

    // A segunda linha mantém o rótulo do que acabou de escolher.
    const rotulos = [...document.querySelectorAll(".p-dropdown-label")].map((l) => l.textContent);
    expect(rotulos).toEqual(["SEMA", "SEPLAG"]);

    // E a primeira linha deixa de oferecer SEPLAG, mas continua oferecendo o próprio SEMA.
    await user.click(screen.getByTestId("linhas.0.orgaoId"));
    expect(opcoesDe("linhas.0.orgaoId")).toEqual(["SAD", "SEFAZ", "SEMA"]);
  });
});
