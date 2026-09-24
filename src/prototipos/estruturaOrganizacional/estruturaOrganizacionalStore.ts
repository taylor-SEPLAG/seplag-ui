export type SituacaoUnidadeEstrutural = "ATIVA" | "INATIVA" | "EXTINTA";

export interface UnidadeEstrutural {
  id: number;
  codigo: string;
  nome: string;
  sigla: string;
  orgao: string;
  tipo: string;
  nivelOrganizacional: string;
  localizacao: string;
  situacao: SituacaoUnidadeEstrutural;
  dataInicio: string;
  dataFim?: string;
  documentoCriacaoId?: string;
  documentoExtincaoId?: string;
  justificativaExtincao?: string;
  servidoresAtivosLotados?: number;
  referencias?: number;
  documentosLegaisCriacaoIds?: string[];
  outraLocalidade?: boolean;
  endereco?: {
    cep?: string;
    estado?: string;
    municipio?: string;
    bairro?: string;
    tipoLogradouro?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
  };
  /** Campo de compatibilidade para o formulário. A posição oficial está em posicoes. */
  unidadeSuperior?: string;
  ordem: number;
}

export interface VersaoOrganograma {
  id: string;
  orgao: string;
  codigoOrgao?: string;
  nome: string;
  documentoLegalId: string;
  documentoLegal: string;
  inicio: string;
  fim?: string;
  situacao: "RASCUNHO" | "VIGENTE" | "ENCERRADA";
  justificativa?: string;
}

export interface PosicaoEstrutural {
  id: string;
  versaoId: string;
  unidadeId: number;
  superiorId: number | null;
  ordem: number;
  inicio: string;
  fim?: string;
}

export interface DocumentoLegalEstrutural {
  id: string;
  titulo: string;
  categoria: string;
  ativo: boolean;
}

export interface EventoAuditoriaEstrutural {
  id: string;
  data: string;
  acao: "CADASTRO" | "EDICAO" | "ORDENACAO" | "ESTRUTURA" | "EXTINCAO" | "EXCLUSAO";
  unidadeId?: number;
  descricao: string;
}

export interface EstruturaOrganizacionalState {
  schemaVersion: 1;
  unidades: UnidadeEstrutural[];
  versoes: VersaoOrganograma[];
  posicoes: PosicaoEstrutural[];
  documentosLegais: DocumentoLegalEstrutural[];
  auditoria: EventoAuditoriaEstrutural[];
}

export interface UnidadeNoOrganograma extends UnidadeEstrutural {
  superiorId: number | null;
  versaoId: string;
}

const CHAVE_ESTRUTURA = "sigep-prototipo-estrutura-organizacional-v1";
const CHAVE_LEGADA_UNIDADES = "sigep-prototipo-unidades-cadastradas-v2";
const documentosPadrao: DocumentoLegalEstrutural[] = [
  { id: "decreto-2185-2026", titulo: "Decreto nº 2.185, de 03/07/2026", categoria: "Decreto", ativo: true },
  { id: "lc-612-2019", titulo: "Lei Complementar nº 612, de 28/01/2019", categoria: "Lei Complementar", ativo: true },
  { id: "lei-10052-2014", titulo: "Lei nº 10.052, de 15/01/2014", categoria: "Lei", ativo: true },
];

