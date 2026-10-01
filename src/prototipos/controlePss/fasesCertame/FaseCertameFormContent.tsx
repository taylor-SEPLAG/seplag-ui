import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE } from "../constants";
import { TIPOS_FASE_CONCURSO_TCE } from "../certame/dominios";
import { fasesCertameStore, useFasesCertame, type FaseCertameCatalogoInput } from "./fasesCertameStore";
import { CardSeplag } from "@componentes/Card";
import { BotaoSalvarSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { TextFieldSeplag, DropdownFieldSeplag } from "@componentes/Fields";

interface FaseFormValues { nome:string; tipoTceId:string }

// "" = "Nenhum (fase personalizada)" — fase sem correspondência na tabela TFCONC do TCE-MT.
const OPCOES_TIPO_FASE = [{ label:"Nenhum (fase personalizada)", value:"" }, ...TIPOS_FASE_CONCURSO_TCE.map((item) => ({ label:item.label, value:item.value }))];

export function FaseCertameFormContent() {
 const fases = useFasesCertame();
 const navigate = useNavigate();
 const { id } = useParams<{ id?:string }>();
 const modoNovo = !id || id === "novo";
 const existente = modoNovo ? undefined : fases.find((item) => item.id === id);

 const { control, handleSubmit, setValue, getValues } = useForm<FaseFormValues>({ defaultValues: { nome:existente?.nome ?? "", tipoTceId:existente?.tipoTceId ?? "" } });
 const [erro, setErro] = useState<string | null>(null);

 if (id && !existente) return <div className="prototype-page-content prototype-page-content--white prototype-novo-ingresso-page"><CardSeplag title="Fase não encontrada" cols="12" cardHeaderClassNames="prototype-novo-ingresso-card"><div className="col-12"><BotaoVoltarSeplag onClick={() => navigate(`${BASE}/fases-certame`)} /></div></CardSeplag></div>;

 // Selecionar uma referência oficial do TCE-MT preenche o Nome da Fase com o rótulo oficial — o
 // campo continua um texto livre e editável depois, mesmo com uma referência selecionada.
 const selecionarTipo = (value:string) => {
  setValue("tipoTceId", value);
  if (value) setValue("nome", TIPOS_FASE_CONCURSO_TCE.find((item) => item.value === value)?.label ?? getValues("nome"));
 };

 const salvar = handleSubmit((dados) => {
  setErro(null);
  const dadosNormalizados:FaseCertameCatalogoInput = { nome:dados.nome.trim(), tipoTceId:dados.tipoTceId || undefined };
  if (!dadosNormalizados.nome) { setErro("Preencha o Nome da Fase."); return; }
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
  <CardSeplag title={existente ? "Editar - Fases do Certame" : "Cadastrar - Fases do Certame"} cols="12" cardHeaderClassNames="prototype-novo-ingresso-card">
   {erro && <div className="col-12" role="alert" style={{ color:"#c02626", fontWeight:700, marginBottom:"0.75rem" }}>{erro}</div>}
   <div className="col-12">
    <div className="grid">
     <TextFieldSeplag name="nome" control={control} label="Nome da Fase" required cols="12 6" placeholder="Nome da fase" getFormErrorMessage={() => null} />
     <DropdownFieldSeplag name="tipoTceId" control={control} label="Tipo de Fase (TCE-MT)" cols="12 6" options={OPCOES_TIPO_FASE} optionLabel="label" optionValue="value" onChange={selecionarTipo} showClear={false} panelClassName="prototype-certame-dropdown-panel" getFormErrorMessage={() => null} />
    </div>
   </div>
   <div className="col-12 prototype-form-actions prototype-novo-ingresso-actions">
    <BotaoVoltarSeplag type="button" onClick={() => navigate(`${BASE}/fases-certame`)} />
    <BotaoSalvarSeplag type="submit" />
   </div>
  </CardSeplag>
 </div></form>;
}
