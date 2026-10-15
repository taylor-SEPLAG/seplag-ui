import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Paginator } from "primereact/paginator";
import { useNavigate } from "react-router-dom";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { CardSeplag } from "../../componentes/Card";
import { ModalSeplag } from "../../componentes/Modal";
import { BotaoLimparFiltroSeplag, BotaoVoltarSeplag, BotaoSalvarSeplag, BotaoSeplag } from "../../componentes/Botao";
import { SeplagAutoComplete } from "../../componentes/AutoComplete";
import { DropdownFieldSeplag, DateFieldSeplag } from "../../componentes/Fields";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import "./ferias.css";

function brParaIso(valor: string) {
  if (!valor) return "";
  const [dia, mes, ano] = valor.split("/");
  if (!dia || !mes || !ano) return "";
  return `${ano}-${mes}-${dia}`;
}

function gerarId(): number {
  return Date.now();
}

type OrgaoColetivo = "SEDUC" | "UNEMAT" | "OUTRO";
type TipoSolicitacao = "Individual" | "Coletiva" | "Lote" | "Recesso";
type SituacaoFerias = "AGUARDANDO VALIDAÇÃO" | "EM ABERTO" | "QUITADO" | "CANCELADO" | "REPROVADO" | "SUSPENSO";
type TipoVinculo = "Efetivo" | "Comissionado" | "Contrato Temporário" | "Residente Técnico" | "Bolsista" | "Estagiário";
type TipoVinculoFiltro = "Todos" | TipoVinculo;
type Origem = "PORTALSERVIDOR" | "SIGEP";
type TipoRegistro = "FÉRIAS" | "LICENÇA REMUNERADA";
type AcaoStatus = "validar" | "rejeitar" | "suspender" | "reativar" | "cancelar";
type PerfilAcesso = "Servidor" | "Chefia Imediata" | "RH / Gestão de Pessoas";

interface ParcelaFerias {
  id: number;
  inicio: string;
  fim: string;
  dias: number;
  terco?: boolean;
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
  cpf: string;
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
  orgao: "SEDUC" | "UNEMAT";
  nome: string;
  matricula: string;
  cpf?: string;
  cargo: string;
  vinculo: "Efetivo" | "Contrato Temporário";
  lotacaoNome: string;
  situacaoLotacao: "Em escola" | "Fora da escola" | "Em unidade universitária" | "Fora de unidade";
  saldo: 45 | 30;
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

type PerfilLote = "SECRETARIO_SEDUC" | "DRE_SEDUC" | "GESTAO_UNEMAT";

export const STORAGE_KEY = "prototype-ferias-registros-v3";

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
}

