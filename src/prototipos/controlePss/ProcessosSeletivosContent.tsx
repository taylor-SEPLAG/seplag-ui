import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE } from "./constants";
import { useControlePssStore } from "./controlePssStore";
import { modalidadeExecucaoLabel, situacaoProcessoLabel, tipoProcessoLabel } from "./dashboardPssSelectors";
import { statusGeralClasse, statusGeralDoProcesso, statusGeralLabel } from "./deParaIngressoUtils";
import { automacaoIcone, automacaoLabel, etapasPorFase, faseDaEtapa, faseLabel, faseLabelCurto, fasesPss, progressoProcesso, situacaoEtapaLabel } from "./fluxoPssUtils";
import type { EtapaProcessoPss, ProcessoPss, SituacaoEtapaPss } from "./types";
import { SpecArea, SpecificationMode } from "../shared/visualizationModes";
import { processosActionSpecifications, processosBlockSpecifications, processosBusinessItems, processosFilterSpecifications, processosScreenSpecification } from "./ProcessosSeletivosSpecifications";
import "./controlePssBase.css";
import "./processosSeletivos.css";

const iconeSituacao:Record<SituacaoEtapaPss,string>={PENDENTE:"pi pi-circle",EM_ANDAMENTO:"pi pi-spin pi-hourglass",CONCLUIDA:"pi pi-check",BLOQUEADA:"pi pi-lock"};
const normalizar=(valor:string)=>valor.normalize("NFD").replace(/[̀-ͯ]/g,"").toLocaleLowerCase("pt-BR");

