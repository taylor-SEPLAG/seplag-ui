import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";
import type React from "react";

export type SuggestionSeplag<T> = T extends any[] ? T[number] : T;

export interface SearchFieldSeplagProps<TForm extends FieldValues = any, TItem = any> {
  readonly name: Path<TForm>;
  readonly control?: Control<TForm>;
  readonly label?: string;
  readonly cols?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly visible?: boolean;
  /**
   * @deprecated Use react-hook-form error handling (`fieldState.error`) ou `rules` instead.
   */
  readonly getFormErrorMessage?: (name: string) => React.ReactNode;
  readonly rules?: RegisterOptions<TForm, Path<TForm>>;
  readonly minLength: number;
  readonly maxLength?: number;
  readonly fieldLabel?: string;
  readonly items?: SuggestionSeplag<TItem>[];
  readonly search?: (query: string) => void;
  readonly itemTemplate?: (item: TItem) => React.ReactNode;
  readonly onSelect?: (value: TItem) => void;
  readonly forceSelection?: boolean;
  readonly placeholder?: string;
  readonly loading?: boolean;
  readonly value?: any;
  readonly onChange?: (value: any) => void;
  readonly autoComplete?: string;
}
