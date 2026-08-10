import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE } from "./constants";
import { controlePssStore, useControlePssStore } from "./controlePssStore";
import { construirResumoPorSecretaria } from "./deParaIngressoUtils";
import { calcularDivergenciasSies, tipoDivergenciaLabel } from "./divergenciaSiesUtils";
import type { VagaProcessoPss } from "./types";
import { SpecArea, SpecificationMode } from "../shared/visualizationModes";
import { vagasPssActionSpecifications, vagasPssBlockSpecifications, vagasPssBusinessItems, vagasPssFilterSpecifications, vagasPssKpiSpecifications, vagasPssScreenSpecification } from "./ControleVagasPssSpecifications";
import "./controlePssBase.css";
import "./controleVagasPss.css";

type SituacaoValidacao="VALIDADA"|"PENDENTE"|"DIVERGENTE";
const validacaoLabel:Record<SituacaoValidacao,string>={VALIDADA:"Validada no SIES",PENDENTE:"Pendente de validação",DIVERGENTE:"Divergente"};
const moeda=(valor:number)=>valor.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

export function ControleVagasPssContent(){
 const state=useControlePssStore();
 const navigate=useNavigate();
 const [searchParams]=useSearchParams();
 const [processo,setProcesso]=useState(()=>searchParams.get("processo")??"");
 const [orgao,setOrgao]=useState("");
 const [validacao,setValidacao]=useState(()=>searchParams.get("divergencia")==="SIM"?"DIVERGENTE":"");
 const [detalhe,setDetalhe]=useState<VagaProcessoPss|null>(null);

 const divergencias=useMemo(()=>calcularDivergenciasSies(state.vagas,state.processos,state.cargosSies),[state.vagas,state.processos,state.cargosSies]);
 const divergentes=useMemo(()=>new Set(divergencias.map((item)=>item.vagaId)),[divergencias]);
 const situacaoDaVaga=(vaga:VagaProcessoPss):SituacaoValidacao=>divergentes.has(vaga.id)?"DIVERGENTE":vaga.validadaContraSies?"VALIDADA":"PENDENTE";

 const filtradas=state.vagas.filter((vaga)=>(!processo||vaga.processoId===processo)&&(!orgao||vaga.orgaoDestino===orgao)&&(!validacao||situacaoDaVaga(vaga)===validacao));
 const divergenciasFiltradas=divergencias.filter((item)=>filtradas.some((vaga)=>vaga.id===item.vagaId));
 const resumoSecretarias=construirResumoPorSecretaria(filtradas,state.ingressos,state.processos);
 const totais={
  registros:filtradas.length,
  validadas:filtradas.filter((vaga)=>situacaoDaVaga(vaga)==="VALIDADA").length,
  divergentes:filtradas.filter((vaga)=>situacaoDaVaga(vaga)==="DIVERGENTE").length,
  disponiveis:resumoSecretarias.reduce((total,item)=>total+item.vagasDisponiveis,0),
 };
 const nomeProcesso=(id:string)=>state.processos.find((item)=>item.id===id)?.numero??id;
 const revalidar=(vaga:VagaProcessoPss)=>{
  const correspondente=state.cargosSies.find((item)=>item.id===vaga.cargoSiesId||item.nome===vaga.cargo);
  controlePssStore.set("vagas",(atuais)=>atuais.map((item)=>item.id===vaga.id?{...item,validadaContraSies:Boolean(correspondente&&correspondente.cbo===vaga.cbo),cargoSiesId:correspondente?.id,cargoSiesNome:correspondente?.nome}:item));
 };

 return <SpecificationMode screen={vagasPssScreenSpecification} businessItems={vagasPssBusinessItems}><div className="prototype-pss-page">
  <header className="prototype-pss-header"><div><span>Controle PSS</span><h1>Controle de Vagas</h1><p>Vagas dos certames por secretaria de destino: temporários ocupando, saldo disponível, lotações e conciliação com o catálogo de cargos do SIES.</p></div><div className="prototype-pss-header-actions"><button onClick={()=>navigate(`${BASE}/processos`)}><i className="pi pi-sitemap"/> Processos Seletivos</button></div></header>

  {divergenciasFiltradas.length>0&&<SpecArea metadata={vagasPssBlockSpecifications.alerta}><div className="prototype-pss-vaga-alert" role="status"><i className="pi pi-exclamation-triangle"/><div><strong>{divergenciasFiltradas.length} divergências de cadastro entre SIGEP e SIES.</strong><span>Vagas do certame sem correspondência confiável no SIES impedem o avanço da etapa de cadastro e comprometem o controle do quadro.</span></div><button onClick={()=>setValidacao("DIVERGENTE")}>Ver somente divergentes</button></div></SpecArea>}

  <section className="prototype-pss-kpis">
   <Kpi label="Vagas cadastradas" valor={totais.registros} hint="Registros de cargo do certame" icon="pi pi-list" cor="blue"/>
   <Kpi label="Validadas contra o SIES" valor={totais.validadas} hint={`${totais.registros?Math.round(totais.validadas/totais.registros*100):0}% dos registros`} icon="pi pi-check-circle" cor="green"/>
   <Kpi label="Com divergência" valor={totais.divergentes} hint="Exigem conciliação" icon="pi pi-flag" cor="red" onClick={()=>setValidacao("DIVERGENTE")}/>
   <Kpi label="Vagas disponíveis" valor={totais.disponiveis} hint="Saldo por secretaria de destino" icon="pi pi-users" cor="purple"/>
  </section>

  <SpecArea metadata={vagasPssBlockSpecifications.filtros}><section className="prototype-pss-filters">
   <SpecArea metadata={vagasPssFilterSpecifications.Processo}><label><span>Processo</span><select value={processo} onChange={(event)=>setProcesso(event.target.value)}><option value="">Todos</option>{state.processos.map((item)=><option key={item.id} value={item.id}>{item.numero}</option>)}</select></label></SpecArea>
   <SpecArea metadata={vagasPssFilterSpecifications["Órgão de destino"]}><label><span>Órgão de destino</span><select value={orgao} onChange={(event)=>setOrgao(event.target.value)}><option value="">Todos</option>{[...new Set(state.vagas.map((item)=>item.orgaoDestino))].sort().map((item)=><option key={item}>{item}</option>)}</select></label></SpecArea>
   <SpecArea metadata={vagasPssFilterSpecifications["Validação SIES"]}><label><span>Validação SIES</span><select value={validacao} onChange={(event)=>setValidacao(event.target.value)}><option value="">Todas</option><option value="VALIDADA">Validada</option><option value="PENDENTE">Pendente de validação</option><option value="DIVERGENTE">Divergente</option></select></label></SpecArea>
   <div className="prototype-pss-filter-actions"><SpecArea metadata={vagasPssActionSpecifications.Limpar}><button className="prototype-pss-clear-filter" onClick={()=>{setProcesso("");setOrgao("");setValidacao("")}}><i className="pi pi-filter-slash"/> Limpar</button></SpecArea></div>
  </section></SpecArea>

  <SpecArea metadata={vagasPssBlockSpecifications.secretarias}><section className="prototype-pss-card prototype-pss-vaga-section"><header><div><h2>Painel de vagas por secretaria</h2><p>Temporários ocupando vagas, saldo disponível e lotações de destino por órgão</p></div></header><div className="prototype-pss-secretarias">{resumoSecretarias.map((item)=><article key={item.orgao}>
   <header><strong>{item.orgao}</strong><small>{item.processos.join(" • ")}</small></header>
   <div className="numeros">
    <div><span>Temporários ocupando</span><b>{item.temporariosOcupando.toLocaleString("pt-BR")}</b></div>
    <div><span>Vagas disponíveis</span><b>{item.vagasDisponiveis.toLocaleString("pt-BR")}</b></div>
    <div><span>Imediatas</span><b>{item.vagasImediatas.toLocaleString("pt-BR")}</b></div>
    <div><span>Cadastro de reserva</span><b>{item.cadastroReserva.toLocaleString("pt-BR")}</b></div>
   </div>
   <ul>{item.lotacoes.map((lotacao)=><li key={lotacao}><i className="pi pi-map-marker"/> {lotacao}</li>)}</ul>
  </article>)}{resumoSecretarias.length===0&&<p className="prototype-pss-empty">Nenhuma secretaria de destino nos registros filtrados.</p>}</div></section></SpecArea>

  <SpecArea metadata={vagasPssBlockSpecifications.tabela}><section className="prototype-pss-card prototype-pss-vaga-section"><header><div><h2>Vagas individuais do certame</h2><p>{filtradas.length} de {state.vagas.length} registros</p></div></header><div className="prototype-pss-table"><table>
   <thead><tr><th>Cargo</th><th>Processo</th><th>Órgão de destino</th><th className="num">Imediatas</th><th className="num">Reserva</th><th>Validação SIES</th><th>Ações</th></tr></thead>
   <tbody>{filtradas.map((vaga)=>{const situacao=situacaoDaVaga(vaga);return <tr key={vaga.id}>
    <td><button className="prototype-pss-link" onClick={()=>setDetalhe(vaga)}>{vaga.cargo}</button><small>{vaga.cargoSiesNome??"Sem correspondência no SIES"}</small></td>
    <td>{nomeProcesso(vaga.processoId)}</td>
    <td>{vaga.orgaoDestino}<small>{vaga.lotacaoPrevista}</small></td>
    <td className="num">{vaga.vagasImediatas.toLocaleString("pt-BR")}</td>
    <td className="num">{vaga.cadastroReserva.toLocaleString("pt-BR")}</td>
    <td><span className={`prototype-pss-vaga-validation ${situacao.toLowerCase()}`}><i className={situacao==="VALIDADA"?"pi pi-check-circle":situacao==="DIVERGENTE"?"pi pi-times-circle":"pi pi-clock"}/>{validacaoLabel[situacao]}</span></td>
    <td><div className="prototype-pss-proc-actions">
     <SpecArea metadata={vagasPssActionSpecifications["Revalidar contra o SIES"]}><button className="icon" title="Revalidar contra o SIES" onClick={()=>revalidar(vaga)}><i className="pi pi-refresh"/></button></SpecArea>
     <SpecArea metadata={vagasPssActionSpecifications["Abrir processo"]}><button className="icon" title="Abrir processo" onClick={()=>navigate(`${BASE}/processos/${vaga.processoId}`)}><i className="pi pi-sitemap"/></button></SpecArea>
    </div></td>
   </tr>})}</tbody>
  </table></div>{filtradas.length===0&&<p className="prototype-pss-empty">Nenhuma vaga atende aos filtros aplicados.</p>}</section></SpecArea>

  <SpecArea metadata={vagasPssBlockSpecifications.divergencias}><section className="prototype-pss-card"><header><div><h2>Divergências apuradas</h2><p>Conciliação entre as vagas recebidas e o catálogo de cargos do SIES</p></div></header><div className="prototype-pss-vaga-divergences">{divergenciasFiltradas.map((item)=><article key={item.id}><span className={`prototype-pss-badge ${item.gravidade.toLowerCase()}`}>{item.gravidade}</span><div><strong>{tipoDivergenciaLabel[item.tipo]}</strong><p>{item.descricao}</p><small>{item.processoNumero} • {item.cargo} • detectada em {item.detectadaEm}</small></div></article>)}{divergenciasFiltradas.length===0&&<p className="prototype-pss-empty">Nenhuma divergência apurada nos registros filtrados.</p>}</div></section></SpecArea>

  {detalhe&&<DetalheVaga vaga={detalhe} processoNumero={nomeProcesso(detalhe.processoId)} onClose={()=>setDetalhe(null)}/>}
 </div></SpecificationMode>;
}

