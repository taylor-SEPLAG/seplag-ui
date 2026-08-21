// Listas de domínio estáticas que alimentam os campos de seleção do cadastro de certame.
// RN-11: quando o valor interno não corresponder à tabela do TCE-MT, o de-para completo é
// dependência junto à MTI (ver seção 9 do US-XXX) — os códigos aqui são placeholders de UI.

export const TIPOS_CERTAME = [
 { label:"Concurso Público", value:"CONCURSO_PUBLICO" },
 { label:"Processo Seletivo Simplificado (PSS)", value:"PSS" },
] as const;

export const OPCOES_SIM_NAO = [
 { label:"Sim", value:"S" },
 { label:"Não", value:"N" },
] as const;

// Carreira do cargo/vaga — só se aplica a Concurso Público (provimento efetivo, vinculado a um
// plano de carreira); Processo Seletivo Simplificado não tem carreira (contratação temporária).
export const CARREIRAS_CONCURSO = [
 { label:"Servidor Público (Administração Geral)", value:"SERVIDOR_PUBLICO" },
 { label:"Magistério", value:"MAGISTERIO" },
 { label:"Saúde", value:"SAUDE" },
 { label:"Segurança Pública", value:"SEGURANCA_PUBLICA" },
 { label:"Fiscal/Tributária", value:"FISCAL_TRIBUTARIA" },
 { label:"Perícia Oficial (POLITEC)", value:"PERICIA_OFICIAL" },
 { label:"Procuradoria", value:"PROCURADORIA" },
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

function normalizarCodigoPolo(nome:string) {
 return nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/(^-+|-+$)/g, "");
}

export interface RegiaoPlanejamentoMT { value:string; regiao:string; polo:string; municipios:readonly string[] }

export const REGIOES_PLANEJAMENTO_MT:readonly RegiaoPlanejamentoMT[] = [
 { value:"REGIAO-I", regiao:"Região I — Metropolitana / Baixada Cuiabana", polo:"Cuiabá", municipios:["Cuiabá", "Várzea Grande", "Santo Antônio de Leverger", "Chapada dos Guimarães", "Acorizal", "Nossa Senhora do Livramento", "Barão de Melgaço", "Poconé", "Jangada", "Rosário Oeste", "Nobres", "Planalto da Serra"] },
 { value:"REGIAO-II", regiao:"Região II — Sul", polo:"Rondonópolis", municipios:["Rondonópolis", "Jaciara", "Juscimeira", "Pedra Preta", "São José do Povo", "Itiquira", "Alto Araguaia", "Alto Garças", "Alto Taquari", "Guiratinga", "Tesouro", "Dom Aquino"] },
 { value:"REGIAO-III", regiao:"Região III — Centro-Norte / Teles Pires", polo:"Sinop", municipios:["Sinop", "Sorriso", "Lucas do Rio Verde", "Nova Mutum", "Tapurah", "Ipiranga do Norte", "Itanhangá", "Cláudia", "Feliz Natal", "Santa Carmem", "Vera", "União do Sul"] },
 { value:"REGIAO-IV", regiao:"Região IV — Norte", polo:"Alta Floresta", municipios:["Alta Floresta", "Colíder", "Guarantã do Norte", "Peixoto de Azevedo", "Matupá", "Marcelândia", "Nova Canaã do Norte", "Nova Santa Helena", "Itaúba", "Apiacás", "Carlinda", "Nova Bandeirantes", "Paranaíta"] },
 { value:"REGIAO-V", regiao:"Região V — Sudoeste / Vale do Jauru", polo:"Cáceres", municipios:["Cáceres", "Mirassol d'Oeste", "São José dos Quatro Marcos", "Araputanga", "Pontes e Lacerda", "Comodoro", "Vila Bela da Santíssima Trindade", "Porto Esperidião", "Curvelândia", "Lambari d'Oeste", "Rio Branco", "Salto do Céu", "Reserva do Cabaçal", "Jauru", "Figueirópolis d'Oeste", "Indiavaí", "Vale de São Domingos", "Nova Lacerda", "Conquista d'Oeste"] },
 { value:"REGIAO-VI", regiao:"Região VI — Tangará da Serra", polo:"Tangará da Serra", municipios:["Tangará da Serra", "Campo Novo do Parecis", "Barra do Bugres", "Nova Olímpia", "Arenápolis", "Denise", "Santo Afonso", "Porto Estrela", "Sapezal", "Brasnorte"] },
 { value:"REGIAO-VII", regiao:"Região VII — Araguaia", polo:"Barra do Garças", municipios:["Barra do Garças", "Araguaiana", "Cocalinho", "Nova Xavantina", "Água Boa", "Pontal do Araguaia", "General Carneiro", "Torixoréu", "Ribeirãozinho", "Araguainha", "Campinápolis", "Nova Nazaré"] },
 { value:"REGIAO-VIII", regiao:"Região VIII — Norte Araguaia", polo:"Confresa", municipios:["Confresa", "Vila Rica", "São Félix do Araguaia", "Santa Terezinha", "Porto Alegre do Norte", "Canabrava do Norte", "Luciara", "Alto Boa Vista", "Querência", "Ribeirão Cascalheira", "Serra Nova Dourada", "Bom Jesus do Araguaia"] },
 { value:"REGIAO-IX", regiao:"Região IX — Noroeste", polo:"Juína", municipios:["Juína", "Juara", "Aripuanã", "Colniza", "Cotriguaçu", "Juruena", "Castanheira", "Novo Horizonte do Norte", "Porto dos Gaúchos", "Tabaporã"] },
 { value:"REGIAO-X", regiao:"Região X — Médio Norte", polo:"Diamantino", municipios:["Diamantino", "Alto Paraguai", "Nova Marilândia", "Santo Afonso", "Arenápolis", "Nortelândia", "São José do Rio Claro", "Nova Maringá", "Santa Rita do Trivelato"] },
 { value:"REGIAO-XI", regiao:"Região XI — Centro / Vale do Rio Cuiabá", polo:"Primavera do Leste", municipios:["Primavera do Leste", "Campo Verde", "Paranatinga", "Gaúcha do Norte", "Poxoréu"] },
 // Classificação complementar de polos intermediários usada em divisões de saúde/educação — sem
 // lista própria de municípios abrangidos (os municípios citados já pertencem às regiões IX e X).
 { value:"REGIAO-XII", regiao:"Região XII — Centro-Oeste / Guaporé", polo:"Juara / São José do Rio Claro", municipios:[] },
];

