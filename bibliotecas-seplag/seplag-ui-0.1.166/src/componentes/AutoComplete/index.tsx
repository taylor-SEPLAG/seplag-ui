import { AutoComplete, type AutoCompleteProps } from "primereact/autocomplete";
import { classNames } from "primereact/utils";
import * as React from "react";
import { BotaoSeplag } from "../Botao";
import style from "./AutoComplete.module.css";

type AutoCompleteSeplagVisualSize = "sm" | "md" | "lg";

const INPUT_SIZE_CLASS: Record<AutoCompleteSeplagVisualSize, string | undefined> = {
  sm: "p-inputtext-sm",
  md: undefined,
  lg: "p-inputtext-lg",
};

const DROPDOWN_BUTTON_SIZE_CLASS: Record<AutoCompleteSeplagVisualSize, string | undefined> = {
  sm: "p-button-sm",
  md: undefined,
  lg: "p-button-lg",
};

type AutoCompleteSeplagChangeEvent<T = any, M extends boolean = false> = Parameters<
  NonNullable<AutoCompleteProps<T, M>["onChange"]>
>[0];

export interface AutoCompleteSeplagProps<T = any, M extends boolean = false> extends Omit<
  AutoCompleteProps<T, M>,
  "completeMethod"
> {
  completeMethod?: (query: string) => void | Promise<void>;
  ShowClearSelection?: boolean;
  componentSize?: AutoCompleteSeplagVisualSize;
  helpText?: React.ReactNode;
  minWidth?: React.CSSProperties["minWidth"];
  maxRenderedItems?: number;
}

type AutoCompleteSeplagComponent = <T = any, M extends boolean = false>(
  props: Readonly<AutoCompleteSeplagProps<T, M>> & React.RefAttributes<AutoComplete>,
) => React.JSX.Element;

