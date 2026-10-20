import type { IMenuSeplag } from "../Config/menu";
import { CSSTransition } from "primereact/csstransition";
import React from "react";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SidebarNavigationContext } from '../layout/SidebarNavigationContext';
import { Link, useLocation } from "react-router-dom";
import { AppSubmenuSeplag } from "../AppSubmenu/AppSubmenu";

interface AppSubmenuItemSeplagProps {
  className: string;
  item: IMenuSeplag;
  root?: boolean;
  active?: boolean;
  routeActive?: boolean;
  onMenuClick: (event: { originalEvent: any; item: IMenuSeplag }) => void;
  onMenuItemClick: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    item: IMenuSeplag,
  ) => void;
}

const AppSubmenuItemSeplag = ({
  className,
  item,
  root = false,
  active = false,
  routeActive = false,
  onMenuClick,
  onMenuItemClick,
}: AppSubmenuItemSeplagProps) => {
  const nodeRef = React.useRef(null);
  const location = useLocation();
  const navigation = React.useContext(SidebarNavigationContext);
  const linkAccessibility = navigation.compactNavigation ? {
    title: item.label ?? undefined,
    'aria-label': item.label ?? undefined,
    'aria-expanded': item.items?.length ? active && !navigation.collapsed : undefined,
  } : {};

  const isRouteActive = (target?: string) => {
    if (!target || target === "#") {
      return false;
    }

    const normalize = (value: string) =>
      value.replace(/[?#].*$/, "").replace(/\/+$/, "") || "/";
    const escapeRegExp = (value: string) =>
      [
        "\\",
        ".",
        "*",
        "+",
        "?",
        "^",
        "$",
        "{",
        "}",
        "(",
        ")",
        "|",
        "[",
        "]",
      ].reduce((result, char) => {
        const replacement = char === "\\" ? String.raw`\\` : `\\${char}`;
        return result.replaceAll(char, replacement);
      }, value);
    const toRoutePattern = (value: string) => {
      const normalized = normalize(value);
      const pattern = normalized
        .split("/")
        .map((segment) =>
          segment.startsWith(":") ? "[^/]+" : escapeRegExp(segment),
        )
        .join("/");

      return new RegExp(`^${pattern}$`);
    };

    const currentPath = normalize(location.pathname);
    const targetPath = normalize(target);

    return (
      currentPath === targetPath ||
      currentPath.startsWith(`${targetPath}/`) ||
      toRoutePattern(targetPath).test(currentPath)
    );
  };

  const renderLinkContent = (item: IMenuSeplag) => {
    const submenuIcon = item.items && !navigation.compactNavigation && (
      <i className="pi pi-fw pi-angle-down menuitem-toggle-icon"></i>
    );

    if (item.icon === "pi pi-circle-on") {
      return (
        <>
          <i
            style={{ fontSize: "6px", color: "#7EA9C9" }}
            className={item.icon}
          ></i>
          <span style={item.disabled ? { textDecoration: "line-through", opacity: 0.65 } : undefined}>{item.label}</span>
          {submenuIcon}
        </>
      );
    }

    return (
      <>
        <i className={item.icon}></i>
        <span style={item.disabled ? { textDecoration: "line-through", opacity: 0.65 } : undefined}>{item.label}</span>
        {submenuIcon}
      </>
    );
  };

  const renderLink = (item: IMenuSeplag) => {
    const content = renderLinkContent(item);
    const isActiveRoute =
      isRouteActive(item.to) || item.activeRoutes?.some(isRouteActive) === true;
    const linkClassName = [
      isActiveRoute ? "active-route" : "",
      active && item.to ? "active-menuitem-routerlink" : "",
    ]
      .filter(Boolean)
      .join(" ");

    if (item.disabled) {
      return (
        <a
          {...linkAccessibility}
          href="#"
          aria-disabled="true"
          style={{ cursor: "not-allowed" }}
          onClick={(event) => event.preventDefault()}
        >
          {content}
        </a>
      );
    }
    if (!item.to) {
      const href = item.url && item.url !== "#" ? item.url : "#";
      return (
        <a
          {...linkAccessibility}
          href={href}
          onClick={(e) => {
            if (item.items || !item.url || item.url === "#") {
              e.preventDefault();
            }
            onMenuItemClick(e, item);
          }}
        >
          {content}
        </a>
      );
    }

    if (item.label != null && item?.visibleOnMenu) {
      return (
        <Link
          {...linkAccessibility}
          className={linkClassName}
          to={item.to}
          onClick={(e) => onMenuItemClick(e, item)}
        >
          {content}
        </Link>
      );
    }

    return content;
  };

  return (
    <li className={className} data-route-active={navigation.compactNavigation && routeActive ? 'true' : undefined}>
      {item.items && root && <div className="arrow"></div>}
      {renderLink(item)}
      {navigation.compactNavigation && Boolean(item.items?.length) && <button type="button" className="layout-submenu-toggle"
        aria-label={`${active && !navigation.collapsed ? 'Recolher' : 'Expandir'} ${item.label}`}
        title={`${active && !navigation.collapsed ? 'Recolher' : 'Expandir'} ${item.label}`}
        aria-expanded={active && !navigation.collapsed} disabled={item.disabled}
        onClick={event => onMenuItemClick(event,item)}>
        {active ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
      </button>}
      <CSSTransition
        nodeRef={nodeRef}
        classNames="layout-submenu-collapse"
        timeout={{ enter: 350, exit: 250 }}
        in={active}
        unmountOnExit
      >
        <div ref={nodeRef}>
          <AppSubmenuSeplag
            items={item.items}
            onMenuItemClick={onMenuClick}
            root={false}
          />
        </div>
      </CSSTransition>
    </li>
  );
};

export { AppSubmenuItemSeplag };