// Lista simples de municípios do cargo/vaga — independente da Abrangência do certame (sem
// travamento por Municipal, sem agrupamento por Região, sem opção "Todos os Polos").
const NOMES_MUNICIPIOS_MT = Array.from(new Set(REGIOES_PLANEJAMENTO_MT.flatMap((item) => item.municipios))).sort((a, b) => a.localeCompare(b, "pt-BR"));

export const MUNICIPIOS_MT = NOMES_MUNICIPIOS_MT.map((nome) => ({ label:nome, value:normalizarCodigoPolo(nome) }));

export const TIPOS_CONTRATACAO_EXECUCAO = [
 { label:"Própria UG", value:"PROPRIA_UG" },
 { label:"Empresa Contratada", value:"EMPRESA_CONTRATADA" },
] as const;

export const EMPRESAS_CADASTRADAS = [
 { label:"INSEL — Instituto Nacional de Seleções Públicas", value:"INSEL" },
 { label:"FCC — Fundação Carlos Chagas", value:"FCC" },
 { label:"FGV — Fundação Getulio Vargas", value:"FGV" },
 { label:"SELECON — Seleções e Concursos", value:"SELECON" },
 { label:"IAB — Instituto de Administração Brasileira", value:"IAB" },
 { label:"Apex — Agência de Pesquisa e Execução", value:"APEX" },
 { label:"MPE — MPE Consultoria", value:"MPE" },
 { label:"CIEE — Centro de Integração Empresa-Escola", value:"CIEE" },
] as const;

// RN-12/RN-22: obrigatório quando "Tipo de contratação (execução)" = Empresa Contratada — fonte
// única de verdade para a contratação de banca/empresa organizadora (o antigo checkbox dedicado
// "houve contratação de banca" foi removido do formulário).
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
export const TIPOS_COTA = [
 { label:"Ampla Concorrência", value:"AMPLA" },
 { label:"PCD — Pessoas com Deficiência", value:"PCD" },
 { label:"PPP — Pessoas Pretas e Pardas", value:"PPP" },
 { label:"Indígenas", value:"INDIGENAS" },
 { label:"Quilombolas", value:"QUILOMBOLAS" },
 { label:"TEA — Transtorno do Espectro Autista", value:"TEA" },
] as const;

