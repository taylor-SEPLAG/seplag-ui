import type { IngressoServidorPss, RegistroDeParaPss } from "./types";

/** Cargas de-para já executadas no protótipo (RF-001 §7): identificadores espelham os candidatos, processos e vagas dos demais mocks. */
export const registrosDeParaMock:RegistroDeParaPss[]=[
 {
  id:"RDP-CPS-014-0001",processoId:"PSS-2025-014",processoNumero:"PSS 014/2025",candidatoId:"CPS-014-0001",cpf:"178.901.234-56",
  cargoEdital:"Analista de Meio Ambiente",cargoSigep:"Analista de Meio Ambiente",
  localCidade:"Superintendências de licenciamento e fiscalização",lotacaoPretendida:"Superintendências de licenciamento e fiscalização",
  statusInscricaoSies:"Inscrição deferida e classificada",statusCandidatoSigep:"Nomeado",statusConvocacaoSies:"Convocação nº 001/2026 — encerrada",statusIngressoSigep:"Apto ao ingresso",
  situacaoCarga:"CARREGADO",contingenciaManual:false,carregadoEm:"2026-03-20",responsavel:"Vinícius Duarte Peçanha",
 },
 {
  id:"RDP-CPS-002-0001",processoId:"PSS-2026-002",processoNumero:"PSS 002/2026",candidatoId:"CPS-002-0001",cpf:"012.345.678-90",
  cargoEdital:"Profissional Técnico de Nível Superior em Serviços de Saúde do SUS",cargoSigep:"Profissional Técnico de Nível Superior em Serviços de Saúde do SUS",
  localCidade:"Hospitais regionais de Rondonópolis, Sinop e Cáceres",lotacaoPretendida:"Hospitais regionais de Rondonópolis, Sinop e Cáceres",
  statusInscricaoSies:"Inscrição deferida e classificada",statusCandidatoSigep:"Convocado",statusIngressoSigep:"Aguardando confirmação da convocação",
  situacaoCarga:"PENDENTE_CONVOCACAO_SIES",contingenciaManual:true,carregadoEm:"2026-07-22",responsavel:"Rosângela Batista de Souza",
 },
 {
  id:"RDP-CPS-002-0003",processoId:"PSS-2026-002",processoNumero:"PSS 002/2026",candidatoId:"CPS-002-0003",cpf:"034.567.890-12",
  cargoEdital:"Profissional Técnico de Nível Superior em Serviços de Saúde do SUS",cargoSigep:"Profissional Técnico de Nível Superior em Serviços de Saúde do SUS",
  localCidade:"Hospitais regionais de Rondonópolis, Sinop e Cáceres",lotacaoPretendida:"Hospitais regionais de Rondonópolis, Sinop e Cáceres",
  statusInscricaoSies:"Inscrição deferida e classificada",statusCandidatoSigep:"Convocado",statusIngressoSigep:"Documentação em conferência",
  situacaoCarga:"PENDENTE_VALIDACAO_DOCUMENTAL",contingenciaManual:false,carregadoEm:"2026-07-22",responsavel:"Rosângela Batista de Souza",
 },
 {
  id:"RDP-CPS-004-0001",processoId:"PSS-2026-004",processoNumero:"PSS 004/2026",candidatoId:"CPS-004-0001",cpf:"201.234.567-89",
  cargoEdital:"Assistente do Sistema Penitenciário",cargoSigep:"Assistente do Sistema Penitenciário",
  localCidade:"Unidades prisionais da região metropolitana",lotacaoPretendida:"Unidades prisionais da região metropolitana",
  statusInscricaoSies:"Inscrição recebida",statusCandidatoSigep:"Inscrito",statusIngressoSigep:"Carga bloqueada por divergência SIGEP × SIES",
  situacaoCarga:"PENDENTE_VALIDACAO_DOCUMENTAL",contingenciaManual:false,carregadoEm:"2026-07-28",responsavel:"Cláudia Reis Nakamura",
 },
];

/** Ingressos de servidores temporários já registrados no SIGEP (RN06/RN07). */
export const ingressosPssMock:IngressoServidorPss[]=[
 {
  id:"ING-2025-014-0001",processoId:"PSS-2025-014",candidatoId:"CPS-014-0001",vagaProcessoId:"VPS-2025-014-01",orgao:"SEMA",
  lotacao:"Superintendências de licenciamento e fiscalização",dataIngresso:"2026-04-06",confirmacaoConvocacao:true,validacaoDocumental:true,
  situacao:"EFETIVADO",origemRegistroDeParaId:"RDP-CPS-014-0001",contingenciaManual:false,responsavel:"Vinícius Duarte Peçanha",registradoEm:"2026-04-06 09:20",
 },
 {
  id:"ING-2025-014-0002",processoId:"PSS-2025-014",candidatoId:"CPS-014-0002",vagaProcessoId:"VPS-2025-014-01",orgao:"SEMA",
  lotacao:"Superintendências de licenciamento e fiscalização",dataIngresso:"2026-04-06",confirmacaoConvocacao:true,validacaoDocumental:true,
  situacao:"EFETIVADO",contingenciaManual:false,responsavel:"Vinícius Duarte Peçanha",registradoEm:"2026-04-06 09:35",
 },
 {
  id:"ING-2026-002-0001",processoId:"PSS-2026-002",candidatoId:"CPS-002-0001",vagaProcessoId:"VPS-2026-002-01",orgao:"SES",
  lotacao:"Hospitais regionais de Rondonópolis, Sinop e Cáceres",confirmacaoConvocacao:false,validacaoDocumental:true,
  situacao:"PENDENTE",origemRegistroDeParaId:"RDP-CPS-002-0001",contingenciaManual:true,
  justificativaContingencia:"Convocação nº 001/2026 publicada em Word e ainda não estruturada no SIES; ingresso registrado provisoriamente até a carga completa do de-para.",
  responsavel:"Rosângela Batista de Souza",registradoEm:"2026-07-24 15:10",
 },
 {
  id:"ING-2026-002-0003",processoId:"PSS-2026-002",candidatoId:"CPS-002-0003",vagaProcessoId:"VPS-2026-002-01",orgao:"SES",
  lotacao:"Hospitais regionais de Rondonópolis, Sinop e Cáceres",confirmacaoConvocacao:false,validacaoDocumental:false,
  situacao:"BLOQUEADO",origemRegistroDeParaId:"RDP-CPS-002-0003",contingenciaManual:false,
  justificativaContingencia:"Aguarda conferência da documentação de posse; ingresso bloqueado até a validação documental.",
  responsavel:"Rosângela Batista de Souza",registradoEm:"2026-07-24 15:22",
 },
];
