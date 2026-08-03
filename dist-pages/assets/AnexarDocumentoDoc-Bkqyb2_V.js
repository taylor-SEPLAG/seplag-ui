import{a as e,n as t,t as n}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{t as r}from"./AnexarDocumento-CqWlJBBV.js";import{t as i}from"./DocPage-DfNa9OED.js";var a=e(t(),1),o=n();function s(){return(0,o.jsx)(r,{fileUploadRef:(0,a.useRef)(null),arquivoBase64:null,handleViewArquivo:()=>{},onUploadDocument:e=>console.log(`upload`,e),onRemoveArquivo:()=>{},label:`Comprovante`,cols:`12`})}function c(){return(0,o.jsx)(r,{fileUploadRef:(0,a.useRef)(null),arquivoBase64:{nome:`comprovante`,extensao:`pdf`,contentType:`application/pdf`,conteudoEmBase64:`BASE64_AQUI`},handleViewArquivo:()=>alert(`Visualizar documento`),onRemoveArquivo:()=>alert(`Arquivo removido`),label:`Comprovante`,cols:`12`})}function l(){return(0,o.jsx)(r,{fileUploadRef:(0,a.useRef)(null),arquivoBase64:null,handleViewArquivo:()=>{},onUploadDocument:e=>console.log(`upload`,e),onRemoveArquivo:()=>{},label:`arquivo`,cols:`12`,dragDrop:!0,accept:`.pdf`,maxFileSize:10485760,chooseLabel:`Selecionar arquivo`,helperText:`Formato aceito: .pdf | Tamanho maximo: 2MB`,emptyTemplateText:`Arraste e solte o arquivo aqui`})}var u=[{title:`Sem arquivo anexado`,description:`Estado inicial — exibe o botão de upload.`,example:(0,o.jsx)(s,{}),code:`import { useRef } from "react";
import { AnexarDocumentoSeplag } from "@seplag/ui-lib-react-18";
import { FileUpload } from "primereact/fileupload";

const fileUploadRef = useRef<FileUpload | null>(null);

<AnexarDocumentoSeplag
  fileUploadRef={fileUploadRef}
  arquivoBase64={null}
  handleViewArquivo={() => {}}
  onUploadDocument={(e) => handleUpload(e)}
  onRemoveArquivo={() => handleRemove()}
  label="Comprovante"
  cols="12"
/>`},{title:`Com arquivo anexado`,description:`Quando arquivoBase64 está preenchido, exibe os botões de Visualizar e Remover.`,example:(0,o.jsx)(c,{}),code:`<AnexarDocumentoSeplag
  fileUploadRef={fileUploadRef}
  arquivoBase64={{
    nome: "comprovante",
    extensao: "pdf",
    contentType: "application/pdf",
    conteudoEmBase64: base64String,
  }}
  handleViewArquivo={() => openDocument()}
  onRemoveArquivo={() => clearDocument()}
  label="Comprovante"
/>`},{title:`Area com drag-drop`,description:`Quando dragDrop esta ativo, exibe uma área para arrastar e soltar o arquivo, mantendo tambem o botão de seleção.`,example:(0,o.jsx)(l,{}),code:`<AnexarDocumentoSeplag
  fileUploadRef={fileUploadRef}
  arquivoBase64={null}
  handleViewArquivo={() => {}}
  onUploadDocument={(e) => handleUpload(e)}
  label="Arquivo"
  cols="12"
  dragDrop
  accept=".pdf"
  maxFileSize={10485760}
  chooseLabel="Selecionar arquivo"
  helperText="Formato aceito: .pdf | Tamanho maximo: 2MB"
  emptyTemplateText="Arraste e solte o arquivo aqui"
/>`}],d=[{name:`fileUploadRef`,type:`RefObject<FileUpload | null>`,required:!1,description:`Ref para o componente PrimeReact FileUpload (acesso programático).`},{name:`arquivoBase64`,type:`{ nome, extensao, contentType, conteudoEmBase64 } | null`,required:!1,description:`Arquivo atualmente anexado. null = nenhum arquivo.`},{name:`handleViewArquivo`,type:`() => void`,required:!0,description:`Callback para visualizar o arquivo anexado.`},{name:`onUploadDocument`,type:`(event: any) => void`,required:!1,description:`Callback chamado ao selecionar um arquivo para upload.`},{name:`onRemoveArquivo`,type:`() => void`,required:!1,description:`Callback para remover o arquivo anexado.`},{name:`label`,type:`string`,required:!1,description:`Rótulo exibido acima do campo.`},{name:`cols`,type:`string`,defaultValue:`"12"`,required:!1,description:`Largura via grid SEPLAG.`},{name:`dragDrop`,type:`boolean`,defaultValue:`false`,required:!1,description:`Quando true, troca o upload básico por uma área de drag-drop com botão de seleção.`},{name:`accept`,type:`string`,defaultValue:`"application/pdf"`,required:!1,description:`Tipos/extensões aceitos pelo FileUpload.`},{name:`maxFileSize`,type:`number`,defaultValue:`2000000`,required:!1,description:`Tamanho máximo do arquivo em bytes.`},{name:`chooseLabel`,type:`string`,defaultValue:`"Anexar documento"`,required:!1,description:`Texto do botao de selecao de arquivo.`},{name:`helperText`,type:`ReactNode`,defaultValue:`"Formato aceito: .pdf | Tamanho maximo: 2MB"`,required:!1,description:`Texto auxiliar exibido abaixo do upload.`},{name:`emptyTemplateText`,type:`string`,defaultValue:`"Arraste e solte o arquivo aqui"`,required:!1,description:`Texto principal da área vazia no modo drag-drop.`},{name:`invalidFileSizeMessageDetail`,type:`string`,required:!1,description:`Mensagem de erro exibida quando o arquivo excede o limite.`},{name:`hideLabel`,type:`boolean`,defaultValue:`false`,required:!1,description:`Oculta o rótulo.`},{name:`canView`,type:`boolean`,defaultValue:`true`,required:!1,description:`Exibe o botão de visualização quando há arquivo anexado.`}];function f(){return(0,o.jsx)(i,{title:`Anexar Documento`,description:`Componente de upload de documento padrão SEPLAG. Gerencia o ciclo de vida do arquivo: upload, visualização e remoção, com integração ao formato base64.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import { AnexarDocumentoSeplag } from "@seplag/ui-lib-react-18";`,sections:u,props:d})}export{f as default};