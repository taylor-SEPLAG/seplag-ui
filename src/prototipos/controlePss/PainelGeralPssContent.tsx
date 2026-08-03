import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE, CONTROLE_PSS_DATA_REFERENCIA, CONTROLE_PSS_DATA_REFERENCIA_FORMATADA } from "./constants";
import { useControlePssStore } from "./controlePssStore";
import { construirHistoricoTemporalPss } from "./historicoTemporalPss";
import { construirDashboardPss, orgaosDosProcessos, situacaoProcessoLabel, situacoesProcessoPss, type DashboardPssFiltros } from "./dashboardPssSelectors";
import { construirResumoPorSecretaria, registrosEmContingencia, statusGeralClasse, statusGeralDoProcesso, statusGeralLabel } from "./deParaIngressoUtils";
import { faseLabel, faseLabelCurto, fasesPss } from "./fluxoPssUtils";
import type { StatusGeralPss } from "./types";
import { SpecArea, SpecificationMode, type SpecificationMetadata } from "../shared/visualizationModes";
import { painelPssAlertSpecifications, painelPssBlockSpecifications, painelPssBusinessItems, painelPssFilterSpecifications, painelPssKpiSpecifications, painelPssScreenSpecification } from "./PainelGeralPssSpecifications";
import "./controlePssBase.css";
import "./painelGeralPss.css";

const filtrosIniciais:DashboardPssFiltros={dataReferencia:CONTROLE_PSS_DATA_REFERENCIA,orgaoSolicitante:"",fase:"",tipo:"",modalidadeExecucao:"",situacao:"",somenteDivergencias:false,somentePendenciasManuais:false};

