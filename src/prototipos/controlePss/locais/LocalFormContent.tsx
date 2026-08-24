import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE } from "../constants";
import { cidadesPorEstado, ESTADOS_BRASIL } from "./dominios";
import { locaisStore, useLocais, type LocalInput } from "./locaisStore";
import { CardSeplag } from "@componentes/Card";
import { BotaoSalvarSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { DropdownFieldSeplag, TextFieldSeplag } from "@componentes/Fields";

export function LocalFormContent() {
 const locais = useLocais();
 const navigate = useNavigate();
 const { id } = useParams<{ id?:string }>();
 const modoNovo = !id || id === "novo";
 const existente = modoNovo ? undefined : locais.find((item) => item.id === id);

 const { control, handleSubmit, watch, setValue } = useForm<LocalInput>({ defaultValues: { estado: existente?.estado ?? "", cidade: existente?.cidade ?? "", nomeLocal: existente?.nomeLocal ?? "" } });
 const valores = watch();
 const cidadesDisponiveis = useMemo(() => cidadesPorEstado(valores.estado), [valores.estado]);
 const [erro, setErro] = useState<string | null>(null);

 if (id && !existente) return <div className="prototype-page-content prototype-page-content--white"><CardSeplag title="Polo não encontrado" cols="12"><div className="col-12"><BotaoVoltarSeplag onClick={() => navigate(`${BASE}/locais`)} /></div></CardSeplag></div>;

 const salvar = handleSubmit((dados) => {
  setErro(null);
  if (!dados.estado || !dados.cidade || !dados.nomeLocal.trim()) { setErro("Preencha os campos obrigatórios."); return; }
  if (locaisStore.isDuplicate(dados, existente?.id)) { setErro("Já existe um polo com esse nome cadastrado nessa cidade."); return; }

  if (existente) {
   locaisStore.update(existente.id, dados);
   navigate(`${BASE}/locais`);
   return;
  }
  locaisStore.create(dados);
  navigate(`${BASE}/locais`);
 });

 return <form onSubmit={salvar}><div className="prototype-page-content prototype-page-content--white">
  <CardSeplag title={existente ? "Editar Polo" : "Cadastrar Polo"} cols="12">
   {erro && <div className="col-12" role="alert" style={{ color:"#ad3039", marginBottom:"0.5rem" }}>{erro}</div>}
   <DropdownFieldSeplag name="estado" control={control} label="Estado" cols="12 6 4" options={[...ESTADOS_BRASIL]} optionLabel="label" optionValue="value" required onChange={() => setValue("cidade", "")} getFormErrorMessage={() => null} />
   <DropdownFieldSeplag name="cidade" control={control} label="Cidade" cols="12 6 4" options={cidadesDisponiveis} optionLabel="label" optionValue="value" required disabled={!valores.estado} placeholder={valores.estado ? "Selecione uma opção" : "Selecione o estado primeiro"} getFormErrorMessage={() => null} />
   <TextFieldSeplag name="nomeLocal" control={control} label="Nome do Polo" cols="12 6 4" required getFormErrorMessage={() => null} />
   <div className="col-12 flex justify-content-end gap-2">
    <BotaoVoltarSeplag type="button" onClick={() => navigate(`${BASE}/locais`)} />
    <BotaoSalvarSeplag type="submit" />
   </div>
  </CardSeplag>
 </div></form>;
}
