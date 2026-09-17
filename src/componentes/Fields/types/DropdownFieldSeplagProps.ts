import type { FieldValues, RegisterOptions } from "react-hook-form";
import type { ReactNode } from "react";
import type { FormFieldSeplagProps } from "./FormFieldSeplagProps";

export interface DropdownFieldSeplagProps<
  T extends FieldValues = any,
> extends FormFieldSeplagProps<T> {
  readonly options: any[];
  readonly optionLabel: string;
  readonly optionValue: string;
  readonly placeholder?: string;
  readonly isLoading?: boolean;
  readonly showClear?: boolean;
  readonly rules?: RegisterOptions;
  readonly onChange?: (value: any) => void;
  readonly defaultValue?: any;
  readonly filter?: boolean;
  /** Nomes de propriedades do objeto de cada opção a considerar na busca do filtro (ex.:
   * "label,matricula"), além do optionLabel — repassado direto para o Dropdown do PrimeReact. */
  readonly filterBy?: string;
  readonly virtualScrollerOptions?: any;
  readonly optionDisabled?: string | ((option: any) => boolean);
  readonly itemTemplate?: (option: any) => ReactNode;
  readonly panelClassName?: string;
}
