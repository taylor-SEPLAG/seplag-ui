import { useEffect, useState } from "react";
import { loadFolhaCronogramaState } from "../PrototiposPage";
import { adaptarCronograma, EVENTO_CRONOGRAMA_ATUALIZADO } from "./model";

export function useCronogramaFolha() {
  const [fonte, setFonte] = useState(loadFolhaCronogramaState);
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const atualizar = () => {
      setFonte(loadFolhaCronogramaState());
      setAgora(new Date());
    };
    const storage = (evento: StorageEvent) => {
      if (!evento.key || evento.key === "prototipos.folha.cronograma")
        atualizar();
    };
    window.addEventListener("storage", storage);
    window.addEventListener("focus", atualizar);
    window.addEventListener(EVENTO_CRONOGRAMA_ATUALIZADO, atualizar);
    const timer = window.setInterval(atualizar, 60000);
    return () => {
      window.removeEventListener("storage", storage);
      window.removeEventListener("focus", atualizar);
      window.removeEventListener(EVENTO_CRONOGRAMA_ATUALIZADO, atualizar);
      window.clearInterval(timer);
    };
  }, []);
  return { ...adaptarCronograma(fonte, agora), agora };
}
