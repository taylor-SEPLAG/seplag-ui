import type { SpecificationMetadata } from "../shared/visualizationModes";

const story =
  "Como gestor de bolsas, quero consultar cada vaga de bolsa para acompanhar sua distribuição, seleção e vínculo ativo.";

const spec = (
  id: string,
  title: string,
  description: string,
  businessRule: string,
  source: string,
  dataType: string,
  component: string,
  route?: string,
  behavior?: string,
): SpecificationMetadata => ({
  id,
  title,
  description,
  businessRule,
  source,
  dataType,
  component,
  route,
  behavior,
  filters:
    "Quadro Autorizado Bolsistas, órgão, vaga de bolsa, bolsista atual e situação.",
  userStory: story,
  status: "CONFIRMADO",
});

export const vagasScreenSpecification = spec(
  "CV-BOLSISTAS-VAG",
  "Vagas Individualizadas Bolsistas",
  "Consultar as vagas de bolsa vinculadas a um quadro autorizado, com a situação de distribuição, seleção ou bolsa ativa.",
  "Cada vaga pertence a um Quadro Autorizado Bolsistas e a um cargo bolsista. A tela é consultiva e não administra carreira, posse, exercício ou movimentações funcionais.",
  "Quadro Autorizado Bolsistas, Vaga e dados de alocação da bolsa.",
  "VagaBolsistaView",
  "Página React conectada ao store",
  "/prototipos/sigep/controle-vagas/bolsistas/vagas",
  "Filtros restringem a lista e a visualização abre o resumo da vaga de bolsa.",
);

export const vagasKpiSpecifications: Record<string, SpecificationMetadata> = {
  "Vagas de bolsas autorizadas": spec(
    "CV-BOLSISTAS-VAG-KPI-001",
    "Vagas de bolsas autorizadas",
    "Total de vagas originadas nos quadros bolsistas.",
    "Cada quadro autorizado pode originar vagas numeradas conforme seu quantitativo.",
    "Quadro Autorizado Bolsistas e Vaga.",
    "integer",
    "KPI",
  ),
  "Pendentes de distribuição": spec(
    "CV-BOLSISTAS-VAG-KPI-002",
    "Pendentes de distribuição",
    "Vagas ainda sem órgão definido.",
    "A vaga pendente não possui órgão de alocação.",
    "Vaga.orgaoTitular.",
    "integer",
    "KPI",
  ),
  Disponíveis: spec(
    "CV-BOLSISTAS-VAG-KPI-003",
    "Disponíveis",
    "Vagas já distribuídas e prontas para serem ocupadas.",
    "A vaga disponível já foi distribuída e não possui processo de ingresso nem bolsista ativo.",
    "Vaga e alocações da bolsa.",
    "integer",
    "KPI",
  ),
  "Em ocupação": spec(
    "CV-BOLSISTAS-VAG-KPI-004",
    "Em ocupação",
    "Vagas envolvidas em processo de ingresso de bolsista.",
    "A reserva permanece até a alocação ser concluída ou cancelada.",
    "Comprometimento de vaga.",
    "integer",
    "KPI",
  ),
  "Ocupadas": spec(
    "CV-BOLSISTAS-VAG-KPI-005",
    "Ocupadas",
    "Vagas já preenchidas por um bolsista.",
    "Uma bolsa ativa ocupa uma vaga de bolsa até seu encerramento.",
    "Ocupação da vaga.",
    "integer",
    "KPI",
  ),
};

export const vagasFilterSpecifications: Record<string, SpecificationMetadata> = {
  Quadro: spec(
    "CV-BOLSISTAS-VAG-FLT-001",
    "Quadro Autorizado Bolsistas",
    "Restringir a consulta ao quadro de bolsas.",
    "Somente quadros identificados pelo código QAB compõem as opções.",
    "QuadroAutorizado.codigo.",
    "string | vazio",
    "dropdown pesquisável",
  ),
  Órgão: spec(
    "CV-BOLSISTAS-VAG-FLT-002",
    "Órgão",
    "Restringir a consulta ao órgão da distribuição.",
    "A opção lista apenas órgãos com vagas de bolsa distribuídas.",
    "Vaga.orgaoTitular.",
    "string | vazio",
    "dropdown pesquisável",
  ),
  "Vaga de bolsa": spec(
    "CV-BOLSISTAS-VAG-FLT-003",
    "Vaga de bolsa",
    "Localizar uma vaga pelo seu identificador.",
    "A pesquisa considera o identificador exibido da vaga.",
    "Vaga.codigo.",
    "string | vazio",
    "campo de busca",
  ),
  "Bolsista atual": spec(
    "CV-BOLSISTAS-VAG-FLT-004",
    "Bolsista atual",
    "Localizar uma bolsa pelo nome do bolsista atualmente vinculado.",
    "Somente bolsas ativas possuem bolsista atual.",
    "Ocupação ativa da vaga.",
    "string | vazio",
    "campo de busca",
  ),
  Situação: spec(
    "CV-BOLSISTAS-VAG-FLT-005",
    "Situação",
    "Separar vagas disponíveis, em seleção e com bolsa ativa.",
    "A situação é calculada a partir da reserva de seleção e da alocação ativa.",
    "Vaga, comprometimento e ocupação.",
    "enum | vazio",
    "dropdown",
  ),
};

export const vagasBlockSpecifications: Record<string, SpecificationMetadata> = {
  Tabela: spec(
    "CV-BOLSISTAS-VAG-TBL-001",
    "Consulta das vagas de bolsa",
    "Exibir a vaga de bolsa, cargo bolsista, órgão, bolsista atual e situação.",
    "A tabela não exibe carreira, cargo efetivo, vínculo funcional, posse ou exercício.",
    "VagaBolsistaView.",
    "table",
    "tabela paginada",
  ),
  Detalhe: spec(
    "CV-BOLSISTAS-VAG-DTL-001",
    "Detalhe da vaga de bolsa",
    "Apresentar identificação, autorização e situação atual da bolsa.",
    "O detalhe registra a origem no quadro, cargo bolsista, órgão e documentos associados.",
    "VagaBolsistaView.",
    "modal de consulta",
    "ModalSeplag",
  ),
};

export const vagasActionSpecifications: Record<string, SpecificationMetadata> = {
  Visualizar: spec(
    "CV-BOLSISTAS-VAG-ACT-001",
    "Visualizar vaga de bolsa",
    "Abrir o detalhe consultivo da vaga selecionada.",
    "Nenhuma alteração é realizada pela ação de visualização.",
    "VagaBolsistaView.",
    "ação",
    "BotaoIconSeplag",
  ),
};

export const vagasBusinessItems = [
  "O quadro bolsista é identificado pelo código QAB.",
  "Cada vaga de bolsa pertence a um cargo bolsista e a um quadro autorizado.",
  "A situação permitida é Disponível, Em ocupação ou Bolsa ativa.",
  "Não há situação agendada, posse, efetivo exercício, cessão ou remoção neste fluxo.",
];

