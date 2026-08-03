export type FasePss = "DOCUMENTAL" | "SIES" | "SIGEP";
export type SistemaResponsavelPss = "SIGADOC" | "SIES" | "SIGEP" | "IOMAT" | "EXTERNO";
export type EtapaFluxoPss = "JUSTIFICATIVA_TECNICA" | "ANALISE_SECRETARIAS" | "RESERVA_ORCAMENTARIA" | "PUBLICACAO_EDITAL" | "CADASTRO_SIES" | "CADASTRO_RESERVA" | "CONVOCACAO" | "PUBLICACOES" | "CADASTRO_EDITAL_SIGEP" | "CONTROLE_VAGAS_SIGEP" | "INSCRICOES" | "PROVAS_CLASSIFICACAO" | "HOMOLOGACAO";
export type SituacaoEtapaPss = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA" | "BLOQUEADA";
export type AutomacaoEtapaPss = "AUTOMATIZADA" | "MANUAL" | "PARCIAL";
export interface DefinicaoEtapaPss { readonly etapa:EtapaFluxoPss; readonly ordem:number; readonly nome:string; readonly fase:FasePss; readonly sistema:SistemaResponsavelPss; readonly descricao:string; readonly automacaoPadrao:AutomacaoEtapaPss; readonly responsavelPadrao:string; readonly telaDestino:string; readonly rotuloDestino:string; readonly foraEscopoEmpresaContratada:boolean; }
export interface EtapaProcessoPss { readonly id:string; readonly processoId:string; readonly etapa:EtapaFluxoPss; readonly ordem:number; readonly nome:string; readonly fase:FasePss; readonly sistema:SistemaResponsavelPss; readonly descricao:string; situacao:SituacaoEtapaPss; automacao:AutomacaoEtapaPss; readonly responsavel:string; readonly dataPrevista:string; readonly dataConclusao?:string; readonly observacao?:string; readonly pendencias:readonly string[]; readonly telaDestino:string; readonly rotuloDestino:string; readonly foraEscopoSistemico:boolean; }

export type TipoProcessoPss = "CONCURSO" | "SELETIVO_SIMPLIFICADO";
export type ModalidadeExecucaoPss = "PROPRIA" | "EMPRESA_CONTRATADA";
export type SituacaoProcessoPss = "EM_ELABORACAO" | "EM_ANDAMENTO" | "SUSPENSO" | "HOMOLOGADO" | "ENCERRADO";
export type TipoEventoHistoricoPss = "CRIACAO" | "ALTERACAO_ETAPA" | "ALTERACAO_SITUACAO" | "PUBLICACAO" | "DIVERGENCIA" | "CORRECAO";
export interface HistoricoProcessoPss { readonly id:string; readonly processoId:string; readonly ocorridoEm:string; readonly dataEfeito:string; readonly tipo:TipoEventoHistoricoPss; readonly titulo:string; readonly descricao:string; readonly etapaAnterior?:EtapaFluxoPss; readonly etapaPosterior?:EtapaFluxoPss; readonly situacaoAnterior?:SituacaoProcessoPss; readonly situacaoPosterior?:SituacaoProcessoPss; readonly origem:string; readonly usuario:string; readonly processoSigadoc?:string; }
export interface ProcessoPss { readonly id:string; readonly numero:string; readonly edital:string; readonly orgaoSolicitante:string; readonly justificativa:string; readonly tipo:TipoProcessoPss; readonly modalidadeExecucao:ModalidadeExecucaoPss; readonly empresaContratada?:string; readonly cargos:readonly string[]; readonly cbos:readonly string[]; readonly vagasImediatas:number; readonly vagasCadastroReserva:number; readonly dataAbertura:string; readonly dataPrevistaHomologacao?:string; readonly dataHomologacao?:string; situacao:SituacaoProcessoPss; etapaAtual:EtapaFluxoPss; readonly etapas:readonly EtapaProcessoPss[]; readonly historico:readonly HistoricoProcessoPss[]; readonly divergenciaSies:boolean; readonly processoSigadoc:string; readonly responsavel:string; readonly atualizadoEm:string; readonly versao:number; }

export type SituacaoCandidatoPss = "INSCRITO" | "DEFERIDO" | "INDEFERIDO" | "CLASSIFICADO" | "DESCLASSIFICADO" | "CONVOCADO" | "NOMEADO" | "DESISTENTE";
export type CotaReservadaPss = "AMPLA" | "PCD" | "NEGROS" | "INDIGENA";
export interface CandidatoPss { readonly id:string; readonly processoId:string; readonly inscricao:string; readonly nome:string; readonly cpf:string; readonly cargo:string; readonly notaFinal:number; readonly classificacao:number; readonly dentroVagasImediatas:boolean; readonly cadastroReserva:boolean; readonly cotaReservada:CotaReservadaPss; situacao:SituacaoCandidatoPss; readonly convocadoEm?:string; readonly observacao?:string; }

export interface VagaProcessoPss { readonly id:string; readonly processoId:string; readonly cargo:string; readonly cbo:string; readonly perfilProfissional:string; readonly orgaoDestino:string; readonly lotacaoPrevista:string; readonly vagasImediatas:number; readonly cadastroReserva:number; readonly escolaridade:string; readonly remuneracao:number; readonly cargaHoraria:number; validadaContraSies:boolean; readonly cargoSiesId?:string; readonly cargoSiesNome?:string; readonly divergencia?:string; readonly cadastradaEm:string; readonly usuarioCadastro:string; }

