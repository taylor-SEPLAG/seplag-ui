import type { SpecificationMetadata } from "../shared/visualizationModes";

const story = "Como gestor de vagas, quero distribuir e redistribuir vagas numeradas com base no Quadro Autorizado e em ato formal, preservando a posição histórica.";
const filters = "Quadro Autorizado, cargo, órgão, situação, saldo e data de referência; no histórico, operação, origem, destino, ato/processo e período.";
const spec = (id: string, title: string, description: string, businessRule: string, source: string, dataType: string, component: string, route?: string, behavior?: string): SpecificationMetadata => ({ id, title, description, businessRule, source, dataType, component, route, behavior, filters, userStory: story, status: "CONFIRMADO" });

export const distribuicaoScreenSpecification = spec("CV-DIST", "Distribuição", "Controlar a destinação formal das vagas entre órgãos e reconstruir sua posição distributiva.", "Distribuição movimenta vagas, não pessoas. Toda vaga mantém vínculo com o Quadro Autorizado; não existe órgão fictício nem banco central permanente.", "Quadros Autorizados, Vagas Individualizadas e MovimentoVagaIndividual.", "DistribuicaoViewModel", "Página React conectada ao store", "/prototipos/sigep/controle-vagas/distribuicao", "Alterna entre posição atual, histórico dos atos e posição reconstruída por data.");

export const distribuicaoKpiSpecifications: Record<string, SpecificationMetadata> = {
  "Vagas individualizadas": spec("CV-DIST-KPI-001", "Vagas individualizadas", "Total de vagas numeradas consideradas na posição.", "Contar cada vaga uma vez, sempre vinculada ao respectivo Quadro Autorizado.", "Vaga[].", "integer", "KPI"),
  "Pendentes de ato": spec("CV-DIST-KPI-002", "Pendentes de ato", "Vagas cuja lei deixou a destinação para ato posterior.", "Pendência é condição distributiva, não órgão ou saldo central; encerra após movimento formal de distribuição.", "PosicaoDistribuicaoVaga.situacaoDistribuicao.", "integer", "KPI"),
  Distribuídas: spec("CV-DIST-KPI-003", "Distribuídas", "Vagas que possuem órgão de distribuição definido por lei ou ato.", "Contar posição DISTRIBUIDA na data de referência, respeitando movimentos retroativos.", "PosicaoDistribuicaoVaga[].", "integer", "KPI"),
  "Disponíveis para movimentação": spec("CV-DIST-KPI-004", "Disponíveis para movimentação", "Vagas que podem participar de distribuição ou redistribuição.", "Exigir vaga disponível, regular e sem comprometimento ativo; preservar o mesmo quadro e a compatibilidade do destino.", "Vagas, comprometimentos e posição distributiva.", "integer", "KPI"),
  "Ocupadas — não movimentáveis": spec("CV-DIST-KPI-005", "Ocupadas — não movimentáveis", "Vagas ocupadas bloqueadas para operação distributiva.", "Distribuição e redistribuição não podem alterar a destinação de vaga ocupada neste fluxo.", "Vaga.estado.", "integer", "KPI"),
};
export const distribuicaoTabSpecifications: Record<string, SpecificationMetadata> = {
  "Distribuição por órgão": spec("CV-DIST-TAB-001", "Distribuição por órgão", "Consultar o saldo distributivo agrupado por quadro, cargo e órgão.", "Separar total, ocupadas, disponíveis, comprometidas, movimentáveis e pendentes de ato sem misturar quadros diferentes.", "Posição recalculada das vagas.", "GrupoDistribuicao[]", "aba com tabela"),
  "Histórico de distribuições": spec("CV-DIST-TAB-002", "Histórico de distribuições", "Consultar todos os atos de distribuição e redistribuição registrados.", "Cada vaga mantém movimento individual mesmo quando a operação foi registrada em lote; registros não são apagados ou sobrescritos.", "MovimentoVagaIndividual[].", "history[]", "aba com tabela"),
  "Consulta histórica": spec("CV-DIST-TAB-003", "Consulta histórica", "Reconstruir onde cada vaga estava distribuída em uma data passada.", "Aplicar movimentos pela data de efeito, inclusive retroativos, sem modificar o registro original.", "recalcularPosicoes(vagas, movimentos, data).", "PosicaoDistribuicaoVaga[]", "aba temporal"),
};

