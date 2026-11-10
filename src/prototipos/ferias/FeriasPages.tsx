import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Paginator } from "primereact/paginator";
import { useNavigate } from "react-router-dom";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { CardSeplag } from "../../componentes/Card";
import { ModalSeplag } from "../../componentes/Modal";
import { BotaoLimparFiltroSeplag, BotaoVoltarSeplag, BotaoSalvarSeplag, BotaoSeplag } from "../../componentes/Botao";
import { SeplagAutoComplete } from "../../componentes/AutoComplete";
import { Dropdown } from "primereact/dropdown";
import { DropdownFieldSeplag, DateFieldSeplag } from "../../componentes/Fields";
import { RotuloSeplag } from "../../componentes/Rotulo";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import { validarSolicitacaoRecesso } from "./validarSolicitacaoRecesso";
import { STORAGE_KEY, registrosBase, carregarRegistros } from "./feriasMockDados";
import "./ferias.css";
// Reaproveita o layout da linha do tempo do "Histórico de Lançamento" da Gestão de Licenças
// (classes gl-historico-*) no modal de Histórico de Férias.
import "../gestaoLicencas/gestaoLicencas.css";
import { duracoesPermitidas, prazoFechamentoFolha, selecionarPeriodoMaisAntigo, type PeriodoComSaldo } from './regrasFerias';
import { AnexoFerias, CartaoDocumentoFerias, type DocumentoFerias } from './DocumentoFerias';
import { AprovacoesFerias } from "./AprovacoesFerias";
import {
  inicioUsufruto,
  fimUsufruto,
  podeSuspender,
  elegivelParaQuitacaoAutomatica,
  elegivelParaRetornoSuspensao,
  saldoRestanteParaReabertura,
} from "./regrasReabertura";
import {
  validarPrazoRegistroFerias,
  prazosAgendamento,
  validarPeriodoAquisitivoCompletado,
  calcularAlertaConcessivo,
} from "./regrasAgendamento";
import { competenciaDoGozo } from "./regrasFolha";
import {
  validarSolicitacaoSuspensaoArt17,
  ehFimDeSemanaOuFeriado,
  type FundamentoSuspensao,
} from "./regrasSuspensao";
import {
  CHAVE_FLUXO_SUSPENSAO_ART17,
  carregarFluxos,
  fluxoExigeAprovacao,
  iniciarProcesso,
  nivelDoProcesso,
  obterFluxo,
  perfilPodeDecidir,
  registrarDecisao,
  registrarPublicacao,
  type ConfiguracaoFluxo,
  type ProcessoAprovacao,
} from "./fluxoAprovacao";
import {
  calcularImpactoSuspensao,
  validarEntradaSuspensao,
  type EventoFolhaSuspensao,
  type IntervaloGozo,
} from "./motorFolhaSuspensao";

function brParaIso(valor: string) {
  if (!valor) return "";
  const [dia, mes, ano] = valor.split("/");
  if (!dia || !mes || !ano) return "";
  return `${ano}-${mes}-${dia}`;
}

// Date.now() sozinho pode colidir quando duas chamadas caem no mesmo milissegundo (ex.: duas
// parcelas adicionadas em sequência rápida), gerando ids duplicados — e com eles, keys React
// duplicadas. Mantém estritamente crescente mesmo nesse caso.
let ultimoIdGerado = 0;
function gerarId(): number {
  const agora = Date.now();
  ultimoIdGerado = agora > ultimoIdGerado ? agora : ultimoIdGerado + 1;
  return ultimoIdGerado;
}

type OrgaoColetivo = "SEDUC" | "UNEMAT" | "SECITEC" | "OUTRO";
type TipoSolicitacao = "Individual" | "Coletiva" | "Lote" | "Recesso";
type SituacaoFerias = "AGUARDANDO VALIDAÇÃO" | "EM ABERTO" | "QUITADO" | "REPROVADO" | "SUSPENSO" | "PRAZO EXPIRADO";
type TipoVinculo = "Efetivo" | "Comissionado" | "Contrato Temporário" | "Residente Técnico" | "Estagiário";
type TipoVinculoFiltro = "Todos" | TipoVinculo;
type Origem = "PORTALSERVIDOR" | "SIGEP";
type TipoRegistro = "FÉRIAS" | "LICENÇA REMUNERADA";
type AcaoStatus = "validar" | "rejeitar" | "suspender" | "reativar" | "aprovar_suspensao" | "rejeitar_suspensao";

/** Dados coletados no modal de suspensão, conforme o fundamento legal (RN-SUS, Arts. 16 e 17). */
interface DadosSuspensao {
  fundamento: FundamentoSuspensao;
  /** Art. 16: data de término da licença que disparou a suspensão (para a retomada automática). */
  licencaFim?: string;
  /** Art. 17: chefia solicitante, causa detalhada, prazo estimado e autorização do dirigente. */
  solicitante?: string;
  causa?: string;
  prazoEstimadoDias?: number;
  autorizadoPeloDirigente?: boolean;
  /** Período da suspensão e prorrogação resultante, para registrar no histórico. */
  suspensaoInicio?: string;
  suspensaoFim?: string;
  novaDataTerminoFerias?: string;
  /** Id da parcela suspensa, quando a suspensão incide sobre uma parcela específica do registro. */
  parcelaId?: number;
}

/** Suspensão (Art. 17) registrada pela setorial e ainda não efetivada: aguarda a validação do
 * órgão central conforme o fluxo de aprovação parametrizado. Enquanto existir, o registro
 * continua "Agendada" e nada é recalculado na folha. */
interface SuspensaoPendente {
  dados: DadosSuspensao;
  processo: ProcessoAprovacao;
  solicitadoPor: string;
  solicitadoEm: string;
  documento?: DocumentoFerias;
}
type PerfilAcesso = "Servidor" | "Chefia Imediata" | "RH / Gestão de Pessoas" | "DRE / RH Central";

interface ParcelaFerias {
  id: number;
  inicio: string;
  fim: string;
  dias: number;
  terco?: boolean;
}

/** Um evento do histórico de situações do registro — usado pelo modal "Histórico". */
interface HistoricoEventoFerias {
  situacao: SituacaoFerias;
  acao: string;
  data: string;
  responsavel: string;
  /** Matrícula/vínculo de quem está logado realizando a ação (não do servidor da solicitação). */
  responsavelMatricula?: string;
  responsavelVinculo?: string;
  justificativa?: string;
  documentos?: DocumentoFerias[];
  /** RN-SUS: detalhes da suspensão, quando o evento é uma suspensão. */
  dataRetomada?: string;
  fundamentoSuspensao?: "ART_16" | "ART_17";
  /** Período da suspensão (início/fim) e duração em dias. */
  suspensaoInicio?: string;
  suspensaoFim?: string;
  suspensaoDias?: number;
  /** Período de férias original (antes da suspensão), para exibir no histórico. */
  feriasOriginalInicio?: string;
  feriasOriginalFim?: string;
  /** Nova data de término das férias após a prorrogação pelos dias suspensos (Art. 17). */
  novaDataTerminoFerias?: string;
  /** Causa motivadora informada na suspensão (Art. 17). */
  causaSuspensao?: string;
  /** Remanejamento de datas: período anterior e novo (para o painel visual do histórico). */
  remanejamento?: { anteriorInicio: string; anteriorFim: string; anteriorDias: number; novoInicio: string; novoFim: string; novoDias: number };
  /** Impacto na folha (em DIAS, por competência) gerado pela efetivação da suspensão. */
  impactoFolha?: EventoFolhaSuspensao[];
  /** Fluxo de aprovação: etapa registrada neste evento (nível, publicação no DO, documentação). */
  aprovacaoEtapa?: string;
}

interface SubstitutoFerias {
  id: number;
  nome: string;
  inicio: string;
  fim: string;
  portaria: string;
}

export interface FeriasRegistro {
  id: number;
  servidorNome: string;
  matricula: string;
  numeroVinculo?: string;
  justificativaAvaliacao?: string;
  resultadoAvaliacao?: 'Aprovada' | 'Rejeitada';
  cpf: string;
  documentos?: DocumentoFerias[];
  dre?: string;
  unidade?: string;
  orgao: string;
  orgaoColetivo: OrgaoColetivo;
  setor: string;
  cargo: string;
  cargoGestao: boolean;
  tipoVinculo: TipoVinculo;
  saldoFerias?: number;
  saldoFeriasConfirmado?: boolean;
  regraAquisitivo?: "PADRAO" | "USUFRUTO_ANTECIPADO";
  tipo: TipoSolicitacao;
  origem: Origem;
  periodoAquisitivoInicio: string;
  periodoAquisitivoFim: string;
  periodoAquisitivoLabel?: string;
  parcelas: ParcelaFerias[];
  situacao: SituacaoFerias;
  substitutos: SubstitutoFerias[];
  loteId?: string;
  responsavelLancamento: string;
  lancadoEm: string;
  avaliadoPor?: string;
  avaliadoEm?: string;
  dataLimiteValidacaoChefia?: string;
  bloqueioAuxilioTransporte?: boolean;
  auxilioTransporteEfetivado?: boolean;
  sigpasIntegrado?: boolean;
  emailChefiaEnviado?: boolean;
  /** Folha de Pagamento Homologada/Paga — enquanto true, bloqueia cancelamento e reativação
   * direta (reabertura-padrão); só o perfil Administrador RH pode forçar, fora deste protótipo. */
  folhaHomologada?: boolean;
  /** RN-FOL-02: o adiantamento (remuneração + 1/3) já foi processado em folha para este
   * registro. Determina o impacto financeiro de cancelamento/suspensão. */
  adiantamentoPago?: boolean;
  /** RN-SUS: fundamento legal da suspensão, quando o registro está SUSPENSO —
   * "ART_16" (licença gestante/adotante/paternidade) ou "ART_17" (superior interesse público). */
  fundamentoSuspensao?: "ART_16" | "ART_17";
  /** RN-SUS-02: data de retomada automática calculada para suspensão Art. 16. */
  dataRetomadaArt16?: string;
  /** RN-SUS: quantidade de dias que o registro ficou suspenso. */
  diasSuspensos?: number;
  /** RN-SUS: data em que o servidor volta a cumprir as férias (retorno). Ao chegar essa data,
   * o verificador automático reativa o registro para "Agendada" (EM ABERTO). */
  dataRetornoSuspensao?: string;
  /** RN-SUS-05/07: dados da suspensão por interesse público (Art. 17). Registra os quatro
   * requisitos do pedido: solicitante (chefia imediata), data (inicio), causa e prazo. */
  suspensaoArt17?: { solicitante: string; causa: string; prazoEstimadoDias: number; autorizadoPeloDirigente: boolean; inicio: string };
  /** Suspensão Art. 17 aguardando validação do órgão central (ver SuspensaoPendente). */
  suspensaoPendente?: SuspensaoPendente;
  /** Quando SUSPENSO por parcela, id da parcela suspensa (o selo marca só a linha dela). */
  parcelaSuspensaId?: number;
  /** RN-MOT-01/RN023: parcelas do registro após o retorno — a parcela suspensa substituída pelo
   * novo calendário do motor (dias usufruídos nas datas originais + restantes deslocados); as
   * demais parcelas inalteradas. Calculado na efetivação e aplicado pelo retorno automático. */
  parcelasAposRetorno?: ParcelaFerias[];
  /** Eventos de folha (em dias, por competência) calculados pelo motor na efetivação da suspensão. */
  impactoFolha?: EventoFolhaSuspensao[];
  /** RN-FOL-07/08: impacto funcional pendente de uma suspensão Art. 17 / cancelamento. O módulo
   * de Férias fala de DIAS, nunca de valores — o impacto financeiro (R$) é exclusivo da Folha.
   * `diasComprometidos` são os dias não usufruídos que serão cobrados (incluídos) na competência
   * do novo gozo. `competenciaCobranca` fica indefinida até o reagendamento (compensação diferida). */
  pendenciaSaldo?: { diasComprometidos: number; origem: "SUSPENSAO_ART17"; competenciaCobranca?: string };
  /** Preenchido quando o agendamento é reaberto com uma nova data (RN reabertura 3.1) —
   * mantém no histórico o período original que foi cancelado/suspenso. */
  historicoReabertura?: { inicioOriginal: string; fimOriginal: string; reabertoEm: string };
  /** Linha do tempo completa do registro — um evento por mudança de situação, com quem
   * lançou/decidiu, quando, a justificativa (se houver) e os anexos daquele momento. */
  historico?: HistoricoEventoFerias[];
}

interface LinhaSubstituicao {
  id: string;
  titular: string;
  cargo: string;
  substitutoNome: string;
  inicio: string;
  fim: string;
  dias: number;
  tipo: "Férias" | "Licença médica";
  portaria: string;
  origem: Origem;
  situacao: "Vigente" | "Encerrada";
}

interface ProfessorLote {
  id: number;
  orgao: "SEDUC" | "UNEMAT" | "SECITEC";
  nome: string;
  matricula: string;
  cpf?: string;
  cargo: string;
  vinculo: "Efetivo" | "Contrato Temporário";
  lotacaoNome: string;
  situacaoLotacao: "Em escola" | "Fora da escola" | "Em unidade universitária" | "Fora de unidade";
  saldo: 10 | 15 | 20 | 25 | 30 | 45;
  cargoGestao: boolean;
  ltsConcomitante: boolean;
  cedido?: boolean;
  remocaoRecentePendente?: boolean;
  periodoAquisitivoFechado?: boolean;
  afastamentoConcomitante?: string;
  vinculoEncerrado?: boolean;
  feriasConcomitante?: boolean;
  saldoConfirmado?: boolean;
}

type PerfilLote = "SECRETARIO_SEDUC" | "GESTAO_UNEMAT" | "GESTAO_SECITEC";

interface ServidorMock {
  matricula: string;
  cpf?: string;
  nome: string;
  orgao: string;
  setor: string;
  cargo: string;
  tipoVinculo: TipoVinculo;
  cargoGestao: boolean;
  periodoAquisitivoInicio: string;
  periodoAquisitivoFim: string;
  saldoDisponivel: number;
  periodos?: PeriodoComSaldo[];
}

const SERVIDORES_MOCK: ServidorMock[] = [
  { matricula: "241244", nome: "Valeria da Silva Pinto", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Analista Administrativo", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2025-06-11", periodoAquisitivoFim: "2026-06-10", saldoDisponivel: 30 },
  // Servidor com débito de suspensão Art. 17 pendente (ver registro 32 em feriasMockDados):
  // ao fazer um novo agendamento individual, aparece o aviso de compensação do débito (RN-SUS-10).
  { matricula: "900032", nome: "Henrique Dias Moreira", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Técnico Administrativo", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2024-01-01", periodoAquisitivoFim: "2024-12-31", saldoDisponivel: 30 },
  { matricula: "257812", nome: "Max Jorge Lacerda da Matta", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Técnico Administrativo", tipoVinculo: "Contrato Temporário", cargoGestao: false, periodoAquisitivoInicio: "2025-08-11", periodoAquisitivoFim: "2026-08-10", saldoDisponivel: 20, periodos:[{inicio:'2024-08-11',fim:'2025-08-10',saldo:20},{inicio:'2025-08-11',fim:'2026-08-10',saldo:30}] },
  { matricula: "243417", nome: "Claudio Luciano Capistrano de Camargo", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Coordenador de TI", tipoVinculo: "Comissionado", cargoGestao: true, periodoAquisitivoInicio: "2025-10-15", periodoAquisitivoFim: "2026-10-14", saldoDisponivel: 30 },
  { matricula: "249253", nome: "Claudia Moreira Arrais de Oliveira", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Assessora Técnica", tipoVinculo: "Comissionado", cargoGestao: false, periodoAquisitivoInicio: "2025-07-01", periodoAquisitivoFim: "2026-06-30", saldoDisponivel: 30 },
  { matricula: "327305", nome: "João Silva", orgao: "SEPLAG/MT", setor: "GABINETE", cargo: "Analista Administrativo", tipoVinculo: "Efetivo", cargoGestao: true, periodoAquisitivoInicio: "2025-01-01", periodoAquisitivoFim: "2025-12-31", saldoDisponivel: 30 },
  { matricula: "418920", nome: "Marina Costa Alves", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Analista Técnico", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2025-01-15", periodoAquisitivoFim: "2026-01-14", saldoDisponivel: 30 },
  { matricula: "778899", nome: "Rodrigo Nunes Ferraz", orgao: "SEDUC/MT", setor: "Escola Estadual Marechal Rondon", cargo: "Professor Substituto", tipoVinculo: "Contrato Temporário", cargoGestao: false, periodoAquisitivoInicio: "2026-05-01", periodoAquisitivoFim: "2027-04-30", saldoDisponivel: 45 },
  { matricula: "551023", nome: "Ana Lúcia Ferreira", orgao: "SEDUC/MT", setor: "Escola Estadual Antônio Ferreira", cargo: "Apoio", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2025-01-01", periodoAquisitivoFim: "2025-12-31", saldoDisponivel: 45 },
  { matricula: "551044", nome: "Bruno Castanheira", orgao: "SEDUC/MT", setor: "Escola Estadual Antônio Ferreira", cargo: "Administração", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2025-01-01", periodoAquisitivoFim: "2025-12-31", saldoDisponivel: 30 },
  { matricula: "551067", nome: "Cláudia Mendes", orgao: "SEDUC/MT", setor: "Escola Estadual Antônio Ferreira", cargo: "Apoio", tipoVinculo: "Contrato Temporário", cargoGestao: false, periodoAquisitivoInicio: "2025-01-01", periodoAquisitivoFim: "2025-12-31", saldoDisponivel: 45 },
  { matricula: "512077", nome: "João Pedro Castanheira", orgao: "UNEMAT/MT", setor: "Câmpus Universitário de Cáceres (Jane Vanini)", cargo: "Administração", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2025-01-01", periodoAquisitivoFim: "2025-12-31", saldoDisponivel: 30 },
  { matricula: "512104", nome: "Marina Costa Alves", orgao: "UNEMAT/MT", setor: "Câmpus Universitário de Sinop", cargo: "Apoio", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2025-01-01", periodoAquisitivoFim: "2025-12-31", saldoDisponivel: 30 },
  { matricula: "310021", nome: "Beatriz Andrade Correia", orgao: "SEPLAG/MT", setor: "Hospital Regional de Mato Grosso", cargo: "Residente Técnico — Enfermagem", tipoVinculo: "Residente Técnico", cargoGestao: false, periodoAquisitivoInicio: "2025-02-01", periodoAquisitivoFim: "", saldoDisponivel: 30 },
  { matricula: "320045", nome: "Igor Machado Nunes", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Estagiário", tipoVinculo: "Estagiário", cargoGestao: false, periodoAquisitivoInicio: "2026-01-10", periodoAquisitivoFim: "", saldoDisponivel: 15 },
  { matricula: "330078", nome: "Larissa Pacheco Teixeira", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Estagiária", tipoVinculo: "Estagiário", cargoGestao: false, periodoAquisitivoInicio: "2026-01-05", periodoAquisitivoFim: "", saldoDisponivel: 22 },
  { matricula: "340099", nome: "Camila Rezende Borges", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Estagiária", tipoVinculo: "Estagiário", cargoGestao: false, periodoAquisitivoInicio: "2025-10-15", periodoAquisitivoFim: "", saldoDisponivel: 30 },
  { matricula: "350011", nome: "Thiago Nunes Prado", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Estagiário", tipoVinculo: "Estagiário", cargoGestao: false, periodoAquisitivoInicio: "2026-08-01", periodoAquisitivoFim: "", saldoDisponivel: 5 },
  { matricula: "360022", nome: "Patrícia Souza Lacerda", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Estagiária", tipoVinculo: "Estagiário", cargoGestao: false, periodoAquisitivoInicio: "2025-11-01", periodoAquisitivoFim: "", saldoDisponivel: 27 },
  { matricula: "370033", nome: "Eduardo Lima Vasconcelos", orgao: "SEPLAG/MT", setor: "Hospital Regional de Mato Grosso", cargo: "Residente Técnico — Fisioterapia", tipoVinculo: "Residente Técnico", cargoGestao: false, periodoAquisitivoInicio: "2026-04-15", periodoAquisitivoFim: "", saldoDisponivel: 20 },
  { matricula: "380044", nome: "Fernanda Alves Carneiro", orgao: "SEPLAG/MT", setor: "Hospital Regional de Mato Grosso", cargo: "Residente Técnico — Enfermagem", tipoVinculo: "Residente Técnico", cargoGestao: false, periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "", saldoDisponivel: 30 },
  { matricula: "390055", nome: "Gabriel Teixeira Rocha", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Residente Técnico", tipoVinculo: "Residente Técnico", cargoGestao: false, periodoAquisitivoInicio: "2026-09-20", periodoAquisitivoFim: "", saldoDisponivel: 15 },
  { matricula: "550099", nome: "Ricardo Farias Lima", orgao: "SES/MT", setor: "Unidade de Pronto Atendimento", cargo: "Médico Plantonista", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2025-09-01", periodoAquisitivoFim: "2026-08-31", saldoDisponivel: 20 },
  { matricula: "550099", nome: "Ricardo Farias Lima", orgao: "SES/MT", setor: "Ambulatório de Cardiologia", cargo: "Médico Cardiologista", tipoVinculo: "Contrato Temporário", cargoGestao: false, periodoAquisitivoInicio: "2025-11-01", periodoAquisitivoFim: "2026-10-31", saldoDisponivel: 12 },
  // RN-01/RN-02/RN-03 (concomitância ao lançar): matrículas com férias/recesso já ativo, para
  // testar o alerta (agendada futura) e o bloqueio (em andamento) ao tentar lançar um novo período
  // sobreposto para o mesmo servidor.
  { matricula: "260114", nome: "Fabiana Rezende Monteiro", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Técnica Administrativa", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2024-09-01", periodoAquisitivoFim: "2025-08-31", saldoDisponivel: 30 },
  { matricula: "265530", nome: "Marcelo Augusto Vianna", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Assistente Administrativo", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2024-11-01", periodoAquisitivoFim: "2025-10-31", saldoDisponivel: 30 },
  // RN-01/RN-02 (LTS × Férias): já tem LTS lançada de 01/11 a 15/11/2026 (ver LTS_MOCK). Tentar
  // lançar férias sobrepondo essas datas dispara o alerta de concomitância.
  { matricula: "270045", nome: "Juliana Freitas Cardoso", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Analista Administrativa", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2024-10-01", periodoAquisitivoFim: "2025-09-30", saldoDisponivel: 30 },
  // RN-01/RN-02 (LTS × Recesso): mesma concomitância, agora no fluxo de Recesso Remunerado
  // (Residente Técnico/Estagiário). LTS lançada de 01/12 a 15/12/2026 (ver LTS_MOCK).
  { matricula: "395077", nome: "Renata Pacheco Vieira", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Estagiária", tipoVinculo: "Estagiário", cargoGestao: false, periodoAquisitivoInicio: "2026-05-01", periodoAquisitivoFim: "", saldoDisponivel: 15 },
  // RN-03 (Recesso): já em andamento (cobre a data de hoje) — tentar lançar novo recesso
  // sobreposto para a matrícula 399088 deve ser BLOQUEADO ao adicionar a etapa.
  { matricula: "399088", nome: "Eduarda Martins Siqueira", orgao: "SEPLAG/MT", setor: "Hospital Regional de Mato Grosso", cargo: "Residente Técnico — Fisioterapia", tipoVinculo: "Residente Técnico", cargoGestao: false, periodoAquisitivoInicio: "2026-03-01", periodoAquisitivoFim: "", saldoDisponivel: 15 },
  // RN-01/RN-02 (LTS × Recesso): já tem LTS lançada de 20/11 a 05/12/2026 (ver LTS_MOCK).
  { matricula: "399099", nome: "Rafael Cunha Barbosa", orgao: "SEPLAG/MT", setor: "Hospital Regional de Mato Grosso", cargo: "Residente Técnico — Enfermagem", tipoVinculo: "Residente Técnico", cargoGestao: false, periodoAquisitivoInicio: "2026-06-01", periodoAquisitivoFim: "", saldoDisponivel: 15 },
  // RN-01/RN-02 (LTS × Férias Individual): Contrato Temporário com LTS lançada de 10/11 a
  // 24/11/2026 (ver LTS_MOCK) — diversifica o vínculo testado (os demais exemplos são Efetivo).
  { matricula: "420033", nome: "Patrícia Helena Guimarães", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Técnica em Contratos", tipoVinculo: "Contrato Temporário", cargoGestao: false, periodoAquisitivoInicio: "2025-11-01", periodoAquisitivoFim: "2026-10-31", saldoDisponivel: 20 },
];

function periodoDisponivelServidor(servidor: ServidorMock) {
  const registros = carregarRegistros();
  const periodos = servidor.periodos ?? [{ inicio: servidor.periodoAquisitivoInicio, fim: servidor.periodoAquisitivoFim, saldo: servidor.saldoDisponivel }];
  return selecionarPeriodoMaisAntigo(periodos.map(periodo => ({...periodo,
    saldo: Math.max(0, periodo.saldo - registros.filter(r => r.matricula === servidor.matricula && r.tipoVinculo === servidor.tipoVinculo && r.orgao === servidor.orgao && r.periodoAquisitivoInicio === periodo.inicio && !['REPROVADO','PRAZO EXPIRADO','SUSPENSO'].includes(r.situacao)).reduce((total,r) => total + diasSolicitados(r),0))
  })));
}

interface PeriodoAquisitivoRecesso {
  inicio: string;
  saldo: number;
}

/** RN004/RN005 (US50/US51) — cada matrícula pode ter mais de um período aquisitivo de
 * recesso com saldo; a tela precisa listar todos para o operador escolher, não assumir
 * um único período fixo. */
const PERIODOS_RECESSO_MOCK: Record<string, PeriodoAquisitivoRecesso[]> = {
  "310021": [ // Beatriz Andrade Correia — Residente Técnico, dois anos completos (parcelamento livre)
    { inicio: "2025-02-01", saldo: 30 },
    { inicio: "2026-02-01", saldo: 30 },
  ],
  "320045": [ // Igor Machado Nunes — Estagiário, saldo não-múltiplo de 10 (parcelamento livre)
    { inicio: "2026-01-10", saldo: 15 },
    { inicio: "2026-07-10", saldo: 15 },
  ],
  "330078": [ // Larissa Pacheco Teixeira — Estagiária, saldo ainda formando (bloco integral); um período antes do corte de março/2018
    { inicio: "2017-06-01", saldo: 15 },
    { inicio: "2026-01-05", saldo: 22 },
  ],
  "340099": [ // Camila Rezende Borges — Estagiária com saldo no teto de 30 dias (padrão fixo IN 007/2022)
    { inicio: "2025-10-15", saldo: 30 },
  ],
  "350011": [ // Thiago Nunes Prado — Estagiário ainda em carência (< 6 meses de vínculo)
    { inicio: "2026-08-01", saldo: 5 },
  ],
  "360022": [ // Patrícia Souza Lacerda — Estagiária perto do fim do contrato (RN007)
    { inicio: "2025-11-01", saldo: 27 },
  ],
  "370033": [ // Eduardo Lima Vasconcelos — Residente Técnico com saldo não-múltiplo de 30
    { inicio: "2026-04-15", saldo: 20 },
  ],
  "380044": [ // Fernanda Alves Carneiro — Residente Técnico com dois períodos próximos (RN011 sem intercalar)
    { inicio: "2026-01-01", saldo: 30 },
    { inicio: "2026-11-01", saldo: 30 },
  ],
  "390055": [ // Gabriel Teixeira Rocha — Residente Técnico com saldo mínimo de uma etapa (10 dias)
    { inicio: "2026-09-20", saldo: 15 },
  ],
  "395077": [ // Renata Pacheco Vieira — Estagiária com LTS lançada no período (ver LTS_MOCK)
    { inicio: "2026-05-01", saldo: 15 },
  ],
  "399088": [ // Eduarda Martins Siqueira — Residente Técnico, recesso já em andamento (RN-03)
    { inicio: "2026-03-01", saldo: 15 },
  ],
  "399099": [ // Rafael Cunha Barbosa — Residente Técnico com LTS lançada no período (ver LTS_MOCK)
    { inicio: "2026-06-01", saldo: 15 },
  ],
};

/** RN005 (US51) — períodos aquisitivos de estagiário anteriores a este marco são
 * bloqueados na tela e direcionados à Gestão de Pessoas. Não se aplica a residente técnico (RN004/US50). */
const MARCO_CORTE_ESTAGIARIO = "2018-03-01";

/** validarSolicitacaoRecesso exige data_fim_contrato tanto para residente técnico quanto para
 * estagiário — o recesso nunca pode ultrapassar o fim do vínculo. */
const FIM_CONTRATO_RECESSO_MOCK: Record<string, string> = {
  "310021": "2028-01-31", // Beatriz Andrade Correia — Residente Técnico
  "320045": "2028-07-09", // Igor Machado Nunes — Estagiário
  "330078": "2026-12-04", // Larissa Pacheco Teixeira — Estagiária
  "340099": "2027-10-14", // Camila Rezende Borges — Estagiária
  "350011": "2027-07-31", // Thiago Nunes Prado — Estagiário
  "360022": "2026-11-15", // Patrícia Souza Lacerda — Estagiária, contrato encerra em breve
  "370033": "2028-04-14", // Eduardo Lima Vasconcelos — Residente Técnico
  "380044": "2028-12-31", // Fernanda Alves Carneiro — Residente Técnico
  "390055": "2028-09-19", // Gabriel Teixeira Rocha — Residente Técnico
  "395077": "2028-02-28", // Renata Pacheco Vieira — Estagiária
  "399088": "2028-02-28", // Eduarda Martins Siqueira — Residente Técnico
  "399099": "2028-05-31", // Rafael Cunha Barbosa — Residente Técnico
};


function vinculosDoServidor(nome: string): ServidorMock[] {
  return SERVIDORES_MOCK.filter((servidor) => servidor.nome === nome);
}

function buscarServidorMock(query: string): ServidorMock | undefined {
  const termo = query.trim().toLocaleLowerCase("pt-BR");
  const cpfBusca = termo.replace(/\D/g, "");
  if (!termo) return undefined;
  return SERVIDORES_MOCK.find(
    (servidor) =>
      servidor.matricula === termo ||
      servidor.nome.toLocaleLowerCase("pt-BR").includes(termo) ||
      Boolean(cpfBusca && servidor.cpf?.replace(/\D/g, "").includes(cpfBusca)),
  );
}

function buscarServidorMockPorOrgao(query: string, orgao: string): ServidorMock | undefined {
  const termo = query.trim().toLocaleLowerCase("pt-BR");
  const cpfBusca = termo.replace(/\D/g, "");
  if (!termo) return undefined;
  return SERVIDORES_MOCK.find(
    (servidor) =>
      servidor.orgao === orgao &&
      (servidor.matricula === termo ||
        servidor.nome.toLocaleLowerCase("pt-BR") === termo ||
        `${servidor.matricula} - ${servidor.nome}`.toLocaleLowerCase("pt-BR") === termo ||
        Boolean(cpfBusca && servidor.cpf?.replace(/\D/g, "").includes(cpfBusca))),
  );
}

function sugerirServidoresLote(query: string, orgao: string): string[] {
  const termo = query.trim().toLocaleLowerCase("pt-BR");
  const cpfBusca = termo.replace(/\D/g, "");
  return SERVIDORES_MOCK
    .filter((servidor) => servidor.orgao === orgao)
    .filter(
      (servidor) =>
        !termo ||
        servidor.matricula.includes(termo) ||
        servidor.nome.toLocaleLowerCase("pt-BR").includes(termo) ||
        Boolean(cpfBusca && servidor.cpf?.replace(/\D/g, "").includes(cpfBusca)),
    )
    .map((servidor) => `${servidor.matricula} - ${servidor.nome}`);
}

function BotaoBuscarServidor({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <button
      type="button"
      className="prototype-ferias-busca-servidor-botao"
      aria-label="Buscar servidor"
      title="Buscar servidor"
      onClick={onClick}
    >
      <i className="pi pi-search" aria-hidden="true" />
    </button>
  );
}

const professoresLoteBase: ProfessorLote[] = [
  { id: 1, orgao: "SEDUC", nome: "Ana Lúcia Ferreira", matricula: "551023", cargo: "Apoio", vinculo: "Efetivo", lotacaoNome: "Escola Estadual Antônio Ferreira", situacaoLotacao: "Em escola", saldo: 45, cargoGestao: false, ltsConcomitante: false },
  { id: 2, orgao: "SEDUC", nome: "Bruno Castanheira", matricula: "551044", cargo: "Administração", vinculo: "Efetivo", lotacaoNome: "Escola Estadual Antônio Ferreira", situacaoLotacao: "Em escola", saldo: 30, cargoGestao: false, ltsConcomitante: false },
  { id: 3, orgao: "SEDUC", nome: "Cláudia Mendes", matricula: "551067", cargo: "Professor", vinculo: "Contrato Temporário", lotacaoNome: "Escola Estadual Antônio Ferreira", situacaoLotacao: "Em escola", saldo: 45, cargoGestao: false, ltsConcomitante: true, periodoAquisitivoFechado: false },
  { id: 4, orgao: "SEDUC", nome: "Diego Albuquerque", matricula: "551089", cargo: "Professor", vinculo: "Efetivo", lotacaoNome: "Escola Estadual Antônio Ferreira", situacaoLotacao: "Em escola", saldo: 30, cargoGestao: false, ltsConcomitante: false, cedido: true },
  { id: 5, orgao: "SEDUC", nome: "Elisângela Rocha", matricula: "551102", cargo: "Professor", vinculo: "Efetivo", lotacaoNome: "Escola Estadual Antônio Ferreira", situacaoLotacao: "Em escola", saldo: 30, cargoGestao: true, ltsConcomitante: false },
  { id: 6, orgao: "SEDUC", nome: "Rodrigo Nunes Ferraz", matricula: "778899", cargo: "Professor", vinculo: "Contrato Temporário", lotacaoNome: "Escola Estadual Marechal Rondon", situacaoLotacao: "Em escola", saldo: 45, cargoGestao: false, ltsConcomitante: false },
  { id: 7, orgao: "SEDUC", nome: "Patrícia Nogueira Souza", matricula: "410033", cargo: "Administração", vinculo: "Contrato Temporário", lotacaoNome: "Escola Estadual Marechal Rondon", situacaoLotacao: "Em escola", saldo: 30, cargoGestao: false, ltsConcomitante: false },
  { id: 8, orgao: "SEDUC", nome: "Cleber Augusto Dias", matricula: "400010", cargo: "Apoio", vinculo: "Efetivo", lotacaoNome: "EE Tiradentes", situacaoLotacao: "Em escola", saldo: 45, cargoGestao: false, ltsConcomitante: false },
  { id: 9, orgao: "SEDUC", nome: "Simone Aparecida Luz", matricula: "498231", cargo: "Administração", vinculo: "Efetivo", lotacaoNome: "EE Tiradentes", situacaoLotacao: "Em escola", saldo: 30, cargoGestao: false, ltsConcomitante: false },
  { id: 10, orgao: "SEDUC", nome: "Wagner Correia Lima", matricula: "503399", cargo: "Professor", vinculo: "Efetivo", lotacaoNome: "EE Tiradentes", situacaoLotacao: "Em escola", saldo: 45, cargoGestao: false, ltsConcomitante: false, remocaoRecentePendente: true },
  { id: 11, orgao: "UNEMAT", nome: "João Pedro Castanheira", matricula: "512077", cargo: "Professor", vinculo: "Efetivo", lotacaoNome: "Câmpus Universitário de Cáceres (Jane Vanini)", situacaoLotacao: "Em unidade universitária", saldo: 45, saldoConfirmado: false, cargoGestao: false, ltsConcomitante: false },
  { id: 12, orgao: "UNEMAT", nome: "Marina Costa Alves", matricula: "512104", cargo: "Professor", vinculo: "Efetivo", lotacaoNome: "Câmpus Universitário de Sinop", situacaoLotacao: "Em unidade universitária", saldo: 45, saldoConfirmado: false, cargoGestao: false, ltsConcomitante: false },
  { id: 13, orgao: "SEDUC", nome: "Rafael Monteiro Costa", matricula: "551120", cargo: "Professor", vinculo: "Efetivo", lotacaoNome: "Escola Estadual Antônio Ferreira", situacaoLotacao: "Fora da escola", saldo: 30, cargoGestao: false, ltsConcomitante: false },
  { id: 14, orgao: "SEDUC", nome: "Lívia Rodrigues Martins", matricula: "551138", cargo: "Professor", vinculo: "Efetivo", lotacaoNome: "Escola Estadual Antônio Ferreira", situacaoLotacao: "Em escola", saldo: 45, cargoGestao: false, ltsConcomitante: true, periodoAquisitivoFechado: true },
  { id: 15, orgao: "SEDUC", nome: "Marcos Vieira Souza", matricula: "551141", cargo: "Professor", vinculo: "Efetivo", lotacaoNome: "Escola Estadual Antônio Ferreira", situacaoLotacao: "Em escola", saldo: 45, cargoGestao: false, ltsConcomitante: false, afastamentoConcomitante: "Licença para acompanhamento de familiar" },
  { id: 16, orgao: "SEDUC", nome: "Paulo Henrique Alves", matricula: "551155", cargo: "Professor", vinculo: "Efetivo", lotacaoNome: "Escola Estadual Antônio Ferreira", situacaoLotacao: "Em escola", saldo: 45, cargoGestao: false, ltsConcomitante: false, vinculoEncerrado: true },
  { id: 17, orgao: "SEDUC", nome: "Sônia Maria Ribeiro", matricula: "551163", cargo: "Professor", vinculo: "Efetivo", lotacaoNome: "Escola Estadual Antônio Ferreira", situacaoLotacao: "Em escola", saldo: 45, cargoGestao: false, ltsConcomitante: false, feriasConcomitante: true },
];

const lotacoesProfessores = [
  { orgao: "SEDUC", nome: "Escola Estadual Antônio Ferreira", situacaoLotacao: "Em escola" },
  { orgao: "SEDUC", nome: "Sede SEDUC", situacaoLotacao: "Fora da escola" },
  { orgao: "SEDUC", nome: "Escola Estadual Marechal Rondon", situacaoLotacao: "Em escola" },
  { orgao: "SEDUC", nome: "EE Tiradentes", situacaoLotacao: "Em escola" },
  { orgao: "UNEMAT", nome: "Câmpus Universitário de Cáceres (Jane Vanini)", situacaoLotacao: "Em unidade universitária" },
  { orgao: "UNEMAT", nome: "Câmpus Universitário de Sinop", situacaoLotacao: "Em unidade universitária" },
  { orgao: "SECITEC", nome: "ETEC de Cuiabá", situacaoLotacao: "Em escola" },
  { orgao: "SECITEC", nome: "ETEC de Rondonópolis", situacaoLotacao: "Em escola" },
] as const;

const nomesExemplo = [
  "Adriana", "Alexandre", "Amanda", "André", "Camila",
  "Carlos", "Daniel", "Eduarda", "Felipe", "Fernanda",
  "Gabriel", "Helena", "Isabela", "João", "Juliana",
  "Lucas", "Marcelo", "Mariana", "Paulo", "Renata",
];
const sobrenomesExemplo = ["Almeida", "Barbosa", "Carvalho", "Dias", "Lopes"];
const sobrenomesUnidade = ["Moraes", "Ribeiro", "Nogueira", "Pereira", "Costa", "Oliveira"];

const professoresLote: ProfessorLote[] = lotacoesProfessores.flatMap((lotacao, unidadeIndex) => {
  const existentes = professoresLoteBase.filter(
    (professor) => professor.orgao === lotacao.orgao && professor.lotacaoNome === lotacao.nome,
  );
  const nomesUsados = new Set(existentes.map((professor) => professor.nome));
  const exemplos: ProfessorLote[] = [];

  for (let indice = 0; existentes.length + exemplos.length < 100; indice += 1) {
    const primeiroNome = nomesExemplo[indice % nomesExemplo.length];
    const sobrenome = sobrenomesExemplo[Math.floor(indice / nomesExemplo.length) % sobrenomesExemplo.length];
    const nome = `${primeiroNome} ${sobrenome} ${sobrenomesUnidade[unidadeIndex]}`;
    if (nomesUsados.has(nome)) continue;
    nomesUsados.add(nome);

    const estaEmEscola = lotacao.situacaoLotacao === "Em escola";
    // ~1 em cada 5 registros gerados é cargo de apoio/gestão (público do Agendamento em Lote);
    // os demais são professor (público da Coletiva).
    const ehApoioOuGestao = indice % 5 === 4;
    const cargo = ehApoioOuGestao ? (indice % 10 === 4 ? "Gestão" : "Apoio") : "Professor";
    // Apoio/gestão não tem direito aos 45 dias (exclusivo de professor) — o teto é 30, mas o
    // saldo disponível varia por servidor (férias já parcialmente usadas, admissão recente etc.),
    // para demonstrar o bloqueio de parcelas que somam mais do que o saldo de cada um.
    const SALDOS_APOIO_GESTAO = [10, 15, 20, 25, 30] as const;
    const saldoEsperado: 10 | 15 | 20 | 25 | 30 | 45 = ehApoioOuGestao
      ? SALDOS_APOIO_GESTAO[indice % SALDOS_APOIO_GESTAO.length]
      : lotacao.orgao === "UNEMAT" || estaEmEscola ? 45 : 30;
    const saldoInconsistente = ehApoioOuGestao ? indice % 20 === 4 : indice % 10 === 0;
    const saldo: 10 | 15 | 20 | 25 | 30 | 45 = saldoInconsistente
      ? (ehApoioOuGestao ? 45 : estaEmEscola ? 30 : 45)
      : saldoEsperado;
    exemplos.push({
      id: 100000 + unidadeIndex * 1000 + indice,
      orgao: lotacao.orgao,
      nome,
      matricula: String(700000 + unidadeIndex * 1000 + indice),
      cargo,
      vinculo: indice % 4 === 0 ? "Contrato Temporário" : "Efetivo",
      lotacaoNome: lotacao.nome,
      situacaoLotacao: lotacao.situacaoLotacao,
      saldo,
      saldoConfirmado: lotacao.orgao !== "UNEMAT",
      cargoGestao: false,
      ltsConcomitante: indice % 17 === 0,
      cedido: false,
      remocaoRecentePendente: false,
      periodoAquisitivoFechado: indice % 8 === 0,
      afastamentoConcomitante: indice % 23 === 0 ? "Afastamento de acompanhamento familiar" : undefined,
      vinculoEncerrado: indice % 31 === 0,
      feriasConcomitante: indice % 29 === 0,
    });
  }

  return [...existentes, ...exemplos];
});

// Dados mock e STORAGE_KEY vivem em ./feriasMockDados — ver o comentário lá para o motivo
// (evita invalidar o Fast Refresh deste arquivo de componentes).

/** RN-01/RN-02/RN-03 (Regras de Bloqueio LTS × Férias, adaptadas à concomitância férias×férias):
 * ao lançar uma nova solicitação, verifica se o servidor já tem férias/recesso ativo sobrepondo
 * o período escolhido. Se a sobreposição já está em andamento, bloqueia; se é só agendada
 * (futura), apenas alerta — sem impedir o lançamento. */
function registrosAtivosPersistidos(): FeriasRegistro[] {
  try {
    const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as FeriasRegistro[] | null;
    return (salvos ?? registrosBase).filter(
      (registro) => registro.situacao !== "REPROVADO" && registro.situacao !== "PRAZO EXPIRADO",
    );
  } catch {
    return [];
  }
}

/** Intervalos de datas ocupados por um registro para fins de sobreposição. Para um registro
 * SUSPENSO por Art. 17, o direito é preservado e as férias têm retorno previsto (prorrogadas
 * pelos dias suspensos) — então o período ocupado vai do início original até a NOVA data de
 * término (fim original + dias suspensos). Um novo lançamento não pode cair nessa janela. */
function intervalosOcupados(registro: FeriasRegistro): Array<{ inicio: string; fim: string }> {
  const parcelas = registro.parcelas.filter((p) => p.inicio && p.fim);
  if (registro.situacao === "SUSPENSO" && registro.fundamentoSuspensao === "ART_17") {
    const inicioOriginal = parcelas.reduce<string | null>((menor, p) => (menor === null || p.inicio < menor ? p.inicio : menor), null);
    // Nova data de término = último dia do calendário do motor aplicado no retorno (RN031).
    const fimNovo = parcelasNoRetornoSuspensao(registro).reduce<string | null>((maior, p) => (maior === null || p.fim > maior ? p.fim : maior), null);
    if (inicioOriginal && fimNovo) {
      return [{ inicio: inicioOriginal, fim: fimNovo }];
    }
  }
  return parcelas.map((p) => ({ inicio: p.inicio, fim: p.fim }));
}

/** Situação inicial do lançamento conforme a origem: SIGEP nasce "Agendada" (EM ABERTO) sem
 * aprovação; Portal do Servidor nasce "Aguardando Validação" (a chefia imediata valida). */
function situacaoInicialPorOrigem(origem: Origem): SituacaoFerias {
  return origem === "PORTALSERVIDOR" ? "AGUARDANDO VALIDAÇÃO" : "EM ABERTO";
}

function conflitoFeriasServidor(matricula: string, inicio: string, fim: string, ignorarRegistroId?: number): FeriasRegistro | null {
  if (!matricula || !inicio || !fim) return null;
  return registrosAtivosPersistidos().find(
    (registro) =>
      registro.matricula === matricula &&
      registro.id !== ignorarRegistroId &&
      intervalosOcupados(registro).some((periodo) => periodo.inicio <= fim && inicio <= periodo.fim),
  ) ?? null;
}

/** RN-FOL-08: localiza um registro do servidor que ficou SUSPENSO por superior interesse
 * público (Art. 17) com dias pendentes de gozo. Ao fazer um NOVO agendamento, esses dias são
 * incluídos (cobrados) na competência do novo gozo. O módulo de Férias trata apenas de dias. */
function pendenciaArt17Pendente(matricula: string): FeriasRegistro | null {
  if (!matricula) return null;
  try {
    const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as FeriasRegistro[] | null;
    return (
      (salvos ?? registrosBase).find(
        (registro) =>
          registro.matricula === matricula &&
          registro.situacao === "SUSPENSO" &&
          registro.fundamentoSuspensao === "ART_17" &&
          registro.pendenciaSaldo?.origem === "SUSPENSAO_ART17",
      ) ?? null
    );
  } catch {
    return null;
  }
}

/** RN003 (Validação de sobreposição de férias e recessos): qualquer sobreposição de datas com
 * outro agendamento do mesmo servidor — rascunho/Aguardando Validação ou Agendada/homologado,
 * não importa se já em andamento ou ainda futuro — bloqueia o lançamento com esta mensagem. */
function mensagemConflitoAgendamento(conflito: FeriasRegistro): string {
  const tipoLabel = conflito.tipo === "Recesso" ? "Recesso" : "Férias";
  // Registro suspenso por Art. 17: o direito é preservado e há retorno previsto (fim original +
  // dias suspensos). Não cabe novo lançamento que colida com essa janela de retorno.
  if (conflito.situacao === "SUSPENSO" && conflito.fundamentoSuspensao === "ART_17") {
    const ocupado = intervalosOcupados(conflito)[0];
    const periodoSuspenso = ocupado ? `${formatarDataBr(ocupado.inicio)} e ${formatarDataBr(ocupado.fim)}` : periodoUsufruto(conflito);
    return `Não é possível realizar um novo lançamento. O servidor tem férias suspensas por interesse público (Art. 17) com retorno previsto entre ${periodoSuspenso} — o direito foi preservado e os dias serão retomados. Aguarde o retorno para um novo agendamento.`;
  }
  const inicio = inicioUsufruto(conflito);
  const fim = fimUsufruto(conflito);
  const periodo = inicio && fim ? `${formatarDataBr(inicio)} e ${formatarDataBr(fim)}` : periodoUsufruto(conflito);
  return `Não é possível agendar o período informado. Já existe um agendamento de ${tipoLabel} cadastrado entre ${periodo}. Altere o agendamento anterior para prosseguir.`;
}

/** RN-01/RN-02 (Regras de Bloqueio LTS × Férias): mock de LTS (licença para tratamento de saúde)
 * já lançadas no módulo de Licenças e Afastamentos — simula a verificação de concomitância ao
 * lançar férias para um servidor que já tem LTS registrada no mesmo período. */
const LTS_MOCK: Record<string, { inicio: string; fim: string }[]> = {
  "270045": [{ inicio: "2026-11-01", fim: "2026-11-15" }],
  "395077": [{ inicio: "2026-12-01", fim: "2026-12-15" }],
  "399099": [{ inicio: "2026-11-20", fim: "2026-12-05" }],
  "420033": [{ inicio: "2026-11-10", fim: "2026-11-24" }],
};

function conflitoLtsServidor(matricula: string, inicio: string, fim: string): { inicio: string; fim: string } | null {
  if (!matricula || !inicio || !fim) return null;
  const lts = LTS_MOCK[matricula] ?? [];
  return lts.find((periodo) => periodo.inicio <= fim && inicio <= periodo.fim) ?? null;
}

/** RN-MOT-01: substitui SOMENTE as parcelas-alvo da suspensão pelo novo calendário do motor
 * (blocos de dias consecutivos). As demais parcelas do registro ficam inalteradas. O 1/3 da
 * parcela suspensa fica no primeiro bloco. */
function parcelasComNovoCalendario(parcelas: ParcelaFerias[], idsAlvo: Set<number>, novas: IntervaloGozo[]): ParcelaFerias[] {
  const alvo = parcelas.filter((parcela) => idsAlvo.has(parcela.id));
  if (!alvo.length || !novas.length) return parcelas;
  const blocos: ParcelaFerias[] = novas.map((bloco, indice) => ({
    id: alvo[indice]?.id ?? gerarId(),
    inicio: bloco.inicio,
    fim: bloco.fim,
    dias: diasEntre(bloco.inicio, bloco.fim) + 1,
    ...(indice === 0 && alvo.some((parcela) => parcela.terco) ? { terco: true } : {}),
  }));
  const demais = parcelas.filter((parcela) => !idsAlvo.has(parcela.id));
  return [...demais, ...blocos].sort((a, b) => a.inicio.localeCompare(b.inicio));
}

/** RN023: parcelas aplicadas no retorno automático. Usa o calendário gravado na efetivação; para
 * registros antigos (sem esse campo), recalcula pelo motor com o início e o retorno gravados. */
function parcelasNoRetornoSuspensao(registro: FeriasRegistro): ParcelaFerias[] {
  if (registro.parcelasAposRetorno?.length) return registro.parcelasAposRetorno;
  const retorno = registro.dataRetornoSuspensao;
  if (!retorno) return registro.parcelas;
  const idsAlvo = new Set(registro.parcelaSuspensaId != null ? [registro.parcelaSuspensaId] : registro.parcelas.map((parcela) => parcela.id));
  const alvo = registro.parcelas.filter((parcela) => idsAlvo.has(parcela.id));
  const inicio = registro.suspensaoArt17?.inicio ?? adicionarDiasISO(retorno, -(registro.diasSuspensos ?? 0));
  const resultado = calcularImpactoSuspensao({
    parcelas: alvo.map((parcela) => ({ inicio: parcela.inicio, fim: parcela.fim })),
    fundamento: "ART_17",
    suspensaoInicio: inicio,
    suspensaoFim: adicionarDiasISO(retorno, -1),
    competenciaFolhaCorrente: dataLocalISO().slice(0, 7),
  });
  return parcelasComNovoCalendario(registro.parcelas, idsAlvo, resultado.novasParcelas);
}

/** RN033 (PD05): o novo período da parcela suspensa (a partir do retorno) não pode sobrepor outra
 * parcela do mesmo registro, outro agendamento ativo do servidor nem LTS. Retorna a mensagem do
 * primeiro conflito ou null. */
function conflitoNovoCalendarioSuspensao(
  registro: FeriasRegistro,
  idsAlvo: Set<number>,
  novas: IntervaloGozo[],
  retorno: string,
): string | null {
  const outrasParcelas = registro.parcelas.filter((parcela) => !idsAlvo.has(parcela.id));
  for (const bloco of novas.filter((intervalo) => intervalo.fim >= retorno)) {
    const inicio = bloco.inicio < retorno ? retorno : bloco.inicio;
    const periodo = `${formatarDataBr(inicio)} a ${formatarDataBr(bloco.fim)}`;
    const parcela = outrasParcelas.find((outra) => outra.inicio <= bloco.fim && inicio <= outra.fim);
    if (parcela) {
      return `O novo período da parcela suspensa (${periodo}) sobrepõe a parcela de ${formatarDataBr(parcela.inicio)} a ${formatarDataBr(parcela.fim)} deste registro. Ajuste a data de fim da suspensão.`;
    }
    const conflito = conflitoFeriasServidor(registro.matricula, inicio, bloco.fim, registro.id);
    if (conflito) return mensagemConflitoAgendamento(conflito);
    const lts = conflitoLtsServidor(registro.matricula, inicio, bloco.fim);
    if (lts) {
      return `O novo período da parcela suspensa (${periodo}) coincide com a LTS de ${formatarDataBr(lts.inicio)} a ${formatarDataBr(lts.fim)}. Ajuste a data de fim da suspensão.`;
    }
  }
  return null;
}

/** RN-03 (adaptada): se o período escolhido cair em cima de uma LTS vigente do servidor, a data
 * de início é ajustada automaticamente para o dia seguinte ao fim da LTS — a férias nunca corre
 * por cima de um atestado já em curso. */
function ajustarInicioParaAposLts(
  inicio: string,
  dias: number,
  matricula: string,
): { inicio: string; fim: string; ajustado: boolean; lts: { inicio: string; fim: string } | null } {
  const fimOriginal = calcularFim(inicio, dias);
  const lts = conflitoLtsServidor(matricula, inicio, fimOriginal);
  if (!lts) return { inicio, fim: fimOriginal, ajustado: false, lts: null };
  const novoInicio = adicionarDiasISO(lts.fim, 1);
  return { inicio: novoInicio, fim: calcularFim(novoInicio, dias), ajustado: true, lts };
}

/** Agendamento em Lote (gestão/apoio): parcelas de duração fixa, com datas de início
 * configuráveis individualmente — diferente da Coletiva (julho/janeiro fixos). */
const DURACOES_LOTE = [10, 15, 20, 30] as const;
type DuracaoLote = (typeof DURACOES_LOTE)[number];

function calcularFim(inicio: string, dias: number) {
  if (!inicio || !dias) return "";
  const data = new Date(inicio + "T00:00:00");
  data.setDate(data.getDate() + (dias - 1));
  return data.toISOString().slice(0, 10);
}

function dataLocalISO(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function adicionarDiasISO(dataISO: string, dias: number) {
  const data = new Date(`${dataISO}T00:00:00`);
  data.setDate(data.getDate() + dias);
  return dataLocalISO(data);
}

function diasEntre(dataA: string, dataB: string) {
  const a = new Date(dataA + "T00:00:00");
  const b = new Date(dataB + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function calcularCarencia(inicio: string) {
  if (!inicio) return null;
  const hoje = dataLocalISO();
  const totalDias = diasEntre(inicio, hoje);
  if (totalDias < 0) return null;
  const meses = Math.floor(totalDias / 30.44);
  const diasRestantes = Math.round(totalDias - meses * 30.44);
  return {
    totalDias,
    meses,
    diasRestantes,
    hoje,
    cumpre4: totalDias >= 120,
    cumpre6: totalDias >= 182,
    cumpre12: totalDias >= 365,
  };
}

/** Decreto 656/2020: entre uma parcela e a próxima, o intervalo de folga só
 * pode ser zero (parcela seguinte começa no dia imediatamente após o fim da
 * anterior) ou 10 dias corridos — nenhum valor intermediário. */
function validarIntervaloParcelas(parcelas: ParcelaFerias[]): string {
  const ordenadas = [...parcelas].filter((parcela) => parcela.inicio && parcela.fim).sort((a, b) => (a.inicio < b.inicio ? -1 : 1));
  for (let i = 1; i < ordenadas.length; i++) {
    const anterior = ordenadas[i - 1];
    const atual = ordenadas[i];
    const gap = diasEntre(anterior.fim, atual.inicio) - 1;
    if (gap !== 0 && gap !== 10) {
      return `Intervalo entre parcelas inválido (${formatarDataBr(anterior.fim)} → ${formatarDataBr(atual.inicio)}): só é permitido intervalo de 0 ou 10 dias corridos entre uma parcela e a próxima.`;
    }
  }
  return "";
}

/** RN017: prazo de validação da chefia = dia 09 do mês anterior ao início do usufruto (parcela
 * mais antiga). A partir do dia 10, o verificador encerra a solicitação ainda pendente. Sem
 * data de usufruto, usa o calendário de fechamento da folha (referência anterior do protótipo). */
function calcularPrazoValidacaoChefia(inicioUsufruto?: string | null): string {
  if (inicioUsufruto) return prazosAgendamento(inicioUsufruto).limiteValidacao;
  let calendario: Record<string,string> = {};
  try { calendario = JSON.parse(localStorage.getItem('ferias-calendario-folha') ?? '{}'); } catch { /* usa calendário padrão */ }
  return prazoFechamentoFolha(dataLocalISO(), calendario);
}

/** RN017: primeiro dia de usufruto que ainda pode ser registrado hoje — dia 01 do mês seguinte
 * se hoje ≤ dia 05; senão, dia 01 do mês subsequente. */
function primeiroInicioUsufrutoPermitido(hoje: string): string {
  const [ano, mes, dia] = hoje.split("-").map(Number);
  const avanco = dia <= 5 ? 1 : 2;
  const data = new Date(ano, mes - 1 + avanco, 1);
  return dataLocalISO(data);
}

/** Início do usufruto (parcela mais antiga) de uma lista de parcelas. */
function inicioMaisAntigoParcelas(parcelas: Array<{ inicio: string }>): string | null {
  return parcelas.map((p) => p.inicio).filter(Boolean).sort()[0] ?? null;
}

function prazoValidacaoExpirado(registro: FeriasRegistro): boolean {
  if (registro.situacao !== "AGUARDANDO VALIDAÇÃO" || !registro.dataLimiteValidacaoChefia) return false;
  const hoje = dataLocalISO();
  return hoje > registro.dataLimiteValidacaoChefia;
}

function formatarDataBr(iso: string) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

/** Rótulo de ação exibido na linha do tempo do modal "Histórico", por tipo de ação/situação. */
function rotuloAcaoHistorico(acao: string, situacao: SituacaoFerias): string {
  const rotulos: Record<string, string> = {
    lancamento: "Lançamento",
    validar: "Validação",
    rejeitar: "Rejeição",
    suspender: "Suspensão",
    solicitar_suspensao: "Suspensão solicitada (aguarda validação)",
    aprovar_suspensao: "Suspensão aprovada (etapa)",
    rejeitar_suspensao: "Suspensão rejeitada",
    reativar: "Reabertura",
    retorno_suspensao: "Retorno da suspensão",
    expiracao: "Prazo expirado",
    quitacao: "Quitação automática",
    remanejamento: "Remanejamento de datas",
    edicao: "Alteração da solicitação",
  };
  return rotulos[acao] ?? rotuloSituacao(situacao);
}

/** Ícone + tom (cor) de cada tipo de evento do histórico, para o marcador da linha do tempo. */
function estiloAcaoHistorico(acao: string): { icone: string; tom: string } {
  const mapa: Record<string, { icone: string; tom: string }> = {
    lancamento: { icone: "pi-flag", tom: "neutro" },
    validar: { icone: "pi-check-circle", tom: "verde" },
    rejeitar: { icone: "pi-times-circle", tom: "vermelho" },
    suspender: { icone: "pi-pause-circle", tom: "ambar" },
    solicitar_suspensao: { icone: "pi-hourglass", tom: "ambar" },
    aprovar_suspensao: { icone: "pi-verified", tom: "verde" },
    rejeitar_suspensao: { icone: "pi-times-circle", tom: "vermelho" },
    reativar: { icone: "pi-replay", tom: "azul" },
    retorno_suspensao: { icone: "pi-undo", tom: "verde" },
    expiracao: { icone: "pi-clock", tom: "vermelho" },
    quitacao: { icone: "pi-check-square", tom: "azul" },
    remanejamento: { icone: "pi-arrow-right-arrow-left", tom: "azul" },
    edicao: { icone: "pi-pencil", tom: "neutro" },
  };
  return mapa[acao] ?? { icone: "pi-circle", tom: "neutro" };
}

/** Descreve, em texto, como as parcelas (datas/dias) mudaram entre a versão anterior e a nova —
 * usado para registrar o remanejamento no histórico. Retorna null quando nada mudou. */
function descreverAlteracaoParcelas(anteriores: ParcelaFerias[], novas: ParcelaFerias[]): string | null {
  const resumo = (parcelas: ParcelaFerias[]) =>
    [...parcelas]
      .sort((a, b) => a.inicio.localeCompare(b.inicio))
      .map((p) => `${formatarDataBr(p.inicio)} a ${formatarDataBr(p.fim)} (${p.dias} dia${p.dias === 1 ? "" : "s"})`)
      .join("; ");
  const antes = resumo(anteriores);
  const depois = resumo(novas);
  if (antes === depois) return null;
  return `Período anterior: ${antes || "—"}. Novo período: ${depois || "—"}.`;
}

/** Monta o evento de histórico para uma edição de solicitação: distingue remanejamento de datas
 * (parcelas alteradas) de uma alteração simples, anexando a justificativa/documento informados. */
function eventoEdicao(
  registro: FeriasRegistro,
  novasParcelas: ParcelaFerias[],
  situacaoFinal: SituacaoFerias,
  documento?: DocumentoFerias,
): HistoricoEventoFerias[] {
  const mudancaDatas = descreverAlteracaoParcelas(registro.parcelas, novasParcelas);
  // RN-FOL-02 / RN-CAN-03: remanejar com adiantamento já pago gera débito (estorno) na folha.
  const avisoDebito = mudancaDatas && registro.adiantamentoPago
    ? " Adiantamento já pago: o valor do período original torna-se indevido — gerado débito (estorno) a descontar na próxima folha."
    : "";
  // Período anterior × novo (consolidado em um intervalo) para o painel visual do remanejamento.
  const extremos = (parcelas: ParcelaFerias[]) => {
    const ini = parcelas.reduce<string | null>((m, p) => (m === null || p.inicio < m ? p.inicio : m), null);
    const fim = parcelas.reduce<string | null>((m, p) => (m === null || p.fim > m ? p.fim : m), null);
    const dias = parcelas.reduce((s, p) => s + p.dias, 0);
    return { ini, fim, dias };
  };
  const antes = extremos(registro.parcelas);
  const depois = extremos(novasParcelas);
  const remanejamento =
    mudancaDatas && antes.ini && antes.fim && depois.ini && depois.fim
      ? { anteriorInicio: antes.ini, anteriorFim: antes.fim, anteriorDias: antes.dias, novoInicio: depois.ini, novoFim: depois.fim, novoDias: depois.dias }
      : undefined;
  return comHistorico(registro, {
    situacao: situacaoFinal,
    acao: mudancaDatas ? "remanejamento" : "edicao",
    responsavel: "Gestor",
    responsavelMatricula: USUARIO_ATOR_MOCK.Gestor.matricula,
    responsavelVinculo: USUARIO_ATOR_MOCK.Gestor.vinculo,
    justificativa: (mudancaDatas ?? "Alteração da solicitação de férias.") + avisoDebito,
    documentos: documento ? [documento] : undefined,
    remanejamento,
  });
}

/** Acrescenta um evento à linha do tempo do registro (histórico de situações). */
function comHistorico(
  registro: FeriasRegistro,
  evento: Omit<HistoricoEventoFerias, "data"> & { data?: string },
): HistoricoEventoFerias[] {
  // Registros do mock podem não ter histórico. Antes de acrescentar o novo evento, semeia o
  // lançamento original, para a linha do tempo não ficar só com o último evento (ex.: quitação).
  const base: HistoricoEventoFerias[] = registro.historico?.length
    ? registro.historico
    : [{
        situacao: "EM ABERTO",
        acao: "lancamento",
        data: registro.lancadoEm,
        responsavel: registro.responsavelLancamento,
        documentos: registro.documentos,
      }];
  return [
    ...base,
    { data: new Date().toLocaleString("pt-BR"), ...evento },
  ];
}

/** Entrada da decisão do aprovador na tela (conferência documental e dados da publicação no DO). */
interface EntradaFluxoUI {
  documentacaoConferida?: boolean;
  publicacao?: { numero: string; data: string };
}

/** Setorial registra a suspensão Art. 17: o registro continua "Agendada" e a suspensão fica
 * pendente até a validação do órgão central. Nada é recalculado na folha nesta etapa. */
function solicitarSuspensaoPendente(
  registro: FeriasRegistro,
  dados: DadosSuspensao,
  processo: ProcessoAprovacao,
  perfil: PerfilAcesso,
  justificativa?: string,
  documento?: DocumentoFerias,
): FeriasRegistro {
  const ator = atorHistorico(perfil);
  const solicitadoPor = `${ator.rotulo} · Matrícula ${ator.matricula} / ${ator.vinculo}`;
  return {
    ...registro,
    documentos: documento ? [...(registro.documentos ?? []), documento] : registro.documentos,
    suspensaoPendente: {
      dados: { ...dados, solicitante: solicitadoPor, autorizadoPeloDirigente: false },
      processo,
      solicitadoPor,
      solicitadoEm: new Date().toLocaleString("pt-BR"),
      documento,
    },
    historico: comHistorico(registro, {
      situacao: registro.situacao,
      acao: "solicitar_suspensao",
      responsavel: ator.rotulo,
      responsavelMatricula: ator.matricula,
      responsavelVinculo: ator.vinculo,
      justificativa: justificativa?.trim() || dados.causa,
      documentos: documento ? [documento] : undefined,
      fundamentoSuspensao: dados.fundamento,
      suspensaoInicio: dados.suspensaoInicio,
      suspensaoFim: dados.suspensaoFim,
      suspensaoDias: dados.prazoEstimadoDias,
      novaDataTerminoFerias: dados.novaDataTerminoFerias,
      causaSuspensao: dados.causa,
      feriasOriginalInicio: inicioUsufruto(registro) ?? undefined,
      feriasOriginalFim: fimUsufruto(registro) ?? undefined,
      aprovacaoEtapa: "Aguardando validação",
    }),
  };
}

/** Decisão do aprovador sobre a suspensão pendente. Quando a última etapa é aprovada, devolve
 * `efetivar` com os dados guardados para o chamador efetivar a suspensão (e disparar o motor). */
function decidirSuspensaoPendente(
  registro: FeriasRegistro,
  acao: "aprovar_suspensao" | "rejeitar_suspensao",
  perfil: PerfilAcesso,
  entrada: { justificativa?: string } & EntradaFluxoUI,
): { registro: FeriasRegistro; efetivar?: DadosSuspensao; etapa?: string } {
  const pendente = registro.suspensaoPendente;
  if (!pendente) return { registro };
  const ator = atorHistorico(perfil);
  const quando = new Date().toLocaleString("pt-BR");
  const identificacao = { responsavel: ator.rotulo, responsavelMatricula: ator.matricula, responsavelVinculo: ator.vinculo };
  const nivel = nivelDoProcesso(pendente.processo);
  const rotuloNivel = nivel?.rotulo ?? "órgão central";

  if (acao === "rejeitar_suspensao") {
    const r = registrarDecisao(pendente.processo, {
      perfil, decisao: "REJEITADO", responsavel: ator.rotulo, matricula: ator.matricula, em: quando, justificativa: entrada.justificativa,
    });
    if (!r.sucesso) return { registro };
    return {
      registro: {
        ...registro,
        suspensaoPendente: undefined,
        historico: comHistorico(registro, {
          situacao: registro.situacao,
          acao: "rejeitar_suspensao",
          ...identificacao,
          justificativa: entrada.justificativa?.trim(),
          aprovacaoEtapa: `Suspensão rejeitada — ${rotuloNivel}. O usufruto segue normalmente.`,
        }),
      },
    };
  }

  const aguardandoPublicacao = pendente.processo.status === "AGUARDANDO_PUBLICACAO";
  const r = aguardandoPublicacao
    ? registrarPublicacao(pendente.processo, perfil, entrada.publicacao ?? { numero: "", data: "" })
    : registrarDecisao(pendente.processo, {
        perfil, decisao: "APROVADO", responsavel: ator.rotulo, matricula: ator.matricula, em: quando, documentacaoConferida: entrada.documentacaoConferida,
      });
  if (!r.sucesso) return { registro };

  const textoPublicacao = r.processo.publicacao
    ? ` · DO nº ${r.processo.publicacao.numero} de ${formatarDataBr(r.processo.publicacao.data)}`
    : "";
  if (r.processo.status === "APROVADO") {
    return {
      registro: { ...registro, suspensaoPendente: undefined },
      efetivar: { ...pendente.dados, autorizadoPeloDirigente: true },
      etapa: `Validada por ${rotuloNivel}${textoPublicacao}`,
    };
  }
  const proximo = nivelDoProcesso(r.processo);
  return {
    registro: {
      ...registro,
      suspensaoPendente: { ...pendente, processo: r.processo },
      historico: comHistorico(registro, {
        situacao: registro.situacao,
        acao: "aprovar_suspensao",
        ...identificacao,
        aprovacaoEtapa:
          r.processo.status === "AGUARDANDO_PUBLICACAO"
            ? `Aprovada por ${rotuloNivel}; aguardando publicação no Diário Oficial`
            : `Aprovada por ${rotuloNivel}; segue para ${proximo?.rotulo ?? "próximo nível"}`,
      }),
    },
  };
}

function periodoUsufruto(registro: FeriasRegistro) {
  const inicio = inicioUsufruto(registro);
  const fim = fimUsufruto(registro);
  if (!inicio || !fim) return "—";
  return `${formatarDataBr(inicio)} a ${formatarDataBr(fim)}`;
}

/** RN-03 (Regras de Bloqueio LTS × Férias): férias "em andamento" — já iniciadas e aprovadas —
 * não podem ser alteradas nem canceladas, salvo calamidade pública/convocação (RN-04), que
 * exige número de portaria/ofício em vez de justificativa livre. */
function feriasEmAndamento(registro: FeriasRegistro) {
  if (registro.situacao !== "EM ABERTO") return false;
  const hoje = dataLocalISO();
  return registro.parcelas.some((parcela) => parcela.inicio <= hoje && hoje <= parcela.fim);
}

function periodoAquisitivoLabel(registro: FeriasRegistro) {
  if (registro.periodoAquisitivoLabel) return registro.periodoAquisitivoLabel;
  if (!registro.periodoAquisitivoInicio) return "—";
  return `${formatarDataBr(registro.periodoAquisitivoInicio)} à ${formatarDataBr(registro.periodoAquisitivoFim)}`;
}

function tipoRegistroDe(tipoVinculo: TipoVinculo): TipoRegistro {
  return tipoVinculo === "Residente Técnico" || tipoVinculo === "Estagiário"
    ? "LICENÇA REMUNERADA"
    : "FÉRIAS";
}

function permiteSolicitacaoFerias(tipoVinculo: TipoVinculo): boolean {
  return tipoVinculo === "Efetivo" || tipoVinculo === "Comissionado" || tipoVinculo === "Contrato Temporário";
}

function diasSolicitados(registro: FeriasRegistro) {
  return registro.parcelas.reduce((total, parcela) => total + parcela.dias, 0);
}

/** Mostra a composição das parcelas (ex.: "15 + 30") quando há mais de uma, em vez do total
 * somado — ajuda o usuário a enxergar de que etapas vem o total (ex.: COLETIVA 15+30). */

function situacaoSubstituicao(fim: string): "Vigente" | "Encerrada" {
  if (!fim) return "Vigente";
  const hoje = dataLocalISO();
  return fim >= hoje ? "Vigente" : "Encerrada";
}


function persistirRegistros(registros: FeriasRegistro[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
}

function rotuloSituacao(situacao: SituacaoFerias) {
  if (situacao === "EM ABERTO") return "Agendada";
  return situacao.charAt(0) + situacao.slice(1).toLocaleLowerCase("pt-BR");
}

function classeSituacao(situacao: SituacaoFerias) {
  return situacao
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-");
}

type AbaFerias = "gestao" | "aprovacoes" | "substituicoes";

const PERFIL_STORAGE_KEY = "prototype-ferias-perfil";

// Seletor de perfil simplificado para os dois papéis de regras-perfis-ferias.md: Gestor
// (lança/altera/cancela/suspende/reabre) e Aprovador (valida/reprova/exclui/força reabertura).
// Internamente reaproveitamos "RH / Gestão de Pessoas" e "DRE / RH Central" como valores de
// PerfilAcesso — "Servidor" e "Chefia Imediata" continuam existindo no tipo (perfilPodeAvaliarRegistro
// trata qualquer aprovador via podeAvaliar), só não ficam mais selecionáveis na tela.
function carregarPerfil(): PerfilAcesso {
  const salvo = localStorage.getItem(PERFIL_STORAGE_KEY);
  if (salvo === "RH / Gestão de Pessoas" || salvo === "DRE / RH Central") return salvo;
  return "RH / Gestão de Pessoas";
}

export function PrototiposFeriasPage() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState<FeriasRegistro[]>(carregarRegistros);
  const [perfil, setPerfil] = useState<PerfilAcesso>(carregarPerfil);
  const [aba, setAba] = useState<AbaFerias>("gestao");
  const [filtroOrgao, setFiltroOrgao] = useState("");
  const [filtroSetor, setFiltroSetor] = useState("");
  const [filtroVinculo, setFiltroVinculo] = useState('');
  const [filtroDre, setFiltroDre] = useState('');
  const [filtroServidor, setFiltroServidor] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState<"" | SituacaoFerias>("");
  const [fluxoNovaSolicitacao, setFluxoNovaSolicitacao] = useState<"escolha" | TipoSolicitacao | null>(null);
  const [registroSubstituicao, setRegistroSubstituicao] = useState<FeriasRegistro | null>(null);
  const [registroHistorico, setRegistroHistorico] = useState<FeriasRegistro | null>(null);
  // Registro com várias parcelas: "Visualizar" na linha abre só aquela parcela (?parcela=).
  const visualizarRegistro = (registro: FeriasRegistro, parcelaId?: number) =>
    navigate(`/prototipos/sigep/ferias/visualizar/${registro.id}${parcelaId != null ? `?parcela=${parcelaId}` : ""}`);
  const [menuAbertoId, setMenuAbertoId] = useState<number | string | null>(null);
  const [confirmacaoStatus, setConfirmacaoStatus] = useState<{ registro: FeriasRegistro; acao: AcaoStatus; loteId?: string; parcelaId?: number } | null>(null);
  const [subBusca, setSubBusca] = useState("");
  const [subSituacao, setSubSituacao] = useState<"" | "Vigente" | "Encerrada">("");
  const [fluxos] = useState<ConfiguracaoFluxo[]>(carregarFluxos);
  const atualizarRegistros = (proximos: FeriasRegistro[]) => {
    setRegistros(proximos);
    persistirRegistros(proximos);
  };

  useEffect(() => {
    const verificar = () => setRegistros(atuais => {
      if (!atuais.some(r => prazoValidacaoExpirado(r) || elegivelParaQuitacaoAutomatica(r) || elegivelParaRetornoSuspensao(r))) return atuais;
      const proximos = atuais.map(r => {
        if (prazoValidacaoExpirado(r)) return {...r, situacao:'PRAZO EXPIRADO' as const, historico: comHistorico(r, { situacao: 'PRAZO EXPIRADO', acao: 'expiracao', responsavel: 'Sistema (verificador automático)', justificativa: justificativaExpiracao(r.dataLimiteValidacaoChefia) })};
        // RN023: chegou a data de retorno da suspensão — o registro volta para "Agendada" e só a
        // parcela suspensa recebe o novo calendário do motor (dias usufruídos nas datas originais,
        // restantes deslocados). As demais parcelas do registro não mudam.
        if (elegivelParaRetornoSuspensao(r)) {
          const dias = r.diasSuspensos ?? 0;
          return {
            ...r,
            situacao: 'EM ABERTO' as const,
            parcelas: parcelasNoRetornoSuspensao(r),
            fundamentoSuspensao: undefined,
            dataRetornoSuspensao: undefined,
            parcelaSuspensaId: undefined,
            parcelasAposRetorno: undefined,
            historico: comHistorico(r, { situacao: 'EM ABERTO', acao: 'retorno_suspensao', responsavel: 'Sistema (verificador automático)', justificativa: `Retorno da suspensão após ${dias} dia(s) — férias retomadas; somente a parcela suspensa foi reagendada.` }),
          };
        }
        if (elegivelParaQuitacaoAutomatica(r)) return {...r, situacao:'QUITADO' as const, historico: comHistorico(r, { situacao: 'QUITADO', acao: 'quitacao', responsavel: 'Sistema (verificador automático)' })};
        return r;
      });
      persistirRegistros(proximos); return proximos;
    });
    verificar(); const timer = window.setInterval(verificar, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const alterarPerfil = (proximo: PerfilAcesso) => {
    setPerfil(proximo);
    localStorage.setItem(PERFIL_STORAGE_KEY, proximo);
    setMenuAbertoId(null);
  };

  const registrosPendentesAprovacao = useMemo(
    () => registros.filter((registro) => registro.situacao === "AGUARDANDO VALIDAÇÃO" || perfilPodeDecidir(registro.suspensaoPendente?.processo, perfil)),
    [registros, perfil],
  );

  const orgaosDisponiveis = useMemo(
    () => Array.from(new Set(registros.map((registro) => registro.orgao))).sort(),
    [registros],
  );
  const setoresDisponiveis = useMemo(
    () =>
      Array.from(
        new Set(
          registros
            .filter((registro) => !filtroOrgao || registro.orgao === filtroOrgao)
            .map((registro) => registro.setor),
        ),
      ).sort(),
    [registros, filtroOrgao],
  );

  const registrosFiltrados = useMemo(() => {
    const buscaNormalizada = filtroServidor.trim().toLocaleLowerCase("pt-BR");
    return registros.filter((registro) => {
      if (filtroOrgao && registro.orgao !== filtroOrgao) return false;
      if (filtroSetor && registro.setor !== filtroSetor) return false;
      if (filtroVinculo && registro.tipoVinculo !== filtroVinculo) return false;
      if (filtroDre && registro.dre !== filtroDre) return false;
      if (filtroSituacao && registro.situacao !== filtroSituacao) return false;
      if (
        buscaNormalizada &&
        !registro.servidorNome.toLocaleLowerCase("pt-BR").includes(buscaNormalizada) &&
        !registro.matricula.includes(buscaNormalizada)
      ) {
        return false;
      }
      return true;
    });
  }, [registros, filtroOrgao, filtroSetor, filtroServidor, filtroSituacao, filtroVinculo, filtroDre]);

  const linhasSubstituicao = useMemo(() => {
    const buscaNormalizada = subBusca.trim().toLocaleLowerCase("pt-BR");
    const linhas: LinhaSubstituicao[] = [];
    registros.forEach((registro) => {
      if (!elegivelSubstituicao(registro)) return;
      registro.substitutos.forEach((substituto) => {
        const situacaoSub = situacaoSubstituicao(substituto.fim);
        linhas.push({
          id: `${registro.id}-${substituto.id}`,
          titular: registro.servidorNome,
          cargo: registro.cargo,
          substitutoNome: substituto.nome,
          inicio: substituto.inicio,
          fim: substituto.fim,
          dias: diasSolicitados(registro),
          tipo: tipoRegistroDe(registro.tipoVinculo) === "LICENÇA REMUNERADA" ? "Licença médica" : "Férias",
          portaria: substituto.portaria,
          origem: registro.origem,
          situacao: situacaoSub,
        });
      });
    });
    return linhas.filter((linha) => {
      if (subSituacao && linha.situacao !== subSituacao) return false;
      if (
        buscaNormalizada &&
        !linha.titular.toLocaleLowerCase("pt-BR").includes(buscaNormalizada) &&
        !linha.substitutoNome.toLocaleLowerCase("pt-BR").includes(buscaNormalizada)
      ) {
        return false;
      }
      return true;
    });
  }, [registros, subBusca, subSituacao]);

  const indicadoresSubstituicao = useMemo(
    () => ({
      total: linhasSubstituicao.length,
      vigente: linhasSubstituicao.filter((linha) => linha.situacao === "Vigente").length,
      encerrada: linhasSubstituicao.filter((linha) => linha.situacao === "Encerrada").length,
      semPortaria: linhasSubstituicao.filter((linha) => !linha.portaria.trim()).length,
    }),
    [linhasSubstituicao],
  );


  const indicadores = useMemo(() => {
    const porSituacao = (situacao: SituacaoFerias) => registrosFiltrados.filter((registro) => registro.situacao === situacao).length;
    const porVinculo = (vinculo: TipoVinculo) => registrosFiltrados.filter((registro) => registro.tipoVinculo === vinculo).length;
    const porTipoRegistro = (tipo: TipoRegistro) => registrosFiltrados.filter((registro) => tipoRegistroDe(registro.tipoVinculo) === tipo).length;
    return {
      total: registrosFiltrados.length,
      emAberto: porSituacao("EM ABERTO"),
      quitado: porSituacao("QUITADO"),
      suspenso: porSituacao("SUSPENSO"),
      aguardandoValidacao: porSituacao("AGUARDANDO VALIDAÇÃO"),
      comissionado: porVinculo("Comissionado"),
      contratoTemporario: porVinculo("Contrato Temporário"),
      residenteTecnico: porVinculo("Residente Técnico"),
      estagiario: porVinculo("Estagiário"),
      ferias: porTipoRegistro("FÉRIAS"),
      licencaRemunerada: porTipoRegistro("LICENÇA REMUNERADA"),
      prazoExpirado: registrosFiltrados.filter(r => r.situacao === "PRAZO EXPIRADO" || prazoValidacaoExpirado(r)).length,
    };
  }, [registrosFiltrados]);

  const limparFiltros = () => {
    setFiltroOrgao("");
    setFiltroVinculo("");
    setFiltroDre("");
    setFiltroSetor("");
    setFiltroServidor("");
    setFiltroSituacao("");
  };

  // Editar é por parcela (RN005): em "Aguardando Validação" a edição é livre; em "Agendada", a
  // parcela da linha pode ser editada enquanto ainda não iniciou — mesmo que outra parcela do
  // mesmo registro já esteja em usufruto. Parcela em usufruto ou já usufruída não é editável.
  // Sem parcela (registro de parcela única), vale o registro todo: não pode estar em andamento.
  const podeEditar = (registro: FeriasRegistro, parcela?: ParcelaFerias | null) => {
    const tipoEditavel =
      registro.tipo === "Individual" || registro.tipo === "Recesso" ||
      registro.tipo === "Lote" || registro.tipo === "Coletiva";
    if (!tipoEditavel) return false;
    if (registro.situacao === "AGUARDANDO VALIDAÇÃO") return true;
    if (registro.situacao !== "EM ABERTO") return false;
    if (parcela) return parcela.inicio > dataLocalISO();
    return !feriasEmAndamento(registro);
  };

  const aplicarStatus = (
    registroId: number,
    novaSituacaoSolicitada: SituacaoFerias,
    acaoSolicitada?: AcaoStatus,
    justificativa?: string,
    documento?: DocumentoFerias,
    novasParcelas?: ParcelaFerias[],
    historicoReabertura?: { inicioOriginal: string; fimOriginal: string; reabertoEm: string },
    dadosSuspensaoSolicitados?: DadosSuspensao,
    entradaFluxo?: EntradaFluxoUI,
  ) => {
    if ((acaoSolicitada==="validar" || acaoSolicitada==="rejeitar") && !registros.some(r => r.id === registroId && perfilPodeAvaliarRegistro(perfil,r))) return;
    const proximos = registros.map((registroOriginal) => {
      if (registroOriginal.id !== registroId) return registroOriginal;
      let registro = registroOriginal;
      let acao = acaoSolicitada;
      let novaSituacao = novaSituacaoSolicitada;
      let dadosSuspensao = dadosSuspensaoSolicitados;
      let etapaAprovacao: string | undefined;

      // Fluxo de aprovação da suspensão Art. 17 (órgão central valida antes de efetivar).
      if (acaoSolicitada === "aprovar_suspensao" || acaoSolicitada === "rejeitar_suspensao") {
        if (!perfilPodeDecidir(registro.suspensaoPendente?.processo, perfil)) return registro;
        const desfecho = decidirSuspensaoPendente(registro, acaoSolicitada, perfil, { justificativa, ...entradaFluxo });
        if (!desfecho.efetivar) return desfecho.registro;
        // Última etapa aprovada: efetiva a suspensão com os dados guardados na solicitação.
        registro = desfecho.registro;
        acao = "suspender";
        novaSituacao = "SUSPENSO";
        dadosSuspensao = desfecho.efetivar;
        etapaAprovacao = desfecho.etapa;
      } else if (acaoSolicitada === "suspender" && dadosSuspensao?.fundamento === "ART_17") {
        const processo = iniciarProcesso(obterFluxo(fluxos, CHAVE_FLUXO_SUSPENSAO_ART17), new Date().toLocaleString("pt-BR"));
        // Fluxo ligado: a setorial só registra; a suspensão fica pendente até a validação central.
        if (processo) return solicitarSuspensaoPendente(registro, dadosSuspensao, processo, perfil, justificativa, documento);
      }

      if ((acao === 'validar' || acao === 'rejeitar') && registro.situacao !== 'AGUARDANDO VALIDAÇÃO') return registro;
      // RN013 (US50): o bloqueio do auxílio-transporte e a integração com o SIGPAS só se
      // efetivam quando a chefia valida o recesso do residente técnico — não no lançamento.
      const efetivaBeneficiosRecesso =
        acao === "validar" &&
        registro.tipo === "Recesso" &&
        registro.tipoVinculo === "Residente Técnico";
      // Registra quem avaliou (validou ou rejeitou) a solicitação, para exibir no "Visualizar".
      const marcaAvaliacao = acao === "validar" || acao === "rejeitar";
      // RN reabertura 3.1: a reabertura entra num novo ciclo de validação — o prazo de aprovação
      // precisa ser recalculado a partir de hoje (o antigo já estava vencido/consumido),
      // respeitando o fechamento da folha do mês vigente.
      const ehReaberturaAcao = acao === "reativar";
      const ator = atorHistorico(perfil);
      // RN-SUS: ao suspender, grava o fundamento legal e os desdobramentos de cada artigo.
      const ehSuspensao = acao === "suspender" && dadosSuspensao;
      // Motor de folha (RN-MOT): confronto por competência — estorno dos dias que saem de mês já
      // adiantado, novo adiantamento dos que entram em outro mês, recálculo interno no mesmo mês.
      // O módulo de Férias guarda só DIAS por competência; os valores (R$) são da Folha (RN-FOL-07/08).
      // Parcela-alvo da suspensão (quando informada): o motor incide só sobre ela; as demais
      // parcelas do registro permanecem inalteradas.
      const idParcelaSuspensa = dadosSuspensao?.parcelaId;
      const parcelasAlvoMotor = ehSuspensao && idParcelaSuspensa != null
        ? registro.parcelas.filter((p) => p.id === idParcelaSuspensa)
        : registro.parcelas;
      const entradaMotor = ehSuspensao
        ? {
            parcelas: parcelasAlvoMotor.map((p) => ({ inicio: p.inicio, fim: p.fim })),
            fundamento: dadosSuspensao!.fundamento,
            suspensaoInicio: dadosSuspensao!.suspensaoInicio ?? "",
            suspensaoFim: dadosSuspensao!.suspensaoFim,
            licencaFim: dadosSuspensao!.licencaFim,
            competenciaFolhaCorrente: dataLocalISO().slice(0, 7),
            adiantamentoPago: registro.adiantamentoPago,
          }
        : undefined;
      // RN-MOT-09 / CA20: sem data de fim (ou com início fora da parcela) a suspensão NÃO é
      // efetivada — o registro permanece como estava. A tela mostra a mensagem antes de chegar aqui.
      if (entradaMotor && validarEntradaSuspensao(entradaMotor)) return registroOriginal;
      // RN031/RN032: resultado do motor é a fonte única de retorno, nova data de término e dias
      // suspensos, para os dois artigos.
      const resultadoMotor = entradaMotor ? calcularImpactoSuspensao(entradaMotor) : undefined;
      const impactoFolha = resultadoMotor?.eventos;
      const retornoMotor = resultadoMotor?.retorno;
      const ehArt16 = ehSuspensao && dadosSuspensao!.fundamento === "ART_16";

      return {
        ...registro,
        situacao: novaSituacao,
        parcelas: novasParcelas ?? registro.parcelas,
        historicoReabertura: historicoReabertura ?? registro.historicoReabertura,
        documentos: documento ? [...(registro.documentos ?? []), documento] : registro.documentos,
        historico: comHistorico(registro, {
          situacao: novaSituacao,
          acao: acao ?? "atualizacao",
          responsavel: ator.rotulo,
          responsavelMatricula: ator.matricula,
          responsavelVinculo: ator.vinculo,
          justificativa: justificativa?.trim() || (etapaAprovacao ? dadosSuspensao?.causa : undefined),
          documentos: documento ? [documento] : undefined,
          ...(ehSuspensao
            ? {
                impactoFolha,
                aprovacaoEtapa: etapaAprovacao,
                fundamentoSuspensao: dadosSuspensao!.fundamento,
                dataRetomada: ehArt16 ? retornoMotor : undefined,
                suspensaoInicio: dadosSuspensao!.suspensaoInicio,
                suspensaoFim: dadosSuspensao!.suspensaoFim ?? (ehArt16 ? dadosSuspensao!.licencaFim : undefined),
                suspensaoDias: dadosSuspensao!.prazoEstimadoDias,
                novaDataTerminoFerias: resultadoMotor?.novaDataTermino || undefined,
                causaSuspensao: dadosSuspensao!.causa,
                // Período original da PARCELA suspensa (quando a suspensão é por parcela); senão, o do registro.
                feriasOriginalInicio: parcelasAlvoMotor[0]?.inicio ?? inicioUsufruto(registro) ?? undefined,
                feriasOriginalFim: parcelasAlvoMotor[parcelasAlvoMotor.length - 1]?.fim ?? fimUsufruto(registro) ?? undefined,
              }
            : {}),
        }),
        ...(ehReaberturaAcao ? { dataLimiteValidacaoChefia: calcularPrazoValidacaoChefia(inicioMaisAntigoParcelas(novasParcelas ?? registro.parcelas)) } : {}),
        ...(efetivaBeneficiosRecesso ? { auxilioTransporteEfetivado: true, sigpasIntegrado: true } : {}),
        ...(ehSuspensao
          ? {
              fundamentoSuspensao: dadosSuspensao!.fundamento,
              // Dias suspensos = deslocamento calculado pelo motor (início da suspensão → retorno).
              diasSuspensos: resultadoMotor?.diasSuspensos,
              // Data de retorno às férias calculada pelo motor: Art. 16 = 1º dia útil após a
              // licença; Art. 17 = dia seguinte ao fim. Ao chegar, o verificador reativa "Agendada".
              dataRetornoSuspensao: retornoMotor,
              ...(ehArt16 ? { dataRetomadaArt16: retornoMotor } : {}),
              // Calendário aplicado no retorno: só a parcela suspensa muda (RN-MOT-01/RN023).
              parcelasAposRetorno: resultadoMotor
                ? parcelasComNovoCalendario(registro.parcelas, new Set(parcelasAlvoMotor.map((p) => p.id)), resultadoMotor.novasParcelas)
                : undefined,
              ...(dadosSuspensao!.fundamento === "ART_17"
                ? {
                    suspensaoArt17: {
                      // Registra automaticamente o perfil que realizou a ação (Gestor/Aprovador),
                      // com matrícula/vínculo — sem campo manual de solicitante.
                      solicitante: dadosSuspensao!.solicitante ?? `${ator.rotulo} · Matrícula ${ator.matricula} / ${ator.vinculo}`,
                      causa: dadosSuspensao!.causa ?? "",
                      prazoEstimadoDias: dadosSuspensao!.prazoEstimadoDias ?? 0,
                      autorizadoPeloDirigente: dadosSuspensao!.autorizadoPeloDirigente ?? false,
                      inicio: dadosSuspensao!.suspensaoInicio ?? dataLocalISO(),
                    },
                  }
                : {}),
              impactoFolha,
              suspensaoPendente: undefined,
              // Guarda qual parcela foi suspensa, para o selo "Suspenso" marcar só a linha dela.
              parcelaSuspensaId: dadosSuspensao!.parcelaId,
            }
          : {}),
        ...(marcaAvaliacao ? { avaliadoPor: ator.rotulo, avaliadoEm: new Date().toLocaleString("pt-BR"), justificativaAvaliacao: justificativa?.trim() || '',resultadoAvaliacao:acao==='rejeitar' ? 'Rejeitada' as const : 'Aprovada' as const } : {}),
      };
    });
    atualizarRegistros(proximos);
    setConfirmacaoStatus(null);
  };

  // RN (SEDUC/UNEMAT): lotes e coletivas desses órgãos são aprovados em bloco — o servidor
  // individual (orgaoColetivo OUTRO) continua sendo avaliado um a um.
  const aplicarStatusLote = (loteId: string, novaSituacao: SituacaoFerias, acao: AcaoStatus, justificativa?: string, documento?: DocumentoFerias) => {
    if (!podeAvaliar(perfil)) return;
    const idsAfetados = new Set(
      registros
        .filter((registro) => registro.loteId === loteId && registro.situacao === "AGUARDANDO VALIDAÇÃO" && perfilPodeAvaliarRegistro(perfil,registro))
        .map((registro) => registro.id),
    );
    const marcaAvaliacao = acao === "validar" || acao === "rejeitar";
    const ator = atorHistorico(perfil);
    const proximos = registros.map((registro) =>
      idsAfetados.has(registro.id)
        ? {
            ...registro,
            situacao: novaSituacao,
            documentos: documento ? [...(registro.documentos ?? []), documento] : registro.documentos,
            historico: comHistorico(registro, {
              situacao: novaSituacao,
              acao,
              responsavel: ator.rotulo,
              responsavelMatricula: ator.matricula,
              responsavelVinculo: ator.vinculo,
              justificativa: justificativa?.trim() || undefined,
              documentos: documento ? [documento] : undefined,
            }),
            ...(marcaAvaliacao ? { avaliadoPor: ator.rotulo, avaliadoEm: new Date().toLocaleString("pt-BR"), justificativaAvaliacao: justificativa?.trim() || '',resultadoAvaliacao:acao==='rejeitar' ? 'Rejeitada' as const : 'Aprovada' as const } : {}),
          }
        : registro,
    );
    atualizarRegistros(proximos);
    setConfirmacaoStatus(null);
  };

  const salvarSubstitutos = (registroId: number, substitutos: SubstitutoFerias[]) => {
    const proximos = registros.map((registro) =>
      registro.id === registroId ? { ...registro, substitutos } : registro,
    );
    atualizarRegistros(proximos);
  };

  return (
    <PrototypeSystemPage nomeSistema="GESTÃO DE PESSOAS" ambienteSistema="Teste" menuItems={menuGestaoPessoas}>
      <div className="prototype-page-content prototype-page-content--white prototype-ferias-content">
        <CardSeplag
          title="Gestão de Férias"
          cols="12"
          cardHeaderClassNames="prototype-carreira-card"
          headerNavigation={
            <BreadcrumbSeplag
              divided
              items={[
                { label: "Cadastro" },
                { label: "Direitos e Benefícios" },
                { label: "Concessão de Férias" },
              ]}
            />
          }
        >
          <div className="col-12">
          <div className="prototype-ferias-perfil-seletor">
            <label>
              <span>Visualizando como</span>
              <select value={perfil} onChange={(event) => alterarPerfil(event.target.value as PerfilAcesso)}>
                <option value="RH / Gestão de Pessoas">Gestor (lança, altera, cancela, suspende, reabre)</option>
                <option value="DRE / RH Central">Aprovador (valida, reprova, exclui, força reabertura)</option>
              </select>
            </label>
          </div>

          <div className="prototype-ferias-tabs">
            <button type="button" className={"prototype-ferias-tab" + (aba === "gestao" ? " is-active" : "")} onClick={() => setAba("gestao")}>
              Gestão
            </button>
            {podeAvaliar(perfil) ? (
              <button type="button" className={"prototype-ferias-tab" + (aba === "aprovacoes" ? " is-active" : "")} onClick={() => setAba("aprovacoes")}>
                Aprovações
                {registrosPendentesAprovacao.length ? (
                  <span className="prototype-ferias-tab-badge">{registrosPendentesAprovacao.length}</span>
                ) : null}
              </button>
            ) : null}
            <button type="button" className={"prototype-ferias-tab" + (aba === "substituicoes" ? " is-active" : "")} onClick={() => setAba("substituicoes")}>
              Substituições
            </button>
          </div>

          {aba === "gestao" ? (
            <>
              <div className="prototype-ferias-indicadores prototype-ferias-indicadores--7col">
                <IndicadorCard rotulo="FÉRIAS" valor={indicadores.ferias} tom="info" />
                <IndicadorCard rotulo="RECESSO REMUNERADO" valor={indicadores.licencaRemunerada} tom="roxo" />
                <IndicadorCard rotulo="AGENDADA" valor={indicadores.emAberto} tom="sucesso" />
                <IndicadorCard rotulo="AGUARDANDO VALIDAÇÃO" valor={indicadores.aguardandoValidacao} tom="alerta" />
                <IndicadorCard rotulo="QUITADO" valor={indicadores.quitado} tom="info" />
                <IndicadorCard rotulo="SUSPENSO" valor={indicadores.suspenso} tom="alerta" />
                <IndicadorCard rotulo="PRAZO EXPIRADO" valor={indicadores.prazoExpirado} tom="vermelho" />
              </div>

              <div className="prototype-ferias-filtros">
                <label>
                  <span>Órgão</span>
                  <select
                    value={filtroOrgao}
                    onChange={(event) => {
                      setFiltroOrgao(event.target.value);
                      setFiltroSetor("");
                    }}
                  >
                    <option value="">Todos</option>
                    {orgaosDisponiveis.map((orgao) => (
                      <option key={orgao} value={orgao}>
                        {orgao}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{filtroOrgao.includes('SEDUC') ? 'Escola / Lotação' : /UNEMAT|SECITEC/.test(filtroOrgao) ? 'Campus / Faculdade / Unidade' : 'Setor / Lotação'}</span>
                  <select value={filtroSetor} onChange={(event) => setFiltroSetor(event.target.value)}>
                    <option value="">Todos</option>
                    {setoresDisponiveis.map((setor) => (
                      <option key={setor} value={setor}>
                        {setor}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Servidor</span>
                  <input value={filtroServidor} placeholder="Matrícula ou nome" onChange={(event) => setFiltroServidor(event.target.value)} />
                </label>
                <label>
                  <span>Situação</span>
                  <select value={filtroSituacao} onChange={(event) => setFiltroSituacao(event.target.value as "" | SituacaoFerias)}>
                    <option value="">Todas</option>
                    <option value="AGUARDANDO VALIDAÇÃO">Aguardando validação</option>
                    <option value="EM ABERTO">Agendada</option>
                    <option value="QUITADO">Quitado</option>
                    <option value="REPROVADO">Reprovado</option>
                    <option value="PRAZO EXPIRADO">Prazo expirado</option>
                    <option value="SUSPENSO">Suspenso</option>
                  </select>
                </label>
                <label><span>Tipo de vínculo</span><select value={filtroVinculo} onChange={e => setFiltroVinculo(e.target.value)}><option value="">Todos</option>{['Efetivo','Comissionado','Contrato Temporário','Estagiário','Residente Técnico'].map(v => <option key={v}>{v}</option>)}</select></label>
                {filtroOrgao.includes('SEDUC') && <label><span>DRE</span><select value={filtroDre} onChange={e => setFiltroDre(e.target.value)}><option value="">Todas</option>{[...new Set(registros.filter(r => r.orgao === filtroOrgao).map(r => r.dre).filter(Boolean))].map(d => <option key={d}>{d}</option>)}</select></label>}
                <BotaoLimparFiltroSeplag type="button" label="Limpar filtro" className="prototype-ferias-limpar-filtro" onClick={limparFiltros} />
              </div>

              {podeGerenciarCompleto(perfil) ? (
                <div className="prototype-ferias-acoes-topo">
                  <button type="button" className="prototype-ferias-btn-primario" onClick={() => setFluxoNovaSolicitacao("escolha")}>
                    <i className="pi pi-plus" aria-hidden="true" />
                    Nova solicitação de férias
                  </button>
                </div>
              ) : null}

              <TabelaRegistros
                registros={registrosFiltrados}
                perfil={perfil}
                onVisualizar={visualizarRegistro}
                onEditar={(registro, parcelaId) => {
                  if (registro.tipo === "Recesso") navigate(`/prototipos/sigep/ferias/editar/recesso/${registro.id}`);
                  else if (registro.tipo === "Individual" || registro.tipo === "Lote" || registro.tipo === "Coletiva") navigate(`/prototipos/sigep/ferias/editar/individual/${registro.id}${parcelaId != null ? `?parcela=${parcelaId}` : ""}`);
                  else visualizarRegistro(registro);
                }}
                onGerenciarSubstituicao={setRegistroSubstituicao}
                onVerHistorico={setRegistroHistorico}
                onAlterarStatus={(registro, acao, parcelaId) => setConfirmacaoStatus({ registro, acao, parcelaId })}
                podeEditar={podeEditar}
                menuAbertoId={menuAbertoId}
                setMenuAbertoId={setMenuAbertoId}
              />
            </>
          ) : null}

          {aba === "aprovacoes" && podeAvaliar(perfil) ? (
            <AprovacoesFerias
              registros={registros.filter(r => podeAvaliar(perfil) && (
                // Suspensão Art. 17 aguardando validação: aparece só para o perfil responsável pela etapa.
                r.suspensaoPendente ? perfilPodeDecidir(r.suspensaoPendente.processo, perfil) :
                (r.tipo === "Coletiva" || r.tipo === "Lote") || r.origem === "PORTALSERVIDOR"
              ))}
              onVisualizar={visualizarRegistro}
              onAlterarStatus={(registro, acao) => setConfirmacaoStatus({ registro, acao })}
              onAlterarStatusLote={(loteId, acao) => {
                const registro=registros.find(r => r.loteId===loteId && r.situacao==='AGUARDANDO VALIDAÇÃO');
                if (registro) setConfirmacaoStatus({registro,acao,loteId});
              }}
            />
          ) : null}

          {aba === "substituicoes" ? (
            <div className="prototype-ferias-sub-aba">
              <h2 className="prototype-ferias-sub-titulo">Substituições Ativas (Art. 21 — LC 266/2006)</h2>
              <p className="prototype-ferias-sub-subtitulo">
                Só cargo de chefia/direção, parcela ≥ 10 dias — comissionado. Temporário, residente técnico e
                estagiário nunca geram substituição.
              </p>

              <div className="prototype-ferias-indicadores prototype-ferias-indicadores--4col">
                <IndicadorCard rotulo="TOTAL" valor={indicadoresSubstituicao.total} />
                <IndicadorCard rotulo="VIGENTE" valor={indicadoresSubstituicao.vigente} tom="sucesso" />
                <IndicadorCard rotulo="ENCERRADA" valor={indicadoresSubstituicao.encerrada} tom="info" />
                <IndicadorCard rotulo="SEM PORTARIA" valor={indicadoresSubstituicao.semPortaria} tom="vermelho" />
              </div>

              <div className="prototype-ferias-sub-filtros">
                <label>
                  <span>Titular ou substituto</span>
                  <input value={subBusca} placeholder="Matrícula ou nome" onChange={(event) => setSubBusca(event.target.value)} />
                </label>
                <label>
                  <span>Situação</span>
                  <select value={subSituacao} onChange={(event) => setSubSituacao(event.target.value as "" | "Vigente" | "Encerrada")}>
                    <option value="">Todas</option>
                    <option value="Vigente">Vigente</option>
                    <option value="Encerrada">Encerrada</option>
                  </select>
                </label>
                <button type="button" className="prototype-ferias-btn-buscar">
                  <i className="pi pi-search" aria-hidden="true" />
                  Buscar
                </button>
              </div>

              <TabelaSubstituicoes linhas={linhasSubstituicao} />
            </div>
          ) : null}
          </div>
        </CardSeplag>
      </div>

      {fluxoNovaSolicitacao === "escolha" ? (
        <ModalEscolhaTipoSolicitacao
          onFechar={() => setFluxoNovaSolicitacao(null)}
          onEscolher={(tipo) => {
            setFluxoNovaSolicitacao(null);
            const rotas: Record<TipoSolicitacao, string> = {
              Individual: "/prototipos/sigep/ferias/nova/individual",
              Coletiva: "/prototipos/sigep/ferias/nova/coletiva",
              Lote: "/prototipos/sigep/ferias/nova/lote",
              Recesso: "/prototipos/sigep/ferias/nova/recesso",
            };
            navigate(rotas[tipo]);
          }}
        />
      ) : null}

      {registroSubstituicao ? (
        <ModalGerenciarSubstituicao
          registro={registroSubstituicao}
          onFechar={() => setRegistroSubstituicao(null)}
          onSalvar={(substitutos) => {
            salvarSubstitutos(registroSubstituicao.id, substitutos);
            setRegistroSubstituicao(null);
          }}
        />
      ) : null}


      {confirmacaoStatus ? (
        <ModalConfirmarStatus
          registro={confirmacaoStatus.registro}
          acao={confirmacaoStatus.acao}
          loteId={confirmacaoStatus.loteId}
          onFechar={() => setConfirmacaoStatus(null)}
          fluxos={fluxos}
          parcelaId={confirmacaoStatus.parcelaId}
          onConfirmar={(novaSituacao,justificativa,documento,novasParcelas,historicoReabertura,dadosSuspensao,entradaFluxo) => confirmacaoStatus.loteId ? aplicarStatusLote(confirmacaoStatus.loteId,novaSituacao,confirmacaoStatus.acao,justificativa,documento) : aplicarStatus(confirmacaoStatus.registro.id, novaSituacao, confirmacaoStatus.acao,justificativa,documento,novasParcelas,historicoReabertura,dadosSuspensao,entradaFluxo)}
        />
      ) : null}


      {registroHistorico ? (
        <ModalHistoricoRegistro registro={registroHistorico} onFechar={() => setRegistroHistorico(null)} />
      ) : null}
    </PrototypeSystemPage>
  );
}

function elegivelSubstituicao(registro: FeriasRegistro) {
  return (
    registro.tipoVinculo === "Comissionado" &&
    registro.cargoGestao &&
    registro.parcelas.some((parcela) => parcela.dias >= 10) &&
    registro.situacao !== "AGUARDANDO VALIDAÇÃO" &&
    registro.situacao !== "PRAZO EXPIRADO" &&
    registro.situacao !== "REPROVADO"
  );
}

function podeValidarChefia(registro: FeriasRegistro) {
  return registro.situacao === "AGUARDANDO VALIDAÇÃO";
}

function podeRejeitar(registro: FeriasRegistro) {
  return registro.situacao === "AGUARDANDO VALIDAÇÃO";
}

/** Perfil Aprovador avalia (valida/rejeita) Coletivo e Lote sempre; Individual e Recesso só
 * quando vieram do Portal do Servidor. Lançamento via SIGEP (inclusive Recesso) nasce Agendada
 * e NÃO passa por aprovação. */
function perfilPodeAvaliarRegistro(perfil: PerfilAcesso, registro: FeriasRegistro) {
  if (prazoValidacaoExpirado(registro)) return false;
  if (!podeAvaliar(perfil)) return false;
  return registro.tipo === 'Coletiva' || registro.tipo === 'Lote' || registro.origem === 'PORTALSERVIDOR';
}

/** "Perfil Aprovador" (regras-perfis-ferias): valida/reprova submissões, exclui agendamentos
 * e é o único que pode forçar a reabertura de um agendamento com folha já homologada/paga. */
function podeAvaliar(perfil: PerfilAcesso) {
  return perfil === "Chefia Imediata" || perfil === "DRE / RH Central";
}

/** "Perfil Gestor" (regras-perfis-ferias): lança, altera, cancela, suspende e reabre
 * agendamentos — mas não aprova, não exclui e não força reabertura com financeiro pago. */
function podeGerenciarCompleto(perfil: PerfilAcesso) {
  return perfil === "RH / Gestão de Pessoas";
}

/** Usuário logado "de demonstração" por perfil — como o protótipo não tem autenticação real,
 * cada perfil é representado por uma matrícula/vínculo fixos só para exibir no histórico quem
 * fez a alteração (o servidor que está de fato operando a tela, não o servidor da solicitação). */
const USUARIO_ATOR_MOCK: Record<"Gestor" | "Aprovador", { nome: string; cargo: string; matricula: string; vinculo: TipoVinculo }> = {
  Gestor: { nome: "Beatriz do Carmo Santos", cargo: "Analista de Gestão de Pessoas", matricula: "900017", vinculo: "Efetivo" },
  Aprovador: { nome: "Cláudio Luciano Capistrano", cargo: "Diretor de Gestão de Pessoas", matricula: "900020", vinculo: "Efetivo" },
};

/** Iniciais (até 2 letras) para o avatar do histórico. */
function iniciaisAtor(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter((p) => p.length > 2 || /[A-ZÁ-Ú]/.test(p[0]));
  const base = partes.length ? partes : nome.trim().split(/\s+/);
  return ((base[0]?.[0] ?? "") + (base[base.length - 1]?.[0] ?? "")).toUpperCase();
}

/** Verbo da ação no histórico, no particípio: "Agendado por", "Validado por"... */
function verboAcaoHistorico(acao: string): string {
  const verbos: Record<string, string> = {
    lancamento: "Agendado por",
    validar: "Validado por",
    rejeitar: "Rejeitado por",
    suspender: "Suspenso por",
    solicitar_suspensao: "Suspensão solicitada por",
    aprovar_suspensao: "Suspensão validada por",
    rejeitar_suspensao: "Suspensão rejeitada por",
    reativar: "Reaberto por",
    retorno_suspensao: "Retomado por",
    expiracao: "Expirado por",
    quitacao: "Quitado por",
    remanejamento: "Remanejado por",
    edicao: "Alterado por",
  };
  return verbos[acao] ?? "Registrado por";
}

/** Perfil (Gestor/Aprovador/Servidor/Sistema) a partir do rótulo do responsável no evento. */
function perfilDoResponsavel(responsavel?: string): { rotulo: string; classe: string } | null {
  if (!responsavel) return null;
  const r = responsavel.toLowerCase();
  if (r.includes("sistema") || r.includes("automátic") || r.includes("automatic")) return { rotulo: "Automático", classe: "is-sistema" };
  if (r.startsWith("gestor") || r.includes("gestão de pessoas") || r.includes("rh ")) return { rotulo: "Perfil Gestor", classe: "is-gestor" };
  if (r.startsWith("aprovador") || r.includes("chefia") || r.includes("dre") || r.includes("rh central") || r.includes("órgão central")) return { rotulo: "Perfil Aprovador", classe: "is-aprovador" };
  if (r.startsWith("servidor") || r.includes("portal do servidor")) return { rotulo: "Portal do Servidor", classe: "is-servidor" };
  return null;
}

/** Perfil exibido no lançamento: deriva da origem do registro (SIGEP = Gestor; Portal = Servidor). */
function perfilDoLancamento(registro: FeriasRegistro, responsavel?: string): { rotulo: string; classe: string } {
  const pelo = perfilDoResponsavel(responsavel);
  if (pelo) return pelo;
  return registro.origem === "PORTALSERVIDOR"
    ? { rotulo: "Portal do Servidor", classe: "is-servidor" }
    : { rotulo: "Perfil Gestor", classe: "is-gestor" };
}

/** Rótulo + matrícula/vínculo de quem agiu, para exibir no histórico de situações. */
function atorHistorico(perfil: PerfilAcesso): { rotulo: "Gestor" | "Aprovador"; matricula: string; vinculo: TipoVinculo } {
  const rotulo = podeGerenciarCompleto(perfil) ? "Gestor" : "Aprovador";
  return { rotulo, ...USUARIO_ATOR_MOCK[rotulo] };
}

function IndicadorCard({ rotulo, valor, tom }: Readonly<{ rotulo: string; valor: number; tom?: "sucesso" | "info" | "alerta" | "roxo" | "vermelho" }>) {
  const icones: Record<string, string> = { TOTAL: "pi-chart-bar", AGENDADA: "pi-clock", QUITADO: "pi-check-circle", SUSPENSO: "pi-pause-circle", COMISSIONADO: "pi-id-card", "CONTRATO TEMPORÁRIO": "pi-file", "RESIDENTE TÉCNICO": "pi-briefcase", ESTAGIÁRIO: "pi-graduation-cap", FÉRIAS: "pi-calendar", "LICENÇA REMUNERADA": "pi-wallet", VIGENTE: "pi-check-circle", ENCERRADA: "pi-calendar-times", "SEM PORTARIA": "pi-exclamation-circle" };
  const titulo = rotulo.charAt(0) + rotulo.slice(1).toLocaleLowerCase("pt-BR");
  return (
    <div className={"prototype-ferias-indicador" + (tom ? ` is-${tom}` : "")}>
      <span className="prototype-ferias-indicador-icone" aria-hidden="true"><i className={`pi ${icones[rotulo] || "pi-chart-bar"}`} /></span>
      <div><span className="prototype-ferias-indicador-rotulo">{titulo}</span><strong className="prototype-ferias-indicador-valor">{valor}</strong></div>
    </div>
  );
}

interface TabelaRegistrosProps {
  registros: FeriasRegistro[];
  perfil: PerfilAcesso;
  onVisualizar: (registro: FeriasRegistro, parcelaId?: number) => void;
  onEditar: (registro: FeriasRegistro, parcelaId?: number) => void;
  onGerenciarSubstituicao: (registro: FeriasRegistro) => void;
  onVerHistorico: (registro: FeriasRegistro) => void;
  onAlterarStatus: (registro: FeriasRegistro, acao: AcaoStatus, parcelaId?: number) => void;
  podeEditar: (registro: FeriasRegistro, parcela?: ParcelaFerias | null) => boolean;
  menuAbertoId: number | string | null;
  setMenuAbertoId: (id: number | string | null) => void;
}

function TabelaRegistros({
  registros,
  perfil,
  onVisualizar,
  onEditar,
  onGerenciarSubstituicao,
  onVerHistorico,
  onAlterarStatus,
  podeEditar,
  menuAbertoId,
  setMenuAbertoId,
}: Readonly<TabelaRegistrosProps>) {
  const [primeiro, setPrimeiro] = useState(0);
  const [porPagina, setPorPagina] = useState(10);
  useEffect(() => { setPrimeiro(0); }, [registros]);
  const primeiroAtual = Math.min(primeiro, Math.max(0, Math.ceil(registros.length / porPagina) - 1) * porPagina);
  return (
    <>
    <div className="prototype-ferias-table-wrap">
      <table className="prototype-ferias-table">
        <thead>
          <tr>
            <th>Matrícula/Vínculo</th>
            <th>Lotação</th>
            <th>Nome Servidor</th>
            <th>Período Aquisitivo</th>
            <th>Período de Usufruto</th>
            <th>Tipo</th>
            <th>Dias Solicitados</th>
            <th>Origem</th>
            <th>Situação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {registros.slice(primeiroAtual, primeiroAtual + porPagina).flatMap((registro) => {
            // Coletiva/Lote com mais de uma parcela: uma linha por parcela, cada uma com seu
            // próprio período de usufruto, para não misturar datas não-contínuas numa só linha.
            const linhasParcela = registro.parcelas.length > 1 ? registro.parcelas : [null];
            return linhasParcela.map((parcela) => {
            const chaveLinha: number | string = parcela ? `${registro.id}-${parcela.id}` : registro.id;
            return (
            <tr key={chaveLinha}>
              <td>
                {registro.matricula} / {registro.numeroVinculo ?? "1"}
                <br />
                <small>{registro.tipoVinculo}</small>
              </td>
              <td>
                {registro.orgao}
                <br />
                <small>{registro.setor}</small>
              </td>
              <td>
                <strong>{registro.servidorNome}</strong>
                {registro.cargoGestao ? <span className="prototype-ferias-badge-chefia"><i className="pi pi-star-fill" aria-hidden="true" /> CHEFIA</span> : null}
                <br />
                <small>{registro.cargo}</small>
              </td>
              <td>
                {periodoAquisitivoLabel(registro)}
                {registro.regraAquisitivo === "USUFRUTO_ANTECIPADO" ? (
                  <small className="prototype-ferias-regra-unemat-status">Usufruto antecipado · saldo a conciliar</small>
                ) : null}
              </td>
              <td>
                {parcela ? (
                  <>
                    {formatarDataBr(parcela.inicio)} a {formatarDataBr(parcela.fim)}
                    {registro.tipo === "Coletiva" || registro.tipo === "Lote" ? (
                      <span className="prototype-ferias-badge-dias">{parcela.dias} dias</span>
                    ) : null}
                  </>
                ) : (
                  periodoUsufruto(registro)
                )}
              </td>
              <td>
                <span className="prototype-ferias-badge-tipo">{registro.tipo === "Recesso" ? "Recesso" : "Férias"}</span>
              </td>
              <td className="prototype-ferias-dias-solicitados">
                {diasSolicitados(registro)}{" "}
                <small>
                  {registro.tipo === "Coletiva"
                    ? "COLETIVO"
                    : registro.tipo === "Lote"
                      ? "LOTE"
                      : registro.tipo === "Recesso"
                        ? "RECESSO"
                        : "INTEGRAL"}
                </small>
              </td>
              <td>
                <span className={"prototype-ferias-badge-origem is-" + registro.origem.toLowerCase()}>{registro.origem}</span>
              </td>
              <td>
                <div className="prototype-ferias-badges-linha">
                {(() => {
                  // O verificador periódico roda a cada 30s — antes dele tickar, a situação ainda
                  // pode estar "AGUARDANDO VALIDAÇÃO" mesmo já tendo passado o prazo. Nesse caso,
                  // exibe "Prazo expirado" ao vivo sem esperar o próximo tick.
                  const situacaoExibida: SituacaoFerias = prazoValidacaoExpirado(registro) ? "PRAZO EXPIRADO" : registro.situacao;
                  // Com suspensão aguardando validação, só o selo da suspensão aparece (sem "Agendada").
                  // Vale só para o Art. 17: o Art. 16 não tem fluxo de aprovação.
                  // Pendência de suspensão Art. 17: incide sobre UMA parcela. Marca só a linha da
                  // parcela suspensa. Em dados antigos sem parcelaId, usa a primeira parcela como
                  // alvo, para nunca marcar as parcelas juntas.
                  const alvoPendente = registro.suspensaoPendente?.dados.parcelaId ?? registro.parcelas[0]?.id;
                  const linhaEhPendente = registro.suspensaoPendente?.dados.fundamento === "ART_17" && (!parcela || alvoPendente === parcela.id);
                  if (linhaEhPendente) return null;
                  // Suspenso por parcela: só a linha da parcela suspensa esconde "Agendada" (o selo
                  // "Suspenso" dela vem abaixo). As demais parcelas continuam AGENDADAS, intactas.
                  const alvoSuspenso = registro.parcelaSuspensaId ?? registro.parcelas[0]?.id;
                  if (situacaoExibida === "SUSPENSO") {
                    if (!parcela || alvoSuspenso === parcela.id) return null;
                    return <span className="prototype-ferias-badge is-em-aberto">{rotuloSituacao("EM ABERTO")}</span>;
                  }
                  return (
                    <span className={`prototype-ferias-badge is-${classeSituacao(situacaoExibida)}`}>{rotuloSituacao(situacaoExibida)}</span>
                  );
                })()}
                {registro.suspensaoPendente?.dados.fundamento === "ART_17" && (!parcela || (registro.suspensaoPendente.dados.parcelaId ?? registro.parcelas[0]?.id) === parcela.id) ? (
                  <span
                    className="prototype-ferias-badge is-suspenso"
                    title={`Suspensão por interesse público (Art. 17) registrada por ${registro.suspensaoPendente.solicitadoPor} em ${registro.suspensaoPendente.solicitadoEm}; aguardando validação do órgão central.`}
                  >
                    Suspensão aguardando validação
                  </span>
                ) : null}
                {registro.situacao === "SUSPENSO" && (!parcela || (registro.parcelaSuspensaId ?? registro.parcelas[0]?.id) === parcela.id) ? (
                  <span className="prototype-ferias-badge is-suspenso prototype-ferias-badge--suspensao" title={(registro.fundamentoSuspensao ?? "ART_17") === "ART_16" ? "Suspensão automática por licença (Art. 16)" : "Suspensão por superior interesse público (Art. 17)"}>
                    <span className="prototype-ferias-badge-dot" aria-hidden="true" />
                    Suspenso
                    <span className="prototype-ferias-badge-sep" aria-hidden="true" />
                    {(registro.fundamentoSuspensao ?? "ART_17") === "ART_16" ? "Art. 16" : "Art. 17"}
                  </span>
                ) : null}
                </div>
              </td>
              <td>
                <div className="prototype-ferias-acao-dropdown">
                  <button type="button" className="prototype-ferias-btn-acao" onClick={() => onVisualizar(registro, parcela?.id)} title="Visualizar">
                    <i className="pi pi-eye" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="prototype-ferias-btn-acao-caret"
                    title="Mais ações"
                    onClick={() => setMenuAbertoId(menuAbertoId === chaveLinha ? null : chaveLinha)}
                  >
                    <i className="pi pi-chevron-down" aria-hidden="true" />
                  </button>
                  {menuAbertoId === chaveLinha ? (
                    <div className="prototype-ferias-menu-acoes">
                      <button type="button" onClick={() => { onVisualizar(registro, parcela?.id); setMenuAbertoId(null); }}>
                        <i className="pi pi-eye" aria-hidden="true" /> Visualizar
                      </button>
                      <button type="button" onClick={() => { onVerHistorico(registro); setMenuAbertoId(null); }}>
                        <i className="pi pi-history" aria-hidden="true" /> Histórico
                      </button>
                      {podeGerenciarCompleto(perfil) && podeEditar(registro, parcela) ? (
                        <button type="button" onClick={() => { onEditar(registro, parcela?.id); setMenuAbertoId(null); }}>
                          <i className="pi pi-pencil" aria-hidden="true" /> Editar
                        </button>
                      ) : null}
                      {podeGerenciarCompleto(perfil) && elegivelSubstituicao(registro) ? (
                        <button type="button" onClick={() => { onGerenciarSubstituicao(registro); setMenuAbertoId(null); }}>
                          <i className="pi pi-users" aria-hidden="true" /> Gerenciar substituição
                        </button>
                      ) : null}
                      {perfilPodeAvaliarRegistro(perfil, registro) && podeValidarChefia(registro) ? (
                        <button
                          type="button"
                          className="is-acao-verde"
                          onClick={() => { onAlterarStatus(registro, "validar"); setMenuAbertoId(null); }}
                        >
                          <i className="pi pi-check-circle" aria-hidden="true" /> Validar (chefia)
                        </button>
                      ) : null}
                      {perfilPodeAvaliarRegistro(perfil, registro) && podeRejeitar(registro) ? (
                        <button
                          type="button"
                          className="is-acao-vermelha"
                          onClick={() => { onAlterarStatus(registro, "rejeitar"); setMenuAbertoId(null); }}
                        >
                          <i className="pi pi-times-circle" aria-hidden="true" /> Rejeitar
                        </button>
                      ) : null}
                      {podeGerenciarCompleto(perfil) && podeSuspender(registro) ? (
                        <button
                          type="button"
                          className="is-acao-ambar"
                          onClick={() => { onAlterarStatus(registro, "suspender", parcela?.id); setMenuAbertoId(null); }}
                        >
                          <i className="pi pi-pause" aria-hidden="true" /> Suspender
                        </button>
                      ) : null}

                    </div>
                  ) : null}
                </div>
              </td>
            </tr>
            );
            });
          })}
          {!registros.length ? (
            <tr>
              <td colSpan={10} className="prototype-ferias-empty">
                Nenhum registro encontrado
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
    <Paginator first={primeiroAtual} rows={porPagina} totalRecords={registros.length} rowsPerPageOptions={[10, 20, 50]} template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown" onPageChange={(event) => { setPrimeiro(event.rows !== porPagina ? 0 : event.first); setPorPagina(event.rows); setMenuAbertoId(null); }} />
    </>
  );
}

function TabelaSubstituicoes({ linhas }: Readonly<{ linhas: LinhaSubstituicao[] }>) {
  return (
    <div className="prototype-ferias-table-wrap">
      <table className="prototype-ferias-table">
        <thead>
          <tr>
            <th>Titular (cargo em substituição)</th>
            <th>Substituto</th>
            <th>Período</th>
            <th>Dias solicitados</th>
            <th>Tipo</th>
            <th>Portaria DOE</th>
            <th>Origem</th>
            <th>Situação</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha.id}>
              <td>
                <strong>{linha.titular}</strong>
                <br />
                <small>{linha.cargo}</small>
              </td>
              <td>{linha.substitutoNome}</td>
              <td>
                {formatarDataBr(linha.inicio)} a {formatarDataBr(linha.fim)}
              </td>
              <td>{linha.dias}</td>
              <td>{linha.tipo}</td>
              <td>
                {linha.portaria.trim() ? (
                  <span className="prototype-ferias-badge-origem is-sigep">{linha.portaria}</span>
                ) : (
                  <span className="prototype-ferias-badge-origem is-portalservidor">PENDENTE</span>
                )}
              </td>
              <td>
                {linha.origem === "PORTALSERVIDOR" ? "Portal do Servidor" : "SIGEP"}
              </td>
              <td>
                <span className={"prototype-ferias-badge is-" + (linha.situacao === "Vigente" ? "em-aberto" : "quitado")}>
                  {linha.situacao.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
          {!linhas.length ? (
            <tr>
              <td colSpan={8} className="prototype-ferias-empty">
                Nenhuma substituição encontrada para o filtro selecionado.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}


function ModalEscolhaTipoSolicitacao({
  onFechar,
  onEscolher,
}: Readonly<{ onFechar: () => void; onEscolher: (tipo: TipoSolicitacao) => void }>) {
  return (
    <ModalSeplag
      visible
      fechar={onFechar}
      titulo="Nova solicitação de férias"
      tamanho="620px"
      customFooter={
        <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          <button type="button" className="prototype-ferias-btn-fechar-outline" onClick={onFechar}>
            <i className="pi pi-times" aria-hidden="true" />
            Fechar
          </button>
        </div>
      }
    >
      <div style={{ width: "100%" }} className="prototype-ferias-escolha-tipo">
        <p className="prototype-ferias-escolha-subtitulo">Selecione o tipo de solicitação que deseja cadastrar.</p>

        <button type="button" className="prototype-ferias-opcao-tipo is-azul" onClick={() => onEscolher("Individual")}>
          <span className="prototype-ferias-opcao-icone">
            <i className="pi pi-user" aria-hidden="true" />
          </span>
          <div>
            <strong>Individual</strong>
            <span>Solicitação para um único servidor.</span>
          </div>
        </button>

        <button type="button" className="prototype-ferias-opcao-tipo is-ambar" onClick={() => onEscolher("Coletiva")}>
          <span className="prototype-ferias-opcao-icone">
            <i className="pi pi-sitemap" aria-hidden="true" />
          </span>
          <div>
            <strong>Agendamento Coletivo (SEDUC/UNEMAT/SECITEC)</strong>
            <span>Exclusiva de professores em unidade escolar/universitária.</span>
          </div>
        </button>

        <button type="button" className="prototype-ferias-opcao-tipo is-roxo" onClick={() => onEscolher("Lote")}>
          <span className="prototype-ferias-opcao-icone">
            <i className="pi pi-users" aria-hidden="true" />
          </span>
          <div>
            <strong>Agendamento em Lote</strong>
            <span>Lançamento em massa para cargos de gestão/apoio.</span>
          </div>
        </button>

        <button type="button" className="prototype-ferias-opcao-tipo is-verde" onClick={() => onEscolher("Recesso")}>
          <span className="prototype-ferias-opcao-icone">
            <i className="pi pi-sun" aria-hidden="true" />
          </span>
          <div>
            <strong>Recesso Remunerado</strong>
            <span>Residente técnico e estagiário — não é férias, instituto próprio (IN 05).</span>
          </div>
        </button>
      </div>
    </ModalSeplag>
  );
}

export function FormularioIndividual({
  onCancelar,
  onSalvar,
  registroSomenteLeitura,
  registroParaEditar,
  parcelaFocoId,
  origemLancamento = "SIGEP",
}: Readonly<{
  /** Fluxo 5: recebe se há dados preenchidos/alterados — a página só abre o modal
   * "Cancelar solicitação" nesse caso; sem dados, volta direto para a listagem. */
  onCancelar: (temDadosPreenchidos: boolean) => void;
  onSalvar: (registro: FeriasRegistro) => void;
  /** Quando informado, a tela abre com os dados desse registro já preenchidos e tudo
   * desabilitado/acinzentado — reaproveita o mesmo layout do cadastro só para "Visualizar". */
  registroSomenteLeitura?: FeriasRegistro;
  /** Edição de uma solicitação já lançada (Individual, Lote ou Coletiva) — mesma tela/padrão da
   * criação (servidor pré-preenchido e travado, parcelas editáveis). Se a solicitação já está
   * Agendada (EM ABERTO), as parcelas seguem editáveis; a alteração só devolve a solicitação ao
   * aprovador quando a origem é o Portal do Servidor (ver salvar()). */
  registroParaEditar?: FeriasRegistro;
  /** Edição de UMA parcela (a linha clicada na grid): o formulário mostra só essa parcela e o
   * saldo dela (ex.: 15 dias ou 30 dias); as demais parcelas do registro são preservadas. */
  parcelaFocoId?: number;
  /** Origem do lançamento: "SIGEP" (RH/Gestão) nasce Agendada; "PORTALSERVIDOR" nasce
   * Aguardando Validação. Default SIGEP, pois esta tela é a do SIGEP. */
  origemLancamento?: Origem;
}>) {
  const registroBase = registroSomenteLeitura ?? registroParaEditar;
  const [documento, setDocumento] = useState<DocumentoFerias | null>(null);
  const somenteLeitura = Boolean(registroSomenteLeitura);
  const ehEdicao = Boolean(registroParaEditar);
  const servidorTravado = somenteLeitura || ehEdicao;
  const parcelamentoRestrito = ehEdicao && registroParaEditar!.situacao === "EM ABERTO";
  const [servidorNome, setServidorNome] = useState(registroBase?.servidorNome ?? "");
  const [matricula, setMatricula] = useState(registroBase?.matricula ?? "");
  const [orgao, setOrgao] = useState(registroBase?.orgao ?? "SEPLAG/MT");
  const [setor, setSetor] = useState(registroBase?.setor ?? "");
  const [cargo, setCargo] = useState(registroBase?.cargo ?? "");
  const [tipoVinculo, setTipoVinculo] = useState<TipoVinculo | "">(registroBase?.tipoVinculo ?? ("" as TipoVinculo));
  const [cargoGestao, setCargoGestao] = useState<boolean | null>(registroBase?.cargoGestao ?? null);
  const [periodoAquisitivoInicio, setPeriodoAquisitivoInicio] = useState(registroBase?.periodoAquisitivoInicio ?? "");
  const [periodoAquisitivoFim, setPeriodoAquisitivoFim] = useState(registroBase?.periodoAquisitivoFim ?? "");
  // Edição de uma única parcela de um registro com várias: só ela entra no formulário.
  // Vale para Editar e para Visualizar: a linha clicada na grid abre só a sua parcela.
  const parcelaFoco =
    registroBase && parcelaFocoId != null && registroBase.parcelas.length > 1
      ? registroBase.parcelas.find((parcela) => parcela.id === parcelaFocoId)
      : undefined;
  const [saldoDisponivel, setSaldoDisponivel] = useState<number | null>(() => {
    if (parcelaFoco) return parcelaFoco.dias;
    if (registroSomenteLeitura) return diasSolicitados(registroSomenteLeitura);
    if (registroParaEditar) return registroParaEditar.saldoFerias ?? diasSolicitados(registroParaEditar);
    return null;
  });
  const [parcelas, setParcelas] = useState<ParcelaFerias[]>(() =>
    parcelaFoco ? [{ ...parcelaFoco }] : registroBase?.parcelas.map((parcela) => ({ ...parcela })) ?? [],
  );
  // Fotografia das parcelas ao abrir a tela — na edição, "dados preenchidos" = parcelas alteradas.
  const [parcelasIniciais] = useState(() => JSON.stringify(parcelas));
  const [erro, setErro] = useState("");
  const [alertaConcomitancia, setAlertaConcomitancia] = useState("");
  // RN-03: mensagem de ajuste de data por LTS vigente, persistente por parcela (sobrevive à
  // limpeza do rascunho após "Adicionar esta parcela" — diferente do alertaConcomitancia, que é
  // só uma prévia ao digitar e pode ser recalculado/limpo a qualquer momento).
  const [avisosAjusteLts, setAvisosAjusteLts] = useState<Record<number, string>>({});
  const [servidorEncontrado, setServidorEncontrado] = useState(servidorTravado);
  const [servidorBusca, setServidorBusca] = useState(
    registroBase ? `${registroBase.matricula} - ${registroBase.servidorNome}` : "",
  );
  const [sugestoesServidor, setSugestoesServidor] = useState<string[]>([]);
  const [vinculosParaEscolher, setVinculosParaEscolher] = useState<ServidorMock[]>([]);
  const [vinculoInfo, setVinculoInfo] = useState<{ indice: number; total: number } | null>(null);
  const {
    control: gozoControl,
    watch: watchGozo,
    setValue: setGozoValor,
  } = useForm<{ duracao: number; dataInicio: string; terco: boolean }>({
    defaultValues: { duracao: 30, dataInicio: "", terco: false },
  });
  const valoresGozo = watchGozo();
  const draftDias = valoresGozo.duracao;
  const draftInicio = brParaIso(valoresGozo.dataInicio);
  const draftTerco = valoresGozo.terco;

  const totalParcelado = parcelas.reduce((total, parcela) => total + parcela.dias, 0);
  const saldoFecha = totalParcelado === saldoDisponivel;
  const saldoRestante = (saldoDisponivel ?? 0) - totalParcelado;
  const draftFim = calcularFim(draftInicio, draftDias);
  // CA10(c): o Adicional de 1/3 só pode estar vinculado a uma parcela por período aquisitivo —
  // se outra parcela já adicionada o tem, o checkbox do rascunho fica bloqueado e desmarcado.
  // Na edição de uma única parcela, as demais parcelas do registro também contam: o 1/3 já
  // vinculado a qualquer outra parcela do mesmo período bloqueia o checkbox.
  // registroBase: vale tanto para Editar quanto para Visualizar com parcela em foco.
  const parcelasDoRegistro = parcelaFoco && registroBase
    ? registroBase.parcelas.flatMap((parcela) => (parcela.id === parcelaFoco.id ? parcelas : [parcela]))
    : parcelas;
  const indiceParcelaComTerco = parcelasDoRegistro.findIndex((parcela) => parcela.terco);
  const tercoBloqueadoPorDuplicidade = indiceParcelaComTerco !== -1;
  const mensagemTercoDuplicado = `O Adicional Constitucional de 1/3 já foi solicitado na Parcela ${indiceParcelaComTerco + 1}.`;
  const [anexoKey, setAnexoKey] = useState(0);

  useEffect(() => {
    if (tercoBloqueadoPorDuplicidade && draftTerco) setGozoValor("terco", false);
  }, [tercoBloqueadoPorDuplicidade, draftTerco, setGozoValor]);

  // RN003: concomitância verificada assim que a data é escolhida (sem esperar o clique em
  // "Adicionar esta parcela") e também para as parcelas já adicionadas — senão o aviso
  // desaparece quando o rascunho é limpo após o "Adicionar". Qualquer sobreposição bloqueia.
  useEffect(() => {
    if (!matricula || somenteLeitura) {
      setAlertaConcomitancia("");
      return;
    }
    const candidatos = draftInicio && draftFim ? [{ inicio: draftInicio, fim: draftFim, dias: draftDias }, ...parcelas] : parcelas;
    for (const candidato of candidatos) {
      // CA08: ordem LTS → agendamento ativo → Art. 17. Primeiro ajusta pela LTS e só depois
      // verifica sobreposição — sobre as datas já ajustadas, que são as que serão gravadas.
      const ajuste = ajustarInicioParaAposLts(candidato.inicio, candidato.dias, matricula);
      const conflito = conflitoFeriasServidor(matricula, ajuste.inicio, ajuste.fim, registroParaEditar?.id);
      if (conflito) {
        setAlertaConcomitancia(mensagemConflitoAgendamento(conflito));
        return;
      }
      if (ajuste.ajustado) {
        setAlertaConcomitancia(
          `LTS está vigente no mesmo período. Data de início ajustada automaticamente para o dia seguinte ao fim da LTS vigente (${formatarDataBr(ajuste.inicio)}).`,
        );
        return;
      }
    }
    setAlertaConcomitancia("");
  }, [matricula, draftInicio, draftFim, draftDias, parcelas, somenteLeitura, parcelamentoRestrito, registroParaEditar?.id]);

  const opcoesDuracao = useMemo(
    () => duracoesPermitidas(saldoRestante, orgao, cargo),
    [saldoRestante, orgao, cargo],
  );

  useEffect(() => {
    if (opcoesDuracao.length && !opcoesDuracao.includes(draftDias)) {
      setGozoValor("duracao", opcoesDuracao[0]);
    }
  }, [opcoesDuracao, draftDias, setGozoValor]);

  const descricaoServidor = (servidor: ServidorMock) => `${servidor.matricula} - ${servidor.nome}`;

  const aplicarServidor = (servidor: ServidorMock) => {
    if (!permiteSolicitacaoFerias(servidor.tipoVinculo)) {
      setServidorEncontrado(false);
      setErro("Férias individuais são permitidas somente para vínculos Efetivo, Comissionado e Contrato Temporário. Residentes técnicos e estagiários não podem solicitar férias.");
      return;
    }
    const periodo = periodoDisponivelServidor(servidor);
    if (!periodo) { setErro('Servidor sem período aquisitivo com saldo disponível.'); setServidorEncontrado(false); return; }
    setParcelas([]);
    setServidorNome(servidor.nome);
    setMatricula(servidor.matricula);
    setOrgao(servidor.orgao);
    setSetor(servidor.setor);
    setCargo(servidor.cargo);
    setTipoVinculo(servidor.tipoVinculo);
    setCargoGestao(servidor.cargoGestao);
    setPeriodoAquisitivoInicio(periodo.inicio);
    setPeriodoAquisitivoFim(periodo.fim);
    setSaldoDisponivel(periodo.saldo);
    setServidorEncontrado(true);
    setServidorBusca(descricaoServidor(servidor));
    setAlertaConcomitancia("");
    const todosVinculos = vinculosDoServidor(servidor.nome);
    const indice = todosVinculos.findIndex(
      (vinculo) => vinculo.matricula === servidor.matricula && vinculo.tipoVinculo === servidor.tipoVinculo,
    ) + 1;
    setVinculoInfo({ indice: Math.max(indice, 1), total: todosVinculos.length });
  };

  const completarBuscaServidor = (query: string) => {
    const termo = query.trim().toLocaleLowerCase("pt-BR");
    const resultados = (!termo
      ? SERVIDORES_MOCK
      : SERVIDORES_MOCK.filter(
          (servidor) =>
            servidor.matricula.includes(termo) ||
            servidor.nome.toLocaleLowerCase("pt-BR").includes(termo),
        )).filter(
          (servidor, index, servidores) =>
            servidores.findIndex(
              (outro) => outro.matricula === servidor.matricula && outro.nome === servidor.nome,
            ) === index,
        );
    setSugestoesServidor(resultados.map(descricaoServidor));
  };

  const selecionarServidor = (valor: string) => {
    setServidorBusca(valor);
    const encontrado = SERVIDORES_MOCK.find((servidor) => descricaoServidor(servidor) === valor);

    if (!encontrado) {
      setServidorEncontrado(false);
      return;
    }
    const vinculos = SERVIDORES_MOCK.filter(
      (servidor) => servidor.matricula === encontrado.matricula && servidor.nome === encontrado.nome,
    );
    if (vinculos.length > 1) {
      setServidorEncontrado(false);
      setVinculosParaEscolher(vinculos);
    } else {
      aplicarServidor(encontrado);
    }
  };

  const buscarServidorIndividual = (valor: string) => {
    const termo = valor.trim().toLocaleLowerCase("pt-BR");
    const encontrado = SERVIDORES_MOCK.find(
      (servidor) =>
        servidor.matricula.toLocaleLowerCase("pt-BR") === termo ||
        servidor.nome.toLocaleLowerCase("pt-BR") === termo ||
        descricaoServidor(servidor).toLocaleLowerCase("pt-BR") === termo,
    );
    if (!encontrado) {
      completarBuscaServidor(valor);
      setErro("Servidor não localizado. Selecione uma opção da lista ou informe matrícula/nome completo.");
      return;
    }
    setErro("");
    selecionarServidor(descricaoServidor(encontrado));
  };

  const escolherVinculo = (vinculo: ServidorMock) => {
    setVinculosParaEscolher([]);
    aplicarServidor(vinculo);
  };

  const adicionarParcelaDraft = () => {
    if (!opcoesDuracao.includes(draftDias)) { setErro('Duração não permitida para este cargo ou deixaria saldo residual de 5 dias.'); return; }
    if (parcelas.length >= 3) {
      setErro("Limite de 3 parcelas atingido.");
      return;
    }
    if (!draftInicio) {
      setErro("Informe a data de início do gozo desta parcela.");
      return;
    }
    if (draftDias < 10) {
      setErro("Cada parcela precisa ter no mínimo 10 dias (Decreto 656/2020).");
      return;
    }
    if (draftDias > saldoRestante) {
      setErro(`A duração escolhida (${draftDias} dias) excede o saldo restante (${saldoRestante} dias).`);
      return;
    }
    {
      // CA08 (ordem LTS → agendamento ativo → Art. 17). RN-03: se a LTS já está vigente no
      // período, a data de início é ajustada automaticamente para o dia seguinte ao fim da LTS.
      const ajuste = ajustarInicioParaAposLts(draftInicio, draftDias, matricula);
      // RN003: a sobreposição com outro agendamento do mesmo servidor é verificada sobre as datas
      // já ajustadas pela LTS — são elas que serão gravadas.
      const conflito = conflitoFeriasServidor(matricula, ajuste.inicio, ajuste.fim, registroParaEditar?.id);
      if (conflito) {
        setErro(mensagemConflitoAgendamento(conflito));
        return;
      }
      const novoId = gerarId();
      setAlertaConcomitancia("");
      if (ajuste.ajustado) {
        setAvisosAjusteLts((atual) => ({
          ...atual,
          [novoId]: `LTS está vigente no mesmo período. Data de início ajustada automaticamente para o dia seguinte ao fim da LTS vigente (${formatarDataBr(ajuste.inicio)}).`,
        }));
      }
      setParcelas((atual) => [
        ...atual,
        { id: novoId, inicio: ajuste.inicio, fim: ajuste.fim, dias: draftDias, terco: draftTerco },
      ]);
    }
    setErro("");
    setGozoValor("dataInicio", "");
    setGozoValor("terco", false);
  };

  const removerParcela = (id: number) => {
    setParcelas((atual) => atual.filter((parcela) => parcela.id !== id));
    setAvisosAjusteLts((atual) => {
      const { [id]: _removido, ...resto } = atual;
      return resto;
    });
  };

  const salvar = () => {
    if (ehEdicao) {
      if (!documento) { setErro('Anexe a justificativa formal da alteração.'); return; }
      if (!parcelas.length || parcelas.some((parcela) => !parcela.inicio || parcela.dias < 1)) {
        setErro("Informe a data de início e ao menos 1 dia em todas as parcelas.");
        return;
      }
      // RN005: só parcela ainda não iniciada pode ser alterada — a parcela nova ou ajustada precisa
      // começar depois de hoje. Parcelas mantidas sem alteração não são reavaliadas.
      const hojeEdicao = dataLocalISO();
      const parcelaAlteradaNoPassado = parcelas.find((parcela) => {
        const original = registroParaEditar!.parcelas.find((p) => p.id === parcela.id);
        const inalterada = original && original.inicio === parcela.inicio && original.fim === parcela.fim;
        return !inalterada && parcela.inicio <= hojeEdicao;
      });
      if (parcelaAlteradaNoPassado) {
        setErro(`A parcela de ${formatarDataBr(parcelaAlteradaNoPassado.inicio)} não pode ser gravada: a data de início deve ser posterior a hoje (parcela em usufruto ou já usufruída não pode ser alterada).`);
        return;
      }
      const saldo = saldoDisponivel ?? diasSolicitados(registroParaEditar!);
      const total = parcelas.reduce((soma, parcela) => soma + parcela.dias, 0);
      if (total > saldo || (!parcelaFoco && saldo - total === 5) || parcelas.some((parcela) => !duracoesPermitidas(saldo, orgao, cargo).includes(parcela.dias) && !(parcelaFoco && parcela.dias === parcelaFoco.dias))) {
        setErro('Parcelamento inválido: verifique saldo, cargo e sobra de 5 dias.');
        return;
      }
      // Parcela única em edição: as demais parcelas do registro seguem intactas.
      const parcelasFinais = parcelaFoco
        ? registroParaEditar!.parcelas.flatMap((parcela) => (parcela.id === parcelaFoco.id ? parcelas : [parcela]))
        : parcelas;
      const erroIntervalo = validarIntervaloParcelas(parcelasFinais);
      if (erroIntervalo) { setErro(erroIntervalo); return; }
      // CA10/RN009: o 1/3 só pode estar em uma parcela do período aquisitivo (registro completo).
      if (parcelasFinais.filter((parcela) => parcela.terco).length > 1) {
        const indice = parcelasFinais.findIndex((parcela) => parcela.terco);
        setErro(`O Adicional Constitucional de 1/3 já foi solicitado na Parcela ${indice + 1}.`);
        return;
      }
      setErro("");
      // Alterar uma solicitação já Agendada (EM ABERTO) devolve a solicitação ao aprovador
      // quando veio do Portal do Servidor.
      const retornaAoAprovador = registroParaEditar!.origem === "PORTALSERVIDOR" && parcelamentoRestrito;
      const situacaoFinal: SituacaoFerias = retornaAoAprovador ? "AGUARDANDO VALIDAÇÃO" : registroParaEditar!.situacao;
      onSalvar({
        ...registroParaEditar!,
        parcelas: parcelasFinais,
        documentos: [...(registroParaEditar!.documentos ?? []), documento],
        historico: eventoEdicao(registroParaEditar!, parcelasFinais, situacaoFinal, documento),
        ...(retornaAoAprovador ? { situacao: "AGUARDANDO VALIDAÇÃO" as const, avaliadoPor: undefined, avaliadoEm: undefined } : {}),
      });
      return;
    }
    if (!documento) { setErro('Anexe o documento/despacho formal do SIGEP.'); return; }
    if (!parcelas.length || parcelas.some(p => !duracoesPermitidas(saldoDisponivel ?? 0, orgao, cargo).includes(p.dias)) || saldoRestante === 5) { setErro('Parcelamento inválido para o cargo ou saldo residual de 5 dias.'); return; }
    if (!servidorEncontrado || !tipoVinculo || !permiteSolicitacaoFerias(tipoVinculo)) {
      setErro("Férias individuais são permitidas somente para vínculos Efetivo, Comissionado e Contrato Temporário. Residentes técnicos e estagiários não podem solicitar férias.");
      return;
    }
    if (!servidorNome.trim() || !matricula.trim() || !cargo.trim() || !tipoVinculo || !periodoAquisitivoInicio || !periodoAquisitivoFim) {
      setErro("Preencha servidor, matrícula, cargo, tipo de vínculo e período aquisitivo (início e fim).");
      return;
    }
    if (parcelas.some((parcela) => !parcela.inicio || parcela.dias < 10)) {
      setErro("Cada parcela precisa de data de início e no mínimo 10 dias (Decreto 656/2020).");
      return;
    }
    // RN-AGD-06: só é permitido agendar férias de período aquisitivo já completado.
    const erroPeriodo = validarPeriodoAquisitivoCompletado(
      { inicio: periodoAquisitivoInicio, fim: periodoAquisitivoFim },
      dataLocalISO(),
    );
    if (!erroPeriodo.sucesso) {
      setErro(erroPeriodo.mensagem);
      return;
    }
    // RN017: a solicitação deve ser registrada até o dia 05 do mês anterior ao início do usufruto
    // (parcela mais antiga). Substitui a antiga antecedência mínima de 30 dias corridos.
    const inicioMaisAntigo = inicioMaisAntigoParcelas(parcelas);
    if (inicioMaisAntigo) {
      const erroPrazo = validarPrazoRegistroFerias(dataLocalISO(), inicioMaisAntigo);
      if (!erroPrazo.sucesso) {
        setErro(erroPrazo.mensagem);
        return;
      }
    }
    const erroIntervalo = validarIntervaloParcelas(parcelas);
    if (erroIntervalo) {
      setErro(erroIntervalo);
      return;
    }
    // CA08/RN007: a concomitância é revalidada no salvar — outro agendamento pode ter sido
    // gravado depois que a parcela foi adicionada.
    for (const parcela of parcelas) {
      const conflito = conflitoFeriasServidor(matricula, parcela.inicio, parcela.fim);
      if (conflito) {
        setErro(mensagemConflitoAgendamento(conflito));
        return;
      }
    }
    if (totalParcelado > (saldoDisponivel ?? 0)) {
      setErro(`A soma das parcelas (${totalParcelado} dias) excede o saldo disponível (${saldoDisponivel} dias).`);
      return;
    }
    setErro("");
    onSalvar({
      id: gerarId(),
      servidorNome,
      matricula,
      cpf: "",
      orgao,
      orgaoColetivo: "OUTRO",
      setor,
      cargo,
      cargoGestao: cargoGestao === true,
      tipoVinculo: tipoVinculo as TipoVinculo,
      tipo: "Individual",
      origem: origemLancamento,
      periodoAquisitivoInicio,
      periodoAquisitivoFim,
      parcelas,
      // Regra de origem: lançamento via SIGEP nasce "Agendada" (EM ABERTO), sem aprovação;
      // lançamento via Portal do Servidor nasce "Aguardando Validação" (a chefia valida).
      situacao: situacaoInicialPorOrigem(origemLancamento),
      // RN017: lançamento do Portal aguarda a chefia até o dia 09 do mês anterior ao usufruto.
      ...(origemLancamento === "PORTALSERVIDOR" && inicioMaisAntigo
        ? { dataLimiteValidacaoChefia: calcularPrazoValidacaoChefia(inicioMaisAntigo) }
        : {}),
      saldoFerias: saldoDisponivel ?? 0,
      documentos: [documento],
      substitutos: [],
      responsavelLancamento: "Usuário atual",
      lancadoEm: new Date().toLocaleString("pt-BR"),
      // RN-FOL-08: se havia dias pendentes de suspensão Art. 17, eles são incluídos na competência
      // deste novo gozo. Registramos apenas o impacto FUNCIONAL (dias) — nunca valores.
      ...(pendenciaArt17?.pendenciaSaldo
        ? {
            pendenciaSaldo: {
              diasComprometidos: pendenciaArt17.pendenciaSaldo.diasComprometidos,
              origem: "SUSPENSAO_ART17" as const,
              competenciaCobranca: competenciaNovoGozo ? competenciaDoGozo(competenciaNovoGozo) : undefined,
            },
          }
        : {}),
      historico: [
        origemLancamento === "PORTALSERVIDOR"
          ? { situacao: situacaoInicialPorOrigem(origemLancamento), acao: "lancamento", data: new Date().toLocaleString("pt-BR"), responsavel: "Servidor", responsavelMatricula: matricula, responsavelVinculo: tipoVinculo as TipoVinculo, documentos: [documento] }
          : { situacao: situacaoInicialPorOrigem(origemLancamento), acao: "lancamento", data: new Date().toLocaleString("pt-BR"), responsavel: "Gestor", responsavelMatricula: USUARIO_ATOR_MOCK.Gestor.matricula, responsavelVinculo: USUARIO_ATOR_MOCK.Gestor.vinculo, documentos: [documento] },
        ...(pendenciaArt17?.pendenciaSaldo
          ? [{
              situacao: "EM ABERTO" as const,
              acao: "atualizacao",
              data: new Date().toLocaleString("pt-BR"),
              responsavel: "Sistema",
              justificativa: `Inclusão de ${pendenciaArt17.pendenciaSaldo.diasComprometidos} dias pendentes da suspensão Art. 17 na competência deste novo gozo (RN-FOL-08).`,
            }]
          : []),
      ],
    });
  };

  // RN-AGD-07: alerta de período concessivo (12 meses após o fim do aquisitivo) próximo do
  // vencimento. Só para lançamento novo, quando há um período aquisitivo selecionado.
  const alertaConcessivo =
    !somenteLeitura && !ehEdicao && periodoAquisitivoFim
      ? calcularAlertaConcessivo(periodoAquisitivoFim, dataLocalISO())
      : null;

  // RN-FOL-08: se o servidor tem dias pendentes de uma suspensão Art. 17, o novo agendamento os
  // inclui na competência do novo gozo. Alerta FUNCIONAL (dias) — sem valores, que são da Folha.
  const pendenciaArt17 = !somenteLeitura && !ehEdicao ? pendenciaArt17Pendente(matricula) : null;
  const competenciaNovoGozo = parcelas
    .map((parcela) => parcela.inicio)
    .filter(Boolean)
    .sort()[0];

  // Fluxo 5: o "Voltar" só pede confirmação quando há algo a perder. Criação: servidor buscado,
  // parcela, data em rascunho ou anexo. Edição: parcelas alteradas, data em rascunho ou anexo.
  const temDadosPreenchidos = somenteLeitura
    ? false
    : ehEdicao
      ? Boolean(documento) || Boolean(valoresGozo.dataInicio) || JSON.stringify(parcelas) !== parcelasIniciais
      : Boolean(servidorBusca.trim()) || servidorEncontrado || parcelas.length > 0 || Boolean(documento) || Boolean(valoresGozo.dataInicio);

  return (
    <div className="prototype-ferias-individual-form">
      {erro ? <div className="prototype-ferias-erro-bloqueio" role="alert">{erro}</div> : null}
      {pendenciaArt17?.pendenciaSaldo ? (
        <div className="prototype-ferias-banner is-alerta" role="note">
          <i className="pi pi-exclamation-triangle" aria-hidden="true" />
          <span>
            Atenção: você possui <strong>{pendenciaArt17.pendenciaSaldo.diasComprometidos} dias de férias</strong>{" "}
            referentes à suspensão por interesse público (Art. 17) pendentes de gozo. Ao confirmar este
            agendamento, esses dias serão incluídos nesta competência
            {competenciaNovoGozo ? ` (${competenciaDoGozo(competenciaNovoGozo)})` : ""}.
          </span>
        </div>
      ) : null}
      {alertaConcomitancia ? (
        <div className="prototype-ferias-banner is-alerta" role="note">
          <i className="pi pi-exclamation-triangle" aria-hidden="true" />
          <span>{alertaConcomitancia}</span>
        </div>
      ) : null}
      {alertaConcessivo?.alertar ? (
        <div className="prototype-ferias-banner is-alerta" role="note">
          <i className="pi pi-exclamation-triangle" aria-hidden="true" />
          <span>
            {alertaConcessivo.vencido
              ? `Período concessivo vencido em ${formatarDataBr(alertaConcessivo.fimConcessivo)}. As férias deveriam ter sido concedidas até essa data.`
              : `Período concessivo encerra em ${formatarDataBr(alertaConcessivo.fimConcessivo)} (faltam ${alertaConcessivo.diasRestantes} dias). Conceda as férias antes do vencimento.`}
          </span>
        </div>
      ) : null}

      {!somenteLeitura && !ehEdicao ? (
        <div className="prototype-ferias-banner" style={{ background: "#eff6ff", borderColor: "#bfdbfe", color: "#1d4ed8" }}>
          <i className="pi pi-info-circle" aria-hidden="true" />
          <span>
            Lançamento individual SIGEP: status inicial <strong>Agendada</strong>, respaldado pelo documento/despacho formal obrigatório.
          </span>
        </div>
      ) : null}

      {ehEdicao ? (
        <div className="prototype-ferias-banner" style={{ background: "#eff6ff", borderColor: "#bfdbfe", color: "#1d4ed8" }}>
          <i className="pi pi-info-circle" aria-hidden="true" />
          <span>
            {parcelamentoRestrito
              ? registroParaEditar!.origem === "PORTALSERVIDOR"
                ? "Solicitação já aprovada: adicione, remova ou ajuste as parcelas normalmente — a alteração devolve a solicitação ao aprovador para nova validação."
                // RN014: lançamento SIGEP permanece Agendada após a alteração (ver salvar()).
                : "Solicitação já agendada: adicione, remova ou ajuste as parcelas normalmente — a alteração mantém a solicitação Agendada."
              : "Edição permitida enquanto a solicitação estiver Aguardando Validação. O intervalo entre parcelas continua valendo 0 ou 10 dias corridos (Decreto 656/2020)."}
          </span>
        </div>
      ) : null}

      {/* RN-FOL-02 / RN-CAN-03: se o adiantamento (remuneração + 1/3) já foi pago, remanejar as
          datas torna o valor pago indevido para o período original — o motor da folha gera um
          débito (estorno) que é descontado na próxima folha (fluxo "Cancelamento após pagamento"). */}
      {ehEdicao && registroParaEditar!.adiantamentoPago ? (
        <div className="prototype-ferias-banner is-alerta" role="note">
          <i className="pi pi-exclamation-triangle" aria-hidden="true" />
          <span>
            <strong>Adiantamento já pago.</strong> O adiantamento de férias (remuneração + 1/3) deste
            período já foi processado em folha. Ao remanejar as datas, o valor pago torna-se indevido e o
            sistema <strong>gera um débito (estorno do adiantamento), descontado automaticamente na próxima
            folha subsequente</strong>. O novo período gera o adiantamento na competência correspondente.
          </span>
        </div>
      ) : null}

      <div className={somenteLeitura ? "prototype-ferias-visualizacao-somente-leitura" : undefined}>
      <div className="prototype-ferias-form-section">
        <h3 className="prototype-ferias-secao-titulo">
          <i className="pi pi-user" aria-hidden="true" />
          1. Identificação do Servidor &amp; Saldo Aquisitivo (seleção automática do mais antigo)
        </h3>
        {!servidorTravado ? (
          <label className="prototype-ferias-busca-servidor-label" htmlFor="ferias-individual-busca-servidor">
            <span>Buscar Servidor (Matrícula ou Nome)</span>
            <div className="prototype-ferias-busca-servidor-row">
              <SeplagAutoComplete
                inputId="ferias-individual-busca-servidor"
                className="w-full"
                value={servidorBusca}
                suggestions={sugestoesServidor}
                placeholder="Matrícula ou nome do servidor"
                forceSelection={false}
                completeMethod={completarBuscaServidor}
                onChange={(event) => setServidorBusca(String(event.value ?? ""))}
                onSelect={(event) => selecionarServidor(String(event.value ?? ""))}
              />
              <BotaoBuscarServidor onClick={() => buscarServidorIndividual(servidorBusca)} />
            </div>
          </label>
        ) : null}

        {servidorEncontrado && (
          <div className="prototype-ferias-servidor-resultado">
            <div className="prototype-ferias-servidor-resultado-grid is-identificacao">
              <div>
                <span className="prototype-ferias-indicador-rotulo">Nome do Servidor</span>
                <strong>{servidorNome}</strong>
              </div>
              <div>
                <span className="prototype-ferias-indicador-rotulo">Matrícula / Vínculo</span>
                <strong>
                  {/* O número do vínculo só aparece quando o servidor tem mais de um. */}
                  {vinculoInfo && vinculoInfo.total > 1 ? (
                    <span className="prototype-ferias-vinculo-ativo-badge">
                      {matricula} · Vínculo {vinculoInfo.indice}
                    </span>
                  ) : (
                    matricula
                  )}
                </strong>
              </div>
              <div>
                <span className="prototype-ferias-indicador-rotulo">Cargo / Função</span>
                <strong>{cargo}</strong>
              </div>
              <div>
                <span className="prototype-ferias-indicador-rotulo">Lotação / Vínculo</span>
                <strong>{orgao} · {tipoVinculo}</strong>
              </div>
              <div>
                <span className="prototype-ferias-indicador-rotulo">Setor</span>
                <strong>{setor || "—"}</strong>
              </div>
              <hr className="prototype-ferias-servidor-resultado-divisor" />
              <div className="prototype-ferias-servidor-resultado-periodo">
                <span className="prototype-ferias-indicador-rotulo">Período Aquisitivo Ativo</span>
                <strong>{formatarDataBr(periodoAquisitivoInicio)} a {formatarDataBr(periodoAquisitivoFim)}</strong>
              </div>
              <div className="prototype-ferias-servidor-resultado-saldo">
                <span className="prototype-ferias-indicador-rotulo">Saldo de Férias</span>
                <span className="prototype-ferias-badge-saldo">{saldoDisponivel ?? 0} dias restantes</span>
              </div>
            </div>
            {!servidorTravado ? (
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar servidor"
                icon="pi pi-times"
                style={{ width: "auto", whiteSpace: "nowrap", height: 32, padding: "0 12px", fontSize: "0.82rem" }}
                onClick={() => {
                  // RN013: reseta a seleção do servidor e o formulário (parcelas, rascunho, anexo e avisos).
                  setServidorNome("");
                  setMatricula("");
                  setOrgao("");
                  setSetor("");
                  setCargo("");
                  setTipoVinculo("");
                  setCargoGestao(null);
                  setPeriodoAquisitivoInicio("");
                  setPeriodoAquisitivoFim("");
                  setSaldoDisponivel(null);
                  setServidorEncontrado(false);
                  setServidorBusca("");
                  setSugestoesServidor([]);
                  setVinculosParaEscolher([]);
                  setVinculoInfo(null);
                  setParcelas([]);
                  setAvisosAjusteLts({});
                  setErro("");
                  setAlertaConcomitancia("");
                  setGozoValor("dataInicio", "");
                  setGozoValor("terco", false);
                  setDocumento(null);
                  setAnexoKey((atual) => atual + 1);
                }}
              />
            ) : null}
          </div>
        )}
      </div>

      {servidorEncontrado && (tipoVinculo === "Efetivo" || tipoVinculo === "Comissionado" || tipoVinculo === "Contrato Temporário") && (() => {
        const carencia = calcularCarencia(periodoAquisitivoInicio);
        if (!carencia) return null;
        return (
          <div className="prototype-ferias-form-section prototype-ferias-carencia-painel">
            <h3 className="prototype-ferias-secao-titulo">
              <i className="pi pi-calendar" aria-hidden="true" />
              Período aquisitivo &amp; carência
            </h3>
            <div className="prototype-ferias-carencia-linha">
              <div className="prototype-ferias-carencia-item">
                <span className="prototype-ferias-carencia-label">Início do vínculo</span>
                <strong>{formatarDataBr(periodoAquisitivoInicio)}</strong>
              </div>
              <div className="prototype-ferias-carencia-seta">→</div>
              <div className="prototype-ferias-carencia-item">
                <span className="prototype-ferias-carencia-label">Hoje</span>
                <strong>{formatarDataBr(carencia.hoje)}</strong>
              </div>
              <div className="prototype-ferias-carencia-seta">→</div>
              <div className="prototype-ferias-carencia-item">
                <span className="prototype-ferias-carencia-label">Tempo de vínculo</span>
                <strong>{carencia.meses} {carencia.meses === 1 ? "mês" : "meses"} e {carencia.diasRestantes} {carencia.diasRestantes === 1 ? "dia" : "dias"} ({carencia.totalDias} dias)</strong>
              </div>
            </div>
            <div className="prototype-ferias-carencia-badges">
              <span className={`prototype-ferias-carencia-badge ${carencia.cumpre12 ? "is-ok" : "is-erro"}`}>
                <i className={`pi ${carencia.cumpre12 ? "pi-check" : "pi-times"}`} />
                {" "}12 meses (365 dias) — {carencia.cumpre12 ? "período aquisitivo completo" : `faltam ${365 - carencia.totalDias} dias`}
              </span>
            </div>
          </div>
        );
      })()}

      <div className="prototype-ferias-form-section">
        <h3 className="prototype-ferias-secao-titulo">
          <i className="pi pi-calendar" aria-hidden="true" />
          2. Detalhes do Período de Gozo
        </h3>

        {!somenteLeitura ? (
          <>
            <div className="prototype-ferias-gozo-grid">
              <div>
                <DropdownFieldSeplag
                  name="duracao"
                  control={gozoControl}
                  label="Duração desta parcela"
                  cols="12"
                  disabled={parcelas.length >= 3 || !opcoesDuracao.length}
                  options={opcoesDuracao.map((dias) => ({
                    label: `${dias === saldoDisponivel ? "Integral" : "Parcela"} (${dias} dias)`,
                    value: dias,
                  }))}
                  optionLabel="label"
                  optionValue="value"
                  getFormErrorMessage={() => null}
                />
                <small className="prototype-ferias-gozo-ajuda">
                  Padrões: 3×10, 2×15, 1×10+1×20. Mínimo 10 dias/parcela.
                </small>
              </div>
              <div>
                <DateFieldSeplag
                  name="dataInicio"
                  control={gozoControl}
                  label="Data início do gozo"
                  cols="12"
                  disabled={parcelas.length >= 3 || !opcoesDuracao.length}
                  getFormErrorMessage={() => null}
                />
              </div>
              <label>
                <span>Data fim (calculada)</span>
                <input className="prototype-ferias-readonly-field" value={formatarDataBr(draftFim)} readOnly />
                <small className="prototype-ferias-gozo-ajuda">Calculado automaticamente.</small>
              </label>
            </div>

            <div className="prototype-ferias-gozo-acoes">
              <button
                type="button"
                className="prototype-ferias-sub-add"
                disabled={parcelas.length >= 3 || !opcoesDuracao.length}
                onClick={adicionarParcelaDraft}
              >
                <i className="pi pi-plus" aria-hidden="true" />
                Adicionar esta parcela
              </button>
              <span className={saldoFecha ? "prototype-ferias-saldo-ok" : "prototype-ferias-saldo-erro"}>
                {totalParcelado} de {saldoDisponivel ?? 0} dias parcelados
              </span>
            </div>
          </>
        ) : null}

        {parcelas.length > 0 && (
          <div className="prototype-ferias-gozo-lista">
            {parcelas.map((parcela) => (
              <div className="prototype-ferias-gozo-item" key={parcela.id}>
                <span>
                  {formatarDataBr(parcela.inicio)} a {formatarDataBr(parcela.fim)} ({parcela.dias} dias)
                  {parcela.terco ? <span className="prototype-ferias-badge-tipo"> + 1/3 constitucional</span> : null}
                  {avisosAjusteLts[parcela.id] ? (
                    <div className="prototype-ferias-banner is-alerta" role="note">
                      <i className="pi pi-exclamation-triangle" aria-hidden="true" />
                      <span>{avisosAjusteLts[parcela.id]}</span>
                    </div>
                  ) : null}
                </span>
                {!somenteLeitura ? (
                  <button type="button" className="prototype-ferias-icon-btn" title="Remover parcela" onClick={() => removerParcela(parcela.id)}>
                    <i className="pi pi-trash" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <label
          className="prototype-ferias-gozo-terco"
          title={tercoBloqueadoPorDuplicidade ? mensagemTercoDuplicado : undefined}
        >
          <input
            type="checkbox"
            checked={draftTerco}
            disabled={somenteLeitura || tercoBloqueadoPorDuplicidade}
            onChange={(event) => setGozoValor("terco", event.target.checked)}
          />
          Pagar o Adicional Constitucional de 1/3 nesta parcela (Art. 19, II)
        </label>
      </div>

      {/* key: "Limpar servidor" remonta o anexo para descartar o arquivo escolhido. */}
      {!somenteLeitura && <AnexoFerias key={anexoKey} label={ehEdicao ? "Justificativa formal da alteração" : "Documento / despacho formal (SIGADOC)"} onChange={setDocumento} />}

      </div>

      <div className="prototype-vinculo-form prototype-ferias-lancamento-acoes" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <BotaoVoltarSeplag type="button" label="Voltar" onClick={() => onCancelar(temDadosPreenchidos)} />
        {!somenteLeitura ? <BotaoSalvarSeplag type="button" label={ehEdicao ? "Salvar alteração" : "Salvar Agendamento"} onClick={salvar} /> : null}
      </div>

      {vinculosParaEscolher.length > 0 ? (
        <ModalMultiplosVinculos
          vinculos={vinculosParaEscolher}
          onEscolher={escolherVinculo}
          onFechar={() => {
            setVinculosParaEscolher([]);
            setServidorBusca("");
            setSugestoesServidor([]);
            setServidorEncontrado(false);
          }}
        />
      ) : null}
    </div>
  );
}

/** Valor sentinela da opção "Todos" no dropdown Escola/Lotação — disponível para os três
 * órgãos (SEDUC/UNEMAT/SECITEC), lista professores de todas as escolas/unidades/câmpus do
 * órgão selecionado de uma só vez, combinável com os demais filtros (busca, situação de
 * validação, tipo de vínculo). */
const ESCOPO_TODAS_LOTACOES = "__todas__";

export function FormularioColetiva({
  onCancelar,
  onSalvar,
  modoAgendamentoLote = false,
}: Readonly<{ onCancelar: () => void; onSalvar: (registros: FeriasRegistro[]) => void; modoAgendamentoLote?: boolean }>) {
  const anoAtual = new Date().getFullYear();
  const anosDisponiveis = Array.from({ length: 6 }, (_, indice) => String(anoAtual + indice));
  const [perfilLote, setPerfilLote] = useState<PerfilLote>("SECRETARIO_SEDUC");
  const {
    control: coletivaControl,
    watch: watchColetiva,
    setValue: setColetivaValue,
  } = useForm<{
    orgao: "SEDUC" | "UNEMAT" | "SECITEC";
    escola: string;
    periodoAquisitivo: string;
    tipoVinculoFiltro: TipoVinculoFiltro;
  }>({
    defaultValues: {
      orgao: "SEDUC",
      escola: "Escola Estadual Antônio Ferreira",
      periodoAquisitivo: String(anoAtual),
      tipoVinculoFiltro: modoAgendamentoLote ? "Efetivo" : "Todos",
    },
  });
  const [orgao, escola, , tipoVinculoFiltro] = watchColetiva([
    "orgao",
    "escola",
    "periodoAquisitivo",
    "tipoVinculoFiltro",
  ]);
  const [inicioJulho, setInicioJulho] = useState(`${anoAtual}-07-06`);
  const [inicioJaneiro, setInicioJaneiro] = useState(`${anoAtual + 1}-01-04`);
  // RN017: data padrão das parcelas do Lote = primeiro início ainda permitido hoje (registro até o
  // dia 05 do mês anterior ao usufruto); o usuário ajusta cada data depois.
  const [iniciosParcelasLote, setIniciosParcelasLote] = useState<Record<DuracaoLote, string>>(() => {
    const inicio = primeiroInicioUsufrutoPermitido(dataLocalISO());
    return { 10: inicio, 15: inicio, 20: inicio, 30: inicio };
  });
  const [textoBusca, setTextoBusca] = useState("");
  const [buscaNome, setBuscaNome] = useState("");
  const [primeiroRegistro, setPrimeiroRegistro] = useState(0);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [selecionados, setSelecionados] = useState<Record<number, {
    incluido: boolean;
    julho: boolean;
    janeiro: boolean;
    parcelasLote: Record<DuracaoLote, boolean>;
  }>>({});
  const [erro, setErro] = useState<string[]>([]);
  const [soComAlerta, setSoComAlerta] = useState(false);
  const [filtroAlertaAba1, setFiltroAlertaAba1] = useState<"todos" | "alerta" | "ok">("todos");
  // Órgão não é de livre escolha: é definido pelo perfil de lotação de quem está lançando —
  // Secretário Escolar só lança para a SEDUC; Gestão de Pessoas só para a UNEMAT ou SECITEC.
  const [perfilColetiva, setPerfilColetiva] = useState<PerfilLote>("SECRETARIO_SEDUC");
  const [abaColetiva, setAbaColetiva] = useState<1 | 2>(1);
  const [primeiroAba2, setPrimeiroAba2] = useState(0);
  const [porPaginaAba2, setPorPaginaAba2] = useState(10);
  const [buscaAba2, setBuscaAba2] = useState("");

  useEffect(() => {
    if (!modoAgendamentoLote) return;
    const proximoOrgao = perfilLote === "GESTAO_UNEMAT" ? "UNEMAT" : perfilLote === "GESTAO_SECITEC" ? "SECITEC" : "SEDUC";
    const gestaoOrgao = perfilLote === "GESTAO_UNEMAT" || perfilLote === "GESTAO_SECITEC";
    const primeiraLotacao = gestaoOrgao
      ? ESCOPO_TODAS_LOTACOES
      : professoresLote.find((professor) => professor.orgao === proximoOrgao)?.lotacaoNome ?? "";
    setColetivaValue("orgao", proximoOrgao);
    setColetivaValue("escola", primeiraLotacao);
    setColetivaValue("tipoVinculoFiltro", "Efetivo");
    setBuscaNome("");
    setTextoBusca("");
    setAbaColetiva(1);
  }, [modoAgendamentoLote, perfilLote, setColetivaValue]);

  useEffect(() => {
    if (modoAgendamentoLote) return;
    const proximoOrgao = perfilColetiva === "GESTAO_UNEMAT" ? "UNEMAT" : perfilColetiva === "GESTAO_SECITEC" ? "SECITEC" : "SEDUC";
    const primeiraLotacao = professoresLote.find((professor) => professor.orgao === proximoOrgao)?.lotacaoNome ?? "";
    setColetivaValue("orgao", proximoOrgao);
    setColetivaValue("escola", primeiraLotacao);
    setBuscaNome("");
    setTextoBusca("");
  }, [modoAgendamentoLote, perfilColetiva, setColetivaValue]);

  const fimJulho = calcularFim(inicioJulho, 15);
  const fimJaneiro = calcularFim(inicioJaneiro, 30);
  const fimParcelasLote: Record<DuracaoLote, string> = {
    10: calcularFim(iniciosParcelasLote[10], 10),
    15: calcularFim(iniciosParcelasLote[15], 15),
    20: calcularFim(iniciosParcelasLote[20], 20),
    30: calcularFim(iniciosParcelasLote[30], 30),
  };
  const usaRegraAquisitivoUnemat = orgao === "UNEMAT";

  /** Erros bloqueantes: o servidor não pode entrar no lote. */
  const errosDe = useCallback((professor: ProfessorLote): string[] => {
    const lista: string[] = [];
    // Cargo de gestão só é motivo de exclusão na Coletiva (regra exclusiva de professor);
    // no Agendamento em Lote, cargos de gestão/apoio são o próprio público-alvo da tela.
    if (professor.cargoGestao && !modoAgendamentoLote) {
      lista.push("Cargo de gestão — requer agendamento individual");
    }
    if (professor.remocaoRecentePendente) lista.push("Remoção recente — aguarda análise de férias");
    if (professor.vinculoEncerrado) lista.push("Vínculo encerrado — não pode receber novo lançamento");
    if (professor.feriasConcomitante) lista.push("Já possui férias no período — possível duplicidade");
    if (professor.cedido) {
      if (orgao === "UNEMAT") {
        lista.push("Servidor cedido — ajuste de saldo 45→30 pendente de parâmetro definido com a UNEMAT");
      } else {
        lista.push(modoAgendamentoLote
          ? "Servidor cedido — excluído do lote; saldo de referência: 30 dias"
          : "Servidor cedido — confirmar lotação e saldo");
      }
    }
    if (professor.vinculo === "Contrato Temporário" && orgao !== "UNEMAT" && professor.periodoAquisitivoFechado !== true) {
      lista.push("Contrato temporário sem período aquisitivo fechado");
    }
    const saldo = professor.saldo;
    if (modoAgendamentoLote) {
      // Cargos de gestão/apoio não têm direito aos 45 dias — benefício exclusivo de professor (LC 50/1998).
      if (saldo === 45) {
        lista.push("Saldo de 45 dias não se aplica a cargo de gestão/apoio — benefício exclusivo de professor");
      }
    } else {
      // Fora da escola → direito a 30 dias; saldo 45 indica inconsistência cadastral
      if ((professor.situacaoLotacao === "Fora da escola" || professor.situacaoLotacao === "Fora de unidade") && saldo === 45) {
        lista.push("Saldo de 45 dias fora da escola — inconsistência cadastral; verifique antes de incluir");
      }
      if (professor.situacaoLotacao === "Em escola" && saldo === 30) {
        lista.push("Saldo de 30 dias em escola — inconsistência cadastral");
      }
      if (orgao === "UNEMAT" && professor.situacaoLotacao === "Em unidade universitária" && saldo !== 45) {
        lista.push("Saldo diferente de 45 dias — fora do critério do lote");
      }
    }
    return lista;
  }, [modoAgendamentoLote, orgao]);

  /** Avisos não-bloqueantes: o operador deve analisar, mas pode prosseguir. */
  const avisosDe = useCallback((professor: ProfessorLote): string[] => {
    const lista: string[] = [];
    if (professor.ltsConcomitante) lista.push("LTS concomitante ao período — decidir inclusão");
    if (professor.afastamentoConcomitante) {
      lista.push(`${professor.afastamentoConcomitante} no período — decidir inclusão`);
    }
    // Fora da escola com saldo correto (30 dias) — regra de professor; não se aplica ao lote de apoio/gestão.
    if (
      !modoAgendamentoLote &&
      (professor.situacaoLotacao === "Fora da escola" || professor.situacaoLotacao === "Fora de unidade") &&
      professor.saldo === 30
    ) {
      lista.push("Fora da escola — gozo limitado a 30 dias (não 45)");
    }
    return lista;
  }, [modoAgendamentoLote]);

  const alertasDe = useCallback(
    (professor: ProfessorLote): string[] => [...errosDe(professor), ...avisosDe(professor)],
    [errosDe, avisosDe],
  );

  const lotacoesDisponiveis = useMemo(
    () => Array.from(new Set(professoresLote
      .filter((professor) =>
        professor.orgao === orgao &&
        (professor.situacaoLotacao === "Em escola" || professor.situacaoLotacao === "Em unidade universitária"),
      )
      .map((professor) => professor.lotacaoNome))),
    [orgao],
  );
  const professoresDaLotacao = useMemo(
    () => professoresLote.filter(
      (professor) =>
        // Coletiva: exclusiva de professor. Agendamento em Lote: cargos de gestão/apoio (não professor).
        (modoAgendamentoLote ? professor.cargo !== "Professor" : professor.cargo === "Professor") &&
        // CA01: cargo de gestão nunca aparece na Coletiva — não é um erro de linha, é exclusão da listagem.
        !(professor.cargoGestao && !modoAgendamentoLote) &&
        professor.orgao === orgao &&
        (escola === ESCOPO_TODAS_LOTACOES ? true : professor.lotacaoNome === escola),
    ),
    [modoAgendamentoLote, orgao, escola],
  );

  const listaFiltrada = useMemo(() => {
    const buscaNormalizada = buscaNome.trim().toLocaleLowerCase("pt-BR");
    const buscaCpf = buscaNormalizada.replace(/\D/g, "");
    return professoresDaLotacao.filter((professor) => {
      if (tipoVinculoFiltro !== "Todos" && professor.vinculo !== tipoVinculoFiltro) return false;
      if (
        buscaNormalizada &&
        !professor.nome.toLocaleLowerCase("pt-BR").includes(buscaNormalizada) &&
        !professor.matricula.includes(buscaNormalizada) &&
        !(buscaCpf && professor.cpf?.replace(/\D/g, "").includes(buscaCpf))
      ) {
        return false;
      }
      if (filtroAlertaAba1 === "alerta" && alertasDe(professor).length === 0) return false;
      if (filtroAlertaAba1 === "ok" && alertasDe(professor).length > 0) return false;
      return true;
    });
  }, [professoresDaLotacao, buscaNome, tipoVinculoFiltro, filtroAlertaAba1, alertasDe]);

  /** "Selecionáveis" para fins do cabeçalho "selecionar todos": sem erro bloqueante nem aviso.
   * Quem tem erro/aviso continua podendo ser marcado manualmente, linha por linha. */
  const servidoresSelecionaveisFiltrados = listaFiltrada.filter((professor) =>
    errosDe(professor).length === 0 && avisosDe(professor).length === 0,
  );

  const listaPaginada = useMemo(
    () => listaFiltrada.slice(primeiroRegistro, primeiroRegistro + registrosPorPagina),
    [listaFiltrada, primeiroRegistro, registrosPorPagina],
  );

  useEffect(() => {
    setPrimeiroRegistro(0);
  }, [orgao, escola, buscaNome, tipoVinculoFiltro, filtroAlertaAba1]);

  const parcelasLoteVazias = (): Record<DuracaoLote, boolean> => ({ 10: false, 15: false, 20: false, 30: false });
  const estadoLinha = (id: number) =>
    selecionados[id] ?? { incluido: false, julho: false, janeiro: false, parcelasLote: parcelasLoteVazias() };

  useEffect(() => {
    if (!modoAgendamentoLote) return;
    setSelecionados((atual) => {
      const proximo = { ...atual };
      professoresDaLotacao.forEach((professor) => {
        if (proximo[professor.id]) return;
        proximo[professor.id] = {
          incluido: errosDe(professor).length === 0 && avisosDe(professor).length === 0,
          julho: false,
          janeiro: false,
          parcelasLote: parcelasLoteVazias(),
        };
      });
      return proximo;
    });
  }, [modoAgendamentoLote, professoresDaLotacao, errosDe, avisosDe]);

  const alternarLinha = (professor: ProfessorLote, campo: "incluido" | "julho" | "janeiro", valor: boolean) => {
    setSelecionados((atual) => ({
      ...atual,
      [professor.id]: { ...estadoLinha(professor.id), [campo]: valor },
    }));
  };

  const alternarParcelaLote = (professor: ProfessorLote, duracao: DuracaoLote, valor: boolean) => {
    setSelecionados((atual) => {
      const estado = estadoLinha(professor.id);
      return {
        ...atual,
        [professor.id]: { ...estado, parcelasLote: { ...estado.parcelasLote, [duracao]: valor } },
      };
    });
  };

  const somaDiasSelecionadosLote = (professor: ProfessorLote) =>
    DURACOES_LOTE.reduce((total, duracao) => total + (estadoLinha(professor.id).parcelasLote[duracao] ? duracao : 0), 0);

  /** RN (Agendamento em Lote): soma das parcelas marcadas não pode exceder o saldo do servidor. */
  const erroSaldoLote = (professor: ProfessorLote): string | null => {
    const soma = somaDiasSelecionadosLote(professor);
    if (professor.saldo - soma === 5) return 'Parcelamento deixaria saldo residual de 5 dias';
    if (soma > professor.saldo) {
      return `Parcelas somam ${soma} dias — saldo disponível é de apenas ${professor.saldo} dias`;
    }
    return null;
  };

  const selecionarTodos = (campo: "incluido" | "julho" | "janeiro", valor: boolean) => {
    setSelecionados((atual) => {
      const proximo = { ...atual };
      listaFiltrada.forEach((professor) => {
        // "Selecionar todos" marca automaticamente só quem está OK (sem erro nem aviso);
        // quem tem pendência continua selecionável manualmente, linha por linha.
        if (valor && campo === "incluido" && (errosDe(professor).length > 0 || avisosDe(professor).length > 0)) return;
        proximo[professor.id] = { ...estadoLinha(professor.id), [campo]: valor };
      });
      return proximo;
    });
  };

  /** Professores com erros bloqueantes — usados para highlight na aba 1 e bloqueio no lançamento. */
  const comErroNaLotacao = useMemo(
    () => new Set(professoresDaLotacao.filter((professor) => errosDe(professor).length > 0).map((professor) => professor.id)),
    [professoresDaLotacao, errosDe],
  );

  /** Professores com avisos (não-bloqueantes) — usados para highlight na aba 1. */
  const comAvisoNaLotacao = useMemo(
    () => new Set(professoresDaLotacao.filter((professor) => avisosDe(professor).length > 0).map((professor) => professor.id)),
    [professoresDaLotacao, avisosDe],
  );

  const professoresIncluidos = useMemo(
    () => professoresDaLotacao.filter((professor) =>
      // Lote: erro bloqueante impede a inclusão; cargo de gestão/apoio entra normalmente (RN001).
      (!modoAgendamentoLote || errosDe(professor).length === 0) &&
      (selecionados[professor.id]?.incluido ?? false),
    ),
    [professoresDaLotacao, selecionados, modoAgendamentoLote, errosDe],
  );

  /** Coletiva: dias de julho (15) e janeiro (30) já marcados para o professor. */
  const diasMarcadosColetiva = (professor: ProfessorLote) =>
    (estadoLinha(professor.id).julho ? 15 : 0) + (estadoLinha(professor.id).janeiro ? 30 : 0);

  const periodoDoProfessor = (professor: ProfessorLote) => periodoDisponivelServidor({
    matricula:professor.matricula, nome:professor.nome, orgao:professor.orgao + '/MT', setor:professor.lotacaoNome,
    cargo:professor.cargo, tipoVinculo:professor.vinculo, cargoGestao:false,
    periodoAquisitivoInicio:'2025-01-01', periodoAquisitivoFim:'2025-12-31', saldoDisponivel:professor.saldo,
  });

  /** Coletiva (RN001): base única de saldo — o do período aquisitivo mais antigo com saldo, já
   * descontados os outros lançamentos da matrícula. Usada na coluna Saldo, no checkbox e no "Lançar". */
  const saldoBaseColetiva = (professor: ProfessorLote) => periodoDoProfessor(professor)?.saldo ?? 0;

  /** Coletiva: motivo para não permitir marcar a parcela (não ultrapassa o saldo restante nem
   * deixa resíduo de 5 dias). null = pode marcar. As durações 15 e 30 sempre são permitidas
   * para o cargo/órgão da Coletiva, então só saldo e resíduo bloqueiam. */
  const motivoBloqueioParcelaColetiva = (professor: ProfessorLote, campo: "julho" | "janeiro"): string | null => {
    const dias = campo === "julho" ? 15 : 30;
    const saldoRestante = saldoBaseColetiva(professor) - diasMarcadosColetiva(professor);
    if (dias > saldoRestante) return `Ultrapassaria o saldo restante de ${saldoRestante} dias`;
    if (saldoRestante - dias === 5) return "Deixaria saldo residual de 5 dias";
    return null;
  };

  /** Coletiva: elegíveis do cabeçalho = servidores da lista filtrada que já têm a parcela ou
   * podem recebê-la (quem está bloqueado fica de fora). */
  const elegiveisParcelaColetiva = (campo: "julho" | "janeiro") =>
    listaFiltradaAba2.filter((professor) => estadoLinha(professor.id)[campo] || motivoBloqueioParcelaColetiva(professor, campo) === null);

  /** Coletiva: o cabeçalho age sobre a lista filtrada; marcado = todos os elegíveis marcados. */
  const cabecalhoParcelaColetivaMarcado = (campo: "julho" | "janeiro") => {
    const elegiveis = elegiveisParcelaColetiva(campo);
    return elegiveis.length > 0 && elegiveis.every((professor) => estadoLinha(professor.id)[campo]);
  };

  /** Coletiva: marca/desmarca a parcela para os servidores filtrados, pulando quem ficaria bloqueado. */
  const selecionarTodosParcelaColetiva = (campo: "julho" | "janeiro", valor: boolean) => {
    setSelecionados((atual) => {
      const proximo = { ...atual };
      listaFiltradaAba2.forEach((professor) => {
        const estado = estadoLinha(professor.id);
        if (valor && !estado[campo] && motivoBloqueioParcelaColetiva(professor, campo) !== null) return;
        proximo[professor.id] = { ...estado, [campo]: valor };
      });
      return proximo;
    });
  };

  const selecionarTodosParcelaLote = (duracao: DuracaoLote, valor: boolean) => {
    setSelecionados((atual) => {
      const proximo = { ...atual };
      professoresIncluidos.forEach((professor) => {
        const estado = estadoLinha(professor.id);
        // Mesma regra do bloqueio linha a linha: não marca se ultrapassaria o saldo restante ou
        // deixaria resíduo de 5 dias (duracoesPermitidas sobre o saldo que sobra).
        if (
          valor &&
          !estado.parcelasLote[duracao] &&
          !duracoesPermitidas(professor.saldo - somaDiasSelecionadosLote(professor), professor.orgao, professor.cargo).includes(duracao)
        ) return;
        proximo[professor.id] = { ...estado, parcelasLote: { ...estado.parcelasLote, [duracao]: valor } };
      });
      return proximo;
    });
  };

  const listaFiltradaAba2 = useMemo(() => {
    const termo = buscaAba2.trim().toLocaleLowerCase("pt-BR");
    return professoresIncluidos.filter((professor) => {
      if (soComAlerta && alertasDe(professor).length === 0) return false;
      if (termo && !professor.nome.toLocaleLowerCase("pt-BR").includes(termo) && !professor.matricula.includes(termo)) return false;
      return true;
    });
  }, [professoresIncluidos, buscaAba2, soComAlerta, alertasDe]);

  const listaPaginadaAba2 = useMemo(
    () => listaFiltradaAba2.slice(primeiroAba2, primeiroAba2 + porPaginaAba2),
    [listaFiltradaAba2, primeiroAba2, porPaginaAba2],
  );

  useEffect(() => { setPrimeiroAba2(0); }, [buscaAba2, soComAlerta, orgao, escola, buscaNome, tipoVinculoFiltro]);

  const [documentoLote, setDocumentoLote] = useState<DocumentoFerias | null>(null);
  const lancarLote = () => {
    const erros: string[] = [];
    const incluidos = professoresIncluidos;
    if (!documentoLote) erros.push('Anexe a Portaria da Escala de Férias.');
    incluidos.forEach(professor => {
      const dias = modoAgendamentoLote ? somaDiasSelecionadosLote(professor) : (estadoLinha(professor.id).julho ? 15 : 0) + (estadoLinha(professor.id).janeiro ? 30 : 0);
      const saldoBase = periodoDoProfessor(professor)?.saldo ?? 0;
      // Sem parcela marcada não há parcelamento a conferir — o caso já é coberto por
      // "Marque uma parcela…" (evita falso positivo de "sobra de 5 dias" com saldo 5).
      if (dias > 0 && (saldoBase - dias === 5 || dias > saldoBase)) erros.push(professor.nome + ': parcelamento excede o saldo ou deixa sobra de 5 dias.');
      if (modoAgendamentoLote && /professor|docente/i.test(professor.cargo) && orgao === 'SEDUC' && [10,20].some(d => estadoLinha(professor.id).parcelasLote[d as DuracaoLote])) erros.push(professor.nome + ': professor SEDUC permite somente 15 ou 30 dias.');
    });

    if (!incluidos.length) {
      erros.push("Selecione pelo menos um servidor na aba 1 antes de prosseguir.");
    }

    const comErro = incluidos.filter((professor) => errosDe(professor).length > 0);
    if (comErro.length) {
      erros.push(
        `Servidor(es) com erro bloqueante — remova-os antes de prosseguir: ${comErro.map((professor) => professor.nome).join(", ")}.`,
      );
    }
    const marcadosJulho = incluidos.filter((professor) => estadoLinha(professor.id).julho);
    const marcadosJaneiro = incluidos.filter((professor) => estadoLinha(professor.id).janeiro);

    if (modoAgendamentoLote) {
      const semParcelaLote = incluidos.filter((professor) => somaDiasSelecionadosLote(professor) === 0);
      if (semParcelaLote.length) {
        erros.push(`Marque ao menos uma parcela para cada servidor incluído: ${semParcelaLote.map((professor) => professor.nome).join(", ")}.`);
      }
      const comSaldoExcedido = incluidos.filter((professor) => erroSaldoLote(professor) !== null);
      if (comSaldoExcedido.length) {
        erros.push(
          `Servidor(es) com parcelas acima do saldo disponível: ${comSaldoExcedido.map((professor) => professor.nome).join(", ")}.`,
        );
      }
      DURACOES_LOTE.forEach((duracao) => {
        const usaDuracao = incluidos.some((professor) => estadoLinha(professor.id).parcelasLote[duracao]);
        if (usaDuracao && !iniciosParcelasLote[duracao]) {
          erros.push(`Informe a data de início da parcela de ${duracao} dias.`);
        }
      });
      // Parcelas do mesmo servidor não podem se sobrepor (as 4 durações vêm com a mesma data
      // padrão). O intervalo de 0 ou 10 dias da Individual NÃO é exigido na escala em lote —
      // pendente de decisão (barraria escalas válidas, ex.: 10 dias em julho e 20 em janeiro).
      incluidos.forEach((professor) => {
        const parcelasServidor = DURACOES_LOTE
          .filter((duracao) => estadoLinha(professor.id).parcelasLote[duracao] && iniciosParcelasLote[duracao])
          .map((duracao) => ({ inicio: iniciosParcelasLote[duracao], fim: fimParcelasLote[duracao] }))
          .sort((a, b) => a.inicio.localeCompare(b.inicio));
        const sobreposta = parcelasServidor.find((parcela, i) => i > 0 && parcela.inicio <= parcelasServidor[i - 1].fim);
        if (sobreposta) {
          erros.push(`${professor.nome}: parcelas sobrepostas (${formatarDataBr(sobreposta.inicio)} começa antes do fim da parcela anterior) — ajuste as datas de início.`);
        }
      });
    } else {
      const semParcela = incluidos.filter((professor) => !estadoLinha(professor.id).julho && !estadoLinha(professor.id).janeiro);
      if (semParcela.length) {
        erros.push(`Marque uma parcela para cada servidor incluído: ${semParcela.map((professor) => professor.nome).join(", ")}.`);
      }
      if (marcadosJulho.length && !inicioJulho) erros.push("Informe a data de início da parcela de julho.");
      if (marcadosJaneiro.length && !inicioJaneiro) erros.push("Informe a data de início da parcela de janeiro.");
      // (A mensagem "Marque ao menos uma parcela…" já cobre o caso de nenhuma parcela marcada.)
    }

    // Concomitância com agendamento ativo já gravado para o servidor (Coletiva e Lote).
    incluidos.forEach((professor) => {
      const periodos = modoAgendamentoLote
        ? DURACOES_LOTE
            .filter((duracao) => estadoLinha(professor.id).parcelasLote[duracao] && iniciosParcelasLote[duracao])
            .map((duracao) => ({ inicio: iniciosParcelasLote[duracao], fim: fimParcelasLote[duracao] }))
        : [
            ...(estadoLinha(professor.id).julho && inicioJulho ? [{ inicio: inicioJulho, fim: fimJulho }] : []),
            ...(estadoLinha(professor.id).janeiro && inicioJaneiro ? [{ inicio: inicioJaneiro, fim: fimJaneiro }] : []),
          ];
      const conflito = periodos
        .map((periodo) => conflitoFeriasServidor(professor.matricula, periodo.inicio, periodo.fim))
        .find(Boolean);
      if (conflito) erros.push(`${professor.nome}: ${mensagemConflitoAgendamento(conflito)}`);
    });

    // RN017: cada parcela usada no lote precisa ser registrada até o dia 05 do mês anterior ao
    // início dela (a mensagem sai uma vez por parcela, não por servidor).
    const hojeLote = dataLocalISO();
    const parcelasUsadas: Array<{ rotulo: string; inicio: string }> = modoAgendamentoLote
      ? DURACOES_LOTE
          .filter((duracao) => incluidos.some((professor) => estadoLinha(professor.id).parcelasLote[duracao]) && iniciosParcelasLote[duracao])
          .map((duracao) => ({ rotulo: `de ${duracao} dias`, inicio: iniciosParcelasLote[duracao] }))
      : [
          ...(marcadosJulho.length && inicioJulho ? [{ rotulo: "de julho", inicio: inicioJulho }] : []),
          ...(marcadosJaneiro.length && inicioJaneiro ? [{ rotulo: "de janeiro", inicio: inicioJaneiro }] : []),
        ];
    parcelasUsadas.forEach(({ rotulo, inicio }) => {
      const prazo = validarPrazoRegistroFerias(hojeLote, inicio);
      if (!prazo.sucesso) erros.push(`Parcela ${rotulo}: ${prazo.mensagem}`);
    });

    if (erros.length) {
      setErro(erros);
      return;
    }

    setErro([]);

    const loteId = `LOTE-${orgao}-${gerarId()}`;
    // O saldo do período já foi conferido acima ("parcelamento excede o saldo..."): todo incluído
    // com parcela chega aqui com período válido e saldo suficiente.
    const periodosSelecionados = incluidos.map(periodoDoProfessor);
    const novosRegistros: FeriasRegistro[] = incluidos.map((professor, indiceProfessor) => {
      const periodo = periodosSelecionados[indiceProfessor]!;
      const parcelas: ParcelaFerias[] = [];
      if (modoAgendamentoLote) {
        DURACOES_LOTE.forEach((duracao, indice) => {
          if (estadoLinha(professor.id).parcelasLote[duracao]) {
            parcelas.push({ id: indice + 1, inicio: iniciosParcelasLote[duracao], fim: fimParcelasLote[duracao], dias: duracao });
          }
        });
      } else {
        if (estadoLinha(professor.id).julho) {
          parcelas.push({ id: 1, inicio: inicioJulho, fim: fimJulho, dias: 15 });
        }
        if (estadoLinha(professor.id).janeiro) {
          parcelas.push({ id: 2, inicio: inicioJaneiro, fim: fimJaneiro, dias: 30 });
        }
      }
      return {
        id: gerarId() + professor.id,
        servidorNome: professor.nome,
        matricula: professor.matricula,
        cpf: "",
        orgao: orgao === "SEDUC" ? "SEDUC/MT" : orgao === "UNEMAT" ? "UNEMAT/MT" : "SECITEC/MT",
        orgaoColetivo: orgao,
        dre: orgao === 'SEDUC' ? 'DRE de demonstração' : undefined,
        unidade: professor.lotacaoNome,
        setor: professor.lotacaoNome,
        cargo: professor.cargo ?? "Professor",
        cargoGestao: false,
        tipoVinculo: professor.vinculo,
        saldoFerias: professor.saldo,
        saldoFeriasConfirmado: !usaRegraAquisitivoUnemat,
        regraAquisitivo: usaRegraAquisitivoUnemat ? "USUFRUTO_ANTECIPADO" : "PADRAO",
        tipo: modoAgendamentoLote ? "Lote" : "Coletiva",
        origem: "SIGEP",
        periodoAquisitivoInicio: periodo.inicio,
        periodoAquisitivoFim: periodo.fim,
        documentos: documentoLote ? [documentoLote] : [],
        // RN017: chefia aprova até o dia 09 do mês anterior ao início do usufruto do servidor.
        dataLimiteValidacaoChefia: calcularPrazoValidacaoChefia(inicioMaisAntigoParcelas(parcelas)),
        parcelas,
        // Todo lançamento de férias precisa passar por aprovação da chefia antes de ficar
        // Agendada — inclusive Coletiva direta e o lote da Gestão de Pessoas da UNEMAT, que
        // antes pulavam a validação.
        situacao: "AGUARDANDO VALIDAÇÃO",
        substitutos: [],
        loteId,
        responsavelLancamento: "Usuário atual",
        lancadoEm: new Date().toLocaleString("pt-BR"),
        historico: [{ situacao: "AGUARDANDO VALIDAÇÃO" as const, acao: "lancamento", data: new Date().toLocaleString("pt-BR"), responsavel: "Gestor", responsavelMatricula: USUARIO_ATOR_MOCK.Gestor.matricula, responsavelVinculo: USUARIO_ATOR_MOCK.Gestor.vinculo, documentos: documentoLote ? [documentoLote] : undefined }],
      };
    });

    // A confirmação (CA05) é o toast exibido pela página após a navegação — o formulário sai da
    // tela logo em seguida, então não mantém banner próprio de confirmação.
    onSalvar(novosRegistros);
  };

  return (
    <div>
      {erro.length ? (
        <div className="prototype-ferias-erro-bloqueio">
          {erro.map((mensagem) => (
            <div key={mensagem}>{mensagem}</div>
          ))}
        </div>
      ) : null}

      {!modoAgendamentoLote ? (
        <section className="prototype-ferias-form-section prototype-ferias-lote-perfil">
          <label>
            <span>Perfil de demonstração *</span>
            <select value={perfilColetiva} onChange={(event) => setPerfilColetiva(event.target.value as PerfilLote)}>
              <option value="SECRETARIO_SEDUC">Secretário escolar — SEDUC</option>
              <option value="GESTAO_UNEMAT">Gestão de Pessoas — UNEMAT</option>
              <option value="GESTAO_SECITEC">Gestão de Pessoas — SECITEC</option>
            </select>
          </label>
          <small>O Órgão da escala é definido automaticamente conforme este perfil de lotação.</small>
        </section>
      ) : null}

      {modoAgendamentoLote ? (
        <section className="prototype-ferias-form-section prototype-ferias-lote-perfil">
          <label>
            <span>Perfil de demonstração *</span>
            <select value={perfilLote} onChange={(event) => setPerfilLote(event.target.value as PerfilLote)}>
              <option value="SECRETARIO_SEDUC">Secretário escolar — SEDUC</option>
              <option value="GESTAO_UNEMAT">Gestão de Pessoas — UNEMAT</option>
              <option value="GESTAO_SECITEC">Gestão de Pessoas — SECITEC</option>
            </select>
          </label>
          <small>
            {perfilLote === "SECRETARIO_SEDUC"
              ? "O Secretário escolar da SEDUC lança o lote para uma escola ou para todas; a validação acontece na aba Aprovações, pelo perfil Aprovador."
              : perfilLote === "GESTAO_UNEMAT"
                  ? "A Gestão de Pessoas da UNEMAT visualiza todas as unidades e lança o lote; a validação acontece na aba Aprovações, pelo perfil Aprovador."
                  : "A Gestão de Pessoas da SECITEC visualiza todas as escolas técnicas e lança o lote; a validação acontece na aba Aprovações, pelo perfil Aprovador."}
          </small>
        </section>
      ) : null}

      <>
      <nav className="prototype-ferias-coletiva-stepper-card" aria-label={modoAgendamentoLote ? "Etapas do agendamento em lote" : "Etapas das férias coletivas"}>
        <ol className="prototype-ferias-coletiva-stepper" role="tablist">
          {[
            { numero: 1, titulo: "Órgão & Servidores", painel: "ferias-coletivas-etapa-1" },
            { numero: 2, titulo: "Parcelas & Alertas", painel: "ferias-coletivas-etapa-2" },
          ].map((etapa) => (
            <li
              key={etapa.numero}
              className={abaColetiva === etapa.numero ? "is-active" : abaColetiva > etapa.numero ? "is-complete" : ""}
              aria-current={abaColetiva === etapa.numero ? "step" : undefined}
            >
              <button
                type="button"
                role="tab"
                aria-selected={abaColetiva === etapa.numero}
                aria-controls={etapa.painel}
                // Mesma regra do botão "Avançar": a etapa 2 só abre com ao menos 1 servidor incluído.
                disabled={etapa.numero === 2 && !professoresIncluidos.length}
                title={etapa.numero === 2 && !professoresIncluidos.length ? "Inclua ao menos 1 servidor para avançar." : undefined}
                onClick={() => setAbaColetiva(etapa.numero as 1 | 2)}
              >
                <span className="prototype-ferias-coletiva-step-numero">{etapa.numero}</span>
                <span className="prototype-ferias-coletiva-step-titulo">{etapa.titulo}</span>
                {abaColetiva === etapa.numero && <small>Etapa atual</small>}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {abaColetiva === 1 ? (
      <div id="ferias-coletivas-etapa-1" role="tabpanel" className="prototype-ferias-coletiva-etapa-conteudo">
        <section className="prototype-ferias-form-section prototype-ferias-coletiva-painel">
          <h3 className="prototype-ferias-secao-titulo">
            <i className="pi pi-users" aria-hidden="true" />
            Órgão &amp; Servidores
          </h3>
          <div className="prototype-ferias-coletiva-painel-conteudo">
        <div className="prototype-ferias-lote-filtros prototype-ferias-coletiva-filtros">
          <DropdownFieldSeplag
            name="orgao"
            control={coletivaControl}
            label="Órgão"
            cols="12"
            options={[
              { label: "SEDUC", value: "SEDUC" },
              { label: "UNEMAT", value: "UNEMAT" },
              { label: "SECITEC", value: "SECITEC" },
            ]}
            optionLabel="label"
            optionValue="value"
            showClear={false}
            getFormErrorMessage={() => null}
            disabled
            onChange={(proximoOrgao: "SEDUC" | "UNEMAT" | "SECITEC") => {
              const primeiraLotacao = professoresLote.find((professor) => professor.orgao === proximoOrgao)?.lotacaoNome ?? "";
              setColetivaValue("escola", primeiraLotacao);
              setBuscaNome("");
              setTextoBusca("");
            }}
          />
          <DropdownFieldSeplag
            name="escola"
            control={coletivaControl}
            label="Escola/Lotação"
            cols="12"
            options={[
              // "Todos" permite avaliar/lançar para múltiplas unidades de uma vez — disponível
              // para qualquer perfil, inclusive Secretário Escolar — SEDUC, que também pode
              // escolher uma escola específica em vez de ficar travado em uma só.
              { label: "Todos (todas as unidades)", value: ESCOPO_TODAS_LOTACOES },
              ...lotacoesDisponiveis.map((lotacao) => ({ label: lotacao, value: lotacao })),
            ]}
            optionLabel="label"
            optionValue="value"
            showClear={false}
            getFormErrorMessage={() => null}
            onChange={() => {
              setBuscaNome("");
              setTextoBusca("");
            }}
          />
          <DropdownFieldSeplag
            name="periodoAquisitivo"
            control={coletivaControl}
            label="Ano da escala (período aquisitivo automático por servidor)"
            cols="12"
            options={anosDisponiveis.map((ano) => ({ label: ano, value: ano }))}
            optionLabel="label"
            optionValue="value"
            showClear={false}
            getFormErrorMessage={() => null}
            onChange={(ano: string) => {
              const anoSelecionado = Number(ano);
              setInicioJulho(`${anoSelecionado}-07-06`);
              setInicioJaneiro(`${anoSelecionado + 1}-01-04`);
            }}
          />
          <DropdownFieldSeplag
            name="tipoVinculoFiltro"
            control={coletivaControl}
            label="Tipo de Vínculo"
            cols="12"
            options={[
              ...(!modoAgendamentoLote ? [{ label: "Todos", value: "Todos" as const }] : []),
              { label: "Efetivo", value: "Efetivo" },
              { label: "Contrato Temporário", value: "Contrato Temporário" },
            ]}
            optionLabel="label"
            optionValue="value"
            showClear={false}
            getFormErrorMessage={() => null}
          />
        </div>
        {usaRegraAquisitivoUnemat ? (
          <div className="prototype-ferias-banner prototype-ferias-regra-unemat" role="note">
            <i className="pi pi-info-circle" aria-hidden="true" />
            <span>
              <strong>Regra UNEMAT:</strong> o usufruto pode ocorrer antes do fechamento do período aquisitivo.
              A inclusão não é bloqueada por saldo ainda não confirmado; saldo e pagamento devem ser conciliados
              após o fechamento. O cálculo proporcional da Folha não é feito nesta tela.
            </span>
          </div>
        ) : null}
          </div>
        </section>

        <section className="prototype-ferias-coletiva-docentes" aria-labelledby="ferias-coletiva-docentes-titulo">
        <h4 id="ferias-coletiva-docentes-titulo" className="prototype-ferias-coletiva-docentes-titulo">
          <i className="pi pi-users" aria-hidden="true" />
          {modoAgendamentoLote ? "Servidores do lote (gestão/apoio)" : "Corpo docente da coletiva"}
        </h4>
        <div className="prototype-ferias-coletiva-lista-cabecalho">
          <label className="prototype-ferias-busca-servidor-label">
            <span>Buscar Servidor (Matrícula, CPF ou Nome)</span>
            <div className="prototype-ferias-busca-servidor-row">
              <input
                aria-label="Buscar servidor por matrícula, CPF ou nome"
                value={textoBusca}
                onChange={(event) => setTextoBusca(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setBuscaNome(textoBusca);
                    setPrimeiroRegistro(0);
                  }
                }}
                placeholder="Matrícula, CPF ou nome do servidor"
              />
              <BotaoBuscarServidor
                onClick={() => {
                  setBuscaNome(textoBusca);
                  setPrimeiroRegistro(0);
                }}
              />
            </div>
          </label>
          <div className="prototype-ferias-coletiva-situacao-validacao">
            <RotuloSeplag nome="Situação de validação" cols="12">
              <Dropdown
                value={filtroAlertaAba1}
                onChange={(event) => setFiltroAlertaAba1(event.value)}
                options={[
                  { label: "Todos", value: "todos" },
                  { label: "Só com alerta", value: "alerta" },
                  { label: "Só OK (sem pendência)", value: "ok" },
                ]}
                optionLabel="label"
                optionValue="value"
                showClear={false}
                filter={false}
                className="w-full"
                style={{ width: "100%", height: "46px" }}
              />
            </RotuloSeplag>
          </div>
        </div>
        <div className="prototype-ferias-lote-table-wrap">
          <table className={`prototype-ferias-table prototype-ferias-coletiva-table${modoAgendamentoLote ? " prototype-ferias-coletiva-table--lote" : ""}`}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="Incluir todos os servidores filtrados"
                    checked={servidoresSelecionaveisFiltrados.length > 0 &&
                      servidoresSelecionaveisFiltrados.every((professor) => estadoLinha(professor.id).incluido)}
                    onChange={(event) => selecionarTodos("incluido", event.target.checked)}
                  />
                </th>
                <th>Servidor</th>
                <th>Vínculo</th>
                <th>Cargo / Função</th>
                <th>Lotação</th>
                <th>Situação</th>
                <th>Saldo</th>
                <th>Situação de validação</th>
              </tr>
            </thead>
            <tbody>
              {listaPaginada.map((professor) => {
                const estado = estadoLinha(professor.id);
                const temErro = comErroNaLotacao.has(professor.id);
                const temAviso = comAvisoNaLotacao.has(professor.id);
                const erros = errosDe(professor);
                const avisos = avisosDe(professor);
                // RN001 (Lote): cargo de gestão/apoio é o próprio público-alvo — não fica
                // desabilitado; só erro bloqueante destaca a linha.
                const trClasse = temErro ? "prototype-ferias-linha-com-erro" : "";
                return (
                  <tr key={professor.id} className={trClasse}>
                    <td>
                      <input
                        type="checkbox"
                        // Erro bloqueante desabilita a inclusão na Coletiva e no Lote: marcar não
                        // teria efeito, pois o "Lançar" barra servidor com erro. Aviso continua selecionável.
                        disabled={erros.length > 0}
                        checked={estado.incluido}
                        title={temErro ? erros.join("; ") : undefined}
                        onChange={(event) => alternarLinha(professor, "incluido", event.target.checked)}
                      />
                    </td>
                    <td>
                      <div className="prototype-ferias-servidor-identificacao">
                        <strong>{professor.nome}</strong>
                        <span>Matrícula {professor.matricula}</span>
                      </div>
                    </td>
                    <td>
                      {professor.vinculo}
                    </td>
                    <td>{professor.cargo}</td>
                    <td>{professor.lotacaoNome}</td>
                    <td>
                      {professor.situacaoLotacao}
                    </td>
                    <td>
                      <span className={temErro ? "prototype-ferias-saldo-inconsistente" : temAviso ? "prototype-ferias-saldo-aviso" : ""}>
                        {usaRegraAquisitivoUnemat && professor.saldoConfirmado === false
                          ? `${professor.saldo} dias · a confirmar`
                          : `${professor.saldo} dias`}
                      </span>
                    </td>
                    <td>
                      {erros.map((mensagem) => (
                        <span key={mensagem} className="prototype-ferias-lote-tag prototype-ferias-lote-tag--erro">
                          <i className="pi pi-times-circle" aria-hidden="true" />{mensagem}
                        </span>
                      ))}
                      {avisos.map((mensagem) => (
                        <span key={mensagem} className="prototype-ferias-lote-tag prototype-ferias-lote-tag--aviso">
                          <i className="pi pi-exclamation-triangle" aria-hidden="true" />{mensagem}
                        </span>
                      ))}
                      {!erros.length && !avisos.length ? (
                        <span className="prototype-ferias-lote-tag prototype-ferias-lote-tag--ok">
                          <i className="pi pi-check" aria-hidden="true" />Ok
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {!listaPaginada.length ? (
                <tr>
                  <td colSpan={8} className="prototype-ferias-empty">Nenhum servidor encontrado para os filtros informados.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Paginator
          className="prototype-efetivo-exercicio-pagination prototype-ferias-coletiva-pagination"
          first={primeiroRegistro}
          rows={registrosPorPagina}
          totalRecords={listaFiltrada.length}
          rowsPerPageOptions={[10, 20, 50]}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          onPageChange={(event) => {
            setPrimeiroRegistro(event.rows !== registrosPorPagina ? 0 : event.first);
            setRegistrosPorPagina(event.rows);
          }}
        />
        </section>
      </div>
      ) : null}

      {abaColetiva === 2 ? (
      <div id="ferias-coletivas-etapa-2" role="tabpanel" className="prototype-ferias-coletiva-etapa-conteudo">
        <section className="prototype-ferias-form-section prototype-ferias-coletiva-painel">
          <h3 className="prototype-ferias-secao-titulo">
            <i className="pi pi-calendar" aria-hidden="true" />
            2. Parcelas &amp; Alertas
          </h3>
          <div className="prototype-ferias-coletiva-painel-conteudo is-parcelas">

        {usaRegraAquisitivoUnemat ? (
          <div className="prototype-ferias-banner prototype-ferias-regra-unemat" role="note">
            <i className="pi pi-info-circle" aria-hidden="true" />
            <span>
              UNEMAT: usufruto antecipado ao fechamento do aquisitivo. O saldo será conciliado após o fechamento;
              o cálculo proporcional e o pagamento dependem de validação da Folha.
            </span>
          </div>
        ) : null}

        {/* Configuração das datas das parcelas */}
        <div className="prototype-ferias-coletiva-datas-config">
          {modoAgendamentoLote ? (
            <div className="prototype-ferias-coletiva-parcelas-colunas prototype-ferias-coletiva-parcelas-colunas--lote">
              {DURACOES_LOTE.map((duracao) => (
                <div className="prototype-ferias-coletiva-data-grupo" key={duracao}>
                  <div className="prototype-ferias-coletiva-data-titulo">
                    PARCELA — {duracao} DIAS
                  </div>
                  <div className="prototype-ferias-coletiva-data-linha">
                    <label>
                      <span>Início</span>
                      <input
                        type="date"
                        value={iniciosParcelasLote[duracao]}
                        onChange={(event) =>
                          setIniciosParcelasLote((atual) => ({ ...atual, [duracao]: event.target.value }))
                        }
                      />
                    </label>
                    <span className="prototype-ferias-coletiva-seta" aria-hidden="true">→</span>
                    <label>
                      <span>Fim (calc.)</span>
                      <input className="prototype-ferias-readonly-field" value={formatarDataBr(fimParcelasLote[duracao])} readOnly />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="prototype-ferias-coletiva-parcelas-colunas">
              <div className="prototype-ferias-coletiva-data-grupo">
                <div className="prototype-ferias-coletiva-data-titulo">
                  PARCELA DE JULHO — 15 DIAS
                </div>
                <div className="prototype-ferias-coletiva-data-linha">
                  <label>
                    <span>Início</span>
                    <input type="date" value={inicioJulho} onChange={(event) => setInicioJulho(event.target.value)} />
                  </label>
                  <span className="prototype-ferias-coletiva-seta" aria-hidden="true">→</span>
                  <label>
                    <span>Fim (calculado)</span>
                    <input className="prototype-ferias-readonly-field" value={formatarDataBr(fimJulho)} readOnly />
                  </label>
                </div>
              </div>
              <div className="prototype-ferias-coletiva-data-grupo">
                <div className="prototype-ferias-coletiva-data-titulo">
                  PARCELA DE JANEIRO — 30 DIAS
                </div>
                <div className="prototype-ferias-coletiva-data-linha">
                  <label>
                    <span>Início</span>
                    <input type="date" value={inicioJaneiro} onChange={(event) => setInicioJaneiro(event.target.value)} />
                  </label>
                  <span className="prototype-ferias-coletiva-seta" aria-hidden="true">→</span>
                  <label>
                    <span>Fim (calculado)</span>
                    <input className="prototype-ferias-readonly-field" value={formatarDataBr(fimJaneiro)} readOnly />
                  </label>
                </div>
              </div>
            </div>
          )}
          <div className="prototype-ferias-coletiva-resumo-lateral">
            <strong>{professoresIncluidos.length}</strong>
            <span>servidor(es) incluído(s)</span>
            <ul>
              {modoAgendamentoLote ? (
                DURACOES_LOTE.map((duracao) => (
                  <li key={duracao}>
                    {professoresIncluidos.filter((professor) => estadoLinha(professor.id).parcelasLote[duracao]).length} com {duracao} dias
                  </li>
                ))
              ) : (
                <>
                  <li>{professoresIncluidos.filter((professor) => estadoLinha(professor.id).julho).length} com julho</li>
                  <li>{professoresIncluidos.filter((professor) => estadoLinha(professor.id).janeiro).length} com janeiro</li>
                </>
              )}
            </ul>
          </div>
        </div>
          </div>
        </section>

        <section className="prototype-ferias-coletiva-docentes" aria-labelledby="ferias-coletiva-incluidos-titulo">
          <h4 id="ferias-coletiva-incluidos-titulo" className="prototype-ferias-coletiva-docentes-titulo">
            <i className="pi pi-users" aria-hidden="true" />
            Servidores incluídos no lote
          </h4>

          {/* Barra de filtros */}
          <div className="prototype-ferias-coletiva-aba2-barra">
          <div className="prototype-ferias-coletiva-aba2-filtros">
            <div className="prototype-ferias-busca-servidor-row prototype-ferias-coletiva-filtro-busca">
              <input
                aria-label="Filtrar por matrícula ou nome"
                value={buscaAba2}
                placeholder="Filtrar por matrícula ou nome"
                onChange={(event) => setBuscaAba2(event.target.value)}
              />
            </div>
            <label className="prototype-ferias-coletiva-alerta-check">
              <input type="checkbox" checked={soComAlerta} onChange={(event) => setSoComAlerta(event.target.checked)} />
              Só com alerta
            </label>
          </div>
          </div>

        {/* A etapa 2 só é alcançável com ao menos 1 servidor incluído (Premissa 1). */}
          <>
            <div className="prototype-ferias-lote-table-wrap">
              <table className={`prototype-ferias-table prototype-ferias-parcelas-table${modoAgendamentoLote ? " prototype-ferias-parcelas-table--lote" : ""}`}>
                <thead>
                  <tr>
                    <th>Servidor</th>
                    <th>Saldo</th>
                    {modoAgendamentoLote ? (
                      DURACOES_LOTE.map((duracao) => (
                        <th key={duracao}>
                          <div className="prototype-ferias-parcelas-th">
                            <label>
                              <input
                                type="checkbox"
                                checked={professoresIncluidos.length > 0 && professoresIncluidos.every((professor) => estadoLinha(professor.id).parcelasLote[duracao])}
                                onChange={(event) => selecionarTodosParcelaLote(duracao, event.target.checked)}
                              />
                              {" "}{duracao} dias
                            </label>
                            <small>{formatarDataBr(iniciosParcelasLote[duracao])} a {formatarDataBr(fimParcelasLote[duracao])}</small>
                          </div>
                        </th>
                      ))
                    ) : (
                      <>
                        <th>
                          <div className="prototype-ferias-parcelas-th">
                            <label>
                              <input
                                type="checkbox"
                                checked={cabecalhoParcelaColetivaMarcado("julho")}
                                onChange={(event) => selecionarTodosParcelaColetiva("julho", event.target.checked)}
                              />
                              {" "}Julho (15 dias)
                            </label>
                            <small>{formatarDataBr(inicioJulho)} a {formatarDataBr(fimJulho)}</small>
                          </div>
                        </th>
                        <th>
                          <div className="prototype-ferias-parcelas-th">
                            <label>
                              <input
                                type="checkbox"
                                checked={cabecalhoParcelaColetivaMarcado("janeiro")}
                                onChange={(event) => selecionarTodosParcelaColetiva("janeiro", event.target.checked)}
                              />
                              {" "}Janeiro (30 dias)
                            </label>
                            <small>{formatarDataBr(inicioJaneiro)} a {formatarDataBr(fimJaneiro)}</small>
                          </div>
                        </th>
                      </>
                    )}
                    <th>Alertas</th>
                  </tr>
                </thead>
                <tbody>
                  {listaPaginadaAba2.map((professor) => {
                    const estado = estadoLinha(professor.id);
                    const erros = errosDe(professor);
                    const avisos = avisosDe(professor);
                    const erroSaldo = modoAgendamentoLote ? erroSaldoLote(professor) : null;
                    return (
                      <tr key={professor.id}>
                        <td>
                          <div className="prototype-ferias-servidor-identificacao">
                            <strong>{professor.nome}</strong>
                            <span>{professor.matricula}</span>
                          </div>
                        </td>
                        <td>
                          <span className={erroSaldo || erros.length ? "prototype-ferias-saldo-inconsistente" : avisos.length ? "prototype-ferias-saldo-aviso" : ""}>
                            {modoAgendamentoLote ? professor.saldo : saldoBaseColetiva(professor)} dias
                          </span>
                        </td>
                        {modoAgendamentoLote ? (
                          DURACOES_LOTE.map((duracao) => {
                            const jaMarcada = estado.parcelasLote[duracao];
                            // Bloqueia marcar uma parcela nova cuja soma ultrapasse o saldo do
                            // servidor — desmarcar sempre é permitido.
                            const saldoRestante = professor.saldo - somaDiasSelecionadosLote(professor);
                            const excederiaSaldo = !jaMarcada && (!duracoesPermitidas(saldoRestante, professor.orgao, professor.cargo).includes(duracao));
                            // Motivo exibido na dica: passar do saldo restante ou deixar resíduo de 5 dias.
                            const motivoBloqueio = duracao > saldoRestante
                              ? `Ultrapassaria o saldo restante de ${saldoRestante} dias`
                              : saldoRestante - duracao === 5
                                ? "Deixaria saldo residual de 5 dias"
                                : "Duração não permitida para este cargo/órgão";
                            return (
                              <td key={duracao} style={{ textAlign: "center" }}>
                                <input
                                  type="checkbox"
                                  checked={jaMarcada}
                                  disabled={excederiaSaldo}
                                  title={excederiaSaldo ? motivoBloqueio : undefined}
                                  onChange={(event) => alternarParcelaLote(professor, duracao, event.target.checked)}
                                />
                              </td>
                            );
                          })
                        ) : (
                          <>
                            {(["julho", "janeiro"] as const).map((campo) => {
                              const marcada = estado[campo];
                              const bloqueio = marcada ? null : motivoBloqueioParcelaColetiva(professor, campo);
                              return (
                                <td key={campo} style={{ textAlign: "center" }}>
                                  <input
                                    type="checkbox"
                                    checked={marcada}
                                    disabled={bloqueio !== null}
                                    title={bloqueio ?? undefined}
                                    onChange={(event) => alternarLinha(professor, campo, event.target.checked)}
                                  />
                                </td>
                              );
                            })}
                          </>
                        )}
                        <td>
                          {erroSaldo ? (
                            <span className="prototype-ferias-lote-tag prototype-ferias-lote-tag--erro">
                              <i className="pi pi-times-circle" aria-hidden="true" /> {erroSaldo}
                            </span>
                          ) : null}
                          {erros.map((mensagem) => (
                            <span key={mensagem} className="prototype-ferias-lote-tag prototype-ferias-lote-tag--erro">
                              <i className="pi pi-times-circle" aria-hidden="true" /> {mensagem}
                            </span>
                          ))}
                          {avisos.map((mensagem) => (
                            <span key={mensagem} className="prototype-ferias-lote-tag prototype-ferias-lote-tag--aviso">
                              <i className="pi pi-exclamation-triangle" aria-hidden="true" /> {mensagem}
                            </span>
                          ))}
                          {!erroSaldo && !erros.length && !avisos.length ? <span className="prototype-ferias-lote-tag prototype-ferias-lote-tag--ok"><i className="pi pi-check" aria-hidden="true" /> Ok</span> : null}
                        </td>
                      </tr>
                    );
                  })}
                  {!listaPaginadaAba2.length ? (
                    <tr>
                      <td colSpan={modoAgendamentoLote ? 7 : 5} className="prototype-ferias-empty">{modoAgendamentoLote ? "Nenhum servidor encontrado para o filtro informado." : "Nenhum professor encontrado para o filtro informado."}</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <Paginator
              className="prototype-efetivo-exercicio-pagination prototype-ferias-coletiva-pagination"
              first={primeiroAba2}
              rows={porPaginaAba2}
              totalRecords={listaFiltradaAba2.length}
              rowsPerPageOptions={[10, 20, 50]}
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
              onPageChange={(event) => {
                setPrimeiroAba2(event.rows !== porPaginaAba2 ? 0 : event.first);
                setPorPaginaAba2(event.rows);
              }}
            />
          </>
        </section>

        <AnexoFerias label="Portaria da Escala de Férias" onChange={setDocumentoLote} />
      </div>
      ) : null}

      {abaColetiva === 2 && professoresIncluidos.length > 0 ? (
        <div className="prototype-ferias-coletiva-resumo-validacao">
          {(() => {
            const comErro = professoresIncluidos.filter((professor) => errosDe(professor).length > 0);
            const comAviso = professoresIncluidos.filter((professor) => avisosDe(professor).length > 0);
            const temporarios = professoresIncluidos.filter((professor) => professor.vinculo === "Contrato Temporário");
            const comSaldoExcedido = modoAgendamentoLote
              ? professoresIncluidos.filter((professor) => erroSaldoLote(professor) !== null)
              : [];
            return (
              <>
                {comErro.length > 0 ? (
                  <div className="prototype-ferias-coletiva-resumo-item is-erro">
                    <i className="pi pi-times-circle" aria-hidden="true" />
                    <span><strong>{comErro.length}</strong> servidor(es) com erro bloqueante — remova-os antes de lançar.</span>
                  </div>
                ) : null}
                {comSaldoExcedido.length > 0 ? (
                  <div className="prototype-ferias-coletiva-resumo-item is-erro">
                    <i className="pi pi-times-circle" aria-hidden="true" />
                    <span><strong>{comSaldoExcedido.length}</strong> servidor(es) com parcelas acima do saldo disponível.</span>
                  </div>
                ) : null}
                {comAviso.length > 0 ? (
                  <div className="prototype-ferias-coletiva-resumo-item is-aviso">
                    <i className="pi pi-exclamation-triangle" aria-hidden="true" />
                    <span><strong>{comAviso.length}</strong> servidor(es) com aviso — analise antes de prosseguir.</span>
                  </div>
                ) : null}
                {temporarios.length > 0 ? (
                  <div className="prototype-ferias-coletiva-resumo-item is-info">
                    <i className="pi pi-info-circle" aria-hidden="true" />
                    <span>
                      <strong>{temporarios.length}</strong> servidor(es) com Contrato Temporário incluído(s).{" "}
                      {orgao === "UNEMAT"
                        ? "O usufruto pode anteceder o fechamento do aquisitivo; saldo e pagamento serão conciliados depois. O cálculo proporcional não é feito nesta tela."
                        : "A inclusão exige aquisitivo fechado. O pagamento proporcional e o abono dependem de validação da Folha."}
                    </span>
                  </div>
                ) : null}
                <div className="prototype-ferias-coletiva-resumo-item is-fluxo">
                  <i className="pi pi-send" aria-hidden="true" />
                  <span>
                    {/* Todo lote (SEDUC, UNEMAT ou SECITEC) nasce Aguardando Validação e é avaliado
                        pelo perfil Aprovador na aba Aprovações, sempre em bloco (RN004). */}
                    Após lançar, o lote fica Aguardando Validação e é avaliado em bloco pelo perfil Aprovador, na aba Aprovações.
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      ) : null}

      <div className="prototype-ferias-coletiva-acoes">
        {abaColetiva === 1 ? (
          <>
            <button type="button" className="prototype-ferias-coletiva-btn-voltar" onClick={onCancelar}>
              <i className="pi pi-arrow-left" aria-hidden="true" />
              Voltar
            </button>
            <button
              type="button"
              className="prototype-ferias-coletiva-btn-avancar"
              disabled={!professoresIncluidos.length}
              onClick={() => setAbaColetiva(2)}
            >
              Avançar
              <i className="pi pi-arrow-right" aria-hidden="true" />
            </button>
          </>
        ) : (
          <>
            <button type="button" className="prototype-ferias-coletiva-btn-voltar" onClick={() => setAbaColetiva(1)}>
              <i className="pi pi-arrow-left" aria-hidden="true" />
              Voltar
            </button>
            <button type="button" className="prototype-ferias-coletiva-btn-lancar" onClick={lancarLote}>
              <i className="pi pi-check" aria-hidden="true" />
              {modoAgendamentoLote ? "Lançar Agendamento em Lote" : "Lançar Férias Coletivas do Lote"}
            </button>
          </>
        )}
      </div>
      </>
    </div>
  );
}

interface ServidorLote {
  id: number;
  nome: string;
  matricula: string;
  cargo: string;
  vinculo: string;
}

export function FormularioLote({
  onCancelar,
  onSalvar,
}: Readonly<{ onCancelar: () => void; onSalvar: (registros: FeriasRegistro[]) => void }>) {
  const [documento, setDocumento] = useState<DocumentoFerias | null>(null);
  const [orgao, setOrgao] = useState("SEPLAG/MT");
  const [periodoAquisitivo, setPeriodoAquisitivo] = useState(String(new Date().getFullYear()));
  const [dataInicio, setDataInicio] = useState("");
  const [dias, setDias] = useState(30);
  const [servidores, setServidores] = useState<ServidorLote[]>([]);
  const [buscaServidor, setBuscaServidor] = useState("");
  const [sugestoesServidorLote, setSugestoesServidorLote] = useState<string[]>([]);
  const [servidorEncontrado, setServidorEncontrado] = useState<ServidorMock | null>(null);

  const [erro, setErro] = useState("");
  const [confirmacao, setConfirmacao] = useState("");

  const fim = calcularFim(dataInicio, dias);

  const pesquisarServidorLote = () => {
    const encontrado = buscarServidorMockPorOrgao(buscaServidor, orgao);
    if (!encontrado) {
      setServidorEncontrado(null);
      setErro("Nenhum servidor encontrado. Pesquise pela matrícula ou pelo nome completo.");
      return;
    }
    setServidorEncontrado(encontrado);
    setErro("");
  };

  const completarBuscaServidorLote = (query: string) => {
    setSugestoesServidorLote(sugerirServidoresLote(query, orgao));
  };

  const selecionarServidorLote = (valor: string) => {
    setBuscaServidor(valor);
    const encontrado = buscarServidorMockPorOrgao(valor, orgao);
    setServidorEncontrado(encontrado ?? null);
    setErro(encontrado ? "" : "Nenhum servidor encontrado para o órgão selecionado.");
  };

  const adicionarServidor = () => {
    if (!servidorEncontrado) {
      setErro("Pesquise e selecione um servidor antes de adicioná-lo ao lote.");
      return;
    }
    setServidores((atual) => [
      ...atual,
      {
        id: gerarId(),
        nome: servidorEncontrado.nome,
        matricula: servidorEncontrado.matricula,
        cargo: servidorEncontrado.cargo,
        vinculo: servidorEncontrado.tipoVinculo,
      },
    ]);
    setBuscaServidor("");
    setServidorEncontrado(null);
    setErro("");
  };

  const removerServidor = (id: number) => {
    setServidores((atual) => atual.filter((servidor) => servidor.id !== id));
  };

  const lancarLote = () => {
    if (!documento) { setErro('Anexe o documento formal do lote.'); return; }
    if (!orgao.trim() || !dataInicio || !dias) {
      setErro("Preencha órgão, data de início e dias do lote.");
      setConfirmacao("");
      return;
    }
    if (!servidores.length) {
      setErro("Adicione ao menos um servidor ao lote.");
      setConfirmacao("");
      return;
    }

    setErro("");
    const loteId = `LOTE-GESTAO-${gerarId()}`;
    const periodos = servidores.map(servidor => {
      const cadastro = SERVIDORES_MOCK.find(s => s.matricula === servidor.matricula && s.tipoVinculo === servidor.vinculo);
      return cadastro ? periodoDisponivelServidor(cadastro) : undefined;
    });
    if (periodos.some((p,i) => !p || !duracoesPermitidas(p.saldo, orgao, servidores[i].cargo).includes(dias))) { setErro('Período sem saldo, duração inválida para o cargo ou sobra de 5 dias.'); return; }
    const novosRegistros: FeriasRegistro[] = servidores.map((servidor, indice) => ({
      id: gerarId() + servidor.id,
      servidorNome: servidor.nome,
      matricula: servidor.matricula,
      cpf: "",
      orgao,
      orgaoColetivo: "OUTRO",
      setor: "",
      cargo: servidor.cargo || "—",
      cargoGestao: true,
      tipoVinculo: servidor.vinculo as TipoVinculo,
      tipo: "Lote",
      origem: "SIGEP",
      periodoAquisitivoInicio: periodos[indice]!.inicio,
      periodoAquisitivoFim: periodos[indice]!.fim,
      saldoFerias: periodos[indice]!.saldo,
      documentos:[documento],
      dataLimiteValidacaoChefia:calcularPrazoValidacaoChefia(dataInicio),
      parcelas: [{ id: 1, inicio: dataInicio, fim, dias }],
      situacao: "AGUARDANDO VALIDAÇÃO",
      substitutos: [],
      loteId,
      responsavelLancamento: "Usuário atual",
      lancadoEm: new Date().toLocaleString("pt-BR"),
      historico: [{ situacao: "AGUARDANDO VALIDAÇÃO" as const, acao: "lancamento", data: new Date().toLocaleString("pt-BR"), responsavel: "Gestor", responsavelMatricula: USUARIO_ATOR_MOCK.Gestor.matricula, responsavelVinculo: USUARIO_ATOR_MOCK.Gestor.vinculo, documentos: [documento] }],
    }));

    setConfirmacao(`Lote lançado: ${novosRegistros.length} servidor(es) agendado(s) em ${formatarDataBr(dataInicio)}.`);
    onSalvar(novosRegistros);
  };

  return (
    <div>
      <AnexoFerias label="Documento formal do lote" onChange={setDocumento} />
      {erro ? <div className="prototype-ferias-erro-bloqueio">{erro}</div> : null}
      {confirmacao ? <div className="prototype-ferias-confirmacao">{confirmacao}</div> : null}

      <section className="prototype-ferias-form-section prototype-ferias-lote-secao">
        <h3 className="prototype-ferias-secao-titulo">
          <i className="pi pi-calendar" aria-hidden="true" />
          1. Dados do lote
        </h3>
        <div className="prototype-ferias-lote-secao-conteudo">
          <div className="prototype-ferias-lote-filtros prototype-ferias-lote-dados-grid">
          <label>
            <span>Órgão *</span>
            <select
              value={orgao}
              onChange={(event) => {
                setOrgao(event.target.value);
                setBuscaServidor("");
                setSugestoesServidorLote([]);
                setServidorEncontrado(null);
                setErro("");
              }}
            >
              <option value="SEPLAG/MT">SEPLAG/MT</option>
              <option value="SEDUC/MT">SEDUC/MT</option>
              <option value="SESP/MT">SESP/MT</option>
              <option value="SEMUS/MT">SEMUS/MT</option>
              <option value="SEFAZ/MT">SEFAZ/MT</option>
              <option value="UNEMAT/MT">UNEMAT/MT</option>
              <option value="OUTRO">Outro</option>
            </select>
          </label>
          <label>
            <span>Período Aquisitivo</span>
            <input value={periodoAquisitivo} onChange={(event) => setPeriodoAquisitivo(event.target.value)} placeholder="2026" />
          </label>
          <label>
            <span>Data de início *</span>
            <input type="date" value={dataInicio} onChange={(event) => setDataInicio(event.target.value)} />
          </label>
          <label>
            <span>Dias *</span>
            <input type="number" min={5} max={30} value={dias} onChange={(event) => setDias(Number(event.target.value))} />
          </label>
          <label>
            <span>Fim (calculado)</span>
            <input className="prototype-ferias-readonly-field" value={formatarDataBr(fim)} readOnly />
          </label>
          </div>
        </div>
      </section>

      <section className="prototype-ferias-form-section prototype-ferias-lote-secao">
        <h3 className="prototype-ferias-secao-titulo">
          <i className="pi pi-users" aria-hidden="true" />
          2. Servidores do lote ({servidores.length})
        </h3>
        <div className="prototype-ferias-lote-secao-conteudo">
        <label className="prototype-ferias-busca-servidor-label prototype-ferias-lote-busca">
          <span>Buscar Servidor (Matrícula, CPF ou Nome)</span>
          <div className="prototype-ferias-busca-servidor-row prototype-ferias-lote-busca-row">
            <SeplagAutoComplete
              inputId="ferias-lote-busca-servidor"
              className="w-full"
              value={buscaServidor}
              suggestions={sugestoesServidorLote}
              placeholder="Matrícula, CPF ou nome do servidor"
              forceSelection={false}
              completeMethod={completarBuscaServidorLote}
              onChange={(event) => {
                setBuscaServidor(String(event.value ?? ""));
                setServidorEncontrado(null);
                setErro("");
              }}
              onSelect={(event) => selecionarServidorLote(String(event.value ?? ""))}
              emptyMessage="Nenhum servidor localizado para o órgão selecionado"
              showEmptyMessage
            />
            <BotaoBuscarServidor onClick={pesquisarServidorLote} />
          </div>
        </label>

        {servidorEncontrado ? (
          <div className="prototype-ferias-lote-servidor-encontrado">
            <div className="prototype-ferias-servidor-resultado">
              <div className="prototype-ferias-servidor-resultado-grid is-identificacao">
                <div>
                  <span className="prototype-ferias-indicador-rotulo">Nome do Servidor</span>
                  <strong>{servidorEncontrado.nome}</strong>
                </div>
                <div>
                  <span className="prototype-ferias-indicador-rotulo">Matrícula / Vínculo</span>
                  <strong>
                    <span className="prototype-ferias-vinculo-ativo-badge">
                      {servidorEncontrado.matricula} · Vínculo {vinculosDoServidor(servidorEncontrado.nome).findIndex(
                        (vinculo) => vinculo.orgao === servidorEncontrado.orgao && vinculo.tipoVinculo === servidorEncontrado.tipoVinculo,
                      ) + 1}
                    </span>
                  </strong>
                </div>
                <div>
                  <span className="prototype-ferias-indicador-rotulo">Cargo / Função</span>
                  <strong>{servidorEncontrado.cargo}</strong>
                </div>
                <div>
                  <span className="prototype-ferias-indicador-rotulo">Lotação / Vínculo</span>
                  <strong>{servidorEncontrado.orgao} · {servidorEncontrado.tipoVinculo}</strong>
                </div>
                <hr className="prototype-ferias-servidor-resultado-divisor" />
                <div className="prototype-ferias-servidor-resultado-periodo">
                  <span className="prototype-ferias-indicador-rotulo">Período Aquisitivo Ativo</span>
                  <strong>
                    {servidorEncontrado.periodoAquisitivoInicio && servidorEncontrado.periodoAquisitivoFim
                      ? `${formatarDataBr(servidorEncontrado.periodoAquisitivoInicio)} a ${formatarDataBr(servidorEncontrado.periodoAquisitivoFim)}`
                      : "—"}
                  </strong>
                </div>
                <div className="prototype-ferias-servidor-resultado-saldo">
                  <span className="prototype-ferias-indicador-rotulo">Saldo de Férias</span>
                  <span className="prototype-ferias-badge-saldo">{servidorEncontrado.saldoDisponivel} dias restantes</span>
                </div>
              </div>
              <div className="prototype-ferias-lote-servidor-acao">
                <button type="button" className="prototype-ferias-btn-primario" onClick={adicionarServidor}>
                  <i className="pi pi-plus" aria-hidden="true" />
                  Adicionar ao lote
                </button>
              </div>
            </div>
          </div>
        ) : null}
        </div>
      </section>

      <section className="prototype-ferias-form-section prototype-ferias-lote-secao">
        <h3 className="prototype-ferias-secao-titulo">
        <i className="pi pi-list" aria-hidden="true" />
        3. Servidores em lote ({servidores.length})
        </h3>
        <div className="prototype-ferias-lote-secao-conteudo">
        <div className="prototype-ferias-lote-lista">
        <table className="prototype-ferias-sub-grid prototype-ferias-lote-grid">
            <thead>
              <tr>
                <th>Servidor</th>
                <th>Cargo</th>
                <th>Vínculo</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {servidores.map((servidor) => (
                <tr key={servidor.id}>
                  <td><strong>{servidor.nome}</strong><small>{servidor.matricula}</small></td>
                  <td>{servidor.cargo || "—"}</td>
                  <td>{servidor.vinculo || "—"}</td>
                  <td>
                    <button type="button" className="prototype-ferias-icon-btn" title="Remover" onClick={() => removerServidor(servidor.id)}>
                      <i className="pi pi-trash" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </section>

      <div className="prototype-vinculo-form prototype-ferias-lancamento-acoes" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button type="button" className="prototype-vinculo-back" onClick={onCancelar}>
          <i className="pi pi-arrow-left" aria-hidden="true" />
          Voltar
        </button>
        <button type="button" className="prototype-ferias-btn-primario" onClick={lancarLote}>
          <i className="pi pi-check" aria-hidden="true" />
          Lançar Agendamento em Lote
        </button>
      </div>
    </div>
  );
}

const VINCULOS_RECESSO: TipoVinculo[] = ["Residente Técnico", "Estagiário"];

/** RC04: o início do usufruto não pode ocorrer 2 dias antes de fim de semana (feriados não são
 * verificados neste protótipo por falta de calendário). */
function violaAntecedenciaFimDeSemana(dataInicio: string): boolean {
  if (!dataInicio) return false;
  const data = new Date(`${dataInicio}T00:00:00`);
  data.setDate(data.getDate() + 2);
  const diaSemana = data.getDay();
  return diaSemana === 0 || diaSemana === 6;
}

export function FormularioRecesso({
  onCancelar,
  onSalvar,
  registroSomenteLeitura,
  registroParaEditar,
}: Readonly<{
  onCancelar: () => void;
  onSalvar: (registro: FeriasRegistro) => void;
  /** Quando informado, a tela abre com os dados desse registro já preenchidos e tudo
   * desabilitado/acinzentado — reaproveita o mesmo layout do cadastro só para "Visualizar". */
  registroSomenteLeitura?: FeriasRegistro;
  /** Edição de um recesso já lançado (US50 3.5) — mesma tela/padrão da criação, servidor
   * pré-preenchido e travado; só a data de início de cada etapa já existente é editável,
   * respeitando antecedência mínima, regra de fim de semana (RC04) e o limite do próximo
   * período aquisitivo/fim do contrato — sem adicionar ou remover etapa. */
  registroParaEditar?: FeriasRegistro;
}>) {
  const registroBase = registroSomenteLeitura ?? registroParaEditar;
  const somenteLeitura = Boolean(registroSomenteLeitura);
  const ehEdicao = Boolean(registroParaEditar);
  const servidorTravado = somenteLeitura || ehEdicao;
  const [servidorNome, setServidorNome] = useState(registroBase?.servidorNome ?? "");
  const [matricula, setMatricula] = useState(registroBase?.matricula ?? "");
  const [orgao, setOrgao] = useState(registroBase?.orgao ?? "SEPLAG/MT");
  const [setor, setSetor] = useState(registroBase?.setor ?? "");
  const [cargo, setCargo] = useState(registroBase?.cargo ?? "");
  const [tipoVinculo, setTipoVinculo] = useState<TipoVinculo>(registroBase?.tipoVinculo ?? "Residente Técnico");
  const [dataInicioVinculo, setDataInicioVinculo] = useState(registroBase?.periodoAquisitivoInicio ?? "");
  const [periodoAquisitivoInicio, setPeriodoAquisitivoInicio] = useState(registroBase?.periodoAquisitivoInicio ?? "");
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState<PeriodoAquisitivoRecesso[]>(() =>
    registroBase
      ? [{ inicio: registroBase.periodoAquisitivoInicio, saldo: diasSolicitados(registroBase) }]
      : [],
  );
  const [periodoAquisitivoSelecionado, setPeriodoAquisitivoSelecionado] = useState(registroBase?.periodoAquisitivoInicio ?? "");
  const [vinculoInfo, setVinculoInfo] = useState<{ indice: number; total: number } | null>(null);
  const [, setDataInicio] = useState("");
  const [parcelasResidente, setParcelasResidente] = useState<ParcelaFerias[]>(() => registroBase?.parcelas.map((parcela) => ({ ...parcela })) ?? []);
  const {
    control: recessoGozoControl,
    watch: watchRecessoGozo,
    setValue: setRecessoGozoValue,
  } = useForm<{ duracao: number; dataInicio: string }>({
    defaultValues: { duracao: 30, dataInicio: "" },
  });
  const valoresGozoRecesso = watchRecessoGozo();
  const draftDuracaoResidente = valoresGozoRecesso.duracao;
  const draftInicioResidente = brParaIso(valoresGozoRecesso.dataInicio);
  // Edição (ehEdicao): um campo "Data início do gozo" por etapa já existente, usando o mesmo
  // DateFieldSeplag da criação — cada etapa tem seu próprio nome de campo (inicio_<id>).
  const {
    control: parcelasEdicaoControl,
    watch: watchParcelasEdicao,
  } = useForm<Record<string, string>>({
    defaultValues: Object.fromEntries((registroParaEditar?.parcelas ?? []).map((parcela) => [`inicio_${parcela.id}`, formatarDataBr(parcela.inicio)])),
  });
  const valoresParcelasEdicao = watchParcelasEdicao();
  const [erro, setErro] = useState("");
  const [alertaConcomitancia, setAlertaConcomitancia] = useState("");
  const [avisosAjusteLts, setAvisosAjusteLts] = useState<Record<number, string>>({});
  const [servidorEncontrado, setServidorEncontrado] = useState(servidorTravado);
  const [textoBuscaRecesso, setTextoBuscaRecesso] = useState(
    registroBase ? `${registroBase.matricula} - ${registroBase.servidorNome}` : "",
  );
  const [sugestoesServidorRecesso, setSugestoesServidorRecesso] = useState<string[]>([]);
  const [documento, setDocumento] = useState<DocumentoFerias | null>(null);

  const ehEstagiario = tipoVinculo === "Estagiário";
  const ehResidenteTecnico = tipoVinculo === "Residente Técnico";

  // RN005 (US51 / IN 007/2022): só o estagiário tem corte de período aquisitivo em março/2018.
  const periodoBloqueadoPorCorte = (periodo: PeriodoAquisitivoRecesso) =>
    ehEstagiario && periodo.inicio < MARCO_CORTE_ESTAGIARIO;
  const periodoSelecionado = periodosDisponiveis.find((periodo) => periodo.inicio === periodoAquisitivoSelecionado) ?? null;
  const saldoTotalPeriodo = periodoSelecionado?.saldo ?? null;
  const parcelasJaAgendadas = useMemo(
    () => carregarRegistros()
      .filter((registro) =>
        registro.tipo === "Recesso" &&
        registro.matricula === matricula &&
        registro.periodoAquisitivoInicio === periodoAquisitivoSelecionado &&
        registro.id !== registroBase?.id &&
        registro.situacao !== "REPROVADO" &&
        registro.situacao !== "PRAZO EXPIRADO",
      )
      .flatMap((registro) => registro.parcelas),
    [matricula, periodoAquisitivoSelecionado, registroBase?.id],
  );
  const diasJaAgendados = parcelasJaAgendadas.reduce((total, parcela) => total + parcela.dias, 0);
  const saldoDisponivel = saldoTotalPeriodo === null ? null : Math.max(0, saldoTotalPeriodo - diasJaAgendados);
  const fimContrato = FIM_CONTRATO_RECESSO_MOCK[matricula];

  // validarSolicitacaoRecesso: residente e estagiário usam os mesmos blocos fechados de
  // parcela (10/15/20/30 dias) — nenhum vínculo aceita valor contínuo.
  const diasMinimoEtapa = 10;
  const diasMaximoEtapa = 30;

  const totalParceladoResidente = parcelasResidente.reduce((total, parcela) => total + parcela.dias, 0);
  const saldoRestanteEtapas = (saldoDisponivel ?? 0) - totalParceladoResidente;
  const opcoesDuracaoRecesso = useMemo(
    () => [30, 20, 15, 10].filter((d) => d <= saldoRestanteEtapas && saldoRestanteEtapas - d !== 5),
    [saldoRestanteEtapas],
  );
  useEffect(() => {
    if (opcoesDuracaoRecesso.length && !opcoesDuracaoRecesso.includes(draftDuracaoResidente)) {
      setRecessoGozoValue("duracao", opcoesDuracaoRecesso[0]);
    }
  }, [opcoesDuracaoRecesso, draftDuracaoResidente, setRecessoGozoValue]);

  const draftFimResidente = calcularFim(draftInicioResidente, draftDuracaoResidente ?? 0);
  // Antecedência mínima da PRÓXIMA etapa: estagiário 30 dias (IN 007/2022); residente técnico
  // 15 dias para qualquer parcela (IN 002/2024/SEPLAG) — ver validarSolicitacaoRecesso.
  const antecedenciaMinimaProximaEtapa = ehEstagiario ? 30 : 15;
  const dataMinimaProximaEtapa = adicionarDiasISO(dataLocalISO(), antecedenciaMinimaProximaEtapa);

  // RN003: concomitância verificada assim que a data é escolhida (sem esperar o clique em
  // "Adicionar etapa") e também para as etapas já adicionadas — senão o aviso desaparece
  // quando o rascunho é limpo após o "Adicionar". Qualquer sobreposição bloqueia.
  useEffect(() => {
    if (!matricula || somenteLeitura) {
      setAlertaConcomitancia("");
      return;
    }
    const candidatos = draftInicioResidente && draftFimResidente
      ? [{ inicio: draftInicioResidente, fim: draftFimResidente, dias: draftDuracaoResidente ?? 0 }, ...parcelasResidente]
      : parcelasResidente;
    for (const candidato of candidatos) {
      const conflito = conflitoFeriasServidor(matricula, candidato.inicio, candidato.fim);
      if (conflito) {
        setAlertaConcomitancia(mensagemConflitoAgendamento(conflito));
        return;
      }
      {
        const ajuste = ajustarInicioParaAposLts(candidato.inicio, candidato.dias, matricula);
        if (ajuste.ajustado) {
          setAlertaConcomitancia(
            `LTS está vigente no mesmo período. Data de início ajustada automaticamente para o dia seguinte ao fim da LTS vigente (${formatarDataBr(ajuste.inicio)}).`,
          );
          return;
        }
      }
    }
    setAlertaConcomitancia("");
  }, [matricula, draftInicioResidente, draftFimResidente, draftDuracaoResidente, parcelasResidente, somenteLeitura]);

  const adicionarParcelaResidente = () => {
    if (parcelasJaAgendadas.length + parcelasResidente.length >= 3) {
      setErro("Parcelável em até 3 etapas nesta tela.");
      return;
    }
    const dias = draftDuracaoResidente;
    if (!dias || dias < diasMinimoEtapa) {
      setErro(`Informe a duração desta etapa (mínimo ${diasMinimoEtapa} dias).`);
      return;
    }
    if (dias > diasMaximoEtapa) {
      setErro(`A duração desta etapa não pode passar de ${diasMaximoEtapa} dias.`);
      return;
    }
    if (dias > saldoRestanteEtapas) {
      setErro(`A duração escolhida (${dias} dias) excede o saldo restante (${saldoRestanteEtapas} dias).`);
      return;
    }
    if (!draftInicioResidente) {
      setErro("Informe a data de início desta etapa.");
      return;
    }
    const numeroParcela = parcelasJaAgendadas.length + parcelasResidente.length + 1;
    const resultado = validarSolicitacaoRecesso({
      tipo_vinculo: ehEstagiario ? "ESTAGIARIO" : "RESIDENTE",
      data_inicio_contrato: dataInicioVinculo,
      data_fim_contrato: fimContrato ?? "9999-12-31",
      data_solicitacao: dataLocalISO(),
      data_inicio_recesso: draftInicioResidente,
      quantidade_dias_solicitados: dias,
      numero_parcela: numeroParcela,
      saldo_dias_disponivel: saldoDisponivel ?? 0,
    });
    if (!resultado.sucesso) {
      setErro(resultado.mensagem);
      return;
    }
    const fimEtapa = calcularFim(draftInicioResidente, dias);
    // RN003: qualquer sobreposição com outro agendamento do mesmo servidor bloqueia o lançamento.
    const conflito = conflitoFeriasServidor(matricula, draftInicioResidente, fimEtapa);
    if (conflito) {
      setErro(mensagemConflitoAgendamento(conflito));
      return;
    }
    {
      // RN-03: se a LTS já está vigente no período, a data de início é ajustada automaticamente
      // para o dia seguinte ao fim da LTS — não bloqueia o lançamento, mas não deixa sobrepor.
      const ajuste = ajustarInicioParaAposLts(draftInicioResidente, dias, matricula);
      const novoId = gerarId();
      setAlertaConcomitancia("");
      if (ajuste.ajustado) {
        setAvisosAjusteLts((atual) => ({
          ...atual,
          [novoId]: `LTS está vigente no mesmo período. Data de início ajustada automaticamente para o dia seguinte ao fim da LTS vigente (${formatarDataBr(ajuste.inicio)}).`,
        }));
      }
      setParcelasResidente((atual) => [
        ...atual,
        { id: novoId, dias, inicio: ajuste.inicio, fim: ajuste.fim },
      ]);
    }
    setRecessoGozoValue("dataInicio", "");
    setErro("");
  };

  const removerParcelaResidente = (id: number) => {
    setParcelasResidente((atual) => atual.filter((parcela) => parcela.id !== id));
    setAvisosAjusteLts((atual) => {
      const { [id]: _removido, ...resto } = atual;
      return resto;
    });
  };

  // Edição de recesso já lançado (US50 3.5): não adiciona/remove etapa, só a data de início de
  // cada etapa existente muda — recalcula o fim e revalida contra o limite abaixo ao salvar.
  const atualizarInicioParcelaResidenteEdicao = (id: number, novoInicio: string) => {
    setParcelasResidente((atual) =>
      atual.map((parcela) => (parcela.id === id ? { ...parcela, inicio: novoInicio, fim: calcularFim(novoInicio, parcela.dias) } : parcela)),
    );
  };
  const periodosRecessoEdicao = registroParaEditar ? (PERIODOS_RECESSO_MOCK[registroParaEditar.matricula] ?? []) : [];
  const indiceAtualRecessoEdicao = periodosRecessoEdicao.findIndex((periodo) => periodo.inicio === registroParaEditar?.periodoAquisitivoInicio);
  const proximoPeriodoRecessoEdicao = indiceAtualRecessoEdicao >= 0 ? periodosRecessoEdicao[indiceAtualRecessoEdicao + 1] : undefined;
  const fimContratoEdicao = registroParaEditar ? FIM_CONTRATO_RECESSO_MOCK[registroParaEditar.matricula] : undefined;
  const limiteAlteracaoRecesso = ehEstagiario
    ? fimContratoEdicao
    : [fimContratoEdicao, proximoPeriodoRecessoEdicao?.inicio].filter(Boolean).sort()[0];
  const primeiraDataPermitidaEdicao = adicionarDiasISO(dataLocalISO(), 15);

  useEffect(() => {
    if (!ehEdicao) return;
    Object.entries(valoresParcelasEdicao).forEach(([campo, valorBr]) => {
      const id = Number(campo.replace("inicio_", ""));
      const iso = brParaIso(String(valorBr ?? ""));
      if (iso) atualizarInicioParcelaResidenteEdicao(id, iso);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(valoresParcelasEdicao), ehEdicao]);

  const aplicarServidorRecesso = (servidor: ServidorMock) => {
    setServidorNome(servidor.nome);
    setMatricula(servidor.matricula);
    setOrgao(servidor.orgao);
    setSetor(servidor.setor);
    setCargo(servidor.cargo);
    setTipoVinculo(servidor.tipoVinculo);
    setPeriodoAquisitivoInicio(servidor.periodoAquisitivoInicio);
    setDataInicioVinculo(servidor.periodoAquisitivoInicio);
    const periodos = (PERIODOS_RECESSO_MOCK[servidor.matricula] ?? [
      { inicio: servidor.periodoAquisitivoInicio, saldo: servidor.saldoDisponivel },
    ]).slice().sort((a, b) => (a.inicio < b.inicio ? -1 : 1));
    setPeriodosDisponiveis(periodos);
    // RN004/RN005/RN011: seleciona automaticamente o período aquisitivo mais antigo com saldo
    // (respeitando o corte de março/2018 do estagiário), sem exigir escolha manual na tela.
    const primeiroValido = periodos.find(
      (periodo) => periodo.saldo > 0 && !(servidor.tipoVinculo === "Estagiário" && periodo.inicio < MARCO_CORTE_ESTAGIARIO),
    );
    setPeriodoAquisitivoSelecionado(primeiroValido?.inicio ?? "");
    setDataInicio("");
    setParcelasResidente([]);
    setRecessoGozoValue("duracao", 30);
    setRecessoGozoValue("dataInicio", "");
    setServidorEncontrado(true);
    setAlertaConcomitancia("");
    const todosVinculos = vinculosDoServidor(servidor.nome);
    const indice = todosVinculos.findIndex(
      (vinculo) => vinculo.matricula === servidor.matricula && vinculo.tipoVinculo === servidor.tipoVinculo,
    ) + 1;
    setVinculoInfo({ indice: Math.max(indice, 1), total: todosVinculos.length });
  };

  const descricaoServidorRecesso = (servidor: ServidorMock) => `${servidor.matricula} - ${servidor.nome}`;

  const completarBuscaServidorRecesso = (query: string) => {
    const termo = query.trim().toLocaleLowerCase("pt-BR");
    const cpfBusca = termo.replace(/\D/g, "");
    const resultados = SERVIDORES_MOCK.filter(
      (servidor) =>
        VINCULOS_RECESSO.includes(servidor.tipoVinculo) &&
        (!termo ||
          servidor.matricula.includes(termo) ||
          servidor.nome.toLocaleLowerCase("pt-BR").includes(termo) ||
          Boolean(cpfBusca && servidor.cpf?.replace(/\D/g, "").includes(cpfBusca))),
    );
    setSugestoesServidorRecesso(resultados.map(descricaoServidorRecesso));
  };

  const selecionarServidorRecesso = (valor: string) => {
    setTextoBuscaRecesso(valor);
    const encontrado = SERVIDORES_MOCK.find(
      (servidor) => VINCULOS_RECESSO.includes(servidor.tipoVinculo) && descricaoServidorRecesso(servidor) === valor,
    );
    if (encontrado) {
      aplicarServidorRecesso(encontrado);
      setErro("");
    } else {
      setServidorEncontrado(false);
    }
  };

  const buscarServidorRecesso = (valor: string) => {
    setServidorEncontrado(false);
    const encontrado = buscarServidorMock(valor);
    if (encontrado && VINCULOS_RECESSO.includes(encontrado.tipoVinculo)) {
      aplicarServidorRecesso(encontrado);
      setTextoBuscaRecesso(descricaoServidorRecesso(encontrado));
      setErro("");
    } else {
      setServidorNome(valor);
      setMatricula("");
      completarBuscaServidorRecesso(valor);
      setErro("Nenhum servidor encontrado. Pesquise pela matrícula ou pelo nome completo.");
    }
  };

  const parcelasCalculadas: ParcelaFerias[] = parcelasResidente.map((parcela) => ({
    ...parcela,
    fim: calcularFim(parcela.inicio, parcela.dias),
  }));
  // IN 007/2022 (estagiário) e Decreto 704/2024 (residente técnico): nenhum dos dois recebe
  // auxílio-transporte durante o recesso, só a bolsa/vencimento normal.
  const bloqueioAuxilioTransporte = ehEstagiario || ehResidenteTecnico;

  const salvar = () => {
    if (ehEdicao) {
      if (!documento) { setErro('Anexe a justificativa formal da alteração.'); return; }
      if (parcelasResidente.some((parcela) => !parcela.inicio)) {
        setErro("Informe a data de início de todas as etapas.");
        return;
      }
      const hoje = dataLocalISO();
      for (const parcela of parcelasResidente) {
        if (diasEntre(hoje, parcela.inicio) < 15) {
          setErro(`A etapa de ${formatarDataBr(parcela.inicio)} não respeita os 15 dias de antecedência.`);
          return;
        }
        if (violaAntecedenciaFimDeSemana(parcela.inicio)) {
          setErro(`A etapa de ${formatarDataBr(parcela.inicio)} não pode iniciar 2 dias antes de um fim de semana.`);
          return;
        }
        if (limiteAlteracaoRecesso && parcela.fim >= limiteAlteracaoRecesso) {
          setErro(
            `A data fim (${formatarDataBr(parcela.fim)}) precisa ser anterior a ${formatarDataBr(limiteAlteracaoRecesso)} ` +
            `(${ehEstagiario ? "fim do contrato" : "início do próximo período aquisitivo"}).`,
          );
          return;
        }
      }
      if (!ehEstagiario) {
        const erroIntervalo = validarIntervaloParcelas(parcelasResidente);
        if (erroIntervalo) { setErro(erroIntervalo); return; }
      }
      setErro("");
      onSalvar({
        ...registroParaEditar!,
        parcelas: parcelasResidente,
        documentos: [...(registroParaEditar!.documentos ?? []), documento],
        historico: eventoEdicao(registroParaEditar!, parcelasResidente, registroParaEditar!.situacao, documento),
      });
      return;
    }
    if (!servidorNome.trim() || !matricula.trim() || !cargo.trim()) {
      setErro("Preencha servidor, matrícula e cargo.");
      return;
    }
    if (!VINCULOS_RECESSO.includes(tipoVinculo)) {
      setErro("Recesso remunerado é exclusivo para Residente Técnico e Estagiário.");
      return;
    }
    if (!periodoSelecionado) {
      setErro("Selecione um período aquisitivo.");
      return;
    }
    // RN005 (US51): defesa adicional — a UI já bloqueia a seleção, mas garante no save também.
    if (periodoBloqueadoPorCorte(periodoSelecionado)) {
      setErro("Períodos aquisitivos anteriores a março de 2018 devem ser agendados pela Gestão de Pessoas.");
      return;
    }
    if (!saldoDisponivel) {
      setErro("Servidor sem saldo disponível para recesso.");
      return;
    }
    if (parcelasCalculadas.length === 0) {
      setErro("Adicione ao menos uma etapa do recesso.");
      return;
    }
    if (saldoDisponivel - totalParceladoResidente === 5) { setErro('O parcelamento não pode deixar saldo residual de 5 dias.'); return; }
    if (!documento) { setErro('Anexe o documento/despacho formal do recesso.'); return; }
    // Revalida cada etapa com a mesma função usada ao adicionar (defesa em profundidade).
    for (let indice = 0; indice < parcelasCalculadas.length; indice += 1) {
      const parcela = parcelasCalculadas[indice];
      const resultado = validarSolicitacaoRecesso({
        tipo_vinculo: ehEstagiario ? "ESTAGIARIO" : "RESIDENTE",
        data_inicio_contrato: dataInicioVinculo,
        data_fim_contrato: fimContrato ?? "9999-12-31",
        data_solicitacao: dataLocalISO(),
        data_inicio_recesso: parcela.inicio,
        quantidade_dias_solicitados: parcela.dias,
        numero_parcela: parcelasJaAgendadas.length + indice + 1,
        saldo_dias_disponivel: saldoDisponivel,
      });
      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }
    }
    setErro("");
    onSalvar({
      id: gerarId(),
      servidorNome,
      matricula,
      cpf: "",
      orgao,
      orgaoColetivo: "OUTRO",
      setor,
      cargo,
      cargoGestao: false,
      tipoVinculo,
      tipo: "Recesso",
      // Lançamento pelo SIGEP (RH/Gestão de Pessoas) nasce diretamente "Em Aberto" (Agendada),
      // sem fila de validação — mesma regra do lançamento Individual.
      origem: "SIGEP",
      periodoAquisitivoInicio: periodoAquisitivoSelecionado,
      periodoAquisitivoFim: "",
      parcelas: parcelasCalculadas,
      situacao: "EM ABERTO",
      bloqueioAuxilioTransporte,
      emailChefiaEnviado: !ehEstagiario,
      substitutos: [],
      documentos: [documento],
      responsavelLancamento: "Usuário atual",
      lancadoEm: new Date().toLocaleString("pt-BR"),
      historico: [{ situacao: "EM ABERTO" as const, acao: "lancamento", data: new Date().toLocaleString("pt-BR"), responsavel: "Gestor", responsavelMatricula: USUARIO_ATOR_MOCK.Gestor.matricula, responsavelVinculo: USUARIO_ATOR_MOCK.Gestor.vinculo, documentos: [documento] }],
    });
  };

  return (
    <div className="prototype-ferias-individual-form">
      {erro ? <div className="prototype-ferias-erro-bloqueio">{erro}</div> : null}
      {alertaConcomitancia ? (
        <div className="prototype-ferias-banner is-alerta" role="note">
          <i className="pi pi-exclamation-triangle" aria-hidden="true" />
          <span>{alertaConcomitancia}</span>
        </div>
      ) : null}

      <div className={somenteLeitura ? "prototype-ferias-visualizacao-somente-leitura" : undefined}>
      <div className="prototype-ferias-form-section">
        <h3 className="prototype-ferias-secao-titulo">
          <i className="pi pi-user" aria-hidden="true" />
          Servidor
          {servidorEncontrado && (
            <span className="prototype-ferias-servidor-encontrado">
              <i className="pi pi-check-circle" /> Servidor encontrado
            </span>
          )}
        </h3>
        {!servidorTravado ? (
          <label className="prototype-ferias-busca-servidor-label" htmlFor="ferias-recesso-busca-servidor">
            <span>Buscar Servidor (Matrícula, CPF ou Nome)</span>
            <div className="prototype-ferias-busca-servidor-row">
              <SeplagAutoComplete
                inputId="ferias-recesso-busca-servidor"
                className="w-full"
                value={textoBuscaRecesso}
                suggestions={sugestoesServidorRecesso}
                placeholder="Matrícula, CPF ou nome do servidor"
                forceSelection={false}
                completeMethod={completarBuscaServidorRecesso}
                onChange={(event) => {
                  setServidorEncontrado(false);
                  setTextoBuscaRecesso(String(event.value ?? ""));
                }}
                onSelect={(event) => selecionarServidorRecesso(String(event.value ?? ""))}
              />
              <BotaoBuscarServidor onClick={() => buscarServidorRecesso(textoBuscaRecesso)} />
            </div>
          </label>
        ) : null}

        {servidorEncontrado && (
          <div className="prototype-ferias-servidor-resultado">
            <div className="prototype-ferias-servidor-resultado-grid is-identificacao">
              <div>
                <span className="prototype-ferias-indicador-rotulo">Nome do Servidor</span>
                <strong>{servidorNome}</strong>
              </div>
              <div>
                <span className="prototype-ferias-indicador-rotulo">Matrícula / Vínculo</span>
                <strong>
                  {vinculoInfo ? (
                    <span className="prototype-ferias-vinculo-ativo-badge">
                      {matricula} · Vínculo {vinculoInfo.indice}
                    </span>
                  ) : (
                    matricula
                  )}
                </strong>
              </div>
              <div>
                <span className="prototype-ferias-indicador-rotulo">Cargo / Função</span>
                <strong>{cargo}</strong>
              </div>
              <div>
                <span className="prototype-ferias-indicador-rotulo">Órgão / Vínculo</span>
                <strong>{orgao} · {tipoVinculo}</strong>
              </div>
              <hr className="prototype-ferias-servidor-resultado-divisor" />
              <div className="prototype-ferias-servidor-resultado-periodo">
                <span className="prototype-ferias-indicador-rotulo">Setor</span>
                <strong>{setor || "—"}</strong>
              </div>
              <div className="prototype-ferias-servidor-resultado-saldo">
                <span className="prototype-ferias-indicador-rotulo">Saldo do Período Selecionado</span>
                <span className="prototype-ferias-badge-saldo">
                  {periodoSelecionado ? `${saldoDisponivel} dias` : "selecione abaixo"}
                </span>
              </div>
            </div>
            {!servidorTravado ? (
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar servidor"
                icon="pi pi-times"
                style={{ width: "auto", whiteSpace: "nowrap", height: 32, padding: "0 12px", fontSize: "0.82rem" }}
                onClick={() => {
                  setServidorNome("");
                  setMatricula("");
                  setOrgao("SEPLAG/MT");
                  setSetor("");
                  setCargo("");
                  setTipoVinculo("Residente Técnico");
                  setPeriodoAquisitivoInicio("");
                  setPeriodosDisponiveis([]);
                  setPeriodoAquisitivoSelecionado("");
                  setDataInicio("");
                  setDataInicioVinculo("");
                  setTextoBuscaRecesso("");
                  setParcelasResidente([]);
                  setRecessoGozoValue("duracao", 30);
                  setRecessoGozoValue("dataInicio", "");
                  setServidorEncontrado(false);
                  setVinculoInfo(null);
                }}
              />
            ) : null}
          </div>
        )}

      </div>

      {(servidorEncontrado || dataInicioVinculo) && (() => {
        const ref = dataInicioVinculo || periodoAquisitivoInicio;
        const carencia = calcularCarencia(ref);
        if (!carencia) return null;
        const hoje = dataLocalISO();
        return (
          <div className="prototype-ferias-form-section prototype-ferias-carencia-painel">
            <h3 className="prototype-ferias-secao-titulo">
              <i className="pi pi-calendar" aria-hidden="true" />
              Período aquisitivo &amp; carência
            </h3>
            <div className="prototype-ferias-carencia-linha">
              <div className="prototype-ferias-carencia-item">
                <span className="prototype-ferias-carencia-label">Início do vínculo</span>
                <strong>{formatarDataBr(ref)}</strong>
              </div>
              <div className="prototype-ferias-carencia-seta">→</div>
              <div className="prototype-ferias-carencia-item">
                <span className="prototype-ferias-carencia-label">Hoje</span>
                <strong>{formatarDataBr(hoje)}</strong>
              </div>
              <div className="prototype-ferias-carencia-seta">→</div>
              <div className="prototype-ferias-carencia-item">
                <span className="prototype-ferias-carencia-label">Tempo de vínculo</span>
                <strong>{carencia.meses} {carencia.meses === 1 ? "mês" : "meses"} e {carencia.diasRestantes} {carencia.diasRestantes === 1 ? "dia" : "dias"} ({carencia.totalDias} dias)</strong>
              </div>
            </div>
            {ehEstagiario ? <p>Estagiário: carência mínima de 6 meses de contrato para liberar usufruto de 15 dias.</p> : (
              <div className="prototype-ferias-carencia-badges">
                <span className={`prototype-ferias-carencia-badge ${carencia.cumpre12 ? "is-ok" : "is-erro"}`}>
                  <i className={`pi ${carencia.cumpre12 ? "pi-check" : "pi-times"}`} />
                  {" "}12 meses (365 dias) — {carencia.cumpre12 ? "cumprido" : `faltam ${365 - carencia.totalDias} dias`}
                </span>
              </div>
            )}
          </div>
        );
      })()}

      <div className="prototype-ferias-form-section">
        <h3 className="prototype-ferias-secao-titulo">
          <i className="pi pi-calendar" aria-hidden="true" />
          2. Detalhes do Período de Gozo
        </h3>

        {ehEdicao ? (
          <div className="prototype-ferias-banner" style={{ background: "#eff6ff", borderColor: "#bfdbfe", color: "#1d4ed8" }}>
            <i className="pi pi-info-circle" aria-hidden="true" />
            <span>
              Alteração permitida enquanto estiver dentro do limite de usufruto — a nova data fim precisa ser
              anterior {ehEstagiario ? "ao fim da contratação" : "ao início do próximo período aquisitivo"}
              {limiteAlteracaoRecesso ? ` (${formatarDataBr(limiteAlteracaoRecesso)})` : ", sem limite conhecido para este servidor"}.
            </span>
          </div>
        ) : null}

        {!periodoSelecionado ? (
          <div className="prototype-ferias-gozo-ajuda">Selecione um período aquisitivo acima para continuar.</div>
        ) : (
          <>
            {!somenteLeitura && !ehEdicao ? (
              <>
                <div className="prototype-ferias-gozo-grid">
                  <div>
                    <DropdownFieldSeplag
                      name="duracao"
                      control={recessoGozoControl}
                      label="Duração desta parcela"
                      cols="12"
                      disabled={parcelasResidente.length >= 3 || !opcoesDuracaoRecesso.length}
                      options={opcoesDuracaoRecesso.map((dias) => ({
                        label: `${dias === saldoDisponivel ? "Integral" : "Parcela"} (${dias} dias)`,
                        value: dias,
                      }))}
                      optionLabel="label"
                      optionValue="value"
                      getFormErrorMessage={() => null}
                    />
                    <small className="prototype-ferias-gozo-ajuda">
                      Blocos de 10, 15 ou 20 dias; integral de 30 dias.{" "}
                      {ehEstagiario
                        ? "Antecedência mínima de 30 dias."
                        : `Antecedência mínima de ${antecedenciaMinimaProximaEtapa} dias para esta etapa.`}
                    </small>
                    {!ehEstagiario && saldoDisponivel !== null && saldoDisponivel > 0 &&
                      opcoesDuracaoRecesso.length === 0 && parcelasResidente.length === 0 ? (
                        <small className="prototype-ferias-gozo-ajuda">
                          Saldo de {saldoDisponivel} dias fora dos parcelamentos permitidos: integral 30, 15+15, 10+20 ou 10+10+10.
                        </small>
                      ) : null}
                  </div>
                  <div>
                    <DateFieldSeplag
                      name="dataInicio"
                      control={recessoGozoControl}
                      label="Data início do gozo"
                      cols="12"
                      disabled={parcelasResidente.length >= 3 || saldoRestanteEtapas <= 0}
                      minDate={new Date(`${dataMinimaProximaEtapa}T00:00:00`)}
                      getFormErrorMessage={() => null}
                    />
                    <small className="prototype-ferias-gozo-ajuda">
                      A partir de {formatarDataBr(dataMinimaProximaEtapa)} ({antecedenciaMinimaProximaEtapa} dias de antecedência).
                    </small>
                  </div>
                  <label>
                    <span>Data fim (calculada)</span>
                    <input className="prototype-ferias-readonly-field" value={formatarDataBr(draftFimResidente)} readOnly />
                    <small className="prototype-ferias-gozo-ajuda">Calculado automaticamente.</small>
                  </label>
                </div>

                <div className="prototype-ferias-gozo-acoes">
                  <button
                    type="button"
                    className="prototype-ferias-sub-add"
                    disabled={parcelasResidente.length >= 3 || saldoRestanteEtapas <= 0}
                    onClick={adicionarParcelaResidente}
                  >
                    <i className="pi pi-plus" aria-hidden="true" />
                    Adicionar esta etapa
                  </button>
                  <span className={totalParceladoResidente === (saldoDisponivel ?? 0) ? "prototype-ferias-saldo-ok" : "prototype-ferias-saldo-erro"}>
                    {totalParceladoResidente} de {saldoDisponivel ?? 0} dias parcelados
                  </span>
                </div>
              </>
            ) : null}

            {ehEdicao && parcelasResidente.length > 0 ? (
              <div className="prototype-ferias-form-grid">
                {parcelasResidente.map((parcela, indice) => (
                  <div className="prototype-ferias-form-grid" key={parcela.id}>
                    <DateFieldSeplag
                      name={`inicio_${parcela.id}`}
                      control={parcelasEdicaoControl}
                      label="Data início do gozo"
                      cols="12"
                      minDate={new Date(`${primeiraDataPermitidaEdicao}T00:00:00`)}
                      getFormErrorMessage={() => null}
                    />
                    <label>
                      <span>Etapa {indice + 1} — {parcela.dias} dias</span>
                      <input className="prototype-ferias-readonly-field" value={`${parcela.dias} dias`} readOnly />
                    </label>
                    <label>
                      <span>Fim (calculado)</span>
                      <input className="prototype-ferias-readonly-field" value={formatarDataBr(parcela.fim)} readOnly />
                    </label>
                  </div>
                ))}
              </div>
            ) : null}

            {!ehEdicao && parcelasResidente.length > 0 && (
              <div className="prototype-ferias-gozo-lista">
                {parcelasResidente.map((parcela) => (
                  <div className="prototype-ferias-gozo-item" key={parcela.id}>
                    <span>
                      {formatarDataBr(parcela.inicio)} a {formatarDataBr(parcela.fim)} ({parcela.dias} dias)
                      {avisosAjusteLts[parcela.id] ? (
                        <div className="prototype-ferias-banner is-alerta" role="note">
                          <i className="pi pi-exclamation-triangle" aria-hidden="true" />
                          <span>{avisosAjusteLts[parcela.id]}</span>
                        </div>
                      ) : null}
                    </span>
                    {!somenteLeitura ? (
                      <button
                        type="button"
                        className="prototype-ferias-icon-btn"
                        title="Remover etapa"
                        onClick={() => removerParcelaResidente(parcela.id)}
                      >
                        <i className="pi pi-trash" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

          </>
        )}

        {bloqueioAuxilioTransporte ? (
          <div className="prototype-ferias-erro-bloqueio" style={{ marginTop: 12, background: "#fffbeb", borderColor: "#fde68a", color: "#92400e" }}>
            {ehEstagiario ? "Estagiário" : "Residente técnico"}: durante o usufruto a bolsa não é descontada, mas o
            auxílio-transporte é <strong>bloqueado</strong> automaticamente ao validar.
          </div>
        ) : null}

        {ehEstagiario ? (
          <small className="prototype-ferias-gozo-ajuda" style={{ display: "block", marginTop: 8 }}>
            A gestão de pessoas deve controlar o saldo para evitar acúmulo de recesso não usufruído em caso de
            prorrogação do contrato. Se o estagiário for desligado sem ter usufruído, recebe excepcionalmente o
            proporcional em dinheiro na folha (IN 007/2022/SEPLAG).
          </small>
        ) : null}
      </div>

      {!somenteLeitura && <AnexoFerias label={ehEdicao ? "Justificativa formal da alteração" : "Documento / despacho formal do recesso"} onChange={setDocumento} />}

      </div>

      <div className="prototype-vinculo-form prototype-ferias-lancamento-acoes" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <BotaoVoltarSeplag type="button" label="Voltar" onClick={onCancelar} />
        {!somenteLeitura ? <BotaoSalvarSeplag type="button" label={ehEdicao ? "Salvar alteração" : "Salvar solicitação"} onClick={salvar} /> : null}
      </div>
    </div>
  );
}

/** Detalhes extras de um evento de suspensão, para exibir no sub-card do histórico. */
function detalhesSuspensaoHistorico(evento: HistoricoEventoFerias): { rotulo: string; valor: string }[] {
  const itens: { rotulo: string; valor: string }[] = [];
  if (evento.feriasOriginalInicio && evento.feriasOriginalFim) {
    itens.push({ rotulo: "Período de férias original", valor: `${formatarDataBr(evento.feriasOriginalInicio)} a ${formatarDataBr(evento.feriasOriginalFim)}` });
  }
  if (evento.fundamentoSuspensao) {
    itens.push({ rotulo: "Fundamento", valor: evento.fundamentoSuspensao === "ART_16" ? "Art. 16 — licença (gestante/adotante/paternidade)" : "Art. 17 — superior interesse público" });
  }
  // Início, fim e duração da suspensão numa única linha.
  if (evento.suspensaoInicio || evento.suspensaoFim) {
    const periodo = `${evento.suspensaoInicio ? formatarDataBr(evento.suspensaoInicio) : "—"} a ${evento.suspensaoFim ? formatarDataBr(evento.suspensaoFim) : "—"}`;
    const duracao = evento.suspensaoDias ? ` (${evento.suspensaoDias} dia${evento.suspensaoDias === 1 ? "" : "s"})` : "";
    itens.push({ rotulo: "Suspensão", valor: `${periodo}${duracao}` });
  }
  // Data em que o servidor VOLTA a gozar as férias (retorno ao usufruto):
  // Art. 16 = 1º dia útil após a licença (dataRetomada); Art. 17 = dia seguinte ao fim da suspensão.
  if (evento.dataRetomada) {
    itens.push({ rotulo: "Retorno às férias", valor: `${formatarDataBr(evento.dataRetomada)} (1º dia útil após a licença — Art. 16)` });
  } else if (evento.fundamentoSuspensao === "ART_17" && evento.suspensaoFim) {
    itens.push({ rotulo: "Retorno às férias", valor: `${formatarDataBr(calcularFim(evento.suspensaoFim, 2))} (dia seguinte ao fim da suspensão — Art. 17)` });
  }
  // Data em que as férias TERMINAM depois de prorrogadas pelos dias suspensos (direito preservado).
  if (evento.novaDataTerminoFerias) {
    itens.push({ rotulo: "Nova data de término das férias", valor: `${formatarDataBr(evento.novaDataTerminoFerias)} (prorrogado pelos dias suspensos)` });
  }
  if (evento.aprovacaoEtapa) {
    itens.push({ rotulo: "Fluxo de aprovação", valor: evento.aprovacaoEtapa });
  }
  // Impacto na folha (em dias, por competência) calculado pelo motor — sem valores (R$).
  evento.impactoFolha?.forEach((impacto, indice) => {
    itens.push({ rotulo: indice === 0 ? "Impacto na folha" : "", valor: impacto.descricao });
  });
  return itens;
}

/** Painel visual da suspensão: barra de tempo (férias originais × suspensão × novo gozo) e os
 * três cards de resumo (suspensão, retorno, novo término). Substitui a lista de detalhes no
 * histórico quando o evento tem o período da suspensão. */
function PainelImpactoSuspensao({ evento }: Readonly<{ evento: HistoricoEventoFerias }>) {
  const ini = evento.feriasOriginalInicio;
  const fimOrig = evento.feriasOriginalFim;
  const susIni = evento.suspensaoInicio;
  const susFim = evento.suspensaoFim;
  const retorno = evento.dataRetomada ?? (evento.fundamentoSuspensao === "ART_17" && susFim ? calcularFim(susFim, 2) : undefined);
  const novoTermino = evento.novaDataTerminoFerias;
  if (!ini || !fimOrig || !susIni || !susFim) return null;

  // Escala da linha do tempo: do menor início ao maior fim entre os três períodos.
  const datas = [ini, fimOrig, susIni, susFim, retorno, novoTermino].filter(Boolean) as string[];
  const min = datas.reduce((a, b) => (a < b ? a : b));
  const max = datas.reduce((a, b) => (a > b ? a : b));
  const total = Math.max(1, diasEntre(min, max));
  const pct = (d: string) => `${(diasEntre(min, d) / total) * 100}%`;
  const faixa = (de: string, ate: string) => ({ left: pct(de), width: `calc(${pct(ate)} - ${pct(de)})` });
  const art = evento.fundamentoSuspensao === "ART_16" ? "Art. 16" : "Art. 17";
  // dd/mm nas faixas (compacto).
  const curto = (d: string) => formatarDataBr(d).slice(0, 5);

  return (
    <div className="gl-suspensao-painel">
      <span className="gl-suspensao-painel-titulo"><i className="pi pi-chart-bar" aria-hidden="true" /> Impacto no período</span>
      <div className="gl-suspensao-timeline">
        <div className="gl-suspensao-trilha">
          <span className="gl-suspensao-rotulo-trilha">Férias originais</span>
          <div className="gl-suspensao-faixa"><span className="gl-suspensao-linha gl-is-original" style={faixa(ini, fimOrig)}>{curto(ini)} a {curto(fimOrig)}</span></div>
        </div>
        <div className="gl-suspensao-trilha">
          <span className="gl-suspensao-rotulo-trilha">Suspensão</span>
          <div className="gl-suspensao-faixa"><span className="gl-suspensao-linha gl-is-suspensao" style={faixa(susIni, susFim)}>{curto(susIni)} a {curto(susFim)}</span></div>
        </div>
        {retorno && novoTermino ? (
          <div className="gl-suspensao-trilha">
            <span className="gl-suspensao-rotulo-trilha">Novo gozo</span>
            <div className="gl-suspensao-faixa"><span className="gl-suspensao-linha gl-is-novo" style={faixa(retorno, novoTermino)}>{curto(retorno)} a {curto(novoTermino)}</span></div>
          </div>
        ) : null}
      </div>
      {retorno ? (
        <p className="gl-suspensao-resumo">
          <i className="pi pi-info-circle" aria-hidden="true" />
          <span>
            Retorno às férias dia <strong>{formatarDataBr(retorno)}</strong> ({art}).
            {novoTermino ? <> Prorrogado pelos {evento.suspensaoDias ?? 0} dias suspensos — novo término <strong>{formatarDataBr(novoTermino)}</strong>.</> : null}
          </span>
        </p>
      ) : null}
    </div>
  );
}

/** Dados do remanejamento para o painel: usa o campo estruturado quando existe; senão, extrai do
 * texto da justificativa ("Período anterior: dd/mm/aaaa a dd/mm/aaaa (N dias). Novo período: ...")
 * — garante o painel também para eventos antigos salvos antes do campo estruturado. */
function dadosRemanejamento(evento: HistoricoEventoFerias): NonNullable<HistoricoEventoFerias["remanejamento"]> | null {
  if (evento.remanejamento) return evento.remanejamento;
  if (evento.acao !== "remanejamento" || !evento.justificativa) return null;
  const trecho = (rotulo: string) => {
    const m = evento.justificativa!.match(new RegExp(`${rotulo}:\\s*(\\d{2}/\\d{2}/\\d{4})\\s*a\\s*(\\d{2}/\\d{2}/\\d{4})\\s*\\((\\d+)`));
    if (!m) return null;
    const iso = (br: string) => br.split("/").reverse().join("-");
    return { inicio: iso(m[1]), fim: iso(m[2]), dias: Number(m[3]) };
  };
  const antes = trecho("Período anterior");
  const depois = trecho("Novo período");
  if (!antes || !depois) return null;
  return { anteriorInicio: antes.inicio, anteriorFim: antes.fim, anteriorDias: antes.dias, novoInicio: depois.inicio, novoFim: depois.fim, novoDias: depois.dias };
}

/** Painel visual do remanejamento de datas: período anterior (tachado) → novo período, com a
 * diferença em dias ("X dias antes/depois") e a nota de duração mantida ou alterada. */
function PainelRemanejamento({ dados }: Readonly<{ dados: NonNullable<HistoricoEventoFerias["remanejamento"]> }>) {
  const diff = diasEntre(dados.anteriorInicio, dados.novoInicio);
  const sentido = diff === 0 ? "mesma data de início" : `${Math.abs(diff)} dia${Math.abs(diff) === 1 ? "" : "s"} ${diff < 0 ? "antes" : "depois"}`;
  const duracao = dados.novoDias === dados.anteriorDias ? "duração mantida" : `duração alterada (${dados.anteriorDias} → ${dados.novoDias} dias)`;
  return (
    <div className="gl-remanejo-painel">
      <span className="gl-remanejo-titulo">Alteração do período</span>
      <div className="gl-remanejo-fluxo">
        <article className="gl-remanejo-card gl-is-anterior">
          <span>Período anterior</span>
          <strong><s>{formatarDataBr(dados.anteriorInicio)} – {formatarDataBr(dados.anteriorFim)}</s></strong>
          <small>{dados.anteriorDias} dia{dados.anteriorDias === 1 ? "" : "s"}</small>
        </article>
        <div className="gl-remanejo-seta" aria-hidden="true">
          <i className="pi pi-arrow-right" />
          <em>{sentido}</em>
        </div>
        <article className="gl-remanejo-card gl-is-novo">
          <span>Novo período</span>
          <strong>{formatarDataBr(dados.novoInicio)} – {formatarDataBr(dados.novoFim)}</strong>
          <small>{dados.novoDias} dia{dados.novoDias === 1 ? "" : "s"} · {duracao}</small>
        </article>
      </div>
    </div>
  );
}

/** Texto do evento de expiração: a chefia não avaliou até a data limite e o sistema encerrou a
 * solicitação; os dias voltam ao saldo do período aquisitivo (registro expirado não consome saldo). */
function justificativaExpiracao(dataLimite?: string): string {
  const limite = dataLimite ? ` em ${formatarDataBr(dataLimite)}` : "";
  return `Prazo de validação pela chefia encerrado${limite} sem avaliação. A solicitação foi encerrada automaticamente e os dias voltaram ao saldo do período aquisitivo.`;
}

/** Evento "Prazo expirado" para a linha do tempo de um registro expirado (data = dia seguinte ao
 * prazo de validação). null quando o registro não está expirado. */
function eventoExpiracaoHistorico(registro: FeriasRegistro): HistoricoEventoFerias | null {
  const expirado = registro.situacao === "PRAZO EXPIRADO" || prazoValidacaoExpirado(registro);
  if (!expirado) return null;
  const limite = registro.dataLimiteValidacaoChefia;
  return {
    situacao: "PRAZO EXPIRADO",
    acao: "expiracao",
    data: limite ? formatarDataBr(adicionarDiasISO(limite, 1)) : "",
    responsavel: "Sistema (verificador automático)",
    justificativa: justificativaExpiracao(limite),
  };
}

/** Data (dd/mm/aaaa) de um carimbo do registro, aceitando "AAAA-MM-DD hh:mm" e "dd/mm/aaaa, hh:mm:ss". */
function dataDoCarimbo(carimbo?: string): string {
  if (!carimbo) return "—";
  const iso = carimbo.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return formatarDataBr(iso[1]);
  const br = carimbo.match(/^(\d{2}\/\d{2}\/\d{4})/);
  return br ? br[1] : carimbo;
}

/** Card do evento "Prazo expirado" no histórico: o que aconteceu (chefia não avaliou até a data
 * limite, sistema encerrou e devolveu os dias ao saldo) e as três etapas — solicitada, sem
 * avaliação da chefia e encerrada automaticamente. */
function PainelPrazoExpirado({ registro, evento }: Readonly<{ registro: FeriasRegistro; evento: HistoricoEventoFerias }>) {
  const limite = registro.dataLimiteValidacaoChefia;
  const dias = diasSolicitados(registro);
  const encerradaEm = limite ? formatarDataBr(adicionarDiasISO(limite, 1)) : dataDoCarimbo(evento.data);
  return (
    <section className="gl-expirado-painel" aria-label="Solicitação encerrada por prazo expirado">
      <span className="gl-expirado-icone" aria-hidden="true"><i className="pi pi-clock" /></span>
      <div className="gl-expirado-conteudo">
        <strong className="gl-expirado-titulo">Solicitação encerrada por prazo expirado</strong>
        <p className="gl-expirado-texto">
          A chefia não avaliou a solicitação{limite ? <> até <strong>{formatarDataBr(limite)}</strong></> : null}
          {registro.tipo !== "Recesso" ? " (prazo máximo: dia 09 do mês anterior ao início do usufruto)" : ""}. O sistema
          encerrou o lançamento e devolveu os <strong>{dias} dias</strong> ao saldo do período aquisitivo.
        </p>
        <ol className="gl-expirado-etapas">
          <li className="is-ok">
            <span className="gl-expirado-etapa-marcador" aria-hidden="true"><i className="pi pi-check" /></span>
            <span><strong>Solicitada</strong><small>{dataDoCarimbo(registro.lancadoEm)}</small></span>
          </li>
          <li className="is-erro">
            <span className="gl-expirado-etapa-marcador" aria-hidden="true"><i className="pi pi-times" /></span>
            <span><strong>Sem avaliação da chefia</strong><small>{limite ? `Prazo até ${formatarDataBr(limite)}` : "Prazo não informado"}</small></span>
          </li>
          <li className="is-fim">
            <span className="gl-expirado-etapa-marcador" aria-hidden="true"><i className="pi pi-stop" /></span>
            <span><strong>Encerrada automaticamente</strong><small>{encerradaEm}</small></span>
          </li>
        </ol>
      </div>
    </section>
  );
}

function ModalHistoricoRegistro({
  registro,
  onFechar,
}: Readonly<{ registro: FeriasRegistro; onFechar: () => void }>) {
  // Fallback para registros sem histórico detalhado: o evento de lançamento sempre nasce em
  // "EM ABERTO" (não na situação atual), para o ícone/rótulo ficarem coerentes com "Lançamento".
  const eventosRegistrados = registro.historico?.length
    ? registro.historico
    : [{ situacao: "EM ABERTO" as const, acao: "lancamento", data: registro.lancadoEm, responsavel: registro.responsavelLancamento, documentos: registro.documentos } as HistoricoEventoFerias];
  // Prazo expirado: a expiração pode ter sido aplicada ao carregar os registros (sem gravar evento).
  // Nesse caso, a linha do tempo mostra o evento "Prazo expirado" reconstruído a partir da data limite.
  const eventoExpiracao = eventoExpiracaoHistorico(registro);
  const eventos =
    eventoExpiracao && !eventosRegistrados.some((evento) => evento.acao === "expiracao")
      ? [...eventosRegistrados, eventoExpiracao]
      : eventosRegistrados;
  // Linha do tempo igual ao "Histórico de Lançamento" da Gestão de Licenças: eventos em ordem
  // decrescente (mais recente no topo) e o lançamento original sempre por último (marcador verde).
  // Se o histórico salvo não trouxer o lançamento (ex.: registros antigos quitados que gravaram só
  // a quitação), reconstrói o lançamento a partir dos dados do registro, para a linha do tempo
  // nunca ficar sem o ponto inicial.
  const lancamento =
    eventos.find((evento) => evento.acao === "lancamento") ??
    ({ situacao: "EM ABERTO", acao: "lancamento", data: registro.lancadoEm, responsavel: registro.responsavelLancamento, documentos: registro.documentos } as HistoricoEventoFerias);
  const alteracoes = [...eventos.filter((evento) => evento.acao !== "lancamento")].reverse();

  return (
    <ModalSeplag
      visible
      fechar={onFechar}
      titulo="Histórico de Lançamento"
      hideFooter
      tamanho="920px"
    >
      <div className="col-12 gl-historico-conteudo">
      <section className="gl-historico-servidor" aria-label="Dados do registro">
        <header>
          <strong>{registro.servidorNome}</strong>
          <span>Matrícula: <b>{registro.matricula}</b></span>
          <span>Vínculo: <b>{registro.numeroVinculo ?? "1"}</b></span>
        </header>
        <dl>
          <div><dt>Órgão/Unidade de lotação</dt><dd>{registro.orgao}{registro.setor ? ` / ${registro.setor}` : ""}</dd></div>
          <div><dt>Cargo</dt><dd>{registro.cargo}</dd></div>
          <div><dt>Período aquisitivo</dt><dd>{periodoAquisitivoLabel(registro)}</dd></div>
          <div><dt>Tipo de vínculo</dt><dd><span className="gl-historico-vinculo">{registro.tipoVinculo}</span></dd></div>
        </dl>
      </section>
      <h3 className="gl-historico-heading"><i className="pi pi-history" aria-hidden="true" /> Linha do tempo de alterações</h3>
      <ol className="gl-historico-timeline">
        {alteracoes.map((evento, indice) => {
          const detalhes = detalhesSuspensaoHistorico(evento);
          // Evento de suspensão com período completo: usa o painel visual (barra de tempo + cards).
          const temPainel = Boolean(evento.suspensaoInicio && evento.suspensaoFim && evento.feriasOriginalInicio && evento.feriasOriginalFim);
          const remanejo = dadosRemanejamento(evento);
          const temRemanejo = Boolean(remanejo);
          const temDetalhes = evento.acao === "expiracao" || Boolean(evento.justificativa?.trim()) || detalhes.length > 0 || Boolean(evento.documentos?.length) || temPainel || temRemanejo;
          const estilo = estiloAcaoHistorico(evento.acao);
          // Nome e cargo do ator: no lançamento usa o servidor da solicitação; nos demais, o mock
          // do perfil (Gestor/Aprovador). Sistema/automático não tem pessoa.
          const perfilAtor = evento.acao === "lancamento" ? perfilDoLancamento(registro, evento.responsavel) : perfilDoResponsavel(evento.responsavel);
          const mockAtor = evento.responsavel?.startsWith("Gestor") ? USUARIO_ATOR_MOCK.Gestor : evento.responsavel?.startsWith("Aprovador") ? USUARIO_ATOR_MOCK.Aprovador : null;
          const nomeAtor = evento.acao === "lancamento" ? registro.servidorNome : mockAtor?.nome ?? (perfilAtor ? evento.responsavel : "Sistema");
          const cargoAtor = evento.acao === "lancamento" ? registro.cargo : mockAtor?.cargo;
          const matriculaAtor = evento.responsavelMatricula ?? (evento.acao === "lancamento" ? registro.matricula : undefined);
          const vinculoAtor = evento.responsavelVinculo ?? (evento.acao === "lancamento" ? registro.tipoVinculo : undefined);
          return (
            <li key={`${evento.data}-${indice}`} className={`gl-historico-item is-${estilo.tom}`}>
              <span className="gl-historico-marcador" aria-hidden="true"><i className={`pi ${estilo.icone}`} /></span>
              <div className="gl-historico-evento">
                <strong>{rotuloAcaoHistorico(evento.acao, evento.situacao)}</strong>
                <span className={`prototype-ferias-badge is-${classeSituacao(evento.situacao)}`}>{rotuloSituacao(evento.situacao)}</span>
                <time dateTime={evento.data}>{evento.data}</time>
              </div>
              <div className="gl-historico-ator">
                <span className="gl-historico-avatar" aria-hidden="true">{iniciaisAtor(String(nomeAtor))}</span>
                <div className="gl-historico-ator-dados">
                  <p className="gl-historico-ator-linha">
                    <span className="gl-historico-ator-acao">{verboAcaoHistorico(evento.acao)}</span>
                    <strong>{nomeAtor}</strong>
                    {perfilAtor ? <span className={`gl-historico-perfil ${perfilAtor.classe}`}>{perfilAtor.rotulo}</span> : null}
                  </p>
                  {(cargoAtor || matriculaAtor) ? (
                    <p className="gl-historico-ator-meta">
                      {[cargoAtor, matriculaAtor ? `Matrícula ${matriculaAtor}` : null, vinculoAtor].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                </div>
              </div>
              {temDetalhes ? (
                <div className="gl-historico-detalhes">
                  {remanejo ? <PainelRemanejamento dados={remanejo} /> : null}
                  {evento.acao === "expiracao" ? <PainelPrazoExpirado registro={registro} evento={evento} /> : null}
                  {evento.justificativa?.trim() && !temRemanejo && evento.acao !== "expiracao" ? (
                    <div className="gl-historico-justificativa">
                      <span className="gl-historico-justificativa-titulo"><i className="pi pi-comment" aria-hidden="true" /> Justificativa</span>
                      <p>{evento.justificativa.trim()}</p>
                    </div>
                  ) : null}
                  {temPainel ? <PainelImpactoSuspensao evento={evento} /> : null}
                  {!temPainel && detalhes.length > 0 ? (
                    <dl className="gl-historico-detalhes-lista">
                      {detalhes.map((item) => (
                        <div key={item.rotulo}><dt>{item.rotulo}</dt><dd>{item.valor}</dd></div>
                      ))}
                    </dl>
                  ) : null}
                  {evento.documentos?.length ? (
                    <>
                      <h4><i className="pi pi-paperclip" aria-hidden="true" /> Documento comprobatório</h4>
                      {evento.documentos.map((documento) => (
                        <CartaoDocumentoFerias key={documento.id} documento={documento} />
                      ))}
                    </>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
        {lancamento ? (() => {
          const inicio = inicioUsufruto(registro);
          const fim = fimUsufruto(registro);
          const dias = registro.parcelas.reduce((s, p) => s + p.dias, 0);
          const perfilAtor = perfilDoLancamento(registro, lancamento.responsavel);
          return (
          <li className="gl-historico-item gl-historico-original is-verde">
            <span className="gl-historico-marcador" aria-hidden="true"><i className="pi pi-flag-fill" /></span>
            <div className="gl-historico-evento">
              <strong>Lançamento original</strong>
              <span className="prototype-ferias-badge is-em-aberto">Criado</span>
              <time dateTime={lancamento.data}>{lancamento.data}</time>
            </div>
            <div className="gl-historico-ator">
              <span className="gl-historico-avatar" aria-hidden="true">{iniciaisAtor(registro.servidorNome)}</span>
              <div className="gl-historico-ator-dados">
                <p className="gl-historico-ator-linha">
                  <span className="gl-historico-ator-acao">Agendado por</span>
                  <strong>{registro.servidorNome}</strong>
                  <span className={`gl-historico-perfil ${perfilAtor.classe}`}>{perfilAtor.rotulo}</span>
                </p>
                <p className="gl-historico-ator-meta">
                  {[registro.cargo, `Matrícula ${registro.matricula}`, registro.tipoVinculo].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            {inicio && fim ? (
              <div className="gl-historico-detalhes">
                <div className="gl-periodo-card">
                  <i className="pi pi-calendar" aria-hidden="true" />
                  <div>
                    <span>Período de usufruto</span>
                    <strong>{formatarDataBr(inicio)} a {formatarDataBr(fim)} · {dias} dia{dias === 1 ? "" : "s"}</strong>
                  </div>
                </div>
              </div>
            ) : null}
          </li>
          );
        })() : null}
      </ol>
      </div>
    </ModalSeplag>
  );
}

function ModalGerenciarSubstituicao({
  registro,
  onFechar,
  onSalvar,
}: Readonly<{ registro: FeriasRegistro; onFechar: () => void; onSalvar: (substitutos: SubstitutoFerias[]) => void }>) {
  const [confirmados, setConfirmados] = useState<SubstitutoFerias[]>(registro.substitutos);
  const [linhas, setLinhas] = useState<Array<Omit<SubstitutoFerias, "id">>>([
    { nome: "", inicio: "", fim: "", portaria: "" },
  ]);

  const totalDias = diasSolicitados(registro);
  const periodo = periodoUsufruto(registro);

  const atualizarLinha = (indice: number, campo: keyof Omit<SubstitutoFerias, "id">, valor: string) => {
    setLinhas((atual) => atual.map((linha, i) => (i === indice ? { ...linha, [campo]: valor } : linha)));
  };

  const removerLinha = (indice: number) => {
    setLinhas((atual) => (atual.length > 1 ? atual.filter((_, i) => i !== indice) : atual));
  };

  const adicionarLinha = () => {
    setLinhas((atual) => [...atual, { nome: "", inicio: "", fim: "", portaria: "" }]);
  };

  const confirmarLinha = (indice: number) => {
    const linha = linhas[indice];
    if (!linha.nome.trim() || !linha.inicio || !linha.fim || !linha.portaria.trim()) return;
    if (linha.fim < linha.inicio) return;

    setConfirmados((atual) => [...atual, { id: gerarId(), ...linha }]);
    setLinhas((atual) => {
      const restantes = atual.filter((_, i) => i !== indice);
      return restantes.length ? restantes : [{ nome: "", inicio: "", fim: "", portaria: "" }];
    });
  };

  const removerConfirmado = (id: number) => {
    setConfirmados((atual) => atual.filter((substituto) => substituto.id !== id));
  };

  return (
    <ModalSeplag
      visible
      fechar={onFechar}
      titulo="Gerenciar substituição"
      hideFooter
      tamanho="820px"
    >
      <div style={{ width: "100%" }}>
        <div className="prototype-ferias-form-section">
          <p>
            <strong>{registro.servidorNome}</strong> · {periodo} · {totalDias} dia(s)
          </p>
        </div>

        {confirmados.length ? (
          <table className="prototype-ferias-sub-grid">
            <thead>
              <tr>
                <th>Substituto</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Portaria</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {confirmados.map((substituto) => (
                <tr key={substituto.id}>
                  <td>{substituto.nome}</td>
                  <td>{formatarDataBr(substituto.inicio)}</td>
                  <td>{formatarDataBr(substituto.fim)}</td>
                  <td>{substituto.portaria}</td>
                  <td>
                    <button type="button" className="prototype-ferias-icon-btn" title="Remover" onClick={() => removerConfirmado(substituto.id)}>
                      <i className="pi pi-trash" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {linhas.map((linha, indice) => (
          <div className="prototype-ferias-sub-nova-linha" key={indice}>
            <label>
              <span>Substituto (matrícula ou nome)</span>
              <input value={linha.nome} onChange={(event) => atualizarLinha(indice, "nome", event.target.value)} />
            </label>
            <label>
              <span>Início</span>
              <input type="date" value={linha.inicio} onChange={(event) => atualizarLinha(indice, "inicio", event.target.value)} />
            </label>
            <label>
              <span>Fim</span>
              <input type="date" value={linha.fim} onChange={(event) => atualizarLinha(indice, "fim", event.target.value)} />
            </label>
            <label>
              <span>Portaria (DOE)</span>
              <input value={linha.portaria} onChange={(event) => atualizarLinha(indice, "portaria", event.target.value)} />
            </label>
            <button type="button" className="prototype-ferias-icon-btn" title="Salvar esta linha" onClick={() => confirmarLinha(indice)}>
              <i className="pi pi-check" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="prototype-ferias-icon-btn"
              title="Remover linha"
              disabled={linhas.length === 1}
              onClick={() => removerLinha(indice)}
            >
              <i className="pi pi-times" aria-hidden="true" />
            </button>
          </div>
        ))}

        <button type="button" className="prototype-ferias-sub-add" onClick={adicionarLinha}>
          <i className="pi pi-plus" aria-hidden="true" />
          Adicionar substituto
        </button>

        <div className="prototype-vinculo-form" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button type="button" className="prototype-vinculo-back" onClick={onFechar}>
            Fechar
          </button>
          <button type="button" className="prototype-ferias-btn-primario" onClick={() => onSalvar(confirmados)}>
            <i className="pi pi-check" aria-hidden="true" />
            Salvar substituição(ões)
          </button>
        </div>
      </div>
    </ModalSeplag>
  );
}


const STATUS_META: Record<AcaoStatus, { titulo: string; descricao: string; severity: "success" | "danger" | "warning"; icone: string; botao: string; novaSituacao: SituacaoFerias }> = {
  validar: {
    titulo: "Validar solicitação (chefia)",
    descricao: "A chefia confirma o agendamento e marca o abono constitucional quando aplicável. O registro passa para Agendada e libera a substituição, quando cabível.",
    severity: "success",
    icone: "pi pi-check",
    botao: "Validar",
    novaSituacao: "EM ABERTO",
  },
  rejeitar: {
    titulo: "Rejeitar solicitação",
    descricao: "Sem validação da chefia no prazo (ou por decisão manual), o sistema rejeita a solicitação e devolve o saldo integral ao servidor.",
    severity: "danger",
    icone: "pi pi-times",
    botao: "Rejeitar",
    novaSituacao: "REPROVADO",
  },
  suspender: {
    titulo: "Suspender férias — superior interesse público (Art. 17)",
    descricao: "Suspensão por superior interesse público (Art. 17): interrompe o usufruto e devolve os dias ao saldo para novo agendamento. A suspensão por licença (Art. 16) não é lançada aqui — ela chega automaticamente da Gestão de Licenças e Afastamentos.",
    severity: "warning",
    icone: "pi pi-pause",
    botao: "Suspender",
    novaSituacao: "SUSPENSO",
  },
  reativar: {
    titulo: "Reabrir agendamento",
    descricao: "A data original não é restaurada automaticamente — informe a nova data de início abaixo. A data fim é recalculada com a mesma quantidade de dias do agendamento original, que fica preservado no histórico.",
    severity: "success",
    icone: "pi pi-replay",
    botao: "Reabrir agendamento",
    // Mapeamento do RN de reabertura: "Em Elaboração/Aguardando Homologação" não existem como
    // status à parte neste protótipo — a nova data exige novo ciclo de validação da chefia,
    // então reaproveitamos AGUARDANDO VALIDAÇÃO (mesma fila de Aprovações).
    novaSituacao: "AGUARDANDO VALIDAÇÃO",
  },
  aprovar_suspensao: {
    titulo: "Validar suspensão — superior interesse público (Art. 17)",
    descricao: "O órgão central confere a documentação obrigatória e valida a suspensão. Ao concluir a última etapa, a suspensão é efetivada e o motor de folha recalcula o impacto por competência.",
    severity: "success",
    icone: "pi pi-check",
    botao: "Validar suspensão",
    novaSituacao: "SUSPENSO",
  },
  rejeitar_suspensao: {
    titulo: "Rejeitar suspensão — superior interesse público (Art. 17)",
    descricao: "A suspensão não é efetivada: o usufruto segue normalmente e nada muda na folha. A justificativa fica no histórico.",
    severity: "danger",
    icone: "pi pi-times",
    botao: "Rejeitar suspensão",
    novaSituacao: "EM ABERTO",
  },
};

function ModalConfirmarStatus({
  registro,
  acao,
  onFechar,
  onConfirmar,
  loteId,
  parcelaId,
  fluxos,
}: Readonly<{
  registro: FeriasRegistro;
  acao: AcaoStatus;
  onFechar: () => void;
  onConfirmar: (
    novaSituacao: SituacaoFerias,
    justificativa?: string,
    documento?: DocumentoFerias,
    novasParcelas?: ParcelaFerias[],
    historicoReabertura?: { inicioOriginal: string; fimOriginal: string; reabertoEm: string },
    dadosSuspensao?: DadosSuspensao,
    entradaFluxo?: EntradaFluxoUI,
  ) => void;
  loteId?: string;
  parcelaId?: number;
  fluxos: ConfiguracaoFluxo[];
}>) {
  const meta = STATUS_META[acao];
  const ehSuspensao = acao === "suspender";
  // Parcela-alvo da suspensão: quando o registro tem mais de uma parcela, a suspensão incide
  // apenas sobre a parcela selecionada na linha (não sobre o registro inteiro).
  const parcelaAlvo = parcelaId != null ? registro.parcelas.find((p) => p.id === parcelaId) ?? null : null;
  const ehDecisaoSuspensao = acao === "aprovar_suspensao" || acao === "rejeitar_suspensao";
  const pendente = registro.suspensaoPendente;
  const aguardandoPublicacao = pendente?.processo.status === "AGUARDANDO_PUBLICACAO";
  const [documentacaoConferida, setDocumentacaoConferida] = useState(false);
  const [publicacaoNumero, setPublicacaoNumero] = useState("");
  const [publicacaoData, setPublicacaoData] = useState("");
  const exigeJustificativa = acao === "rejeitar" || acao === "suspender" || acao === "reativar" || acao === "rejeitar_suspensao";
  const exigeAnexo = acao === "suspender" || acao === "reativar";
  const ehReabertura = acao === "reativar";
  const totalDiasOriginal = registro.parcelas.reduce((total, parcela) => total + parcela.dias, 0);
  const [documento, setDocumento] = useState<DocumentoFerias | null>(null);
  const [justificativa, setJustificativa] = useState("");
  const [novaDataInicioIso, setNovaDataInicioIso] = useState("");
  // RN-SUS: a suspensão manual aqui é SEMPRE por superior interesse público (Art. 17). A
  // suspensão por licença (Art. 16) chega automaticamente da Gestão de Licenças e Afastamentos
  // e não é lançada neste modal.
  const [inicioSuspensaoIso, setInicioSuspensaoIso] = useState(dataLocalISO());
  const [fimSuspensaoIso, setFimSuspensaoIso] = useState("");
  const [erro, setErro] = useState("");
  const novaDataFimIso = novaDataInicioIso ? calcularFim(novaDataInicioIso, totalDiasOriginal) : "";

  // --- Derivados da suspensão (Art. 17) ---
  // Duração = dias corridos entre início e término (inclusivo).
  const duracaoSuspensao =
    inicioSuspensaoIso && fimSuspensaoIso && fimSuspensaoIso >= inicioSuspensaoIso
      ? diasEntre(inicioSuspensaoIso, fimSuspensaoIso) + 1
      : 0;
  // Período-base da suspensão: a parcela escolhida (se houver) ou o registro inteiro.
  const inicioOriginalFerias = parcelaAlvo?.inicio ?? inicioUsufruto(registro) ?? "";
  const fimOriginalFerias = parcelaAlvo?.fim ?? fimUsufruto(registro) ?? "";
  const parcelasBase = parcelaAlvo ? [parcelaAlvo] : registro.parcelas;
  // Saldo usufruído até o início da suspensão (dias já gozados), para exibição.
  const diasUsufruidosAteSuspensao = parcelasBase
    .filter((p) => p.inicio < inicioSuspensaoIso)
    .reduce((s, p) => {
      const ate = inicioSuspensaoIso < p.fim ? inicioSuspensaoIso : p.fim;
      return s + Math.max(0, diasEntre(p.inicio, ate) + (ate >= p.fim ? 1 : 0));
    }, 0);
  // Prazo em dias (para validação RN-SUS-07) derivado das datas selecionadas.
  const prazoArt17 = duracaoSuspensao;

  const saldoTotalPeriodo = registro.saldoFerias ?? totalDiasOriginal;
  const saldoRestantePeriodo = ehReabertura ? saldoRestanteParaReabertura(registro, carregarRegistros()) : saldoTotalPeriodo;

  // Entrada do motor para a prévia: só a parcela escolhida (ou a única parcela do registro).
  const entradaPrevia = {
    parcelas: parcelasBase.map((p) => ({ inicio: p.inicio, fim: p.fim })),
    fundamento: "ART_17" as const,
    suspensaoInicio: inicioSuspensaoIso,
    suspensaoFim: fimSuspensaoIso || undefined,
    competenciaFolhaCorrente: dataLocalISO().slice(0, 7),
    adiantamentoPago: registro.adiantamentoPago,
  };
  // RN-MOT-09: a prévia só é calculada com a entrada válida (fim informado, fim ≥ início e
  // início dentro da parcela). Sem gravar eventos.
  const erroEntradaPrevia = ehSuspensao ? validarEntradaSuspensao(entradaPrevia) : null;
  const previaImpacto = ehSuspensao && !erroEntradaPrevia ? calcularImpactoSuspensao(entradaPrevia) : null;
  // RN031: nova data de término e retorno às férias vêm do motor (fonte única).
  const novaDataTerminoFerias = previaImpacto?.novaDataTermino ?? "";
  const retornoFerias = previaImpacto?.retorno ?? "";
  // RN-SUS-09: alerta não bloqueante quando o RETORNO ÀS FÉRIAS (dia seguinte ao fim da
  // suspensão) cai em fim de semana/feriado — não há ajuste automático no Art. 17.
  const retornoEmFimDeSemana = Boolean(retornoFerias) && ehFimDeSemanaOuFeriado(retornoFerias);
  // RN033: o novo período da parcela suspensa não pode sobrepor outra parcela, agendamento ou LTS.
  const conflitoPrevia = previaImpacto
    ? conflitoNovoCalendarioSuspensao(registro, new Set(parcelasBase.map((p) => p.id)), previaImpacto.novasParcelas, previaImpacto.retorno)
    : null;
  const fluxoArt17 = obterFluxo(fluxos, CHAVE_FLUXO_SUSPENSAO_ART17);
  const suspensaoExigeAprovacao = fluxoExigeAprovacao(fluxoArt17);

  const confirmar = () => {
    if (ehDecisaoSuspensao) {
      if (acao === "rejeitar_suspensao") {
        if (!justificativa.trim()) { setErro("Informe a justificativa da rejeição."); return; }
        onConfirmar(meta.novaSituacao, justificativa.trim());
        return;
      }
      if (aguardandoPublicacao) {
        if (!publicacaoNumero.trim() || !publicacaoData) { setErro("Informe o número e a data da publicação no Diário Oficial."); return; }
        onConfirmar(meta.novaSituacao, undefined, undefined, undefined, undefined, undefined, { publicacao: { numero: publicacaoNumero.trim(), data: publicacaoData } });
        return;
      }
      if (pendente?.processo.documentosObrigatorios.length && !documentacaoConferida) {
        setErro("Confirme a conferência da documentação obrigatória antes de validar.");
        return;
      }
      // RN-MOT-09 / RN033: revalida a entrada do motor antes de efetivar — sem data de fim, com
      // início fora da parcela ou com sobreposição do novo período, a suspensão não é efetivada.
      if (pendente) {
        const idsAlvo = new Set(
          pendente.dados.parcelaId != null ? [pendente.dados.parcelaId] : registro.parcelas.map((p) => p.id),
        );
        const entradaEfetivacao = {
          parcelas: registro.parcelas.filter((p) => idsAlvo.has(p.id)).map((p) => ({ inicio: p.inicio, fim: p.fim })),
          fundamento: pendente.dados.fundamento,
          suspensaoInicio: pendente.dados.suspensaoInicio ?? "",
          suspensaoFim: pendente.dados.suspensaoFim,
          licencaFim: pendente.dados.licencaFim,
          competenciaFolhaCorrente: dataLocalISO().slice(0, 7),
        };
        const erroEntrada = validarEntradaSuspensao(entradaEfetivacao);
        if (erroEntrada) { setErro(erroEntrada); return; }
        const resultado = calcularImpactoSuspensao(entradaEfetivacao);
        const conflito = conflitoNovoCalendarioSuspensao(registro, idsAlvo, resultado.novasParcelas, resultado.retorno);
        if (conflito) { setErro(conflito); return; }
      }
      onConfirmar(meta.novaSituacao, undefined, undefined, undefined, undefined, undefined, { documentacaoConferida });
      return;
    }
    if (exigeAnexo && !documento) { setErro('Anexe a justificativa formal.'); return; }
    if (ehSuspensao) {
      const fundamento: FundamentoSuspensao = "ART_17";
      // Registro com várias parcelas: a suspensão incide sobre UMA parcela. Exige a parcela-alvo —
      // nunca suspende as parcelas juntas.
      if (registro.parcelas.length > 1 && !parcelaAlvo) {
        setErro("Este registro tem mais de uma parcela. Feche e use a ação \"Suspender\" na linha da parcela desejada.");
        return;
      }
      if (!inicioSuspensaoIso || !fimSuspensaoIso) {
        setErro("Informe as datas de início e término da suspensão.");
        return;
      }
      if (inicioSuspensaoIso < dataLocalISO()) {
        setErro("A suspensão só pode iniciar a partir de hoje — dias já usufruídos não podem ser suspensos.");
        return;
      }
      if (fimSuspensaoIso < inicioSuspensaoIso) {
        setErro("A data de término da suspensão não pode ser anterior ao início.");
        return;
      }
      // RN-MOT-09: início dentro da parcela (fim e fim ≥ início já conferidos acima).
      if (erroEntradaPrevia) { setErro(erroEntradaPrevia); return; }
      // RN033: novo período da parcela sem sobreposição.
      if (conflitoPrevia) { setErro(conflitoPrevia); return; }
      // RN-SUS-05/07: Art. 17 exige causa detalhada e prazo <= 60 dias. A autorização do dirigente
      // (RN-SUS-06) NÃO é presumida: é conferida pelo órgão central na validação (fluxo de aprovação).
      const validacao = validarSolicitacaoSuspensaoArt17({
        causa: justificativa,
        prazoEstimadoDias: prazoArt17,
      });
      if (!validacao.sucesso) { setErro(validacao.mensagem); return; }
      const dadosSuspensao: DadosSuspensao =
          {
              fundamento,
              // O solicitante é registrado automaticamente pelo perfil que realizou a ação —
              // o histórico já grava o ator (Gestor/Aprovador) via atorHistorico.
              causa: justificativa.trim(),
              prazoEstimadoDias: prazoArt17,
              // Sem fluxo de aprovação (validador desligado) a autorização é considerada dada; com
              // fluxo, só passa a true quando o órgão central valida.
              autorizadoPeloDirigente: !suspensaoExigeAprovacao,
              suspensaoInicio: inicioSuspensaoIso,
              suspensaoFim: fimSuspensaoIso,
              novaDataTerminoFerias: novaDataTerminoFerias || undefined,
              parcelaId: parcelaAlvo?.id,
            };
      onConfirmar(meta.novaSituacao, justificativa.trim(), documento ?? undefined, undefined, undefined, dadosSuspensao);
      return;
    }
    if (exigeJustificativa && !justificativa.trim()) {
      setErro("Informe a justificativa antes de confirmar.");
      return;
    }
    if (ehReabertura) {
      if (!novaDataInicioIso) { setErro("Informe a nova data de início do usufruto."); return; }
      if (novaDataInicioIso <= dataLocalISO()) { setErro("A nova data de início precisa ser futura."); return; }
      if (totalDiasOriginal > saldoRestantePeriodo) {
        setErro(`Saldo insuficiente para reabrir: restam ${saldoRestantePeriodo} dia(s) disponíveis no período aquisitivo — outras solicitações já consumiram parte do saldo liberado pelo cancelamento/suspensão —, mas o agendamento original tinha ${totalDiasOriginal} dia(s).`);
        return;
      }
      // RN reabertura 3.1 / RN003: a nova data não pode conflitar com outro agendamento ativo
      // nem com LTS vigente do servidor (mesmas checagens do lançamento original).
      const conflito = conflitoFeriasServidor(registro.matricula, novaDataInicioIso, novaDataFimIso, registro.id);
      if (conflito) {
        setErro(mensagemConflitoAgendamento(conflito));
        return;
      }
      const conflitoLts = conflitoLtsServidor(registro.matricula, novaDataInicioIso, novaDataFimIso);
      if (conflitoLts) {
        setErro(`LTS vigente de ${formatarDataBr(conflitoLts.inicio)} a ${formatarDataBr(conflitoLts.fim)} no período escolhido. Selecione uma data de início após o fim da LTS.`);
        return;
      }
      const inicioOriginal = inicioUsufruto(registro);
      const fimOriginal = fimUsufruto(registro);
      onConfirmar(
        meta.novaSituacao,
        justificativa.trim(),
        documento ?? undefined,
        [{ id: registro.parcelas[0]?.id ?? gerarId(), inicio: novaDataInicioIso, fim: novaDataFimIso, dias: totalDiasOriginal }],
        inicioOriginal && fimOriginal ? { inicioOriginal, fimOriginal, reabertoEm: dataLocalISO() } : undefined,
      );
      return;
    }
    onConfirmar(meta.novaSituacao,justificativa.trim(),documento ?? undefined);
  };

  return (
    <ModalSeplag
      visible
      fechar={onFechar}
      titulo={
        ehSuspensao ? (
          <span className="gl-historico-titulo-composto">
            <small>SUSPENSÃO DE FÉRIAS</small>
            <span>Superior interesse público <em>— Art. 17</em></span>
          </span>
        ) : (
          meta.titulo
        )
      }
      ariaLabel={meta.titulo}
      hideFooter
      tamanho={ehDecisaoSuspensao ? "940px" : ehSuspensao ? "760px" : "640px"}
    >
      <div className={`prototype-finalizar-efetivo-modal${ehSuspensao || ehDecisaoSuspensao ? " is-compacto" : ""}`}>
        {!ehSuspensao ? <p>{meta.descricao}</p> : null}
        {loteId && <p role="note">A decisão será aplicada ao lote completo <strong>{loteId}</strong>, preservando a avaliação em bloco.</p>}

        {ehSuspensao ? (
          <div className="prototype-ferias-banner" role="note" style={{ background: "#eff6ff", borderColor: "#bfdbfe", color: "#1d4ed8" }}>
            <i className="pi pi-info-circle" aria-hidden="true" />
            <span>
              Interrompe o usufruto e devolve os dias ao saldo para novo agendamento. A suspensão por
              <strong> licença (Art. 16)</strong> não é lançada aqui — ela chega automaticamente da Gestão de
              Licenças e Afastamentos.
            </span>
          </div>
        ) : null}

        <section className="gl-historico-servidor" aria-label="Dados do registro">
          <header>
            <strong>{registro.servidorNome}</strong>
            <span>Matrícula: <b>{registro.matricula}</b></span>
            <span>Vínculo: <b>{registro.numeroVinculo ?? "1"}</b></span>
          </header>
          <dl>
            <div><dt>Órgão/Unidade de lotação</dt><dd>{registro.orgao}{registro.setor ? ` / ${registro.setor}` : ""}</dd></div>
            <div><dt>Cargo</dt><dd>{registro.cargo}</dd></div>
            <div><dt>Período aquisitivo</dt><dd>{periodoAquisitivoLabel(registro)}</dd></div>
            <div><dt>Tipo de vínculo</dt><dd><span className="gl-historico-vinculo">{registro.tipoVinculo}</span></dd></div>
          </dl>
        </section>

        {ehDecisaoSuspensao && pendente ? (
          <section className="gl-suspensao-secao" aria-label="Suspensão solicitada">
            <h4 className="gl-suspensao-secao-titulo">Suspensão solicitada pela setorial</h4>
            {(() => {
              // Evento sintético para reaproveitar os componentes ricos do histórico (painel de
              // impacto e cabeçalho de ator) na tela de validação do aprovador.
              const eventoPendente: HistoricoEventoFerias = {
                situacao: "EM ABERTO",
                acao: "solicitar_suspensao",
                data: pendente.solicitadoEm,
                responsavel: "Gestor",
                responsavelMatricula: USUARIO_ATOR_MOCK.Gestor.matricula,
                responsavelVinculo: USUARIO_ATOR_MOCK.Gestor.vinculo,
                fundamentoSuspensao: pendente.dados.fundamento,
                suspensaoInicio: pendente.dados.suspensaoInicio,
                suspensaoFim: pendente.dados.suspensaoFim,
                suspensaoDias: pendente.dados.prazoEstimadoDias,
                novaDataTerminoFerias: pendente.dados.novaDataTerminoFerias,
                causaSuspensao: pendente.dados.causa,
                feriasOriginalInicio: inicioUsufruto(registro) ?? undefined,
                feriasOriginalFim: fimUsufruto(registro) ?? undefined,
              };
              return (
                <>
                  <div className="gl-historico-ator" style={{ margin: "4px 0 10px" }}>
                    <span className="gl-historico-avatar" aria-hidden="true">{iniciaisAtor(USUARIO_ATOR_MOCK.Gestor.nome)}</span>
                    <div className="gl-historico-ator-dados">
                      <p className="gl-historico-ator-linha">
                        <span className="gl-historico-ator-acao">Registrada por</span>
                        <strong>{USUARIO_ATOR_MOCK.Gestor.nome}</strong>
                        <span className="gl-historico-perfil is-gestor">Perfil Gestor</span>
                      </p>
                      <p className="gl-historico-ator-meta">
                        {[USUARIO_ATOR_MOCK.Gestor.cargo, `Matrícula ${pendente.solicitadoPor.match(/Matrícula\s+(\S+)/)?.[1] ?? USUARIO_ATOR_MOCK.Gestor.matricula}`, "em " + pendente.solicitadoEm].join(" · ")}
                      </p>
                    </div>
                  </div>
                  {eventoPendente.feriasOriginalInicio ? <PainelImpactoSuspensao evento={eventoPendente} /> : null}
                  <div className="gl-historico-detalhes" style={{ marginTop: 10 }}>
                    <h4><i className="pi pi-comment" aria-hidden="true" /> Causa motivadora</h4>
                    <blockquote>“{pendente.dados.causa}”</blockquote>
                  </div>
                </>
              );
            })()}
            {pendente.documento ? <CartaoDocumentoFerias documento={pendente.documento} /> : null}
            {acao === "aprovar_suspensao" && aguardandoPublicacao ? (
              <div className="prototype-ferias-form-grid">
                <label>
                  <span>Nº da publicação no Diário Oficial<em>*</em></span>
                  <input value={publicacaoNumero} onChange={(e) => setPublicacaoNumero(e.target.value)} />
                </label>
                <label>
                  <span>Data da publicação<em>*</em></span>
                  <input type="date" value={publicacaoData} onChange={(e) => setPublicacaoData(e.target.value)} />
                </label>
              </div>
            ) : null}
            {acao === "aprovar_suspensao" && !aguardandoPublicacao && pendente.processo.documentosObrigatorios.length ? (
              <label style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <input type="checkbox" checked={documentacaoConferida} onChange={(e) => setDocumentacaoConferida(e.target.checked)} />
                <span>
                  Conferi a documentação obrigatória: {pendente.processo.documentosObrigatorios.join("; ")}.
                </span>
              </label>
            ) : null}
          </section>
        ) : null}

        {ehReabertura ? (
          <div className="prototype-finalizar-efetivo-termo">
            <span>Período original ({totalDiasOriginal} dias) — preservado no histórico</span>
            <strong>{periodoUsufruto(registro)}</strong>
          </div>
        ) : null}
        {ehReabertura ? (
          <div className="prototype-finalizar-efetivo-termo">
            <span>Saldo restante no período aquisitivo</span>
            <strong style={saldoRestantePeriodo < totalDiasOriginal ? { color: "#b91c1c" } : undefined}>
              {saldoRestantePeriodo} de {saldoTotalPeriodo} dia(s) disponível(is)
              {saldoRestantePeriodo < totalDiasOriginal ? " — insuficiente para os " + totalDiasOriginal + " dias originais" : ""}
            </strong>
          </div>
        ) : null}

        {ehReabertura ? (
          <div className="prototype-ferias-form-grid">
            <label>
              <span>Nova data de início do usufruto<em>*</em></span>
              <input
                type="date"
                value={novaDataInicioIso}
                onChange={(event) => setNovaDataInicioIso(event.target.value)}
                min={dataLocalISO()}
              />
            </label>
            <label>
              <span>Fim (recalculado, {totalDiasOriginal} dias)</span>
              <input className="prototype-ferias-readonly-field" value={formatarDataBr(novaDataFimIso)} readOnly />
            </label>
          </div>
        ) : null}

        {ehSuspensao ? (
          <section className="gl-suspensao-secao">
            <h4 className="gl-suspensao-secao-titulo">{parcelaAlvo ? "Parcela a suspender" : "Período de férias original"}</h4>
            <div className="gl-suspensao-destaque">
              <strong>{inicioOriginalFerias && fimOriginalFerias ? `${formatarDataBr(inicioOriginalFerias)} a ${formatarDataBr(fimOriginalFerias)}` : periodoUsufruto(registro)}</strong>
              <span className="gl-suspensao-destaque-info">
                {parcelaAlvo ? `Parcela de ${parcelaAlvo.dias} dias · ` : ""}Saldo usufruído: <b>{diasUsufruidosAteSuspensao} dias</b>
              </span>
            </div>
            {registro.parcelas.length > 1 && !parcelaAlvo ? (
              <p className="gl-suspensao-nota" style={{ color: "#b45309" }}>
                Este registro tem {registro.parcelas.length} parcelas. Selecione a ação "Suspender" na linha da parcela desejada para suspender apenas aquele período.
              </p>
            ) : null}
          </section>
        ) : null}

        {ehSuspensao ? (
          <section className="gl-suspensao-secao">
            <div className="prototype-ferias-form-grid">
              <label>
                <span>Início da suspensão<em>*</em></span>
                <input
                  type="date"
                  value={inicioSuspensaoIso}
                  min={dataLocalISO()}
                  onChange={(event) => setInicioSuspensaoIso(event.target.value)}
                />
              </label>
              <label>
                <span>Término da suspensão<em>*</em></span>
                <input
                  type="date"
                  value={fimSuspensaoIso}
                  min={inicioSuspensaoIso || dataLocalISO()}
                  onChange={(event) => setFimSuspensaoIso(event.target.value)}
                />
              </label>
            </div>

            <div className="gl-suspensao-destaque">
              <span>Duração da suspensão</span>
              <strong style={duracaoSuspensao > 60 ? { color: "#b91c1c" } : undefined}>
                {duracaoSuspensao} dia(s){duracaoSuspensao > 60 ? " — excede o máximo de 60 dias (Art. 17)" : ""}
              </strong>
            </div>
          </section>
        ) : null}

        {ehSuspensao ? (
          <section className="gl-suspensao-secao">
            <label className="prototype-finalizar-efetivo-upload" style={{ margin: 0 }}>
              <strong>Causa motivadora detalhada<em>*</em></strong>
              <textarea
                rows={3}
                value={justificativa}
                onChange={(event) => setJustificativa(event.target.value)}
                placeholder="Descreva detalhadamente a causa de superior interesse público"
                style={{ padding: "8px 10px", border: "1px solid #c8d6e5", borderRadius: 5, font: "inherit", resize: "vertical" }}
              />
            </label>
          </section>
        ) : exigeJustificativa ? (
          <label className="prototype-finalizar-efetivo-upload">
            <strong>Justificativa<em>*</em></strong>
            <textarea
              rows={3}
              value={justificativa}
              onChange={(event) => setJustificativa(event.target.value)}
              placeholder="Descreva o motivo"
              style={{ padding: "8px 10px", border: "1px solid #c8d6e5", borderRadius: 5, font: "inherit", resize: "vertical" }}
            />
          </label>
        ) : null}

        {ehSuspensao && novaDataTerminoFerias ? (
          <section className="gl-suspensao-secao is-destaque-azul">
            <div className="gl-suspensao-destaque">
              <span className="gl-suspensao-destaque-rotulo">Nova data de término das férias</span>
              <strong>{formatarDataBr(novaDataTerminoFerias)}</strong>
            </div>
            <p className="gl-suspensao-nota">
              Retorno às férias em {formatarDataBr(retornoFerias)}. Só esta parcela é prorrogada pelos {previaImpacto?.diasSuspensos ?? duracaoSuspensao} dia(s) suspensos; os dias já usufruídos e as demais parcelas não mudam.
            </p>
          </section>
        ) : null}
        {ehSuspensao && retornoEmFimDeSemana ? (
          <div className="prototype-ferias-banner is-alerta" role="note">
            <i className="pi pi-exclamation-triangle" aria-hidden="true" />
            <span>
              <strong>Atenção:</strong> o retorno às férias ({formatarDataBr(retornoFerias)}, dia seguinte ao fim da suspensão) cai em um fim de semana ou feriado.
              Isso é apenas um aviso — <strong>não bloqueia</strong> o retorno às férias (não há ajuste automático no Art. 17).
            </span>
          </div>
        ) : null}

        {ehSuspensao && previaImpacto ? (
          <section className="gl-suspensao-secao" aria-label="Impacto previsto na folha">
            <h4 className="gl-suspensao-secao-titulo">Impacto previsto na folha (em dias, por competência)</h4>
            {previaImpacto.eventos.length ? (
              <ul className="pff-fluxo-impacto">
                {previaImpacto.eventos.map((evento) => (
                  <li key={`${evento.tipo}-${evento.competenciaUsufruto}`}>{evento.descricao}</li>
                ))}
              </ul>
            ) : (
              <small>Sem impacto: o usufruto permanece nas mesmas competências.</small>
            )}
            <p className="gl-suspensao-nota">
              {suspensaoExigeAprovacao
                ? "A suspensão ficará pendente até a validação do órgão central; o recálculo só ocorre ao efetivar."
                : "O recálculo é lançado automaticamente no motor de folha ao confirmar."}
            </p>
          </section>
        ) : null}

        {exigeAnexo && ehSuspensao ? (
          <section className="gl-suspensao-secao gl-suspensao-anexo">
            <AnexoFerias label="Justificativa formal" onChange={setDocumento} />
          </section>
        ) : exigeAnexo ? (
          <AnexoFerias label="Justificativa formal" onChange={setDocumento} />
        ) : null}
        {erro ? <div className="prototype-ferias-erro-bloqueio">{erro}</div> : null}
        <div className="prototype-efetivo-modal-actions">
          <BotaoVoltarSeplag type="button" label="Fechar" icon="pi pi-times" onClick={onFechar} />
          <BotaoSeplag
            type="button"
            severity={meta.severity}
            label={
              ehSuspensao && suspensaoExigeAprovacao
                ? "Registrar suspensão (aguarda validação)"
                : acao === "aprovar_suspensao" && aguardandoPublicacao
                  ? "Registrar publicação"
                  : meta.botao
            }
            icon={meta.icone}
            onClick={confirmar}
          />
        </div>
      </div>
    </ModalSeplag>
  );
}

function ModalMultiplosVinculos({
  vinculos,
  onEscolher,
  onFechar,
}: Readonly<{
  vinculos: ServidorMock[];
  onEscolher: (vinculo: ServidorMock) => void;
  onFechar: () => void;
}>) {
  return (
    <ModalSeplag visible fechar={onFechar} titulo="Múltiplos vínculos encontrados" hideFooter tamanho="840px">
      <div className="prototype-ferias-modal-vinculos">
        <p className="prototype-ferias-vinculos-intro">
          Este servidor possui mais de um vínculo. Selecione qual deseja usar para esta solicitação de férias.
        </p>
        <div className="prototype-ferias-vinculos-lista">
          {vinculos.map((vinculo, indice) => {
            const vinculoPermitido = permiteSolicitacaoFerias(vinculo.tipoVinculo);
            const classeTipo = vinculo.tipoVinculo === "Efetivo"
              ? "is-efetivo"
              : vinculo.tipoVinculo === "Comissionado"
                ? "is-comissionado"
                : "is-contrato-temporario";
            return (
              <button
                type="button"
                key={`${vinculo.matricula}-${vinculo.tipoVinculo}-${vinculo.cargo}`}
                className={`prototype-ferias-vinculo-opcao ${classeTipo}`}
                disabled={!vinculoPermitido}
                onClick={() => onEscolher(vinculo)}
              >
                <strong>{vinculo.cargo} — {vinculo.setor}</strong>
                <span className="prototype-ferias-vinculo-detalhes">
                  <span>
                    Matrícula: {vinculo.matricula} · {vinculo.tipoVinculo} · Vínculo: {indice + 1}
                  </span>
                  <span className="prototype-ferias-vinculo-saldo">
                    {/* Mesmo saldo que o formulário exibe após a escolha: período mais antigo com
                        saldo, já descontados os lançamentos existentes do vínculo. */}
                    {vinculoPermitido ? `Saldo: ${periodoDisponivelServidor(vinculo)?.saldo ?? 0} dias` : "Não permitido para férias"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </ModalSeplag>
  );
}

export function ModalConfirmarCancelamento({
  onFechar,
  onConfirmar,
}: Readonly<{ onFechar: () => void; onConfirmar: () => void }>) {
  return (
    <ModalSeplag visible fechar={onFechar} titulo="Cancelar solicitação" hideFooter tamanho="420px">
      <div style={{ width: "100%" }} className="prototype-ferias-form-section">
        <p>Os dados preenchidos serão perdidos. Deseja realmente cancelar e voltar para a listagem?</p>
        <div className="prototype-vinculo-form" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <BotaoSeplag
            type="button"
            label="Sim, cancelar"
            icon="pi pi-times"
            style={{ backgroundColor: "#dc2626", color: "#fff" }}
            onClick={onConfirmar}
          />
        </div>
      </div>
    </ModalSeplag>
  );
}
