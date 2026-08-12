import type { SpecificationMetadata } from "../../shared/visualizationModes";

const story = "US-XXX — Cadastro de Concurso Público e Processo Seletivo Simplificado";
const spec = (id:string, title:string, description:string, businessRule:string, source:string, dataType:string, component:string, behavior?:string):SpecificationMetadata => ({ id, title, description, businessRule, source, dataType, component, behavior, status:"CONFIRMADO", userStory:story });

export const certameFormScreenSpecification = spec(
 "PSS-CERT-FRM", "Cadastro/Edição de Certame", "Cadastrar ou editar um Concurso Público / PSS com base no edital publicado, replicando os campos hoje mantidos na tela 253 do CEAP.",
 "Cenário 1 (cadastro válido) exige tipo, nome/número do edital, número do certame, órgão responsável, lei, regime jurídico, tipo de vínculo, data de publicação e ao menos um cargo/vaga. Consolidação de 8 para 4 abas fixas (+ Situações) — todo campo, RN e CA das 8 abas originais foi preservado, apenas redistribuído em blocos com subtítulo dentro das 4 abas novas.",
 "Certame do controlePssStore.", "Certame", "Formulário React organizado em 4 abas fixas, cada uma com blocos internos com subtítulo",
 "Salvar grava em controlePssStore.certames; o certame criado passa a status 'Aberto' (RN-15); bloqueia duplicidade de número/tipo/exercício (RN-23).",
);

