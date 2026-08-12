import type { SpecificationMetadata } from "../shared/visualizationModes";

const story = "US Controle PSS — Painel Geral de Certames Públicos";
const spec = (id:string, title:string, description:string, businessRule:string, source:string, dataType:string, component:string, route?:string, behavior?:string):SpecificationMetadata => ({ id, title, description, businessRule, source, dataType, component, status:"CONFIRMADO", route, behavior, userStory:story });

export const painelPssScreenSpecification = spec(
 "PSS-PAINEL", "Painel Geral do Controle PSS — Certames Públicos",
 "Consolidar em uma única página a posição operacional dos certames (Concursos Públicos e Processos Seletivos Simplificados) cadastrados diretamente no SIGEP: KPIs, distribuição por status, próximos prazos, cotas/vagas, alertas de pendência e a lista de certames em andamento.",
 "O Cadastro de Certames é a origem SIGEP de concursos e PSS (RN-01 a RN-24); o Painel Geral resume, sem paginar em telas separadas, tudo que já é calculado a partir de Certame[] no store.",
 "Certame[] do controlePssStore.", "Certame[]", "Página React + seletores puros (painelSelectors.ts)",
 "/prototipos/sigep/controle-pss/painel", "Recalcula a visão sempre que os certames do store ou os filtros (órgão/situação/busca) mudarem.",
);

export const painelPssKpiSpecifications:Record<string, SpecificationMetadata> = {
 "Certames ativos": spec("PSS-PAINEL-KPI-001", "Certames ativos", "Certames cuja situação atual não é Cancelamento/Anulação.", "RN-15 — cancelamento/anulação é a única situação tratada como encerramento definitivo do certame.", "Certame.situacaoAtual.", "integer", "KPI navegável", "/prototipos/sigep/controle-pss/certames", "Abre Cadastro de Certames com os filtros aplicados."),
 "Total de vagas ofertadas": spec("PSS-PAINEL-KPI-002", "Total de vagas ofertadas", "Somatório das vagas dos cargos cadastrados nos certames ativos.", "RN-14 — cada certame deve ter ao menos um cargo/vaga cadastrado.", "Certame.cargos[].quantidadeVagas dos certames ativos.", "integer", "KPI navegável", "/prototipos/sigep/controle-pss/certames"),
 "Inscrições abertas": spec("PSS-PAINEL-KPI-003", "Inscrições abertas", "Certames cuja janela de inscrições gerais contém a data de referência do sistema.", "Certame.inicioInscricoesGerais/fimInscricoesGerais.", "Certame.inicioInscricoesGerais, Certame.fimInscricoesGerais.", "integer", "KPI navegável", "/prototipos/sigep/controle-pss/certames"),
 "Documentos pendentes": spec("PSS-PAINEL-KPI-004", "Documentos pendentes", "Certames com ao menos um documento obrigatório da aba Documentos ainda sem arquivo anexado.", "RN-20 (Demonstrativo LRF sempre obrigatório) e RN-21/RN-22 (documentos condicionados a Tipo de contratação = Empresa Contratada).", "Certame.documentos[] comparado ao catálogo DOCUMENTOS_CERTAME.", "integer", "KPI navegável", "/prototipos/sigep/controle-pss/certames"),
 "Prazos vencidos em 15 dias": spec("PSS-PAINEL-KPI-005", "Prazos vencidos em 15 dias", "Certames cujo prazo de prestação de contas ao TCE-MT (registro mais recente do histórico de situações) vence dentro dos próximos 15 dias a partir da data de referência.", "RN-15 — cada situação registrada reabre um prazo de 48h de prestação de contas; este KPI olha para o prazo vigente de cada certame.", "Certame.historicoSituacoes[].prazoPrestacaoContas.", "integer", "KPI navegável", "/prototipos/sigep/controle-pss/certames"),
};

