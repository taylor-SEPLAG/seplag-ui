import type { SpecificationMetadata } from "../shared/visualizationModes";

const filters = "Quadro; cargo; órgão; tipo de vínculo e situação.";
const story =
  "Como gestor do quadro legal, quero consultar autorizações e sua posição para controlar o limite de vagas com rastreabilidade.";
const componentSources: Record<string, string> = {
  CardSeplag: "src/componentes/Card/index.tsx",
  PanelSeplag: "src/componentes/PanelSeplag/index.tsx",
  TextFieldSeplag: "src/componentes/Fields/TextField.tsx",
  DropdownFieldSeplag: "src/componentes/Fields/DropdownField.tsx",
  DateFieldSeplag: "src/componentes/Fields/DateField.tsx",
  NumberFieldSeplag: "src/componentes/Fields/NumberField.tsx",
  MultiSelectFieldSeplag: "src/componentes/Fields/MultiSelectField.tsx",
  RadioButtonFieldSeplag: "src/componentes/Fields/RadioButtonField.tsx",
  TablePaginadoSeplag: "src/componentes/TablePaginado/index.tsx",
  BotaoAdicionarSeplag: "src/componentes/Botao/index.tsx",
  BotaoLimparFiltroSeplag: "src/componentes/Botao/index.tsx",
  BotaoIconSeplag: "src/componentes/Botao/index.tsx",
  BotaoSalvarSeplag: "src/componentes/Botao/index.tsx",
  BotaoVoltarSeplag: "src/componentes/Botao/index.tsx",
  BotaoSeplag: "src/componentes/Botao/index.tsx",
  ModalSeplag: "src/componentes/Modal/index.tsx",
  ModalDeleteSeplag: "src/componentes/ModalDelete/index.tsx",
  BadgeSeplag: "src/componentes/Badge/index.tsx",
  MensagemSeplag: "src/componentes/Mensagem/index.tsx",
  DocumentosLegaisAssociadosSeplag:
    "src/componentes/DocumentosLegaisAssociados/index.tsx",
  SituacaoVigenciaSeplag: "src/componentes/SituacaoVigencia/index.tsx",
  SpecificationMode:
    "src/prototipos/shared/visualizationModes/SpecificationMode.tsx",
};

const componentRoutes: Record<string, string> = {
  SituacaoVigenciaSeplag: "/prototipos/sigep/componentes/situacao-vigencia",
};

const componentMetadata = (component: string) => {
  const names = Object.keys(componentSources).filter((name) =>
    component.includes(name),
  );
  const primaryComponent = names[0];
  return {
    componentUrl: primaryComponent
      ? (componentRoutes[primaryComponent] ??
        `/prototipos/sigep/componentes?componente=${encodeURIComponent(primaryComponent)}`)
      : undefined,
    componentSource:
      names
        .map((name) => componentSources[name])
        .filter((value, index, values) => values.indexOf(value) === index)
        .join("; ") || undefined,
  };
};

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
  filters,
  userStory: story,
  status: "CONFIRMADO",
  ...componentMetadata(component),
});

export const quadroScreenSpecification = spec(
  "CV-QA",
  "Quadro Autorizado",
  "Consultar as origens legais que estabelecem o quantitativo máximo de vagas por cargo, vínculo e destinação.",
  "Cada quadro representa uma combinação legal versionada. Antes da vigência pode ser alterado ou excluído; depois de vigente permanece imutável e somente uma nova versão pode produzir evolução legal.",
  "QuadroAutorizadoRow, documentos legais, vigência e posição das vagas individualizadas.",
  "QuadroAutorizadoViewModel[]",
  "SpecificationMode + TablePaginadoSeplag + BadgeSeplag + BotaoAdicionarSeplag",
  "/prototipos/sigep/controle-vagas/quadro-autorizado",
  "Apresenta o registro mais recente primeiro; filtros e ordenação modificam somente a consulta.",
);

