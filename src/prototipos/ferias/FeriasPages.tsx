import { useEffect, useMemo, useState } from "react";
import { Paginator } from "primereact/paginator";
import { useNavigate } from "react-router-dom";
import { BreadcrumbSeplag } from "../../componentes/Breadcrumb";
import { CardSeplag } from "../../componentes/Card";
import { ModalSeplag } from "../../componentes/Modal";
import { BotaoLimparFiltroSeplag } from "../../componentes/Botao";
import { PrototypeSystemPage, menuGestaoPessoas } from "../PrototiposPage";
import "./ferias.css";

function gerarId(): number {
  return Date.now();
}

type OrgaoColetivo = "SEDUC" | "UNEMAT" | "OUTRO";
type TipoSolicitacao = "Individual" | "Coletiva" | "Lote" | "Recesso";
type SituacaoFerias = "AGUARDANDO VALIDAÇÃO" | "EM ABERTO" | "QUITADO" | "CANCELADO" | "SUSPENSO";
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
  dataLimiteValidacaoChefia?: string;
  bloqueioAuxilioTransporte?: boolean;
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
  nome: string;
  matricula: string;
  vinculo: "Efetivo" | "Contrato Temporário";
  lotacaoNome: string;
  situacaoLotacao: "Em escola" | "Fora da escola";
  saldo: 45 | 30;
  cargoGestao: boolean;
  ltsConcomitante: boolean;
}

export const STORAGE_KEY = "prototype-ferias-registros-v3";

