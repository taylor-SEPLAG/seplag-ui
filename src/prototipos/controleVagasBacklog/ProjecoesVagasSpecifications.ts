import type { SpecificationMetadata } from "../shared/visualizationModes";

const story = "Como gestor de vagas, quero estimar disponibilizações futuras por cargo e órgão, para apoiar o planejamento de provimentos sem confundir projeção com saldo real.";
const filters = "Cenário conservador, provável ou ampliado e horizonte de 12, 24, 36 ou 48 meses.";
const spec = (id: string, title: string, description: string, businessRule: string, source: string, dataType: string, component: string, route?: string, behavior?: string): SpecificationMetadata => ({ id, title, description, businessRule, source, dataType, component, route, behavior, filters, userStory: story, status: "CONFIRMADO" });

export const projecoesScreenSpecification = spec("CV-PROJ", "Projeções de Vagas", "Estimar a disponibilização futura de vagas por cargo e órgão para apoiar o planejamento estratégico.", "Projeções não alteram o estado nem o saldo real das vagas. Todo resultado deve identificar cenário, horizonte, metodologia vigente, fatores utilizados e fontes de origem.", "Saldos atuais, vínculos, fatores de projeção, taxas históricas de evasão e metodologia versionada.", "ProjecoesVagasViewModel", "Página React conectada ao store", "/prototipos/sigep/backlog/projecoes", "Recalcula os resultados ao alternar cenário ou horizonte e preserva a metodologia aplicada.");

export const projecoesTabSpecifications: Record<string, SpecificationMetadata> = {
  Projeção: spec("CV-PROJ-TAB-001", "Projeção", "Consultar os resultados consolidados e detalhados da estimativa.", "Somar saldo disponível atual e novas disponibilizações estimadas conforme o cenário e horizonte.", "ResultadoProjecaoVagas[].", "projection[]", "aba"),
  "Fatores e evasão": spec("CV-PROJ-TAB-002", "Fatores e evasão", "Consultar os eventos e taxas que alimentam o cálculo.", "Cada fator deve possuir categoria, data, quantidade, probabilidade, origem e referência; evasão deve derivar de série histórica identificável.", "FatorProjecaoVagas[] e TaxaEvasaoHistorica[].", "factors[]", "aba"),
  "Histórico da metodologia": spec("CV-PROJ-TAB-003", "Histórico da metodologia", "Consultar versões e parâmetros utilizados nos cálculos.", "Metodologias anteriores são preservadas; apenas uma versão pode estar vigente na data de referência.", "MetodologiaProjecao[].", "methodology[]", "aba"),
};

export const projecoesControlSpecifications: Record<string, SpecificationMetadata> = {
  Cenário: spec("CV-PROJ-CTL-001", "Cenário", "Escolher o grau de conversão dos fatores projetados.", "Conservador usa menor conversão; provável usa premissas centrais; ampliado aplica maior conversão e margem estratégica.", "Metodologia.pesosElegibilidade e multiplicadoresEvasao.", "CenarioProjecao", "grupo de botões"),
  Horizonte: spec("CV-PROJ-CTL-002", "Horizonte", "Definir o período futuro considerado.", "Aceitar 12, 24, 36 ou 48 meses e incluir somente fatores com data prevista dentro do intervalo.", "HorizonteProjecao.", "12 | 24 | 36 | 48", "grupo de botões"),
};

