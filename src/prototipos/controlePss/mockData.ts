import { gerarEtapasDoProcesso, type AjusteEtapaPss } from "./fluxoPssUtils";
import type { CargoSiesReferencia, EtapaFluxoPss, HistoricoProcessoPss, ModalidadeExecucaoPss, ProcessoPss, SituacaoProcessoPss, TipoProcessoPss } from "./types";

interface EntradaProcessoPss {
 id:string; numero:string; edital:string; orgaoSolicitante:string; justificativa:string; tipo:TipoProcessoPss;
 modalidadeExecucao:ModalidadeExecucaoPss; empresaContratada?:string; cargos:string[]; cbos:string[];
 vagasImediatas:number; vagasCadastroReserva:number; dataAbertura:string; dataPrevistaHomologacao?:string; dataHomologacao?:string;
 situacao:SituacaoProcessoPss; etapaAtual:EtapaFluxoPss; divergenciaSies:boolean; processoSigadoc:string; responsavel:string;
 atualizadoEm:string; versao:number; ajustes?:AjusteEtapaPss[]; historico:Omit<HistoricoProcessoPss,"processoId">[];
}

const criarProcesso=(entrada:EntradaProcessoPss):ProcessoPss=>({
 id:entrada.id,numero:entrada.numero,edital:entrada.edital,orgaoSolicitante:entrada.orgaoSolicitante,justificativa:entrada.justificativa,
 tipo:entrada.tipo,modalidadeExecucao:entrada.modalidadeExecucao,empresaContratada:entrada.empresaContratada,
 cargos:entrada.cargos,cbos:entrada.cbos,vagasImediatas:entrada.vagasImediatas,vagasCadastroReserva:entrada.vagasCadastroReserva,
 dataAbertura:entrada.dataAbertura,dataPrevistaHomologacao:entrada.dataPrevistaHomologacao,dataHomologacao:entrada.dataHomologacao,
 situacao:entrada.situacao,etapaAtual:entrada.etapaAtual,
 etapas:gerarEtapasDoProcesso({processoId:entrada.id,etapaAtual:entrada.etapaAtual,modalidadeExecucao:entrada.modalidadeExecucao,dataAbertura:entrada.dataAbertura,ajustes:entrada.ajustes}),
 historico:entrada.historico.map((item)=>({...item,processoId:entrada.id})),
 divergenciaSies:entrada.divergenciaSies,processoSigadoc:entrada.processoSigadoc,responsavel:entrada.responsavel,
 atualizadoEm:entrada.atualizadoEm,versao:entrada.versao,
});

