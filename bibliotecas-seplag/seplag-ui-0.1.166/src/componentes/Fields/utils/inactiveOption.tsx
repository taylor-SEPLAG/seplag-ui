import { useToastSeplag } from "../../../hooks/toast/useToast";
import { BadgeSeplag, type BadgeSeplagProps } from "../../Badge";

export const INACTIVE_BADGE_LABEL_DEFAULT = "Inativo";
export const INACTIVE_TOAST_MESSAGE_DEFAULT = "Este registro está inativo.";

export function isOptionInactive(option: Record<string, unknown> | undefined | null): boolean {
  return Boolean(option?.inactive);
}

export function isOptionFlagged(
  option: (Record<string, unknown> & OptionBadgeProps) | undefined | null,
): boolean {
  if (!option) return false;
  return isOptionInactive(option) || Boolean(option.badgeLabel || option.badgeVariant);
}

export interface OptionBadgeProps {
  badgeLabel?: string;
  /** Variante semântica de cor. @default "error" quando `inactive=true` */
  badgeVariant?: BadgeSeplagProps["variant"];
  badgeColor?: string;
  badgeBg?: string;
  badgeBorder?: string;
  badgeToastMessage?: string;
  /**
   * Suprime o toast de aviso ao selecionar esta opção. Use em badges puramente informativos
   * (ex.: "TCE-MT" indicando a origem do registro) que não representam um estado de
   * inatividade/atenção — diferente do badge padrão (`inactive` ou `badgeLabel` sem esta flag),
   * que sempre notifica o usuário ao selecionar.
   */
  badgeSemToast?: boolean;
  /**
   * Mantém esta opção junto das demais na ordenação geral, em vez de agrupá-la ao final da
   * lista (comportamento padrão para toda opção com badge). Use em badges puramente
   * informativos (ex.: "TCE-MT" indicando a origem do registro) que não representam um estado
   * de inatividade/atenção.
   */
  badgeSemAgrupamento?: boolean;
  /** Texto exibido ao passar o mouse sobre o badge. */
  badgeTooltip?: string;
}

export function getOptionBadgeProps(
  option: (Record<string, unknown> & OptionBadgeProps) | undefined | null,
  inactiveBadgeLabel: string = INACTIVE_BADGE_LABEL_DEFAULT,
):
  | (Required<Pick<OptionBadgeProps, "badgeLabel" | "badgeVariant">> &
      Pick<OptionBadgeProps, "badgeColor" | "badgeBg" | "badgeBorder" | "badgeTooltip">)
  | null {
  if (!option) return null;

  const hasCustomBadge = Boolean(option.badgeLabel || option.badgeVariant);
  if (!hasCustomBadge && !isOptionInactive(option)) return null;

  return {
    badgeLabel: option.badgeLabel ?? inactiveBadgeLabel,
    badgeVariant: option.badgeVariant ?? "error",
    badgeColor: option.badgeColor,
    badgeBg: option.badgeBg,
    badgeBorder: option.badgeBorder,
    badgeTooltip: option.badgeTooltip,
  };
}

export function renderOptionLabelWithInactiveBadge(
  label: string,
  option: (Record<string, unknown> & OptionBadgeProps) | undefined | null,
  inactiveBadgeLabel: string = INACTIVE_BADGE_LABEL_DEFAULT,
) {
  const badgeProps = getOptionBadgeProps(option, inactiveBadgeLabel);
  if (!badgeProps) return label;

  return (
    <span
      className="seplag-option-inactive-wrapper"
      data-testid="option-inactive-wrapper"
      title={label}
    >
      <span className="seplag-option-inactive-label">{label}</span>
      <BadgeSeplag
        label={badgeProps.badgeLabel}
        variant={badgeProps.badgeVariant}
        color={badgeProps.badgeColor}
        bg={badgeProps.badgeBg}
        border={badgeProps.badgeBorder}
        tooltip={badgeProps.badgeTooltip}
        size="xs"
        minWidth={0}
        capitalize={false}
      />
    </span>
  );
}

function compareByLabel<T extends Record<string, unknown>>(a: T, b: T): number {
  const labelA = typeof a._label === "string" ? a._label : "";
  const labelB = typeof b._label === "string" ? b._label : "";
  return labelA.localeCompare(labelB);
}

export function sortActiveFirstThenInactive<T extends Record<string, unknown> & OptionBadgeProps>(
  list: T[],
  alphabetical: boolean = true,
): T[] {
  const active: T[] = [];
  const flagged: T[] = [];

  for (const item of list) {
    if (isOptionFlagged(item) && !item.badgeSemAgrupamento) {
      flagged.push(item);
    } else {
      active.push(item);
    }
  }

  if (alphabetical) {
    active.sort(compareByLabel);
    flagged.sort(compareByLabel);
  }

  return [...active, ...flagged];
}

export function useInactiveSelectionToast(
  inactiveToastMessage: string = INACTIVE_TOAST_MESSAGE_DEFAULT,
) {
  const { toastAtencao } = useToastSeplag();

  return function notifyIfInactive(
    option: (Record<string, unknown> & OptionBadgeProps) | undefined | null,
  ) {
    if (option?.badgeSemToast) return;
    if (isOptionFlagged(option)) {
      toastAtencao(option?.badgeToastMessage ?? inactiveToastMessage);
    }
  };
}
