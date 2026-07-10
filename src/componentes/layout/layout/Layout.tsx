import "./Layout.css";
import React, { useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { AppTopbarSeplag } from "../AppTopbar";
import { AppFooterSeplag } from "../AppFooter/AppFooter";
import { AppMenuSeplag } from "../AppMenu/AppMenu";
import { AppProfileSeplag } from "../AppProfile/AppProfile";
import type { AppSystemItemSeplag } from "../AppSwitcher";
import type { IMenuSeplag, IVinculoSeplag } from "../Config/menu";

export interface LayoutSeplagProps {
  nomeSistema: string;
  ambienteSistema: string;
  sistemas: AppSystemItemSeplag[];
  logoSrc: string;
  logoHref?: string;
  menuItems: IMenuSeplag[];
  /**
   * Modo do menu lateral.
   * - `"static"` (padrão): sidebar empurra o conteúdo. Hambúrguer recolhe/expande com animação.
   * - `"overlay"`: sidebar flutua sobre o conteúdo. Hambúrguer abre/fecha. Clicar fora fecha.
   */
  menuMode?: "static" | "overlay";
  footerText?: string;
  footerChildren?: ReactNode;
  /** Conteúdo da área principal. Quando omitido usa <Outlet /> do react-router-dom. */
  children?: ReactNode;
  // AppProfile
  nomeApresentacao: string;
  numrVinculoAtual: string | number;
  vinculos: IVinculoSeplag[];
  avatarSrc?: string;
  onLogout: () => void;
  onAlterarSenha: (
    senhaAtual: string,
    senhaNova: string,
    confirmarSenha: string,
  ) => void;
  onSelecionarVinculo: (vinculo: IVinculoSeplag) => void;
  profileExtraActions?: ReactNode;
}

export function LayoutSeplag({
  nomeSistema,
  ambienteSistema,
  sistemas,
  logoSrc,
  logoHref = "#",
  menuItems,
  menuMode = "static",
  footerText,
  footerChildren,
  children,
  nomeApresentacao,
  numrVinculoAtual,
  vinculos,
  avatarSrc,
  onLogout,
  onAlterarSenha,
  onSelecionarVinculo,
  profileExtraActions,
}: Readonly<LayoutSeplagProps>) {
  const [layoutColorMode] = useState("light");
  const [staticMenuInactive, setStaticMenuInactive] = useState(false);
  const [overlayMenuActive, setOverlayMenuActive] = useState(false);
  const [mobileMenuActive, setMobileMenuActive] = useState(false);

  const isDesktop = () => window.innerWidth > 1024;

  const onToggleMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    if (isDesktop()) {
      if (menuMode === "overlay") {
        setOverlayMenuActive((prev) => !prev);
      } else {
        setStaticMenuInactive((prev) => !prev);
      }
    } else {
      setMobileMenuActive((prev) => !prev);
    }
  };

  const onMenuItemClick = (event: any) => {
    if (!event.item?.items) {
      setOverlayMenuActive(false);
      setMobileMenuActive(false);
    }
  };

  const closeMenus = () => {
    setOverlayMenuActive(false);
    setMobileMenuActive(false);
  };

  const sidebarClasses = [
    "layout-sidebar",
    layoutColorMode === "dark" ? "layout-sidebar-dark" : "layout-sidebar-light",
  ].join(" ");

  const sidebarOpenOnDesktop =
    menuMode === "overlay" ? overlayMenuActive : !staticMenuInactive;
  const isSidebarOpen = isDesktop() ? sidebarOpenOnDesktop : mobileMenuActive;

  const wrapperClasses = [
    "layout-wrapper",
    menuMode === "overlay" ? "layout-overlay" : "layout-static",
    !isSidebarOpen && menuMode === "static"
      ? "layout-static-sidebar-inactive"
      : "",
    isSidebarOpen && menuMode === "overlay"
      ? "layout-overlay-sidebar-active"
      : "",
    mobileMenuActive ? "layout-mobile-sidebar-active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const showBackdrop = overlayMenuActive || mobileMenuActive;

  return (
    <div className={wrapperClasses}>
      <nav className={sidebarClasses}>
        <a className="layout-logo" href={logoHref}>
          <img alt="Logo" src={logoSrc} />
        </a>
        <AppProfileSeplag
          nomeApresentacao={nomeApresentacao}
          numrVinculoAtual={numrVinculoAtual}
          vinculos={vinculos}
          avatarSrc={avatarSrc}
          onLogout={onLogout}
          onAlterarSenha={onAlterarSenha}
          onSelecionarVinculo={onSelecionarVinculo}
          extraActions={profileExtraActions}
        />
        <AppMenuSeplag items={menuItems} onMenuItemClick={onMenuItemClick} />
      </nav>
      {showBackdrop && (
        <div
          className="layout-sidebar-backdrop"
          onClick={closeMenus}
          aria-hidden="true"
        />
      )}
      <div className="layout-main">
        <AppTopbarSeplag
          onToggleMenu={onToggleMenu}
          isSidebarVisible={isSidebarOpen}
          nomeSistema={nomeSistema}
          ambienteSistema={ambienteSistema}
          systemas={sistemas}
        />
        <div className="layout-scroll">
          <div className="layout-content">{children ?? <Outlet />}</div>
          <AppFooterSeplag text={footerText}>{footerChildren}</AppFooterSeplag>
        </div>
      </div>
    </div>
  );
}


