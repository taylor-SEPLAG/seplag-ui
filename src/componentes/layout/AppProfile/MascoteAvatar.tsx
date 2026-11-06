import piscada from "../../../assets/img/sigep-mascotes-piscada.png";
import { useEffect, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import capivara from "../../../assets/img/SIGEP_Capivara_fiel.png";
import onca from "../../../assets/img/SIGEP_Onca_fiel.png";
import tatu from "../../../assets/img/SIGEP_Tatu_fiel.png";
import {
  avancarMascote,
  assinarMascote,
  obterMascote,
  registrarRotaMascote,
} from "./mascoteStore";
import "./mascoteAvatar.css";
const imagens = [capivara, onca, tatu];
function QuadroMascote({
  indice,
  className,
}: {
  indice: number;
  className: string;
}) {
  return (
    <span className={`sigep-mascote-quadro ${className}`}>
      <img src={imagens[indice]} alt="" />
      <span
        className="sigep-mascote-piscada"
        style={{
          backgroundImage: `url(${piscada})`,
          backgroundPositionY: `${indice * 50}%`,
        }}
      />
    </span>
  );
}
export function MascoteAvatar({ mascote }: { mascote?: "capivara" | "onca" }) {
  const location = useLocation();
  const estado = useSyncExternalStore(
    assinarMascote,
    obterMascote,
    obterMascote,
  );
  useEffect(() => {
    if (!mascote)
      registrarRotaMascote(location.pathname + location.search + location.hash);
  }, [location.pathname, location.search, location.hash, mascote]);
  useEffect(() => {
    imagens.forEach((src) => {
      const imagem = new Image();
      imagem.src = src;
    });
    if (mascote) return;
    const submenu = (event: MouseEvent) => {
      const alvo =
        event.target instanceof Element
          ? event.target.closest(".layout-menu a")
          : null;
      if (
        !alvo ||
        alvo.getAttribute("aria-disabled") === "true" ||
        alvo.closest(".disabled, .p-disabled")
      )
        return;
      const href = alvo.getAttribute("href");
      if (!href || href === "#") avancarMascote();
    };
    document.addEventListener("click", submenu);
    return () => document.removeEventListener("click", submenu);
  }, [mascote]);
  if (mascote)
    return (
      <span className="sigep-mascote-avatar" aria-hidden="true">
        <span key={mascote} className="sigep-mascote-transicao">
          <QuadroMascote
            className="sigep-mascote-atual"
            indice={mascote === "onca" ? 1 : 0}
          />
        </span>
      </span>
    );
  return (
    <span className="sigep-mascote-avatar" aria-hidden="true">
      <span
        key={estado.revisao}
        className={estado.revisao ? "sigep-mascote-transicao" : ""}
      >
        {estado.revisao > 0 && (
          <QuadroMascote
            className="sigep-mascote-anterior"
            indice={estado.anterior}
          />
        )}
        <QuadroMascote className="sigep-mascote-atual" indice={estado.indice} />
      </span>
    </span>
  );
}
