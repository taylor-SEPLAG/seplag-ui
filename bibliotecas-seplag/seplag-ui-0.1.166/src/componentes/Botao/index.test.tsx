import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SEPLAG_PRIMARY } from "../../tokens/colors";
import {
  BotaoAdicionarSeplag,
  BotaoChipSeplag,
  BotaoConsultarSeplag,
  BotaoEditarSeplag,
  BotaoFecharSeplag,
  BotaoIconSeplag,
  BotaoLimparFiltroSeplag,
  BotaoRemoverSeplag,
  BotaoSalvarSeplag,
  BotaoSeplag,
  BotaoVoltarSeplag,
  type BotaoSeplagProps,
} from "./index";

// O `Button` do PrimeReact é renderizado de verdade (sem `vi.mock`): o que se testa aqui é
// justamente o que `ButtonSeplag` repassa a ele — `style`, `id`, `data-testid` e `aria-label`.

const ESTILO_BASE = {
  height: "40px",
  minWidth: "120px",
  width: "auto",
  borderRadius: "4px",
};

/** Botão renderizado, buscado pelo `data-testid` resolvido. */
const botao = (testId: string) => screen.getByTestId(testId);

/** Ícone do PrimeReact: não tem role nem nome acessível, só resta a classe. */
const temIcone = (elemento: HTMLElement, classe: string) =>
  elemento.querySelector(`.${classe}`) !== null;

const paraKebab = (propriedade: string) =>
  propriedade.replace(/[A-Z]/g, (letra) => `-${letra.toLowerCase()}`);

/**
 * Compara o `style` **inline** do elemento — que é o que `ButtonSeplag` calcula e repassa.
 *
 * Não usa `toHaveStyle` de propósito: aquele matcher resolve via `getComputedStyle`, e sem o CSS do
 * PrimeReact carregado o jsdom não devolve `background-color` nem `border-color`. Aqui o valor
 * esperado passa pelo mesmo parser CSS do jsdom que produziu o valor real, então `#2196F3` e
 * `rgb(33, 150, 243)` são equivalentes sem que o teste precise conhecer a normalização.
 */
function esperarEstilo(elemento: HTMLElement, esperado: Record<string, string>) {
  const sonda = document.createElement("div");

  Object.entries(esperado).forEach(([propriedade, valor]) => {
    const nomeCss = paraKebab(propriedade);
    sonda.style.setProperty(nomeCss, valor);

    expect(elemento.style.getPropertyValue(nomeCss), `estilo "${nomeCss}"`).toBe(
      sonda.style.getPropertyValue(nomeCss),
    );
  });
}

