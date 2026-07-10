import { type ReactNode, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm, type FieldErrors } from "react-hook-form";
import { AnexarDocumentoSeplag, type ArquivoAnexadoSeplag } from "../../componentes/AnexarDocumento";
import { BotaoConsultarSeplag, BotaoIconSeplag, BotaoLimparFiltroSeplag, BotaoSalvarSeplag, BotaoSeplag, BotaoVoltarSeplag } from "../../componentes/Botao";
import { CardSeplag } from "../../componentes/Card";
import { DropdownFieldSeplag, RadioButtonFieldSeplag, TextAreaFieldSeplag, TextFieldSeplag } from "../../componentes/Fields";
import { LayoutSeplag } from "../../componentes/layout/layout/Layout";
import { ModalSeplag } from "../../componentes/Modal";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "../../componentes/TablePaginado";
import type { AppSystemItemSeplag } from "../../componentes/layout/AppSwitcher";
import type { IMenuSeplag, IVinculoSeplag } from "../../componentes/layout/Config/menu";
import logoSeplag from "../../assets/img/logo-seplag.png";
import {
  sicadTemAlgumaPermissao,
  sicadSelecionarUsuarioMockado,
  sicadTemPermissao,
  sicadUsuarioMockado,
  sicadUsuariosMockados,
  type SicadPermissaoOcorrencia,
} from "./sicadAccessMock";
import "../../componentes/layout/layout/Layout.css";
import "./sicad.css";
import {
  adicionarComentarioSicadOcorrenciaMock,
  alterarStatusSicadOcorrenciaMock,
  assumirSicadOcorrenciaMock,
  atualizarSicadOcorrenciaMock,
  buscarSicadOcorrenciaPorIdMock,
  criarSicadOcorrenciaMock,
  listarSicadFilaOcorrenciasMock as listarSicadFilaCentralMock,
  listarSicadMinhasOcorrenciasMock as listarSicadMinhasCentralMock,
  registrarHistoricoSicadOcorrenciaMock,
  reordenarSicadFilaMock,
  responderInformacoesSicadOcorrenciaMock,
  salvarRedmineSicadOcorrenciaMock,
  solicitarInformacoesSicadOcorrenciaMock,
  type SicadOcorrenciaService,
} from "./sicadOcorrenciasMockService";

const SICAD_BASE_PATH = "/prototipos/sicad";
const SICAD_OCORRENCIAS_BASE_PATH = `${SICAD_BASE_PATH}/ocorrencias`;

const getSicadPath = (path: string) => `${SICAD_BASE_PATH}${path}`;
const getSicadHashPath = (path: string) => `#${getSicadPath(path)}`;

const sicadCentralOccurrenceAccessPermissions: SicadPermissaoOcorrencia[] = [
  "acessarNovaOcorrencia",
  "acessarMinhasOcorrencias",
  "acessarFilaOcorrencias",
  "acessarDashboard",
  "acessarRelatorios",
  "acessarBaseConhecimento",
  "visualizarOcorrenciasAbertas",
  "visualizarTodasOcorrencias",
  "visualizarOcorrenciasValidacao",
];

const menuSicad: IMenuSeplag[] = [
  {
    label: "Página Inicial",
    icon: "pi pi-home",
    to: SICAD_BASE_PATH,
    visibleOnMenu: true,
    visibleOnRouter: true,
  },
  {
    label: "Cartão de Pagamento - CPGMT",
    icon: "pi pi-credit-card",
    url: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
  },
  {
    label: "Adiantamento",
    icon: "pi pi-wallet",
    url: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
  },
  {
    label: "Prestação de Contas",
    icon: "pi pi-file-check",
    url: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
  },
  {
    label: "Relatórios",
    icon: "pi pi-chart-bar",
    url: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
    items: [
      { label: "Extrato de Adiantamentos", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
      { label: "Saldos por Unidade", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
    ],
  },
  {
    label: "Administrador",
    icon: "pi pi-cog",
    url: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
    items: [
      { label: "Parâmetros", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
      { label: "Perfis de Acesso", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
    ],
  },
  {
    label: "Central de Ocorrências",
    icon: "pi pi-headphones",
    url: "#",
    visibleOnMenu: sicadTemAlgumaPermissao(sicadCentralOccurrenceAccessPermissions),
    visibleOnRouter: true,
    items: [
      { label: "Base de Conhecimento", icon: "pi pi-circle-on", to: getSicadPath("/ocorrencias/base-conhecimento"), visibleOnMenu: sicadTemPermissao("acessarBaseConhecimento"), visibleOnRouter: true },
      { label: "Minhas Ocorrências", icon: "pi pi-circle-on", to: getSicadPath("/ocorrencias/minhas"), visibleOnMenu: sicadTemPermissao("acessarMinhasOcorrencias"), visibleOnRouter: true },
      { label: "Fila de Ocorrências", icon: "pi pi-circle-on", to: getSicadPath("/ocorrencias/fila"), visibleOnMenu: sicadTemPermissao("acessarFilaOcorrencias"), visibleOnRouter: true },
      { label: "Dashboard", icon: "pi pi-circle-on", to: getSicadPath("/ocorrencias/dashboard"), visibleOnMenu: sicadTemPermissao("acessarDashboard"), visibleOnRouter: true },
      { label: "Relatórios", icon: "pi pi-circle-on", to: getSicadPath("/ocorrencias/relatorios"), visibleOnMenu: sicadTemPermissao("acessarRelatorios"), visibleOnRouter: true },
    ],
  },
  {
    label: "Painéis",
    icon: "pi pi-chart-pie",
    url: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
  },
];

const sistemasSicad: AppSystemItemSeplag[] = [
  { id: "sigep", label: "SIGEP", url: "#/prototipos/sigep", icon: "pi pi-users" },
  { id: "sicad", label: "SICAD", url: "#/prototipos/sicad", icon: "pi pi-wallet" },
];

const vinculosSicad: IVinculoSeplag[] = [
  { numrVinculo: 2, statVinculo: "ATIVO", unidade: { descUnidade: "CDS-TI" }, orgao: { descOrgao: "SEPLAG-MT" } },
  { numrVinculo: 1, statVinculo: "ATIVO", unidade: { descUnidade: "STI" }, orgao: { descOrgao: "SEPLAG-MT" } },
];

const sicadOccurrenceTypeOptions = [
  { label: "Bug", value: "Bug" },
  { label: "Dúvida", value: "Dúvida" },
  { label: "Inconsistência cadastral", value: "Inconsistência cadastral" },
  { label: "Banco de Dados", value: "Banco de Dados" },
  { label: "Integração", value: "Integração" },
  { label: "Regra de negócio", value: "Regra de negócio" },
  { label: "Melhoria", value: "Melhoria" },
];

const sicadEnvironmentOptions = [
  { label: "Produção", value: "Produção" },
  { label: "Homologação", value: "Homologação" },
  { label: "Local", value: "Local" },
];

const sicadPriorityOptions = [
  { label: "Baixa", value: "Baixa" },
  { label: "Média", value: "Média" },
  { label: "Alta", value: "Alta" },
  { label: "Crítica", value: "Crítica" },
];

const sicadOrgaoOptions = [
  { label: "SEPLAG", value: "SEPLAG" },
  { label: "SEFAZ", value: "SEFAZ" },
  { label: "CGE", value: "CGE" },
  { label: "PGE", value: "PGE" },
  { label: "SES", value: "SES" },
];

type SicadNovaOcorrenciaForm = {
  tipo: string;
  sistema: "SICAD";
  ambiente: string;
  prioridade: string;
  titulo: string;
  orgao: string;
  usuarioAfetado: string;
  cpf: string;
  matricula: string;
  numeroSolicitacaoPrestacao: string;
  descricao: string;
  mensagemErro: string;
};
type SicadOcorrenciaStatus =
  | "Novo"
  | "Em análise"
  | "Aguardando Informações"
  | "Em desenvolvimento"
  | "Em validação"
  | "Concluída";

type SicadOcorrenciaMock = {
  id: string;
  numero: string;
  dataAbertura: string;
  tipo: string;
  titulo: string;
  ambiente: string;
  prioridade: string;
  status: SicadOcorrenciaStatus;
  orgao: string;
  numeroSolicitacaoPrestacao: string;
};

type SicadMinhasOcorrenciasFiltroForm = {
  numero: string;
  titulo: string;
  tipo: string;
  ambiente: string;
  prioridade: string;
  status: string;
  orgao: string;
  numeroSolicitacaoPrestacao: string;
  periodoInicial: string;
  periodoFinal: string;
};

const sicadStatusOptions = [
  { label: "Novo", value: "Novo" },
  { label: "Em análise", value: "Em análise" },
  { label: "Aguardando Informações", value: "Aguardando Informações" },
  { label: "Em desenvolvimento", value: "Em desenvolvimento" },
  { label: "Em validação", value: "Em validação" },
  { label: "Concluída", value: "Concluída" },
];
type SicadFilaOcorrenciaStatus =
  | "Novo"
  | "Em Análise"
  | "Aguardando Informações"
  | "Em Desenvolvimento"
  | "Em Validação"
  | "Concluído"
  | "Cancelado";

type SicadFilaOcorrenciaMock = {
  id: string;
  ordem: number;
  numero: string;
  data: string;
  tipo: string;
  titulo: string;
  ambiente: string;
  prioridade: string;
  status: SicadFilaOcorrenciaStatus;
  responsavel: string;
  orgao: string;
  numeroSolicitacaoPrestacao: string;
};

type SicadFilaOcorrenciasFiltroForm = {
  status: string;
  tipo: string;
  ambiente: string;
  prioridade: string;
  orgao: string;
  responsavel: string;
  numeroSolicitacaoPrestacao: string;
  data: string;
};

type SicadRelatoriosFiltroForm = {
  periodoInicial: string;
  periodoFinal: string;
  tipo: string;
  ambiente: string;
  prioridade: string;
  status: string;
  orgao: string;
  responsavel: string;
  usuario: string;
  cpf: string;
  numeroSolicitacaoPrestacao: string;
  numeroRedmine: string;
};

type SicadRelatorioOcorrenciaMock = {
  id: string;
  numero: string;
  dataAbertura: string;
  dataConclusao: string;
  tipo: string;
  titulo: string;
  ambiente: string;
  prioridade: string;
  status: SicadFilaOcorrenciaStatus;
  responsavel: string;
  orgao: string;
  usuario: string;
  cpf: string;
  numeroSolicitacaoPrestacao: string;
  numeroRedmine: string;
  tempoAtendimento: string;
};

type SicadOcorrenciaAnexoMock = {
  nome: string;
  tamanho: string;
  dataHora: string;
};

type SicadOcorrenciaDetalheMock = {
  id: string;
  numero: string;
  status: SicadFilaOcorrenciaStatus;
  tipo: string;
  ambiente: string;
  prioridade: string;
  titulo: string;
  orgao: string;
  usuario: string;
  cpf: string;
  matricula: string;
  numeroSolicitacaoPrestacao: string;
  descricao: string;
  mensagemErro: string;
  anexos: SicadOcorrenciaAnexoMock[];
};

type SicadOcorrenciaHistoricoMock = {
  id: string;
  dataHora: string;
  usuario: string;
  acao: string;
  observacao: string;
};

type SicadOcorrenciaComentarioMock = {
  id: string;
  usuario: string;
  perfil: string;
  dataHora: string;
  texto: string;
};

type SicadOcorrenciaDetalheStorage = {
  ocorrencia: SicadOcorrenciaDetalheMock;
  historico: SicadOcorrenciaHistoricoMock[];
  comentarios: SicadOcorrenciaComentarioMock[];
};

type SicadDashboardMetric = {
  id: string;
  label: string;
  value: number;
  trend: number;
  icon: string;
  tone: "blue" | "orange" | "red" | "purple" | "teal" | "green";
};

type SicadDashboardChartItem = {
  label: string;
  value: number;
  color: string;
};

type SicadDashboardBarItem = SicadDashboardChartItem;

type SicadModeloRedmineTipo = "Desenvolvimento" | "Banco de Dados";

type SicadAnaliseTecnicaForm = {
  causaProvavel: string;
  observacoesTecnicas: string;
  responsavel: string;
  numeroRedmine: string;
  status: SicadFilaOcorrenciaStatus;
  prioridade: string;
};

const sicadFilaStatusOptions = [
  { label: "Novo", value: "Novo" },
  { label: "Em Análise", value: "Em Análise" },
  { label: "Aguardando Informações", value: "Aguardando Informações" },
  { label: "Em Desenvolvimento", value: "Em Desenvolvimento" },
  { label: "Em Validação", value: "Em Validação" },
  { label: "Concluído", value: "Concluído" },
  { label: "Cancelado", value: "Cancelado" },
];

const sicadResponsavelOptions = [
  { label: "Ana Oliveira", value: "Ana Oliveira" },
  { label: "Carlos Silva", value: "Carlos Silva" },
  { label: "Mariana Costa", value: "Mariana Costa" },
  { label: "Lucas Pereira", value: "Lucas Pereira" },
  { label: "Rafael Lima", value: "Rafael Lima" },
  { label: sicadUsuarioMockado.nome, value: sicadUsuarioMockado.nome },
];

const sicadCausaProvavelOptions = [
  { label: "Falha na integração com módulo interno", value: "Falha na integração com módulo interno" },
  { label: "Regra de negócio divergente", value: "Regra de negócio divergente" },
  { label: "Inconsistência cadastral", value: "Inconsistência cadastral" },
  { label: "Indisponibilidade de serviço externo", value: "Indisponibilidade de serviço externo" },
  { label: "Erro ainda em análise", value: "Erro ainda em análise" },
];

const sicadDashboardMetricsMock: SicadDashboardMetric[] = [
  { id: "novas", label: "Novas", value: 28, trend: 12, icon: "pi pi-file", tone: "blue" },
  { id: "analise", label: "Em Análise", value: 52, trend: 8, icon: "pi pi-search", tone: "orange" },
  { id: "aguardando", label: "Aguardando Informações", value: 17, trend: -15, icon: "pi pi-comments", tone: "red" },
  { id: "desenvolvimento", label: "Em Desenvolvimento", value: 31, trend: 10, icon: "pi pi-code", tone: "purple" },
  { id: "validacao", label: "Em Validação", value: 14, trend: -7, icon: "pi pi-clipboard", tone: "teal" },
  { id: "concluidas", label: "Concluídas", value: 86, trend: 18, icon: "pi pi-check-circle", tone: "green" },
];

const sicadDashboardTipoMock: SicadDashboardChartItem[] = [
  { label: "Erro", value: 87, color: "#2f80df" },
  { label: "Melhoria", value: 57, color: "#46b86b" },
  { label: "Solicitação", value: 45, color: "#f4bd22" },
  { label: "Dúvida", value: 27, color: "#8059c7" },
  { label: "Outro", value: 12, color: "#5dbceb" },
];

const sicadDashboardPrioridadeMock: SicadDashboardChartItem[] = [
  { label: "Alta", value: 91, color: "#e94b4b" },
  { label: "Média", value: 80, color: "#f28a2d" },
  { label: "Baixa", value: 46, color: "#f4bd22" },
  { label: "Crítica", value: 11, color: "#9ca3af" },
];

const sicadDashboardStatusMock: SicadDashboardChartItem[] = [
  { label: "Novas", value: 28, color: "#2f80df" },
  { label: "Em Análise", value: 52, color: "#f28a2d" },
  { label: "Aguardando Informações", value: 17, color: "#e94b4b" },
  { label: "Em Desenvolvimento", value: 31, color: "#8059c7" },
  { label: "Em Validação", value: 14, color: "#15a3b3" },
  { label: "Concluídas", value: 86, color: "#46b86b" },
];

const sicadDashboardOrgaoMock: SicadDashboardBarItem[] = [
  { label: "SEPLAG", value: 68, color: "#2f80df" },
  { label: "SEFAZ", value: 42, color: "#2f80df" },
  { label: "SES", value: 37, color: "#2f80df" },
  { label: "SINFRA", value: 26, color: "#2f80df" },
  { label: "SEDUC", value: 18, color: "#2f80df" },
  { label: "SESP", value: 15, color: "#2f80df" },
  { label: "SETASC", value: 12, color: "#2f80df" },
  { label: "Outros", value: 10, color: "#2f80df" },
];

const sicadRelatoriosOcorrenciasMock: SicadRelatorioOcorrenciaMock[] = [
  { id: "000012-2024", numero: "000012/2024", dataAbertura: "31/05/2024 10:43", dataConclusao: "02/06/2024 14:21", tipo: "Bug", titulo: "Erro ao gerar relatório financeiro", ambiente: "Produção", prioridade: "Alta", status: "Concluído", responsavel: "Mariana Costa", orgao: "SEPLAG", usuario: "Taylor Santos", cpf: "123.456.789-00", numeroSolicitacaoPrestacao: "12345/2024", numeroRedmine: "RED-24567", tempoAtendimento: "1d 3h 38m" },
  { id: "000011-2024", numero: "000011/2024", dataAbertura: "30/05/2024 16:15", dataConclusao: "-", tipo: "Melhoria", titulo: "Inclusão de filtro por data", ambiente: "Homologação", prioridade: "Média", status: "Em Análise", responsavel: "João Pereira", orgao: "SEFAZ", usuario: "Roberto Junior", cpf: "987.654.321-00", numeroSolicitacaoPrestacao: "12344/2024", numeroRedmine: "RED-24566", tempoAtendimento: "10h 22m" },
  { id: "000010-2024", numero: "000010/2024", dataAbertura: "30/05/2024 09:22", dataConclusao: "31/05/2024 11:05", tipo: "Bug", titulo: "Sistema não permite excluir anexo", ambiente: "Produção", prioridade: "Alta", status: "Concluído", responsavel: "Ana Carolina", orgao: "CGE", usuario: "Marcos Lima", cpf: "456.789.123-00", numeroSolicitacaoPrestacao: "12343/2024", numeroRedmine: "RED-24565", tempoAtendimento: "1d 1h 43m" },
  { id: "000009-2024", numero: "000009/2024", dataAbertura: "29/05/2024 14:50", dataConclusao: "-", tipo: "Dúvida", titulo: "Como configurar permissões de usuário?", ambiente: "Homologação", prioridade: "Baixa", status: "Aguardando Informações", responsavel: "Lucas Almeida", orgao: "SEPLAG", usuario: "Carla Souza", cpf: "321.654.987-00", numeroSolicitacaoPrestacao: "12342/2024", numeroRedmine: "RED-24564", tempoAtendimento: "1d 20h 15m" },
  { id: "000008-2024", numero: "000008/2024", dataAbertura: "29/05/2024 11:10", dataConclusao: "30/05/2024 15:30", tipo: "Melhoria", titulo: "Relatório gerencial com gráfico", ambiente: "Produção", prioridade: "Média", status: "Concluído", responsavel: "Mariana Silva", orgao: "SEPLAG", usuario: "Helena Prado", cpf: "654.123.987-00", numeroSolicitacaoPrestacao: "12341/2024", numeroRedmine: "RED-24563", tempoAtendimento: "1d 4h 20m" },
  { id: "000007-2024", numero: "000007/2024", dataAbertura: "28/05/2024 17:35", dataConclusao: "-", tipo: "Integração", titulo: "Erro 500 ao salvar registro", ambiente: "Produção", prioridade: "Alta", status: "Em Desenvolvimento", responsavel: "Rafael Costa", orgao: "SES", usuario: "Paulo Mendes", cpf: "789.123.456-00", numeroSolicitacaoPrestacao: "12340/2024", numeroRedmine: "RED-24562", tempoAtendimento: "2d 2h 55m" },
  { id: "000006-2024", numero: "000006/2024", dataAbertura: "28/05/2024 10:01", dataConclusao: "29/05/2024 16:45", tipo: "Banco de Dados", titulo: "Ajuste na exportação para Excel", ambiente: "Homologação", prioridade: "Baixa", status: "Concluído", responsavel: "João Pereira", orgao: "SEFAZ", usuario: "Fernanda Reis", cpf: "147.258.369-00", numeroSolicitacaoPrestacao: "12339/2024", numeroRedmine: "RED-24561", tempoAtendimento: "1d 6h 44m" },
  { id: "000005-2024", numero: "000005/2024", dataAbertura: "27/05/2024 09:40", dataConclusao: "-", tipo: "Regra de negócio", titulo: "Validação de prestação não aplicada", ambiente: "Produção", prioridade: "Crítica", status: "Em Validação", responsavel: "Ana Oliveira", orgao: "PGE", usuario: "Ricardo Alves", cpf: "258.369.147-00", numeroSolicitacaoPrestacao: "12338/2024", numeroRedmine: "RED-24560", tempoAtendimento: "3d 5h 12m" },
  { id: "000004-2024", numero: "000004/2024", dataAbertura: "26/05/2024 15:18", dataConclusao: "-", tipo: "Inconsistência cadastral", titulo: "Dados do credor não atualizados", ambiente: "Local", prioridade: "Média", status: "Novo", responsavel: "-", orgao: "SEPLAG", usuario: "Juliana Rocha", cpf: "369.147.258-00", numeroSolicitacaoPrestacao: "12337/2024", numeroRedmine: "-", tempoAtendimento: "4h 30m" },
  { id: "000003-2024", numero: "000003/2024", dataAbertura: "25/05/2024 08:05", dataConclusao: "-", tipo: "Dúvida", titulo: "Orientação sobre adiantamento", ambiente: "Produção", prioridade: "Baixa", status: "Cancelado", responsavel: "Carlos Silva", orgao: "SES", usuario: "Patrícia Moura", cpf: "159.357.486-00", numeroSolicitacaoPrestacao: "12336/2024", numeroRedmine: "-", tempoAtendimento: "6h 12m" },
  { id: "000002-2024", numero: "000002/2024", dataAbertura: "24/05/2024 13:27", dataConclusao: "-", tipo: "Integração", titulo: "Falha na integração com FIPLAN", ambiente: "Homologação", prioridade: "Alta", status: "Em Análise", responsavel: "Mariana Costa", orgao: "SEFAZ", usuario: "Eduardo Neves", cpf: "753.951.852-00", numeroSolicitacaoPrestacao: "12335/2024", numeroRedmine: "RED-24559", tempoAtendimento: "2d 8h 10m" },
  { id: "000001-2024", numero: "000001/2024", dataAbertura: "23/05/2024 11:12", dataConclusao: "24/05/2024 10:30", tipo: "Melhoria", titulo: "Campo observação no formulário", ambiente: "Produção", prioridade: "Média", status: "Concluído", responsavel: "Rafael Lima", orgao: "SEPLAG", usuario: "Larissa Nunes", cpf: "852.741.963-00", numeroSolicitacaoPrestacao: "12334/2024", numeroRedmine: "RED-24558", tempoAtendimento: "23h 18m" },
];
const sicadDetalheOcorrenciaMock: SicadOcorrenciaDetalheMock = {
  id: "000123-2024",
  numero: "2025-000123",
  status: "Em Análise",
  tipo: "Bug",
  ambiente: "Produção",
  prioridade: "Alta",
  titulo: "Erro ao emitir relatório de prestação de contas",
  orgao: "SEPLAG - Secretaria de Estado de Planejamento e Gestão",
  usuario: "Taylor Santos",
  cpf: "***.123.456-**",
  matricula: "123456",
  numeroSolicitacaoPrestacao: "PC-2025-004567",
  descricao:
    "Ao tentar emitir o relatório de prestação de contas, o sistema apresenta uma mensagem de erro e não gera o relatório.",
  mensagemErro:
    "ERRO 500 - Ocorreu um erro interno no servidor. Tente novamente mais tarde ou entre em contato com o suporte.",
  anexos: [
    { nome: "print_erro_relatorio.png", tamanho: "245 KB", dataHora: "10/05/2025 14:32" },
    { nome: "log_erro_relatorio.txt", tamanho: "18 KB", dataHora: "10/05/2025 14:32" },
  ],
};

const sicadDetalheHistoricoMock: SicadOcorrenciaHistoricoMock[] = [
  {
    id: "hist-1",
    dataHora: "10/05/2025 14:32",
    usuario: "Taylor Santos (Suporte)",
    acao: "Ocorrência criada",
    observacao: "Ocorrência registrada pelo usuário.",
  },
  {
    id: "hist-2",
    dataHora: "10/05/2025 15:10",
    usuario: "Ana Paula (Suporte)",
    acao: "Status alterado",
    observacao: "Status alterado de Novo para Aguardando Informações.",
  },
  {
    id: "hist-3",
    dataHora: "10/05/2025 16:05",
    usuario: "Taylor Santos (Suporte)",
    acao: "Comentário adicionado",
    observacao: "Envio de log e print solicitados.",
  },
  {
    id: "hist-4",
    dataHora: "11/05/2025 09:20",
    usuario: "João Silva (Analista)",
    acao: "Assumiu a ocorrência",
    observacao: "Ocorrência assumida para análise.",
  },
];

const sicadDetalheComentariosMock: SicadOcorrenciaComentarioMock[] = [
  {
    id: "coment-1",
    usuario: "Ana Paula",
    perfil: "Suporte",
    dataHora: "10/05/2025 15:10",
    texto: "Poderia nos enviar o print da tela com o erro e o log do sistema?",
  },
  {
    id: "coment-2",
    usuario: "Taylor Santos",
    perfil: "Suporte",
    dataHora: "10/05/2025 16:05",
    texto: "Segue em anexo o print e o log solicitados.",
  },
  {
    id: "coment-3",
    usuario: "João Silva",
    perfil: "Analista",
    dataHora: "11/05/2025 09:25",
    texto: "Recebido, vou analisar e retorno em breve.",
  },
];

const SICAD_DETALHE_OCORRENCIA_STORAGE_KEY = "sicad.ocorrenciaDetalheMock";

function getSicadDetalheOcorrenciaInicial(id: string): SicadOcorrenciaDetalheStorage {
  const fallback: SicadOcorrenciaDetalheStorage = {
    ocorrencia: { ...sicadDetalheOcorrenciaMock, id },
    historico: sicadDetalheHistoricoMock,
    comentarios: sicadDetalheComentariosMock,
  };

  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(SICAD_DETALHE_OCORRENCIA_STORAGE_KEY);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored) as SicadOcorrenciaDetalheStorage;

    return {
      ocorrencia: { ...fallback.ocorrencia, ...parsed.ocorrencia, id },
      historico: parsed.historico?.length ? parsed.historico : fallback.historico,
      comentarios: parsed.comentarios?.length ? parsed.comentarios : fallback.comentarios,
    };
  } catch {
    return fallback;
  }
}

function salvarSicadDetalheOcorrenciaMock(storage: SicadOcorrenciaDetalheStorage) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    SICAD_DETALHE_OCORRENCIA_STORAGE_KEY,
    JSON.stringify(storage),
  );
}

