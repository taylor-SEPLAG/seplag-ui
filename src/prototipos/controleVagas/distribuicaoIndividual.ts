import type { MovimentoVagaIndividual, PosicaoDistribuicaoVaga, SituacaoLegalVaga, TipoMovimentoVagaIndividual, Vaga } from "./types";

const legalPorTipo:Partial<Record<TipoMovimentoVagaIndividual,SituacaoLegalVaga>>={EXTINCAO:"EXTINTA",TRANSFORMACAO:"EM_TRANSFORMACAO"};
export function calcularPosicaoVaga(vaga:Vaga,movimentos:readonly MovimentoVagaIndividual[],dataReferencia:string):PosicaoDistribuicaoVaga{
 let orgao:string|undefined;let unidade:string|undefined;let legal=vaga.situacaoLegal;let cargo=vaga.cargo;let ultimo:string|undefined;
 movimentos.filter((m)=>m.vagaId===vaga.id&&m.dataEfeito<=dataReferencia).sort((a,b)=>a.dataEfeito.localeCompare(b.dataEfeito)||a.registradoEm.localeCompare(b.registradoEm)).forEach((m)=>{if(m.tipo==="DISTRIBUICAO"||m.tipo==="TRANSFERENCIA"||m.tipo==="DECRETO"){orgao=m.orgaoPosterior??orgao;unidade=m.unidadePosterior??unidade}if(m.tipo==="RECOLHIMENTO"){orgao=undefined;unidade=undefined}if(m.situacaoLegalPosterior)legal=m.situacaoLegalPosterior;if(m.tipo==="TRANSFORMACAO"&&m.cargoDestino)cargo=m.cargoDestino;ultimo=m.id});
 return{vagaId:vaga.id,dataReferencia,orgaoTitular:vaga.orgaoTitular,orgaoDistribuicao:orgao,unidadeDistribuicao:unidade,cargo,situacaoLegal:legal,ultimoMovimento:ultimo};
}
export function registrarMovimentoVaga(vaga:Vaga,posicao:PosicaoDistribuicaoVaga,dados:{tipo:TipoMovimentoVagaIndividual;dataEfeito:string;orgao?:string;unidade?:string;ato:string;processo:string;justificativa:string;cargoDestino?:string}):{movimento?:MovimentoVagaIndividual;erro?:string}{
 if(!dados.dataEfeito||!dados.ato||!dados.processo||!dados.justificativa)return{erro:"Preencha data de efeito, ato, processo e justificativa."};
 if((dados.tipo==="DISTRIBUICAO"||dados.tipo==="TRANSFERENCIA"||dados.tipo==="DECRETO")&&(!dados.orgao||!dados.unidade))return{erro:"Informe órgão e unidade de destino."};
 if(dados.tipo==="RECOLHIMENTO"&&vaga.estado==="OCUPADA")return{erro:"Uma vaga ocupada não pode ser recolhida antes da disponibilização definitiva."};
 if(dados.tipo==="EXTINCAO"&&vaga.estado==="OCUPADA")return{erro:"Vaga ocupada deve entrar em extinção progressiva, não em extinção imediata."};
 if(dados.tipo==="TRANSFORMACAO"&&!dados.cargoDestino)return{erro:"Informe o cargo de destino da transformação."};
 const hoje="2026-07-16";const id=`MVI-${Date.now().toString().slice(-7)}`;return{movimento:{id,vagaId:vaga.id,tipo:dados.tipo,dataEfeito:dados.dataEfeito,registradoEm:"2026-07-16 16:00",retroativo:dados.dataEfeito<hoje,orgaoAnterior:posicao.orgaoDistribuicao,unidadeAnterior:posicao.unidadeDistribuicao,orgaoPosterior:dados.tipo==="RECOLHIMENTO"?undefined:dados.orgao??posicao.orgaoDistribuicao,unidadePosterior:dados.tipo==="RECOLHIMENTO"?undefined:dados.unidade??posicao.unidadeDistribuicao,situacaoLegalAnterior:posicao.situacaoLegal,situacaoLegalPosterior:legalPorTipo[dados.tipo]??posicao.situacaoLegal,ato:dados.ato,processo:dados.processo,justificativa:dados.justificativa,cargoDestino:dados.cargoDestino,usuario:"Usuário do protótipo"}};
}
export function recalcularPosicoes(vagas:readonly Vaga[],movimentos:readonly MovimentoVagaIndividual[],data:string){return vagas.map((vaga)=>calcularPosicaoVaga(vaga,movimentos,data))}
