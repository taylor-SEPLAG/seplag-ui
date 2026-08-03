import type { AutomacaoEtapaPss, DefinicaoEtapaPss, EtapaFluxoPss, EtapaProcessoPss, FasePss, ModalidadeExecucaoPss, ProcessoPss, SituacaoEtapaPss } from "./types";

export const fasesPss:readonly FasePss[]=["DOCUMENTAL","SIES","SIGEP"];
export const faseLabel:Record<FasePss,string>={DOCUMENTAL:"Fase 1 — Documental (Sigadoc)",SIES:"Fase 2 — Gestão do concurso (SIES)",SIGEP:"Fase 3 — Controle de pessoas (SIGEP)"};
export const faseLabelCurto:Record<FasePss,string>={DOCUMENTAL:"Documental",SIES:"SIES",SIGEP:"SIGEP"};
export const situacaoEtapaLabel:Record<SituacaoEtapaPss,string>={PENDENTE:"Pendente",EM_ANDAMENTO:"Em andamento",CONCLUIDA:"Concluída",BLOQUEADA:"Bloqueada"};
export const automacaoLabel:Record<AutomacaoEtapaPss,string>={AUTOMATIZADA:"Automatizada",MANUAL:"Manual",PARCIAL:"Parcial"};
export const automacaoIcone:Record<AutomacaoEtapaPss,string>={AUTOMATIZADA:"pi pi-check-circle",MANUAL:"pi pi-exclamation-triangle",PARCIAL:"pi pi-clock"};

