// Objeto genérico de fluxo de aprovação (decisão da reunião — Ronaldo + Ângela).
//
// Um único modelo parametrizável, aplicável a qualquer registro funcional ou financeiro (férias,
// licenças, afastamentos, rubricas). Cada tipo de registro é identificado por uma `chave` e
// possui uma configuração que define:
//   - se exige aprovação ou não;
//   - quantos níveis de aprovação (cada nível amarrado a um perfil), podendo desligar níveis;
//   - se há publicação no Diário Oficial como etapa final;
//   - a documentação obrigatória que o aprovador deve conferir.
//
// Funções puras (exceto o par carregar/salvar, que usa localStorage). Sem React/DOM.

export const CHAVE_FLUXO_SUSPENSAO_ART16 = "FERIAS:SUSPENSAO_ART16";
export const CHAVE_FLUXO_SUSPENSAO_ART17 = "FERIAS:SUSPENSAO_ART17";

export const FLUXOS_STORAGE_KEY = "prototype-ferias-fluxos-aprovacao-v1";

export interface NivelAprovacao {
  /** Ordem de execução (1 = primeiro). */
  ordem: number;
  /** Perfil que decide neste nível (ex.: "DRE / RH Central"). */
  perfil: string;
  rotulo: string;
  /** Nível desligado é ignorado para novos processos. */
  ativo: boolean;
}

export interface ConfiguracaoFluxo {
  chave: string;
  descricao: string;
  exigeAprovacao: boolean;
  niveis: NivelAprovacao[];
  /** Publicação no Diário Oficial como etapa final (após o último nível aprovar). */
  publicacaoDiarioOficial: boolean;
  /** Documentação que o aprovador confere antes de decidir. */
  documentosObrigatorios: string[];
}

export type StatusProcessoAprovacao = "PENDENTE" | "AGUARDANDO_PUBLICACAO" | "APROVADO" | "REJEITADO";

export interface DecisaoAprovacao {
  ordem: number;
  perfil: string;
  decisao: "APROVADO" | "REJEITADO";
  responsavel: string;
  matricula?: string;
  em: string;
  justificativa?: string;
  documentacaoConferida?: boolean;
}

export interface ProcessoAprovacao {
  chave: string;
  status: StatusProcessoAprovacao;
  /** Ordem do nível que deve decidir agora; null quando o processo não aguarda nível. */
  nivelAtual: number | null;
  /** Níveis ativos congelados no início do processo (desligar um nível não afeta o que já tramita). */
  niveis: NivelAprovacao[];
  publicacaoDiarioOficial: boolean;
  documentosObrigatorios: string[];
  iniciadoEm: string;
  decisoes: DecisaoAprovacao[];
  publicacao?: { numero: string; data: string };
}

export const FLUXOS_PADRAO: ConfiguracaoFluxo[] = [
  {
    chave: CHAVE_FLUXO_SUSPENSAO_ART16,
    descricao: "Suspensão de férias — Art. 16 (licença gestante/adotante/paternidade)",
    // Registrada pela perícia médica via tela de licenças: não exige aprovador adicional.
    exigeAprovacao: false,
    niveis: [],
    publicacaoDiarioOficial: false,
    documentosObrigatorios: [],
  },
  {
    chave: CHAVE_FLUXO_SUSPENSAO_ART17,
    descricao: "Suspensão de férias — Art. 17 (superior interesse público)",
    // Setorial registra; o registro fica pendente até o órgão central validar.
    exigeAprovacao: true,
    niveis: [{ ordem: 1, perfil: "DRE / RH Central", rotulo: "Órgão central", ativo: true }],
    publicacaoDiarioOficial: false,
    documentosObrigatorios: ["Autorização da chefia imediata", "Autorização do dirigente máximo do órgão ou entidade"],
  },
];

