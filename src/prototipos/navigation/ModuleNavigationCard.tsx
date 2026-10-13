import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { hasPermissionByKeysSeplag } from "../../componentes/layout/Config/menu";
import { estiloCorModulo } from "../coresModulos";
import "./moduleNavigation.css";

export interface ModuleNavigationCardProps {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  modulo?: string;
  cor?: string;
  destino?: string;
  disponivel?: boolean;
  permissionKeys?: string[] | null;
  permissoes?: string[] | null;
  horizontal?: boolean;
  tituloNivel?: "h2" | "h3";
  textoAcao?: string;
  className?: string;
}

/** Card único para seleção de módulos e funcionalidades; não representa dados operacionais. */
export function ModuleNavigationCard({
  id,
  titulo,
  descricao,
  icone,
  modulo,
  cor,
  destino,
  disponivel = true,
  permissionKeys,
  permissoes,
  horizontal = false,
  tituloNivel = "h2",
  textoAcao = "Acessar",
  className = "",
}: Readonly<ModuleNavigationCardProps>) {
  if (permissionKeys && !hasPermissionByKeysSeplag(permissionKeys, permissoes))
    return null;
  const habilitado = disponivel && !!destino;
  const Titulo = tituloNivel;
  const estilo = {
    ...estiloCorModulo(modulo ?? titulo),
    ...(cor ? { "--sigep-cor-modulo": cor } : {}),
  } as CSSProperties;
  const classe =
    `sigep-module-navigation-card${horizontal ? " sigep-module-navigation-card--horizontal" : ""} ${className}`.trim();
  const conteudo = (
    <>
      <span className="sigep-module-navigation-icon">
        <i className={icone} aria-hidden="true" />
      </span>
      <div className="sigep-module-navigation-body">
        <Titulo>{titulo}</Titulo>
        <p>{descricao}</p>
        <span className="sigep-module-navigation-action">
          {habilitado ? (
            <>
              {textoAcao} <i className="pi pi-arrow-right" aria-hidden="true" />
            </>
          ) : (
            "Em definição"
          )}
        </span>
      </div>
    </>
  );
  return habilitado ? (
    <Link
      to={destino!}
      className={classe}
      style={estilo}
      data-module-id={id}
      aria-label={`${textoAcao} ${titulo}`}
    >
      {conteudo}
    </Link>
  ) : (
    <article
      className={classe}
      style={estilo}
      data-module-id={id}
      aria-disabled="true"
    >
      {conteudo}
    </article>
  );
}