export const quadroKpiSpecifications: Record<string, SpecificationMetadata> = {
  Autorizadas: spec(
    "CV-QA-KPI-001",
    "Autorizadas",
    "Total do limite legal dos quadros exibidos.",
    "Somar autorizadas dos registros após aplicar os filtros; não representa vagas livres.",
    "QuadroAutorizadoRow.autorizadas.",
    "integer",
    "Estrutura visual HTML/CSS do protótipo (sem componente da biblioteca)",
  ),
  Ocupadas: spec(
    "CV-QA-KPI-002",
    "Ocupadas",
    "Vagas dos quadros consultados que possuem ocupação ativa.",
    "Somar ocupadas na posição; cessão mantém a vaga ocupada e processos de saída não liberam antes do evento definitivo.",
    "Quadro Autorizado conciliado com vagas e ocupações ativas.",
    "integer",
    "Estrutura visual HTML/CSS do protótipo (sem componente da biblioteca)",
  ),
  Comprometidas: spec(
    "CV-QA-KPI-003",
    "Comprometidas",
    "Vagas vinculadas a um processo ainda não concluído.",
    "Somar comprometidas sem antecipar a mudança definitiva do estado.",
    "ComprometimentoVaga relacionado às vagas do quadro.",
    "integer",
    "Estrutura visual HTML/CSS do protótipo (sem componente da biblioteca)",
  ),
  Disponíveis: spec(
    "CV-QA-KPI-004",
    "Disponíveis",
    "Saldo do quadro ainda sem ocupação ou bloqueio.",
    "Por quadro: máximo de zero entre autorizadas menos ocupadas, comprometidas e bloqueadas.",
    "QuadroAutorizadoRow e posição consolidada das vagas.",
    "integer",
    "Estrutura visual HTML/CSS do protótipo (sem componente da biblioteca)",
  ),
  "Pendente de distribuição": spec(
    "CV-QA-KPI-005",
    "Pendente de distribuição",
    "Vagas que ainda não receberam órgão de distribuição.",
    "Somar as vagas não extintas sem órgão de distribuição nos quadros exibidos após aplicar os filtros.",
    "PosicaoDistribuicaoVaga.orgaoDistribuicao e Vaga.estado.",
    "integer",
    "Estrutura visual HTML/CSS do protótipo (sem componente da biblioteca)",
  ),
};

export const quadroFilterSpecifications: Record<string, SpecificationMetadata> =
  {
    Quadro: spec(
      "CV-QA-FLT-001",
      "Quadro",
      "Localizar um quadro por seu identificador.",
      "Pesquisar exclusivamente o identificador QA-xxxx, sem misturar cargo, perfil ou órgão.",
      "QuadroAutorizadoRow.codigo.",
      "string",
      "TextFieldSeplag",
      undefined,
      "Atualiza a lista durante a digitação.",
    ),
    Cargo: spec(
      "CV-QA-FLT-002",
      "Cargo",
      "Restringir a consulta ao cargo selecionado.",
      "Comparar exatamente com o cargo informado no quadro autorizado.",
      "QuadroAutorizadoRow.cargo.",
      "string | vazio",
      "DropdownFieldSeplag",
    ),
    Órgão: spec(
      "CV-QA-FLT-003",
      "Órgão",
      "Restringir a consulta aos quadros cuja lei admite o órgão selecionado.",
      "Comparar com os órgãos definidos na lei; pendente de ato não é órgão fictício.",
      "orgaosDefinidosLei e orgao de compatibilidade.",
      "string | vazio",
      "DropdownFieldSeplag",
    ),
    "Tipo de vínculo": spec(
      "CV-QA-FLT-004",
      "Tipo de vínculo",
      "Restringir a consulta ao tipo de vínculo selecionado.",
      "Comparar exatamente com o tipo de vínculo informado no quadro autorizado.",
      "QuadroAutorizadoRow.vinculo.",
      "enum",
      "DropdownFieldSeplag",
    ),
    Situação: spec(
      "CV-QA-FLT-005",
      "Situação",
      "Consultar quadros conforme o estado operacional da vigência.",
      "Usar somente os estados oficiais Agendado, Ativo, Encerrado e Extinto.",
      "SituacaoVigencia e datas do QuadroAutorizadoRow.",
      "enum",
      "DropdownFieldSeplag",
    ),
    Limpar: spec(
      "CV-QA-ACT-001",
      "Limpar filtros",
      "Restaurar a consulta padrão.",
      "Limpar quadro, cargo, órgão, tipo e situação.",
      "Estado local dos filtros.",
      "void",
      "BotaoLimparFiltroSeplag",
      undefined,
      "Não altera registros nem a ordenação.",
    ),
  };

