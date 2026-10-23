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
import { duracoesPermitidas, prazoFechamentoFolha, selecionarPeriodoMaisAntigo, type PeriodoComSaldo } from './regrasFerias';
import { AnexoFerias, DownloadDocumentoFerias, type DocumentoFerias } from './DocumentoFerias';
import { AprovacoesFerias } from "./AprovacoesFerias";
import {
  inicioUsufruto,
  fimUsufruto,
  podeSuspender,
  podeReativar,
  podeCancelar,
  elegivelParaQuitacaoAutomatica,
  saldoRestanteParaReabertura,
} from "./regrasReabertura";

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
type SituacaoFerias = "AGUARDANDO VALIDAÇÃO" | "EM ABERTO" | "QUITADO" | "CANCELADO" | "REPROVADO" | "SUSPENSO" | "PRAZO EXPIRADO";
type TipoVinculo = "Efetivo" | "Comissionado" | "Contrato Temporário" | "Residente Técnico" | "Estagiário";
type TipoVinculoFiltro = "Todos" | TipoVinculo;
type Origem = "PORTALSERVIDOR" | "SIGEP";
type TipoRegistro = "FÉRIAS" | "LICENÇA REMUNERADA";
type AcaoStatus = "validar" | "rejeitar" | "suspender" | "reativar" | "cancelar";
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
    saldo: Math.max(0, periodo.saldo - registros.filter(r => r.matricula === servidor.matricula && r.tipoVinculo === servidor.tipoVinculo && r.orgao === servidor.orgao && r.periodoAquisitivoInicio === periodo.inicio && !['CANCELADO','REPROVADO','PRAZO EXPIRADO','SUSPENSO'].includes(r.situacao)).reduce((total,r) => total + diasSolicitados(r),0))
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
      (registro) => registro.situacao !== "CANCELADO" && registro.situacao !== "REPROVADO" && registro.situacao !== "PRAZO EXPIRADO",
    );
  } catch {
    return [];
  }
}

function conflitoFeriasServidor(matricula: string, inicio: string, fim: string, ignorarRegistroId?: number): FeriasRegistro | null {
  if (!matricula || !inicio || !fim) return null;
  return registrosAtivosPersistidos().find(
    (registro) =>
      registro.matricula === matricula &&
      registro.id !== ignorarRegistroId &&
      registro.parcelas.some((parcela) => parcela.inicio && parcela.fim && parcela.inicio <= fim && inicio <= parcela.fim),
  ) ?? null;
}

/** RN003 (Validação de sobreposição de férias e recessos): qualquer sobreposição de datas com
 * outro agendamento do mesmo servidor — rascunho/Aguardando Validação ou Em Aberto/homologado,
 * não importa se já em andamento ou ainda futuro — bloqueia o lançamento com esta mensagem. */
function mensagemConflitoAgendamento(conflito: FeriasRegistro): string {
  const tipoLabel = conflito.tipo === "Recesso" ? "Recesso" : "Férias";
  const inicio = inicioUsufruto(conflito);
  const fim = fimUsufruto(conflito);
  const periodo = inicio && fim ? `${formatarDataBr(inicio)} e ${formatarDataBr(fim)}` : periodoUsufruto(conflito);
  return `Não é possível agendar o período informado. Já existe um agendamento de ${tipoLabel} cadastrado entre ${periodo}. Cancele ou altere o agendamento anterior para prosseguir.`;
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

/** Usa o calendário mensal da folha; dia 15 como referência do protótipo. */
function calcularPrazoValidacaoChefia(): string {
  let calendario: Record<string,string> = {};
  try { calendario = JSON.parse(localStorage.getItem('ferias-calendario-folha') ?? '{}'); } catch { /* usa calendário padrão */ }
  return prazoFechamentoFolha(dataLocalISO(), calendario);
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
    reativar: "Reabertura",
    cancelar: "Cancelamento",
    expiracao: "Prazo expirado",
    quitacao: "Quitação automática",
  };
  return rotulos[acao] ?? rotuloSituacao(situacao);
}

