import { useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Dropdown, type DropdownChangeEvent } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { DocumentosLegaisAssociadosSeplag } from "../../componentes/DocumentosLegaisAssociados";
import { useDocumentosLegais, useDocumentosLegaisAssociaveis } from "../documentosLegais/documentosLegaisStore";
import { orgaosBaseTemporaria, carreirasBaseTemporaria, cargosBaseTemporaria } from "./baseTemporaria";
import { QUADRO_PESSOAL_BASE_PATH } from "./constants";
import { autorizacoesPessoalStore, useAutorizacoesPessoalStore } from "./autorizacoesPessoalStore";
import type { AutorizacaoPessoal, ModoControlePessoal, PosicaoPessoal, SituacaoAutorizacaoPessoal } from "./autorizacoesPessoalTypes";
import "./quadroAutorizado.css";

const BASE_PATH=`${QUADRO_PESSOAL_BASE_PATH}/autorizacoes`;
const tiposInstrumento=["Processo seletivo","Programa de residência","Programa de bolsas","Convênio","Contrato","Termo de cooperação","Ato administrativo","Autorização orçamentária"];
const tiposVinculo=["Contratado temporário","Residente","Bolsista","Estagiário","Requisitado de outro ente","Empregado público","Outro vínculo não efetivo"];
const regimes=["Contrato administrativo","Celetista","Bolsa","Residência","Estágio","Requisição","Outro"];
const unidadesReferenciaPorOrgao:Record<string,string[]>={
  SEPLAG:["Administração Central","Coordenadoria Administrativa","Coordenadoria de Tecnologia"],
  SEDUC:["Sede Administrativa","Diretoria Regional de Educação","Escola Estadual"],
  SES:["Sede Administrativa","Hospital Regional","Unidade de Saúde"],
  SEFAZ:["Sede Administrativa","Agência Fazendária","Unidade Regional"],
  PGE:["Sede Administrativa","Procuradoria Especializada","Unidade Regional"],
};
const unidadesDoOrgao=(orgao:string)=>unidadesReferenciaPorOrgao[orgao]??["Sede administrativa","Unidade descentralizada"];

const modoInfo:Record<ModoControlePessoal,{titulo:string;descricao:string;icone:string}>={
  LIMITE_QUANTITATIVO:{titulo:"Limite quantitativo",descricao:"Controla um teto de vínculos sem numerar cada posição.",icone:"pi pi-chart-bar"},
  POSICOES_INDIVIDUALIZADAS:{titulo:"Posições individualizadas",descricao:"Cria posições numeradas e preserva o histórico de ocupação.",icone:"pi pi-list"},
  SEM_LIMITE:{titulo:"Sem limite previamente definido",descricao:"Acompanha vínculos e encerramentos sem calcular capacidade restante.",icone:"pi pi-infinity"},
};
const situacaoLabel:Record<SituacaoAutorizacaoPessoal,string>={VIGENCIA_FUTURA:"Vigência futura",VIGENTE:"Vigente",SUSPENSA:"Suspensa",ENCERRADA:"Encerrada",REVOGADA:"Revogada"};
const situacaoClass:Record<SituacaoAutorizacaoPessoal,string>={VIGENCIA_FUTURA:"is-future",VIGENTE:"is-active",SUSPENSA:"is-future",ENCERRADA:"is-closed",REVOGADA:"is-closed"};
const hoje=()=>new Date().toISOString().slice(0,10);
const calcularSituacao=(inicio:string,fim:string):SituacaoAutorizacaoPessoal=>inicio&&inicio>hoje()?"VIGENCIA_FUTURA":fim&&fim<hoje()?"ENCERRADA":"VIGENTE";
const capacidade=(item:AutorizacaoPessoal)=>item.modoControle==="SEM_LIMITE"?null:Math.max(0,(item.limite??0)-item.vinculosAtivos-item.ingressosAndamento);
const dataBr=(valor?:string)=>valor?valor.split("-").reverse().join("/"):"—";
const prazoPorExtenso=(meses:number)=>{const anos=Math.floor(meses/12);const restantes=meses%12;return [anos?anos+" "+(anos===1?"ano":"anos"):"",restantes?restantes+" "+(restantes===1?"mês":"meses"):""].filter(Boolean).join(" e ");};

export function QuadroAutorizadoContent(){
  const location=useLocation();const navigate=useNavigate();const {id}=useParams();
  const {autorizacoes}=useAutorizacoesPessoalStore();
  const rotaNova=location.pathname.endsWith("/novo");
  const rotaEditar=location.pathname.endsWith("/editar");
  const rotaNovaVersao=location.pathname.endsWith("/nova-versao");
  const registro=id?autorizacoes.find((item)=>item.id===Number(id)):undefined;
  if(rotaNova)return <AutorizacaoForm onBack={()=>navigate(BASE_PATH)}/>;
  if((rotaEditar||rotaNovaVersao)&&registro)return <AutorizacaoForm registro={registro} novaVersao={rotaNovaVersao} onBack={()=>navigate(BASE_PATH)}/>;
  if(id&&registro)return <AutorizacaoDetalhe registro={registro} onBack={()=>navigate(BASE_PATH)}/>;
  return <AutorizacoesConsulta onNovo={()=>navigate(`${BASE_PATH}/novo`)} onAbrir={(item)=>navigate(`${BASE_PATH}/${item.id}`)}/>;
}