function mapSicadFilaStatusToMinhasStatus(status: SicadFilaOcorrenciaStatus): SicadOcorrenciaStatus {
  const statusMap: Record<SicadFilaOcorrenciaStatus, SicadOcorrenciaStatus> = {
    Novo: "Novo",
    "Em Análise": "Em análise",
    "Aguardando Informações": "Aguardando Informações",
    "Em Desenvolvimento": "Em desenvolvimento",
    "Em Validação": "Em validação",
    Concluído: "Concluída",
    Cancelado: "Concluída",
  };

  return statusMap[status];
}

function getSicadDetalheStatusPersistido() {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(SICAD_DETALHE_OCORRENCIA_STORAGE_KEY);
    if (!stored) return null;

    return (JSON.parse(stored) as SicadOcorrenciaDetalheStorage).ocorrencia?.status ?? null;
  } catch {
    return null;
  }
}

const sicadFilaOcorrenciasMock: SicadFilaOcorrenciaMock[] = [
  {
    id: "000123-2024",
    ordem: 1,
    numero: "000123/2024",
    data: "10/05/2024 09:15",
    tipo: "Bug",
    titulo: "Erro ao salvar prestação de contas",
    ambiente: "Produção",
    prioridade: "Alta",
    status: "Novo",
    responsavel: "",
    orgao: "SEPLAG",
    numeroSolicitacaoPrestacao: "880123/2024",
  },
  {
    id: "000124-2024",
    ordem: 2,
    numero: "000124/2024",
    data: "10/05/2024 10:32",
    tipo: "Dúvida",
    titulo: "Como gerar relatório de despesas?",
    ambiente: "Homologação",
    prioridade: "Média",
    status: "Novo",
    responsavel: "",
    orgao: "SES",
    numeroSolicitacaoPrestacao: "880124/2024",
  },
  {
    id: "000125-2024",
    ordem: 3,
    numero: "000125/2024",
    data: "09/05/2024 16:48",
    tipo: "Inconsistência cadastral",
    titulo: "CPF duplicado no cadastro de servidor",
    ambiente: "Produção",
    prioridade: "Média",
    status: "Em Análise",
    responsavel: "Ana Oliveira",
    orgao: "SEFAZ",
    numeroSolicitacaoPrestacao: "880125/2024",
  },
  {
    id: "000126-2024",
    ordem: 4,
    numero: "000126/2024",
    data: "09/05/2024 14:22",
    tipo: "Banco de Dados",
    titulo: "Falha na integração com Fiplan",
    ambiente: "Produção",
    prioridade: "Alta",
    status: "Aguardando Informações",
    responsavel: "Carlos Silva",
    orgao: "SAD",
    numeroSolicitacaoPrestacao: "880126/2024",
  },
  {
    id: "000127-2024",
    ordem: 5,
    numero: "000127/2024",
    data: "08/05/2024 11:05",
    tipo: "Integração",
    titulo: "Timeout na integração com sistema externo",
    ambiente: "Homologação",
    prioridade: "Baixa",
    status: "Em Desenvolvimento",
    responsavel: "Mariana Costa",
    orgao: "DETRAN",
    numeroSolicitacaoPrestacao: "880127/2024",
  },
  {
    id: "000128-2024",
    ordem: 6,
    numero: "000128/2024",
    data: "07/05/2024 15:40",
    tipo: "Regra de negócio",
    titulo: "Regra de aprovação não está sendo aplicada",
    ambiente: "Local",
    prioridade: "Média",
    status: "Em Validação",
    responsavel: "Lucas Pereira",
    orgao: "PGE",
    numeroSolicitacaoPrestacao: "880128/2024",
  },
  {
    id: "000129-2024",
    ordem: 7,
    numero: "000129/2024",
    data: "06/05/2024 17:20",
    tipo: "Melhoria",
    titulo: "Incluir campo observação no formulário",
    ambiente: "Produção",
    prioridade: "Baixa",
    status: "Concluído",
    responsavel: "Rafael Lima",
    orgao: "SEPLAG",
    numeroSolicitacaoPrestacao: "880129/2024",
  },
  {
    id: "000130-2024",
    ordem: 8,
    numero: "000130/2024",
    data: "05/05/2024 10:10",
    tipo: "Bug",
    titulo: "Erro ao anexar múltiplos arquivos",
    ambiente: "Homologação",
    prioridade: "Alta",
    status: "Cancelado",
    responsavel: "",
    orgao: "SEDUC",
    numeroSolicitacaoPrestacao: "880130/2024",
  },
];

