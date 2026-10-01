import { useMemo, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { stringToDateSeplag } from "@uteis/manipulaData";
import { useControlePssStore } from "../controlePssStore";
import { SITUACOES_CERTAME } from "./dominios";
import { BlocoHeader } from "./CertameFormContent";
import type { SituacaoCertame } from "./types";
import { ModalSeplag } from "@componentes/Modal";
import { BotaoIconSeplag } from "@componentes/Botao";
import Base64FileModal from "@componentes/Base64FileModal";
import "./certame.css";

const situacaoLabel:Record<SituacaoCertame, string> = Object.fromEntries(SITUACOES_CERTAME.map((item) => [item.value, item.label])) as Record<SituacaoCertame, string>;

// Um ícone por tipo de situação — mesma ideia do iconePorTipo do Histórico de membros da Comissão
// (HistoricoMembrosComissaoModal), sem cor por tipo para não depender do mapa situacaoEstilo (privado
// de CertamesListContent e com uma lacuna conhecida/pré-existente em RETOMADA_CRONOGRAMA).
const iconePorSituacao:Record<SituacaoCertame, string> = {
 ABERTO: "pi-play",
 RETIFICACAO_EDITAL: "pi-pencil",
 HOMOLOGADO: "pi-check",
 RETIFICACAO_HOMOLOGACAO: "pi-sync",
 PRORROGACAO_VALIDADE: "pi-clock",
 CANCELADO_ANULADO: "pi-times",
 PARALISADO: "pi-pause",
 HOMOLOGACAO_PARCIAL: "pi-check-circle",
 RETIFICACAO_HOMOLOGACAO_PARCIAL: "pi-sync",
 RETOMADA_CRONOGRAMA: "pi-play-circle",
};

// Deriva a quantidade de dias corridos do prazo (hoje sempre 2, RN001) a partir das duas datas já
// gravadas no histórico, em vez de repetir o número fixo usado em calcularPrazoPrestacaoContas.
function diasDoPrazo(dataEfeito:string, prazoPrestacaoContas:string):number | undefined {
 const inicio = stringToDateSeplag(dataEfeito);
 const fim = stringToDateSeplag(prazoPrestacaoContas);
 if (!inicio || !fim) return undefined;
 return differenceInCalendarDays(fim, inicio);
}

// Modal de "Histórico" do certame — só consulta a linha do tempo de situações já registradas; para
// registrar uma nova situação, ver RegistrarSituacaoCertameModal (ação separada na listagem). Duas
// colunas — linha do tempo clicável à esquerda, detalhe da situação selecionada à direita (Justificativa
// + Documentos) — mesmo padrão visual do Histórico de membros da Comissão (HistoricoMembrosComissaoModal).
export function HistoricoSituacoesCertameModal({ certameId, onClose }:{ certameId:string; onClose:() => void }) {
 const { certames } = useControlePssStore();
 const certame = certames.find((item) => item.id === certameId);
 const eventos = useMemo(() => certame ? [...certame.historicoSituacoes].reverse() : [], [certame]);
 const [eventoSelecionadoId, setEventoSelecionadoId] = useState<string | null>(null);
 const [documentoVisualizado, setDocumentoVisualizado] = useState<{ nome:string; conteudoEmBase64?:string } | null>(null);
 const eventoSelecionado = eventos.find((item) => item.id === eventoSelecionadoId) ?? eventos[0];

 if (!certame) return null;

 return <ModalSeplag visible titulo={`Histórico — ${certame.numeroEditalOrgao}`} fechar={onClose} tamanho="1080px" hideFooter closeOnEscape>
  <div className="col-12 prototype-certame-historico">
   {eventos.length === 0
    ? <div className="prototype-certame-bloco">
       <BlocoHeader icone="pi-history" titulo="Histórico de situações" subtitulo="Situações registradas ao longo do ciclo de vida do certame." />
       <p className="prototype-certame-historico-empty">Nenhuma situação registrada até o momento.</p>
      </div>
    : <div className="prototype-certame-historico-layout">
      <div className="prototype-certame-bloco prototype-certame-historico-lista-bloco">
       <BlocoHeader icone="pi-history" titulo="Histórico de situações" subtitulo="Situações registradas ao longo do ciclo de vida do certame." />
       <ol className="prototype-certame-historico-lista">
        {eventos.map((item) => <li key={item.id}>
         <button type="button" className={`prototype-certame-historico-item${eventoSelecionado?.id === item.id ? " is-selected" : ""}`} onClick={() => setEventoSelecionadoId(item.id)}>
          <span className="prototype-certame-historico-icone"><i className={`pi ${iconePorSituacao[item.tipo]}`} aria-hidden="true" /></span>
          <span className="prototype-certame-historico-item-texto">
           <strong>{situacaoLabel[item.tipo]}</strong>
           <small>Data do efeito {item.dataEfeito}</small>
           {item.prazoPrestacaoContas && <small>Prazo de prestação de contas ao TCE-MT: até {item.prazoPrestacaoContas} ({diasDoPrazo(item.dataEfeito, item.prazoPrestacaoContas) ?? 2} dias corridos).</small>}
           <small className="prototype-certame-situacao-perfil"><i className="pi pi-user" aria-hidden="true" /> {item.usuario} · registrado em {item.registradoEm}</small>
          </span>
         </button>
        </li>)}
       </ol>
      </div>

      {eventoSelecionado && <div className="prototype-certame-historico-detalhe">
       <div className="prototype-certame-bloco">
        <BlocoHeader icone="pi-comment" titulo="Justificativa da situação" subtitulo={`${situacaoLabel[eventoSelecionado.tipo]} · Data do efeito ${eventoSelecionado.dataEfeito}`} />
        <p>{eventoSelecionado.justificativa ?? "Nenhuma justificativa registrada para esta situação."}</p>
       </div>

       {eventoSelecionado.documentosAnexados && eventoSelecionado.documentosAnexados.length > 0 && <div className="prototype-certame-bloco">
        <BlocoHeader icone="pi-folder" titulo="Documentos da situação" subtitulo={`${situacaoLabel[eventoSelecionado.tipo]} · Data do efeito ${eventoSelecionado.dataEfeito}`} />
        <table className="prototype-simple-table prototype-certame-historico-doc-table">
         <thead><tr><th>Documento</th><th>Ações</th></tr></thead>
         <tbody>
          {eventoSelecionado.documentosAnexados.map((documento, indice) => <tr key={`${documento.nome}-${indice}`}>
           <td>{documento.nome}</td>
           <td><BotaoIconSeplag type="button" icon="pi pi-eye" tooltip={documento.conteudoEmBase64 ? "Visualizar arquivo" : "Arquivo sem conteúdo disponível neste protótipo"} disabled={!documento.conteudoEmBase64} onClick={() => setDocumentoVisualizado(documento)} /></td>
          </tr>)}
         </tbody>
        </table>
       </div>}
      </div>}
     </div>}
  </div>

  <Base64FileModal
   visible={documentoVisualizado !== null}
   onHide={() => setDocumentoVisualizado(null)}
   base64={documentoVisualizado?.conteudoEmBase64 ?? null}
   mimeType="application/pdf"
   fileName={documentoVisualizado?.nome}
   header={documentoVisualizado?.nome}
  />
 </ModalSeplag>;
}

export default HistoricoSituacoesCertameModal;