function AutorizacoesConsulta({onNovo,onAbrir}:{onNovo:()=>void;onAbrir:(item:AutorizacaoPessoal)=>void}){
  const {autorizacoes,posicoes}=useAutorizacoesPessoalStore();
  const [busca,setBusca]=useState("");const [tipo,setTipo]=useState("");const [modo,setModo]=useState("");const [orgao,setOrgao]=useState("");const [situacao,setSituacao]=useState("");
  const filtradas=useMemo(()=>autorizacoes.filter((item)=>{
    const texto=`${item.codigo} ${item.tipoVinculo} ${item.programaProjeto} ${item.objetoFinalidade} ${item.objetoFinalidade}`.toLowerCase();
    return(!busca||texto.includes(busca.toLowerCase()))&&(!tipo||item.tipoVinculo===tipo)&&(!modo||item.modoControle===modo)&&(!orgao||item.orgaoResponsavel===orgao)&&(!situacao||item.situacao===situacao);
  }).sort((a,b)=>b.id-a.id),[autorizacoes,busca,tipo,modo,orgao,situacao]);
  const limitadas=autorizacoes.filter((item)=>item.modoControle!=="SEM_LIMITE");
  const totalLimite=limitadas.reduce((s,item)=>s+(item.limite??0),0);
  const totalAtivos=autorizacoes.reduce((s,item)=>s+item.vinculosAtivos,0);
  const totalIngressos=autorizacoes.reduce((s,item)=>s+item.ingressosAndamento,0);
  const totalCapacidade=limitadas.reduce((s,item)=>s+(capacidade(item)??0),0);
  const limpar=()=>{setBusca("");setTipo("");setModo("");setOrgao("");setSituacao("")};
  return <div className="prototype-quadro-pessoal-quadro-page">
    <header className="prototype-quadro-pessoal-quadro-header"><div><h1>Autorizações de Pessoal</h1><p>Autorizações, limites e posições dos vínculos não efetivos.</p></div><button className="prototype-quadro-pessoal-quadro-primary" onClick={onNovo}><i className="pi pi-plus"/> Nova autorização</button></header>
    <section className="prototype-quadro-pessoal-quadro-kpis">
      <article><span>Autorizações</span><strong>{autorizacoes.length}</strong><small>{autorizacoes.filter((i)=>i.situacao==="VIGENTE").length} vigentes</small></article>
      <article><span>Limite controlado</span><strong>{totalLimite.toLocaleString("pt-BR")}</strong><small>Somente autorizações limitadas</small></article>
      <article><span>Vínculos ativos</span><strong>{totalAtivos.toLocaleString("pt-BR")}</strong><small>Todos os modos de controle</small></article>
      <article><span>Em ingresso</span><strong>{totalIngressos.toLocaleString("pt-BR")}</strong><small>Aguardando início</small></article>
      <article><span>Capacidade restante</span><strong>{totalCapacidade.toLocaleString("pt-BR")}</strong><small>Não inclui autorizações sem limite</small></article>
      <article><span>Posições numeradas</span><strong>{posicoes.length.toLocaleString("pt-BR")}</strong><small>Histórico individual preservado</small></article>
    </section>
    <section className="prototype-quadro-pessoal-quadro-card">
      <div className="prototype-quadro-pessoal-quadro-filters">
        <label className="is-wide"><span>Código, vínculo, programa ou perfil</span><div><i className="pi pi-search"/><input value={busca} onChange={(e)=>setBusca(e.target.value)} placeholder="Pesquisar autorização"/></div></label>
        <label><span>Tipo de vínculo</span><select value={tipo} onChange={(e)=>setTipo(e.target.value)}><option value="">Todos</option>{tiposVinculo.map((i)=><option key={i}>{i}</option>)}</select></label>
        <label><span>Modo de controle</span><select value={modo} onChange={(e)=>setModo(e.target.value)}><option value="">Todos</option>{Object.entries(modoInfo).map(([valor,info])=><option key={valor} value={valor}>{info.titulo}</option>)}</select></label>
        <label><span>Órgão responsável</span><select value={orgao} onChange={(e)=>setOrgao(e.target.value)}><option value="">Todos</option>{orgaosBaseTemporaria.map((i)=><option key={i.id}>{i.nome}</option>)}</select></label>
        <label><span>Situação</span><select value={situacao} onChange={(e)=>setSituacao(e.target.value)}><option value="">Todas</option>{Object.entries(situacaoLabel).map(([valor,label])=><option key={valor} value={valor}>{label}</option>)}</select></label>
        <button onClick={limpar}><i className="pi pi-filter-slash"/> Limpar</button>
      </div>
      <div className="prototype-quadro-pessoal-quadro-table"><table><thead><tr><th>Autorização</th><th>Vínculo / programa</th><th>Órgão</th><th>Controle</th><th className="is-number">Limite</th><th className="is-number">Ativos</th><th className="is-number">Em ingresso</th><th className="is-number">Capacidade</th><th>Vigência</th><th>Situação</th><th>Ações</th></tr></thead>
      <tbody>{filtradas.map((item)=><tr key={item.id}><td><button className="prototype-quadro-pessoal-quadro-link" onClick={()=>onAbrir(item)}>{item.codigo}</button><small>Versão {item.versao}</small></td><td><strong>{item.tipoVinculo}</strong><small>{item.programaProjeto||item.objetoFinalidade}</small></td><td>{item.orgaoResponsavel}<small>{item.locaisAtuacao.length+" "+(item.locaisAtuacao.length===1?"órgão de atuação":"órgãos de atuação")}</small></td><td><strong>{modoInfo[item.modoControle].titulo}</strong></td><td className="is-number">{item.modoControle==="SEM_LIMITE"?"Não definido":item.limite}</td><td className="is-number">{item.vinculosAtivos}</td><td className="is-number">{item.ingressosAndamento}</td><td className="is-number"><strong>{capacidade(item)??"Não se aplica"}</strong></td><td>{dataBr(item.inicioVigencia)}<small>{item.fimVigencia?`até ${dataBr(item.fimVigencia)}`:"sem término"}</small></td><td><span className={`prototype-quadro-pessoal-quadro-status ${situacaoClass[item.situacao]}`}>{situacaoLabel[item.situacao]}</span></td><td><div className="prototype-quadro-pessoal-quadro-actions"><button title="Visualizar" onClick={()=>onAbrir(item)}><i className="pi pi-eye"/></button><button title={item.situacao==="VIGENCIA_FUTURA"?"Editar antes da vigência":"Edição indisponível após a vigência"} disabled={item.situacao!=="VIGENCIA_FUTURA"} onClick={()=>location.assign(`#${BASE_PATH}/${item.id}/editar`)}><i className="pi pi-pencil"/></button>{item.situacao==="VIGENTE"&&<button title="Criar nova versão" onClick={()=>location.assign(`#${BASE_PATH}/${item.id}/nova-versao`)}><i className="pi pi-plus"/></button>}</div></td></tr>)}
      {!filtradas.length&&<tr><td colSpan={11}><div className="prototype-quadro-pessoal-authorization-empty"><i className="pi pi-inbox"/><strong>Nenhuma autorização de pessoal cadastrada</strong><span>Cadastre a primeira autorização para começar a estruturar o Quadro de Pessoal.</span></div></td></tr>}</tbody></table></div>
    </section>
  </div>;
}

