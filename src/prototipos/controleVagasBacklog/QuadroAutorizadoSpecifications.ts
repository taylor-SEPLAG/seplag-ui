import type { SpecificationMetadata } from "../shared/visualizationModes";

const filters = "Código, cargo ou carreira; órgão; tipo de quadro; situação; data de referência.";
const story = "Como gestor do quadro legal, quero consultar autorizações e sua posição para controlar o limite de vagas com rastreabilidade.";
const spec = (id: string, title: string, description: string, businessRule: string, source: string, dataType: string, component: string, route?: string, behavior?: string): SpecificationMetadata => ({ id, title, description, businessRule, source, dataType, component, route, behavior, filters, userStory: story, status: "CONFIRMADO" });

export const quadroScreenSpecification = spec("CV-QA", "Quadro Autorizado", "Consultar as origens legais que estabelecem o quantitativo máximo de vagas por cargo, vínculo e destinação.", "Cada quadro representa uma combinação legal versionada. Antes da vigência pode ser alterado ou excluído; depois de vigente permanece imutável e somente uma nova versão pode produzir evolução legal.", "QuadroAutorizadoRow, documentos legais, vigência e posição das vagas individualizadas.", "QuadroAutorizadoViewModel[]", "Página React conectada ao store", "/prototipos/sigep/backlog/quadro-autorizado", "Apresenta o registro mais recente primeiro; filtros e ordenação modificam somente a consulta.");

export const quadroKpiSpecifications: Record<string, SpecificationMetadata> = {
  Autorizadas: spec("CV-QA-KPI-001", "Autorizadas", "Total do limite legal dos quadros exibidos.", "Somar autorizadas dos registros após aplicar os filtros; não representa vagas livres.", "QuadroAutorizadoRow.autorizadas.", "integer", "KPI"),
  Ocupadas: spec("CV-QA-KPI-002", "Ocupadas", "Vagas dos quadros consultados que possuem ocupação ativa.", "Somar ocupadas na posição; cessão mantém a vaga ocupada e processos de saída não liberam antes do evento definitivo.", "Quadro Autorizado conciliado com vagas e ocupações ativas.", "integer", "KPI"),
  Comprometidas: spec("CV-QA-KPI-003", "Comprometidas", "Vagas vinculadas a um processo ainda não concluído.", "Somar comprometidas sem antecipar a mudança definitiva do estado.", "ComprometimentoVaga relacionado às vagas do quadro.", "integer", "KPI"),
  Disponíveis: spec("CV-QA-KPI-004", "Disponíveis", "Saldo do quadro ainda sem ocupação ou bloqueio.", "Por quadro: máximo de zero entre autorizadas menos ocupadas, comprometidas e bloqueadas.", "QuadroAutorizadoRow e posição consolidada das vagas.", "integer", "KPI"),
};

export const quadroFilterSpecifications: Record<string, SpecificationMetadata> = {
  "Código, cargo ou carreira": spec("CV-QA-FLT-001", "Código, cargo ou carreira", "Localizar uma origem legal por seus dados principais.", "Pesquisar sem diferenciar maiúsculas em código, cargo, carreira, perfil profissional e órgãos definidos pela lei.", "QuadroAutorizadoRow.", "string", "campo de busca", undefined, "Atualiza a lista durante a digitação."),
  Órgão: spec("CV-QA-FLT-002", "Órgão", "Restringir a consulta aos quadros cuja lei admite o órgão selecionado.", "Comparar com os órgãos definidos na lei; pendente de ato não é órgão fictício.", "orgaosDefinidosLei e orgao de compatibilidade.", "string | vazio", "select"),
  "Tipo de quadro": spec("CV-QA-FLT-003", "Tipo de quadro", "Separar autorizações de cargos efetivos e comissionados.", "Este módulo aceita somente Efetivo e Comissionado; temporários não geram vaga legal aqui.", "QuadroAutorizadoRow.tipoQuadro.", "enum", "select"),
  Situação: spec("CV-QA-FLT-004", "Situação", "Consultar quadros conforme sua posição temporal.", "Vigência futura admite edição e exclusão; Vigente admite distribuição e nova versão; Encerrada permanece para consulta.", "QuadroAutorizadoRow.situacao calculada pela vigência.", "enum", "select"),
  "Data de referência": spec("CV-QA-FLT-005", "Data de referência", "Definir a data da posição legal consultada.", "Considerar versões e vigências com efeito até a data informada, preservando consultas históricas.", "Vigência e histórico de versões.", "date ISO", "date input"),
  Limpar: spec("CV-QA-ACT-001", "Limpar filtros", "Restaurar a consulta padrão.", "Limpar pesquisa, órgão, tipo, situação e retornar a data padrão.", "Estado local dos filtros.", "void", "botão", undefined, "Não altera registros nem a ordenação."),
};

export const quadroTableSpecification = spec("CV-QA-TBL-001", "Consulta do Quadro Autorizado", "Exibir cada origem legal e a posição quantitativa para controle e evolução do quadro.", "Uma linha representa uma versão consultável; por padrão ordenar o cadastro mais recente primeiro. O cabeçalho alterna ascendente e descendente.", "QuadroAutorizadoRow e saldos derivados.", "QuadroAutorizadoRow[]", "tabela ordenável", undefined, "Código e olho abrem o modal; ações dependem da situação.");