describe("BotaoSeplag", () => {
  it("Deveria renderizar o BotaoSeplag corretamente", () => {
    // Arrange — BS-01
    const label = "Enviar";

    // Act
    render(<BotaoSeplag label={label} />);

    // Assert
    const elemento = screen.getByRole("button", { name: label });
    expect(elemento).toBeInTheDocument();
    expect(elemento).toHaveAttribute("aria-label", label);
    expect(elemento).toHaveAttribute("data-testid", "enviar");
    expect(elemento).toHaveAttribute("id", "enviar");
    expect(elemento).toHaveClass("p-button");
    expect(elemento).toHaveTextContent(label);
  });

  it("Deveria renderizar o BotaoSeplag com suas variações de estilo", () => {
    // Arrange — BS-02
    const variantes: Array<[BotaoSeplagProps["variant"], Record<string, string>]> = [
      ["base", { ...ESTILO_BASE, border: "0px" }],
      ["save", { ...ESTILO_BASE, color: "white", backgroundColor: SEPLAG_PRIMARY }],
      [
        "back",
        {
          ...ESTILO_BASE,
          color: SEPLAG_PRIMARY,
          backgroundColor: "white",
          borderColor: SEPLAG_PRIMARY,
        },
      ],
      ["clear", { height: "40px", minWidth: "40px", width: "auto", borderRadius: "4px", border: "0px" }],
      ["icon", { color: "white", fontSize: "0.8rem" }],
    ];

    // Act + Assert
    variantes.forEach(([variante, estiloEsperado]) => {
      const { unmount } = render(<BotaoSeplag label="Acao" variant={variante} />);

      esperarEstilo(botao("acao"), estiloEsperado);

      unmount();
    });

    // `unstyled` ignora todas as variantes e não aplica classe do PrimeReact
    render(<BotaoSeplag label="Acao" variant="save" unstyled />);

    expect(botao("acao")).not.toHaveAttribute("style");
    expect(botao("acao")).not.toHaveClass("p-button");
  });

  it("Deveria renderizar o BotaoSeplag com todas as suas props preenchidas", async () => {
    // Arrange — BS-03
    const user = userEvent.setup();
    const onClick = vi.fn();

    // Act
    render(
      <BotaoSeplag
        label="Confirmar"
        variant="save"
        icon="pi pi-check"
        iconPos="left"
        tooltip="Confirmar a operação"
        minWidth="200px"
        style={{ color: "black" }}
        hasPermission
        visible
        severity="success"
        raised
        type="submit"
        data-testid="botao-confirmar"
        id="id-confirmar"
        onClick={onClick}
      />,
    );
    await user.click(botao("botao-confirmar"));

    // Assert
    const elemento = botao("botao-confirmar");
    expect(elemento).toHaveAttribute("id", "id-confirmar");
    expect(elemento).toHaveAttribute("aria-label", "Confirmar");
    expect(elemento).toHaveAttribute("type", "submit");
    expect(elemento).toHaveClass("p-button-raised", "p-button-success");
    esperarEstilo(elemento, { minWidth: "200px", color: "black" });
    expect(temIcone(elemento, "pi-check")).toBe(true);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("BotaoAdicionarSeplag", () => {
  it("Deveria renderizar o BotaoAdicionarSeplag corretamente", () => {
    // Arrange — BAD-01

    // Act
    render(<BotaoAdicionarSeplag />);

    // Assert
    const elemento = screen.getByRole("button", { name: "Adicionar" });
    expect(elemento).toHaveAttribute("data-testid", "adicionar");
    expect(temIcone(elemento, "pi-plus")).toBe(true);
    expect(temIcone(elemento, "p-button-icon-left")).toBe(true);
  });

  it("Deveria renderizar o BotaoAdicionarSeplag com suas variações de estilo", () => {
    // Arrange — BAD-02

    // Act
    const { unmount } = render(<BotaoAdicionarSeplag />);

    // Assert
    esperarEstilo(botao("adicionar"), { ...ESTILO_BASE, border: "0px" });
    unmount();

    // `outlined` mantém a borda da variante base
    render(<BotaoAdicionarSeplag outlined />);

    esperarEstilo(botao("adicionar"), ESTILO_BASE);
    expect(botao("adicionar").style.border).toBe("");
    expect(botao("adicionar")).toHaveClass("p-button-outlined");
  });

  it("Deveria renderizar o BotaoAdicionarSeplag com todas as suas props preenchidas", async () => {
    // Arrange — BAD-03
    const user = userEvent.setup();
    const onClick = vi.fn();

    // Act
    render(
      <BotaoAdicionarSeplag
        label="Adicionar Etapa"
        icon="pi pi-plus-circle"
        tooltip="Adiciona uma nova etapa"
        minWidth="180px"
        style={{ borderRadius: "8px" }}
        onClick={onClick}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Adicionar Etapa" }));

    // Assert
    const elemento = botao("adicionar-etapa");
    expect(elemento).toHaveAttribute("aria-label", "Adicionar Etapa");
    esperarEstilo(elemento, { minWidth: "180px", borderRadius: "8px" });
    expect(temIcone(elemento, "pi-plus-circle")).toBe(true);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("BotaoSalvarSeplag", () => {
  it("Deveria renderizar o BotaoSalvarSeplag corretamente", () => {
    // Arrange — BSA-01

    // Act
    render(<BotaoSalvarSeplag />);

    // Assert
    const elemento = screen.getByRole("button", { name: "Salvar" });
    expect(elemento).toHaveAttribute("data-testid", "salvar");
    expect(elemento).toHaveClass("p-button-raised");
    expect(temIcone(elemento, "pi-save")).toBe(true);
  });

  it("Deveria renderizar o BotaoSalvarSeplag com suas variações de estilo", () => {
    // Arrange — BSA-02

    // Act
    const { unmount } = render(<BotaoSalvarSeplag />);

    // Assert — variante `save`
    esperarEstilo(botao("salvar"), {
      ...ESTILO_BASE,
      color: "white",
      backgroundColor: SEPLAG_PRIMARY,
    });
    unmount();

    // O `style` do consumidor sobrescreve a variante
    render(<BotaoSalvarSeplag style={{ backgroundColor: "green" }} />);

    esperarEstilo(botao("salvar"), { backgroundColor: "green" });
  });

  it("Deveria renderizar o BotaoSalvarSeplag com todas as suas props preenchidas", async () => {
    // Arrange — BSA-03
    const user = userEvent.setup();
    const onClick = vi.fn();

    // Act
    render(
      <BotaoSalvarSeplag
        label="Salvar Cadastro"
        icon="pi pi-check"
        tooltip="Grava o cadastro"
        minWidth="220px"
        style={{ color: "black" }}
        type="submit"
        disabled
        onClick={onClick}
      />,
    );
    await user.click(botao("salvar-cadastro"));

    // Assert
    const elemento = botao("salvar-cadastro");
    expect(elemento).toHaveAttribute("aria-label", "Salvar Cadastro");
    expect(elemento).toHaveAttribute("type", "submit");
    expect(elemento).toBeDisabled();
    esperarEstilo(elemento, { minWidth: "220px", color: "black" });
    expect(temIcone(elemento, "pi-check")).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("BotaoVoltarSeplag", () => {
  it("Deveria renderizar o BotaoVoltarSeplag corretamente", () => {
    // Arrange — BVO-01

    // Act
    render(<BotaoVoltarSeplag />);

    // Assert
    const elemento = screen.getByRole("button", { name: "Voltar" });
    expect(elemento).toHaveAttribute("data-testid", "voltar");
    expect(elemento).toHaveAttribute("type", "button");
    expect(temIcone(elemento, "pi-arrow-left")).toBe(true);
  });

  it("Deveria renderizar o BotaoVoltarSeplag com suas variações de estilo", () => {
    // Arrange — BVO-02

    // Act
    render(<BotaoVoltarSeplag />);

    // Assert — variante `back`
    const elemento = botao("voltar");
    esperarEstilo(elemento, {
      ...ESTILO_BASE,
      color: SEPLAG_PRIMARY,
      backgroundColor: "white",
      borderColor: SEPLAG_PRIMARY,
    });
    expect(elemento).toHaveClass("p-button-text", "p-button-raised");
  });

  it("Deveria renderizar o BotaoVoltarSeplag com todas as suas props preenchidas", async () => {
    // Arrange — BVO-03
    const user = userEvent.setup();
    const onClick = vi.fn();

    // Act
    render(
      <BotaoVoltarSeplag
        label="Voltar à Lista"
        tooltip="Retorna para a listagem"
        minWidth="150px"
        style={{ borderRadius: "12px" }}
        type="submit"
        onClick={onClick}
      />,
    );
    await user.click(botao("voltar-a-lista"));

    // Assert
    const elemento = botao("voltar-a-lista");
    expect(elemento).toHaveAttribute("aria-label", "Voltar à Lista");
    expect(elemento).toHaveAttribute("type", "submit");
    esperarEstilo(elemento, { minWidth: "150px", borderRadius: "12px" });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("BotaoFecharSeplag", () => {
  it("Deveria renderizar o BotaoFecharSeplag corretamente", () => {
    // Arrange — BFE-01

    // Act
    render(<BotaoFecharSeplag />);

    // Assert
    const elemento = screen.getByRole("button", { name: "Fechar" });
    expect(elemento).toHaveAttribute("data-testid", "fechar");
    expect(elemento).toHaveAttribute("type", "button");
    expect(elemento.querySelector(".p-button-icon")).toBeNull();
  });

  it("Deveria renderizar o BotaoFecharSeplag com suas variações de estilo", () => {
    // Arrange — BFE-02

    // Act
    render(<BotaoFecharSeplag />);

    // Assert — variante `back`
    const elemento = botao("fechar");
    esperarEstilo(elemento, {
      color: SEPLAG_PRIMARY,
      backgroundColor: "white",
      borderColor: SEPLAG_PRIMARY,
    });
    expect(elemento).toHaveClass("p-button-text", "p-button-raised");
  });

  it("Deveria renderizar o BotaoFecharSeplag com todas as suas props preenchidas", async () => {
    // Arrange — BFE-03
    const user = userEvent.setup();
    const onClick = vi.fn();

    // Act
    render(
      <BotaoFecharSeplag
        label="Fechar Modal"
        icon="pi pi-times"
        tooltip="Fecha a janela"
        minWidth="140px"
        style={{ color: "black" }}
        onClick={onClick}
      />,
    );
    await user.click(botao("fechar-modal"));

    // Assert
    const elemento = botao("fechar-modal");
    expect(elemento).toHaveAttribute("aria-label", "Fechar Modal");
    esperarEstilo(elemento, { minWidth: "140px", color: "black" });
    expect(temIcone(elemento, "pi-times")).toBe(true);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("BotaoConsultarSeplag", () => {
  it("Deveria renderizar o BotaoConsultarSeplag corretamente", () => {
    // Arrange — BCO-01

    // Act
    render(<BotaoConsultarSeplag />);

    // Assert
    const elemento = screen.getByRole("button", { name: "Consultar" });
    expect(elemento).toHaveAttribute("data-testid", "consultar");
    expect(temIcone(elemento, "pi-search")).toBe(true);
  });

  it("Deveria renderizar o BotaoConsultarSeplag com suas variações de estilo", () => {
    // Arrange — BCO-02

    // Act
    const { unmount } = render(<BotaoConsultarSeplag />);

    // Assert — variante base
    esperarEstilo(botao("consultar"), { ...ESTILO_BASE, border: "0px" });
    unmount();

    // O consumidor pode sobrescrever a variante
    render(<BotaoConsultarSeplag variant="save" />);

    esperarEstilo(botao("consultar"), { backgroundColor: SEPLAG_PRIMARY, color: "white" });
  });

  it("Deveria renderizar o BotaoConsultarSeplag com todas as suas props preenchidas", async () => {
    // Arrange — BCO-03
    const user = userEvent.setup();
    const onClick = vi.fn();

    // Act
    render(
      <BotaoConsultarSeplag
        label="Consultar Processo"
        icon="pi pi-filter"
        tooltip="Executa a consulta"
        minWidth="210px"
        style={{ borderRadius: "2px" }}
        type="submit"
        onClick={onClick}
      />,
    );
    await user.click(botao("consultar-processo"));

    // Assert
    const elemento = botao("consultar-processo");
    expect(elemento).toHaveAttribute("aria-label", "Consultar Processo");
    expect(elemento).toHaveAttribute("type", "submit");
    esperarEstilo(elemento, { minWidth: "210px", borderRadius: "2px" });
    expect(temIcone(elemento, "pi-filter")).toBe(true);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("BotaoLimparFiltroSeplag", () => {
  it("Deveria renderizar o BotaoLimparFiltroSeplag corretamente", () => {
    // Arrange — BLF-01

    // Act
    render(<BotaoLimparFiltroSeplag />);

    // Assert
    const elemento = screen.getByRole("button", { name: "Limpar Filtro" });
    expect(elemento).toHaveAttribute("data-testid", "limpar-filtro");
  });

  it("Deveria renderizar o BotaoLimparFiltroSeplag com suas variações de estilo", () => {
    // Arrange — BLF-02

    // Act
    const { unmount } = render(<BotaoLimparFiltroSeplag />);

    // Assert — variante `clear` não herda o `minWidth: 120` da base
    esperarEstilo(botao("limpar-filtro"), {
      height: "40px",
      minWidth: "40px",
      width: "auto",
      borderRadius: "4px",
      border: "0px",
    });
    unmount();

    // `minWidth` sobrescreve o valor da variante
    render(<BotaoLimparFiltroSeplag minWidth="90px" />);

    esperarEstilo(botao("limpar-filtro"), { minWidth: "90px" });
  });

  it("Deveria renderizar o BotaoLimparFiltroSeplag com todas as suas props preenchidas", async () => {
    // Arrange — BLF-03
    const user = userEvent.setup();
    const onClick = vi.fn();

    // Act
    render(
      <BotaoLimparFiltroSeplag
        label="Limpar"
        icon="pi pi-eraser"
        tooltip="Limpa os filtros aplicados"
        minWidth="80px"
        style={{ color: "black" }}
        onClick={onClick}
      />,
    );
    await user.click(botao("limpar"));

    // Assert
    const elemento = botao("limpar");
    expect(elemento).toHaveAttribute("aria-label", "Limpar");
    esperarEstilo(elemento, { minWidth: "80px", color: "black" });
    expect(temIcone(elemento, "pi-eraser")).toBe(true);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("BotaoIconSeplag", () => {
  it("Deveria renderizar o BotaoIconSeplag corretamente", () => {
    // Arrange — BIC-01

    // Act
    render(<BotaoIconSeplag icon="pi pi-cog" tooltip="Configurar" />);

    // Assert — sem `label`, o `data-testid` cai no fallback `botao-${variant}`
    const elemento = screen.getByRole("button", { name: "Configurar" });
    expect(elemento).toHaveAttribute("data-testid", "botao-icon");
    expect(elemento).toHaveClass("p-button-icon-only");
    expect(temIcone(elemento, "pi-cog")).toBe(true);
  });

  it("Deveria renderizar o BotaoIconSeplag com suas variações de estilo", () => {
    // Arrange — BIC-02

    // Act
    render(<BotaoIconSeplag icon="pi pi-cog" />);

    // Assert — variante `icon` não define dimensões
    const elemento = botao("botao-icon");
    esperarEstilo(elemento, { color: "white", fontSize: "0.8rem" });
    expect(elemento.style.height).toBe("");
    expect(elemento.style.minWidth).toBe("");
  });

  it("Deveria renderizar o BotaoIconSeplag com todas as suas props preenchidas", async () => {
    // Arrange — BIC-03
    const user = userEvent.setup();
    const onClick = vi.fn();

    // Act
    render(
      <BotaoIconSeplag
        icon="pi pi-trash"
        aria-label="Excluir registro"
        tooltip="Excluir"
        tooltipOptions={{ position: "bottom" }}
        style={{ fontSize: "1rem" }}
        severity="danger"
        onClick={onClick}
      />,
    );
    await user.click(botao("botao-icon"));

    // Assert — o `aria-label` explícito tem precedência sobre o `tooltip`
    const elemento = botao("botao-icon");
    expect(elemento).toHaveAttribute("aria-label", "Excluir registro");
    expect(elemento).toHaveClass("p-button-danger");
    esperarEstilo(elemento, { fontSize: "1rem" });
    expect(temIcone(elemento, "pi-trash")).toBe(true);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("BotaoChipSeplag", () => {
  it("Deveria renderizar o BotaoChipSeplag corretamente", () => {
    // Arrange — BCH-01

    // Act
    render(<BotaoChipSeplag>Documento X</BotaoChipSeplag>);

    // Assert — o nome acessível vem dos `children`
    const elemento = screen.getByRole("button", { name: "Documento X" });
    expect(elemento).toHaveAttribute("data-testid", "botao-base");
    expect(elemento).toHaveAttribute("type", "button");
    expect(elemento).not.toHaveAttribute("aria-label");
  });

  it("Deveria renderizar o BotaoChipSeplag com suas variações de estilo", () => {
    // Arrange — BCH-02

    // Act
    const { unmount } = render(<BotaoChipSeplag>Chip</BotaoChipSeplag>);

    // Assert — `unstyled` não aplica variante nem classe do PrimeReact
    expect(botao("botao-base")).not.toHaveAttribute("style");
    expect(botao("botao-base")).not.toHaveClass("p-button");
    unmount();

    // Só o `style` recebido é aplicado
    render(<BotaoChipSeplag style={{ backgroundColor: "gray" }}>Chip</BotaoChipSeplag>);

    esperarEstilo(botao("botao-base"), { backgroundColor: "gray" });
    expect(botao("botao-base").style.height).toBe("");
  });

  it("Deveria renderizar o BotaoChipSeplag com todas as suas props preenchidas", async () => {
    // Arrange — BCH-03
    const user = userEvent.setup();
    const onClick = vi.fn();

    // Act
    render(
      <BotaoChipSeplag
        id="chip-documento"
        className="chip-customizado"
        style={{ padding: "4px" }}
        tooltip="Remove o documento"
        type="submit"
        onClick={onClick}
      >
        Documento Y
      </BotaoChipSeplag>,
    );
    await user.click(botao("chip-documento"));

    // Assert
    const elemento = botao("chip-documento");
    expect(elemento).toHaveAttribute("id", "chip-documento");
    expect(elemento).toHaveClass("chip-customizado");
    expect(elemento).toHaveAttribute("type", "submit");
    esperarEstilo(elemento, { padding: "4px" });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("BotaoEditarSeplag", () => {
  it("Deveria renderizar o BotaoEditarSeplag corretamente", () => {
    // Arrange — BED-01

    // Act
    render(<BotaoEditarSeplag />);

    // Assert
    const elemento = screen.getByRole("button", { name: "Editar" });
    expect(elemento).toHaveAttribute("data-testid", "editar");
    expect(elemento).toHaveAttribute("type", "button");
    expect(temIcone(elemento, "pi-pencil")).toBe(true);
  });

  it("Deveria renderizar o BotaoEditarSeplag com suas variações de estilo", () => {
    // Arrange — BED-02

    // Act
    render(<BotaoEditarSeplag />);

    // Assert — variante `back` com `text`, mas sem `raised`
    const elemento = botao("editar");
    esperarEstilo(elemento, {
      color: SEPLAG_PRIMARY,
      backgroundColor: "white",
      borderColor: SEPLAG_PRIMARY,
    });
    expect(elemento).toHaveClass("p-button-text");
    expect(elemento).not.toHaveClass("p-button-raised");
  });

  it("Deveria renderizar o BotaoEditarSeplag com todas as suas props preenchidas", async () => {
    // Arrange — BED-03
    const user = userEvent.setup();
    const onClick = vi.fn();

    // Act
    render(
      <BotaoEditarSeplag
        label="Editar Informativo"
        icon="pi pi-file-edit"
        tooltip="Edita o informativo"
        minWidth="170px"
        style={{ borderRadius: "6px" }}
        type="submit"
        onClick={onClick}
      />,
    );
    await user.click(botao("editar-informativo"));

    // Assert
    const elemento = botao("editar-informativo");
    expect(elemento).toHaveAttribute("aria-label", "Editar Informativo");
    expect(elemento).toHaveAttribute("type", "submit");
    esperarEstilo(elemento, { minWidth: "170px", borderRadius: "6px" });
    expect(temIcone(elemento, "pi-file-edit")).toBe(true);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("BotaoRemoverSeplag", () => {
  it("Deveria renderizar o BotaoRemoverSeplag corretamente", () => {
    // Arrange — BRE-01

    // Act
    render(<BotaoRemoverSeplag />);

    // Assert
    const elemento = screen.getByRole("button", { name: "Remover" });
    expect(elemento).toHaveAttribute("data-testid", "remover");
    expect(elemento).toHaveAttribute("type", "button");
    expect(temIcone(elemento, "pi-trash")).toBe(true);
  });

  it("Deveria renderizar o BotaoRemoverSeplag com suas variações de estilo", () => {
    // Arrange — BRE-02

    // Act
    render(<BotaoRemoverSeplag />);

    // Assert — base com `outlined`: a borda é preservada
    const elemento = botao("remover");
    esperarEstilo(elemento, ESTILO_BASE);
    expect(elemento.style.border).toBe("");
    expect(elemento).toHaveClass("p-button-outlined", "p-button-danger");
  });

  it("Deveria renderizar o BotaoRemoverSeplag com todas as suas props preenchidas", async () => {
    // Arrange — BRE-03
    const user = userEvent.setup();
    const onClick = vi.fn();

    // Act
    render(
      <BotaoRemoverSeplag
        label="Remover Etapa"
        icon="pi pi-times-circle"
        tooltip="Remove a etapa"
        minWidth="190px"
        style={{ color: "black" }}
        severity="warning"
        disabled
        onClick={onClick}
      />,
    );
    await user.click(botao("remover-etapa"));

    // Assert
    const elemento = botao("remover-etapa");
    expect(elemento).toHaveAttribute("aria-label", "Remover Etapa");
    expect(elemento).toBeDisabled();
    expect(elemento).toHaveClass("p-button-warning");
    esperarEstilo(elemento, { minWidth: "190px", color: "black" });
    expect(temIcone(elemento, "pi-times-circle")).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("Botao — comportamentos transversais (SUGESTÃO)", () => {
  it("Deveria ocultar o botão apenas quando hasPermission é explicitamente false", () => {
    // Arrange — S-01

    // Act
    const { unmount } = render(<BotaoSeplag label="Restrito" hasPermission={false} />);

    // Assert
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    unmount();

    render(
      <>
        <BotaoSeplag label="Permitido" hasPermission />
        <BotaoSeplag label="Sem Prop" />
      </>,
    );

    expect(screen.getByRole("button", { name: "Permitido" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sem Prop" })).toBeInTheDocument();
  });

  it("Deveria ocultar o botão quando visible é falso", () => {
    // Arrange — S-02

    // Act
    const { unmount } = render(<BotaoSeplag label="Invisivel" visible={false} />);

    // Assert
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    unmount();

    render(<BotaoSeplag label="Visivel" />);

    expect(screen.getByRole("button", { name: "Visivel" })).toBeInTheDocument();
  });

  it("Deveria disparar onClick no clique e ignorá-lo quando desabilitado", async () => {
    // Arrange — S-03
    const user = userEvent.setup();
    const onClickAtivo = vi.fn();
    const onClickDesabilitado = vi.fn();

    // Act
    render(
      <>
        <BotaoSeplag label="Ativo" onClick={onClickAtivo} />
        <BotaoSeplag label="Desabilitado" disabled onClick={onClickDesabilitado} />
      </>,
    );
    await user.click(botao("ativo"));
    await user.click(botao("desabilitado"));

    // Assert
    expect(onClickAtivo).toHaveBeenCalledTimes(1);
    expect(onClickDesabilitado).not.toHaveBeenCalled();
  });

  it("Deveria respeitar a precedência de resolução do data-testid", () => {
    // Arrange — S-04

    // Act
    render(
      <>
        <BotaoSeplag label="Com Label" data-testid="testid-explicito" id="id-ignorado" />
        <BotaoSeplag label="Somente Label" />
        <BotaoSeplag id="id-do-botao" />
        <BotaoSeplag variant="save" />
      </>,
    );

    // Assert — data-testid explícito → slug do label → id → `botao-${variant}`
    expect(botao("testid-explicito")).toBeInTheDocument();
    expect(botao("somente-label")).toBeInTheDocument();
    expect(botao("id-do-botao")).toBeInTheDocument();
    expect(botao("botao-save")).toBeInTheDocument();
  });

  it("Deveria remover acentos ao gerar o data-testid a partir do label", () => {
    // Arrange — S-05: canário de encoding da faixa Unicode de acentos combinantes
    const label = "Gerar Ofício";

    // Act
    render(<BotaoSeplag label={label} />);

    // Assert
    expect(botao("gerar-oficio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: label })).toHaveAttribute("id", "gerar-oficio");
  });

  it("Deveria usar o data-testid resolvido como id quando id não é informado", () => {
    // Arrange — S-06

    // Act
    render(
      <>
        <BotaoSeplag label="Sem Id" />
        <BotaoSeplag label="Com Id" id="id-informado" />
      </>,
    );

    // Assert
    expect(botao("sem-id")).toHaveAttribute("id", "sem-id");
    expect(botao("com-id")).toHaveAttribute("id", "id-informado");
  });

  it("Deveria priorizar o style do consumidor sobre a variante e o minWidth sobre ambos", () => {
    // Arrange — S-07

    // Act
    render(
      <BotaoSeplag
        label="Prioridade"
        variant="save"
        style={{ backgroundColor: "black", minWidth: "300px" }}
        minWidth="500px"
      />,
    );

    // Assert
    const elemento = botao("prioridade");
    esperarEstilo(elemento, { backgroundColor: "black" });
    esperarEstilo(elemento, { minWidth: "500px" });
  });

  it("Deveria ignorar todas as variantes quando unstyled é verdadeiro", () => {
    // Arrange — S-08
    const variantes: Array<BotaoSeplagProps["variant"]> = ["base", "save", "back", "clear", "icon"];

    // Act + Assert
    variantes.forEach((variante) => {
      const { unmount } = render(<BotaoSeplag label="Sem Estilo" variant={variante} unstyled />);

      expect(botao("sem-estilo")).not.toHaveAttribute("style");

      unmount();
    });
  });

  it.each([
    ["BotaoAdicionarSeplag", BotaoAdicionarSeplag, "Adicionar"],
    ["BotaoSalvarSeplag", BotaoSalvarSeplag, "Salvar"],
    ["BotaoVoltarSeplag", BotaoVoltarSeplag, "Voltar"],
    ["BotaoFecharSeplag", BotaoFecharSeplag, "Fechar"],
    ["BotaoConsultarSeplag", BotaoConsultarSeplag, "Consultar"],
    ["BotaoLimparFiltroSeplag", BotaoLimparFiltroSeplag, "Limpar Filtro"],
    ["BotaoEditarSeplag", BotaoEditarSeplag, "Editar"],
    ["BotaoRemoverSeplag", BotaoRemoverSeplag, "Remover"],
  ] as Array<[string, React.ComponentType<BotaoSeplagProps>, string]>)(
    "Deveria aplicar e permitir sobrescrever o label padrão de %s",
    (_nome, Componente, labelPadrao) => {
      // Arrange — S-09

      // Act
      const { unmount } = render(<Componente />);

      // Assert
      expect(screen.getByRole("button", { name: labelPadrao })).toBeInTheDocument();
      unmount();

      render(<Componente label="Label Customizado" />);

      expect(screen.getByRole("button", { name: "Label Customizado" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: labelPadrao })).not.toBeInTheDocument();
    },
  );

  it.each([
    ["BotaoVoltarSeplag", BotaoVoltarSeplag],
    ["BotaoFecharSeplag", BotaoFecharSeplag],
    ["BotaoEditarSeplag", BotaoEditarSeplag],
    ["BotaoRemoverSeplag", BotaoRemoverSeplag],
  ] as Array<[string, React.ComponentType<BotaoSeplagProps>]>)(
    "Deveria usar type=button por padrão em %s para evitar submit acidental",
    (_nome, Componente) => {
      // Arrange — S-10

      // Act
      render(<Componente />);

      // Assert
      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    },
  );

  it("Deveria aplicar o tooltipOptions padrão posicionado no topo", async () => {
    // Arrange — S-11: sem informar `tooltipOptions`, vale o default `{ position: "top" }`.
    // O tooltip do PrimeReact é `aria-hidden`, por isso a consulta usa `hidden: true`.
    const user = userEvent.setup();

    // Act
    const { unmount } = render(<BotaoSeplag label="Com Tooltip" tooltip="Dica" />);
    await user.hover(botao("com-tooltip"));

    // Assert
    const tooltipPadrao = await screen.findByRole("tooltip", { hidden: true });
    expect(tooltipPadrao).toHaveTextContent("Dica");
    expect(tooltipPadrao).toHaveClass("p-tooltip-top");
    unmount();

    // O consumidor pode sobrescrever a posição
    render(
      <BotaoSeplag label="Outro Tooltip" tooltip="Dica" tooltipOptions={{ position: "bottom" }} />,
    );
    await user.hover(botao("outro-tooltip"));

    expect(await screen.findByRole("tooltip", { hidden: true })).toHaveClass("p-tooltip-bottom");
  });

  it("Deveria derivar o aria-label do tooltip quando não há label", () => {
    // Arrange — S-12

    // Act
    const { unmount } = render(<BotaoIconSeplag icon="pi pi-eye" tooltip="Visualizar" />);

    // Assert
    expect(screen.getByRole("button", { name: "Visualizar" })).toBeInTheDocument();
    unmount();

    // `aria-label` explícito vence o tooltip
    render(<BotaoIconSeplag icon="pi pi-eye" tooltip="Visualizar" aria-label="Ver detalhes" />);

    expect(screen.getByRole("button", { name: "Ver detalhes" })).toBeInTheDocument();
  });

  it("Deveria renderizar label e children simultaneamente", () => {
    // Arrange — S-13

    // Act
    render(<BotaoSeplag label="Rotulo">{<span>Conteudo Extra</span>}</BotaoSeplag>);

    // Assert
    const elemento = botao("rotulo");
    expect(elemento).toHaveTextContent("Rotulo");
    expect(elemento).toHaveTextContent("Conteudo Extra");
  });

  it("Deveria produzir data-testid vazio quando o label não tem caracteres alfanuméricos", () => {
    // Arrange — S-14: documenta o comportamento atual (bug latente).
    // `slugifyLabel("!!!")` retorna "", que não é nullish, então o `??` não cai para o `id`.

    // Act
    const { container } = render(<BotaoSeplag label="!!!" id="id-de-fallback" />);

    // Assert
    const elemento = container.querySelector("button");
    expect(elemento).toHaveAttribute("data-testid", "");
    expect(elemento).toHaveAttribute("id", "id-de-fallback");
  });
});
