import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import {
  BotaoLimparFiltroSeplag,
  BotaoIconSeplag,
  BotaoSalvarSeplag,
  BotaoSeplag,
  BotaoVoltarSeplag,
} from "@componentes/Botao";
import { AnexarDocumentoSeplag } from "@componentes/AnexarDocumento";
import type { ArquivoAnexadoSeplag } from "@componentes/AnexarDocumento";
import { BadgeSeplag } from "@componentes/Badge";
import { CardSeplag } from "@componentes/Card";
import { ModalSeplag } from "@componentes/Modal";
import { SeplagAutoComplete } from "@componentes/AutoComplete";
import {
  DocumentosLegaisAssociadosSeplag,
  type DocumentoLegalAssociadoSeplag,
} from "@componentes/DocumentosLegaisAssociados";
import { useDocumentosLegaisAssociaveis } from "./documentosLegais/documentosLegaisStore";
import {
  DateFieldSeplag,
  CheckboxFieldSeplag,
  DropdownFieldSeplag,
  MaskFieldSeplag,
  MultiSelectFieldSeplag,
  NumberFieldSeplag,
  RadioButtonFieldSeplag,
  SwitchFieldSeplag,
  TextAreaFieldSeplag,
  TextFieldSeplag,
} from "@componentes/Fields";
import {
  SITUACAO_VIGENCIA,
  STATUS_OPERACIONAL_VIGENCIA,
  SituacaoVigenciaSeplag,
  validarSituacaoVigenciaSeplag,
  type StatusOperacionalVigenciaSeplag,
  type SituacaoVigenciaValueSeplag,
} from "@componentes/SituacaoVigencia";
import {
  SeletorEstruturaOrganizacionalSeplag,
  type EstruturaOrganizacionalNivelSeplag,
  type SeletorEstruturaOrganizacionalValueSeplag,
} from "@componentes/SeletorEstruturaOrganizacional";
import {
  TablePaginadoSeplag,
  type ColumnMetaSeplag,
} from "@componentes/TablePaginado";
import { PickListSeplag } from "@componentes/PickList";
import { TabsSeplag, type TabItemSeplag } from "@componentes/Tabs";
import { LayoutSeplag } from "@componentes/layout/layout/Layout";
import ExcelJS from "exceljs";
import type { IMenuSeplag, IVinculoSeplag } from "@componentes/layout/Config/menu";
import type { AppSystemItemSeplag } from "@componentes/layout/AppSwitcher";
import type { ResultsSeplag } from "../interfaces/Results";
import logoEstado from "../assets/img/Logo_Branco_Estado_MT.png";
import logoSeplagMtExcel from "../assets/img/logo-seplag-mt-excel.png";
import logoSeplag from "../assets/img/logo-seplag.png";
import "../componentes/layout/layout/Layout.css";
import "./prototipos.css";
import { folhaPagamentoService } from "./folhaPagamento/folhaPagamentoService";
import type {
  FolhaPagamentoExecucaoRow,
  FolhaPagamentoExecucaoSituacao,
  FolhaCompetenciaFiltroForm,
  FolhaCompetenciaForm,
  FolhaCompetenciaRow,
  FolhaCompetenciaSituacao,
  FolhaPagamentoFiltroForm,
  FolhaPagamentoForm,
  FolhaPagamentoPessoaLogFiltroForm,
  FolhaPagamentoPessoaLogRow,
  FolhaPagamentoPessoaLogSituacao,
  FolhaPagamentoRow,
  FolhaPagamentoRubricaLogRow,
  FolhaPagamentoRubricaLogSituacao,
  FolhaPagamentoSituacao,
  SolicitacaoAjusteFolhaFiltroForm,
  SolicitacaoAjusteFolhaForm,
  SolicitacaoAjusteFolhaEscopo,
  SolicitacaoAjusteFolhaHistoricoRow,
  SolicitacaoAjusteFolhaPerfil,
  SolicitacaoAjusteFolhaRow,
  SolicitacaoAjusteFolhaSituacao,
  GrupoFolhaFiltroForm,
  GrupoFolhaForm,
  GrupoFolhaRow,
  GrupoFolhaSituacao,
  GrupoFolhaTipo,
  GrupoFolhaVersaoRow,
} from "./folhaPagamento/types";
import { ControleVagasRegrasContent } from "./controleVagas/ControleVagasRegrasContent";
import { QuadroAutorizadoContent } from "./controleVagas/QuadroAutorizadoContent";
import { DistribuicaoSaldoContent } from "./controleVagas/DistribuicaoSaldoContent";
import { DashboardGerencialContent } from "./controleVagas/DashboardGerencialContent";
import { VagasIndividualizadasContent } from "./controleVagas/VagasIndividualizadasContent";
import { MovimentacoesContent } from "./controleVagas/MovimentacoesContent";
import { ProjecoesVagasContent } from "./controleVagas/ProjecoesVagasContent";
import { ControleVagasRegrasContent as BacklogRegrasContent } from "./controleVagasBacklog/ControleVagasRegrasContent";
import { QuadroAutorizadoContent as BacklogQuadroAutorizadoContent } from "./controleVagasBacklog/QuadroAutorizadoContent";
import { DistribuicaoSaldoContent as BacklogDistribuicaoContent } from "./controleVagasBacklog/DistribuicaoSaldoContent";
import { DashboardGerencialContent as BacklogDashboardContent } from "./controleVagasBacklog/DashboardGerencialContent";
import { VagasIndividualizadasContent as BacklogVagasContent } from "./controleVagasBacklog/VagasIndividualizadasContent";
import { MovimentacoesContent as BacklogMovimentacoesContent } from "./controleVagasBacklog/MovimentacoesContent";
import { ProjecoesVagasContent as BacklogProjecoesContent } from "./controleVagasBacklog/ProjecoesVagasContent";
import { ControleVagasRegrasContent as QuadroPessoalRegrasContent } from "./quadroPessoal/ControleVagasRegrasContent";
import { QuadroAutorizadoContent as QuadroPessoalQuadroAutorizadoContent } from "./quadroPessoal/QuadroAutorizadoContent";
import { DistribuicaoSaldoContent as QuadroPessoalDistribuicaoContent } from "./quadroPessoal/DistribuicaoSaldoContent";
import { DashboardGerencialContent as QuadroPessoalDashboardContent } from "./quadroPessoal/DashboardGerencialContent";
import { PosicoesPessoalContent as QuadroPessoalVagasContent } from "./quadroPessoal/PosicoesPessoalContent";
import { MovimentacoesContent as QuadroPessoalMovimentacoesContent } from "./quadroPessoal/MovimentacoesContent";
import { ProjecoesVagasContent as QuadroPessoalProjecoesContent } from "./quadroPessoal/ProjecoesVagasContent";

const SIGEP_BASE_PATH = "/prototipos/sigep";
const SIGEP_PAINEL_INFORMATIVO_PATH =
  "/prototipos/sigep/gestao/painel-informativo";
const SIGEP_CARGO_CONCURSO_TESTE_BASE_PATH =
  "/prototipos/sigep/cargo-concurso-teste";
const CONTROLE_VAGAS_BASE_PATH = "/prototipos/sigep/controle-vagas";
const BACKLOG_BASE_PATH = "/prototipos/sigep/backlog";
const QUADRO_PESSOAL_BASE_PATH = "/prototipos/sigep/quadro-pessoal";
const FOLHA_PAGAMENTO_BASE_PATH =
  "/prototipos/folha/processamento/folha-pagamento";
const FOLHA_PAINEL_INFORMATIVO_PATH =
  "/prototipos/sigep/folha/painel-informativo";
const FOLHA_PROCESSAMENTO_BASE_PATH =
  "/prototipos/folha/processamento/processamento-folha";
const FOLHA_COMPETENCIAS_BASE_PATH =
  "/prototipos/folha/processamento/competencias";
const FOLHA_SOLICITACOES_AJUSTES_BASE_PATH =
  "/prototipos/folha/processamento/solicitacoes-ajustes";
const FOLHA_TABELAS_REFERENCIA_BASE_PATH =
  "/prototipos/folha/tabelas-referencia";
const FOLHA_CONFORMIDADE_BASE_PATH =
  "/prototipos/folha/relatorios/conformidade";
const FOLHA_FICHA_FINANCEIRA_BASE_PATH =
  "/prototipos/folha/lancamento-financeiro/ficha-financeira";
const GRUPOS_FOLHA_BASE_PATH = "/prototipos/folha/grupos-folha";
const FOLHA_PAGAMENTO_NOVA_PATH = `${FOLHA_PAGAMENTO_BASE_PATH}/novo`;
const getFolhaPagamentoVisualizarPath = (id: number) =>
  `${FOLHA_PAGAMENTO_BASE_PATH}/${id}/visualizar`;
const getFolhaPagamentoLogPath = (execucaoId: number) =>
  `${FOLHA_PAGAMENTO_BASE_PATH}/execucoes/${execucaoId}/log`;
const getFolhaTabelaReferenciaNovaVigenciaPath = (tabelaId: number) =>
  `${FOLHA_TABELAS_REFERENCIA_BASE_PATH}/${tabelaId}/vigencias/novo`;
const getFolhaTabelaReferenciaEditarVigenciaPath = (
  tabelaId: number,
  vigenciaId: number,
) => `${FOLHA_TABELAS_REFERENCIA_BASE_PATH}/${tabelaId}/vigencias/${vigenciaId}/editar`;
const getFolhaValorReferenciaNovaVigenciaPath = (codigo: string) =>
  `/prototipos/folha/valores-referencia/${codigo}/vigencias/novo`;
const getFolhaValorReferenciaEditarVigenciaPath = (
  codigo: string,
  vigenciaId: number,
) => `/prototipos/folha/valores-referencia/${codigo}/vigencias/${vigenciaId}/editar`;

interface CargoConcursoRouteProps {
  routePrefix?: string;
}

export const menuGestaoPessoas: IMenuSeplag[] = [
  {
    label: "Painel Informativo",
    icon: "pi pi-home",
    to: SIGEP_PAINEL_INFORMATIVO_PATH,
    visibleOnMenu: true,
    visibleOnRouter: true,
  },
  {
    label: "Cadastro",
    icon: "pi pi-file-edit",
    url: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
    items: [
      {
        label: "Pessoas",
        icon: "pi pi-users",
        url: "#",
        visibleOnMenu: true,
        visibleOnRouter: true,
        items: [
          { label: "Pessoa Física", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Pessoa Jurídica", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Dependente", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Tipo Dependência", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Representante Legal", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
        ],
      },
      {
        label: "Estrutura Organizacional",
        icon: "pi pi-sitemap",
        url: "#",
        visibleOnMenu: true,
        visibleOnRouter: true,
        items: [
          { label: "Instituição", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Órgão Entidade", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Setor", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
        ],
      },
      {
        label: "Cargo e Concurso",
        icon: "pi pi-briefcase",
        url: "#",
        visibleOnMenu: true,
        visibleOnRouter: true,
        items: [
          {
            label: "Regime Jurídico",
            icon: "pi pi-circle-on",
            to: "/prototipos/sigep/regime-juridico",
            visibleOnMenu: true,
            visibleOnRouter: true,
          },
          { label: "Categoria", icon: "pi pi-circle-on", to: "/prototipos/sigep/categoria", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Cargo", icon: "pi pi-circle-on", to: "/prototipos/sigep/cargo", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Tabelas de Vencimentos", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
        ],
      },
      {
        label: "Controle de Vagas",
        icon: "pi pi-chart-bar",
        url: "#",
        visibleOnMenu: true,
        visibleOnRouter: true,
        items: [
          {
            label: "Dashboard",
            icon: "pi pi-circle-on",
            to: `${CONTROLE_VAGAS_BASE_PATH}/dashboard`,
            visibleOnMenu: true,
            visibleOnRouter: true,
          },
          {
            label: "Regras e Parâmetros",
            icon: "pi pi-circle-on",
            to: `${CONTROLE_VAGAS_BASE_PATH}/configuracoes`,
            visibleOnMenu: false,
            visibleOnRouter: true,
          },          {
            label: "Quadro Autorizado",
            icon: "pi pi-circle-on",
            to: `${CONTROLE_VAGAS_BASE_PATH}/quadro-autorizado`,
            visibleOnMenu: true,
            visibleOnRouter: true,
          },          {
            label: "Distribuição",
            icon: "pi pi-circle-on",
            to: `${CONTROLE_VAGAS_BASE_PATH}/distribuicao`,
            visibleOnMenu: true,
            visibleOnRouter: true,
          },          {
            label: "Vagas Individualizadas",
            icon: "pi pi-circle-on",
            to: `${CONTROLE_VAGAS_BASE_PATH}/vagas`,
            visibleOnMenu: true,
            visibleOnRouter: true,          },          {
            label: "Movimentações",
            icon: "pi pi-circle-on",
            to: `${CONTROLE_VAGAS_BASE_PATH}/movimentacoes`,
            visibleOnMenu: false,
            visibleOnRouter: true,
          },          {
            label: "Projeções",
            icon: "pi pi-circle-on",
            to: `${CONTROLE_VAGAS_BASE_PATH}/projecoes`,
            visibleOnMenu: false,
            visibleOnRouter: true,
          },
        ],
      },
      {
        label: "Quadro de Pessoal",
        icon: "pi pi-users",
        url: "#",
        visibleOnMenu: true,
        visibleOnRouter: true,
        items: [
          { label: "Dashboard", icon: "pi pi-circle-on", to: `${QUADRO_PESSOAL_BASE_PATH}/dashboard`, visibleOnMenu: true, visibleOnRouter: true },
          { label: "Regras e Parâmetros", icon: "pi pi-circle-on", to: `${QUADRO_PESSOAL_BASE_PATH}/configuracoes`, visibleOnMenu: false, visibleOnRouter: true },
          { label: "Autorizações de Pessoal", icon: "pi pi-circle-on", to: `${QUADRO_PESSOAL_BASE_PATH}/autorizacoes`, visibleOnMenu: true, visibleOnRouter: true },
          { label: "Distribuição", icon: "pi pi-circle-on", to: `${QUADRO_PESSOAL_BASE_PATH}/distribuicao`, visibleOnMenu: true, visibleOnRouter: false, disabled: true },
          { label: "Posições Individualizadas", icon: "pi pi-circle-on", to: `${QUADRO_PESSOAL_BASE_PATH}/posicoes`, visibleOnMenu: true, visibleOnRouter: true },
          { label: "Movimentações", icon: "pi pi-circle-on", to: `${QUADRO_PESSOAL_BASE_PATH}/movimentacoes`, visibleOnMenu: true, visibleOnRouter: false, disabled: true },
          { label: "Projeções", icon: "pi pi-circle-on", to: `${QUADRO_PESSOAL_BASE_PATH}/projecoes`, visibleOnMenu: true, visibleOnRouter: false, disabled: true },
        ],
      },      {
        label: "Vínculos Funcionais",
        icon: "pi pi-link",
        url: "#",
        visibleOnMenu: true,
        visibleOnRouter: true,
        items: [
          { label: "Tipo de Vínculo", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Vínculo", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Ingresso", icon: "pi pi-circle-on", to: "/prototipos/sigep/ingressos", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Ingressos teste", icon: "pi pi-circle-on", to: "/prototipos/sigep/ingressos-teste", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Efetivo Exercício", icon: "pi pi-circle-on", to: "/prototipos/sigep/ingressos/efetivo-exercicio", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Vacância", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
        ],
      },
      {
        label: "Documentação",
        icon: "pi pi-folder-open",
        url: "#",
        visibleOnMenu: true,
        visibleOnRouter: true,
        items: [{ label: "Documentos Legais", icon: "pi pi-circle-on", to: "/prototipos/sigep/documentos-legais", visibleOnMenu: true, visibleOnRouter: true }],
      },
      {
        label: "Aposentadoria e Benefícios",
        icon: "pi pi-hourglass",
        url: "#",
        visibleOnMenu: true,
        visibleOnRouter: true,
        items: [
          { label: "Tipo Aposentadoria", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Aposentadoria", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Tipo de Pensão", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
        ],
      },
      {
        label: "Parametrização",
        icon: "pi pi-cog",
        url: "#",
        visibleOnMenu: true,
        visibleOnRouter: true,
        items: [
          { label: "Listas de Referências", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Gestão de Documentos", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Componentes", icon: "pi pi-circle-on", to: "/prototipos/sigep/componentes", visibleOnMenu: true, visibleOnRouter: true },
        ],
      },
      {
        label: "Backlog",
        icon: "pi pi-list-check",
        url: "#",
        visibleOnMenu: true,
        visibleOnRouter: true,
        items: [
          { label: "Dashboard", icon: "pi pi-circle-on", to: `${BACKLOG_BASE_PATH}/dashboard`, visibleOnMenu: true, visibleOnRouter: true },
          { label: "Quadro Autorizado", icon: "pi pi-circle-on", to: `${BACKLOG_BASE_PATH}/quadro-autorizado`, visibleOnMenu: true, visibleOnRouter: true },
          { label: "Distribuição", icon: "pi pi-circle-on", to: `${BACKLOG_BASE_PATH}/distribuicao`, visibleOnMenu: true, visibleOnRouter: true },
          { label: "Vagas Individualizadas", icon: "pi pi-circle-on", to: `${BACKLOG_BASE_PATH}/vagas`, visibleOnMenu: true, visibleOnRouter: true },
          { label: "Movimentações", icon: "pi pi-circle-on", to: `${BACKLOG_BASE_PATH}/movimentacoes`, visibleOnMenu: true, visibleOnRouter: true },
          { label: "Projeções", icon: "pi pi-circle-on", to: `${BACKLOG_BASE_PATH}/projecoes`, visibleOnMenu: true, visibleOnRouter: true },
        ],
      },
    ],
  },
];

const menuFolha: IMenuSeplag[] = [
  {
    label: "Painel Informativo",
    icon: "pi pi-home",
    to: FOLHA_PAINEL_INFORMATIVO_PATH,
    visibleOnMenu: true,
    visibleOnRouter: true,
  },
  {
    label: "Rubricas",
    icon: "pi pi-tag",
    url: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
    items: [
      { label: "Catálogo de Rubricas", icon: "pi pi-circle-on", to: "/prototipos/folha/catalogo-rubricas", visibleOnMenu: true, visibleOnRouter: true },
      { label: "Solicitação de Rubrica", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
    ],
  },
  {
    label: "Cadastro",
    icon: "pi pi-list",
    url: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
    items: [
      { label: "Evento", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
      { label: "Tipo Evento", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
      {
        label: "Grupo de Eleitos",
        icon: "pi pi-circle-on",
        to: "/prototipos/folha/grupo-eleitos",
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
      {
        label: "Parâmetros de Folha",
        icon: "pi pi-circle-on",
        to: FOLHA_TABELAS_REFERENCIA_BASE_PATH,
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
      { label: "Pensão Alimentícia", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
      { label: "Pensão Especial", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
      { label: "Pensão por Morte", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
    ],
  },
  {
    label: "Folha",
    icon: "pi pi-cog",
    url: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
    items: [
      {
        label: "Competência da folha",
        icon: "pi pi-circle-on",
        to: FOLHA_COMPETENCIAS_BASE_PATH,
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
      {
        label: "Grupos de Cálculo da Folha",
        icon: "pi pi-circle-on",
        to: "/prototipos/folha/grupos-calculo",
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
      {
        label: "Folha de Pagamento",
        icon: "pi pi-circle-on",
        to: FOLHA_PAGAMENTO_BASE_PATH,
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
      {
        label: "Processamento da Folha",
        icon: "pi pi-circle-on",
        to: FOLHA_PROCESSAMENTO_BASE_PATH,
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
      {
        label: "Solicitações de Ajustes da Folha",
        icon: "pi pi-circle-on",
        to: FOLHA_SOLICITACOES_AJUSTES_BASE_PATH,
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
    ],
  },
  {
    label: "Lançamento Financeiro",
    icon: "pi pi-money-bill",
    url: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
    items: [
      {
        label: "Ficha Financeira",
        icon: "pi pi-circle-on",
        to: FOLHA_FICHA_FINANCEIRA_BASE_PATH,
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
      {
        label: "Retenções Judiciais",
        icon: "pi pi-folder-open",
        url: "#",
        visibleOnMenu: true,
        visibleOnRouter: true,
        items: [
          {
            label: "Penhora Judicial",
            icon: "pi pi-circle-on",
            to: "/prototipos/folha/penhora-judicial",
            visibleOnMenu: true,
            visibleOnRouter: true,
          },
        ],
      },
    ],
  },
  {
    label: "Relatórios",
    icon: "pi pi-chart-bar",
    url: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
    items: [
      {
        label: "Relatório Dinâmico da Folha",
        icon: "pi pi-circle-on",
        to: FOLHA_CONFORMIDADE_BASE_PATH,
        visibleOnMenu: true,
        visibleOnRouter: true,
      },
    ],
  },
];

const menuSimples: IMenuSeplag[] = [
  {
    label: "Página Inicial",
    icon: "pi pi-home",
    url: "#",
    visibleOnMenu: true,
    visibleOnRouter: true,
  },
];

const vinculos: IVinculoSeplag[] = [
  { numrVinculo: 2, statVinculo: "ATIVO", unidade: { descUnidade: "CDS-TI" }, orgao: { descOrgao: "SEPLAG-MT" } },
  { numrVinculo: 1, statVinculo: "ATIVO", unidade: { descUnidade: "STI" }, orgao: { descOrgao: "SEPLAG-MT" } },
];

const prototypeSystems = [
  {
    id: "sigep",
    title: "SIGEP",
    description: "Sistema Integrado de Gestão de Pessoas",
    path: "/prototipos/sigep",
    icon: "pi pi-users",
    status: "Protótipo disponível",
  },
  {
    id: "sicad",
    title: "SICAD",
    description: "Sistema de Concessão de Adiantamento",
    path: "/prototipos/sicad",
    icon: "pi pi-wallet",
    status: "Protótipo disponível",
  },
];

const sistemas: AppSystemItemSeplag[] = [
  { id: "gestao-pessoas", label: "GESTÃO DE PESSOAS", url: `#${SIGEP_PAINEL_INFORMATIVO_PATH}`, icon: "pi pi-users" },
  { id: "folha", label: "FOLHA", url: `#${FOLHA_PAINEL_INFORMATIVO_PATH}`, icon: "pi pi-money-bill" },
  { id: "pericia", label: "PERÍCIA", url: "#/prototipos/pericia", icon: "pi pi-plus-circle" },
  { id: "consignado", label: "CONSIGNADO", url: "#/prototipos/consignado", icon: "pi pi-wallet" },
  { id: "contagem-tempo", label: "CONTAGEM DE TEMPO", url: "#/prototipos/contagem-tempo", icon: "pi pi-clock" },
  { id: "e-social", label: "E-SOCIAL", url: "#/prototipos/e-social", icon: "pi pi-file" },
  { id: "aposentadoria", label: "APOSENTADORIA", url: "#/prototipos/aposentadoria", icon: "pi pi-users" },
  { id: "conformidade", label: "CONFORMIDADE", url: "#/prototipos/conformidade", icon: "pi pi-verified" },
  { id: "auditoria", label: "AUDITORIA", url: "#/prototipos/auditoria", icon: "pi pi-check-square" },
];

const sigepDashboardModules = [
  {
    id: "gestao-pessoas",
    label: "Gestão de Pessoas",
    description: "Cadastros e estruturas funcionais do SIGEP.",
    path: SIGEP_PAINEL_INFORMATIVO_PATH,
    icon: "pi pi-users",
    status: "Disponível",
    featured: true,
  },
  {
    id: "folha",
    label: "Folha",
    description: "Rubricas, grupos, processamento e lançamentos financeiros.",
    path: FOLHA_PAINEL_INFORMATIVO_PATH,
    icon: "pi pi-money-bill",
    status: "Em evolução",
  },
  {
    id: "pericia",
    label: "Perícia",
    description: "Fluxos periciais e acompanhamento de atendimentos.",
    path: "/prototipos/pericia",
    icon: "pi pi-plus-circle",
    status: "Em desenvolvimento",
  },
  {
    id: "consignado",
    label: "Consignado",
    description: "Consulta e gestão de consignações funcionais.",
    path: "/prototipos/consignado",
    icon: "pi pi-wallet",
    status: "Em desenvolvimento",
  },
  {
    id: "contagem-tempo",
    label: "Contagem de Tempo",
    description: "Análise de vínculos, períodos e averbações.",
    path: "/prototipos/contagem-tempo",
    icon: "pi pi-clock",
    status: "Em desenvolvimento",
  },
  {
    id: "e-social",
    label: "E-Social",
    description: "Eventos, integrações e conformidade cadastral.",
    path: "/prototipos/e-social",
    icon: "pi pi-file",
    status: "Em desenvolvimento",
  },
  {
    id: "aposentadoria",
    label: "Aposentadoria",
    description: "Simulações, processos e regras previdenciárias.",
    path: "/prototipos/aposentadoria",
    icon: "pi pi-users",
    status: "Em desenvolvimento",
  },
  {
    id: "conformidade",
    label: "Conformidade",
    description: "Auditoria preventiva, validações e relatórios.",
    path: "/prototipos/conformidade",
    icon: "pi pi-verified",
    status: "Em desenvolvimento",
  },
  {
    id: "auditoria",
    label: "Auditoria",
    description: "Acompanhamento de trilhas, achados e evidências.",
    path: "/prototipos/auditoria",
    icon: "pi pi-check-square",
    status: "Em desenvolvimento",
  },
];

const USUARIO_FOLHA_LOGADO = "ROBERTO JUNIOR";

const componentPrototypeItems = [
  {
    id: "situacao-vigencia",
    title: "Situação e Vigência",
    description:
      "Controle padronizado de situação, vigência e status operacional.",
    path: "/prototipos/sigep/componentes/situacao-vigencia",
    icon: "pi pi-calendar-clock",
    status: "Componente disponível",
  },
  {
    id: "documentos-vinculados",
    title: "Documentos Vinculados",
    description:
      "Seleção e vínculo de documentos previamente cadastrados no sistema.",
    path: "/prototipos/sigep/componentes/documentos-vinculados",
    icon: "pi pi-file-check",
    status: "Componente em definição",
  },
  {
    id: "anexar-documento",
    title: "Anexar Documento",
    description:
      "Upload de arquivo PDF com visualização e remoção do documento anexado.",
    path: "/prototipos/sigep/componentes/anexar-documento",
    icon: "pi pi-paperclip",
    status: "Componente disponível",
  },
  {
    id: "estrutura-organizacional",
    title: "Estrutura Organizacional",
    description:
      "Seleção hierárquica de instituições, órgãos e unidades vinculadas.",
    path: "/prototipos/sigep/componentes/estrutura-organizacional",
    icon: "pi pi-sitemap",
    status: "Componente em definição",
  },
];

const documentosLegaisMock: DocumentoLegalAssociadoSeplag[] = [
  {
    id: "lei-12345-2023",
    titulo: "Lei 12.345/2023",
    categoria: "Lei",
    descricao: "Organização administrativa municipal.",
  },
  {
    id: "decreto-456-2024",
    titulo: "Decreto 456/2024",
    categoria: "Decreto",
    descricao: "Regulamentação de eventos públicos.",
  },
  {
    id: "norma-001a-2022",
    titulo: "Norma 001-A/2022",
    categoria: "Norma",
    descricao: "Diretrizes de segurança da informação.",
  },
  {
    id: "portaria-123-2024",
    titulo: "Portaria 123/2024",
    categoria: "Portaria",
    descricao: "Regras de conduta para servidores.",
  },
  {
    id: "lei-complementar-88-2023",
    titulo: "Lei Complementar 88/2023",
    categoria: "Lei",
    descricao: "Estatuto dos servidores públicos municipais.",
  },
  {
    id: "decreto-789-2024",
    titulo: "Decreto 789/2024",
    categoria: "Decreto",
    descricao: "Procedimentos para tramitação digital.",
  },
  {
    id: "lc-202-2004",
    titulo: "Lei Complementar 202/2004",
    categoria: "Lei Complementar",
    descricao: "Regime de previdência dos servidores públicos do Estado de Mato Grosso.",
  },
  {
    id: "lc-654-2020",
    titulo: "Lei Complementar 654/2020",
    categoria: "Lei Complementar",
    descricao: "Altera regras de contribuição previdenciária do RPPS.",
  },
  {
    id: "lc-700-2021",
    titulo: "Lei Complementar 700/2021",
    categoria: "Lei Complementar",
    descricao: "Regras previdenciárias para inativos, pensionistas e doença incapacitante.",
  },
  {
    id: "lc-712-2022",
    titulo: "Lei Complementar 712/2022",
    categoria: "Lei Complementar",
    descricao: "Regras do Sistema de Proteção Social dos Militares.",
  },
];

const estruturaOrganizacionalNiveis: EstruturaOrganizacionalNivelSeplag[] = [
  {
    id: "instituicoes",
    titulo: "Instituições",
    disponiveisTitulo: "Instituições disponíveis",
    selecionadosTitulo: "Instituições selecionadas",
    filtroPlaceholder: "Procurar por instituição",
    itens: [
      { id: "govmt", nome: "Governo do Estado de Mato Grosso" },
      {
        id: "empaer",
        nome: "Empresa Mato-grossense de Pesquisa Assistência e Extensão Rural",
      },
      {
        id: "mtitec",
        nome: "Empresa Mato-grossense de Tecnologia da Informação",
      },
      { id: "mtgas", nome: "Companhia Mato-grossense de Gás" },
      {
        id: "sanemat",
        nome: "Companhia de Saneamento do Estado de Mato Grosso",
      },
      { id: "mtpar", nome: "MT Participações e Projetos S.A." },
      { id: "metamat", nome: "Companhia Mato-grossense de Mineração" },
    ],
  },
  {
    id: "orgaos",
    titulo: "Órgãos do GOVMT",
    disponiveisTitulo: "Órgãos disponíveis",
    selecionadosTitulo: "Órgãos selecionados",
    filtroPlaceholder: "Procurar por órgão",
    parentLevelId: "instituicoes",
    itens: [
      { id: "casa-civil", parentId: "govmt", nome: "Casa Civil do Estado de Mato Grosso" },
      { id: "cge", parentId: "govmt", nome: "Controladoria Geral do Estado (CGE-MT)" },
      { id: "pge", parentId: "govmt", nome: "Procuradoria Geral do Estado (PGE-MT)" },
      { id: "sefaz", parentId: "govmt", nome: "Secretaria de Estado de Fazenda (SEFAZ-MT)" },
      { id: "setasc", parentId: "govmt", nome: "Secretaria de Estado de Assistência Social e Cidadania (SETASC-MT)" },
      { id: "detran", parentId: "govmt", nome: "Departamento Estadual de Trânsito (DETRAN-MT)" },
      { id: "sesp", parentId: "govmt", nome: "Secretaria de Estado de Segurança Pública (SESP-MT)" },
      { id: "pmmt", parentId: "govmt", nome: "Polícia Militar do Estado de Mato Grosso" },
      { id: "pjc", parentId: "govmt", nome: "Polícia Judiciária Civil (PJC-MT)" },
      { id: "cbm", parentId: "govmt", nome: "Corpo de Bombeiros Militar (CBM-MT)" },
      { id: "seaf", parentId: "govmt", nome: "Secretaria de Estado de Agricultura Familiar (SEAF-MT)" },
      { id: "intermat", parentId: "govmt", nome: "Instituto de Terras de Mato Grosso (INTERMAT)" },
      { id: "indea", parentId: "govmt", nome: "Instituto de Defesa Agropecuária do Estado de MT (INDEA-MT)" },
      { id: "seduc", parentId: "govmt", nome: "Secretaria de Estado de Educação (SEDUC-MT)" },
      { id: "seciteci", parentId: "govmt", nome: "Secretaria de Estado de Ciência, Tecnologia e Inovação (SECITECI-MT)" },
      { id: "ses", parentId: "govmt", nome: "Secretaria de Estado de Saúde (SES-MT)" },
      { id: "seplag", parentId: "govmt", nome: "Secretaria de Estado de Planejamento e Gestão (SEPLAG-MT)" },
      { id: "sema", parentId: "govmt", nome: "Secretaria de Estado de Meio Ambiente (SEMA-MT)" },
      { id: "secom", parentId: "govmt", nome: "Secretaria de Estado de Comunicação (SECOM-MT)" },
      { id: "politec", parentId: "govmt", nome: "Perícia Oficial e Identificação Técnica (POLITEC-MT)" },
    ],
  },
  {
    id: "unidades",
    titulo: "Unidades da SEPLAG",
    disponiveisTitulo: "Unidades disponíveis",
    selecionadosTitulo: "Unidades selecionadas",
    filtroPlaceholder: "Procurar por unidade",
    parentLevelId: "orgaos",
    itens: [{ id: "sapgd", parentId: "seplag", nome: "SAPGD" }],
  },
  {
    id: "setores",
    titulo: "Setores da SAPGD",
    disponiveisTitulo: "Setores disponíveis",
    selecionadosTitulo: "Setores selecionados",
    filtroPlaceholder: "Procurar por setor",
    parentLevelId: "unidades",
    itens: [{ id: "cppti", parentId: "sapgd", nome: "CPPTI" }],
  },
];

interface PrototypeSystemPageProps {
  nomeSistema: string;
  ambienteSistema: string;
  menuItems: IMenuSeplag[];
  message?: string;
  children?: ReactNode;
}

export function PrototypeSystemPage({
  nomeSistema,
  ambienteSistema,
  menuItems,
  message,
  children,
}: Readonly<PrototypeSystemPageProps>) {
  return (
    <div className="prototype-shell">
      <LayoutSeplag
        nomeSistema={nomeSistema}
        ambienteSistema={ambienteSistema}
        sistemas={sistemas}
        logoSrc={logoSeplag}
        menuItems={menuItems}
        menuMode="static"
        footerText="SEPLAG - SSCPG - Superintendência de Sistemas Corporativos de Planejamento e Gestão"
        nomeApresentacao="ROBERTO JUNIOR"
        numrVinculoAtual={2}
        vinculos={vinculos}
        onLogout={() => {}}
        onAlterarSenha={() => {}}
        onSelecionarVinculo={() => {}}
      >
        {children ?? (
          <div className="prototype-content">
            <img src={logoEstado} alt="Brasão do Estado de Mato Grosso" />
            {message && <div className="prototype-message">{message}</div>}
          </div>
        )}
      </LayoutSeplag>
    </div>
  );
}

export function PrototiposPage() {
  return (
    <main className="prototype-selection-page">
      <section className="prototype-selection-header">
        <span>Protótipos</span>
        <h1>Selecione um sistema</h1>
        <p>
          Escolha o sistema para visualizar os fluxos prototipados com a
          biblioteca de componentes da SEPLAG.
        </p>
      </section>

      <section className="prototype-system-grid" aria-label="Sistemas disponíveis">
        {prototypeSystems.map((system) => (
          <article
            className="prototype-system-link"
            key={system.id}
          >
            <CardSeplag cols="12" cardHeaderClassNames="prototype-system-card">
              <div className="prototype-system-card-content">
                <div className="prototype-system-icon" aria-hidden="true">
                  <i className={system.icon} />
                </div>
                <div className="prototype-system-info">
                  <span>{system.status}</span>
                  <h2>{system.title}</h2>
                  <p>{system.description}</p>
                </div>
                <div className="prototype-system-actions">
                  <Link className="prototype-system-action" to={system.path} aria-label={`Abrir protótipo ${system.title}`}>
                    Acessar <i className="pi pi-arrow-right" aria-hidden="true" />
                  </Link>
                  {system.id === "sigep" ? (
                    <Link className="prototype-system-vision-action" to="/prototipos/sigep/visao-sistema">
                      <i className="pi pi-sitemap" aria-hidden="true" /> Visão do sistema
                    </Link>
                  ) : null}
                </div>
              </div>
            </CardSeplag>
          </article>
        ))}
      </section>
    </main>
  );
}

interface SituacaoVigenciaDemoForm extends SituacaoVigenciaValueSeplag {
  possuiVinculosOuDependencias: boolean;
}

interface CategoriaFiltroForm {
  categoria?: string;
  instituicao?: string;
  situacao?: string;
}

interface CargoFiltroForm {
  cargo?: string;
  categoria?: string;
  situacao?: string;
}

interface TipoVinculoFiltroForm {
  termo?: string;
  natureza?: string;
  instituicao?: string;
  situacao?: string;
}

interface MatrizValidacaoFiltroForm {
  instituicao?: string;
  orgao?: string;
  regimeJuridico?: string;
  tipoVinculo?: string;
  categoria?: string;
  cargo?: string;
  situacao?: string;
}

interface CargoForm {
  codigo?: string;
  baseLegal?: string[];
  categoria?: string;
  subcategoria?: string;
  instituicao?: string[];
  nomeCargo?: string;
  descricao?: string;
  tipoCargo?: string;
  naturezaCargo?: string;
  formaProvimento?: string;
  regimeJuridico?: string;
  jornadaTrabalho?: string;
  escolaridadeMinima?: string;
  cbo?: string;
  especialidade?: string;
  naturezaVinculo?: string;
  cargoChefia?: "S" | "N";
  permiteSubstituicao?: "S" | "N";
  exibirPortal?: "S" | "N";
  observacao?: string;
  situacao?: SituacaoVigenciaValueSeplag["situacao"];
  dataAtivacao?: string;
  dataEncerramento?: string;
  dataExtincao?: string;
  motivoEncerramento?: string;
  motivoExtincao?: string;
}

interface TipoVinculoForm {
  codigo?: string;
  nome?: string;
  descricao?: string;
  natureza?: string;
  baseLegal?: string[];
  geraVinculoFuncional?: "S" | "N";
  exigeCargo?: "S" | "N";
  exigeVaga?: "S" | "N";
  permiteControleVagas?: "S" | "N";
  permiteFolha?: "S" | "N";
  permiteAposentadoria?: "S" | "N";
  permitePensionista?: "S" | "N";
  permiteEventoCargo?: "S" | "N";
  exigeDataFim?: "S" | "N";
  observacao?: string;
  situacao?: SituacaoVigenciaValueSeplag["situacao"];
  dataAtivacao?: string;
  dataEncerramento?: string;
  dataExtincao?: string;
  motivoEncerramento?: string;
  motivoExtincao?: string;
}

interface MatrizValidacaoForm {
  instituicao?: string;
  orgao?: string;
  setor?: string;
  regimeJuridico?: string;
  tipoVinculo?: string;
  categoria?: string;
  subcategoria?: string;
  cargo?: string;
  formaProvimento?: string;
  jornada?: string;
  controlaVaga?: string;
  tipoControleVaga?: string;
  aplicaIngresso?: "S" | "N";
  aplicaEventoCargo?: "S" | "N";
  aplicaConcurso?: "S" | "N";
  aplicaControleVagas?: "S" | "N";
  observacao?: string;
  situacao?: SituacaoVigenciaValueSeplag["situacao"];
  dataAtivacao?: string;
  dataEncerramento?: string;
  dataExtincao?: string;
  motivoEncerramento?: string;
  motivoExtincao?: string;
}


interface RegimeJuridicoFiltroForm {
  nome?: string;
  instituicao?: string;
  situacao?: string;
}

interface GrupoEleitosFiltroForm {
  termo?: string;
  situacao?: StatusOperacionalVigenciaSeplag | "";
}

type GrupoCalculoSituacao = "RASCUNHO" | "ATIVO" | "ENCERRADO";

interface GrupoCalculoFiltroForm {
  nomeGrupo?: string;
  situacao?: GrupoCalculoSituacao | "";
  tipoVinculo?: string;
}

interface GrupoCalculoForm {
  nome?: string;
  descricao?: string;
  situacao?: SituacaoVigenciaValueSeplag["situacao"] | "RASCUNHO";
  dataAtivacao?: string;
  dataEncerramento?: string;
  motivoEncerramento?: string;
  dataExtincao?: string;
  motivoExtincao?: string;
  abrangenciaRegimeJuridico?: string[];
  abrangenciaTipoVinculo?: string[];
  abrangenciaInstituicao?: string[];
  abrangenciaHerdarDe?: string;
  abrangenciaOrgao?: string[];
  abrangenciaSetores?: string[];
  abrangenciaCategorias?: string[];
  abrangenciaSubcategorias?: string[];
  abrangenciaCargos?: string[];
}

interface ProcessamentoFolhaForm {
  numeroFolha?: string;
  nomeFolha?: string;
  competencia?: string;
  tipoExecucao?: "PARCIAL" | "TOTAL";
  orgaos?: string[];
  setores?: string[];
  regimesJuridicos?: string[];
  tiposVinculo?: string[];
  categorias?: string[];
  subcategorias?: string[];
  cargos?: string[];
  grupoEleitos?: string;
}

interface GrupoEleitoForm {
  descricao?: string;
  situacao?: SituacaoVigenciaValueSeplag["situacao"];
  dataAtivacao?: string;
  dataEncerramento?: string;
  motivoEncerramento?: string;
  dataExtincao?: string;
  motivoExtincao?: string;
  observacoes?: string;
  participanteBusca?: string;
  consultar?: "todos" | "disponiveis" | "eleitos";
  filtroInstituicao?: string[];
  filtroOrgao?: string[];
  filtroTipoVinculo?: string[];
  filtroSetor?: string[];
  filtroCategoria?: string[];
  filtroSubcategoria?: string[];
  filtroCargo?: string[];
}

interface RegimeJuridicoForm {
  nome?: string;
  sigla?: string;
  descricao?: string;
  situacao?: SituacaoVigenciaValueSeplag["situacao"];
  dataAtivacao?: string;
  dataEncerramento?: string;
  motivoEncerramento?: string;
  dataExtincao?: string;
  motivoExtincao?: string;
}

interface CategoriaForm {
  sigla?: string;
  descricao?: string;
  observacao?: string;
  subcategoriaSigla?: string;
  subcategoriaNome?: string;
  subcategoriaDescricao?: string;
  situacao?: SituacaoVigenciaValueSeplag["situacao"];
  dataAtivacao?: string;
  dataEncerramento?: string;
  motivoEncerramento?: string;
  dataExtincao?: string;
  motivoExtincao?: string;
}

interface CategoriaRow {
  id: number;
  sigla: string;
  descricao: string;
  instituicao: string;
  instituicoesVinculadas: number;
  situacao: "ATIVO" | "ENCERRADO";
}

interface CategoriaTesteRow extends CategoriaRow {
  subcategorias: number;
  vigencia: string;
}

interface CargoRow {
  id: number;
  cargo: string;
  categoria: string;
  baseLegal: number;
  instituicoes: number;
  situacao: "ATIVO" | "ENCERRADO";
}

interface CargoTesteRow extends CargoRow {
  codigo: string;
  subcategoria: string;
  jornadaPadrao: string;
  regrasUso: number;
  vigencia: string;
}

interface TipoVinculoTesteRow {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  natureza: string;
  instituicao: string;
  instituicoesVinculadas: number;
  comportamentos: string[];
  vigencia: string;
  situacao: "ATIVO" | "ENCERRADO";
}

type IngressoSituacao =
  | "Aguardando Analise"
  | "Em analise"
  | "Posse Suspensa"
  | "Aguardando Efetivo Exercicio"
  | "Tornado sem efeito"
  | "Posse Negada"
  | "Ingresso Concluído";

type IngressoTipo =
  | "Concurso"
  | "Processo Seletivo"
  | "Nomeação"
  | "Exclusivo Comissionado"
  | "Residente Técnico"
  | "Estagiário";

type IngressoDetalheTab =
  | "dados-basicos"
  | "documentacao"
  | "validacoes"
  | "formalizacao"
  | "exercicio"
  | "vinculo"
  | "prestacao-contas"
  | "historico";

type NovoIngressoTab =
  | "tipo-ingresso"
  | "documentacao"
  | "analise-provimento"
  | "efetivo-exercicio";

type IngressoPerfil = "PROVIMENTO" | "SETORIAL";

interface IngressoRow {
  id: number;
  nome: string;
  cpf: string;
  matricula: string;
  tipoIngresso: IngressoTipo;
  tipoVinculo: string;
  orgao: string;
  cargo: string;
  situacao: IngressoSituacao;
  dataIngresso: string;
}

interface IngressoCandidatoRow {
  id: number;
  nome: string;
  classificacao: string;
  cargo: string;
  tipoVaga: "AC" | "PCD" | "PPP";
  dataNomeacao: string;
  dataPosse: string;
  dataEfetivoExercicio: string;
}

interface IngressoConcursoProcessoRow {
  id: number;
  titulo: string;
  tipo: "Concurso" | "Processo Seletivo";
  orgao: string;
  edital: string;
  candidatos: IngressoCandidatoRow[];
}

interface IngressoCandidatoGrupoRow {
  id: string;
  vagaEspecialidade: string;
  perfilEspecialidade: string;
  polo: string;
  classificacao: IngressoCandidatoRow["tipoVaga"];
  candidatos: IngressoCandidatoRow[];
}

interface IngressoHistoricoEtapaRow {
  id: number;
  ingressoId: number;
  etapa: string;
  dataHora: string;
  operador: string;
  resultado: "Apto" | "Negado" | "Pendente" | "Suspenso" | "Tornado sem efeito";
  parecer?: string;
  observacao?: string;
}
interface IngressoFiltroForm {
  concursoProcessoSeletivo: string;
}

interface IngressosTesteGridRow {
  id: string;
  titulo: string;
  tipo: "Concurso" | "Processo Seletivo" | "Nomeação";
  orgao: string;
  edital: string;
  nomeados: number;
  ingressados: number;
  rotaIngresso: string;
}

interface MatrizValidacaoTesteRow {
  id: number;
  instituicao: string;
  orgao: string;
  setor: string;
  regimeJuridico: string;
  tipoVinculo: string;
  categoria: string;
  subcategoria: string;
  cargo: string;
  formaProvimento: string;
  jornada: string;
  vigencia: string;
  situacao: "ATIVO" | "ENCERRADO";
  especificidade: "Genérica" | "Por órgão" | "Por cargo";
}

interface RegimeJuridicoRow {
  id: number;
  nome: string;
  descricao: string;
  instituicao: string;
  instituicoesVinculadas: number;
  situacao: StatusOperacionalVigenciaSeplag;
}

interface RegimeJuridicoTesteRow extends RegimeJuridicoRow {
  codigo: string;
  vigencia: string;
}

interface GrupoEleitosRow {
  id: number;
  descricao: string;
  situacao: StatusOperacionalVigenciaSeplag;
  quantidadeEleitos: number;
}

interface GrupoCalculoRow {
  id: number;
  codigo: string;
  grupo: string;
  nivel: number;
  herdaDe: string;
  orgaoSetor: string;
  tipoVinculo: string;
  situacao: GrupoCalculoSituacao | StatusOperacionalVigenciaSeplag;
  inicioVigencia: string;
  fimVigencia: string;
  rubricas: number;
  pendencias: number;
}

interface CatalogoRubricaFiltroForm {
  termo?: string;
  status?: "Ativa" | "Inativa" | "Extintas" | "";
}

interface InativarRubricaForm {
  motivoInativacao: string;
  dataFim: string;
}

interface RubricaRow {
  id: number;
  codigo: string;
  nomeRubrica: string;
  naturezaVerba: string;
  dataAprovacao: string;
  status: "Ativa" | "Inativa" | "Extintas";
}

interface GrupoCalculoRubricaGerenciada extends RubricaRow {
  origem: "filtro" | "manual";
  paoe?: string;
  paoeAlterado?: boolean;
  reordenada?: boolean;
  excluida?: boolean;
}

interface GrupoEleitoParticipanteRow {
  id: number;
  matricula: string;
  cpf: string;
  vinculo: string;
  servidor: string;
  orgaoEntidade: string;
  dataExercicioAposentadoria: string;
}

interface SubcategoriaRow {
  id: number;
  nome: string;
  descricao: string;
  orgaosVinculados: number;
  situacao: "ATIVO" | "ENCERRADO";
}

interface SubcategoriaTesteRow {
  id: number;
  sigla: string;
  nome: string;
  descricao: string;
  cargos: number;
  regrasUso: number;
  vigencia: string;
  situacao: "ATIVO" | "ENCERRADO";
}

const categoriasMock: CategoriaRow[] = [
  {
    id: 1,
    sigla: "n/a abc",
    descricao: "n/a abc",
    instituicao: "seplag",
    instituicoesVinculadas: 1,
    situacao: "ATIVO",
  },
  {
    id: 2,
    sigla: "N/A/D",
    descricao: "N/A/D",
    instituicao: "seplag",
    instituicoesVinculadas: 2,
    situacao: "ATIVO",
  },
  {
    id: 3,
    sigla: "N/A",
    descricao: "N/A",
    instituicao: "casa-civil",
    instituicoesVinculadas: 2,
    situacao: "ENCERRADO",
  },
  {
    id: 4,
    sigla: "N/A N/A B/A",
    descricao: "B/A BA/",
    instituicao: "mti",
    instituicoesVinculadas: 3,
    situacao: "ENCERRADO",
  },
  {
    id: 5,
    sigla: "fffffffffffffff",
    descricao: "Agentes Governamentais da Cultura sss",
    instituicao: "seplag",
    instituicoesVinculadas: 3,
    situacao: "ATIVO",
  },
  {
    id: 6,
    sigla: "fffffffffffffff",
    descricao: "Agentes Governamentais da Cultura sss",
    instituicao: "casa-civil",
    instituicoesVinculadas: 3,
    situacao: "ATIVO",
  },
  {
    id: 7,
    sigla: "rgrgrgrgrg",
    descricao: "rgrg",
    instituicao: "mti",
    instituicoesVinculadas: 1,
    situacao: "ATIVO",
  },
];

const categoriasTesteMock: CategoriaTesteRow[] = [
  {
    id: 1,
    sigla: "EDU",
    descricao: "Profissionais da Educação",
    instituicao: "govmt",
    instituicoesVinculadas: 1,
    subcategorias: 3,
    vigencia: "01/01/2026 -",
    situacao: "ATIVO",
  },
  {
    id: 2,
    sigla: "MIL",
    descricao: "Militar",
    instituicao: "govmt",
    instituicoesVinculadas: 2,
    subcategorias: 2,
    vigencia: "01/01/2026 -",
    situacao: "ATIVO",
  },
  {
    id: 3,
    sigla: "SAUDE",
    descricao: "Profissionais da Saúde",
    instituicao: "govmt",
    instituicoesVinculadas: 1,
    subcategorias: 4,
    vigencia: "01/03/2026 -",
    situacao: "ATIVO",
  },
  {
    id: 4,
    sigla: "AREA_MEIO",
    descricao: "Profissionais da Área Meio",
    instituicao: "mti",
    instituicoesVinculadas: 3,
    subcategorias: 5,
    vigencia: "01/01/2026 -",
    situacao: "ENCERRADO",
  },
];

const subcategoriasTesteMock: SubcategoriaTesteRow[] = [
  {
    id: 1,
    sigla: "PROF",
    nome: "Professor",
    descricao: "Subcategoria da carreira de profissionais da educação.",
    cargos: 2,
    regrasUso: 3,
    vigencia: "01/01/2026 -",
    situacao: "ATIVO",
  },
  {
    id: 2,
    sigla: "TAE",
    nome: "Técnico Administrativo Educacional",
    descricao: "Subcategoria administrativa vinculada à educação.",
    cargos: 5,
    regrasUso: 2,
    vigencia: "01/01/2026 -",
    situacao: "ATIVO",
  },
  {
    id: 3,
    sigla: "OFICIAL",
    nome: "Oficial",
    descricao: "Subcategoria composta pelos postos de oficiais militares.",
    cargos: 8,
    regrasUso: 4,
    vigencia: "01/01/2026 -",
    situacao: "ATIVO",
  },
];

const cargosMock: CargoRow[] = [
  {
    id: 1,
    cargo: "ENGENHEIRO DE SOFTWARE",
    categoria: "B/A BA/",
    baseLegal: 1,
    instituicoes: 2,
    situacao: "ATIVO",
  },
  {
    id: 2,
    cargo: "CARGO 1 abc",
    categoria: "Agentes de Administração Fazendária",
    baseLegal: 1,
    instituicoes: 1,
    situacao: "ATIVO",
  },
  {
    id: 3,
    cargo: "CARGO THAUÃ",
    categoria: "Bolsista",
    baseLegal: 0,
    instituicoes: 0,
    situacao: "ATIVO",
  },
  {
    id: 4,
    cargo: "ASSIST. TEC. DE DEFESA AGROP.",
    categoria: "Profissionais do Instituto de Defesa Agropecuario",
    baseLegal: 0,
    instituicoes: 0,
    situacao: "ATIVO",
  },
  {
    id: 5,
    cargo: "ASSISTENTE ADM. DEF. AGROPEC.",
    categoria: "Profissionais do Instituto de Defesa Agropecuario",
    baseLegal: 0,
    instituicoes: 0,
    situacao: "ATIVO",
  },
  {
    id: 6,
    cargo: "AUXILIAR SERV DEF AGROPECUARIA",
    categoria: "Profissionais do Instituto de Defesa Agropecuario",
    baseLegal: 0,
    instituicoes: 0,
    situacao: "ATIVO",
  },
  {
    id: 7,
    cargo: "TEC. DEF AGROPEC FLORESTAL - PROV",
    categoria: "Profissionais do Instituto de Defesa Agropecuario",
    baseLegal: 0,
    instituicoes: 0,
    situacao: "ATIVO",
  },
  {
    id: 8,
    cargo: "TEC. ADM. DEF. AGROPEC. FLORES - PROV",
    categoria: "Profissionais do Instituto de Defesa Agropecuario",
    baseLegal: 0,
    instituicoes: 0,
    situacao: "ATIVO",
  },
  {
    id: 9,
    cargo: "ASSIST. TEC. DE DEFESA AGROP. - PROV",
    categoria: "Profissionais do Instituto de Defesa Agropecuario",
    baseLegal: 0,
    instituicoes: 0,
    situacao: "ATIVO",
  },
  {
    id: 10,
    cargo: "ASSISTENTE ADM. DEF. AGROPEC. - PROV",
    categoria: "Profissionais do Instituto de Defesa Agropecuario",
    baseLegal: 0,
    instituicoes: 0,
    situacao: "ATIVO",
  },
  {
    id: 11,
    cargo: "ANALISTA ADMINISTRATIVO",
    categoria: "Agentes Governamentais da Cultura sss",
    baseLegal: 2,
    instituicoes: 3,
    situacao: "ENCERRADO",
  },
  {
    id: 12,
    cargo: "GESTOR GOVERNAMENTAL",
    categoria: "N/A/D",
    baseLegal: 1,
    instituicoes: 2,
    situacao: "ATIVO",
  },
];

const cargosTesteMock: CargoTesteRow[] = [
  {
    id: 1,
    codigo: "PROF_ED_BAS",
    cargo: "Professor da Educação Básica",
    categoria: "Profissionais da Educação",
    subcategoria: "Professor",
    jornadaPadrao: "30H",
    baseLegal: 1,
    instituicoes: 0,
    regrasUso: 3,
    vigencia: "01/01/2026 -",
    situacao: "ATIVO",
  },
  {
    id: 2,
    codigo: "MEDICO",
    cargo: "Médico",
    categoria: "Profissionais da Saúde",
    subcategoria: "Médico",
    jornadaPadrao: "Conforme regra",
    baseLegal: 2,
    instituicoes: 0,
    regrasUso: 2,
    vigencia: "01/03/2026 -",
    situacao: "ATIVO",
  },
  {
    id: 3,
    codigo: "TEN_BM",
    cargo: "Tenente BM",
    categoria: "Militar",
    subcategoria: "Oficial",
    jornadaPadrao: "Dedicação integral",
    baseLegal: 1,
    instituicoes: 0,
    regrasUso: 4,
    vigencia: "01/01/2026 -",
    situacao: "ATIVO",
  },
  {
    id: 4,
    codigo: "ANALISTA_ADM",
    cargo: "Analista Administrativo",
    categoria: "Profissionais da Área Meio",
    subcategoria: "Administrativo",
    jornadaPadrao: "40H",
    baseLegal: 1,
    instituicoes: 0,
    regrasUso: 1,
    vigencia: "01/01/2026 -",
    situacao: "ENCERRADO",
  },
];

const cargoRegrasUsoTesteMock = [
  {
    id: 1,
    instituicao: "GOVMT",
    orgao: "SEDUC",
    regime: "Estatutário Civil",
    tipoVinculo: "Efetivo",
    formaProvimento: "Concurso Público",
    jornada: "30H",
    situacao: "Ativo",
  },
  {
    id: 2,
    instituicao: "GOVMT",
    orgao: "Todos",
    regime: "Regime Especial",
    tipoVinculo: "Contratado",
    formaProvimento: "Processo Seletivo",
    jornada: "Conforme matriz",
    situacao: "Ativo",
  },
];

const tiposVinculoTesteMock: TipoVinculoTesteRow[] = [
  {
    id: 1,
    codigo: "EFET",
    nome: "Efetivo",
    descricao: "Vínculo decorrente de provimento efetivo em cargo público.",
    natureza: "Permanente",
    instituicao: "govmt",
    instituicoesVinculadas: 1,
    comportamentos: ["Gera vínculo", "Exige cargo", "Permite folha"],
    vigencia: "01/01/2026 -",
    situacao: "ATIVO",
  },
  {
    id: 2,
    codigo: "CONT",
    nome: "Contratado",
    descricao: "Vínculo temporário decorrente de contratação por prazo determinado.",
    natureza: "Temporário",
    instituicao: "govmt",
    instituicoesVinculadas: 1,
    comportamentos: ["Gera vínculo", "Exige cargo", "Exige data fim"],
    vigencia: "01/01/2026 -",
    situacao: "ATIVO",
  },
  {
    id: 3,
    codigo: "COM",
    nome: "Comissionado",
    descricao: "Vínculo de livre nomeação e exoneração.",
    natureza: "Comissionado",
    instituicao: "govmt",
    instituicoesVinculadas: 1,
    comportamentos: ["Gera vínculo", "Permite folha", "Permite evento"],
    vigencia: "01/01/2026 -",
    situacao: "ATIVO",
  },
  {
    id: 4,
    codigo: "APOS",
    nome: "Aposentado/Inativo",
    descricao: "Vínculo previdenciário de servidor aposentado ou inativo.",
    natureza: "Previdenciário",
    instituicao: "govmt",
    instituicoesVinculadas: 1,
    comportamentos: ["Permite folha", "Permite aposentadoria"],
    vigencia: "01/01/2026 -",
    situacao: "ATIVO",
  },
  {
    id: 5,
    codigo: "PENS",
    nome: "Pensionista",
    descricao: "Vínculo previdenciário ou especial para beneficiário de pensão.",
    natureza: "Previdenciário",
    instituicao: "govmt",
    instituicoesVinculadas: 1,
    comportamentos: ["Permite folha", "Permite pensionista"],
    vigencia: "01/01/2026 -",
    situacao: "ENCERRADO",
  },
];

const ingressosMock: IngressoRow[] = [
  {
    id: 1,
    nome: "João Silva",
    cpf: "000.000.000-00",
    matricula: "123456",
    tipoIngresso: "Concurso",
    tipoVinculo: "Efetivo",
    orgao: "SES",
    cargo: "Analista Administrativo",
    situacao: "Aguardando Analise",
    dataIngresso: "2026-01-15",
  },
  {
    id: 2,
    nome: "Maria Souza",
    cpf: "111.111.111-11",
    matricula: "654321",
    tipoIngresso: "Processo Seletivo",
    tipoVinculo: "Temporário",
    orgao: "SEDUC",
    cargo: "Professor",
    situacao: "Aguardando Analise",
    dataIngresso: "2026-02-03",
  },
  {
    id: 3,
    nome: "Carlos Pereira",
    cpf: "222.222.222-22",
    matricula: "789012",
    tipoIngresso: "Nomeação",
    tipoVinculo: "Comissionado",
    orgao: "SEPLAG",
    cargo: "Assessor Técnico",
    situacao: "Em analise",
    dataIngresso: "2026-03-20",
  },
  {
    id: 4,
    nome: "Ana Costa",
    cpf: "333.333.333-33",
    matricula: "345678",
    tipoIngresso: "Reintegração",
    tipoVinculo: "Efetivo",
    orgao: "SEFAZ",
    cargo: "Gestor Governamental",
    situacao: "Posse Suspensa",
    dataIngresso: "2026-04-08",
  },
  {
    id: 5,
    nome: "Fernanda Rocha",
    cpf: "444.444.444-44",
    matricula: "456789",
    tipoIngresso: "Concurso",
    tipoVinculo: "Efetivo",
    orgao: "SES",
    cargo: "Analista Administrativo",
    situacao: "Aguardando Efetivo Exercicio",
    dataIngresso: "2026-01-18",
  },
  {
    id: 6,
    nome: "Rafael Martins",
    cpf: "555.555.555-55",
    matricula: "567890",
    tipoIngresso: "Processo Seletivo",
    tipoVinculo: "Temporário",
    orgao: "SEDUC",
    cargo: "Professor",
    situacao: "Tornado sem efeito",
    dataIngresso: "2026-02-05",
  },
  {
    id: 7,
    nome: "Bruno Almeida",
    cpf: "666.666.666-66",
    matricula: "678901",
    tipoIngresso: "Concurso",
    tipoVinculo: "Efetivo",
    orgao: "SEFAZ",
    cargo: "Gestor Governamental",
    situacao: "Posse Negada",
    dataIngresso: "2026-04-10",
  },
  {
    id: 8,
    nome: "Luciana Freitas",
    cpf: "777.777.777-77",
    matricula: "789123",
    tipoIngresso: "Concurso",
    tipoVinculo: "Efetivo",
    orgao: "SEDUC",
    cargo: "Professor",
    situacao: "Ingresso Concluído",
    dataIngresso: "2026-01-22",
  },
  {
    id: 9,
    nome: "Marcos Vinícius",
    cpf: "888.888.888-88",
    matricula: "891234",
    tipoIngresso: "Concurso",
    tipoVinculo: "Efetivo",
    orgao: "SEDUC",
    cargo: "Técnico Administrativo Educacional",
    situacao: "Em analise",
    dataIngresso: "2026-01-25",
  },
  {
    id: 10,
    nome: "Patrícia Nunes",
    cpf: "999.999.999-99",
    matricula: "912345",
    tipoIngresso: "Processo Seletivo",
    tipoVinculo: "Temporário",
    orgao: "SES",
    cargo: "Enfermeiro",
    situacao: "Aguardando Analise",
    dataIngresso: "2026-02-08",
  },
  {
    id: 11,
    nome: "Diego Campos",
    cpf: "123.123.123-12",
    matricula: "123789",
    tipoIngresso: "Processo Seletivo",
    tipoVinculo: "Temporário",
    orgao: "SES",
    cargo: "Técnico de Enfermagem",
    situacao: "Em analise",
    dataIngresso: "2026-02-10",
  },
  {
    id: 12,
    nome: "Camila Teixeira",
    cpf: "234.234.234-23",
    matricula: "234890",
    tipoIngresso: "Processo Seletivo",
    tipoVinculo: "Temporário",
    orgao: "SEFAZ",
    cargo: "Analista Fazendário",
    situacao: "Aguardando Analise",
    dataIngresso: "2026-02-14",
  },
  {
    id: 13,
    nome: "Henrique Lopes",
    cpf: "345.345.345-34",
    matricula: "345901",
    tipoIngresso: "Processo Seletivo",
    tipoVinculo: "Temporário",
    orgao: "SEFAZ",
    cargo: "Analista Fazendário",
    situacao: "Aguardando Analise",
    dataIngresso: "2026-02-16",
  },

  {
    id: 14,
    nome: "Renata Lima",
    cpf: "456.456.456-45",
    matricula: "456012",
    tipoIngresso: "Concurso",
    tipoVinculo: "Efetivo",
    orgao: "SES",
    cargo: "Analista Administrativo",
    situacao: "Aguardando Analise",
    dataIngresso: "2026-02-18",
  },
];

const getNumeroIngresso = (ingressoId: number) => `Ingresso nº 2026/${String(ingressoId).padStart(4, "0")}`;

const formatarDataHoraHistoricoIngresso = (dataIso: string, hora: string) => {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano} ${hora}`;
};

const criarHistoricoEtapaIngresso = (
  id: number,
  ingresso: IngressoRow,
  etapa: string,
  hora: string,
  operador: string,
  resultado: IngressoHistoricoEtapaRow["resultado"],
  detalhes?: Pick<IngressoHistoricoEtapaRow, "parecer" | "observacao">,
): IngressoHistoricoEtapaRow => ({
  id,
  ingressoId: ingresso.id,
  etapa,
  dataHora: formatarDataHoraHistoricoIngresso(ingresso.dataIngresso, hora),
  operador,
  resultado,
  ...detalhes,
});

const getAnaliseProvimentoHistoricoDetalhes = (
  situacaoAtual: IngressoSituacao,
): Pick<IngressoHistoricoEtapaRow, "parecer" | "observacao"> => {
  if (situacaoAtual === "Posse Negada") {
    return {
      parecer: "Posse reprovada",
      observacao: "Candidato não atendeu aos requisitos obrigatórios para posse.",
    };
  }

  if (situacaoAtual === "Posse Suspensa") {
    return {
      parecer: "Posse suspensa",
      observacao: "Prazo de posse suspenso para complementação e nova conferência documental.",
    };
  }

  if (situacaoAtual === "Tornado sem efeito") {
    return {
      parecer: "Tornado sem efeito",
      observacao: "Ingresso tornado sem efeito após análise administrativa.",
    };
  }

  if (situacaoAtual === "Aguardando Analise") {
    return { parecer: "Pendente de análise" };
  }

  if (situacaoAtual === "Em analise") {
    return { parecer: "Em análise" };
  }

  return {
    parecer: "Posse aprovada",
    observacao: "Documentação conferida e requisitos validados pelo provimento.",
  };
};

const getHistoricoIngressoMock = (
  ingresso: IngressoRow,
  situacaoAtual: IngressoSituacao,
): IngressoHistoricoEtapaRow[] => {
  const resultadoSolicitacao: IngressoHistoricoEtapaRow["resultado"] =
    situacaoAtual === "Aguardando Analise" ? "Pendente" : "Apto";
  const resultadoAnalise: IngressoHistoricoEtapaRow["resultado"] =
    situacaoAtual === "Aguardando Analise" || situacaoAtual === "Em analise"
      ? "Pendente"
      : situacaoAtual === "Posse Negada"
        ? "Negado"
        : situacaoAtual === "Tornado sem efeito"
          ? "Tornado sem efeito"
          : situacaoAtual === "Posse Suspensa"
            ? "Suspenso"
            : "Apto";
  const resultadoPosse: IngressoHistoricoEtapaRow["resultado"] =
    ["Aguardando Efetivo Exercicio", "Ingresso Concluído"].includes(situacaoAtual)
      ? "Apto"
      : situacaoAtual === "Posse Negada"
        ? "Negado"
        : "Pendente";
  const resultadoEfetivoExercicio: IngressoHistoricoEtapaRow["resultado"] =
    situacaoAtual === "Ingresso Concluído" ? "Apto" : "Pendente";
  const analiseProvimentoDetalhes = getAnaliseProvimentoHistoricoDetalhes(situacaoAtual);

  const etapas = [
    criarHistoricoEtapaIngresso(1, ingresso, "Ingresso", "08:15", "Roberto Junior - Provimento", resultadoSolicitacao),
    criarHistoricoEtapaIngresso(2, ingresso, "Documentação", "09:20", "Roberto Junior - Provimento", resultadoAnalise),
    criarHistoricoEtapaIngresso(3, ingresso, "Análise do Provimento", "10:40", "Roberto Junior - Provimento", resultadoAnalise, analiseProvimentoDetalhes),
  ];

  if (situacaoAtual === "Ingresso Concluído") {
    etapas.push(
      criarHistoricoEtapaIngresso(4, ingresso, "Efetivo Exercicio", "16:05", "Patrícia Lima - Setorial", resultadoEfetivoExercicio),
    );
  }

  return etapas;
};

const getResultadoHistoricoIngressoBadge = (resultado: IngressoHistoricoEtapaRow["resultado"]) => {
  if (resultado === "Apto") return { color: "#00843d", bg: "#e2f3e8" };
  if (resultado === "Negado") return { color: "#b42318", bg: "#fee4e2" };
  if (resultado === "Suspenso") return { color: "#9a5a00", bg: "#fff0c7" };
  if (resultado === "Tornado sem efeito") return { color: "#6b7280", bg: "#f3f4f6" };

  return { color: "#8a5a00", bg: "#fff4d6" };
};
const ingressoConcursosProcessosMock: IngressoConcursoProcessoRow[] = [
  {
    id: 1,
    titulo: "Concurso SES 2026",
    tipo: "Concurso",
    orgao: "SES",
    edital: "Edital 001/2026",
    candidatos: [
      {
        id: 1,
        nome: "João Silva",
        classificacao: "1º",
        cargo: "Analista Administrativo",
        tipoVaga: "AC",
        dataNomeacao: "13/07/2026",
        dataPosse: "30/07/2026",
        dataEfetivoExercicio: "15/08/2026",
      },
      {
        id: 2,
        nome: "Maria Souza",
        classificacao: "2º",
        cargo: "Professor",
        tipoVaga: "AC",
        dataNomeacao: "13/07/2026",
        dataPosse: "18/07/2026",
        dataEfetivoExercicio: "01/08/2026",
      },
      {
        id: 3,
        nome: "Carlos Pereira",
        classificacao: "3º",
        cargo: "Analista Administrativo",
        tipoVaga: "AC",
        dataNomeacao: "01/06/2026",
        dataPosse: "20/06/2026",
        dataEfetivoExercicio: "-",
      },
      {
        id: 4,
        nome: "Ana Costa",
        classificacao: "4º",
        cargo: "Analista Administrativo",
        tipoVaga: "AC",
        dataNomeacao: "14/07/2026",
        dataPosse: "22/07/2026",
        dataEfetivoExercicio: "01/08/2026",
      },
      {
        id: 5,
        nome: "Fernanda Rocha",
        classificacao: "2º",
        cargo: "Analista Administrativo",
        tipoVaga: "AC",
        dataNomeacao: "15/07/2026",
        dataPosse: "01/08/2026",
        dataEfetivoExercicio: "-",
      },
      {
        id: 6,
        nome: "Rafael Martins",
        classificacao: "6º",
        cargo: "Analista Administrativo",
        tipoVaga: "AC",
        dataNomeacao: "01/06/2026",
        dataPosse: "05/07/2026",
        dataEfetivoExercicio: "-",
      },
      {
        id: 7,
        nome: "Bruno Almeida",
        classificacao: "7º",
        cargo: "Analista Administrativo",
        tipoVaga: "AC",
        dataNomeacao: "16/07/2026",
        dataPosse: "05/08/2026",
        dataEfetivoExercicio: "-",
      },
      {
        id: 8,
        nome: "Luciana Freitas",
        classificacao: "8º",
        cargo: "Analista Administrativo",
        tipoVaga: "AC",
        dataNomeacao: "16/07/2026",
        dataPosse: "05/08/2026",
        dataEfetivoExercicio: "-",
      },

      {
        id: 14,
        nome: "Renata Lima",
        classificacao: "9º",
        cargo: "Analista Administrativo",
        tipoVaga: "AC",
        dataNomeacao: "17/07/2026",
        dataPosse: "06/08/2026",
        dataEfetivoExercicio: "-",
      },
    ],
  },
  {
    id: 2,
    titulo: "Concurso SEDUC 2026",
    tipo: "Concurso",
    orgao: "SEDUC",
    edital: "Edital 002/2026",
    candidatos: [
      {
        id: 8,
        nome: "Luciana Freitas",
        classificacao: "1º",
        cargo: "Professor",
        tipoVaga: "AC",
        dataNomeacao: "16/07/2026",
        dataPosse: "05/08/2026",
        dataEfetivoExercicio: "-",
      },
      {
        id: 9,
        nome: "Marcos Vinícius",
        classificacao: "2º",
        cargo: "Técnico Administrativo Educacional",
        tipoVaga: "PCD",
        dataNomeacao: "17/07/2026",
        dataPosse: "06/08/2026",
        dataEfetivoExercicio: "-",
      },
    ],
  },
  {
    id: 3,
    titulo: "Concurso SEFAZ 2026",
    tipo: "Concurso",
    orgao: "SEFAZ",
    edital: "Edital 003/2026",
    candidatos: [
      {
        id: 4,
        nome: "Ana Costa",
        classificacao: "1º",
        cargo: "Gestor Governamental",
        tipoVaga: "AC",
        dataNomeacao: "14/07/2026",
        dataPosse: "22/07/2026",
        dataEfetivoExercicio: "01/08/2026",
      },
      {
        id: 7,
        nome: "Bruno Almeida",
        classificacao: "4º",
        cargo: "Gestor Governamental",
        tipoVaga: "AC",
        dataNomeacao: "16/07/2026",
        dataPosse: "05/08/2026",
        dataEfetivoExercicio: "-",
      },
    ],
  },
  {
    id: 4,
    titulo: "Processo Seletivo SES 2026",
    tipo: "Processo Seletivo",
    orgao: "SES",
    edital: "Edital 004/2026",
    candidatos: [
      {
        id: 10,
        nome: "Patrícia Nunes",
        classificacao: "1º",
        cargo: "Enfermeiro",
        tipoVaga: "AC",
        dataNomeacao: "18/07/2026",
        dataPosse: "10/08/2026",
        dataEfetivoExercicio: "-",
      },
      {
        id: 11,
        nome: "Diego Campos",
        classificacao: "5º",
        cargo: "Técnico de Enfermagem",
        tipoVaga: "PCD",
        dataNomeacao: "18/07/2026",
        dataPosse: "07/08/2026",
        dataEfetivoExercicio: "-",
      },
    ],
  },
  {
    id: 5,
    titulo: "Processo Seletivo SEDUC 2026",
    tipo: "Processo Seletivo",
    orgao: "SEDUC",
    edital: "Edital 005/2026",
    candidatos: [
      {
        id: 2,
        nome: "Maria Souza",
        classificacao: "1º",
        cargo: "Professor",
        tipoVaga: "AC",
        dataNomeacao: "13/07/2026",
        dataPosse: "18/07/2026",
        dataEfetivoExercicio: "01/08/2026",
      },
      {
        id: 6,
        nome: "Rafael Martins",
        classificacao: "3º",
        cargo: "Professor",
        tipoVaga: "PCD",
        dataNomeacao: "15/07/2026",
        dataPosse: "04/08/2026",
        dataEfetivoExercicio: "-",
      },
    ],
  },
  {
    id: 6,
    titulo: "Processo Seletivo SEFAZ 2026",
    tipo: "Processo Seletivo",
    orgao: "SEFAZ",
    edital: "Edital 006/2026",
    candidatos: [
      {
        id: 12,
        nome: "Camila Teixeira",
        classificacao: "2º",
        cargo: "Analista Fazendário",
        tipoVaga: "PPP",
        dataNomeacao: "19/07/2026",
        dataPosse: "12/08/2026",
        dataEfetivoExercicio: "-",
      },
      {
        id: 13,
        nome: "Henrique Lopes",
        classificacao: "6º",
        cargo: "Analista Fazendário",
        tipoVaga: "PCD",
        dataNomeacao: "19/07/2026",
        dataPosse: "08/08/2026",
        dataEfetivoExercicio: "-",
      },
    ],
  },
];

const ingressoPoloCandidatoMap: Record<number, string> = {
  1: "Cuiabá",
  2: "Cuiabá",
  3: "Cuiabá",
  4: "Cuiabá",
  5: "Cuiabá",
  6: "Cuiabá",
  7: "Cuiabá",
  8: "Cuiabá",
  9: "Sinop",
  10: "Cuiabá",
  11: "Várzea Grande",
  12: "Cuiabá",
  13: "Rondonópolis",
};

const getPoloCandidatoIngresso = (candidatoId: number) =>
  ingressoPoloCandidatoMap[candidatoId] ?? "Cuiabá";

const getPerfilEspecialidadeIngresso = (cargo: string) => {
  const especialidades: Record<string, string> = {
    "Analista Administrativo": "Gestão de Pessoas",
    Professor: "Educação Básica",
    "Assessor Técnico": "Assessoramento Técnico",
    "Gestor Governamental": "Gestão Pública",
    "Técnico Administrativo Educacional": "Administração Escolar",
    Enfermeiro: "Saúde Assistencial",
    "Técnico de Enfermagem": "Saúde Assistencial",
    "Analista Fazendário": "Administração Tributária",
  };

  return especialidades[cargo] ?? "Área administrativa";
};

const getTipoVagaIngressoBadge = (tipoVaga: IngressoCandidatoRow["tipoVaga"]) => {
  if (tipoVaga === "PCD") {
    return { color: "#334e9f", bg: "#e8edff" };
  }

  if (tipoVaga === "PPP") {
    return { color: "#7c2d12", bg: "#ffedd5" };
  }

  return { color: "#52616b", bg: "#eef2f6" };
};

const agruparCandidatosIngressoPorVaga = (
  candidatos: IngressoCandidatoRow[],
): IngressoCandidatoGrupoRow[] => {
  const grupos = new Map<string, IngressoCandidatoGrupoRow>();

  candidatos.forEach((candidato) => {
    const polo = getPoloCandidatoIngresso(candidato.id);
    const id = `${candidato.cargo}|${polo}|${candidato.tipoVaga}`;
    const grupoExistente = grupos.get(id);

    if (grupoExistente) {
      grupoExistente.candidatos.push(candidato);
      return;
    }

    grupos.set(id, {
      id,
      vagaEspecialidade: candidato.cargo,
      perfilEspecialidade: getPerfilEspecialidadeIngresso(candidato.cargo),
      polo,
      classificacao: candidato.tipoVaga,
      candidatos: [candidato],
    });
  });

  return Array.from(grupos.values());
};
const ingressoTipoVinculoMap: Record<IngressoTipo, string> = {
  Concurso: "Efetivo",
  "Processo Seletivo": "Temporário",
  Nomeação: "Comissionado",
  "Exclusivo Comissionado": "Comissionado",
  "Residente Técnico": "Residente",
  Estagiário: "Estagiário",
};

const ingressoTipoRadioOptions: { label: string; value: IngressoTipo }[] = [
  { label: "Concurso", value: "Concurso" },
  { label: "Processo Seletivo", value: "Processo Seletivo" },
  { label: "Nomeação", value: "Nomeação" },
];

const ingressoImportacaoPreview = [
  {
    id: 1,
    nome: "João Silva",
    cpf: "000.000.000-00",
    classificacao: "1º",
    tipoVaga: "Ampla",
    email: "joao@email.com",
    situacao: "Válido",
  },
  {
    id: 2,
    nome: "Ana Lima",
    cpf: "111.111.111-11",
    classificacao: "2º",
    tipoVaga: "PCD",
    email: "ana@email.com",
    situacao: "Válido",
  },
];

const pessoasFisicasIngressoMock = [
  {
    cpf: "000.000.000-00",
    nome: "João Silva",
    dataNascimento: "10/02/1990",
  },
  {
    cpf: "111.111.111-11",
    nome: "Maria Souza",
    dataNascimento: "18/06/1992",
  },
  { cpf: "333.333.333-33", nome: "Ana Costa", dataNascimento: "22/09/1988" },
  { cpf: "444.444.444-44", nome: "Fernanda Rocha", dataNascimento: "05/03/1991" },
  { cpf: "555.555.555-55", nome: "Rafael Martins", dataNascimento: "14/11/1989" },
  { cpf: "666.666.666-66", nome: "Bruno Almeida", dataNascimento: "27/07/1990" },
  { cpf: "777.777.777-77", nome: "Luciana Freitas", dataNascimento: "09/01/1993" },
  { cpf: "888.888.888-88", nome: "Marcos Vinícius", dataNascimento: "30/05/1987" },
  { cpf: "999.999.999-99", nome: "Patrícia Nunes", dataNascimento: "16/08/1994" },
  { cpf: "123.123.123-12", nome: "Diego Campos", dataNascimento: "11/12/1990" },
  { cpf: "234.234.234-23", nome: "Camila Teixeira", dataNascimento: "24/04/1992" },
  { cpf: "345.345.345-34", nome: "Henrique Lopes", dataNascimento: "02/10/1986" },
];

const ingressoDocumentosMock = [
  {
    documento: "RG",
    obrigatorio: "Sim",
    situacao: "Enviado",
    arquivo: "rg_joao_silva.pdf",
    observacao: "-",
    acao: "Analisar",
  },
  {
    documento: "CPF",
    obrigatorio: "Sim",
    situacao: "Aprovado",
    arquivo: "cpf_joao_silva.pdf",
    observacao: "-",
    acao: "Ver",
  },
  {
    documento: "Diploma",
    obrigatorio: "Sim",
    situacao: "Pendente",
    arquivo: "-",
    observacao: "-",
    acao: "Solicitar",
  },
  {
    documento: "Certidão",
    obrigatorio: "Sim",
    situacao: "Correção Solicitada",
    arquivo: "certidao_joao_silva.pdf",
    observacao: "Ilegível",
    acao: "Reanalisar",
  },
];

const criarDocumentoObrigatorioIngresso = (
  documento: string,
  obrigatorio = "Sim",
  situacao = "Pendente",
  arquivo = "-",
) => ({
  documento,
  obrigatorio,
  situacao,
  arquivo,
});

const ingressoDocumentacaoObrigatoriaMock = [
  criarDocumentoObrigatorioIngresso(
    "1.1 - RG (Registro Geral) ou carteira de identidade nacional (CIN)",
    "Sim",
    "Enviado",
    "rg_cin.pdf",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.2 - CPF (Cadastro de Pessoa Física)",
    "Sim",
    "Enviado",
    "cpf.pdf",
  ),
  criarDocumentoObrigatorioIngresso("1.3 - PIS ou PASEP, com data e ano de emissão"),
  criarDocumentoObrigatorioIngresso(
    "1.4 - Carteira de Trabalho e Previdência Social - CTPS ou Carteira de Trabalho Digital",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.5 - Título Eleitoral",
    "Sim",
    "Enviado",
    "titulo_eleitoral.pdf",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.6 - Certidão de Nascimento ou de Casamento ou Sentença Declaratória de União Estável ou Escritura Pública de União Estável",
  ),
  criarDocumentoObrigatorioIngresso("1.7 - Certidão de Nascimento dos dependentes", "Condicional"),
  criarDocumentoObrigatorioIngresso(
    "1.8 - Documento de quitação com o serviço militar, certificado de desobrigação militar expedido pelo exército para homens com mais de 45 anos, informando o número do certificado de reservista ou documento previsto na Lei nº 4.375/1964",
    "Condicional",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.9 - Comprovante de endereço atual, com data de emissão nos últimos 3 meses",
    "Sim",
    "Enviado",
    "comprovante_endereco.pdf",
  ),
  criarDocumentoObrigatorioIngresso("1.10 - Comprovante de conta ativa no Banco do Brasil"),
  criarDocumentoObrigatorioIngresso("1.11 - Laudo Médico Pericial - LPM expedido pelo Mato Grosso Previdência - MTPrev"),
  criarDocumentoObrigatorioIngresso(
    "1.12 - Certidão de Quitação Eleitoral, expedida nos últimos 30 dias pela Justiça Eleitoral, emitida pela internet no site do TSE",
    "Sim",
    "Enviado",
    "certidao_quitacao_eleitoral.pdf",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.13 - Certidão Criminal da Justiça Federal dos lugares onde tenha residido nos últimos 5 anos, alcançando 1º e 2º graus",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.14 - Certidão Criminal da Justiça Estadual dos lugares onde tenha residido nos últimos 5 anos, alcançando 1º e 2º graus",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.15 - Certidão de Vínculo Funcional Municipal do domicílio do candidato, com descrição da jornada de trabalho e carga horária caso possua vínculo",
    "Condicional",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.16 - Certidão Específica da Junta Comercial dos estados de domicílio onde tenha residido nos últimos 5 anos, de não participação em gerência/administração de empresa privada ou sociedade civil, ou exercício de comércio com transação com o Estado",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.17 - Diploma na área de atuação exigida no Edital, reconhecido pelo MEC ou emitido por instituição credenciada, acompanhado de histórico escolar",
    "Sim",
    "Enviado",
    "diploma_historico.pdf",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.18 - Comprovante de Regularidade da Qualificação Cadastral, sem divergência, emitido no portal do eSocial",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.19 - 01 (uma) foto recente 3x4",
    "Sim",
    "Enviado",
    "foto_3x4.jpg",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.20 - Comprovante do pedido de vacância ou exoneração devidamente protocolado, caso seja servidor público em cargo inacumulável",
    "Condicional",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.21 - Declaração de Tempo de Serviço no Poder Executivo Estadual de Mato Grosso, para complementação de período aquisitivo no novo cargo efetivo ou usufruto de licença-prêmio e férias, se for o caso",
    "Condicional",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.22 - Ficha de inscrição no Plano de Benefícios do Regime de Previdência Complementar ou Declaração Própria de manutenção no regime atual",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.23 - Formulário de Adesão ao Instituto de Assistência à Saúde dos Servidores do Estado de Mato Grosso - Mato Grosso Saúde",
    "Condicional",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.24 - Declaração de não ocupar ou receber proventos de aposentadoria de cargo, emprego ou função pública, ressalvados os cargos acumuláveis previstos na CF/88",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.25 - Declaração de não ter sofrido penalidade incompatível com a nova investidura em cargo público",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.26 - Última declaração de bens apresentada à Receita Federal ou formulário padronizado disponibilizado",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.27 - Termo de Compromisso de acatamento e observância das regras estabelecidas no Código de Ética Funcional",
  ),
  criarDocumentoObrigatorioIngresso(
    "1.28 - Declaração de não participação em gerência ou administração de empresa privada, sociedade civil ou exercício de comércio com transação com o Estado",
  ),
  criarDocumentoObrigatorioIngresso("1.29 - Formulário de ingresso no Sistema SEAP"),
  criarDocumentoObrigatorioIngresso("1.30 - Outros formulários ou declarações a serem preenchidos pelo candidato", "Condicional"),
  criarDocumentoObrigatorioIngresso("2.2 - Certidão comprobatória de registro no respectivo Conselho de Classe, se for o caso", "Condicional"),
  criarDocumentoObrigatorioIngresso(
    "2.3 - Declaração do Conselho de Classe Profissional de não estar cumprindo penalidade que impeça, ainda que temporariamente, o exercício da profissão",
    "Condicional",
  ),
  criarDocumentoObrigatorioIngresso(
    "2.4 - Certidão de quitação com as demais exigências legais do órgão fiscalizador do exercício profissional",
    "Condicional",
  ),
  criarDocumentoObrigatorioIngresso(
    "2.5 - Diploma de ensino superior reconhecido pelo MEC, na área exigida no Edital, com registro no e-MEC, acompanhado de histórico escolar",
    "Condicional",
  ),
  criarDocumentoObrigatorioIngresso(
    "2.6 - Certificado ou diploma de pós-graduação reconhecido pelo MEC, se exigido no Edital, com registro no e-MEC ou na CAPES/Sucupira, acompanhado de histórico escolar",
    "Condicional",
  ),
  criarDocumentoObrigatorioIngresso("3.2 - Carteira Nacional de Habilitação - CNH, categorias B, C ou D", "Condicional"),
  criarDocumentoObrigatorioIngresso("4.2 - Carteira Nacional de Habilitação - CNH, categoria D", "Condicional"),
];

const ingressoDocumentosGeradosMock = [
  {
    documento: "Checklist de documentos recebidos",
    origem: "Análise do Provimento",
    situacao: "Gerado",
    arquivo: "checklist_documentos_recebidos.pdf",
  },
  {
    documento: "Termo de Posse",
    origem: "Formalização",
    situacao: "Gerado",
    arquivo: "termo_posse.pdf",
  },
  {
    documento: "Termo de Encaminhamento",
    origem: "Formalização",
    situacao: "Gerado",
    arquivo: "termo_encaminhamento.pdf",
  },
  {
    documento: "Termo de Suspensão",
    origem: "Parecer do Provimento",
    situacao: "Gerado quando houver suspensão",
    arquivo: "termo_suspensao.pdf",
  },
  {
    documento: "Termo de Negativa de Posse",
    origem: "Parecer do Provimento",
    situacao: "Gerado quando houver negativa",
    arquivo: "termo_negativa_posse.pdf",
  },
];

const getIngressoDocumentoStatusClass = (situacao: string) => {
  if (situacao === "Validado") return "prototype-ingresso-doc-status--validado";
  if (situacao === "Enviado") return "prototype-ingresso-doc-status--enviado";
  return "prototype-ingresso-doc-status--pendente";
};

const ingressoDetalheTabs: TabItemSeplag<IngressoDetalheTab>[] = [
  { label: "Dados Básicos", value: "dados-basicos", col: "lg:col-3" },
  { label: "Documentação", value: "documentacao", col: "lg:col-3" },
  { label: "Validações", value: "validacoes", col: "lg:col-3" },
  { label: "Formalização", value: "formalizacao", col: "lg:col-3" },
  { label: "Exercício/Início", value: "exercicio", col: "lg:col-3" },
  { label: "Vínculo", value: "vinculo", col: "lg:col-3" },
  { label: "Prestação de Contas", value: "prestacao-contas", col: "lg:col-3" },
  { label: "Histórico", value: "historico", col: "lg:col-3" },
];

const novoIngressoTabs: TabItemSeplag<NovoIngressoTab>[] = [
  { label: "Ingresso", value: "tipo-ingresso", col: "lg:col-6" },
  { label: "Documentação", value: "documentacao", col: "lg:col-6" },
];

const novoIngressoConcursoSteps: TabItemSeplag<NovoIngressoTab>[] = [
  { label: "Ingresso", value: "tipo-ingresso", col: "lg:col-3" },
  { label: "Documentação", value: "documentacao", col: "lg:col-3" },
  { label: "Análise do Provimento", value: "analise-provimento", col: "lg:col-3" },
  { label: "Efetivo Exercício", value: "efetivo-exercicio", col: "lg:col-3" },
];

const matrizValidacaoTesteMock: MatrizValidacaoTesteRow[] = [
  {
    id: 1,
    instituicao: "GOVMT",
    orgao: "SEDUC",
    setor: "Todos",
    regimeJuridico: "Estatutário Civil",
    tipoVinculo: "Efetivo",
    categoria: "Profissionais da Educação",
    subcategoria: "Professor",
    cargo: "Professor da Educação Básica",
    formaProvimento: "Concurso Público",
    jornada: "30H",
    vigencia: "01/01/2026 -",
    situacao: "ATIVO",
    especificidade: "Por cargo",
  },
  {
    id: 2,
    instituicao: "GOVMT",
    orgao: "SES",
    setor: "Todos",
    regimeJuridico: "Regime Especial",
    tipoVinculo: "Contratado",
    categoria: "Profissionais da Saúde",
    subcategoria: "Médico",
    cargo: "Médico",
    formaProvimento: "Processo Seletivo",
    jornada: "Plantão",
    vigencia: "01/03/2026 -",
    situacao: "ATIVO",
    especificidade: "Por cargo",
  },
  {
    id: 3,
    instituicao: "GOVMT",
    orgao: "CBMMT",
    setor: "Todos",
    regimeJuridico: "Estatutário Militar",
    tipoVinculo: "Efetivo",
    categoria: "Militar",
    subcategoria: "Oficial",
    cargo: "Todos",
    formaProvimento: "Concurso Público",
    jornada: "Dedicação integral",
    vigencia: "01/01/2026 -",
    situacao: "ATIVO",
    especificidade: "Por órgão",
  },
  {
    id: 4,
    instituicao: "GOVMT",
    orgao: "Todos",
    setor: "Todos",
    regimeJuridico: "Estatutário Civil",
    tipoVinculo: "Efetivo",
    categoria: "Profissionais da Área Meio",
    subcategoria: "Todos",
    cargo: "Todos",
    formaProvimento: "Todos",
    jornada: "Todos",
    vigencia: "01/01/2026 -",
    situacao: "ENCERRADO",
    especificidade: "Genérica",
  },
];

const regimesJuridicosMock: RegimeJuridicoRow[] = [
  {
    id: 1,
    nome: "ESTATUTARIO CIVIL",
    descricao: "Estatutário Civil",
    instituicao: "govmt",
    instituicoesVinculadas: 1,
    situacao: STATUS_OPERACIONAL_VIGENCIA.AGENDADO,
  },
  {
    id: 2,
    nome: "ESTATUTARIO MILITAR",
    descricao: "Estatutário Militar",
    instituicao: "govmt",
    instituicoesVinculadas: 3,
    situacao: "ATIVO",
  },
  {
    id: 3,
    nome: "MILITAR TEMPORARIO",
    descricao: "Militar Temporário",
    instituicao: "govmt",
    instituicoesVinculadas: 2,
    situacao: STATUS_OPERACIONAL_VIGENCIA.AGENDADO_ENCERRAMENTO,
  },
  {
    id: 4,
    nome: "REGIME CELETISTA",
    descricao: "Regime Celetista",
    instituicao: "govmt",
    instituicoesVinculadas: 1,
    situacao: STATUS_OPERACIONAL_VIGENCIA.ENCERRADO,
  },
  {
    id: 5,
    nome: "REGIME ESPECIAL",
    descricao: "Regime Especial(Contrato Temporário)",
    instituicao: "govmt",
    instituicoesVinculadas: 1,
    situacao: STATUS_OPERACIONAL_VIGENCIA.AGENDADO_EXTINCAO,
  },
  {
    id: 6,
    nome: "REGIME MISTO",
    descricao: "Regime Misto(Comissionados)",
    instituicao: "govmt",
    instituicoesVinculadas: 1,
    situacao: STATUS_OPERACIONAL_VIGENCIA.EXTINTO,
  },
];

const gruposEleitosMock: GrupoEleitosRow[] = [
  {
    id: 81,
    descricao: "PESSOA FÍSICA",
    situacao: "ATIVO",
    quantidadeEleitos: 0,
  },
  {
    id: 79,
    descricao: "abc123",
    situacao: "ATIVO",
    quantidadeEleitos: 0,
  },
  {
    id: 80,
    descricao:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas minima reprehenderit cupiditate tempore. Commodi dignissimos ad impedit repellendus consequatur aliquam cumque magnam saepe vero dolor acc",
    situacao: "ENCERRADO",
    quantidadeEleitos: 0,
  },
  {
    id: 77,
    descricao: "Grupo Teste",
    situacao: "ATIVO",
    quantidadeEleitos: 0,
  },
  {
    id: 75,
    descricao: "TESTE",
    situacao: "RASCUNHO",
    quantidadeEleitos: 0,
  },
  {
    id: 76,
    descricao: "TESTE",
    situacao: "ENCERRADO",
    quantidadeEleitos: 0,
  },
  {
    id: 74,
    descricao: "Teste 24/04/2026",
    situacao: STATUS_OPERACIONAL_VIGENCIA.EXTINTO,
    quantidadeEleitos: 0,
  },
];

const regimesJuridicosTesteMock: RegimeJuridicoTesteRow[] = [
  {
    id: 1,
    codigo: "EST_CIVIL",
    nome: "Estatutário Civil",
    descricao: "Servidores civis estatutários da Administração Pública.",
    instituicao: "govmt",
    instituicoesVinculadas: 1,
    vigencia: "01/01/2026 -",
    situacao: "ATIVO",
  },
  {
    id: 2,
    codigo: "EST_MIL",
    nome: "Estatutário Militar",
    descricao: "Militares estaduais regidos por estatuto próprio.",
    instituicao: "govmt",
    instituicoesVinculadas: 2,
    vigencia: "01/01/2026 -",
    situacao: STATUS_OPERACIONAL_VIGENCIA.ATIVO,
  },
  {
    id: 3,
    codigo: "TEMP_MIL",
    nome: "Militar Temporário",
    descricao: "Militares temporários com vínculo por tempo determinado.",
    instituicao: "govmt",
    instituicoesVinculadas: 2,
    vigencia: "01/01/2026 -",
    situacao: "ENCERRADO",
  },
  {
    id: 4,
    codigo: "CLT",
    nome: "Regime Celetista",
    descricao: "Empregados públicos regidos pela CLT.",
    instituicao: "mti",
    instituicoesVinculadas: 3,
    vigencia: "01/01/2026 -",
    situacao: "ATIVO",
  },
  {
    id: 5,
    codigo: "REG_ESP",
    nome: "Regime Especial",
    descricao: "Contratos temporários e hipóteses especiais previstas em lei.",
    instituicao: "govmt",
    instituicoesVinculadas: 1,
    vigencia: "01/03/2026 -",
    situacao: "RASCUNHO",
  },
];

const folhaPagamentoSituacaoOptions: {
  label: string;
  value: FolhaPagamentoSituacao | "";
}[] = [
  { label: "Todas", value: "" },
  { label: "Rascunho", value: "RASCUNHO" },
  { label: "Aberto", value: "ABERTO" },
  { label: "Aguardando processamento", value: "AGUARDANDO_PROCESSAMENTO" },
  { label: "Em processamento", value: "EM_PROCESSAMENTO" },
  { label: "Processado com sucesso", value: "PROCESSO_COM_SUCESSO" },
  { label: "Processado com erro", value: "PROCESSO_COM_ERRO" },
];

const processamentoFolhaSituacaoOptions: {
  label: string;
  value: FolhaPagamentoExecucaoSituacao | "";
}[] = [
  { label: "Todas", value: "" },
  { label: "Em Fila", value: "EM_FILA" },
  { label: "Em Processamento", value: "EM_PROCESSAMENTO" },
  { label: "Processado com Sucesso", value: "CONCLUIDA" },
  { label: "Processado com Erro", value: "CONCLUIDA_COM_ERRO" },
  { label: "Cancelado", value: "CANCELADA" },
];

const processamentoFolhaTipoOptions = [
  { label: "Todos", value: "" },
  { label: "Total", value: "TOTAL" },
  { label: "Parcial", value: "PARCIAL" },
];

const folhaCompetenciaSituacaoOptions: {
  label: string;
  value: FolhaCompetenciaSituacao | "";
}[] = [
  { label: "Todas", value: "" },
  { label: "Vigente", value: "ATIVA" },
  { label: "Encerrada", value: "FECHADA" },
];

const grupoFolhaTipoOptions: { label: string; value: GrupoFolhaTipo | "" }[] = [
  { label: "Todos", value: "" },
  { label: "Normal", value: "NORMAL" },
  { label: "Complementar", value: "COMPLEMENTAR" },
  { label: "13º salário", value: "DECIMO_TERCEIRO" },
  { label: "Férias", value: "FERIAS" },
  { label: "Rescisão", value: "RESCISAO" },
  { label: "Pensionistas", value: "PENSIONISTAS" },
];

const grupoFolhaSituacaoOptions: {
  label: string;
  value: GrupoFolhaSituacao | "";
}[] = [
  { label: "Todas", value: "" },
  { label: "Rascunho", value: "RASCUNHO" },
  { label: "Vigente", value: "VIGENTE" },
  { label: "Inativo", value: "INATIVO" },
  { label: "Encerrado", value: "ENCERRADO" },
  { label: "Cancelado", value: "CANCELADO" },
];

const grupoFolhaSituacaoMeta: Record<
  GrupoFolhaSituacao,
  { label: string; color: string; bg: string; border: string }
> = {
  RASCUNHO: { label: "Rascunho", color: "#52616b", bg: "#eef2f6", border: "#eef2f6" },
  VIGENTE: { label: "Vigente", color: "#00843d", bg: "#e2f3e8", border: "#e2f3e8" },
  INATIVO: { label: "Inativo", color: "#9a6500", bg: "#fff1c7", border: "#fff1c7" },
  ENCERRADO: { label: "Encerrado", color: "#334e68", bg: "#e2e8f0", border: "#e2e8f0" },
  CANCELADO: { label: "Cancelado", color: "#b42318", bg: "#fee4e2", border: "#fee4e2" },
};

const grupoFolhaTipoLabel: Record<GrupoFolhaTipo, string> = {
  NORMAL: "Normal",
  COMPLEMENTAR: "Complementar",
  DECIMO_TERCEIRO: "13º salário",
  FERIAS: "Férias",
  RESCISAO: "Rescisão",
  PENSIONISTAS: "Pensionistas",
};

const folhaPagamentoSituacaoMeta: Record<
  FolhaPagamentoSituacao,
  { label: string; color: string; bg: string; border: string }
> = {
  RASCUNHO: { label: "Rascunho", color: "#52616b", bg: "#eef2f6", border: "#eef2f6" },
  ABERTO: { label: "Aberto", color: "#005494", bg: "#e6f0f8", border: "#e6f0f8" },
  AGUARDANDO_PROCESSAMENTO: { label: "Aguardando processamento", color: "#8a5a00", bg: "#fff4d6", border: "#fff4d6" },
  EM_PROCESSAMENTO: { label: "Em processamento", color: "#005494", bg: "#e7f3ff", border: "#e7f3ff" },
  PROCESSO_COM_SUCESSO: { label: "Processado com sucesso", color: "#00843d", bg: "#e2f3e8", border: "#e2f3e8" },
  PROCESSO_COM_ERRO: { label: "Processado com erro", color: "#b42318", bg: "#fee4e2", border: "#fee4e2" },
};

const solicitacaoAjusteFolhaSituacaoOptions: {
  label: string;
  value: SolicitacaoAjusteFolhaSituacao;
}[] = [
  { label: "NOVA", value: "NOVA" },
  { label: "AGUARDANDO ANALISE", value: "AGUARDANDO_ANALISE" },
  { label: "AGUARDANDO AJUSTE", value: "AGUARDANDO_AJUSTE" },
  { label: "AGUARDANDO CORREÇÃO", value: "AGUARDANDO_CORRECAO" },
  { label: "EM CORREÇÃO", value: "EM_CORRECAO" },
  { label: "CORRIGIDO", value: "CORRIGIDO" },
  { label: "DEVOLVIDO", value: "DEVOLVIDO" },
  { label: "REJEITADA", value: "REJEITADA_CONFORMIDADE" },
  { label: "CONCLUÍDO", value: "CONCLUIDO" },
];

const solicitacaoAjusteFolhaCompetenciaOptions = [
  { label: "05/2026", value: "05/2026" },
  { label: "04/2026", value: "04/2026" },
  { label: "03/2026", value: "03/2026" },
];

const solicitacaoAjusteFolhaGrupoEleitosOptions = [
  { label: "SERVIDORES COMISSIONADOS", value: "SERVIDORES COMISSIONADOS" },
  { label: "SERVIDORES CONTRATADOS", value: "SERVIDORES CONTRATADOS" },
  { label: "PESSOA FÍSICA", value: "PESSOA FÍSICA" },
];

const solicitacaoAjusteFolhaEscopoOptions: {
  label: string;
  value: SolicitacaoAjusteFolhaEscopo;
}[] = [
  { label: "Matrícula ou CPF", value: "MATRICULA_CPF" },
  { label: "Grupo de Eleitos", value: "GRUPO_ELEITOS" },
];

const solicitacaoAjusteFolhaExtensoesPermitidas = [
  "pdf",
  "doc",
  "csv",
  "xlsx",
  "xls",
  "docx",
];

type SolicitacaoAjusteFolhaModoFormulario = "novo" | "editar" | "visualizar";

const documentosSolicitacaoAjusteFolhaMock: Record<number, ArquivoAnexadoSeplag[]> = {
  1: [
    {
      nome: "evidencia-adicional-noturno.pdf",
      extensao: "pdf",
      contentType: "application/pdf",
      conteudoEmBase64: "",
      tamanho: "245 KB",
    },
  ],
  3: [
    {
      nome: "planilha-conferencia-rubricas.xlsx",
      extensao: "xlsx",
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      conteudoEmBase64: "",
      tamanho: "182 KB",
    },
  ],
  6: [
    {
      nome: "validacao-gratificacao.pdf",
      extensao: "pdf",
      contentType: "application/pdf",
      conteudoEmBase64: "",
      tamanho: "318 KB",
    },
    {
      nome: "memoria-calculo.xlsx",
      extensao: "xlsx",
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      conteudoEmBase64: "",
      tamanho: "96 KB",
    },
  ],
};

const solicitacaoAjusteFolhaSituacaoMeta: Record<
  SolicitacaoAjusteFolhaSituacao,
  { label: string; color: string; bg: string; border: string }
> = {
  NOVA: { label: "Nova", color: "#005494", bg: "#e6f0f8", border: "#e6f0f8" },
  AGUARDANDO_ANALISE: { label: "Aguardando Analise", color: "#8a5a00", bg: "#fff4d6", border: "#fff4d6" },
  AGUARDANDO_AJUSTE: { label: "Aguardando Ajuste", color: "#6f4e00", bg: "#fff0b8", border: "#fff0b8" },
  AGUARDANDO_CORRECAO: { label: "Aguardando Correção", color: "#334e9f", bg: "#e8edff", border: "#e8edff" },
  EM_CORRECAO: { label: "Em Correção", color: "#9a4d00", bg: "#ffe8cc", border: "#ffe8cc" },
  CORRIGIDO: { label: "Corrigido", color: "#3b3fb8", bg: "#ecebff", border: "#ecebff" },
  DEVOLVIDO: { label: "Devolvido", color: "#b42318", bg: "#fee4e2", border: "#fee4e2" },
  REJEITADA_CONFORMIDADE: { label: "Rejeitada", color: "#8f1d1d", bg: "#fdd7d7", border: "#fdd7d7" },
  CONCLUIDO: { label: "Concluído", color: "#00843d", bg: "#e2f3e8", border: "#e2f3e8" },
};

function formatarCompetenciaFolha(valor?: string) {
  if (!valor) return "";
  const match = valor.match(/^(\d{4})-(\d{2})$/);
  if (match) return `${match[2]}/${match[1]}`;
  return valor;
}

function formatarDataPtBr(data = new Date()) {
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface FolhaTabelaReferenciaFiltroForm {
  tabela?: string;
}

interface FolhaCronogramaEvento {
  periodo: string;
  descricao: string;
  status: string;
}

interface FolhaCronogramaSecao {
  id: number;
  titulo: string;
  marcador: string;
  observacao?: string;
  eventos: FolhaCronogramaEvento[];
}

interface FolhaCronogramaState {
  tituloCiclo: string;
  secoes: FolhaCronogramaSecao[];
}

interface FolhaConformidadeFiltroForm {
  competencia: string;
  competenciaAnterior: string;
  numeroFolha: string[];
  orgaos: string[];
  setores: string[];
  regimesJuridicos: string[];
  categorias: string[];
  cargos: string[];
  tiposVinculo: string[];
  matricula: string[];
  cpf: string[];
  sexo: string[];
  idade?: number;
  codigoRubrica: string[];
  tipoRubrica: string[];
  jornada: string[];
  dataExercicioInicio?: string;
  dataExercicioFim?: string;
  dataAposentadoriaInicio?: string;
  dataAposentadoriaFim?: string;
  numeroExecucaoProcessamento: string[];
  dataProcessamento?: string;
  exibirUltimoProcessamento?: string;
}

interface FolhaConformidadeRow {
  id: number;
  matricula: string;
  vinculo: string;
  numeroDependentes?: number;
  servidor: string;
  orgao: string;
  subcategoria: string;
  folha: string;
  rubrica: string;
  dataInicioExercicio: string;
  dataFimExercicio: string;
  dataAposentadoria: string;
  valorBaseInss: string;
  inssPago: string;
  inssSimulado: string;
  vantagens: string;
  descontos: string;
  liquido: string;
  valorVanMesAnterior: string;
  valorDesMesAnterior: string;
  valorLiqMesAnterior: string;
  alerta: string;
  situacaoAnalise: "Pendente" | "Conforme" | "Inconsistente" | "Justificado";
}

interface FolhaConformidadeHistoricoRow {
  id: number;
  dataHoraEmissao: string;
  numeroFolha: string;
  nomeFolha: string;
  competencia: string;
  tipoRelatorio: string;
  solicitante: string;
  situacao: "Em Emissão" | "Emitido" | "Falha na Emissão";
}

interface FolhaConformidadeFiltroSalvoRow {
  id: number;
  nome: string;
  visibilidade: "PRIVADO" | "PÚBLICO";
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: string;
  filtros: FolhaConformidadeFiltroForm;
  colunas: string[];
}

interface FolhaConformidadeSalvarFiltroForm {
  nomeFiltro: string;
  visibilidade: "PRIVADO" | "PÚBLICO";
}

interface FolhaConformidadeGerenciadorFiltroForm {
  nome: string;
  criadoPor: string;
}

const folhaConformidadeDefaultFilters: FolhaConformidadeFiltroForm = {
  competencia: "",
  competenciaAnterior: "",
  numeroFolha: [],
  orgaos: [],
  setores: [],
  regimesJuridicos: [],
  categorias: [],
  cargos: [],
  tiposVinculo: [],
  matricula: [],
  cpf: [],
  sexo: [],
  idade: undefined,
  codigoRubrica: [],
  tipoRubrica: [],
  jornada: [],
  dataExercicioInicio: "",
  dataExercicioFim: "",
  dataAposentadoriaInicio: "",
  dataAposentadoriaFim: "",
  numeroExecucaoProcessamento: [],
  dataProcessamento: "",
  exibirUltimoProcessamento: "N",
};

interface FolhaTabelaReferenciaVigenciaRow {
  id: number;
  modeloRppsId?: number;
  nome?: string;
  ano: string;
  vigencia: ReactNode;
  situacao: "Agendado" | "Ativo" | "Encerrado" | "Inativo";
  aplicavelPara?: string;
  situacoesFuncionaisMilitar?: string;
  condicaoEspecial?: string;
  planoPrevidenciario?: string;
  tipoCalculo?: string;
  regraIncidencia?: string;
  valorReferenciaId?: string;
  limiteProventos?: string;
  proventosAPartirDe?: string;
  proventosAte?: string;
  tetoPrevidenciario?: string;
  percentualContribuicao?: string;
  faixasContribuicao?: FolhaTabelaReferenciaFaixaRow[];
  inicioVigencia?: string;
  fimVigencia?: string;
  baseLegal?: string[];
}

interface FolhaTabelaReferenciaRow {
  id: number;
  tabelaBaseId?: number;
  sigla: string;
  nome: string;
  vigencias: FolhaTabelaReferenciaVigenciaRow[];
}

interface FolhaTabelaReferenciaVigenciaForm {
  descricao: string;
  anoBase: string;
  aplicavelPara: string[];
  situacoesFuncionaisMilitar: string[];
  condicaoEspecial: string;
  planoPrevidenciario: string;
  tipoCalculo: string;
  regraIncidencia: string;
  valorReferenciaId: string;
  limiteProventos: string;
  proventosAPartirDe: string;
  proventosAte: string;
  tetoPrevidenciario: string;
  percentualContribuicao: string;
  inicioVigencia: string;
  fimVigencia: string;
  baseLegal: string[];
  observacoes: string;
}


interface FolhaValorReferenciaVigenciaRow {
  id: number;
  ano: string;
  vigencia: string;
  valor: string;
  situacao: FolhaTabelaReferenciaVigenciaRow["situacao"];
  inicioVigencia: string;
  fimVigencia?: string;
}

interface FolhaValorReferenciaRow {
  codigo: string;
  nome: string;
  tipo: "Monetário";
  vigencias: FolhaValorReferenciaVigenciaRow[];
}

interface FolhaValorReferenciaVigenciaForm {
  codigo: string;
  nome: string;
  tipo: string;
  valor: string;
  inicioVigencia: string;
  fimVigencia: string;
  observacoes: string;
}
interface FolhaTabelaReferenciaFaixaRow {
  id: number;
  ordem: number;
  faixaInicial: string;
  faixaFinal: string;
  percentual: string;
  contribuicaoFaixa: string;
  parcelaDeduzir?: string;
}

interface FolhaTabelaReferenciaNovaFaixaForm {
  faixaFinal: string;
  percentual: string;
}


type FolhaTabelaReferenciaRegraIncidencia =
  | "REMUNERACAO_TOTAL"
  | "ATE_VALOR_REFERENCIA"
  | "ATE_TETO_RGPS"
  | "EXCEDENTE_TETO_RGPS"
  | "EXCEDENTE_SALARIO_MINIMO"
  | "EXCEDENTE_VALOR_REFERENCIA"
  | "ISENTO_ATE_VALOR_REFERENCIA"
  | "FAIXAS_PROGRESSIVAS";

const folhaTabelaReferenciaAplicavelParaOptions = [
  { label: "Ativo", value: "ATIVO" },
  { label: "Inativo", value: "INATIVO" },
  { label: "Pensionista", value: "PENSIONISTA" },
  { label: "Militar", value: "MILITAR" },
];

const folhaTabelaReferenciaSituacaoFuncionalMilitarOptions = [
  { label: "Ativo", value: "ATIVO" },
  { label: "Inativo", value: "INATIVO" },
  { label: "Pensionista", value: "PENSIONISTA" },
];

const folhaTabelaReferenciaCondicaoEspecialOptions = [
  { label: "Nenhuma", value: "NENHUMA" },
  { label: "Doença incapacitante", value: "DOENCA_INCAPACITANTE" },
  { label: "Previdência complementar", value: "PREVIDENCIA_COMPLEMENTAR" },
];

const folhaTabelaReferenciaPlanoPrevidenciarioOptions = [
  { label: "Geral", value: "GERAL" },
  { label: "Plano Financeiro", value: "PLANO_FINANCEIRO" },
  { label: "Plano Previdenciário", value: "PLANO_PREVIDENCIARIO" },
  { label: "PREVCOM", value: "PREVCOM" },
];

const folhaTabelaReferenciaPrevcomPatrocinadorOptions = [
  { label: "Sim", value: "SIM" },
  { label: "Não", value: "NAO" },
];

const folhaTabelaReferenciaTipoCalculoOptions = [
  { label: "Vínculo", value: "VINCULO" },
  { label: "Pessoa", value: "PESSOA" },
  { label: "Contrato", value: "CONTRATO" },
];

const folhaTabelaReferenciaRegraIncidenciaOptions: {
  label: string;
  value: FolhaTabelaReferenciaRegraIncidencia;
}[] = [
  { label: "Sobre remuneração total", value: "REMUNERACAO_TOTAL" },
  {
    label: "Sobre remuneração até valor de referência",
    value: "ATE_VALOR_REFERENCIA",
  },
  { label: "Até o teto do RGPS", value: "ATE_TETO_RGPS" },
  { label: "Sobre excedente do teto do RGPS", value: "EXCEDENTE_TETO_RGPS" },
  { label: "Sobre excedente do salário mínimo", value: "EXCEDENTE_SALARIO_MINIMO" },
  { label: "Sobre excedente de valor de referência", value: "EXCEDENTE_VALOR_REFERENCIA" },
  { label: "Isento até valor de referência", value: "ISENTO_ATE_VALOR_REFERENCIA" },
  { label: "Por faixas de contribuição", value: "FAIXAS_PROGRESSIVAS" },
];

const folhaTabelaReferenciaValorReferenciaOptions = [
  { label: "Salário Mínimo", value: "SALARIO_MINIMO" },
  { label: "Teto RGPS", value: "TETO_RGPS" },
  { label: "Faixa Isenção LC 700/2021", value: "ISENCAO_LC700" },
  { label: "Limite Proventos LC 700/2021", value: "LIMITE_PROVENTOS_LC700" },
  { label: "Limite Previdenciário PM/BM", value: "LIMITE_PREV_PM_BM" },
  { label: "Valor parametrizado", value: "VALOR_PARAMETRIZADO" },
];

const folhaTabelaReferenciaRegraLabel = (value?: string) =>
  folhaTabelaReferenciaRegraIncidenciaOptions.find((option) => option.value === value)
    ?.label ?? "-";

const folhaTabelaReferenciaAplicavelLabel = (value?: string) =>
  folhaTabelaReferenciaAplicavelParaOptions.find((option) => option.value === value)
    ?.label ?? "-";

const folhaTabelaReferenciaSituacaoFuncionalMilitarLabel = (value?: string) =>
  folhaTabelaReferenciaSituacaoFuncionalMilitarOptions.find(
    (option) => option.value === value,
  )?.label ?? "-";

const folhaTabelaReferenciaTipoCalculoLabel = (value?: string) =>
  folhaTabelaReferenciaTipoCalculoOptions.find((option) => option.value === value)
    ?.label ?? "-";

const folhaTabelaReferenciaCondicaoEspecialLabel = (value?: string) =>
  folhaTabelaReferenciaCondicaoEspecialOptions.find((option) => option.value === value)
    ?.label ?? "Nenhuma";

const folhaTabelaReferenciaPlanoPrevidenciarioLabel = (value?: string) =>
  folhaTabelaReferenciaPlanoPrevidenciarioOptions.find((option) => option.value === value)
    ?.label ?? "Geral";

const folhaTabelaReferenciaValueFromLabel = (
  options: { label: string; value: string }[],
  label?: string,
) => options.find((option) => option.label === label)?.value ?? "";

const folhaTabelaReferenciaValuesFromLabels = (
  options: { label: string; value: string }[],
  labels?: string,
) =>
  labels
    ?.split(",")
    .map((label) => folhaTabelaReferenciaValueFromLabel(options, label.trim()))
    .filter(Boolean) ?? [];

const getReferenciaAutomaticaRppsLabel = (regra?: string) => {
  if (regra === "ATE_VALOR_REFERENCIA")
    return "Limite Prev. PM/BM vigente automático";
  if (regra === "ATE_TETO_RGPS") return "Teto RGPS vigente automático";
  if (regra === "EXCEDENTE_TETO_RGPS") return "Teto RGPS vigente automático";
  if (regra === "EXCEDENTE_SALARIO_MINIMO") return "Salário mínimo vigente automático";
  return "Não informado";
};


const parseDataFolhaTabelaReferencia = (valor?: string) => {
  if (!valor) return undefined;
  const [dia, mes, ano] = valor.split("/").map(Number);
  if (!dia || !mes || !ano) return undefined;
  return new Date(ano, mes - 1, dia).getTime();
};

const calcularSituacaoVigenciaReferencia = (
  inicioVigencia?: string,
  fimVigencia?: string,
): FolhaTabelaReferenciaVigenciaRow["situacao"] => {
  const hoje = new Date();
  const dataAtual = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate(),
  ).getTime();
  const inicio = parseDataFolhaTabelaReferencia(inicioVigencia);
  const fim = parseDataFolhaTabelaReferencia(fimVigencia);

  if (inicio !== undefined && dataAtual < inicio) return "Agendado";
  if (fim !== undefined && fim < dataAtual) return "Encerrado";
  if (inicio !== undefined && dataAtual >= inicio) return "Ativo";
  return "Inativo";
};

const folhaTabelasReferenciaMock: FolhaTabelaReferenciaRow[] = [
  {
    id: 1,
    sigla: "RGPS",
    nome: "REGIME GERAL DE PREVIDÊNCIA SOCIAL",
    vigencias: [
      {
        id: 101,
        ano: "2026",
        vigencia: (
          <>
            02/06/2026 até <em>vigente</em>
          </>
        ),
        situacao: "Ativo",
      },
      {
        id: 102,
        ano: "2025",
        vigencia: "01/06/2026 até 01/06/2026",
        situacao: "Inativo",
      },
      {
        id: 103,
        ano: "2025",
        vigencia: "28/05/2026 até 30/05/2026",
        situacao: "Inativo",
      },
      {
        id: 104,
        ano: "2025",
        vigencia: "20/05/2026 até 27/05/2026",
        situacao: "Inativo",
      },
      {
        id: 105,
        ano: "2025",
        vigencia: "03/02/2026 até 03/02/2026",
        situacao: "Inativo",
      },
      {
        id: 106,
        ano: "500",
        vigencia: "04/05/2026 até 06/05/2026",
        situacao: "Inativo",
      },
    ],
  },
  {
    id: 2,
    sigla: "IRRF",
    nome: "IMPOSTO DE RENDA RETIDO NA FONTE",
    vigencias: [
      {
        id: 201,
        ano: "2026",
        vigencia: (
          <>
            01/05/2026 até <em>vigente</em>
          </>
        ),
        situacao: "Ativo",
      },
      {
        id: 202,
        ano: "2025",
        vigencia: "01/01/2026 até 30/04/2026",
        situacao: "Inativo",
      },
    ],
  },
  {
    id: 3,
    sigla: "RPPS",
    nome: "REGIME PRÓPRIO DE PREVIDÊNCIA SOCIAL",
    vigencias: [
      {
        id: 301,
        nome: "RPPS – Servidor Civil Ativo (remuneração total)",
        ano: "2026",
        aplicavelPara: "Servidor Civil",
        condicaoEspecial: "Nenhuma",
        planoPrevidenciario: "Geral",
        tipoCalculo: "Vínculo",
        regraIncidencia: "Sobre remuneração total",
        percentualContribuicao: "14",
        inicioVigencia: "02/01/2026",
        fimVigencia: "31/12/2026",
        baseLegal: ["lc-202-2004", "lc-654-2020"],
        vigencia: "02/01/2026 até 31/12/2026",
        situacao: calcularSituacaoVigenciaReferencia("02/01/2026", "31/12/2026"),
      },
      {
        id: 302,
        nome: "RPPS – Servidor Civil Ativo PREVCOM (até o teto do RGPS)",
        ano: "2026",
        aplicavelPara: "Servidor Civil",
        condicaoEspecial: "Previdência complementar",
        planoPrevidenciario: "PREVCOM",
        tipoCalculo: "Vínculo",
        regraIncidencia: "Até o teto do RGPS",
        valorReferenciaId: "TETO_RGPS",
        percentualContribuicao: "14",
        faixasContribuicao: [
          {
            id: 1,
            ordem: 1,
            faixaInicial: "R$ 0,00",
            faixaFinal: "R$ 8.475,55",
            percentual: "14",
            contribuicaoFaixa: "Calculada pelo motor",
          },
        ],
        inicioVigencia: "02/01/2026",
        fimVigencia: "31/12/2026",
        baseLegal: ["lc-202-2004", "lc-654-2020"],
        vigencia: "02/01/2026 até 31/12/2026",
        situacao: calcularSituacaoVigenciaReferencia("02/01/2026", "31/12/2026"),
      },
      {
        id: 303,
        nome: "RPPS – Inativo/Pensionista LC 700 por faixas de proventos",
        ano: "2026",
        aplicavelPara: "Inativo, Pensionista",
        condicaoEspecial: "Nenhuma",
        planoPrevidenciario: "Geral",
        tipoCalculo: "Vínculo",
        regraIncidencia: "Por faixas de contribuição",
        valorReferenciaId: "ISENCAO_LC700",
        proventosAPartirDe: "R$ 0,00",
        proventosAte: "R$ 11.776,34",
        faixasContribuicao: [
          {
            id: 1,
            ordem: 1,
            faixaInicial: "R$ 0,00",
            faixaFinal: "R$ 4.318,01",
            percentual: "0",
            contribuicaoFaixa: "Isento",
          },
          {
            id: 2,
            ordem: 2,
            faixaInicial: "R$ 4.318,02",
            faixaFinal: "R$ 11.776,34",
            percentual: "14",
            contribuicaoFaixa: "Calculada pelo motor",
          },
        ],
        inicioVigencia: "02/01/2026",
        fimVigencia: "31/12/2026",
        baseLegal: ["lc-202-2004", "lc-700-2021"],
        vigencia: "02/01/2026 até 31/12/2026",
        situacao: calcularSituacaoVigenciaReferencia("02/01/2026", "31/12/2026"),
      },
      {
        id: 305,
        nome: "RPPS – Inativo/Pensionista sobre excedente do salário mínimo",
        ano: "2026",
        aplicavelPara: "Inativo, Pensionista",
        condicaoEspecial: "Nenhuma",
        planoPrevidenciario: "Geral",
        tipoCalculo: "Vínculo",
        regraIncidencia: "Sobre excedente do salário mínimo",
        valorReferenciaId: "SALARIO_MINIMO",
        proventosAPartirDe: "R$ 11.776,35",
        percentualContribuicao: "14",
        faixasContribuicao: [
          {
            id: 1,
            ordem: 1,
            faixaInicial: "R$ 11.776,34",
            faixaFinal: "Em aberto",
            percentual: "14",
            contribuicaoFaixa: "Sobre excedente do salário mínimo",
          },
        ],
        inicioVigencia: "02/01/2026",
        fimVigencia: "31/12/2026",
        baseLegal: ["lc-202-2004", "lc-654-2020"],
        vigencia: "02/01/2026 até 31/12/2026",
        situacao: calcularSituacaoVigenciaReferencia("02/01/2026", "31/12/2026"),
      },
      {
        id: 307,
        nome: "RPPS – Militar por faixas do limite legal PM/BM",
        ano: "2026",
        aplicavelPara: "Militar",
        situacoesFuncionaisMilitar: "Ativo, Inativo, Pensionista",
        condicaoEspecial: "Nenhuma",
        planoPrevidenciario: "Geral",
        tipoCalculo: "Vínculo",
        regraIncidencia: "Por faixas de contribuição",
        valorReferenciaId: "LIMITE_PREV_PM_BM",
        faixasContribuicao: [
          {
            id: 1,
            ordem: 1,
            faixaInicial: "R$ 0,00",
            faixaFinal: "R$ 11.005,95",
            percentual: "10,5",
            contribuicaoFaixa: "Calculada pelo motor",
          },
          {
            id: 2,
            ordem: 2,
            faixaInicial: "R$ 11.005,96",
            faixaFinal: "Em aberto",
            percentual: "14",
            contribuicaoFaixa: "Calculada pelo motor",
          },
        ],
        inicioVigencia: "02/01/2026",
        fimVigencia: "31/12/2026",
        baseLegal: ["lc-202-2004", "lc-712-2022"],
        vigencia: "02/01/2026 até 31/12/2026",
        situacao: calcularSituacaoVigenciaReferencia("02/01/2026", "31/12/2026"),
      },
      {
        id: 308,
        nome: "RPPS – Beneficiário com doença incapacitante sobre excedente do teto RGPS",
        ano: "2026",
        aplicavelPara: "Inativo, Pensionista",
        condicaoEspecial: "Doença incapacitante",
        planoPrevidenciario: "Geral",
        tipoCalculo: "Vínculo",
        regraIncidencia: "Sobre excedente do teto do RGPS",
        valorReferenciaId: "TETO_RGPS",
        percentualContribuicao: "14",
        inicioVigencia: "02/01/2026",
        fimVigencia: "31/12/2026",
        baseLegal: ["lc-202-2004", "lc-700-2021"],
        vigencia: "02/01/2026 até 31/12/2026",
        situacao: calcularSituacaoVigenciaReferencia("02/01/2026", "31/12/2026"),
      },
    ],
  },
  {
    id: 4,
    sigla: "RPC",
    nome: "REGIME DE PREVIDÊNCIA COMPLEMENTAR",
    vigencias: [
      {
        id: 401,
        ano: "2026",
        vigencia: "01/01/2026 até 31/12/2026",
        situacao: calcularSituacaoVigenciaReferencia("01/01/2026", "31/12/2026"),
        inicioVigencia: "01/01/2026",
        fimVigencia: "31/12/2026",
      },
    ],
  },
];

const FOLHA_TABELAS_REFERENCIA_RPPS_STORAGE_KEY =
  "sigep.prototipos.folha.tabelasReferencia.rpps.vigencias";
const FOLHA_TABELA_REFERENCIA_RPPS_BASE_ID = 3;

const folhaTabelaReferenciaRppsNomesPorId: Record<number, string> = {
  301: "RPPS – Servidor Civil Ativo (remuneração total)",
  302: "RPPS – Servidor Civil Ativo PREVCOM (até o teto do RGPS)",
  303: "RPPS – Inativo/Pensionista LC 700 por faixas de proventos",
  305: "RPPS – Inativo/Pensionista sobre excedente do salário mínimo",
  307: "RPPS – Militar por faixas do limite legal PM/BM",
  308: "RPPS – Beneficiário com doença incapacitante sobre excedente do teto RGPS",
};

const folhaTabelaReferenciaRppsModeloIds = Object.keys(folhaTabelaReferenciaRppsNomesPorId).map(Number);

const isFolhaTabelaReferenciaRppsModeloId = (id?: number) =>
  typeof id === "number" && folhaTabelaReferenciaRppsModeloIds.includes(id);

const getFolhaTabelaReferenciaRppsModeloId = (vigencia: FolhaTabelaReferenciaVigenciaRow) =>
  vigencia.modeloRppsId ?? (isFolhaTabelaReferenciaRppsModeloId(vigencia.id) ? vigencia.id : undefined);

const getFolhaTabelaReferenciaRppsModeloById = (modeloRppsId?: number) =>
  getFolhaTabelaReferenciaRppsMockVigencias().find((vigencia) => vigencia.id === modeloRppsId);

const aplicarModeloRppsNaVigencia = (
  vigencia: FolhaTabelaReferenciaVigenciaRow,
  modelo?: FolhaTabelaReferenciaVigenciaRow,
): FolhaTabelaReferenciaVigenciaRow => {
  if (!modelo) return vigencia;

  return {
    ...vigencia,
    modeloRppsId: modelo.id,
    nome: vigencia.nome ?? modelo.nome,
    aplicavelPara: modelo.aplicavelPara,
    situacoesFuncionaisMilitar: modelo.situacoesFuncionaisMilitar,
    condicaoEspecial: modelo.condicaoEspecial,
    planoPrevidenciario: modelo.planoPrevidenciario,
    tipoCalculo: modelo.tipoCalculo,
    regraIncidencia: modelo.regraIncidencia,
    valorReferenciaId: vigencia.valorReferenciaId ?? modelo.valorReferenciaId,
    proventosAPartirDe: vigencia.proventosAPartirDe ?? modelo.proventosAPartirDe,
    proventosAte: vigencia.proventosAte ?? modelo.proventosAte,
    tetoPrevidenciario: vigencia.tetoPrevidenciario ?? modelo.tetoPrevidenciario,
    percentualContribuicao: vigencia.percentualContribuicao ?? modelo.percentualContribuicao,
    faixasContribuicao: vigencia.faixasContribuicao ?? modelo.faixasContribuicao,
    baseLegal: vigencia.baseLegal ?? modelo.baseLegal,
  };
};
const formatarPeriodoVigenciaReferencia = (inicioVigencia?: string, fimVigencia?: string) =>
  `${inicioVigencia || "-"} até ${fimVigencia?.trim() || "vigente"}`;

const normalizarVigenciaTabelaReferencia = (
  vigencia: FolhaTabelaReferenciaVigenciaRow,
): FolhaTabelaReferenciaVigenciaRow => {
  const aplicavelParaNormalizado =
    vigencia.aplicavelPara === "Ativo" ? "Servidor Civil" : vigencia.aplicavelPara;
  const modeloRppsId = getFolhaTabelaReferenciaRppsModeloId(vigencia);
  const modeloRpps = getFolhaTabelaReferenciaRppsModeloById(modeloRppsId);
  const vigenciaComModelo = aplicarModeloRppsNaVigencia(vigencia, modeloRpps);
  const nomeNormalizado =
    modeloRpps?.nome ??
    folhaTabelaReferenciaRppsNomesPorId[vigencia.id] ??
    vigencia.nome ??
    (aplicavelParaNormalizado === "Servidor Civil"
      ? folhaTabelaReferenciaRppsNomesPorId[301]
      : undefined);

  const faixasNormalizadas =
    modeloRppsId === 302
      ? getFaixasAutomaticasRppsPorRegra("ATE_TETO_RGPS", "14")
      : vigenciaComModelo.faixasContribuicao;

  return {
    ...vigenciaComModelo,
    modeloRppsId,
    nome: nomeNormalizado,
    aplicavelPara: vigenciaComModelo.aplicavelPara === "Ativo" ? "Servidor Civil" : vigenciaComModelo.aplicavelPara,
    proventosAPartirDe:
      modeloRppsId === 303 ? "R$ 0,00" : vigenciaComModelo.proventosAPartirDe,
    tetoPrevidenciario: undefined,
    faixasContribuicao: faixasNormalizadas,
    vigencia:
      typeof vigencia.vigencia === "string"
        ? vigencia.vigencia
        : formatarPeriodoVigenciaReferencia(vigencia.inicioVigencia, vigencia.fimVigencia),
    situacao: calcularSituacaoVigenciaReferencia(
      vigencia.inicioVigencia,
      vigencia.fimVigencia,
    ),
  };
};

const getFolhaTabelaReferenciaRppsMockVigencias = () =>
  folhaTabelasReferenciaMock.find((item) => item.sigla === "RPPS")?.vigencias ?? [];

const lerFolhaTabelaReferenciaRppsVigencias = (): FolhaTabelaReferenciaVigenciaRow[] => {
  const vigenciasMock = getFolhaTabelaReferenciaRppsMockVigencias();

  const vigenciasMockNormalizadas = vigenciasMock.map(normalizarVigenciaTabelaReferencia);

  if (typeof window === "undefined") return vigenciasMockNormalizadas;

  const stored = window.localStorage.getItem(FOLHA_TABELAS_REFERENCIA_RPPS_STORAGE_KEY);
  if (!stored) return vigenciasMockNormalizadas;

  try {
    const parsed = JSON.parse(stored) as FolhaTabelaReferenciaVigenciaRow[];
    if (!Array.isArray(parsed)) return vigenciasMock;

    const vigenciasPersistidas = parsed
      .filter(
        (vigencia) =>
          vigencia &&
          typeof vigencia.id === "number" &&
          vigencia.id !== 304 &&
          vigencia.id !== 306 &&
          !(
            vigencia.id === 303 &&
            (!Array.isArray(vigencia.faixasContribuicao) ||
              !vigencia.faixasContribuicao.length)
          ),
      )
      .map(normalizarVigenciaTabelaReferencia);
    const idsPersistidos = new Set(vigenciasPersistidas.map((vigencia) => vigencia.id));

    return [
      ...vigenciasMockNormalizadas.filter((vigencia) => !idsPersistidos.has(vigencia.id)),
      ...vigenciasPersistidas,
    ];
  } catch {
    return vigenciasMock;
  }
};

const salvarFolhaTabelaReferenciaRppsVigencias = (
  vigencias: FolhaTabelaReferenciaVigenciaRow[],
) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    FOLHA_TABELAS_REFERENCIA_RPPS_STORAGE_KEY,
    JSON.stringify(vigencias.map(normalizarVigenciaTabelaReferencia)),
  );
};

const getFolhaTabelasReferenciaPersistidas = (): FolhaTabelaReferenciaRow[] =>
  folhaTabelasReferenciaMock.map((tabela) =>
    tabela.sigla === "RPPS"
      ? { ...tabela, vigencias: lerFolhaTabelaReferenciaRppsVigencias() }
      : tabela,
  );

const getFolhaTabelasReferenciaListagem = (
  tabelas: FolhaTabelaReferenciaRow[],
): FolhaTabelaReferenciaRow[] =>
  tabelas.flatMap((tabela) => {
    if (tabela.sigla === "RPC") return [];

    if (tabela.sigla !== "RPPS") return [tabela];

    const modelosRpps = getFolhaTabelaReferenciaRppsMockVigencias().map(
      normalizarVigenciaTabelaReferencia,
    );

    return modelosRpps.map((modelo) => ({
      ...tabela,
      id: modelo.id,
      tabelaBaseId: tabela.id,
      nome: modelo.nome ?? tabela.nome,
      vigencias: tabela.vigencias
        .filter((vigencia) => getFolhaTabelaReferenciaRppsModeloId(vigencia) === modelo.id)
        .map((vigencia) => aplicarModeloRppsNaVigencia(vigencia, modelo)),
    }));
  });

const salvarFolhaTabelaReferenciaRppsVigencia = (
  vigencia: FolhaTabelaReferenciaVigenciaRow,
) => {
  const vigenciasAtuais = lerFolhaTabelaReferenciaRppsVigencias();
  const vigenciaNormalizada = normalizarVigenciaTabelaReferencia(vigencia);
  const jaExiste = vigenciasAtuais.some((item) => item.id === vigenciaNormalizada.id);
  const proximasVigencias = jaExiste
    ? vigenciasAtuais.map((item) =>
        item.id === vigenciaNormalizada.id ? vigenciaNormalizada : item,
      )
    : [...vigenciasAtuais, vigenciaNormalizada];

  salvarFolhaTabelaReferenciaRppsVigencias(proximasVigencias);
};
const folhaValoresReferenciaMock: FolhaValorReferenciaRow[] = [
  {
    codigo: "SALARIO_MINIMO",
    nome: "Salário Mínimo",
    tipo: "Monetário",
    vigencias: [
      {
        id: 1001,
        ano: "2026",
        vigencia: "01/01/2026 até 31/12/2026",
        valor: "R$ 1.621,00",
        inicioVigencia: "01/01/2026",
        fimVigencia: "31/12/2026",
        situacao: calcularSituacaoVigenciaReferencia("01/01/2026", "31/12/2026"),
      },
    ],
  },
  {
    codigo: "TETO_RGPS",
    nome: "Teto RGPS/INSS",
    tipo: "Monetário",
    vigencias: [
      {
        id: 1002,
        ano: "2026",
        vigencia: "01/01/2026 até 31/12/2026",
        valor: "R$ 8.475,55",
        inicioVigencia: "01/01/2026",
        fimVigencia: "31/12/2026",
        situacao: calcularSituacaoVigenciaReferencia("01/01/2026", "31/12/2026"),
      },
    ],
  },
  {
    codigo: "ISENCAO_LC700",
    nome: "Faixa Isenção LC 700/2021",
    tipo: "Monetário",
    vigencias: [
      {
        id: 1003,
        ano: "2026",
        vigencia: "01/01/2026 até 31/12/2026",
        valor: "R$ 4.318,01",
        inicioVigencia: "01/01/2026",
        fimVigencia: "31/12/2026",
        situacao: calcularSituacaoVigenciaReferencia("01/01/2026", "31/12/2026"),
      },
    ],
  },
  {
    codigo: "LIMITE_PROVENTOS_LC700",
    nome: "Limite Proventos LC 700/2021",
    tipo: "Monetário",
    vigencias: [
      {
        id: 1009,
        ano: "2026",
        vigencia: "01/01/2026 até 31/12/2026",
        valor: "R$ 11.776,34",
        inicioVigencia: "01/01/2026",
        fimVigencia: "31/12/2026",
        situacao: calcularSituacaoVigenciaReferencia("01/01/2026", "31/12/2026"),
      },
    ],
  },

  {
    codigo: "LIMITE_PREV_PM_BM",
    nome: "Limite Prev. PM/BM",
    tipo: "Monetário",
    vigencias: [
      {
        id: 1004,
        ano: "2026",
        vigencia: "01/01/2026 até 31/12/2026",
        valor: "R$ 11.005,95",
        inicioVigencia: "01/01/2026",
        fimVigencia: "31/12/2026",
        situacao: calcularSituacaoVigenciaReferencia("01/01/2026", "31/12/2026"),
      },
    ],
  },
  {
    codigo: "DEDUCAO_DEP_IRRF",
    nome: "Dedução Dependente IRRF",
    tipo: "Monetário",
    vigencias: [
      {
        id: 1005,
        ano: "2026",
        vigencia: "01/01/2026 até 31/12/2026",
        valor: "R$ 189,59",
        inicioVigencia: "01/01/2026",
        fimVigencia: "31/12/2026",
        situacao: calcularSituacaoVigenciaReferencia("01/01/2026", "31/12/2026"),
      },
    ],
  },
  {
    codigo: "DEDUCAO_SIMPL_IRRF",
    nome: "Dedução Simplificada IRRF",
    tipo: "Monetário",
    vigencias: [
      {
        id: 1006,
        ano: "2026",
        vigencia: "01/01/2026 até 31/12/2026",
        valor: "R$ 564,80",
        inicioVigencia: "01/01/2026",
        fimVigencia: "31/12/2026",
        situacao: calcularSituacaoVigenciaReferencia("01/01/2026", "31/12/2026"),
      },
    ],
  },
  {
    codigo: "ISENCAO_65_IRRF",
    nome: "Isenção IRRF 65+",
    tipo: "Monetário",
    vigencias: [
      {
        id: 1007,
        ano: "2026",
        vigencia: "01/01/2026 até 31/12/2026",
        valor: "R$ 2.824,00",
        inicioVigencia: "01/01/2026",
        fimVigencia: "31/12/2026",
        situacao: calcularSituacaoVigenciaReferencia("01/01/2026", "31/12/2026"),
      },
    ],
  },
  {
    codigo: "SALARIO_FAMILIA",
    nome: "Salário Família",
    tipo: "Monetário",
    vigencias: [
      {
        id: 1008,
        ano: "2026",
        vigencia: "01/01/2026 até 31/12/2026",
        valor: "R$ 65,00",
        inicioVigencia: "01/01/2026",
        fimVigencia: "31/12/2026",
        situacao: calcularSituacaoVigenciaReferencia("01/01/2026", "31/12/2026"),
      },
    ],
  },
];

const getFolhaValorReferenciaAtual = (codigo?: string) =>
  codigo
    ? folhaValoresReferenciaMock.find((valor) => valor.codigo === codigo)?.vigencias[0]?.valor
    : undefined;

const folhaTabelaReferenciaFaixasMock: FolhaTabelaReferenciaFaixaRow[] = [
  {
    id: 1,
    ordem: 1,
    faixaInicial: "R$ 0,01",
    faixaFinal: "R$ 1.621,00",
    percentual: "7,5",
    contribuicaoFaixa: "R$ 121,58",
    parcelaDeduzir: "R$ 0,00",
  },
  {
    id: 2,
    ordem: 2,
    faixaInicial: "R$ 1.621,01",
    faixaFinal: "R$ 2.902,84",
    percentual: "9",
    contribuicaoFaixa: "R$ 115,37",
    parcelaDeduzir: "R$ 24,32",
  },
  {
    id: 3,
    ordem: 3,
    faixaInicial: "R$ 2.902,85",
    faixaFinal: "R$ 4.354,27",
    percentual: "12",
    contribuicaoFaixa: "R$ 174,17",
    parcelaDeduzir: "R$ 111,40",
  },
  {
    id: 4,
    ordem: 4,
    faixaInicial: "R$ 4.354,28",
    faixaFinal: "R$ 8.475,55",
    percentual: "14",
    contribuicaoFaixa: "R$ 576,98",
    parcelaDeduzir: "R$ 198,49",
  },
];

const folhaTabelaReferenciaFaixasIrrfMock: FolhaTabelaReferenciaFaixaRow[] = [
  { id: 1, ordem: 1, faixaInicial: "R$ 0,00", faixaFinal: "R$ 2.428,80", percentual: "Isento", contribuicaoFaixa: "Não se aplica", parcelaDeduzir: "R$ 0,00" },
  { id: 2, ordem: 2, faixaInicial: "R$ 2.428,81", faixaFinal: "R$ 2.826,65", percentual: "7,5", contribuicaoFaixa: "Não se aplica", parcelaDeduzir: "R$ 182,16" },
  { id: 3, ordem: 3, faixaInicial: "R$ 2.826,66", faixaFinal: "R$ 3.751,05", percentual: "15", contribuicaoFaixa: "Não se aplica", parcelaDeduzir: "R$ 394,16" },
  { id: 4, ordem: 4, faixaInicial: "R$ 3.751,06", faixaFinal: "R$ 4.664,68", percentual: "22,5", contribuicaoFaixa: "Não se aplica", parcelaDeduzir: "R$ 675,49" },
  { id: 5, ordem: 5, faixaInicial: "R$ 4.664,69", faixaFinal: "Em aberto", percentual: "27,5", contribuicaoFaixa: "Não se aplica", parcelaDeduzir: "R$ 908,73" },
];

const folhaTabelaReferenciaIrrfTabs: TabItemSeplag[] = [
  { label: "Dados Gerais", value: "dados-gerais" },
  { label: "Tabela Progressiva", value: "tabela-progressiva" },
  { label: "Redução Mensal", value: "reducao-mensal" },
  { label: "Deduções", value: "deducoes" },
];
const folhaTabelaReferenciaVigenciaTabs: TabItemSeplag[] = [
  { label: "Dados Gerais", value: "dados-gerais" },
  { label: "Faixas de Contribuição", value: "faixa-contribuicao" },
];

const parseMoedaReferencia = (valor: string) => {
  const normalized = valor
    .replace(/[R$\s.]/g, "")
    .replace(",", ".")
    .trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoedaReferencia = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

const getProximaFaixaInicialReferencia = (
  faixas: FolhaTabelaReferenciaFaixaRow[],
) => {
  const ultimaFaixa = faixas[faixas.length - 1];
  if (!ultimaFaixa) return "R$ 0,00";

  return formatMoedaReferencia(parseMoedaReferencia(ultimaFaixa.faixaFinal) + 0.01);
};

const calcularContribuicaoFaixaReferencia = (
  faixaInicial: string,
  faixaFinal: string,
  percentual: string,
) => {
  const inicio = parseMoedaReferencia(faixaInicial);
  const fim = parseMoedaReferencia(faixaFinal);
  const aliquota = Number(percentual.replace(",", "."));
  const base = Math.max(fim - Math.max(inicio - 0.01, 0), 0);
  const contribuicao = base * (Number.isFinite(aliquota) ? aliquota / 100 : 0);

  return formatMoedaReferencia(contribuicao);
};

const calcularParcelaDeduzirIrrf = (
  faixasAnteriores: FolhaTabelaReferenciaFaixaRow[],
  faixaInicial: string,
  percentual: string,
) => {
  const limiteAnterior = Math.max(parseMoedaReferencia(faixaInicial) - 0.01, 0);
  const aliquota = Number(percentual.replace(",", "."));
  const impostoFaixasAnteriores = faixasAnteriores.reduce((total, faixa) => {
    const inicio = parseMoedaReferencia(faixa.faixaInicial);
    const fim = parseMoedaReferencia(faixa.faixaFinal);
    const aliquotaFaixa = Number(faixa.percentual.replace(",", "."));
    const baseFaixa = Math.max(fim - Math.max(inicio - 0.01, 0), 0);
    return total + baseFaixa * (Number.isFinite(aliquotaFaixa) ? aliquotaFaixa / 100 : 0);
  }, 0);
  const parcela = limiteAnterior * (Number.isFinite(aliquota) ? aliquota / 100 : 0) - impostoFaixasAnteriores;
  return formatMoedaReferencia(Math.max(parcela, 0));
};

const getFaixasAutomaticasRppsPorRegra = (
  regraIncidencia?: string,
  percentual = "14",
): FolhaTabelaReferenciaFaixaRow[] => {
  if (
    regraIncidencia === "ATE_TETO_RGPS" ||
    regraIncidencia === "Até o teto do RGPS"
  ) {
    return [
      {
        id: 1,
        ordem: 1,
        faixaInicial: "R$ 0,00",
        faixaFinal: getFolhaValorReferenciaAtual("TETO_RGPS") ?? "R$ 8.475,55",
        percentual,
        contribuicaoFaixa: "Calculada pelo motor",
      },
    ];
  }

  if (
    regraIncidencia === "EXCEDENTE_SALARIO_MINIMO" ||
    regraIncidencia === "Sobre excedente do salário mínimo"
  ) {
    return [
      {
        id: 1,
        ordem: 1,
        faixaInicial: "R$ 0,00",
        faixaFinal: "R$ 1.621,00",
        percentual: "0",
        contribuicaoFaixa: "Isento",
      },
      {
        id: 2,
        ordem: 2,
        faixaInicial: "R$ 1.621,01",
        faixaFinal: "Em aberto",
        percentual,
        contribuicaoFaixa: "Calculada pelo motor",
      },
    ];
  }

  return [
    {
      id: 1,
      ordem: 1,
      faixaInicial: "R$ 0,00",
      faixaFinal: "Em aberto",
      percentual,
      contribuicaoFaixa: "Calculada pelo motor",
    },
  ];
};

const isFaixasAutomaticasRpps = (faixas: FolhaTabelaReferenciaFaixaRow[]) =>
  faixas.length > 0 &&
  faixas.every((faixa) =>
    ["Isento", "Calculada pelo motor"].includes(faixa.contribuicaoFaixa),
  );

const folhaCompetenciaSituacaoMeta: Record<
  FolhaCompetenciaSituacao,
  { label: string; color: string; bg: string; border: string }
> = {
  ATIVA: { label: "Vigente", color: "#00843d", bg: "#e2f3e8", border: "#e2f3e8" },
  FECHADA: { label: "Encerrada", color: "#334e68", bg: "#e2e8f0", border: "#e2e8f0" },
};

const folhaPagamentoExecucaoSituacaoMeta: Record<
  FolhaPagamentoExecucaoSituacao,
  { label: string; color: string; bg: string; border: string }
> = {
  EM_FILA: { label: "Em fila", color: "#8a5a00", bg: "#fff4d6", border: "#fff4d6" },
  EM_PROCESSAMENTO: { label: "Em processamento", color: "#005494", bg: "#e7f3ff", border: "#e7f3ff" },
  CONCLUIDA: { label: "Concluída", color: "#00843d", bg: "#e2f3e8", border: "#e2f3e8" },
  CONCLUIDA_COM_ALERTA: { label: "Concluída com alerta", color: "#9a6500", bg: "#fff1c7", border: "#fff1c7" },
  CONCLUIDA_COM_ERRO: { label: "Concluída com erro", color: "#b42318", bg: "#fee4e2", border: "#fee4e2" },
  CANCELADA: { label: "Cancelada", color: "#b42318", bg: "#fee4e2", border: "#fee4e2" },
};

const folhaPagamentoPessoaLogSituacaoOptions: {
  label: string;
  value: FolhaPagamentoPessoaLogSituacao | "";
}[] = [
  { label: "Todas", value: "" },
  { label: "Não processada", value: "NAO_PROCESSADA" },
  { label: "Em processamento", value: "EM_PROCESSAMENTO" },
  { label: "Sucesso", value: "SUCESSO" },
  { label: "Alerta", value: "ALERTA" },
  { label: "Erro", value: "ERRO" },
  { label: "Ignorada", value: "IGNORADA" },
];

const folhaPagamentoPessoaLogSituacaoMeta: Record<
  FolhaPagamentoPessoaLogSituacao,
  { label: string; color: string; bg: string; border: string }
> = {
  NAO_PROCESSADA: { label: "Não processada", color: "#52616b", bg: "#eef2f6", border: "#eef2f6" },
  EM_PROCESSAMENTO: { label: "Em processamento", color: "#005494", bg: "#e7f3ff", border: "#e7f3ff" },
  SUCESSO: { label: "Sucesso", color: "#00843d", bg: "#e2f3e8", border: "#e2f3e8" },
  ALERTA: { label: "Alerta", color: "#9a6500", bg: "#fff1c7", border: "#fff1c7" },
  ERRO: { label: "Erro", color: "#b42318", bg: "#fee4e2", border: "#fee4e2" },
  IGNORADA: { label: "Ignorada", color: "#64748b", bg: "#f1f5f9", border: "#f1f5f9" },
};

const folhaPagamentoRubricaLogSituacaoMeta: Record<
  FolhaPagamentoRubricaLogSituacao,
  { label: string; color: string; bg: string; border: string }
> = {
  CALCULADA: { label: "Calculada", color: "#00843d", bg: "#e2f3e8", border: "#e2f3e8" },
  NAO_ELEGIVEL: { label: "Não elegível", color: "#64748b", bg: "#f1f5f9", border: "#f1f5f9" },
  ALERTA: { label: "Alerta", color: "#9a6500", bg: "#fff1c7", border: "#fff1c7" },
  ERRO: { label: "Erro", color: "#b42318", bg: "#fee4e2", border: "#fee4e2" },
  NAO_PROCESSADA: { label: "Não processada", color: "#52616b", bg: "#eef2f6", border: "#eef2f6" },
};

const folhaPagamentoOrgaoOptions = [
  { label: "SEPLAG", value: "SEPLAG" },
  { label: "MTI", value: "MTI" },
  { label: "SEDUC", value: "SEDUC" },
  { label: "SES", value: "SES" },
  { label: "SAD", value: "SAD" },
];

const folhaPagamentoRegimeOptions = [
  { label: "Todos", value: "" },
  { label: "Estatutário Civil", value: "Estatutário Civil" },
  { label: "Estatutário Militar", value: "Estatutário Militar" },
  { label: "Regime Celetista", value: "Regime Celetista" },
  { label: "Contrato Temporário", value: "Contrato Temporário" },
];

const folhaPagamentoCategoriaOptions = [
  { label: "Todas", value: "" },
  { label: "Profissionais da Educação", value: "Profissionais da Educação" },
  { label: "Profissionais da Saúde", value: "Profissionais da Saúde" },
  { label: "Área Meio", value: "Área Meio" },
  { label: "Militar", value: "Militar" },
];

const folhaPagamentoCargoOptions = [
  { label: "Todos", value: "" },
  { label: "Professor da Educação Básica", value: "Professor da Educação Básica" },
  { label: "Analista Administrativo", value: "Analista Administrativo" },
  { label: "Médico", value: "Médico" },
  { label: "Gestor Governamental", value: "Gestor Governamental" },
];

const folhaPagamentoGrupoEleitosOptions = [
  { label: "Nenhum", value: "" },
  { label: "PESSOA FÍSICA", value: "PESSOA FÍSICA" },
  { label: "Grupo Teste", value: "Grupo Teste" },
  { label: "Teste 24/04/2026", value: "Teste 24/04/2026" },
];

const folhaConformidadeNumeroFolhaOptions = [
  { label: "01 - Folha Normal", value: "01" },
  { label: "02 - Folha com descontos", value: "02" },
  { label: "31 - Rescisão", value: "31" },
  { label: "40 - Complementar", value: "40" },
  { label: "60 - Contratos", value: "60" },
  { label: "61 - Pensionistas", value: "61" },
];

const folhaConformidadeTipoFolhaOptions = [
  { label: "Normal", value: "Normal" },
  { label: "Complementar", value: "Complementar" },
  { label: "Rescisão", value: "Rescisão" },
  { label: "Contratos", value: "Contratos" },
  { label: "Pensionistas", value: "Pensionistas" },
];

const folhaConformidadeSetorOptions = [
  { label: "Todos", value: "" },
  { label: "Superintendência de Gestão de Pessoas", value: "Superintendência de Gestão de Pessoas" },
  { label: "Coordenadoria de Folha", value: "Coordenadoria de Folha" },
  { label: "Coordenadoria Financeira", value: "Coordenadoria Financeira" },
  { label: "Unidade Setorial", value: "Unidade Setorial" },
];

const folhaConformidadeTipoVinculoOptions = [
  { label: "Efetivo", value: "Efetivo" },
  { label: "Contrato temporário", value: "Contrato temporário" },
  { label: "Exclusivamente comissão", value: "Exclusivamente comissão" },
  { label: "Aposentado", value: "Aposentado" },
  { label: "Pensionista", value: "Pensionista" },
  { label: "Estagiário", value: "Estagiário" },
];

const folhaConformidadeMatriculaOptions = [
  { label: "102030/1", value: "102030/1" },
  { label: "204411/2", value: "204411/2" },
  { label: "887120/1", value: "887120/1" },
  { label: "451278/3", value: "451278/3" },
  { label: "874512/2", value: "874512/2" },
  { label: "339870/1", value: "339870/1" },
  { label: "540110/2", value: "540110/2" },
  { label: "778899/1", value: "778899/1" },
  { label: "665544/4", value: "665544/4" },
  { label: "112233/1", value: "112233/1" },
];

const folhaConformidadeCpfOptions = [
  { label: "001.234.567-89", value: "001.234.567-89" },
  { label: "112.345.678-90", value: "112.345.678-90" },
  { label: "223.456.789-01", value: "223.456.789-01" },
  { label: "334.567.890-12", value: "334.567.890-12" },
  { label: "445.678.901-23", value: "445.678.901-23" },
  { label: "556.789.012-34", value: "556.789.012-34" },
  { label: "667.890.123-45", value: "667.890.123-45" },
  { label: "778.901.234-56", value: "778.901.234-56" },
  { label: "889.012.345-67", value: "889.012.345-67" },
  { label: "990.123.456-78", value: "990.123.456-78" },
];

const folhaConformidadeTipoRelatorioOptions = [
  { label: "Sintético", value: "Sintético" },
  { label: "Detalhado", value: "Detalhado" },
  { label: "Comparativo mensal", value: "Comparativo mensal" },
  { label: "Saldo ALN", value: "Saldo ALN" },
  { label: "Retenções", value: "Retenções" },
  { label: "Descontos", value: "Descontos" },
  { label: "INSS/IRRF", value: "INSS/IRRF" },
  { label: "Afastamentos/LSF", value: "Afastamentos/LSF" },
];

const folhaConformidadeFormatoOptions = [
  { label: "Tela", value: "Tela" },
  { label: "Excel", value: "Excel" },
  { label: "PDF", value: "PDF" },
];

const folhaConformidadeNomeFolhaOptions = [
  { label: "Folha Normal Maio/2026", value: "Folha Normal Maio/2026" },
  { label: "Folha Educação Maio/2026", value: "Folha Educação Maio/2026" },
  { label: "Folha Complementar Maio/2026", value: "Folha Complementar Maio/2026" },
  { label: "Folha Especial Março/2026", value: "Folha Especial Março/2026" },
];

const folhaConformidadeSexoOptions = [
  { label: "Feminino", value: "Feminino" },
  { label: "Masculino", value: "Masculino" },
  { label: "Não informado", value: "Não informado" },
];

const folhaConformidadeEscolaridadeOptions = [
  { label: "Ensino Fundamental", value: "Ensino Fundamental" },
  { label: "Ensino Médio", value: "Ensino Médio" },
  { label: "Ensino Superior", value: "Ensino Superior" },
  { label: "Pós-graduação", value: "Pós-graduação" },
];

const folhaConformidadeTipoRubricaOptions = [
  { label: "Vantagem", value: "Vantagem" },
  { label: "Desconto", value: "Desconto" },
  { label: "Auxiliar", value: "Auxiliar" },
  { label: "Informativa", value: "Informativa" },
];

const folhaConformidadeJornadaOptions = [
  { label: "20 horas", value: "20 horas" },
  { label: "30 horas", value: "30 horas" },
  { label: "40 horas", value: "40 horas" },
  { label: "Dedicação exclusiva", value: "Dedicação exclusiva" },
];

const folhaConformidadeNivelOptions = [
  { label: "Fundamental", value: "Fundamental" },
  { label: "Médio", value: "Médio" },
  { label: "Superior", value: "Superior" },
  { label: "Estratégico", value: "Estratégico" },
];

const folhaConformidadeClasseOptions = [
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "C", value: "C" },
  { label: "D", value: "D" },
];

const folhaConformidadeExecucaoOptions = [
  { label: "001 - Processamento inicial", value: "001" },
  { label: "002 - Reprocessamento parcial", value: "002" },
  { label: "003 - Processamento final", value: "003" },
];

const folhaConformidadeTipoAfastamentoOptions = [
  { label: "Licença saúde", value: "Licença saúde" },
  { label: "Licença maternidade", value: "Licença maternidade" },
  { label: "Afastamento sem remuneração", value: "Afastamento sem remuneração" },
  { label: "Cessão", value: "Cessão" },
];

const folhaConformidadeColunasPadrao = [
  "Órgão",
  "Setor",
  "Tipo de vínculo",
  "Regime jurídico",
  "Categoria",
  "Cargo",
  "Matrícula",
  "CPF",
  "Sexo",
  "Escolaridade",
  "Idade",
  "Nível",
  "Classe",
];

const folhaConformidadeMapaColunas = [
  {
    key: "funcionais",
    titulo: "Filtros funcionais",
    colunas: folhaConformidadeColunasPadrao,
  },
  {
    key: "folha",
    titulo: "Filtros de Folha",
    colunas: [
      "Competência",
      "Mês/AAAA até",
      "Número da Folha",
      "Nome da Folha",
      "Número da execução do processamento",
      "Data do processamento",
    ],
  },
  {
    key: "rubrica",
    titulo: "Filtro de Rubrica",
    colunas: [
      "Código da Rubrica",
      "Tipo da Rubrica",
      "Total Valor Rubrica Desconto",
      "Total Valor Rubrica Vantagem",
    ],
  },
  {
    key: "financeiros",
    titulo: "Filtros Financeiros",
    colunas: ["Valor Bruto", "Valor Líquido"],
  },
  {
    key: "frequencia",
    titulo: "Filtros de frequência / afastamento",
    colunas: [
      "Frequência",
      "Motivo do Afastamento",
      "Tipo de Afastamento",
      "Quantidade de dias afastado",
    ],
  },
  {
    key: "previdenciarios",
    titulo: "Filtros previdenciários / INSS",
    colunas: ["Valor Base INSS", "INSS Pago", "INSS Simulado", "Data Aposentadoria"],
  },
  {
    key: "outros",
    titulo: "Outros filtros",
    colunas: ["Jornada", "Data de Exercício"],
  },
] as const;

const folhaConformidadeTodasColunas = folhaConformidadeMapaColunas.flatMap(
  (grupo) => grupo.colunas,
);

const folhaConformidadeSituacaoAnaliseOptions = [
  { label: "Todas", value: "" },
  { label: "Pendente", value: "Pendente" },
  { label: "Conforme", value: "Conforme" },
  { label: "Inconsistente", value: "Inconsistente" },
  { label: "Justificado", value: "Justificado" },
];

const folhaConformidadeRows: FolhaConformidadeRow[] = [
  {
    id: 1,
    matricula: "102030",
    vinculo: "1",
    servidor: "MARIA OLIVEIRA",
    orgao: "SEPLAG",
    subcategoria: "Administrativa",
    folha: "01",
    rubrica: "992 - Auxílio Alimentação",
    dataInicioExercicio: "15/02/2018",
    dataFimExercicio: "",
    dataAposentadoria: "",
    valorBaseInss: "R$ 4.820,45",
    inssPago: "R$ 530,25",
    inssSimulado: "R$ 530,25",
    vantagens: "R$ 850,00",
    descontos: "R$ 0,00",
    liquido: "R$ 850,00",
    valorVanMesAnterior: "R$ 850,00",
    valorDesMesAnterior: "R$ 0,00",
    valorLiqMesAnterior: "R$ 850,00",
    alerta: "Rubrica sensível em vínculo inativo",
    situacaoAnalise: "Inconsistente",
  },
  {
    id: 2,
    matricula: "204411",
    vinculo: "2",
    servidor: "JOÃO PEREIRA",
    orgao: "SEDUC",
    subcategoria: "Magistério",
    folha: "01",
    rubrica: "8019 - Saldo ALN",
    dataInicioExercicio: "03/08/2021",
    dataFimExercicio: "",
    dataAposentadoria: "",
    valorBaseInss: "R$ 3.945,10",
    inssPago: "R$ 434,00",
    inssSimulado: "R$ 441,32",
    vantagens: "R$ 0,00",
    descontos: "R$ 1.245,90",
    liquido: "-R$ 312,10",
    valorVanMesAnterior: "R$ 0,00",
    valorDesMesAnterior: "R$ 1.180,45",
    valorLiqMesAnterior: "R$ -280,10",
    alerta: "ALN pendente",
    situacaoAnalise: "Pendente",
  },
  {
    id: 3,
    matricula: "887120",
    vinculo: "1",
    servidor: "ANA SANTOS",
    orgao: "SES",
    subcategoria: "Assistencial",
    folha: "02",
    rubrica: "5250 - Desconto LSF",
    dataInicioExercicio: "22/11/2016",
    dataFimExercicio: "",
    dataAposentadoria: "",
    valorBaseInss: "R$ 5.102,88",
    inssPago: "R$ 561,31",
    inssSimulado: "R$ 561,31",
    vantagens: "R$ 0,00",
    descontos: "R$ 486,34",
    liquido: "R$ 3.214,65",
    valorVanMesAnterior: "R$ 0,00",
    valorDesMesAnterior: "R$ 472,20",
    valorLiqMesAnterior: "R$ 3.240,18",
    alerta: "Afastamento com desconto",
    situacaoAnalise: "Conforme",
  },
  {
    id: 4,
    matricula: "451278",
    vinculo: "3",
    servidor: "CARLOS ALMEIDA",
    orgao: "PGE",
    subcategoria: "Jurídica",
    folha: "31",
    rubrica: "8014 - Ordem Judicial",
    dataInicioExercicio: "10/01/2014",
    dataFimExercicio: "",
    dataAposentadoria: "",
    valorBaseInss: "R$ 6.840,00",
    inssPago: "R$ 751,12",
    inssSimulado: "R$ 760,48",
    vantagens: "R$ 2.900,00",
    descontos: "R$ 0,00",
    liquido: "R$ 2.900,00",
    valorVanMesAnterior: "R$ 2.900,00",
    valorDesMesAnterior: "R$ 0,00",
    valorLiqMesAnterior: "R$ 2.900,00",
    alerta: "Lançamento manual exige processo",
    situacaoAnalise: "Justificado",
  },
  {
    id: 5,
    matricula: "874512",
    vinculo: "2",
    servidor: "JOSÉ ROBERTO LIMA",
    orgao: "MTI",
    subcategoria: "Tecnologia",
    folha: "40",
    rubrica: "1006 - Previdência RPPS",
    dataInicioExercicio: "05/03/2019",
    dataFimExercicio: "",
    dataAposentadoria: "",
    valorBaseInss: "R$ 5.995,30",
    inssPago: "R$ 712,33",
    inssSimulado: "R$ 712,33",
    vantagens: "R$ 0,00",
    descontos: "R$ 712,33",
    liquido: "R$ 5.840,12",
    valorVanMesAnterior: "R$ 0,00",
    valorDesMesAnterior: "R$ 705,10",
    valorLiqMesAnterior: "R$ 5.798,44",
    alerta: "Retenção previdenciária conferida",
    situacaoAnalise: "Conforme",
  },
  {
    id: 6,
    matricula: "339870",
    vinculo: "1",
    servidor: "PAULA FERNANDES",
    orgao: "SEPLAG",
    subcategoria: "Planejamento",
    folha: "60",
    rubrica: "1001 - Salário Básico",
    dataInicioExercicio: "18/07/2017",
    dataFimExercicio: "",
    dataAposentadoria: "",
    valorBaseInss: "R$ 7.200,00",
    inssPago: "R$ 792,00",
    inssSimulado: "R$ 792,00",
    vantagens: "R$ 7.200,00",
    descontos: "R$ 0,00",
    liquido: "R$ 6.420,45",
    valorVanMesAnterior: "R$ 7.050,00",
    valorDesMesAnterior: "R$ 0,00",
    valorLiqMesAnterior: "R$ 6.300,15",
    alerta: "Checklist da folha pendente",
    situacaoAnalise: "Pendente",
  },
  {
    id: 7,
    matricula: "540110",
    vinculo: "2",
    servidor: "MARCOS VINÍCIUS",
    orgao: "SESP",
    subcategoria: "Operacional",
    folha: "61",
    rubrica: "1002 - Adicional Noturno",
    dataInicioExercicio: "12/09/2020",
    dataFimExercicio: "",
    dataAposentadoria: "",
    valorBaseInss: "R$ 4.550,00",
    inssPago: "R$ 500,50",
    inssSimulado: "R$ 498,10",
    vantagens: "R$ 430,00",
    descontos: "R$ 0,00",
    liquido: "R$ 4.120,00",
    valorVanMesAnterior: "R$ 395,00",
    valorDesMesAnterior: "R$ 0,00",
    valorLiqMesAnterior: "R$ 4.010,90",
    alerta: "Jornada divergente",
    situacaoAnalise: "Inconsistente",
  },
  {
    id: 8,
    matricula: "778899",
    vinculo: "1",
    servidor: "LÚCIA BARROS",
    orgao: "SEFAZ",
    subcategoria: "Fiscal",
    folha: "01",
    rubrica: "5250 - Desconto LSF",
    dataInicioExercicio: "28/04/2015",
    dataFimExercicio: "",
    dataAposentadoria: "",
    valorBaseInss: "R$ 4.280,77",
    inssPago: "R$ 470,88",
    inssSimulado: "R$ 470,88",
    vantagens: "R$ 0,00",
    descontos: "R$ 260,00",
    liquido: "R$ 3.980,77",
    valorVanMesAnterior: "R$ 0,00",
    valorDesMesAnterior: "R$ 248,00",
    valorLiqMesAnterior: "R$ 3.915,12",
    alerta: "Afastamento validado",
    situacaoAnalise: "Conforme",
  },
  {
    id: 9,
    matricula: "665544",
    vinculo: "4",
    servidor: "RENATO COSTA",
    orgao: "SEDUC",
    subcategoria: "Apoio escolar",
    folha: "02",
    rubrica: "8014 - Ordem Judicial",
    dataInicioExercicio: "09/12/2013",
    dataFimExercicio: "14/05/2026",
    dataAposentadoria: "15/05/2026",
    valorBaseInss: "R$ 3.120,00",
    inssPago: "R$ 343,20",
    inssSimulado: "R$ 349,40",
    vantagens: "R$ 0,00",
    descontos: "R$ 980,00",
    liquido: "R$ 2.630,00",
    valorVanMesAnterior: "R$ 0,00",
    valorDesMesAnterior: "R$ 950,00",
    valorLiqMesAnterior: "R$ 2.700,00",
    alerta: "Processo judicial sem documento",
    situacaoAnalise: "Justificado",
  },
  {
    id: 10,
    matricula: "112233",
    vinculo: "1",
    servidor: "BIANCA MORAES",
    orgao: "SES",
    subcategoria: "Enfermagem",
    folha: "40",
    rubrica: "992 - Auxílio Alimentação",
    dataInicioExercicio: "17/06/2022",
    dataFimExercicio: "",
    dataAposentadoria: "",
    valorBaseInss: "R$ 5.360,00",
    inssPago: "R$ 589,60",
    inssSimulado: "R$ 589,60",
    vantagens: "R$ 850,00",
    descontos: "R$ 0,00",
    liquido: "R$ 5.150,90",
    valorVanMesAnterior: "R$ 820,00",
    valorDesMesAnterior: "R$ 0,00",
    valorLiqMesAnterior: "R$ 5.030,45",
    alerta: "Sem alerta",
    situacaoAnalise: "Conforme",
  },
];

const folhaConformidadeHistoricoRows: FolhaConformidadeHistoricoRow[] = [
  {
    id: 1,
    dataHoraEmissao: "22/05/2026 17:40",
    numeroFolha: "01",
    nomeFolha: "Folha Normal",
    competencia: "05/2026",
    tipoRelatorio: "Sintético",
    solicitante: "ROBERTO JUNIOR",
    situacao: "Emitido",
  },
  {
    id: 2,
    dataHoraEmissao: "22/05/2026 10:18",
    numeroFolha: "01",
    nomeFolha: "Folha Normal",
    competencia: "05/2026",
    tipoRelatorio: "Comparativo mensal",
    solicitante: "EQUIPE GCFP",
    situacao: "Em Emissão",
  },
  {
    id: 3,
    dataHoraEmissao: "21/05/2026 16:05",
    numeroFolha: "02",
    nomeFolha: "Folha com descontos",
    competencia: "05/2026",
    tipoRelatorio: "Retenções",
    solicitante: "EQUIPE GCFP",
    situacao: "Falha na Emissão",
  },
];

const folhaConformidadeFiltrosSalvosMock: FolhaConformidadeFiltroSalvoRow[] = [
  {
    id: 1,
    nome: "Conferência mensal SEPLAG",
    visibilidade: "PRIVADO",
    criadoEm: "22/05/2026",
    atualizadoEm: "22/05/2026",
    criadoPor: "ROBERTO JUNIOR",
    filtros: {
      ...folhaConformidadeDefaultFilters,
      orgaos: ["SEPLAG"],
      competencia: "05/2026",
      numeroFolha: ["01"],
    },
    colunas: folhaConformidadeTodasColunas,
  },
  {
    id: 2,
    nome: "Rubricas sensíveis",
    visibilidade: "PÚBLICO",
    criadoEm: "21/05/2026",
    atualizadoEm: "21/05/2026",
    criadoPor: "EQUIPE GCFP",
    filtros: {
      ...folhaConformidadeDefaultFilters,
      codigoRubrica: ["1006 - PREVIDÊNCIA RPPS"],
      tipoRubrica: ["Desconto"],
    },
    colunas: [
      "Órgão",
      "Matrícula",
      "Nome da Folha",
      "Código da Rubrica",
      "Tipo da Rubrica",
      "Valor Bruto",
      "Valor Líquido",
    ],
  },
  {
    id: 3,
    nome: "Privado de outro usuário",
    visibilidade: "PRIVADO",
    criadoEm: "20/05/2026",
    atualizadoEm: "20/05/2026",
    criadoPor: "OUTRO USUARIO",
    filtros: {
      ...folhaConformidadeDefaultFilters,
      orgaos: ["SES"],
    },
    colunas: folhaConformidadeTodasColunas,
  },
];

const folhaConformidadeVisibilidadeFiltroOptions = [
  { label: "PRIVADO", value: "PRIVADO" },
  { label: "PÚBLICO", value: "PÚBLICO" },
];

const grupoFolhaRubricaOptions = [
  { label: "1001 - SALÁRIO BÁSICO", value: "1001 - SALÁRIO BÁSICO" },
  { label: "1002 - ADICIONAL NOTURNO", value: "1002 - ADICIONAL NOTURNO" },
  { label: "1003 - DÉCIMO TERCEIRO", value: "1003 - DÉCIMO TERCEIRO" },
  { label: "1004 - VALE ALIMENTAÇÃO", value: "1004 - VALE ALIMENTAÇÃO" },
  { label: "1006 - PREVIDÊNCIA RPPS", value: "1006 - PREVIDÊNCIA RPPS" },
];

const grupoFolhaRelatorioOptions = [
  { label: "Resumo financeiro", value: "Resumo financeiro" },
  { label: "Divergências por servidor", value: "Divergências por servidor" },
  { label: "Alertas de jornada", value: "Alertas de jornada" },
  { label: "Comparativo entre versões", value: "Comparativo entre versões" },
];

const folhaPagamentoTabs: TabItemSeplag<string>[] = [
  { label: "Dados da Folha", value: "dados", col: "lg:col-4" },
  { label: "Abrangência", value: "abrangencia", col: "lg:col-4" },
  { label: "Parâmetros de Cálculo", value: "parametros", col: "lg:col-4" },
];

const catalogoRubricaStatusOptions = [
  { label: "Todos", value: "" },
  { label: "Ativa", value: "Ativa" },
  { label: "Inativa", value: "Inativa" },
  { label: "Extintas", value: "Extintas" },
];

const rubricaStatusBadge: Record<RubricaRow["status"], { label: string; color: string; bg: string; icon: string }> = {
  Ativa: { label: "Ativa", color: "#168821", bg: "#d4edda", icon: "pi pi-check" },
  Inativa: { label: "Inativa", color: "#c0392b", bg: "#fde8e6", icon: "pi pi-ban" },
  Extintas: { label: "Extintas", color: "#b42318", bg: "#fee4e2", icon: "pi pi-times-circle" },
};

const catalogoRubricasMock: RubricaRow[] = [
  {
    id: 1,
    codigo: "1001",
    nomeRubrica: "SALÁRIO BÁSICO",
    naturezaVerba: "Provento",
    dataAprovacao: "10/05/2026",
    status: "Ativa",
  },
  {
    id: 2,
    codigo: "1002",
    nomeRubrica: "ADICIONAL NOTURNO",
    naturezaVerba: "Provento",
    dataAprovacao: "02/05/2026",
    status: "Inativa",
  },
  {
    id: 3,
    codigo: "1003",
    nomeRubrica: "DÉCIMO TERCEIRO",
    naturezaVerba: "Provento",
    dataAprovacao: "15/04/2026",
    status: "Extintas",
  },
  {
    id: 4,
    codigo: "1004",
    nomeRubrica: "VALE ALIMENTAÇÃO",
    naturezaVerba: "Provento",
    dataAprovacao: "18/05/2026",
    status: "Ativa",
  },
  {
    id: 5,
    codigo: "1005",
    nomeRubrica: "CONTRIBUIÇÃO SINDICAL",
    naturezaVerba: "Desconto",
    dataAprovacao: "22/05/2026",
    status: "Inativa",
  },
  {
    id: 6,
    codigo: "1006",
    nomeRubrica: "PREVIDÊNCIA RPPS",
    naturezaVerba: "Desconto",
    dataAprovacao: "23/05/2026",
    status: "Ativa",
  },
  {
    id: 7,
    codigo: "1007",
    nomeRubrica: "IRRF",
    naturezaVerba: "Desconto",
    dataAprovacao: "24/05/2026",
    status: "Ativa",
  },
  {
    id: 8,
    codigo: "1008",
    nomeRubrica: "GRATIFICAÇÃO DE FUNÇÃO",
    naturezaVerba: "Provento",
    dataAprovacao: "25/05/2026",
    status: "Ativa",
  },
  {
    id: 9,
    codigo: "1009",
    nomeRubrica: "AUXÍLIO TRANSPORTE",
    naturezaVerba: "Provento",
    dataAprovacao: "26/05/2026",
    status: "Ativa",
  },
  {
    id: 10,
    codigo: "1010",
    nomeRubrica: "BASE PREVIDENCIÁRIA",
    naturezaVerba: "Provento",
    dataAprovacao: "27/05/2026",
    status: "Ativa",
  },
  {
    id: 11,
    codigo: "1011",
    nomeRubrica: "TETO REMUNERATÓRIO",
    naturezaVerba: "Desconto",
    dataAprovacao: "28/05/2026",
    status: "Ativa",
  },
  {
    id: 12,
    codigo: "1012",
    nomeRubrica: "MEMÓRIA DE CÁLCULO",
    naturezaVerba: "Provento",
    dataAprovacao: "29/05/2026",
    status: "Ativa",
  },
  {
    id: 13,
    codigo: "1013",
    nomeRubrica: "ADICIONAL DE INSALUBRIDADE",
    naturezaVerba: "Provento",
    dataAprovacao: "30/05/2026",
    status: "Inativa",
  },
  {
    id: 14,
    codigo: "1014",
    nomeRubrica: "DEVOLUÇÃO DE VALORES",
    naturezaVerba: "Desconto",
    dataAprovacao: "31/05/2026",
    status: "Extintas",
  },
];

const gruposCalculoMock: GrupoCalculoRow[] = [
  {
    id: 1,
    codigo: "G001",
    grupo: "Geral",
    nivel: 1,
    herdaDe: "-",
    orgaoSetor: "Todos",
    tipoVinculo: "Todos",
    situacao: STATUS_OPERACIONAL_VIGENCIA.ATIVO,
    inicioVigencia: "01/01/2026",
    fimVigencia: "-",
    rubricas: 42,
    pendencias: 0,
  },
  {
    id: 2,
    codigo: "G010",
    grupo: "Efetivos",
    nivel: 2,
    herdaDe: "Geral",
    orgaoSetor: "Todos",
    tipoVinculo: "Efetivo",
    situacao: STATUS_OPERACIONAL_VIGENCIA.ATIVO,
    inicioVigencia: "01/01/2026",
    fimVigencia: "-",
    rubricas: 35,
    pendencias: 0,
  },
  {
    id: 3,
    codigo: "G011",
    grupo: "Efetivos SEDUC",
    nivel: 3,
    herdaDe: "Efetivos",
    orgaoSetor: "SEDUC",
    tipoVinculo: "Efetivo",
    situacao: STATUS_OPERACIONAL_VIGENCIA.AGENDADO_ENCERRAMENTO,
    inicioVigencia: "01/01/2026",
    fimVigencia: "06/2026",
    rubricas: 38,
    pendencias: 1,
  },
  {
    id: 4,
    codigo: "G020",
    grupo: "Contratados",
    nivel: 2,
    herdaDe: "Geral",
    orgaoSetor: "Todos",
    tipoVinculo: "Contratado",
    situacao: STATUS_OPERACIONAL_VIGENCIA.ATIVO,
    inicioVigencia: "01/01/2026",
    fimVigencia: "-",
    rubricas: 21,
    pendencias: 0,
  },
  {
    id: 5,
    codigo: "G030",
    grupo: "Comissionados",
    nivel: 2,
    herdaDe: "Geral",
    orgaoSetor: "Todos",
    tipoVinculo: "Comissionado",
    situacao: STATUS_OPERACIONAL_VIGENCIA.AGENDADO,
    inicioVigencia: "01/06/2026",
    fimVigencia: "-",
    rubricas: 18,
    pendencias: 2,
  },
  {
    id: 6,
    codigo: "G040",
    grupo: "Inativos",
    nivel: 2,
    herdaDe: "Geral",
    orgaoSetor: "Todos",
    tipoVinculo: "Aposentado",
    situacao: STATUS_OPERACIONAL_VIGENCIA.ENCERRADO,
    inicioVigencia: "01/01/2025",
    fimVigencia: "31/12/2025",
    rubricas: 27,
    pendencias: 0,
  },
  {
    id: 7,
    codigo: "G041",
    grupo: "Pensionistas",
    nivel: 2,
    herdaDe: "Geral",
    orgaoSetor: "Todos",
    tipoVinculo: "Pensionista",
    situacao: "ENCERRADO",
    inicioVigencia: "01/02/2026",
    fimVigencia: "08/2026",
    rubricas: 16,
    pendencias: 3,
  },
  {
    id: 8,
    codigo: "G050",
    grupo: "Efetivos PGE",
    nivel: 3,
    herdaDe: "Efetivos",
    orgaoSetor: "PGE",
    tipoVinculo: "Efetivo",
    situacao: "ATIVO",
    inicioVigencia: "01/01/2026",
    fimVigencia: "-",
    rubricas: 38,
    pendencias: 1,
  },
  {
    id: 9,
    codigo: "G060",
    grupo: "Professores SEDUC 40h",
    nivel: 4,
    herdaDe: "Efetivos SEDUC",
    orgaoSetor: "SEDUC",
    tipoVinculo: "Efetivo",
    situacao: "ATIVO",
    inicioVigencia: "01/03/2026",
    fimVigencia: "-",
    rubricas: 44,
    pendencias: 0,
  },
  {
    id: 10,
    codigo: "G070",
    grupo: "Contratados SEPLAG",
    nivel: 3,
    herdaDe: "Contratados",
    orgaoSetor: "SEPLAG",
    tipoVinculo: "Contratado",
    situacao: "ENCERRADO",
    inicioVigencia: "01/01/2025",
    fimVigencia: "30/04/2026",
    rubricas: 19,
    pendencias: 0,
  },
];

const gruposCalculoVersoesMock: Record<number, GrupoCalculoRow[]> = {
  1: [
    gruposCalculoMock[0],
    {
      ...gruposCalculoMock[0],
      codigo: "G001-V1",
      situacao: "ENCERRADO",
      inicioVigencia: "01/01/2025",
      fimVigencia: "31/12/2025",
      rubricas: 39,
    },
  ],
  2: [
    gruposCalculoMock[1],
    {
      ...gruposCalculoMock[1],
      codigo: "G010-V1",
      situacao: "ENCERRADO",
      inicioVigencia: "01/01/2025",
      fimVigencia: "31/12/2025",
      rubricas: 31,
    },
  ],
  3: [
    gruposCalculoMock[2],
    {
      ...gruposCalculoMock[2],
      codigo: "G011-V2",
      situacao: "ATIVO",
      inicioVigencia: "01/01/2026",
      fimVigencia: "31/05/2026",
      rubricas: 36,
      pendencias: 0,
    },
    {
      ...gruposCalculoMock[2],
      codigo: "G011-V1",
      situacao: "ENCERRADO",
      inicioVigencia: "01/03/2025",
      fimVigencia: "31/12/2025",
      rubricas: 34,
      pendencias: 0,
    },
  ],
  4: [gruposCalculoMock[3]],
  5: [
    gruposCalculoMock[4],
    {
      ...gruposCalculoMock[4],
      codigo: "G030-V1",
      situacao: "ENCERRADO",
      inicioVigencia: "01/01/2025",
      fimVigencia: "31/12/2025",
      rubricas: 15,
      pendencias: 0,
    },
  ],
  6: [gruposCalculoMock[5]],
  7: [gruposCalculoMock[6]],
  8: [gruposCalculoMock[7]],
  9: [gruposCalculoMock[8]],
  10: [gruposCalculoMock[9]],
};

const grupoEleitoParticipantesMock: GrupoEleitoParticipanteRow[] = [
  {
    id: 1,
    matricula: "139151",
    cpf: "012.014.025-02",
    vinculo: "15",
    servidor: "ADRIANA MAMEDES MENDONÇA",
    orgaoEntidade: "",
    dataExercicioAposentadoria: "21/04/2026",
  },
  {
    id: 2,
    matricula: "309263",
    cpf: "123.456.789-00",
    vinculo: "1",
    servidor: "MARIA 322373",
    orgaoEntidade: "",
    dataExercicioAposentadoria: "01/01/2001",
  },
  {
    id: 3,
    matricula: "309263",
    cpf: "123.456.789-00",
    vinculo: "2",
    servidor: "MARIA 322373",
    orgaoEntidade: "",
    dataExercicioAposentadoria: "",
  },
  {
    id: 4,
    matricula: "",
    cpf: "456.789.123-11",
    vinculo: "3",
    servidor: "ABELARDO PINTO TELES",
    orgaoEntidade: "",
    dataExercicioAposentadoria: "11/09/2025",
  },
  {
    id: 5,
    matricula: "",
    cpf: "012.014.025-02",
    vinculo: "9",
    servidor: "ABELVAL LUIZ GOMES DA SILVA",
    orgaoEntidade: "",
    dataExercicioAposentadoria: "10/12/2025",
  },
  {
    id: 6,
    matricula: "322603",
    cpf: "012.014.025-02",
    vinculo: "9",
    servidor: "ADRIANA MAMEDES MENDONÇA",
    orgaoEntidade: "",
    dataExercicioAposentadoria: "20/04/2026",
  },
];

const instituicaoOptions = [
  { label: "SEPLAG", value: "seplag" },
  { label: "Casa Civil", value: "casa-civil" },
  { label: "MTI", value: "mti" },
];

const regimeInstituicaoOptions = [{ label: "GOVMT", value: "govmt" }];

const regimeTesteInstituicaoOptions = [
  { label: "GOVMT", value: "govmt" },
  { label: "MTI", value: "mti" },
  { label: "METAMAT", value: "metamat" },
  { label: "JUCEMAT", value: "jucemat" },
  { label: "PMMT", value: "pmmt" },
  { label: "CBMMT", value: "cbmmt" },
];

const grupoCalculoInstituicaoOptions = [
  { label: "GOVMT", value: "govmt" },
  { label: "METAMAT", value: "metamat" },
  { label: "UCEMAT", value: "ucemat" },
  { label: "MTI", value: "mti" },
];

const grupoCalculoOrgaoOptions = [
  { label: "Todos", value: "todos" },
  { label: "SEPLAG", value: "seplag" },
  { label: "SEDUC", value: "seduc" },
  { label: "PGE", value: "pge" },
];

const grupoCalculoSetorOptions = [
  { label: "Todos os setores", value: "todos" },
  { label: "Administração Central", value: "administracao-central" },
  { label: "Unidade Setorial", value: "unidade-setorial" },
  { label: "Coordenadoria de Folha", value: "coordenadoria-folha" },
  { label: "Superintendência de Gestão de Pessoas", value: "superintendencia-gestao-pessoas" },
  { label: "Coordenadoria Financeira", value: "coordenadoria-financeira" },
  { label: "Escolas Estaduais", value: "escolas-estaduais" },
  { label: "Gestão Escolar", value: "gestao-escolar" },
  { label: "Projetos Educacionais", value: "projetos-educacionais" },
  { label: "Procuradoria Administrativa", value: "procuradoria-administrativa" },
  { label: "Procuradoria Judicial", value: "procuradoria-judicial" },
];

const grupoCalculoCategoriaOptions = folhaPagamentoCategoriaOptions.filter((option) => option.value);

const grupoCalculoSubcategoriaOptions = [
  { label: "Administração Direta", value: "administracao-direta" },
  { label: "Defesa Agropecuária", value: "defesa-agropecuaria" },
  { label: "Tecnologia da Informação", value: "tecnologia-informacao" },
  { label: "Educação Básica", value: "educacao-basica" },
];

const grupoCalculoCargoOptions = folhaPagamentoCargoOptions.filter((option) => option.value);

const grupoCalculoTipoFolhaOptions = [
  { label: "Normal", value: "normal" },
  { label: "13º Salário", value: "decimo-terceiro" },
  { label: "Férias", value: "ferias" },
  { label: "Rescisória", value: "rescisoria" },
  { label: "Complementar", value: "complementar" },
];

const grupoCalculoTipoVinculoOptions = [
  { label: "Efetivo", value: "efetivo" },
  { label: "Contratado", value: "contratado" },
  { label: "Comissionado", value: "comissionado" },
  { label: "Aposentado", value: "aposentado" },
];

const grupoCalculoFiltroTipoVinculoOptions = [
  { label: "Todos", value: "todos" },
  ...grupoCalculoTipoVinculoOptions,
];

const grupoCalculoSuperiorOptions = [
  { label: "Nenhum", value: "nenhum" },
  { label: "Geral", value: "Geral" },
  { label: "Efetivos", value: "Efetivos" },
  { label: "Contratados", value: "Contratados" },
  { label: "Comissionados", value: "Comissionados" },
];

const grupoCalculoRegimeJuridicoOptions = regimesJuridicosMock.map((regime) => ({
  label: regime.nome,
  value: regime.nome,
}));

const grupoCalculoPaoeOptions = [
  { label: "PAOE-001 - Órgão de Lotação", value: "PAOE-001 - Órgão de Lotação" },
  { label: "PAOE-002 - Projeto de Educação", value: "PAOE-002 - Projeto de Educação" },
  { label: "PAOE-003 - Projeto de Saúde", value: "PAOE-003 - Projeto de Saúde" },
  { label: "PAOE-004 - Administração Central", value: "PAOE-004 - Administração Central" },
];

const grupoCalculoRubricasPorFiltro: Record<string, string[]> = {
  "regime:ESTATUTARIO CIVIL": ["1001", "1006", "1007", "1008", "1010", "1011"],
  "regime:ESTATUTARIO MILITAR": ["1001", "1006", "1007", "1008", "1010", "1011"],
  "regime:MILITAR TEMPORARIO": ["1001", "1002", "1007", "1009", "1010"],
  "regime:REGIME CELETISTA": ["1001", "1002", "1005", "1007", "1009", "1013"],
  "regime:REGIME ESPECIAL": ["1001", "1007", "1008", "1012", "1014"],
  "regime:REGIME MISTO": ["1001", "1006", "1007", "1008", "1009", "1010", "1011"],
  "vinculo:efetivo": ["1001", "1003", "1006", "1007", "1008", "1009", "1010", "1011"],
  "vinculo:contratado": ["1001", "1002", "1003", "1007", "1009", "1013"],
  "vinculo:comissionado": ["1001", "1003", "1007", "1008", "1011", "1012"],
  "vinculo:aposentado": ["1001", "1006", "1007", "1010", "1011", "1014"],
  "instituicao:govmt": ["1001", "1003", "1006", "1007", "1008", "1009", "1010", "1011"],
  "instituicao:metamat": ["1001", "1002", "1007", "1009", "1013", "1014"],
  "instituicao:ucemat": ["1001", "1003", "1007", "1008", "1011", "1012"],
  "instituicao:mti": ["1001", "1002", "1007", "1008", "1009", "1012", "1013"],
  "orgao:todos": ["1001", "1002", "1003", "1005", "1006", "1007", "1008", "1009", "1010", "1011", "1012", "1013", "1014"],
  "orgao:seplag": ["1001", "1003", "1006", "1007", "1008", "1010", "1011"],
  "orgao:seduc": ["1001", "1002", "1003", "1007", "1009", "1013"],
  "orgao:pge": ["1001", "1003", "1006", "1007", "1008", "1011", "1012"],
  "herdar:Geral": ["1001", "1003", "1007", "1012"],
  "herdar:Efetivos": ["1001", "1003", "1006", "1007", "1008", "1010", "1011"],
  "herdar:Contratados": ["1001", "1002", "1003", "1007", "1009", "1013"],
  "herdar:Comissionados": ["1001", "1003", "1007", "1008", "1011", "1012"],
};

const grupoCalculoRubricasPorCombinacao: Record<string, string[]> = {
  "ESTATUTARIO CIVIL|efetivo|govmt|seplag|Geral": ["1001", "1003", "1006", "1007", "1008", "1010", "1011"],
  "ESTATUTARIO CIVIL|aposentado|govmt|seplag|Efetivos": ["1001", "1006", "1007", "1010", "1011", "1014"],
  "REGIME CELETISTA|contratado|metamat|seduc|Contratados": ["1001", "1002", "1003", "1005", "1007", "1009", "1013"],
  "ESTATUTARIO CIVIL|comissionado|ucemat|pge|Comissionados": ["1001", "1003", "1007", "1008", "1011", "1012"],
  "REGIME ESPECIAL|comissionado|mti|seplag|nenhum": ["1001", "1007", "1008", "1012", "1014"],
  "MILITAR TEMPORARIO|contratado|govmt|todos|Geral": ["1001", "1002", "1007", "1009", "1010"],
  "ESTATUTARIO MILITAR|efetivo|govmt|todos|Geral": ["1001", "1003", "1006", "1007", "1008", "1010", "1011"],
  "REGIME MISTO|efetivo|mti|seplag|Efetivos": ["1001", "1006", "1007", "1008", "1009", "1010", "1011"],
};

const grupoCalculoNivelOptions = [
  { label: "Geral", value: "geral" },
  { label: "Vínculo", value: "vinculo" },
  { label: "Órgão", value: "orgao" },
  { label: "Cargo", value: "cargo" },
  { label: "Setor", value: "setor" },
  { label: "Especial", value: "especial" },
];

const grupoCalculoSimNaoOptions = [
  { label: "Sim", value: "sim" },
  { label: "Não", value: "nao" },
];

const grupoCalculoSituacaoOptions = [
  { label: "Aguardando Aprovação", value: "RASCUNHO" },
  { label: "Ativo", value: "ATIVO" },
  { label: "Encerrado", value: "ENCERRADO" },
];

const grupoCalculoSituacaoMeta: Record<
  GrupoCalculoSituacao,
  { label: string; color: string; bg: string; border: string }
> = {
  RASCUNHO: {
    label: "Aguardando Aprovação",
    color: "#9a6500",
    bg: "#fff1c7",
    border: "#fff1c7",
  },
  ATIVO: {
    label: "Ativo",
    color: "#00843d",
    bg: "#dff3e7",
    border: "#dff3e7",
  },
  ENCERRADO: {
    label: "Encerrado",
    color: "#334e68",
    bg: "#e2e8f0",
    border: "#e2e8f0",
  },
};

function mapGrupoCalculoSituacao(
  situacao?: GrupoCalculoSituacao | StatusOperacionalVigenciaSeplag,
): SituacaoVigenciaValueSeplag["situacao"] {
  if (normalizeGrupoCalculoSituacao(situacao) === "ENCERRADO") {
    return SITUACAO_VIGENCIA.ENCERRADO;
  }

  return SITUACAO_VIGENCIA.ATIVO;
}

function normalizeGrupoCalculoSituacao(
  status?: GrupoCalculoSituacao | StatusOperacionalVigenciaSeplag,
): GrupoCalculoSituacao {
  if (status === "RASCUNHO" || status === "ATIVO" || status === "ENCERRADO") {
    return status;
  }

  if (status === STATUS_OPERACIONAL_VIGENCIA.AGENDADO) {
    return "RASCUNHO";
  }

  return "ENCERRADO";
}

function renderGrupoCalculoStatusBadge(
  status: GrupoCalculoSituacao | StatusOperacionalVigenciaSeplag,
) {
  const situacao = normalizeGrupoCalculoSituacao(status);
  const badge = grupoCalculoSituacaoMeta[situacao];

  return (
    <span className="prototype-grupo-calculo-status-badge-wrap">
      <span
        className={`prototype-sistema-status-badge ${
          situacao === "RASCUNHO" ? "prototype-sistema-status-badge--long" : ""
        }`}
        style={{
          color: badge.color,
          backgroundColor: badge.bg,
          borderColor: badge.border,
        }}
      >
        {badge.label}
      </span>
    </span>
  );
}

function getGrupoCalculoRubricaTipo(rubrica: RubricaRow) {
  if (["1003", "1010", "1012"].includes(rubrica.codigo)) return "Auxiliar";
  if (rubrica.naturezaVerba === "Desconto") return "Desconto";
  return "Vantagem";
}

function getGrupoCalculoRubricaTipoBadge(tipo: string) {
  if (tipo === "Desconto") {
    return {
      color: "#b42318",
      bg: "#fee4e2",
      border: "#fca5a5",
    };
  }

  if (tipo === "Auxiliar") {
    return {
      color: "#005a9c",
      bg: "#dbeafe",
      border: "#93c5fd",
    };
  }

  return {
    color: "#00843d",
    bg: "#d1fae5",
    border: "#bbf7d0",
  };
}

function getAmanhaDate() {
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  amanha.setHours(0, 0, 0, 0);
  return amanha;
}

function formatDatePtBr(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function parseIsoDateOnly(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function parsePtBrDateOnly(date?: string) {
  if (!date) return null;
  const [day, month, year] = date.split("/").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

function getRubricasGrupoCalculoPorAbrangencia({
  regimeJuridico,
  tipoVinculo,
  instituicao,
  orgao,
  herdarDe,
}: {
  regimeJuridico?: string;
  tipoVinculo?: string;
  instituicao?: string;
  orgao?: string;
  herdarDe?: string;
}) {
  const combinationKey = [
    regimeJuridico,
    tipoVinculo,
    instituicao,
    orgao,
    herdarDe,
  ].join("|");

  const exactCodes = grupoCalculoRubricasPorCombinacao[combinationKey];
  if (exactCodes) return exactCodes;

  const filterKeys = [
    regimeJuridico ? `regime:${regimeJuridico}` : "",
    tipoVinculo ? `vinculo:${tipoVinculo}` : "",
    instituicao ? `instituicao:${instituicao}` : "",
    orgao ? `orgao:${orgao}` : "",
    herdarDe && herdarDe !== "nenhum" ? `herdar:${herdarDe}` : "",
  ].filter(Boolean);

  const codes = new Set<string>();
  filterKeys.forEach((filterKey) => {
    grupoCalculoRubricasPorFiltro[filterKey]?.forEach((codigo) =>
      codes.add(codigo),
    );
  });

  return Array.from(codes);
}

const grupoEleitoFiltroAvancadoOptions = {
  instituicoes: [
    { label: "Governo do Estado de Mato Grosso", value: "govmt" },
    { label: "SEPLAG-MT", value: "seplag" },
    { label: "MTI", value: "mti" },
  ],
  orgaos: [
    { label: "SEPLAG-MT", value: "seplag" },
    { label: "SEFAZ-MT", value: "sefaz" },
    { label: "SEDUC-MT", value: "seduc" },
  ],
  tiposVinculo: [
    { label: "Efetivo", value: "efetivo" },
    { label: "Comissionado", value: "comissionado" },
    { label: "Temporário", value: "temporario" },
  ],
  setores: [
    { label: "SAPGD", value: "sapgd" },
    { label: "CPPTI", value: "cppti" },
    { label: "Gabinete", value: "gabinete" },
  ],
  categorias: [
    { label: "Estatutário Civil", value: "estatutario-civil" },
    { label: "Militar", value: "militar" },
    { label: "Celetista", value: "celetista" },
  ],
  subcategorias: [
    { label: "Professor 30h", value: "professor-30h" },
    { label: "Professor 40h", value: "professor-40h" },
    { label: "Administrativo", value: "administrativo" },
  ],
  cargos: [
    { label: "Analista Administrativo", value: "analista-administrativo" },
    { label: "Técnico Administrativo", value: "tecnico-administrativo" },
    { label: "Gestor Governamental", value: "gestor-governamental" },
  ],
};

const situacaoOptions = [
  { label: "Ativo", value: "ATIVO" },
  { label: "Encerrado", value: "ENCERRADO" },
];

const ingressoTipoOptions = Array.from(
  new Set(ingressosMock.map((ingresso) => ingresso.tipoIngresso)),
).map((tipoIngresso) => ({ label: tipoIngresso, value: tipoIngresso }));

const ingressoTipoVinculoOptions = Array.from(
  new Set(ingressosMock.map((ingresso) => ingresso.tipoVinculo)),
).map((tipoVinculo) => ({ label: tipoVinculo, value: tipoVinculo }));

const ingressoOrgaoOptions = Array.from(
  new Set(ingressosMock.map((ingresso) => ingresso.orgao)),
).map((orgao) => ({ label: orgao, value: orgao }));

const ingressoCargoOptions = Array.from(
  new Set(ingressosMock.map((ingresso) => ingresso.cargo)),
).map((cargo) => ({ label: cargo, value: cargo }));

const ingressoSituacaoOptions = Array.from(
  new Set(ingressosMock.map((ingresso) => ingresso.situacao)),
).map((situacao) => ({ label: situacao, value: situacao }));

const cargoCategoriaOptions = Array.from(
  new Set(cargosMock.map((cargo) => cargo.categoria)),
).map((categoria) => ({ label: categoria, value: categoria }));

const cargoTesteCategoriaOptions = Array.from(
  new Set(cargosTesteMock.map((cargo) => cargo.categoria)),
).map((categoria) => ({ label: categoria, value: categoria }));

const cargoBaseLegalOptions = documentosLegaisMock.map((documento) => ({
  label: documento.titulo,
  value: documento.id,
}));

const cargoInstituicaoOptions = [
  { label: "Governo do Estado de Mato Grosso", value: "govmt" },
  { label: "SEPLAG", value: "seplag" },
  { label: "Casa Civil", value: "casa-civil" },
  { label: "MTI", value: "mti" },
];

const cargoSubcategoriaOptions = [
  { label: "Administração Direta", value: "administracao-direta" },
  { label: "Defesa Agropecuária", value: "defesa-agropecuaria" },
  { label: "Tecnologia da Informação", value: "tecnologia-informacao" },
  { label: "Educação Básica", value: "educacao-basica" },
];

const cargoTipoOptions = [
  { label: "Efetivo", value: "efetivo" },
  { label: "Comissionado", value: "comissionado" },
  { label: "Temporário", value: "temporario" },
];

const cargoNaturezaOptions = [
  { label: "Civil", value: "civil" },
  { label: "Militar", value: "militar" },
  { label: "Especial", value: "especial" },
];

const cargoFormaProvimentoOptions = [
  { label: "Concurso Público", value: "concurso-publico" },
  { label: "Nomeação", value: "nomeacao" },
  { label: "Contrato Temporário", value: "contrato-temporario" },
];

const cargoJornadaOptions = [
  { label: "20 horas", value: "20h" },
  { label: "30 horas", value: "30h" },
  { label: "40 horas", value: "40h" },
];

const cargoEscolaridadeOptions = [
  { label: "Ensino Fundamental", value: "fundamental" },
  { label: "Ensino Médio", value: "medio" },
  { label: "Ensino Superior", value: "superior" },
  { label: "Pós-graduação", value: "pos-graduacao" },
];

const cargoCboOptions = [
  { label: "2124-05 - Analista de sistemas", value: "2124-05" },
  { label: "2521-05 - Administrador", value: "2521-05" },
  { label: "3211-05 - Técnico agropecuário", value: "3211-05" },
];

const cargoEspecialidadeOptions = [
  { label: "Geral", value: "geral" },
  { label: "Software", value: "software" },
  { label: "Agropecuária", value: "agropecuaria" },
  { label: "Gestão Pública", value: "gestao-publica" },
];

const tipoVinculoNaturezaOptions = [
  { label: "Permanente", value: "Permanente" },
  { label: "Temporário", value: "Temporário" },
  { label: "Comissionado", value: "Comissionado" },
  { label: "Previdenciário", value: "Previdenciário" },
  { label: "Especial", value: "Especial" },
  { label: "Requisitado/Cedido", value: "Requisitado/Cedido" },
  { label: "Militar", value: "Militar" },
  { label: "Não Funcional", value: "Não Funcional" },
];

const matrizInstituicaoOptions = regimeTesteInstituicaoOptions.map((item) => ({
  label: item.label,
  value: item.label,
}));

const matrizOrgaoOptions = [
  { label: "Todos", value: "Todos" },
  { label: "SEDUC", value: "SEDUC" },
  { label: "SES", value: "SES" },
  { label: "CBMMT", value: "CBMMT" },
  { label: "SEPLAG", value: "SEPLAG" },
];

const matrizSetorOptions = [
  { label: "Todos", value: "Todos" },
  { label: "Gabinete", value: "Gabinete" },
  { label: "Coordenadoria", value: "Coordenadoria" },
  { label: "Unidade Administrativa", value: "Unidade Administrativa" },
];

const matrizRegimeOptions = regimesJuridicosTesteMock.map((regime) => ({
  label: regime.nome,
  value: regime.nome,
}));

const matrizTipoVinculoOptions = tiposVinculoTesteMock.map((tipo) => ({
  label: tipo.nome,
  value: tipo.nome,
}));

const matrizCategoriaOptions = categoriasTesteMock.map((categoria) => ({
  label: categoria.descricao,
  value: categoria.descricao,
}));

const matrizSubcategoriaOptions = [
  { label: "Todos", value: "Todos" },
  ...subcategoriasTesteMock.map((subcategoria) => ({
    label: subcategoria.nome,
    value: subcategoria.nome,
  })),
];

const matrizCargoOptions = [
  { label: "Todos", value: "Todos" },
  ...cargosTesteMock.map((cargo) => ({
    label: cargo.cargo,
    value: cargo.cargo,
  })),
];

const matrizControlaVagaOptions = [
  { label: "Sim", value: "Sim" },
  { label: "Não", value: "Não" },
];

const matrizTipoControleVagaOptions = [
  { label: "Quantitativa", value: "Quantitativa" },
  { label: "Numerada", value: "Numerada" },
  { label: "Ambas", value: "Ambas" },
];

const cargoNaturezaVinculoOptions = [
  { label: "Estatutário", value: "estatutario" },
  { label: "Celetista", value: "celetista" },
  { label: "Temporário", value: "temporario" },
];

const regimeSituacaoOptions = [
  { label: "AGENDADO", value: STATUS_OPERACIONAL_VIGENCIA.AGENDADO },
  { label: "ATIVO", value: STATUS_OPERACIONAL_VIGENCIA.ATIVO },
  {
    label: "AGENDADO PARA ENCERRAMENTO",
    value: STATUS_OPERACIONAL_VIGENCIA.AGENDADO_ENCERRAMENTO,
  },
  { label: "ENCERRADO", value: STATUS_OPERACIONAL_VIGENCIA.ENCERRADO },
  {
    label: "AGENDADO PARA EXTINÇÃO",
    value: STATUS_OPERACIONAL_VIGENCIA.AGENDADO_EXTINCAO,
  },
  { label: "EXTINTO", value: STATUS_OPERACIONAL_VIGENCIA.EXTINTO },
];

const regimeStatusMeta: Record<
  StatusOperacionalVigenciaSeplag,
  { label: string; color: string; bg: string; border: string }
> = {
  AGENDADO: {
    label: "Agendado",
    color: "#8a5a00",
    bg: "#fff4d6",
    border: "#fff4d6",
  },
  ATIVO: {
    label: "Ativo",
    color: "#00843d",
    bg: "#dff3e8",
    border: "#dff3e8",
  },
  AGENDADO_ENCERRAMENTO: {
    label: "Agendado para Encerramento",
    color: "#6b7280",
    bg: "#f1f5f9",
    border: "#f1f5f9",
  },
  ENCERRADO: {
    label: "Encerrado",
    color: "#6b7280",
    bg: "#f1f5f9",
    border: "#f1f5f9",
  },
  AGENDADO_EXTINCAO: {
    label: "Agendado para Extinção",
    color: "#b42318",
    bg: "#fee4e2",
    border: "#fee4e2",
  },
  EXTINTO: {
    label: "Extinto",
    color: "#b42318",
    bg: "#fee4e2",
    border: "#fee4e2",
  },
};

const categoriaTabs: TabItemSeplag<string>[] = [
  { label: "Dados Gerais", value: "dados-gerais", col: "lg:col-6" },
  { label: "Subcategoria", value: "subcategoria", col: "lg:col-6" },
];

function createResults<T>(content: T[]): ResultsSeplag<T> {
  return {
    content,
    last: true,
    totalPages: 1,
    pageActual: 0,
    sizePage: content.length,
    totalRecords: content.length,
    size: content.length,
    number: 0,
    first: true,
    numberOfElements: content.length,
    empty: content.length === 0,
  };
}

const situacaoVigenciaDemoDefaultValues: SituacaoVigenciaDemoForm = {
  situacao: SITUACAO_VIGENCIA.ATIVO,
  dataAtivacao: "08/05/2026",
  possuiVinculosOuDependencias: false,
};

function getFormErrorMessage(errors: FieldErrors<SituacaoVigenciaDemoForm>) {
  return (name: string) => {
    const error = errors[name as keyof SituacaoVigenciaDemoForm];
    if (!error?.message) return null;
    return <small className="p-error">{String(error.message)}</small>;
  };
}

export function PrototiposComponentesPage() {
  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content">
        <CardSeplag
          title="Componentes"
          cols="12"
          legenda={() => (
            <p className="prototype-card-description">
              Selecione um componente reutilizável para visualizar seu
              comportamento no protótipo.
            </p>
          )}
        >
          <section
            className="col-12 prototype-component-dashboard"
            aria-label="Componentes disponíveis"
          >
            {componentPrototypeItems.map((component) => (
              <Link
                className="prototype-component-tile"
                key={component.id}
                to={component.path}
                aria-label={`Abrir componente ${component.title}`}
              >
                <div className="prototype-component-tile-icon" aria-hidden="true">
                  <i className={component.icon} />
                </div>
                <div className="prototype-component-tile-info">
                  <span>{component.status}</span>
                  <h2>{component.title}</h2>
                  <p>{component.description}</p>
                </div>
                <i className="pi pi-arrow-right" aria-hidden="true" />
              </Link>
            ))}
          </section>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposSituacaoVigenciaPage() {
  const [businessMessages, setBusinessMessages] = useState<string[]>([]);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<SituacaoVigenciaDemoForm>({
    defaultValues: situacaoVigenciaDemoDefaultValues,
  });
  const formValues = watch();
  const possuiVinculosOuDependencias = watch("possuiVinculosOuDependencias");

  const handleValidSubmit = (data: SituacaoVigenciaDemoForm) => {
    const messages = validarSituacaoVigenciaSeplag(data, {
      possuiVinculosOuDependencias: data.possuiVinculosOuDependencias,
      permitirExtincaoDireta: false,
    });
    setBusinessMessages(
      messages.length ? messages : ["Registro validado com sucesso!"],
    );
  };

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <form onSubmit={handleSubmit(handleValidSubmit)}>
        <div className="prototype-page-content prototype-situacao-page">
          <CardSeplag
            title="Vigência"
            cols="12"
          >
            <SituacaoVigenciaSeplag
              control={control}
              setValue={setValue}
              possuiVinculosOuDependencias={possuiVinculosOuDependencias}
              rotuloDataAtivacao="Data de Início"
              cols={{
                situacao: "12 12 3",
                dataAtivacao: "12 12 3",
                statusOperacional: "col-12 md:col-12 lg:col-4 prototype-status-operacional-col",
                dataEncerramento: "12 12 3",
                motivoEncerramento: "12",
                dataExtincao: "12 12 3",
                motivoExtincao: "12",
              }}
              getFormErrorMessage={getFormErrorMessage(errors)}
            />
            <div className="col-12 prototype-vigencia-actions">
              <BotaoSalvarSeplag type="submit" />
            </div>
          </CardSeplag>

          <CardSeplag
            title="Simulação"
            cols="12"
            legenda={() => (
              <p className="prototype-card-description">
                Ajuste cenários e regras auxiliares para testar o comportamento
                do componente.
              </p>
            )}
          >
            <div className="prototype-component-options">
              <label className="flex align-items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!possuiVinculosOuDependencias}
                  onChange={(event) =>
                    setValue(
                      "possuiVinculosOuDependencias",
                      event.target.checked,
                    )
                  }
                />
                Simular vínculos ou associações existentes
              </label>
            </div>

            {businessMessages.length > 0 && (
              <div className="prototype-validation-panel">
                {businessMessages.map((message) => (
                  <div key={message}>{message}</div>
                ))}
              </div>
            )}

            <div className="prototype-component-actions">
              <BotaoSeplag
                type="button"
                label="Ativo"
                icon="pi pi-check"
                onClick={() => {
                  reset(situacaoVigenciaDemoDefaultValues);
                  setBusinessMessages([]);
                }}
              />
              <BotaoSeplag
                type="button"
                label="Agendado"
                icon="pi pi-clock"
                onClick={() => {
                  reset({
                    situacao: SITUACAO_VIGENCIA.ATIVO,
                    dataAtivacao: "31/12/2026",
                    possuiVinculosOuDependencias: false,
                  });
                  setBusinessMessages([]);
                }}
              />
              <BotaoSeplag
                type="button"
                label="Encerrado"
                icon="pi pi-lock"
                onClick={() => {
                  reset({
                    situacao: SITUACAO_VIGENCIA.ENCERRADO,
                    dataAtivacao: "01/01/2026",
                    dataEncerramento: "08/05/2026",
                    motivoEncerramento: "Registro encerrado para demonstração.",
                    possuiVinculosOuDependencias: true,
                  });
                  setBusinessMessages([]);
                }}
              />
              <BotaoSeplag
                type="button"
                label="Extinto"
                icon="pi pi-times"
                onClick={() => {
                  reset({
                    situacao: SITUACAO_VIGENCIA.EXTINTO,
                    dataAtivacao: "01/01/2026",
                    dataEncerramento: "01/04/2026",
                    dataExtincao: "08/05/2026",
                    motivoExtincao: "Registro extinto para demonstração.",
                    possuiVinculosOuDependencias: false,
                  });
                  setBusinessMessages([]);
                }}
              />
            </div>
          </CardSeplag>

          <CardSeplag title="Resumo do Estado" cols="12">
            <pre className="prototype-state-preview">
              {JSON.stringify(formValues, null, 2)}
            </pre>
          </CardSeplag>
        </div>
      </form>
    </PrototypeSystemPage>
  );
}

export function PrototiposDocumentosVinculadosPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const documentosLegais = useDocumentosLegaisAssociaveis();
  const [documentosSelecionados, setDocumentosSelecionados] = useState<string[]>(
    ["lc-4-1990", "decreto-1447-2022"],
  );
  const documentoCriadoId = searchParams.get("documentoLegalId");

  useEffect(() => {
    if (!documentoCriadoId) return;
    setDocumentosSelecionados((current) => current.includes(documentoCriadoId) ? current : [...current, documentoCriadoId]);
    navigate(location.pathname, { replace: true });
  }, [documentoCriadoId, location.pathname, navigate]);

  const novoDocumentoUrl = `/prototipos/sigep/documentos-legais/novo?returnTo=${encodeURIComponent(location.pathname)}`;

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content">
        <CardSeplag
          title="Documentos Vinculados"
          cols="12"
          legenda={() => (
            <p className="prototype-card-description">
              Componente para selecionar e vincular documentos previamente
              cadastrados no sistema.
            </p>
          )}
        >
          <DocumentosLegaisAssociadosSeplag
            required
            options={documentosLegais}
            value={documentosSelecionados}
            onChange={setDocumentosSelecionados}
            onNovoCadastro={() => navigate(novoDocumentoUrl)}
            onVisualizar={(documento) => navigate(`/prototipos/sigep/documentos-legais/${documento.id}`)}
          />
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposAnexarDocumentoPage() {
  const [arquivos, setArquivos] = useState<ArquivoAnexadoSeplag[]>([
    {
      nome: "USXXX - Manter Regime Jurídico.pdf",
      extensao: "pdf",
      contentType: "application/pdf",
      conteudoEmBase64: "",
      tamanho: "455.3 KB",
    },
    {
      nome: "Parecer técnico - Regime Jurídico.pdf",
      extensao: "pdf",
      contentType: "application/pdf",
      conteudoEmBase64: "",
      tamanho: "497.2 KB",
    },
    {
      nome: "Evidência de homologação.pdf",
      extensao: "pdf",
      contentType: "application/pdf",
      conteudoEmBase64: "",
      tamanho: "258.6 KB",
    },
  ]);

  const handleUploadDocumento = (event: { files?: File[] }) => {
    const files = Array.from(event.files ?? []);
    if (!files.length) return;

    setArquivos((current) => [
      ...current,
      ...files.map((file) => ({
        nome: file.name,
        extensao: file.name.split(".").pop()?.toLowerCase() ?? "pdf",
        contentType: file.type || "application/octet-stream",
        conteudoEmBase64: "",
        tamanho: file.size,
      })),
    ]);
  };

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content">
        <CardSeplag
          title="Documentos"
          cols="12"
          legenda={() => (
            <p className="prototype-card-description">
              Anexe um ou mais documentos. Você pode visualizar, baixar ou
              remover cada arquivo.
            </p>
          )}
        >
          <div className="grid prototype-anexar-documento-demo">
            <AnexarDocumentoSeplag
              label="Documento"
              cols="12"
              style={{ maxWidth: "760px" }}
              multiple
              arquivosBase64={arquivos}
              onUploadDocument={handleUploadDocumento}
              onRemoveArquivo={(_, index) =>
                setArquivos((current) =>
                  current.filter((__, itemIndex) => itemIndex !== index),
                )
              }
              onDownloadArquivo={() => {}}
              handleViewArquivo={() => {}}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposEstruturaOrganizacionalPage() {
  const [estruturaSelecionada, setEstruturaSelecionada] =
    useState<SeletorEstruturaOrganizacionalValueSeplag>({});

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content">
        <CardSeplag
          title="Estrutura Organizacional"
          cols="12"
          legenda={() => (
            <p className="prototype-card-description">
              Componente para selecionar instituições e abrir níveis
              vinculados conforme a hierarquia organizacional.
            </p>
          )}
        >
          <SeletorEstruturaOrganizacionalSeplag
            niveis={estruturaOrganizacionalNiveis}
            value={estruturaSelecionada}
            onChange={setEstruturaSelecionada}
          />
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposSigepPage() {
  return (
    <main className="prototype-sigep-home-page">
      <section className="prototype-sigep-home-header">
        <Link to="/prototipos" className="prototype-sigep-home-back">
          <i className="pi pi-arrow-left" aria-hidden="true" />
          Protótipos
        </Link>
        <span>SIGEP</span>
        <h1>Tela inicial do SIGEP</h1>
        <p>
          Selecione um módulo para acessar os fluxos prototipados do sistema.
        </p>
      </section>

      <section className="prototype-sigep-home-grid" aria-label="Módulos do SIGEP">
        {sigepDashboardModules.map((module) => (
          <Link
            key={module.id}
            to={module.path}
            className="prototype-sigep-home-link"
            aria-label={`Acessar módulo ${module.label}`}
          >
            <CardSeplag
              cols="12"
              cardHeaderClassNames={`prototype-sigep-home-card${
                module.featured ? " is-featured" : ""
              }`}
            >
              <article className="prototype-sigep-home-card-content">
                <div className="prototype-sigep-home-icon" aria-hidden="true">
                  <i className={module.icon} />
                </div>
                <div>
                  <span>{module.status}</span>
                  <h2>{module.label}</h2>
                  <p>{module.description}</p>
                </div>
                <i className="pi pi-arrow-right prototype-sigep-home-action" aria-hidden="true" />
              </article>
            </CardSeplag>
          </Link>
        ))}
      </section>
    </main>
  );
}

export function PrototiposControleVagasRegrasPage() {
  return (
    <PrototypeSystemPage
      nomeSistema="SIGEP"
      ambienteSistema="Protótipo"
      menuItems={menuGestaoPessoas}
    >
      <ControleVagasRegrasContent />
    </PrototypeSystemPage>
  );
}
export function PrototiposControleVagasQuadroAutorizadoPage() {
  return (
    <PrototypeSystemPage
      nomeSistema="SIGEP"
      ambienteSistema="Protótipo"
      menuItems={menuGestaoPessoas}
    >
      <QuadroAutorizadoContent />
    </PrototypeSystemPage>
  );
}
export function PrototiposControleVagasDistribuicaoSaldoPage() {
  return (
    <PrototypeSystemPage
      nomeSistema="SIGEP"
      ambienteSistema="Protótipo"
      menuItems={menuGestaoPessoas}
    >
      <DistribuicaoSaldoContent />
    </PrototypeSystemPage>
  );
}
export function PrototiposControleVagasDashboardPage() {
  return (
    <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}>
      <DashboardGerencialContent />
    </PrototypeSystemPage>
  );
}
export function PrototiposControleVagasProjecoesPage() {
  return (
    <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}>
      <ProjecoesVagasContent />
    </PrototypeSystemPage>
  );
}
export function PrototiposControleVagasCessoesPage() {
  return (
    <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}>
      <MovimentacoesContent />
    </PrototypeSystemPage>
  );
}
export function PrototiposControleVagasVagasPage() {
  return (
    <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}>
      <VagasIndividualizadasContent />
    </PrototypeSystemPage>
  );
}
export function PrototiposBacklogRegrasPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><BacklogRegrasContent /></PrototypeSystemPage>;
}
export function PrototiposBacklogQuadroAutorizadoPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><BacklogQuadroAutorizadoContent /></PrototypeSystemPage>;
}
export function PrototiposBacklogDistribuicaoPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><BacklogDistribuicaoContent /></PrototypeSystemPage>;
}
export function PrototiposBacklogDashboardPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><BacklogDashboardContent /></PrototypeSystemPage>;
}
export function PrototiposBacklogProjecoesPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><BacklogProjecoesContent /></PrototypeSystemPage>;
}
export function PrototiposBacklogMovimentacoesPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><BacklogMovimentacoesContent /></PrototypeSystemPage>;
}
export function PrototiposBacklogVagasPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><BacklogVagasContent /></PrototypeSystemPage>;
}
export function PrototiposQuadroPessoalRegrasPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><QuadroPessoalRegrasContent /></PrototypeSystemPage>;
}
export function PrototiposQuadroPessoalQuadroAutorizadoPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><QuadroPessoalQuadroAutorizadoContent /></PrototypeSystemPage>;
}
export function PrototiposQuadroPessoalDistribuicaoPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><QuadroPessoalDistribuicaoContent /></PrototypeSystemPage>;
}
export function PrototiposQuadroPessoalDashboardPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><QuadroPessoalDashboardContent /></PrototypeSystemPage>;
}
export function PrototiposQuadroPessoalProjecoesPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><QuadroPessoalProjecoesContent /></PrototypeSystemPage>;
}
export function PrototiposQuadroPessoalMovimentacoesPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><QuadroPessoalMovimentacoesContent /></PrototypeSystemPage>;
}
export function PrototiposQuadroPessoalVagasPage() {
  return <PrototypeSystemPage nomeSistema="SIGEP" ambienteSistema="Protótipo" menuItems={menuGestaoPessoas}><QuadroPessoalVagasContent /></PrototypeSystemPage>;
}
export function PrototiposCategoriaPage({
  routePrefix = SIGEP_BASE_PATH,
}: CargoConcursoRouteProps = {}) {
  const navigate = useNavigate();
  const { control, reset, watch } = useForm<CategoriaFiltroForm>({
    defaultValues: {
      categoria: "",
      instituicao: undefined,
      situacao: undefined,
    },
  });
  const [perfilIngressos, setPerfilIngressos] = useState<IngressoPerfil>("PROVIMENTO");
  const filtros = watch();
  const categoriaBusca = filtros.categoria?.trim().toLowerCase();
  const categoriasFiltradas = categoriasTesteMock.filter((categoria) => {
    const atendeCategoria =
      !categoriaBusca ||
      categoria.sigla.toLowerCase().includes(categoriaBusca) ||
      categoria.descricao.toLowerCase().includes(categoriaBusca);
    const atendeSituacao =
      !filtros.situacao || categoria.situacao === filtros.situacao;
    const atendeInstituicao =
      !filtros.instituicao || categoria.instituicao === filtros.instituicao;

    return atendeCategoria && atendeSituacao && atendeInstituicao;
  });
  const categoriaResults = createResults(categoriasFiltradas);
  const categoriaColumns: ColumnMetaSeplag<CategoriaTesteRow>[] = [
    { field: "sigla", header: "Sigla/Código" },
    { field: "descricao", header: "Categoria" },
    {
      header: "Subcategorias",
      body: (row) => (
        <button
          type="button"
          className="prototype-link-button"
          onClick={() => {}}
        >
          {row.subcategorias}
        </button>
      ),
    },
    {
      header: "Instituições",
      body: (row) => (
        <button
          type="button"
          className="prototype-link-button"
          onClick={() => {}}
        >
          {row.instituicoesVinculadas}{" "}
          {row.instituicoesVinculadas === 1 ? "Instituição" : "Instituições"}
        </button>
      ),
    },
    {
      header: "Situação",
      body: (row) => (
        <BadgeSeplag
          label={row.situacao === "ATIVO" ? "Ativo" : "Encerrado"}
          color={row.situacao === "ATIVO" ? "#00843d" : "#9a6500"}
          bg={row.situacao === "ATIVO" ? "#e2f3e8" : "#fff1c7"}
          border="transparent"
          size="md"
        />
      ),
    },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag title="Categorias" cols="12">
          <div className="prototype-category-filters prototype-categoria-filters grid">
            <TextFieldSeplag
              name="categoria"
              control={control}
              label="Categoria (Sigla, Descrição)"
              cols="12 6 3"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="instituicao"
              control={control}
              label="Instituição"
              cols="12 6 3"
              options={instituicaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="situacao"
              control={control}
              label="Situação"
              cols="12 6 3"
              options={situacaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-3">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={() =>
                  reset({
                    categoria: "",
                    instituicao: undefined,
                    situacao: undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="prototype-category-table">
            <TablePaginadoSeplag
              dataKey="id"
              data={categoriaResults}
              rows={10}
              paginator={false}
              lazy={false}
              selectionMode={null}
              columns={categoriaColumns}
              hasEventoAcao
              handleAdicionar={() => navigate(`${routePrefix}/categoria/novo`)}
              handleView={(row) =>
                navigate(`${routePrefix}/categoria/${row.id}/editar`)
              }
              handleEdit={(row) =>
                navigate(`${routePrefix}/categoria/${row.id}/editar`)
              }
              handleDelete={() => {}}
              handleOnPageChange={() => {}}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposCargoPage({
  routePrefix = SIGEP_BASE_PATH,
}: CargoConcursoRouteProps = {}) {
  const navigate = useNavigate();
  const { control, reset, watch } = useForm<CargoFiltroForm>({
    defaultValues: {
      cargo: "",
      categoria: undefined,
      situacao: undefined,
    },
  });
  const [perfilIngressos, setPerfilIngressos] = useState<IngressoPerfil>("PROVIMENTO");
  const filtros = watch();
  const cargoBusca = filtros.cargo?.trim().toLowerCase();
  const cargosFiltrados = cargosTesteMock.filter((cargo) => {
    const atendeCargo =
      !cargoBusca ||
      cargo.codigo.toLowerCase().includes(cargoBusca) ||
      cargo.cargo.toLowerCase().includes(cargoBusca);
    const atendeCategoria =
      !filtros.categoria || cargo.categoria === filtros.categoria;
    const atendeSituacao =
      !filtros.situacao || cargo.situacao === filtros.situacao;

    return atendeCargo && atendeCategoria && atendeSituacao;
  });
  const cargoResults = {
    ...createResults(cargosFiltrados),
    totalPages: Math.max(1, Math.ceil(cargosFiltrados.length / 10)),
    sizePage: 10,
    size: 10,
  };
  const cargoColumns: ColumnMetaSeplag<CargoTesteRow>[] = [
    { field: "codigo", header: "Código/Sigla" },
    { field: "cargo", header: "Cargo" },
    { field: "categoria", header: "Categoria" },
    { field: "subcategoria", header: "Subcategoria" },
    { field: "jornadaPadrao", header: "Jornada Padrão" },
    {
      header: "Base Legal",
      body: (row) => (
        <button
          type="button"
          className="prototype-link-button"
          onClick={() => {}}
        >
          {row.baseLegal} Base(s)
        </button>
      ),
    },
    { field: "vigencia", header: "Vigência" },
    {
      header: "Instituições",
      body: (row) => (
        <button
          type="button"
          className="prototype-link-button"
          onClick={() => {}}
        >
          {row.instituicoes} Instituição(ões)
        </button>
      ),
    },
    {
      header: "Situação",
      body: (row) => (
        <BadgeSeplag
          label={row.situacao === "ATIVO" ? "Ativo" : "Encerrado"}
          color={row.situacao === "ATIVO" ? "#00843d" : "#9a6500"}
          bg={row.situacao === "ATIVO" ? "#e2f3e8" : "#fff1c7"}
          border="transparent"
          size="md"
        />
      ),
    },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag title="Cargos" cols="12">
          <div className="prototype-category-filters prototype-cargo-filters grid">
            <TextFieldSeplag
              name="cargo"
              control={control}
              label="Cargo"
              placeholder="Nome do Cargo"
              cols="12 12 4"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="categoria"
              control={control}
              label="Categoria"
              placeholder="Selecione a Categoria"
              cols="12 12 4"
              options={cargoCategoriaOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="situacao"
              control={control}
              label="Situação"
              placeholder="Selecione a Situação"
              cols="12 12 2"
              options={situacaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-2">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={() =>
                  reset({
                    cargo: "",
                    categoria: undefined,
                    situacao: undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="prototype-cargo-table">
            <TablePaginadoSeplag
              dataKey="id"
              data={cargoResults}
              rows={10}
              rowsPerPage={[10]}
              paginator
              lazy={false}
              selectionMode={null}
              columns={cargoColumns}
              hasEventoAcao
              handleAdicionar={() => navigate(`${routePrefix}/cargo/novo`)}
              handleView={(row) =>
                navigate(`${routePrefix}/cargo/${row.id}/editar`)
              }
              handleEdit={(row) =>
                navigate(`${routePrefix}/cargo/${row.id}/editar`)
              }
              handleDelete={() => {}}
              handleOnPageChange={() => {}}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposCargoFormPage({
  routePrefix = SIGEP_BASE_PATH,
}: CargoConcursoRouteProps = {}) {
  const navigate = useNavigate();
  const { control, setValue } = useForm<CargoForm>({
    defaultValues: {
      codigo: "",
      baseLegal: [],
      categoria: "",
      subcategoria: "",
      instituicao: [],
      nomeCargo: "",
      descricao: "",
      tipoCargo: "",
      naturezaCargo: "",
      formaProvimento: "",
      regimeJuridico: "",
      jornadaTrabalho: "",
      escolaridadeMinima: "",
      cbo: "",
      especialidade: "",
      naturezaVinculo: "",
      cargoChefia: "N",
      permiteSubstituicao: "N",
      exibirPortal: "N",
      observacao: "",
      situacao: SITUACAO_VIGENCIA.ATIVO,
      dataAtivacao: "",
      dataEncerramento: "",
      dataExtincao: "",
      motivoEncerramento: "",
      motivoExtincao: "",
    },
  });

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="prototype-page-content prototype-page-content--white">
          <CardSeplag
            title="Cadastrar - Cargo"
            cols="12"
            cardHeaderClassNames="prototype-category-card"
          >
            <div className="prototype-cargo-form">
              <section className="prototype-cargo-form-section">
                <h3>Identificação</h3>
                <div className="grid prototype-cargo-form-fields">
                  <TextFieldSeplag
                    name="codigo"
                    control={control}
                    label="Código/Sigla"
                    cols="12 12 3"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <TextFieldSeplag
                    name="nomeCargo"
                    control={control}
                    label="Nome do Cargo"
                    cols="12 12 9"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <TextFieldSeplag
                    name="descricao"
                    control={control}
                    label="Descrição"
                    cols="12"
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Classificação Funcional</h3>
                <div className="grid prototype-cargo-form-fields">
                  <DropdownFieldSeplag
                    name="categoria"
                    control={control}
                    label="Categoria"
                    placeholder="Selecione..."
                    cols="12 12 6"
                    options={cargoTesteCategoriaOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="subcategoria"
                    control={control}
                    label="Subcategoria"
                    placeholder="Selecione..."
                    cols="12 12 6"
                    options={cargoSubcategoriaOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="tipoCargo"
                    control={control}
                    label="Tipo de Cargo"
                    placeholder="Selecione..."
                    cols="12 12 3"
                    options={cargoTipoOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="naturezaCargo"
                    control={control}
                    label="Natureza do Cargo"
                    placeholder="Selecione..."
                    cols="12 12 3"
                    options={cargoNaturezaOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Características do Cargo</h3>
                <div className="grid prototype-cargo-form-fields">
                  <DropdownFieldSeplag
                    name="jornadaTrabalho"
                    control={control}
                    label="Jornada padrão do cargo"
                    placeholder="Selecione..."
                    cols="12 12 3"
                    options={cargoJornadaOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="escolaridadeMinima"
                    control={control}
                    label="Escolaridade Mínima"
                    placeholder="Selecione..."
                    cols="12 12 3"
                    options={cargoEscolaridadeOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="cbo"
                    control={control}
                    label="CBO"
                    placeholder="Selecione..."
                    cols="12 12 3"
                    options={cargoCboOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="especialidade"
                    control={control}
                    label="Especialidade"
                    placeholder="Selecione..."
                    cols="12 12 3"
                    options={cargoEspecialidadeOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => null}
                  />
                  <SwitchFieldSeplag
                    name="cargoChefia"
                    control={control}
                    label="Cargo de Chefia"
                    cols="12 12 4"
                    getFormErrorMessage={() => null}
                  />
                  <SwitchFieldSeplag
                    name="permiteSubstituicao"
                    control={control}
                    label="Permite Substituição"
                    cols="12 12 4"
                    getFormErrorMessage={() => null}
                  />
                  <SwitchFieldSeplag
                    name="exibirPortal"
                    control={control}
                    label="Exibir no Portal?"
                    cols="12 12 4"
                    getFormErrorMessage={() => null}
                  />
                  <TextAreaFieldSeplag
                    name="observacao"
                    control={control}
                    label="Observação"
                    cols="12"
                    rows={4}
                    maxLength={500}
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Base Legal</h3>
                <div className="grid prototype-cargo-form-fields">
                  <MultiSelectFieldSeplag
                    name="baseLegal"
                    control={control}
                    label="Base Legal"
                    placeholder="Selecione as Bases Legais"
                    cols="12"
                    options={cargoBaseLegalOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Vigência</h3>
                <div className="prototype-cargo-vigencia-fields">
                  <SituacaoVigenciaSeplag<CargoForm>
                    control={control}
                    setValue={setValue}
                    rotuloDataAtivacao="Início de Vigência"
                    cols={{
                      situacao: "12 12 3",
                      dataAtivacao: "12 12 3",
                      statusOperacional:
                        "col-12 md:col-4 lg:col-4 prototype-status-operacional-col",
                      dataEncerramento: "12 12 3",
                      motivoEncerramento: "12",
                      dataExtincao: "12 12 3",
                      motivoExtincao: "12",
                    }}
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Regras de Uso</h3>
                <div className="prototype-table-wrapper">
                  <table className="prototype-simple-table">
                    <thead>
                      <tr>
                        <th>Instituição</th>
                        <th>Órgão</th>
                        <th>Regime</th>
                        <th>Tipo de Vínculo</th>
                        <th>Forma Provimento</th>
                        <th>Jornada</th>
                        <th>Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cargoRegrasUsoTesteMock.map((regra) => (
                        <tr key={regra.id}>
                          <td>{regra.instituicao}</td>
                          <td>{regra.orgao}</td>
                          <td>{regra.regime}</td>
                          <td>{regra.tipoVinculo}</td>
                          <td>{regra.formaProvimento}</td>
                          <td>{regra.jornada}</td>
                          <td>{regra.situacao}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="prototype-category-form-footer">
                <BotaoVoltarSeplag
                  type="button"
                  onClick={() => navigate(`${routePrefix}/cargo`)}
                />
                <BotaoSalvarSeplag type="submit" />
              </div>
            </div>
          </CardSeplag>
        </div>
      </form>
    </PrototypeSystemPage>
  );
}

export function PrototiposCategoriaFormPage({
  routePrefix = SIGEP_BASE_PATH,
}: CargoConcursoRouteProps = {}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const categoria = categoriasTesteMock.find((item) => String(item.id) === id);
  const isEditing = Boolean(id);
  const [activeTab, setActiveTab] = useState("dados-gerais");
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [documentosCategoria, setDocumentosCategoria] = useState<string[]>([
    "lei-12345-2023",
    "decreto-456-2024",
  ]);
  const [documentosSubcategoria, setDocumentosSubcategoria] = useState<
    string[]
  >([]);
  const [instituicoesDisponiveis, setInstituicoesDisponiveis] = useState(
    regimeTesteInstituicaoOptions.filter((item) => item.value !== "govmt"),
  );
  const [instituicoesSelecionadas, setInstituicoesSelecionadas] = useState(
    regimeTesteInstituicaoOptions.filter((item) => item.value === "govmt"),
  );
  const { control, setValue } = useForm<CategoriaForm>({
    defaultValues: {
      sigla: categoria?.sigla ?? "",
      descricao: categoria?.descricao ?? "",
      observacao: isEditing ? "a" : "",
      subcategoriaSigla: "",
      subcategoriaNome: "",
      subcategoriaDescricao: "",
      situacao: SITUACAO_VIGENCIA.ATIVO,
      dataAtivacao: "08/05/2026",
    },
  });
  const categoriaResumo = {
    sigla: categoria?.sigla || "EDU",
    descricao: categoria?.descricao || "Profissionais da Educação",
  };
  const subcategoriaColumns: ColumnMetaSeplag<SubcategoriaTesteRow>[] = [
    { field: "sigla", header: "Sigla" },
    { field: "nome", header: "Nome" },
    { field: "descricao", header: "Descrição" },
    { field: "cargos", header: "Cargos" },
    {
      header: "Regras de Uso",
      body: (row) => (
        <button
          type="button"
          className="prototype-link-button"
          onClick={() => {}}
        >
          {row.regrasUso}
        </button>
      ),
    },
    { field: "vigencia", header: "Vigência" },
    {
      header: "Situação",
      body: (row) => (
        <BadgeSeplag
          label={row.situacao === "ATIVO" ? "Ativo" : "Encerrado"}
          color={row.situacao === "ATIVO" ? "#00843d" : "#9a6500"}
          bg={row.situacao === "ATIVO" ? "#e2f3e8" : "#fff1c7"}
          border="transparent"
          size="md"
        />
      ),
    },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag
          title={`${isEditing ? "Alterar" : "Cadastrar"} - Categoria e Subcategoria`}
          cols="12"
          cardHeaderClassNames="prototype-category-card"
        >
          <div className="prototype-category-form">
            <TabsSeplag
              items={categoriaTabs}
              activeValue={activeTab}
              onChange={setActiveTab}
              maxWidth="512px"
            />

            {activeTab === "dados-gerais" ? (
              <div className="grid prototype-category-form-fields">
                <TextFieldSeplag
                  name="sigla"
                  control={control}
                  label="Sigla/Código"
                  cols="12 12 3"
                  required
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="descricao"
                  control={control}
                  label="Nome da Categoria"
                  cols="12 12 9"
                  required
                  getFormErrorMessage={() => null}
                />
                <TextAreaFieldSeplag
                  name="observacao"
                  control={control}
                  label="Observação"
                  cols="12"
                  rows={4}
                  maxLength={500}
                  getFormErrorMessage={() => null}
                />
                <div className="col-12 prototype-category-documents">
                  <DocumentosLegaisAssociadosSeplag
                    required
                    options={documentosLegaisMock}
                    value={documentosCategoria}
                    onChange={setDocumentosCategoria}
                    onNovoCadastro={() => {}}
                    onVisualizar={() => {}}
                  />
                </div>
                <div className="col-12 prototype-category-vigencia">
                  <h6>Vigência</h6>
                  <SituacaoVigenciaSeplag
                    control={control}
                    setValue={setValue}
                    rotuloDataAtivacao="Data de Início"
                    cols={{
                      situacao: "12 12 3",
                      dataAtivacao: "12 12 3",
                      statusOperacional:
                        "col-12 md:col-12 lg:col-5 prototype-status-operacional-col",
                      dataEncerramento: "12 12 3",
                      motivoEncerramento: "12",
                      dataExtincao: "12 12 3",
                      motivoExtincao: "12",
                    }}
                    getFormErrorMessage={() => null}
                  />
                </div>
                <div className="col-12 prototype-category-structure">
                  <PickListSeplag<(typeof regimeTesteInstituicaoOptions)[number]>
                    title="Instituições"
                    titleNaoSelecionados="Instituições disponíveis"
                    titleSelecionados="Instituições selecionadas"
                    dataKey="value"
                    dataLabel="label"
                    filterBy="label"
                    filterPlaceholder="Procurar por instituição"
                    naoSelecionados={instituicoesDisponiveis}
                    selecionados={instituicoesSelecionadas}
                    setNaoSelecionados={setInstituicoesDisponiveis}
                    setSelecionados={setInstituicoesSelecionadas}
                  />
                </div>
              </div>
            ) : (
              <div className="prototype-category-subcategory">
                <div className="prototype-category-summary">
                  <strong>Categoria</strong>
                  <p>
                    <span>Sigla/Código:</span> {categoriaResumo.sigla}
                  </p>
                  <p>
                    <span>Nome da Categoria:</span>{" "}
                    {categoriaResumo.descricao}
                  </p>
                </div>

                {isAddingSubcategory ? (
                  <div className="grid prototype-subcategory-form-fields">
                    <TextFieldSeplag
                      name="subcategoriaSigla"
                      control={control}
                      label="Sigla/Código"
                      placeholder="Sigla da subcategoria"
                      cols="12 12 3"
                      required
                      getFormErrorMessage={() => null}
                    />
                    <TextFieldSeplag
                      name="subcategoriaNome"
                      control={control}
                      label="Nome da Subcategoria"
                      placeholder="Nome da subcategoria"
                      cols="12 12 9"
                      required
                      getFormErrorMessage={() => null}
                    />
                    <TextAreaFieldSeplag
                      name="subcategoriaDescricao"
                      control={control}
                      label="Descrição"
                      placeholder="Descreva a subcategoria"
                      cols="12"
                      rows={4}
                      maxLength={500}
                      required
                      getFormErrorMessage={() => null}
                    />
                    <div className="col-12 prototype-category-documents">
                      <DocumentosLegaisAssociadosSeplag
                        label="Base Legal da Subcategoria"
                        options={documentosLegaisMock}
                        value={documentosSubcategoria}
                        onChange={setDocumentosSubcategoria}
                        onNovoCadastro={() => {}}
                        onVisualizar={() => {}}
                      />
                    </div>
                    <div className="col-12 prototype-category-vigencia">
                      <h6>Vigência da Subcategoria</h6>
                      <SituacaoVigenciaSeplag
                        control={control}
                        setValue={setValue}
                        rotuloDataAtivacao="Data de Início"
                        cols={{
                          situacao: "12 12 3",
                          dataAtivacao: "12 12 3",
                          statusOperacional:
                            "col-12 md:col-12 lg:col-5 prototype-status-operacional-col",
                          dataEncerramento: "12 12 3",
                          motivoEncerramento: "12",
                          dataExtincao: "12 12 3",
                          motivoExtincao: "12",
                        }}
                        getFormErrorMessage={() => null}
                      />
                    </div>
                  </div>
                ) : (
                  <TablePaginadoSeplag
                    dataKey="id"
                    data={createResults<SubcategoriaTesteRow>(subcategoriasTesteMock)}
                    rows={5}
                    rowsPerPage={[5, 10, 20]}
                    paginator
                    lazy={false}
                    selectionMode={null}
                    columns={subcategoriaColumns}
                    hasEventoAcao
                    handleAdicionar={() => setIsAddingSubcategory(true)}
                    handleView={() => {}}
                    handleEdit={() => {}}
                    handleDelete={() => {}}
                    handleOnPageChange={() => {}}
                  />
                )}

                <div className="prototype-category-form-footer">
                  <BotaoVoltarSeplag
                    type="button"
                    onClick={() => navigate(`${routePrefix}/categoria`)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposSigepRegimeJuridicoPage({
  routePrefix = SIGEP_BASE_PATH,
}: CargoConcursoRouteProps = {}) {
  const navigate = useNavigate();
  const { control, reset } = useForm<RegimeJuridicoFiltroForm>({
    defaultValues: {
      nome: "REGIME ESPECIAL",
      instituicao: "govmt",
      situacao: STATUS_OPERACIONAL_VIGENCIA.ATIVO,
    },
  });
  const regimeResults = {
    ...createResults(regimesJuridicosMock),
    totalPages: 5,
    totalRecords: 45,
    size: 10,
    sizePage: 10,
  };
  const regimeColumns: ColumnMetaSeplag<RegimeJuridicoRow>[] = [
    { field: "nome", header: "Nome" },
    { field: "descricao", header: "Descrição" },
    {
      header: "Instituições Vinculadas",
      body: (row) => (
        <button
          type="button"
          className="prototype-link-button"
          onClick={() => {}}
        >
          {row.instituicoesVinculadas}{" "}
          {row.instituicoesVinculadas === 1 ? "Instituição" : "Instituições"}
        </button>
      ),
    },
    {
      header: "Situação",
      body: (row) => (
        <span className="prototype-regime-status-badge">
          {renderGrupoCalculoStatusBadge(row.situacao)}
        </span>
      ),
    },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-regime-page">
        <CardSeplag
          title="Regime Jurídico"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="prototype-category-filters prototype-regime-filters grid">
            <TextFieldSeplag
              name="nome"
              control={control}
              label="Nome"
              cols="12 6 3"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="instituicao"
              control={control}
              label="Instituição"
              cols="12 6 2"
              options={regimeInstituicaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="situacao"
              control={control}
              label="Situação"
              cols="12 6 2"
              options={regimeSituacaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-2">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={() =>
                  reset({
                    nome: "",
                    instituicao: undefined,
                    situacao: undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="prototype-regime-table">
            <TablePaginadoSeplag
              dataKey="id"
              data={regimeResults}
              rows={10}
              rowsPerPage={[10]}
              paginator
              lazy
              selectionMode={null}
              columns={regimeColumns}
              hasEventoAcao
              handleAdicionar={() =>
                navigate(`${routePrefix}/regime-juridico/novo`)
              }
              handleView={(row) =>
                navigate(`${routePrefix}/regime-juridico/${row.id}/editar`)
              }
              handleEdit={(row) =>
                navigate(`${routePrefix}/regime-juridico/${row.id}/editar`)
              }
              handleDelete={() => {}}
              handleOnPageChange={() => {}}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposSigepRegimeJuridicoNovoPage({
  routePrefix = SIGEP_BASE_PATH,
}: CargoConcursoRouteProps = {}) {
  const navigate = useNavigate();
  const [baseLegalSelecionada, setBaseLegalSelecionada] = useState<string[]>(
    [],
  );
  const [estruturaSelecionada, setEstruturaSelecionada] =
    useState<SeletorEstruturaOrganizacionalValueSeplag>({});
  const { control, setValue } = useForm<RegimeJuridicoForm>({
    defaultValues: {
      nome: "",
      sigla: "",
      situacao: SITUACAO_VIGENCIA.ATIVO,
      dataAtivacao: "13/05/2026",
    },
  });

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="prototype-page-content prototype-page-content--white prototype-regime-page">
          <CardSeplag
            title="Cadastrar - Regime Jurídico"
            cols="12"
            cardHeaderClassNames="prototype-regime-card"
          >
            <div className="grid prototype-category-form-fields prototype-regime-form-fields">
              <TextFieldSeplag
                name="nome"
                control={control}
                label="Nome"
                cols="12 12 8"
                required
                maxLength={150}
                getFormErrorMessage={() => null}
              />
              <TextFieldSeplag
                name="sigla"
                control={control}
                label="Sigla"
                cols="12 12 4"
                required
                maxLength={30}
                getFormErrorMessage={() => null}
              />

              <div className="col-12 prototype-regime-section">
                <DocumentosLegaisAssociadosSeplag
                  label="Base Legal"
                  required
                  options={documentosLegaisMock}
                  value={baseLegalSelecionada}
                  onChange={setBaseLegalSelecionada}
                  onNovoCadastro={() => {}}
                  onVisualizar={() => {}}
                />
              </div>

              <div className="col-12 prototype-regime-section">
                <SeletorEstruturaOrganizacionalSeplag
                  niveis={estruturaOrganizacionalNiveis}
                  value={estruturaSelecionada}
                  onChange={setEstruturaSelecionada}
                />
              </div>

              <div className="col-12 prototype-category-vigencia">
                <h6>Vigência</h6>
                <SituacaoVigenciaSeplag
                  control={control}
                  setValue={setValue}
                  rotuloDataAtivacao="Início de Vigência"
                  cols={{
                    situacao: "12 12 3",
                    dataAtivacao: "12 12 3",
                    statusOperacional:
                      "col-12 md:col-12 lg:col-5 prototype-status-operacional-col",
                    dataEncerramento: "12 12 3",
                    motivoEncerramento: "12",
                    dataExtincao: "12 12 3",
                    motivoExtincao: "12",
                  }}
                  getFormErrorMessage={() => null}
                />
              </div>
            </div>

            <div className="prototype-category-form-footer">
              <BotaoVoltarSeplag
                type="button"
                onClick={() => navigate(`${routePrefix}/regime-juridico`)}
              />
              <BotaoSalvarSeplag type="submit" />
            </div>
          </CardSeplag>
        </div>
      </form>
    </PrototypeSystemPage>
  );
}

export function PrototiposCategoriaTestePage() {
  const navigate = useNavigate();
  const routePrefix = SIGEP_CARGO_CONCURSO_TESTE_BASE_PATH;
  const { control, reset, watch } = useForm<CategoriaFiltroForm>({
    defaultValues: {
      categoria: "",
      instituicao: undefined,
      situacao: undefined,
    },
  });
  const [perfilIngressos, setPerfilIngressos] = useState<IngressoPerfil>("PROVIMENTO");
  const filtros = watch();
  const categoriaBusca = filtros.categoria?.trim().toLowerCase();
  const categoriasFiltradas = categoriasMock.filter((categoria) => {
    const atendeCategoria =
      !categoriaBusca ||
      categoria.sigla.toLowerCase().includes(categoriaBusca) ||
      categoria.descricao.toLowerCase().includes(categoriaBusca);
    const atendeSituacao =
      !filtros.situacao || categoria.situacao === filtros.situacao;
    const atendeInstituicao =
      !filtros.instituicao || categoria.instituicao === filtros.instituicao;

    return atendeCategoria && atendeSituacao && atendeInstituicao;
  });
  const categoriaResults = createResults(categoriasFiltradas);
  const categoriaColumns: ColumnMetaSeplag<CategoriaRow>[] = [
    { field: "sigla", header: "Sigla" },
    { field: "descricao", header: "Descrição" },
    {
      header: "Instituições Vinculadas",
      body: (row) => (
        <button
          type="button"
          className="prototype-link-button"
          onClick={() => {}}
        >
          {row.instituicoesVinculadas}{" "}
          {row.instituicoesVinculadas === 1 ? "Instituição" : "Instituições"}
        </button>
      ),
    },
    {
      header: "Situação",
      body: (row) => (
        <BadgeSeplag
          label={row.situacao === "ATIVO" ? "Ativo" : "Encerrado"}
          color={row.situacao === "ATIVO" ? "#00843d" : "#9a6500"}
          bg={row.situacao === "ATIVO" ? "#e2f3e8" : "#fff1c7"}
          border="transparent"
          size="md"
        />
      ),
    },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag title="Categoria e Subcategoria" cols="12">
          <div className="prototype-category-filters prototype-categoria-filters grid">
            <TextFieldSeplag
              name="categoria"
              control={control}
              label="Categoria (Sigla/Código, Nome)"
              cols="12 6 3"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="instituicao"
              control={control}
              label="Instituição"
              cols="12 6 3"
              options={regimeTesteInstituicaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="situacao"
              control={control}
              label="Situação"
              cols="12 6 3"
              options={situacaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-3">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={() =>
                  reset({
                    categoria: "",
                    instituicao: undefined,
                    situacao: undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="prototype-category-table prototype-category-teste-table">
            <TablePaginadoSeplag
              dataKey="id"
              data={categoriaResults}
              rows={10}
              paginator={false}
              lazy={false}
              selectionMode={null}
              columns={categoriaColumns}
              hasEventoAcao
              handleAdicionar={() => navigate(`${routePrefix}/categoria/novo`)}
              handleView={(row) =>
                navigate(`${routePrefix}/categoria/${row.id}/editar`)
              }
              handleEdit={(row) =>
                navigate(`${routePrefix}/categoria/${row.id}/editar`)
              }
              handleDelete={() => {}}
              handleOnPageChange={() => {}}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposCategoriaTesteFormPage() {
  const navigate = useNavigate();
  const routePrefix = SIGEP_CARGO_CONCURSO_TESTE_BASE_PATH;
  const { id } = useParams();
  const categoria = categoriasMock.find((item) => String(item.id) === id);
  const isEditing = Boolean(id);
  const [activeTab, setActiveTab] = useState("dados-gerais");
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [documentosCategoria, setDocumentosCategoria] = useState<string[]>([
    "lei-12345-2023",
    "decreto-456-2024",
  ]);
  const [estruturaCategoria, setEstruturaCategoria] =
    useState<SeletorEstruturaOrganizacionalValueSeplag>({});
  const { control, setValue } = useForm<CategoriaForm>({
    defaultValues: {
      sigla: categoria?.sigla ?? "",
      descricao: categoria?.descricao ?? "",
      observacao: isEditing ? "a" : "",
      subcategoriaNome: "",
      subcategoriaDescricao: "",
      situacao: SITUACAO_VIGENCIA.ATIVO,
      dataAtivacao: "08/05/2026",
    },
  });
  const categoriaResumo = {
    sigla: categoria?.sigla || "CATEGORIA DE TESTES11A",
    descricao: categoria?.descricao || "TESTE DO TESTE",
  };
  const subcategoriaColumns: ColumnMetaSeplag<SubcategoriaRow>[] = [
    { field: "nome", header: "Nome" },
    { field: "descricao", header: "Descrição" },
    { field: "orgaosVinculados", header: "Órgãos Vinculados" },
    { field: "situacao", header: "Situação" },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag
          title={`${isEditing ? "Alterar" : "Cadastrar"} - Categoria`}
          cols="12"
          cardHeaderClassNames="prototype-category-card"
        >
          <div className="prototype-category-form">
            <TabsSeplag
              items={categoriaTabs}
              activeValue={activeTab}
              onChange={setActiveTab}
              maxWidth="512px"
            />

            {activeTab === "dados-gerais" ? (
              <div className="grid prototype-category-form-fields">
                <TextFieldSeplag
                  name="sigla"
                  control={control}
                  label="Sigla"
                  cols="12 12 3"
                  required
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="descricao"
                  control={control}
                  label="Descrição"
                  cols="12 12 9"
                  required
                  getFormErrorMessage={() => null}
                />
                <TextAreaFieldSeplag
                  name="observacao"
                  control={control}
                  label="Observação"
                  cols="12"
                  rows={4}
                  maxLength={500}
                  getFormErrorMessage={() => null}
                />
                <div className="col-12 prototype-category-documents">
                  <DocumentosLegaisAssociadosSeplag
                    required
                    options={documentosLegaisMock}
                    value={documentosCategoria}
                    onChange={setDocumentosCategoria}
                    onNovoCadastro={() => {}}
                    onVisualizar={() => {}}
                  />
                </div>
                <div className="col-12 prototype-category-vigencia">
                  <h6>Vigência</h6>
                  <SituacaoVigenciaSeplag
                    control={control}
                    setValue={setValue}
                    rotuloDataAtivacao="Data de Início"
                    cols={{
                      situacao: "12 12 3",
                      dataAtivacao: "12 12 3",
                      statusOperacional:
                        "col-12 md:col-12 lg:col-5 prototype-status-operacional-col",
                      dataEncerramento: "12 12 3",
                      motivoEncerramento: "12",
                      dataExtincao: "12 12 3",
                      motivoExtincao: "12",
                    }}
                    getFormErrorMessage={() => null}
                  />
                </div>
                <div className="col-12 prototype-category-structure">
                  <SeletorEstruturaOrganizacionalSeplag
                    niveis={estruturaOrganizacionalNiveis}
                    value={estruturaCategoria}
                    onChange={setEstruturaCategoria}
                  />
                </div>
              </div>
            ) : (
              <div className="prototype-category-subcategory">
                <div className="prototype-category-summary">
                  <strong>Categoria</strong>
                  <p>
                    <span>Nome da Categoria:</span> {categoriaResumo.sigla}
                  </p>
                  <p>
                    <span>Descrição da Categoria:</span>{" "}
                    {categoriaResumo.descricao}
                  </p>
                </div>

                {isAddingSubcategory ? (
                  <div className="grid prototype-subcategory-form-fields">
                    <TextFieldSeplag
                      name="subcategoriaNome"
                      control={control}
                      label="Nome"
                      placeholder="Nome da subcategoria"
                      cols="12"
                      required
                      getFormErrorMessage={() => null}
                    />
                    <TextAreaFieldSeplag
                      name="subcategoriaDescricao"
                      control={control}
                      label="Descrição"
                      placeholder="Descreva a subcategoria"
                      cols="12"
                      rows={4}
                      maxLength={500}
                      required
                      getFormErrorMessage={() => null}
                    />
                  </div>
                ) : (
                  <TablePaginadoSeplag
                    dataKey="id"
                    data={createResults<SubcategoriaRow>([])}
                    rows={5}
                    rowsPerPage={[5, 10, 20]}
                    paginator
                    lazy={false}
                    selectionMode={null}
                    columns={subcategoriaColumns}
                    hasEventoAcao
                    handleAdicionar={() => setIsAddingSubcategory(true)}
                    handleView={() => {}}
                    handleEdit={() => {}}
                    handleDelete={() => {}}
                    handleOnPageChange={() => {}}
                  />
                )}

                <div className="prototype-category-form-footer">
                  <BotaoVoltarSeplag
                    type="button"
                    onClick={() => navigate(`${routePrefix}/categoria`)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposCargoTestePage() {
  const navigate = useNavigate();
  const routePrefix = SIGEP_CARGO_CONCURSO_TESTE_BASE_PATH;
  const { control, reset, watch } = useForm<CargoFiltroForm>({
    defaultValues: {
      cargo: "",
      categoria: undefined,
      situacao: undefined,
    },
  });
  const [perfilIngressos, setPerfilIngressos] = useState<IngressoPerfil>("PROVIMENTO");
  const filtros = watch();
  const cargoBusca = filtros.cargo?.trim().toLowerCase();
  const cargosFiltrados = cargosMock.filter((cargo) => {
    const atendeCargo =
      !cargoBusca || cargo.cargo.toLowerCase().includes(cargoBusca);
    const atendeCategoria =
      !filtros.categoria || cargo.categoria === filtros.categoria;
    const atendeSituacao =
      !filtros.situacao || cargo.situacao === filtros.situacao;

    return atendeCargo && atendeCategoria && atendeSituacao;
  });
  const cargoResults = {
    ...createResults(cargosFiltrados),
    totalPages: Math.max(1, Math.ceil(cargosFiltrados.length / 10)),
    sizePage: 10,
    size: 10,
  };
  const cargoColumns: ColumnMetaSeplag<CargoRow>[] = [
    { field: "cargo", header: "Cargo" },
    { field: "categoria", header: "Categoria" },
    {
      header: "Base Legal",
      body: (row) => (
        <button
          type="button"
          className="prototype-link-button"
          onClick={() => {}}
        >
          {row.baseLegal} Base(s)
        </button>
      ),
    },
    {
      header: "Regras de Uso",
      body: (row) => (
        <button
          type="button"
          className="prototype-link-button"
          onClick={() => {}}
        >
          {row.regrasUso}
        </button>
      ),
    },
    { field: "vigencia", header: "Vigência" },
    {
      header: "Situação",
      body: (row) => (
        <BadgeSeplag
          label={row.situacao === "ATIVO" ? "Ativo" : "Encerrado"}
          color={row.situacao === "ATIVO" ? "#00843d" : "#9a6500"}
          bg={row.situacao === "ATIVO" ? "#e2f3e8" : "#fff1c7"}
          border="transparent"
          size="md"
        />
      ),
    },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag title="Cargos" cols="12">
          <div className="prototype-category-filters prototype-cargo-filters grid">
            <TextFieldSeplag
              name="cargo"
              control={control}
              label="Cargo"
              placeholder="Código/Sigla ou Nome do Cargo"
              cols="12 12 4"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="categoria"
              control={control}
              label="Categoria"
              placeholder="Selecione a Categoria"
              cols="12 12 4"
              options={cargoTesteCategoriaOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="situacao"
              control={control}
              label="Situação"
              placeholder="Selecione a Situação"
              cols="12 12 2"
              options={situacaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-2">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={() =>
                  reset({
                    cargo: "",
                    categoria: undefined,
                    situacao: undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="prototype-cargo-table prototype-cargo-teste-table">
            <TablePaginadoSeplag
              dataKey="id"
              data={cargoResults}
              rows={10}
              rowsPerPage={[10]}
              paginator
              lazy={false}
              selectionMode={null}
              columns={cargoColumns}
              hasEventoAcao
              handleAdicionar={() => navigate(`${routePrefix}/cargo/novo`)}
              handleView={(row) =>
                navigate(`${routePrefix}/cargo/${row.id}/editar`)
              }
              handleEdit={(row) =>
                navigate(`${routePrefix}/cargo/${row.id}/editar`)
              }
              handleDelete={() => {}}
              handleOnPageChange={() => {}}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposCargoTesteFormPage() {
  const navigate = useNavigate();
  const routePrefix = SIGEP_CARGO_CONCURSO_TESTE_BASE_PATH;
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { control, setValue } = useForm<CargoForm>({
    defaultValues: {
      baseLegal: [],
      categoria: "",
      subcategoria: "",
      instituicao: [],
      nomeCargo: "",
      descricao: "",
      tipoCargo: "",
      naturezaCargo: "",
      formaProvimento: "",
      regimeJuridico: "",
      jornadaTrabalho: "",
      escolaridadeMinima: "",
      cbo: "",
      especialidade: "",
      naturezaVinculo: "",
      cargoChefia: "N",
      permiteSubstituicao: "N",
      exibirPortal: "N",
      observacao: "",
      situacao: SITUACAO_VIGENCIA.ATIVO,
      dataAtivacao: "",
      dataEncerramento: "",
      dataExtincao: "",
      motivoEncerramento: "",
      motivoExtincao: "",
    },
  });

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="prototype-page-content prototype-page-content--white">
          <CardSeplag
            title={`${isEditing ? "Alterar" : "Cadastrar"} - Cargo`}
            cols="12"
            cardHeaderClassNames="prototype-category-card"
          >
            <div className="prototype-cargo-form">
              <section className="prototype-cargo-form-section">
                <h3>Estrutura do Cargo</h3>
                <div className="grid prototype-cargo-form-fields">
                  <MultiSelectFieldSeplag
                    name="baseLegal"
                    control={control}
                    label="Base Legal"
                    placeholder="Selecione as Bases Legais"
                    cols="12"
                    options={cargoBaseLegalOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="categoria"
                    control={control}
                    label="Categoria"
                    placeholder="Selecione..."
                    cols="12 12 6"
                    options={cargoCategoriaOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="subcategoria"
                    control={control}
                    label="Subcategoria"
                    placeholder="Selecione..."
                    cols="12 12 6"
                    options={cargoSubcategoriaOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <MultiSelectFieldSeplag
                    name="instituicao"
                    control={control}
                    label="Instituição"
                    placeholder="Selecione as Instituições"
                    cols="12"
                    options={cargoInstituicaoOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <TextFieldSeplag
                    name="nomeCargo"
                    control={control}
                    label="Nome do Cargo"
                    cols="12 12 3"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <TextFieldSeplag
                    name="descricao"
                    control={control}
                    label="Descrição"
                    cols="12 12 9"
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Classificação</h3>
                <div className="grid prototype-cargo-form-fields">
                  <DropdownFieldSeplag
                    name="tipoCargo"
                    control={control}
                    label="Tipo de Cargo"
                    placeholder="Selecione..."
                    cols="12 12 3"
                    options={cargoTipoOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="naturezaCargo"
                    control={control}
                    label="Natureza do Cargo"
                    placeholder="Selecione..."
                    cols="12 12 3"
                    options={cargoNaturezaOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="formaProvimento"
                    control={control}
                    label="Forma Provimento"
                    placeholder="Selecione..."
                    cols="12 12 3"
                    options={cargoFormaProvimentoOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="regimeJuridico"
                    control={control}
                    label="Regime Jurídico"
                    placeholder="Selecione..."
                    cols="12 12 3"
                    options={grupoCalculoRegimeJuridicoOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="jornadaTrabalho"
                    control={control}
                    label="Jornada de Trabalho"
                    placeholder="Selecione..."
                    cols="12 12 3"
                    options={cargoJornadaOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="escolaridadeMinima"
                    control={control}
                    label="Escolaridade Mínima"
                    placeholder="Selecione..."
                    cols="12 12 3"
                    options={cargoEscolaridadeOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="cbo"
                    control={control}
                    label="CBO"
                    placeholder="Selecione..."
                    cols="12 12 3"
                    options={cargoCboOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="especialidade"
                    control={control}
                    label="Especialidade"
                    placeholder="Selecione..."
                    cols="12 12 3"
                    options={cargoEspecialidadeOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="naturezaVinculo"
                    control={control}
                    label="Natureza do Vínculo"
                    placeholder="Selecione..."
                    cols="12 12 3"
                    options={cargoNaturezaVinculoOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Regras Funcionais</h3>
                <div className="grid prototype-cargo-form-fields prototype-cargo-switch-row">
                  <SwitchFieldSeplag
                    name="cargoChefia"
                    control={control}
                    label="Cargo de Chefia"
                    cols="12 12 4"
                    getFormErrorMessage={() => null}
                  />
                  <SwitchFieldSeplag
                    name="permiteSubstituicao"
                    control={control}
                    label="Permite Substituição"
                    cols="12 12 4"
                    getFormErrorMessage={() => null}
                  />
                  <SwitchFieldSeplag
                    name="exibirPortal"
                    control={control}
                    label="Exibir no Portal?"
                    cols="12 12 4"
                    getFormErrorMessage={() => null}
                  />
                  <TextAreaFieldSeplag
                    name="observacao"
                    control={control}
                    label="Observação"
                    cols="12"
                    rows={4}
                    maxLength={500}
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Vigência</h3>
                <div className="prototype-cargo-vigencia-fields">
                  <SituacaoVigenciaSeplag<CargoForm>
                    control={control}
                    setValue={setValue}
                    rotuloDataAtivacao="Início de Vigência"
                    cols={{
                      situacao: "12 12 3",
                      dataAtivacao: "12 12 3",
                      statusOperacional:
                        "col-12 md:col-4 lg:col-4 prototype-status-operacional-col",
                      dataEncerramento: "12 12 3",
                      motivoEncerramento: "12",
                      dataExtincao: "12 12 3",
                      motivoExtincao: "12",
                    }}
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <div className="prototype-category-form-footer">
                <BotaoVoltarSeplag
                  type="button"
                  onClick={() => navigate(`${routePrefix}/cargo`)}
                />
                <BotaoSalvarSeplag type="submit" />
              </div>
            </div>
          </CardSeplag>
        </div>
      </form>
    </PrototypeSystemPage>
  );
}

export function PrototiposSigepRegimeJuridicoTestePage() {
  const navigate = useNavigate();
  const routePrefix = SIGEP_CARGO_CONCURSO_TESTE_BASE_PATH;
  const { control, reset, watch } = useForm<RegimeJuridicoFiltroForm>({
    defaultValues: {
      nome: "",
      instituicao: undefined,
      situacao: undefined,
    },
  });
  const [perfilIngressos, setPerfilIngressos] = useState<IngressoPerfil>("PROVIMENTO");
  const filtros = watch();
  const regimeBusca = filtros.nome?.trim().toLowerCase();
  const regimesFiltrados = regimesJuridicosTesteMock.filter((regime) => {
    const atendeNome =
      !regimeBusca ||
      regime.codigo.toLowerCase().includes(regimeBusca) ||
      regime.nome.toLowerCase().includes(regimeBusca) ||
      regime.descricao.toLowerCase().includes(regimeBusca);
    const atendeInstituicao =
      !filtros.instituicao || regime.instituicao === filtros.instituicao;
    const atendeSituacao =
      !filtros.situacao || regime.situacao === filtros.situacao;

    return atendeNome && atendeInstituicao && atendeSituacao;
  });
  const regimeResults = {
    ...createResults(regimesFiltrados),
    totalPages: Math.max(1, Math.ceil(regimesFiltrados.length / 10)),
    totalRecords: regimesFiltrados.length,
    size: 10,
    sizePage: 10,
  };
  const regimeColumns: ColumnMetaSeplag<RegimeJuridicoTesteRow>[] = [
    { field: "codigo", header: "Código/Sigla" },
    { field: "nome", header: "Nome" },
    { field: "descricao", header: "Descrição" },
    {
      header: "Instituições",
      body: (row) => (
        <button
          type="button"
          className="prototype-link-button"
          onClick={() => {}}
        >
          {row.instituicoesVinculadas}{" "}
          {row.instituicoesVinculadas === 1 ? "Instituição" : "Instituições"}
        </button>
      ),
    },
    { field: "vigencia", header: "Vigência" },
    {
      header: "Situação",
      body: (row) => (
        <span className="prototype-regime-status-badge">
          {renderGrupoCalculoStatusBadge(row.situacao)}
        </span>
      ),
    },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-regime-page">
        <CardSeplag
          title="Regime Jurídico"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="prototype-category-filters prototype-regime-filters grid">
            <TextFieldSeplag
              name="nome"
              control={control}
              label="Nome ou Código/Sigla"
              cols="12 6 4"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="instituicao"
              control={control}
              label="Instituição"
              cols="12 6 3"
              options={regimeTesteInstituicaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="situacao"
              control={control}
              label="Situação"
              cols="12 6 3"
              options={regimeSituacaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-2">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={() =>
                  reset({
                    nome: "",
                    instituicao: undefined,
                    situacao: undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="prototype-regime-table">
            <TablePaginadoSeplag
              dataKey="id"
              data={regimeResults}
              rows={10}
              rowsPerPage={[10]}
              paginator
              lazy
              selectionMode={null}
              columns={regimeColumns}
              hasEventoAcao
              handleAdicionar={() =>
                navigate(`${routePrefix}/regime-juridico/novo`)
              }
              handleView={(row) =>
                navigate(`${routePrefix}/regime-juridico/${row.id}/editar`)
              }
              handleEdit={(row) =>
                navigate(`${routePrefix}/regime-juridico/${row.id}/editar`)
              }
              handleDelete={() => {}}
              handleOnPageChange={() => {}}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposSigepRegimeJuridicoTesteNovoPage() {
  const navigate = useNavigate();
  const routePrefix = SIGEP_CARGO_CONCURSO_TESTE_BASE_PATH;
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [baseLegalSelecionada, setBaseLegalSelecionada] = useState<string[]>(
    [],
  );
  const [instituicoesDisponiveis, setInstituicoesDisponiveis] = useState(
    regimeTesteInstituicaoOptions.filter((item) => item.value !== "govmt"),
  );
  const [instituicoesSelecionadas, setInstituicoesSelecionadas] = useState(
    regimeTesteInstituicaoOptions.filter((item) => item.value === "govmt"),
  );
  const { control, setValue } = useForm<RegimeJuridicoForm>({
    defaultValues: {
      nome: "",
      sigla: "",
      descricao: "",
      situacao: SITUACAO_VIGENCIA.ATIVO,
      dataAtivacao: "13/05/2026",
    },
  });

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="prototype-page-content prototype-page-content--white prototype-regime-page">
          <CardSeplag
            title={`${isEditing ? "Alterar" : "Cadastrar"} - Regime Jurídico`}
            cols="12"
            cardHeaderClassNames="prototype-regime-card"
          >
            <div className="prototype-regime-teste-form col-12">
              <section className="prototype-cargo-form-section">
                <h3>Dados Gerais</h3>
                <div className="grid prototype-category-form-fields prototype-regime-form-fields">
                  <TextFieldSeplag
                    name="nome"
                    control={control}
                    label="Nome"
                    cols="12 12 8"
                    required
                    maxLength={150}
                    getFormErrorMessage={() => null}
                  />
                  <TextFieldSeplag
                    name="sigla"
                    control={control}
                    label="Sigla/Código"
                    cols="12 12 4"
                    required
                    maxLength={30}
                    getFormErrorMessage={() => null}
                  />
                  <TextAreaFieldSeplag
                    name="descricao"
                    control={control}
                    label="Descrição"
                    cols="12"
                    rows={4}
                    maxLength={500}
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Base Legal</h3>
                <div className="prototype-regime-section">
                  <DocumentosLegaisAssociadosSeplag
                    label="Base Legal"
                    required
                    options={documentosLegaisMock}
                    value={baseLegalSelecionada}
                    onChange={setBaseLegalSelecionada}
                    onNovoCadastro={() => {}}
                    onVisualizar={() => {}}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Instituições</h3>
                <PickListSeplag<(typeof regimeTesteInstituicaoOptions)[number]>
                  title=""
                  titleNaoSelecionados="Instituições disponíveis"
                  titleSelecionados="Instituições selecionadas"
                  dataKey="value"
                  dataLabel="label"
                  filterBy="label"
                  filterPlaceholder="Procurar por instituição"
                  naoSelecionados={instituicoesDisponiveis}
                  selecionados={instituicoesSelecionadas}
                  setNaoSelecionados={setInstituicoesDisponiveis}
                  setSelecionados={setInstituicoesSelecionadas}
                />
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Vigência</h3>
                <div className="prototype-cargo-vigencia-fields">
                  <SituacaoVigenciaSeplag
                    control={control}
                    setValue={setValue}
                    rotuloDataAtivacao="Início de Vigência"
                    cols={{
                      situacao: "12 12 3",
                      dataAtivacao: "12 12 3",
                      statusOperacional:
                        "col-12 md:col-12 lg:col-5 prototype-status-operacional-col",
                      dataEncerramento: "12 12 3",
                      motivoEncerramento: "12",
                      dataExtincao: "12 12 3",
                      motivoExtincao: "12",
                    }}
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>
            </div>

            <div className="prototype-category-form-footer prototype-regime-teste-footer col-12">
              <BotaoVoltarSeplag
                type="button"
                onClick={() => navigate(`${routePrefix}/regime-juridico`)}
              />
              <BotaoSalvarSeplag type="submit" />
            </div>
          </CardSeplag>
        </div>
      </form>
    </PrototypeSystemPage>
  );
}

export function PrototiposTipoVinculoTestePage() {
  const navigate = useNavigate();
  const routePrefix = SIGEP_CARGO_CONCURSO_TESTE_BASE_PATH;
  const { control, reset, watch } = useForm<TipoVinculoFiltroForm>({
    defaultValues: {
      termo: "",
      natureza: undefined,
      instituicao: undefined,
      situacao: undefined,
    },
  });
  const [perfilIngressos, setPerfilIngressos] = useState<IngressoPerfil>("PROVIMENTO");
  const filtros = watch();
  const termoBusca = filtros.termo?.trim().toLowerCase();
  const tiposFiltrados = tiposVinculoTesteMock.filter((tipo) => {
    const atendeTermo =
      !termoBusca ||
      tipo.codigo.toLowerCase().includes(termoBusca) ||
      tipo.nome.toLowerCase().includes(termoBusca) ||
      tipo.descricao.toLowerCase().includes(termoBusca);
    const atendeNatureza =
      !filtros.natureza || tipo.natureza === filtros.natureza;
    const atendeInstituicao =
      !filtros.instituicao || tipo.instituicao === filtros.instituicao;
    const atendeSituacao =
      !filtros.situacao || tipo.situacao === filtros.situacao;

    return (
      atendeTermo && atendeNatureza && atendeInstituicao && atendeSituacao
    );
  });
  const tipoVinculoResults = {
    ...createResults(tiposFiltrados),
    totalPages: Math.max(1, Math.ceil(tiposFiltrados.length / 10)),
    totalRecords: tiposFiltrados.length,
    size: 10,
    sizePage: 10,
  };
  const tipoVinculoColumns: ColumnMetaSeplag<TipoVinculoTesteRow>[] = [
    { field: "codigo", header: "Sigla/Código" },
    { field: "nome", header: "Tipo de Vínculo" },
    { field: "natureza", header: "Natureza" },
    {
      header: "Instituições",
      body: (row) => (
        <button
          type="button"
          className="prototype-link-button"
          onClick={() => {}}
        >
          {row.instituicoesVinculadas}{" "}
          {row.instituicoesVinculadas === 1 ? "Instituição" : "Instituições"}
        </button>
      ),
    },
    {
      header: "Comportamentos",
      body: (row) => row.comportamentos.join(", "),
    },
    { field: "vigencia", header: "Vigência" },
    {
      header: "Situação",
      body: (row) => (
        <BadgeSeplag
          label={row.situacao === "ATIVO" ? "Ativo" : "Encerrado"}
          color={row.situacao === "ATIVO" ? "#00843d" : "#9a6500"}
          bg={row.situacao === "ATIVO" ? "#e2f3e8" : "#fff1c7"}
          border="transparent"
          size="md"
        />
      ),
    },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag title="Tipo de Vínculo" cols="12">
          <div className="prototype-category-filters prototype-tipo-vinculo-filters grid">
            <TextFieldSeplag
              name="termo"
              control={control}
              label="Nome ou Código/Sigla"
              cols="12 12 3"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="natureza"
              control={control}
              label="Natureza do Vínculo"
              placeholder="Selecione..."
              cols="12 12 3"
              options={tipoVinculoNaturezaOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="instituicao"
              control={control}
              label="Instituição"
              placeholder="Selecione..."
              cols="12 12 2"
              options={regimeTesteInstituicaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="situacao"
              control={control}
              label="Situação"
              placeholder="Selecione..."
              cols="12 12 2"
              options={situacaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-2">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={() =>
                  reset({
                    termo: "",
                    natureza: undefined,
                    instituicao: undefined,
                    situacao: undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="prototype-tipo-vinculo-table">
            <TablePaginadoSeplag
              dataKey="id"
              data={tipoVinculoResults}
              rows={10}
              rowsPerPage={[10]}
              paginator
              lazy={false}
              selectionMode={null}
              columns={tipoVinculoColumns}
              hasEventoAcao
              handleAdicionar={() =>
                navigate(`${routePrefix}/tipo-vinculo/novo`)
              }
              handleView={(row) =>
                navigate(`${routePrefix}/tipo-vinculo/${row.id}/editar`)
              }
              handleEdit={(row) =>
                navigate(`${routePrefix}/tipo-vinculo/${row.id}/editar`)
              }
              handleDelete={() => {}}
              handleOnPageChange={() => {}}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposTipoVinculoTesteFormPage() {
  const navigate = useNavigate();
  const routePrefix = SIGEP_CARGO_CONCURSO_TESTE_BASE_PATH;
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [baseLegalSelecionada, setBaseLegalSelecionada] = useState<string[]>(
    [],
  );
  const [instituicoesDisponiveis, setInstituicoesDisponiveis] = useState(
    regimeTesteInstituicaoOptions.filter((item) => item.value !== "govmt"),
  );
  const [instituicoesSelecionadas, setInstituicoesSelecionadas] = useState(
    regimeTesteInstituicaoOptions.filter((item) => item.value === "govmt"),
  );
  const { control, setValue } = useForm<TipoVinculoForm>({
    defaultValues: {
      codigo: "",
      nome: "",
      descricao: "",
      natureza: "",
      baseLegal: [],
      geraVinculoFuncional: "S",
      exigeCargo: "S",
      exigeVaga: "N",
      permiteControleVagas: "S",
      permiteFolha: "S",
      permiteAposentadoria: "N",
      permitePensionista: "N",
      permiteEventoCargo: "S",
      exigeDataFim: "N",
      observacao: "",
      situacao: SITUACAO_VIGENCIA.ATIVO,
      dataAtivacao: "",
      dataEncerramento: "",
      dataExtincao: "",
      motivoEncerramento: "",
      motivoExtincao: "",
    },
  });
  const comportamentoRows: Array<{
    name: keyof TipoVinculoForm;
    titulo: string;
    descricao: string;
  }> = [
    {
      name: "geraVinculoFuncional",
      titulo: "Gera vínculo funcional?",
      descricao: "Indica se o tipo cria um vínculo funcional para a pessoa.",
    },
    {
      name: "exigeCargo",
      titulo: "Exige cargo?",
      descricao: "Torna obrigatória a seleção de cargo nos fluxos aplicáveis.",
    },
    {
      name: "exigeVaga",
      titulo: "Exige vaga?",
      descricao: "Permite exigir vaga quando o cargo controlar quadro.",
    },
    {
      name: "permiteControleVagas",
      titulo: "Permite controle de vagas?",
      descricao: "Habilita uso no módulo de Controle de Vagas.",
    },
    {
      name: "permiteFolha",
      titulo: "Permite folha?",
      descricao: "Indica se o vínculo pode gerar registros para pagamento.",
    },
    {
      name: "permiteAposentadoria",
      titulo: "Permite aposentadoria?",
      descricao: "Habilita fluxos previdenciários de aposentadoria/inatividade.",
    },
    {
      name: "permitePensionista",
      titulo: "Permite pensionista?",
      descricao: "Habilita fluxos específicos de pensionista.",
    },
    {
      name: "permiteEventoCargo",
      titulo: "Permite evento de cargo?",
      descricao: "Permite uso em provimento, alteração ou evento de cargo.",
    },
    {
      name: "exigeDataFim",
      titulo: "Exige data fim?",
      descricao: "Obrigatoriedade de data final prevista para o vínculo.",
    },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="prototype-page-content prototype-page-content--white">
          <CardSeplag
            title={`${isEditing ? "Alterar" : "Cadastrar"} - Tipo de Vínculo`}
            cols="12"
            cardHeaderClassNames="prototype-category-card"
          >
            <div className="prototype-cargo-form">
              <section className="prototype-cargo-form-section">
                <h3>Dados Gerais</h3>
                <div className="grid prototype-cargo-form-fields">
                  <TextFieldSeplag
                    name="codigo"
                    control={control}
                    label="Sigla/Código"
                    cols="12 12 3"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <TextFieldSeplag
                    name="nome"
                    control={control}
                    label="Nome do Tipo de Vínculo"
                    cols="12 12 9"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <TextAreaFieldSeplag
                    name="descricao"
                    control={control}
                    label="Descrição"
                    cols="12"
                    rows={4}
                    maxLength={500}
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Classificação</h3>
                <div className="grid prototype-cargo-form-fields">
                  <DropdownFieldSeplag
                    name="natureza"
                    control={control}
                    label="Natureza do Vínculo"
                    placeholder="Selecione..."
                    cols="12 12 4"
                    options={tipoVinculoNaturezaOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Instituições</h3>
                <PickListSeplag<(typeof regimeTesteInstituicaoOptions)[number]>
                  title=""
                  titleNaoSelecionados="Instituições disponíveis"
                  titleSelecionados="Instituições selecionadas"
                  dataKey="value"
                  dataLabel="label"
                  filterBy="label"
                  filterPlaceholder="Procurar por instituição"
                  naoSelecionados={instituicoesDisponiveis}
                  selecionados={instituicoesSelecionadas}
                  setNaoSelecionados={setInstituicoesDisponiveis}
                  setSelecionados={setInstituicoesSelecionadas}
                />
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Comportamentos do Vínculo</h3>
                <div className="prototype-shared-criterios-list prototype-tipo-vinculo-comportamentos">
                  {comportamentoRows.map((comportamento) => (
                    <div
                      className="prototype-shared-criterio-item"
                      key={comportamento.name}
                    >
                      <CheckboxFieldSeplag<TipoVinculoForm>
                        name={comportamento.name}
                        control={control}
                        checkboxLabel={comportamento.titulo}
                        cols="12"
                      />
                      <span>{comportamento.descricao}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Base Legal</h3>
                <div className="prototype-regime-section">
                  <DocumentosLegaisAssociadosSeplag
                    label="Base Legal"
                    options={documentosLegaisMock}
                    value={baseLegalSelecionada}
                    onChange={setBaseLegalSelecionada}
                    onNovoCadastro={() => {}}
                    onVisualizar={() => {}}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Vigência</h3>
                <div className="prototype-cargo-vigencia-fields">
                  <SituacaoVigenciaSeplag<TipoVinculoForm>
                    control={control}
                    setValue={setValue}
                    rotuloDataAtivacao="Início de Vigência"
                    cols={{
                      situacao: "12 12 3",
                      dataAtivacao: "12 12 3",
                      statusOperacional:
                        "col-12 md:col-4 lg:col-4 prototype-status-operacional-col",
                      dataEncerramento: "12 12 3",
                      motivoEncerramento: "12",
                      dataExtincao: "12 12 3",
                      motivoExtincao: "12",
                    }}
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Observação</h3>
                <div className="grid prototype-cargo-form-fields">
                  <TextAreaFieldSeplag
                    name="observacao"
                    control={control}
                    label="Observação"
                    cols="12"
                    rows={4}
                    maxLength={500}
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <div className="prototype-category-form-footer">
                <BotaoVoltarSeplag
                  type="button"
                  onClick={() => navigate(`${routePrefix}/tipo-vinculo`)}
                />
                <BotaoSalvarSeplag type="submit" />
              </div>
            </div>
          </CardSeplag>
        </div>
      </form>
    </PrototypeSystemPage>
  );
}

export function PrototiposEfetivoExercicioPage() {
  const navigate = useNavigate();
  const { control, reset, watch } = useForm<IngressoEfetivoExercicioFiltroForm>({
    defaultValues: {
      termo: "",
    },
  });
  const [situacaoFiltro, setSituacaoFiltro] = useState<IngressoSituacao | "">("");
  const [acoesIngressoMenuAbertoId, setAcoesIngressoMenuAbertoId] = useState<number | null>(null);
  const [historicoIngressoSelecionadoId, setHistoricoIngressoSelecionadoId] = useState<number | null>(null);
  const termoBusca = watch("termo")?.trim().toLowerCase() ?? "";
  const situacoesEfetivoExercicio: IngressoSituacao[] = [
    "Aguardando Efetivo Exercicio",
    "Ingresso Concluído",
    "Tornado sem efeito",
  ];
  const situacoesIngressosSalvas = JSON.parse(
    localStorage.getItem("prototype-ingresso-situacoes") ?? "{}",
  ) as Partial<Record<string, IngressoSituacao>>;
  const datasEfetivoExercicioSalvas = JSON.parse(
    localStorage.getItem("prototype-ingresso-datas-efetivo-exercicio") ?? "{}",
  ) as Partial<Record<string, string>>;
  const getSituacaoEfetivoExercicio = (candidatoId: number) =>
    situacoesIngressosSalvas[String(candidatoId)] ??
    ingressosMock.find((ingresso) => ingresso.id === candidatoId)?.situacao ??
    "Aguardando Analise";
  const parseDataEfetivoExercicio = (data: string) => {
    if (!data || data === "-") return null;
    const [dia, mes, ano] = data.split("/").map(Number);

    if (!dia || !mes || !ano) return null;

    return new Date(ano, mes - 1, dia);
  };
  const formatarDataEfetivoExercicio = (data: Date) =>
    data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const getLimiteEfetivoExercicio = (candidato: IngressoCandidatoRow) => {
    const dataPosse = parseDataEfetivoExercicio(candidato.dataPosse);

    if (!dataPosse) return "-";

    const limite = new Date(dataPosse);
    limite.setDate(limite.getDate() + 15);

    return formatarDataEfetivoExercicio(limite);
  };
  const todosRegistrosEfetivoExercicio = ingressoConcursosProcessosMock
    .flatMap((concursoProcesso) =>
      concursoProcesso.candidatos.map((candidato) => {
        const ingresso = ingressosMock.find((item) => item.id === candidato.id);
        const situacao = getSituacaoEfetivoExercicio(candidato.id);

        return {
          id: candidato.id,
          nome: candidato.nome,
          cpf: ingresso?.cpf ?? "-",
          nomeConcurso: concursoProcesso.titulo,
          edital: concursoProcesso.edital,
          cargo: candidato.cargo,
          tipo: concursoProcesso.tipo,
          orgao: concursoProcesso.orgao,
          classificacao: candidato.classificacao,
          tipoVaga: candidato.tipoVaga,
          limiteEfetivoExercicio: getLimiteEfetivoExercicio(candidato),
          dataEfetivoExercicio:
            situacao === "Ingresso Concluído"
              ? datasEfetivoExercicioSalvas[String(candidato.id)] ?? candidato.dataEfetivoExercicio
              : "-",
          situacao,
        };
      }),
    )
    .filter((registro) => situacoesEfetivoExercicio.includes(registro.situacao));
  const totalEfetivoExercicioPorSituacao = situacoesEfetivoExercicio.reduce(
    (acc, situacao) => ({
      ...acc,
      [situacao]: todosRegistrosEfetivoExercicio.filter((registro) => registro.situacao === situacao).length,
    }),
    {} as Record<IngressoSituacao, number>,
  );
  const registrosEfetivoExercicio = todosRegistrosEfetivoExercicio.filter((registro) => {
      const atendeTermo =
        !termoBusca ||
        registro.nome.toLowerCase().includes(termoBusca) ||
        registro.cpf.replace(/\D/g, "").includes(termoBusca.replace(/\D/g, ""));
      const atendeSituacao = !situacaoFiltro || registro.situacao === situacaoFiltro;

      return atendeTermo && atendeSituacao;
    });
  const limparFiltros = () => {
    reset({ termo: "" });
    setSituacaoFiltro("");
  };
  const getSituacaoIngressoBadge = (situacao: IngressoSituacao) => {
    const badgeMap: Partial<Record<IngressoSituacao, { color: string; bg: string; descricao: string }>> = {
      "Aguardando Efetivo Exercicio": {
        color: "#be185d",
        bg: "#fce7f3",
        descricao: "Ingresso aguardando registro do efetivo exercício.",
      },
      "Tornado sem efeito": {
        color: "#6b7280",
        bg: "#f3f4f6",
        descricao: "Ingresso tornado sem efeito por n?o comparecimento ao efetivo exerc?cio.",
      },
      "Ingresso Concluído": {
        color: "#00843d",
        bg: "#e2f3e8",
        descricao: "Fluxo finalizado com matrícula e vínculo ativos.",
      },
    };

    return badgeMap[situacao] ?? {
      color: "#344054",
      bg: "#f2f4f7",
      descricao: situacao,
    };
  };
  const candidatoHistoricoSelecionado = historicoIngressoSelecionadoId
    ? ingressoConcursosProcessosMock
        .flatMap((concursoProcesso) =>
          concursoProcesso.candidatos.map((candidato) => ({ candidato, concursoProcesso })),
        )
        .find(({ candidato }) => candidato.id === historicoIngressoSelecionadoId)
    : undefined;
  const ingressoHistoricoSelecionado = historicoIngressoSelecionadoId
    ? ingressosMock.find((ingresso) => ingresso.id === historicoIngressoSelecionadoId)
    : undefined;
  const situacaoHistoricoSelecionado = historicoIngressoSelecionadoId
    ? getSituacaoEfetivoExercicio(historicoIngressoSelecionadoId)
    : undefined;
  const situacaoHistoricoBadge = situacaoHistoricoSelecionado
    ? getSituacaoIngressoBadge(situacaoHistoricoSelecionado)
    : undefined;
  const historicoEtapasSelecionadas = ingressoHistoricoSelecionado && situacaoHistoricoSelecionado
    ? getHistoricoIngressoMock(ingressoHistoricoSelecionado, situacaoHistoricoSelecionado)
    : [];

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag title="Efetivo Exercício" cols="12" cardHeaderClassNames="prototype-ingressos-card">
          <section className="prototype-ingressos-dashboard prototype-efetivo-exercicio-dashboard">
            <div className="prototype-ingressos-dashboard-grid prototype-efetivo-exercicio-dashboard-grid">
              {situacoesEfetivoExercicio.map((situacao) => {
                const badge = getSituacaoIngressoBadge(situacao);

                return (
                  <div
                    key={situacao}
                    className="prototype-ingressos-dashboard-card prototype-efetivo-exercicio-dashboard-card"
                    style={{
                      "--dashboard-card-bg": badge.bg,
                      "--dashboard-card-color": badge.color,
                    } as React.CSSProperties}
                    title={badge.descricao}
                  >
                    <span style={{ color: badge.color }}>{situacao}</span>
                    <strong>{totalEfetivoExercicioPorSituacao[situacao]}</strong>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="prototype-category-filters prototype-ingressos-filters grid">
            <TextFieldSeplag
              name="termo"
              control={control}
              label="Nome ou CPF"
              cols="12 12 4"
              getFormErrorMessage={() => null}
            />
            <label className="col-12 md:col-6 lg:col-3 prototype-native-field">
              <span>Situação</span>
              <select value={situacaoFiltro} onChange={(event) => setSituacaoFiltro(event.target.value as IngressoSituacao | "")}>
                <option value="">Todas</option>
                {situacoesEfetivoExercicio.map((situacao) => (
                  <option key={situacao} value={situacao}>
                    {situacao}
                  </option>
                ))}
              </select>
            </label>
            <div className="prototype-category-clear col-12 md:col-6 lg:col-3">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={limparFiltros}
              />
            </div>
          </div>

          <div className="prototype-efetivo-exercicio-table-wrap">
            <table className="prototype-simple-table prototype-ingresso-candidatos-table prototype-efetivo-exercicio-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Concurso</th>
                <th>Edital</th>
                <th>Cargo</th>
                <th>Limite Efetivo Exercício</th>
                <th>Data do Efetivo Exercício</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {registrosEfetivoExercicio.length === 0 ? (
                <tr>
                  <td colSpan={9} className="prototype-empty-table-cell">
                    Nenhum registro encontrado para os filtros informados.
                  </td>
                </tr>
              ) : (
                registrosEfetivoExercicio.map((registro) => {
                  const badge = getSituacaoIngressoBadge(registro.situacao);
                  const podeAtuarEfetivoExercicio = registro.situacao === "Aguardando Efetivo Exercicio";
                  const parametrosAtuacaoIngresso = `candidato=${registro.id}&tipo=${encodeURIComponent(
                    registro.tipo,
                  )}&concurso=${encodeURIComponent(
                    registro.nomeConcurso,
                  )}&orgao=${encodeURIComponent(
                    registro.orgao,
                  )}&cargo=${encodeURIComponent(
                    registro.cargo,
                  )}&classificacao=${encodeURIComponent(
                    registro.classificacao,
                  )}&tipoVaga=${encodeURIComponent(registro.tipoVaga)}`;

                  return (
                    <tr key={registro.id}>
                      <td>{registro.nome}</td>
                      <td>{registro.cpf}</td>
                      <td>{registro.nomeConcurso}</td>
                      <td>{registro.edital}</td>
                      <td>{registro.cargo}</td>
                      <td>{registro.limiteEfetivoExercicio}</td>
                      <td>{registro.dataEfetivoExercicio}</td>
                      <td>
                        <span title={badge.descricao}>
                          <BadgeSeplag
                            label={registro.situacao}
                            color={badge.color}
                            bg={badge.bg}
                            border="transparent"
                            size="md"
                          />
                        </span>
                      </td>
                      <td>
                        <div className="prototype-ingresso-candidato-actions">
                          <div className="prototype-ingresso-actions-dropdown">
                            <div className="prototype-ingresso-actions-trigger" role="group" aria-label="Ações do efetivo exercício">
                              <button
                                type="button"
                                className="prototype-ingresso-actions-eye"
                                title="Visualizar"
                                aria-label="Visualizar"
                                onClick={() => navigate(`/prototipos/sigep/ingressos/${registro.id}`)}
                              >
                                <i className="pi pi-eye" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="prototype-ingresso-actions-arrow"
                                title="Mais ações"
                                aria-label="Mais ações"
                                aria-expanded={acoesIngressoMenuAbertoId === registro.id}
                                onClick={() =>
                                  setAcoesIngressoMenuAbertoId((current) =>
                                    current === registro.id ? null : registro.id,
                                  )
                                }
                              >
                                <i className="pi pi-chevron-down" aria-hidden="true" />
                              </button>
                            </div>

                            {acoesIngressoMenuAbertoId === registro.id ? (
                              <div className="prototype-ingresso-actions-menu" role="menu">
                                {podeAtuarEfetivoExercicio ? (
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                      setAcoesIngressoMenuAbertoId(null);
                                      navigate(`/prototipos/sigep/ingressos/novo?${parametrosAtuacaoIngresso}&perfil=setorial`);
                                    }}
                                  >
                                    <i className="pi pi-briefcase" aria-hidden="true" />
                                    <span>Atuar efetivo exercício</span>
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setAcoesIngressoMenuAbertoId(null);
                                    setHistoricoIngressoSelecionadoId(registro.id);
                                  }}
                                >
                                  <i className="pi pi-history" aria-hidden="true" />
                                  <span>Histórico</span>
                                </button>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setAcoesIngressoMenuAbertoId(null);
                                    navigate(`/prototipos/sigep/ingressos/${registro.id}/pasta-funcional`);
                                  }}
                                >
                                  <i className="pi pi-folder" aria-hidden="true" />
                                  <span>Pasta funcional do servidor</span>
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            </table>
          </div>

          <ModalSeplag
            visible={Boolean(historicoIngressoSelecionadoId)}
            titulo="Histórico do Ingresso"
            fechar={() => setHistoricoIngressoSelecionadoId(null)}
            tamanho="920px"
            hideFooter
          >
            {ingressoHistoricoSelecionado &&
            candidatoHistoricoSelecionado &&
            situacaoHistoricoSelecionado &&
            situacaoHistoricoBadge ? (
              <div className="col-12 prototype-ingresso-historico-modal">
                <div className="prototype-ingresso-historico-panel">
                  <div className="prototype-ingresso-historico-header">
                    <div>
                      <strong>{getNumeroIngresso(ingressoHistoricoSelecionado.id)}</strong>
                    </div>
                    <BadgeSeplag
                      label={situacaoHistoricoSelecionado}
                      color={situacaoHistoricoBadge.color}
                      bg={situacaoHistoricoBadge.bg}
                      border="transparent"
                      size="md"
                    />
                  </div>

                  <div className="prototype-ingresso-historico-context">
                    <div>
                      <span>Candidato</span>
                      <strong>{candidatoHistoricoSelecionado.candidato.nome}</strong>
                    </div>
                    <div>
                      <span>Concurso/Processo</span>
                      <strong>{candidatoHistoricoSelecionado.concursoProcesso.titulo}</strong>
                    </div>
                    <div>
                      <span>?rg?o</span>
                      <strong>{candidatoHistoricoSelecionado.concursoProcesso.orgao}</strong>
                    </div>
                    <div>
                      <span>Cargo</span>
                      <strong>{candidatoHistoricoSelecionado.candidato.cargo}</strong>
                    </div>
                  </div>

                  <ol className="prototype-ingresso-historico-timeline">
                    {historicoEtapasSelecionadas.map((historico) => (
                      <li key={historico.id} className="prototype-ingresso-historico-timeline-item">
                        <span className="prototype-ingresso-historico-timeline-marker" aria-hidden="true" />
                        <div className="prototype-ingresso-historico-timeline-card">
                          <div className="prototype-ingresso-historico-timeline-title">
                            <strong>{historico.etapa}</strong>
                          </div>
                          <dl className="prototype-ingresso-historico-timeline-meta">
                            <div>
                              <dt>Data/Hora</dt>
                              <dd>{historico.dataHora}</dd>
                            </div>
                            <div>
                              <dt>Respons?vel</dt>
                              <dd>{historico.responsavel}</dd>
                            </div>
                            <div>
                              <dt>Resultado</dt>
                              <dd>{historico.resultado}</dd>
                            </div>
                          </dl>
                          <p>{historico.observacao}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : null}
          </ModalSeplag>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

interface IngressoEfetivoExercicioFiltroForm {
  termo: string;
}

export function PrototiposIngressosTestePage() {
  const navigate = useNavigate();
  const { control, reset, watch } = useForm<IngressoFiltroForm>({
    defaultValues: {
      concursoProcessoSeletivo: "",
    },
  });
  const filtros = watch();
  const concursoProcessoSeletivoBusca = filtros.concursoProcessoSeletivo?.trim().toLowerCase();

  const registrosIngressoTeste: IngressosTesteGridRow[] = useMemo(() => {
    const situacoesIngressosSalvas = JSON.parse(
      localStorage.getItem("prototype-ingresso-situacoes") ?? "{}",
    ) as Partial<Record<string, IngressoSituacao>>;
    const concursosProcessos = ingressoConcursosProcessosMock.map((concursoProcesso) => {
      const ingressados = concursoProcesso.candidatos.filter(
        (candidato) =>
          (situacoesIngressosSalvas[String(candidato.id)] ??
            ingressosMock.find((ingresso) => ingresso.id === candidato.id)?.situacao) === "Ingresso Concluído",
      ).length;

      return {
        id: `${concursoProcesso.tipo}-${concursoProcesso.id}`,
        titulo: concursoProcesso.titulo,
        tipo: concursoProcesso.tipo,
        orgao: concursoProcesso.orgao,
        edital: concursoProcesso.edital,
        nomeados: concursoProcesso.candidatos.length,
        ingressados,
        rotaIngresso: `/prototipos/sigep/ingressos-teste/${concursoProcesso.id}`,
      };
    });
    const nomeacoes = ingressosMock
      .filter((ingresso) => ingresso.tipoIngresso === "Nomeação")
      .map((ingresso) => ({
        id: `Nomeação-${ingresso.id}`,
        titulo: `Nomeação ${ingresso.nome}`,
        tipo: "Nomeação" as const,
        orgao: ingresso.orgao,
        edital: ingresso.cargo,
        nomeados: 1,
        ingressados: ingresso.situacao === "Ingresso Concluído" ? 1 : 0,
        rotaIngresso: `/prototipos/sigep/ingressos/novo?nomeacao=${ingresso.id}`,
      }));

    return [...concursosProcessos, ...nomeacoes];
  }, []);

  const registrosFiltrados = registrosIngressoTeste.filter((registro) => {
    if (!concursoProcessoSeletivoBusca) return true;

    return [registro.titulo, registro.tipo, registro.orgao, registro.edital]
      .join(" ")
      .toLowerCase()
      .includes(concursoProcessoSeletivoBusca);
  });

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag
          title="Gestão de Ingresso"
          cols="12"
          cardHeaderClassNames="prototype-regime-card prototype-ingressos-card"
        >
          <div className="prototype-ingressos-teste-filters grid">
            <TextFieldSeplag
              name="concursoProcessoSeletivo"
              control={control}
              label="Concurso/Processo Seletivo"
              placeholder="Buscar por concurso, seletivo, nomeação, órgão ou edital"
              col="12"
            />
            <div className="prototype-category-clear">
              <BotaoLimparFiltroSeplag
                type="button"
                onClick={() => reset({ concursoProcessoSeletivo: "" })}
              />
            </div>
          </div>

          <div className="prototype-ingressos-teste-grid" role="grid" aria-label="Concursos, seletivos e nomeações">
            {registrosFiltrados.map((registro) => (
              <div className="prototype-ingressos-teste-row" role="row" key={registro.id}>
                <div className="prototype-ingressos-teste-row-main">
                  <strong>{registro.titulo}</strong>
                  <span>{registro.tipo} • {registro.orgao} • {registro.edital}</span>
                </div>
                <div className="prototype-ingressos-teste-row-actions">
                  <span className="prototype-ingressos-teste-counter">
                    {registro.nomeados} nomeado(s) • {registro.ingressados} ingressado(s)
                  </span>
                  <BotaoSeplag
                    type="button"
                    label="Ingressar"
                    icon="pi pi-sign-in"
                    tooltip={`Ingressar em ${registro.titulo}`}
                    onClick={() => navigate(registro.rotaIngresso)}
                  />

                </div>
              </div>
            ))}
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}
export function PrototiposIngressosTesteDetalhePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const concursoProcesso = ingressoConcursosProcessosMock.find(
    (item) => item.id === Number(id),
  );
  const [filtrosGrupo, setFiltrosGrupo] = useState<
    Record<string, { nome: string; situacao: IngressoSituacao | "" }>
  >({});

  const situacoesIngressosSalvas = JSON.parse(
    localStorage.getItem("prototype-ingresso-situacoes") ?? "{}",
  ) as Partial<Record<string, IngressoSituacao>>;
  const datasEfetivoExercicioSalvas = JSON.parse(
    localStorage.getItem("prototype-ingresso-datas-efetivo-exercicio") ?? "{}",
  ) as Partial<Record<string, string>>;
  const situacoesDisponiveis: IngressoSituacao[] = [
    "Aguardando Analise",
    "Em analise",
    "Aguardando Efetivo Exercicio",
    "Ingresso Concluído",
    "Posse Suspensa",
    "Posse Negada",
    "Tornado sem efeito",
  ];
  const getFiltroGrupo = (grupoId: string) =>
    filtrosGrupo[grupoId] ?? { nome: "", situacao: "" };
  const atualizarFiltroGrupo = (
    grupoId: string,
    campo: "nome" | "situacao",
    valor: string,
  ) => {
    setFiltrosGrupo((current) => ({
      ...current,
      [grupoId]: {
        ...getFiltroGrupo(grupoId),
        [campo]: valor,
      },
    }));
  };
  const limparFiltroGrupo = (grupoId: string) => {
    setFiltrosGrupo((current) => ({
      ...current,
      [grupoId]: { nome: "", situacao: "" },
    }));
  };
  const getSituacaoCandidato = (candidatoId: number) =>
    situacoesIngressosSalvas[String(candidatoId)] ??
    ingressosMock.find((ingresso) => ingresso.id === candidatoId)?.situacao ??
    "Aguardando Analise";
  const getDataEfetivoExercicio = (candidato: IngressoCandidatoRow) =>
    datasEfetivoExercicioSalvas[String(candidato.id)] ?? candidato.dataEfetivoExercicio;
  const getSituacaoBadge = (situacao: IngressoSituacao) => {
    const badgeMap: Record<IngressoSituacao, { color: string; bg: string }> = {
      "Aguardando Analise": { color: "#8a5a00", bg: "#fff4d6" },
      "Em analise": { color: "#0057d9", bg: "#e7f1ff" },
      "Posse Suspensa": { color: "#6d28d9", bg: "#f1e8ff" },
      "Aguardando Efetivo Exercicio": { color: "#be185d", bg: "#fce7f3" },
      "Tornado sem efeito": { color: "#6b7280", bg: "#f3f4f6" },
      "Posse Negada": { color: "#b42318", bg: "#fee4e2" },
      "Ingresso Concluído": { color: "#00843d", bg: "#e2f3e8" },
    };

    return badgeMap[situacao];
  };
  const parseData = (data: string) => {
    if (!data || data === "-") return null;
    const [dia, mes, ano] = data.split("/").map(Number);

    return dia && mes && ano ? new Date(ano, mes - 1, dia) : null;
  };
  const formatarData = (data: Date) =>
    data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const somarDias = (data: Date, dias: number) => {
    const novaData = new Date(data);
    novaData.setDate(novaData.getDate() + dias);

    return novaData;
  };
  const getLimitePosse = (candidato: IngressoCandidatoRow) => {
    const dataNomeacao = parseData(candidato.dataNomeacao);

    return dataNomeacao ? formatarData(somarDias(dataNomeacao, 30)) : "-";
  };
  const getLimiteEfetivoExercicio = (candidato: IngressoCandidatoRow) => {
    const dataPosse = parseData(candidato.dataPosse);

    return dataPosse ? formatarData(somarDias(dataPosse, 15)) : "-";
  };
  const getCandidatosFiltrados = (grupo: IngressoCandidatoGrupoRow) => {
    const filtro = getFiltroGrupo(grupo.id);
    const nomeBusca = filtro.nome.trim().toLowerCase();

    return grupo.candidatos.filter((candidato) => {
      const atendeNome = !nomeBusca || candidato.nome.toLowerCase().includes(nomeBusca);
      const atendeSituacao = !filtro.situacao || getSituacaoCandidato(candidato.id) === filtro.situacao;

      return atendeNome && atendeSituacao;
    });
  };

  if (!concursoProcesso) {
    return (
      <PrototypeSystemPage
        nomeSistema="GESTÃO DE PESSOAS"
        ambienteSistema="Teste"
        menuItems={menuGestaoPessoas}
      >
        <div className="prototype-page-content prototype-page-content--white">
          <CardSeplag title="Gestão de Ingresso" cols="12" cardHeaderClassNames="prototype-regime-card">
            <div className="prototype-empty-table-cell">Concurso ou processo seletivo não encontrado.</div>
          </CardSeplag>
        </div>
      </PrototypeSystemPage>
    );
  }

  const grupos = agruparCandidatosIngressoPorVaga(concursoProcesso.candidatos);
  const totalIngressadosConcurso = concursoProcesso.candidatos.filter(
    (candidato) => getSituacaoCandidato(candidato.id) === "Ingresso Concluído",
  ).length;
  const dashboardSituacoesConcurso: {
    situacao: IngressoSituacao;
    label: string;
    color: string;
    bg: string;
  }[] = [
    { situacao: "Aguardando Analise", label: "Aguardando Analise", color: "#8a5a00", bg: "#fff4d6" },
    { situacao: "Em analise", label: "Em analise", color: "#0057d9", bg: "#e7f1ff" },
    { situacao: "Aguardando Efetivo Exercicio", label: "Aguardando Efetivo Exercicio", color: "#be185d", bg: "#fce7f3" },
    { situacao: "Ingresso Concluído", label: "Ingresso Concluído", color: "#00843d", bg: "#e2f3e8" },
    { situacao: "Posse Suspensa", label: "Posse Suspensa", color: "#6d28d9", bg: "#f1e8ff" },
    { situacao: "Posse Negada", label: "Posse Negada", color: "#b42318", bg: "#fee4e2" },
    { situacao: "Tornado sem efeito", label: "Tornado sem efeito", color: "#6b7280", bg: "#f3f4f6" },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag
          title={concursoProcesso.titulo}
          cols="12"
          cardHeaderClassNames="prototype-regime-card prototype-ingressos-card"
        >
          <div className="prototype-ingressos-teste-info-card">
            <strong className="prototype-ingressos-teste-info-title">Informações do Concurso</strong>
            <div className="prototype-ingressos-teste-info-grid">
              <p><strong>Tipo:</strong> {concursoProcesso.tipo}</p>
              <p><strong>Edital:</strong> {concursoProcesso.edital}</p>
              <p><strong>Órgão:</strong> {concursoProcesso.orgao}</p>
              <p><strong>Total de vagas:</strong> {concursoProcesso.candidatos.length}</p>
              <p><strong>Total de nomeados:</strong> {concursoProcesso.candidatos.length}</p>
              <p><strong>Total de ingressados:</strong> {totalIngressadosConcurso}</p>
            </div>
          </div>

          <div className="prototype-ingressos-teste-dashboard" aria-label="Resumo por situação do concurso">
            {dashboardSituacoesConcurso.map((item) => (
              <div
                key={item.situacao}
                className="prototype-ingressos-teste-dashboard-card"
                style={{
                  "--dashboard-card-color": item.color,
                  "--dashboard-card-bg": item.bg,
                } as React.CSSProperties}
              >
                <span>{item.label}</span>
                <strong>
                  {concursoProcesso.candidatos.filter(
                    (candidato) => getSituacaoCandidato(candidato.id) === item.situacao,
                  ).length}
                </strong>
              </div>
            ))}
          </div>

          <div className="prototype-ingresso-vaga-accordion-list prototype-ingressos-teste-detail-grid">
            {grupos.map((grupo, grupoIndex) => {
              const candidatosFiltrados = getCandidatosFiltrados(grupo);
              const classificacaoBadge = getTipoVagaIngressoBadge(grupo.classificacao);

              return (
                <details
                  key={grupo.id}
                  className="prototype-ingresso-vaga-accordion"
                  open={grupoIndex === 0}
                >
                  <summary className="prototype-ingresso-vaga-accordion-summary">
                    <div>
                      <strong>{grupo.vagaEspecialidade}</strong>
                      <span>Perfil/Especialidade: {grupo.perfilEspecialidade}</span>
                      <span>Polo: {grupo.polo}</span>
                    </div>
                    <div className="prototype-ingresso-vaga-summary-meta">
                      <BadgeSeplag
                        label={`Classificação: ${grupo.classificacao}`}
                        color={classificacaoBadge.color}
                        bg={classificacaoBadge.bg}
                        border="transparent"
                        size="md"
                      />
                      <BadgeSeplag
                        label={`${grupo.candidatos.length} nomeado(s)`}
                        color="#005494"
                        bg="#e6f0f8"
                        border="transparent"
                        size="md"
                      />
                      <i className="pi pi-chevron-right prototype-ingresso-accordion-chevron" aria-hidden="true" />
                    </div>
                  </summary>

                  <div className="prototype-ingresso-vaga-accordion-content">
                    <div className="prototype-ingresso-accordion-filters prototype-ingresso-vaga-filters">
                      <label>
                        <span>Nome</span>
                        <input
                          type="text"
                          value={getFiltroGrupo(grupo.id).nome}
                          onChange={(event) => atualizarFiltroGrupo(grupo.id, "nome", event.target.value)}
                          placeholder="Buscar por nome"
                        />
                      </label>
                      <label>
                        <span>Situação</span>
                        <select
                          value={getFiltroGrupo(grupo.id).situacao}
                          onChange={(event) => atualizarFiltroGrupo(grupo.id, "situacao", event.target.value)}
                        >
                          <option value="">Todas</option>
                          {situacoesDisponiveis.map((situacao) => (
                            <option key={situacao} value={situacao}>
                              {situacao}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        className="prototype-ingresso-accordion-clear"
                        onClick={() => limparFiltroGrupo(grupo.id)}
                      >
                        <i className="pi pi-refresh" aria-hidden="true" />
                        Limpar
                      </button>
                    </div>
                    <table className="prototype-simple-table prototype-ingresso-candidatos-table">
                      <thead>
                        <tr>
                          <th>Classificação</th>
                          <th>Nome</th>
                          <th>Cargo</th>
                          <th>Órgão</th>
                          <th>Tipo da Vaga</th>
                          <th>Posse Agendada</th>
                          <th>Limite da Posse</th>
                          <th>Limite Efetivo Exercício</th>
                          <th>Data do Efetivo Exercício</th>
                          <th>Situação</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidatosFiltrados.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="prototype-empty-table-cell">
                              Nenhum registro encontrado para os filtros informados.
                            </td>
                          </tr>
                        ) : (
                          candidatosFiltrados.map((candidato) => {
                            const tipoVagaBadge = getTipoVagaIngressoBadge(candidato.tipoVaga);
                            const situacao = getSituacaoCandidato(candidato.id);
                            const situacaoBadge = getSituacaoBadge(situacao);
                            const parametrosAtuacao = `candidato=${candidato.id}&tipo=${encodeURIComponent(
                              concursoProcesso.tipo,
                            )}&concurso=${encodeURIComponent(concursoProcesso.titulo)}&orgao=${encodeURIComponent(
                              concursoProcesso.orgao,
                            )}&cargo=${encodeURIComponent(candidato.cargo)}&classificacao=${encodeURIComponent(
                              candidato.classificacao,
                            )}&tipoVaga=${encodeURIComponent(candidato.tipoVaga)}`;

                            return (
                              <tr key={candidato.id}>
                                <td>{candidato.classificacao}</td>
                                <td>{candidato.nome}</td>
                                <td>{candidato.cargo}</td>
                                <td>{concursoProcesso.orgao}</td>
                                <td>
                                  <BadgeSeplag
                                    label={candidato.tipoVaga}
                                    color={tipoVagaBadge.color}
                                    bg={tipoVagaBadge.bg}
                                    border="transparent"
                                    size="md"
                                  />
                                </td>
                                <td>{candidato.dataPosse}</td>
                                <td>{getLimitePosse(candidato)}</td>
                                <td>{getLimiteEfetivoExercicio(candidato)}</td>
                                <td>{situacao === "Ingresso Concluído" ? getDataEfetivoExercicio(candidato) : "-"}</td>
                                <td>
                                  <BadgeSeplag
                                    label={situacao}
                                    color={situacaoBadge.color}
                                    bg={situacaoBadge.bg}
                                    border="transparent"
                                    size="md"
                                  />
                                </td>
                                <td>
                                  <div className="prototype-ingressos-teste-person-actions">
                                    <BotaoIconSeplag
                                      type="button"
                                      icon="pi pi-eye"
                                      tooltip="Visualizar ingresso"
                                      onClick={() => navigate(`/prototipos/sigep/ingressos/${candidato.id}`)}
                                    />
                                    <BotaoIconSeplag
                                      type="button"
                                      icon="pi pi-sign-in"
                                      tooltip="Ingressar candidato"
                                      onClick={() => navigate(`/prototipos/sigep/ingressos/novo?${parametrosAtuacao}`)}
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </details>
              );
            })}
          </div>

          <div className="prototype-ingressos-teste-detail-actions prototype-ingressos-teste-detail-actions--bottom">
            <BotaoVoltarSeplag type="button" onClick={() => navigate("/prototipos/sigep/ingressos-teste")} />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}
export function PrototiposIngressosPage() {
  const navigate = useNavigate();
  const { control, reset, watch } = useForm<IngressoFiltroForm>({
    defaultValues: {
      concursoProcessoSeletivo: "",
    },
  });
  const [perfilIngressos, setPerfilIngressos] = useState<IngressoPerfil>("PROVIMENTO");
  const [historicoIngressoSelecionadoId, setHistoricoIngressoSelecionadoId] = useState<number | null>(null);
  const [acoesIngressoMenuAbertoId, setAcoesIngressoMenuAbertoId] = useState<number | null>(null);
  const [filtrosAccordionIngresso, setFiltrosAccordionIngresso] = useState<
    Record<string, { nome: string; situacao: IngressoSituacao | "" }>
  >({});
  const filtros = watch();
  const concursoProcessoSeletivoBusca = filtros.concursoProcessoSeletivo?.trim().toLowerCase();

  const concursosProcessosFiltrados = ingressoConcursosProcessosMock.filter((concursoProcesso) => {
    const atendeConcursoProcessoSeletivo =
      !concursoProcessoSeletivoBusca ||
      concursoProcesso.titulo.toLowerCase().includes(concursoProcessoSeletivoBusca) ||
      concursoProcesso.tipo.toLowerCase().includes(concursoProcessoSeletivoBusca) ||
      concursoProcesso.orgao.toLowerCase().includes(concursoProcessoSeletivoBusca) ||
      concursoProcesso.edital.toLowerCase().includes(concursoProcessoSeletivoBusca);

    return atendeConcursoProcessoSeletivo;
  });
  const situacoesIngressosSalvas = JSON.parse(
    localStorage.getItem("prototype-ingresso-situacoes") ?? "{}",
  ) as Partial<Record<string, IngressoSituacao>>;
  const datasEfetivoExercicioSalvas = JSON.parse(
    localStorage.getItem("prototype-ingresso-datas-efetivo-exercicio") ?? "{}",
  ) as Partial<Record<string, string>>;
  const getSituacaoCandidatoIngresso = (candidatoId: number) =>
    situacoesIngressosSalvas[String(candidatoId)] ??
    ingressosMock.find((ingresso) => ingresso.id === candidatoId)?.situacao ??
    "Aguardando Analise";
  const getDataEfetivoExercicioCandidato = (candidato: IngressoCandidatoRow) =>
    datasEfetivoExercicioSalvas[String(candidato.id)] ?? candidato.dataEfetivoExercicio;
  const getHistoricoCandidatoIngresso = (candidatoId: number) => {
    const ingresso = ingressosMock.find((item) => item.id === candidatoId);

    return ingresso ? getHistoricoIngressoMock(ingresso, getSituacaoCandidatoIngresso(candidatoId)) : [];
  };
  const getResumoCandidatosConcursoProcesso = (candidatos: IngressoCandidatoRow[]) => {
    const totalIngressados = candidatos.filter(
      (candidato) => getSituacaoCandidatoIngresso(candidato.id) === "Ingresso Concluído",
    ).length;

    return `${candidatos.length} nomeado(s) • ${totalIngressados} ingressado(s)`;
  };
  const getSituacaoIngressoBadge = (situacao: IngressoSituacao) => {
    const badgeMap: Record<IngressoSituacao, { color: string; bg: string; descricao: string }> = {
      "Aguardando Analise": {
        color: "#8a5a00",
        bg: "#fff4d6",
        descricao: "Ingresso aguardando análise do provimento.",
      },
"Em analise": {
        color: "#0057d9",
        bg: "#e7f1ff",
        descricao: "Provimento iniciou a conferência da documentação, requisitos e laudo.",
      },
      "Posse Suspensa": {
        color: "#6d28d9",
        bg: "#f1e8ff",
        descricao: "Provimento suspendeu temporariamente a contagem do prazo para análise mais profunda.",
      },
      "Aguardando Efetivo Exercicio": {
        color: "#be185d",
        bg: "#fce7f3",
        descricao: "Ingresso aguardando registro do efetivo exercício.",
      },
      "Tornado sem efeito": {
        color: "#6b7280",
        bg: "#f3f4f6",
        descricao: "Ingresso tornado sem efeito.",
      },
      "Posse Negada": {
        color: "#b42318",
        bg: "#fee4e2",
        descricao: "Candidato não atende aos requisitos para posse.",
      },
      "Ingresso Concluído": {
        color: "#00843d",
        bg: "#e2f3e8",
        descricao: "Fluxo finalizado com matrícula e vínculo ativos.",
      },
    };

    return badgeMap[situacao];
  };
  const situacoesDashboard: IngressoSituacao[] = [
    "Aguardando Analise",
    "Em analise",
    "Aguardando Efetivo Exercicio",
    "Ingresso Concluído",
    "Posse Suspensa",
    "Posse Negada",
    "Tornado sem efeito",
  ];
  const candidatosDashboard = ingressoConcursosProcessosMock.flatMap(
    (concursoProcesso) => concursoProcesso.candidatos,
  );
  const totalIngressosPorSituacao = situacoesDashboard.reduce(
    (acc, situacao) => ({
      ...acc,
      [situacao]: candidatosDashboard.filter(
        (candidato) => getSituacaoCandidatoIngresso(candidato.id) === situacao,
      ).length,
    }),
    {} as Record<IngressoSituacao, number>,
  );
  const isPerfilIngressosProvimento = perfilIngressos === "PROVIMENTO";
  const isPerfilIngressosSetorial = perfilIngressos === "SETORIAL";
  const podeIngressarCandidato = (situacao: IngressoSituacao) =>
    isPerfilIngressosProvimento &&
    ![
      "Aguardando Efetivo Exercicio",
      "Tornado sem efeito",
      "Posse Negada",
      "Ingresso Concluído",
    ].includes(situacao);
  const podeAtuarEfetivoExercicioSetorial = (situacao: IngressoSituacao) =>
    isPerfilIngressosSetorial && situacao === "Aguardando Efetivo Exercicio";
  const getEtapaInicialProvimento = (situacao: IngressoSituacao): NovoIngressoTab =>
    situacao === "Em analise" || situacao === "Posse Suspensa"
      ? "analise-provimento"
      : "tipo-ingresso";
  const parseDataGridIngresso = (data: string) => {
    if (!data || data === "-") return null;
    const [dia, mes, ano] = data.split("/").map(Number);

    if (!dia || !mes || !ano) return null;

    return new Date(ano, mes - 1, dia);
  };
  const addDiasIngresso = (data: Date, dias: number) => {
    const novaData = new Date(data);
    novaData.setDate(novaData.getDate() + dias);

    return novaData;
  };
  const formatarDataGridIngresso = (data: Date) =>
    data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const getLimitePosse = (candidato: IngressoCandidatoRow) => {
    const dataNomeacao = parseDataGridIngresso(candidato.dataNomeacao);

    return dataNomeacao ? formatarDataGridIngresso(addDiasIngresso(dataNomeacao, 30)) : "-";
  };
  const getLimiteEfetivoExercicio = (candidato: IngressoCandidatoRow) => {
    const dataPosse = parseDataGridIngresso(candidato.dataPosse);

    return dataPosse ? formatarDataGridIngresso(addDiasIngresso(dataPosse, 15)) : "-";
  };
  const getAlertaPrazoPosse = (candidato: IngressoCandidatoRow) => {
    const dataNomeacao = parseDataGridIngresso(candidato.dataNomeacao);

    if (!dataNomeacao) return null;

    const limitePosse = addDiasIngresso(dataNomeacao, 30);
    const dataPosse = parseDataGridIngresso(candidato.dataPosse);
    const prazoExcedido = dataPosse ? dataPosse > limitePosse : new Date() > limitePosse;

    return prazoExcedido
      ? `Prazo de posse ultrapassado. Limite permitido: ${formatarDataGridIngresso(limitePosse)}.`
      : null;
  };
  const getAlertaPrazoEfetivoExercicio = (candidato: IngressoCandidatoRow) => {
    const dataPosse = parseDataGridIngresso(candidato.dataPosse);

    if (!dataPosse) return null;

    const limiteExercicio = addDiasIngresso(dataPosse, 15);
    const dataExercicio = parseDataGridIngresso(candidato.dataEfetivoExercicio);
    const prazoExcedido = dataExercicio ? dataExercicio > limiteExercicio : new Date() > limiteExercicio;

    return prazoExcedido
      ? `Prazo de efetivo exercício ultrapassado. Limite permitido: ${formatarDataGridIngresso(limiteExercicio)}.`
      : null;
  };
  const renderDataComIndicadorPrazo = (data: string, alerta: string | null) => (
    <span className="prototype-ingresso-prazo-cell">
      <span>{data}</span>
      {alerta ? (
        <i className="pi pi-exclamation-triangle prototype-ingresso-prazo-alert" title={alerta} aria-label={alerta} />
      ) : null}
    </span>
  );
  const exibirPastaFuncionalServidor = (situacao: IngressoSituacao) =>
    ["Posse Suspensa", "Ingresso Concluído", "Aguardando Efetivo Exercicio"].includes(situacao);
  const ingressoHistoricoSelecionado = historicoIngressoSelecionadoId
    ? ingressosMock.find((ingresso) => ingresso.id === historicoIngressoSelecionadoId)
    : undefined;
  const candidatoHistoricoSelecionado = historicoIngressoSelecionadoId
    ? ingressoConcursosProcessosMock
        .flatMap((concursoProcesso) =>
          concursoProcesso.candidatos.map((candidato) => ({ candidato, concursoProcesso })),
        )
        .find(({ candidato }) => candidato.id === historicoIngressoSelecionadoId)
    : undefined;
  const situacaoHistoricoSelecionado = historicoIngressoSelecionadoId
    ? getSituacaoCandidatoIngresso(historicoIngressoSelecionadoId)
    : undefined;
  const situacaoHistoricoBadge = situacaoHistoricoSelecionado
    ? getSituacaoIngressoBadge(situacaoHistoricoSelecionado)
    : undefined;
  const historicoEtapasSelecionadas = historicoIngressoSelecionadoId
    ? getHistoricoCandidatoIngresso(historicoIngressoSelecionadoId)
    : [];

  const limparFiltros = () =>
    reset({
      concursoProcessoSeletivo: "",
    });
  const getFiltroAccordionIngresso = (accordionId: string) =>
    filtrosAccordionIngresso[accordionId] ?? { nome: "", situacao: "" };
  const atualizarFiltroAccordionIngresso = (
    accordionId: string,
    campo: "nome" | "situacao",
    valor: string,
  ) =>
    setFiltrosAccordionIngresso((current) => ({
      ...current,
      [accordionId]: {
        ...getFiltroAccordionIngresso(accordionId),
        [campo]: valor,
      } as { nome: string; situacao: IngressoSituacao | "" },
    }));
  const limparFiltroAccordionIngresso = (accordionId: string) =>
    setFiltrosAccordionIngresso((current) => ({
      ...current,
      [accordionId]: { nome: "", situacao: "" },
    }));
  const getCandidatosFiltradosAccordion = (accordionId: string, candidatos: IngressoCandidatoRow[]) => {
    const filtro = getFiltroAccordionIngresso(accordionId);
    const nomeBusca = filtro.nome.trim().toLowerCase();

    return candidatos.filter((candidato) => {
      const atendeNome = !nomeBusca || candidato.nome.toLowerCase().includes(nomeBusca);
      const atendeSituacao = !filtro.situacao || getSituacaoCandidatoIngresso(candidato.id) === filtro.situacao;

      return atendeNome && atendeSituacao;
    });
  };

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag title="Gestão de Ingresso" cols="12" cardHeaderClassNames="prototype-ingressos-card">
          <section className="prototype-ingressos-dashboard">
            <div className="prototype-ingressos-dashboard-grid">
              {situacoesDashboard.map((situacao) => {
                const badge = getSituacaoIngressoBadge(situacao);

                return (
                  <div
                    key={situacao}
                    className="prototype-ingressos-dashboard-card"
                    style={{
                      "--dashboard-card-bg": badge.bg,
                      "--dashboard-card-color": badge.color,
                    } as React.CSSProperties}
                    title={badge.descricao}
                  >
                    <span>{situacao}</span>
                    <strong>{totalIngressosPorSituacao[situacao]}</strong>
                  </div>
                );
              })}
            </div>
          </section>


          <div className="prototype-category-filters prototype-ingressos-filters grid">
            <TextFieldSeplag
              name="concursoProcessoSeletivo"
              control={control}
              label="Concurso/Processo Seletivo"
              cols="12 12 3"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-3">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={limparFiltros}
              />
            </div>
          </div>

          <div className="prototype-ingressos-accordion-list">
            {isPerfilIngressosProvimento ? (
              <div className="prototype-ingressos-list-header">
                <BotaoSeplag
                  type="button"
                  label="Novo Ingresso"
                  icon="pi pi-plus"
                  tooltip="Novo Ingresso"
                  onClick={() => navigate("/prototipos/sigep/ingressos/novo")}
                />
              </div>
            ) : null}

            {concursosProcessosFiltrados.map((concursoProcesso, index) => (
              <details
                key={concursoProcesso.id}
                className="prototype-ingresso-accordion"
                open={index === 0}
              >
                <summary className="prototype-ingresso-accordion-summary">
                  <div>
                    <strong>{concursoProcesso.titulo}</strong>
                    <span>
                      {concursoProcesso.tipo} • {concursoProcesso.orgao} • {concursoProcesso.edital}
                    </span>
                  </div>
                  <BadgeSeplag
                    label={getResumoCandidatosConcursoProcesso(concursoProcesso.candidatos)}
                    color="#005494"
                    bg="#e6f0f8"
                    border="transparent"
                    size="md"
                  />
                  <i className="pi pi-chevron-right prototype-ingresso-accordion-chevron" aria-hidden="true" />
                </summary>

                <div className="prototype-ingresso-accordion-content">

                  <div className="prototype-ingresso-vaga-accordion-list">
                    {agruparCandidatosIngressoPorVaga(concursoProcesso.candidatos).map((grupo, grupoIndex) => {
                      const candidatosFiltradosGrupo = getCandidatosFiltradosAccordion(grupo.id, grupo.candidatos);
                      const classificacaoBadge = getTipoVagaIngressoBadge(grupo.classificacao);

                      return (
                        <details
                          key={grupo.id}
                          className="prototype-ingresso-vaga-accordion"
                          open={grupoIndex === 0}
                        >
                          <summary className="prototype-ingresso-vaga-accordion-summary">
                            <div>
                              <strong>{grupo.vagaEspecialidade}</strong>
                              <span>Perfil/Especialidade: {grupo.perfilEspecialidade}</span>
                              <span>Polo: {grupo.polo}</span>
                            </div>
                            <div className="prototype-ingresso-vaga-summary-meta">
                              <BadgeSeplag
                                label={`Classificação: ${grupo.classificacao}`}
                                color={classificacaoBadge.color}
                                bg={classificacaoBadge.bg}
                                border="transparent"
                                size="md"
                              />
                              <BadgeSeplag
                                label={`${candidatosFiltradosGrupo.length} nomeado(s)`}
                                color="#005494"
                                bg="#e6f0f8"
                                border="transparent"
                                size="md"
                              />
                              <i className="pi pi-chevron-right prototype-ingresso-accordion-chevron" aria-hidden="true" />
                            </div>
                          </summary>

                          <div className="prototype-ingresso-vaga-accordion-content">
                            <div className="prototype-ingresso-accordion-filters prototype-ingresso-vaga-filters">
                              <label>
                                <span>Nome</span>
                                <input
                                  type="text"
                                  value={getFiltroAccordionIngresso(grupo.id).nome}
                                  onChange={(event) =>
                                    atualizarFiltroAccordionIngresso(grupo.id, "nome", event.target.value)
                                  }
                                  placeholder="Buscar por nome"
                                />
                              </label>
                              <label>
                                <span>Situação</span>
                                <select
                                  value={getFiltroAccordionIngresso(grupo.id).situacao}
                                  onChange={(event) =>
                                    atualizarFiltroAccordionIngresso(grupo.id, "situacao", event.target.value)
                                  }
                                >
                                  <option value="">Todas</option>
                                  {situacoesDashboard.map((situacao) => (
                                    <option key={situacao} value={situacao}>
                                      {situacao}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <button
                                type="button"
                                className="prototype-ingresso-accordion-clear"
                                onClick={() => limparFiltroAccordionIngresso(grupo.id)}
                              >
                                <i className="pi pi-refresh" aria-hidden="true" />
                                Limpar
                              </button>
                            </div>
                            <table className="prototype-simple-table prototype-ingresso-candidatos-table">
                              <thead>
                                <tr>
                                  <th>Classificação</th>
                                  <th>Nome</th>
                                  <th>Cargo</th>
                                  <th>Órgão</th>
                                  <th>Tipo da Vaga</th>
                                  <th>Posse Agendada</th>
                                  <th>Limite da Posse</th>
                                  <th>Limite Efetivo Exercício</th>
                                  <th>Data do Efetivo Exercício</th>
                                  <th>Situação</th>
                                  <th>Ações</th>
                                </tr>
                              </thead>
                              <tbody>
                                {candidatosFiltradosGrupo.length === 0 ? (
                                  <tr>
                                    <td colSpan={11} className="prototype-empty-table-cell">
                                      Nenhum registro encontrado para os filtros informados.
                                    </td>
                                  </tr>
                                ) : (
                                  candidatosFiltradosGrupo.map((candidato) => {
                                  const tipoVagaBadge = getTipoVagaIngressoBadge(candidato.tipoVaga);
                                  const situacaoCandidato = getSituacaoCandidatoIngresso(candidato.id);
                                  const podeIngressar = podeIngressarCandidato(situacaoCandidato);
                                  const podeAtuarEfetivoExercicio =
                                    podeAtuarEfetivoExercicioSetorial(situacaoCandidato);
                                  const parametrosAtuacaoIngresso = `candidato=${candidato.id}&tipo=${encodeURIComponent(
                                    concursoProcesso.tipo,
                                  )}&concurso=${encodeURIComponent(
                                    concursoProcesso.titulo,
                                  )}&orgao=${encodeURIComponent(
                                    concursoProcesso.orgao,
                                  )}&cargo=${encodeURIComponent(
                                    candidato.cargo,
                                  )}&classificacao=${encodeURIComponent(
                                    candidato.classificacao,
                                  )}&tipoVaga=${encodeURIComponent(candidato.tipoVaga)}`;

                                  return (
                                    <tr key={candidato.id}>
                                      <td>{candidato.classificacao}</td>
                                      <td>{candidato.nome}</td>
                                      <td>{candidato.cargo}</td>
                                      <td>{concursoProcesso.orgao}</td>
                                      <td>
                                        <BadgeSeplag
                                          label={candidato.tipoVaga}
                                          color={tipoVagaBadge.color}
                                          bg={tipoVagaBadge.bg}
                                          border="transparent"
                                          size="md"
                                        />
                                      </td>
                                      <td>{renderDataComIndicadorPrazo(candidato.dataPosse, situacaoCandidato !== "Ingresso Concluído" ? getAlertaPrazoPosse(candidato) : null)}</td>
                                      <td>{getLimitePosse(candidato)}</td>
                                      <td>{renderDataComIndicadorPrazo(getLimiteEfetivoExercicio(candidato), situacaoCandidato !== "Ingresso Concluído" ? getAlertaPrazoEfetivoExercicio(candidato) : null)}</td>
                                      <td>{situacaoCandidato === "Ingresso Concluído" ? getDataEfetivoExercicioCandidato(candidato) : "-"}</td>
                                      <td>
                                        {(() => {
                                          const situacao = situacaoCandidato;
                                          const badge = getSituacaoIngressoBadge(situacao);

                                          return (
                                            <span title={badge.descricao}>
                                              <BadgeSeplag
                                                label={situacao}
                                                color={badge.color}
                                                bg={badge.bg}
                                                border="transparent"
                                                size="md"
                                              />
                                            </span>
                                          );
                                        })()}
                                      </td>
                                      <td>
                                        <div className="prototype-ingresso-candidato-actions">
                                          <div className="prototype-ingresso-actions-dropdown">
                                            <div className="prototype-ingresso-actions-trigger" role="group" aria-label="Ações do ingresso">
                                              <button
                                                type="button"
                                                className="prototype-ingresso-actions-eye"
                                                title="Visualizar"
                                                aria-label="Visualizar"
                                                onClick={() => navigate(`/prototipos/sigep/ingressos/${candidato.id}`)}
                                              >
                                                <i className="pi pi-eye" aria-hidden="true" />
                                              </button>
                                              <button
                                                type="button"
                                                className="prototype-ingresso-actions-arrow"
                                                title="Mais ações"
                                                aria-label="Mais ações"
                                                aria-expanded={acoesIngressoMenuAbertoId === candidato.id}
                                                onClick={() =>
                                                  setAcoesIngressoMenuAbertoId((current) =>
                                                    current === candidato.id ? null : candidato.id,
                                                  )
                                                }
                                              >
                                                <i className="pi pi-chevron-down" aria-hidden="true" />
                                              </button>
                                            </div>

                                            {acoesIngressoMenuAbertoId === candidato.id ? (
                                              <div className="prototype-ingresso-actions-menu" role="menu">
                                                {podeIngressar ? (
                                                  <button
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={() => {
                                                      setAcoesIngressoMenuAbertoId(null);
                                                      navigate(`/prototipos/sigep/ingressos/novo?${parametrosAtuacaoIngresso}&etapa=${getEtapaInicialProvimento(situacaoCandidato)}`);
                                                    }}
                                                  >
                                                    <i className="pi pi-sign-in" aria-hidden="true" />
                                                    <span>Ingressar</span>
                                                  </button>
                                                ) : null}
                                                {podeAtuarEfetivoExercicio ? (
                                                  <button
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={() => {
                                                      setAcoesIngressoMenuAbertoId(null);
                                                      navigate(`/prototipos/sigep/ingressos/novo?${parametrosAtuacaoIngresso}&perfil=setorial`);
                                                    }}
                                                  >
                                                    <i className="pi pi-briefcase" aria-hidden="true" />
                                                    <span>Atuar efetivo exercício</span>
                                                  </button>
                                                ) : null}
                                                <button
                                                  type="button"
                                                  role="menuitem"
                                                  onClick={() => {
                                                    setAcoesIngressoMenuAbertoId(null);
                                                    setHistoricoIngressoSelecionadoId(candidato.id);
                                                  }}
                                                >
                                                  <i className="pi pi-history" aria-hidden="true" />
                                                  <span>Histórico</span>
                                                </button>
                                                {exibirPastaFuncionalServidor(situacaoCandidato) ? (
                                                  <button
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={() => {
                                                      setAcoesIngressoMenuAbertoId(null);
                                                      navigate(`/prototipos/sigep/ingressos/${candidato.id}/pasta-funcional`);
                                                    }}
                                                  >
                                                    <i className="pi pi-folder" aria-hidden="true" />
                                                    <span>Pasta funcional do servidor</span>
                                                  </button>
                                                ) : null}
                                              </div>
                                            ) : null}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </div>
              </details>
            ))}
          </div>

          <ModalSeplag
            visible={Boolean(historicoIngressoSelecionadoId)}
            titulo="Histórico do Ingresso"
            fechar={() => setHistoricoIngressoSelecionadoId(null)}
            tamanho="920px"
            hideFooter
          >
            {ingressoHistoricoSelecionado &&
            candidatoHistoricoSelecionado &&
            situacaoHistoricoSelecionado &&
            situacaoHistoricoBadge ? (
              <div className="col-12 prototype-ingresso-historico-modal">
                <div className="prototype-ingresso-historico-panel">
                  <div className="prototype-ingresso-historico-header">
                    <div>
                      <strong>{getNumeroIngresso(ingressoHistoricoSelecionado.id)}</strong>
                    </div>
                    <BadgeSeplag
                      label={situacaoHistoricoSelecionado}
                      color={situacaoHistoricoBadge.color}
                      bg={situacaoHistoricoBadge.bg}
                      border="transparent"
                      size="md"
                    />
                  </div>

                  <div className="prototype-ingresso-historico-context">
                    <div>
                      <span>Candidato</span>
                      <strong>{candidatoHistoricoSelecionado.candidato.nome}</strong>
                    </div>
                    <div>
                      <span>Concurso/Processo</span>
                      <strong>{candidatoHistoricoSelecionado.concursoProcesso.titulo}</strong>
                    </div>
                    <div>
                      <span>Órgão</span>
                      <strong>{candidatoHistoricoSelecionado.concursoProcesso.orgao}</strong>
                    </div>
                    <div>
                      <span>Cargo</span>
                      <strong>{candidatoHistoricoSelecionado.candidato.cargo}</strong>
                    </div>
                  </div>

                  <ol className="prototype-ingresso-historico-timeline">
                    {historicoEtapasSelecionadas.map((historico) => {

                      return (
                        <li key={historico.id} className="prototype-ingresso-historico-timeline-item">
                          <span className="prototype-ingresso-historico-timeline-marker" aria-hidden="true" />
                          <div className="prototype-ingresso-historico-timeline-card">
                            <div className="prototype-ingresso-historico-timeline-title">
                              <strong>{historico.etapa}</strong>

                            </div>
                            <dl className="prototype-ingresso-historico-timeline-meta">
                              <div>
                                <dt>Data/Hora</dt>
                                <dd>{historico.dataHora}</dd>
                              </div>
                              <div>
                                <dt>Operador</dt>
                                <dd>{historico.operador}</dd>
                              </div>
                              {historico.parecer ? (
                                <div>
                                  <dt>Parecer</dt>
                                  <dd>{historico.parecer}</dd>
                                </div>
                              ) : null}
                              {historico.observacao ? (
                                <div className="prototype-ingresso-historico-timeline-note">
                                  <dt>Observação</dt>
                                  <dd>{historico.observacao}</dd>
                                </div>
                              ) : null}
                            </dl>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            ) : null}
          </ModalSeplag>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposNovoIngressoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const candidatoParam = searchParams.get("candidato");
  const ingressoOrigemLista = Boolean(candidatoParam);
  const ingressoOrigemDados = candidatoParam
    ? ingressosMock.find((ingresso) => String(ingresso.id) === candidatoParam)
    : undefined;
  const tipoParam = searchParams.get("tipo");
  const tipoInicial: IngressoTipo | "" =
    tipoParam && tipoParam in ingressoTipoVinculoMap
      ? (tipoParam as IngressoTipo)
      : ingressoOrigemDados?.tipoIngresso ?? "";
  const concursoInicial = searchParams.get("concurso") ?? "";
  const orgaoInicial = searchParams.get("orgao") ?? ingressoOrigemDados?.orgao ?? "";
  const cargoInicial = searchParams.get("cargo") ?? ingressoOrigemDados?.cargo ?? "";
  const classificacaoInicial = searchParams.get("classificacao") ?? "";
  const tipoVagaInicial = searchParams.get("tipoVaga") ?? "AC";
  const perfilParam = searchParams.get("perfil");
  const perfilNovoIngresso: IngressoPerfil = perfilParam === "setorial" ? "SETORIAL" : "PROVIMENTO";
  const situacoesIngressosSalvasNovo = JSON.parse(
    localStorage.getItem("prototype-ingresso-situacoes") ?? "{}",
  ) as Partial<Record<string, IngressoSituacao>>;
  const situacaoInicialIngresso: IngressoSituacao = candidatoParam
    ? situacoesIngressosSalvasNovo[candidatoParam] ?? ingressoOrigemDados?.situacao ?? "Aguardando Analise"
    : "Aguardando Analise";
  const etapaParam = searchParams.get("etapa");
  const etapaInicialParam: NovoIngressoTab | null =
    etapaParam === "tipo-ingresso" ||
    etapaParam === "documentacao" ||
    etapaParam === "analise-provimento" ||
    etapaParam === "efetivo-exercicio"
      ? etapaParam
      : null;
  const nascimentoInicial =
    pessoasFisicasIngressoMock.find((pessoa) => pessoa.cpf === ingressoOrigemDados?.cpf)
      ?.dataNascimento ?? "";
  const [tipoIngresso, setTipoIngresso] = useState<IngressoTipo | "">(tipoInicial);
  const [activeTab, setActiveTab] = useState<NovoIngressoTab>(
    perfilNovoIngresso === "SETORIAL"
      ? "efetivo-exercicio"
      : etapaInicialParam ?? "tipo-ingresso",
  );
  const [candidatoCpf, setCandidatoCpf] = useState(ingressoOrigemDados?.cpf ?? "");
  const [candidatoNome, setCandidatoNome] = useState(ingressoOrigemDados?.nome ?? "");
  const [candidatoNascimento, setCandidatoNascimento] = useState(nascimentoInicial);
  const [concursoSelecionado, setConcursoSelecionado] = useState(concursoInicial);
  const [orgaoSelecionado, setOrgaoSelecionado] = useState(orgaoInicial);
  const [orgaosIngressoSelecionados, setOrgaosIngressoSelecionados] = useState<string[]>(orgaoInicial ? [orgaoInicial] : []);
  const [orgaosIngressoDropdownAberto, setOrgaosIngressoDropdownAberto] = useState(false);
  const [orgaosEfetivoSelecionados, setOrgaosEfetivoSelecionados] = useState<string[]>(orgaoInicial ? [orgaoInicial] : ["SEPLAG"]);
  const [orgaosEfetivoDropdownAberto, setOrgaosEfetivoDropdownAberto] = useState(false);
  const [cargoSelecionado, setCargoSelecionado] = useState(cargoInicial);
  const [classificacaoSelecionada, setClassificacaoSelecionada] = useState(classificacaoInicial);
  const [tipoVagaSelecionada, setTipoVagaSelecionada] = useState(tipoVagaInicial);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Servidor Público");
  const [regimeJuridicoSelecionado, setRegimeJuridicoSelecionado] = useState("Estatutário");
  const [perfilEspecialidade, setPerfilEspecialidade] = useState("Perfil geral");
  const [dataNomeacao, setDataNomeacao] = useState("2026-07-10");
  const [dataPosseIngresso, setDataPosseIngresso] = useState("");
  const [decisaoJudicial, setDecisaoJudicial] = useState<"Não" | "Sim">("Não");
  const [tipoAcaoJudicial, setTipoAcaoJudicial] = useState("");
  const [numeroProcessoJudicial, setNumeroProcessoJudicial] = useState("");
  const [documentacaoEtapa, setDocumentacaoEtapa] = useState<"analise" | "termos" | "setorial">("analise");
  const [situacaoIngresso, setSituacaoIngresso] = useState<IngressoSituacao>(situacaoInicialIngresso);
  const [documentosAnaliseValidados, setDocumentosAnaliseValidados] = useState<Record<string, boolean>>({});
  const [parecerProvimento, setParecerProvimento] = useState<"aprovar" | "suspender" | "negar" | "sem-efeito">("aprovar");
  const [analiseProvimentoAberta, setAnaliseProvimentoAberta] = useState(true);
  const [parecerProvimentoAberto, setParecerProvimentoAberto] = useState(true);
  const [documentosSuspensaoSelecionados, setDocumentosSuspensaoSelecionados] = useState<string[]>([]);
  const [documentosSuspensaoDropdownAberto, setDocumentosSuspensaoDropdownAberto] = useState(false);
  const [prazoPosseSuspenso, setPrazoPosseSuspenso] = useState(false);
  const [termoSuspensaoGerado, setTermoSuspensaoGerado] = useState(false);
  const [documentosAprovacaoGerados, setDocumentosAprovacaoGerados] = useState(false);
  const [termoNegativaGerado, setTermoNegativaGerado] = useState(false);
  const [termoSemEfeitoGerado, setTermoSemEfeitoGerado] = useState(false);
  const [motivoSemEfeito, setMotivoSemEfeito] = useState("nao-comparecimento");
  const [justificativaSemEfeito, setJustificativaSemEfeito] = useState("");
  const [dataPosse, setDataPosse] = useState("");
  const [dataEfetivoExercicio, setDataEfetivoExercicio] = useState("");
  const [dataFimEfetivoExercicio, setDataFimEfetivoExercicio] = useState("");
  const [servidorCompareceu, setServidorCompareceu] = useState<"Sim" | "Não">("Sim");
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [modalComplementacaoAberto, setModalComplementacaoAberto] = useState(false);
  const [modalNegarPosseAberto, setModalNegarPosseAberto] = useState(false);
  const parseDataIsoLocal = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };
  const adicionarDias = (date: Date, days: number) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
  };
  const dataPosseEfetivoIso = dataPosse || "2026-07-13";
  const dataPosseEfetivo = parseDataIsoLocal(dataPosseEfetivoIso);
  const prazoFinalEfetivo = dataPosseEfetivo ? adicionarDias(dataPosseEfetivo, 15) : null;
  const hojeEfetivo = new Date();
  hojeEfetivo.setHours(0, 0, 0, 0);
  const diasRestantesEfetivo = prazoFinalEfetivo
    ? Math.ceil((prazoFinalEfetivo.getTime() - hojeEfetivo.getTime()) / 86400000)
    : null;
  const statusEfetivoExercicio =
    diasRestantesEfetivo === null
      ? "Aguardando posse"
      : diasRestantesEfetivo < 0
        ? "Prazo vencido"
        : diasRestantesEfetivo === 0
          ? "Vence hoje"
          : "Dentro do prazo";
  const statusEfetivoExercicioClassName =
    diasRestantesEfetivo !== null && diasRestantesEfetivo < 0
      ? "prototype-prazo-posse-status prototype-prazo-posse-status--vencido"
      : diasRestantesEfetivo === 0
        ? "prototype-prazo-posse-status prototype-prazo-posse-status--atencao"
        : "prototype-prazo-posse-status";
  const tipoVinculo = tipoIngresso ? ingressoTipoVinculoMap[tipoIngresso] : "";
  const fluxoNovoIngressoTabs =
    tipoIngresso === "Concurso" ? novoIngressoConcursoSteps : novoIngressoTabs;
  const isPerfilSetorial = perfilNovoIngresso === "SETORIAL";
  const isEtapaEfetivoExercicio = activeTab === "efetivo-exercicio";
  const isEtapaSomenteLeituraSetorial = isPerfilSetorial && !isEtapaEfetivoExercicio;
  const cpfNormalizado = candidatoCpf.replace(/\D/g, "");
  const pessoaFisicaEncontrada = pessoasFisicasIngressoMock.find(
    (pessoa) => pessoa.cpf.replace(/\D/g, "") === cpfNormalizado,
  );
  const activeTabIndex = fluxoNovoIngressoTabs.findIndex((tab) => tab.value === activeTab);
  const isFirstTab = activeTabIndex <= 0;
  const isLastTab = activeTabIndex === fluxoNovoIngressoTabs.length - 1;
  const exibirResumoIngresso = activeTabIndex > 0;
  const resumoIngressoNome = candidatoNome || pessoaFisicaEncontrada?.nome || "João Silva";
  const resumoIngressoCpf = candidatoCpf || pessoaFisicaEncontrada?.cpf || "000.000.000-00";
  const documentosObrigatoriosIngresso = ingressoDocumentacaoObrigatoriaMock;
  const documentosAnexadosAnalise = documentosObrigatoriosIngresso;
  const todosDocumentosValidados =
    documentosObrigatoriosIngresso.length > 0 &&
    documentosObrigatoriosIngresso.every((documento) => documento.situacao === "Validado");
  const confirmarActionLabel =
    isPerfilSetorial && isEtapaEfetivoExercicio
      ? "Concluir"
      : activeTab === "documentacao" && documentacaoEtapa === "analise"
        ? "Enviar para Análise"
        : activeTab === "analise-provimento"
          ? "Finalizar Análise"
        : "Confirmar";
  const confirmarActionIcon =
    (activeTab === "documentacao" && documentacaoEtapa === "analise") ||
    activeTab === "analise-provimento"
      ? "pi pi-send"
      : undefined;
  const processoOrigemLabel =
    tipoIngresso === "Processo Seletivo" ? "Processo Seletivo" : "Concurso";
  const processoOrigemOptions =
    tipoIngresso === "Processo Seletivo"
      ? ["Processo Seletivo SES 2026", "Processo Seletivo SEDUC 2026", "Processo Seletivo SEFAZ 2026"]
      : ["Concurso SES 2026", "Concurso SEDUC 2026", "Concurso SEFAZ 2026"];
  const quantidadeVagas =
    concursoSelecionado && cargoSelecionado
      ? cargoSelecionado === "Professor"
        ? "40"
        : cargoSelecionado === "Gestor Governamental"
          ? "12"
          : "25"
      : "";
  const isDocumentoAnaliseValidado = (documento: string) =>
    documentosAnaliseValidados[documento] ?? true;
  const todosDocumentosAnaliseMarcados =
    documentosAnexadosAnalise.length > 0 &&
    documentosAnexadosAnalise.every((documento) =>
      isDocumentoAnaliseValidado(documento.documento),
    );
  const marcarTodosDocumentosAnalise = (checked: boolean) => {
    setDocumentosAnaliseValidados(
      Object.fromEntries(
        documentosAnexadosAnalise.map((documento) => [documento.documento, checked]),
      ),
    );
  };
  const toggleDocumentoSuspensao = (documento: string) => {
    setDocumentosSuspensaoSelecionados((documentosAtuais) =>
      documentosAtuais.includes(documento)
        ? documentosAtuais.filter((item) => item !== documento)
        : [...documentosAtuais, documento],
    );
  };
  const orgaosEstadoOptions = estruturaOrganizacionalNiveis
    .find((nivel) => nivel.id === "orgaos")
    ?.itens.map((orgao) => ({ label: orgao.nome, value: orgao.id })) ?? [];
  const orgaosIngressoOptions = ["SEPLAG", "SES", "SEDUC", "SEFAZ"];
  const orgaosIngressoResumo =
    orgaosIngressoSelecionados.length === 0
      ? "Selecione..."
      : orgaosIngressoSelecionados.length <= 2
        ? orgaosIngressoSelecionados.join(", ")
        : `${orgaosIngressoSelecionados.length} órgãos selecionados`;
  const toggleOrgaoIngresso = (orgao: string) => {
    setOrgaosIngressoSelecionados((orgaosAtuais) =>
      orgaosAtuais.includes(orgao)
        ? orgaosAtuais.filter((item) => item !== orgao)
        : [...orgaosAtuais, orgao],
    );
  };
  const orgaosEfetivoOptions = ["SEPLAG", "SES", "SEDUC", "SEFAZ"];
  const orgaosEfetivoResumo =
    orgaosEfetivoSelecionados.length === 0
      ? "Selecione..."
      : orgaosEfetivoSelecionados.length <= 2
        ? orgaosEfetivoSelecionados.join(", ")
        : `${orgaosEfetivoSelecionados.length} órgãos selecionados`;
  const toggleOrgaoEfetivo = (orgao: string) => {
    setOrgaosEfetivoSelecionados((orgaosAtuais) =>
      orgaosAtuais.includes(orgao)
        ? orgaosAtuais.filter((item) => item !== orgao)
        : [...orgaosAtuais, orgao],
    );
  };
  const documentosSuspensaoResumo =
    documentosSuspensaoSelecionados.length === 0
      ? "Selecione..."
      : documentosSuspensaoSelecionados.length === 1
        ? documentosSuspensaoSelecionados[0]
        : `${documentosSuspensaoSelecionados.length} documentos selecionados`;
  const parecerProvimentoSalvo =
    (parecerProvimento === "aprovar" && documentosAprovacaoGerados) ||
    (parecerProvimento === "suspender" && termoSuspensaoGerado) ||
    (parecerProvimento === "negar" && termoNegativaGerado) ||
    (parecerProvimento === "sem-efeito" && termoSemEfeitoGerado);
  const confirmarActionDisabled =
    isEtapaSomenteLeituraSetorial ||
    (activeTab === "tipo-ingresso" && !tipoIngresso) ||
    (activeTab === "analise-provimento" && !parecerProvimentoSalvo);
  const justificativaSemEfeitoObrigatoria =
    parecerProvimento === "sem-efeito" &&
    motivoSemEfeito === "outros" &&
    !justificativaSemEfeito.trim();
  const getSituacaoFinalAnaliseProvimento = (): IngressoSituacao => {
    if (parecerProvimento === "aprovar") return "Aguardando Efetivo Exercicio";
    if (parecerProvimento === "suspender") return "Posse Suspensa";
    if (parecerProvimento === "negar") return "Posse Negada";
    return "Tornado sem efeito";
  };
  const persistirSituacaoIngressoAtual = (situacao: IngressoSituacao) => {
    if (!candidatoParam) return;

    const situacoesSalvas = JSON.parse(
      localStorage.getItem("prototype-ingresso-situacoes") ?? "{}",
    ) as Record<string, IngressoSituacao>;
    localStorage.setItem(
      "prototype-ingresso-situacoes",
      JSON.stringify({
        ...situacoesSalvas,
        [candidatoParam]: situacao,
      }),
    );
  };
  const getDataAtualIso = () => {
    const hoje = new Date();
    const year = hoje.getFullYear();
    const month = String(hoje.getMonth() + 1).padStart(2, "0");
    const day = String(hoje.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const formatarDataIsoParaPtBr = (value: string) => {
    const data = parseDataIsoLocal(value);
    return data ? formatarDataPtBr(data) : value;
  };
  const persistirDataEfetivoExercicioAtual = (dataIso: string) => {
    if (!candidatoParam) return;

    const datasSalvas = JSON.parse(
      localStorage.getItem("prototype-ingresso-datas-efetivo-exercicio") ?? "{}",
    ) as Record<string, string>;
    localStorage.setItem(
      "prototype-ingresso-datas-efetivo-exercicio",
      JSON.stringify({
        ...datasSalvas,
        [candidatoParam]: formatarDataIsoParaPtBr(dataIso),
      }),
    );
  };
  const salvarParecerProvimento = () => {
    if (justificativaSemEfeitoObrigatoria) {
      return;
    }

    setPrazoPosseSuspenso(parecerProvimento === "suspender");
    setTermoSuspensaoGerado(parecerProvimento === "suspender");
    setDocumentosAprovacaoGerados(parecerProvimento === "aprovar");
    setTermoNegativaGerado(parecerProvimento === "negar");
    setTermoSemEfeitoGerado(parecerProvimento === "sem-efeito");
    if (parecerProvimento === "aprovar") {
      setSituacaoIngresso("Aguardando Efetivo Exercicio");
    }
    if (parecerProvimento === "suspender") {
      setSituacaoIngresso("Posse Suspensa");
    }
    if (parecerProvimento === "negar") {
      setSituacaoIngresso("Posse Negada");
    }
    if (parecerProvimento === "sem-efeito") {
      setSituacaoIngresso("Tornado sem efeito");
    }
  };
  const renderDocumentosGerados = (
    documentos: {
      nomeArquivo: string;
      modeloArquivo: string;
      arquivoEnviado?: string;
      tamanhoEnviado?: string;
    }[],
  ) => (
    <div className="prototype-documentos-gerados">
      <h4 className="prototype-documentos-gerados-title"><span className="prototype-novo-ingresso-panel-icon"><i className="pi pi-file" aria-hidden="true" /></span><span>Documentos Gerados</span></h4>
      <table className="prototype-simple-table prototype-documentos-gerados-table">
        <thead>
          <tr>
            <th>Nome do Arquivo</th>
            <th>Nome do arquivo enviado</th>
            <th>Tamanho enviado</th>
            <th>Modelo do arquivo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {documentos.map((documento) => (
            <tr key={documento.nomeArquivo}>
              <td>{documento.nomeArquivo}</td>
              <td>{documento.arquivoEnviado ?? "-"}</td>
              <td>{documento.tamanhoEnviado ?? "-"}</td>
              <td>
                <div className="prototype-documentos-gerados-actions">
                  <BotaoIconSeplag
                    type="button"
                    icon="pi pi-download"
                    tooltip={`Baixar modelo ${documento.modeloArquivo}`}
                  />
                </div>
              </td>
              <td>
                <div className="prototype-documentos-gerados-actions">
                  <BotaoIconSeplag
                    type="button"
                    icon="pi pi-cloud-upload"
                    tooltip={`Enviar ${documento.nomeArquivo}`}
                  />
                  <BotaoIconSeplag
                    type="button"
                    icon="pi pi-eye"
                    tooltip={`Visualizar ${documento.nomeArquivo}`}
                  />
                  <BotaoIconSeplag
                    type="button"
                    icon="pi pi-times"
                    tooltip={`Excluir ${documento.nomeArquivo}`}
                    severity="danger"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="prototype-documentos-gerados-hint">
        Formato aceito: <strong>.PDF, .DOC, .DOCX</strong> | Tamanho máximo: <strong>2 MB</strong> por arquivo | Máx. <strong>10 arquivos</strong>
      </p>
    </div>
  );

  const goBack = () => {
    if (isFirstTab || activeTab === "efetivo-exercicio") {
      navigate("/prototipos/sigep/ingressos");
      return;
    }

    setActiveTab(fluxoNovoIngressoTabs[activeTabIndex - 1].value!);
  };

  const goNext = () => {
    if (isLastTab) {
      navigate(
        `/prototipos/sigep/ingressos/importar?tipo=${encodeURIComponent(tipoIngresso)}`,
      );
      return;
    }

    setActiveTab(fluxoNovoIngressoTabs[activeTabIndex + 1].value!);
  };

  const confirmarNovoIngresso = () => {
    setModalConfirmacaoAberto(false);
    setSituacaoIngresso("Em analise");
    persistirSituacaoIngressoAtual("Em analise");
    goNext();
  };

  const handleConfirmarNovoIngresso = () => {
    if (isPerfilSetorial && activeTab === "efetivo-exercicio") {
      const dataConclusaoEfetivo = dataEfetivoExercicio || getDataAtualIso();
      const situacaoConclusaoEfetivo: IngressoSituacao =
        servidorCompareceu === "Não" ? "Tornado sem efeito" : "Ingresso Concluído";
      setDataEfetivoExercicio(dataConclusaoEfetivo);
      setSituacaoIngresso(situacaoConclusaoEfetivo);
      persistirSituacaoIngressoAtual(situacaoConclusaoEfetivo);
      if (situacaoConclusaoEfetivo === "Ingresso Concluído") {
        persistirDataEfetivoExercicioAtual(dataConclusaoEfetivo);
      }
      navigate("/prototipos/sigep/ingressos/efetivo-exercicio");
      return;
    }

    if (activeTab === "analise-provimento") {
      const situacaoFinalAnalise = getSituacaoFinalAnaliseProvimento();
      setSituacaoIngresso(situacaoFinalAnalise);
      persistirSituacaoIngressoAtual(situacaoFinalAnalise);
      navigate("/prototipos/sigep/ingressos");
      return;
    }

    if (activeTab !== "documentacao") {
      setModalConfirmacaoAberto(true);
      return;
    }

    if (documentacaoEtapa === "analise") {
      setSituacaoIngresso("Em analise");
      goNext();
      return;
    }

    if (documentacaoEtapa === "termos") {
      setDocumentacaoEtapa("setorial");
      return;
    }

    goNext();
  };

  const handleCpfCandidatoChange = (value: string) => {
    setCandidatoCpf(value);
    const cpfBusca = value.replace(/\D/g, "");
    const pessoa = pessoasFisicasIngressoMock.find(
      (item) => item.cpf.replace(/\D/g, "") === cpfBusca,
    );

    if (pessoa) {
      setCandidatoNome(pessoa.nome);
      setCandidatoNascimento(pessoa.dataNascimento);
      return;
    }

    setCandidatoNome("");
    setCandidatoNascimento("");
  };

  const renderDadosServidorIngresso = () => (
    <div className="prototype-novo-ingresso-dados-grid">
      <section className="prototype-ingresso-section prototype-novo-ingresso-panel prototype-novo-ingresso-candidato-section">
        <h3><span className="prototype-novo-ingresso-panel-icon"><i className="pi pi-user" aria-hidden="true" /></span><span>Dados do Servidor</span></h3>
        <div className="prototype-novo-ingresso-candidato-grid">
          <label className="prototype-ingresso-field">
            <span>CPF<em>*</em></span>
            <input
              value={candidatoCpf}
              placeholder="Digite o CPF ou Nome"
              readOnly={ingressoOrigemLista}
              onChange={(event) => handleCpfCandidatoChange(event.target.value)}
            />
            {!ingressoOrigemLista ? (
              <button
                type="button"
                className="prototype-cadastrar-pessoa-link"
                onClick={() =>
                  navigate(
                    `/prototipos/sigep/pessoa-fisica/novo?cpf=${encodeURIComponent(candidatoCpf)}`,
                  )
                }
              >
                Cadastrar Pessoa Física
              </button>
            ) : null}
          </label>
          <label className="prototype-ingresso-field">
            <span>Nome Completo<em>*</em></span>
            <input
              value={candidatoNome}
              readOnly={ingressoOrigemLista}
              onChange={(event) => setCandidatoNome(event.target.value)}
            />
          </label>
          <label className="prototype-ingresso-field">
            <span>Data de Nascimento<em>*</em></span>
            <input
              type="text"
              value={candidatoNascimento}
              readOnly={ingressoOrigemLista}
              onChange={(event) => setCandidatoNascimento(event.target.value)}
            />
          </label>
        </div>
      </section>
    </div>
  );

  const renderDadosIngresso = () => (
    <div className="prototype-novo-ingresso-dados-grid">
      <section className="prototype-ingresso-section prototype-novo-ingresso-panel prototype-novo-ingresso-dados-ingresso">
        <h3><span className="prototype-novo-ingresso-panel-icon"><i className="pi pi-id-card" aria-hidden="true" /></span><span>Dados do Ingresso</span></h3>
        <div className="prototype-ingresso-import-grid prototype-novo-ingresso-select-grid">
          <label className="prototype-ingresso-field">
            <span>Regime Jurídico<em>*</em></span>
            <select
              value={regimeJuridicoSelecionado}
              onChange={(event) => setRegimeJuridicoSelecionado(event.target.value)}
            >
              <option value="">Selecione...</option>
              <option value="Estatutário">Estatutário</option>
              <option value="Celetista">Celetista</option>
              <option value="Regime Especial">Regime Especial</option>
            </select>
          </label>
          <label className="prototype-ingresso-field">
            <span>Tipo de Vínculo<em>*</em></span>
            <input type="text" value={tipoVinculo} readOnly />
          </label>
          <div className="prototype-ingresso-field prototype-multiselect-field">
            <span>Órgão<em>*</em></span>
            <div className="prototype-multiselect">
              <button
                type="button"
                className="prototype-multiselect-trigger"
                onClick={() => setOrgaosIngressoDropdownAberto((dropdownAberto) => !dropdownAberto)}
                aria-expanded={orgaosIngressoDropdownAberto}
              >
                <span>{orgaosIngressoResumo}</span>
                <i className={`pi ${orgaosIngressoDropdownAberto ? "pi-chevron-up" : "pi-chevron-down"}`} />
              </button>
              {orgaosIngressoDropdownAberto ? (
                <div className="prototype-multiselect-panel">
                  {orgaosIngressoOptions.map((orgao) => (
                    <label key={orgao} className="prototype-multiselect-option">
                      <input
                        type="checkbox"
                        checked={orgaosIngressoSelecionados.includes(orgao)}
                        onChange={() => toggleOrgaoIngresso(orgao)}
                      />
                      <span>{orgao}</span>
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <label className="prototype-ingresso-field">
            <span>{processoOrigemLabel}<em>*</em></span>
            <select
              value={concursoSelecionado}
              disabled={ingressoOrigemLista}
              onChange={(event) => setConcursoSelecionado(event.target.value)}
            >
              <option value="">Selecione...</option>
              {processoOrigemOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="prototype-ingresso-field">
            <span>Categoria</span>
            <select
              value={categoriaSelecionada}
              onChange={(event) => setCategoriaSelecionada(event.target.value)}
            >
              <option value="">Selecione...</option>
              <option value="Servidor Público">Servidor Público</option>
              <option value="Profissional da Educação">Profissional da Educação</option>
              <option value="Profissional da Saúde">Profissional da Saúde</option>
              <option value="Gestor Governamental">Gestor Governamental</option>
              <option value="Temporário">Temporário</option>
            </select>
          </label>
          <label className="prototype-ingresso-field">
            <span>Cargo<em>*</em></span>
            <select
              value={cargoSelecionado}
              disabled={ingressoOrigemLista}
              onChange={(event) => setCargoSelecionado(event.target.value)}
            >
              <option value="">Selecione...</option>
              <option value="Analista Administrativo">Analista Administrativo</option>
              <option value="Professor">Professor</option>
              <option value="Gestor Governamental">Gestor Governamental</option>
              <option value="Técnico Administrativo Educacional">Técnico Administrativo Educacional</option>
              <option value="Enfermeiro">Enfermeiro</option>
              <option value="Técnico de Enfermagem">Técnico de Enfermagem</option>
              <option value="Analista Fazendário">Analista Fazendário</option>
            </select>
          </label>
          <label className="prototype-ingresso-field">
            <span>Perfil/Especialidade</span>
            <input
              type="text"
              value={perfilEspecialidade}
              onChange={(event) => setPerfilEspecialidade(event.target.value)}
            />
          </label>
          <label className="prototype-ingresso-field">
            <span>Classificação<em>*</em></span>
            <input
              type="text"
              value={classificacaoSelecionada}
              readOnly={ingressoOrigemLista}
              onChange={(event) => setClassificacaoSelecionada(event.target.value)}
            />
          </label>
          <label className="prototype-ingresso-field">
            <span>Tipo de vaga<em>*</em></span>
            <select
              value={tipoVagaSelecionada}
              disabled={ingressoOrigemLista}
              onChange={(event) => setTipoVagaSelecionada(event.target.value)}
            >
              <option value="AC">AC</option>
              <option value="PCD">PCD</option>
              <option value="PPP">PPP</option>
            </select>
          </label>
          <label className="prototype-ingresso-field">
            <span>Data da Nomeação<em>*</em></span>
            <input
              type="date"
              value={dataNomeacao}
              onChange={(event) => setDataNomeacao(event.target.value)}
            />
          </label>
          <label className="prototype-ingresso-field">
            <span>Data Agendada da Posse<em>*</em></span>
            <input
              type="date"
              value={dataPosseIngresso}
              onChange={(event) => setDataPosseIngresso(event.target.value)}
            />
          </label>
          <label className="prototype-ingresso-field">
            <span>Data Limite para Posse<em>*</em></span>
            <input type="text" value="30/07/2026" readOnly />
          </label>
          <label className="prototype-ingresso-field">
            <span>Decisão Judicial<em>*</em></span>
            <select
              value={decisaoJudicial}
              onChange={(event) =>
                setDecisaoJudicial(event.target.value as "Não" | "Sim")
              }
            >
              <option value="Não">Não</option>
              <option value="Sim">Sim</option>
            </select>
          </label>
          {decisaoJudicial === "Sim" ? (
            <>
              <label className="prototype-ingresso-field">
                <span>Tipo de Ação Judicial<em>*</em></span>
                <select
                  value={tipoAcaoJudicial}
                  onChange={(event) => setTipoAcaoJudicial(event.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="Coletivo">Coletivo</option>
                  <option value="Individual">Individual</option>
                </select>
              </label>
              <label className="prototype-ingresso-field">
                <span>N° Processo<em>*</em></span>
                <input
                  type="text"
                  value={numeroProcessoJudicial}
                  onChange={(event) => setNumeroProcessoJudicial(event.target.value)}
                />
              </label>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );

  const renderResumoIngressoBloqueado = () => (
    <section className="prototype-ingresso-readonly-block">
      <h3>Ingresso nº 2026/0001</h3>
      <div className="prototype-ingresso-readonly-grid">
        <p>
          <strong>Nome:</strong> {resumoIngressoNome}
        </p>
        <p>
          <strong>CPF:</strong> {resumoIngressoCpf}
        </p>
        <p>
          <strong>Ingresso:</strong> {tipoIngresso}
        </p>
        <p>
          <strong>Tipo de Vínculo:</strong> {tipoVinculo}
        </p>
        <p>
          <strong>Concurso:</strong> {concursoSelecionado || "-"}
        </p>
        <p>
          <strong>Categoria:</strong> {categoriaSelecionada || "-"}
        </p>
        <p>
          <strong>Cargo:</strong> {cargoSelecionado || "-"}
        </p>
        <p>
          <strong>Regime:</strong> {regimeJuridicoSelecionado || "-"}
        </p>
        <p>
          <strong>Decisão Judicial:</strong> {decisaoJudicial}
        </p>
        <p>
          <strong>Prazo para Posse:</strong> 30/07/2026
        </p>
        <p>
          <strong>Situação:</strong> {situacaoIngresso}
        </p>
      </div>
    </section>
  );

  const renderNovoIngressoStepper = () => {
    const etapaAtualLabel =
      fluxoNovoIngressoTabs[activeTabIndex]?.label ?? fluxoNovoIngressoTabs[0]?.label ?? "Ingresso";

    return (
      <div className="prototype-novo-ingresso-stepper-wrap">
        <div className="prototype-novo-ingresso-stepper" aria-label="Etapas do novo ingresso">
          {fluxoNovoIngressoTabs.map((step, index) => {
            const isActive = step.value === activeTab;
            const isCompleted = index < activeTabIndex;

            return (
              <button
                key={step.value}
                type="button"
                className={`prototype-novo-ingresso-step ${
                  isActive ? "is-active" : ""
                } ${isCompleted ? "is-completed" : ""}`}
                aria-current={isActive ? "step" : undefined}
                onClick={() => setActiveTab(step.value!)}
              >
                <span className="prototype-novo-ingresso-step-marker">
                  {isCompleted ? <i className="pi pi-check" aria-hidden="true" /> : index + 1}
                </span>
                <span className="prototype-novo-ingresso-step-label">{step.label}</span>
              </button>
            );
          })}
        </div>
        <div className="prototype-novo-ingresso-step-current" aria-live="polite">
          <strong>{Math.max(activeTabIndex + 1, 1)} de {fluxoNovoIngressoTabs.length}</strong>
          <span>
            Etapa Atual: <b>{etapaAtualLabel}</b>
          </span>
        </div>
      </div>
    );
  };
  const renderNovoIngressoTab = () => {
    if (activeTab === "tipo-ingresso") {
      return (
        <section className="prototype-ingresso-section prototype-novo-ingresso-section">
          {renderDadosServidorIngresso()}
          <section className="prototype-ingresso-section prototype-novo-ingresso-panel prototype-novo-ingresso-origem-section">
            <h3><span className="prototype-novo-ingresso-panel-icon"><i className="pi pi-share-alt" aria-hidden="true" /></span><span>Origem do Ingresso <span className="prototype-required-mark">*</span></span></h3>
            <div className="prototype-ingresso-type-grid">
            {ingressoTipoRadioOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={ingressoOrigemLista}
                className={`prototype-ingresso-type-card ${
                  tipoIngresso === option.value ? "is-selected" : ""
                } ${ingressoOrigemLista ? "is-locked" : ""}`}
                onClick={() => {
                  if (ingressoOrigemLista) return;
                  setTipoIngresso(tipoIngresso === option.value ? "" : option.value);
                  setConcursoSelecionado("");
                  setOrgaoSelecionado("");
                  setOrgaosIngressoSelecionados([]);
                  setCargoSelecionado("");
                  setClassificacaoSelecionada("");
                  setTipoVagaSelecionada("AC");
                  setActiveTab("tipo-ingresso");
                  setDocumentacaoEtapa("analise");
                }}
              >
                <strong>{option.label}</strong>
              </button>
            ))}
            </div>
          </section>
          {tipoIngresso ? renderDadosIngresso() : null}
        </section>
      );
    }

    if (activeTab === "documentacao") {
      if (documentacaoEtapa === "termos") {
        return (
          <section className="prototype-ingresso-section">
            <h3>Formalização da Posse</h3>
            <div className="prototype-ingresso-import-grid prototype-novo-ingresso-select-grid">
              <label className="prototype-ingresso-field">
                <span>Data para Posse<em>*</em></span>
                <input
                  type="date"
                  value={dataPosse}
                  onChange={(event) => setDataPosse(event.target.value)}
                />
              </label>
              <label className="prototype-ingresso-field">
                <span>Termo de Posse</span>
                <input type="text" value="termo_posse_2026_0001.pdf" readOnly />
              </label>
              <label className="prototype-ingresso-field">
                <span>Termo de Encaminhamento</span>
                <input type="text" value="termo_encaminhamento_2026_0001.pdf" readOnly />
              </label>
            </div>
            <div className="prototype-ingresso-generated-docs">
              <div>
                <strong>Termo de Posse gerado</strong>
                <span>Documento disponível para assinatura e conferência.</span>
                <BotaoIconSeplag type="button" icon="pi pi-download" tooltip="Baixar termo de posse" />
              </div>
              <div>
                <strong>Termo de Encaminhamento gerado</strong>
                <span>Encaminhar para atuação da setorial.</span>
                <BotaoIconSeplag type="button" icon="pi pi-download" tooltip="Baixar termo de encaminhamento" />
              </div>
            </div>
            <div className="prototype-form-actions prototype-form-actions--left">
              <BotaoSeplag
                type="button"
                label="Negar Posse"
                icon="pi pi-times"
                severity="danger"
                onClick={() => setModalNegarPosseAberto(true)}
              />
            </div>
          </section>
        );
      }

      if (documentacaoEtapa === "setorial") {
        return (
          <section className="prototype-ingresso-section">
            <h3>Termo de Encaminhamento - Atuação Setorial</h3>
            <div className="prototype-validation-panel prototype-validation-panel--info">
              O ingresso deve ser atuado pela setorial antes do registro de exercício.
            </div>
            <div className="prototype-ingresso-import-grid prototype-novo-ingresso-select-grid">
              <label className="prototype-ingresso-field">
                <span>Órgão<em>*</em></span>
                <select defaultValue="">
                  <option value="">Selecione...</option>
                  <option value="SES">SES</option>
                  <option value="SEDUC">SEDUC</option>
                  <option value="SEFAZ">SEFAZ</option>
                </select>
              </label>
              <label className="prototype-ingresso-field">
                <span>Setor/Lotação<em>*</em></span>
                <select defaultValue="">
                  <option value="">Selecione...</option>
                  <option value="Unidade Central">Unidade Central</option>
                  <option value="Coordenadoria de Pessoas">Coordenadoria de Pessoas</option>
                  <option value="Núcleo Administrativo">Núcleo Administrativo</option>
                </select>
              </label>
              <label className="prototype-ingresso-field">
                <span>Data da Atuação<em>*</em></span>
                <input type="date" />
              </label>
              <label className="prototype-ingresso-field">
                <span>Responsável Setorial</span>
                <input type="text" placeholder="Informe o responsável" />
              </label>
            </div>
          </section>
        );
      }

      return (
        <section className="prototype-ingresso-section">
          <h3>Documentação Obrigatória</h3>
          <table className="prototype-simple-table prototype-ingresso-doc-table prototype-ingresso-doc-table--obrigatoria">
            <thead>
              <tr>
                <th className="prototype-ingresso-doc-index-col"></th>
                <th>Documento</th>
                <th>Obrigatório</th>
                <th>Situação</th>
                <th>Arquivo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {documentosObrigatoriosIngresso.map((documento, index) => (
                <tr key={documento.documento}>
                  <td className="prototype-ingresso-doc-index-col">{index + 1}</td>
                  <td>{documento.documento}</td>
                  <td>
                    <span className="prototype-ingresso-doc-required">
                      {documento.obrigatorio}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`prototype-ingresso-doc-status ${getIngressoDocumentoStatusClass(
                        documento.situacao,
                      )}`}
                    >
                      {documento.situacao}
                    </span>
                  </td>
                  <td>{documento.arquivo}</td>
                  <td className="prototype-ingresso-doc-action-cell">
                    <div className="prototype-ingresso-doc-actions">
                      <BotaoIconSeplag
                        type="button"
                        className="prototype-ingresso-doc-action-button"
                        icon="pi pi-cloud-upload"
                        tooltip={`Enviar ${documento.documento}`}
                      />
                      <BotaoIconSeplag
                        type="button"
                        className="prototype-ingresso-doc-action-button"
                        icon="pi pi-download"
                        tooltip={
                          documento.arquivo === "-"
                            ? "Nenhum arquivo disponível para download"
                            : `Baixar ${documento.arquivo}`
                        }
                        disabled={documento.arquivo === "-"}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      );
    }

    if (activeTab === "analise-provimento") {
      return (
        <section className="prototype-ingresso-section">
          <div className="prototype-analise-provimento-layout">
            <div className="prototype-analise-provimento-main">
              <div className="prototype-analise-provimento-panel prototype-analise-provimento-panel--header-icon">
                <button
                  type="button"
                  className="prototype-recuar-section-header prototype-recuar-section-header--icon"
                  onClick={() => setAnaliseProvimentoAberta((aberta) => !aberta)}
                  aria-expanded={analiseProvimentoAberta}
                >
                  <span className="prototype-recuar-section-title"><span className="prototype-novo-ingresso-panel-icon"><i className="pi pi-file-check" aria-hidden="true" /></span><span>Análise de Documentos</span></span>
                  <i className={`pi ${analiseProvimentoAberta ? "pi-chevron-up" : "pi-chevron-down"}`} />
                </button>
                {analiseProvimentoAberta ? (
                <table className="prototype-simple-table prototype-analise-provimento-table">
                  <thead>
                    <tr>
                      <th>Documento</th>
                      <th>
                        <label className="prototype-analise-validacao-check prototype-analise-validacao-check--header">
                          <input
                            type="checkbox"
                            aria-label="Marcar todos os documentos como validados"
                            checked={todosDocumentosAnaliseMarcados}
                            onChange={(event) => marcarTodosDocumentosAnalise(event.target.checked)}
                          />
                          <span>Situação</span>
                        </label>
                      </th>
                      <th>Validação</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentosAnexadosAnalise.map((documento) => {
                      const documentoValidado = isDocumentoAnaliseValidado(documento.documento);

                      return (
                        <tr key={documento.documento}>
                          <td>
                            <span className="prototype-analise-documento-name">
                              {documento.documento}
                            </span>
                          </td>
                          <td>
                            <label className="prototype-analise-validacao-check">
                              <input
                                type="checkbox"
                                aria-label={`Marcar ${documento.documento} como validado`}
                                checked={documentoValidado}
                                onChange={(event) =>
                                  setDocumentosAnaliseValidados((atual) => ({
                                    ...atual,
                                    [documento.documento]: event.target.checked,
                                  }))
                                }
                              />
                              <span
                                className={`prototype-ingresso-doc-status ${
                                  documentoValidado
                                    ? "prototype-ingresso-doc-status--validado"
                                    : "prototype-ingresso-doc-status--pendente"
                                }`}
                              >
                                {documentoValidado ? "Validado" : "Pendente"}
                              </span>
                            </label>
                          </td>
                          <td>
                            {documentoValidado ? (
                              <>
                                <strong>10/07/2026</strong>
                                <span>Provimento</span>
                              </>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                          <td className="prototype-analise-documento-actions">
                            <BotaoIconSeplag
                              type="button"
                              className="prototype-analise-documento-view-button"
                              icon="pi pi-eye"
                              tooltip={`Visualizar ${documento.documento}`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                ) : null}
              </div>

              <div className="prototype-analise-provimento-panel prototype-parecer-provimento prototype-analise-provimento-panel--header-icon">
                <button
                  type="button"
                  className="prototype-recuar-section-header prototype-recuar-section-header--icon"
                  onClick={() => setParecerProvimentoAberto((aberto) => !aberto)}
                  aria-expanded={parecerProvimentoAberto}
                >
                  <span className="prototype-recuar-section-title"><span className="prototype-novo-ingresso-panel-icon"><i className="pi pi-clipboard" aria-hidden="true" /></span><span>Parecer do Provimento</span></span>
                  <i className={`pi ${parecerProvimentoAberto ? "pi-chevron-up" : "pi-chevron-down"}`} />
                </button>
                {parecerProvimentoAberto ? (
                <>
                <div className="prototype-parecer-radio-group">
                  <label>
                    <input
                      type="radio"
                      name="parecer-provimento"
                      checked={parecerProvimento === "aprovar"}
                      onChange={() => {
                        setParecerProvimento("aprovar");
                        setTermoSuspensaoGerado(false);
                        setDocumentosAprovacaoGerados(false);
                        setTermoNegativaGerado(false);
                        setTermoSemEfeitoGerado(false);
                        setMotivoSemEfeito("nao-comparecimento");
                        setJustificativaSemEfeito("");
                      }}
                    />
                    <span>Aprovar Posse</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="parecer-provimento"
                      checked={parecerProvimento === "suspender"}
                      onChange={() => {
                        setParecerProvimento("suspender");
                        setTermoSuspensaoGerado(false);
                        setDocumentosAprovacaoGerados(false);
                        setTermoNegativaGerado(false);
                        setTermoSemEfeitoGerado(false);
                        setMotivoSemEfeito("nao-comparecimento");
                        setJustificativaSemEfeito("");
                      }}
                    />
                    <span>Suspender Posse</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="parecer-provimento"
                      checked={parecerProvimento === "negar"}
                      onChange={() => {
                        setParecerProvimento("negar");
                        setTermoSuspensaoGerado(false);
                        setDocumentosAprovacaoGerados(false);
                        setTermoNegativaGerado(false);
                        setTermoSemEfeitoGerado(false);
                        setMotivoSemEfeito("nao-comparecimento");
                        setJustificativaSemEfeito("");
                      }}
                    />
                    <span>Negar Posse</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="parecer-provimento"
                      checked={parecerProvimento === "sem-efeito"}
                      onChange={() => {
                        setParecerProvimento("sem-efeito");
                        setTermoSuspensaoGerado(false);
                        setDocumentosAprovacaoGerados(false);
                        setTermoNegativaGerado(false);
                        setTermoSemEfeitoGerado(false);
                        setMotivoSemEfeito("nao-comparecimento");
                        setJustificativaSemEfeito("");
                      }}
                    />
                    <span>Tornar sem efeito</span>
                  </label>
                </div>

                {parecerProvimento === "aprovar" && !todosDocumentosAnaliseMarcados ? (
                  <div className="prototype-parecer-alerta" role="alert">
                    <i className="pi pi-exclamation-triangle" />
                    Todos os documentos devem ser validados para aprovar documentação.
                  </div>
                ) : null}

                {parecerProvimento === "aprovar" ? (
                  <div className="prototype-parecer-aprovacao">
                                        <label className="prototype-ingresso-field">
                      <span>Encaminhar para<em>*</em></span>
                      <select defaultValue="">
                        <option value="">Selecione...</option>
                        {orgaosEstadoOptions.map((orgao) => (
                          <option key={orgao.value} value={orgao.value}>{orgao.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="prototype-ingresso-field">
                      <span>Observação</span>
                      <textarea placeholder="Informe uma observação sobre a aprovação, se necessário." />
                    </label>
                  </div>
                ) : null}

                {parecerProvimento === "suspender" ? (
                  <div className="prototype-parecer-suspensao">
                    <p>
                      Informe o motivo da suspensão. O prazo de posse ficará pausado até a conclusão
                      da análise ou apresentação da documentação solicitada.
                    </p>
                    <div className="prototype-suspensao-prazo-grid">
                      <label className="prototype-ingresso-field">
                        <span>Motivo da suspensão<em>*</em></span>
                        <select defaultValue="">
                          <option value="">Selecione...</option>
                          <option value="autenticidade">Verificação de autenticidade de documento</option>
                          <option value="certidao-positiva">Certidão positiva apresentada</option>
                          <option value="documento-ilegivel">Documento ilegível</option>
                          <option value="incompativel-edital">Documento incompatível com o requisito do edital</option>
                          <option value="analise-juridica">Necessidade de análise jurídica</option>
                          <option value="documento-complementar">Solicitação de documento complementar</option>
                          <option value="outro">Outro</option>
                        </select>
                      </label>
                      <div className="prototype-ingresso-field prototype-multiselect-field">
                        <span>Documento relacionado<em>*</em></span>
                        <div className="prototype-multiselect">
                          <button
                            type="button"
                            className="prototype-multiselect-trigger"
                            onClick={() =>
                              setDocumentosSuspensaoDropdownAberto((dropdownAberto) => !dropdownAberto)
                            }
                            aria-expanded={documentosSuspensaoDropdownAberto}
                          >
                            <span>{documentosSuspensaoResumo}</span>
                            <i className={`pi ${documentosSuspensaoDropdownAberto ? "pi-chevron-up" : "pi-chevron-down"}`} />
                          </button>
                          {documentosSuspensaoDropdownAberto ? (
                            <div className="prototype-multiselect-panel">
                              {documentosObrigatoriosIngresso.map((documento) => (
                                <label key={documento.documento} className="prototype-multiselect-option">
                                  <input
                                    type="checkbox"
                                    checked={documentosSuspensaoSelecionados.includes(documento.documento)}
                                    onChange={() => toggleDocumentoSuspensao(documento.documento)}
                                  />
                                  <span>{documento.documento}</span>
                                </label>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <label className="prototype-ingresso-field">
                        <span>Data de início da suspensão<em>*</em></span>
                        <input type="date" />
                      </label>
                      <label className="prototype-ingresso-field">
                        <span>Prazo para resposta/complementação<em>*</em></span>
                        <input type="date" />
                      </label>
                      <label className="prototype-ingresso-field prototype-suspensao-prazo-full">
                        <span>Justificativa<em>*</em></span>
                        <textarea placeholder="Descreva a justificativa para suspensão do prazo." />
                      </label>
                    </div>
                  </div>
                ) : null}

                {parecerProvimento === "negar" ? (
                  <div className="prototype-parecer-negativa">
                    <p>
                      A negativa de posse impedirá a continuidade do ingresso deste candidato.
                      Após a confirmação, o Termo de Negativa de Posse será gerado e o processo
                      poderá seguir para tornar a nomeação sem efeito.
                    </p>
                    <div className="prototype-suspensao-prazo-grid">
                      <label className="prototype-ingresso-field">
                        <span>Motivo da negativa<em>*</em></span>
                        <select defaultValue="">
                          <option value="">Selecione...</option>
                          <option value="documento-obrigatorio">Não apresentou documento obrigatório</option>
                          <option value="documento-edital">Documento apresentado não atende ao edital</option>
                          <option value="laudo-inapto">Laudo médico inapto</option>
                          <option value="diploma-incompativel">Diploma incompatível com o cargo</option>
                          <option value="certidao-impeditiva">Certidão impeditiva</option>
                          <option value="acumulo-nao-permitido">Acúmulo de cargo não permitido</option>
                          <option value="outro">Outro</option>
                        </select>
                      </label>
                      <label className="prototype-ingresso-field">
                        <span>Documento/requisito relacionado</span>
                        <select defaultValue="">
                          <option value="">Selecione...</option>
                          {documentosObrigatoriosIngresso.map((documento) => (
                            <option key={documento.documento} value={documento.documento}>
                              {documento.documento}
                            </option>
                          ))}
                          <option value="requisito-edital">Requisito do edital</option>
                          <option value="comparecimento">Comparecimento para posse</option>
                        </select>
                      </label>
                      <label className="prototype-ingresso-field prototype-suspensao-prazo-full">
                        <span>Justificativa detalhada<em>*</em></span>
                        <textarea placeholder="Descreva a justificativa detalhada da negativa de posse." />
                      </label>
                    </div>
                    <label className="prototype-parecer-ciencia">
                      <input type="checkbox" required />
                      <span>
                        Confirmo que a documentação foi analisada e que o candidato não atende
                        aos requisitos para posse.
                      </span>
                    </label>
                    <div className="prototype-parecer-save-row">
                      <BotaoSeplag
                        type="button"
                        label="Salvar"
                        icon="pi pi-save"
                        onClick={salvarParecerProvimento}
                      />
                    </div>
                  </div>
                ) : null}

                {parecerProvimento === "sem-efeito" ? (
                  <div className="prototype-parecer-sem-efeito">
                    <p>
                      Informe o motivo para tornar a nomeação sem efeito. A justificativa pode
                      ser preenchida quando houver complemento para registrar.
                    </p>
                    <div className="prototype-suspensao-prazo-grid">
                      <label className="prototype-ingresso-field">
                        <span>Motivo<em>*</em></span>
                        <select
                          value={motivoSemEfeito}
                          onChange={(event) => {
                            setMotivoSemEfeito(event.target.value);
                            setTermoSemEfeitoGerado(false);
                          }}
                        >
                          <option value="nao-comparecimento">Não comparecimento</option>
                          <option value="outros">Outros</option>
                        </select>
                      </label>
                      <label className="prototype-ingresso-field prototype-suspensao-prazo-full">
                        <span>Justificativa{motivoSemEfeito === "outros" ? <em>*</em> : null}</span>
                        <textarea
                          value={justificativaSemEfeito}
                          required={motivoSemEfeito === "outros"}
                          placeholder={
                            motivoSemEfeito === "outros"
                              ? "Descreva a justificativa para outros motivos."
                              : "Descreva a justificativa, se necessário."
                          }
                          onChange={(event) => {
                            setJustificativaSemEfeito(event.target.value);
                            setTermoSemEfeitoGerado(false);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ) : null}

                {parecerProvimento !== "negar" ? (
                <div className="prototype-parecer-save-row">
                  <BotaoSeplag
                    type="button"
                    label="Salvar"
                    icon="pi pi-save"
                    disabled={justificativaSemEfeitoObrigatoria}
                    onClick={salvarParecerProvimento}
                  />
                </div>
                ) : null}
                </>
                ) : null}
              </div>
              {parecerProvimento === "aprovar" && documentosAprovacaoGerados
                ? renderDocumentosGerados([
                    {
                      nomeArquivo: "Checklist de documentos recebidos",
                      modeloArquivo: "modelo_checklist_documentos_recebidos.pdf",
                      arquivoEnviado: "checklist_documentos_recebidos_assinado.pdf",
                      tamanhoEnviado: "720 KB",
                    },
                    {
                      nomeArquivo: "Termo de Posse",
                      modeloArquivo: "modelo_termo_posse.pdf",
                      arquivoEnviado: "termo_posse_assinado.pdf",
                      tamanhoEnviado: "1.1 MB",
                    },
                    {
                      nomeArquivo: "Termo de Efetivo Exercício",
                      modeloArquivo: "modelo_termo_encaminhamento.pdf",
                      arquivoEnviado: "termo_encaminhamento_assinado.pdf",
                      tamanhoEnviado: "640 KB",
                    },
                  ])
                : null}
              {parecerProvimento === "suspender" && termoSuspensaoGerado
                ? renderDocumentosGerados([
                    {
                      nomeArquivo: "Termo de Suspensão",
                      modeloArquivo: "modelo_termo_suspensao.pdf",
                      arquivoEnviado: "termo_suspensao_assinado.pdf",
                      tamanhoEnviado: "580 KB",
                    },
                  ])
                : null}
              {parecerProvimento === "negar" && termoNegativaGerado
                ? renderDocumentosGerados([
                    {
                      nomeArquivo: "Termo de Negativa de Posse",
                      modeloArquivo: "modelo_termo_negativa_posse.pdf",
                      arquivoEnviado: "termo_negativa_posse_assinado.pdf",
                      tamanhoEnviado: "610 KB",
                    },
                  ])
                : null}
              {parecerProvimento === "sem-efeito" && termoSemEfeitoGerado
                ? renderDocumentosGerados([
                    {
                      nomeArquivo: "Termo para Tornar Sem Efeito",
                      modeloArquivo: "modelo_termo_tornar_sem_efeito.pdf",
                      arquivoEnviado: "termo_tornar_sem_efeito_assinado.pdf",
                      tamanhoEnviado: "590 KB",
                    },
                  ])
                : null}
            </div>

            <aside className="prototype-analise-provimento-side">
              <div className="prototype-analise-provimento-panel">
                <h4>Prazo da Posse</h4>
                <dl className="prototype-prazo-posse-list">
                  <div>
                    <dt>Data da publicação</dt>
                    <dd>13/07/2026 <i className="pi pi-calendar" /></dd>
                  </div>
                  {prazoPosseSuspenso ? (
                    <>
                      <div>
                        <dt>Prazo original</dt>
                        <dd>12/08/2026 <i className="pi pi-calendar" /></dd>
                      </div>
                      <div>
                        <dt>Data da suspensão</dt>
                        <dd>25/07/2026 <i className="pi pi-calendar" /></dd>
                      </div>
                      <div>
                        <dt>Dias consumidos</dt>
                        <dd>12 dias</dd>
                      </div>
                      <div>
                        <dt>Dias restantes congelados</dt>
                        <dd className="prototype-prazo-posse-days">18 dias</dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>
                          <span className="prototype-prazo-posse-status prototype-prazo-posse-status--suspenso">
                            Prazo suspenso
                          </span>
                        </dd>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <dt>Prazo final</dt>
                        <dd>{dataPosse || "12/08/2026"} <i className="pi pi-calendar" /></dd>
                      </div>
                      <div>
                        <dt>Dias restantes</dt>
                        <dd className="prototype-prazo-posse-days">23 dias</dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>
                          <span className="prototype-prazo-posse-status">Dentro do prazo</span>
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>
            </aside>
          </div>

        </section>
      );
    }

    if (activeTab === "efetivo-exercicio") {
      return (
        <section className="prototype-ingresso-section">
          <div className="prototype-analise-provimento-layout prototype-efetivo-exercicio-layout">
            <div className="prototype-analise-provimento-main">
              <div className="prototype-efetivo-exercicio-card prototype-novo-ingresso-panel">
                <h3><span className="prototype-novo-ingresso-panel-icon"><i className="pi pi-briefcase" aria-hidden="true" /></span><span>Dados do Efetivo Exercício</span></h3>
                <div className="prototype-ingresso-import-grid prototype-novo-ingresso-select-grid">
                  <div className="prototype-efetivo-exercicio-top-row">
                    <label className="prototype-ingresso-field">
                      <span>Servidor compareceu?<em>*</em></span>
                      <select
                        value={servidorCompareceu}
                        onChange={(event) => setServidorCompareceu(event.target.value as "Sim" | "Não")}
                      >
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                      </select>
                    </label>

                    {servidorCompareceu === "Sim" ? (
                      <>
                        <label className="prototype-ingresso-field prototype-efetivo-exercicio-matricula-field">
                          <span>Matrícula</span>
                          <input type="text" value="327305" readOnly />
                        </label>
                        <label className="prototype-ingresso-field prototype-efetivo-exercicio-vinculo-field">
                          <span>Vínculo</span>
                          <input type="text" value="1" readOnly />
                        </label>
                      </>
                    ) : null}
                  </div>

                  {servidorCompareceu === "Sim" ? (
                    <>
                      <div className="prototype-efetivo-exercicio-orgao-row">
                        <div className="prototype-ingresso-field prototype-multiselect-field">
                          <span>Órgão<em>*</em></span>
                          <div className="prototype-multiselect">
                            <button
                              type="button"
                              className="prototype-multiselect-trigger"
                              onClick={() => setOrgaosEfetivoDropdownAberto((dropdownAberto) => !dropdownAberto)}
                              aria-expanded={orgaosEfetivoDropdownAberto}
                            >
                              <span>{orgaosEfetivoResumo}</span>
                              <i className={`pi ${orgaosEfetivoDropdownAberto ? "pi-chevron-up" : "pi-chevron-down"}`} />
                            </button>
                            {orgaosEfetivoDropdownAberto ? (
                              <div className="prototype-multiselect-panel">
                                {orgaosEfetivoOptions.map((orgao) => (
                                  <label key={orgao} className="prototype-multiselect-option">
                                    <input
                                      type="checkbox"
                                      checked={orgaosEfetivoSelecionados.includes(orgao)}
                                      onChange={() => toggleOrgaoEfetivo(orgao)}
                                    />
                                    <span>{orgao}</span>
                                  </label>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <label className="prototype-ingresso-field">
                          <span>Setor/Lotação<em>*</em></span>
                          <select defaultValue="">
                            <option value="">Selecione...</option>
                            <option value="Unidade Central">Unidade Central</option>
                            <option value="Coordenadoria de Pessoas">Coordenadoria de Pessoas</option>
                            <option value="Núcleo Administrativo">Núcleo Administrativo</option>
                          </select>
                        </label>
                      </div>

                      <div className="prototype-efetivo-exercicio-datas-row">
                        <label className="prototype-ingresso-field prototype-efetivo-exercicio-data-field">
                          <span>Data do Efetivo Exercício<em>*</em></span>
                          <input
                            type="date"
                            value={dataEfetivoExercicio}
                            onChange={(event) => setDataEfetivoExercicio(event.target.value)}
                          />
                        </label>
                        <label className="prototype-ingresso-field prototype-efetivo-exercicio-data-field">
                          <span>Data Fim do Exercício</span>
                          <input
                            type="date"
                            value={dataFimEfetivoExercicio}
                            onChange={(event) => setDataFimEfetivoExercicio(event.target.value)}
                          />
                        </label>
                      </div>

                      <label className="prototype-ingresso-field prototype-suspensao-prazo-full">
                        <span>Observação</span>
                        <textarea placeholder="Registre uma observação, se necessário." />
                      </label>
                    </>
                  ) : (
                    <label className="prototype-ingresso-field prototype-suspensao-prazo-full">
                      <span>Observação</span>
                      <textarea placeholder="Registre uma observação, se necessário." />
                    </label>
                  )}
                </div>                {servidorCompareceu === "Sim"
                  ? renderDocumentosGerados([
                      {
                        nomeArquivo: "Termo de Efetivo Exercício",
                        modeloArquivo: "modelo_termo_encaminhamento.pdf",
                        arquivoEnviado: "termo_encaminhamento_assinado.pdf",
                        tamanhoEnviado: "620 KB",
                      },
                    ])
                  : null}
              </div>
            </div>

            <aside className="prototype-analise-provimento-side">
              <div className="prototype-analise-provimento-panel">
                <h4>Prazo do Efetivo Exercício</h4>
                <dl className="prototype-prazo-posse-list">
                  <div>
                    <dt>Data da posse</dt>
                    <dd>{dataPosseEfetivo ? formatarDataPtBr(dataPosseEfetivo) : "Não informada"} <i className="pi pi-calendar" /></dd>
                  </div>
                  <div>
                    <dt>Prazo final</dt>
                    <dd>{prazoFinalEfetivo ? formatarDataPtBr(prazoFinalEfetivo) : "Não informado"} <i className="pi pi-calendar" /></dd>
                  </div>
                  <div>
                    <dt>Dias restantes</dt>
                    <dd className={diasRestantesEfetivo !== null && diasRestantesEfetivo < 0 ? "prototype-prazo-posse-days prototype-prazo-posse-days--vencido" : "prototype-prazo-posse-days"}>
                      {diasRestantesEfetivo === null
                        ? "-"
                        : `${Math.max(diasRestantesEfetivo, 0)} ${Math.max(diasRestantesEfetivo, 0) === 1 ? "dia" : "dias"}`}
                    </dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>
                      <span className={statusEfetivoExercicioClassName}>{statusEfetivoExercicio}</span>
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </section>
      );
    }
    return null;
  };

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-novo-ingresso-page">
        <CardSeplag
          title="Novo Ingresso"
          cols="12"
          cardHeaderClassNames="prototype-novo-ingresso-card"
        >
          <div className={`prototype-ingresso-flow ${activeTab === "tipo-ingresso" ? "" : "prototype-novo-ingresso-etapa-panel"}`}>
            {activeTab === "tipo-ingresso" ? null : tipoIngresso === "Concurso" ? (
              renderNovoIngressoStepper()
            ) : (
              <TabsSeplag
                items={novoIngressoTabs}
                activeValue={activeTab}
                onChange={setActiveTab}
                equalWidth={false}
              />
            )}

            {exibirResumoIngresso ? renderResumoIngressoBloqueado() : null}

            {isEtapaSomenteLeituraSetorial ? (
              <fieldset className="prototype-novo-ingresso-readonly" disabled>
                {renderNovoIngressoTab()}
              </fieldset>
            ) : (
              renderNovoIngressoTab()
            )}

            <div className="prototype-novo-ingresso-footer">
              <div className="prototype-form-actions prototype-novo-ingresso-actions">
                <BotaoVoltarSeplag
                  type="button"
                  label="Voltar"
                  onClick={goBack}
                />
                <BotaoSeplag
                  type="button"
                  label={confirmarActionLabel}
                  icon={confirmarActionIcon}
                  disabled={confirmarActionDisabled}
                  onClick={handleConfirmarNovoIngresso}
                />
              </div>
            </div>
          </div>
        </CardSeplag>
      </div>

      <ModalSeplag
        visible={modalConfirmacaoAberto}
        titulo="Confirmar novo ingresso"
        fechar={() => setModalConfirmacaoAberto(false)}
        labelFechar="Não"
        labelAcao="Sim"
        funcAcao={confirmarNovoIngresso}
        tamanho="560px"
      >
        <p className="col-12">
          Ao confirmar, dará prosseguimento ao ingresso de um novo servidor.
          Deseja continuar?
        </p>
      </ModalSeplag>

      <ModalSeplag
        visible={modalComplementacaoAberto}
        titulo="Solicitar complementação"
        fechar={() => setModalComplementacaoAberto(false)}
        labelFechar="Cancelar"
        labelAcao="Confirmar"
        funcAcao={() => setModalComplementacaoAberto(false)}
        tamanho="620px"
      >
        <div className="prototype-ingresso-modal-content">
          <p>
            Existe documentação pendente ou não validada. Ao solicitar complementação,
            o prazo para posse será suspenso até o envio e validação dos documentos.
          </p>
          <label className="prototype-ingresso-field">
            <span>Documento faltante / pendência<em>*</em></span>
            <textarea placeholder="Informe quais documentos ou correções devem ser solicitados." />
          </label>
        </div>
      </ModalSeplag>

      <ModalSeplag
        visible={modalNegarPosseAberto}
        titulo="Negar posse"
        fechar={() => setModalNegarPosseAberto(false)}
        labelFechar="Cancelar"
        labelAcao="Confirmar"
        iconAcao="pi pi-times"
        funcAcao={() => setModalNegarPosseAberto(false)}
        tamanho="620px"
      >
        <div className="prototype-ingresso-modal-content">
          <p>
            Confirme a negativa de posse para este ingresso. Esta ação deve registrar
            o motivo da negativa no histórico do processo.
          </p>
          <label className="prototype-ingresso-field">
            <span>Motivo da negativa<em>*</em></span>
            <textarea placeholder="Descreva o motivo da negativa de posse." />
          </label>
        </div>
      </ModalSeplag>

    </PrototypeSystemPage>
  );
}

export function PrototiposPessoaFisicaFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cpf = searchParams.get("cpf") ?? "";

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag title="Cadastrar Pessoa Física" cols="12">
          <div className="prototype-ingresso-import-grid">
            <label className="prototype-ingresso-field">
              <span>CPF<em>*</em></span>
              <input defaultValue={cpf} />
            </label>
            <label className="prototype-ingresso-field">
              <span>Nome Completo<em>*</em></span>
              <input />
            </label>
            <label className="prototype-ingresso-field">
              <span>Data de Nascimento</span>
              <input placeholder="dd/mm/aaaa" />
            </label>
            <label className="prototype-ingresso-field">
              <span>E-mail</span>
              <input />
            </label>
            <label className="prototype-ingresso-field">
              <span>Telefone</span>
              <input />
            </label>
            <label className="prototype-ingresso-field">
              <span>Endereço</span>
              <input />
            </label>
          </div>
          <div className="prototype-form-actions prototype-ingresso-step-actions">
            <BotaoVoltarSeplag
              type="button"
              label="Voltar"
              onClick={() => navigate("/prototipos/sigep/ingressos/novo")}
            />
            <BotaoSalvarSeplag type="button" />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposImportarIngressoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tipoParam = searchParams.get("tipo") as IngressoTipo | null;
  const tipoIngresso =
    tipoParam && tipoParam in ingressoTipoVinculoMap ? tipoParam : "Concurso";
  const tipoVinculo = tipoIngresso ? ingressoTipoVinculoMap[tipoIngresso] : "";

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag title="Importar Dados do Ingresso" cols="12">
          <div className="prototype-ingresso-import-layout">
            <div className="prototype-ingresso-summary">
              <div>
                <span>Ingresso</span>
                <strong>{tipoIngresso}</strong>
              </div>
              <div>
                <span>Tipo de Vínculo Gerado</span>
                <strong>{tipoVinculo}</strong>
              </div>
            </div>

            <div className="prototype-ingresso-import-main">
              <div className="prototype-ingresso-import-grid">
                {["Concurso", "Edital", "Órgão", "Cargo", "Data da Publicação", "Arquivo Excel da banca"].map((label) => (
                  <label key={label} className="prototype-ingresso-field">
                    <span>{label}<em>*</em></span>
                    <input
                      type="text"
                      placeholder={label.includes("Arquivo") ? "Selecionar arquivo..." : ""}
                      readOnly
                    />
                  </label>
                ))}
              </div>

              <div className="prototype-form-actions prototype-form-actions--left prototype-ingresso-import-actions">
                <BotaoSeplag type="button" label="Validar Arquivo" icon="pi pi-check-circle" />
                <BotaoSeplag
                  type="button"
                  label="Importar"
                  icon="pi pi-upload"
                  onClick={() => navigate("/prototipos/sigep/ingressos/1")}
                />
              </div>
            </div>
          </div>

          <section className="prototype-ingresso-section">
            <h3>Prévia da importação</h3>
            <div className="prototype-ingresso-preview-wrap">
              <table className="prototype-simple-table prototype-ingresso-preview-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Classificação</th>
                    <th>Tipo de Vaga</th>
                    <th>E-mail</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {ingressoImportacaoPreview.map((row) => (
                    <tr key={row.id}>
                      <td>{row.nome}</td>
                      <td>{row.cpf}</td>
                      <td>{row.classificacao}</td>
                      <td>{row.tipoVaga}</td>
                      <td>{row.email}</td>
                      <td>{row.situacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="prototype-form-actions prototype-ingresso-step-actions">
            <BotaoVoltarSeplag
              type="button"
              label="Voltar"
              onClick={() => navigate("/prototipos/sigep/ingressos/novo")}
            />
            <BotaoSeplag
              type="button"
              label="Avançar"
              icon="pi pi-arrow-right"
              onClick={() => navigate("/prototipos/sigep/ingressos/1")}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

function IngressoInfoGrid({
  className = "",
  items,
}: {
  className?: string;
  items: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <div className={`prototype-ingresso-info-grid ${className}`}>
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function PrototiposIngressoDetalhePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get("aba") as IngressoDetalheTab | null;
  const [activeTab, setActiveTab] = useState<IngressoDetalheTab>(
    requestedTab ?? "dados-basicos",
  );
  const ingresso = ingressosMock.find((item) => String(item.id) === id) ?? ingressosMock[0];

  const renderTabContent = () => {
    if (activeTab === "dados-basicos") {
      return (
        <div className="prototype-ingresso-two-columns">
          <section className="prototype-ingresso-section">
            <h3>Dados da Pessoa</h3>
            <IngressoInfoGrid
              items={[
                { label: "Nome", value: ingresso.nome },
                { label: "CPF", value: ingresso.cpf },
                { label: "Data de nascimento", value: "10/02/1990" },
                { label: "E-mail", value: "joao@email.com" },
                { label: "Telefone", value: "(65) 99999-0000" },
                { label: "Endereço", value: "Rua Central, 100 - Cuiabá/MT" },
              ]}
            />
          </section>
          <section className="prototype-ingresso-section">
            <h3>Dados do Ingresso</h3>
            <IngressoInfoGrid
              items={[
                { label: "Ingresso", value: ingresso.tipoIngresso },
                { label: "Tipo de Vínculo", value: ingresso.tipoVinculo },
                { label: "Órgão", value: ingresso.orgao },
                { label: "Cargo", value: ingresso.cargo },
                { label: "Classificação", value: "1º" },
                { label: "Tipo de vaga", value: "AC" },
                { label: "Data da publicação", value: "30/06/2026" },
                { label: "Prazo final", value: "30/07/2026" },
              ]}
            />
            <div className="prototype-validation-panel prototype-validation-panel--info">
              Dados importados ficam bloqueados para edição.
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === "documentacao") {
      return (
        <section className="prototype-ingresso-section">
          <h3>Documentação</h3>
          <table className="prototype-simple-table prototype-ingresso-doc-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Obrigatório</th>
                <th>Situação</th>
                <th>Arquivo</th>
                <th>Observação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ingressoDocumentosMock
                .filter((documento) => documento.arquivo !== "-")
                .map((documento) => (
                <tr key={documento.documento}>
                  <td>{documento.documento}</td>
                  <td>{documento.obrigatorio}</td>
                  <td>{documento.situacao}</td>
                  <td>{documento.arquivo}</td>
                  <td>{documento.observacao}</td>
                  <td>
                    <div className="prototype-ingresso-doc-actions">
                      <BotaoIconSeplag
                        type="button"
                        icon="pi pi-download"
                        tooltip={`Baixar ${documento.arquivo}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="prototype-form-actions prototype-form-actions--left">
            <BotaoSeplag type="button" label="Aprovar Documentação" icon="pi pi-check" />
            <BotaoSeplag type="button" label="Solicitar Complementação" icon="pi pi-file-edit" severity="warning" />
            <BotaoSeplag type="button" label="Reprovar" icon="pi pi-times" severity="danger" />
          </div>
          {tipoIngresso ? renderDadosIngresso() : null}
        </section>
      );
    }

    if (activeTab === "validacoes") {
      return (
        <section className="prototype-ingresso-section">
          <h3>Validações</h3>
          <IngressoInfoGrid
            items={[
              { label: "Documentação completa", value: "Sim" },
              { label: "Prazo válido", value: "Sim" },
              { label: "Perícia médica", value: "Apto" },
              { label: "Acúmulo de cargo", value: "Regular" },
              { label: "Pendência jurídica", value: "Não" },
              { label: "Status", value: "Apto para Posse" },
            ]}
          />
          <div className="prototype-form-actions prototype-form-actions--left">
            <BotaoSeplag type="button" label="Registrar Perícia" icon="pi pi-heart" />
            <BotaoSeplag type="button" label="Registrar Análise de Acúmulo" icon="pi pi-briefcase" />
            <BotaoSeplag
              type="button"
              label="Liberar Formalização"
              icon="pi pi-send"
              onClick={() => setActiveTab("formalizacao")}
            />
          </div>
          {tipoIngresso ? renderDadosIngresso() : null}
        </section>
      );
    }

    if (activeTab === "formalizacao") {
      return (
        <section className="prototype-ingresso-section">
          <h3>Formalização - Posse</h3>
          <div className="prototype-ingresso-import-grid">
            {["Data da Posse", "Termo de Posse", "Termo de Encaminhamento", "Responsável pela Posse", "Observação"].map((label) => (
              <label key={label} className="prototype-ingresso-field">
                <span>{label}{label === "Data da Posse" ? <em>*</em> : null}</span>
                <input readOnly />
              </label>
            ))}
          </div>
          <div className="prototype-form-actions prototype-form-actions--left">
            <BotaoSeplag type="button" label="Gerar Termo de Posse" icon="pi pi-file" />
            <BotaoSeplag type="button" label="Gerar Termo de Encaminhamento" icon="pi pi-file-export" />
            <BotaoSeplag type="button" label="Confirmar Posse" icon="pi pi-check" />
            <BotaoSeplag type="button" label="Negar Posse" icon="pi pi-times" severity="danger" />
          </div>
          {tipoIngresso ? renderDadosIngresso() : null}
        </section>
      );
    }

    if (activeTab === "exercicio") {
      return (
        <section className="prototype-ingresso-section">
          <h3>Exercício / Início</h3>
          <div className="prototype-ingresso-import-grid">
            {["Órgão", "Lotação", "Data limite para início", "Data efetiva de início", "Documento comprobatório", "Termo de Efetivo Exercício"].map((label) => (
              <label key={label} className="prototype-ingresso-field">
                <span>{label}{["Órgão", "Lotação", "Data efetiva de início"].includes(label) ? <em>*</em> : null}</span>
                <input readOnly />
              </label>
            ))}
          </div>
          <div className="prototype-validation-panel prototype-validation-panel--info">
            Somente após registrar o início o sistema pode gerar vínculo.
          </div>
          <div className="prototype-form-actions prototype-form-actions--left">
            <BotaoSeplag type="button" label="Registrar Início" icon="pi pi-calendar-plus" />
          </div>
          {tipoIngresso ? renderDadosIngresso() : null}
        </section>
      );
    }

    if (activeTab === "vinculo") {
      return (
        <section className="prototype-ingresso-section">
          <h3>Gerar Vínculo</h3>
          <IngressoInfoGrid
            items={[
              { label: "Matrícula", value: "327305" },
              { label: "Nº do Vínculo", value: "1" },
              { label: "Tipo de Vínculo", value: ingresso.tipoVinculo },
              { label: "Natureza", value: "Funcional" },
              { label: "Cargo", value: ingresso.cargo },
              { label: "Órgão", value: ingresso.orgao },
              { label: "Lotação", value: "Unidade Central" },
              { label: "Data de Exercício", value: "15/07/2026" },
              { label: "Situação Inicial", value: "Ativo" },
            ]}
          />
          <div className="prototype-validation-panel">
            Vínculo criado com sucesso. Ingresso concluído. Servidor disponível para Vida Funcional e Folha.
          </div>
          <div className="prototype-form-actions prototype-form-actions--left">
            <BotaoSeplag
              type="button"
              label="Gerar Vínculo"
              icon="pi pi-link"
              onClick={() => navigate("/prototipos/sigep/pessoas/327305/vinculos")}
            />
          </div>
          {tipoIngresso ? renderDadosIngresso() : null}
        </section>
      );
    }

    return (
      <section className="prototype-ingresso-section">
        <h3>{activeTab === "historico" ? "Histórico" : "Prestação de Contas"}</h3>
        <table className="prototype-simple-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Evento</th>
              <th>Responsável</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>03/07/2026</td>
              <td>Ingresso em análise</td>
              <td>Roberto Junior</td>
            </tr>
          </tbody>
        </table>
      </section>
    );
  };

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag title="Ingresso nº 2026/0001" cols="12">
          <IngressoInfoGrid
            className="prototype-ingresso-header-grid"
            items={[
              { label: "Nome", value: ingresso.nome },
              { label: "CPF", value: ingresso.cpf },
              { label: "Ingresso", value: ingresso.tipoIngresso },
              { label: "Tipo de Vínculo", value: ingresso.tipoVinculo },
              { label: "Situação", value: ingresso.situacao },
              { label: "Prazo para Posse", value: "30/07/2026" },
            ]}
          />
          <TabsSeplag
            items={ingressoDetalheTabs}
            activeValue={activeTab}
            onChange={setActiveTab}
            equalWidth={false}
          />
          {renderTabContent()}
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposPastaFuncionalServidorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const ingresso = ingressosMock.find((item) => String(item.id) === id) ?? ingressosMock[0];
  const numeroIngresso = "2026/0001";
  const concursoIngresso = ingresso.tipoIngresso === "Concurso" ? `${ingresso.tipoIngresso} ${ingresso.orgao} 2026` : "-";
  const prazoParaPosse = "30/07/2026";
  const regimeJuridico = ingresso.tipoVinculo === "Efetivo" ? "Estatutário" : ingresso.tipoVinculo;
  const categoriaServidor = "Servidor Público";
  const decisaoJudicial = "Não";
  const situacoesIngressosSalvas = JSON.parse(
    localStorage.getItem("prototype-ingresso-situacoes") ?? "{}",
  ) as Partial<Record<string, IngressoSituacao>>;
  const situacaoIngresso = situacoesIngressosSalvas[String(ingresso.id)] ?? ingresso.situacao;
  const documentosAnexados = ingressoDocumentacaoObrigatoriaMock;

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag title="Pasta Funcional do Servidor" cols="12">
          <div className="prototype-pasta-funcional-header">
            <strong className="prototype-pasta-funcional-header-title">
              Ingresso nº {numeroIngresso}
            </strong>
            <div className="prototype-pasta-funcional-header-grid">
              <div>
                <p><strong>Nome:</strong> {ingresso.nome}</p>
                <p><strong>Tipo de Vínculo:</strong> {ingresso.tipoVinculo}</p>
                <p><strong>Cargo:</strong> {ingresso.cargo}</p>
                <p><strong>Prazo para Posse:</strong> {prazoParaPosse}</p>
              </div>
              <div>
                <p><strong>CPF:</strong> {ingresso.cpf}</p>
                <p><strong>Concurso:</strong> {concursoIngresso}</p>
                <p><strong>Regime:</strong> {regimeJuridico}</p>
                <p><strong>Situação:</strong> {situacaoIngresso}</p>
              </div>
              <div>
                <p><strong>Ingresso:</strong> {ingresso.tipoIngresso}</p>
                <p><strong>Categoria:</strong> {categoriaServidor}</p>
                <p><strong>Decisão Judicial:</strong> {decisaoJudicial}</p>
              </div>
            </div>
          </div>

          <section className="prototype-ingresso-section">
            <h3>Documentos Anexados no Ingresso</h3>
            <table className="prototype-simple-table prototype-pasta-funcional-table">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Obrigatório</th>
                  <th>Arquivo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {documentosAnexados.map((documento) => (
                  <tr key={documento.documento}>
                    <td>{documento.documento}</td>
                    <td>{documento.obrigatorio}</td>
                    <td>{documento.arquivo}</td>
                    <td className="prototype-ingresso-doc-action-cell">
                      {documento.arquivo !== "-" ? (
                        <div className="prototype-ingresso-doc-actions">
                          <BotaoIconSeplag
                            type="button"
                            icon="pi pi-download"
                            tooltip={`Baixar ${documento.arquivo}`}
                          />
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="prototype-ingresso-section">
            <h3>Documentos Gerados no Ingresso</h3>
            <table className="prototype-simple-table prototype-pasta-funcional-table">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Arquivo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ingressoDocumentosGeradosMock.map((documento) => (
                  <tr key={documento.documento}>
                    <td>{documento.documento}</td>
                    <td>{documento.arquivo}</td>
                    <td className="prototype-ingresso-doc-action-cell">
                      <div className="prototype-ingresso-doc-actions">
                        <BotaoIconSeplag
                          type="button"
                          icon="pi pi-eye"
                          tooltip={`Visualizar ${documento.arquivo}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="prototype-form-actions prototype-pasta-funcional-actions">
            <BotaoVoltarSeplag
              type="button"
              label="Voltar"
              onClick={() => navigate("/prototipos/sigep/ingressos")}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposPessoaVinculosPage() {
  const navigate = useNavigate();

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag title="Pessoa" cols="12">
          <IngressoInfoGrid
            items={[
              { label: "Nome", value: "João Silva" },
              { label: "CPF", value: "000.000.000-00" },
              { label: "Matrícula", value: "327305" },
            ]}
          />
          <div className="prototype-ingresso-static-tabs">
            {["Dados Pessoais", "Ingressos", "Vínculos", "Vida Funcional", "Documentos"].map((tab) => (
              <span key={tab} className={tab === "Vínculos" ? "is-active" : ""}>{tab}</span>
            ))}
          </div>
          <table className="prototype-simple-table">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Tipo</th>
                <th>Natureza</th>
                <th>Cargo/Função</th>
                <th>Data Início</th>
                <th>Data Vacância</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["1", "Efetivo", "Funcional", "Analista", "15/07/2026", "-", "Ativo"],
                ["2", "Comissionado", "Funcional", "DGA-4", "01/08/2026", "-", "Ativo"],
              ].map((row) => (
                <tr key={row[0]}>
                  {row.map((cell) => <td key={cell}>{cell}</td>)}
                  <td>
                    <div className="prototype-ingresso-action-row">
                      <BotaoIconSeplag type="button" icon="pi pi-eye" tooltip="Visualizar" onClick={() => navigate(`/prototipos/sigep/vinculos/${row[0]}`)} />
                      <BotaoIconSeplag type="button" icon="pi pi-history" tooltip="Histórico" />
                      <BotaoIconSeplag type="button" icon="pi pi-times" tooltip="Encerrar vínculo" severity="danger" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposVinculoDetalhePage() {
  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag title="Vínculo nº 1" cols="12">
          <IngressoInfoGrid
            items={[
              { label: "Matrícula", value: "327305" },
              { label: "Tipo de Vínculo", value: "Efetivo" },
              { label: "Natureza", value: "Funcional" },
              { label: "Origem", value: "Ingresso nº 2026/0001" },
              { label: "Situação", value: "Ativo" },
              { label: "Cargo", value: "Analista Administrativo" },
              { label: "Categoria", value: "Profissional Técnico" },
              { label: "Regime Jurídico", value: "Estatutário" },
              { label: "Órgão", value: "SES" },
              { label: "Lotação", value: "Unidade Central" },
              { label: "Data de Exercício", value: "15/07/2026" },
              { label: "Data de Vacância", value: "-" },
              { label: "Forma de Vacância", value: "-" },
            ]}
          />
          <div className="prototype-ingresso-static-tabs">
            {["Histórico", "Documentos", "Movimentações"].map((tab, index) => (
              <span key={tab} className={index === 0 ? "is-active" : ""}>{tab}</span>
            ))}
          </div>
          <div className="prototype-validation-panel prototype-validation-panel--info">
            O vínculo funcional é resultado automático da conclusão do ingresso, sem cadastro manual.
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposMatrizValidacaoTestePage() {
  const navigate = useNavigate();
  const routePrefix = SIGEP_CARGO_CONCURSO_TESTE_BASE_PATH;
  const { control, reset, watch } = useForm<MatrizValidacaoFiltroForm>({
    defaultValues: {
      instituicao: undefined,
      orgao: undefined,
      regimeJuridico: undefined,
      tipoVinculo: undefined,
      categoria: undefined,
      cargo: "",
      situacao: undefined,
    },
  });
  const [perfilIngressos, setPerfilIngressos] = useState<IngressoPerfil>("PROVIMENTO");
  const filtros = watch();
  const cargoBusca = filtros.cargo?.trim().toLowerCase();
  const regrasFiltradas = matrizValidacaoTesteMock.filter((regra) => {
    const atendeInstituicao =
      !filtros.instituicao || regra.instituicao === filtros.instituicao;
    const atendeOrgao = !filtros.orgao || regra.orgao === filtros.orgao;
    const atendeRegime =
      !filtros.regimeJuridico ||
      regra.regimeJuridico === filtros.regimeJuridico;
    const atendeTipoVinculo =
      !filtros.tipoVinculo || regra.tipoVinculo === filtros.tipoVinculo;
    const atendeCategoria =
      !filtros.categoria || regra.categoria === filtros.categoria;
    const atendeCargo =
      !cargoBusca ||
      regra.cargo.toLowerCase().includes(cargoBusca) ||
      regra.subcategoria.toLowerCase().includes(cargoBusca);
    const atendeSituacao =
      !filtros.situacao || regra.situacao === filtros.situacao;

    return (
      atendeInstituicao &&
      atendeOrgao &&
      atendeRegime &&
      atendeTipoVinculo &&
      atendeCategoria &&
      atendeCargo &&
      atendeSituacao
    );
  });
  const matrizResults = {
    ...createResults(regrasFiltradas),
    totalPages: Math.max(1, Math.ceil(regrasFiltradas.length / 10)),
    totalRecords: regrasFiltradas.length,
    size: 10,
    sizePage: 10,
  };
  const matrizColumns: ColumnMetaSeplag<MatrizValidacaoTesteRow>[] = [
    { field: "instituicao", header: "Instituição" },
    { field: "orgao", header: "Órgão" },
    { field: "regimeJuridico", header: "Regime Jurídico" },
    { field: "tipoVinculo", header: "Tipo de Vínculo" },
    { field: "categoria", header: "Categoria" },
    { field: "subcategoria", header: "Subcategoria" },
    { field: "cargo", header: "Cargo" },
    { field: "formaProvimento", header: "Provimento" },
    { field: "jornada", header: "Jornada" },
    {
      header: "Especificidade",
      body: (row) => (
        <BadgeSeplag
          label={row.especificidade}
          color={row.especificidade === "Genérica" ? "#52616b" : "#005494"}
          bg={row.especificidade === "Genérica" ? "#eef2f6" : "#e6f0f8"}
          border="transparent"
          size="md"
        />
      ),
    },
    { field: "vigencia", header: "Vigência" },
    {
      header: "Situação",
      body: (row) => (
        <BadgeSeplag
          label={row.situacao === "ATIVO" ? "Ativo" : "Encerrado"}
          color={row.situacao === "ATIVO" ? "#00843d" : "#9a6500"}
          bg={row.situacao === "ATIVO" ? "#e2f3e8" : "#fff1c7"}
          border="transparent"
          size="md"
        />
      ),
    },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag title="Matriz de Validação Funcional" cols="12">
          <div className="prototype-category-filters prototype-matriz-filters grid">
            <DropdownFieldSeplag
              name="instituicao"
              control={control}
              label="Instituição"
              cols="12 12 2"
              options={matrizInstituicaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="orgao"
              control={control}
              label="Órgão"
              cols="12 12 2"
              options={matrizOrgaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="regimeJuridico"
              control={control}
              label="Regime Jurídico"
              cols="12 12 2"
              options={matrizRegimeOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="tipoVinculo"
              control={control}
              label="Tipo de Vínculo"
              cols="12 12 2"
              options={matrizTipoVinculoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="categoria"
              control={control}
              label="Categoria"
              cols="12 12 2"
              options={matrizCategoriaOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <TextFieldSeplag
              name="cargo"
              control={control}
              label="Cargo/Subcategoria"
              cols="12 12 2"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="situacao"
              control={control}
              label="Situação"
              cols="12 12 2"
              options={situacaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-2">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={() =>
                  reset({
                    instituicao: undefined,
                    orgao: undefined,
                    regimeJuridico: undefined,
                    tipoVinculo: undefined,
                    categoria: undefined,
                    cargo: "",
                    situacao: undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="prototype-matriz-table">
            <TablePaginadoSeplag
              dataKey="id"
              data={matrizResults}
              rows={10}
              rowsPerPage={[10]}
              paginator
              lazy={false}
              selectionMode={null}
              columns={matrizColumns}
              hasEventoAcao
              handleAdicionar={() =>
                navigate(`${routePrefix}/matriz-validacao/novo`)
              }
              handleView={(row) =>
                navigate(`${routePrefix}/matriz-validacao/${row.id}/editar`)
              }
              handleEdit={(row) =>
                navigate(`${routePrefix}/matriz-validacao/${row.id}/editar`)
              }
              handleDelete={() => {}}
              handleOnPageChange={() => {}}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposMatrizValidacaoTesteFormPage() {
  const navigate = useNavigate();
  const routePrefix = SIGEP_CARGO_CONCURSO_TESTE_BASE_PATH;
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { control, setValue, watch } = useForm<MatrizValidacaoForm>({
    defaultValues: {
      instituicao: "GOVMT",
      orgao: "Todos",
      setor: "Todos",
      regimeJuridico: "",
      tipoVinculo: "",
      categoria: "",
      subcategoria: "Todos",
      cargo: "Todos",
      formaProvimento: "",
      jornada: "",
      controlaVaga: "Sim",
      tipoControleVaga: "Quantitativa",
      aplicaIngresso: "S",
      aplicaEventoCargo: "S",
      aplicaConcurso: "S",
      aplicaControleVagas: "S",
      observacao: "",
      situacao: SITUACAO_VIGENCIA.ATIVO,
      dataAtivacao: "",
      dataEncerramento: "",
      dataExtincao: "",
      motivoEncerramento: "",
      motivoExtincao: "",
    },
  });
  const valores = watch();
  const aplicacoes = [
    valores.aplicaIngresso === "S" ? "Ingresso" : null,
    valores.aplicaEventoCargo === "S" ? "Evento de Cargo/Provimento" : null,
    valores.aplicaConcurso === "S" ? "Concurso" : null,
    valores.aplicaControleVagas === "S" ? "Controle de Vagas" : null,
  ].filter(Boolean);
  const especificidade =
    valores.cargo && valores.cargo !== "Todos"
      ? "Regra específica por cargo"
      : valores.orgao && valores.orgao !== "Todos"
        ? "Regra específica por órgão"
        : "Regra genérica";
  const resumo = [
    valores.instituicao,
    valores.orgao,
    valores.setor,
    valores.regimeJuridico,
    valores.tipoVinculo,
    valores.categoria,
    valores.subcategoria,
    valores.cargo,
  ].filter(Boolean);

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="prototype-page-content prototype-page-content--white">
          <CardSeplag
            title={`${isEditing ? "Alterar" : "Cadastrar"} - Matriz de Validação Funcional`}
            cols="12"
            cardHeaderClassNames="prototype-category-card"
          >
            <div className="prototype-cargo-form">
              <section className="prototype-cargo-form-section">
                <h3>Contexto Organizacional</h3>
                <div className="grid prototype-cargo-form-fields">
                  <DropdownFieldSeplag
                    name="instituicao"
                    control={control}
                    label="Instituição"
                    cols="12 12 4"
                    options={matrizInstituicaoOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="orgao"
                    control={control}
                    label="Órgão"
                    cols="12 12 4"
                    options={matrizOrgaoOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="setor"
                    control={control}
                    label="Setor"
                    cols="12 12 4"
                    options={matrizSetorOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Composição Funcional</h3>
                <div className="grid prototype-cargo-form-fields">
                  <DropdownFieldSeplag
                    name="regimeJuridico"
                    control={control}
                    label="Regime Jurídico"
                    cols="12 12 6"
                    options={matrizRegimeOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="tipoVinculo"
                    control={control}
                    label="Tipo de Vínculo"
                    cols="12 12 6"
                    options={matrizTipoVinculoOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="categoria"
                    control={control}
                    label="Categoria"
                    cols="12 12 4"
                    options={matrizCategoriaOptions}
                    optionLabel="label"
                    optionValue="value"
                    required
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="subcategoria"
                    control={control}
                    label="Subcategoria"
                    cols="12 12 4"
                    options={matrizSubcategoriaOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="cargo"
                    control={control}
                    label="Cargo"
                    cols="12 12 4"
                    options={matrizCargoOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Parâmetros de Ocupação</h3>
                <div className="grid prototype-cargo-form-fields">
                  <DropdownFieldSeplag
                    name="formaProvimento"
                    control={control}
                    label="Forma de Provimento"
                    cols="12 12 3"
                    options={cargoFormaProvimentoOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="jornada"
                    control={control}
                    label="Jornada de Trabalho"
                    cols="12 12 3"
                    options={cargoJornadaOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="controlaVaga"
                    control={control}
                    label="Controla Vaga?"
                    cols="12 12 3"
                    options={matrizControlaVagaOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => null}
                  />
                  <DropdownFieldSeplag
                    name="tipoControleVaga"
                    control={control}
                    label="Tipo de Controle de Vaga"
                    cols="12 12 3"
                    options={matrizTipoControleVagaOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Aplicação da Regra</h3>
                <div className="prototype-shared-criterios-list prototype-matriz-aplicacoes">
                  <div className="prototype-shared-criterio-item">
                    <CheckboxFieldSeplag<MatrizValidacaoForm>
                      name="aplicaIngresso"
                      control={control}
                      checkboxLabel="Ingresso"
                      cols="12"
                    />
                    <span>Permite usar a combinação no ingresso.</span>
                  </div>
                  <div className="prototype-shared-criterio-item">
                    <CheckboxFieldSeplag<MatrizValidacaoForm>
                      name="aplicaEventoCargo"
                      control={control}
                      checkboxLabel="Evento de Cargo / Provimento"
                      cols="12"
                    />
                    <span>Permite usar em eventos de cargo e provimento.</span>
                  </div>
                  <div className="prototype-shared-criterio-item">
                    <CheckboxFieldSeplag<MatrizValidacaoForm>
                      name="aplicaConcurso"
                      control={control}
                      checkboxLabel="Concurso"
                      cols="12"
                    />
                    <span>Permite ofertar a combinação em concurso.</span>
                  </div>
                  <div className="prototype-shared-criterio-item">
                    <CheckboxFieldSeplag<MatrizValidacaoForm>
                      name="aplicaControleVagas"
                      control={control}
                      checkboxLabel="Controle de Vagas"
                      cols="12"
                    />
                    <span>Permite criar quadro ou vaga para a combinação.</span>
                  </div>
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Resumo e Validações</h3>
                <div className="prototype-matriz-summary">
                  <div>
                    <strong>{especificidade}</strong>
                    <p>{resumo.length ? resumo.join(" + ") : "Preencha os campos para visualizar a combinação."}</p>
                  </div>
                  <div>
                    <strong>Aplicação</strong>
                    <p>
                      {aplicacoes.length
                        ? aplicacoes.join(", ")
                        : "Nenhuma funcionalidade selecionada."}
                    </p>
                  </div>
                  <div className="prototype-matriz-warning">
                    <i className="pi pi-exclamation-triangle" aria-hidden="true" />
                    <span>
                      Validação visual: verificar sobreposição de vigência para a
                      mesma combinação antes de salvar.
                    </span>
                  </div>
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Vigência</h3>
                <div className="prototype-cargo-vigencia-fields">
                  <SituacaoVigenciaSeplag<MatrizValidacaoForm>
                    control={control}
                    setValue={setValue}
                    rotuloDataAtivacao="Início de Vigência"
                    cols={{
                      situacao: "12 12 3",
                      dataAtivacao: "12 12 3",
                      statusOperacional:
                        "col-12 md:col-4 lg:col-4 prototype-status-operacional-col",
                      dataEncerramento: "12 12 3",
                      motivoEncerramento: "12",
                      dataExtincao: "12 12 3",
                      motivoExtincao: "12",
                    }}
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <section className="prototype-cargo-form-section">
                <h3>Observação</h3>
                <div className="grid prototype-cargo-form-fields">
                  <TextAreaFieldSeplag
                    name="observacao"
                    control={control}
                    label="Observação"
                    cols="12"
                    rows={4}
                    maxLength={500}
                    getFormErrorMessage={() => null}
                  />
                </div>
              </section>

              <div className="prototype-category-form-footer">
                <BotaoVoltarSeplag
                  type="button"
                  onClick={() => navigate(`${routePrefix}/matriz-validacao`)}
                />
                <BotaoSalvarSeplag type="submit" />
              </div>
            </div>
          </CardSeplag>
        </div>
      </form>
    </PrototypeSystemPage>
  );
}

const FOLHA_CRONOGRAMA_STORAGE_KEY = "prototipos.folha.cronograma";

const folhaCronogramaDefaultState: FolhaCronogramaState = {
  tituloCiclo: "Ciclo de folha de pagamento — Junho/2026",
  secoes: [
    {
      id: 1,
      titulo: "Folha principal",
      marcador: "is-main",
      eventos: [
        {
          periodo: "14/06 - 16/06 - 18:00",
          descricao:
            "Limite para envio de documentos pelas setoriais à SAGPP/SEPLAG",
          status: "Agendado",
        },
        {
          periodo: "14/06 - 14/06 - 18:00",
          descricao: "Carga dos consignados na folha",
          status: "Em Andamento",
        },
        {
          periodo: "15/06 - 15/06 - 17:00",
          descricao: "Limite para execução do último operador PAEP",
          status: "Agendado",
        },
        {
          periodo: "15/06 - 15/06 - 17:00",
          descricao: "Limite para lançamento de férias do mês subsequente no SEAP",
          status: "Agendado",
        },
        {
          periodo: "17/06 - 17/06 - 18:00",
          descricao:
            "Último processamento total - Último dia para registros na folha principal",
          status: "Em Andamento",
        },
        {
          periodo: "18/06 - 22/06 - 17:00",
          descricao: "Período exclusivo de conformidade - bloqueio do SEAP",
          status: "Em Andamento",
        },
        {
          periodo: "20/06 - 20/06 - 11:00",
          descricao: "Limite para solicitação de cancelamento de pagamento (SEPLAG)",
          status: "Agendado",
        },
        {
          periodo: "22/06 - 22/06 - 17:00",
          descricao: "Consolidação",
          status: "Concluído",
        },
        {
          periodo: "03/06 - 03/06 - 18:00",
          descricao: "Limite para solicitação de retransmissão de pagamento",
          status: "Agendado",
        },
      ],
    },
    {
      id: 2,
      titulo: "Rescisão - Folha 31",
      marcador: "is-rescission",
      observacao:
        "Os desligamentos ocorridos após o dia 14/06/2026 serão processados na Folha Rescisória 32 de junho/2026.",
      eventos: [
        {
          periodo: "14/06 - 14/06 - 18:00",
          descricao: "Processamento da folha - desligamentos até 14/05",
          status: "Em Andamento",
        },
        {
          periodo: "15/06 - 15/06 - 11:00",
          descricao: "Limite para solicitação de cancelamento de pagamento",
          status: "Agendado",
        },
        {
          periodo: "18/06 - 18/06 - 17:00",
          descricao: "Consolidação",
          status: "Concluído",
        },
      ],
    },
  ],
};

const cloneFolhaCronogramaState = (state: FolhaCronogramaState) => ({
  ...state,
  secoes: state.secoes.map((secao) => ({
    ...secao,
    eventos: secao.eventos.map((evento) => ({ ...evento })),
  })),
});

const loadFolhaCronogramaState = (): FolhaCronogramaState => {
  if (typeof window === "undefined") {
    return cloneFolhaCronogramaState(folhaCronogramaDefaultState);
  }

  try {
    const stored = window.localStorage.getItem(FOLHA_CRONOGRAMA_STORAGE_KEY);
    if (!stored) return cloneFolhaCronogramaState(folhaCronogramaDefaultState);

    const parsed = JSON.parse(stored) as Partial<FolhaCronogramaState>;
    return {
      tituloCiclo:
        typeof parsed.tituloCiclo === "string" && parsed.tituloCiclo.trim()
          ? parsed.tituloCiclo
          : folhaCronogramaDefaultState.tituloCiclo,
      secoes:
        Array.isArray(parsed.secoes) && parsed.secoes.length
          ? (parsed.secoes as FolhaCronogramaSecao[])
          : cloneFolhaCronogramaState(folhaCronogramaDefaultState).secoes,
    };
  } catch {
    return cloneFolhaCronogramaState(folhaCronogramaDefaultState);
  }
};

const saveFolhaCronogramaState = (state: FolhaCronogramaState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FOLHA_CRONOGRAMA_STORAGE_KEY, JSON.stringify(state));
};

interface PrototiposFolhaPageProps {
  modulo?: "folha" | "gestao-pessoas";
}

export function PrototiposFolhaPage({
  modulo = "folha",
}: PrototiposFolhaPageProps = {}) {
  const isGestaoPessoas = modulo === "gestao-pessoas";
  const navigate = useNavigate();
  const [modoEdicaoHomeFolha, setModoEdicaoHomeFolha] = useState(true);
  const [modalNovoInformativoAberto, setModalNovoInformativoAberto] =
    useState(false);
  const [modalNovoCronogramaAberto, setModalNovoCronogramaAberto] =
    useState(false);
  const [informativoEdicaoId, setInformativoEdicaoId] = useState<number | null>(
    null,
  );
  const [eventoArrastado, setEventoArrastado] = useState<{
    cronogramaId: number;
    eventoIndex: number;
  } | null>(null);
  const [novoInformativo, setNovoInformativo] = useState({
    titulo: "",
    tipo: "Informação",
    texto: "",
  });
  const [homeFormError, setHomeFormError] = useState("");
  const [tituloCicloFolha, setTituloCicloFolha] = useState(
    () => loadFolhaCronogramaState().tituloCiclo,
  );
  const [informativosFolha, setInformativosFolha] = useState([
    {
      id: 1,
      icon: "pi pi-exclamation-triangle",
      titulo: "Prazo Final para Ajustes",
      dataPostagem: "15/06/2026",
      texto:
        "Prazo para lançamento de horas extras vence em 15/06/2026 às 23:59. Após essa data, não será possível fazer alterações no sistema.",
      destaque: "is-warning",
    },
    {
      id: 2,
      icon: "pi pi-info-circle",
      titulo: "Processamento em Andamento",
      dataPostagem: "14/06/2026",
      texto:
        "Processamento da folha de junho iniciou em 16/06/2026. Você receberá notificação quando disponível para consulta.",
      destaque: "is-info",
    },
    {
      id: 3,
      icon: "pi pi-thumbtack",
      titulo: "Férias - saldo residual e intervalo mínimo",
      dataPostagem: "09/06/2026",
      texto:
        "O sistema não permitirá mais o registro de gozos que resultem em um saldo final de 5 dias. Verifique suas solicitações pendentes.",
      destaque: "is-pin",
    },
  ]);

  const informativoTipoMeta: Record<
    string,
    { icon: string; destaque: string }
  > = {
    Alerta: { icon: "pi pi-exclamation-triangle", destaque: "is-warning" },
    Informação: { icon: "pi pi-info-circle", destaque: "is-info" },
    Aviso: { icon: "pi pi-thumbtack", destaque: "is-pin" },
    Importante: { icon: "pi pi-star", destaque: "is-warning" },
  };

  const [cronogramasFolha, setCronogramasFolha] = useState([
    {
      id: 1,
      titulo: "Folha principal",
      marcador: "is-main",
      eventos: [
        {
          periodo: "14/06 - 16/06 - 18:00",
          descricao:
            "Limite para envio de documentos pelas setoriais à SAGPP/SEPLAG",
          status: "Agendado",
        },
        {
          periodo: "14/06 - 14/06 - 18:00",
          descricao: "Carga dos consignados na folha",
          status: "Em Andamento",
        },
        {
          periodo: "15/06 - 15/06 - 17:00",
          descricao: "Limite para execução do último operador PAEP",
          status: "Agendado",
        },
        {
          periodo: "15/06 - 15/06 - 17:00",
          descricao: "Limite para lançamento de férias do mês subsequente no SEAP",
          status: "Agendado",
        },
        {
          periodo: "17/06 - 17/06 - 18:00",
          descricao:
            "Último processamento total - Último dia para registros na folha principal",
          status: "Em Andamento",
        },
        {
          periodo: "18/06 - 22/06 - 17:00",
          descricao: "Período exclusivo de conformidade - bloqueio do SEAP",
          status: "Em Andamento",
        },
        {
          periodo: "20/06 - 20/06 - 11:00",
          descricao: "Limite para solicitação de cancelamento de pagamento (SEPLAG)",
          status: "Agendado",
        },
        {
          periodo: "22/06 - 22/06 - 17:00",
          descricao: "Consolidação",
          status: "Concluído",
        },
        {
          periodo: "03/06 - 03/06 - 18:00",
          descricao: "Limite para solicitação de retransmissão de pagamento",
          status: "Agendado",
        },
      ],
    },
    {
      id: 2,
      titulo: "Rescisão - Folha 31",
      marcador: "is-rescission",
      observacao:
        "Os desligamentos ocorridos após o dia 14/06/2026 serão processados na Folha Rescisória 32 de junho/2026.",
      eventos: [
        {
          periodo: "14/06 - 14/06 - 18:00",
          descricao: "Processamento da folha - desligamentos até 14/05",
          status: "Em Andamento",
        },
        {
          periodo: "15/06 - 15/06 - 11:00",
          descricao: "Limite para solicitação de cancelamento de pagamento",
          status: "Agendado",
        },
        {
          periodo: "18/06 - 18/06 - 17:00",
          descricao: "Consolidação",
          status: "Concluído",
        },
      ],
    },
  ]);

  useEffect(() => {
    const cronograma = loadFolhaCronogramaState();
    setTituloCicloFolha(cronograma.tituloCiclo);
    setCronogramasFolha(cronograma.secoes);
  }, []);

  const abrirNovoInformativo = () => {
    setInformativoEdicaoId(null);
    setNovoInformativo({
      titulo: "",
      tipo: "Informação",
      texto: "",
    });
    setHomeFormError("");
    setModalNovoInformativoAberto(true);
  };

  const abrirNovoCronograma = () => {
    setHomeFormError("");
    navigate("/prototipos/folha/cronograma");
  };

  const getTipoInformativo = (
    informativo: (typeof informativosFolha)[number],
  ) =>
    Object.entries(informativoTipoMeta).find(
      ([, meta]) => meta.icon === informativo.icon,
    )?.[0] ?? "Informação";

  const abrirEditarInformativo = (
    informativo: (typeof informativosFolha)[number],
  ) => {
    setInformativoEdicaoId(informativo.id);
    setNovoInformativo({
      titulo: informativo.titulo,
      tipo: getTipoInformativo(informativo),
      texto: informativo.texto,
    });
    setHomeFormError("");
    setModalNovoInformativoAberto(true);
  };

  const removerInformativo = (informativoId: number) => {
    if (!window.confirm("Confirmar exclusão do informativo?")) return;

    setInformativosFolha((current) =>
      current.filter((informativo) => informativo.id !== informativoId),
    );
    setHomeFormError("Informativo removido com sucesso.");
  };

  const salvarInformativo = () => {
    if (!novoInformativo.titulo.trim() || !novoInformativo.texto.trim()) {
      setHomeFormError("Preencha todos os campos obrigatórios.");
      return;
    }

    const meta = informativoTipoMeta[novoInformativo.tipo];

    if (informativoEdicaoId) {
      setInformativosFolha((current) =>
        current.map((informativo) =>
          informativo.id === informativoEdicaoId
            ? {
                ...informativo,
                icon: meta.icon,
                titulo: novoInformativo.titulo.trim(),
                texto: novoInformativo.texto.trim(),
                destaque: meta.destaque,
              }
            : informativo,
        ),
      );
      setModalNovoInformativoAberto(false);
      setInformativoEdicaoId(null);
      setHomeFormError("Informativo atualizado com sucesso.");
      return;
    }

    setInformativosFolha((current) => [
      {
        id: Math.max(...current.map((item) => item.id), 0) + 1,
        icon: meta.icon,
        titulo: novoInformativo.titulo.trim(),
        dataPostagem: new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date()),
        texto: novoInformativo.texto.trim(),
        destaque: meta.destaque,
      },
      ...current,
    ]);
    setModalNovoInformativoAberto(false);
    setHomeFormError("Informativo cadastrado com sucesso.");
  };

  const parsePeriodoEvento = (periodo: string) => {
    const partes = periodo
      .split(" - ")
      .map((item) => item.trim());

    if (partes.length >= 3) {
      const [dataInicio = "", dataFim = "", horario = ""] = partes;
      return { dataInicio, dataFim, horario };
    }

    const [dataInicio = "", dataFim = ""] = partes;
    const horario = dataFim.match(/\b\d{2}:\d{2}\b/)?.[0] ?? "";

    return { dataInicio, dataFim, horario };
  };

  const getEventoPeriodoCampos = (periodo: string) => {
    const { dataInicio, dataFim, horario } = parsePeriodoEvento(periodo);
    const normalizarDataHora = (value: string) => {
      if (!value) return "";
      if (/\d{4}/.test(value)) return value;

      return `${value}/2026${horario ? ` ${horario}` : ""}`.trim();
    };

    return {
      dataInicio: normalizarDataHora(dataInicio),
      dataFim: normalizarDataHora(dataFim),
    };
  };

  const formatPeriodoCronogramaDisplay = (periodo: string) => {
    const { dataInicio, dataFim } = getEventoPeriodoCampos(periodo);
    const dataInicioCurta = dataInicio.match(/\d{2}\/\d{2}/)?.[0] ?? "";
    const dataFimCurta = dataFim.match(/\d{2}\/\d{2}/)?.[0] ?? "";
    const horario = dataFim.match(/\b\d{2}:\d{2}\b/)?.[0]
      ?? dataInicio.match(/\b\d{2}:\d{2}\b/)?.[0]
      ?? "";

    return [dataInicioCurta, dataFimCurta, horario]
      .filter(Boolean)
      .join(" - ");
  };

  const adicionarEventoCronograma = (cronogramaId: number) => {
    setCronogramasFolha((current) =>
      current.map((cronograma) =>
        cronograma.id === cronogramaId
          ? {
              ...cronograma,
              eventos: [
                ...cronograma.eventos,
                {
                  periodo: "",
                  descricao: "",
                  status: "Agendado",
                },
              ],
            }
          : cronograma,
      ),
    );
    setHomeFormError("Novo evento adicionado. Preencha os campos na lista.");
  };

  const removerEvento = (cronogramaId: number, eventoIndex: number) => {
    if (!window.confirm("Confirmar exclusão do evento?")) return;

    setCronogramasFolha((current) =>
      current
        .map((cronograma) =>
          cronograma.id === cronogramaId
            ? {
                ...cronograma,
                eventos: cronograma.eventos.filter((_, index) => index !== eventoIndex),
              }
            : cronograma,
        ),
    );
    setHomeFormError("Evento removido com sucesso.");
  };

  const atualizarEventoCronograma = (
    cronogramaId: number,
    eventoIndex: number,
    changes: Partial<{ periodo: string; descricao: string }>,
  ) => {
    setCronogramasFolha((current) =>
      current.map((cronograma) =>
        cronograma.id === cronogramaId
          ? {
              ...cronograma,
              eventos: cronograma.eventos.map((evento, index) =>
                index === eventoIndex ? { ...evento, ...changes } : evento,
              ),
            }
          : cronograma,
      ),
    );
  };

  const atualizarPeriodoEventoCronograma = (
    cronogramaId: number,
    eventoIndex: number,
    field: "dataInicio" | "dataFim",
    value: string,
    periodo: string,
  ) => {
    const periodoAtual = getEventoPeriodoCampos(periodo);
    const proximoPeriodo = {
      ...periodoAtual,
      [field]: value,
    };

    atualizarEventoCronograma(cronogramaId, eventoIndex, {
      periodo: `${proximoPeriodo.dataInicio} - ${proximoPeriodo.dataFim}`,
    });
  };

  const atualizarSessaoCronograma = (
    cronogramaId: number,
    changes: Partial<{ titulo: string; observacao: string }>,
  ) => {
    setCronogramasFolha((current) =>
      current.map((cronograma) =>
        cronograma.id === cronogramaId
          ? { ...cronograma, ...changes }
          : cronograma,
      ),
    );
  };

  const moverEventoCronograma = (
    cronogramaId: number,
    origemIndex: number,
    destinoIndex: number,
  ) => {
    if (origemIndex === destinoIndex) return;

    setCronogramasFolha((current) =>
      current.map((cronograma) => {
        if (cronograma.id !== cronogramaId) return cronograma;

        const eventos = [...cronograma.eventos];
        const [evento] = eventos.splice(origemIndex, 1);
        eventos.splice(destinoIndex, 0, evento);

        return { ...cronograma, eventos };
      }),
    );
  };

  const adicionarSessaoCronograma = () => {
    const cores = ["is-main", "is-rescission"];
    const corAleatoria = cores[Math.floor(Math.random() * cores.length)];

    setCronogramasFolha((current) => [
      {
        id: Math.max(...current.map((item) => item.id), 0) + 1,
        titulo: `Nova sessão ${current.length + 1}`,
        marcador: corAleatoria,
        observacao: "",
        eventos: [],
      },
      ...current,
    ]);
    setHomeFormError("Nova sessão adicionada.");
  };

  const removerCronograma = (cronogramaId: number) => {
    if (!window.confirm("Confirmar exclusão da sessão e seus eventos?")) return;

    setCronogramasFolha((current) =>
      current.filter((cronograma) => cronograma.id !== cronogramaId),
    );
    setHomeFormError("Sessão removida com sucesso.");
  };

  const parseDataCronograma = (data: string, horario = "00:00") => {
    const parseDiaMes = (value: string) => {
      const [datePart = "", timePart = ""] = value.trim().split(/\s+/);
      const [dia, mes, ano = 2026] = datePart.split("/").map(Number);
      const horarioBase = timePart || horario;
      const [hora = 0, minuto = 0] = horarioBase.split(":").map(Number);
      if (!dia || !mes) return null;
      return { dia, mes, ano, hora, minuto };
    };
    const parsedData = parseDiaMes(data.trim());

    if (!parsedData) return null;
    return new Date(
      parsedData.ano,
      parsedData.mes - 1,
      parsedData.dia,
      parsedData.hora,
      parsedData.minuto,
    );
  };

  const isPeriodoCronogramaValido = (dataInicio: string, dataFim: string) => {
    const inicio = parseDataCronograma(dataInicio);
    const fim = parseDataCronograma(dataFim);

    if (!inicio || !fim) return true;
    return fim.getTime() >= inicio.getTime();
  };

  const calcularStatusCronograma = (
    dataInicio: string,
    dataFim: string,
    horario = "23:59",
  ) => {
    const agora = new Date().getTime();
    const inicio = parseDataCronograma(dataInicio, "00:00")?.getTime();
    const fim = parseDataCronograma(dataFim, horario)?.getTime();

    if (!inicio || !fim) return "Agendado";
    if (agora < inicio) return "Agendado";
    if (agora > fim) return "Concluído";
    return "Em Andamento";
  };

  const getStatusEventoCronograma = (periodo: string) => {
    const { dataInicio, dataFim, horario } = parsePeriodoEvento(periodo);
    return calcularStatusCronograma(dataInicio, dataFim, horario);
  };

  const renderEventoStatusTag = (periodo: string) => {
    const status = getStatusEventoCronograma(periodo);

    return (
      <strong
        className={`prototype-folha-home-event-tag is-${status
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")
          .toLowerCase()}`}
      >
        {status}
      </strong>
    );
  };

  return (
    <PrototypeSystemPage
      nomeSistema={isGestaoPessoas ? "GESTÃO DE PESSOAS" : "FOLHA"}
      ambienteSistema="Teste"
      menuItems={isGestaoPessoas ? menuGestaoPessoas : menuFolha}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <div className="prototype-folha-home-page">
          <section className="prototype-folha-home-panel prototype-folha-home-panel--info">
            <header className="prototype-folha-home-panel-header">
              <div className="prototype-folha-home-panel-heading">
                <i className="pi pi-clipboard" aria-hidden="true" />
                <h2>Informativos</h2>
              </div>
            </header>

            <div className="prototype-folha-home-panel-body">
              {modoEdicaoHomeFolha ? (
                <div className="prototype-folha-home-panel-toolbar">
                  <BotaoSeplag
                    type="button"
                    label="Novo Informativo"
                    icon="pi pi-plus"
                    className="prototype-folha-home-full-action"
                    onClick={abrirNovoInformativo}
                  />
                </div>
              ) : null}

              <div className="prototype-folha-home-info-list">
                {informativosFolha.map((informativo) => (
                  <article
                    key={informativo.id}
                    className="prototype-folha-home-info-card"
                  >
                    <h3>
                      <i
                        className={`${informativo.icon} ${informativo.destaque}`}
                        aria-hidden="true"
                      />
                      {informativo.titulo}
                    </h3>
                    <time>{informativo.dataPostagem}</time>
                    <p>{informativo.texto}</p>
                    {modoEdicaoHomeFolha ? (
                      <div className="prototype-folha-home-inline-actions">
                        <button
                          type="button"
                          onClick={() => abrirEditarInformativo(informativo)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => removerInformativo(informativo.id)}
                        >
                          Remover
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="prototype-folha-home-panel prototype-folha-home-panel--schedule">
            <header className="prototype-folha-home-panel-header">
              <div className="prototype-folha-home-panel-heading">
                <i className="pi pi-calendar" aria-hidden="true" />
                <h2>{tituloCicloFolha}</h2>
              </div>
              <button
                type="button"
                className={`prototype-folha-home-edit-toggle ${
                  modoEdicaoHomeFolha ? "is-active" : ""
                }`}
                aria-pressed={modoEdicaoHomeFolha}
                onClick={() =>
                  setModoEdicaoHomeFolha((current) => !current)
                }
              >
                <span>{modoEdicaoHomeFolha ? "Modo edição" : "Visualização"}</span>
                <i
                  className={modoEdicaoHomeFolha ? "pi pi-check" : "pi pi-lock"}
                  aria-hidden="true"
                />
              </button>
            </header>

            <div className="prototype-folha-home-panel-body">
              {modoEdicaoHomeFolha ? (
                <div className="prototype-folha-home-panel-toolbar">
                  <BotaoSeplag
                    type="button"
                    label="Configurar Cronograma"
                    icon="pi pi-cog"
                    className="prototype-folha-home-full-action"
                    onClick={abrirNovoCronograma}
                  />
                </div>
              ) : null}

              <div className="prototype-folha-home-schedule-list">
                {cronogramasFolha.map((cronograma) => (
                  <section
                    key={cronograma.id}
                    className="prototype-folha-home-schedule-group"
                  >
                    <div className="prototype-folha-home-schedule-title">
                      <div className="prototype-folha-home-schedule-name">
                        <span
                          className={`prototype-folha-home-schedule-dot ${cronograma.marcador}`}
                          aria-hidden="true"
                        />
                        <h3>{cronograma.titulo}</h3>
                        <small>{cronograma.eventos.length} eventos</small>
                      </div>
                    </div>

                    <div className="prototype-folha-home-schedule-events">
                      {cronograma.eventos.map((evento, eventoIndex) => (
                        <div
                          key={`${cronograma.id}-${evento.periodo}-${evento.descricao}`}
                          className="prototype-folha-home-schedule-event"
                        >
                          <time>{formatPeriodoCronogramaDisplay(evento.periodo)}</time>
                          <span>{evento.descricao}</span>
                          {renderEventoStatusTag(evento.periodo)}
                        </div>
                      ))}
                    </div>

                    {cronograma.observacao ? (
                      <div className="prototype-folha-home-schedule-note">
                        <i className="pi pi-clock" aria-hidden="true" />
                        <span>{cronograma.observacao}</span>
                      </div>
                    ) : null}
                  </section>
                ))}
              </div>
            </div>
          </section>
        </div>

        <ModalSeplag
          visible={modalNovoInformativoAberto}
          titulo={informativoEdicaoId ? "Editar Informativo" : "Novo Informativo"}
          fechar={() => {
            setModalNovoInformativoAberto(false);
            setInformativoEdicaoId(null);
          }}
          tamanho="620px"
          hideFooter
        >
          <div className="col-12 prototype-folha-home-modal-form">
            {homeFormError ? <div className="prototype-form-feedback">{homeFormError}</div> : null}
            <label>
              Título
              <input
                type="text"
                value={novoInformativo.titulo}
                onChange={(event) =>
                  setNovoInformativo((current) => ({
                    ...current,
                    titulo: event.target.value,
                  }))
                }
              />
            </label>
            <div className="prototype-folha-home-icon-picker">
              <span>Ícone</span>
              <div>
                {Object.entries(informativoTipoMeta).map(([tipo, meta]) => (
                  <button
                    key={tipo}
                    type="button"
                    className={novoInformativo.tipo === tipo ? "is-selected" : ""}
                    title={tipo}
                    onClick={() =>
                      setNovoInformativo((current) => ({
                        ...current,
                        tipo,
                      }))
                    }
                  >
                    <i className={meta.icon} aria-hidden="true" />
                    <small>{tipo}</small>
                  </button>
                ))}
              </div>
            </div>
            <label>
              Texto
              <textarea
                rows={4}
                value={novoInformativo.texto}
                onChange={(event) =>
                  setNovoInformativo((current) => ({
                    ...current,
                    texto: event.target.value,
                  }))
                }
              />
            </label>
            <div className="prototype-folha-home-modal-actions">
              <BotaoVoltarSeplag
                type="button"
                label="Cancelar"
                onClick={() => {
                  setModalNovoInformativoAberto(false);
                  setInformativoEdicaoId(null);
                }}
              />
              <BotaoSalvarSeplag
                type="button"
                label={informativoEdicaoId ? "Salvar" : "Adicionar"}
                icon="pi pi-check"
                onClick={salvarInformativo}
              />
            </div>
          </div>
        </ModalSeplag>

      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaCronogramaPage() {
  const navigate = useNavigate();
  const cronogramaInicial = loadFolhaCronogramaState();
  const [tituloCiclo, setTituloCiclo] = useState(cronogramaInicial.tituloCiclo);
  const [homeFormError, setHomeFormError] = useState("");
  const [eventoArrastado, setEventoArrastado] = useState<{
    cronogramaId: number;
    eventoIndex: number;
  } | null>(null);
  const [secaoArrastadaId, setSecaoArrastadaId] = useState<number | null>(null);
  const [cronogramasFolha, setCronogramasFolha] =
    useState<FolhaCronogramaSecao[]>(cronogramaInicial.secoes);

  useEffect(() => {
    saveFolhaCronogramaState({
      tituloCiclo,
      secoes: cronogramasFolha,
    });
  }, [tituloCiclo, cronogramasFolha]);

  const parsePeriodoEvento = (periodo: string) => {
    const partes = periodo.split(" - ").map((item) => item.trim());

    if (partes.length >= 3) {
      const [dataInicio = "", dataFim = "", horario = ""] = partes;
      return { dataInicio, dataFim, horario };
    }

    const [dataInicio = "", dataFim = ""] = partes;
    const horario = dataFim.match(/\b\d{2}:\d{2}\b/)?.[0] ?? "";

    return { dataInicio, dataFim, horario };
  };

  const getEventoPeriodoCampos = (periodo: string) => {
    const { dataInicio, dataFim, horario } = parsePeriodoEvento(periodo);
    const normalizarDataHora = (value: string) => {
      if (!value) return "";
      if (/\d{4}/.test(value)) return value;

      return `${value}/2026${horario ? ` ${horario}` : ""}`.trim();
    };

    return {
      dataInicio: normalizarDataHora(dataInicio),
      dataFim: normalizarDataHora(dataFim),
    };
  };

  const adicionarEventoCronograma = (cronogramaId: number) => {
    setCronogramasFolha((current) =>
      current.map((cronograma) =>
        cronograma.id === cronogramaId
          ? {
              ...cronograma,
              eventos: [
                ...cronograma.eventos,
                {
                  periodo: "",
                  descricao: "",
                  status: "Agendado",
                },
              ],
            }
          : cronograma,
      ),
    );
    setHomeFormError("Novo evento adicionado. Preencha os campos na lista.");
  };

  const removerEvento = (cronogramaId: number, eventoIndex: number) => {
    if (!window.confirm("Confirmar exclusão do evento?")) return;

    setCronogramasFolha((current) =>
      current.map((cronograma) =>
        cronograma.id === cronogramaId
          ? {
              ...cronograma,
              eventos: cronograma.eventos.filter((_, index) => index !== eventoIndex),
            }
          : cronograma,
      ),
    );
    setHomeFormError("Evento removido com sucesso.");
  };

  const atualizarEventoCronograma = (
    cronogramaId: number,
    eventoIndex: number,
    changes: Partial<{ periodo: string; descricao: string }>,
  ) => {
    setCronogramasFolha((current) =>
      current.map((cronograma) =>
        cronograma.id === cronogramaId
          ? {
              ...cronograma,
              eventos: cronograma.eventos.map((evento, index) =>
                index === eventoIndex ? { ...evento, ...changes } : evento,
              ),
            }
          : cronograma,
      ),
    );
  };

  const atualizarPeriodoEventoCronograma = (
    cronogramaId: number,
    eventoIndex: number,
    field: "dataInicio" | "dataFim",
    value: string,
    periodo: string,
  ) => {
    const periodoAtual = getEventoPeriodoCampos(periodo);
    const proximoPeriodo = {
      ...periodoAtual,
      [field]: value,
    };

    atualizarEventoCronograma(cronogramaId, eventoIndex, {
      periodo: `${proximoPeriodo.dataInicio} - ${proximoPeriodo.dataFim}`,
    });
  };

  const atualizarSessaoCronograma = (
    cronogramaId: number,
    changes: Partial<{ titulo: string; observacao: string }>,
  ) => {
    setCronogramasFolha((current) =>
      current.map((cronograma) =>
        cronograma.id === cronogramaId
          ? { ...cronograma, ...changes }
          : cronograma,
      ),
    );
  };

  const moverEventoCronograma = (
    cronogramaId: number,
    origemIndex: number,
    destinoIndex: number,
  ) => {
    if (origemIndex === destinoIndex) return;

    setCronogramasFolha((current) =>
      current.map((cronograma) => {
        if (cronograma.id !== cronogramaId) return cronograma;

        const eventos = [...cronograma.eventos];
        const [evento] = eventos.splice(origemIndex, 1);
        eventos.splice(destinoIndex, 0, evento);

        return { ...cronograma, eventos };
      }),
    );
  };

  const moverSecaoCronograma = (origemId: number, destinoId: number) => {
    if (origemId === destinoId) return;

    setCronogramasFolha((current) => {
      const origemIndex = current.findIndex((secao) => secao.id === origemId);
      const destinoIndex = current.findIndex((secao) => secao.id === destinoId);
      if (origemIndex < 0 || destinoIndex < 0) return current;

      const secoes = [...current];
      const [secao] = secoes.splice(origemIndex, 1);
      secoes.splice(destinoIndex, 0, secao);
      return secoes;
    });
  };

  const adicionarSessaoCronograma = () => {
    const cores = ["is-main", "is-rescission"];
    const corAleatoria = cores[Math.floor(Math.random() * cores.length)];

    setCronogramasFolha((current) => [
      ...current,
      {
        id: Math.max(...current.map((item) => item.id), 0) + 1,
        titulo: `Nova seção ${current.length + 1}`,
        marcador: corAleatoria,
        observacao: "",
        eventos: [],
      },
    ]);
    setHomeFormError("Nova seção adicionada.");
  };

  const removerCronograma = (cronogramaId: number) => {
    if (!window.confirm("Confirmar exclusão da seção e seus eventos?")) return;

    setCronogramasFolha((current) =>
      current.filter((cronograma) => cronograma.id !== cronogramaId),
    );
    setHomeFormError("Seção removida com sucesso.");
  };

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-folha-cronograma-page">
        <CardSeplag
          title="Configurar cronograma"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="prototype-folha-home-schedule-config prototype-folha-home-schedule-config--page">
            <label className="prototype-folha-cronograma-title-field">
              Título do ciclo
              <input
                type="text"
                value={tituloCiclo}
                onChange={(event) => setTituloCiclo(event.target.value)}
              />
            </label>
            {homeFormError ? (
              <div className="prototype-form-feedback">{homeFormError}</div>
            ) : null}
            <div className="prototype-folha-home-config-list">
              {cronogramasFolha.map((cronograma) => (
                <div
                  key={cronograma.id}
                  className={`prototype-folha-home-config-section ${
                    secaoArrastadaId === cronograma.id ? "is-dragging" : ""
                  }`}
                  onDragOver={(event) => {
                    if (secaoArrastadaId) event.preventDefault();
                  }}
                  onDrop={() => {
                    if (secaoArrastadaId) {
                      moverSecaoCronograma(secaoArrastadaId, cronograma.id);
                      setSecaoArrastadaId(null);
                    }
                  }}
                >
                  <div className="prototype-folha-home-config-section-head">
                    <i
                      className="pi pi-bars prototype-folha-home-drag-handle"
                      aria-hidden="true"
                      draggable
                      onDragStart={() => setSecaoArrastadaId(cronograma.id)}
                      onDragEnd={() => setSecaoArrastadaId(null)}
                    />
                    <label className="prototype-folha-home-config-title-field">
                      <span className="prototype-folha-home-visually-hidden">
                        Título da seção
                      </span>
                      <input
                        type="text"
                        aria-label="Título da sessão"
                        value={cronograma.titulo}
                        className="prototype-folha-home-session-input"
                        onChange={(event) =>
                          atualizarSessaoCronograma(cronograma.id, {
                            titulo: event.target.value,
                          })
                        }
                      />
                    </label>
                    <div className="prototype-folha-home-icon-actions">
                      <BotaoSeplag
                        type="button"
                        label="Adicionar evento"
                        icon="pi pi-plus"
                        onClick={() => adicionarEventoCronograma(cronograma.id)}
                      />
                      <BotaoIconSeplag
                        type="button"
                        tooltip="Remover sessão"
                        icon="pi pi-trash"
                        style={{
                          backgroundColor: "#d32f2f",
                          borderColor: "#d32f2f",
                          color: "#ffffff",
                        }}
                        onClick={() => removerCronograma(cronograma.id)}
                      />
                    </div>
                  </div>

                  <label className="prototype-folha-home-config-observation-field">
                    <span>Observação</span>
                    <textarea
                      aria-label="Observação da seção"
                      value={cronograma.observacao ?? ""}
                      rows={3}
                      onChange={(event) =>
                        atualizarSessaoCronograma(cronograma.id, {
                          observacao: event.target.value,
                        })
                      }
                    />
                  </label>

                  <div className="prototype-folha-home-config-event-header">
                    <span />
                    <span>Data início</span>
                    <span>Data fim</span>
                    <span>Descrição</span>
                    <span />
                  </div>
                  <div className="prototype-folha-home-config-events">
                    {cronograma.eventos.map((evento, eventoIndex) => {
                      const periodoCampos = getEventoPeriodoCampos(evento.periodo);

                      return (
                        <div
                          key={`${cronograma.id}-${eventoIndex}-${evento.periodo}-${evento.descricao}`}
                          className="prototype-folha-home-config-event"
                          draggable
                          onDragStart={() =>
                            setEventoArrastado({
                              cronogramaId: cronograma.id,
                              eventoIndex,
                            })
                          }
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => {
                            if (eventoArrastado?.cronogramaId === cronograma.id) {
                              moverEventoCronograma(
                                cronograma.id,
                                eventoArrastado.eventoIndex,
                                eventoIndex,
                              );
                            }
                            setEventoArrastado(null);
                          }}
                          onDragEnd={() => setEventoArrastado(null)}
                        >
                          <i
                            className="pi pi-bars prototype-folha-home-drag-handle"
                            aria-hidden="true"
                          />
                          <label>
                            <input
                              type="text"
                              aria-label="Data início do evento"
                              placeholder="dd/mm/aaaa 17:00"
                              value={periodoCampos.dataInicio}
                              onChange={(event) =>
                                atualizarPeriodoEventoCronograma(
                                  cronograma.id,
                                  eventoIndex,
                                  "dataInicio",
                                  event.target.value,
                                  evento.periodo,
                                )
                              }
                            />
                          </label>
                          <label>
                            <input
                              type="text"
                              aria-label="Data fim do evento"
                              placeholder="dd/mm/aaaa 18:00"
                              value={periodoCampos.dataFim}
                              onChange={(event) =>
                                atualizarPeriodoEventoCronograma(
                                  cronograma.id,
                                  eventoIndex,
                                  "dataFim",
                                  event.target.value,
                                  evento.periodo,
                                )
                              }
                            />
                          </label>
                          <label>
                            <input
                              type="text"
                              aria-label="Descrição do evento"
                              value={evento.descricao}
                              onChange={(event) =>
                                atualizarEventoCronograma(
                                  cronograma.id,
                                  eventoIndex,
                                  { descricao: event.target.value },
                                )
                              }
                            />
                          </label>
                          <button
                            type="button"
                            className="prototype-folha-home-config-remove"
                            aria-label="Remover evento"
                            title="Remover evento"
                            onClick={() => removerEvento(cronograma.id, eventoIndex)}
                          >
                            <i className="pi pi-times" aria-hidden="true" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="prototype-folha-home-config-add-section"
              onClick={adicionarSessaoCronograma}
            >
              <i className="pi pi-plus" aria-hidden="true" />
              Nova seção
            </button>
            <div className="prototype-folha-home-modal-actions">
              <BotaoVoltarSeplag
                type="button"
                label="Voltar"
                onClick={() => navigate(FOLHA_PAINEL_INFORMATIVO_PATH)}
              />
              <BotaoSalvarSeplag
                type="button"
                label="Salvar"
                icon="pi pi-save"
                onClick={() => {
                  saveFolhaCronogramaState({
                    tituloCiclo,
                    secoes: cronogramasFolha,
                  });
                  navigate(FOLHA_PAINEL_INFORMATIVO_PATH);
                }}
              />
            </div>
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaTabelasReferenciaPage() {
  const navigate = useNavigate();
  const { control, reset, watch } = useForm<FolhaTabelaReferenciaFiltroForm>({
    defaultValues: {
      tabela: "",
    },
  });
  const [linhasExpandidas, setLinhasExpandidas] = useState<number[]>([]);
  const [valoresExpandidos, setValoresExpandidos] = useState<string[]>([]);
  const [filtrosVigencia, setFiltrosVigencia] = useState<
    Record<number, { ano: string; status: "" | FolhaTabelaReferenciaVigenciaRow["situacao"] }>
  >({});
  const [feedback, setFeedback] = useState("");
  const [tabelasReferencia, setTabelasReferencia] = useState<
    FolhaTabelaReferenciaRow[]
  >(() => getFolhaTabelasReferenciaPersistidas());
  const [perfilIngressos, setPerfilIngressos] = useState<IngressoPerfil>("PROVIMENTO");
  const filtros = watch();
  const termoTabela = filtros.tabela?.trim().toLowerCase() ?? "";

  useEffect(() => {
    setTabelasReferencia(getFolhaTabelasReferenciaPersistidas());
  }, []);

  const tabelasListagem = getFolhaTabelasReferenciaListagem(tabelasReferencia);
  const tabelasFiltradas = tabelasListagem.filter((tabela) => {
    const descricao = (tabela.sigla + " " + tabela.nome).toLowerCase();
    const vigenciasDescricao = tabela.vigencias
      .map((vigencia) => `${vigencia.nome ?? ""} ${vigencia.regraIncidencia ?? ""}`)
      .join(" ")
      .toLowerCase();
    return !termoTabela || descricao.includes(termoTabela) || vigenciasDescricao.includes(termoTabela);
  });

  const toggleTabela = (id: number) => {
    setLinhasExpandidas((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleValorReferencia = (codigo: string) => {
    setValoresExpandidos((current) =>
      current.includes(codigo)
        ? current.filter((item) => item !== codigo)
        : [...current, codigo],
    );
  };

  const getFolhaTabelaReferenciaRouteId = (tabela: FolhaTabelaReferenciaRow) =>
    tabela.sigla === "RPPS" && tabela.tabelaBaseId ? tabela.id : tabela.tabelaBaseId ?? tabela.id;

  const renderSituacaoTabelaReferencia = (
    situacao: FolhaTabelaReferenciaVigenciaRow["situacao"],
  ) => {
    const badgeClass =
      situacao === "Ativo"
        ? "prototype-badge prototype-badge--success"
        : "prototype-badge prototype-badge--danger";

    return <span className={badgeClass}>{situacao}</span>;
  };

  const renderAcoesVigenciaTabela = (
    tabela: FolhaTabelaReferenciaRow,
    vigencia: FolhaTabelaReferenciaVigenciaRow,
  ) => (
    <div className="prototype-folha-referencia-actions">
      <BotaoIconSeplag
        type="button"
        tooltip="Visualizar vigência"
        icon="pi pi-eye"
        onClick={() =>
          setFeedback("Visualização da vigência " + vigencia.ano + " selecionada.")
        }
      />
      <BotaoIconSeplag
        severity="warning"
        type="button"
        tooltip="Editar vigência"
        icon="pi pi-pencil"
        onClick={() =>
          navigate(
            getFolhaTabelaReferenciaEditarVigenciaPath(
              getFolhaTabelaReferenciaRouteId(tabela),
              vigencia.id,
            ),
          )
        }
      />
    </div>
  );

  const renderAcoesVigenciaValor = (
    valor: FolhaValorReferenciaRow,
    vigencia: FolhaValorReferenciaVigenciaRow,
  ) => (
    <div className="prototype-folha-referencia-actions">
      <BotaoIconSeplag
        type="button"
        tooltip="Visualizar vigência"
        icon="pi pi-eye"
        onClick={() =>
          setFeedback("Visualização de " + valor.codigo + " " + vigencia.ano + " selecionada.")
        }
      />
      <BotaoIconSeplag
        severity="warning"
        type="button"
        tooltip="Editar vigência"
        icon="pi pi-pencil"
        onClick={() =>
          navigate(getFolhaValorReferenciaEditarVigenciaPath(valor.codigo, vigencia.id))
        }
      />
    </div>
  );

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-folha-referencia-page">
        {feedback ? (
          <div className="prototype-validation-panel">{feedback}</div>
        ) : null}

        <div className="prototype-folha-parametros-header">
          <h2>Parâmetros de Folha</h2>
          <p>
            Gerencie tabelas complexas e valores de referência utilizados nos cálculos da folha.
          </p>
        </div>

        <CardSeplag
          title="Tabelas de Referência"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="col-12 prototype-folha-referencia-filters">
            <TextFieldSeplag
              name="tabela"
              control={control}
              label="Tabela"
              placeholder="Digite para buscar"
              cols="12 12 4"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-2">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={() => reset({ tabela: "" })}
              />
            </div>
          </div>

          <div className="col-12 prototype-folha-referencia-list">
            <div className="prototype-folha-referencia-list-head" />
            {tabelasFiltradas.length ? (
              tabelasFiltradas.map((tabela) => {
                const isExpanded = linhasExpandidas.includes(tabela.id);
                const filtroVigencia = filtrosVigencia[tabela.id] ?? {
                  ano: "",
                  status: "",
                };
                const vigenciasFiltradas = tabela.vigencias.filter((vigencia) => {
                  const atendeAno =
                    !filtroVigencia.ano.trim() ||
                    vigencia.ano
                      .toLowerCase()
                      .includes(filtroVigencia.ano.trim().toLowerCase());
                  const atendeStatus =
                    !filtroVigencia.status ||
                    vigencia.situacao === filtroVigencia.status;

                  return atendeAno && atendeStatus;
                });
                const isTabelaRppsListagem = tabela.sigla === "RPPS";
                const titulo = isTabelaRppsListagem && tabela.tabelaBaseId
                  ? tabela.nome
                  : tabela.nome
                    ? tabela.sigla + "- " + tabela.nome
                    : tabela.sigla;

                return (
                  <div className="prototype-folha-referencia-row" key={tabela.id}>
                    <div className="prototype-folha-referencia-row-main">
                      <strong>{titulo}</strong>
                      <div className="prototype-folha-referencia-row-actions">
                        <BotaoSeplag
                          type="button"
                          label="Nova Vigência"
                          icon="pi pi-plus"
                          onClick={() =>
                            navigate(getFolhaTabelaReferenciaNovaVigenciaPath(getFolhaTabelaReferenciaRouteId(tabela)))
                          }
                        />
                        <button
                          type="button"
                          className="prototype-folha-referencia-expand"
                          aria-label={
                            isExpanded ? "Recolher vigências" : "Expandir vigências"
                          }
                          onClick={() => toggleTabela(tabela.id)}
                        >
                          <i
                            className={"pi " + (isExpanded ? "pi-chevron-up" : "pi-chevron-down")}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="prototype-folha-referencia-vigencias">
                        <div className="prototype-folha-referencia-vigencia-filters">
                          <label>
                            <span>Ano</span>
                            <input
                              type="text"
                              placeholder="Digite para buscar"
                              value={filtroVigencia.ano}
                              onChange={(event) =>
                                setFiltrosVigencia((current) => ({
                                  ...current,
                                  [tabela.id]: {
                                    ...filtroVigencia,
                                    ano: event.target.value,
                                  },
                                }))
                              }
                            />
                          </label>
                          <label>
                            <span>Status</span>
                            <select
                              value={filtroVigencia.status}
                              onChange={(event) =>
                                setFiltrosVigencia((current) => ({
                                  ...current,
                                  [tabela.id]: {
                                    ...filtroVigencia,
                                    status: event.target
                                      .value as typeof filtroVigencia.status,
                                  },
                                }))
                              }
                            >
                              <option value="">Selecione...</option>
                              <option value="Agendado">Agendado</option>
                              <option value="Ativo">Ativo</option>
                              <option value="Encerrado">Encerrado</option>
                              <option value="Inativo">Inativo</option>
                            </select>
                          </label>
                          <BotaoLimparFiltroSeplag
                            type="button"
                            label="Limpar"
                            icon="pi pi-refresh"
                            onClick={() =>
                              setFiltrosVigencia((current) => ({
                                ...current,
                                [tabela.id]: { ano: "", status: "" },
                              }))
                            }
                          />
                        </div>
                        <table className={tabela.sigla === "RPPS" ? "prototype-folha-referencia-vigencias-rpps" : undefined}>
                          <thead>
                            <tr>
                              <th>Ano</th>
                              {tabela.sigla === "RPPS" ? <th>Referência</th> : null}
                              {tabela.sigla === "RPPS" ? <th>Percentual/Faixas</th> : null}
                              <th>Vigência</th>
                              <th>Situação</th>
                              <th>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vigenciasFiltradas.map((vigencia) => {
                              const valorReferenciaLabel = vigencia.valorReferenciaId
                                ? folhaTabelaReferenciaValorReferenciaOptions.find(
                                    (option) => option.value === vigencia.valorReferenciaId,
                                  )?.label ?? vigencia.valorReferenciaId
                                : "Não se aplica";
                              const percentualOuFaixas = vigencia.percentualContribuicao
                                ? vigencia.percentualContribuicao + "%"
                                : vigencia.faixasContribuicao?.length
                                  ? vigencia.faixasContribuicao.length + " faixas"
                                  : "-";

                              return (
                                <tr key={vigencia.id}>
                                  <td>{vigencia.ano}</td>
                                  {tabela.sigla === "RPPS" ? <td>{valorReferenciaLabel}</td> : null}
                                  {tabela.sigla === "RPPS" ? <td>{percentualOuFaixas}</td> : null}
                                  <td>{vigencia.vigencia}</td>
                                  <td>{renderSituacaoTabelaReferencia(vigencia.situacao)}</td>
                                  <td>{renderAcoesVigenciaTabela(tabela, vigencia)}</td>
                                </tr>
                              );
                            })}
                            {!vigenciasFiltradas.length ? (
                              <tr>
                                <td colSpan={tabela.sigla === "RPPS" ? 6 : 4} className="prototype-empty-table-cell">
                                  Nenhuma vigência encontrada.
                                </td>
                              </tr>
                            ) : null}
                          </tbody>
                        </table>
                        <div className="prototype-folha-referencia-pagination prototype-folha-referencia-pagination--inner">
                          <button type="button" disabled>
                            <i className="pi pi-angle-double-left" aria-hidden="true" />
                          </button>
                          <button type="button" disabled>
                            <i className="pi pi-angle-left" aria-hidden="true" />
                          </button>
                          <span>1</span>
                          <button type="button" disabled>
                            <i className="pi pi-angle-right" aria-hidden="true" />
                          </button>
                          <button type="button" disabled>
                            <i className="pi pi-angle-double-right" aria-hidden="true" />
                          </button>
                          <select
                            aria-label="Registros por página da vigência"
                            value="10"
                            onChange={() => {}}
                          >
                            <option value="10">10</option>
                          </select>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="prototype-folha-referencia-empty">
                Nenhuma tabela encontrada.
              </div>
            )}
          </div>
        </CardSeplag>

        <CardSeplag
          title="Valores de Referência"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="col-12 prototype-folha-referencia-list prototype-folha-valores-referencia-list">
            <table className="prototype-folha-valores-referencia-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Vigência Atual</th>
                  <th>Valor Atual</th>
                  <th>Situação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {folhaValoresReferenciaMock.map((valor) => {
                  const vigenciaAtual = valor.vigencias[0];
                  const isExpanded = valoresExpandidos.includes(valor.codigo);

                  return (
                    <Fragment key={valor.codigo}>
                      <tr>
                        <td>{valor.codigo}</td>
                        <td>{valor.nome}</td>
                        <td>{valor.tipo}</td>
                        <td>{vigenciaAtual.vigencia}</td>
                        <td>{vigenciaAtual.valor}</td>
                        <td>{renderSituacaoTabelaReferencia(vigenciaAtual.situacao)}</td>
                        <td>
                          <div className="prototype-folha-referencia-actions">
                            <BotaoIconSeplag
                              type="button"
                              tooltip="Nova vigência"
                              icon="pi pi-plus"
                              onClick={() =>
                                navigate(getFolhaValorReferenciaNovaVigenciaPath(valor.codigo))
                              }
                            />
                            <BotaoIconSeplag
                              type="button"
                              tooltip="Visualizar vigência atual"
                              icon="pi pi-eye"
                              onClick={() =>
                                setFeedback("Visualização de " + valor.codigo + " selecionada.")
                              }
                            />
                            <BotaoIconSeplag
                              severity="warning"
                              type="button"
                              tooltip="Editar vigência atual"
                              icon="pi pi-pencil"
                              onClick={() =>
                                navigate(
                                  getFolhaValorReferenciaEditarVigenciaPath(
                                    valor.codigo,
                                    vigenciaAtual.id,
                                  ),
                                )
                              }
                            />
                            <button
                              type="button"
                              className="prototype-folha-referencia-expand prototype-folha-referencia-expand--small"
                              aria-label={
                                isExpanded ? "Recolher vigências" : "Expandir vigências"
                              }
                              onClick={() => toggleValorReferencia(valor.codigo)}
                            >
                              <i
                                className={"pi " + (isExpanded ? "pi-chevron-up" : "pi-chevron-down")}
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded ? (
                        <tr className="prototype-folha-valores-referencia-expanded-row">
                          <td colSpan={7}>
                            <div className="prototype-folha-referencia-vigencias prototype-folha-valores-referencia-vigencias">
                              <table>
                                <thead>
                                  <tr>
                                    <th>Ano</th>
                                    <th>Vigência</th>
                                    <th>Valor</th>
                                    <th>Situação</th>
                                    <th>Ações</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {valor.vigencias.map((vigencia) => (
                                    <tr key={vigencia.id}>
                                      <td>{vigencia.ano}</td>
                                      <td>{vigencia.vigencia}</td>
                                      <td>{vigencia.valor}</td>
                                      <td>{renderSituacaoTabelaReferencia(vigencia.situacao)}</td>
                                      <td>{renderAcoesVigenciaValor(valor, vigencia)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaTabelaReferenciaVigenciaFormPage() {
  const navigate = useNavigate();
  const { tabelaId, vigenciaId } = useParams();
  const tabelasReferencia = getFolhaTabelasReferenciaPersistidas();
  const tabelasReferenciaListagem = getFolhaTabelasReferenciaListagem(tabelasReferencia);
  const tabela =
    tabelasReferenciaListagem.find((item) => String(item.id) === tabelaId) ??
    tabelasReferencia.find((item) => String(item.id) === tabelaId) ??
    tabelasReferencia[0];
  const tabelaRppsBase = tabelasReferencia.find(
    (item) => item.id === FOLHA_TABELA_REFERENCIA_RPPS_BASE_ID,
  );
  const modeloRppsIdRota = Number(tabelaId);
  const isRotaModeloRpps = isFolhaTabelaReferenciaRppsModeloId(modeloRppsIdRota);
  const isTabelaRpps = tabela.sigla === "RPPS" || isRotaModeloRpps;
  const isTabelaIrrf = tabela.id === 2 && tabela.sigla === "IRRF";
  const isTabelaPrevcom = tabela.sigla === "RPC";
  const isEditing = Boolean(vigenciaId);
  const vigenciaAtual = isTabelaRpps
    ? tabelaRppsBase?.vigencias.find((vigencia) => String(vigencia.id) === vigenciaId)
    : tabela.vigencias.find((vigencia) => String(vigencia.id) === vigenciaId);
  const modeloRppsId = isTabelaRpps
    ? isRotaModeloRpps
      ? modeloRppsIdRota
      : getFolhaTabelaReferenciaRppsModeloId(vigenciaAtual ?? tabela.vigencias[0])
    : undefined;
  const modeloRppsAtual = getFolhaTabelaReferenciaRppsModeloById(modeloRppsId);
  const vigenciaFormularioBase = isTabelaRpps
    ? vigenciaAtual
      ? aplicarModeloRppsNaVigencia(vigenciaAtual, modeloRppsAtual)
      : modeloRppsAtual
    : vigenciaAtual;
  const [activeTab, setActiveTab] = useState("dados-gerais");
  const [dadosGeraisSalvos, setDadosGeraisSalvos] = useState(isEditing || isTabelaRpps);
  const [feedback, setFeedback] = useState("");
  const [faixasVigencia, setFaixasVigencia] =
    useState<FolhaTabelaReferenciaFaixaRow[]>(() => {
      if (isTabelaRpps) {
        return vigenciaFormularioBase?.faixasContribuicao?.length
          ? vigenciaFormularioBase.faixasContribuicao
          : getFaixasAutomaticasRppsPorRegra(vigenciaFormularioBase?.regraIncidencia);
      }

      if (isTabelaIrrf) return folhaTabelaReferenciaFaixasIrrfMock;
      return isEditing ? folhaTabelaReferenciaFaixasMock : [];
    });
  const [novaFaixaForm, setNovaFaixaForm] =
    useState<FolhaTabelaReferenciaNovaFaixaForm>({
      faixaFinal: "R$ 0,00",
      percentual: "",
    });
  const [modalNovaFaixaAberto, setModalNovaFaixaAberto] = useState(false);
  const { control, handleSubmit, watch, setValue } = useForm<FolhaTabelaReferenciaVigenciaForm>({
    defaultValues: {
      descricao: vigenciaFormularioBase?.nome ?? (isTabelaRpps ? "Nova regra RPPS" : isTabelaIrrf ? "Tabela mensal do IRRF" : isTabelaPrevcom ? "RPC 2026" : isEditing ? "testeddd" : ""),
      anoBase: vigenciaFormularioBase?.ano ?? (isEditing || isTabelaRpps || isTabelaIrrf ? "2026" : ""),
      aplicavelPara: isTabelaRpps
        ? folhaTabelaReferenciaValuesFromLabels(
            folhaTabelaReferenciaAplicavelParaOptions,
            vigenciaFormularioBase?.aplicavelPara,
          ).length
          ? folhaTabelaReferenciaValuesFromLabels(
              folhaTabelaReferenciaAplicavelParaOptions,
              vigenciaFormularioBase?.aplicavelPara,
            )
          : ["ATIVO"]
        : [],
      situacoesFuncionaisMilitar: folhaTabelaReferenciaValuesFromLabels(
        folhaTabelaReferenciaSituacaoFuncionalMilitarOptions,
        vigenciaFormularioBase?.situacoesFuncionaisMilitar,
      ),
      condicaoEspecial: folhaTabelaReferenciaValueFromLabel(
        folhaTabelaReferenciaCondicaoEspecialOptions,
        vigenciaFormularioBase?.condicaoEspecial,
      ) || (isTabelaRpps ? "NENHUMA" : ""),
      planoPrevidenciario: folhaTabelaReferenciaValueFromLabel(
        folhaTabelaReferenciaPlanoPrevidenciarioOptions,
        vigenciaFormularioBase?.planoPrevidenciario,
      ) || (isTabelaRpps ? "GERAL" : ""),
      tipoCalculo: folhaTabelaReferenciaValueFromLabel(
        folhaTabelaReferenciaTipoCalculoOptions,
        vigenciaFormularioBase?.tipoCalculo,
      ) || (isTabelaRpps ? "VINCULO" : ""),
      regraIncidencia: folhaTabelaReferenciaValueFromLabel(
        folhaTabelaReferenciaRegraIncidenciaOptions,
        vigenciaFormularioBase?.regraIncidencia,
      ) || (isTabelaRpps ? "REMUNERACAO_TOTAL" : ""),
      valorReferenciaId: vigenciaFormularioBase?.valorReferenciaId ?? "",
      limiteProventos: vigenciaFormularioBase?.limiteProventos ?? "",
      proventosAPartirDe: vigenciaFormularioBase?.proventosAPartirDe ?? "",
      proventosAte: vigenciaFormularioBase?.proventosAte ?? "",
      tetoPrevidenciario: vigenciaFormularioBase?.tetoPrevidenciario ?? (isTabelaRpps ? "" : isEditing ? "R$ 8.475,55" : ""),
      percentualContribuicao: vigenciaFormularioBase?.percentualContribuicao ?? (isTabelaRpps ? "14" : ""),
      inicioVigencia: vigenciaFormularioBase?.inicioVigencia ?? (isTabelaRpps ? "02/01/2026" : isTabelaIrrf ? "01/01/2026" : isEditing ? "02/06/2026" : ""),
      fimVigencia: vigenciaFormularioBase?.fimVigencia ?? (isTabelaRpps || isTabelaIrrf ? "31/12/2026" : ""),
      baseLegal: vigenciaFormularioBase?.baseLegal ?? [],
      observacoes: "",
    },
  });
  const regraIncidenciaSelecionada = watch("regraIncidencia");
  const valorReferenciaSelecionado = watch("valorReferenciaId");
  const tetoPrevidenciarioSelecionado = watch("tetoPrevidenciario");
  const percentualContribuicaoSelecionado = watch("percentualContribuicao");
  const isRegraFaixasProgressivas = regraIncidenciaSelecionada === "FAIXAS_PROGRESSIVAS";
  const isRegraIsentoValorReferencia = regraIncidenciaSelecionada === "ISENTO_ATE_VALOR_REFERENCIA";
  const isModeloRppsLc700 = modeloRppsId === 303;
  const isModeloRppsSalarioMinimo = modeloRppsId === 305;
  const isModeloRppsMilitar = modeloRppsId === 307;
  const isValorReferenciaFixoRpps = modeloRppsId === 302;
  const valorReferenciaFixoLabel =
    isValorReferenciaFixoRpps && vigenciaFormularioBase?.valorReferenciaId
      ? folhaTabelaReferenciaValorReferenciaOptions.find(
          (option) => option.value === vigenciaFormularioBase.valorReferenciaId,
        )?.label ?? vigenciaFormularioBase.valorReferenciaId
      : undefined;
  const faixaIsencaoLc700Resumo = getFolhaValorReferenciaAtual("ISENCAO_LC700") ?? "R$ 4.318,01";
  const limiteProventosLc700Resumo =
    getFolhaValorReferenciaAtual("LIMITE_PROVENTOS_LC700") ?? vigenciaFormularioBase?.proventosAte ?? "R$ 11.776,34";
  const salarioMinimoResumo = getFolhaValorReferenciaAtual("SALARIO_MINIMO") ?? "R$ 1.621,00";
  const enquadramentoSalarioMinimoResumo = `Proventos superiores a ${limiteProventosLc700Resumo}`;
  const limitePrevidenciarioMilitarResumo = getFolhaValorReferenciaAtual("LIMITE_PREV_PM_BM") ?? "R$ 11.005,95";
  const percentualLc700Resumo =
    vigenciaFormularioBase?.faixasContribuicao?.find((faixa) => faixa.percentual && faixa.percentual !== "0")?.percentual ?? "14";
  const exibirValorReferenciaSeparadoRpps =
    isTabelaRpps &&
    !isValorReferenciaFixoRpps &&
    !isModeloRppsLc700 &&
    !isModeloRppsSalarioMinimo &&
    !isModeloRppsMilitar &&
    Boolean(vigenciaFormularioBase?.valorReferenciaId);
  const exibirPercentualRpps =
    isTabelaRpps &&
    (isModeloRppsLc700 || (!isRegraFaixasProgressivas && !isRegraIsentoValorReferencia));
  const exibirEnquadramentoProventosRpps = false;
  const exibirTetoPrevidenciario = !isTabelaRpps && !isTabelaIrrf;

  useEffect(() => {
    if (!isTabelaRpps) return;

    const referenciaAutomaticaPorRegra: Partial<
      Record<FolhaTabelaReferenciaRegraIncidencia, string>
    > = {
      ATE_VALOR_REFERENCIA: "LIMITE_PREV_PM_BM",
      ATE_TETO_RGPS: "TETO_RGPS",
      EXCEDENTE_TETO_RGPS: "TETO_RGPS",
      EXCEDENTE_SALARIO_MINIMO: "SALARIO_MINIMO",
    };
    const referenciaAutomatica =
      referenciaAutomaticaPorRegra[
        regraIncidenciaSelecionada as FolhaTabelaReferenciaRegraIncidencia
      ];

    if (referenciaAutomatica && valorReferenciaSelecionado !== referenciaAutomatica) {
      setValue("valorReferenciaId", referenciaAutomatica);
    }

    setFaixasVigencia((current) => {
      if (isModeloRppsSalarioMinimo) {
        const percentual = percentualContribuicaoSelecionado || "14";
        const faixaSalarioMinimo = {
          id: 1,
          ordem: 1,
          faixaInicial: "R$ 11.776,34",
          faixaFinal: "Em aberto",
          percentual,
          contribuicaoFaixa: "Sobre excedente do salário mínimo",
        };

        return current.length === 1 &&
          current[0].faixaInicial === faixaSalarioMinimo.faixaInicial &&
          current[0].faixaFinal === faixaSalarioMinimo.faixaFinal &&
          current[0].percentual === faixaSalarioMinimo.percentual &&
          current[0].contribuicaoFaixa === faixaSalarioMinimo.contribuicaoFaixa
          ? current
          : [faixaSalarioMinimo];
      }

      const possuiFaixaUnicaAberta =
        current.length === 1 &&
        current[0].faixaFinal.trim().toLowerCase() === "em aberto";

      if (isRegraFaixasProgressivas) {
        return possuiFaixaUnicaAberta ? [] : current;
      }

      const percentual = percentualContribuicaoSelecionado || "14";
      const faixasAutomaticas = getFaixasAutomaticasRppsPorRegra(
        regraIncidenciaSelecionada,
        percentual,
      );

      if (
        isFaixasAutomaticasRpps(current) &&
        JSON.stringify(current) === JSON.stringify(faixasAutomaticas)
      ) {
        return current;
      }

      return faixasAutomaticas;
    });
  }, [
    isModeloRppsSalarioMinimo,
    isRegraFaixasProgressivas,
    isTabelaRpps,
    percentualContribuicaoSelecionado,
    regraIncidenciaSelecionada,
    setValue,
    valorReferenciaSelecionado,
  ]);
  const tabsVigencia = (isTabelaIrrf
    ? folhaTabelaReferenciaIrrfTabs
    : folhaTabelaReferenciaVigenciaTabs
  ).map((tab) =>
    (isTabelaIrrf && tab.value !== "dados-gerais") || tab.value === "faixa-contribuicao"
      ? { ...tab, disabled: isTabelaPrevcom || !dadosGeraisSalvos }
      : tab,
  );
  const nomeTituloTabela = isTabelaRpps && vigenciaFormularioBase?.nome ? vigenciaFormularioBase.nome : tabela.nome;
  const tituloTabela =
    isTabelaRpps && nomeTituloTabela?.startsWith("RPPS")
      ? `TABELA - ${nomeTituloTabela}`
      : `TABELA - ${tabela.sigla}${nomeTituloTabela ? ` - ${nomeTituloTabela}` : ""}`;
  const proximaOrdemFaixa = faixasVigencia.length + 1;
  const proximaFaixaInicial = getProximaFaixaInicialReferencia(faixasVigencia);
  const descontoMaximo = faixasVigencia.reduce(
    (total, faixa) => total + parseMoedaReferencia(faixa.contribuicaoFaixa),
    0,
  );
  const referenciaAutomaticaResumo = getReferenciaAutomaticaRppsLabel(regraIncidenciaSelecionada);
  const valorReferenciaAtualResumo = getFolhaValorReferenciaAtual(valorReferenciaSelecionado);
  const referenciaRegraTitulo =
    isTabelaRpps && valorReferenciaSelecionado === "TETO_RGPS"
      ? "Teto RGPS"
      : isTabelaRpps
        ? "Referência da Regra"
        : "Teto Previdenciário";
  const referenciaRegraResumo = isTabelaRpps
    ? valorReferenciaAtualResumo ||
      (referenciaAutomaticaResumo === "Não informado"
        ? "Não se aplica"
        : referenciaAutomaticaResumo)
    : "R$ 8.475,55";

  const isFaixaAberta = (faixa: Pick<FolhaTabelaReferenciaFaixaRow, "faixaFinal">) =>
    faixa.faixaFinal.trim().toLowerCase() === "em aberto";

  const parseDataVigenciaReferencia = (valor?: string) => {
    if (!valor) return undefined;
    const [dia, mes, ano] = valor.split("/").map(Number);
    if (!dia || !mes || !ano) return undefined;
    return new Date(ano, mes - 1, dia).getTime();
  };

  const vigenciasSobrepostas = (inicioA?: string, fimA?: string, inicioB?: string, fimB?: string) => {
    const inicio1 = parseDataVigenciaReferencia(inicioA);
    const fim1 = parseDataVigenciaReferencia(fimA) ?? Number.POSITIVE_INFINITY;
    const inicio2 = parseDataVigenciaReferencia(inicioB);
    const fim2 = parseDataVigenciaReferencia(fimB) ?? Number.POSITIVE_INFINITY;

    if (inicio1 === undefined || inicio2 === undefined) return false;
    return inicio1 <= fim2 && inicio2 <= fim1;
  };
  const abrirModalNovaFaixa = () => {
    if (isTabelaRpps && !isRegraFaixasProgressivas) {
      setFeedback("Use o campo Percentual de Contribuição para regras sem faixas progressivas.");
      return;
    }

    setNovaFaixaForm({
      faixaFinal: tetoPrevidenciarioSelecionado || "Em aberto",
      percentual: isTabelaRpps ? "14" : "",
    });
    setModalNovaFaixaAberto(true);
  };

  const salvarVigencia = (data: FolhaTabelaReferenciaVigenciaForm) => {
    if (isTabelaRpps) {
      if (!data.aplicavelPara?.length) {
        setFeedback("Informe ao menos um público em Aplicável para.");
        return;
      }

      if (data.aplicavelPara.includes("MILITAR") && !data.situacoesFuncionaisMilitar?.length) {
        setFeedback("Informe ao menos uma Situação Funcional para o público Militar.");
        return;
      }

      if (!data.tipoCalculo) {
        setFeedback("Informe o Tipo de Cálculo do RPPS.");
        return;
      }

      if (!data.regraIncidencia) {
        setFeedback("Informe a Regra de Incidência do RPPS.");
        return;
      }

      if (!data.baseLegal?.length) {
        setFeedback("Informe a Base Legal da vigência RPPS.");
        return;
      }

      const regraExigeValorReferencia =
        data.regraIncidencia === "ATE_VALOR_REFERENCIA" ||
        data.regraIncidencia === "EXCEDENTE_VALOR_REFERENCIA" ||
        data.regraIncidencia === "ISENTO_ATE_VALOR_REFERENCIA";

      if (regraExigeValorReferencia && !data.valorReferenciaId) {
        setFeedback("Informe o Valor de Referência exigido pela regra selecionada.");
        return;
      }

      if (
        data.regraIncidencia !== "FAIXAS_PROGRESSIVAS" &&
        data.regraIncidencia !== "ISENTO_ATE_VALOR_REFERENCIA"
      ) {
        if (!data.percentualContribuicao?.trim()) {
          setFeedback("Informe o Percentual de Contribuição.");
          return;
        }
      }

      if (data.regraIncidencia === "FAIXAS_PROGRESSIVAS") {
        if (!faixasVigencia.length) {
          setFeedback("Por faixas de contribuição exige ao menos uma faixa cadastrada.");
          return;
        }

        const primeiraFaixa = faixasVigencia[0];
        if (parseMoedaReferencia(primeiraFaixa.faixaInicial) !== 0) {
          setFeedback("A primeira faixa de contribuição deve iniciar em R$ 0,00.");
          return;
        }

        const possuiLacunaOuSobreposicao = faixasVigencia.some((faixa, index) => {
          if (index === 0) return false;
          const faixaAnterior = faixasVigencia[index - 1];
          if (isFaixaAberta(faixaAnterior)) return true;
          const inicioEsperado = parseMoedaReferencia(faixaAnterior.faixaFinal) + 0.01;
          return Math.abs(parseMoedaReferencia(faixa.faixaInicial) - inicioEsperado) > 0.001;
        });

        if (possuiLacunaOuSobreposicao) {
          setFeedback("As faixas de contribuição não podem possuir lacunas ou sobreposição.");
          return;
        }

        if (data.tetoPrevidenciario?.trim()) {
          if (faixasVigencia.some(isFaixaAberta)) {
            setFeedback("Quando há Teto Previdenciário, a última faixa deve fechar no teto.");
            return;
          }

          const ultimaFaixa = faixasVigencia[faixasVigencia.length - 1];
          if (ultimaFaixa && ultimaFaixa.faixaFinal !== data.tetoPrevidenciario) {
            setFeedback("A última faixa deve possuir Valor Final igual ao Teto Previdenciário.");
            return;
          }
        }
      }

      const vigenciaAtualId = Number(vigenciaId);
      const modeloRppsSalvo = modeloRppsAtual ?? vigenciaFormularioBase;
      const modeloRppsIdSalvo = modeloRppsId ?? modeloRppsSalvo?.id;

      if (!modeloRppsSalvo || !modeloRppsIdSalvo) {
        setFeedback("Modelo RPPS não encontrado para esta vigência.");
        return;
      }

      const temSobreposicao = getFolhaTabelasReferenciaPersistidas()
        .find((item) => item.sigla === "RPPS")
        ?.vigencias.some((vigencia) => {
          if (vigencia.id === vigenciaAtualId) return false;
          const mesmoModelo = getFolhaTabelaReferenciaRppsModeloId(vigencia) === modeloRppsIdSalvo;

          return (
            mesmoModelo &&
            vigenciasSobrepostas(
              data.inicioVigencia,
              data.fimVigencia,
              vigencia.inicioVigencia,
              vigencia.fimVigencia,
            )
          );
        });

      if (temSobreposicao) {
        setFeedback("Já existe vigência RPPS sobreposta para este mesmo modelo.");
        return;
      }

      const novaVigencia: FolhaTabelaReferenciaVigenciaRow = {
        id: Number.isFinite(vigenciaAtualId) && vigenciaAtualId > 0 ? vigenciaAtualId : Date.now(),
        modeloRppsId: modeloRppsIdSalvo,
        nome: modeloRppsSalvo.nome,
        ano: data.anoBase,
        aplicavelPara: modeloRppsSalvo.aplicavelPara,
        situacoesFuncionaisMilitar: modeloRppsSalvo.situacoesFuncionaisMilitar,
        condicaoEspecial: modeloRppsSalvo.condicaoEspecial,
        planoPrevidenciario: modeloRppsSalvo.planoPrevidenciario,
        tipoCalculo: modeloRppsSalvo.tipoCalculo,
        regraIncidencia: modeloRppsSalvo.regraIncidencia,
        valorReferenciaId: data.valorReferenciaId || modeloRppsSalvo.valorReferenciaId,
        limiteProventos: data.limiteProventos,
        proventosAPartirDe: data.proventosAPartirDe || modeloRppsSalvo.proventosAPartirDe,
        proventosAte: data.proventosAte || modeloRppsSalvo.proventosAte,
        tetoPrevidenciario: undefined,
        percentualContribuicao: data.percentualContribuicao || modeloRppsSalvo.percentualContribuicao,
        faixasContribuicao: faixasVigencia.length ? faixasVigencia : modeloRppsSalvo.faixasContribuicao,
        inicioVigencia: data.inicioVigencia,
        fimVigencia: data.fimVigencia,
        baseLegal: data.baseLegal,
        vigencia: formatarPeriodoVigenciaReferencia(data.inicioVigencia, data.fimVigencia),
        situacao: calcularSituacaoVigenciaReferencia(data.inicioVigencia, data.fimVigencia),
      };

      salvarFolhaTabelaReferenciaRppsVigencia(novaVigencia);
      setFeedback("Registro salvo com sucesso!");
      window.setTimeout(() => navigate(FOLHA_TABELAS_REFERENCIA_BASE_PATH), 650);
      return;
    }

    if (isTabelaPrevcom && activeTab === "dados-gerais") {
      if (!data.tetoRgpsReferencia?.trim()) {
        setFeedback("Informe o Teto RGPS usado como referência.");
        return;
      }

      if (!data.percentualMaximoPatrocinador?.trim()) {
        setFeedback("Informe o Percentual máximo com patrocinador.");
        return;
      }

      setFeedback("Registro salvo com sucesso!");
      return;
    }

    if (activeTab === "dados-gerais" && !dadosGeraisSalvos) {
      setDadosGeraisSalvos(true);
      setActiveTab(isTabelaIrrf ? "tabela-progressiva" : "faixa-contribuicao");
      setFeedback(
        isTabelaIrrf
          ? "Dados gerais salvos com sucesso. As configurações próprias do IRRF foram habilitadas."
          : "Dados gerais salvos com sucesso. A aba Faixas de Contribuição foi habilitada.",
      );
      return;
    }

    setFeedback("Registro salvo com sucesso!");
  };

  const salvarNovaFaixa = () => {
    const faixaFinal = novaFaixaForm.faixaFinal.trim() || "R$ 0,00";
    const percentual = novaFaixaForm.percentual.trim();
    const faixaAberta = isFaixaAberta({ faixaFinal });

    if (isTabelaRpps && !isRegraFaixasProgressivas) {
      setFeedback("Use o campo Percentual de Contribuição para regras sem faixas progressivas.");
      return;
    }

    if (faixasVigencia.length && isFaixaAberta(faixasVigencia[faixasVigencia.length - 1])) {
      setFeedback("Não é possível adicionar faixa após uma faixa em aberto.");
      return;
    }

    if (tetoPrevidenciarioSelecionado?.trim() && faixaAberta) {
      setFeedback("Quando há Teto Previdenciário, a última faixa deve fechar no teto.");
      return;
    }

    if (!percentual || (!faixaAberta && parseMoedaReferencia(faixaFinal) <= 0)) {
      setFeedback("Informe Faixa Final e Percentual (%) para adicionar a faixa.");
      return;
    }

    const faixaInicial = getProximaFaixaInicialReferencia(faixasVigencia);

    if (!faixaAberta && parseMoedaReferencia(faixaFinal) < parseMoedaReferencia(faixaInicial)) {
      setFeedback("O Valor Final da faixa deve ser maior ou igual ao Valor Inicial.");
      return;
    }

    setFaixasVigencia((current) => [
      ...current,
      {
        id: Date.now(),
        ordem: current.length + 1,
        faixaInicial,
        faixaFinal,
        percentual,
        contribuicaoFaixa: faixaAberta
          ? "Calculada pelo motor"
          : calcularContribuicaoFaixaReferencia(faixaInicial, faixaFinal, percentual),
        parcelaDeduzir: isTabelaIrrf
          ? calcularParcelaDeduzirIrrf(current, faixaInicial, percentual)
          : undefined,
      },
    ]);
    setModalNovaFaixaAberto(false);
    setFeedback("Faixa adicionada com sucesso!");
  };

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <form onSubmit={handleSubmit(salvarVigencia)}>
        <div className="prototype-page-content prototype-page-content--white prototype-folha-referencia-form-page">
          {feedback ? (
            <div className="prototype-validation-panel">{feedback}</div>
          ) : null}

          <CardSeplag
            title={tituloTabela}
            cols="12"
            cardHeaderClassNames="prototype-regime-card"
          >
            <div className="col-12 prototype-folha-referencia-vigencia-form">
              <TabsSeplag
                items={tabsVigencia}
                activeValue={activeTab}
                onChange={setActiveTab}
              />

              <div className="prototype-folha-referencia-vigencia-panel">
                {activeTab === "dados-gerais" ? (
                  <>
                    <div className="prototype-folha-referencia-vigencia-panel-title">
                      <h3>Dados Gerais</h3>
                    </div>
                    <div className="grid prototype-folha-referencia-vigencia-fields">
                      {!isTabelaRpps ? (
                        <TextFieldSeplag
                          name="descricao"
                          control={control}
                          label="Descrição"
                          required
                          cols="12 12 8"
                          getFormErrorMessage={() => null}
                        />
                      ) : null}
                      <TextFieldSeplag
                        name="anoBase"
                        control={control}
                        label="Ano Base"
                        required
                        cols="12 12 4"
                        getFormErrorMessage={() => null}
                      />
                      {isTabelaRpps ? (
                        <>
                          <div className="col-12">
                            <div className="prototype-folha-referencia-vigencia-panel-title">
                              <h3>Características da Regra</h3>
                            </div>
                            <div className="grid prototype-folha-referencia-vigencia-fields">
                              <div className="col-12 md:col-6 lg:col-3">
                                <strong>Aplicável para</strong>
                                <p>{vigenciaFormularioBase?.aplicavelPara ?? "-"}</p>
                              </div>
                              {vigenciaFormularioBase?.situacoesFuncionaisMilitar ? (
                                <div className="col-12 md:col-6 lg:col-3">
                                  <strong>Situação Funcional</strong>
                                  <p>{vigenciaFormularioBase.situacoesFuncionaisMilitar}</p>
                                </div>
                              ) : null}
                              <div className="col-12 md:col-6 lg:col-3">
                                <strong>Condição Especial</strong>
                                <p>{vigenciaFormularioBase?.condicaoEspecial ?? "Nenhuma"}</p>
                              </div>
                              <div className="col-12 md:col-6 lg:col-3">
                                <strong>Plano Previdenciário</strong>
                                <p>{vigenciaFormularioBase?.planoPrevidenciario ?? "Geral"}</p>
                              </div>
                              <div className="col-12 md:col-6 lg:col-3">
                                <strong>Tipo de Cálculo</strong>
                                <p>{vigenciaFormularioBase?.tipoCalculo ?? "Vínculo"}</p>
                              </div>
                              <div className="col-12 md:col-6 lg:col-3">
                                <strong>Regra de Incidência</strong>
                                <p>{vigenciaFormularioBase?.regraIncidencia ?? "-"}</p>
                              </div>
                              {valorReferenciaFixoLabel ? (
                                <div className="col-12 md:col-6 lg:col-3">
                                  <strong>Valor de Referência</strong>
                                  <p>{valorReferenciaFixoLabel}</p>
                                </div>
                              ) : null}
                            </div>
                          </div>
                          {isModeloRppsLc700 ? (
                            <>
                              <div className="col-12 md:col-6 lg:col-3">
                                <strong>Faixa de Isenção</strong>
                                <p>{faixaIsencaoLc700Resumo}</p>
                              </div>
                              <div className="col-12 md:col-6 lg:col-3">
                                <strong>Limite de Proventos</strong>
                                <p>{limiteProventosLc700Resumo}</p>
                              </div>
                            </>
                          ) : null}
                          {isModeloRppsSalarioMinimo ? (
                            <>
                              <div className="col-12 md:col-6 lg:col-3">
                                <strong>Referência de Cálculo</strong>
                                <p>Salário Mínimo</p>
                              </div>
                              <div className="col-12 md:col-6 lg:col-3">
                                <strong>Valor da Referência</strong>
                                <p>{salarioMinimoResumo}</p>
                              </div>
                              <div className="col-12 md:col-6 lg:col-3">
                                <strong>Enquadramento da Regra</strong>
                                <p>{enquadramentoSalarioMinimoResumo}</p>
                              </div>
                            </>
                          ) : null}
                          {isModeloRppsMilitar ? (
                            <>
                              <div className="col-12 md:col-6 lg:col-3">
                                <strong>Referência da Regra</strong>
                                <p>Limite Previdenciário PM/BM</p>
                              </div>
                              <div className="col-12 md:col-6 lg:col-3">
                                <strong>Valor da Referência</strong>
                                <p>{limitePrevidenciarioMilitarResumo}</p>
                              </div>
                            </>
                          ) : null}
                          {exibirValorReferenciaSeparadoRpps ? (
                            <DropdownFieldSeplag
                              name="valorReferenciaId"
                              control={control}
                              label="Valor de Referência"
                              cols="12 12 3"
                              options={folhaTabelaReferenciaValorReferenciaOptions}
                              optionLabel="label"
                              optionValue="value"
                              getFormErrorMessage={() => null}
                            />
                          ) : null}
                          {exibirPercentualRpps ? (
                            <TextFieldSeplag
                              name="percentualContribuicao"
                              control={control}
                              label="Percentual de Contribuição"
                              required
                              cols="12 12 3"
                              getFormErrorMessage={() => null}
                            />
                          ) : null}
                          {exibirEnquadramentoProventosRpps ? (
                            <>
                              <TextFieldSeplag
                                name="proventosAPartirDe"
                                control={control}
                                label="Proventos a partir de"
                                placeholder="Ex.: R$ 4.318,02"
                                cols="12 12 3"
                                getFormErrorMessage={() => null}
                              />
                              <TextFieldSeplag
                                name="proventosAte"
                                control={control}
                                label="Proventos até"
                                placeholder="Ex.: R$ 11.776,34"
                                cols="12 12 3"
                                getFormErrorMessage={() => null}
                              />
                            </>
                          ) : null}
                        </>
                      ) : null}
                      {isTabelaPrevcom ? (
                        <>
                          <DropdownFieldSeplag
                            name="tetoRgpsReferencia"
                            control={control}
                            label="Teto RGPS usado como referência"
                            required
                            cols="12 12 4"
                            options={folhaTabelaReferenciaValorReferenciaOptions.filter(
                              (option) => option.value === "TETO_RGPS",
                            )}
                            optionLabel="label"
                            optionValue="value"
                            getFormErrorMessage={() => null}
                          />
                          <TextFieldSeplag
                            name="percentualMaximoPatrocinador"
                            control={control}
                            label="Percentual máximo com patrocinador"
                            required
                            cols="12 12 4"
                            getFormErrorMessage={() => null}
                          />
                          <DropdownFieldSeplag
                            name="permitePatrocinador"
                            control={control}
                            label="Permite patrocinador"
                            cols="12 12 4"
                            options={folhaTabelaReferenciaPrevcomPatrocinadorOptions}
                            optionLabel="label"
                            optionValue="value"
                            getFormErrorMessage={() => null}
                          />
                        </>
                      ) : null}
                      {exibirTetoPrevidenciario ? (
                        <TextFieldSeplag
                          name="tetoPrevidenciario"
                          control={control}
                          label="Teto Previdenciário"
                          required={!isTabelaRpps}
                          cols="12 12 3"
                          getFormErrorMessage={() => null}
                        />
                      ) : null}
                      <TextFieldSeplag
                        name="inicioVigencia"
                        control={control}
                        label="Início da Vigência"
                        required
                        cols="12 12 3"
                        getFormErrorMessage={() => null}
                      />
                      <TextFieldSeplag
                        name="fimVigencia"
                        control={control}
                        label="Fim da Vigência"
                        placeholder="dd/mm/aaaa"
                        cols="12 12 3"
                        getFormErrorMessage={() => null}
                      />
                      <Controller
                        name="baseLegal"
                        control={control}
                        render={({ field }) => (
                          <div className="col-12">
                            <DocumentosLegaisAssociadosSeplag
                              label="Base Legal"
                              required={isTabelaRpps}
                              options={documentosLegaisMock}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Selecione a lei da vigência"
                              filtroPlaceholder="Filtrar por lei, número ou descrição..."
                              onNovoCadastro={() =>
                                setFeedback(
                                  "Novo cadastro de lei deve ser realizado no cadastro de documentos legais.",
                                )
                              }
                              onVisualizar={(documento) =>
                                setFeedback(`Base legal selecionada: ${documento.titulo}`)
                              }
                            />
                          </div>
                        )}
                      />
                      <TextAreaFieldSeplag
                        name="observacoes"
                        control={control}
                        label="Observações"
                        placeholder="Observações..."
                        cols="12"
                        rows={4}
                        maxLength={500}
                        getFormErrorMessage={() => null}
                      />
                    </div>
                  </>
                ) : isTabelaIrrf && activeTab === "reducao-mensal" ? (
                  <>
                    <div className="prototype-folha-referencia-vigencia-panel-title">
                      <h3>Redução Mensal do IRRF</h3>
                    </div>
                    <div className="prototype-folha-referencia-calculo-summary">
                      <div><span>Isenção total até</span><strong>R$ 5.000,00</strong></div>
                      <div><span>Redução decrescente até</span><strong>R$ 7.350,00</strong></div>
                      <div><span>Vigência</span><strong>Janeiro de 2026</strong></div>
                    </div>
                    <div className="prototype-folha-referencia-irrf-table">
                      <table>
                        <thead><tr><th>Rendimento Inicial</th><th>Rendimento Final</th><th>Regra da Redução</th><th>Ações</th></tr></thead>
                        <tbody>
                          <tr><td>R$ 0,00</td><td>R$ 5.000,00</td><td>Redução limitada ao imposto devido, resultando em IRRF igual a zero</td><td><div className="prototype-folha-referencia-faixa-actions"><button type="button" aria-label="Visualizar redução"><i className="pi pi-eye" aria-hidden="true" /></button></div></td></tr>
                          <tr><td>R$ 5.000,01</td><td>R$ 7.350,00</td><td>R$ 978,62 − (0,133145 × rendimentos tributáveis)</td><td><div className="prototype-folha-referencia-faixa-actions"><button type="button" aria-label="Visualizar redução"><i className="pi pi-eye" aria-hidden="true" /></button></div></td></tr>
                          <tr><td>R$ 7.350,01</td><td>Em aberto</td><td>Sem redução mensal</td><td><div className="prototype-folha-referencia-faixa-actions"><button type="button" aria-label="Visualizar redução"><i className="pi pi-eye" aria-hidden="true" /></button></div></td></tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : isTabelaIrrf && activeTab === "deducoes" ? (
                  <>
                    <div className="prototype-folha-referencia-vigencia-panel-title">
                      <h3>Deduções Mensais</h3>
                    </div>
                    <div className="prototype-folha-referencia-calculo-summary">
                      <div><span>Dedução por dependente</span><strong>R$ 189,59</strong></div>
                      <div><span>Desconto simplificado</span><strong>R$ 607,20</strong></div>
                      <div><span>Parcela isenta 65 anos ou mais</span><strong>R$ 1.903,98</strong></div>
                    </div>
                    <div className="prototype-folha-referencia-irrf-table">
                      <table>
                        <thead><tr><th>Parâmetro</th><th>Valor Mensal</th><th>Aplicação</th><th>Ações</th></tr></thead>
                        <tbody>
                          <tr><td>Dedução por dependente</td><td>R$ 189,59</td><td>Por dependente elegível</td><td><div className="prototype-folha-referencia-faixa-actions"><button type="button" aria-label="Visualizar dedução"><i className="pi pi-eye" aria-hidden="true" /></button></div></td></tr>
                          <tr><td>Desconto simplificado mensal</td><td>R$ 607,20</td><td>Substitui as deduções legais quando mais vantajoso</td><td><div className="prototype-folha-referencia-faixa-actions"><button type="button" aria-label="Visualizar dedução"><i className="pi pi-eye" aria-hidden="true" /></button></div></td></tr>
                          <tr><td>Parcela isenta para 65 anos ou mais</td><td>R$ 1.903,98</td><td>Aposentadoria e pensão, observados os requisitos</td><td><div className="prototype-folha-referencia-faixa-actions"><button type="button" aria-label="Visualizar dedução"><i className="pi pi-eye" aria-hidden="true" /></button></div></td></tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="prototype-folha-referencia-vigencia-panel-title">
                      <h3>{isTabelaIrrf ? "Tabela Progressiva Mensal" : "Faixas de Contribuição"}</h3>
                    </div>
                    <div
                      className={`prototype-folha-referencia-calculo-summary${
                        isModeloRppsLc700 || isModeloRppsSalarioMinimo || isModeloRppsMilitar
                          ? " prototype-folha-referencia-calculo-summary--quatro"
                          : ""
                      }`}
                    >
                      {isTabelaIrrf ? (
                        <>
                          <div><span>Limite da Faixa Isenta</span><strong>R$ 2.428,80</strong></div>
                          <div><span>Total de Faixas</span><strong>{faixasVigencia.length}</strong></div>
                          <div><span>Alíquota Máxima</span><strong>27,5%</strong></div>
                        </>
                      ) : isModeloRppsLc700 ? (
                        <>
                          <div>
                            <span>Faixa de Isenção</span>
                            <strong>{faixaIsencaoLc700Resumo}</strong>
                          </div>
                          <div>
                            <span>Limite de Proventos</span>
                            <strong>{limiteProventosLc700Resumo}</strong>
                          </div>
                        </>
                      ) : isModeloRppsSalarioMinimo ? (
                        <>
                          <div>
                            <span>Referência de Cálculo</span>
                            <strong>Salário Mínimo</strong>
                          </div>
                          <div>
                            <span>Valor da Referência</span>
                            <strong>{salarioMinimoResumo}</strong>
                          </div>
                          <div>
                            <span>Enquadramento</span>
                            <strong>{enquadramentoSalarioMinimoResumo}</strong>
                          </div>
                        </>
                      ) : isModeloRppsMilitar ? (
                        <>
                          <div>
                            <span>Referência da Regra</span>
                            <strong>Limite Previdenciário PM/BM</strong>
                          </div>
                          <div>
                            <span>Valor da Referência</span>
                            <strong>{limitePrevidenciarioMilitarResumo}</strong>
                          </div>
                        </>
                      ) : (
                        <div>
                          <span>{referenciaRegraTitulo}</span>
                          <strong>{referenciaRegraResumo}</strong>
                        </div>
                      )}
                      {!isTabelaIrrf && !isModeloRppsSalarioMinimo ? (
                        <div>
                          <span>Total de Faixas</span>
                          <strong>{faixasVigencia.length}</strong>
                        </div>
                      ) : null}
                      {!isTabelaIrrf ? (
                        <div>
                          <span>{isTabelaRpps ? "Cálculo" : "Desconto Máximo CLT"}</span>
                          <strong>{isTabelaRpps ? "Calculado na folha" : formatMoedaReferencia(descontoMaximo)}</strong>
                        </div>
                      ) : null}
                    </div>
                    {!isModeloRppsMilitar && (!isTabelaRpps || isRegraFaixasProgressivas) ? (
                      <div className="prototype-folha-referencia-faixa-toolbar">
                        <BotaoSeplag
                          type="button"
                          label="Adicionar Faixa"
                          icon="pi pi-plus"
                          onClick={abrirModalNovaFaixa}
                        />
                      </div>
                    ) : null}
                    <div className={`prototype-folha-referencia-faixa-table${isTabelaIrrf ? " prototype-folha-referencia-faixa-table--irrf" : ""}`}>
                      <table>
                        <thead>
                          <tr>
                            <th>Ordem</th>
                            <th>{isTabelaIrrf ? "Base Inicial" : "Faixa Inicial"}</th>
                            <th>{isTabelaIrrf ? "Base Final" : "Faixa Final"}</th>
                            <th>Percentual (%)</th>
                            {!isTabelaIrrf ? <th>Contribuição Máxima da Faixa</th> : null}
                            <th>Parcela a Deduzir</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {faixasVigencia.map((faixa) => (
                            <tr key={faixa.id}>
                              <td>{faixa.ordem}</td>
                              <td>{faixa.faixaInicial}</td>
                              <td>{faixa.faixaFinal}</td>
                              <td>{faixa.percentual}</td>
                              {!isTabelaIrrf ? <td>{faixa.contribuicaoFaixa}</td> : null}
                              <td>{faixa.parcelaDeduzir ?? "Não se aplica"}</td>
                              <td>
                                <div className="prototype-folha-referencia-faixa-actions">
                                  <button
                                    type="button"
                                    aria-label="Visualizar faixa"
                                    onClick={() =>
                                      setFeedback(`Faixa ${faixa.ordem} selecionada.`)
                                    }
                                  >
                                    <i className="pi pi-eye" aria-hidden="true" />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label="Abrir ações da faixa"
                                    onClick={() =>
                                      setFeedback(
                                        `Ações da faixa ${faixa.ordem} abertas.`,
                                      )
                                    }
                                  >
                                    <i className="pi pi-chevron-down" aria-hidden="true" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {!faixasVigencia.length ? (
                            <tr>
                              <td colSpan={isTabelaIrrf ? 6 : 7} className="prototype-empty-table-cell">
                                Nenhuma faixa cadastrada.
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                    <div className="prototype-folha-referencia-pagination prototype-folha-referencia-pagination--inner prototype-folha-referencia-pagination--below-table">
                      <button type="button" disabled>
                        <i className="pi pi-angle-double-left" aria-hidden="true" />
                      </button>
                      <button type="button" disabled>
                        <i className="pi pi-angle-left" aria-hidden="true" />
                      </button>
                      <span>1</span>
                      <button type="button" disabled>
                        <i className="pi pi-angle-right" aria-hidden="true" />
                      </button>
                      <button type="button" disabled>
                        <i className="pi pi-angle-double-right" aria-hidden="true" />
                      </button>
                      <select aria-label="Registros por página" value="10" onChange={() => {}}>
                        <option value="10">10</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="prototype-category-form-footer prototype-folha-referencia-vigencia-footer">
                  <BotaoVoltarSeplag
                    type="button"
                    label="Voltar"
                    onClick={() => navigate(FOLHA_TABELAS_REFERENCIA_BASE_PATH)}
                  />
                  <BotaoSalvarSeplag type="submit" label="Salvar" />
                </div>
              </div>
            </div>
          </CardSeplag>

          <ModalSeplag
            visible={modalNovaFaixaAberto}
            titulo="Nova Faixa"
            tamanho="calc(100vw - 96px)"
            fechar={() => setModalNovaFaixaAberto(false)}
            labelFechar="Cancelar"
            iconFechar="pi pi-arrow-left"
            labelAcao="Salvar"
            iconAcao="pi pi-save"
            funcAcao={salvarNovaFaixa}
          >
            <div className="col-12 prototype-folha-referencia-nova-faixa-modal">
              <div className="prototype-folha-referencia-nova-faixa-grid">
                <label>
                  <span>Ordem</span>
                  <input type="text" value={proximaOrdemFaixa} readOnly />
                </label>
                <label>
                  <span>Faixa Inicial</span>
                  <input type="text" value={proximaFaixaInicial} readOnly />
                </label>
                <label>
                  <span>
                    Faixa Final <strong>*</strong>
                  </span>
                  <input
                    type="text"
                    value={novaFaixaForm.faixaFinal}
                    onChange={(event) =>
                      setNovaFaixaForm((current) => ({
                        ...current,
                        faixaFinal: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  <span>
                    Percentual (%) <strong>*</strong>
                  </span>
                  <input
                    type="text"
                    placeholder="Ex.: 14"
                    value={novaFaixaForm.percentual}
                    onChange={(event) =>
                      setNovaFaixaForm((current) => ({
                        ...current,
                        percentual: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            </div>
          </ModalSeplag>
        </div>
      </form>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaValorReferenciaVigenciaFormPage() {
  const navigate = useNavigate();
  const { codigo, vigenciaId } = useParams();
  const valorReferencia =
    folhaValoresReferenciaMock.find((item) => item.codigo === codigo) ??
    folhaValoresReferenciaMock[0];
  const vigenciaAtual = valorReferencia.vigencias.find(
    (vigencia) => String(vigencia.id) === vigenciaId,
  ) ?? valorReferencia.vigencias[0];
  const isEditing = Boolean(vigenciaId);
  const [feedback, setFeedback] = useState("");
  const { control, handleSubmit } = useForm<FolhaValorReferenciaVigenciaForm>({
    defaultValues: {
      codigo: valorReferencia.codigo,
      nome: valorReferencia.nome,
      tipo: valorReferencia.tipo,
      valor: isEditing ? vigenciaAtual.valor : "",
      inicioVigencia: isEditing ? vigenciaAtual.inicioVigencia : "01/01/2026",
      fimVigencia: isEditing ? vigenciaAtual.fimVigencia ?? "" : "31/12/2026",
      observacoes: "",
    },
  });

  const parseDataVigenciaValorReferencia = (valor?: string) => {
    if (!valor) return undefined;
    const [dia, mes, ano] = valor.split("/").map(Number);
    if (!dia || !mes || !ano) return undefined;
    return new Date(ano, mes - 1, dia).getTime();
  };

  const vigenciasValorSobrepostas = (
    inicioA?: string,
    fimA?: string,
    inicioB?: string,
    fimB?: string,
  ) => {
    const inicio1 = parseDataVigenciaValorReferencia(inicioA);
    const fim1 = parseDataVigenciaValorReferencia(fimA) ?? Number.POSITIVE_INFINITY;
    const inicio2 = parseDataVigenciaValorReferencia(inicioB);
    const fim2 = parseDataVigenciaValorReferencia(fimB) ?? Number.POSITIVE_INFINITY;

    if (inicio1 === undefined || inicio2 === undefined) return false;
    return inicio1 <= fim2 && inicio2 <= fim1;
  };

  const salvarValorReferencia = (data: FolhaValorReferenciaVigenciaForm) => {
    if (!data.valor?.trim()) {
      setFeedback("Informe o Valor.");
      return;
    }

    if (!data.inicioVigencia?.trim()) {
      setFeedback("Informe o Início da Vigência.");
      return;
    }

    const vigenciaAtualId = Number(vigenciaId);
    const temSobreposicao = valorReferencia.vigencias.some((vigencia) => {
      if (vigencia.id === vigenciaAtualId) return false;
      return vigenciasValorSobrepostas(
        data.inicioVigencia,
        data.fimVigencia,
        vigencia.inicioVigencia,
        vigencia.fimVigencia,
      );
    });

    if (temSobreposicao) {
      setFeedback(
        "Já existe vigência sobreposta para o valor de referência " + valorReferencia.codigo + ".",
      );
      return;
    }

    setFeedback("Registro salvo com sucesso!");
  };

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <form onSubmit={handleSubmit(salvarValorReferencia)}>
        <div className="prototype-page-content prototype-page-content--white prototype-folha-referencia-form-page">
          {feedback ? (
            <div className="prototype-validation-panel">{feedback}</div>
          ) : null}

          <CardSeplag
            title={"VALOR DE REFERÊNCIA - " + valorReferencia.codigo}
            cols="12"
            cardHeaderClassNames="prototype-regime-card"
          >
            <div className="col-12 prototype-folha-referencia-vigencia-form">
              <div className="prototype-folha-referencia-vigencia-panel">
                <div className="prototype-folha-referencia-vigencia-panel-title">
                  <h3>{isEditing ? "Editar Vigência" : "Nova Vigência"}</h3>
                </div>
                <div className="grid prototype-folha-referencia-vigencia-fields">
                  <TextFieldSeplag
                    name="codigo"
                    control={control}
                    label="Código do Valor de Referência"
                    disabled
                    cols="12 12 4"
                    getFormErrorMessage={() => null}
                  />
                  <TextFieldSeplag
                    name="nome"
                    control={control}
                    label="Nome do Valor de Referência"
                    disabled
                    cols="12 12 5"
                    getFormErrorMessage={() => null}
                  />
                  <TextFieldSeplag
                    name="tipo"
                    control={control}
                    label="Tipo"
                    disabled
                    cols="12 12 3"
                    getFormErrorMessage={() => null}
                  />
                  <TextFieldSeplag
                    name="valor"
                    control={control}
                    label="Valor"
                    required
                    placeholder="Ex.: R$ 1.621,00"
                    cols="12 12 4"
                    getFormErrorMessage={() => null}
                  />
                  <TextFieldSeplag
                    name="inicioVigencia"
                    control={control}
                    label="Início da Vigência"
                    required
                    cols="12 12 4"
                    getFormErrorMessage={() => null}
                  />
                  <TextFieldSeplag
                    name="fimVigencia"
                    control={control}
                    label="Fim da Vigência"
                    placeholder="dd/mm/aaaa"
                    cols="12 12 4"
                    getFormErrorMessage={() => null}
                  />
                  <TextAreaFieldSeplag
                    name="observacoes"
                    control={control}
                    label="Observações"
                    placeholder="Observações..."
                    cols="12"
                    rows={4}
                    maxLength={500}
                    getFormErrorMessage={() => null}
                  />
                </div>

                <div className="prototype-category-form-footer prototype-folha-referencia-vigencia-footer">
                  <BotaoVoltarSeplag
                    type="button"
                    label="Voltar"
                    onClick={() => navigate(FOLHA_TABELAS_REFERENCIA_BASE_PATH)}
                  />
                  <BotaoSalvarSeplag type="submit" label="Salvar" />
                </div>
              </div>
            </div>
          </CardSeplag>
        </div>
      </form>
    </PrototypeSystemPage>
  );
}
export function PrototiposFolhaGruposFolhaPage() {
  const navigate = useNavigate();
  const [grupos] = useState<GrupoFolhaRow[]>(() =>
    folhaPagamentoService.listarGruposFolha(),
  );
  const [grupoSelecionado, setGrupoSelecionado] =
    useState<GrupoFolhaRow | null>(null);
  const [modalDetalheAberto, setModalDetalheAberto] = useState(false);
  const { control, reset, watch } = useForm<GrupoFolhaFiltroForm>({
    defaultValues: {
      termo: "",
      tipoFolha: "",
      orgaos: [],
      situacao: "",
    },
  });
  const [perfilIngressos, setPerfilIngressos] = useState<IngressoPerfil>("PROVIMENTO");
  const filtros = watch();
  const termo = filtros.termo?.trim().toLowerCase() ?? "";
  const gruposFiltrados = grupos.filter((grupo) => {
    const atendeTermo =
      !termo ||
      grupo.codigo.toLowerCase().includes(termo) ||
      grupo.nome.toLowerCase().includes(termo);
    const atendeTipo = !filtros.tipoFolha || grupo.tipoFolha === filtros.tipoFolha;
    const atendeOrgao =
      !filtros.orgaos?.length ||
      filtros.orgaos.some((orgao) => grupo.orgaos.includes(orgao));
    const atendeSituacao =
      !filtros.situacao || grupo.situacao === filtros.situacao;

    return atendeTermo && atendeTipo && atendeOrgao && atendeSituacao;
  });
  const grupoResults = createResults(gruposFiltrados);
  const renderGrupoSituacaoBadge = (situacao: GrupoFolhaSituacao) => (
    <BadgeSeplag {...grupoFolhaSituacaoMeta[situacao]} size="md" />
  );
  const grupoColumns: ColumnMetaSeplag<GrupoFolhaRow>[] = [
    { field: "codigo", header: "Código" },
    { field: "nome", header: "Nome do grupo" },
    { header: "Tipo de folha", body: (row) => grupoFolhaTipoLabel[row.tipoFolha] },
    { header: "Órgão(s)", body: (row) => row.orgaos.join(", ") },
    { field: "versaoVigente", header: "Versão vigente" },
    { field: "vigenciaInicial", header: "Início da vigência" },
    { header: "Situação", body: (row) => renderGrupoSituacaoBadge(row.situacao) },
    { field: "ultimaAlteracao", header: "Última alteração" },
  ];
  const versoesGrupo = grupoSelecionado
    ? folhaPagamentoService.listarVersoesGrupoFolha(grupoSelecionado.id)
    : [];
  const versoesColumns: ColumnMetaSeplag<GrupoFolhaVersaoRow>[] = [
    { field: "versao", header: "Versão" },
    { field: "vigenciaInicial", header: "Vigência inicial" },
    { field: "vigenciaFinal", header: "Vigência final" },
    { field: "alteracao", header: "Alteração" },
    { field: "motivo", header: "Motivo" },
    { field: "usuarioResponsavel", header: "Usuário" },
    { field: "dataHora", header: "Data/hora" },
    { header: "Situação", body: (row) => renderGrupoSituacaoBadge(row.situacao) },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-folha-pagamento-page">
        <CardSeplag
          title="Grupos de Folha"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="col-12 prototype-category-filters prototype-folha-pagamento-filters">
            <TextFieldSeplag
              name="termo"
              control={control}
              label="Pesquisar por código ou nome"
              cols="12 12 4"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="tipoFolha"
              control={control}
              label="Tipo de folha"
              cols="12 12 2"
              options={grupoFolhaTipoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <MultiSelectFieldSeplag
              name="orgaos"
              control={control}
              label="Órgãos"
              cols="12 12 3"
              options={folhaPagamentoOrgaoOptions}
              optionLabel="label"
              optionValue="value"
              selectedItemsLabel="{0} órgãos selecionados"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="situacao"
              control={control}
              label="Situação"
              cols="12 12 2"
              options={grupoFolhaSituacaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-1">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={() =>
                  reset({
                    termo: "",
                    tipoFolha: "",
                    orgaos: [],
                    situacao: "",
                  })
                }
              />
            </div>
          </div>

          <div className="col-12 prototype-folha-pagamento-actions">
            <BotaoSeplag
              type="button"
              label="Novo Grupo"
              icon="pi pi-plus"
              onClick={() => navigate(`${GRUPOS_FOLHA_BASE_PATH}/novo`)}
            />
          </div>

          <div className="col-12 prototype-folha-pagamento-table">
            <TablePaginadoSeplag
              dataKey="id"
              data={grupoResults}
              rows={10}
              rowsPerPage={[10, 20]}
              paginator
              lazy={false}
              selectionMode={null}
              columns={grupoColumns}
              hasEventoAcao
              handleView={(grupo) => {
                setGrupoSelecionado(grupo);
                setModalDetalheAberto(true);
              }}
              handleEdit={(grupo) =>
                navigate(`${GRUPOS_FOLHA_BASE_PATH}/${grupo.id}/editar`)
              }
              handleOnPageChange={() => {}}
            />
          </div>
        </CardSeplag>

        <ModalSeplag
          visible={modalDetalheAberto}
          titulo="Detalhar Grupo de Folha"
          fechar={() => setModalDetalheAberto(false)}
          tamanho="1100px"
          hideFooter
        >
          {grupoSelecionado ? (
            <div className="col-12 prototype-folha-execucoes-modal">
              <div className="prototype-folha-execucoes-summary">
                <div>
                  <span>Código</span>
                  <strong>{grupoSelecionado.codigo}</strong>
                  <p>{grupoSelecionado.nome}</p>
                </div>
                <div>
                  <span>Tipo</span>
                  <strong>{grupoFolhaTipoLabel[grupoSelecionado.tipoFolha]}</strong>
                  <p>Versão {grupoSelecionado.versaoVigente}</p>
                </div>
                <div>
                  <span>Situação</span>
                  {renderGrupoSituacaoBadge(grupoSelecionado.situacao)}
                </div>
                <div>
                  <span>Abrangência</span>
                  <strong>{grupoSelecionado.orgaos.join(", ")}</strong>
                  <p>{grupoSelecionado.regimeJuridico || "Todos os regimes"}</p>
                </div>
              </div>

              <div className="prototype-catalogo-view-content">
                <p><strong>Descrição:</strong> {grupoSelecionado.descricao || "-"}</p>
                <p><strong>Categoria:</strong> {grupoSelecionado.categoria || "Todas"}</p>
                <p><strong>Cargo:</strong> {grupoSelecionado.cargo || "Todos"}</p>
                <p><strong>Grupo de eleitos padrão:</strong> {grupoSelecionado.grupoEleitosPadrao || "Não informado"}</p>
                <p><strong>Rubricas associadas:</strong> {grupoSelecionado.rubricasAssociadas.join(", ") || "-"}</p>
                <p><strong>Ordem de processamento:</strong> {grupoSelecionado.ordemProcessamento || "-"}</p>
                <p><strong>Relatórios disponíveis:</strong> {grupoSelecionado.relatoriosDisponiveis.join(", ") || "-"}</p>
              </div>

              <TablePaginadoSeplag
                dataKey="id"
                data={createResults(versoesGrupo)}
                rows={5}
                rowsPerPage={[5, 10]}
                paginator
                lazy={false}
                selectionMode={null}
                columns={versoesColumns}
                handleOnPageChange={() => {}}
              />
            </div>
          ) : null}
        </ModalSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaGrupoFolhaFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const grupoAtual = isEdit
    ? folhaPagamentoService.buscarGrupoFolhaPorId(Number(id))
    : undefined;
  const [formFeedback, setFormFeedback] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GrupoFolhaForm>({
    defaultValues: {
      codigo: grupoAtual?.codigo ?? "",
      nome: grupoAtual?.nome ?? "",
      descricao: grupoAtual?.descricao ?? "",
      tipoFolha: grupoAtual?.tipoFolha ?? "NORMAL",
      orgaos: grupoAtual?.orgaos ?? [],
      regimeJuridico: grupoAtual?.regimeJuridico ?? "",
      categoria: grupoAtual?.categoria ?? "",
      cargo: grupoAtual?.cargo ?? "",
      grupoEleitosPadrao: grupoAtual?.grupoEleitosPadrao ?? "",
      situacao: grupoAtual?.situacao ?? "RASCUNHO",
      vigenciaInicial: grupoAtual?.vigenciaInicial ?? "",
      vigenciaFinal: grupoAtual?.vigenciaFinal ?? "",
      totalMesesAdiantarPadrao: grupoAtual?.totalMesesAdiantarPadrao ?? 0,
      totalMesesRetroagirPadrao: grupoAtual?.totalMesesRetroagirPadrao ?? 0,
      permiteRetroacao: grupoAtual?.permiteRetroacao ?? "S",
      herdarConfiguracaoCompetenciaAnterior:
        grupoAtual?.herdarConfiguracaoCompetenciaAnterior ?? "S",
      rubricasAssociadas: grupoAtual?.rubricasAssociadas ?? [],
      ordemProcessamento: grupoAtual?.ordemProcessamento ?? "",
      relatoriosDisponiveis: grupoAtual?.relatoriosDisponiveis ?? [],
    },
  });
  const getFormErrorMessage = (name: keyof GrupoFolhaForm) => {
    const message = errors[name]?.message;
    return message ? <small className="p-error">{String(message)}</small> : null;
  };
  const validarGrupoFolha = (data: GrupoFolhaForm) => {
    if (!data.codigo?.trim()) return "Código do grupo é obrigatório.";
    if (!data.nome?.trim()) return "Nome do grupo é obrigatório.";
    if (!data.tipoFolha) return "Tipo de folha é obrigatório.";
    if (!data.orgaos?.length) return "Informe ao menos um órgão abrangido.";
    if (!data.situacao) return "Situação é obrigatória.";
    if (!data.vigenciaInicial?.trim()) return "Vigência inicial é obrigatória.";
    if ((data.totalMesesAdiantarPadrao ?? 0) < 0 || (data.totalMesesRetroagirPadrao ?? 0) < 0) {
      return "Meses a adiantar e retroagir não podem ser negativos.";
    }
    return "";
  };
  const salvarGrupoFolha = (data: GrupoFolhaForm) => {
    const mensagem = validarGrupoFolha(data);
    if (mensagem) {
      setFormFeedback(mensagem);
      return;
    }

    const request: GrupoFolhaForm = {
      ...data,
      codigo: data.codigo?.trim(),
      nome: data.nome?.trim(),
      descricao: data.descricao?.trim() ?? "",
      orgaos: data.orgaos ?? [],
      rubricasAssociadas: data.rubricasAssociadas ?? [],
      relatoriosDisponiveis: data.relatoriosDisponiveis ?? [],
      totalMesesAdiantarPadrao: data.totalMesesAdiantarPadrao ?? 0,
      totalMesesRetroagirPadrao: data.totalMesesRetroagirPadrao ?? 0,
    };

    if (isEdit && grupoAtual) {
      folhaPagamentoService.atualizarGrupoFolha(grupoAtual.id, request);
    } else {
      folhaPagamentoService.criarGrupoFolha(request);
    }

    navigate(GRUPOS_FOLHA_BASE_PATH);
  };

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <form onSubmit={handleSubmit(salvarGrupoFolha)}>
        <div className="prototype-page-content prototype-page-content--white prototype-folha-pagamento-page">
          <CardSeplag
            title={`${isEdit ? "Alterar" : "Cadastrar"} - Grupo de Folha`}
            cols="12"
            cardHeaderClassNames="prototype-regime-card"
          >
            <div className="col-12 prototype-folha-pagamento-form">
              {formFeedback ? (
                <div className="prototype-validation-panel">{formFeedback}</div>
              ) : null}

              <section className="prototype-folha-form-section">
                <h3>Dados Gerais</h3>
                <div className="grid prototype-category-form-fields">
                  <TextFieldSeplag
                    name="codigo"
                    control={control}
                    label="Código do grupo"
                    cols="12 12 3"
                    required
                    getFormErrorMessage={() => getFormErrorMessage("codigo")}
                  />
                  <TextFieldSeplag
                    name="nome"
                    control={control}
                    label="Nome do grupo"
                    cols="12 12 5"
                    required
                    getFormErrorMessage={() => getFormErrorMessage("nome")}
                  />
                  <DropdownFieldSeplag
                    name="tipoFolha"
                    control={control}
                    label="Tipo de folha"
                    cols="12 12 2"
                    required
                    options={grupoFolhaTipoOptions.filter((option) => option.value)}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => getFormErrorMessage("tipoFolha")}
                  />
                  <DropdownFieldSeplag
                    name="situacao"
                    control={control}
                    label="Situação"
                    cols="12 12 2"
                    required
                    options={grupoFolhaSituacaoOptions.filter((option) => option.value)}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => getFormErrorMessage("situacao")}
                  />
                  <TextAreaFieldSeplag
                    name="descricao"
                    control={control}
                    label="Descrição"
                    cols="12"
                    rows={3}
                    maxLength={500}
                    getFormErrorMessage={() => getFormErrorMessage("descricao")}
                  />
                </div>
              </section>

              <section className="prototype-folha-form-section">
                <h3>Abrangência Padrão</h3>
                <div className="grid prototype-category-form-fields">
                  <MultiSelectFieldSeplag
                    name="orgaos"
                    control={control}
                    label="Órgãos abrangidos"
                    cols="12 12 6"
                    required
                    options={folhaPagamentoOrgaoOptions}
                    optionLabel="label"
                    optionValue="value"
                    selectedItemsLabel="{0} órgãos selecionados"
                    getFormErrorMessage={() => getFormErrorMessage("orgaos")}
                  />
                  <DropdownFieldSeplag
                    name="regimeJuridico"
                    control={control}
                    label="Regime jurídico"
                    cols="12 12 6"
                    options={folhaPagamentoRegimeOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => getFormErrorMessage("regimeJuridico")}
                  />
                  <DropdownFieldSeplag
                    name="categoria"
                    control={control}
                    label="Categoria"
                    cols="12 12 4"
                    options={folhaPagamentoCategoriaOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => getFormErrorMessage("categoria")}
                  />
                  <DropdownFieldSeplag
                    name="cargo"
                    control={control}
                    label="Cargo"
                    cols="12 12 4"
                    options={folhaPagamentoCargoOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => getFormErrorMessage("cargo")}
                  />
                  <DropdownFieldSeplag
                    name="grupoEleitosPadrao"
                    control={control}
                    label="Grupo de eleitos padrão"
                    cols="12 12 4"
                    options={folhaPagamentoGrupoEleitosOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => getFormErrorMessage("grupoEleitosPadrao")}
                  />
                </div>
              </section>

              <section className="prototype-folha-form-section">
                <h3>Configurações Padrão</h3>
                <div className="grid prototype-category-form-fields">
                  <TextFieldSeplag
                    name="vigenciaInicial"
                    control={control}
                    label="Vigência inicial"
                    placeholder="DD/MM/AAAA"
                    cols="12 12 3"
                    required
                    getFormErrorMessage={() => getFormErrorMessage("vigenciaInicial")}
                  />
                  <TextFieldSeplag
                    name="vigenciaFinal"
                    control={control}
                    label="Vigência final"
                    placeholder="DD/MM/AAAA"
                    cols="12 12 3"
                    getFormErrorMessage={() => getFormErrorMessage("vigenciaFinal")}
                  />
                  <NumberFieldSeplag
                    name="totalMesesAdiantarPadrao"
                    control={control}
                    label="Meses a adiantar"
                    cols="12 12 3"
                    required
                    min={0}
                    getFormErrorMessage={() => getFormErrorMessage("totalMesesAdiantarPadrao")}
                  />
                  <NumberFieldSeplag
                    name="totalMesesRetroagirPadrao"
                    control={control}
                    label="Meses a retroagir"
                    cols="12 12 3"
                    required
                    min={0}
                    getFormErrorMessage={() => getFormErrorMessage("totalMesesRetroagirPadrao")}
                  />
                  <DropdownFieldSeplag
                    name="permiteRetroacao"
                    control={control}
                    label="Permite retroação?"
                    cols="12 12 3"
                    options={[
                      { label: "Sim", value: "S" },
                      { label: "Não", value: "N" },
                    ]}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() => getFormErrorMessage("permiteRetroacao")}
                  />
                  <DropdownFieldSeplag
                    name="herdarConfiguracaoCompetenciaAnterior"
                    control={control}
                    label="Herdar competência anterior?"
                    cols="12 12 3"
                    options={[
                      { label: "Sim", value: "S" },
                      { label: "Não", value: "N" },
                    ]}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={() =>
                      getFormErrorMessage("herdarConfiguracaoCompetenciaAnterior")
                    }
                  />
                </div>
              </section>

              <section className="prototype-folha-form-section">
                <h3>Rubricas e Relatórios</h3>
                <div className="grid prototype-category-form-fields">
                  <MultiSelectFieldSeplag
                    name="rubricasAssociadas"
                    control={control}
                    label="Rubricas associadas"
                    cols="12 12 6"
                    options={grupoFolhaRubricaOptions}
                    optionLabel="label"
                    optionValue="value"
                    selectedItemsLabel="{0} rubricas selecionadas"
                    getFormErrorMessage={() => getFormErrorMessage("rubricasAssociadas")}
                  />
                  <MultiSelectFieldSeplag
                    name="relatoriosDisponiveis"
                    control={control}
                    label="Relatórios disponíveis"
                    cols="12 12 6"
                    options={grupoFolhaRelatorioOptions}
                    optionLabel="label"
                    optionValue="value"
                    selectedItemsLabel="{0} relatórios selecionados"
                    getFormErrorMessage={() => getFormErrorMessage("relatoriosDisponiveis")}
                  />
                  <TextAreaFieldSeplag
                    name="ordemProcessamento"
                    control={control}
                    label="Ordem de processamento"
                    cols="12"
                    rows={3}
                    maxLength={500}
                    getFormErrorMessage={() => getFormErrorMessage("ordemProcessamento")}
                  />
                </div>
              </section>

              <div className="prototype-category-form-footer">
                <BotaoVoltarSeplag
                  type="button"
                  onClick={() => navigate(GRUPOS_FOLHA_BASE_PATH)}
                />
                <BotaoSalvarSeplag type="submit" />
              </div>
            </div>
          </CardSeplag>
        </div>
      </form>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaCompetenciasPage() {
  const navigate = useNavigate();
  const [competencias, setCompetencias] = useState<FolhaCompetenciaRow[]>(() =>
    folhaPagamentoService.listarCompetencias(),
  );
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [competenciaParaFechar, setCompetenciaParaFechar] =
    useState<FolhaCompetenciaRow | null>(null);
  const [dataFimCompetenciaAtual, setDataFimCompetenciaAtual] =
    useState("");
  const [dataInicioProximaCompetencia, setDataInicioProximaCompetencia] =
    useState("");
  const [feedback, setFeedback] = useState("");
  const [formFeedback, setFormFeedback] = useState("");
  const { control, reset, watch } = useForm<FolhaCompetenciaFiltroForm>({
    defaultValues: {
      competencia: "",
      situacao: "",
    },
  });
  const {
    control: formControl,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<FolhaCompetenciaForm>({
    defaultValues: {
      codigo: "",
      nome: "",
      competencia: "",
      mesAnoReferencia: "",
      dataInicio: "",
      dataFim: "",
      situacao: "ATIVA",
      observacao: "",
    },
  });

  const normalizeMesAno = (value?: string) => {
    const cleanValue = value?.trim() ?? "";
    const matchMesAno = cleanValue.match(/^(\d{2})\/(\d{4})$/);
    if (matchMesAno) return `${matchMesAno[2]}-${matchMesAno[1]}`;
    return cleanValue;
  };

  const formatMesAno = (value: string) => {
    if (!value) return "-";
    const [ano, mes] = value.split("-");
    return mes && ano ? `${mes}/${ano}` : value;
  };

  const isMesAnoValido = (value?: string) => {
    const cleanValue = value?.trim() ?? "";
    const match =
      cleanValue.match(/^(\d{4})-(\d{2})$/) ??
      cleanValue.match(/^(\d{2})\/(\d{4})$/);
    if (!match) return false;

    const mes = cleanValue.includes("-") ? Number(match[2]) : Number(match[1]);
    return mes >= 1 && mes <= 12;
  };

  const parseDataBr = (value?: string) => {
    const match = value?.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;

    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);
    const date = new Date(year, month, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  };

  const formatDataBr = (date: Date) =>
    date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const getProximaCompetencia = (competencia: FolhaCompetenciaRow) => {
    const [ano, mes] = competencia.competencia.split("-").map(Number);
    const proximoMes = new Date(ano, mes, 1);
    const dataFimAtual = parseDataBr(competencia.dataFim);
    const dataInicio = dataFimAtual
      ? new Date(dataFimAtual)
      : new Date(proximoMes.getFullYear(), proximoMes.getMonth(), 1);
    if (dataFimAtual) {
      dataInicio.setDate(dataInicio.getDate() + 1);
    }
    return {
      competencia: `${proximoMes.getFullYear()}-${String(proximoMes.getMonth() + 1).padStart(2, "0")}`,
      dataInicio: formatDataBr(dataInicio),
      dataFim: "",
    };
  };

  const getProximaCompetenciaPorDataFim = (
    competencia: FolhaCompetenciaRow,
  ) => {
    const fallback = getProximaCompetencia(competencia);

    return {
      competencia: fallback.competencia,
      dataInicio: dataInicioProximaCompetencia,
      dataFim: "",
    };
  };

  const getDataSomada = (value: string, dias: number) => {
    const date = parseDataBr(value);
    if (!date) return "";

    const novaData = new Date(date);
    novaData.setDate(novaData.getDate() + dias);
    return formatDataBr(novaData);
  };

  const handleDataFimCompetenciaAtualChange = (value: string) => {
    const masked = maskDataBr(value);
    setDataFimCompetenciaAtual(masked);
    setDataInicioProximaCompetencia(
      masked.length === 10 ? getDataSomada(masked, 1) : "",
    );
  };

  const handleDataInicioProximaCompetenciaChange = (value: string) => {
    const masked = maskDataBr(value);
    setDataInicioProximaCompetencia(masked);
    setDataFimCompetenciaAtual(
      masked.length === 10 ? getDataSomada(masked, -1) : "",
    );
  };

  const maskDataBr = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const [perfilIngressos, setPerfilIngressos] = useState<IngressoPerfil>("PROVIMENTO");
  const filtros = watch();
  const competenciaFiltro = normalizeMesAno(filtros.competencia);
  const competenciasFiltradas = competencias.filter((competencia) => {
    const atendeCompetencia =
      !competenciaFiltro || competencia.competencia === competenciaFiltro;
    const atendeSituacao =
      !filtros.situacao || competencia.situacao === filtros.situacao;

    return atendeCompetencia && atendeSituacao;
  });

  const competenciasResults = {
    ...createResults(competenciasFiltradas),
    totalPages: Math.max(1, Math.ceil(competenciasFiltradas.length / 10)),
    totalRecords: competenciasFiltradas.length,
    size: 10,
    sizePage: 10,
  };

  const renderCompetenciaSituacaoBadge = (
    situacao: FolhaCompetenciaSituacao,
  ) => <BadgeSeplag {...folhaCompetenciaSituacaoMeta[situacao]} size="md" />;

  const getFormErrorMessage = (name: keyof FolhaCompetenciaForm) => {
    const message = errors[name]?.message;
    return message ? <small className="p-error">{String(message)}</small> : null;
  };

  const abrirCadastroCompetencia = () => {
    setFormFeedback("");
    resetForm({
      codigo: "",
      nome: "",
      competencia: "",
      mesAnoReferencia: "",
      dataInicio: "",
      dataFim: "",
      situacao: "ATIVA",
      observacao: "",
    });
    setModalCadastroAberto(true);
  };

  const salvarCompetencia = (data: FolhaCompetenciaForm) => {
    const competencia = normalizeMesAno(data.competencia);
    const dataInicio = data.dataInicio?.trim() ?? "";
    const dataInicioDate = parseDataBr(dataInicio);

    if (!competencia || !dataInicio) {
      setFormFeedback("Preencha competência e data início.");
      return;
    }

    if (!isMesAnoValido(data.competencia)) {
      setFormFeedback("Informe competência no formato MM/AAAA.");
      return;
    }

    if (!dataInicioDate) {
      setFormFeedback("Informe data início no formato DD/MM/AAAA.");
      return;
    }

    const duplicada = competencias.some((item) => item.competencia === competencia);

    if (duplicada) {
      setFormFeedback("Já existe competência cadastrada para este mês/ano.");
      return;
    }

    if (competencias.some((item) => item.situacao === "ATIVA")) {
      setFormFeedback("Já existe uma competência vigente. Encerre a competência atual antes de abrir outra.");
      return;
    }

    const concorrente = competencias.some((item) => {
      const inicioExistente = parseDataBr(item.dataInicio);
      const fimExistente = parseDataBr(item.dataFim);
      if (!inicioExistente || !fimExistente) return false;

      return dataInicioDate <= fimExistente;
    });

    if (concorrente) {
      setFormFeedback("O período informado concorre com uma competência já cadastrada.");
      return;
    }

    const novaCompetencia = folhaPagamentoService.criarCompetencia({
      ...data,
      codigo: `COMP-${competencia}`,
      nome: `Competência ${formatMesAno(competencia)}`,
      competencia,
      mesAnoReferencia: competencia,
      dataInicio,
      dataFim: "",
      situacao: "ATIVA",
    });

    setCompetencias((current) => [novaCompetencia, ...current]);
    setModalCadastroAberto(false);
    setFeedback("Salvo com sucesso a Nova Competência!");
  };

  const fecharCompetencia = () => {
    if (!competenciaParaFechar) return;
    const dataFimCompetenciaFechada = dataFimCompetenciaAtual.trim();
    const dataInicioProxima = dataInicioProximaCompetencia.trim();
    const dataFimCompetenciaFechadaDate = parseDataBr(dataFimCompetenciaFechada);
    const dataInicioProximaDate = parseDataBr(dataInicioProxima);

    if (!dataFimCompetenciaFechadaDate) {
      setFeedback("Informe a data fim da competência atual no formato DD/MM/AAAA.");
      return;
    }
    if (!dataInicioProximaDate) {
      setFeedback("Informe a data início da próxima competência no formato DD/MM/AAAA.");
      return;
    }

    const proximaCompetencia =
      getProximaCompetenciaPorDataFim(competenciaParaFechar);
    const competenciaExistente = competencias.find(
      (competencia) =>
        competencia.competencia === proximaCompetencia.competencia,
    );

    setCompetencias((current) => {
      const currentFechadas = current.map((competencia) =>
        competencia.id === competenciaParaFechar.id
          ? {
              ...competencia,
              dataFim: dataFimCompetenciaFechada,
              situacao: "FECHADA" as FolhaCompetenciaSituacao,
            }
          : competencia,
      );

      if (competenciaExistente) {
        return currentFechadas.map((competencia) =>
          competencia.id === competenciaExistente.id
            ? {
                ...competencia,
                dataInicio: proximaCompetencia.dataInicio,
                dataFim: "",
                situacao: "ATIVA" as FolhaCompetenciaSituacao,
              }
            : competencia,
        );
      }

      const novaCompetencia: FolhaCompetenciaRow = {
        id: Math.max(...current.map((competencia) => competencia.id), 0) + 1,
        codigo: `COMP-${proximaCompetencia.competencia}`,
        nome: `Competência ${formatMesAno(proximaCompetencia.competencia)}`,
        competencia: proximaCompetencia.competencia,
        mesAnoReferencia: proximaCompetencia.competencia,
        dataInicio: proximaCompetencia.dataInicio,
        dataFim: "",
        situacao: "ATIVA",
        observacao: "Competência aberta automaticamente após fechamento da competência anterior.",
        totalFolhas: 0,
        createdAt: "01/06/2026 09:00",
      };

      return [novaCompetencia, ...currentFechadas];
    });

    setFeedback("Competência encerrada com sucesso. A competência do próximo mês foi aberta automaticamente.");
    setCompetenciaParaFechar(null);
    setDataFimCompetenciaAtual("");
    setDataInicioProximaCompetencia("");
  };

  const competenciaColumns: ColumnMetaSeplag<FolhaCompetenciaRow>[] = [
    { header: "Competência", body: (row) => formatMesAno(row.competencia) },
    { field: "dataInicio", header: "Data início" },
    { field: "dataFim", header: "Data fim" },
    { header: "Situação", body: (row) => renderCompetenciaSituacaoBadge(row.situacao) },
  ];

  const abrirModalFecharCompetencia = (competencia: FolhaCompetenciaRow) => {
    setDataFimCompetenciaAtual("");
    setDataInicioProximaCompetencia("");
    setCompetenciaParaFechar(competencia);
  };

  const excluirPrimeiraCompetencia = (competencia: FolhaCompetenciaRow) => {
    setCompetencias((current) =>
      current.filter((item) => item.id !== competencia.id),
    );
    setCompetenciaParaFechar(null);
    setDataFimCompetenciaAtual("");
    setDataInicioProximaCompetencia("");
    setFeedback("");
  };

  const renderAcoesCompetencia = (row: FolhaCompetenciaRow) => (
    <div className="prototype-row-actions">
      {row.situacao === "ATIVA" ? (
        <BotaoIconSeplag
          type="button"
          icon="pi pi-lock"
          tooltip="Encerrar competência"
          onClick={() => abrirModalFecharCompetencia(row)}
        />
      ) : null}
      {competencias.length === 1 ? (
        <BotaoIconSeplag
          type="button"
          icon="pi pi-trash"
          tooltip="Excluir competência"
          severity="danger"
          onClick={() => excluirPrimeiraCompetencia(row)}
        />
      ) : null}
    </div>
  );

  const apagarCompetenciasSimulacao = () => {
    setCompetencias([]);
    setCompetenciaParaFechar(null);
    setDataFimCompetenciaAtual("");
    setDataInicioProximaCompetencia("");
    setFeedback("");
  };

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-folha-pagamento-page">
        <CardSeplag
          title="Configuração de Competência"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
          actions={
            <BotaoIconSeplag
              type="button"
              icon="pi pi-trash"
              tooltip="Apagar competências cadastradas"
              severity="danger"
              onClick={apagarCompetenciasSimulacao}
            />
          }
        >
          {feedback ? (
            <div className="prototype-validation-panel">{feedback}</div>
          ) : null}

          <div className="col-12 prototype-category-filters prototype-folha-pagamento-filters">
            <TextFieldSeplag
              name="competencia"
              control={control}
              label="Competência"
              placeholder="MM/AAAA"
              cols="12 6 4"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="situacao"
              control={control}
              label="Situação"
              cols="12 6 4"
              options={folhaCompetenciaSituacaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-1">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={() =>
                  reset({
                    competencia: "",
                    situacao: "",
                  })
                }
              />
            </div>
          </div>

          <div className="col-12 prototype-folha-pagamento-table">
            {competencias.length === 0 ? (
              <div className="prototype-competencia-empty-table">
                <table>
                  <thead>
                    <tr>
                      <th>Competência</th>
                      <th>Data início</th>
                      <th>Data fim</th>
                      <th>Situação</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5}>
                        <BotaoSeplag
                          type="button"
                          label="Abertura de Competência"
                          icon="pi pi-plus"
                          onClick={abrirCadastroCompetencia}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <TablePaginadoSeplag
                dataKey="id"
                data={competenciasResults}
                rows={10}
                rowsPerPage={[10, 20, 50]}
                paginator
                lazy={false}
                selectionMode={null}
                columns={competenciaColumns}
                hasEventoAcao
                renderBotoes={renderAcoesCompetencia}
                handleOnPageChange={() => {}}
              />
            )}
          </div>
        </CardSeplag>

        <ModalSeplag
          visible={modalCadastroAberto}
          titulo="Cadastrar - Competência da Folha"
          fechar={() => setModalCadastroAberto(false)}
          labelAcao="Salvar"
          iconAcao="pi pi-save"
          funcAcao={handleSubmit(salvarCompetencia)}
          tamanho="760px"
        >
          <div className="col-12 prototype-folha-pagamento-form">
            {formFeedback ? (
              <div className="prototype-validation-panel">{formFeedback}</div>
            ) : null}
            <div className="grid prototype-category-form-fields">
              <MaskFieldSeplag
                name="competencia"
                control={formControl}
                label="Competência"
                mask="99/9999"
                placeholder="MM/AAAA"
                cols="12 12 4"
                required
                getFormErrorMessage={() => getFormErrorMessage("competencia")}
              />
              <MaskFieldSeplag
                name="dataInicio"
                control={formControl}
                label="Data início"
                mask="99/99/9999"
                placeholder="DD/MM/AAAA"
                cols="12 12 4"
                required
                getFormErrorMessage={() => getFormErrorMessage("dataInicio")}
              />
              <TextAreaFieldSeplag
                name="observacao"
                control={formControl}
                label="Observação"
                cols="12"
                rows={3}
                maxLength={500}
                getFormErrorMessage={() => getFormErrorMessage("observacao")}
              />
            </div>
          </div>
        </ModalSeplag>

        <ModalSeplag
          visible={Boolean(competenciaParaFechar)}
          titulo="Fechamento da Competência"
          fechar={() => {
            setCompetenciaParaFechar(null);
            setDataFimCompetenciaAtual("");
          }}
          labelFechar="Não"
          iconFechar="pi pi-times"
          labelAcao="Sim"
          iconAcao="pi pi-lock"
          funcAcao={fecharCompetencia}
          tamanho="780px"
        >
          <div className="col-12 prototype-folha-pagamento-form prototype-fechar-competencia-modal">
            <div className="prototype-validation-panel prototype-fechar-competencia-alert">
              Tem certeza que deseja encerrar a competência atual?
            </div>
            {competenciaParaFechar ? (
              <div className="prototype-fechar-competencia-summary">
                <div>
                  <span>Competência atual</span>
                  <strong>{formatMesAno(competenciaParaFechar.competencia)}</strong>
                  <p>Início: {competenciaParaFechar.dataInicio}</p>
                  <label className="prototype-fechar-competencia-date-field">
                    Data fim
                    <input
                      type="text"
                      value={dataFimCompetenciaAtual}
                      placeholder="DD/MM/AAAA"
                      onChange={(event) =>
                        handleDataFimCompetenciaAtualChange(event.target.value)
                      }
                    />
                  </label>
                </div>
                <div>
                  <span>Próxima competência</span>
                  <strong>
                    {formatMesAno(
                      getProximaCompetenciaPorDataFim(competenciaParaFechar)
                        .competencia,
                    )}
                  </strong>
                  <label className="prototype-fechar-competencia-date-field">
                    Data início
                    <input
                      type="text"
                      value={dataInicioProximaCompetencia}
                      placeholder="DD/MM/AAAA"
                      onChange={(event) =>
                        handleDataInicioProximaCompetenciaChange(
                          event.target.value,
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            ) : null}
          </div>
        </ModalSeplag>

      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaPagamentoFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [formFeedback, setFormFeedback] = useState("");
  const competenciasFolha = folhaPagamentoService.listarCompetencias();
  const folhaEdicaoId = id ? Number(id) : undefined;
  const folhaEdicao = useMemo(
    () =>
      folhaEdicaoId && Number.isFinite(folhaEdicaoId)
        ? folhaPagamentoService.buscarFolhaPorId(folhaEdicaoId)
        : undefined,
    [folhaEdicaoId],
  );
  const isFolhaEdicao = Boolean(id && folhaEdicao);
  const isSomenteLeitura = isFolhaEdicao && location.pathname.endsWith("/visualizar");
  const situacoesComVersionamento: FolhaPagamentoSituacao[] = [
    "PROCESSO_COM_SUCESSO",
    "PROCESSO_COM_ERRO",
  ];
  const folhaPermiteVersionamento = folhaEdicao
    ? situacoesComVersionamento.includes(folhaEdicao.situacao)
    : false;
  const folhaPermiteEdicaoDireta =
    isFolhaEdicao && !folhaPermiteVersionamento;
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FolhaPagamentoForm>({
    defaultValues: {
      grupoFolhaId: 0,
      nome: "",
      numero: "",
      mesAnoReferencia: "",
      competencia: "",
      observacao: "",
      orgaos: [],
      abrangenciaRegimeJuridico: [],
      abrangenciaTipoVinculo: [],
      abrangenciaInstituicao: [],
      abrangenciaSetores: [],
      abrangenciaSubcategorias: [],
      regimeJuridico: "",
      categoria: "",
      cargo: "",
      grupoEleitos: "",
      totalMesesAdiantar: 0,
      totalMesesRetroagir: 0,
    },
  });
  const normalizeMesAno = (value?: string) => {
    const cleanValue = value?.trim() ?? "";
    const matchMesAno = cleanValue.match(/^(\d{2})\/(\d{4})$/);
    if (matchMesAno) return `${matchMesAno[2]}-${matchMesAno[1]}`;
    return cleanValue;
  };

  const formatMesAno = (value?: string) => {
    if (!value) return "-";
    const [ano, mes] = value.split("-");
    return mes && ano ? `${mes}/${ano}` : value;
  };

  const isMesAnoValido = (value?: string) => {
    const cleanValue = value?.trim() ?? "";
    const match =
      cleanValue.match(/^(\d{4})-(\d{2})$/) ??
      cleanValue.match(/^(\d{2})\/(\d{4})$/);
    if (!match) return false;

    const mes = cleanValue.includes("-") ? Number(match[2]) : Number(match[1]);
    return mes >= 1 && mes <= 12;
  };

  const isTextoPreenchido = (value?: string) => Boolean(value?.trim());
  const temAbrangenciaFolha = (data: FolhaPagamentoForm) =>
    Boolean(
      data.orgaos?.length ||
        data.regimeJuridico ||
        data.categoria ||
        data.cargo ||
        data.grupoEleitos,
    );
  const competenciaVigente = competenciasFolha.find(
    (competencia) => competencia.situacao === "ATIVA",
  );
  const formTitle = isFolhaEdicao
    ? isSomenteLeitura
      ? "Visualizar - Folha de Pagamento"
      : "Alterar - Folha de Pagamento"
    : "Cadastrar - Folha de Pagamento";

  useEffect(() => {
    if (!folhaEdicao) return;

    reset({
      competenciaId: folhaEdicao.competenciaId,
      grupoFolhaId: folhaEdicao.grupoFolhaId,
      nome: folhaEdicao.nome,
      numero: folhaEdicao.numero,
      mesAnoReferencia: formatMesAno(folhaEdicao.mesAnoReferencia),
      competencia: folhaEdicao.competencia,
      observacao: folhaEdicao.observacao,
      orgaos: folhaEdicao.orgaos,
      abrangenciaRegimeJuridico: folhaEdicao.abrangenciaRegimeJuridico,
      abrangenciaTipoVinculo: folhaEdicao.abrangenciaTipoVinculo,
      abrangenciaInstituicao: folhaEdicao.abrangenciaInstituicao,
      abrangenciaSetores: folhaEdicao.abrangenciaSetores,
      abrangenciaSubcategorias: folhaEdicao.abrangenciaSubcategorias,
      regimeJuridico: folhaEdicao.regimeJuridico,
      categoria: folhaEdicao.categoria,
      cargo: folhaEdicao.cargo,
      grupoEleitos: folhaEdicao.grupoEleitos,
      totalMesesAdiantar: folhaEdicao.totalMesesAdiantar,
      totalMesesRetroagir: folhaEdicao.totalMesesRetroagir,
    });
  }, [folhaEdicao, reset]);

  const getFormErrorMessage = (name: keyof FolhaPagamentoForm) => {
    const message = errors[name]?.message;
    return message ? <small className="p-error">{String(message)}</small> : null;
  };

  const handleLimparAbrangenciaFolha = () => {
    setValue("abrangenciaInstituicao", []);
    setValue("orgaos", []);
    setValue("abrangenciaTipoVinculo", []);
    setValue("abrangenciaSetores", []);
    setValue("abrangenciaRegimeJuridico", []);
    setValue("categoria", "");
    setValue("abrangenciaSubcategorias", []);
    setValue("cargo", "");
    setValue("grupoEleitos", "");
  };

  const validarObrigatoriosFolha = (data: FolhaPagamentoForm) => {
    if (!isTextoPreenchido(data.nome)) {
      return { tab: "dados", message: "Nome da folha é obrigatório." };
    }

    if (!isTextoPreenchido(data.numero)) {
      return { tab: "dados", message: "Número da folha é obrigatório." };
    }

    if (!temAbrangenciaFolha(data)) {
      return {
        tab: "abrangencia",
        message: "Informe ao menos um critério de abrangência da folha.",
      };
    }

    if (
      data.totalMesesAdiantar === undefined ||
      data.totalMesesAdiantar === null
    ) {
      return {
        tab: "parametros",
        message: "Total de meses a adiantar é obrigatório.",
      };
    }

    if (
      data.totalMesesRetroagir === undefined ||
      data.totalMesesRetroagir === null
    ) {
      return {
        tab: "parametros",
        message: "Total de meses a retroagir é obrigatório.",
      };
    }

    return null;
  };

  const salvarFolha = (
    data: FolhaPagamentoForm,
    situacao: FolhaPagamentoSituacao,
  ) => {
    if (isSomenteLeitura) return;

    const validacaoObrigatorios = validarObrigatoriosFolha(data);

    if (validacaoObrigatorios) {
      setFormFeedback(validacaoObrigatorios.message);
      return;
    }

    const orgaos = data.orgaos ?? [];
    const totalMesesAdiantar = data.totalMesesAdiantar ?? 0;
    const totalMesesRetroagir = data.totalMesesRetroagir ?? 0;
    const competencia = normalizeMesAno(
      data.competencia || competenciaVigente?.competencia,
    );
    const mesAnoReferencia = competencia;
    const nome = data.nome?.trim() ?? "";
    const numero = data.numero?.trim() ?? "";

    if (!isMesAnoValido(competencia)) {
      setFormFeedback("Não há competência vigente válida para cadastrar a folha.");
      return;
    }

    if (totalMesesAdiantar < 0 || totalMesesRetroagir < 0) {
      setFormFeedback("Total de meses a adiantar e retroagir não pode ser menor que zero.");
      return;
    }

    const folhaDuplicada = folhaPagamentoService.listarFolhas().some((folha) => {
      if (isFolhaEdicao && folha.id === folhaEdicao?.id) return false;
      if (
        folhaPermiteVersionamento &&
        folhaEdicao &&
        folha.numero.trim().toLowerCase() === folhaEdicao.numero.trim().toLowerCase() &&
        folha.competencia === folhaEdicao.competencia
      ) {
        return false;
      }

      return (
        folha.numero.trim().toLowerCase() === numero.toLowerCase() &&
        folha.mesAnoReferencia === mesAnoReferencia &&
        folha.competencia === competencia &&
        folha.orgaos.map((orgao) => orgao.toLowerCase()).sort().join("|") ===
          orgaos.map((orgao) => orgao.toLowerCase()).sort().join("|")
      );
    });

    if (folhaDuplicada) {
      setFormFeedback("Já existe folha cadastrada para a combinação de número, referência, competência e órgão(s).");
      return;
    }

    const payload = {
      ...data,
      nome,
      numero,
      mesAnoReferencia,
      competencia,
      orgaos,
      totalMesesAdiantar,
      totalMesesRetroagir,
      situacao,
    };

    if (isFolhaEdicao && folhaEdicao && folhaPermiteEdicaoDireta) {
      folhaPagamentoService.atualizarFolha(folhaEdicao.id, payload);
    } else {
      folhaPagamentoService.criarFolha(payload);
    }

    navigate(FOLHA_PAGAMENTO_BASE_PATH);
  };

  const handleFolhaFormInvalido = (
    _formErrors: FieldErrors<FolhaPagamentoForm>,
  ) => {
    setFormFeedback("Preencha os campos obrigatórios e corrija os valores inválidos antes de salvar.");
  };

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <form
        onSubmit={handleSubmit(
          (data) => salvarFolha(data, "RASCUNHO"),
          handleFolhaFormInvalido,
        )}
      >
        <div className="prototype-page-content prototype-page-content--white prototype-folha-pagamento-page">
          <CardSeplag
            title={formTitle}
            cols="12"
            cardHeaderClassNames="prototype-regime-card"
            actions={
              <div className="prototype-competencia-vigente">
                Competência vigente:{" "}
                <strong>{formatMesAno(competenciaVigente?.competencia ?? "")}</strong>
              </div>
            }
          >
            <div className="col-12 prototype-folha-pagamento-form">
              {formFeedback ? (
                <div className="prototype-validation-panel">{formFeedback}</div>
              ) : null}
              {folhaPermiteVersionamento ? (
                <div className="prototype-validation-panel prototype-validation-panel--info">
                  Esta folha já foi processada. Ao salvar as alterações, elas serão refletidas nos filtros de processamento da folha.
                </div>
              ) : null}
              {isSomenteLeitura ? (
                <div className="prototype-validation-panel prototype-validation-panel--info">
                  Visualização somente leitura.
                </div>
              ) : null}
              <section className="prototype-folha-form-section prototype-folha-form-section--boxed">
                <h3>Dados da Folha</h3>
                  <div className="grid prototype-category-form-fields">
                  <TextFieldSeplag
                    name="numero"
                    control={control}
                    label="Número da folha"
                    cols="12 12 3"
                    required
                    disabled={isSomenteLeitura}
                    getFormErrorMessage={() => getFormErrorMessage("numero")}
                  />
                  <TextFieldSeplag
                    name="nome"
                    control={control}
                    label="Nome da folha"
                    cols="12 12 9"
                    required
                    disabled={isSomenteLeitura}
                    getFormErrorMessage={() => getFormErrorMessage("nome")}
                  />
                  </div>
              </section>

              <section className="prototype-folha-form-section prototype-folha-form-section--boxed prototype-folha-form-section--abrangencia">
                <div className="prototype-grupo-calculo-section-heading">
                  <div>
                    <strong>Abrangência</strong>
                    <p>Defina o público do grupo e adicione as rubricas manualmente.</p>
                  </div>
                  <BotaoLimparFiltroSeplag
                    type="button"
                    label="Limpar Filtro"
                    icon="pi pi-refresh"
                    onClick={handleLimparAbrangenciaFolha}
                    disabled={isSomenteLeitura}
                  />
                </div>
                <div className="grid prototype-category-form-fields">
                  <MultiSelectFieldSeplag
                    name="abrangenciaInstituicao"
                    control={control}
                    label="Instituição"
                    cols="12 12 6"
                    options={grupoCalculoInstituicaoOptions}
                    optionLabel="label"
                    optionValue="value"
                    selectedItemsLabel="{0} instituições selecionadas"
                    disabled={isSomenteLeitura}
                    readOnly={isSomenteLeitura}
                    getFormErrorMessage={() =>
                      getFormErrorMessage("abrangenciaInstituicao")
                    }
                  />
                  <MultiSelectFieldSeplag
                    name="orgaos"
                    control={control}
                    label="Órgão"
                    cols="12 12 6"
                    options={folhaPagamentoOrgaoOptions}
                    optionLabel="label"
                    optionValue="value"
                    selectedItemsLabel="{0} órgãos selecionados"
                    disabled={isSomenteLeitura}
                    readOnly={isSomenteLeitura}
                    getFormErrorMessage={() => getFormErrorMessage("orgaos")}
                  />
                  <MultiSelectFieldSeplag
                    name="abrangenciaTipoVinculo"
                    control={control}
                    label="Tipo de Vínculo"
                    cols="12 12 6"
                    options={grupoCalculoTipoVinculoOptions}
                    optionLabel="label"
                    optionValue="value"
                    selectedItemsLabel="{0} vínculos selecionados"
                    disabled={isSomenteLeitura}
                    readOnly={isSomenteLeitura}
                    getFormErrorMessage={() =>
                      getFormErrorMessage("abrangenciaTipoVinculo")
                    }
                  />
                  <MultiSelectFieldSeplag
                    name="abrangenciaSetores"
                    control={control}
                    label="Setor"
                    cols="12 12 6"
                    options={grupoCalculoSetorOptions}
                    optionLabel="label"
                    optionValue="value"
                    selectedItemsLabel="{0} setores selecionados"
                    disabled={isSomenteLeitura}
                    readOnly={isSomenteLeitura}
                    getFormErrorMessage={() =>
                      getFormErrorMessage("abrangenciaSetores")
                    }
                  />
                  <MultiSelectFieldSeplag
                    name="abrangenciaRegimeJuridico"
                    control={control}
                    label="Regime Jurídico"
                    cols="12 12 6"
                    options={grupoCalculoRegimeJuridicoOptions}
                    optionLabel="label"
                    optionValue="value"
                    selectedItemsLabel="{0} regimes selecionados"
                    disabled={isSomenteLeitura}
                    readOnly={isSomenteLeitura}
                    getFormErrorMessage={() =>
                      getFormErrorMessage("abrangenciaRegimeJuridico")
                    }
                  />
                  <DropdownFieldSeplag
                    name="categoria"
                    control={control}
                    label="Categoria"
                    cols="12 12 6"
                    options={folhaPagamentoCategoriaOptions}
                    optionLabel="label"
                    optionValue="value"
                    disabled={isSomenteLeitura}
                    getFormErrorMessage={() =>
                      getFormErrorMessage("categoria")
                    }
                  />
                  <MultiSelectFieldSeplag
                    name="abrangenciaSubcategorias"
                    control={control}
                    label="Subcategoria"
                    cols="12 12 6"
                    options={grupoCalculoSubcategoriaOptions}
                    optionLabel="label"
                    optionValue="value"
                    selectedItemsLabel="{0} subcategorias selecionadas"
                    disabled={isSomenteLeitura}
                    readOnly={isSomenteLeitura}
                    getFormErrorMessage={() =>
                      getFormErrorMessage("abrangenciaSubcategorias")
                    }
                  />
                  <DropdownFieldSeplag
                    name="cargo"
                    control={control}
                    label="Cargo"
                    cols="12 12 6"
                    options={folhaPagamentoCargoOptions}
                    optionLabel="label"
                    optionValue="value"
                    disabled={isSomenteLeitura}
                    getFormErrorMessage={() => getFormErrorMessage("cargo")}
                  />
                  <DropdownFieldSeplag
                    name="grupoEleitos"
                    control={control}
                    label="Grupo de eleitos"
                    cols="12 12 6"
                    options={folhaPagamentoGrupoEleitosOptions}
                    optionLabel="label"
                    optionValue="value"
                    disabled={isSomenteLeitura}
                    getFormErrorMessage={() =>
                      getFormErrorMessage("grupoEleitos")
                    }
                  />
                </div>
              </section>

              <section className="prototype-folha-form-section prototype-folha-form-section--boxed">
                <h3>Observação</h3>
                  <div className="grid prototype-category-form-fields">
                  <TextAreaFieldSeplag
                    name="observacao"
                    control={control}
                    label="Observação"
                    cols="12"
                    rows={4}
                    maxLength={500}
                    disabled={isSomenteLeitura}
                    getFormErrorMessage={() =>
                      getFormErrorMessage("observacao")
                    }
                  />
                  </div>
              </section>

              <div className="prototype-category-form-footer">
                <BotaoVoltarSeplag
                  type="button"
                  onClick={() => navigate(FOLHA_PAGAMENTO_BASE_PATH)}
                />
                {!isSomenteLeitura ? (
                  <BotaoSalvarSeplag
                    type="button"
                    onClick={handleSubmit(
                      (data) => salvarFolha(data, "ABERTO"),
                      handleFolhaFormInvalido,
                    )}
                  />
                ) : null}
              </div>
            </div>
          </CardSeplag>
        </div>
      </form>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaPagamentoLogPage() {
  const navigate = useNavigate();
  const { execucaoId } = useParams();
  const execucaoIdNumber = Number(execucaoId);
  const execucaoSelecionada = folhaPagamentoService
    .listarExecucoes()
    .find((execucao) => execucao.id === execucaoIdNumber);
  const folhaSelecionada = execucaoSelecionada
    ? folhaPagamentoService.buscarFolhaPorId(execucaoSelecionada.folhaPagamentoId)
    : undefined;
  const [pessoaLogSelecionada, setPessoaLogSelecionada] =
    useState<FolhaPagamentoPessoaLogRow | null>(null);
  const [modalPessoaLogAberto, setModalPessoaLogAberto] = useState(false);
  const { control, reset, watch } =
    useForm<FolhaPagamentoPessoaLogFiltroForm>({
      defaultValues: {
        matricula: "",
        nome: "",
        cpf: "",
        orgao: "",
        situacao: "",
        rubrica: "",
        mensagem: "",
      },
    });

  const formatMesAno = (value?: string) => {
    if (!value) return "-";
    const [ano, mes] = value.split("-");
    return mes && ano ? `${mes}/${ano}` : value;
  };

  const renderFolhaSituacaoBadge = (situacao: FolhaPagamentoSituacao) => {
    const meta = folhaPagamentoSituacaoMeta[situacao];
    return <BadgeSeplag {...meta} size="md" />;
  };

  const renderExecucaoSituacaoBadge = (
    situacao: FolhaPagamentoExecucaoSituacao,
  ) => <BadgeSeplag {...folhaPagamentoExecucaoSituacaoMeta[situacao]} size="md" />;

  const renderPessoaLogSituacaoBadge = (
    situacao: FolhaPagamentoPessoaLogSituacao,
  ) => <BadgeSeplag {...folhaPagamentoPessoaLogSituacaoMeta[situacao]} size="md" />;

  const renderRubricaLogSituacaoBadge = (
    situacao: FolhaPagamentoRubricaLogSituacao,
  ) => <BadgeSeplag {...folhaPagamentoRubricaLogSituacaoMeta[situacao]} size="sm" />;

  const logFiltros = watch();
  const pessoaLogs = folhaPagamentoService.listarPessoaLogs();
  const rubricaLogs = folhaPagamentoService.listarRubricaLogs();
  const logsDaExecucao = execucaoSelecionada
    ? pessoaLogs.filter((log) => log.execucaoId === execucaoSelecionada.id)
    : [];
  const rubricasDaPessoa = pessoaLogSelecionada
    ? rubricaLogs.filter((rubrica) => rubrica.pessoaLogId === pessoaLogSelecionada.id)
    : [];
  const logsFiltrados = logsDaExecucao.filter((log) => {
    const rubricasPessoa = rubricaLogs.filter(
      (rubrica) => rubrica.pessoaLogId === log.id,
    );
    const rubricaBusca = logFiltros.rubrica?.trim().toLowerCase();

    return (
      (!logFiltros.matricula ||
        `${log.matricula}/${log.vinculo}`.includes(logFiltros.matricula)) &&
      (!logFiltros.nome ||
        log.nome.toLowerCase().includes(logFiltros.nome.toLowerCase())) &&
      (!logFiltros.cpf || log.cpf.includes(logFiltros.cpf)) &&
      (!logFiltros.orgao || log.orgao === logFiltros.orgao) &&
      (!logFiltros.situacao || log.situacao === logFiltros.situacao) &&
      (!logFiltros.mensagem ||
        log.mensagem.toLowerCase().includes(logFiltros.mensagem.toLowerCase())) &&
      (!rubricaBusca ||
        rubricasPessoa.some(
          (rubrica) =>
            rubrica.codigoRubrica.toLowerCase().includes(rubricaBusca) ||
            rubrica.nomeRubrica.toLowerCase().includes(rubricaBusca),
        ))
    );
  });
  const logResults = createResults(logsFiltrados);
  const rubricasResults = createResults(rubricasDaPessoa);
  const logPessoaColumns: ColumnMetaSeplag<FolhaPagamentoPessoaLogRow>[] = [
    { header: "Matrícula/vínculo", body: (row) => `${row.matricula}/${row.vinculo}` },
    { field: "nome", header: "Nome" },
    { field: "cpf", header: "CPF" },
    { field: "orgao", header: "Órgão" },
    { field: "cargo", header: "Cargo" },
    {
      header: "Situação",
      body: (row) => renderPessoaLogSituacaoBadge(row.situacao),
    },
    { field: "mensagem", header: "Mensagem" },
  ];
  const rubricaLogColumns: ColumnMetaSeplag<FolhaPagamentoRubricaLogRow>[] = [
    { field: "codigoRubrica", header: "Código" },
    { field: "nomeRubrica", header: "Rubrica" },
    { field: "tipoRubrica", header: "Tipo" },
    { field: "valorCalculado", header: "Valor calculado" },
    {
      header: "Situação",
      body: (row) => renderRubricaLogSituacaoBadge(row.situacao),
    },
    { field: "mensagem", header: "Mensagem" },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-folha-pagamento-page">
        <CardSeplag
          title="Log de Processamento"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          {!execucaoSelecionada ? (
            <div className="prototype-empty-content">
              Execução não encontrada.
            </div>
          ) : (
            <div className="col-12 prototype-folha-log-modal">
              <div className="prototype-folha-execucoes-summary">
                <div>
                  <span>Folha</span>
                  <strong>{folhaSelecionada?.numero ?? "-"}</strong>
                  <p>{folhaSelecionada?.nome ?? "-"}</p>
                </div>
                <div>
                  <span>Competência</span>
                  <strong>{formatMesAno(folhaSelecionada?.competencia)}</strong>
                </div>
                <div>
                  <span>Situação da folha</span>
                  {folhaSelecionada
                    ? renderFolhaSituacaoBadge(folhaSelecionada.situacao)
                    : "-"}
                </div>
                <div>
                  <span>Execução</span>
                  <strong>{execucaoSelecionada.id}</strong>
                  <p>{execucaoSelecionada.usuarioResponsavel}</p>
                </div>
                <div>
                  <span>Situação da execução</span>
                  {renderExecucaoSituacaoBadge(execucaoSelecionada.situacao)}
                </div>
                <div>
                  <span>Início / fim</span>
                  <strong>{execucaoSelecionada.dataHoraInicio}</strong>
                  <p>{execucaoSelecionada.dataHoraFim}</p>
                </div>
                <div>
                  <span>Totais</span>
                  <strong>{execucaoSelecionada.totalPessoas}</strong>
                  <p>
                    {execucaoSelecionada.totalSucesso} sucesso,{" "}
                    {execucaoSelecionada.totalAlerta} alerta,{" "}
                    {execucaoSelecionada.totalErro} erro
                  </p>
                </div>
              </div>

              <div className="prototype-category-filters prototype-folha-log-filters">
                <TextFieldSeplag
                  name="matricula"
                  control={control}
                  label="Matrícula/vínculo"
                  cols="12"
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="nome"
                  control={control}
                  label="Nome"
                  cols="12"
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="cpf"
                  control={control}
                  label="CPF"
                  cols="12"
                  getFormErrorMessage={() => null}
                />
                <DropdownFieldSeplag
                  name="orgao"
                  control={control}
                  label="Órgão"
                  cols="12"
                  options={[{ label: "Todos", value: "" }, ...folhaPagamentoOrgaoOptions]}
                  optionLabel="label"
                  optionValue="value"
                  getFormErrorMessage={() => null}
                />
                <DropdownFieldSeplag
                  name="situacao"
                  control={control}
                  label="Situação"
                  cols="12"
                  options={folhaPagamentoPessoaLogSituacaoOptions}
                  optionLabel="label"
                  optionValue="value"
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="rubrica"
                  control={control}
                  label="Rubrica"
                  cols="12"
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="mensagem"
                  control={control}
                  label="Mensagem contém"
                  cols="12"
                  getFormErrorMessage={() => null}
                />
                <div className="prototype-category-clear">
                  <BotaoLimparFiltroSeplag
                    type="button"
                    label="Limpar"
                    icon="pi pi-refresh"
                    onClick={() =>
                      reset({
                        matricula: "",
                        nome: "",
                        cpf: "",
                        orgao: "",
                        situacao: "",
                        rubrica: "",
                        mensagem: "",
                      })
                    }
                  />
                </div>
              </div>

              {logsFiltrados.length ? (
                <TablePaginadoSeplag
                  dataKey="id"
                  data={logResults}
                  rows={10}
                  rowsPerPage={[10, 20]}
                  paginator
                  lazy={false}
                  selectionMode={null}
                  columns={logPessoaColumns}
                  hasEventoAcao
                  renderBotoes={(log) => (
                    <BotaoIconSeplag
                      type="button"
                      tooltip="Ver detalhe"
                      icon="pi pi-eye"
                      onClick={() => {
                        setPessoaLogSelecionada(log);
                        setModalPessoaLogAberto(true);
                      }}
                    />
                  )}
                  handleOnPageChange={() => {}}
                />
              ) : (
                <div className="prototype-empty-content">
                  Nenhum log encontrado para os filtros informados.
                </div>
              )}

              <div className="prototype-category-form-footer">
                <BotaoVoltarSeplag
                  type="button"
                  onClick={() => navigate(FOLHA_PAGAMENTO_BASE_PATH)}
                />
              </div>
            </div>
          )}
        </CardSeplag>

        <ModalSeplag
          visible={modalPessoaLogAberto}
          titulo="Detalhe do Processamento por Pessoa"
          fechar={() => setModalPessoaLogAberto(false)}
          tamanho="980px"
          hideFooter
        >
          {pessoaLogSelecionada ? (
            <div className="col-12 prototype-folha-pessoa-log-detail">
              <div className="prototype-folha-pessoa-log-grid">
                <p><strong>Matrícula/vínculo:</strong> {pessoaLogSelecionada.matricula}/{pessoaLogSelecionada.vinculo}</p>
                <p><strong>Nome:</strong> {pessoaLogSelecionada.nome}</p>
                <p><strong>CPF:</strong> {pessoaLogSelecionada.cpf}</p>
                <p><strong>Órgão:</strong> {pessoaLogSelecionada.orgao}</p>
                <p><strong>Regime jurídico:</strong> {pessoaLogSelecionada.regimeJuridico}</p>
                <p><strong>Categoria:</strong> {pessoaLogSelecionada.categoria}</p>
                <p><strong>Cargo:</strong> {pessoaLogSelecionada.cargo}</p>
                <p><strong>Grupo de eleitos:</strong> {pessoaLogSelecionada.grupoEleitos || "Não informado"}</p>
                <p><strong>Situação:</strong> {renderPessoaLogSituacaoBadge(pessoaLogSelecionada.situacao)}</p>
                <p><strong>Mensagem:</strong> {pessoaLogSelecionada.mensagem}</p>
              </div>

              {rubricasDaPessoa.length ? (
                <TablePaginadoSeplag
                  dataKey="id"
                  data={rubricasResults}
                  rows={5}
                  rowsPerPage={[5, 10]}
                  paginator
                  lazy={false}
                  selectionMode={null}
                  columns={rubricaLogColumns}
                  handleOnPageChange={() => {}}
                />
              ) : (
                <div className="prototype-empty-content">
                  Nenhuma rubrica registrada para esta pessoa nesta execução.
                </div>
              )}
            </div>
          ) : null}
        </ModalSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

interface PrototiposFolhaPagamentoPageProps {
  title?: string;
  variant?: "folha" | "processamento";
}

interface ProcessamentoFolhaExecucaoRow extends FolhaPagamentoExecucaoRow {
  numeroExecucao: string;
  numeroFolha: string;
  nomeFolha: string;
  competencia: string;
  tipoProcessamento: "Total" | "Parcial";
  solicitadoEm: string;
  responsavel: string;
  erros: number;
  folha?: FolhaPagamentoRow;
}

type RelatorioTecnicoTipoFiltro =
  | "Todos"
  | "Processado com erro"
  | "Processado com Sucesso";

type RelatorioTecnicoFormatoArquivo = ".PDF" | ".XLSX";

type RelatorioTecnicoSituacao =
  | "Em Emissão"
  | "Emitido"
  | "Falha na Emissão";

interface RelatorioTecnicoProcessamentoRow {
  id: number;
  execucaoId: number;
  dataHoraEmissao: string;
  responsavel: string;
  tipoFiltro: RelatorioTecnicoTipoFiltro;
  quantidadeErros: number;
  quantidadeRegistros: number;
  formato: RelatorioTecnicoFormatoArquivo;
  situacao: RelatorioTecnicoSituacao;
}

interface RelatorioTecnicoProcessamentoForm {
  tipoFiltro: RelatorioTecnicoTipoFiltro | "";
  formatoArquivo: RelatorioTecnicoFormatoArquivo | "";
}

export function PrototiposFolhaPagamentoPage({
  title = "Folha de Pagamento",
  variant = "folha",
}: PrototiposFolhaPagamentoPageProps = {}) {
  const navigate = useNavigate();
  const isTelaProcessamentoFolha = variant === "processamento";
  const [folhas, setFolhas] = useState<FolhaPagamentoRow[]>(() =>
    folhaPagamentoService.listarFolhas(),
  );
  const [execucoes, setExecucoes] = useState<FolhaPagamentoExecucaoRow[]>(
    () => folhaPagamentoService.listarExecucoes(),
  );
  const [pessoaLogs] = useState<FolhaPagamentoPessoaLogRow[]>(() =>
    folhaPagamentoService.listarPessoaLogs(),
  );
  const [rubricaLogs] = useState<FolhaPagamentoRubricaLogRow[]>(
    () => folhaPagamentoService.listarRubricaLogs(),
  );
  const [folhaSelecionada, setFolhaSelecionada] =
    useState<FolhaPagamentoRow | null>(null);
  const [modalFormularioAberto, setModalFormularioAberto] = useState(false);
  const [modalDetalheAberto, setModalDetalheAberto] = useState(false);
  const [modalExecucoesAberto, setModalExecucoesAberto] = useState(false);
  const [modalProcessamentoAberto, setModalProcessamentoAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [folhaParaExcluir, setFolhaParaExcluir] =
    useState<FolhaPagamentoRow | null>(null);
  const [modalLogAberto, setModalLogAberto] = useState(false);
  const [modalPessoaLogAberto, setModalPessoaLogAberto] = useState(false);
  const [modalRelatorioTecnicoAberto, setModalRelatorioTecnicoAberto] =
    useState(false);
  const [modalEmitirRelatorioTecnicoAberto, setModalEmitirRelatorioTecnicoAberto] =
    useState(false);
  const [relatorioTecnicoSimularVazio, setRelatorioTecnicoSimularVazio] =
    useState(false);
  const [execucaoSelecionada, setExecucaoSelecionada] =
    useState<FolhaPagamentoExecucaoRow | null>(null);
  const [
    processamentoRelatorioTecnicoSelecionado,
    setProcessamentoRelatorioTecnicoSelecionado,
  ] = useState<ProcessamentoFolhaExecucaoRow | null>(null);
  const [pessoaLogSelecionada, setPessoaLogSelecionada] =
    useState<FolhaPagamentoPessoaLogRow | null>(null);
  const [relatoriosTecnicos, setRelatoriosTecnicos] = useState<
    RelatorioTecnicoProcessamentoRow[]
  >(() => [
    {
      id: 1,
      execucaoId: 1013,
      dataHoraEmissao: "24/05/2026 09:40",
      responsavel: "ROBERTO JUNIOR",
      tipoFiltro: "Processado com erro",
      quantidadeErros: 12,
      quantidadeRegistros: 842,
      formato: ".PDF",
      situacao: "Emitido",
    },
    {
      id: 2,
      execucaoId: 1013,
      dataHoraEmissao: "24/05/2026 08:35",
      responsavel: "ROBERTO JUNIOR",
      tipoFiltro: "Todos",
      quantidadeErros: 12,
      quantidadeRegistros: 842,
      formato: ".XLSX",
      situacao: "Falha na Emissão",
    },
    {
      id: 3,
      execucaoId: 1011,
      dataHoraEmissao: "22/05/2026 18:10",
      responsavel: "ROBERTO JUNIOR",
      tipoFiltro: "Processado com Sucesso",
      quantidadeErros: 0,
      quantidadeRegistros: 842,
      formato: ".PDF",
      situacao: "Em Emissão",
    },
  ]);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [activeTab, setActiveTab] = useState("dados");
  const [feedback, setFeedback] = useState("");
  const [formFeedback, setFormFeedback] = useState("");
  const [processamentoErrors, setProcessamentoErrors] =
    useState<Partial<Record<keyof ProcessamentoFolhaForm, string>>>({});
  const [relatorioTecnicoErrors, setRelatorioTecnicoErrors] =
    useState<Partial<Record<keyof RelatorioTecnicoProcessamentoForm, string>>>({});
  const { control, reset, watch } = useForm<FolhaPagamentoFiltroForm>({
    defaultValues: {
      termo: "",
      numeroFolha: "",
      nomeFolha: "",
      orgaos: [],
      mesAnoReferencia: "",
      competencia: "",
      dataProcessamento: "",
      numeroExecucao: "",
      tipoProcessamento: "",
      situacao: "",
      responsavel: "",
    },
  });
  const {
    control: formControl,
    reset: resetForm,
    handleSubmit,
    formState: { errors },
  } = useForm<FolhaPagamentoForm>({
    defaultValues: {
      competenciaId: 0,
      grupoFolhaId: 0,
      nome: "",
      numero: "",
      mesAnoReferencia: "",
      competencia: "",
      observacao: "",
      orgaos: [],
      regimeJuridico: "",
      categoria: "",
      cargo: "",
      grupoEleitos: "",
      totalMesesAdiantar: 0,
      totalMesesRetroagir: 0,
    },
  });
  const gruposFolha = gruposCalculoMock;
  const getGrupoFolhaNome = (grupoFolhaId?: number) => {
    const grupo = gruposFolha.find((item) => item.id === grupoFolhaId);
    return grupo ? grupo.grupo : "-";
  };
  const usuarioLogadoProcessamentoMock = {
    orgaos: ["SEPLAG", "MTI"],
    regimesJuridicos: ["Estatutário Civil"],
    categorias: ["Área Meio"],
    cargos: ["Analista Administrativo"],
    grupoEleitos: "",
  };
  const toUpperOptions = <T extends { label: string; value: unknown }>(
    options: T[],
  ) =>
    options.map((option) => ({
      ...option,
      label: option.label.toUpperCase(),
    }));
  const processamentoOrgaoOptions = toUpperOptions(folhaPagamentoOrgaoOptions);
  const processamentoRegimeOptions = toUpperOptions(
    folhaPagamentoRegimeOptions.filter((option) => option.value),
  );
  const processamentoCategoriaOptions = toUpperOptions(
    folhaPagamentoCategoriaOptions.filter((option) => option.value),
  );
  const processamentoCargoOptions = toUpperOptions(
    folhaPagamentoCargoOptions.filter((option) => option.value),
  );
  const processamentoGrupoEleitosOptions = toUpperOptions(
    folhaPagamentoGrupoEleitosOptions,
  );
  const {
    control: logControl,
    reset: resetLog,
    watch: watchLog,
  } = useForm<FolhaPagamentoPessoaLogFiltroForm>({
    defaultValues: {
      matricula: "",
      nome: "",
      cpf: "",
      orgao: "",
      situacao: "",
      rubrica: "",
      mensagem: "",
    },
  });
  const {
    control: processamentoControl,
    reset: resetProcessamento,
    setValue: setValueProcessamento,
    watch: watchProcessamento,
    handleSubmit: handleSubmitProcessamento,
  } = useForm<ProcessamentoFolhaForm>({
    defaultValues: {
      numeroFolha: "",
      nomeFolha: "",
      competencia: "",
      tipoExecucao: "TOTAL",
      orgaos: [],
      setores: [],
      regimesJuridicos: [],
      tiposVinculo: [],
      categorias: [],
      subcategorias: [],
      cargos: [],
      grupoEleitos: "",
    },
  });
  const {
    control: relatorioTecnicoControl,
    reset: resetRelatorioTecnico,
    handleSubmit: handleSubmitRelatorioTecnico,
    formState: { errors: relatorioTecnicoFormErrors },
  } = useForm<RelatorioTecnicoProcessamentoForm>({
    defaultValues: {
      tipoFiltro: "",
      formatoArquivo: "",
    },
  });

  const [perfilIngressos, setPerfilIngressos] = useState<IngressoPerfil>("PROVIMENTO");
  const filtros = watch();
  const normalizeMesAno = (value?: string) => {
    const cleanValue = value?.trim() ?? "";
    const matchMesAno = cleanValue.match(/^(\d{2})\/(\d{4})$/);
    if (matchMesAno) return `${matchMesAno[2]}-${matchMesAno[1]}`;
    return cleanValue;
  };

  const isMesAnoValido = (value?: string) => {
    const cleanValue = value?.trim() ?? "";
    const match = cleanValue.match(/^(\d{4})-(\d{2})$/) ?? cleanValue.match(/^(\d{2})\/(\d{4})$/);
    if (!match) return false;

    const mes = cleanValue.includes("-") ? Number(match[2]) : Number(match[1]);
    return mes >= 1 && mes <= 12;
  };

  const termoBuscaDigitado = filtros.termo?.trim().toLowerCase() ?? "";
  const termoBusca =
    termoBuscaDigitado.length >= 3 ? termoBuscaDigitado : "";
  const numeroFolhaBuscaDigitado =
    filtros.numeroFolha?.trim().toLowerCase() ?? "";
  const numeroFolhaBusca = numeroFolhaBuscaDigitado;
  const nomeFolhaBuscaDigitado =
    filtros.nomeFolha?.trim().toLowerCase() ?? "";
  const nomeFolhaBusca =
    nomeFolhaBuscaDigitado.length >= 3 ? nomeFolhaBuscaDigitado : "";
  const folhasFiltradas = folhas.filter((folha) => {
    const atendeNumero =
      !numeroFolhaBusca ||
      folha.numero.toLowerCase().includes(numeroFolhaBusca);
    const atendeNome =
      !nomeFolhaBusca || folha.nome.toLowerCase().includes(nomeFolhaBusca);

    return atendeNumero && atendeNome;
  });

  const getFolhaVersaoKey = (folha: FolhaPagamentoRow) =>
    `${folha.numero}|${folha.competencia}`;

  const folhasPrincipais = Array.from(
    folhasFiltradas.reduce((map, folha) => {
      const key = getFolhaVersaoKey(folha);
      const grupo = map.get(key) ?? [];
      grupo.push(folha);
      map.set(key, grupo);
      return map;
    }, new Map<string, FolhaPagamentoRow[]>()),
  ).map(([, versoes]) => {
    const versoesOrdenadas = [...versoes].sort((a, b) => b.id - a.id);
    return versoesOrdenadas[0];
  });

  const folhaResults = {
    ...createResults(folhasPrincipais),
    totalPages: Math.max(1, Math.ceil(folhasPrincipais.length / 10)),
    totalRecords: folhasPrincipais.length,
    size: 10,
    sizePage: 10,
  };

  const renderFolhaSituacaoBadge = (situacao: FolhaPagamentoSituacao) => {
    const meta = folhaPagamentoSituacaoMeta[situacao];
    return <BadgeSeplag {...meta} size="md" />;
  };

  const renderExecucaoSituacaoBadge = (
    situacao: FolhaPagamentoExecucaoSituacao,
  ) => {
    const meta = folhaPagamentoExecucaoSituacaoMeta[situacao];
    return <BadgeSeplag {...meta} size="md" />;
  };

  const renderPessoaLogSituacaoBadge = (
    situacao: FolhaPagamentoPessoaLogSituacao,
  ) => {
    const meta = folhaPagamentoPessoaLogSituacaoMeta[situacao];
    return <BadgeSeplag {...meta} size="md" />;
  };

  const renderRubricaLogSituacaoBadge = (
    situacao: FolhaPagamentoRubricaLogSituacao,
  ) => {
    const meta = folhaPagamentoRubricaLogSituacaoMeta[situacao];
    return <BadgeSeplag {...meta} size="sm" />;
  };

  const formatMesAno = (value: string) => {
    if (!value) return "-";
    const [ano, mes] = value.split("-");
    return mes && ano ? `${mes}/${ano}` : value;
  };

  const competenciaVigente = folhaPagamentoService
    .listarCompetencias()
    .find((competencia) => competencia.situacao === "ATIVA");
  const getTipoProcessamentoExecucao = (
    execucao: FolhaPagamentoExecucaoRow,
  ): "Total" | "Parcial" =>
    execucao.parametrosResumo.toLowerCase().includes("parcial")
      ? "Parcial"
      : "Total";
  const getProcessamentoSituacaoMeta = (
    situacao: FolhaPagamentoExecucaoSituacao,
  ) => {
    const meta = folhaPagamentoExecucaoSituacaoMeta[situacao];
    const labels: Record<FolhaPagamentoExecucaoSituacao, string> = {
      EM_FILA: "Em Fila",
      EM_PROCESSAMENTO: "Em Processamento",
      CONCLUIDA: "Processado\ncom Sucesso",
      CONCLUIDA_COM_ALERTA: "Processado\ncom Sucesso",
      CONCLUIDA_COM_ERRO: "Processado\ncom Erro",
      CANCELADA: "Cancelado",
    };
    return { ...meta, label: labels[situacao] };
  };
  const renderProcessamentoSituacaoBadge = (
    situacao: FolhaPagamentoExecucaoSituacao,
  ) => {
    const meta = getProcessamentoSituacaoMeta(situacao);
    return (
      <span
        className="prototype-processamento-status-badge"
        style={{
          color: meta.color,
          backgroundColor: meta.bg,
          borderColor: meta.border,
        }}
      >
        {meta.label}
      </span>
    );
  };
  const processamentosBase: ProcessamentoFolhaExecucaoRow[] = [
    ...execucoes.map((execucao) => {
      const folha = folhas.find((item) => item.id === execucao.folhaPagamentoId);
      return {
        ...execucao,
        numeroExecucao: String(execucao.id),
        numeroFolha: folha?.numero ?? "-",
        nomeFolha: folha?.nome ?? "Folha não localizada",
        competencia: folha?.competencia ?? competenciaVigente?.competencia ?? "2026-05",
        tipoProcessamento: getTipoProcessamentoExecucao(execucao),
        solicitadoEm: execucao.dataHoraInicio,
        responsavel: execucao.usuarioResponsavel,
        erros: execucao.totalErro,
        folha,
      };
    }),
    ...folhas
      .filter(
        (folha) =>
          folha.situacao === "AGUARDANDO_PROCESSAMENTO" &&
          !execucoes.some((execucao) => execucao.folhaPagamentoId === folha.id),
      )
      .map((folha) => ({
        id: 9000 + folha.id,
        folhaPagamentoId: folha.id,
        situacao: "EM_FILA" as FolhaPagamentoExecucaoSituacao,
        dataHoraInicio: folha.ultimaExecucao || "28/05/2026 10:00",
        dataHoraFim: "-",
        usuarioResponsavel: "ROBERTO JUNIOR",
        totalPessoas: folha.totalPessoas,
        totalSucesso: 0,
        totalAlerta: 0,
        totalErro: 0,
        parametrosResumo: "Execução total aguardando processamento",
        numeroExecucao: String(9000 + folha.id),
        numeroFolha: folha.numero,
        nomeFolha: folha.nome,
        competencia: folha.competencia,
        tipoProcessamento: "Total" as const,
        solicitadoEm: folha.ultimaExecucao || "28/05/2026 10:00",
        responsavel: "ROBERTO JUNIOR",
        erros: 0,
        folha,
      })),
  ];
  const competenciaProcessamentoFiltro = normalizeMesAno(filtros.competencia);
  const dataProcessamentoFiltro = filtros.dataProcessamento?.trim() ?? "";
  const folhaPagamentoFiltro = filtros.termo?.trim().toLowerCase() ?? "";
  const numeroExecucaoFiltro = filtros.numeroExecucao?.trim().toLowerCase() ?? "";
  const processamentosFiltrados = processamentosBase.filter((processamento) => {
    const atendeFolhaPagamento =
      !folhaPagamentoFiltro ||
      processamento.numeroFolha.toLowerCase().includes(folhaPagamentoFiltro) ||
      processamento.nomeFolha.toLowerCase().includes(folhaPagamentoFiltro);
    const atendeSituacao =
      !filtros.situacao || processamento.situacao === filtros.situacao;
    const atendeCompetencia =
      !competenciaProcessamentoFiltro ||
      processamento.competencia === competenciaProcessamentoFiltro;
    const atendeTipo =
      !filtros.tipoProcessamento ||
      processamento.tipoProcessamento.toUpperCase() === filtros.tipoProcessamento;
    const atendeDataProcessamento =
      !dataProcessamentoFiltro ||
      processamento.dataHoraInicio.includes(dataProcessamentoFiltro);
    const atendeNumeroExecucao =
      !numeroExecucaoFiltro ||
      processamento.numeroExecucao.toLowerCase().includes(numeroExecucaoFiltro);

    return (
      atendeFolhaPagamento &&
      atendeSituacao &&
      atendeCompetencia &&
      atendeTipo &&
      atendeDataProcessamento &&
      atendeNumeroExecucao
    );
  });
  const processamentoResults = {
    ...createResults(processamentosFiltrados),
    totalPages: Math.max(1, Math.ceil(processamentosFiltrados.length / 10)),
    totalRecords: processamentosFiltrados.length,
    size: 10,
    sizePage: 10,
  };
  const processamentoResumo = {
    emFila: processamentosFiltrados.filter((row) => row.situacao === "EM_FILA").length,
    emProcessamento: processamentosFiltrados.filter(
      (row) => row.situacao === "EM_PROCESSAMENTO",
    ).length,
    processadoErro: processamentosFiltrados.filter(
      (row) => row.situacao === "CONCLUIDA_COM_ERRO",
    ).length,
    processadoSucesso: processamentosFiltrados.filter((row) =>
      ["CONCLUIDA", "CONCLUIDA_COM_ALERTA"].includes(row.situacao),
    ).length,
  };
  const relatorioTecnicoTipoFiltroOptions = [
    { label: "Todos", value: "Todos" },
    { label: "Processado com erro", value: "Processado com erro" },
    { label: "Processado com Sucesso", value: "Processado com Sucesso" },
  ];
  const relatorioTecnicoFormatoOptions = [
    { label: ".PDF", value: ".PDF" },
    { label: ".XLSX", value: ".XLSX" },
  ];
  const processamentoTipoExecucao = watchProcessamento("tipoExecucao");
  const processamentoTotal = processamentoTipoExecucao === "TOTAL";
  const processamentoNumeroFolha = watchProcessamento("numeroFolha");
  const processamentoNomeFolha = watchProcessamento("nomeFolha");
  const processamentoNumeroFolhaOptions = Array.from(
    new Map(
      folhas.map((folha) => [
        folha.numero,
        {
          label: folha.numero.toUpperCase(),
          value: folha.numero,
        },
      ]),
    ).values(),
  );
  const processamentoNomeFolhaOptions = folhas
    .filter(
      (folha) =>
        !processamentoNumeroFolha || folha.numero === processamentoNumeroFolha,
    )
    .map((folha) => ({
      label: folha.nome.toUpperCase(),
      value: folha.nome,
    }));

  useEffect(() => {
    if (!processamentoNumeroFolha) return;

    const folhaSelecionadaPorNumero = folhas.find(
      (folha) => folha.numero === processamentoNumeroFolha,
    );
    if (
      folhaSelecionadaPorNumero &&
      processamentoNomeFolha !== folhaSelecionadaPorNumero.nome
    ) {
      setValueProcessamento("nomeFolha", folhaSelecionadaPorNumero.nome);
    }
  }, [
    folhas,
    processamentoNomeFolha,
    processamentoNumeroFolha,
    setValueProcessamento,
  ]);

  const isTextoPreenchido = (value?: string) => Boolean(value?.trim());
  const temAbrangenciaFolha = (data: FolhaPagamentoForm) =>
    Boolean(
      data.orgaos?.length ||
        data.abrangenciaRegimeJuridico?.length ||
        data.abrangenciaTipoVinculo?.length ||
        data.abrangenciaInstituicao?.length ||
        data.abrangenciaSetores?.length ||
        data.abrangenciaSubcategorias?.length ||
        data.regimeJuridico ||
        data.categoria ||
        data.cargo ||
        data.grupoEleitos,
    );

  const folhaTemHistoricoProcessamento = (folha: FolhaPagamentoRow) =>
    folha.situacao !== "RASCUNHO" && folha.situacao !== "ABERTO";

  const folhaPodeProcessar = (folha: FolhaPagamentoRow) =>
    folha.situacao === "ABERTO" ||
    folha.situacao === "PROCESSO_COM_SUCESSO" ||
    folha.situacao === "PROCESSO_COM_ERRO";

  const getMensagemBloqueioProcessamento = (folha: FolhaPagamentoRow) =>
    folhaPodeProcessar(folha)
      ? ""
      : "Só é possível processar ou reprocessar folhas abertas ou já processadas.";

  const validarObrigatoriosFolha = (data: FolhaPagamentoForm) => {
    if (!isTextoPreenchido(data.nome)) {
      return {
        tab: "dados",
        message: "Nome da folha é obrigatório.",
      };
    }

    if (!isTextoPreenchido(data.numero)) {
      return {
        tab: "dados",
        message: "Número da folha é obrigatório.",
      };
    }

    if (!isTextoPreenchido(data.competencia)) {
      return {
        tab: "dados",
        message: "Competência é obrigatória.",
      };
    }

    if (!temAbrangenciaFolha(data)) {
      return {
        tab: "abrangencia",
        message: "Informe ao menos um critério de abrangência da folha.",
      };
    }

    if (
      data.totalMesesAdiantar === undefined ||
      data.totalMesesAdiantar === null
    ) {
      return {
        tab: "parametros",
        message: "Total de meses a adiantar é obrigatório.",
      };
    }

    if (
      data.totalMesesRetroagir === undefined ||
      data.totalMesesRetroagir === null
    ) {
      return {
        tab: "parametros",
        message: "Total de meses a retroagir é obrigatório.",
      };
    }

    return null;
  };

  const validarProcessamentoFolha = (folha: FolhaPagamentoRow) => {
    const bloqueioSituacao = getMensagemBloqueioProcessamento(folha);

    if (bloqueioSituacao) return bloqueioSituacao;
    if (!isTextoPreenchido(folha.nome)) return "Nome da folha é obrigatório.";
    if (!isTextoPreenchido(folha.numero)) return "Número da folha é obrigatório.";
    if (!isMesAnoValido(folha.competencia)) {
      return "Competência é obrigatória e deve estar no formato MM/AAAA.";
    }
    if (!temAbrangenciaFolha(folha)) {
      return "Informe ao menos um critério de abrangência antes de processar a folha.";
    }
    if (folha.totalMesesAdiantar < 0 || folha.totalMesesRetroagir < 0) {
      return "Total de meses a adiantar e retroagir não pode ser menor que zero.";
    }

    return "";
  };

  const getFormErrorMessage = (name: keyof FolhaPagamentoForm) => {
    const message = errors[name]?.message;
    return message ? <small className="p-error">{String(message)}</small> : null;
  };

  const abrirNovaFolha = () => {
    navigate(FOLHA_PAGAMENTO_NOVA_PATH);
  };

  const abrirEditarFolha = (folha: FolhaPagamentoRow) => {
    setFeedback("");
    navigate(`${FOLHA_PAGAMENTO_BASE_PATH}/${folha.id}/editar`);
  };

  const abrirDetalheFolha = (folha: FolhaPagamentoRow) => {
    setFeedback("");
    navigate(getFolhaPagamentoVisualizarPath(folha.id));
  };

  const abrirModalProcessamentoFolha = (folha: FolhaPagamentoRow) => {
    const mensagemValidacao = validarProcessamentoFolha(folha);
    if (mensagemValidacao) {
      setFeedback(`Não foi possível processar a folha. ${mensagemValidacao}`);
      return;
    }

    setFolhaSelecionada(folha);
    setProcessamentoErrors({});
    resetProcessamento({
      numeroFolha: folha.numero,
      nomeFolha: folha.nome,
      competencia: formatMesAno(folha.competencia),
      tipoExecucao: "TOTAL",
      orgaos: folha.orgaos.length
        ? folha.orgaos
        : usuarioLogadoProcessamentoMock.orgaos,
      regimesJuridicos: folha.regimeJuridico
        ? [folha.regimeJuridico]
        : usuarioLogadoProcessamentoMock.regimesJuridicos,
      categorias: folha.categoria
        ? [folha.categoria]
        : usuarioLogadoProcessamentoMock.categorias,
      cargos: folha.cargo ? [folha.cargo] : usuarioLogadoProcessamentoMock.cargos,
      grupoEleitos: folha.grupoEleitos || usuarioLogadoProcessamentoMock.grupoEleitos,
    });
    setModalProcessamentoAberto(true);
  };

  const cancelarProcessamentoFolha = () => {
    setModalProcessamentoAberto(false);
    setFolhaSelecionada(null);
    setProcessamentoErrors({});
  };

  const getProcessamentoErrorMessage = (name: keyof ProcessamentoFolhaForm) => {
    const message = processamentoErrors[name];
    return message ? <small className="p-error">{message}</small> : null;
  };

  const validarFormularioProcessamento = (data: ProcessamentoFolhaForm) => {
    const errors: Partial<Record<keyof ProcessamentoFolhaForm, string>> = {};

    if (!data.numeroFolha) errors.numeroFolha = "Campo obrigatório";
    if (!data.nomeFolha) errors.nomeFolha = "Campo obrigatório";
    if (!data.competencia?.trim()) {
      errors.competencia = "Campo obrigatório";
    } else if (!isMesAnoValido(data.competencia)) {
      errors.competencia = "Formato inválido";
    }
    if (!data.tipoExecucao) errors.tipoExecucao = "Campo obrigatório";

    if (data.tipoExecucao === "PARCIAL") {
      const possuiFiltro =
        Boolean(data.orgaos?.length) ||
        Boolean(data.setores?.length) ||
        Boolean(data.regimesJuridicos?.length) ||
        Boolean(data.tiposVinculo?.length) ||
        Boolean(data.categorias?.length) ||
        Boolean(data.subcategorias?.length) ||
        Boolean(data.cargos?.length) ||
        Boolean(data.grupoEleitos);

      if (!possuiFiltro) {
        errors.orgaos = "Campo obrigatório";
      }
    }

    setProcessamentoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const salvarFolha = (data: FolhaPagamentoForm) => {
    const orgaos = data.orgaos ?? [];
    const validacaoObrigatorios = validarObrigatoriosFolha(data);

    if (validacaoObrigatorios) {
      setFormFeedback(validacaoObrigatorios.message);
      setActiveTab(validacaoObrigatorios.tab);
      return;
    }

    const totalMesesAdiantar = data.totalMesesAdiantar ?? 0;
    const totalMesesRetroagir = data.totalMesesRetroagir ?? 0;
    const competencia = normalizeMesAno(data.competencia);
    const mesAnoReferencia = competencia;
    const nome = data.nome?.trim() ?? "";
    const numero = data.numero?.trim() ?? "";

    if (!isMesAnoValido(data.competencia)) {
      setFormFeedback("Informe competência no formato MM/AAAA.");
      setActiveTab("dados");
      return;
    }

    if (totalMesesAdiantar < 0 || totalMesesRetroagir < 0) {
      setFormFeedback("Total de meses a adiantar e retroagir não pode ser menor que zero.");
      setActiveTab("parametros");
      return;
    }

    const folhaDuplicada = folhas.some((folha) => {
      if (formMode === "edit" && folha.id === folhaSelecionada?.id) return false;

      return (
        folha.numero.trim().toLowerCase() === numero.toLowerCase() &&
        folha.mesAnoReferencia === mesAnoReferencia &&
        folha.competencia === competencia &&
        folha.orgaos.map((orgao) => orgao.toLowerCase()).sort().join("|") ===
          orgaos.map((orgao) => orgao.toLowerCase()).sort().join("|")
      );
    });

    if (folhaDuplicada) {
      setFormFeedback("Já existe folha cadastrada para a combinação de número, referência, competência e órgão(s).");
      setActiveTab("dados");
      return;
    }

    if (formMode === "edit" && folhaSelecionada) {
      folhaPagamentoService.atualizarFolha(folhaSelecionada.id, {
        ...data,
        nome,
        numero,
        mesAnoReferencia,
        competencia,
        orgaos,
        totalMesesAdiantar,
        totalMesesRetroagir,
      });
      setFolhas((current) =>
        current.map((folha) =>
          folha.id === folhaSelecionada.id
            ? {
                ...folha,
                competenciaId: data.competenciaId ?? folha.competenciaId,
                grupoFolhaId: data.grupoFolhaId ?? folha.grupoFolhaId,
                nome,
                numero,
                mesAnoReferencia,
                competencia,
                observacao: data.observacao ?? "",
                orgaos,
                regimeJuridico: data.regimeJuridico ?? "",
                categoria: data.categoria ?? "",
                cargo: data.cargo ?? "",
                grupoEleitos: data.grupoEleitos ?? "",
                totalMesesAdiantar,
                totalMesesRetroagir,
              }
            : folha,
        ),
      );
      setFeedback("Folha atualizada com sucesso.");
    } else {
      folhaPagamentoService.criarFolha({
        ...data,
        nome,
        numero,
        mesAnoReferencia,
        competencia,
        orgaos,
        totalMesesAdiantar,
        totalMesesRetroagir,
      });
      setFolhas((current) => [
        {
          id: Math.max(...current.map((folha) => folha.id), 0) + 1,
          competenciaId: data.competenciaId ?? 0,
          grupoFolhaId: data.grupoFolhaId ?? 0,
          nome,
          numero,
          mesAnoReferencia,
          competencia,
          observacao: data.observacao ?? "",
          orgaos,
          regimeJuridico: data.regimeJuridico ?? "",
          categoria: data.categoria ?? "",
          cargo: data.cargo ?? "",
          grupoEleitos: data.grupoEleitos ?? "",
          totalMesesAdiantar,
          totalMesesRetroagir,
          situacao: "RASCUNHO",
          totalPessoas: 0,
          totalSucesso: 0,
          totalAlerta: 0,
          totalErro: 0,
          ultimaExecucao: "-",
        },
        ...current,
      ]);
      setFeedback("Folha cadastrada com sucesso.");
    }

    setModalFormularioAberto(false);
  };

  const processarFolha = (folha: FolhaPagamentoRow, data?: ProcessamentoFolhaForm) => {
    const mensagemValidacao = validarProcessamentoFolha(folha);
    if (mensagemValidacao) {
      setFeedback(`Não foi possível processar a folha. ${mensagemValidacao}`);
      return;
    }

    const competenciaProcessamento = normalizeMesAno(data?.competencia ?? folha.competencia);
    if (!isMesAnoValido(data?.competencia ?? folha.competencia)) {
      setFeedback("Não foi possível processar a folha. Competência deve estar no formato MM/AAAA.");
      return;
    }

    folhaPagamentoService.executarFolha({ folhaPagamentoId: folha.id });

    const novaExecucao: FolhaPagamentoExecucaoRow = {
      id: Math.max(...execucoes.map((execucao) => execucao.id), 1000) + 1,
      folhaPagamentoId: folha.id,
      situacao: "EM_FILA",
      dataHoraInicio: "28/05/2026 10:00",
      dataHoraFim: "-",
      usuarioResponsavel: "ROBERTO JUNIOR",
      totalPessoas: folha.totalPessoas,
      totalSucesso: 0,
      totalAlerta: 0,
      totalErro: 0,
      parametrosResumo:
        data?.tipoExecucao === "PARCIAL"
          ? `Execução parcial da competência ${formatMesAno(competenciaProcessamento)}`
          : `Execução total da competência ${formatMesAno(competenciaProcessamento)}`,
    };

    setExecucoes((current) => [novaExecucao, ...current]);
    setFolhas((current) =>
      current.map((item) =>
        item.id === folha.id
          ? {
            ...item,
              competencia: competenciaProcessamento,
              mesAnoReferencia: competenciaProcessamento,
              situacao: "AGUARDANDO_PROCESSAMENTO",
              ultimaExecucao: "28/05/2026 10:00",
            }
          : item,
      ),
    );
    setModalProcessamentoAberto(false);
    setFolhaSelecionada(null);
    setProcessamentoErrors({});
    setFeedback("Registro cadastrado com sucesso!");
  };

  const confirmarProcessamentoFolha = (data: ProcessamentoFolhaForm) => {
    if (!validarFormularioProcessamento(data)) return;

    const folhaParaProcessar = folhas.find(
      (folha) =>
        folha.numero === data.numeroFolha && folha.nome === data.nomeFolha,
    );
    if (!folhaParaProcessar) {
      setProcessamentoErrors({
        numeroFolha: "Campo obrigatório",
        nomeFolha: "Campo obrigatório",
      });
      return;
    }

    processarFolha(folhaParaProcessar, data);
  };

  const abrirExecucoesFolha = (folha: FolhaPagamentoRow) => {
    setFolhaSelecionada(folha);
    setModalExecucoesAberto(true);
  };

  const folhaPossuiProcessamentoRegistrado = (folha: FolhaPagamentoRow) =>
    execucoes.some((execucao) => execucao.folhaPagamentoId === folha.id) ||
    folhaTemHistoricoProcessamento(folha);

  const solicitarExclusaoFolha = (folha: FolhaPagamentoRow) => {
    if (folhaPossuiProcessamentoRegistrado(folha)) {
      setFeedback(
        "Não é permitido excluir esta folha, pois ela já possui processamento registrado.",
      );
      return;
    }

    setFeedback("");
    setFolhaParaExcluir(folha);
    setModalExclusaoAberto(true);
  };

  const cancelarExclusaoFolha = () => {
    setModalExclusaoAberto(false);
    setFolhaParaExcluir(null);
  };

  const confirmarExclusaoFolha = () => {
    if (!folhaParaExcluir) return;

    folhaPagamentoService.excluirFolha(folhaParaExcluir.id);
    setFolhas((current) =>
      current.filter((item) => item.id !== folhaParaExcluir.id),
    );
    cancelarExclusaoFolha();
    setFeedback("Folha excluída com sucesso.");
  };

  const abrirProcessamentoDireto = (folha: FolhaPagamentoRow) => {
    if (!folhaPodeProcessar(folha)) {
      setFeedback(getMensagemBloqueioProcessamento(folha));
      return;
    }

    navigate(`${FOLHA_PROCESSAMENTO_BASE_PATH}/novo?folhaId=${folha.id}`);
  };

  const folhaColumns: ColumnMetaSeplag<FolhaPagamentoRow>[] = [
    { field: "numero", header: "Número" },
    { field: "nome", header: "Nome" },
    {
      header: "Ação",
      body: (row) => (
        <div className="acoes-table" style={{ display: "flex", gap: "8px" }}>
          <BotaoIconSeplag
            type="button"
            tooltip="Visualizar"
            icon="pi pi-eye"
            onClick={() => abrirDetalheFolha(row)}
          />
          <BotaoIconSeplag
            type="button"
            tooltip="Editar folha"
            icon="pi pi-pencil"
            style={{ backgroundColor: "#fbc02d", color: "#ffffff" }}
            onClick={() => abrirEditarFolha(row)}
          />
          <BotaoIconSeplag
            type="button"
            tooltip={
              folhaPodeProcessar(row)
                ? "Processar esta folha"
                : "Processamento indisponível para esta situação"
            }
            icon="pi pi-play"
            disabled={!folhaPodeProcessar(row)}
            onClick={() => abrirProcessamentoDireto(row)}
          />
          <BotaoIconSeplag
            type="button"
            tooltip="Excluir"
            icon="pi pi-trash"
            severity="danger"
            onClick={() => solicitarExclusaoFolha(row)}
          />
        </div>
      ),
    },
  ];

  const renderDataHoraProcessamento = (dataHora: string) => {
    if (!dataHora || dataHora === "-") return "-";

    const [data, hora] = dataHora.split(" ");
    return (
      <span className="prototype-processamento-data-hora">
        <strong>{data}</strong>
        <small>{hora}</small>
      </span>
    );
  };

  const processamentoColumns: ColumnMetaSeplag<ProcessamentoFolhaExecucaoRow>[] = [
    { field: "numeroExecucao", header: "Nº Execução" },
    { field: "numeroFolha", header: "Nº Folha" },
    { field: "nomeFolha", header: "Nome da Folha" },
    { header: "Competência", body: (row) => formatMesAno(row.competencia) },
    { field: "tipoProcessamento", header: "Tipo" },
    {
      header: "Início",
      body: (row) => renderDataHoraProcessamento(row.dataHoraInicio),
    },
    {
      header: "Término",
      body: (row) => renderDataHoraProcessamento(row.dataHoraFim),
    },
    {
      header: "Tempo",
      body: (row) => getTempoExecucaoFolha(row),
    },
    { field: "responsavel", header: "Responsável" },
    { field: "erros", header: "Erros" },
    {
      header: "Situação",
      body: (row) => renderProcessamentoSituacaoBadge(row.situacao),
    },
  ];

  const execucoesFolha = folhaSelecionada
    ? execucoes.filter(
        (execucao) => execucao.folhaPagamentoId === folhaSelecionada.id,
      )
    : [];
  const execucoesResults = createResults(execucoesFolha);

  const renderDataHoraExecucao = (dataHora: string) => {
    if (!dataHora || dataHora === "-") return "-";

    const [data, hora] = dataHora.split(" ");
    return (
      <span className="prototype-folha-execucao-date">
        <strong>{data}</strong>
        <small>{hora}</small>
      </span>
    );
  };

  const getTempoExecucaoFolha = (execucao: FolhaPagamentoExecucaoRow) => {
    if (!execucao.dataHoraInicio || execucao.dataHoraFim === "-") return "-";

    const parseDataHora = (value: string) => {
      const [data, hora] = value.split(" ");
      const [dia, mes, ano] = data.split("/").map(Number);
      const [horas, minutos] = hora.split(":").map(Number);
      return new Date(ano, mes - 1, dia, horas, minutos);
    };

    const inicio = parseDataHora(execucao.dataHoraInicio);
    const fim = parseDataHora(execucao.dataHoraFim);
    const totalMinutos = Math.max(
      0,
      Math.round((fim.getTime() - inicio.getTime()) / 60000),
    );

    if (totalMinutos < 60) return `${totalMinutos} min`;

    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return minutos ? `${horas}h ${minutos}min` : `${horas}h`;
  };

  const execucaoColumns: ColumnMetaSeplag<FolhaPagamentoExecucaoRow>[] = [
    { field: "id", header: "Número da execução" },
    {
      header: "Situação",
      body: (row) => renderExecucaoSituacaoBadge(row.situacao),
    },
    {
      header: "Solicitação",
      body: (row) => renderDataHoraExecucao(row.dataHoraInicio),
    },
    {
      header: "Início",
      body: (row) => renderDataHoraExecucao(row.dataHoraInicio),
    },
    {
      header: "Término",
      body: (row) => renderDataHoraExecucao(row.dataHoraFim),
    },
    {
      header: "Tempo",
      body: (row) => getTempoExecucaoFolha(row),
    },
    { field: "usuarioResponsavel", header: "Quem executou" },
  ];

  const logFiltros = watchLog();
  const logsDaExecucao = execucaoSelecionada
    ? pessoaLogs.filter(
        (log) => log.execucaoId === execucaoSelecionada.id,
      )
    : [];
  const rubricasDaPessoa = pessoaLogSelecionada
    ? rubricaLogs.filter(
        (rubrica) => rubrica.pessoaLogId === pessoaLogSelecionada.id,
      )
    : [];
  const logsFiltrados = logsDaExecucao.filter((log) => {
    const rubricasPessoa = rubricaLogs.filter(
      (rubrica) => rubrica.pessoaLogId === log.id,
    );
    const rubricaBusca = logFiltros.rubrica?.trim().toLowerCase();

    return (
      (!logFiltros.matricula ||
        `${log.matricula}/${log.vinculo}`.includes(logFiltros.matricula)) &&
      (!logFiltros.nome ||
        log.nome.toLowerCase().includes(logFiltros.nome.toLowerCase())) &&
      (!logFiltros.cpf || log.cpf.includes(logFiltros.cpf)) &&
      (!logFiltros.orgao || log.orgao === logFiltros.orgao) &&
      (!logFiltros.situacao || log.situacao === logFiltros.situacao) &&
      (!logFiltros.mensagem ||
        log.mensagem.toLowerCase().includes(logFiltros.mensagem.toLowerCase())) &&
      (!rubricaBusca ||
        rubricasPessoa.some(
          (rubrica) =>
            rubrica.codigoRubrica.toLowerCase().includes(rubricaBusca) ||
            rubrica.nomeRubrica.toLowerCase().includes(rubricaBusca),
        ))
    );
  });
  const logResults = createResults(logsFiltrados);
  const rubricasResults = createResults(rubricasDaPessoa);
  const parseDataHoraBrTimestamp = (value: string) => {
    const [data, hora] = value.split(" ");
    const [dia, mes, ano] = data.split("/").map(Number);
    const [horas, minutos] = hora.split(":").map(Number);
    return new Date(ano, mes - 1, dia, horas, minutos).getTime();
  };
  const criarRelatoriosTecnicosExemplo = (
    processamento: ProcessamentoFolhaExecucaoRow,
  ): RelatorioTecnicoProcessamentoRow[] => [
    {
      id: Number(`${processamento.id}01`),
      execucaoId: processamento.id,
      dataHoraEmissao: "24/05/2026 09:40",
      responsavel: "ROBERTO JUNIOR",
      tipoFiltro: "Todos",
      quantidadeErros: processamento.erros,
      quantidadeRegistros: processamento.totalPessoas,
      formato: ".PDF",
      situacao: "Em Emissão",
    },
    {
      id: Number(`${processamento.id}02`),
      execucaoId: processamento.id,
      dataHoraEmissao: "24/05/2026 08:35",
      responsavel: "ROBERTO JUNIOR",
      tipoFiltro: "Processado com Sucesso",
      quantidadeErros: 0,
      quantidadeRegistros: processamento.totalPessoas,
      formato: ".PDF",
      situacao: "Emitido",
    },
    {
      id: Number(`${processamento.id}03`),
      execucaoId: processamento.id,
      dataHoraEmissao: "24/05/2026 08:10",
      responsavel: "ROBERTO JUNIOR",
      tipoFiltro: "Processado com erro",
      quantidadeErros: processamento.erros,
      quantidadeRegistros: processamento.totalPessoas,
      formato: ".XLSX",
      situacao: "Falha na Emissão",
    },
  ];
  const relatoriosTecnicosDaExecucaoBase =
    processamentoRelatorioTecnicoSelecionado
      ? [
          ...relatoriosTecnicos.filter(
            (relatorio) =>
              relatorio.execucaoId === processamentoRelatorioTecnicoSelecionado.id,
          ),
          ...criarRelatoriosTecnicosExemplo(
            processamentoRelatorioTecnicoSelecionado,
          ).filter(
            (relatorioExemplo) =>
              !relatoriosTecnicos.some(
                (relatorio) =>
                  relatorio.execucaoId === relatorioExemplo.execucaoId &&
                  relatorio.situacao === relatorioExemplo.situacao,
              ),
          ),
        ]
          .sort(
            (a, b) =>
              parseDataHoraBrTimestamp(b.dataHoraEmissao) -
              parseDataHoraBrTimestamp(a.dataHoraEmissao),
          )
      : [];
  const relatoriosTecnicosDaExecucao = relatorioTecnicoSimularVazio
    ? []
    : relatoriosTecnicosDaExecucaoBase;
  const relatorioTecnicoResults = {
    ...createResults(relatoriosTecnicosDaExecucao),
    totalPages: Math.max(
      1,
      Math.ceil(relatoriosTecnicosDaExecucao.length / 10),
    ),
    totalRecords: relatoriosTecnicosDaExecucao.length,
    size: 10,
    sizePage: 10,
  };
  const logPessoaColumns: ColumnMetaSeplag<FolhaPagamentoPessoaLogRow>[] = [
    { header: "Matrícula/vínculo", body: (row) => `${row.matricula}/${row.vinculo}` },
    { field: "nome", header: "Nome" },
    { field: "cpf", header: "CPF" },
    { field: "orgao", header: "Órgão" },
    { field: "cargo", header: "Cargo" },
    {
      header: "Situação",
      body: (row) => renderPessoaLogSituacaoBadge(row.situacao),
    },
    { field: "mensagem", header: "Mensagem" },
  ];
  const relatorioTecnicoColumns: ColumnMetaSeplag<RelatorioTecnicoProcessamentoRow>[] = [
    { field: "dataHoraEmissao", header: "Data/Hora da Emissão" },
    { field: "responsavel", header: "Responsável" },
    { field: "tipoFiltro", header: "Tipo do Filtro" },
    { field: "quantidadeErros", header: "Quantidade de Erros" },
    { field: "quantidadeRegistros", header: "Quantidade de Registros" },
    { field: "formato", header: "Formato" },
    {
      header: "Situação",
      body: (row) => (
        <span
          className={`prototype-relatorio-tecnico-situacao prototype-relatorio-tecnico-situacao--${row.situacao
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-")}`}
        >
          {row.situacao}
        </span>
      ),
    },
  ];
  const rubricaLogColumns: ColumnMetaSeplag<FolhaPagamentoRubricaLogRow>[] = [
    { field: "codigoRubrica", header: "Código" },
    { field: "nomeRubrica", header: "Rubrica" },
    { field: "tipoRubrica", header: "Tipo" },
    { field: "valorCalculado", header: "Valor calculado" },
    {
      header: "Situação",
      body: (row) => renderRubricaLogSituacaoBadge(row.situacao),
    },
    { field: "mensagem", header: "Mensagem" },
  ];

  const renderAcoesFolha = (folha: FolhaPagamentoRow) => (
    <>
      <BotaoIconSeplag
        type="button"
        tooltip="Visualizar"
        icon="pi pi-eye"
        onClick={() => abrirDetalheFolha(folha)}
      />
      <BotaoIconSeplag
        type="button"
        tooltip="Editar folha"
        icon="pi pi-pencil"
        style={{ backgroundColor: "#fbc02d", color: "#ffffff" }}
        onClick={() => abrirEditarFolha(folha)}
      />
      <BotaoIconSeplag
        type="button"
        tooltip={
          folhaPodeProcessar(folha)
            ? folha.situacao === "ABERTO"
              ? "Processar folha"
              : "Reprocessar folha"
            : "Processamento indisponível para esta situação"
        }
        icon="pi pi-play"
        disabled={!folhaPodeProcessar(folha)}
        onClick={() => abrirModalProcessamentoFolha(folha)}
      />
      {folhaTemHistoricoProcessamento(folha) ? (
        <BotaoIconSeplag
          type="button"
          tooltip="Histórico do processamento"
          icon="pi pi-history"
          disabled={!execucoes.some((execucao) => execucao.folhaPagamentoId === folha.id)}
          onClick={() => abrirExecucoesFolha(folha)}
        />
      ) : null}
      <BotaoIconSeplag
        type="button"
        tooltip="Excluir"
        icon="pi pi-trash"
        style={{ backgroundColor: "#d32f2f", color: "#ffffff" }}
        onClick={() => solicitarExclusaoFolha(folha)}
      />
    </>
  );

  const abrirNovoProcessamento = () => {
    navigate(`${FOLHA_PROCESSAMENTO_BASE_PATH}/novo`);
  };

  const abrirVisualizarProcessamento = (
    processamento: ProcessamentoFolhaExecucaoRow,
  ) => {
    setExecucaoSelecionada(processamento);
    setModalLogAberto(true);
  };

  const abrirRelatorioTecnicoProcessamento = (
    processamento: ProcessamentoFolhaExecucaoRow,
  ) => {
    setProcessamentoRelatorioTecnicoSelecionado(processamento);
    setRelatorioTecnicoSimularVazio(false);
    setModalRelatorioTecnicoAberto(true);
    setFeedback("");
  };

  const fecharRelatorioTecnicoProcessamento = () => {
    setModalRelatorioTecnicoAberto(false);
    setModalEmitirRelatorioTecnicoAberto(false);
    setProcessamentoRelatorioTecnicoSelecionado(null);
    setRelatorioTecnicoErrors({});
    setRelatorioTecnicoSimularVazio(false);
  };

  const abrirEmitirRelatorioTecnico = () => {
    setRelatorioTecnicoErrors({});
    resetRelatorioTecnico({
      tipoFiltro: "",
      formatoArquivo: "",
    });
    setModalEmitirRelatorioTecnicoAberto(true);
  };

  const simularDownloadRelatorioTecnico = (
    relatorio: RelatorioTecnicoProcessamentoRow,
  ) => {
    const conteudo = [
      "Relatório Técnico do Processamento da Folha",
      `Execução: ${relatorio.execucaoId}`,
      `Tipo do filtro: ${relatorio.tipoFiltro}`,
      `Formato: ${relatorio.formato}`,
    ].join("\n");
    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-tecnico-${relatorio.execucaoId}${relatorio.formato.toLowerCase()}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const baixarRelatorioTecnico = (
    relatorio: RelatorioTecnicoProcessamentoRow,
  ) => {
    simularDownloadRelatorioTecnico(relatorio);
    setFeedback("Download do relatório técnico iniciado.");
  };

  const getRelatorioTecnicoErrorMessage = (
    name: keyof RelatorioTecnicoProcessamentoForm,
  ) => {
    const message =
      relatorioTecnicoErrors[name] ??
      relatorioTecnicoFormErrors[name]?.message;
    return message ? <small className="p-error">{message}</small> : null;
  };

  const confirmarEmissaoRelatorioTecnico = (
    data: RelatorioTecnicoProcessamentoForm,
  ) => {
    const errors: Partial<
      Record<keyof RelatorioTecnicoProcessamentoForm, string>
    > = {};

    if (!data.tipoFiltro) errors.tipoFiltro = "Campo obrigatório";
    if (!data.formatoArquivo) errors.formatoArquivo = "Campo obrigatório";

    setRelatorioTecnicoErrors(errors);
    if (Object.keys(errors).length || !processamentoRelatorioTecnicoSelecionado) {
      return;
    }

    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");
    const dataHoraEmissao = `${pad(now.getDate())}/${pad(
      now.getMonth() + 1,
    )}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const quantidadeErros =
      data.tipoFiltro === "Processado com Sucesso"
        ? 0
        : processamentoRelatorioTecnicoSelecionado.erros;
    const quantidadeRegistros =
      data.tipoFiltro === "Processado com erro"
        ? processamentoRelatorioTecnicoSelecionado.erros
        : processamentoRelatorioTecnicoSelecionado.totalPessoas;
    const novoRelatorio: RelatorioTecnicoProcessamentoRow = {
      id: Math.max(...relatoriosTecnicos.map((relatorio) => relatorio.id), 0) + 1,
      execucaoId: processamentoRelatorioTecnicoSelecionado.id,
      dataHoraEmissao,
      responsavel: "ROBERTO JUNIOR",
      tipoFiltro: data.tipoFiltro,
      quantidadeErros,
      quantidadeRegistros,
      formato: data.formatoArquivo,
      situacao: "Emitido",
    };

    setRelatoriosTecnicos((current) => [novoRelatorio, ...current]);
    simularDownloadRelatorioTecnico(novoRelatorio);
    setModalEmitirRelatorioTecnicoAberto(false);
    setRelatorioTecnicoErrors({});
    setFeedback("Relatório técnico emitido com sucesso.");
  };

  const renderAcoesProcessamento = (
    processamento: ProcessamentoFolhaExecucaoRow,
  ) => {
    const podeExibirRelatorioTecnico = [
      "CONCLUIDA",
      "CONCLUIDA_COM_ALERTA",
      "CONCLUIDA_COM_ERRO",
    ].includes(processamento.situacao);

    return (
      <>
        <BotaoIconSeplag
          type="button"
          tooltip="Visualizar"
          icon="pi pi-eye"
          onClick={() => abrirVisualizarProcessamento(processamento)}
        />
        {podeExibirRelatorioTecnico ? (
          <BotaoIconSeplag
            type="button"
            tooltip="Relatório Técnico"
            icon="pi pi-file-pdf"
            onClick={() => abrirRelatorioTecnicoProcessamento(processamento)}
          />
        ) : null}
      </>
    );
  };

  const handleFolhaFormInvalido = (
    formErrors: FieldErrors<FolhaPagamentoForm>,
  ) => {
    const dadosFields: Array<keyof FolhaPagamentoForm> = [
      "nome",
      "numero",
      "competencia",
    ];
    const abrangenciaFields: Array<keyof FolhaPagamentoForm> = [
      "orgaos",
      "regimeJuridico",
      "categoria",
      "cargo",
      "grupoEleitos",
    ];

    if (dadosFields.some((field) => formErrors[field])) {
      setActiveTab("dados");
    } else if (abrangenciaFields.some((field) => formErrors[field])) {
      setActiveTab("abrangencia");
    } else {
      setActiveTab("parametros");
    }

    setFormFeedback("Preencha os campos obrigatórios e corrija os valores inválidos antes de salvar.");
  };

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-folha-pagamento-page">
        <CardSeplag
          title={title}
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
          actions={
            <div className="prototype-competencia-vigente">
              Competência vigente:{" "}
              <strong>{formatMesAno(competenciaVigente?.competencia ?? "")}</strong>
            </div>
          }
        >
          {feedback ? (
            <div className="prototype-validation-panel">{feedback}</div>
          ) : null}

          {isTelaProcessamentoFolha ? (
            <div className="col-12 prototype-processamento-resumo">
              <div className="prototype-processamento-resumo-card prototype-processamento-resumo-card--fila">
                <span>Em Fila</span>
                <strong>{processamentoResumo.emFila}</strong>
              </div>
              <div className="prototype-processamento-resumo-card prototype-processamento-resumo-card--processamento">
                <span>Em Processamento</span>
                <strong>{processamentoResumo.emProcessamento}</strong>
              </div>
              <div className="prototype-processamento-resumo-card prototype-processamento-resumo-card--erro">
                <span>Processado com Erro</span>
                <strong>{processamentoResumo.processadoErro}</strong>
              </div>
              <div className="prototype-processamento-resumo-card prototype-processamento-resumo-card--sucesso">
                <span>Processado com Sucesso</span>
                <strong>{processamentoResumo.processadoSucesso}</strong>
              </div>
            </div>
          ) : null}

          <div
            className={`col-12 prototype-category-filters prototype-folha-pagamento-filters${
              isTelaProcessamentoFolha
                ? " prototype-processamento-folha-filters"
                : ""
            }`}
          >
            {isTelaProcessamentoFolha ? (
              <>
                <TextFieldSeplag
                  name="termo"
                  control={control}
                  label="Folha de pagamento"
                  cols="12 6 3"
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="competencia"
                  control={control}
                  label="Competência"
                  placeholder="MM/AAAA"
                  cols="12 6 1"
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="dataProcessamento"
                  control={control}
                  label="Data do processamento"
                  placeholder="DD/MM/AAAA"
                  cols="12 6 1"
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="numeroExecucao"
                  control={control}
                  label="Nº da Execução"
                  cols="12 6 2"
                  getFormErrorMessage={() => null}
                />
                <DropdownFieldSeplag
                  name="situacao"
                  control={control}
                  label="Situação"
                  cols="12 6 2"
                  options={processamentoFolhaSituacaoOptions}
                  optionLabel="label"
                  optionValue="value"
                  getFormErrorMessage={() => null}
                />
              </>
            ) : (
              <>
                <TextFieldSeplag
                  name="numeroFolha"
                  control={control}
                  label="Número da folha"
                  cols="12 12 4"
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="nomeFolha"
                  control={control}
                  label="Nome da folha"
                  cols="12 12 4"
                  getFormErrorMessage={() => null}
                />
              </>
            )}
            <div className="prototype-category-clear col-12 md:col-6 lg:col-1">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={() =>
                  reset({
                    termo: "",
                    numeroFolha: "",
                    nomeFolha: "",
                    competencia: "",
                    dataProcessamento: "",
                    numeroExecucao: "",
                    tipoProcessamento: "",
                    situacao: "",
                    responsavel: "",
                  })
                }
              />
            </div>
          </div>

          <div className="col-12 prototype-folha-pagamento-actions">
            <BotaoSeplag
              type="button"
              label={isTelaProcessamentoFolha ? "Novo Processamento" : "Nova Folha"}
              icon="pi pi-plus"
              onClick={isTelaProcessamentoFolha ? abrirNovoProcessamento : abrirNovaFolha}
            />
          </div>

          <div
            className={`col-12 prototype-folha-pagamento-table${
              isTelaProcessamentoFolha ? " prototype-processamento-table" : ""
            }`}
          >
            <TablePaginadoSeplag
              dataKey="id"
              data={isTelaProcessamentoFolha ? processamentoResults : folhaResults}
              rows={10}
              rowsPerPage={[10, 20, 50]}
              paginator
              lazy={false}
              selectionMode={null}
              columns={isTelaProcessamentoFolha ? processamentoColumns : folhaColumns}
              hasEventoAcao={isTelaProcessamentoFolha}
              renderBotoes={
                isTelaProcessamentoFolha
                  ? renderAcoesProcessamento
                  : undefined
              }
              handleOnPageChange={() => {}}
            />
          </div>
        </CardSeplag>

        <ModalSeplag
          visible={modalExclusaoAberto}
          titulo="Confirmar exclusão"
          fechar={cancelarExclusaoFolha}
          tamanho="520px"
          customFooter={
            <div className="prototype-form-actions">
              <BotaoVoltarSeplag
                type="button"
                label="Cancelar"
                icon="pi pi-times"
                onClick={cancelarExclusaoFolha}
              />
              <BotaoSeplag
                type="button"
                label="Excluir"
                icon="pi pi-trash"
                style={{ backgroundColor: "#d32f2f", color: "#ffffff" }}
                onClick={confirmarExclusaoFolha}
              />
            </div>
          }
        >
          <div className="col-12 prototype-catalogo-view-content">
            <p>
              Deseja realmente excluir a folha{" "}
              <strong>{folhaParaExcluir?.nome}</strong>?
            </p>
            <p>Esta ação não poderá ser desfeita.</p>
          </div>
        </ModalSeplag>

        <ModalSeplag
          visible={modalProcessamentoAberto}
          titulo={
            <div className="prototype-processamento-folha-header">
              <span>Processamento da Folha</span>
              <div className="prototype-processamento-folha-topbar">
                <span>Competência vigente:</span>
                <strong>{formatMesAno(competenciaVigente?.competencia ?? "")}</strong>
              </div>
            </div>
          }
          fechar={cancelarProcessamentoFolha}
          tamanho="920px"
          customFooter={
            <div className="prototype-processamento-folha-footer">
              <BotaoVoltarSeplag
                type="button"
                label="Cancelar"
                icon="pi pi-times"
                onClick={cancelarProcessamentoFolha}
              />
              <BotaoSeplag
                type="button"
                variant="save"
                label="Executar Processamento"
                icon="pi pi-play"
                onClick={handleSubmitProcessamento(confirmarProcessamentoFolha)}
              />
            </div>
          }
        >
          <div className="col-12 prototype-processamento-folha-modal">
            <div className="grid prototype-category-form-fields">
              <DropdownFieldSeplag
                name="numeroFolha"
                control={processamentoControl}
                label="Número da Folha"
                cols="12 12 6"
                required
                options={processamentoNumeroFolhaOptions}
                optionLabel="label"
                optionValue="value"
                getFormErrorMessage={() => getProcessamentoErrorMessage("numeroFolha")}
              />
              <DropdownFieldSeplag
                name="nomeFolha"
                control={processamentoControl}
                label="Nome da Folha"
                cols="12 12 6"
                required
                options={processamentoNomeFolhaOptions}
                optionLabel="label"
                optionValue="value"
                getFormErrorMessage={() => getProcessamentoErrorMessage("nomeFolha")}
              />
              <TextFieldSeplag
                name="competencia"
                control={processamentoControl}
                label="Competência"
                placeholder="MM/AAAA"
                cols="12 12 6"
                required
                maxLength={7}
                getFormErrorMessage={() => getProcessamentoErrorMessage("competencia")}
              />
              <RadioButtonFieldSeplag
                name="tipoExecucao"
                control={processamentoControl}
                label="Tipo de execução"
                cols="12 12 6"
                required
                options={[
                  { label: "Parcial", value: "PARCIAL" },
                  { label: "Total", value: "TOTAL" },
                ]}
                getFormErrorMessage={() => getProcessamentoErrorMessage("tipoExecucao")}
              />
              <MultiSelectFieldSeplag
                name="orgaos"
                control={processamentoControl}
                label="Órgãos"
                cols="12 12 6"
                options={processamentoOrgaoOptions}
                optionLabel="label"
                optionValue="value"
                selectedItemsLabel="{0} órgãos selecionados"
                disabled={processamentoTotal}
                getFormErrorMessage={() => getProcessamentoErrorMessage("orgaos")}
              />
              <MultiSelectFieldSeplag
                name="regimesJuridicos"
                control={processamentoControl}
                label="Regime jurídico"
                cols="12 12 6"
                options={processamentoRegimeOptions}
                optionLabel="label"
                optionValue="value"
                selectedItemsLabel="{0} regimes selecionados"
                disabled={processamentoTotal}
                getFormErrorMessage={() => getProcessamentoErrorMessage("regimesJuridicos")}
              />
              <MultiSelectFieldSeplag
                name="categorias"
                control={processamentoControl}
                label="Categoria"
                cols="12 12 4"
                options={processamentoCategoriaOptions}
                optionLabel="label"
                optionValue="value"
                selectedItemsLabel="{0} categorias selecionadas"
                disabled={processamentoTotal}
                getFormErrorMessage={() => getProcessamentoErrorMessage("categorias")}
              />
              <MultiSelectFieldSeplag
                name="cargos"
                control={processamentoControl}
                label="Cargo"
                cols="12 12 4"
                options={processamentoCargoOptions}
                optionLabel="label"
                optionValue="value"
                selectedItemsLabel="{0} cargos selecionados"
                disabled={processamentoTotal}
                getFormErrorMessage={() => getProcessamentoErrorMessage("cargos")}
              />
              <DropdownFieldSeplag
                name="grupoEleitos"
                control={processamentoControl}
                label="Grupo de eleitos"
                cols="12 12 4"
                options={processamentoGrupoEleitosOptions}
                optionLabel="label"
                optionValue="value"
                disabled={processamentoTotal}
                getFormErrorMessage={() => getProcessamentoErrorMessage("grupoEleitos")}
              />
            </div>
          </div>
        </ModalSeplag>

        <ModalSeplag
          visible={modalFormularioAberto}
          titulo={`${formMode === "edit" ? "Alterar" : "Cadastrar"} - Folha de Pagamento`}
          fechar={() => setModalFormularioAberto(false)}
          labelAcao="Salvar"
          iconAcao="pi pi-save"
          funcAcao={handleSubmit(salvarFolha, handleFolhaFormInvalido)}
          tamanho="960px"
        >
          <div className="col-12 prototype-folha-pagamento-form">
            {formFeedback ? (
              <div className="prototype-validation-panel">{formFeedback}</div>
            ) : null}
            <TabsSeplag
              items={folhaPagamentoTabs}
              activeValue={activeTab}
              onChange={setActiveTab}
              equalWidth
            />

            {activeTab === "dados" && (
              <div className="grid prototype-category-form-fields">
                <DropdownFieldSeplag
                  name="grupoFolhaId"
                  control={formControl}
                  label="Grupo de cálculo origem"
                  cols="12 12 6"
                  required
                  options={[
                    { label: "Selecione...", value: 0 },
                    ...gruposFolha.map((grupo) => ({
                      label: `${grupo.codigo} - ${grupo.grupo}`,
                      value: grupo.id,
                    })),
                  ]}
                  optionLabel="label"
                  optionValue="value"
                  getFormErrorMessage={() => getFormErrorMessage("grupoFolhaId")}
                />
                <TextFieldSeplag
                  name="nome"
                  control={formControl}
                  label="Nome da folha"
                  cols="12 12 6"
                  required
                  getFormErrorMessage={() => getFormErrorMessage("nome")}
                />
                <TextFieldSeplag
                  name="numero"
                  control={formControl}
                  label="Número da folha"
                  cols="12 12 3"
                  required
                  getFormErrorMessage={() => getFormErrorMessage("numero")}
                />
                <TextFieldSeplag
                  name="competencia"
                  control={formControl}
                  label="Competência"
                  placeholder="MM/AAAA"
                  cols="12 12 3"
                  required
                  rules={{
                    validate: (value) =>
                      isMesAnoValido(value) || "Informe no formato MM/AAAA.",
                  }}
                  getFormErrorMessage={() => getFormErrorMessage("competencia")}
                />
                <TextAreaFieldSeplag
                  name="observacao"
                  control={formControl}
                  label="Observação"
                  cols="12"
                  rows={4}
                  maxLength={500}
                  getFormErrorMessage={() => getFormErrorMessage("observacao")}
                />
              </div>
            )}

            {activeTab === "abrangencia" && (
              <div className="grid prototype-category-form-fields">
                <MultiSelectFieldSeplag
                  name="orgaos"
                  control={formControl}
                  label="Órgãos"
                  cols="12 12 6"
                  options={folhaPagamentoOrgaoOptions}
                  optionLabel="label"
                  optionValue="value"
                  selectedItemsLabel="{0} órgãos selecionados"
                  getFormErrorMessage={() => getFormErrorMessage("orgaos")}
                />
                <DropdownFieldSeplag
                  name="regimeJuridico"
                  control={formControl}
                  label="Regime jurídico"
                  cols="12 12 6"
                  options={folhaPagamentoRegimeOptions}
                  optionLabel="label"
                  optionValue="value"
                  getFormErrorMessage={() =>
                    getFormErrorMessage("regimeJuridico")
                  }
                />
                <DropdownFieldSeplag
                  name="categoria"
                  control={formControl}
                  label="Categoria"
                  cols="12 12 4"
                  options={folhaPagamentoCategoriaOptions}
                  optionLabel="label"
                  optionValue="value"
                  getFormErrorMessage={() => getFormErrorMessage("categoria")}
                />
                <DropdownFieldSeplag
                  name="cargo"
                  control={formControl}
                  label="Cargo"
                  cols="12 12 4"
                  options={folhaPagamentoCargoOptions}
                  optionLabel="label"
                  optionValue="value"
                  getFormErrorMessage={() => getFormErrorMessage("cargo")}
                />
                <DropdownFieldSeplag
                  name="grupoEleitos"
                  control={formControl}
                  label="Grupo de eleitos"
                  cols="12 12 4"
                  options={folhaPagamentoGrupoEleitosOptions}
                  optionLabel="label"
                  optionValue="value"
                  getFormErrorMessage={() =>
                    getFormErrorMessage("grupoEleitos")
                  }
                />
              </div>
            )}

            {activeTab === "parametros" && (
              <div className="grid prototype-category-form-fields">
                <NumberFieldSeplag
                  name="totalMesesAdiantar"
                  control={formControl}
                  label="Total de meses a adiantar"
                  cols="12 12 6"
                  required
                  min={0}
                  getFormErrorMessage={() =>
                    getFormErrorMessage("totalMesesAdiantar")
                  }
                />
                <NumberFieldSeplag
                  name="totalMesesRetroagir"
                  control={formControl}
                  label="Total de meses a retroagir"
                  cols="12 12 6"
                  required
                  min={0}
                  getFormErrorMessage={() =>
                    getFormErrorMessage("totalMesesRetroagir")
                  }
                />
              </div>
            )}
          </div>
        </ModalSeplag>

        <ModalSeplag
          visible={modalDetalheAberto}
          titulo="Detalhar Folha de Pagamento"
          fechar={() => setModalDetalheAberto(false)}
          tamanho="760px"
          hideFooter
        >
          {folhaSelecionada ? (
            <div className="col-12 prototype-catalogo-view-content">
              <p><strong>Número:</strong> {folhaSelecionada.numero}</p>
              <p><strong>Nome:</strong> {folhaSelecionada.nome}</p>
              <p><strong>Grupo de cálculo origem:</strong> {getGrupoFolhaNome(folhaSelecionada.grupoFolhaId)}</p>
              <p><strong>Órgão(s):</strong> {folhaSelecionada.orgaos.join(", ")}</p>
              <p><strong>Competência:</strong> {formatMesAno(folhaSelecionada.competencia)}</p>
              <p><strong>Situação:</strong> {renderFolhaSituacaoBadge(folhaSelecionada.situacao)}</p>
              <p><strong>Regime jurídico:</strong> {folhaSelecionada.regimeJuridico || "Todos"}</p>
              <p><strong>Categoria:</strong> {folhaSelecionada.categoria || "Todas"}</p>
              <p><strong>Cargo:</strong> {folhaSelecionada.cargo || "Todos"}</p>
              <p><strong>Grupo de eleitos:</strong> {folhaSelecionada.grupoEleitos || "Não informado"}</p>
              <p><strong>Meses a adiantar:</strong> {folhaSelecionada.totalMesesAdiantar}</p>
              <p><strong>Meses a retroagir:</strong> {folhaSelecionada.totalMesesRetroagir}</p>
              <p><strong>Observação:</strong> {folhaSelecionada.observacao || "-"}</p>
            </div>
          ) : null}
        </ModalSeplag>

        <ModalSeplag
          visible={modalExecucoesAberto}
          titulo="Histórico do Processamento"
          fechar={() => setModalExecucoesAberto(false)}
          tamanho="1320px"
          hideFooter
        >
          {folhaSelecionada ? (
            <div className="col-12 prototype-folha-execucoes-modal">
              <div className="prototype-folha-execucoes-summary">
                <div>
                  <span>Folha</span>
                  <strong>{folhaSelecionada.numero}</strong>
                  <p>{folhaSelecionada.nome}</p>
                </div>
                <div>
                  <span>Competência</span>
                  <strong>{formatMesAno(folhaSelecionada.competencia)}</strong>
                </div>
                <div>
                  <span>Histórico do processamento</span>
                  <strong>{execucoesFolha.length}</strong>
                  <p>{execucoesFolha.length === 1 ? "execução" : "execuções"}</p>
                </div>
              </div>

              {execucoesFolha.length ? (
                <div className="prototype-folha-execucoes-table">
                  <TablePaginadoSeplag
                    dataKey="id"
                    data={execucoesResults}
                    rows={5}
                    rowsPerPage={[5, 10]}
                    paginator
                    lazy={false}
                    selectionMode={null}
                    columns={execucaoColumns}
                    hasEventoAcao
                    renderBotoes={(execucao) => (
                      <BotaoIconSeplag
                        type="button"
                        tooltip="Ver log pessoa por pessoa"
                        icon="pi pi-search"
                        onClick={() => {
                          setModalExecucoesAberto(false);
                          navigate(getFolhaPagamentoLogPath(execucao.id));
                        }}
                      />
                    )}
                    handleOnPageChange={() => {}}
                  />
                </div>
              ) : (
                <div className="prototype-empty-content">
                  Nenhuma execução registrada para esta folha.
                </div>
              )}
            </div>
          ) : null}
        </ModalSeplag>

        <ModalSeplag
          visible={modalRelatorioTecnicoAberto}
          titulo={
            <div className="prototype-relatorio-tecnico-title">
              <span>Histórico de Emissões de Relatórios Técnicos</span>
              <button
                type="button"
                className="prototype-relatorio-tecnico-empty-toggle"
                onClick={() =>
                  setRelatorioTecnicoSimularVazio((current) => !current)
                }
              >
                {relatorioTecnicoSimularVazio ? "Mostrar dados" : "Simular vazio"}
              </button>
            </div>
          }
          fechar={fecharRelatorioTecnicoProcessamento}
          tamanho="80vw"
          hideFooter
        >
          {processamentoRelatorioTecnicoSelecionado ? (
            <div className="col-12 prototype-relatorio-tecnico-modal">
              <div className="prototype-relatorio-tecnico-context">
                <div>
                  <span>Número da Folha</span>
                  <strong>
                    {processamentoRelatorioTecnicoSelecionado.numeroFolha}
                  </strong>
                </div>
                <div>
                  <span>Nome da Folha</span>
                  <strong>
                    {processamentoRelatorioTecnicoSelecionado.nomeFolha}
                  </strong>
                </div>
                <div>
                  <span>Número da Execução</span>
                  <strong>
                    {processamentoRelatorioTecnicoSelecionado.numeroExecucao}
                  </strong>
                </div>
              </div>

              <div className="prototype-relatorio-tecnico-actions">
                <BotaoSeplag
                  type="button"
                  label="Emitir Novo Relatório"
                  icon="pi pi-file-export"
                  onClick={abrirEmitirRelatorioTecnico}
                />
              </div>

              <div className="prototype-relatorio-tecnico-table">
                <TablePaginadoSeplag
                  dataKey="id"
                  data={relatorioTecnicoResults}
                  rows={10}
                  rowsPerPage={[5, 10, 25, 50]}
                  paginator
                  lazy={false}
                  selectionMode={null}
                  columns={relatorioTecnicoColumns}
                  hasEventoAcao
                  renderBotoes={(row) => (
                    <BotaoIconSeplag
                      type="button"
                      tooltip="Download"
                      icon="pi pi-download"
                      disabled={row.situacao !== "Emitido"}
                      onClick={() => baixarRelatorioTecnico(row)}
                    />
                  )}
                  handleOnPageChange={() => {}}
                />
              </div>
            </div>
          ) : null}
        </ModalSeplag>

        <ModalSeplag
          visible={modalEmitirRelatorioTecnicoAberto}
          titulo="Emitir Novo Relatório"
          fechar={() => setModalEmitirRelatorioTecnicoAberto(false)}
          tamanho="560px"
          hideFooter
        >
          <form
            className="col-12 prototype-relatorio-tecnico-form"
            onSubmit={handleSubmitRelatorioTecnico(
              confirmarEmissaoRelatorioTecnico,
            )}
          >
            <DropdownFieldSeplag
              name="tipoFiltro"
              control={relatorioTecnicoControl}
              label="Tipo do Filtro"
              cols="12"
              rules={{ required: "Campo obrigatório" }}
              options={relatorioTecnicoTipoFiltroOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() =>
                getRelatorioTecnicoErrorMessage("tipoFiltro")
              }
            />
            <DropdownFieldSeplag
              name="formatoArquivo"
              control={relatorioTecnicoControl}
              label="Formato do Arquivo"
              cols="12"
              rules={{ required: "Campo obrigatório" }}
              options={relatorioTecnicoFormatoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() =>
                getRelatorioTecnicoErrorMessage("formatoArquivo")
              }
            />

            <div className="prototype-modal-actions">
              <BotaoVoltarSeplag
                type="button"
                label="Cancelar"
                onClick={() => setModalEmitirRelatorioTecnicoAberto(false)}
              />
              <BotaoSeplag
                type="submit"
                label="Confirmar"
                icon="pi pi-check"
              />
            </div>
          </form>
        </ModalSeplag>

        <ModalSeplag
          visible={modalLogAberto}
          titulo="Log de Processamento"
          fechar={() => setModalLogAberto(false)}
          tamanho="1180px"
          hideFooter
        >
          {execucaoSelecionada ? (
            <div className="col-12 prototype-folha-log-modal">
              <div className="prototype-folha-execucoes-summary">
                <div>
                  <span>Execução</span>
                  <strong>{execucaoSelecionada.id}</strong>
                  <p>{execucaoSelecionada.usuarioResponsavel}</p>
                </div>
                <div>
                  <span>Situação</span>
                  {renderExecucaoSituacaoBadge(execucaoSelecionada.situacao)}
                </div>
                <div>
                  <span>Início / fim</span>
                  <strong>{execucaoSelecionada.dataHoraInicio}</strong>
                  <p>{execucaoSelecionada.dataHoraFim}</p>
                </div>
                <div>
                  <span>Totais</span>
                  <strong>{execucaoSelecionada.totalPessoas}</strong>
                  <p>
                    {execucaoSelecionada.totalSucesso} sucesso,{" "}
                    {execucaoSelecionada.totalAlerta} alerta,{" "}
                    {execucaoSelecionada.totalErro} erro
                  </p>
                </div>
              </div>

              <div className="prototype-category-filters prototype-folha-log-filters">
                <TextFieldSeplag
                  name="matricula"
                  control={logControl}
                  label="Matrícula/vínculo"
                  cols="12"
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="nome"
                  control={logControl}
                  label="Nome"
                  cols="12"
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="cpf"
                  control={logControl}
                  label="CPF"
                  cols="12"
                  getFormErrorMessage={() => null}
                />
                <DropdownFieldSeplag
                  name="orgao"
                  control={logControl}
                  label="Órgão"
                  cols="12"
                  options={[{ label: "Todos", value: "" }, ...folhaPagamentoOrgaoOptions]}
                  optionLabel="label"
                  optionValue="value"
                  getFormErrorMessage={() => null}
                />
                <DropdownFieldSeplag
                  name="situacao"
                  control={logControl}
                  label="Situação"
                  cols="12"
                  options={folhaPagamentoPessoaLogSituacaoOptions}
                  optionLabel="label"
                  optionValue="value"
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="rubrica"
                  control={logControl}
                  label="Rubrica"
                  cols="12"
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="mensagem"
                  control={logControl}
                  label="Mensagem contém"
                  cols="12"
                  getFormErrorMessage={() => null}
                />
                <div className="prototype-category-clear">
                  <BotaoLimparFiltroSeplag
                    type="button"
                    label="Limpar"
                    icon="pi pi-refresh"
                    onClick={() =>
                      resetLog({
                        matricula: "",
                        nome: "",
                        cpf: "",
                        orgao: "",
                        situacao: "",
                        rubrica: "",
                        mensagem: "",
                      })
                    }
                  />
                </div>
              </div>

              <div className="prototype-folha-log-table">
                <TablePaginadoSeplag
                  dataKey="id"
                  data={logResults}
                  rows={8}
                  rowsPerPage={[8, 16]}
                  paginator
                  lazy={false}
                  selectionMode={null}
                  columns={logPessoaColumns}
                  hasEventoAcao
                  renderBotoes={(row) => (
                    <BotaoIconSeplag
                      type="button"
                      tooltip="Ver detalhe"
                      icon="pi pi-eye"
                      onClick={() => {
                        setPessoaLogSelecionada(row);
                        setModalPessoaLogAberto(true);
                      }}
                    />
                  )}
                  handleOnPageChange={() => {}}
                />
              </div>
            </div>
          ) : null}
        </ModalSeplag>

        <ModalSeplag
          visible={modalPessoaLogAberto}
          titulo="Detalhe do Processamento por Pessoa"
          fechar={() => setModalPessoaLogAberto(false)}
          tamanho="980px"
          hideFooter
        >
          {pessoaLogSelecionada ? (
            <div className="col-12 prototype-folha-pessoa-log-modal">
              <div className="prototype-folha-pessoa-log-summary">
                <p><strong>Matrícula/vínculo:</strong> {pessoaLogSelecionada.matricula}/{pessoaLogSelecionada.vinculo}</p>
                <p><strong>Nome:</strong> {pessoaLogSelecionada.nome}</p>
                <p><strong>CPF:</strong> {pessoaLogSelecionada.cpf}</p>
                <p><strong>Órgão:</strong> {pessoaLogSelecionada.orgao}</p>
                <p><strong>Regime jurídico:</strong> {pessoaLogSelecionada.regimeJuridico}</p>
                <p><strong>Categoria:</strong> {pessoaLogSelecionada.categoria}</p>
                <p><strong>Cargo:</strong> {pessoaLogSelecionada.cargo}</p>
                <p><strong>Grupo de eleitos:</strong> {pessoaLogSelecionada.grupoEleitos || "Não informado"}</p>
                <p><strong>Situação:</strong> {renderPessoaLogSituacaoBadge(pessoaLogSelecionada.situacao)}</p>
                <p><strong>Mensagem:</strong> {pessoaLogSelecionada.mensagem}</p>
              </div>

              {rubricasDaPessoa.length ? (
                <div className="prototype-folha-rubricas-log-table">
                  <TablePaginadoSeplag
                    dataKey="id"
                    data={rubricasResults}
                    rows={6}
                    rowsPerPage={[6, 12]}
                    paginator={false}
                    lazy={false}
                    selectionMode={null}
                    columns={rubricaLogColumns}
                    handleOnPageChange={() => {}}
                  />
                </div>
              ) : (
                <div className="prototype-empty-content">
                  Nenhuma rubrica registrada para esta pessoa nesta execução.
                </div>
              )}
            </div>
          ) : null}
        </ModalSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaProcessamentoFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const folhas = folhaPagamentoService.listarFolhas();
  const competenciaVigente = folhaPagamentoService
    .listarCompetencias()
    .find((competencia) => competencia.situacao === "ATIVA");
  const [feedback, setFeedback] = useState("");
  const [processamentoErrors, setProcessamentoErrors] =
    useState<Partial<Record<keyof ProcessamentoFolhaForm, string>>>({});

  const folhaIdSelecionada = Number(searchParams.get("folhaId"));
  const folhaSelecionadaPorAtalho = Number.isFinite(folhaIdSelecionada)
    ? folhas.find((folha) => folha.id === folhaIdSelecionada)
    : undefined;
  const folhaDisponivel =
    folhaSelecionadaPorAtalho ??
    folhas.find((folha) =>
      ["ABERTO", "PROCESSO_COM_SUCESSO", "PROCESSO_COM_ERRO"].includes(
        folha.situacao,
      ),
    ) ?? folhas[0];

  const usuarioLogadoProcessamentoMock = {
    orgaos: ["SEPLAG", "MTI"],
    setores: ["administracao-central"],
    regimesJuridicos: ["Estatutário Civil"],
    tiposVinculo: ["efetivo"],
    categorias: ["Área Meio"],
    subcategorias: ["administracao-direta"],
    cargos: ["Analista Administrativo"],
    grupoEleitos: "",
  };

  const toUpperOptions = <T extends { label: string; value: unknown }>(
    options: T[],
  ) =>
    options.map((option) => ({
      ...option,
      label: option.label.toUpperCase(),
    }));

  const formatMesAno = (value: string) => {
    if (!value) return "";
    const [ano, mes] = value.split("-");
    return mes && ano ? `${mes}/${ano}` : value;
  };
  const normalizeMesAno = (value?: string) => {
    const cleanValue = value?.trim() ?? "";
    const matchMesAno = cleanValue.match(/^(\d{2})\/(\d{4})$/);
    if (matchMesAno) return `${matchMesAno[2]}-${matchMesAno[1]}`;
    return cleanValue;
  };
  const isMesAnoValido = (value?: string) => {
    const cleanValue = value?.trim() ?? "";
    const match =
      cleanValue.match(/^(\d{4})-(\d{2})$/) ??
      cleanValue.match(/^(\d{2})\/(\d{4})$/);
    if (!match) return false;

    const mes = cleanValue.includes("-") ? Number(match[2]) : Number(match[1]);
    return mes >= 1 && mes <= 12;
  };

  const {
    control,
    reset,
    setValue,
    watch,
    handleSubmit,
  } = useForm<ProcessamentoFolhaForm>({
    defaultValues: {
      numeroFolha: folhaDisponivel?.numero ?? "",
      nomeFolha: folhaDisponivel?.nome ?? "",
      competencia: formatMesAno(
        folhaDisponivel?.competencia ?? competenciaVigente?.competencia ?? "",
      ),
      tipoExecucao: "TOTAL",
      orgaos: folhaDisponivel?.orgaos?.length
        ? folhaDisponivel.orgaos
        : usuarioLogadoProcessamentoMock.orgaos,
      setores: usuarioLogadoProcessamentoMock.setores,
      regimesJuridicos: folhaDisponivel?.regimeJuridico
        ? [folhaDisponivel.regimeJuridico]
        : usuarioLogadoProcessamentoMock.regimesJuridicos,
      tiposVinculo: usuarioLogadoProcessamentoMock.tiposVinculo,
      categorias: folhaDisponivel?.categoria
        ? [folhaDisponivel.categoria]
        : usuarioLogadoProcessamentoMock.categorias,
      subcategorias: usuarioLogadoProcessamentoMock.subcategorias,
      cargos: folhaDisponivel?.cargo
        ? [folhaDisponivel.cargo]
        : usuarioLogadoProcessamentoMock.cargos,
      grupoEleitos:
        folhaDisponivel?.grupoEleitos ||
        usuarioLogadoProcessamentoMock.grupoEleitos,
    },
  });

  const tipoExecucao = watch("tipoExecucao");
  const processamentoTotal = tipoExecucao === "TOTAL";
  const numeroFolhaSelecionado = watch("numeroFolha");
  const nomeFolhaSelecionado = watch("nomeFolha");
  const numeroFolhaOptions = Array.from(
    new Map(
      folhas.map((folha) => [
        folha.numero,
        {
          label: folha.numero.toUpperCase(),
          value: folha.numero,
        },
      ]),
    ).values(),
  );
  const nomeFolhaOptions = folhas
    .filter((folha) => !numeroFolhaSelecionado || folha.numero === numeroFolhaSelecionado)
    .map((folha) => ({
      label: folha.nome.toUpperCase(),
      value: folha.nome,
    }));
  const orgaoOptions = toUpperOptions(folhaPagamentoOrgaoOptions);
  const setorOptions = toUpperOptions(grupoCalculoSetorOptions);
  const regimeOptions = toUpperOptions(
    folhaPagamentoRegimeOptions.filter((option) => option.value),
  );
  const tipoVinculoOptions = toUpperOptions(grupoCalculoTipoVinculoOptions);
  const categoriaOptions = toUpperOptions(
    folhaPagamentoCategoriaOptions.filter((option) => option.value),
  );
  const subcategoriaOptions = toUpperOptions(grupoCalculoSubcategoriaOptions);
  const cargoOptions = toUpperOptions(
    folhaPagamentoCargoOptions.filter((option) => option.value),
  );
  const grupoEleitosOptions = toUpperOptions(folhaPagamentoGrupoEleitosOptions);

  useEffect(() => {
    if (!numeroFolhaSelecionado) return;

    const folhaSelecionada = folhas.find(
      (folha) => folha.numero === numeroFolhaSelecionado,
    );
    if (folhaSelecionada && nomeFolhaSelecionado !== folhaSelecionada.nome) {
      setValue("nomeFolha", folhaSelecionada.nome);
      setValue("competencia", formatMesAno(folhaSelecionada.competencia));
    }
  }, [folhas, nomeFolhaSelecionado, numeroFolhaSelecionado, setValue]);

  const getProcessamentoErrorMessage = (name: keyof ProcessamentoFolhaForm) => {
    const message = processamentoErrors[name];
    return message ? <small className="p-error">{message}</small> : null;
  };

  const validarFormulario = (data: ProcessamentoFolhaForm) => {
    const errors: Partial<Record<keyof ProcessamentoFolhaForm, string>> = {};

    if (!data.numeroFolha) errors.numeroFolha = "Campo obrigatório";
    if (!data.nomeFolha) errors.nomeFolha = "Campo obrigatório";
    if (!data.competencia?.trim()) {
      errors.competencia = "Campo obrigatório";
    } else if (!isMesAnoValido(data.competencia)) {
      errors.competencia = "Formato inválido";
    }
    if (!data.tipoExecucao) errors.tipoExecucao = "Campo obrigatório";

    if (data.tipoExecucao === "PARCIAL") {
      const possuiFiltro =
        Boolean(data.orgaos?.length) ||
        Boolean(data.setores?.length) ||
        Boolean(data.regimesJuridicos?.length) ||
        Boolean(data.tiposVinculo?.length) ||
        Boolean(data.categorias?.length) ||
        Boolean(data.subcategorias?.length) ||
        Boolean(data.cargos?.length) ||
        Boolean(data.grupoEleitos);

      if (!possuiFiltro) {
        errors.orgaos = "Campo obrigatório";
      }
    }

    setProcessamentoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const cancelar = () => navigate(FOLHA_PROCESSAMENTO_BASE_PATH);

  const executarProcessamento = (data: ProcessamentoFolhaForm) => {
    if (!validarFormulario(data)) return;

    setFeedback("Registro cadastrado com sucesso!");
    reset({
      ...data,
      competencia: formatMesAno(normalizeMesAno(data.competencia)),
    });
    window.setTimeout(() => navigate(FOLHA_PROCESSAMENTO_BASE_PATH), 650);
  };

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-folha-pagamento-page">
        <CardSeplag
          title="Processamento da Folha"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
          actions={
            <div className="prototype-competencia-vigente">
              Competência vigente:{" "}
              <strong>{formatMesAno(competenciaVigente?.competencia ?? "")}</strong>
            </div>
          }
        >
          {feedback ? (
            <div className="prototype-validation-panel">{feedback}</div>
          ) : null}

          <div className="col-12 prototype-processamento-folha-page-form">
            <div className="grid prototype-category-form-fields">
              <DropdownFieldSeplag
                name="numeroFolha"
                control={control}
                label="Número da Folha"
                cols="12 12 6"
                required
                options={numeroFolhaOptions}
                optionLabel="label"
                optionValue="value"
                getFormErrorMessage={() => getProcessamentoErrorMessage("numeroFolha")}
              />
              <DropdownFieldSeplag
                name="nomeFolha"
                control={control}
                label="Nome da Folha"
                cols="12 12 6"
                required
                options={nomeFolhaOptions}
                optionLabel="label"
                optionValue="value"
                getFormErrorMessage={() => getProcessamentoErrorMessage("nomeFolha")}
              />
              <TextFieldSeplag
                name="competencia"
                control={control}
                label="Competência"
                placeholder="MM/AAAA"
                cols="12 12 6"
                required
                maxLength={7}
                getFormErrorMessage={() => getProcessamentoErrorMessage("competencia")}
              />
              <RadioButtonFieldSeplag
                name="tipoExecucao"
                control={control}
                label="Tipo de execução"
                cols="12 12 6"
                required
                options={[
                  { label: "Parcial", value: "PARCIAL" },
                  { label: "Total", value: "TOTAL" },
                ]}
                getFormErrorMessage={() => getProcessamentoErrorMessage("tipoExecucao")}
              />
              <MultiSelectFieldSeplag
                name="orgaos"
                control={control}
                label="Órgãos"
                cols="12 12 4"
                options={orgaoOptions}
                optionLabel="label"
                optionValue="value"
                selectedItemsLabel="{0} órgãos selecionados"
                disabled={processamentoTotal}
                getFormErrorMessage={() => getProcessamentoErrorMessage("orgaos")}
              />
              <MultiSelectFieldSeplag
                name="setores"
                control={control}
                label="Setor"
                cols="12 12 4"
                options={setorOptions}
                optionLabel="label"
                optionValue="value"
                selectedItemsLabel="{0} setores selecionados"
                disabled={processamentoTotal}
                getFormErrorMessage={() => getProcessamentoErrorMessage("setores")}
              />
              <MultiSelectFieldSeplag
                name="regimesJuridicos"
                control={control}
                label="Regime jurídico"
                cols="12 12 4"
                options={regimeOptions}
                optionLabel="label"
                optionValue="value"
                selectedItemsLabel="{0} regimes selecionados"
                disabled={processamentoTotal}
                getFormErrorMessage={() => getProcessamentoErrorMessage("regimesJuridicos")}
              />
              <MultiSelectFieldSeplag
                name="tiposVinculo"
                control={control}
                label="Tipo de vínculo"
                cols="12 12 4"
                options={tipoVinculoOptions}
                optionLabel="label"
                optionValue="value"
                selectedItemsLabel="{0} tipos selecionados"
                disabled={processamentoTotal}
                getFormErrorMessage={() => getProcessamentoErrorMessage("tiposVinculo")}
              />
              <MultiSelectFieldSeplag
                name="categorias"
                control={control}
                label="Categoria"
                cols="12 12 4"
                options={categoriaOptions}
                optionLabel="label"
                optionValue="value"
                selectedItemsLabel="{0} categorias selecionadas"
                disabled={processamentoTotal}
                getFormErrorMessage={() => getProcessamentoErrorMessage("categorias")}
              />
              <MultiSelectFieldSeplag
                name="subcategorias"
                control={control}
                label="Subcategoria"
                cols="12 12 4"
                options={subcategoriaOptions}
                optionLabel="label"
                optionValue="value"
                selectedItemsLabel="{0} subcategorias selecionadas"
                disabled={processamentoTotal}
                getFormErrorMessage={() => getProcessamentoErrorMessage("subcategorias")}
              />
              <MultiSelectFieldSeplag
                name="cargos"
                control={control}
                label="Cargo"
                cols="12 12 4"
                options={cargoOptions}
                optionLabel="label"
                optionValue="value"
                selectedItemsLabel="{0} cargos selecionados"
                disabled={processamentoTotal}
                getFormErrorMessage={() => getProcessamentoErrorMessage("cargos")}
              />
              <DropdownFieldSeplag
                name="grupoEleitos"
                control={control}
                label="Grupo de eleitos"
                cols="12 12 4"
                options={grupoEleitosOptions}
                optionLabel="label"
                optionValue="value"
                disabled={processamentoTotal}
                getFormErrorMessage={() => getProcessamentoErrorMessage("grupoEleitos")}
              />
            </div>

            <div className="prototype-processamento-folha-footer">
              <BotaoVoltarSeplag
                type="button"
                label="Cancelar"
                icon="pi pi-times"
                onClick={cancelar}
              />
              <BotaoSeplag
                type="button"
                variant="save"
                label="Executar Processamento"
                icon="pi pi-play"
                onClick={handleSubmit(executarProcessamento)}
              />
            </div>
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaSolicitacoesAjustesPage() {
  const navigate = useNavigate();
  const [perfil, setPerfil] =
    useState<SolicitacaoAjusteFolhaPerfil>("SETORIAL");
  const [solicitacoes, setSolicitacoes] = useState<
    SolicitacaoAjusteFolhaRow[]
  >(() => folhaPagamentoService.listarSolicitacoesAjusteFolha());
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] =
    useState<SolicitacaoAjusteFolhaRow | null>(null);
  const [modalVisualizarAberto, setModalVisualizarAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modalDevolverAberto, setModalDevolverAberto] = useState(false);
  const [modalConcluirAberto, setModalConcluirAberto] = useState(false);
  const [modalIniciarAberto, setModalIniciarAberto] = useState(false);
  const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false);
  const [modalAnaliseConformidadeAberto, setModalAnaliseConformidadeAberto] =
    useState(false);
  const [analisandoConformidade, setAnalisandoConformidade] = useState(false);
  const [analisandoSetorial, setAnalisandoSetorial] = useState(false);
  const [acaoAnaliseConformidade, setAcaoAnaliseConformidade] = useState<
    "APROVAR" | "REJEITAR" | "LIBERAR_SETORIAL"
  >("APROVAR");
  const [complementoConformidade, setComplementoConformidade] = useState("");
  const [parecerSetorial, setParecerSetorial] = useState("");
  const [documentosParecerSetorial, setDocumentosParecerSetorial] = useState<
    ArquivoAnexadoSeplag[]
  >([]);
  const [
    documentosParecerSetorialPorSolicitacao,
    setDocumentosParecerSetorialPorSolicitacao,
  ] = useState<Record<number, ArquivoAnexadoSeplag[]>>({});
  const [motivoRejeicaoConformidade, setMotivoRejeicaoConformidade] =
    useState("");
  const [motivoDevolucao, setMotivoDevolucao] = useState("");
  const [numeroExecucaoFinalizacao, setNumeroExecucaoFinalizacao] =
    useState("");
  const [
    numeroExecucaoFinalizacaoErro,
    setNumeroExecucaoFinalizacaoErro,
  ] = useState("");
  const [documentosDevolucao, setDocumentosDevolucao] = useState<
    ArquivoAnexadoSeplag[]
  >([]);
  const [motivoReinicioCorrecao, setMotivoReinicioCorrecao] = useState("");
  const [modoFormularioSolicitacao, setModoFormularioSolicitacao] =
    useState<SolicitacaoAjusteFolhaModoFormulario | null>(null);
  const [documentosFormularioSolicitacao, setDocumentosFormularioSolicitacao] =
    useState<ArquivoAnexadoSeplag[]>([]);
  const [modalSairFormularioAberto, setModalSairFormularioAberto] =
    useState(false);
  const documentosReinicioCorrecao: ArquivoAnexadoSeplag[] = [
    {
      nome: "parecer-conformidade.pdf",
      extensao: "pdf",
      contentType: "application/pdf",
      conteudoEmBase64: "",
      tamanho: "245 KB",
    },
    {
      nome: "evidencia-vinculos.png",
      extensao: "png",
      contentType: "image/png",
      conteudoEmBase64: "",
      tamanho: "318 KB",
    },
  ];
  const [feedback, setFeedback] = useState("");
  const { control, reset, watch } =
    useForm<SolicitacaoAjusteFolhaFiltroForm>({
      defaultValues: {
        termoFolha: "",
        competencias: [],
        matriculaCpf: "",
        gruposEleitos: [],
        situacoes: [],
      },
    });
  const {
    control: controlSolicitacao,
    handleSubmit: handleSubmitSolicitacao,
    reset: resetSolicitacao,
    setValue: setValueSolicitacao,
    watch: watchSolicitacao,
    formState: { errors: errorsSolicitacao, isDirty: isSolicitacaoDirty },
  } = useForm<SolicitacaoAjusteFolhaForm>({
    defaultValues: {
      numeroFolha: "",
      nomeFolha: "",
      competencia: "",
      escopo: "",
      matriculasCpf: [],
      grupoEleitos: "",
      motivoAbertura: "",
      dataCriacao: formatarDataPtBr(),
    },
  });

  const [perfilIngressos, setPerfilIngressos] = useState<IngressoPerfil>("PROVIMENTO");
  const filtros = watch();
  const formularioSolicitacao = watchSolicitacao();
  const escopoSolicitacao = formularioSolicitacao.escopo;
  const isFormularioSolicitacaoReadonly =
    modoFormularioSolicitacao === "visualizar";
  const competenciaVigente =
    folhaPagamentoService
      .listarCompetencias()
      .find((competencia) => competencia.situacao === "ATIVA")
      ?.competencia ?? "05/2026";
  const folhasProcessadasOptions = folhaPagamentoService
    .listarFolhas()
    .filter((folha) => folha.situacao === "PROCESSO_COM_SUCESSO")
    .map((folha) => ({
      label: String(folha.numero).padStart(3, "0"),
      value: String(folha.numero).padStart(3, "0"),
      nome: folha.nome.toUpperCase(),
      competencia: formatarCompetenciaFolha(folha.competencia),
    }));
  const pessoasSolicitacaoOptions = folhaPagamentoService
    .listarPessoaLogs()
    .map((pessoa) => ({
      label: `${pessoa.matricula} - ${pessoa.cpf} - ${pessoa.nome}`,
      value: `${pessoa.matricula} / ${pessoa.cpf}`,
    }));
  const usuarioAtual =
    perfil === "SETORIAL"
      ? "Patrícia Lima - Setorial"
      : perfil === "CONFORMIDADE"
      ? "Maria de Souza - Conformidade"
      : "João Silva - Folha de Pagamento";

  const termoFolha =
    (filtros.termoFolha?.trim().length ?? 0) >= 3
      ? filtros.termoFolha?.trim().toLowerCase() ?? ""
      : "";
  const termoPessoa =
    (filtros.matriculaCpf?.trim().length ?? 0) >= 3
      ? filtros.matriculaCpf?.trim().toLowerCase() ?? ""
      : "";

  const solicitacoesVisiveisPorPerfil = solicitacoes.filter((solicitacao) => {
    const abertaPelaSetorial = solicitacao.solicitante === "Patrícia Lima";
    return perfil !== "SETORIAL" || abertaPelaSetorial;
  });
  const resumoSolicitacoesPorSituacao = solicitacaoAjusteFolhaSituacaoOptions
    .map((situacao) => ({
      ...situacao,
      total: solicitacoesVisiveisPorPerfil.filter(
        (solicitacao) => solicitacao.situacao === situacao.value,
      ).length,
      meta: solicitacaoAjusteFolhaSituacaoMeta[situacao.value],
    }))
    .filter((situacao) => situacao.total > 0);

  const solicitacoesFiltradas = solicitacoesVisiveisPorPerfil
    .filter((solicitacao) => {
      const atendeFolha =
        !termoFolha ||
        solicitacao.numeroFolha.toLowerCase().includes(termoFolha) ||
        solicitacao.nomeFolha.toLowerCase().includes(termoFolha);
      const atendeCompetencia =
        !filtros.competencias?.length ||
        filtros.competencias.includes(solicitacao.competencia);
      const atendePessoa =
        !termoPessoa ||
        solicitacao.matriculaCpf.toLowerCase().includes(termoPessoa);
      const atendeGrupoEleitos =
        !filtros.gruposEleitos?.length ||
        filtros.gruposEleitos.includes(solicitacao.grupoEleitos);
      const atendeSituacao =
        !filtros.situacoes?.length ||
        filtros.situacoes.includes(solicitacao.situacao);

      return (
        atendeFolha &&
        atendeCompetencia &&
        atendePessoa &&
        atendeGrupoEleitos &&
        atendeSituacao
      );
    })
    .sort((a, b) => Number(a.numeroFolha) - Number(b.numeroFolha));

  const solicitacaoResults = {
    ...createResults(solicitacoesFiltradas),
    totalPages: Math.max(1, Math.ceil(solicitacoesFiltradas.length / 10)),
    totalRecords: solicitacoesFiltradas.length,
    size: 10,
    sizePage: 10,
  };

  const historicoSelecionado: SolicitacaoAjusteFolhaHistoricoRow[] =
    solicitacaoSelecionada
      ? folhaPagamentoService.listarHistoricoSolicitacaoAjusteFolha(
          solicitacaoSelecionada.id,
        )
      : [];

  const historicoParaExibir =
    historicoSelecionado.length || !solicitacaoSelecionada
      ? historicoSelecionado
      : [
          {
            id: solicitacaoSelecionada.id * 100,
            solicitacaoId: solicitacaoSelecionada.id,
            situacaoDestino: solicitacaoSelecionada.situacao,
            dataHora: solicitacaoSelecionada.dataCriacao,
            operador: solicitacaoSelecionada.solicitante,
            descricao: solicitacaoSelecionada.motivoAbertura,
          },
        ];

  const renderSolicitacaoSituacaoBadge = (
    situacao: SolicitacaoAjusteFolhaSituacao,
  ) => <BadgeSeplag {...solicitacaoAjusteFolhaSituacaoMeta[situacao]} size="md" />;

  const atualizarSolicitacao = (
    solicitacao: SolicitacaoAjusteFolhaRow,
    mensagem: string,
  ) => {
    folhaPagamentoService.atualizarSolicitacaoAjusteFolha(solicitacao);
    setSolicitacoes((current) =>
      current.map((item) => (item.id === solicitacao.id ? solicitacao : item)),
    );
    setFeedback(mensagem);
  };

  const anexarDocumentosDevolucao = (event: { files?: File[] }) => {
    const files = Array.from(event.files ?? []);
    if (!files.length) return;

    setDocumentosDevolucao((current) => [
      ...current,
      ...files.map((file) => ({
        nome: file.name,
        extensao: file.name.split(".").pop()?.toLowerCase() ?? "pdf",
        contentType: file.type || "application/octet-stream",
        conteudoEmBase64: "",
        tamanho: file.size,
      })),
    ]);
  };

  const removerDocumentoDevolucao = (
    _arquivo?: ArquivoAnexadoSeplag,
    index = -1,
  ) => {
    setDocumentosDevolucao((current) =>
      current.filter((__, itemIndex) => itemIndex !== index),
    );
  };

  const getSolicitacaoFormErrorMessage = (
    field: keyof SolicitacaoAjusteFolhaForm | string,
  ) => {
    const error = errorsSolicitacao[field as keyof SolicitacaoAjusteFolhaForm];
    return error ? (
      <small className="p-error">{String(error.message ?? "Campo obrigatório")}</small>
    ) : null;
  };

  const preencherFormularioSolicitacao = (
    solicitacao?: SolicitacaoAjusteFolhaRow | null,
  ) => {
    const escopo: SolicitacaoAjusteFolhaEscopo =
      solicitacao?.matriculaCpf && solicitacao.matriculaCpf !== "-"
        ? "MATRICULA_CPF"
        : "GRUPO_ELEITOS";

    resetSolicitacao({
      numeroFolha: solicitacao?.numeroFolha ?? "",
      nomeFolha: solicitacao?.nomeFolha ?? "",
      competencia: solicitacao?.competencia ?? competenciaVigente,
      escopo: solicitacao ? escopo : "",
      matriculasCpf:
        escopo === "MATRICULA_CPF" && solicitacao?.matriculaCpf
          ? solicitacao.matriculaCpf.split(",").map((item) => item.trim())
          : [],
      grupoEleitos:
        escopo === "GRUPO_ELEITOS" ? solicitacao?.grupoEleitos ?? "" : "",
      motivoAbertura: solicitacao?.motivoAbertura ?? "",
      dataCriacao: solicitacao?.dataCriacao ?? formatarDataPtBr(),
    });
    setDocumentosFormularioSolicitacao(
      solicitacao ? documentosSolicitacaoAjusteFolhaMock[solicitacao.id] ?? [] : [],
    );
  };

  const abrirFormularioSolicitacao = (
    modo: SolicitacaoAjusteFolhaModoFormulario,
    solicitacao?: SolicitacaoAjusteFolhaRow,
  ) => {
    setSolicitacaoSelecionada(solicitacao ?? null);
    preencherFormularioSolicitacao(solicitacao);
    setComplementoConformidade(solicitacao?.complementoConformidade ?? "");
    setAnalisandoConformidade(false);
    setAnalisandoSetorial(false);
    setParecerSetorial(solicitacao?.parecerSetorial ?? "");
    setDocumentosParecerSetorial(
      solicitacao
        ? documentosParecerSetorialPorSolicitacao[solicitacao.id] ?? []
        : [],
    );
    setModoFormularioSolicitacao(modo);
    setFeedback("");
  };

  const selecionarFolhaFormularioSolicitacao = (numeroFolha?: string) => {
    const folha = folhasProcessadasOptions.find(
      (option) => option.value === numeroFolha,
    );
    setValueSolicitacao("nomeFolha", folha?.nome ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValueSolicitacao("competencia", folha?.competencia ?? competenciaVigente, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const selecionarEscopoSolicitacao = (escopo?: string) => {
    if (escopo === "MATRICULA_CPF") {
      setValueSolicitacao("grupoEleitos", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    if (escopo === "GRUPO_ELEITOS") {
      setValueSolicitacao("matriculasCpf", [], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const anexarDocumentosFormularioSolicitacao = (event: { files?: File[] }) => {
    const files = Array.from(event.files ?? []);
    if (!files.length) return;

    if (documentosFormularioSolicitacao.length + files.length > 10) {
      setFeedback("É permitido anexar no máximo 10 arquivos por solicitação.");
      return;
    }

    const arquivoInvalido = files.find((file) => {
      const extensao = file.name.split(".").pop()?.toLowerCase() ?? "";
      return (
        !solicitacaoAjusteFolhaExtensoesPermitidas.includes(extensao) ||
        file.size > 2 * 1024 * 1024
      );
    });

    if (arquivoInvalido) {
      setFeedback(
        "Documentos permitidos: PDF, DOC, CSV, XLSX, XLS e DOCX, com até 2MB cada.",
      );
      return;
    }

    setDocumentosFormularioSolicitacao((current) => [
      ...current,
      ...files.map((file) => ({
        nome: file.name,
        extensao: file.name.split(".").pop()?.toLowerCase() ?? "",
        contentType: file.type || "application/octet-stream",
        conteudoEmBase64: "",
        tamanho: file.size,
      })),
    ]);
  };

  const removerDocumentoFormularioSolicitacao = (
    _arquivo?: ArquivoAnexadoSeplag,
    index = -1,
  ) => {
    setDocumentosFormularioSolicitacao((current) =>
      current.filter((__, itemIndex) => itemIndex !== index),
    );
  };

  const anexarDocumentosParecerSetorial = (event: { files?: File[] }) => {
    const files = Array.from(event.files ?? []);
    if (!files.length) return;

    if (documentosParecerSetorial.length + files.length > 10) {
      setFeedback("É permitido anexar no máximo 10 arquivos por solicitação.");
      return;
    }

    const arquivoInvalido = files.find((file) => {
      const extensao = file.name.split(".").pop()?.toLowerCase() ?? "";
      return (
        !solicitacaoAjusteFolhaExtensoesPermitidas.includes(extensao) ||
        file.size > 2 * 1024 * 1024
      );
    });

    if (arquivoInvalido) {
      setFeedback(
        "Documentos permitidos: PDF, DOC, CSV, XLSX, XLS e DOCX, com até 2MB cada.",
      );
      return;
    }

    setDocumentosParecerSetorial((current) => [
      ...current,
      ...files.map((file) => ({
        nome: file.name,
        extensao: file.name.split(".").pop()?.toLowerCase() ?? "",
        contentType: file.type || "application/octet-stream",
        conteudoEmBase64: "",
        tamanho: file.size,
      })),
    ]);
  };

  const removerDocumentoParecerSetorial = (
    _arquivo?: ArquivoAnexadoSeplag,
    index = -1,
  ) => {
    setDocumentosParecerSetorial((current) =>
      current.filter((__, itemIndex) => itemIndex !== index),
    );
  };

  const voltarParaListagemSolicitacoes = () => {
    setModoFormularioSolicitacao(null);
    setSolicitacaoSelecionada(null);
    setDocumentosFormularioSolicitacao([]);
    setDocumentosParecerSetorial([]);
    setAnalisandoConformidade(false);
    setAnalisandoSetorial(false);
    setParecerSetorial("");
  };

  const solicitarSaidaFormularioSolicitacao = () => {
    if (
      !isFormularioSolicitacaoReadonly &&
      (isSolicitacaoDirty || documentosFormularioSolicitacao.length > 0)
    ) {
      setModalSairFormularioAberto(true);
      return;
    }

    voltarParaListagemSolicitacoes();
  };

  const salvarFormularioSolicitacao = (form: SolicitacaoAjusteFolhaForm) => {
    if (form.escopo === "MATRICULA_CPF" && !form.matriculasCpf?.length) {
      setFeedback("Campo obrigatório");
      return;
    }

    if (form.escopo === "GRUPO_ELEITOS" && !form.grupoEleitos) {
      setFeedback("Campo obrigatório");
      return;
    }

    if (modoFormularioSolicitacao === "editar" && solicitacaoSelecionada) {
      const solicitacaoAtualizada =
        folhaPagamentoService.atualizarDadosSolicitacaoAjusteFolha(
          solicitacaoSelecionada.id,
          form,
        );
      if (solicitacaoAtualizada) {
        setSolicitacoes((current) =>
          current.map((item) =>
            item.id === solicitacaoAtualizada.id ? solicitacaoAtualizada : item,
          ),
        );
      }
      setFeedback("Registro atualizado com sucesso!");
    } else {
      const novaSolicitacao =
        folhaPagamentoService.criarSolicitacaoAjusteFolha(
          form,
          perfil === "CONFORMIDADE" ? "Maria de Souza" : "Patrícia Lima",
          perfil === "CONFORMIDADE" ? "NOVA" : "AGUARDANDO_ANALISE",
        );
      setSolicitacoes((current) => [novaSolicitacao, ...current]);
      setFeedback("Registro cadastrado com sucesso!");
    }

    voltarParaListagemSolicitacoes();
  };

  const abrirVisualizar = (solicitacao: SolicitacaoAjusteFolhaRow) => {
    abrirFormularioSolicitacao("visualizar", solicitacao);
  };

  const abrirAnalisarConformidade = (solicitacao: SolicitacaoAjusteFolhaRow) => {
    abrirFormularioSolicitacao("visualizar", solicitacao);
    setAnalisandoConformidade(true);
  };

  const abrirParecerSetorial = (solicitacao: SolicitacaoAjusteFolhaRow) => {
    abrirFormularioSolicitacao("visualizar", solicitacao);
    setAnalisandoSetorial(true);
  };

  const abrirHistorico = (solicitacao: SolicitacaoAjusteFolhaRow) => {
    setSolicitacaoSelecionada(solicitacao);
    setModalHistoricoAberto(true);
  };

  const abrirFinalizacaoCorrecao = (
    solicitacao: SolicitacaoAjusteFolhaRow,
  ) => {
    setSolicitacaoSelecionada(solicitacao);
    setNumeroExecucaoFinalizacao(
      solicitacao.numeroExecucaoProcessamento &&
        solicitacao.numeroExecucaoProcessamento !== "-"
        ? solicitacao.numeroExecucaoProcessamento
        : "",
    );
    setNumeroExecucaoFinalizacaoErro("");
    setModalFinalizarAberto(true);
  };

  const confirmarExclusaoSolicitacao = () => {
    if (!solicitacaoSelecionada) return;
    if (
      !(
        (perfil === "SETORIAL" &&
          solicitacaoSelecionada.situacao === "AGUARDANDO_ANALISE") ||
        (perfil === "CONFORMIDADE" && solicitacaoSelecionada.situacao === "NOVA")
      )
    ) {
      setModalExcluirAberto(false);
      setFeedback("Ação indisponível após atuação da Conformidade.");
      return;
    }

    folhaPagamentoService.excluirSolicitacaoAjusteFolha(
      solicitacaoSelecionada.id,
    );
    setSolicitacoes((current) =>
      current.filter((item) => item.id !== solicitacaoSelecionada.id),
    );
    setModalExcluirAberto(false);
    setFeedback("Registro deletado com sucesso!");
  };

  const confirmarInicioCorrecao = () => {
    if (!solicitacaoSelecionada) return;

    atualizarSolicitacao(
      {
        ...solicitacaoSelecionada,
        situacao: "EM_CORRECAO",
        responsavelCorrecao: "João Silva",
      },
      "Registro atualizado com sucesso!",
    );
    setModalIniciarAberto(false);
    setMotivoReinicioCorrecao("");
  };

  const abrirAnaliseConformidade = (
    solicitacao: SolicitacaoAjusteFolhaRow,
    acao: "APROVAR" | "REJEITAR",
  ) => {
    setSolicitacaoSelecionada(solicitacao);
    setAcaoAnaliseConformidade(acao);
    setComplementoConformidade("");
    setFeedback("");
  };

  const confirmarAnaliseConformidade = (
    acao = acaoAnaliseConformidade,
    parecerInformado?: string,
  ) => {
    if (!solicitacaoSelecionada) return;

    const complemento = (parecerInformado ?? complementoConformidade).trim();
    const situacaoDestino: SolicitacaoAjusteFolhaSituacao =
      acao === "APROVAR"
        ? "AGUARDANDO_CORRECAO"
        : acao === "LIBERAR_SETORIAL"
          ? "AGUARDANDO_AJUSTE"
          : "REJEITADA_CONFORMIDADE";

    atualizarSolicitacao(
      {
        ...solicitacaoSelecionada,
        situacao: situacaoDestino,
        complementoConformidade: complemento,
        motivoDevolucao:
          acao === "REJEITAR"
            ? complemento
            : solicitacaoSelecionada.motivoDevolucao,
      },
      "Registro atualizado com sucesso!",
    );
    folhaPagamentoService.registrarHistoricoSolicitacaoAjusteFolha(
      solicitacaoSelecionada.id,
      situacaoDestino,
      usuarioAtual,
      `${
        acao === "APROVAR"
          ? "Solicitação enviada para a Folha"
          : acao === "LIBERAR_SETORIAL"
            ? "Ajuste liberado para a Setorial"
            : "Solicitação rejeitada"
      } pela Conformidade.${
        complemento
          ? ` ${acao === "REJEITAR" ? "Motivo da rejeição" : "Complemento"}: ${complemento}`
          : ""
      }`,
    );
    setComplementoConformidade("");
    setMotivoRejeicaoConformidade("");
    setModalAnaliseConformidadeAberto(false);
    voltarParaListagemSolicitacoes();
  };

  const confirmarParecerSetorial = () => {
    if (!solicitacaoSelecionada) return;

    const parecer = parecerSetorial.trim();
    if (!parecer) {
      setFeedback("Informe o parecer da setorial.");
      return;
    }

    const solicitacaoAtualizada: SolicitacaoAjusteFolhaRow = {
      ...solicitacaoSelecionada,
      situacao: "AGUARDANDO_ANALISE",
      parecerSetorial: parecer,
    };

    atualizarSolicitacao(
      solicitacaoAtualizada,
      "Parecer do ajuste enviado com sucesso!",
    );
    setDocumentosParecerSetorialPorSolicitacao((current) => ({
      ...current,
      [solicitacaoSelecionada.id]: documentosParecerSetorial,
    }));
    folhaPagamentoService.registrarHistoricoSolicitacaoAjusteFolha(
      solicitacaoSelecionada.id,
      "AGUARDANDO_ANALISE",
      usuarioAtual,
      `Parecer do ajuste enviado pela Setorial. Parecer: ${parecer}${
        documentosParecerSetorial.length
          ? ` Anexos: ${documentosParecerSetorial
              .map((documento) => documento.nome)
              .join(", ")}`
          : ""
      }`,
    );
    voltarParaListagemSolicitacoes();
  };

  const abrirModalRejeicaoConformidade = () => {
    setAcaoAnaliseConformidade("REJEITAR");
    setMotivoRejeicaoConformidade("");
    setFeedback("");
    setModalAnaliseConformidadeAberto(true);
  };

  const confirmarRejeicaoConformidade = () => {
    const motivo = motivoRejeicaoConformidade.trim();

    if (!motivo) {
      setFeedback("Informe o motivo da rejeição.");
      return;
    }

    confirmarAnaliseConformidade("REJEITAR", motivo);
  };

  const confirmarFinalizacaoCorrecao = () => {
    if (!solicitacaoSelecionada) return;
    const numeroExecucao = numeroExecucaoFinalizacao.trim();

    if (!numeroExecucao) {
      setNumeroExecucaoFinalizacaoErro("Campo obrigatório");
      return;
    }

    atualizarSolicitacao(
      {
        ...solicitacaoSelecionada,
        numeroExecucaoProcessamento: numeroExecucao,
        situacao: "CORRIGIDO",
      },
      "Registro atualizado com sucesso!",
    );
    setNumeroExecucaoFinalizacao("");
    setNumeroExecucaoFinalizacaoErro("");
    setModalFinalizarAberto(false);
  };

  const confirmarDevolucao = () => {
    if (!solicitacaoSelecionada || !motivoDevolucao.trim()) {
      setFeedback("Campo obrigatório");
      return;
    }

    atualizarSolicitacao(
      {
        ...solicitacaoSelecionada,
        situacao: "DEVOLVIDO",
        motivoDevolucao: motivoDevolucao.trim(),
      },
      "Registro atualizado com sucesso!",
    );
    setMotivoDevolucao("");
    setDocumentosDevolucao([]);
    setModalDevolverAberto(false);
  };

  const confirmarConclusao = () => {
    if (!solicitacaoSelecionada) return;
    if (perfil !== "CONFORMIDADE") {
      setModalConcluirAberto(false);
      setFeedback("Ação indisponível para o perfil Folha de Pagamento.");
      return;
    }

    atualizarSolicitacao(
      {
        ...solicitacaoSelecionada,
        situacao: "CONCLUIDO",
        dataFechamento: "03/06/2026",
      },
      "Registro atualizado com sucesso!",
    );
    setModalConcluirAberto(false);
  };

  const renderAcoesSolicitacao = (solicitacao: SolicitacaoAjusteFolhaRow) => {
    const isConformidade = perfil === "CONFORMIDADE";
    const isFolhaPagamento = perfil === "FOLHA";
    const isSetorial = perfil === "SETORIAL";
    const podeIniciar =
      isFolhaPagamento &&
      (solicitacao.situacao === "NOVA" ||
        solicitacao.situacao === "AGUARDANDO_CORRECAO" ||
        solicitacao.situacao === "DEVOLVIDO");
    const podeFinalizar =
      isFolhaPagamento && solicitacao.situacao === "EM_CORRECAO";

    if (isFolhaPagamento) {
      return (
        <>
          <BotaoIconSeplag
            type="button"
            tooltip="Visualizar"
            icon="pi pi-eye"
            onClick={() => abrirVisualizar(solicitacao)}
          />
          {podeIniciar ? (
            <BotaoIconSeplag
              type="button"
              tooltip={
                solicitacao.situacao === "DEVOLVIDO"
                  ? "Reiniciar Correção"
                  : "Iniciar Correção"
              }
              icon="pi pi-play"
              onClick={() => {
                setSolicitacaoSelecionada(solicitacao);
                setMotivoReinicioCorrecao(
                  solicitacao.situacao === "DEVOLVIDO"
                    ? solicitacao.motivoDevolucao ?? ""
                    : "",
                );
                setModalIniciarAberto(true);
              }}
            />
          ) : null}
          {podeFinalizar ? (
            <BotaoIconSeplag
              severity="success"
              type="button"
              tooltip="Finalizar Correção"
              icon="pi pi-check-circle"
              onClick={() => abrirFinalizacaoCorrecao(solicitacao)}
            />
          ) : null}
          <BotaoIconSeplag
            severity="secondary"
            type="button"
            tooltip="Histórico"
            icon="pi pi-history"
            onClick={() => abrirHistorico(solicitacao)}
          />
        </>
      );
    }

    if (isSetorial) {
      const podeEditarExcluir = solicitacao.situacao === "AGUARDANDO_ANALISE";
      const podeParecerAjuste = solicitacao.situacao === "AGUARDANDO_AJUSTE";

      return (
        <>
          <BotaoIconSeplag
            type="button"
            tooltip="Visualizar"
            icon="pi pi-eye"
            onClick={() => abrirVisualizar(solicitacao)}
          />
          {podeEditarExcluir ? (
            <BotaoIconSeplag
              type="button"
              tooltip="Editar"
              icon="pi pi-pencil"
              style={{ backgroundColor: "#ffb300", border: "1px solid #0d6efd", color: "#ffffff" }}
              onClick={() => abrirFormularioSolicitacao("editar", solicitacao)}
            />
          ) : null}
          {podeParecerAjuste ? (
            <BotaoIconSeplag
              severity="warning"
              type="button"
              tooltip="Parecer do Ajuste"
              icon="pi pi-file-edit"
              onClick={() => abrirParecerSetorial(solicitacao)}
            />
          ) : null}
          {podeEditarExcluir ? (
            <BotaoIconSeplag
              severity="danger"
              type="button"
              tooltip="Excluir"
              icon="pi pi-trash"
              onClick={() => {
                setSolicitacaoSelecionada(solicitacao);
                setModalExcluirAberto(true);
              }}
            />
          ) : null}
          <BotaoIconSeplag
            severity="secondary"
            type="button"
            tooltip="Histórico"
            icon="pi pi-history"
            onClick={() => abrirHistorico(solicitacao)}
          />
        </>
      );
    }

    const podeEditarExcluir =
      isConformidade && solicitacao.situacao === "NOVA";
    const podeAnalisar =
      isConformidade && solicitacao.situacao === "AGUARDANDO_ANALISE";
    const podeDevolverConcluir =
      isConformidade && solicitacao.situacao === "CORRIGIDO";

    return (
      <>
        <BotaoIconSeplag
          type="button"
          tooltip="Visualizar"
          icon="pi pi-eye"
          onClick={() => abrirVisualizar(solicitacao)}
        />
        {podeAnalisar ? (
          <BotaoIconSeplag
            severity="warning"
            type="button"
            tooltip="Analisar Solicitação"
            icon="pi pi-clipboard"
            onClick={() => abrirAnalisarConformidade(solicitacao)}
          />
        ) : null}
        {podeEditarExcluir ? (
          <BotaoIconSeplag
            type="button"
            tooltip="Editar"
            icon="pi pi-pencil"
            style={{ backgroundColor: "#ffb300", border: "1px solid #0d6efd", color: "#ffffff" }}
            onClick={() => abrirFormularioSolicitacao("editar", solicitacao)}
          />
        ) : null}
        {podeEditarExcluir ? (
          <BotaoIconSeplag
            severity="danger"
            type="button"
            tooltip="Excluir"
            icon="pi pi-trash"
            onClick={() => {
              setSolicitacaoSelecionada(solicitacao);
              setModalExcluirAberto(true);
            }}
          />
        ) : null}
        {podeIniciar ? (
          <BotaoIconSeplag
            type="button"
            tooltip="Iniciar Correção"
            icon="pi pi-play"
            onClick={() => {
              setSolicitacaoSelecionada(solicitacao);
              setModalIniciarAberto(true);
            }}
          />
        ) : null}
        {podeFinalizar ? (
          <BotaoIconSeplag
            type="button"
            tooltip="Finalizar Correção"
            icon="pi pi-check-circle"
            onClick={() => abrirFinalizacaoCorrecao(solicitacao)}
          />
        ) : null}
        {podeDevolverConcluir ? (
          <BotaoIconSeplag
            severity="danger"
            type="button"
            tooltip="Devolver Solicitação"
            icon="pi pi-replay"
            onClick={() => {
              setSolicitacaoSelecionada(solicitacao);
              setMotivoDevolucao("");
              setDocumentosDevolucao([]);
              setModalDevolverAberto(true);
            }}
          />
        ) : null}
        {podeDevolverConcluir ? (
          <BotaoIconSeplag
            severity="success"
            type="button"
            tooltip="Concluir Solicitação"
            icon="pi pi-verified"
            onClick={() => {
              setSolicitacaoSelecionada(solicitacao);
              setModalConcluirAberto(true);
            }}
          />
        ) : null}
        <BotaoIconSeplag
          severity="secondary"
          type="button"
          tooltip="Histórico"
          icon="pi pi-history"
          onClick={() => abrirHistorico(solicitacao)}
        />
      </>
    );
  };

  const solicitacaoColumns: ColumnMetaSeplag<SolicitacaoAjusteFolhaRow>[] = [
    { field: "numeroFolha", header: "Número da Folha" },
    { field: "nomeFolha", header: "Nome da Folha" },
    { field: "competencia", header: "Competência" },
    {
      header: "Matrícula/CPF ou\nGrupo de Eleitos",
      body: (row) =>
        row.matriculaCpf && row.matriculaCpf !== "-"
          ? row.matriculaCpf
          : row.grupoEleitos,
    },
    { field: "solicitante", header: "Solicitante" },
    { field: "dataCriacao", header: "Data de\nCriação" },
    { field: "dataFechamento", header: "Data de\nFechamento" },
    {
      header: "Nº Execução\nProcessamento",
      body: (row) => row.numeroExecucaoProcessamento || "-",
    },
    {
      header: "Situação",
      body: (row) => renderSolicitacaoSituacaoBadge(row.situacao),
    },
  ];

  useEffect(() => {
    if (
      escopoSolicitacao === "MATRICULA_CPF" &&
      formularioSolicitacao.grupoEleitos
    ) {
      selecionarEscopoSolicitacao(escopoSolicitacao);
    }

    if (
      escopoSolicitacao === "GRUPO_ELEITOS" &&
      formularioSolicitacao.matriculasCpf?.length
    ) {
      selecionarEscopoSolicitacao(escopoSolicitacao);
    }
  }, [
    escopoSolicitacao,
    formularioSolicitacao.grupoEleitos,
    formularioSolicitacao.matriculasCpf,
  ]);

  if (modoFormularioSolicitacao) {
    const tituloFormulario =
      modoFormularioSolicitacao === "novo"
        ? "Cadastrar - Solicitação de Ajuste da Folha"
        : modoFormularioSolicitacao === "editar"
          ? "Alterar - Solicitação de Ajuste da Folha"
          : "Visualizar - Solicitação de Ajuste da Folha";

    return (
      <PrototypeSystemPage
        nomeSistema="FOLHA"
        ambienteSistema="Teste"
        menuItems={menuFolha}
      >
        <form onSubmit={handleSubmitSolicitacao(salvarFormularioSolicitacao)}>
          <div className="prototype-page-content prototype-page-content--white prototype-folha-pagamento-page prototype-solicitacoes-ajustes-page">
            {feedback ? (
              <div className="prototype-validation-panel">{feedback}</div>
            ) : null}

            <CardSeplag
              title={
                analisandoConformidade
                  ? "Analisar Solicitação de Ajuste da Folha"
                  : analisandoSetorial
                    ? "Parecer do Ajuste"
                  : tituloFormulario
              }
              cols="12"
              cardHeaderClassNames="prototype-regime-card"
              actions={
                <div className="prototype-solicitacao-ajuste-competencia">
                  <span>Competência vigente:</span>
                  <strong>{formatarCompetenciaFolha(competenciaVigente)}</strong>
                </div>
              }
            >
              <div className="col-12 prototype-solicitacao-ajuste-form">
                <section className="prototype-folha-form-section">
                  <h3>Cadastro da Solicitação de Ajuste da Folha</h3>
                  <div className="grid prototype-category-form-fields">
                    <DropdownFieldSeplag
                      name="numeroFolha"
                      control={controlSolicitacao}
                      label="Número da Folha"
                      cols="12 12 3"
                      required
                      disabled={isFormularioSolicitacaoReadonly}
                      options={folhasProcessadasOptions}
                      optionLabel="label"
                      optionValue="value"
                      onChange={selecionarFolhaFormularioSolicitacao}
                      getFormErrorMessage={() =>
                        getSolicitacaoFormErrorMessage("numeroFolha")
                      }
                    />
                    <TextFieldSeplag
                      name="nomeFolha"
                      control={controlSolicitacao}
                      label="Nome da Folha"
                      cols="12 12 5"
                      required
                      disabled
                      getFormErrorMessage={() =>
                        getSolicitacaoFormErrorMessage("nomeFolha")
                      }
                    />
                    <DropdownFieldSeplag
                      name="competencia"
                      control={controlSolicitacao}
                      label="Competência"
                      cols="12 12 2"
                      required
                      disabled={isFormularioSolicitacaoReadonly}
                      options={solicitacaoAjusteFolhaCompetenciaOptions}
                      optionLabel="label"
                      optionValue="value"
                      getFormErrorMessage={() =>
                        getSolicitacaoFormErrorMessage("competencia")
                      }
                    />
                    <TextFieldSeplag
                      name="dataCriacao"
                      control={controlSolicitacao}
                      label="Data de criação"
                      cols="12 12 2"
                      required
                      disabled
                      getFormErrorMessage={() =>
                        getSolicitacaoFormErrorMessage("dataCriacao")
                      }
                    />
                    <RadioButtonFieldSeplag
                      name="escopo"
                      control={controlSolicitacao}
                      label="Origem da Solicitação"
                      cols="12"
                      required
                      disabled={isFormularioSolicitacaoReadonly}
                      options={solicitacaoAjusteFolhaEscopoOptions}
                      getFormErrorMessage={() =>
                        getSolicitacaoFormErrorMessage("escopo")
                      }
                    />
                    <MultiSelectFieldSeplag
                      name="matriculasCpf"
                      control={controlSolicitacao}
                      label="Matrícula ou CPF"
                      cols="12 12 6"
                      visible={escopoSolicitacao === "MATRICULA_CPF"}
                      required={escopoSolicitacao === "MATRICULA_CPF"}
                      disabled={
                        isFormularioSolicitacaoReadonly ||
                        escopoSolicitacao !== "MATRICULA_CPF"
                      }
                      options={pessoasSolicitacaoOptions}
                      optionLabel="label"
                      optionValue="value"
                      selectedItemsLabel="{0} pessoas selecionadas"
                      placeholder="Selecione matrícula ou CPF"
                      getFormErrorMessage={() =>
                        getSolicitacaoFormErrorMessage("matriculasCpf")
                      }
                    />
                    <DropdownFieldSeplag
                      name="grupoEleitos"
                      control={controlSolicitacao}
                      label="Grupo de Eleitos"
                      cols="12 12 6"
                      visible={escopoSolicitacao === "GRUPO_ELEITOS"}
                      required={escopoSolicitacao === "GRUPO_ELEITOS"}
                      disabled={
                        isFormularioSolicitacaoReadonly ||
                        escopoSolicitacao !== "GRUPO_ELEITOS"
                      }
                      options={solicitacaoAjusteFolhaGrupoEleitosOptions}
                      optionLabel="label"
                      optionValue="value"
                      getFormErrorMessage={() =>
                        getSolicitacaoFormErrorMessage("grupoEleitos")
                      }
                    />
                    <TextAreaFieldSeplag
                      name="motivoAbertura"
                      control={controlSolicitacao}
                      label="Motivo do ajuste"
                      cols="12"
                      rows={5}
                      maxLength={500}
                      required
                      disabled={isFormularioSolicitacaoReadonly}
                      placeholder="Descreva o motivo do ajuste solicitado."
                      getFormErrorMessage={() =>
                        getSolicitacaoFormErrorMessage("motivoAbertura")
                      }
                    />
                    <AnexarDocumentoSeplag
                      label="Documento"
                      cols="12"
                      style={{ maxWidth: "760px" }}
                      multiple={!isFormularioSolicitacaoReadonly}
                      accept=".pdf,.doc,.csv,.xlsx,.xls,.docx"
                      maxFileSize={2 * 1024 * 1024}
                      helpText="Formatos aceitos: .pdf, .doc, .csv, .xlsx, .xls e .docx | Tamanho máximo: 2MB por arquivo"
                      arquivosBase64={documentosFormularioSolicitacao}
                      onUploadDocument={
                        isFormularioSolicitacaoReadonly
                          ? undefined
                          : anexarDocumentosFormularioSolicitacao
                      }
                      onRemoveArquivo={
                        isFormularioSolicitacaoReadonly
                          ? undefined
                          : removerDocumentoFormularioSolicitacao
                      }
                      onDownloadArquivo={(arquivo) =>
                        setFeedback(
                          `Documento ${arquivo.nome} selecionado para download.`,
                        )
                      }
                      handleViewArquivo={(arquivo) =>
                        setFeedback(
                          arquivo
                            ? `Documento ${arquivo.nome} selecionado para visualização.`
                            : "Documento selecionado para visualização.",
                        )
                      }
                    />
                  </div>
                </section>

                {isFormularioSolicitacaoReadonly &&
                ((analisandoConformidade &&
                  perfil === "CONFORMIDADE" &&
                  solicitacaoSelecionada?.situacao === "AGUARDANDO_ANALISE") ||
                  (analisandoSetorial &&
                    perfil === "SETORIAL" &&
                    solicitacaoSelecionada?.situacao === "AGUARDANDO_AJUSTE")) ? (
                  <section className="prototype-folha-form-section">
                    <h3>Parecer da Conformidade</h3>
                    <div className="grid prototype-category-form-fields">
                      <div className="col-12">
                        <textarea
                          className="prototype-solicitacoes-ajustes-textarea"
                          value={complementoConformidade}
                          placeholder="Descreva o complemento da análise, se necessário."
                          disabled={analisandoSetorial}
                          onChange={(event) =>
                            setComplementoConformidade(event.target.value)
                          }
                        />
                      </div>
                    </div>
                  </section>
                ) : null}

                {isFormularioSolicitacaoReadonly &&
                analisandoConformidade &&
                perfil === "CONFORMIDADE" &&
                solicitacaoSelecionada?.situacao === "AGUARDANDO_ANALISE" &&
                solicitacaoSelecionada?.parecerSetorial ? (
                  <section className="prototype-folha-form-section">
                    <h3>Parecer da Setorial</h3>
                    <div className="grid prototype-category-form-fields">
                      <div className="col-12">
                        <textarea
                          className="prototype-solicitacoes-ajustes-textarea"
                          value={solicitacaoSelecionada.parecerSetorial}
                          disabled
                        />
                      </div>
                      {documentosParecerSetorial.length ? (
                        <AnexarDocumentoSeplag
                          label="Documento"
                          cols="12"
                          style={{ maxWidth: "760px" }}
                          multiple={false}
                          arquivosBase64={documentosParecerSetorial}
                          onDownloadArquivo={(arquivo) =>
                            setFeedback(
                              `Documento ${arquivo.nome} selecionado para download.`,
                            )
                          }
                          handleViewArquivo={(arquivo) =>
                            setFeedback(
                              arquivo
                                ? `Documento ${arquivo.nome} selecionado para visualização.`
                                : "Documento selecionado para visualização.",
                            )
                          }
                        />
                      ) : null}
                    </div>
                  </section>
                ) : null}

                {isFormularioSolicitacaoReadonly &&
                analisandoSetorial &&
                perfil === "SETORIAL" &&
                solicitacaoSelecionada?.situacao === "AGUARDANDO_AJUSTE" ? (
                  <section className="prototype-folha-form-section">
                    <h3>
                      Parecer da Setorial <span className="prototype-required-mark">*</span>
                    </h3>
                    <div className="grid prototype-category-form-fields">
                      <div className="col-12">
                        <textarea
                          className="prototype-solicitacoes-ajustes-textarea"
                          value={parecerSetorial}
                          placeholder="Descreva o parecer da setorial."
                          onChange={(event) =>
                            setParecerSetorial(event.target.value)
                          }
                        />
                      </div>
                      <AnexarDocumentoSeplag
                        label="Documento"
                        cols="12"
                        style={{ maxWidth: "760px" }}
                        multiple
                        accept=".pdf,.doc,.csv,.xlsx,.xls,.docx"
                        maxFileSize={2 * 1024 * 1024}
                        helpText="Formatos aceitos: .pdf, .doc, .csv, .xlsx, .xls e .docx | Tamanho máximo: 2MB por arquivo"
                        arquivosBase64={documentosParecerSetorial}
                        onUploadDocument={anexarDocumentosParecerSetorial}
                        onRemoveArquivo={removerDocumentoParecerSetorial}
                        onDownloadArquivo={(arquivo) =>
                          setFeedback(
                            `Documento ${arquivo.nome} selecionado para download.`,
                          )
                        }
                        handleViewArquivo={(arquivo) =>
                          setFeedback(
                            arquivo
                              ? `Documento ${arquivo.nome} selecionado para visualização.`
                              : "Documento selecionado para visualização.",
                          )
                        }
                      />
                    </div>
                  </section>
                ) : null}

                <div className="prototype-category-form-footer">
                  <BotaoVoltarSeplag
                    type="button"
                    label="Voltar"
                    icon="pi pi-arrow-left"
                    onClick={solicitarSaidaFormularioSolicitacao}
                  />
                  {isFormularioSolicitacaoReadonly &&
                  ((perfil === "SETORIAL" &&
                    solicitacaoSelecionada?.situacao === "AGUARDANDO_ANALISE") ||
                    (perfil === "CONFORMIDADE" &&
                      solicitacaoSelecionada?.situacao === "NOVA")) ? (
                    <BotaoSeplag
                      type="button"
                      label="Editar"
                      icon="pi pi-pencil"
                      tooltip="Alterar"
                      onClick={() => setModoFormularioSolicitacao("editar")}
                    />
                  ) : null}
                  {isFormularioSolicitacaoReadonly &&
                  analisandoConformidade &&
                  perfil === "CONFORMIDADE" &&
                  solicitacaoSelecionada?.situacao === "AGUARDANDO_ANALISE" ? (
                    <>
                      <BotaoSeplag
                        type="button"
                        label="Liberar Ajuste para Setorial"
                        icon="pi pi-send"
                        severity="warning"
                        style={{ color: "#ffffff", minWidth: 190 }}
                        onClick={() =>
                          confirmarAnaliseConformidade("LIBERAR_SETORIAL")
                        }
                      />
                      <BotaoSeplag
                        type="button"
                        label="Enviar Ajuste para Folha"
                        icon="pi pi-check"
                        style={{ color: "#ffffff", minWidth: 180 }}
                        onClick={() => confirmarAnaliseConformidade("APROVAR")}
                      />
                    </>
                  ) : null}
                  {isFormularioSolicitacaoReadonly &&
                  analisandoSetorial &&
                  perfil === "SETORIAL" &&
                  solicitacaoSelecionada?.situacao === "AGUARDANDO_AJUSTE" ? (
                    <BotaoSeplag
                      type="button"
                      label="Enviar Parecer"
                      icon="pi pi-send"
                      style={{ color: "#ffffff", minWidth: 150 }}
                      onClick={confirmarParecerSetorial}
                    />
                  ) : null}
                  {!isFormularioSolicitacaoReadonly ? (
                    <BotaoSalvarSeplag type="submit" />
                  ) : null}
                </div>
              </div>
            </CardSeplag>

            <ModalSeplag
              visible={modalSairFormularioAberto}
              titulo="Alterações não salvas"
              fechar={() => setModalSairFormularioAberto(false)}
              labelFechar="Cancelar"
              labelAcao="Sim"
              iconAcao="pi pi-check"
              funcAcao={() => {
                setModalSairFormularioAberto(false);
                voltarParaListagemSolicitacoes();
              }}
              tamanho="620px"
            >
              <p className="col-12">
                Você possui alterações não salvas. Se sair agora, os dados serão
                perdidos. Deseja continuar?
              </p>
            </ModalSeplag>
            <ModalSeplag
              visible={modalAnaliseConformidadeAberto}
              titulo="Rejeitar Solicitação"
              fechar={() => {
                setModalAnaliseConformidadeAberto(false);
                setMotivoRejeicaoConformidade("");
              }}
              labelFechar="Cancelar"
              labelAcao="Confirmar Rejeição"
              iconAcao="pi pi-times"
              funcAcao={confirmarRejeicaoConformidade}
              tamanho="720px"
            >
              <div className="col-12 prototype-solicitacoes-ajustes-modal-text">
                Confirme a rejeição da solicitação e informe o motivo.
              </div>
              <div className="col-12">
                <label className="prototype-solicitacoes-ajustes-textarea-label">
                  Motivo da rejeição <span>*</span>
                </label>
                <textarea
                  className="prototype-solicitacoes-ajustes-textarea"
                  value={motivoRejeicaoConformidade}
                  placeholder="Descreva o motivo da rejeição."
                  onChange={(event) =>
                    setMotivoRejeicaoConformidade(event.target.value)
                  }
                />
              </div>
            </ModalSeplag>
          </div>
        </form>
      </PrototypeSystemPage>
    );
  }

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-folha-pagamento-page prototype-solicitacoes-ajustes-page">
        <div className="prototype-solicitacoes-ajustes-header">
          <div>
            <h1>Solicitações de Ajustes da Folha de Pagamento</h1>
          </div>
          <div className="prototype-solicitacoes-ajustes-user">
            <label>
              Perfil da variação
              <select
                value={perfil}
                onChange={(event) =>
                  setPerfil(event.target.value as SolicitacaoAjusteFolhaPerfil)
                }
              >
                <option value="SETORIAL">
                  Patrícia Lima - Setorial
                </option>
                <option value="CONFORMIDADE">
                  Maria de Souza - Conformidade
                </option>
                <option value="FOLHA">
                  João Silva - Folha de Pagamento
                </option>
              </select>
            </label>
            <span>{usuarioAtual}</span>
          </div>
        </div>

        {feedback ? (
          <div className="prototype-validation-panel">{feedback}</div>
        ) : null}

        <div className="prototype-solicitacoes-ajustes-dashboard">
          {resumoSolicitacoesPorSituacao.map((situacao) => (
            <div
              key={situacao.value}
              style={{
                backgroundColor: situacao.meta.bg,
                borderColor: situacao.meta.color,
              }}
            >
              <span style={{ color: situacao.meta.color }}>
                {situacao.meta.label}
              </span>
              <strong>{situacao.total}</strong>
            </div>
          ))}
        </div>

        <CardSeplag cols="12" cardHeaderClassNames="prototype-regime-card">
          <div className="col-12 prototype-category-filters prototype-folha-pagamento-filters prototype-solicitacoes-ajustes-filters">
            <TextFieldSeplag
              name="termoFolha"
              control={control}
              label="Número da Folha ou Nome da Folha"
              placeholder="Digite o número ou nome da folha"
              cols="12 12 3"
              getFormErrorMessage={() => null}
            />
            <MultiSelectFieldSeplag
              name="competencias"
              control={control}
              label="Competência"
              placeholder="Selecione a competência"
              cols="12 12 2"
              options={solicitacaoAjusteFolhaCompetenciaOptions}
              optionLabel="label"
              optionValue="value"
              selectedItemsLabel="{0} competências selecionadas"
              getFormErrorMessage={() => null}
            />
            <MultiSelectFieldSeplag
              name="gruposEleitos"
              control={control}
              label="Grupo de Eleitos"
              placeholder="Selecione o grupo"
              cols="12 12 2"
              options={solicitacaoAjusteFolhaGrupoEleitosOptions}
              optionLabel="label"
              optionValue="value"
              selectedItemsLabel="{0} grupos selecionados"
              getFormErrorMessage={() => null}
            />
            <TextFieldSeplag
              name="matriculaCpf"
              control={control}
              label="Matrícula ou CPF"
              placeholder="Digite a matrícula ou CPF"
              cols="12 12 2"
              getFormErrorMessage={() => null}
            />
            <MultiSelectFieldSeplag
              name="situacoes"
              control={control}
              label="Situação"
              placeholder="Selecione a situação"
              cols="12 12 2"
              options={solicitacaoAjusteFolhaSituacaoOptions}
              optionLabel="label"
              optionValue="value"
              selectedItemsLabel="{0} situações selecionadas"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-1">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={() =>
                  reset({
                    termoFolha: "",
                    competencias: [],
                    matriculaCpf: "",
                    gruposEleitos: [],
                    situacoes: [],
                  })
                }
              />
            </div>
          </div>
        </CardSeplag>

        <CardSeplag
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="col-12 prototype-solicitacoes-ajustes-card-actions">
              <BotaoSeplag
                type="button"
                label="Nova Solicitação"
                icon="pi pi-plus"
                style={{ color: "#ffffff" }}
                hasPermission={perfil === "SETORIAL" || perfil === "CONFORMIDADE"}
                onClick={() => abrirFormularioSolicitacao("novo")}
              />
            </div>
          <div className="col-12 prototype-folha-pagamento-table prototype-solicitacoes-ajustes-table">
            <TablePaginadoSeplag
              key={`solicitacoes-ajustes-${perfil}`}
              dataKey="id"
              data={solicitacaoResults}
              rows={10}
              rowsPerPage={[5, 10, 25, 50]}
              paginator
              lazy={false}
              selectionMode={null}
              columns={solicitacaoColumns}
              hasEventoAcao
              renderBotoes={renderAcoesSolicitacao}
              handleOnPageChange={() => {}}
            />
          </div>
        </CardSeplag>

        <ModalSeplag
          visible={modalVisualizarAberto}
          titulo="Visualizar Solicitação"
          fechar={() => setModalVisualizarAberto(false)}
          tamanho="860px"
          hideFooter
        >
          {solicitacaoSelecionada ? (
            <div className="col-12 prototype-catalogo-view-content">
              <p><strong>Número da Folha:</strong> {solicitacaoSelecionada.numeroFolha}</p>
              <p><strong>Nome da Folha:</strong> {solicitacaoSelecionada.nomeFolha}</p>
              <p><strong>Competência:</strong> {solicitacaoSelecionada.competencia}</p>
              <p><strong>Matrícula ou CPF:</strong> {solicitacaoSelecionada.matriculaCpf}</p>
              <p><strong>Grupo de Eleitos:</strong> {solicitacaoSelecionada.grupoEleitos}</p>
              <p><strong>Solicitante:</strong> {solicitacaoSelecionada.solicitante}</p>
              <p><strong>Responsável:</strong> {solicitacaoSelecionada.responsavelCorrecao}</p>
              <p><strong>Situação:</strong> {renderSolicitacaoSituacaoBadge(solicitacaoSelecionada.situacao)}</p>
              <p><strong>Motivo da abertura:</strong> {solicitacaoSelecionada.motivoAbertura}</p>
              <p><strong>Motivo da devolução:</strong> {solicitacaoSelecionada.motivoDevolucao ?? "-"}</p>
              <p><strong>Complemento da Conformidade:</strong> {solicitacaoSelecionada.complementoConformidade ?? "-"}</p>
            </div>
          ) : null}
        </ModalSeplag>

        <ModalSeplag
          visible={modalExcluirAberto}
          titulo="Excluir Solicitação"
          fechar={() => setModalExcluirAberto(false)}
          labelFechar="Cancelar"
          labelAcao="Excluir"
          iconAcao="pi pi-trash"
          funcAcao={confirmarExclusaoSolicitacao}
          tamanho="520px"
        >
          <p className="col-12">Deseja realmente excluir o registro selecionado?</p>
        </ModalSeplag>

        <ModalSeplag
          visible={modalAnaliseConformidadeAberto}
          titulo={
            acaoAnaliseConformidade === "APROVAR"
              ? "Aprovar Solicitação"
              : "Rejeitar Solicitação"
          }
          fechar={() => {
            setModalAnaliseConformidadeAberto(false);
            setMotivoRejeicaoConformidade("");
          }}
          labelFechar="Cancelar"
          labelAcao={
            acaoAnaliseConformidade === "APROVAR"
              ? "Confirmar Aprovação"
              : "Confirmar Rejeição"
          }
          iconAcao={
            acaoAnaliseConformidade === "APROVAR" ? "pi pi-check" : "pi pi-times"
          }
          funcAcao={confirmarRejeicaoConformidade}
          tamanho="720px"
        >
          <div className="col-12 prototype-solicitacoes-ajustes-modal-text">
            Confirme a rejeição da solicitação e informe o motivo.
          </div>
          <div className="col-12">
            <label className="prototype-solicitacoes-ajustes-textarea-label">
              Motivo da rejeição <span>*</span>
            </label>
            <textarea
              className="prototype-solicitacoes-ajustes-textarea"
              value={motivoRejeicaoConformidade}
              placeholder="Descreva o motivo da rejeição."
              onChange={(event) => setMotivoRejeicaoConformidade(event.target.value)}
            />
          </div>
        </ModalSeplag>

        <ModalSeplag
          visible={modalDevolverAberto}
          titulo="Devolver Solicitação"
          fechar={() => setModalDevolverAberto(false)}
          labelFechar="Cancelar"
          labelAcao="Confirmar Devolução"
          iconAcao="pi pi-replay"
          funcAcao={confirmarDevolucao}
          tamanho="820px"
        >
          <div className="col-12 prototype-solicitacoes-ajustes-modal-text">
            Informe o motivo pelo qual a correção deverá retornar para a equipe
            de Folha de Pagamento.
          </div>
          <div className="col-12">
            <label className="prototype-solicitacoes-ajustes-textarea-label">
              Motivo da Devolução
            </label>
            <textarea
              className="prototype-solicitacoes-ajustes-textarea"
              value={motivoDevolucao}
              placeholder="Descreva o motivo da devolução e as orientações para correção."
              onChange={(event) => setMotivoDevolucao(event.target.value)}
            />
          </div>
          <AnexarDocumentoSeplag
            label="Documentos Anexados"
            cols="12"
            multiple
            arquivosBase64={documentosDevolucao}
            onUploadDocument={anexarDocumentosDevolucao}
            onRemoveArquivo={removerDocumentoDevolucao}
            canDownload={false}
            handleViewArquivo={(arquivo) =>
              setFeedback(
                arquivo
                  ? `Documento ${arquivo.nome} selecionado para visualização.`
                  : "Documento selecionado para visualização.",
              )
            }
          />
        </ModalSeplag>

        <ModalSeplag
          visible={modalConcluirAberto}
          titulo="Concluir Solicitação"
          fechar={() => setModalConcluirAberto(false)}
          labelFechar="Cancelar"
          labelAcao="Confirmar Conclusão"
          iconAcao="pi pi-verified"
          funcAcao={confirmarConclusao}
          tamanho="620px"
        >
          <p className="col-12">
            Deseja encerrar e concluir esta solicitação de ajuste?
            <br />
            Ao confirmar, o status será alterado para 'Concluído' e o registro
            ficará permanentemente bloqueado para novas alterações ou exclusões.
          </p>
        </ModalSeplag>

        <ModalSeplag
          visible={modalIniciarAberto}
          titulo={
            solicitacaoSelecionada?.situacao === "DEVOLVIDO"
              ? "Reiniciar Correção"
              : "Iniciar Correção"
          }
          fechar={() => setModalIniciarAberto(false)}
          labelFechar="Cancelar"
          labelAcao={
            solicitacaoSelecionada?.situacao === "DEVOLVIDO"
              ? "Confirmar Reinício"
              : "Confirmar Início"
          }
          iconAcao="pi pi-play"
          funcAcao={confirmarInicioCorrecao}
          tamanho={
            solicitacaoSelecionada?.situacao === "DEVOLVIDO" ? "760px" : "620px"
          }
        >
          {solicitacaoSelecionada?.situacao === "DEVOLVIDO" ? (
            <>
              <p className="col-12">
                Esta solicitação foi devolvida pela equipe de Conformidade e
                necessita de reajuste. Deseja reiniciar a correção deste
                registro?
              </p>
              <div className="col-12">
                <label className="prototype-solicitacoes-ajustes-textarea-label">
                  Motivo da Devolução
                </label>
                <textarea
                  className="prototype-solicitacoes-ajustes-textarea"
                  value={motivoReinicioCorrecao}
                  placeholder="Informe ou revise o motivo da devolução."
                  onChange={(event) =>
                    setMotivoReinicioCorrecao(event.target.value)
                  }
                />
              </div>
              <AnexarDocumentoSeplag
                label="Documentos Anexados"
                cols="12"
                arquivosBase64={documentosReinicioCorrecao}
                canDownload={false}
                handleViewArquivo={(arquivo) =>
                  setFeedback(
                    arquivo
                      ? `Documento ${arquivo.nome} selecionado para visualização.`
                      : "Documento selecionado para visualização.",
                  )
                }
              />
            </>
          ) : (
            <p className="col-12">
              Deseja iniciar o atendimento desta solicitação? Você será
              registrado como o responsável técnico.
            </p>
          )}
        </ModalSeplag>

        <ModalSeplag
          visible={modalFinalizarAberto}
          titulo="Finalizar Correção"
          fechar={() => {
            setModalFinalizarAberto(false);
            setNumeroExecucaoFinalizacaoErro("");
          }}
          labelFechar="Cancelar"
          labelAcao="Confirmar"
          iconAcao="pi pi-check-circle"
          funcAcao={confirmarFinalizacaoCorrecao}
          tamanho="620px"
        >
          <p className="col-12">
            Deseja finalizar a correção desta solicitação? O registro será
            enviado para homologação da equipe de Conformidade.
          </p>
          <div className="col-12 prototype-finalizar-correcao-field">
            <label htmlFor="numero-execucao-finalizacao">
              Nº Execução Processamento <span>*</span>
            </label>
            <input
              id="numero-execucao-finalizacao"
              type="text"
              value={numeroExecucaoFinalizacao}
              placeholder="Informe o número da execução"
              onChange={(event) => {
                setNumeroExecucaoFinalizacao(event.target.value);
                if (event.target.value.trim()) {
                  setNumeroExecucaoFinalizacaoErro("");
                }
              }}
            />
            {numeroExecucaoFinalizacaoErro ? (
              <small className="p-error">
                {numeroExecucaoFinalizacaoErro}
              </small>
            ) : null}
          </div>
        </ModalSeplag>

        <ModalSeplag
          visible={modalHistoricoAberto}
          titulo="Histórico da Solicitação"
          fechar={() => setModalHistoricoAberto(false)}
          tamanho="900px"
          hideFooter
        >
          {solicitacaoSelecionada ? (
            <div className="col-12 prototype-solicitacoes-ajustes-history">
              <p className="prototype-solicitacoes-ajustes-history-subtitle">
                Folha {solicitacaoSelecionada.numeroFolha} -{" "}
                {solicitacaoSelecionada.nomeFolha} | Competência{" "}
                {solicitacaoSelecionada.competencia}
              </p>
              <div className="prototype-solicitacoes-ajustes-timeline">
                {historicoParaExibir.map((item) => (
                  <div
                    key={item.id}
                    className="prototype-solicitacoes-ajustes-timeline-item"
                  >
                    <div className="prototype-solicitacoes-ajustes-timeline-dot" />
                    <div>
                      {renderSolicitacaoSituacaoBadge(item.situacaoDestino)}
                      <strong>Data/Hora: {item.dataHora}</strong>
                      <span>Operador: {item.operador}</span>
                      <p>{item.descricao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </ModalSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

type FichaFinanceiraFiltroForm = {
  competencia: string;
  numeroFolha: string;
  matriculaCpf: string;
  nomeServidor: string;
};

type FichaFinanceiraRubricaRow = {
  id: number;
  rubrica: string;
  descricao: string;
  complemento: string;
  competencia: string;
  vantagem: number;
  percentual: string;
  desconto: number;
};

type FichaFinanceiraServidorOption = {
  matriculaCpf: string;
  nome: string;
};

const fichaFinanceiraServidorOptions: FichaFinanceiraServidorOption[] = [
  { matriculaCpf: "102030/1", nome: "MARIA OLIVEIRA" },
  { matriculaCpf: "887120/1", nome: "ANA SANTOS" },
  { matriculaCpf: "451278/3", nome: "CARLOS ALMEIDA" },
  { matriculaCpf: "540110/2", nome: "JOSE ROBERTO LIMA" },
];

const fichaFinanceiraRubricasMock: FichaFinanceiraRubricaRow[] = [
  {
    id: 1,
    rubrica: "001",
    descricao: "Subsídio",
    complemento: "Vínculo efetivo",
    competencia: "05/2026",
    vantagem: 12500,
    percentual: "",
    desconto: 0,
  },
  {
    id: 2,
    rubrica: "112",
    descricao: "Adicional por tempo de serviço",
    complemento: "Quinquênio",
    competencia: "05/2026",
    vantagem: 1875,
    percentual: "",
    desconto: 0,
  },
  {
    id: 3,
    rubrica: "301",
    descricao: "Previdência",
    complemento: "RPPS",
    competencia: "05/2026",
    vantagem: 0,
    percentual: "14,00%",
    desconto: 1750,
  },
  {
    id: 4,
    rubrica: "401",
    descricao: "Imposto de renda retido na fonte",
    complemento: "Tabela progressiva",
    competencia: "05/2026",
    vantagem: 0,
    percentual: "22,50%",
    desconto: 1189.36,
  },
];

export function PrototiposFolhaFichaFinanceiraPage() {
  const { control, reset, setValue } = useForm<FichaFinanceiraFiltroForm>({
    defaultValues: {
      competencia: "05/2026",
      numeroFolha: "1",
      matriculaCpf: "102030/1",
      nomeServidor: "MARIA OLIVEIRA",
    },
  });
  const [matriculaCpfSuggestions, setMatriculaCpfSuggestions] = useState<string[]>([]);
  const [nomeServidorSuggestions, setNomeServidorSuggestions] = useState<string[]>([]);
  const [resultadosFichaFinanceira, setResultadosFichaFinanceira] = useState<
    FichaFinanceiraRubricaRow[]
  >(fichaFinanceiraRubricasMock);

  const folhaNumeroOptions = folhaPagamentoService
    .listarFolhas()
    .map((folha) => ({
      label: `${folha.numero} - ${folha.nome}`,
      value: folha.numero,
      competencia: folha.competencia,
    }))
    .filter(
      (option, index, options) =>
        options.findIndex(
          (item) =>
            item.value === option.value &&
            item.label === option.label &&
            item.competencia === option.competencia,
        ) === index,
    );

  const filtrarServidoresFichaFinanceira = (query: string) => {
    const termo = query.trim().toLowerCase();
    return fichaFinanceiraServidorOptions.filter(
      (servidor) =>
        !termo ||
        servidor.matriculaCpf.toLowerCase().includes(termo) ||
        servidor.nome.toLowerCase().includes(termo),
    );
  };

  const completarMatriculaCpf = (query: string) => {
    setMatriculaCpfSuggestions(
      filtrarServidoresFichaFinanceira(query).map((servidor) => servidor.matriculaCpf),
    );
  };

  const completarNomeServidor = (query: string) => {
    setNomeServidorSuggestions(
      filtrarServidoresFichaFinanceira(query).map((servidor) => servidor.nome),
    );
  };

  const preencherServidorPorMatriculaCpf = (matriculaCpf: string) => {
    const servidor = fichaFinanceiraServidorOptions.find(
      (item) => item.matriculaCpf === matriculaCpf,
    );
    if (servidor) {
      setValue("nomeServidor", servidor.nome);
    }
  };

  const preencherServidorPorNome = (nome: string) => {
    const servidor = fichaFinanceiraServidorOptions.find((item) => item.nome === nome);
    if (servidor) {
      setValue("matriculaCpf", servidor.matriculaCpf);
    }
  };

  const pesquisarFichaFinanceira = () => {
    setResultadosFichaFinanceira(fichaFinanceiraRubricasMock);
  };

  const limparFichaFinanceira = () => {
    reset({
      competencia: "",
      numeroFolha: "",
      matriculaCpf: "",
      nomeServidor: "",
    });
    setResultadosFichaFinanceira([]);
  };

  const totalVantagens = resultadosFichaFinanceira.reduce(
    (total, item) => total + item.vantagem,
    0,
  );
  const totalDescontos = resultadosFichaFinanceira.reduce(
    (total, item) => total + item.desconto,
    0,
  );
  const totalLiquido = totalVantagens - totalDescontos;

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-ficha-financeira-page">
        <CardSeplag
          title="Ficha Financeira por Competência"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        />

        <CardSeplag cols="12" cardHeaderClassNames="prototype-regime-card">
          <div className="col-12 prototype-category-filters prototype-ficha-financeira-filters">
            <TextFieldSeplag
              name="competencia"
              control={control}
              label="Mês/Ano Competência"
              cols="12 md:col-2"
              placeholder="MM/AAAA"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="numeroFolha"
              control={control}
              label="Número da Folha"
              cols="12 md:col-2"
              options={folhaNumeroOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-ficha-financeira-autocomplete-field">
              <label htmlFor="ficha-financeira-matricula-cpf">
                Matrícula/CPF
              </label>
              <Controller
                name="matriculaCpf"
                control={control}
                render={({ field }) => (
                  <SeplagAutoComplete
                    inputId="ficha-financeira-matricula-cpf"
                    className="w-full"
                    value={field.value}
                    suggestions={matriculaCpfSuggestions}
                    placeholder="Matrícula ou CPF"
                    dropdown
                    forceSelection={false}
                    completeMethod={completarMatriculaCpf}
                    onChange={(event) => {
                      const value = String(event.value ?? "");
                      field.onChange(value);
                      preencherServidorPorMatriculaCpf(value);
                    }}
                  />
                )}
              />
            </div>
            <div className="prototype-ficha-financeira-autocomplete-field">
              <label htmlFor="ficha-financeira-nome-servidor">
                Nome do Servidor
              </label>
              <Controller
                name="nomeServidor"
                control={control}
                render={({ field }) => (
                  <SeplagAutoComplete
                    inputId="ficha-financeira-nome-servidor"
                    className="w-full"
                    value={field.value}
                    suggestions={nomeServidorSuggestions}
                    placeholder="Nome do servidor"
                    dropdown
                    forceSelection={false}
                    completeMethod={completarNomeServidor}
                    onChange={(event) => {
                      const value = String(event.value ?? "");
                      field.onChange(value);
                      preencherServidorPorNome(value);
                    }}
                  />
                )}
              />
            </div>
            <div className="prototype-ficha-financeira-filter-actions">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                onClick={limparFichaFinanceira}
              />
              <BotaoSeplag
                type="button"
                label="Pesquisar"
                icon="pi pi-search"
                onClick={pesquisarFichaFinanceira}
              />
            </div>
          </div>
        </CardSeplag>

        <CardSeplag cols="12" cardHeaderClassNames="prototype-regime-card">
          <div className="col-12 prototype-ficha-financeira-table-wrapper">
            <table className="prototype-simple-table prototype-ficha-financeira-table">
              <thead>
                <tr>
                  <th>Rubrica</th>
                  <th>Descrição Rubrica</th>
                  <th>Complemento</th>
                  <th>Competência</th>
                  <th>Vantagens</th>
                  <th>Percentual</th>
                  <th>Descontos</th>
                </tr>
              </thead>
              <tbody>
                {resultadosFichaFinanceira.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.rubrica}</strong>
                    </td>
                    <td>{item.descricao}</td>
                    <td>{item.complemento}</td>
                    <td>{item.competencia}</td>
                    <td className="prototype-ficha-financeira-money">
                      {item.vantagem ? formatMoedaReferencia(item.vantagem) : ""}
                    </td>
                    <td>{item.percentual}</td>
                    <td className="prototype-ficha-financeira-money">
                      {item.desconto ? formatMoedaReferencia(item.desconto) : ""}
                    </td>
                  </tr>
                ))}
                {!resultadosFichaFinanceira.length ? (
                  <tr>
                    <td colSpan={7} className="prototype-ficha-financeira-empty">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardSeplag>

        <CardSeplag cols="12" cardHeaderClassNames="prototype-regime-card">
          <div className="col-12 prototype-ficha-financeira-totalizador">
            <div>
              <span>Vantagens</span>
              <strong>{formatMoedaReferencia(totalVantagens)}</strong>
            </div>
            <div>
              <span>Descontos</span>
              <strong>{formatMoedaReferencia(totalDescontos)}</strong>
            </div>
            <div>
              <span>Líquido</span>
              <strong>{formatMoedaReferencia(totalLiquido)}</strong>
            </div>
            <BotaoSeplag
              type="button"
              label="Holerite"
              icon="pi pi-file-pdf"
              className="prototype-ficha-financeira-holerite-button"
              onClick={() => undefined}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaGruposCalculoPage() {
  const navigate = useNavigate();
  const [grupoHistoricoSelecionado, setGrupoHistoricoSelecionado] =
    useState<GrupoCalculoRow | null>(null);
  const [versaoHistoricoAberta, setVersaoHistoricoAberta] = useState<string | null>(null);
  const { control, reset, watch } = useForm<GrupoCalculoFiltroForm>({
    defaultValues: {
      nomeGrupo: "",
      situacao: "",
    },
  });

  const [perfilIngressos, setPerfilIngressos] = useState<IngressoPerfil>("PROVIMENTO");
  const filtros = watch();
  const termoBusca = filtros.nomeGrupo?.trim().toLowerCase() ?? "";
  const gruposFiltrados = gruposCalculoMock.filter((grupo) => {
    const atendeTermo =
      !termoBusca ||
      grupo.grupo.toLowerCase().includes(termoBusca) ||
      grupo.codigo.toLowerCase().includes(termoBusca);
    const atendeSituacao =
      !filtros.situacao ||
      normalizeGrupoCalculoSituacao(grupo.situacao) === filtros.situacao;
    return atendeTermo && atendeSituacao;
  });

  const getGrupoCalculoVersao = (grupo: GrupoCalculoRow) =>
    `V${gruposCalculoVersoesMock[grupo.id]?.length ?? 1}`;

  const abrirHistoricoGrupoCalculo = (grupo: GrupoCalculoRow) => {
    const versoes = gruposCalculoVersoesMock[grupo.id] ?? [grupo];
    setGrupoHistoricoSelecionado(grupo);
    setVersaoHistoricoAberta(`${versoes[0].id}-${versoes[0].codigo}`);
  };

  const fecharHistoricoGrupoCalculo = () => {
    setGrupoHistoricoSelecionado(null);
    setVersaoHistoricoAberta(null);
  };

  const renderGrupoCalculoHistoricoStatus = (grupo: GrupoCalculoRow, index: number) => {
    const situacao = normalizeGrupoCalculoSituacao(grupo.situacao);
    const label = situacao === "ATIVO" && index === 0 ? "Vigente" : grupoCalculoSituacaoMeta[situacao].label;
    const meta =
      situacao === "ATIVO" && index === 0
        ? { color: "#00843d", bg: "#d1fae5", border: "#bbf7d0" }
        : grupoCalculoSituacaoMeta[situacao];

    return (
      <span
        className="prototype-grupos-calculo-history-status"
        style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.border }}
      >
        {label}
      </span>
    );
  };

  const renderGrupoCalculoHistoricoDetalhe = (grupo: GrupoCalculoRow) => (
    <div className="prototype-grupos-calculo-history-detail">
      <strong>Abrangência</strong>
      <div className="prototype-grupos-calculo-history-scope">
        <div>
          <span>Regime jurídico</span>
          <p>Estatutário</p>
        </div>
        <div>
          <span>Tipo de vínculo</span>
          <p>{grupo.tipoVinculo === "Todos" ? "Todos" : grupo.tipoVinculo}</p>
        </div>
        <div>
          <span>Instituição</span>
          <p>{grupo.orgaoSetor === "Todos" ? "SEDUC" : grupo.orgaoSetor}</p>
        </div>
        <div>
          <span>Órgão</span>
          <p>MTI</p>
        </div>
        <div>
          <span>Herdar de</span>
          <p>{grupo.herdaDe === "-" ? "Nenhum" : grupo.herdaDe}</p>
        </div>
      </div>

      <strong>Gerenciar rubricas ({Math.min(5, grupo.rubricas)})</strong>
      <div className="prototype-grupos-calculo-history-rubricas">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Código</th>
              <th>Nome da rubrica</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {catalogoRubricasMock.slice(0, 5).map((rubrica, index) => {
              const tipo = getGrupoCalculoRubricaTipo(rubrica);
              const badge = getGrupoCalculoRubricaTipoBadge(tipo);

              return (
                <tr key={rubrica.id}>
                  <td>{index + 1}</td>
                  <td>{rubrica.codigo}</td>
                  <td>{rubrica.nomeRubrica}</td>
                  <td>
                    <span
                      className="prototype-grupos-calculo-history-rubrica-badge"
                      style={{
                        color: badge.color,
                        backgroundColor: badge.bg,
                        borderColor: badge.border,
                      }}
                    >
                      {tipo}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGrupoCalculoAction = (row: GrupoCalculoRow) => (
    <div className="prototype-grupos-calculo-actions">
      <button
        type="button"
        className="prototype-grupos-calculo-action prototype-grupos-calculo-action--view"
        aria-label={`Visualizar ${row.grupo}`}
        onClick={() => navigate(`/prototipos/folha/grupos-calculo/${row.id}/editar`)}
      >
        <i className="pi pi-eye" aria-hidden="true" />
      </button>
      {normalizeGrupoCalculoSituacao(row.situacao) === "ATIVO" ? (
        <button
          type="button"
          className="prototype-grupos-calculo-action prototype-grupos-calculo-action--new-version"
          aria-label={`Nova versão ${row.grupo}`}
          title="Nova versão"
          onClick={() =>
            navigate(
              `/prototipos/folha/grupos-calculo/${row.id}/editar?modo=nova-versao`,
            )
          }
        >
          <i className="pi pi-plus" aria-hidden="true" />
        </button>
      ) : null}
      {normalizeGrupoCalculoSituacao(row.situacao) === "RASCUNHO" ? (
        <button
          type="button"
          className="prototype-grupos-calculo-action prototype-grupos-calculo-action--edit"
          aria-label={`Editar ${row.grupo}`}
          title="Editar"
          onClick={() => navigate(`/prototipos/folha/grupos-calculo/${row.id}/editar`)}
        >
          <i className="pi pi-pencil" aria-hidden="true" />
        </button>
      ) : null}
      <button
        type="button"
        className="prototype-grupos-calculo-action prototype-grupos-calculo-action--history"
        aria-label={`Histórico ${row.grupo}`}
        onClick={() => abrirHistoricoGrupoCalculo(row)}
      >
        <i className="pi pi-history" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="prototype-grupos-calculo-action prototype-grupos-calculo-action--delete"
        aria-label={`Excluir ${row.grupo}`}
        disabled={normalizeGrupoCalculoSituacao(row.situacao) !== "RASCUNHO"}
        title={
          normalizeGrupoCalculoSituacao(row.situacao) === "RASCUNHO"
            ? "Excluir"
            : "Exclusão disponível apenas para Aguardando Aprovação"
        }
      >
        <i className="pi pi-trash" aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-folha-grupos-calculo-page">
        <CardSeplag
          title="Gestão de Grupos de Cálculo"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        />

        <CardSeplag cols="12" cardHeaderClassNames="prototype-regime-card">
          <div className="col-12 prototype-category-filters prototype-grupos-calculo-filters">
            <TextFieldSeplag
              name="nomeGrupo"
              control={control}
              label="Nome do Grupo"
              cols="12"
              placeholder="Nome do grupo..."
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="situacao"
              control={control}
              label="Situação"
              cols="12"
              options={[{ label: "Todas", value: "" }, ...grupoCalculoSituacaoOptions]}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-category-clear col-12 md:col-2">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={() =>
                  reset({
                    nomeGrupo: "",
                    situacao: "",
                  })
                }
              />
            </div>
            <div className="prototype-category-clear col-12 md:col-2">
              <BotaoSeplag
                type="button"
                label="Adicionar"
                icon="pi pi-plus"
                onClick={() => navigate("/prototipos/folha/grupos-calculo/novo")}
              />
            </div>
          </div>
        </CardSeplag>

        <CardSeplag cols="12" cardHeaderClassNames="prototype-regime-card">
          <div className="col-12 prototype-folha-grupos-calculo-table">
            <div className="prototype-grupos-calculo-accordion-table prototype-grupos-calculo-flat-table">
              <table>
                <thead>
                  <tr>
                    <th>Nome do grupo</th>
                    <th>Versão</th>
                    <th>Data início</th>
                    <th>Data fim</th>
                    <th>Situação</th>
                    <th>Responsável</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {gruposFiltrados.map((grupo) => (
                    <tr className="prototype-grupos-calculo-group-row" key={grupo.id}>
                      <td>
                        <strong>{grupo.grupo}</strong>
                      </td>
                      <td>{getGrupoCalculoVersao(grupo)}</td>
                      <td>{grupo.inicioVigencia}</td>
                      <td>{grupo.fimVigencia}</td>
                      <td>{renderGrupoCalculoStatusBadge(grupo.situacao)}</td>
                      <td>Admin User</td>
                      <td>{renderGrupoCalculoAction(grupo)}</td>
                    </tr>
                  ))}
                  {!gruposFiltrados.length && (
                    <tr>
                      <td colSpan={7} className="prototype-grupos-calculo-empty">
                        Nenhum grupo encontrado para os filtros informados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardSeplag>

        <ModalSeplag
          visible={Boolean(grupoHistoricoSelecionado)}
          titulo="Histórico de Versões"
          tamanho="900px"
          fechar={fecharHistoricoGrupoCalculo}
          customFooter={
            <div className="prototype-grupos-calculo-history-footer">
              <BotaoSeplag
                type="button"
                label="Fechar"
                onClick={fecharHistoricoGrupoCalculo}
              />
            </div>
          }
        >
          <div className="col-12 prototype-grupos-calculo-history-modal">
            {(grupoHistoricoSelecionado
              ? gruposCalculoVersoesMock[grupoHistoricoSelecionado.id] ?? [
                  grupoHistoricoSelecionado,
                ]
              : []
            ).map((versao, index, versoes) => {
              const key = `${versao.id}-${versao.codigo}`;
              const isAberta = versaoHistoricoAberta === key;

              return (
                <div
                  className={`prototype-grupos-calculo-history-version${
                    isAberta ? " prototype-grupos-calculo-history-version--open" : ""
                  }`}
                  key={key}
                >
                  <button
                    type="button"
                    className="prototype-grupos-calculo-history-version-header"
                    onClick={() => setVersaoHistoricoAberta(isAberta ? null : key)}
                  >
                    <span>{versao.grupo}</span>
                    <span>{`V${versoes.length - index}`}</span>
                    <span>{versao.inicioVigencia}</span>
                    <span>{versao.fimVigencia}</span>
                    {renderGrupoCalculoHistoricoStatus(versao, index)}
                    <span>Admin User</span>
                    <i
                      className={`pi ${isAberta ? "pi-chevron-up" : "pi-chevron-down"}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isAberta ? renderGrupoCalculoHistoricoDetalhe(versao) : null}
                </div>
              );
            })}
          </div>
        </ModalSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaGrupoCalculoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const isNovaVersao = searchParams.get("modo") === "nova-versao";
  const grupo = gruposCalculoMock.find((item) => String(item.id) === id);
  const amanha = getAmanhaDate();
  const dataInicioV2 = formatDatePtBr(amanha);
  const versoesGrupoAtual = grupo ? gruposCalculoVersoesMock[grupo.id] ?? [grupo] : [];
  const grupoEstaPublicado =
    Boolean(grupo) && normalizeGrupoCalculoSituacao(grupo?.situacao) !== "RASCUNHO";
  const modoVersionamento = Boolean(isEdit && grupoEstaPublicado && isNovaVersao);
  const versaoEmEdicao = modoVersionamento
    ? versoesGrupoAtual.length + 1
    : Math.max(versoesGrupoAtual.length, 1);
  const [publicacaoConcluida, setPublicacaoConcluida] = useState(false);
  const [rubricasGerenciadas, setRubricasGerenciadas] = useState<GrupoCalculoRubricaGerenciada[]>(
    () =>
      isEdit
        ? catalogoRubricasMock.slice(0, 12).map((rubrica) => ({
            ...rubrica,
            origem: "filtro",
            paoe: grupoCalculoPaoeOptions[0].value,
          }))
        : [],
  );
  const [rubricaDragIndex, setRubricaDragIndex] = useState<number | null>(null);
  const [modalRubricasAberto, setModalRubricasAberto] = useState(false);
  const [modalPublicacaoAberto, setModalPublicacaoAberto] = useState(false);
  const [rubricaTermoBusca, setRubricaTermoBusca] = useState("");
  const [rubricasSelecionadasParaAdicionar, setRubricasSelecionadasParaAdicionar] =
    useState<number[]>([]);
  const [credenciaisPublicacao, setCredenciaisPublicacao] = useState({
    usuario: "",
    senha: "",
  });
  const [dataInicioPublicacao, setDataInicioPublicacao] = useState(dataInicioV2);
  const [publicacaoFeedback, setPublicacaoFeedback] = useState("");
  const tituloFormularioGrupoCalculo = modoVersionamento
    ? "Criar Nova Versão do Grupo"
    : `${isEdit ? "Alterar" : "Cadastrar"} - Grupos de Cálculo de Folha`;
  const formularioBloqueado = publicacaoConcluida;
  const credenciaisPublicacaoValidas = Boolean(
    credenciaisPublicacao.usuario.trim() &&
      credenciaisPublicacao.senha.trim() &&
      dataInicioPublicacao.trim(),
  );

  const { control, setValue, watch } = useForm<GrupoCalculoForm>({
    defaultValues: {
      nome: grupo?.grupo ?? "",
      descricao: grupo
        ? `Configuração de cálculo para ${grupo.grupo.toLowerCase()}.`
        : "",
      situacao: modoVersionamento || grupoEstaPublicado ? SITUACAO_VIGENCIA.ATIVO : "RASCUNHO",
      dataAtivacao:
        modoVersionamento
          ? dataInicioV2
          : "",
      dataEncerramento:
        normalizeGrupoCalculoSituacao(grupo?.situacao) === "ENCERRADO" ? "30/06/2026" : "",
      motivoEncerramento:
        normalizeGrupoCalculoSituacao(grupo?.situacao) === "ENCERRADO"
          ? "Encerramento programado da configuração vigente."
          : "",
      dataExtincao: "",
      motivoExtincao: "",
      abrangenciaRegimeJuridico: [],
      abrangenciaTipoVinculo: [],
      abrangenciaInstituicao: [],
      abrangenciaHerdarDe: grupo?.herdaDe && grupo.herdaDe !== "-" ? grupo.herdaDe : "nenhum",
      abrangenciaOrgao: [],
      abrangenciaSetores: [],
      abrangenciaCategorias: [],
      abrangenciaSubcategorias: [],
      abrangenciaCargos: [],
    },
  });

  const handleMoverRubricaGerenciada = (fromIndex: number, toIndex: number) => {
    setRubricasGerenciadas((current) => {
      if (
        fromIndex < 0 ||
        fromIndex >= current.length ||
        toIndex < 0 ||
        toIndex >= current.length ||
        fromIndex === toIndex
      ) {
        return current;
      }

      const next = [...current];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, { ...item, reordenada: true });
      return next;
    });
  };

  const handleRemoverRubricaGerenciada = (idRubrica: number) => {
    setRubricasGerenciadas((current) => {
      const rubricaRemovida = current.find((rubrica) => rubrica.id === idRubrica);
      if (!rubricaRemovida) return current;
      if (rubricaRemovida.origem !== "manual") return current;

      return current.filter((rubrica) => rubrica.id !== idRubrica);
    });
  };

  const handleAlterarPaoeRubrica = (idRubrica: number, paoe: string) => {
    setRubricasGerenciadas((current) =>
      current.map((rubrica) => {
        if (rubrica.id !== idRubrica) return rubrica;

        return {
          ...rubrica,
          paoe,
          paoeAlterado:
            rubrica.origem === "filtro" &&
            paoe !== grupoCalculoPaoeOptions[0].value,
        };
      }),
    );
  };

  const handleAbrirModalAdicionarRubricas = () => {
    setRubricasSelecionadasParaAdicionar([]);
    setRubricaTermoBusca("");
    setModalRubricasAberto(true);
  };

  const handleToggleRubricaParaAdicionar = (idRubrica: number) => {
    setRubricasSelecionadasParaAdicionar((current) =>
      current.includes(idRubrica)
        ? current.filter((idSelecionado) => idSelecionado !== idRubrica)
        : [...current, idRubrica],
    );
  };

  const handleConfirmarAdicionarRubricas = () => {
    setRubricasGerenciadas((current) => {
      const idsAtuais = new Set(current.map((rubrica) => rubrica.id));
      const novasRubricas = catalogoRubricasMock
        .filter(
          (rubrica) =>
            rubricasSelecionadasParaAdicionar.includes(rubrica.id) &&
            !idsAtuais.has(rubrica.id),
        )
        .map((rubrica) => ({
          ...rubrica,
          origem: "manual" as const,
          paoe: grupoCalculoPaoeOptions[0].value,
        }));

      const rubricasReativadas = current.map((rubrica) =>
        rubricasSelecionadasParaAdicionar.includes(rubrica.id)
          ? { ...rubrica, excluida: false, origem: "manual" as const }
          : rubrica,
      );

      return [...rubricasReativadas, ...novasRubricas];
    });
    setModalRubricasAberto(false);
    setRubricaTermoBusca("");
    setRubricasSelecionadasParaAdicionar([]);
  };

  const handleLimparAbrangencia = () => {
    setValue("abrangenciaInstituicao", []);
    setValue("abrangenciaOrgao", []);
    setValue("abrangenciaTipoVinculo", []);
    setValue("abrangenciaSetores", []);
    setValue("abrangenciaRegimeJuridico", []);
    setValue("abrangenciaCategorias", []);
    setValue("abrangenciaSubcategorias", []);
    setValue("abrangenciaCargos", []);
    setValue("abrangenciaHerdarDe", "nenhum");
  };

  const handleAbrirModalPublicacao = () => {
    setCredenciaisPublicacao({ usuario: "", senha: "" });
    setDataInicioPublicacao(dataInicioV2);
    setPublicacaoFeedback("");
    setModalPublicacaoAberto(true);
  };

  const handleConfirmarPublicacao = () => {
    if (!credenciaisPublicacaoValidas) {
      setPublicacaoFeedback("Informe Data Início, usuário e senha para aprovar o grupo de cálculo.");
      return;
    }

    setValue("situacao", SITUACAO_VIGENCIA.ATIVO);
    setValue("dataAtivacao", dataInicioPublicacao);
    setPublicacaoConcluida(true);
    setModalPublicacaoAberto(false);
    setPublicacaoFeedback("");
  };

  const abrangenciaHerdarDe = watch("abrangenciaHerdarDe");

  useEffect(() => {
    if (!abrangenciaHerdarDe || abrangenciaHerdarDe === "nenhum") return;

    const codigosRubricasHerdadas =
      grupoCalculoRubricasPorFiltro[`herdar:${abrangenciaHerdarDe}`] ?? [];

    if (!codigosRubricasHerdadas.length) return;

    setRubricasGerenciadas((current) => {
      const idsAtuais = new Set(current.map((rubrica) => rubrica.id));
      const rubricasHerdadas = catalogoRubricasMock
        .filter(
          (rubrica) =>
            codigosRubricasHerdadas.includes(rubrica.codigo) &&
            !idsAtuais.has(rubrica.id),
        )
        .map((rubrica) => ({
          ...rubrica,
          origem: "filtro" as const,
          paoe: grupoCalculoPaoeOptions[0].value,
        }));

      const rubricasReativadas = current.map((rubrica) =>
        codigosRubricasHerdadas.includes(rubrica.codigo)
          ? { ...rubrica, excluida: false }
          : rubrica,
      );

      return [...rubricasReativadas, ...rubricasHerdadas];
    });
  }, [abrangenciaHerdarDe]);

  const rubricaTermoNormalizado = rubricaTermoBusca.trim().toLowerCase();
  const rubricasParaAdicionar = catalogoRubricasMock.filter((rubrica) => {
    if (!rubricaTermoNormalizado) return true;

    return (
      rubrica.codigo.toLowerCase().includes(rubricaTermoNormalizado) ||
      rubrica.nomeRubrica.toLowerCase().includes(rubricaTermoNormalizado) ||
      rubrica.naturezaVerba.toLowerCase().includes(rubricaTermoNormalizado)
    );
  });
  const rubricasAtivasNoGrupo = rubricasGerenciadas.filter(
    (rubrica) => !rubrica.excluida,
  ).length;

  const renderGrupoCalculoContent = () => (
    <div className="grid prototype-category-form-fields prototype-grupo-calculo-form-fields">
          {(modoVersionamento || publicacaoConcluida) && (
            <div className="col-12">
              <div className="prototype-grupo-calculo-version-alert">
                <i className="pi pi-info-circle" aria-hidden="true" />
                <span>
                  {publicacaoConcluida
                    ? modoVersionamento
                      ? `Versão V${versaoEmEdicao} aprovada como ativa. A versão anterior foi marcada como inativa e esta edição foi bloqueada.`
                      : "Versão V1 aprovada como ativa. A edição desta versão foi bloqueada; novas alterações devem ser feitas por versionamento."
                    : `Este grupo já foi aprovado. Você está criando a versão V${versaoEmEdicao}; a Data Início foi sugerida como ${dataInicioV2} e deve ser uma data futura.`}
                </span>
              </div>
            </div>
          )}
          <TextFieldSeplag
            name="nome"
            control={control}
            label="Nome do Grupo"
            cols="12 12 12"
            required
            disabled={formularioBloqueado}
            getFormErrorMessage={() => null}
          />
          {modoVersionamento && (
            <div className="col-12 prototype-grupo-calculo-vigencia">
              <DateFieldSeplag
                name="dataAtivacao"
                control={control}
                label="Data Início"
                cols="12 12 3"
                required
                disabled={formularioBloqueado}
                minDate={amanha}
                getFormErrorMessage={() => null}
              />
            </div>
          )}

          <div className="col-12 prototype-grupo-calculo-rubricas-section">
            <div className="prototype-grupo-calculo-abrangencia">
              <div className="prototype-grupo-calculo-section-heading">
                <div>
                  <strong>Abrangência</strong>
                  <p>Defina o público do grupo e adicione as rubricas manualmente.</p>
                </div>
                <BotaoLimparFiltroSeplag
                  type="button"
                  label="Limpar Filtro"
                  icon="pi pi-refresh"
                  onClick={handleLimparAbrangencia}
                  disabled={formularioBloqueado}
                />
              </div>
              <div className="grid prototype-category-form-fields">
                <MultiSelectFieldSeplag
                  name="abrangenciaInstituicao"
                  control={control}
                  label="Instituição"
                  cols="12 12 6"
                  disabled={formularioBloqueado}
                  options={grupoCalculoInstituicaoOptions}
                  optionLabel="label"
                  optionValue="value"
                  selectedItemsLabel="{0} instituições selecionadas"
                  getFormErrorMessage={() => null}
                />
                <MultiSelectFieldSeplag
                  name="abrangenciaOrgao"
                  control={control}
                  label="Órgão"
                  cols="12 12 6"
                  disabled={formularioBloqueado}
                  options={grupoCalculoOrgaoOptions}
                  optionLabel="label"
                  optionValue="value"
                  selectedItemsLabel="{0} órgãos selecionados"
                  getFormErrorMessage={() => null}
                />
                <MultiSelectFieldSeplag
                  name="abrangenciaTipoVinculo"
                  control={control}
                  label="Tipo de Vínculo"
                  cols="12 12 6"
                  disabled={formularioBloqueado}
                  options={grupoCalculoTipoVinculoOptions}
                  optionLabel="label"
                  optionValue="value"
                  selectedItemsLabel="{0} vínculos selecionados"
                  getFormErrorMessage={() => null}
                />
                <MultiSelectFieldSeplag
                  name="abrangenciaSetores"
                  control={control}
                  label="Setor"
                  cols="12 12 6"
                  disabled={formularioBloqueado}
                  options={grupoCalculoSetorOptions}
                  optionLabel="label"
                  optionValue="value"
                  selectedItemsLabel="{0} setores selecionados"
                  getFormErrorMessage={() => null}
                />
                <MultiSelectFieldSeplag
                  name="abrangenciaRegimeJuridico"
                  control={control}
                  label="Regime Jurídico"
                  cols="12 12 6"
                  disabled={formularioBloqueado}
                  options={grupoCalculoRegimeJuridicoOptions}
                  optionLabel="label"
                  optionValue="value"
                  selectedItemsLabel="{0} regimes selecionados"
                  getFormErrorMessage={() => null}
                />
                <MultiSelectFieldSeplag
                  name="abrangenciaCategorias"
                  control={control}
                  label="Categoria"
                  cols="12 12 6"
                  disabled={formularioBloqueado}
                  options={grupoCalculoCategoriaOptions}
                  optionLabel="label"
                  optionValue="value"
                  selectedItemsLabel="{0} categorias selecionadas"
                  getFormErrorMessage={() => null}
                />
                <MultiSelectFieldSeplag
                  name="abrangenciaSubcategorias"
                  control={control}
                  label="Subcategoria"
                  cols="12 12 6"
                  disabled={formularioBloqueado}
                  options={grupoCalculoSubcategoriaOptions}
                  optionLabel="label"
                  optionValue="value"
                  selectedItemsLabel="{0} subcategorias selecionadas"
                  getFormErrorMessage={() => null}
                />
                <MultiSelectFieldSeplag
                  name="abrangenciaCargos"
                  control={control}
                  label="Cargo"
                  cols="12 12 6"
                  disabled={formularioBloqueado}
                  options={grupoCalculoCargoOptions}
                  optionLabel="label"
                  optionValue="value"
                  selectedItemsLabel="{0} cargos selecionados"
                  getFormErrorMessage={() => null}
                />
              </div>
            </div>

            <div className="prototype-grupo-calculo-rubricas-manager">
              <div className="prototype-grupo-calculo-rubricas-header">
                <div>
                  <strong>Relacionar Rubricas</strong>
                  <span>
                    {rubricasAtivasNoGrupo} rubrica(s) ativa(s) no grupo.
                    Rubricas herdadas não podem ser excluídas; apenas as adicionadas manualmente.
                  </span>
                </div>
              </div>
              <div className="prototype-grupo-calculo-rubricas-controls">
                <DropdownFieldSeplag
                  name="abrangenciaHerdarDe"
                  control={control}
                  label="Herdar De"
                  cols="12"
                  disabled={formularioBloqueado}
                  options={grupoCalculoSuperiorOptions}
                  optionLabel="label"
                  optionValue="value"
                  getFormErrorMessage={() => null}
                />
                <BotaoSeplag
                  type="button"
                  label="Adicionar Rubrica"
                  icon="pi pi-plus"
                  className="prototype-grupo-calculo-add-rubrica-btn"
                  disabled={formularioBloqueado}
                  onClick={handleAbrirModalAdicionarRubricas}
                />
              </div>

              <div className="prototype-grupo-calculo-rubricas-list">
                <div className="prototype-grupo-calculo-rubricas-list-head">
                  <span aria-label="Ordenar" />
                  <span>#</span>
                  <span>Código</span>
                  <span>Nome da Rubrica</span>
                  <span>Tipo</span>
                  <span>PAOE</span>
                  <span>Ações</span>
                </div>

                {rubricasGerenciadas.length > 0 ? (
                  rubricasGerenciadas.map((rubrica, index) => {
                  const tipoRubrica = getGrupoCalculoRubricaTipo(rubrica);
                  const tipoRubricaBadge = getGrupoCalculoRubricaTipoBadge(tipoRubrica);
                  const rubricaExcluida = Boolean(rubrica.excluida);
                  const rubricaHerdada = rubrica.origem === "filtro";
                  const rubricaManual = rubrica.origem === "manual";
                  const tagRubrica = rubricaExcluida
                    ? { label: "Excluída", className: "is-excluded" }
                    : rubricaHerdada && rubrica.paoeAlterado
                      ? { label: "Herdada - Alterada", className: "is-changed" }
                    : rubricaHerdada && rubrica.reordenada
                      ? { label: "Herdada - ordem alterada", className: "is-reordered" }
                      : rubricaHerdada
                        ? { label: "Herdada", className: "is-inherited" }
                        : { label: "Adicionada", className: "is-manual" };
                  const posicaoRubrica = rubricaExcluida
                    ? ""
                    : rubricasGerenciadas
                        .slice(0, index + 1)
                        .filter((item) => !item.excluida).length;

                  return (
                    <div
                      key={rubrica.id}
                      className={`prototype-grupo-calculo-rubrica-row${
                        rubricaExcluida ? " is-excluded" : ""
                      }${rubricaHerdada && !rubricaExcluida ? " is-inherited" : ""
                      }${rubricaManual && !rubricaExcluida ? " is-manual" : ""
                      }`}
                      draggable={!rubricaExcluida && !formularioBloqueado}
                      onDragStart={() => setRubricaDragIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (formularioBloqueado) return;
                        if (rubricaExcluida) return;
                        if (rubricaDragIndex === null) return;
                        handleMoverRubricaGerenciada(rubricaDragIndex, index);
                        setRubricaDragIndex(null);
                      }}
                      onDragEnd={() => setRubricaDragIndex(null)}
                    >
                      <button
                        type="button"
                        className="prototype-grupo-calculo-drag-handle"
                        title="Arraste para reordenar"
                        aria-label={`Reordenar ${rubrica.nomeRubrica}`}
                      >
                        <i className="pi pi-bars" aria-hidden="true" />
                      </button>
                      <span>{posicaoRubrica}</span>
                      <code>{rubrica.codigo}</code>
                      <div className="prototype-grupo-calculo-rubrica-name">
                        <strong>{rubrica.nomeRubrica}</strong>
                        <span
                          className={`prototype-grupo-calculo-origem-tag ${tagRubrica.className}`}
                        >
                          {tagRubrica.label}
                        </span>
                      </div>
                      <span
                        className="prototype-grupo-calculo-tipo-pill"
                        style={{
                          color: tipoRubricaBadge.color,
                          backgroundColor: tipoRubricaBadge.bg,
                          borderColor: tipoRubricaBadge.border,
                        }}
                      >
                        {tipoRubrica}
                      </span>
                      <select
                        className="prototype-grupo-calculo-paoe-select"
                        value={rubrica.paoe ?? grupoCalculoPaoeOptions[0].value}
                        disabled={formularioBloqueado || rubricaExcluida}
                        onChange={(event) =>
                          handleAlterarPaoeRubrica(rubrica.id, event.target.value)
                        }
                        aria-label={`PAOE da rubrica ${rubrica.nomeRubrica}`}
                      >
                        {grupoCalculoPaoeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {rubricaExcluida ? (
                        <button
                          type="button"
                          className="prototype-grupo-calculo-restore-rubrica-btn"
                          title="Restaurar rubrica"
                          aria-label={`Restaurar ${rubrica.nomeRubrica}`}
                          disabled={formularioBloqueado}
                          onClick={() =>
                            setRubricasGerenciadas((current) =>
                              current.map((item) =>
                                item.id === rubrica.id
                                  ? { ...item, excluida: false }
                                  : item,
                              ),
                            )
                          }
                        >
                          <i className="pi pi-undo" aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="prototype-grupo-calculo-remove-rubrica-btn"
                          title={
                            rubricaManual
                              ? "Remover rubrica"
                              : "Rubrica herdada não pode ser excluída"
                          }
                          aria-label={`Remover ${rubrica.nomeRubrica}`}
                          disabled={formularioBloqueado || !rubricaManual}
                          onClick={() => handleRemoverRubricaGerenciada(rubrica.id)}
                        >
                          <i className="pi pi-trash" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  );
                })
                ) : (
                  <div className="prototype-grupo-calculo-rubricas-list-empty">
                    Nenhuma rubrica adicionada.
                  </div>
                )}
              </div>
            </div>
          </div>
    </div>
  );

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="prototype-page-content prototype-page-content--white">
          <CardSeplag
            title={tituloFormularioGrupoCalculo}
            cols="12"
            cardHeaderClassNames="prototype-category-card"
          >
            <div className="col-12 prototype-category-form prototype-grupo-calculo-form">
              {renderGrupoCalculoContent()}

              <div className="prototype-category-form-footer">
                <BotaoVoltarSeplag
                  type="button"
                  onClick={() => navigate("/prototipos/folha/grupos-calculo")}
                />
                {!publicacaoConcluida && (
                  <>
                    {!modoVersionamento && (
                      <BotaoSalvarSeplag
                        type="submit"
                        label="Salvar Rascunho"
                      />
                    )}
                    <BotaoSalvarSeplag
                      type="button"
                      label={modoVersionamento ? `Aprovar V${versaoEmEdicao}` : "Aprovar"}
                      icon="pi pi-send"
                      onClick={handleAbrirModalPublicacao}
                    />
                  </>
                )}
              </div>
            </div>

            <ModalSeplag
              visible={modalPublicacaoAberto}
              titulo={modoVersionamento ? `Aprovar Versão V${versaoEmEdicao}` : "Aprovar Grupo de Cálculo"}
              tamanho="520px"
              labelFechar="Cancelar"
              customFooter={
                <div className="prototype-grupo-calculo-publicacao-footer">
                  <BotaoVoltarSeplag
                    type="button"
                    label="Cancelar"
                    onClick={() => {
                      setModalPublicacaoAberto(false);
                      setPublicacaoFeedback("");
                    }}
                  />
                  <BotaoSalvarSeplag
                    type="button"
                    label="Aprovar"
                    icon="pi pi-send"
                    disabled={!credenciaisPublicacaoValidas}
                    onClick={handleConfirmarPublicacao}
                  />
                </div>
              }
              fechar={() => {
                setModalPublicacaoAberto(false);
                setPublicacaoFeedback("");
              }}
            >
              <div className="col-12 prototype-grupo-calculo-publicacao-modal">
                {publicacaoFeedback ? (
                  <div className="prototype-validation-panel">{publicacaoFeedback}</div>
                ) : null}

                <div className="prototype-grupo-calculo-publicacao-alerta">
                  <i className="pi pi-exclamation-triangle" aria-hidden="true" />
                  <span>
                    {modoVersionamento
                      ? `Ao aprovar a V${versaoEmEdicao}, ela passará a ser a versão ativa e a versão anterior será marcada como inativa. A nova versão ficará bloqueada para edição.`
                      : "Ao aprovar este grupo de cálculo, a versão V1 será criada como ativa e ficará bloqueada para edição. Alterações futuras deverão ser feitas por meio de uma nova versão."}
                  </span>
                </div>

                <label>
                  <span>Data Início</span>
                  <input
                    className="p-inputtext p-component"
                    type="date"
                    value={dataInicioPublicacao.split("/").reverse().join("-")}
                    min={dataInicioV2.split("/").reverse().join("-")}
                    onChange={(event) => {
                      const [ano, mes, dia] = event.target.value.split("-");
                      setDataInicioPublicacao(
                        ano && mes && dia ? `${dia}/${mes}/${ano}` : "",
                      );
                    }}
                  />
                </label>

                <label>
                  <span>Usuário</span>
                  <input
                    className="p-inputtext p-component"
                    type="text"
                    value={credenciaisPublicacao.usuario}
                    onChange={(event) =>
                      setCredenciaisPublicacao((current) => ({
                        ...current,
                        usuario: event.target.value,
                      }))
                    }
                    autoComplete="username"
                  />
                </label>

                <label>
                  <span>Senha</span>
                  <input
                    className="p-inputtext p-component"
                    type="password"
                    value={credenciaisPublicacao.senha}
                    onChange={(event) =>
                      setCredenciaisPublicacao((current) => ({
                        ...current,
                        senha: event.target.value,
                      }))
                    }
                    autoComplete="current-password"
                  />
                </label>
              </div>
            </ModalSeplag>

            <ModalSeplag
              visible={modalRubricasAberto}
              titulo="Adicionar Rubrica"
              tamanho="980px"
              labelFechar="Cancelar"
              labelAcao="Adicionar"
              iconAcao="pi pi-plus"
              funcAcao={handleConfirmarAdicionarRubricas}
              fechar={() => {
                setModalRubricasAberto(false);
                setRubricasSelecionadasParaAdicionar([]);
              }}
            >
              <div className="col-12 prototype-grupo-calculo-modal-rubricas">
                <div className="prototype-grupo-calculo-modal-search">
                  <span className="p-input-icon-left">
                    <i className="pi pi-search" aria-hidden="true" />
                    <input
                      className="p-inputtext p-component"
                      type="search"
                      placeholder="Consultar por código, nome ou tipo da rubrica"
                      value={rubricaTermoBusca}
                      onChange={(event) => setRubricaTermoBusca(event.target.value)}
                    />
                  </span>
                </div>

                {rubricasParaAdicionar.length > 0 ? (
                  rubricasParaAdicionar.map((rubrica) => {
                    const tipoRubrica = getGrupoCalculoRubricaTipo(rubrica);
                    const tipoRubricaBadge =
                      getGrupoCalculoRubricaTipoBadge(tipoRubrica);
                    const rubricaNoGrupo = rubricasGerenciadas.find(
                      (item) => item.id === rubrica.id,
                    );
                    const rubricaAtivaNoGrupo = Boolean(
                      rubricaNoGrupo && !rubricaNoGrupo.excluida,
                    );
                    const checked = rubricasSelecionadasParaAdicionar.includes(
                      rubrica.id,
                    ) || rubricaAtivaNoGrupo;

                    return (
                      <label
                        className={`prototype-grupo-calculo-modal-rubrica-item${
                          rubricaAtivaNoGrupo ? " is-added" : ""
                        }`}
                        key={rubrica.id}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={rubricaAtivaNoGrupo}
                          onChange={() =>
                            handleToggleRubricaParaAdicionar(rubrica.id)
                          }
                        />
                        <span className="prototype-grupo-calculo-modal-rubrica-codigo">
                          {rubrica.codigo}
                        </span>
                        <strong>{rubrica.nomeRubrica}</strong>
                        <span
                          className="prototype-grupo-calculo-tipo-pill"
                          style={{
                            color: tipoRubricaBadge.color,
                            backgroundColor: tipoRubricaBadge.bg,
                            borderColor: tipoRubricaBadge.border,
                          }}
                        >
                          {tipoRubrica}
                        </span>
                        {rubricaAtivaNoGrupo ? (
                          <small>Já adicionada</small>
                        ) : rubricaNoGrupo?.excluida ? (
                          <small>Excluída do grupo</small>
                        ) : null}
                      </label>
                    );
                  })
                ) : (
                  <div className="prototype-grupo-calculo-modal-empty">
                    Nenhuma rubrica encontrada para a consulta informada.
                  </div>
                )}
              </div>
            </ModalSeplag>
          </CardSeplag>
        </div>
      </form>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaCatalogoRubricasPage() {
  const navigate = useNavigate();
  const { control, reset, watch } = useForm<CatalogoRubricaFiltroForm>({
    defaultValues: {
      termo: "",
      status: "",
    },
  });

  // Estados para o modal de inativação
  const [visibleModalInativar, setVisibleModalInativar] = useState(false);
  const [rubricaSelecionada, setRubricaSelecionada] = useState<RubricaRow | null>(null);
  const [catalogoRubricasMockState, setCatalogoRubricasMockState] = useState(catalogoRubricasMock);

  // Formulário para inativação
  const { control: controlInativar, reset: resetInativar, handleSubmit } = useForm<InativarRubricaForm>({
    defaultValues: {
      motivoInativacao: "",
      dataFim: "",
    },
  });

  const termo = (watch("termo") ?? "").toLowerCase().trim();
  const statusFiltro = watch("status");

  const catalogoResults = createResults(
    catalogoRubricasMockState.filter((item) => {
      const matchesStatus = !statusFiltro || item.status === statusFiltro;
      const matchesTermo =
        !termo ||
        item.codigo.toLowerCase().includes(termo) ||
        item.nomeRubrica.toLowerCase().includes(termo);
      return matchesStatus && matchesTermo;
    }),
  );

  const catalogoColumns: ColumnMetaSeplag<RubricaRow>[] = [
    {
      field: "codigo",
      header: "Código",
    },
    {
      field: "nomeRubrica",
      header: "Nome da Rubrica",
    },
    {
      field: "naturezaVerba",
      header: "Natureza da Verba",
    },
    {
      field: "dataAprovacao",
      header: "Data de Aprovação",
    },
    {
      header: "Status",
      body: (row) => {
        const badge = rubricaStatusBadge[row.status];
        return (
          <BadgeSeplag
            label={badge.label}
            color={badge.color}
            bg={badge.bg}
            icon={badge.icon}
          />
        );
      },
    },
  ];

  // Funções para lidar com inativação
  const handleInativar = (rubrica: RubricaRow) => {
    setRubricaSelecionada(rubrica);
    resetInativar({ motivoInativacao: "", dataFim: "" });
    setVisibleModalInativar(true);
  };

  const confirmarInativacao = handleSubmit((formData) => {
    if (rubricaSelecionada) {
      // Atualizar o mock data
      const rubricaAtualizada = catalogoRubricasMockState.map((rubrica) =>
        rubrica.id === rubricaSelecionada.id
          ? { ...rubrica, status: "Inativa" as const }
          : rubrica
      );
      setCatalogoRubricasMockState(rubricaAtualizada);
      
      // Fechar modal e resetar
      setVisibleModalInativar(false);
      resetInativar();
      setRubricaSelecionada(null);
    }
  });

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-folha-catalogo-page">
        <CardSeplag title="Catálogo de Rubricas" cols="12" cardHeaderClassNames="prototype-regime-card">
          <div className="prototype-category-filters prototype-folha-catalogo-filters grid">
            <TextFieldSeplag
              name="termo"
              control={control}
              label="Buscar por código ou nome"
              cols="12 12 6"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="status"
              control={control}
              label="Status"
              cols="12 12 4"
              options={catalogoRubricaStatusOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-2">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={() => reset({ termo: "", status: "" })}
              />
            </div>
          </div>

          <div className="prototype-folha-catalogo-table">
            <TablePaginadoSeplag
              dataKey="id"
              data={catalogoResults}
              rows={10}
              rowsPerPage={[10, 20, 50]}
              paginator
              lazy={false}
              selectionMode={null}
              columns={catalogoColumns}
              hasEventoAcao
              handleView={(row) => navigate(`/prototipos/folha/catalogo-rubricas/${row.id}`)}
              handleOnPageChange={() => {}}
            />
          </div>
        </CardSeplag>

        {/* Modal de Inativação */}
        <ModalSeplag
          visible={visibleModalInativar}
          titulo={`Inativar Rubrica - ${rubricaSelecionada?.codigo} (${rubricaSelecionada?.nomeRubrica})`}
          fechar={() => {
            setVisibleModalInativar(false);
            setRubricaSelecionada(null);
          }}
          labelAcao="Inativar"
          funcAcao={confirmarInativacao}
          tamanho="500px"
        >
          <div className="grid" style={{ paddingTop: "20px" }}>
            <TextAreaFieldSeplag
              name="motivoInativacao"
              control={controlInativar}
              label="Motivo da Inativação"
              cols="12"
              required={true}
              rows={4}
              placeholder="Informe o motivo da inativação desta rubrica"
              getFormErrorMessage={(error) => error?.message}
            />
            <DateFieldSeplag
              name="dataFim"
              control={controlInativar}
              label="Data de Fim"
              cols="12"
              required={true}
              placeholder="dd/mm/aaaa"
              dateFormat="dd/mm/yy"
              mask="99/99/9999"
              getFormErrorMessage={(error) => error?.message}
            />
          </div>
        </ModalSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaCatalogoRubricaViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const rubrica = catalogoRubricasMock.find((item) => String(item.id) === id);

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-folha-catalogo-view-page">
        <CardSeplag title="Detalhes da Rubrica" cols="12" cardHeaderClassNames="prototype-regime-card">
          <div className="prototype-catalogo-view-actions">
            <BotaoVoltarSeplag onClick={() => navigate(-1)}>
              Voltar
            </BotaoVoltarSeplag>
          </div>
          {rubrica ? (
            <div className="prototype-catalogo-view-content">
              <p><strong>Código:</strong> {rubrica.codigo}</p>
              <p><strong>Nome da Rubrica:</strong> {rubrica.nomeRubrica}</p>
              <p><strong>Natureza da Verba:</strong> {rubrica.naturezaVerba}</p>
              <p><strong>Data de Aprovação:</strong> {rubrica.dataAprovacao}</p>
              <p><strong>Status:</strong> <BadgeSeplag {...rubricaStatusBadge[rubrica.status]} label={rubrica.status} /></p>
            </div>
          ) : (
            <div className="prototype-empty-content">Rubrica não encontrada.</div>
          )}
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaConformidadePage() {
  const defaultFilters: FolhaConformidadeFiltroForm =
    folhaConformidadeDefaultFilters;
  const { control, handleSubmit, reset } = useForm<FolhaConformidadeFiltroForm>({
    defaultValues: defaultFilters,
  });
  const {
    control: salvarFiltroControl,
    handleSubmit: handleSubmitSalvarFiltro,
    reset: resetSalvarFiltro,
  } = useForm<FolhaConformidadeSalvarFiltroForm>({
    defaultValues: {
      nomeFiltro: "",
      visibilidade: "PRIVADO",
    },
  });
  const {
    control: gerenciadorFiltroControl,
    reset: resetGerenciadorFiltro,
    watch: watchGerenciadorFiltro,
  } = useForm<FolhaConformidadeGerenciadorFiltroForm>({
    defaultValues: {
      nome: "",
      criadoPor: "",
    },
  });
  const [filtrosGerados, setFiltrosGerados] =
    useState<FolhaConformidadeFiltroForm>(defaultFilters);
  const [modalFiltrosAberto, setModalFiltrosAberto] = useState(false);
  const [modalFiltrosModo, setModalFiltrosModo] = useState<
    "aplicar" | "carregar" | "salvar"
  >("carregar");
  const [filtrosSalvos, setFiltrosSalvos] = useState<
    FolhaConformidadeFiltroSalvoRow[]
  >(folhaConformidadeFiltrosSalvosMock);
  const [filtroEmEdicaoId, setFiltroEmEdicaoId] = useState<number | null>(null);
  const [filtroParaExcluir, setFiltroParaExcluir] =
    useState<FolhaConformidadeFiltroSalvoRow | null>(null);
  const [feedbackFiltro, setFeedbackFiltro] = useState("");
  const [paginaGerenciadorFiltro, setPaginaGerenciadorFiltro] = useState(1);
  const [linhasGerenciadorFiltro, setLinhasGerenciadorFiltro] = useState(10);
  const [auditoriaFiltros, setAuditoriaFiltros] = useState<string[]>([]);
  const [colunasSelecionadas, setColunasSelecionadas] = useState<string[]>(
    folhaConformidadeTodasColunas,
  );
  const [relatorioAccordions, setRelatorioAccordions] = useState({
    filtros: true,
    funcionais: false,
    folha: false,
    rubrica: false,
    financeiros: false,
    frequencia: false,
    previdenciarios: false,
    outros: false,
  });
  const getEmptyFieldError = () => null;

  const getFiltroFieldClassName = () => "prototype-dynamic-report-field";

  const toggleRelatorioAccordion = (key: keyof typeof relatorioAccordions) => {
    setRelatorioAccordions((state) => ({ ...state, [key]: !state[key] }));
  };

  const renderRelatorioAccordionHeader = (
    key: keyof typeof relatorioAccordions,
    label: string,
  ) => (
    <button
      type="button"
      className="prototype-dynamic-report-accordion-header"
      onClick={() => toggleRelatorioAccordion(key)}
    >
      <span>{label}</span>
      <i
        className={`pi ${
          relatorioAccordions[key] ? "pi-chevron-up" : "pi-chevron-down"
        }`}
        aria-hidden="true"
      />
    </button>
  );

  const getRegistrosFiltrados = (filtros: FolhaConformidadeFiltroForm) => {
    return folhaConformidadeRows.filter((row) => {
      const atendeFolha =
        !filtros.numeroFolha.length || filtros.numeroFolha.includes(row.folha);
      const atendeOrgao =
        !filtros.orgaos.length || filtros.orgaos.includes(row.orgao);
      const atendeMatricula =
        !filtros.matricula.length ||
        filtros.matricula.includes(`${row.matricula}/${row.vinculo}`);
      const atendeRubrica =
        !filtros.codigoRubrica.length ||
        filtros.codigoRubrica.some((codigo) =>
          row.rubrica.includes(codigo.split(" - ")[0]),
        );

      return atendeFolha && atendeOrgao && atendeMatricula && atendeRubrica;
    });
  };

  const formatarValorFiltroExcel = (value?: string | string[] | number) => {
    if (Array.isArray(value)) return value.length ? value.join(", ") : "";
    if (typeof value === "number") return String(value);
    return value?.trim() ?? "";
  };

  const escapeExcelCell = (value?: string | number) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const imageUrlToDataUri = async (src: string) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();

      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    } catch {
      return src;
    }
  };

  const montarFiltrosExcel = (filtros: FolhaConformidadeFiltroForm) => {
    const filtrosMapeados: Array<[string, string | string[] | number | undefined]> = [
      ["Órgão", filtros.orgaos],
      ["Setor", filtros.setores],
      ["Tipo de vínculo", filtros.tiposVinculo],
      ["Regime Jurídico", filtros.regimesJuridicos],
      ["Categoria", filtros.categorias],
      ["Cargo", filtros.cargos],
      ["Matrícula", filtros.matricula],
      ["CPF", filtros.cpf],
      ["Sexo", filtros.sexo],
      ["Idade", filtros.idade],
      ["Competência", filtros.competencia],
      ["Competência Anterior", filtros.competenciaAnterior],
      ["Número da Folha", filtros.numeroFolha],
      ["Número da Execução do processamento", filtros.numeroExecucaoProcessamento],
      ["Data do processamento", filtros.dataProcessamento],
      [
        "Exibir último processamento",
        filtros.exibirUltimoProcessamento === "S" ? "Sim" : "",
      ],
      ["Código da Rubrica", filtros.codigoRubrica],
      ["Tipo da Rubrica", filtros.tipoRubrica],
      ["Data da Aposentadoria", filtros.dataAposentadoriaInicio],
      ["Até aposentadoria", filtros.dataAposentadoriaFim],
      ["Jornada", filtros.jornada],
      ["Data de Exercício", filtros.dataExercicioInicio],
      ["Até exercício", filtros.dataExercicioFim],
    ];

    return filtrosMapeados
      .map(([label, value]) => [label, formatarValorFiltroExcel(value)] as const)
      .filter(([, value]) => value);
  };

  const baixarRelatorioExcel = async (
    filtros: FolhaConformidadeFiltroForm,
    registros: FolhaConformidadeRow[],
  ) => {
    const filtrosAplicados = montarFiltrosExcel(filtros);
    const logoExcelSrc = await imageUrlToDataUri(logoSeplagMtExcel);
    const dataEmissao = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Cuiaba",
    }).format(new Date());
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Relatório Dinâmico");
    const totalColumns = 38;
    const border = {
      top: { style: "thin" as const, color: { argb: "FF9CA3AF" } },
      left: { style: "thin" as const, color: { argb: "FF9CA3AF" } },
      bottom: { style: "thin" as const, color: { argb: "FF9CA3AF" } },
      right: { style: "thin" as const, color: { argb: "FF9CA3AF" } },
    };
    const headers = [
      "Matrícula",
      "CPF",
      "Nome",
      "Nº de Dependentes",
      "Idade",
      "Sexo",
      "Órgão",
      "Setor",
      "Tipo de vínculo",
      "Categoria",
      "Subcategoria",
      "Cargo",
      "Data de Exercício",
      "Até exercício",
      "Jornada",
      "Data da Aposentadoria",
      "Até aposentadoria",
      "Número da Folha",
      "Data do processamento",
      "Número da Execução do processamento",
      "Competência",
      "Código da Rubrica",
      "Tipo da Rubrica",
      "Vantagens",
      "Descontos",
      "Líquido",
      "Competência Anterior",
      "Valor Vantagens Mês Anterior",
      "Valor Descontos Mês Anterior",
      "Valor Líquido Mês Anterior",
      "Vínculo",
      "Regime Jurídico",
      "Exibir último processamento",
      "Descrição da Rubrica",
      "Valor Base INSS",
      "INSS Pago",
      "INSS Simulado",
    ];

    worksheet.views = [{ state: "frozen", ySplit: 0 }];
    worksheet.getRow(1).height = 28;
    worksheet.getRow(2).height = 22;
    worksheet.getRow(3).height = 24;

    worksheet.mergeCells(1, 1, 3, 4);
    for (let row = 1; row <= 3; row += 1) {
      for (let col = 1; col <= 4; col += 1) {
        const cell = worksheet.getCell(row, col);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
        cell.border = border;
      }
    }

    worksheet.mergeCells(1, 6, 1, totalColumns);
    worksheet.getCell(1, 6).value = "Relatório Dinâmico da Folha";
    worksheet.getCell(1, 6).font = { bold: true, size: 16, color: { argb: "FF0F2742" } };
    worksheet.getCell(1, 6).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDBEAFE" },
    };
    worksheet.getCell(1, 6).alignment = { vertical: "middle", horizontal: "left" };
    worksheet.getCell(1, 6).border = border;

    worksheet.mergeCells(2, 6, 2, totalColumns);
    worksheet.getCell(2, 6).value = "Módulo Folha • Exportação dinâmica";
    worksheet.getCell(2, 6).font = { italic: true, color: { argb: "FF475569" } };
    worksheet.getCell(2, 6).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF8FAFC" },
    };
    worksheet.getCell(2, 6).alignment = { vertical: "middle", horizontal: "left" };
    worksheet.getCell(2, 6).border = border;

    worksheet.mergeCells(3, 6, 3, 20);
    worksheet.getCell(3, 6).value = `Data/Hora da emissão: ${dataEmissao}`;
    worksheet.getCell(3, 6).font = { bold: true, color: { argb: "FF334155" } };
    worksheet.getCell(3, 6).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF8FAFC" },
    };
    worksheet.getCell(3, 6).alignment = { vertical: "middle", horizontal: "left" };
    worksheet.getCell(3, 6).border = border;

    worksheet.mergeCells(3, 21, 3, totalColumns);
    worksheet.getCell(3, 21).value = `Solicitante: ${USUARIO_FOLHA_LOGADO}`;
    worksheet.getCell(3, 21).font = { bold: true, color: { argb: "FF334155" } };
    worksheet.getCell(3, 21).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF8FAFC" },
    };
    worksheet.getCell(3, 21).alignment = { vertical: "middle", horizontal: "left" };
    worksheet.getCell(3, 21).border = border;

    const logoImageId = workbook.addImage({
      base64: logoExcelSrc,
      extension: "png",
    });
    worksheet.addImage(logoImageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 210, height: 60 },
    });

    worksheet.mergeCells(5, 1, 5, totalColumns);
    worksheet.getCell(5, 1).value = "Filtros aplicados";
    worksheet.getCell(5, 1).font = { bold: true, color: { argb: "FF111827" } };
    worksheet.getCell(5, 1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E7EB" },
    };
    worksheet.getCell(5, 1).alignment = { vertical: "middle", horizontal: "left" };
    worksheet.getCell(5, 1).border = border;

    let currentRow = 6;
    if (filtrosAplicados.length) {
      filtrosAplicados.forEach(([label, value]) => {
        worksheet.mergeCells(currentRow, 1, currentRow, 6);
        worksheet.getCell(currentRow, 1).value = label;
        worksheet.getCell(currentRow, 1).font = { bold: true, color: { argb: "FF334155" } };
        worksheet.getCell(currentRow, 1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
        worksheet.getCell(currentRow, 1).border = border;
        worksheet.mergeCells(currentRow, 7, currentRow, totalColumns);
        worksheet.getCell(currentRow, 7).value = value;
        worksheet.getCell(currentRow, 7).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        worksheet.getCell(currentRow, 7).border = border;
        currentRow += 1;
      });
    } else {
      worksheet.mergeCells(currentRow, 1, currentRow, totalColumns);
      worksheet.getCell(currentRow, 1).value = "Nenhum filtro preenchido.";
      worksheet.getCell(currentRow, 1).border = border;
      currentRow += 1;
    }

    currentRow += 1;
    worksheet.mergeCells(currentRow, 1, currentRow, totalColumns);
    worksheet.getCell(currentRow, 1).value = "Dados do relatório";
    worksheet.getCell(currentRow, 1).font = { bold: true, color: { argb: "FF111827" } };
    worksheet.getCell(currentRow, 1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E7EB" },
    };
    worksheet.getCell(currentRow, 1).alignment = { vertical: "middle", horizontal: "left" };
    worksheet.getCell(currentRow, 1).border = border;
    currentRow += 1;

    const headerRow = worksheet.getRow(currentRow);
    headerRow.values = headers;
    headerRow.height = 34;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF005494" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = border;
    });
    currentRow += 1;

    const dataRows = registros.length
      ? registros.map((row, index) => {
          const [codigoRubrica, ...descricaoRubrica] = row.rubrica.split(" - ");
          const competenciaAtual = filtros.competencia || "05/2026";
          const competenciaAnterior = filtros.competenciaAnterior || "04/2026";

          return [
            row.matricula,
            filtros.cpf[0] || `000.000.00${index + 1}-00`,
            row.servidor,
            row.numeroDependentes ?? ((index + 1) % 4),
            filtros.idade || String(34 + index * 7),
            filtros.sexo[0] || (index % 2 ? "Masculino" : "Feminino"),
            row.orgao,
            filtros.setores[0] || "Setor Central",
            filtros.tiposVinculo[0] || "Efetivo",
            filtros.categorias[0] || "Área Meio",
            row.subcategoria,
            filtros.cargos[0] || "Analista",
            filtros.dataExercicioInicio || row.dataInicioExercicio,
            filtros.dataExercicioFim || row.dataFimExercicio || "-",
            filtros.jornada[0] || "40h",
            filtros.dataAposentadoriaInicio || row.dataAposentadoria || "-",
            filtros.dataAposentadoriaFim || "-",
            row.folha,
            filtros.dataProcessamento || dataEmissao.split(" ")[0],
            filtros.numeroExecucaoProcessamento[0] || `EXEC-${index + 1}`,
            competenciaAtual,
            filtros.codigoRubrica[0] || codigoRubrica,
            filtros.tipoRubrica[0] || (row.descontos !== "R$ 0,00" ? "Desconto" : "Vantagem"),
            row.vantagens,
            row.descontos,
            row.liquido,
            competenciaAnterior,
            row.valorVanMesAnterior,
            row.valorDesMesAnterior,
            row.valorLiqMesAnterior,
            row.vinculo,
            filtros.regimesJuridicos[0] || "Estatutário",
            filtros.exibirUltimoProcessamento === "S" ? "Sim" : "Não",
            descricaoRubrica.join(" - ") || row.rubrica,
            row.valorBaseInss,
            row.inssPago,
            row.inssSimulado,
          ];
        })
      : [["Nenhum registro encontrado para os filtros informados."]];

    dataRows.forEach((rowValues) => {
      const row = worksheet.addRow(rowValues);
      if (rowValues.length === 1) {
        worksheet.mergeCells(row.number, 1, row.number, totalColumns);
      }
      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        cell.border = border;
      });
    });

    worksheet.views = [{ state: "frozen", ySplit: currentRow }];
    worksheet.columns = headers.map((header) => ({
      width: Math.max(16, Math.min(28, header.length + 4)),
    }));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-dinamico-folha-${Date.now()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGerarRelatorio = async (data: FolhaConformidadeFiltroForm) => {
    setFiltrosGerados(data);
    const registros = getRegistrosFiltrados(data);
    await baixarRelatorioExcel(data, registros);
    setFeedbackFiltro("Relatório Excel gerado com sucesso!");
  };

  const registrarAuditoriaFiltro = (evento: string, filtro: string) => {
    setAuditoriaFiltros((logs) => [
      `${formatarDataPtBr(new Date())} - ${evento}: ${filtro}`,
      ...logs,
    ]);
  };

  const podeVisualizarFiltroSalvo = (filtro: FolhaConformidadeFiltroSalvoRow) =>
    filtro.visibilidade === "PÚBLICO" ||
    filtro.criadoPor === USUARIO_FOLHA_LOGADO;

  const podeEditarFiltroSalvo = (filtro: FolhaConformidadeFiltroSalvoRow) =>
    filtro.visibilidade === "PÚBLICO" ||
    filtro.criadoPor === USUARIO_FOLHA_LOGADO;

  const podeExcluirFiltroSalvo = (filtro: FolhaConformidadeFiltroSalvoRow) =>
    filtro.criadoPor === USUARIO_FOLHA_LOGADO;

  const abrirModalCarregarFiltro = () => {
    setModalFiltrosModo("carregar");
    setPaginaGerenciadorFiltro(1);
    setModalFiltrosAberto(true);
  };

  const abrirModalAplicarFiltro = () => {
    setModalFiltrosModo("aplicar");
    setPaginaGerenciadorFiltro(1);
    setModalFiltrosAberto(true);
  };

  const abrirModalSalvarFiltro = () => {
    setModalFiltrosModo("salvar");
    const filtroEmEdicao = filtrosSalvos.find(
      (filtro) => filtro.id === filtroEmEdicaoId,
    );
    resetSalvarFiltro({
      nomeFiltro: filtroEmEdicao?.nome ?? "",
      visibilidade: filtroEmEdicao?.visibilidade ?? "PRIVADO",
    });
    setPaginaGerenciadorFiltro(1);
    setModalFiltrosAberto(true);
  };

  const handleSalvarFiltro = (data: FolhaConformidadeSalvarFiltroForm) => {
    const nomeFiltro = data.nomeFiltro.trim() || "Filtro sem nome";
    const dataAtual = formatarDataPtBr(new Date());

    if (filtroEmEdicaoId) {
      setFiltrosSalvos((filtros) =>
        filtros.map((filtro) =>
          filtro.id === filtroEmEdicaoId
            ? {
                ...filtro,
                nome: nomeFiltro,
                visibilidade: data.visibilidade,
                atualizadoEm: dataAtual,
                filtros: filtrosGerados,
                colunas: colunasSelecionadas,
              }
            : filtro,
        ),
      );
      registrarAuditoriaFiltro("Alteração de filtro", nomeFiltro);
      setFeedbackFiltro("Registro atualizado com sucesso!");
    } else {
      setFiltrosSalvos((filtros) => [
        {
          id: Date.now(),
          nome: nomeFiltro,
          visibilidade: data.visibilidade,
          criadoEm: dataAtual,
          atualizadoEm: dataAtual,
          criadoPor: USUARIO_FOLHA_LOGADO,
          filtros: filtrosGerados,
          colunas: colunasSelecionadas,
        },
        ...filtros,
      ]);
      registrarAuditoriaFiltro("Inclusão de filtro", nomeFiltro);
      setFeedbackFiltro("Registro salvo com sucesso!");
    }
    setModalFiltrosAberto(false);
  };

  const handleEditarFiltro = (filtro: FolhaConformidadeFiltroSalvoRow) => {
    if (!podeEditarFiltroSalvo(filtro)) return;
    reset(filtro.filtros);
    setFiltrosGerados(filtro.filtros);
    setColunasSelecionadas(filtro.colunas);
    setFiltroEmEdicaoId(filtro.id);
    setModalFiltrosAberto(false);
  };

  const handleAplicarFiltroSalvo = (filtro: FolhaConformidadeFiltroSalvoRow) => {
    reset(filtro.filtros);
    setFiltrosGerados(filtro.filtros);
    setColunasSelecionadas(filtro.colunas);
    setModalFiltrosAberto(false);
  };

  const handleLimparGerenciadorFiltro = () => {
    resetGerenciadorFiltro({ nome: "", criadoPor: "" });
    setPaginaGerenciadorFiltro(1);
  };

  const confirmarExcluirFiltro = () => {
    if (!filtroParaExcluir) return;
    setFiltrosSalvos((filtros) =>
      filtros.filter((filtro) => filtro.id !== filtroParaExcluir.id),
    );
    registrarAuditoriaFiltro("Exclusão de filtro", filtroParaExcluir.nome);
    setFeedbackFiltro("Registro deletado com sucesso!");
    setFiltroParaExcluir(null);
  };

  const handleLimpar = () => {
    reset({ ...defaultFilters, orgaos: [] });
    setFiltrosGerados({ ...defaultFilters, orgaos: [] });
    setColunasSelecionadas(folhaConformidadeTodasColunas);
    setFiltroEmEdicaoId(null);
  };

  const filtrosGerenciador = watchGerenciadorFiltro();

  const filtrosSalvosElegiveis = useMemo(() => {
    const nome = filtrosGerenciador.nome.trim().toLowerCase();
    const criadoPor = filtrosGerenciador.criadoPor.trim().toLowerCase();

    return filtrosSalvos
      .filter(podeVisualizarFiltroSalvo)
      .filter((filtro) => {
        const atendeNome =
          !nome || filtro.nome.toLowerCase().includes(nome);
        const atendeCriador =
          !criadoPor || filtro.criadoPor.toLowerCase().includes(criadoPor);
        return atendeNome && atendeCriador;
      })
      .sort((a, b) => b.id - a.id);
  }, [filtrosGerenciador.nome, filtrosGerenciador.criadoPor, filtrosSalvos]);

  const totalPaginasGerenciadorFiltro = Math.max(
    1,
    Math.ceil(filtrosSalvosElegiveis.length / linhasGerenciadorFiltro),
  );
  const paginaGerenciadorFiltroAtual = Math.min(
    paginaGerenciadorFiltro,
    totalPaginasGerenciadorFiltro,
  );
  const filtrosSalvosPaginados = filtrosSalvosElegiveis.slice(
    (paginaGerenciadorFiltroAtual - 1) * linhasGerenciadorFiltro,
    paginaGerenciadorFiltroAtual * linhasGerenciadorFiltro,
  );

  const registrosFiltrados = useMemo(
    () => getRegistrosFiltrados(filtrosGerados),
    [filtrosGerados],
  );

  const resumo = {
    matriculas: registrosFiltrados.length,
    vantagens: "R$ 482.118,21",
    descontos: "R$ 522.219,17",
    inconsistencias: registrosFiltrados.filter(
      (row) => row.situacaoAnalise === "Inconsistente",
    ).length,
    alnPendente: registrosFiltrados.filter((row) => row.alerta.includes("ALN"))
      .length,
    manuais: registrosFiltrados.filter((row) =>
      row.alerta.includes("Lançamento manual"),
    ).length,
  };

  const normalizeStatusClass = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const renderSituacaoAnalise = (
    situacao: FolhaConformidadeRow["situacaoAnalise"],
  ) => (
    <span
      className={`prototype-conformidade-status prototype-conformidade-status--${normalizeStatusClass(
        situacao,
      )}`}
    >
      {situacao}
    </span>
  );

  const renderMatriculaVinculo = (row: FolhaConformidadeRow) => (
    <div className="prototype-conformidade-cell prototype-conformidade-cell--compact">
      <strong>{row.matricula}</strong>
      <span>Vínculo {row.vinculo}</span>
    </div>
  );

  const renderRubrica = (row: FolhaConformidadeRow) => {
    const [codigo, ...descricao] = row.rubrica.split(" - ");

    return (
      <div className="prototype-conformidade-cell prototype-conformidade-cell--rubrica">
        <strong>{codigo}</strong>
        <span>{descricao.join(" - ") || row.rubrica}</span>
      </div>
    );
  };

  const renderMoneyCell = (value: string) => (
    <span className="prototype-conformidade-money">{value}</span>
  );

  const columns: ColumnMetaSeplag<FolhaConformidadeRow>[] = [
    { header: "Matrícula", body: renderMatriculaVinculo },
    { header: "Servidor", field: "servidor" },
    { header: "Órgão", field: "orgao" },
    { header: "Folha", field: "folha" },
    { header: "Rubrica", body: renderRubrica },
    { header: "Vantagens", body: (row) => renderMoneyCell(row.vantagens) },
    { header: "Descontos", body: (row) => renderMoneyCell(row.descontos) },
    { header: "Líquido", body: (row) => renderMoneyCell(row.liquido) },
    { header: "Alerta", field: "alerta" },
    {
      header: "Análise",
      body: (row) => renderSituacaoAnalise(row.situacaoAnalise),
    },
  ];

  const historicoColumns: ColumnMetaSeplag<FolhaConformidadeHistoricoRow>[] = [
    { header: "Data/Hora da emissão", field: "dataHoraEmissao" },
    { header: "Número da Folha", field: "numeroFolha" },
    { header: "Nome da Folha", field: "nomeFolha" },
    { header: "Competência", field: "competencia" },
    { header: "Solicitante", field: "solicitante" },
    { header: "Situação", field: "situacao" },
    {
      header: "Download",
      body: (row) => (
        <BotaoIconSeplag
          type="button"
          icon="pi pi-download"
          tooltip={`Baixar relatório ${row.tipoRelatorio}`}
          disabled={row.situacao !== "Emitido"}
          onClick={() => {}}
        />
      ),
    },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-folha-pagamento-page prototype-folha-conformidade-page">
        <CardSeplag
          title="Relatório Dinâmico da Folha"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          {feedbackFiltro ? (
            <div className="col-12">
              <div className="prototype-validation-panel">{feedbackFiltro}</div>
            </div>
          ) : null}
          <form
            className="prototype-dynamic-report"
            onSubmit={handleSubmit(handleGerarRelatorio)}
          >
            <div className="prototype-dynamic-report-main-grid">
            <section className="prototype-dynamic-report-section">
              {renderRelatorioAccordionHeader("filtros", "Filtros")}
              {relatorioAccordions.filtros ? (
                <div className="prototype-dynamic-report-nested-accordions">
                  <section className="prototype-dynamic-report-section">
                    {renderRelatorioAccordionHeader("funcionais", "Filtros funcionais")}
                    {relatorioAccordions.funcionais ? (
                    <div className="prototype-dynamic-report-grid">
                <div className={getFiltroFieldClassName("Órgão")}>
                  <MultiSelectFieldSeplag
                    label="Órgão"
                    name="orgaos"
                    control={control}
                    cols="12"
                    options={folhaPagamentoOrgaoOptions.filter((option) => option.value)}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={getEmptyFieldError}
                  />
                </div>
                <div className={getFiltroFieldClassName("Setor")}>
                  <MultiSelectFieldSeplag
                    label="Setor"
                    name="setores"
                    control={control}
                    cols="12"
                    options={folhaConformidadeSetorOptions.filter((option) => option.value)}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={getEmptyFieldError}
                  />
                </div>
                <div className={getFiltroFieldClassName("Tipo de vínculo")}>
                  <MultiSelectFieldSeplag
                    label="Tipo de vínculo"
                    name="tiposVinculo"
                    control={control}
                    cols="12"
                    options={folhaConformidadeTipoVinculoOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={getEmptyFieldError}
                  />
                </div>
                <div className={getFiltroFieldClassName("Regime jurídico")}>
                  <MultiSelectFieldSeplag
                    label="Regime jurídico"
                    name="regimesJuridicos"
                    control={control}
                    cols="12"
                    options={folhaPagamentoRegimeOptions.filter((option) => option.value)}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={getEmptyFieldError}
                  />
                </div>
                <div className={getFiltroFieldClassName("Categoria")}>
                  <MultiSelectFieldSeplag
                    label="Categoria"
                    name="categorias"
                    control={control}
                    cols="12"
                    options={folhaPagamentoCategoriaOptions.filter((option) => option.value)}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={getEmptyFieldError}
                  />
                </div>
                <div className={getFiltroFieldClassName("Cargo")}>
                  <MultiSelectFieldSeplag
                    label="Cargo"
                    name="cargos"
                    control={control}
                    cols="12"
                    options={folhaPagamentoCargoOptions.filter((option) => option.value)}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={getEmptyFieldError}
                  />
                </div>
                <div className={getFiltroFieldClassName("Matrícula")}>
                  <MultiSelectFieldSeplag
                    label="Matrícula"
                    name="matricula"
                    control={control}
                    cols="12"
                    options={folhaConformidadeMatriculaOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={getEmptyFieldError}
                  />
                </div>
                <div className={getFiltroFieldClassName("CPF")}>
                  <MultiSelectFieldSeplag
                    label="CPF"
                    name="cpf"
                    control={control}
                    cols="12"
                    options={folhaConformidadeCpfOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={getEmptyFieldError}
                  />
                </div>
                <div className={getFiltroFieldClassName("Sexo")}>
                  <MultiSelectFieldSeplag
                    label="Sexo"
                    name="sexo"
                    control={control}
                    cols="12"
                    options={folhaConformidadeSexoOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={getEmptyFieldError}
                  />
                </div>
                <div className={getFiltroFieldClassName("Idade")}>
                  <NumberFieldSeplag
                    label="Idade"
                    name="idade"
                    control={control}
                    cols="12"
                    min={0}
                    max={99}
                    getFormErrorMessage={getEmptyFieldError}
                  />
                </div>
                    </div>
                    ) : null}
                  </section>

                  <section className="prototype-dynamic-report-section">
                    {renderRelatorioAccordionHeader("folha", "Filtros de Folha")}
                    {relatorioAccordions.folha ? (
                      <div className="prototype-dynamic-report-grid prototype-dynamic-report-grid--folha">
                  <div className={getFiltroFieldClassName("Competência")}>
                    <TextFieldSeplag
                      label="Competência"
                      name="competencia"
                      control={control}
                      cols="12"
                      placeholder="MM/AAAA"
                    />
                  </div>
                  <div className={getFiltroFieldClassName("Competência Anterior")}>
                    <TextFieldSeplag
                      label="Competência Anterior"
                      name="competenciaAnterior"
                      control={control}
                      cols="12"
                      placeholder="MM/AAAA"
                    />
                  </div>
                  <div className={getFiltroFieldClassName("Número da Folha")}>
                    <MultiSelectFieldSeplag
                      label="Número da Folha"
                      name="numeroFolha"
                      control={control}
                      cols="12"
                      options={folhaConformidadeNumeroFolhaOptions}
                      optionLabel="label"
                      optionValue="value"
                      getFormErrorMessage={getEmptyFieldError}
                    />
                  </div>
                  <div className={getFiltroFieldClassName("Número da execução do processamento")}>
                    <MultiSelectFieldSeplag
                      label="Número da execução do processamento"
                      name="numeroExecucaoProcessamento"
                      control={control}
                      cols="12"
                      options={folhaConformidadeExecucaoOptions}
                      optionLabel="label"
                      optionValue="value"
                      getFormErrorMessage={getEmptyFieldError}
                    />
                  </div>
                  <div className={getFiltroFieldClassName("Data do processamento")}>
                    <DateFieldSeplag
                      label="Data do processamento"
                      name="dataProcessamento"
                      control={control}
                      cols="12"
                      getFormErrorMessage={getEmptyFieldError}
                    />
                    <div className="prototype-dynamic-report-inline-checkbox">
                      <CheckboxFieldSeplag<FolhaConformidadeFiltroForm>
                        name="exibirUltimoProcessamento"
                        control={control}
                        cols="12"
                        checkboxLabel="Exibir último processamento"
                      />
                    </div>
                  </div>
                      </div>
                    ) : null}
                  </section>

                  <section className="prototype-dynamic-report-section">
                    {renderRelatorioAccordionHeader("rubrica", "Filtros de rubrica")}
                    {relatorioAccordions.rubrica ? (
                    <div className="prototype-dynamic-report-grid">
                <div className={getFiltroFieldClassName("Código da Rubrica")}>
                  <MultiSelectFieldSeplag
                    label="Código da rubrica"
                    name="codigoRubrica"
                    control={control}
                    cols="12"
                    options={grupoFolhaRubricaOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={getEmptyFieldError}
                  />
                </div>
                <div className={getFiltroFieldClassName("Tipo da Rubrica")}>
                  <MultiSelectFieldSeplag
                    label="Tipo da rubrica"
                    name="tipoRubrica"
                    control={control}
                    cols="12"
                    options={folhaConformidadeTipoRubricaOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={getEmptyFieldError}
                  />
                </div>
                    </div>
                    ) : null}
                  </section>

                  <section className="prototype-dynamic-report-section">
                    {renderRelatorioAccordionHeader(
                      "previdenciarios",
                      "Filtros previdenciários / INSS",
                    )}
                    {relatorioAccordions.previdenciarios ? (
                    <div className="prototype-dynamic-report-grid">
                <div className={getFiltroFieldClassName("Data Aposentadoria")}>
                  <div className="prototype-dynamic-report-range">
                    <DateFieldSeplag
                      label="Data aposentadoria"
                      name="dataAposentadoriaInicio"
                      control={control}
                      cols="12"
                      getFormErrorMessage={getEmptyFieldError}
                    />
                    <DateFieldSeplag
                      label="Até"
                      name="dataAposentadoriaFim"
                      control={control}
                      cols="12"
                      getFormErrorMessage={getEmptyFieldError}
                    />
                  </div>
                </div>
                    </div>
                    ) : null}
                  </section>

                  <section className="prototype-dynamic-report-section">
                    {renderRelatorioAccordionHeader("outros", "Outros filtros")}
                    {relatorioAccordions.outros ? (
                    <div className="prototype-dynamic-report-grid">
                <div className={getFiltroFieldClassName("Jornada")}>
                  <MultiSelectFieldSeplag
                    label="Jornada"
                    name="jornada"
                    control={control}
                    cols="12"
                    options={folhaConformidadeJornadaOptions}
                    optionLabel="label"
                    optionValue="value"
                    getFormErrorMessage={getEmptyFieldError}
                  />
                </div>
                <div className={getFiltroFieldClassName("Data de Exercício")}>
                  <div className="prototype-dynamic-report-range">
                    <DateFieldSeplag
                      label="Data de exercício"
                      name="dataExercicioInicio"
                      control={control}
                      cols="12"
                      getFormErrorMessage={getEmptyFieldError}
                    />
                    <DateFieldSeplag
                      label="Até"
                      name="dataExercicioFim"
                      control={control}
                      cols="12"
                      getFormErrorMessage={getEmptyFieldError}
                    />
                  </div>
                </div>
                    </div>
                    ) : null}
                  </section>
                </div>
              ) : null}
            </section>
            </div>

            <div className="prototype-dynamic-report-actions">
              <BotaoLimparFiltroSeplag onClick={handleLimpar} type="button" />
              <BotaoSalvarSeplag
                label="Gerar relatório"
                icon="pi pi-file-excel"
                type="submit"
              />
            </div>
          </form>
        </CardSeplag>

        <div className="prototype-dynamic-report-preview">
          <div className="prototype-conformidade-table">
            <div className="prototype-conformidade-section-title">
              <strong>Histórico de relatórios gerados</strong>
              <span>Gerações recentes</span>
            </div>
            <TablePaginadoSeplag
              data={createResults(folhaConformidadeHistoricoRows)}
              columns={historicoColumns}
              rows={5}
            />
          </div>
        </div>

        <ModalSeplag
          visible={modalFiltrosAberto}
          titulo={
            modalFiltrosModo === "salvar"
              ? "Salvar Filtro"
              : modalFiltrosModo === "aplicar"
                ? "Aplicar filtro"
                : "Gerenciador de Filtros"
          }
          fechar={() => setModalFiltrosAberto(false)}
          labelFechar={modalFiltrosModo === "salvar" ? "Cancelar" : "Voltar"}
          labelAcao="Salvar filtro"
          iconAcao="pi pi-save"
          tamanho="1176px"
          funcAcao={handleSubmitSalvarFiltro(handleSalvarFiltro)}
          hideFooter={modalFiltrosModo !== "salvar"}
        >
          <div className="col-12 prototype-dynamic-report-filter-modal">
            {feedbackFiltro ? (
              <div className="prototype-validation-panel">{feedbackFiltro}</div>
            ) : null}

            {modalFiltrosModo !== "salvar" ? (
              <>
                <div className="prototype-dynamic-report-filter-form">
                  <div className="prototype-dynamic-report-manager-filters">
                    <TextFieldSeplag
                      label="Nome"
                      name="nome"
                      control={gerenciadorFiltroControl}
                      cols="12"
                      maxLength={150}
                      placeholder="Nome do filtro"
                    />
                    <TextFieldSeplag
                      label="Criado por"
                      name="criadoPor"
                      control={gerenciadorFiltroControl}
                      cols="12"
                      maxLength={150}
                      placeholder="Nome do criador"
                    />
                    <div className="prototype-dynamic-report-manager-clear">
                      <BotaoLimparFiltroSeplag
                        type="button"
                        label="Limpar"
                        onClick={handleLimparGerenciadorFiltro}
                      />
                    </div>
                  </div>
                </div>

                <div className="prototype-dynamic-report-filter-list">
                  <div className="prototype-table-wrapper">
                    <table className="prototype-simple-table">
                      <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Visibilidade</th>
                        <th>Data da Criação</th>
                        <th>Data da Última Alteração</th>
                        <th>Criado por</th>
                        <th className="prototype-dynamic-report-actions-column">Ações</th>
                      </tr>
                      </thead>
                      <tbody>
                        {filtrosSalvosPaginados.map((filtro) => (
                          <tr key={filtro.id}>
                            <td>{filtro.nome}</td>
                            <td>{filtro.visibilidade}</td>
                            <td>{filtro.criadoEm}</td>
                            <td>{filtro.atualizadoEm}</td>
                            <td>{filtro.criadoPor}</td>
                            <td className="prototype-dynamic-report-actions-column">
                              <div className="prototype-dynamic-report-filter-actions-cell">
                                {modalFiltrosModo === "aplicar" ? (
                                  <BotaoIconSeplag
                                    type="button"
                                    icon="pi pi-check"
                                    tooltip="Aplicar filtro"
                                    onClick={() => handleAplicarFiltroSalvo(filtro)}
                                  />
                                ) : (
                                  <>
                                    <BotaoIconSeplag
                                      type="button"
                                      icon="pi pi-pencil"
                                      tooltip="Editar"
                                      onClick={() => handleEditarFiltro(filtro)}
                                    />
                                    {podeExcluirFiltroSalvo(filtro) ? (
                                      <BotaoIconSeplag
                                        type="button"
                                        severity="danger"
                                        icon="pi pi-trash"
                                        tooltip="Excluir"
                                        onClick={() => setFiltroParaExcluir(filtro)}
                                      />
                                    ) : null}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filtrosSalvosPaginados.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="prototype-empty-table-cell">
                              Nenhum filtro encontrado.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                  <div className="prototype-dynamic-report-manager-pagination">
                    <button
                      type="button"
                      aria-label="Primeira página"
                      onClick={() => setPaginaGerenciadorFiltro(1)}
                      disabled={paginaGerenciadorFiltroAtual === 1}
                    >
                      <i className="pi pi-angle-double-left" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Página anterior"
                      onClick={() =>
                        setPaginaGerenciadorFiltro((pagina) =>
                          Math.max(1, pagina - 1),
                        )
                      }
                      disabled={paginaGerenciadorFiltroAtual === 1}
                    >
                      <i className="pi pi-angle-left" aria-hidden="true" />
                    </button>
                    <span className="prototype-dynamic-report-page-current">
                      {paginaGerenciadorFiltroAtual}
                    </span>
                    <button
                      type="button"
                      aria-label="Próxima página"
                      onClick={() =>
                        setPaginaGerenciadorFiltro((pagina) =>
                          Math.min(totalPaginasGerenciadorFiltro, pagina + 1),
                        )
                      }
                      disabled={
                        paginaGerenciadorFiltroAtual === totalPaginasGerenciadorFiltro
                      }
                    >
                      <i className="pi pi-angle-right" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Última página"
                      onClick={() =>
                        setPaginaGerenciadorFiltro(totalPaginasGerenciadorFiltro)
                      }
                      disabled={
                        paginaGerenciadorFiltroAtual === totalPaginasGerenciadorFiltro
                      }
                    >
                      <i className="pi pi-angle-double-right" aria-hidden="true" />
                    </button>
                    <select
                      aria-label="Registros por página"
                      value={linhasGerenciadorFiltro}
                      onChange={(event) => {
                        setLinhasGerenciadorFiltro(Number(event.target.value));
                        setPaginaGerenciadorFiltro(1);
                      }}
                    >
                      {[5, 10, 25, 50].map((total) => (
                        <option key={total} value={total}>
                          {total}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            ) : null}

            {modalFiltrosModo === "salvar" ? (
              <div className="prototype-dynamic-report-filter-form">
                <TextFieldSeplag
                  label="Nome do filtro"
                  name="nomeFiltro"
                  control={salvarFiltroControl}
                  cols="12"
                  placeholder="Informe um nome para o filtro"
                />
                <DropdownFieldSeplag
                  label="Visibilidade"
                  name="visibilidade"
                  control={salvarFiltroControl}
                  cols="12"
                  options={folhaConformidadeVisibilidadeFiltroOptions}
                  optionLabel="label"
                  optionValue="value"
                  getFormErrorMessage={getEmptyFieldError}
                />
              </div>
            ) : null}
          </div>
        </ModalSeplag>

        <ModalSeplag
          visible={Boolean(filtroParaExcluir)}
          titulo="Excluir filtro"
          fechar={() => setFiltroParaExcluir(null)}
          labelFechar="Cancelar"
          labelAcao="Excluir"
          iconAcao="pi pi-trash"
          tamanho="460px"
          funcAcao={confirmarExcluirFiltro}
        >
          <div className="col-12">
            Deseja realmente excluir o registro selecionado?
          </div>
        </ModalSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaPenhoraJudicialPage() {
  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <div className="prototype-empty-content" aria-label="Penhora Judicial" />
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaGrupoEleitosPage() {
  const navigate = useNavigate();
  const { control, reset } = useForm<GrupoEleitosFiltroForm>({
    defaultValues: {
      termo: "",
      situacao: "",
    },
  });
  const grupoEleitosResults = {
    ...createResults(gruposEleitosMock),
    totalPages: 5,
    totalRecords: 42,
    size: 10,
    sizePage: 10,
  };
  const grupoEleitosColumns: ColumnMetaSeplag<GrupoEleitosRow>[] = [
    {
      field: "descricao",
      header: "Descrição",
    },
    {
      field: "quantidadeEleitos",
      header: "Quantidade Eleitos",
    },
    {
      header: "Situação",
      body: (row) => renderGrupoCalculoStatusBadge(row.situacao),
    },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <div className="prototype-page-content prototype-page-content--white prototype-folha-grupo-page">
        <CardSeplag
          title="Grupo de Eleitos"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="prototype-category-filters prototype-folha-grupo-filters grid">
            <TextFieldSeplag
              name="termo"
              control={control}
              label="Descrição"
              cols="12 12 6"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="situacao"
              control={control}
              label="Situação"
              cols="12 12 4"
              options={regimeSituacaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <div className="prototype-category-clear col-12 md:col-6 lg:col-2">
              <BotaoLimparFiltroSeplag
                type="button"
                label="Limpar"
                icon="pi pi-refresh"
                onClick={() =>
                  reset({
                    termo: "",
                    situacao: "",
                  })
                }
              />
            </div>
          </div>

          <div className="prototype-folha-grupo-table">
            <TablePaginadoSeplag
              dataKey="id"
              data={grupoEleitosResults}
              rows={10}
              rowsPerPage={[10]}
              paginator
              lazy
              selectionMode={null}
              columns={grupoEleitosColumns}
              hasEventoAcao
              handleAdicionar={() =>
                navigate("/prototipos/folha/grupo-eleitos/novo")
              }
              handleView={() => {}}
              handleEdit={() => {}}
              handleDelete={() => {}}
              handleOnPageChange={() => {}}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaGrupoEleitoFormPage() {
  const navigate = useNavigate();
  const [participantesDisponiveis, setParticipantesDisponiveis] = useState(
    grupoEleitoParticipantesMock.slice(4),
  );
  const [participantesEleitos, setParticipantesEleitos] = useState(
    grupoEleitoParticipantesMock.slice(0, 4),
  );
  const { control, setValue } = useForm<GrupoEleitoForm>({
    defaultValues: {
      descricao: "",
      situacao: SITUACAO_VIGENCIA.ATIVO,
      dataAtivacao: "08/05/2026",
      dataEncerramento: "",
      motivoEncerramento: "",
      dataExtincao: "",
      motivoExtincao: "",
      observacoes: "",
      participanteBusca: "",
      consultar: "todos",
      filtroInstituicao: [],
      filtroOrgao: [],
      filtroTipoVinculo: [],
      filtroSetor: [],
      filtroCategoria: [],
      filtroSubcategoria: [],
      filtroCargo: [],
    },
  });
  const renderParticipantePickListItem = (participante: GrupoEleitoParticipanteRow) => (
    <div className="prototype-grupo-picklist-item">
      <span className="prototype-grupo-matricula">{participante.matricula || "-"}</span>
      <strong>{participante.servidor}</strong>
      <span className="prototype-grupo-cpf">{participante.cpf}</span>
    </div>
  );
  const handleClearParticipanteFilters = () => {
    setValue("participanteBusca", "");
    setValue("filtroInstituicao", []);
    setValue("filtroOrgao", []);
    setValue("filtroTipoVinculo", []);
    setValue("filtroSetor", []);
    setValue("filtroCategoria", []);
    setValue("filtroSubcategoria", []);
    setValue("filtroCargo", []);
  };

  return (
    <PrototypeSystemPage
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
    >
      <form onSubmit={(event) => event.preventDefault()}>
        <div className="prototype-page-content prototype-page-content--white">
          <CardSeplag
            title="Cadastrar - Grupo de Eleito"
            cols="12"
            cardHeaderClassNames="prototype-category-card"
          >
            <div className="col-12 prototype-category-form prototype-grupo-eleito-form">
              <div className="grid prototype-category-form-fields prototype-grupo-eleito-form-fields">
                <TextFieldSeplag
                  name="descricao"
                  control={control}
                  label="Descrição"
                  cols="12 12 12"
                  required
                  getFormErrorMessage={() => null}
                />
                <TextAreaFieldSeplag
                  name="observacoes"
                  control={control}
                  label="Observações"
                  cols="12 12 12"
                  maxLength={500}
                  getFormErrorMessage={() => null}
                />
                <div className="col-12 prototype-category-vigencia">
                  <SituacaoVigenciaSeplag<GrupoEleitoForm>
                    control={control}
                    setValue={setValue}
                    rotuloDataAtivacao="Data Criação"
                    cols={{
                      situacao: "12 12 3",
                      dataAtivacao: "12 12 3",
                      statusOperacional: "col-12 md:col-4 lg:col-4",
                      dataEncerramento: "12 12 3",
                      motivoEncerramento: "12",
                      dataExtincao: "12 12 3",
                      motivoExtincao: "12",
                    }}
                    getFormErrorMessage={() => null}
                  />
                </div>
              </div>

              <div className="prototype-grupo-participantes">
                <div className="prototype-grupo-picklist-shell">
                  <div className="prototype-grupo-card-search">
                    <div className="prototype-grupo-card-search-label">
                      Nome, CPF ou Matrícula<span>*</span>
                    </div>
                    <div className="prototype-grupo-card-search-row">
                      <Controller
                        name="participanteBusca"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            className="p-inputtext p-component"
                            placeholder="Buscar por nome, CPF ou matrícula..."
                          />
                        )}
                      />
                    </div>
                  </div>

                  <details className="prototype-grupo-inline-filters" open>
                    <summary className="prototype-grupo-inline-filters-title">
                      <span>
                        <i className="pi pi-filter" aria-hidden="true" />
                        Filtros avançados
                      </span>
                      <i className="pi pi-chevron-down prototype-grupo-accordion-chevron" aria-hidden="true" />
                    </summary>
                    <div className="grid prototype-grupo-advanced-filter-grid">
                      <MultiSelectFieldSeplag
                        name="filtroInstituicao"
                        control={control}
                        label="Instituição"
                        cols="12 6 4"
                        options={grupoEleitoFiltroAvancadoOptions.instituicoes}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecionar instituições"
                        getFormErrorMessage={() => null}
                      />
                      <MultiSelectFieldSeplag
                        name="filtroOrgao"
                        control={control}
                        label="Órgão"
                        cols="12 6 4"
                        options={grupoEleitoFiltroAvancadoOptions.orgaos}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecionar órgãos"
                        getFormErrorMessage={() => null}
                      />
                      <MultiSelectFieldSeplag
                        name="filtroSetor"
                        control={control}
                        label="Setores"
                        cols="12 6 4"
                        options={grupoEleitoFiltroAvancadoOptions.setores}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecionar setores"
                        getFormErrorMessage={() => null}
                      />
                      <MultiSelectFieldSeplag
                        name="filtroCategoria"
                        control={control}
                        label="Categoria"
                        cols="12 6 4"
                        options={grupoEleitoFiltroAvancadoOptions.categorias}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecionar categorias"
                        getFormErrorMessage={() => null}
                      />
                      <MultiSelectFieldSeplag
                        name="filtroSubcategoria"
                        control={control}
                        label="Subcategoria"
                        cols="12 6 4"
                        options={grupoEleitoFiltroAvancadoOptions.subcategorias}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecionar subcategorias"
                        getFormErrorMessage={() => null}
                      />
                      <MultiSelectFieldSeplag
                        name="filtroCargo"
                        control={control}
                        label="Cargo"
                        cols="12 6 4"
                        options={grupoEleitoFiltroAvancadoOptions.cargos}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecionar cargos"
                        getFormErrorMessage={() => null}
                      />
                      <MultiSelectFieldSeplag
                        name="filtroTipoVinculo"
                        control={control}
                        label="Tipo de Vínculo"
                        cols="12 6 4"
                        options={grupoEleitoFiltroAvancadoOptions.tiposVinculo}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecionar Tipo de Vínculo"
                        getFormErrorMessage={() => null}
                      />
                      <div className="col-12 md:col-6 lg:col-8 prototype-grupo-inline-filter-actions">
                        <BotaoSeplag
                          type="button"
                          label="Aplicar Filtro"
                          icon="pi pi-filter"
                          style={{ height: 30, marginBottom: 0 }}
                        />
                        <BotaoLimparFiltroSeplag
                          type="button"
                          label="Limpar"
                          icon="pi pi-refresh"
                          style={{ height: 30, marginBottom: 0 }}
                          onClick={handleClearParticipanteFilters}
                        />
                      </div>
                    </div>
                  </details>

                  <PickListSeplag<GrupoEleitoParticipanteRow>
                    title=""
                    titleNaoSelecionados="Disponíveis"
                    titleSelecionados="Eleitos"
                    dataKey="id"
                    dataLabel="servidor"
                    filterBy="matricula,cpf,servidor"
                    filterPlaceholder="Filtrar participantes..."
                    naoSelecionados={participantesDisponiveis}
                    selecionados={participantesEleitos}
                    setNaoSelecionados={setParticipantesDisponiveis}
                    setSelecionados={setParticipantesEleitos}
                    naoSelecionadosItemTemplate={renderParticipantePickListItem}
                    selecionadosItemTemplate={renderParticipantePickListItem}
                  />
                </div>
              </div>

              <div className="prototype-category-form-footer">
                <BotaoVoltarSeplag
                  type="button"
                  onClick={() => navigate("/prototipos/folha/grupo-eleitos")}
                />
                <BotaoSalvarSeplag type="submit" />
              </div>
            </div>
          </CardSeplag>
        </div>
      </form>
    </PrototypeSystemPage>
  );
}

function EmDesenvolvimentoPage({
  nomeSistema,
}: Readonly<{ nomeSistema: string }>) {
  return (
    <PrototypeSystemPage
      nomeSistema={nomeSistema}
      ambienteSistema="Teste"
      menuItems={menuSimples}
      message={`${nomeSistema} ainda está em desenvolvimento.`}
    />
  );
}

export function PrototiposPericiaPage() {
  return <EmDesenvolvimentoPage nomeSistema="PERÍCIA" />;
}

export function PrototiposConsignadoPage() {
  return <EmDesenvolvimentoPage nomeSistema="CONSIGNADO" />;
}

export function PrototiposContagemTempoPage() {
  return <EmDesenvolvimentoPage nomeSistema="CONTAGEM DE TEMPO" />;
}

export function PrototiposESocialPage() {
  return <EmDesenvolvimentoPage nomeSistema="E-SOCIAL" />;
}

export function PrototiposAposentadoriaPage() {
  return <EmDesenvolvimentoPage nomeSistema="APOSENTADORIA" />;
}

export function PrototiposConformidadePage() {
  return <EmDesenvolvimentoPage nomeSistema="CONFORMIDADE" />;
}

export function PrototiposAuditoriaPage() {
  return <EmDesenvolvimentoPage nomeSistema="AUDITORIA" />;
}