const sicadMinhasOcorrenciasMock: SicadOcorrenciaMock[] = [
  {
    id: "000123-2024",
    numero: "000123/2024",
    dataAbertura: "10/05/2024 09:15",
    tipo: "Bug",
    titulo: "Erro ao emitir relatório de prestação de contas",
    ambiente: "Produção",
    prioridade: "Alta",
    status: "Novo",
    orgao: "SEPLAG",
    numeroSolicitacaoPrestacao: "PC-2025-004567",
  },
  {
    id: "000012-2024",
    numero: "000012/2024",
    dataAbertura: "31/05/2024 09:15",
    tipo: "Bug",
    titulo: "Erro ao salvar adiantamento",
    ambiente: "Produção",
    prioridade: "Alta",
    status: "Em análise",
    orgao: "SEPLAG",
    numeroSolicitacaoPrestacao: "123456/2024",
  },
  {
    id: "000011-2024",
    numero: "000011/2024",
    dataAbertura: "30/05/2024 16:42",
    tipo: "Dúvida",
    titulo: "Como cancelar solicitação de adiantamento?",
    ambiente: "Homologação",
    prioridade: "Média",
    status: "Aguardando Informações",
    orgao: "SEPLAG",
    numeroSolicitacaoPrestacao: "123400/2024",
  },
  {
    id: "000010-2024",
    numero: "000010/2024",
    dataAbertura: "29/05/2024 11:03",
    tipo: "Inconsistência cadastral",
    titulo: "Dados do credor não atualizados",
    ambiente: "Produção",
    prioridade: "Média",
    status: "Em desenvolvimento",
    orgao: "SEPLAG",
    numeroSolicitacaoPrestacao: "123389/2024",
  },
  {
    id: "000009-2024",
    numero: "000009/2024",
    dataAbertura: "28/05/2024 15:20",
    tipo: "Integração",
    titulo: "Falha na integração com FIPLAN",
    ambiente: "Produção",
    prioridade: "Alta",
    status: "Em análise",
    orgao: "SEFAZ",
    numeroSolicitacaoPrestacao: "987654/2024",
  },
  {
    id: "000008-2024",
    numero: "000008/2024",
    dataAbertura: "27/05/2024 10:10",
    tipo: "Melhoria",
    titulo: "Sugestão de relatório de acompanhamento",
    ambiente: "Homologação",
    prioridade: "Baixa",
    status: "Novo",
    orgao: "SEPLAG",
    numeroSolicitacaoPrestacao: "123300/2024",
  },
  {
    id: "000007-2024",
    numero: "000007/2024",
    dataAbertura: "24/05/2024 14:55",
    tipo: "Bug",
    titulo: "Erro ao anexar documento na prestação",
    ambiente: "Produção",
    prioridade: "Alta",
    status: "Aguardando Informações",
    orgao: "DETRAN",
    numeroSolicitacaoPrestacao: "567890/2024",
  },
  {
    id: "000006-2024",
    numero: "000006/2024",
    dataAbertura: "23/05/2024 09:05",
    tipo: "Banco de Dados",
    titulo: "Consulta retorna dados inconsistentes",
    ambiente: "Produção",
    prioridade: "Crítica",
    status: "Em desenvolvimento",
    orgao: "SEPLAG",
    numeroSolicitacaoPrestacao: "123250/2024",
  },
  {
    id: "000005-2024",
    numero: "000005/2024",
    dataAbertura: "22/05/2024 17:30",
    tipo: "Regra de negócio",
    titulo: "Regra de validação não aplicada",
    ambiente: "Homologação",
    prioridade: "Média",
    status: "Em validação",
    orgao: "SEPLAG",
    numeroSolicitacaoPrestacao: "123200/2024",
  },
];

const requiredFieldMessage = "Campo obrigatório";

function getSicadFormErrorMessage(
  errors: FieldErrors<SicadNovaOcorrenciaForm>,
  name: string,
) {
  const message = errors[name as keyof SicadNovaOcorrenciaForm]?.message;

  if (!message) return null;

  return <small className="p-error">{String(message)}</small>;
}
const sicadHomeActions = [
  {
    id: "cartao-pagamento",
    title: "Solicitar Cartão de Pagamento",
    description: "Cadastro e acompanhamento do cartão CPGMT.",
    icon: "pi pi-file-plus",
    tone: "blue",
    path: "/cartao-pagamento",
  },
  {
    id: "adiantamento",
    title: "Solicitar Adiantamento",
    description: "Registro de solicitação, análise e liberação do adiantamento.",
    icon: "pi pi-file-import",
    tone: "green",
    path: "/adiantamento",
  },
  {
    id: "prestacao-contas",
    title: "Prestar Contas",
    description: "Envio de documentos, conferência e regularização da prestação.",
    icon: "pi pi-file-check",
    tone: "orange",
    path: "/prestacao-contas",
  },
  {
    id: "ocorrencias",
    title: "Central de Ocorrências",
    description: "Registrar, acompanhar e gerenciar ocorrências do sistema.",
    icon: "pi pi-headphones",
    tone: "purple",
    path: "/ocorrencias/minhas",
  },
];

interface SicadShellProps {
  children: ReactNode;
}

function SicadShell({ children }: Readonly<SicadShellProps>) {
  return (
    <div className="prototype-sicad-shell">
      <LayoutSeplag
        nomeSistema="SICAD"
        ambienteSistema="Teste"
        sistemas={sistemasSicad}
        logoSrc={logoSeplag}
        menuItems={menuSicad}
        menuMode="static"
        footerText="SEPLAG - SSCPG - Superintendência de Sistemas Corporativos de Planejamento e Gestão"
        nomeApresentacao={sicadUsuarioMockado.nome}
        numrVinculoAtual={2}
        vinculos={vinculosSicad}
        onLogout={() => {}}
        onAlterarSenha={() => {}}
        onSelecionarVinculo={() => {}}
        profileExtraActions={
          <li className="prototype-sicad-profile-switcher">
            <label htmlFor="sicad-usuario-mockado">Trocar usuário</label>
            <select
              id="sicad-usuario-mockado"
              value={sicadUsuarioMockado.id}
              onChange={(event) => sicadSelecionarUsuarioMockado(event.target.value)}
            >
              {sicadUsuariosMockados.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome} - {usuario.perfil}
                </option>
              ))}
            </select>
          </li>
        }
      >
        {children}
      </LayoutSeplag>
    </div>
  );
}

function SicadAccessDeniedPage({
  title,
  requiredPermissions,
}: Readonly<{
  title: string;
  requiredPermissions: SicadPermissaoOcorrencia[];
}>) {
  return (
    <SicadShell>
      <main className="prototype-sicad-page">
        <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-placeholder-card">
          <section className="prototype-sicad-placeholder-content prototype-sicad-access-denied">
            <span>Central de Ocorrências</span>
            <h1>Acesso restrito</h1>
            <p>
              O perfil mockado <strong>{sicadUsuarioMockado.perfil}</strong> não possui acesso a {title}.
            </p>
            <small>Permissões aceitas: {requiredPermissions.join(", ")}</small>
          </section>
        </CardSeplag>
      </main>
    </SicadShell>
  );
}

function SicadPlaceholderPage({
  title,
  requiredPermissions,
}: Readonly<{
  title: string;
  requiredPermissions?: SicadPermissaoOcorrencia[];
}>) {
  if (requiredPermissions && !sicadTemAlgumaPermissao(requiredPermissions)) {
    return (
      <SicadAccessDeniedPage
        title={title}
        requiredPermissions={requiredPermissions}
      />
    );
  }

  return (
    <SicadShell>
      <main className="prototype-sicad-page">
        <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-placeholder-card">
          <section className="prototype-sicad-placeholder-content">
            <span>Central de Ocorrências</span>
            <h1>{title}</h1>
          </section>
        </CardSeplag>
      </main>
    </SicadShell>
  );
}

export function PrototiposSicadPage() {
  return (
    <SicadShell>
      <main className="prototype-sicad-home-page">
        <section className="prototype-sicad-action-grid" aria-label="Ações do SICAD">
          {sicadHomeActions.map((action) => (
            <Link
              className="prototype-sicad-action-link"
              key={action.id}
              to={getSicadPath(action.path)}
              aria-label={`Abrir ${action.title}`}
            >
              <CardSeplag
                cols="12"
                cardHeaderClassNames={`prototype-sicad-action-card prototype-sicad-action-card--${action.tone}`}
              >
                <article className="prototype-sicad-action-card-content">
                  <div>
                    <h2>{action.title}</h2>
                    <p>{action.description}</p>
                  </div>
                  <span className="prototype-sicad-action-icon" aria-hidden="true">
                    <i className={action.icon} />
                  </span>
                  <span className="prototype-sicad-action-arrow" aria-hidden="true">
                    <i className="pi pi-arrow-right" />
                  </span>
                </article>
              </CardSeplag>
            </Link>
          ))}
        </section>
      </main>
    </SicadShell>
  );
}

export function PrototiposSicadNovaOcorrenciaPage() {
  const navigate = useNavigate();
  const [anexos, setAnexos] = useState<ArquivoAnexadoSeplag[]>([]);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SicadNovaOcorrenciaForm>({
    defaultValues: {
      tipo: "",
      sistema: "SICAD",
      ambiente: "",
      prioridade: "",
      titulo: "",
      orgao: "",
      usuarioAfetado: "",
      cpf: "",
      matricula: "",
      numeroSolicitacaoPrestacao: "",
      descricao: "",
      mensagemErro: "",
    },
  });

  const getFormErrorMessage = (name: string) =>
    getSicadFormErrorMessage(errors, name);

  const handleUploadAnexos = (event: { files?: File[] }) => {
    const files = Array.from(event.files ?? []);

    setAnexos((current) => [
      ...current,
      ...files.map((file) => ({
        nome: file.name,
        extensao: file.name.split(".").pop() ?? "",
        contentType: file.type || "application/octet-stream",
        conteudoEmBase64: "",
        tamanho: file.size,
      })),
    ]);
  };

  const handleCriarOcorrencia = (values: SicadNovaOcorrenciaForm) => {
    criarSicadOcorrenciaMock(
      {
        ...values,
        anexos: anexos.map((anexo) => ({
          nome: anexo.nome,
          tamanho: String(anexo.tamanho ?? "-"),
          dataHora: new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date()),
        })),
      },
      sicadUsuarioMockado,
    );
    navigate("/ocorrencias/minhas");
  };

  if (!sicadTemPermissao("acessarNovaOcorrencia")) {
    return (
      <SicadAccessDeniedPage
        title="Nova Ocorrência"
        requiredPermissions={["acessarNovaOcorrencia"]}
      />
    );
  }

  return (
    <SicadShell>
      <main className="prototype-sicad-page prototype-sicad-form-page">
        <nav className="prototype-sicad-breadcrumb" aria-label="Breadcrumb">
          <Link to={getSicadPath("/ocorrencias/minhas")}>Central de Ocorrências</Link>
          <i className="pi pi-chevron-right" aria-hidden="true" />
          <span>Nova Ocorrência</span>
        </nav>

        <header className="prototype-sicad-page-title">
          <h1>Nova Ocorrência</h1>
          <p>Preencha os dados abaixo para registrar uma nova ocorrência.</p>
        </header>

        <form onSubmit={handleSubmit(handleCriarOcorrencia)} noValidate>
          <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-occurrence-card">
            <DropdownFieldSeplag<SicadNovaOcorrenciaForm>
              name="tipo"
              label="Tipo da ocorrência"
              control={control}
              cols="12 12 4"
              required
              options={sicadOccurrenceTypeOptions}
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione"
              getFormErrorMessage={getFormErrorMessage}
              showClear={false}
            />
            <DropdownFieldSeplag<SicadNovaOcorrenciaForm>
              name="ambiente"
              label="Ambiente"
              control={control}
              cols="12 12 4"
              required
              options={sicadEnvironmentOptions}
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione"
              getFormErrorMessage={getFormErrorMessage}
              showClear={false}
            />
            <div className="prototype-sicad-priority-field col-12 md:col-12 lg:col-4">
              <RadioButtonFieldSeplag<SicadNovaOcorrenciaForm>
                name="prioridade"
                label="Prioridade sugerida"
                control={control}
                cols="12"
                required
                options={sicadPriorityOptions}
                getFormErrorMessage={getFormErrorMessage}
              />
            </div>

            <TextFieldSeplag<SicadNovaOcorrenciaForm>
              name="titulo"
              label="Título"
              control={control}
              cols="12"
              required
              placeholder="Informe um título resumido para a ocorrência"
              rules={{ required: requiredFieldMessage }}
            />

            <DropdownFieldSeplag<SicadNovaOcorrenciaForm>
              name="orgao"
              label="Órgão"
              control={control}
              cols="12 12 4"
              options={sicadOrgaoOptions}
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione o órgão"
              getFormErrorMessage={getFormErrorMessage}
            />
            <TextFieldSeplag<SicadNovaOcorrenciaForm>
              name="usuarioAfetado"
              label="Usuário afetado"
              control={control}
              cols="12 12 4"
              placeholder="Nome do usuário afetado"
            />
            <TextFieldSeplag<SicadNovaOcorrenciaForm>
              name="cpf"
              label="CPF"
              control={control}
              cols="12 12 4"
              maxLength={14}
              placeholder="000.000.000-00"
            />

            <TextFieldSeplag<SicadNovaOcorrenciaForm>
              name="matricula"
              label="Matrícula"
              control={control}
              cols="12 12 4"
              placeholder="Informe a matrícula"
            />
            <TextFieldSeplag<SicadNovaOcorrenciaForm>
              name="numeroSolicitacaoPrestacao"
              label="Número da solicitação/prestação"
              control={control}
              cols="12 12 8"
              placeholder="Informe o número da solicitação ou prestação (opcional)"
            />

            <TextAreaFieldSeplag<SicadNovaOcorrenciaForm>
              name="descricao"
              label="Descrição do problema"
              control={control}
              cols="12"
              rows={4}
              required
              maxLength={4000}
              placeholder="Descreva detalhadamente o problema encontrado"
              rules={{ required: requiredFieldMessage }}
            />
            <TextAreaFieldSeplag<SicadNovaOcorrenciaForm>
              name="mensagemErro"
              label="Mensagem de erro (se aplicável)"
              control={control}
              cols="12"
              rows={3}
              maxLength={2000}
              placeholder="Cole aqui a mensagem de erro exibida pelo sistema"
            />

            <AnexarDocumentoSeplag
              label="Anexos"
              cols="12"
              multiple
              arquivosBase64={anexos}
              onUploadDocument={handleUploadAnexos}
              onRemoveArquivo={(_, index) => {
                setAnexos((current) => current.filter((__, fileIndex) => fileIndex !== index));
              }}
              handleViewArquivo={() => {}}
              canView={false}
              accept=".pdf,.png,.jpg,.jpeg,.gif,.xls,.xlsx,.doc,.docx,.txt,.zip"
              maxFileSize={20 * 1024 * 1024}
              helpText="Tamanho máximo por arquivo: 20MB | Formatos permitidos: .pdf, .png, .jpg, .jpeg, .gif, .xls, .xlsx, .doc, .docx, .txt, .zip"
              className="prototype-sicad-upload"
            />

            <div className="prototype-sicad-form-actions col-12">
              <BotaoVoltarSeplag
                label="Cancelar"
                icon="pi pi-times"
                onClick={() => navigate(SICAD_BASE_PATH)}
              />
              <BotaoSalvarSeplag
                type="submit"
                label="Criar Ocorrência"
              />
            </div>
          </CardSeplag>
        </form>
      </main>
    </SicadShell>
  );
}

