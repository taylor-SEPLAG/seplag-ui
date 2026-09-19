import { useComissoes } from "./comissoesStore";
import { BlocoHeader } from "../certame/CertameFormContent";
import type { TipoEventoHistoricoMembro } from "./types";
import { ModalSeplag } from "@componentes/Modal";
import "../certame/certame.css";
import "./comissoes.css";

const iconePorTipo:Record<TipoEventoHistoricoMembro, string> = {
 MEMBRO_ADICIONADO: "pi-user-plus",
 CARGO_ALTERADO: "pi-sync",
 ARQUIVO_ATO_ALTERADO: "pi-file",
 MEMBRO_REMOVIDO: "pi-user-minus",
 DOCUMENTO_COMISSAO_ALTERADO: "pi-paperclip",
};

// Modal de "Histórico" da comissão — consulta, em ordem cronológica inversa, todo evento já
// registrado na composição (membro incluído/removido, cargo alterado, arquivo do ato de nomeação
// substituído). Cada evento é gravado uma única vez, no momento da alteração (ver confirmarMembro e
// confirmarRemocaoMembro em ComissaoFormContent.tsx) — este modal só lê o array, nunca registra nada.
export function HistoricoMembrosComissaoModal({ comissaoId, onClose }:{ comissaoId:string; onClose:() => void }) {
 const comissoes = useComissoes();
 const comissao = comissoes.find((item) => item.id === comissaoId);

 if (!comissao) return null;

 return <ModalSeplag visible titulo={`Histórico — Comissão ${comissao.numero}`} fechar={onClose} tamanho="820px" hideFooter closeOnEscape>
  <div className="col-12">
   <div className="prototype-certame-bloco">
    <BlocoHeader icone="pi-history" titulo="Histórico da composição" subtitulo="Alterações registradas nos membros desta comissão: inclusão, troca de cargo, substituição do ato de nomeação e remoção." />
    {comissao.historicoMembros.length === 0
     ? <p className="prototype-comissoes-membros-empty">Nenhuma alteração registrada até o momento.</p>
     : <ol className="prototype-certame-timeline">{[...comissao.historicoMembros].reverse().map((item, indice) => <li key={item.id}>
      <i className={indice === 0 ? "active" : ""} />
      <div className="date"><strong>{item.membroNome ?? "Comissão"}</strong><small>registrado em {item.registradoEm}</small></div>
      <div className="event">
       <strong><i className={`pi ${iconePorTipo[item.tipo]}`} aria-hidden="true" /> {item.descricao}</strong>
       <small className="prototype-certame-situacao-perfil"><i className="pi pi-user" aria-hidden="true" /> {item.usuario}</small>
      </div>
     </li>)}</ol>}
   </div>
  </div>
 </ModalSeplag>;
}

export default HistoricoMembrosComissaoModal;
