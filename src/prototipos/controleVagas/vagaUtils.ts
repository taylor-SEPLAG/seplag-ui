import type { EstadoVaga, HistoricoVaga, QuadroAutorizadoRow, SituacaoLegalVaga, TipoVagaLegal, Vaga } from "./types";

const normalizar = (valor:string,tamanho:number) => valor.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Za-z0-9]/g,"").toUpperCase().slice(0,tamanho);
export const gerarIdentificadorVaga=(orgao:string,cargo:string,sequencial:number)=>`VAG-${normalizar(orgao,6)}-${normalizar(cargo,10)}-${String(sequencial).padStart(5,"0")}`;

export const gerarVagasDoQuadro=(quadro:QuadroAutorizadoRow):Vaga[]=>{
 const tipo:TipoVagaLegal=quadro.tipoQuadro==="Comissionado"?"COMISSIONADO":"EFETIVO";
 return Array.from({length:quadro.autorizadas},(_,index)=>{
  const sequencial=index+1;const id=gerarIdentificadorVaga(quadro.orgao,quadro.cargo,sequencial);let estado:EstadoVaga=sequencial<=quadro.ocupadas?"OCUPADA":"DISPONIVEL";let situacaoLegal:SituacaoLegalVaga="REGULAR";
  if(quadro.codigo==="QA-0002"&&sequencial===quadro.autorizadas){situacaoLegal="DECISAO_JUDICIAL";estado="OCUPADA";}
  if(quadro.codigo==="QA-0002"&&sequencial===quadro.autorizadas-1)situacaoLegal="DIVERGENTE";
  if(quadro.codigo==="QA-0001"&&sequencial>quadro.ocupadas-3&&sequencial<=quadro.ocupadas)situacaoLegal="EM_EXTINCAO";
  const historico:HistoricoVaga[]=[{id:`HIS-${id}-001`,vagaId:id,ocorridoEm:"15/07/2026 08:00",dataEfeito:quadro.inicioVigencia||"15/07/2026",tipo:"CRIACAO",titulo:"Vaga criada a partir do quadro legal",descricao:`${quadro.codigo} • ${quadro.ato}`,origem:"Quadro Autorizado",usuario:"Sistema",processo:quadro.processo}];
  if(estado==="OCUPADA")historico.push({id:`HIS-${id}-002`,vagaId:id,ocorridoEm:"10/01/2026 09:30",dataEfeito:"08/01/2026",tipo:"ALTERACAO_ESTADO",titulo:"Vaga ocupada",descricao:"Ocupação registrada por efetivo exercício",estadoAnterior:"DISPONIVEL",estadoPosterior:"OCUPADA",origem:"Vida Funcional",usuario:"Integração SIGEP"});
  return{id,sequencial,quadroAutorizadoId:quadro.id,quadroCodigo:quadro.codigo,tipo,lei:quadro.ato,carreira:quadro.carreira,cargo:quadro.cargo,orgaoTitular:quadro.orgao,criadaEm:"15/07/2026 08:00",inicioVigencia:quadro.inicioVigencia,estado,situacaoLegal,historico};
 });
};
