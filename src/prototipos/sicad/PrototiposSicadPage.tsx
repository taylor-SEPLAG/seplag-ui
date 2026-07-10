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
      { label: "Minhas Ocorrências", icon: "pi pi-circle-on", to: getSicadPath("/ocorrencias/minhas"), visibleOnMenu: sicadTemPermissao("acessarMinhasOcorrencias"), visibleOnRouter: true },
      { label: "Fila de Ocorrências", icon: "pi pi-circle-on", to: getSicadPath("/ocorrencias/fila"), visibleOnMenu: sicadTemPermissao("acessarFilaOcorrencias"), visibleOnRouter: true },
      { label: "Dashboard", icon: "pi pi-circle-on", to: getSicadPath("/ocorrencias/dashboard"), visibleOnMenu: sicadTemPermissao("acessarDashboard"), visibleOnRouter: true },
      { label: "Relatórios", icon: "pi pi-circle-on", to: getSicadPath("/ocorrencias/relatorios"), visibleOnMenu: sicadTemPermissao("acessarRelatorios"), visibleOnRouter: true },
      { label: "Base de Conhecimento", icon: "pi pi-circle-on", to: getSicadPath("/ocorrencias/base-conhecimento"), visibleOnMenu: sicadTemPermissao("acessarBaseConhecimento"), visibleOnRouter: true },
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

  const handleCriarOcorrencia = () => {
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
    const statusPersistido = getSicadDetalheStatusPersistido();
    const ocorrenciasMock = sicadMinhasOcorrenciasMock.map((ocorrencia) => {
      if (ocorrencia.id !== sicadDetalheOcorrenciaMock.id || !statusPersistido) return ocorrencia;

      return {
        ...ocorrencia,
        status: mapSicadFilaStatusToMinhasStatus(statusPersistido),
      };
    });

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
  const [fila, setFila] = useState<SicadFilaOcorrenciaMock[]>(sicadFilaOcorrenciasMock);
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
    setFila((current) => {
      const index = current.findIndex((item) => item.id === id);
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];

      return next.map((item, itemIndex) => ({ ...item, ordem: itemIndex + 1 }));
    });
  };

  const handleAssumir = (id: string) => {
    setFila((current) =>
      current.map((ocorrencia) =>
        ocorrencia.id === id
          ? {
              ...ocorrencia,
              responsavel: sicadUsuarioMockado.nome,
              status: "Em Análise",
            }
          : ocorrencia,
      ),
    );
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
  const detalheInicial = useMemo(() => getSicadDetalheOcorrenciaInicial(id), [id]);
  const [ocorrencia, setOcorrencia] = useState<SicadOcorrenciaDetalheMock>(
    detalheInicial.ocorrencia,
  );
  const [historico, setHistorico] = useState<SicadOcorrenciaHistoricoMock[]>(
    detalheInicial.historico,
  );
  const [comentarios, setComentarios] = useState<SicadOcorrenciaComentarioMock[]>(
    detalheInicial.comentarios,
  );
  const [novoComentario, setNovoComentario] = useState("");
  const [modalSolicitarInformacoesAberto, setModalSolicitarInformacoesAberto] = useState(false);
  const [informacoesSolicitadas, setInformacoesSolicitadas] = useState("");
  const [respostaSuporte, setRespostaSuporte] = useState("");
  const [anexosResposta, setAnexosResposta] = useState<ArquivoAnexadoSeplag[]>([]);

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

  const criarHistorico = (acao: string, observacao: string): SicadOcorrenciaHistoricoMock => ({
    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    dataHora: formatNow(),
    usuario: `${sicadUsuarioMockado.nome} (${sicadUsuarioMockado.perfil})`,
    acao,
    observacao,
  });

  const criarComentario = (texto: string): SicadOcorrenciaComentarioMock => ({
    id: `coment-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    usuario: sicadUsuarioMockado.nome,
    perfil: sicadUsuarioMockado.perfil,
    dataHora: formatNow(),
    texto,
  });

  const sincronizarDetalhe = (
    nextOcorrencia: SicadOcorrenciaDetalheMock,
    nextHistorico: SicadOcorrenciaHistoricoMock[],
    nextComentarios: SicadOcorrenciaComentarioMock[],
  ) => {
    setOcorrencia(nextOcorrencia);
    setHistorico(nextHistorico);
    setComentarios(nextComentarios);
    salvarSicadDetalheOcorrenciaMock({
      ocorrencia: nextOcorrencia,
      historico: nextHistorico,
      comentarios: nextComentarios,
    });
  };

  const addHistorico = (acao: string, observacao: string) => {
    const nextHistorico = [...historico, criarHistorico(acao, observacao)];
    sincronizarDetalhe(ocorrencia, nextHistorico, comentarios);
  };

  const alterarStatus = (status: SicadFilaOcorrenciaStatus, observacao: string) => {
    const statusAnterior = ocorrencia.status;
    const nextOcorrencia = { ...ocorrencia, status };
    const nextHistorico = [
      ...historico,
      criarHistorico("Status alterado", `${observacao} Status anterior: ${statusAnterior}.`),
    ];

    setValue("status", status);
    sincronizarDetalhe(nextOcorrencia, nextHistorico, comentarios);
  };

  const handleEnviarComentario = () => {
    const texto = novoComentario.trim();

    if (!texto) return;

    const nextComentarios = [...comentarios, criarComentario(texto)];
    const nextHistorico = [
      ...historico,
      criarHistorico("Comentário adicionado", "Novo comentário registrado na ocorrência."),
    ];

    setNovoComentario("");
    sincronizarDetalhe(ocorrencia, nextHistorico, nextComentarios);
  };

  const handleSolicitarInformacoes = () => {
    const texto = informacoesSolicitadas.trim();

    if (!texto) return;

    const nextOcorrencia = { ...ocorrencia, status: "Aguardando Informações" as SicadFilaOcorrenciaStatus };
    const nextComentarios = [
      ...comentarios,
      criarComentario(`Solicitação de informações: ${texto}`),
    ];
    const nextHistorico = [
      ...historico,
      criarHistorico("Solicitação de informações", "Analista solicitou informações complementares ao suporte."),
      criarHistorico("Status alterado", `Status alterado para Aguardando Informações. Status anterior: ${ocorrencia.status}.`),
    ];

    setValue("status", "Aguardando Informações");
    setInformacoesSolicitadas("");
    setModalSolicitarInformacoesAberto(false);
    sincronizarDetalhe(nextOcorrencia, nextHistorico, nextComentarios);
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
    const nextOcorrencia = {
      ...ocorrencia,
      status: "Em Análise" as SicadFilaOcorrenciaStatus,
      anexos: [...ocorrencia.anexos, ...anexosConvertidos],
    };
    const nextComentarios = [
      ...comentarios,
      criarComentario(`Resposta do suporte: ${texto}`),
    ];
    const nextHistorico = [
      ...historico,
      criarHistorico(
        "Informações complementadas",
        anexosResposta.length
          ? `Suporte respondeu a solicitação e anexou ${anexosResposta.length} arquivo(s).`
          : "Suporte respondeu a solicitação.",
      ),
      criarHistorico("Status alterado", "Status alterado para Em Análise após resposta do suporte."),
    ];

    setValue("status", "Em Análise");
    setRespostaSuporte("");
    setAnexosResposta([]);
    sincronizarDetalhe(nextOcorrencia, nextHistorico, nextComentarios);
  };

  const handleAssumir = () => {
    setValue("responsavel", sicadUsuarioMockado.nome);
    alterarStatus("Em Análise", `Responsável alterado para ${sicadUsuarioMockado.nome}.`);
  };

  const handleAlterarStatus = () => {
    alterarStatus(getValues("status"), "Status atualizado manualmente pela análise técnica.");
  };

  const handleGerarModeloRedmine = () => {
    const numeroRedmine = getValues("numeroRedmine") || "REDMINE-98765";

    setValue("numeroRedmine", numeroRedmine);
    addHistorico("Modelo Redmine gerado", `Modelo técnico preparado para ${numeroRedmine}.`);
  };

  const handleAlterarPrioridade = () => {
    const prioridade = getValues("prioridade");
    const nextOcorrencia = { ...ocorrencia, prioridade };
    const nextHistorico = [
      ...historico,
      criarHistorico("Prioridade alterada", `Prioridade atualizada para ${prioridade}.`),
    ];

    sincronizarDetalhe(nextOcorrencia, nextHistorico, comentarios);
  };

  const handleAlterarResponsavel = () => {
    addHistorico("Responsável alterado", `Responsável atualizado para ${getValues("responsavel")}.`);
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
      </main>
    </SicadShell>
  );
}

export function PrototiposSicadOcorrenciasDashboardPage() {
  return (
    <SicadPlaceholderPage
      title="Dashboard"
      requiredPermissions={["acessarDashboard"]}
    />
  );
}

export function PrototiposSicadOcorrenciasRelatoriosPage() {
  return (
    <SicadPlaceholderPage
      title="Relatórios"
      requiredPermissions={["acessarRelatorios"]}
    />
  );
}

export function PrototiposSicadBaseConhecimentoPage() {
  return (
    <SicadPlaceholderPage
      title="Base de Conhecimento"
      requiredPermissions={["acessarBaseConhecimento"]}
    />
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

