export type SituacaoConvocacaoPss = "PENDENTE" | "GERADA" | "PUBLICADA" | "ENCERRADA";
export interface ConvocacaoPss { readonly id:string; readonly processoId:string; readonly numero:string; readonly ordem:number; readonly dataConvocacao:string; readonly prazoApresentacao:string; readonly quantidadeConvocados:number; readonly candidatoIds:readonly string[]; situacao:SituacaoConvocacaoPss; readonly formaGeracao:"MANUAL" | "AUTOMATICA"; readonly responsavel:string; readonly observacao?:string; }

export type TipoPublicacaoPss = "EDITAL_ABERTURA" | "LISTA_DEFERIDOS" | "LISTA_INDEFERIDOS" | "RESULTADO_PRELIMINAR" | "RESULTADO_FINAL" | "CONVOCACAO" | "HOMOLOGACAO";
export type VeiculoPublicacaoPss = "DIARIO_OFICIAL" | "IOMAT" | "SITE_ORGAO";
export type SituacaoPublicacaoPss = "PENDENTE" | "EM_ELABORACAO" | "PUBLICADA";
export interface PublicacaoPss { readonly id:string; readonly processoId:string; readonly tipo:TipoPublicacaoPss; readonly titulo:string; readonly veiculo:VeiculoPublicacaoPss; readonly dataPublicacao?:string; situacao:SituacaoPublicacaoPss; readonly formato:"WORD" | "PDF" | "SISTEMICO"; readonly geracaoManual:boolean; readonly responsavel:string; readonly observacao?:string; }

export type SistemaIntegracaoPss = "SIES" | "IOMAT" | "DIARIO_OFICIAL" | "TCE";
export type SituacaoIntegracaoPss = "NAO_INTEGRADO" | "PARCIAL" | "INTEGRADO";
export interface IntegracaoExterna { readonly id:string; readonly sistema:SistemaIntegracaoPss; readonly nome:string; readonly finalidade:string; situacaoAtual:SituacaoIntegracaoPss; readonly oQueFalta:readonly string[]; readonly responsavel:string; readonly ultimaVerificacao:string; readonly criticidade:"ALTA" | "MEDIA" | "BAIXA"; readonly etapasImpactadas:readonly EtapaFluxoPss[]; }

export type TipoDivergenciaSies = "SEM_CORRESPONDENCIA_SIES" | "CBO_DIVERGENTE" | "QUANTITATIVO_DIVERGENTE" | "CARGO_INEXISTENTE_SIGEP";
export interface DivergenciaSiesPss { readonly id:string; readonly processoId:string; readonly processoNumero:string; readonly vagaId:string; readonly cargo:string; readonly tipo:TipoDivergenciaSies; readonly descricao:string; readonly gravidade:"ALTA" | "MEDIA" | "BAIXA"; readonly detectadaEm:string; }

export interface CargoSiesReferencia { readonly id:string; readonly nome:string; readonly cbo:string; readonly orgao:string; readonly ativo:boolean; }

export type DominioEventoTemporalPss = "PROCESSO" | "ETAPA" | "VAGA_PROCESSO" | "CANDIDATO" | "CONVOCACAO" | "PUBLICACAO";
export interface EventoTemporalPss { readonly id:string; readonly dominio:DominioEventoTemporalPss; readonly entidadeId:string; readonly processoId:string; readonly dataEfeito:string; readonly registradoEm:string; readonly tipo:string; readonly descricao:string; readonly origem:string; }

export type StatusGeralPss = "ABERTO" | "EM_ANDAMENTO" | "FECHADO";
export type SituacaoCargaDePara = "CARREGADO" | "PENDENTE_CONVOCACAO_SIES" | "PENDENTE_VALIDACAO_DOCUMENTAL";
export interface CampoDeParaPss { readonly id:string; readonly campoSies:string; readonly campoSigep:string; readonly observacao?:string; }
export interface RegistroDeParaPss { readonly id:string; readonly processoId:string; readonly processoNumero:string; readonly candidatoId:string; readonly cpf:string; readonly cargoEdital:string; readonly cargoSigep:string; readonly localCidade:string; readonly lotacaoPretendida:string; readonly statusInscricaoSies:string; readonly statusCandidatoSigep:string; readonly statusConvocacaoSies?:string; readonly statusIngressoSigep:string; situacaoCarga:SituacaoCargaDePara; readonly contingenciaManual:boolean; readonly carregadoEm:string; readonly responsavel:string; }

export type SituacaoIngressoPss = "PENDENTE" | "EFETIVADO" | "BLOQUEADO";
export interface IngressoServidorPss { readonly id:string; readonly processoId:string; readonly candidatoId:string; readonly vagaProcessoId:string; readonly orgao:string; readonly lotacao:string; readonly dataIngresso?:string; readonly confirmacaoConvocacao:boolean; readonly validacaoDocumental:boolean; situacao:SituacaoIngressoPss; readonly origemRegistroDeParaId?:string; readonly contingenciaManual:boolean; readonly justificativaContingencia?:string; readonly responsavel:string; readonly registradoEm:string; }

export interface ResumoDashboardPss { processos:number; ativos:number; documental:number; sies:number; sigep:number; homologados:number; comPendenciaManual:number; comDivergenciaSies:number; publicacoesPendentes:number; convocacoesPendentes:number; vagasImediatas:number; cadastroReserva:number; empresaContratada:number; etapasBloqueadas:number; }
export interface GrupoProcessoDashboardPss { readonly chave:string; readonly processo:ProcessoPss; readonly faseAtual:FasePss; readonly etapaAtualNome:string; readonly concluidas:number; readonly totalEtapas:number; readonly percentual:number; readonly pendenciasManuais:number; readonly divergencias:number; readonly prioridade:"REGULAR" | "ATENCAO" | "CRITICA" | "DIVERGENTE"; }
