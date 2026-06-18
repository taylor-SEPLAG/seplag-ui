import type {
  CreateFolhaCompetenciaRequest,
  CreateFolhaPagamentoRequest,
  CreateGrupoFolhaRequest,
  CreateSolicitacaoAjusteFolhaRequest,
  ExecutarFolhaPagamentoRequest,
  FolhaCompetenciaRow,
  FolhaPagamentoExecucaoRow,
  FolhaPagamentoPessoaLogRow,
  FolhaPagamentoRow,
  FolhaPagamentoRubricaLogRow,
  SolicitacaoAjusteFolhaHistoricoRow,
  SolicitacaoAjusteFolhaRow,
  GrupoFolhaRow,
  GrupoFolhaVersaoRow,
  UpdateFolhaPagamentoRequest,
  UpdateGrupoFolhaRequest,
  UpdateSolicitacaoAjusteFolhaRequest,
} from "./types";

const gruposFolhaMock: GrupoFolhaRow[] = [
  {
    id: 1,
    codigo: "GF-NORMAL-AD",
    nome: "Folha Normal - Administração Direta",
    descricao: "Configuração base para folha mensal dos órgãos da administração direta.",
    tipoFolha: "NORMAL",
    orgaos: ["SEPLAG", "MTI", "SAD"],
    regimeJuridico: "Estatutário Civil",
    categoria: "Área Meio",
    cargo: "",
    grupoEleitosPadrao: "",
    situacao: "VIGENTE",
    vigenciaInicial: "01/01/2026",
    vigenciaFinal: "",
    totalMesesAdiantarPadrao: 0,
    totalMesesRetroagirPadrao: 1,
    permiteRetroacao: "S",
    herdarConfiguracaoCompetenciaAnterior: "S",
    rubricasAssociadas: ["1001 - SALÁRIO BÁSICO", "1003 - DÉCIMO TERCEIRO"],
    ordemProcessamento: "Proventos fixos, vantagens, descontos legais.",
    relatoriosDisponiveis: ["Resumo financeiro", "Divergências por servidor"],
    versaoVigente: "V3",
    ultimaAlteracao: "15/05/2026 10:12",
    responsavel: "ROBERTO JUNIOR",
  },
  {
    id: 2,
    codigo: "GF-EDUCACAO",
    nome: "Folha Educação",
    descricao: "Configuração base para profissionais da educação.",
    tipoFolha: "NORMAL",
    orgaos: ["SEDUC"],
    regimeJuridico: "Estatutário Civil",
    categoria: "Profissionais da Educação",
    cargo: "Professor da Educação Básica",
    grupoEleitosPadrao: "",
    situacao: "VIGENTE",
    vigenciaInicial: "01/02/2026",
    vigenciaFinal: "",
    totalMesesAdiantarPadrao: 0,
    totalMesesRetroagirPadrao: 0,
    permiteRetroacao: "S",
    herdarConfiguracaoCompetenciaAnterior: "S",
    rubricasAssociadas: ["1001 - SALÁRIO BÁSICO"],
    ordemProcessamento: "Rubricas de cargo, adicionais, descontos.",
    relatoriosDisponiveis: ["Resumo financeiro", "Alertas de jornada"],
    versaoVigente: "V2",
    ultimaAlteracao: "08/05/2026 16:40",
    responsavel: "ROBERTO JUNIOR",
  },
  {
    id: 3,
    codigo: "GF-COMPLEMENTAR",
    nome: "Folha Complementar",
    descricao: "Configuração usada para pagamentos complementares e correções.",
    tipoFolha: "COMPLEMENTAR",
    orgaos: ["SEPLAG"],
    regimeJuridico: "",
    categoria: "",
    cargo: "",
    grupoEleitosPadrao: "PESSOA FÍSICA",
    situacao: "RASCUNHO",
    vigenciaInicial: "01/06/2026",
    vigenciaFinal: "",
    totalMesesAdiantarPadrao: 0,
    totalMesesRetroagirPadrao: 3,
    permiteRetroacao: "S",
    herdarConfiguracaoCompetenciaAnterior: "N",
    rubricasAssociadas: ["1002 - ADICIONAL NOTURNO"],
    ordemProcessamento: "Somente rubricas autorizadas no processo complementar.",
    relatoriosDisponiveis: ["Divergências por servidor"],
    versaoVigente: "V1",
    ultimaAlteracao: "28/05/2026 11:05",
    responsavel: "ROBERTO JUNIOR",
  },
];

const gruposFolhaVersoesMock: GrupoFolhaVersaoRow[] = [
  {
    id: 101,
    grupoFolhaId: 1,
    versao: "V3",
    vigenciaInicial: "01/05/2026",
    vigenciaFinal: "",
    alteracao: "Inclusão de relatório de divergências por servidor.",
    motivo: "Apoiar conferência setorial.",
    usuarioResponsavel: "ROBERTO JUNIOR",
    dataHora: "15/05/2026 10:12",
    situacao: "VIGENTE",
  },
  {
    id: 102,
    grupoFolhaId: 1,
    versao: "V2",
    vigenciaInicial: "01/03/2026",
    vigenciaFinal: "30/04/2026",
    alteracao: "Ajuste na ordem de processamento.",
    motivo: "Adequação de descontos legais.",
    usuarioResponsavel: "ROBERTO JUNIOR",
    dataHora: "01/03/2026 09:30",
    situacao: "ENCERRADO",
  },
  {
    id: 201,
    grupoFolhaId: 2,
    versao: "V2",
    vigenciaInicial: "01/05/2026",
    vigenciaFinal: "",
    alteracao: "Atualização de filtros para professores da educação básica.",
    motivo: "Padronização da abrangência.",
    usuarioResponsavel: "ROBERTO JUNIOR",
    dataHora: "08/05/2026 16:40",
    situacao: "VIGENTE",
  },
  {
    id: 301,
    grupoFolhaId: 3,
    versao: "V1",
    vigenciaInicial: "01/06/2026",
    vigenciaFinal: "",
    alteracao: "Criação inicial do grupo complementar.",
    motivo: "Configuração em elaboração.",
    usuarioResponsavel: "ROBERTO JUNIOR",
    dataHora: "28/05/2026 11:05",
    situacao: "RASCUNHO",
  },
];

const competenciasFolhaMock: FolhaCompetenciaRow[] = [
  {
    id: 1,
    codigo: "COMP-2026-05",
    nome: "Competência Maio/2026",
    competencia: "2026-05",
    mesAnoReferencia: "2026-05",
    dataInicio: "01/05/2026",
    dataFim: "31/05/2026",
    situacao: "ATIVA",
    observacao: "Competência aberta para processamento mensal.",
    totalFolhas: 3,
    createdAt: "20/05/2026 08:30",
  },
  {
    id: 2,
    codigo: "COMP-2026-04",
    nome: "Competência Abril/2026",
    competencia: "2026-04",
    mesAnoReferencia: "2026-04",
    dataInicio: "01/04/2026",
    dataFim: "30/04/2026",
    situacao: "FECHADA",
    observacao: "Competência encerrada após conferência.",
    totalFolhas: 1,
    createdAt: "18/04/2026 09:10",
  },
  {
    id: 3,
    codigo: "COMP-2026-03",
    nome: "Competência Março/2026",
    competencia: "2026-03",
    mesAnoReferencia: "2026-03",
    dataInicio: "01/03/2026",
    dataFim: "31/03/2026",
    situacao: "FECHADA",
    observacao: "Competência com execução finalizada com inconsistências.",
    totalFolhas: 1,
    createdAt: "15/03/2026 10:00",
  },
];