export const painelPssBlockSpecifications = {
 statusDistribuicao: spec("PSS-PAINEL-BLC-001", "Certames por status", "Distribuição dos certames filtrados em 5 grupos: Em elaboração, Publicada/Inscrições abertas, Em análise/Recursos, Homologado e Cancelado.", "Mapeamento das 9 situações da RN-15 para os 5 grupos solicitados — pendência de validação com a área de negócio, já que o modelo atual não distingue um estado de \"elaboração\" anterior à publicação (RN-15/CA17: todo certame já nasce na situação Aberto).", "Certame.situacaoAtual, agrupado via bucketStatusCertame().", "Record<BucketStatusCertame, number>", "barras de progresso"),
 cotasResumo: spec("PSS-PAINEL-BLC-003", "Cotas e vagas", "Resumo do total de vagas, vagas PCD/PNE e certames com cota, seguido da lista de cotas cadastradas por certame.", "RN-08 — cotas (PcD/PPP/PPI/PPIQ) são cadastradas por certame, sem quantidade própria; a coluna \"Vagas PCD\" é derivada de CargoVagaCertame.quantidadePcd apenas para a cota do tipo PcD — para as demais, o modelo não rastreia uma quantidade específica por cota (exibido como \"—\").", "Certame.cotas[], Certame.cargos[].quantidadePcd.", "CotaCertame[]", "resumo + lista"),
 alertaDocumentos: spec("PSS-PAINEL-ALT-001", "Documentos em falta", "Certames com pelo menos um documento obrigatório sem arquivo anexado.", "RN-20/RN-21/RN-22.", "Certame.documentos[] comparado ao catálogo DOCUMENTOS_CERTAME.", "integer", "cartão de alerta", "/prototipos/sigep/controle-pss/certames"),
 alertaSigadoc: spec("PSS-PAINEL-ALT-002", "SIGADOC pendente", "Total de documentos obrigatórios ainda sem arquivo anexado, somados entre todos os certames filtrados (contagem por documento, não por certame).", "O modo de assinatura (Físico/SIGADOC) e o número de processo SIGADOC são estado do formulário de edição, não persistidos em Certame — este alerta usa a mesma pendência documental de RN-20/RN-21 como proxy, agregada por documento em vez de por certame, até existir integração real com o SIGADOC.", "Certame.documentos[] comparado ao catálogo DOCUMENTOS_CERTAME, somado por documento.", "integer", "cartão de alerta", "/prototipos/sigep/controle-pss/certames"),
 alertaHomologacao: spec("PSS-PAINEL-ALT-003", "Homologação de vagas pendentes", "Certames cuja Data do resultado já passou, mas cuja situação atual ainda não está no grupo Homologado.", "RN-16 — a homologação é o marco do prazo de prestação de contas, distinto da publicação do resultado; aqui sinalizamos o atraso entre as duas datas.", "Certame.dataResultado comparado à data de referência e a bucketStatusCertame().", "integer", "cartão de alerta", "/prototipos/sigep/controle-pss/certames"),
 tabelaCertames: spec("PSS-PAINEL-TBL-001", "Certames em andamento", "Lista, com busca, cada certame filtrado com edital, órgão, situação, vagas, prazo de prestação de contas vigente e progresso de documentos anexados.", "Situação exibida com o mesmo mapa de cores usado no Cadastro de Certames (RN-15); progresso de documentos considera as regras condicionais de RN-20/RN-21/RN-22.", "Certame[] filtrados.", "Certame[]", "tabela com busca", "/prototipos/sigep/controle-pss/certames/:id", "O edital abre o detalhe em Cadastro de Certames."),
} satisfies Record<string, SpecificationMetadata>;

export const painelPssFilterSpecifications:Record<string, SpecificationMetadata> = {
 "Órgão": spec("PSS-PAINEL-FLT-001", "Órgão", "Restringe todo o painel ao órgão mandante selecionado.", "RN-05 — o órgão mandante é o responsável pela prestação de contas do certame.", "Certame.setor.", "string", "select no cabeçalho"),
 "Situação": spec("PSS-PAINEL-FLT-002", "Situação", "Restringe todo o painel ao grupo de status selecionado (Em elaboração, Publicada, Em análise, Homologado ou Cancelado).", "Mesmo agrupamento do bloco \"Certames por status\".", "Certame.situacaoAtual, agrupado via bucketStatusCertame().", "BucketStatusCertame", "select no cabeçalho"),
 "Buscar certame": spec("PSS-PAINEL-FLT-003", "Buscar certame", "Filtra a tabela de certames em andamento por edital, número ou órgão.", "Busca client-side sobre os certames já filtrados por órgão/situação.", "Certame.numeroEditalOrgao, Certame.nomeEdital, Certame.setor.", "string", "campo de busca da tabela"),
};

export const painelPssActionSpecifications:Record<string, SpecificationMetadata> = {
 "Novo certame": spec("PSS-PAINEL-ACT-001", "+ Novo certame", "Abre o cadastro de um novo certame.", "RN-06.1 — o cadastro exige a escolha do tipo (Concurso Público/PSS) como primeira etapa.", "Formulário de Cadastro de Certame.", "route", "botão no cabeçalho", "/prototipos/sigep/controle-pss/certames/novo"),
};

export const painelPssBusinessItems = [
 ...Object.values(painelPssKpiSpecifications),
 ...Object.values(painelPssBlockSpecifications),
 ...Object.values(painelPssFilterSpecifications),
 ...Object.values(painelPssActionSpecifications),
];