type FormState={
  tipoInstrumento:string;documentosLegaisIds:string[];processoSigadoc:string;tipoVinculo:string;regimeNatureza:string;modoControle:ModoControlePessoal;
  programaProjeto:string;objetoFinalidade:string;usarCargoLegal:boolean;carreiraReferencia:string;cargoReferencia:string;
  orgaoResponsavel:string;locaisAtuacao:{orgao:string;unidades:string[]}[];limite:string;inicioVigencia:string;fimVigencia:string;prazoInicialVinculoMeses:string;permiteProrrogacaoVinculo:boolean;prazoProrrogacaoVinculoMeses:string;
  fonteRecurso:string;unidadeOrcamentaria:string;centroCusto:string;observacoes:string;
};
const vazio:FormState={tipoInstrumento:"",documentosLegaisIds:[],processoSigadoc:"",tipoVinculo:"",regimeNatureza:"",modoControle:"LIMITE_QUANTITATIVO",programaProjeto:"",objetoFinalidade:"",usarCargoLegal:false,carreiraReferencia:"",cargoReferencia:"",orgaoResponsavel:"",locaisAtuacao:[{orgao:"",unidades:[]}],limite:"",inicioVigencia:"",fimVigencia:"",prazoInicialVinculoMeses:"",permiteProrrogacaoVinculo:false,prazoProrrogacaoVinculoMeses:""};

