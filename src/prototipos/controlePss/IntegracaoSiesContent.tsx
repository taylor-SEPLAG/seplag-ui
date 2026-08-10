import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CONTROLE_PSS_DATA_REFERENCIA } from "./constants";
import { controlePssStore, useControlePssStore } from "./controlePssStore";
import { camposDeParaPss, candidatoElegivelDePara, gerarRegistroDePara, ingressoDoCandidato, podeEfetivarIngresso, registroDoCandidato, situacaoCargaClasse, situacaoCargaLabel, situacaoIngressoClasse, situacaoIngressoLabel, statusGeralDoProcesso, statusGeralLabel } from "./deParaIngressoUtils";
import type { CandidatoPss, IngressoServidorPss, IntegracaoExterna, RegistroDeParaPss, SituacaoCandidatoPss, SituacaoConvocacaoPss, SituacaoIntegracaoPss, SituacaoPublicacaoPss, StatusGeralPss } from "./types";
import { SpecArea, SpecificationMode } from "../shared/visualizationModes";
import { integracaoActionSpecifications, integracaoBlockSpecifications, integracaoBusinessItems, integracaoFilterSpecifications, integracaoScreenSpecification, integracaoTabSpecifications } from "./IntegracaoSiesSpecifications";
import "./controlePssBase.css";
import "./integracaoSies.css";

type Aba="INTEGRACOES"|"DEPARA";
const abas:readonly {id:Aba;label:string;icon:string}[]=[{id:"INTEGRACOES",label:"Integrações",icon:"pi pi-share-alt"},{id:"DEPARA",label:"De-Para, Candidatos e Ingresso",icon:"pi pi-arrow-right-arrow-left"}];
const situacaoLabel:Record<SituacaoIntegracaoPss,string>={NAO_INTEGRADO:"Não integrado",PARCIAL:"Integração parcial",INTEGRADO:"Integrado"};
const situacaoClasse:Record<SituacaoIntegracaoPss,string>={NAO_INTEGRADO:"divergente",PARCIAL:"parcial",INTEGRADO:"concluida"};
const proximaSituacao:Record<SituacaoIntegracaoPss,SituacaoIntegracaoPss>={NAO_INTEGRADO:"PARCIAL",PARCIAL:"INTEGRADO",INTEGRADO:"NAO_INTEGRADO"};
const situacaoConvocacaoLabel:Record<SituacaoConvocacaoPss,string>={PENDENTE:"Convocação pendente",GERADA:"Convocação gerada",PUBLICADA:"Convocação publicada",ENCERRADA:"Convocação encerrada"};
const situacaoConvocacaoClasse:Record<SituacaoConvocacaoPss,string>={PENDENTE:"pendente",GERADA:"em_andamento",PUBLICADA:"concluida",ENCERRADA:"neutral"};
const situacaoPublicacaoLabel:Record<SituacaoPublicacaoPss,string>={PENDENTE:"Publicação pendente",EM_ELABORACAO:"Publicação em elaboração",PUBLICADA:"Publicada no veículo oficial"};
const situacaoPublicacaoClasse:Record<SituacaoPublicacaoPss,string>={PENDENTE:"pendente",EM_ELABORACAO:"em_andamento",PUBLICADA:"concluida"};
const situacaoCandidatoLabel:Record<SituacaoCandidatoPss,string>={INSCRITO:"Inscrito",DEFERIDO:"Inscrição deferida",INDEFERIDO:"Inscrição indeferida",CLASSIFICADO:"Classificado",DESCLASSIFICADO:"Desclassificado",CONVOCADO:"Convocado",NOMEADO:"Nomeado",DESISTENTE:"Desistente"};

interface ContingenciaPss{candidato:CandidatoPss;registro?:RegistroDeParaPss}