const unidadesPadrao: UnidadeEstrutural[] = [
  { id: 1, codigo: "U0001", nome: "Gabinete do Secretário de Estado de Planejamento e Gestão", sigla: "GAB", orgao: "SEPLAG", tipo: "Gabinete", nivelOrganizacional: "Nível de Direção Superior", localizacao: "Cuiabá/MT", situacao: "ATIVA", dataInicio: "01/01/2020", documentoCriacaoId: "decreto-2185-2026", ordem: 1 },
  { id: 2, codigo: "U0002", nome: "Gabinete do Secretário Adjunto de Planejamento e Governo Digital", sigla: "GSAPGD", orgao: "SEPLAG", tipo: "Secretaria Adjunta", nivelOrganizacional: "Nível de Direção Superior", localizacao: "Cuiabá/MT", situacao: "ATIVA", dataInicio: "01/01/2020", documentoCriacaoId: "decreto-2185-2026", unidadeSuperior: "Gabinete do Secretário de Estado de Planejamento e Gestão", ordem: 1 },
  { id: 3, codigo: "U0003", nome: "Superintendência de Modernização Organizacional", sigla: "SUMO", orgao: "SEPLAG", tipo: "Superintendência", nivelOrganizacional: "Nível de Execução Programática", localizacao: "Cuiabá/MT", situacao: "ATIVA", dataInicio: "01/01/2020", documentoCriacaoId: "decreto-2185-2026", unidadeSuperior: "Gabinete do Secretário Adjunto de Planejamento e Governo Digital", ordem: 1 },
  { id: 4, codigo: "U0004", nome: "Coordenadoria de Modelagem Organizacional", sigla: "CMO", orgao: "SEPLAG", tipo: "Coordenadoria", nivelOrganizacional: "Nível de Execução Programática", localizacao: "Cuiabá/MT", situacao: "ATIVA", dataInicio: "01/01/2020", documentoCriacaoId: "decreto-2185-2026", unidadeSuperior: "Gabinete do Secretário Adjunto de Planejamento e Governo Digital", ordem: 2 },
  { id: 5, codigo: "U0005", nome: "Gerência de Otimização de Processos", sigla: "GEOP", orgao: "SEPLAG", tipo: "Gerência", nivelOrganizacional: "Nível de Execução Programática", localizacao: "Cuiabá/MT", situacao: "ATIVA", dataInicio: "01/01/2020", documentoCriacaoId: "decreto-2185-2026", unidadeSuperior: "Gabinete do Secretário Adjunto de Planejamento e Governo Digital", ordem: 3 },
  { id: 6, codigo: "U0006", nome: "Núcleo de Gestão Estratégica para Resultados - NGER", sigla: "NGER", orgao: "SEPLAG", tipo: "Núcleo", nivelOrganizacional: "Nível de Execução Programática", localizacao: "Cuiabá/MT", situacao: "ATIVA", dataInicio: "01/01/2020", documentoCriacaoId: "decreto-2185-2026", unidadeSuperior: "Superintendência de Modernização Organizacional", ordem: 1 },
  { id: 7, codigo: "U0101", nome: "Gabinete do Secretário de Estado de Educação", sigla: "GAB", orgao: "SEDUC", tipo: "Gabinete", nivelOrganizacional: "Nível de Direção Superior", localizacao: "Cuiabá/MT", situacao: "ATIVA", dataInicio: "01/01/2020", documentoCriacaoId: "decreto-2185-2026", ordem: 1 },
  { id: 8, codigo: "U0102", nome: "Superintendência de Gestão de Pessoas", sigla: "SGP", orgao: "SEDUC", tipo: "Superintendência", nivelOrganizacional: "Nível de Execução Programática", localizacao: "Cuiabá/MT", situacao: "ATIVA", dataInicio: "01/01/2020", documentoCriacaoId: "decreto-2185-2026", unidadeSuperior: "Gabinete do Secretário de Estado de Educação", ordem: 1 },
  { id: 9, codigo: "U0103", nome: "Coordenadoria Regional", sigla: "COR", orgao: "SEDUC", tipo: "Coordenadoria", nivelOrganizacional: "Nível de Administração Regionalizada", localizacao: "Rondonópolis/MT", situacao: "ATIVA", dataInicio: "01/01/2020", documentoCriacaoId: "decreto-2185-2026", unidadeSuperior: "Superintendência de Gestão de Pessoas", ordem: 1 },
];

const criarPosicoes = (unidades: UnidadeEstrutural[], versoes: VersaoOrganograma[]) => unidades.map((unidade) => {
  const versao = versoes.find((item) => item.orgao === unidade.orgao && item.situacao === "VIGENTE");
  const superior = unidades.find((item) => item.orgao === unidade.orgao && item.nome === unidade.unidadeSuperior);
  return { id: `posicao-${versao?.id ?? unidade.orgao}-${unidade.id}`, versaoId: versao?.id ?? "", unidadeId: unidade.id, superiorId: superior?.id ?? null, ordem: unidade.ordem, inicio: unidade.dataInicio };
});

const criarEstruturaInicial = (unidades = unidadesPadrao): EstruturaOrganizacionalState => {
  const versoes: VersaoOrganograma[] = [
    { id: "organograma-seplag-2026", orgao: "SEPLAG", codigoOrgao: "001", nome: "Estrutura Organizacional SEPLAG - 2026", documentoLegalId: "decreto-2185-2026", documentoLegal: "Decreto nº 2.185, de 03/07/2026", inicio: "03/07/2026", situacao: "VIGENTE" },
    { id: "organograma-seduc-2026", orgao: "SEDUC", codigoOrgao: "002", nome: "Estrutura Organizacional SEDUC - 2026", documentoLegalId: "decreto-2185-2026", documentoLegal: "Decreto nº 2.185, de 03/07/2026", inicio: "03/07/2026", situacao: "VIGENTE" },
  ];
  return { schemaVersion: 1, unidades, versoes, posicoes: criarPosicoes(unidades, versoes), documentosLegais: documentosPadrao, auditoria: [] };
};

