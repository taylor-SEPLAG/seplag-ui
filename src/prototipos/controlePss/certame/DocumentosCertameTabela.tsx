import { useState } from "react";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "@componentes/TablePaginado";
import { BotaoIconSeplag } from "@componentes/Botao";
import Base64FileModal from "@componentes/Base64FileModal";
import { ModalSeplag } from "@componentes/Modal";
import type { ArquivoAnexadoSeplag } from "@componentes/AnexarDocumento";
import type { ResultsSeplag } from "../../../interfaces/Results";
import type { TipoDocumentoCertame } from "./types";

export interface DocumentoCertameCatalogoItem { readonly tipo:string; readonly label:string; readonly obrigatorioSempre:boolean }

export const TAMANHO_MAXIMO_DOCUMENTO_CERTAME = 10 * 1024 * 1024;
const EXTENSOES_DOCUMENTO_CERTAME = ["pdf"];
export const SIGADOC_URL = "https://www.sigadoc.apmt.mt.gov.br/siga/public/app/login";

export function arquivoDocumentoCertameValido(arquivo:File):boolean {
 const extensao = arquivo.name.split(".").pop()?.toLowerCase() ?? "";
 return EXTENSOES_DOCUMENTO_CERTAME.includes(extensao) && arquivo.size <= TAMANHO_MAXIMO_DOCUMENTO_CERTAME;
}

export function formatarTamanhoArquivo(tamanho?:string | number):string {
 if (tamanho === undefined || tamanho === null || tamanho === "") return "—";
 if (typeof tamanho === "string") return tamanho;
 if (tamanho < 1024) return `${tamanho} B`;
 if (tamanho < 1024 * 1024) return `${(tamanho / 1024).toFixed(1)} KB`;
 return `${(tamanho / (1024 * 1024)).toFixed(1)} MB`;
}

export function resultadosSemPaginacao<T>(content:readonly T[]):ResultsSeplag<T> {
 return { content:[...content], totalPages:1, totalRecords:content.length, size:Math.max(content.length, 1), sizePage:Math.max(content.length, 1), pageActual:0, number:0, first:true, last:true, numberOfElements:content.length, empty:content.length === 0 };
}

// Seletor de modo de assinatura (Físico / Digital via SIGADOC) — mesmo campo usado no módulo de
// Ingresso. Reaproveitado tanto na aba Documentos do cadastro quanto no registro de situação.
export function SeletorFormaAssinaturaDocumento({ valor, onChange, name = "forma-assinatura-documentos-certame" }:{ valor:"fisica" | "sigadoc"; onChange:(valor:"fisica" | "sigadoc") => void; name?:string }) {
 return <fieldset className="prototype-documentos-assinatura-selector">
  <legend>Modo de assinatura do documento</legend>
  <div className="prototype-documentos-assinatura-options">
   <label>
    <input type="radio" name={name} value="fisica" checked={valor === "fisica"} onChange={() => onChange("fisica")} />
    <span>Físico</span>
   </label>
   <label>
    <input type="radio" name={name} value="digital" checked={valor === "sigadoc"} onChange={() => onChange("sigadoc")} />
    <span>Digital</span>
    <small>SIGADOC</small>
   </label>
  </div>
 </fieldset>;
}

export interface DocumentosCertameTabelaProps {
 readonly documentos: readonly DocumentoCertameCatalogoItem[];
 readonly arquivos: Partial<Record<TipoDocumentoCertame, ArquivoAnexadoSeplag>>;
 readonly onChangeArquivo: (tipo:TipoDocumentoCertame, arquivo:ArquivoAnexadoSeplag | undefined) => void;
 readonly processosSigadoc: Partial<Record<TipoDocumentoCertame, string>>;
 readonly onChangeProcessoSigadoc: (tipo:TipoDocumentoCertame, numero:string | undefined) => void;
 readonly formaAssinatura: "fisica" | "sigadoc";
 readonly documentoObrigatorio?: (tipo:string, obrigatorioSempre:boolean) => boolean;
 readonly onError: (mensagem:string) => void;
 /** Esconde upload/SIGADOC/remoção — só o botão de visualizar. Usado ao consultar os documentos de
  * uma situação já registrada no histórico, para não parecer editável um registro já salvo. */
 readonly somenteLeitura?: boolean;
}