export const certameFormTabSpecifications: Record<string, SpecificationMetadata> = {
 "Identificação e Cronograma": spec(
  "PSS-CERT-FRM-TAB-001", "Identificação e Cronograma",
  "Une os antigos blocos Dados Gerais, Datas/Validades e Execução, e Prazos em uma única aba, organizada em 4 blocos com subtítulo: \"Identificação do certame\", \"Datas e execução\", \"Fases do certame\" e \"Prazos de posse/exercício\".",
  "Bloco Identificação do certame — RN-01 (tipo único Conc/PSS — RN-06.2), RN-02 (padrão de nomenclatura do edital), RN-03 (número TCE-MT sequencial e editável), RN-04 (numeração própria por órgão), RN-05 (órgão mandante único) e RN-06.4 (rótulo \"(selecione)\" em Órgãos participantes); Lei de contrato temporário e Lei de PSS ficam ocultas quando o tipo é Concurso (RN-06, seção 3). "
  + "Bloco Datas e execução — RN-07 (a data de publicação do edital não pode ser posterior a nenhuma data subsequente do fluxo); Data de prorrogação e Data de cancelamento ficam ocultas para Processo Seletivo (RN-06, seção 3); RN-19 (validade em dias calculada automaticamente a partir de Publicação → Validade); Abrangência, Tipo de contratação (execução) e Instituição realizadora foram deslocados para o bloco Contratação e custos, na aba Financeiro. "
  + "Bloco Fases do certame — trazido da aba Vagas e Cotas para junto do cronograma do certame; RN-09 (catálogo do TCE-MT como sugestão inicial; fases totalmente editáveis — nome, datas de início/fim, reordenar, incluir e remover). "
  + "Bloco Prazos de posse/exercício — campos numéricos de apoio à contagem de prazos posteriores ao ingresso; bloco oculto por completo para Processo Seletivo (RN-06.3). "
  + "RN-23 — ao salvar, bloqueia duplicidade de Número do certame (TCE-MT) para o mesmo Tipo e Ano do concurso.",
  "Certame (blocos 1, 2, 3 e 7).", "Certame", "formulário com blocos internos com subtítulo",
 ),
 "Contrato e custo": spec(
  "PSS-CERT-FRM-TAB-002", "Contrato e custo",
  "Une os antigos blocos Isenção e Recursos e Contratos em uma única aba, organizada em 2 blocos com subtítulo, nesta ordem: \"Contratação e custos\" e \"Taxa de inscrição\".",
  "Bloco Contratação e custos (primeiro bloco/primeira linha da aba) — inclui Abrangência, Tipo de contratação (execução) e Instituição realizadora (trazidos do bloco Datas e execução, na aba Identificação e Cronograma). RN-12/RN-22 (empenho, contrato, tipo de contratação e aditivos tornam-se obrigatórios quando \"Tipo de contratação (execução)\" = Empresa Contratada; o checkbox \"Houve contratação de banca/empresa organizadora?\" foi removido — o campo Tipo de contratação, agora nesta aba, é a única fonte de verdade). "
  + "Bloco Taxa de inscrição — RN-13 (obrigatório quando o certame prevê cobrança de taxa e isenção). "
  + "Aba exibida tanto para Concurso Público quanto para Processo Seletivo (RN-06, seção 3).",
  "Certame (blocos 4 e 5).", "Certame", "formulário com campos condicionais",
 ),
 "Vagas e Cotas": spec(
  "PSS-CERT-FRM-TAB-003", "Vagas e Cotas",
  "Une os antigos blocos Cargos e Vagas e Cotas em uma única aba, organizada em 2 blocos com subtítulo, nesta ordem: \"Cotas\" e \"Cargos e vagas\". A sub-lista de Fases foi deslocada para a aba Identificação e Cronograma, junto do cronograma do certame.",
  "Bloco Cotas (primeiro bloco/primeira linha da aba) — RN-08 (o sistema aceita múltiplas cotas por certame) e RN-10 (a lei é buscada no catálogo já cadastrado no sistema). "
  + "Bloco Cargos e vagas — RN-10 (código de referência fixo '001'), RN-14 (vaga existente ou nova; ao menos um cargo/vaga é exigido para salvar) e RN-17 (vínculo automático e somente leitura com o Quadro de Vagas do Controle de Vagas > Quadro Autorizado, por cargo — rastreabilidade Edital → Quadro de Vagas → Gestão de Ingresso).",
  "Certame.cargos, Certame.cotas.", "CargoVagaCertame[] | CotaCertame[]", "formulário com 2 sub-grades",
 ),
 "Documentos": spec(
  "PSS-CERT-FRM-TAB-004", "Documentos",
  "Anexos que compõem o pacote de prestação de contas da abertura do edital. Sem mudança de conteúdo na consolidação — mantida como estava.",
  "Capítulo III, itens 1.1 (Concurso) e 3.1 (PSS) do Manual de Orientação para Remessa de Documentos ao TCE/MT — justificativa, edital integral, comprovante de publicação do edital, lei/ato de autorização, declaração do ordenador de despesa, designação da comissão, lotacionograma analítico, parecer do controle interno e declaração do responsável são sempre obrigatórios. "
  + "RN-20 — Demonstrativo de Estimativa de Impacto (LRF) passa a ser SEMPRE obrigatório para Concurso Público e PSS (Cap. III, item 1.1.5, Anexo XLII), independente do checkbox \"gerou despesas\". "
  + "RN-21 — Publicação do certame licitatório passa a seguir o mesmo gatilho do Contrato social da empresa/instituição contratada: obrigatório quando \"Tipo de contratação (execução)\" = Empresa Contratada (RN-22).",
  "Certame.documentos.", "DocumentoCertame[]", "tabela com anexo, visualização e remoção por linha",
 ),
 "Situações": spec(
  "PSS-CERT-FRM-TAB-005", "Situações do Certame", "Histórico de situações do certame e registro de uma nova situação.",
  "RN-15 (nove situações, prazo de 48h) e RN-16 (homologação é o marco do prazo, distinto da publicação do resultado). "
  + "RN-24 — guardas de transição de estado: (a) Retificação de Edital exige registro de Aberto no histórico (ER142); (b) Homologado não pode ser registrado enquanto a última Homologação não tiver sido seguida de Cancelamento/Anulação (ER144); (c) Retificação de Homologação exige um Homologado prévio no histórico (ER145); (d) a data de efeito não pode ser anterior à publicação do edital (mesma lógica de RN-07).",
  "Certame.situacaoAtual, Certame.historicoSituacoes.", "SituacaoHistoricoCertame[]", "linha do tempo + formulário", "Disponível apenas para certames já salvos.",
 ),
};

