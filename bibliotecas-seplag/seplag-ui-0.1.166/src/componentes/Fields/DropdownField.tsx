import type { DropdownProps } from "primereact/dropdown";
import { Dropdown } from "primereact/dropdown";
import { classNames } from "primereact/utils";
import { useMemo, useRef, type KeyboardEvent, type MouseEvent } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import RotuloSeplag from "../Rotulo";
import "./DropdownField.css";
import { FieldError } from "./FieldError";
import "./ReadOnlyField.css";
import "./SemMolduraField.css";
import type { DropdownFieldSeplagProps } from "./types";
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

/**
 * Guardas do modo `readOnly`. O Dropdown do PrimeReact não tem `readOnly` nativo, então o
 * comportamento é obtido barrando as duas portas de entrada do componente:
 *
 * - **Mouse:** `_onClick` chama `props.onClick` e desiste se o evento voltar com
 *   `defaultPrevented` — é a saída oficial para não abrir o painel sem desabilitar o campo.
 * - **Teclado:** `onInputKeyDown` fica no input focável interno e abre o painel com qualquer
 *   caractere imprimível (o `default` do switch), não apenas com as teclas de navegação.
 *   Interceptar na fase de captura impede o evento de chegar lá. `stopPropagation` sem
 *   `preventDefault` preserva a ação padrão do Tab, então o campo continua focável.
 */
const PROPS_SOMENTE_LEITURA = {
  onClick: (event: MouseEvent) => event.preventDefault(),
  pt: {
    root: {
      "aria-readonly": true,
      onKeyDownCapture: (event: KeyboardEvent) => event.stopPropagation(),
    },
  },
};

/**
 * Onde o painel de opções é renderizado.
 *
 * Padrão sempre "body" (portalado): qualquer ancestral com `overflow`/`position` restrito
 * (cards, seções de formulário, células de tabela, containers com scroll) recorta ou some com
 * o painel quando ele é ancorado ao próprio campo ("self"). Portalar para `document.body` evita
 * esse corte em qualquer contexto, sem exigir que cada tela passe `appendTo="body"` manualmente.
 *
 * Compara com `undefined` em vez de usar `??` para preservar o `null` explícito, que o PrimeReact
 * interpreta como "usar o alvo global".
 */
function resolverAppendTo(
  informado: DropdownFieldSeplagProps["appendTo"],
  _semMoldura: boolean,
): DropdownFieldSeplagProps["appendTo"] {
  if (informado !== undefined) return informado;
  return "body";
}

