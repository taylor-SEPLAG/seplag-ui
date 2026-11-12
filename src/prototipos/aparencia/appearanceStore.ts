import { useSyncExternalStore } from "react";
export const SIGEP_APPEARANCE_OPTIONS = [
  { value: "padrao", icon: "\u2600\ufe0f", label: "Padr\u00e3o" },
  { value: "natal", icon: "\ud83c\udf84", label: "Modo Natalino" },
  { value: "noturno", icon: "\ud83c\udf19", label: "Modo Noturno" },
  { value: "reveillon", icon: "\u2728", label: "Modo R\u00e9veillon" },
] as const;
export type SigepAppearance = typeof SIGEP_APPEARANCE_OPTIONS[number]["value"];
export const APPEARANCE_KEY = "sigep:aparencia";
const eventName = "sigep:aparencia-alterada";
function getAppearance(): SigepAppearance {
  try {
    const saved = localStorage.getItem(APPEARANCE_KEY);
    return SIGEP_APPEARANCE_OPTIONS.some(option => option.value === saved) ? saved as SigepAppearance : "padrao";
  }
  catch { return "padrao"; }
}
let memoryAppearance: SigepAppearance | null = null;
function snapshot() { return memoryAppearance ?? getAppearance(); }
function subscribe(listener: () => void) {
  const storage = (event: StorageEvent) => { if(event.key === APPEARANCE_KEY || event.key === null) { memoryAppearance = null; listener(); } };
  window.addEventListener(eventName, listener);
  window.addEventListener("storage", storage);
  return () => { window.removeEventListener(eventName, listener); window.removeEventListener("storage", storage); };
}
export function setSigepAppearance(value: SigepAppearance) {
  memoryAppearance = value;
  try { localStorage.setItem(APPEARANCE_KEY, value); memoryAppearance = null; } catch { /* Keeps the selection for this session when storage is unavailable. */ }
  window.dispatchEvent(new Event(eventName));
}
export function useSigepAppearance() { return useSyncExternalStore(subscribe, snapshot, () => "padrao" as const); }
