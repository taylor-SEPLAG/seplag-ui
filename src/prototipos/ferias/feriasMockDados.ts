import type { FeriasRegistro } from "./FeriasPages";
import { prazosAgendamento } from "./regrasAgendamento";

// Dados mock e chave de persistência do protótipo de férias. Ficam fora de FeriasPages.tsx
// (um arquivo de componentes) porque o Fast Refresh do Vite invalida o módulo inteiro sempre
// que um arquivo de componente também exporta valores não-componente — isso já chegou a causar
// renders com hooks fora de ordem (erro "useEffect changed size between renders") durante HMR.
// v32: o prazo de validação da chefia dos mocks passou a seguir a RN017 (dia 09 do mês anterior ao
// usufruto) — a nova chave descarta os registros salvos com os prazos antigos.
export const STORAGE_KEY = "prototype-ferias-registros-v32";

function registroBase(parcial: Partial<FeriasRegistro> & Pick<FeriasRegistro, "id" | "servidorNome" | "matricula" | "cargo" | "tipoVinculo" | "parcelas" | "situacao">): FeriasRegistro {
  // RN017: férias aguardando validação têm como prazo da chefia o dia 09 do mês anterior ao início
  // do usufruto (parcela mais antiga). Recesso mantém o prazo próprio informado no mock.
  const inicioUsufruto = parcial.parcelas.map((p) => p.inicio).filter(Boolean).sort()[0];
  const prazoRn017 =
    parcial.situacao === "AGUARDANDO VALIDAÇÃO" && parcial.tipo !== "Recesso" && parcial.dataLimiteValidacaoChefia && inicioUsufruto
      ? { dataLimiteValidacaoChefia: prazosAgendamento(inicioUsufruto).limiteValidacao }
      : {};
  return {
    cpf: "",
    orgao: "SEPLAG/MT",
    orgaoColetivo: "OUTRO",
    setor: "COORD. PLANEJ. E PROJETOS DE TI",
    cargoGestao: false,
    tipo: "Individual",
    origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "",
    periodoAquisitivoFim: "",
    substitutos: [],
    responsavelLancamento: "RH Setorial",
    lancadoEm: "2026-09-01 09:00",
    ...parcial,
    ...prazoRn017,
    dre: parcial.dre ?? (parcial.orgao?.includes('SEDUC') ? 'DRE de demonstração' : undefined),
  };
}

