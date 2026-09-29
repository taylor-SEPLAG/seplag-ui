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
  const ramosPorFaixa = 3;
  const larguraFaixa = 360;
  const espacoEntreFaixas = 36;
  const espacamentoVertical = 34;
  const inicioX = 72;
  const inicioY = 258;
  const visitadas = new Set<number>();

  // Cada ramo principal ocupa uma faixa vertical. A abordagem privilegia
  // leitura e compactação: irmãos ficam em sequência no próprio ramo, sem
  // disputar espaço horizontal com os descendentes de outras diretorias.
  const contarNoRamo = (unidade: typeof unidades[number], ancestrais = new Set<number>()): number => {
    if (ancestrais.has(unidade.id)) return 0;
    const proximaTrilha = new Set(ancestrais).add(unidade.id);
    return 1 + (filhos.get(unidade.id) ?? []).reduce((total, filho) => total + contarNoRamo(filho, proximaTrilha), 0);
  };
  const posicionarNoRamo = (unidade: typeof unidades[number], xFaixa: number, yInicial: number, ordem: { atual: number }, nivel = 0, ancestrais = new Set<number>()) => {
    if (ancestrais.has(unidade.id)) return;
    const proximaTrilha = new Set(ancestrais).add(unidade.id);
    coordenadas[unidade.id] = { x: xFaixa + Math.min(nivel * 20, larguraFaixa - larguraNo), y: yInicial + ordem.atual * (alturaNo + espacamentoVertical) };
    ordem.atual += 1;
    visitadas.add(unidade.id);
    (filhos.get(unidade.id) ?? []).filter((filho) => !proximaTrilha.has(filho.id)).forEach((filho) => {
      posicionarNoRamo(filho, xFaixa, yInicial, ordem, nivel + 1, proximaTrilha);
    });
  };

  const raizes = [...(filhos.get(null) ?? [])];
  // Dados incompletos não podem quebrar o desenho: unidades sem ancestral
  // válido entram como uma nova raiz ao fim da árvore.
  unidades.filter((unidade) => unidade.superiorId !== null && !unidades.some((possivelSuperior) => possivelSuperior.id === unidade.superiorId)).forEach((unidade) => raizes.push(unidade));
  const raizPrincipal = raizes.shift();
  const larguraTotal = ramosPorFaixa * larguraFaixa + (ramosPorFaixa - 1) * espacoEntreFaixas;
  if (raizPrincipal) {
    coordenadas[raizPrincipal.id] = { x: inicioX + (larguraTotal - larguraNo) / 2, y: 64 };
    visitadas.add(raizPrincipal.id);
  }
  const ramos = [
    ...(raizPrincipal ? filhos.get(raizPrincipal.id) ?? [] : []),
    ...raizes,
    ...unidades.filter((unidade) => unidade.superiorId !== null && !unidades.some((possivelSuperior) => possivelSuperior.id === unidade.superiorId)),
  ].filter((unidade, indice, lista) => lista.findIndex((item) => item.id === unidade.id) === indice);
  // Unidades estratégicas aparecem antes das diretorias; as diretorias, que
  // normalmente são os ramos extensos, passam a formar as faixas seguintes.
  ramos.sort((a, b) => Number(a.tipo === "Diretoria") - Number(b.tipo === "Diretoria") || a.ordem - b.ordem);
  let yDaFaixa = inicioY;
  for (let inicio = 0; inicio < ramos.length; inicio += ramosPorFaixa) {
    const faixa = ramos.slice(inicio, inicio + ramosPorFaixa);
    faixa.forEach((ramo, indice) => posicionarNoRamo(ramo, inicioX + indice * (larguraFaixa + espacoEntreFaixas), yDaFaixa, { atual: 0 }));
    const maiorRamo = Math.max(...faixa.map((ramo) => contarNoRamo(ramo)));
    yDaFaixa += maiorRamo * (alturaNo + espacamentoVertical) + 96;
  }
  unidades.filter((unidade) => !visitadas.has(unidade.id)).forEach((unidade) => {
    posicionarNoRamo(unidade, inicioX, yDaFaixa, { atual: 0 });
    yDaFaixa += contarNoRamo(unidade) * (alturaNo + espacamentoVertical) + 96;
  });
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