export const processosPssMock:ProcessoPss[]=[
 criarProcesso({
  id:"PSS-2026-001",numero:"PSS 001/2026",edital:"Edital SEDUC/SEPLAG nº 004/2026",orgaoSolicitante:"SEDUC",
  justificativa:"Reposição do quadro docente da rede estadual após aposentadorias e vacâncias acumuladas nos exercícios de 2024 e 2025, com déficit apurado de 1.240 professores em 87 municípios.",
  tipo:"CONCURSO",modalidadeExecucao:"EMPRESA_CONTRATADA",empresaContratada:"Instituto Nacional de Seleções Públicas — INSEL",
  cargos:["Professor de Educação Básica","Técnico Administrativo Educacional"],cbos:["231205","411005"],
  vagasImediatas:1240,vagasCadastroReserva:2480,dataAbertura:"2026-01-12",dataPrevistaHomologacao:"2026-11-30",
  situacao:"EM_ANDAMENTO",etapaAtual:"PROVAS_CLASSIFICACAO",divergenciaSies:false,
  processoSigadoc:"SEDUC-PRO-2026/00118",responsavel:"Marcelo Tavares de Assunção",atualizadoEm:"2026-07-24 16:40",versao:3,
  ajustes:[
   {etapa:"PUBLICACAO_EDITAL",observacao:"Edital redigido em Word pela comissão e encaminhado por ofício à IOMAT.",pendencias:["Documento produzido fora do sistema.","Número da publicação lançado manualmente no processo."]},
   {etapa:"PROVAS_CLASSIFICACAO",situacao:"EM_ANDAMENTO",automacao:"PARCIAL",responsavel:"INSEL — banca examinadora",observacao:"Provas objetivas aplicadas em 12/07/2026; apuração das notas recebida em planilha da empresa contratada.",pendencias:["Importação das notas ainda depende de planilha enviada pela empresa contratada."]},
  ],
  historico:[
   {id:"HPS-001-01",ocorridoEm:"2026-01-12 09:10",dataEfeito:"2026-01-12",tipo:"CRIACAO",titulo:"Processo seletivo aberto",descricao:"Justificativa técnica protocolada pela SEDUC no Sigadoc.",origem:"Sigadoc",usuario:"Marcelo Tavares de Assunção",processoSigadoc:"SEDUC-PRO-2026/00118",situacaoPosterior:"EM_ELABORACAO"},
   {id:"HPS-001-02",ocorridoEm:"2026-03-04 14:25",dataEfeito:"2026-03-02",tipo:"ALTERACAO_SITUACAO",titulo:"Execução delegada à empresa contratada",descricao:"Contrato nº 019/2026 firmado com o INSEL para organização integral do certame.",origem:"Cadastro de Processos",usuario:"Comissão de Licitação",situacaoAnterior:"EM_ELABORACAO",situacaoPosterior:"EM_ANDAMENTO"},
   {id:"HPS-001-03",ocorridoEm:"2026-04-18 08:05",dataEfeito:"2026-04-17",tipo:"PUBLICACAO",titulo:"Edital de abertura publicado",descricao:"Publicação no Diário Oficial do Estado, página 14, caderno de atos administrativos.",origem:"IOMAT",usuario:"Comissão do certame",etapaAnterior:"RESERVA_ORCAMENTARIA",etapaPosterior:"PUBLICACAO_EDITAL"},
   {id:"HPS-001-04",ocorridoEm:"2026-07-14 11:30",dataEfeito:"2026-07-12",tipo:"ALTERACAO_ETAPA",titulo:"Provas aplicadas",descricao:"Provas objetivas aplicadas em 87 municípios; correção sob responsabilidade da empresa contratada.",origem:"SIGEP",usuario:"Integração INSEL",etapaAnterior:"INSCRICOES",etapaPosterior:"PROVAS_CLASSIFICACAO"},
  ],
 }),
 criarProcesso({
  id:"PSS-2026-002",numero:"PSS 002/2026",edital:"Edital SES/SEPLAG nº 011/2026",orgaoSolicitante:"SES",
  justificativa:"Contratação temporária de profissionais de saúde para os hospitais regionais de Rondonópolis, Sinop e Cáceres, em razão do plano estadual de redução de filas cirúrgicas.",
  tipo:"SELETIVO_SIMPLIFICADO",modalidadeExecucao:"PROPRIA",
  cargos:["Profissional Técnico de Nível Superior em Serviços de Saúde do SUS","Profissional Técnico de Nível Médio em Serviços de Saúde do SUS"],cbos:["223505","322205"],
  vagasImediatas:186,vagasCadastroReserva:372,dataAbertura:"2026-02-09",dataPrevistaHomologacao:"2026-09-15",
  situacao:"EM_ANDAMENTO",etapaAtual:"CONVOCACAO",divergenciaSies:false,
  processoSigadoc:"SES-PRO-2026/00507",responsavel:"Rosângela Batista de Souza",atualizadoEm:"2026-07-27 10:12",versao:2,
  ajustes:[
   {etapa:"CONVOCACAO",situacao:"EM_ANDAMENTO",automacao:"MANUAL",observacao:"Lista de convocação montada em Word a partir da consulta de classificação; conferência de ordem feita manualmente.",pendencias:["Não há geração automática da lista de convocação.","Controle de prazo de apresentação é feito em planilha paralela."]},
   {etapa:"PUBLICACOES",situacao:"PENDENTE",automacao:"MANUAL",pendencias:["Listagens de deferidos e indeferidos exportadas em Word.","Envio ao Diário Oficial ainda ocorre por ofício."]},
  ],
  historico:[
   {id:"HPS-002-01",ocorridoEm:"2026-02-09 08:40",dataEfeito:"2026-02-09",tipo:"CRIACAO",titulo:"Processo seletivo simplificado aberto",descricao:"Necessidade emergencial justificada pela Secretaria de Estado de Saúde.",origem:"Sigadoc",usuario:"Rosângela Batista de Souza",processoSigadoc:"SES-PRO-2026/00507",situacaoPosterior:"EM_ELABORACAO"},
   {id:"HPS-002-02",ocorridoEm:"2026-05-06 15:50",dataEfeito:"2026-05-05",tipo:"ALTERACAO_ETAPA",titulo:"Cadastro de reserva formado",descricao:"1.043 candidatos classificados; 186 dentro das vagas imediatas.",origem:"SIES",usuario:"Integração SIES",etapaAnterior:"CADASTRO_SIES",etapaPosterior:"CADASTRO_RESERVA"},
   {id:"HPS-002-03",ocorridoEm:"2026-07-20 09:15",dataEfeito:"2026-07-20",tipo:"ALTERACAO_ETAPA",titulo:"Primeira convocação em elaboração",descricao:"Convocação nº 001/2026 abrangendo os 96 primeiros classificados de nível superior.",origem:"SIES",usuario:"Rosângela Batista de Souza",etapaAnterior:"CADASTRO_RESERVA",etapaPosterior:"CONVOCACAO"},
  ],
 }),
 criarProcesso({
  id:"PSS-2026-003",numero:"PSS 003/2026",edital:"Minuta de edital SESP nº 002/2026",orgaoSolicitante:"SESP",
  justificativa:"Ampliação do efetivo da Polícia Judiciária Civil prevista no Plano Estadual de Segurança Pública, com déficit de 412 investigadores nas delegacias do interior.",
  tipo:"CONCURSO",modalidadeExecucao:"PROPRIA",
  cargos:["Investigador de Polícia","Escrivão de Polícia"],cbos:["516210","351305"],
  vagasImediatas:412,vagasCadastroReserva:824,dataAbertura:"2026-06-01",dataPrevistaHomologacao:"2027-04-30",
  situacao:"EM_ELABORACAO",etapaAtual:"ANALISE_SECRETARIAS",divergenciaSies:false,
  processoSigadoc:"SESP-PRO-2026/00233",responsavel:"Delegado Fernando Kruger Lima",atualizadoEm:"2026-07-22 17:05",versao:1,
  ajustes:[
   {etapa:"ANALISE_SECRETARIAS",situacao:"EM_ANDAMENTO",observacao:"Processo em análise conjunta SEPLAG/SEFAZ desde 18/06/2026; aguarda parecer da Secretaria Adjunta de Gestão de Pessoas.",pendencias:["Tramitação acompanhada apenas pelo número do processo no Sigadoc.","Não há prazo sistêmico de resposta por secretaria."]},
  ],
  historico:[
   {id:"HPS-003-01",ocorridoEm:"2026-06-01 10:20",dataEfeito:"2026-06-01",tipo:"CRIACAO",titulo:"Justificativa técnica protocolada",descricao:"Pedido de abertura de concurso encaminhado pela SESP com anexo do estudo de déficit.",origem:"Sigadoc",usuario:"Delegado Fernando Kruger Lima",processoSigadoc:"SESP-PRO-2026/00233",situacaoPosterior:"EM_ELABORACAO"},
   {id:"HPS-003-02",ocorridoEm:"2026-06-18 14:00",dataEfeito:"2026-06-18",tipo:"ALTERACAO_ETAPA",titulo:"Encaminhado para análise das secretarias",descricao:"Processo distribuído para SEPLAG, SEFAZ e Casa Civil.",origem:"Sigadoc",usuario:"Protocolo SESP",etapaAnterior:"JUSTIFICATIVA_TECNICA",etapaPosterior:"ANALISE_SECRETARIAS"},
  ],
 }),
 criarProcesso({
  id:"PSS-2026-004",numero:"PSS 004/2026",edital:"Edital SEJUS/SEPLAG nº 007/2026",orgaoSolicitante:"SEJUS",
  justificativa:"Recomposição do quadro de apoio das unidades prisionais da região metropolitana, com previsão de 210 vagas imediatas e cadastro de reserva.",
  tipo:"SELETIVO_SIMPLIFICADO",modalidadeExecucao:"PROPRIA",
  cargos:["Assistente do Sistema Penitenciário","Auxiliar do Sistema Penitenciário"],cbos:["411005","514320"],
  vagasImediatas:210,vagasCadastroReserva:420,dataAbertura:"2026-03-16",dataPrevistaHomologacao:"2026-10-31",
  situacao:"EM_ANDAMENTO",etapaAtual:"CADASTRO_SIES",divergenciaSies:true,
  processoSigadoc:"SEJUS-PRO-2026/00089",responsavel:"Cláudia Reis Nakamura",atualizadoEm:"2026-07-28 08:55",versao:2,
  ajustes:[
   {etapa:"CADASTRO_SIES",situacao:"BLOQUEADA",automacao:"PARCIAL",observacao:"Cadastro do certame no SIES interrompido: o cargo Auxiliar do Sistema Penitenciário não possui correspondência no catálogo do SIES.",pendencias:["Cargo cadastrado no SIGEP sem correspondência no SIES.","CBO 514320 não validado contra a tabela do eSocial.","Quantitativo divergente: 210 vagas no SIGEP e 180 no SIES."]},
   {etapa:"CADASTRO_RESERVA",situacao:"BLOQUEADA",pendencias:["Depende da regularização do cadastro do certame no SIES."]},
  ],
  historico:[
   {id:"HPS-004-01",ocorridoEm:"2026-03-16 09:00",dataEfeito:"2026-03-16",tipo:"CRIACAO",titulo:"Processo seletivo simplificado aberto",descricao:"Necessidade de recomposição do quadro de apoio das unidades prisionais.",origem:"Sigadoc",usuario:"Cláudia Reis Nakamura",processoSigadoc:"SEJUS-PRO-2026/00089",situacaoPosterior:"EM_ELABORACAO"},
   {id:"HPS-004-02",ocorridoEm:"2026-06-30 16:45",dataEfeito:"2026-06-30",tipo:"ALTERACAO_ETAPA",titulo:"Cadastro do certame iniciado no SIES",descricao:"Registro do certame e dos cargos no sistema de gestão do concurso.",origem:"SIES",usuario:"Integração SIES",etapaAnterior:"PUBLICACAO_EDITAL",etapaPosterior:"CADASTRO_SIES"},
   {id:"HPS-004-03",ocorridoEm:"2026-07-06 11:22",dataEfeito:"2026-07-06",tipo:"DIVERGENCIA",titulo:"Divergência SIGEP × SIES identificada",descricao:"Cargo sem correspondência no SIES e quantitativo divergente entre os sistemas; etapa bloqueada até a conciliação.",origem:"Controle PSS",usuario:"Rotina de conciliação"},
  ],
 }),
 criarProcesso({
  id:"PSS-2026-005",numero:"PSS 005/2026",edital:"Edital SEFAZ/SEPLAG nº 002/2026",orgaoSolicitante:"SEFAZ",
  justificativa:"Provimento de cargos da carreira de Tributação, Arrecadação e Fiscalização em razão do plano de sucessão da Secretaria de Fazenda.",
  tipo:"CONCURSO",modalidadeExecucao:"PROPRIA",
  cargos:["Fiscal de Tributos Estaduais"],cbos:["212405"],
  vagasImediatas:96,vagasCadastroReserva:192,dataAbertura:"2025-11-10",dataPrevistaHomologacao:"2026-08-31",
  situacao:"EM_ANDAMENTO",etapaAtual:"CONTROLE_VAGAS_SIGEP",divergenciaSies:true,
  processoSigadoc:"SEFAZ-PRO-2025/01340",responsavel:"Henrique Portela Vasconcelos",atualizadoEm:"2026-07-26 13:38",versao:4,
  ajustes:[
   {etapa:"CONTROLE_VAGAS_SIGEP",situacao:"EM_ANDAMENTO",automacao:"PARCIAL",observacao:"Conciliação em curso entre as 96 vagas do edital e o quadro autorizado; CBO informado no edital difere do CBO registrado no cargo.",pendencias:["CBO 212405 informado no edital difere do CBO 212410 do cargo no SIGEP.","Reserva de vagas no Controle de Vagas ainda feita por planilha."]},
  ],
  historico:[
   {id:"HPS-005-01",ocorridoEm:"2025-11-10 08:30",dataEfeito:"2025-11-10",tipo:"CRIACAO",titulo:"Concurso público autorizado",descricao:"Autorização governamental para provimento de 96 vagas da carreira TAF.",origem:"Sigadoc",usuario:"Henrique Portela Vasconcelos",processoSigadoc:"SEFAZ-PRO-2025/01340",situacaoPosterior:"EM_ANDAMENTO"},
   {id:"HPS-005-02",ocorridoEm:"2026-05-29 17:10",dataEfeito:"2026-05-28",tipo:"ALTERACAO_ETAPA",titulo:"Edital vinculado ao SIGEP",descricao:"Edital cadastrado no módulo de gestão de pessoas para originar os ingressos.",origem:"SIGEP",usuario:"Integração SIGEP",etapaAnterior:"PUBLICACOES",etapaPosterior:"CADASTRO_EDITAL_SIGEP"},
   {id:"HPS-005-03",ocorridoEm:"2026-07-15 09:47",dataEfeito:"2026-07-15",tipo:"DIVERGENCIA",titulo:"CBO divergente entre edital e cargo",descricao:"O CBO informado no edital não corresponde ao CBO registrado no cargo do quadro autorizado.",origem:"Controle PSS",usuario:"Rotina de conciliação"},
  ],
 }),
 criarProcesso({
  id:"PSS-2026-006",numero:"PSS 006/2026",edital:"Minuta de edital SETASC nº 001/2026",orgaoSolicitante:"SETASC",
  justificativa:"Estruturação das equipes técnicas dos centros de referência de assistência social do interior do Estado.",
  tipo:"SELETIVO_SIMPLIFICADO",modalidadeExecucao:"PROPRIA",
  cargos:["Analista do Desenvolvimento Econômico e Social"],cbos:["251605"],
  vagasImediatas:64,vagasCadastroReserva:128,dataAbertura:"2026-05-04",dataPrevistaHomologacao:"2026-12-18",
  situacao:"EM_ELABORACAO",etapaAtual:"RESERVA_ORCAMENTARIA",divergenciaSies:false,
  processoSigadoc:"SETASC-PRO-2026/00061",responsavel:"Patrícia Nunes de Almeida",atualizadoEm:"2026-07-21 15:20",versao:1,
  ajustes:[
   {etapa:"RESERVA_ORCAMENTARIA",situacao:"EM_ANDAMENTO",automacao:"PARCIAL",observacao:"Nota de reserva emitida no FIPLAN; declaração de adequação da LRF ainda pendente de assinatura.",pendencias:["Confirmação orçamentária lançada manualmente a partir do FIPLAN.","Declaração de adequação da LRF pendente de assinatura."]},
  ],
  historico:[
   {id:"HPS-006-01",ocorridoEm:"2026-05-04 11:05",dataEfeito:"2026-05-04",tipo:"CRIACAO",titulo:"Justificativa técnica protocolada",descricao:"Pedido de seleção simplificada para equipes dos CRAS e CREAS.",origem:"Sigadoc",usuario:"Patrícia Nunes de Almeida",processoSigadoc:"SETASC-PRO-2026/00061",situacaoPosterior:"EM_ELABORACAO"},
   {id:"HPS-006-02",ocorridoEm:"2026-07-06 10:00",dataEfeito:"2026-07-03",tipo:"ALTERACAO_ETAPA",titulo:"Análise das secretarias concluída",descricao:"Parecer favorável da SEPLAG; processo encaminhado para reserva orçamentária.",origem:"Sigadoc",usuario:"SEPLAG — Gestão de Pessoas",etapaAnterior:"ANALISE_SECRETARIAS",etapaPosterior:"RESERVA_ORCAMENTARIA"},
  ],
 }),
 criarProcesso({
  id:"PSS-2025-014",numero:"PSS 014/2025",edital:"Edital SEMA/SEPLAG nº 009/2025",orgaoSolicitante:"SEMA",
  justificativa:"Provimento de cargos técnicos do meio ambiente para atendimento das metas de licenciamento e fiscalização ambiental.",
  tipo:"CONCURSO",modalidadeExecucao:"PROPRIA",
  cargos:["Analista de Meio Ambiente","Técnico de Meio Ambiente"],cbos:["213155","311715"],
  vagasImediatas:78,vagasCadastroReserva:156,dataAbertura:"2025-02-17",dataPrevistaHomologacao:"2026-02-28",dataHomologacao:"2026-03-06",
  situacao:"HOMOLOGADO",etapaAtual:"HOMOLOGACAO",divergenciaSies:false,
  processoSigadoc:"SEMA-PRO-2025/00042",responsavel:"Vinícius Duarte Peçanha",atualizadoEm:"2026-03-06 18:00",versao:5,
  ajustes:[
   {etapa:"HOMOLOGACAO",situacao:"CONCLUIDA",dataConclusao:"2026-03-06",observacao:"Resultado final homologado e publicado no Diário Oficial de 06/03/2026.",pendencias:["Remessa ao TCE-MT realizada por arquivo, sem integração automática."]},
  ],
  historico:[
   {id:"HPS-014-01",ocorridoEm:"2025-02-17 09:00",dataEfeito:"2025-02-17",tipo:"CRIACAO",titulo:"Concurso público autorizado",descricao:"Autorização para provimento de 78 vagas do quadro técnico ambiental.",origem:"Sigadoc",usuario:"Vinícius Duarte Peçanha",processoSigadoc:"SEMA-PRO-2025/00042",situacaoPosterior:"EM_ANDAMENTO"},
   {id:"HPS-014-02",ocorridoEm:"2026-03-06 18:00",dataEfeito:"2026-03-06",tipo:"ALTERACAO_SITUACAO",titulo:"Resultado final homologado",descricao:"Homologação publicada; candidatos aptos à nomeação conforme ordem de classificação.",origem:"SIGEP",usuario:"Secretário de Estado",situacaoAnterior:"EM_ANDAMENTO",situacaoPosterior:"HOMOLOGADO",etapaAnterior:"PROVAS_CLASSIFICACAO",etapaPosterior:"HOMOLOGACAO"},
  ],
 }),
];

