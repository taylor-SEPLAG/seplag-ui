import type { SicadUsuarioMockado } from "./sicadAccessMock";

export type SicadChamadoFluxoStatus =
  | "Novo"
  | "Em Análise"
  | "Aguardando Informações"
  | "Em Desenvolvimento"
  | "Em Validação"
  | "Concluído"
  | "Cancelado";

export type SicadChamadoAnexoService = {
  nome: string;
  tamanho: string;
  dataHora: string;
};

export type SicadChamadoHistoricoService = {
  id: string;
  dataHora: string;
  usuario: string;
  acao: string;
  observacao: string;
};

export type SicadChamadoComentarioService = {
  id: string;
  usuario: string;
  perfil: string;
  dataHora: string;
  texto: string;
};

export type SicadChamadoService = {
  id: string;
  ordem: number;
  numero: string;
  dataAbertura: string;
  dataConclusao: string;
  tipo: string;
  titulo: string;
  ambiente: string;
  prioridade: string;
  status: SicadChamadoFluxoStatus;
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
  anexos: SicadChamadoAnexoService[];
  historico: SicadChamadoHistoricoService[];
  comentarios: SicadChamadoComentarioService[];
  criadoPorUsuarioId: string;
};

export type SicadNovoChamadoPayload = {
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
  anexos: SicadChamadoAnexoService[];
};

const SICAD_CHAMADOS_STORAGE_KEY = "sicad.chamadosMock.v1";

