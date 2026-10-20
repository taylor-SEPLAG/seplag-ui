import "./Layout.css";
import React, { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { SidebarNavigationContext } from './SidebarNavigationContext';
import './compactSidebar.css';
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
  /** Navegação compacta optativa; preserva o layout padrão dos demais sistemas. */
  compactNavigation?: boolean;
  compactLogoSrc?: string;
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
  compactNavigation = false,
  compactLogoSrc,
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
  const [staticMenuInactive, setStaticMenuInactive] = useState(() => {
    try { return compactNavigation && localStorage.getItem('sigep-sidebar-collapsed') === 'true'; }
    catch { return false; }
  });
  const [overlayMenuActive, setOverlayMenuActive] = useState(false);
  const [mobileMenuActive, setMobileMenuActive] = useState(false);

  const [desktop, setDesktop] = useState(() => window.innerWidth > 1024);
  const sidebarId = useId();
  const sidebarRef = useRef<HTMLElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const collapsed = compactNavigation && desktop && staticMenuInactive;
  const isDesktop = () => desktop;

  useEffect(() => {
    const resize = () => { setDesktop(window.innerWidth > 1024); setMobileMenuActive(false); };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (!compactNavigation) return;
    try { localStorage.setItem('sigep-sidebar-collapsed', String(staticMenuInactive)); } catch { /* armazenamento indisponível */ }
  }, [compactNavigation, staticMenuInactive]);

  useEffect(() => {
    if (!compactNavigation || !mobileMenuActive || desktop) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebarRef.current?.querySelector('button')?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuActive(false); mobileTriggerRef.current?.focus();
      }
      if (event.key === 'Tab') {
        const focusable = [...(sidebarRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select') ?? [])]
          .filter(el => el.getClientRects().length > 0);
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', keyboard);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', keyboard); };
  }, [compactNavigation, mobileMenuActive, desktop]);

  const onToggleMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    if (isDesktop()) {
      if (menuMode === "overlay" && !compactNavigation) {
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
    if (compactNavigation && !desktop) mobileTriggerRef.current?.focus();
  };

  const sidebarClasses = [
    "layout-sidebar",
    layoutColorMode === "dark" ? "layout-sidebar-dark" : "layout-sidebar-light",
  ].join(" ");

  const sidebarOpenOnDesktop =
    menuMode === "overlay" && !compactNavigation ? overlayMenuActive : !staticMenuInactive;
  const isSidebarOpen = isDesktop() ? sidebarOpenOnDesktop : mobileMenuActive;

  const wrapperClasses = [
    "layout-wrapper",
    compactNavigation ? 'layout-compact-navigation' : '',
    collapsed ? 'layout-navigation-collapsed' : '',
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
    <SidebarNavigationContext.Provider value={{compactNavigation, collapsed, expand: () => setStaticMenuInactive(false)}}>
    <div className={wrapperClasses}>
      <nav className={sidebarClasses} id={sidebarId} ref={sidebarRef} aria-label={compactNavigation ? 'Menu principal do SIGEP' : undefined}
        inert={compactNavigation && !desktop && !mobileMenuActive ? true : undefined}>
        {compactNavigation ? <div className="layout-sidebar-header">
          <a className="layout-logo" href={logoHref} aria-label="Governo de Mato Grosso — SEPLAG">
            {collapsed && !compactLogoSrc ? <span className="layout-compact-brand">MT</span> :
              <img alt="Governo de Mato Grosso — SEPLAG" src={collapsed && compactLogoSrc ? compactLogoSrc : logoSrc} />}
          </a>
          <button type="button" className="layout-panel-toggle" onClick={onToggleMenu}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'} title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!collapsed && (desktop || mobileMenuActive)} aria-controls={sidebarId}>
            {collapsed ? <PanelLeftOpen size={22} aria-hidden="true" /> : <PanelLeftClose size={22} aria-hidden="true" />}
          </button>
        </div> : (
        <a className="layout-logo" href={logoHref}>
          <img alt="Logo" src={logoSrc} />
        </a>
        )}
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
        {compactNavigation && !desktop && <button ref={mobileTriggerRef} type="button" className="layout-mobile-panel-trigger" onClick={onToggleMenu}
          aria-label="Expandir menu" title="Expandir menu" aria-expanded={mobileMenuActive} aria-controls={sidebarId}><PanelLeftOpen size={22} aria-hidden="true" /></button>}
        <AppTopbarSeplag
          onToggleMenu={onToggleMenu}
          isSidebarVisible={isSidebarOpen}
          nomeSistema={nomeSistema}
          ambienteSistema={ambienteSistema}
          systemas={sistemas}
          hideMenuToggle={compactNavigation}
          searchMenuItems={compactNavigation ? menuItems : undefined}
        />
        <div className="layout-scroll">
          <div className="layout-content">{children ?? <Outlet />}</div>
          <AppFooterSeplag text={footerText}>{footerChildren}</AppFooterSeplag>
        </div>
      </div>
    </div>
    </SidebarNavigationContext.Provider>
  );
}