// Busca em tabela de leis cadastradas (campo "Lei que rege o certame" / seção 4.2 do US-XXX).
export const LEIS_CERTAME = [
 { label:"LC 600/2017 — Contratação Temporária do Estado de MT", value:"LC-600-2017" },
 { label:"Lei 6.752/1995 — Estatuto do Servidor Público de MT", value:"LEI-6752-1995" },
 { label:"IN nº 05 — Trâmites de processo seletivo e concurso público", value:"IN-05" },
] as const;

// Jornada de trabalho do cargo/vaga — para vaga existente, vem travada do cargo já cadastrado no
// sistema (ver CARGOS_CADASTRADOS.jornada); para vaga nova, o usuário define ao cadastrar o cargo.
export const JORNADAS_TRABALHO = [
 { label:"20 horas semanais", value:"20H" },
 { label:"24 horas semanais", value:"24H" },
 { label:"30 horas semanais", value:"30H" },
 { label:"40 horas semanais", value:"40H" },
 { label:"Dedicação Exclusiva", value:"DEDICACAO_EXCLUSIVA" },
] as const;

// RN-11: cargos já cadastrados no sistema — consultados antes de permitir a criação de um novo (vaga existente).
// quadroCodigo/quadroVersao: vínculo automático com o Quadro de Vagas (Controle de Vagas > Quadro Autorizado)
// vigente para o cargo — rastreabilidade Edital → Quadro de Vagas → Gestão de Ingresso.
// jornada: carga horária já registrada para o cargo (ver JORNADAS_TRABALHO).
export const CARGOS_CADASTRADOS = [
 { id:"CGO-AUDITOR-FISCAL", nome:"Auditor Fiscal", quadroCodigo:"QA-0007", quadroVersao:1, jornada:"DEDICACAO_EXCLUSIVA" },
 { id:"CGO-ANALISTA-TI", nome:"Analista de TI", quadroCodigo:"QA-0015", quadroVersao:2, jornada:"40H" },
 { id:"CGO-PROFESSOR-PORTUGUES", nome:"Professor — Língua Portuguesa", quadroCodigo:"QA-0012", quadroVersao:1, jornada:"30H" },
 { id:"CGO-ENFERMEIRO", nome:"Enfermeiro", quadroCodigo:"QA-0009", quadroVersao:1, jornada:"30H" },
 { id:"CGO-MEDICO", nome:"Médico", quadroCodigo:"QA-0021", quadroVersao:3, jornada:"20H" },
] as const;

export const ORGAOS_CERTAME = ["SEPLAG", "SEDUC", "SES", "SESP", "SEJUS", "SEFAZ", "SETASC", "SEMA", "PJC"] as const;

// Sentinela usada no campo "Órgão" do cargo/vaga quando o certame tem mais de um órgão participante
// (ver setoresParticipantes) — indica que a vaga é direcionada a todos eles, não a um específico.
export const ORGAO_TODOS = "TODOS";

export const SITUACOES_CERTAME = [
 { label:"Abertura", value:"ABERTO" },
 { label:"Retificação do Edital de Abertura", value:"RETIFICACAO_EDITAL" },
 { label:"Homologação", value:"HOMOLOGADO" },
 { label:"Retificação da Homologação", value:"RETIFICACAO_HOMOLOGACAO" },
 { label:"Prorrogação da Validade", value:"PRORROGACAO_VALIDADE" },
 { label:"Cancelamento/Anulação", value:"CANCELADO_ANULADO" },
 { label:"Paralisação", value:"PARALISADO" },
 { label:"Homologação Parcial", value:"HOMOLOGACAO_PARCIAL" },
 { label:"Retificação da Homologação Parcial", value:"RETIFICACAO_HOMOLOGACAO_PARCIAL" },
] as const;

