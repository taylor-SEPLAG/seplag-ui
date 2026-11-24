import { useEffect, useState } from "react";
import { listarCiclos, type CicloCronograma } from "./ciclosRepository";
import { EVENTO_CRONOGRAMA_ATUALIZADO } from "./model";
export function useCiclos() {
  const [ciclos, setCiclos] = useState<CicloCronograma[]>([]),
    [carregando, setCarregando] = useState(true),
    [erro, setErro] = useState("");
  useEffect(() => {
    let ativo = true,
      versao = 0;
    const atualizar = () => {
      const atual = ++versao;
      listarCiclos()
        .then((v) => {
          if (ativo && atual === versao) {
            setCiclos(v);
            setErro("");
          }
        })
        .catch((e) => {
          if (ativo && atual === versao)
            setErro(
              e instanceof Error
                ? e.message
                : "Não foi possível consultar os ciclos.",
            );
        })
        .finally(() => {
          if (ativo && atual === versao) setCarregando(false);
        });
    };
    atualizar();
    window.addEventListener(EVENTO_CRONOGRAMA_ATUALIZADO, atualizar);
    window.addEventListener("focus", atualizar);
    const canal =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel("sigep-cronograma-ciclos")
        : null;
    if (canal) canal.onmessage = atualizar;
    const notificar = () => canal?.postMessage("atualizado");
    window.addEventListener(EVENTO_CRONOGRAMA_ATUALIZADO, notificar);
    return () => {
      ativo = false;
      window.removeEventListener(EVENTO_CRONOGRAMA_ATUALIZADO, atualizar);
      window.removeEventListener(EVENTO_CRONOGRAMA_ATUALIZADO, notificar);
      window.removeEventListener("focus", atualizar);
      canal?.close();
    };
  }, []);
  return { ciclos, carregando, erro };
}