function AutorizacaoForm({registro,novaVersao=false,onBack}:{registro?:AutorizacaoPessoal;novaVersao?:boolean;onBack:()=>void}){
  const navigate=useNavigate();const location=useLocation();const documentos=useDocumentosLegaisAssociaveis();
  const [form,setForm]=useState<FormState>(()=>registro?{tipoInstrumento:registro.tipoInstrumento,documentosLegaisIds:[...registro.documentosLegaisIds],processoSigadoc:registro.processoSigadoc,tipoVinculo:registro.tipoVinculo,regimeNatureza:registro.regimeNatureza,modoControle:registro.modoControle,programaProjeto:registro.programaProjeto,objetoFinalidade:registro.objetoFinalidade,usarCargoLegal:Boolean(registro.carreiraReferencia||registro.cargoReferencia),carreiraReferencia:registro.carreiraReferencia??"",cargoReferencia:registro.cargoReferencia??"",orgaoResponsavel:registro.orgaoResponsavel,locaisAtuacao:registro.locaisAtuacao.length?registro.locaisAtuacao.map((local)=>({orgao:local.orgao,unidades:[...local.unidades]})):[{orgao:"",unidades:[]}],limite:registro.limite?.toString()??"",inicioVigencia:registro.inicioVigencia,fimVigencia:registro.fimVigencia??"",prazoInicialVinculoMeses:registro.prazoInicialVinculoMeses?.toString()??"",permiteProrrogacaoVinculo:registro.permiteProrrogacaoVinculo,prazoProrrogacaoVinculoMeses:registro.prazoProrrogacaoVinculoMeses?.toString()??""}:vazio);
  const [erros,setErros]=useState<string[]>([]);const [salvo,setSalvo]=useState(false);
  const set=<K extends keyof FormState>(campo:K,valor:FormState[K])=>setForm((atual)=>({...atual,[campo]:valor}));
  const requerPosicao=form.modoControle==="POSICOES_INDIVIDUALIZADAS";
  const requerLimite=form.modoControle!=="SEM_LIMITE";
  const titulo=novaVersao?"Nova versão da autorização":registro?"Editar autorização":"Nova autorização de pessoal";
  const validar=()=>{const lista:string[]=[];if(!form.documentosLegaisIds.length)lista.push("Selecione ao menos um documento ou instrumento de origem.");if(!form.tipoInstrumento)lista.push("Informe o tipo de instrumento.");if(!form.processoSigadoc.trim())lista.push("Informe o Processo SIGADOC.");if(!form.tipoVinculo)lista.push("Informe o tipo de vínculo.");if(!form.regimeNatureza)lista.push("Informe o regime ou natureza.");if(!form.objetoFinalidade.trim())lista.push("Informe o objeto ou finalidade da autorização.");if(!form.orgaoResponsavel)lista.push("Informe o órgão responsável.");if(!form.locaisAtuacao.some((local)=>local.orgao))lista.push("Selecione ao menos um órgão de atuação.");if(!form.inicioVigencia)lista.push("Informe o início da vigência.");if(requerLimite&&Number(form.limite)<1)lista.push(requerPosicao?"Informe a quantidade de posições.":"Informe o limite quantitativo.");if(form.fimVigencia&&form.inicioVigencia&&form.fimVigencia<form.inicioVigencia)lista.push("O término não pode ser anterior ao início.");if(Number(form.prazoInicialVinculoMeses)<1)lista.push("Informe o prazo inicial permitido para cada vínculo.");if(form.permiteProrrogacaoVinculo&&Number(form.prazoProrrogacaoVinculoMeses)<1)lista.push("Informe o prazo possível de prorrogação do vínculo.");return lista};
  const gerarPosicoes=(autorizacao:AutorizacaoPessoal,quantidade:number):PosicaoPessoal[]=>{const prefixo=autorizacao.tipoVinculo.includes("Bolsista")?"BOLSA":autorizacao.tipoVinculo.includes("Residente")?"RESID":autorizacao.tipoVinculo.includes("Estagi")?"ESTAG":"PESS";return Array.from({length:quantidade},(_,indice)=>({id:`POS-${prefixo}-${String(indice+1).padStart(5,"0")}`,sequencial:indice+1,autorizacaoId:autorizacao.id,autorizacaoCodigo:autorizacao.codigo,tipoVinculo:autorizacao.tipoVinculo,programaProjeto:autorizacao.programaProjeto,objetoFinalidade:autorizacao.objetoFinalidade,orgao:"A definir no ingresso",situacao:"DISPONIVEL",criadaEm:hoje(),historicoOcupacoes:[]}));};
  const submit=(event:FormEvent)=>{event.preventDefault();const falhas=validar();setErros(falhas);if(falhas.length)return;const atual=autorizacoesPessoalStore.getState();const novoId=registro?.id??Math.max(0,...atual.autorizacoes.map((i)=>i.id))+1;const novaVersaoNumero=novaVersao?(registro?.versao??0)+1:registro?.versao??1;const limite=requerLimite?Number(form.limite):undefined;const item:AutorizacaoPessoal={id:novoId,codigo:registro?.codigo??`AP-${String(novoId).padStart(4,"0")}`,versao:novaVersaoNumero,tipoInstrumento:form.tipoInstrumento,documentosLegaisIds:form.documentosLegaisIds,processoSigadoc:form.processoSigadoc.trim(),tipoVinculo:form.tipoVinculo,regimeNatureza:form.regimeNatureza,modoControle:form.modoControle,programaProjeto:form.programaProjeto.trim(),objetoFinalidade:form.objetoFinalidade.trim(),carreiraReferencia:form.usarCargoLegal?form.carreiraReferencia:undefined,cargoReferencia:form.usarCargoLegal?form.cargoReferencia:undefined,orgaoResponsavel:form.orgaoResponsavel,locaisAtuacao:form.locaisAtuacao.filter((local)=>local.orgao).map((local)=>({orgao:local.orgao,unidades:local.unidades})),limite,vinculosAtivos:registro?.vinculosAtivos??0,ingressosAndamento:registro?.ingressosAndamento??0,inicioVigencia:form.inicioVigencia,fimVigencia:form.fimVigencia||undefined,prazoInicialVinculoMeses:Number(form.prazoInicialVinculoMeses),permiteProrrogacaoVinculo:form.permiteProrrogacaoVinculo,prazoProrrogacaoVinculoMeses:form.permiteProrrogacaoVinculo?Number(form.prazoProrrogacaoVinculoMeses)||undefined:undefined,situacao:calcularSituacao(form.inicioVigencia,form.fimVigencia),criadoEm:registro?.criadoEm??hoje(),atualizadoEm:hoje(),historicoVersoes:[...(registro?.historicoVersoes??[]),{versao:novaVersaoNumero,registradaEm:hoje(),inicioVigencia:form.inicioVigencia,fimVigencia:form.fimVigencia||undefined,limite,motivo:novaVersao?"Nova versão da autorização":"Cadastro inicial"}]};
    autorizacoesPessoalStore.setAutorizacoes((itens)=>registro?itens.map((i)=>i.id===registro.id?item:i):[...itens,item]);
    autorizacoesPessoalStore.setPosicoes((itens)=>{const outras=itens.filter((p)=>p.autorizacaoId!==item.id);const existentes=itens.filter((p)=>p.autorizacaoId===item.id);if(item.modoControle!=="POSICOES_INDIVIDUALIZADAS")return [...outras,...existentes.map((p)=>p.situacao==="OCUPADA"?p:{...p,situacao:"ENCERRADA" as const})];const desejado=item.limite??0;if(existentes.length>=desejado)return [...outras,...existentes.map((p)=>p.sequencial>desejado&&p.situacao!=="OCUPADA"?{...p,situacao:"ENCERRADA" as const}:p)];return [...outras,...existentes,...gerarPosicoes(item,desejado).slice(existentes.length)];});
    setSalvo(true);window.setTimeout(()=>navigate(BASE_PATH),500);
  };
  return <div className="prototype-quadro-pessoal-quadro-page">
    <header className="prototype-quadro-pessoal-quadro-header"><div><button className="prototype-quadro-pessoal-quadro-back" onClick={onBack}><i className="pi pi-arrow-left"/> Autorizações de Pessoal</button><h1>{titulo}</h1><p>{novaVersao?`${registro?.codigo} • versão atual ${registro?.versao}`:"Defina a origem, o vínculo e a forma de controle."}</p></div></header>
    {salvo&&<div className="prototype-quadro-pessoal-quadro-success"><i className="pi pi-check-circle"/> Autorização salva com sucesso.</div>}
    {!!erros.length&&<div className="prototype-quadro-pessoal-quadro-errors"><strong>Revise os campos obrigatórios:</strong><ul>{erros.map((e)=><li key={e}>{e}</li>)}</ul></div>}
    <form className="prototype-quadro-pessoal-quadro-form" onSubmit={submit}>
      <section><header><i className="pi pi-link"/><div><h2>Origem da autorização</h2><p>Vincule o instrumento que permite ou fundamenta a composição do quadro.</p></div></header>
        <div className="prototype-quadro-pessoal-quadro-library-section"><DocumentosLegaisAssociadosSeplag label="Documento ou instrumento de origem" required options={documentos} value={form.documentosLegaisIds} onChange={(v)=>set("documentosLegaisIds",v)} onNovoCadastro={()=>navigate(`/prototipos/sigep/documentos-legais/novo?returnTo=${encodeURIComponent(location.pathname)}`)} onVisualizar={(d)=>navigate(`/prototipos/sigep/documentos-legais/${d.id}`)} expandirAoAbrir/></div>
        <div className="prototype-quadro-pessoal-quadro-fields authorization-fields"><Field label="Tipo de instrumento *"><Pesquisa value={form.tipoInstrumento} onChange={(v)=>set("tipoInstrumento",v)} options={tiposInstrumento}/></Field><Field label="Processo SIGADOC *"><input value={form.processoSigadoc} onChange={(e)=>set("processoSigadoc",e.target.value)} placeholder="Ex.: SEPLAG-PRO-2026/00001"/></Field></div>
      </section>
      <section><header><i className="pi pi-id-card"/><div><h2>Vínculo e finalidade</h2><p>Identifique o tipo de vínculo e a finalidade administrativa para a qual o pessoal será autorizado.</p></div></header>
        <div className="prototype-quadro-pessoal-quadro-fields authorization-fields">
          <Field label="Tipo de vínculo *"><Pesquisa value={form.tipoVinculo} onChange={(v)=>set("tipoVinculo",v)} options={tiposVinculo}/></Field><Field label="Regime ou natureza *"><Pesquisa value={form.regimeNatureza} onChange={(v)=>set("regimeNatureza",v)} options={regimes}/></Field>
          <Field label="Programa ou projeto" wide><input value={form.programaProjeto} onChange={(e)=>set("programaProjeto",e.target.value)} placeholder="Ex.: Programa de Residência Técnica"/></Field>
          
          <Field label="Objeto ou finalidade da autorização *" full><textarea value={form.objetoFinalidade} onChange={(e)=>set("objetoFinalidade",e.target.value)} rows={3} placeholder="Descreva a finalidade administrativa, o público atendido ou o objetivo do programa"/></Field>
        </div>
        <label className="prototype-quadro-pessoal-reference-toggle"><input type="checkbox" checked={form.usarCargoLegal} onChange={(e)=>set("usarCargoLegal",e.target.checked)}/><span><strong>Informar cargo ou carreira apenas como referência</strong><small>Essa referência não ocupa nem reduz vaga do Controle de Vagas.</small></span></label>
        {form.usarCargoLegal&&<div className="prototype-quadro-pessoal-quadro-fields authorization-fields"><Field label="Carreira de referência"><Pesquisa value={form.carreiraReferencia} onChange={(v)=>set("carreiraReferencia",v)} options={carreirasBaseTemporaria.map((i)=>i.nome)}/></Field><Field label="Cargo de referência"><Pesquisa value={form.cargoReferencia} onChange={(v)=>set("cargoReferencia",v)} options={cargosBaseTemporaria.map((i)=>i.nome)}/></Field></div>}
      </section>
      <section><header><i className="pi pi-sliders-h"/><div><h2>Forma de controle</h2><p>Escolha como o SIGEP acompanhará esta autorização.</p></div></header>
        <div className="prototype-quadro-pessoal-control-modes">{(Object.keys(modoInfo) as ModoControlePessoal[]).map((modo)=>{const selecionado=form.modoControle===modo;const quantitativo=modo!=="SEM_LIMITE";return <label key={modo} className={selecionado?"selected":""}><input type="radio" name="modo" checked={selecionado} onChange={()=>set("modoControle",modo)}/><i className={modoInfo[modo].icone}/><span><strong>{modoInfo[modo].titulo}</strong><small>{modoInfo[modo].descricao}</small>{selecionado&&quantitativo&&<span className="prototype-quadro-pessoal-control-inline-field" onClick={(e)=>e.stopPropagation()}><b>{modo==="POSICOES_INDIVIDUALIZADAS"?"Quantidade de posições *":"Limite autorizado *"}</b><input type="number" min="1" value={form.limite} onChange={(e)=>set("limite",e.target.value)} onClick={(e)=>e.stopPropagation()} placeholder="0"/></span>}{selecionado&&!quantitativo&&<em className="prototype-quadro-pessoal-control-no-limit"><i className="pi pi-info-circle"/> Não exige quantitativo</em>}</span></label>})}</div>
      </section>
      <section><header><i className="pi pi-building"/><div><h2>Abrangência administrativa</h2><p>Informe quem administra a autorização e onde os vínculos poderão atuar.</p></div></header>
        <div className="prototype-quadro-pessoal-quadro-fields authorization-fields prototype-quadro-pessoal-responsible-org">
          <Field label="Órgão responsável *"><Pesquisa value={form.orgaoResponsavel} onChange={(v)=>set("orgaoResponsavel",v)} options={orgaosBaseTemporaria.map((i)=>i.nome)}/></Field>
        </div>
        <div className="prototype-quadro-pessoal-acting-organs">
          <div className="prototype-quadro-pessoal-acting-organs-header"><div><strong>Órgãos de atuação e setores</strong><span>Adicione os locais onde os vínculos poderão atuar. A alocação efetiva será definida no ingresso.</span></div><button type="button" onClick={()=>setForm((atual)=>({...atual,locaisAtuacao:[...atual.locaisAtuacao,{orgao:"",unidades:[]}]}))}><i className="pi pi-plus"/> Adicionar órgão</button></div>
          <div className="prototype-quadro-pessoal-acting-organs-columns"><span>Órgão de atuação *</span><span>Setores vinculados ao órgão</span><span>Ações</span></div>
          {form.locaisAtuacao.map((local,index)=><div className="prototype-quadro-pessoal-acting-organs-row" key={index}>
            <Pesquisa value={local.orgao} onChange={(orgao)=>setForm((atual)=>({...atual,locaisAtuacao:atual.locaisAtuacao.map((item,i)=>i===index?{orgao,unidades:[]}:item)}))} options={orgaosBaseTemporaria.map((i)=>i.nome).filter((orgao)=>orgao===local.orgao||!form.locaisAtuacao.some((item,j)=>j!==index&&item.orgao===orgao))}/>
            <MultiSelect value={local.unidades} options={local.orgao?unidadesDoOrgao(local.orgao):[]} placeholder={local.orgao?"Selecione um ou mais setores":"Selecione primeiro o órgão"} display="chip" filter disabled={!local.orgao} onChange={(e)=>setForm((atual)=>({...atual,locaisAtuacao:atual.locaisAtuacao.map((item,i)=>i===index?{...item,unidades:e.value??[]}:item)}))} className="prototype-quadro-pessoal-quadro-orgao-multiselect"/>
            <button type="button" className="prototype-quadro-pessoal-remove-acting-org" title="Remover órgão" disabled={form.locaisAtuacao.length===1} onClick={()=>setForm((atual)=>({...atual,locaisAtuacao:atual.locaisAtuacao.filter((_,i)=>i!==index)}))}><i className="pi pi-trash"/></button>
          </div>)}
        </div>
      </section>
      <section><header><i className="pi pi-clock"/><div><h2>Prazo individual do vínculo</h2><p>Informe por quanto tempo cada pessoa poderá trabalhar após a data de ingresso.</p></div></header>
        <div className="prototype-quadro-pessoal-quadro-fields authorization-fields prototype-quadro-pessoal-extension-term"><Field label="Prazo inicial do vínculo (meses) *"><input type="number" min="1" value={form.prazoInicialVinculoMeses} onChange={(e)=>set("prazoInicialVinculoMeses",e.target.value)} placeholder="Ex.: 30"/>{Number(form.prazoInicialVinculoMeses)>0&&<small>Equivale a {prazoPorExtenso(Number(form.prazoInicialVinculoMeses))}.</small>}</Field></div>
        <label className="prototype-quadro-pessoal-reference-toggle"><input type="checkbox" checked={form.permiteProrrogacaoVinculo} onChange={(e)=>set("permiteProrrogacaoVinculo",e.target.checked)}/><span><strong>O vínculo pode ser prorrogado</strong><small>A data individual de início e o término calculado serão definidos no Ingresso.</small></span></label>
        {form.permiteProrrogacaoVinculo&&<div className="prototype-quadro-pessoal-quadro-fields authorization-fields prototype-quadro-pessoal-extension-term"><Field label="Prazo adicional de prorrogação (meses) *"><input type="number" min="1" value={form.prazoProrrogacaoVinculoMeses} onChange={(e)=>set("prazoProrrogacaoVinculoMeses",e.target.value)} placeholder="Ex.: 30"/>{Number(form.prazoProrrogacaoVinculoMeses)>0&&<small>Equivale a mais {prazoPorExtenso(Number(form.prazoProrrogacaoVinculoMeses))}.</small>}</Field></div>}
      </section>
      <section><header><i className="pi pi-calendar"/><div><h2>Vigência da autorização</h2><p>Defina quando as posições estarão disponíveis para receber novos ingressos.</p></div></header>
        <div className="prototype-quadro-pessoal-quadro-fields authorization-fields"><Field label="Disponível para ingresso a partir de *"><input type="date" value={form.inicioVigencia} onChange={(e)=>set("inicioVigencia",e.target.value)}/></Field><Field label="Disponível para ingresso até"><input type="date" value={form.fimVigencia} onChange={(e)=>set("fimVigencia",e.target.value)}/></Field></div>
      </section>

      <footer className="prototype-quadro-pessoal-quadro-form-actions"><button type="button" className="is-cancel" onClick={onBack}>Cancelar</button><button className="is-submit" type="submit"><i className="pi pi-save"/> {novaVersao?"Criar nova versão":"Salvar"}</button></footer>
    </form>
  </div>;
}

