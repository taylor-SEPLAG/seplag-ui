import type { SpecificationMetadata } from "../../shared/visualizationModes";

const story = "US-XXX — Cadastro de Concurso Público e Processo Seletivo Simplificado";
const spec = (id:string, title:string, description:string, businessRule:string, source:string, dataType:string, component:string, route?:string, behavior?:string):SpecificationMetadata => ({ id, title, description, businessRule, source, dataType, component, route, behavior, status:"CONFIRMADO", userStory:story });

export const certamesListScreenSpecification = spec(
 "PSS-CERT-LST", "Cadastro de Certames", "Listar os certames (Concurso Público / PSS) cadastrados diretamente no SIGEP, substituindo a tela 253 do CEAP para fins de prestação de contas ao TCE-MT.",
 "O SIGEP passa a ser a origem do cadastro do certame (identificação, legislação, datas, vagas, financeiro e documentos); isso é distinto do módulo 'Processos Seletivos', que apenas acompanha o fluxo recebido do SIES.",
 "Certame[] do controlePssStore.", "Certame[]", "Página React com listagem e filtros",
 "/prototipos/sigep/controle-pss/certames", "Clicar em um certame abre o formulário de edição; 'Novo certame' abre o formulário em branco.",
);

export const certamesListBlockSpecifications = {
 aviso: spec("PSS-CERT-LST-BLC-001", "Origem do cadastro", "Esclarecer que, diferente de 'Processos Seletivos', este cadastro é escrito no SIGEP.", "RN-01 a RN-16 — o cadastro replica a estrutura da tela 253 do CEAP já validada pelo TCE-MT.", "Regra do módulo.", "estático", "faixa informativa"),
 lista: spec("PSS-CERT-LST-BLC-002", "Lista de certames", "Selecionar o certame a visualizar ou editar.", "Cada linha exibe número/nome do edital, órgão mandante (RN-05), tipo (RN-01) e situação atual (RN-15). RN-06.5 — cada linha traz os atalhos Visualizar, Editar e Reverter/Histórico vinculados à situação do registro, sem exigir abertura prévia.", "Certame[] filtrados.", "Certame[]", "tabela selecionável", "/prototipos/sigep/controle-pss/certames/:id"),
} satisfies Record<string, SpecificationMetadata>;

export const certamesListFilterSpecifications: Record<string, SpecificationMetadata> = {
 "Órgão": spec("PSS-CERT-LST-FLT-001", "Órgão", "Restringir a lista ao órgão mandante do certame.", "RN-05 — apenas o órgão mandante figura como responsável pela prestação de contas.", "Certame.setor.", "string", "select simples"),
 "Exercício": spec("PSS-CERT-LST-FLT-002", "Exercício", "Restringir a lista ao ano do certame.", "RN-03 — o número do certame do TCE-MT é sequencial e zera a cada exercício.", "Certame.anoConcurso.", "number", "select simples"),
 "Tipo": spec("PSS-CERT-LST-FLT-003", "Tipo de certame", "Restringir a lista a Concurso Público ou PSS.", "RN-01 — são os únicos dois tipos utilizados pela SEPLAG.", "Certame.tipoCertame.", "TipoCertame", "select simples"),
 "Situação": spec("PSS-CERT-LST-FLT-004", "Situação", "Restringir a lista pela situação atual do certame.", "RN-15 — nove situações possíveis, cada uma com prazo próprio de prestação de contas.", "Certame.situacaoAtual.", "SituacaoCertame", "select simples"),
};

export const certamesListActionSpecifications: Record<string, SpecificationMetadata> = {
 "Novo certame": spec("PSS-CERT-LST-ACT-001", "Novo certame", "Abrir o formulário de cadastro em branco.", "Cenário 1 — cadastro válido de certame.", "Rota do módulo.", "route", "botão", "/prototipos/sigep/controle-pss/certames/novo"),
 "Abrir certame": spec("PSS-CERT-LST-ACT-002", "Abrir certame", "Abrir o formulário de edição do certame selecionado.", "Após salvo, o órgão mandante (RN-05) passa a ser somente leitura.", "Lista de certames.", "route", "link de tabela", "/prototipos/sigep/controle-pss/certames/:id"),
 "Reverter/Histórico": spec("PSS-CERT-LST-ACT-003", "Reverter/Histórico", "Abrir o certame diretamente na aba Situações, para consultar o histórico ou registrar uma reversão de situação.", "RN-06.5 e Cenário 7 — atalho de ação vinculado à situação do registro, acessível direto da listagem.", "Lista de certames.", "route", "ícone de tabela", "/prototipos/sigep/controle-pss/certames/:id?aba=SITUACOES"),
};

export const certamesListBusinessItems = [...Object.values(certamesListFilterSpecifications), ...Object.values(certamesListBlockSpecifications), ...Object.values(certamesListActionSpecifications)];