export function DropdownFieldSeplag<T extends FieldValues = any>(
  props: Readonly<DropdownFieldSeplagProps<T>>,
) {
  const {
    name,
    required = false,
    disabled = false,
    readOnly = false,
    semMoldura = false,
    visible = true,
    control,
    label = "",
    cols = "12 6",
    options,
    optionLabel,
    optionValue,
    dataKey,
    filterFields,
    optionsDisabled,
    optionsFiltered,
    excludeIf,
    valoresIndisponiveis,
    getFormErrorMessage,
    placeholder = "Selecione...",
    isLoading = false,
    showClear = true,
    rules,
    onChange,
    onBlur,
    onFilter,
    defaultValue,
    filter = true,
    uppercase = true,
    value,
    appendTo: appendToInformado,
    filterMaxLength = 100,
    autoComplete,
    inactiveBadgeLabel = INACTIVE_BADGE_LABEL_DEFAULT,
    inactiveToastMessage = INACTIVE_TOAST_MESSAGE_DEFAULT,
    sortAlphabetically = true,
    virtualScrollThreshold = 200,
    virtualScrollItemSize = 43,
  } = props;

  const inputId = String(name);
  const errorId = `${inputId}-error`;

  const appendTo = resolverAppendTo(appendToInformado, semMoldura);
  const painelPortalado = appendTo !== "self";

  const dropdownRef = useRef<Dropdown>(null);
  const handleFilter: NonNullable<DropdownProps["onFilter"]> = (e) => {
    onFilter?.(e.filter);
  };

  const resolvedRules = resolveFieldRules<T>(label, required, rules);
  const isObrigatorio = isFieldObrigatorio<T>(required, resolvedRules);
  const notifyIfInactive = useInactiveSelectionToast(inactiveToastMessage);

  // `disabled` prevalece: já esmaece e bloqueia por conta própria, sem precisar do readOnly.
  const somenteLeitura = readOnly && !disabled;

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
      optionsFiltered && Array.isArray(optionsFiltered)
        ? listNormalized.filter((item) => optionsFiltered.includes(item[optionValue]))
        : listNormalized;

    return sortActiveFirstThenInactive(listFiltered, sortAlphabetically);
  }, [
    options,
    optionLabel,
    optionValue,
    optionsFiltered,
    excludeIf,
    uppercase,
    sortAlphabetically,
    filterFields,
  ]);

  // VirtualScroller reserva altura fixa (250px) mesmo com poucos itens
  // filtrados, então o painel não encolhe. Só ativa para listas realmente
  // grandes, deixando o painel encolher naturalmente até o max-height do CSS.
  const effectiveVirtualScroller = useMemo(
    () =>
      safeOptions.length > virtualScrollThreshold
        ? { itemSize: virtualScrollItemSize, lazy: false }
        : undefined,
    [safeOptions.length, virtualScrollThreshold, virtualScrollItemSize],
  );

  const scrollHeight = "250px";

  const disabledValuesSet = useMemo(() => {
    if (!optionsDisabled || !Array.isArray(optionsDisabled)) return null;
    return new Set(optionsDisabled);
  }, [optionsDisabled]);

  const indisponiveisSet = useMemo(
    () => (valoresIndisponiveis?.length ? new Set(valoresIndisponiveis) : null),
    [valoresIndisponiveis],
  );

  /**
   * Remove as opções já tomadas por outros campos, **preservando sempre a do valor atual**.
   *
   * A guarda não é opcional: `safeOptions` é a lista de onde o `valueTemplate` procura o
   * rótulo do valor selecionado. Sem a própria opção, ele não acha nada e cai no placeholder
   * — a seleção da linha some da tela, embora continue no formulário.
   *
   * Fica fora do `useMemo` de `safeOptions` porque o valor atual só existe dentro de cada
   * ramo de renderização (`value` no modo controlado, `field.value` no modo react-hook-form).
   */
  const removerIndisponiveis = (valorAtual: unknown) => {
    if (!indisponiveisSet) return safeOptions;
    return safeOptions.filter(
      (opcao) => opcao[optionValue] === valorAtual || !indisponiveisSet.has(opcao[optionValue]),
    );
  };

  const isValueDisabled = (val: any) => disabledValuesSet?.has(val) ?? false;

  const findOptionByValue = (val: unknown) =>
    safeOptions.find((option) => option[optionValue] === val);

  const itemTemplate = (option: any) =>
    renderOptionLabelWithInactiveBadge(String(option?._label ?? ""), option, inactiveBadgeLabel);

  const valueTemplate = (option: any, props: { placeholder?: string }) => {
    if (!option) return props.placeholder;
    return renderOptionLabelWithInactiveBadge(
      String(option?._label ?? ""),
      option,
      inactiveBadgeLabel,
    );
  };

  if (!visible) return null;

  const sharedProps = {
    options: safeOptions,
    // Sem filtro e sem botão de limpar no modo leitura: ambos ofereceriam uma edição que o
    // onChange bloqueado não vai concluir.
    filter: somenteLeitura ? false : filter,
    filterBy: "_search",
    resetFilterOnHide: true,
    filterPlaceholder: "Pesquisar...",
    emptyFilterMessage: "Nenhum resultado encontrado",
    emptyMessage: "Nenhuma opção disponível",
    virtualScrollerOptions: effectiveVirtualScroller,
    scrollHeight,
    optionLabel: "_label",
    optionValue,
    dataKey,
    optionDisabled: disabledValuesSet
      ? (option: any) => disabledValuesSet.has(option[optionValue])
      : undefined,
    itemTemplate,
    valueTemplate,
    placeholder,
    disabled,
    showClear: somenteLeitura ? false : showClear,
    loading: isLoading,
    appendTo: appendTo === "body" ? document.body : appendTo,
    onClick: somenteLeitura ? PROPS_SOMENTE_LEITURA.onClick : undefined,
    pt: {
      filterInput: { root: { maxLength: filterMaxLength, autoComplete } },
      ...(somenteLeitura ? PROPS_SOMENTE_LEITURA.pt : {}),
    },
    panelClassName: painelPortalado
      ? "seplag-dropdown-panel seplag-dropdown-panel--flutuante"
      : "seplag-dropdown-panel",
  } as const;

  if (!control) {
    const externalError = getFormErrorMessage?.(name);
    const hasExternalError = Boolean(externalError);

    return (
      <RotuloSeplag
        nome={label}
        cols={cols}
        obrigatorio={isObrigatorio}
        htmlFor={inputId}
        semMoldura={semMoldura}
      >
        <div className="flex flex-column">
          <Dropdown
            {...sharedProps}
            ref={dropdownRef}
            id={inputId}
            name={inputId}
            data-testid={inputId}
            // Sobrescreve o `options` de `sharedProps`: depende do valor atual do campo.
            options={removerIndisponiveis(value)}
            value={value}
            onChange={(e) => {
              if (somenteLeitura) return;
              if (isValueDisabled(e.value)) return;
              notifyIfInactive(findOptionByValue(e.value));
              onChange?.(e.value);
            }}
            onBlur={onBlur}
            onFilter={handleFilter}
            className={classNames("w-full", {
              "p-invalid": hasExternalError,
              "seplag-field-readonly": somenteLeitura,
              "seplag-field-sem-moldura": semMoldura,
            })}
            aria-invalid={hasExternalError || undefined}
            aria-describedby={hasExternalError ? errorId : undefined}
          />
          {ensureErrorNodeId(externalError, errorId)}
        </div>
      </RotuloSeplag>
    );
  }

  return (
    <RotuloSeplag nome={label} cols={cols} obrigatorio={isObrigatorio} semMoldura={semMoldura}>
      <Controller
        name={name}
        control={control}
        rules={resolvedRules}
        defaultValue={defaultValue}
        render={({ field, fieldState }) => {
          const externalError = getFormErrorMessage?.(field.name);
          const hasExternalError = Boolean(externalError);
          const errorMessage = hasExternalError ? externalError : fieldState.error?.message;

          return (
            <div className="flex flex-column">
              <Dropdown
                {...sharedProps}
                ref={dropdownRef}
                id={field.name}
                name={field.name}
                data-testid={field.name}
                // Sobrescreve o `options` de `sharedProps`: depende do valor atual do campo.
                options={removerIndisponiveis(field.value)}
                value={field.value}
                focusInputRef={field.ref}
                onChange={(e) => {
                  if (somenteLeitura) return;
                  if (isValueDisabled(e.value)) return;
                  notifyIfInactive(findOptionByValue(e.value));
                  field.onChange(e.value);
                  onChange?.(e.value);
                }}
                onBlur={(event) => {
                  field.onBlur();
                  onBlur?.(event);
                }}
                onFilter={handleFilter}
                className={classNames("w-full", {
                  "p-invalid": fieldState.error || hasExternalError,
                  "seplag-field-readonly": somenteLeitura,
                  "seplag-field-sem-moldura": semMoldura,
                })}
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

export default DropdownFieldSeplag;
