import { useMemo, useSyncExternalStore } from "react";

export const CHAVE_PESOS_ABRANGENCIAS = "sigep:pesos-abrangencias:v1";
const eventoAlteracao = "sigep:pesos-abrangencias:alterados";

export type VersaoPesosAbrangencia = {
  numero: number;
  inicio: string;
  fim: string | null;
  pesos: number[];
};

export const versaoPesosEstaAtiva = (versao: VersaoPesosAbrangencia) =>
  !versao.fim || new Date(versao.fim).getTime() > Date.now();

export function carregarVersoesPesosAbrangencia(
  serializado: string | null = localStorage.getItem(CHAVE_PESOS_ABRANGENCIAS),
): VersaoPesosAbrangencia[] {
  const dados: unknown = JSON.parse(serializado ?? "[]");
  if (
    !Array.isArray(dados) ||
    !dados.every(
      (v) =>
        v &&
        Number.isInteger(v.numero) &&
        typeof v.inicio === "string" &&
        (v.fim === null || typeof v.fim === "string") &&
        Array.isArray(v.pesos) &&
        [5, 6].includes(v.pesos.length) &&
        v.pesos.every(
          (peso: unknown) =>
            typeof peso === "number" && Number.isFinite(peso) && peso >= 0,
        ),
    )
  ) {
    throw new Error("Dados inválidos");
  }
  return dados;
}

export function salvarVersoesPesosAbrangencia(
  versoes: VersaoPesosAbrangencia[],
) {
  localStorage.setItem(CHAVE_PESOS_ABRANGENCIAS, JSON.stringify(versoes));
  window.dispatchEvent(new Event(eventoAlteracao));
}

function snapshot() {
  try {
    return localStorage.getItem(CHAVE_PESOS_ABRANGENCIAS);
  } catch {
    return null;
  }
}

function assinar(atualizar: () => void) {
  const aoAlterarArmazenamento = (evento: StorageEvent) => {
    if (!evento.key || evento.key === CHAVE_PESOS_ABRANGENCIAS) atualizar();
  };
  window.addEventListener("storage", aoAlterarArmazenamento);
  window.addEventListener("focus", atualizar);
  window.addEventListener(eventoAlteracao, atualizar);
  return () => {
    window.removeEventListener("storage", aoAlterarArmazenamento);
    window.removeEventListener("focus", atualizar);
    window.removeEventListener(eventoAlteracao, atualizar);
  };
}

export function useVersaoPesosAbrangenciaAtiva() {
  const serializado = useSyncExternalStore(assinar, snapshot, () => null);
  return useMemo(() => {
    try {
      return carregarVersoesPesosAbrangencia(serializado).find(
        versaoPesosEstaAtiva,
      );
    } catch {
      return undefined;
    }
  }, [serializado]);
}
