export type TipoCertame = "CONCURSO_PUBLICO" | "PSS";
export type RegimeJuridicoCertame = "ESTATUTARIO" | "CELETISTA" | "ESPECIAL";
export type TipoVinculoCertame = "EFETIVO" | "CONTRATO_TEMPORARIO" | "BOLSISTA" | "RESIDENTE" | "ESTAGIARIO";
export type AbrangenciaCertame = "ESTADUAL" | "REGIONAL" | "MUNICIPAL";
export type TipoContratacaoExecucaoCertame = "PROPRIA_UG" | "EMPRESA_CONTRATADA";
export type VinculoCargoCertame = "EXISTENTE" | "NOVO";

// RN-15: nove situações previstas, cada uma reabrindo o prazo de 48h de prestação de contas ao TCE-MT.
export type SituacaoCertame = "ABERTO" | "RETIFICACAO_EDITAL" | "HOMOLOGADO" | "RETIFICACAO_HOMOLOGACAO" | "PRORROGACAO_VALIDADE" | "CANCELADO_ANULADO" | "PARALISADO" | "HOMOLOGACAO_PARCIAL" | "RETIFICACAO_HOMOLOGACAO_PARCIAL";

// Grupo 1 (Abertura): documentos exigidos na abertura do certame.
// Grupo 2 (Retificação do Edital de Abertura): termo aditivo ao edital e respectiva publicação.
// Grupo 3 (Homologação): editais, decisões de recursos e comprovantes de publicação da homologação.
// Grupo 4 (Retificação da Homologação): mesmos documentos do Grupo 3, reeditados/republicados —
// tipos próprios (sufixo _RETIF) para não compartilhar o arquivo anexado com a Homologação original.
export type TipoDocumentoCertame = "JUSTIFICATIVA_ABERTURA" | "PUBLICACAO_CERTAME_LICITATORIO" | "LEI_ATO_AUTORIZACAO" | "DECLARACAO_RESPONSAVEL" | "DEMONSTRATIVO_LRF" | "OUTROS_COMISSAO" | "EDITAL_INTEGRA" | "COMPROVANTE_PUBLICACAO_EDITAL" | "DECLARACAO_ORDENADOR_DESPESA" | "DESIGNACAO_COMISSAO" | "PARECER_CONTROLE_INTERNO" | "LOTACIONOGRAMA_ANALITICO" | "CONTRATO_SOCIAL_EMPRESA"
 | "TERMO_ADITIVO_EDITAL" | "COMPROVANTE_PUBLICACAO_TERMO_ADITIVO"
 | "EDITAL_HOMOLOGACAO_INSCRICOES" | "DECISAO_RECURSOS_EDITAL_HOMOLOGACAO" | "RELACAO_CANDIDATOS_APROVADOS" | "DECISAO_RECURSOS_RELACAO_CANDIDATOS" | "EDITAL_RESULTADO_FINAL" | "ATO_HOMOLOGACAO" | "COMPROVANTE_PUBLICACAO_EDITAL_HOMOLOGACAO" | "COMPROVANTE_PUBLICACAO_DECISAO_RECURSOS_EDITAL_HOMOLOGACAO" | "COMPROVANTE_PUBLICACAO_RELACAO_CANDIDATOS" | "COMPROVANTE_PUBLICACAO_DECISAO_RECURSOS_RELACAO_CANDIDATOS" | "COMPROVANTE_PUBLICACAO_RESULTADO_FINAL" | "COMPROVANTE_PUBLICACAO_ATO_HOMOLOGACAO" | "COMPROVANTE_RESIDENCIA_ACS"
 | "EDITAL_HOMOLOGACAO_INSCRICOES_RETIF" | "DECISAO_RECURSOS_EDITAL_HOMOLOGACAO_RETIF" | "RELACAO_CANDIDATOS_APROVADOS_RETIF" | "DECISAO_RECURSOS_RELACAO_CANDIDATOS_RETIF" | "EDITAL_RESULTADO_FINAL_RETIF" | "ATO_HOMOLOGACAO_RETIF" | "COMPROVANTE_PUBLICACAO_EDITAL_HOMOLOGACAO_RETIF" | "COMPROVANTE_PUBLICACAO_DECISAO_RECURSOS_EDITAL_HOMOLOGACAO_RETIF" | "COMPROVANTE_PUBLICACAO_RELACAO_CANDIDATOS_RETIF" | "COMPROVANTE_PUBLICACAO_DECISAO_RECURSOS_RELACAO_CANDIDATOS_RETIF" | "COMPROVANTE_PUBLICACAO_RESULTADO_FINAL_RETIF" | "COMPROVANTE_PUBLICACAO_ATO_HOMOLOGACAO_RETIF" | "COMPROVANTE_RESIDENCIA_ACS_RETIF";

