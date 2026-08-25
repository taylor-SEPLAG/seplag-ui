import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE } from "../constants";
import { cidadesPorEstado, ESTADOS_BRASIL } from "./dominios";
import { locaisStore, useLocais, type LocalInput } from "./locaisStore";
import { CardSeplag } from "@componentes/Card";
import { BotaoSalvarSeplag, BotaoVoltarSeplag } from "@componentes/Botao";

export function LocalFormContent() {
 const locais = useLocais();
 const navigate = useNavigate();
 const { id } = useParams<{ id?:string }>();
 const modoNovo = !id || id === "novo";
 const existente = modoNovo ? undefined : locais.find((item) => item.id === id);

 const { register, handleSubmit, watch, setValue } = useForm<LocalInput>({ defaultValues: { estado: existente?.estado ?? "", cidade: existente?.cidade ?? "", nomeLocal: existente?.nomeLocal ?? "" } });
 const valores = watch();
 const cidadesDisponiveis = useMemo(() => cidadesPorEstado(valores.estado), [valores.estado]);
 const [erro, setErro] = useState<string | null>(null);

 if (id && !existente) return <div className="prototype-page-content prototype-page-content--white prototype-novo-ingresso-page"><CardSeplag title="Polo não encontrado" cols="12" cardHeaderClassNames="prototype-novo-ingresso-card"><div className="col-12"><BotaoVoltarSeplag onClick={() => navigate(`${BASE}/locais`)} /></div></CardSeplag></div>;

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

 return <form onSubmit={salvar}><div className="prototype-page-content prototype-page-content--white prototype-novo-ingresso-page">
  <CardSeplag title={existente ? "Editar Polo" : "Cadastrar Polo"} cols="12" cardHeaderClassNames="prototype-novo-ingresso-card">
   {erro && <div className="col-12" role="alert" style={{ color:"#c02626", fontWeight:700, marginBottom:"0.75rem" }}>{erro}</div>}
   <div className="col-12">
    <section className="prototype-ingresso-section prototype-novo-ingresso-panel">
     <h3><span className="prototype-novo-ingresso-panel-icon"><i className="pi pi-map-marker" aria-hidden="true" /></span><span>Dados do Polo</span></h3>
     <div className="prototype-ingresso-import-grid">
      <label className="prototype-ingresso-field">
       <span>Estado<em>*</em></span>
       <select {...register("estado", { onChange: () => setValue("cidade", "") })}>
        <option value="">Selecione...</option>
        {ESTADOS_BRASIL.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
       </select>
      </label>
      <label className="prototype-ingresso-field">
       <span>Cidade<em>*</em></span>
       <select {...register("cidade")} disabled={!valores.estado}>
        <option value="">{valores.estado ? "Selecione uma opção" : "Selecione o estado primeiro"}</option>
        {cidadesDisponiveis.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
       </select>
      </label>
      <label className="prototype-ingresso-field">
       <span>Nome do Polo<em>*</em></span>
       <input type="text" {...register("nomeLocal")} />
      </label>
     </div>
    </section>
   </div>
   <div className="col-12 prototype-form-actions prototype-novo-ingresso-actions">
    <BotaoVoltarSeplag type="button" onClick={() => navigate(`${BASE}/locais`)} />
    <BotaoSalvarSeplag type="submit" />
   </div>
  </CardSeplag>
 </div></form>;
}