export const pendenciasControlePssMock:string[]=[
 "Definir se o cadastro do certame passa a ser único (SIGEP) com replicação para o SIES ou permanece duplicado.",
 "Definir a regra de validação obrigatória do CBO no momento do cadastro da vaga do processo.",
 "Definir quem responde pela geração das listagens hoje produzidas em Word (deferidos, indeferidos, aprovados).",
 "Definir se a convocação passa a ser gerada pelo sistema com controle sistêmico do prazo de apresentação.",
 "Definir o formato da remessa de dados do certame ao TCE-MT e sua periodicidade.",
 "Definir o tratamento das etapas do SIES quando a execução for delegada a empresa contratada.",
];

export const cargosSiesReferenciaMock:CargoSiesReferencia[]=[
 {id:"SIES-CGO-0012",nome:"Professor de Educação Básica",cbo:"231205",orgao:"SEDUC",ativo:true},
 {id:"SIES-CGO-0018",nome:"Técnico Administrativo Educacional",cbo:"411005",orgao:"SEDUC",ativo:true},
 {id:"SIES-CGO-0031",nome:"Profissional Técnico de Nível Superior em Serviços de Saúde do SUS",cbo:"223505",orgao:"SES",ativo:true},
 {id:"SIES-CGO-0032",nome:"Profissional Técnico de Nível Médio em Serviços de Saúde do SUS",cbo:"322205",orgao:"SES",ativo:true},
 {id:"SIES-CGO-0047",nome:"Investigador de Polícia",cbo:"516210",orgao:"PJC",ativo:true},
 {id:"SIES-CGO-0048",nome:"Escrivão de Polícia",cbo:"351305",orgao:"PJC",ativo:true},
 {id:"SIES-CGO-0055",nome:"Assistente do Sistema Penitenciário",cbo:"411005",orgao:"SEJUS",ativo:true},
 {id:"SIES-CGO-0071",nome:"Fiscal de Tributos Estaduais",cbo:"212410",orgao:"SEFAZ",ativo:true},
 {id:"SIES-CGO-0083",nome:"Analista do Desenvolvimento Econômico e Social",cbo:"251605",orgao:"SETASC",ativo:true},
 {id:"SIES-CGO-0090",nome:"Analista de Meio Ambiente",cbo:"213155",orgao:"SEMA",ativo:true},
 {id:"SIES-CGO-0091",nome:"Técnico de Meio Ambiente",cbo:"311715",orgao:"SEMA",ativo:true},
];
