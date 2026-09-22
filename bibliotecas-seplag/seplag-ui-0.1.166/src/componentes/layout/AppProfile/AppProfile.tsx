import { BotaoSeplag } from "@componentes/Botao";
import { ModalSeplag } from "@componentes/Modal";
import { RotuloSeplag } from "@componentes/Rotulo";
import { Column } from "primereact/column";
import { CSSTransition } from "primereact/csstransition";
import { DataTable } from "primereact/datatable";
import { OverlayPanel } from "primereact/overlaypanel";
import { Password } from "primereact/password";
import { Tooltip } from "primereact/tooltip";
import React, { useId, useState } from "react";
import defaultAvatar from "../../../assets/img/default-avatar.jpg";
import type { IVinculoSeplag } from "../Config/menu";
import { registerOpenFlyout, unregisterFlyout } from "../Config/sidebarFlyoutRegistry";
import style from "./AppProfile.module.css";

export interface AppProfileSeplagProps {
  nomeApresentacao: string;
  numrVinculoAtual: string | number;
  vinculos: IVinculoSeplag[];
  avatarSrc?: string;
  onLogout: () => void;
  onAlterarSenha: (senhaAtual: string, senhaNova: string, confirmarSenha: string) => void;
  onSelecionarVinculo: (vinculo: IVinculoSeplag) => void;
  collapsed?: boolean;
}