const normalizarUnidade = (unidade: Partial<UnidadeEstrutural>, indice: number): UnidadeEstrutural => ({
  id: unidade.id ?? indice + 1,
  codigo: unidade.codigo ?? `U${String(indice + 1).padStart(4, "0")}`,
  nome: unidade.nome ?? "Unidade sem nome",
  sigla: unidade.sigla ?? "",
  orgao: unidade.orgao ?? "SEPLAG",
  tipo: unidade.tipo ?? "Unidade",
  nivelOrganizacional: unidade.nivelOrganizacional ?? "Nível de Execução Programática",
  localizacao: unidade.localizacao ?? "Cuiabá/MT",
  situacao: unidade.situacao === "EXTINTA" ? "EXTINTA" : unidade.situacao === "INATIVA" ? "INATIVA" : "ATIVA",
  dataInicio: unidade.dataInicio ?? "01/01/2026",
  documentoCriacaoId: unidade.documentoCriacaoId ?? "decreto-2185-2026",
  documentosLegaisCriacaoIds: unidade.documentosLegaisCriacaoIds ?? (unidade.documentoCriacaoId ? [unidade.documentoCriacaoId] : ["decreto-2185-2026"]),
  outraLocalidade: unidade.outraLocalidade ?? false,
  endereco: unidade.endereco,
  unidadeSuperior: unidade.unidadeSuperior,
  ordem: unidade.ordem ?? indice + 1,
});

export const lerEstruturaOrganizacional = (): EstruturaOrganizacionalState => {
  if (typeof window === "undefined") return criarEstruturaInicial();
  try {
    const salva = window.localStorage.getItem(CHAVE_ESTRUTURA);
    if (salva) return JSON.parse(salva) as EstruturaOrganizacionalState;
    const legado = window.localStorage.getItem(CHAVE_LEGADA_UNIDADES);
    const unidades = legado ? (JSON.parse(legado) as Partial<UnidadeEstrutural>[]).map(normalizarUnidade) : unidadesPadrao;
    const estrutura = criarEstruturaInicial(unidades);
    window.localStorage.setItem(CHAVE_ESTRUTURA, JSON.stringify(estrutura));
    return estrutura;
  } catch {
    return criarEstruturaInicial();
  }
};

export const gravarEstruturaOrganizacional = (estrutura: EstruturaOrganizacionalState) => {
  window.localStorage.setItem(CHAVE_ESTRUTURA, JSON.stringify(estrutura));
};

export const gravarUnidadesDaEstrutura = (unidades: UnidadeEstrutural[], acao: EventoAuditoriaEstrutural["acao"] = "EDICAO") => {
  const estruturaAtual = lerEstruturaOrganizacional();
  const versoesVigentes = estruturaAtual.versoes.filter((versao) => versao.situacao === "VIGENTE").map((versao) => versao.id);
  const posicoesHistoricas = estruturaAtual.posicoes.filter((posicao) => !versoesVigentes.includes(posicao.versaoId));
  const posicoesVigentes = criarPosicoes(unidades, estruturaAtual.versoes);
  const estrutura = { ...estruturaAtual, unidades, posicoes: [...posicoesHistoricas, ...posicoesVigentes] };
  estrutura.auditoria = [...estruturaAtual.auditoria, { id: `auditoria-${Date.now()}`, data: new Date().toISOString(), acao, descricao: `${acao} de unidade administrativa` }];
  gravarEstruturaOrganizacional(estrutura);
  return estrutura;
};

export const obterVersaoVigente = (estrutura: EstruturaOrganizacionalState, orgao: string) =>
  estrutura.versoes.find((versao) => versao.orgao === orgao && versao.situacao === "VIGENTE");

export const cadastrarOrganograma = (orgao: string, codigoOrgao: string, inicio: string, documentoLegalId: string, nome?: string) => {
  const estruturaAtual = lerEstruturaOrganizacional();
  if (estruturaAtual.versoes.some((versao) => versao.orgao === orgao && versao.situacao === "RASCUNHO")) return { estrutura: estruturaAtual, criado: false };
  const documento = estruturaAtual.documentosLegais.find((item) => item.id === documentoLegalId);
  const versao: VersaoOrganograma = {
    id: `organograma-${orgao.toLowerCase()}-${Date.now()}`,
    orgao,
    codigoOrgao,
    nome: nome?.trim() || `Estrutura Organizacional ${orgao}`,
    documentoLegalId,
    documentoLegal: documento?.titulo ?? "Documento legal não informado",
    inicio,
    situacao: "RASCUNHO",
  };
  const estrutura = { ...estruturaAtual, versoes: [...estruturaAtual.versoes, versao], auditoria: [...estruturaAtual.auditoria, { id: `auditoria-${Date.now()}`, data: new Date().toISOString(), acao: "CADASTRO" as const, descricao: `Cadastro do organograma do órgão ${orgao}` }] };
  gravarEstruturaOrganizacional(estrutura);
  return { estrutura, criado: true, versao };
};

