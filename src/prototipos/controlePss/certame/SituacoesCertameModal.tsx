import { useState } from "react";
import { useForm } from "react-hook-form";
import { CONTROLE_PSS_DATA_REFERENCIA } from "../constants";
import { controlePssStore, useControlePssStore } from "../controlePssStore";
import { calcularPrazoPrestacaoContas, dataEfeitoAnteriorPublicacao, homologacaoVigenteSemCancelamento, podeRegistrarRetificacaoEdital, podeRegistrarRetificacaoHomologacao } from "./validations";
import { SITUACOES_CERTAME } from "./dominios";
import { BlocoHeader } from "./CertameFormContent";
import type { SituacaoCertame } from "./types";
import { ModalSeplag } from "@componentes/Modal";
import { MensagemSeplag } from "@componentes/Mensagem";
import { BotaoSeplag } from "@componentes/Botao";
import { DateFieldSeplag, DropdownFieldSeplag } from "@componentes/Fields";
import { AnexarDocumentoSeplag, type ArquivoAnexadoSeplag } from "@componentes/AnexarDocumento";
import "./certame.css";

interface SituacaoFormValues { tipo:SituacaoCertame; data?:string }

const situacaoLabel:Record<SituacaoCertame, string> = Object.fromEntries(SITUACOES_CERTAME.map((item) => [item.value, item.label])) as Record<SituacaoCertame, string>;

// Mesmas regras de upload do restante do cadastro de certame (formato e tamanho).
const TAMANHO_MAXIMO_DOCUMENTO_CERTAME = 10 * 1024 * 1024;
function arquivoDocumentoCertameValido(arquivo:File):boolean {
 return arquivo.name.toLowerCase().endsWith(".pdf") && arquivo.size <= TAMANHO_MAXIMO_DOCUMENTO_CERTAME;
}

