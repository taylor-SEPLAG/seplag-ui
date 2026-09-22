import { useMemo, useState } from "react";
import { useComissoes } from "./comissoesStore";
import { BlocoHeader } from "../certame/CertameFormContent";
import type { TipoEventoHistoricoMembro } from "./types";
import { ModalSeplag } from "@componentes/Modal";
import { BotaoIconSeplag } from "@componentes/Botao";
import Base64FileModal from "@componentes/Base64FileModal";
import "../certame/certame.css";
import "./comissoes.css";

const iconePorTipo:Record<TipoEventoHistoricoMembro, string> = {
 MEMBRO_ADICIONADO: "pi-user-plus",
 CARGO_ALTERADO: "pi-sync",
 ARQUIVO_ATO_ALTERADO: "pi-file",
 MEMBRO_REMOVIDO: "pi-user-minus",
 DOCUMENTO_COMISSAO_ALTERADO: "pi-paperclip",
 STATUS_ALTERADO: "pi-flag",
};

const tituloPorTipo:Record<TipoEventoHistoricoMembro, string> = {
 MEMBRO_ADICIONADO: "Membro incluído",
 CARGO_ALTERADO: "Cargo alterado",
 ARQUIVO_ATO_ALTERADO: "Arquivo do ato de nomeação",
 MEMBRO_REMOVIDO: "Membro removido",
 DOCUMENTO_COMISSAO_ALTERADO: "Documento da comissão",
 STATUS_ALTERADO: "Status da comissão",
};

// Modal de "Histórico" da comissão — consulta, em ordem cronológica inversa, todo evento já
// registrado na composição, no documento e no status (membro incluído/removido, cargo alterado,
// arquivo do ato de nomeação ou documento da comissão substituído, status alterado). Cada evento é
// gravado uma única vez, no momento da alteração (ver registrarEventosMembro/
// confirmarRemocaoMembro/registrarEventoDocumentoComissao/registrarMudancaStatus em
// ComissaoFormContent.tsx e comissoesStore.alterarStatus) — este modal só lê o array, nunca registra
// nada. Duas colunas — linha do tempo clicável à esquerda, detalhe do evento selecionado à direita —
// mesmo padrão visual do Histórico de situações do Certame (HistoricoSituacoesCertameModal).
export function HistoricoMembrosComissaoModal({ comissaoId, onClose }:{ comissaoId:string; onClose:() => void }) {
 const comissoes = useComissoes();
 const comissao = comissoes.find((item) => item.id === comissaoId);
 const eventos = useMemo(() => comissao ? [...comissao.historicoMembros].reverse() : [], [comissao]);
 const [eventoSelecionadoId, setEventoSelecionadoId] = useState<string | null>(null);
 const [visualizarArquivo, setVisualizarArquivo] = useState(false);
 const eventoSelecionado = eventos.find((item) => item.id === eventoSelecionadoId) ?? eventos[0];

 if (!comissao) return null;

 return <ModalSeplag visible titulo={`Histórico — Comissão ${comissao.numero}`} fechar={onClose} tamanho="1080px" hideFooter closeOnEscape>
  <div className="col-12 prototype-comissoes-historico">
   {eventos.length === 0
    ? <div className="prototype-certame-bloco">
       <BlocoHeader icone="pi-history" titulo="Histórico da composição" subtitulo="Alterações registradas nesta comissão: composição, documento e status." />
       <p className="prototype-comissoes-membros-empty">Nenhuma alteração registrada até o momento.</p>
      </div>
    : <div className="prototype-comissoes-historico-layout">
      <div className="prototype-certame-bloco prototype-comissoes-historico-lista-bloco">
       <BlocoHeader icone="pi-history" titulo="Histórico de eventos" subtitulo="Selecione um evento para ver os detalhes." />
       <ol className="prototype-comissoes-historico-lista">
        {eventos.map((item) => <li key={item.id}>
         <button type="button" className={`prototype-comissoes-historico-item${eventoSelecionado?.id === item.id ? " is-selected" : ""}`} onClick={() => setEventoSelecionadoId(item.id)}>
          <span className="prototype-comissoes-historico-icone"><i className={`pi ${iconePorTipo[item.tipo]}`} aria-hidden="true" /></span>
          <span className="prototype-comissoes-historico-item-texto">
           <strong>{item.membroNome ?? "Comissão"}</strong>
           <small>registrado em {item.registradoEm}</small>
          </span>
         </button>
        </li>)}
       </ol>
      </div>

      {eventoSelecionado && <div className="prototype-comissoes-historico-detalhe">
       <div className="prototype-certame-bloco">
        <BlocoHeader icone="pi-comment" titulo="Detalhes do evento" subtitulo="Descrição e responsável pelo registro." />
        <p className="prototype-comissoes-historico-tipo">{tituloPorTipo[eventoSelecionado.tipo]} · {eventoSelecionado.membroNome ?? "Comissão"}</p>
        <p>{eventoSelecionado.descricao}</p>
        <small className="prototype-certame-situacao-perfil"><i className="pi pi-user" aria-hidden="true" /> {eventoSelecionado.usuario} · registrado em {eventoSelecionado.registradoEm}</small>
       </div>

       {eventoSelecionado.arquivo && <div className="prototype-certame-bloco">
        <BlocoHeader icone="pi-folder" titulo="Documento do evento" subtitulo="Arquivo anexado no momento deste evento." />
        <table className="prototype-simple-table prototype-comissoes-historico-doc-table">
         <thead><tr><th>Documento</th><th>Ações</th></tr></thead>
         <tbody><tr><td>{eventoSelecionado.arquivo.nome}</td><td><BotaoIconSeplag type="button" icon="pi pi-eye" tooltip="Visualizar arquivo" onClick={() => setVisualizarArquivo(true)} /></td></tr></tbody>
        </table>
       </div>}
      </div>}
     </div>}
  </div>

  <Base64FileModal
   visible={visualizarArquivo}
   onHide={() => setVisualizarArquivo(false)}
   base64={eventoSelecionado?.arquivo?.conteudoEmBase64 ?? null}
   mimeType="application/pdf"
   fileName={eventoSelecionado?.arquivo?.nome}
   header={eventoSelecionado?.arquivo?.nome}
  />
 </ModalSeplag>;
}

export default HistoricoMembrosComissaoModal;
