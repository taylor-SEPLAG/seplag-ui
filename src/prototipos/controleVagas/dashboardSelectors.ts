import { gerarProjecoes } from "./projecoes";
import { calcularSaldo } from "./saldosControleVagas";
import { recalcularPosicoes } from "./distribuicaoIndividual";
import type { ControleVagasState } from "./controleVagasStore";
import type { CenarioProjecao, HorizonteProjecao, OcupacaoVaga, SaldoControleVagasGrupo, SituacaoLegalVaga, Vaga } from "./types";

export interface DashboardFiltros {
  dataReferencia:string; orgaoTitular:string; orgaoDistribuicao:string; orgaoExercicio:string; tipo:string;
  carreira:string; cargo:string; situacaoLegal:string; somenteCessoes:boolean;
}

export interface DashboardGrupo {
  chave:string; quadroCodigo:string; carreira:string; cargo:string; orgao:string; distribuicao:string; tipo:string; lei:string;
  vagasLegais:number; ocupadas:number; disponiveis:number; disponiveisLivres:number;
  disponiveisComprometidas:number; ocupadasEmDisponibilizacao:number; emExtincao:number;
  judiciais:number; divergentes:number; cessoes:number; aposentadorias:number;
  outrasSaidas:number; evasao:number; potencial:number; percentualOcupacao:number;
  prioridade:"REGULAR"|"ATENCAO"|"CRITICA"|"DIVERGENTE";
  ocupacoes:OcupacaoVaga[];
}

const iso=(valor:string)=>/^\d{4}-\d{2}-\d{2}/.test(valor)?valor.slice(0,10):valor.slice(0,10).split("/").reverse().join("-");

function vagaNaData(vaga:Vaga,data:string):Vaga|null{
  if(iso(vaga.criadaEm)>data&&iso(vaga.inicioVigencia)>data)return null;
  const eventos=[...vaga.historico].filter((item)=>iso(item.dataEfeito)<=data).sort((a,b)=>iso(a.dataEfeito).localeCompare(iso(b.dataEfeito)));
  let estado=vaga.estado;let situacaoLegal=vaga.situacaoLegal;
  if(data<"2026-07-16"){
    estado="DISPONIVEL";situacaoLegal="REGULAR";
    eventos.forEach((item)=>{if(item.estadoPosterior)estado=item.estadoPosterior;if(item.situacaoLegalPosterior)situacaoLegal=item.situacaoLegalPosterior});
  }
  return {...vaga,estado,situacaoLegal};
}

