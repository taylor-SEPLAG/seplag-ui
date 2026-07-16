import type { OcupacaoVaga, Vaga } from "./types";

export interface DadosNovaOcupacao {
  pessoaId:string; pessoaNome:string; cpf:string; vinculoId:string; matricula:string;
  tipoVinculo:"EFETIVO"|"COMISSIONADO"; orgaoVinculo:string; orgaoLotacao?:string; orgaoExercicio:string;
  dataPosse?:string; efetivoExercicioEm:string; processo?:string;
}

export function registrarEfetivoExercicio(vaga:Vaga,dados:DadosNovaOcupacao):{vaga:Vaga;ocupacao:OcupacaoVaga}{
 const id=`OCU-${vaga.id}-${dados.vinculoId}`;
 const ocupacao:OcupacaoVaga={id,vagaId:vaga.id,pessoaId:dados.pessoaId,pessoaNome:dados.pessoaNome,cpf:dados.cpf,vinculoId:dados.vinculoId,matricula:dados.matricula,tipoVinculo:dados.tipoVinculo,orgaoVinculo:dados.orgaoVinculo,orgaoLotacao:dados.orgaoLotacao??dados.orgaoVinculo,orgaoExercicio:dados.orgaoExercicio,cargo:vaga.cargo,dataPosse:dados.dataPosse,efetivoExercicioEm:dados.efetivoExercicioEm,situacao:"ATIVA",eventos:[{id:`EVT-${id}-001`,tipo:"REGISTRO",data:dados.dataPosse??dados.efetivoExercicioEm,registradoEm:"16/07/2026 14:00",descricao:"Vínculo associado à vaga individual.",origem:"Ingresso do Servidor",processo:dados.processo,usuario:"Integração SIGEP"},{id:`EVT-${id}-002`,tipo:"EFETIVO_EXERCICIO",data:dados.efetivoExercicioEm,registradoEm:"16/07/2026 14:00",descricao:"Efetivo exercício confirmado; a ocupação passou a vigorar.",origem:"Vida Funcional",processo:dados.processo,usuario:"Integração SIGEP"}]};
 const historico=[...vaga.historico,{id:`HIS-${vaga.id}-${String(vaga.historico.length+1).padStart(3,"0")}`,vagaId:vaga.id,ocorridoEm:"16/07/2026 14:00",dataEfeito:dados.efetivoExercicioEm,tipo:"ALTERACAO_ESTADO" as const,titulo:"Ocupação nominal iniciada",descricao:`Vínculo ${dados.vinculoId}, matrícula ${dados.matricula}, em efetivo exercício.`,estadoAnterior:vaga.estado,estadoPosterior:"OCUPADA" as const,origem:"Vida Funcional",usuario:"Integração SIGEP",processo:dados.processo}];
 return{vaga:{...vaga,estado:"OCUPADA",historico},ocupacao};
}

export function encerrarOcupacao(vaga:Vaga,ocupacao:OcupacaoVaga,data:string,motivo:string,processo?:string):{vaga:Vaga;ocupacao:OcupacaoVaga}{
 const evento={id:`EVT-${ocupacao.id}-${String(ocupacao.eventos.length+1).padStart(3,"0")}`,tipo:"ENCERRAMENTO" as const,data,registradoEm:"16/07/2026 15:00",descricao:`Ocupação encerrada: ${motivo}.`,origem:"Vida Funcional",processo,usuario:"Integração SIGEP"};
 const atualizada={...ocupacao,situacao:"ENCERRADA" as const,encerradaEm:data,motivoEncerramento:motivo,eventos:[...ocupacao.eventos,evento]};
 const historico=[...vaga.historico,{id:`HIS-${vaga.id}-${String(vaga.historico.length+1).padStart(3,"0")}`,vagaId:vaga.id,ocorridoEm:"16/07/2026 15:00",dataEfeito:data,tipo:"ALTERACAO_ESTADO" as const,titulo:"Ocupação nominal encerrada",descricao:`Vínculo ${ocupacao.vinculoId} liberou a vaga: ${motivo}.`,estadoAnterior:"OCUPADA" as const,estadoPosterior:"DISPONIVEL" as const,origem:"Vida Funcional",usuario:"Integração SIGEP",processo}];
 return{vaga:{...vaga,estado:"DISPONIVEL",historico},ocupacao:atualizada};
}

export const ocupacaoAtivaDaVaga=(ocupacoes:readonly OcupacaoVaga[],vagaId:string)=>ocupacoes.find((item)=>item.vagaId===vagaId&&item.situacao==="ATIVA");
export const historicoOcupantesDaVaga=(ocupacoes:readonly OcupacaoVaga[],vagaId:string)=>ocupacoes.filter((item)=>item.vagaId===vagaId).sort((a,b)=>b.efetivoExercicioEm.localeCompare(a.efetivoExercicioEm));
