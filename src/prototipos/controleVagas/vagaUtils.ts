import type { EstadoVaga, HistoricoVaga, QuadroAutorizadoRow, SituacaoLegalVaga, TipoVagaLegal, Vaga } from "./types";

const normalizar = (valor:string,tamanho:number) => valor.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Za-z0-9]/g,"").toUpperCase().slice(0,tamanho);
export const gerarIdentificadorVaga=(orgao:string,cargo:string,sequencial:number)=>`VAG-${normalizar(orgao,6)}-${normalizar(cargo,10)}-${String(sequencial).padStart(5,"0")}`;

export const gerarVagasDoQuadro=(quadro:QuadroAutorizadoRow):Vaga[]=>{
 const tipo:TipoVagaLegal=quadro.tipoQuadro==="Comissionado"?"COMISSIONADO":"EFETIVO";
 return Array.from({length:quadro.autorizadas},(_,index)=>{
  const sequencial=index+1;const destinoLegal=quadro.quantitativosLegaisPorOrgao?.find((_,posicao,lista)=>sequencial<=lista.slice(0,posicao+1).reduce((total,item)=>total+item.quantidade,0));const orgaoUnicoDefinido=quadro.orgaosDefinidosLei?.length===1?quadro.orgaosDefinidosLei[0]:quadro.orgao!=="ESTADO DE MATO GROSSO"?quadro.orgao:undefined;const orgaoDistribuicaoInicial=destinoLegal?.orgao??(quadro.formaDestinacaoLegal!=="DISTRIBUICAO_POSTERIOR"?orgaoUnicoDefinido:undefined);const orgaoTitular=orgaoDistribuicaoInicial??(quadro.orgao!=="ESTADO DE MATO GROSSO"?quadro.orgao:"ESTADO DE MATO GROSSO");const destinacaoPrevistaLei=quadro.formaDestinacaoLegal==="DISTRIBUICAO_POSTERIOR"?"Pendente de distribuição":orgaoDistribuicaoInicial?`Destinada pela lei ao órgão ${orgaoDistribuicaoInicial}`:"Órgãos permitidos definidos pela lei";const id=gerarIdentificadorVaga(orgaoTitular,quadro.cargo,sequencial);const estado:EstadoVaga=sequencial<=quadro.ocupadas?"OCUPADA":"DISPONIVEL";let situacaoLegal:SituacaoLegalVaga="REGULAR";
  
  if(quadro.situacaoVigencia==="ENCERRADO"||quadro.extincaoProgressivaEmAndamento)situacaoLegal="EM_EXTINCAO";
  else if(quadro.codigo==="QA-0001"&&sequencial>quadro.ocupadas-3&&sequencial<=quadro.ocupadas)situacaoLegal="EM_EXTINCAO";
  const historico:HistoricoVaga[]=[{id:`HIS-${id}-001`,vagaId:id,ocorridoEm:"15/07/2026 08:00",dataEfeito:quadro.inicioVigencia||"15/07/2026",tipo:"CRIACAO",titulo:"Vaga criada a partir do quadro legal",descricao:`${quadro.codigo} • ${quadro.ato}`,origem:"Quadro Autorizado",usuario:"Sistema",processo:quadro.processo}];
  if(estado==="OCUPADA")historico.push({id:`HIS-${id}-002`,vagaId:id,ocorridoEm:"10/01/2026 09:30",dataEfeito:"08/01/2026",tipo:"ALTERACAO_ESTADO",titulo:"Vaga ocupada",descricao:"Ocupação registrada por efetivo exercício",estadoAnterior:"DISPONIVEL",estadoPosterior:"OCUPADA",origem:"Vida Funcional",usuario:"Integração SIGEP"});
  return{id,sequencial,quadroAutorizadoId:quadro.id,quadroCodigo:quadro.codigo,tipo,lei:quadro.ato,carreira:quadro.carreira,cargo:quadro.cargo,perfilProfissional:quadro.perfilProfissional,orgaoTitular,destinacaoPrevistaLei,orgaoDistribuicaoInicial,atoDistribuicaoInicial:orgaoDistribuicaoInicial?quadro.ato:undefined,inicioVigenciaDistribuicao:orgaoDistribuicaoInicial?quadro.inicioVigencia:undefined,criadaEm:"15/07/2026 08:00",inicioVigencia:quadro.inicioVigencia,estado,situacaoLegal,historico};
 });
};