// Tabela de documentos do certame (Documento | Arquivo anexado | Tamanho | Nº Processo SIGADOC |
// Ações), com upload direto ou via SIGADOC conforme o modo de assinatura selecionado. Reaproveitada
// tanto na aba Documentos do cadastro completo (uma instância por grupo/situação) quanto no registro
// de nova situação (SituacoesCertameModal), para que o mesmo documento anexado em qualquer uma das
// duas telas apareça refletido na outra (ambas leem/gravam em Certame.documentos).
export function DocumentosCertameTabela({ documentos, arquivos, onChangeArquivo, processosSigadoc, onChangeProcessoSigadoc, formaAssinatura, documentoObrigatorio, onError, somenteLeitura }:DocumentosCertameTabelaProps) {
 const [documentoVisualizando, setDocumentoVisualizando] = useState<TipoDocumentoCertame | null>(null);
 // Força o remount da tabela: o DataTable do PrimeReact não repinta o body das colunas em re-render simples.
 const [documentosVersao, setDocumentosVersao] = useState(0);
 const [documentoUploadSigadoc, setDocumentoUploadSigadoc] = useState<TipoDocumentoCertame | null>(null);
 const [processoUploadSigadoc, setProcessoUploadSigadoc] = useState("");
 const [arquivoUploadSigadoc, setArquivoUploadSigadoc] = useState<File | null>(null);
 const [erroUploadSigadoc, setErroUploadSigadoc] = useState(false);

 const criarUploadHandler = (tipo:TipoDocumentoCertame) => (event:{ files?:File[] }) => {
  const selecionado = event.files?.[0];
  if (!selecionado) return;
  if (!arquivoDocumentoCertameValido(selecionado)) { onError("Documento inválido: formato aceito .pdf, com até 10MB."); return; }
  const reader = new FileReader();
  reader.onload = () => {
   onChangeArquivo(tipo, { nome:selecionado.name, extensao:"pdf", contentType:selecionado.type, conteudoEmBase64:String(reader.result).split(",")[1] ?? "", tamanho:selecionado.size });
   setDocumentosVersao((versao) => versao + 1);
  };
  reader.readAsDataURL(selecionado);
 };
 const abrirUploadSigadoc = (tipo:TipoDocumentoCertame) => {
  setDocumentoUploadSigadoc(tipo);
  setProcessoUploadSigadoc(processosSigadoc[tipo] ?? "");
  setArquivoUploadSigadoc(null);
  setErroUploadSigadoc(false);
 };
 const salvarUploadSigadoc = () => {
  if (!documentoUploadSigadoc || !processoUploadSigadoc.trim() || !arquivoUploadSigadoc || !arquivoDocumentoCertameValido(arquivoUploadSigadoc)) {
   setErroUploadSigadoc(true);
   return;
  }
  setErroUploadSigadoc(false);
  onChangeProcessoSigadoc(documentoUploadSigadoc, processoUploadSigadoc.trim());
  criarUploadHandler(documentoUploadSigadoc)({ files:[arquivoUploadSigadoc] });
  setDocumentoUploadSigadoc(null);
 };

 const obrigatorio = documentoObrigatorio ?? ((_tipo:string, obrigatorioSempre:boolean) => obrigatorioSempre);

 const colunasDocumentos:ColumnMetaSeplag<DocumentoCertameCatalogoItem>[] = [
  { header:"Documento", body:(row) => <>{row.label}{obrigatorio(row.tipo, row.obrigatorioSempre) && " *"}</> },
  { header:"Arquivo anexado", body:(row) => arquivos[row.tipo as TipoDocumentoCertame]?.nome ?? <span className="text-color-secondary">Nenhum arquivo anexado</span> },
  { header:"Tamanho", body:(row) => formatarTamanhoArquivo(arquivos[row.tipo as TipoDocumentoCertame]?.tamanho) },
  ...(formaAssinatura === "sigadoc" ? [{ header:"Nº Processo SIGADOC", body:(row) => processosSigadoc[row.tipo as TipoDocumentoCertame] || <span className="text-color-secondary">—</span> } as ColumnMetaSeplag<DocumentoCertameCatalogoItem>] : []),
 ];

 const renderAcoesDocumento = (row:DocumentoCertameCatalogoItem) => {
  const tipo = row.tipo as TipoDocumentoCertame;
  const arquivo = arquivos[tipo];
  const usaSigadoc = formaAssinatura === "sigadoc";
  const inputId = `certame-doc-upload-${row.tipo}`;
  if (somenteLeitura) return <BotaoIconSeplag type="button" icon="pi pi-eye" tooltip="Visualizar documento" disabled={!arquivo} onClick={() => setDocumentoVisualizando(tipo)} />;
  return <>
   {!usaSigadoc && <input id={inputId} type="file" accept="application/pdf" style={{ display:"none" }} onChange={(event) => { const arquivoSelecionado = event.target.files?.[0]; if (arquivoSelecionado) criarUploadHandler(tipo)({ files:[arquivoSelecionado] }); event.target.value = ""; }} />}
   <BotaoIconSeplag type="button" icon="pi pi-cloud-upload" tooltip={arquivo ? (usaSigadoc ? "Documento já enviado" : "Substituir documento") : "Anexar documento"} disabled={usaSigadoc && Boolean(arquivo)} onClick={() => { if (usaSigadoc) abrirUploadSigadoc(tipo); else document.getElementById(inputId)?.click(); }} />
   {usaSigadoc && <BotaoIconSeplag type="button" icon="pi pi-link" tooltip="Acessar SIGADOC" onClick={() => window.open(SIGADOC_URL, "_blank", "noopener,noreferrer")} />}
   <BotaoIconSeplag type="button" icon="pi pi-eye" tooltip="Visualizar documento" disabled={!arquivo} onClick={() => setDocumentoVisualizando(tipo)} />
   <BotaoIconSeplag type="button" icon="pi pi-trash" severity="danger" tooltip="Remover documento" disabled={!arquivo} onClick={() => { onChangeArquivo(tipo, undefined); onChangeProcessoSigadoc(tipo, undefined); setDocumentosVersao((versao) => versao + 1); }} />
  </>;
 };

 return <>
  <TablePaginadoSeplag key={`${documentosVersao}-${formaAssinatura}`} dataKey="tipo" data={resultadosSemPaginacao(documentos)} rows={50} paginator={false} lazy={false} selectionMode={null} columns={colunasDocumentos} hasEventoAcao renderBotoes={renderAcoesDocumento} handleOnPageChange={() => {}} />
  <Base64FileModal
   visible={documentoVisualizando !== null}
   onHide={() => setDocumentoVisualizando(null)}
   base64={documentoVisualizando ? arquivos[documentoVisualizando]?.conteudoEmBase64 : null}
   mimeType="application/pdf"
   fileName={documentoVisualizando ? arquivos[documentoVisualizando]?.nome : undefined}
   header={documentoVisualizando ? documentos.find((item) => item.tipo === documentoVisualizando)?.label : undefined}
  />
  <ModalSeplag
   visible={documentoUploadSigadoc !== null}
   titulo="Anexar documento assinado via SIGADOC"
   fechar={() => setDocumentoUploadSigadoc(null)}
   funcAcao={salvarUploadSigadoc}
   labelAcao="Anexar"
   iconAcao="pi pi-cloud-upload"
   tamanho="560px"
  >
   <div className="prototype-upload-sigadoc-modal">
    <p><strong>Documento:</strong> {documentoUploadSigadoc ? documentos.find((item) => item.tipo === documentoUploadSigadoc)?.label : ""}</p>
    <label className="prototype-ingresso-field">
     <span>Número do Processo SIGADOC<em>*</em></span>
     <input type="text" value={processoUploadSigadoc} placeholder="Ex.: SEPLAG-PRO-2026/01234" aria-invalid={erroUploadSigadoc && !processoUploadSigadoc.trim()} onChange={(event) => setProcessoUploadSigadoc(event.target.value)} />
    </label>
    <label className="prototype-ingresso-field">
     <span>PDF assinado extraído do SIGADOC<em>*</em></span>
     <input type="file" accept="application/pdf,.pdf" aria-invalid={erroUploadSigadoc && !arquivoUploadSigadoc} onChange={(event) => setArquivoUploadSigadoc(event.target.files?.[0] ?? null)} />
    </label>
    {erroUploadSigadoc ? <small className="prototype-documentos-sigadoc-error">Informe o número do processo e selecione um arquivo .pdf de até 10MB.</small> : null}
   </div>
  </ModalSeplag>
 </>;
}

export default DocumentosCertameTabela;
