import type { SpecificationMetadata } from "../shared/visualizationModes";

const story = "Como gestor de vagas, quero consultar cada vaga numerada e sua situação completa, para identificar fundamento legal, ocupação, distribuição, comprometimentos e histórico.";
const filters = "Identificador, órgão titular, carreira, cargo, tipo, estado, comprometimento, ocupação, situação legal e lei.";
const spec = (id: string, title: string, description: string, businessRule: string, source: string, dataType: string, component: string, route?: string, behavior?: string): SpecificationMetadata => ({ id, title, description, businessRule, source, dataType, component, route, behavior, filters, userStory: story, status: "CONFIRMADO" });

export const vagasScreenSpecification = spec("CV-VAG", "Vagas Individualizadas", "Consultar a identidade, posição operacional, fundamento legal, ocupação e histórico de cada vaga numerada.", "Cada vaga pertence a um Quadro Autorizado, possui identificador próprio e mantém histórico imutável. A tela é consultiva: ocupações e comprometimentos são recebidos dos processos responsáveis; distribuição decorre de ato formal.", "Quadro Autorizado, Vaga, OcupacaoVaga, ComprometimentoVaga e MovimentoVagaIndividual.", "VagasIndividualizadasViewModel", "Página React conectada ao store", "/prototipos/sigep/controle-vagas/vagas", "Filtros restringem a lista; olhos controlam somente a visibilidade das colunas; o detalhe reúne a memória integral da vaga.");

export const vagasKpiSpecifications: Record<string, SpecificationMetadata> = {
  "Vagas individualizadas": spec("CV-VAG-KPI-001", "Vagas individualizadas", "Quantidade total de vagas numeradas na base consultada.", "Contar cada identificador de vaga uma única vez.", "Vaga[].", "integer", "KPI"),
  Disponíveis: spec("CV-VAG-KPI-002", "Disponíveis", "Vagas cujo estado atual permite ocupação, observadas as demais restrições.", "Estado DISPONIVEL não significa necessariamente livre: a vaga pode possuir comprometimento ativo ou situação legal especial.", "Vaga.estado e comprometimentos.", "integer", "KPI"),
  Ocupadas: spec("CV-VAG-KPI-003", "Ocupadas", "Vagas associadas a uma ocupação nominal ativa.", "Cada ocupação ativa deve corresponder a uma vaga em estado OCUPADA.", "Vaga.estado e OcupacaoVaga ativa.", "integer", "KPI"),
  "Situação legal especial": spec("CV-VAG-KPI-004", "Situação legal especial", "Vagas em decisão judicial, extinção ou transformação.", "Situação legal especial deve permanecer rastreável e pode restringir nova ocupação ou movimentação.", "Vaga.situacaoLegal.", "integer", "KPI"),
  "Pessoas com mais de um vínculo": spec("CV-VAG-KPI-005", "Pessoas com mais de um vínculo", "Pessoas que possuem duas ou mais ocupações ativas por vínculos distintos.", "Contar a pessoa uma vez, preservando cada vínculo e vaga separadamente.", "OcupacaoVaga agrupada por pessoaId.", "integer", "KPI"),
};

