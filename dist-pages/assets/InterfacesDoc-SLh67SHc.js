import{t as e}from"./jsx-runtime--AOyvnT1.js";/* empty css              */import{t}from"./DocPage-DfNa9OED.js";var n=e(),r=[{title:`ResultsSeplag<T>`,description:"Interface genérica usada para respostas paginadas da API. Contém metadados de paginação e o array `content`.",example:null,code:`export interface ResultsSeplag<T> {
  content: T[];
  pageable?: PageableSeplag;
  last: boolean;
  totalPages: number;
  pageActual: number;
  sizePage: number;
  totalRecords: number;
  size: number;
  number: number;
  sort?: SortSeplag;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}`},{title:`PageableSeplag / SortSeplag`,description:`Metadados sobre paginação e ordenação retornados pelo backend.`,example:null,code:`export interface PageableSeplag {
  sort: SortSeplag;
  offset: number;
  pageSize: number;
  pageNumber: number;
  unpaged: boolean;
  paged: boolean;
}

export interface SortSeplag {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}`},{title:`Opções de paginação (client-side)`,description:"Constante `opcoesPaginacaoSeplag` usada para inicializar paginadores (página inicial, rows e opções de rowsPerPage).",example:null,code:`export const opcoesPaginacaoSeplag = {
  page: 0,
  rows: 10,
  rowsPerPage: [10, 20, 30],
};`},{title:`IPermissionResponseSeplag`,description:`Interface que descreve permissões do usuário usadas nos componentes (visualizar, incluir, editar, deletar).`,example:null,code:`export interface IPermissionResponseSeplag {
  podeVisualizar: boolean;
  podeIncluir: boolean;
  podeEditar: boolean;
  podeDeletar: boolean;
}`}],i=[{name:`Arquivos`,type:`src/interfaces/*.ts`,required:!0,description:`Interfaces relacionadas à paginação e permissões usadas pela biblioteca.`}];function a(){return(0,n.jsx)(t,{title:`Interfaces`,description:`Descrição das interfaces comuns usadas pela biblioteca: respostas paginadas, metadados de paginação e modelo de permissões.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import { ResultsSeplag } from "@seplag/ui-lib-react-18/src/interfaces/Results";`,sections:r,props:i})}export{a as default};