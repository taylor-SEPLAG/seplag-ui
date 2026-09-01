import { useState } from "react";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "@componentes/TablePaginado";
import { BotaoIconSeplag } from "@componentes/Botao";
import Base64FileModal from "@componentes/Base64FileModal";
import type { ArquivoAnexadoSeplag } from "@componentes/AnexarDocumento";
import type { ResultsSeplag } from "../../../interfaces/Results";
import type { TipoDocumentoCertame } from "./types";

export interface DocumentoCertameCatalogoItem { readonly tipo:string; readonly label:string; readonly obrigatorioSempre:boolean }

export const TAMANHO_MAXIMO_DOCUMENTO_CERTAME = 10 * 1024 * 1024;
const EXTENSOES_DOCUMENTO_CERTAME = ["pdf"];

export function arquivoDocumentoCertameValido(arquivo:File):boolean {
 const extensao = arquivo.name.split(".").pop()?.toLowerCase() ?? "";
 return EXTENSOES_DOCUMENTO_CERTAME.includes(extensao) && arquivo.size <= TAMANHO_MAXIMO_DOCUMENTO_CERTAME;
}

function baixarArquivoDocumentoCertame(arquivo:ArquivoAnexadoSeplag) {
 const binario = atob(arquivo.conteudoEmBase64);
 const bytes = Uint8Array.from(binario, (caractere) => caractere.codePointAt(0) ?? 0);
 const url = URL.createObjectURL(new Blob([bytes], { type:arquivo.contentType || "application/pdf" }));
 const link = document.createElement("a");
 link.href = url;
 link.download = arquivo.nome;
 link.click();
 URL.revokeObjectURL(url);
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

export interface DocumentosCertameTabelaProps {
 readonly documentos: readonly DocumentoCertameCatalogoItem[];
 readonly arquivos: Partial<Record<TipoDocumentoCertame, ArquivoAnexadoSeplag>>;
 readonly onChangeArquivo: (tipo:TipoDocumentoCertame, arquivo:ArquivoAnexadoSeplag | undefined) => void;
 readonly documentoObrigatorio?: (tipo:string, obrigatorioSempre:boolean) => boolean;
 readonly onError: (mensagem:string) => void;
 /** Esconde upload/download/remoção — só o botão de visualizar. Usado ao consultar os documentos
  * de uma situação já registrada no histórico, para não parecer editável um registro já salvo. */
 readonly somenteLeitura?: boolean;
}

// Tabela de documentos do certame (Documento | Arquivo anexado | Tamanho | Ações), assinatura física
// (upload direto do PDF assinado). Reaproveitada tanto na aba Documentos do cadastro completo (uma
// instância por grupo/situação) quanto no registro/consulta de situação (RegistrarSituacaoCertameModal
// e HistoricoSituacoesCertameModal), para que
// o mesmo documento anexado em qualquer uma das duas telas apareça refletido na outra (ambas
// leem/gravam em Certame.documentos).
export function DocumentosCertameTabela({ documentos, arquivos, onChangeArquivo, documentoObrigatorio, onError, somenteLeitura }:DocumentosCertameTabelaProps) {
 const [documentoVisualizando, setDocumentoVisualizando] = useState<TipoDocumentoCertame | null>(null);
 // Força o remount da tabela: o DataTable do PrimeReact não repinta o body das colunas em re-render simples.
 const [documentosVersao, setDocumentosVersao] = useState(0);

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

 const obrigatorio = documentoObrigatorio ?? ((_tipo:string, obrigatorioSempre:boolean) => obrigatorioSempre);

 const colunasDocumentos:ColumnMetaSeplag<DocumentoCertameCatalogoItem>[] = [
  { header:"Documento", body:(row) => <>{row.label}{obrigatorio(row.tipo, row.obrigatorioSempre) && " *"}</> },
  { header:"Arquivo anexado", body:(row) => arquivos[row.tipo as TipoDocumentoCertame]?.nome ?? <span className="text-color-secondary">Nenhum arquivo anexado</span> },
  { header:"Tamanho", body:(row) => formatarTamanhoArquivo(arquivos[row.tipo as TipoDocumentoCertame]?.tamanho) },
 ];

 const renderAcoesDocumento = (row:DocumentoCertameCatalogoItem) => {
  const tipo = row.tipo as TipoDocumentoCertame;
  const arquivo = arquivos[tipo];
  const inputId = `certame-doc-upload-${row.tipo}`;
  if (somenteLeitura) return <>
   <BotaoIconSeplag type="button" icon="pi pi-eye" tooltip="Visualizar documento" disabled={!arquivo} onClick={() => setDocumentoVisualizando(tipo)} />
  </>;
  return <>
   <input id={inputId} type="file" accept="application/pdf" style={{ display:"none" }} onChange={(event) => { const arquivoSelecionado = event.target.files?.[0]; if (arquivoSelecionado) criarUploadHandler(tipo)({ files:[arquivoSelecionado] }); event.target.value = ""; }} />
   <BotaoIconSeplag type="button" icon="pi pi-cloud-upload" tooltip={arquivo ? "Substituir documento" : "Anexar documento"} onClick={() => document.getElementById(inputId)?.click()} />
   <BotaoIconSeplag type="button" icon="pi pi-eye" tooltip="Visualizar documento" disabled={!arquivo} onClick={() => setDocumentoVisualizando(tipo)} />
   <BotaoIconSeplag type="button" icon="pi pi-download" tooltip="Realizar download do arquivo anexado." disabled={!arquivo} onClick={() => arquivo && baixarArquivoDocumentoCertame(arquivo)} />
   <BotaoIconSeplag type="button" icon="pi pi-trash" severity="danger" tooltip="Remover documento" disabled={!arquivo} onClick={() => { onChangeArquivo(tipo, undefined); setDocumentosVersao((versao) => versao + 1); }} />
  </>;
 };

 return <>
  <TablePaginadoSeplag key={documentosVersao} dataKey="tipo" data={resultadosSemPaginacao(documentos)} rows={50} paginator={false} lazy={false} selectionMode={null} columns={colunasDocumentos} hasEventoAcao renderBotoes={renderAcoesDocumento} handleOnPageChange={() => {}} />
  <Base64FileModal
   visible={documentoVisualizando !== null}
   onHide={() => setDocumentoVisualizando(null)}
   base64={documentoVisualizando ? arquivos[documentoVisualizando]?.conteudoEmBase64 : null}
   mimeType="application/pdf"
   fileName={documentoVisualizando ? arquivos[documentoVisualizando]?.nome : undefined}
   header={documentoVisualizando ? documentos.find((item) => item.tipo === documentoVisualizando)?.label : undefined}
  />
 </>;
}

export default DocumentosCertameTabela;