const SEM_APROVACAO = (chave: string): ConfiguracaoFluxo => ({
  chave,
  descricao: chave,
  exigeAprovacao: false,
  niveis: [],
  publicacaoDiarioOficial: false,
  documentosObrigatorios: [],
});

export function obterFluxo(fluxos: ConfiguracaoFluxo[], chave: string): ConfiguracaoFluxo {
  return fluxos.find((f) => f.chave === chave) ?? FLUXOS_PADRAO.find((f) => f.chave === chave) ?? SEM_APROVACAO(chave);
}

export function niveisAtivos(fluxo: ConfiguracaoFluxo): NivelAprovacao[] {
  return fluxo.niveis.filter((n) => n.ativo).sort((a, b) => a.ordem - b.ordem);
}

/** O fluxo só exige aprovação se estiver ligado E houver ao menos um nível ativo. Desligar todos
 * os validadores equivale a "sem aprovação" — o registro é efetivado direto (decisão política). */
export function fluxoExigeAprovacao(fluxo: ConfiguracaoFluxo): boolean {
  return fluxo.exigeAprovacao && niveisAtivos(fluxo).length > 0;
}

/** Inicia o processo de aprovação; retorna null quando o fluxo não exige aprovação. */
export function iniciarProcesso(fluxo: ConfiguracaoFluxo, em: string): ProcessoAprovacao | null {
  if (!fluxoExigeAprovacao(fluxo)) return null;
  const niveis = niveisAtivos(fluxo);
  return {
    chave: fluxo.chave,
    status: "PENDENTE",
    nivelAtual: niveis[0].ordem,
    niveis,
    publicacaoDiarioOficial: fluxo.publicacaoDiarioOficial,
    documentosObrigatorios: [...fluxo.documentosObrigatorios],
    iniciadoEm: em,
    decisoes: [],
  };
}

export function nivelDoProcesso(processo: ProcessoAprovacao): NivelAprovacao | null {
  if (processo.nivelAtual === null) return null;
  return processo.niveis.find((n) => n.ordem === processo.nivelAtual) ?? null;
}

/** Perfil responsável pela etapa corrente (nível atual ou, na publicação, o último nível). */
export function perfilResponsavelEtapa(processo: ProcessoAprovacao): string | null {
  if (processo.status === "PENDENTE") return nivelDoProcesso(processo)?.perfil ?? null;
  if (processo.status === "AGUARDANDO_PUBLICACAO") return processo.niveis[processo.niveis.length - 1]?.perfil ?? null;
  return null;
}

export function perfilPodeDecidir(processo: ProcessoAprovacao | undefined, perfil: string): boolean {
  if (!processo) return false;
  return perfilResponsavelEtapa(processo) === perfil;
}

export function processoEfetivado(processo: ProcessoAprovacao): boolean {
  return processo.status === "APROVADO";
}

export type ResultadoFluxo =
  | { sucesso: true; processo: ProcessoAprovacao }
  | { sucesso: false; mensagem: string };

export interface EntradaDecisao {
  perfil: string;
  decisao: "APROVADO" | "REJEITADO";
  responsavel: string;
  matricula?: string;
  em: string;
  justificativa?: string;
  documentacaoConferida?: boolean;
}

/** Registra a decisão do nível corrente. Aprovar avança para o próximo nível; no último nível
 * conclui (ou aguarda a publicação no DO, se o fluxo exigir). Rejeitar encerra o processo e
 * exige justificativa. A aprovação exige a conferência da documentação obrigatória. */
