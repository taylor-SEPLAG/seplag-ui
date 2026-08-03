import type { CargoSiesReferencia, DivergenciaSiesPss, ProcessoPss, TipoDivergenciaSies, VagaProcessoPss } from "./types";

export const tipoDivergenciaLabel:Record<TipoDivergenciaSies,string>={
 SEM_CORRESPONDENCIA_SIES:"Cargo sem correspondência no SIES",
 CBO_DIVERGENTE:"CBO divergente entre edital e cargo",
 QUANTITATIVO_DIVERGENTE:"Quantitativo de vagas divergente",
 CARGO_INEXISTENTE_SIGEP:"Cargo inexistente no SIGEP",
};

const numerosDoTexto=(texto:string)=>[...texto.matchAll(/\d+/g)].map((item)=>Number(item[0]));

/** Reproduz o ponto crítico da seção 7 do fluxo: vaga do PSS cadastrada sem correspondência confiável no SIES. */
export function calcularDivergenciasSies(vagas:readonly VagaProcessoPss[],processos:readonly ProcessoPss[],cargosSies:readonly CargoSiesReferencia[]):DivergenciaSiesPss[]{
 const divergencias:DivergenciaSiesPss[]=[];
 vagas.forEach((vaga)=>{
  const processo=processos.find((item)=>item.id===vaga.processoId);
  if(!processo)return;
  const base={processoId:processo.id,processoNumero:processo.numero,vagaId:vaga.id,cargo:vaga.cargo,detectadaEm:processo.atualizadoEm.slice(0,10)};
  const cargoSies=cargosSies.find((item)=>item.id===vaga.cargoSiesId)??cargosSies.find((item)=>item.nome===vaga.cargo);
  if(!cargoSies){
   divergencias.push({...base,id:`DIV-${vaga.id}-SEM`,tipo:"SEM_CORRESPONDENCIA_SIES",descricao:`O cargo ${vaga.cargo} foi cadastrado no processo sem correspondência no catálogo do SIES.`,gravidade:vaga.validadaContraSies?"MEDIA":"ALTA"});
   return;
  }
  if(cargoSies.cbo!==vaga.cbo)divergencias.push({...base,id:`DIV-${vaga.id}-CBO`,tipo:"CBO_DIVERGENTE",descricao:`CBO ${vaga.cbo} informado no edital difere do CBO ${cargoSies.cbo} registrado no cargo ${cargoSies.nome}.`,gravidade:"ALTA"});
  if(vaga.divergencia?.toLowerCase().includes("quantitativo")){
   const numeros=numerosDoTexto(vaga.divergencia);
   const informado=numeros[0]??vaga.vagasImediatas;const registrado=numeros[1]??vaga.vagasImediatas;
   divergencias.push({...base,id:`DIV-${vaga.id}-QTD`,tipo:"QUANTITATIVO_DIVERGENTE",descricao:`Quantitativo divergente: ${informado} vagas imediatas no SIGEP e ${registrado} registradas no SIES.`,gravidade:"ALTA"});
  }
 });
 return divergencias.sort((a,b)=>a.processoNumero.localeCompare(b.processoNumero)||a.vagaId.localeCompare(b.vagaId));
}

export const divergenciasDoProcesso=(divergencias:readonly DivergenciaSiesPss[],processoId:string)=>divergencias.filter((item)=>item.processoId===processoId);
export const processosComDivergencia=(divergencias:readonly DivergenciaSiesPss[])=>new Set(divergencias.map((item)=>item.processoId));
export const vagasValidadas=(vagas:readonly VagaProcessoPss[])=>vagas.filter((item)=>item.validadaContraSies&&!item.divergencia);
export const percentualValidacaoSies=(vagas:readonly VagaProcessoPss[])=>vagas.length?Math.round(vagasValidadas(vagas).length/vagas.length*100):0;