export const quadroColumnSpecifications: Record<string, SpecificationMetadata> = {
  Quadro: spec("CV-QA-COL-001", "Quadro", "Identificar a origem legal e sua versão.", "O código permanece entre versões; a versão distingue cada evolução preservada.", "codigo e versao.", "string + integer", "coluna ordenável"),
  "Cargo/Função": spec("CV-QA-COL-002", "Cargo/Função", "Informar o cargo controlado e seu perfil ou vínculo.", "Cargo é obrigatório; perfil profissional é opcional e poderá vir do cadastro funcional.", "cargo, perfilProfissional e vinculo.", "string", "coluna ordenável"),
  Órgão: spec("CV-QA-COL-003", "Órgão ou destinação legal", "Mostrar como a lei tratou a destinação.", "Exibir órgão único, quantidade de órgãos ou Pendente de ato; nunca criar órgão fictício Não distribuídas.", "formaDestinacaoLegal e orgaosDefinidosLei.", "string", "coluna ordenável"),
  Autorizadas: spec("CV-QA-COL-004", "Autorizadas", "Mostrar o limite legal da versão.", "Somente muda por edição pré-vigência ou nova versão legal.", "autorizadas.", "integer", "coluna numérica ordenável"),
  Ocupadas: spec("CV-QA-COL-005", "Ocupadas", "Mostrar vagas com ocupação ativa.", "Cada vínculo ocupa uma vaga; cessão não desocupa a origem.", "ocupadas conciliadas com ocupações.", "integer", "coluna numérica ordenável"),
  Disponíveis: spec("CV-QA-COL-006", "Disponíveis", "Mostrar o saldo utilizável do quadro.", "máximo(0, autorizadas - ocupadas - comprometidas - bloqueadas).", "saldo derivado.", "integer", "coluna numérica ordenável"),
  Vigência: spec("CV-QA-COL-007", "Vigência", "Indicar quando a autorização produz efeitos.", "Exibir início e término; sem término significa vigência indeterminada.", "inicioVigencia e fimVigencia.", "date range", "coluna ordenável"),
  Situação: spec("CV-QA-COL-008", "Situação", "Apresentar o estado temporal da versão.", "Calcular Vigência futura, Vigente ou Encerrada pelas datas e eventos.", "situacao e SituacaoVigencia.", "enum", "badge em coluna ordenável"),
  Ações: spec("CV-QA-COL-009", "Ações", "Disponibilizar somente operações permitidas.", "Visualizar sempre; editar/excluir antes da vigência; distribuir/criar nova versão quando vigente.", "situação, id e permissões futuras.", "button[]", "coluna fixa"),
};

export const quadroActionSpecifications: Record<string, SpecificationMetadata> = {
  "Nova autorização": spec("CV-QA-ACT-002", "Nova autorização", "Cadastrar uma nova origem legal de vagas.", "Exigir base legal, identificação, quantitativo, alocação e vigência; ao entrar em vigor, gerar vagas individualizadas.", "Formulário de Nova autorização.", "navigation", "botão primário", `${quadroScreenSpecification.route}/novo`),
  Visualizar: spec("CV-QA-ACT-003", "Visualizar quadro", "Abrir todas as informações sem permitir alteração.", "Exibir identificação, abrangência, quantitativos, base legal e vigência em modal somente leitura.", "QuadroAutorizadoRow e documentos associados.", "dialog", "botão de olho"),
  Editar: spec("CV-QA-ACT-004", "Editar antes da vigência", "Corrigir uma autorização futura.", "Disponível somente em Vigência futura; após o início, bloquear edição direta.", "QuadroAutorizadoRow.situacao.", "navigation", "botão de lápis"),
  Excluir: spec("CV-QA-ACT-005", "Excluir antes da vigência", "Remover autorização futura sem efeitos.", "Exigir confirmação e permitir somente em Vigência futura.", "Quadro e vagas relacionadas.", "confirmation + mutation", "botão de lixeira"),
  Distribuir: spec("CV-QA-ACT-006", "Distribuir vagas deste quadro", "Iniciar a destinação formal das vagas.", "Disponível para quadro vigente; exige ato, processo SIGADOC e data de efeito.", "Quadro e vagas elegíveis.", "navigation", "botão de estrutura", "/prototipos/sigep/backlog/distribuicao"),
  "Criar nova versão": spec("CV-QA-ACT-007", "Criar nova versão", "Registrar evolução legal sem sobrescrever a versão vigente.", "Ampliação, redução, transformação ou extinção progressiva preservam histórico e produzem efeito na data definida.", "Quadro vigente, documento legal e operação legal.", "navigation", "botão de mais"),
};

export const quadroBusinessItems = [...Object.values(quadroKpiSpecifications), ...Object.values(quadroFilterSpecifications), quadroTableSpecification, ...Object.values(quadroColumnSpecifications), ...Object.values(quadroActionSpecifications)];
