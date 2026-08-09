// Listas de domínio estáticas que alimentam os campos de seleção do cadastro de certame.
// RN-11: quando o valor interno não corresponder à tabela do TCE-MT, o de-para completo é
// dependência junto à MTI (ver seção 9 do US-XXX) — os códigos aqui são placeholders de UI.

export const TIPOS_CERTAME = [
 { label:"Concurso Público", value:"CONCURSO_PUBLICO" },
 { label:"Processo Seletivo Simplificado (PSS)", value:"PSS" },
] as const;

// TCE-MT — Aplique Gerador: classificação do certame conforme padrão do tribunal (RN-01).
export const TIPOS_CONCURSO_APLIC_TCE = [
 { label:"Concurso Público", value:"1" },
 { label:"Concurso Público Interno", value:"2" },
 { label:"Processo Seletivo Público", value:"3" },
 { label:"Processo Seletivo Simplificado", value:"4" },
] as const;

export const REGIMES_JURIDICOS = [
 { label:"Estatutário", value:"ESTATUTARIO" },
 { label:"Celetista", value:"CELETISTA" },
 { label:"Especial", value:"ESPECIAL" },
] as const;

// "Efetivo" não entra aqui: é exclusivo do Concurso Público, exibido como campo fixo "Nomeado Efetivo".
export const TIPOS_VINCULO = [
 { label:"Contrato Temporário", value:"CONTRATO_TEMPORARIO" },
 { label:"Bolsista", value:"BOLSISTA" },
 { label:"Residente", value:"RESIDENTE" },
 { label:"Estagiário", value:"ESTAGIARIO" },
] as const;

export const ABRANGENCIAS = [
 { label:"Estadual", value:"ESTADUAL" },
 { label:"Regional", value:"REGIONAL" },
 { label:"Municipal", value:"MUNICIPAL" },
] as const;

export const TIPOS_CONTRATACAO_EXECUCAO = [
 { label:"Própria UG", value:"PROPRIA_UG" },
 { label:"Empresa Contratada", value:"EMPRESA_CONTRATADA" },
] as const;

// RN-12: obrigatório quando houveContratacaoBanca = true.
export const TIPOS_CONTRATO_BANCA = [
 { label:"Banca Organizadora", value:"BANCA_ORGANIZADORA" },
 { label:"Instituição Parceira", value:"INSTITUICAO_PARCEIRA" },
 { label:"Dispensa de Licitação", value:"DISPENSA_LICITACAO" },
] as const;

// RN-13: obrigatório quando cobraTaxaInscricao = true e houver isenção prevista.
export const TIPOS_ISENCAO = [
 { label:"Hipossuficiência de renda", value:"HIPOSSUFICIENCIA_RENDA" },
 { label:"Doador de sangue", value:"DOADOR_SANGUE" },
 { label:"Doador de medula óssea", value:"DOADOR_MEDULA" },
 { label:"Desempregado", value:"DESEMPREGADO" },
] as const;

// RN-08: o sistema permite múltiplas cotas por certame; apenas uma prevalece no envio ao TCE-MT.
// Siglas PPP/PPI/PPIQ adicionadas a pedido — nomenclatura por extenso a confirmar com a área de negócio.
export const TIPOS_COTA = [
 { label:"PcD — Pessoa com Deficiência", value:"PCD" },
 { label:"PPP — Pessoas Pretas e Pardas", value:"PPP" },
 { label:"PPI — Pretos, Pardos e Indígenas", value:"PPI" },
 { label:"PPIQ — Pretos, Pardos, Indígenas e Quilombolas", value:"PPIQ" },
] as const;

// Busca em tabela de leis cadastradas (campo "Lei que rege o certame" / seção 4.2 do US-XXX).
export const LEIS_CERTAME = [
 { label:"LC 600/2017 — Contratação Temporária do Estado de MT", value:"LC-600-2017" },
 { label:"Lei 6.752/1995 — Estatuto do Servidor Público de MT", value:"LEI-6752-1995" },
 { label:"IN nº 05 — Trâmites de processo seletivo e concurso público", value:"IN-05" },
] as const;

