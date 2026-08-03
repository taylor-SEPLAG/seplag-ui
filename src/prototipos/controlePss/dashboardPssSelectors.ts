import type { ControlePssState } from "./controlePssStore";
import { calcularDivergenciasSies } from "./divergenciaSiesUtils";
import { etapasBloqueadas, etapasManuais, faseDaEtapa, progressoProcesso, rotuloEtapaPss } from "./fluxoPssUtils";
import type { DivergenciaSiesPss, FasePss, GrupoProcessoDashboardPss, ProcessoPss, ResumoDashboardPss, SituacaoProcessoPss, TipoProcessoPss } from "./types";

export interface DashboardPssFiltros {
 dataReferencia:string; orgaoSolicitante:string; fase:string; tipo:string; modalidadeExecucao:string;
 situacao:string; somenteDivergencias:boolean; somentePendenciasManuais:boolean;
}

export const situacaoProcessoLabel:Record<SituacaoProcessoPss,string>={EM_ELABORACAO:"Em elaboração",EM_ANDAMENTO:"Em andamento",SUSPENSO:"Suspenso",HOMOLOGADO:"Homologado",ENCERRADO:"Encerrado"};
export const tipoProcessoLabel:Record<TipoProcessoPss,string>={CONCURSO:"Concurso público",SELETIVO_SIMPLIFICADO:"Processo seletivo simplificado"};
export const modalidadeExecucaoLabel={PROPRIA:"Execução própria",EMPRESA_CONTRATADA:"Empresa contratada"} as const;
export const situacoesProcessoPss:SituacaoProcessoPss[]=["EM_ELABORACAO","EM_ANDAMENTO","SUSPENSO","HOMOLOGADO","ENCERRADO"];

const iso=(valor:string)=>/^\d{4}-\d{2}-\d{2}/.test(valor)?valor.slice(0,10):valor.slice(0,10).split("/").reverse().join("-");
const ativo=(processo:ProcessoPss)=>processo.situacao==="EM_ELABORACAO"||processo.situacao==="EM_ANDAMENTO";

export function construirDashboardPss(state:ControlePssState,filtros:DashboardPssFiltros){
 const divergencias:DivergenciaSiesPss[]=calcularDivergenciasSies(state.vagas,state.processos,state.cargosSies);
 const idsComDivergencia=new Set(divergencias.map((item)=>item.processoId));
 const processos=state.processos.filter((processo)=>{
  const fase=faseDaEtapa(processo.etapaAtual);
  const manuais=etapasManuais(processo).length;
  return iso(processo.dataAbertura)<=filtros.dataReferencia
   &&(!filtros.orgaoSolicitante||processo.orgaoSolicitante===filtros.orgaoSolicitante)
   &&(!filtros.fase||fase===filtros.fase)
   &&(!filtros.tipo||processo.tipo===filtros.tipo)
   &&(!filtros.modalidadeExecucao||processo.modalidadeExecucao===filtros.modalidadeExecucao)
   &&(!filtros.situacao||processo.situacao===filtros.situacao)
   &&(!filtros.somenteDivergencias||idsComDivergencia.has(processo.id)||processo.divergenciaSies)
   &&(!filtros.somentePendenciasManuais||manuais>0);
 });
 const grupos:GrupoProcessoDashboardPss[]=processos.map((processo)=>{
  const progresso=progressoProcesso(processo);
  const pendenciasManuais=etapasManuais(processo).length;
  const bloqueadas=etapasBloqueadas(processo).length;
  const quantidadeDivergencias=divergencias.filter((item)=>item.processoId===processo.id).length;
  const prioridade:GrupoProcessoDashboardPss["prioridade"]=quantidadeDivergencias?"DIVERGENTE":bloqueadas?"CRITICA":pendenciasManuais>=3?"ATENCAO":"REGULAR";
  return {chave:processo.id,processo,faseAtual:faseDaEtapa(processo.etapaAtual),etapaAtualNome:rotuloEtapaPss(processo.etapaAtual),concluidas:progresso.concluidas,totalEtapas:progresso.total,percentual:progresso.percentual,pendenciasManuais,divergencias:quantidadeDivergencias,prioridade};
 });
 const ordem:Record<GrupoProcessoDashboardPss["prioridade"],number>={DIVERGENTE:0,CRITICA:1,ATENCAO:2,REGULAR:3};
 grupos.sort((a,b)=>ordem[a.prioridade]-ordem[b.prioridade]||b.percentual-a.percentual);
 const porFase=(fase:FasePss)=>grupos.filter((grupo)=>ativo(grupo.processo)&&grupo.faseAtual===fase).length;
 const idsFiltrados=new Set(processos.map((item)=>item.id));
 const publicacoesPendentes=state.publicacoes.filter((item)=>idsFiltrados.has(item.processoId)&&item.situacao!=="PUBLICADA").length;
 const convocacoesPendentes=state.convocacoes.filter((item)=>idsFiltrados.has(item.processoId)&&item.situacao==="PENDENTE").length;
 const resumo:ResumoDashboardPss={
  processos:grupos.length,
  ativos:grupos.filter((grupo)=>ativo(grupo.processo)).length,
  documental:porFase("DOCUMENTAL"),
  sies:porFase("SIES"),
  sigep:porFase("SIGEP"),
  homologados:grupos.filter((grupo)=>grupo.processo.situacao==="HOMOLOGADO").length,
  comPendenciaManual:grupos.filter((grupo)=>grupo.pendenciasManuais>0).length,
  comDivergenciaSies:grupos.filter((grupo)=>grupo.divergencias>0).length,
  publicacoesPendentes,
  convocacoesPendentes,
  vagasImediatas:grupos.reduce((total,grupo)=>total+grupo.processo.vagasImediatas,0),
  cadastroReserva:grupos.reduce((total,grupo)=>total+grupo.processo.vagasCadastroReserva,0),
  empresaContratada:grupos.filter((grupo)=>grupo.processo.modalidadeExecucao==="EMPRESA_CONTRATADA").length,
  etapasBloqueadas:grupos.reduce((total,grupo)=>total+etapasBloqueadas(grupo.processo).length,0),
 };
 return {grupos,processos,divergencias:divergencias.filter((item)=>idsFiltrados.has(item.processoId)),resumo};
}

export const orgaosDosProcessos=(processos:readonly ProcessoPss[])=>[...new Set(processos.map((item)=>item.orgaoSolicitante))].sort();
export const cargosDosProcessos=(processos:readonly ProcessoPss[])=>[...new Set(processos.flatMap((item)=>item.cargos))].sort();
