export type SicadPerfilAcesso =
  | "SUPORTE"
  | "ANALISTA"
  | "GESTAO"
  | "ADMINISTRADOR"
  | "HOMOLOGADOR";

export type SicadPermissaoChamado =
  | "acessarNovoChamado"
  | "acessarMeusChamados"
  | "acessarFilaChamados"
  | "acessarDashboard"
  | "acessarRelatorios"
  | "acessarBaseConhecimento"
  | "visualizarChamadosAbertas"
  | "visualizarTodasChamados"
  | "visualizarChamadosValidacao"
  | "responderSolicitacaoInformacoes"
  | "anexarArquivosAguardandoInformacoes"
  | "assumirChamado"
  | "alterarStatus"
  | "solicitarInformacoesSuporte"
  | "registrarAnaliseInterna"
  | "gerarModeloRedmine"
  | "informarNumeroRedmine"
  | "concluirTecnicamente"
  | "alterarPrioridade"
  | "alterarResponsavel"
  | "reabrirChamado"
  | "exportarRelatorios"
  | "configurarCadastros"
  | "aprovarSolucao"
  | "reprovarSolucao"
  | "comentarChamado"
  | "acessarTudo";

export interface SicadUsuarioMockado {
  id: string;
  nome: string;
  perfil: SicadPerfilAcesso;
}

export const sicadPerfisAcesso: SicadPerfilAcesso[] = [
  "SUPORTE",
  "ANALISTA",
  "GESTAO",
  "ADMINISTRADOR",
  "HOMOLOGADOR",
];

export const sicadUsuariosMockados: SicadUsuarioMockado[] = [
  { id: "analista-taylor", nome: "TAYLOR SANTOS", perfil: "ANALISTA" },
  { id: "suporte", nome: "JOÃO SILVA", perfil: "SUPORTE" },
  { id: "gestao", nome: "ANA OLIVEIRA", perfil: "GESTAO" },
  { id: "administrador", nome: "ROBERTO JUNIOR", perfil: "ADMINISTRADOR" },
  { id: "homologador", nome: "MARIANA COSTA", perfil: "HOMOLOGADOR" },
];

export const sicadPermissoesPorPerfil: Record<
  SicadPerfilAcesso,
  SicadPermissaoChamado[]
> = {
  SUPORTE: [
    "acessarNovoChamado",
    "acessarMeusChamados",
    "visualizarChamadosAbertas",
    "responderSolicitacaoInformacoes",
    "anexarArquivosAguardandoInformacoes",
    "acessarBaseConhecimento",
  ],
  ANALISTA: [
    "acessarFilaChamados",
    "visualizarTodasChamados",
    "assumirChamado",
    "alterarStatus",
    "solicitarInformacoesSuporte",
    "registrarAnaliseInterna",
    "gerarModeloRedmine",
    "informarNumeroRedmine",
    "concluirTecnicamente",
    "acessarBaseConhecimento",
  ],
  GESTAO: [
    "visualizarTodasChamados",
    "acessarDashboard",
    "acessarRelatorios",
    "alterarPrioridade",
    "alterarResponsavel",
    "reabrirChamado",
    "exportarRelatorios",
    "acessarBaseConhecimento",
  ],
  ADMINISTRADOR: ["acessarTudo"],
  HOMOLOGADOR: [
    "visualizarChamadosValidacao",
    "aprovarSolucao",
    "reprovarSolucao",
    "comentarChamado",
    "acessarBaseConhecimento",
  ],
};

const SICAD_USUARIO_MOCKADO_STORAGE_KEY = "sicad.usuarioMockadoId";
const sicadUsuarioMockadoPadrao = sicadUsuariosMockados.find((usuario) => usuario.perfil === "ADMINISTRADOR") ?? sicadUsuariosMockados[0];

function getSicadUsuarioMockadoInicial() {
  if (typeof window === "undefined") return sicadUsuarioMockadoPadrao;

  const usuarioId = window.localStorage.getItem(SICAD_USUARIO_MOCKADO_STORAGE_KEY);

  return (
    sicadUsuariosMockados.find((usuario) => usuario.id === usuarioId) ??
    sicadUsuarioMockadoPadrao
  );
}

export const sicadUsuarioMockado: SicadUsuarioMockado = getSicadUsuarioMockadoInicial();

export function sicadSelecionarUsuarioMockado(usuarioId: string) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(SICAD_USUARIO_MOCKADO_STORAGE_KEY, usuarioId);
  window.location.reload();
}

export function sicadTemPermissao(
  permissao: SicadPermissaoChamado,
  usuario: SicadUsuarioMockado = sicadUsuarioMockado,
) {
  const permissoes = sicadPermissoesPorPerfil[usuario.perfil] ?? [];

  return permissoes.includes("acessarTudo") || permissoes.includes(permissao);
}

export function sicadTemAlgumaPermissao(
  permissoes: SicadPermissaoChamado[],
  usuario: SicadUsuarioMockado = sicadUsuarioMockado,
) {
  return permissoes.some((permissao) => sicadTemPermissao(permissao, usuario));
}


