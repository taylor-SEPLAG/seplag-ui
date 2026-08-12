import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE, CONTROLE_PSS_DATA_REFERENCIA, CONTROLE_PSS_DATA_REFERENCIA_FORMATADA } from "./constants";
import { useControlePssStore } from "./controlePssStore";
import { ORGAOS_CERTAME, SITUACOES_CERTAME } from "./certame/dominios";
import type { Certame, SituacaoCertame } from "./certame/types";
import {
 bucketStatusCertame, certameAtivo, documentosObrigatoriosTotal, documentosPendentes,
 homologacaoDeVagasPendente, inscricoesAbertas, prazoVenceEmAteDias, proximosPrazos, totalVagas, totalVagasPcd,
 type BucketStatusCertame,
} from "./certame/painelSelectors";
import { SpecArea, SpecificationMode } from "../shared/visualizationModes";
import { painelPssActionSpecifications, painelPssBlockSpecifications, painelPssBusinessItems, painelPssFilterSpecifications, painelPssKpiSpecifications, painelPssScreenSpecification } from "./PainelGeralPssSpecifications";
import "./controlePssBase.css";
import "./painelGeralPss.css";

const situacaoLabel:Record<SituacaoCertame, string> = Object.fromEntries(SITUACOES_CERTAME.map((item) => [item.value, item.label])) as Record<SituacaoCertame, string>;
const situacaoEstilo:Record<SituacaoCertame, { color:string; bg:string }> = {
 ABERTO:{ color:"#0b6199", bg:"#e9f3fc" }, RETIFICACAO_EDITAL:{ color:"#55637a", bg:"#eef1f5" }, HOMOLOGADO:{ color:"#147441", bg:"#e2f5e8" },
 RETIFICACAO_HOMOLOGACAO:{ color:"#55637a", bg:"#eef1f5" }, PRORROGACAO_VALIDADE:{ color:"#8a5c00", bg:"#fff1cf" }, CANCELADO_ANULADO:{ color:"#ad3039", bg:"#ffe3e5" },
 PARALISADO:{ color:"#ad3039", bg:"#ffe3e5" }, HOMOLOGACAO_PARCIAL:{ color:"#8a5c00", bg:"#fff1cf" }, RETIFICACAO_HOMOLOGACAO_PARCIAL:{ color:"#8a5c00", bg:"#fff1cf" },
};

const BUCKET_ORDEM:readonly BucketStatusCertame[] = ["ELABORACAO", "PUBLICADA", "ANALISE", "HOMOLOGADO", "CANCELADO"];
const BUCKET_LABEL:Record<BucketStatusCertame, string> = {
 ELABORACAO:"Em elaboração", PUBLICADA:"Publicada / Inscrições abertas", ANALISE:"Em análise / Recursos", HOMOLOGADO:"Homologado", CANCELADO:"Cancelado",
};
const BUCKET_COR:Record<BucketStatusCertame, string> = { ELABORACAO:"", PUBLICADA:"", ANALISE:"orange", HOMOLOGADO:"green", CANCELADO:"red" };

const navegacaoControlePss:readonly { label:string; rota:string; ativo?:boolean }[] = [
 { label:"Painel Geral", rota:"painel", ativo:true },
 { label:"Cadastro de Certames", rota:"certames" },
 { label:"Processos Seletivos", rota:"processos" },
 { label:"Controle de Vagas", rota:"vagas" },
 { label:"Integração SIES", rota:"integracao-sies" },
];

const normalizar = (valor:string) => valor.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");

function parseDataReferencia(iso:string):Date {
 const [ano, mes, dia] = iso.split("-").map(Number);
 return new Date(ano, mes - 1, dia);
}

