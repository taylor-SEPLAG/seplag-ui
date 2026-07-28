import { useSyncExternalStore } from "react";
import type { AutorizacaoPessoal, PosicaoPessoal } from "./autorizacoesPessoalTypes";

interface AutorizacoesPessoalState {
  autorizacoes:AutorizacaoPessoal[];
  posicoes:PosicaoPessoal[];
}

let state:AutorizacoesPessoalState={autorizacoes:[],posicoes:[]};
const listeners=new Set<()=>void>();
const emitir=()=>listeners.forEach((listener)=>listener());

export const autorizacoesPessoalStore={
  getState:()=>state,
  subscribe:(listener:()=>void)=>{listeners.add(listener);return()=>listeners.delete(listener)},
  setAutorizacoes:(valor:AutorizacaoPessoal[]|((atual:AutorizacaoPessoal[])=>AutorizacaoPessoal[]))=>{
    state={...state,autorizacoes:typeof valor==="function"?valor(state.autorizacoes):valor};emitir();
  },
  setPosicoes:(valor:PosicaoPessoal[]|((atual:PosicaoPessoal[])=>PosicaoPessoal[]))=>{
    state={...state,posicoes:typeof valor==="function"?valor(state.posicoes):valor};emitir();
  },
};
export const useAutorizacoesPessoalStore=()=>useSyncExternalStore(autorizacoesPessoalStore.subscribe,autorizacoesPessoalStore.getState,autorizacoesPessoalStore.getState);
