export type SigepModuleStatus =
  | "PLANEJADO"
  | "EM_PROTOTIPACAO"
  | "PROTOTIPO_CONCLUIDO"
  | "AGUARDANDO_VALIDACAO"
  | "INTEGRACAO_PENDENTE";

export type SigepDomain =
  | "BASE_JURIDICA"
  | "CADASTROS"
  | "CONTROLE_VAGAS"
  | "INGRESSO"
  | "VIDA_FUNCIONAL"
  | "GESTAO";

export interface SigepSystemModule {
  id: string;
  name: string;
  shortDescription: string;
  objective: string;
  domain: SigepDomain;
  status: SigepModuleStatus;
  icon: string;
  route?: string;
  dependsOn: readonly string[];
  impacts: readonly string[];
  inputs: readonly string[];
  outputs: readonly string[];
  pending: readonly string[];
}

export const sigepDomainLabels: Record<SigepDomain, string> = {
  BASE_JURIDICA: "Base jurídica",
  CADASTROS: "Cadastros estruturantes",
  CONTROLE_VAGAS: "Estrutura e controle das vagas",
  INGRESSO: "Ingresso do servidor",
  VIDA_FUNCIONAL: "Vida funcional e movimentações",
  GESTAO: "Gestão e planejamento",
};

export const sigepStatusLabels: Record<SigepModuleStatus, string> = {
  PLANEJADO: "Planejado",
  EM_PROTOTIPACAO: "Em prototipação",
  PROTOTIPO_CONCLUIDO: "Protótipo concluído",
  AGUARDANDO_VALIDACAO: "Aguardando validação",
  INTEGRACAO_PENDENTE: "Integração pendente",
};