// Catálogo alinhado à seção 1.1 (Concurso Público) e 3.1 (PSS) do Manual de Orientação para Remessa
// de Documentos ao TCE/MT — exigências da fase de abertura do edital.
export const DOCUMENTOS_CERTAME: readonly { tipo:string; label:string; obrigatorioSempre:boolean }[] = [
 { tipo:"JUSTIFICATIVA_ABERTURA", label:"Justificativa de abertura", obrigatorioSempre:true },
 { tipo:"EDITAL_INTEGRA", label:"Cópia integral do edital de abertura", obrigatorioSempre:true },
 { tipo:"COMPROVANTE_PUBLICACAO_EDITAL", label:"Comprovante da publicação resumida do edital", obrigatorioSempre:true },
 { tipo:"LEI_ATO_AUTORIZACAO", label:"Lei/ato que autoriza o certame", obrigatorioSempre:true },
 { tipo:"DECLARACAO_ORDENADOR_DESPESA", label:"Declaração do ordenador de despesa (adequação com LOA/PPA/LDO)", obrigatorioSempre:true },
 { tipo:"DESIGNACAO_COMISSAO", label:"Comprovante de publicação do ato que designa a comissão", obrigatorioSempre:true },
 { tipo:"LOTACIONOGRAMA_ANALITICO", label:"Demonstrativo analítico do lotacionograma atualizado", obrigatorioSempre:true },
 { tipo:"PARECER_CONTROLE_INTERNO", label:"Parecer da unidade de controle interno", obrigatorioSempre:true },
 { tipo:"DECLARACAO_RESPONSAVEL", label:"Declaração do responsável", obrigatorioSempre:true },
 // RN-20: sempre obrigatório para Concurso Público e PSS — abertura de vaga é, por si só, ato
 // gerador de despesa futura (Manual TCE/MT, Cap. III, item 1.1.5, Anexo XLII). Não depende mais
 // do checkbox "gerou despesas".
 { tipo:"DEMONSTRATIVO_LRF", label:"Demonstrativo de Estimativa de Impacto (LRF)", obrigatorioSempre:true },
 // RN-21: mesmo gatilho condicional do Contrato social — obrigatório quando "Tipo de contratação
 // (execução)" = Empresa Contratada (ver documentoObrigatorio em CertameFormContent.tsx).
 { tipo:"PUBLICACAO_CERTAME_LICITATORIO", label:"Publicação do certame licitatório (se houver)", obrigatorioSempre:false },
 { tipo:"CONTRATO_SOCIAL_EMPRESA", label:"Contrato social da empresa/instituição contratada", obrigatorioSempre:false },
 { tipo:"OUTROS_COMISSAO", label:"Outros documentos da comissão organizadora", obrigatorioSempre:false },
];

// Catálogo alinhado à seção 2 (Retificação do Edital de Abertura) do Manual de Orientação para
// Remessa de Documentos ao TCE/MT. Não bloqueia o salvamento do certame (obrigatorioSempre:false) —
// só se aplica quando essa situação é de fato registrada (ver SituacoesCertameModal).
export const DOCUMENTOS_RETIFICACAO_EDITAL: readonly { tipo:string; label:string; obrigatorioSempre:boolean }[] = [
 { tipo:"TERMO_ADITIVO_EDITAL", label:"Termo aditivo ao edital de abertura", obrigatorioSempre:false },
 { tipo:"COMPROVANTE_PUBLICACAO_TERMO_ADITIVO", label:"Comprovante da publicação do termo aditivo na Imprensa Oficial", obrigatorioSempre:false },
];

// Catálogo alinhado à seção 3 (Homologação) do Manual de Orientação para Remessa de Documentos ao
// TCE/MT. Comprovante de residência (Agentes Comunitários de Saúde) não se aplica ao Poder
// Executivo estadual — mantido como não obrigatório, com opção de justificativa N/A.
export const DOCUMENTOS_HOMOLOGACAO: readonly { tipo:string; label:string; obrigatorioSempre:boolean }[] = [
 { tipo:"EDITAL_HOMOLOGACAO_INSCRICOES", label:"Edital de homologação das inscrições", obrigatorioSempre:false },
 { tipo:"DECISAO_RECURSOS_EDITAL_HOMOLOGACAO", label:"Decisão quanto aos recursos contra o edital de homologação das inscrições", obrigatorioSempre:false },
 { tipo:"RELACAO_CANDIDATOS_APROVADOS", label:"Relação dos candidatos aprovados e classificados", obrigatorioSempre:false },
 { tipo:"DECISAO_RECURSOS_RELACAO_CANDIDATOS", label:"Decisão quanto aos recursos contra a relação de candidatos aprovados e classificados", obrigatorioSempre:false },
 { tipo:"EDITAL_RESULTADO_FINAL", label:"Edital de resultado final do certame", obrigatorioSempre:false },
 { tipo:"ATO_HOMOLOGACAO", label:"Ato de homologação do certame", obrigatorioSempre:false },
 { tipo:"COMPROVANTE_PUBLICACAO_EDITAL_HOMOLOGACAO", label:"Comprovante de publicação do edital de homologação das inscrições", obrigatorioSempre:false },
 { tipo:"COMPROVANTE_PUBLICACAO_DECISAO_RECURSOS_EDITAL_HOMOLOGACAO", label:"Comprovante de publicação da decisão de recursos (edital de homologação)", obrigatorioSempre:false },
 { tipo:"COMPROVANTE_PUBLICACAO_RELACAO_CANDIDATOS", label:"Comprovante de publicação da relação de candidatos aprovados e classificados", obrigatorioSempre:false },
 { tipo:"COMPROVANTE_PUBLICACAO_DECISAO_RECURSOS_RELACAO_CANDIDATOS", label:"Comprovante de publicação da decisão de recursos (relação de candidatos)", obrigatorioSempre:false },
 { tipo:"COMPROVANTE_PUBLICACAO_RESULTADO_FINAL", label:"Comprovante de publicação do resultado final do concurso", obrigatorioSempre:false },
 { tipo:"COMPROVANTE_PUBLICACAO_ATO_HOMOLOGACAO", label:"Comprovante de publicação do ato de homologação", obrigatorioSempre:false },
 { tipo:"COMPROVANTE_RESIDENCIA_ACS", label:"Comprovante de residência dos candidatos (Agentes Comunitários de Saúde)", obrigatorioSempre:false },
];