export const registrosBase: FeriasRegistro[] = [
  registroBase({id:17, servidorNome:'Marcelo Antunes Ribeiro', matricula:'900017', cargo:'Técnico Administrativo', tipoVinculo:'Efetivo', origem:'SIGEP', situacao:'EM ABERTO', orgao:'SECITEC/MT', setor:'Escola Técnica — Unidade Cuiabá', unidade:'Unidade Cuiabá', periodoAquisitivoInicio:'2025-01-01', periodoAquisitivoFim:'2025-12-31', parcelas:[{id:1,inicio:'2026-12-01',fim:'2026-12-15',dias:15}]}),
  registroBase({id:18, servidorNome:'Renata Castilho Figueiredo', matricula:'900018', cargo:'Técnico Administrativo', tipoVinculo:'Contrato Temporário', origem:'SIGEP', situacao:'EM ABERTO', orgao:'UNEMAT/MT', setor:'Campus Sinop — Faculdade de Ciências', unidade:'Campus Sinop', periodoAquisitivoInicio:'2025-01-01', periodoAquisitivoFim:'2025-12-31', parcelas:[{id:1,inicio:'2026-12-01',fim:'2026-12-15',dias:15}]}),
  registroBase({
    id: 1, servidorNome: "Valeria da Silva Pinto", matricula: "241244", cargo: "Analista Administrativo",
    tipoVinculo: "Efetivo", situacao: "EM ABERTO", origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "2021-06-11", periodoAquisitivoFim: "2022-06-10",
    parcelas: [{ id: 1, inicio: "2025-03-24", fim: "2025-04-07", dias: 15 }],
  }),
  registroBase({
    id: 2, servidorNome: "Max Jorge Lacerda da Matta", matricula: "257812", cargo: "Técnico Administrativo",
    tipoVinculo: "Contrato Temporário", situacao: "EM ABERTO", origem: "SIGEP",
    periodoAquisitivoInicio: "2021-08-11", periodoAquisitivoFim: "2022-08-10",
    parcelas: [{ id: 1, inicio: "2025-12-05", fim: "2025-12-24", dias: 20 }],
  }),
  registroBase({
    id: 3, servidorNome: "Claudio Luciano Capistrano de Camargo", matricula: "243417", cargo: "Coordenador de TI",
    tipoVinculo: "Comissionado", cargoGestao: true, situacao: "EM ABERTO", origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "2021-10-15", periodoAquisitivoFim: "2022-10-14",
    parcelas: [{ id: 1, inicio: "2025-01-27", fim: "2025-02-15", dias: 20 }],
    substitutos: [{ id: 1, nome: "Fernanda Lopes Barreto (matr. 251090)", inicio: "2025-01-27", fim: "2025-02-15", portaria: "4712/2025" }],
  }),
  registroBase({
    id: 4, servidorNome: "Claudia Moreira Arrais de Oliveira", matricula: "249253", cargo: "Assessora Técnica",
    tipoVinculo: "Comissionado", situacao: "EM ABERTO", origem: "SIGEP",
    periodoAquisitivoInicio: "2022-07-01", periodoAquisitivoFim: "2023-06-30",
    parcelas: [{ id: 1, inicio: "2024-09-26", fim: "2024-10-25", dias: 30 }],
  }),
  registroBase({
    id: 5, servidorNome: "Claudio Luciano Capistrano de Camargo", matricula: "243417", cargo: "Coordenador de TI",
    tipoVinculo: "Comissionado", cargoGestao: true, situacao: "EM ABERTO", origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "2022-10-15", periodoAquisitivoFim: "2023-10-14",
    parcelas: [{ id: 1, inicio: "2026-09-08", fim: "2026-09-17", dias: 10 }],
    substitutos: [{ id: 1, nome: "Fernanda Lopes Barreto (matr. 251090)", inicio: "2026-09-08", fim: "2026-09-17", portaria: "4821/2026" }],
  }),
  registroBase({
    id: 6, servidorNome: "Claudio Luciano Capistrano de Camargo", matricula: "243417", cargo: "Coordenador de TI",
    tipoVinculo: "Comissionado", cargoGestao: true, situacao: "QUITADO", origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "2022-10-15", periodoAquisitivoFim: "2023-10-14",
    parcelas: [{ id: 1, inicio: "2026-12-01", fim: "2026-12-20", dias: 20 }],
    substitutos: [{ id: 1, nome: "Fernanda Lopes Barreto (matr. 251090)", inicio: "2026-12-01", fim: "2026-12-20", portaria: "" }],
  }),
  registroBase({
    id: 7, servidorNome: "João Silva", matricula: "327305", cargo: "Analista Administrativo",
    tipoVinculo: "Comissionado", cargoGestao: true, situacao: "EM ABERTO", origem: "SIGEP",
    periodoAquisitivoInicio: "2025-01-01", periodoAquisitivoFim: "2025-12-31",
    parcelas: [
      { id: 1, inicio: "2026-11-02", fim: "2026-11-21", dias: 20, terco: true },
      { id: 2, inicio: "2027-02-01", fim: "2027-02-10", dias: 10 },
    ],
    substitutos: [
      { id: 1, nome: "Ricardo Almeida Nunes (matr. 118732)", inicio: "2026-11-02", fim: "2026-11-21", portaria: "4790/2026" },
      { id: 2, nome: "Bruno Cardoso Freitas (matr. 203344)", inicio: "2027-02-01", fim: "2027-02-10", portaria: "4512/2027" },
    ],
  }),
  registroBase({
    id: 8, servidorNome: "Ana Lúcia Ferreira", matricula: "551023", cargo: "Professor",
    tipoVinculo: "Efetivo", orgao: "SEDUC/MT", orgaoColetivo: "SEDUC", setor: "Escola Estadual Antônio Ferreira",
    tipo: "Coletiva", situacao: "EM ABERTO", origem: "SIGEP",
    periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "2026-12-31",
    parcelas: [
      { id: 1, inicio: "2026-07-06", fim: "2026-07-20", dias: 15 },
      { id: 2, inicio: "2027-01-04", fim: "2027-02-02", dias: 30 },
    ],
    loteId: "LOTE-SEDUC-2026", responsavelLancamento: "Secretaria Escolar — E.E. Antônio Ferreira",
  }),
  registroBase({
    id: 9, servidorNome: "Marina Costa Alves", matricula: "418920", numeroVinculo: "1", cargo: "Analista Técnico",
    tipoVinculo: "Efetivo", situacao: "AGUARDANDO VALIDAÇÃO", origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "2025-01-15", periodoAquisitivoFim: "2026-01-14",
    parcelas: [{ id: 1, inicio: "2026-11-10", fim: "2026-11-24", dias: 15 }],
    dataLimiteValidacaoChefia: "2026-10-19",
    responsavelLancamento: "Marina Costa Alves (Portal do Servidor)",
    lancadoEm: "2026-10-11 14:20",
  }),
  registroBase({
    id: 10, servidorNome: "Rodrigo Nunes Ferraz", matricula: "778899", numeroVinculo: "2", cargo: "Professor Substituto",
    tipoVinculo: "Contrato Temporário", situacao: "AGUARDANDO VALIDAÇÃO", origem: "PORTALSERVIDOR",
    orgao: "SEDUC/MT", setor: "Escola Estadual Marechal Rondon",
    periodoAquisitivoInicio: "2026-05-01", periodoAquisitivoFim: "2027-04-30",
    parcelas: [{ id: 1, inicio: "2026-10-01", fim: "2026-10-30", dias: 30 }],
    dataLimiteValidacaoChefia: "2026-10-06",
    responsavelLancamento: "Rodrigo Nunes Ferraz (Portal do Servidor)",
    lancadoEm: "2026-09-28 09:05",
  }),
  registroBase({
    id: 11, servidorNome: "Beatriz Andrade Correia", matricula: "310021", numeroVinculo: "1", orgao: "SES/MT", cargo: "Residente Técnico — Enfermagem",
    tipoVinculo: "Residente Técnico", tipo: "Recesso", situacao: "AGUARDANDO VALIDAÇÃO", origem: "PORTALSERVIDOR",
    setor: "Hospital Regional de Mato Grosso",
    periodoAquisitivoInicio: "2026-02-01", periodoAquisitivoFim: "",
    parcelas: [{ id: 1, inicio: "2026-11-05", fim: "2026-11-19", dias: 15 }],
    dataLimiteValidacaoChefia: "2026-10-21",
    bloqueioAuxilioTransporte: true,
    emailChefiaEnviado: true,
    responsavelLancamento: "Beatriz Andrade Correia (Portal do Servidor)",
    lancadoEm: "2026-10-13 08:40",
  }),
  // RN003: já em andamento (cobre a data de hoje) — tentar lançar nova férias sobreposta para a
  // matrícula 260114 deve ser BLOQUEADO ao adicionar a parcela.
  registroBase({
    id: 12, servidorNome: "Fabiana Rezende Monteiro", matricula: "260114", cargo: "Técnica Administrativa",
    tipoVinculo: "Efetivo", situacao: "EM ABERTO", origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "2024-09-01", periodoAquisitivoFim: "2025-08-31",
    parcelas: [{ id: 1, inicio: "2026-10-10", fim: "2026-10-24", dias: 15 }],
    responsavelLancamento: "Fabiana Rezende Monteiro (Portal do Servidor)",
    lancadoEm: "2026-09-20 10:15",
    avaliadoPor: "Claudio Luciano Capistrano de Camargo", avaliadoEm: "2026-09-22 11:00",
  }),
  // RN003: agendada no futuro (ainda não começou) — tentar lançar nova férias sobreposta para a
  // matrícula 265530 também deve ser BLOQUEADO ao adicionar a parcela (qualquer sobreposição bloqueia).
  registroBase({
    id: 13, servidorNome: "Marcelo Augusto Vianna", matricula: "265530", cargo: "Assistente Administrativo",
    tipoVinculo: "Efetivo", situacao: "EM ABERTO", origem: "SIGEP",
    periodoAquisitivoInicio: "2024-11-01", periodoAquisitivoFim: "2025-10-31",
    parcelas: [{ id: 1, inicio: "2026-11-09", fim: "2026-11-23", dias: 15 }],
    responsavelLancamento: "RH Setorial",
    lancadoEm: "2026-10-01 14:00",
    avaliadoPor: "Claudio Luciano Capistrano de Camargo", avaliadoEm: "2026-10-03 09:20",
  }),
  // RN003: recesso de Residente Técnico já em andamento (cobre a data de hoje) — tentar lançar
  // novo recesso sobreposto para a matrícula 399088 deve ser BLOQUEADO ao adicionar a etapa.
  registroBase({
    id: 14, servidorNome: "Eduarda Martins Siqueira", matricula: "399088", cargo: "Residente Técnico — Fisioterapia",
    tipoVinculo: "Residente Técnico", tipo: "Recesso", situacao: "EM ABERTO", origem: "PORTALSERVIDOR",
    setor: "Hospital Regional de Mato Grosso",
    periodoAquisitivoInicio: "2026-03-01", periodoAquisitivoFim: "",
    parcelas: [{ id: 1, inicio: "2026-10-09", fim: "2026-10-23", dias: 15 }],
    bloqueioAuxilioTransporte: true,
    emailChefiaEnviado: true,
    responsavelLancamento: "Eduarda Martins Siqueira (Portal do Servidor)",
    lancadoEm: "2026-09-18 09:00",
    avaliadoPor: "Claudio Luciano Capistrano de Camargo", avaliadoEm: "2026-09-20 10:00",
  }),
  // Reabertura-padrão habilitada: Suspenso, início do usufruto ainda no futuro, folha não homologada.
  // Suspensão Art. 17 (origem Portal do Servidor) — histórico completo: Lançamento → Validação → Suspensão.
  registroBase({
    id: 15, servidorNome: "Patrícia Nogueira Souza", matricula: "410033", cargo: "Técnica Administrativa",
    tipoVinculo: "Efetivo", situacao: "SUSPENSO", origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "2025-05-01", periodoAquisitivoFim: "2026-04-30",
    parcelas: [{ id: 1, inicio: "2026-11-16", fim: "2026-11-30", dias: 15 }],
    responsavelLancamento: "Patrícia Nogueira Souza (Portal do Servidor)",
    lancadoEm: "2026-09-25 09:30",
    avaliadoPor: "Claudio Luciano Capistrano de Camargo", avaliadoEm: "2026-10-10 15:00",
    fundamentoSuspensao: "ART_17",
    suspensaoArt17: { solicitante: "Chefia Imediata — COORD. PLANEJ. E PROJETOS DE TI", causa: "Necessidade de serviço — substituição em período de recesso da equipe", prazoEstimadoDias: 20, autorizadoPeloDirigente: true, inicio: "2026-11-16" },
    diasSuspensos: 20,
    dataRetornoSuspensao: "2026-12-06",
    historico: [
      { situacao: "EM ABERTO", acao: "lancamento", data: "25/09/2026, 09:30:00", responsavel: "Servidor", responsavelMatricula: "410033", responsavelVinculo: "Efetivo" },
      { situacao: "EM ABERTO", acao: "validar", data: "10/10/2026, 15:00:00", responsavel: "Aprovador", responsavelMatricula: "900020", responsavelVinculo: "Efetivo" },
      { situacao: "SUSPENSO", acao: "suspender", data: "16/11/2026, 09:00:00", responsavel: "Gestor", responsavelMatricula: "900017", responsavelVinculo: "Efetivo", justificativa: "Necessidade de serviço — substituição em período de recesso da equipe", fundamentoSuspensao: "ART_17", suspensaoInicio: "2026-11-16", suspensaoFim: "2026-12-05", suspensaoDias: 20, novaDataTerminoFerias: "2026-12-20", causaSuspensao: "Necessidade de serviço — substituição em período de recesso da equipe", feriasOriginalInicio: "2026-11-16", feriasOriginalFim: "2026-11-30" },
    ],
  }),
  // Suspensão Art. 17 com folha homologada — histórico completo.
  registroBase({
    id: 16, servidorNome: "Cleber Augusto Dias", matricula: "400010", cargo: "Apoio",
    tipoVinculo: "Efetivo", situacao: "SUSPENSO", origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "2025-04-01", periodoAquisitivoFim: "2026-03-31",
    parcelas: [{ id: 1, inicio: "2026-12-07", fim: "2026-12-21", dias: 15 }],
    folhaHomologada: true,
    responsavelLancamento: "Cleber Augusto Dias (Portal do Servidor)",
    lancadoEm: "2026-09-30 10:10",
    avaliadoPor: "Claudio Luciano Capistrano de Camargo", avaliadoEm: "2026-10-05 09:00",
    fundamentoSuspensao: "ART_17",
    suspensaoArt17: { solicitante: "Chefia Imediata — EE Tiradentes", causa: "Convocação para comissão de processo seletivo", prazoEstimadoDias: 15, autorizadoPeloDirigente: true, inicio: "2026-12-07" },
    diasSuspensos: 15,
    dataRetornoSuspensao: "2026-12-23",
    historico: [
      { situacao: "EM ABERTO", acao: "lancamento", data: "30/09/2026, 10:10:00", responsavel: "Servidor", responsavelMatricula: "400010", responsavelVinculo: "Efetivo" },
      { situacao: "EM ABERTO", acao: "validar", data: "05/10/2026, 09:00:00", responsavel: "Aprovador", responsavelMatricula: "900020", responsavelVinculo: "Efetivo" },
      { situacao: "SUSPENSO", acao: "suspender", data: "07/12/2026, 08:30:00", responsavel: "Gestor", responsavelMatricula: "900017", responsavelVinculo: "Efetivo", justificativa: "Convocação para comissão de processo seletivo", fundamentoSuspensao: "ART_17", suspensaoInicio: "2026-12-07", suspensaoFim: "2026-12-21", suspensaoDias: 15, novaDataTerminoFerias: "2027-01-05", causaSuspensao: "Convocação para comissão de processo seletivo", feriasOriginalInicio: "2026-12-07", feriasOriginalFim: "2026-12-21" },
    ],
  }),
  // Cancelamento bloqueado pela folha homologada/paga (RN 1) — habilita "Forçar cancelamento"
  // para o Aprovador; para o Gestor, "Cancelar férias" aparece desabilitado com o aviso de bloqueio.
  registroBase({
    id: 31, servidorNome: "Simone Aparecida Luz", matricula: "498231", cargo: "Administração",
    tipoVinculo: "Efetivo", situacao: "EM ABERTO", origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "2025-09-01", periodoAquisitivoFim: "2026-08-31",
    parcelas: [{ id: 1, inicio: "2026-10-10", fim: "2026-10-24", dias: 15 }],
    folhaHomologada: true,
    responsavelLancamento: "Simone Aparecida Luz (Portal do Servidor)",
    lancadoEm: "2026-08-20 11:15",
    avaliadoPor: "Claudio Luciano Capistrano de Camargo", avaliadoEm: "2026-08-25 09:30",
  }),
  // Agendamento Coletivo — UNEMAT (professor, duas parcelas, ainda aguardando validação da DRE).
  registroBase({
    id: 19, servidorNome: "João Pedro Castanheira", matricula: "512077", cargo: "Professor",
    tipoVinculo: "Efetivo", orgao: "UNEMAT/MT", orgaoColetivo: "UNEMAT", setor: "Câmpus Universitário de Cáceres (Jane Vanini)",
    tipo: "Coletiva", situacao: "AGUARDANDO VALIDAÇÃO", origem: "SIGEP",
    periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "2026-12-31",
    parcelas: [
      { id: 1, inicio: "2026-11-23", fim: "2026-12-07", dias: 15 },
      { id: 2, inicio: "2027-02-08", fim: "2027-03-09", dias: 30 },
    ],
    loteId: "LOTE-UNEMAT-2026", dataLimiteValidacaoChefia: "2026-11-15",
    responsavelLancamento: "Gestão de Pessoas — UNEMAT",
    lancadoEm: "2026-10-05 09:00",
  }),
  // Mesmo lote do registro 19 (LOTE-UNEMAT-2026) — demonstra a aprovação agrupada por lote.
  registroBase({
    id: 23, servidorNome: "Marina Costa Alves", matricula: "512104", numeroVinculo: "1", cargo: "Professor",
    tipoVinculo: "Efetivo", orgao: "UNEMAT/MT", orgaoColetivo: "UNEMAT", setor: "Câmpus Universitário de Sinop",
    tipo: "Coletiva", situacao: "AGUARDANDO VALIDAÇÃO", origem: "SIGEP",
    periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "2026-12-31",
    parcelas: [
      { id: 1, inicio: "2026-11-23", fim: "2026-12-07", dias: 15 },
      { id: 2, inicio: "2027-02-08", fim: "2027-03-09", dias: 30 },
    ],
    loteId: "LOTE-UNEMAT-2026", dataLimiteValidacaoChefia: "2026-11-15",
    responsavelLancamento: "Gestão de Pessoas — UNEMAT",
    lancadoEm: "2026-10-05 09:00",
  }),
  // Agendamento Coletivo — SECITEC (professor, já validado).
  registroBase({
    id: 20, servidorNome: "Rosângela Prado Teixeira", matricula: "900020", cargo: "Professor",
    tipoVinculo: "Efetivo", orgao: "SECITEC/MT", orgaoColetivo: "SECITEC", setor: "ETEC de Sinop",
    tipo: "Coletiva", situacao: "EM ABERTO", origem: "SIGEP",
    periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "2026-12-31",
    parcelas: [
      { id: 1, inicio: "2026-07-06", fim: "2026-07-20", dias: 15 },
      { id: 2, inicio: "2027-01-04", fim: "2027-02-02", dias: 30 },
    ],
    loteId: "LOTE-SECITEC-2026", responsavelLancamento: "Gestão de Pessoas — SECITEC",
    lancadoEm: "2026-09-10 08:30",
    avaliadoPor: "Claudio Luciano Capistrano de Camargo", avaliadoEm: "2026-09-12 10:00",
  }),
  // Agendamento em Lote — SEDUC (cargo de apoio/gestão, duas parcelas, aguardando a DRE).
  registroBase({
    id: 21, servidorNome: "Simone Aparecida Luz", matricula: "498231", cargo: "Administração",
    tipoVinculo: "Efetivo", orgao: "SEDUC/MT", orgaoColetivo: "SEDUC", setor: "EE Tiradentes",
    tipo: "Lote", situacao: "AGUARDANDO VALIDAÇÃO", origem: "SIGEP",
    periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "2026-12-31",
    parcelas: [
      { id: 1, inicio: "2026-11-09", fim: "2026-11-18", dias: 10 },
      { id: 2, inicio: "2027-01-11", fim: "2027-01-30", dias: 20 },
    ],
    loteId: "LOTE-SEDUC-2026-APOIO", dataLimiteValidacaoChefia: "2026-11-02",
    responsavelLancamento: "Secretaria Escolar — EE Tiradentes",
    lancadoEm: "2026-10-02 11:15",
  }),
  // Mesmo lote do registro 21 (LOTE-SEDUC-2026-APOIO) — demonstra a aprovação agrupada por lote.
  registroBase({
    id: 24, servidorNome: "Cleber Augusto Dias", matricula: "400010", cargo: "Apoio",
    tipoVinculo: "Efetivo", orgao: "SEDUC/MT", orgaoColetivo: "SEDUC", setor: "EE Tiradentes",
    tipo: "Lote", situacao: "AGUARDANDO VALIDAÇÃO", origem: "SIGEP",
    periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "2026-12-31",
    parcelas: [
      { id: 1, inicio: "2026-11-09", fim: "2026-11-18", dias: 10 },
      { id: 2, inicio: "2027-01-11", fim: "2027-01-30", dias: 20 },
    ],
    loteId: "LOTE-SEDUC-2026-APOIO", dataLimiteValidacaoChefia: "2026-11-02",
    responsavelLancamento: "Secretaria Escolar — EE Tiradentes",
    lancadoEm: "2026-10-02 11:15",
  }),
  // Agendamento em Lote — UNEMAT (cargo de apoio/gestão, usufruto antecipado, já confirmado).
  registroBase({
    id: 22, servidorNome: "Marina Costa Alves", matricula: "512104", cargo: "Apoio",
    tipoVinculo: "Efetivo", orgao: "UNEMAT/MT", orgaoColetivo: "UNEMAT", setor: "Câmpus Universitário de Sinop",
    tipo: "Lote", situacao: "EM ABERTO", origem: "SIGEP",
    periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "2026-12-31",
    regraAquisitivo: "USUFRUTO_ANTECIPADO", saldoFeriasConfirmado: false,
    parcelas: [
      { id: 1, inicio: "2026-11-30", fim: "2026-12-14", dias: 15 },
      { id: 2, inicio: "2027-01-18", fim: "2027-02-01", dias: 15 },
    ],
    loteId: "LOTE-UNEMAT-2026-APOIO",
    responsavelLancamento: "Gestão de Pessoas — UNEMAT",
    lancadoEm: "2026-09-28 14:40",
    avaliadoPor: "Claudio Luciano Capistrano de Camargo", avaliadoEm: "2026-09-29 09:10",
  }),
  // 3º membro do lote UNEMAT (registros 19 e 23) — grupo com 3 servidores.
  registroBase({
    id: 25, servidorNome: "Rafael Monteiro Costa", matricula: "551120", cargo: "Professor",
    tipoVinculo: "Efetivo", orgao: "UNEMAT/MT", orgaoColetivo: "UNEMAT", setor: "Câmpus Universitário de Cáceres (Jane Vanini)",
    tipo: "Coletiva", situacao: "AGUARDANDO VALIDAÇÃO", origem: "SIGEP",
    periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "2026-12-31",
    parcelas: [
      { id: 1, inicio: "2026-11-23", fim: "2026-12-07", dias: 15 },
      { id: 2, inicio: "2027-02-08", fim: "2027-03-09", dias: 30 },
    ],
    loteId: "LOTE-UNEMAT-2026", dataLimiteValidacaoChefia: "2026-11-15",
    responsavelLancamento: "Gestão de Pessoas — UNEMAT",
    lancadoEm: "2026-10-05 09:00",
  }),
  // 3º membro do lote SEDUC/apoio (registros 21 e 24) — grupo com 3 servidores.
  registroBase({
    id: 26, servidorNome: "Patrícia Nogueira Souza", matricula: "410033", cargo: "Administração",
    tipoVinculo: "Contrato Temporário", orgao: "SEDUC/MT", orgaoColetivo: "SEDUC", setor: "EE Tiradentes",
    tipo: "Lote", situacao: "AGUARDANDO VALIDAÇÃO", origem: "SIGEP",
    periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "2026-12-31",
    parcelas: [
      { id: 1, inicio: "2026-11-09", fim: "2026-11-18", dias: 10 },
      { id: 2, inicio: "2027-01-11", fim: "2027-01-30", dias: 20 },
    ],
    loteId: "LOTE-SEDUC-2026-APOIO", dataLimiteValidacaoChefia: "2026-11-02",
    responsavelLancamento: "Secretaria Escolar — EE Tiradentes",
    lancadoEm: "2026-10-02 11:15",
  }),
  // Novo grupo — Agendamento Coletivo SECITEC pendente (2 professores, parcela integral).
  registroBase({
    id: 27, servidorNome: "Rosângela Prado Teixeira", matricula: "900020", cargo: "Professor",
    tipoVinculo: "Efetivo", orgao: "SECITEC/MT", orgaoColetivo: "SECITEC", setor: "ETEC de Sinop",
    tipo: "Coletiva", situacao: "AGUARDANDO VALIDAÇÃO", origem: "SIGEP",
    periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "2026-12-31",
    parcelas: [{ id: 1, inicio: "2026-12-14", fim: "2027-01-12", dias: 30 }],
    loteId: "LOTE-SECITEC-2026-B", dataLimiteValidacaoChefia: "2026-12-05",
    responsavelLancamento: "Gestão de Pessoas — SECITEC",
    lancadoEm: "2026-10-18 10:00",
  }),
  registroBase({
    id: 28, servidorNome: "Marcos Vieira Souza", matricula: "551141", cargo: "Professor",
    tipoVinculo: "Efetivo", orgao: "SECITEC/MT", orgaoColetivo: "SECITEC", setor: "ETEC de Cuiabá",
    tipo: "Coletiva", situacao: "AGUARDANDO VALIDAÇÃO", origem: "SIGEP",
    periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "2026-12-31",
    parcelas: [{ id: 1, inicio: "2026-12-14", fim: "2027-01-12", dias: 30 }],
    loteId: "LOTE-SECITEC-2026-B", dataLimiteValidacaoChefia: "2026-12-05",
    responsavelLancamento: "Gestão de Pessoas — SECITEC",
    lancadoEm: "2026-10-18 10:00",
  }),
  // Novo grupo — Agendamento em Lote UNEMAT pendente (2 servidores de apoio, outra escala).
  registroBase({
    id: 29, servidorNome: "Lívia Rodrigues Martins", matricula: "551138", cargo: "Apoio",
    tipoVinculo: "Efetivo", orgao: "UNEMAT/MT", orgaoColetivo: "UNEMAT", setor: "Câmpus Universitário de Sinop",
    tipo: "Lote", situacao: "AGUARDANDO VALIDAÇÃO", origem: "SIGEP",
    periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "2026-12-31",
    parcelas: [
      { id: 1, inicio: "2026-12-01", fim: "2026-12-15", dias: 15 },
      { id: 2, inicio: "2027-01-19", fim: "2027-02-02", dias: 15 },
    ],
    loteId: "LOTE-UNEMAT-2026-APOIO-B", dataLimiteValidacaoChefia: "2026-11-24",
    responsavelLancamento: "Gestão de Pessoas — UNEMAT",
    lancadoEm: "2026-10-19 09:30",
  }),
  registroBase({
    id: 30, servidorNome: "Paulo Henrique Alves", matricula: "551155", cargo: "Apoio",
    tipoVinculo: "Efetivo", orgao: "UNEMAT/MT", orgaoColetivo: "UNEMAT", setor: "Câmpus Universitário de Sinop",
    tipo: "Lote", situacao: "AGUARDANDO VALIDAÇÃO", origem: "SIGEP",
    periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "2026-12-31",
    parcelas: [
      { id: 1, inicio: "2026-12-01", fim: "2026-12-15", dias: 15 },
      { id: 2, inicio: "2027-01-19", fim: "2027-02-02", dias: 15 },
    ],
    loteId: "LOTE-UNEMAT-2026-APOIO-B", dataLimiteValidacaoChefia: "2026-11-24",
    responsavelLancamento: "Gestão de Pessoas — UNEMAT",
    lancadoEm: "2026-10-19 09:30",
  }),
  // RN-SUS Art. 16 — suspensão automática por licença, com retomada no 1º dia útil e sem
  // impacto financeiro (adiantamento já cobria o período integral). Demonstra o badge Art. 16.
  registroBase({
    id: 31, servidorNome: "Larissa Gomes Vieira", matricula: "900031", cargo: "Analista Administrativo",
    tipoVinculo: "Efetivo", origem: "SIGEP", situacao: "SUSPENSO", orgao: "SEPLAG/MT",
    periodoAquisitivoInicio: "2024-01-01", periodoAquisitivoFim: "2024-12-31",
    parcelas: [{ id: 1, inicio: "2026-11-02", fim: "2026-12-01", dias: 30 }],
    adiantamentoPago: true,
    fundamentoSuspensao: "ART_16",
    dataRetomadaArt16: "2027-03-01",
    diasSuspensos: 119,
    dataRetornoSuspensao: "2027-03-01",
    responsavelLancamento: "RH Setorial", lancadoEm: "2026-09-20 09:00",
    historico: [
      { situacao: "EM ABERTO", acao: "lancamento", data: "20/09/2026, 09:00:00", responsavel: "Gestor", responsavelMatricula: "900017", responsavelVinculo: "Efetivo" },
      { situacao: "SUSPENSO", acao: "suspender", data: "02/11/2026, 10:30:00", responsavel: "Gestor", responsavelMatricula: "900017", responsavelVinculo: "Efetivo", justificativa: "Licença-maternidade concedida durante o gozo", fundamentoSuspensao: "ART_16", dataRetomada: "2027-03-01", novaDataTerminoFerias: "2027-03-30", suspensaoInicio: "2026-11-02", suspensaoFim: "2027-02-28", suspensaoDias: 119, causaSuspensao: "Licença-maternidade concedida durante o gozo", feriasOriginalInicio: "2026-11-02", feriasOriginalFim: "2026-12-01" },
    ],
  }),
  // RN-SUS Art. 17 após o pagamento — suspensão por interesse público, com débito proporcional
  // diferido para a competência do novo gozo (RN-SUS-10). Demonstra o badge Art. 17 + Débito.
  registroBase({
    id: 32, servidorNome: "Henrique Dias Moreira", matricula: "900032", cargo: "Técnico Administrativo",
    tipoVinculo: "Efetivo", origem: "SIGEP", situacao: "SUSPENSO", orgao: "SEPLAG/MT",
    periodoAquisitivoInicio: "2024-01-01", periodoAquisitivoFim: "2024-12-31",
    parcelas: [{ id: 1, inicio: "2026-11-02", fim: "2026-12-01", dias: 30 }],
    adiantamentoPago: true,
    fundamentoSuspensao: "ART_17",
    suspensaoArt17: { solicitante: "Chefia Imediata — COORD. PLANEJ. E PROJETOS DE TI", causa: "Convocação para força-tarefa de fiscalização emergencial", prazoEstimadoDias: 45, autorizadoPeloDirigente: true, inicio: "2026-11-05" },
    diasSuspensos: 45,
    dataRetornoSuspensao: "2026-12-20",
    pendenciaSaldo: { diasComprometidos: 20, origem: "SUSPENSAO_ART17" },
    responsavelLancamento: "RH Setorial", lancadoEm: "2026-09-25 10:00",
    historico: [
      { situacao: "EM ABERTO", acao: "lancamento", data: "25/09/2026, 10:00:00", responsavel: "Gestor", responsavelMatricula: "900017", responsavelVinculo: "Efetivo" },
      { situacao: "SUSPENSO", acao: "suspender", data: "05/11/2026, 14:00:00", responsavel: "Gestor", responsavelMatricula: "900017", responsavelVinculo: "Efetivo", justificativa: "Convocação para força-tarefa de fiscalização emergencial", fundamentoSuspensao: "ART_17", suspensaoInicio: "2026-11-05", suspensaoFim: "2026-12-19", suspensaoDias: 45, novaDataTerminoFerias: "2027-01-15", causaSuspensao: "Convocação para força-tarefa de fiscalização emergencial", feriasOriginalInicio: "2026-11-02", feriasOriginalFim: "2026-12-01" },
    ],
  }),
  // Férias individuais EM USUFRUTO (o período cobre a data de hoje) e folha ainda não
  // homologada — habilita a ação "Suspender" (RN-SUS: suspensão só durante o gozo). Use estes
  // para demonstrar o modal de Suspensão Art. 17.
  registroBase({
    id: 33, servidorNome: "Aline Ferreira Dantas", matricula: "900033", cargo: "Analista Administrativo",
    tipoVinculo: "Efetivo", origem: "SIGEP", situacao: "EM ABERTO", orgao: "SEPLAG/MT",
    setor: "COORD. PLANEJ. E PROJETOS DE TI",
    periodoAquisitivoInicio: "2024-01-01", periodoAquisitivoFim: "2024-12-31",
    parcelas: [{ id: 1, inicio: "2026-10-19", fim: "2026-11-17", dias: 30 }],
    responsavelLancamento: "RH Setorial", lancadoEm: "2026-09-10 09:00",
    avaliadoPor: "Claudio Luciano Capistrano de Camargo", avaliadoEm: "2026-09-15 10:00",
  }),
  registroBase({
    id: 34, servidorNome: "Gustavo Pereira Lima", matricula: "900034", cargo: "Técnico Administrativo",
    tipoVinculo: "Efetivo", origem: "SIGEP", situacao: "EM ABERTO", orgao: "SEPLAG/MT",
    setor: "COORD. PLANEJ. E PROJETOS DE TI",
    periodoAquisitivoInicio: "2024-01-01", periodoAquisitivoFim: "2024-12-31",
    parcelas: [{ id: 1, inicio: "2026-10-22", fim: "2026-11-10", dias: 20 }],
    responsavelLancamento: "RH Setorial", lancadoEm: "2026-09-12 11:00",
    avaliadoPor: "Claudio Luciano Capistrano de Camargo", avaliadoEm: "2026-09-16 09:00",
  }),
  // Solicitações INDIVIDUAIS do Portal do Servidor pendentes de validação — para demonstrar
  // aprovar/rejeitar na aba Aprovações (perfil Aprovador). Origem Portal ⇒ Aguardando Validação.
  registroBase({
    id: 35, servidorNome: "Juliana Martins Rocha", matricula: "900035", cargo: "Analista Administrativo",
    tipoVinculo: "Efetivo", origem: "PORTALSERVIDOR", situacao: "AGUARDANDO VALIDAÇÃO", orgao: "SEPLAG/MT",
    setor: "COORD. PLANEJ. E PROJETOS DE TI",
    periodoAquisitivoInicio: "2024-06-01", periodoAquisitivoFim: "2025-05-31",
    parcelas: [{ id: 1, inicio: "2027-01-11", fim: "2027-02-09", dias: 30 }],
    dataLimiteValidacaoChefia: "2026-12-15",
    responsavelLancamento: "Juliana Martins Rocha (Portal do Servidor)", lancadoEm: "2026-10-20 08:40",
    historico: [
      { situacao: "AGUARDANDO VALIDAÇÃO", acao: "lancamento", data: "20/10/2026, 08:40:00", responsavel: "Servidor", responsavelMatricula: "900035", responsavelVinculo: "Efetivo" },
    ],
  }),
  registroBase({
    id: 36, servidorNome: "Ricardo Alves Pereira", matricula: "900036", cargo: "Assistente Administrativo",
    tipoVinculo: "Contrato Temporário", origem: "PORTALSERVIDOR", situacao: "AGUARDANDO VALIDAÇÃO", orgao: "SEPLAG/MT",
    setor: "GABINETE",
    periodoAquisitivoInicio: "2024-03-01", periodoAquisitivoFim: "2025-02-28",
    parcelas: [
      { id: 1, inicio: "2026-12-07", fim: "2026-12-21", dias: 15 },
      { id: 2, inicio: "2027-02-01", fim: "2027-02-15", dias: 15 },
    ],
    dataLimiteValidacaoChefia: "2026-11-20",
    responsavelLancamento: "Ricardo Alves Pereira (Portal do Servidor)", lancadoEm: "2026-10-18 14:10",
    historico: [
      { situacao: "AGUARDANDO VALIDAÇÃO", acao: "lancamento", data: "18/10/2026, 14:10:00", responsavel: "Servidor", responsavelMatricula: "900036", responsavelVinculo: "Contrato Temporário" },
    ],
  }),
  registroBase({
    id: 37, servidorNome: "Fernanda Lopes Barreto", matricula: "900037", cargo: "Assessora Técnica",
    tipoVinculo: "Comissionado", origem: "PORTALSERVIDOR", situacao: "AGUARDANDO VALIDAÇÃO", orgao: "SEPLAG/MT",
    setor: "COORD. PLANEJ. E PROJETOS DE TI",
    periodoAquisitivoInicio: "2024-01-01", periodoAquisitivoFim: "2024-12-31",
    parcelas: [{ id: 1, inicio: "2026-12-01", fim: "2026-12-20", dias: 20 }],
    dataLimiteValidacaoChefia: "2026-11-18",
    responsavelLancamento: "Fernanda Lopes Barreto (Portal do Servidor)", lancadoEm: "2026-10-15 10:25",
    historico: [
      { situacao: "AGUARDANDO VALIDAÇÃO", acao: "lancamento", data: "15/10/2026, 10:25:00", responsavel: "Servidor", responsavelMatricula: "900037", responsavelVinculo: "Comissionado" },
    ],
  }),
  registroBase({
    id: 38, servidorNome: "Bruno Cardoso Freitas", matricula: "900038", cargo: "Analista Técnico",
    tipoVinculo: "Efetivo", origem: "PORTALSERVIDOR", situacao: "AGUARDANDO VALIDAÇÃO", orgao: "SEPLAG/MT",
    setor: "COORD. PLANEJ. E PROJETOS DE TI",
    periodoAquisitivoInicio: "2024-08-01", periodoAquisitivoFim: "2025-07-31",
    parcelas: [
      { id: 1, inicio: "2027-01-05", fim: "2027-01-14", dias: 10 },
      { id: 2, inicio: "2027-02-01", fim: "2027-02-10", dias: 10 },
      { id: 3, inicio: "2027-03-01", fim: "2027-03-10", dias: 10 },
    ],
    dataLimiteValidacaoChefia: "2026-12-05",
    responsavelLancamento: "Bruno Cardoso Freitas (Portal do Servidor)", lancadoEm: "2026-10-22 16:00",
    historico: [
      { situacao: "AGUARDANDO VALIDAÇÃO", acao: "lancamento", data: "22/10/2026, 16:00:00", responsavel: "Servidor", responsavelMatricula: "900038", responsavelVinculo: "Efetivo" },
    ],
  }),
  // Recesso Remunerado lançado pelo SIGEP — nasce AGENDADA (EM ABERTO) e NÃO vai para aprovação.
  registroBase({
    id: 39, servidorNome: "Tatiane Moraes Prado", matricula: "900039", cargo: "Residente Técnico — Enfermagem",
    tipoVinculo: "Residente Técnico", tipo: "Recesso", origem: "SIGEP", situacao: "EM ABERTO", orgao: "SES/MT",
    setor: "Hospital Regional de Mato Grosso",
    periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "",
    parcelas: [{ id: 1, inicio: "2027-01-11", fim: "2027-01-25", dias: 15 }],
    bloqueioAuxilioTransporte: true,
    responsavelLancamento: "RH Setorial (SIGEP)", lancadoEm: "2026-10-23 09:00",
    historico: [
      { situacao: "EM ABERTO", acao: "lancamento", data: "23/10/2026, 09:00:00", responsavel: "Gestor", responsavelMatricula: "900017", responsavelVinculo: "Efetivo" },
    ],
  }),
  // RN-FOL-02 / RN-CAN-03 — Férias AGENDADA (EM ABERTO), ainda não iniciada, com o ADIANTAMENTO
  // (remuneração + 1/3) JÁ PAGO em folha. Como o gozo está dentro da janela de adiantamento, o
  // valor já foi antecipado. Ao editar/remanejar as datas, o valor pago torna-se indevido para o
  // período original e o sistema gera um DÉBITO (estorno) descontado na próxima folha. Use este
  // registro para demonstrar o aviso de débito ao remanejar (menu Ações → Editar).
  registroBase({
    id: 40, servidorNome: "Marcos Antunes Ribeiro", matricula: "900040", cargo: "Analista Administrativo",
    tipoVinculo: "Efetivo", origem: "SIGEP", situacao: "EM ABERTO", orgao: "SEPLAG/MT",
    setor: "COORD. PLANEJ. E PROJETOS DE TI",
    periodoAquisitivoInicio: "2024-01-01", periodoAquisitivoFim: "2024-12-31",
    parcelas: [{ id: 1, inicio: "2026-12-07", fim: "2027-01-05", dias: 30 }],
    adiantamentoPago: true,
    saldoFerias: 30,
    responsavelLancamento: "RH Setorial (SIGEP)", lancadoEm: "2026-10-20 09:00",
    historico: [
      { situacao: "EM ABERTO", acao: "lancamento", data: "20/10/2026, 09:00:00", responsavel: "Gestor", responsavelMatricula: "900017", responsavelVinculo: "Efetivo" },
    ],
  }),
];

