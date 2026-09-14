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

const CHAVE = "sigep:quadros-comissionados:rascunho:v1";

export function lerRascunhoQuadroComissionado(): QuadroComissionadoSalvo | null {
  try {
    const valor = window.localStorage.getItem(CHAVE);
    return valor ? JSON.parse(valor) as QuadroComissionadoSalvo : null;
  } catch {
    return null;
  }
}

export function salvarRascunhoQuadroComissionado(quadro: QuadroComissionadoSalvo) {
  window.localStorage.setItem(CHAVE, JSON.stringify(quadro));
}
