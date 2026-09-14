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

export function listarQuadrosComissionados(): QuadroComissionadoSalvo[] {
  try {
    const valor = window.localStorage.getItem(CHAVE_CADASTROS);
    if (valor) return JSON.parse(valor) as QuadroComissionadoSalvo[];
    const rascunho = window.localStorage.getItem(CHAVE_RASCUNHO);
    return rascunho ? [JSON.parse(rascunho) as QuadroComissionadoSalvo] : [];
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
