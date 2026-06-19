import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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

const SIGEP_BASE_PATH = "/prototipos/sigep";
const SIGEP_CARGO_CONCURSO_TESTE_BASE_PATH =
  "/prototipos/sigep/cargo-concurso-teste";
const FOLHA_PAGAMENTO_BASE_PATH =
  "/prototipos/folha/processamento/folha-pagamento";
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

interface CargoConcursoRouteProps {
  routePrefix?: string;
}

const menuGestaoPessoas: IMenuSeplag[] = [
  {
    label: "Página Inicial",
    icon: "pi pi-home",
    to: "/prototipos/sigep",
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
          {
            label: "Controle de Vagas",
            icon: "pi pi-circle-on",
            to: "/prototipos/sigep/controle-vagas",
            visibleOnMenu: true,
            visibleOnRouter: true,
          },
          { label: "Tabelas de Vencimentos", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
        ],
      },
      {
        label: "Cargo e Concurso TESTE",
        icon: "pi pi-clone",
        url: "#",
        visibleOnMenu: true,
        visibleOnRouter: true,
        items: [
          {
            label: "Regime Jurídico",
            icon: "pi pi-circle-on",
            to: "/prototipos/sigep/cargo-concurso-teste/regime-juridico",
            visibleOnMenu: true,
            visibleOnRouter: true,
          },
          {
            label: "Categoria/Subcategoria",
            icon: "pi pi-circle-on",
            to: "/prototipos/sigep/cargo-concurso-teste/categoria",
            visibleOnMenu: true,
            visibleOnRouter: true,
          },
          {
            label: "Cargo",
            icon: "pi pi-circle-on",
            to: "/prototipos/sigep/cargo-concurso-teste/cargo",
            visibleOnMenu: true,
            visibleOnRouter: true,
          },
          {
            label: "Tipo de Vínculo",
            icon: "pi pi-circle-on",
            to: "/prototipos/sigep/cargo-concurso-teste/tipo-vinculo",
            visibleOnMenu: true,
            visibleOnRouter: true,
          },
          {
            label: "Matriz/Regras",
            icon: "pi pi-circle-on",
            to: "/prototipos/sigep/cargo-concurso-teste/matriz-validacao",
            visibleOnMenu: true,
            visibleOnRouter: true,
          },
        ],
      },
      {
        label: "Vínculos Funcionais",
        icon: "pi pi-link",
        url: "#",
        visibleOnMenu: true,
        visibleOnRouter: true,
        items: [
          { label: "Tipo de Vínculo", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Vínculo", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
          { label: "Vacância", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
        ],
      },
      {
        label: "Documentação",
        icon: "pi pi-folder-open",
        url: "#",
        visibleOnMenu: true,
        visibleOnRouter: true,
        items: [{ label: "Documentos Legais", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true }],
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
    ],
  },
];

const menuFolha: IMenuSeplag[] = [
  {
    label: "Página Inicial",
    icon: "pi pi-home",
    to: "/prototipos/folha",
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
      { label: "Parâmetros de Folha", icon: "pi pi-circle-on", url: "#", visibleOnMenu: true, visibleOnRouter: true },
      {
        label: "Tabelas de Referência",
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
    id: "folha",
    title: "Folha de Pagamento",
    description: "Protótipos para rubricas, grupos de cálculo, grupos de eleitos e lançamentos financeiros.",
    path: "/prototipos/folha",
    icon: "pi pi-money-bill",
    status: "Protótipo em evolução",
  },
];

const sistemas: AppSystemItemSeplag[] = [
  { id: "gestao-pessoas", label: "GESTÃO DE PESSOAS", url: "#/prototipos/sigep", icon: "pi pi-users" },
  { id: "folha", label: "FOLHA", url: "#/prototipos/folha", icon: "pi pi-money-bill" },
  { id: "pericia", label: "PERÍCIA", url: "#/prototipos/pericia", icon: "pi pi-plus-circle" },
  { id: "consignado", label: "CONSIGNADO", url: "#/prototipos/consignado", icon: "pi pi-wallet" },
  { id: "contagem-tempo", label: "CONTAGEM DE TEMPO", url: "#/prototipos/contagem-tempo", icon: "pi pi-clock" },
  { id: "e-social", label: "E-SOCIAL", url: "#/prototipos/e-social", icon: "pi pi-file" },
  { id: "aposentadoria", label: "APOSENTADORIA", url: "#/prototipos/aposentadoria", icon: "pi pi-users" },
  { id: "conformidade", label: "CONFORMIDADE", url: "#/prototipos/conformidade", icon: "pi pi-verified" },
  { id: "auditoria", label: "AUDITORIA", url: "#/prototipos/auditoria", icon: "pi pi-check-square" },
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

function PrototypeSystemPage({
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
          <Link
            className="prototype-system-link"
            key={system.id}
            to={system.path}
            aria-label={`Abrir protótipo ${system.title}`}
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
                <span className="prototype-system-action">
                  Acessar
                  <i className="pi pi-arrow-right" aria-hidden="true" />
                </span>
              </div>
            </CardSeplag>
          </Link>
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

interface ControleVagasConfiguracaoFiltroForm {
  cargoFuncao?: string;
  tipo?: "" | "Cargo" | "Função";
  controlaVaga?: "" | "Sim" | "Não";
  tipoControle?: "" | "Quantitativo" | "Numerado" | "Híbrido";
  situacao?: "" | "Ativo" | "Agendado" | "Encerrado" | "Inativo";
}

interface ControleVagasConfiguracaoForm {
  tipo?: "Cargo" | "Função" | "";
  codigo?: string;
  cargoFuncao?: string;
  controlaVaga?: "Sim" | "Não" | "";
  tipoControle?: "Quantitativo" | "Numerado" | "Híbrido" | "";
  dataInicio?: string;
  permiteSaldoNegativo?: "Sim" | "Não" | "";
  justificativaSaldoNegativo?: string;
  observacao?: string;
  criterioCargoFuncao?: "S" | "N";
  criterioRegimeJuridico?: "S" | "N";
  criterioTipoVinculo?: "S" | "N";
  criterioOrgaoSetor?: "S" | "N";
  criterioSetoresSubordinados?: "S" | "N";
  criterioLocalidade?: "S" | "N";
  criterioEspecialidade?: "S" | "N";
  criterioJornada?: "S" | "N";
}

interface ControleVagasHistoricoRow {
  id: number;
  dataHora: string;
  evento: string;
  usuario: string;
  detalhe: string;
}

interface ControleVagasQuadroAutorizadoFiltroForm {
  cargoFuncao?: string;
  orgaoSetor?: string;
  tipo?: "" | "Cargo" | "Função";
  situacao?: StatusOperacionalVigenciaSeplag | "";
}

interface ControleVagasQuadroAutorizadoForm {
  codigo?: string;
  cargoFuncao?: string;
  orgaoSetor?: string;
  tipo?: "Cargo" | "Função" | "";
  quantidadeAutorizada?: number;
  processoSei?: string;
  observacao?: string;
  situacao?: SituacaoVigenciaValueSeplag["situacao"];
  dataAtivacao?: string;
  dataEncerramento?: string;
  motivoEncerramento?: string;
  dataExtincao?: string;
  motivoExtincao?: string;
}

interface ControleVagasQuadroAutorizadoRow {
  id: number;
  codigo: string;
  cargoFuncao: string;
  orgaoSetor: string;
  tipo: "Cargo" | "Função";
  quantidadeAutorizada: number;
  vagasOcupadas: number;
  vagasReservadas: number;
  vagasDisponiveis: number;
  situacao: StatusOperacionalVigenciaSeplag;
  inicioVigencia: string;
  atoLegal: string;
}

interface ControleVagasQuadroHistoricoRow {
  id: number;
  dataHora: string;
  evento: string;
  usuario: string;
  detalhe: string;
}

interface ControleVagasDistribuicaoRow {
  id: number;
  quadroId: number;
  orgaoSetor: string;
  quantidadeDistribuida: number;
  vagasOcupadas: number;
  vagasReservadas: number;
  observacao: string;
  situacao: StatusOperacionalVigenciaSeplag;
}

interface ControleVagasDistribuicaoForm {
  orgaoSetor?: string;
  quantidadeDistribuida?: number;
  observacao?: string;
}

interface ControleVagasReservaForm {
  tipoReserva?: string;
  orgaoSetor?: string;
  quantidade?: number;
  motivo?: string;
  dataInicio?: string;
  dataFim?: string;
  situacao?: ControleVagasReservaStatus;
  observacao?: string;
}

interface ControleVagasReservaRow {
  id: number;
  quadroId: number;
  tipoReserva: string;
  orgaoSetor: string;
  quantidade: number;
  motivo: string;
  dataInicio: string;
  dataFim?: string;
  situacao: ControleVagasReservaStatus;
  observacao: string;
}

type ControleVagasReservaStatus = "Ativa" | "Cancelada" | "Encerrada";

interface ControleVagasConsultaSaldoFiltroForm {
  dataReferencia?: string;
  cargoFuncao?: string;
  orgaoSetor?: string;
  tipo?: "" | "Cargo" | "Função";
  situacao?: StatusOperacionalVigenciaSeplag | "";
}

interface ControleVagasConsultaSaldoResumo {
  quadroId: number;
  codigo: string;
  cargoFuncao: string;
  orgaoSetor: string;
  tipo: "Cargo" | "Função";
  autorizado: number;
  distribuido: number;
  naoDistribuido: number;
  ocupado: number;
  reservado: number;
  disponivel: number;
  situacao: StatusOperacionalVigenciaSeplag;
}

type ControleVagasVagaNumeradaSituacao =
  | "Disponível"
  | "Ocupada"
  | "Reservada"
  | "Bloqueada"
  | "Agendada"
  | "Extinta";

interface ControleVagasVagaNumeradaOcupacao {
  id: number;
  pessoa: string;
  cpf: string;
  cargoFuncao: string;
  dataOcupacao: string;
  tipoVinculo: string;
  nomeVinculo: string;
  observacao?: string;
}

interface ControleVagasVagaNumeradaForm {
  numero?: string;
  quadroId?: number;
  cargoFuncao?: string;
  orgaoSetor?: string;
  situacao?: ControleVagasVagaNumeradaSituacao;
  dataAtivacao?: string;
  dataDesativacao?: string;
  motivo?: string;
  observacao?: string;
}

interface ControleVagasVagaNumeradaRow {
  id: number;
  numero: string;
  quadroId: number;
  cargoFuncao: string;
  orgaoSetor: string;
  situacao: ControleVagasVagaNumeradaSituacao;
  dataAtivacao: string;
  dataDesativacao?: string;
  motivo?: string;
  ocupacao?: ControleVagasVagaNumeradaOcupacao;
  observacao: string;
}

interface ControleVagasVagaNumeradaFiltroForm {
  numero?: string;
  cargoFuncao?: string;
  orgaoSetor?: string;
  situacao?: ControleVagasVagaNumeradaSituacao | "";
}

interface ControleVagasIntegracaoForm {
  vagaNumero?: string;
  pessoa?: string;
  cpf?: string;
  tipoVinculo?: string;
}

interface ControleVagasIntegracaoEventoRow {
  id: number;
  dataHora: string;
  evento: string;
  vagaNumero: string;
  resultado: "Sucesso" | "Bloqueado" | "Alerta";
  detalhe: string;
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

interface ControleVagasConfiguracaoRow {
  id: number;
  tipo: "Cargo" | "Função";
  codigo: string;
  cargoFuncao: string;
  controlaVaga: "Sim" | "Não";
  tipoControle: "Quantitativo" | "Numerado" | "Híbrido" | "-";
  dataInicio: string;
  criterios: string[];
  situacao: "Ativo" | "Agendado" | "Encerrado" | "Inativo";
  ultimaAlteracao: string;
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

const controleVagasConfiguracoesMock: ControleVagasConfiguracaoRow[] = [
  {
    id: 1,
    tipo: "Cargo",
    codigo: "C001",
    cargoFuncao: "Analista Administrativo",
    controlaVaga: "Sim",
    tipoControle: "Quantitativo",
    dataInicio: "01/01/2026",
    criterios: ["Cargo/Função", "Órgão/Setor", "Especialidade"],
    situacao: "Ativo",
    ultimaAlteracao: "12/05/2026 09:20",
  },
  {
    id: 2,
    tipo: "Cargo",
    codigo: "C014",
    cargoFuncao: "Técnico Administrativo",
    controlaVaga: "Sim",
    tipoControle: "Híbrido",
    dataInicio: "01/03/2026",
    criterios: ["Cargo/Função", "Localidade", "Tipo de Vínculo"],
    situacao: "Agendado",
    ultimaAlteracao: "18/05/2026 14:05",
  },
  {
    id: 3,
    tipo: "Função",
    codigo: "F023",
    cargoFuncao: "Coordenador",
    controlaVaga: "Sim",
    tipoControle: "Numerado",
    dataInicio: "15/01/2026",
    criterios: ["Cargo/Função", "Órgão/Setor", "Setores subordinados"],
    situacao: "Ativo",
    ultimaAlteracao: "20/05/2026 10:42",
  },
  {
    id: 4,
    tipo: "Cargo",
    codigo: "C032",
    cargoFuncao: "Professor da Educação Básica",
    controlaVaga: "Sim",
    tipoControle: "Quantitativo",
    dataInicio: "01/02/2026",
    criterios: ["Cargo/Função", "Especialidade", "Jornada", "Localidade"],
    situacao: "Ativo",
    ultimaAlteracao: "21/05/2026 08:11",
  },
  {
    id: 5,
    tipo: "Função",
    codigo: "F041",
    cargoFuncao: "Assessor Técnico",
    controlaVaga: "Não",
    tipoControle: "-",
    dataInicio: "-",
    criterios: ["Cargo/Função"],
    situacao: "Inativo",
    ultimaAlteracao: "22/05/2026 16:30",
  },
  {
    id: 6,
    tipo: "Cargo",
    codigo: "C008",
    cargoFuncao: "Gestor Governamental",
    controlaVaga: "Sim",
    tipoControle: "Quantitativo",
    dataInicio: "01/01/2025",
    criterios: ["Cargo/Função", "Regime Jurídico", "Tipo de Vínculo"],
    situacao: "Encerrado",
    ultimaAlteracao: "23/05/2026 11:15",
  },
];

const controleVagasHistoricoMock: ControleVagasHistoricoRow[] = [
  {
    id: 1,
    dataHora: "27/05/2026 09:12",
    evento: "Configuração criada",
    usuario: "ROBERTO JUNIOR",
    detalhe: "Controle quantitativo habilitado para o cargo/função selecionado.",
  },
  {
    id: 2,
    dataHora: "27/05/2026 09:18",
    evento: "Critérios atualizados",
    usuario: "ROBERTO JUNIOR",
    detalhe: "Validação por órgão/setor e tipo de vínculo incluída.",
  },
  {
    id: 3,
    dataHora: "27/05/2026 09:24",
    evento: "Vigência ajustada",
    usuario: "ROBERTO JUNIOR",
    detalhe: "Data de início alterada para compatibilizar com a competência de implantação.",
  },
];

const controleVagasQuadroAutorizadoMock: ControleVagasQuadroAutorizadoRow[] = [
  {
    id: 1,
    codigo: "QA-001",
    cargoFuncao: "Analista Administrativo",
    orgaoSetor: "SEPLAG-MT",
    tipo: "Cargo",
    quantidadeAutorizada: 120,
    vagasOcupadas: 98,
    vagasReservadas: 6,
    vagasDisponiveis: 16,
    situacao: STATUS_OPERACIONAL_VIGENCIA.ATIVO,
    inicioVigencia: "01/01/2026",
    atoLegal: "Lei 12.345/2023",
  },
  {
    id: 2,
    codigo: "QA-002",
    cargoFuncao: "Técnico Administrativo",
    orgaoSetor: "SEDUC-MT",
    tipo: "Cargo",
    quantidadeAutorizada: 80,
    vagasOcupadas: 65,
    vagasReservadas: 5,
    vagasDisponiveis: 10,
    situacao: STATUS_OPERACIONAL_VIGENCIA.AGENDADO,
    inicioVigencia: "01/07/2026",
    atoLegal: "Decreto 456/2024",
  },
  {
    id: 3,
    codigo: "QA-003",
    cargoFuncao: "Coordenador",
    orgaoSetor: "PGE-MT",
    tipo: "Função",
    quantidadeAutorizada: 25,
    vagasOcupadas: 19,
    vagasReservadas: 2,
    vagasDisponiveis: 4,
    situacao: STATUS_OPERACIONAL_VIGENCIA.ATIVO,
    inicioVigencia: "15/01/2026",
    atoLegal: "Portaria 123/2024",
  },
  {
    id: 4,
    codigo: "QA-004",
    cargoFuncao: "Gestor Governamental",
    orgaoSetor: "SEPLAG-MT",
    tipo: "Cargo",
    quantidadeAutorizada: 45,
    vagasOcupadas: 45,
    vagasReservadas: 0,
    vagasDisponiveis: 0,
    situacao: "ENCERRADO",
    inicioVigencia: "01/01/2025",
    atoLegal: "Norma 001-A/2022",
  },
];


export interface ControleVagasVagaNumeradaRow {
  id: number;
  codigo: string;
  cargoFuncao: string;
  orgaoSetor: string;
  ocupanteAtual: string;
  situacao: string;
}

const controleVagasVagasNumeradasMock: ControleVagasVagaNumeradaRow[] = [
  {
    id: 1,
    codigo: "VA-001",
    cargoFuncao: "ANALISTA DE TI",
    orgaoSetor: "SEPLAG / STI",
    ocupanteAtual: "JOÃO DA SILVA",
    situacao: "Ocupada",
  },
  {
    id: 2,
    codigo: "VA-002",
    cargoFuncao: "ANALISTA DE TI",
    orgaoSetor: "SEPLAG / STI",
    ocupanteAtual: "-",
    situacao: "Disponível",
  },
  {
    id: 3,
    codigo: "VA-003",
    cargoFuncao: "TÉCNICO ADMINISTRATIVO",
    orgaoSetor: "SEDUC",
    ocupanteAtual: "-",
    situacao: "Reservada",
  },
  {
    id: 4,
    codigo: "VA-004",
    cargoFuncao: "ASSESSOR JURÍDICO",
    orgaoSetor: "PGE",
    ocupanteAtual: "-",
    situacao: "Bloqueada",
  },
];

export interface ControleVagasVagaNumeradaForm {
  codigo: string;
  cargoFuncao: string;
  orgaoSetor: string;
  situacao: string;
  observacao: string;
}

const controleVagasVagaNumeradaSituacaoOptions = [
  { label: "Disponível", value: "Disponível" },
  { label: "Ocupada", value: "Ocupada" },
  { label: "Reservada", value: "Reservada" },
  { label: "Bloqueada", value: "Bloqueada" },
  { label: "Agendada", value: "Agendada" },
  { label: "Extinta", value: "Extinta" },
];

const controleVagasQuadroHistoricoMock: ControleVagasQuadroHistoricoRow[] = [
  {
    id: 1,
    dataHora: "28/05/2026 08:42",
    evento: "Quadro criado",
    usuario: "ROBERTO JUNIOR",
    detalhe: "Quantidade autorizada inicial registrada com documento legal vinculado.",
  },
  {
    id: 2,
    dataHora: "28/05/2026 09:10",
    evento: "Vigência revisada",
    usuario: "ROBERTO JUNIOR",
    detalhe: "Data de início ajustada para refletir o ato autorizativo.",
  },
  {
    id: 3,
    dataHora: "28/05/2026 09:35",
    evento: "Reserva simulada",
    usuario: "SISTEMA",
    detalhe: "Reserva futura registrada para demonstrar integração com a próxima etapa.",
  },
];

const controleVagasDistribuicoesMock: ControleVagasDistribuicaoRow[] = [
  {
    id: 1,
    quadroId: 1,
    orgaoSetor: "SEPLAG-MT / Superintendência de Gestão de Pessoas",
    quantidadeDistribuida: 50,
    vagasOcupadas: 41,
    vagasReservadas: 3,
    observacao: "Distribuição inicial para unidade central.",
    situacao: STATUS_OPERACIONAL_VIGENCIA.ATIVO,
  },
  {
    id: 2,
    quadroId: 1,
    orgaoSetor: "SEPLAG-MT / Coordenadoria de Provimento",
    quantidadeDistribuida: 35,
    vagasOcupadas: 29,
    vagasReservadas: 2,
    observacao: "Reserva operacional para reposições previstas.",
    situacao: STATUS_OPERACIONAL_VIGENCIA.ATIVO,
  },
  {
    id: 3,
    quadroId: 1,
    orgaoSetor: "SEPLAG-MT / Coordenadoria de Carreiras",
    quantidadeDistribuida: 20,
    vagasOcupadas: 16,
    vagasReservadas: 1,
    observacao: "Atende movimentações internas da carreira.",
    situacao: STATUS_OPERACIONAL_VIGENCIA.AGENDADO,
  },
  {
    id: 4,
    quadroId: 2,
    orgaoSetor: "SEDUC-MT / Diretoria Regional Norte",
    quantidadeDistribuida: 30,
    vagasOcupadas: 24,
    vagasReservadas: 2,
    observacao: "Distribuição para expansão regional.",
    situacao: STATUS_OPERACIONAL_VIGENCIA.AGENDADO,
  },
  {
    id: 5,
    quadroId: 2,
    orgaoSetor: "SEDUC-MT / Diretoria Regional Sul",
    quantidadeDistribuida: 28,
    vagasOcupadas: 22,
    vagasReservadas: 1,
    observacao: "Distribuição vinculada ao novo quadro autorizado.",
    situacao: STATUS_OPERACIONAL_VIGENCIA.AGENDADO,
  },
  {
    id: 6,
    quadroId: 3,
    orgaoSetor: "PGE-MT / Procuradoria Administrativa",
    quantidadeDistribuida: 12,
    vagasOcupadas: 9,
    vagasReservadas: 1,
    observacao: "Funções de coordenação administrativa.",
    situacao: STATUS_OPERACIONAL_VIGENCIA.ATIVO,
  },
  {
    id: 7,
    quadroId: 3,
    orgaoSetor: "PGE-MT / Procuradoria Judicial",
    quantidadeDistribuida: 8,
    vagasOcupadas: 6,
    vagasReservadas: 1,
    observacao: "Funções de apoio à gestão judicial.",
    situacao: STATUS_OPERACIONAL_VIGENCIA.ATIVO,
  },
  {
    id: 8,
    quadroId: 4,
    orgaoSetor: "SEPLAG-MT / Unidades Extintas",
    quantidadeDistribuida: 45,
    vagasOcupadas: 45,
    vagasReservadas: 0,
    observacao: "Registro histórico encerrado.",
    situacao: STATUS_OPERACIONAL_VIGENCIA.ENCERRADO,
  },
];

const controleVagasReservasMock: ControleVagasReservaRow[] = [
  {
    id: 10,
    quadroId: 1,
    tipoReserva: "Reserva Estratégica",
    orgaoSetor: "SEPLAG-MT / Superintendência de Gestão de Pessoas",
    quantidade: 3,
    motivo: "Reserva estratégica para recomposição de equipe.",
    dataInicio: "01/06/2026",
    dataFim: "30/11/2026",
    situacao: "Ativa",
    observacao: "Reserva ativa derivada do quadro autorizado.",
  },
  {
    id: 1,
    quadroId: 1,
    tipoReserva: "Processo Seletivo",
    orgaoSetor: "SEPLAG-MT / Coordenadoria de Provimento",
    quantidade: 2,
    motivo: "Reserva de vagas para reposição de vencimentos.",
    dataInicio: "01/07/2026",
    dataFim: "31/12/2026",
    situacao: "Ativa",
    observacao: "Reserva planejada para o processo seletivo deste semestre.",
  },
  {
    id: 11,
    quadroId: 1,
    tipoReserva: "Retenção",
    orgaoSetor: "SEPLAG-MT / Coordenadoria de Carreiras",
    quantidade: 1,
    motivo: "Reserva para retenção de vaga durante movimentação de carreira.",
    dataInicio: "01/07/2026",
    dataFim: "30/09/2026",
    situacao: "Ativa",
    observacao: "Mantém o saldo reservado para movimentação interna.",
  },
  {
    id: 2,
    quadroId: 1,
    tipoReserva: "Reposição",
    orgaoSetor: "SEPLAG-MT / Coordenadoria de Carreiras",
    quantidade: 1,
    motivo: "Reserva para movimentação interna programada.",
    dataInicio: "15/07/2026",
    dataFim: "15/10/2026",
    situacao: "Cancelada",
    observacao: "Reserva cancelada após revisão de necessidades.",
  },
  {
    id: 12,
    quadroId: 2,
    tipoReserva: "Processo Seletivo",
    orgaoSetor: "SEDUC-MT / Diretoria Regional Norte",
    quantidade: 2,
    motivo: "Reserva para ingresso regional.",
    dataInicio: "01/07/2026",
    dataFim: "31/12/2026",
    situacao: "Ativa",
    observacao: "Reserva ativa vinculada à distribuição regional norte.",
  },
  {
    id: 13,
    quadroId: 2,
    tipoReserva: "Reposição",
    orgaoSetor: "SEDUC-MT / Diretoria Regional Sul",
    quantidade: 1,
    motivo: "Reserva para reposição regional.",
    dataInicio: "01/07/2026",
    dataFim: "31/12/2026",
    situacao: "Ativa",
    observacao: "Reserva ativa vinculada à distribuição regional sul.",
  },
  {
    id: 14,
    quadroId: 3,
    tipoReserva: "Reserva Estratégica",
    orgaoSetor: "PGE-MT / Procuradoria Administrativa",
    quantidade: 1,
    motivo: "Reserva para substituição de coordenação administrativa.",
    dataInicio: "15/06/2026",
    dataFim: "15/12/2026",
    situacao: "Ativa",
    observacao: "Reserva ativa para função administrativa.",
  },
  {
    id: 15,
    quadroId: 3,
    tipoReserva: "Reserva Estratégica",
    orgaoSetor: "PGE-MT / Procuradoria Judicial",
    quantidade: 1,
    motivo: "Reserva para substituição de coordenação judicial.",
    dataInicio: "15/06/2026",
    dataFim: "15/12/2026",
    situacao: "Ativa",
    observacao: "Reserva ativa para função judicial.",
  },
];

const controleVagasVagaNumeradaMock: ControleVagasVagaNumeradaRow[] = [
  {
    id: 1,
    numero: "VA-001",
    quadroId: 1,
    cargoFuncao: "Analista Administrativo",
    orgaoSetor: "SEPLAG-MT / Superintendência de Gestão de Pessoas",
    situacao: "Ocupada",
    dataAtivacao: "01/02/2025",
    observacao: "Vaga ocupada via processo seletivo.",
    ocupacao: {
      id: 1,
      pessoa: "ROBERTO JÚNIOR SILVA",
      cpf: "123.456.789-00",
      cargoFuncao: "Analista Administrativo",
      dataOcupacao: "15/02/2025",
      tipoVinculo: "Efetivo",
      nomeVinculo: "Servidor Público",
      observacao: "Nomeado por concurso público.",
    },
  },
  {
    id: 2,
    numero: "VA-002",
    quadroId: 1,
    cargoFuncao: "Analista Administrativo",
    orgaoSetor: "SEPLAG-MT / Superintendência de Gestão de Pessoas",
    situacao: "Disponível",
    dataAtivacao: "01/02/2025",
    observacao: "Vaga disponível para ocupação.",
  },
  {
    id: 3,
    numero: "VA-003",
    quadroId: 1,
    cargoFuncao: "Analista Administrativo",
    orgaoSetor: "SEPLAG-MT / Superintendência de Gestão de Pessoas",
    situacao: "Reservada",
    dataAtivacao: "01/02/2025",
    observacao: "Vaga reservada para processo seletivo.",
  },
  {
    id: 4,
    numero: "VA-004",
    quadroId: 1,
    cargoFuncao: "Analista Administrativo",
    orgaoSetor: "SEPLAG-MT / Superintendência de Gestão de Pessoas",
    situacao: "Bloqueada",
    dataAtivacao: "01/02/2025",
    dataDesativacao: "29/05/2026",
    motivo: "Bloqueio temporário para reestruturação.",
    observacao: "Bloqueada por decisão gerencial.",
  },
  {
    id: 5,
    numero: "VA-005",
    quadroId: 1,
    cargoFuncao: "Analista Administrativo",
    orgaoSetor: "SEPLAG-MT / Coordenadoria de Provimento",
    situacao: "Agendada",
    dataAtivacao: "15/06/2026",
    observacao: "Vaga agendada para ativação futuro.",
  },
  {
    id: 6,
    numero: "VA-006",
    quadroId: 1,
    cargoFuncao: "Analista Administrativo",
    orgaoSetor: "SEPLAG-MT / Superintendência de Gestão de Pessoas",
    situacao: "Extinta",
    dataAtivacao: "01/01/2023",
    dataDesativacao: "31/12/2025",
    motivo: "Eliminação por reestruturação.",
    observacao: "Vaga extinta conforme reorganização.",
  },
  {
    id: 7,
    numero: "AA-001",
    quadroId: 2,
    cargoFuncao: "Técnico Administrativo",
    orgaoSetor: "SEDUC-MT / Diretoria Regional Norte",
    situacao: "Ocupada",
    dataAtivacao: "01/03/2025",
    observacao: "Técnico designado temporariamente.",
    ocupacao: {
      id: 2,
      pessoa: "MARIA DOS SANTOS",
      cpf: "987.654.321-00",
      cargoFuncao: "Técnico Administrativo",
      dataOcupacao: "10/03/2025",
      tipoVinculo: "Designado",
      nomeVinculo: "Designação",
      observacao: "Designada para funções de coordenação.",
    },
  },
  {
    id: 8,
    numero: "AA-002",
    quadroId: 2,
    cargoFuncao: "Técnico Administrativo",
    orgaoSetor: "SEDUC-MT / Diretoria Regional Norte",
    situacao: "Disponível",
    dataAtivacao: "01/03/2025",
    observacao: "Vaga em disponibilidade.",
  },
  {
    id: 9,
    numero: "GG-001",
    quadroId: 4,
    cargoFuncao: "Gestor Governamental",
    orgaoSetor: "SEPLAG-MT / Unidades Extintas",
    situacao: "Disponível",
    dataAtivacao: "01/01/2025",
    observacao: "Vaga usada para demonstrar bloqueio por ausência de saldo.",
  },
];

const controleVagasVagaNumeradaHistoricoMock: Array<{
  id: number;
  vagaNumero: string;
  dataHora: string;
  evento: string;
  usuario: string;
  detalhe: string;
}> = [
  {
    id: 1,
    vagaNumero: "VA-001",
    dataHora: "15/02/2025 10:30",
    evento: "Ocupação",
    usuario: "SISTEMA",
    detalhe: "Vaga ocupada por ROBERTO JÚNIOR SILVA conforme processo seletivo.",
  },
  {
    id: 2,
    vagaNumero: "VA-001",
    dataHora: "01/02/2025 09:15",
    evento: "Ativação",
    usuario: "GESTOR VAGAS",
    detalhe: "Vaga ativada no sistema para controle.",
  },
  {
    id: 3,
    vagaNumero: "VA-004",
    dataHora: "29/05/2026 14:22",
    evento: "Bloqueio",
    usuario: "GESTOR VAGAS",
    detalhe: "Bloqueio temporário para reestruturação de setores.",
  },
  {
    id: 4,
    vagaNumero: "VA-006",
    dataHora: "31/12/2025 23:59",
    evento: "Extinção",
    usuario: "SISTEMA",
    detalhe: "Vaga extinta conforme decisão de reorganização.",
  },
  {
    id: 5,
    vagaNumero: "AA-001",
    dataHora: "10/03/2025 11:45",
    evento: "Designação",
    usuario: "SISTEMA",
    detalhe: "Designação de MARIA DOS SANTOS para a vaga.",
  },
];

const getControleVagasReservasAtivas = (
  quadroId: number,
  orgaoSetor?: string,
  reservas: ControleVagasReservaRow[] = controleVagasReservasMock,
) =>
  reservas.filter(
    (reserva) =>
      reserva.quadroId === quadroId &&
      reserva.situacao === "Ativa" &&
      (!orgaoSetor || reserva.orgaoSetor === orgaoSetor),
  );

const getControleVagasReservadoDistribuicao = (
  distribuicao: ControleVagasDistribuicaoRow,
  reservas: ControleVagasReservaRow[] = controleVagasReservasMock,
) => {
  const reservasAtivas = getControleVagasReservasAtivas(
    distribuicao.quadroId,
    distribuicao.orgaoSetor,
    reservas,
  );

  if (reservasAtivas.length === 0) {
    return distribuicao.vagasReservadas;
  }

  return reservasAtivas.reduce((total, reserva) => total + reserva.quantidade, 0);
};

const getControleVagasDisponivelDistribuicao = (
  distribuicao: ControleVagasDistribuicaoRow,
  reservas: ControleVagasReservaRow[] = controleVagasReservasMock,
) =>
  Math.max(
    distribuicao.quantidadeDistribuida -
      distribuicao.vagasOcupadas -
      getControleVagasReservadoDistribuicao(distribuicao, reservas),
    0,
  );

const getControleVagasResumoQuadro = (
  quadro: ControleVagasQuadroAutorizadoRow,
  distribuicoes: ControleVagasDistribuicaoRow[] = controleVagasDistribuicoesMock,
  reservas: ControleVagasReservaRow[] = controleVagasReservasMock,
): ControleVagasConsultaSaldoResumo => {
  const distribuicoesDoQuadro = distribuicoes.filter(
    (distribuicao) => distribuicao.quadroId === quadro.id,
  );
  const totalDistribuido = distribuicoesDoQuadro.reduce(
    (sum, distribuicao) => sum + distribuicao.quantidadeDistribuida,
    0,
  );
  const totalOcupado = distribuicoesDoQuadro.reduce(
    (sum, distribuicao) => sum + distribuicao.vagasOcupadas,
    0,
  );
  const totalReservado = distribuicoesDoQuadro.reduce(
    (sum, distribuicao) =>
      sum + getControleVagasReservadoDistribuicao(distribuicao, reservas),
    0,
  );

  return {
    quadroId: quadro.id,
    codigo: quadro.codigo,
    cargoFuncao: quadro.cargoFuncao,
    orgaoSetor: quadro.orgaoSetor,
    tipo: quadro.tipo,
    autorizado: quadro.quantidadeAutorizada,
    distribuido: totalDistribuido,
    naoDistribuido: Math.max(quadro.quantidadeAutorizada - totalDistribuido, 0),
    ocupado: totalOcupado,
    reservado: totalReservado,
    disponivel: Math.max(totalDistribuido - totalOcupado - totalReservado, 0),
    situacao: quadro.situacao,
  };
};

const getControleVagasValidacaoVagaNumerada = (
  vaga: ControleVagasVagaNumeradaRow,
) => {
  const quadro = controleVagasQuadroAutorizadoMock.find(
    (item) => item.id === vaga.quadroId,
  );
  const distribuicao = controleVagasDistribuicoesMock.find(
    (item) =>
      item.quadroId === vaga.quadroId && item.orgaoSetor === vaga.orgaoSetor,
  );

  if (!quadro) {
    return { label: "Sem quadro", className: "prototype-badge prototype-badge--danger" };
  }

  if (quadro.cargoFuncao !== vaga.cargoFuncao) {
    return { label: "Cargo divergente", className: "prototype-badge prototype-badge--warning" };
  }

  if (!distribuicao) {
    return {
      label: "Sem distribuição",
      className: "prototype-badge prototype-badge--warning",
    };
  }

  if (vaga.situacao === "Reservada") {
    const reservasAtivas = getControleVagasReservasAtivas(
      vaga.quadroId,
      vaga.orgaoSetor,
    );

    if (reservasAtivas.length === 0) {
      return {
        label: "Sem reserva ativa",
        className: "prototype-badge prototype-badge--warning",
      };
    }
  }

  return {
    label: "Compatível",
    className: "prototype-badge prototype-badge--success",
  };
};

const renderVagaNumeradaStatusBadge = (
  status: ControleVagasVagaNumeradaSituacao,
) => {
  const badgeClass = {
    Disponível: "prototype-badge prototype-badge--success",
    Ocupada: "prototype-badge prototype-badge--info",
    Reservada: "prototype-badge prototype-badge--warning",
    Bloqueada: "prototype-badge prototype-badge--danger",
    Agendada: "prototype-badge prototype-badge--secondary",
    Extinta: "prototype-badge prototype-badge--light",
  }[status];

  return <span className={badgeClass}>{status}</span>;
};

const getControleVagasDistribuicaoDaVaga = (
  vaga?: ControleVagasVagaNumeradaRow,
) => {
  if (!vaga) {
    return undefined;
  }

  return controleVagasDistribuicoesMock.find(
    (distribuicao) =>
      distribuicao.quadroId === vaga.quadroId &&
      distribuicao.orgaoSetor === vaga.orgaoSetor,
  );
};

const getControleVagasSaldoDistribuicaoSimulado = (
  distribuicao?: ControleVagasDistribuicaoRow,
  vagas: ControleVagasVagaNumeradaRow[] = controleVagasVagaNumeradaMock,
) => {
  if (!distribuicao) {
    return {
      autorizado: 0,
      ocupado: 0,
      reservado: 0,
      disponivel: 0,
    };
  }

  const ocupadasOriginais = controleVagasVagaNumeradaMock.filter(
    (vaga) =>
      vaga.quadroId === distribuicao.quadroId &&
      vaga.orgaoSetor === distribuicao.orgaoSetor &&
      vaga.situacao === "Ocupada",
  ).length;
  const ocupadasAtuais = vagas.filter(
    (vaga) =>
      vaga.quadroId === distribuicao.quadroId &&
      vaga.orgaoSetor === distribuicao.orgaoSetor &&
      vaga.situacao === "Ocupada",
  ).length;
  const ocupado =
    distribuicao.vagasOcupadas + ocupadasAtuais - ocupadasOriginais;
  const reservado = getControleVagasReservadoDistribuicao(distribuicao);

  return {
    autorizado: distribuicao.quantidadeDistribuida,
    ocupado,
    reservado,
    disponivel: Math.max(distribuicao.quantidadeDistribuida - ocupado - reservado, 0),
  };
};

const controleVagasModuleItems = [
  {
    id: "configuracao",
    title: "Configuração",
    description: "Define quais cargos e funções controlam vagas e quais critérios serão validados.",
    path: "/prototipos/sigep/controle-vagas/configuracao",
    icon: "pi pi-sliders-h",
  },
  {
    id: "quadro-autorizado",
    title: "Quadro Autorizado",
    description: "Cadastra o quantitativo autorizado, distribuições e reservas por cargo ou função.",
    path: "/prototipos/sigep/controle-vagas/quadro-autorizado",
    icon: "pi pi-table",
  },
  {
    id: "saldo",
    title: "Consulta de Saldo",
    description: "Exibe vagas autorizadas, ocupadas, reservadas e disponíveis por referência.",
    path: "/prototipos/sigep/controle-vagas/consulta-saldo",
    icon: "pi pi-chart-bar",
  },
  {
    id: "vagas-numeradas",
    title: "Vagas Numeradas",
    description: "Controla vagas individualizadas com código próprio e ocupação rastreável.",
    path: "/prototipos/sigep/controle-vagas/vagas-numeradas",
    icon: "pi pi-hashtag",
  },
  {
    id: "integracao",
    title: "Integração Funcional",
    description: "Simula validação, ocupação, liberação e registro de eventos funcionais.",
    path: "/prototipos/sigep/controle-vagas/integracao",
    icon: "pi pi-sync",
  },
  {
    id: "historico",
    title: "Histórico/Ocupação",
    description: "Consulta a linha do tempo de ocupações, reservas, liberações e alterações.",
    path: "/prototipos/sigep/controle-vagas/historico",
    icon: "pi pi-history",
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
  { label: "EM CORREÇÃO", value: "EM_CORRECAO" },
  { label: "CORRIGIDO", value: "CORRIGIDO" },
  { label: "DEVOLVIDO", value: "DEVOLVIDO" },
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

const solicitacaoAjusteFolhaSituacaoMeta: Record<
  SolicitacaoAjusteFolhaSituacao,
  { label: string; color: string; bg: string; border: string }
> = {
  NOVA: { label: "NOVA", color: "#005494", bg: "#e6f0f8", border: "#e6f0f8" },
  EM_CORRECAO: { label: "EM CORREÇÃO", color: "#8a5a00", bg: "#fff4d6", border: "#fff4d6" },
  CORRIGIDO: { label: "CORRIGIDO", color: "#334e9f", bg: "#e8edff", border: "#e8edff" },
  DEVOLVIDO: { label: "DEVOLVIDO", color: "#b42318", bg: "#fee4e2", border: "#fee4e2" },
  CONCLUIDO: { label: "CONCLUÍDO", color: "#00843d", bg: "#e2f3e8", border: "#e2f3e8" },
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
  ano: string;
  vigencia: ReactNode;
  situacao: "Ativo" | "Inativo";
}

interface FolhaTabelaReferenciaRow {
  id: number;
  sigla: string;
  nome: string;
  vigencias: FolhaTabelaReferenciaVigenciaRow[];
}

interface FolhaTabelaReferenciaVigenciaForm {
  descricao: string;
  anoBase: string;
  tetoPrevidenciario: string;
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
}

interface FolhaTabelaReferenciaNovaFaixaForm {
  faixaFinal: string;
  percentual: string;
}

const folhaTabelasReferenciaMock: FolhaTabelaReferenciaRow[] = [
  {
    id: 1,
    sigla: "INSS",
    nome: "INSTITUTO NACIONAL DO SEGURO SOCIAL",
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
        ano: "2026",
        vigencia: (
          <>
            01/01/2026 até <em>vigente</em>
          </>
        ),
        situacao: "Ativo",
      },
    ],
  },
  {
    id: 4,
    sigla: "SALÁRIO MÍNIMO",
    nome: "",
    vigencias: [
      {
        id: 401,
        ano: "2026",
        vigencia: (
          <>
            01/01/2026 até <em>vigente</em>
          </>
        ),
        situacao: "Ativo",
      },
    ],
  },
  {
    id: 5,
    sigla: "SALÁRIO FAMÍLIA",
    nome: "",
    vigencias: [
      {
        id: 501,
        ano: "2026",
        vigencia: (
          <>
            01/01/2026 até <em>vigente</em>
          </>
        ),
        situacao: "Ativo",
      },
    ],
  },
];

const folhaTabelaReferenciaFaixasMock: FolhaTabelaReferenciaFaixaRow[] = [
  {
    id: 1,
    ordem: 1,
    faixaInicial: "R$ 0,01",
    faixaFinal: "R$ 1.621,00",
    percentual: "7,5",
    contribuicaoFaixa: "R$ 121,58",
  },
  {
    id: 2,
    ordem: 2,
    faixaInicial: "R$ 1.621,01",
    faixaFinal: "R$ 2.902,84",
    percentual: "9",
    contribuicaoFaixa: "R$ 115,37",
  },
  {
    id: 3,
    ordem: 3,
    faixaInicial: "R$ 2.902,85",
    faixaFinal: "R$ 4.354,27",
    percentual: "12",
    contribuicaoFaixa: "R$ 174,17",
  },
  {
    id: 4,
    ordem: 4,
    faixaInicial: "R$ 4.354,28",
    faixaFinal: "R$ 8.475,55",
    percentual: "14",
    contribuicaoFaixa: "R$ 576,98",
  },
];

const folhaTabelaReferenciaVigenciaTabs: TabItemSeplag[] = [
  { label: "Dados Gerais", value: "dados-gerais" },
  { label: "Faixa de Contribuição", value: "faixa-contribuicao" },
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
  if (!ultimaFaixa) return "R$ 0,01";

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
    inicioVigencia: "01/2026",
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
    inicioVigencia: "01/2026",
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
    inicioVigencia: "01/2026",
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
    inicioVigencia: "01/2026",
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
    inicioVigencia: "06/2026",
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
    inicioVigencia: "01/2025",
    fimVigencia: "12/2025",
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
    inicioVigencia: "02/2026",
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
    inicioVigencia: "01/2026",
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
    inicioVigencia: "03/2026",
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
    inicioVigencia: "01/2025",
    fimVigencia: "04/2026",
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
      inicioVigencia: "01/2025",
      fimVigencia: "12/2025",
      rubricas: 39,
    },
  ],
  2: [
    gruposCalculoMock[1],
    {
      ...gruposCalculoMock[1],
      codigo: "G010-V1",
      situacao: "ENCERRADO",
      inicioVigencia: "01/2025",
      fimVigencia: "12/2025",
      rubricas: 31,
    },
  ],
  3: [
    gruposCalculoMock[2],
    {
      ...gruposCalculoMock[2],
      codigo: "G011-V2",
      situacao: "ATIVO",
      inicioVigencia: "01/2026",
      fimVigencia: "05/2026",
      rubricas: 36,
      pendencias: 0,
    },
    {
      ...gruposCalculoMock[2],
      codigo: "G011-V1",
      situacao: "ENCERRADO",
      inicioVigencia: "03/2025",
      fimVigencia: "12/2025",
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
      inicioVigencia: "01/2025",
      fimVigencia: "12/2025",
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

function renderControleVagasSituacaoBadge(
  situacao: ControleVagasConfiguracaoRow["situacao"],
) {
  const meta = {
    Ativo: { color: "#00843d", bg: "#dff3e7" },
    Agendado: { color: "#8a5a00", bg: "#fff4d6" },
    Encerrado: { color: "#6b7280", bg: "#f1f5f9" },
    Inativo: { color: "#6b7280", bg: "#eef2f7" },
  }[situacao];

  return (
    <span
      className="prototype-sistema-status-badge"
      style={{ color: meta.color, backgroundColor: meta.bg, borderColor: meta.bg }}
    >
      {situacao}
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

const controleVagasTipoOptions = [
  { label: "Todos", value: "" },
  { label: "Cargo", value: "Cargo" },
  { label: "Função", value: "Função" },
];

const controleVagasSimNaoOptions = [
  { label: "Todos", value: "" },
  { label: "Sim", value: "Sim" },
  { label: "Não", value: "Não" },
];

const controleVagasTipoControleOptions = [
  { label: "Todos", value: "" },
  { label: "Quantitativo", value: "Quantitativo" },
  { label: "Numerado", value: "Numerado" },
  { label: "Híbrido", value: "Híbrido" },
];

const controleVagasSituacaoOptions = [
  { label: "Todas", value: "" },
  { label: "Ativo", value: "Ativo" },
  { label: "Agendado", value: "Agendado" },
  { label: "Encerrado", value: "Encerrado" },
  { label: "Inativo", value: "Inativo" },
];

const controleVagasStatusOperacionalOptions = [
  { label: "Todas", value: "" },
  ...regimeSituacaoOptions,
];

const controleVagasTipoFormOptions = controleVagasTipoOptions.filter(
  (option) => option.value,
);

const controleVagasSimNaoFormOptions = controleVagasSimNaoOptions.filter(
  (option) => option.value,
);

const controleVagasTipoControleFormOptions =
  controleVagasTipoControleOptions.filter((option) => option.value);

const controleVagasCargoFuncaoOptions = [
  { label: "Analista Administrativo", value: "Analista Administrativo" },
  { label: "Técnico Administrativo", value: "Técnico Administrativo" },
  { label: "Coordenador", value: "Coordenador" },
  { label: "Professor da Educação Básica", value: "Professor da Educação Básica" },
  { label: "Assessor Técnico", value: "Assessor Técnico" },
  { label: "Gestor Governamental", value: "Gestor Governamental" },
];

const controleVagasOrgaoSetorOptions = [
  { label: "Todos", value: "Todos" },
  { label: "SEPLAG-MT", value: "SEPLAG-MT" },
  { label: "SEDUC-MT", value: "SEDUC-MT" },
  { label: "PGE-MT", value: "PGE-MT" },
  { label: "CGE-MT", value: "CGE-MT" },
];

const controleVagasDistribuicaoOrgaoSetorOptions = [
  { label: "SEPLAG-MT / Superintendência de Gestão de Pessoas", value: "SEPLAG-MT / Superintendência de Gestão de Pessoas" },
  { label: "SEPLAG-MT / Coordenadoria de Provimento", value: "SEPLAG-MT / Coordenadoria de Provimento" },
  { label: "SEPLAG-MT / Coordenadoria de Carreiras", value: "SEPLAG-MT / Coordenadoria de Carreiras" },
  { label: "SEDUC-MT / Diretoria Regional Norte", value: "SEDUC-MT / Diretoria Regional Norte" },
  { label: "SEDUC-MT / Diretoria Regional Sul", value: "SEDUC-MT / Diretoria Regional Sul" },
  { label: "PGE-MT / Procuradoria Administrativa", value: "PGE-MT / Procuradoria Administrativa" },
  { label: "PGE-MT / Procuradoria Judicial", value: "PGE-MT / Procuradoria Judicial" },
  { label: "CGE-MT / Auditoria Geral", value: "CGE-MT / Auditoria Geral" },
];

const controleVagasReservaTipoOptions = [
  { label: "Reserva por Processo Seletivo", value: "Processo Seletivo" },
  { label: "Reserva de Reposição", value: "Reposição" },
  { label: "Reserva de Retenção", value: "Retenção" },
  { label: "Reserva Estratégica", value: "Estratégica" },
];

const controleVagasReservaSituacaoOptions = [
  { label: "Ativa", value: "Ativa" },
  { label: "Cancelada", value: "Cancelada" },
  { label: "Encerrada", value: "Encerrada" },
];

const controleVagasConfiguracaoTabs: TabItemSeplag<string>[] = [
  { label: "Detalhes", value: "detalhes" },
  { label: "Critérios de Compatibilidade", value: "criterios" },
  { label: "Histórico", value: "historico" },
];

const controleVagasConsultaSaldoTabs: TabItemSeplag<string>[] = [
  { label: "Por Quadro", value: "por-quadro" },
  { label: "Por Distribuição", value: "por-distribuicao" },
  { label: "Reservadas", value: "reservadas" },
  { label: "Ocupadas", value: "ocupadas" },
  { label: "Disponíveis", value: "disponiveis" },
];

const controleVagasVagaNumeradaTabs: TabItemSeplag<string>[] = [
  { label: "Detalhes", value: "detalhes" },
  { label: "Ocupação Atual", value: "ocupacao-atual" },
  { label: "Histórico", value: "historico" },
];

const controleVagasQuadroAutorizadoTabs: TabItemSeplag<string>[] = [
  { label: "Dados Gerais", value: "dados-gerais" },
  { label: "Distribuições", value: "distribuicoes" },
  { label: "Reservas", value: "reservas" },
  { label: "Histórico", value: "historico" },
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
  const [documentosSelecionados, setDocumentosSelecionados] = useState<string[]>(
    ["lei-12345-2023", "decreto-456-2024"],
  );

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
            options={documentosLegaisMock}
            value={documentosSelecionados}
            onChange={setDocumentosSelecionados}
            onNovoCadastro={() => {}}
            onVisualizar={() => {}}
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
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    />
  );
}

export function PrototiposControleVagasPage() {
  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag
          title="Controle de Vagas"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
          legenda={() => (
            <p className="prototype-card-description">
              Selecione uma área para configurar, consultar ou acompanhar o controle de vagas do SIGEP.
            </p>
          )}
        >
          <div className="prototype-module-card-grid">
            {controleVagasModuleItems.map((item) => {
              const content = (
                <article
                  className={`prototype-module-card${
                    item.path ? "" : " is-disabled"
                  }`}
                >
                  <div className="prototype-module-card-icon" aria-hidden="true">
                    <i className={item.icon} />
                  </div>
                  <div className="prototype-module-card-body">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <i className="pi pi-arrow-right prototype-module-card-action" aria-hidden="true" />
                </article>
              );

              return item.path ? (
                <Link
                  key={item.id}
                  to={item.path}
                  className="prototype-module-card-link"
                >
                  {content}
                </Link>
              ) : (
                <div key={item.id} className="prototype-module-card-link">
                  {content}
                </div>
              );
            })}
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposControleVagasConfiguracaoPage() {
  const navigate = useNavigate();
  const { control, reset, watch } =
    useForm<ControleVagasConfiguracaoFiltroForm>({
      defaultValues: {
        cargoFuncao: "",
        tipo: "",
        controlaVaga: "",
        tipoControle: "",
        situacao: "",
      },
    });
  const filtros = watch();
  const termoBusca = filtros.cargoFuncao?.trim().toLowerCase();
  const configuracoesFiltradas = controleVagasConfiguracoesMock.filter(
    (configuracao) => {
      const atendeCargoFuncao =
        !termoBusca ||
        configuracao.codigo.toLowerCase().includes(termoBusca) ||
        configuracao.cargoFuncao.toLowerCase().includes(termoBusca);
      const atendeTipo = !filtros.tipo || configuracao.tipo === filtros.tipo;
      const atendeControla =
        !filtros.controlaVaga ||
        configuracao.controlaVaga === filtros.controlaVaga;
      const atendeTipoControle =
        !filtros.tipoControle ||
        configuracao.tipoControle === filtros.tipoControle;
      const atendeSituacao =
        !filtros.situacao || configuracao.situacao === filtros.situacao;

      return (
        atendeCargoFuncao &&
        atendeTipo &&
        atendeControla &&
        atendeTipoControle &&
        atendeSituacao
      );
    },
  );
  const configuracaoResults = createResults(configuracoesFiltradas);
  const configuracaoColumns: ColumnMetaSeplag<ControleVagasConfiguracaoRow>[] = [
    { field: "tipo", header: "Tipo" },
    { field: "codigo", header: "Código" },
    { field: "cargoFuncao", header: "Cargo/Função" },
    { field: "controlaVaga", header: "Controla Vaga" },
    { field: "tipoControle", header: "Tipo de Controle" },
    { field: "dataInicio", header: "Data Início" },
    {
      header: "Critérios",
      body: (row) => row.criterios.join(", "),
    },
    {
      header: "Situação",
      body: (row) => renderControleVagasSituacaoBadge(row.situacao),
    },
    { field: "ultimaAlteracao", header: "Última Alteração" },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag
          title="Configuração de Controle de Vagas"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="prototype-category-filters prototype-controle-vagas-filters grid">
            <TextFieldSeplag
              name="cargoFuncao"
              control={control}
              label="Cargo/Função"
              placeholder="Código ou descrição"
              cols="12 12 4"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="tipo"
              control={control}
              label="Tipo"
              cols="12 6 2"
              options={controleVagasTipoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="controlaVaga"
              control={control}
              label="Controla Vaga"
              cols="12 6 2"
              options={controleVagasSimNaoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="tipoControle"
              control={control}
              label="Tipo de Controle"
              cols="12 6 2"
              options={controleVagasTipoControleOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="situacao"
              control={control}
              label="Situação"
              cols="12 6 2"
              options={controleVagasSituacaoOptions}
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
                    cargoFuncao: "",
                    tipo: "",
                    controlaVaga: "",
                    tipoControle: "",
                    situacao: "",
                  })
                }
              />
            </div>
          </div>

          <div className="prototype-controle-vagas-table">
            <TablePaginadoSeplag
              dataKey="id"
              data={configuracaoResults}
              rows={10}
              rowsPerPage={[10]}
              paginator
              lazy={false}
              selectionMode={null}
              columns={configuracaoColumns}
              hasEventoAcao
              handleAdicionar={() =>
                navigate("/prototipos/sigep/controle-vagas/configuracao/novo")
              }
              handleView={(row) =>
                navigate(
                  `/prototipos/sigep/controle-vagas/configuracao/${row.id}/editar`,
                )
              }
              handleEdit={(row) =>
                navigate(
                  `/prototipos/sigep/controle-vagas/configuracao/${row.id}/editar`,
                )
              }
              handleInativar={() => {}}
              handleOnPageChange={() => {}}
            />
          </div>

          <div className="prototype-form-actions">
            <BotaoVoltarSeplag
              type="button"
              label="Voltar"
              icon="pi pi-arrow-left"
              onClick={() => navigate("/prototipos/sigep/controle-vagas")}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposControleVagasQuadroAutorizadoPage() {
  const navigate = useNavigate();
  const { control, reset, watch } =
    useForm<ControleVagasQuadroAutorizadoFiltroForm>({
      defaultValues: {
        cargoFuncao: "",
        orgaoSetor: "",
        tipo: "",
        situacao: "",
      },
    });
  const filtros = watch();
  const termoBusca = filtros.cargoFuncao?.trim().toLowerCase();
  const quadroFiltrado = controleVagasQuadroAutorizadoMock.filter((quadro) => {
    const atendeCargoFuncao =
      !termoBusca ||
      quadro.codigo.toLowerCase().includes(termoBusca) ||
      quadro.cargoFuncao.toLowerCase().includes(termoBusca);
    const atendeOrgaoSetor =
      !filtros.orgaoSetor || quadro.orgaoSetor === filtros.orgaoSetor;
    const atendeTipo = !filtros.tipo || quadro.tipo === filtros.tipo;
    const atendeSituacao =
      !filtros.situacao || quadro.situacao === filtros.situacao;

    return atendeCargoFuncao && atendeOrgaoSetor && atendeTipo && atendeSituacao;
  });
  const quadroResults = createResults(quadroFiltrado);
  const quadroColumns: ColumnMetaSeplag<ControleVagasQuadroAutorizadoRow>[] = [
    { field: "codigo", header: "Código" },
    { field: "cargoFuncao", header: "Cargo/Função" },
    { field: "orgaoSetor", header: "Órgão/Setor" },
    { field: "tipo", header: "Tipo" },
    { field: "quantidadeAutorizada", header: "Autorizadas" },
    { field: "vagasOcupadas", header: "Ocupadas" },
    { field: "vagasReservadas", header: "Reservadas" },
    { field: "vagasDisponiveis", header: "Disponíveis" },
    {
      header: "Situação",
      body: (row) => renderGrupoCalculoStatusBadge(row.situacao),
    },
    { field: "inicioVigencia", header: "Início Vigência" },
    { field: "atoLegal", header: "Ato Legal" },
  ];

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag
          title="Quadro Autorizado de Vagas"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="prototype-category-filters prototype-controle-vagas-filters prototype-controle-vagas-quadro-filters grid">
            <TextFieldSeplag
              name="cargoFuncao"
              control={control}
              label="Cargo/Função"
              placeholder="Código ou descrição"
              cols="12 12 4"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="orgaoSetor"
              control={control}
              label="Órgão/Setor"
              cols="12 6 2"
              options={controleVagasOrgaoSetorOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="tipo"
              control={control}
              label="Tipo"
              cols="12 6 2"
              options={controleVagasTipoOptions}
              optionLabel="label"
              optionValue="value"
              getFormErrorMessage={() => null}
            />
            <DropdownFieldSeplag
              name="situacao"
              control={control}
              label="Situação"
              cols="12 6 2"
              options={controleVagasStatusOperacionalOptions}
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
                    cargoFuncao: "",
                    orgaoSetor: "",
                    tipo: "",
                    situacao: "",
                  })
                }
              />
            </div>
          </div>

          <div className="prototype-controle-vagas-table prototype-controle-vagas-quadro-table">
            <TablePaginadoSeplag
              dataKey="id"
              data={quadroResults}
              rows={10}
              rowsPerPage={[10]}
              paginator
              lazy={false}
              selectionMode={null}
              columns={quadroColumns}
              hasEventoAcao
              handleAdicionar={() =>
                navigate(
                  "/prototipos/sigep/controle-vagas/quadro-autorizado/novo",
                )
              }
              handleView={(row) =>
                navigate(
                  `/prototipos/sigep/controle-vagas/quadro-autorizado/${row.id}/editar`,
                )
              }
              handleEdit={(row) =>
                navigate(
                  `/prototipos/sigep/controle-vagas/quadro-autorizado/${row.id}/editar`,
                )
              }
              handleInativar={() => {}}
              handleOnPageChange={() => {}}
            />
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposControleVagasQuadroAutorizadoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const quadro = controleVagasQuadroAutorizadoMock.find(
    (item) => String(item.id) === id,
  );
  const isEditing = Boolean(id);
  const [activeTab, setActiveTab] = useState("dados-gerais");
  const [documentosSelecionados, setDocumentosSelecionados] = useState<string[]>(
    quadro ? ["lei-12345-2023", "decreto-456-2024"] : [],
  );
  const [distribuicoes, setDistribuicoes] = useState<ControleVagasDistribuicaoRow[]>(
    () =>
      quadro
        ? controleVagasDistribuicoesMock.filter(
            (distribuicao) => distribuicao.quadroId === quadro.id,
          )
        : [],
  );
  const [reservas, setReservas] = useState<ControleVagasReservaRow[]>(
    () =>
      quadro
        ? controleVagasReservasMock.filter((reserva) => reserva.quadroId === quadro.id)
        : [],
  );
  const [editingReservaId, setEditingReservaId] = useState<number | null>(null);

  const { control, setValue, watch } = useForm<ControleVagasQuadroAutorizadoForm>({
    defaultValues: {
      codigo: quadro?.codigo ?? "",
      cargoFuncao: quadro?.cargoFuncao ?? "",
      orgaoSetor: quadro?.orgaoSetor ?? "",
      tipo: quadro?.tipo ?? "",
      quantidadeAutorizada: quadro?.quantidadeAutorizada ?? undefined,
      processoSei: quadro ? "00000.000000/2026-00" : "",
      observacao: "",
      situacao: mapGrupoCalculoSituacao(quadro?.situacao) ?? SITUACAO_VIGENCIA.ATIVO,
      dataAtivacao: quadro?.inicioVigencia ?? "01/06/2026",
      dataEncerramento: "",
      motivoEncerramento: "",
      dataExtincao: "",
      motivoExtincao: "",
    },
  });

  const {
    control: distribuicaoControl,
    getValues: getDistribuicaoValues,
    reset: resetDistribuicao,
  } = useForm<ControleVagasDistribuicaoForm>({
    defaultValues: {
      orgaoSetor: "",
      quantidadeDistribuida: undefined,
      observacao: "",
    },
  });

  const {
    control: reservaControl,
    getValues: getReservaValues,
    reset: resetReserva,
    setValue: setReservaValue,
  } = useForm<ControleVagasReservaForm>({
    defaultValues: {
      tipoReserva: "Processo Seletivo",
      orgaoSetor: "",
      quantidade: undefined,
      motivo: "",
      dataInicio: "",
      dataFim: "",
      situacao: "Ativa",
      observacao: "",
    },
  });

  const quantidadeAutorizada = Number(watch("quantidadeAutorizada") ?? 0);
  const totalDistribuido = distribuicoes.reduce(
    (total, distribuicao) => total + distribuicao.quantidadeDistribuida,
    0,
  );

  const totalOcupado = distribuicoes.reduce(
    (total, distribuicao) => total + distribuicao.vagasOcupadas,
    0,
  );
  const totalReservado = distribuicoes.reduce(
    (total, distribuicao) =>
      total + getControleVagasReservadoDistribuicao(distribuicao, reservas),
    0,
  );
  const totalDisponivel = distribuicoes.reduce(
    (total, distribuicao) =>
      total + getControleVagasDisponivelDistribuicao(distribuicao, reservas),
    0,
  );
  const totalNaoDistribuido = Math.max(quantidadeAutorizada - totalDistribuido, 0);

  const totalReservasAtivas = reservas
    .filter((reserva) => reserva.situacao === "Ativa")
    .reduce((total, reserva) => total + reserva.quantidade, 0);
  const totalReservasCanceladas = reservas
    .filter((reserva) => reserva.situacao === "Cancelada")
    .reduce((total, reserva) => total + reserva.quantidade, 0);
  const totalReservasEncerradas = reservas
    .filter((reserva) => reserva.situacao === "Encerrada")
    .reduce((total, reserva) => total + reserva.quantidade, 0);
  const disponivelAposReservas = totalDisponivel;

  const syncReservaComDistribuicao = (
    reserva: ControleVagasReservaRow,
    delta: number,
  ) => {
    if (!reserva.orgaoSetor) return;

    setDistribuicoes((current) =>
      current.map((distribuicao) => {
        if (distribuicao.orgaoSetor !== reserva.orgaoSetor) return distribuicao;
        return {
          ...distribuicao,
          vagasReservadas: Math.max(distribuicao.vagasReservadas + delta, 0),
        };
      }),
    );
  };

  const handleAdicionarDistribuicao = () => {
    const values = getDistribuicaoValues();
    const quantidade = Number(values.quantidadeDistribuida ?? 0);

    if (!values.orgaoSetor || quantidade <= 0) return;

    setDistribuicoes((current) => [
      ...current,
      {
        id: Date.now(),
        quadroId: quadro?.id ?? 0,
        orgaoSetor: values.orgaoSetor ?? "",
        quantidadeDistribuida: quantidade,
        vagasOcupadas: 0,
        vagasReservadas: 0,
        observacao: values.observacao ?? "Distribuição adicionada no protótipo.",
        situacao: STATUS_OPERACIONAL_VIGENCIA.AGENDADO,
      },
    ]);
    resetDistribuicao({
      orgaoSetor: "",
      quantidadeDistribuida: undefined,
      observacao: "",
    });
  };

  const handleRemoverDistribuicao = (idDistribuicao: number) => {
    setDistribuicoes((current) =>
      current.filter((distribuicao) => distribuicao.id !== idDistribuicao),
    );
  };

  const handleAdicionarReserva = () => {
    const values = getReservaValues();
    const quantidade = Number(values.quantidade ?? 0);

    if (!values.tipoReserva || !values.orgaoSetor || quantidade <= 0) return;

    const novaReserva: ControleVagasReservaRow = {
      id: editingReservaId ?? Date.now(),
      quadroId: quadro?.id ?? 0,
      tipoReserva: values.tipoReserva,
      orgaoSetor: values.orgaoSetor,
      quantidade,
      motivo: values.motivo ?? "",
      dataInicio: values.dataInicio ?? "",
      dataFim: values.dataFim,
      situacao: values.situacao ?? "Ativa",
      observacao: values.observacao ?? "",
    };

    setReservas((current) => {
      if (editingReservaId) {
        const reservaAnterior = current.find((item) => item.id === editingReservaId);
        if (reservaAnterior && reservaAnterior.situacao === "Ativa") {
          syncReservaComDistribuicao(reservaAnterior, -reservaAnterior.quantidade);
        }

        const atualizadas = current.map((item) =>
          item.id === editingReservaId ? novaReserva : item,
        );
        if (novaReserva.situacao === "Ativa") {
          syncReservaComDistribuicao(novaReserva, novaReserva.quantidade);
        }
        return atualizadas;
      }

      if (novaReserva.situacao === "Ativa") {
        syncReservaComDistribuicao(novaReserva, novaReserva.quantidade);
      }
      return [...current, novaReserva];
    });

    setEditingReservaId(null);
    resetReserva({
      tipoReserva: "Processo Seletivo",
      orgaoSetor: "",
      quantidade: undefined,
      motivo: "",
      dataInicio: "",
      dataFim: "",
      situacao: "Ativa",
      observacao: "",
    });
  };

  const handleEditarReserva = (reserva: ControleVagasReservaRow) => {
    setEditingReservaId(reserva.id);
    setReservaValue("tipoReserva", reserva.tipoReserva);
    setReservaValue("orgaoSetor", reserva.orgaoSetor);
    setReservaValue("quantidade", reserva.quantidade);
    setReservaValue("motivo", reserva.motivo);
    setReservaValue("dataInicio", reserva.dataInicio);
    setReservaValue("dataFim", reserva.dataFim ?? "");
    setReservaValue("situacao", reserva.situacao);
    setReservaValue("observacao", reserva.observacao);
  };

  const handleAlterarSituacaoReserva = (
    reservaId: number,
    situacao: ControleVagasReservaStatus,
  ) => {
    setReservas((current) =>
      current.map((reserva) => {
        if (reserva.id !== reservaId) return reserva;
        if (reserva.situacao === "Ativa" && situacao !== "Ativa") {
          syncReservaComDistribuicao(reserva, -reserva.quantidade);
        }
        return {
          ...reserva,
          situacao,
        };
      }),
    );
  };

  const renderReservaStatusBadge = (status: ControleVagasReservaStatus) => {
    const badgeClass = {
      Ativa: "prototype-badge prototype-badge--success",
      Cancelada: "prototype-badge prototype-badge--warning",
      Encerrada: "prototype-badge prototype-badge--danger",
    }[status];

    return <span className={badgeClass}>{status}</span>;
  };

  const renderVagaNumeradaStatusBadge = (status: ControleVagasVagaNumeradaSituacao) => {
    const badgeClass = {
      Disponível: "prototype-badge prototype-badge--success",
      Ocupada: "prototype-badge prototype-badge--info",
      Reservada: "prototype-badge prototype-badge--warning",
      Bloqueada: "prototype-badge prototype-badge--danger",
      Agendada: "prototype-badge prototype-badge--secondary",
      Extinta: "prototype-badge prototype-badge--light",
    }[status];

    return <span className={badgeClass}>{status}</span>;
  };

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag
          title={`${isEditing ? "Alterar" : "Cadastrar"} - Quadro Autorizado de Vagas`}
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="prototype-controle-vagas-form prototype-controle-vagas-quadro-form">
            <TabsSeplag
              items={controleVagasQuadroAutorizadoTabs}
              activeValue={activeTab}
              onChange={setActiveTab}
              equalWidth
            />

            {activeTab === "dados-gerais" && (
              <div className="grid prototype-controle-vagas-form-section">
                <TextFieldSeplag
                  name="codigo"
                  control={control}
                  label="Código"
                  cols="12 12 2"
                  placeholder="Ex.: QA-001"
                  getFormErrorMessage={() => null}
                />
                <DropdownFieldSeplag
                  name="tipo"
                  control={control}
                  label="Tipo"
                  cols="12 12 2"
                  options={controleVagasTipoFormOptions}
                  optionLabel="label"
                  optionValue="value"
                  required
                  getFormErrorMessage={() => null}
                />
                <DropdownFieldSeplag
                  name="cargoFuncao"
                  control={control}
                  label="Cargo/Função"
                  cols="12 12 4"
                  options={controleVagasCargoFuncaoOptions}
                  optionLabel="label"
                  optionValue="value"
                  required
                  getFormErrorMessage={() => null}
                />
                <DropdownFieldSeplag
                  name="orgaoSetor"
                  control={control}
                  label="Órgão/Setor"
                  cols="12 12 4"
                  options={controleVagasOrgaoSetorOptions}
                  optionLabel="label"
                  optionValue="value"
                  required
                  getFormErrorMessage={() => null}
                />
                <NumberFieldSeplag
                  name="quantidadeAutorizada"
                  control={control}
                  label="Quantidade Autorizada"
                  cols="12 12 3"
                  required
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="processoSei"
                  control={control}
                  label="Processo SEI"
                  cols="12 12 3"
                  placeholder="00000.000000/0000-00"
                  getFormErrorMessage={() => null}
                />
                <TextAreaFieldSeplag
                  name="observacao"
                  control={control}
                  label="Observação"
                  cols="12"
                  rows={3}
                  maxLength={500}
                  getFormErrorMessage={() => null}
                />
                <div className="col-12 prototype-controle-vagas-quadro-vigencia">
                  <SituacaoVigenciaSeplag<ControleVagasQuadroAutorizadoForm>
                    control={control}
                    setValue={setValue}
                    rotuloDataAtivacao="Início da Vigência"
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
                <div className="col-12 prototype-controle-vagas-documentos">
                  <DocumentosLegaisAssociadosSeplag
                    required
                    options={documentosLegaisMock}
                    value={documentosSelecionados}
                    onChange={setDocumentosSelecionados}
                    onNovoCadastro={() => {}}
                    onVisualizar={() => {}}
                  />
                </div>
              </div>
            )}

            {activeTab === "distribuicoes" && (
              <div className="prototype-controle-vagas-distribuicoes">
                <div className="prototype-controle-vagas-section-title">
                  <h3>Distribuições do Quadro</h3>
                  <p>
                    Distribua o quantitativo autorizado entre órgãos e setores e
                    acompanhe o saldo calculado para o protótipo.
                  </p>
                </div>

                <div className="prototype-controle-vagas-quadro-summary">
                  <div>
                    <span>Autorizado</span>
                    <strong>{quantidadeAutorizada}</strong>
                  </div>
                  <div>
                    <span>Distribuído</span>
                    <strong>{totalDistribuido}</strong>
                  </div>
                  <div>
                    <span>Não distribuído</span>
                    <strong>{totalNaoDistribuido}</strong>
                  </div>
                  <div>
                    <span>Ocupado</span>
                    <strong>{totalOcupado}</strong>
                  </div>
                  <div>
                    <span>Reservado</span>
                    <strong>{totalReservado}</strong>
                  </div>
                  <div>
                    <span>Disponível</span>
                    <strong>{totalDisponivel}</strong>
                  </div>
                </div>

                <div className="prototype-controle-vagas-distribuicao-form">
                  <div className="prototype-controle-vagas-section-title">
                    <h3>Nova Distribuição</h3>
                  </div>
                  <div className="grid prototype-controle-vagas-form-section">
                    <DropdownFieldSeplag
                      name="orgaoSetor"
                      control={distribuicaoControl}
                      label="Órgão/Setor"
                      cols="12 12 4"
                      options={controleVagasDistribuicaoOrgaoSetorOptions}
                      optionLabel="label"
                      optionValue="value"
                      getFormErrorMessage={() => null}
                    />
                    <NumberFieldSeplag
                      name="quantidadeDistribuida"
                      control={distribuicaoControl}
                      label="Quantidade Distribuída"
                      cols="12 12 3"
                      getFormErrorMessage={() => null}
                    />
                    <TextFieldSeplag
                      name="observacao"
                      control={distribuicaoControl}
                      label="Observação"
                      cols="12 12 3"
                      placeholder="Descrição curta"
                      getFormErrorMessage={() => null}
                    />
                    <div className="prototype-controle-vagas-distribuicao-action col-12 md:col-12 lg:col-2">
                      <BotaoSeplag
                        type="button"
                        label="Adicionar"
                        icon="pi pi-plus"
                        onClick={handleAdicionarDistribuicao}
                      />
                    </div>
                  </div>
                </div>

                <div className="prototype-table-wrapper">
                  <table className="prototype-simple-table prototype-controle-vagas-distribuicoes-table">
                    <thead>
                      <tr>
                        <th>Órgão/Setor</th>
                        <th>Distribuído</th>
                        <th>Ocupado</th>
                        <th>Reservado</th>
                        <th>Disponível</th>
                        <th>Situação</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {distribuicoes.length > 0 ? (
                        distribuicoes.map((distribuicao) => {
                          const reservado = getControleVagasReservadoDistribuicao(
                            distribuicao,
                            reservas,
                          );
                          const disponivel = getControleVagasDisponivelDistribuicao(
                            distribuicao,
                            reservas,
                          );

                          return (
                            <tr key={distribuicao.id}>
                              <td>
                                <strong>{distribuicao.orgaoSetor}</strong>
                                <small>{distribuicao.observacao}</small>
                              </td>
                              <td>{distribuicao.quantidadeDistribuida}</td>
                              <td>{distribuicao.vagasOcupadas}</td>
                              <td>{reservado}</td>
                              <td>{disponivel}</td>
                              <td>{renderGrupoCalculoStatusBadge(distribuicao.situacao)}</td>
                              <td>
                                <div className="prototype-controle-vagas-row-actions">
                                  <BotaoIconSeplag
                                    type="button"
                                    icon="pi pi-pencil"
                                    onClick={() => {}}
                                  />
                                  <BotaoIconSeplag
                                    type="button"
                                    icon="pi pi-trash"
                                    severity="danger"
                                    onClick={() =>
                                      handleRemoverDistribuicao(distribuicao.id)
                                    }
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="prototype-empty-table-cell">
                            Nenhuma distribuição cadastrada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "reservas" && (
              <div className="prototype-controle-vagas-reservas">
                <div className="prototype-controle-vagas-section-title prototype-controle-vagas-section-title--split">
                  <div>
                    <h3>Reservas</h3>
                    <p>
                      Controle as reservas que impactam o saldo antes da ocupação definitiva.
                    </p>
                  </div>
                </div>

                <div className="prototype-controle-vagas-quadro-summary prototype-controle-vagas-quadro-summary--compact">
                  <div>
                    <span>Reservas Ativas</span>
                    <strong>{totalReservasAtivas}</strong>
                  </div>
                  <div>
                    <span>Reservas Canceladas</span>
                    <strong>{totalReservasCanceladas}</strong>
                  </div>
                  <div>
                    <span>Reservas Encerradas</span>
                    <strong>{totalReservasEncerradas}</strong>
                  </div>
                  <div>
                    <span>Disponível após reservas</span>
                    <strong>{disponivelAposReservas}</strong>
                  </div>
                </div>

                <div className="prototype-controle-vagas-reserva-form">
                  <div className="prototype-controle-vagas-section-title">
                    <h3>{editingReservaId ? "Editar Reserva" : "Nova Reserva"}</h3>
                  </div>
                  <div className="grid prototype-controle-vagas-form-section">
                    <DropdownFieldSeplag
                      name="tipoReserva"
                      control={reservaControl}
                      label="Tipo de Reserva"
                      cols="12 12 4"
                      options={controleVagasReservaTipoOptions}
                      optionLabel="label"
                      optionValue="value"
                      required
                      getFormErrorMessage={() => null}
                    />
                    <DropdownFieldSeplag
                      name="orgaoSetor"
                      control={reservaControl}
                      label="Órgão/Setor"
                      cols="12 12 4"
                      options={controleVagasDistribuicaoOrgaoSetorOptions}
                      optionLabel="label"
                      optionValue="value"
                      required
                      getFormErrorMessage={() => null}
                    />
                    <NumberFieldSeplag
                      name="quantidade"
                      control={reservaControl}
                      label="Quantidade"
                      cols="12 12 2"
                      required
                      getFormErrorMessage={() => null}
                    />
                    <DropdownFieldSeplag
                      name="situacao"
                      control={reservaControl}
                      label="Situação"
                      cols="12 12 2"
                      options={controleVagasReservaSituacaoOptions}
                      optionLabel="label"
                      optionValue="value"
                      getFormErrorMessage={() => null}
                    />
                    <TextFieldSeplag
                      name="motivo"
                      control={reservaControl}
                      label="Motivo"
                      cols="12 12 4"
                      placeholder="Motivo da reserva"
                      getFormErrorMessage={() => null}
                    />
                    <DateFieldSeplag
                      name="dataInicio"
                      control={reservaControl}
                      label="Data Início"
                      cols="12 12 2"
                      getFormErrorMessage={() => null}
                    />
                    <DateFieldSeplag
                      name="dataFim"
                      control={reservaControl}
                      label="Data Fim"
                      cols="12 12 2"
                      getFormErrorMessage={() => null}
                    />
                    <TextAreaFieldSeplag
                      name="observacao"
                      control={reservaControl}
                      label="Observação"
                      cols="12 12 4"
                      rows={3}
                      getFormErrorMessage={() => null}
                    />
                    <div className="prototype-controle-vagas-distribuicao-action col-12 md:col-12 lg:col-2">
                      <BotaoSeplag
                        type="button"
                        label={editingReservaId ? "Salvar Reserva" : "Adicionar Reserva"}
                        icon={editingReservaId ? "pi pi-save" : "pi pi-plus"}
                        onClick={handleAdicionarReserva}
                      />
                    </div>
                  </div>
                </div>

                <div className="prototype-table-wrapper">
                  <table className="prototype-simple-table prototype-controle-vagas-reservas-table">
                    <thead>
                      <tr>
                        <th>Tipo de Reserva</th>
                        <th>Órgão/Setor</th>
                        <th>Quantidade</th>
                        <th>Período</th>
                        <th>Situação</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservas.length > 0 ? (
                        reservas.map((reserva) => (
                          <tr key={reserva.id}>
                            <td>
                              <strong>{reserva.tipoReserva}</strong>
                              <small>{reserva.motivo}</small>
                            </td>
                            <td>{reserva.orgaoSetor}</td>
                            <td>{reserva.quantidade}</td>
                            <td>
                              {reserva.dataInicio}
                              {reserva.dataFim ? ` → ${reserva.dataFim}` : ""}
                            </td>
                            <td>{renderReservaStatusBadge(reserva.situacao)}</td>
                            <td>
                              <div className="prototype-controle-vagas-row-actions">
                                <BotaoIconSeplag
                                  type="button"
                                  icon="pi pi-pencil"
                                  title="Editar reserva"
                                  onClick={() => handleEditarReserva(reserva)}
                                />
                                <BotaoIconSeplag
                                  type="button"
                                  icon="pi pi-times"
                                  severity="warning"
                                  title="Cancelar reserva"
                                  onClick={() =>
                                    handleAlterarSituacaoReserva(reserva.id, "Cancelada")
                                  }
                                />
                                <BotaoIconSeplag
                                  type="button"
                                  icon="pi pi-check"
                                  severity="success"
                                  title="Encerrar reserva"
                                  onClick={() =>
                                    handleAlterarSituacaoReserva(reserva.id, "Encerrada")
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="prototype-empty-table-cell">
                            Nenhuma reserva cadastrada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "historico" && (
              <div className="prototype-controle-vagas-historico">
                <div className="prototype-controle-vagas-section-title">
                  <h3>Histórico do Quadro Autorizado</h3>
                  <p>
                    Registro somente leitura das alterações simuladas para este
                    quadro autorizado.
                  </p>
                </div>
                <div className="prototype-table-wrapper">
                  <table className="prototype-simple-table">
                    <thead>
                      <tr>
                        <th>Data/Hora</th>
                        <th>Evento</th>
                        <th>Usuário</th>
                        <th>Detalhe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {controleVagasQuadroHistoricoMock.map((item) => (
                        <tr key={item.id}>
                          <td>{item.dataHora}</td>
                          <td>{item.evento}</td>
                          <td>{item.usuario}</td>
                          <td>{item.detalhe}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="prototype-form-actions">
              <BotaoVoltarSeplag
                type="button"
                label="Voltar"
                icon="pi pi-arrow-left"
                onClick={() =>
                  navigate("/prototipos/sigep/controle-vagas/quadro-autorizado")
                }
              />
              <BotaoSalvarSeplag type="button" label="Salvar" />
            </div>
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposControleVagasConsultaSaldoPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("por-quadro");
  const [dataReferencia, setDataReferencia] = useState<string>("29/05/2026");
  const { control, watch, reset } = useForm<ControleVagasConsultaSaldoFiltroForm>({
    defaultValues: {
      dataReferencia: "29/05/2026",
      cargoFuncao: "",
      orgaoSetor: "",
      tipo: "",
      situacao: "",
    },
  });
  const filtros = watch();
  const dataReferenciaSelecionada = filtros.dataReferencia ?? dataReferencia;

  const quadrosComResumo: ControleVagasConsultaSaldoResumo[] =
    controleVagasQuadroAutorizadoMock
      .map((quadro) => getControleVagasResumoQuadro(quadro))
      .filter((quadro) => {
        const cargoOk = !filtros.cargoFuncao || quadro.cargoFuncao === filtros.cargoFuncao;
        const orgaoOk = !filtros.orgaoSetor || quadro.orgaoSetor === filtros.orgaoSetor;
        const tipoOk = !filtros.tipo || quadro.tipo === filtros.tipo;
        const situacaoOk = !filtros.situacao || quadro.situacao === filtros.situacao;

        return cargoOk && orgaoOk && tipoOk && situacaoOk;
      });

  const totalAutorizado = quadrosComResumo.reduce((sum, q) => sum + q.autorizado, 0);
  const totalDistribuido = quadrosComResumo.reduce((sum, q) => sum + q.distribuido, 0);
  const totalNaoDistribuido = quadrosComResumo.reduce((sum, q) => sum + q.naoDistribuido, 0);
  const totalOcupado = quadrosComResumo.reduce((sum, q) => sum + q.ocupado, 0);
  const totalReservado = quadrosComResumo.reduce((sum, q) => sum + q.reservado, 0);
  const totalDisponivel = quadrosComResumo.reduce((sum, q) => sum + q.disponivel, 0);
  const distribuicoesFiltradasConsulta = controleVagasDistribuicoesMock.filter(
    (dist) =>
      quadrosComResumo.some((quadro) => quadro.quadroId === dist.quadroId),
  );

  const handleLimparFiltros = () => {
    reset({
      dataReferencia: "29/05/2026",
      cargoFuncao: "",
      orgaoSetor: "",
      tipo: "",
      situacao: "",
    });
    setDataReferencia("29/05/2026");
  };

  const renderSaldoAba = (tipo: "ocupadas" | "reservadas" | "disponiveis") => {
    const dados = quadrosComResumo.filter((q) => {
      if (tipo === "ocupadas") return q.ocupado > 0;
      if (tipo === "reservadas") return q.reservado > 0;
      if (tipo === "disponiveis") return q.disponivel > 0;
      return true;
    });

    return (
      <div className="prototype-table-wrapper prototype-controle-vagas-consulta-table">
        <table className="prototype-simple-table">
          <thead>
            <tr>
              <th>Cargo/Função</th>
              <th>Órgão/Setor</th>
              {tipo === "ocupadas" && <th>Ocupadas</th>}
              {tipo === "reservadas" && <th>Reservadas</th>}
              {tipo === "disponiveis" && <th>Disponíveis</th>}
              <th>Autorizado</th>
              <th>Distribuído</th>
            </tr>
          </thead>
          <tbody>
            {dados.length > 0 ? (
              dados.map((quadro) => (
                <tr key={quadro.quadroId}>
                  <td>{quadro.cargoFuncao}</td>
                  <td>{quadro.orgaoSetor}</td>
                  <td>
                    <strong>
                      {tipo === "ocupadas"
                        ? quadro.ocupado
                        : tipo === "reservadas"
                          ? quadro.reservado
                          : quadro.disponivel}
                    </strong>
                  </td>
                  <td>{quadro.autorizado}</td>
                  <td>{quadro.distribuido}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="prototype-empty-table-cell">
                  Nenhum dado disponível para esta visualização.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag
          title="Consulta de Saldo de Vagas"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="prototype-controle-vagas-consulta-saldo">
            <div className="prototype-controle-vagas-section-title">
              <h3>Filtros de Consulta</h3>
              <p>
                Saldos calculados para {dataReferenciaSelecionada}, considerando
                distribuições, reservas ativas e vagas ocupadas.
              </p>
            </div>

            <div className="grid prototype-controle-vagas-filtros prototype-controle-vagas-filtros-card">
              <DateFieldSeplag
                name="dataReferencia"
                control={control}
                label="Data de Referência"
                cols="12 6 2"
                required
                getFormErrorMessage={() => null}
              />
              <DropdownFieldSeplag
                name="cargoFuncao"
                control={control}
                label="Cargo/Função"
                cols="12 6 3"
                options={controleVagasCargoFuncaoOptions}
                optionLabel="label"
                optionValue="value"
                getFormErrorMessage={() => null}
              />
              <DropdownFieldSeplag
                name="orgaoSetor"
                control={control}
                label="Órgão/Setor"
                cols="12 6 3"
                options={controleVagasOrgaoSetorOptions}
                optionLabel="label"
                optionValue="value"
                getFormErrorMessage={() => null}
              />
              <DropdownFieldSeplag
                name="tipo"
                control={control}
                label="Tipo"
                cols="12 6 2"
                options={[
                  { label: "Todos", value: "" },
                  { label: "Cargo", value: "Cargo" },
                  { label: "Função", value: "Função" },
                ]}
                optionLabel="label"
                optionValue="value"
                getFormErrorMessage={() => null}
              />
              <DropdownFieldSeplag
                name="situacao"
                control={control}
                label="Situação"
                cols="12 6 2"
                options={controleVagasStatusOperacionalOptions}
                optionLabel="label"
                optionValue="value"
                getFormErrorMessage={() => null}
              />
              <div className="prototype-category-clear col-12 md:col-6 lg:col-2">
                <BotaoLimparFiltroSeplag
                  type="button"
                  label="Limpar"
                  icon="pi pi-refresh"
                  onClick={handleLimparFiltros}
                />
              </div>
            </div>

            <div className="prototype-controle-vagas-quadro-summary prototype-controle-vagas-quadro-summary--saldo">
              <div className="is-primary">
                <span>Autorizado</span>
                <strong>{totalAutorizado}</strong>
              </div>
              <div className="is-info">
                <span>Distribuído</span>
                <strong>{totalDistribuido}</strong>
              </div>
              <div>
                <span>Não Distribuído</span>
                <strong>{totalNaoDistribuido}</strong>
              </div>
              <div>
                <span>Ocupado</span>
                <strong>{totalOcupado}</strong>
              </div>
              <div className="is-warning">
                <span>Reservado</span>
                <strong>{totalReservado}</strong>
              </div>
              <div className="is-success">
                <span>Disponível</span>
                <strong>{totalDisponivel}</strong>
              </div>
            </div>

            <div className="prototype-controle-vagas-consulta-abas">
              <TabsSeplag
                items={controleVagasConsultaSaldoTabs}
                activeValue={activeTab}
                onChange={setActiveTab}
                equalWidth
              />

              {activeTab === "por-quadro" && (
                <div className="prototype-table-wrapper prototype-controle-vagas-consulta-table">
                  <table className="prototype-simple-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Cargo/Função</th>
                        <th>Órgão/Setor</th>
                        <th>Autorizado</th>
                        <th>Distribuído</th>
                        <th>Ocupado</th>
                        <th>Reservado</th>
                        <th>Disponível</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quadrosComResumo.length > 0 ? (
                        quadrosComResumo.map((quadro) => (
                          <tr key={quadro.quadroId}>
                            <td>{quadro.codigo}</td>
                            <td>{quadro.cargoFuncao}</td>
                            <td>{quadro.orgaoSetor}</td>
                            <td>{quadro.autorizado}</td>
                            <td>{quadro.distribuido}</td>
                            <td>{quadro.ocupado}</td>
                            <td>{quadro.reservado}</td>
                            <td>
                              <strong>{quadro.disponivel}</strong>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="prototype-empty-table-cell">
                            Nenhum quadro autorizado disponível.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "por-distribuicao" && (
                <div className="prototype-table-wrapper prototype-controle-vagas-consulta-table">
                  <table className="prototype-simple-table">
                    <thead>
                      <tr>
                        <th>Órgão/Setor</th>
                        <th>Cargo/Função</th>
                        <th>Distribuído</th>
                        <th>Ocupado</th>
                        <th>Reservado</th>
                        <th>Disponível</th>
                      </tr>
                    </thead>
                    <tbody>
                      {distribuicoesFiltradasConsulta.length > 0 ? (
                        distribuicoesFiltradasConsulta.map((dist) => {
                          const quadro = controleVagasQuadroAutorizadoMock.find(
                            (q) => q.id === dist.quadroId,
                          );
                          const reservado = getControleVagasReservadoDistribuicao(
                            dist,
                          );
                          const disponivel = getControleVagasDisponivelDistribuicao(
                            dist,
                          );

                          return (
                            <tr key={dist.id}>
                              <td>{dist.orgaoSetor}</td>
                              <td>{quadro?.cargoFuncao}</td>
                              <td>{dist.quantidadeDistribuida}</td>
                              <td>{dist.vagasOcupadas}</td>
                              <td>{reservado}</td>
                              <td>
                                <strong>{disponivel}</strong>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="prototype-empty-table-cell">
                            Nenhuma distribuição disponível.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "reservadas" && renderSaldoAba("reservadas")}

              {activeTab === "ocupadas" && renderSaldoAba("ocupadas")}

              {activeTab === "disponiveis" && renderSaldoAba("disponiveis")}
            </div>

            <div className="prototype-form-actions">
              <BotaoVoltarSeplag
                type="button"
                label="Voltar"
                icon="pi pi-arrow-left"
                onClick={() => navigate("/prototipos/sigep/controle-vagas")}
              />
            </div>
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposControleVagasConfiguracaoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const configuracao = controleVagasConfiguracoesMock.find(
    (item) => String(item.id) === id,
  );
  const isEditing = Boolean(id);
  const [activeTab, setActiveTab] = useState("detalhes");
  const { control, watch, setValue } = useForm<ControleVagasConfiguracaoForm>({
    defaultValues: {
      tipo: configuracao?.tipo ?? "",
      codigo: configuracao?.codigo ?? "",
      cargoFuncao: configuracao?.cargoFuncao ?? "",
      controlaVaga: configuracao?.controlaVaga ?? "Sim",
      tipoControle:
        configuracao?.tipoControle === "-" ? "" : configuracao?.tipoControle ?? "",
      dataInicio: configuracao?.dataInicio ?? "01/06/2026",
      permiteSaldoNegativo: "Não",
      justificativaSaldoNegativo: "",
      observacao: "",
      criterioCargoFuncao: "S",
      criterioRegimeJuridico: configuracao?.criterios.includes("Regime Jurídico")
        ? "S"
        : "N",
      criterioTipoVinculo: configuracao?.criterios.includes("Tipo de Vínculo")
        ? "S"
        : "N",
      criterioOrgaoSetor: configuracao?.criterios.includes("Órgão/Setor")
        ? "S"
        : "N",
      criterioSetoresSubordinados: configuracao?.criterios.includes(
        "Setores subordinados",
      )
        ? "S"
        : "N",
      criterioLocalidade: configuracao?.criterios.includes("Localidade")
        ? "S"
        : "N",
      criterioEspecialidade: configuracao?.criterios.includes("Especialidade")
        ? "S"
        : "N",
      criterioJornada: configuracao?.criterios.includes("Jornada") ? "S" : "N",
    },
  });
  const controlaVaga = watch("controlaVaga");
  const orgaoSetorSelecionado = watch("criterioOrgaoSetor") === "S";
  const camposDependentesDesabilitados = controlaVaga === "Não";

  useEffect(() => {
    if (controlaVaga !== "Não") return;

    setValue("tipoControle", "");
    setValue("dataInicio", "");
    setValue("permiteSaldoNegativo", "Não");
    setValue("justificativaSaldoNegativo", "");
    setValue("criterioRegimeJuridico", "N");
    setValue("criterioTipoVinculo", "N");
    setValue("criterioOrgaoSetor", "N");
    setValue("criterioSetoresSubordinados", "N");
    setValue("criterioLocalidade", "N");
    setValue("criterioEspecialidade", "N");
    setValue("criterioJornada", "N");
  }, [controlaVaga, setValue]);

  useEffect(() => {
    if (!orgaoSetorSelecionado) {
      setValue("criterioSetoresSubordinados", "N");
    }
  }, [orgaoSetorSelecionado, setValue]);

  const criterioRows = [
    {
      name: "criterioCargoFuncao" as const,
      titulo: "Cargo/Função",
      descricao: "Sempre validado para garantir que a configuração pertence ao cargo ou função selecionado.",
      bloqueado: true,
    },
    {
      name: "criterioRegimeJuridico" as const,
      titulo: "Regime Jurídico",
      descricao: "Valida compatibilidade do vínculo com o regime jurídico informado.",
    },
    {
      name: "criterioTipoVinculo" as const,
      titulo: "Tipo de Vínculo",
      descricao: "Restringe a ocupação conforme efetivo, contratado, comissionado ou aposentado.",
    },
    {
      name: "criterioOrgaoSetor" as const,
      titulo: "Órgão/Setor",
      descricao: "Valida se a vaga pertence à estrutura organizacional informada.",
    },
    {
      name: "criterioSetoresSubordinados" as const,
      titulo: "Setores subordinados",
      descricao: "Inclui estruturas filhas quando órgão/setor estiver marcado.",
      bloqueado: !orgaoSetorSelecionado,
    },
    {
      name: "criterioLocalidade" as const,
      titulo: "Localidade",
      descricao: "Considera município, unidade ou localidade de exercício.",
    },
    {
      name: "criterioEspecialidade" as const,
      titulo: "Especialidade",
      descricao: "Valida perfil ou especialidade exigida para a vaga.",
    },
    {
      name: "criterioJornada" as const,
      titulo: "Jornada",
      descricao: "Compara carga horária ou referência da vaga com o vínculo funcional.",
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
          title={`${isEditing ? "Alterar" : "Cadastrar"} - Configuração de Controle de Vagas`}
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="prototype-controle-vagas-form">
            <TabsSeplag
              items={controleVagasConfiguracaoTabs}
              activeValue={activeTab}
              onChange={setActiveTab}
              equalWidth
            />

            {activeTab === "detalhes" && (
              <div className="grid prototype-controle-vagas-form-section">
                <DropdownFieldSeplag
                  name="tipo"
                  control={control}
                  label="Tipo"
                  cols="12 12 3"
                  options={controleVagasTipoFormOptions}
                  optionLabel="label"
                  optionValue="value"
                  required
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="codigo"
                  control={control}
                  label="Código"
                  cols="12 12 3"
                  placeholder="Ex.: C001"
                  getFormErrorMessage={() => null}
                />
                <DropdownFieldSeplag
                  name="cargoFuncao"
                  control={control}
                  label="Cargo/Função"
                  cols="12 12 6"
                  options={controleVagasCargoFuncaoOptions}
                  optionLabel="label"
                  optionValue="value"
                  required
                  getFormErrorMessage={() => null}
                />
                <DropdownFieldSeplag
                  name="controlaVaga"
                  control={control}
                  label="Controla Vaga"
                  cols="12 12 3"
                  options={controleVagasSimNaoFormOptions}
                  optionLabel="label"
                  optionValue="value"
                  required
                  getFormErrorMessage={() => null}
                />
                <DropdownFieldSeplag
                  name="tipoControle"
                  control={control}
                  label="Tipo de Controle"
                  cols="12 12 3"
                  options={controleVagasTipoControleFormOptions}
                  optionLabel="label"
                  optionValue="value"
                  required={!camposDependentesDesabilitados}
                  disabled={camposDependentesDesabilitados}
                  getFormErrorMessage={() => null}
                />
                <DateFieldSeplag
                  name="dataInicio"
                  control={control}
                  label="Data Início"
                  cols="12 12 3"
                  required={!camposDependentesDesabilitados}
                  disabled={camposDependentesDesabilitados}
                  getFormErrorMessage={() => null}
                />
                <DropdownFieldSeplag
                  name="permiteSaldoNegativo"
                  control={control}
                  label="Permite saldo negativo"
                  cols="12 12 3"
                  options={controleVagasSimNaoFormOptions}
                  optionLabel="label"
                  optionValue="value"
                  disabled={camposDependentesDesabilitados}
                  getFormErrorMessage={() => null}
                />
                <TextAreaFieldSeplag
                  name="justificativaSaldoNegativo"
                  control={control}
                  label="Justificativa para saldo negativo"
                  cols="12"
                  rows={3}
                  disabled={camposDependentesDesabilitados}
                  placeholder="Informe a justificativa quando a regra permitir saldo negativo."
                  getFormErrorMessage={() => null}
                />
                <TextAreaFieldSeplag
                  name="observacao"
                  control={control}
                  label="Observação"
                  cols="12"
                  rows={3}
                  placeholder="Uso administrativo."
                  getFormErrorMessage={() => null}
                />
                {camposDependentesDesabilitados && (
                  <div className="col-12">
                    <div className="prototype-controle-vagas-rule-alert">
                      Ao marcar <strong>Controla Vaga = Não</strong>, os campos de controle, vigência e critérios ficam desabilitados.
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "criterios" && (
              <div
                className={`prototype-controle-vagas-criterios${
                  camposDependentesDesabilitados ? " is-disabled" : ""
                }`}
              >
                <div className="prototype-controle-vagas-section-title">
                  <h3>Critérios de Compatibilidade</h3>
                  <p>
                    Defina quais dados do vínculo funcional serão comparados antes
                    de ocupar ou reservar uma vaga.
                  </p>
                </div>
                <div className="prototype-controle-vagas-criterios-list">
                  {criterioRows.map((criterio) => (
                    <div
                      className="prototype-controle-vagas-criterio-item"
                      key={criterio.name}
                    >
                      <CheckboxFieldSeplag
                        name={criterio.name}
                        control={control}
                        checkboxLabel={criterio.titulo}
                        cols="12"
                        disabled={
                          camposDependentesDesabilitados || criterio.bloqueado
                        }
                      />
                      <span>{criterio.descricao}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "historico" && (
              <div className="prototype-controle-vagas-historico">
                <div className="prototype-controle-vagas-section-title">
                  <h3>Histórico da Configuração</h3>
                  <p>
                    Registro somente leitura das principais alterações simuladas
                    nesta configuração.
                  </p>
                </div>
                <div className="prototype-table-wrapper">
                  <table className="prototype-simple-table">
                    <thead>
                      <tr>
                        <th>Data/Hora</th>
                        <th>Evento</th>
                        <th>Usuário</th>
                        <th>Detalhe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {controleVagasHistoricoMock.map((item) => (
                        <tr key={item.id}>
                          <td>{item.dataHora}</td>
                          <td>{item.evento}</td>
                          <td>{item.usuario}</td>
                          <td>{item.detalhe}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="prototype-form-actions">
              <BotaoVoltarSeplag
                type="button"
                label="Voltar"
                icon="pi pi-arrow-left"
                onClick={() =>
                  navigate("/prototipos/sigep/controle-vagas/configuracao")
                }
              />
              <BotaoSalvarSeplag type="button" label="Salvar" />
            </div>
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
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
                <div className="prototype-controle-vagas-criterios-list prototype-tipo-vinculo-comportamentos">
                  {comportamentoRows.map((comportamento) => (
                    <div
                      className="prototype-controle-vagas-criterio-item"
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
                <div className="prototype-controle-vagas-criterios-list prototype-matriz-aplicacoes">
                  <div className="prototype-controle-vagas-criterio-item">
                    <CheckboxFieldSeplag<MatrizValidacaoForm>
                      name="aplicaIngresso"
                      control={control}
                      checkboxLabel="Ingresso"
                      cols="12"
                    />
                    <span>Permite usar a combinação no ingresso.</span>
                  </div>
                  <div className="prototype-controle-vagas-criterio-item">
                    <CheckboxFieldSeplag<MatrizValidacaoForm>
                      name="aplicaEventoCargo"
                      control={control}
                      checkboxLabel="Evento de Cargo / Provimento"
                      cols="12"
                    />
                    <span>Permite usar em eventos de cargo e provimento.</span>
                  </div>
                  <div className="prototype-controle-vagas-criterio-item">
                    <CheckboxFieldSeplag<MatrizValidacaoForm>
                      name="aplicaConcurso"
                      control={control}
                      checkboxLabel="Concurso"
                      cols="12"
                    />
                    <span>Permite ofertar a combinação em concurso.</span>
                  </div>
                  <div className="prototype-controle-vagas-criterio-item">
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

export function PrototiposFolhaPage() {
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
    changes: Partial<{ titulo: string }>,
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
      nomeSistema="FOLHA"
      ambienteSistema="Teste"
      menuItems={menuFolha}
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
                    label="+ Novo Informativo"
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
    changes: Partial<{ titulo: string }>,
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
                onClick={() => navigate("/prototipos/folha")}
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
                  navigate("/prototipos/folha");
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
  const [filtrosVigencia, setFiltrosVigencia] = useState<
    Record<number, { ano: string; status: "" | FolhaTabelaReferenciaVigenciaRow["situacao"] }>
  >({});
  const [feedback, setFeedback] = useState("");
  const filtros = watch();
  const termoTabela = filtros.tabela?.trim().toLowerCase() ?? "";

  const tabelasFiltradas = folhaTabelasReferenciaMock.filter((tabela) => {
    const descricao = `${tabela.sigla} ${tabela.nome}`.toLowerCase();
    return !termoTabela || descricao.includes(termoTabela);
  });

  const toggleTabela = (id: number) => {
    setLinhasExpandidas((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const renderSituacaoTabelaReferencia = (
    situacao: FolhaTabelaReferenciaVigenciaRow["situacao"],
  ) => {
    const badgeClass =
      situacao === "Ativo"
        ? "prototype-badge prototype-badge--success"
        : "prototype-badge prototype-badge--danger";

    return <span className={badgeClass}>{situacao}</span>;
  };

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
                const titulo = tabela.nome
                  ? `${tabela.sigla}- ${tabela.nome}`
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
                            navigate(getFolhaTabelaReferenciaNovaVigenciaPath(tabela.id))
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
                            className={`pi ${
                              isExpanded ? "pi-chevron-up" : "pi-chevron-down"
                            }`}
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
                              <option value="Ativo">Ativo</option>
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
                        <table>
                          <thead>
                            <tr>
                              <th>Ano</th>
                              <th>Vigência</th>
                              <th>Situação</th>
                              <th>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vigenciasFiltradas.map((vigencia) => (
                              <tr key={vigencia.id}>
                                <td>{vigencia.ano}</td>
                                <td>{vigencia.vigencia}</td>
                                <td>{renderSituacaoTabelaReferencia(vigencia.situacao)}</td>
                                <td>
                                  <div className="prototype-folha-referencia-actions">
                                    <BotaoIconSeplag
                                      type="button"
                                      tooltip="Visualizar vigência"
                                      icon="pi pi-eye"
                                      onClick={() =>
                                        setFeedback(
                                          `Visualização da vigência ${vigencia.ano} selecionada.`,
                                        )
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
                                            tabela.id,
                                            vigencia.id,
                                          ),
                                        )
                                      }
                                    />
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {!vigenciasFiltradas.length ? (
                              <tr>
                                <td colSpan={4} className="prototype-empty-table-cell">
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
            <div className="prototype-folha-referencia-pagination">
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
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposFolhaTabelaReferenciaVigenciaFormPage() {
  const navigate = useNavigate();
  const { tabelaId, vigenciaId } = useParams();
  const tabela =
    folhaTabelasReferenciaMock.find((item) => String(item.id) === tabelaId) ??
    folhaTabelasReferenciaMock[0];
  const isEditing = Boolean(vigenciaId);
  const [activeTab, setActiveTab] = useState("dados-gerais");
  const [dadosGeraisSalvos, setDadosGeraisSalvos] = useState(isEditing);
  const [feedback, setFeedback] = useState("");
  const [faixasVigencia, setFaixasVigencia] =
    useState<FolhaTabelaReferenciaFaixaRow[]>(() =>
      isEditing ? folhaTabelaReferenciaFaixasMock : [],
    );
  const [novaFaixaForm, setNovaFaixaForm] =
    useState<FolhaTabelaReferenciaNovaFaixaForm>({
      faixaFinal: "R$ 0,00",
      percentual: "",
    });
  const [modalNovaFaixaAberto, setModalNovaFaixaAberto] = useState(false);
  const { control, handleSubmit } = useForm<FolhaTabelaReferenciaVigenciaForm>({
    defaultValues: {
      descricao: isEditing ? "testeddd" : "",
      anoBase: isEditing ? "2026" : "",
      tetoPrevidenciario: isEditing ? "R$ 8.475,55" : "",
      inicioVigencia: isEditing ? "02/06/2026" : "",
      fimVigencia: "",
      observacoes: "",
    },
  });
  const tabsVigencia = folhaTabelaReferenciaVigenciaTabs.map((tab) =>
    tab.value === "faixa-contribuicao"
      ? { ...tab, disabled: !dadosGeraisSalvos }
      : tab,
  );
  const tituloTabela = `TABELA - ${tabela.sigla}${
    tabela.nome ? ` - ${tabela.nome}` : ""
  }`;
  const proximaOrdemFaixa = faixasVigencia.length + 1;
  const proximaFaixaInicial = getProximaFaixaInicialReferencia(faixasVigencia);
  const descontoMaximo = faixasVigencia.reduce(
    (total, faixa) => total + parseMoedaReferencia(faixa.contribuicaoFaixa),
    0,
  );

  const abrirModalNovaFaixa = () => {
    setNovaFaixaForm({ faixaFinal: "R$ 0,00", percentual: "" });
    setModalNovaFaixaAberto(true);
  };

  const salvarVigencia = () => {
    if (activeTab === "dados-gerais" && !dadosGeraisSalvos) {
      setDadosGeraisSalvos(true);
      setActiveTab("faixa-contribuicao");
      setFeedback(
        "Dados gerais salvos com sucesso. A aba Faixa de Contribuição foi habilitada.",
      );
      return;
    }

    setFeedback("Registro salvo com sucesso!");
  };

  const salvarNovaFaixa = () => {
    const faixaFinal = novaFaixaForm.faixaFinal.trim() || "R$ 0,00";
    const percentual = novaFaixaForm.percentual.trim();

    if (!percentual || parseMoedaReferencia(faixaFinal) <= 0) {
      setFeedback("Informe Faixa Final e Percentual (%) para adicionar a faixa.");
      return;
    }

    setFaixasVigencia((current) => [
      ...current,
      {
        id: Date.now(),
        ordem: current.length + 1,
        faixaInicial: getProximaFaixaInicialReferencia(current),
        faixaFinal,
        percentual,
        contribuicaoFaixa: calcularContribuicaoFaixaReferencia(
          getProximaFaixaInicialReferencia(current),
          faixaFinal,
          percentual,
        ),
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
                      <TextFieldSeplag
                        name="descricao"
                        control={control}
                        label="Descrição"
                        required
                        cols="12 12 8"
                        getFormErrorMessage={() => null}
                      />
                      <TextFieldSeplag
                        name="anoBase"
                        control={control}
                        label="Ano Base"
                        required
                        cols="12 12 4"
                        getFormErrorMessage={() => null}
                      />
                      <TextFieldSeplag
                        name="tetoPrevidenciario"
                        control={control}
                        label="Teto Previdenciário"
                        required
                        cols="12 12 3"
                        getFormErrorMessage={() => null}
                      />
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
                ) : (
                  <>
                    <div className="prototype-folha-referencia-vigencia-panel-title">
                      <h3>Faixa de Contribuição</h3>
                    </div>
                    <div className="prototype-folha-referencia-calculo-summary">
                      <div>
                        <span>Teto Previdenciário</span>
                        <strong>R$ 8.475,55</strong>
                      </div>
                      <div>
                        <span>Total de Faixas</span>
                        <strong>{faixasVigencia.length}</strong>
                      </div>
                      <div>
                        <span>Desconto Máximo CLT</span>
                        <strong>{formatMoedaReferencia(descontoMaximo)}</strong>
                      </div>
                    </div>
                    <div className="prototype-folha-referencia-faixa-toolbar">
                      <BotaoSeplag
                        type="button"
                        label="Adicionar Faixa"
                        icon="pi pi-plus"
                        onClick={abrirModalNovaFaixa}
                      />
                    </div>
                    <div className="prototype-folha-referencia-faixa-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Ordem</th>
                            <th>Faixa Inicial</th>
                            <th>Faixa Final</th>
                            <th>Percentual (%)</th>
                            <th>Contribuição da Faixa</th>
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
                              <td>{faixa.contribuicaoFaixa}</td>
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
                              <td colSpan={6} className="prototype-empty-table-cell">
                                Nenhuma faixa cadastrada.
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
                        <select aria-label="Registros por página" value="10" onChange={() => {}}>
                          <option value="10">10</option>
                        </select>
                      </div>
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
  const numeroFolhaFiltro = filtros.numeroFolha?.trim().toLowerCase() ?? "";
  const nomeFolhaFiltro = filtros.nomeFolha?.trim().toLowerCase() ?? "";
  const numeroExecucaoFiltro = filtros.numeroExecucao?.trim().toLowerCase() ?? "";
  const responsavelFiltro = filtros.responsavel?.trim().toLowerCase() ?? "";
  const processamentosFiltrados = processamentosBase.filter((processamento) => {
    const atendeNumeroFolha =
      !numeroFolhaFiltro ||
      processamento.numeroFolha.toLowerCase().includes(numeroFolhaFiltro);
    const atendeNomeFolha =
      !nomeFolhaFiltro ||
      processamento.nomeFolha.toLowerCase().includes(nomeFolhaFiltro);
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
    const atendeResponsavel =
      !responsavelFiltro ||
      processamento.responsavel.toLowerCase().includes(responsavelFiltro);

    return (
      atendeNumeroFolha &&
      atendeNomeFolha &&
      atendeSituacao &&
      atendeCompetencia &&
      atendeTipo &&
      atendeDataProcessamento &&
      atendeNumeroExecucao &&
      atendeResponsavel
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
              <div>
                <span>Em Fila</span>
                <strong>{processamentoResumo.emFila}</strong>
              </div>
              <div>
                <span>Em Processamento</span>
                <strong>{processamentoResumo.emProcessamento}</strong>
              </div>
              <div>
                <span>Processado com Erro</span>
                <strong>{processamentoResumo.processadoErro}</strong>
              </div>
              <div>
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
                  name="numeroFolha"
                  control={control}
                  label="Número da folha"
                  cols="12 6 2"
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="nomeFolha"
                  control={control}
                  label="Nome da folha"
                  cols="12 6 2"
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
                  label="Número da execução do processamento"
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
                <TextFieldSeplag
                  name="responsavel"
                  control={control}
                  label="Responsável"
                  cols="12 6 2"
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
    useState<SolicitacaoAjusteFolhaPerfil>("CONFORMIDADE");
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
    perfil === "CONFORMIDADE"
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

  const solicitacoesFiltradas = solicitacoes
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
            situacaoDestino: "NOVA" as SolicitacaoAjusteFolhaSituacao,
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
    setDocumentosFormularioSolicitacao([]);
  };

  const abrirFormularioSolicitacao = (
    modo: SolicitacaoAjusteFolhaModoFormulario,
    solicitacao?: SolicitacaoAjusteFolhaRow,
  ) => {
    setSolicitacaoSelecionada(solicitacao ?? null);
    preencherFormularioSolicitacao(solicitacao);
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

  const voltarParaListagemSolicitacoes = () => {
    setModoFormularioSolicitacao(null);
    setSolicitacaoSelecionada(null);
    setDocumentosFormularioSolicitacao([]);
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
        folhaPagamentoService.criarSolicitacaoAjusteFolha(form);
      setSolicitacoes((current) => [novaSolicitacao, ...current]);
      setFeedback("Registro cadastrado com sucesso!");
    }

    voltarParaListagemSolicitacoes();
  };

  const abrirVisualizar = (solicitacao: SolicitacaoAjusteFolhaRow) => {
    abrirFormularioSolicitacao("visualizar", solicitacao);
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
    if (perfil !== "CONFORMIDADE") {
      setModalExcluirAberto(false);
      setFeedback("Ação indisponível para o perfil Folha de Pagamento.");
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
    const podeIniciar =
      isFolhaPagamento &&
      (solicitacao.situacao === "NOVA" ||
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

    const podeEditarExcluir =
      isConformidade && solicitacao.situacao === "NOVA";
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
        {podeEditarExcluir ? (
          <BotaoIconSeplag
            severity="warning"
            type="button"
            tooltip="Editar"
            icon="pi pi-pencil"
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
              title={tituloFormulario}
              cols="12"
              cardHeaderClassNames="prototype-regime-card"
              actions={
                <div className="prototype-solicitacao-ajuste-competencia">
                  <span>Competência vigente</span>
                  <strong>{competenciaVigente}</strong>
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

                <div className="prototype-category-form-footer">
                  <BotaoVoltarSeplag
                    type="button"
                    label="Voltar"
                    icon="pi pi-arrow-left"
                    onClick={solicitarSaidaFormularioSolicitacao}
                  />
                  {isFormularioSolicitacaoReadonly &&
                  perfil === "CONFORMIDADE" &&
                  solicitacaoSelecionada?.situacao === "NOVA" ? (
                    <BotaoSeplag
                      type="button"
                      label="Editar"
                      icon="pi pi-pencil"
                      tooltip="Alterar"
                      onClick={() => setModoFormularioSolicitacao("editar")}
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
          title="Solicitações Registradas"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
          actions={
            <div className="prototype-solicitacoes-ajustes-card-actions">
              <span>{solicitacoesFiltradas.length} registros encontrados</span>
              <BotaoSeplag
                type="button"
                label="Nova Solicitação"
                icon="pi pi-plus"
                style={{ color: "#ffffff" }}
                hasPermission={perfil === "CONFORMIDADE"}
                onClick={() => abrirFormularioSolicitacao("novo")}
              />
            </div>
          }
        >
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

        <div className="prototype-form-actions">
          <BotaoVoltarSeplag
            type="button"
            label="Voltar"
            icon="pi pi-arrow-left"
            onClick={() => navigate("/prototipos/folha")}
          />
        </div>

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
              handleInativar={(row) => row.status === "Ativa" ? handleInativar(row) : null}
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

export function PrototiposControleVagasVagasNumeradasPage() {
  const navigate = useNavigate();

  const handleEditar = (vaga: ControleVagasVagaNumeradaRow) => {
    navigate(`/prototipos/sigep/controle-vagas/vagas-numeradas/${vaga.id}/editar`);
  };

  const totalVagasNumeradas = controleVagasVagaNumeradaMock.length;
  const totalDisponiveis = controleVagasVagaNumeradaMock.filter(
    (vaga) => vaga.situacao === "Disponível",
  ).length;
  const totalOcupadas = controleVagasVagaNumeradaMock.filter(
    (vaga) => vaga.situacao === "Ocupada",
  ).length;
  const totalRestritas = controleVagasVagaNumeradaMock.filter((vaga) =>
    ["Reservada", "Bloqueada"].includes(vaga.situacao),
  ).length;

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag
          title="Vagas Numeradas"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="prototype-controle-vagas-list">
            <div className="prototype-controle-vagas-section-title prototype-controle-vagas-section-title--split">
              <div>
                <h3>Consulta de Vagas Numeradas</h3>
                <p>
                  Acompanhe vagas individualizadas por número, ocupação atual e situação.
                </p>
              </div>
              <BotaoSeplag
                type="button"
                label="Adicionar Vaga Numerada"
                icon="pi pi-plus"
                onClick={() =>
                  navigate("/prototipos/sigep/controle-vagas/vagas-numeradas/novo")
                }
              />
            </div>

            <div className="prototype-controle-vagas-quadro-summary prototype-controle-vagas-quadro-summary--compact">
              <div>
                <span>Total</span>
                <strong>{totalVagasNumeradas}</strong>
              </div>
              <div className="is-success">
                <span>Disponíveis</span>
                <strong>{totalDisponiveis}</strong>
              </div>
              <div className="is-info">
                <span>Ocupadas</span>
                <strong>{totalOcupadas}</strong>
              </div>
              <div className="is-warning">
                <span>Reservadas/Bloqueadas</span>
                <strong>{totalRestritas}</strong>
              </div>
            </div>

            <div className="prototype-table-wrapper prototype-controle-vagas-vagas-table">
              <table className="prototype-simple-table">
                <thead>
                  <tr>
                    <th>Código da Vaga</th>
                    <th>Cargo/Função</th>
                    <th>Órgão/Setor</th>
                    <th>Ocupante Atual</th>
                    <th>Ativação</th>
                    <th>Situação</th>
                    <th>Controle</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {controleVagasVagaNumeradaMock.map((vaga) => {
                    const validacao = getControleVagasValidacaoVagaNumerada(vaga);

                    return (
                      <tr key={vaga.id}>
                        <td>
                          <strong>{vaga.numero}</strong>
                        </td>
                        <td>
                          {vaga.cargoFuncao}
                          <small>
                            {
                              controleVagasQuadroAutorizadoMock.find(
                                (quadro) => quadro.id === vaga.quadroId,
                              )?.codigo
                            }
                          </small>
                        </td>
                        <td>{vaga.orgaoSetor}</td>
                        <td>
                          {vaga.ocupacao?.pessoa ?? "-"}
                          {vaga.ocupacao?.tipoVinculo && (
                            <small>{vaga.ocupacao.tipoVinculo}</small>
                          )}
                        </td>
                        <td>{vaga.dataAtivacao}</td>
                        <td>{renderVagaNumeradaStatusBadge(vaga.situacao)}</td>
                        <td>
                          <span className={validacao.className}>
                            {validacao.label}
                          </span>
                        </td>
                        <td>
                          <div className="prototype-controle-vagas-row-actions">
                            <BotaoIconSeplag
                              type="button"
                              icon="pi pi-eye"
                              title="Visualizar vaga"
                              onClick={() => handleEditar(vaga)}
                            />
                            <BotaoIconSeplag
                              type="button"
                              icon="pi pi-pencil"
                              title="Editar vaga"
                              onClick={() => handleEditar(vaga)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="prototype-form-actions">
              <BotaoVoltarSeplag
                type="button"
                label="Voltar"
                icon="pi pi-arrow-left"
                onClick={() => navigate("/prototipos/sigep/controle-vagas")}
              />
            </div>
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposControleVagasVagasNumeradasFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const vaga = controleVagasVagaNumeradaMock.find(
    (item) => String(item.id) === id,
  );
  const isEditing = Boolean(id);
  const [activeTab, setActiveTab] = useState("detalhes");

  const { control } = useForm<ControleVagasVagaNumeradaForm>({
    defaultValues: {
      numero: vaga?.numero ?? "",
      quadroId: vaga?.quadroId,
      cargoFuncao: vaga?.cargoFuncao ?? "",
      orgaoSetor: vaga?.orgaoSetor ?? "",
      situacao: vaga?.situacao ?? "Disponível",
      dataAtivacao: vaga?.dataAtivacao ?? "01/06/2026",
      dataDesativacao: vaga?.dataDesativacao ?? "",
      motivo: vaga?.motivo ?? "",
      observacao: vaga?.observacao ?? "",
    },
  });

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag
          title={`${isEditing ? "Visualizar/Alterar" : "Cadastrar"} - Vaga Numerada`}
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="prototype-controle-vagas-form">
            <TabsSeplag
              items={controleVagasVagaNumeradaTabs}
              activeValue={activeTab}
              onChange={setActiveTab}
              equalWidth
            />

            {activeTab === "detalhes" && (
              <div className="grid prototype-controle-vagas-form-section">
                <TextFieldSeplag
                  name="numero"
                  control={control}
                  label="Código da Vaga"
                  cols="12 12 3"
                  placeholder="Ex.: VA-001"
                  required
                  getFormErrorMessage={() => null}
                />
                <DropdownFieldSeplag
                  name="quadroId"
                  control={control}
                  label="Quadro Autorizado"
                  cols="12 12 3"
                  options={controleVagasQuadroAutorizadoMock.map((quadro) => ({
                    label: `${quadro.codigo} - ${quadro.cargoFuncao}`,
                    value: quadro.id,
                  }))}
                  optionLabel="label"
                  optionValue="value"
                  required
                  getFormErrorMessage={() => null}
                />
                <DropdownFieldSeplag
                  name="cargoFuncao"
                  control={control}
                  label="Cargo/Função"
                  cols="12 12 3"
                  options={controleVagasCargoFuncaoOptions}
                  optionLabel="label"
                  optionValue="value"
                  required
                  getFormErrorMessage={() => null}
                />
                <DropdownFieldSeplag
                  name="orgaoSetor"
                  control={control}
                  label="Órgão/Setor"
                  cols="12 12 3"
                  options={controleVagasOrgaoSetorOptions}
                  optionLabel="label"
                  optionValue="value"
                  required
                  getFormErrorMessage={() => null}
                />
                <DropdownFieldSeplag
                  name="situacao"
                  control={control}
                  label="Situação"
                  cols="12 12 4"
                  options={controleVagasVagaNumeradaSituacaoOptions}
                  optionLabel="label"
                  optionValue="value"
                  required
                  getFormErrorMessage={() => null}
                />
                <DateFieldSeplag
                  name="dataAtivacao"
                  control={control}
                  label="Data de Ativação"
                  cols="12 12 4"
                  required
                  getFormErrorMessage={() => null}
                />
                <DateFieldSeplag
                  name="dataDesativacao"
                  control={control}
                  label="Data de Desativação"
                  cols="12 12 4"
                  getFormErrorMessage={() => null}
                />
                <TextFieldSeplag
                  name="motivo"
                  control={control}
                  label="Motivo"
                  cols="12"
                  placeholder="Motivo de bloqueio, reserva, desativação ou extinção"
                  getFormErrorMessage={() => null}
                />
                <TextAreaFieldSeplag
                  name="observacao"
                  control={control}
                  label="Observação"
                  cols="12"
                  rows={3}
                  getFormErrorMessage={() => null}
                />
              </div>
            )}

            {activeTab === "ocupacao-atual" && (
              <div className="prototype-controle-vagas-historico">
                <div className="prototype-controle-vagas-section-title">
                  <h3>Ocupação Atual</h3>
                  <p>Dados do servidor que está ocupando esta vaga atualmente.</p>
                </div>
                {vaga?.situacao === "Ocupada" ? (
                  <div className="prototype-controle-vagas-ocupacao-card">
                    <div>
                      <span>Servidor</span>
                      <strong>{vaga.ocupacao?.pessoa}</strong>
                    </div>
                    <div>
                      <span>CPF</span>
                      <strong>{vaga.ocupacao?.cpf}</strong>
                    </div>
                    <div>
                      <span>Tipo de vínculo</span>
                      <strong>{vaga.ocupacao?.tipoVinculo}</strong>
                    </div>
                    <div>
                      <span>Data de ocupação</span>
                      <strong>{vaga.ocupacao?.dataOcupacao}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="prototype-empty-state">
                    <p>A vaga não está ocupada no momento.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "historico" && (
              <div className="prototype-controle-vagas-historico">
                <div className="prototype-controle-vagas-section-title">
                  <h3>Histórico da Vaga</h3>
                  <p>Registro somente leitura das alterações simuladas para esta vaga.</p>
                </div>
                <div className="prototype-table-wrapper">
                  <table className="prototype-simple-table">
                    <thead>
                      <tr>
                        <th>Data/Hora</th>
                        <th>Evento</th>
                        <th>Usuário</th>
                        <th>Detalhe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {controleVagasVagaNumeradaHistoricoMock.filter(h => h.vagaNumero === vaga?.numero).map((item) => (
                        <tr key={item.id}>
                          <td>{item.dataHora}</td>
                          <td>{item.evento}</td>
                          <td>{item.usuario}</td>
                          <td>{item.detalhe}</td>
                        </tr>
                      ))}
                      {controleVagasVagaNumeradaHistoricoMock.filter(h => h.vagaNumero === vaga?.numero).length === 0 && (
                        <tr>
                          <td colSpan={4} className="prototype-empty-table-cell">Nenhum histórico encontrado.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="prototype-form-actions">
              <BotaoVoltarSeplag
                type="button"
                label="Voltar"
                icon="pi pi-arrow-left"
                onClick={() =>
                  navigate("/prototipos/sigep/controle-vagas/vagas-numeradas")
                }
              />
              <BotaoSalvarSeplag type="button" label="Salvar" />
            </div>
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposControleVagasIntegracaoPage() {
  const navigate = useNavigate();
  const { control, watch } = useForm<ControleVagasIntegracaoForm>({
    defaultValues: {
      vagaNumero: "VA-002",
      pessoa: "ANA PAULA COSTA",
      cpf: "456.789.123-00",
      tipoVinculo: "Efetivo",
    },
  });
  const [vagasSimuladas, setVagasSimuladas] = useState<
    ControleVagasVagaNumeradaRow[]
  >(controleVagasVagaNumeradaMock);
  const [eventosIntegracao, setEventosIntegracao] = useState<
    ControleVagasIntegracaoEventoRow[]
  >([]);
  const [resultadoIntegracao, setResultadoIntegracao] = useState<{
    tipo: ControleVagasIntegracaoEventoRow["resultado"];
    texto: string;
  }>({
    tipo: "Alerta",
    texto: "Selecione uma vaga e execute uma ação para simular a integração.",
  });

  const valores = watch();
  const vagaSelecionada = vagasSimuladas.find(
    (vaga) => vaga.numero === valores.vagaNumero,
  );
  const quadroSelecionado = controleVagasQuadroAutorizadoMock.find(
    (quadro) => quadro.id === vagaSelecionada?.quadroId,
  );
  const distribuicaoSelecionada =
    getControleVagasDistribuicaoDaVaga(vagaSelecionada);
  const saldoSelecionado = getControleVagasSaldoDistribuicaoSimulado(
    distribuicaoSelecionada,
    vagasSimuladas,
  );

  const registrarEventoIntegracao = (
    evento: string,
    resultado: ControleVagasIntegracaoEventoRow["resultado"],
    detalhe: string,
  ) => {
    const dataHora = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Cuiaba",
    }).format(new Date());

    setEventosIntegracao((eventos) => [
      {
        id: Date.now(),
        dataHora,
        evento,
        vagaNumero: vagaSelecionada?.numero ?? "-",
        resultado,
        detalhe,
      },
      ...eventos,
    ]);
    setResultadoIntegracao({ tipo: resultado, texto: detalhe });
  };

  const validarOcupacao = () => {
    if (!vagaSelecionada) {
      return "Selecione uma vaga numerada para validar a operação.";
    }

    if (!quadroSelecionado) {
      return "Operação bloqueada: a vaga selecionada não possui quadro autorizado vinculado.";
    }

    if (!distribuicaoSelecionada) {
      return "Operação bloqueada: a vaga não possui distribuição compatível.";
    }

    if (saldoSelecionado.disponivel <= 0) {
      return "Operação bloqueada: não há saldo disponível para a distribuição da vaga.";
    }

    if (quadroSelecionado.situacao !== STATUS_OPERACIONAL_VIGENCIA.ATIVO) {
      return "Operação bloqueada: o quadro autorizado não está ativo.";
    }

    if (["Bloqueada", "Extinta", "Agendada"].includes(vagaSelecionada.situacao)) {
      return `Operação bloqueada: a vaga está ${vagaSelecionada.situacao.toLowerCase()}.`;
    }

    if (vagaSelecionada.situacao === "Ocupada") {
      return "Operação bloqueada: a vaga já está ocupada.";
    }

    if (
      vagaSelecionada.situacao === "Reservada" &&
      getControleVagasReservasAtivas(
        vagaSelecionada.quadroId,
        vagaSelecionada.orgaoSetor,
      ).length === 0
    ) {
      return "Operação bloqueada: a vaga reservada não possui reserva ativa.";
    }

    return "";
  };

  const handleValidarSaldo = () => {
    if (!vagaSelecionada || !distribuicaoSelecionada) {
      registrarEventoIntegracao(
        "Validação de saldo",
        "Bloqueado",
        "Não foi possível validar o saldo porque a vaga não possui distribuição compatível.",
      );
      return;
    }

    const mensagemBloqueio = validarOcupacao();
    registrarEventoIntegracao(
      "Validação de saldo",
      mensagemBloqueio ? "Bloqueado" : "Sucesso",
      mensagemBloqueio ||
        `Saldo validado: ${saldoSelecionado.disponivel} vaga(s) disponível(is) para ${distribuicaoSelecionada.orgaoSetor}.`,
    );
  };

  const handleOcuparVaga = () => {
    const mensagemBloqueio = validarOcupacao();

    if (mensagemBloqueio || !vagaSelecionada) {
      registrarEventoIntegracao(
        "Ocupação bloqueada",
        "Bloqueado",
        mensagemBloqueio || "Operação bloqueada por inconsistência da vaga.",
      );
      return;
    }

    setVagasSimuladas((vagas) =>
      vagas.map((vaga) =>
        vaga.numero === vagaSelecionada.numero
          ? {
              ...vaga,
              situacao: "Ocupada",
              ocupacao: {
                id: Date.now(),
                pessoa: valores.pessoa || "Pessoa não informada",
                cpf: valores.cpf || "-",
                cargoFuncao: vaga.cargoFuncao,
                dataOcupacao: "03/06/2026",
                tipoVinculo: valores.tipoVinculo || "Não informado",
                nomeVinculo: "Ingresso funcional simulado",
                observacao: "Ocupação gerada pela integração mockada.",
              },
              observacao: "Vaga ocupada pela integração com ingresso funcional.",
            }
          : vaga,
      ),
    );
    registrarEventoIntegracao(
      "Ocupação de vaga",
      "Sucesso",
      `Vaga ${vagaSelecionada.numero} ocupada por ${valores.pessoa || "pessoa não informada"}. Evento funcional registrado no histórico simulado.`,
    );
  };

  const handleLiberarVaga = () => {
    if (!vagaSelecionada) {
      registrarEventoIntegracao(
        "Liberação bloqueada",
        "Bloqueado",
        "Selecione uma vaga numerada para liberar.",
      );
      return;
    }

    if (vagaSelecionada.situacao !== "Ocupada") {
      registrarEventoIntegracao(
        "Liberação bloqueada",
        "Bloqueado",
        "Operação bloqueada: somente vagas ocupadas podem ser liberadas.",
      );
      return;
    }

    setVagasSimuladas((vagas) =>
      vagas.map((vaga) =>
        vaga.numero === vagaSelecionada.numero
          ? {
              ...vaga,
              situacao: "Disponível",
              ocupacao: undefined,
              observacao: "Vaga liberada pela integração com evento funcional.",
            }
          : vaga,
      ),
    );
    registrarEventoIntegracao(
      "Liberação de vaga",
      "Sucesso",
      `Vaga ${vagaSelecionada.numero} liberada. Saldo da distribuição foi recomposto no mock.`,
    );
  };

  const resultadoClassName =
    resultadoIntegracao.tipo === "Sucesso"
      ? "is-success"
      : resultadoIntegracao.tipo === "Bloqueado"
        ? "is-danger"
        : "is-warning";

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag
          title="Integração com Ingresso e Eventos Funcionais"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="prototype-controle-vagas-integracao-page">
            <div className="prototype-controle-vagas-section-title">
              <h3>Simulação de Integração</h3>
              <p>
                Valide saldo, ocupe ou libere vagas e registre eventos funcionais em memória.
              </p>
            </div>

            <div className="grid prototype-controle-vagas-filtros prototype-controle-vagas-filtros-card">
              <DropdownFieldSeplag
                name="vagaNumero"
                control={control}
                label="Vaga Numerada"
                cols="12 12 3"
                options={vagasSimuladas.map((vaga) => ({
                  label: `${vaga.numero} - ${vaga.cargoFuncao}`,
                  value: vaga.numero,
                }))}
                getFormErrorMessage={() => null}
              />
              <TextFieldSeplag
                name="pessoa"
                control={control}
                label="Pessoa"
                cols="12 12 3"
                placeholder="Nome da pessoa"
                getFormErrorMessage={() => null}
              />
              <TextFieldSeplag
                name="cpf"
                control={control}
                label="CPF"
                cols="12 12 3"
                placeholder="000.000.000-00"
                getFormErrorMessage={() => null}
              />
              <DropdownFieldSeplag
                name="tipoVinculo"
                control={control}
                label="Tipo de Vínculo"
                cols="12 12 3"
                options={[
                  { label: "Efetivo", value: "Efetivo" },
                  { label: "Designado", value: "Designado" },
                  { label: "Comissionado", value: "Comissionado" },
                  { label: "Contrato Temporário", value: "Contrato Temporário" },
                ]}
                getFormErrorMessage={() => null}
              />
            </div>

            <div className="prototype-controle-vagas-quadro-summary prototype-controle-vagas-quadro-summary--compact">
              <div>
                <span>Vaga selecionada</span>
                <strong>{vagaSelecionada?.numero ?? "-"}</strong>
              </div>
              <div className="is-info">
                <span>Situação atual</span>
                <strong>{vagaSelecionada?.situacao ?? "-"}</strong>
              </div>
              <div className="is-warning">
                <span>Saldo disponível</span>
                <strong>{saldoSelecionado.disponivel}</strong>
              </div>
              <div className="is-success">
                <span>Ocupadas na distribuição</span>
                <strong>{saldoSelecionado.ocupado}</strong>
              </div>
            </div>

            <div className={`prototype-controle-vagas-integracao-result ${resultadoClassName}`}>
              {resultadoIntegracao.texto}
            </div>

            <div className="prototype-controle-vagas-integracao-actions">
              <BotaoSeplag
                type="button"
                label="Validar Saldo"
                icon="pi pi-check-circle"
                onClick={handleValidarSaldo}
              />
              <BotaoSeplag
                type="button"
                label="Ocupar Vaga"
                icon="pi pi-user-plus"
                onClick={handleOcuparVaga}
              />
              <BotaoSeplag
                type="button"
                label="Liberar Vaga"
                icon="pi pi-user-minus"
                onClick={handleLiberarVaga}
              />
            </div>

            <div className="prototype-table-wrapper prototype-controle-vagas-integracao-table">
              <table className="prototype-simple-table">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Evento</th>
                    <th>Vaga</th>
                    <th>Resultado</th>
                    <th>Detalhe</th>
                  </tr>
                </thead>
                <tbody>
                  {eventosIntegracao.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="prototype-empty-table-cell">
                        Nenhum evento simulado.
                      </td>
                    </tr>
                  ) : (
                    eventosIntegracao.map((evento) => (
                      <tr key={evento.id}>
                        <td>{evento.dataHora}</td>
                        <td>{evento.evento}</td>
                        <td>{evento.vagaNumero}</td>
                        <td>
                          <span
                            className={`prototype-badge ${
                              evento.resultado === "Sucesso"
                                ? "prototype-badge--success"
                                : evento.resultado === "Bloqueado"
                                  ? "prototype-badge--danger"
                                  : "prototype-badge--warning"
                            }`}
                          >
                            {evento.resultado}
                          </span>
                        </td>
                        <td>{evento.detalhe}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="prototype-form-actions">
              <BotaoVoltarSeplag
                type="button"
                label="Voltar"
                icon="pi pi-arrow-left"
                onClick={() => navigate("/prototipos/sigep/controle-vagas")}
              />
            </div>
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}

export function PrototiposControleVagasHistoricoPage() {
  const navigate = useNavigate();
  const { control } = useForm();
  const totalEventosHistorico = controleVagasVagaNumeradaHistoricoMock.length;
  const totalOcupacoesHistorico = controleVagasVagaNumeradaHistoricoMock.filter(
    (item) => ["Ocupação", "Designação"].includes(item.evento),
  ).length;
  const totalEventosRestritivos = controleVagasVagaNumeradaHistoricoMock.filter(
    (item) => ["Bloqueio", "Extinção"].includes(item.evento),
  ).length;

  return (
    <PrototypeSystemPage
      nomeSistema="GESTÃO DE PESSOAS"
      ambienteSistema="Teste"
      menuItems={menuGestaoPessoas}
    >
      <div className="prototype-page-content prototype-page-content--white">
        <CardSeplag
          title="Histórico/Ocupação de Vagas"
          cols="12"
          cardHeaderClassNames="prototype-regime-card"
        >
          <div className="prototype-controle-vagas-historico-page">
            <div className="prototype-controle-vagas-section-title">
              <h3>Filtros de Histórico</h3>
              <p>
                Consulte eventos de ocupação, liberação, bloqueio e alterações de vagas.
              </p>
            </div>

            <div className="grid prototype-controle-vagas-filtros prototype-controle-vagas-filtros-card">
              <DropdownFieldSeplag
                name="periodo"
                control={control}
                label="Período"
                cols="12 12 3"
                options={[{ label: 'Últimos 30 dias', value: '30d' }]}
                getFormErrorMessage={() => null}
              />
              <DropdownFieldSeplag
                name="cargoFuncao"
                control={control}
                label="Cargo/Função"
                cols="12 12 3"
                options={controleVagasCargoFuncaoOptions}
                getFormErrorMessage={() => null}
              />
              <DropdownFieldSeplag
                name="vaga"
                control={control}
                label="Vaga Numerada"
                cols="12 12 3"
                options={[{ label: 'Todas', value: '' }, { label: 'VA-001', value: 'VA-001' }, { label: 'VA-002', value: 'VA-002' }]}
                getFormErrorMessage={() => null}
              />
              <DropdownFieldSeplag
                name="evento"
                control={control}
                label="Evento"
                cols="12 12 3"
                options={[{ label: 'Todos', value: '' }, { label: 'Ocupação', value: 'ocupacao' }, { label: 'Reserva', value: 'reserva' }]}
                getFormErrorMessage={() => null}
              />
              <TextFieldSeplag
                name="pessoa"
                control={control}
                label="Pessoa/Vínculo"
                cols="12 12 3"
                placeholder="Nome, CPF ou vínculo"
                getFormErrorMessage={() => null}
              />
              <TextFieldSeplag
                name="usuario"
                control={control}
                label="Usuário"
                cols="12 12 3"
                placeholder="Responsável pelo evento"
                getFormErrorMessage={() => null}
              />
            </div>
            <div className="prototype-controle-vagas-filter-actions">
              <BotaoSeplag type="button" label="Filtrar" icon="pi pi-filter" />
              <BotaoLimparFiltroSeplag onClick={() => {}} />
            </div>

            <div className="prototype-controle-vagas-quadro-summary prototype-controle-vagas-quadro-summary--compact">
              <div>
                <span>Eventos</span>
                <strong>{totalEventosHistorico}</strong>
              </div>
              <div className="is-info">
                <span>Ocupações</span>
                <strong>{totalOcupacoesHistorico}</strong>
              </div>
              <div className="is-warning">
                <span>Restritivos</span>
                <strong>{totalEventosRestritivos}</strong>
              </div>
            </div>

            <div className="prototype-table-wrapper prototype-controle-vagas-historico-table">
              <table className="prototype-simple-table">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Vaga</th>
                    <th>Evento</th>
                    <th>Usuário</th>
                    <th>Detalhe</th>
                  </tr>
                </thead>
                <tbody>
                  {controleVagasVagaNumeradaHistoricoMock.map((item) => (
                    <tr key={item.id}>
                      <td>{item.dataHora}</td>
                      <td>{item.vagaNumero || '-'}</td>
                      <td>
                        <span className="prototype-controle-vagas-event-badge">
                          {item.evento}
                        </span>
                      </td>
                      <td>{item.usuario}</td>
                      <td>{item.detalhe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="prototype-form-actions">
              <BotaoVoltarSeplag
                type="button"
                label="Voltar"
                icon="pi pi-arrow-left"
                onClick={() => navigate('/prototipos/sigep/controle-vagas')}
              />
            </div>
          </div>
        </CardSeplag>
      </div>
    </PrototypeSystemPage>
  );
}