const folhasPagamentoMock: FolhaPagamentoRow[] = [
  {
    id: 1,
    competenciaId: 1,
    grupoFolhaId: 1,
    numero: "1",
    nome: "Folha Normal Maio/2026",
    mesAnoReferencia: "2026-05",
    competencia: "2026-05",
    observacao: "Processamento mensal da folha normal.",
    orgaos: ["SEPLAG", "MTI"],
    abrangenciaRegimeJuridico: ["estatutario"],
    abrangenciaTipoVinculo: ["efetivo"],
    abrangenciaInstituicao: ["govmt"],
    abrangenciaSetores: ["todos"],
    abrangenciaSubcategorias: ["administracao-direta"],
    regimeJuridico: "Estatutário Civil",
    categoria: "Área Meio",
    cargo: "",
    grupoEleitos: "",
    totalMesesAdiantar: 0,
    totalMesesRetroagir: 1,
    situacao: "ABERTO",
    totalPessoas: 842,
    totalSucesso: 0,
    totalAlerta: 0,
    totalErro: 0,
    ultimaExecucao: "-",
  },
  {
    id: 11,
    competenciaId: 1,
    grupoFolhaId: 1,
    numero: "1",
    nome: "Folha Normal Maio/2026",
    mesAnoReferencia: "2026-05",
    competencia: "2026-05",
    observacao: "Versão ajustada após parametrização de rubricas.",
    orgaos: ["SEPLAG", "MTI"],
    abrangenciaRegimeJuridico: ["estatutario"],
    abrangenciaTipoVinculo: ["efetivo"],
    abrangenciaInstituicao: ["govmt"],
    abrangenciaSetores: ["todos"],
    abrangenciaSubcategorias: ["administracao-direta"],
    regimeJuridico: "Estatutário Civil",
    categoria: "Área Meio",
    cargo: "",
    grupoEleitos: "",
    totalMesesAdiantar: 0,
    totalMesesRetroagir: 1,
    situacao: "PROCESSO_COM_SUCESSO",
    totalPessoas: 842,
    totalSucesso: 842,
    totalAlerta: 0,
    totalErro: 0,
    ultimaExecucao: "20/05/2026 11:20",
  },
  {
    id: 12,
    competenciaId: 1,
    grupoFolhaId: 1,
    numero: "1",
    nome: "Folha Normal Maio/2026",
    mesAnoReferencia: "2026-05",
    competencia: "2026-05",
    observacao: "Versão com inconsistência de rubrica corrigida posteriormente.",
    orgaos: ["SEPLAG", "MTI"],
    abrangenciaRegimeJuridico: ["estatutario"],
    abrangenciaTipoVinculo: ["efetivo"],
    abrangenciaInstituicao: ["govmt"],
    abrangenciaSetores: ["todos"],
    abrangenciaSubcategorias: ["administracao-direta"],
    regimeJuridico: "Estatutário Civil",
    categoria: "Área Meio",
    cargo: "",
    grupoEleitos: "",
    totalMesesAdiantar: 0,
    totalMesesRetroagir: 1,
    situacao: "PROCESSO_COM_ERRO",
    totalPessoas: 842,
    totalSucesso: 780,
    totalAlerta: 12,
    totalErro: 50,
    ultimaExecucao: "22/05/2026 16:45",
  },
  {
    id: 13,
    competenciaId: 1,
    grupoFolhaId: 1,
    numero: "1",
    nome: "Folha Normal Maio/2026",
    mesAnoReferencia: "2026-05",
    competencia: "2026-05",
    observacao: "Versão atual com falhas técnicas registradas para reprocessamento.",
    orgaos: ["SEPLAG", "MTI"],
    abrangenciaRegimeJuridico: ["estatutario"],
    abrangenciaTipoVinculo: ["efetivo"],
    abrangenciaInstituicao: ["govmt"],
    abrangenciaSetores: ["todos"],
    abrangenciaSubcategorias: ["administracao-direta"],
    regimeJuridico: "Estatutário Civil",
    categoria: "Área Meio",
    cargo: "",
    grupoEleitos: "",
    totalMesesAdiantar: 0,
    totalMesesRetroagir: 1,
    situacao: "PROCESSO_COM_ERRO",
    totalPessoas: 842,
    totalSucesso: 810,
    totalAlerta: 20,
    totalErro: 12,
    ultimaExecucao: "24/05/2026 08:30",
  },
  {
    id: 2,
    competenciaId: 1,
    grupoFolhaId: 2,
    numero: "2",
    nome: "Folha Educação Maio/2026",
    mesAnoReferencia: "2026-05",
    competencia: "2026-05",
    observacao: "Recorte de profissionais da educação.",
    orgaos: ["SEDUC"],
    abrangenciaRegimeJuridico: ["estatutario"],
    abrangenciaTipoVinculo: ["efetivo", "contratado"],
    abrangenciaInstituicao: ["govmt"],
    abrangenciaSetores: ["escolas-estaduais", "gestao-escolar"],
    abrangenciaSubcategorias: ["educacao-basica"],
    regimeJuridico: "Estatutário Civil",
    categoria: "Profissionais da Educação",
    cargo: "Professor da Educação Básica",
    grupoEleitos: "",
    totalMesesAdiantar: 0,
    totalMesesRetroagir: 0,
    situacao: "EM_PROCESSAMENTO",
    totalPessoas: 12840,
    totalSucesso: 9200,
    totalAlerta: 84,
    totalErro: 12,
    ultimaExecucao: "28/05/2026 09:14",
  },
  {
    id: 3,
    competenciaId: 2,
    grupoFolhaId: 1,
    numero: "3",
    nome: "Folha Saúde Abril/2026",
    mesAnoReferencia: "2026-04",
    competencia: "2026-04",
    observacao: "Execução com alerta para conferência de adicionais.",
    orgaos: ["SES"],
    abrangenciaRegimeJuridico: ["estatutario"],
    abrangenciaTipoVinculo: ["efetivo"],
    abrangenciaInstituicao: ["govmt"],
    abrangenciaSetores: ["todos"],
    abrangenciaSubcategorias: [],
    regimeJuridico: "Estatutário Civil",
    categoria: "Profissionais da Saúde",
    cargo: "Médico",
    grupoEleitos: "Grupo Teste",
    totalMesesAdiantar: 0,
    totalMesesRetroagir: 2,
    situacao: "PROCESSO_COM_ERRO",
    totalPessoas: 3120,
    totalSucesso: 3058,
    totalAlerta: 62,
    totalErro: 0,
    ultimaExecucao: "07/05/2026 17:48",
  },
  {
    id: 4,
    competenciaId: 1,
    grupoFolhaId: 3,
    numero: "4",
    nome: "Folha Complementar Maio/2026",
    mesAnoReferencia: "2026-05",
    competencia: "2026-05",
    observacao: "",
    orgaos: ["SEPLAG"],
    abrangenciaRegimeJuridico: [],
    abrangenciaTipoVinculo: [],
    abrangenciaInstituicao: ["govmt"],
    abrangenciaSetores: ["coordenadoria-folha"],
    abrangenciaSubcategorias: [],
    regimeJuridico: "",
    categoria: "",
    cargo: "",
    grupoEleitos: "PESSOA FÍSICA",
    totalMesesAdiantar: 1,
    totalMesesRetroagir: 0,
    situacao: "RASCUNHO",
    totalPessoas: 0,
    totalSucesso: 0,
    totalAlerta: 0,
    totalErro: 0,
    ultimaExecucao: "-",
  },
  {
    id: 5,
    competenciaId: 3,
    grupoFolhaId: 3,
    numero: "5",
    nome: "Folha Especial Março/2026",
    mesAnoReferencia: "2026-03",
    competencia: "2026-03",
    observacao: "Execução encerrada com inconsistências.",
    orgaos: ["SAD"],
    regimeJuridico: "Contrato Temporário",
    categoria: "Área Meio",
    cargo: "Gestor Governamental",
    grupoEleitos: "",
    totalMesesAdiantar: 0,
    totalMesesRetroagir: 3,
    situacao: "PROCESSO_COM_ERRO",
    totalPessoas: 460,
    totalSucesso: 430,
    totalAlerta: 11,
    totalErro: 19,
    ultimaExecucao: "04/04/2026 10:22",
  },
  {
    id: 6,
    competenciaId: 1,
    grupoFolhaId: 1,
    numero: "6",
    nome: "Folha Administrativa Aberta",
    mesAnoReferencia: "2026-05",
    competencia: "2026-05",
    observacao: "Exemplo aberto para edição, exclusão e processamento.",
    orgaos: ["SEPLAG"],
    regimeJuridico: "Estatutário Civil",
    categoria: "Área Meio",
    cargo: "Analista Administrativo",
    grupoEleitos: "",
    totalMesesAdiantar: 0,
    totalMesesRetroagir: 1,
    situacao: "ABERTO",
    totalPessoas: 318,
    totalSucesso: 0,
    totalAlerta: 0,
    totalErro: 0,
    ultimaExecucao: "-",
  },
  {
    id: 7,
    competenciaId: 1,
    grupoFolhaId: 2,
    numero: "7",
    nome: "Folha Contratos em Fila",
    mesAnoReferencia: "2026-05",
    competencia: "2026-05",
    observacao: "Exemplo aguardando processamento.",
    orgaos: ["SEDUC"],
    regimeJuridico: "Contrato Temporário",
    categoria: "Profissionais da Educação",
    cargo: "Professor da Educação Básica",
    grupoEleitos: "",
    totalMesesAdiantar: 0,
    totalMesesRetroagir: 0,
    situacao: "AGUARDANDO_PROCESSAMENTO",
    totalPessoas: 1240,
    totalSucesso: 0,
    totalAlerta: 0,
    totalErro: 0,
    ultimaExecucao: "28/05/2026 10:00",
  },
  {
    id: 8,
    competenciaId: 2,
    grupoFolhaId: 1,
    numero: "8",
    nome: "Folha Sucesso Abril/2026",
    mesAnoReferencia: "2026-04",
    competencia: "2026-04",
    observacao: "Exemplo processado com sucesso para validar histórico e reprocessamento.",
    orgaos: ["SEPLAG"],
    regimeJuridico: "Estatutário Civil",
    categoria: "Área Meio",
    cargo: "Analista Administrativo",
    grupoEleitos: "",
    totalMesesAdiantar: 0,
    totalMesesRetroagir: 1,
    situacao: "PROCESSO_COM_SUCESSO",
    totalPessoas: 612,
    totalSucesso: 612,
    totalAlerta: 0,
    totalErro: 0,
    ultimaExecucao: "12/05/2026 15:18",
  },
];

