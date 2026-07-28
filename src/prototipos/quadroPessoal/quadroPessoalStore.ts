import { useSyncExternalStore } from "react";
import { construirHistoricoTemporal } from "./historicoTemporal";
import type { CessaoFuncional, ComprometimentoVaga, ExcecaoJudicialVaga, FatorProjecaoVagas, MetodologiaProjecao, MovimentacaoFuncional, MovimentoVagaIndividual, OcupacaoVaga, QuadroAutorizadoRow, RegraEvento, TaxaEvasaoHistorica, Vaga } from "./types";
export interface QuadroPessoalState{quadros:QuadroAutorizadoRow[];vagas:Vaga[];comprometimentos:ComprometimentoVaga[];ocupacoes:OcupacaoVaga[];cessoes:CessaoFuncional[];movimentacoesFuncionais:MovimentacaoFuncional[];movimentos:MovimentoVagaIndividual[];excecoesJudiciais:ExcecaoJudicialVaga[];regras:RegraEvento[];pendenciasRegras:string[];fatoresProjecao:FatorProjecaoVagas[];metodologias:MetodologiaProjecao[];taxasEvasao:TaxaEvasaoHistorica[]}
let state:QuadroPessoalState={quadros:[],vagas:[],comprometimentos:[],ocupacoes:[],cessoes:[],movimentacoesFuncionais:[],movimentos:[],excecoesJudiciais:[],regras:[],pendenciasRegras:[],fatoresProjecao:[],metodologias:[],taxasEvasao:[]};const listeners=new Set<()=>void>();const emitir=()=>listeners.forEach((l)=>l());
export const quadroPessoalStore={getState:()=>state,subscribe:(listener:()=>void)=>{listeners.add(listener);return()=>listeners.delete(listener)},update:(updater:(atual:QuadroPessoalState)=>QuadroPessoalState)=>{state=updater(state);emitir()},set<K extends keyof QuadroPessoalState>(campo:K,valor:QuadroPessoalState[K]|((atual:QuadroPessoalState[K])=>QuadroPessoalState[K])){state={...state,[campo]:typeof valor==="function"?(valor as (a:QuadroPessoalState[K])=>QuadroPessoalState[K])(state[campo]):valor};emitir()},historico:()=>construirHistoricoTemporal(state)};
export const useQuadroPessoalStore=()=>useSyncExternalStore(quadroPessoalStore.subscribe,quadroPessoalStore.getState,quadroPessoalStore.getState);



