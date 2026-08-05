import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE } from "../constants";
import { useControlePssStore } from "../controlePssStore";
import { SpecArea, SpecificationMode } from "../../shared/visualizationModes";
import { certamesListActionSpecifications, certamesListBlockSpecifications, certamesListBusinessItems, certamesListFilterSpecifications, certamesListScreenSpecification } from "./CertamesListSpecifications";
import { ORGAOS_CERTAME, SITUACOES_CERTAME, TIPOS_CERTAME } from "./dominios";
import type { Certame, SituacaoCertame, TipoCertame } from "./types";
import { CardSeplag } from "@componentes/Card";
import { BadgeSeplag } from "@componentes/Badge";
import { BotaoIconSeplag, BotaoLimparFiltroSeplag } from "@componentes/Botao";
import { DropdownFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "@componentes/TablePaginado";
import type { ResultsSeplag } from "../../../interfaces/Results";

interface FiltroForm { termo:string; orgao?:string; exercicio?:string; tipo?:TipoCertame; situacao?:SituacaoCertame }

const situacaoLabel:Record<SituacaoCertame,string> = Object.fromEntries(SITUACOES_CERTAME.map((item) => [item.value, item.label])) as Record<SituacaoCertame,string>;
const situacaoEstilo:Record<SituacaoCertame,{ color:string; bg:string }> = {
 ABERTO: { color:"#0b6199", bg:"#e9f3fc" },
 RETIFICACAO_EDITAL: { color:"#55637a", bg:"#eef1f5" },
 HOMOLOGADO: { color:"#147441", bg:"#e2f5e8" },
 RETIFICACAO_HOMOLOGACAO: { color:"#55637a", bg:"#eef1f5" },
 PRORROGACAO_VALIDADE: { color:"#8a5c00", bg:"#fff1cf" },
 CANCELADO_ANULADO: { color:"#ad3039", bg:"#ffe3e5" },
 PARALISADO: { color:"#ad3039", bg:"#ffe3e5" },
 HOMOLOGACAO_PARCIAL: { color:"#8a5c00", bg:"#fff1cf" },
 RETIFICACAO_HOMOLOGACAO_PARCIAL: { color:"#8a5c00", bg:"#fff1cf" },
};
const tipoLabel:Record<TipoCertame,string> = Object.fromEntries(TIPOS_CERTAME.map((item) => [item.value, item.label])) as Record<TipoCertame,string>;
const normalizar = (valor:string) => valor.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");

function resultados<T>(content:T[]):ResultsSeplag<T> {
 return { content, totalPages:Math.max(1, Math.ceil(content.length / 10)), totalRecords:content.length, size:10, sizePage:10, pageActual:0, first:true, last:true, numberOfElements:content.length, empty:content.length === 0 };
}

export function CertamesListContent() {
 const { certames } = useControlePssStore();
 const navigate = useNavigate();
 const { control, reset, watch } = useForm<FiltroForm>({ defaultValues: { termo:"" } });
 const filtros = watch();

 const exercicios = useMemo(() => Array.from(new Set(certames.map((item) => item.anoConcurso))).sort((a, b) => b - a).map((ano) => ({ label:String(ano), value:String(ano) })), [certames]);

 const lista = useMemo(() => {
  const termo = normalizar(filtros.termo.trim());
  return certames.filter((certame) =>
   (!termo || normalizar(`${certame.nomeEdital} ${certame.numeroEditalOrgao} ${certame.setor}`).includes(termo)) &&
   (!filtros.orgao || certame.setor === filtros.orgao) &&
   (!filtros.exercicio || String(certame.anoConcurso) === filtros.exercicio) &&
   (!filtros.tipo || certame.tipoCertame === filtros.tipo) &&
   (!filtros.situacao || certame.situacaoAtual === filtros.situacao),
  );
 }, [certames, filtros]);

 const columns:ColumnMetaSeplag<Certame>[] = [
  { header:"Certame", body:(row) => <div><strong>{row.numeroEditalOrgao}</strong><div className="text-sm text-color-secondary">{row.nomeEdital}</div></div> },
  { field:"setor", header:"Órgão mandante" },
  { header:"Tipo", body:(row) => tipoLabel[row.tipoCertame] },
  { header:"Vagas", body:(row) => row.cargos.reduce((total, cargo) => total + cargo.quantidadeVagas, 0).toLocaleString("pt-BR") },
  { header:"Situação", body:(row) => <div className="flex align-items-center gap-2"><BadgeSeplag label={situacaoLabel[row.situacaoAtual]} color={situacaoEstilo[row.situacaoAtual].color} bg={situacaoEstilo[row.situacaoAtual].bg} border="transparent" size="sm" />{row.cotas.length > 1 && <BadgeSeplag label={`${row.cotas.length} cotas`} color="#ad3039" bg="#ffe3e5" border="transparent" size="sm" />}</div> },
 ];

 return <SpecificationMode screen={certamesListScreenSpecification} businessItems={certamesListBusinessItems}>
  <div className="prototype-page-content prototype-page-content--white"><CardSeplag title="Cadastro de Certames">
   <div className="col-12"><SpecArea metadata={certamesListBlockSpecifications.aviso}><p className="text-sm text-color-secondary" style={{ margin:"0 0 1rem" }}>Concursos Públicos e Processos Seletivos Simplificados cadastrados no SIGEP com base no edital publicado, para fins de vínculo do candidato e prestação de contas ao TCE-MT.</p></SpecArea></div>

   <div className="col-12"><div className="grid">
    <TextFieldSeplag name="termo" control={control} label="Pesquisar" cols="12 6 4" placeholder="Nome ou número do edital, órgão" getFormErrorMessage={() => null} />
    <SpecArea metadata={certamesListFilterSpecifications["Órgão"]}><DropdownFieldSeplag name="orgao" control={control} label="Órgão" cols="12 6 2" options={ORGAOS_CERTAME.map((item) => ({ label:item, value:item }))} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} /></SpecArea>
    <SpecArea metadata={certamesListFilterSpecifications["Exercício"]}><DropdownFieldSeplag name="exercicio" control={control} label="Exercício" cols="12 6 2" options={exercicios} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} /></SpecArea>
    <SpecArea metadata={certamesListFilterSpecifications["Tipo"]}><DropdownFieldSeplag name="tipo" control={control} label="Tipo" cols="12 6 2" options={[...TIPOS_CERTAME]} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} /></SpecArea>
    <SpecArea metadata={certamesListFilterSpecifications["Situação"]}><DropdownFieldSeplag name="situacao" control={control} label="Situação" cols="12 6 2" options={[...SITUACOES_CERTAME]} optionLabel="label" optionValue="value" showClear getFormErrorMessage={() => null} /></SpecArea>
    <div className="col-12 flex justify-content-end"><BotaoLimparFiltroSeplag label="Limpar filtros" onClick={() => reset({ termo:"" })} /></div>
   </div></div>

   <div className="col-12"><SpecArea metadata={certamesListBlockSpecifications.lista}>
    <TablePaginadoSeplag dataKey="id" data={resultados(lista)} rows={10} rowsPerPage={[10, 20, 50]} paginator={lista.length > 10} lazy={false} selectionMode={null} columns={columns}
     hasEventoAcao
     handleAdicionar={() => navigate(`${BASE}/certames/novo`)}
     handleView={(row) => navigate(`${BASE}/certames/${row.id}`)}
     handleEdit={(row) => navigate(`${BASE}/certames/${row.id}`)}
     handleDelete={null}
     renderBotoes={(row) => <SpecArea metadata={certamesListActionSpecifications["Reverter/Histórico"]}><BotaoIconSeplag type="button" tooltip="Reverter/Histórico" icon="pi pi-history" onClick={() => navigate(`${BASE}/certames/${row.id}?aba=SITUACOES`)} /></SpecArea>}
     handleOnPageChange={() => {}}
    />
   </SpecArea></div>
  </CardSeplag></div>
 </SpecificationMode>;
}
