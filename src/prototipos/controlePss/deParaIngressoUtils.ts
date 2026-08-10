import { CONTROLE_PSS_DATA_REFERENCIA } from "./constants";
import type { CampoDeParaPss, CandidatoPss, ConvocacaoPss, IngressoServidorPss, ProcessoPss, RegistroDeParaPss, SituacaoCandidatoPss, SituacaoCargaDePara, SituacaoIngressoPss, SituacaoProcessoPss, StatusGeralPss, VagaProcessoPss } from "./types";

/** Tabela de-para da seção 7 do RF-001 — Integração SIES ↔ SIGEP. */
export const camposDeParaPss:readonly CampoDeParaPss[]=[
 {id:"DEP-01",campoSies:"CPF do candidato",campoSigep:"CPF do servidor",observacao:"Chave de identificação única entre os dois sistemas; é o campo que evita a dupla digitação do cadastro."},
 {id:"DEP-02",campoSies:"Cargo/perfil do edital",campoSigep:"Cargo/perfil no SIGEP",observacao:"Depende da correspondência 1:1 entre o cargo do certame e o cargo do quadro autorizado."},
 {id:"DEP-03",campoSies:"Local/cidade da vaga",campoSigep:"Lotação pretendida",observacao:"O local da vaga do edital determina a lotação de destino do servidor temporário."},
 {id:"DEP-04",campoSies:"Status da inscrição",campoSigep:"Status do candidato",observacao:"Somente inscrição deferida e classificada habilita o candidato ao ingresso."},
 {id:"DEP-05",campoSies:"Status da convocação",campoSigep:"Status de ingresso",observacao:"Hoje a convocação não é dado estruturado no SIES; enquanto não for, o ingresso depende de contingência manual (RN07)."},
];

export const statusGeralLabel:Record<StatusGeralPss,string>={ABERTO:"Aberto",EM_ANDAMENTO:"Em andamento",FECHADO:"Fechado"};
export const statusGeralClasse:Record<StatusGeralPss,string>={ABERTO:"sies",EM_ANDAMENTO:"em_andamento",FECHADO:"concluida"};
export const situacaoCargaLabel:Record<SituacaoCargaDePara,string>={CARREGADO:"Carregado",PENDENTE_CONVOCACAO_SIES:"Pendente de convocação no SIES",PENDENTE_VALIDACAO_DOCUMENTAL:"Pendente de validação documental"};
export const situacaoCargaClasse:Record<SituacaoCargaDePara,string>={CARREGADO:"concluida",PENDENTE_CONVOCACAO_SIES:"divergente",PENDENTE_VALIDACAO_DOCUMENTAL:"em_andamento"};
export const situacaoIngressoLabel:Record<SituacaoIngressoPss,string>={PENDENTE:"Ingresso pendente",EFETIVADO:"Ingresso efetivado",BLOQUEADO:"Ingresso bloqueado"};
export const situacaoIngressoClasse:Record<SituacaoIngressoPss,string>={PENDENTE:"em_andamento",EFETIVADO:"concluida",BLOQUEADO:"bloqueada"};

/** RN04 — status geral do processo em três estados, derivado da situação já registrada; não substitui SituacaoProcessoPss. */
export const statusGeralDoProcesso=(situacao:SituacaoProcessoPss):StatusGeralPss=>situacao==="EM_ELABORACAO"?"ABERTO":situacao==="HOMOLOGADO"||situacao==="ENCERRADO"?"FECHADO":"EM_ANDAMENTO";

const statusInscricaoSiesLabel:Record<SituacaoCandidatoPss,string>={INSCRITO:"Inscrição recebida",DEFERIDO:"Inscrição deferida",INDEFERIDO:"Inscrição indeferida",CLASSIFICADO:"Inscrição deferida e classificada",DESCLASSIFICADO:"Desclassificado",CONVOCADO:"Inscrição deferida e classificada",NOMEADO:"Inscrição deferida e classificada",DESISTENTE:"Desistência formalizada"};
const statusCandidatoSigepLabel:Record<SituacaoCandidatoPss,string>={INSCRITO:"Inscrito",DEFERIDO:"Apto",CLASSIFICADO:"Classificado",INDEFERIDO:"Inapto",DESCLASSIFICADO:"Desclassificado",CONVOCADO:"Convocado",NOMEADO:"Nomeado",DESISTENTE:"Desistente"};
export const candidatoElegivelDePara=(candidato:CandidatoPss)=>candidato.situacao==="CONVOCADO"||candidato.situacao==="NOMEADO";

/**
 * Cenário 1 do RF-001: monta o registro de-para de um candidato convocado/nomeado.
 * Enquanto a convocação for gerada manualmente (dado não estruturado no SIES), a carga fica pendente e o
 * registro nasce marcado como contingência manual (RN07); vaga ainda não validada contra o SIES mantém a
 * carga pendente de validação documental (RN06).
 */