const inserirPosicao = (estrutura: EstruturaOrganizacionalState, versaoId: string, unidadeId: number, superiorId: number | null, ordem: number) => {
  const irmas = estrutura.posicoes.filter((posicao) => posicao.versaoId === versaoId && posicao.superiorId === superiorId);
  const ordemInsercao = Math.max(1, Math.min(ordem, irmas.length + 1));
  const posicoes = estrutura.posicoes.map((posicao) => posicao.versaoId === versaoId && posicao.superiorId === superiorId && posicao.ordem >= ordemInsercao ? { ...posicao, ordem: posicao.ordem + 1 } : posicao);
  return [...posicoes, { id: `posicao-${versaoId}-${unidadeId}`, versaoId, unidadeId, superiorId, ordem: ordemInsercao, inicio: estrutura.versoes.find((versao) => versao.id === versaoId)?.inicio ?? "" }];
};

export const vincularUnidadeAoOrganograma = (versaoId: string, unidadeId: number, superiorId: number | null, ordem: number) => {
  const estruturaAtual = lerEstruturaOrganizacional();
  if (estruturaAtual.posicoes.some((posicao) => posicao.versaoId === versaoId && posicao.unidadeId === unidadeId)) return estruturaAtual;
  const unidade = estruturaAtual.unidades.find((item) => item.id === unidadeId);
  if (!unidade) return estruturaAtual;
  const estrutura = { ...estruturaAtual, posicoes: inserirPosicao(estruturaAtual, versaoId, unidadeId, superiorId, ordem), auditoria: [...estruturaAtual.auditoria, { id: `auditoria-${Date.now()}`, data: new Date().toISOString(), acao: "ESTRUTURA" as const, unidadeId, descricao: `Unidade ${unidade.nome} vinculada ao organograma` }] };
  gravarEstruturaOrganizacional(estrutura);
  return estrutura;
};

export const cadastrarUnidadeNoOrganograma = (versaoId: string, dados: Omit<UnidadeEstrutural, "id" | "ordem" | "unidadeSuperior">, superiorId: number | null, ordem: number) => {
  const estruturaAtual = lerEstruturaOrganizacional();
  const id = Math.max(0, ...estruturaAtual.unidades.map((unidade) => unidade.id)) + 1;
  const unidade: UnidadeEstrutural = { ...dados, id, ordem, codigo: dados.codigo || `U${String(id).padStart(4, "0")}` };
  const estruturaParcial = { ...estruturaAtual, unidades: [...estruturaAtual.unidades, unidade] };
  const estrutura = { ...estruturaParcial, posicoes: inserirPosicao(estruturaParcial, versaoId, id, superiorId, ordem), auditoria: [...estruturaAtual.auditoria, { id: `auditoria-${Date.now()}`, data: new Date().toISOString(), acao: "CADASTRO" as const, unidadeId: id, descricao: `Unidade ${unidade.nome} cadastrada no organograma` }] };
  gravarEstruturaOrganizacional(estrutura);
  return estrutura;
};

export const publicarOrganograma = (versaoId: string) => {
  const estruturaAtual = lerEstruturaOrganizacional();
  const rascunho = estruturaAtual.versoes.find((versao) => versao.id === versaoId && versao.situacao === "RASCUNHO");
  if (!rascunho) return estruturaAtual;
  const versoes = estruturaAtual.versoes.map((versao) => versao.orgao !== rascunho.orgao ? versao : versao.id === versaoId ? { ...versao, situacao: "VIGENTE" as const } : versao.situacao === "VIGENTE" ? { ...versao, situacao: "ENCERRADA" as const, fim: rascunho.inicio } : versao);
  const estrutura = { ...estruturaAtual, versoes, auditoria: [...estruturaAtual.auditoria, { id: `auditoria-${Date.now()}`, data: new Date().toISOString(), acao: "ESTRUTURA" as const, descricao: `Publicação do organograma ${rascunho.nome}` }] };
  gravarEstruturaOrganizacional(estrutura);
  return estrutura;
};

