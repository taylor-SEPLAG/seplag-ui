import { useSyncExternalStore } from "react";
import { candidatosPssMock, convocacoesPssMock, publicacoesPssMock } from "./candidatosMock";
import { construirResumoPorSecretaria } from "./deParaIngressoUtils";
import { ingressosPssMock, registrosDeParaMock } from "./deParaMock";
import { calcularDivergenciasSies } from "./divergenciaSiesUtils";
import { construirHistoricoTemporalPss } from "./historicoTemporalPss";
import { integracoesPssMock } from "./integracoesMock";
import { cargosSiesReferenciaMock, pendenciasControlePssMock, processosPssMock } from "./mockData";
import { vagasProcessoPssMock } from "./vagasProcessoMock";
import type { CandidatoPss, CargoSiesReferencia, ConvocacaoPss, IngressoServidorPss, IntegracaoExterna, ProcessoPss, PublicacaoPss, RegistroDeParaPss, VagaProcessoPss } from "./types";

export interface ControlePssState{processos:ProcessoPss[];vagas:VagaProcessoPss[];candidatos:CandidatoPss[];convocacoes:ConvocacaoPss[];publicacoes:PublicacaoPss[];integracoes:IntegracaoExterna[];cargosSies:CargoSiesReferencia[];pendencias:string[];registrosDePara:RegistroDeParaPss[];ingressos:IngressoServidorPss[]}
let state:ControlePssState={processos:[...processosPssMock],vagas:[...vagasProcessoPssMock],candidatos:[...candidatosPssMock],convocacoes:[...convocacoesPssMock],publicacoes:[...publicacoesPssMock],integracoes:[...integracoesPssMock],cargosSies:[...cargosSiesReferenciaMock],pendencias:[...pendenciasControlePssMock],registrosDePara:[...registrosDeParaMock],ingressos:[...ingressosPssMock]};
const listeners=new Set<()=>void>();const emitir=()=>listeners.forEach((l)=>l());
export const controlePssStore={
 getState:()=>state,
 subscribe:(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener)}},
 update:(updater:(atual:ControlePssState)=>ControlePssState)=>{state=updater(state);emitir()},
 set<K extends keyof ControlePssState>(campo:K,valor:ControlePssState[K]|((atual:ControlePssState[K])=>ControlePssState[K])){state={...state,[campo]:typeof valor==="function"?(valor as (a:ControlePssState[K])=>ControlePssState[K])(state[campo]):valor};emitir()},
 divergencias:()=>calcularDivergenciasSies(state.vagas,state.processos,state.cargosSies),
 historico:()=>construirHistoricoTemporalPss(state),
 resumoSecretarias:()=>construirResumoPorSecretaria(state.vagas,state.ingressos,state.processos),
};
export const useControlePssStore=()=>useSyncExternalStore(controlePssStore.subscribe,controlePssStore.getState,controlePssStore.getState);
