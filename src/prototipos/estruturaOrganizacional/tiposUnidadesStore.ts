export type SituacaoTipoUnidadeEstrutural = "ATIVO" | "INATIVO";

export interface TipoUnidadeEstrutural {
  id: number;
  nome: string;
  descricao: string;
  situacao: SituacaoTipoUnidadeEstrutural;
}

const CHAVE_TIPOS_UNIDADE = "sigep-prototipo-tipos-unidades-v1";
const padrao: TipoUnidadeEstrutural[] = [
  { id: 1, nome: "Gabinete", descricao: "Unidade de apoio e direção vinculada às estruturas de gestão.", situacao: "ATIVO" },
  { id: 2, nome: "Secretaria Adjunta", descricao: "Estrutura de direção adjunta do órgão.", situacao: "ATIVO" },
  { id: 3, nome: "Superintendência", descricao: "Unidade organizacional de coordenação e supervisão.", situacao: "ATIVO" },
  { id: 4, nome: "Coordenadoria", descricao: "Unidade responsável pela coordenação de atividades específicas.", situacao: "ATIVO" },
  { id: 5, nome: "Gerência", descricao: "Unidade responsável pela execução e gestão de atividades operacionais.", situacao: "ATIVO" },
  { id: 6, nome: "Núcleo", descricao: "Unidade de apoio ou execução especializada.", situacao: "ATIVO" },
  { id: 7, nome: "Unidade", descricao: "Classificação genérica para unidades administrativas específicas.", situacao: "ATIVO" },
  { id: 8, nome: "Conselho", descricao: "Estrutura colegiada prevista na organização institucional.", situacao: "ATIVO" },
  { id: 9, nome: "Comissão", descricao: "Estrutura colegiada de natureza específica ou temporária.", situacao: "ATIVO" },
  { id: 10, nome: "Ouvidoria", descricao: "Unidade responsável por atividades de ouvidoria.", situacao: "ATIVO" },
  { id: 11, nome: "Diretoria", descricao: "Unidade de direção prevista na estrutura do órgão.", situacao: "ATIVO" },
];

export const lerTiposUnidades = (): TipoUnidadeEstrutural[] => {
  if (typeof window === "undefined") return padrao;
  try { return JSON.parse(window.localStorage.getItem(CHAVE_TIPOS_UNIDADE) ?? "null") ?? padrao; } catch { return padrao; }
};

export const gravarTiposUnidades = (tipos: TipoUnidadeEstrutural[]) => {
  window.localStorage.setItem(CHAVE_TIPOS_UNIDADE, JSON.stringify(tipos));
};

export const tiposUnidadesAtivos = () => lerTiposUnidades().filter((tipo) => tipo.situacao === "ATIVO").map((tipo) => tipo.nome);