function AutoCompleteSeplagRender<T = any, M extends boolean = false>(
  {
    completeMethod,
    ShowClearSelection = false,
    componentSize = "md",
    helpText,
    maxRenderedItems = 50,
    minWidth,
    onChange,
    ...props
  }: Readonly<AutoCompleteSeplagProps<T, M>>,
  ref: React.ForwardedRef<AutoComplete>,
) {
  const autoCompleteRef = React.useRef<AutoComplete | null>(null);
  const [focused, setFocused] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);
  const hasFullWidthClass = props.className?.split(" ").includes("w-full");
  const resolvedMaxRenderedItems = Math.max(0, maxRenderedItems);
  const resolvedShowEmptyMessage = props.showEmptyMessage ?? true;
  const resolvedEmptyMessage = props.emptyMessage ?? "Nenhum item encontrado";
  const inputSizeClass = INPUT_SIZE_CLASS[componentSize];
  const dropdownButtonSizeClass = DROPDOWN_BUTTON_SIZE_CLASS[componentSize];
  const hasSelectedObjectValue =
    !props.multiple && typeof props.value === "object" && props.value !== null;
  const shouldShowClearSelection = ShowClearSelection && hasSelectedObjectValue && !props.disabled;
  const limitedSuggestions = props.suggestions?.slice(0, resolvedMaxRenderedItems);
  const wrapperWidth = props.style?.width ?? (hasFullWidthClass ? "100%" : undefined);
  const clearSelectionId = props.inputId ?? props.id ?? props.name ?? "seplag-autocomplete";
  const queryValue = !props.multiple && typeof props.value === "string" ? props.value.trim() : "";
  const shouldShowEmptyState = resolvedShowEmptyMessage && hasSearched && !hasSelectedObjectValue;
  const shouldOpenOverlay =
    focused &&
    !props.disabled &&
    queryValue.length >= (props.minLength ?? 0) &&
    ((limitedSuggestions?.length ?? 0) > 0 || shouldShowEmptyState);

  React.useEffect(() => {
    if (!autoCompleteRef.current) {
      return;
    }

    if (shouldOpenOverlay) {
      autoCompleteRef.current.show();
    }
  }, [shouldOpenOverlay, limitedSuggestions]);

  const setAutoCompleteRef = React.useCallback(
    (instance: AutoComplete | null) => {
      autoCompleteRef.current = instance;

      if (typeof ref === "function") {
        ref(instance);
        return;
      }

      if (ref) {
        ref.current = instance;
      }
    },
    [ref],
  );

  const emitChange = (event: AutoCompleteSeplagChangeEvent<T, M>) => {
    onChange?.(event);
  };

  const handleChange: AutoCompleteProps<T, M>["onChange"] = (event) => {
    if (!props.multiple && typeof event.value === "string" && event.value.trim().length === 0) {
      setHasSearched(false);
    }

    emitChange(event);
  };

  const handleComplete: AutoCompleteProps<T, M>["completeMethod"] = (event) => {
    setHasSearched(true);
    void completeMethod?.(event.query);
  };

  const handleFocus: AutoCompleteProps<T, M>["onFocus"] = (event) => {
    setFocused(true);
    props.onFocus?.(event);
  };

  const handleBlur: AutoCompleteProps<T, M>["onBlur"] = (event) => {
    setFocused(false);
    props.onBlur?.(event);
  };

  const handleSelect: AutoCompleteProps<T, M>["onSelect"] = (event) => {
    setHasSearched(false);
    props.onSelect?.(event);
  };

  const handleClearSelection = (event: React.MouseEvent<HTMLButtonElement>) => {
    const clearedValue = null as any;

    emitChange({
      originalEvent: event,
      value: clearedValue,
      stopPropagation: () => event.stopPropagation(),
      preventDefault: () => event.preventDefault(),
      target: {
        name: props.name ?? "",
        id: props.inputId ?? props.id ?? "",
        value: clearedValue,
      },
    });

    props.onClear?.(event);
  };

  return (
    <div
      style={{
        display: wrapperWidth ? "block" : "inline-flex",
        flexDirection: "column",
        width: wrapperWidth,
        minWidth: minWidth ?? props.style?.minWidth,
      }}
    >
      <span
        style={{
          position: "relative",
          display: wrapperWidth ? "block" : "inline-flex",
          width: wrapperWidth,
          minWidth: minWidth ?? props.style?.minWidth,
        }}
      >
        <AutoComplete
          ref={setAutoCompleteRef}
          {...(props as AutoCompleteProps<any, any>)}
          className={classNames(props.className, inputSizeClass)}
          delay={props.delay ?? 0}
          minLength={props.minLength ?? 0}
          suggestions={limitedSuggestions}
          showEmptyMessage={shouldShowEmptyState}
          emptyMessage={resolvedEmptyMessage}
          style={{
            ...props.style,
            minWidth: minWidth ?? props.style?.minWidth,
            width: wrapperWidth ?? props.style?.width,
          }}
          dropdownIcon={props.dropdownIcon ?? "pi pi-search"}
          pt={{
            ...props.pt,
            dropdownButton: {
              ...props.pt?.dropdownButton,
              root: {
                ...(typeof props.pt?.dropdownButton?.root === "object"
                  ? props.pt.dropdownButton.root
                  : undefined),
                className: classNames(
                  typeof props.pt?.dropdownButton?.root === "object"
                    ? props.pt.dropdownButton.root?.className
                    : undefined,
                  dropdownButtonSizeClass,
                ),
              },
            },
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSelect={handleSelect}
          onChange={handleChange}
          completeMethod={handleComplete}
        />
        {shouldShowClearSelection && (
          <BotaoSeplag
            unstyled
            type="button"
            id={`${clearSelectionId}-limpar`}
            data-testid={`${clearSelectionId}-limpar`}
            className={style.noRipple}
            aria-label="Limpar seleção"
            title="Limpar seleção"
            onClick={handleClearSelection}
            style={{
              position: "absolute",
              margin: "auto 0px",
              right: "2.75rem",
              bottom: "calc(50% - 0.5rem)",
              width: "1rem",
              height: "1rem",
              padding: "0px",
              border: "0px",
              background: "transparent",
              color: "rgb(107, 114, 128)",
              cursor: "pointer",
              zIndex: 1,
            }}
          >
            <i className="pi pi-times" style={{ fontSize: "0.875rem" }} />
          </BotaoSeplag>
        )}
      </span>

      {helpText ? <small className="text-600 mt-2 block">{helpText}</small> : null}
    </div>
  );
}

const ForwardedAutoCompleteSeplag = React.forwardRef(AutoCompleteSeplagRender);

ForwardedAutoCompleteSeplag.displayName = "AutoCompleteSeplag";

export const AutoCompleteSeplag = ForwardedAutoCompleteSeplag as AutoCompleteSeplagComponent;

export default AutoCompleteSeplag;
