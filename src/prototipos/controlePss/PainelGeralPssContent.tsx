import { useNavigate } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE, CONTROLE_PSS_DATA_REFERENCIA_FORMATADA } from "./constants";
import { useControlePssStore } from "./controlePssStore";
import { SITUACOES_CERTAME, TIPOS_CERTAME } from "./certame/dominios";
import type { Certame, SituacaoCertame, TipoCertame } from "./certame/types";
import { SpecArea, SpecificationMode } from "../shared/visualizationModes";
import { painelPssBlockSpecifications, painelPssBusinessItems, painelPssKpiSpecifications, painelPssScreenSpecification } from "./PainelGeralPssSpecifications";
import { CardSeplag } from "@componentes/Card";
import { BadgeSeplag } from "@componentes/Badge";
import { BotaoSeplag } from "@componentes/Botao";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "@componentes/TablePaginado";
import type { ResultsSeplag } from "../../interfaces/Results";
import "./controlePssBase.css";

const situacaoCertameLabel:Record<SituacaoCertame,string>=Object.fromEntries(SITUACOES_CERTAME.map((item)=>[item.value,item.label])) as Record<SituacaoCertame,string>;
const situacaoCertameEstilo:Record<SituacaoCertame,{color:string;bg:string}>={
 ABERTO:{color:"#0b6199",bg:"#e9f3fc"}, RETIFICACAO_EDITAL:{color:"#55637a",bg:"#eef1f5"}, HOMOLOGADO:{color:"#147441",bg:"#e2f5e8"},
 RETIFICACAO_HOMOLOGACAO:{color:"#55637a",bg:"#eef1f5"}, PRORROGACAO_VALIDADE:{color:"#8a5c00",bg:"#fff1cf"}, CANCELADO_ANULADO:{color:"#ad3039",bg:"#ffe3e5"},
 PARALISADO:{color:"#ad3039",bg:"#ffe3e5"}, HOMOLOGACAO_PARCIAL:{color:"#8a5c00",bg:"#fff1cf"}, RETIFICACAO_HOMOLOGACAO_PARCIAL:{color:"#8a5c00",bg:"#fff1cf"},
};
const tipoCertameLabel:Record<TipoCertame,string>=Object.fromEntries(TIPOS_CERTAME.map((item)=>[item.value,item.label])) as Record<TipoCertame,string>;

interface CargoOfertado{id:string;cargoNome:string;vinculo:"EXISTENTE"|"NOVO";quantidadeVagas:number;vagaPcd:boolean;quantidadePcd?:number;certameId:string;certameEdital:string;certameOrgao:string}

function resultadosSemPaginacao<T>(content:readonly T[]):ResultsSeplag<T>{
 return {content:[...content],totalPages:1,totalRecords:content.length,size:Math.max(content.length,10),sizePage:Math.max(content.length,10),pageActual:0,first:true,last:true,numberOfElements:content.length,empty:content.length===0};
}