export function PainelGeralPssContent() {
 const { certames } = useControlePssStore();
 const navigate = useNavigate();
 const dataReferencia = useMemo(() => parseDataReferencia(CONTROLE_PSS_DATA_REFERENCIA), []);

 const [filtroOrgao, setFiltroOrgao] = useState("");
 const [filtroStatus, setFiltroStatus] = useState<BucketStatusCertame | "">("");
 const [busca, setBusca] = useState("");

 const certamesFiltrados = useMemo(
  () => certames.filter((certame) => (!filtroOrgao || certame.setor === filtroOrgao) && (!filtroStatus || bucketStatusCertame(certame) === filtroStatus)),
  [certames, filtroOrgao, filtroStatus],
 );
 const certamesAtivos = useMemo(() => certamesFiltrados.filter(certameAtivo), [certamesFiltrados]);

 const kpis = [
  { label:"Certames ativos", valor:certamesAtivos.length, hint:"Situação diferente de Cancelado/Anulado", icon:"pi pi-id-card", cor:"blue" },
  { label:"Total de vagas ofertadas", valor:certamesAtivos.reduce((total, certame) => total + totalVagas(certame), 0), hint:"Somatório de vagas dos certames ativos", icon:"pi pi-briefcase", cor:"purple" },
  { label:"Inscrições abertas", valor:certamesFiltrados.filter((certame) => inscricoesAbertas(certame, dataReferencia)).length, hint:`Janela de inscrições vigente em ${CONTROLE_PSS_DATA_REFERENCIA_FORMATADA}`, icon:"pi pi-pencil", cor:"cyan" },
  { label:"Documentos pendentes", valor:certamesFiltrados.filter((certame) => documentosPendentes(certame).length > 0).length, hint:"Certames com documento obrigatório sem anexo", icon:"pi pi-file-excel", cor:"orange" },
  { label:"Prazos vencidos em 15 dias", valor:certamesFiltrados.filter((certame) => prazoVenceEmAteDias(certame, dataReferencia, 15)).length, hint:"Prestação de contas ao TCE-MT a vencer", icon:"pi pi-exclamation-triangle", cor:"red" },
 ];

 const distribuicaoStatus = useMemo(() => {
  const contagem:Record<BucketStatusCertame, number> = { ELABORACAO:0, PUBLICADA:0, ANALISE:0, HOMOLOGADO:0, CANCELADO:0 };
  certamesFiltrados.forEach((certame) => { contagem[bucketStatusCertame(certame)] += 1; });
  const total = certamesFiltrados.length;
  return BUCKET_ORDEM.map((bucket) => ({ bucket, valor:contagem[bucket], pct:total === 0 ? 0 : Math.round((contagem[bucket] / total) * 100) }));
 }, [certamesFiltrados]);

 const prazos = useMemo(() => proximosPrazos(certamesFiltrados, dataReferencia, 6), [certamesFiltrados, dataReferencia]);

 const cotasCertames = useMemo(() => certamesFiltrados.filter((certame) => certame.cotas.length > 0), [certamesFiltrados]);
 const cotasLinhas = useMemo(() => cotasCertames.flatMap((certame) => certame.cotas.map((cota) => ({ certame, cota }))), [cotasCertames]);
 const totalVagasAtivas = certamesAtivos.reduce((total, certame) => total + totalVagas(certame), 0);
 const totalVagasPcdAtivas = certamesAtivos.reduce((total, certame) => total + totalVagasPcd(certame), 0);

 const alertas = [
  { titulo:"Documentos em falta", valor:certamesFiltrados.filter((certame) => documentosPendentes(certame).length > 0).length, texto:"certames com pendência documental", icon:"pi pi-file-excel", kind:"critical" as const },
  { titulo:"SIGADOC pendente", valor:certamesFiltrados.reduce((total, certame) => total + documentosPendentes(certame).length, 0), texto:"documentos aguardando anexação/assinatura", icon:"pi pi-cloud-upload", kind:"warning" as const },
  { titulo:"Homologação de vagas pendentes", valor:certamesFiltrados.filter((certame) => homologacaoDeVagasPendente(certame, dataReferencia)).length, texto:"resultado divulgado sem homologação registrada", icon:"pi pi-clock", kind:"warning" as const },
 ];

 const certamesTabela = useMemo(() => {
  const termo = normalizar(busca.trim());
  return certamesFiltrados.filter((certame) => !termo || normalizar(`${certame.numeroEditalOrgao} ${certame.nomeEdital} ${certame.setor}`).includes(termo));
 }, [certamesFiltrados, busca]);

 return <SpecificationMode screen={painelPssScreenSpecification} businessItems={painelPssBusinessItems}>
  <div className="prototype-pss-page">

   <div className="prototype-painel-hero">
    <div className="prototype-painel-hero-top">
     <div>
      <span>Controle PSS</span>
      <h1>Painel de Certames Públicos</h1>
      <p>Posição consolidada dos Concursos Públicos e Processos Seletivos Simplificados cadastrados diretamente no SIGEP. Dados de referência: {CONTROLE_PSS_DATA_REFERENCIA_FORMATADA}.</p>
     </div>
     <SpecArea metadata={painelPssActionSpecifications["Novo certame"]}><button type="button" className="prototype-painel-hero-novo" onClick={() => navigate(`${BASE}/certames/novo`)}><i className="pi pi-plus" /> Novo certame</button></SpecArea>
    </div>

    <nav className="prototype-painel-hero-nav" aria-label="Navegação do Controle PSS">
     {navegacaoControlePss.map((item) => <button key={item.rota} type="button" className={item.ativo ? "is-active" : undefined} onClick={() => navigate(`${BASE}/${item.rota}`)}>{item.label}</button>)}
    </nav>

    <div className="prototype-painel-hero-filtros">
     <SpecArea metadata={painelPssFilterSpecifications["Órgão"]}><label><span>Órgão</span><select value={filtroOrgao} onChange={(event) => setFiltroOrgao(event.target.value)}><option value="">Todos os órgãos</option>{ORGAOS_CERTAME.map((orgao) => <option key={orgao} value={orgao}>{orgao}</option>)}</select></label></SpecArea>
     <SpecArea metadata={painelPssFilterSpecifications["Situação"]}><label><span>Situação</span><select value={filtroStatus} onChange={(event) => setFiltroStatus(event.target.value as BucketStatusCertame | "")}><option value="">Todas as situações</option>{BUCKET_ORDEM.map((bucket) => <option key={bucket} value={bucket}>{BUCKET_LABEL[bucket]}</option>)}</select></label></SpecArea>
     {(filtroOrgao || filtroStatus) && <button type="button" className="prototype-painel-hero-limpar" onClick={() => { setFiltroOrgao(""); setFiltroStatus(""); }}>Limpar filtros</button>}
    </div>
   </div>

   <div className="prototype-pss-kpis">{kpis.map((item) => <SpecArea key={item.label} metadata={painelPssKpiSpecifications[item.label]}><button type="button" className={`prototype-pss-kpi ${item.cor}`} onClick={() => navigate(`${BASE}/certames`)}><i className={item.icon} /><div><span>{item.label}</span><strong>{item.valor.toLocaleString("pt-BR")}</strong><small>{item.hint}</small></div><i className="pi pi-arrow-right arrow" /></button></SpecArea>)}</div>

   <div className="prototype-pss-grid top">
    <SpecArea metadata={painelPssBlockSpecifications.statusDistribuicao}><section className="prototype-pss-card">
     <header><div><h2>Certames por status</h2><p>{certamesFiltrados.length} certames no filtro atual</p></div></header>
     <div className="prototype-pss-bars">{distribuicaoStatus.map((item) => <button key={item.bucket} type="button" onClick={() => setFiltroStatus(item.bucket)}><span>{BUCKET_LABEL[item.bucket]}</span><div><i className={BUCKET_COR[item.bucket]} style={{ width:`${item.pct}%` }} /></div><strong>{item.valor}</strong></button>)}</div>
    </section></SpecArea>

    <SpecArea metadata={painelPssBlockSpecifications.proximosPrazos}><section className="prototype-pss-card">
     <header><div><h2>Próximos prazos</h2><p>Prestação de contas ao TCE-MT (RN-15)</p></div></header>
     <div className="prototype-pss-alert-list">
      {prazos.map((prazo) => <button key={prazo.certameId} type="button" className={prazo.diasRestantes <= 3 ? "critical" : prazo.diasRestantes <= 15 ? "warning" : "info"} onClick={() => navigate(`${BASE}/certames/${prazo.certameId}?aba=SITUACOES`)}>
       <i className="pi pi-calendar" /><div><strong>{prazo.titulo}</strong><span>{prazo.orgao}</span></div><b>{prazo.data}</b><i className="pi pi-chevron-right" />
      </button>)}
      {prazos.length === 0 && <p className="prototype-pss-empty">Nenhum prazo em aberto para o filtro atual.</p>}
     </div>
    </section></SpecArea>
   </div>

   <div className="prototype-pss-grid top">
    <SpecArea metadata={painelPssBlockSpecifications.cotasResumo}><section className="prototype-pss-card">
     <header><div><h2>Cotas e vagas</h2><p>{cotasCertames.length} certames com cota cadastrada</p></div></header>
     <div className="prototype-painel-cotas-resumo">
      <div><span>Total de vagas</span><strong>{totalVagasAtivas.toLocaleString("pt-BR")}</strong></div>
      <div><span>Vagas PCD/PNE</span><strong>{totalVagasPcdAtivas.toLocaleString("pt-BR")}</strong></div>
      <div><span>Certames com cota</span><strong>{cotasCertames.length}</strong></div>
     </div>
     <div className="prototype-pss-table"><table>
      <thead><tr><th>Certame</th><th>Tipo de cota</th><th>Vagas PCD</th></tr></thead>
      <tbody>{cotasLinhas.map(({ certame, cota }) => <tr key={cota.id}>
       <td><button type="button" className="prototype-pss-link" onClick={() => navigate(`${BASE}/certames/${certame.id}`)}>{certame.numeroEditalOrgao}</button><small>{certame.setor}</small></td>
       <td>{cota.tipo}</td>
       <td>{cota.tipo === "PCD" ? totalVagasPcd(certame).toLocaleString("pt-BR") : "—"}</td>
      </tr>)}</tbody>
     </table></div>
     {cotasLinhas.length === 0 && <p className="prototype-pss-empty">Nenhuma cota cadastrada para o filtro atual.</p>}
    </section></SpecArea>

    <section className="prototype-pss-card">
     <header><div><h2>Alertas de pendências</h2><p>Sinais que pedem atenção no filtro atual</p></div></header>
     <div className="prototype-pss-alert-list">
      {alertas.map((alerta) => <SpecArea key={alerta.titulo} metadata={painelPssBlockSpecifications[alerta.titulo === "Documentos em falta" ? "alertaDocumentos" : alerta.titulo === "SIGADOC pendente" ? "alertaSigadoc" : "alertaHomologacao"]}>
       <button type="button" className={alerta.kind} onClick={() => navigate(`${BASE}/certames`)}>
        <i className={alerta.icon} /><div><strong>{alerta.titulo}</strong><span>{alerta.texto}</span></div><b>{alerta.valor}</b><i className="pi pi-chevron-right" />
       </button>
      </SpecArea>)}
     </div>
    </section>
   </div>

   <SpecArea metadata={painelPssBlockSpecifications.tabelaCertames}><section className="prototype-pss-card">
    <header>
     <div><h2>Certames em andamento</h2><p>{certamesTabela.length} de {certamesFiltrados.length} certames</p></div>
     <SpecArea metadata={painelPssFilterSpecifications["Buscar certame"]}><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por edital, número ou órgão" style={{ minWidth:"16rem" }} /></SpecArea>
    </header>
    <div className="prototype-pss-table"><table>
     <thead><tr><th>Certame</th><th>Órgão</th><th>Situação</th><th>Vagas</th><th>Prazo atual</th><th>Documentos</th></tr></thead>
     <tbody>{certamesTabela.map((certame) => {
      const pendentes = documentosPendentes(certame).length;
      const totalDocs = documentosObrigatoriosTotal(certame);
      const anexados = totalDocs - pendentes;
      return <tr key={certame.id}>
       <td><button type="button" className="prototype-pss-link" onClick={() => navigate(`${BASE}/certames/${certame.id}`)}>{certame.numeroEditalOrgao}</button><small>{certame.nomeEdital}</small></td>
       <td>{certame.setor}</td>
       <td><span className="prototype-pss-badge" style={{ background:situacaoEstilo[certame.situacaoAtual].bg, color:situacaoEstilo[certame.situacaoAtual].color }}>{situacaoLabel[certame.situacaoAtual]}</span></td>
       <td className="num">{totalVagas(certame).toLocaleString("pt-BR")}</td>
       <td>{certame.historicoSituacoes[certame.historicoSituacoes.length - 1]?.prazoPrestacaoContas ?? "—"}</td>
       <td><div className="prototype-painel-doc-progresso"><div><i className={pendentes > 0 ? "incompleto" : undefined} style={{ width:`${totalDocs === 0 ? 0 : Math.round((anexados / totalDocs) * 100)}%` }} /></div><small>{anexados}/{totalDocs}</small></div></td>
      </tr>;
     })}</tbody>
    </table></div>
    {certamesTabela.length === 0 && <p className="prototype-pss-empty">Nenhum certame encontrado para os filtros/busca atuais.</p>}
   </section></SpecArea>

   <footer className="prototype-painel-footer">SEPLAG-MT — Secretaria de Estado de Planejamento e Gestão de Mato Grosso</footer>

  </div>
 </SpecificationMode>;
}
