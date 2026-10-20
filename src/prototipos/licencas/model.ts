export const BASE_LICENCAS = "/prototipos/sigep/parametrizacao-licencas";
export const STORAGE_LICENCAS = "sigep-parametrizacao-licencas-v1";
export const CATEGORIAS = [
  "Saúde / Perícia Médica",
  "Maternidade / Paternidade / Adoção",
  "Fatos da Vida / Direitos Civis",
  "Frequência / Ausências Pontuais",
  "Interesse Particular / Capacitação",
  "Atividade Política / Mandato",
  "Serviço Militar",
  "Outros Afastamentos Legais",
] as const;
export const NATUREZAS = ["Licença", "Afastamento", "Ausência"] as const;
export const VINCULOS_AUTORIZADOS = [
  "Efetivo",
  "Comissionado",
  "Temporário",
  "Temporário Único",
  "Residente",
  "Estagiário",
] as const;
export const OPCOES_VINCULOS = [
  { value: "Efetivo", label: "Nomeado Efetivo" },
  { value: "Comissionado", label: "Exclusivamente Comissionado" },
  { value: "Temporário", label: "Contrato Temporário" },
  { value: "Temporário Único", label: "Contrato Temporário Vínculo Único" },
  { value: "Residente", label: "Residente Técnico" },
  { value: "Estagiário", label: "Estagiário / Bolsista" },
];
export const GRAUS_PARENTESCO = [
  "Cônjuge / Companheiro(a)",
  "Pai / Mãe",
  "Padrasto / Madrasta",
  "Filho(a) / Enteado(a)",
  "Irmão / Irmã",
  "Avô / Avó (Efetivo e Residente)",
  "Tio(a)",
  "Sobrinho(a)",
  "Sogro(a)",
];
export interface ConfiguracaoEvento {
  documentosLegaisIds?: string[];
  inicioVigencia: string;
  fimVigencia: string;
  fundamentoLegal: string;
  orientacao: string;
  contagem: "Dias corridos" | "Dias úteis";
  abrangencias: string[];
  semLimite: boolean;
  travaRecorrencia: boolean;
  recorrenciaQuantidade: number;
  recorrenciaIntervalo: number;
  recorrenciaUnidade: "Meses" | "Dias" | "Anos" | "Ano Civil";
  grausParentesco: string[];
}
export interface PublicacaoEvento {
  versao: number;
  publicadaEm: string;
  dados: Omit<EventoLicenca, "historico">;
}
export const DURACOES = [
  "Dias corridos",
  "Dias úteis",
  "Sem limite",
  "Por horas",
] as const;
export interface EventoLicenca {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  natureza: (typeof NATUREZAS)[number];
  categoria: string;
  vinculos: string[];
  duracao: (typeof DURACOES)[number];
  quantidade: number;
  parentesco: boolean;
  recorrencia: string;
  situacao: "Ativo" | "Inativo";
  configuracao?: ConfiguracaoEvento;
  historico?: PublicacaoEvento[];
}
export function configuracaoDoEvento(
  evento: EventoLicenca,
): ConfiguracaoEvento {
  const recorrencia = evento.recorrencia.match(/^(\d+)x\s*\/\s*(\d+)m$/);
  return evento.configuracao
    ? structuredClone(evento.configuracao)
    : {
        inicioVigencia: "",
        fimVigencia: "",
        fundamentoLegal: evento.descricao,
        orientacao: "",
        contagem:
          evento.duracao === "Dias úteis" ? "Dias úteis" : "Dias corridos",
        abrangencias: [
          evento.duracao === "Por horas" ? "Por Horas" : "Dia Integral",
        ],
        semLimite: evento.duracao === "Sem limite",
        travaRecorrencia: Boolean(evento.recorrencia),
        recorrenciaQuantidade: Number(recorrencia?.[1] ?? 1),
        recorrenciaIntervalo: Number(recorrencia?.[2] ?? 12),
        recorrenciaUnidade: "Meses",
        grausParentesco: [],
      };
}
export interface FiltrosLicencas {
  busca: string;
  categoria: string;
  natureza: string;
  situacao: string;
}
export const filtrosVazios: FiltrosLicencas = {
  busca: "",
  categoria: "",
  natureza: "",
  situacao: "",
};
export const eventosIniciais: EventoLicenca[] = [
  {
    id: "lic-135",
    codigo: "1",
    nome: "Licença por Falecimento / Luto",
    descricao: "Lei Comp. nº 04/1990 - Art. 128",
    natureza: "Licença",
    categoria: CATEGORIAS[2],
    vinculos: ["Efetivo", "Comissionado", "Temporário", "Residente"],
    duracao: "Dias corridos",
    quantidade: 8,
    parentesco: true,
    recorrencia: "",
    situacao: "Ativo",
  },
  {
    id: "lic-101",
    codigo: "2",
    nome: "Licença para Tratamento de Saúde (LTS)",
    descricao: "Perícia Médica Oficial / Laudo",
    natureza: "Licença",
    categoria: CATEGORIAS[0],
    vinculos: ["Efetivo", "Comissionado", "Temporário"],
    duracao: "Sem limite",
    quantidade: 0,
    parentesco: false,
    recorrencia: "",
    situacao: "Ativo",
  },
  {
    id: "aus-002",
    codigo: "3",
    nome: "Doação Voluntária de Sangue",
    descricao: "Abono Ponto / Comprovante Hemocentro",
    natureza: "Ausência",
    categoria: CATEGORIAS[3],
    vinculos: ["Efetivo", "Comissionado", "Temporário", "Estagiário"],
    duracao: "Dias úteis",
    quantidade: 1,
    parentesco: false,
    recorrencia: "1x / 12m",
    situacao: "Ativo",
  },
  {
    id: "afs-045",
    codigo: "4",
    nome: "Convocação para Serviço Militar",
    descricao: "Afastamento Compulsorio sem Remuneração",
    natureza: "Afastamento",
    categoria: CATEGORIAS[6],
    vinculos: ["Efetivo"],
    duracao: "Sem limite",
    quantidade: 0,
    parentesco: false,
    recorrencia: "",
    situacao: "Ativo",
  },
  {
    id: "aus-010",
    codigo: "5",
    nome: "Consulta Médica / Odontológica (Horas)",
    descricao: "Atestado de Horas para Frequência (Legado)",
    natureza: "Ausência",
    categoria: CATEGORIAS[3],
    vinculos: ["Efetivo", "Estagiário"],
    duracao: "Por horas",
    quantidade: 0,
    parentesco: false,
    recorrencia: "",
    situacao: "Inativo",
  },
];
const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
export function filtrarEventos(registros: EventoLicenca[], f: FiltrosLicencas) {
  return registros.filter(
    (e) =>
      (!f.busca.trim() ||
        normalizar(e.codigo + " " + e.nome).includes(
          normalizar(f.busca.trim()),
        )) &&
      (!f.categoria || e.categoria === f.categoria) &&
      (!f.natureza || e.natureza === f.natureza) &&
      (!f.situacao || e.situacao === f.situacao),
  );
}
export function carregarEventos(): EventoLicenca[] {
  try {
    const dados = JSON.parse(localStorage.getItem(STORAGE_LICENCAS) ?? "null");
    if (Array.isArray(dados)) {
      const reservados = new Set(
        dados
          .filter((e) => /^\d+$/.test(e.codigo) && Number(e.codigo) > 0)
          .map((e) => Number(e.codigo)),
      );
      let sequencia = 1;
      const migrados = dados.map((e: EventoLicenca) => {
        if (/^\d+$/.test(e.codigo) && Number(e.codigo) > 0)
          return { ...e, codigo: String(Number(e.codigo)) };
        while (reservados.has(sequencia)) sequencia++;
        const codigo = String(sequencia);
        reservados.add(sequencia++);
        return { ...e, codigo };
      });
      if (JSON.stringify(migrados) !== JSON.stringify(dados))
        localStorage.setItem(STORAGE_LICENCAS, JSON.stringify(migrados));
      return migrados;
    }
  } catch {
    /* dados iniciais do protótipo */
  }
  return structuredClone(eventosIniciais);
}
export function validarEvento(
  evento: EventoLicenca,
  registros: EventoLicenca[],
) {
  if (!evento.codigo.trim() || !evento.nome.trim())
    return "Informe o código e o nome do evento.";
  if (
    !/^\d+$/.test(evento.codigo.trim()) ||
    !Number.isSafeInteger(Number(evento.codigo)) ||
    Number(evento.codigo) <= 0
  )
    return "O código deve ser numérico e maior que zero. Ex.: 1.";
  if (
    registros.some(
      (e) => e.id !== evento.id && Number(e.codigo) === Number(evento.codigo),
    )
  )
    return "Já existe um evento com este código. Informe um código único.";
  if (
    !CATEGORIAS.some((c) => c === evento.categoria) ||
    !NATUREZAS.includes(evento.natureza)
  )
    return "Selecione uma categoria e uma natureza válidas.";
  if (
    !evento.vinculos.length ||
    evento.vinculos.some(
      (v) => !VINCULOS_AUTORIZADOS.some((opcao) => opcao === v),
    )
  )
    return "Selecione ao menos um vínculo autorizado.";
  if (!DURACOES.includes(evento.duracao))
    return "Selecione uma duração válida.";
  if (
    (evento.duracao === "Dias corridos" || evento.duracao === "Dias úteis") &&
    (!Number.isInteger(evento.quantidade) || evento.quantidade <= 0)
  )
    return "Informe uma duração máxima inteira maior que zero.";
  const c = evento.configuracao;
  if (c) {
    const dataValida = (data: string) =>
      /^\d{4}-\d{2}-\d{2}$/.test(data) &&
      !Number.isNaN(Date.parse(data)) &&
      new Date(data).toISOString().slice(0, 10) === data;
    if (!dataValida(c.inicioVigencia))
      return "Informe uma data de início de vigência válida.";
    if (
      c.fimVigencia &&
      (!dataValida(c.fimVigencia) || c.fimVigencia < c.inicioVigencia)
    )
      return "O fim da vigência deve ser igual ou posterior ao início.";
    if (
      !c.fundamentoLegal.trim() ||
      (c.documentosLegaisIds !== undefined && !c.documentosLegaisIds.length)
    )
      return "Selecione ao menos um documento de amparo legal.";
    if (
      !c.abrangencias.length ||
      c.abrangencias.some((a) => !["Dia Integral", "Por Horas"].includes(a))
    )
      return "Selecione ao menos uma abrangência válida.";
    if (
      c.travaRecorrencia &&
      (!Number.isInteger(c.recorrenciaQuantidade) ||
        c.recorrenciaQuantidade < 1 ||
        !Number.isInteger(c.recorrenciaIntervalo) ||
        c.recorrenciaIntervalo < 1)
    )
      return "Informe quantidade e intervalo de recorrência inteiros maiores que zero.";
    if (
      evento.parentesco &&
      (!c.grausParentesco.length ||
        c.grausParentesco.some((g) => !GRAUS_PARENTESCO.includes(g)))
    )
      return "Selecione os graus de parentesco autorizados.";
  }
  return "";
}
export function salvarEvento(
  evento: EventoLicenca,
  registros: EventoLicenca[],
) {
  const erro = validarEvento(evento, registros);
  if (erro) throw Error(erro);
  const normalizado = {
    ...evento,
    codigo: String(Number(evento.codigo)),
    nome: evento.nome.trim(),
    descricao: evento.descricao.trim(),
    recorrencia: evento.recorrencia.trim(),
  };
  if (evento.configuracao) {
    const { historico: _, ...dados } = structuredClone(normalizado);
    const historico =
      registros.find((e) => e.id === evento.id)?.historico ?? [];
    normalizado.historico = [
      ...historico,
      {
        versao: (historico.at(-1)?.versao ?? 0) + 1,
        publicadaEm: new Date().toISOString(),
        dados,
      },
    ];
  }
  const proximos = registros.some((e) => e.id === evento.id)
    ? registros.map((e) => (e.id === evento.id ? normalizado : e))
    : [...registros, normalizado];
  localStorage.setItem(STORAGE_LICENCAS, JSON.stringify(proximos));
  return proximos;
}
export function proximoCodigo(registros = carregarEventos()) {
  return String(
    Math.max(0, ...registros.map((e) => Number(e.codigo) || 0)) + 1,
  );
}
export function clonarEvento(evento: EventoLicenca): EventoLicenca {
  return {
    ...structuredClone(evento),
    id: crypto.randomUUID(),
    codigo: proximoCodigo(),
    nome: evento.nome + " — Cópia",
    situacao: "Ativo",
    historico: [],
  };
}
export function rotuloDuracao(e: EventoLicenca) {
  if (e.duracao === "Sem limite" || e.duracao === "Por horas") return e.duracao;
  return `${e.quantidade} ${e.duracao === "Dias corridos" ? (e.quantidade === 1 ? "Dia Corrido" : "Dias Corridos") : e.quantidade === 1 ? "Dia Útil" : "Dias Úteis"}`;
}
