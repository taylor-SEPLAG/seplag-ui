import { CSSTransition } from "primereact/csstransition";
import { OverlayPanel } from "primereact/overlaypanel";
import { Tooltip } from "primereact/tooltip";
import React, { useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppSubmenuSeplag } from "../AppSubmenu/AppSubmenu";
import type { IMenuSeplag } from "../Config/menu";
import { registerOpenFlyout, unregisterFlyout } from "../Config/sidebarFlyoutRegistry";

interface AppSubmenuItemSeplagProps {
  className: string;
  item: IMenuSeplag;
  root?: boolean;
  active?: boolean;
  collapsed?: boolean;
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
  collapsed = false,
  onMenuClick,
  onMenuItemClick,
}: AppSubmenuItemSeplagProps) => {
  const nodeRef = React.useRef(null);
  const overlayRef = React.useRef<OverlayPanel>(null);
  const rawId = useId();
  const itemId = `sidebar-item-${rawId.replace(/:/g, "")}`;
  const itemTestKey = (item.to ?? item.nameRef ?? item.label ?? "item")
    .toString()
    .replaceAll(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const itemTestId = `sidebar-item-${itemTestKey}`;
  const location = useLocation();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const hideSelf = React.useCallback(() => overlayRef.current?.hide(), []);

  const isCollapsedRoot = collapsed && root;
  const hasChildren = Boolean(item.items && item.items.length > 0);

  const isRouteActive = (target?: string) => {
    if (!target || target === "#") {
      return false;
    }

    const normalize = (value: string) => value.replace(/[?#].*$/, "").replace(/\/+$/, "") || "/";
    const escapeRegExp = (value: string) =>
      ["\\", ".", "*", "+", "?", "^", "$", "{", "}", "(", ")", "|", "[", "]"].reduce(
        (result, char) => {
          const replacement = char === "\\" ? String.raw`\\` : `\\${char}`;
          return result.replaceAll(char, replacement);
        },
        value,
      );
    const toRoutePattern = (value: string) => {
      const normalized = normalize(value);
      const pattern = normalized
        .split("/")
        .map((segment) => (segment.startsWith(":") ? "[^/]+" : escapeRegExp(segment)))
        .join("/");

      return new RegExp(`^${pattern}$`, "i");
    };

    const currentPath = normalize(location.pathname).toLowerCase();
    const targetPath = normalize(target).toLowerCase();

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
          <i style={{ fontSize: "6px", color: "#7EA9C9" }} className={item.icon}></i>
          <span>{item.label}</span>
          {submenuIcon}
        </>
      );
    }

    return (
      <>
        <i className={item.icon}></i>
        <span>{item.label}</span>
        {submenuIcon}
      </>
    );
  };
  const applyOverlayPosition = (rect: DOMRect) => {
    const overlayEl = overlayRef.current?.getElement();
    if (!overlayEl) {
      return;
    }
    overlayEl.style.cssText += `position:fixed!important;top:${rect.top}px!important;left:${rect.right + 2}px!important;margin:0!important;z-index:1100!important;`;
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (isCollapsedRoot && hasChildren) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      overlayRef.current?.toggle(e);
      let attempts = 0;
      const tryApply = () => {
        applyOverlayPosition(rect);
        attempts += 1;
        if (attempts < 5) {
          requestAnimationFrame(tryApply);
        }
      };
      requestAnimationFrame(tryApply);
      return;
    }
    if (!item.items) {
      onMenuClick({ originalEvent: e, item: [item] });
    }
    onMenuItemClick(e, item);
  };

  const handleOverlayMenuClick = (event: { originalEvent: any; item: IMenuSeplag[] }) => {
    overlayRef.current?.hide();
    onMenuClick(event);
  };

  const renderLink = (item: IMenuSeplag) => {
    const content = renderLinkContent(item);
    const isActiveRoute = isRouteActive(item.to);
    const linkClassName = [
      isActiveRoute ? "active-route" : "",
      active && item.to ? "active-menuitem-routerlink" : "",
    ]
      .filter(Boolean)
      .join(" ");

    if (!item.to) {
      return (
        <a id={itemId} data-testid={itemTestId} href={item.url} onClick={handleClick}>
          {content}
        </a>
      );
    }

    if (item.label != null && item?.visibleOnMenu) {
      return (
        <Link
          id={itemId}
          data-testid={itemTestId}
          className={linkClassName}
          to={item.to}
          onClick={handleClick}
        >
          {content}
        </Link>
      );
    }

    return content;
  };

  return (
    <li className={className} data-testid={`${itemTestId}-li`}>
      {item.items && root && <div className="arrow"></div>}
      {isCollapsedRoot && item.label && !isOverlayOpen && (
        <Tooltip target={`#${itemId}`} content={item.label} position="right" showDelay={200} />
      )}
      {renderLink(item)}
      {isCollapsedRoot && hasChildren ? (
        <OverlayPanel
          ref={overlayRef}
          className="layout-menu-flyout"
          showCloseIcon={false}
          onShow={() => {
            setIsOverlayOpen(true);
            registerOpenFlyout(hideSelf);
          }}
          onHide={() => {
            setIsOverlayOpen(false);
            unregisterFlyout(hideSelf);
          }}
        >
          <span className="layout-menu-flyout-title">{item.label}</span>
          <AppSubmenuSeplag
            items={item.items}
            onMenuItemClick={handleOverlayMenuClick}
            root={false}
            className="layout-menu"
          />
        </OverlayPanel>
      ) : (
        <CSSTransition
          nodeRef={nodeRef}
          classNames="layout-submenu-collapse"
          timeout={{ enter: 350, exit: 250 }}
          in={active}
          unmountOnExit
        >
          <div ref={nodeRef}>
            <AppSubmenuSeplag items={item.items} onMenuItemClick={onMenuClick} root={false} />
          </div>
        </CSSTransition>
      )}
    </li>
  );
};

export { AppSubmenuItemSeplag };
