function readStorage<T>(key: string): T | null {
  try {
    const raw = globalThis.window?.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    globalThis.window?.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage indisponível (modo privado, quota excedida etc.) — ignora silenciosamente.
  }
}

export interface FilterStorageStateSeplag<TFilters> {
  readonly filters: TFilters;
  readonly page: number;
  readonly rows: number;
}

export function loadFilterStorageSeplag<TFilters>(
  storageKey: string,
): FilterStorageStateSeplag<TFilters> | null {
  return readStorage<FilterStorageStateSeplag<TFilters>>(storageKey);
}

export function saveFilterStorageSeplag<TFilters>(
  storageKey: string,
  state: FilterStorageStateSeplag<TFilters>,
): void {
  writeStorage(storageKey, state);
}

export function clearFilterStorageSeplag(storageKey: string): void {
  try {
    globalThis.window?.localStorage.removeItem(storageKey);
  } catch {
    // localStorage indisponível — ignora silenciosamente.
  }
}
