import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE } from "../constants";
import { TIPOS_FASE_CONCURSO_TCE } from "../certame/dominios";
import { fasesCertameStore, useFasesCertame, type FaseCertameCatalogoInput } from "./fasesCertameStore";
import { CardSeplag } from "@componentes/Card";
import { BotaoSalvarSeplag, BotaoVoltarSeplag } from "@componentes/Botao";

export function FaseCertameFormContent() {
 const fases = useFasesCertame();
 const navigate = useNavigate();
 const { id } = useParams<{ id?:string }>();
 const modoNovo = !id || id === "novo";
 const existente = modoNovo ? undefined : fases.find((item) => item.id === id);

 const { register, handleSubmit } = useForm<FaseCertameCatalogoInput>({ defaultValues: { nome: existente?.nome ?? "", tipoTceId: existente?.tipoTceId ?? "" } });
 const [erro, setErro] = useState<string | null>(null);

 if (id && !existente) return <div className="prototype-page-content prototype-page-content--white prototype-novo-ingresso-page"><CardSeplag title="Fase não encontrada" cols="12" cardHeaderClassNames="prototype-novo-ingresso-card"><div className="col-12"><BotaoVoltarSeplag onClick={() => navigate(`${BASE}/fases-certame`)} /></div></CardSeplag></div>;

 const salvar = handleSubmit((dados) => {
  setErro(null);
  const dadosNormalizados:FaseCertameCatalogoInput = { nome: dados.nome, tipoTceId: dados.tipoTceId || undefined };
  if (!dadosNormalizados.nome.trim()) { setErro("Preencha os campos obrigatórios."); return; }
  if (fasesCertameStore.isDuplicate(dadosNormalizados, existente?.id)) { setErro("Já existe uma fase cadastrada com esse nome."); return; }

  if (existente) {
   fasesCertameStore.update(existente.id, dadosNormalizados);
   navigate(`${BASE}/fases-certame`);
   return;
  }
  fasesCertameStore.create(dadosNormalizados);
  navigate(`${BASE}/fases-certame`);
 });

 return <form onSubmit={salvar}><div className="prototype-page-content prototype-page-content--white prototype-novo-ingresso-page">
  <CardSeplag title={existente ? "Editar Fase do Certame" : "Cadastrar Fase do Certame"} cols="12" cardHeaderClassNames="prototype-novo-ingresso-card">
   {erro && <div className="col-12" role="alert" style={{ color:"#c02626", fontWeight:700, marginBottom:"0.75rem" }}>{erro}</div>}
   <div className="col-12">
    <section className="prototype-ingresso-section prototype-novo-ingresso-panel">
     <h3><span className="prototype-novo-ingresso-panel-icon"><i className="pi pi-flag" aria-hidden="true" /></span><span>Dados da Fase</span></h3>
     <div className="prototype-ingresso-import-grid">
      <label className="prototype-ingresso-field">
       <span>Nome da fase<em>*</em></span>
       <input type="text" {...register("nome")} />
      </label>
      <label className="prototype-ingresso-field">
       <span>Referência na tabela do TCE-MT (TFCONC)</span>
       <select {...register("tipoTceId")}>
        <option value="">Fase personalizada — não consta na tabela do TCE-MT</option>
        {TIPOS_FASE_CONCURSO_TCE.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
       </select>
      </label>
     </div>
    </section>
   </div>
   <div className="col-12 prototype-form-actions prototype-novo-ingresso-actions">
    <BotaoVoltarSeplag type="button" onClick={() => navigate(`${BASE}/fases-certame`)} />
    <BotaoSalvarSeplag type="submit" />
   </div>
  </CardSeplag>
 </div></form>;
}