export function gerarRegistroDePara(candidato:CandidatoPss,processo:ProcessoPss,vaga?:VagaProcessoPss,convocacao?:ConvocacaoPss):RegistroDeParaPss{
 const convocacaoEstruturada=Boolean(convocacao&&convocacao.formaGeracao==="AUTOMATICA");
 const validadaContraSies=vaga?vaga.validadaContraSies:!processo.divergenciaSies;
 const situacaoCarga:SituacaoCargaDePara=convocacaoEstruturada?validadaContraSies?"CARREGADO":"PENDENTE_VALIDACAO_DOCUMENTAL":"PENDENTE_CONVOCACAO_SIES";
 return {
  id:`RDP-${candidato.id}`,
  processoId:processo.id,
  processoNumero:processo.numero,
  candidatoId:candidato.id,
  cpf:candidato.cpf,
  cargoEdital:candidato.cargo,
  cargoSigep:vaga?.cargoSiesNome??vaga?.cargo??candidato.cargo,
  localCidade:vaga?.lotacaoPrevista??processo.orgaoSolicitante,
  lotacaoPretendida:vaga?.lotacaoPrevista??"Lotação a definir pelo órgão de destino",
  statusInscricaoSies:statusInscricaoSiesLabel[candidato.situacao],
  statusCandidatoSigep:statusCandidatoSigepLabel[candidato.situacao],
  statusConvocacaoSies:convocacaoEstruturada?`${convocacao!.numero} — ${convocacao!.situacao.toLowerCase()}`:undefined,
  statusIngressoSigep:candidato.situacao==="NOMEADO"?"Apto ao ingresso":"Aguardando confirmação da convocação",
  situacaoCarga,
  contingenciaManual:!convocacaoEstruturada,
  carregadoEm:CONTROLE_PSS_DATA_REFERENCIA,
  responsavel:processo.responsavel,
 } satisfies RegistroDeParaPss;
}

/** RN06 — o ingresso só é efetivado com convocação confirmada no SIES e validação documental concluída. */
export const podeEfetivarIngresso=(registro:RegistroDeParaPss):boolean=>registro.situacaoCarga==="CARREGADO"&&!registro.contingenciaManual&&Boolean(registro.statusConvocacaoSies);

export const registroDoCandidato=(registros:readonly RegistroDeParaPss[],candidatoId:string)=>registros.find((item)=>item.candidatoId===candidatoId);
export const ingressoDoCandidato=(ingressos:readonly IngressoServidorPss[],candidatoId:string)=>ingressos.find((item)=>item.candidatoId===candidatoId);
export const registrosEmContingencia=(registros:readonly RegistroDeParaPss[])=>registros.filter((item)=>item.contingenciaManual);

export interface ResumoSecretariaPss { readonly orgao:string; readonly processos:readonly string[]; readonly lotacoes:readonly string[]; readonly vagasImediatas:number; readonly cadastroReserva:number; readonly totalVagas:number; readonly temporariosOcupando:number; readonly vagasDisponiveis:number; }

/** RN05 / Cenário 3 do RF-001 — painel de vagas por secretaria: temporários ocupando, vagas disponíveis e lotações de destino. */
export function construirResumoPorSecretaria(vagas:readonly VagaProcessoPss[],ingressos:readonly IngressoServidorPss[],processos:readonly ProcessoPss[]):ResumoSecretariaPss[]{
 const mapa=new Map<string,{orgao:string;processos:Set<string>;lotacoes:Set<string>;vagasImediatas:number;cadastroReserva:number;vagaIds:Set<string>}>();
 vagas.forEach((vaga)=>{
  const atual=mapa.get(vaga.orgaoDestino)??{orgao:vaga.orgaoDestino,processos:new Set<string>(),lotacoes:new Set<string>(),vagasImediatas:0,cadastroReserva:0,vagaIds:new Set<string>()};
  atual.processos.add(processos.find((item)=>item.id===vaga.processoId)?.numero??vaga.processoId);
  atual.lotacoes.add(vaga.lotacaoPrevista);
  atual.vagasImediatas+=vaga.vagasImediatas;
  atual.cadastroReserva+=vaga.cadastroReserva;
  atual.vagaIds.add(vaga.id);
  mapa.set(vaga.orgaoDestino,atual);
 });
 return [...mapa.values()].map((item)=>{
  const totalVagas=item.vagasImediatas+item.cadastroReserva;
  const temporariosOcupando=ingressos.filter((ingresso)=>ingresso.situacao==="EFETIVADO"&&(item.vagaIds.has(ingresso.vagaProcessoId)||ingresso.orgao===item.orgao)).length;
  return {orgao:item.orgao,processos:[...item.processos].sort(),lotacoes:[...item.lotacoes].sort(),vagasImediatas:item.vagasImediatas,cadastroReserva:item.cadastroReserva,totalVagas,temporariosOcupando,vagasDisponiveis:Math.max(totalVagas-temporariosOcupando,0)} satisfies ResumoSecretariaPss;
 }).sort((a,b)=>a.orgao.localeCompare(b.orgao));
}