function splitSicadSlashValue(value: string) {
  const [prefix, suffix] = value.split("/");

  return { prefix: `${prefix}/`, suffix: suffix ?? "" };
}

function splitSicadDateTime(value: string) {
  const [date, time] = value.split(" ");

  return { date, time: time ?? "" };
}

function renderSicadOccurrenceNumber(value: string) {
  const { prefix, suffix } = splitSicadSlashValue(value);

  return (
    <span className="prototype-sicad-table-break-cell prototype-sicad-table-number-cell">
      <span>{prefix}</span>
      <span>{suffix}</span>
    </span>
  );
}

function renderSicadOccurrenceDate(value: string) {
  const { date, time } = splitSicadDateTime(value);

  return (
    <span className="prototype-sicad-table-break-cell prototype-sicad-table-date-cell">
      <span>{date}</span>
      <span>{time}</span>
    </span>
  );
}

function renderSicadOccurrenceType(value: string) {
  if (value === "Inconsistência cadastral") {
    return (
      <span className="prototype-sicad-table-break-cell prototype-sicad-table-type-cell">
        <span>Inconsistência</span>
        <span>cadastral</span>
      </span>
    );
  }

  return <span className="prototype-sicad-table-nowrap-cell">{value}</span>;
}
function getSicadPriorityTone(prioridade: string) {
  const toneByPriority: Record<string, string> = {
    Baixa: "green",
    Média: "orange",
    Alta: "red",
    Crítica: "purple",
  };

  return toneByPriority[prioridade] ?? "gray";
}

function getSicadStatusTone(status: SicadOcorrenciaStatus) {
  const toneByStatus: Record<SicadOcorrenciaStatus, string> = {
    Novo: "gray",
    "Em análise": "blue",
    "Aguardando Informações": "orange",
    "Em desenvolvimento": "purple",
    "Em validação": "teal",
    Concluída: "green",
  };

  return toneByStatus[status];
}

function getSicadFilaStatusTone(status: SicadFilaOcorrenciaStatus) {
  const toneByStatus: Record<SicadFilaOcorrenciaStatus, string> = {
    Novo: "teal",
    "Em Análise": "blue",
    "Aguardando Informações": "orange",
    "Em Desenvolvimento": "purple",
    "Em Validação": "teal",
    Concluído: "green",
    Cancelado: "gray",
  };

  return toneByStatus[status];
}

function renderSicadFilaStatus(status: SicadFilaOcorrenciaStatus) {
  const isMultiline =
    status === "Aguardando Informações" || status === "Em Desenvolvimento";

  return (
    <SicadTableBadge tone={getSicadFilaStatusTone(status)} multiline={isMultiline}>
      {isMultiline ? (
        <>
          <span>{status === "Aguardando Informações" ? "Aguardando" : "Em"}</span>
          <span>{status === "Aguardando Informações" ? "Informações" : "Desenvolvimento"}</span>
        </>
      ) : (
        status
      )}
    </SicadTableBadge>
  );
}
function SicadTableBadge({
  children,
  tone,
  multiline = false,
}: Readonly<{
  children: ReactNode;
  tone: string;
  multiline?: boolean;
}>) {
  return (
    <span
      className={`prototype-sicad-table-badge prototype-sicad-table-badge--${tone}${
        multiline ? " prototype-sicad-table-badge--multiline" : ""
      }`}
    >
      {children}
    </span>
  );
}
function mapSicadServiceToMinhas(ocorrencia: SicadOcorrenciaService): SicadOcorrenciaMock {
  return {
    id: ocorrencia.id,
    numero: ocorrencia.numero,
    dataAbertura: ocorrencia.dataAbertura,
    tipo: ocorrencia.tipo,
    titulo: ocorrencia.titulo,
    ambiente: ocorrencia.ambiente,
    prioridade: ocorrencia.prioridade,
    status: mapSicadFilaStatusToMinhasStatus(ocorrencia.status as SicadFilaOcorrenciaStatus),
    orgao: ocorrencia.orgao,
    numeroSolicitacaoPrestacao: ocorrencia.numeroSolicitacaoPrestacao,
  };
}

function mapSicadServiceToFila(ocorrencia: SicadOcorrenciaService, index: number): SicadFilaOcorrenciaMock {
  return {
    id: ocorrencia.id,
    ordem: index + 1,
    numero: ocorrencia.numero,
    data: ocorrencia.dataAbertura,
    tipo: ocorrencia.tipo,
    titulo: ocorrencia.titulo,
    ambiente: ocorrencia.ambiente,
    prioridade: ocorrencia.prioridade,
    status: ocorrencia.status as SicadFilaOcorrenciaStatus,
    responsavel: ocorrencia.responsavel,
    orgao: ocorrencia.orgao,
    numeroSolicitacaoPrestacao: ocorrencia.numeroSolicitacaoPrestacao,
  };
}

function mapSicadServiceToDetalhe(ocorrencia: SicadOcorrenciaService): SicadOcorrenciaDetalheMock {
  return {
    id: ocorrencia.id,
    numero: ocorrencia.numero,
    status: ocorrencia.status as SicadFilaOcorrenciaStatus,
    tipo: ocorrencia.tipo,
    ambiente: ocorrencia.ambiente,
    prioridade: ocorrencia.prioridade,
    titulo: ocorrencia.titulo,
    orgao: ocorrencia.orgao,
    usuario: ocorrencia.usuario,
    cpf: ocorrencia.cpf,
    matricula: ocorrencia.matricula,
    numeroSolicitacaoPrestacao: ocorrencia.numeroSolicitacaoPrestacao,
    descricao: ocorrencia.descricao,
    mensagemErro: ocorrencia.mensagemErro,
    anexos: ocorrencia.anexos,
  };
}
export function PrototiposSicadMinhasOcorrenciasPage() {
  const navigate = useNavigate();
  const [filtrosAplicados, setFiltrosAplicados] =
    useState<SicadMinhasOcorrenciasFiltroForm>({
      numero: "",
      titulo: "",
      tipo: "",
      ambiente: "",
      prioridade: "",
      status: "",
      orgao: "",
      numeroSolicitacaoPrestacao: "",
      periodoInicial: "",
      periodoFinal: "",
    });
  const { control, handleSubmit, reset } =
    useForm<SicadMinhasOcorrenciasFiltroForm>({
      defaultValues: filtrosAplicados,
    });

  const getFormErrorMessage = () => null;

  const ocorrenciasFiltradas = useMemo(() => {
    const normalized = (value: string) => value.trim().toLocaleLowerCase("pt-BR");
    const ocorrenciasMock = listarSicadMinhasCentralMock(sicadUsuarioMockado).map(mapSicadServiceToMinhas);

    return ocorrenciasMock.filter((ocorrencia) => {
      const numeroMatch = normalized(ocorrencia.numero).includes(normalized(filtrosAplicados.numero));
      const tituloMatch = normalized(ocorrencia.titulo).includes(normalized(filtrosAplicados.titulo));
      const tipoMatch = !filtrosAplicados.tipo || ocorrencia.tipo === filtrosAplicados.tipo;
      const ambienteMatch = !filtrosAplicados.ambiente || ocorrencia.ambiente === filtrosAplicados.ambiente;
      const prioridadeMatch = !filtrosAplicados.prioridade || ocorrencia.prioridade === filtrosAplicados.prioridade;
      const statusMatch = !filtrosAplicados.status || ocorrencia.status === filtrosAplicados.status;
      const orgaoMatch = !filtrosAplicados.orgao || ocorrencia.orgao === filtrosAplicados.orgao;
      const solicitacaoMatch = normalized(ocorrencia.numeroSolicitacaoPrestacao).includes(
        normalized(filtrosAplicados.numeroSolicitacaoPrestacao),
      );

      return (
        numeroMatch &&
        tituloMatch &&
        tipoMatch &&
        ambienteMatch &&
        prioridadeMatch &&
        statusMatch &&
        orgaoMatch &&
        solicitacaoMatch
      );
    });
  }, [filtrosAplicados]);

  const columns: ColumnMetaSeplag<SicadOcorrenciaMock>[] = [
    {
      field: "numero",
      header: "Nº",
      body: (rowData) => renderSicadOccurrenceNumber(rowData.numero),
    },
    {
      field: "dataAbertura",
      header: "Data abertura",
      body: (rowData) => renderSicadOccurrenceDate(rowData.dataAbertura),
    },
    {
      field: "tipo",
      header: "Tipo",
      body: (rowData) => renderSicadOccurrenceType(rowData.tipo),
    },
    {
      field: "titulo",
      header: "Título",
      body: (rowData) => (
        <div className="prototype-sicad-occurrence-title-cell">
          <strong title={rowData.titulo}>{rowData.titulo}</strong>
          {rowData.status === "Aguardando Informações" ? (
            <span className="prototype-sicad-response-badge">Aguardando sua resposta</span>
          ) : null}
        </div>
      ),
    },
    {
      field: "ambiente",
      header: "Ambiente",
      body: (rowData) => <SicadTableBadge tone="blue">{rowData.ambiente}</SicadTableBadge>,
    },
    {
      field: "prioridade",
      header: "Prioridade",
      body: (rowData) => (
        <SicadTableBadge tone={getSicadPriorityTone(rowData.prioridade)}>
          {rowData.prioridade}
        </SicadTableBadge>
      ),
    },
    {
      field: "status",
      header: "Status",
      body: (rowData) => (
        <SicadTableBadge
          tone={getSicadStatusTone(rowData.status)}
          multiline={rowData.status === "Aguardando Informações"}
        >
          {rowData.status === "Aguardando Informações" ? (
            <>
              <span>Aguardando</span>
              <span>Informações</span>
            </>
          ) : (
            rowData.status
          )}
        </SicadTableBadge>
      ),
    },
    {
      field: "orgao",
      header: "Órgão",
      body: (rowData) => <span className="prototype-sicad-table-nowrap-cell">{rowData.orgao}</span>,
    },
    {
      field: "numeroSolicitacaoPrestacao",
      header: "Nº Solicitação/Prestação",
      body: (rowData) => (
        <span className="prototype-sicad-table-nowrap-cell">
          {rowData.numeroSolicitacaoPrestacao}
        </span>
      ),
    },
  ];

  const handleLimparFiltros = () => {
    const emptyFilters = {
      numero: "",
      titulo: "",
      tipo: "",
      ambiente: "",
      prioridade: "",
      status: "",
      orgao: "",
      numeroSolicitacaoPrestacao: "",
      periodoInicial: "",
      periodoFinal: "",
    };

    reset(emptyFilters);
    setFiltrosAplicados(emptyFilters);
  };

  if (!sicadTemAlgumaPermissao(["acessarMinhasOcorrencias", "visualizarTodasOcorrencias"])) {
    return (
      <SicadAccessDeniedPage
        title="Minhas Ocorrências"
        requiredPermissions={["acessarMinhasOcorrencias", "visualizarTodasOcorrencias"]}
      />
    );
  }

  return (
    <SicadShell>
      <main className="prototype-sicad-page prototype-sicad-list-page">
        <header className="prototype-sicad-list-header">
          <h1>Minhas Ocorrências</h1>
          <nav className="prototype-sicad-breadcrumb" aria-label="Breadcrumb">
            <Link to={SICAD_BASE_PATH}>Página Inicial</Link>
            <i className="pi pi-chevron-right" aria-hidden="true" />
            <Link to={getSicadPath("/ocorrencias/minhas")}>Central de Ocorrências</Link>
            <i className="pi pi-chevron-right" aria-hidden="true" />
            <span>Minhas Ocorrências</span>
          </nav>
        </header>

        <details className="prototype-sicad-filter-accordion">
          <summary>
            <span>Filtros de Pesquisa</span>
            <i className="pi pi-chevron-down" aria-hidden="true" />
          </summary>
          <form onSubmit={handleSubmit(setFiltrosAplicados)} noValidate>
            <CardSeplag
              cols="12"
              cardHeaderClassNames="prototype-sicad-filter-card"
            >
            <TextFieldSeplag<SicadMinhasOcorrenciasFiltroForm>
              name="numero"
              label="Número da ocorrência"
              control={control}
              cols="12 12 3"
              placeholder="Digite o número"
            />
            <TextFieldSeplag<SicadMinhasOcorrenciasFiltroForm>
              name="titulo"
              label="Título"
              control={control}
              cols="12 12 3"
              placeholder="Digite o título"
            />
            <DropdownFieldSeplag<SicadMinhasOcorrenciasFiltroForm>
              name="tipo"
              label="Tipo"
              control={control}
              cols="12 12 3"
              options={sicadOccurrenceTypeOptions}
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione"
              getFormErrorMessage={getFormErrorMessage}
            />
            <DropdownFieldSeplag<SicadMinhasOcorrenciasFiltroForm>
              name="ambiente"
              label="Ambiente"
              control={control}
              cols="12 12 3"
              options={sicadEnvironmentOptions}
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione"
              getFormErrorMessage={getFormErrorMessage}
            />
            <DropdownFieldSeplag<SicadMinhasOcorrenciasFiltroForm>
              name="prioridade"
              label="Prioridade"
              control={control}
              cols="12 12 3"
              options={sicadPriorityOptions}
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione"
              getFormErrorMessage={getFormErrorMessage}
            />
            <DropdownFieldSeplag<SicadMinhasOcorrenciasFiltroForm>
              name="status"
              label="Status"
              control={control}
              cols="12 12 3"
              options={sicadStatusOptions}
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione"
              getFormErrorMessage={getFormErrorMessage}
            />
            <DropdownFieldSeplag<SicadMinhasOcorrenciasFiltroForm>
              name="orgao"
              label="Órgão"
              control={control}
              cols="12 12 3"
              options={sicadOrgaoOptions}
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione"
              getFormErrorMessage={getFormErrorMessage}
            />
            <TextFieldSeplag<SicadMinhasOcorrenciasFiltroForm>
              name="numeroSolicitacaoPrestacao"
              label="Número da solicitação/prestação"
              control={control}
              cols="12 12 3"
              placeholder="Digite o número"
            />
            <TextFieldSeplag<SicadMinhasOcorrenciasFiltroForm>
              name="periodoInicial"
              label="Período inicial"
              control={control}
              cols="12 12 3"
              placeholder="dd/mm/aaaa"
            />
            <TextFieldSeplag<SicadMinhasOcorrenciasFiltroForm>
              name="periodoFinal"
              label="Período final"
              control={control}
              cols="12 12 3"
              placeholder="dd/mm/aaaa"
            />
            <div className="prototype-sicad-filter-actions col-12">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-filter-slash"
                onClick={handleLimparFiltros}
              />
              <BotaoConsultarSeplag type="submit" label="Consultar" />
            </div>
            </CardSeplag>
          </form>
        </details>

        <CardSeplag
          cols="12"
          title="Lista de Ocorrências"
          actions={<span className="prototype-sicad-table-total">Total de registros: {ocorrenciasFiltradas.length}</span>}
          cardHeaderClassNames="prototype-sicad-table-card"
        >
                    <div className="prototype-sicad-list-toolbar col-12">
            <BotaoSeplag
              type="button"
              label="Nova Ocorrência"
              icon="pi pi-plus"
              onClick={() => navigate(getSicadPath("/ocorrencias/nova"))}
              hasPermission={sicadTemPermissao("acessarNovaOcorrencia")}
            />
          </div>
          <div className="prototype-sicad-table-wrapper col-12">
            <TablePaginadoSeplag<SicadOcorrenciaMock>
              data={{
                content: ocorrenciasFiltradas,
                totalRecords: ocorrenciasFiltradas.length,
                pageActual: 0,
                totalPages: 1,
              }}
              rows={8}
              columns={columns}
              hasEventoAcao
              lazy={false}
              paginator={false}
              selectionMode={null}
              handleOnPageChange={() => {}}
              handleView={(rowData) => navigate(`/ocorrencias/${rowData.id}`)}
            />
            <div className="prototype-sicad-table-footer">
              Mostrando {ocorrenciasFiltradas.length ? 1 : 0} até {ocorrenciasFiltradas.length} de {ocorrenciasFiltradas.length} registros
            </div>
          </div>
        </CardSeplag>
      </main>
    </SicadShell>
  );
}