const folhasPagamentoExecucoesMock: FolhaPagamentoExecucaoRow[] = [
  {
    id: 1011,
    folhaPagamentoId: 11,
    situacao: "CONCLUIDA",
    dataHoraInicio: "20/05/2026 10:58",
    dataHoraFim: "20/05/2026 11:20",
    usuarioResponsavel: "ROBERTO JUNIOR",
    totalPessoas: 842,
    totalSucesso: 842,
    totalAlerta: 0,
    totalErro: 0,
    parametrosResumo: "Adiantar 0 mês(es), retroagir 1 mês(es)",
  },
  {
    id: 1012,
    folhaPagamentoId: 12,
    situacao: "CONCLUIDA_COM_ERRO",
    dataHoraInicio: "22/05/2026 16:10",
    dataHoraFim: "22/05/2026 16:45",
    usuarioResponsavel: "ROBERTO JUNIOR",
    totalPessoas: 842,
    totalSucesso: 780,
    totalAlerta: 12,
    totalErro: 50,
    parametrosResumo: "Adiantar 0 mês(es), retroagir 1 mês(es)",
  },
  {
    id: 1013,
    folhaPagamentoId: 13,
    situacao: "CONCLUIDA_COM_ERRO",
    dataHoraInicio: "24/05/2026 08:05",
    dataHoraFim: "24/05/2026 08:30",
    usuarioResponsavel: "ROBERTO JUNIOR",
    totalPessoas: 842,
    totalSucesso: 810,
    totalAlerta: 20,
    totalErro: 12,
    parametrosResumo: "Falha técnica de integração durante fechamento do lote.",
  },
  {
    id: 1001,
    folhaPagamentoId: 2,
    situacao: "EM_PROCESSAMENTO",
    dataHoraInicio: "28/05/2026 09:14",
    dataHoraFim: "-",
    usuarioResponsavel: "ROBERTO JUNIOR",
    totalPessoas: 12840,
    totalSucesso: 9200,
    totalAlerta: 84,
    totalErro: 12,
    parametrosResumo: "Adiantar 0 mês(es), retroagir 0 mês(es)",
  },
  {
    id: 1002,
    folhaPagamentoId: 3,
    situacao: "CONCLUIDA_COM_ALERTA",
    dataHoraInicio: "07/05/2026 17:12",
    dataHoraFim: "07/05/2026 17:48",
    usuarioResponsavel: "ROBERTO JUNIOR",
    totalPessoas: 3120,
    totalSucesso: 3058,
    totalAlerta: 62,
    totalErro: 0,
    parametrosResumo: "Adiantar 0 mês(es), retroagir 2 mês(es)",
  },
  {
    id: 1003,
    folhaPagamentoId: 5,
    situacao: "CONCLUIDA_COM_ERRO",
    dataHoraInicio: "04/04/2026 09:51",
    dataHoraFim: "04/04/2026 10:22",
    usuarioResponsavel: "ROBERTO JUNIOR",
    totalPessoas: 460,
    totalSucesso: 430,
    totalAlerta: 11,
    totalErro: 19,
    parametrosResumo: "Adiantar 0 mês(es), retroagir 3 mês(es)",
  },
];

