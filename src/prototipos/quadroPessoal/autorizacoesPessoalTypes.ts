export type ModoControlePessoal = "LIMITE_QUANTITATIVO" | "POSICOES_INDIVIDUALIZADAS" | "SEM_LIMITE";
export type SituacaoAutorizacaoPessoal = "VIGENCIA_FUTURA" | "VIGENTE" | "SUSPENSA" | "ENCERRADA" | "REVOGADA";
export type SituacaoPosicaoPessoal = "DISPONIVEL" | "OCUPADA" | "RESERVADA" | "SUSPENSA" | "ENCERRADA";

export interface VersaoAutorizacaoPessoal {
  versao:number;
  registradaEm:string;
  inicioVigencia:string;
  fimVigencia?:string;
  limite?:number;
  motivo:string;
}

export interface LocalAtuacaoAutorizado {
  orgao:string;
  unidades:string[];
}

export interface AutorizacaoPessoal {
  id:number;
  codigo:string;
  versao:number;
  tipoInstrumento:string;
  documentosLegaisIds:string[];
  processoSigadoc:string;
  tipoVinculo:string;
  regimeNatureza:string;
  modoControle:ModoControlePessoal;
  programaProjeto:string;
  objetoFinalidade:string;
  carreiraReferencia?:string;
  cargoReferencia?:string;
  orgaoResponsavel:string;
  unidades:string[];
  limite?:number;
  vinculosAtivos:number;
  ingressosAndamento:number;
  inicioVigencia:string;
  fimVigencia?:string;
  permiteProrrogacao:boolean;
  prazoProrrogacaoMeses?:number;
  fonteRecurso?:string;
  unidadeOrcamentaria?:string;
  centroCusto?:string;
  observacoes?:string;
  situacao:SituacaoAutorizacaoPessoal;
  criadoEm:string;
  atualizadoEm:string;
  historicoVersoes:VersaoAutorizacaoPessoal[];
}

export interface HistoricoOcupacaoPosicao {
  id:string;
  pessoa:string;
  matricula:string;
  vinculo:string;
  inicio:string;
  fim?:string;
}

export interface PosicaoPessoal {
  id:string;
  sequencial:number;
  autorizacaoId:number;
  autorizacaoCodigo:string;
  tipoVinculo:string;
  programaProjeto:string;
  objetoFinalidade:string;
  orgao:string;
  unidade?:string;
  situacao:SituacaoPosicaoPessoal;
  ocupanteAtual?:string;
  inicioOcupacao?:string;
  fimPrevisto?:string;
  criadaEm:string;
  historicoOcupacoes:HistoricoOcupacaoPosicao[];
}





