export interface ErrorTypeSeplag {
  type?: string | number;
  message?: string;
}

export function getErrorMessageInObjectSeplag(
  object: unknown,
  path: string,
): ErrorTypeSeplag | null {
  if (!object || !path) return null;

  const keys = path.split(".");
  let current: any = object;

  for (const key of keys) {
    if (current == null) return null;
    current = current[key];
  }

  return current ?? null;
}