export const quadroTableSpecification = spec(
  "CV-QA-TBL-001",
  "Consulta do Quadro Autorizado",
  "Exibir cada origem legal e a posição quantitativa para controle e evolução do quadro.",
  "Uma linha representa a versão atual; ordenar o cadastro mais recente primeiro, paginar pela biblioteca e expandir o acordeon à direita para consultar versões anteriores.",
  "QuadroAutorizadoRow e saldos derivados.",
  "QuadroAutorizadoRow[]",
  "TablePaginadoSeplag",
  undefined,
  "Ordenação ocorre pelo cabeçalho; paginação usa 10, 20 ou 50 registros; seta para baixo abre o histórico e seta para cima o recolhe.",
);

export const quadroColumnSpecifications: Record<string, SpecificationMetadata> =
  {
    Quadro: spec(
      "CV-QA-COL-001",
      "Quadro",
      "Identificar a origem legal e sua versão.",
      "O código permanece entre versões; a versão distingue cada evolução preservada.",
      "codigo e versao.",
      "string + integer",
      "TablePaginadoSeplag",
    ),
    Cargo: spec(
      "CV-QA-COL-002",
      "Cargo",
      "Informar o cargo controlado e seu perfil ou vínculo.",
      "Cargo é obrigatório; perfil profissional é opcional e poderá vir do cadastro funcional.",
      "cargo, perfilProfissional e vinculo.",
      "string",
      "TablePaginadoSeplag",
    ),
    Órgão: spec(
      "CV-QA-COL-003",
      "Órgão ou destinação legal",
      "Mostrar como a lei tratou a destinação.",
      "Exibir órgão único, quantidade de órgãos ou Pendente de ato; nunca criar órgão fictício Não distribuídas.",
      "formaDestinacaoLegal e orgaosDefinidosLei.",
      "string",
      "TablePaginadoSeplag",
    ),
    Autorizadas: spec(
      "CV-QA-COL-004",
      "Autorizadas",
      "Mostrar o limite legal da versão.",
      "Somente muda por edição pré-vigência ou nova versão legal.",
      "autorizadas.",
      "integer",
      "TablePaginadoSeplag",
    ),
    Ocupadas: spec(
      "CV-QA-COL-005",
      "Ocupadas",
      "Mostrar vagas com ocupação ativa.",
      "Cada vínculo ocupa uma vaga; cessão não desocupa a origem.",
      "ocupadas conciliadas com ocupações.",
      "integer",
      "TablePaginadoSeplag",
    ),
    Comprometidas: spec(
      "CV-QA-COL-006",
      "Comprometidas",
      "Mostrar vagas vinculadas a processo funcional ativo.",
      "Vagas comprometidas permanecem disponíveis ou ocupadas conforme seu estado, mas não podem ser reduzidas nem movimentadas.",
      "ComprometimentoVaga com situação ATIVO.",
      "integer",
      "TablePaginadoSeplag",
    ),
    Disponíveis: spec(
      "CV-QA-COL-007",
      "Disponíveis",
      "Mostrar o saldo disponível que já possui destinação formal e pode ser utilizado.",
      "Subtrair do saldo disponível as vagas pendentes de distribuição; pendência distributiva não é saldo livre.",
      "Vagas individualizadas, comprometimentos e posição da distribuição.",
      "integer",
      "TablePaginadoSeplag",
    ),
    "Pendente de distribuição": spec(
      "CV-QA-COL-008",
      "Pendente de distribuição",
      "Mostrar vagas disponíveis que ainda dependem de ato formal para receber órgão de distribuição.",
      "A vaga permanece no estado Disponível, mas não integra Disponíveis livres enquanto sua situação distributiva for PENDENTE_ATO.",
      "PosicaoDistribuicaoVaga.situacaoDistribuicao e Vaga.estado.",
      "integer",
      "TablePaginadoSeplag",
    ),
    Situação: spec(
      "CV-QA-COL-009",
      "Situação",
      "Apresentar o estado temporal da versão.",
      "Calcular os seis estados operacionais oficiais pelas datas e pela situação cadastrada.",
      "situacaoVigencia, dataAtivacao, dataEncerramento e dataExtincao.",
      "enum",
      "SituacaoVigenciaSeplag + BadgeSeplag + TablePaginadoSeplag",
    ),
    "Histórico de versões": spec(
      "CV-QA-EXP-001",
      "Histórico de versões",
      "Consultar as versões anteriores preservadas do quadro.",
      "A expansão não altera os totais atuais; deve apresentar a evolução legal que encerrou cada versão, incluindo ampliação, redução, transformação ou extinção progressiva.",
      "versoesAnterioresPorQuadro (mock temporário; futuramente histórico persistido do Quadro Autorizado) e documentos legais.",
      "QuadroAutorizadoVersao[]",
      "TablePaginadoSeplag (rowExpansionTemplate + ícones chevron)",
    ),
    Ações: spec(
      "CV-QA-COL-010",
      "Ações",
      "Disponibilizar somente operações permitidas.",
      "Visualizar sempre; editar/excluir antes da vigência; criar nova versão quando vigente.",
      "situação, id e permissões futuras.",
      "button[]",
      "BotaoIconSeplag + TablePaginadoSeplag",
    ),
  };

