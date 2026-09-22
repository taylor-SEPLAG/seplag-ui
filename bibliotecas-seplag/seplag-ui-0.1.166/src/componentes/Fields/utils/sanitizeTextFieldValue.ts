export interface SanitizeTextFieldValueOptions {
  readonly numbersOnly?: boolean;
  readonly noSpaces?: boolean;
  readonly allowMoreThanOneSpace?: boolean;
  readonly allowNumberLetter?: boolean;
}

export function sanitizeTextFieldValueSeplag(
  rawValue: string,
  options: SanitizeTextFieldValueOptions,
): string {
  const {
    numbersOnly = false,
    noSpaces = false,
    allowMoreThanOneSpace = false,
    allowNumberLetter = false,
  } = options;

  if (numbersOnly) {
    return rawValue.replaceAll(/\D/g, "");
  }

  if (noSpaces) {
    return rawValue.replaceAll(/\s/g, "");
  }

  if (allowNumberLetter) {
    return rawValue.replaceAll(/[^A-Za-z0-9]/g, "");
  }

  if (!allowMoreThanOneSpace) {
    return rawValue.replaceAll(/\s+/g, " ");
  }

  return rawValue;
}