export function construirDashboard(state:ControleVagasState,filtros:DashboardFiltros,cenario:CenarioProjecao,horizonte:HorizonteProjecao){
  const distribuicoes=new Map(recalcularPosicoes(state.vagas,state.movimentos,filtros.dataReferencia).map((item)=>[item.vagaId,item.orgaoDistribuicao??"Pendente de ato de distribuição"]));
  const ocupacoes=state.ocupacoes.filter((item)=>iso(item.efetivoExercicioEm)<=filtros.dataReferencia&&(!item.encerradaEm||iso(item.encerradaEm)>filtros.dataReferencia)).map((item)=>({...item,situacao:"ATIVA" as const}));
  const cessoes=state.cessoes.filter((item)=>iso(item.inicio)<=filtros.dataReferencia&&(!item.encerradaEm||iso(item.encerradaEm)>filtros.dataReferencia));
  const comprometimentos=state.comprometimentos.filter((item)=>iso(item.criadoEm)<=filtros.dataReferencia&&(!item.concluidoEm||iso(item.concluidoEm)>filtros.dataReferencia)&&item.situacao!=="CANCELADO").map((item)=>({...item,situacao:"ATIVO" as const}));
  const vagas=state.vagas.map((item)=>vagaNaData(item,filtros.dataReferencia)).filter((item):item is Vaga=>Boolean(item)).filter((vaga)=>{
    const ocupacao=ocupacoes.find((item)=>item.vagaId===vaga.id);
    const temCessao=cessoes.some((item)=>item.vagaId===vaga.id);
    return (!filtros.orgaoTitular||vaga.orgaoTitular===filtros.orgaoTitular)&&(!filtros.orgaoDistribuicao||distribuicoes.get(vaga.id)===filtros.orgaoDistribuicao)&&(!filtros.orgaoExercicio||ocupacao?.orgaoExercicio===filtros.orgaoExercicio)&&(!filtros.tipo||vaga.tipo===filtros.tipo)&&(!filtros.carreira||vaga.carreira===filtros.carreira)&&(!filtros.cargo||vaga.cargo===filtros.cargo)&&(!filtros.situacaoLegal||vaga.situacaoLegal===filtros.situacaoLegal)&&(!filtros.somenteCessoes||temCessao);
  });
  const excecoes=state.excecoesJudiciais.filter((item)=>item.situacao==="ATIVA"&&iso(item.inicio)<=filtros.dataReferencia&&(!filtros.orgaoTitular||item.orgao===filtros.orgaoTitular)&&(!filtros.cargo||item.cargo===filtros.cargo));
  const vagasPorQuadro=new Map<string,Vaga[]>();
  vagas.forEach((vaga)=>{const chave=`${vaga.quadroCodigo}|${vaga.orgaoTitular}|${vaga.tipo}`;vagasPorQuadro.set(chave,[...(vagasPorQuadro.get(chave)??[]),vaga])});
  const saldos:SaldoControleVagasGrupo[]=[...vagasPorQuadro.entries()].map(([chave,itens])=>({chave,cargo:itens[0].cargo,orgaoTitular:itens[0].orgaoTitular,tipo:itens[0].tipo,totalFisico:itens.length,...calcularSaldo(itens,comprometimentos,ocupacoes,excecoes)}));
  const metodologia=state.metodologias.find((item)=>item.status==="VIGENTE")!;
  const projecoes=gerarProjecoes(saldos,state.fatoresProjecao,state.taxasEvasao,metodologia,cenario,horizonte);
  const grupos:DashboardGrupo[]=saldos.map((saldo)=>{
    const itens=vagasPorQuadro.get(saldo.chave)??[];
    const quadro=state.quadros.find((item)=>item.codigo===itens[0]?.quadroCodigo);
    const ocupacoesGrupo=ocupacoes.filter((item)=>itens.some((vaga)=>vaga.id===item.vagaId));
    const cessoesGrupo=cessoes.filter((item)=>itens.some((vaga)=>vaga.id===item.vagaId)).length;
    const projecao=projecoes.find((item)=>item.chave===saldo.chave)!;
    const aposentadorias=projecao.compulsorias+projecao.elegibilidade+projecao.aposentadoriasRequeridas;
    const outrasSaidas=projecao.exoneracoesConhecidas;
    const percentualOcupacao=saldo.vagasLegais?Math.round(saldo.ocupadas/saldo.vagasLegais*100):0;
    const prioridade:DashboardGrupo["prioridade"]=saldo.divergentes?"DIVERGENTE":saldo.excedentesJudiciais?"ATENCAO":saldo.disponiveisLivres===0||percentualOcupacao>=98?"CRITICA":percentualOcupacao>=90||aposentadorias>0?"ATENCAO":"REGULAR";
    const destinos=[...new Set(itens.map((vaga)=>distribuicoes.get(vaga.id)??"Pendente de ato de distribuição"))];
    const distribuicao=destinos.length<=2?destinos.join(" • "):`${destinos.length} destinos`;
    return{chave:saldo.chave,quadroCodigo:itens[0]?.quadroCodigo??"—",carreira:itens[0]?.carreira??quadro?.carreira??"—",cargo:saldo.cargo,orgao:saldo.orgaoTitular,distribuicao,tipo:saldo.tipo,lei:itens[0]?.lei??quadro?.ato??"—",vagasLegais:saldo.vagasLegais,ocupadas:saldo.ocupadas,disponiveis:saldo.disponiveis,disponiveisLivres:saldo.disponiveisLivres,disponiveisComprometidas:saldo.disponiveisComprometidas,ocupadasEmDisponibilizacao:saldo.ocupadasEmDisponibilizacao,emExtincao:saldo.emExtincao,judiciais:saldo.excedentesJudiciais,divergentes:saldo.divergentes,cessoes:cessoesGrupo,aposentadorias,outrasSaidas,evasao:projecao.evasaoEstimada,potencial:projecao.necessidadeProjetada,percentualOcupacao,prioridade,ocupacoes:ocupacoesGrupo};
  });
  const ordem:Record<DashboardGrupo["prioridade"],number>={DIVERGENTE:0,CRITICA:1,ATENCAO:2,REGULAR:3};
  grupos.sort((a,b)=>ordem[a.prioridade]-ordem[b.prioridade]||b.percentualOcupacao-a.percentualOcupacao);
  const total=(campo:keyof DashboardGrupo)=>grupos.reduce((s,item)=>s+(typeof item[campo]==="number"?item[campo] as number:0),0);
  const vagasLegais=vagas.filter((vaga)=>vaga.situacaoLegal!=="EXTINTA");
  const vagasNaoDistribuidas=vagas.filter((vaga)=>(distribuicoes.get(vaga.id)??"Pendente de ato de distribuição")==="Pendente de ato de distribuição");
  return{grupos,vagas,ocupacoes,cessoes,excecoes,resumo:{cargos:new Set(vagasLegais.map((vaga)=>vaga.cargo)).size,quadros:new Set(vagasLegais.map((vaga)=>vaga.quadroCodigo)).size,distribuidas:vagas.length-vagasNaoDistribuidas.length,naoDistribuidas:vagasNaoDistribuidas.length,disponiveisNaoDistribuidas:vagasNaoDistribuidas.filter((vaga)=>vaga.estado==="DISPONIVEL").length,situacoesLegaisEspeciais:vagas.filter((vaga)=>vaga.situacaoLegal!=="REGULAR").length,vagasLegais:total("vagasLegais"),ocupadas:total("ocupadas"),disponiveis:total("disponiveis"),livres:total("disponiveisLivres"),comprometidas:total("disponiveisComprometidas"),emDisponibilizacao:total("ocupadasEmDisponibilizacao"),emExtincao:total("emExtincao"),judiciais:total("judiciais"),divergentes:total("divergentes"),cessoes:total("cessoes"),aposentadorias:total("aposentadorias"),potencial:total("potencial")}};
}

export const situacoesLegais:SituacaoLegalVaga[]=["REGULAR","EM_EXTINCAO","EXTINTA","EM_TRANSFORMACAO"];
