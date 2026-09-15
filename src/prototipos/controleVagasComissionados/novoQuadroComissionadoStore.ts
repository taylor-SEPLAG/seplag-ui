export interface DotacaoComissionadaSalva {
  id: string;
  perfil: string;
  simbologia: string;
  cargos: number;
  funcoes: number;
}

export interface ItemEstruturaComissionadaSalvo {
  id: string;
  nome: string;
  dotacoes: DotacaoComissionadaSalva[];
  subitens: ItemEstruturaComissionadaSalvo[];
}

export interface NivelComissionadoSalvo {
  id: string;
  nome: string;
  itens: ItemEstruturaComissionadaSalvo[];
}

export interface QuadroComissionadoSalvo {
  id: string;
  nome: string;
  orgao: string;
  dataVigencia: string;
  documentosLegaisIds: string[];
  niveis: NivelComissionadoSalvo[];
  salvoEm: string;
}

const CHAVE_RASCUNHO = "sigep:quadros-comissionados:rascunho:v1";
const CHAVE_CADASTROS = "sigep:quadros-comissionados:cadastros:v1";
const quadroPolitec2026: QuadroComissionadoSalvo = {
  id: "quadro-politec-decreto-2252-2026",
  nome: "Estrutura organizacional da POLITEC — Decreto nº 2.252/2026",
  orgao: "POLITEC",
  dataVigencia: "2026-09-11",
  documentosLegaisIds: ["decreto-2252-2026"],
  salvoEm: "2026-09-11T12:00:00.000Z",
  niveis: [
    { id: "politec-decisao", nome: "Nível de Decisão Colegiada", itens: [{ id: "politec-conselho", nome: "Conselho de Política Científica e Tecnológica", dotacoes: [], subitens: [] }] },
    { id: "politec-direcao", nome: "Nível de Direção Superior", itens: [
      { id: "politec-dg", nome: "Diretoria-Geral da POLITEC", dotacoes: [{ id: "politec-dg-diretor", perfil: "Diretor-Geral", simbologia: "DGA-2", cargos: 0, funcoes: 1 }, { id: "politec-dg-assistente", perfil: "Assistente Técnico I", simbologia: "DGA-8", cargos: 1, funcoes: 0 }], subitens: [{ id: "politec-dga", nome: "Diretoria-Geral Adjunta da POLITEC", dotacoes: [{ id: "politec-dga-diretor", perfil: "Diretor-Geral Adjunto", simbologia: "DGA-3", cargos: 0, funcoes: 1 }, { id: "politec-dga-assistente", perfil: "Assistente Técnico I", simbologia: "DGA-8", cargos: 1, funcoes: 0 }], subitens: [] }] },
    ] },
    { id: "politec-apoio", nome: "Nível de Apoio Estratégico e Especializado", itens: [{ id: "politec-apoio-itens", nome: "Corregedoria, Ouvidoria, Gestão Executiva, Inteligência, Academia, Planejamento e Qualidade", dotacoes: [{ id: "politec-apoio-dga3", perfil: "Dotações autorizadas do Anexo I — DGA-3", simbologia: "DGA-3", cargos: 2, funcoes: 0 }, { id: "politec-apoio-dga4", perfil: "Dotações autorizadas do Anexo I — DGA-4", simbologia: "DGA-4", cargos: 0, funcoes: 2 }, { id: "politec-apoio-dga5", perfil: "Dotações autorizadas do Anexo I — DGA-5", simbologia: "DGA-5", cargos: 2, funcoes: 5 }, { id: "politec-apoio-dga6", perfil: "Dotações autorizadas do Anexo I — DGA-6", simbologia: "DGA-6", cargos: 3, funcoes: 2 }, { id: "politec-apoio-dga8", perfil: "Dotações autorizadas do Anexo I — DGA-8", simbologia: "DGA-8", cargos: 5, funcoes: 3 }, { id: "politec-apoio-dga9", perfil: "Agente de Inteligência", simbologia: "DGA-9", cargos: 0, funcoes: 4 }], subitens: [] }] },
    { id: "politec-assessoramento", nome: "Nível de Assessoramento Superior", itens: [{ id: "politec-assessoramento-itens", nome: "Gabinete de Direção, Unidade de Assessoria e Unidade Estratégica Consultiva", dotacoes: [{ id: "politec-assessoramento-dga2", perfil: "Consultor Estratégico Institucional de Segurança Pública", simbologia: "DGA-2", cargos: 0, funcoes: 2 }, { id: "politec-assessoramento-dga5", perfil: "Dotações autorizadas do Anexo I — DGA-5", simbologia: "DGA-5", cargos: 1, funcoes: 1 }, { id: "politec-assessoramento-dga6", perfil: "Assessor Técnico III", simbologia: "DGA-6", cargos: 2, funcoes: 0 }, { id: "politec-assessoramento-dga8", perfil: "Assistente Técnico I", simbologia: "DGA-8", cargos: 2, funcoes: 0 }, { id: "politec-assessoramento-dga10", perfil: "Assistente de Direção", simbologia: "DGA-10", cargos: 0, funcoes: 2 }], subitens: [] }] },
    { id: "politec-administracao", nome: "Nível de Administração Sistêmica", itens: [{ id: "politec-administracao-itens", nome: "Diretoria de Administração Sistêmica, coordenadorias e gerências", dotacoes: [{ id: "politec-adm-dga4", perfil: "Diretor da POLITEC", simbologia: "DGA-4", cargos: 0, funcoes: 1 }, { id: "politec-adm-dga5", perfil: "Coordenadores e assessores", simbologia: "DGA-5", cargos: 5, funcoes: 0 }, { id: "politec-adm-dga6", perfil: "Gerentes", simbologia: "DGA-6", cargos: 11, funcoes: 1 }, { id: "politec-adm-dga8", perfil: "Chefes de Núcleo II", simbologia: "DGA-8", cargos: 2, funcoes: 0 }], subitens: [] }] },
    { id: "politec-execucao", nome: "Nível de Execução Programática", itens: [{ id: "politec-execucao-itens", nome: "Criminalística, Medicina Legal, Laboratório Forense e Identificação Técnica", dotacoes: [{ id: "politec-exec-dga4", perfil: "Diretores da POLITEC", simbologia: "DGA-4", cargos: 0, funcoes: 4 }, { id: "politec-exec-dga5", perfil: "Coordenadores", simbologia: "DGA-5", cargos: 0, funcoes: 9 }, { id: "politec-exec-dga6", perfil: "Gerentes", simbologia: "DGA-6", cargos: 0, funcoes: 31 }, { id: "politec-exec-dga8", perfil: "Assistentes e Chefes de Núcleo II", simbologia: "DGA-8", cargos: 6, funcoes: 3 }], subitens: [] }] },
    { id: "politec-regional", nome: "Nível de Administração Regionalizada", itens: [{ id: "politec-regional-itens", nome: "Diretoria de Interiorização, coordenadorias e gerências regionais", dotacoes: [{ id: "politec-regional-dga4", perfil: "Diretor da POLITEC", simbologia: "DGA-4", cargos: 0, funcoes: 1 }, { id: "politec-regional-dga5", perfil: "Coordenadores regionais", simbologia: "DGA-5", cargos: 0, funcoes: 4 }, { id: "politec-regional-dga6", perfil: "Gerentes regionais", simbologia: "DGA-6", cargos: 1, funcoes: 29 }, { id: "politec-regional-dga8", perfil: "Assistentes Técnicos I", simbologia: "DGA-8", cargos: 9, funcoes: 3 }], subitens: [] }] },
  ],
};

