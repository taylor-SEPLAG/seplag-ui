import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addLocale, localeOptions } from "primereact/api";
import { describe, expect, it, vi } from "vitest";
import { formatDateToStringSeplag } from "../../uteis/manipulaData";
import { ModalDataMotivoSeplag, type ModalDataMotivoSeplagProps } from "./index";

// Os campos de data renderizam o Calendar com `locale="pt"`, que quem consome a lib registra na
// aplicação. Aqui basta reaproveitar as chaves do locale padrão: o teste não olha rótulo de mês.
addLocale("pt", localeOptions("en"));

// `ModalSeplag`, `DateFieldSeplag` e `TextAreaFieldSeplag` são renderizados de verdade (sem
// `vi.mock`): o que se testa é a orquestração entre eles.

const ID = "modal-data-motivo";
const HOJE = formatDateToStringSeplag(new Date());

function renderizar(props: Partial<ModalDataMotivoSeplagProps> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const resultado = render(
    <ModalDataMotivoSeplag
      visible
      titulo="Encerrar registro"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { ...resultado, onConfirm, onCancel };
}

const campoData = (id = ID) => screen.getByTestId(`${id}-data`);
const campoMotivo = (id = ID) => screen.getByTestId(`${id}-motivo`);
const botaoAcao = (id = ID) => screen.getByTestId(`${id}-acao`);
const botaoCancelar = (id = ID) => screen.getByTestId(`${id}-fechar`);

/** Digitação via evento de input: a máscara do Calendar liga handlers próprios de teclado. */
function digitarData(input: HTMLElement, valor: string) {
  fireEvent.input(input, { target: { value: valor } });
}

describe("ModalDataMotivoSeplag", () => {
  it("Deveria renderizar o ModalDataMotivoSeplag corretamente", () => {
    // MDM-01
    // Arrange
    // Act
    renderizar();

    // Assert
    expect(screen.getByText("Encerrar registro")).toBeInTheDocument();
    expect(botaoCancelar()).toHaveTextContent("Cancelar");
    expect(botaoAcao()).toHaveTextContent("Confirmar");
    expect(campoData()).toBeInTheDocument();
    expect(campoMotivo()).toBeInTheDocument();
  });

  it("Deveria iniciar com a data de hoje e o motivo vazio", () => {
    // MDM-02
    // Arrange
    // Act
    renderizar();

    // Assert
    expect(campoData()).toHaveValue(HOJE);
    expect(campoMotivo()).toHaveValue("");
  });

  it("Deveria exibir a mensagem somente quando informada", () => {
    // MDM-03
    // Arrange
    const mensagem = "O registro continuará disponível para consulta.";

    // Act
    const { unmount } = renderizar({ mensagem });

    // Assert
    expect(screen.getByTestId(`${ID}-mensagem`)).toHaveTextContent(mensagem);
    unmount();
    renderizar();
    expect(screen.queryByTestId(`${ID}-mensagem`)).not.toBeInTheDocument();
  });

  it("Deveria exibir a dataReferencia somente leitura e aceitar ISO", () => {
    // MDM-04
    // Arrange
    // Act
    const { unmount } = renderizar({ dataReferencia: "2026-01-15" });

    // Assert
    expect(screen.getByTestId(`${ID}-referencia`)).toHaveValue("15/01/2026");
    expect(screen.getByTestId(`${ID}-referencia`)).toBeDisabled();
    expect(screen.getByText("Data de início")).toBeInTheDocument();
    unmount();
    renderizar();
    expect(screen.queryByTestId(`${ID}-referencia`)).not.toBeInTheDocument();
  });

  it("Deveria entregar { data, motivo } ao confirmar com o motivo preenchido", async () => {
    // MDM-05
    // Arrange
    const { onConfirm } = renderizar();
    const user = userEvent.setup();

    // Act
    await user.type(campoMotivo(), "Fim do prazo legal");
    await user.click(botaoAcao());

    // Assert
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(onConfirm).toHaveBeenCalledWith({ data: HOJE, motivo: "Fim do prazo legal" });
  });

  it("Deveria bloquear a confirmação quando o motivo está vazio", async () => {
    // MDM-06
    // Arrange
    const { onConfirm } = renderizar();

    // Act
    fireEvent.click(botaoAcao());

    // Assert
    await waitFor(() => expect(campoMotivo()).toHaveAttribute("aria-invalid", "true"));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("Deveria chamar onCancel ao clicar em Cancelar", async () => {
    // MDM-07
    // Arrange
    const { onCancel, onConfirm } = renderizar();
    const user = userEvent.setup();

    // Act
    await user.click(botaoCancelar());

    // Assert
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("Deveria travar ação, cancelar e campos enquanto confirmando", () => {
    // MDM-08
    // Arrange
    // Act
    renderizar({ confirmando: true });

    // Assert
    expect(botaoAcao()).toBeDisabled();
    expect(botaoCancelar()).toBeDisabled();
    expect(campoData()).toBeDisabled();
    expect(campoMotivo()).toBeDisabled();
  });

  it("Deveria travar ação e campos enquanto carregando", () => {
    // MDM-09
    // Arrange
    // Act
    renderizar({ carregando: true });

    // Assert
    expect(botaoAcao()).toBeDisabled();
    expect(campoData()).toBeDisabled();
    expect(campoMotivo()).toBeDisabled();
  });

  it("Deveria deixar chegar ao onConfirm uma data digitada fora do intervalo", async () => {
    // MDM-10
    // Arrange
    const { onConfirm } = renderizar({ dataReferencia: "2026-01-15" });
    const user = userEvent.setup();

    // Act
    digitarData(campoData(), "01/01/2020");
    await user.type(campoMotivo(), "Teste");
    await user.click(botaoAcao());

    // Assert
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(onConfirm).toHaveBeenCalledWith({ data: "01/01/2020", motivo: "Teste" });
  });

  it("Deveria restaurar os valores iniciais ao fechar e reabrir", async () => {
    // MDM-11
    // Arrange
    const props: ModalDataMotivoSeplagProps = {
      visible: true,
      titulo: "Encerrar registro",
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
    };
    const { rerender } = render(<ModalDataMotivoSeplag {...props} />);
    const user = userEvent.setup();
    await user.type(campoMotivo(), "Rascunho");
    digitarData(campoData(), "01/01/2020");

    // Act
    rerender(<ModalDataMotivoSeplag {...props} visible={false} />);
    rerender(<ModalDataMotivoSeplag {...props} visible />);

    // Assert
    await waitFor(() => expect(campoMotivo()).toHaveValue(""));
    expect(campoData()).toHaveValue(HOJE);
  });

  it("Deveria aplicar id, rótulos, ícone e limite customizados", () => {
    // MDM-12
    // Arrange
    // Act
    renderizar({
      id: "extinguir",
      labelAcao: "Extinguir",
      iconAcao: "pi pi-trash",
      labelData: "Data de extinção",
      labelMotivo: "Motivo da extinção",
      labelCancelar: "Voltar",
      maxLengthMotivo: 30,
    });

    // Assert
    expect(botaoAcao("extinguir")).toHaveTextContent("Extinguir");
    expect(botaoAcao("extinguir").querySelector(".pi-trash")).not.toBeNull();
    expect(botaoCancelar("extinguir")).toHaveTextContent("Voltar");
    expect(screen.getByText("Data de extinção")).toBeInTheDocument();
    expect(screen.getByText("Motivo da extinção")).toBeInTheDocument();
    expect(campoMotivo("extinguir")).toHaveAttribute("maxlength", "30");
  });
});
