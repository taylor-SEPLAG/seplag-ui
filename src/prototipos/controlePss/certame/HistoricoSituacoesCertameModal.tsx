import { useState } from "react";
import { useControlePssStore } from "../controlePssStore";
import { DOCUMENTOS_POR_SITUACAO, SITUACOES_CERTAME } from "./dominios";
import { BlocoHeader } from "./CertameFormContent";
import { DocumentosCertameTabela, type DocumentoCertameCatalogoItem } from "./DocumentosCertameTabela";
import type { Certame, SituacaoCertame, TipoDocumentoCertame } from "./types";
import { ModalSeplag } from "@componentes/Modal";
import type { ArquivoAnexadoSeplag } from "@componentes/AnexarDocumento";
import "./certame.css";

function arquivosDoCatalogo(catalogo:readonly DocumentoCertameCatalogoItem[] | undefined, certame:Certame):Partial<Record<TipoDocumentoCertame, ArquivoAnexadoSeplag>> {
 if (!catalogo) return {};
 const mapa:Partial<Record<TipoDocumentoCertame, ArquivoAnexadoSeplag>> = {};
 for (const doc of catalogo) {
  const existente = certame.documentos.find((item) => item.tipo === doc.tipo);
  if (existente) mapa[doc.tipo as TipoDocumentoCertame] = { nome:existente.nomeArquivo, extensao:"pdf", contentType:"application/pdf", conteudoEmBase64:"" };
 }
 return mapa;
}

const situacaoLabel:Record<SituacaoCertame, string> = Object.fromEntries(SITUACOES_CERTAME.map((item) => [item.value, item.label])) as Record<SituacaoCertame, string>;

// Modal de "Histórico" do certame — só consulta a linha do tempo de situações já registradas; para
// registrar uma nova situação, ver RegistrarSituacaoCertameModal (ação separada na listagem).
export function HistoricoSituacoesCertameModal({ certameId, onClose }:{ certameId:string; onClose:() => void }) {
 const { certames } = useControlePssStore();
 const certame = certames.find((item) => item.id === certameId);
 // Cada situação do histórico com catálogo de documentos (ver DOCUMENTOS_POR_SITUACAO) é clicável —
 // expande/recolhe, na própria linha, os documentos anexados àquele registro, em modo somente
 // leitura (consulta de um registro já salvo, não um rascunho a preencher).
 const [situacaoExpandidaId, setSituacaoExpandidaId] = useState<string | null>(null);

 if (!certame) return null;

 return <ModalSeplag visible titulo={`Histórico — ${certame.numeroEditalOrgao}`} fechar={onClose} tamanho="820px" hideFooter closeOnEscape>
  <div className="col-12">
   <div className="prototype-certame-bloco">
    <BlocoHeader icone="pi-history" titulo="Histórico de situações" subtitulo="Situações registradas ao longo do ciclo de vida do certame." />
    <ol className="prototype-certame-timeline">{[...certame.historicoSituacoes].reverse().map((item, indice) => {
     const catalogo = DOCUMENTOS_POR_SITUACAO[item.tipo];
     const expandida = situacaoExpandidaId === item.id;
     return <li key={item.id}>
      <i className={indice === 0 ? "active" : ""} />
      <div className="date"><strong>{item.dataEfeito}</strong><small>registrado em {item.registradoEm}</small></div>
      <div className="event">
       {catalogo
        ? <button type="button" className="prototype-certame-situacao-evento-btn" onClick={() => setSituacaoExpandidaId(expandida ? null : item.id)}>
           <strong>{situacaoLabel[item.tipo]}</strong>
           <span className="prototype-certame-situacao-evento-btn-dica">{expandida ? "ocultar documentos" : "ver documentos"}</span>
           <i className={expandida ? "pi pi-arrow-up" : "pi pi-arrow-down"} aria-hidden="true" />
          </button>
        : <strong>{situacaoLabel[item.tipo]}</strong>}
       {item.prazoPrestacaoContas && <p>Prazo de prestação de contas ao TCE-MT: até {item.prazoPrestacaoContas} (RN-15).</p>}
       {item.documentoAnexado && <p><i className="pi pi-paperclip" aria-hidden="true" /> {item.documentoAnexado}</p>}
       <small className="prototype-certame-situacao-perfil"><i className="pi pi-user" aria-hidden="true" /> {item.usuario}</small>
       {expandida && catalogo && <div className="prototype-certame-situacao-documentos">
        <span className="prototype-certame-situacao-documentos-titulo">Documentos de {situacaoLabel[item.tipo]}</span>
        <DocumentosCertameTabela documentos={catalogo} arquivos={arquivosDoCatalogo(catalogo, certame)} onChangeArquivo={() => {}} onError={() => {}} somenteLeitura />
       </div>}
      </div>
     </li>;
    })}</ol>
   </div>
  </div>
 </ModalSeplag>;
}

export default HistoricoSituacoesCertameModal;