export const certameFormBlockSpecifications = {
 seletorTipo: spec("PSS-CERT-FRM-BLC-004", "Seleção do tipo de certame (etapa 1)", "Exigir a escolha entre Concurso Público e Processo Seletivo antes de exibir os demais campos do cadastro.", "RN-06.1 e Cenário 1 — a definição do tipo é a primeira etapa do fluxo; os campos subsequentes só aparecem após a escolha.", "Certame.tipoCertame.", "TipoCertame", "seletor de duas opções, exibido apenas no cadastro de novo certame"),
 mandanteBloqueado: spec("PSS-CERT-FRM-BLC-001", "Órgão mandante travado após salvar", "Impedir a troca do órgão responsável de um certame já cadastrado.", "RN-05 e Cenário 6 — não é permitido que outro órgão passe a responder pela prestação de contas de um certame que não é seu.", "Certame.setor.", "string", "campo somente leitura após a primeira gravação"),
 fasesFixas: spec("PSS-CERT-FRM-BLC-003", "Fases do certame", "Bloco (com subtítulo) dentro da aba Identificação e Cronograma, logo após Datas e execução, com a lista de fases do certame, iniciada com o catálogo padrão do TCE-MT.", "RN-09 — o usuário pode reordenar (arrastar e soltar pelo mouse), editar nome e datas de início/fim, remover e adicionar novas fases.", "Certame.fases.", "FaseCertame[]", "lista editável em linha, com reordenação por arraste"),
 quadroVagasVinculado: spec("PSS-CERT-FRM-BLC-005", "Quadro de Vagas vinculado ao cargo", "Buscar e exibir o Quadro de Vagas (código e versão) vinculado automaticamente ao cargo selecionado ou digitado.", "RN-17 — vínculo automático, somente leitura, sem escolha manual; garante rastreabilidade Edital → Quadro de Vagas → Gestão de Ingresso. Vínculo em Controle de Vagas > Quadro Autorizado.", "CARGOS_CADASTRADOS (quadroCodigo/quadroVersao) e CargoVagaCertame.", "string", "campo somente leitura, atualizado ao trocar o cargo/função"),
} satisfies Record<string, SpecificationMetadata>;

export const certameFormActionSpecifications: Record<string, SpecificationMetadata> = {
 "Salvar certame": spec("PSS-CERT-FRM-ACT-001", "Salvar certame", "Gravar o certame no controlePssStore.", "Cenário 1 — o certame criado é salvo com status 'Aberto' (RN-15) e disponibilizado para vínculo futuro de candidatos. RN-23 — bloqueia com \"Já existe um certame aberto com esse número e tipo. Verifique.\" quando o Número do certame já está em uso pelo mesmo Tipo e Ano do concurso; a mensagem de erro (cargo/vaga ausente, documento pendente ou duplicidade) rola e destaca o bloco correspondente dentro da aba consolidada.", "Formulário completo.", "Certame", "botão de submit"),
 "Adicionar cota": spec("PSS-CERT-FRM-ACT-002", "Adicionar cota", "Incluir uma linha na sub-grade de cotas.", "RN-08.", "Formulário de inclusão de cota.", "CotaCertame", "botão + sub-grade"),
 "Adicionar cargo/vaga": spec("PSS-CERT-FRM-ACT-003", "Adicionar cargo/vaga", "Incluir uma linha na sub-grade de cargos/vagas.", "RN-10, RN-14.", "Formulário de inclusão de cargo.", "CargoVagaCertame", "botão + sub-grade"),
 "Registrar situação": spec("PSS-CERT-FRM-ACT-004", "Registrar nova situação", "Registrar uma mudança de situação do certame e calcular o prazo de prestação de contas.", "RN-15, RN-16, RN-24a/b/c/d e Cenário 7.", "SituacaoHistoricoCertame.", "SituacaoHistoricoCertame", "formulário + linha do tempo"),
};

export const certameFormBusinessItems = [...Object.values(certameFormTabSpecifications), ...Object.values(certameFormBlockSpecifications), ...Object.values(certameFormActionSpecifications)];