export function PrototiposSicadFilaOcorrenciasPage() {
  const navigate = useNavigate();
  const [fila, setFila] = useState<SicadFilaOcorrenciaMock[]>(() => listarSicadFilaCentralMock().map(mapSicadServiceToFila));
  const [filtrosAplicados, setFiltrosAplicados] =
    useState<SicadFilaOcorrenciasFiltroForm>({
      status: "",
      tipo: "",
      ambiente: "",
      prioridade: "",
      orgao: "",
      responsavel: "",
      numeroSolicitacaoPrestacao: "",
      data: "",
    });
  const { control, handleSubmit, reset } =
    useForm<SicadFilaOcorrenciasFiltroForm>({
      defaultValues: filtrosAplicados,
    });

  const getFormErrorMessage = () => null;

  const filaFiltrada = useMemo(() => {
    const normalized = (value: string) => value.trim().toLocaleLowerCase("pt-BR");

    return fila.filter((ocorrencia) => {
      const statusMatch = !filtrosAplicados.status || ocorrencia.status === filtrosAplicados.status;
      const tipoMatch = !filtrosAplicados.tipo || ocorrencia.tipo === filtrosAplicados.tipo;
      const ambienteMatch = !filtrosAplicados.ambiente || ocorrencia.ambiente === filtrosAplicados.ambiente;
      const prioridadeMatch = !filtrosAplicados.prioridade || ocorrencia.prioridade === filtrosAplicados.prioridade;
      const orgaoMatch = !filtrosAplicados.orgao || ocorrencia.orgao === filtrosAplicados.orgao;
      const responsavelMatch = !filtrosAplicados.responsavel || ocorrencia.responsavel === filtrosAplicados.responsavel;
      const solicitacaoMatch = normalized(ocorrencia.numeroSolicitacaoPrestacao).includes(
        normalized(filtrosAplicados.numeroSolicitacaoPrestacao),
      );
      const dataMatch = normalized(ocorrencia.data).includes(normalized(filtrosAplicados.data));

      return (
        statusMatch &&
        tipoMatch &&
        ambienteMatch &&
        prioridadeMatch &&
        orgaoMatch &&
        responsavelMatch &&
        solicitacaoMatch &&
        dataMatch
      );
    });
  }, [fila, filtrosAplicados]);

  const reorderFila = (id: string, direction: "up" | "down") => {
    setFila(reordenarSicadFilaMock(id, direction).map(mapSicadServiceToFila));
  };

  const handleAssumir = (id: string) => {
    assumirSicadOcorrenciaMock(id, sicadUsuarioMockado);
    setFila(listarSicadFilaCentralMock().map(mapSicadServiceToFila));
  };

  const handleLimparFiltros = () => {
    const emptyFilters = {
      status: "",
      tipo: "",
      ambiente: "",
      prioridade: "",
      orgao: "",
      responsavel: "",
      numeroSolicitacaoPrestacao: "",
      data: "",
    };

    reset(emptyFilters);
    setFiltrosAplicados(emptyFilters);
  };

  const columns: ColumnMetaSeplag<SicadFilaOcorrenciaMock>[] = [
    {
      field: "ordem",
      header: "Ordem",
      body: (rowData) => (
        <div className="prototype-sicad-queue-order-cell">
          <strong>{String(rowData.ordem).padStart(2, "0")}</strong>
          <span>
            <BotaoIconSeplag
              icon="pi pi-angle-up"
              tooltip="Subir"
              onClick={() => reorderFila(rowData.id, "up")}
              disabled={rowData.ordem === 1}
            />
            <BotaoIconSeplag
              icon="pi pi-angle-down"
              tooltip="Descer"
              onClick={() => reorderFila(rowData.id, "down")}
              disabled={rowData.ordem === fila.length}
            />
          </span>
        </div>
      ),
    },
    {
      field: "numero",
      header: "Nº",
      body: (rowData) => renderSicadOccurrenceNumber(rowData.numero),
    },
    {
      field: "data",
      header: "Data",
      body: (rowData) => renderSicadOccurrenceDate(rowData.data),
    },
    {
      field: "tipo",
      header: "Tipo",
      body: (rowData) => renderSicadOccurrenceType(rowData.tipo),
    },
    {
      field: "titulo",
      header: "Título",
      body: (rowData) => (
        <div className="prototype-sicad-occurrence-title-cell">
          <strong title={rowData.titulo}>{rowData.titulo}</strong>
        </div>
      ),
    },
    {
      field: "ambiente",
      header: "Ambiente",
      body: (rowData) => <SicadTableBadge tone="blue">{rowData.ambiente}</SicadTableBadge>,
    },
    {
      field: "prioridade",
      header: "Prioridade",
      body: (rowData) => (
        <SicadTableBadge tone={getSicadPriorityTone(rowData.prioridade)}>
          {rowData.prioridade}
        </SicadTableBadge>
      ),
    },
    {
      field: "status",
      header: "Status",
      body: (rowData) => renderSicadFilaStatus(rowData.status),
    },
    {
      field: "responsavel",
      header: "Responsável",
      body: (rowData) => (
        <span className="prototype-sicad-table-nowrap-cell">
          {rowData.responsavel || "-"}
        </span>
      ),
    },
    {
      field: "orgao",
      header: "Órgão",
      body: (rowData) => <span className="prototype-sicad-table-nowrap-cell">{rowData.orgao}</span>,
    },
  ];

  if (!sicadTemPermissao("acessarFilaOcorrencias")) {
    return (
      <SicadAccessDeniedPage
        title="Fila de Ocorrências"
        requiredPermissions={["acessarFilaOcorrencias"]}
      />
    );
  }

  return (
    <SicadShell>
      <main className="prototype-sicad-page prototype-sicad-list-page prototype-sicad-queue-page">
        <header className="prototype-sicad-list-header">
          <h1>Fila de Ocorrências</h1>
          <p>Lista de ocorrências pendentes de atendimento. Reorganize a prioridade da fila conforme necessário.</p>
        </header>

        <details className="prototype-sicad-filter-accordion">
          <summary>
            <span>Filtros</span>
            <i className="pi pi-chevron-down" aria-hidden="true" />
          </summary>
          <form onSubmit={handleSubmit(setFiltrosAplicados)} noValidate>
            <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-filter-card">
              <DropdownFieldSeplag<SicadFilaOcorrenciasFiltroForm>
                name="status"
                label="Status"
                control={control}
                cols="12 12 3"
                options={sicadFilaStatusOptions}
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione"
                getFormErrorMessage={getFormErrorMessage}
              />
              <DropdownFieldSeplag<SicadFilaOcorrenciasFiltroForm>
                name="tipo"
                label="Tipo"
                control={control}
                cols="12 12 3"
                options={sicadOccurrenceTypeOptions}
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione"
                getFormErrorMessage={getFormErrorMessage}
              />
              <DropdownFieldSeplag<SicadFilaOcorrenciasFiltroForm>
                name="ambiente"
                label="Ambiente"
                control={control}
                cols="12 12 3"
                options={sicadEnvironmentOptions}
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione"
                getFormErrorMessage={getFormErrorMessage}
              />
              <DropdownFieldSeplag<SicadFilaOcorrenciasFiltroForm>
                name="prioridade"
                label="Prioridade"
                control={control}
                cols="12 12 3"
                options={sicadPriorityOptions}
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione"
                getFormErrorMessage={getFormErrorMessage}
              />
              <DropdownFieldSeplag<SicadFilaOcorrenciasFiltroForm>
                name="orgao"
                label="Órgão"
                control={control}
                cols="12 12 3"
                options={sicadOrgaoOptions}
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione"
                getFormErrorMessage={getFormErrorMessage}
              />
              <DropdownFieldSeplag<SicadFilaOcorrenciasFiltroForm>
                name="responsavel"
                label="Responsável"
                control={control}
                cols="12 12 3"
                options={sicadResponsavelOptions}
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione"
                getFormErrorMessage={getFormErrorMessage}
              />
              <TextFieldSeplag<SicadFilaOcorrenciasFiltroForm>
                name="numeroSolicitacaoPrestacao"
                label="Número da solicitação/prestação"
                control={control}
                cols="12 12 3"
                placeholder="Digite o número"
              />
              <TextFieldSeplag<SicadFilaOcorrenciasFiltroForm>
                name="data"
                label="Data"
                control={control}
                cols="12 12 3"
                placeholder="dd/mm/aaaa"
              />
              <div className="prototype-sicad-filter-actions col-12">
                <BotaoLimparFiltroSeplag
                  type="button"
                  label="Limpar filtros"
                  icon="pi pi-trash"
                  onClick={handleLimparFiltros}
                />
                <BotaoConsultarSeplag type="submit" label="Consultar" />
              </div>
            </CardSeplag>
          </form>
        </details>

        <CardSeplag
          cols="12"
          title="Ocorrências na fila"
          actions={<span className="prototype-sicad-table-total">Total de registros: {filaFiltrada.length}</span>}
          cardHeaderClassNames="prototype-sicad-table-card"
        >
          <div className="prototype-sicad-table-wrapper prototype-sicad-queue-table-wrapper col-12">
            <TablePaginadoSeplag<SicadFilaOcorrenciaMock>
              data={{
                content: filaFiltrada,
                totalRecords: filaFiltrada.length,
                pageActual: 0,
                totalPages: 1,
              }}
              rows={8}
              columns={columns}
              hasEventoAcao
              lazy={false}
              paginator={false}
              selectionMode={null}
              handleOnPageChange={() => {}}
              handleView={(rowData) => navigate(`/ocorrencias/${rowData.id}`)}
              renderBotoes={(rowData) => (
                <BotaoIconSeplag
                  icon="pi pi-user"
                  tooltip="Assumir"
                  onClick={() => handleAssumir(rowData.id)}
                  disabled={Boolean(rowData.responsavel)}
                />
              )}
            />
            <div className="prototype-sicad-table-footer">
              Mostrando {filaFiltrada.length ? 1 : 0} até {filaFiltrada.length} de {filaFiltrada.length} registros
            </div>
          </div>
        </CardSeplag>
      </main>
    </SicadShell>
  );
}

