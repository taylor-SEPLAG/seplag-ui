export type SicadPerfilAcesso =
  | "SUPORTE"
  | "ANALISTA"
  | "GESTAO"
  | "ADMINISTRADOR"
  | "HOMOLOGADOR";

export type SicadPermissaoOcorrencia =
  | "acessarNovaOcorrencia"
  | "acessarMinhasOcorrencias"
  | "acessarFilaOcorrencias"
  | "acessarDashboard"
  | "acessarRelatorios"
  | "acessarBaseConhecimento"
  | "visualizarOcorrenciasAbertas"
  | "visualizarTodasOcorrencias"
  | "visualizarOcorrenciasValidacao"
  | "responderSolicitacaoInformacoes"
  | "anexarArquivosAguardandoInformacoes"
  | "assumirOcorrencia"
  | "alterarStatus"
  | "solicitarInformacoesSuporte"
  | "registrarAnaliseInterna"
  | "gerarModeloRedmine"
  | "informarNumeroRedmine"
  | "concluirTecnicamente"
  | "alterarPrioridade"
  | "alterarResponsavel"
  | "reabrirOcorrencia"
  | "exportarRelatorios"
  | "configurarCadastros"
  | "aprovarSolucao"
  | "reprovarSolucao"
  | "comentarOcorrencia"
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
  SicadPermissaoOcorrencia[]
> = {
  SUPORTE: [
    "acessarNovaOcorrencia",
    "acessarMinhasOcorrencias",
    "visualizarOcorrenciasAbertas",
    "responderSolicitacaoInformacoes",
    "anexarArquivosAguardandoInformacoes",
    "acessarBaseConhecimento",
  ],
  ANALISTA: [
    "acessarFilaOcorrencias",
    "visualizarTodasOcorrencias",
    "assumirOcorrencia",
    "alterarStatus",
    "solicitarInformacoesSuporte",
    "registrarAnaliseInterna",
    "gerarModeloRedmine",
    "informarNumeroRedmine",
    "concluirTecnicamente",
    "acessarBaseConhecimento",
  ],
  GESTAO: [
    "visualizarTodasOcorrencias",
    "acessarDashboard",
    "acessarRelatorios",
    "alterarPrioridade",
    "alterarResponsavel",
    "reabrirOcorrencia",
    "exportarRelatorios",
    "acessarBaseConhecimento",
  ],
  ADMINISTRADOR: ["acessarTudo"],
  HOMOLOGADOR: [
    "visualizarOcorrenciasValidacao",
    "aprovarSolucao",
    "reprovarSolucao",
    "comentarOcorrencia",
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
  permissao: SicadPermissaoOcorrencia,
  usuario: SicadUsuarioMockado = sicadUsuarioMockado,
) {
  const permissoes = sicadPermissoesPorPerfil[usuario.perfil] ?? [];

  return permissoes.includes("acessarTudo") || permissoes.includes(permissao);
}

export function sicadTemAlgumaPermissao(
  permissoes: SicadPermissaoOcorrencia[],
  usuario: SicadUsuarioMockado = sicadUsuarioMockado,
) {
  return permissoes.some((permissao) => sicadTemPermissao(permissao, usuario));
}

