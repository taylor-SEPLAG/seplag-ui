import { differenceInCalendarDays } from "date-fns";
import { stringToDateSeplag } from "@uteis/manipulaData";
import { useControlePssStore } from "../controlePssStore";
import { SITUACOES_CERTAME } from "./dominios";
import { BlocoHeader } from "./CertameFormContent";
import type { SituacaoCertame } from "./types";
import { ModalSeplag } from "@componentes/Modal";
import "./certame.css";

const situacaoLabel:Record<SituacaoCertame, string> = Object.fromEntries(SITUACOES_CERTAME.map((item) => [item.value, item.label])) as Record<SituacaoCertame, string>;

// Deriva a quantidade de dias corridos do prazo (hoje sempre 2, RN001) a partir das duas datas já
// gravadas no histórico, em vez de repetir o número fixo usado em calcularPrazoPrestacaoContas.
function diasDoPrazo(dataEfeito:string, prazoPrestacaoContas:string):number | undefined {
 const inicio = stringToDateSeplag(dataEfeito);
 const fim = stringToDateSeplag(prazoPrestacaoContas);
 if (!inicio || !fim) return undefined;
 return differenceInCalendarDays(fim, inicio);
}

// Modal de "Histórico" do certame — só consulta a linha do tempo de situações já registradas (data,
// situação e quem registrou); para registrar uma nova situação, ver RegistrarSituacaoCertameModal
// (ação separada na listagem).
export function HistoricoSituacoesCertameModal({ certameId, onClose }:{ certameId:string; onClose:() => void }) {
 const { certames } = useControlePssStore();
 const certame = certames.find((item) => item.id === certameId);

 if (!certame) return null;

 return <ModalSeplag visible titulo={`Histórico — ${certame.numeroEditalOrgao}`} fechar={onClose} tamanho="820px" hideFooter closeOnEscape>
  <div className="col-12">
   <div className="prototype-certame-bloco">
    <BlocoHeader icone="pi-history" titulo="Histórico de situações" subtitulo="Situações registradas ao longo do ciclo de vida do certame." />
    <ol className="prototype-certame-timeline">{[...certame.historicoSituacoes].reverse().map((item, indice) => <li key={item.id}>
     <i className={indice === 0 ? "active" : ""} />
     <div className="date"><strong>{item.dataEfeito}</strong><small>registrado em {item.registradoEm}</small></div>
     <div className="event">
      <strong>{situacaoLabel[item.tipo]}</strong>
      {item.prazoPrestacaoContas && <p>Prazo de prestação de contas ao TCE-MT: {diasDoPrazo(item.dataEfeito, item.prazoPrestacaoContas) ?? 2} dias corridos (até {item.prazoPrestacaoContas}).</p>}
      <small className="prototype-certame-situacao-perfil"><i className="pi pi-user" aria-hidden="true" /> {item.usuario}</small>
     </div>
    </li>)}</ol>
   </div>
  </div>
 </ModalSeplag>;
}

export default HistoricoSituacoesCertameModal;