export const distribuicaoBlockSpecifications: Record<string, SpecificationMetadata> = {
  "Filtros da posição": spec("CV-DIST-FLT-001", "Filtros da posição distributiva", "Restringir a visão agrupada por quadro, cargo, órgão, situação, saldo e data.", "Todos os indicadores da lista e grupos exibidos devem respeitar a mesma posição temporal.", "Estado local dos filtros e listas derivadas.", "DistribuicaoFiltros", "formulário de filtros"),
  "Tabela da posição": spec("CV-DIST-TBL-001", "Saldo distribuído por quadro e órgão", "Apresentar a composição distributiva e o saldo elegível por origem legal.", "Movimentáveis nunca pode incluir ocupadas, comprometidas ou situação legal especial.", "GrupoDistribuicao[].", "table", "tabela paginada"),
  "Filtros do histórico": spec("CV-DIST-FLT-002", "Filtros do histórico", "Localizar movimentos por quadro, operação, origem, destino, ato, processo e período.", "Filtrar a memória sem alterar ou excluir eventos históricos.", "MovimentoVagaIndividual[].", "HistoricoDistribuicaoFiltros", "formulário de filtros"),
  "Tabela do histórico": spec("CV-DIST-TBL-002", "Movimentos de distribuição", "Exibir a trilha individual e rastreável de cada vaga.", "Mostrar quadro e versão, data de efeito, origem, destino, ato, processo e marca de retroatividade.", "MovimentoVagaIndividual[].", "table", "tabela histórica"),
  "Filtros temporais": spec("CV-DIST-FLT-003", "Filtros da consulta histórica", "Definir a posição e o recorte da reconstrução temporal.", "Data de referência é obrigatória para interpretar o órgão e a unidade válidos naquela posição.", "Estado local e posição recalculada.", "TemporalFilters", "formulário de filtros"),
  "Tabela temporal": spec("CV-DIST-TBL-003", "Distribuição em uma data passada", "Mostrar a posição de cada vaga numerada na data selecionada.", "Exibir quadro, cargo, titularidade, distribuição, unidade e último movimento válido na data.", "PosicaoDistribuicaoVaga[].", "table", "tabela temporal"),
};