export const quadroActionSpecifications: Record<string, SpecificationMetadata> =
  {
    "Novo Quadro": spec(
      "CV-QA-ACT-002",
      "Novo Quadro",
      "Cadastrar uma nova origem legal de vagas.",
      "Exigir base legal, identificação, quantitativo, alocação e vigência; ao entrar em vigor, gerar vagas individualizadas.",
      "Formulário de Novo Quadro.",
      "navigation",
      "BotaoAdicionarSeplag",
      `${quadroScreenSpecification.route}/novo`,
      "Abre o formulário; o salvamento cria a origem legal e as vagas conforme a data de ativação.",
    ),
    Visualizar: spec(
      "CV-QA-ACT-003",
      "Visualizar quadro",
      "Abrir todas as informações sem permitir alteração.",
      "Exibir identificação, abrangência, quantitativos, base legal e vigência em modal somente leitura.",
      "QuadroAutorizadoRow e documentos associados.",
      "dialog",
      "BotaoIconSeplag + ModalSeplag",
      `${quadroScreenSpecification.route}#visualizar`,
      "Abre modal somente leitura; não altera o registro.",
    ),
    "Fechar visualização": spec(
      "CV-QA-ACT-008",
      "Fechar visualização",
      "Fechar o modal sem alterar o quadro.",
      "A ação é exclusivamente de navegação e não persiste dados.",
      "Estado de abertura do ModalSeplag.",
      "void",
      "BotaoVoltarSeplag + ModalSeplag",
      undefined,
      "Fecha o modal e retorna à consulta preservando filtros.",
    ),
    Editar: spec(
      "CV-QA-ACT-004",
      "Editar antes da vigência",
      "Corrigir uma autorização futura.",
      "Disponível somente no estado operacional Agendado; após a ativação, bloquear edição direta.",
      "status operacional calculado por SituacaoVigenciaSeplag.",
      "navigation",
      "BotaoIconSeplag",
      `${quadroScreenSpecification.route}/:id/editar`,
      "Não é exibido quando o quadro já iniciou seus efeitos.",
    ),
    Excluir: spec(
      "CV-QA-ACT-005",
      "Excluir antes da vigência",
      "Remover autorização futura sem efeitos.",
      "Exigir confirmação com ModalDeleteSeplag e permitir somente no estado Agendado.",
      "Quadro e vagas relacionadas.",
      "confirmation + mutation",
      "BotaoIconSeplag + ModalDeleteSeplag",
      "mutation:excluir-quadro-agendado",
      "Solicita confirmação e remove também as vagas futuras relacionadas.",
    ),
    "Criar nova versão": spec(
      "CV-QA-ACT-007",
      "Criar nova versão",
      "Registrar evolução legal sem sobrescrever a versão vigente.",
      "Ampliação, redução, transformação ou extinção progressiva preservam histórico e produzem efeito na data definida.",
      "Quadro vigente, documento legal e operação legal.",
      "navigation",
      "BotaoIconSeplag + BotaoAdicionarSeplag",
      `${quadroScreenSpecification.route}/:id/nova-versao`,
      "Abre o fluxo de evolução legal preservando a versão atual.",
    ),
  };

export const quadroBusinessItems = [
  ...Object.values(quadroKpiSpecifications),
  ...Object.values(quadroFilterSpecifications),
  quadroTableSpecification,
  ...Object.values(quadroColumnSpecifications),
  ...Object.values(quadroActionSpecifications),
];
