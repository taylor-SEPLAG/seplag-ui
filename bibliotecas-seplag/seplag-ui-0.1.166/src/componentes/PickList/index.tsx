import { PickList, type PickListChangeEvent } from "primereact/picklist";
import React from "react";
import RotuloSeplag from "../Rotulo";

export interface PickListSeplagProps<T> {
  name?: string;
  isView?: boolean;
  title: string;
  titleNaoSelecionados?: string;
  titleSelecionados?: string;
  dataKey?: string;
  dataLabel?: string;
  filterBy?: string;
  filterPlaceholder?: string;
  /** Limite de caracteres no campo de busca (ambas as colunas). */
  filterMaxLength?: number;
  naoSelecionados: T[];
  selecionados: T[];
  setNaoSelecionados: (naoSelecionados: T[]) => void;
  setSelecionados: (selecionados: T[]) => void;
  onViewItemTemplate?: (item: T, index: number) => React.ReactNode;
  naoSelecionadosItemTemplate?: (item: T) => React.ReactNode;
  selecionadosItemTemplate?: (item: T) => React.ReactNode;
}

const processLabel = (path: string, obj: unknown): unknown => {
  return path.split(".").reduce<unknown>((prev, curr) => {
    if (!prev || typeof prev !== "object") {
      return undefined;
    }

    return (prev as Record<string, unknown>)[curr];
  }, obj);
};

const getItemKey = (item: unknown, dataKey: string, index: number): React.Key => {
  if (!item || typeof item !== "object") return index;

  const candidate = (item as Record<string, unknown>)[dataKey];
  return typeof candidate === "string" || typeof candidate === "number" ? candidate : index;
};

const getLabelText = (label: unknown): string | undefined => {
  if (label === undefined || label === null || label === "") return undefined;
  if (typeof label === "string") return label;
  if (typeof label === "number" || typeof label === "boolean" || typeof label === "bigint") {
    return String(label);
  }

  return undefined;
};

const PickListSeplagDefaultView = (item: unknown, dataLabel: string) => {
  const labelText = getLabelText(processLabel(dataLabel, item));

  if (!item || !labelText) {
    return <span className="p-2 border-round bg-gray-100">Item inválido</span>;
  }

  return <span className="p-2 border-round bg-gray-100">{labelText}</span>;
};

const PickListSeplagDefaultTemplate = (item: unknown, dataLabel: string) => {
  const labelText = getLabelText(processLabel(dataLabel, item));

  if (!item || !labelText) {
    return (
      <div className="flex align-items-center p-2">
        <div className="flex-1 text-left">Item inválido</div>
      </div>
    );
  }

  return (
    <div className="flex align-items-center p-2">
      <div className="flex-1 text-left">{labelText}</div>
    </div>
  );
};

function PickListSeplag<T>({
  name,
  isView,
  title,
  titleNaoSelecionados = "Não selecionados",
  titleSelecionados = "Selecionados",
  dataKey = "id",
  dataLabel = "descricao",
  filterBy = "descricao",
  filterPlaceholder = "Procurar por descrição",
  filterMaxLength = 100,
  naoSelecionados,
  selecionados,
  setNaoSelecionados,
  setSelecionados,
  naoSelecionadosItemTemplate,
  selecionadosItemTemplate,
  onViewItemTemplate,
}: Readonly<PickListSeplagProps<T>>) {
  const inputId = name ?? "picklist";

  const handleChange = (event: PickListChangeEvent) => {
    setNaoSelecionados(event.source as T[]);
    setSelecionados(event.target as T[]);
  };

  const renderViewItem = (item: T, index: number) => {
    const content = onViewItemTemplate
      ? onViewItemTemplate(item, index)
      : PickListSeplagDefaultView(item, dataLabel);

    const itemKey = getItemKey(item, dataKey, index);

    return (
      <div
        key={itemKey}
        id={`${inputId}-view-${itemKey}`}
        data-testid={`${inputId}-view-${itemKey}`}
      >
        {content}
      </div>
    );
  };

  if (isView) {
    return (
      <RotuloSeplag nome={title} cols="12">
        <div className="flex justify-content-center flex-column w-full p-0">
          <div className="flex flex-column gap-3">
            <div className="flex flex-column gap-2">
              <span className="font-bold">{titleSelecionados}</span>
              <div className="flex flex-wrap gap-2">
                {selecionados.map((item, index) => renderViewItem(item, index))}
              </div>
            </div>
          </div>
        </div>
      </RotuloSeplag>
    );
  }

  return (
    <RotuloSeplag nome={title} cols="12">
      <div className="flex justify-content-center flex-column w-full p-0 mt-2 mb-3">
        <PickList
          id={inputId}
          data-testid={inputId}
          dataKey={dataKey}
          source={naoSelecionados}
          target={selecionados}
          onChange={handleChange}
          sourceItemTemplate={(item: T) => {
            const itemKey = getItemKey(item, dataKey, 0);
            const content = naoSelecionadosItemTemplate
              ? naoSelecionadosItemTemplate(item)
              : PickListSeplagDefaultTemplate(item, dataLabel);

            return (
              <div id={`${inputId}-source-${itemKey}`} data-testid={`${inputId}-source-${itemKey}`}>
                {content}
              </div>
            );
          }}
          targetItemTemplate={(item: T) => {
            const itemKey = getItemKey(item, dataKey, 0);
            const content = selecionadosItemTemplate
              ? selecionadosItemTemplate(item)
              : PickListSeplagDefaultTemplate(item, dataLabel);

            return (
              <div id={`${inputId}-target-${itemKey}`} data-testid={`${inputId}-target-${itemKey}`}>
                {content}
              </div>
            );
          }}
          filter
          filterBy={filterBy}
          breakpoint="960px"
          sourceHeader={titleNaoSelecionados}
          targetHeader={titleSelecionados}
          showSourceControls={false}
          showTargetControls={false}
          sourceStyle={{ height: "24rem" }}
          targetStyle={{ height: "24rem" }}
          sourceFilterPlaceholder={filterPlaceholder}
          targetFilterPlaceholder={filterPlaceholder}
          className="w-full"
          autoOptionFocus={false}
          pt={{ filterInput: { maxLength: filterMaxLength } }}
        />
      </div>
    </RotuloSeplag>
  );
}

export { PickListSeplag };
