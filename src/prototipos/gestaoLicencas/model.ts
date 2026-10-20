export const GESTAO_LICENCAS_PATH =
  "/prototipos/sigep/gestao-licencas-afastamentos";
export const TITULO_GESTAO_LICENCAS = "Gestão de Licenças e Afastamentos";
export type SituacaoLicenca = "Vigente" | "Encerrado" | "Encaminhado p/ o INSS";
export interface RegistroLicenca {
  id: string;
  matricula: string;
  vinculo: number;
  tipoVinculo:
    "Efetivo" | "Contrato Temporário" | "Comissionado" | "Residente Técnico";
  orgao: string;
  lotacao: string;
  nome: string;
  cargo: string;
  chefia: boolean;
  inicio: string;
  fim: string;
  tipo: string;
  categoria: "Licença" | "Afastamento" | "Ausência";
  dias: number;
  abrangencia: "INTEGRAL";
  origem: "SIGEP" | "PORTALSERVIDOR";
  situacao: SituacaoLicenca;
}

// Exemplos fornecidos no HTML: datas, dias concedidos e situações são preservados.
export const registrosLicencas: readonly RegistroLicenca[] = [
  {
    id: "licenca-900017",
    matricula: "900017",
    vinculo: 1,
    tipoVinculo: "Efetivo",
    orgao: "SECITEC/MT",
    lotacao: "Escola Técnica — Cuiabá",
    nome: "Servidor SECITEC (demonstração)",
    cargo: "Professor de Ensino Técnico",
    chefia: false,
    inicio: "2026-12-01",
    fim: "2026-12-15",
    tipo: "LTS (Saúde)",
    categoria: "Licença",
    dias: 15,
    abrangencia: "INTEGRAL",
    origem: "SIGEP",
    situacao: "Vigente",
  },
  {
    id: "licenca-900018",
    matricula: "900018",
    vinculo: 1,
    tipoVinculo: "Contrato Temporário",
    orgao: "UNEMAT/MT",
    lotacao: "Campus Sinop — Fac. Ciências",
    nome: "Servidor UNEMAT (demonstração)",
    cargo: "Professor Temporário",
    chefia: false,
    inicio: "2026-12-01",
    fim: "2026-12-15",
    tipo: "LTS (Saúde)",
    categoria: "Licença",
    dias: 15,
    abrangencia: "INTEGRAL",
    origem: "SIGEP",
    situacao: "Vigente",
  },
  {
    id: "licenca-241244",
    matricula: "241244",
    vinculo: 1,
    tipoVinculo: "Efetivo",
    orgao: "SEPLAG/MT",
    lotacao: "COORD. PLANEJ. E PROJETOS DE TI",
    nome: "Valeria da Silva Pinto",
    cargo: "Analista de TI",
    chefia: false,
    inicio: "2026-03-24",
    fim: "2026-04-07",
    tipo: "Licença Gala",
    categoria: "Licença",
    dias: 8,
    abrangencia: "INTEGRAL",
    origem: "PORTALSERVIDOR",
    situacao: "Vigente",
  },
  {
    id: "licenca-257812",
    matricula: "257812",
    vinculo: 1,
    tipoVinculo: "Contrato Temporário",
    orgao: "SEPLAG/MT",
    lotacao: "COORD. PLANEJ. E PROJETOS DE TI",
    nome: "Max Jorge Lacerda da Matta",
    cargo: "Técnico em Informática",
    chefia: false,
    inicio: "2026-12-05",
    fim: "2026-12-12",
    tipo: "Luto / Falecimento",
    categoria: "Licença",
    dias: 8,
    abrangencia: "INTEGRAL",
    origem: "SIGEP",
    situacao: "Vigente",
  },
  {
    id: "licenca-243417",
    matricula: "243417",
    vinculo: 1,
    tipoVinculo: "Comissionado",
    orgao: "SEPLAG/MT",
    lotacao: "COMISD. PLANEJ. E PROJETOS DE TI",
    nome: "Claudio Luciano Capistrano de Camargo",
    cargo: "Coordenador de TI",
    chefia: true,
    inicio: "2026-01-27",
    fim: "2026-02-16",
    tipo: "LTS (INSS > 15d)",
    categoria: "Licença",
    dias: 20,
    abrangencia: "INTEGRAL",
    origem: "PORTALSERVIDOR",
    situacao: "Encaminhado p/ o INSS",
  },
  {
    id: "licenca-327305",
    matricula: "327305",
    vinculo: 1,
    tipoVinculo: "Residente Técnico",
    orgao: "SES/MT",
    lotacao: "COORD. PLANEJ. E PROJETOS DE TI",
    nome: "João Silva",
    cargo: "Residente Técnico em Saúde",
    chefia: true,
    inicio: "2026-11-02",
    fim: "2026-11-08",
    tipo: "LSF (Família)",
    categoria: "Licença",
    dias: 7,
    abrangencia: "INTEGRAL",
    origem: "SIGEP",
    situacao: "Vigente",
  },
  {
    id: "licenca-412809",
    matricula: "412809",
    vinculo: 1,
    tipoVinculo: "Efetivo",
    orgao: "SEDUC/MT",
    lotacao: "Escola Estadual — Várzea Grande",
    nome: "Ana Paula Ribeiro",
    cargo: "Professora de Educação Básica",
    chefia: false,
    inicio: "2026-02-10",
    fim: "2026-02-20",
    tipo: "LTS (Saúde)",
    categoria: "Licença",
    dias: 10,
    abrangencia: "INTEGRAL",
    origem: "SIGEP",
    situacao: "Encerrado",
  },
];
export interface FiltrosGestaoLicencas {
  orgao: string;
  lotacao: string;
  servidor: string;
  situacao: string;
  tipoVinculo: string;
}
export const filtrosIniciais: FiltrosGestaoLicencas = {
  orgao: "",
  lotacao: "",
  servidor: "",
  situacao: "",
  tipoVinculo: "",
};
const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
export function filtrarLicencas(
  registros: readonly RegistroLicenca[],
  filtros: FiltrosGestaoLicencas,
) {
  const busca = normalizar(filtros.servidor.trim());
  return registros.filter(
    (r) =>
      (!filtros.orgao || r.orgao === filtros.orgao) &&
      (!filtros.lotacao || r.lotacao === filtros.lotacao) &&
      (!filtros.situacao || r.situacao === filtros.situacao) &&
      (!filtros.tipoVinculo || r.tipoVinculo === filtros.tipoVinculo) &&
      (!busca ||
        normalizar(`${r.matricula} / ${r.vinculo} ${r.nome}`).includes(busca)),
  );
}
export function indicadoresLicencas(registros: readonly RegistroLicenca[]) {
  return [
    {
      label: "Licenças",
      valor: registros.filter((r) => r.categoria === "Licença").length,
      icone: "pi-file",
      cor: "azul",
    },
    {
      label: "Afastamentos",
      valor: registros.filter((r) => r.categoria === "Afastamento").length,
      icone: "pi-sign-out",
      cor: "roxo",
    },
    {
      label: "Ausências",
      valor: registros.filter((r) => r.categoria === "Ausência").length,
      icone: "pi-calendar-minus",
      cor: "amarelo",
    },
    {
      label: "Vigentes",
      valor: registros.filter((r) => r.situacao === "Vigente").length,
      icone: "pi-check-circle",
      cor: "verde",
    },
    {
      label: "Encerrados",
      valor: registros.filter((r) => r.situacao === "Encerrado").length,
      icone: "pi-check",
      cor: "cinza",
    },
    {
      label: "Encaminhado p/ INSS",
      valor: registros.filter((r) => r.situacao === "Encaminhado p/ o INSS")
        .length,
      icone: "pi-pause",
      cor: "vermelho",
    },
  ];
}
export const dataLicenca = (data: string) =>
  data.split("-").reverse().join("/");
export const opcoesUnicas = (valores: string[]) =>
  [...new Set(valores)].sort((a, b) => a.localeCompare(b, "pt-BR"));
