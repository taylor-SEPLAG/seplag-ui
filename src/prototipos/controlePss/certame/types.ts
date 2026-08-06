export type TipoCertame = "CONCURSO_PUBLICO" | "PSS";
export type RegimeJuridicoCertame = "ESTATUTARIO" | "CELETISTA" | "ESPECIAL";
export type TipoVinculoCertame = "EFETIVO" | "CONTRATO_TEMPORARIO" | "BOLSISTA";
export type AbrangenciaCertame = "ESTADUAL" | "REGIONAL" | "MUNICIPAL";
export type TipoContratacaoExecucaoCertame = "PROPRIA_UG" | "EMPRESA_CONTRATADA";
export type VinculoCargoCertame = "EXISTENTE" | "NOVO";

// RN-15: nove situações previstas, cada uma reabrindo o prazo de 48h de prestação de contas ao TCE-MT.
export type SituacaoCertame = "ABERTO" | "RETIFICACAO_EDITAL" | "HOMOLOGADO" | "RETIFICACAO_HOMOLOGACAO" | "PRORROGACAO_VALIDADE" | "CANCELADO_ANULADO" | "PARALISADO" | "HOMOLOGACAO_PARCIAL" | "RETIFICACAO_HOMOLOGACAO_PARCIAL";

export type TipoDocumentoCertame = "JUSTIFICATIVA_ABERTURA" | "PUBLICACAO_CERTAME_LICITATORIO" | "LEI_ATO_AUTORIZACAO" | "DECLARACAO_RESPONSAVEL" | "DEMONSTRATIVO_LRF" | "OUTROS_COMISSAO";

// RN-08: o sistema permite múltiplas cotas, mas o envio ao TCE-MT aceita apenas uma (ver Certame.cotaPrevalecenteId).
// RN-10: a lei referencia diretamente o catálogo de leis já cadastradas no sistema (ver dominios.LEIS_CERTAME).
export interface CotaCertame { readonly id:string; tipo:string; lei:string; }

// RN-10: cargo cadastrado com código de referência fixo "001" para fins de prestação de contas.
// RN-14: vaga pode ser vinculada a uma vaga existente do quadro de cargos do órgão ou criada especificamente para o certame.
export interface CargoVagaCertame { readonly id:string; vinculo:VinculoCargoCertame; cargoExistenteId?:string; cargoNome:string; readonly codigoReferenciaTce:"001"; quantidadeVagas:number; vagaPcd:boolean; quantidadePcd?:number; }

// RN-09: fases adicionais da SEPLAG começam na posição 13; as 12 primeiras são fixas (ver dominios.ts).
export interface FaseAdicionalCertame { readonly ordem:number; nome:string; }

export interface DocumentoCertame { readonly tipo:TipoDocumentoCertame; readonly nomeArquivo:string; readonly anexadoEm:string; }

// RN-16: a homologação é o marco do prazo de prestação de contas, distinto da publicação do resultado.
export interface SituacaoHistoricoCertame { readonly id:string; readonly certameId:string; readonly tipo:SituacaoCertame; readonly dataEfeito:string; readonly registradoEm:string; readonly usuario:string; readonly prazoPrestacaoContas?:string; }

export interface Certame {
 readonly id:string;
 // 1. Dados Gerais do Certame
 tipoCertame:TipoCertame;
 tipoConcursoAplic:string;
 leiContratoTemporario?:string;
 leiProcessoSeletivoSimplificado?:string;
 regimeJuridico:RegimeJuridicoCertame;
 tipoVinculo:TipoVinculoCertame;
 setor:string;
 setoresParticipantes:readonly string[];
 objetivo:string;
 numeroConcurso:string;
 anoConcurso:number;
 nomeEdital:string;
 numeroEditalOrgao:string;
 // 2. Datas, Validades e Execução
 dataRealizacao?:string;
 dataValidade?:string;
 inicioInscricoesGerais?:string;
 fimInscricoesGerais?:string;
 dataProrrogacao?:string;
 dataCancelamento?:string;
 dataResultado?:string;
 dataPublicacaoEdital:string;
 abrangencia:AbrangenciaCertame;
 tipoContratacaoExecucao:TipoContratacaoExecucaoCertame;
 instituicaoRealizadora?:string;
 previsaoProrrogacaoDias?:number;
 prorrogacaoValidadeDias?:number;
 validadeConcursoDias?:number;
 existePrevisaoRecursos:boolean;
 // 3. Prazos
 diasPrazoExercicio?:number;
 diasPrazoPosse?:number;
 diasPrazoProrrogacaoExercicio?:number;
 diasPrazoProrrogacaoPosse?:number;
 // 4. Isenção
 dataInicioInscricaoIsencao?:string;
 dataFimInscricaoIsencao?:string;
 leiIsencao?:string;
 tipoIsencao?:string;
 // 5. Recursos e Contratos
 houveContratacaoBanca:boolean;
 gerouDespesas:boolean;
 numeroEmpenho?:string;
 anoEmpenho?:number;
 tipoContrato?:string;
 numeroContrato?:string;
 anoContrato?:number;
 codigoUo?:string;
 codigoUg?:string;
 numeroAditivo?:string;
 anoAditivo?:number;
 cobraTaxaInscricao:boolean;
 valorInscricao?:number;
 // 6. Cotas (1:N)
 cotas:readonly CotaCertame[];
 cotaPrevalecenteId?:string;
 // 7. Cargo/Vagas + Fases do Concurso
 cargos:readonly CargoVagaCertame[];
 fasesAdicionais:readonly FaseAdicionalCertame[];
 // 8. Documentos
 documentos:readonly DocumentoCertame[];
 // Situações do Certame
 situacaoAtual:SituacaoCertame;
 readonly historicoSituacoes:readonly SituacaoHistoricoCertame[];
 readonly criadoEm:string;
 atualizadoEm:string;
 responsavel:string;
}