const folhasPagamentoPessoaLogsMock: FolhaPagamentoPessoaLogRow[] = [
  {
    id: 5001,
    execucaoId: 1002,
    matricula: "102938",
    vinculo: "1",
    nome: "ANA PAULA MARTINS",
    cpf: "123.456.789-09",
    orgao: "SES",
    regimeJuridico: "Estatutário Civil",
    categoria: "Profissionais da Saúde",
    cargo: "Médico",
    grupoEleitos: "Grupo Teste",
    situacao: "SUCESSO",
    mensagem: "Pessoa processada com sucesso.",
  },
  {
    id: 5002,
    execucaoId: 1002,
    matricula: "102939",
    vinculo: "2",
    nome: "BRUNO ALMEIDA COSTA",
    cpf: "987.654.321-00",
    orgao: "SES",
    regimeJuridico: "Estatutário Civil",
    categoria: "Profissionais da Saúde",
    cargo: "Médico",
    grupoEleitos: "Grupo Teste",
    situacao: "ALERTA",
    mensagem: "Adicional noturno calculado com divergência de referência.",
  },
  {
    id: 5003,
    execucaoId: 1003,
    matricula: "778899",
    vinculo: "1",
    nome: "CARLA SOUZA LIMA",
    cpf: "111.222.333-44",
    orgao: "SAD",
    regimeJuridico: "Contrato Temporário",
    categoria: "Área Meio",
    cargo: "Gestor Governamental",
    grupoEleitos: "",
    situacao: "ERRO",
    mensagem: "Rubrica 1002 sem parametrização vigente para a competência.",
  },
  {
    id: 5004,
    execucaoId: 1001,
    matricula: "445566",
    vinculo: "1",
    nome: "DIEGO RIBEIRO NUNES",
    cpf: "555.666.777-88",
    orgao: "SEDUC",
    regimeJuridico: "Estatutário Civil",
    categoria: "Profissionais da Educação",
    cargo: "Professor da Educação Básica",
    grupoEleitos: "",
    situacao: "EM_PROCESSAMENTO",
    mensagem: "Processamento em andamento.",
  },
  {
    id: 5005,
    execucaoId: 1001,
    matricula: "445567",
    vinculo: "1",
    nome: "ELISA MORAES PEREIRA",
    cpf: "222.333.444-55",
    orgao: "SEDUC",
    regimeJuridico: "Estatutário Civil",
    categoria: "Profissionais da Educação",
    cargo: "Professor da Educação Básica",
    grupoEleitos: "",
    situacao: "SUCESSO",
    mensagem: "Pessoa processada com sucesso.",
  },
];

const folhasPagamentoRubricaLogsMock: FolhaPagamentoRubricaLogRow[] = [
  {
    id: 7001,
    pessoaLogId: 5001,
    codigoRubrica: "1001",
    nomeRubrica: "SALÁRIO BÁSICO",
    tipoRubrica: "Provento",
    valorCalculado: "R$ 8.420,00",
    situacao: "CALCULADA",
    mensagem: "Rubrica calculada.",
  },
  {
    id: 7002,
    pessoaLogId: 5001,
    codigoRubrica: "1003",
    nomeRubrica: "DÉCIMO TERCEIRO",
    tipoRubrica: "Provento",
    valorCalculado: "R$ 701,66",
    situacao: "CALCULADA",
    mensagem: "Valor proporcional calculado.",
  },
  {
    id: 7003,
    pessoaLogId: 5002,
    codigoRubrica: "1002",
    nomeRubrica: "ADICIONAL NOTURNO",
    tipoRubrica: "Provento",
    valorCalculado: "R$ 312,40",
    situacao: "ALERTA",
    mensagem: "Divergência entre escala e apontamento.",
  },
  {
    id: 7004,
    pessoaLogId: 5003,
    codigoRubrica: "1002",
    nomeRubrica: "ADICIONAL NOTURNO",
    tipoRubrica: "Provento",
    valorCalculado: "R$ 0,00",
    situacao: "ERRO",
    mensagem: "Sem parametrização vigente.",
  },
  {
    id: 7005,
    pessoaLogId: 5005,
    codigoRubrica: "1001",
    nomeRubrica: "SALÁRIO BÁSICO",
    tipoRubrica: "Provento",
    valorCalculado: "R$ 5.860,00",
    situacao: "CALCULADA",
    mensagem: "Rubrica calculada.",
  },
];

