import type { SicadUsuarioMockado } from "./sicadAccessMock";

export type SicadOcorrenciaFluxoStatus =
  | "Novo"
  | "Em Análise"
  | "Aguardando Informações"
  | "Em Desenvolvimento"
  | "Em Validação"
  | "Concluído"
  | "Cancelado";

export type SicadOcorrenciaAnexoService = {
  nome: string;
  tamanho: string;
  dataHora: string;
};

export type SicadOcorrenciaHistoricoService = {
  id: string;
  dataHora: string;
  usuario: string;
  acao: string;
  observacao: string;
};

export type SicadOcorrenciaComentarioService = {
  id: string;
  usuario: string;
  perfil: string;
  dataHora: string;
  texto: string;
};

export type SicadOcorrenciaService = {
  id: string;
  ordem: number;
  numero: string;
  dataAbertura: string;
  dataConclusao: string;
  tipo: string;
  titulo: string;
  ambiente: string;
  prioridade: string;
  status: SicadOcorrenciaFluxoStatus;
  orgao: string;
  responsavel: string;
  usuario: string;
  cpf: string;
  matricula: string;
  numeroSolicitacaoPrestacao: string;
  numeroRedmine: string;
  tempoAtendimento: string;
  descricao: string;
  mensagemErro: string;
  anexos: SicadOcorrenciaAnexoService[];
  historico: SicadOcorrenciaHistoricoService[];
  comentarios: SicadOcorrenciaComentarioService[];
  criadoPorUsuarioId: string;
};

export type SicadNovaOcorrenciaPayload = {
  tipo: string;
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
  anexos: SicadOcorrenciaAnexoService[];
};

const SICAD_OCORRENCIAS_STORAGE_KEY = "sicad.ocorrenciasMock.v1";

const statusPermitidos: Record<SicadOcorrenciaFluxoStatus, SicadOcorrenciaFluxoStatus[]> = {
  Novo: ["Em Análise", "Cancelado"],
  "Em Análise": ["Aguardando Informações", "Em Desenvolvimento", "Em Validação", "Concluído", "Cancelado"],
  "Aguardando Informações": ["Em Análise", "Cancelado"],
  "Em Desenvolvimento": ["Em Validação", "Concluído", "Cancelado"],
  "Em Validação": ["Em Desenvolvimento", "Concluído", "Cancelado"],
  Concluído: ["Em Análise", "Cancelado"],
  Cancelado: ["Novo", "Em Análise"],
};

