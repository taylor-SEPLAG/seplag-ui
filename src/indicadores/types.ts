export type EstadoHistoria =
  "Não iniciada" | "Em andamento" | "Finalizada" | "Não informado" | string;
export interface HistoriaProjeto {
  id: string;
  codigo: string;
  titulo: string;
  sprint: number;
  menu: string | null;
  modulo: string | null;
  squads: string[];
  analistas: string[];
  desenvolvedores: string[];
  qa: string[];
  situacao: EstadoHistoria;
  situacaoOriginal: string | null;
  andamentoOriginal: string | null;
  pontos: number | null;
  dependencias: string[];
  periodoOriginal: string;
  redmine: string | null;
  documento: string | null;
  observacoes: string | null;
  ambiente: string | null;
  qaSituacao: string | null;
  homologacao: string | null;
  aba: string;
  linhas: number[];
}
export interface SprintProjeto {
  numero: number;
  inicio: string;
  fim: string | null;
  periodo: string;
  aba: string;
}
export interface AvisoDados {
  tipo: "periodo" | "duplicidade" | "exclusao" | "estrutura";
  mensagem: string;
  sprint?: number;
  linhas?: number[];
}
export interface DadosProjeto {
  versao: 1;
  arquivo: string;
  importadoEm: string;
  historias: HistoriaProjeto[];
  sprints: SprintProjeto[];
  avisos: AvisoDados[];
  historicosIgnorados: number;
  removidas: number;
}
export interface FiltrosProjeto {
  inicial: number;
  final: number;
  comparar: boolean;
  squad: string;
  analista: string;
  desenvolvedor: string;
  modulo: string;
  situacao: string;
}
export type DimensaoProjeto =
  "analistas" | "desenvolvedores" | "modulo" | "squads";
export type MetricaGrupo =
  "distintas" | "registros" | "pontos" | "concluidas" | "modulos";
export interface ResumoProjeto {
  distintas: number;
  registros: number;
  concluidas: number | null;
  pontos: number;
  pontosConcluidos: number | null;
  pontuadas: number;
  semPontos: number;
  semDev: number;
  semSituacao: number;
  conhecidas: number;
  desenvolvedores: number;
  reaparecidas: number;
  novas: number;
  media: number | null;
  taxaConclusao: number | null;
  oitoOuMais: number | null;
}
export interface GrupoProjeto extends ResumoProjeto {
  nome: string;
  historias: HistoriaProjeto[];
}
export interface InsightProjeto {
  id: string;
  titulo: string;
  valor: string;
  explicacao: string;
  impacto: string;
  pergunta: string;
  tom: "info" | "alerta" | "positivo";
  historias: HistoriaProjeto[];
}
export interface CapacityEntrada {
  pessoas: number | null;
  dias: number | null;
  jornada: number | null;
  dedicacao: number | null;
  suporte: number;
  afastamentos: number;
  outras: number;
}
export interface CapacityResultado {
  bruta: number;
  alocada: number;
  indisponivel: number;
  liquida: number;
  fte: number;
  excesso: boolean;
}
