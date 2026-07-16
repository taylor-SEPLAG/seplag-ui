import { useSyncExternalStore } from "react";
import { cessoesMock } from "./cessoesMock";
import { comprometimentosVagasMock } from "./comprometimentosMock";
import { movimentosVagasIndividuaisMock } from "./distribuicaoIndividualMock";
import { excecoesJudiciaisMock } from "./excecoesJudiciaisMock";
import { construirHistoricoTemporal } from "./historicoTemporal";
import { dashboardControleVagasMock, pendenciasRegrasMock, quadrosAutorizadosMock, regrasControleVagasMock, vagasIndividualizadasMock } from "./mockData";
import { ocupacoesVagasMock } from "./ocupacoesMock";
import { fatoresProjecaoMock, metodologiasProjecaoMock, taxasEvasaoMock } from "./projecoesMock";
import type { CessaoFuncional, DashboardRow, ComprometimentoVaga, ExcecaoJudicialVaga, FatorProjecaoVagas, MetodologiaProjecao, MovimentoVagaIndividual, OcupacaoVaga, QuadroAutorizadoRow, RegraEvento, TaxaEvasaoHistorica, Vaga } from "./types";
export interface ControleVagasState{quadros:QuadroAutorizadoRow[];dashboardLegado:DashboardRow[];vagas:Vaga[];comprometimentos:ComprometimentoVaga[];ocupacoes:OcupacaoVaga[];cessoes:CessaoFuncional[];movimentos:MovimentoVagaIndividual[];excecoesJudiciais:ExcecaoJudicialVaga[];regras:RegraEvento[];pendenciasRegras:string[];fatoresProjecao:FatorProjecaoVagas[];metodologias:MetodologiaProjecao[];taxasEvasao:TaxaEvasaoHistorica[]}
const ocupacoesIniciais=ocupacoesVagasMock.map((ocupacao)=>{const cessao=cessoesMock.find((item)=>item.ocupacaoId===ocupacao.id&&item.situacao==="ATIVA");return cessao?{...ocupacao,orgaoExercicio:cessao.orgaoCessionario}:ocupacao});
let state:ControleVagasState={quadros:[...quadrosAutorizadosMock],dashboardLegado:[...dashboardControleVagasMock],vagas:[...vagasIndividualizadasMock],comprometimentos:[...comprometimentosVagasMock],ocupacoes:[...ocupacoesIniciais],cessoes:[...cessoesMock],movimentos:[...movimentosVagasIndividuaisMock],excecoesJudiciais:[...excecoesJudiciaisMock],regras:[...regrasControleVagasMock],pendenciasRegras:[...pendenciasRegrasMock],fatoresProjecao:[...fatoresProjecaoMock],metodologias:[...metodologiasProjecaoMock],taxasEvasao:[...taxasEvasaoMock]};const listeners=new Set<()=>void>();const emitir=()=>listeners.forEach((l)=>l());
export const controleVagasStore={getState:()=>state,subscribe:(listener:()=>void)=>{listeners.add(listener);return()=>listeners.delete(listener)},update:(updater:(atual:ControleVagasState)=>ControleVagasState)=>{state=updater(state);emitir()},set<K extends keyof ControleVagasState>(campo:K,valor:ControleVagasState[K]|((atual:ControleVagasState[K])=>ControleVagasState[K])){state={...state,[campo]:typeof valor==="function"?(valor as (a:ControleVagasState[K])=>ControleVagasState[K])(state[campo]):valor};emitir()},historico:()=>construirHistoricoTemporal(state)};
export const useControleVagasStore=()=>useSyncExternalStore(controleVagasStore.subscribe,controleVagasStore.getState,controleVagasStore.getState);