function formatNow() {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function criarHistorico(usuario: SicadUsuarioMockado, acao: string, observacao: string): SicadOcorrenciaHistoricoService {
  return {
    id: createId("hist"),
    dataHora: formatNow(),
    usuario: `${usuario.nome} (${usuario.perfil})`,
    acao,
    observacao,
  };
}

function criarComentario(usuario: SicadUsuarioMockado, texto: string): SicadOcorrenciaComentarioService {
  return {
    id: createId("coment"),
    usuario: usuario.nome,
    perfil: usuario.perfil,
    dataHora: formatNow(),
    texto,
  };
}

function seedOcorrencias(): SicadOcorrenciaService[] {
  return [
    {
      id: "000123-2024",
      ordem: 1,
      numero: "2025-000123",
      dataAbertura: "10/05/2024 09:15",
      dataConclusao: "-",
      tipo: "Bug",
      titulo: "Erro ao emitir relatório de prestação de contas",
      ambiente: "Produção",
      prioridade: "Alta",
      status: "Novo",
      orgao: "SEPLAG",
      responsavel: "",
      usuario: "Taylor Santos",
      cpf: "***.123.456-**",
      matricula: "123456",
      numeroSolicitacaoPrestacao: "PC-2025-004567",
      numeroRedmine: "",
      tempoAtendimento: "10h 15m",
      descricao: "Ao tentar emitir o relatório de prestação de contas, o sistema apresenta uma mensagem de erro e não gera o relatório.",
      mensagemErro: "ERRO 500 - Ocorreu um erro interno no servidor. Tente novamente mais tarde ou entre em contato com o suporte.",
      anexos: [
        { nome: "print_erro_relatorio.png", tamanho: "245 KB", dataHora: "10/05/2025 14:32" },
        { nome: "log_erro_relatorio.txt", tamanho: "18 KB", dataHora: "10/05/2025 14:32" },
      ],
      historico: [
        { id: "hist-seed-1", dataHora: "10/05/2025 14:32", usuario: "Taylor Santos (SUPORTE)", acao: "Ocorrência criada", observacao: "Ocorrência registrada pelo usuário." },
      ],
      comentarios: [
        { id: "coment-seed-1", usuario: "Taylor Santos", perfil: "SUPORTE", dataHora: "10/05/2025 14:32", texto: "Ocorrência aberta para análise da equipe técnica." },
      ],
      criadoPorUsuarioId: "suporte",
    },
    {
      id: "000124-2024",
      ordem: 2,
      numero: "000124/2024",
      dataAbertura: "10/05/2024 10:32",
      dataConclusao: "-",
      tipo: "Dúvida",
      titulo: "Como gerar relatório de despesas?",
      ambiente: "Homologação",
      prioridade: "Média",
      status: "Novo",
      orgao: "SES",
      responsavel: "",
      usuario: "João Silva",
      cpf: "000.000.000-00",
      matricula: "987654",
      numeroSolicitacaoPrestacao: "880124/2024",
      numeroRedmine: "",
      tempoAtendimento: "2h 30m",
      descricao: "Usuário não localizou a opção para gerar relatório de despesas.",
      mensagemErro: "",
      anexos: [],
      historico: [{ id: "hist-seed-2", dataHora: "10/05/2024 10:32", usuario: "João Silva (SUPORTE)", acao: "Ocorrência criada", observacao: "Ocorrência registrada pelo suporte." }],
      comentarios: [],
      criadoPorUsuarioId: "suporte",
    },
    {
      id: "000125-2024",
      ordem: 3,
      numero: "000125/2024",
      dataAbertura: "09/05/2024 16:48",
      dataConclusao: "-",
      tipo: "Inconsistência cadastral",
      titulo: "CPF duplicado no cadastro de servidor",
      ambiente: "Produção",
      prioridade: "Média",
      status: "Em Análise",
      orgao: "SEFAZ",
      responsavel: "Ana Oliveira",
      usuario: "Roberto Junior",
      cpf: "111.222.333-44",
      matricula: "112233",
      numeroSolicitacaoPrestacao: "880125/2024",
      numeroRedmine: "",
      tempoAtendimento: "1d 4h",
      descricao: "Cadastro apresenta CPF duplicado para servidores distintos.",
      mensagemErro: "CPF já cadastrado para outro vínculo.",
      anexos: [],
      historico: [{ id: "hist-seed-3", dataHora: "09/05/2024 16:48", usuario: "Ana Oliveira (ANALISTA)", acao: "Status alterado", observacao: "Ocorrência assumida para análise." }],
      comentarios: [],
      criadoPorUsuarioId: "suporte",
    },
    {
      id: "000126-2024",
      ordem: 4,
      numero: "000126/2024",
      dataAbertura: "09/05/2024 14:22",
      dataConclusao: "-",
      tipo: "Integração",
      titulo: "Falha na integração com Fiplan",
      ambiente: "Produção",
      prioridade: "Alta",
      status: "Aguardando Informações",
      orgao: "SAD",
      responsavel: "Carlos Silva",
      usuario: "Taylor Santos",
      cpf: "123.456.789-00",
      matricula: "123456",
      numeroSolicitacaoPrestacao: "880126/2024",
      numeroRedmine: "",
      tempoAtendimento: "2d 1h",
      descricao: "Integração não retorna confirmação de pagamento.",
      mensagemErro: "Timeout ao chamar serviço FIPLAN.",
      anexos: [],
      historico: [{ id: "hist-seed-4", dataHora: "09/05/2024 14:22", usuario: "Carlos Silva (ANALISTA)", acao: "Solicitação de informações", observacao: "Analista solicitou evidências adicionais." }],
      comentarios: [{ id: "coment-seed-4", usuario: "Carlos Silva", perfil: "ANALISTA", dataHora: "09/05/2024 14:22", texto: "Solicitação de informações: envie o payload da integração." }],
      criadoPorUsuarioId: "suporte",
    },
  ];
}

function normalizeOcorrencias(raw: unknown): SicadOcorrenciaService[] {
  if (!Array.isArray(raw)) return seedOcorrencias();
  return raw.map((ocorrencia, index) => ({
    ...seedOcorrencias()[0],
    ...(ocorrencia as Partial<SicadOcorrenciaService>),
    ordem: (ocorrencia as SicadOcorrenciaService).ordem ?? index + 1,
    historico: (ocorrencia as SicadOcorrenciaService).historico ?? [],
    comentarios: (ocorrencia as SicadOcorrenciaService).comentarios ?? [],
    anexos: (ocorrencia as SicadOcorrenciaService).anexos ?? [],
  }));
}

export function listarSicadOcorrenciasMock(): SicadOcorrenciaService[] {
  if (typeof window === "undefined") return seedOcorrencias();

  const stored = window.localStorage.getItem(SICAD_OCORRENCIAS_STORAGE_KEY);
  if (!stored) {
    const seed = seedOcorrencias();
    salvarSicadOcorrenciasMock(seed);
    return seed;
  }

  try {
    return normalizeOcorrencias(JSON.parse(stored));
  } catch {
    const seed = seedOcorrencias();
    salvarSicadOcorrenciasMock(seed);
    return seed;
  }
}

export function salvarSicadOcorrenciasMock(ocorrencias: SicadOcorrenciaService[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SICAD_OCORRENCIAS_STORAGE_KEY, JSON.stringify(ocorrencias));
}

export function buscarSicadOcorrenciaPorIdMock(id: string) {
  return listarSicadOcorrenciasMock().find((ocorrencia) => ocorrencia.id === id) ?? listarSicadOcorrenciasMock()[0];
}

export function listarSicadMinhasOcorrenciasMock(usuario: SicadUsuarioMockado) {
  const ocorrencias = listarSicadOcorrenciasMock();
  if (usuario.perfil === "ADMINISTRADOR" || usuario.perfil === "GESTAO") return ocorrencias;
  if (usuario.perfil === "SUPORTE") return ocorrencias.filter((ocorrencia) => ocorrencia.criadoPorUsuarioId === usuario.id || ocorrencia.usuario.toLocaleUpperCase("pt-BR") === usuario.nome);
  return ocorrencias;
}

export function listarSicadFilaOcorrenciasMock() {
  return listarSicadOcorrenciasMock()
    .filter((ocorrencia) => ocorrencia.status !== "Concluído" && ocorrencia.status !== "Cancelado")
    .sort((a, b) => a.ordem - b.ordem);
}

export function criarSicadOcorrenciaMock(payload: SicadNovaOcorrenciaPayload, usuario: SicadUsuarioMockado) {
  const ocorrencias = listarSicadOcorrenciasMock();
  const year = new Date().getFullYear();
  const nextSequence = ocorrencias.length + 1;
  const numero = `${String(nextSequence).padStart(6, "0")}/${year}`;
  const ocorrencia: SicadOcorrenciaService = {
    id: numero.replace("/", "-"),
    ordem: ocorrencias.length + 1,
    numero,
    dataAbertura: formatNow(),
    dataConclusao: "-",
    tipo: payload.tipo,
    titulo: payload.titulo,
    ambiente: payload.ambiente,
    prioridade: payload.prioridade,
    status: "Novo",
    orgao: payload.orgao || "SEPLAG",
    responsavel: "",
    usuario: payload.usuarioAfetado || usuario.nome,
    cpf: payload.cpf || "-",
    matricula: payload.matricula || "-",
    numeroSolicitacaoPrestacao: payload.numeroSolicitacaoPrestacao || "-",
    numeroRedmine: "",
    tempoAtendimento: "0h",
    descricao: payload.descricao,
    mensagemErro: payload.mensagemErro,
    anexos: payload.anexos,
    historico: [criarHistorico(usuario, "Ocorrência criada", "Ocorrência registrada pelo usuário.")],
    comentarios: [],
    criadoPorUsuarioId: usuario.id,
  };

  salvarSicadOcorrenciasMock([ocorrencia, ...ocorrencias.map((item, index) => ({ ...item, ordem: index + 2 }))]);
  return ocorrencia;
}

export function atualizarSicadOcorrenciaMock(id: string, updater: (ocorrencia: SicadOcorrenciaService) => SicadOcorrenciaService) {
  const ocorrencias = listarSicadOcorrenciasMock();
  const next = ocorrencias.map((ocorrencia) => (ocorrencia.id === id ? updater(ocorrencia) : ocorrencia));
  salvarSicadOcorrenciasMock(next);
  return next.find((ocorrencia) => ocorrencia.id === id) ?? next[0];
}

export function alterarStatusSicadOcorrenciaMock(id: string, status: SicadOcorrenciaFluxoStatus, usuario: SicadUsuarioMockado, observacao: string) {
  return atualizarSicadOcorrenciaMock(id, (ocorrencia) => {
    const permitido = status === "Cancelado" || ocorrencia.status === status || statusPermitidos[ocorrencia.status]?.includes(status);
    const observacaoFinal = permitido
      ? `${observacao} Status anterior: ${ocorrencia.status}.`
      : `${observacao} Transição fora do fluxo mockado aceita para prototipação. Status anterior: ${ocorrencia.status}.`;

    return {
      ...ocorrencia,
      status,
      dataConclusao: status === "Concluído" ? formatNow() : ocorrencia.dataConclusao,
      historico: [...ocorrencia.historico, criarHistorico(usuario, "Status alterado", observacaoFinal)],
    };
  });
}

export function adicionarComentarioSicadOcorrenciaMock(id: string, usuario: SicadUsuarioMockado, texto: string) {
  return atualizarSicadOcorrenciaMock(id, (ocorrencia) => ({
    ...ocorrencia,
    comentarios: [...ocorrencia.comentarios, criarComentario(usuario, texto)],
    historico: [...ocorrencia.historico, criarHistorico(usuario, "Comentário adicionado", "Novo comentário registrado na ocorrência.")],
  }));
}

export function registrarHistoricoSicadOcorrenciaMock(id: string, usuario: SicadUsuarioMockado, acao: string, observacao: string) {
  return atualizarSicadOcorrenciaMock(id, (ocorrencia) => ({
    ...ocorrencia,
    historico: [...ocorrencia.historico, criarHistorico(usuario, acao, observacao)],
  }));
}

export function assumirSicadOcorrenciaMock(id: string, usuario: SicadUsuarioMockado) {
  return atualizarSicadOcorrenciaMock(id, (ocorrencia) => ({
    ...ocorrencia,
    responsavel: usuario.nome,
    status: "Em Análise",
    historico: [
      ...ocorrencia.historico,
      criarHistorico(usuario, "Assumiu a ocorrência", Responsável alterado para .),
      criarHistorico(usuario, "Status alterado", `Status alterado para Em Análise. Status anterior: ${ocorrencia.status}.`),
    ],
  }));
}

export function solicitarInformacoesSicadOcorrenciaMock(id: string, usuario: SicadUsuarioMockado, texto: string) {
  return atualizarSicadOcorrenciaMock(id, (ocorrencia) => ({
    ...ocorrencia,
    status: "Aguardando Informações",
    comentarios: [...ocorrencia.comentarios, criarComentario(usuario, Solicitação de informações: )],
    historico: [
      ...ocorrencia.historico,
      criarHistorico(usuario, "Solicitação de informações", "Analista solicitou informações complementares ao suporte."),
      criarHistorico(usuario, "Status alterado", `Status alterado para Aguardando Informações. Status anterior: ${ocorrencia.status}.`),
    ],
  }));
}

export function responderInformacoesSicadOcorrenciaMock(id: string, usuario: SicadUsuarioMockado, texto: string, anexos: SicadOcorrenciaAnexoService[]) {
  return atualizarSicadOcorrenciaMock(id, (ocorrencia) => ({
    ...ocorrencia,
    status: "Em Análise",
    anexos: [...ocorrencia.anexos, ...anexos],
    comentarios: [...ocorrencia.comentarios, criarComentario(usuario, Resposta do suporte: )],
    historico: [
      ...ocorrencia.historico,
      criarHistorico(usuario, "Informações complementadas", anexos.length ? Suporte respondeu e anexou  arquivo(s). : "Suporte respondeu a solicitação."),
      criarHistorico(usuario, "Status alterado", `Status alterado para Em Análise. Status anterior: ${ocorrencia.status}.`),
    ],
  }));
}

export function salvarRedmineSicadOcorrenciaMock(id: string, usuario: SicadUsuarioMockado, numeroRedmine: string, tipoModelo: string) {
  return atualizarSicadOcorrenciaMock(id, (ocorrencia) => ({
    ...ocorrencia,
    numeroRedmine,
    status: "Em Desenvolvimento",
    historico: [
      ...ocorrencia.historico,
      criarHistorico(usuario, "Número Redmine registrado", Número Redmine informado: .),
      criarHistorico(usuario, "Status alterado", `Status alterado para Em Desenvolvimento após geração do modelo ${tipoModelo}. Status anterior: ${ocorrencia.status}.`),
    ],
  }));
}

export function reordenarSicadFilaMock(id: string, direction: "up" | "down") {
  const ocorrencias = listarSicadOcorrenciasMock();
  const fila = listarSicadFilaOcorrenciasMock();
  const index = fila.findIndex((item) => item.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= fila.length) return fila;

  const nextFila = [...fila];
  [nextFila[index], nextFila[targetIndex]] = [nextFila[targetIndex], nextFila[index]];
  const ordemPorId = new Map(nextFila.map((item, itemIndex) => [item.id, itemIndex + 1]));
  const nextOcorrencias = ocorrencias.map((ocorrencia) => ({ ...ocorrencia, ordem: ordemPorId.get(ocorrencia.id) ?? ocorrencia.ordem }));
  salvarSicadOcorrenciasMock(nextOcorrencias);
  return listarSicadFilaOcorrenciasMock();
}