// RN-08: o sistema permite múltiplas cotas por certame.
// RN-10: a lei referencia diretamente o catálogo de leis já cadastradas no sistema (ver dominios.LEIS_CERTAME).
// Cada campo de lei aceita mais de uma norma; a primeira selecionada é a lei aplicável (ver
// CampoLeiMultiplaSeplag em CertameFormContent.tsx).
export interface CotaCertame { readonly id:string; tipo:string; lei:readonly string[]; }

// Reserva de vagas de um cargo para um tipo de cota específico (ver dominios.TIPOS_COTA — PCD,
// PPP, Indígenas, Quilombolas, TEA). Um mesmo cargo/vaga pode ter mais de uma reserva simultânea
// (ex.: das 15 vagas, 2 reservadas a PCD e 1 a PPP), desde que a soma não exceda quantidadeVagas.
export interface ReservaCotaCargo { readonly id:string; tipo:string; quantidade:number; }

// RN-10: cargo cadastrado com código de referência fixo "001" para fins de prestação de contas.
// RN-14: vaga pode ser vinculada a uma vaga existente do quadro de cargos do órgão ou criada especificamente para o certame.
// quadroCodigo/quadroVersao: Quadro de Vagas (Controle de Vagas > Quadro Autorizado) vinculado automaticamente ao cargo,
// somente leitura — rastreabilidade Edital → Quadro de Vagas → Gestão de Ingresso.
// aceitaCadastroReserva/quantidadeCadastroReserva: Cadastro Reserva (CR) é exclusivo das vagas de
// ampla concorrência do cargo — não se aplica às vagas reservadas por cota (reservasCota).
// carreira: só se aplica a Concurso Público (Processo Seletivo Simplificado não tem carreira).
// polo: rótulo livre de agrupamento (ex.: "Polo Centro-Sul"), independente da Abrangência.
// cidades: município(s) do cargo, sem dependência da Abrangência do certame (ver dominios.MUNICIPIOS_MT).
export interface CargoVagaCertame { readonly id:string; vinculo:VinculoCargoCertame; cargoExistenteId?:string; cargoNome:string; carreira?:string; polo?:string; cidades?:readonly string[]; readonly codigoReferenciaTce:"001"; quantidadeVagas:number; reservasCota:readonly ReservaCotaCargo[]; aceitaCadastroReserva:boolean; quantidadeCadastroReserva?:number; quadroCodigo?:string; quadroVersao?:number; }

// Fases do certame — lista editável (nome, ordem e quantidade livres) por certame; o catálogo em
// dominios.FASES_TCE_FIXAS é usado apenas como sugestão inicial ao criar um novo certame.
export interface FaseCertame { readonly ordem:number; nome:string; dataInicio?:string; dataFim?:string; }

export interface DocumentoCertame { readonly tipo:TipoDocumentoCertame; readonly nomeArquivo:string; readonly anexadoEm:string; }

// RN-16: a homologação é o marco do prazo de prestação de contas, distinto da publicação do resultado.
// documentoAnexado: nome do arquivo anexado quando a situação é alterada manualmente (aba Situações).
export interface SituacaoHistoricoCertame { readonly id:string; readonly certameId:string; readonly tipo:SituacaoCertame; readonly dataEfeito:string; readonly registradoEm:string; readonly usuario:string; readonly prazoPrestacaoContas?:string; readonly documentoAnexado?:string; }

export interface Certame {
 readonly id:string;
 // 1. Dados Gerais do Certame
 tipoCertame:TipoCertame;
 tipoConcursoAplic:string;
 leiContratoTemporario?:readonly string[];
 leiProcessoSeletivoSimplificado?:readonly string[];
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
 leiIsencao?:readonly string[];
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
 // 7. Cargo/Vagas + Fases do Concurso
 cargos:readonly CargoVagaCertame[];
 fases:readonly FaseCertame[];
 // 8. Documentos
 documentos:readonly DocumentoCertame[];
 // Situações do Certame
 situacaoAtual:SituacaoCertame;
 readonly historicoSituacoes:readonly SituacaoHistoricoCertame[];
 readonly criadoEm:string;
 atualizadoEm:string;
 responsavel:string;
}