export function ProcessosSeletivosContent(){
 const {processos}=useControlePssStore();
 const navigate=useNavigate();
 const {id}=useParams<{id?:string}>();
 const [busca,setBusca]=useState("");
 const [fase,setFase]=useState("");
 const [expandidas,setExpandidas]=useState<Record<string,boolean>>({});

 const lista=useMemo(()=>{
  const termo=normalizar(busca.trim());
  return processos.filter((processo)=>(!termo||normalizar(`${processo.numero} ${processo.edital} ${processo.orgaoSolicitante}`).includes(termo))&&(!fase||faseDaEtapa(processo.etapaAtual)===fase));
 },[processos,busca,fase]);
 const selecionado=processos.find((processo)=>processo.id===id);
 const etapaAtualId=selecionado?.etapas.find((etapa)=>etapa.situacao==="EM_ANDAMENTO"||etapa.situacao==="BLOQUEADA")?.id;
 const estaExpandida=(etapa:EtapaProcessoPss)=>expandidas[etapa.id]??etapa.id===etapaAtualId;
 const alternar=(etapa:EtapaProcessoPss)=>setExpandidas((atuais)=>({...atuais,[etapa.id]:!estaExpandida(etapa)}));

 return <SpecificationMode screen={processosScreenSpecification} businessItems={processosBusinessItems}><div className="prototype-pss-page">
  <header className="prototype-pss-header"><div><span>Controle PSS</span><h1>Processos Seletivos</h1><p>Processos recebidos do SIES e acompanhados pelo SIGEP, do protocolo no Sigadoc à homologação do resultado final.</p></div><div className="prototype-pss-header-actions"><button onClick={()=>navigate(`${BASE}/painel`)}><i className="pi pi-chart-bar"/> Painel Geral</button></div></header>

  <SpecArea metadata={processosBlockSpecifications.aviso}><div className="prototype-pss-notice" role="status"><i className="pi pi-info-circle"/><div><strong>Consulta somente leitura.</strong><span>O cadastro do processo seletivo é feito no SIES — e a fase documental no Sigadoc. O SIGEP recebe esses dados pela integração de-para e acompanha o andamento das etapas.</span></div></div></SpecArea>

  <section className="prototype-pss-filters">
   <SpecArea metadata={processosFilterSpecifications["Pesquisar processo"]}><label><span>Pesquisar</span><input value={busca} onChange={(event)=>setBusca(event.target.value)} placeholder="Número, edital ou órgão"/></label></SpecArea>
   <SpecArea metadata={processosFilterSpecifications["Fase do fluxo"]}><label><span>Fase do fluxo</span><select value={fase} onChange={(event)=>setFase(event.target.value)}><option value="">Todas as fases</option>{fasesPss.map((item)=><option key={item} value={item}>{faseLabel[item]}</option>)}</select></label></SpecArea>
  </section>

  <SpecArea metadata={processosBlockSpecifications.lista}><section className="prototype-pss-card">
   <header><div><h2>Processos controlados</h2><p>{lista.length} de {processos.length} processos</p></div></header>
   <div className="prototype-pss-table"><table>
    <thead><tr><th>Processo</th><th>Órgão</th><th>Tipo</th><th>Status geral</th><th>Fase</th></tr></thead>
    <tbody>{lista.map((processo)=><tr key={processo.id} className={processo.id===selecionado?.id?"is-active":undefined}>
     <td><SpecArea metadata={processosActionSpecifications["Selecionar processo"]}><button className="prototype-pss-link" onClick={()=>navigate(`${BASE}/processos/${processo.id}`)}>{processo.numero}</button></SpecArea><small>{processo.edital}</small></td>
     <td>{processo.orgaoSolicitante}</td>
     <td>{tipoProcessoLabel[processo.tipo]}<small>{modalidadeExecucaoLabel[processo.modalidadeExecucao]}</small></td>
     <td><span className={`prototype-pss-badge ${statusGeralClasse[statusGeralDoProcesso(processo.situacao)]}`}>{statusGeralLabel[statusGeralDoProcesso(processo.situacao)]}</span>{processo.divergenciaSies&&<span className="prototype-pss-badge divergente">Divergência</span>}</td>
     <td><span className={`prototype-pss-badge ${faseDaEtapa(processo.etapaAtual).toLowerCase()}`}>{faseLabelCurto[faseDaEtapa(processo.etapaAtual)]}</span></td>
    </tr>)}</tbody>
   </table></div>{lista.length===0&&<p className="prototype-pss-empty">Nenhum processo encontrado.</p>}
  </section></SpecArea>

  {selecionado?<div className="prototype-pss-proc-detail">
   <DetalheCabecalho processo={selecionado} onClose={()=>navigate(`${BASE}/processos`)}/>
   <SpecArea metadata={processosBlockSpecifications.legenda}><div className="prototype-pss-flow-legend">
    <span><i className="pi pi-check"/> Concluída</span><span><i className="pi pi-hourglass"/> Em andamento</span><span><i className="pi pi-circle"/> Pendente</span><span><i className="pi pi-lock"/> Bloqueada</span>
    <span className="prototype-pss-badge automatizada">Automatizada</span><span className="prototype-pss-badge parcial">Parcial</span><span className="prototype-pss-badge manual">Manual</span>
   </div></SpecArea>
   <SpecArea metadata={processosBlockSpecifications.stepper}><div className="prototype-pss-flow-phases">{etapasPorFase(selecionado.etapas).map(({fase:faseItem,etapas})=><section key={faseItem} className="prototype-pss-flow-phase">
    <header><h3>{faseLabel[faseItem]}</h3><small>{etapas.filter((etapa)=>etapa.situacao==="CONCLUIDA").length} de {etapas.length} etapas concluídas</small></header>
    <ol className="prototype-pss-stepper">{etapas.map((etapa)=><EtapaStep key={etapa.id} etapa={etapa} aberta={estaExpandida(etapa)} onToggle={()=>alternar(etapa)} onNavigate={()=>navigate(`${BASE}/${etapa.telaDestino}?processo=${selecionado.id}`)}/>)}</ol>
   </section>)}</div></SpecArea>
   <SpecArea metadata={processosBlockSpecifications.historico}><section className="prototype-pss-card"><header><div><h2>Histórico do processo</h2><p>{selecionado.historico.length} eventos registrados</p></div></header><ol className="prototype-pss-timeline">{[...selecionado.historico].reverse().map((evento,indice)=><li key={evento.id}><i className={indice===0?"active":""}/><div className="date"><strong>{evento.dataEfeito}</strong><small>registrado em {evento.ocorridoEm}</small></div><div className="event"><strong>{evento.titulo}</strong><p>{evento.descricao}</p><small>{evento.origem} • {evento.usuario}{evento.processoSigadoc?` • ${evento.processoSigadoc}`:""}</small></div></li>)}</ol></section></SpecArea>
  </div>:<p className="prototype-pss-empty">Selecione um processo na lista para acompanhar as etapas do fluxo.</p>}
 </div></SpecificationMode>;
}

