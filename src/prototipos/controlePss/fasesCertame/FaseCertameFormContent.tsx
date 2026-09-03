import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE } from "../constants";
import { TIPOS_FASE_CONCURSO_TCE } from "../certame/dominios";
import { fasesCertameStore, useFasesCertame, type FaseCertameCatalogoInput } from "./fasesCertameStore";
import { CardSeplag } from "@componentes/Card";
import { BotaoSalvarSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { MensagemSeplag } from "@componentes/Mensagem";

type TipoFase = "TCE" | "PERSONALIZADA";

export function FaseCertameFormContent() {
 const fases = useFasesCertame();
 const navigate = useNavigate();
 const { id } = useParams<{ id?:string }>();
 const modoNovo = !id || id === "novo";
 const existente = modoNovo ? undefined : fases.find((item) => item.id === id);

 const { register, handleSubmit, watch, setValue } = useForm<FaseCertameCatalogoInput>({ defaultValues: { nome: existente?.nome ?? "", tipoTceId: existente?.tipoTceId ?? "" } });
 // "Tipo de fase" não é persistido diretamente — é derivado de tipoTceId (presente = TCE-MT). Por
 // padrão, um cadastro novo já começa como TCE-MT (RN005: o catálogo é majoritariamente oficial).
 const [tipo, setTipo] = useState<TipoFase>(existente && !existente.tipoTceId ? "PERSONALIZADA" : "TCE");
 const [erro, setErro] = useState<string | null>(null);
 const nome = watch("nome");
 const tipoTceId = watch("tipoTceId");
 const labelReferencia = (value:string) => TIPOS_FASE_CONCURSO_TCE.find((item) => item.value === value)?.label ?? "";
 // "Nome da fase no edital" (TCE-MT): opcional, some editais nomeiam a fase de forma diferente do
 // rótulo oficial do catálogo TFCONC. Vazio = usa o rótulo oficial da referência escolhida. No modo
 // edição, só pré-preenche quando o nome salvo já diverge do rótulo oficial (senão fica vazio,
 // como se nunca tivesse sido sobrescrito).
 const [nomeEdital, setNomeEdital] = useState(() => existente?.tipoTceId && existente.nome !== labelReferencia(existente.tipoTceId) ? existente.nome : "");

 if (id && !existente) return <div className="prototype-page-content prototype-page-content--white prototype-novo-ingresso-page"><CardSeplag title="Fase não encontrada" cols="12" cardHeaderClassNames="prototype-novo-ingresso-card"><div className="col-12"><BotaoVoltarSeplag onClick={() => navigate(`${BASE}/fases-certame`)} /></div></CardSeplag></div>;

 const alterarTipo = (novoTipo:TipoFase) => {
  setTipo(novoTipo);
  if (novoTipo === "PERSONALIZADA") setValue("tipoTceId", "");
 };

 const selecionarReferencia = (value:string) => {
  setValue("tipoTceId", value);
  const rotuloOficial = labelReferencia(value);
  setValue("nome", nomeEdital.trim() || rotuloOficial);
 };

 const pendente = tipo === "TCE" && !tipoTceId;

 const salvar = handleSubmit((dados) => {
  setErro(null);
  const nomeTce = nomeEdital.trim() || labelReferencia(dados.tipoTceId ?? "");
  const dadosNormalizados:FaseCertameCatalogoInput = tipo === "TCE"
   ? { nome:nomeTce, tipoTceId:dados.tipoTceId || undefined }
   : { nome:dados.nome, tipoTceId:undefined };
  if (tipo === "TCE" && !dadosNormalizados.tipoTceId) { setErro("Selecione a fase oficial para concluir o vínculo."); return; }
  if (!dadosNormalizados.nome.trim()) { setErro("Preencha o nome da fase personalizada."); return; }
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
       <span>Tipo de fase<em>*</em></span>
       <select value={tipo} onChange={(event) => alterarTipo(event.target.value as TipoFase)}>
        <option value="TCE">Consta na tabela do TCE-MT (TFCONC)</option>
        <option value="PERSONALIZADA">Fase personalizada do órgão</option>
       </select>
      </label>

      {tipo === "TCE" ? (<>
       <label className="prototype-ingresso-field">
        <span>Referência na tabela do TCE-MT<em>*</em></span>
        <select value={tipoTceId ?? ""} onChange={(event) => selecionarReferencia(event.target.value)}>
         <option value="">Selecione a fase oficial…</option>
         {TIPOS_FASE_CONCURSO_TCE.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
       </label>
       <label className="prototype-ingresso-field">
        <span>Nome da fase no edital</span>
        <input
         type="text"
         placeholder="Ex.: Aplicação da Prova Discursiva"
         value={nomeEdital}
         onChange={(event) => {
          const valor = event.target.value;
          setNomeEdital(valor);
          setValue("nome", valor.trim() || labelReferencia(tipoTceId ?? ""));
         }}
        />
       </label>
      </>) : (
       <label className="prototype-ingresso-field">
        <span>Nome da fase personalizada<em>*</em></span>
        <input type="text" placeholder="Ex.: Avaliação de Perfil Comportamental" {...register("nome")} />
       </label>
      )}
     </div>
     {pendente && <div className="prototype-ingresso-import-grid" style={{ marginTop:12 }}>
      <MensagemSeplag severity="warning" message="Selecione a fase oficial para concluir o vínculo com o TCE-MT." cols="12" />
     </div>}
     {tipo === "TCE" && !pendente && <p className="text-sm text-color-secondary" style={{ marginTop:8 }}>Vinculada a &quot;{nome}&quot; — o envio ao TCE-MT usará o código TFCONC correspondente.</p>}
     {tipo === "PERSONALIZADA" && <div className="prototype-ingresso-import-grid" style={{ marginTop:12 }}>
      <MensagemSeplag severity="info" message="Esta fase não será vinculada a nenhum código da tabela TFCONC do TCE-MT e constará apenas nos registros internos do órgão." cols="12" />
     </div>}
    </section>
   </div>
   <div className="col-12 prototype-form-actions prototype-novo-ingresso-actions">
    <BotaoVoltarSeplag type="button" onClick={() => navigate(`${BASE}/fases-certame`)} />
    <BotaoSalvarSeplag type="submit" />
   </div>
  </CardSeplag>
 </div></form>;
}