export function PrototiposSicadOcorrenciaDetalhePage() {
  const navigate = useNavigate();
  const { id = sicadDetalheOcorrenciaMock.id } = useParams();
  const detalheInicial = useMemo(() => buscarSicadOcorrenciaPorIdMock(id), [id]);
  const [ocorrencia, setOcorrencia] = useState<SicadOcorrenciaDetalheMock>(
    () => mapSicadServiceToDetalhe(detalheInicial),
  );
  const [historico, setHistorico] = useState<SicadOcorrenciaHistoricoMock[]>(
    () => detalheInicial.historico,
  );
  const [comentarios, setComentarios] = useState<SicadOcorrenciaComentarioMock[]>(
    () => detalheInicial.comentarios,
  );
  const [novoComentario, setNovoComentario] = useState("");
  const [modalSolicitarInformacoesAberto, setModalSolicitarInformacoesAberto] = useState(false);
  const [informacoesSolicitadas, setInformacoesSolicitadas] = useState("");
  const [respostaSuporte, setRespostaSuporte] = useState("");
  const [anexosResposta, setAnexosResposta] = useState<ArquivoAnexadoSeplag[]>([]);
  const [modalRedmineAberto, setModalRedmineAberto] = useState(false);
  const [tipoModeloRedmine, setTipoModeloRedmine] = useState<SicadModeloRedmineTipo>("Desenvolvimento");
  const [textoModeloRedmine, setTextoModeloRedmine] = useState("");
  const [numeroRedmineModal, setNumeroRedmineModal] = useState("");

  const { control, getValues, setValue } = useForm<SicadAnaliseTecnicaForm>({
    defaultValues: {
      causaProvavel: "Falha na integração com módulo interno",
      observacoesTecnicas:
        "Ao consultar os logs, identificamos timeout na conexão com o serviço de relatórios. Verificar configuração do endpoint.",
      responsavel: "João Silva",
      numeroRedmine: "REDMINE-98765",
      status: ocorrencia.status,
      prioridade: ocorrencia.prioridade,
    },
  });

  const requiredPermissions: SicadPermissaoOcorrencia[] = [
    "visualizarOcorrenciasAbertas",
    "visualizarTodasOcorrencias",
    "visualizarOcorrenciasValidacao",
  ];

  if (!sicadTemAlgumaPermissao(requiredPermissions)) {
    return (
      <SicadAccessDeniedPage
        title="Detalhe da Ocorrência"
        requiredPermissions={requiredPermissions}
      />
    );
  }

  const formatNow = () =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

  const sincronizarOcorrenciaService = (nextOcorrencia: SicadOcorrenciaService) => {
    setOcorrencia(mapSicadServiceToDetalhe(nextOcorrencia));
    setHistorico(nextOcorrencia.historico);
    setComentarios(nextOcorrencia.comentarios);
    setValue("status", nextOcorrencia.status as SicadFilaOcorrenciaStatus);
    setValue("prioridade", nextOcorrencia.prioridade);
    setValue("responsavel", nextOcorrencia.responsavel || sicadUsuarioMockado.nome);
    setValue("numeroRedmine", nextOcorrencia.numeroRedmine);
  };

  const addHistorico = (acao: string, observacao: string) => {
    sincronizarOcorrenciaService(registrarHistoricoSicadOcorrenciaMock(ocorrencia.id, sicadUsuarioMockado, acao, observacao));
  };

  const alterarStatus = (status: SicadFilaOcorrenciaStatus, observacao: string) => {
    sincronizarOcorrenciaService(alterarStatusSicadOcorrenciaMock(ocorrencia.id, status, sicadUsuarioMockado, observacao));
  };

  const handleEnviarComentario = () => {
    const texto = novoComentario.trim();

    if (!texto) return;

    setNovoComentario("");
    sincronizarOcorrenciaService(adicionarComentarioSicadOcorrenciaMock(ocorrencia.id, sicadUsuarioMockado, texto));
  };

  const handleSolicitarInformacoes = () => {
    const texto = informacoesSolicitadas.trim();

    if (!texto) return;

    setInformacoesSolicitadas("");
    setModalSolicitarInformacoesAberto(false);
    sincronizarOcorrenciaService(solicitarInformacoesSicadOcorrenciaMock(ocorrencia.id, sicadUsuarioMockado, texto));
  };

  const handleUploadAnexosResposta = (event: { arquivos: ArquivoAnexadoSeplag[] }) => {
    setAnexosResposta((current) => [...current, ...(event.arquivos ?? [])]);
  };

  const handleResponderInformacoes = () => {
    const texto = respostaSuporte.trim();

    if (!texto) return;

    const anexosConvertidos: SicadOcorrenciaAnexoMock[] = anexosResposta.map((anexo) => ({
      nome: anexo.nome,
      tamanho: String(anexo.tamanho ?? "-"),
      dataHora: formatNow(),
    }));

    setRespostaSuporte("");
    setAnexosResposta([]);
    sincronizarOcorrenciaService(responderInformacoesSicadOcorrenciaMock(ocorrencia.id, sicadUsuarioMockado, texto, anexosConvertidos));
  };

  const handleAssumir = () => {
    sincronizarOcorrenciaService(assumirSicadOcorrenciaMock(ocorrencia.id, sicadUsuarioMockado));
  };

  const handleAlterarStatus = () => {
    alterarStatus(getValues("status"), "Status atualizado manualmente pela análise técnica.");
  };

  const gerarTextoModeloRedmine = (tipoModelo: SicadModeloRedmineTipo) => {
    const evidencias = ocorrencia.anexos.length
      ? ocorrencia.anexos.map((anexo) => `- ${anexo.nome} (${anexo.tamanho})`).join("\n")
      : "- Sem evidências anexadas.";
    const analiseTecnica = getValues("observacoesTecnicas") || "Análise técnica pendente.";

    if (tipoModelo === "Banco de Dados") {
      return [
        `Título: ${ocorrencia.titulo}`,
        `Ambiente: ${ocorrencia.ambiente}`,
        `Órgão: ${ocorrencia.orgao}`,
        `Usuário: ${ocorrencia.usuario}`,
        `CPF: ${ocorrencia.cpf}`,
        `Matrícula: ${ocorrencia.matricula}`,
        `Nº Solicitação/Prestação: ${ocorrencia.numeroSolicitacaoPrestacao}`,
        "",
        "Problema:",
        ocorrencia.descricao,
        "",
        "Mensagem de erro:",
        ocorrencia.mensagemErro || "Não informado.",
        "",
        "Ajuste solicitado:",
        analiseTecnica,
        "",
        "Evidências:",
        evidencias,
      ].join("\n");
    }

    return [
      `Título: ${ocorrencia.titulo}`,
      `Tipo: ${ocorrencia.tipo}`,
      `Prioridade: ${ocorrencia.prioridade}`,
      `Ambiente: ${ocorrencia.ambiente}`,
      `Órgão: ${ocorrencia.orgao}`,
      `Usuário: ${ocorrencia.usuario}`,
      `CPF: ${ocorrencia.cpf}`,
      `Matrícula: ${ocorrencia.matricula}`,
      `Nº Solicitação/Prestação: ${ocorrencia.numeroSolicitacaoPrestacao}`,
      "",
      "Descrição:",
      ocorrencia.descricao,
      "",
      "Mensagem de erro:",
      ocorrencia.mensagemErro || "Não informado.",
      "",
      "Análise Técnica:",
      analiseTecnica,
      "",
      "Evidências:",
      evidencias,
    ].join("\n");
  };

  const handleAlterarTipoModeloRedmine = (tipoModelo: SicadModeloRedmineTipo) => {
    setTipoModeloRedmine(tipoModelo);
    setTextoModeloRedmine(gerarTextoModeloRedmine(tipoModelo));
  };

  const handleGerarModeloRedmine = () => {
    const tipoModelo: SicadModeloRedmineTipo = "Desenvolvimento";

    setTipoModeloRedmine(tipoModelo);
    setTextoModeloRedmine(gerarTextoModeloRedmine(tipoModelo));
    setNumeroRedmineModal(getValues("numeroRedmine"));
    setModalRedmineAberto(true);
  };

  const handleCopiarModeloRedmine = async () => {
    if (!textoModeloRedmine.trim()) return;

    await navigator.clipboard?.writeText(textoModeloRedmine);
    addHistorico("Modelo Redmine copiado", `Modelo ${tipoModeloRedmine} copiado para a área de transferência.`);
  };

  const handleSalvarModeloRedmine = () => {
    const numeroRedmine = numeroRedmineModal.trim();

    if (!numeroRedmine) return;

    setValue("numeroRedmine", numeroRedmine);
    setValue("status", "Em Desenvolvimento");
    setModalRedmineAberto(false);
    sincronizarOcorrenciaService(salvarRedmineSicadOcorrenciaMock(ocorrencia.id, sicadUsuarioMockado, numeroRedmine, tipoModeloRedmine));
  };

  const handleAlterarPrioridade = () => {
    const prioridade = getValues("prioridade");
    atualizarSicadOcorrenciaMock(ocorrencia.id, (current) => ({ ...current, prioridade }));
    sincronizarOcorrenciaService(registrarHistoricoSicadOcorrenciaMock(ocorrencia.id, sicadUsuarioMockado, "Prioridade alterada", "Prioridade atualizada para " + prioridade + "."));
  };

  const handleAlterarResponsavel = () => {
    const responsavel = getValues("responsavel");
    atualizarSicadOcorrenciaMock(ocorrencia.id, (current) => ({ ...current, responsavel }));
    sincronizarOcorrenciaService(registrarHistoricoSicadOcorrenciaMock(ocorrencia.id, sicadUsuarioMockado, "Responsável alterado", "Responsável atualizado para " + responsavel + "."));
  };

  const showTechnicalAnalysis = sicadTemAlgumaPermissao([
    "registrarAnaliseInterna",
    "alterarPrioridade",
    "acessarTudo",
  ]);
  const showSupportAnswer =
    sicadTemPermissao("responderSolicitacaoInformacoes") &&
    ocorrencia.status === "Aguardando Informações";
  const getFormErrorMessage = () => null;

  return (
    <SicadShell>
      <main className="prototype-sicad-page prototype-sicad-detail-page">
        <header className="prototype-sicad-detail-header">
          <div>
            <nav className="prototype-sicad-breadcrumb" aria-label="Caminho da ocorrência">
              <Link to={getSicadPath("/ocorrencias/minhas")}>Ocorrências</Link>
              <i className="pi pi-angle-right" aria-hidden="true" />
              <span>Detalhes da Ocorrência</span>
            </nav>
            <h1>Ocorrência #{ocorrencia.numero}</h1>
          </div>
          <div className="prototype-sicad-detail-top-actions">
            <BotaoVoltarSeplag
              label="Voltar"
              onClick={() => navigate(getSicadPath("/ocorrencias/minhas"))}
            />
            <BotaoSeplag
              type="button"
              label="Imprimir"
              icon="pi pi-print"
              variant="back"
              onClick={() => addHistorico("Impressão solicitada", "Usuário acionou a impressão da ocorrência.")}
            />
          </div>
        </header>

        <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-detail-card prototype-sicad-detail-general-card">
          <section className="prototype-sicad-detail-card-content">
            <h2><i className="pi pi-file-edit" /> Dados Gerais</h2>
            <div className="prototype-sicad-detail-general-grid">
              <div><span>Número</span><strong>{ocorrencia.numero}</strong></div>
              <div><span>Status</span>{renderSicadFilaStatus(ocorrencia.status)}</div>
              <div><span>Usuário</span><strong>{ocorrencia.usuario}</strong></div>
              <div><span>Tipo</span><SicadTableBadge tone="purple">{ocorrencia.tipo}</SicadTableBadge></div>
              <div><span>Ambiente</span><SicadTableBadge tone="blue">{ocorrencia.ambiente}</SicadTableBadge></div>
              <div><span>CPF</span><strong>{ocorrencia.cpf}</strong></div>
              <div><span>Prioridade</span><SicadTableBadge tone={getSicadPriorityTone(ocorrencia.prioridade)}>{ocorrencia.prioridade}</SicadTableBadge></div>
              <div><span>Matrícula</span><strong>{ocorrencia.matricula}</strong></div>
              <div><span>Título</span><strong>{ocorrencia.titulo}</strong></div>
              <div><span>Nº Solicitação/Prestação</span><strong>{ocorrencia.numeroSolicitacaoPrestacao}</strong></div>
              <div className="prototype-sicad-detail-wide"><span>Órgão</span><strong>{ocorrencia.orgao}</strong></div>
            </div>
          </section>
        </CardSeplag>

        <section className="prototype-sicad-detail-summary-grid">
          <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-detail-card">
            <section className="prototype-sicad-detail-card-content">
              <h2><i className="pi pi-clipboard" /> Descrição</h2>
              <p>{ocorrencia.descricao}</p>
            </section>
          </CardSeplag>
          <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-detail-card">
            <section className="prototype-sicad-detail-card-content">
              <h2><i className="pi pi-exclamation-triangle" /> Mensagem de erro</h2>
              <p>{ocorrencia.mensagemErro}</p>
            </section>
          </CardSeplag>
          <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-detail-card">
            <section className="prototype-sicad-detail-card-content">
              <h2><i className="pi pi-paperclip" /> Arquivos anexados ({ocorrencia.anexos.length})</h2>
              <ul className="prototype-sicad-attachment-list">
                {ocorrencia.anexos.map((anexo) => (
                  <li key={anexo.nome}>
                    <span>{anexo.nome}</span>
                    <small>{anexo.tamanho}</small>
                    <small>{anexo.dataHora}</small>
                    <button type="button" aria-label={`Baixar ${anexo.nome}`}>
                      <i className="pi pi-download" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </CardSeplag>
        </section>

        <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-detail-card">
          <section className="prototype-sicad-detail-card-content">
            <h2><i className="pi pi-history" /> Histórico</h2>
            <div className="prototype-sicad-history-table-wrapper">
              <table className="prototype-sicad-history-table">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Usuário</th>
                    <th>Ação realizada</th>
                    <th>Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((item) => (
                    <tr key={item.id}>
                      <td>{item.dataHora}</td>
                      <td>{item.usuario}</td>
                      <td>{item.acao}</td>
                      <td>{item.observacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </CardSeplag>

        <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-detail-card prototype-sicad-actions-card">
          <section className="prototype-sicad-detail-card-content">
            <h2><i className="pi pi-bolt" /> Ações da Ocorrência</h2>
            <div className="prototype-sicad-detail-actions">
              <BotaoSeplag type="button" label="Complementar Informações" icon="pi pi-paperclip" variant="back" onClick={() => addHistorico("Informações complementadas", "Usuário complementou as informações solicitadas.")} hasPermission={sicadTemPermissao("responderSolicitacaoInformacoes") && ocorrencia.status === "Aguardando Informações"} />
              <BotaoSeplag type="button" label="Assumir" icon="pi pi-user" variant="back" onClick={handleAssumir} hasPermission={sicadTemPermissao("assumirOcorrencia")} />
              <BotaoSeplag type="button" label="Solicitar Informações" icon="pi pi-question-circle" variant="back" onClick={() => setModalSolicitarInformacoesAberto(true)} hasPermission={sicadUsuarioMockado.perfil === "ANALISTA" && sicadTemPermissao("solicitarInformacoesSuporte")} />
              <BotaoSeplag type="button" label="Alterar Status" icon="pi pi-sync" variant="back" onClick={handleAlterarStatus} hasPermission={sicadTemPermissao("alterarStatus")} />
              <BotaoSeplag type="button" label="Gerar Modelo Redmine" icon="pi pi-file" variant="back" onClick={handleGerarModeloRedmine} hasPermission={sicadTemPermissao("gerarModeloRedmine")} />
              <BotaoSeplag type="button" label="Enviar para Validação" icon="pi pi-shield" variant="back" onClick={() => alterarStatus("Em Validação", "Ocorrência enviada para validação da solução.")} hasPermission={sicadTemPermissao("alterarStatus")} />
              <BotaoSeplag type="button" label="Concluir" icon="pi pi-check" severity="success" onClick={() => alterarStatus("Concluído", "Ocorrência concluída tecnicamente.")} hasPermission={sicadTemPermissao("concluirTecnicamente")} />
              <BotaoSeplag type="button" label="Alterar Prioridade" icon="pi pi-sort-amount-up" variant="back" onClick={handleAlterarPrioridade} hasPermission={sicadTemPermissao("alterarPrioridade")} />
              <BotaoSeplag type="button" label="Alterar Responsável" icon="pi pi-user-edit" variant="back" onClick={handleAlterarResponsavel} hasPermission={sicadTemPermissao("alterarResponsavel")} />
              <BotaoSeplag type="button" label="Aprovar Correção" icon="pi pi-check-circle" severity="success" onClick={() => alterarStatus("Concluído", "Correção aprovada pelo homologador.")} hasPermission={sicadTemPermissao("aprovarSolucao")} />
              <BotaoSeplag type="button" label="Reprovar Correção" icon="pi pi-times-circle" severity="danger" onClick={() => alterarStatus("Em Desenvolvimento", "Correção reprovada pelo homologador.")} hasPermission={sicadTemPermissao("reprovarSolucao")} />
            </div>
          </section>
        </CardSeplag>

        {showSupportAnswer ? (
          <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-detail-card prototype-sicad-support-answer-card">
            <section className="prototype-sicad-detail-card-content">
              <h2><i className="pi pi-reply" /> Responder Solicitação de Informações</h2>
              <label className="prototype-sicad-comment-editor">
                <span>Resposta</span>
                <textarea
                  value={respostaSuporte}
                  onChange={(event) => setRespostaSuporte(event.target.value)}
                  placeholder="Informe os dados solicitados pelo analista..."
                  maxLength={2000}
                />
                <small>{respostaSuporte.length}/2000</small>
              </label>
              <AnexarDocumentoSeplag
                label="Anexar novos arquivos"
                cols="12"
                multiple
                arquivosBase64={anexosResposta}
                onUploadDocument={handleUploadAnexosResposta}
                onRemoveArquivo={(_, index) => {
                  setAnexosResposta((current) => current.filter((__, fileIndex) => fileIndex !== index));
                }}
                handleViewArquivo={() => {}}
                canView={false}
                accept=".pdf,.png,.jpg,.jpeg,.gif,.xls,.xlsx,.doc,.docx,.txt,.zip"
                maxFileSize={20 * 1024 * 1024}
                helpText="Tamanho máximo por arquivo: 20MB"
                className="prototype-sicad-upload prototype-sicad-support-upload"
              />
              <div className="prototype-sicad-comment-actions">
                <BotaoSalvarSeplag
                  type="button"
                  label="Enviar Resposta"
                  icon="pi pi-send"
                  onClick={handleResponderInformacoes}
                />
              </div>
            </section>
          </CardSeplag>
        ) : null}

        <section className="prototype-sicad-detail-bottom-grid">
          <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-detail-card prototype-sicad-comments-card">
            <section className="prototype-sicad-detail-card-content">
              <h2><i className="pi pi-comments" /> Comentários</h2>
              <div className="prototype-sicad-comments-list">
                {comentarios.map((comentario) => (
                  <article key={comentario.id} className="prototype-sicad-comment-item">
                    <div className="prototype-sicad-comment-avatar" aria-hidden="true">
                      {comentario.usuario.charAt(0)}
                    </div>
                    <div>
                      <header>
                        <strong>{comentario.usuario} ({comentario.perfil})</strong>
                        <span>{comentario.dataHora}</span>
                      </header>
                      <p>{comentario.texto}</p>
                    </div>
                  </article>
                ))}
              </div>
              <label className="prototype-sicad-comment-editor">
                <span>Novo comentário</span>
                <textarea
                  value={novoComentario}
                  onChange={(event) => setNovoComentario(event.target.value)}
                  placeholder="Digite seu comentário..."
                  maxLength={1000}
                />
                <small>{novoComentario.length}/1000</small>
              </label>
              <div className="prototype-sicad-comment-actions">
                <BotaoSalvarSeplag
                  type="button"
                  label="Enviar"
                  icon="pi pi-send"
                  onClick={handleEnviarComentario}
                  hasPermission={sicadTemPermissao("comentarOcorrencia") || sicadTemPermissao("visualizarOcorrenciasAbertas")}
                />
              </div>
            </section>
          </CardSeplag>

          {showTechnicalAnalysis ? (
            <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-detail-card prototype-sicad-technical-card">
              <section className="prototype-sicad-detail-card-content">
                <header className="prototype-sicad-technical-header">
                  <h2><i className="pi pi-wrench" /> Análise Técnica</h2>
                  <span>Visível apenas para: Analista, Gestão e Administrador</span>
                </header>
                <div className="formgrid grid prototype-sicad-technical-form">
                  <DropdownFieldSeplag<SicadAnaliseTecnicaForm>
                    name="causaProvavel"
                    label="Causa provável"
                    control={control}
                    cols="12"
                    options={sicadCausaProvavelOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={getFormErrorMessage}
                  />
                  <TextAreaFieldSeplag<SicadAnaliseTecnicaForm>
                    name="observacoesTecnicas"
                    label="Observações técnicas"
                    control={control}
                    cols="12"
                    rows={3}
                    maxLength={2000}
                  />
                  <DropdownFieldSeplag<SicadAnaliseTecnicaForm>
                    name="responsavel"
                    label="Responsável"
                    control={control}
                    cols="12 12 6"
                    options={sicadResponsavelOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={getFormErrorMessage}
                  />
                  <TextFieldSeplag<SicadAnaliseTecnicaForm>
                    name="numeroRedmine"
                    label="Número Redmine"
                    control={control}
                    cols="12 12 6"
                    placeholder="Informe o número Redmine"
                  />
                  <DropdownFieldSeplag<SicadAnaliseTecnicaForm>
                    name="status"
                    label="Novo status"
                    control={control}
                    cols="12 12 6"
                    options={sicadFilaStatusOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={getFormErrorMessage}
                  />
                  <DropdownFieldSeplag<SicadAnaliseTecnicaForm>
                    name="prioridade"
                    label="Prioridade"
                    control={control}
                    cols="12 12 6"
                    options={sicadPriorityOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={getFormErrorMessage}
                  />
                </div>
              </section>
            </CardSeplag>
          ) : null}
        </section>

        <ModalSeplag
          titulo="Solicitar Informações"
          visible={modalSolicitarInformacoesAberto}
          fechar={() => setModalSolicitarInformacoesAberto(false)}
          funcAcao={handleSolicitarInformacoes}
          labelFechar="Cancelar"
          labelAcao="Enviar Solicitação"
          iconAcao="pi pi-send"
          tamanho="42rem"
        >
          <label className="prototype-sicad-modal-field col-12">
            <span>Informações solicitadas</span>
            <textarea
              value={informacoesSolicitadas}
              onChange={(event) => setInformacoesSolicitadas(event.target.value)}
              placeholder="Descreva quais informações o suporte precisa complementar..."
              maxLength={2000}
            />
            <small>{informacoesSolicitadas.length}/2000</small>
          </label>
        </ModalSeplag>

        <ModalSeplag
          titulo="Gerar Modelo Redmine"
          visible={modalRedmineAberto}
          fechar={() => setModalRedmineAberto(false)}
          funcAcao={handleSalvarModeloRedmine}
          labelFechar="Cancelar"
          labelAcao="Salvar"
          iconAcao="pi pi-save"
          tamanho="58rem"
        >
          <fieldset className="prototype-sicad-redmine-options col-12">
            <legend>Tipo de modelo</legend>
            <label>
              <input
                type="radio"
                name="tipoModeloRedmine"
                checked={tipoModeloRedmine === "Desenvolvimento"}
                onChange={() => handleAlterarTipoModeloRedmine("Desenvolvimento")}
              />
              <span>Desenvolvimento</span>
            </label>
            <label>
              <input
                type="radio"
                name="tipoModeloRedmine"
                checked={tipoModeloRedmine === "Banco de Dados"}
                onChange={() => handleAlterarTipoModeloRedmine("Banco de Dados")}
              />
              <span>Banco de Dados</span>
            </label>
          </fieldset>

          <label className="prototype-sicad-modal-field prototype-sicad-redmine-text col-12">
            <span>Texto do chamado</span>
            <textarea
              value={textoModeloRedmine}
              onChange={(event) => setTextoModeloRedmine(event.target.value)}
              rows={14}
            />
          </label>

          <div className="prototype-sicad-redmine-copy col-12">
            <BotaoSeplag
              type="button"
              label="Copiar"
              icon="pi pi-copy"
              variant="back"
              onClick={handleCopiarModeloRedmine}
            />
          </div>

          <label className="prototype-sicad-modal-field col-12">
            <span>Número Redmine</span>
            <input
              value={numeroRedmineModal}
              onChange={(event) => setNumeroRedmineModal(event.target.value)}
              placeholder="Ex.: REDMINE-98765"
            />
          </label>
        </ModalSeplag>
      </main>
    </SicadShell>
  );
}

function getSicadDashboardTotal(items: SicadDashboardChartItem[]) {
  return items.reduce((total, item) => total + item.value, 0);
}

function getSicadDashboardPercent(value: number, total: number) {
  if (!total) return 0;

  return Math.round((value / total) * 100);
}

function getSicadDashboardConicGradient(items: SicadDashboardChartItem[]) {
  const total = getSicadDashboardTotal(items);
  let start = 0;

  return items
    .map((item) => {
      const size = total ? (item.value / total) * 100 : 0;
      const end = start + size;
      const segment = `${item.color} ${start}% ${end}%`;
      start = end;

      return segment;
    })
    .join(", ");
}

function SicadDashboardMetricCard({ metric }: Readonly<{ metric: SicadDashboardMetric }>) {
  const trendPositive = metric.trend >= 0;

  return (
    <CardSeplag cols="12" cardHeaderClassNames={`prototype-sicad-dashboard-metric prototype-sicad-dashboard-metric--${metric.tone}`}>
      <article>
        <span className="prototype-sicad-dashboard-metric-icon">
          <i className={metric.icon} />
        </span>
        <div>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
        </div>
      </article>
      <footer className={trendPositive ? "is-positive" : "is-negative"}>
        <i className={`pi ${trendPositive ? "pi-caret-up" : "pi-caret-down"}`} />
        <span>{Math.abs(metric.trend)}% vs. período anterior</span>
      </footer>
    </CardSeplag>
  );
}

function SicadDashboardDonutChart({
  title,
  items,
}: Readonly<{
  title: string;
  items: SicadDashboardChartItem[];
}>) {
  const total = getSicadDashboardTotal(items);
  const gradient = getSicadDashboardConicGradient(items);

  return (
    <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-dashboard-chart-card">
      <header className="prototype-sicad-dashboard-chart-header">
        <h2>{title}</h2>
      </header>
      <div className="prototype-sicad-dashboard-donut-wrap">
        <div
          className="prototype-sicad-dashboard-donut"
          style={{ background: `conic-gradient(${gradient})` }}
          role="img"
          aria-label={`${title}. Total ${total}`}
        >
          <div>
            <span>Total</span>
            <strong>{total}</strong>
          </div>
        </div>
      </div>
      <ul className="prototype-sicad-dashboard-legend">
        {items.map((item) => {
          const percent = getSicadDashboardPercent(item.value, total);

          return (
            <li key={item.label}>
              <span className="prototype-sicad-dashboard-dot" style={{ backgroundColor: item.color }} />
              <strong>{item.label}</strong>
              <span>{item.value}</span>
              <span>{percent}%</span>
            </li>
          );
        })}
      </ul>
    </CardSeplag>
  );
}

function SicadDashboardBarChart({
  title,
  items,
}: Readonly<{
  title: string;
  items: SicadDashboardBarItem[];
}>) {
  const total = getSicadDashboardTotal(items);
  const maxValue = Math.max(...items.map((item) => item.value));

  return (
    <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-dashboard-chart-card prototype-sicad-dashboard-bar-card">
      <header className="prototype-sicad-dashboard-chart-header col-12">
        <h2>{title}</h2>
      </header>
      <div className="prototype-sicad-dashboard-bars col-12">
        {items.map((item) => (
          <div className="prototype-sicad-dashboard-bar-row" key={item.label}>
            <span>{item.label}</span>
            <div>
              <span style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: item.color }} />
            </div>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
      <div className="prototype-sicad-dashboard-total-row col-12">
        <span>Total</span>
        <strong>{total}</strong>
      </div>
    </CardSeplag>
  );
}
export function PrototiposSicadOcorrenciasDashboardPage() {
  if (!sicadTemPermissao("acessarDashboard")) {
    return (
      <SicadAccessDeniedPage
        title="Dashboard"
        requiredPermissions={["acessarDashboard"]}
      />
    );
  }

  return (
    <SicadShell>
      <main className="prototype-sicad-page prototype-sicad-dashboard-page">
        <header className="prototype-sicad-dashboard-header">
          <div>
            <h1>Dashboard de Ocorrências</h1>
            <span className="prototype-sicad-dashboard-title-spacer" aria-hidden="true" />
          </div>
          <div className="prototype-sicad-dashboard-filter" aria-label="Filtro de período">
            <button type="button" aria-label="Selecionar período">
              <i className="pi pi-calendar" />
            </button>
            <select defaultValue="30">
              <option value="30">Últimos 30 dias</option>
              <option value="60">Últimos 60 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>
        </header>

        <section className="prototype-sicad-dashboard-metrics" aria-label="Indicadores de ocorrências">
          {sicadDashboardMetricsMock.map((metric) => (
            <SicadDashboardMetricCard key={metric.id} metric={metric} />
          ))}
        </section>

        <section className="prototype-sicad-dashboard-charts" aria-label="Gráficos de ocorrências">
          <SicadDashboardDonutChart title="Ocorrências por Tipo" items={sicadDashboardTipoMock} />
          <SicadDashboardDonutChart title="Ocorrências por Prioridade" items={sicadDashboardPrioridadeMock} />
          <SicadDashboardDonutChart title="Ocorrências por Status" items={sicadDashboardStatusMock} />
          <SicadDashboardBarChart title="Ocorrências por Órgão" items={sicadDashboardOrgaoMock} />
        </section>
      </main>
    </SicadShell>
  );
}

export function PrototiposSicadOcorrenciasRelatoriosPage() {
  const emptyFilters: SicadRelatoriosFiltroForm = {
    periodoInicial: "",
    periodoFinal: "",
    tipo: "",
    ambiente: "",
    prioridade: "",
    status: "",
    orgao: "",
    responsavel: "",
    usuario: "",
    cpf: "",
    numeroSolicitacaoPrestacao: "",
    numeroRedmine: "",
  };

  const { control, handleSubmit, reset } = useForm<SicadRelatoriosFiltroForm>({ defaultValues: emptyFilters });
  const [filtrosAplicados, setFiltrosAplicados] = useState<SicadRelatoriosFiltroForm>(emptyFilters);
  const getFormErrorMessage = () => null;

  const relatoriosFiltrados = useMemo(() => {
    const normalized = (value: string) => value.trim().toLocaleLowerCase("pt-BR");

    return sicadRelatoriosOcorrenciasMock.filter((ocorrencia) => {
      const periodoInicialMatch = normalized(ocorrencia.dataAbertura).includes(normalized(filtrosAplicados.periodoInicial));
      const periodoFinalMatch = !filtrosAplicados.periodoFinal || normalized(ocorrencia.dataConclusao).includes(normalized(filtrosAplicados.periodoFinal));

      return (
        periodoInicialMatch &&
        periodoFinalMatch &&
        (!filtrosAplicados.tipo || ocorrencia.tipo === filtrosAplicados.tipo) &&
        (!filtrosAplicados.ambiente || ocorrencia.ambiente === filtrosAplicados.ambiente) &&
        (!filtrosAplicados.prioridade || ocorrencia.prioridade === filtrosAplicados.prioridade) &&
        (!filtrosAplicados.status || ocorrencia.status === filtrosAplicados.status) &&
        (!filtrosAplicados.orgao || ocorrencia.orgao === filtrosAplicados.orgao) &&
        (!filtrosAplicados.responsavel || ocorrencia.responsavel === filtrosAplicados.responsavel) &&
        normalized(ocorrencia.usuario).includes(normalized(filtrosAplicados.usuario)) &&
        normalized(ocorrencia.cpf).includes(normalized(filtrosAplicados.cpf)) &&
        normalized(ocorrencia.numeroSolicitacaoPrestacao).includes(normalized(filtrosAplicados.numeroSolicitacaoPrestacao)) &&
        normalized(ocorrencia.numeroRedmine).includes(normalized(filtrosAplicados.numeroRedmine))
      );
    });
  }, [filtrosAplicados]);

  const handleLimparFiltros = () => {
    reset(emptyFilters);
    setFiltrosAplicados(emptyFilters);
  };

  const handleExportar = (tipo: "Excel" | "PDF") => {
    window.alert("Exportação " + tipo + " simulada com " + relatoriosFiltrados.length + " registro(s).");
  };

  const columns: ColumnMetaSeplag<SicadRelatorioOcorrenciaMock>[] = [
    { field: "numero", header: "Nº", body: (rowData) => renderSicadOccurrenceNumber(rowData.numero) },
    { field: "dataAbertura", header: "Data abertura", body: (rowData) => renderSicadOccurrenceDate(rowData.dataAbertura) },
    {
      field: "dataConclusao",
      header: "Data conclusão",
      body: (rowData) => rowData.dataConclusao === "-" ? <span className="prototype-sicad-table-nowrap-cell">-</span> : renderSicadOccurrenceDate(rowData.dataConclusao),
    },
    { field: "tipo", header: "Tipo", body: (rowData) => renderSicadOccurrenceType(rowData.tipo) },
    {
      field: "titulo",
      header: "Título",
      body: (rowData) => (
        <div className="prototype-sicad-occurrence-title-cell">
          <strong title={rowData.titulo}>{rowData.titulo}</strong>
        </div>
      ),
    },
    { field: "ambiente", header: "Ambiente", body: (rowData) => <SicadTableBadge tone="blue">{rowData.ambiente}</SicadTableBadge> },
    { field: "prioridade", header: "Prioridade", body: (rowData) => <SicadTableBadge tone={getSicadPriorityTone(rowData.prioridade)}>{rowData.prioridade}</SicadTableBadge> },
    { field: "status", header: "Status", body: (rowData) => renderSicadFilaStatus(rowData.status) },
    { field: "responsavel", header: "Responsável", body: (rowData) => <span className="prototype-sicad-table-nowrap-cell">{rowData.responsavel}</span> },
    { field: "orgao", header: "Órgão", body: (rowData) => <span className="prototype-sicad-table-nowrap-cell">{rowData.orgao}</span> },
    { field: "numeroSolicitacaoPrestacao", header: "Nº Solicitação/Prestação", body: (rowData) => <span className="prototype-sicad-table-nowrap-cell">{rowData.numeroSolicitacaoPrestacao}</span> },
    { field: "numeroRedmine", header: "Nº Redmine", body: (rowData) => <span className="prototype-sicad-table-nowrap-cell">{rowData.numeroRedmine}</span> },
    { field: "tempoAtendimento", header: "Tempo Atendimento", body: (rowData) => <span className="prototype-sicad-table-nowrap-cell">{rowData.tempoAtendimento}</span> },
  ];

  if (!sicadTemPermissao("acessarRelatorios")) {
    return <SicadAccessDeniedPage title="Relatórios de Ocorrências" requiredPermissions={["acessarRelatorios"]} />;
  }

  return (
    <SicadShell>
      <main className="prototype-sicad-page prototype-sicad-list-page prototype-sicad-reports-page">
        <header className="prototype-sicad-list-header">
          <h1>Relatórios de Ocorrências</h1>
        </header>

        <form onSubmit={handleSubmit(setFiltrosAplicados)} noValidate>
          <CardSeplag cols="12" title="Filtros" cardHeaderClassNames="prototype-sicad-filter-card prototype-sicad-reports-filter-card">
            <TextFieldSeplag<SicadRelatoriosFiltroForm> name="periodoInicial" label="Período inicial" control={control} cols="12 12 2" placeholder="dd/mm/aaaa" />
            <TextFieldSeplag<SicadRelatoriosFiltroForm> name="periodoFinal" label="Período final" control={control} cols="12 12 2" placeholder="dd/mm/aaaa" />
            <DropdownFieldSeplag<SicadRelatoriosFiltroForm> name="tipo" label="Tipo" control={control} cols="12 12 2" options={sicadOccurrenceTypeOptions} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={getFormErrorMessage} />
            <DropdownFieldSeplag<SicadRelatoriosFiltroForm> name="ambiente" label="Ambiente" control={control} cols="12 12 2" options={sicadEnvironmentOptions} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={getFormErrorMessage} />
            <DropdownFieldSeplag<SicadRelatoriosFiltroForm> name="prioridade" label="Prioridade" control={control} cols="12 12 2" options={sicadPriorityOptions} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={getFormErrorMessage} />
            <DropdownFieldSeplag<SicadRelatoriosFiltroForm> name="status" label="Status" control={control} cols="12 12 2" options={sicadFilaStatusOptions} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={getFormErrorMessage} />
            <DropdownFieldSeplag<SicadRelatoriosFiltroForm> name="orgao" label="Órgão" control={control} cols="12 12 3" options={sicadOrgaoOptions} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={getFormErrorMessage} />
            <DropdownFieldSeplag<SicadRelatoriosFiltroForm> name="responsavel" label="Responsável" control={control} cols="12 12 3" options={sicadResponsavelOptions} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={getFormErrorMessage} />
            <TextFieldSeplag<SicadRelatoriosFiltroForm> name="usuario" label="Usuário" control={control} cols="12 12 3" placeholder="Digite o nome do usuário" />
            <TextFieldSeplag<SicadRelatoriosFiltroForm> name="cpf" label="CPF" control={control} cols="12 12 3" placeholder="Digite o CPF" />
            <TextFieldSeplag<SicadRelatoriosFiltroForm> name="numeroSolicitacaoPrestacao" label="Nº Solicitação/Prestação" control={control} cols="12 12 3" placeholder="Digite o número" />
            <TextFieldSeplag<SicadRelatoriosFiltroForm> name="numeroRedmine" label="Nº Redmine" control={control} cols="12 12 3" placeholder="Digite o número do Redmine" />
            <div className="prototype-sicad-reports-filter-actions col-12">
              <div>
                <BotaoConsultarSeplag type="submit" label="Consultar" />
                <BotaoLimparFiltroSeplag type="button" label="Limpar" onClick={handleLimparFiltros} />
              </div>
              <div className="prototype-sicad-reports-export-actions">
                <BotaoSeplag type="button" label="Exportar Excel" icon="pi pi-file-excel" style={{ backgroundColor: "#078b43", color: "#ffffff" }} onClick={() => handleExportar("Excel")} />
                <BotaoSeplag type="button" label="Exportar PDF" icon="pi pi-file-pdf" style={{ backgroundColor: "#d81f2a", color: "#ffffff" }} onClick={() => handleExportar("PDF")} />
              </div>
            </div>
          </CardSeplag>
        </form>

        <CardSeplag cols="12" title={"Resultados (" + relatoriosFiltrados.length + ")"} cardHeaderClassNames="prototype-sicad-table-card prototype-sicad-reports-table-card">
          <div className="prototype-sicad-table-wrapper prototype-sicad-reports-table-wrapper col-12">
            <TablePaginadoSeplag<SicadRelatorioOcorrenciaMock>
              data={{ content: relatoriosFiltrados, totalRecords: relatoriosFiltrados.length, pageActual: 0, totalPages: 1 }}
              rows={12}
              columns={columns}
              lazy={false}
              paginator={false}
              selectionMode={null}
              handleOnPageChange={() => {}}
            />
            <div className="prototype-sicad-table-footer">
              Exibindo {relatoriosFiltrados.length ? 1 : 0} a {relatoriosFiltrados.length} de {relatoriosFiltrados.length} registros
            </div>
          </div>
        </CardSeplag>
      </main>
    </SicadShell>
  );
}
type SicadBaseConhecimentoCategoria = {
  id: string;
  titulo: string;
  descricao: string;
  artigos: number;
  icon: string;
  tone: "blue" | "green" | "orange" | "purple" | "teal";
};

type SicadBaseConhecimentoArtigo = {
  id: string;
  titulo: string;
  descricao: string;
  categoriaId: string;
  categoria: string;
  data: string;
  icon: string;
  tone: "blue" | "green" | "orange" | "purple" | "teal";
  acessos: number;
};

const sicadBaseConhecimentoCategorias: SicadBaseConhecimentoCategoria[] = [
  { id: "guia", titulo: "Guias e Tutoriais", descricao: "Passo a passo para utilizar o sistema", artigos: 24, icon: "pi pi-book", tone: "blue" },
  { id: "faq", titulo: "Perguntas Frequentes", descricao: "Tire suas dúvidas sobre o SICAD", artigos: 18, icon: "pi pi-question-circle", tone: "green" },
  { id: "solucao", titulo: "Soluções para Erros", descricao: "Veja causas e soluções de problemas comuns", artigos: 32, icon: "pi pi-exclamation-triangle", tone: "orange" },
  { id: "parametrizacao", titulo: "Parametrizações", descricao: "Configurações e cadastros do sistema", artigos: 16, icon: "pi pi-cog", tone: "purple" },
  { id: "base-legal", titulo: "Base Legal", descricao: "Leis, decretos e normativas", artigos: 12, icon: "pi pi-balance-scale", tone: "teal" },
];

const sicadBaseConhecimentoArtigos: SicadBaseConhecimentoArtigo[] = [
  { id: "art-1", titulo: "Como solicitar um Cartão de Pagamento (CPGMT)", descricao: "Aprenda o passo a passo para solicitar seu cartão de pagamento no SICAD.", categoriaId: "guia", categoria: "Guia", data: "06/05/2024", icon: "pi pi-book", tone: "blue", acessos: 245 },
  { id: "art-2", titulo: "Qual a diferença entre Cartão de Pagamento e Depósito em Conta?", descricao: "Entenda quando usar cada forma de recebimento no suprimento de fundos.", categoriaId: "faq", categoria: "FAQ", data: "02/05/2024", icon: "pi pi-question-circle", tone: "green", acessos: 218 },
  { id: "art-3", titulo: "Área de Gestão não aparece na solicitação", descricao: "Saiba como habilitar a área de gestão através da parametrização da Forma de Recebimento.", categoriaId: "solucao", categoria: "Solução", data: "28/04/2024", icon: "pi pi-exclamation-triangle", tone: "orange", acessos: 201 },
  { id: "art-4", titulo: "Como parametrizar Forma de Recebimento - Tipo II-C", descricao: "Passo a passo para habilitar o Tipo II-C (Cartão Convênio) no sistema.", categoriaId: "parametrizacao", categoria: "Parametrização", data: "25/04/2024", icon: "pi pi-cog", tone: "purple", acessos: 176 },
  { id: "art-5", titulo: "Decreto 1.487/2022 - Suprimento de Fundos", descricao: "Acesse o decreto que regulamenta o suprimento de fundos no Estado de Mato Grosso.", categoriaId: "base-legal", categoria: "Base Legal", data: "21/04/2024", icon: "pi pi-balance-scale", tone: "teal", acessos: 154 },
  { id: "art-6", titulo: "Erro ORA-06502: valor numérico ou erro de valor", descricao: "Causas mais comuns do erro ORA-06502 e como orientar o atendimento.", categoriaId: "solucao", categoria: "Solução", data: "18/04/2024", icon: "pi pi-exclamation-triangle", tone: "orange", acessos: 149 },
];

export function PrototiposSicadBaseConhecimentoPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");

  if (!sicadTemPermissao("acessarBaseConhecimento")) {
    return (
      <SicadAccessDeniedPage
        title="Base de Conhecimento"
        requiredPermissions={["acessarBaseConhecimento"]}
      />
    );
  }

  const normalizar = (value: string) => value.trim().toLocaleLowerCase("pt-BR");
  const artigosFiltrados = sicadBaseConhecimentoArtigos.filter((artigo) => {
    const termo = normalizar(busca);
    const categoriaMatch = !categoriaSelecionada || artigo.categoriaId === categoriaSelecionada;
    const buscaMatch =
      !termo ||
      normalizar(artigo.titulo).includes(termo) ||
      normalizar(artigo.descricao).includes(termo) ||
      normalizar(artigo.categoria).includes(termo);

    return categoriaMatch && buscaMatch;
  });
  const artigosMaisAcessados = [...sicadBaseConhecimentoArtigos]
    .sort((first, second) => second.acessos - first.acessos)
    .slice(0, 5);

  const handlePesquisar = () => {
    setBusca(busca.trim());
  };

  const handleSelecionarCategoria = (categoriaId: string) => {
    setCategoriaSelecionada((current) => (current === categoriaId ? "" : categoriaId));
  };

  return (
    <SicadShell>
      <main className="prototype-sicad-page prototype-sicad-knowledge-page">
        <header className="prototype-sicad-knowledge-header">
          <div>
            <h1>Base de Conhecimento</h1>
            <p>Encontre respostas para suas dúvidas sobre o SICAD</p>
          </div>
        </header>

        <section className="prototype-sicad-knowledge-search" aria-label="Pesquisa na base de conhecimento">
          <label>
            <i className="pi pi-search" aria-hidden="true" />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handlePesquisar();
              }}
              placeholder="Digite sua dúvida (ex.: cartão de pagamento, prestação de contas, erro ORA...)"
            />
          </label>
          <BotaoConsultarSeplag type="button" label="Pesquisar" icon="pi pi-search" onClick={handlePesquisar} />
          <BotaoSeplag
            type="button"
            label="Perguntas Frequentes"
            icon="pi pi-question-circle"
            variant="back"
            onClick={() => setCategoriaSelecionada("faq")}
          />
        </section>

        <section className="prototype-sicad-knowledge-layout">
          <div className="prototype-sicad-knowledge-main">
            <section aria-labelledby="sicad-knowledge-categories-title">
              <h2 id="sicad-knowledge-categories-title" className="prototype-sicad-section-title">Categorias</h2>
              <div className="prototype-sicad-knowledge-categories">
                {sicadBaseConhecimentoCategorias.map((categoria) => (
                  <button
                    type="button"
                    key={categoria.id}
                    className={
                      "prototype-sicad-knowledge-category prototype-sicad-knowledge-tone-" +
                      categoria.tone +
                      (categoriaSelecionada === categoria.id ? " is-active" : "")
                    }
                    onClick={() => handleSelecionarCategoria(categoria.id)}
                  >
                    <span className="prototype-sicad-knowledge-icon"><i className={categoria.icon} /></span>
                    <span>
                      <strong>{categoria.titulo}</strong>
                      <small>{categoria.descricao}</small>
                    </span>
                    <em>{categoria.artigos} artigos</em>
                  </button>
                ))}
              </div>
            </section>

            <section aria-labelledby="sicad-knowledge-featured-title">
              <h2 id="sicad-knowledge-featured-title" className="prototype-sicad-section-title">Artigos em Destaque</h2>
              <div className="prototype-sicad-knowledge-articles">
                {artigosFiltrados.map((artigo) => (
                  <button
                    type="button"
                    key={artigo.id}
                    className="prototype-sicad-knowledge-article"
                    onClick={() => setBusca(artigo.titulo)}
                  >
                    <span className={"prototype-sicad-knowledge-article-icon prototype-sicad-knowledge-tone-" + artigo.tone}>
                      <i className={artigo.icon} />
                    </span>
                    <span className="prototype-sicad-knowledge-article-copy">
                      <strong>{artigo.titulo}</strong>
                      <small>{artigo.descricao}</small>
                    </span>
                    <span className={"prototype-sicad-knowledge-tag prototype-sicad-knowledge-tone-" + artigo.tone}>{artigo.categoria}</span>
                    <time>{artigo.data}</time>
                    <i className="pi pi-chevron-right" aria-hidden="true" />
                  </button>
                ))}
                {artigosFiltrados.length === 0 ? (
                  <div className="prototype-sicad-knowledge-empty">
                    <i className="pi pi-info-circle" />
                    <span>Nenhum artigo encontrado para a pesquisa informada.</span>
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <aside className="prototype-sicad-knowledge-sidebar" aria-label="Artigos e ajuda">
            <section className="prototype-sicad-knowledge-sidebar-group" aria-labelledby="sicad-knowledge-ranking-title">
              <h2 id="sicad-knowledge-ranking-title" className="prototype-sicad-section-title">Artigos Mais Acessados</h2>
              <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-knowledge-side-card prototype-sicad-knowledge-ranking-card">
                <section>
                  <ol className="prototype-sicad-knowledge-ranking">
                    {artigosMaisAcessados.map((artigo, index) => (
                      <li key={artigo.id}>
                        <span>{index + 1}</span>
                        <button type="button" onClick={() => setBusca(artigo.titulo)}>{artigo.titulo}</button>
                      </li>
                    ))}
                  </ol>
                  <button type="button" className="prototype-sicad-knowledge-link" onClick={() => setCategoriaSelecionada("")}>Ver todos os artigos <i className="pi pi-arrow-right" /></button>
                </section>
              </CardSeplag>
            </section>

            <CardSeplag cols="12" cardHeaderClassNames="prototype-sicad-knowledge-side-card prototype-sicad-knowledge-help-card">
              <section>
                <h2>Não encontrou o que precisava?</h2>
                <p>Abra uma ocorrência e nossa equipe irá te ajudar.</p>
                <BotaoSeplag
                  type="button"
                  label="Abrir Ocorrência"
                  icon="pi pi-plus-circle"
                  variant="back"
                  onClick={() => navigate(getSicadPath("/ocorrencias/nova"))}
                  hasPermission={sicadTemPermissao("acessarNovaOcorrencia")}
                />
              </section>
            </CardSeplag>
          </aside>
        </section>
      </main>
    </SicadShell>
  );
}
export const sicadOccurrenceRoutes = {
  nova: getSicadHashPath("/ocorrencias/nova"),
  minhas: getSicadHashPath("/ocorrencias/minhas"),
  fila: getSicadHashPath("/ocorrencias/fila"),
  detalhe: `${SICAD_OCORRENCIAS_BASE_PATH}/:id`,
  dashboard: getSicadHashPath("/ocorrencias/dashboard"),
  relatorios: getSicadHashPath("/ocorrencias/relatorios"),
  baseConhecimento: getSicadHashPath("/ocorrencias/base-conhecimento"),
};































