export function registrarDecisao(processo: ProcessoAprovacao, entrada: EntradaDecisao): ResultadoFluxo {
  if (processo.status !== "PENDENTE") {
    return { sucesso: false, mensagem: "O processo não está aguardando decisão de nível." };
  }
  const nivel = nivelDoProcesso(processo);
  if (!nivel || nivel.perfil !== entrada.perfil) {
    return { sucesso: false, mensagem: "O perfil informado não é o responsável pela etapa atual do fluxo." };
  }
  if (entrada.decisao === "REJEITADO" && !entrada.justificativa?.trim()) {
    return { sucesso: false, mensagem: "Informe a justificativa da rejeição." };
  }
  if (entrada.decisao === "APROVADO" && processo.documentosObrigatorios.length && !entrada.documentacaoConferida) {
    return { sucesso: false, mensagem: "Confirme a conferência da documentação obrigatória antes de aprovar." };
  }
  const decisao: DecisaoAprovacao = {
    ordem: nivel.ordem,
    perfil: entrada.perfil,
    decisao: entrada.decisao,
    responsavel: entrada.responsavel,
    matricula: entrada.matricula,
    em: entrada.em,
    justificativa: entrada.justificativa?.trim() || undefined,
    documentacaoConferida: entrada.documentacaoConferida,
  };
  const decisoes = [...processo.decisoes, decisao];
  if (entrada.decisao === "REJEITADO") {
    return { sucesso: true, processo: { ...processo, status: "REJEITADO", nivelAtual: null, decisoes } };
  }
  const proximo = processo.niveis.find((n) => n.ordem > nivel.ordem);
  if (proximo) {
    return { sucesso: true, processo: { ...processo, nivelAtual: proximo.ordem, decisoes } };
  }
  if (processo.publicacaoDiarioOficial) {
    return { sucesso: true, processo: { ...processo, status: "AGUARDANDO_PUBLICACAO", nivelAtual: null, decisoes } };
  }
  return { sucesso: true, processo: { ...processo, status: "APROVADO", nivelAtual: null, decisoes } };
}

/** Etapa final opcional: registra a publicação no Diário Oficial e efetiva o processo. */
export function registrarPublicacao(
  processo: ProcessoAprovacao,
  perfil: string,
  publicacao: { numero: string; data: string },
): ResultadoFluxo {
  if (processo.status !== "AGUARDANDO_PUBLICACAO") {
    return { sucesso: false, mensagem: "O processo não está aguardando publicação no Diário Oficial." };
  }
  if (perfilResponsavelEtapa(processo) !== perfil) {
    return { sucesso: false, mensagem: "O perfil informado não é o responsável pela publicação." };
  }
  if (!publicacao.numero.trim() || !publicacao.data) {
    return { sucesso: false, mensagem: "Informe o número e a data da publicação no Diário Oficial." };
  }
  return {
    sucesso: true,
    processo: { ...processo, status: "APROVADO", publicacao: { numero: publicacao.numero.trim(), data: publicacao.data } },
  };
}

/** Valida uma configuração antes de salvar a parametrização. */
export function validarConfiguracaoFluxo(fluxo: ConfiguracaoFluxo): string | null {
  if (fluxo.exigeAprovacao && niveisAtivos(fluxo).length === 0) {
    return "Fluxo com aprovação ligada precisa de ao menos um nível ativo. Desligue a aprovação para efetivar direto.";
  }
  const ordens = fluxo.niveis.map((n) => n.ordem);
  if (new Set(ordens).size !== ordens.length) return "Há níveis com a mesma ordem.";
  return null;
}

export function carregarFluxos(): ConfiguracaoFluxo[] {
  try {
    const salvos = JSON.parse(localStorage.getItem(FLUXOS_STORAGE_KEY) ?? "null") as ConfiguracaoFluxo[] | null;
    if (!Array.isArray(salvos)) return FLUXOS_PADRAO.map((f) => ({ ...f, niveis: f.niveis.map((n) => ({ ...n })) }));
    return FLUXOS_PADRAO.map((padrao) => salvos.find((s) => s.chave === padrao.chave) ?? padrao);
  } catch {
    return FLUXOS_PADRAO;
  }
}

export function salvarFluxos(fluxos: ConfiguracaoFluxo[]): void {
  localStorage.setItem(FLUXOS_STORAGE_KEY, JSON.stringify(fluxos));
}