const SERVIDORES_MOCK: ServidorMock[] = [
  { matricula: "241244", nome: "Valeria da Silva Pinto", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Analista Administrativo", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2025-06-11", periodoAquisitivoFim: "2026-06-10", saldoDisponivel: 30 },
  { matricula: "257812", nome: "Max Jorge Lacerda da Matta", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Técnico Administrativo", tipoVinculo: "Contrato Temporário", cargoGestao: false, periodoAquisitivoInicio: "2025-08-11", periodoAquisitivoFim: "2026-08-10", saldoDisponivel: 20 },
  { matricula: "243417", nome: "Claudio Luciano Capistrano de Camargo", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Coordenador de TI", tipoVinculo: "Comissionado", cargoGestao: true, periodoAquisitivoInicio: "2025-10-15", periodoAquisitivoFim: "2026-10-14", saldoDisponivel: 30 },
  { matricula: "249253", nome: "Claudia Moreira Arrais de Oliveira", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Assessora Técnica", tipoVinculo: "Comissionado", cargoGestao: false, periodoAquisitivoInicio: "2025-07-01", periodoAquisitivoFim: "2026-06-30", saldoDisponivel: 30 },
  { matricula: "327305", nome: "João Silva", orgao: "SEPLAG/MT", setor: "GABINETE", cargo: "Analista Administrativo", tipoVinculo: "Efetivo", cargoGestao: true, periodoAquisitivoInicio: "2025-01-01", periodoAquisitivoFim: "2025-12-31", saldoDisponivel: 30 },
  { matricula: "418920", nome: "Marina Costa Alves", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Analista Técnico", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2025-01-15", periodoAquisitivoFim: "2026-01-14", saldoDisponivel: 30 },
  { matricula: "778899", nome: "Rodrigo Nunes Ferraz", orgao: "SEDUC/MT", setor: "Escola Estadual Marechal Rondon", cargo: "Apoio", tipoVinculo: "Contrato Temporário", cargoGestao: false, periodoAquisitivoInicio: "2026-05-01", periodoAquisitivoFim: "2027-04-30", saldoDisponivel: 45 },
  { matricula: "551023", nome: "Ana Lúcia Ferreira", orgao: "SEDUC/MT", setor: "Escola Estadual Antônio Ferreira", cargo: "Apoio", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2025-01-01", periodoAquisitivoFim: "2025-12-31", saldoDisponivel: 45 },
  { matricula: "551044", nome: "Bruno Castanheira", orgao: "SEDUC/MT", setor: "Escola Estadual Antônio Ferreira", cargo: "Administração", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2025-01-01", periodoAquisitivoFim: "2025-12-31", saldoDisponivel: 30 },
  { matricula: "551067", nome: "Cláudia Mendes", orgao: "SEDUC/MT", setor: "Escola Estadual Antônio Ferreira", cargo: "Apoio", tipoVinculo: "Contrato Temporário", cargoGestao: false, periodoAquisitivoInicio: "2025-01-01", periodoAquisitivoFim: "2025-12-31", saldoDisponivel: 45 },
  { matricula: "512077", nome: "João Pedro Castanheira", orgao: "UNEMAT/MT", setor: "UNEMAT — Reitoria", cargo: "Administração", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2025-01-01", periodoAquisitivoFim: "2025-12-31", saldoDisponivel: 30 },
  { matricula: "512104", nome: "Marina Costa Alves", orgao: "UNEMAT/MT", setor: "UNEMAT — Campus Sinop", cargo: "Apoio", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2025-01-01", periodoAquisitivoFim: "2025-12-31", saldoDisponivel: 30 },
  { matricula: "310021", nome: "Beatriz Andrade Correia", orgao: "SEPLAG/MT", setor: "Hospital Regional de Mato Grosso", cargo: "Residente Técnico — Enfermagem", tipoVinculo: "Residente Técnico", cargoGestao: false, periodoAquisitivoInicio: "2026-02-01", periodoAquisitivoFim: "", saldoDisponivel: 30 },
  { matricula: "320045", nome: "Igor Machado Nunes", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Bolsista", tipoVinculo: "Bolsista", cargoGestao: false, periodoAquisitivoInicio: "2026-07-10", periodoAquisitivoFim: "", saldoDisponivel: 15 },
  { matricula: "330078", nome: "Larissa Pacheco Teixeira", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Estagiária", tipoVinculo: "Estagiário", cargoGestao: false, periodoAquisitivoInicio: "2026-01-05", periodoAquisitivoFim: "", saldoDisponivel: 22 },
  { matricula: "340099", nome: "Camila Rezende Borges", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Estagiária", tipoVinculo: "Estagiário", cargoGestao: false, periodoAquisitivoInicio: "2025-10-15", periodoAquisitivoFim: "", saldoDisponivel: 30 },
  { matricula: "350011", nome: "Thiago Nunes Prado", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Estagiário", tipoVinculo: "Estagiário", cargoGestao: false, periodoAquisitivoInicio: "2026-08-01", periodoAquisitivoFim: "", saldoDisponivel: 5 },
  { matricula: "360022", nome: "Patrícia Souza Lacerda", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Estagiária", tipoVinculo: "Estagiário", cargoGestao: false, periodoAquisitivoInicio: "2025-11-01", periodoAquisitivoFim: "", saldoDisponivel: 27 },
  { matricula: "370033", nome: "Eduardo Lima Vasconcelos", orgao: "SEPLAG/MT", setor: "Hospital Regional de Mato Grosso", cargo: "Residente Técnico — Fisioterapia", tipoVinculo: "Residente Técnico", cargoGestao: false, periodoAquisitivoInicio: "2026-04-15", periodoAquisitivoFim: "", saldoDisponivel: 20 },
  { matricula: "380044", nome: "Fernanda Alves Carneiro", orgao: "SEPLAG/MT", setor: "Hospital Regional de Mato Grosso", cargo: "Residente Técnico — Enfermagem", tipoVinculo: "Residente Técnico", cargoGestao: false, periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "", saldoDisponivel: 30 },
  { matricula: "390055", nome: "Gabriel Teixeira Rocha", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Bolsista", tipoVinculo: "Bolsista", cargoGestao: false, periodoAquisitivoInicio: "2026-09-20", periodoAquisitivoFim: "", saldoDisponivel: 5 },
  { matricula: "550099", nome: "Ricardo Farias Lima", orgao: "SES/MT", setor: "Unidade de Pronto Atendimento", cargo: "Médico Plantonista", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2025-09-01", periodoAquisitivoFim: "2026-08-31", saldoDisponivel: 20 },
  { matricula: "550099", nome: "Ricardo Farias Lima", orgao: "SES/MT", setor: "Ambulatório de Cardiologia", cargo: "Médico Cardiologista", tipoVinculo: "Contrato Temporário", cargoGestao: false, periodoAquisitivoInicio: "2025-11-01", periodoAquisitivoFim: "2026-10-31", saldoDisponivel: 12 },
];

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
  "320045": [ // Igor Machado Nunes — Bolsista, saldo não-múltiplo de 10 (parcelamento livre)
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
  "390055": [ // Gabriel Teixeira Rocha — Bolsista com saldo baixo (etapa única rápida)
    { inicio: "2026-09-20", saldo: 5 },
  ],
};

/** RN005 (US51) — períodos aquisitivos de estagiário anteriores a este marco são
 * bloqueados na tela e direcionados à Gestão de Pessoas. Não se aplica a residente/bolsista (RN004/US50). */
const MARCO_CORTE_ESTAGIARIO = "2018-03-01";

/** RN007 (US51) — o agendamento do estagiário precisa ser anterior ao fim do contrato. */
const FIM_CONTRATO_ESTAGIARIO_MOCK: Record<string, string> = {
  "330078": "2026-12-04", // Larissa Pacheco Teixeira
  "340099": "2027-10-14", // Camila Rezende Borges
  "350011": "2027-07-31", // Thiago Nunes Prado
  "360022": "2026-11-15", // Patrícia Souza Lacerda — contrato encerra em breve, demonstra RN007
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
  { id: 11, orgao: "UNEMAT", nome: "João Pedro Castanheira", matricula: "512077", cargo: "Professor", vinculo: "Efetivo", lotacaoNome: "UNEMAT — Reitoria", situacaoLotacao: "Em unidade universitária", saldo: 45, saldoConfirmado: false, cargoGestao: false, ltsConcomitante: false },
  { id: 12, orgao: "UNEMAT", nome: "Marina Costa Alves", matricula: "512104", cargo: "Professor", vinculo: "Efetivo", lotacaoNome: "UNEMAT — Campus Sinop", situacaoLotacao: "Em unidade universitária", saldo: 45, saldoConfirmado: false, cargoGestao: false, ltsConcomitante: false },
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
  { orgao: "UNEMAT", nome: "UNEMAT — Reitoria", situacaoLotacao: "Em unidade universitária" },
  { orgao: "UNEMAT", nome: "UNEMAT — Campus Sinop", situacaoLotacao: "Em unidade universitária" },
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
    // Apoio/gestão não tem direito aos 45 dias (exclusivo de professor); saldo fixo em 30,
    // com uma inconsistência cadastral demonstrativa de vez em quando.
    const saldoEsperado: 45 | 30 = ehApoioOuGestao
      ? 30
      : lotacao.orgao === "UNEMAT" || estaEmEscola ? 45 : 30;
    const saldoInconsistente = ehApoioOuGestao ? indice % 20 === 4 : indice % 10 === 0;
    const saldo: 45 | 30 = saldoInconsistente
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

function registroBase(parcial: Partial<FeriasRegistro> & Pick<FeriasRegistro, "id" | "servidorNome" | "matricula" | "cargo" | "tipoVinculo" | "parcelas" | "situacao">): FeriasRegistro {
  return {
    cpf: "",
    orgao: "SEPLAG/MT",
    orgaoColetivo: "OUTRO",
    setor: "COORD. PLANEJ. E PROJETOS DE TI",
    cargoGestao: false,
    tipo: "Individual",
    origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "",
    periodoAquisitivoFim: "",
    substitutos: [],
    responsavelLancamento: "RH Setorial",
    lancadoEm: "2026-09-01 09:00",
    ...parcial,
  };
}

const registrosBase: FeriasRegistro[] = [
  registroBase({
    id: 1, servidorNome: "Valeria da Silva Pinto", matricula: "241244", cargo: "Analista Administrativo",
    tipoVinculo: "Efetivo", situacao: "EM ABERTO", origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "2021-06-11", periodoAquisitivoFim: "2022-06-10",
    parcelas: [{ id: 1, inicio: "2025-03-24", fim: "2025-04-07", dias: 15 }],
  }),
  registroBase({
    id: 2, servidorNome: "Max Jorge Lacerda da Matta", matricula: "257812", cargo: "Técnico Administrativo",
    tipoVinculo: "Contrato Temporário", situacao: "EM ABERTO", origem: "SIGEP",
    periodoAquisitivoInicio: "2021-08-11", periodoAquisitivoFim: "2022-08-10",
    parcelas: [{ id: 1, inicio: "2025-12-05", fim: "2025-12-24", dias: 20 }],
  }),
  registroBase({
    id: 3, servidorNome: "Claudio Luciano Capistrano de Camargo", matricula: "243417", cargo: "Coordenador de TI",
    tipoVinculo: "Comissionado", cargoGestao: true, situacao: "EM ABERTO", origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "2021-10-15", periodoAquisitivoFim: "2022-10-14",
    parcelas: [{ id: 1, inicio: "2025-01-27", fim: "2025-02-15", dias: 20 }],
    substitutos: [{ id: 1, nome: "Fernanda Lopes Barreto (matr. 251090)", inicio: "2025-01-27", fim: "2025-02-15", portaria: "4712/2025" }],
  }),
  registroBase({
    id: 4, servidorNome: "Claudia Moreira Arrais de Oliveira", matricula: "249253", cargo: "Assessora Técnica",
    tipoVinculo: "Comissionado", situacao: "EM ABERTO", origem: "SIGEP",
    periodoAquisitivoInicio: "2022-07-01", periodoAquisitivoFim: "2023-06-30",
    parcelas: [{ id: 1, inicio: "2024-09-26", fim: "2024-10-25", dias: 30 }],
  }),
  registroBase({
    id: 5, servidorNome: "Claudio Luciano Capistrano de Camargo", matricula: "243417", cargo: "Coordenador de TI",
    tipoVinculo: "Comissionado", cargoGestao: true, situacao: "EM ABERTO", origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "2022-10-15", periodoAquisitivoFim: "2023-10-14",
    parcelas: [{ id: 1, inicio: "2026-09-08", fim: "2026-09-17", dias: 10 }],
    substitutos: [{ id: 1, nome: "Fernanda Lopes Barreto (matr. 251090)", inicio: "2026-09-08", fim: "2026-09-17", portaria: "4821/2026" }],
  }),
  registroBase({
    id: 6, servidorNome: "Claudio Luciano Capistrano de Camargo", matricula: "243417", cargo: "Coordenador de TI",
    tipoVinculo: "Comissionado", cargoGestao: true, situacao: "QUITADO", origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "2022-10-15", periodoAquisitivoFim: "2023-10-14",
    parcelas: [{ id: 1, inicio: "2026-12-01", fim: "2026-12-20", dias: 20 }],
    substitutos: [{ id: 1, nome: "Fernanda Lopes Barreto (matr. 251090)", inicio: "2026-12-01", fim: "2026-12-20", portaria: "" }],
  }),
  registroBase({
    id: 7, servidorNome: "João Silva", matricula: "327305", cargo: "Analista Administrativo",
    tipoVinculo: "Efetivo", cargoGestao: true, situacao: "EM ABERTO", origem: "SIGEP",
    periodoAquisitivoInicio: "2025-01-01", periodoAquisitivoFim: "2025-12-31",
    parcelas: [
      { id: 1, inicio: "2026-11-02", fim: "2026-11-21", dias: 20, terco: true },
      { id: 2, inicio: "2027-02-01", fim: "2027-02-10", dias: 10 },
    ],
    substitutos: [
      { id: 1, nome: "Ricardo Almeida Nunes (matr. 118732)", inicio: "2026-11-02", fim: "2026-11-21", portaria: "4790/2026" },
      { id: 2, nome: "Bruno Cardoso Freitas (matr. 203344)", inicio: "2027-02-01", fim: "2027-02-10", portaria: "4512/2027" },
    ],
  }),
  registroBase({
    id: 8, servidorNome: "Ana Lúcia Ferreira", matricula: "551023", cargo: "Professor",
    tipoVinculo: "Efetivo", orgao: "SEDUC/MT", orgaoColetivo: "SEDUC", setor: "Escola Estadual Antônio Ferreira",
    tipo: "Coletiva", situacao: "EM ABERTO", origem: "SIGEP",
    periodoAquisitivoInicio: "2026-01-01", periodoAquisitivoFim: "2026-12-31",
    parcelas: [
      { id: 1, inicio: "2026-07-06", fim: "2026-07-20", dias: 15 },
      { id: 2, inicio: "2027-01-04", fim: "2027-02-02", dias: 30 },
    ],
    loteId: "LOTE-SEDUC-2026", responsavelLancamento: "Secretaria Escolar — E.E. Antônio Ferreira",
  }),
  registroBase({
    id: 9, servidorNome: "Marina Costa Alves", matricula: "418920", cargo: "Analista Técnico",
    tipoVinculo: "Efetivo", situacao: "AGUARDANDO VALIDAÇÃO", origem: "PORTALSERVIDOR",
    periodoAquisitivoInicio: "2025-01-15", periodoAquisitivoFim: "2026-01-14",
    parcelas: [{ id: 1, inicio: "2026-11-10", fim: "2026-11-24", dias: 15 }],
    dataLimiteValidacaoChefia: "2026-10-19",
    responsavelLancamento: "Marina Costa Alves (Portal do Servidor)",
    lancadoEm: "2026-10-11 14:20",
  }),
  registroBase({
    id: 10, servidorNome: "Rodrigo Nunes Ferraz", matricula: "778899", cargo: "Professor Substituto",
    tipoVinculo: "Contrato Temporário", situacao: "AGUARDANDO VALIDAÇÃO", origem: "PORTALSERVIDOR",
    orgao: "SEDUC/MT", setor: "Escola Estadual Marechal Rondon",
    periodoAquisitivoInicio: "2026-05-01", periodoAquisitivoFim: "2027-04-30",
    parcelas: [{ id: 1, inicio: "2026-10-01", fim: "2026-10-30", dias: 30 }],
    dataLimiteValidacaoChefia: "2026-10-06",
    responsavelLancamento: "Rodrigo Nunes Ferraz (Portal do Servidor)",
    lancadoEm: "2026-09-28 09:05",
  }),
  registroBase({
    id: 11, servidorNome: "Beatriz Andrade Correia", matricula: "310021", cargo: "Residente Técnico — Enfermagem",
    tipoVinculo: "Residente Técnico", tipo: "Recesso", situacao: "AGUARDANDO VALIDAÇÃO", origem: "PORTALSERVIDOR",
    setor: "Hospital Regional de Mato Grosso",
    periodoAquisitivoInicio: "2026-02-01", periodoAquisitivoFim: "",
    parcelas: [{ id: 1, inicio: "2026-11-05", fim: "2026-11-19", dias: 15 }],
    dataLimiteValidacaoChefia: "2026-10-21",
    bloqueioAuxilioTransporte: true,
    emailChefiaEnviado: true,
    responsavelLancamento: "Beatriz Andrade Correia (Portal do Servidor)",
    lancadoEm: "2026-10-13 08:40",
  }),
];

function calcularFim(inicio: string, dias: number) {
  if (!inicio || !dias) return "";
  const data = new Date(inicio + "T00:00:00");
  data.setDate(data.getDate() + (dias - 1));
  return data.toISOString().slice(0, 10);
}

function diasEntre(dataA: string, dataB: string) {
  const a = new Date(dataA + "T00:00:00");
  const b = new Date(dataB + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function calcularCarencia(inicio: string) {
  if (!inicio) return null;
  const hoje = new Date().toISOString().slice(0, 10);
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
      return `Intervalo entre parcelas inválido (${formatarDataBr(anterior.fim)} → ${formatarDataBr(atual.inicio)}): só é permitido 0 ou 10 dias corridos entre uma parcela e a próxima.`;
    }
  }
  return "";
}

/** Chefia tem 8 dias corridos a partir do agendamento para validar
 *  (3 dias a mais que o servidor, que tem até o dia 5 do mês anterior). */
function calcularPrazoValidacaoChefia(): string {
  const data = new Date();
  data.setDate(data.getDate() + 8);
  return data.toISOString().slice(0, 10);
}

function prazoValidacaoExpirado(registro: FeriasRegistro): boolean {
  if (registro.situacao !== "AGUARDANDO VALIDAÇÃO" || !registro.dataLimiteValidacaoChefia) return false;
  const hoje = new Date().toISOString().slice(0, 10);
  return hoje > registro.dataLimiteValidacaoChefia;
}

function formatarDataBr(iso: string) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

function periodoUsufruto(registro: FeriasRegistro) {
  if (!registro.parcelas.length) return "—";
  const inicio = registro.parcelas.reduce((menor, parcela) => (parcela.inicio < menor ? parcela.inicio : menor), registro.parcelas[0].inicio);
  const fim = registro.parcelas.reduce((maior, parcela) => (parcela.fim > maior ? parcela.fim : maior), registro.parcelas[0].fim);
  return `${formatarDataBr(inicio)} a ${formatarDataBr(fim)}`;
}

function periodoAquisitivoLabel(registro: FeriasRegistro) {
  if (registro.periodoAquisitivoLabel) return registro.periodoAquisitivoLabel;
  if (!registro.periodoAquisitivoInicio) return "—";
  return `${formatarDataBr(registro.periodoAquisitivoInicio)} à ${formatarDataBr(registro.periodoAquisitivoFim)}`;
}

function tipoRegistroDe(tipoVinculo: TipoVinculo): TipoRegistro {
  return tipoVinculo === "Residente Técnico" || tipoVinculo === "Bolsista" || tipoVinculo === "Estagiário"
    ? "LICENÇA REMUNERADA"
    : "FÉRIAS";
}

function permiteSolicitacaoFerias(tipoVinculo: TipoVinculo): boolean {
  return tipoVinculo === "Efetivo" || tipoVinculo === "Comissionado" || tipoVinculo === "Contrato Temporário";
}

function diasSolicitados(registro: FeriasRegistro) {
  return registro.parcelas.reduce((total, parcela) => total + parcela.dias, 0);
}

function situacaoSubstituicao(fim: string): "Vigente" | "Encerrada" {
  if (!fim) return "Vigente";
  const hoje = new Date().toISOString().slice(0, 10);
  return fim >= hoje ? "Vigente" : "Encerrada";
}

function carregarRegistros(): FeriasRegistro[] {
  try {
    const salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as FeriasRegistro[] | null;
    return salvos ?? registrosBase;
  } catch {
    return registrosBase;
  }
}

function persistirRegistros(registros: FeriasRegistro[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
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

function carregarPerfil(): PerfilAcesso {
  const salvo = localStorage.getItem(PERFIL_STORAGE_KEY);
  if (salvo === "Servidor" || salvo === "Chefia Imediata" || salvo === "RH / Gestão de Pessoas") return salvo;
  return "RH / Gestão de Pessoas";
}

export function PrototiposFeriasPage() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState<FeriasRegistro[]>(carregarRegistros);
  const [perfil, setPerfil] = useState<PerfilAcesso>(carregarPerfil);
  const [aba, setAba] = useState<AbaFerias>("gestao");
  const [filtroOrgao, setFiltroOrgao] = useState("");
  const [filtroSetor, setFiltroSetor] = useState("");
  const [filtroServidor, setFiltroServidor] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState<"" | SituacaoFerias>("");
  const [fluxoNovaSolicitacao, setFluxoNovaSolicitacao] = useState<"escolha" | TipoSolicitacao | null>(null);
  const [registroSubstituicao, setRegistroSubstituicao] = useState<FeriasRegistro | null>(null);
  const [registroVisualizacao, setRegistroVisualizacao] = useState<FeriasRegistro | null>(null);
  const [registroEdicaoRecesso, setRegistroEdicaoRecesso] = useState<FeriasRegistro | null>(null);
  const [registroEdicaoIndividual, setRegistroEdicaoIndividual] = useState<FeriasRegistro | null>(null);
  const [menuAbertoId, setMenuAbertoId] = useState<number | null>(null);
  const [confirmacaoStatus, setConfirmacaoStatus] = useState<{ registro: FeriasRegistro; acao: AcaoStatus } | null>(null);
  const [subBusca, setSubBusca] = useState("");
  const [subSituacao, setSubSituacao] = useState<"" | "Vigente" | "Encerrada">("");

  const atualizarRegistros = (proximos: FeriasRegistro[]) => {
    setRegistros(proximos);
    persistirRegistros(proximos);
  };

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
  }, [registros, filtroOrgao, filtroSetor, filtroServidor, filtroSituacao]);

  const linhasSubstituicao = useMemo(() => {
    const buscaNormalizada = subBusca.trim().toLocaleLowerCase("pt-BR");
    const linhas: LinhaSubstituicao[] = [];
    registros.forEach((registro) => {
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

  const temColetivaNoFiltro = registrosFiltrados.some((registro) => registro.tipo === "Coletiva");

  const indicadores = useMemo(() => {
    const porSituacao = (situacao: SituacaoFerias) => registrosFiltrados.filter((registro) => registro.situacao === situacao).length;
    const porVinculo = (vinculo: TipoVinculo) => registrosFiltrados.filter((registro) => registro.tipoVinculo === vinculo).length;
    const porTipoRegistro = (tipo: TipoRegistro) => registrosFiltrados.filter((registro) => tipoRegistroDe(registro.tipoVinculo) === tipo).length;
    return {
      total: registrosFiltrados.length,
      emAberto: porSituacao("EM ABERTO"),
      quitado: porSituacao("QUITADO"),
      suspenso: porSituacao("SUSPENSO"),
      comissionado: porVinculo("Comissionado"),
      contratoTemporario: porVinculo("Contrato Temporário"),
      residenteTecnico: porVinculo("Residente Técnico"),
      bolsista: porVinculo("Bolsista"),
      ferias: porTipoRegistro("FÉRIAS"),
      licencaRemunerada: porTipoRegistro("LICENÇA REMUNERADA"),
    };
  }, [registrosFiltrados]);

  const limparFiltros = () => {
    setFiltroOrgao("");
    setFiltroSetor("");
    setFiltroServidor("");
    setFiltroSituacao("");
  };

  // Só é possível editar enquanto aguarda validação da chefia — uma vez "Em Aberto",
  // o servidor já está cumprindo o período, então a solicitação deixa de ser editável.
  const podeEditar = (registro: FeriasRegistro) =>
    (registro.tipo === "Individual" || registro.tipo === "Recesso") &&
    registro.situacao === "AGUARDANDO VALIDAÇÃO";

  const aplicarStatus = (registroId: number, novaSituacao: SituacaoFerias, acao?: AcaoStatus) => {
    const proximos = registros.map((registro) => {
      if (registro.id !== registroId) return registro;
      // RN013 (US50): o bloqueio do auxílio-transporte e a integração com o SIGPAS só se
      // efetivam quando a chefia valida o recesso do residente/bolsista — não no lançamento.
      const efetivaBeneficiosRecesso =
        acao === "validar" &&
        registro.tipo === "Recesso" &&
        (registro.tipoVinculo === "Residente Técnico" || registro.tipoVinculo === "Bolsista");
      // Registra quem avaliou (validou ou rejeitou) a solicitação, para exibir no "Visualizar".
      const marcaAvaliacao = acao === "validar" || acao === "rejeitar";
      return {
        ...registro,
        situacao: novaSituacao,
        ...(efetivaBeneficiosRecesso ? { auxilioTransporteEfetivado: true, sigpasIntegrado: true } : {}),
        ...(marcaAvaliacao ? { avaliadoPor: "Usuário atual", avaliadoEm: new Date().toLocaleString("pt-BR") } : {}),
      };
    });
    atualizarRegistros(proximos);
    setConfirmacaoStatus(null);
  };

  const salvarEdicaoRecesso = (registroId: number, parcelas: ParcelaFerias[]) => {
    const proximos = registros.map((registro) =>
      registro.id === registroId ? { ...registro, parcelas } : registro,
    );
    atualizarRegistros(proximos);
    setRegistroEdicaoRecesso(null);
  };

  const salvarEdicaoIndividual = (registroId: number, parcelas: ParcelaFerias[]) => {
    const proximos = registros.map((registro) =>
      registro.id === registroId ? { ...registro, parcelas } : registro,
    );
    atualizarRegistros(proximos);
    setRegistroEdicaoIndividual(null);
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
                <option value="Servidor">Servidor (somente leitura)</option>
                <option value="Chefia Imediata">Chefia Imediata (avalia)</option>
                <option value="RH / Gestão de Pessoas">RH / Gestão de Pessoas (acesso completo)</option>
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

          {temColetivaNoFiltro ? (
            <div className="prototype-ferias-banner">
              <i className="pi pi-info-circle" aria-hidden="true" />
              <span>
                <strong>Regra exclusiva SEDUC/UNEMAT — professor em exercício na escola:</strong> recesso em 2 parcelas
                fixas, 15 dias em julho + 30 dias em janeiro (LC 50/1998, Decreto 656/2020, Portaria 1200/2023/GS/SEDUC/MT).
                Não se aplica a outros órgãos (ex.: SEPLAG), onde a férias segue o regime normal de 30 dias parceláveis.
                Professor SEDUC lotado fora da unidade escolar (sede, cedido) usufrui só os 30 dias de janeiro. Lançamento
                em lote, não individual — use "Nova solicitação (manual)" → aba "Coletiva (SEDUC)".
              </span>
            </div>
          ) : null}

          {aba === "gestao" ? (
            <>
              <div className="prototype-ferias-indicadores">
                <IndicadorCard rotulo="TOTAL" valor={indicadores.total} />
                <IndicadorCard rotulo="EM ABERTO" valor={indicadores.emAberto} tom="sucesso" />
                <IndicadorCard rotulo="QUITADO" valor={indicadores.quitado} tom="info" />
                <IndicadorCard rotulo="SUSPENSO" valor={indicadores.suspenso} tom="alerta" />
                <IndicadorCard rotulo="COMISSIONADO" valor={indicadores.comissionado} />
                <IndicadorCard rotulo="CONTRATO TEMPORÁRIO" valor={indicadores.contratoTemporario} />
                <IndicadorCard rotulo="RESIDENTE TÉCNICO" valor={indicadores.residenteTecnico} tom="roxo" />
                <IndicadorCard rotulo="BOLSISTA" valor={indicadores.bolsista} tom="roxo" />
                <IndicadorCard rotulo="FÉRIAS" valor={indicadores.ferias} tom="info" />
                <IndicadorCard rotulo="LICENÇA REMUNERADA" valor={indicadores.licencaRemunerada} tom="roxo" />
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
                  <span>Setor</span>
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
                    <option value="EM ABERTO">Em aberto</option>
                    <option value="QUITADO">Quitado</option>
                    <option value="CANCELADO">Cancelado</option>
                    <option value="REPROVADO">Reprovado</option>
                    <option value="SUSPENSO">Suspenso</option>
                  </select>
                </label>
                <BotaoLimparFiltroSeplag type="button" label="Limpar filtro" className="prototype-ferias-limpar-filtro" onClick={limparFiltros} />
              </div>

              <div className="prototype-ferias-acoes-topo">
                <button type="button" className="prototype-ferias-btn-primario" onClick={() => setFluxoNovaSolicitacao("escolha")}>
                  <i className="pi pi-plus" aria-hidden="true" />
                  Nova solicitação de férias
                </button>
              </div>

              <TabelaRegistros
                registros={registrosFiltrados}
                perfil={perfil}
                onVisualizar={setRegistroVisualizacao}
                onEditar={(registro) => {
                  if (registro.tipo === "Recesso") setRegistroEdicaoRecesso(registro);
                  else if (registro.tipo === "Individual") setRegistroEdicaoIndividual(registro);
                  else setRegistroVisualizacao(registro);
                }}
                onGerenciarSubstituicao={setRegistroSubstituicao}
                onAlterarStatus={(registro, acao) => setConfirmacaoStatus({ registro, acao })}
                podeEditar={podeEditar}
                menuAbertoId={menuAbertoId}
                setMenuAbertoId={setMenuAbertoId}
              />
            </>
          ) : null}

          {aba === "aprovacoes" && podeAvaliar(perfil) ? (
            <AbaAprovacoes
              registros={registrosPendentesAprovacao}
              onVisualizar={setRegistroVisualizacao}
              onAlterarStatus={(registro, acao) => setConfirmacaoStatus({ registro, acao })}
            />
          ) : null}

          {aba === "substituicoes" ? (
            <div className="prototype-ferias-sub-aba">
              <h2 className="prototype-ferias-sub-titulo">Substituições Ativas (Art. 21 — LC 266/2006)</h2>
              <p className="prototype-ferias-sub-subtitulo">
                Só cargo de chefia/direção, parcela ≥ 10 dias — comissionado. Temporário, residente e bolsista nunca
                geram substituição.
              </p>

              <div className="prototype-ferias-indicadores">
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

      {registroVisualizacao ? (
        <ModalVisualizarRegistro registro={registroVisualizacao} onFechar={() => setRegistroVisualizacao(null)} />
      ) : null}

      {registroEdicaoRecesso ? (
        <ModalAlterarRecesso
          registro={registroEdicaoRecesso}
          onFechar={() => setRegistroEdicaoRecesso(null)}
          onSalvar={(parcelas) => salvarEdicaoRecesso(registroEdicaoRecesso.id, parcelas)}
        />
      ) : null}

      {registroEdicaoIndividual ? (
        <ModalAlterarIndividual
          registro={registroEdicaoIndividual}
          onFechar={() => setRegistroEdicaoIndividual(null)}
          onSalvar={(parcelas) => salvarEdicaoIndividual(registroEdicaoIndividual.id, parcelas)}
        />
      ) : null}

      {confirmacaoStatus ? (
        <ModalConfirmarStatus
          registro={confirmacaoStatus.registro}
          acao={confirmacaoStatus.acao}
          onFechar={() => setConfirmacaoStatus(null)}
          onConfirmar={(novaSituacao) => aplicarStatus(confirmacaoStatus.registro.id, novaSituacao, confirmacaoStatus.acao)}
        />
      ) : null}
    </PrototypeSystemPage>
  );
}

function elegivelSubstituicao(registro: FeriasRegistro) {
  return (
    registro.cargoGestao &&
    registro.parcelas.some((parcela) => parcela.dias >= 10) &&
    registro.situacao !== "CANCELADO" &&
    registro.situacao !== "AGUARDANDO VALIDAÇÃO"
  );
}

function podeValidarChefia(registro: FeriasRegistro) {
  return registro.situacao === "AGUARDANDO VALIDAÇÃO";
}

function podeRejeitar(registro: FeriasRegistro) {
  return registro.situacao === "AGUARDANDO VALIDAÇÃO";
}

/** Permissões por perfil: Servidor só visualiza; Chefia Imediata só avalia
 *  (valida/rejeita) as solicitações de sua equipe; RH/Gestão de Pessoas
 *  tem acesso completo (homologa, edita, suspende, cancela). */
function podeAvaliar(perfil: PerfilAcesso) {
  return perfil === "Chefia Imediata" || perfil === "RH / Gestão de Pessoas";
}

function podeGerenciarCompleto(perfil: PerfilAcesso) {
  return perfil === "RH / Gestão de Pessoas";
}

function podeSuspender(registro: FeriasRegistro) {
  return registro.situacao === "EM ABERTO";
}

function podeReativar(registro: FeriasRegistro) {
  return registro.situacao === "SUSPENSO";
}

function podeCancelar(registro: FeriasRegistro) {
  return registro.situacao === "EM ABERTO" || registro.situacao === "SUSPENSO";
}

function IndicadorCard({ rotulo, valor, tom }: Readonly<{ rotulo: string; valor: number; tom?: "sucesso" | "info" | "alerta" | "roxo" | "vermelho" }>) {
  const icones: Record<string, string> = { TOTAL: "pi-chart-bar", "EM ABERTO": "pi-clock", QUITADO: "pi-check-circle", SUSPENSO: "pi-pause-circle", COMISSIONADO: "pi-id-card", "CONTRATO TEMPORÁRIO": "pi-file", "RESIDENTE TÉCNICO": "pi-briefcase", BOLSISTA: "pi-graduation-cap", FÉRIAS: "pi-calendar", "LICENÇA REMUNERADA": "pi-wallet", VIGENTE: "pi-check-circle", ENCERRADA: "pi-calendar-times", "SEM PORTARIA": "pi-exclamation-circle" };
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
  onAlterarStatus: (registro: FeriasRegistro, acao: AcaoStatus) => void;
  podeEditar: (registro: FeriasRegistro) => boolean;
  menuAbertoId: number | null;
  setMenuAbertoId: (id: number | null) => void;
}

function TabelaRegistros({
  registros,
  perfil,
  onVisualizar,
  onEditar,
  onGerenciarSubstituicao,
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
            <th>Matrícula</th>
            <th>Órgão</th>
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
          {registros.slice(primeiroAtual, primeiroAtual + porPagina).map((registro) => (
            <tr key={registro.id}>
              <td>
                {registro.matricula}
                <br />
                <small>{registro.tipoVinculo}</small>
              </td>
              <td>{registro.orgao}</td>
              <td>
                <strong>{registro.servidorNome}</strong>
                {registro.cargoGestao ? <span className="prototype-ferias-badge-chefia"><i className="pi pi-star-fill" aria-hidden="true" /> CHEFIA</span> : null}
                <br />
                <small>{registro.setor}</small>
              </td>
              <td>
                {periodoAquisitivoLabel(registro)}
                {registro.regraAquisitivo === "USUFRUTO_ANTECIPADO" ? (
                  <small className="prototype-ferias-regra-unemat-status">Usufruto antecipado · saldo a conciliar</small>
                ) : null}
              </td>
              <td>{periodoUsufruto(registro)}</td>
              <td>
                <span className="prototype-ferias-badge-tipo">{tipoRegistroDe(registro.tipoVinculo) === "FÉRIAS" ? "Férias" : "Licença remunerada"}</span>
              </td>
              <td className="prototype-ferias-dias-solicitados">
                {diasSolicitados(registro)}{" "}
                <small>
                  {registro.tipo === "Coletiva"
                    ? "COLETIVA"
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
                {prazoValidacaoExpirado(registro) ? (
                  <span className="prototype-ferias-badge is-cancelado">Prazo expirado</span>
                ) : (
                  <span className={`prototype-ferias-badge is-${classeSituacao(registro.situacao)}`}>{registro.situacao.charAt(0) + registro.situacao.slice(1).toLocaleLowerCase("pt-BR")}</span>
                )}
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
                    onClick={() => setMenuAbertoId(menuAbertoId === registro.id ? null : registro.id)}
                  >
                    <i className="pi pi-chevron-down" aria-hidden="true" />
                  </button>
                  {menuAbertoId === registro.id ? (
                    <div className="prototype-ferias-menu-acoes">
                      <button type="button" onClick={() => { onVisualizar(registro); setMenuAbertoId(null); }}>
                        <i className="pi pi-eye" aria-hidden="true" /> Visualizar
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
                      {podeAvaliar(perfil) && podeValidarChefia(registro) ? (
                        <button
                          type="button"
                          className="is-acao-verde"
                          onClick={() => { onAlterarStatus(registro, "validar"); setMenuAbertoId(null); }}
                        >
                          <i className="pi pi-check-circle" aria-hidden="true" /> Validar (chefia)
                        </button>
                      ) : null}
                      {podeAvaliar(perfil) && podeRejeitar(registro) ? (
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
                          <i className="pi pi-play" aria-hidden="true" /> Reativar
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
          ))}
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

function AbaAprovacoes({
  registros,
  onVisualizar,
  onAlterarStatus,
}: Readonly<{
  registros: FeriasRegistro[];
  onVisualizar: (registro: FeriasRegistro) => void;
  onAlterarStatus: (registro: FeriasRegistro, acao: AcaoStatus) => void;
}>) {
  return (
    <div className="prototype-ferias-sub-aba">
      <h2 className="prototype-ferias-sub-titulo">Avaliar e Aprovar Férias</h2>
      <p className="prototype-ferias-sub-subtitulo">
        Fila de solicitações aguardando validação. A chefia imediata tem 8 dias corridos a partir do agendamento
        para validar — sem validação no prazo, a solicitação é rejeitada automaticamente e o saldo é devolvido.
      </p>

      {!registros.length ? (
        <div className="prototype-ferias-empty">Nenhuma solicitação aguardando aprovação no momento.</div>
      ) : (
        <div className="prototype-ferias-fila-aprovacao">
          {registros.map((registro) => (
            <div key={registro.id} className="prototype-ferias-card-aprovacao">
              <div className="prototype-ferias-card-aprovacao-info">
                <strong>{registro.servidorNome}</strong>
                {registro.cargoGestao ? (
                  <span className="prototype-ferias-badge-chefia"><i className="pi pi-star-fill" aria-hidden="true" /> CHEFIA</span>
                ) : null}
                <span className="prototype-ferias-card-aprovacao-sub">
                  {registro.matricula} · {registro.orgao} · {registro.setor}
                </span>
                <span className="prototype-ferias-card-aprovacao-sub">
                  Período: {periodoUsufruto(registro)} · {diasSolicitados(registro)} dia(s) · {registro.tipo}
                </span>
                {prazoValidacaoExpirado(registro) ? (
                  <span className="prototype-ferias-alerta-texto">
                    PRAZO EXPIRADO — limite era {formatarDataBr(registro.dataLimiteValidacaoChefia ?? "")}
                  </span>
                ) : (
                  <span className="prototype-ferias-card-aprovacao-prazo">
                    Validar até {formatarDataBr(registro.dataLimiteValidacaoChefia ?? "")}
                  </span>
                )}
              </div>
              <div className="prototype-ferias-card-aprovacao-acoes">
                <button type="button" className="prototype-ferias-icon-btn" title="Visualizar" onClick={() => onVisualizar(registro)}>
                  <i className="pi pi-eye" aria-hidden="true" />
                </button>
                <button type="button" className="prototype-ferias-btn-rejeitar" onClick={() => onAlterarStatus(registro, "rejeitar")}>
                  <i className="pi pi-times-circle" aria-hidden="true" /> Rejeitar
                </button>
                <button type="button" className="prototype-ferias-btn-validar" onClick={() => onAlterarStatus(registro, "validar")}>
                  <i className="pi pi-check-circle" aria-hidden="true" /> Validar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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
            <strong>Coletiva (SEDUC/UNEMAT)</strong>
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
}: Readonly<{ onCancelar: () => void; onSalvar: (registro: FeriasRegistro) => void }>) {
  const [servidorNome, setServidorNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [orgao, setOrgao] = useState("SEPLAG/MT");
  const [setor, setSetor] = useState("");
  const [cargo, setCargo] = useState("");
  const [tipoVinculo, setTipoVinculo] = useState<TipoVinculo | "">("" as TipoVinculo);
  const [cargoGestao, setCargoGestao] = useState<boolean | null>(null);
  const [periodoAquisitivoInicio, setPeriodoAquisitivoInicio] = useState("");
  const [periodoAquisitivoFim, setPeriodoAquisitivoFim] = useState("");
  const [saldoDisponivel, setSaldoDisponivel] = useState<number | null>(null);
  const [parcelas, setParcelas] = useState<ParcelaFerias[]>([]);
  const [erro, setErro] = useState("");
  const [servidorEncontrado, setServidorEncontrado] = useState(false);
  const [servidorBusca, setServidorBusca] = useState("");
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

  const opcoesDuracao = useMemo(
    () => [30, 20, 15, 10].filter((dias) => dias <= saldoRestante && dias >= 10),
    [saldoRestante],
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
    setServidorNome(servidor.nome);
    setMatricula(servidor.matricula);
    setOrgao(servidor.orgao);
    setSetor(servidor.setor);
    setCargo(servidor.cargo);
    setTipoVinculo(servidor.tipoVinculo);
    setCargoGestao(servidor.cargoGestao);
    setPeriodoAquisitivoInicio(servidor.periodoAquisitivoInicio);
    setPeriodoAquisitivoFim(servidor.periodoAquisitivoFim);
    setSaldoDisponivel(servidor.saldoDisponivel);
    setServidorEncontrado(true);
    setServidorBusca(descricaoServidor(servidor));
    const todosVinculos = vinculosDoServidor(servidor.nome);
    const indice = todosVinculos.findIndex(
      (vinculo) => vinculo.matricula === servidor.matricula && vinculo.tipoVinculo === servidor.tipoVinculo,
    ) + 1;
    setVinculoInfo({ indice: Math.max(indice, 1), total: todosVinculos.length });
  };

  const completarBuscaServidor = (query: string) => {
    const termo = query.trim().toLocaleLowerCase("pt-BR");
    const cpfBusca = termo.replace(/\D/g, "");
    const resultados = (!termo
      ? SERVIDORES_MOCK
      : SERVIDORES_MOCK.filter(
          (servidor) =>
            servidor.matricula.includes(termo) ||
            servidor.nome.toLocaleLowerCase("pt-BR").includes(termo) ||
            Boolean(cpfBusca && servidor.cpf?.replace(/\D/g, "").includes(cpfBusca)),
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
    const cpfBusca = termo.replace(/\D/g, "");
    const encontrado = SERVIDORES_MOCK.find(
      (servidor) =>
        servidor.matricula.toLocaleLowerCase("pt-BR") === termo ||
        servidor.nome.toLocaleLowerCase("pt-BR") === termo ||
        Boolean(cpfBusca && servidor.cpf?.replace(/\D/g, "").includes(cpfBusca)) ||
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
    setParcelas((atual) => [
      ...atual,
      { id: gerarId(), inicio: draftInicio, fim: draftFim, dias: draftDias, terco: draftTerco },
    ]);
    setErro("");
    setGozoValor("dataInicio", "");
    setGozoValor("terco", false);
  };

  const removerParcela = (id: number) => {
    setParcelas((atual) => atual.filter((parcela) => parcela.id !== id));
  };

  const salvar = () => {
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
    if (totalParcelado !== saldoDisponivel) {
      setErro(`A soma das parcelas (${totalParcelado} dias) precisa fechar exatamente o saldo disponível (${saldoDisponivel} dias).`);
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
      situacao: "AGUARDANDO VALIDAÇÃO",
      dataLimiteValidacaoChefia: calcularPrazoValidacaoChefia(),
      substitutos: [],
      responsavelLancamento: "Usuário atual",
      lancadoEm: new Date().toLocaleString("pt-BR"),
    });
  };

  return (
    <div className="prototype-ferias-individual-form">
      {erro ? <div className="prototype-ferias-erro-bloqueio">{erro}</div> : null}

      <div className="prototype-ferias-banner" style={{ background: "#eff6ff", borderColor: "#bfdbfe", color: "#1d4ed8" }}>
        <i className="pi pi-info-circle" aria-hidden="true" />
        <span>
          Ao salvar, a solicitação entra como <strong>Aguardando Validação</strong>. A chefia imediata tem 8 dias
          corridos para validar — sem validação no prazo, o sistema rejeita automaticamente e devolve o saldo.
        </span>
      </div>

      <div className="prototype-ferias-form-section">
        <h3 className="prototype-ferias-secao-titulo">
          <i className="pi pi-user" aria-hidden="true" />
          1. Identificação do Servidor &amp; Saldo Aquisitivo
          {servidorEncontrado && (
            <span className="prototype-ferias-servidor-encontrado">
              <i className="pi pi-check-circle" /> Servidor encontrado — campos preenchidos automaticamente
            </span>
          )}
        </h3>
        <label className="prototype-ferias-busca-servidor-label" htmlFor="ferias-individual-busca-servidor">
          <span>Buscar Servidor (Matrícula, CPF ou Nome)</span>
          <div className="prototype-ferias-busca-servidor-row">
            <SeplagAutoComplete
              inputId="ferias-individual-busca-servidor"
              className="w-full"
              value={servidorBusca}
              suggestions={sugestoesServidor}
              placeholder="Matrícula, CPF ou nome do servidor"
              forceSelection={false}
              completeMethod={completarBuscaServidor}
              onChange={(event) => setServidorBusca(String(event.value ?? ""))}
              onSelect={(event) => selecionarServidor(String(event.value ?? ""))}
            />
            <BotaoBuscarServidor onClick={() => buscarServidorIndividual(servidorBusca)} />
          </div>
        </label>

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

        {parcelas.length > 0 && (
          <div className="prototype-ferias-gozo-lista">
            {parcelas.map((parcela) => (
              <div className="prototype-ferias-gozo-item" key={parcela.id}>
                <span>
                  {formatarDataBr(parcela.inicio)} a {formatarDataBr(parcela.fim)} ({parcela.dias} dias)
                  {parcela.terco ? <span className="prototype-ferias-badge-tipo"> + 1/3 constitucional</span> : null}
                </span>
                <button type="button" className="prototype-ferias-icon-btn" title="Remover parcela" onClick={() => removerParcela(parcela.id)}>
                  <i className="pi pi-trash" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="prototype-ferias-gozo-terco">
          <input type="checkbox" checked={draftTerco} onChange={(event) => setGozoValor("terco", event.target.checked)} />
          Pagar o Adicional Constitucional de 1/3 nesta parcela (Art. 19, II)
        </label>
      </div>

      <div className="prototype-vinculo-form prototype-ferias-lancamento-acoes" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <BotaoVoltarSeplag type="button" label="Voltar" onClick={onCancelar} />
        <BotaoSalvarSeplag type="button" label="Salvar solicitação" onClick={salvar} />
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
    orgao: "SEDUC" | "UNEMAT";
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
  const [orgao, escola, periodoAquisitivo, tipoVinculoFiltro] = watchColetiva([
    "orgao",
    "escola",
    "periodoAquisitivo",
    "tipoVinculoFiltro",
  ]);
  const [inicioJulho, setInicioJulho] = useState(`${anoAtual}-07-06`);
  const [inicioJaneiro, setInicioJaneiro] = useState(`${anoAtual + 1}-01-04`);
  const [textoBusca, setTextoBusca] = useState("");
  const [buscaNome, setBuscaNome] = useState("");
  const [primeiroRegistro, setPrimeiroRegistro] = useState(0);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [selecionados, setSelecionados] = useState<Record<number, {
    incluido: boolean;
    julho: boolean;
    janeiro: boolean;
  }>>({});
  const [erro, setErro] = useState<string[]>([]);
  const [confirmacao, setConfirmacao] = useState("");
  const [registrosPersistidos, setRegistrosPersistidos] = useState<FeriasRegistro[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") ?? [];
    } catch {
      return [];
    }
  });
  const [soComAlerta, setSoComAlerta] = useState(false);
  const [soComAlertaAba1, setSoComAlertaAba1] = useState(false);
  const [abaColetiva, setAbaColetiva] = useState<1 | 2>(1);
  const [primeiroAba2, setPrimeiroAba2] = useState(0);
  const [porPaginaAba2, setPorPaginaAba2] = useState(10);
  const [buscaAba2, setBuscaAba2] = useState("");

  useEffect(() => {
    if (!modoAgendamentoLote) return;
    const proximoOrgao = perfilLote === "GESTAO_UNEMAT" ? "UNEMAT" : "SEDUC";
    const primeiraLotacao = professoresLote.find((professor) => professor.orgao === proximoOrgao)?.lotacaoNome ?? "";
    setColetivaValue("orgao", proximoOrgao);
    setColetivaValue("escola", primeiraLotacao);
    setColetivaValue("tipoVinculoFiltro", "Efetivo");
    setBuscaNome("");
    setTextoBusca("");
    setAbaColetiva(1);
  }, [modoAgendamentoLote, perfilLote, setColetivaValue]);

  useEffect(() => {
    if (!modoAgendamentoLote || perfilLote !== "DRE_SEDUC") return;
    try {
      setRegistrosPersistidos(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") ?? []);
    } catch {
      setRegistrosPersistidos([]);
    }
  }, [modoAgendamentoLote, perfilLote]);

  const fimJulho = calcularFim(inicioJulho, 15);
  const fimJaneiro = calcularFim(inicioJaneiro, 30);
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
        professor.orgao === orgao &&
        (modoAgendamentoLote && perfilLote === "GESTAO_UNEMAT" ? true : professor.lotacaoNome === escola),
    ),
    [modoAgendamentoLote, orgao, escola, perfilLote],
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
      if (soComAlertaAba1 && alertasDe(professor).length === 0) return false;
      return true;
    });
  }, [professoresDaLotacao, buscaNome, tipoVinculoFiltro, soComAlertaAba1, alertasDe]);

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
  }, [orgao, escola, buscaNome, tipoVinculoFiltro, soComAlertaAba1]);

  const estadoLinha = (id: number) => selecionados[id] ?? { incluido: false, julho: false, janeiro: false };

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

  const lancarLote = () => {
    const erros: string[] = [];
    const incluidos = professoresIncluidos;

    if (modoAgendamentoLote && perfilLote === "DRE_SEDUC") {
      setErro(["A DRE pode validar e tramitar lotes, mas não pode lançar férias."]);
      return;
    }

    if (!incluidos.length) {
      erros.push("Selecione pelo menos um servidor na aba 1 antes de prosseguir.");
    }

    const comErro = incluidos.filter((professor) => errosDe(professor).length > 0);
    if (modoAgendamentoLote && comErro.length) {
      erros.push(
        `Servidor(es) com erro bloqueante — remova-os antes de prosseguir: ${comErro.map((professor) => professor.nome).join(", ")}.`,
      );
    }
    const marcadosJulho = incluidos.filter((professor) => estadoLinha(professor.id).julho);
    const marcadosJaneiro = incluidos.filter((professor) => estadoLinha(professor.id).janeiro);
    const semParcela = incluidos.filter((professor) => !estadoLinha(professor.id).julho && !estadoLinha(professor.id).janeiro);
    if (semParcela.length) {
      erros.push(`Marque uma parcela para cada servidor incluído: ${semParcela.map((professor) => professor.nome).join(", ")}.`);
    }
    if (
      modoAgendamentoLote &&
      incluidos.some((professor) => estadoLinha(professor.id).julho && estadoLinha(professor.id).janeiro)
    ) {
      erros.push("No agendamento em lote, cada servidor deve receber a parcela de julho (15 dias) ou a de janeiro (30 dias), não ambas.");
    }

    if (marcadosJulho.length && !inicioJulho) erros.push("Informe a data de início da parcela de julho.");
    if (marcadosJaneiro.length && !inicioJaneiro) erros.push("Informe a data de início da parcela de janeiro.");
    if (!marcadosJulho.length && !marcadosJaneiro.length) {
      erros.push("Marque ao menos uma parcela (julho ou janeiro) na aba 2 antes de lançar.");
    }

    if (erros.length) {
      setErro(erros);
      setConfirmacao("");
      return;
    }

    setErro([]);

    const loteId = `LOTE-${orgao}-${gerarId()}`;
    const anoAquisitivo = Number(periodoAquisitivo);
    const novosRegistros: FeriasRegistro[] = incluidos.map((professor) => {
      const parcelas: ParcelaFerias[] = [];
      if (estadoLinha(professor.id).julho) {
        parcelas.push({ id: 1, inicio: inicioJulho, fim: fimJulho, dias: 15 });
      }
      if (estadoLinha(professor.id).janeiro) {
        parcelas.push({ id: 2, inicio: inicioJaneiro, fim: fimJaneiro, dias: 30 });
      }
      return {
        id: gerarId() + professor.id,
        servidorNome: professor.nome,
        matricula: professor.matricula,
        cpf: "",
        orgao: orgao === "SEDUC" ? "SEDUC/MT" : "UNEMAT/MT",
        orgaoColetivo: orgao,
        setor: professor.lotacaoNome,
        cargo: professor.cargo ?? "Professor",
        cargoGestao: false,
        tipoVinculo: professor.vinculo,
        saldoFerias: professor.saldo,
        saldoFeriasConfirmado: !usaRegraAquisitivoUnemat,
        regraAquisitivo: usaRegraAquisitivoUnemat ? "USUFRUTO_ANTECIPADO" : "PADRAO",
        tipo: modoAgendamentoLote ? "Lote" : "Coletiva",
        origem: "SIGEP",
        periodoAquisitivoInicio: `${anoAquisitivo}-01-01`,
        periodoAquisitivoFim: `${anoAquisitivo}-12-31`,
        periodoAquisitivoLabel: periodoAquisitivo,
        parcelas,
        // Todo lançamento de férias precisa passar por aprovação da chefia antes de ficar
        // Em Aberto — inclusive Coletiva direta e o lote da Gestão de Pessoas da UNEMAT, que
        // antes pulavam a validação.
        situacao: "AGUARDANDO VALIDAÇÃO",
        substitutos: [],
        loteId,
        responsavelLancamento: "Usuário atual",
        lancadoEm: new Date().toLocaleString("pt-BR"),
      };
    });

    const totalJulho = novosRegistros.filter((registro) => registro.parcelas.some((parcela) => parcela.dias === 15)).length;
    const totalJaneiro = novosRegistros.filter((registro) => registro.parcelas.some((parcela) => parcela.dias === 30)).length;

    setConfirmacao(
      `Lote lançado: ${totalJulho} parcela(s) de 15 dias e ${totalJaneiro} parcela(s) de 30 dias criadas. ` +
        `Lançado por Usuário atual em ${new Date().toLocaleString("pt-BR")}.`,
    );

    onSalvar(novosRegistros);
  };

  const lotesPendentesValidacao = useMemo(() => {
    const lotes = new Map<string, FeriasRegistro[]>();
    registrosPersistidos
      .filter((registro) =>
        registro.tipo === "Lote" &&
        registro.orgaoColetivo === "SEDUC" &&
        registro.situacao === "AGUARDANDO VALIDAÇÃO" &&
        Boolean(registro.loteId),
      )
      .forEach((registro) => {
        const loteId = registro.loteId!;
        lotes.set(loteId, [...(lotes.get(loteId) ?? []), registro]);
      });
    return [...lotes.entries()];
  }, [registrosPersistidos]);

  const decidirLotePendente = (loteId: string, registroId?: number) => {
    const registrosAtualizados = registrosPersistidos
      .filter((registro) =>
        registro.loteId === loteId &&
        registro.situacao === "AGUARDANDO VALIDAÇÃO" &&
        (registroId === undefined || registro.id === registroId),
      )
      .map((registro) => ({
        ...registro,
        situacao: registroId === undefined ? "EM ABERTO" as const : "REPROVADO" as const,
      }));
    if (!registrosAtualizados.length) return;
    const porId = new Map(registrosAtualizados.map((registro) => [registro.id, registro]));
    setRegistrosPersistidos((atual) => atual.map((registro) => porId.get(registro.id) ?? registro));
    onSalvar(registrosAtualizados);
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

      {modoAgendamentoLote ? (
        <section className="prototype-ferias-form-section prototype-ferias-lote-perfil">
          <label>
            <span>Perfil de demonstração *</span>
            <select value={perfilLote} onChange={(event) => setPerfilLote(event.target.value as PerfilLote)}>
              <option value="SECRETARIO_SEDUC">Secretário escolar — SEDUC</option>
              <option value="DRE_SEDUC">DRE — SEDUC (validação)</option>
              <option value="GESTAO_UNEMAT">Gestão de Pessoas — UNEMAT</option>
            </select>
          </label>
          <small>
            {perfilLote === "SECRETARIO_SEDUC"
              ? "Lança férias coletivas somente para a escola vinculada; o lote segue à DRE."
              : perfilLote === "DRE_SEDUC"
                ? "A DRE não lança férias: valida os lotes recebidos e pode reprovar servidores individualmente."
                : "A Gestão de Pessoas da UNEMAT visualiza todas as unidades e lança o lote; a validação da chefia acontece à parte, na aba Avaliar e Aprovar."}
          </small>
        </section>
      ) : null}

      {modoAgendamentoLote && perfilLote === "DRE_SEDUC" ? (
        <section className="prototype-ferias-form-section prototype-ferias-lote-secao">
          <h3 className="prototype-ferias-secao-titulo">
            <i className="pi pi-check-square" aria-hidden="true" />
            Lotes pendentes de validação da DRE
          </h3>
          <div className="prototype-ferias-lote-secao-conteudo">
            {lotesPendentesValidacao.length === 0 ? (
              <p className="prototype-ferias-lote-vazio">Não há lotes SEDUC aguardando validação.</p>
            ) : lotesPendentesValidacao.map(([loteId, registros]) => (
              <section className="prototype-ferias-lote-validacao" key={loteId}>
                <div className="prototype-ferias-lote-validacao-topo">
                  <div>
                    <strong>{loteId}</strong>
                    <span>{registros.length} servidor(es) · {registros[0]?.setor || "Unidade não informada"}</span>
                  </div>
                  <button type="button" className="prototype-ferias-btn-primario" onClick={() => decidirLotePendente(loteId)}>
                    <i className="pi pi-check" aria-hidden="true" />
                    Aprovar e tramitar lote
                  </button>
                </div>
                <div className="prototype-ferias-lote-table-wrap">
                  <table className="prototype-ferias-table prototype-ferias-coletiva-table">
                    <thead><tr><th>Servidor</th><th>Vínculo</th><th>Saldo</th><th>Parcelas</th><th>Ação</th></tr></thead>
                    <tbody>
                      {registros.map((registro) => (
                        <tr key={registro.id}>
                          <td>{registro.servidorNome}<small>{registro.matricula}</small></td>
                          <td>{registro.tipoVinculo}</td>
                          <td>{registro.saldoFerias ?? "—"} dias</td>
                          <td>{registro.parcelas.map((parcela) => `${parcela.dias} dias a partir de ${formatarDataBr(parcela.inicio)}`).join(" · ")}</td>
                          <td>
                            <button type="button" className="prototype-ferias-icon-btn" title={`Reprovar ${registro.servidorNome}`} onClick={() => decidirLotePendente(loteId, registro.id)}>
                              <i className="pi pi-times" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
            <div className="prototype-ferias-coletiva-acoes">
              <button type="button" className="prototype-ferias-coletiva-btn-voltar" onClick={onCancelar}>
                <i className="pi pi-arrow-left" aria-hidden="true" />
                Voltar
              </button>
            </div>
          </div>
        </section>
      ) : (
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
                onClick={() => setAbaColetiva(etapa.numero)}
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
            ]}
            optionLabel="label"
            optionValue="value"
            showClear={false}
            getFormErrorMessage={() => null}
            disabled={modoAgendamentoLote}
            onChange={(proximoOrgao: "SEDUC" | "UNEMAT") => {
              const primeiraLotacao = professoresLote.find((professor) => professor.orgao === proximoOrgao)?.lotacaoNome ?? "";
              setColetivaValue("escola", primeiraLotacao);
              setBuscaNome("");
            }}
          />
          {modoAgendamentoLote && perfilLote === "GESTAO_UNEMAT" ? (
            <label className="prototype-ferias-unemat-escopo">
              <span>Escopo do lançamento</span>
              <strong>Todos os professores da UNEMAT — todas as lotações</strong>
            </label>
          ) : (
            <DropdownFieldSeplag
              name="escola"
              control={coletivaControl}
              label="Escola/Lotação"
              cols="12"
              options={lotacoesDisponiveis.map((lotacao) => ({ label: lotacao, value: lotacao }))}
              optionLabel="label"
              optionValue="value"
              showClear={false}
              getFormErrorMessage={() => null}
              onChange={() => {
                setBuscaNome("");
                setTextoBusca("");
              }}
            />
          )}
          <DropdownFieldSeplag
            name="periodoAquisitivo"
            control={coletivaControl}
            label="Período Aquisitivo"
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
          <label className="prototype-ferias-coletiva-alerta-check">
            <input
              type="checkbox"
              checked={soComAlertaAba1}
              onChange={(event) => setSoComAlertaAba1(event.target.checked)}
            />
            Só com alerta
          </label>
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
                {modoAgendamentoLote ? <th>Alertas</th> : null}
                <th>Saldo</th>
                {!modoAgendamentoLote ? <th>Situação de validação</th> : null}
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
                    {modoAgendamentoLote ? (
                      <td className="prototype-ferias-lote-alertas-celula">
                        {alertasDe(professor).length ? (
                          <div className="prototype-ferias-lote-alertas-linha">
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
                          </div>
                        ) : <span className="prototype-ferias-lote-sem-alerta">Sem alertas</span>}
                      </td>
                    ) : null}
                    <td>
                      <span className={temErro ? "prototype-ferias-saldo-inconsistente" : temAviso ? "prototype-ferias-saldo-aviso" : ""}>
                        {usaRegraAquisitivoUnemat && professor.saldoConfirmado === false
                          ? `${professor.saldo} dias · a confirmar`
                          : `${professor.saldo} dias`}
                      </span>
                    </td>
                    {!modoAgendamentoLote ? (
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
                    ) : null}
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
          <div className="prototype-ferias-coletiva-resumo-lateral">
            <strong>{professoresIncluidos.length}</strong>
            <span>servidor(es) incluído(s)</span>
            <ul>
              <li>{professoresIncluidos.filter((professor) => estadoLinha(professor.id).julho).length} com julho</li>
              <li>{professoresIncluidos.filter((professor) => estadoLinha(professor.id).janeiro).length} com janeiro</li>
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
              <table className="prototype-ferias-table prototype-ferias-parcelas-table">
                <thead>
                  <tr>
                    <th>Servidor</th>
                    <th>Saldo</th>
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
                    <th>Alertas</th>
                  </tr>
                </thead>
                <tbody>
                  {listaPaginadaAba2.map((professor) => {
                    const estado = estadoLinha(professor.id);
                    const erros = errosDe(professor);
                    const avisos = avisosDe(professor);
                    return (
                      <tr key={professor.id}>
                        <td>
                          <div className="prototype-ferias-servidor-identificacao">
                            <strong>{professor.nome}</strong>
                            <span>{professor.matricula}</span>
                          </div>
                        </td>
                        <td>
                          <span className={erros.some((e) => e.includes("45d fora")) ? "prototype-ferias-saldo-inconsistente" : avisos.some((a) => a.includes("30d em escola")) ? "prototype-ferias-saldo-aviso" : ""}>
                            {professor.saldo} dias
                          </span>
                        </td>
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
                        <td>
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
                          {!erros.length && !avisos.length ? <span className="prototype-ferias-lote-tag prototype-ferias-lote-tag--ok"><i className="pi pi-check" aria-hidden="true" /> Ok</span> : null}
                        </td>
                      </tr>
                    );
                  })}
                  {!listaPaginadaAba2.length ? (
                    <tr>
                      <td colSpan={5} className="prototype-ferias-empty">Nenhum professor encontrado para o filtro informado.</td>
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
      </div>
      ) : null}

      {abaColetiva === 2 && professoresIncluidos.length > 0 ? (
        <div className="prototype-ferias-coletiva-resumo-validacao">
          {(() => {
            const comErro = professoresIncluidos.filter((professor) => errosDe(professor).length > 0);
            const comAviso = professoresIncluidos.filter((professor) => avisosDe(professor).length > 0);
            const temporarios = professoresIncluidos.filter((professor) => professor.vinculo === "Contrato Temporário");
            return (
              <>
                {comErro.length > 0 ? (
                  <div className="prototype-ferias-coletiva-resumo-item is-erro">
                    <i className="pi pi-times-circle" aria-hidden="true" />
                    <span><strong>{comErro.length}</strong> servidor(es) com erro bloqueante — remova-os antes de lançar.</span>
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
                    {modoAgendamentoLote && perfilLote === "GESTAO_UNEMAT"
                      ? "Após lançar, o lote fica aguardando validação da chefia na aba Avaliar e Aprovar."
                      : orgao === "SEDUC"
                        ? "Após lançar, o lote será encaminhado à DRE para validação — aprovação em bloco, com possibilidade de reprovação individual."
                        : "Após lançar, o lote ficará disponível para validação pela Gestão de Pessoas da UNEMAT."}
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
      )}
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
    const anoAtual = new Date().getFullYear();
    const novosRegistros: FeriasRegistro[] = servidores.map((servidor) => ({
      id: gerarId() + servidor.id,
      servidorNome: servidor.nome,
      matricula: servidor.matricula,
      cpf: "",
      orgao,
      orgaoColetivo: "OUTRO",
      setor: "",
      cargo: servidor.cargo || "—",
      cargoGestao: true,
      tipoVinculo: "Efetivo",
      tipo: "Lote",
      origem: "SIGEP",
      periodoAquisitivoInicio: periodoAquisitivo ? `${anoAtual}-01-01` : "",
      periodoAquisitivoFim: periodoAquisitivo ? `${anoAtual}-12-31` : "",
      periodoAquisitivoLabel: periodoAquisitivo || undefined,
      parcelas: [{ id: 1, inicio: dataInicio, fim, dias }],
      situacao: "AGUARDANDO VALIDAÇÃO",
      substitutos: [],
      loteId,
      responsavelLancamento: "Usuário atual",
      lancadoEm: new Date().toLocaleString("pt-BR"),
    }));

    setConfirmacao(`Lote lançado: ${novosRegistros.length} servidor(es) agendado(s) em ${formatarDataBr(dataInicio)}.`);
    onSalvar(novosRegistros);
  };

  return (
    <div>
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

const VINCULOS_RECESSO: TipoVinculo[] = ["Residente Técnico", "Bolsista", "Estagiário"];

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
}: Readonly<{ onCancelar: () => void; onSalvar: (registro: FeriasRegistro) => void }>) {
  const [servidorNome, setServidorNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [orgao, setOrgao] = useState("SEPLAG/MT");
  const [setor, setSetor] = useState("");
  const [cargo, setCargo] = useState("");
  const [tipoVinculo, setTipoVinculo] = useState<TipoVinculo>("Residente Técnico");
  const [dataInicioVinculo, setDataInicioVinculo] = useState("");
  const [periodoAquisitivoInicio, setPeriodoAquisitivoInicio] = useState("");
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState<PeriodoAquisitivoRecesso[]>([]);
  const [periodoAquisitivoSelecionado, setPeriodoAquisitivoSelecionado] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [parcelasResidente, setParcelasResidente] = useState<ParcelaFerias[]>([]);
  const [draftDuracaoResidente, setDraftDuracaoResidente] = useState<number | null>(null);
  const [draftInicioResidente, setDraftInicioResidente] = useState("");
  const [erro, setErro] = useState("");
  const [servidorEncontrado, setServidorEncontrado] = useState(false);
  const [textoBuscaRecesso, setTextoBuscaRecesso] = useState("");
  const [sugestoesServidorRecesso, setSugestoesServidorRecesso] = useState<string[]>([]);

  const ehEstagiario = tipoVinculo === "Estagiário";
  const ehResidenteOuBolsista = tipoVinculo === "Residente Técnico" || tipoVinculo === "Bolsista";

  // RN005 (US51 / IN 007/2022): só o estagiário tem corte de período aquisitivo em março/2018.
  const periodoBloqueadoPorCorte = (periodo: PeriodoAquisitivoRecesso) =>
    ehEstagiario && periodo.inicio < MARCO_CORTE_ESTAGIARIO;
  const periodoSelecionado = periodosDisponiveis.find((periodo) => periodo.inicio === periodoAquisitivoSelecionado) ?? null;
  const saldoDisponivel = periodoSelecionado?.saldo ?? null;

  // IN 007/2022/SEPLAG, arts. 14-15: o estagiário forma o saldo a 2,5 dias/mês (teto de 30
  // dias/ano) e só pode parcelar nos padrões fixos quando atinge os 30 dias; com saldo menor
  // (ainda formando), usufrui tudo de uma vez, sem parcelamento.
  const usaPadraoFixoEstagiario = ehEstagiario && saldoDisponivel === 30;
  // Decreto 704/2024, art. 8º, II: o residente/bolsista parcela livremente em até 3 etapas,
  // sem tamanho fixo por etapa — qualquer saldo, a soma das etapas precisa fechar o total.
  const usaParcelamento = usaPadraoFixoEstagiario || ehResidenteOuBolsista;

  const totalParceladoResidente = parcelasResidente.reduce((total, parcela) => total + parcela.dias, 0);
  const saldoRestanteEtapas = (saldoDisponivel ?? 0) - totalParceladoResidente;

  // Com o saldo no teto de 30 dias, cada etapa é de 10, 15 ou 20 dias (IN 007/2022, arts. 14-15,
  // para o estagiário; mesmos tamanhos usados por analogia para residente/bolsista). Com saldo
  // menor que 30, não há o que escolher: a etapa única é o próprio saldo restante.
  const opcoesDuracaoResidente = saldoDisponivel === 30
    ? [10, 15, 20].filter((dias) => dias <= saldoRestanteEtapas)
    : (saldoRestanteEtapas > 0 ? [saldoRestanteEtapas] : []);
  const duracaoSelecionadaResidente = opcoesDuracaoResidente.includes(draftDuracaoResidente ?? -1)
    ? (draftDuracaoResidente as number)
    : (opcoesDuracaoResidente[0] ?? null);
  const draftFimResidente = calcularFim(draftInicioResidente, duracaoSelecionadaResidente ?? 0);

  const adicionarParcelaResidente = () => {
    if (parcelasResidente.length >= 3) {
      setErro("Parcelável em até 3 etapas.");
      return;
    }
    if (!duracaoSelecionadaResidente || duracaoSelecionadaResidente < 1) {
      setErro("Nenhuma duração disponível para completar o parcelamento.");
      return;
    }
    if (!draftInicioResidente) {
      setErro("Informe a data de início desta etapa.");
      return;
    }
    setParcelasResidente((atual) => [
      ...atual,
      {
        id: gerarId(),
        dias: duracaoSelecionadaResidente,
        inicio: draftInicioResidente,
        fim: calcularFim(draftInicioResidente, duracaoSelecionadaResidente),
      },
    ]);
    setDraftInicioResidente("");
    setDraftDuracaoResidente(null);
    setErro("");
  };

  const removerParcelaResidente = (id: number) => {
    setParcelasResidente((atual) => atual.filter((parcela) => parcela.id !== id));
  };

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
    setDraftDuracaoResidente(null);
    setDraftInicioResidente("");
    setServidorEncontrado(true);
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

  const parcelasCalculadas: ParcelaFerias[] = usaParcelamento
    ? parcelasResidente.map((parcela) => ({ ...parcela, fim: calcularFim(parcela.inicio, parcela.dias) }))
    : [{ id: 1, inicio: dataInicio, fim: calcularFim(dataInicio, saldoDisponivel ?? 0), dias: saldoDisponivel ?? 0 }];
  const fim = parcelasCalculadas[0]?.fim ?? "";
  // IN 007/2022 (estagiário) e Decreto 704/2024 (residente/bolsista): nenhum dos dois recebe
  // auxílio-transporte durante o recesso, só a bolsa/vencimento normal.
  const bloqueioAuxilioTransporte = ehEstagiario || ehResidenteOuBolsista;

  const salvar = () => {
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
    const hoje = new Date().toISOString().slice(0, 10);

    if (usaParcelamento) {
      if (!saldoDisponivel) {
        setErro("Servidor sem saldo disponível para recesso.");
        return;
      }
      if (totalParceladoResidente !== saldoDisponivel) {
        setErro(`Adicione etapa(s) até completar o saldo do recesso (${totalParceladoResidente} de ${saldoDisponivel} dias).`);
        return;
      }
      for (const parcela of parcelasCalculadas) {
        if (diasEntre(hoje, parcela.inicio) < 15) {
          setErro(`A etapa de ${formatarDataBr(parcela.inicio)} não respeita os 15 dias de antecedência.`);
          return;
        }
        if (violaAntecedenciaFimDeSemana(parcela.inicio)) {
          setErro(`A etapa de ${formatarDataBr(parcela.inicio)} não pode iniciar 2 dias antes de um fim de semana.`);
          return;
        }
      }
      const erroIntervalo = validarIntervaloParcelas(parcelasCalculadas);
      if (erroIntervalo) {
        setErro(erroIntervalo);
        return;
      }
    } else {
      // Bloco integral: estagiário com saldo ainda formando (< 30 dias) usufrui tudo de uma vez.
      if (!dataInicio) {
        setErro("Informe a data de início do recesso.");
        return;
      }
      if (!saldoDisponivel) {
        setErro("Servidor sem saldo disponível para recesso.");
        return;
      }
      if (diasEntre(hoje, dataInicio) < 15) {
        setErro("O recesso exige no mínimo 15 dias de antecedência a partir de hoje.");
        return;
      }
      if (violaAntecedenciaFimDeSemana(dataInicio)) {
        setErro("O início do recesso não pode ocorrer 2 dias antes de um fim de semana.");
        return;
      }
    }

    if (ehEstagiario) {
      // IN 007/2022, art. 15: carência única de 6 meses ininterruptos de estágio.
      if (!dataInicioVinculo) {
        setErro("Informe a data de início do vínculo — estagiário exige carência de 6 meses.");
        return;
      }
      const inicioRecesso = parcelasCalculadas[0]?.inicio ?? dataInicio;
      if (diasEntre(dataInicioVinculo, inicioRecesso) < 182) {
        setErro("Estagiário: vínculo precisa ter pelo menos 6 meses (182 dias) desde o início até a data do recesso.");
        return;
      }
      // RN007 (US51) / IN 007/2022: o recesso precisa ser usado dentro do contrato.
      const fimContrato = FIM_CONTRATO_ESTAGIARIO_MOCK[matricula];
      const fimRecesso = parcelasCalculadas[parcelasCalculadas.length - 1]?.fim ?? fim;
      if (fimContrato && fimRecesso >= fimContrato) {
        setErro(`O agendamento precisa ser anterior ao fim do contrato (${formatarDataBr(fimContrato)}).`);
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
      origem: "PORTALSERVIDOR",
      periodoAquisitivoInicio: periodoAquisitivoSelecionado,
      periodoAquisitivoFim: "",
      parcelas: parcelasCalculadas,
      situacao: "AGUARDANDO VALIDAÇÃO",
      dataLimiteValidacaoChefia: calcularPrazoValidacaoChefia(),
      bloqueioAuxilioTransporte,
      emailChefiaEnviado: !ehEstagiario,
      substitutos: [],
      responsavelLancamento: "Usuário atual",
      lancadoEm: new Date().toLocaleString("pt-BR"),
    });
  };

  return (
    <div className="prototype-ferias-individual-form">
      <div className="prototype-ferias-banner" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#166534" }}>
        <i className="pi pi-info-circle" aria-hidden="true" />
        <span>
          <strong>Não é férias.</strong> Recesso remunerado é permissão de ausência remunerada, sem 1/3
          constitucional. {ehEstagiario
            ? "Estagiário: saldo formado a 2,5 dias/mês (teto de 30 dias/ano), parcelável nos padrões do art. 14 quando atinge o teto (IN 007/2022/SEPLAG)."
            : "Residente técnico: 30 dias por ano de residência, parcelável em até 3 etapas se solicitado (Decreto 704/2024, art. 8º, II)."}
          {" "}Exige 15 dias de antecedência. Carência única de 6 meses ininterruptos só se aplica ao estagiário
          (IN 007/2022/SEPLAG, art. 15).
        </span>
      </div>

      {erro ? <div className="prototype-ferias-erro-bloqueio">{erro}</div> : null}

      <div className="prototype-ferias-form-section">
        <h3 className="prototype-ferias-secao-titulo">
          <i className="pi pi-user" aria-hidden="true" />
          Servidor
          {servidorEncontrado && (
            <span className="prototype-ferias-servidor-encontrado">
              <i className="pi pi-check-circle" /> Servidor encontrado — campos preenchidos automaticamente
            </span>
          )}
        </h3>
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

        {servidorEncontrado && (
          <div className="prototype-ferias-servidor-resultado">
            <div className="prototype-ferias-servidor-resultado-grid is-identificacao">
              <div>
                <span className="prototype-ferias-indicador-rotulo">Nome do Servidor</span>
                <strong>{servidorNome}</strong>
              </div>
              <div>
                <span className="prototype-ferias-indicador-rotulo">Matrícula</span>
                <strong>{matricula}</strong>
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
                setDraftDuracaoResidente(null);
                setDraftInicioResidente("");
                setServidorEncontrado(false);
              }}
            />
          </div>
        )}

      </div>

      {(servidorEncontrado || dataInicioVinculo) && (() => {
        const ref = dataInicioVinculo || periodoAquisitivoInicio;
        const carencia = calcularCarencia(ref);
        if (!carencia) return null;
        const hoje = new Date().toISOString().slice(0, 10);
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
            <div className="prototype-ferias-carencia-badges">
              <span className={`prototype-ferias-carencia-badge ${carencia.cumpre4 ? "is-ok" : "is-erro"}`}>
                <i className={`pi ${carencia.cumpre4 ? "pi-check" : "pi-times"}`} />
                {" "}4 meses (120 dias) — {carencia.cumpre4 ? "cumprido" : `faltam ${120 - carencia.totalDias} dias`}
              </span>
              <span className={`prototype-ferias-carencia-badge ${carencia.cumpre6 ? "is-ok" : "is-erro"}`}>
                <i className={`pi ${carencia.cumpre6 ? "pi-check" : "pi-times"}`} />
                {" "}6 meses (182 dias) — {carencia.cumpre6 ? "cumprido" : `faltam ${182 - carencia.totalDias} dias`}
              </span>
              {tipoVinculo === "Estagiário" && (
                <span className="prototype-ferias-carencia-badge is-info">
                  <i className="pi pi-info-circle" /> Estagiário: exige carência de 6 meses
                </span>
              )}
            </div>
          </div>
        );
      })()}

      <div className="prototype-ferias-form-section">
        <h3 className="prototype-ferias-secao-titulo">
          <i className="pi pi-sun" aria-hidden="true" />
          {ehEstagiario
            ? "Recesso (2,5 dias/mês, teto de 30 dias/ano — IN 007/2022/SEPLAG)"
            : "Recesso (30 dias/ano, até 3 etapas se solicitado — Decreto 704/2024)"}
        </h3>

        {!periodoSelecionado ? (
          <div className="prototype-ferias-gozo-ajuda">Selecione um período aquisitivo acima para continuar.</div>
        ) : !usaParcelamento ? (
          <div className="prototype-ferias-form-grid">
            <label>
              <span>Dias (integral do saldo)</span>
              <input className="prototype-ferias-readonly-field" value={saldoDisponivel ?? "—"} readOnly />
              <small className="prototype-ferias-gozo-ajuda">
                Saldo ainda formando a 2,5 dias/mês (teto de 30 dias/ano) — usufruído de uma vez até completar o teto.
              </small>
            </label>
            <label>
              <span>Data de início *</span>
              <input type="date" value={dataInicio} onChange={(event) => setDataInicio(event.target.value)} />
            </label>
            <label>
              <span>Fim (calculado)</span>
              <input className="prototype-ferias-readonly-field" value={formatarDataBr(fim)} readOnly />
            </label>
          </div>
        ) : (
          <>
            <small className="prototype-ferias-gozo-ajuda">
              {saldoDisponivel === 30
                ? "Saldo no teto de 30 dias: escolha etapas de 10, 15 ou 20 dias até fechar o total (até 3 etapas)."
                : "Saldo abaixo do teto de 30 dias: usufruído em uma única etapa, igual ao saldo disponível."}
            </small>
            <div className="prototype-ferias-gozo-grid">
              <div>
                <label>
                  <span>Dias desta etapa</span>
                  <select
                    disabled={!opcoesDuracaoResidente.length}
                    value={duracaoSelecionadaResidente ?? ""}
                    onChange={(event) => setDraftDuracaoResidente(Number(event.target.value))}
                  >
                    {opcoesDuracaoResidente.map((dias) => (
                      <option key={dias} value={dias}>{dias} dias</option>
                    ))}
                  </select>
                </label>
              </div>
              <div>
                <label>
                  <span>Data início do gozo</span>
                  <input
                    type="date"
                    disabled={!opcoesDuracaoResidente.length}
                    value={draftInicioResidente}
                    onChange={(event) => setDraftInicioResidente(event.target.value)}
                  />
                </label>
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
                disabled={!opcoesDuracaoResidente.length}
                onClick={adicionarParcelaResidente}
              >
                <i className="pi pi-plus" aria-hidden="true" />
                Adicionar esta etapa
              </button>
              <span className={totalParceladoResidente === (saldoDisponivel ?? 0) ? "prototype-ferias-saldo-ok" : "prototype-ferias-saldo-erro"}>
                {totalParceladoResidente} de {saldoDisponivel ?? 0} dias parcelados
              </span>
            </div>

            {parcelasResidente.length > 0 && (
              <div className="prototype-ferias-gozo-lista">
                {parcelasResidente.map((parcela) => (
                  <div className="prototype-ferias-gozo-item" key={parcela.id}>
                    <span>
                      {formatarDataBr(parcela.inicio)} a {formatarDataBr(parcela.fim)} ({parcela.dias} dias)
                    </span>
                    <button
                      type="button"
                      className="prototype-ferias-icon-btn"
                      title="Remover etapa"
                      onClick={() => removerParcelaResidente(parcela.id)}
                    >
                      <i className="pi pi-trash" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <small>Intervalo entre etapas do mesmo período aquisitivo: emendado (0 dias) ou no mínimo 10 dias corridos.</small>
          </>
        )}

        {!ehEstagiario && parcelasResidente.length > 0 ? (() => {
          const periodoInicio = parcelasResidente.reduce((min, p) => (!min || p.inicio < min ? p.inicio : min), "");
          const periodoFim = parcelasResidente.reduce((max, p) => (!max || p.fim > max ? p.fim : max), "");
          const hojeBr = formatarDataBr(new Date().toISOString().slice(0, 10));
          return (
            <div className="prototype-ferias-email-preview">
              <strong>Prévia do e-mail à chefia (RN013/US50)</strong>
              {`Prezado(a) [Chefia indicada pelo SEAP por integração],

um residente técnico da sua equipe solicitou agendamento de RECESSO REMUNERADO.
Seguem dados para vossa validação no Portal do Servidor.

Nome do Residente: ${servidorNome || "—"} - Matrícula: ${matricula || "—"}
Unidade de Lotação: ${setor || "—"}
Tipo do Afastamento: RECESSO REMUNERADO
Período solicitado: ${formatarDataBr(periodoInicio)} - ${formatarDataBr(periodoFim)} (${totalParceladoResidente} dias)
Descrição: ${hojeBr} - Solicitação de agendamento feita pelo Portal do Servidor que está aguardando Validação

Acesse o portal para validar.`}
            </div>
          );
        })() : null}

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

      <div className="prototype-vinculo-form prototype-ferias-lancamento-acoes" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <BotaoVoltarSeplag type="button" label="Voltar" onClick={onCancelar} />
        <BotaoSalvarSeplag type="button" label="Salvar solicitação" onClick={salvar} />
      </div>
    </div>
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

function ModalVisualizarRegistro({ registro, onFechar }: Readonly<{ registro: FeriasRegistro; onFechar: () => void }>) {
  return (
    <ModalSeplag visible fechar={onFechar} titulo="Detalhes da solicitação de férias" labelFechar="Fechar" hideFooter tamanho="640px">
      <div style={{ width: "100%" }} className="prototype-ferias-form-section">
        <div className="prototype-ferias-form-grid">
          <label>
            <span>Servidor</span>
            <input className="prototype-ferias-readonly-field" value={registro.servidorNome} readOnly />
          </label>
          <label>
            <span>Matrícula</span>
            <input className="prototype-ferias-readonly-field" value={registro.matricula} readOnly />
          </label>
          <label>
            <span>Órgão</span>
            <input className="prototype-ferias-readonly-field" value={registro.orgao} readOnly />
          </label>
          <label>
            <span>Setor</span>
            <input className="prototype-ferias-readonly-field" value={registro.setor} readOnly />
          </label>
          <label>
            <span>Cargo</span>
            <input className="prototype-ferias-readonly-field" value={registro.cargo} readOnly />
          </label>
          <label>
            <span>Tipo</span>
            <input className="prototype-ferias-readonly-field" value={registro.tipo} readOnly />
          </label>
          <label>
            <span>Período Aquisitivo</span>
            <input className="prototype-ferias-readonly-field" value={periodoAquisitivoLabel(registro)} readOnly />
          </label>
          <label>
            <span>Situação</span>
            <input className="prototype-ferias-readonly-field" value={registro.situacao} readOnly />
          </label>
        </div>
        {registro.regraAquisitivo === "USUFRUTO_ANTECIPADO" ? (
          <div className="prototype-ferias-banner prototype-ferias-regra-unemat" role="note">
            <i className="pi pi-info-circle" aria-hidden="true" />
            <span>
              Lançamento conforme regra institucional da UNEMAT: o usufruto pode anteceder o fechamento
              do aquisitivo. Saldo confirmado: {registro.saldoFeriasConfirmado ? "sim" : "não"}.
              A conciliação após o fechamento e o cálculo proporcional dependem da Folha.
            </span>
          </div>
        ) : null}
        {registro.tipo === "Recesso" ? (
          <div className="prototype-ferias-banner" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#166534" }} role="note">
            <i className="pi pi-info-circle" aria-hidden="true" />
            <span>
              Recesso remunerado — não é férias, sem 1/3 constitucional.{" "}
              {registro.bloqueioAuxilioTransporte ? (
                registro.auxilioTransporteEfetivado
                  ? "Auxílio-transporte bloqueado e integração com o SIGPAS efetivada na validação da chefia."
                  : "Auxílio-transporte e integração com o SIGPAS serão efetivados quando a chefia validar."
              ) : null}
              {" "}E-mail à chefia: {registro.emailChefiaEnviado ? "enviado no agendamento." : "não enviado."}
            </span>
          </div>
        ) : null}
        <h3>Parcelas</h3>
        <ul>
          {registro.parcelas.map((parcela) => (
            <li key={parcela.id}>
              {formatarDataBr(parcela.inicio)} a {formatarDataBr(parcela.fim)} — {parcela.dias} dia(s)
              {parcela.terco ? " (com 1/3 constitucional)" : ""}
            </li>
          ))}
        </ul>
        <p>
          Lançado por {registro.responsavelLancamento} em {registro.lancadoEm}.
        </p>
        {registro.avaliadoPor ? (
          <p>
            {registro.situacao === "CANCELADO" || registro.situacao === "REPROVADO" ? "Reprovado" : "Aprovado"}
            {" "}por {registro.avaliadoPor} em {registro.avaliadoEm}.
          </p>
        ) : (
          <p className="prototype-ferias-gozo-ajuda">Ainda não avaliado pela chefia.</p>
        )}
      </div>
    </ModalSeplag>
  );
}

/** US50 3.5 (Cenário Alterar): permite editar um recesso já lançado, desde que a nova data
 * fim seja anterior ao início do próximo período aquisitivo (residente/bolsista) ou ao fim
 * da contratação (estagiário). */
function ModalAlterarRecesso({
  registro,
  onFechar,
  onSalvar,
}: Readonly<{ registro: FeriasRegistro; onFechar: () => void; onSalvar: (parcelas: ParcelaFerias[]) => void }>) {
  const ehEstagiario = registro.tipoVinculo === "Estagiário";
  const [parcelas, setParcelas] = useState<ParcelaFerias[]>(() => registro.parcelas.map((parcela) => ({ ...parcela })));
  const [erro, setErro] = useState("");

  const periodos = PERIODOS_RECESSO_MOCK[registro.matricula] ?? [];
  const indiceAtual = periodos.findIndex((periodo) => periodo.inicio === registro.periodoAquisitivoInicio);
  const proximoPeriodo = indiceAtual >= 0 ? periodos[indiceAtual + 1] : undefined;
  const fimContrato = FIM_CONTRATO_ESTAGIARIO_MOCK[registro.matricula];
  const limiteAlteracao = ehEstagiario ? fimContrato : proximoPeriodo?.inicio;

  const atualizarInicio = (id: number, novoInicio: string) => {
    setParcelas((atual) =>
      atual.map((parcela) => (parcela.id === id ? { ...parcela, inicio: novoInicio, fim: calcularFim(novoInicio, parcela.dias) } : parcela)),
    );
  };

  const salvar = () => {
    if (parcelas.some((parcela) => !parcela.inicio)) {
      setErro("Informe a data de início de todas as parcelas.");
      return;
    }
    const hoje = new Date().toISOString().slice(0, 10);
    for (const parcela of parcelas) {
      if (diasEntre(hoje, parcela.inicio) < 15) {
        setErro(`A parcela de ${formatarDataBr(parcela.inicio)} não respeita os 15 dias de antecedência.`);
        return;
      }
      if (violaAntecedenciaFimDeSemana(parcela.inicio)) {
        setErro(`A parcela de ${formatarDataBr(parcela.inicio)} não pode iniciar 2 dias antes de um fim de semana.`);
        return;
      }
      if (limiteAlteracao && parcela.fim >= limiteAlteracao) {
        setErro(
          `A data fim (${formatarDataBr(parcela.fim)}) precisa ser anterior a ${formatarDataBr(limiteAlteracao)} ` +
          `(${ehEstagiario ? "fim do contrato" : "início do próximo período aquisitivo"}).`,
        );
        return;
      }
    }
    if (!ehEstagiario) {
      const erroIntervalo = validarIntervaloParcelas(parcelas);
      if (erroIntervalo) {
        setErro(erroIntervalo);
        return;
      }
    }
    setErro("");
    onSalvar(parcelas);
  };

  return (
    <ModalSeplag visible fechar={onFechar} titulo="Alterar recesso remunerado" hideFooter tamanho="560px">
      <div style={{ width: "100%" }} className="prototype-ferias-form-section">
        <p>
          Alteração permitida enquanto estiver dentro do limite de usufruto — a nova data fim precisa ser
          anterior {ehEstagiario ? "ao fim da contratação" : "ao início do próximo período aquisitivo"}
          {limiteAlteracao ? ` (${formatarDataBr(limiteAlteracao)})` : ", sem limite conhecido para este servidor"}.
        </p>
        {erro ? <div className="prototype-ferias-erro-bloqueio">{erro}</div> : null}
        {parcelas.map((parcela, indice) => (
          <div className="prototype-ferias-form-grid" key={parcela.id}>
            <label>
              <span>Parcela {indice + 1} — {parcela.dias} dias</span>
              <input type="date" value={parcela.inicio} onChange={(event) => atualizarInicio(parcela.id, event.target.value)} />
            </label>
            <label>
              <span>Fim (calculado)</span>
              <input className="prototype-ferias-readonly-field" value={formatarDataBr(parcela.fim)} readOnly />
            </label>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
          <button type="button" className="prototype-vinculo-back" onClick={onFechar}>
            <i className="pi pi-arrow-left" aria-hidden="true" />
            Cancelar
          </button>
          <button type="button" className="prototype-ferias-btn-primario" onClick={salvar}>
            <i className="pi pi-check" aria-hidden="true" />
            Salvar alteração
          </button>
        </div>
      </div>
    </ModalSeplag>
  );
}

/** Edição de férias individuais já lançadas, ainda Aguardando Validação: permite ajustar as
 * datas de início de cada parcela, mantendo a duração de cada uma e respeitando o intervalo
 * de 0/10 dias entre parcelas (Decreto 656/2020). */
function ModalAlterarIndividual({
  registro,
  onFechar,
  onSalvar,
}: Readonly<{ registro: FeriasRegistro; onFechar: () => void; onSalvar: (parcelas: ParcelaFerias[]) => void }>) {
  const [parcelas, setParcelas] = useState<ParcelaFerias[]>(() => registro.parcelas.map((parcela) => ({ ...parcela })));
  const [erro, setErro] = useState("");

  const atualizarInicio = (id: number, novoInicio: string) => {
    setParcelas((atual) =>
      atual.map((parcela) => (parcela.id === id ? { ...parcela, inicio: novoInicio, fim: calcularFim(novoInicio, parcela.dias) } : parcela)),
    );
  };

  const salvar = () => {
    if (parcelas.some((parcela) => !parcela.inicio)) {
      setErro("Informe a data de início de todas as parcelas.");
      return;
    }
    const erroIntervalo = validarIntervaloParcelas(parcelas);
    if (erroIntervalo) {
      setErro(erroIntervalo);
      return;
    }
    setErro("");
    onSalvar(parcelas);
  };

  return (
    <ModalSeplag visible fechar={onFechar} titulo="Alterar férias" hideFooter tamanho="560px">
      <div style={{ width: "100%" }} className="prototype-ferias-form-section">
        <p>
          Edição permitida enquanto a solicitação estiver Aguardando Validação. O intervalo entre parcelas
          continua valendo 0 ou 10 dias corridos (Decreto 656/2020).
        </p>
        {erro ? <div className="prototype-ferias-erro-bloqueio">{erro}</div> : null}
        {parcelas.map((parcela, indice) => (
          <div className="prototype-ferias-form-grid" key={parcela.id}>
            <label>
              <span>Parcela {indice + 1} — {parcela.dias} dias</span>
              <input type="date" value={parcela.inicio} onChange={(event) => atualizarInicio(parcela.id, event.target.value)} />
            </label>
            <label>
              <span>Fim (calculado)</span>
              <input className="prototype-ferias-readonly-field" value={formatarDataBr(parcela.fim)} readOnly />
            </label>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
          <button type="button" className="prototype-vinculo-back" onClick={onFechar}>
            <i className="pi pi-arrow-left" aria-hidden="true" />
            Cancelar
          </button>
          <button type="button" className="prototype-ferias-btn-primario" onClick={salvar}>
            <i className="pi pi-check" aria-hidden="true" />
            Salvar alteração
          </button>
        </div>
      </div>
    </ModalSeplag>
  );
}

const STATUS_META: Record<AcaoStatus, { titulo: string; descricao: string; cor: string; botao: string; novaSituacao: SituacaoFerias }> = {
  validar: {
    titulo: "Validar solicitação (chefia)",
    descricao: "A chefia confirma o agendamento e marca o abono constitucional quando aplicável. O registro passa para Em Aberto e libera a substituição, quando cabível.",
    cor: "#15803d",
    botao: "Validar",
    novaSituacao: "EM ABERTO",
  },
  rejeitar: {
    titulo: "Rejeitar solicitação",
    descricao: "Sem validação da chefia no prazo (ou por decisão manual), o sistema rejeita a solicitação e devolve o saldo integral ao servidor.",
    cor: "#b91c1c",
    botao: "Rejeitar",
    novaSituacao: "CANCELADO",
  },
  suspender: {
    titulo: "Suspender férias",
    descricao: "A suspensão interrompe o usufruto; o saldo retorna disponível para novo agendamento.",
    cor: "#92400e",
    botao: "Suspender",
    novaSituacao: "SUSPENSO",
  },
  reativar: {
    titulo: "Reativar férias",
    descricao: "O registro volta à situação Em Aberto.",
    cor: "#15803d",
    botao: "Reativar",
    novaSituacao: "EM ABERTO",
  },
  cancelar: {
    titulo: "Cancelar férias",
    descricao: "Ação irreversível — o registro deixa de constar na listagem ativa.",
    cor: "#b91c1c",
    botao: "Cancelar férias",
    novaSituacao: "CANCELADO",
  },
};

function ModalConfirmarStatus({
  registro,
  acao,
  onFechar,
  onConfirmar,
}: Readonly<{
  registro: FeriasRegistro;
  acao: AcaoStatus;
  onFechar: () => void;
  onConfirmar: (novaSituacao: SituacaoFerias) => void;
}>) {
  const meta = STATUS_META[acao];
  const exigeJustificativa = acao === "rejeitar" || acao === "cancelar" || acao === "suspender";
  const [justificativa, setJustificativa] = useState("");
  const [erro, setErro] = useState("");

  const confirmar = () => {
    if (exigeJustificativa && !justificativa.trim()) {
      setErro("Informe a justificativa antes de confirmar.");
      return;
    }
    onConfirmar(meta.novaSituacao);
  };

  return (
    <ModalSeplag
      visible
      fechar={onFechar}
      titulo={meta.titulo}
      hideFooter
      tamanho="460px"
    >
      <div style={{ width: "100%" }} className="prototype-ferias-form-section">
        <p>{meta.descricao}</p>
        <p>
          <strong>{registro.servidorNome}</strong> · {registro.matricula}
        </p>
        {exigeJustificativa ? (
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontWeight: 600, fontSize: "0.85rem", color: "#193451" }}>
            <span>Justificativa *</span>
            <textarea
              rows={3}
              value={justificativa}
              onChange={(event) => setJustificativa(event.target.value)}
              placeholder="Descreva o motivo"
              style={{ padding: "8px 10px", border: "1px solid #c8d6e5", borderRadius: 5, font: "inherit", resize: "vertical" }}
            />
          </label>
        ) : null}
        {erro ? <div className="prototype-ferias-erro-bloqueio">{erro}</div> : null}
        <div className="prototype-vinculo-form" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button type="button" className="prototype-vinculo-back" onClick={onFechar}>
            Cancelar
          </button>
          <button
            type="button"
            className="prototype-ferias-btn-primario"
            style={{ background: meta.cor }}
            onClick={confirmar}
          >
            <i className="pi pi-check" aria-hidden="true" />
            {meta.botao}
          </button>
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
