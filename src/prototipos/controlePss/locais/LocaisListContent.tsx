import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE } from "../constants";
import { CIDADES_COM_UF } from "./dominios";
import { locaisStore, useLocais, type Local } from "./locaisStore";
import { CardSeplag } from "@componentes/Card";
import { BotaoAdicionarSeplag, BotaoConsultarSeplag, BotaoIconSeplag, BotaoLimparFiltroSeplag } from "@componentes/Botao";
import { DropdownFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "@componentes/TablePaginado";
import type { ResultsSeplag } from "../../../interfaces/Results";

interface FiltroForm { nomeLocal:string; cidade?:string }

const normalizar = (valor:string) => valor.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");

function resultados<T>(content:T[]):ResultsSeplag<T> {
 return { content, totalPages:Math.max(1, Math.ceil(content.length / 10)), totalRecords:content.length, size:10, sizePage:10, pageActual:0, number:0, first:true, last:true, numberOfElements:content.length, empty:content.length === 0 };
}

export function LocaisListContent() {
 const locais = useLocais();
 const navigate = useNavigate();
 const { control, reset, watch } = useForm<FiltroForm>({ defaultValues: { nomeLocal:"", cidade:undefined } });
 const filtros = watch();

 const lista = useMemo(() => {
  const termo = normalizar(filtros.nomeLocal.trim());
  return locais.filter((local) =>
   (!termo || normalizar(local.nomeLocal).includes(termo)) &&
   (!filtros.cidade || `${local.cidade}/${local.estado}` === filtros.cidade),
  );
 }, [locais, filtros]);

 const columns:ColumnMetaSeplag<Local>[] = [
  { header:"Polo", body:(row) => <div><strong>{row.nomeLocal}</strong>{row.situacao === "INATIVO" && <div className="text-sm text-color-secondary">Inativo</div>}</div> },
  { header:"Cidade", body:(row) => `${row.cidade}/${row.estado}` },
  { header:"Ações", body:(row) => <div className="flex gap-2">
   <BotaoIconSeplag type="button" severity="warning" tooltip="Editar" icon="pi pi-pencil" onClick={() => navigate(`${BASE}/locais/${row.id}`)} />
   <BotaoIconSeplag type="button" severity={row.situacao === "ATIVO" ? "danger" : "success"} tooltip={row.situacao === "ATIVO" ? "Inativar" : "Ativar"} icon={row.situacao === "ATIVO" ? "pi pi-ban" : "pi pi-check"} onClick={() => locaisStore.toggleSituacao(row.id)} />
  </div> },
 ];

 return <div className="prototype-page-content prototype-page-content--white">
  <CardSeplag title="Filtro" cols="12">
   <TextFieldSeplag name="nomeLocal" control={control} label="Polo" placeholder="Nome do polo" cols="12 6" getFormErrorMessage={() => null} />
   <DropdownFieldSeplag name="cidade" control={control} label="Cidade" cols="12 6" options={CIDADES_COM_UF} optionLabel="label" optionValue="value" getFormErrorMessage={() => null} />
   <div className="col-12 flex justify-content-end gap-2">
    <BotaoLimparFiltroSeplag type="button" onClick={() => reset({ nomeLocal:"", cidade:undefined })} />
    <BotaoConsultarSeplag type="button" onClick={() => {}} />
   </div>
  </CardSeplag>

  <CardSeplag title="Listar" cols="12" actions={<BotaoAdicionarSeplag label="Cadastrar" onClick={() => navigate(`${BASE}/locais/novo`)} />}>
   <div className="col-12">
    <TablePaginadoSeplag dataKey="id" data={resultados(lista)} rows={10} rowsPerPage={[10, 20, 50]} paginator={lista.length > 10} lazy={false} selectionMode={null} columns={columns} handleOnPageChange={() => {}} />
   </div>
  </CardSeplag>
 </div>;
}