function AutorizacaoDetalhe({registro,onBack}:{registro:AutorizacaoPessoal;onBack:()=>void}){
  const navigate=useNavigate();const documentos=useDocumentosLegais();const {posicoes}=useAutorizacoesPessoalStore();const relacionadas=posicoes.filter((p)=>p.autorizacaoId===registro.id);const cap=capacidade(registro);
  return <div className="prototype-quadro-pessoal-quadro-page">
    <header className="prototype-quadro-pessoal-quadro-header"><div><button className="prototype-quadro-pessoal-quadro-back" onClick={onBack}><i className="pi pi-arrow-left"/> Autorizações de Pessoal</button><div className="prototype-quadro-pessoal-quadro-title-line"><h1>{registro.codigo}</h1><span className={`prototype-quadro-pessoal-quadro-status ${situacaoClass[registro.situacao]}`}>{situacaoLabel[registro.situacao]}</span></div><p>{registro.tipoVinculo} • {registro.programaProjeto||registro.objetoFinalidade}</p></div>{registro.situacao==="VIGENTE"&&<button className="prototype-quadro-pessoal-quadro-primary" onClick={()=>navigate(`${BASE_PATH}/${registro.id}/nova-versao`)}><i className="pi pi-plus"/> Nova versão</button>}</header>
    <section className="prototype-quadro-pessoal-quadro-detail-kpis"><article><span>Modo de controle</span><strong>{modoInfo[registro.modoControle].titulo}</strong></article><article><span>Limite</span><strong>{registro.limite??"Não definido"}</strong></article><article><span>Vínculos ativos</span><strong>{registro.vinculosAtivos}</strong></article><article><span>Em ingresso</span><strong>{registro.ingressosAndamento}</strong></article><article className="is-available"><span>Capacidade restante</span><strong>{cap??"Não se aplica"}</strong></article></section>
    <div className="prototype-quadro-pessoal-quadro-detail-grid">
      <section className="prototype-quadro-pessoal-quadro-detail-card"><header><h2>Vínculo e finalidade</h2></header><dl><div><dt>Tipo de vínculo</dt><dd>{registro.tipoVinculo}</dd></div><div><dt>Natureza</dt><dd>{registro.regimeNatureza}</dd></div><div><dt>Programa/projeto</dt><dd>{registro.programaProjeto||"Não informado"}</dd></div><div className="is-full"><dt>Objeto ou finalidade</dt><dd>{registro.objetoFinalidade}</dd></div><div><dt>Cargo legal de referência</dt><dd>{registro.cargoReferencia||"Não se aplica"}</dd></div><div><dt>Carreira de referência</dt><dd>{registro.carreiraReferencia||"Não se aplica"}</dd></div><div><dt>Prazo inicial do vínculo</dt><dd>{prazoPorExtenso(registro.prazoInicialVinculoMeses)}</dd></div><div><dt>Prorrogação do vínculo</dt><dd>{registro.permiteProrrogacaoVinculo?"Permitida":"Não permitida"}</dd></div><div><dt>Prazo adicional</dt><dd>{registro.prazoProrrogacaoVinculoMeses?prazoPorExtenso(registro.prazoProrrogacaoVinculoMeses):"Não se aplica"}</dd></div></dl></section>
      <section className="prototype-quadro-pessoal-quadro-detail-card"><header><h2>Origem e vigência</h2></header><dl><div><dt>Instrumento</dt><dd>{registro.tipoInstrumento}</dd></div><div><dt>Processo SIGADOC</dt><dd>{registro.processoSigadoc}</dd></div><div><dt>Órgão responsável</dt><dd>{registro.orgaoResponsavel}</dd></div><div className="is-full"><dt>Órgãos de atuação</dt><dd>{registro.locaisAtuacao.map((local)=>local.orgao+(local.unidades.length?" — "+local.unidades.join(", "):" — todas as unidades")).join(" • ")||"Não definidos"}</dd></div><div><dt>Início</dt><dd>{dataBr(registro.inicioVigencia)}</dd></div><div><dt>Término</dt><dd>{dataBr(registro.fimVigencia)}</dd></div></dl><ul>{documentos.filter((d)=>registro.documentosLegaisIds.includes(d.id)).map((d)=><li key={d.id}><strong>{d.titulo}</strong></li>)}</ul></section>
    </div>
    {registro.modoControle==="POSICOES_INDIVIDUALIZADAS"&&<section className="prototype-quadro-pessoal-quadro-detail-card prototype-quadro-pessoal-quadro-history"><header><div><h2>Posições individualizadas</h2><p>Identificadores próprios, sem vínculo com vagas legais.</p></div></header><table><thead><tr><th>Posição</th><th>Situação</th><th>Órgão</th><th>Unidade</th><th>Ocupante atual</th><th>Históricos</th></tr></thead><tbody>{relacionadas.map((p)=><tr key={p.id}><td><strong>{p.id}</strong></td><td>{p.situacao}</td><td>{p.orgao}</td><td>{p.unidade||"—"}</td><td>{p.ocupanteAtual||"Sem ocupante"}</td><td>{p.historicoOcupacoes.length}</td></tr>)}</tbody></table></section>}
    <section className="prototype-quadro-pessoal-quadro-detail-card prototype-quadro-pessoal-quadro-history"><header><div><h2>Histórico de versões</h2><p>As versões anteriores não são apagadas.</p></div></header><table><thead><tr><th>Versão</th><th>Registrada em</th><th>Vigência</th><th>Limite</th><th>Motivo</th></tr></thead><tbody>{[...registro.historicoVersoes].reverse().map((v)=><tr key={v.versao}><td>v{v.versao}</td><td>{dataBr(v.registradaEm)}</td><td>{dataBr(v.inicioVigencia)} {v.fimVigencia?`a ${dataBr(v.fimVigencia)}`:""}</td><td>{v.limite??"Não definido"}</td><td>{v.motivo}</td></tr>)}</tbody></table></section>
  </div>;
}

type Opcao=string|{label:string;value:string};
function Pesquisa({value,onChange,options,placeholder="Selecione"}:{value:string;onChange:(valor:string)=>void;options:Opcao[];placeholder?:string}){const normalizadas=options.map((o)=>typeof o==="string"?{label:o,value:o}:o);return <Dropdown value={value||null} options={normalizadas} optionLabel="label" optionValue="value" placeholder={placeholder} filter filterPlaceholder="Pesquisar" showClear className="prototype-quadro-pessoal-quadro-dropdown" onChange={(e:DropdownChangeEvent)=>onChange(String(e.value??""))}/>;}
function Field({label,children,wide,full}:{label:string;children:React.ReactNode;wide?:boolean;full?:boolean}){return <label className={full?"is-full":wide?"is-wide":""}><span>{label}</span>{children}</label>;}