interface ServidorMock {
  matricula: string;
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
  { matricula: "778899", nome: "Rodrigo Nunes Ferraz", orgao: "SEDUC/MT", setor: "Escola Estadual Marechal Rondon", cargo: "Professor Substituto", tipoVinculo: "Contrato Temporário", cargoGestao: false, periodoAquisitivoInicio: "2026-05-01", periodoAquisitivoFim: "2027-04-30", saldoDisponivel: 30 },
  { matricula: "310021", nome: "Beatriz Andrade Correia", orgao: "SEPLAG/MT", setor: "Hospital Regional de Mato Grosso", cargo: "Residente Técnico — Enfermagem", tipoVinculo: "Residente Técnico", cargoGestao: false, periodoAquisitivoInicio: "2026-02-01", periodoAquisitivoFim: "", saldoDisponivel: 15 },
  { matricula: "320045", nome: "Igor Machado Nunes", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Bolsista", tipoVinculo: "Bolsista", cargoGestao: false, periodoAquisitivoInicio: "2026-07-10", periodoAquisitivoFim: "", saldoDisponivel: 15 },
  { matricula: "330078", nome: "Larissa Pacheco Teixeira", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Estagiária", tipoVinculo: "Estagiário", cargoGestao: false, periodoAquisitivoInicio: "2026-01-05", periodoAquisitivoFim: "", saldoDisponivel: 15 },
];

function buscarServidorMock(query: string): ServidorMock | undefined {
  const termo = query.trim().toLocaleLowerCase("pt-BR");
  if (!termo) return undefined;
  return SERVIDORES_MOCK.find(
    (servidor) => servidor.matricula === termo || servidor.nome.toLocaleLowerCase("pt-BR") === termo,
  );
}

const professoresLote: ProfessorLote[] = [
  { id: 1, nome: "Ana Lúcia Ferreira", matricula: "551023", vinculo: "Efetivo", lotacaoNome: "Escola Estadual Antônio Ferreira", situacaoLotacao: "Em escola", saldo: 45, cargoGestao: false, ltsConcomitante: false },
  { id: 2, nome: "Bruno Castanheira", matricula: "551044", vinculo: "Efetivo", lotacaoNome: "Escola Estadual Antônio Ferreira", situacaoLotacao: "Em escola", saldo: 30, cargoGestao: false, ltsConcomitante: false },
  { id: 3, nome: "Cláudia Mendes", matricula: "551067", vinculo: "Contrato Temporário", lotacaoNome: "Escola Estadual Antônio Ferreira", situacaoLotacao: "Em escola", saldo: 45, cargoGestao: false, ltsConcomitante: true },
  { id: 4, nome: "Diego Albuquerque", matricula: "551089", vinculo: "Efetivo", lotacaoNome: "Sede SEDUC", situacaoLotacao: "Fora da escola", saldo: 45, cargoGestao: false, ltsConcomitante: false },
  { id: 5, nome: "Elisângela Rocha", matricula: "551102", vinculo: "Efetivo", lotacaoNome: "Escola Estadual Antônio Ferreira", situacaoLotacao: "Em escola", saldo: 30, cargoGestao: true, ltsConcomitante: false },
];

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

  const podeEditar = (registro: FeriasRegistro) =>
    (registro.tipo === "Individual" || registro.tipo === "Recesso") &&
    registro.situacao !== "QUITADO" &&
    registro.situacao !== "CANCELADO";

  const aplicarStatus = (registroId: number, novaSituacao: SituacaoFerias) => {
    const proximos = registros.map((registro) =>
      registro.id === registroId ? { ...registro, situacao: novaSituacao } : registro,
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

      {confirmacaoStatus ? (
        <ModalConfirmarStatus
          registro={confirmacaoStatus.registro}
          acao={confirmacaoStatus.acao}
          onFechar={() => setConfirmacaoStatus(null)}
          onConfirmar={(novaSituacao) => aplicarStatus(confirmacaoStatus.registro.id, novaSituacao)}
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
              <td>{periodoAquisitivoLabel(registro)}</td>
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
                <span className={`prototype-ferias-badge is-${classeSituacao(registro.situacao)}`}>{registro.situacao.charAt(0) + registro.situacao.slice(1).toLocaleLowerCase("pt-BR")}</span>
                {prazoValidacaoExpirado(registro) ? (
                  <>
                    <br />
                    <small className="prototype-ferias-alerta-texto">PRAZO EXPIRADO</small>
                  </>
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
                        <button type="button" onClick={() => { onVisualizar(registro); setMenuAbertoId(null); }}>
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
            <span>Residente técnico, bolsista e estagiário — não é férias, instituto próprio (IN 05).</span>
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
  const [parcelas, setParcelas] = useState<ParcelaFerias[]>([{ id: 1, inicio: "", fim: "", dias: 30 }]);
  const [erro, setErro] = useState("");
  const [servidorEncontrado, setServidorEncontrado] = useState(false);

  const totalParcelado = parcelas.reduce((total, parcela) => total + parcela.dias, 0);
  const saldoFecha = totalParcelado === saldoDisponivel;

  const aplicarServidor = (servidor: ServidorMock) => {
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
  };

  const buscarPorNome = (valor: string) => {
    setServidorNome(valor);
    setServidorEncontrado(false);
    const encontrado = buscarServidorMock(valor);
    if (encontrado) aplicarServidor(encontrado);
  };

  const buscarPorMatricula = (valor: string) => {
    setMatricula(valor);
    setServidorEncontrado(false);
    const encontrado = buscarServidorMock(valor);
    if (encontrado) aplicarServidor(encontrado);
  };

  const atualizarParcela = (id: number, campo: "inicio" | "dias" | "terco", valor: string | number | boolean) => {
    setParcelas((atual) =>
      atual.map((parcela) => {
        if (parcela.id !== id) return parcela;
        const proxima = { ...parcela, [campo]: valor } as ParcelaFerias;
        proxima.fim = calcularFim(proxima.inicio, proxima.dias);
        return proxima;
      }),
    );
  };

  const adicionarParcela = () => {
    if (parcelas.length >= 3) return;
    setParcelas((atual) => [...atual, { id: gerarId(), inicio: "", fim: "", dias: 10 }]);
  };

  const removerParcela = (id: number) => {
    setParcelas((atual) => (atual.length > 1 ? atual.filter((parcela) => parcela.id !== id) : atual));
  };

  const salvar = () => {
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
    <div>
      {erro ? <div className="prototype-ferias-erro-bloqueio">{erro}</div> : null}

      <div className="prototype-ferias-banner" style={{ background: "#eff6ff", borderColor: "#bfdbfe", color: "#1d4ed8" }}>
        <i className="pi pi-info-circle" aria-hidden="true" />
        <span>
          Ao salvar, a solicitação entra como <strong>Aguardando Validação</strong>. A chefia imediata tem 8 dias
          corridos para validar — sem validação no prazo, o sistema rejeita automaticamente e devolve o saldo.
        </span>
      </div>

      <div className="prototype-ferias-form-section">
        <h3>
          Servidor
          {servidorEncontrado && (
            <span className="prototype-ferias-servidor-encontrado">
              <i className="pi pi-check-circle" /> Servidor encontrado — campos preenchidos automaticamente
            </span>
          )}
        </h3>
        <datalist id="servidor-busca-lista">
          {SERVIDORES_MOCK.map((s) => (
            <option key={s.matricula} value={s.matricula}>{s.nome}</option>
          ))}
          {SERVIDORES_MOCK.map((s) => (
            <option key={s.matricula + "_nome"} value={s.nome} />
          ))}
        </datalist>
        <div className="prototype-ferias-form-grid">
          <label style={{ gridColumn: "1 / -1" }}>
            <span>Servidor * <em style={{ fontWeight: 400, color: "#6b7280", fontSize: "0.78rem" }}>— busque por nome ou matrícula</em></span>
            <input
              list="servidor-busca-lista"
              value={servidorNome || matricula}
              onChange={(event) => {
                const val = event.target.value;
                const porMatricula = /^\d+$/.test(val.trim());
                if (porMatricula) {
                  buscarPorMatricula(val);
                } else {
                  buscarPorNome(val);
                }
              }}
              placeholder="Nome do servidor ou matrícula"
              autoComplete="off"
              className={servidorEncontrado ? "prototype-ferias-input-autopreenchido" : ""}
            />
          </label>
          {servidorEncontrado && (
            <label>
              <span>Matrícula</span>
              <input value={matricula} readOnly className="prototype-ferias-input-autopreenchido" />
            </label>
          )}
          <label>
            <span>Órgão *</span>
            <input value={orgao} readOnly placeholder="" className={servidorEncontrado ? "prototype-ferias-input-autopreenchido" : ""} />
          </label>
          <label>
            <span>Setor</span>
            <input value={setor} readOnly placeholder="" className={servidorEncontrado ? "prototype-ferias-input-autopreenchido" : ""} />
          </label>
          <label>
            <span>Cargo *</span>
            <input value={cargo} readOnly placeholder="" className={servidorEncontrado ? "prototype-ferias-input-autopreenchido" : ""} />
          </label>
          <label>
            <span>Tipo de Vínculo *</span>
            <input value={tipoVinculo} readOnly placeholder="" className={servidorEncontrado ? "prototype-ferias-input-autopreenchido" : ""} />
          </label>
          <label>
            <span>Cargo de chefia/direção</span>
            <input value={cargoGestao === null ? "" : cargoGestao ? "Sim" : "Não"} readOnly placeholder="" className={servidorEncontrado ? "prototype-ferias-input-autopreenchido" : ""} />
          </label>
          <label>
            <span>Período Aquisitivo — início *</span>
            <input value={servidorEncontrado ? formatarDataBr(periodoAquisitivoInicio) : ""} readOnly placeholder="" className={servidorEncontrado ? "prototype-ferias-input-autopreenchido" : ""} />
          </label>
          <label>
            <span>Período Aquisitivo — fim *</span>
            <input value={servidorEncontrado ? formatarDataBr(periodoAquisitivoFim) : ""} readOnly placeholder="" className={servidorEncontrado ? "prototype-ferias-input-autopreenchido" : ""} />
          </label>
          <label>
            <span>Saldo disponível (dias) *</span>
            <input value={saldoDisponivel ?? ""} readOnly placeholder="" className={servidorEncontrado ? "prototype-ferias-input-autopreenchido" : ""} />
          </label>
        </div>
        {servidorEncontrado && (
          <button
            type="button"
            className="prototype-ferias-btn-limpar-servidor"
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
            }}
          >
            <i className="pi pi-times" /> Limpar servidor
          </button>
        )}
      </div>

      <div className="prototype-ferias-form-section">
        <h3>Parcelamento (até 3 parcelas, mínimo 10 dias cada; intervalo entre parcelas deve ser 0 ou 10 dias corridos; uma pode incluir o terço constitucional)</h3>
        <p className={saldoFecha ? "prototype-ferias-saldo-ok" : "prototype-ferias-saldo-erro"}>
          {totalParcelado} de {saldoDisponivel} dias parcelados
          {saldoFecha ? " — saldo fecha corretamente." : " — a soma precisa fechar exatamente o saldo."}
        </p>
        <div className="prototype-ferias-parcelas">
          {parcelas.map((parcela, indice) => (
            <div className="prototype-ferias-parcela-linha" key={parcela.id}>
              <label>
                <span>Dias — parcela {indice + 1}</span>
                <input
                  type="number"
                  min={10}
                  max={30}
                  value={parcela.dias}
                  onChange={(event) => atualizarParcela(parcela.id, "dias", Number(event.target.value))}
                />
              </label>
              <label>
                <span>Início</span>
                <input type="date" value={parcela.inicio} onChange={(event) => atualizarParcela(parcela.id, "inicio", event.target.value)} />
              </label>
              <label>
                <span>Fim (calculado)</span>
                <input className="prototype-ferias-readonly-field" value={formatarDataBr(parcela.fim)} readOnly />
              </label>
              <label>
                <span>
                  <input type="checkbox" checked={Boolean(parcela.terco)} onChange={(event) => atualizarParcela(parcela.id, "terco", event.target.checked)} />
                  {" "}1/3 constitucional
                </span>
                <button type="button" className="prototype-ferias-icon-btn" disabled={parcelas.length === 1} onClick={() => removerParcela(parcela.id)}>
                  <i className="pi pi-trash" aria-hidden="true" />
                </button>
              </label>
            </div>
          ))}
          <button type="button" className="prototype-ferias-sub-add" disabled={parcelas.length >= 3} onClick={adicionarParcela}>
            <i className="pi pi-plus" aria-hidden="true" />
            Adicionar parcela
          </button>
        </div>
      </div>

      <div className="prototype-vinculo-form" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button type="button" className="prototype-vinculo-back" onClick={onCancelar}>
          <i className="pi pi-arrow-left" aria-hidden="true" />
          Cancelar
        </button>
        <button type="button" className="prototype-ferias-btn-primario" onClick={salvar}>
          <i className="pi pi-check" aria-hidden="true" />
          Salvar solicitação
        </button>
      </div>
    </div>
  );
}

export function FormularioColetiva({
  onCancelar,
  onSalvar,
}: Readonly<{ onCancelar: () => void; onSalvar: (registros: FeriasRegistro[]) => void }>) {
  const [orgao, setOrgao] = useState<"SEDUC" | "UNEMAT">("SEDUC");
  const [escola, setEscola] = useState("Escola Estadual Antônio Ferreira");
  const [periodoAquisitivo, setPeriodoAquisitivo] = useState("2026");
  const [tipoVinculoFiltro, setTipoVinculoFiltro] = useState<TipoVinculoFiltro>("Todos");
  const [inicioJulho, setInicioJulho] = useState("2026-07-06");
  const [inicioJaneiro, setInicioJaneiro] = useState("2027-01-04");
  const [buscaNome, setBuscaNome] = useState("");
  const [selecionados, setSelecionados] = useState<Record<number, { incluido: boolean; julho: boolean; janeiro: boolean }>>({});
  const [erro, setErro] = useState<string[]>([]);
  const [confirmacao, setConfirmacao] = useState("");
  const [soComAlerta, setSoComAlerta] = useState(false);

  const fimJulho = calcularFim(inicioJulho, 15);
  const fimJaneiro = calcularFim(inicioJaneiro, 30);

  const alertasDe = (professor: ProfessorLote) => {
    const alertas: string[] = [];
    if (professor.cargoGestao) alertas.push("Cargo de gestão — não entra");
    const deveriaSer45 = professor.situacaoLotacao === "Em escola";
    if ((deveriaSer45 && professor.saldo !== 45) || (!deveriaSer45 && professor.saldo !== 30)) {
      alertas.push("Saldo ≠ lotação");
    }
    if (professor.ltsConcomitante) alertas.push("LTS concomitante");
    return alertas;
  };

  const listaFiltrada = useMemo(() => {
    const buscaNormalizada = buscaNome.trim().toLocaleLowerCase("pt-BR");
    return professoresLote.filter((professor) => {
      if (tipoVinculoFiltro !== "Todos" && professor.vinculo !== tipoVinculoFiltro) return false;
      if (soComAlerta && alertasDe(professor).length === 0) return false;
      if (
        buscaNormalizada &&
        !professor.nome.toLocaleLowerCase("pt-BR").includes(buscaNormalizada) &&
        !professor.matricula.includes(buscaNormalizada)
      ) {
        return false;
      }
      return true;
    });
  }, [buscaNome, tipoVinculoFiltro, soComAlerta]);

  const estadoLinha = (id: number) => selecionados[id] ?? { incluido: false, julho: false, janeiro: false };

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
        if (professor.cargoGestao) return;
        proximo[professor.id] = { ...estadoLinha(professor.id), [campo]: valor };
      });
      return proximo;
    });
  };

