import React, { useState, type ReactNode } from "react";
import { CSSTransition } from "primereact/csstransition";
import { Password } from "primereact/password";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ModalSeplag } from "@componentes/Modal";
import { RotuloSeplag } from "@componentes/Rotulo";
import type { IVinculoSeplag } from "../Config/menu";
import defaultAvatar from "../../../assets/img/default-avatar.jpg";

export interface AppProfileSeplagProps {
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
  extraActions?: ReactNode;
}

export function AppProfileSeplag({
  nomeApresentacao,
  numrVinculoAtual,
  vinculos,
  avatarSrc,
  onLogout,
  onAlterarSenha,
  onSelecionarVinculo,
  extraActions,
}: Readonly<AppProfileSeplagProps>) {
  const nodeRef = React.useRef(null);

  const [expanded, setExpanded] = useState(false);
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [exibirTelaSenha, setExibirTelaSenha] = useState(false);
  const [exibirTelaVinculo, setExibirTelaVinculo] = useState(false);
  const [vinculoSelected, setVinculoSelected] = useState<IVinculoSeplag>();

  const onClick = (event: React.MouseEvent) => {
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

  return (
    <div className="layout-profile">
      <div>
        <img
          style={{ borderRadius: "50%", width: "50px" }}
          src={avatarSrc ?? defaultAvatar}
          alt="Profile"
        />
      </div>
      <button
        type="button"
        className="p-link layout-profile-link"
        onClick={onClick}
      >
        <span className="layout-profile-name">
          <span className="username">{nomeApresentacao}</span>
          <i className="pi pi-fw pi-cog" />
        </span>
        <span className="layout-profile-vinculo">
          Vínculo {numrVinculoAtual}
        </span>
      </button>
      <CSSTransition
        nodeRef={nodeRef}
        classNames="layout-submenu-collapse"
        timeout={{ enter: 350, exit: 250 }}
        in={expanded}
        unmountOnExit
      >
        <ul className="layout-profile-expanded" ref={nodeRef}>
          <li>
            <button type="button" className="p-link">
              <i className="pi pi-fw pi-user" />
              <span>Perfil</span>
            </button>
          </li>
          {extraActions}
          <li>
            <button
              type="button"
              className="p-link"
              onClick={() => setExibirTelaSenha(true)}
            >
              <i className="pi pi-fw pi-key" />
              <span>Alterar Senha</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="p-link"
              onClick={() => setExibirTelaVinculo(true)}
            >
              <i className="pi pi-fw pi-share-alt" />
              <span>Alterar Vínculo</span>
            </button>
          </li>
          <li>
            <button type="button" className="p-link" onClick={onLogout}>
              <i className="pi pi-fw pi-power-off" />
              <span>Sair</span>
            </button>
          </li>
        </ul>
      </CSSTransition>

      <ModalSeplag
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
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              feedback={false}
            />
          </RotuloSeplag>
          <RotuloSeplag nome="Nova Senha">
            <Password
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
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              feedback={false}
            />
          </RotuloSeplag>
        </div>
      </ModalSeplag>

      <ModalSeplag
        titulo="Alterar Vínculo"
        tamanho="60rem"
        labelFechar="Fechar"
        labelAcao="Alterar"
        visible={exibirTelaVinculo}
        fechar={() => setExibirTelaVinculo(false)}
        funcAcao={handleSelecionarVinculo}
      >
        <DataTable
          value={vinculos.filter((v) => v.statVinculo === "ATIVO")}
          selectionMode="single"
          selection={vinculoSelected}
          onSelectionChange={(e) =>
            setVinculoSelected(e.value as IVinculoSeplag)
          }
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