export const obterUnidadesDaVersao = (estrutura: EstruturaOrganizacionalState, versaoId: string): UnidadeNoOrganograma[] => {
  return estrutura.posicoes
    .filter((posicao) => posicao.versaoId === versaoId)
    .map((posicao) => {
      const unidade = estrutura.unidades.find((item) => item.id === posicao.unidadeId);
      return unidade ? { ...unidade, superiorId: posicao.superiorId, ordem: posicao.ordem, versaoId } : null;
    })
    .filter((unidade): unidade is UnidadeNoOrganograma => unidade !== null)
    .sort((a, b) => a.ordem - b.ordem);
};

export const obterUnidadesNoOrganograma = (estrutura: EstruturaOrganizacionalState, orgao: string) => {
  const versao = obterVersaoVigente(estrutura, orgao);
  return versao ? obterUnidadesDaVersao(estrutura, versao.id) : [];
};

export const criarNovaVersaoEstrutural = (unidades: UnidadeEstrutural[], orgao: string, inicio: string, documentoLegalId: string, justificativa?: string) => {
  const estruturaAtual = lerEstruturaOrganizacional();
  const versaoAtual = obterVersaoVigente(estruturaAtual, orgao);
  if (!versaoAtual) return estruturaAtual;
  const documento = estruturaAtual.documentosLegais.find((item) => item.id === documentoLegalId);
  const versaoAnterior = { ...versaoAtual, fim: inicio, situacao: "ENCERRADA" as const };
  const novaVersao: VersaoOrganograma = {
    id: `organograma-${orgao.toLowerCase()}-${Date.now()}`,
    orgao,
    nome: `${versaoAtual.nome} - revisão ${inicio}`,
    documentoLegalId,
    documentoLegal: documento?.titulo ?? "Documento legal não informado",
    inicio,
    situacao: "VIGENTE",
    justificativa,
  };
  const posicoesAnteriores = estruturaAtual.posicoes.map((posicao) => posicao.versaoId === versaoAtual.id ? { ...posicao, fim: inicio } : posicao);
  const versoesAtualizadas = estruturaAtual.versoes.map((versao) => versao.id === versaoAtual.id ? versaoAnterior : versao).concat(novaVersao);
  const posicoesNovas = criarPosicoes(unidades.filter((unidade) => unidade.orgao === orgao), [novaVersao]);
  const estrutura: EstruturaOrganizacionalState = {
    ...estruturaAtual,
    unidades,
    versoes: versoesAtualizadas,
    posicoes: [...posicoesAnteriores, ...posicoesNovas],
    auditoria: [...estruturaAtual.auditoria, { id: `auditoria-${Date.now()}`, data: new Date().toISOString(), acao: "ESTRUTURA", descricao: `Nova versão estrutural do órgão ${orgao}` }],
  };
  gravarEstruturaOrganizacional(estrutura);
  return estrutura;
};

export const extinguirUnidadeDaEstrutura = (unidadeId: number, dataFim: string, documentoExtincaoId: string, justificativaExtincao: string) => {
  const estruturaAtual = lerEstruturaOrganizacional();
  const unidade = estruturaAtual.unidades.find((item) => item.id === unidadeId);
  if (!unidade) return estruturaAtual;
  const unidades = estruturaAtual.unidades.map((item) => item.id === unidadeId ? { ...item, situacao: "EXTINTA" as const, dataFim, documentoExtincaoId, justificativaExtincao } : item);
  const estrutura = { ...estruturaAtual, unidades, auditoria: [...estruturaAtual.auditoria, { id: `auditoria-${Date.now()}`, data: new Date().toISOString(), acao: "EXTINCAO" as const, unidadeId, descricao: `Extinção da unidade ${unidade.nome}: ${justificativaExtincao}` }] };
  gravarEstruturaOrganizacional(estrutura);
  return estrutura;
};

export const excluirUnidadeDaEstrutura = (unidadeId: number) => {
  const estruturaAtual = lerEstruturaOrganizacional();
  const unidade = estruturaAtual.unidades.find((item) => item.id === unidadeId);
  if (!unidade) return estruturaAtual;
  const estrutura = {
    ...estruturaAtual,
    unidades: estruturaAtual.unidades.filter((item) => item.id !== unidadeId),
    posicoes: estruturaAtual.posicoes.filter((item) => item.unidadeId !== unidadeId),
    auditoria: [...estruturaAtual.auditoria, { id: `auditoria-${Date.now()}`, data: new Date().toISOString(), acao: "EXCLUSAO" as const, unidadeId, descricao: `Exclusão do cadastro indevido ${unidade.nome}` }],
  };
  gravarEstruturaOrganizacional(estrutura);
  return estrutura;
};