export function IntegracaoSiesContent(){
 const {integracoes,pendencias,processos,registrosDePara,candidatos,convocacoes,publicacoes,vagas,ingressos}=useControlePssStore();
 const [searchParams]=useSearchParams();
 const abaInicial=(searchParams.get("aba") as Aba|null)??"INTEGRACOES";
 const [aba,setAba]=useState<Aba>(abas.some((item)=>item.id===abaInicial)?abaInicial:"INTEGRACOES");
 const [criticidade,setCriticidade]=useState("");
 const [processo,setProcesso]=useState(()=>searchParams.get("processo")??"");
 const [notaAberta,setNotaAberta]=useState(false);

 const filtradas=useMemo(()=>integracoes.filter((item)=>!criticidade||item.criticidade===criticidade),[integracoes,criticidade]);
 const contar=(situacao:SituacaoIntegracaoPss)=>filtradas.filter((item)=>item.situacaoAtual===situacao).length;
 const lacunas=filtradas.reduce((total,item)=>total+item.oQueFalta.length,0);
 const registrarVerificacao=(integracao:IntegracaoExterna)=>controlePssStore.set("integracoes",(atuais)=>atuais.map((item)=>item.id===integracao.id?{...item,situacaoAtual:proximaSituacao[item.situacaoAtual],ultimaVerificacao:CONTROLE_PSS_DATA_REFERENCIA}:item));
 const statusGeral=useMemo(()=>{
  const contagem:Record<StatusGeralPss,number>={ABERTO:0,EM_ANDAMENTO:0,FECHADO:0};
  processos.forEach((item)=>{contagem[statusGeralDoProcesso(item.situacao)]+=1});
  return contagem;
 },[processos]);

 const registros=useMemo(()=>registrosDePara.filter((item)=>!processo||item.processoId===processo),[registrosDePara,processo]);
 const elegiveis=useMemo(()=>candidatos.filter((item)=>candidatoElegivelDePara(item)&&(!processo||item.processoId===processo)),[candidatos,processo]);
 const nomeProcesso=(id:string)=>processos.find((item)=>item.id===id)?.numero??id;
 const convocacaoDoRegistro=(candidatoId:string)=>convocacoes.find((item)=>item.candidatoIds.includes(candidatoId));
 const publicacaoDoProcesso=(processoId:string)=>publicacoes.find((item)=>item.processoId===processoId&&item.tipo==="CONVOCACAO");

 const [ultimaCarga,setUltimaCarga]=useState("");
 const executarCarga=()=>{
  const atual=controlePssStore.getState();
  const carregados=new Set(atual.registrosDePara.map((item)=>item.candidatoId));
  const novos=atual.candidatos.reduce<RegistroDeParaPss[]>((lista,candidato)=>{
   if(carregados.has(candidato.id)||(candidato.situacao!=="CONVOCADO"&&candidato.situacao!=="NOMEADO"))return lista;
   const processoOrigem=atual.processos.find((item)=>item.id===candidato.processoId);
   if(!processoOrigem)return lista;
   const vaga=atual.vagas.find((item)=>item.processoId===candidato.processoId&&item.cargo===candidato.cargo);
   const convocacao=atual.convocacoes.find((item)=>item.candidatoIds.includes(candidato.id));
   lista.push(gerarRegistroDePara(candidato,processoOrigem,vaga,convocacao));
   return lista;
  },[]);
  if(novos.length)controlePssStore.set("registrosDePara",(atuais)=>[...atuais,...novos]);
  setUltimaCarga(novos.length?`${novos.length} registro(s) de-para gerados em ${CONTROLE_PSS_DATA_REFERENCIA}.`:"Nenhum candidato convocado ou nomeado pendente de carga.");
 };

 const [contingencia,setContingencia]=useState<ContingenciaPss|null>(null);
 const gravarIngresso=(ingresso:IngressoServidorPss)=>controlePssStore.set("ingressos",(atuais)=>atuais.some((item)=>item.candidatoId===ingresso.candidatoId)?atuais.map((item)=>item.candidatoId===ingresso.candidatoId?ingresso:item):[...atuais,ingresso]);
 const montarIngresso=(candidato:CandidatoPss,registro:RegistroDeParaPss|undefined,dados:Partial<IngressoServidorPss>):IngressoServidorPss=>{
  const vaga=vagas.find((item)=>item.processoId===candidato.processoId&&item.cargo===candidato.cargo);
  const anterior=ingressoDoCandidato(ingressos,candidato.id);
  return {
   id:anterior?.id??`ING-${candidato.id}`,processoId:candidato.processoId,candidatoId:candidato.id,
   vagaProcessoId:vaga?.id??anterior?.vagaProcessoId??"",orgao:vaga?.orgaoDestino??anterior?.orgao??processos.find((item)=>item.id===candidato.processoId)?.orgaoSolicitante??"",
   lotacao:vaga?.lotacaoPrevista??registro?.lotacaoPretendida??anterior?.lotacao??"Lotação a definir pelo órgão de destino",
   confirmacaoConvocacao:false,validacaoDocumental:false,situacao:"PENDENTE",origemRegistroDeParaId:registro?.id,contingenciaManual:false,
   responsavel:registro?.responsavel??processos.find((item)=>item.id===candidato.processoId)?.responsavel??"SEPLAG — Gestão de Pessoas",
   registradoEm:`${CONTROLE_PSS_DATA_REFERENCIA} 09:00`,...dados,
  } satisfies IngressoServidorPss;
 };
 const efetivarIngresso=(candidato:CandidatoPss)=>{
  const registro=registroDoCandidato(registrosDePara,candidato.id);
  if(!registro||!podeEfetivarIngresso(registro)){setContingencia({candidato,registro});return}
  gravarIngresso(montarIngresso(candidato,registro,{dataIngresso:CONTROLE_PSS_DATA_REFERENCIA,confirmacaoConvocacao:true,validacaoDocumental:true,situacao:"EFETIVADO"}));
 };
 const registrarContingencia=(justificativa:string)=>{
  if(!contingencia)return;
  const {candidato,registro}=contingencia;
  const situacao=registro?.situacaoCarga==="PENDENTE_CONVOCACAO_SIES"?"PENDENTE":"BLOQUEADO";
  gravarIngresso(montarIngresso(candidato,registro,{situacao,contingenciaManual:true,justificativaContingencia:justificativa,validacaoDocumental:registro?.situacaoCarga==="PENDENTE_CONVOCACAO_SIES"}));
  setContingencia(null);
 };

 return <SpecificationMode screen={integracaoScreenSpecification} businessItems={integracaoBusinessItems}><div className="prototype-pss-page">
  <header className="prototype-pss-header"><div><span>Controle PSS</span><h1>Integração SIES</h1><p>Situação das integrações do fluxo do certame, o de-para de candidatos recebido do SIES e o ingresso do servidor no SIGEP.</p></div></header>

  <SpecArea metadata={integracaoBlockSpecifications.aviso}><div className="prototype-pss-notice" role="status"><i className="pi pi-info-circle"/><div><strong>Dados de propriedade do SIES.</strong><span>Convocação e publicação são geradas fora do SIGEP e aparecem aqui apenas como status de leitura. A única escrita deste módulo é o ingresso do servidor.</span></div></div></SpecArea>

  <nav className="prototype-pss-tabs" aria-label="Seções da integração">{abas.map((item)=><SpecArea key={item.id} metadata={integracaoTabSpecifications[item.label]}><button className={aba===item.id?"is-active":""} onClick={()=>setAba(item.id)}><i className={item.icon}/> {item.label} <span>{item.id==="INTEGRACOES"?filtradas.length:registros.length}</span></button></SpecArea>)}</nav>

  {aba==="INTEGRACOES"&&<>
   <SpecArea metadata={integracaoBlockSpecifications.resumo}><section className="prototype-pss-int-summary" aria-label="Resumo das integrações">
    <article><span className="is-green"><i className="pi pi-check-circle"/></span><div><strong>{contar("INTEGRADO")}</strong><small>Integradas</small></div></article>
    <article><span className="is-orange"><i className="pi pi-clock"/></span><div><strong>{contar("PARCIAL")}</strong><small>Integração parcial</small></div></article>
    <article><span className="is-red"><i className="pi pi-times-circle"/></span><div><strong>{contar("NAO_INTEGRADO")}</strong><small>Não integradas</small></div></article>
    <article><span className="is-blue"><i className="pi pi-list"/></span><div><strong>{lacunas}</strong><small>Lacunas mapeadas</small></div></article>
   </section></SpecArea>

   <section className="prototype-pss-filters">
    <SpecArea metadata={integracaoFilterSpecifications.Criticidade}><label><span>Criticidade</span><select value={criticidade} onChange={(event)=>setCriticidade(event.target.value)}><option value="">Todas</option><option value="ALTA">Alta</option><option value="MEDIA">Média</option><option value="BAIXA">Baixa</option></select></label></SpecArea>
   </section>

   <div className="prototype-pss-int-cards">{filtradas.map((integracao)=><SpecArea key={integracao.id} metadata={integracaoBlockSpecifications.cartao}><article className="prototype-pss-int-card">
    <header><div><h2>{integracao.nome}</h2><p>{integracao.finalidade}</p><div className="tags"><span className={`prototype-pss-badge ${situacaoClasse[integracao.situacaoAtual]}`}>{situacaoLabel[integracao.situacaoAtual]}</span><span className={`prototype-pss-badge ${integracao.criticidade.toLowerCase()}`}>Criticidade {integracao.criticidade.toLowerCase()}</span></div></div></header>
    <div className="prototype-pss-int-body">
     <h3>O que falta</h3>
     <ul>{integracao.oQueFalta.map((item)=><li key={item}>{item}</li>)}</ul>
     <dl>
      <div><dt>Responsável</dt><dd>{integracao.responsavel}</dd></div>
      <div><dt>Última verificação</dt><dd>{integracao.ultimaVerificacao}</dd></div>
      {integracao.id==="INT-SIES"&&<div className="full"><dt>Status geral dos processos (RN04)</dt><dd>{statusGeral.ABERTO} {statusGeralLabel.ABERTO.toLowerCase()} • {statusGeral.EM_ANDAMENTO} {statusGeralLabel.EM_ANDAMENTO.toLowerCase()} • {statusGeral.FECHADO} {statusGeralLabel.FECHADO.toLowerCase()}</dd></div>}
     </dl>
    </div>
    <div className="prototype-pss-int-footer"><SpecArea metadata={integracaoActionSpecifications["Registrar verificação"]}><button onClick={()=>registrarVerificacao(integracao)}><i className="pi pi-refresh"/> Registrar verificação</button></SpecArea></div>
   </article></SpecArea>)}{filtradas.length===0&&<p className="prototype-pss-empty">Nenhuma integração para a criticidade selecionada.</p>}</div>

   <SpecArea metadata={integracaoBlockSpecifications.pendencias}><section className="prototype-pss-int-note">
    <button onClick={()=>setNotaAberta((aberta)=>!aberta)} aria-expanded={notaAberta}><span><i className="pi pi-question-circle"/><strong>Pontos para validação com a área de negócio</strong><small>{pendencias.length} definições pendentes</small></span><i className={`pi ${notaAberta?"pi-chevron-up":"pi-chevron-down"}`}/></button>
    {notaAberta&&<ol className="prototype-pss-int-pending">{pendencias.map((item,indice)=><li key={item}><span>{String(indice+1).padStart(2,"0")}</span><div><strong>{item}</strong><small>Aguardando validação</small></div></li>)}</ol>}
   </section></SpecArea>
  </>}

  {aba==="DEPARA"&&<div className="prototype-pss-depara">
   <section className="prototype-pss-filters">
    <SpecArea metadata={integracaoFilterSpecifications.Processo}><label><span>Processo de origem</span><select value={processo} onChange={(event)=>setProcesso(event.target.value)}><option value="">Todos</option>{processos.map((item)=><option key={item.id} value={item.id}>{item.numero}</option>)}</select></label></SpecArea>
   </section>

   <SpecArea metadata={integracaoBlockSpecifications.mapeamento}><section className="prototype-pss-card"><header><div><h2>Mapeamento de campos SIES ↔ SIGEP</h2><p>Correspondência exigida pelo RF-001 para eliminar a dupla digitação do cadastro do candidato</p></div></header><div className="prototype-pss-table"><table>
    <thead><tr><th>Campo no SIES</th><th>Campo no SIGEP</th><th>Observação</th></tr></thead>
    <tbody>{camposDeParaPss.map((campo)=><tr key={campo.id}><td><strong>{campo.campoSies}</strong></td><td>{campo.campoSigep}</td><td><small>{campo.observacao}</small></td></tr>)}</tbody>
   </table></div></section></SpecArea>

   <SpecArea metadata={integracaoBlockSpecifications.registrosDePara}><section className="prototype-pss-card"><header><div><h2>Registros carregados</h2><p>{registros.length} candidatos com carga de-para, com rastreabilidade ao processo de origem</p></div><SpecArea metadata={integracaoActionSpecifications["Executar carga de dados"]}><button onClick={executarCarga}><i className="pi pi-sync"/> Executar carga de dados (de-para)</button></SpecArea></header>
    {ultimaCarga&&<p className="prototype-pss-depara-feedback" role="status"><i className="pi pi-check-circle"/> {ultimaCarga}</p>}
    <div className="prototype-pss-table"><table>
     <thead><tr><th>Candidato (CPF)</th><th>Processo de origem</th><th>Cargo do edital → cargo no SIGEP</th><th>Lotação pretendida</th><th>Convocação e publicação (SIES)</th><th>Situação da carga</th></tr></thead>
     <tbody>{registros.map((registro)=>{const convocacao=convocacaoDoRegistro(registro.candidatoId);const publicacao=publicacaoDoProcesso(registro.processoId);return <tr key={registro.id}>
      <td><strong>{registro.cpf}</strong><small>{registro.candidatoId} • {registro.statusCandidatoSigep}</small></td>
      <td>{registro.processoNumero}<small>{registro.statusInscricaoSies}</small></td>
      <td>{registro.cargoEdital}<small>→ {registro.cargoSigep}</small></td>
      <td>{registro.lotacaoPretendida}<small>{registro.localCidade}</small></td>
      <td>{convocacao?<span className={`prototype-pss-badge ${situacaoConvocacaoClasse[convocacao.situacao]}`}>{situacaoConvocacaoLabel[convocacao.situacao]}</span>:<span className="prototype-pss-badge pendente">Sem convocação no SIES</span>}{publicacao&&<span className={`prototype-pss-badge ${situacaoPublicacaoClasse[publicacao.situacao]}`}>{situacaoPublicacaoLabel[publicacao.situacao]}</span>}<small>{registro.statusConvocacaoSies??"Convocação não estruturada no SIES"}</small></td>
      <td><span className={`prototype-pss-badge ${situacaoCargaClasse[registro.situacaoCarga]}`}>{situacaoCargaLabel[registro.situacaoCarga]}</span>{registro.contingenciaManual&&<span className="prototype-pss-badge manual">Contingência manual</span>}<small>{registro.carregadoEm} • {registro.responsavel}</small></td>
     </tr>})}</tbody>
    </table></div>{registros.length===0&&<p className="prototype-pss-empty">Nenhum registro de-para carregado. Execute a carga de dados para gerar os registros dos candidatos convocados.</p>}</section></SpecArea>

   <SpecArea metadata={integracaoBlockSpecifications.ingresso}><section className="prototype-pss-card"><header><div><h2>Ingresso do Servidor</h2><p>Vinculação do candidato convocado à vaga e à lotação de destino no SIGEP, a partir do de-para do SIES</p></div></header><div className="prototype-pss-table"><table>
    <thead><tr><th>Candidato</th><th>Processo</th><th>Cargo e lotação pretendida</th><th>Carga de-para</th><th>Ingresso</th><th>Ações</th></tr></thead>
    <tbody>{elegiveis.map((candidato)=>{const registro=registroDoCandidato(registrosDePara,candidato.id);const ingresso=ingressoDoCandidato(ingressos,candidato.id);return <tr key={candidato.id}>
     <td><strong>{candidato.nome}</strong><small>{candidato.cpf} • {situacaoCandidatoLabel[candidato.situacao]}</small></td>
     <td>{nomeProcesso(candidato.processoId)}</td>
     <td>{candidato.cargo}<small>{registro?.lotacaoPretendida??"Lotação ainda não carregada do SIES"}</small></td>
     <td>{registro?<><span className={`prototype-pss-badge ${situacaoCargaClasse[registro.situacaoCarga]}`}>{situacaoCargaLabel[registro.situacaoCarga]}</span>{registro.contingenciaManual&&<span className="prototype-pss-badge manual">Contingência manual</span>}</>:<span className="prototype-pss-badge pendente">Sem carga de-para</span>}</td>
     <td>{ingresso?<><span className={`prototype-pss-badge ${situacaoIngressoClasse[ingresso.situacao]}`}>{situacaoIngressoLabel[ingresso.situacao]}</span><small>{ingresso.dataIngresso?`Ingresso em ${ingresso.dataIngresso}`:ingresso.justificativaContingencia??"Registro provisório"}</small></>:<span className="prototype-pss-badge neutral">Não registrado</span>}</td>
     <td><SpecArea metadata={integracaoActionSpecifications["Efetivar ingresso"]}><button className="prototype-pss-ingresso-action" onClick={()=>efetivarIngresso(candidato)} disabled={ingresso?.situacao==="EFETIVADO"}><i className="pi pi-user-plus"/> Efetivar ingresso</button></SpecArea></td>
    </tr>})}</tbody>
   </table></div>{elegiveis.length===0&&<p className="prototype-pss-empty">Nenhum candidato convocado ou nomeado no processo selecionado.</p>}</section></SpecArea>
  </div>}

  {contingencia&&<ContingenciaManual dados={contingencia} processoNumero={nomeProcesso(contingencia.candidato.processoId)} onConfirm={registrarContingencia} onClose={()=>setContingencia(null)}/>}
 </div></SpecificationMode>;
}

