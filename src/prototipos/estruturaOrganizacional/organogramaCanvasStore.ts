import {
  lerEstruturaOrganizacional,
  obterUnidadesDaVersao,
  type EstruturaOrganizacionalState,
  type PosicaoEstrutural,
  type UnidadeEstrutural,
} from "./estruturaOrganizacionalStore";

export type CoordenadaNoOrganograma = { x: number; y: number };

export interface OrganogramaCanvasState {
  estrutura: EstruturaOrganizacionalState;
  coordenadas: Record<string, Record<number, CoordenadaNoOrganograma>>;
}

const chave = "sigep-prototipo-organograma-canvas-v1";
const larguraNo = 224;
const alturaNo = 112;

const clonar = <T,>(valor: T): T => structuredClone(valor);

function ajustarPolitec(estrutura: EstruturaOrganizacionalState) {
  const versao = estrutura.versoes.find((item) => item.id === "organograma-politec-2026");
  const diretoriaGeral = estrutura.unidades.find((item) => item.orgao === "POLITEC" && item.nome === "Diretoria-Geral da POLITEC");
  if (!versao || !diretoriaGeral) return estrutura;
  const posicoes = estrutura.posicoes.map((posicao) => {
    if (posicao.versaoId !== versao.id || posicao.unidadeId === diretoriaGeral.id || posicao.superiorId !== null) return posicao;
    return { ...posicao, superiorId: diretoriaGeral.id };
  });
  return { ...estrutura, posicoes };
}

function organizarVersao(estrutura: EstruturaOrganizacionalState, versaoId: string): Record<number, CoordenadaNoOrganograma> {
  const unidades = obterUnidadesDaVersao(estrutura, versaoId);
  const filhos = new Map<number | null, typeof unidades>();
  unidades.forEach((unidade) => filhos.set(unidade.superiorId, [...(filhos.get(unidade.superiorId) ?? []), unidade]));
  filhos.forEach((lista) => lista.sort((a, b) => a.ordem - b.ordem));
  const coordenadas: Record<number, CoordenadaNoOrganograma> = {};
  const profundidade = new Map<number, number>();
  const visitar = (unidade: typeof unidades[number], nivel: number) => {
    profundidade.set(unidade.id, nivel);
    (filhos.get(unidade.id) ?? []).forEach((filho) => visitar(filho, nivel + 1));
  };
  (filhos.get(null) ?? []).forEach((raiz) => visitar(raiz, 0));
  const porNivel = new Map<number, typeof unidades>();
  unidades.forEach((unidade) => {
    const nivel = profundidade.get(unidade.id) ?? 0;
    porNivel.set(nivel, [...(porNivel.get(nivel) ?? []), unidade]);
  });
  porNivel.forEach((lista, nivel) => lista.forEach((unidade, indice) => {
    const colunas = nivel === 0 ? 1 : nivel === 1 ? 4 : 5;
    const linha = Math.floor(indice / colunas);
    const coluna = indice % colunas;
    coordenadas[unidade.id] = {
      x: 72 + coluna * (larguraNo + 48) + (nivel % 2 ? 0 : 28),
      y: 64 + nivel * 190 + linha * 142,
    };
  }));
  return coordenadas;
}

function criarEstado(): OrganogramaCanvasState {
  const estrutura = ajustarPolitec(clonar(lerEstruturaOrganizacional()));
  return {
    estrutura,
    coordenadas: Object.fromEntries(estrutura.versoes.map((versao) => [versao.id, organizarVersao(estrutura, versao.id)])),
  };
}

export function lerOrganogramaCanvas(): OrganogramaCanvasState {
  try {
    const salvo = window.localStorage.getItem(chave);
    return salvo ? JSON.parse(salvo) as OrganogramaCanvasState : criarEstado();
  } catch {
    return criarEstado();
  }
}

export function salvarOrganogramaCanvas(estado: OrganogramaCanvasState) {
  window.localStorage.setItem(chave, JSON.stringify(estado));
  return estado;
}

export function moverNoCanvas(estado: OrganogramaCanvasState, versaoId: string, unidadeId: number, coordenada: CoordenadaNoOrganograma) {
  return salvarOrganogramaCanvas({ ...estado, coordenadas: { ...estado.coordenadas, [versaoId]: { ...estado.coordenadas[versaoId], [unidadeId]: coordenada } } });
}

export function reorganizarCanvas(estado: OrganogramaCanvasState, versaoId: string) {
  return salvarOrganogramaCanvas({ ...estado, coordenadas: { ...estado.coordenadas, [versaoId]: organizarVersao(estado.estrutura, versaoId) } });
}

export function adicionarUnidadeNoCanvas(estado: OrganogramaCanvasState, versaoId: string, dados: Pick<UnidadeEstrutural, "nome" | "tipo" | "nivelOrganizacional">, superiorId: number | null) {
  const id = Math.max(0, ...estado.estrutura.unidades.map((unidade) => unidade.id)) + 1;
  const versao = estado.estrutura.versoes.find((item) => item.id === versaoId);
  if (!versao) return estado;
  const irmas = estado.estrutura.posicoes.filter((posicao) => posicao.versaoId === versaoId && posicao.superiorId === superiorId);
  const unidade: UnidadeEstrutural = { id, codigo: `U${String(id).padStart(4, "0")}`, sigla: "", orgao: versao.orgao, nome: dados.nome.trim(), tipo: dados.tipo, nivelOrganizacional: dados.nivelOrganizacional, localizacao: "Cuiabá/MT", situacao: "ATIVA", dataInicio: versao.inicio, documentoCriacaoId: versao.documentoLegalId, documentosLegaisCriacaoIds: [versao.documentoLegalId], ordem: irmas.length + 1 };
  const posicao: PosicaoEstrutural = { id: `canvas-posicao-${versaoId}-${id}`, versaoId, unidadeId: id, superiorId, ordem: irmas.length + 1, inicio: versao.inicio };
  const estrutura = { ...estado.estrutura, unidades: [...estado.estrutura.unidades, unidade], posicoes: [...estado.estrutura.posicoes, posicao] };
  const coordenadas = { ...estado.coordenadas, [versaoId]: organizarVersao(estrutura, versaoId) };
  return salvarOrganogramaCanvas({ estrutura, coordenadas });
}
