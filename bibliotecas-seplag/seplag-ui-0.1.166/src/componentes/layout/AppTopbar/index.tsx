import { BotaoSeplag } from "@componentes/Botao";
import { AppSwitcherSeplag, type AppSystemItemSeplag } from "@componentes/layout/AppSwitcher";
import React from "react";
import styles from "./AppTopbar.module.css";

export interface AppTopbarSeplagProps {
  isSidebarVisible: boolean;
  onToggleMenu: (event: React.MouseEvent) => void;
  currentSystem: string;
  ambienteSistema: string;
  systemas: AppSystemItemSeplag[];
}
export const AppTopbarSeplag = (props: AppTopbarSeplagProps) => {
  return (
    <div className={styles["layout-topbar"]} id="app-topbar" data-testid="app-topbar">
      <BotaoSeplag
        unstyled
        type="button"
        id="app-topbar-menu-toggle"
        data-testid="app-topbar-menu-toggle"
        className={`${styles["layout-menu-button"]} ${styles["menu-link"]}`}
        onClick={props.onToggleMenu}
        aria-label={props.isSidebarVisible ? "Fechar menu" : "Abrir menu"}
      >
        <div
          className={[styles["menu-btn"], props.isSidebarVisible ? styles.open : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <div className={styles["menu-burger"]} />
        </div>
      </BotaoSeplag>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            fontSize: "18px",
            fontWeight: 600,
            marginRight: "10px",
          }}
        >
          {props.currentSystem} - {props.ambienteSistema}
        </span>
        <AppSwitcherSeplag items={props.systemas} currentSystem={props.currentSystem} />
      </div>
    </div>
  );
};