export function AppProfileSeplag({
  nomeApresentacao,
  numrVinculoAtual,
  vinculos,
  avatarSrc,
  onLogout,
  onAlterarSenha,
  onSelecionarVinculo,
  collapsed = false,
}: Readonly<AppProfileSeplagProps>) {
  const nodeRef = React.useRef(null);
  const overlayRef = React.useRef<OverlayPanel>(null);
  const rawId = useId();
  const profileId = `sidebar-profile-${rawId.replace(/:/g, "")}`;

  const [expanded, setExpanded] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const hideSelf = React.useCallback(() => overlayRef.current?.hide(), []);
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [exibirTelaSenha, setExibirTelaSenha] = useState(false);
  const [exibirTelaVinculo, setExibirTelaVinculo] = useState(false);
  const [vinculoSelected, setVinculoSelected] = useState<IVinculoSeplag>();

  const applyOverlayPosition = (rect: DOMRect) => {
    const overlayEl = overlayRef.current?.getElement();
    if (!overlayEl) {
      return;
    }
    overlayEl.style.cssText += `position:fixed!important;top:${rect.top}px!important;left:${rect.right + 2}px!important;margin:0!important;z-index:1100!important;`;
  };

  const onClick = (event: React.MouseEvent) => {
    if (collapsed) {
      const sidebarEl = event.currentTarget.closest(".layout-sidebar");
      const sidebarRect = sidebarEl?.getBoundingClientRect();
      const buttonRect = event.currentTarget.getBoundingClientRect();
      const rect = sidebarRect
        ? new DOMRect(
            buttonRect.x,
            buttonRect.top,
            sidebarRect.right - buttonRect.x,
            buttonRect.height,
          )
        : buttonRect;
      overlayRef.current?.toggle(event);
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
    setExpanded((prev) => !prev);
    event.preventDefault();
  };

  const handleAlterarSenha = () => {
    onAlterarSenha(senhaAtual, senhaNova, confirmarSenha);
    setExibirTelaSenha(false);
    setSenhaAtual("");
    setSenhaNova("");
    setConfirmarSenha("");
  };

  const handleSelecionarVinculo = () => {
    setExibirTelaVinculo(false);
    if (vinculoSelected) {
      onSelecionarVinculo(vinculoSelected);
      setExpanded(false);
    }
  };

  const optionsList = (
    <>
      <li>
        <BotaoSeplag
          unstyled
          type="button"
          id="app-profile-perfil"
          data-testid="app-profile-perfil"
          className={`p-link ${style.noRipple}`}
        >
          <i className="pi pi-fw pi-user" />
          <span>Perfil</span>
        </BotaoSeplag>
      </li>
      <li>
        <BotaoSeplag
          unstyled
          type="button"
          id="app-profile-alterar-senha"
          data-testid="app-profile-alterar-senha"
          className={`p-link ${style.noRipple}`}
          onClick={() => {
            overlayRef.current?.hide();
            setExibirTelaSenha(true);
          }}
        >
          <i className="pi pi-fw pi-key" />
          <span>Alterar Senha</span>
        </BotaoSeplag>
      </li>
      <li>
        <BotaoSeplag
          unstyled
          type="button"
          id="app-profile-alterar-vinculo"
          data-testid="app-profile-alterar-vinculo"
          className={`p-link ${style.noRipple}`}
          onClick={() => {
            overlayRef.current?.hide();
            setExibirTelaVinculo(true);
          }}
        >
          <i className="pi pi-fw pi-share-alt" />
          <span>Alterar Vínculo</span>
        </BotaoSeplag>
      </li>
      <li>
        <BotaoSeplag
          unstyled
          type="button"
          id="app-profile-sair"
          data-testid="app-profile-sair"
          className={`p-link ${style.noRipple}`}
          onClick={onLogout}
        >
          <i className="pi pi-fw pi-power-off" />
          <span>Sair</span>
        </BotaoSeplag>
      </li>
    </>
  );

  return (
    <div className="layout-profile" id="app-profile" data-testid="app-profile">
      <div>
        <img
          id={profileId}
          data-testid="app-profile-avatar"
          style={{ borderRadius: "50%", width: collapsed ? "36px" : "50px" }}
          src={avatarSrc ?? defaultAvatar}
          alt="Profile"
        />
      </div>
      {collapsed && !isOverlayOpen && (
        <Tooltip
          target={`#${profileId}`}
          content={nomeApresentacao}
          position="right"
          showDelay={200}
        />
      )}
      <BotaoSeplag
        unstyled
        type="button"
        id="app-profile-toggle"
        data-testid="app-profile-toggle"
        className={`p-link layout-profile-link ${style.noRipple}`}
        onClick={onClick}
      >
        <span className="layout-profile-name">
          <span className="username">{nomeApresentacao}</span>
          <i className="pi pi-fw pi-cog" />
        </span>
        <span className="layout-profile-vinculo">Vínculo {numrVinculoAtual}</span>
      </BotaoSeplag>
      {collapsed ? (
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
          <span className="layout-menu-flyout-title">
            {nomeApresentacao}
            <span className="layout-menu-flyout-subtitle">Vínculo {numrVinculoAtual}</span>
          </span>
          <ul className="layout-profile-expanded">{optionsList}</ul>
        </OverlayPanel>
      ) : (
        <CSSTransition
          nodeRef={nodeRef}
          classNames="layout-submenu-collapse"
          timeout={{ enter: 350, exit: 250 }}
          in={expanded}
          unmountOnExit
        >
          <ul className="layout-profile-expanded" ref={nodeRef}>
            {optionsList}
          </ul>
        </CSSTransition>
      )}

      <ModalSeplag
        id="app-profile-senha-modal"
        titulo="Trocar a Senha"
        tamanho="23rem"
        labelFechar="Fechar"
        labelAcao="Alterar"
        visible={exibirTelaSenha}
        fechar={() => setExibirTelaSenha(false)}
        funcAcao={handleAlterarSenha}
      >
        <div className="col-12">
          <RotuloSeplag nome="Senha Atual">
            <Password
              id="app-profile-senha-atual"
              data-testid="app-profile-senha-atual"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              feedback={false}
            />
          </RotuloSeplag>
          <RotuloSeplag nome="Nova Senha">
            <Password
              id="app-profile-senha-nova"
              data-testid="app-profile-senha-nova"
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              weakLabel="Fraco"
              mediumLabel="Médio"
              strongLabel="Forte"
              promptLabel="Entra com a Nova Senha"
            />
          </RotuloSeplag>
          <RotuloSeplag nome="Confirma Nova Senha">
            <Password
              id="app-profile-senha-confirmar"
              data-testid="app-profile-senha-confirmar"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              feedback={false}
            />
          </RotuloSeplag>
        </div>
      </ModalSeplag>

      <ModalSeplag
        id="app-profile-vinculo-modal"
        titulo="Alterar Vínculo"
        tamanho="60rem"
        labelFechar="Fechar"
        labelAcao="Alterar"
        visible={exibirTelaVinculo}
        fechar={() => setExibirTelaVinculo(false)}
        funcAcao={handleSelecionarVinculo}
      >
        <DataTable
          id="app-profile-vinculo-table"
          data-testid="app-profile-vinculo-table"
          value={vinculos.filter((v) => v.statVinculo === "ATIVO")}
          selectionMode="single"
          selection={vinculoSelected}
          onSelectionChange={(e) => setVinculoSelected(e.value as IVinculoSeplag)}
          className="col-12"
        >
          <Column selectionMode="single" />
          <Column field="numrVinculo" header="Vínculo" />
          <Column field="statVinculo" header="Situação" />
          <Column field="unidade.descUnidade" header="Setor" />
          <Column field="orgao.descOrgao" header="Órgão" />
        </DataTable>
      </ModalSeplag>
    </div>
  );
}