/** Remove entradas com `id` repetido, mantendo a última ocorrência — defende contra
 * duplicidade acumulada no localStorage (ex.: snapshots salvos em sessões de teste antigas
 * que não acompanharam alterações posteriores nos dados base). */
function semIdsDuplicados(lista: FeriasRegistro[]): FeriasRegistro[] {
  const porId = new Map<number, FeriasRegistro>();
  lista.forEach(registro => porId.set(registro.id, registro));
  return [...porId.values()];
}

export function carregarRegistros(): FeriasRegistro[] {
  try {
    const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as FeriasRegistro[] | null;
    return semIdsDuplicados((salvos ?? registrosBase).map(registro => {
      const hoje = new Date().toLocaleDateString("sv-SE", {timeZone:"America/Cuiaba"});
      if (registro.situacao === "AGUARDANDO VALIDAÇÃO" && registro.dataLimiteValidacaoChefia && hoje > registro.dataLimiteValidacaoChefia) return {...registro, situacao:"PRAZO EXPIRADO" as const};
      const original = registrosBase.find(base => base.id === registro.id && base.matricula === registro.matricula && base.servidorNome === registro.servidorNome);
      return !registro.numeroVinculo && original?.numeroVinculo
        ? { ...registro, numeroVinculo: original.numeroVinculo }
        : registro;
    }));
  } catch {
    return registrosBase;
  }
}