function Kpi({label,valor,hint,icon,cor,onClick}:{label:string;valor:number;hint:string;icon:string;cor:string;onClick?:()=>void}){
 return <SpecArea metadata={vagasPssKpiSpecifications[label]}><button className={`prototype-pss-kpi ${cor}`} onClick={onClick} type="button"><i className={icon}/><div><span>{label}</span><strong>{valor.toLocaleString("pt-BR")}</strong><small>{hint}</small></div></button></SpecArea>;
}

function DetalheVaga({vaga,processoNumero,onClose}:{vaga:VagaProcessoPss;processoNumero:string;onClose:()=>void}){
 return <div className="prototype-pss-backdrop" onMouseDown={onClose}><SpecArea metadata={vagasPssBlockSpecifications.detalhe}><section className="prototype-pss-modal" role="dialog" aria-modal="true" aria-label={`Vaga ${vaga.cargo}`} onMouseDown={(event)=>event.stopPropagation()}>
  <header><div><span>Vaga do processo</span><h2>{vaga.cargo}</h2><p>{processoNumero} • {vaga.id}</p></div><button onClick={onClose} aria-label="Fechar"><i className="pi pi-times"/></button></header>
  <dl>
   <div><dt>Órgão de destino</dt><dd>{vaga.orgaoDestino}</dd></div>
   <div><dt>Perfil profissional</dt><dd>{vaga.perfilProfissional}</dd></div>
   <div><dt>Carga horária</dt><dd>{vaga.cargaHoraria}h semanais</dd></div>
   <div><dt>Remuneração</dt><dd>{moeda(vaga.remuneracao)}</dd></div>
   <div><dt>Vagas imediatas</dt><dd>{vaga.vagasImediatas.toLocaleString("pt-BR")}</dd></div>
   <div><dt>Cadastro de reserva</dt><dd>{vaga.cadastroReserva.toLocaleString("pt-BR")}</dd></div>
   <div className="full"><dt>Escolaridade exigida</dt><dd>{vaga.escolaridade}</dd></div>
   <div className="full"><dt>Lotação prevista</dt><dd>{vaga.lotacaoPrevista}</dd></div>
  </dl>
  <div className="prototype-pss-vaga-compare">
   <div><h4>Cadastro no SIGEP</h4><dl><div><dt>Cargo</dt><dd>{vaga.cargo}</dd></div><div><dt>CBO</dt><dd>{vaga.cbo}</dd></div><div><dt>Cadastrada em</dt><dd>{vaga.cadastradaEm} por {vaga.usuarioCadastro}</dd></div></dl></div>
   <div><h4>Correspondência no SIES</h4><dl><div><dt>Cargo</dt><dd>{vaga.cargoSiesNome??"Sem correspondência"}</dd></div><div><dt>Identificador</dt><dd>{vaga.cargoSiesId??"—"}</dd></div><div><dt>Situação</dt><dd>{vaga.validadaContraSies?"Validada":"Pendente de validação"}</dd></div></dl></div>
  </div>
  {vaga.divergencia&&<section><h3>Divergência registrada</h3><p className="prototype-pss-vaga-alert"><i className="pi pi-exclamation-triangle"/> {vaga.divergencia}</p></section>}
  <footer><button onClick={onClose}>Fechar</button></footer>
 </section></SpecArea></div>;
}