// Modal de "Situações" do certame — acessado pelo atalho de histórico na listagem (Ações), sem
// precisar abrir o cadastro completo só para consultar ou registrar uma situação.
export function SituacoesCertameModal({ certameId, onClose }:{ certameId:string; onClose:() => void }) {
 const { certames } = useControlePssStore();
 const certame = certames.find((item) => item.id === certameId);
 const [erro, setErro] = useState<string | null>(null);
 const [arquivoSituacao, setArquivoSituacao] = useState<ArquivoAnexadoSeplag | null>(null);
 const situacaoForm = useForm<SituacaoFormValues>({ defaultValues: { tipo:"HOMOLOGADO" } });

 const uploadArquivoSituacao = (event:{ files?:File[] }) => {
  const selecionado = event.files?.[0];
  if (!selecionado) return;
  if (!arquivoDocumentoCertameValido(selecionado)) { setErro("Documento inválido: formato aceito .pdf, com até 10MB."); return; }
  setErro(null);
  const reader = new FileReader();
  reader.onload = () => setArquivoSituacao({ nome:selecionado.name, extensao:"pdf", contentType:selecionado.type, conteudoEmBase64:String(reader.result).split(",")[1] ?? "", tamanho:selecionado.size });
  reader.readAsDataURL(selecionado);
 };

 const registrarSituacao = () => {
  if (!certame) return;
  const dados = situacaoForm.getValues();
  if (!dados.data) return;
  // RN-24d — mesma lógica de RN-07/CA05, aplicada à data de efeito da situação.
  if (dataEfeitoAnteriorPublicacao(dados.data, certame.dataPublicacaoEdital)) { setErro("A data de efeito não pode ser anterior à publicação do edital (RN-24d)."); return; }
  // RN-24a (ER142).
  if (dados.tipo === "RETIFICACAO_EDITAL" && !podeRegistrarRetificacaoEdital(certame.historicoSituacoes)) { setErro("Não é possível registrar Retificação de Edital: o certame ainda não possui um registro de abertura (Aberto) no histórico (RN-24a)."); return; }
  // RN-24b (ER144).
  if (dados.tipo === "HOMOLOGADO" && homologacaoVigenteSemCancelamento(certame.historicoSituacoes)) { setErro("Já existe uma Homologação registrada para este certame sem Cancelamento/Anulação posterior (RN-24b)."); return; }
  // RN-24c (ER145).
  if (dados.tipo === "RETIFICACAO_HOMOLOGACAO" && !podeRegistrarRetificacaoHomologacao(certame.historicoSituacoes)) { setErro("Não é possível registrar Retificação de Homologação sem um registro de Homologado anterior no histórico (RN-24c)."); return; }
  setErro(null);
  const prazo = calcularPrazoPrestacaoContas(dados.data);
  const registro = { id:`SIT-${certame.id}-${certame.historicoSituacoes.length + 1}`, certameId:certame.id, tipo:dados.tipo, dataEfeito:dados.data, registradoEm:`${CONTROLE_PSS_DATA_REFERENCIA.split("-").reverse().join("/")} ${new Date().toTimeString().slice(0, 5)}`, usuario:"SUGP/SEPLAG", prazoPrestacaoContas:prazo, documentoAnexado:arquivoSituacao?.nome };
  controlePssStore.set("certames", (atuais) => atuais.map((item) => item.id === certame.id ? { ...item, situacaoAtual:dados.tipo, historicoSituacoes:[...item.historicoSituacoes, registro], atualizadoEm:dados.data! } : item));
  situacaoForm.reset({ tipo:"HOMOLOGADO", data:"" });
  setArquivoSituacao(null);
 };

 if (!certame) return null;

 return <ModalSeplag visible titulo={`Situações — ${certame.numeroEditalOrgao}`} fechar={onClose} tamanho="920px" hideFooter closeOnEscape>
  <div className="col-12">
   {erro && <MensagemSeplag severity="error" message={erro} cols="12" />}
   <div className="prototype-certame-bloco">
    <BlocoHeader icone="pi-history" titulo="Histórico de situações" subtitulo="Situações registradas ao longo do ciclo de vida do certame." />
    <ol className="prototype-certame-timeline">{[...certame.historicoSituacoes].reverse().map((item, indice) => <li key={item.id}><i className={indice === 0 ? "active" : ""} /><div className="date"><strong>{item.dataEfeito}</strong><small>registrado em {item.registradoEm}</small></div><div className="event"><strong>{situacaoLabel[item.tipo]}</strong>{item.prazoPrestacaoContas && <p>Prazo de prestação de contas ao TCE-MT: até {item.prazoPrestacaoContas} (RN-15).</p>}{item.documentoAnexado && <p><i className="pi pi-paperclip" aria-hidden="true" /> {item.documentoAnexado}</p>}<small>{item.usuario}</small></div></li>)}</ol>
   </div>
   <div className="prototype-certame-bloco">
    <BlocoHeader icone="pi-plus-circle" titulo="Registrar nova situação" subtitulo="Adicione uma nova situação ao histórico do certame." />
    <div className="grid align-items-end prototype-certame-subform">
     <DropdownFieldSeplag name="tipo" control={situacaoForm.control} label="Nova situação" cols="12 6 3" options={[...SITUACOES_CERTAME]} optionLabel="label" optionValue="value" getFormErrorMessage={() => null} />
     <DateFieldSeplag name="data" control={situacaoForm.control} label="Data de efeito" cols="12 6 3" getFormErrorMessage={() => null} />
     <AnexarDocumentoSeplag cols="12 6 2" label="Documento de apoio (opcional)" arquivoBase64={arquivoSituacao ?? undefined} onUploadDocument={uploadArquivoSituacao} onRemoveArquivo={() => setArquivoSituacao(null)} handleViewArquivo={() => {}} canView={false} accept="application/pdf" maxFileSize={10_000_000} helpText="" chooseIconOnly />
     <div className="col-12 md:col-3"><BotaoSeplag type="button" label="Registrar situação" icon="pi pi-check" onClick={registrarSituacao} /></div>
    </div>
   </div>
  </div>
 </ModalSeplag>;
}

export default SituacoesCertameModal;
