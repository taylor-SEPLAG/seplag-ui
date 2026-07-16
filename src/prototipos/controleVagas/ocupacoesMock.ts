import { vagasIndividualizadasMock } from "./mockData";
import type { OcupacaoVaga } from "./types";

const vaga=(quadro:string,sequencial:number)=>vagasIndividualizadasMock.find((item)=>item.quadroCodigo===quadro&&item.sequencial===sequencial)!;
const eventos=(id:string,inicio:string,encerramento?:string)=>[
 {id:`EVT-${id}-001`,tipo:"REGISTRO" as const,data:inicio,registradoEm:`${inicio} 08:00`,descricao:"Vínculo relacionado à vaga individual.",origem:"Carga histórica",usuario:"Sistema"},
 {id:`EVT-${id}-002`,tipo:"EFETIVO_EXERCICIO" as const,data:inicio,registradoEm:`${inicio} 08:05`,descricao:"Efetivo exercício registrado.",origem:"Vida Funcional",usuario:"Integração SIGEP"},
 ...(encerramento?[{id:`EVT-${id}-003`,tipo:"ENCERRAMENTO" as const,data:encerramento,registradoEm:`${encerramento} 17:00`,descricao:"Ocupação encerrada e vaga liberada.",origem:"Vida Funcional",usuario:"Integração SIGEP"}]:[]),
];

const ocupacoesNominaisBase:OcupacaoVaga[]=[
 {id:"OCU-00001",vagaId:vaga("QA-0001",1).id,pessoaId:"PES-00112",pessoaNome:"Mariana Alves de Souza",cpf:"***.482.***-20",vinculoId:"VIN-1045892",matricula:"1045892",tipoVinculo:"EFETIVO",orgaoVinculo:"SEPLAG",orgaoLotacao:"SEPLAG — Administração Sistêmica",orgaoExercicio:"SEPLAG — Gestão de Pessoas",cargo:vaga("QA-0001",1).cargo,dataPosse:"08/01/2026",efetivoExercicioEm:"10/01/2026",situacao:"ATIVA",eventos:eventos("OCU-00001","10/01/2026")},
 {id:"OCU-00002",vagaId:vaga("QA-0003",1).id,pessoaId:"PES-00112",pessoaNome:"Mariana Alves de Souza",cpf:"***.482.***-20",vinculoId:"VIN-2087411",matricula:"2087411",tipoVinculo:"COMISSIONADO",orgaoVinculo:"SEFAZ",orgaoLotacao:"SEFAZ — Gabinete",orgaoExercicio:"SEFAZ — Gabinete",cargo:vaga("QA-0003",1).cargo,dataPosse:"03/02/2026",efetivoExercicioEm:"04/02/2026",situacao:"ATIVA",eventos:eventos("OCU-00002","04/02/2026")},
 {id:"OCU-00003",vagaId:vaga("QA-0002",1).id,pessoaId:"PES-00345",pessoaNome:"Carlos Henrique Lima",cpf:"***.109.***-44",vinculoId:"VIN-3045220",matricula:"3045220",tipoVinculo:"EFETIVO",orgaoVinculo:"SES",orgaoLotacao:"SES — Hospital Metropolitano",orgaoExercicio:"SES — Hospital Metropolitano",cargo:vaga("QA-0002",1).cargo,dataPosse:"02/03/2025",efetivoExercicioEm:"05/03/2025",situacao:"ATIVA",eventos:eventos("OCU-00003","05/03/2025")},
 {id:"OCU-00004",vagaId:vaga("QA-0001",2).id,pessoaId:"PES-00470",pessoaNome:"João Pedro Nascimento",cpf:"***.715.***-09",vinculoId:"VIN-1008210",matricula:"1008210",tipoVinculo:"EFETIVO",orgaoVinculo:"SEPLAG",orgaoLotacao:"SEPLAG — Administração Sistêmica",orgaoExercicio:"SEPLAG — Administração Sistêmica",cargo:vaga("QA-0001",2).cargo,dataPosse:"02/01/2018",efetivoExercicioEm:"08/01/2018",situacao:"ENCERRADA",encerradaEm:"30/06/2024",motivoEncerramento:"Aposentadoria",eventos:eventos("OCU-00004","08/01/2018","30/06/2024")},
 {id:"OCU-00005",vagaId:vaga("QA-0001",2).id,pessoaId:"PES-00518",pessoaNome:"Renata Ferreira Campos",cpf:"***.390.***-61",vinculoId:"VIN-1046017",matricula:"1046017",tipoVinculo:"EFETIVO",orgaoVinculo:"SEPLAG",orgaoLotacao:"SEPLAG — Administração Sistêmica",orgaoExercicio:"SEPLAG — Administração Sistêmica",cargo:vaga("QA-0001",2).cargo,dataPosse:"04/07/2024",efetivoExercicioEm:"08/07/2024",situacao:"ATIVA",eventos:eventos("OCU-00005","08/07/2024")},
];

const vagasJaOcupadas=new Set(ocupacoesNominaisBase.filter((item)=>item.situacao==="ATIVA").map((item)=>item.vagaId));
const ocupacoesGeradas:OcupacaoVaga[]=vagasIndividualizadasMock.filter((item)=>item.estado==="OCUPADA"&&!vagasJaOcupadas.has(item.id)).map((item,index)=>{const numero=String(index+5000).padStart(7,"0");const id=`OCU-GER-${numero}`;return{id,vagaId:item.id,pessoaId:`PES-GER-${numero}`,pessoaNome:`Ocupante Simulado ${numero}`,cpf:`***.${numero.slice(1,4)}.***-**`,vinculoId:`VIN-${numero}`,matricula:numero,tipoVinculo:item.tipo,orgaoVinculo:item.orgaoTitular,orgaoLotacao:`${item.orgaoTitular} — Lotação simulada`,orgaoExercicio:item.orgaoTitular,cargo:item.cargo,efetivoExercicioEm:"10/01/2026",situacao:"ATIVA",eventos:eventos(id,"10/01/2026")}});
export const ocupacoesVagasMock:OcupacaoVaga[]=[...ocupacoesNominaisBase,...ocupacoesGeradas];