export const definicoesEtapasPss:readonly DefinicaoEtapaPss[]=[
 {etapa:"JUSTIFICATIVA_TECNICA",ordem:1,nome:"Justificativa técnica da necessidade",fase:"DOCUMENTAL",sistema:"SIGADOC",descricao:"Órgão solicitante formaliza a necessidade de pessoal e abre o processo administrativo no Sigadoc.",automacaoPadrao:"MANUAL",responsavelPadrao:"Órgão solicitante",telaDestino:"processos",rotuloDestino:"Processos Seletivos",foraEscopoEmpresaContratada:false},
 {etapa:"ANALISE_SECRETARIAS",ordem:2,nome:"Análise das secretarias envolvidas",fase:"DOCUMENTAL",sistema:"SIGADOC",descricao:"SEPLAG e demais secretarias analisam mérito, quantitativo e adequação do pedido antes da autorização.",automacaoPadrao:"MANUAL",responsavelPadrao:"SEPLAG — Secretaria Adjunta de Gestão de Pessoas",telaDestino:"processos",rotuloDestino:"Processos Seletivos",foraEscopoEmpresaContratada:false},
 {etapa:"RESERVA_ORCAMENTARIA",ordem:3,nome:"Reserva orçamentária e impacto financeiro",fase:"DOCUMENTAL",sistema:"EXTERNO",descricao:"SEFAZ confirma a disponibilidade orçamentária e o impacto da despesa de pessoal (LRF).",automacaoPadrao:"PARCIAL",responsavelPadrao:"SEFAZ / SEPLAN",telaDestino:"processos",rotuloDestino:"Processos Seletivos",foraEscopoEmpresaContratada:false},
 {etapa:"PUBLICACAO_EDITAL",ordem:4,nome:"Publicação do edital de abertura",fase:"DOCUMENTAL",sistema:"IOMAT",descricao:"Edital de abertura é redigido fora do sistema e encaminhado à IOMAT para publicação no Diário Oficial.",automacaoPadrao:"MANUAL",responsavelPadrao:"Comissão do certame",telaDestino:"integracao-sies",rotuloDestino:"Integração SIES",foraEscopoEmpresaContratada:false},
 {etapa:"CADASTRO_SIES",ordem:5,nome:"Cadastro do concurso no SIES",fase:"SIES",sistema:"SIES",descricao:"Registro do certame, dos cargos e do quantitativo de vagas no sistema de gestão do concurso.",automacaoPadrao:"AUTOMATIZADA",responsavelPadrao:"SEPLAG — Coordenadoria de Concursos",telaDestino:"vagas",rotuloDestino:"Controle de Vagas",foraEscopoEmpresaContratada:true},
 {etapa:"CADASTRO_RESERVA",ordem:6,nome:"Cadastro de reserva",fase:"SIES",sistema:"SIES",descricao:"Formação do cadastro de reserva a partir da classificação, separando vagas imediatas de expectativa de direito.",automacaoPadrao:"AUTOMATIZADA",responsavelPadrao:"SEPLAG — Coordenadoria de Concursos",telaDestino:"integracao-sies",rotuloDestino:"Integração SIES",foraEscopoEmpresaContratada:true},
 {etapa:"CONVOCACAO",ordem:7,nome:"Convocação dos candidatos",fase:"SIES",sistema:"SIES",descricao:"Geração das listas de convocação por ordem de classificação. Hoje o documento é montado manualmente.",automacaoPadrao:"MANUAL",responsavelPadrao:"SEPLAG — Coordenadoria de Concursos",telaDestino:"integracao-sies",rotuloDestino:"Integração SIES",foraEscopoEmpresaContratada:true},
 {etapa:"PUBLICACOES",ordem:8,nome:"Publicações de listagens",fase:"SIES",sistema:"SIES",descricao:"Listas de deferidos, indeferidos, aprovados e reprovados exportadas em Word e publicadas no Diário Oficial.",automacaoPadrao:"MANUAL",responsavelPadrao:"Comissão do certame",telaDestino:"integracao-sies",rotuloDestino:"Integração SIES",foraEscopoEmpresaContratada:true},
 {etapa:"CADASTRO_EDITAL_SIGEP",ordem:9,nome:"Cadastro do edital no SIGEP",fase:"SIGEP",sistema:"SIGEP",descricao:"Vinculação do edital ao módulo de gestão de pessoas para dar origem aos ingressos.",automacaoPadrao:"AUTOMATIZADA",responsavelPadrao:"SEPLAG — Gestão de Pessoas",telaDestino:"processos",rotuloDestino:"Processos Seletivos",foraEscopoEmpresaContratada:false},
 {etapa:"CONTROLE_VAGAS_SIGEP",ordem:10,nome:"Controle de vagas do edital",fase:"SIGEP",sistema:"SIGEP",descricao:"Conciliação entre as vagas do certame e o quadro autorizado, incluindo validação do cargo e do CBO.",automacaoPadrao:"PARCIAL",responsavelPadrao:"SEPLAG — Controle de Vagas",telaDestino:"vagas",rotuloDestino:"Controle de Vagas",foraEscopoEmpresaContratada:false},
 {etapa:"INSCRICOES",ordem:11,nome:"Inscrições e homologação das inscrições",fase:"SIGEP",sistema:"SIGEP",descricao:"Recebimento das inscrições, análise documental e deferimento por cargo.",automacaoPadrao:"AUTOMATIZADA",responsavelPadrao:"Comissão do certame",telaDestino:"integracao-sies",rotuloDestino:"Integração SIES",foraEscopoEmpresaContratada:false},
 {etapa:"PROVAS_CLASSIFICACAO",ordem:12,nome:"Provas e classificação",fase:"SIGEP",sistema:"SIGEP",descricao:"Aplicação das provas, apuração das notas e ordenação classificatória por cargo e cota.",automacaoPadrao:"PARCIAL",responsavelPadrao:"Banca examinadora",telaDestino:"integracao-sies",rotuloDestino:"Integração SIES",foraEscopoEmpresaContratada:false},
 {etapa:"HOMOLOGACAO",ordem:13,nome:"Homologação do resultado final",fase:"SIGEP",sistema:"SIGEP",descricao:"Publicação do resultado final homologado e remessa das informações aos órgãos de controle.",automacaoPadrao:"MANUAL",responsavelPadrao:"Secretário de Estado",telaDestino:"integracao-sies",rotuloDestino:"Integração SIES",foraEscopoEmpresaContratada:false},
];

export const definicaoEtapa=(etapa:EtapaFluxoPss)=>definicoesEtapasPss.find((item)=>item.etapa===etapa)!;
export const rotuloEtapaPss=(etapa:EtapaFluxoPss)=>definicaoEtapa(etapa).nome;
export const faseDaEtapa=(etapa:EtapaFluxoPss)=>definicaoEtapa(etapa).fase;