const solicitacoesAjusteFolhaMock: SolicitacaoAjusteFolhaRow[] = [
  {
    id: 1,
    numeroFolha: "001",
    nomeFolha: "FOLHA NORMAL - SEPLAG",
    competencia: "05/2026",
    numeroExecucaoProcessamento: "1001",
    matriculaCpf: "107845",
    grupoEleitos: "-",
    solicitante: "Ana Paula Ribeiro",
    responsavelCorrecao: "-",
    dataCriacao: "18/05/2026",
    dataFechamento: "-",
    situacao: "NOVA",
    motivoAbertura: "Diferença identificada no cálculo de adicional noturno do servidor.",
  },
  {
    id: 2,
    numeroFolha: "002",
    nomeFolha: "FOLHA NORMAL - SEDUC",
    competencia: "05/2026",
    numeroExecucaoProcessamento: "1002",
    matriculaCpf: "-",
    grupoEleitos: "SERVIDORES COMISSIONADOS",
    solicitante: "Carla Mendes",
    responsavelCorrecao: "João Silva",
    dataCriacao: "18/05/2026",
    dataFechamento: "-",
    situacao: "EM_CORRECAO",
    motivoAbertura: "Revisar parametrização de rubrica para servidores comissionados.",
  },
  {
    id: 3,
    numeroFolha: "003",
    nomeFolha: "FOLHA COMPLEMENTAR - SES",
    competencia: "05/2026",
    numeroExecucaoProcessamento: "1003",
    matriculaCpf: "254896",
    grupoEleitos: "-",
    solicitante: "Ana Paula Ribeiro",
    responsavelCorrecao: "Roberto Alves",
    dataCriacao: "17/05/2026",
    dataFechamento: "-",
    situacao: "CORRIGIDO",
    motivoAbertura: "Diferença identificada no cálculo de adicional noturno do servidor.",
  },
  {
    id: 4,
    numeroFolha: "004",
    nomeFolha: "FOLHA RESCISÓRIA - SEFAZ",
    competencia: "04/2026",
    numeroExecucaoProcessamento: "1004",
    matriculaCpf: "-",
    grupoEleitos: "SERVIDORES CONTRATADOS",
    solicitante: "Marcos Lima",
    responsavelCorrecao: "Júlia Costa",
    dataCriacao: "10/05/2026",
    dataFechamento: "-",
    situacao: "DEVOLVIDO",
    motivoAbertura: "Conferência apontou divergência no cálculo rescisório.",
    motivoDevolucao: "Correção não contemplou todos os vínculos temporários indicados.",
  },
  {
    id: 5,
    numeroFolha: "005",
    nomeFolha: "FOLHA NORMAL - PGE",
    competencia: "04/2026",
    numeroExecucaoProcessamento: "1005",
    matriculaCpf: "369741",
    grupoEleitos: "-",
    solicitante: "Carla Mendes",
    responsavelCorrecao: "João Silva",
    dataCriacao: "05/05/2026",
    dataFechamento: "08/05/2026",
    situacao: "CONCLUIDO",
    motivoAbertura: "Adequação de desconto legal solicitada pela conformidade.",
  },
  {
    id: 6,
    numeroFolha: "006",
    nomeFolha: "FOLHA NORMAL - MTI",
    competencia: "05/2026",
    numeroExecucaoProcessamento: "1006",
    matriculaCpf: "778899",
    grupoEleitos: "-",
    solicitante: "Marcos Lima",
    responsavelCorrecao: "-",
    dataCriacao: "19/05/2026",
    dataFechamento: "-",
    situacao: "NOVA",
    motivoAbertura: "Validar reflexo de gratificação funcional na competência vigente.",
  },
  {
    id: 7,
    numeroFolha: "007",
    nomeFolha: "FOLHA EDUCAÇÃO - SEDUC",
    competencia: "03/2026",
    numeroExecucaoProcessamento: "1007",
    matriculaCpf: "445566",
    grupoEleitos: "-",
    solicitante: "Ana Paula Ribeiro",
    responsavelCorrecao: "João Silva",
    dataCriacao: "12/03/2026",
    dataFechamento: "15/03/2026",
    situacao: "CONCLUIDO",
    motivoAbertura: "Revisão de jornada docente apontada na conformidade.",
  },
  {
    id: 8,
    numeroFolha: "008",
    nomeFolha: "FOLHA COMPLEMENTAR - SEPLAG",
    competencia: "04/2026",
    numeroExecucaoProcessamento: "1008",
    matriculaCpf: "-",
    grupoEleitos: "PESSOA FÍSICA",
    solicitante: "Carla Mendes",
    responsavelCorrecao: "Roberto Alves",
    dataCriacao: "28/04/2026",
    dataFechamento: "-",
    situacao: "CORRIGIDO",
    motivoAbertura: "Ajuste complementar pendente de aceite final.",
  },
  {
    id: 9,
    numeroFolha: "009",
    nomeFolha: "FOLHA NORMAL - SES",
    competencia: "03/2026",
    numeroExecucaoProcessamento: "1009",
    matriculaCpf: "102938",
    grupoEleitos: "-",
    solicitante: "Marcos Lima",
    responsavelCorrecao: "Júlia Costa",
    dataCriacao: "20/03/2026",
    dataFechamento: "-",
    situacao: "EM_CORRECAO",
    motivoAbertura: "Verificar inconsistência entre rubrica calculada e apontamento.",
  },
  {
    id: 10,
    numeroFolha: "010",
    nomeFolha: "FOLHA NORMAL - SAD",
    competencia: "05/2026",
    numeroExecucaoProcessamento: "1010",
    matriculaCpf: "-",
    grupoEleitos: "SERVIDORES CONTRATADOS",
    solicitante: "Ana Paula Ribeiro",
    responsavelCorrecao: "Roberto Alves",
    dataCriacao: "22/05/2026",
    dataFechamento: "-",
    situacao: "DEVOLVIDO",
    motivoAbertura: "Divergência de retroativo para contratos temporários.",
    motivoDevolucao: "Necessário revisar o período retroativo informado.",
  },
];

const solicitacoesAjusteFolhaHistoricoMock: SolicitacaoAjusteFolhaHistoricoRow[] = [
  {
    id: 101,
    solicitacaoId: 1,
    situacaoDestino: "NOVA",
    dataHora: "18/05/2026 09:42",
    operador: "Ana Paula Ribeiro",
    descricao:
      "Solicitação aberta pela Conformidade após divergência no cálculo de adicional noturno. Matrícula 107845 vinculada à Folha Normal - SEPLAG.",
  },
  {
    id: 201,
    solicitacaoId: 2,
    situacaoDestino: "NOVA",
    dataHora: "18/05/2026 10:15",
    operador: "Carla Mendes",
    descricao:
      "Solicitação aberta para revisão do grupo SERVIDORES COMISSIONADOS na competência 05/2026.",
  },
  {
    id: 202,
    solicitacaoId: 2,
    situacaoDestino: "EM_CORRECAO",
    dataHora: "18/05/2026 10:47",
    operador: "João Silva",
    descricao:
      "Atendimento iniciado pela Folha de Pagamento. Responsável validará parametrização das rubricas variáveis antes do reprocessamento externo.",
  },
  {
    id: 301,
    solicitacaoId: 3,
    situacaoDestino: "NOVA",
    dataHora: "17/05/2026 14:20",
    operador: "Ana Paula Ribeiro",
    descricao:
      "Diferença identificada no cálculo de adicional noturno do servidor 254896. Evidência registrada pela conferência da Conformidade.",
  },
  {
    id: 302,
    solicitacaoId: 3,
    situacaoDestino: "EM_CORRECAO",
    dataHora: "17/05/2026 15:08",
    operador: "Roberto Alves",
    descricao:
      "Correção assumida pela equipe de Folha de Pagamento. Operador vinculado como responsável pela solicitação.",
  },
  {
    id: 303,
    solicitacaoId: 3,
    situacaoDestino: "CORRIGIDO",
    dataHora: "18/05/2026 09:30",
    operador: "Roberto Alves",
    descricao:
      "Ajuste realizado no módulo externo de processamento e disponibilizado para validação da Conformidade. Rubrica revisada: adicional noturno.",
  },
  {
    id: 401,
    solicitacaoId: 4,
    situacaoDestino: "NOVA",
    dataHora: "10/05/2026 08:55",
    operador: "Marcos Lima",
    descricao:
      "Solicitação aberta após conferência da Folha Rescisória - SEFAZ. Grupo SERVIDORES CONTRATADOS apresentou diferença no cálculo rescisório.",
  },
  {
    id: 402,
    solicitacaoId: 4,
    situacaoDestino: "EM_CORRECAO",
    dataHora: "10/05/2026 09:20",
    operador: "Júlia Costa",
    descricao:
      "Correção iniciada pela Folha de Pagamento com análise dos vínculos temporários impactados.",
  },
  {
    id: 403,
    solicitacaoId: 4,
    situacaoDestino: "CORRIGIDO",
    dataHora: "10/05/2026 15:35",
    operador: "Júlia Costa",
    descricao:
      "Ajuste aplicado e encaminhado para nova validação da Conformidade.",
  },
  {
    id: 404,
    solicitacaoId: 4,
    situacaoDestino: "DEVOLVIDO",
    dataHora: "11/05/2026 08:10",
    operador: "Marcos Lima",
    descricao:
      "Correção devolvida: nem todos os vínculos temporários indicados foram contemplados. Necessário revisar a abrangência do grupo.",
  },
  {
    id: 501,
    solicitacaoId: 5,
    situacaoDestino: "NOVA",
    dataHora: "05/05/2026 11:10",
    operador: "Carla Mendes",
    descricao:
      "Solicitação aberta para adequação de desconto legal da matrícula 369741 na Folha Normal - PGE.",
  },
  {
    id: 502,
    solicitacaoId: 5,
    situacaoDestino: "EM_CORRECAO",
    dataHora: "05/05/2026 13:22",
    operador: "João Silva",
    descricao:
      "Folha assumiu a correção e conferiu integração com os dados cadastrais do servidor.",
  },
  {
    id: 503,
    solicitacaoId: 5,
    situacaoDestino: "CORRIGIDO",
    dataHora: "08/05/2026 15:40",
    operador: "João Silva",
    descricao:
      "Desconto legal recalculado e disponibilizado para aceite final.",
  },
  {
    id: 504,
    solicitacaoId: 5,
    situacaoDestino: "CONCLUIDO",
    dataHora: "08/05/2026 16:38",
    operador: "Carla Mendes",
    descricao:
      "Conformidade validou o ajuste realizado. Solicitação concluída e bloqueada para alterações.",
  },
];

