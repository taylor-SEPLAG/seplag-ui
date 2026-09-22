import type { Control, FieldValues, Path, RegisterOptions } from "react-hook-form";
import type React from "react";

export interface NumberFieldSeplagProps<T extends FieldValues = any> {
  readonly name: Path<T>;
  readonly control?: Control<T>;
  readonly label?: string;
  readonly cols?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  /**
   * Exibe o valor sem permitir alteração.
   *
   * Diferente de `disabled`, o campo continua focável pelo teclado e é anunciado normalmente
   * por leitores de tela — use quando o valor é informação que o usuário precisa **ler** para
   * decidir o que preencher em outro campo (ex.: a coluna "quantidade atual" ao lado da coluna
   * "a adicionar"). Em ambos os modos o valor permanece no estado do formulário e vai no
   * payload do `handleSubmit`.
   *
   * Quando combinado com `disabled`, `disabled` prevalece.
   *
   * @default false
   */
  readonly readOnly?: boolean;
  /**
   * Renderiza apenas o campo, sem rótulo e sem a classe de grid derivada de `cols`.
   * Repassado ao `RotuloSeplag`. Use dentro de célula de tabela ou grupo inline, onde o
   * rótulo é responsabilidade do contexto.
   *
   * @default false
   */
  readonly semMoldura?: boolean;
  readonly visible?: boolean;
  /**
   * @deprecated Use react-hook-form error handling (`fieldState.error`) ou `rules` instead.
   */
  readonly getFormErrorMessage?: (name: string) => React.ReactNode;
  readonly rules?: RegisterOptions<T, Path<T>>;
  readonly inputStyle?: React.CSSProperties;
  readonly min?: number;
  readonly max?: number;
  /** Número mínimo de casas decimais exibidas. Quando omitido, o campo trata o valor como inteiro. */
  readonly minFractionDigits?: number;
  /** Número máximo de casas decimais permitidas. */
  readonly maxFractionDigits?: number;
  /** Texto exibido antes do valor, ex: "R$ ". */
  readonly prefix?: string;
  /** Texto exibido após o valor, ex: " km". */
  readonly suffix?: string;
  /** Locale de formatação, ex: "pt-BR". */
  readonly locale?: string;
  /** Modo de formatação: "decimal" (padrão) ou "currency". */
  readonly mode?: "decimal" | "currency";
  /** Código ISO 4217 da moeda, ex: "BRL". Obrigatório quando mode="currency". */
  readonly currency?: string;
  readonly placeholder?: string;
  readonly value?: number | null;
  readonly onChange?: (value: number | null | undefined) => void;
  readonly autoComplete?: string;
  /** Máximo de caracteres digitáveis no input — bloqueia a digitação, ao contrário de `max`, que só corrige o valor ao perder o foco. */
  readonly maxLength?: number;
}
