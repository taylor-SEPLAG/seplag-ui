import type { CandidatoPss, ConvocacaoPss, EventoTemporalPss, ProcessoPss, PublicacaoPss, VagaProcessoPss } from "./types";

const dataIso=(valor:string)=>{if(/^\d{4}-\d{2}-\d{2}/.test(valor))return valor.slice(0,10);const p=valor.slice(0,10).split("/");return p.length===3?`${p[2]}-${p[1]}-${p[0]}`:valor};

/** Trilha de auditoria unificada do Controle PSS, equivalente ao historicoTemporal do Controle de Vagas. */
export function construirHistoricoTemporalPss(dados:{processos:readonly ProcessoPss[];vagas:readonly VagaProcessoPss[];candidatos:readonly CandidatoPss[];convocacoes:readonly ConvocacaoPss[];publicacoes:readonly PublicacaoPss[]}):EventoTemporalPss[]{
 const eventos:EventoTemporalPss[]=[];
 dados.processos.forEach((processo)=>{
  processo.historico.forEach((item)=>eventos.push({id:`TPS-${item.id}`,dominio:"PROCESSO",entidadeId:processo.id,processoId:processo.id,dataEfeito:dataIso(item.dataEfeito),registradoEm:item.ocorridoEm,tipo:item.tipo,descricao:`${item.titulo}: ${item.descricao}`,origem:item.origem}));
  processo.etapas.forEach((etapa)=>{
   if(etapa.situacao==="CONCLUIDA"&&etapa.dataConclusao)eventos.push({id:`TPS-${etapa.id}-C`,dominio:"ETAPA",entidadeId:etapa.id,processoId:processo.id,dataEfeito:dataIso(etapa.dataConclusao),registradoEm:etapa.dataConclusao,tipo:"ETAPA_CONCLUIDA",descricao:`${etapa.nome} concluída.`,origem:etapa.sistema});
   if(etapa.situacao==="EM_ANDAMENTO")eventos.push({id:`TPS-${etapa.id}-A`,dominio:"ETAPA",entidadeId:etapa.id,processoId:processo.id,dataEfeito:dataIso(etapa.dataPrevista),registradoEm:etapa.dataPrevista,tipo:"ETAPA_EM_ANDAMENTO",descricao:`${etapa.nome} em andamento sob responsabilidade de ${etapa.responsavel}.`,origem:etapa.sistema});
   if(etapa.situacao==="BLOQUEADA")eventos.push({id:`TPS-${etapa.id}-B`,dominio:"ETAPA",entidadeId:etapa.id,processoId:processo.id,dataEfeito:dataIso(etapa.dataPrevista),registradoEm:etapa.dataPrevista,tipo:"ETAPA_BLOQUEADA",descricao:`${etapa.nome} bloqueada: ${etapa.pendencias[0]??"pendência não detalhada"}`,origem:etapa.sistema});
  });
 });
 dados.vagas.forEach((vaga)=>eventos.push({id:`TPS-${vaga.id}`,dominio:"VAGA_PROCESSO",entidadeId:vaga.id,processoId:vaga.processoId,dataEfeito:dataIso(vaga.cadastradaEm),registradoEm:vaga.cadastradaEm,tipo:vaga.validadaContraSies?"VAGA_VALIDADA_SIES":"VAGA_SEM_VALIDACAO_SIES",descricao:`${vaga.cargo} — ${vaga.vagasImediatas} vagas imediatas e ${vaga.cadastroReserva} em cadastro de reserva.`,origem:"Vagas do Processo"}));
 dados.candidatos.filter((item)=>item.convocadoEm).forEach((candidato)=>eventos.push({id:`TPS-${candidato.id}`,dominio:"CANDIDATO",entidadeId:candidato.id,processoId:candidato.processoId,dataEfeito:dataIso(candidato.convocadoEm!),registradoEm:candidato.convocadoEm!,tipo:candidato.situacao,descricao:`${candidato.nome} — ${candidato.cargo}, classificação ${candidato.classificacao}.`,origem:"Cadastro Reserva"}));
 dados.convocacoes.forEach((convocacao)=>eventos.push({id:`TPS-${convocacao.id}`,dominio:"CONVOCACAO",entidadeId:convocacao.id,processoId:convocacao.processoId,dataEfeito:dataIso(convocacao.dataConvocacao),registradoEm:convocacao.dataConvocacao,tipo:`CONVOCACAO_${convocacao.situacao}`,descricao:`${convocacao.numero} — ${convocacao.quantidadeConvocados} convocados, prazo até ${convocacao.prazoApresentacao}.`,origem:convocacao.formaGeracao==="MANUAL"?"Trâmite manual":"SIES"}));
 dados.publicacoes.filter((item)=>item.dataPublicacao).forEach((publicacao)=>eventos.push({id:`TPS-${publicacao.id}`,dominio:"PUBLICACAO",entidadeId:publicacao.id,processoId:publicacao.processoId,dataEfeito:dataIso(publicacao.dataPublicacao!),registradoEm:publicacao.dataPublicacao!,tipo:publicacao.tipo,descricao:`${publicacao.titulo} (${publicacao.veiculo.replaceAll("_"," ").toLowerCase()}).`,origem:publicacao.geracaoManual?"Documento manual":"Sistêmico"}));
 return eventos.sort((a,b)=>a.dataEfeito.localeCompare(b.dataEfeito)||a.registradoEm.localeCompare(b.registradoEm));
}

export const eventosPssAte=(eventos:readonly EventoTemporalPss[],data:string)=>eventos.filter((item)=>item.dataEfeito<=data);
export const eventosDoProcesso=(eventos:readonly EventoTemporalPss[],processoId:string)=>eventos.filter((item)=>item.processoId===processoId);