const statusPermitidos: Record<SicadChamadoFluxoStatus, SicadChamadoFluxoStatus[]> = {
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

function criarHistorico(usuario: SicadUsuarioMockado, acao: string, observacao: string): SicadChamadoHistoricoService {
  return {
    id: createId("hist"),
    dataHora: formatNow(),
    usuario: `${usuario.nome} (${usuario.perfil})`,
    acao,
    observacao,
  };
}

function criarComentario(usuario: SicadUsuarioMockado, texto: string): SicadChamadoComentarioService {
  return {
    id: createId("coment"),
    usuario: usuario.nome,
    perfil: usuario.perfil,
    dataHora: formatNow(),
    texto,
  };
}

function seedChamados(): SicadChamadoService[] {
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
        { id: "hist-seed-1", dataHora: "10/05/2025 14:32", usuario: "Taylor Santos (SUPORTE)", acao: "Chamado criado", observacao: "Chamado registrado pelo usuário." },
      ],
      comentarios: [
        { id: "coment-seed-1", usuario: "Taylor Santos", perfil: "SUPORTE", dataHora: "10/05/2025 14:32", texto: "Chamado aberto para análise da equipe técnica." },
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
      historico: [{ id: "hist-seed-2", dataHora: "10/05/2024 10:32", usuario: "João Silva (SUPORTE)", acao: "Chamado criado", observacao: "Chamado registrado pelo suporte." }],
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
      historico: [{ id: "hist-seed-3", dataHora: "09/05/2024 16:48", usuario: "Ana Oliveira (ANALISTA)", acao: "Status alterado", observacao: "Chamado assumido para análise." }],
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

function normalizeChamados(raw: unknown): SicadChamadoService[] {
  if (!Array.isArray(raw)) return seedChamados();
  return raw.map((chamado, index) => ({
    ...seedChamados()[0],
    ...(chamado as Partial<SicadChamadoService>),
    ordem: (chamado as SicadChamadoService).ordem ?? index + 1,
    historico: (chamado as SicadChamadoService).historico ?? [],
    comentarios: (chamado as SicadChamadoService).comentarios ?? [],
    anexos: (chamado as SicadChamadoService).anexos ?? [],
  }));
}

export function listarSicadChamadosMock(): SicadChamadoService[] {
  if (typeof window === "undefined") return seedChamados();

  const stored = window.localStorage.getItem(SICAD_CHAMADOS_STORAGE_KEY);
  if (!stored) {
    const seed = seedChamados();
    salvarSicadChamadosMock(seed);
    return seed;
  }

  try {
    return normalizeChamados(JSON.parse(stored));
  } catch {
    const seed = seedChamados();
    salvarSicadChamadosMock(seed);
    return seed;
  }
}

export function salvarSicadChamadosMock(chamados: SicadChamadoService[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SICAD_CHAMADOS_STORAGE_KEY, JSON.stringify(chamados));
}

export function buscarSicadChamadoPorIdMock(id: string) {
  return listarSicadChamadosMock().find((chamado) => chamado.id === id) ?? listarSicadChamadosMock()[0];
}

export function listarSicadMeusChamadosMock(usuario: SicadUsuarioMockado) {
  const chamados = listarSicadChamadosMock();
  if (usuario.perfil === "ADMINISTRADOR" || usuario.perfil === "GESTAO") return chamados;
  if (usuario.perfil === "SUPORTE") return chamados.filter((chamado) => chamado.criadoPorUsuarioId === usuario.id || chamado.usuario.toLocaleUpperCase("pt-BR") === usuario.nome);
  return chamados;
}

export function listarSicadFilaChamadosMock() {
  return listarSicadChamadosMock()
    .filter((chamado) => chamado.status !== "Concluído" && chamado.status !== "Cancelado")
    .sort((a, b) => a.ordem - b.ordem);
}

export function criarSicadChamadoMock(payload: SicadNovoChamadoPayload, usuario: SicadUsuarioMockado) {
  const chamados = listarSicadChamadosMock();
  const year = new Date().getFullYear();
  const nextSequence = chamados.length + 1;
  const numero = `${String(nextSequence).padStart(6, "0")}/${year}`;
  const chamado: SicadChamadoService = {
    id: numero.replace("/", "-"),
    ordem: chamados.length + 1,
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
    historico: [criarHistorico(usuario, "Chamado criado", "Chamado registrado pelo usuário.")],
    comentarios: [],
    criadoPorUsuarioId: usuario.id,
  };

  salvarSicadChamadosMock([chamado, ...chamados.map((item, index) => ({ ...item, ordem: index + 2 }))]);
  return chamado;
}

export function atualizarSicadChamadoMock(id: string, updater: (chamado: SicadChamadoService) => SicadChamadoService) {
  const chamados = listarSicadChamadosMock();
  const next = chamados.map((chamado) => (chamado.id === id ? updater(chamado) : chamado));
  salvarSicadChamadosMock(next);
  return next.find((chamado) => chamado.id === id) ?? next[0];
}

export function alterarStatusSicadChamadoMock(id: string, status: SicadChamadoFluxoStatus, usuario: SicadUsuarioMockado, observacao: string) {
  return atualizarSicadChamadoMock(id, (chamado) => {
    const permitido = status === "Cancelado" || chamado.status === status || statusPermitidos[chamado.status]?.includes(status);
    const observacaoFinal = permitido
      ? `${observacao} Status anterior: ${chamado.status}.`
      : `${observacao} Transição fora do fluxo mockado aceita para prototipação. Status anterior: ${chamado.status}.`;

    return {
      ...chamado,
      status,
      dataConclusao: status === "Concluído" ? formatNow() : chamado.dataConclusao,
      historico: [...chamado.historico, criarHistorico(usuario, "Status alterado", observacaoFinal)],
    };
  });
}

export function adicionarComentarioSicadChamadoMock(id: string, usuario: SicadUsuarioMockado, texto: string) {
  return atualizarSicadChamadoMock(id, (chamado) => ({
    ...chamado,
    comentarios: [...chamado.comentarios, criarComentario(usuario, texto)],
    historico: [...chamado.historico, criarHistorico(usuario, "Comentário adicionado", "Novo comentário registrado no chamado.")],
  }));
}

export function registrarHistoricoSicadChamadoMock(id: string, usuario: SicadUsuarioMockado, acao: string, observacao: string) {
  return atualizarSicadChamadoMock(id, (chamado) => ({
    ...chamado,
    historico: [...chamado.historico, criarHistorico(usuario, acao, observacao)],
  }));
}

export function assumirSicadChamadoMock(id: string, usuario: SicadUsuarioMockado) {
  return atualizarSicadChamadoMock(id, (chamado) => ({
    ...chamado,
    responsavel: usuario.nome,
    status: "Em Análise",
    historico: [
      ...chamado.historico,
      criarHistorico(usuario, "Assumiu o chamado", "Responsável alterado para " + usuario.nome + "."),
      criarHistorico(usuario, "Status alterado", `Status alterado para Em Análise. Status anterior: ${chamado.status}.`),
    ],
  }));
}

export function solicitarInformacoesSicadChamadoMock(id: string, usuario: SicadUsuarioMockado, texto: string) {
  return atualizarSicadChamadoMock(id, (chamado) => ({
    ...chamado,
    status: "Aguardando Informações",
    comentarios: [...chamado.comentarios, criarComentario(usuario, "Solicitação de informações: " + texto)],
    historico: [
      ...chamado.historico,
      criarHistorico(usuario, "Solicitação de informações", "Analista solicitou informações complementares ao suporte."),
      criarHistorico(usuario, "Status alterado", `Status alterado para Aguardando Informações. Status anterior: ${chamado.status}.`),
    ],
  }));
}

export function responderInformacoesSicadChamadoMock(id: string, usuario: SicadUsuarioMockado, texto: string, anexos: SicadChamadoAnexoService[]) {
  return atualizarSicadChamadoMock(id, (chamado) => ({
    ...chamado,
    status: "Em Análise",
    anexos: [...chamado.anexos, ...anexos],
    comentarios: [...chamado.comentarios, criarComentario(usuario, "Resposta do suporte: " + texto)],
    historico: [
      ...chamado.historico,
      criarHistorico(usuario, "Informações complementadas", anexos.length ? "Suporte respondeu e anexou " + anexos.length + " arquivo(s)." : "Suporte respondeu a solicitação."),
      criarHistorico(usuario, "Status alterado", `Status alterado para Em Análise. Status anterior: ${chamado.status}.`),
    ],
  }));
}

export function salvarRedmineSicadChamadoMock(id: string, usuario: SicadUsuarioMockado, numeroRedmine: string, tipoModelo: string) {
  return atualizarSicadChamadoMock(id, (chamado) => ({
    ...chamado,
    numeroRedmine,
    status: "Em Desenvolvimento",
    historico: [
      ...chamado.historico,
      criarHistorico(usuario, "Número Redmine registrado", "Número Redmine informado: " + numeroRedmine + "."),
      criarHistorico(usuario, "Status alterado", `Status alterado para Em Desenvolvimento após geração do modelo ${tipoModelo}. Status anterior: ${chamado.status}.`),
    ],
  }));
}

export function reordenarSicadFilaMock(id: string, direction: "up" | "down") {
  const chamados = listarSicadChamadosMock();
  const fila = listarSicadFilaChamadosMock();
  const index = fila.findIndex((item) => item.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= fila.length) return fila;

  const nextFila = [...fila];
  [nextFila[index], nextFila[targetIndex]] = [nextFila[targetIndex], nextFila[index]];
  const ordemPorId = new Map(nextFila.map((item, itemIndex) => [item.id, itemIndex + 1]));
  const nextChamados = chamados.map((chamado) => ({ ...chamado, ordem: ordemPorId.get(chamado.id) ?? chamado.ordem }));
  salvarSicadChamadosMock(nextChamados);
  return listarSicadFilaChamadosMock();
}






