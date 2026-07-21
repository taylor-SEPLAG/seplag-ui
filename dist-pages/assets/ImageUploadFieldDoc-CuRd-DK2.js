import{t as e}from"./jsx-runtime-ChuIQw48.js";import{p as t}from"./index-DyeHa39m.js";import{t as n}from"./DocPage-CHgTh2J-.js";var r=e();function i(){return(0,r.jsx)(`div`,{className:`grid`,style:{width:`100%`},children:(0,r.jsx)(t,{label:`Foto do Servidor`,cols:`12 2`,onFileSelect:()=>{}})})}function a(){return(0,r.jsx)(`div`,{className:`grid`,style:{width:`100%`},children:(0,r.jsx)(t,{label:`Foto (visualização)`,cols:`12 2`,isView:!0,fotoPreview:`https://cdn-icons-png.flaticon.com/512/18125/18125416.png`,onFileSelect:()=>{}})})}var o=[{title:`Upload com cropper`,description:`Exibe a imagem atual e abre um cropper ao clicar no botão de alterar.`,example:(0,r.jsx)(i,{}),code:`import { ImageUploadFieldSeplag } from "@seplag/ui-lib-react-18";

<ImageUploadFieldSeplag
  label="Foto do Servidor"
  cols="12 2"
  fotoPreview={servidorFoto}
  onFileSelect={(file) => setFoto(file)}
/>`},{title:`Modo visualização`,description:`Prop isView oculta o botão de upload e exibe apenas a imagem.`,example:(0,r.jsx)(a,{}),code:`<ImageUploadFieldSeplag
  label="Foto"
  cols="12 2"
  isView
  fotoPreview={servidorFoto}
  onFileSelect={() => {}}
/>`}],s=[{name:`onFileSelect`,type:`(file: File) => void`,required:!0,description:`Callback chamado ao selecionar/recortar a imagem.`},{name:`label`,type:`string`,defaultValue:`"Foto"`,required:!1,description:`Rótulo exibido acima da imagem.`},{name:`cols`,type:`string`,defaultValue:`"12 2"`,required:!1,description:`Largura via grid SEPLAG.`},{name:`fotoPreview`,type:`string`,required:!1,description:`URL da imagem atual (base64 ou URL remota).`},{name:`placeholderImage`,type:`string`,required:!1,description:`URL da imagem placeholder quando fotoPreview não está definida.`},{name:`buttonLabel`,type:`string`,defaultValue:`"Alterar foto"`,required:!1,description:`Texto do botão de upload.`},{name:`isView`,type:`boolean`,defaultValue:`false`,required:!1,description:`Modo somente leitura: oculta o botão de upload.`},{name:`visible`,type:`boolean`,defaultValue:`true`,required:!1,description:`Quando false, oculta o componente.`}];function c(){return(0,r.jsx)(n,{title:`ImageUploadField`,description:`Campo de upload de imagem com cropper integrado (react-image-crop). Exibe a imagem atual e permite recortá-la antes de salvar.`,badge:`Estável`,since:`v0.0.1`,sections:o,props:s})}export{c as default};