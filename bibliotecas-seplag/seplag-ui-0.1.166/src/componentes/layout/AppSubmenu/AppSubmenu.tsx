import React, { useState } from "react";
import { useLocation } from "react-router-dom";

import { AppSubmenuItemSeplag } from "../AppSubmenuItem/AppSubmenuItem";
import type { IMenuSeplag } from "../Config/menu";

interface AppSubmenuSeplagProps {
  onMenuItemClick: (event: { originalEvent: any; item: IMenuSeplag[] }) => void;
  items: IMenuSeplag[] | null | undefined;
  root?: boolean;
  className?: string;
  collapsed?: boolean;
}
export function AppSubmenuSeplag(props: AppSubmenuSeplagProps) {
  const location = useLocation();
  const visibleItems = props.items?.filter(
    (item) => item.visibleOnMenu !== false && item.label !== null,
  );

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

  const hasActiveRoute = (item: IMenuSeplag): boolean => {
    if (isRouteActive(item.to)) {
      return true;
    }

    return item.items?.some((child) => hasActiveRoute(child)) ?? false;
  };

  const [activeLabels, setActiveLabels] = useState<Set<string>>(
    () =>
      new Set(
        visibleItems?.filter((item) => hasActiveRoute(item)).map((item) => item.label!) ?? [],
      ),
  );
  const [trackedPath, setTrackedPath] = useState(location.pathname);

  if (trackedPath !== location.pathname) {
    setTrackedPath(location.pathname);
    const routeItem = visibleItems?.find((item) => hasActiveRoute(item));

    setActiveLabels((current) => {
      const next = new Set(current);

      visibleItems?.forEach((item) => {
        if (!item.label || item === routeItem) {
          return;
        }

        if (!hasActiveRoute(item)) {
          next.delete(item.label);
        }
      });

      if (routeItem?.label) {
        next.add(routeItem.label);
      }

      return next;
    });
  }

  const onMenuItemClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    item: IMenuSeplag,
  ) => {
    if (item.disabled) {
      event.preventDefault();
      return true;
    }

    setActiveLabels((current) => {
      const next = new Set(current);
      if (item.label) {
        if (next.has(item.label)) {
          next.delete(item.label);
        } else {
          next.add(item.label);
        }
      }
      return next;
    });
  };

  const items = visibleItems?.map((item, i) => {
    const active = !!item.label && activeLabels.has(item.label);
    const styleClass = [item.badgeStyleClass, active && !item.to ? "active-menuitem" : ""]
      .filter(Boolean)
      .join(" ");

    return (
      <AppSubmenuItemSeplag
        key={item.label + "_" + i}
        className={styleClass}
        item={item}
        onMenuClick={props.onMenuItemClick}
        onMenuItemClick={onMenuItemClick}
        active={active}
        root={props.root}
        collapsed={props.collapsed}
      />
    );
  });

  return items ? <ul className={props.className}>{items}</ul> : null;
}
