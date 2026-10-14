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
  { matricula: "310021", nome: "Beatriz Andrade Correia", orgao: "SEPLAG/MT", setor: "Hospital Regional de Mato Grosso", cargo: "Residente Técnico — Enfermagem", tipoVinculo: "Residente Técnico", cargoGestao: false, periodoAquisitivoInicio: "2026-02-01", periodoAquisitivoFim: "", saldoDisponivel: 15 },
  { matricula: "320045", nome: "Igor Machado Nunes", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Bolsista", tipoVinculo: "Bolsista", cargoGestao: false, periodoAquisitivoInicio: "2026-07-10", periodoAquisitivoFim: "", saldoDisponivel: 15 },
  { matricula: "330078", nome: "Larissa Pacheco Teixeira", orgao: "SEPLAG/MT", setor: "COORD. PLANEJ. E PROJETOS DE TI", cargo: "Estagiária", tipoVinculo: "Estagiário", cargoGestao: false, periodoAquisitivoInicio: "2026-01-05", periodoAquisitivoFim: "", saldoDisponivel: 15 },
  { matricula: "550099", nome: "Ricardo Farias Lima", orgao: "SES/MT", setor: "Unidade de Pronto Atendimento", cargo: "Médico Plantonista", tipoVinculo: "Efetivo", cargoGestao: false, periodoAquisitivoInicio: "2025-09-01", periodoAquisitivoFim: "2026-08-31", saldoDisponivel: 20 },
  { matricula: "550099", nome: "Ricardo Farias Lima", orgao: "SES/MT", setor: "Ambulatório de Cardiologia", cargo: "Médico Cardiologista", tipoVinculo: "Contrato Temporário", cargoGestao: false, periodoAquisitivoInicio: "2025-11-01", periodoAquisitivoFim: "2026-10-31", saldoDisponivel: 12 },
];

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
      servidor.nome.toLocaleLowerCase("pt-BR") === termo ||
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
  { id: 13, orgao: "SEDUC", nome: "Rafael Monteiro Costa", matricula: "551120", cargo: "Professor", vinculo: "Efetivo", lotacaoNome: "Escola Estadual Antônio Ferreira", situacaoLotacao: "Fora da escola", saldo: 45, cargoGestao: false, ltsConcomitante: false },
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
    const saldoEsperado: 45 | 30 = lotacao.orgao === "UNEMAT" || estaEmEscola ? 45 : 30;
    const saldoInconsistente = indice % 10 === 0;
    const saldo: 45 | 30 = saldoInconsistente
      ? estaEmEscola ? 30 : 45
      : saldoEsperado;
    exemplos.push({
      id: 100000 + unidadeIndex * 1000 + indice,
      orgao: lotacao.orgao,
      nome,
      matricula: String(700000 + unidadeIndex * 1000 + indice),
      cargo: "Professor",
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
      setErro("Férias individuais são permitidas somente para vínculos Efetivo, Comissionado e Contrato Temporário. Residentes técnicos, bolsistas e estagiários não podem solicitar férias.");
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
    if (professor.cargoGestao) {
      lista.push(modoAgendamentoLote
        ? "Cargo de gestão — excluído do lote"
        : "Cargo de gestão — requer agendamento individual");
    }
    if (professor.remocaoRecentePendente) lista.push("Remoção recente — aguarda análise de férias");
    if (professor.vinculoEncerrado) lista.push("Vínculo encerrado — não pode receber novo lançamento");
    if (professor.feriasConcomitante) lista.push("Já possui férias no período — possível duplicidade");
    if (professor.cedido) {
      lista.push(modoAgendamentoLote
        ? "Servidor cedido — excluído do lote; saldo de referência: 30 dias"
        : "Servidor cedido — confirmar lotação e saldo");
    }
    if (professor.vinculo === "Contrato Temporário" && orgao !== "UNEMAT" && professor.periodoAquisitivoFechado !== true) {
      lista.push("Contrato temporário sem período aquisitivo fechado");
    }
    if (professor.situacaoLotacao === "Fora da escola" || professor.situacaoLotacao === "Fora de unidade") {
      lista.push("Fora de unidade escolar/universitária — confirmar lotação");
    }
    const saldo = professor.saldo;
    if ((professor.situacaoLotacao === "Fora da escola" || professor.situacaoLotacao === "Fora de unidade") && saldo === 45) {
      lista.push("Saldo de 45 dias fora da escola — incompatível com a lotação");
    }
    if (professor.situacaoLotacao === "Em escola" && saldo === 30) {
      lista.push("Saldo de 30 dias em escola — inconsistência cadastral");
    }
    if (orgao === "UNEMAT" && professor.situacaoLotacao === "Em unidade universitária" && saldo !== 45) {
      lista.push("Saldo diferente de 45 dias — fora do critério do lote");
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
    return lista;
  }, []);

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
        professor.cargo === "Professor" &&
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
      return true;
    });
  }, [professoresDaLotacao, buscaNome, tipoVinculoFiltro]);

  const servidoresSelecionaveisFiltrados = listaFiltrada.filter((professor) =>
    !modoAgendamentoLote || (!professor.cargoGestao && errosDe(professor).length === 0),
  );

  const listaPaginada = useMemo(
    () => listaFiltrada.slice(primeiroRegistro, primeiroRegistro + registrosPorPagina),
    [listaFiltrada, primeiroRegistro, registrosPorPagina],
  );

  useEffect(() => {
    setPrimeiroRegistro(0);
  }, [orgao, escola, buscaNome, tipoVinculoFiltro]);

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
        if (modoAgendamentoLote && (
          professor.cargoGestao ||
          errosDe(professor).length > 0 ||
          (campo === "incluido" && valor && avisosDe(professor).length > 0)
        )) return;
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
        situacao: modoAgendamentoLote && perfilLote === "SECRETARIO_SEDUC" ? "AGUARDANDO VALIDAÇÃO" : "EM ABERTO",
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
                : "A Gestão de Pessoas da UNEMAT visualiza todas as unidades e lança/valida o lote."}
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
              options={(modoAgendamentoLote && perfilLote === "SECRETARIO_SEDUC"
                ? ["Escola Estadual Antônio Ferreira"]
                : lotacoesDisponiveis).map((lotacao) => ({ label: lotacao, value: lotacao }))}
              optionLabel="label"
              optionValue="value"
              showClear={false}
              getFormErrorMessage={() => null}
              disabled={modoAgendamentoLote}
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
          {modoAgendamentoLote ? "Corpo docente do lote" : "Corpo docente da coletiva"}
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
                {modoAgendamentoLote ? <th>Cargo / Função</th> : null}
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
                      {professor.vinculo === "Contrato Temporário" ? (
                        <span className="prototype-ferias-lote-badge-temporario" title="Regra de pagamento depende de validação da Folha">FOLHA</span>
                      ) : null}
                    </td>
                    {modoAgendamentoLote ? <td>{professor.cargo}</td> : null}
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
                  <td colSpan={modoAgendamentoLote ? 8 : 7} className="prototype-ferias-empty">Nenhum servidor encontrado para os filtros informados.</td>
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
                            <span>
                              {professor.matricula}
                              {professor.vinculo === "Contrato Temporário" ? (
                                <span className="prototype-ferias-lote-badge-temporario" title="Regras de pagamento aguardam validação da Folha"> FOLHA</span>
                              ) : null}
                            </span>
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
                      ? "A Gestão de Pessoas da UNEMAT lança e valida o lote no mesmo fluxo."
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
  const [textoBuscaRecesso, setTextoBuscaRecesso] = useState("");

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
    setTextoBuscaRecesso(valor);
    setServidorEncontrado(false);
    const encontrado = buscarServidorMock(valor);
    if (encontrado) {
      aplicarServidorRecesso(encontrado);
      setErro("");
    } else {
      setServidorNome(valor);
      setMatricula("");
      setErro("Nenhum servidor encontrado. Pesquise pela matrícula ou pelo nome completo.");
    }
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
        <div className="prototype-ferias-form-grid">
          <label style={{ gridColumn: "1 / -1" }}>
            <span>Buscar Servidor (Matrícula, CPF ou Nome)</span>
            <div className="prototype-ferias-busca-servidor-row">
              <input
                value={servidorEncontrado ? servidorNome : textoBuscaRecesso}
                onChange={(event) => {
                  setServidorEncontrado(false);
                  setTextoBuscaRecesso(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") buscarServidorRecesso(textoBuscaRecesso);
                }}
                placeholder="Matrícula, CPF ou nome do servidor"
                autoComplete="off"
                className={servidorEncontrado ? "prototype-ferias-input-autopreenchido" : ""}
              />
              <BotaoBuscarServidor onClick={() => buscarServidorRecesso(textoBuscaRecesso)} />
            </div>
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

      <div className="prototype-vinculo-form prototype-ferias-lancamento-acoes" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button type="button" className="prototype-vinculo-back" onClick={onCancelar}>
          <i className="pi pi-arrow-left" aria-hidden="true" />
          Voltar
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