export const sigepSystemModules: readonly SigepSystemModule[] = [
  {
    id: "documentos-legais", name: "Documentos legais", shortDescription: "Leis, decretos e atos normativos.", objective: "Manter a fonte jurídica usada na criação e evolução das estruturas funcionais.", domain: "BASE_JURIDICA", status: "INTEGRACAO_PENDENTE", icon: "pi pi-book", dependsOn: [], impacts: ["quadro-autorizado", "distribuicao", "movimentacoes"], inputs: ["Lei, decreto ou ato", "Vigência", "Publicação"], outputs: ["Documento legal identificável", "Fundamento e vigência"], pending: ["Integrar o seletor já usado nos protótipos ao cadastro corporativo"],
  },
  {
    id: "carreiras-cargos", name: "Carreiras, cargos e perfis", shortDescription: "Estrutura funcional e referência CBO.", objective: "Fornecer as classificações usadas pelo quadro, ingresso, vínculos e movimentações.", domain: "CADASTROS", status: "EM_PROTOTIPACAO", icon: "pi pi-briefcase", route: "/prototipos/sigep/cargo", dependsOn: ["documentos-legais"], impacts: ["quadro-autorizado", "ingresso", "movimentacoes"], inputs: ["Carreira", "Cargo", "Perfil profissional", "CBO"], outputs: ["Catálogo funcional", "Regras de compatibilidade"], pending: ["Substituir a base temporária pelo cadastro definitivo", "Homologar perfis profissionais"],
  },
  {
    id: "estrutura-organizacional", name: "Estrutura organizacional", shortDescription: "Órgãos, unidades e hierarquia.", objective: "Fornecer titularidade, distribuição, lotação, exercício e destinos válidos.", domain: "CADASTROS", status: "INTEGRACAO_PENDENTE", icon: "pi pi-sitemap", dependsOn: [], impacts: ["quadro-autorizado", "distribuicao", "movimentacoes"], inputs: ["Órgãos", "Unidades", "Hierarquia e vigência"], outputs: ["Estrutura organizacional vigente"], pending: ["Integrar com o módulo de Estrutura Organizacional"],
  },
  {
    id: "quadro-autorizado", name: "Quadro Autorizado", shortDescription: "Limite legal versionado de vagas.", objective: "Materializar o quantitativo legal autorizado por lei para cargos efetivos e comissionados.", domain: "CONTROLE_VAGAS", status: "PROTOTIPO_CONCLUIDO", icon: "pi pi-file-check", route: "/prototipos/sigep/controle-vagas/quadro-autorizado", dependsOn: ["documentos-legais", "carreiras-cargos", "estrutura-organizacional"], impacts: ["vagas-individualizadas", "distribuicao", "ingresso", "dashboard"], inputs: ["Documento legal", "Carreira e cargo", "Quantitativo", "Destinação legal"], outputs: ["Versão do quadro", "Vagas individualizadas", "Histórico legal"], pending: ["Persistência em backend", "Validação jurídica integrada"],
  },
  {
    id: "vagas-individualizadas", name: "Vagas Individualizadas", shortDescription: "Identidade, estado e histórico da vaga.", objective: "Acompanhar cada vaga, quem a ocupa, sua posição legal, distribuição e eventos funcionais.", domain: "CONTROLE_VAGAS", status: "PROTOTIPO_CONCLUIDO", icon: "pi pi-list", route: "/prototipos/sigep/controle-vagas/vagas", dependsOn: ["quadro-autorizado"], impacts: ["ingresso", "movimentacoes", "projecoes", "dashboard"], inputs: ["Quadro vigente", "Ocupações", "Distribuições", "Eventos funcionais"], outputs: ["Estado da vaga", "Ocupação nominal", "Histórico temporal"], pending: ["Receber eventos reais de Ingresso e Vida Funcional"],
  },
  {
    id: "distribuicao", name: "Distribuição", shortDescription: "Destinação formal das vagas aos órgãos.", objective: "Distribuir e redistribuir vagas disponíveis de um quadro sem movimentar pessoas.", domain: "CONTROLE_VAGAS", status: "PROTOTIPO_CONCLUIDO", icon: "pi pi-share-alt", route: "/prototipos/sigep/controle-vagas/distribuicao", dependsOn: ["quadro-autorizado", "vagas-individualizadas", "estrutura-organizacional", "documentos-legais"], impacts: ["vagas-individualizadas", "ingresso", "dashboard"], inputs: ["Quadro", "Vagas disponíveis", "Ato", "Órgão de destino"], outputs: ["Órgão de distribuição atual", "Histórico de distribuição"], pending: ["Validar atos e órgãos permitidos com fontes reais"],
  },
  {
    id: "ingresso", name: "Ingresso do Servidor", shortDescription: "Concurso, nomeação, posse e exercício.", objective: "Planejar e executar o ingresso até a criação do vínculo e ocupação da vaga.", domain: "INGRESSO", status: "EM_PROTOTIPACAO", icon: "pi pi-user-plus", route: "/prototipos/sigep/ingressos", dependsOn: ["carreiras-cargos", "vagas-individualizadas", "distribuicao"], impacts: ["vinculos", "vagas-individualizadas", "dashboard"], inputs: ["Concurso ou processo", "Pessoa", "Vaga compatível"], outputs: ["Nomeação", "Posse", "Vínculo", "Ocupação"], pending: ["Publicar eventos automáticos para Controle de Vagas"],
  },
  {
    id: "vinculos", name: "Vínculos Funcionais", shortDescription: "Relação entre pessoa, cargo e vaga.", objective: "Registrar a relação funcional e sua posição atual de lotação e exercício.", domain: "VIDA_FUNCIONAL", status: "EM_PROTOTIPACAO", icon: "pi pi-id-card", dependsOn: ["ingresso", "carreiras-cargos"], impacts: ["vagas-individualizadas", "movimentacoes", "projecoes"], inputs: ["Pessoa", "Ingresso", "Cargo", "Vaga"], outputs: ["Vínculo ativo", "Lotação", "Exercício"], pending: ["Consolidar integração nominal com as vagas"],
  },
  {
    id: "movimentacoes", name: "Movimentações", shortDescription: "Cessões, remoções e transferências.", objective: "Controlar alterações de exercício, lotação ou ocupação com auditoria e efeitos atômicos.", domain: "VIDA_FUNCIONAL", status: "PROTOTIPO_CONCLUIDO", icon: "pi pi-directions-alt", route: "/prototipos/sigep/controle-vagas/movimentacoes", dependsOn: ["vinculos", "vagas-individualizadas", "estrutura-organizacional", "documentos-legais"], impacts: ["vinculos", "vagas-individualizadas", "dashboard"], inputs: ["Vínculo ativo", "Vaga", "Destino", "Processo e ato"], outputs: ["Cessão", "Remoção", "Transferência", "Histórico"], pending: ["Integração com Vida Funcional", "Permissões e publicação reais"],
  },
  {
    id: "saidas", name: "Saídas e aposentadoria", shortDescription: "Eventos que liberam ou projetam vagas.", objective: "Registrar aposentadoria, exoneração e outros eventos de disponibilização da vaga.", domain: "VIDA_FUNCIONAL", status: "PLANEJADO", icon: "pi pi-sign-out", dependsOn: ["vinculos"], impacts: ["vagas-individualizadas", "projecoes", "dashboard"], inputs: ["Vínculo", "Evento funcional", "Data de efeito"], outputs: ["Comprometimento de saída", "Liberação da vaga"], pending: ["Definir fontes e eventos do módulo de Vida Funcional"],
  },
  {
    id: "projecoes", name: "Projeções", shortDescription: "Cenários de 12 a 48 meses.", objective: "Projetar disponibilidade e necessidade futura usando aposentadorias, evasão e eventos conhecidos.", domain: "GESTAO", status: "PROTOTIPO_CONCLUIDO", icon: "pi pi-chart-line", route: "/prototipos/sigep/controle-vagas/projecoes", dependsOn: ["vagas-individualizadas", "vinculos", "saidas"], impacts: ["dashboard"], inputs: ["Saldo atual", "Fatores por vínculo", "Evasão histórica"], outputs: ["Cenários conservador, provável e ampliado"], pending: ["Integrar fatores reais e homologar metodologia"],
  },
  {
    id: "dashboard", name: "Dashboard Gerencial", shortDescription: "Posição atual, alertas e planejamento.", objective: "Consolidar os dados necessários para apoiar decisões de provimento, concurso e seletivo.", domain: "GESTAO", status: "PROTOTIPO_CONCLUIDO", icon: "pi pi-chart-bar", route: "/prototipos/sigep/controle-vagas/dashboard", dependsOn: ["quadro-autorizado", "vagas-individualizadas", "distribuicao", "movimentacoes", "projecoes"], impacts: [], inputs: ["Quadro", "Vagas", "Ocupações", "Movimentações", "Projeções"], outputs: ["Indicadores", "Alertas", "Memória gerencial"], pending: ["Homologar indicadores e integrar fontes reais"],
  },
];
