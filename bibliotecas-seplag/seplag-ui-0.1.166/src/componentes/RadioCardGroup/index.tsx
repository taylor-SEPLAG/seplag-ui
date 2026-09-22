import type { CSSProperties, ReactNode } from "react";
import styles from "./RadioCardGroup.module.css";

export interface RadioCardOptionSeplag<T> {
  readonly value: T;
  readonly label: ReactNode;
  readonly descricao?: ReactNode;
  readonly icon?: string;
  readonly color?: string;
  readonly colorBg?: string;
  readonly colorBorder?: string;
}

export interface RadioCardGroupSeplagProps<T> {
  readonly options: ReadonlyArray<RadioCardOptionSeplag<T>>;
  readonly value?: T;
  readonly onChange: (value: T) => void;
  readonly getKey?: (option: RadioCardOptionSeplag<T>) => string | number;
  readonly className?: string;
}

/**
 * Grupo de cartões clicáveis usados como seleção única (ex.: escolher o tipo de um registro
 * antes de abrir o formulário de cadastro). Cada opção pode ter cor de destaque, ícone e uma
 * descrição curta abaixo do rótulo.
 */
export function RadioCardGroupSeplag<T>({
  options,
  value,
  onChange,
  getKey,
  className,
}: RadioCardGroupSeplagProps<T>) {
  return (
    <div className={`${styles.radioCardGroup} ${className ?? ""}`}>
      {options.map((option) => {
        const selecionado = value !== undefined && value === option.value;
        return (
          <button
            key={getKey ? getKey(option) : String(option.value)}
            type="button"
            className={`${styles.radioCard} ${selecionado ? styles.radioCardSelected : ""}`}
            style={
              {
                "--accent-color": option.color,
                "--accent-bg": option.colorBg,
                "--accent-border": option.colorBorder,
              } as CSSProperties
            }
            aria-pressed={selecionado}
            onClick={() => onChange(option.value)}
          >
            {option.icon && (
              <span className={styles.radioCardIcon}>
                <i className={option.icon} aria-hidden="true" />
              </span>
            )}
            <span className={styles.radioCardText}>
              <strong>{option.label}</strong>
              {option.descricao && <small>{option.descricao}</small>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default RadioCardGroupSeplag;