export const distribuicaoFilterSpecifications: Record<string, SpecificationMetadata> = {
  Pesquisa: spec("CV-DIST-FLT-010", "Pesquisa textual", "Localizar registros pelos principais dados da aba atual.", "Pesquisar os campos textuais exibidos na consulta selecionada.", "Lista derivada da aba.", "string", "campo de busca"),
  "Quadro autorizado": spec("CV-DIST-FLT-011", "Quadro Autorizado", "Restringir a consulta à origem legal selecionada.", "Não combinar vagas ou movimentos de quadros diferentes.", "quadroCodigo e quadroAutorizadoId.", "string | vazio", "select"),
  Cargo: spec("CV-DIST-FLT-012", "Cargo", "Restringir a posição ao cargo selecionado.", "O cargo deriva do quadro e da posição da vaga na data.", "PosicaoDistribuicaoVaga.cargo.", "string | vazio", "select"),
  "Órgão de distribuição": spec("CV-DIST-FLT-013", "Órgão de distribuição", "Consultar vagas destinadas ao órgão selecionado.", "Pendente de ato é condição, não órgão fictício.", "orgaoDistribuicao.", "string | vazio", "select"),
  Situação: spec("CV-DIST-FLT-014", "Situação distributiva", "Separar vagas distribuídas das pendentes de ato.", "Classificar pela posição válida na data consultada.", "situacaoDistribuicao.", "enum | vazio", "select"),
  Saldo: spec("CV-DIST-FLT-015", "Saldo", "Localizar grupos por tipo de saldo.", "Distinguir movimentáveis, disponíveis, ocupadas e comprometidas.", "GrupoDistribuicao.", "enum | vazio", "select"),
  "Data de referência": spec("CV-DIST-FLT-016", "Data de referência", "Definir a data da posição distributiva.", "Aplicar movimentos com data de efeito até a data informada.", "data e recalcularPosicoes.", "date ISO", "date input"),
  Operação: spec("CV-DIST-FLT-017", "Operação", "Filtrar distribuição inicial ou redistribuição.", "Distribuição parte de pendência de ato; redistribuição move vaga entre destinos formais.", "movimento.tipo.", "enum | vazio", "select"),
  "Órgão de origem": spec("CV-DIST-FLT-018", "Órgão de origem", "Localizar movimentos pela origem.", "Na distribuição inicial, a origem pode ser pendência de ato.", "orgaoAnterior.", "string | vazio", "select"),
  "Órgão de destino": spec("CV-DIST-FLT-019", "Órgão de destino", "Localizar movimentos pelo destino.", "O destino deve ser compatível com o quadro e formalizado.", "orgaoPosterior.", "string | vazio", "select"),
  "Ato ou processo": spec("CV-DIST-FLT-020", "Ato ou processo", "Localizar a fundamentação administrativa.", "Pesquisar documento legal e processo SIGADOC.", "ato e processo.", "string", "campo de busca"),
  Início: spec("CV-DIST-FLT-021", "Início do período", "Definir a data inicial do histórico.", "Incluir movimentos com efeito igual ou posterior.", "periodoInicio.", "date ISO", "date input"),
  Fim: spec("CV-DIST-FLT-022", "Fim do período", "Definir a data final do histórico.", "Incluir movimentos com efeito igual ou anterior.", "periodoFim.", "date ISO", "date input"),
};
export const distribuicaoActionSpecifications: Record<string, SpecificationMetadata> = {
  Distribuir: spec("CV-DIST-ACT-001", "Distribuir vagas", "Abrir a distribuição inicial do quadro da linha.", "Disponibilizar somente quando o quadro possuir vagas pendentes de ato, disponíveis, regulares e sem comprometimento; o quadro de origem é fixo.", "GrupoDistribuicao.distribuiveis e quadroAutorizadoId.", "navigation", "botão de ação", "/prototipos/sigep/controle-vagas/distribuicao/nova?quadro={id}"),
  Redistribuir: spec("CV-DIST-ACT-004", "Redistribuir vagas", "Abrir a redistribuição do quadro da linha.", "Disponibilizar somente quando o quadro possuir vagas já distribuídas, disponíveis, regulares e sem comprometimento; o quadro de origem é fixo.", "GrupoDistribuicao.redistribuiveis e quadroAutorizadoId.", "navigation", "botão de ação", "/prototipos/sigep/controle-vagas/redistribuicao/nova?quadro={id}"),
  Limpar: spec("CV-DIST-ACT-002", "Limpar filtros", "Restaurar os filtros da consulta atual.", "Limpar todos os recortes e retornar a data padrão sem alterar dados.", "Estado local dos filtros.", "void", "botão"),
  Paginação: spec("CV-DIST-ACT-003", "Paginação", "Navegar pela posição distributiva sem aumentar a largura da tabela.", "Usar o componente padrão e permitir 10, 20 ou 50 registros por página.", "pagina, porPagina e totalRecords.", "PaginatorState", "PrimeReact Paginator"),
};

export const distribuicaoBusinessItems = [...Object.values(distribuicaoKpiSpecifications), ...Object.values(distribuicaoTabSpecifications), ...Object.values(distribuicaoBlockSpecifications), ...Object.values(distribuicaoFilterSpecifications), ...Object.values(distribuicaoActionSpecifications)];





