import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CONTROLE_PSS_BASE_PATH as BASE } from "../constants";
import { LEIS_CERTAME } from "../certame/dominios";
import { useDocumentosLegais } from "../../documentosLegais/documentosLegaisStore";
import { tiposCotaStore, useTiposCota, type TipoCotaInput } from "./tiposCotaStore";
import { CardSeplag } from "@componentes/Card";
import { BotaoSalvarSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { DocumentosLegaisAssociadosSeplag, type DocumentoLegalAssociadoSeplag } from "@componentes/DocumentosLegaisAssociados";

// Mesmo padrão de formulário de Locais (LocalFormContent) e Fase do Certame (FaseCertameFormContent),
// mais o campo Lei no mesmo padrão do bloco Cotas em CertameFormContent (busca em Documentos Legais +
// atalho "Novo Cadastro" com ida-e-volta via returnTo/campoLei).
export function TipoCotaFormContent() {
 const tiposCota = useTiposCota();
 const navigate = useNavigate();
 const location = useLocation();
 const [searchParams] = useSearchParams();
 const { id } = useParams<{ id?:string }>();
 const modoNovo = !id || id === "novo";
 const existente = modoNovo ? undefined : tiposCota.find((item) => item.id === id);

 const { register, handleSubmit, control, getValues, setValue } = useForm<TipoCotaInput>({ defaultValues: { label: existente?.label ?? "", lei: existente?.lei ?? [] } });
 const [erro, setErro] = useState<string | null>(null);

 // Toda "Lei" busca em Documentos Legais (cadastro central) + o domínio fixo LEIS_CERTAME — mesma
 // fonte usada no bloco Cotas do certame, para que uma lei recém-criada apareça imediatamente aqui.
 const documentosLegaisCadastrados = useDocumentosLegais();
 const opcoesLeis = useMemo<DocumentoLegalAssociadoSeplag[]>(() => [
  ...LEIS_CERTAME.map((lei) => ({ id:lei.value, titulo:lei.label, categoria:"Lei" })),
  ...documentosLegaisCadastrados.map((documento) => ({ id:documento.id, titulo:documento.titulo, categoria:documento.categoria, descricao:documento.descricao })),
 ], [documentosLegaisCadastrados]);
 const irCadastrarLei = () => {
  const returnTo = `${location.pathname}?campoLei=lei`;
  navigate(`/prototipos/sigep/documentos-legais/novo?returnTo=${encodeURIComponent(returnTo)}`);
 };

 // Ao voltar do cadastro de uma nova lei, soma a lei recém-criada às já selecionadas e limpa a URL —
 // mesma lógica (e mesmo motivo da ref, por causa do StrictMode) de CertameFormContent.
 const documentoLegalProcessadoRef = useRef<string | null>(null);
 useEffect(() => {
  const documentoLegalId = searchParams.get("documentoLegalId");
  const campoLeiRetorno = searchParams.get("campoLei");
  if (!documentoLegalId || campoLeiRetorno !== "lei" || documentoLegalProcessadoRef.current === documentoLegalId) return;
  documentoLegalProcessadoRef.current = documentoLegalId;
  setValue("lei", [...(getValues("lei") ?? []), documentoLegalId]);
  navigate(location.pathname, { replace:true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [searchParams]);

 if (id && !existente) return <div className="prototype-page-content prototype-page-content--white prototype-novo-ingresso-page"><CardSeplag title="Tipo de cota não encontrado" cols="12" cardHeaderClassNames="prototype-novo-ingresso-card"><div className="col-12"><BotaoVoltarSeplag onClick={() => navigate(`${BASE}/tipos-cota`)} /></div></CardSeplag></div>;

 const salvar = handleSubmit((dados) => {
  setErro(null);
  if (!dados.label.trim()) { setErro("Preencha o nome do tipo de cota."); return; }
  if (tiposCotaStore.isDuplicate(dados, existente?.id)) { setErro("Já existe um tipo de cota cadastrado com esse nome."); return; }

  if (existente) {
   tiposCotaStore.update(existente.id, dados);
   navigate(`${BASE}/tipos-cota`);
   return;
  }
  tiposCotaStore.create(dados);
  navigate(`${BASE}/tipos-cota`);
 });

 return <form onSubmit={salvar}><div className="prototype-page-content prototype-page-content--white prototype-novo-ingresso-page">
  <CardSeplag title={existente ? "Editar Tipo de Cota" : "Cadastrar Tipo de Cota"} cols="12" cardHeaderClassNames="prototype-novo-ingresso-card">
   {erro && <div className="col-12" role="alert" style={{ color:"#c02626", fontWeight:700, marginBottom:"0.75rem" }}>{erro}</div>}
   <div className="col-12">
    <section className="prototype-ingresso-section prototype-novo-ingresso-panel">
     <h3><span className="prototype-novo-ingresso-panel-icon"><i className="pi pi-percentage" aria-hidden="true" /></span><span>Dados do Tipo de Cota</span></h3>
     <div className="prototype-ingresso-import-grid">
      <label className="prototype-ingresso-field">
       <span>Nome<em>*</em></span>
       <input type="text" placeholder="Ex.: PCD — Pessoas com Deficiência" {...register("label")} />
      </label>
      <div style={{ gridColumn:"span 2" }}>
       <Controller name="lei" control={control} render={({ field }) => (
        <DocumentosLegaisAssociadosSeplag
         label="Lei"
         options={opcoesLeis}
         value={(field.value as string[] | undefined) ?? []}
         onChange={(ids) => field.onChange(ids)}
         onNovoCadastro={irCadastrarLei}
         onVisualizar={(documento) => navigate(`/prototipos/sigep/documentos-legais/${documento.id}`)}
         placeholder="Buscar lei cadastrada"
         indicarPrincipal
         compact
        />
       )} />
      </div>
     </div>
    </section>
   </div>
   <div className="col-12 prototype-form-actions prototype-novo-ingresso-actions">
    <BotaoVoltarSeplag type="button" onClick={() => navigate(`${BASE}/tipos-cota`)} />
    <BotaoSalvarSeplag type="submit" />
   </div>
  </CardSeplag>
 </div></form>;
}
