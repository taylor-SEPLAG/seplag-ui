import type { CessaoFuncional, OcupacaoVaga, RegraOrgaosCarreira, Vaga } from "./types";

export const regrasOrgaosCarreira:RegraOrgaosCarreira[]=[
 {carreira:"Gestão Governamental",orgaoTitularPadrao:"SEPLAG",orgaosLotacaoPermitidos:["SEPLAG"],orgaosExercicioPermitidos:["SEPLAG","SEFAZ","SINFRA","SEMA","CGE"],permiteCessaoExterna:true,exigeAutorizacaoEspecial:true,fundamento:"Lei Complementar nº 550/2014"},
 {carreira:"Saúde Pública",orgaoTitularPadrao:"SES",orgaosLotacaoPermitidos:["SES"],orgaosExercicioPermitidos:["SES","MT SAÚDE"],permiteCessaoExterna:false,exigeAutorizacaoEspecial:true,fundamento:"Lei nº 12.104/2023"},
 {carreira:"Direção e Assessoramento",orgaoTitularPadrao:"SEFAZ",orgaosLotacaoPermitidos:["SEFAZ"],orgaosExercicioPermitidos:["SEFAZ"],permiteCessaoExterna:false,exigeAutorizacaoEspecial:false,fundamento:"Lei Complementar nº 266/2006"},
];

export interface ResultadoValidacaoOrgao{valido:boolean;mensagem:string;regra?:RegraOrgaosCarreira}
export function validarOrgaoExercicio(vaga:Vaga,orgaoDestino:string):ResultadoValidacaoOrgao{
 const regra=regrasOrgaosCarreira.find((item)=>item.carreira===vaga.carreira);
 if(!regra)return{valido:false,mensagem:`Não existe regra de órgãos cadastrada para a carreira ${vaga.carreira}.`};
 if(regra.orgaosExercicioPermitidos.includes(orgaoDestino))return{valido:true,mensagem:regra.exigeAutorizacaoEspecial&&orgaoDestino!==vaga.orgaoTitular?"Destino permitido, condicionado à autorização especial.":"Órgão de exercício permitido para a carreira.",regra};
 return{valido:false,mensagem:`${orgaoDestino} não está entre os órgãos de exercício permitidos para ${vaga.carreira}.`,regra};
}

export function registrarCessao(vaga:Vaga,ocupacao:OcupacaoVaga,dados:{destino:string;inicio:string;fim?:string;onus:CessaoFuncional["onus"];processo:string;ato:string}):{ocupacao:OcupacaoVaga;cessao?:CessaoFuncional;validacao:ResultadoValidacaoOrgao}{
 const validacao=validarOrgaoExercicio(vaga,dados.destino);if(!validacao.valido)return{ocupacao,validacao};
 const id=`CES-${ocupacao.vinculoId}-${dados.inicio.replace(/\D/g,"")}`;
 const cessao:CessaoFuncional={id,ocupacaoId:ocupacao.id,vinculoId:ocupacao.vinculoId,vagaId:vaga.id,orgaoCedente:ocupacao.orgaoLotacao.split(" — ")[0],orgaoCessionario:dados.destino,inicio:dados.inicio,fim:dados.fim,onus:dados.onus,processo:dados.processo,ato:dados.ato,situacao:"ATIVA"};
 return{ocupacao:{...ocupacao,orgaoExercicio:dados.destino,eventos:[...ocupacao.eventos,{id:`EVT-${ocupacao.id}-${String(ocupacao.eventos.length+1).padStart(3,"0")}`,tipo:"CORRECAO",data:dados.inicio,registradoEm:"16/07/2026 16:00",descricao:`Exercício alterado para ${dados.destino} por cessão. A vaga permanece titularizada por ${vaga.orgaoTitular}.`,origem:"Vida Funcional",processo:dados.processo,usuario:"Integração SIGEP"}]},cessao,validacao};
}

export function encerrarCessao(cessao:CessaoFuncional,ocupacao:OcupacaoVaga,data:string,motivo:string):{cessao:CessaoFuncional;ocupacao:OcupacaoVaga}{
 return{cessao:{...cessao,situacao:"ENCERRADA",encerradaEm:data,motivoEncerramento:motivo},ocupacao:{...ocupacao,orgaoExercicio:ocupacao.orgaoLotacao,eventos:[...ocupacao.eventos,{id:`EVT-${ocupacao.id}-${String(ocupacao.eventos.length+1).padStart(3,"0")}`,tipo:"CORRECAO",data,registradoEm:"16/07/2026 16:30",descricao:`Cessão encerrada; exercício retornou à lotação ${ocupacao.orgaoLotacao}.`,origem:"Vida Funcional",processo:cessao.processo,usuario:"Integração SIGEP"}]}};
}
