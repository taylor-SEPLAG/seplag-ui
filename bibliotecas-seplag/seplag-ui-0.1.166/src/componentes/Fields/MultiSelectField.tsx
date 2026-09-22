import { MultiSelect } from "primereact/multiselect";
import { classNames } from "primereact/utils";
import type { KeyboardEvent } from "react";
import { useMemo } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import { FieldError } from "./FieldError";
import "./MultiSelectField.css";
import type { MultiSelectFieldSeplagProps } from "./types";
import {
  INACTIVE_BADGE_LABEL_DEFAULT,
  INACTIVE_TOAST_MESSAGE_DEFAULT,
  renderOptionLabelWithInactiveBadge,
  sortActiveFirstThenInactive,
  useInactiveSelectionToast,
} from "./utils/inactiveOption";
import {
  ensureErrorNodeId,
  isFieldObrigatorio,
  resolveFieldRules,
} from "./utils/resolveFieldRules";

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function MultiSelectFieldSeplag<T extends FieldValues = any>(
  props: Readonly<MultiSelectFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    visible = true,
    control,
    label = "",
    cols = "12 4",
    options,
    optionValue,
    optionLabel,
    filterFields,
    optionsFiltered,
    optionsDisabled,
    excludeIf,
    isLoading = false,
    dataKey = "id",
    placeholder = "Selecione...",
    display = "comma",
    maxSelectedLabels = 3,
    selectedItemsLabel,
    readOnly = false,
    getFormErrorMessage,
    rules,
    value,
    onChange,
    onBlur,
    onFilter,
    panelScope = "confined",
    uppercase = true,
    truncateOptionLabel = false,
    scrollHeight = "250px",
    emptyFilterMessage = "Nenhum resultado encontrado",
    filterPlaceholder = "Pesquisar...",
    filterMaxLength = 100,
    autoComplete,
    viewMode = false,
    showClear = true,
    readOnlyTooltip = "Clique para visualizar os dados selecionados",
    inactiveBadgeLabel = INACTIVE_BADGE_LABEL_DEFAULT,
    inactiveToastMessage = INACTIVE_TOAST_MESSAGE_DEFAULT,
    sortAlphabetically = true,
    virtualScrollThreshold = 200,
    virtualScrollItemSize = 43,
  } = props;

  const inputId = String(name);
  const errorId = `${inputId}-error`;

  const resolvedRules = resolveFieldRules<T>(label, required, rules);
  const isObrigatorio = isFieldObrigatorio<T>(required, resolvedRules);
  const notifyIfInactive = useInactiveSelectionToast(inactiveToastMessage);
  const bloqueado = disabled || viewMode;
  const effectiveDisplay = readOnly || bloqueado ? "comma" : display;

  // Pré-normaliza o campo de busca uma única vez quando as options mudam.
  // Isso evita rodar Intl.Collator em cada keystroke do filtro (custo alto com 1500+ itens).
  const safeOptions = useMemo(() => {
    const rawList = Array.isArray(options) ? options : [];
    const list = excludeIf ? rawList.filter((item) => !excludeIf(item)) : rawList;
    const searchFields = [optionLabel, ...(filterFields ?? [])];
    const listNormalized = list.map((item) => ({
      ...item,
      _search: normalizar(searchFields.map((field) => String(item[field] ?? "")).join(" ")),
      _label: uppercase
        ? String(item[optionLabel] ?? "").toUpperCase()
        : String(item[optionLabel] ?? ""),
    }));

    const listFiltered =
      optionsFiltered && Array.isArray(optionsFiltered) && optionValue
        ? listNormalized.filter((item) => optionsFiltered.includes(item[optionValue]))
        : listNormalized;

    return sortActiveFirstThenInactive(listFiltered, sortAlphabetically);
  }, [
    options,
    optionValue,
    optionLabel,
    filterFields,
    optionsFiltered,
    excludeIf,
    uppercase,
    sortAlphabetically,
  ]);

  const disabledValuesSet = useMemo(() => {
    if (!optionsDisabled || !Array.isArray(optionsDisabled) || !optionValue) return null;
    return new Set(optionsDisabled);
  }, [optionsDisabled, optionValue]);

  const sanitizeSelection = (novosValores: any[], valoresAtuais: any[]) => {
    if (!disabledValuesSet) return novosValores;

    // Mantém os itens desabilitados que já estavam selecionados
    const itensBloqueadosJaSelecionados = (valoresAtuais ?? []).filter((val) =>
      disabledValuesSet.has(val),
    );

    // Combina os novos valores (que não podem incluir itens desabilitados) com os bloqueados que já estavam lá
    const resultado = new Set([...novosValores, ...itensBloqueadosJaSelecionados]);
    return Array.from(resultado);
  };

  const getVisibleOptions = (valorAtual: any[]) => {
    if (!bloqueado) return safeOptions;
    const selecionadosSet = new Set(valorAtual ?? []);
    return safeOptions.filter((item) => selecionadosSet.has(item[optionValue as string]));
  };

  // VirtualScroller reserva altura fixa mesmo com poucos itens filtrados,
  // então o painel não encolhe. Só ativa para listas realmente grandes,
  // deixando o painel encolher naturalmente (via max-height) nos demais casos.
  const effectiveVirtualScroller = useMemo(
    () =>
      safeOptions.length > virtualScrollThreshold
        ? { itemSize: virtualScrollItemSize, lazy: false }
        : undefined,
    [safeOptions.length, virtualScrollThreshold, virtualScrollItemSize],
  );

  const effectiveScrollHeight = scrollHeight ?? "250px";

  const appendTo = panelScope === "confined" ? "self" : undefined;

  const panelClassName = classNames("seplag-ms-panel", {
    "seplag-ms-panel--confined": panelScope === "confined",
    "seplag-ms-panel--truncate": truncateOptionLabel,
    "seplag-ms-panel--scroll": !truncateOptionLabel,
  });

  const itemTemplate = (option: any) => {
    const text = String(option?.["_label"] ?? "");
    return (
      <>
        <span className="seplag-ms-option" title={text}>
          {renderOptionLabelWithInactiveBadge(text, option, inactiveBadgeLabel)}
        </span>
        <span className="seplag-ms-option-hit" title={text} aria-hidden="true" />
      </>
    );
  };

  // O PrimeReact não expõe `index` no tipo público de pt.item, mas o
  // componente interno (MultiSelectItem) sempre repassa `context.index` em
  // runtime — usamos isso para colocar data-testid/data-index direto no
  // <li> de cada opção, sem precisar de um wrapper extra no itemTemplate.
  const itemPassThrough = {
    item: ({ context }: { context: { index?: number } }) => ({
      "data-testid": context.index !== undefined ? `${inputId}-option-${context.index}` : undefined,
      "data-index": context.index,
    }),
  };

  const selectedItemTemplate = (value: unknown) => {
    if (value === undefined) return null;
    const option = safeOptions.find((item) => item[optionValue as string] === value);
    const text = String(option?.["_label"] ?? "");
    return renderOptionLabelWithInactiveBadge(text, option, inactiveBadgeLabel);
  };

  const notifyNewlyInactiveSelections = (novosValores: any[], valoresAtuais: any[]) => {
    const atuaisSet = new Set(valoresAtuais ?? []);
    const adicionados = (novosValores ?? []).filter((val) => !atuaisSet.has(val));
    adicionados.forEach((val) => {
      notifyIfInactive(safeOptions.find((option) => option[optionValue as string] === val));
    });
  };

  if (!visible) return null;

  function getOptionDisabled(option: Record<string, unknown>): boolean {
    if (bloqueado) return true;
    if (!disabledValuesSet) return false;
    return disabledValuesSet.has(option[optionValue as string] as string | number);
  }

  // O PrimeReact intercepta Home/End no input do filtro para navegar pela
  // lista de opções, impedindo o comportamento nativo de mover/selecionar o
  // cursor de texto. Paramos a propagação na fase de captura para preservar
  // a edição normal do texto digitado.
  const preserveTextNavigationKeys = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.code === "Home" || event.code === "End") {
      event.stopPropagation();
    }
  };

  const sharedProps = {
    dataKey,
    filter: true,
    filterBy: "_search",
    resetFilterOnHide: true,
    filterPlaceholder,
    emptyFilterMessage,
    emptyMessage: "Nenhuma opção disponível",
    selectAllLabel: "Selecionar todos",
    showSelectAll: !bloqueado,
    pt: {
      closeButton: { style: { display: "none" } },
      filterInput: {
        root: {
          maxLength: filterMaxLength,
          autoComplete,
          onKeyDownCapture: preserveTextNavigationKeys,
        },
      },
      ...itemPassThrough,
    },
    virtualScrollerOptions: effectiveVirtualScroller,
    scrollHeight: effectiveScrollHeight,
    appendTo,
    panelClassName,
    itemTemplate,
    selectedItemTemplate: effectiveDisplay === "chip" ? selectedItemTemplate : undefined,
    optionValue,
    optionLabel: "_label",
    optionDisabled: getOptionDisabled,
    loading: isLoading,
    placeholder,
    showClear: showClear && !bloqueado,
    display: effectiveDisplay,
    maxSelectedLabels,
    selectedItemsLabel: selectedItemsLabel ?? "{0} itens selecionados",
  } as const;

  if (!control) {
    const externalError = getFormErrorMessage?.(name);
    const hasExternalError = Boolean(externalError);
    const semItensSelecionados = bloqueado && (value ?? []).length === 0;
    const somenteLeitura = bloqueado && !semItensSelecionados;

    return (
      <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
        <div className="flex flex-column">
          <MultiSelect
            {...sharedProps}
            id={inputId}
            name={inputId}
            data-testid={inputId}
            options={getVisibleOptions(value ?? [])}
            disabled={semItensSelecionados}
            value={value}
            onChange={(e) => {
              if (bloqueado) return;
              notifyNewlyInactiveSelections(e.value, value ?? []);
              onChange?.(sanitizeSelection(e.value, value ?? []));
            }}
            onBlur={onBlur}
            onFilter={(e) => onFilter?.(e.filter)}
            className={classNames("w-full", {
              "p-invalid": hasExternalError,
              "seplag-ms-root--confined": panelScope === "confined",
              "seplag-ms-readonly": somenteLeitura,
            })}
            tooltip={somenteLeitura ? readOnlyTooltip : undefined}
            tooltipOptions={{ position: "top" }}
            aria-invalid={hasExternalError || undefined}
            aria-describedby={hasExternalError ? errorId : undefined}
          />
          {ensureErrorNodeId(externalError, errorId)}
        </div>
      </RotuloSeplag>
    );
  }

  return (
    <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} htmlFor={inputId}>
      <Controller
        name={name}
        control={control}
        rules={resolvedRules}
        render={({ field, fieldState }) => {
          const externalError = getFormErrorMessage?.(field.name);
          const hasExternalError = Boolean(externalError);
          const errorMessage = hasExternalError ? externalError : fieldState.error?.message;
          const semItensSelecionados = bloqueado && (field.value ?? []).length === 0;
          const somenteLeitura = bloqueado && !semItensSelecionados;

          return (
            <div className="flex flex-column">
              <MultiSelect
                {...sharedProps}
                id={field.name}
                name={field.name}
                data-testid={field.name}
                options={getVisibleOptions(field.value ?? [])}
                disabled={semItensSelecionados}
                value={field.value}
                ref={field.ref}
                onChange={(e) => {
                  if (readOnly || bloqueado) return;
                  notifyNewlyInactiveSelections(e.target.value, field.value ?? []);
                  const valoresSanitizados = sanitizeSelection(e.target.value, field.value ?? []);
                  field.onChange(valoresSanitizados);
                  onChange?.(valoresSanitizados);
                }}
                onBlur={() => {
                  field.onBlur();
                  onBlur?.();
                }}
                onFilter={(e) => onFilter?.(e.filter)}
                className={classNames("w-full", {
                  "p-invalid": fieldState.error || hasExternalError,
                  "seplag-ms-root--confined": panelScope === "confined",
                  "seplag-ms-readonly": somenteLeitura,
                })}
                tooltip={somenteLeitura ? readOnlyTooltip : undefined}
                tooltipOptions={{ position: "top" }}
                aria-invalid={Boolean(fieldState.error || hasExternalError) || undefined}
                aria-describedby={errorMessage ? errorId : undefined}
              />
              <FieldError id={errorId}>{errorMessage}</FieldError>
            </div>
          );
        }}
      />
    </RotuloSeplag>
  );
}

export default MultiSelectFieldSeplag;