export const folhaPagamentoMockRepository = {
  listarGruposFolha: (): GrupoFolhaRow[] => structuredClone(gruposFolhaMock),
  criarGrupoFolha: (request: CreateGrupoFolhaRequest): GrupoFolhaRow => {
    const novoGrupo: GrupoFolhaRow = {
      id: Math.max(...gruposFolhaMock.map((grupo) => grupo.id), 0) + 1,
      codigo: request.codigo ?? "",
      nome: request.nome ?? "",
      descricao: request.descricao ?? "",
      tipoFolha: request.tipoFolha ?? "NORMAL",
      orgaos: request.orgaos ?? [],
      regimeJuridico: request.regimeJuridico ?? "",
      categoria: request.categoria ?? "",
      cargo: request.cargo ?? "",
      grupoEleitosPadrao: request.grupoEleitosPadrao ?? "",
      situacao: request.situacao ?? "RASCUNHO",
      vigenciaInicial: request.vigenciaInicial ?? "",
      vigenciaFinal: request.vigenciaFinal ?? "",
      totalMesesAdiantarPadrao: request.totalMesesAdiantarPadrao ?? 0,
      totalMesesRetroagirPadrao: request.totalMesesRetroagirPadrao ?? 0,
      permiteRetroacao: request.permiteRetroacao ?? "S",
      herdarConfiguracaoCompetenciaAnterior:
        request.herdarConfiguracaoCompetenciaAnterior ?? "S",
      rubricasAssociadas: request.rubricasAssociadas ?? [],
      ordemProcessamento: request.ordemProcessamento ?? "",
      relatoriosDisponiveis: request.relatoriosDisponiveis ?? [],
      versaoVigente: "V1",
      ultimaAlteracao: "01/06/2026 09:00",
      responsavel: "ROBERTO JUNIOR",
    };

    gruposFolhaMock.unshift(novoGrupo);
    gruposFolhaVersoesMock.unshift({
      id: Math.max(...gruposFolhaVersoesMock.map((versao) => versao.id), 0) + 1,
      grupoFolhaId: novoGrupo.id,
      versao: "V1",
      vigenciaInicial: novoGrupo.vigenciaInicial,
      vigenciaFinal: novoGrupo.vigenciaFinal,
      alteracao: "Criação inicial do grupo de folha.",
      motivo: "Cadastro inicial.",
      usuarioResponsavel: "ROBERTO JUNIOR",
      dataHora: novoGrupo.ultimaAlteracao,
      situacao: novoGrupo.situacao,
    });

    return structuredClone(novoGrupo);
  },
  atualizarGrupoFolha: (
    id: number,
    request: UpdateGrupoFolhaRequest,
  ): GrupoFolhaRow | undefined => {
    const index = gruposFolhaMock.findIndex((grupo) => grupo.id === id);
    if (index < 0) return undefined;

    gruposFolhaMock[index] = {
      ...gruposFolhaMock[index],
      ...request,
      codigo: request.codigo ?? gruposFolhaMock[index].codigo,
      nome: request.nome ?? gruposFolhaMock[index].nome,
      descricao: request.descricao ?? "",
      tipoFolha: request.tipoFolha ?? gruposFolhaMock[index].tipoFolha,
      orgaos: request.orgaos ?? gruposFolhaMock[index].orgaos,
      regimeJuridico: request.regimeJuridico ?? "",
      categoria: request.categoria ?? "",
      cargo: request.cargo ?? "",
      grupoEleitosPadrao: request.grupoEleitosPadrao ?? "",
      situacao: request.situacao ?? gruposFolhaMock[index].situacao,
      vigenciaInicial:
        request.vigenciaInicial ?? gruposFolhaMock[index].vigenciaInicial,
      vigenciaFinal: request.vigenciaFinal ?? "",
      totalMesesAdiantarPadrao:
        request.totalMesesAdiantarPadrao ??
        gruposFolhaMock[index].totalMesesAdiantarPadrao,
      totalMesesRetroagirPadrao:
        request.totalMesesRetroagirPadrao ??
        gruposFolhaMock[index].totalMesesRetroagirPadrao,
      permiteRetroacao:
        request.permiteRetroacao ?? gruposFolhaMock[index].permiteRetroacao,
      herdarConfiguracaoCompetenciaAnterior:
        request.herdarConfiguracaoCompetenciaAnterior ??
        gruposFolhaMock[index].herdarConfiguracaoCompetenciaAnterior,
      rubricasAssociadas:
        request.rubricasAssociadas ?? gruposFolhaMock[index].rubricasAssociadas,
      ordemProcessamento: request.ordemProcessamento ?? "",
      relatoriosDisponiveis:
        request.relatoriosDisponiveis ??
        gruposFolhaMock[index].relatoriosDisponiveis,
      ultimaAlteracao: "01/06/2026 09:30",
      responsavel: "ROBERTO JUNIOR",
    };

    return structuredClone(gruposFolhaMock[index]);
  },
  listarVersoesGrupoFolha: (grupoFolhaId: number): GrupoFolhaVersaoRow[] =>
    structuredClone(
      gruposFolhaVersoesMock.filter(
        (versao) => versao.grupoFolhaId === grupoFolhaId,
      ),
    ),
  listarCompetencias: (): FolhaCompetenciaRow[] =>
    structuredClone(competenciasFolhaMock),
  criarCompetencia: (
    request: CreateFolhaCompetenciaRequest,
  ): FolhaCompetenciaRow => {
    const novaCompetencia: FolhaCompetenciaRow = {
      id: Math.max(...competenciasFolhaMock.map((competencia) => competencia.id), 0) + 1,
      codigo: request.codigo ?? "",
      nome: request.nome ?? "",
      competencia: request.competencia ?? "",
      mesAnoReferencia: request.mesAnoReferencia ?? "",
      dataInicio: request.dataInicio ?? "",
      dataFim: request.dataFim ?? "",
      situacao: request.situacao ?? "ATIVA",
      observacao: request.observacao ?? "",
      totalFolhas: 0,
      createdAt: "01/06/2026 09:00",
    };

    competenciasFolhaMock.unshift(novaCompetencia);
    return structuredClone(novaCompetencia);
  },
  listarFolhas: (): FolhaPagamentoRow[] => structuredClone(folhasPagamentoMock),
  criarFolha: (request: CreateFolhaPagamentoRequest): FolhaPagamentoRow => {
    const novaFolha: FolhaPagamentoRow = {
      id: Math.max(...folhasPagamentoMock.map((folha) => folha.id), 0) + 1,
      competenciaId: request.competenciaId ?? 0,
      grupoFolhaId: request.grupoFolhaId ?? 0,
      nome: request.nome ?? "",
      numero: request.numero ?? "",
      mesAnoReferencia: request.mesAnoReferencia ?? "",
      competencia: request.competencia ?? "",
      observacao: request.observacao ?? "",
      orgaos: request.orgaos ?? [],
      abrangenciaRegimeJuridico: request.abrangenciaRegimeJuridico ?? [],
      abrangenciaTipoVinculo: request.abrangenciaTipoVinculo ?? [],
      abrangenciaInstituicao: request.abrangenciaInstituicao ?? [],
      abrangenciaSetores: request.abrangenciaSetores ?? [],
      abrangenciaSubcategorias: request.abrangenciaSubcategorias ?? [],
      regimeJuridico: request.regimeJuridico ?? "",
      categoria: request.categoria ?? "",
      cargo: request.cargo ?? "",
      grupoEleitos: request.grupoEleitos ?? "",
      totalMesesAdiantar: request.totalMesesAdiantar ?? 0,
      totalMesesRetroagir: request.totalMesesRetroagir ?? 0,
      situacao: request.situacao ?? "RASCUNHO",
      totalPessoas: 0,
      totalSucesso: 0,
      totalAlerta: 0,
      totalErro: 0,
      ultimaExecucao: "-",
    };

    folhasPagamentoMock.unshift(novaFolha);
    const competenciaIndex = competenciasFolhaMock.findIndex(
      (competencia) => competencia.id === novaFolha.competenciaId,
    );
    if (competenciaIndex >= 0) {
      competenciasFolhaMock[competenciaIndex].totalFolhas += 1;
    }
    return structuredClone(novaFolha);
  },
  atualizarFolha: (
    id: number,
    request: UpdateFolhaPagamentoRequest,
  ): FolhaPagamentoRow | undefined => {
    const index = folhasPagamentoMock.findIndex((folha) => folha.id === id);
    if (index < 0) return undefined;

    folhasPagamentoMock[index] = {
      ...folhasPagamentoMock[index],
      ...request,
      competenciaId:
        request.competenciaId ?? folhasPagamentoMock[index].competenciaId,
      grupoFolhaId: request.grupoFolhaId ?? folhasPagamentoMock[index].grupoFolhaId,
      nome: request.nome ?? folhasPagamentoMock[index].nome,
      numero: request.numero ?? folhasPagamentoMock[index].numero,
      mesAnoReferencia:
        request.mesAnoReferencia ?? folhasPagamentoMock[index].mesAnoReferencia,
      competencia: request.competencia ?? folhasPagamentoMock[index].competencia,
      situacao: request.situacao ?? folhasPagamentoMock[index].situacao,
      observacao: request.observacao ?? "",
      orgaos: request.orgaos ?? folhasPagamentoMock[index].orgaos,
      abrangenciaRegimeJuridico:
        request.abrangenciaRegimeJuridico ??
        folhasPagamentoMock[index].abrangenciaRegimeJuridico,
      abrangenciaTipoVinculo:
        request.abrangenciaTipoVinculo ??
        folhasPagamentoMock[index].abrangenciaTipoVinculo,
      abrangenciaInstituicao:
        request.abrangenciaInstituicao ??
        folhasPagamentoMock[index].abrangenciaInstituicao,
      abrangenciaSetores:
        request.abrangenciaSetores ?? folhasPagamentoMock[index].abrangenciaSetores,
      abrangenciaSubcategorias:
        request.abrangenciaSubcategorias ??
        folhasPagamentoMock[index].abrangenciaSubcategorias,
      regimeJuridico: request.regimeJuridico ?? "",
      categoria: request.categoria ?? "",
      cargo: request.cargo ?? "",
      grupoEleitos: request.grupoEleitos ?? "",
      totalMesesAdiantar:
        request.totalMesesAdiantar ??
        folhasPagamentoMock[index].totalMesesAdiantar,
      totalMesesRetroagir:
        request.totalMesesRetroagir ??
        folhasPagamentoMock[index].totalMesesRetroagir,
    };

    return structuredClone(folhasPagamentoMock[index]);
  },
  excluirFolha: (id: number): boolean => {
    const index = folhasPagamentoMock.findIndex((folha) => folha.id === id);
    if (index < 0) return false;

    const [folhaExcluida] = folhasPagamentoMock.splice(index, 1);
    const competencia = competenciasFolhaMock.find(
      (item) => item.id === folhaExcluida.competenciaId,
    );
    if (competencia) {
      competencia.totalFolhas = Math.max(0, competencia.totalFolhas - 1);
    }

    return true;
  },
  listarExecucoes: (): FolhaPagamentoExecucaoRow[] =>
    structuredClone(folhasPagamentoExecucoesMock),
  listarPessoaLogs: (): FolhaPagamentoPessoaLogRow[] =>
    structuredClone(folhasPagamentoPessoaLogsMock),
  listarRubricaLogs: (): FolhaPagamentoRubricaLogRow[] =>
    structuredClone(folhasPagamentoRubricaLogsMock),
  listarSolicitacoesAjusteFolha: (): SolicitacaoAjusteFolhaRow[] =>
    structuredClone(solicitacoesAjusteFolhaMock),
  criarSolicitacaoAjusteFolha: (
    request: CreateSolicitacaoAjusteFolhaRequest,
  ): SolicitacaoAjusteFolhaRow => {
    const novaSolicitacao: SolicitacaoAjusteFolhaRow = {
      id:
        Math.max(...solicitacoesAjusteFolhaMock.map((item) => item.id), 0) + 1,
      numeroFolha: request.numeroFolha ?? "",
      nomeFolha: request.nomeFolha ?? "",
      competencia: request.competencia ?? "",
      matriculaCpf:
        request.escopo === "MATRICULA_CPF"
          ? request.matriculasCpf?.join(", ") ?? ""
          : "-",
      grupoEleitos:
        request.escopo === "GRUPO_ELEITOS" ? request.grupoEleitos ?? "" : "-",
      solicitante: "Maria de Souza",
      responsavelCorrecao: "-",
      dataCriacao: request.dataCriacao ?? "",
      dataFechamento: "-",
      situacao: "NOVA",
      motivoAbertura: request.motivoAbertura ?? "",
    };

    solicitacoesAjusteFolhaMock.unshift(novaSolicitacao);
    solicitacoesAjusteFolhaHistoricoMock.unshift({
      id:
        Math.max(
          ...solicitacoesAjusteFolhaHistoricoMock.map((item) => item.id),
          0,
        ) + 1,
      solicitacaoId: novaSolicitacao.id,
      situacaoDestino: "NOVA",
      dataHora: `${novaSolicitacao.dataCriacao} 09:00`,
      operador: novaSolicitacao.solicitante,
      descricao: `Solicitação aberta pela Conformidade para ${novaSolicitacao.nomeFolha}.`,
    });

    return structuredClone(novaSolicitacao);
  },
  atualizarDadosSolicitacaoAjusteFolha: (
    id: number,
    request: UpdateSolicitacaoAjusteFolhaRequest,
  ): SolicitacaoAjusteFolhaRow | undefined => {
    const index = solicitacoesAjusteFolhaMock.findIndex(
      (item) => item.id === id,
    );
    if (index < 0) return undefined;

    solicitacoesAjusteFolhaMock[index] = {
      ...solicitacoesAjusteFolhaMock[index],
      numeroFolha:
        request.numeroFolha ?? solicitacoesAjusteFolhaMock[index].numeroFolha,
      nomeFolha:
        request.nomeFolha ?? solicitacoesAjusteFolhaMock[index].nomeFolha,
      competencia:
        request.competencia ?? solicitacoesAjusteFolhaMock[index].competencia,
      matriculaCpf:
        request.escopo === "MATRICULA_CPF"
          ? request.matriculasCpf?.join(", ") ?? ""
          : "-",
      grupoEleitos:
        request.escopo === "GRUPO_ELEITOS" ? request.grupoEleitos ?? "" : "-",
      motivoAbertura:
        request.motivoAbertura ??
        solicitacoesAjusteFolhaMock[index].motivoAbertura,
      dataCriacao:
        request.dataCriacao ?? solicitacoesAjusteFolhaMock[index].dataCriacao,
      situacao: "NOVA",
    };

    return structuredClone(solicitacoesAjusteFolhaMock[index]);
  },
  atualizarSolicitacaoAjusteFolha: (
    solicitacao: SolicitacaoAjusteFolhaRow,
  ): SolicitacaoAjusteFolhaRow | undefined => {
    const index = solicitacoesAjusteFolhaMock.findIndex(
      (item) => item.id === solicitacao.id,
    );
    if (index < 0) return undefined;

    solicitacoesAjusteFolhaMock[index] = { ...solicitacao };
    return structuredClone(solicitacoesAjusteFolhaMock[index]);
  },
  excluirSolicitacaoAjusteFolha: (id: number) => {
    const index = solicitacoesAjusteFolhaMock.findIndex((item) => item.id === id);
    if (index >= 0) solicitacoesAjusteFolhaMock.splice(index, 1);
  },
  listarHistoricoSolicitacaoAjusteFolha: (
    solicitacaoId: number,
  ): SolicitacaoAjusteFolhaHistoricoRow[] =>
    structuredClone(
      solicitacoesAjusteFolhaHistoricoMock.filter(
        (item) => item.solicitacaoId === solicitacaoId,
      ),
    ),
};