export function PainelGeralPssContent(){
 const state=useControlePssStore();const navigate=useNavigate();
 const [filtros,setFiltros]=useState(filtrosIniciais);
 const [filtrosAbertos,setFiltrosAbertos]=useState(false);
 const dados=useMemo(()=>construirDashboardPss(state,filtros),[state,filtros]);
 const eventos=useMemo(()=>construirHistoricoTemporalPss(state).slice(-5).reverse(),[state]);
 const secretarias=useMemo(()=>construirResumoPorSecretaria(state.vagas,state.ingressos,state.processos),[state.vagas,state.ingressos,state.processos]);
 const orgaos=orgaosDosProcessos(state.processos);
 const contarStatus=(status:StatusGeralPss)=>dados.grupos.filter((grupo)=>statusGeralDoProcesso(grupo.processo.situacao)===status).length;
 const vagasDisponiveis=secretarias.reduce((total,item)=>total+item.vagasDisponiveis,0);
 const contingencias=registrosEmContingencia(state.registrosDePara).length;

 const indicadores=[
  {label:"Processos abertos",valor:contarStatus("ABERTO"),hint:"Recebidos do SIES, sem execução",icon:"pi pi-inbox",cor:"blue",onClick:()=>navigate(`${BASE}/processos`)},
  {label:"Processos em andamento",valor:contarStatus("EM_ANDAMENTO"),hint:"Certame em execução",icon:"pi pi-spinner",cor:"cyan",onClick:()=>navigate(`${BASE}/processos`)},
  {label:"Processos fechados",valor:contarStatus("FECHADO"),hint:"Homologados ou encerrados",icon:"pi pi-check-circle",cor:"green",onClick:()=>navigate(`${BASE}/processos`)},
  {label:"Com pendência manual",valor:dados.resumo.comPendenciaManual,hint:"Trâmite fora do sistema",icon:"pi pi-exclamation-triangle",cor:"orange",onClick:()=>navigate(`${BASE}/processos`)},
  {label:"Com divergência SIGEP × SIES",valor:dados.resumo.comDivergenciaSies,hint:`${dados.divergencias.length} ocorrências`,icon:"pi pi-flag",cor:"red",onClick:()=>navigate(`${BASE}/vagas?divergencia=SIM`)},
  {label:"Vagas disponíveis",valor:vagasDisponiveis,hint:"Saldo por secretaria de destino",icon:"pi pi-users",cor:"purple",onClick:()=>navigate(`${BASE}/vagas`)},
 ];

 const alertas=[
  {icon:"pi pi-lock",kind:"critical",titulo:"Etapas bloqueadas",valor:dados.resumo.etapasBloqueadas,rota:"processos"},
  {icon:"pi pi-flag",kind:"critical",titulo:"Divergências SIGEP × SIES",valor:dados.divergencias.length,rota:"vagas?divergencia=SIM"},
  {icon:"pi pi-sync",kind:"warning",titulo:"Registros de-para em contingência",valor:contingencias,rota:"integracao-sies?aba=DEPARA"},
  {icon:"pi pi-book",kind:"warning",titulo:"Publicações pendentes",valor:dados.resumo.publicacoesPendentes,rota:"integracao-sies"},
 ];

 return <SpecificationMode screen={painelPssScreenSpecification} businessItems={painelPssBusinessItems}><div className="prototype-pss-page">
  <header className="prototype-pss-header"><div><span>Controle PSS</span><h1>Painel Geral</h1><p>Posição consolidada dos processos seletivos controlados pelo SIGEP: status geral, pendências, divergências com o SIES e saldo de vagas.</p></div><div className="prototype-pss-header-actions"><small>Dados consolidados em<br/><strong>{CONTROLE_PSS_DATA_REFERENCIA_FORMATADA} 08:15</strong></small><button onClick={()=>window.print()}><i className="pi pi-download"/> Exportar visão</button></div></header>

  <SpecArea metadata={painelPssBlockSpecifications.aviso}><div className="prototype-pss-notice" role="status"><i className="pi pi-info-circle"/><div><strong>O SIGEP não cadastra processos seletivos.</strong><span>Os processos abaixo chegam do SIES pela integração de-para. O SIGEP controla o status do processo, as vagas por secretaria e o ingresso do servidor.</span></div></div></SpecArea>

  <section className="prototype-pss-filter-accordion"><SpecArea metadata={painelPssBlockSpecifications.filtros}><button className="prototype-pss-filter-trigger" onClick={()=>setFiltrosAbertos((aberto)=>!aberto)} aria-expanded={filtrosAbertos}><span><i className="pi pi-filter"/><strong>Filtros da consulta</strong><small>Data, órgão, fase e situação</small></span><i className={`pi ${filtrosAbertos?"pi-chevron-up":"pi-chevron-down"}`}/></button></SpecArea>{filtrosAbertos&&<div className="prototype-pss-filters">
   <Filtro label="Data de referência" metadata={painelPssFilterSpecifications["Data de referência"]}><input type="date" value={filtros.dataReferencia} onChange={(e)=>setFiltros({...filtros,dataReferencia:e.target.value})}/></Filtro>
   <Filtro label="Órgão solicitante" metadata={painelPssFilterSpecifications["Órgão solicitante"]}><select value={filtros.orgaoSolicitante} onChange={(e)=>setFiltros({...filtros,orgaoSolicitante:e.target.value})}><option value="">Todos</option>{orgaos.map((item)=><option key={item}>{item}</option>)}</select></Filtro>
   <Filtro label="Fase do fluxo" metadata={painelPssFilterSpecifications["Fase do fluxo"]}><select value={filtros.fase} onChange={(e)=>setFiltros({...filtros,fase:e.target.value})}><option value="">Todas as fases</option>{fasesPss.map((fase)=><option key={fase} value={fase}>{faseLabel[fase]}</option>)}</select></Filtro>
   <Filtro label="Situação" metadata={painelPssFilterSpecifications["Situação"]}><select value={filtros.situacao} onChange={(e)=>setFiltros({...filtros,situacao:e.target.value})}><option value="">Todas</option>{situacoesProcessoPss.map((item)=><option key={item} value={item}>{situacaoProcessoLabel[item]}</option>)}</select></Filtro>
   <div className="prototype-pss-filter-actions">
    <SpecArea metadata={painelPssFilterSpecifications["Somente divergências"]}><label className="prototype-pss-check" title="Exibe somente processos com divergência de cadastro entre SIGEP e SIES"><input type="checkbox" checked={filtros.somenteDivergencias} onChange={(e)=>setFiltros({...filtros,somenteDivergencias:e.target.checked})}/><span>Somente divergências SIGEP × SIES</span></label></SpecArea>
    <SpecArea metadata={painelPssFilterSpecifications["Limpar"]}><button className="prototype-pss-clear-filter" onClick={()=>setFiltros(filtrosIniciais)}><i className="pi pi-filter-slash"/> Limpar</button></SpecArea>
   </div>
  </div>}</section>

  <section className="prototype-pss-kpis">{indicadores.map((item)=><Kpi key={item.label} {...item}/>)}</section>

  <div className="prototype-pss-grid bottom">
   <section className="prototype-pss-card"><header><div><h2>Alertas do Controle PSS</h2><p>Situações que travam o andamento dos certames</p></div></header><div className="prototype-pss-alert-list">{alertas.map((alerta)=><SpecArea key={alerta.titulo} metadata={painelPssAlertSpecifications[alerta.titulo]}><button className={alerta.kind} onClick={()=>navigate(`${BASE}/${alerta.rota}`)}><i className={alerta.icon}/><div><strong>{alerta.titulo}</strong><span>Abrir os registros de origem</span></div><b>{alerta.valor}</b><i className="pi pi-chevron-right"/></button></SpecArea>)}</div></section>
   <SpecArea metadata={painelPssBlockSpecifications.recentes}><section className="prototype-pss-card"><header><div><h2>Eventos recentes</h2><p>Trilha de auditoria consolidada</p></div></header><div className="prototype-pss-dash-recent">{eventos.map((evento)=><article key={evento.id}><i className="pi pi-history"/><div><span>{evento.tipo.replaceAll("_"," ")}</span><strong>{evento.descricao}</strong><small>{evento.dataEfeito} • {evento.origem}</small></div></article>)}{eventos.length===0&&<p className="prototype-pss-empty">Nenhum evento registrado.</p>}</div></section></SpecArea>
  </div>

  <SpecArea metadata={painelPssBlockSpecifications.tabela}><section className="prototype-pss-card"><header><div><h2>Processos em acompanhamento</h2><p>{dados.grupos.length} processos recebidos do SIES</p></div><button onClick={()=>navigate(`${BASE}/processos`)}>Abrir Processos Seletivos <i className="pi pi-arrow-right"/></button></header><div className="prototype-pss-table"><table>
   <thead><tr><th>Processo</th><th>Órgão</th><th>Status geral</th><th>Fase</th><th className="num">Imediatas</th><th className="num">Reserva</th><th>Andamento</th></tr></thead>
   <tbody>{dados.grupos.map((grupo)=><tr key={grupo.chave}>
    <td><button className="prototype-pss-link" onClick={()=>navigate(`${BASE}/processos/${grupo.processo.id}`)}>{grupo.processo.numero}</button><small>{grupo.processo.edital}</small></td>
    <td>{grupo.processo.orgaoSolicitante}</td>
    <td><span className={`prototype-pss-badge ${statusGeralClasse[statusGeralDoProcesso(grupo.processo.situacao)]}`}>{statusGeralLabel[statusGeralDoProcesso(grupo.processo.situacao)]}</span>{grupo.divergencias>0&&<span className="prototype-pss-badge divergente">Divergência</span>}</td>
    <td><span className={`prototype-pss-badge ${grupo.faseAtual.toLowerCase()}`}>{faseLabelCurto[grupo.faseAtual]}</span><small>{grupo.etapaAtualNome}</small></td>
    <td className="num">{grupo.processo.vagasImediatas.toLocaleString("pt-BR")}</td>
    <td className="num">{grupo.processo.vagasCadastroReserva.toLocaleString("pt-BR")}</td>
    <td><div className="prototype-pss-dash-progress"><span><i style={{width:`${grupo.percentual}%`}}/></span><strong>{grupo.percentual}%</strong></div><small>{grupo.concluidas} de {grupo.totalEtapas} etapas</small></td>
   </tr>)}</tbody>
  </table></div>{dados.grupos.length===0&&<p className="prototype-pss-empty">Nenhum processo atende aos filtros aplicados.</p>}</section></SpecArea>
 </div></SpecificationMode>;
}

function Filtro({label,metadata,children}:{label:string;metadata:SpecificationMetadata;children:ReactNode}){return <SpecArea metadata={metadata}><label><span>{label}</span>{children}</label></SpecArea>}
function Kpi({label,valor,hint,icon,cor,onClick}:{label:string;valor:number;hint:string;icon:string;cor:string;onClick:()=>void}){return <SpecArea metadata={painelPssKpiSpecifications[label]}><button className={`prototype-pss-kpi ${cor}`} onClick={onClick} type="button"><i className={icon}/><div><span>{label}</span><strong>{valor.toLocaleString("pt-BR")}</strong><small>{hint}</small></div><i className="pi pi-arrow-right arrow"/></button></SpecArea>}