export function PainelGeralPssContent(){
 const state=useControlePssStore();const navigate=useNavigate();
 const certames=state.certames;
 const certamesHomologados=certames.filter((certame)=>certame.situacaoAtual==="HOMOLOGADO").length;
 const vagasCertames=certames.reduce((total,certame)=>total+certame.cargos.reduce((subtotal,cargo)=>subtotal+cargo.quantidadeVagas,0),0);
 const cargosOfertados:CargoOfertado[]=certames.flatMap((certame)=>certame.cargos.map((cargo)=>({...cargo,certameId:certame.id,certameEdital:certame.numeroEditalOrgao,certameOrgao:certame.setor})));
 const vagasPcd=cargosOfertados.reduce((total,cargo)=>total+(cargo.vagaPcd?cargo.quantidadePcd??0:0),0);

 const cargoMaisVagas=(()=>{
  const porCargo=new Map<string,number>();
  cargosOfertados.forEach((cargo)=>porCargo.set(cargo.cargoNome,(porCargo.get(cargo.cargoNome)??0)+cargo.quantidadeVagas));
  return Array.from(porCargo,([cargoNome,vagas])=>({cargoNome,vagas})).sort((a,b)=>b.vagas-a.vagas)[0];
 })();

 const indicadoresCargos=[
  {label:"Cargos cadastrados",valor:cargosOfertados.length,hint:"Linhas de cargo/vaga nos certames",icon:"pi pi-list",cor:"blue",onClick:()=>navigate(`${BASE}/certames`)},
  {label:"Vagas PCD ofertadas",valor:vagasPcd,hint:"Vagas reservadas para PCD/PNE",icon:"pi pi-heart",cor:"red",onClick:()=>navigate(`${BASE}/certames`)},
  {label:"Cargo com mais vagas",valor:cargoMaisVagas?.vagas??0,hint:cargoMaisVagas?.cargoNome??"Nenhum cargo cadastrado",icon:"pi pi-star",cor:"cyan",onClick:()=>navigate(`${BASE}/certames`)},
 ];

 const indicadores=[
  {label:"Certames cadastrados",valor:certames.length,hint:"Concursos e PSS cadastrados no SIGEP",icon:"pi pi-id-card",cor:"blue",onClick:()=>navigate(`${BASE}/certames`)},
  {label:"Certames homologados",valor:certamesHomologados,hint:"Situação atual Homologado",icon:"pi pi-check-circle",cor:"green",onClick:()=>navigate(`${BASE}/certames`)},
  {label:"Vagas ofertadas nos certames",valor:vagasCertames,hint:"Somatório de vagas dos cargos cadastrados",icon:"pi pi-briefcase",cor:"purple",onClick:()=>navigate(`${BASE}/certames`)},
 ];

 const colunasCertames:ColumnMetaSeplag<Certame>[]=[
  {header:"Certame",body:(row)=><div><strong>{row.numeroEditalOrgao}</strong><div className="text-sm text-color-secondary">{row.nomeEdital}</div></div>},
  {field:"setor",header:"Órgão mandante"},
  {header:"Tipo",body:(row)=>tipoCertameLabel[row.tipoCertame]},
  {header:"Situação",body:(row)=><BadgeSeplag label={situacaoCertameLabel[row.situacaoAtual]} color={situacaoCertameEstilo[row.situacaoAtual].color} bg={situacaoCertameEstilo[row.situacaoAtual].bg} border="transparent" size="sm" />},
  {header:"Vagas",body:(row)=>row.cargos.reduce((total,cargo)=>total+cargo.quantidadeVagas,0).toLocaleString("pt-BR")},
 ];

 const colunasCargos:ColumnMetaSeplag<CargoOfertado>[]=[
  {field:"cargoNome",header:"Cargo"},
  {header:"Certame",body:(row)=><div><strong>{row.certameEdital}</strong><div className="text-sm text-color-secondary">{row.certameOrgao}</div></div>},
  {header:"Vínculo",body:(row)=>row.vinculo==="EXISTENTE"?"Vaga existente":"Vaga nova do certame"},
  {field:"quantidadeVagas",header:"Vagas"},
  {header:"PCD",body:(row)=>row.vagaPcd?`Sim (${row.quantidadePcd??0})`:"Não"},
 ];

 return <SpecificationMode screen={painelPssScreenSpecification} businessItems={painelPssBusinessItems}>
  <div className="prototype-page-content prototype-page-content--white"><div className="flex flex-column">

   <CardSeplag title="Painel Geral" subtitle="Controle PSS" actions={<BotaoSeplag type="button" label="Exportar visão" icon="pi pi-download" onClick={()=>window.print()} />}>
    <p className="col-12 text-color-secondary" style={{margin:"0 0 .75rem"}}>Posição consolidada dos certames (Concursos Públicos e Processos Seletivos Simplificados) cadastrados no SIGEP. Dados consolidados em {CONTROLE_PSS_DATA_REFERENCIA_FORMATADA} 08:15.</p>
    <div className="col-12"><div className="prototype-pss-kpis">{indicadores.map((item)=><SpecArea key={item.label} metadata={painelPssKpiSpecifications[item.label]}><button type="button" className={`prototype-pss-kpi ${item.cor}`} onClick={item.onClick}><i className={item.icon} /><div><span>{item.label}</span><strong>{item.valor.toLocaleString("pt-BR")}</strong><small>{item.hint}</small></div><i className="pi pi-arrow-right arrow" /></button></SpecArea>)}</div></div>
   </CardSeplag>

   <SpecArea metadata={painelPssBlockSpecifications.tabelaCertames}><CardSeplag title="Certames em acompanhamento" subtitle={`${certames.length} certames`}>
    <TablePaginadoSeplag dataKey="id" data={resultadosSemPaginacao(certames)} rows={10} rowsPerPage={[10, 20, 50]} paginator={certames.length > 10} lazy={false} selectionMode={null} columns={colunasCertames}
     hasEventoAcao handleView={(row) => navigate(`${BASE}/certames/${row.id}`)} handleEdit={null} handleDelete={null} handleOnPageChange={() => {}} />
    {certames.length===0 && <p className="col-12 text-center text-color-secondary">Nenhum certame cadastrado.</p>}
   </CardSeplag></SpecArea>

   <SpecArea metadata={painelPssBlockSpecifications.tabelaCargos}><CardSeplag title="Cargos ofertados" subtitle={`${cargosOfertados.length} cargos/vagas`}>
    <div className="col-12"><div className="prototype-pss-kpis">{indicadoresCargos.map((item) => <SpecArea key={item.label} metadata={painelPssKpiSpecifications[item.label]}><button type="button" className={`prototype-pss-kpi ${item.cor}`} onClick={item.onClick}><i className={item.icon} /><div><span>{item.label}</span><strong>{item.valor.toLocaleString("pt-BR")}</strong><small>{item.hint}</small></div><i className="pi pi-arrow-right arrow" /></button></SpecArea>)}</div></div>

    <TablePaginadoSeplag dataKey="id" data={resultadosSemPaginacao(cargosOfertados)} rows={10} rowsPerPage={[10, 20, 50]} paginator={cargosOfertados.length > 10} lazy={false} selectionMode={null} columns={colunasCargos}
     hasEventoAcao handleView={(row) => navigate(`${BASE}/certames/${row.certameId}`)} handleEdit={null} handleDelete={null} handleOnPageChange={() => {}} />
    {cargosOfertados.length===0 && <p className="col-12 text-center text-color-secondary">Nenhum cargo/vaga cadastrado.</p>}
   </CardSeplag></SpecArea>

  </div></div>
 </SpecificationMode>;
}