export const folhaPagamentoService = {
  // TODO backend: GET /grupos-folha
  listarGruposFolha: folhaPagamentoMockRepository.listarGruposFolha,
  // TODO backend: GET /grupos-folha/{id}
  buscarGrupoFolhaPorId: (id: number) =>
    folhaPagamentoMockRepository
      .listarGruposFolha()
      .find((grupo) => grupo.id === id),
  // TODO backend: POST /grupos-folha
  criarGrupoFolha: folhaPagamentoMockRepository.criarGrupoFolha,
  // TODO backend: PUT /grupos-folha/{id}
  atualizarGrupoFolha: folhaPagamentoMockRepository.atualizarGrupoFolha,
  // TODO backend: GET /grupos-folha/{id}/versoes
  listarVersoesGrupoFolha:
    folhaPagamentoMockRepository.listarVersoesGrupoFolha,
  // TODO backend: GET /folhas-competencias
  listarCompetencias: folhaPagamentoMockRepository.listarCompetencias,
  // TODO backend: GET /folhas-competencias/{id}
  buscarCompetenciaPorId: (id: number) =>
    folhaPagamentoMockRepository
      .listarCompetencias()
      .find((competencia) => competencia.id === id),
  // TODO backend: POST /folhas-competencias
  criarCompetencia: folhaPagamentoMockRepository.criarCompetencia,
  // TODO backend: GET /folhas-pagamento
  listarFolhas: folhaPagamentoMockRepository.listarFolhas,
  // TODO backend: GET /folhas-pagamento/{id}
  buscarFolhaPorId: (id: number) =>
    folhaPagamentoMockRepository
      .listarFolhas()
      .find((folha) => folha.id === id),
  // TODO backend: POST /folhas-pagamento
  criarFolha: folhaPagamentoMockRepository.criarFolha,
  // TODO backend: PUT /folhas-pagamento/{id}
  atualizarFolha: folhaPagamentoMockRepository.atualizarFolha,
  // TODO backend: DELETE /folhas-pagamento/{id}
  excluirFolha: folhaPagamentoMockRepository.excluirFolha,
  // TODO backend: POST /folhas-pagamento/{id}/executar
  executarFolha: (_request: ExecutarFolhaPagamentoRequest) => undefined,
  // TODO backend: GET /folhas-pagamento/{id}/execucoes
  listarExecucoes: folhaPagamentoMockRepository.listarExecucoes,
  // TODO backend: GET /folhas-pagamento/execucoes/{execucaoId}/log
  listarPessoaLogs: folhaPagamentoMockRepository.listarPessoaLogs,
  // TODO backend: GET /folhas-pagamento/execucoes/{execucaoId}/log/{pessoaLogId}/rubricas
  listarRubricaLogs: folhaPagamentoMockRepository.listarRubricaLogs,
  // TODO backend: GET /solicitacoes-ajustes-folha
  listarSolicitacoesAjusteFolha:
    folhaPagamentoMockRepository.listarSolicitacoesAjusteFolha,
  // TODO backend: POST /solicitacoes-ajustes-folha
  criarSolicitacaoAjusteFolha:
    folhaPagamentoMockRepository.criarSolicitacaoAjusteFolha,
  // TODO backend: PUT /solicitacoes-ajustes-folha/{id}/dados
  atualizarDadosSolicitacaoAjusteFolha:
    folhaPagamentoMockRepository.atualizarDadosSolicitacaoAjusteFolha,
  // TODO backend: PUT /solicitacoes-ajustes-folha/{id}
  atualizarSolicitacaoAjusteFolha:
    folhaPagamentoMockRepository.atualizarSolicitacaoAjusteFolha,
  // TODO backend: DELETE /solicitacoes-ajustes-folha/{id}
  excluirSolicitacaoAjusteFolha:
    folhaPagamentoMockRepository.excluirSolicitacaoAjusteFolha,
  // TODO backend: GET /solicitacoes-ajustes-folha/{id}/historico
  listarHistoricoSolicitacaoAjusteFolha:
    folhaPagamentoMockRepository.listarHistoricoSolicitacaoAjusteFolha,
};
