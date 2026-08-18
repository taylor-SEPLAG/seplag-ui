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

// Polo de aplicação do cargo/vaga — as opções e o comportamento do campo mudam conforme a
// Abrangência do certame (aba Contrato e Custos): Municipal trava no município da Unidade Gestora
// (placeholder de UI — a integração com o cadastro real de UG é dependência futura); Regional
// abre a lista das 12 Regiões de Planejamento de Mato Grosso (cada uma com seu município-polo);
// Estadual permite um ou mais municípios-polo específicos, com a opção exclusiva "Todos os Polos"
// (todo o Estado). Fonte: divisão oficial das Regiões de Planejamento de MT (SEPLAN-MT).
export const MUNICIPIO_UNIDADE_GESTORA = "Cuiabá";

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

export const POLOS_REGIONAIS = REGIOES_PLANEJAMENTO_MT.map((item) => ({ label:`${item.regiao} — Polo: ${item.polo}`, value:item.value }));

export const POLO_TODOS_ESTADO = "TODOS";

// Municípios-polo (Estadual) — a cidade-sede de cada Região de Planejamento; a Região XII soma dois
// polos intermediários (Juara e São José do Rio Claro), ambos oferecidos como opções individuais.
const NOMES_POLOS_MUNICIPAIS = Array.from(new Set(REGIOES_PLANEJAMENTO_MT.flatMap((item) => item.polo.split("/").map((nome) => nome.trim()))));

export const POLOS_MUNICIPAIS = [
 { label:"Todos os Polos", value:POLO_TODOS_ESTADO },
 ...NOMES_POLOS_MUNICIPAIS.map((nome) => ({ label:nome, value:normalizarCodigoPolo(nome) })),
];

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
