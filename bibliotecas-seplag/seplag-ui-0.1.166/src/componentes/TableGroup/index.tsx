import { useEffect, useId, useRef, type ReactNode } from "react";
import { BotaoSeplag } from "../Botao";
import style from "./TableGroup.module.css";

export interface TableGroupHeaderSeplagProps {
  readonly groupId?: string | number;
  readonly children: ReactNode;
  readonly trailing?: ReactNode;
  readonly selected?: boolean;
  readonly indeterminate?: boolean;
  readonly onSelectionChange?: (selected: boolean) => void;
  readonly selectionAriaLabel?: string;
  readonly selectionDisabled?: boolean;
  readonly onToggle?: () => void;
  readonly className?: string;
}

export function TableGroupHeaderSeplag({
  groupId,
  children,
  trailing,
  selected = false,
  indeterminate = false,
  onSelectionChange,
  selectionAriaLabel = "Selecionar grupo",
  selectionDisabled = false,
  onToggle,
  className,
}: Readonly<TableGroupHeaderSeplagProps>) {
  const generatedId = useId();
  const testId = groupId == null ? `table-group-${generatedId}` : `table-group-${groupId}`;
  const checkboxId = `${testId}-checkbox`;
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div className={`${style.header}${className ? ` ${className}` : ""}`}>
      {onSelectionChange && (
        <input
          ref={checkboxRef}
          id={checkboxId}
          data-testid={checkboxId}
          className={style.checkbox}
          type="checkbox"
          checked={selected}
          disabled={selectionDisabled}
          onChange={(event) => onSelectionChange(event.target.checked)}
          aria-label={selectionAriaLabel}
        />
      )}
      {onToggle ? (
        <BotaoSeplag
          unstyled
          type="button"
          id={`${testId}-toggle`}
          data-testid={`${testId}-toggle`}
          className={`${style.toggleSurface} ${style.noRipple}`}
          onClick={onToggle}
        >
          {children}
        </BotaoSeplag>
      ) : (
        <div className={style.content}>{children}</div>
      )}
      {trailing && <div className={style.trailing}>{trailing}</div>}
    </div>
  );
}

export interface TableGroupFooterSeplagProps {
  readonly groupId?: string | number;
  readonly shownRecords: number;
  readonly totalRecords: number;
  readonly onShowAll?: () => void;
  readonly loading?: boolean;
  readonly showAllLabel?: string;
  readonly loadingLabel?: string;
  readonly colSpan?: number;
  readonly className?: string;
}

export function TableGroupFooterSeplag({
  groupId,
  shownRecords,
  totalRecords,
  onShowAll,
  loading = false,
  showAllLabel = "Exibir todos",
  loadingLabel = "Carregando...",
  colSpan,
  className,
}: Readonly<TableGroupFooterSeplagProps>) {
  const hasMore = shownRecords < totalRecords;
  const testId = groupId == null ? "table-group-footer" : `table-group-${groupId}-footer`;

  const content = (
    <div className={style.footer}>
      <span>
        Exibindo {shownRecords} de {totalRecords}
      </span>
      {hasMore && onShowAll && (
        <BotaoSeplag
          unstyled
          type="button"
          id={`${testId}-show-all`}
          data-testid={`${testId}-show-all`}
          className={`${style.showAll} ${style.noRipple}`}
          disabled={loading}
          onClick={onShowAll}
        >
          {loading ? loadingLabel : showAllLabel}
        </BotaoSeplag>
      )}
    </div>
  );

  if (colSpan == null) return content;

  return (
    <td colSpan={colSpan} className={`${style.footerCell}${className ? ` ${className}` : ""}`}>
      {content}
    </td>
  );
}
