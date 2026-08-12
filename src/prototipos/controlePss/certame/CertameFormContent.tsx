import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CONTROLE_PSS_BASE_PATH as BASE, CONTROLE_PSS_DATA_REFERENCIA } from "../constants";
import { controlePssStore, useControlePssStore } from "../controlePssStore";
import { CONTROLE_VAGAS_BASE_PATH } from "../../controleVagas/constants";
import { SpecArea, SpecificationMode } from "../../shared/visualizationModes";
import { certameFormActionSpecifications, certameFormBlockSpecifications, certameFormBusinessItems, certameFormScreenSpecification, certameFormTabSpecifications } from "./CertameFormSpecifications";
import { proximoNumeroCertame, calcularPrazoPrestacaoContas, calcularValidadeDias, certameDuplicado, dataEfeitoAnteriorPublicacao, podeRegistrarRetificacaoEdital, homologacaoVigenteSemCancelamento, podeRegistrarRetificacaoHomologacao } from "./validations";
import { ABRANGENCIAS, CARGOS_CADASTRADOS, DOCUMENTOS_CERTAME, EMPRESAS_CADASTRADAS, FASES_TCE_FIXAS, LEIS_CERTAME, ORGAOS_CERTAME, REGIMES_JURIDICOS, SITUACOES_CERTAME, TIPOS_CERTAME, TIPOS_CONCURSO_APLIC_TCE, TIPOS_CONTRATACAO_EXECUCAO, TIPOS_CONTRATO_BANCA, TIPOS_COTA, TIPOS_ISENCAO, TIPOS_VINCULO } from "./dominios";
import type { AbrangenciaCertame, CargoVagaCertame, Certame, CotaCertame, FaseCertame, RegimeJuridicoCertame, SituacaoCertame, TipoCertame, TipoContratacaoExecucaoCertame, TipoDocumentoCertame, TipoVinculoCertame } from "./types";
import { CardSeplag } from "@componentes/Card";
import { BadgeSeplag } from "@componentes/Badge";
import { MensagemSeplag } from "@componentes/Mensagem";
import { BotaoAdicionarSeplag, BotaoIconSeplag, BotaoSalvarSeplag, BotaoSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { TabsSeplag, type TabItemSeplag } from "@componentes/Tabs";
import { DateFieldSeplag, CheckboxFieldSeplag, CurrencyFieldSeplag, DropdownFieldSeplag, MaskFieldSeplag, MultiSelectFieldSeplag, NumberFieldSeplag, TextAreaFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import type { ArquivoAnexadoSeplag } from "@componentes/AnexarDocumento";
import Base64FileModal from "@componentes/Base64FileModal";
import { ModalSeplag } from "@componentes/Modal";
import RotuloSeplag from "@componentes/Rotulo";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "@componentes/TablePaginado";
import type { ResultsSeplag } from "../../../interfaces/Results";
import "./certame.css";

function resultadosSemPaginacao<T>(content:readonly T[]):ResultsSeplag<T> {
 return { content:[...content], totalPages:1, totalRecords:content.length, size:Math.max(content.length, 1), sizePage:Math.max(content.length, 1), pageActual:0, number:0, first:true, last:true, numberOfElements:content.length, empty:content.length === 0 };
}

interface CertameFormValues {
 tipoCertame:TipoCertame; tipoConcursoAplic:string;
 leiContratoTemporario?:string; leiProcessoSeletivoSimplificado?:string;
 regimeJuridico:RegimeJuridicoCertame; tipoVinculo:TipoVinculoCertame;
 setor:string; setoresParticipantes:string[]; objetivo:string;
 numeroConcurso:string; anoConcurso:number;
 nomeEdital:string; numeroEditalOrgao:string;
 dataRealizacao?:string; dataValidade?:string; inicioInscricoesGerais?:string; fimInscricoesGerais?:string;
 dataProrrogacao?:string; dataCancelamento?:string; dataResultado?:string; dataPublicacaoEdital:string;
 abrangencia:AbrangenciaCertame; tipoContratacaoExecucao:TipoContratacaoExecucaoCertame;
 instituicaoRealizadora?:string; previsaoProrrogacaoDias?:number; prorrogacaoValidadeDias?:number; validadeConcursoDias?:number;
 existePrevisaoRecursos:string;
 diasPrazoExercicio?:number; diasPrazoPosse?:number; diasPrazoProrrogacaoExercicio?:number; diasPrazoProrrogacaoPosse?:number;
 dataInicioInscricaoIsencao?:string; dataFimInscricaoIsencao?:string; leiIsencao?:string; tipoIsencao?:string;
 gerouDespesas:string;
 numeroEmpenho?:string; anoEmpenho?:number; tipoContrato?:string; numeroContrato?:string; anoContrato?:number;
 codigoUo?:string; codigoUg?:string; numeroAditivo?:string; anoAditivo?:number;
 cobraTaxaInscricao:string; valorInscricao?:number;
}
interface CotaFormValues { tipo:string; lei:string }
interface CargoFormValues { vinculo:"EXISTENTE" | "NOVO"; cargoExistenteId?:string; cargoNome:string; quantidadeVagas:number; vagaPcd:string; quantidadePcd?:number }
interface SituacaoFormValues { tipo:SituacaoCertame; data?:string }

// Consolidação de 8 para 4 abas fixas (+ Situações, disponível só após salvar): cada aba antiga
// virou um bloco com subtítulo dentro da aba nova, preservando todos os campos, RNs e CAs originais.
type Aba = "IDENTIFICACAO" | "FINANCEIRO" | "VAGAS_COTAS" | "DOCUMENTOS" | "SITUACOES";
const abasBase:readonly { id:Aba; label:string }[] = [
 { id:"IDENTIFICACAO", label:"Identificação e Cronograma" },
 { id:"FINANCEIRO", label:"Contrato e custo" },
 { id:"VAGAS_COTAS", label:"Vagas e Cotas" },
 { id:"DOCUMENTOS", label:"Documentos" },
];

const anoReferencia = Number(CONTROLE_PSS_DATA_REFERENCIA.slice(0, 4));
const situacaoLabel:Record<SituacaoCertame,string> = Object.fromEntries(SITUACOES_CERTAME.map((item) => [item.value, item.label])) as Record<SituacaoCertame,string>;
const situacaoEstilo:Record<SituacaoCertame,{ color:string; bg:string }> = {
 ABERTO: { color:"#0b6199", bg:"#e9f3fc" }, RETIFICACAO_EDITAL: { color:"#55637a", bg:"#eef1f5" }, HOMOLOGADO: { color:"#147441", bg:"#e2f5e8" },
 RETIFICACAO_HOMOLOGACAO: { color:"#55637a", bg:"#eef1f5" }, PRORROGACAO_VALIDADE: { color:"#8a5c00", bg:"#fff1cf" }, CANCELADO_ANULADO: { color:"#ad3039", bg:"#ffe3e5" },
 PARALISADO: { color:"#ad3039", bg:"#ffe3e5" }, HOMOLOGACAO_PARCIAL: { color:"#8a5c00", bg:"#fff1cf" }, RETIFICACAO_HOMOLOGACAO_PARCIAL: { color:"#8a5c00", bg:"#fff1cf" },
};

function valoresIniciais(certame:Certame | undefined, certames:readonly Certame[]):CertameFormValues {
 if (certame) return {
  tipoCertame:certame.tipoCertame, tipoConcursoAplic:certame.tipoConcursoAplic,
  leiContratoTemporario:certame.leiContratoTemporario, leiProcessoSeletivoSimplificado:certame.leiProcessoSeletivoSimplificado,
  regimeJuridico:certame.regimeJuridico, tipoVinculo:certame.tipoVinculo,
  setor:certame.setor, setoresParticipantes:[...certame.setoresParticipantes], objetivo:certame.objetivo,
  numeroConcurso:certame.numeroConcurso, anoConcurso:certame.anoConcurso,
  nomeEdital:certame.nomeEdital, numeroEditalOrgao:certame.numeroEditalOrgao,
  dataRealizacao:certame.dataRealizacao, dataValidade:certame.dataValidade, inicioInscricoesGerais:certame.inicioInscricoesGerais, fimInscricoesGerais:certame.fimInscricoesGerais,
  dataProrrogacao:certame.dataProrrogacao, dataCancelamento:certame.dataCancelamento, dataResultado:certame.dataResultado, dataPublicacaoEdital:certame.dataPublicacaoEdital,
  abrangencia:certame.abrangencia, tipoContratacaoExecucao:certame.tipoContratacaoExecucao,
  instituicaoRealizadora:certame.instituicaoRealizadora, previsaoProrrogacaoDias:certame.previsaoProrrogacaoDias, prorrogacaoValidadeDias:certame.prorrogacaoValidadeDias, validadeConcursoDias:certame.validadeConcursoDias,
  existePrevisaoRecursos:certame.existePrevisaoRecursos ? "S" : "N",
  diasPrazoExercicio:certame.diasPrazoExercicio, diasPrazoPosse:certame.diasPrazoPosse, diasPrazoProrrogacaoExercicio:certame.diasPrazoProrrogacaoExercicio, diasPrazoProrrogacaoPosse:certame.diasPrazoProrrogacaoPosse,
  dataInicioInscricaoIsencao:certame.dataInicioInscricaoIsencao, dataFimInscricaoIsencao:certame.dataFimInscricaoIsencao, leiIsencao:certame.leiIsencao, tipoIsencao:certame.tipoIsencao,
  gerouDespesas:certame.gerouDespesas ? "S" : "N",
  numeroEmpenho:certame.numeroEmpenho, anoEmpenho:certame.anoEmpenho, tipoContrato:certame.tipoContrato, numeroContrato:certame.numeroContrato, anoContrato:certame.anoContrato,
  codigoUo:certame.codigoUo, codigoUg:certame.codigoUg, numeroAditivo:certame.numeroAditivo, anoAditivo:certame.anoAditivo,
  cobraTaxaInscricao:certame.cobraTaxaInscricao ? "S" : "N", valorInscricao:certame.valorInscricao,
 };
 return {
  tipoCertame:"PSS", tipoConcursoAplic:"4",
  regimeJuridico:"ESPECIAL", tipoVinculo:"CONTRATO_TEMPORARIO",
  setor:"", setoresParticipantes:[], objetivo:"",
  numeroConcurso:proximoNumeroCertame(anoReferencia, certames), anoConcurso:anoReferencia,
  nomeEdital:"", numeroEditalOrgao:"",
  dataPublicacaoEdital:"", abrangencia:"ESTADUAL", tipoContratacaoExecucao:"PROPRIA_UG",
  existePrevisaoRecursos:"N", gerouDespesas:"N", cobraTaxaInscricao:"N",
 };
}

function arquivoExistente(certame:Certame | undefined, tipo:TipoDocumentoCertame):ArquivoAnexadoSeplag | undefined {
 const doc = certame?.documentos.find((item) => item.tipo === tipo);
 return doc ? { nome:doc.nomeArquivo, extensao:"pdf", contentType:"application/pdf", conteudoEmBase64:"" } : undefined;
}

// Mesmas regras de upload adotadas na plataforma para documentos do certame (formato e tamanho).
const TAMANHO_MAXIMO_DOCUMENTO_CERTAME = 10 * 1024 * 1024;
const EXTENSOES_DOCUMENTO_CERTAME = ["pdf"];
const SIGADOC_URL = "https://www.sigadoc.apmt.mt.gov.br/siga/public/app/login";

function arquivoDocumentoCertameValido(arquivo:File):boolean {
 const extensao = arquivo.name.split(".").pop()?.toLowerCase() ?? "";
 return EXTENSOES_DOCUMENTO_CERTAME.includes(extensao) && arquivo.size <= TAMANHO_MAXIMO_DOCUMENTO_CERTAME;
}

function formatarTamanhoArquivo(tamanho?:string | number):string {
 if (tamanho === undefined || tamanho === null || tamanho === "") return "—";
 if (typeof tamanho === "string") return tamanho;
 if (tamanho < 1024) return `${tamanho} B`;
 if (tamanho < 1024 * 1024) return `${(tamanho / 1024).toFixed(1)} KB`;
 return `${(tamanho / (1024 * 1024)).toFixed(1)} MB`;
}

// Vínculo automático cargo → Quadro de Vagas (Controle de Vagas > Quadro Autorizado), por nome do cargo.
function buscarQuadroPorCargo(nome:string) {
 const alvo = nome.trim().toLocaleLowerCase("pt-BR");
 if (!alvo) return undefined;
 return CARGOS_CADASTRADOS.find((item) => item.nome.trim().toLocaleLowerCase("pt-BR") === alvo);
}

export function CertameFormContent() {
 const { certames } = useControlePssStore();
 const navigate = useNavigate();
 const { id } = useParams<{ id?:string }>();
 const [searchParams] = useSearchParams();
 const modoNovo = !id || id === "novo";
 const existente = modoNovo ? undefined : certames.find((item) => item.id === id);

 const abaParam = searchParams.get("aba") as Aba | null;
 const [aba, setAba] = useState<Aba>(!modoNovo && abaParam === "SITUACOES" ? "SITUACOES" : "IDENTIFICACAO");
 // RN-06.1: no cadastro de um novo certame, o tipo precisa ser definido antes de liberar o restante do formulário.
 const [tipoConfirmado, setTipoConfirmado] = useState(!modoNovo);
 const { control, handleSubmit, watch, setValue } = useForm<CertameFormValues>({ defaultValues: valoresIniciais(existente, certames) });
 const valores = watch();
 const dispensarParaProcessoSeletivo = valores.tipoCertame === "PSS";
 const dispensarParaConcurso = valores.tipoCertame === "CONCURSO_PUBLICO";
 const houveContratacaoEmpresa = valores.tipoContratacaoExecucao === "EMPRESA_CONTRATADA";

 // Com a consolidação de 8 para 4 abas, uma mensagem de erro precisa apontar não só a aba, mas o
 // bloco (subtítulo) dentro dela — este estado guarda o id do bloco a rolar/destacar (blocoClasse).
 const [blocoDestaque, setBlocoDestaque] = useState<string | null>(null);
 useEffect(() => {
  if (!blocoDestaque) return undefined;
  const elemento = document.getElementById(blocoDestaque);
  elemento?.scrollIntoView({ behavior:"smooth", block:"start" });
  const temporizador = setTimeout(() => setBlocoDestaque(null), 2500);
  return () => clearTimeout(temporizador);
 }, [blocoDestaque, aba]);
 const blocoClasse = (idBloco:string) => `prototype-certame-bloco${blocoDestaque === idBloco ? " prototype-certame-bloco--destaque" : ""}`;
 const irParaBloco = (novaAba:Aba, idBloco:string) => { setAba(novaAba); setBlocoDestaque(idBloco); };

 // A validade em dias é recalculada automaticamente sempre que a data de validade (ou a publicação
 // do edital, que serve de marco inicial) é informada, evitando que os dois campos fiquem divergentes.
 useEffect(() => {
  const dias = calcularValidadeDias(valores.dataPublicacaoEdital, valores.dataValidade);
  if (dias !== undefined) setValue("validadeConcursoDias", dias);
 }, [valores.dataPublicacaoEdital, valores.dataValidade, setValue]);

 const selecionarTipoCertame = (tipo:TipoCertame) => {
  const concurso = tipo === "CONCURSO_PUBLICO";
  setValue("tipoCertame", tipo);
  setValue("tipoConcursoAplic", concurso ? "1" : "4");
  setValue("regimeJuridico", concurso ? "ESTATUTARIO" : "ESPECIAL");
  setValue("tipoVinculo", concurso ? "EFETIVO" : "CONTRATO_TEMPORARIO");
  setTipoConfirmado(true);
 };

 const [cotas, setCotas] = useState<CotaCertame[]>(existente ? [...existente.cotas] : []);
 const cotaForm = useForm<CotaFormValues>({ defaultValues: { tipo:TIPOS_COTA[0].value, lei:"" } });

 const [cargos, setCargos] = useState<CargoVagaCertame[]>(existente ? [...existente.cargos] : []);
 const cargoForm = useForm<CargoFormValues>({ defaultValues: { vinculo:"NOVO", cargoExistenteId:undefined, cargoNome:"", quantidadeVagas:0, vagaPcd:"N", quantidadePcd:0 } });
 const cargoValores = cargoForm.watch();
 const cargoNomeAtual = cargoValores.vinculo === "EXISTENTE" ? CARGOS_CADASTRADOS.find((item) => item.id === cargoValores.cargoExistenteId)?.nome ?? "" : cargoValores.cargoNome;
 const quadroVinculado = buscarQuadroPorCargo(cargoNomeAtual ?? "");

 const [fases, setFases] = useState<FaseCertame[]>(existente ? [...existente.fases] : [...FASES_TCE_FIXAS]);
 const [faseArrastada, setFaseArrastada] = useState<number | null>(null);

 const [arquivos, setArquivos] = useState<Partial<Record<TipoDocumentoCertame, ArquivoAnexadoSeplag>>>(() =>
  Object.fromEntries(DOCUMENTOS_CERTAME.map((item) => [item.tipo, arquivoExistente(existente, item.tipo as TipoDocumentoCertame)]).filter(([, valor]) => valor)) as Partial<Record<TipoDocumentoCertame, ArquivoAnexadoSeplag>>,
 );
 const [documentoVisualizando, setDocumentoVisualizando] = useState<TipoDocumentoCertame | null>(null);
 // Força o remount da tabela: o DataTable do PrimeReact não repinta o body das colunas em re-render simples.
 const [documentosVersao, setDocumentosVersao] = useState(0);
 // Modo de assinatura dos documentos do certame — mesmo campo e funcionalidade do módulo de Ingresso.
 const [formaAssinaturaDocumentos, setFormaAssinaturaDocumentos] = useState<"fisica" | "sigadoc">("sigadoc");
 const [processosSigadocDocumentos, setProcessosSigadocDocumentos] = useState<Partial<Record<TipoDocumentoCertame, string>>>({});
 const [documentoUploadSigadoc, setDocumentoUploadSigadoc] = useState<TipoDocumentoCertame | null>(null);
 const [processoUploadSigadoc, setProcessoUploadSigadoc] = useState("");
 const [arquivoUploadSigadoc, setArquivoUploadSigadoc] = useState<File | null>(null);
 const [erroUploadSigadoc, setErroUploadSigadoc] = useState(false);
 const criarUploadHandler = (tipo:TipoDocumentoCertame) => (event:{ files?:File[] }) => {
  const selecionado = event.files?.[0];
  if (!selecionado) return;
  if (!arquivoDocumentoCertameValido(selecionado)) {
   setErro("Documento inválido: formato aceito .pdf, com até 10MB.");
   return;
  }
  setErro(null);
  const reader = new FileReader();
  reader.onload = () => {
   setArquivos((atuais) => ({ ...atuais, [tipo]: { nome:selecionado.name, extensao:"pdf", contentType:selecionado.type, conteudoEmBase64:String(reader.result).split(",")[1] ?? "", tamanho:selecionado.size } }));
   setDocumentosVersao((versao) => versao + 1);
  };
  reader.readAsDataURL(selecionado);
 };
 const abrirUploadSigadoc = (tipo:TipoDocumentoCertame) => {
  setDocumentoUploadSigadoc(tipo);
  setProcessoUploadSigadoc(processosSigadocDocumentos[tipo] ?? "");
  setArquivoUploadSigadoc(null);
  setErroUploadSigadoc(false);
 };
 const salvarUploadSigadoc = () => {
  if (!documentoUploadSigadoc || !processoUploadSigadoc.trim() || !arquivoUploadSigadoc || !arquivoDocumentoCertameValido(arquivoUploadSigadoc)) {
   setErroUploadSigadoc(true);
   return;
  }
  setErroUploadSigadoc(false);
  setProcessosSigadocDocumentos((atuais) => ({ ...atuais, [documentoUploadSigadoc]: processoUploadSigadoc.trim() }));
  criarUploadHandler(documentoUploadSigadoc)({ files:[arquivoUploadSigadoc] });
  setDocumentoUploadSigadoc(null);
 };

 const [erro, setErro] = useState<string | null>(null);
 const situacaoForm = useForm<SituacaoFormValues>({ defaultValues: { tipo:"HOMOLOGADO" } });

 // RN-20: Demonstrativo LRF é sempre obrigatório (obrigatorioSempre:true no domínio) — não depende
 // mais do checkbox "gerou despesas". RN-21: Publicação do certame licitatório passa a seguir o
 // mesmo gatilho do Contrato social — RN-22 unificou esse gatilho em "tipoContratacaoExecucao".
 const documentoObrigatorio = (tipo:string, obrigatorioSempre:boolean) => obrigatorioSempre
  || ((tipo === "CONTRATO_SOCIAL_EMPRESA" || tipo === "PUBLICACAO_CERTAME_LICITATORIO") && houveContratacaoEmpresa);

 const colunasCotas:ColumnMetaSeplag<CotaCertame>[] = [
  { header:"Tipo de cota", body:(row) => TIPOS_COTA.find((tipo) => tipo.value === row.tipo)?.label ?? row.tipo },
  { header:"Lei", body:(row) => LEIS_CERTAME.find((lei) => lei.value === row.lei)?.label ?? row.lei },
 ];

 const colunasCargos:ColumnMetaSeplag<CargoVagaCertame>[] = [
  { field:"cargoNome", header:"Cargo" },
  { header:"Vínculo", body:(row) => row.vinculo === "EXISTENTE" ? "Vaga existente" : "Vaga nova do certame" },
  { header:"Quadro de vagas", body:(row) => row.quadroCodigo
   ? <button type="button" className="prototype-certame-link-btn" onClick={() => navigate(`${CONTROLE_VAGAS_BASE_PATH}/quadro-autorizado`)}><strong>{row.quadroCodigo}</strong><small>Versão {row.quadroVersao}</small></button>
   : <span className="text-color-secondary">—</span> },
  { field:"codigoReferenciaTce", header:"Cód. referência TCE" },
  { field:"quantidadeVagas", header:"Vagas" },
  { header:"PCD", body:(row) => row.vagaPcd ? row.quantidadePcd ?? 0 : 0 },
 ];


 const colunasDocumentos:ColumnMetaSeplag<typeof DOCUMENTOS_CERTAME[number]>[] = [
  { header:"Documento", body:(row) => <>{row.label}{documentoObrigatorio(row.tipo, row.obrigatorioSempre) && " *"}</> },
  { header:"Arquivo anexado", body:(row) => arquivos[row.tipo as TipoDocumentoCertame]?.nome ?? <span className="text-color-secondary">Nenhum arquivo anexado</span> },
  { header:"Tamanho", body:(row) => formatarTamanhoArquivo(arquivos[row.tipo as TipoDocumentoCertame]?.tamanho) },
  ...(formaAssinaturaDocumentos === "sigadoc" ? [{ header:"Nº Processo SIGADOC", body:(row) => processosSigadocDocumentos[row.tipo as TipoDocumentoCertame] || <span className="text-color-secondary">—</span> } as ColumnMetaSeplag<typeof DOCUMENTOS_CERTAME[number]>] : []),
 ];

 const renderAcoesDocumento = (row:typeof DOCUMENTOS_CERTAME[number]) => {
  const tipo = row.tipo as TipoDocumentoCertame;
  const arquivo = arquivos[tipo];
  const usaSigadoc = formaAssinaturaDocumentos === "sigadoc";
  const inputId = `certame-doc-upload-${row.tipo}`;
  return <>
   {!usaSigadoc && <input id={inputId} type="file" accept="application/pdf" style={{ display:"none" }} onChange={(event) => { const arquivoSelecionado = event.target.files?.[0]; if (arquivoSelecionado) criarUploadHandler(tipo)({ files:[arquivoSelecionado] }); event.target.value = ""; }} />}
   <BotaoIconSeplag type="button" icon="pi pi-cloud-upload" tooltip={arquivo ? (usaSigadoc ? "Documento já enviado" : "Substituir documento") : "Anexar documento"} disabled={usaSigadoc && Boolean(arquivo)} onClick={() => { if (usaSigadoc) abrirUploadSigadoc(tipo); else document.getElementById(inputId)?.click(); }} />
   {usaSigadoc && <BotaoIconSeplag type="button" icon="pi pi-link" tooltip="Acessar SIGADOC" onClick={() => window.open(SIGADOC_URL, "_blank", "noopener,noreferrer")} />}
   <BotaoIconSeplag type="button" icon="pi pi-eye" tooltip="Visualizar documento" disabled={!arquivo} onClick={() => setDocumentoVisualizando(tipo)} />
   <BotaoIconSeplag type="button" icon="pi pi-trash" severity="danger" tooltip="Remover documento" disabled={!arquivo} onClick={() => { setArquivos((atuais) => ({ ...atuais, [tipo]: undefined })); setProcessosSigadocDocumentos((atuais) => ({ ...atuais, [tipo]: undefined })); setDocumentosVersao((versao) => versao + 1); }} />
  </>;
 };

 const salvar = handleSubmit((dados) => {
  setErro(null);
  // RN-23 (ER143): número do certame (TCE-MT) não pode se repetir para o mesmo tipo e exercício.
  if (certameDuplicado(certames, dados, existente?.id)) { setErro("Já existe um certame aberto com esse número e tipo. Verifique."); irParaBloco("IDENTIFICACAO", "bloco-identificacao"); return; }
  if (cargos.length === 0) { setErro("Informe ao menos um cargo/vaga para salvar o certame (RN-14, Cenário 1)."); irParaBloco("VAGAS_COTAS", "bloco-cargos-vagas"); return; }
  const documentosFaltando = DOCUMENTOS_CERTAME.filter((doc) => documentoObrigatorio(doc.tipo, doc.obrigatorioSempre) && !arquivos[doc.tipo as TipoDocumentoCertame]);
  if (documentosFaltando.length > 0) { setErro(`Documento obrigatório pendente: ${documentosFaltando.map((doc) => doc.label).join(", ")}.`); irParaBloco("DOCUMENTOS", "bloco-documentos"); return; }

  const agora = CONTROLE_PSS_DATA_REFERENCIA.split("-").reverse().join("/");
  const documentos = DOCUMENTOS_CERTAME.filter((doc) => arquivos[doc.tipo as TipoDocumentoCertame]).map((doc) => ({ tipo:doc.tipo as TipoDocumentoCertame, nomeArquivo:arquivos[doc.tipo as TipoDocumentoCertame]!.nome, anexadoEm:agora }));
  // RN-22: "houveContratacaoBanca" deixou de ser um campo do formulário e passa a ser derivado do
  // Tipo de contratação (execução), única fonte de verdade.
  const houveContratacaoBanca = dados.tipoContratacaoExecucao === "EMPRESA_CONTRATADA";

  if (existente) {
   controlePssStore.set("certames", (atuais) => atuais.map((item) => item.id === existente.id ? {
    ...item, ...dados, existePrevisaoRecursos:dados.existePrevisaoRecursos === "S", houveContratacaoBanca, gerouDespesas:dados.gerouDespesas === "S", cobraTaxaInscricao:dados.cobraTaxaInscricao === "S",
    cotas, cargos, fases, documentos, atualizadoEm:agora,
   } : item));
   navigate(`${BASE}/certames/${existente.id}`);
   return;
  }
  const novoId = `CERT-${dados.anoConcurso}-${dados.numeroConcurso.slice(-3)}`;
  const novo:Certame = {
   id:novoId, ...dados, existePrevisaoRecursos:dados.existePrevisaoRecursos === "S", houveContratacaoBanca, gerouDespesas:dados.gerouDespesas === "S", cobraTaxaInscricao:dados.cobraTaxaInscricao === "S",
   cotas, cargos, fases, documentos,
   situacaoAtual:"ABERTO",
   historicoSituacoes:[{ id:`SIT-${novoId}-1`, certameId:novoId, tipo:"ABERTO", dataEfeito:dados.dataPublicacaoEdital, registradoEm:`${agora} 09:00`, usuario:"SUGP/SEPLAG", prazoPrestacaoContas:calcularPrazoPrestacaoContas(dados.dataPublicacaoEdital) }],
   criadoEm:agora, atualizadoEm:agora, responsavel:"SUGP/SEPLAG",
  };
  controlePssStore.set("certames", (atuais) => [...atuais, novo]);
  navigate(`${BASE}/certames/${novoId}`);
 });

 const adicionarCota = () => {
  const dados = cotaForm.getValues();
  if (!dados.lei) return;
  setCotas((atuais) => [...atuais, { id:`COTA-${Date.now()}`, tipo:dados.tipo, lei:dados.lei }]);
  cotaForm.reset({ tipo:TIPOS_COTA[0].value, lei:"" });
 };
 const removerCota = (idCota:string) => setCotas((atuais) => atuais.filter((item) => item.id !== idCota));

 const adicionarCargo = () => {
  const dados = cargoForm.getValues();
  const cargoExistente = dados.vinculo === "EXISTENTE" ? CARGOS_CADASTRADOS.find((item) => item.id === dados.cargoExistenteId) : undefined;
  const cargoNome = dados.vinculo === "EXISTENTE" ? cargoExistente?.nome ?? "" : dados.cargoNome;
  if (!cargoNome || dados.quantidadeVagas <= 0) return;
  const quadro = cargoExistente ?? buscarQuadroPorCargo(cargoNome);
  setCargos((atuais) => [...atuais, { id:`CGV-${Date.now()}`, vinculo:dados.vinculo, cargoExistenteId:cargoExistente?.id, cargoNome, codigoReferenciaTce:"001", quantidadeVagas:dados.quantidadeVagas, vagaPcd:dados.vagaPcd === "S", quantidadePcd:dados.vagaPcd === "S" ? dados.quantidadePcd : undefined, quadroCodigo:quadro?.quadroCodigo, quadroVersao:quadro?.quadroVersao }]);
  cargoForm.reset({ vinculo:"NOVO", cargoExistenteId:undefined, cargoNome:"", quantidadeVagas:0, vagaPcd:"N", quantidadePcd:0 });
 };
 const removerCargo = (idCargo:string) => setCargos((atuais) => atuais.filter((item) => item.id !== idCargo));

 const renumerarFases = (lista:FaseCertame[]) => lista.map((item, index) => ({ ordem:index + 1, nome:item.nome, dataInicio:item.dataInicio, dataFim:item.dataFim }));
 const adicionarFase = () => setFases((atuais) => [...atuais, { ordem:atuais.length + 1, nome:"", dataInicio:"", dataFim:"" }]);
 const atualizarFase = (ordem:number, alteracoes:Partial<Pick<FaseCertame, "nome" | "dataInicio" | "dataFim">>) =>
  setFases((atuais) => atuais.map((item) => item.ordem === ordem ? { ...item, ...alteracoes } : item));
 const removerFase = (ordem:number) => setFases((atuais) => renumerarFases(atuais.filter((item) => item.ordem !== ordem)));
 const moverFase = (ordemOrigem:number, ordemDestino:number) => {
  if (ordemOrigem === ordemDestino) return;
  setFases((atuais) => {
   const lista = [...atuais];
   const indiceOrigem = lista.findIndex((item) => item.ordem === ordemOrigem);
   const indiceDestino = lista.findIndex((item) => item.ordem === ordemDestino);
   if (indiceOrigem === -1 || indiceDestino === -1) return atuais;
   const [movida] = lista.splice(indiceOrigem, 1);
   lista.splice(indiceDestino, 0, movida);
   return renumerarFases(lista);
  });
 };

 const registrarSituacao = () => {
  if (!existente) return;
  const dados = situacaoForm.getValues();
  if (!dados.data) return;
  // RN-24d — mesma lógica de RN-07/CA05, aplicada à data de efeito da situação.
  if (dataEfeitoAnteriorPublicacao(dados.data, existente.dataPublicacaoEdital)) { setErro("A data de efeito não pode ser anterior à publicação do edital (RN-24d)."); return; }
  // RN-24a (ER142).
  if (dados.tipo === "RETIFICACAO_EDITAL" && !podeRegistrarRetificacaoEdital(existente.historicoSituacoes)) { setErro("Não é possível registrar Retificação de Edital: o certame ainda não possui um registro de abertura (Aberto) no histórico (RN-24a)."); return; }
  // RN-24b (ER144).
  if (dados.tipo === "HOMOLOGADO" && homologacaoVigenteSemCancelamento(existente.historicoSituacoes)) { setErro("Já existe uma Homologação registrada para este certame sem Cancelamento/Anulação posterior (RN-24b)."); return; }
  // RN-24c (ER145).
  if (dados.tipo === "RETIFICACAO_HOMOLOGACAO" && !podeRegistrarRetificacaoHomologacao(existente.historicoSituacoes)) { setErro("Não é possível registrar Retificação de Homologação sem um registro de Homologado anterior no histórico (RN-24c)."); return; }
  setErro(null);
  const prazo = calcularPrazoPrestacaoContas(dados.data);
  const registro = { id:`SIT-${existente.id}-${existente.historicoSituacoes.length + 1}`, certameId:existente.id, tipo:dados.tipo, dataEfeito:dados.data, registradoEm:`${CONTROLE_PSS_DATA_REFERENCIA.split("-").reverse().join("/")} ${new Date().toTimeString().slice(0, 5)}`, usuario:"SUGP/SEPLAG", prazoPrestacaoContas:prazo };
  controlePssStore.set("certames", (atuais) => atuais.map((item) => item.id === existente.id ? { ...item, situacaoAtual:dados.tipo, historicoSituacoes:[...item.historicoSituacoes, registro], atualizadoEm:dados.data! } : item));
  situacaoForm.reset({ tipo:"HOMOLOGADO", data:"" });
 };

 // As 4 abas fixas são exibidas para os dois tipos de certame (RN-06, seção 3); apenas o bloco de
 // Prazos de posse/exercício, dentro de "Identificação e Cronograma", continua dispensado para PSS (RN-06.3).
 const abas:TabItemSeplag<Aba>[] = useMemo(() => {
  const comSituacoes = modoNovo ? abasBase : [...abasBase, { id:"SITUACOES" as Aba, label:"Situações" }];
  return comSituacoes.map((item) => ({ id:item.id, label:item.label, value:item.id }));
 }, [modoNovo]);

 useEffect(() => { if (!abas.some((item) => item.id === aba)) setAba("IDENTIFICACAO"); }, [abas, aba]);

 const abasFluxo = abas.filter((item) => item.id !== "SITUACOES");
 const indiceAbaAtual = abasFluxo.findIndex((item) => item.id === aba);
 const ehUltimaAba = indiceAbaAtual === abasFluxo.length - 1;
 const avancar = () => { if (indiceAbaAtual >= 0 && indiceAbaAtual < abasFluxo.length - 1) setAba(abasFluxo[indiceAbaAtual + 1].id as Aba); };
 // Volta uma etapa do fluxo (mantendo os dados já preenchidos); na primeira etapa, sai para a listagem.
 const voltar = () => { if (indiceAbaAtual > 0) { setAba(abasFluxo[indiceAbaAtual - 1].id as Aba); return; } navigate(`${BASE}/certames`); };

 if (!modoNovo && !existente) return <div className="prototype-page-content prototype-page-content--white"><CardSeplag title="Certame não encontrado"><p className="col-12">O certame solicitado não foi localizado.</p></CardSeplag></div>;

 if (modoNovo && !tipoConfirmado) return <SpecificationMode screen={certameFormScreenSpecification} businessItems={certameFormBusinessItems}>
  <div className="prototype-page-content prototype-page-content--white">
   <CardSeplag
    title="Novo certame"
    footer={<div className="col-12 flex justify-content-end"><BotaoVoltarSeplag type="button" onClick={() => navigate(`${BASE}/certames`)} /></div>}
   >
    <SpecArea metadata={certameFormBlockSpecifications.seletorTipo}><div className="col-12 prototype-certame-tipo-gate">
     <p>Antes de continuar, selecione o tipo de certame.</p>
     <div className="prototype-certame-tipo-gate-options">
      {TIPOS_CERTAME.map((item) => <button key={item.value} type="button" className="prototype-certame-tipo-card" onClick={() => selecionarTipoCertame(item.value)}>
       <strong>{item.label}</strong>
       <span>Sigla: {item.value === "CONCURSO_PUBLICO" ? "Conc" : "PSS"}</span>
      </button>)}
     </div>
    </div></SpecArea>
   </CardSeplag>
  </div>
 </SpecificationMode>;

 return <SpecificationMode screen={certameFormScreenSpecification} businessItems={certameFormBusinessItems}>
  <div className="prototype-page-content prototype-page-content--white">
   <form onSubmit={salvar}>
    <CardSeplag
     title={modoNovo ? "Novo certame" : `${existente?.numeroEditalOrgao} — ${existente?.nomeEdital}`}
     actions={!modoNovo && existente ? <BadgeSeplag label={situacaoLabel[existente.situacaoAtual]} color={situacaoEstilo[existente.situacaoAtual].color} bg={situacaoEstilo[existente.situacaoAtual].bg} border="transparent" size="md" /> : undefined}
     footer={aba !== "SITUACOES" ? <div className="col-12 flex justify-content-end align-items-center gap-2">
      <BotaoVoltarSeplag type="button" onClick={voltar} />
      {ehUltimaAba
       ? <SpecArea metadata={certameFormActionSpecifications["Salvar certame"]}><BotaoSalvarSeplag type="submit" label="Salvar certame" /></SpecArea>
       : <BotaoSeplag type="button" label="Avançar" icon="pi pi-arrow-right" iconPos="right" onClick={avancar} />}
     </div> : undefined}
    >
     {erro && <MensagemSeplag severity="error" message={erro} cols="12" />}

     <div className="col-12"><TabsSeplag items={abas} activeValue={aba} onChange={setAba} equalWidth /></div>

     {aba === "IDENTIFICACAO" && <SpecArea metadata={certameFormTabSpecifications["Identificação e Cronograma"]}><div className="col-12">

      <div id="bloco-identificacao" className={blocoClasse("bloco-identificacao")}>
       <h3>Identificação do certame</h3>
       <div className="grid">
        <RotuloSeplag nome="Tipo do certame" cols="12 6 4" obrigatorio><div className="prototype-certame-campo-fixo-valor">{TIPOS_CERTAME.find((item) => item.value === valores.tipoCertame)?.label}</div></RotuloSeplag>
        <RotuloSeplag nome="Tipo Concurso Aplic. (TCE-MT)" cols="12 6 4"><div className="prototype-certame-campo-fixo-valor">{TIPOS_CONCURSO_APLIC_TCE.find((item) => item.value === valores.tipoConcursoAplic)?.label}</div></RotuloSeplag>
        <NumberFieldSeplag name="anoConcurso" control={control} label="Ano do concurso" required cols="12 6 4" getFormErrorMessage={() => null} />
        {!modoNovo
         ? <SpecArea metadata={certameFormBlockSpecifications.mandanteBloqueado}><RotuloSeplag nome="Órgão responsável (mandante)" cols="12 6" obrigatorio><div className="prototype-certame-campo-fixo"><div className="prototype-certame-campo-fixo-valor">{valores.setor}</div><small>Bloqueado após o cadastro — RN-05.</small></div></RotuloSeplag></SpecArea>
         : <DropdownFieldSeplag name="setor" control={control} label="Órgão responsável (mandante)" required cols="12 6" options={ORGAOS_CERTAME.map((item) => ({ label:item, value:item }))} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={() => null} />}
        <MultiSelectFieldSeplag name="setoresParticipantes" control={control} label="Órgãos participantes" cols="12 6" options={ORGAOS_CERTAME.map((item) => ({ label:item, value:item }))} optionLabel="label" optionValue="value" placeholder="(selecione)" display="chip" getFormErrorMessage={() => null} />
        <TextFieldSeplag name="numeroEditalOrgao" control={control} label="Número do edital do órgão" required cols="12 6 4" placeholder="Ex.: 001/SEPLAG/2026" getFormErrorMessage={() => null} />
        <MaskFieldSeplag name="numeroConcurso" control={control} label="Número do certame (TCE-MT)" required cols="12 6 4" mask="99999999999" placeholder="00000000000" getFormErrorMessage={() => null} />
        <TextFieldSeplag name="nomeEdital" control={control} label="Nome do edital" required cols="12" placeholder="[NÚMERO]/[ÓRGÃO]/[ANO] [descrição livre]" getFormErrorMessage={() => null} />
        <DropdownFieldSeplag name="regimeJuridico" control={control} label="Regime jurídico" required cols="12 6 4" options={[...REGIMES_JURIDICOS]} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={() => null} />
        {dispensarParaConcurso
         ? <RotuloSeplag nome="Tipo de vínculo" cols="12 6 4" obrigatorio><div className="prototype-certame-campo-fixo"><div className="prototype-certame-campo-fixo-valor">Nomeado Efetivo</div><small>Fixo para Concurso Público.</small></div></RotuloSeplag>
         : <DropdownFieldSeplag name="tipoVinculo" control={control} label="Tipo de vínculo" required cols="12 6 4" options={[...TIPOS_VINCULO]} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={() => null} />}
        <DropdownFieldSeplag name="leiContratoTemporario" control={control} label={dispensarParaConcurso ? "Lei do concurso" : "Lei de contrato temporário"} required={dispensarParaConcurso || valores.tipoVinculo === "CONTRATO_TEMPORARIO"} cols="12 6 4" options={[...LEIS_CERTAME]} optionLabel="label" optionValue="value" placeholder="Buscar lei cadastrada" getFormErrorMessage={() => null} />
        {dispensarParaProcessoSeletivo && <DropdownFieldSeplag name="leiProcessoSeletivoSimplificado" control={control} label="Lei do processo seletivo" required cols="12 6 4" options={[...LEIS_CERTAME]} optionLabel="label" optionValue="value" placeholder="Buscar lei cadastrada" getFormErrorMessage={() => null} />}
        <TextAreaFieldSeplag name="objetivo" control={control} label="Objetivo" cols="12" maxLength={1000} getFormErrorMessage={() => null} />
       </div>
      </div>

      <div id="bloco-datas-execucao" className={blocoClasse("bloco-datas-execucao")}>
       <h3>Datas e execução</h3>
       <div className="grid">
        <DateFieldSeplag name="dataPublicacaoEdital" control={control} label="Data de publicação do edital" required cols="12 6 3" getFormErrorMessage={() => null} />
        <DateFieldSeplag name="dataRealizacao" control={control} label="Data de realização" cols="12 6 3" validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" getFormErrorMessage={() => null} />
        <DateFieldSeplag name="dataValidade" control={control} label="Data de validade" cols="12 6 3" validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" getFormErrorMessage={() => null} />
        <DateFieldSeplag name="dataResultado" control={control} label="Data do resultado" cols="12 6 3" validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" getFormErrorMessage={() => null} />
        <DateFieldSeplag name="inicioInscricoesGerais" control={control} label="Início das inscrições gerais" cols="12 6 3" validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" getFormErrorMessage={() => null} />
        <DateFieldSeplag name="fimInscricoesGerais" control={control} label="Fim das inscrições gerais" cols="12 6 3" validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" getFormErrorMessage={() => null} />
        {!dispensarParaProcessoSeletivo && <DateFieldSeplag name="dataProrrogacao" control={control} label="Data de prorrogação" cols="12 6 3" validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" getFormErrorMessage={() => null} />}
        {!dispensarParaProcessoSeletivo && <DateFieldSeplag name="dataCancelamento" control={control} label="Data de cancelamento" cols="12 6 3" validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" getFormErrorMessage={() => null} />}
        <NumberFieldSeplag name="validadeConcursoDias" control={control} label={dispensarParaProcessoSeletivo ? "Validade do processo seletivo (dias)" : "Validade do concurso (dias)"} cols="12 6 4" getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="previsaoProrrogacaoDias" control={control} label="Previsão para prorrogação (dias)" cols="12 6 4" getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="prorrogacaoValidadeDias" control={control} label="Prorrogação da validade (dias)" cols="12 6 4" getFormErrorMessage={() => null} />
        <CheckboxFieldSeplag name="existePrevisaoRecursos" control={control} label=" " checkboxLabel="Existe previsão de recursos?" cols="12" getFormErrorMessage={() => null} />
       </div>
      </div>

      <SpecArea metadata={certameFormBlockSpecifications.fasesFixas}><div id="bloco-fases" className={`${blocoClasse("bloco-fases")} prototype-certame-fases`}>
       <div className="prototype-certame-fases-head">
        <h3>Fases do certame</h3>
        <BotaoAdicionarSeplag type="button" label="Adicionar fase" onClick={adicionarFase} />
       </div>
       <div className="prototype-certame-fase-header">
        <span />
        <span>Nome da fase</span>
        <span>Data início</span>
        <span>Data fim</span>
        <span />
       </div>
       <div className="prototype-certame-fase-list">
        {fases.map((fase) => <div
         key={fase.ordem}
         className="prototype-certame-fase-row"
         draggable
         onDragStart={() => setFaseArrastada(fase.ordem)}
         onDragOver={(event) => event.preventDefault()}
         onDrop={() => { if (faseArrastada !== null) moverFase(faseArrastada, fase.ordem); setFaseArrastada(null); }}
         onDragEnd={() => setFaseArrastada(null)}
        >
         <i className="pi pi-bars prototype-certame-fase-drag-handle" aria-hidden="true" />
         <label>
          <span className="prototype-certame-fase-visually-hidden">Nome da fase</span>
          <input type="text" aria-label="Nome da fase" value={fase.nome} onChange={(event) => atualizarFase(fase.ordem, { nome:event.target.value })} />
         </label>
         <label>
          <span className="prototype-certame-fase-visually-hidden">Data início da fase</span>
          <input type="text" aria-label="Data início da fase" placeholder="dd/mm/aaaa" value={fase.dataInicio ?? ""} onChange={(event) => atualizarFase(fase.ordem, { dataInicio:event.target.value })} />
         </label>
         <label>
          <span className="prototype-certame-fase-visually-hidden">Data fim da fase</span>
          <input type="text" aria-label="Data fim da fase" placeholder="dd/mm/aaaa" value={fase.dataFim ?? ""} onChange={(event) => atualizarFase(fase.ordem, { dataFim:event.target.value })} />
         </label>
         <button type="button" className="prototype-certame-fase-remove" aria-label="Remover fase" title="Remover fase" onClick={() => removerFase(fase.ordem)}>
          <i className="pi pi-times" aria-hidden="true" />
         </button>
        </div>)}
       </div>
      </div></SpecArea>

      {/* RN-06.3: bloco de Prazos de posse/exercício continua dispensado para Processo Seletivo. */}
      {!dispensarParaProcessoSeletivo && <div id="bloco-prazos" className={blocoClasse("bloco-prazos")}>
       <h3>Prazos de posse/exercício</h3>
       <div className="grid">
        <NumberFieldSeplag name="diasPrazoExercicio" control={control} label="Dias — prazo de exercício" cols="12 6 3" getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="diasPrazoPosse" control={control} label="Dias — prazo de posse" cols="12 6 3" getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="diasPrazoProrrogacaoExercicio" control={control} label="Dias — prorrogação do exercício" cols="12 6 3" getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="diasPrazoProrrogacaoPosse" control={control} label="Dias — prorrogação da posse" cols="12 6 3" getFormErrorMessage={() => null} />
       </div>
      </div>}

     </div></SpecArea>}

     {aba === "FINANCEIRO" && <SpecArea metadata={certameFormTabSpecifications["Contrato e custo"]}><div className="col-12">

      <div id="bloco-contratacao-custos" className={blocoClasse("bloco-contratacao-custos")}>
       <h3>Contratação e custos</h3>
       <div className="grid">
        {/* RN-22: "Houve contratação de banca/empresa organizadora?" foi removido — o gatilho único
            passa a ser "Tipo de contratação (execução)". Abrangência, Tipo de contratação (execução)
            e Instituição realizadora foram trazidos do bloco Datas e execução para cá, na primeira linha. */}
        <DropdownFieldSeplag name="abrangencia" control={control} label="Abrangência" required cols="12 6 4" options={[...ABRANGENCIAS]} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={() => null} />
        <DropdownFieldSeplag name="tipoContratacaoExecucao" control={control} label="Tipo de contratação (execução)" required cols="12 6 4" options={[...TIPOS_CONTRATACAO_EXECUCAO]} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={() => null} />
        {houveContratacaoEmpresa && <DropdownFieldSeplag name="instituicaoRealizadora" control={control} label="Instituição realizadora" required cols="12 6 4" options={[...EMPRESAS_CADASTRADAS]} optionLabel="label" optionValue="value" placeholder="Selecione a empresa cadastrada" getFormErrorMessage={() => null} />}
        <CheckboxFieldSeplag name="gerouDespesas" control={control} label=" " checkboxLabel="O certame gerou despesas para o fiscalizado?" cols="12" getFormErrorMessage={() => null} />
        <DropdownFieldSeplag name="tipoContrato" control={control} label="Tipo de contrato" required={houveContratacaoEmpresa} cols="12 6 4" options={[...TIPOS_CONTRATO_BANCA]} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={() => null} />
        <TextFieldSeplag name="numeroEmpenho" control={control} label="Número do empenho" required={houveContratacaoEmpresa} cols="12 6 4" getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="anoEmpenho" control={control} label="Ano do empenho" cols="12 6 4" getFormErrorMessage={() => null} />
        <TextFieldSeplag name="numeroContrato" control={control} label="Número do contrato" required={houveContratacaoEmpresa} cols="12 6 4" getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="anoContrato" control={control} label="Ano do contrato" cols="12 6 4" getFormErrorMessage={() => null} />
        <TextFieldSeplag name="numeroAditivo" control={control} label="Número do aditivo" required={houveContratacaoEmpresa} cols="12 6 4" getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="anoAditivo" control={control} label="Ano do aditivo" cols="12 6 4" getFormErrorMessage={() => null} />
        <TextFieldSeplag name="codigoUo" control={control} label="Código da UO" cols="12 6 4" getFormErrorMessage={() => null} />
        <TextFieldSeplag name="codigoUg" control={control} label="Código da UG" cols="12 6 4" getFormErrorMessage={() => null} />
       </div>
      </div>

      <div id="bloco-taxa-inscricao" className={blocoClasse("bloco-taxa-inscricao")}>
       <h3>Taxa de inscrição</h3>
       <div className="grid">
        <CheckboxFieldSeplag name="cobraTaxaInscricao" control={control} label=" " checkboxLabel="O certame cobra taxa de inscrição?" cols="12" getFormErrorMessage={() => null} />
        <CurrencyFieldSeplag name="valorInscricao" control={control} label="Valor da inscrição" required={valores.cobraTaxaInscricao === "S"} cols="12 6 4" getFormErrorMessage={() => null} />
        <DateFieldSeplag name="dataInicioInscricaoIsencao" control={control} label="Início da inscrição com isenção" cols="12 6 4" getFormErrorMessage={() => null} />
        <DateFieldSeplag name="dataFimInscricaoIsencao" control={control} label="Fim da inscrição com isenção" cols="12 6 4" getFormErrorMessage={() => null} />
        <DropdownFieldSeplag name="tipoIsencao" control={control} label="Tipo da isenção" cols="12 6 4" options={[...TIPOS_ISENCAO]} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={() => null} />
        <DropdownFieldSeplag name="leiIsencao" control={control} label="Lei de isenção" cols="12 6 4" options={[...LEIS_CERTAME]} optionLabel="label" optionValue="value" placeholder="Buscar lei cadastrada" getFormErrorMessage={() => null} />
       </div>
      </div>

     </div></SpecArea>}

     {aba === "VAGAS_COTAS" && <SpecArea metadata={certameFormTabSpecifications["Vagas e Cotas"]}><div className="col-12">

      <div id="bloco-cotas" className={blocoClasse("bloco-cotas")}>
       <h3>Cotas</h3>
       <div className="grid align-items-end prototype-certame-subform">
        <DropdownFieldSeplag name="tipo" control={cotaForm.control} label="Tipo de cota" cols="12 6 4" options={[...TIPOS_COTA]} optionLabel="label" optionValue="value" getFormErrorMessage={() => null} />
        <DropdownFieldSeplag name="lei" control={cotaForm.control} label="Lei cadastrada" cols="12 6 6" options={[...LEIS_CERTAME]} optionLabel="label" optionValue="value" placeholder="Buscar lei cadastrada sobre cotas" getFormErrorMessage={() => null} />
        <div className="col-12 md:col-2"><BotaoAdicionarSeplag type="button" label="Adicionar" onClick={adicionarCota} /></div>
       </div>
       <TablePaginadoSeplag dataKey="id" data={resultadosSemPaginacao(cotas)} rows={50} paginator={false} lazy={false} selectionMode={null} columns={colunasCotas} hasEventoAcao handleView={null} handleEdit={null} handleDelete={(row) => removerCota(row.id)} handleOnPageChange={() => {}} />
      </div>

      <div id="bloco-cargos-vagas" className={blocoClasse("bloco-cargos-vagas")}>
       <h3>Cargos e vagas</h3>
       <div className="grid align-items-end prototype-certame-subform">
        <DropdownFieldSeplag name="vinculo" control={cargoForm.control} label="Vínculo da vaga" cols="12 6 3" options={[{ label:"Vaga nova do certame", value:"NOVO" }, { label:"Vaga existente no quadro", value:"EXISTENTE" }]} optionLabel="label" optionValue="value" getFormErrorMessage={() => null} />
        {cargoValores.vinculo === "EXISTENTE"
         ? <DropdownFieldSeplag name="cargoExistenteId" control={cargoForm.control} label="Cargo/função" cols="12 6 3" options={CARGOS_CADASTRADOS.map((item) => ({ label:item.nome, value:item.id }))} optionLabel="label" optionValue="value" placeholder="Buscar cargo cadastrado" getFormErrorMessage={() => null} />
         : <TextFieldSeplag name="cargoNome" control={cargoForm.control} label="Cargo/função" cols="12 6 3" placeholder="Nome do novo cargo" getFormErrorMessage={() => null} />}
        <SpecArea metadata={certameFormBlockSpecifications.quadroVagasVinculado}><RotuloSeplag nome="Quadro" cols="12 6 1"><div className="prototype-certame-campo-fixo-valor">{quadroVinculado ? `${quadroVinculado.quadroCodigo} — Versão ${quadroVinculado.quadroVersao}` : "—"}</div></RotuloSeplag></SpecArea>
        <NumberFieldSeplag name="quantidadeVagas" control={cargoForm.control} label="Qtd. vagas" cols="12 6 1" inputStyle={{ width:"100%" }} getFormErrorMessage={() => null} />
        <CheckboxFieldSeplag name="vagaPcd" control={cargoForm.control} label=" " checkboxLabel="PCD/PNE" cols="12 6 1" getFormErrorMessage={() => null} />
        {cargoValores.vagaPcd === "S" && <NumberFieldSeplag name="quantidadePcd" control={cargoForm.control} label="Qtd. PCD" cols="12 6 1" inputStyle={{ width:"100%" }} getFormErrorMessage={() => null} />}
        <div className="col-12 md:col-2 lg:col-2"><BotaoAdicionarSeplag type="button" label="Adicionar" onClick={adicionarCargo} /></div>
       </div>
       <TablePaginadoSeplag dataKey="id" data={resultadosSemPaginacao(cargos)} rows={50} paginator={false} lazy={false} selectionMode={null} columns={colunasCargos} hasEventoAcao handleView={null} handleEdit={null} handleDelete={(row) => removerCargo(row.id)} handleOnPageChange={() => {}} />
      </div>

     </div></SpecArea>}

     {aba === "DOCUMENTOS" && <SpecArea metadata={certameFormTabSpecifications["Documentos"]}><div id="bloco-documentos" className={`col-12 ${blocoClasse("bloco-documentos")}`}>
      <fieldset className="prototype-documentos-assinatura-selector">
       <legend>Modo de assinatura do documento</legend>
       <div className="prototype-documentos-assinatura-options">
        <label>
         <input type="radio" name="forma-assinatura-documentos-certame" value="fisica" checked={formaAssinaturaDocumentos === "fisica"} onChange={() => setFormaAssinaturaDocumentos("fisica")} />
         <span>Físico</span>
        </label>
        <label>
         <input type="radio" name="forma-assinatura-documentos-certame" value="digital" checked={formaAssinaturaDocumentos === "sigadoc"} onChange={() => setFormaAssinaturaDocumentos("sigadoc")} />
         <span>Digital</span>
         <small>SIGADOC</small>
        </label>
       </div>
      </fieldset>
      <TablePaginadoSeplag key={`${documentosVersao}-${formaAssinaturaDocumentos}`} dataKey="tipo" data={resultadosSemPaginacao(DOCUMENTOS_CERTAME)} rows={50} paginator={false} lazy={false} selectionMode={null} columns={colunasDocumentos} hasEventoAcao renderBotoes={renderAcoesDocumento} handleOnPageChange={() => {}} />
      <p className="text-sm text-color-secondary">Formato aceito: .pdf | Tamanho máximo: 10MB</p>
      <Base64FileModal
       visible={documentoVisualizando !== null}
       onHide={() => setDocumentoVisualizando(null)}
       base64={documentoVisualizando ? arquivos[documentoVisualizando]?.conteudoEmBase64 : null}
       mimeType="application/pdf"
       fileName={documentoVisualizando ? arquivos[documentoVisualizando]?.nome : undefined}
       header={documentoVisualizando ? DOCUMENTOS_CERTAME.find((item) => item.tipo === documentoVisualizando)?.label : undefined}
      />
      <ModalSeplag
       visible={documentoUploadSigadoc !== null}
       titulo="Anexar documento assinado via SIGADOC"
       fechar={() => setDocumentoUploadSigadoc(null)}
       funcAcao={salvarUploadSigadoc}
       labelAcao="Anexar"
       iconAcao="pi pi-cloud-upload"
       tamanho="560px"
      >
       <div className="prototype-upload-sigadoc-modal">
        <p><strong>Documento:</strong> {documentoUploadSigadoc ? DOCUMENTOS_CERTAME.find((item) => item.tipo === documentoUploadSigadoc)?.label : ""}</p>
        <label className="prototype-ingresso-field">
         <span>Número do Processo SIGADOC<em>*</em></span>
         <input type="text" value={processoUploadSigadoc} placeholder="Ex.: SEPLAG-PRO-2026/01234" aria-invalid={erroUploadSigadoc && !processoUploadSigadoc.trim()} onChange={(event) => setProcessoUploadSigadoc(event.target.value)} />
        </label>
        <label className="prototype-ingresso-field">
         <span>PDF assinado extraído do SIGADOC<em>*</em></span>
         <input type="file" accept="application/pdf,.pdf" aria-invalid={erroUploadSigadoc && !arquivoUploadSigadoc} onChange={(event) => setArquivoUploadSigadoc(event.target.files?.[0] ?? null)} />
        </label>
        {erroUploadSigadoc ? <small className="prototype-documentos-sigadoc-error">Informe o número do processo e selecione um arquivo .pdf de até 10MB.</small> : null}
       </div>
      </ModalSeplag>
     </div></SpecArea>}

     {aba === "SITUACOES" && existente && <SpecArea metadata={certameFormTabSpecifications["Situações"]}><div className="col-12">
      <h3 className="mt-0">Histórico de situações</h3>
      <ol className="prototype-certame-timeline">{[...existente.historicoSituacoes].reverse().map((item, indice) => <li key={item.id}><i className={indice === 0 ? "active" : ""} /><div className="date"><strong>{item.dataEfeito}</strong><small>registrado em {item.registradoEm}</small></div><div className="event"><strong>{situacaoLabel[item.tipo]}</strong>{item.prazoPrestacaoContas && <p>Prazo de prestação de contas ao TCE-MT: até {item.prazoPrestacaoContas} (RN-15).</p>}<small>{item.usuario}</small></div></li>)}</ol>
      <div className="grid align-items-end prototype-certame-subform">
       <DropdownFieldSeplag name="tipo" control={situacaoForm.control} label="Nova situação" cols="12 6 4" options={[...SITUACOES_CERTAME]} optionLabel="label" optionValue="value" getFormErrorMessage={() => null} />
       <DateFieldSeplag name="data" control={situacaoForm.control} label="Data de efeito" cols="12 6 4" getFormErrorMessage={() => null} />
       <div className="col-12 md:col-4"><SpecArea metadata={certameFormActionSpecifications["Registrar situação"]}><BotaoSeplag type="button" label="Registrar situação" icon="pi pi-check" onClick={registrarSituacao} /></SpecArea></div>
      </div>
      <div className="col-12 flex justify-content-end"><BotaoVoltarSeplag type="button" onClick={() => navigate(`${BASE}/certames`)} /></div>
     </div></SpecArea>}
    </CardSeplag>
   </form>
  </div>
 </SpecificationMode>;
}
