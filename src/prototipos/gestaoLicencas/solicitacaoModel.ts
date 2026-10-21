import { registrosLicencas, type RegistroLicenca } from "./model";
export const STORAGE_SOLICITACOES = "sigep-solicitacoes-licencas-v1";
export interface SolicitacaoLocal {
  id: string;
  nome: string;
  cpf: string;
  matricula: string;
  vinculos: {
    numero: number;
    orgao: string;
    tipo: RegistroLicenca["tipoVinculo"];
    cargo: string;
    lotacao: string;
    jornada: string;
  }[];
}
export const servidoresSolicitacao: SolicitacaoLocal[] = [
  {
    id: "ana-lucia",
    nome: "Ana Lúcia Ferreira",
    cpf: "000.888.777-66",
    matricula: "551023",
    vinculos: [
      {
        numero: 1,
        orgao: "SEDUC/MT",
        tipo: "Efetivo",
        cargo: "Técnico de Apoio Educacional",
        lotacao: "C. E. Pres. Médici",
        jornada: "30h semanais",
      },
      {
        numero: 2,
        orgao: "SES/MT",
        tipo: "Contrato Temporário",
        cargo: "Auxiliar de Enfermagem",
        lotacao: "Hospital Regional",
        jornada: "40h semanais",
      },
    ],
  },
];
export const normalizarBusca = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.\-/]/g, "")
    .trim();
export function buscarServidores(busca: string) {
  const termo = normalizarBusca(busca);
  return termo
    ? servidoresSolicitacao.filter((s) =>
        normalizarBusca(`${s.nome} ${s.cpf} ${s.matricula}`).includes(termo),
      )
    : [];
}
export function carregarSolicitacoes(): RegistroLicenca[] {
  try {
    const dados = JSON.parse(
      localStorage.getItem(STORAGE_SOLICITACOES) || "[]",
    );
    return Array.isArray(dados)
      ? dados.filter(
          (r) =>
            r &&
            typeof r.id === "string" &&
            typeof r.nome === "string" &&
            typeof r.inicio === "string" &&
            typeof r.fim === "string",
        ).map(r => ({ ...r, situacao: r.situacao === 'Vigente' ? 'Em andamento' : r.situacao }))
      : [];
  } catch {
    return [];
  }
}
export const carregarGestaoLicencas = () => [
  ...carregarSolicitacoes(),
  ...registrosLicencas,
];
export function totalMinutos(inicio: string, fim: string) {
  const minutos = (hora: string) => {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
  };
  return inicio && fim ? Math.max(0, minutos(fim) - minutos(inicio)) : 0;
}
export function diasPeriodo(inicio: string, fim: string, uteis: boolean) {
  if (!inicio || !fim || fim < inicio) return 0;
  const primeiro = Date.parse(`${inicio}T00:00:00Z`),
    ultimo = Date.parse(`${fim}T00:00:00Z`);
  if (!uteis) return Math.round((ultimo - primeiro) / 86400000) + 1;
  let dias = 0;
  for (let d = primeiro; d <= ultimo; d += 86400000) {
    const semana = new Date(d).getUTCDay();
    if (semana !== 0 && semana !== 6) dias++;
  }
  return dias;
}
