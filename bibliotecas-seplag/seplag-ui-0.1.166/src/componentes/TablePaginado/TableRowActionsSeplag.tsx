import { BotaoIconSeplag } from "@componentes/Botao";
import type { MenuItem } from "primereact/menuitem";
import { SplitButton } from "primereact/splitbutton";
import { cloneElement, isValidElement, type ReactNode } from "react";
import style from "./Table.module.css";

export type TableAcoesAlignSeplag = "left" | "center" | "right";

const justifyContentPorAlign: Record<TableAcoesAlignSeplag, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

export interface TableRowActionsSeplagProps<T> {
  readonly rowId: string | number;
  readonly rowData: T;
  readonly handleView?: ((arg: T) => void) | null;
  readonly handleEdit?: ((arg: T) => void) | null;
  readonly handleDuplicar?: ((arg: T) => void) | null;
  readonly handleGerarOficio?: ((arg: T) => void) | null;
  readonly handleHistorico?: ((arg: T) => void) | null;
  readonly onExcluir?: (rowData: T) => void;
  readonly hasDelete?: boolean;
  readonly renderBotoes?: (data: T) => ReactNode;
  readonly extraAcoes?: (data: T) => { label: string; icon: string; command: () => void }[] | null;
  readonly align?: TableAcoesAlignSeplag;
  readonly disableGrouping?: boolean;
  readonly groupingThreshold?: number;
}

export function TableRowActionsSeplag<T>({
  rowId,
  rowData,
  handleView,
  handleEdit,
  handleDuplicar,
  handleGerarOficio,
  handleHistorico,
  onExcluir,
  hasDelete = false,
  renderBotoes,
  extraAcoes,
  align,
  disableGrouping = false,
  groupingThreshold = 1,
}: Readonly<TableRowActionsSeplagProps<T>>) {
  const testId = (suffix: string) => `row-${rowId}-${suffix}`;
  const extraAcoesCount = extraAcoes?.(rowData)?.length ?? 0;
  const individualCount =
    [handleView, handleEdit, hasDelete, handleDuplicar, handleGerarOficio, handleHistorico].filter(
      Boolean,
    ).length + extraAcoesCount;

  if (!disableGrouping && individualCount >= groupingThreshold) {
    const withTestId = (item: MenuItem, suffix: string): MenuItem => ({
      ...item,
      template: (_menuItem, options) =>
        isValidElement<Record<string, unknown>>(options.element)
          ? cloneElement(options.element, {
              id: testId(suffix),
              "data-testid": testId(suffix),
            })
          : options.element,
    });

    const splitModel: MenuItem[] = [];
    if (handleGerarOficio)
      splitModel.push(
        withTestId(
          {
            label: "Gerar Ofício",
            icon: "pi pi-file-export",
            command: () => handleGerarOficio(rowData),
          },
          "gerar-oficio",
        ),
      );
    if (handleEdit)
      splitModel.push(
        withTestId(
          {
            label: "Editar",
            icon: "pi pi-pencil",
            command: () => handleEdit(rowData),
          },
          "editar",
        ),
      );
    if (handleDuplicar)
      splitModel.push(
        withTestId(
          {
            label: "Duplicar",
            icon: "pi pi-copy",
            command: () => handleDuplicar(rowData),
          },
          "duplicar",
        ),
      );

    (extraAcoes?.(rowData) ?? []).forEach((item, index) =>
      splitModel.push(withTestId(item, `extra-${index}-${item.icon}`)),
    );
    if (hasDelete)
      splitModel.push(
        withTestId(
          {
            label: "Excluir",
            icon: "pi pi-trash",
            command: () => onExcluir?.(rowData),
          },
          "excluir",
        ),
      );
    if (handleHistorico)
      splitModel.push(
        withTestId(
          {
            label: "Histórico",
            icon: "pi pi-history",
            command: () => handleHistorico(rowData),
          },
          "historico",
        ),
      );
    const splitButton = (
      <SplitButton
        icon="pi pi-eye"
        onClick={() => handleView?.(rowData)}
        model={splitModel}
        buttonProps={{
          id: testId("visualizar"),
          "data-testid": testId("visualizar"),
        }}
        menuButtonProps={{
          id: testId("split"),
          "data-testid": testId("split"),
        }}
      />
    );

    // Sem `align` o SplitButton continua sendo posicionado pelo `textAlign` da célula.
    if (!align) return splitButton;

    return (
      <div style={{ display: "flex", justifyContent: justifyContentPorAlign[align] }}>
        {splitButton}
      </div>
    );
  }

  return (
    <div
      className={style.compTableDivButtons}
      style={{
        display: "flex",
        gap: "6px",
        justifyContent: justifyContentPorAlign[align ?? "center"],
      }}
    >
      {handleView && (
        <BotaoIconSeplag
          id={testId("visualizar")}
          data-testid={testId("visualizar")}
          type="button"
          tooltip="Visualizar"
          icon="pi pi-eye"
          onClick={() => handleView(rowData)}
        />
      )}
      {handleGerarOficio && (
        <BotaoIconSeplag
          id={testId("gerar-oficio")}
          data-testid={testId("gerar-oficio")}
          type="button"
          tooltip="Gerar Ofício"
          icon="pi pi-file-export"
          onClick={() => handleGerarOficio(rowData)}
        />
      )}
      {handleEdit && (
        <BotaoIconSeplag
          id={testId("editar")}
          data-testid={testId("editar")}
          severity="warning"
          type="button"
          tooltip="Editar"
          icon="pi pi-pencil"
          onClick={() => handleEdit(rowData)}
        />
      )}
      {handleDuplicar && (
        <BotaoIconSeplag
          id={testId("duplicar")}
          data-testid={testId("duplicar")}
          type="button"
          tooltip="Duplicar"
          icon="pi pi-copy"
          onClick={() => handleDuplicar(rowData)}
        />
      )}

      {renderBotoes?.(rowData)}
      {extraAcoes?.(rowData)?.map((item) => (
        <BotaoIconSeplag
          key={`${item.label}-${item.icon}`}
          id={testId(`extra-${item.icon}`)}
          data-testid={testId(`extra-${item.icon}`)}
          type="button"
          tooltip={item.label}
          icon={item.icon}
          onClick={item.command}
        />
      ))}
      {hasDelete && (
        <BotaoIconSeplag
          id={testId("excluir")}
          data-testid={testId("excluir")}
          severity="danger"
          type="button"
          tooltip="Excluir"
          icon="pi pi-trash"
          onClick={() => onExcluir?.(rowData)}
        />
      )}
      {handleHistorico && (
        <BotaoIconSeplag
          id={testId("historico")}
          data-testid={testId("historico")}
          severity="secondary"
          type="button"
          tooltip="Histórico"
          icon="pi pi-history"
          onClick={() => handleHistorico(rowData)}
        />
      )}
    </div>
  );
}
