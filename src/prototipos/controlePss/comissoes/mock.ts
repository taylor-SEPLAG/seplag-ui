import type { Comissao } from "./types";

export const comissoesMock:Comissao[] = [
 {
  id:"COM-2501", numero:"2501", tipo:"CONCURSO", certameId:"CERT-2026-002",
  nome:"Comissão Especial do Concurso — Auditor Fiscal", finalidade:"Acompanhar a execução do concurso público, da abertura até a homologação do resultado.", observacoes:"",
  previsaoInicio:"01/07/2026", inicio:"01/07/2026", previsaoTermino:"31/12/2026", termino:undefined,
  orgao:"SEFAZ", vinculoResponsavelId:"SRV-0004", status:"EM_ANDAMENTO",
  membros:[
   { id:"MBR-1", servidorId:"SRV-0004", nome:"Diego Martins Rocha", matricula:"456789-4", lotacao:"SEFAZ — Auditoria Fiscal", cargo:"PRESIDENTE", inicio:"01/07/2026", fim:undefined,
    atoNomeacao:{ tipoAto:"PORTARIA", numeroAto:"045/2026/SEFAZ", dataPublicacao:"28/06/2026", localPublicacao:"DOE", arquivos:[] } },
   { id:"MBR-2", servidorId:"SRV-0002", nome:"Bruno Henrique Costa Silva", matricula:"234567-2", lotacao:"SEPLAG — Planejamento", cargo:"SECRETARIO", inicio:"01/07/2026", fim:undefined,
    atoNomeacao:{ tipoAto:"PORTARIA", numeroAto:"045/2026/SEFAZ", dataPublicacao:"28/06/2026", localPublicacao:"DOE", arquivos:[] } },
  ],
  criadoEm:"25/06/2026", atualizadoEm:"01/07/2026",
 },
 {
  id:"COM-2502", numero:"2502", tipo:"PROCESSO_SELETIVO", certameId:"CERT-2026-001",
  nome:"Comissão Especial de Processo Seletivo", finalidade:"Conduzir o processo seletivo simplificado para contratação temporária de professores.", observacoes:"Comissão renovada anualmente.",
  previsaoInicio:"25/06/2026", inicio:"25/06/2026", previsaoTermino:undefined, termino:undefined,
  orgao:"SEDUC", vinculoResponsavelId:"SRV-0003", status:"EM_ANDAMENTO",
  membros:[
   { id:"MBR-3", servidorId:"SRV-0003", nome:"Carla Regina Souza Alves", matricula:"345678-3", lotacao:"SEDUC — Ensino Fundamental", cargo:"PRESIDENTE", inicio:"25/06/2026", fim:undefined,
    atoNomeacao:{ tipoAto:"PORTARIA", numeroAto:"", dataPublicacao:undefined, localPublicacao:undefined, arquivos:[] } },
  ],
  criadoEm:"20/06/2026", atualizadoEm:"25/06/2026",
 },
 {
  id:"COM-2503", numero:"2503", tipo:"PROCESSO_SELETIVO", certameId:undefined,
  nome:"Comissão de PSS — Assistente Social", finalidade:"", observacoes:"",
  previsaoInicio:undefined, inicio:undefined, previsaoTermino:undefined, termino:undefined,
  orgao:"SEPLAG", vinculoResponsavelId:undefined, status:"RASCUNHO",
  membros:[],
  criadoEm:"10/09/2026", atualizadoEm:"10/09/2026",
 },
 {
  id:"COM-2490", numero:"2490", tipo:"CONCURSO", certameId:undefined,
  nome:"Comissão do Concurso — Fiscal de Rendas (2024)", finalidade:"Comissão do concurso encerrado em 2024.", observacoes:"",
  previsaoInicio:"05/02/2024", inicio:"05/02/2024", previsaoTermino:"30/11/2024", termino:"30/11/2024",
  orgao:"SEFAZ", vinculoResponsavelId:"SRV-0004", status:"ENCERRADA",
  membros:[
   { id:"MBR-4", servidorId:"SRV-0004", nome:"Diego Martins Rocha", matricula:"456789-4", lotacao:"SEFAZ — Auditoria Fiscal", cargo:"PRESIDENTE", inicio:"05/02/2024", fim:"30/11/2024",
    atoNomeacao:{ tipoAto:"DECRETO", numeroAto:"012/2024", dataPublicacao:"01/02/2024", localPublicacao:"DOE", arquivos:[] } },
  ],
  criadoEm:"20/01/2024", atualizadoEm:"30/11/2024",
 },
];
