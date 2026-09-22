import type { Comissao } from "./types";

export const comissoesMock:Comissao[] = [
 {
  id:"COM-2501", numero:"2501", tipo:"CONCURSO", certameId:"CERT-2026-002",
  nome:"Comissão Especial do Concurso — Auditor Fiscal", observacoes:"",
  previsaoInicio:"01/07/2026", inicio:"01/07/2026", previsaoTermino:"31/12/2026", termino:undefined,
  orgao:"SEFAZ", vinculoResponsavelId:"SRV-0004", status:"EM_ANDAMENTO",
  membros:[
   { id:"MBR-1", servidorId:"SRV-0004", nome:"Diego Martins Rocha", matricula:"456789-4", lotacao:"SEFAZ — Auditoria Fiscal", cargo:"PRESIDENTE", inicio:"01/07/2026", fim:undefined,
    atoNomeacao:{ tipoAto:"PORTARIA", numeroAto:"045/2026/SEFAZ", dataPublicacao:"28/06/2026", localPublicacao:"DOE" } },
   { id:"MBR-2", servidorId:"SRV-0002", nome:"Bruno Henrique Costa Silva", matricula:"234567-2", lotacao:"SEPLAG — Planejamento", cargo:"SECRETARIO", inicio:"01/07/2026", fim:undefined,
    atoNomeacao:{ tipoAto:"PORTARIA", numeroAto:"045/2026/SEFAZ", dataPublicacao:"28/06/2026", localPublicacao:"DOE" } },
  ],
  historicoMembros:[
   { id:"HIST-1", membroId:"MBR-1", membroNome:"Diego Martins Rocha", tipo:"MEMBRO_ADICIONADO", descricao:"Incluído na comissão como Presidente.", registradoEm:"25/06/2026 09:00", usuario:"Roberto Junior — SUGP/SEPLAG" },
   { id:"HIST-2", membroId:"MBR-2", membroNome:"Bruno Henrique Costa Silva", tipo:"MEMBRO_ADICIONADO", descricao:"Incluído na comissão como Secretário.", registradoEm:"01/07/2026 09:00", usuario:"Roberto Junior — SUGP/SEPLAG" },
  ],
  criadoEm:"25/06/2026", atualizadoEm:"01/07/2026",
 },
 {
  id:"COM-2502", numero:"2502", tipo:"PROCESSO_SELETIVO", certameId:"CERT-2026-001",
  nome:"Comissão Especial de Processo Seletivo", observacoes:"Comissão renovada anualmente.",
  previsaoInicio:"25/06/2026", inicio:"25/06/2026", previsaoTermino:undefined, termino:undefined,
  orgao:"SEDUC", vinculoResponsavelId:"SRV-0003", status:"EM_ANDAMENTO",
  membros:[
   { id:"MBR-3", servidorId:"SRV-0003", nome:"Carla Regina Souza Alves", matricula:"345678-3", lotacao:"SEDUC — Ensino Fundamental", cargo:"PRESIDENTE", inicio:"25/06/2026", fim:undefined,
    atoNomeacao:{ tipoAto:"PORTARIA", numeroAto:"", dataPublicacao:undefined, localPublicacao:undefined } },
  ],
  historicoMembros:[
   { id:"HIST-3", membroId:"MBR-3", membroNome:"Carla Regina Souza Alves", tipo:"MEMBRO_ADICIONADO", descricao:"Incluído na comissão como Membro.", registradoEm:"20/06/2026 09:00", usuario:"Roberto Junior — SUGP/SEPLAG" },
   { id:"HIST-4", membroId:"MBR-3", membroNome:"Carla Regina Souza Alves", tipo:"CARGO_ALTERADO", descricao:"Cargo alterado de Membro para Presidente.", registradoEm:"25/06/2026 09:00", usuario:"Roberto Junior — SUGP/SEPLAG" },
  ],
  criadoEm:"20/06/2026", atualizadoEm:"25/06/2026",
 },
 {
  id:"COM-2503", numero:"2503", tipo:"PROCESSO_SELETIVO", certameId:undefined,
  nome:"Comissão de PSS — Assistente Social", observacoes:"",
  previsaoInicio:undefined, inicio:undefined, previsaoTermino:undefined, termino:undefined,
  orgao:"SEPLAG", vinculoResponsavelId:undefined, status:"RASCUNHO",
  membros:[],
  historicoMembros:[],
  criadoEm:"15/07/2026", atualizadoEm:"15/07/2026",
 },
 {
  id:"COM-2490", numero:"2490", tipo:"CONCURSO", certameId:"CERT-2024-001",
  nome:"Comissão do Concurso — Fiscal de Rendas (2024)", observacoes:"",
  previsaoInicio:"05/02/2024", inicio:"05/02/2024", previsaoTermino:"30/11/2024", termino:"30/11/2024",
  orgao:"SEFAZ", vinculoResponsavelId:"SRV-0004", status:"ENCERRADA",
  membros:[
   { id:"MBR-4", servidorId:"SRV-0004", nome:"Diego Martins Rocha", matricula:"456789-4", lotacao:"SEFAZ — Auditoria Fiscal", cargo:"PRESIDENTE", inicio:"05/02/2024", fim:"30/11/2024",
    atoNomeacao:{ tipoAto:"DECRETO", numeroAto:"012/2024", dataPublicacao:"01/02/2024", localPublicacao:"DOE" } },
  ],
  historicoMembros:[],
  criadoEm:"20/01/2024", atualizadoEm:"30/11/2024",
 },
 {
  id:"COM-2504", numero:"2504", tipo:"PROCESSO_SELETIVO", certameId:"CERT-2026-004",
  nome:"Comissão de PSS — Assistente Social", observacoes:"",
  // Início ainda está no futuro em relação a hoje (CONTROLE_PSS_DATA_REFERENCIA, ver constants.ts):
  // esta comissão foi finalizada antes de a vigência começar, então virou Em andamento pela regra de
  // "Finalizar cadastro" (aplicarStatusFinalizacao em ComissaoFormContent), não pela vigência —
  // exemplo desse caminho específico. Ajuste o Início para depois de "hoje" se a data de referência
  // do módulo avançar de novo, senão deixa de demonstrar esse caso (vira Em andamento pela vigência
  // normal de qualquer forma, mas sem exercitar a regra de finalização antecipada).
  previsaoInicio:"10/10/2026", inicio:"10/10/2026", previsaoTermino:"10/04/2027", termino:undefined,
  orgao:"SEPLAG", vinculoResponsavelId:"SRV-0001", status:"EM_ANDAMENTO",
  membros:[
   { id:"MBR-5", servidorId:"SRV-0001", nome:"Ana Paula Ferreira Lima", matricula:"123456-1", lotacao:"SEPLAG — Gestão de Pessoas", cargo:"PRESIDENTE", inicio:"10/10/2026", fim:undefined,
    atoNomeacao:{ tipoAto:"PORTARIA", numeroAto:"078/2026/SEPLAG", dataPublicacao:"07/09/2026", localPublicacao:"DOE", arquivo:{ id:"ARQ-1", nome:"portaria_078_2026_seplag.pdf", extensao:"pdf", contentType:"application/pdf", conteudoEmBase64:"", tamanho:184320 } } },
   { id:"MBR-6", servidorId:"SRV-0002", nome:"Bruno Henrique Costa Silva", matricula:"234567-2", lotacao:"SEPLAG — Planejamento", cargo:"SECRETARIO", inicio:"10/10/2026", fim:undefined,
    atoNomeacao:{ tipoAto:"PORTARIA", numeroAto:"078/2026/SEPLAG", dataPublicacao:"07/09/2026", localPublicacao:"DOE" } },
   { id:"MBR-7", servidorId:"SRV-0005", nome:"Elaine Cristina Barbosa", matricula:"567890-5", lotacao:"SES — Vigilância Sanitária", cargo:"SUPLENTE", inicio:"10/10/2026", fim:undefined,
    atoNomeacao:{ tipoAto:"PORTARIA", numeroAto:"078/2026/SEPLAG", dataPublicacao:"07/09/2026", localPublicacao:"DOE" } },
  ],
  historicoMembros:[
   { id:"HIST-5", membroId:"MBR-5", membroNome:"Ana Paula Ferreira Lima", tipo:"MEMBRO_ADICIONADO", descricao:"Incluído na comissão como Presidente.", registradoEm:"10/09/2026 09:00", usuario:"Roberto Junior — SUGP/SEPLAG" },
   { id:"HIST-6", membroId:"MBR-6", membroNome:"Bruno Henrique Costa Silva", tipo:"MEMBRO_ADICIONADO", descricao:"Incluído na comissão como Secretário.", registradoEm:"10/09/2026 09:00", usuario:"Roberto Junior — SUGP/SEPLAG" },
   { id:"HIST-7", tipo:"DOCUMENTO_COMISSAO_ALTERADO", descricao:"Documento da comissão anexado (portaria_078_2026_seplag.pdf).", registradoEm:"10/09/2026 09:05", usuario:"Roberto Junior — SUGP/SEPLAG" },
   { id:"HIST-8", membroId:"MBR-7", membroNome:"Elaine Cristina Barbosa", tipo:"MEMBRO_ADICIONADO", descricao:"Incluído na comissão como Suplente.", registradoEm:"15/09/2026 09:00", usuario:"Roberto Junior — SUGP/SEPLAG" },
   { id:"HIST-9", membroId:"MBR-5", membroNome:"Ana Paula Ferreira Lima", tipo:"ARQUIVO_ATO_ALTERADO", descricao:"Arquivo do ato de nomeação anexado (portaria_078_2026_seplag.pdf).", registradoEm:"22/09/2026 09:10", usuario:"Roberto Junior — SUGP/SEPLAG" },
   { id:"HIST-14", tipo:"STATUS_ALTERADO", descricao:"Status alterado de Rascunho para Em andamento.", registradoEm:"22/09/2026 09:15", usuario:"Roberto Junior — SUGP/SEPLAG" },
  ],
  arquivo:{ id:"ARQ-2", nome:"portaria_078_2026_seplag.pdf", extensao:"pdf", contentType:"application/pdf", conteudoEmBase64:"", tamanho:184320 },
  criadoEm:"10/09/2026", atualizadoEm:"22/09/2026",
 },
 {
  id:"COM-2505", numero:"2505", tipo:"CONCURSO", certameId:"CERT-2026-005",
  nome:"Comissão do Concurso — Fiscal de Rendas 2026", observacoes:"Aguardando definição do responsável e composição.",
  previsaoInicio:undefined, inicio:undefined, previsaoTermino:undefined, termino:undefined,
  orgao:"SEFAZ", vinculoResponsavelId:undefined, status:"RASCUNHO",
  membros:[],
  historicoMembros:[],
  criadoEm:"18/07/2026", atualizadoEm:"18/07/2026",
 },
 {
  id:"COM-2470", numero:"2470", tipo:"PROCESSO_SELETIVO", certameId:"CERT-2025-014",
  nome:"Comissão de PSS — Enfermagem (2025)", observacoes:"",
  previsaoInicio:"10/01/2025", inicio:"10/01/2025", previsaoTermino:"10/07/2025", termino:"10/07/2025",
  orgao:"SES", vinculoResponsavelId:"SRV-0005", status:"ENCERRADA",
  membros:[
   { id:"MBR-8", servidorId:"SRV-0005", nome:"Elaine Cristina Barbosa", matricula:"567890-5", lotacao:"SES — Vigilância Sanitária", cargo:"PRESIDENTE", inicio:"10/01/2025", fim:"10/07/2025",
    atoNomeacao:{ tipoAto:"PORTARIA", numeroAto:"003/2025/SES", dataPublicacao:"08/01/2025", localPublicacao:"DOE" } },
   { id:"MBR-9", servidorId:"SRV-0006", nome:"Fábio Augusto Pereira", matricula:"678901-6", lotacao:"SESP — Corregedoria", cargo:"MEMBRO", inicio:"10/01/2025", fim:"10/07/2025",
    atoNomeacao:{ tipoAto:"PORTARIA", numeroAto:"003/2025/SES", dataPublicacao:"08/01/2025", localPublicacao:"DOE" } },
  ],
  historicoMembros:[
   { id:"HIST-10", membroId:"MBR-8", membroNome:"Elaine Cristina Barbosa", tipo:"MEMBRO_ADICIONADO", descricao:"Incluído na comissão como Presidente.", registradoEm:"10/01/2025 09:00", usuario:"Roberto Junior — SUGP/SEPLAG" },
   { id:"HIST-11", membroId:"MBR-10", membroNome:"Gabriel Nunes Teixeira", tipo:"MEMBRO_ADICIONADO", descricao:"Incluído na comissão como Membro.", registradoEm:"10/01/2025 09:00", usuario:"Roberto Junior — SUGP/SEPLAG" },
   { id:"HIST-12", membroId:"MBR-10", membroNome:"Gabriel Nunes Teixeira", tipo:"MEMBRO_REMOVIDO", descricao:"Removido da comissão (era Membro).", registradoEm:"15/03/2025 09:00", usuario:"Roberto Junior — SUGP/SEPLAG" },
   { id:"HIST-13", membroId:"MBR-9", membroNome:"Fábio Augusto Pereira", tipo:"MEMBRO_ADICIONADO", descricao:"Incluído na comissão como Membro.", registradoEm:"15/03/2025 09:00", usuario:"Roberto Junior — SUGP/SEPLAG" },
  ],
  criadoEm:"20/12/2024", atualizadoEm:"10/07/2025",
 },
 {
  id:"COM-2506", numero:"2506", tipo:"PROCESSO_SELETIVO", certameId:undefined,
  nome:"Comissão de PSS — Gestão Prisional", observacoes:"",
  previsaoInicio:undefined, inicio:undefined, previsaoTermino:undefined, termino:undefined,
  orgao:"SEJUS", vinculoResponsavelId:undefined, status:"RASCUNHO",
  membros:[],
  historicoMembros:[],
  criadoEm:"22/07/2026", atualizadoEm:"22/07/2026",
 },
];
