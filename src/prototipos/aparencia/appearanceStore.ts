import { useSyncExternalStore } from "react";
export type SigepAppearance = "padrao" | "natal";
export const APPEARANCE_KEY = "sigep:aparencia";
const eventName = "sigep:aparencia-alterada";
function getAppearance(): SigepAppearance {
  try { return localStorage.getItem(APPEARANCE_KEY) === "natal" ? "natal" : "padrao"; }
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
