import { TIPOS_VINCULO as TIPOS } from './tiposVinculo';
import { lerEstadoAdministrativo } from './vinculoPersistencia';
export const BASE = "/prototipos/sigep/vinculos-v2";
export const STORAGE = "prototype-vinculos-v2";
export type Tipo = typeof TIPOS[number];
export const TIPOS_FIM_EXERCICIO = new Set<Tipo>([
  "Contrato Temporário", "Contrato Temporário Vínculo Único", "Residente Técnico", "Estagiário", "Bolsista",
]);
const TIPOS_INGRESSO = new Set<Tipo>([
  "Nomeado Efetivo", "Exclusivamente Comissionado", "Contrato Temporário", "Contrato Temporário Vínculo Único",
  "Residente Técnico", "Estagiário", "Bolsista",
]);
export type Situacao = "Ativo" | "Encerrado";
export const moduloDeOrigem = (tipo: Tipo) => tipo === "Aposentado" ? "Aposentadoria" : TIPOS_INGRESSO.has(tipo) ? "Ingresso" : undefined;
export type Vinculo = {
  id: string; tipo: Tipo; nome: string; cpf: string; nascimento: string; matricula: string; numero: string;
  regime: string; carreira: string; cargo: string; perfil: string; jornada: string; orgao: string; setor: string;
  inicio: string; termino: string; situacao: Situacao | "Inativo"; vacanciaData?: string; vacanciaForma?: string; observacao?: string;
  criacao?: { titulo: string; responsavel: string; registradoEm: string; dados: Record<string, string> };
};
export type Pessoa = Pick<Vinculo, "nome" | "cpf" | "nascimento" | "matricula">;
export type Campos = Pick<Vinculo, "regime" | "carreira" | "cargo" | "perfil" | "jornada" | "orgao" | "setor" | "inicio" | "termino" | "matricula"> & { vacanciaData: string; vacanciaForma: string; observacao: string };
export const PESSOAS: Pessoa[] = [
  { nome: "João Silva", cpf: "000.000.000-00", nascimento: "12/04/1988", matricula: "327305" },
  { nome: "Maria Souza", cpf: "111.111.111-11", nascimento: "03/09/1992", matricula: "418920" },
  { nome: "Ana Costa", cpf: "333.333.333-33", nascimento: "21/06/1985", matricula: "529104" },
  { nome: "Carlos Pereira", cpf: "222.222.222-22", nascimento: "17/11/1990", matricula: "621438" },
  { nome: "Helena Martins", cpf: "444.444.444-44", nascimento: "08/02/1962", matricula: "738211" },
  { nome: "Roberto Almeida", cpf: "555.555.555-55", nascimento: "19/07/1960", matricula: "815437" },
  { nome: "Carla Nunes", cpf: "666.666.666-66", nascimento: "05/03/1981", matricula: "674208" },
  { nome: "Pedro Lima", cpf: "777.777.777-77", nascimento: "22/10/1987", matricula: "902314" },
];
const BASE_REGISTROS: Vinculo[] = [
  { id: "demo-1", tipo: "Nomeado Efetivo", ...PESSOAS[0], numero: "1", regime: "Estatutário Civil", carreira: "Gestão Governamental", cargo: "Analista Administrativo", perfil: "Gestão de Pessoas", jornada: "40 horas", orgao: "SEPLAG", setor: "Unidade Central", inicio: "2023-07-15", termino: "", situacao: "Ativo" },
  { id: "demo-2", tipo: "Contrato Temporário", ...PESSOAS[1], numero: "1", regime: "Regime Especial", carreira: "Profissionais da Saúde", cargo: "Técnico de Enfermagem", perfil: "Saúde", jornada: "40 horas", orgao: "SES", setor: "Hospital Regional", inicio: "2026-09-02", termino: "2027-09-01", situacao: "Ativo" },
  { id: "demo-3", tipo: "Exclusivamente Comissionado", ...PESSOAS[0], numero: "2", regime: "Regime Misto", carreira: "", cargo: "Assessor Especial", perfil: "Assessoria", jornada: "40 horas", orgao: "SEPLAG", setor: "Gabinete", inicio: "2026-02-12", termino: "", situacao: "Ativo" },
  { id: "demo-4", tipo: "Estagiário", ...PESSOAS[2], numero: "1", regime: "Sem Vínculo Empregatício", carreira: "", cargo: "Estagiário", perfil: "Administração", jornada: "20 horas", orgao: "SEPLAG", setor: "Unidade Central", inicio: "2026-02-12", termino: "2027-02-12", situacao: "Ativo" },
  { id: "demo-5", tipo: "Estabilizado Constitucionalmente", ...PESSOAS[4], numero: "1", regime: "Estatutário Civil", carreira: "Profissionais da Educação", cargo: "Professor", perfil: "Educação", jornada: "30 horas", orgao: "SEDUC", setor: "Escola Estadual", inicio: "2001-02-01", termino: "", situacao: "Inativo", vacanciaData: "2024-06-30", vacanciaForma: "Aposentadoria", observacao: "Aposentadoria registrada após o encerramento das atividades." },
  { id: "demo-6", tipo: "Servidor Permutado", ...PESSOAS[5], numero: "1", regime: "Estatutário Civil", carreira: "Profissionais da Saúde", cargo: "Técnico de Enfermagem", perfil: "Saúde", jornada: "40 horas", orgao: "SES", setor: "Hospital Regional", inicio: "2003-08-15", termino: "", situacao: "Inativo", vacanciaData: "2025-12-31", vacanciaForma: "Aposentadoria" },
  { id: "demo-7", tipo: "Empossado em Cargo Eletivo", ...PESSOAS[6], numero: "1", regime: "Regime Misto", carreira: "", cargo: "Chefe de Gabinete", perfil: "Assessoria", jornada: "40 horas", orgao: "SEPLAG", setor: "Gabinete", inicio: "2023-01-02", termino: "", situacao: "Encerrado", vacanciaData: "2025-04-15", vacanciaForma: "Exoneração" },
  { id: "demo-8", tipo: "Designação AVNM", ...PESSOAS[7], numero: "1", regime: "Regime Especial", carreira: "", cargo: "Designação AVNM", perfil: "Assessoria", jornada: "30 horas", orgao: "SEFAZ", setor: "Unidade Fazendária", inicio: "2024-03-01", termino: "", situacao: "Encerrado", vacanciaData: "2026-03-01", vacanciaForma: "Término de contrato", observacao: "Designação encerrada pelo término da vigência." },
];
export const ORGAOS = ["SEPLAG", "SES", "SEDUC", "SEFAZ"];
export const SETORES: Record<string, string[]> = {
  SEPLAG: ["Unidade Central", "Gabinete", "Coordenadoria de Gestão de Pessoas"],
  SES: ["Hospital Regional", "Gabinete", "Unidade Central"],
  SEDUC: ["Escola Estadual", "Gabinete", "Unidade Central"],
  SEFAZ: ["Unidade Fazendária", "Gabinete", "Unidade Central"],
};
type Config = { regimes: string[]; carreiras: string[]; cargos: string[]; perfis: string[]; jornadas: string[]; termino: boolean };
export function configTipo(tipo: Tipo): Config {
  if (tipo === "Nomeado Efetivo" || tipo === "Estabilizado Constitucionalmente" || tipo === "Servidor Permutado")
    return { regimes: ["Estatutário Civil"], carreiras: ["Gestão Governamental", "Profissionais da Educação", "Profissionais da Saúde"], cargos: ["Analista Administrativo", "Professor", "Técnico de Enfermagem"], perfis: ["Gestão de Pessoas", "Educação", "Saúde"], jornadas: ["20 horas", "30 horas", "40 horas"], termino: false };
  if (tipo === "Contrato Temporário" || tipo === "Contrato Temporário Vínculo Único" || tipo === "Residente Técnico")
    return { regimes: ["Regime Especial"], carreiras: ["Profissionais da Saúde", "Profissionais da Educação"], cargos: ["Técnico de Enfermagem", "Professor", "Residente Técnico"], perfis: ["Saúde", "Educação"], jornadas: ["20 horas", "30 horas", "40 horas"], termino: true };
  if (tipo === "Estagiário" || tipo === "Bolsista" || tipo === "Beneficiário de Aposentado" || tipo === "Pensão Especial")
    return { regimes: ["Sem Vínculo Empregatício"], carreiras: [], cargos: [tipo], perfis: ["Administração", "Educação", "Saúde"], jornadas: ["20 horas", "30 horas"], termino: true };
  if (tipo === "Exclusivamente Comissionado" || tipo === "Nomeado Conselheiro" || tipo === "Empossado em Cargo Eletivo")
    return { regimes: ["Regime Misto"], carreiras: [], cargos: ["Assessor Especial", "Chefe de Gabinete", tipo], perfis: ["Assessoria", "Gestão de Pessoas"], jornadas: ["40 horas", "Dedicação exclusiva"], termino: false };
  return { regimes: ["Regime Especial", "Regime Misto"], carreiras: [], cargos: [tipo], perfis: ["Administração", "Assessoria"], jornadas: ["20 horas", "30 horas", "40 horas"], termino: true };
}
const PERFIS_POR_CARGO: Record<string, string[]> = {
  "Analista Administrativo": ["Gestão de Pessoas", "Administração"],
  "Professor": ["Educação"],
  "Técnico de Enfermagem": ["Saúde"],
  "Residente Técnico": ["Saúde"],
  "Assessor Especial": ["Assessoria"],
  "Chefe de Gabinete": ["Assessoria"],
};
const JORNADAS_POR_CARGO: Record<string, string[]> = {
  "Analista Administrativo": ["40 horas"],
  "Professor": ["20 horas", "30 horas", "40 horas"],
  "Técnico de Enfermagem": ["30 horas", "40 horas"],
  "Residente Técnico": ["20 horas", "30 horas", "40 horas"],
  "Assessor Especial": ["40 horas", "Dedicação exclusiva"],
  "Chefe de Gabinete": ["40 horas", "Dedicação exclusiva"],
};
export function opcoesCargo(config: Config, cargo: string) {
  const perfis = config.perfis.filter((perfil) => !PERFIS_POR_CARGO[cargo] || PERFIS_POR_CARGO[cargo].includes(perfil));
  const jornadas = config.jornadas.filter((jornada) => !JORNADAS_POR_CARGO[cargo] || JORNADAS_POR_CARGO[cargo].includes(jornada));
  return { perfis: perfis.length ? perfis : config.perfis, jornadas: jornadas.length ? jornadas : config.jornadas };
}
const NOMES_DEMO = ["Adriana", "Bruno", "Camila", "Daniel", "Elisa", "Fábio", "Giovana", "Hugo", "Isabela", "Marcos"];
const SOBRENOMES_DEMO = ["Almeida", "Barbosa", "Cardoso", "Dias", "Ferreira", "Gomes", "Lima", "Mendes", "Oliveira", "Ribeiro"];
const REGISTROS_ADICIONAIS: Vinculo[] = TIPOS.filter(tipo => tipo !== "Aposentado").flatMap((tipo, indiceTipo) =>
  Array.from({ length: 5 }, (_, indice) => {
    const sequencia = indiceTipo * 5 + indice;
    const config = configTipo(tipo);
    const cargo = config.cargos[indice % config.cargos.length];
    const opcoes = opcoesCargo(config, cargo);
    const orgao = ORGAOS[indiceTipo % ORGAOS.length];
    const cpfNumerico = String(80000000000 + sequencia);
    const situacao: Vinculo["situacao"] = indice === 3 ? "Inativo" : indice === 4 ? "Encerrado" : "Ativo";
    return {
      id: `demo-extra-${sequencia + 1}`, tipo,
      nome: `${NOMES_DEMO[sequencia % NOMES_DEMO.length]} ${SOBRENOMES_DEMO[Math.floor(sequencia / NOMES_DEMO.length)]}`,
      cpf: `${cpfNumerico.slice(0, 3)}.${cpfNumerico.slice(3, 6)}.${cpfNumerico.slice(6, 9)}-${cpfNumerico.slice(9)}`,
      nascimento: `15/06/${1980 + (sequencia % 20)}`,
      matricula: String(800001 + sequencia), numero: "1",
      regime: config.regimes[0], carreira: config.carreiras[0] ?? "", cargo,
      perfil: opcoes.perfis[0], jornada: opcoes.jornadas[0],
      orgao, setor: SETORES[orgao][indice % SETORES[orgao].length],
      inicio: "2022-01-10", termino: "", situacao,
      vacanciaData: situacao === "Ativo" ? "" : situacao === "Inativo" ? "2024-06-30" : "2025-03-31",
      vacanciaForma: situacao === "Ativo" ? "" : situacao === "Inativo" ? "Aposentadoria" : "Término de contrato",
    };
  }),
);
export const emptyCampos: Campos = { matricula: "", regime: "", carreira: "", cargo: "", perfil: "", jornada: "", orgao: "", setor: "", inicio: "", termino: "", vacanciaData: "", vacanciaForma: "", observacao: "" };
export function salvos(): Vinculo[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE) || "[]");
    return Array.isArray(parsed) ? parsed as Vinculo[] : [];
  } catch { return []; }
}
export function todos(): Vinculo[] {
  const registros = salvos();
  const exemplos = [...BASE_REGISTROS, ...REGISTROS_ADICIONAIS];
  const estado=lerEstadoAdministrativo();
  const completos=[...exemplos.filter((v) => !registros.some((salvo) => salvo.id === v.id)), ...registros];
  return completos.filter(v => !estado.excluidos.includes(v.id)).map(v => ({...v,...estado.alteracoes[v.id]}));
}
