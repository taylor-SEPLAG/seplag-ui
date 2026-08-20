import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Controller, useForm, type Control, type FieldValues, type Path } from "react-hook-form";
import { CONTROLE_PSS_BASE_PATH as BASE, CONTROLE_PSS_DATA_REFERENCIA, CONTROLE_PSS_USUARIO_LOGADO } from "../constants";
import { controlePssStore, useControlePssStore } from "../controlePssStore";
import { CONTROLE_VAGAS_BASE_PATH } from "../../controleVagas/constants";
import { useDocumentosLegais } from "../../documentosLegais/documentosLegaisStore";
import { SpecArea, SpecificationMode } from "../../shared/visualizationModes";
import { certameFormActionSpecifications, certameFormBlockSpecifications, certameFormBusinessItems, certameFormScreenSpecification, certameFormTabSpecifications } from "./CertameFormSpecifications";
import { proximoNumeroCertame, calcularPrazoPrestacaoContas, calcularValidadeDias, certameDuplicado, dataEfeitoAnteriorPublicacao, homologacaoVigenteSemCancelamento } from "./validations";
import { ABRANGENCIAS, CARGOS_CADASTRADOS, CARREIRAS_CONCURSO, DOCUMENTOS_CERTAME, DOCUMENTOS_HOMOLOGACAO, DOCUMENTOS_RETIFICACAO_EDITAL, DOCUMENTOS_RETIFICACAO_HOMOLOGACAO, EMPRESAS_CADASTRADAS, FASES_TCE_FIXAS, JORNADAS_TRABALHO, LEIS_CERTAME, MUNICIPIOS_MT, OPCOES_SIM_NAO, ORGAO_TODOS, ORGAOS_CERTAME, REGIMES_JURIDICOS, SITUACOES_CERTAME, TIPOS_CERTAME, TIPOS_CONCURSO_APLIC_TCE, TIPOS_CONTRATACAO_EXECUCAO, TIPOS_CONTRATO_BANCA, TIPOS_COTA, TIPOS_FASE_CONCURSO_TCE, TIPOS_ISENCAO, TIPOS_VINCULO } from "./dominios";
import type { AbrangenciaCertame, CargoVagaCertame, Certame, CotaCertame, FaseCertame, RegimeJuridicoCertame, ReservaCotaCargo, SituacaoCertame, TipoCertame, TipoContratacaoExecucaoCertame, TipoDocumentoCertame, TipoVinculoCertame } from "./types";
import { CardSeplag } from "@componentes/Card";
import { BadgeSeplag } from "@componentes/Badge";
import { MensagemSeplag } from "@componentes/Mensagem";
import { BotaoAdicionarSeplag, BotaoIconSeplag, BotaoSalvarSeplag, BotaoSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import type { TabItemSeplag } from "@componentes/Tabs";
import { DateFieldSeplag, CheckboxFieldSeplag, CurrencyFieldSeplag, DropdownFieldSeplag, MaskFieldSeplag, MultiSelectFieldSeplag, NumberFieldSeplag, RadioButtonFieldSeplag, SwitchFieldSeplag, TextAreaFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import type { ArquivoAnexadoSeplag } from "@componentes/AnexarDocumento";
import RotuloSeplag from "@componentes/Rotulo";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "@componentes/TablePaginado";
import { DocumentosLegaisAssociadosSeplag, type DocumentoLegalAssociadoSeplag } from "@componentes/DocumentosLegaisAssociados";
import { SeplagAutoComplete } from "@componentes/AutoComplete";
import gridCss from "@uteis/Grid";
import { lerRascunhoCertame, limparRascunhoCertame, salvarRascunhoCertame } from "./rascunhoCertameStore";
import { DocumentosCertameTabela, SeletorFormaAssinaturaDocumento, resultadosSemPaginacao } from "./DocumentosCertameTabela";
import "./certame.css";

// Campo de lei com múltipla seleção, reaproveitando o layout padrão de "Documentos Legais
// Associados" (busca com chips, painel de opções com checkbox e atalho "Novo Cadastro"). RN: a
// primeira lei selecionada é sinalizada como a norma aplicável (indicarPrincipal), já que a ordem
// de seleção é significativa quando mais de uma lei rege o mesmo campo.
function CampoLeiMultiplaSeplag<T extends FieldValues = any>({ name, control, label, required, cols = "12", opcoes, onNovoCadastro }: Readonly<{ name:Path<T>; control:Control<T>; label:string; required?:boolean; cols?:string; opcoes:DocumentoLegalAssociadoSeplag[]; onNovoCadastro:() => void }>) {
 return <div className={gridCss(cols)}>
  <Controller name={name} control={control} rules={required ? { validate:(value) => (Array.isArray(value) && value.length > 0) || `${label} é obrigatório` } : undefined} render={({ field }) => (
   <DocumentosLegaisAssociadosSeplag
    label={label}
    required={required}
    options={opcoes}
    value={(field.value as string[] | undefined) ?? []}
    onChange={(ids) => field.onChange(ids)}
    onNovoCadastro={onNovoCadastro}
    placeholder="Buscar lei cadastrada"
    indicarPrincipal
   />
  )} />
 </div>;
}

// Cabeçalho de bloco (ícone + título + subtítulo) — separação por componente dentro de cada aba,
// alinhada à maquete de referência do Cadastro de Certame.
export function BlocoHeader({ icone, titulo, subtitulo }:{ icone:string; titulo:string; subtitulo:string }) {
 return <header className="prototype-certame-bloco-header">
  <span className={`prototype-certame-bloco-icone pi ${icone}`} aria-hidden="true" />
  <div><h3>{titulo}</h3><p>{subtitulo}</p></div>
 </header>;
}

// Título de bloco simples (sem ícone/subtítulo) — usado na aba Identificação, alinhada à maquete
// de referência que agrupa os campos em cartões menores com título simples.
function BlocoTitulo({ titulo }:{ titulo:string }) {
 return <h3 className="prototype-certame-bloco-titulo">{titulo}</h3>;
}

export interface CertameFormValues {
 tipoCertame:TipoCertame; tipoConcursoAplic:string;
 leiContratoTemporario?:string[]; leiProcessoSeletivoSimplificado?:string[];
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
 dataInicioInscricaoIsencao?:string; dataFimInscricaoIsencao?:string; leiIsencao?:string[]; tipoIsencao?:string;
 gerouDespesas:string;
 numeroEmpenho?:string; anoEmpenho?:number; tipoContrato?:string; numeroContrato?:string; anoContrato?:number;
 codigoUo?:string; codigoUg?:string; numeroAditivo?:string; anoAditivo?:number;
 cobraTaxaInscricao:string; valorInscricao?:number;
}
interface CotaFormValues { tipo:string; lei:string[] }
interface CargoFormValues { vinculo:"EXISTENTE" | "NOVO"; cargoExistenteId?:string; cargoNome:string; carreira?:string; polo?:string; cidades:string[]; jornada?:string; orgaoDestino?:string; quantidadeVagas:number; tipoCota:string; quantidadeCota?:number; aceitaCadastroReserva:string; quantidadeCadastroReserva?:number }

// Consolidação de 8 para 5 abas fixas: cada aba antiga virou um bloco com subtítulo dentro da aba
// nova, preservando todos os campos, RNs e CAs originais. O histórico de situações deixou de ser
// uma aba do cadastro — agora abre como modal a partir da listagem (ver SituacoesCertameModal).
export type Aba = "IDENTIFICACAO" | "CRONOGRAMA" | "FINANCEIRO" | "VAGAS_COTAS" | "DOCUMENTOS";
const abasBase:readonly { id:Aba; label:string }[] = [
 { id:"IDENTIFICACAO", label:"Identificação" },
 { id:"CRONOGRAMA", label:"Cronograma" },
 { id:"FINANCEIRO", label:"Contrato e Custos" },
 { id:"VAGAS_COTAS", label:"Vagas e Cotas" },
 { id:"DOCUMENTOS", label:"Documentos" },
];

const abaDescricoes:Record<Aba, string> = {
 IDENTIFICACAO:"Dados que identificam o certame perante o TCE-MT.",
 CRONOGRAMA:"Datas, fases e prazos do certame.",
 FINANCEIRO:"Custos, contratação de banca e taxa de inscrição.",
 VAGAS_COTAS:"Cargos, vagas ofertadas e reservas de cota.",
 DOCUMENTOS:"Documentos exigidos para a prestação de contas ao TCE-MT.",
};

const anoReferencia = Number(CONTROLE_PSS_DATA_REFERENCIA.slice(0, 4));
const situacaoLabel:Record<SituacaoCertame,string> = Object.fromEntries(SITUACOES_CERTAME.map((item) => [item.value, item.label])) as Record<SituacaoCertame,string>;
const situacaoEstilo:Record<SituacaoCertame,{ color:string; bg:string }> = {
 ABERTO: { color:"#0b6199", bg:"#e9f3fc" }, RETIFICACAO_EDITAL: { color:"#55637a", bg:"#eef1f5" }, HOMOLOGADO: { color:"#147441", bg:"#e2f5e8" },
 RETIFICACAO_HOMOLOGACAO: { color:"#55637a", bg:"#eef1f5" }, PRORROGACAO_VALIDADE: { color:"#8a5c00", bg:"#fff1cf" }, CANCELADO_ANULADO: { color:"#ad3039", bg:"#ffe3e5" },
 PARALISADO: { color:"#ad3039", bg:"#ffe3e5" }, HOMOLOGACAO_PARCIAL: { color:"#8a5c00", bg:"#fff1cf" }, RETIFICACAO_HOMOLOGACAO_PARCIAL: { color:"#8a5c00", bg:"#fff1cf" },
};

// Fases cujo preenchimento da Data início corresponde a uma situação do certame (RN-15) — as
// demais fases do catálogo TCE-MT não têm uma situação correspondente no modelo atual.
const FASE_SITUACAO_AUTOMATICA:Partial<Record<string, SituacaoCertame>> = {
 "Publicação do Edital": "ABERTO",
 "Homologação do Resultado": "HOMOLOGADO",
};

function valoresIniciais(certame:Certame | undefined, certames:readonly Certame[]):CertameFormValues {
 if (certame) return {
  tipoCertame:certame.tipoCertame, tipoConcursoAplic:certame.tipoConcursoAplic,
  leiContratoTemporario:certame.leiContratoTemporario ? [...certame.leiContratoTemporario] : undefined, leiProcessoSeletivoSimplificado:certame.leiProcessoSeletivoSimplificado ? [...certame.leiProcessoSeletivoSimplificado] : undefined,
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
  dataInicioInscricaoIsencao:certame.dataInicioInscricaoIsencao, dataFimInscricaoIsencao:certame.dataFimInscricaoIsencao, leiIsencao:certame.leiIsencao ? [...certame.leiIsencao] : undefined, tipoIsencao:certame.tipoIsencao,
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

// Documentos do certame agrupados por situação (Manual de Orientação para Remessa de Documentos ao
// TCE/MT). Só o grupo de Abertura bloqueia o salvamento do certame (obrigatorioSempre) e aparece na
// aba Documentos do cadastro — os demais (Retificação de Edital, Homologação, Retificação de
// Homologação) só ficam disponíveis para anexar ao registrar a situação correspondente (ver
// SituacoesCertameModal), evitando tabelas vazias e redundantes no cadastro. Mesmo assim entram em
// TODOS_DOCUMENTOS_CERTAME para que o salvamento deste formulário preserve documentos já anexados
// por lá, em vez de descartá-los.
const GRUPOS_DOCUMENTOS_CERTAME = [
 { titulo:"1 — Abertura", documentos:DOCUMENTOS_CERTAME },
 { titulo:"2 — Retificação do Edital de Abertura", documentos:DOCUMENTOS_RETIFICACAO_EDITAL },
 { titulo:"3 — Homologação", documentos:DOCUMENTOS_HOMOLOGACAO },
 { titulo:"4 — Retificação da Homologação", documentos:DOCUMENTOS_RETIFICACAO_HOMOLOGACAO },
] as const;
const GRUPOS_DOCUMENTOS_CERTAME_ABA = GRUPOS_DOCUMENTOS_CERTAME.slice(0, 1);
const TODOS_DOCUMENTOS_CERTAME = GRUPOS_DOCUMENTOS_CERTAME.flatMap((grupo) => grupo.documentos);

// Vínculo automático cargo → Quadro de Vagas (Controle de Vagas > Quadro Autorizado), por nome do cargo.
function buscarQuadroPorCargo(nome:string) {
 const alvo = nome.trim().toLocaleLowerCase("pt-BR");
 if (!alvo) return undefined;
 return CARGOS_CADASTRADOS.find((item) => item.nome.trim().toLocaleLowerCase("pt-BR") === alvo);
}

function rotuloPolo(codigo:string) {
 return MUNICIPIOS_MT.find((item) => item.value === codigo)?.label ?? codigo;
}

// Sugestões de "Nome da fase" a partir do catálogo de Tipos de Prova/Etapa do TCE-MT — o campo
// continua sendo texto livre (qualquer nome digitado é aceito), a busca só ajuda a encontrar e
// reaproveitar um dos nomes já padronizados pelo TCE-MT.
function filtrarTiposFaseTce(consulta:string) {
 const termo = consulta.trim().toLocaleLowerCase("pt-BR");
 const rotulos = TIPOS_FASE_CONCURSO_TCE.map((item) => item.label);
 if (!termo) return rotulos;
 return rotulos.filter((label) => label.toLocaleLowerCase("pt-BR").includes(termo));
}

export function CertameFormContent() {
 const { certames } = useControlePssStore();
 const navigate = useNavigate();
 const location = useLocation();
 const { id } = useParams<{ id?:string }>();
 const [searchParams] = useSearchParams();
 const modoNovo = !id || id === "novo";
 const existente = modoNovo ? undefined : certames.find((item) => item.id === id);

 // Rascunho de um cadastro em andamento (só se aplica a "novo certame" — ver RascunhoCertame acima).
 const rascunho = useMemo(() => (modoNovo ? lerRascunhoCertame() : null), []);
 const [avisoRascunho, setAvisoRascunho] = useState(Boolean(rascunho));
 useEffect(() => {
  if (!avisoRascunho) return undefined;
  const temporizador = setTimeout(() => setAvisoRascunho(false), 6000);
  return () => clearTimeout(temporizador);
 }, [avisoRascunho]);

 // Toda "Lei" do certame busca em Documentos Legais (cadastro central) — além do domínio fixo
 // (LEIS_CERTAME), somando as normas cadastradas dinamicamente naquele módulo, para que uma lei
 // criada pelo atalho "Cadastrar nova lei" apareça imediatamente como opção selecionável.
 const documentosLegaisCadastrados = useDocumentosLegais();
 const opcoesLeis = useMemo<DocumentoLegalAssociadoSeplag[]>(() => [
  ...LEIS_CERTAME.map((lei) => ({ id:lei.value, titulo:lei.label, categoria:"Lei" })),
  ...documentosLegaisCadastrados.map((documento) => ({ id:documento.id, titulo:documento.titulo, categoria:documento.categoria, descricao:documento.descricao })),
 ], [documentosLegaisCadastrados]);
 const campoLeiRetorno = searchParams.get("campoLei");
 const irCadastrarLei = (campoLei:string) => {
  const returnTo = `${location.pathname}?campoLei=${campoLei}`;
  navigate(`/prototipos/sigep/documentos-legais/novo?returnTo=${encodeURIComponent(returnTo)}`);
 };

 const [aba, setAba] = useState<Aba>(campoLeiRetorno === "cotaLei" ? "VAGAS_COTAS" : (rascunho?.aba ?? "IDENTIFICACAO"));
 // RN-06.1: no cadastro de um novo certame, o tipo precisa ser definido antes de liberar o restante do formulário.
 const [tipoConfirmado, setTipoConfirmado] = useState(!modoNovo || Boolean(rascunho?.tipoConfirmado));
 const { control, handleSubmit, watch, setValue } = useForm<CertameFormValues>({ defaultValues: rascunho?.valores ?? valoresIniciais(existente, certames) });
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

 const [cotas, setCotas] = useState<CotaCertame[]>(existente ? [...existente.cotas] : (rascunho?.cotas ?? []));
 const cotaForm = useForm<CotaFormValues>({ defaultValues: { tipo:TIPOS_COTA[0].value, lei:[] } });

 // Ao voltar do cadastro de uma nova lei (atalho "+"), soma a lei recém-criada às já selecionadas no
 // campo de origem (identificado por campoLei no returnTo) e limpa os parâmetros da URL.
 useEffect(() => {
  const documentoLegalId = searchParams.get("documentoLegalId");
  if (!documentoLegalId || !campoLeiRetorno) return;
  if (campoLeiRetorno === "cotaLei") cotaForm.setValue("lei", [...(cotaForm.getValues("lei") ?? []), documentoLegalId]);
  else if (campoLeiRetorno === "leiContratoTemporario" || campoLeiRetorno === "leiProcessoSeletivoSimplificado" || campoLeiRetorno === "leiIsencao") setValue(campoLeiRetorno, [...(valores[campoLeiRetorno] ?? []), documentoLegalId]);
  navigate(location.pathname, { replace:true });
 }, [searchParams, campoLeiRetorno, cotaForm, setValue, valores, navigate, location.pathname]);

 const [cargos, setCargos] = useState<CargoVagaCertame[]>(existente ? [...existente.cargos] : (rascunho?.cargos ?? []));
 const cargoForm = useForm<CargoFormValues>({ defaultValues: { vinculo:"NOVO", cargoExistenteId:undefined, cargoNome:"", carreira:undefined, polo:"", cidades:[], jornada:undefined, orgaoDestino:undefined, quantidadeVagas:0, tipoCota:"", quantidadeCota:0, aceitaCadastroReserva:"N", quantidadeCadastroReserva:0 } });
 const cargoValores = cargoForm.watch();
 const cargoExistenteSelecionado = cargoValores.vinculo === "EXISTENTE" ? CARGOS_CADASTRADOS.find((item) => item.id === cargoValores.cargoExistenteId) : undefined;
 const cargoNomeAtual = cargoValores.vinculo === "EXISTENTE" ? cargoExistenteSelecionado?.nome ?? "" : cargoValores.cargoNome;
 const quadroVinculado = buscarQuadroPorCargo(cargoNomeAtual ?? "");
 // Sugere a jornada já cadastrada para o cargo selecionado, mas o campo continua editável — o
 // usuário pode ajustar manualmente caso o certame preveja jornada diferente da vigente.
 useEffect(() => {
  if (cargoExistenteSelecionado?.jornada) cargoForm.setValue("jornada", cargoExistenteSelecionado.jornada);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [cargoExistenteSelecionado?.id]);
 // Reservas de cota do cargo em edição (antes de "Adicionar") — um mesmo cargo pode acumular mais
 // de uma reserva (ex.: 2 PCD + 1 PPP) antes de ser efetivamente incluído na lista de cargos.
 const [reservasCotaPendentes, setReservasCotaPendentes] = useState<ReservaCotaCargo[]>([]);

 const [fases, setFases] = useState<FaseCertame[]>(existente ? [...existente.fases] : (rascunho?.fases ?? [...FASES_TCE_FIXAS]));
 const [faseArrastada, setFaseArrastada] = useState<number | null>(null);
 const [sugestoesFase, setSugestoesFase] = useState<string[]>(() => filtrarTiposFaseTce(""));

 const [arquivos, setArquivos] = useState<Partial<Record<TipoDocumentoCertame, ArquivoAnexadoSeplag>>>(() =>
  rascunho?.arquivos ?? Object.fromEntries(TODOS_DOCUMENTOS_CERTAME.map((item) => [item.tipo, arquivoExistente(existente, item.tipo as TipoDocumentoCertame)]).filter(([, valor]) => valor)) as Partial<Record<TipoDocumentoCertame, ArquivoAnexadoSeplag>>,
 );
 // Modo de assinatura dos documentos do certame — mesmo campo e funcionalidade do módulo de Ingresso.
 const [formaAssinaturaDocumentos, setFormaAssinaturaDocumentos] = useState<"fisica" | "sigadoc">(rascunho?.formaAssinaturaDocumentos ?? "sigadoc");
 const [processosSigadocDocumentos, setProcessosSigadocDocumentos] = useState<Partial<Record<TipoDocumentoCertame, string>>>(rascunho?.processosSigadocDocumentos ?? {});

 // Salva o progresso do cadastro (novo certame) a cada alteração, para recuperar automaticamente
 // caso o usuário saia do formulário antes de salvar (ex.: atalho "Cadastrar nova lei").
 useEffect(() => {
  if (!modoNovo || !tipoConfirmado) return;
  salvarRascunhoCertame({ tipoConfirmado, aba, valores, cotas, cargos, fases, arquivos, formaAssinaturaDocumentos, processosSigadocDocumentos });
 }, [modoNovo, tipoConfirmado, aba, valores, cotas, cargos, fases, arquivos, formaAssinaturaDocumentos, processosSigadocDocumentos]);

 const onChangeArquivoDocumento = (tipo:TipoDocumentoCertame, arquivo:ArquivoAnexadoSeplag | undefined) => setArquivos((atuais) => ({ ...atuais, [tipo]: arquivo }));
 const onChangeProcessoSigadocDocumento = (tipo:TipoDocumentoCertame, numero:string | undefined) => setProcessosSigadocDocumentos((atuais) => ({ ...atuais, [tipo]: numero }));

 const [erro, setErro] = useState<string | null>(null);
 // A mensagem de erro fica no topo do card, acima das abas — sem isso, um erro disparado por uma
 // ação dentro de um bloco (ex.: "Adicionar" cargo) passa despercebido quando a página já está rolada.
 useEffect(() => {
  if (!erro) return;
  document.getElementById("certame-form-erro")?.scrollIntoView({ behavior:"smooth", block:"center" });
 }, [erro]);
 // RN-20: Demonstrativo LRF é sempre obrigatório (obrigatorioSempre:true no domínio) — não depende
 // mais do checkbox "gerou despesas". RN-21: Publicação do certame licitatório passa a seguir o
 // mesmo gatilho do Contrato social — RN-22 unificou esse gatilho em "tipoContratacaoExecucao".
 const documentoObrigatorio = (tipo:string, obrigatorioSempre:boolean) => obrigatorioSempre
  || ((tipo === "CONTRATO_SOCIAL_EMPRESA" || tipo === "PUBLICACAO_CERTAME_LICITATORIO") && houveContratacaoEmpresa);

 const colunasCotas:ColumnMetaSeplag<CotaCertame>[] = [
  { header:"Tipo de cota", body:(row) => <BadgeSeplag label={TIPOS_COTA.find((tipo) => tipo.value === row.tipo)?.label ?? row.tipo} color="#0b6199" bg="#e9f3fc" border="transparent" size="sm" /> },
  { header:"Lei", body:(row) => {
   const titulos = row.lei.map((id) => opcoesLeis.find((lei) => lei.id === id)?.titulo ?? id);
   if (titulos.length === 0) return "—";
   return titulos.length === 1 ? titulos[0] : `${titulos[0]} (+${titulos.length - 1})`;
  } },
 ];

 const colunasReservasCota:ColumnMetaSeplag<ReservaCotaCargo>[] = [
  { header:"Tipo de cota", body:(row) => <BadgeSeplag label={TIPOS_COTA.find((tipo) => tipo.value === row.tipo)?.label ?? row.tipo} color="#0b6199" bg="#e9f3fc" border="transparent" size="sm" /> },
  { field:"quantidade", header:"Quantidade" },
 ];

 // Cada cargo/vaga vira um card expansível: o cabeçalho resume vínculo, quadro, vagas e CR (igual
 // à antiga linha de tabela); o corpo detalha cada cota reservada em sua própria linha — mais claro
 // que empilhar todas as cotas como tags dentro de uma única célula.
 const [cargosExpandidos, setCargosExpandidos] = useState<Set<string>>(new Set());
 const alternarCargoExpandido = (id:string) => setCargosExpandidos((atuais) => {
  const proximos = new Set(atuais);
  if (proximos.has(id)) proximos.delete(id); else proximos.add(id);
  return proximos;
 });


 const salvar = handleSubmit((dados) => {
  setErro(null);
  // RN-23 (ER143): número do certame (TCE-MT) não pode se repetir para o mesmo tipo e exercício.
  if (certameDuplicado(certames, dados, existente?.id)) { setErro("Já existe um certame aberto com esse número e tipo. Verifique."); irParaBloco("IDENTIFICACAO", "bloco-identificacao"); return; }
  if (cargos.length === 0) { setErro("Informe ao menos um cargo/vaga para salvar o certame (RN-14, Cenário 1)."); irParaBloco("VAGAS_COTAS", "bloco-cargos-vagas"); return; }
  const documentosFaltando = TODOS_DOCUMENTOS_CERTAME.filter((doc) => documentoObrigatorio(doc.tipo, doc.obrigatorioSempre) && !arquivos[doc.tipo as TipoDocumentoCertame]);
  if (documentosFaltando.length > 0) { setErro(`Documento obrigatório pendente: ${documentosFaltando.map((doc) => doc.label).join(", ")}.`); irParaBloco("DOCUMENTOS", "bloco-documentos"); return; }

  const agora = CONTROLE_PSS_DATA_REFERENCIA.split("-").reverse().join("/");
  const documentos = TODOS_DOCUMENTOS_CERTAME.filter((doc) => arquivos[doc.tipo as TipoDocumentoCertame]).map((doc) => ({ tipo:doc.tipo as TipoDocumentoCertame, nomeArquivo:arquivos[doc.tipo as TipoDocumentoCertame]!.nome, anexadoEm:agora }));
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
   historicoSituacoes:[{ id:`SIT-${novoId}-1`, certameId:novoId, tipo:"ABERTO", dataEfeito:dados.dataPublicacaoEdital, registradoEm:`${agora} 09:00`, usuario:CONTROLE_PSS_USUARIO_LOGADO, prazoPrestacaoContas:calcularPrazoPrestacaoContas(dados.dataPublicacaoEdital) }],
   criadoEm:agora, atualizadoEm:agora, responsavel:CONTROLE_PSS_USUARIO_LOGADO,
  };
  controlePssStore.set("certames", (atuais) => [...atuais, novo]);
  limparRascunhoCertame();
  navigate(`${BASE}/certames/${novoId}`);
 });

 const adicionarCota = () => {
  const dados = cotaForm.getValues();
  if (!dados.lei || dados.lei.length === 0) return;
  setCotas((atuais) => [...atuais, { id:`COTA-${Date.now()}`, tipo:dados.tipo, lei:dados.lei }]);
  cotaForm.reset({ tipo:TIPOS_COTA[0].value, lei:[] });
 };
 const removerCota = (idCota:string) => setCotas((atuais) => atuais.filter((item) => item.id !== idCota));

 const adicionarReservaCota = () => {
  const tipo = cargoForm.getValues("tipoCota");
  const quantidade = cargoForm.getValues("quantidadeCota");
  if (!tipo || !(quantidade && quantidade > 0)) { setErro("Selecione o tipo de cota e informe a quantidade a reservar."); return; }
  setErro(null);
  setReservasCotaPendentes((atuais) => [...atuais, { id:`RSV-${Date.now()}`, tipo, quantidade }]);
  cargoForm.setValue("tipoCota", "");
  cargoForm.setValue("quantidadeCota", 0);
 };
 const removerReservaCota = (idReserva:string) => setReservasCotaPendentes((atuais) => atuais.filter((item) => item.id !== idReserva));

 const adicionarCargo = () => {
  const dados = cargoForm.getValues();
  const cargoExistente = dados.vinculo === "EXISTENTE" ? CARGOS_CADASTRADOS.find((item) => item.id === dados.cargoExistenteId) : undefined;
  const cargoNome = dados.vinculo === "EXISTENTE" ? cargoExistente?.nome ?? "" : dados.cargoNome;
  if (!cargoNome || dados.quantidadeVagas <= 0) return;
  const totalReservado = reservasCotaPendentes.reduce((total, item) => total + item.quantidade, 0);
  if (totalReservado > dados.quantidadeVagas) { setErro("A soma das cotas reservadas não pode exceder a quantidade de vagas do cargo."); return; }
  if (dados.aceitaCadastroReserva === "S" && !(dados.quantidadeCadastroReserva && dados.quantidadeCadastroReserva > 0)) { setErro("Informe a quantidade de Cadastro Reserva (CR) para as vagas de ampla concorrência."); return; }
  setErro(null);
  const quadro = cargoExistente ?? buscarQuadroPorCargo(cargoNome);
  setCargos((atuais) => [...atuais, { id:`CGV-${Date.now()}`, vinculo:dados.vinculo, cargoExistenteId:cargoExistente?.id, cargoNome, carreira:valores.tipoCertame === "CONCURSO_PUBLICO" ? dados.carreira : undefined, polo:dados.polo?.trim() ? dados.polo.trim() : undefined, cidades:dados.cidades.length > 0 ? dados.cidades : undefined, jornada:dados.jornada, orgaoDestino:valores.setoresParticipantes.length > 1 ? dados.orgaoDestino : undefined, codigoReferenciaTce:"001", quantidadeVagas:dados.quantidadeVagas, reservasCota:reservasCotaPendentes, aceitaCadastroReserva:dados.aceitaCadastroReserva === "S", quantidadeCadastroReserva:dados.aceitaCadastroReserva === "S" ? dados.quantidadeCadastroReserva : undefined, quadroCodigo:quadro?.quadroCodigo, quadroVersao:quadro?.quadroVersao }]);
  cargoForm.reset({ vinculo:"NOVO", cargoExistenteId:undefined, cargoNome:"", carreira:undefined, polo:"", cidades:[], jornada:undefined, orgaoDestino:undefined, quantidadeVagas:0, tipoCota:"", quantidadeCota:0, aceitaCadastroReserva:"N", quantidadeCadastroReserva:0 });
  setReservasCotaPendentes([]);
 };
 const removerCargo = (idCargo:string) => setCargos((atuais) => atuais.filter((item) => item.id !== idCargo));

 const renumerarFases = (lista:FaseCertame[]) => lista.map((item, index) => ({ ordem:index + 1, nome:item.nome, dataInicio:item.dataInicio, dataFim:item.dataFim }));
 const adicionarFase = () => setFases((atuais) => [...atuais, { ordem:atuais.length + 1, nome:"", dataInicio:"", dataFim:"" }]);
 // Preenche automaticamente a Data início de "Publicação do Edital"/"Homologação do Resultado"
 // como a situação correspondente do certame — silencioso quando alguma guarda de RN-24 bloqueia
 // (ex.: já existe Homologação vigente), sem interromper a edição das fases.
 const registrarSituacaoAutomaticaPorFase = (situacaoAlvo:SituacaoCertame, data:string) => {
  if (!existente) return;
  if (dataEfeitoAnteriorPublicacao(data, existente.dataPublicacaoEdital)) return;
  if (situacaoAlvo === "HOMOLOGADO" && homologacaoVigenteSemCancelamento(existente.historicoSituacoes)) return;
  if (existente.historicoSituacoes.some((item) => item.tipo === situacaoAlvo && item.dataEfeito === data)) return;
  const prazo = calcularPrazoPrestacaoContas(data);
  const registro = { id:`SIT-${existente.id}-${existente.historicoSituacoes.length + 1}`, certameId:existente.id, tipo:situacaoAlvo, dataEfeito:data, registradoEm:`${CONTROLE_PSS_DATA_REFERENCIA.split("-").reverse().join("/")} ${new Date().toTimeString().slice(0, 5)}`, usuario:CONTROLE_PSS_USUARIO_LOGADO, prazoPrestacaoContas:prazo };
  controlePssStore.set("certames", (atuais) => atuais.map((item) => item.id === existente.id ? { ...item, situacaoAtual:situacaoAlvo, historicoSituacoes:[...item.historicoSituacoes, registro], atualizadoEm:data } : item));
 };
 const atualizarFase = (ordem:number, alteracoes:Partial<Pick<FaseCertame, "nome" | "dataInicio" | "dataFim">>) => {
  setFases((atuais) => atuais.map((item) => item.ordem === ordem ? { ...item, ...alteracoes } : item));
  if (alteracoes.dataInicio) {
   const fase = fases.find((item) => item.ordem === ordem);
   const situacaoAlvo = fase && FASE_SITUACAO_AUTOMATICA[fase.nome];
   if (situacaoAlvo) registrarSituacaoAutomaticaPorFase(situacaoAlvo, alteracoes.dataInicio);
  }
 };
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

 // As 5 abas fixas são exibidas para os dois tipos de certame (RN-06, seção 3); apenas o bloco de
 // Prazos de posse/exercício, dentro de "Cronograma", continua dispensado para PSS (RN-06.3).
 const abas:TabItemSeplag<Aba>[] = useMemo(() => abasBase.map((item) => ({ id:item.id, label:item.label, value:item.id })), []);

 useEffect(() => { if (!abas.some((item) => item.id === aba)) setAba("IDENTIFICACAO"); }, [abas, aba]);

 const abasFluxo = abas;
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
     footer={<div className="col-12 flex justify-content-end align-items-center gap-2">
      <BotaoVoltarSeplag type="button" onClick={voltar} />
      {ehUltimaAba
       ? <SpecArea metadata={certameFormActionSpecifications["Salvar certame"]}><BotaoSalvarSeplag type="submit" label="Salvar certame" /></SpecArea>
       : <BotaoSeplag type="button" label="Avançar" icon="pi pi-arrow-right" iconPos="right" onClick={avancar} />}
     </div>}
    >
     {erro && <div id="certame-form-erro" className="col-12"><MensagemSeplag severity="error" message={erro} cols="12" /></div>}
     {avisoRascunho && <div className="col-12"><MensagemSeplag severity="info" message="Continuamos de onde você parou — o rascunho deste cadastro foi restaurado automaticamente." cols="12" /></div>}

     <div className="col-12 prototype-certame-stepper-wrap">
      <div className="prototype-certame-stepper" aria-label="Etapas do certame">
       {abasFluxo.map((step, index) => {
        const isActive = step.id === aba;
        const isCompleted = index < indiceAbaAtual;
        return <button key={step.id} type="button" className={`prototype-certame-step${isActive ? " is-active" : ""}${isCompleted ? " is-completed" : ""}`} aria-current={isActive ? "step" : undefined} onClick={() => setAba(step.id as Aba)}>
         <span className="prototype-certame-step-marker">{isCompleted ? <i className="pi pi-check" aria-hidden="true" /> : index + 1}</span>
         <span className="prototype-certame-step-text"><strong>{step.label}</strong><small>{abaDescricoes[step.id as Aba]}</small></span>
        </button>;
       })}
      </div>
     </div>

     {aba === "IDENTIFICACAO" && <SpecArea metadata={certameFormTabSpecifications["Identificação"]}><div className="col-12">

      <div id="bloco-identificacao" className={blocoClasse("bloco-identificacao")}>
       <BlocoTitulo titulo="Identificação do certame" />
       <div className="grid">
        <RotuloSeplag nome="Tipo do certame / Aplic. TCE-MT" cols="12 6 5" obrigatorio><div className="prototype-certame-campo-fixo-valor">{TIPOS_CERTAME.find((item) => item.value === valores.tipoCertame)?.label} — {TIPOS_CONCURSO_APLIC_TCE.find((item) => item.value === valores.tipoConcursoAplic)?.label}</div></RotuloSeplag>
        <NumberFieldSeplag name="anoConcurso" control={control} label="Ano do concurso" required cols="12 6 4" getFormErrorMessage={() => null} />
        <MaskFieldSeplag name="numeroConcurso" control={control} label="Número do certame (TCE-MT)" required cols="12 6" mask="99999999999" placeholder="00000000000" getFormErrorMessage={() => null} />
        <TextFieldSeplag name="numeroEditalOrgao" control={control} label="Número do edital do órgão" required cols="12 6" placeholder="Ex.: 001/SEPLAG/2026" getFormErrorMessage={() => null} />
        <TextFieldSeplag name="nomeEdital" control={control} label="Nome do edital" required cols="12" placeholder="[NÚMERO]/[ÓRGÃO]/[ANO] [descrição livre]" getFormErrorMessage={() => null} />
       </div>
      </div>

      <div className={blocoClasse("bloco-orgaos-envolvidos")}>
       <BlocoTitulo titulo="Órgãos envolvidos" />
       <div className="grid">
        {!modoNovo
         ? <SpecArea metadata={certameFormBlockSpecifications.mandanteBloqueado}><RotuloSeplag nome="Órgão responsável (mandante)" cols="12 6" obrigatorio><div className="prototype-certame-campo-fixo"><div className="prototype-certame-campo-fixo-valor">{valores.setor}</div><small>Bloqueado após o cadastro — RN-05.</small></div></RotuloSeplag></SpecArea>
         : <DropdownFieldSeplag name="setor" control={control} label="Órgão responsável (mandante)" required cols="12 6" options={ORGAOS_CERTAME.map((item) => ({ label:item, value:item }))} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={() => null} />}
        <MultiSelectFieldSeplag name="setoresParticipantes" control={control} label="Órgãos participantes" cols="12 6" options={ORGAOS_CERTAME.map((item) => ({ label:item, value:item }))} optionLabel="label" optionValue="value" placeholder="(selecione)" display="chip" getFormErrorMessage={() => null} />
       </div>
      </div>

      <div className={blocoClasse("bloco-enquadramento")}>
       <BlocoTitulo titulo="Enquadramento funcional e legal" />
       <div className="grid">
        {/* Tipo de vínculo vem antes de Regime jurídico — o vínculo funcional determina o regime. */}
        {dispensarParaConcurso
         ? <RotuloSeplag nome="Tipo de vínculo" cols="12 6" obrigatorio><div className="prototype-certame-campo-fixo"><div className="prototype-certame-campo-fixo-valor">Nomeado Efetivo</div><small>Fixo para Concurso Público.</small></div></RotuloSeplag>
         : <DropdownFieldSeplag name="tipoVinculo" control={control} label="Tipo de vínculo" required cols="12 6" options={[...TIPOS_VINCULO]} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={() => null} />}
        <DropdownFieldSeplag name="regimeJuridico" control={control} label="Regime jurídico" required cols="12 6" options={[...REGIMES_JURIDICOS]} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={() => null} />
        <CampoLeiMultiplaSeplag name="leiContratoTemporario" control={control} label={dispensarParaConcurso ? "Lei do concurso" : "Lei de contrato temporário"} required={dispensarParaConcurso || valores.tipoVinculo === "CONTRATO_TEMPORARIO"} cols="12 6" opcoes={opcoesLeis} onNovoCadastro={() => irCadastrarLei("leiContratoTemporario")} />
        {dispensarParaProcessoSeletivo && <CampoLeiMultiplaSeplag name="leiProcessoSeletivoSimplificado" control={control} label="Lei do processo seletivo" required cols="12 6" opcoes={opcoesLeis} onNovoCadastro={() => irCadastrarLei("leiProcessoSeletivoSimplificado")} />}
       </div>
      </div>

      <div className={blocoClasse("bloco-objetivo")}>
       <BlocoTitulo titulo="Objetivo" />
       <div className="grid">
        <TextAreaFieldSeplag name="objetivo" control={control} label=" " cols="12" maxLength={1000} placeholder="Descreva o objetivo do certame..." getFormErrorMessage={() => null} />
       </div>
      </div>

     </div></SpecArea>}

     {aba === "CRONOGRAMA" && <SpecArea metadata={certameFormTabSpecifications["Cronograma"]}><div className="col-12">

      <div id="bloco-datas-execucao" className={blocoClasse("bloco-datas-execucao")}>
       <BlocoHeader icone="pi-calendar" titulo="Datas e execução" subtitulo="Marcos temporais do certame, a partir da publicação do edital." />
       <div className="grid">
        <DateFieldSeplag name="dataPublicacaoEdital" control={control} label="Data de publicação do edital" required cols="12 6 3" getFormErrorMessage={() => null} />
        <DateFieldSeplag name="dataRealizacao" control={control} label="Data de realização" required cols="12 6 3" validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" getFormErrorMessage={() => null} />
        <DateFieldSeplag name="dataValidade" control={control} label="Data de validade" required cols="12 6 3" validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" getFormErrorMessage={() => null} />
        <DateFieldSeplag name="dataResultado" control={control} label="Data do resultado" required cols="12 6 3" validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" getFormErrorMessage={() => null} />
        <DateFieldSeplag name="inicioInscricoesGerais" control={control} label="Início das inscrições gerais" required cols="12 6 3" validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" getFormErrorMessage={() => null} />
        <DateFieldSeplag name="fimInscricoesGerais" control={control} label="Fim das inscrições gerais" required cols="12 6 3" validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" getFormErrorMessage={() => null} />
        {!dispensarParaProcessoSeletivo && <DateFieldSeplag name="dataProrrogacao" control={control} label="Data de prorrogação" cols="12 6 3" validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" getFormErrorMessage={() => null} />}
        {!dispensarParaProcessoSeletivo && <DateFieldSeplag name="dataCancelamento" control={control} label="Data de cancelamento" cols="12 6 3" validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" getFormErrorMessage={() => null} />}
        <NumberFieldSeplag name="validadeConcursoDias" control={control} label={dispensarParaProcessoSeletivo ? "Validade do processo seletivo (dias)" : "Validade do concurso (dias)"} cols="12 6 4" getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="previsaoProrrogacaoDias" control={control} label="Previsão para prorrogação (dias)" cols="12 6 4" getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="prorrogacaoValidadeDias" control={control} label="Prorrogação da validade (dias)" cols="12 6 4" getFormErrorMessage={() => null} />
        <RadioButtonFieldSeplag name="existePrevisaoRecursos" control={control} label="Existe previsão de recursos?" options={[...OPCOES_SIM_NAO]} cols="12" getFormErrorMessage={() => null} />
       </div>
      </div>

      <SpecArea metadata={certameFormBlockSpecifications.fasesFixas}><div id="bloco-fases" className={`${blocoClasse("bloco-fases")} prototype-certame-fases`}>
       <div className="prototype-certame-fases-head">
        <BlocoHeader icone="pi-sitemap" titulo="Fases do certame" subtitulo="Cronograma editável de fases, com base no catálogo do TCE-MT." />
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
        {fases.map((fase) => {
         const ehFaseTce = TIPOS_FASE_CONCURSO_TCE.some((item) => item.label === fase.nome);
         return <div
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
          <SeplagAutoComplete
           inputId={`fase-nome-${fase.ordem}`}
           value={fase.nome}
           suggestions={sugestoesFase}
           completeMethod={(query) => setSugestoesFase(filtrarTiposFaseTce(query))}
           onChange={(event) => atualizarFase(fase.ordem, { nome:typeof event.value === "string" ? event.value : "" })}
           dropdown
           placeholder="Digite ou selecione uma fase do catálogo TCE-MT"
           className={`w-full${ehFaseTce ? " prototype-certame-fase-tce" : ""}`}
           tooltip={ehFaseTce ? "Fase do catálogo padrão do TCE-MT" : undefined}
          />
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
        </div>;
        })}
       </div>
      </div></SpecArea>

      {/* RN-06.3: bloco de Prazos de posse/exercício continua dispensado para Processo Seletivo. */}
      {!dispensarParaProcessoSeletivo && <div id="bloco-prazos" className={blocoClasse("bloco-prazos")}>
       <BlocoHeader icone="pi-clock" titulo="Prazos de posse/exercício" subtitulo="Prazos aplicáveis após o ingresso do candidato aprovado." />
       <div className="grid">
        <NumberFieldSeplag name="diasPrazoPosse" control={control} label="Dias — prazo de posse" cols="12 6 3" getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="diasPrazoProrrogacaoPosse" control={control} label="Dias — prorrogação da posse" cols="12 6 3" getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="diasPrazoExercicio" control={control} label="Dias — prazo de exercício" cols="12 6 3" getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="diasPrazoProrrogacaoExercicio" control={control} label="Dias — prorrogação do exercício" cols="12 6 3" getFormErrorMessage={() => null} />
       </div>
      </div>}

     </div></SpecArea>}

     {aba === "FINANCEIRO" && <SpecArea metadata={certameFormTabSpecifications["Contrato e Custos"]}><div className="col-12">

      <div id="bloco-contratacao-custos" className={blocoClasse("bloco-contratacao-custos")}>
       <BlocoHeader icone="pi-briefcase" titulo="Contratação e custos" subtitulo="Abrangência, execução do certame e dados do contrato, quando houver." />
       <div className="grid">
        {/* RN-22: "Houve contratação de banca/empresa organizadora?" foi removido — o gatilho único
            passa a ser "Tipo de contratação (execução)". Abrangência, Tipo de contratação (execução)
            e Instituição realizadora foram trazidos do bloco Datas e execução para cá, na primeira linha. */}
        <DropdownFieldSeplag name="abrangencia" control={control} label="Abrangência" required cols="12 6 4" options={[...ABRANGENCIAS]} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={() => null} />
        <DropdownFieldSeplag name="tipoContratacaoExecucao" control={control} label="Tipo de contratação (execução)" required cols="12 6 4" options={[...TIPOS_CONTRATACAO_EXECUCAO]} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={() => null} />
        {houveContratacaoEmpresa && <DropdownFieldSeplag name="instituicaoRealizadora" control={control} label="Instituição realizadora" required cols="12 6 4" options={[...EMPRESAS_CADASTRADAS]} optionLabel="label" optionValue="value" placeholder="Selecione a empresa cadastrada" getFormErrorMessage={() => null} />}
        <RadioButtonFieldSeplag name="gerouDespesas" control={control} label="O certame gerou despesas para o fiscalizado?" options={[...OPCOES_SIM_NAO]} cols="12" getFormErrorMessage={() => null} />
        {houveContratacaoEmpresa && <DropdownFieldSeplag name="tipoContrato" control={control} label="Tipo de contrato" required cols="12 6 4" options={[...TIPOS_CONTRATO_BANCA]} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={() => null} />}
        {houveContratacaoEmpresa && <>
         <TextFieldSeplag name="numeroEmpenho" control={control} label="Número do empenho" required cols="12 6 4" getFormErrorMessage={() => null} />
         <NumberFieldSeplag name="anoEmpenho" control={control} label="Ano do empenho" cols="12 6 4" getFormErrorMessage={() => null} />
         <TextFieldSeplag name="numeroContrato" control={control} label="Número do contrato" required cols="12 6 4" getFormErrorMessage={() => null} />
         <NumberFieldSeplag name="anoContrato" control={control} label="Ano do contrato" cols="12 6 4" getFormErrorMessage={() => null} />
         <TextFieldSeplag name="numeroAditivo" control={control} label="Número do aditivo" required cols="12 6 4" getFormErrorMessage={() => null} />
         <NumberFieldSeplag name="anoAditivo" control={control} label="Ano do aditivo" cols="12 6 4" getFormErrorMessage={() => null} />
         <TextFieldSeplag name="codigoUo" control={control} label="Código da UO" cols="12 6 4" getFormErrorMessage={() => null} />
         <TextFieldSeplag name="codigoUg" control={control} label="Código da UG" cols="12 6 4" getFormErrorMessage={() => null} />
        </>}
       </div>
      </div>

      <div id="bloco-taxa-inscricao" className={blocoClasse("bloco-taxa-inscricao")}>
       <BlocoHeader icone="pi-wallet" titulo="Taxa de inscrição" subtitulo="Valor da inscrição e regras de isenção, quando aplicável." />
       <div className="grid">
        <CheckboxFieldSeplag name="cobraTaxaInscricao" control={control} label=" " checkboxLabel="O certame cobra taxa de inscrição?" cols="12" getFormErrorMessage={() => null} />
        {valores.cobraTaxaInscricao === "S" && <>
         <CurrencyFieldSeplag name="valorInscricao" control={control} label="Valor da inscrição" required cols="12 6 4" getFormErrorMessage={() => null} />
         <DateFieldSeplag name="dataInicioInscricaoIsencao" control={control} label="Início da inscrição com isenção" required cols="12 6 4" getFormErrorMessage={() => null} />
         <DateFieldSeplag name="dataFimInscricaoIsencao" control={control} label="Fim da inscrição com isenção" required cols="12 6 4" getFormErrorMessage={() => null} />
         <DropdownFieldSeplag name="tipoIsencao" control={control} label="Tipo da isenção" required cols="12 6 4" options={[...TIPOS_ISENCAO]} optionLabel="label" optionValue="value" placeholder="Selecione" getFormErrorMessage={() => null} />
         <CampoLeiMultiplaSeplag name="leiIsencao" control={control} label="Lei de isenção" required cols="12 6 4" opcoes={opcoesLeis} onNovoCadastro={() => irCadastrarLei("leiIsencao")} />
        </>}
       </div>
      </div>

     </div></SpecArea>}

     {aba === "VAGAS_COTAS" && <SpecArea metadata={certameFormTabSpecifications["Vagas e Cotas"]}><div className="col-12">

      <div id="bloco-cotas" className={blocoClasse("bloco-cotas")}>
       <BlocoHeader icone="pi-percentage" titulo="Cotas" subtitulo="Tipos de cota previstos em lei para o certame." />
       <div className="grid align-items-end prototype-certame-subform">
        <DropdownFieldSeplag name="tipo" control={cotaForm.control} label="Tipo de cota" cols="12 6 4" options={[...TIPOS_COTA]} optionLabel="label" optionValue="value" getFormErrorMessage={() => null} />
        <CampoLeiMultiplaSeplag name="lei" control={cotaForm.control} label="Lei cadastrada" cols="12 6 6" opcoes={opcoesLeis} onNovoCadastro={() => irCadastrarLei("cotaLei")} />
        <div className="col-12 md:col-2"><BotaoAdicionarSeplag type="button" label="Adicionar" onClick={adicionarCota} /></div>
       </div>
       <TablePaginadoSeplag dataKey="id" data={resultadosSemPaginacao(cotas)} rows={50} paginator={false} lazy={false} selectionMode={null} columns={colunasCotas} hasEventoAcao handleView={null} handleEdit={null} handleDelete={(row) => removerCota(row.id)} handleOnPageChange={() => {}} />
      </div>

      <div id="bloco-cargos-vagas" className={blocoClasse("bloco-cargos-vagas")}>
       <BlocoHeader icone="pi-users" titulo="Cargos e vagas" subtitulo="Cargos/funções e vagas ofertadas, com vínculo automático ao Quadro de Vagas." />
       <div className="prototype-certame-subform">
        <div className="prototype-certame-subform-secao">
         <span className="prototype-certame-subform-secao-titulo">Identificação do cargo</span>
         <div className="grid align-items-end">
          <DropdownFieldSeplag name="vinculo" control={cargoForm.control} label="Vínculo da vaga" cols="12 6 2" options={[{ label:"Vaga nova do certame", value:"NOVO" }, { label:"Vaga existente no quadro", value:"EXISTENTE" }]} optionLabel="label" optionValue="value" getFormErrorMessage={() => null} />
          {valores.tipoCertame === "CONCURSO_PUBLICO" && <DropdownFieldSeplag name="carreira" control={cargoForm.control} label="Carreira" cols="12 6 2" options={[...CARREIRAS_CONCURSO]} optionLabel="label" optionValue="value" placeholder="Selecione" showClear getFormErrorMessage={() => null} />}
          {cargoValores.vinculo === "EXISTENTE"
           ? <DropdownFieldSeplag name="cargoExistenteId" control={cargoForm.control} label="Cargo/função" cols="12 6 2" options={CARGOS_CADASTRADOS.map((item) => ({ label:item.nome, value:item.id }))} optionLabel="label" optionValue="value" placeholder="Buscar cargo cadastrado" getFormErrorMessage={() => null} />
           : <TextFieldSeplag name="cargoNome" control={cargoForm.control} label="Cargo/função" cols="12 6 2" placeholder="Nome do novo cargo" getFormErrorMessage={() => null} />}
          {valores.setoresParticipantes.length > 1 && <DropdownFieldSeplag name="orgaoDestino" control={cargoForm.control} label="Órgão" cols="12 6 2" options={[{ label:"Todos os órgãos", value:ORGAO_TODOS }, ...valores.setoresParticipantes.map((orgao) => ({ label:orgao, value:orgao }))]} optionLabel="label" optionValue="value" placeholder="Selecione" showClear getFormErrorMessage={() => null} />}
          <SpecArea metadata={certameFormBlockSpecifications.quadroVagasVinculado}><RotuloSeplag nome="Quadro" cols="12 6 2"><div className="prototype-certame-campo-fixo-valor">{quadroVinculado ? `${quadroVinculado.quadroCodigo} — V${quadroVinculado.quadroVersao}` : "—"}</div></RotuloSeplag></SpecArea>
          <NumberFieldSeplag name="quantidadeVagas" control={cargoForm.control} label="Qtd. vagas" cols="12 6 2" inputStyle={{ width:"100%" }} getFormErrorMessage={() => null} />
         </div>
        </div>

        <div className="prototype-certame-subform-secao">
         <span className="prototype-certame-subform-secao-titulo">Localização e jornada</span>
         <div className="grid align-items-end">
          <TextFieldSeplag name="polo" control={cargoForm.control} label="Polo" cols="12 6 2" placeholder="Nome do Polo" getFormErrorMessage={() => null} />
          <MultiSelectFieldSeplag name="cidades" control={cargoForm.control} label="Cidade" cols="12 6 2" options={[...MUNICIPIOS_MT]} optionLabel="label" optionValue="value" display="chip" placeholder="Selecione" getFormErrorMessage={() => null} />
          <DropdownFieldSeplag name="jornada" control={cargoForm.control} label="Jornada" cols="12 6 2" options={[...JORNADAS_TRABALHO]} optionLabel="label" optionValue="value" placeholder="Selecione" showClear getFormErrorMessage={() => null} />
         </div>
        </div>

        <div className="prototype-certame-subform-secao">
         <span className="prototype-certame-subform-secao-titulo">Reserva de cotas <small>— opcional, pode adicionar mais de uma</small></span>
         <div className="grid align-items-end">
          <SpecArea metadata={certameFormBlockSpecifications.cadastroReserva}>
           <SwitchFieldSeplag name="aceitaCadastroReserva" control={cargoForm.control} label="Cargo aceita CR" cols="12 6 2" getFormErrorMessage={() => null} />
          </SpecArea>
          {cargoValores.aceitaCadastroReserva === "S" && <NumberFieldSeplag name="quantidadeCadastroReserva" control={cargoForm.control} label="Qtd. CR" required cols="12 6 2" inputStyle={{ width:"100%" }} getFormErrorMessage={() => null} />}
          <DropdownFieldSeplag name="tipoCota" control={cargoForm.control} label="Tipo de cota" cols="12 6 2" options={TIPOS_COTA.filter((item) => item.value !== "AMPLA")} optionLabel="label" optionValue="value" placeholder="Selecione" showClear getFormErrorMessage={() => null} />
          <NumberFieldSeplag name="quantidadeCota" control={cargoForm.control} label="Qtd. cota" cols="12 6 1" inputStyle={{ width:"100%" }} getFormErrorMessage={() => null} />
          <div className="col-12 md:col-1 lg:col-1 prototype-certame-add-cota"><BotaoIconSeplag type="button" icon="pi pi-plus" tooltip="Adicionar cota à lista" onClick={adicionarReservaCota} /></div>
          {reservasCotaPendentes.length > 0 && <div className="col-12"><div className="prototype-certame-cota-tags">
           {reservasCotaPendentes.map((reserva) => <span key={reserva.id} className="prototype-certame-cota-tag">
            {TIPOS_COTA.find((tipo) => tipo.value === reserva.tipo)?.label ?? reserva.tipo} ({reserva.quantidade})
            <button type="button" aria-label="Remover reserva de cota" onClick={() => removerReservaCota(reserva.id)}><i className="pi pi-times" aria-hidden="true" /></button>
           </span>)}
          </div></div>}
         </div>
        </div>

        <div className="prototype-certame-subform-rodape">
         <small className="text-color-secondary">Preencha os campos e clique em Adicionar para incluir o cargo na lista.</small>
         <BotaoAdicionarSeplag type="button" label="Adicionar" onClick={adicionarCargo} />
        </div>
       </div>
       <div className="prototype-certame-cargos-lista">
        {cargos.length === 0 && <p className="text-color-secondary prototype-certame-cargos-vazio">Nenhum registro encontrado</p>}
        {cargos.map((cargo) => {
         const aberto = cargosExpandidos.has(cargo.id);
         const temCotas = cargo.reservasCota.length > 0;
         return <div key={cargo.id} className="prototype-certame-cargo-card">
          <div className="prototype-certame-cargo-row">
           <BotaoIconSeplag type="button" className="prototype-certame-cargo-expand" tooltip={aberto ? "Recolher" : "Expandir"} icon={aberto ? "pi pi-chevron-down" : "pi pi-chevron-right"} onClick={() => alternarCargoExpandido(cargo.id)} />
           <BadgeSeplag label={cargo.vinculo === "EXISTENTE" ? "Vaga existente" : "Vaga nova"} color="#0b6199" bg="#e9f3fc" border="transparent" size="md" />
           <div className="prototype-certame-cargo-titulo">
            <strong>{cargo.cargoNome}</strong>
            <small>
             {cargo.orgaoDestino && <>{cargo.orgaoDestino === ORGAO_TODOS ? "Todos os órgãos" : cargo.orgaoDestino} • </>}
             {cargo.carreira && <>{CARREIRAS_CONCURSO.find((item) => item.value === cargo.carreira)?.label ?? cargo.carreira} • </>}
             {cargo.polo && <>Polo {cargo.polo} • </>}
             {cargo.cidades && cargo.cidades.length > 0 && <>Cidade {cargo.cidades.map(rotuloPolo).join(", ")} • </>}
             {cargo.jornada && <>{JORNADAS_TRABALHO.find((item) => item.value === cargo.jornada)?.label ?? cargo.jornada} • </>}
             {cargo.quadroCodigo ? <button type="button" className="prototype-certame-link-btn" onClick={() => navigate(`${CONTROLE_VAGAS_BASE_PATH}/quadro-autorizado`)}>{cargo.quadroCodigo} — Versão {cargo.quadroVersao}</button> : "Sem quadro vinculado"}
             {" "}• Cód. {cargo.codigoReferenciaTce}
             {cargo.aceitaCadastroReserva && <> • CR {cargo.quantidadeCadastroReserva ?? 0}</>}
            </small>
           </div>
           <span className="prototype-certame-cargo-vagas">{cargo.quantidadeVagas} vaga{cargo.quantidadeVagas === 1 ? "" : "s"}</span>
           <BadgeSeplag label={temCotas ? `${cargo.reservasCota.length} cota${cargo.reservasCota.length === 1 ? "" : "s"}` : "Ampla concorrência"} color={temCotas ? "#147441" : "#55637a"} bg={temCotas ? "#e2f5e8" : "#eef1f5"} border="transparent" size="md" />
           <div className="prototype-certame-cargo-acoes">
            <BotaoIconSeplag type="button" severity="danger" tooltip="Remover cargo" icon="pi pi-trash" onClick={() => removerCargo(cargo.id)} />
           </div>
          </div>
          <div className="prototype-certame-cargo-corpo" style={{ gridTemplateRows:aberto ? "1fr" : "0fr" }}>
           <div className="prototype-certame-cargo-corpo-conteudo">
            <TablePaginadoSeplag dataKey="id" data={resultadosSemPaginacao(cargo.reservasCota)} rows={50} paginator={false} lazy={false} selectionMode={null} columns={colunasReservasCota} handleOnPageChange={() => {}} />
           </div>
          </div>
         </div>;
        })}
       </div>
      </div>

     </div></SpecArea>}

     {aba === "DOCUMENTOS" && <SpecArea metadata={certameFormTabSpecifications["Documentos"]}><div id="bloco-documentos" className={`col-12 ${blocoClasse("bloco-documentos")}`}>
      <BlocoHeader icone="pi-file" titulo="Documentos do certame" subtitulo="Anexos exigidos para a prestação de contas ao TCE-MT." />
      <SeletorFormaAssinaturaDocumento valor={formaAssinaturaDocumentos} onChange={setFormaAssinaturaDocumentos} />
      {GRUPOS_DOCUMENTOS_CERTAME_ABA.map((grupo) => <div key={grupo.titulo} className="prototype-certame-documentos-grupo">
       <h4>{grupo.titulo}</h4>
       <DocumentosCertameTabela documentos={grupo.documentos} arquivos={arquivos} onChangeArquivo={onChangeArquivoDocumento} processosSigadoc={processosSigadocDocumentos} onChangeProcessoSigadoc={onChangeProcessoSigadocDocumento} formaAssinatura={formaAssinaturaDocumentos} documentoObrigatorio={documentoObrigatorio} onError={setErro} />
      </div>)}
      <p className="text-sm text-color-secondary">Formato aceito: .pdf | Tamanho máximo: 10MB</p>
     </div></SpecArea>}

    </CardSeplag>
   </form>
  </div>
 </SpecificationMode>;
}
