export const areasNavegacaoFolha = {
  rubricas: {
    nome: "Rubricas",
    rota: "/prototipos/folha/rubricas",
    descricao:
      "Selecione uma área para consultar e gerenciar as rubricas da folha.",
    cor: "var(--sigep-modulo-pessoas)",
  },
  cadastro: {
    nome: "Cadastro",
    rota: "/prototipos/folha/cadastro",
    descricao:
      "Selecione uma área para consultar e gerenciar os cadastros da folha.",
    cor: "var(--sigep-modulo-estrutura)",
  },
  folha: {
    nome: "Folha",
    rota: "/prototipos/folha/processamento",
    descricao:
      "Selecione uma área para consultar e gerenciar a folha de pagamento.",
    cor: "var(--sigep-modulo-movimentacao)",
  },
  financeiro: {
    nome: "Lançamento Financeiro",
    rota: "/prototipos/folha/lancamento-financeiro",
    descricao:
      "Selecione uma área para consultar e gerenciar os lançamentos financeiros.",
    cor: "var(--sigep-modulo-direitos)",
  },
  retencoes: {
    nome: "Retenções Judiciais",
    rota: "/prototipos/folha/lancamento-financeiro/retencoes-judiciais",
    descricao:
      "Selecione uma área para consultar e gerenciar as retenções judiciais.",
    cor: "var(--sigep-modulo-vacancia)",
  },
  relatorios: {
    nome: "Relatórios",
    rota: "/prototipos/folha/relatorios",
    descricao: "Selecione um relatório para consultar as informações da folha.",
    cor: "var(--sigep-modulo-documentacao)",
  },
} as const;
export type AreaNavegacaoFolha = keyof typeof areasNavegacaoFolha;
