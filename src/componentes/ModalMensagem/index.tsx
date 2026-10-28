import type { ReactNode, CSSProperties } from "react";
import { Dialog } from "primereact/dialog";
import { BotaoSeplag } from "../Botao";
import "./modalMensagem.css";

export type TipoMensagemSeplag =
  "urgente" | "informativo" | "regra" | "atualizacao";
const tipos = {
  urgente: {
    tag: "Urgente",
    icon: "pi pi-exclamation-triangle",
    cor: "#c75408",
    fundo: "#fff0df",
  },
  informativo: {
    tag: "Informativo",
    icon: "pi pi-info-circle",
    cor: "#0875e1",
    fundo: "#e5f1ff",
  },
  regra: {
    tag: "Aviso",
    icon: "pi pi-thumbtack",
    cor: "#ec2875",
    fundo: "#fce0ec",
  },
  atualizacao: {
    tag: "Atualização",
    icon: "pi pi-refresh",
    cor: "#00866b",
    fundo: "#e1f5ed",
  },
};
export interface ModalMensagemSeplagProps {
  visible: boolean;
  fechar: () => void;
  tipo: TipoMensagemSeplag;
  titulo: string;
  data?: string;
  children: ReactNode;
  anexos?: ReactNode;
  acaoAdicional?: ReactNode;
}
export function ModalMensagemSeplag({
  visible,
  fechar,
  tipo,
  titulo,
  data,
  children,
  anexos,
  acaoAdicional,
}: ModalMensagemSeplagProps) {
  const meta = tipos[tipo];
  const cores = {
    "--mensagem-cor": meta.cor,
    "--mensagem-fundo": meta.fundo,
  } as CSSProperties;
  return (
    <Dialog
      visible={visible}
      onHide={fechar}
      modal
      draggable={false}
      closeOnEscape
      blockScroll
      className="sigep-modal-mensagem"
      style={{ width: "min(720px, 94vw)", ...cores }}
      aria-label={`Comunicado: ${titulo}`}
      header={
        <div className="sigep-mensagem-cabecalho">
          <span className="sigep-mensagem-icone">
            <i className={meta.icon} aria-hidden="true" />
          </span>
          <div className="sigep-mensagem-identificacao">
            <h2>{titulo}</h2>
            <div className="sigep-mensagem-metadados">
              <span className="sigep-mensagem-tag">{meta.tag}</span>
              {data && (
                <span className="sigep-mensagem-data">
                  <i className="pi pi-calendar" aria-hidden="true" />
                  {data}
                </span>
              )}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="sigep-mensagem-acoes">
          <BotaoSeplag
            type="button"
            label="Fechar"
            icon="pi pi-times"
            onClick={fechar}
          />
          {acaoAdicional}
        </div>
      }
    >
      <div className="sigep-mensagem-conteudo">{children}</div>
      {anexos && <div className="sigep-mensagem-anexos">{anexos}</div>}
    </Dialog>
  );
}