function DetalheCabecalho({processo,onClose}:{processo:ProcessoPss;onClose:()=>void}){
 const progresso=progressoProcesso(processo);
 return <SpecArea metadata={processosBlockSpecifications.cabecalho}><section className="prototype-pss-flow-summary">
  <header><div><h2>{processo.numero}</h2><p>{processo.edital} • {processo.processoSigadoc}</p><div className="tags"><span className={`prototype-pss-badge ${statusGeralClasse[statusGeralDoProcesso(processo.situacao)]}`}>{statusGeralLabel[statusGeralDoProcesso(processo.situacao)]}</span><span className={`prototype-pss-badge ${faseDaEtapa(processo.etapaAtual).toLowerCase()}`}>{faseLabel[faseDaEtapa(processo.etapaAtual)]}</span><span className="prototype-pss-badge neutral">{situacaoProcessoLabel[processo.situacao]}</span><span className="prototype-pss-badge neutral">{tipoProcessoLabel[processo.tipo]}</span><span className="prototype-pss-badge neutral">{modalidadeExecucaoLabel[processo.modalidadeExecucao]}</span>{processo.divergenciaSies&&<span className="prototype-pss-badge divergente">Divergência SIGEP × SIES</span>}</div></div><SpecArea metadata={processosActionSpecifications["Fechar detalhe"]}><button onClick={onClose}><i className="pi pi-times"/> Fechar detalhe</button></SpecArea></header>
  <div className="prototype-pss-flow-progress"><span><i style={{width:`${progresso.percentual}%`}}/></span><strong>{progresso.percentual}%</strong><small>{progresso.concluidas} de {progresso.total} etapas</small></div>
  <dl>
   <div><dt>Órgão solicitante</dt><dd>{processo.orgaoSolicitante}</dd></div>
   <div><dt>Responsável</dt><dd>{processo.responsavel}</dd></div>
   <div><dt>Vagas imediatas</dt><dd>{processo.vagasImediatas.toLocaleString("pt-BR")}</dd></div>
   <div><dt>Cadastro de reserva</dt><dd>{processo.vagasCadastroReserva.toLocaleString("pt-BR")}</dd></div>
   <div><dt>Abertura</dt><dd>{processo.dataAbertura}</dd></div>
   <div><dt>Previsão de homologação</dt><dd>{processo.dataPrevistaHomologacao??"Não informada"}</dd></div>
   <div><dt>Cargos</dt><dd>{processo.cargos.join(", ")}</dd></div>
   <div><dt>Empresa contratada</dt><dd>{processo.empresaContratada??"Não se aplica"}</dd></div>
  </dl>
 </section></SpecArea>;
}

function EtapaStep({etapa,aberta,onToggle,onNavigate}:{etapa:EtapaProcessoPss;aberta:boolean;onToggle:()=>void;onNavigate:()=>void}){
 return <li className={`prototype-pss-step ${etapa.situacao.toLowerCase()}`}>
  <span className="prototype-pss-step-marker" aria-hidden="true"><i className={iconeSituacao[etapa.situacao]}/></span>
  <SpecArea metadata={processosBlockSpecifications.etapa}><div className="prototype-pss-step-body">
   <button className="prototype-pss-step-head" onClick={onToggle} aria-expanded={aberta}>
    <span><strong>{etapa.ordem}. {etapa.nome}</strong><small>{etapa.responsavel} • {etapa.sistema}</small>
     <span className="tags"><span className={`prototype-pss-badge ${etapa.situacao.toLowerCase()}`}>{situacaoEtapaLabel[etapa.situacao]}</span><span className={`prototype-pss-badge ${etapa.automacao.toLowerCase()}`}><i className={automacaoIcone[etapa.automacao]}/>{automacaoLabel[etapa.automacao]}</span>{etapa.foraEscopoSistemico&&<span className="prototype-pss-badge neutral">Fora do escopo sistêmico</span>}</span>
    </span>
    <i className={aberta?"pi pi-chevron-up":"pi pi-chevron-down"}/>
   </button>
   {aberta&&<div className="prototype-pss-step-content">
    <p>{etapa.descricao}</p>
    <dl><div><dt>Responsável</dt><dd>{etapa.responsavel}</dd></div><div><dt>Data prevista</dt><dd>{etapa.dataPrevista}</dd></div><div><dt>Conclusão</dt><dd>{etapa.dataConclusao??"—"}</dd></div></dl>
    {etapa.observacao&&<p className="prototype-pss-step-observation">{etapa.observacao}</p>}
    {etapa.pendencias.length>0&&<SpecArea metadata={processosBlockSpecifications.pendencias}><div className={`prototype-pss-step-pending${etapa.situacao==="BLOQUEADA"?" is-blocked":""}`}><strong>{etapa.situacao==="BLOQUEADA"?"Impedimentos":"Pendências"}</strong><ul>{etapa.pendencias.map((pendencia)=><li key={pendencia}>{pendencia}</li>)}</ul></div></SpecArea>}
    <SpecArea metadata={processosActionSpecifications["Abrir tela da etapa"]}><button className="prototype-pss-step-action" onClick={onNavigate}><i className="pi pi-external-link"/> Abrir {etapa.rotuloDestino}</button></SpecArea>
   </div>}
  </div></SpecArea>
 </li>;
}
