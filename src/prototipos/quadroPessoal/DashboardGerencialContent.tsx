import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAutorizacoesPessoalStore } from "./autorizacoesPessoalStore";
import type { AutorizacaoPessoal, ModoControlePessoal } from "./autorizacoesPessoalTypes";
import { QUADRO_PESSOAL_BASE_PATH } from "./constants";
import "./dashboardGerencial.css";
import "./dashboardControleVagas.css";

const modoLabel:Record<ModoControlePessoal,string>={LIMITE_QUANTITATIVO:"Limite quantitativo",POSICOES_INDIVIDUALIZADAS:"Posições individualizadas",SEM_LIMITE:"Sem limite definido"};
const situacaoLabel={VIGENCIA_FUTURA:"Vigência futura",VIGENTE:"Vigente",SUSPENSA:"Suspensa",ENCERRADA:"Encerrada",REVOGADA:"Revogada"} as const;
const capacidade=(item:AutorizacaoPessoal)=>item.modoControle==="SEM_LIMITE"?null:Math.max(0,(item.limite??0)-item.vinculosAtivos-item.ingressosAndamento);

export function DashboardGerencialContent(){
 const {autorizacoes,posicoes}=useAutorizacoesPessoalStore();const navigate=useNavigate();const [tipo,setTipo]=useState("");const [orgao,setOrgao]=useState("");const [modo,setModo]=useState("");const [situacao,setSituacao]=useState("");
 const filtradas=useMemo(()=>autorizacoes.filter((i)=>(!tipo||i.tipoVinculo===tipo)&&(!orgao||i.orgaoResponsavel===orgao)&&(!modo||i.modoControle===modo)&&(!situacao||i.situacao===situacao)),[autorizacoes,tipo,orgao,modo,situacao]);
 const op=(valores:string[])=>[...new Set(valores.filter(Boolean))].sort();const limitadas=filtradas.filter((i)=>i.modoControle!=="SEM_LIMITE");const ativos=filtradas.reduce((s,i)=>s+i.vinculosAtivos,0);const ingressos=filtradas.reduce((s,i)=>s+i.ingressosAndamento,0);const limite=limitadas.reduce((s,i)=>s+(i.limite??0),0);const restante=limitadas.reduce((s,i)=>s+(capacidade(i)??0),0);const semLimite=filtradas.filter((i)=>i.modoControle==="SEM_LIMITE").length;
 const hoje=new Date();const limite90=new Date();limite90.setDate(limite90.getDate()+90);const vencendo=filtradas.filter((i)=>{if(!i.fimVigencia)return false;const d=new Date(i.fimVigencia+"T00:00:00");return d>=hoje&&d<=limite90}).length;
 return <div className="prototype-quadro-pessoal-dash-page prototype-quadro-pessoal-management-dashboard">
  <header className="prototype-quadro-pessoal-dash-header"><div><h1>Dashboard do Quadro de Pessoal</h1><p>Autorizações, vínculos e posições dos vínculos não efetivos.</p></div></header>
  <section className="prototype-quadro-pessoal-management-filter-accordion"><div className="prototype-quadro-pessoal-dash-filters management" style={{display:"grid"}}>
   <label><span>Tipo de vínculo</span><select value={tipo} onChange={(e)=>setTipo(e.target.value)}><option value="">Todos</option>{op(autorizacoes.map((i)=>i.tipoVinculo)).map((i)=><option key={i}>{i}</option>)}</select></label>
   <label><span>Órgão responsável</span><select value={orgao} onChange={(e)=>setOrgao(e.target.value)}><option value="">Todos</option>{op(autorizacoes.map((i)=>i.orgaoResponsavel)).map((i)=><option key={i}>{i}</option>)}</select></label>
   <label><span>Modo de controle</span><select value={modo} onChange={(e)=>setModo(e.target.value)}><option value="">Todos</option>{Object.entries(modoLabel).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
   <label><span>Situação</span><select value={situacao} onChange={(e)=>setSituacao(e.target.value)}><option value="">Todas</option>{Object.entries(situacaoLabel).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
   <button className="prototype-quadro-pessoal-management-clear-filter" onClick={()=>{setTipo("");setOrgao("");setModo("");setSituacao("")}}><i className="pi pi-filter-slash"/> Limpar</button>
  </div></section>
  <section className="prototype-quadro-pessoal-dash-kpis management unified">
   <Kpi label="Autorizações" valor={filtradas.length} hint={`${filtradas.filter((i)=>i.situacao==="VIGENTE").length} vigentes`} icon="pi pi-file-check" onClick={()=>navigate(`${QUADRO_PESSOAL_BASE_PATH}/autorizacoes`)}/>
   <Kpi label="Limite controlado" valor={limite} hint="Somente registros limitados" icon="pi pi-chart-bar" onClick={()=>navigate(`${QUADRO_PESSOAL_BASE_PATH}/autorizacoes`)}/>
   <Kpi label="Vínculos ativos" valor={ativos} hint="Não ocupam vagas legais" icon="pi pi-users" onClick={()=>navigate(`${QUADRO_PESSOAL_BASE_PATH}/autorizacoes`)}/>
   <Kpi label="Em ingresso" valor={ingressos} hint="Ainda não iniciados" icon="pi pi-user-plus" onClick={()=>navigate(`${QUADRO_PESSOAL_BASE_PATH}/autorizacoes`)}/>
   <Kpi label="Capacidade restante" valor={restante} hint="Exclui registros sem limite" icon="pi pi-check-circle" onClick={()=>navigate(`${QUADRO_PESSOAL_BASE_PATH}/autorizacoes`)}/>
   <Kpi label="Sem limite definido" valor={semLimite} hint="Capacidade não se aplica" icon="pi pi-infinity" onClick={()=>navigate(`${QUADRO_PESSOAL_BASE_PATH}/autorizacoes`)}/>
   <Kpi label="Posições" valor={posicoes.length} hint="Identificadores administrativos" icon="pi pi-list" onClick={()=>navigate(`${QUADRO_PESSOAL_BASE_PATH}/posicoes`)}/>
   <Kpi label="Encerram em até 90 dias" valor={vencendo} hint="Autorizações próximas do término" icon="pi pi-calendar-times" onClick={()=>navigate(`${QUADRO_PESSOAL_BASE_PATH}/autorizacoes`)}/>
  </section>
  <section className="prototype-quadro-pessoal-dash-card priority management-table"><header><div><h2>Composição por autorização</h2><p>Limite, ocupação e vigência sem interferir no Controle de Vagas.</p></div><button onClick={()=>navigate(`${QUADRO_PESSOAL_BASE_PATH}/autorizacoes/novo`)}><i className="pi pi-plus"/> Nova autorização</button></header><div className="prototype-quadro-pessoal-dash-table"><table><thead><tr><th>Autorização</th><th>Vínculo</th><th>Programa / finalidade</th><th>Órgão</th><th>Controle</th><th className="num">Limite</th><th className="num">Ativos</th><th className="num">Em ingresso</th><th className="num">Capacidade</th><th>Término</th><th>Situação</th></tr></thead><tbody>{filtradas.map((i)=><tr key={i.id} onClick={()=>navigate(`${QUADRO_PESSOAL_BASE_PATH}/autorizacoes/${i.id}`)}><td><strong>{i.codigo}</strong><small>Versão {i.versao}</small></td><td>{i.tipoVinculo}</td><td><strong>{i.programaProjeto||i.objetoFinalidade||"—"}</strong></td><td>{i.orgaoResponsavel}</td><td>{modoLabel[i.modoControle]}</td><td className="num">{i.limite??"Não definido"}</td><td className="num">{i.vinculosAtivos}</td><td className="num">{i.ingressosAndamento}</td><td className="num"><strong>{capacidade(i)??"Não se aplica"}</strong></td><td>{i.fimVigencia||"Sem término"}</td><td>{situacaoLabel[i.situacao]}</td></tr>)}{!filtradas.length&&<tr><td colSpan={11}><div className="prototype-quadro-pessoal-authorization-empty"><i className="pi pi-inbox"/><strong>Quadro de Pessoal sem dados</strong><span>Cadastre uma autorização para alimentar o Dashboard.</span></div></td></tr>}</tbody></table></div></section>
 </div>;
}
function Kpi({label,valor,hint,icon,onClick}:{label:string;valor:number;hint:string;icon:string;onClick:()=>void}){return <button className="prototype-quadro-pessoal-dash-kpi blue" onClick={onClick}><i className={icon}/><div><span>{label}</span><strong>{valor.toLocaleString("pt-BR")}</strong><small>{hint}</small></div><i className="pi pi-arrow-right arrow"/></button>}

