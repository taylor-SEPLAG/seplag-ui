import React, { useState, type ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BreadcrumbSeplag } from "../../Breadcrumb";
import { useBreadcrumbFromMenuSeplag } from "../../Breadcrumb/useBreadcrumbFromMenuSeplag";
import { AppFooterSeplag } from "../AppFooter/AppFooter";
import { AppMenuSeplag } from "../AppMenu/AppMenu";
import { AppProfileSeplag } from "../AppProfile/AppProfile";
import {
  AppSidebarVersionSeplag,
  type SistemaVersaoSeplag,
} from "../AppSidebarVersion/AppSidebarVersion";
import type { AppSystemItemSeplag } from "../AppSwitcher";
import { AppTopbarSeplag } from "../AppTopbar";
import { SEPLAG_NOME_ORGAO_SEPLAG } from "../Config/institucional";
import type { IMenuSeplag, IVinculoSeplag } from "../Config/menu";
import "./Layout.css";

export interface LayoutSeplagProps {
  currentSystem: string;
  ambienteSistema: string;
  sistemas: AppSystemItemSeplag[];
  logoSrc: string;
  logoHref?: string;
  menuItems: IMenuSeplag[];
  menuMode?: "static" | "overlay";
  showBreadcrumb?: boolean;
  breadcrumbMenu?: IMenuSeplag[];
  footerText?: string;
  footerChildren?: ReactNode;
  versoesSistemas?: SistemaVersaoSeplag[];
  /** Chamado ao abrir o modal de versões — use para buscar os dados sob demanda em vez de carregá-los antecipadamente. */
  onOpenVersoesSistemas?: () => void;
  children?: ReactNode;
  nomeApresentacao: string;
  numrVinculoAtual: string | number;
  vinculos: IVinculoSeplag[];
  avatarSrc?: string;
  onLogout: () => void;
  onAlterarSenha: (senhaAtual: string, senhaNova: string, confirmarSenha: string) => void;
  onSelecionarVinculo: (vinculo: IVinculoSeplag) => void;
}

export function LayoutSeplag({
  currentSystem,
  ambienteSistema,
  sistemas,
  logoSrc,
  logoHref,
  menuItems,
  menuMode = "static",
  showBreadcrumb = false,
  breadcrumbMenu,
  footerText = SEPLAG_NOME_ORGAO_SEPLAG,
  footerChildren,
  versoesSistemas,
  onOpenVersoesSistemas,
  children,
  nomeApresentacao,
  numrVinculoAtual,
  vinculos,
  avatarSrc,
  onLogout,
  onAlterarSenha,
  onSelecionarVinculo,
}: Readonly<LayoutSeplagProps>) {
  const [layoutColorMode] = useState("light");
  const [staticMenuInactive, setStaticMenuInactive] = useState(false);
  const [overlayMenuActive, setOverlayMenuActive] = useState(false);
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const breadcrumb = useBreadcrumbFromMenuSeplag(breadcrumbMenu ?? menuItems);
  const { pathname } = useLocation();
  const homeRoute = (breadcrumbMenu ?? menuItems)[0]?.to;
  const isHomeRoute = homeRoute != null && pathname === homeRoute;

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

  const sidebarOpenOnDesktop = menuMode === "overlay" ? overlayMenuActive : !staticMenuInactive;
  const isSidebarOpen = isDesktop() ? sidebarOpenOnDesktop : mobileMenuActive;
  const isCollapsed = menuMode === "static" && staticMenuInactive && isDesktop();

  const sidebarClasses = [
    "layout-sidebar",
    layoutColorMode === "dark" ? "layout-sidebar-dark" : "layout-sidebar-light",
    isCollapsed ? "layout-sidebar-collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const wrapperClasses = [
    "layout-wrapper",
    menuMode === "overlay" ? "layout-overlay" : "layout-static",
    !isSidebarOpen && menuMode === "static" ? "layout-static-sidebar-inactive" : "",
    isSidebarOpen && menuMode === "overlay" ? "layout-overlay-sidebar-active" : "",
    mobileMenuActive ? "layout-mobile-sidebar-active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const showBackdrop = overlayMenuActive || mobileMenuActive;

  return (
    <div className={wrapperClasses} id="app-layout" data-testid="app-layout">
      <nav className={sidebarClasses} id="app-sidebar" data-testid="app-sidebar">
        {logoHref ? (
          <a className="layout-logo" id="app-logo" data-testid="app-logo" href={logoHref}>
            <img alt="Logo" src={logoSrc} />
          </a>
        ) : (
          <div className="layout-logo" id="app-logo" data-testid="app-logo">
            <img alt="Logo" src={logoSrc} />
          </div>
        )}
        <AppProfileSeplag
          nomeApresentacao={nomeApresentacao}
          numrVinculoAtual={numrVinculoAtual}
          vinculos={vinculos}
          avatarSrc={avatarSrc}
          onLogout={onLogout}
          onAlterarSenha={onAlterarSenha}
          onSelecionarVinculo={onSelecionarVinculo}
          collapsed={isCollapsed}
        />
        <AppMenuSeplag
          items={menuItems}
          onMenuItemClick={onMenuItemClick}
          collapsed={isCollapsed}
        />
        <AppSidebarVersionSeplag
          sistemas={versoesSistemas}
          onOpen={onOpenVersoesSistemas}
          collapsed={isCollapsed}
        />
      </nav>
      {showBackdrop && (
        <div
          className="layout-sidebar-backdrop"
          id="app-sidebar-backdrop"
          data-testid="app-sidebar-backdrop"
          onClick={closeMenus}
          aria-hidden="true"
        />
      )}
      <div className="layout-main" id="app-main" data-testid="app-main">
        <AppTopbarSeplag
          onToggleMenu={onToggleMenu}
          isSidebarVisible={isSidebarOpen}
          currentSystem={currentSystem}
          ambienteSistema={ambienteSistema}
          systemas={sistemas}
        />
        <div className="layout-content" id="app-content" data-testid="app-content">
          {showBreadcrumb && !isHomeRoute && breadcrumb.items.length > 0 && (
            <BreadcrumbSeplag {...breadcrumb} style={{ marginBottom: 0 }} />
          )}
          {children ?? <Outlet />}
        </div>
        <AppFooterSeplag text={footerText}>{footerChildren}</AppFooterSeplag>
      </div>
    </div>
  );
}