export const vagasFilterSpecifications: Record<string, SpecificationMetadata> = {
  Identificador: spec("CV-VAG-FLT-001", "Identificador", "Localizar uma vaga pelo seu código individual.", "Pesquisar exclusivamente o identificador; o olho controla a coluna sem alterar o filtro.", "Vaga.id.", "string", "campo de busca"),
  "Órgão titular": spec("CV-VAG-FLT-002", "Órgão titular", "Restringir vagas pelo órgão ao qual pertencem.", "Titularidade da vaga não muda automaticamente por cessão ou exercício do servidor em outro órgão.", "Vaga.orgaoTitular.", "string | vazio", "dropdown pesquisável"),
  Carreira: spec("CV-VAG-FLT-003", "Carreira", "Restringir vagas pela carreira informada no quadro.", "Carreira e cargo permanecem campos distintos.", "Vaga.carreira.", "string | vazio", "dropdown pesquisável"),
  Cargo: spec("CV-VAG-FLT-004", "Cargo", "Restringir vagas pelo cargo legal.", "O cargo deriva do Quadro Autorizado de origem.", "Vaga.cargo.", "string | vazio", "dropdown pesquisável"),
  Tipo: spec("CV-VAG-FLT-005", "Tipo", "Separar vagas efetivas e comissionadas.", "O Controle de Vagas trata somente cargos efetivos e comissionados.", "Vaga.tipo.", "enum | vazio", "dropdown"),
  Estado: spec("CV-VAG-FLT-006", "Estado", "Separar vagas disponíveis e ocupadas.", "O estado só muda no evento definitivo; comprometimento não substitui o estado.", "Vaga.estado.", "enum | vazio", "dropdown"),
  Comprometimento: spec("CV-VAG-FLT-007", "Comprometimento", "Localizar vagas envolvidas em processo de ocupação ou disponibilização.", "A fase é atualizada por eventos de Ingresso ou Vida Funcional; nesta tela não há alteração manual.", "ComprometimentoVaga ativo e fase atual.", "enum | vazio", "dropdown"),
  Ocupação: spec("CV-VAG-FLT-008", "Ocupação", "Consultar vaga por condição e histórico de ocupação.", "Distinguir ocupante atual, ocupante anterior, múltiplos vínculos e ausência de histórico.", "OcupacaoVaga[].", "enum | vazio", "dropdown"),
  "Situação legal": spec("CV-VAG-FLT-009", "Situação legal", "Restringir vagas pela condição jurídica atual.", "Regular, decisão judicial, em extinção, extinta ou em transformação são condições versionadas e rastreáveis.", "Vaga.situacaoLegal.", "enum | vazio", "dropdown"),
  Lei: spec("CV-VAG-FLT-010", "Lei", "Localizar vagas pelo fundamento legal do quadro.", "A vaga deve apontar para base legal existente e vinculada ao respectivo quadro.", "Vaga.lei.", "string | vazio", "dropdown pesquisável"),
};

export const vagasBlockSpecifications: Record<string, SpecificationMetadata> = {
  Tabela: spec("CV-VAG-TBL-001", "Consulta das vagas individualizadas", "Exibir identidade, cargo, titularidade, estado, ocupante, vínculo, comprometimento, situação legal e lei.", "Ações permanecem visíveis; ocultar coluna modifica somente a apresentação. Os dados de ocupação e comprometimento devem ser conciliados com o estado da vaga.", "Vaga[] e seletores derivados do store.", "table", "tabela paginada"),
  Detalhe: spec("CV-VAG-DTL-001", "Detalhe da vaga", "Apresentar a memória completa de uma vaga numerada.", "Exibir vínculo legal, posição distributiva, ocupação atual e anterior, comprometimento e histórico imutável sem permitir edição direta.", "Vaga e entidades relacionadas.", "VagaDetalheViewModel", "modal de consulta"),
};

export const vagasActionSpecifications: Record<string, SpecificationMetadata> = {
  Limpar: spec("CV-VAG-ACT-001", "Limpar filtros", "Restaurar a consulta completa.", "Limpar critérios e retornar à primeira página sem alterar a visibilidade das colunas nem os dados.", "Estado local dos filtros.", "void", "botão"),
  Visualizar: spec("CV-VAG-ACT-002", "Visualizar vaga", "Abrir o detalhe integral da vaga selecionada.", "A ação é exclusivamente consultiva e não altera estado, ocupação ou histórico.", "Vaga selecionada.", "dialog", "botão de ação"),
  Paginação: spec("CV-VAG-ACT-003", "Paginação", "Navegar pelos resultados da consulta.", "Usar o componente padrão e permitir 10, 20 ou 50 registros por página.", "pagina, porPagina e totalRecords.", "PaginatorState", "PrimeReact Paginator"),
};

export const vagasBusinessItems = [...Object.values(vagasKpiSpecifications), ...Object.values(vagasFilterSpecifications), ...Object.values(vagasBlockSpecifications), ...Object.values(vagasActionSpecifications)];
