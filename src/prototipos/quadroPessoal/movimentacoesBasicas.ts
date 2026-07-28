import type { OcupacaoVaga } from "./types";
export function efetivarRemocaoInterna(ocupacao:OcupacaoVaga,dados:{orgaoDestino:string;unidadeDestino:string;data:string;processo:string}):OcupacaoVaga{return{...ocupacao,orgaoLotacao:dados.orgaoDestino,unidadeLotacao:dados.unidadeDestino,orgaoExercicio:dados.orgaoDestino,unidadeExercicio:dados.unidadeDestino,eventos:[...ocupacao.eventos,{id:"EVT-"+ocupacao.id+"-"+(ocupacao.eventos.length+1),tipo:"CORRECAO",data:dados.data,registradoEm:dados.data,descricao:"Remoção interna efetivada; a vaga de origem foi preservada.",origem:"Movimentações Funcionais",processo:dados.processo,usuario:"Sistema"}]}}


