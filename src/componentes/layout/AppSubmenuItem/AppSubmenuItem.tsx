import type { IMenuSeplag } from "../Config/menu";
import { CSSTransition } from "primereact/csstransition";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AppSubmenuSeplag } from "../AppSubmenu/AppSubmenu";

interface AppSubmenuItemSeplagProps {
  className: string;
  item: IMenuSeplag;
  root?: boolean;
  active?: boolean;
  onMenuClick: (event: { originalEvent: any; item: IMenuSeplag[] }) => void;
  onMenuItemClick: (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    item: IMenuSeplag,
  ) => void;
}

const AppSubmenuItemSeplag = ({
  className,
  item,
  root = false,
  active = false,
  onMenuClick,
  onMenuItemClick,
}: AppSubmenuItemSeplagProps) => {
  const nodeRef = React.useRef(null);
  const location = useLocation();

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
    const submenuIcon = item.items && (
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
    <li className={className}>
      {item.items && root && <div className="arrow"></div>}
      {renderLink(item)}
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

