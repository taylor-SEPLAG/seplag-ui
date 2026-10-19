import type { FeriasRegistro } from "./FeriasPages";

// Dados mock e chave de persistência do protótipo de férias. Ficam fora de FeriasPages.tsx
// (um arquivo de componentes) porque o Fast Refresh do Vite invalida o módulo inteiro sempre
// que um arquivo de componente também exporta valores não-componente — isso já chegou a causar
// renders com hooks fora de ordem (erro "useEffect changed size between renders") durante HMR.
export const STORAGE_KEY = "prototype-ferias-registros-v10";

function registroBase(parcial: Partial<FeriasRegistro> & Pick<FeriasRegistro, "id" | "servidorNome" | "matricula" | "cargo" | "tipoVinculo" | "parcelas" | "situacao">): FeriasRegistro {
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
    dre: parcial.dre ?? (parcial.orgao?.includes('SEDUC') ? 'DRE de demonstração' : undefined),
  };
}

export const registrosBase: FeriasRegistro[] = [
  registroBase({id:17, servidorNome:'Servidor SECITEC (demonstração)', matricula:'900017', cargo:'Técnico Administrativo', tipoVinculo:'Efetivo', origem:'SIGEP', situacao:'EM ABERTO', orgao:'SECITEC/MT', setor:'Escola Técnica — Unidade Cuiabá', unidade:'Unidade Cuiabá', periodoAquisitivoInicio:'2025-01-01', periodoAquisitivoFim:'2025-12-31', parcelas:[{id:1,inicio:'2026-12-01',fim:'2026-12-15',dias:15}]}),
  registroBase({id:18, servidorNome:'Servidor UNEMAT (demonstração)', matricula:'900018', cargo:'Técnico Administrativo', tipoVinculo:'Contrato Temporário', origem:'SIGEP', situacao:'EM ABERTO', orgao:'UNEMAT/MT', setor:'Campus Sinop — Faculdade de Ciências', unidade:'Campus Sinop', periodoAquisitivoInicio:'2025-01-01', periodoAquisitivoFim:'2025-12-31', parcelas:[{id:1,inicio:'2026-12-01',fim:'2026-12-15',dias:15}]}),
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
  // RN-03: já em andamento (cobre a data de hoje) — tentar lançar nova férias sobreposta para a
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
  // RN-02: agendada no futuro (ainda não começou) — tentar lançar nova férias sobreposta para a
  // matrícula 265530 deve apenas ALERTAR, sem bloquear.
  registroBase({
    id: 13, servidorNome: "Marcelo Augusto Vianna", matricula: "265530", cargo: "Assistente Administrativo",
    tipoVinculo: "Efetivo", situacao: "EM ABERTO", origem: "SIGEP",
    periodoAquisitivoInicio: "2024-11-01", periodoAquisitivoFim: "2025-10-31",
    parcelas: [{ id: 1, inicio: "2026-11-09", fim: "2026-11-23", dias: 15 }],
    responsavelLancamento: "RH Setorial",
    lancadoEm: "2026-10-01 14:00",
    avaliadoPor: "Claudio Luciano Capistrano de Camargo", avaliadoEm: "2026-10-03 09:20",
  }),
  // RN-03: recesso de Residente Técnico já em andamento (cobre a data de hoje) — tentar lançar
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
];

export function carregarRegistros(): FeriasRegistro[] {
  try {
    const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as FeriasRegistro[] | null;
    return (salvos ?? registrosBase).map(registro => {
      const hoje = new Date().toLocaleDateString("sv-SE", {timeZone:"America/Cuiaba"});
      if (registro.situacao === "AGUARDANDO VALIDAÇÃO" && registro.dataLimiteValidacaoChefia && hoje > registro.dataLimiteValidacaoChefia) return {...registro, situacao:"REPROVADO" as const, expirado:true};
      const original = registrosBase.find(base => base.id === registro.id && base.matricula === registro.matricula && base.servidorNome === registro.servidorNome);
      return !registro.numeroVinculo && original?.numeroVinculo
        ? { ...registro, numeroVinculo: original.numeroVinculo }
        : registro;
    }) ?? registrosBase;
  } catch {
    return registrosBase;
  }
}