function ContingenciaManual({dados,processoNumero,onConfirm,onClose}:{dados:ContingenciaPss;processoNumero:string;onConfirm:(justificativa:string)=>void;onClose:()=>void}){
 const [justificativa,setJustificativa]=useState("");
 const [erro,setErro]=useState(false);
 const motivo=dados.registro?dados.registro.situacaoCarga==="PENDENTE_CONVOCACAO_SIES"?"A convocação deste candidato ainda não é dado estruturado no SIES; a confirmação só existe no documento publicado.":"A validação documental do candidato ainda não foi concluída no SIGEP.":"O candidato ainda não possui carga de-para executada a partir do SIES.";
 return <div className="prototype-pss-backdrop" onMouseDown={onClose}><SpecArea metadata={integracaoBlockSpecifications.contingencia}><section className="prototype-pss-modal" role="dialog" aria-modal="true" aria-label="Contingência manual do ingresso" onMouseDown={(event)=>event.stopPropagation()}>
  <header><div><span>Contingência manual — RN07</span><h2>{dados.candidato.nome}</h2><p>{processoNumero} • {dados.candidato.cargo}</p></div><button onClick={onClose} aria-label="Fechar"><i className="pi pi-times"/></button></header>
  <section><p className="prototype-pss-ingresso-alert"><i className="pi pi-exclamation-triangle"/> {motivo} O registro gravado é provisório e permanece assim até a integração completa entre SIES e SIGEP.</p></section>
  <dl>
   <div><dt>CPF</dt><dd>{dados.candidato.cpf}</dd></div>
   <div><dt>Situação do candidato</dt><dd>{situacaoCandidatoLabel[dados.candidato.situacao]}</dd></div>
   <div><dt>Carga de-para</dt><dd>{dados.registro?situacaoCargaLabel[dados.registro.situacaoCarga]:"Não executada"}</dd></div>
   <div><dt>Lotação pretendida</dt><dd>{dados.registro?.lotacaoPretendida??"A definir pelo órgão de destino"}</dd></div>
   <div className="full"><dt>Justificativa da contingência</dt><dd><textarea className="prototype-pss-ingresso-justificativa" value={justificativa} onChange={(event)=>{setJustificativa(event.target.value);setErro(false)}} rows={3} placeholder="Descreva o documento e o ato que autorizam o registro provisório do ingresso."/></dd></div>
  </dl>
  {erro&&<section><p className="prototype-pss-ingresso-alert"><i className="pi pi-times-circle"/> Informe a justificativa para registrar a contingência manual.</p></section>}
  <footer><button onClick={onClose}>Cancelar</button><button className="is-primary" onClick={()=>{if(justificativa.trim().length<10){setErro(true);return}onConfirm(justificativa.trim())}}>Registrar contingência</button></footer>
 </section></SpecArea></div>;
}