// Catálogo alinhado à seção 4 (Retificação da Homologação) — mesmos documentos da seção 3,
// reeditados/republicados; tipos próprios para não sobrescrever o arquivo já anexado à Homologação.
export const DOCUMENTOS_RETIFICACAO_HOMOLOGACAO: readonly { tipo:string; label:string; obrigatorioSempre:boolean }[] =
 DOCUMENTOS_HOMOLOGACAO.map((item) => ({ ...item, tipo:`${item.tipo}_RETIF` }));

// Catálogo de documentos exigido para cada situação do certame (ver SITUACOES_CERTAME) — usado tanto
// na aba Documentos do cadastro quanto no registro de nova situação (SituacoesCertameModal). As
// variantes "Parcial" reutilizam o catálogo da Homologação/Retificação de Homologação cheia, já que
// o Manual do TCE/MT não distingue documentos próprios para a homologação parcial. Situações sem
// catálogo (Prorrogação de Validade, Cancelamento/Anulação, Paralisação) seguem com o upload
// genérico de "documento de apoio".
export const DOCUMENTOS_POR_SITUACAO: Partial<Record<string, readonly { tipo:string; label:string; obrigatorioSempre:boolean }[]>> = {
 ABERTO: DOCUMENTOS_CERTAME,
 RETIFICACAO_EDITAL: DOCUMENTOS_RETIFICACAO_EDITAL,
 HOMOLOGADO: DOCUMENTOS_HOMOLOGACAO,
 RETIFICACAO_HOMOLOGACAO: DOCUMENTOS_RETIFICACAO_HOMOLOGACAO,
 HOMOLOGACAO_PARCIAL: DOCUMENTOS_HOMOLOGACAO,
 RETIFICACAO_HOMOLOGACAO_PARCIAL: DOCUMENTOS_RETIFICACAO_HOMOLOGACAO,
};

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

// Catálogo de Tipos de Prova/Etapa do TCE-MT (tabela TFCONC — TFCONC_CODIGO/TFCONC_DESCRICAO),
// usado para classificar cada fase do cronograma no envio ao TCE-MT. Assim como o nome da fase,
// a classificação é apenas uma sugestão: totalmente editável/alterável pelo usuário.
export const TIPOS_FASE_CONCURSO_TCE = [
 { value:"1", label:"Prova Escrita – Objetiva" },
 { value:"2", label:"Prova Escrita – Subjetiva" },
 { value:"3", label:"Prova Escrita – Objetiva e Subjetiva" },
 { value:"4", label:"Prova Oral" },
 { value:"5", label:"Prova de Títulos" },
 { value:"6", label:"Apresentação de Currículos" },
 { value:"7", label:"Entrevista" },
 { value:"8", label:"Prova Psicológica / Psicotécnico" },
 { value:"9", label:"Apresentação de Currículos e Entrevista" },
 { value:"10", label:"Apresentação de Currículos e Entrevista e Prova Psicológica/Psicotécnico" },
 { value:"11", label:"Entrevista e Prova Psicológica/Psicotécnico" },
 { value:"12", label:"Prova Física" },
 { value:"13", label:"Desempenho Didático" },
 { value:"14", label:"Curso de Formação" },
 { value:"15", label:"Prova de Digitação" },
 { value:"16", label:"Investigação Social" },
 { value:"17", label:"Prova Prática" },
] as const;
