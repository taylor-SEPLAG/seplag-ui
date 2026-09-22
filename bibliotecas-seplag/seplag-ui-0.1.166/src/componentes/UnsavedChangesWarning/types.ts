export interface UnsavedChangesContextValueSeplag {
  setDirty: (dirty: boolean) => void;
  registerDirty: (key: symbol, dirty: boolean) => void;
  onDiscard: (callback: () => void) => () => void;
  guard: (action: () => void) => void;
}