export interface AjusteEtapaPss { readonly etapa:EtapaFluxoPss; readonly situacao?:SituacaoEtapaPss; readonly automacao?:AutomacaoEtapaPss; readonly responsavel?:string; readonly dataPrevista?:string; readonly dataConclusao?:string; readonly observacao?:string; readonly pendencias?:readonly string[]; }
export interface OpcoesGeracaoEtapas { readonly processoId:string; readonly etapaAtual:EtapaFluxoPss; readonly modalidadeExecucao:ModalidadeExecucaoPss; readonly dataAbertura:string; readonly ajustes?:readonly AjusteEtapaPss[]; }

const somarDias=(data:string,dias:number)=>{const base=new Date(`${data}T00:00:00`);base.setDate(base.getDate()+dias);return base.toISOString().slice(0,10)};

/** Gera a esteira padrão de etapas de um processo PSS, equivalente ao gerarVagasDoQuadro do Controle de Vagas. */
export const gerarEtapasDoProcesso=(opcoes:OpcoesGeracaoEtapas):EtapaProcessoPss[]=>{
 const ordemAtual=definicaoEtapa(opcoes.etapaAtual).ordem;
 return definicoesEtapasPss.map((definicao)=>{
  const ajuste=opcoes.ajustes?.find((item)=>item.etapa===definicao.etapa);
  const foraEscopoSistemico=opcoes.modalidadeExecucao==="EMPRESA_CONTRATADA"&&definicao.foraEscopoEmpresaContratada;
  const situacaoPadrao:SituacaoEtapaPss=definicao.ordem<ordemAtual?"CONCLUIDA":definicao.ordem===ordemAtual?"EM_ANDAMENTO":"PENDENTE";
  const situacao=ajuste?.situacao??situacaoPadrao;
  const automacao=ajuste?.automacao??(foraEscopoSistemico?"MANUAL":definicao.automacaoPadrao);
  const dataPrevista=ajuste?.dataPrevista??somarDias(opcoes.dataAbertura,definicao.ordem*21);
  const dataConclusao=ajuste?.dataConclusao??(situacao==="CONCLUIDA"?somarDias(opcoes.dataAbertura,definicao.ordem*21-4):undefined);
  const pendenciasPadrao=foraEscopoSistemico?["Etapa fora do escopo sistêmico: execução delegada à empresa contratada."]:automacao==="MANUAL"?["Trâmite realizado fora do sistema, sem rastreabilidade automática."]:[];
  return {
   id:`ETP-${opcoes.processoId}-${String(definicao.ordem).padStart(2,"0")}`,
   processoId:opcoes.processoId,
   etapa:definicao.etapa,
   ordem:definicao.ordem,
   nome:definicao.nome,
   fase:definicao.fase,
   sistema:definicao.sistema,
   descricao:definicao.descricao,
   situacao,
   automacao,
   responsavel:ajuste?.responsavel??definicao.responsavelPadrao,
   dataPrevista,
   dataConclusao,
   observacao:ajuste?.observacao,
   pendencias:ajuste?.pendencias??pendenciasPadrao,
   telaDestino:definicao.telaDestino,
   rotuloDestino:definicao.rotuloDestino,
   foraEscopoSistemico,
  } satisfies EtapaProcessoPss;
 });
};

export const etapasPorFase=(etapas:readonly EtapaProcessoPss[])=>fasesPss.map((fase)=>({fase,etapas:etapas.filter((item)=>item.fase===fase)}));
export const progressoProcesso=(processo:ProcessoPss)=>{const total=processo.etapas.length;const concluidas=processo.etapas.filter((item)=>item.situacao==="CONCLUIDA").length;return {total,concluidas,percentual:total?Math.round(concluidas/total*100):0}};
export const etapaEmAndamento=(processo:ProcessoPss)=>processo.etapas.find((item)=>item.situacao==="EM_ANDAMENTO")??processo.etapas.find((item)=>item.situacao==="BLOQUEADA")??processo.etapas.find((item)=>item.situacao==="PENDENTE");
export const etapasManuais=(processo:ProcessoPss)=>processo.etapas.filter((item)=>item.automacao!=="AUTOMATIZADA"&&item.situacao!=="CONCLUIDA");
export const etapasBloqueadas=(processo:ProcessoPss)=>processo.etapas.filter((item)=>item.situacao==="BLOQUEADA");
