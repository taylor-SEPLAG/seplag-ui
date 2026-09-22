import { OverlayPanel } from "primereact/overlaypanel";
import React, { type ReactNode, useMemo, useRef } from "react";
import { TbGridDots } from "react-icons/tb";
import { BotaoSeplag } from "../../Botao";
import style from "./AppSwitcher.module.css";

export type AppLinkTargetSeplag = "_self" | "_blank";

export interface AppSystemItemSeplag {
  id: string;
  label: string;
  url: string;
  target?: AppLinkTargetSeplag;
  icon?: string | ReactNode;
}

export interface AppSwitcherSeplagProps {
  currentSystem?: string;
  items: AppSystemItemSeplag[];
  className?: string;
}

export const AppSwitcherSeplag = ({ currentSystem, items, className }: AppSwitcherSeplagProps) => {
  const opRef = useRef<OverlayPanel>(null);

  const normalized = useMemo(() => {
    return (items ?? []).filter((x) => x?.id && x?.label && x?.url).slice();
  }, [items]);

  function open(e: React.MouseEvent) {
    opRef.current?.toggle(e);
  }

  function goTo(item: AppSystemItemSeplag) {
    opRef.current?.hide();

    const target = item.target ?? "_self";
    if (target === "_blank") {
      globalThis.open(item.url, "_blank", "noopener,noreferrer");
    } else {
      globalThis.location.assign(item.url);
    }
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center" }} className={className}>
      <BotaoSeplag
        unstyled
        type="button"
        id="app-switcher-toggle"
        data-testid="app-switcher-toggle"
        className={style.noRipple}
        style={{
          padding: 0,
          width: "auto",
          minWidth: 0,
          height: "auto",
          color: "#ffffff",
          border: "none",
          backgroundColor: "transparent",
          cursor: "pointer",
        }}
        icon={<TbGridDots size={32} />}
        tooltipOptions={{ position: "bottom" }}
        onClick={open}
      />

      <OverlayPanel
        ref={opRef}
        style={{ backgroundColor: "#D8D8D8" }}
        dismissable
        appendTo={document.body}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
              maxWidth: "26rem",
            }}
            role="menu"
          >
            {normalized.map((item) => {
              const isSelected = item.label === currentSystem;
              return (
                <BotaoSeplag
                  unstyled
                  key={item.id}
                  id={`app-switcher-item-${item.id}`}
                  data-testid={`app-switcher-item-${item.id}`}
                  className={style.noRipple}
                  type="button"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    background: isSelected ? "#1FA1FC66" : "#FFF",
                    width: "130px",
                    height: "110px",
                    padding: "0.5rem",
                    borderRadius: "5px",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0px 2px 5px 0px rgba(0,0,0,0.25)",
                  }}
                  onClick={() => goTo(item)}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: 1,
                      width: "100%",
                      color: "#005494",
                    }}
                  >
                    {typeof item.icon === "string" ? (
                      <i style={{ fontSize: "3rem" }} className={item.icon} />
                    ) : (
                      item.icon
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "2rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      lineHeight: 1.1,
                      overflow: "hidden",
                      color: "#005494",
                      textAlign: "center",
                    }}
                  >
                    {item.label}
                  </div>
                </BotaoSeplag>
              );
            })}
          </div>
        </div>
      </OverlayPanel>
    </div>
  );
};
