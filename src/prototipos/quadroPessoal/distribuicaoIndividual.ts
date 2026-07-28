import type { MovimentoVagaIndividual, PosicaoDistribuicaoVaga, SituacaoLegalVaga, TipoMovimentoVagaIndividual, Vaga } from "./types";

const legalPorTipo:Partial<Record<TipoMovimentoVagaIndividual,SituacaoLegalVaga>>={EXTINCAO:"EXTINTA",TRANSFORMACAO:"EM_TRANSFORMACAO"};
const tiposDistributivos:readonly TipoMovimentoVagaIndividual[]=["DISTRIBUICAO","REDISTRIBUICAO","DECRETO"];

export function calcularPosicaoVaga(vaga:Vaga,movimentos:readonly MovimentoVagaIndividual[],dataReferencia:string):PosicaoDistribuicaoVaga{
 let orgao=vaga.orgaoDistribuicaoInicial;let unidade:string|undefined;let ato=vaga.atoDistribuicaoInicial;let vigencia=vaga.inicioVigenciaDistribuicao;let legal=vaga.situacaoLegal;let cargo=vaga.cargo;let ultimo:string|undefined;
 movimentos.filter((m)=>m.vagaId===vaga.id&&m.dataEfeito<=dataReferencia).sort((a,b)=>a.dataEfeito.localeCompare(b.dataEfeito)||a.registradoEm.localeCompare(b.registradoEm)).forEach((m)=>{if(tiposDistributivos.includes(m.tipo)){orgao=m.orgaoPosterior??orgao;unidade=m.unidadePosterior??unidade;ato=m.ato;vigencia=m.dataEfeito}if(m.situacaoLegalPosterior)legal=m.situacaoLegalPosterior;if(m.tipo==="TRANSFORMACAO"&&m.cargoDestino)cargo=m.cargoDestino;ultimo=m.id});
 return{vagaId:vaga.id,quadroAutorizadoId:vaga.quadroAutorizadoId,quadroCodigo:vaga.quadroCodigo,dataReferencia,orgaoTitular:vaga.orgaoTitular,destinacaoPrevistaLei:vaga.destinacaoPrevistaLei,situacaoDistribuicao:orgao?"DISTRIBUIDA":"PENDENTE_ATO",orgaoDistribuicao:orgao,unidadeDistribuicao:unidade,atoDistribuicao:ato,inicioVigenciaDistribuicao:vigencia,cargo,situacaoLegal:legal,ultimoMovimento:ultimo};
}

export function registrarMovimentoVaga(vaga:Vaga,posicao:PosicaoDistribuicaoVaga,dados:{tipo:TipoMovimentoVagaIndividual;dataEfeito:string;orgao?:string;unidade?:string;ato:string;processo:string;justificativa:string;cargoDestino?:string}):{movimento?:MovimentoVagaIndividual;erro?:string}{
 if(!dados.dataEfeito||!dados.ato||!dados.processo||!dados.justificativa)return{erro:"Preencha data de efeito, ato, processo e justificativa."};
 if((dados.tipo==="DISTRIBUICAO"||dados.tipo==="REDISTRIBUICAO"||dados.tipo==="DECRETO")&&!dados.orgao)return{erro:"Informe o órgão de destino."};
 if(dados.tipo==="DISTRIBUICAO"&&posicao.situacaoDistribuicao!=="PENDENTE_ATO")return{erro:"A distribuição inicial só pode ser aplicada a vaga pendente de ato."};
 if(dados.tipo==="REDISTRIBUICAO"&&posicao.situacaoDistribuicao!=="DISTRIBUIDA")return{erro:"A redistribuição exige uma distribuição vigente de origem."};
 if(dados.tipo==="EXTINCAO"&&vaga.estado==="OCUPADA")return{erro:"Vaga ocupada deve entrar em extinção progressiva, não em extinção imediata."};
 if(dados.tipo==="TRANSFORMACAO"&&!dados.cargoDestino)return{erro:"Informe o cargo de destino da transformação."};
 const hoje="2026-07-23";const id=`MVI-${Date.now().toString().slice(-7)}`;return{movimento:{id,vagaId:vaga.id,tipo:dados.tipo,dataEfeito:dados.dataEfeito,registradoEm:"2026-07-23 16:00",retroativo:dados.dataEfeito<hoje,orgaoAnterior:posicao.orgaoDistribuicao,unidadeAnterior:posicao.unidadeDistribuicao,orgaoPosterior:dados.orgao??posicao.orgaoDistribuicao,unidadePosterior:dados.unidade??posicao.unidadeDistribuicao,situacaoLegalAnterior:posicao.situacaoLegal,situacaoLegalPosterior:legalPorTipo[dados.tipo]??posicao.situacaoLegal,ato:dados.ato,processo:dados.processo,justificativa:dados.justificativa,cargoDestino:dados.cargoDestino,usuario:"Usuário do protótipo"}};
}
export function recalcularPosicoes(vagas:readonly Vaga[],movimentos:readonly MovimentoVagaIndividual[],data:string){return vagas.map((vaga)=>calcularPosicaoVaga(vaga,movimentos,data))}

