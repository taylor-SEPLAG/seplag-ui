export interface ConfiguracaoCargoEfetivo {
  readonly id: number;
  readonly nome: string;
  readonly situacao: "ATIVO" | "ENCERRADO" | "EXTINTO";
  readonly controlaVagasEfetivos: boolean;
  readonly vinculos: readonly ConfiguracaoVinculoCargoEfetivo[];
  readonly perfisProfissionais: readonly string[];
}

export interface ConfiguracaoVinculoCargoEfetivo {
  readonly tipoVinculo: string;
  readonly regimeJuridico: string;
  readonly carreira: string;
}

export interface AtualizacaoCargoEfetivo {
  id: number;
  nome: string;
  situacao: ConfiguracaoCargoEfetivo["situacao"];
  controlaVagasEfetivos: boolean;
  vinculos: readonly ConfiguracaoVinculoCargoEfetivo[];
  perfisProfissionais: readonly string[];
}

const nomesCarreiras: Record<string, string> = {
  ADM: "Profissionais da Administração",
  SAUDE: "Profissionais da Saúde",
  EDU: "Profissionais da Educação",
  TI: "Profissionais de Tecnologia da Informação",
};

export const formatarCarreiraEfetiva = (sigla: string) =>
  nomesCarreiras[sigla] ? `${sigla} — ${nomesCarreiras[sigla]}` : sigla;

let catalogo: ConfiguracaoCargoEfetivo[] = [
  {
    id: 9,
    nome: "Analista Administrativo Efetivo",
    situacao: "ATIVO",
    controlaVagasEfetivos: true,
    vinculos: [{ tipoVinculo: "Servidor efetivo", regimeJuridico: "Estatutário", carreira: "ADM" }],
    perfisProfissionais: ["Contabilidade", "Tecnologia da Informação"],
  },
  {
    id: 10,
    nome: "Técnico em Enfermagem Efetivo",
    situacao: "ATIVO",
    controlaVagasEfetivos: true,
    vinculos: [{ tipoVinculo: "Servidor efetivo", regimeJuridico: "Estatutário", carreira: "SAUDE" }],
    perfisProfissionais: ["Enfermagem"],
  },
  {
    id: 11,
    nome: "Professor da Educação Básica Efetivo",
    situacao: "ATIVO",
    controlaVagasEfetivos: true,
    vinculos: [{ tipoVinculo: "Servidor efetivo", regimeJuridico: "Estatutário", carreira: "EDU" }],
    perfisProfissionais: [],
  },
  {
    id: 12,
    nome: "Analista de Tecnologia da Informação Efetivo",
    situacao: "ATIVO",
    controlaVagasEfetivos: true,
    vinculos: [{ tipoVinculo: "Servidor efetivo", regimeJuridico: "Estatutário", carreira: "TI" }],
    perfisProfissionais: ["Tecnologia da Informação"],
  },
  ...[
    [101, "Administrador Público Efetivo", "ADM", ["Administração"]],
    [102, "Analista de Gestão de Pessoas Efetivo", "ADM", ["Administração"]],
    [103, "Analista de Planejamento Efetivo", "ADM", ["Administração", "Contabilidade"]],
    [104, "Analista Orçamentário Efetivo", "ADM", ["Contabilidade"]],
    [105, "Contador Público Efetivo", "ADM", ["Contabilidade"]],
    [106, "Técnico Administrativo Efetivo", "ADM", ["Administração"]],
    [107, "Técnico de Gestão de Pessoas Efetivo", "ADM", ["Administração"]],
    [108, "Técnico Orçamentário Efetivo", "ADM", ["Contabilidade"]],
    [109, "Enfermeiro Efetivo", "SAUDE", ["Enfermagem"]],
    [110, "Farmacêutico Efetivo", "SAUDE", ["Medicina"]],
    [111, "Fisioterapeuta Efetivo", "SAUDE", ["Medicina"]],
    [112, "Médico Efetivo", "SAUDE", ["Medicina"]],
    [113, "Psicólogo Efetivo", "SAUDE", ["Medicina"]],
    [114, "Assistente Social Efetivo", "SAUDE", ["Administração"]],
    [115, "Professor de Educação Especial Efetivo", "EDU", []],
    [116, "Técnico Administrativo Educacional Efetivo", "EDU", ["Administração"]],
    [117, "Analista de Sistemas Efetivo", "TI", ["Tecnologia da Informação"]],
    [118, "Desenvolvedor de Sistemas Efetivo", "TI", ["Tecnologia da Informação"]],
    [119, "Especialista em Segurança da Informação Efetivo", "TI", ["Tecnologia da Informação"]],
    [120, "Técnico de Suporte em Tecnologia Efetivo", "TI", ["Tecnologia da Informação"]],
  ].map(([id, nome, carreira, perfisProfissionais]) => ({
    id: id as number,
    nome: nome as string,
    situacao: "ATIVO" as const,
    controlaVagasEfetivos: true,
    vinculos: [{ tipoVinculo: "Servidor efetivo", regimeJuridico: "Estatutário", carreira: carreira as string }],
    perfisProfissionais: perfisProfissionais as string[],
  })),
];

export const listarCargosElegiveisParaQuadroEfetivo = () =>
  catalogo.filter(
    (cargo) => cargo.controlaVagasEfetivos && cargo.situacao === "ATIVO",
  );

export const obterConfiguracaoCargoEfetivo = (nome: string) =>
  catalogo.find((cargo) => cargo.nome === nome);

export const atualizarConfiguracaoCargoEfetivo = (
  atualizacao: AtualizacaoCargoEfetivo,
) => {
  const proximo: ConfiguracaoCargoEfetivo = { ...atualizacao };
  const indice = catalogo.findIndex((cargo) => cargo.id === atualizacao.id);
  catalogo =
    indice >= 0
      ? catalogo.map((cargo, index) => (index === indice ? proximo : cargo))
      : [...catalogo, proximo];
};