/** Acrescenta um evento à linha do tempo do registro (histórico de situações). */
function comHistorico(
  registro: FeriasRegistro,
  evento: Omit<HistoricoEventoFerias, "data"> & { data?: string },
): HistoricoEventoFerias[] {
  return [
    ...(registro.historico ?? []),
    { data: new Date().toLocaleString("pt-BR"), ...evento },
  ];
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
  const visualizarRegistro = (registro: FeriasRegistro) => navigate(`/prototipos/sigep/ferias/visualizar/${registro.id}`);
  const [menuAbertoId, setMenuAbertoId] = useState<number | string | null>(null);
  const [confirmacaoStatus, setConfirmacaoStatus] = useState<{ registro: FeriasRegistro; acao: AcaoStatus; loteId?: string } | null>(null);
  const [subBusca, setSubBusca] = useState("");
  const [subSituacao, setSubSituacao] = useState<"" | "Vigente" | "Encerrada">("");
  const atualizarRegistros = (proximos: FeriasRegistro[]) => {
    setRegistros(proximos);
    persistirRegistros(proximos);
  };

  useEffect(() => {
    const verificar = () => setRegistros(atuais => {
      if (!atuais.some(r => prazoValidacaoExpirado(r) || elegivelParaQuitacaoAutomatica(r))) return atuais;
      const proximos = atuais.map(r => {
        if (prazoValidacaoExpirado(r)) return {...r, situacao:'PRAZO EXPIRADO' as const, historico: comHistorico(r, { situacao: 'PRAZO EXPIRADO', acao: 'expiracao', responsavel: 'Sistema (verificador automático)' })};
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
    () => registros.filter((registro) => registro.situacao === "AGUARDANDO VALIDAÇÃO"),
    [registros],
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

  // Antes da aprovação da chefia: edição livre (dias e parcelamento). Após aprovada (Em Aberto)
  // e ainda não iniciada: só a quantidade de dias, e a alteração retorna ao aprovador — alterar
  // parcelamento fica bloqueado. Uma vez iniciada (em andamento), não edita mais (RN-03).
  const podeEditar = (registro: FeriasRegistro) =>
    (registro.tipo === "Individual" || registro.tipo === "Recesso") &&
    (registro.situacao === "AGUARDANDO VALIDAÇÃO" ||
      (registro.situacao === "EM ABERTO" && !feriasEmAndamento(registro)));

  const aplicarStatus = (
    registroId: number,
    novaSituacao: SituacaoFerias,
    acao?: AcaoStatus,
    justificativa?: string,
    documento?: DocumentoFerias,
    novasParcelas?: ParcelaFerias[],
    historicoReabertura?: { inicioOriginal: string; fimOriginal: string; reabertoEm: string },
  ) => {
    if ((acao==="validar" || acao==="rejeitar") && !registros.some(r => r.id === registroId && perfilPodeAvaliarRegistro(perfil,r))) return;
    const proximos = registros.map((registro) => {
      if (registro.id !== registroId) return registro;
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
          justificativa: justificativa?.trim() || undefined,
          documentos: documento ? [documento] : undefined,
        }),
        ...(ehReaberturaAcao ? { dataLimiteValidacaoChefia: calcularPrazoValidacaoChefia() } : {}),
        ...(efetivaBeneficiosRecesso ? { auxilioTransporteEfetivado: true, sigpasIntegrado: true } : {}),
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
                    <option value="CANCELADO">Cancelado</option>
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
                onEditar={(registro) => {
                  if (registro.tipo === "Recesso") navigate(`/prototipos/sigep/ferias/editar/recesso/${registro.id}`);
                  else if (registro.tipo === "Individual") navigate(`/prototipos/sigep/ferias/editar/individual/${registro.id}`);
                  else visualizarRegistro(registro);
                }}
                onGerenciarSubstituicao={setRegistroSubstituicao}
                onVerHistorico={setRegistroHistorico}
                onAlterarStatus={(registro, acao) => setConfirmacaoStatus({ registro, acao })}
                podeEditar={podeEditar}
                menuAbertoId={menuAbertoId}
                setMenuAbertoId={setMenuAbertoId}
              />
            </>
          ) : null}

          {aba === "aprovacoes" && podeAvaliar(perfil) ? (
            <AprovacoesFerias
              registros={registros.filter(r => podeAvaliar(perfil) && ((r.tipo === "Coletiva" || r.tipo === "Lote") || r.origem === "PORTALSERVIDOR" || r.tipo === "Recesso"))}
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
          onConfirmar={(novaSituacao,justificativa,documento,novasParcelas,historicoReabertura) => confirmacaoStatus.loteId ? aplicarStatusLote(confirmacaoStatus.loteId,novaSituacao,confirmacaoStatus.acao,justificativa,documento) : aplicarStatus(confirmacaoStatus.registro.id, novaSituacao, confirmacaoStatus.acao,justificativa,documento,novasParcelas,historicoReabertura)}
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
    registro.situacao !== "CANCELADO" &&
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
 * quando vieram do Portal do Servidor (lançamento via SGP não passa por aprovação). */
function perfilPodeAvaliarRegistro(perfil: PerfilAcesso, registro: FeriasRegistro) {
  if (prazoValidacaoExpirado(registro)) return false;
  if (!podeAvaliar(perfil)) return false;
  return registro.tipo === 'Coletiva' || registro.tipo === 'Lote' || registro.origem === 'PORTALSERVIDOR' || registro.tipo === 'Recesso';
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
const USUARIO_ATOR_MOCK: Record<"Gestor" | "Aprovador", { matricula: string; vinculo: TipoVinculo }> = {
  Gestor: { matricula: "900017", vinculo: "Efetivo" },
  Aprovador: { matricula: "900020", vinculo: "Efetivo" },
};

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
  onVisualizar: (registro: FeriasRegistro) => void;
  onEditar: (registro: FeriasRegistro) => void;
  onGerenciarSubstituicao: (registro: FeriasRegistro) => void;
  onVerHistorico: (registro: FeriasRegistro) => void;
  onAlterarStatus: (registro: FeriasRegistro, acao: AcaoStatus) => void;
  podeEditar: (registro: FeriasRegistro) => boolean;
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
                <span className="prototype-ferias-badge-tipo">{tipoRegistroDe(registro.tipoVinculo) === "FÉRIAS" ? "Férias" : "Licença remunerada"}</span>
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
                {(() => {
                  // O verificador periódico roda a cada 30s — antes dele tickar, a situação ainda
                  // pode estar "AGUARDANDO VALIDAÇÃO" mesmo já tendo passado o prazo. Nesse caso,
                  // exibe "Prazo expirado" ao vivo sem esperar o próximo tick.
                  const situacaoExibida: SituacaoFerias = prazoValidacaoExpirado(registro) ? "PRAZO EXPIRADO" : registro.situacao;
                  return (
                    <span className={`prototype-ferias-badge is-${classeSituacao(situacaoExibida)}`}>{rotuloSituacao(situacaoExibida)}</span>
                  );
                })()}
                {registro.folhaHomologada ? (
                  <span className="prototype-ferias-badge is-cancelado" title="Folha de Pagamento Homologada/Paga — cancelamento e reabertura diretos bloqueados.">
                    <i className="pi pi-lock" aria-hidden="true" /> Folha homologada
                  </span>
                ) : null}
              </td>
              <td>
                <div className="prototype-ferias-acao-dropdown">
                  <button type="button" className="prototype-ferias-btn-acao" onClick={() => onVisualizar(registro)} title="Visualizar">
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
                      <button type="button" onClick={() => { onVisualizar(registro); setMenuAbertoId(null); }}>
                        <i className="pi pi-eye" aria-hidden="true" /> Visualizar
                      </button>
                      <button type="button" onClick={() => { onVerHistorico(registro); setMenuAbertoId(null); }}>
                        <i className="pi pi-history" aria-hidden="true" /> Histórico
                      </button>
                      {podeGerenciarCompleto(perfil) && podeEditar(registro) ? (
                        <button type="button" onClick={() => { onEditar(registro); setMenuAbertoId(null); }}>
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
                          onClick={() => { onAlterarStatus(registro, "suspender"); setMenuAbertoId(null); }}
                        >
                          <i className="pi pi-pause" aria-hidden="true" /> Suspender
                        </button>
                      ) : null}
                      {podeGerenciarCompleto(perfil) && podeReativar(registro) ? (
                        <button
                          type="button"
                          className="is-acao-verde"
                          onClick={() => { onAlterarStatus(registro, "reativar"); setMenuAbertoId(null); }}
                        >
                          <i className="pi pi-replay" aria-hidden="true" /> Reabrir agendamento
                        </button>
                      ) : null}
                      {podeGerenciarCompleto(perfil) && podeCancelar(registro) ? (
                        <button
                          type="button"
                          className="is-acao-vermelha"
                          onClick={() => { onAlterarStatus(registro, "cancelar"); setMenuAbertoId(null); }}
                        >
                          <i className="pi pi-ban" aria-hidden="true" /> Cancelar férias
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
}: Readonly<{
  onCancelar: () => void;
  onSalvar: (registro: FeriasRegistro) => void;
  /** Quando informado, a tela abre com os dados desse registro já preenchidos e tudo
   * desabilitado/acinzentado — reaproveita o mesmo layout do cadastro só para "Visualizar". */
  registroSomenteLeitura?: FeriasRegistro;
  /** Edição de uma solicitação Individual já lançada — mesma tela/padrão da criação (servidor
   * pré-preenchido e travado, parcelas editáveis), em vez do modal compacto. Se a solicitação já
   * está Em Aberto (aprovada), só a quantidade de dias de cada parcela pode mudar — alterar
   * parcelamento é bloqueado e a alteração devolve a solicitação ao aprovador (ver salvar()). */
  registroParaEditar?: FeriasRegistro;
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
  const [saldoDisponivel, setSaldoDisponivel] = useState<number | null>(() => {
    if (registroSomenteLeitura) return diasSolicitados(registroSomenteLeitura);
    if (registroParaEditar) return registroParaEditar.saldoFerias ?? diasSolicitados(registroParaEditar);
    return null;
  });
  const [parcelas, setParcelas] = useState<ParcelaFerias[]>(() => registroBase?.parcelas.map((parcela) => ({ ...parcela })) ?? []);
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
  const indiceParcelaComTerco = parcelas.findIndex((parcela) => parcela.terco);
  const tercoBloqueadoPorDuplicidade = indiceParcelaComTerco !== -1;

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
      const conflito = conflitoFeriasServidor(matricula, candidato.inicio, candidato.fim, registroParaEditar?.id);
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
    // RN003: qualquer sobreposição com outro agendamento do mesmo servidor bloqueia o lançamento.
    const conflito = conflitoFeriasServidor(matricula, draftInicio, draftFim, registroParaEditar?.id);
    if (conflito) {
      setErro(mensagemConflitoAgendamento(conflito));
      return;
    }
    {
      // RN-03: se a LTS já está vigente no período, a data de início é ajustada automaticamente
      // para o dia seguinte ao fim da LTS — não bloqueia o lançamento, mas não deixa sobrepor.
      const ajuste = ajustarInicioParaAposLts(draftInicio, draftDias, matricula);
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
      const saldo = saldoDisponivel ?? diasSolicitados(registroParaEditar!);
      const total = parcelas.reduce((soma, parcela) => soma + parcela.dias, 0);
      if (total > saldo || saldo - total === 5 || parcelas.some((parcela) => !duracoesPermitidas(saldo, orgao, cargo).includes(parcela.dias))) {
        setErro('Parcelamento inválido: verifique saldo, cargo e sobra de 5 dias.');
        return;
      }
      const erroIntervalo = validarIntervaloParcelas(parcelas);
      if (erroIntervalo) { setErro(erroIntervalo); return; }
      setErro("");
      // Alterar uma solicitação já aprovada (Em Aberto) devolve a solicitação ao aprovador
      // quando veio do Portal do Servidor.
      const retornaAoAprovador = registroParaEditar!.origem === "PORTALSERVIDOR" && parcelamentoRestrito;
      onSalvar({
        ...registroParaEditar!,
        parcelas,
        documentos: [...(registroParaEditar!.documentos ?? []), documento],
        ...(retornaAoAprovador ? { situacao: "AGUARDANDO VALIDAÇÃO" as const, avaliadoPor: undefined, avaliadoEm: undefined } : {}),
      });
      return;
    }
    if (!documento) { setErro('Anexe o documento/despacho formal do SIGEP.'); return; }
    if (!parcelas.length || parcelas.some(p => !duracoesPermitidas(saldoDisponivel ?? 0, orgao, cargo).includes(p.dias)) || saldoRestante === 5) { setErro('Parcelamento inválido para o cargo ou saldo residual de 5 dias.'); return; }
    if (!servidorEncontrado || !tipoVinculo || !permiteSolicitacaoFerias(tipoVinculo)) {
      setErro("Férias individuais são permitidas somente para vínculos Efetivo, Comissionado e Contrato Temporário.");
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
    const erroIntervalo = validarIntervaloParcelas(parcelas);
    if (erroIntervalo) {
      setErro(erroIntervalo);
      return;
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
      origem: "SIGEP",
      periodoAquisitivoInicio,
      periodoAquisitivoFim,
      parcelas,
      situacao: "EM ABERTO",
      saldoFerias: saldoDisponivel ?? 0,
      documentos: [documento],
      substitutos: [],
      responsavelLancamento: "Usuário atual",
      lancadoEm: new Date().toLocaleString("pt-BR"),
      historico: [{ situacao: "EM ABERTO", acao: "lancamento", data: new Date().toLocaleString("pt-BR"), responsavel: "Gestor", responsavelMatricula: USUARIO_ATOR_MOCK.Gestor.matricula, responsavelVinculo: USUARIO_ATOR_MOCK.Gestor.vinculo, documentos: [documento] }],
    });
  };

  return (
    <div className="prototype-ferias-individual-form">
      {erro ? <div className="prototype-ferias-erro-bloqueio" role="alert">{erro}</div> : null}
      {alertaConcomitancia ? (
        <div className="prototype-ferias-banner is-alerta" role="note">
          <i className="pi pi-exclamation-triangle" aria-hidden="true" />
          <span>{alertaConcomitancia}</span>
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
              ? "Solicitação já aprovada: adicione, remova ou ajuste as parcelas normalmente — a alteração devolve a solicitação ao aprovador para nova validação."
              : "Edição permitida enquanto a solicitação estiver Aguardando Validação. O intervalo entre parcelas continua valendo 0 ou 10 dias corridos (Decreto 656/2020)."}
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
                  setServidorNome("");
                  setMatricula("");
                  setOrgao("");
                  setSetor("");
                  setCargo("");
                  setTipoVinculo("Efetivo");
                  setCargoGestao(false);
                  setPeriodoAquisitivoInicio("");
                  setPeriodoAquisitivoFim("");
                  setSaldoDisponivel(null);
                  setServidorEncontrado(false);
                  setServidorBusca("");
                  setSugestoesServidor([]);
                  setVinculosParaEscolher([]);
                  setVinculoInfo(null);
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
          title={tercoBloqueadoPorDuplicidade ? `O Adicional Constitucional de 1/3 já foi solicitado na Parcela ${indiceParcelaComTerco + 1}.` : undefined}
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

      {!somenteLeitura && <AnexoFerias label={ehEdicao ? "Justificativa formal da alteração" : "Documento / despacho formal (SIGADOC)"} onChange={setDocumento} />}

      {registroSomenteLeitura ? (
        <div className="prototype-ferias-form-section">
          <p>Lançado por {registroSomenteLeitura.responsavelLancamento} em {registroSomenteLeitura.lancadoEm}.</p>
          {registroSomenteLeitura.avaliadoPor ? (
            <p>
              {registroSomenteLeitura.resultadoAvaliacao ?? (registroSomenteLeitura.situacao === "CANCELADO" || registroSomenteLeitura.situacao === "REPROVADO" ? "Reprovada" : "Aprovada")}
              {" "}por {registroSomenteLeitura.avaliadoPor} em {registroSomenteLeitura.avaliadoEm}.
            </p>
          ) : (
            <p className="prototype-ferias-gozo-ajuda">Ainda não avaliado pela chefia.</p>
          )}
          {registroSomenteLeitura.justificativaAvaliacao ? (
            <p><strong>Justificativa da avaliação:</strong> {registroSomenteLeitura.justificativaAvaliacao}</p>
          ) : null}
        </div>
      ) : null}
      </div>

      <div className="prototype-vinculo-form prototype-ferias-lancamento-acoes" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <BotaoVoltarSeplag type="button" label="Voltar" onClick={onCancelar} />
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
  const [iniciosParcelasLote, setIniciosParcelasLote] = useState<Record<DuracaoLote, string>>({
    10: `${anoAtual}-07-06`,
    15: `${anoAtual}-07-06`,
    20: `${anoAtual}-07-06`,
    30: `${anoAtual}-07-06`,
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
  const [confirmacao, setConfirmacao] = useState("");
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
      (!modoAgendamentoLote || (!professor.cargoGestao && errosDe(professor).length === 0)) &&
      (selecionados[professor.id]?.incluido ?? false),
    ),
    [professoresDaLotacao, selecionados, modoAgendamentoLote, errosDe],
  );

  const selecionarTodosParcelaLote = (duracao: DuracaoLote, valor: boolean) => {
    setSelecionados((atual) => {
      const proximo = { ...atual };
      professoresIncluidos.forEach((professor) => {
        const estado = estadoLinha(professor.id);
        // Não marca quem já ultrapassaria o saldo com essa parcela — igual ao bloqueio linha a linha.
        if (valor && !estado.parcelasLote[duracao] && somaDiasSelecionadosLote(professor) + duracao > professor.saldo) return;
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

  const periodoDoProfessor = (professor: ProfessorLote) => periodoDisponivelServidor({
    matricula:professor.matricula, nome:professor.nome, orgao:professor.orgao + '/MT', setor:professor.lotacaoNome,
    cargo:professor.cargo, tipoVinculo:professor.vinculo, cargoGestao:false,
    periodoAquisitivoInicio:'2025-01-01', periodoAquisitivoFim:'2025-12-31', saldoDisponivel:professor.saldo,
  });
  const [documentoLote, setDocumentoLote] = useState<DocumentoFerias | null>(null);
  const lancarLote = () => {
    const erros: string[] = [];
    const incluidos = professoresIncluidos;
    if (!documentoLote) erros.push('Anexe a Portaria da Escala de Férias.');
    incluidos.forEach(professor => {
      const dias = modoAgendamentoLote ? somaDiasSelecionadosLote(professor) : (estadoLinha(professor.id).julho ? 15 : 0) + (estadoLinha(professor.id).janeiro ? 30 : 0);
      if ((periodoDoProfessor(professor)?.saldo ?? 0) - dias === 5 || dias > (periodoDoProfessor(professor)?.saldo ?? 0)) erros.push(professor.nome + ': parcelamento excede o saldo ou deixa sobra de 5 dias.');
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
    } else {
      const semParcela = incluidos.filter((professor) => !estadoLinha(professor.id).julho && !estadoLinha(professor.id).janeiro);
      if (semParcela.length) {
        erros.push(`Marque uma parcela para cada servidor incluído: ${semParcela.map((professor) => professor.nome).join(", ")}.`);
      }
      if (marcadosJulho.length && !inicioJulho) erros.push("Informe a data de início da parcela de julho.");
      if (marcadosJaneiro.length && !inicioJaneiro) erros.push("Informe a data de início da parcela de janeiro.");
      if (!marcadosJulho.length && !marcadosJaneiro.length) {
        erros.push("Marque ao menos uma parcela (julho ou janeiro) na aba 2 antes de lançar.");
      }
    }

    if (erros.length) {
      setErro(erros);
      setConfirmacao("");
      return;
    }

    setErro([]);

    const loteId = `LOTE-${orgao}-${gerarId()}`;
    const periodosSelecionados = incluidos.map(periodoDoProfessor);
    if (periodosSelecionados.some((p,indice) => !p || p.saldo < (modoAgendamentoLote ? somaDiasSelecionadosLote(incluidos[indice]) : (estadoLinha(incluidos[indice].id).julho ? 15 : 0) + (estadoLinha(incluidos[indice].id).janeiro ? 30 : 0)))) { setErro(['Saldo do período mais antigo insuficiente. Revise os servidores selecionados.']); return; }
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
        dataLimiteValidacaoChefia: calcularPrazoValidacaoChefia(),
        parcelas,
        // Todo lançamento de férias precisa passar por aprovação da chefia antes de ficar
        // Em Aberto — inclusive Coletiva direta e o lote da Gestão de Pessoas da UNEMAT, que
        // antes pulavam a validação.
        situacao: "AGUARDANDO VALIDAÇÃO",
        substitutos: [],
        loteId,
        responsavelLancamento: "Usuário atual",
        lancadoEm: new Date().toLocaleString("pt-BR"),
        historico: [{ situacao: "AGUARDANDO VALIDAÇÃO" as const, acao: "lancamento", data: new Date().toLocaleString("pt-BR"), responsavel: "Gestor", responsavelMatricula: USUARIO_ATOR_MOCK.Gestor.matricula, responsavelVinculo: USUARIO_ATOR_MOCK.Gestor.vinculo, documentos: documentoLote ? [documentoLote] : undefined }],
      };
    });

    if (modoAgendamentoLote) {
      const resumoPorDuracao = DURACOES_LOTE
        .map((duracao) => ({ duracao, total: novosRegistros.filter((registro) => registro.parcelas.some((parcela) => parcela.dias === duracao)).length }))
        .filter(({ total }) => total > 0)
        .map(({ duracao, total }) => `${total} parcela(s) de ${duracao} dias`)
        .join(", ");
      setConfirmacao(`Lote lançado: ${resumoPorDuracao} criada(s). Lançado por Usuário atual em ${new Date().toLocaleString("pt-BR")}.`);
    } else {
      const totalJulho = novosRegistros.filter((registro) => registro.parcelas.some((parcela) => parcela.dias === 15)).length;
      const totalJaneiro = novosRegistros.filter((registro) => registro.parcelas.some((parcela) => parcela.dias === 30)).length;
      setConfirmacao(
        `Lote lançado: ${totalJulho} parcela(s) de 15 dias e ${totalJaneiro} parcela(s) de 30 dias criadas. ` +
          `Lançado por Usuário atual em ${new Date().toLocaleString("pt-BR")}.`,
      );
    }

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
      {confirmacao ? <div className="prototype-ferias-confirmacao">{confirmacao}</div> : null}

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
              ? "Lança férias coletivas somente para a escola vinculada; a validação acontece na aba Aprovações."
              : perfilLote === "GESTAO_UNEMAT"
                  ? "A Gestão de Pessoas da UNEMAT visualiza todas as unidades e lança o lote; a validação da chefia acontece à parte, na aba Avaliar e Aprovar."
                  : "A Gestão de Pessoas da SECITEC visualiza todas as escolas técnicas e lança o lote; a validação da chefia acontece à parte, na aba Avaliar e Aprovar."}
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
                const trClasse = modoAgendamentoLote && professor.cargoGestao
                  ? "prototype-ferias-linha-desabilitada"
                  : temErro
                    ? "prototype-ferias-linha-com-erro"
                    : "";
                return (
                  <tr key={professor.id} className={trClasse}>
                    <td>
                      <input
                        type="checkbox"
                        disabled={modoAgendamentoLote && erros.length > 0}
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
              <BotaoBuscarServidor onClick={() => {}} />
            </div>
            <label className="prototype-ferias-coletiva-alerta-check">
              <input type="checkbox" checked={soComAlerta} onChange={(event) => setSoComAlerta(event.target.checked)} />
              Só com alerta
            </label>
          </div>
          </div>

        {professoresIncluidos.length === 0 ? (
          <div className="prototype-ferias-banner" style={{ margin: "0 16px 16px" }}>
            <i className="pi pi-info-circle" aria-hidden="true" />
            <span>
              Nenhum servidor incluído corresponde aos filtros atuais. Ajuste os filtros em{" "}
              <strong>1. Órgão &amp; Servidores</strong> ou marque os servidores correspondentes.
            </span>
          </div>
        ) : (
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
                                checked={professoresIncluidos.length > 0 && professoresIncluidos.every((professor) => estadoLinha(professor.id).julho)}
                                onChange={(event) => {
                                  const valor = event.target.checked;
                                  setSelecionados((atual) => {
                                    const proximo = { ...atual };
                                    professoresIncluidos.forEach((professor) => {
                                      proximo[professor.id] = { ...estadoLinha(professor.id), julho: valor };
                                    });
                                    return proximo;
                                  });
                                }}
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
                                checked={professoresIncluidos.length > 0 && professoresIncluidos.every((professor) => estadoLinha(professor.id).janeiro)}
                                onChange={(event) => {
                                  const valor = event.target.checked;
                                  setSelecionados((atual) => {
                                    const proximo = { ...atual };
                                    professoresIncluidos.forEach((professor) => {
                                      proximo[professor.id] = { ...estadoLinha(professor.id), janeiro: valor };
                                    });
                                    return proximo;
                                  });
                                }}
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
                          <span className={erroSaldo || erros.some((e) => e.includes("45d fora")) ? "prototype-ferias-saldo-inconsistente" : avisos.some((a) => a.includes("30d em escola")) ? "prototype-ferias-saldo-aviso" : ""}>
                            {professor.saldo} dias
                          </span>
                        </td>
                        {modoAgendamentoLote ? (
                          DURACOES_LOTE.map((duracao) => {
                            const jaMarcada = estado.parcelasLote[duracao];
                            // Bloqueia marcar uma parcela nova cuja soma ultrapasse o saldo do
                            // servidor — desmarcar sempre é permitido.
                            const excederiaSaldo = !jaMarcada && (!duracoesPermitidas(professor.saldo - somaDiasSelecionadosLote(professor), professor.orgao, professor.cargo).includes(duracao));
                            return (
                              <td key={duracao} style={{ textAlign: "center" }}>
                                <input
                                  type="checkbox"
                                  checked={jaMarcada}
                                  disabled={excederiaSaldo}
                                  title={excederiaSaldo ? `Ultrapassaria o saldo de ${professor.saldo} dias` : undefined}
                                  onChange={(event) => alternarParcelaLote(professor, duracao, event.target.checked)}
                                />
                              </td>
                            );
                          })
                        ) : (
                          <>
                            <td style={{ textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={estado.julho}
                                onChange={(event) => alternarLinha(professor, "julho", event.target.checked)}
                              />
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <input
                                type="checkbox"
                                checked={estado.janeiro}
                                onChange={(event) => alternarLinha(professor, "janeiro", event.target.checked)}
                              />
                            </td>
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
                      <td colSpan={modoAgendamentoLote ? 7 : 5} className="prototype-ferias-empty">Nenhum professor encontrado para o filtro informado.</td>
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
        )}
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
                    {modoAgendamentoLote && (perfilLote === "GESTAO_UNEMAT" || perfilLote === "GESTAO_SECITEC")
                      ? "Após lançar, o lote fica aguardando validação da chefia na aba Avaliar e Aprovar."
                      : orgao === "SEDUC"
                        ? "Após lançar, o lote ficará disponível para validação em bloco pelo Aprovador, com possibilidade de reprovação individual por servidor."
                        : orgao === "UNEMAT"
                          ? "Após lançar, o lote ficará disponível para validação pela Gestão de Pessoas da UNEMAT."
                          : "Após lançar, o lote ficará disponível para validação pela Gestão de Pessoas da SECITEC."}
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
              Lançar Férias Coletivas do Lote
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
      dataLimiteValidacaoChefia:calcularPrazoValidacaoChefia(),
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
        registro.situacao !== "CANCELADO" &&
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

      {registroSomenteLeitura ? (
        <div className="prototype-ferias-form-section">
          <p>Lançado por {registroSomenteLeitura.responsavelLancamento} em {registroSomenteLeitura.lancadoEm}.</p>
          {registroSomenteLeitura.avaliadoPor ? (
            <p>
              {registroSomenteLeitura.resultadoAvaliacao ?? (registroSomenteLeitura.situacao === "CANCELADO" || registroSomenteLeitura.situacao === "REPROVADO" ? "Reprovada" : "Aprovada")}
              {" "}por {registroSomenteLeitura.avaliadoPor} em {registroSomenteLeitura.avaliadoEm}.
            </p>
          ) : (
            <p className="prototype-ferias-gozo-ajuda">Ainda não avaliado pela chefia.</p>
          )}
          {registroSomenteLeitura.justificativaAvaliacao ? (
            <p><strong>Justificativa da avaliação:</strong> {registroSomenteLeitura.justificativaAvaliacao}</p>
          ) : null}
        </div>
      ) : null}
      </div>

      <div className="prototype-vinculo-form prototype-ferias-lancamento-acoes" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <BotaoVoltarSeplag type="button" label="Voltar" onClick={onCancelar} />
        {!somenteLeitura ? <BotaoSalvarSeplag type="button" label={ehEdicao ? "Salvar alteração" : "Salvar solicitação"} onClick={salvar} /> : null}
      </div>
    </div>
  );
}

/** Ícone/cor da linha do tempo, por situação do evento — mesma paleta usada nos badges da tabela. */
function iconeHistorico(situacao: SituacaoFerias): { icone: string; classe: string } {
  if (situacao === "EM ABERTO" || situacao === "QUITADO") return { icone: "pi pi-check", classe: "is-sucesso" };
  if (situacao === "AGUARDANDO VALIDAÇÃO") return { icone: "pi pi-clock", classe: "is-pendente" };
  if (situacao === "SUSPENSO") return { icone: "pi pi-pause", classe: "is-aviso" };
  return { icone: "pi pi-times", classe: "is-erro" };
}

function ModalHistoricoRegistro({
  registro,
  onFechar,
}: Readonly<{ registro: FeriasRegistro; onFechar: () => void }>) {
  const eventos = registro.historico?.length
    ? registro.historico
    : [{ situacao: registro.situacao, acao: "lancamento", data: registro.lancadoEm, responsavel: registro.responsavelLancamento, documentos: registro.documentos } as HistoricoEventoFerias];
  const ordenados = [...eventos].reverse();
  const [indiceSelecionado, setIndiceSelecionado] = useState(0);
  const selecionado = ordenados[indiceSelecionado];

  return (
    <ModalSeplag
      visible
      fechar={onFechar}
      titulo={`Histórico — ${registro.servidorNome} · Matrícula ${registro.matricula} / ${registro.numeroVinculo ?? "1"} · ${registro.tipoVinculo}`}
      hideFooter
      tamanho="920px"
    >
      <div className="prototype-ferias-historico-grid">
        <section className="prototype-ferias-historico-coluna">
          <h4>
            <i className="pi pi-history" aria-hidden="true" /> Histórico de situações
          </h4>
          <p className="prototype-ferias-historico-legenda">Situações registradas ao longo do ciclo de vida da solicitação.</p>
          <ol className="prototype-ferias-historico-linha-tempo">
            {ordenados.map((evento, indice) => {
              const { icone, classe } = iconeHistorico(evento.situacao);
              return (
                <li key={`${evento.data}-${indice}`}>
                  <button
                    type="button"
                    className={`prototype-ferias-historico-item ${classe}${indice === indiceSelecionado ? " is-selecionado" : ""}`}
                    onClick={() => setIndiceSelecionado(indice)}
                  >
                    <span className="prototype-ferias-historico-ponto"><i className={icone} aria-hidden="true" /></span>
                    <span className="prototype-ferias-historico-texto">
                      <strong>{rotuloAcaoHistorico(evento.acao, evento.situacao)}</strong>
                      <small>Data do efeito {formatarDataBr(evento.data.slice(0, 10)) || evento.data}</small>
                      <small className="prototype-ferias-historico-rodape">
                        <span className="prototype-ferias-historico-ator">
                          <i className="pi pi-user" aria-hidden="true" /> {evento.responsavel}
                          {evento.responsavelMatricula ? ` · Matrícula ${evento.responsavelMatricula} / ${evento.responsavelVinculo}` : ""}
                        </span>
                        {" "}· registrado em {evento.data}
                      </small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
        <section className="prototype-ferias-historico-coluna">
          <h4>
            <i className="pi pi-comment" aria-hidden="true" /> Justificativa da situação
          </h4>
          <p className="prototype-ferias-historico-legenda">
            {rotuloAcaoHistorico(selecionado.acao, selecionado.situacao)} · Data do efeito {selecionado.data}
          </p>
          <p className="prototype-ferias-historico-justificativa">
            {selecionado.justificativa?.trim() || "Sem justificativa registrada para esta situação."}
          </p>

          <h4>
            <i className="pi pi-folder" aria-hidden="true" /> Documentos da situação
          </h4>
          <p className="prototype-ferias-historico-legenda">
            {rotuloAcaoHistorico(selecionado.acao, selecionado.situacao)} · Data do efeito {selecionado.data}
          </p>
          {selecionado.documentos?.length ? (
            <table className="prototype-ferias-table prototype-ferias-historico-documentos">
              <thead><tr><th>Documento</th><th>Ações</th></tr></thead>
              <tbody>
                {selecionado.documentos.map((documento) => (
                  <tr key={documento.id}>
                    <td>{documento.nome}</td>
                    <td><DownloadDocumentoFerias documento={documento} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="prototype-ferias-historico-justificativa">Nenhum documento anexado nesta situação.</p>
          )}
        </section>
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
    descricao: "A chefia confirma o agendamento e marca o abono constitucional quando aplicável. O registro passa para Em Aberto e libera a substituição, quando cabível.",
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
    novaSituacao: "CANCELADO",
  },
  suspender: {
    titulo: "Suspender férias",
    descricao: "A suspensão interrompe o usufruto; o saldo retorna disponível para novo agendamento.",
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
  cancelar: {
    titulo: "Cancelar férias",
    descricao: "Ação irreversível — o registro deixa de constar na listagem ativa.",
    severity: "danger",
    icone: "pi pi-trash",
    botao: "Cancelar férias",
    novaSituacao: "CANCELADO",
  },
};

function ModalConfirmarStatus({
  registro,
  acao,
  onFechar,
  onConfirmar,
  loteId,
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
  ) => void;
  loteId?: string;
}>) {
  const meta = STATUS_META[acao];
  const exigeJustificativa = acao === "rejeitar" || acao === "cancelar" || acao === "suspender" || acao === "reativar";
  const exigeAnexo = acao === "cancelar" || acao === "suspender" || acao === "reativar";
  // RN-04: suspensão já em andamento só por calamidade pública ou convocação pela administração
  // — exige número de portaria/ofício em vez de justificativa livre. Cancelamento (RN 1) não
  // chega mais a esse ponto: podeCancelar já exige hoje < início do usufruto.
  const exigePortaria = acao === "suspender" && feriasEmAndamento(registro);
  const ehReabertura = acao === "reativar";
  const totalDiasOriginal = registro.parcelas.reduce((total, parcela) => total + parcela.dias, 0);
  const [documento, setDocumento] = useState<DocumentoFerias | null>(null);
  const [justificativa, setJustificativa] = useState("");
  const [novaDataInicioIso, setNovaDataInicioIso] = useState("");
  const [erro, setErro] = useState("");
  const novaDataFimIso = novaDataInicioIso ? calcularFim(novaDataInicioIso, totalDiasOriginal) : "";

  const saldoTotalPeriodo = registro.saldoFerias ?? totalDiasOriginal;
  const saldoRestantePeriodo = ehReabertura ? saldoRestanteParaReabertura(registro, carregarRegistros()) : saldoTotalPeriodo;

  const confirmar = () => {
    if (exigeAnexo && !documento) { setErro('Anexe a justificativa formal.'); return; }
    if (exigePortaria && !justificativa.trim()) {
      setErro("Informe o número da portaria/ofício de calamidade pública ou convocação.");
      return;
    }
    if (!exigePortaria && exigeJustificativa && !justificativa.trim()) {
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
      titulo={meta.titulo}
      hideFooter
      tamanho="640px"
    >
      <div className="prototype-finalizar-efetivo-modal">
        <p>{meta.descricao}</p>
        {loteId && <p role="note">A decisão será aplicada ao lote completo <strong>{loteId}</strong>, preservando a avaliação em bloco.</p>}

        <div className="prototype-finalizar-efetivo-info">
          <div><span>Servidor</span><strong>{registro.servidorNome}</strong></div>
          <div className="prototype-finalizar-efetivo-info-linha">
            <div><span>Matrícula</span><strong>{registro.matricula}</strong></div>
            <div><span>Vínculo</span><strong>{registro.numeroVinculo ?? "1"}</strong></div>
          </div>
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
        </div>

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

        {exigePortaria ? (
          <div className="prototype-ferias-banner" role="note">
            <i className="pi pi-exclamation-triangle" aria-hidden="true" />
            <span>
              Férias em andamento (RN-03). Só podem ser suspensas/canceladas por calamidade pública
              ou convocação pela administração (RN-04) — informe o número da portaria/ofício abaixo.
            </span>
          </div>
        ) : null}
        {exigePortaria ? (
          <label className="prototype-finalizar-efetivo-upload">
            <strong>Número da portaria/ofício<em>*</em></strong>
            <input
              value={justificativa}
              onChange={(event) => setJustificativa(event.target.value)}
              placeholder="Ex.: Portaria 123/2026"
              style={{ padding: "8px 10px", border: "1px solid #c8d6e5", borderRadius: 5, font: "inherit" }}
            />
          </label>
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
        {exigeAnexo && <AnexoFerias label="Justificativa formal" onChange={setDocumento} />}
        {erro ? <div className="prototype-ferias-erro-bloqueio">{erro}</div> : null}
        <div className="prototype-efetivo-modal-actions">
          <BotaoVoltarSeplag type="button" label="Fechar" icon="pi pi-times" onClick={onFechar} />
          <BotaoSeplag type="button" severity={meta.severity} label={meta.botao} icon={meta.icone} onClick={confirmar} />
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
                    {vinculoPermitido ? `Saldo: ${vinculo.saldoDisponivel} dias` : "Não permitido para férias"}
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