export function listarQuadrosComissionados(): QuadroComissionadoSalvo[] {
  try {
    const valor = window.localStorage.getItem(CHAVE_CADASTROS);
    if (valor) {
      const quadros = JSON.parse(valor) as QuadroComissionadoSalvo[];
      return quadros.some((quadro) => quadro.id === quadroPolitec2026.id) ? quadros : [...quadros, quadroPolitec2026];
    }
    const rascunho = window.localStorage.getItem(CHAVE_RASCUNHO);
    return rascunho ? [JSON.parse(rascunho) as QuadroComissionadoSalvo] : [quadroPolitec2026];
  } catch {
    return [];
  }
}

export function lerRascunhoQuadroComissionado(): QuadroComissionadoSalvo | null {
  try {
    const valor = window.localStorage.getItem(CHAVE_RASCUNHO);
    return valor ? JSON.parse(valor) as QuadroComissionadoSalvo : null;
  } catch {
    return null;
  }
}

export function salvarRascunhoQuadroComissionado(quadro: QuadroComissionadoSalvo) {
  window.localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(quadro));
  const quadros = listarQuadrosComissionados();
  const indice = quadros.findIndex((item) => item.id === quadro.id);
  if (indice >= 0) quadros[indice] = quadro;
  else quadros.push(quadro);
  window.localStorage.setItem(CHAVE_CADASTROS, JSON.stringify(quadros));
}

export function prepararNovoQuadroComissionado() {
  window.localStorage.removeItem(CHAVE_RASCUNHO);
}

export function prepararEdicaoQuadroComissionado(id: string) {
  const quadro = listarQuadrosComissionados().find((item) => item.id === id);
  if (quadro) window.localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(quadro));
}