  const inconsistencias = listaFiltrada.filter((professor) => {
    const deveriaSer45 = professor.situacaoLotacao === "Em escola";
    return (deveriaSer45 && professor.saldo !== 45) || (!deveriaSer45 && professor.saldo !== 30);
  });

  const lancarLote = () => {
    const erros: string[] = [];
    const incluidos = professoresLote.filter((professor) => !professor.cargoGestao && estadoLinha(professor.id).incluido);

    if (!incluidos.length) {
      erros.push("Selecione pelo menos um servidor incluído com alguma parcela marcada.");
    }

    const comInconsistencia = incluidos.filter((professor) => inconsistencias.includes(professor));
    if (comInconsistencia.length) {
      erros.push(
        `Inconsistência saldo × lotação para: ${comInconsistencia.map((professor) => professor.nome).join(", ")}.`,
      );
    }

    const marcadosJulho = incluidos.filter((professor) => estadoLinha(professor.id).julho);
    const marcadosJaneiro = incluidos.filter((professor) => estadoLinha(professor.id).janeiro);

    if (marcadosJulho.length && !inicioJulho) erros.push("Informe a data de início da parcela de julho.");
    if (marcadosJaneiro.length && !inicioJaneiro) erros.push("Informe a data de início da parcela de janeiro.");
    if (!marcadosJulho.length && !marcadosJaneiro.length) {
      erros.push("Marque ao menos uma parcela (julho ou janeiro) para os servidores incluídos.");
    }

    if (erros.length) {
      setErro(erros);
      setConfirmacao("");
      return;
    }

    setErro([]);

    const loteId = `LOTE-${orgao}-${gerarId()}`;
    const anoAtual = new Date().getFullYear();
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
        setor: orgao === "SEDUC" ? escola : "Sede UNEMAT",
        cargo: "Professor",
        cargoGestao: false,
        tipoVinculo: professor.vinculo,
        tipo: "Coletiva",
        origem: "SIGEP",
        periodoAquisitivoInicio: `${anoAtual}-01-01`,
        periodoAquisitivoFim: `${anoAtual}-12-31`,
        periodoAquisitivoLabel: periodoAquisitivo,
        parcelas,
        situacao: "EM ABERTO",
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

      <div className="prototype-ferias-form-section">
        <h3>1. Órgão &amp; Servidores</h3>
        <div className="prototype-ferias-lote-filtros">
          <label>
            <span>Órgão</span>
            <select value={orgao} onChange={(event) => setOrgao(event.target.value as "SEDUC" | "UNEMAT")}>
              <option value="SEDUC">SEDUC</option>
              <option value="UNEMAT">UNEMAT</option>
            </select>
          </label>
          {orgao === "SEDUC" ? (
            <label>
              <span>Escola/Lotação</span>
              <input value={escola} onChange={(event) => setEscola(event.target.value)} />
            </label>
          ) : null}
          <label>
            <span>Período Aquisitivo</span>
            <input value={periodoAquisitivo} onChange={(event) => setPeriodoAquisitivo(event.target.value)} />
          </label>
          <label>
            <span>Tipo de Vínculo</span>
            <select value={tipoVinculoFiltro} onChange={(event) => setTipoVinculoFiltro(event.target.value as TipoVinculoFiltro)}>
              <option value="Todos">Todos</option>
              <option value="Efetivo">Efetivo</option>
              <option value="Contrato Temporário">Contrato Temporário</option>
            </select>
          </label>
          <label>
            <span>Busca por nome ou matrícula</span>
            <input value={buscaNome} onChange={(event) => setBuscaNome(event.target.value)} placeholder="Digite para buscar" />
          </label>
        </div>

        <div className="prototype-ferias-lote-table-wrap">
          <table className="prototype-ferias-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" onChange={(event) => selecionarTodos("incluido", event.target.checked)} /> Incluir
                </th>
                <th>Servidor</th>
                <th>Vínculo</th>
                <th>Lotação</th>
                <th>Situação</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.map((professor) => {
                const estado = estadoLinha(professor.id);
                const inconsistente = inconsistencias.includes(professor);
                return (
                  <tr key={professor.id} className={professor.cargoGestao ? "prototype-ferias-linha-desabilitada" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        disabled={professor.cargoGestao}
                        checked={estado.incluido}
                        onChange={(event) => alternarLinha(professor, "incluido", event.target.checked)}
                      />
                    </td>
                    <td>
                      {professor.nome}
                      <br />
                      <small>{professor.matricula}</small>
                    </td>
                    <td>{professor.vinculo}</td>
                    <td>{professor.lotacaoNome}</td>
                    <td>{professor.situacaoLotacao}</td>
                    <td className={inconsistente ? "prototype-ferias-saldo-inconsistente" : ""}>{professor.saldo} dias</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="prototype-ferias-form-section">
        <h3>2. Parcelas &amp; Alertas</h3>
        <div className="prototype-ferias-lote-filtros">
          <label>
            <span>Parcela de julho (15 dias) — início</span>
            <input type="date" value={inicioJulho} onChange={(event) => setInicioJulho(event.target.value)} />
          </label>
          <label>
            <span>Parcela de julho — fim (calculado)</span>
            <input className="prototype-ferias-readonly-field" value={formatarDataBr(fimJulho)} readOnly />
          </label>
          <label>
            <span>Parcela de janeiro (30 dias) — início</span>
            <input type="date" value={inicioJaneiro} onChange={(event) => setInicioJaneiro(event.target.value)} />
          </label>
          <label>
            <span>Parcela de janeiro — fim (calculado)</span>
            <input className="prototype-ferias-readonly-field" value={formatarDataBr(fimJaneiro)} readOnly />
          </label>
          <label>
            <span>
              <input type="checkbox" checked={soComAlerta} onChange={(event) => setSoComAlerta(event.target.checked)} /> Mostrar só quem tem alerta
            </span>
          </label>
        </div>

        <div className="prototype-ferias-lote-table-wrap">
          <table className="prototype-ferias-table">
            <thead>
              <tr>
                <th>Servidor</th>
                <th>
                  <input type="checkbox" onChange={(event) => selecionarTodos("julho", event.target.checked)} /> Julho
                </th>
                <th>
                  <input type="checkbox" onChange={(event) => selecionarTodos("janeiro", event.target.checked)} /> Janeiro
                </th>
                <th>Alertas</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.map((professor) => {
                const estado = estadoLinha(professor.id);
                const alertas = alertasDe(professor);
                return (
                  <tr key={professor.id} className={professor.cargoGestao ? "prototype-ferias-linha-desabilitada" : ""}>
                    <td>
                      {professor.nome}
                      <br />
                      <small>{professor.matricula}</small>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        disabled={professor.cargoGestao}
                        checked={estado.julho}
                        onChange={(event) => alternarLinha(professor, "julho", event.target.checked)}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        disabled={professor.cargoGestao}
                        checked={estado.janeiro}
                        onChange={(event) => alternarLinha(professor, "janeiro", event.target.checked)}
                      />
                    </td>
                    <td className="prototype-ferias-alerta-texto">{alertas.join(" · ") || "—"}</td>
                  </tr>
                );
              })}
              {!listaFiltrada.length ? (
                <tr>
                  <td colSpan={4} className="prototype-ferias-empty">Nenhum servidor com alerta no filtro atual.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="prototype-vinculo-form" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button type="button" className="prototype-vinculo-back" onClick={onCancelar}>
          <i className="pi pi-arrow-left" aria-hidden="true" />
          Cancelar
        </button>
        <button type="button" className="prototype-ferias-btn-primario" onClick={lancarLote}>
          <i className="pi pi-check" aria-hidden="true" />
          Lançar Férias Coletivas do Lote
        </button>
      </div>
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
  const [setor, setSetor] = useState("");
  const [periodoAquisitivo, setPeriodoAquisitivo] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dias, setDias] = useState(30);
  const [servidores, setServidores] = useState<ServidorLote[]>([]);
  const [buscaServidor, setBuscaServidor] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novaMatricula, setNovaMatricula] = useState("");
  const [novoCargo, setNovoCargo] = useState("");
  const [novoVinculo, setNovoVinculo] = useState("");

  const [erro, setErro] = useState("");
  const [confirmacao, setConfirmacao] = useState("");

  const fim = calcularFim(dataInicio, dias);

  const adicionarServidor = () => {
    if (!novoNome.trim() || !novaMatricula.trim()) {
      setErro("Informe nome e matrícula do servidor antes de adicionar à lista.");
      return;
    }
    setServidores((atual) => [...atual, { id: gerarId(), nome: novoNome.trim(), matricula: novaMatricula.trim(), cargo: novoCargo.trim(), vinculo: novoVinculo.trim() }]);
    setNovoNome("");
    setNovaMatricula("");
    setNovoCargo("");
    setNovoVinculo("");
    setErro("");
  };

  const removerServidor = (id: number) => {
    setServidores((atual) => atual.filter((servidor) => servidor.id !== id));
  };

  const lancarLote = () => {
    if (!orgao.trim() || !setor.trim() || !dataInicio || !dias) {
      setErro("Preencha órgão, setor, data de início e dias do lote.");
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
      setor,
      cargo: servidor.cargo || "—",
      cargoGestao: true,
      tipoVinculo: "Efetivo",
      tipo: "Lote",
      origem: "SIGEP",
      periodoAquisitivoInicio: periodoAquisitivo ? `${anoAtual}-01-01` : "",
      periodoAquisitivoFim: periodoAquisitivo ? `${anoAtual}-12-31` : "",
      periodoAquisitivoLabel: periodoAquisitivo || undefined,
      parcelas: [{ id: 1, inicio: dataInicio, fim, dias }],
      situacao: "EM ABERTO",
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
      <div className="prototype-ferias-banner" style={{ background: "#fffbeb", borderColor: "#fde68a", color: "#92400e" }}>
        <i className="pi pi-exclamation-triangle" aria-hidden="true" />
        <span>
          <strong>Não é férias coletivas.</strong> Este lançamento em lote é para cargos de gestão/apoio (ex.: equipe
          de apoio que sai no recesso de fim de ano). Não tem a base legal nem as regras de 45/30 dias da coletiva de
          professor SEDUC/UNEMAT — cada registro segue o regime normal de férias, só agendado em massa.
        </span>
      </div>

      {erro ? <div className="prototype-ferias-erro-bloqueio">{erro}</div> : null}
      {confirmacao ? <div className="prototype-ferias-confirmacao">{confirmacao}</div> : null}

      <div className="prototype-ferias-form-section">
        <h3>Dados do lote</h3>
        <div className="prototype-ferias-lote-filtros">
          <label>
            <span>Órgão *</span>
            <select value={orgao} onChange={(event) => setOrgao(event.target.value)}>
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
            <span>Setor *</span>
            <input value={setor} onChange={(event) => setSetor(event.target.value)} placeholder="Ex.: Apoio administrativo — Sede" />
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

      <div className="prototype-ferias-form-section">
        <h3>Servidores do lote ({servidores.length})</h3>
        <datalist id="lote-busca-lista">
          {SERVIDORES_MOCK.map((s) => (
            <option key={s.matricula} value={s.matricula}>{s.nome}</option>
          ))}
          {SERVIDORES_MOCK.map((s) => (
            <option key={s.matricula + "_n"} value={s.nome} />
          ))}
        </datalist>
        <div className="prototype-ferias-sub-nova-linha" style={{ gridTemplateColumns: "2fr 1fr 1fr max-content", alignItems: "flex-end" }}>
          <label>
            <span>Servidor <em style={{ fontWeight: 400, color: "#6b7280", fontSize: "0.78rem" }}>— nome ou matrícula</em></span>
            <input
              list="lote-busca-lista"
              value={buscaServidor || novoNome}
              onChange={(event) => {
                const val = event.target.value;
                setBuscaServidor(val);
                setNovoNome(val);
                const encontrado = buscarServidorMock(val);
                if (encontrado) {
                  setNovoNome(encontrado.nome);
                  setNovaMatricula(encontrado.matricula);
                  setNovoCargo(encontrado.cargo);
                  setNovoVinculo(encontrado.tipoVinculo);
                  setBuscaServidor("");
                }
              }}
              placeholder="Nome ou matrícula"
              autoComplete="off"
            />
          </label>
          <label>
            <span>Cargo</span>
            <input value={novoCargo} onChange={(event) => setNovoCargo(event.target.value)} />
          </label>
          <label>
            <span>Vínculo</span>
            <select value={novoVinculo} onChange={(event) => setNovoVinculo(event.target.value)}>
              <option value="" disabled />
              <option value="Efetivo">Efetivo</option>
              <option value="Comissionado">Comissionado</option>
              <option value="Contrato Temporário">Contrato Temporário</option>
              <option value="Residente Técnico">Residente Técnico</option>
              <option value="Bolsista">Bolsista</option>
              <option value="Estagiário">Estagiário</option>
            </select>
          </label>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button type="button" className="prototype-ferias-icon-btn" title="Adicionar à lista" onClick={adicionarServidor}>
              <i className="pi pi-plus" aria-hidden="true" />
            </button>
          </div>
        </div>

        {servidores.length ? (
          <table className="prototype-ferias-sub-grid">
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
                  <td>{servidor.nome}<br /><small>{servidor.matricula}</small></td>
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
        ) : null}
      </div>

      <div className="prototype-vinculo-form" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button type="button" className="prototype-vinculo-back" onClick={onCancelar}>
          <i className="pi pi-arrow-left" aria-hidden="true" />
          Cancelar
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
  const [dataInicio, setDataInicio] = useState("");
  const [diasRecesso, setDiasRecesso] = useState(15);
  const [emailChefia, setEmailChefia] = useState(true);
  const [erro, setErro] = useState("");
  const [servidorEncontrado, setServidorEncontrado] = useState(false);

  const calcularCarencia = (inicio: string) => {
    if (!inicio) return null;
    const hoje = new Date().toISOString().slice(0, 10);
    const totalDias = diasEntre(inicio, hoje);
    if (totalDias < 0) return null;
    const meses = Math.floor(totalDias / 30.44);
    const diasRestantes = Math.round(totalDias - meses * 30.44);
    const cumpre6 = totalDias >= 182;
    const cumpre4 = totalDias >= 120;
    return { totalDias, meses, diasRestantes, cumpre6, cumpre4, hoje };
  };

  const aplicarServidorRecesso = (servidor: ServidorMock) => {
    setServidorNome(servidor.nome);
    setMatricula(servidor.matricula);
    setOrgao(servidor.orgao);
    setSetor(servidor.setor);
    setCargo(servidor.cargo);
    setTipoVinculo(servidor.tipoVinculo);
    setPeriodoAquisitivoInicio(servidor.periodoAquisitivoInicio);
    setServidorEncontrado(true);
  };

  const buscarServidorRecesso = (valor: string) => {
    const porMatricula = /^\d+$/.test(valor.trim());
    if (porMatricula) {
      setMatricula(valor);
      setServidorNome(valor);
    } else {
      setServidorNome(valor);
    }
    setServidorEncontrado(false);
    const encontrado = buscarServidorMock(valor);
    if (encontrado) aplicarServidorRecesso(encontrado);
  };

  const fim = calcularFim(dataInicio, diasRecesso);
  const bloqueioAuxilioTransporte = tipoVinculo === "Residente Técnico";

  const salvar = () => {
    if (!servidorNome.trim() || !matricula.trim() || !cargo.trim() || !dataInicio) {
      setErro("Preencha servidor, matrícula, cargo e data de início do recesso.");
      return;
    }
    if (!VINCULOS_RECESSO.includes(tipoVinculo)) {
      setErro("Recesso remunerado é exclusivo para Residente Técnico, Bolsista e Estagiário.");
      return;
    }
    const hoje = new Date().toISOString().slice(0, 10);
    if (diasEntre(hoje, dataInicio) < 15) {
      setErro("O recesso exige no mínimo 15 dias de antecedência a partir de hoje.");
      return;
    }
    if (tipoVinculo === "Estagiário") {
      if (!dataInicioVinculo) {
        setErro("Informe a data de início do vínculo — estagiário exige carência de 6 meses.");
        return;
      }
      if (diasEntre(dataInicioVinculo, dataInicio) < 182) {
        setErro("Estagiário: vínculo precisa ter pelo menos 6 meses (182 dias) desde o início até a data do recesso.");
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
      periodoAquisitivoInicio: dataInicioVinculo,
      periodoAquisitivoFim: "",
      parcelas: [{ id: 1, inicio: dataInicio, fim, dias: diasRecesso }],
      situacao: "AGUARDANDO VALIDAÇÃO",
      dataLimiteValidacaoChefia: calcularPrazoValidacaoChefia(),
      bloqueioAuxilioTransporte,
      emailChefiaEnviado: emailChefia,
      substitutos: [],
      responsavelLancamento: "Usuário atual",
      lancadoEm: new Date().toLocaleString("pt-BR"),
    });
  };

  return (
    <div>
      <div className="prototype-ferias-banner" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#166534" }}>
        <i className="pi pi-info-circle" aria-hidden="true" />
        <span>
          <strong>Não é férias.</strong> Recesso remunerado é permissão de ausência remunerada (IN 05) — 15 dias
          fixos, sem parcelamento, sem 1/3 constitucional e nunca gera substituição. Exige 15 dias de antecedência.
          Carência de 6 meses de vínculo só se aplica ao estagiário.
        </span>
      </div>

      {erro ? <div className="prototype-ferias-erro-bloqueio">{erro}</div> : null}

      <div className="prototype-ferias-form-section">
        <h3>
          Servidor
          {servidorEncontrado && (
            <span className="prototype-ferias-servidor-encontrado">
              <i className="pi pi-check-circle" /> Servidor encontrado — campos preenchidos automaticamente
            </span>
          )}
        </h3>
        <datalist id="recesso-busca-lista">
          {SERVIDORES_MOCK.map((s) => (
            <option key={s.matricula} value={s.matricula}>{s.nome}</option>
          ))}
          {SERVIDORES_MOCK.map((s) => (
            <option key={s.matricula + "_n"} value={s.nome} />
          ))}
        </datalist>
        <div className="prototype-ferias-form-grid">
          <label style={{ gridColumn: "1 / -1" }}>
            <span>Servidor * <em style={{ fontWeight: 400, color: "#6b7280", fontSize: "0.78rem" }}>— busque por nome ou matrícula</em></span>
            <input
              list="recesso-busca-lista"
              value={servidorNome || matricula}
              onChange={(event) => buscarServidorRecesso(event.target.value)}
              placeholder="Nome do servidor ou matrícula"
              autoComplete="off"
              className={servidorEncontrado ? "prototype-ferias-input-autopreenchido" : ""}
            />
          </label>
          {servidorEncontrado && (
            <label>
              <span>Matrícula</span>
              <input value={matricula} readOnly className="prototype-ferias-input-autopreenchido" />
            </label>
          )}
          <label>
            <span>Órgão *</span>
            <input value={orgao} onChange={(event) => setOrgao(event.target.value)} readOnly={servidorEncontrado} className={servidorEncontrado ? "prototype-ferias-input-autopreenchido" : ""} />
          </label>
          <label>
            <span>Setor</span>
            <input value={setor} onChange={(event) => setSetor(event.target.value)} readOnly={servidorEncontrado} className={servidorEncontrado ? "prototype-ferias-input-autopreenchido" : ""} />
          </label>
          <label>
            <span>Cargo/Função *</span>
            <input value={cargo} onChange={(event) => setCargo(event.target.value)} readOnly={servidorEncontrado} className={servidorEncontrado ? "prototype-ferias-input-autopreenchido" : ""} />
          </label>
          <label>
            <span>Tipo de Vínculo *</span>
            <input
              value={tipoVinculo}
              readOnly
              placeholder=""
              className={servidorEncontrado ? "prototype-ferias-input-autopreenchido" : ""}
            />
          </label>
          {tipoVinculo === "Estagiário" ? (
            <label>
              <span>Data de início do vínculo *</span>
              <input type="date" value={dataInicioVinculo} onChange={(event) => setDataInicioVinculo(event.target.value)} />
            </label>
          ) : null}
        </div>
        {servidorEncontrado && (
          <button
            type="button"
            className="prototype-ferias-btn-limpar-servidor"
            onClick={() => {
              setServidorNome("");
              setMatricula("");
              setOrgao("SEPLAG/MT");
              setSetor("");
              setCargo("");
              setTipoVinculo("Residente Técnico");
              setPeriodoAquisitivoInicio("");
              setServidorEncontrado(false);
            }}
          >
            <i className="pi pi-times" /> Limpar servidor
          </button>
        )}
      </div>

      {(servidorEncontrado || periodoAquisitivoInicio) && (() => {
        const ref = periodoAquisitivoInicio;
        const carencia = calcularCarencia(ref);
        if (!carencia) return null;
        const hoje = new Date().toISOString().slice(0, 10);
        return (
          <div className="prototype-ferias-form-section prototype-ferias-carencia-painel">
            <h3>Período aquisitivo &amp; carência</h3>
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
        <h3>Recesso (15 dias fixos, sem parcelamento)</h3>
        <div className="prototype-ferias-form-grid">
          <label>
            <span>Dias</span>
            <input
              type="number"
              min={1}
              max={15}
              value={diasRecesso}
              onChange={(event) => setDiasRecesso(Number(event.target.value))}
            />
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

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <input type="checkbox" checked={emailChefia} onChange={(event) => setEmailChefia(event.target.checked)} />
          <span>Enviar e-mail automático à chefia imediata com os dados do agendamento</span>
        </label>

        {bloqueioAuxilioTransporte ? (
          <div className="prototype-ferias-erro-bloqueio" style={{ marginTop: 12, background: "#fffbeb", borderColor: "#fde68a", color: "#92400e" }}>
            Residente técnico: durante o usufruto recebe só a bolsa — o auxílio-transporte é <strong>bloqueado</strong>
            {" "}automaticamente ao validar.
          </div>
        ) : null}
      </div>

      <div className="prototype-vinculo-form" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button type="button" className="prototype-vinculo-back" onClick={onCancelar}>
          <i className="pi pi-arrow-left" aria-hidden="true" />
          Cancelar
        </button>
        <button type="button" className="prototype-ferias-btn-primario" onClick={salvar}>
          <i className="pi pi-check" aria-hidden="true" />
          Salvar solicitação
        </button>
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

export function ModalConfirmarCancelamento({
  onFechar,
  onConfirmar,
}: Readonly<{ onFechar: () => void; onConfirmar: () => void }>) {
  return (
    <ModalSeplag visible fechar={onFechar} titulo="Cancelar solicitação" hideFooter tamanho="420px">
      <div style={{ width: "100%" }} className="prototype-ferias-form-section">
        <p>Os dados preenchidos serão perdidos. Deseja realmente cancelar e voltar para a listagem?</p>
        <div className="prototype-vinculo-form" style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button type="button" className="prototype-vinculo-back" onClick={onFechar}>
            Continuar preenchendo
          </button>
          <button type="button" className="prototype-ferias-btn-primario" style={{ background: "#dc2626" }} onClick={onConfirmar}>
            <i className="pi pi-times" aria-hidden="true" />
            Sim, cancelar
          </button>
        </div>
      </div>
    </ModalSeplag>
  );
}