export const projecoesKpiSpecifications: Record<string, SpecificationMetadata> = {
  "Disponíveis livres hoje": spec("CV-PROJ-KPI-001", "Disponíveis livres hoje", "Saldo real disponível e não comprometido na posição atual.", "Não incluir ocupadas, comprometidas ou vagas com restrição legal.", "Saldo derivado das vagas.", "integer", "KPI"),
  "Novas disponibilizações": spec("CV-PROJ-KPI-002", "Novas disponibilizações", "Soma das saídas conhecidas e estimadas no horizonte.", "Combinar compulsórias, elegibilidade ponderada, aposentadorias requeridas, exonerações conhecidas e evasão estimada sem duplicidade.", "ResultadoProjecaoVagas.novasDisponibilizacoes.", "integer", "KPI"),
  "Potencial no horizonte": spec("CV-PROJ-KPI-003", "Potencial no horizonte", "Quantidade potencial de vagas para planejamento no cenário selecionado.", "Somar disponíveis livres atuais e novas disponibilizações; não representar autorização automática para concurso ou nomeação.", "ResultadoProjecaoVagas.necessidadeProjetada.", "integer", "KPI principal"),
  "Eventos conhecidos": spec("CV-PROJ-KPI-004", "Eventos conhecidos", "Eventos formalmente identificados, sem componentes puramente estatísticos.", "Somar compulsórias, aposentadorias requeridas e exonerações conhecidas.", "Fatores de projeção conhecidos.", "integer", "KPI"),
};

export const projecoesBlockSpecifications: Record<string, SpecificationMetadata> = {
  "Metodologia vigente": spec("CV-PROJ-BLK-001", "Metodologia vigente", "Identificar a versão usada no cálculo exibido.", "Todo resultado deve permanecer reproduzível pela versão registrada.", "MetodologiaProjecao vigente.", "reference", "identificação"),
  "Composição das novas disponibilizações": spec("CV-PROJ-BLK-002", "Composição das novas disponibilizações", "Detalhar os componentes que formam a estimativa.", "Separar compulsórias, elegibilidade ponderada, requeridas, exonerações e evasão estimada.", "ResultadoProjecaoVagas consolidado.", "composition", "painel"),
  "Evolução por horizonte": spec("CV-PROJ-BLK-003", "Evolução por horizonte", "Comparar o potencial nos quatro horizontes.", "Manter o mesmo cenário e metodologia em toda a série comparativa.", "Resultados em 12, 24, 36 e 48 meses.", "series", "gráfico de barras"),
  "Comparação de cenários": spec("CV-PROJ-BLK-004", "Comparação de cenários", "Comparar conservador, provável e ampliado no mesmo horizonte.", "Alterar somente os pesos definidos na metodologia, preservando fatores e horizonte.", "Resultados por CenarioProjecao.", "comparison", "cards selecionáveis"),
  "Projeção por cargo e órgão": spec("CV-PROJ-BLK-005", "Projeção por cargo e órgão", "Exibir a memória detalhada do cálculo para cada agrupamento.", "Mostrar saldo atual, cada componente de saída, novas disponibilizações e potencial total.", "ResultadoProjecaoVagas[].", "table", "tabela"),
  "Eventos conhecidos e elegibilidade": spec("CV-PROJ-BLK-006", "Eventos conhecidos e elegibilidade", "Exibir os fatores individuais recebidos dos sistemas de origem.", "Cada registro deve manter data prevista, probabilidade, referência e atualização.", "FatorProjecaoVagas[].", "table", "tabela"),
  "Evasão histórica": spec("CV-PROJ-BLK-007", "Evasão histórica", "Exibir a base histórica usada na taxa de evasão.", "Calcular taxa anual pela relação entre desligamentos voluntários e ocupados médios, preservando cargo, órgão e ano.", "TaxaEvasaoHistorica[].", "table", "tabela"),
  "Versões da metodologia": spec("CV-PROJ-BLK-008", "Versões da metodologia", "Exibir parâmetros, regras, vigência e responsável de cada versão.", "Não sobrescrever metodologia anterior; alterações criam nova versão rastreável.", "MetodologiaProjecao[].", "methodology[]", "lista versionada"),
};

export const projecoesBusinessItems = [...Object.values(projecoesTabSpecifications), ...Object.values(projecoesControlSpecifications), ...Object.values(projecoesKpiSpecifications), ...Object.values(projecoesBlockSpecifications)];