// RN-11: cargos já cadastrados no sistema — consultados antes de permitir a criação de um novo (vaga existente).
// quadroCodigo/quadroVersao: vínculo automático com o Quadro de Vagas (Controle de Vagas > Quadro Autorizado)
// vigente para o cargo — rastreabilidade Edital → Quadro de Vagas → Gestão de Ingresso.
export const CARGOS_CADASTRADOS = [
 { id:"CGO-AUDITOR-FISCAL", nome:"Auditor Fiscal", quadroCodigo:"QA-0007", quadroVersao:1 },
 { id:"CGO-ANALISTA-TI", nome:"Analista de TI", quadroCodigo:"QA-0015", quadroVersao:2 },
 { id:"CGO-PROFESSOR-PORTUGUES", nome:"Professor — Língua Portuguesa", quadroCodigo:"QA-0012", quadroVersao:1 },
 { id:"CGO-ENFERMEIRO", nome:"Enfermeiro", quadroCodigo:"QA-0009", quadroVersao:1 },
 { id:"CGO-MEDICO", nome:"Médico", quadroCodigo:"QA-0021", quadroVersao:3 },
] as const;

export const ORGAOS_CERTAME = ["SEPLAG", "SEDUC", "SES", "SESP", "SEJUS", "SEFAZ", "SETASC", "SEMA", "PJC"] as const;

export const SITUACOES_CERTAME = [
 { label:"Abertura", value:"ABERTO" },
 { label:"Retificação de Edital", value:"RETIFICACAO_EDITAL" },
 { label:"Homologação", value:"HOMOLOGADO" },
 { label:"Retificação de Homologação", value:"RETIFICACAO_HOMOLOGACAO" },
 { label:"Prorrogação de Validade", value:"PRORROGACAO_VALIDADE" },
 { label:"Cancelamento/Anulação", value:"CANCELADO_ANULADO" },
 { label:"Paralisação", value:"PARALISADO" },
 { label:"Homologação Parcial", value:"HOMOLOGACAO_PARCIAL" },
 { label:"Retificação de Homologação Parcial", value:"RETIFICACAO_HOMOLOGACAO_PARCIAL" },
] as const;

export const DOCUMENTOS_CERTAME: readonly { tipo:string; label:string; obrigatorioSempre:boolean }[] = [
 { tipo:"JUSTIFICATIVA_ABERTURA", label:"Justificativa de abertura", obrigatorioSempre:true },
 { tipo:"PUBLICACAO_CERTAME_LICITATORIO", label:"Publicação do certame licitatório (se houver)", obrigatorioSempre:false },
 { tipo:"LEI_ATO_AUTORIZACAO", label:"Lei/ato que autoriza o certame", obrigatorioSempre:true },
 { tipo:"DECLARACAO_RESPONSAVEL", label:"Declaração do responsável", obrigatorioSempre:true },
 { tipo:"DEMONSTRATIVO_LRF", label:"Demonstrativo de Estimativa de Impacto (LRF)", obrigatorioSempre:false },
 { tipo:"OUTROS_COMISSAO", label:"Outros documentos da comissão organizadora", obrigatorioSempre:false },
];

// Catálogo padrão do TCE-MT (RN-09), usado como sugestão inicial das fases de um novo certame.
// A lista final (Certame.fases) é totalmente editável: renomear, reordenar, adicionar e remover.
export const FASES_TCE_FIXAS: readonly { ordem:number; nome:string }[] = [
 { ordem:1, nome:"Publicação do Edital" },
 { ordem:2, nome:"Período de Inscrições" },
 { ordem:3, nome:"Homologação das Inscrições" },
 { ordem:4, nome:"Aplicação das Provas/Etapas" },
 { ordem:5, nome:"Divulgação do Gabarito" },
 { ordem:6, nome:"Prazo de Recursos" },
 { ordem:7, nome:"Resultado Preliminar" },
 { ordem:8, nome:"Julgamento de Recursos" },
 { ordem:9, nome:"Resultado Final" },
 { ordem:10, nome:"Homologação do Resultado" },
 { ordem:11, nome:"Convocação" },
 { ordem:12, nome:"Nomeação/Posse" },
];
