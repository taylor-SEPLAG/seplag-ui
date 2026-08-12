import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE, CONTROLE_PSS_DATA_REFERENCIA, CONTROLE_PSS_DATA_REFERENCIA_FORMATADA } from "./constants";
import { useControlePssStore } from "./controlePssStore";
import { ORGAOS_CERTAME, SITUACOES_CERTAME } from "./certame/dominios";
import type { Certame, CotaCertame, SituacaoCertame } from "./certame/types";
import {
 bucketStatusCertame, certameAtivo, documentosObrigatoriosTotal, documentosPendentes,
 homologacaoDeVagasPendente, inscricoesAbertas, prazoPrestacaoContasAtual, prazoVenceEmAteDias, proximosPrazos, totalVagas, totalVagasPcd,
 type BucketStatusCertame, type PrazoPainel,
} from "./certame/painelSelectors";
import { SpecArea, SpecificationMode } from "../shared/visualizationModes";
import { painelPssActionSpecifications, painelPssBlockSpecifications, painelPssBusinessItems, painelPssFilterSpecifications, painelPssKpiSpecifications, painelPssScreenSpecification } from "./PainelGeralPssSpecifications";
import { CardSeplag } from "@componentes/Card";
import { BadgeSeplag } from "@componentes/Badge";
import { BotaoAdicionarSeplag, BotaoLimparFiltroSeplag } from "@componentes/Botao";
import { DropdownFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "@componentes/TablePaginado";
import type { ResultsSeplag } from "../../interfaces/Results";
import "./controlePssBase.css";
import "./painelGeralPss.css";

interface FiltroForm { termo:string; orgao?:string; status?:BucketStatusCertame }
interface CotaLinha { id:string; certame:Certame; cota:CotaCertame }

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

const normalizar = (valor:string) => valor.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");

function parseDataReferencia(iso:string):Date {
 const [ano, mes, dia] = iso.split("-").map(Number);
 return new Date(ano, mes - 1, dia);
}

function resultados<T>(content:T[]):ResultsSeplag<T> {
 return { content, totalPages:Math.max(1, Math.ceil(content.length / 10)), totalRecords:content.length, size:10, sizePage:10, pageActual:0, first:true, last:true, numberOfElements:content.length, empty:content.length === 0 };
}

export function PainelGeralPssContent() {
 const { certames } = useControlePssStore();
 const navigate = useNavigate();
 const dataReferencia = useMemo(() => parseDataReferencia(CONTROLE_PSS_DATA_REFERENCIA), []);
 const { control, reset, watch } = useForm<FiltroForm>({ defaultValues:{ termo:"" } });
 const filtros = watch();

 const certamesFiltrados = useMemo(() => {
  const termo = normalizar(filtros.termo.trim());
  return certames.filter((certame) =>
   (!termo || normalizar(`${certame.numeroEditalOrgao} ${certame.nomeEdital} ${certame.setor}`).includes(termo)) &&
   (!filtros.orgao || certame.setor === filtros.orgao) &&
   (!filtros.status || bucketStatusCertame(certame) === filtros.status),
  );
 }, [certames, filtros]);
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

 const prazos = useMemo(() => proximosPrazos(certamesFiltrados, dataReferencia, 8), [certamesFiltrados, dataReferencia]);
 const colunasPrazos:ColumnMetaSeplag<PrazoPainel>[] = [
  { field:"titulo", header:"Prazo" }, { field:"orgao", header:"Órgão" }, { field:"data", header:"Vence em" },
  { header:"Dias restantes", body:(row) => row.diasRestantes.toLocaleString("pt-BR") },
 ];

 const cotasCertames = useMemo(() => certamesFiltrados.filter((certame) => certame.cotas.length > 0), [certamesFiltrados]);
 const cotasLinhas:CotaLinha[] = useMemo(() => cotasCertames.flatMap((certame) => certame.cotas.map((cota) => ({ id:cota.id, certame, cota }))), [cotasCertames]);
 const totalVagasAtivas = certamesAtivos.reduce((total, certame) => total + totalVagas(certame), 0);
 const totalVagasPcdAtivas = certamesAtivos.reduce((total, certame) => total + totalVagasPcd(certame), 0);
 const colunasCotas:ColumnMetaSeplag<CotaLinha>[] = [
  { header:"Certame", body:(row) => <div><strong>{row.certame.numeroEditalOrgao}</strong><div className="text-sm text-color-secondary">{row.certame.setor}</div></div> },
  { header:"Tipo de cota", body:(row) => row.cota.tipo },
  { header:"Vagas PCD", body:(row) => row.cota.tipo === "PCD" ? totalVagasPcd(row.certame).toLocaleString("pt-BR") : "—" },
 ];

 const alertas = [
  { titulo:"Documentos em falta", valor:certamesFiltrados.filter((certame) => documentosPendentes(certame).length > 0).length, texto:"certames com pendência documental", icon:"pi pi-file-excel", kind:"critical" as const, specKey:"alertaDocumentos" as const },
  { titulo:"SIGADOC pendente", valor:certamesFiltrados.reduce((total, certame) => total + documentosPendentes(certame).length, 0), texto:"documentos aguardando anexação/assinatura", icon:"pi pi-cloud-upload", kind:"warning" as const, specKey:"alertaSigadoc" as const },
  { titulo:"Homologação de vagas pendentes", valor:certamesFiltrados.filter((certame) => homologacaoDeVagasPendente(certame, dataReferencia)).length, texto:"resultado divulgado sem homologação registrada", icon:"pi pi-clock", kind:"warning" as const, specKey:"alertaHomologacao" as const },
 ];

 const colunasCertames:ColumnMetaSeplag<Certame>[] = [
  { header:"Certame", body:(row) => <div><strong>{row.numeroEditalOrgao}</strong><div className="text-sm text-color-secondary">{row.nomeEdital}</div></div> },
  { field:"setor", header:"Órgão" },
  { header:"Situação", body:(row) => <BadgeSeplag label={situacaoLabel[row.situacaoAtual]} color={situacaoEstilo[row.situacaoAtual].color} bg={situacaoEstilo[row.situacaoAtual].bg} border="transparent" size="sm" /> },
  { header:"Vagas", body:(row) => totalVagas(row).toLocaleString("pt-BR") },
  { header:"Prazo atual", body:(row) => prazoPrestacaoContasAtual(row) ?? "—" },
  { header:"Documentos", body:(row) => {
   const pendentes = documentosPendentes(row).length;
   const total = documentosObrigatoriosTotal(row);
   const anexados = total - pendentes;
   return <div className="prototype-painel-doc-progresso"><div><i className={pendentes > 0 ? "incompleto" : undefined} style={{ width:`${total === 0 ? 0 : Math.round((anexados / total) * 100)}%` }} /></div><small>{anexados}/{total}</small></div>;
  } },
 ];

 return <SpecificationMode screen={painelPssScreenSpecification} businessItems={painelPssBusinessItems}>
  <div className="prototype-page-content prototype-page-content--white"><div className="flex flex-column">

   <CardSeplag title="Painel de Certames Públicos" subtitle="Controle PSS"
    actions={<SpecArea metadata={painelPssActionSpecifications["Novo certame"]}><BotaoAdicionarSeplag label="Novo certame" onClick={() => navigate(`${BASE}/certames/novo`)} /></SpecArea>}>
    <p className="col-12 text-color-secondary" style={{ margin:"0 0 .75rem" }}>Posição consolidada dos Concursos Públicos e Processos Seletivos Simplificados cadastrados diretamente no SIGEP. Dados de referência: {CONTROLE_PSS_DATA_REFERENCIA_FORMATADA}.</p>

    <div className="col-12"><div className="grid">
     <TextFieldSeplag name="termo" control={control} label="Buscar certame" cols="12 6 4" placeholder="Edital, número ou órgão" getFormErrorMessage={() => null} />
     <SpecArea metadata={painelPssFilterSpecifications["Órgão"]}><DropdownFieldSeplag name="orgao" control={control} label="Órgão" cols="12 6 4" options={ORGAOS_CERTAME.map((item) => ({ label:item, value:item }))} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} /></SpecArea>
     <SpecArea metadata={painelPssFilterSpecifications["Situação"]}><DropdownFieldSeplag name="status" control={control} label="Situação" cols="12 6 4" options={BUCKET_ORDEM.map((bucket) => ({ label:BUCKET_LABEL[bucket], value:bucket }))} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} /></SpecArea>
     <div className="col-12 flex justify-content-end"><BotaoLimparFiltroSeplag label="Limpar filtros" onClick={() => reset({ termo:"" })} /></div>
    </div></div>

    <div className="col-12"><div className="prototype-pss-kpis">{kpis.map((item) => <SpecArea key={item.label} metadata={painelPssKpiSpecifications[item.label]}><button type="button" className={`prototype-pss-kpi ${item.cor}`} onClick={() => navigate(`${BASE}/certames`)}><i className={item.icon} /><div><span>{item.label}</span><strong>{item.valor.toLocaleString("pt-BR")}</strong><small>{item.hint}</small></div><i className="pi pi-arrow-right arrow" /></button></SpecArea>)}</div></div>
   </CardSeplag>

   <div className="grid">
    <div className="col-12 lg:col-6"><SpecArea metadata={painelPssBlockSpecifications.statusDistribuicao}><CardSeplag title="Certames por status" subtitle={`${certamesFiltrados.length} certames no filtro atual`}>
     <div className="col-12"><div className="prototype-pss-bars">{distribuicaoStatus.map((item) => <button key={item.bucket} type="button" onClick={() => reset({ ...filtros, status:item.bucket })}><span>{BUCKET_LABEL[item.bucket]}</span><div><i className={BUCKET_COR[item.bucket]} style={{ width:`${item.pct}%` }} /></div><strong>{item.valor}</strong></button>)}</div></div>
    </CardSeplag></SpecArea></div>

    <div className="col-12 lg:col-6"><SpecArea metadata={painelPssBlockSpecifications.proximosPrazos}><CardSeplag title="Próximos prazos" subtitle="Prestação de contas ao TCE-MT (RN-15)">
     <div className="col-12"><TablePaginadoSeplag dataKey="certameId" data={resultados(prazos)} rows={8} paginator={false} lazy={false} selectionMode={null} columns={colunasPrazos} hasEventoAcao={false} handleOnPageChange={() => {}} /></div>
     {prazos.length === 0 && <p className="col-12 text-center text-color-secondary">Nenhum prazo em aberto para o filtro atual.</p>}
    </CardSeplag></SpecArea></div>
   </div>

   <div className="grid">
    <div className="col-12 lg:col-6"><SpecArea metadata={painelPssBlockSpecifications.cotasResumo}><CardSeplag title="Cotas e vagas" subtitle={`${cotasCertames.length} certames com cota cadastrada`}>
     <div className="col-12"><div className="prototype-painel-cotas-resumo">
      <div><span>Total de vagas</span><strong>{totalVagasAtivas.toLocaleString("pt-BR")}</strong></div>
      <div><span>Vagas PCD/PNE</span><strong>{totalVagasPcdAtivas.toLocaleString("pt-BR")}</strong></div>
      <div><span>Certames com cota</span><strong>{cotasCertames.length}</strong></div>
     </div></div>
     <div className="col-12"><TablePaginadoSeplag dataKey="id" data={resultados(cotasLinhas)} rows={10} paginator={cotasLinhas.length > 10} lazy={false} selectionMode={null} columns={colunasCotas} hasEventoAcao={false} handleOnPageChange={() => {}} /></div>
     {cotasLinhas.length === 0 && <p className="col-12 text-center text-color-secondary">Nenhuma cota cadastrada para o filtro atual.</p>}
    </CardSeplag></SpecArea></div>

    <div className="col-12 lg:col-5"><CardSeplag title="Alertas de pendências" subtitle="Sinais que pedem atenção no filtro atual">
     <div className="col-12"><div className="prototype-pss-alert-list">
      {alertas.map((alerta) => <SpecArea key={alerta.titulo} metadata={painelPssBlockSpecifications[alerta.specKey]}>
       <button type="button" className={alerta.kind} onClick={() => navigate(`${BASE}/certames`)}><i className={alerta.icon} /><div><strong>{alerta.titulo}</strong><span>{alerta.texto}</span></div><b>{alerta.valor}</b><i className="pi pi-chevron-right" /></button>
      </SpecArea>)}
     </div></div>
    </CardSeplag></div>
   </div>

   <SpecArea metadata={painelPssBlockSpecifications.tabelaCertames}><CardSeplag title="Certames em andamento" subtitle={`${certamesFiltrados.length} certames`}>
    <div className="col-12"><TablePaginadoSeplag dataKey="id" data={resultados(certamesFiltrados)} rows={10} rowsPerPage={[10, 20, 50]} paginator={certamesFiltrados.length > 10} lazy={false} selectionMode={null} columns={colunasCertames}
     hasEventoAcao handleView={(row) => navigate(`${BASE}/certames/${row.id}`)} handleEdit={null} handleDelete={null} handleOnPageChange={() => {}} /></div>
    {certamesFiltrados.length === 0 && <p className="col-12 text-center text-color-secondary">Nenhum certame encontrado para os filtros/busca atuais.</p>}
   </CardSeplag></SpecArea>

   <p className="prototype-painel-footer">SEPLAG-MT — Secretaria de Estado de Planejamento e Gestão de Mato Grosso</p>

  </div></div>
 </SpecificationMode>;
}
