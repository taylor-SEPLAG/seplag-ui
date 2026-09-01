import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Controller, useForm, type Control, type FieldValues, type Path } from "react-hook-form";
import { CONTROLE_PSS_BASE_PATH as BASE, CONTROLE_PSS_DATA_REFERENCIA, CONTROLE_PSS_USUARIO_LOGADO } from "../constants";
import { controlePssStore, useControlePssStore } from "../controlePssStore";
import { CONTROLE_VAGAS_BASE_PATH } from "../../controleVagas/constants";
import { useLocais } from "../locais/locaisStore";
import { useDocumentosLegais } from "../../documentosLegais/documentosLegaisStore";
import { SpecArea, SpecificationMode } from "../../shared/visualizationModes";
import { certameFormActionSpecifications, certameFormBlockSpecifications, certameFormBusinessItems, certameFormScreenSpecification, certameFormTabSpecifications } from "./CertameFormSpecifications";
import { proximoNumeroCertame, calcularPrazoPrestacaoContas, calcularValidadeDias, certameDuplicado, dataEfeitoAnteriorPublicacao, homologacaoVigenteSemCancelamento } from "./validations";
import { ABRANGENCIAS, CARGOS_CADASTRADOS, CARREIRAS_CONCURSO, DOCUMENTOS_CERTAME, DOCUMENTOS_HOMOLOGACAO, DOCUMENTOS_RETIFICACAO_EDITAL, DOCUMENTOS_RETIFICACAO_HOMOLOGACAO, EMPRESAS_CADASTRADAS, FASES_TCE_FIXAS, JORNADAS_TRABALHO, LEIS_CERTAME, OPCOES_SIM_NAO, ORGAO_TODOS, ORGAOS_CERTAME, REGIMES_JURIDICOS, SITUACOES_CERTAME, TIPOS_CERTAME, TIPOS_CONCURSO_APLIC_TCE, TIPOS_CONTRATACAO_EXECUCAO, TIPOS_CONTRATO_BANCA, TIPOS_COTA, TIPOS_ISENCAO, TIPOS_VINCULO } from "./dominios";
import { useFasesCertame } from "../fasesCertame/fasesCertameStore";
import type { AbrangenciaCertame, CargoVagaCertame, Certame, CotaCertame, FaseCertame, RegimeJuridicoCertame, ReservaCotaCargo, SituacaoCertame, TaxaInscricaoCertame, TipoCertame, TipoContratacaoExecucaoCertame, TipoDocumentoCertame, TipoVinculoCertame } from "./types";
import { CardSeplag } from "@componentes/Card";
import { BadgeSeplag } from "@componentes/Badge";
import { MensagemSeplag } from "@componentes/Mensagem";
import { BotaoAdicionarSeplag, BotaoIconSeplag, BotaoSalvarSeplag, BotaoSeplag, BotaoVoltarSeplag } from "@componentes/Botao";
import { TabsSeplag, type TabItemSeplag } from "@componentes/Tabs";
import { DateFieldSeplag, CheckboxFieldSeplag, DropdownFieldSeplag, MaskFieldSeplag, MultiSelectFieldSeplag, NumberFieldSeplag, RadioButtonFieldSeplag, SwitchFieldSeplag, TextAreaFieldSeplag, TextFieldSeplag } from "@componentes/Fields";
import type { ArquivoAnexadoSeplag } from "@componentes/AnexarDocumento";
import RotuloSeplag from "@componentes/Rotulo";
import { TablePaginadoSeplag, type ColumnMetaSeplag } from "@componentes/TablePaginado";
import { DocumentosLegaisAssociadosSeplag, type DocumentoLegalAssociadoSeplag } from "@componentes/DocumentosLegaisAssociados";
import { Dropdown } from "primereact/dropdown";
import gridCss from "@uteis/Grid";
import { lerRascunhoCertame, limparRascunhoCertame, novoRascunhoCertameId, salvarRascunhoCertame } from "./rascunhoCertameStore";
import { DocumentosCertameTabela, resultadosSemPaginacao } from "./DocumentosCertameTabela";
import "./certame.css";

// Campo de lei com múltipla seleção, reaproveitando o layout padrão de "Documentos Legais
// Associados" (busca com chips, painel de opções com checkbox e atalho "Novo Cadastro"). RN: a
// primeira lei selecionada é sinalizada como a norma aplicável (indicarPrincipal), já que a ordem
// de seleção é significativa quando mais de uma lei rege o mesmo campo.
function CampoLeiMultiplaSeplag<T extends FieldValues = any>({ name, control, label, required, cols = "12", opcoes, onNovoCadastro, disabled }: Readonly<{ name:Path<T>; control:Control<T>; label:string; required?:boolean; cols?:string; opcoes:DocumentoLegalAssociadoSeplag[]; onNovoCadastro:() => void; disabled?:boolean }>) {
 // "Visualizar" (ação por lei já selecionada) navega para a página completa do Documento Legal —
 // mesmo padrão já usado em Controle de Vagas (BaseLegalVinculada.tsx): mostra todos os campos
 // cadastrados da norma (tipo, número, ano, ementa, datas) e o anexo, se houver.
 const navigate = useNavigate();
 return <div className={gridCss(cols)}>
  <Controller name={name} control={control} rules={required ? { validate:(value) => (Array.isArray(value) && value.length > 0) || `${label} é obrigatório` } : undefined} render={({ field }) => (
   <DocumentosLegaisAssociadosSeplag
    label={label}
    required={required}
    options={opcoes}
    value={(field.value as string[] | undefined) ?? []}
    onChange={(ids) => field.onChange(ids)}
    onNovoCadastro={onNovoCadastro}
    onVisualizar={(documento) => navigate(`/prototipos/sigep/documentos-legais/${documento.id}`)}
    placeholder="Buscar lei cadastrada"
    indicarPrincipal
    disabled={disabled}
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

// Rótulo curto de cota (ex.: "PCD" em vez de "PCD — Pessoas com Deficiência") para caber nos
// cartões compactos do painel "Distribuição da Vagas".
function rotuloCotaCurto(tipo:string) {
 const label = TIPOS_COTA.find((item) => item.value === tipo)?.label ?? tipo;
 return label.split(" — ")[0];
}

// Distribuição das vagas do cargo: um cartão por cota reservada (RN: cada tipo de cota é
// independente, pode haver mais de uma), Ampla Concorrência (calculada, nunca digitada) e
// Cadastro Reserva (independente, não desconta das outras duas).
function DistribuicaoVagasCargo({ quantidadeVagas, reservas, quantidadeCadastroReserva }:{ quantidadeVagas:number; reservas:readonly ReservaCotaCargo[]; quantidadeCadastroReserva?:number }) {
 const ampla = calcularAmplaConcorrencia(quantidadeVagas, reservas);
 return (
  <div className="prototype-certame-distribuicao-vagas">
   <header><i className="pi pi-info-circle" aria-hidden="true" /><span>Distribuição da Vagas</span></header>
   <div className="prototype-certame-distribuicao-vagas-itens">
    {reservas.map((reserva) => <div key={reserva.id} className="prototype-certame-distribuicao-vagas-item">
     <span>Cota - {rotuloCotaCurto(reserva.tipo)}</span>
     <strong>{reserva.quantidade}</strong>
    </div>)}
    <div className="prototype-certame-distribuicao-vagas-item">
     <span>Ampla concorrência</span>
     <strong>{ampla}</strong>
    </div>
    <div className="prototype-certame-distribuicao-vagas-item">
     <span>Cadastro reserva</span>
     <strong>{quantidadeCadastroReserva ?? "—"}</strong>
    </div>
   </div>
  </div>
 );
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
 dataInicioInscricaoIsencao?:string; dataFimInscricaoIsencao?:string; leiIsencao?:string[]; tipoIsencao?:string[];
 gerouDespesas:string;
 numeroEmpenho?:string; anoEmpenho?:number; tipoContrato?:string; numeroContrato?:string; anoContrato?:number;
 codigoUo?:string; codigoUg?:string; numeroAditivo?:string; anoAditivo?:number;
 cobraTaxaInscricao:string; valorInscricao?:number;
}
interface CotaFormValues { tipo:string; lei:string[] }
interface TaxaInscricaoRascunho { valor:string; inicioIsencao:string; fimIsencao:string; tipoIsencao:string; leiIsencao:string; }
interface CargoFormValues { vinculo:"EXISTENTE" | "NOVO"; cargoExistenteId?:string; cargoNome:string; carreira?:string; polo?:string; jornada?:string; orgaoDestino?:string; quantidadeVagas:number; tipoCota:string; quantidadeCota?:number; aceitaCadastroReserva:string; quantidadeCadastroReserva?:number }

// Consolidação de 8 para 5 abas fixas: cada aba antiga virou um bloco com subtítulo dentro da aba
// nova, preservando todos os campos, RNs e CAs originais. O histórico de situações deixou de ser
// uma aba do cadastro — agora abre como modal a partir da listagem (ver HistoricoSituacoesCertameModal
// e RegistrarSituacaoCertameModal).
export type Aba = "IDENTIFICACAO" | "CRONOGRAMA" | "FINANCEIRO" | "VAGAS_COTAS" | "DOCUMENTOS";
const abasBase:readonly { id:Aba; label:string }[] = [
 { id:"IDENTIFICACAO", label:"Identificação" },
 { id:"CRONOGRAMA", label:"Cronograma" },
 { id:"FINANCEIRO", label:"Contrato e Custos" },
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
  dataInicioInscricaoIsencao:certame.dataInicioInscricaoIsencao, dataFimInscricaoIsencao:certame.dataFimInscricaoIsencao, leiIsencao:certame.leiIsencao ? [...certame.leiIsencao] : undefined, tipoIsencao:certame.tipoIsencao ? [...certame.tipoIsencao] : undefined,
  gerouDespesas:certame.gerouDespesas ? "S" : "N",
  numeroEmpenho:certame.numeroEmpenho, anoEmpenho:certame.anoEmpenho, tipoContrato:certame.tipoContrato, numeroContrato:certame.numeroContrato, anoContrato:certame.anoContrato,
  codigoUo:certame.codigoUo, codigoUg:certame.codigoUg, numeroAditivo:certame.numeroAditivo, anoAditivo:certame.anoAditivo,
  cobraTaxaInscricao:certame.cobraTaxaInscricao ? "S" : "N", valorInscricao:certame.valorInscricao,
 };
 return {
  tipoCertame:"PSS", tipoConcursoAplic:"4",
  regimeJuridico:"REGIME_ESPECIAL", tipoVinculo:"CONTRATO_TEMPORARIO",
  setor:"", setoresParticipantes:[], objetivo:"",
  numeroConcurso:proximoNumeroCertame(anoReferencia, certames), anoConcurso:anoReferencia,
  nomeEdital:"", numeroEditalOrgao:"",
  dataPublicacaoEdital:"", abrangencia:"ESTADUAL", tipoContratacaoExecucao:"PROPRIA_UG",
  existePrevisaoRecursos:"N", gerouDespesas:"N", cobraTaxaInscricao:"N",
  // RN006: prazos padrão de posse (30 dias) e efetivo exercício (15 dias) para certame novo —
  // permanecem editáveis. Não há valor padrão para as prorrogações.
  diasPrazoPosse:30, diasPrazoExercicio:15,
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
// RegistrarSituacaoCertameModal), evitando tabelas vazias e redundantes no cadastro. Mesmo assim entram em
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

// Ampla Concorrência nunca é digitada — é sempre o restante das vagas do cargo depois de reservar
// as cotas (Qtd. vagas − soma das cotas). Cadastro Reserva é independente: não desconta da Ampla
// Concorrência nem das cotas, pois é só o banco de convocação futura.
function calcularAmplaConcorrencia(quantidadeVagas:number, reservas:readonly { quantidade:number }[]) {
 const totalCotas = reservas.reduce((total, item) => total + item.quantidade, 0);
 return Math.max(0, (quantidadeVagas || 0) - totalCotas);
}


export function CertameFormContent() {
 const { certames } = useControlePssStore();
 const navigate = useNavigate();
 const location = useLocation();
 const { id } = useParams<{ id?:string }>();
 const [searchParams, setSearchParams] = useSearchParams();
 const modoNovo = !id || id === "novo";
 const existente = modoNovo ? undefined : certames.find((item) => item.id === id);
 // "Visualizar" (ação da listagem) abre o mesmo formulário de "Editar", mas em modo somente leitura:
 // todos os campos ficam bloqueados e as ações de adicionar/remover cargo, cota e fase somem —
 // só acessível para um certame já existente (nunca para "novo certame").
 const modoVisualizar = !modoNovo && searchParams.get("modo") === "visualizar";

 // Identidade do rascunho: vários certames novos podem estar "em andamento" ao mesmo tempo (RN008),
 // então cada um precisa do seu próprio id — recebido em ?rascunho=<id> ao retomar via "Continuar
 // cadastro" na listagem, ou gerado aqui na primeira vez que "Novo certame" é aberto. Gravar o id de
 // volta na URL (replace, sem navegar) garante que um refresh no meio do preenchimento retome o
 // mesmo rascunho em vez de começar outro do zero.
 const rascunhoId = useMemo(() => searchParams.get("rascunho") ?? novoRascunhoCertameId(), []);
 useEffect(() => {
  if (!modoNovo || searchParams.get("rascunho") === rascunhoId) return;
  setSearchParams((atuais) => { const proximos = new URLSearchParams(atuais); proximos.set("rascunho", rascunhoId); return proximos; }, { replace:true });
 }, [modoNovo, rascunhoId, searchParams, setSearchParams]);

 // Rascunho de um cadastro em andamento (só se aplica a "novo certame" — ver RascunhoCertame acima).
 const rascunho = useMemo(() => (modoNovo ? lerRascunhoCertame(rascunhoId) : null), []);
 const [avisoRascunho, setAvisoRascunho] = useState(Boolean(rascunho));
 // Depois de "Salvar certame" (fluxo novo), o navigate() para /certames/:id ainda deixa este mesmo
 // componente montado por mais um render com `modoNovo` ainda true (o :id só troca no render
 // seguinte) — nesse render extra, o efeito de auto-salvar rascunho roda de novo (watch() do
 // react-hook-form gera um objeto `valores` novo a cada render, então o efeito sempre reexecuta) e
 // recria o rascunho logo depois de limparRascunhoCertame() já ter rodado. A ref corta isso: uma vez
 // salvo, o efeito para de escrever, mesmo nesse render extra.
 const certameSalvoRef = useRef(false);
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
 const { control, handleSubmit, watch, setValue, getValues } = useForm<CertameFormValues>({ defaultValues: rascunho?.valores ?? valoresIniciais(existente, certames) });
 const valores = watch();
 const dispensarParaProcessoSeletivo = valores.tipoCertame === "PSS";
 const dispensarParaConcurso = valores.tipoCertame === "CONCURSO_PUBLICO";
 const houveContratacaoEmpresa = valores.tipoContratacaoExecucao === "EMPRESA_CONTRATADA";
 // "Tipo de vínculo" lista só os vínculos com a flag do tipo de certame atual (concursoPublico ou
 // processoSeletivo); "Regime jurídico" lista só os regimes cadastrados no vínculo já selecionado
 // — fica vazio (e desabilitado) até o usuário escolher um Tipo de vínculo primeiro.
 const opcoesTipoVinculo = useMemo(() => TIPOS_VINCULO.filter((item) => dispensarParaConcurso ? item.concursoPublico : item.processoSeletivo), [dispensarParaConcurso]);
 const tipoVinculoSelecionado = TIPOS_VINCULO.find((item) => item.value === valores.tipoVinculo);
 const opcoesRegimeJuridico = useMemo(() => tipoVinculoSelecionado ? REGIMES_JURIDICOS.filter((item) => (tipoVinculoSelecionado.regimesJuridicos as readonly string[]).includes(item.value)) : [], [tipoVinculoSelecionado]);
 // Largura de coluna calculada pela quantidade de campos realmente visíveis em cada bloco (mesma
 // técnica de colsIdentificacaoCargo, em "Cargos e vagas") — evita linhas com espaço sobrando
 // quando campos condicionais estão ocultos. Onde a coluna resultante é estreita (col-2) e rótulos
 // longos quebrariam em duas linhas, a grade correspondente leva a classe
 // "prototype-certame-grid-6col" (certame.css), que reserva altura de rótulo e mantém os campos
 // alinhados na mesma linha mesmo quando um rótulo quebra.
 const colsEnquadramento = dispensarParaProcessoSeletivo ? "12 6" : "12 6 4";
 const colsDatasExecucao = dispensarParaProcessoSeletivo ? "12 6 2" : "12 6 3";
 const colsContratacaoCustos = houveContratacaoEmpresa ? "12 6 4" : "12 6 6";

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

 // RN: a validade em dias é recalculada a partir da data do resultado (marco inicial), não da
 // publicação do edital — evita que os dois campos (validade em dias x data de validade) fiquem
 // divergentes.
 useEffect(() => {
  const dias = calcularValidadeDias(valores.dataResultado, valores.dataValidade);
  if (dias !== undefined) setValue("validadeConcursoDias", dias);
 }, [valores.dataResultado, valores.dataValidade, setValue]);

 // O órgão mandante não pode também ser órgão participante — remove automaticamente se o usuário
 // trocar o mandante para um órgão já marcado como participante.
 useEffect(() => {
  if (valores.setor && valores.setoresParticipantes.includes(valores.setor)) {
   setValue("setoresParticipantes", valores.setoresParticipantes.filter((item) => item !== valores.setor));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [valores.setor]);

 const selecionarTipoCertame = (tipo:TipoCertame) => {
  const concurso = tipo === "CONCURSO_PUBLICO";
  setValue("tipoCertame", tipo);
  setValue("tipoConcursoAplic", concurso ? "1" : "4");
  setValue("regimeJuridico", concurso ? "ESTATUTARIO_CIVIL" : "REGIME_ESPECIAL");
  setValue("tipoVinculo", concurso ? "EFETIVO" : "CONTRATO_TEMPORARIO");
  setTipoConfirmado(true);
 };

 const [cotas, setCotas] = useState<CotaCertame[]>(existente ? [...existente.cotas] : (rascunho?.cotas ?? []));
 const cotaForm = useForm<CotaFormValues>({ defaultValues: { tipo:TIPOS_COTA[0].value, lei:[] } });
 const taxasLegadas:TaxaInscricaoCertame[] = existente?.cobraTaxaInscricao && existente.valorInscricao !== undefined ? [{ id:`TAXA-${existente.id}-1`, valor:existente.valorInscricao, inicioIsencao:existente.dataInicioInscricaoIsencao, fimIsencao:existente.dataFimInscricaoIsencao, tipoIsencao:existente.tipoIsencao?.[0], leiIsencao:existente.leiIsencao?.[0] }] : [];
 const [taxasInscricao, setTaxasInscricao] = useState<TaxaInscricaoCertame[]>(existente?.taxasInscricao ? [...existente.taxasInscricao] : taxasLegadas);
 const [taxaRascunho, setTaxaRascunho] = useState<TaxaInscricaoRascunho | null>(null);
 const [taxaEmEdicaoId, setTaxaEmEdicaoId] = useState<string | null>(null);
 const [errosTaxa, setErrosTaxa] = useState<Partial<Record<keyof TaxaInscricaoRascunho, string>>>({});
 const taxaValorRef = useRef<HTMLInputElement | null>(null);
 const adicionarTaxa = () => {
  if (taxaRascunho) return;
  setErrosTaxa({});
  setTaxaRascunho({ valor:"", inicioIsencao:"", fimIsencao:"", tipoIsencao:"", leiIsencao:"" });
  window.setTimeout(() => taxaValorRef.current?.focus(), 0);
 };
 const cancelarTaxa = () => { setTaxaRascunho(null); setTaxaEmEdicaoId(null); setErrosTaxa({}); };
 const editarTaxa = (taxa:TaxaInscricaoCertame) => {
  if (taxaRascunho) return;
  setErrosTaxa({});
  setTaxaEmEdicaoId(taxa.id);
  setTaxaRascunho({ valor:String(taxa.valor), inicioIsencao:taxa.inicioIsencao ?? "", fimIsencao:taxa.fimIsencao ?? "", tipoIsencao:taxa.tipoIsencao ?? "", leiIsencao:taxa.leiIsencao ?? "" });
  window.setTimeout(() => taxaValorRef.current?.focus(), 0);
 };
 const dataComparavel = (valor:string) => { const partes = valor.split("/"); return partes.length === 3 ? `${partes[2]}${partes[1]}${partes[0]}` : valor; };
 const formatarDataTaxa = (valor?:string) => valor && /^\d{4}-\d{2}-\d{2}$/.test(valor) ? valor.split("-").reverse().join("/") : (valor || "—");
 const salvarTaxa = () => {
  if (!taxaRascunho) return;
  const erros:Partial<Record<keyof TaxaInscricaoRascunho, string>> = {};
  const valor = Number(taxaRascunho.valor.replace(",", "."));
  if (!Number.isFinite(valor) || valor <= 0) erros.valor = "Informe um valor maior que zero.";
  if (!taxaRascunho.inicioIsencao) erros.inicioIsencao = "Informe a data inicial.";
  if (!taxaRascunho.fimIsencao) erros.fimIsencao = "Informe a data final.";
  if (!taxaRascunho.tipoIsencao) erros.tipoIsencao = "Selecione o tipo de isenção.";
  if (!taxaRascunho.leiIsencao) erros.leiIsencao = "Selecione a lei de isenção.";
  if (taxaRascunho.inicioIsencao && taxaRascunho.fimIsencao && dataComparavel(taxaRascunho.fimIsencao) < dataComparavel(taxaRascunho.inicioIsencao)) erros.fimIsencao = "A data final deve ser igual ou posterior à inicial.";
  if (Object.keys(erros).length) { setErrosTaxa(erros); return; }
  const taxaSalva:TaxaInscricaoCertame = { id:taxaEmEdicaoId ?? `TAXA-${Date.now()}`, valor, inicioIsencao:taxaRascunho.inicioIsencao, fimIsencao:taxaRascunho.fimIsencao, tipoIsencao:taxaRascunho.tipoIsencao, leiIsencao:taxaRascunho.leiIsencao };
  setTaxasInscricao((atuais) => taxaEmEdicaoId ? atuais.map((taxa) => taxa.id === taxaEmEdicaoId ? taxaSalva : taxa) : [...atuais, taxaSalva]);
  cancelarTaxa();
 };
 const excluirTaxa = (id:string) => { if (window.confirm("Excluir esta taxa de inscrição?")) setTaxasInscricao((atuais) => atuais.filter((taxa) => taxa.id !== id)); };
 // A reserva de cota de uma vaga só pode usar um tipo já cadastrado no bloco "Cotas" (que por sua vez
 // não deixa cadastrar um tipo sem lei — ver adicionarCota) — evita reservar cota sem lei que a ampare.
 const tiposCotaCadastrados = useMemo(() => new Set(cotas.filter((item) => item.lei.length > 0).map((item) => item.tipo)), [cotas]);
 const opcoesTipoCotaReserva = useMemo(() => TIPOS_COTA.filter((item) => item.value !== "AMPLA" && tiposCotaCadastrados.has(item.value)), [tiposCotaCadastrados]);

 // Ao voltar do cadastro de uma nova lei (atalho "+"), soma a lei recém-criada às já selecionadas no
 // campo de origem (identificado por campoLei no returnTo) e limpa os parâmetros da URL. Usa uma ref
 // para lembrar qual documentoLegalId já foi processado nesta sessão do componente: nem "não depender
 // de valores" nem "checar se o id já está na lista" bastam sozinhos, porque o StrictMode do React
 // roda o efeito duas vezes em sequência, antes de o primeiro setValue/navigate terminar de propagar
 // — só a ref, que é síncrona e não depende de nenhum estado externo, evita a duplicata de verdade.
 const documentoLegalProcessadoRef = useRef<string | null>(null);
 useEffect(() => {
  const documentoLegalId = searchParams.get("documentoLegalId");
  if (!documentoLegalId || !campoLeiRetorno || documentoLegalProcessadoRef.current === documentoLegalId) return;
  documentoLegalProcessadoRef.current = documentoLegalId;
  if (campoLeiRetorno === "cotaLei") cotaForm.setValue("lei", [...(cotaForm.getValues("lei") ?? []), documentoLegalId]);
  else if (campoLeiRetorno === "leiContratoTemporario" || campoLeiRetorno === "leiProcessoSeletivoSimplificado" || campoLeiRetorno === "leiIsencao") setValue(campoLeiRetorno, [...(getValues(campoLeiRetorno) ?? []), documentoLegalId]);
  navigate(location.pathname, { replace:true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [searchParams, campoLeiRetorno]);

 const [cargos, setCargos] = useState<CargoVagaCertame[]>(existente ? [...existente.cargos] : (rascunho?.cargos ?? []));
 const polos = useLocais();
 const polosOptions = useMemo(() => polos.filter((item) => item.situacao === "ATIVO").map((item) => ({ label:item.nomeLocal, value:item.nomeLocal })), [polos]);
 const cargoForm = useForm<CargoFormValues>({ defaultValues: { vinculo:"NOVO", cargoExistenteId:undefined, cargoNome:"", carreira:undefined, polo:"", jornada:undefined, orgaoDestino:undefined, quantidadeVagas:0, tipoCota:"", quantidadeCota:0, aceitaCadastroReserva:"N", quantidadeCadastroReserva:0 } });
 const cargoValores = cargoForm.watch();
 const cargoExistenteSelecionado = cargoValores.vinculo === "EXISTENTE" ? CARGOS_CADASTRADOS.find((item) => item.id === cargoValores.cargoExistenteId) : undefined;
 const cargoNomeAtual = cargoValores.vinculo === "EXISTENTE" ? cargoExistenteSelecionado?.nome ?? "" : cargoValores.cargoNome;
 const quadroVinculado = buscarQuadroPorCargo(cargoNomeAtual ?? "");
 // RN: bloqueio de carga repetida — o par (Cargo/função + Jornada) não pode repetir o de uma vaga
 // já salva na lista do certame. Verificado em tempo real (a cada tecla/seleção), contra `cargos`
 // (lista salva), nunca contra o próprio formulário em edição.
 const cargoJornadaRepetida = Boolean(cargoNomeAtual?.trim() && cargoValores.jornada && cargos.some((item) =>
  item.jornada === cargoValores.jornada && item.cargoNome.trim().toLocaleLowerCase("pt-BR") === cargoNomeAtual.trim().toLocaleLowerCase("pt-BR")));
 // "Resumo da vaga" — pills com o que já foi preenchido no formulário, exibidas antes de confirmar
 // a inclusão na lista (bloco "Cargos e vagas").
 const resumoVagaPills = [
  cargoValores.vinculo === "EXISTENTE" ? "Vaga existente" : "Vaga nova",
  cargoNomeAtual?.trim() || undefined,
  cargoValores.carreira ? (CARREIRAS_CONCURSO.find((item) => item.value === cargoValores.carreira)?.label ?? cargoValores.carreira) : undefined,
  cargoValores.orgaoDestino ? (cargoValores.orgaoDestino === ORGAO_TODOS ? "Todos os órgãos" : cargoValores.orgaoDestino) : undefined,
  cargoValores.polo || undefined,
  cargoValores.jornada ? (JORNADAS_TRABALHO.find((item) => item.value === cargoValores.jornada)?.label ?? cargoValores.jornada) : undefined,
  cargoValores.quantidadeVagas > 0 ? `${cargoValores.quantidadeVagas} vaga${cargoValores.quantidadeVagas === 1 ? "" : "s"}` : undefined,
 ].filter((label):label is string => Boolean(label));
 const resumoVagaCrPill = cargoValores.aceitaCadastroReserva === "S" && cargoValores.quantidadeCadastroReserva ? `CR ${cargoValores.quantidadeCadastroReserva}` : undefined;
 // Sugere a jornada já cadastrada para o cargo selecionado, mas o campo continua editável — o
 // usuário pode ajustar manualmente caso o certame preveja jornada diferente da vigente.
 useEffect(() => {
  if (cargoExistenteSelecionado?.jornada) cargoForm.setValue("jornada", cargoExistenteSelecionado.jornada);
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [cargoExistenteSelecionado?.id]);
 // Largura das colunas de "Identificação do cargo" ajustada à quantidade de campos realmente
 // visíveis (Carreira e Órgão são condicionais) — grade de 4 colunas (25%) quando completa, para
 // não deixar campos sobrando sozinhos numa linha quase vazia.
 const mostrarCarreiraCargo = valores.tipoCertame === "CONCURSO_PUBLICO";
 const mostrarOrgaoCargo = valores.setoresParticipantes.length > 1;
 const totalCamposIdentificacaoCargo = 4 + (mostrarCarreiraCargo ? 1 : 0) + (mostrarOrgaoCargo ? 1 : 0);
 const colsIdentificacaoCargo = totalCamposIdentificacaoCargo === 4 ? "12 6 3" : "12 6 2";
 // Reservas de cota do cargo em edição (antes de "Adicionar") — um mesmo cargo pode acumular mais
 // de uma reserva (ex.: 2 PCD + 1 PPP) antes de ser efetivamente incluído na lista de cargos.
 const [reservasCotaPendentes, setReservasCotaPendentes] = useState<ReservaCotaCargo[]>([]);

 const [fases, setFases] = useState<FaseCertame[]>(existente ? [...existente.fases] : (rascunho?.fases ?? [...FASES_TCE_FIXAS]));
 const [faseArrastada, setFaseArrastada] = useState<number | null>(null);
 // "Nome da fase" só aceita seleção do catálogo de Cadastro > Controle de Certame > Fase do
 // Certame (RN005) — sem digitação livre. O catálogo já vem seedado com os 17 Tipos de
 // Prova/Etapa do TCE-MT (tipoTceId preenchido) e cresce com as fases que o usuário cadastrar lá.
 const catalogoFases = useFasesCertame();
 const opcoesFase = useMemo(() => catalogoFases.filter((item) => item.situacao === "ATIVO").map((item) => ({ label:item.nome, value:item.nome })), [catalogoFases]);

 const [arquivos, setArquivos] = useState<Partial<Record<TipoDocumentoCertame, ArquivoAnexadoSeplag>>>(() =>
  rascunho?.arquivos ?? Object.fromEntries(TODOS_DOCUMENTOS_CERTAME.map((item) => [item.tipo, arquivoExistente(existente, item.tipo as TipoDocumentoCertame)]).filter(([, valor]) => valor)) as Partial<Record<TipoDocumentoCertame, ArquivoAnexadoSeplag>>,
 );
 // Salva o progresso do cadastro (novo certame) a cada alteração, para recuperar automaticamente
 // caso o usuário saia do formulário antes de salvar (ex.: atalho "Cadastrar nova lei").
 useEffect(() => {
  if (!modoNovo || !tipoConfirmado || certameSalvoRef.current) return;
  salvarRascunhoCertame({ id:rascunhoId, tipoConfirmado, aba, valores, cotas, cargos, fases, arquivos });
 }, [modoNovo, tipoConfirmado, aba, valores, cotas, cargos, fases, arquivos, rascunhoId]);

 const onChangeArquivoDocumento = (tipo:TipoDocumentoCertame, arquivo:ArquivoAnexadoSeplag | undefined) => setArquivos((atuais) => ({ ...atuais, [tipo]: arquivo }));

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

 // Cada cargo/vaga usa o mesmo grid padrão da biblioteca (TablePaginadoSeplag) da tabela de Cotas
 // acima: o cabeçalho resume vínculo, quadro, vagas e CR; a linha expande (rowExpansionTemplate)
 // para detalhar Cota/Ampla concorrência/Cadastro reserva — mais claro que empilhar tudo em tags.
 const [cargosExpandidos, setCargosExpandidos] = useState<Set<string>>(new Set());
 const alternarCargoExpandido = (id:string) => setCargosExpandidos((atuais) => {
  const proximos = new Set(atuais);
  if (proximos.has(id)) proximos.delete(id); else proximos.add(id);
  return proximos;
 });
 const cargosExpandidosRows = Object.fromEntries([...cargosExpandidos].map((id) => [id, true]));

 const colunasCargos:ColumnMetaSeplag<CargoVagaCertame>[] = [
  { header:"", body:(cargo) => <BotaoIconSeplag type="button" className="prototype-certame-cargo-expand" tooltip={cargosExpandidos.has(cargo.id) ? "Recolher" : "Expandir"} icon={cargosExpandidos.has(cargo.id) ? "pi pi-chevron-down" : "pi pi-chevron-right"} onClick={() => alternarCargoExpandido(cargo.id)} /> },
  { header:"Vínculo", body:(cargo) => <BadgeSeplag label={cargo.vinculo === "EXISTENTE" ? "Vaga existente" : "Vaga nova"} color="#0b6199" bg="#e9f3fc" border="transparent" size="sm" /> },
  { header:"Carreira", body:(cargo) => cargo.carreira ? (CARREIRAS_CONCURSO.find((item) => item.value === cargo.carreira)?.label ?? cargo.carreira) : "—" },
  { header:"Cargo/função", body:(cargo) => <strong>{cargo.cargoNome}</strong> },
  { header:"Órgão", body:(cargo) => cargo.orgaoDestino ? (cargo.orgaoDestino === ORGAO_TODOS ? "Todos os órgãos" : cargo.orgaoDestino) : "—" },
  { header:"Quadro", body:(cargo) => cargo.quadroCodigo ? <button type="button" className="prototype-certame-link-btn" onClick={() => navigate(`${CONTROLE_VAGAS_BASE_PATH}/quadro-autorizado`)}>{cargo.quadroCodigo}</button> : "—" },
  { header:"Polo", body:(cargo) => cargo.polo || "—" },
  { header:"Jornada", body:(cargo) => cargo.jornada ? (JORNADAS_TRABALHO.find((item) => item.value === cargo.jornada)?.label ?? cargo.jornada) : "—" },
  { header:"Qtd. vagas", body:(cargo) => <BadgeSeplag label={`${cargo.quantidadeVagas} vaga${cargo.quantidadeVagas === 1 ? "" : "s"}`} color="#0b6199" bg="#e9f3fc" border="transparent" size="sm" /> },
  { header:"CR", body:(cargo) => cargo.aceitaCadastroReserva ? <BadgeSeplag label={String(cargo.quantidadeCadastroReserva ?? 0)} color="#147441" bg="#e2f5e8" border="transparent" size="sm" /> : "—" },
  { header:"Cotas", body:(cargo) => {
   const temCotas = cargo.reservasCota.length > 0;
   return <BadgeSeplag label={`${cargo.reservasCota.length} cota${cargo.reservasCota.length === 1 ? "" : "s"}`} color={temCotas ? "#147441" : "#55637a"} bg={temCotas ? "#e2f5e8" : "#eef1f5"} border="transparent" size="sm" />;
  } },
 ];

 const salvar = handleSubmit((dados) => {
  if (modoVisualizar) return;
  setErro(null);
  if (dados.cobraTaxaInscricao === "S" && taxaRascunho) { setErro("Salve ou cancele a nova taxa de inscrição antes de salvar o certame."); irParaBloco("FINANCEIRO", "bloco-taxa-inscricao"); return; }
  if (dados.cobraTaxaInscricao === "S" && taxasInscricao.length === 0) { setErro("Adicione ao menos uma taxa de inscrição."); irParaBloco("FINANCEIRO", "bloco-taxa-inscricao"); return; }
  // RN-23 (ER143): número do certame (TCE-MT) não pode se repetir para o mesmo tipo e exercício.
  if (certameDuplicado(certames, dados, existente?.id)) { setErro("Já existe um certame aberto com esse número e tipo. Verifique."); irParaBloco("IDENTIFICACAO", "bloco-identificacao"); return; }
  // Cargos/vagas e documentos não bloqueiam mais o salvamento: um certame pode ser salvo só com os
  // dados básicos de Identificação e liberado para a comissão completar o restante depois, editando
  // o registro já salvo — vários certames podem estar "em andamento" ao mesmo tempo dessa forma.

  const agora = CONTROLE_PSS_DATA_REFERENCIA.split("-").reverse().join("/");
  const documentos = TODOS_DOCUMENTOS_CERTAME.filter((doc) => arquivos[doc.tipo as TipoDocumentoCertame]).map((doc) => ({ tipo:doc.tipo as TipoDocumentoCertame, nomeArquivo:arquivos[doc.tipo as TipoDocumentoCertame]!.nome, anexadoEm:agora }));
  // RN-22: "houveContratacaoBanca" deixou de ser um campo do formulário e passa a ser derivado do
  // Tipo de contratação (execução), única fonte de verdade.
  const houveContratacaoBanca = dados.tipoContratacaoExecucao === "EMPRESA_CONTRATADA";

  if (existente) {
   controlePssStore.set("certames", (atuais) => atuais.map((item) => item.id === existente.id ? {
    ...item, ...dados, existePrevisaoRecursos:dados.existePrevisaoRecursos === "S", houveContratacaoBanca, gerouDespesas:dados.gerouDespesas === "S", cobraTaxaInscricao:dados.cobraTaxaInscricao === "S",
    cotas, cargos, fases, documentos, taxasInscricao:dados.cobraTaxaInscricao === "S" ? taxasInscricao : [], atualizadoEm:agora,
   } : item));
   navigate(`${BASE}/certames/${existente.id}`);
   return;
  }
  const novoId = `CERT-${dados.anoConcurso}-${dados.numeroConcurso.slice(-3)}`;
  const novo:Certame = {
   id:novoId, ...dados, existePrevisaoRecursos:dados.existePrevisaoRecursos === "S", houveContratacaoBanca, gerouDespesas:dados.gerouDespesas === "S", cobraTaxaInscricao:dados.cobraTaxaInscricao === "S",
   cotas, cargos, fases, documentos, taxasInscricao:dados.cobraTaxaInscricao === "S" ? taxasInscricao : [],
   situacaoAtual:"ABERTO",
   historicoSituacoes:[{ id:`SIT-${novoId}-1`, certameId:novoId, tipo:"ABERTO", dataEfeito:dados.dataPublicacaoEdital, registradoEm:`${agora} 09:00`, usuario:CONTROLE_PSS_USUARIO_LOGADO, prazoPrestacaoContas:calcularPrazoPrestacaoContas(dados.dataPublicacaoEdital) }],
   criadoEm:agora, atualizadoEm:agora, responsavel:CONTROLE_PSS_USUARIO_LOGADO,
  };
  controlePssStore.set("certames", (atuais) => [...atuais, novo]);
  certameSalvoRef.current = true;
  limparRascunhoCertame(rascunhoId);
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
  if (cargoJornadaRepetida) { setErro("Já existe uma vaga cadastrada para este Cargo/função com a mesma Jornada. Ajuste o cargo ou a jornada para continuar."); return; }
  const totalReservado = reservasCotaPendentes.reduce((total, item) => total + item.quantidade, 0);
  if (totalReservado > dados.quantidadeVagas) { setErro("A soma das cotas reservadas não pode exceder a quantidade de vagas do cargo."); return; }
  if (dados.aceitaCadastroReserva === "S" && !(dados.quantidadeCadastroReserva && dados.quantidadeCadastroReserva > 0)) { setErro("Informe a quantidade de Cadastro Reserva (CR) para as vagas de ampla concorrência."); return; }
  setErro(null);
  const quadro = cargoExistente ?? buscarQuadroPorCargo(cargoNome);
  setCargos((atuais) => [...atuais, { id:`CGV-${Date.now()}`, vinculo:dados.vinculo, cargoExistenteId:cargoExistente?.id, cargoNome, carreira:valores.tipoCertame === "CONCURSO_PUBLICO" ? dados.carreira : undefined, polo:dados.polo?.trim() ? dados.polo.trim() : undefined, jornada:dados.jornada, orgaoDestino:valores.setoresParticipantes.length > 1 ? dados.orgaoDestino : undefined, codigoReferenciaTce:"001", quantidadeVagas:dados.quantidadeVagas, reservasCota:reservasCotaPendentes, aceitaCadastroReserva:dados.aceitaCadastroReserva === "S", quantidadeCadastroReserva:dados.aceitaCadastroReserva === "S" ? dados.quantidadeCadastroReserva : undefined, quadroCodigo:quadro?.quadroCodigo, quadroVersao:quadro?.quadroVersao }]);
  cargoForm.reset({ vinculo:"NOVO", cargoExistenteId:undefined, cargoNome:"", carreira:undefined, polo:"", jornada:undefined, orgaoDestino:undefined, quantidadeVagas:0, tipoCota:"", quantidadeCota:0, aceitaCadastroReserva:"N", quantidadeCadastroReserva:0 });
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

 if (!modoNovo && !existente) return <div className="prototype-page-content prototype-page-content--white prototype-certame-form-page"><CardSeplag title="Certame não encontrado"><p className="col-12">O certame solicitado não foi localizado.</p></CardSeplag></div>;

 if (modoNovo && !tipoConfirmado) return <SpecificationMode screen={certameFormScreenSpecification} businessItems={certameFormBusinessItems}>
  <div className="prototype-page-content prototype-page-content--white prototype-certame-form-page">
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
  <div className="prototype-page-content prototype-page-content--white prototype-certame-form-page">
   <form onSubmit={salvar}>
    <CardSeplag
     title={modoNovo ? "Novo certame" : `${existente?.numeroEditalOrgao} — ${existente?.nomeEdital}`}
     actions={!modoNovo && existente ? <div className="flex align-items-center gap-2">
      {modoVisualizar && <BadgeSeplag label="Somente leitura" color="#55637a" bg="#eef1f5" border="transparent" size="md" />}
      <BadgeSeplag label={situacaoLabel[existente.situacaoAtual]} color={situacaoEstilo[existente.situacaoAtual].color} bg={situacaoEstilo[existente.situacaoAtual].bg} border="transparent" size="md" />
     </div> : undefined}
     footer={<div className="col-12 flex justify-content-end align-items-center gap-2">
      <BotaoVoltarSeplag type="button" onClick={voltar} />
      {!ehUltimaAba && <BotaoSeplag type="button" label="Avançar" icon="pi pi-arrow-right" iconPos="right" onClick={avancar} />}
      {ehUltimaAba && !modoVisualizar && <SpecArea metadata={certameFormActionSpecifications["Salvar certame"]}><BotaoSalvarSeplag type="submit" label="Salvar certame" /></SpecArea>}
     </div>}
    >
     {erro && <div id="certame-form-erro" className="col-12"><MensagemSeplag severity="error" message={erro} cols="12" /></div>}
     {avisoRascunho && <div className="col-12"><MensagemSeplag severity="info" message="Continuamos de onde você parou — o rascunho deste cadastro foi restaurado automaticamente." cols="12" /></div>}

     <TabsSeplag<Aba>
      items={abasFluxo}
      activeValue={aba}
      onChange={setAba}
      equalWidth
      className="prototype-certame-tabs"
     />

     {aba === "IDENTIFICACAO" && <SpecArea metadata={certameFormTabSpecifications["Identificação"]}><div className="col-12">

      <div id="bloco-identificacao" className={blocoClasse("bloco-identificacao")}>
       <BlocoHeader icone="pi-id-card" titulo="Identificação do certame" subtitulo="Dados básicos do certame: tipo, ano, número e nome do edital." />
       <div className="grid">
        <RotuloSeplag nome="Tipo do certame / Aplic. TCE-MT" cols="12 6 5" obrigatorio><div className="prototype-certame-campo-fixo-valor">{(() => {
         const rotuloTipoCertame = TIPOS_CERTAME.find((item) => item.value === valores.tipoCertame)?.label;
         const rotuloAplicTce = TIPOS_CONCURSO_APLIC_TCE.find((item) => item.value === valores.tipoConcursoAplic)?.label;
         // Remove sigla entre parênteses (ex.: "(PSS)") só para comparar — evita repetir a mesma
         // informação quando o rótulo do TCE-MT já descreve o mesmo tipo de certame.
         const semSigla = (texto?:string) => texto?.replace(/\s*\([^)]*\)\s*$/, "").trim();
         return rotuloAplicTce && semSigla(rotuloAplicTce) !== semSigla(rotuloTipoCertame) ? `${rotuloTipoCertame} — ${rotuloAplicTce}` : (rotuloAplicTce ?? rotuloTipoCertame);
        })()}</div></RotuloSeplag>
        <NumberFieldSeplag name="anoConcurso" control={control} label="Ano do concurso" required cols="12 6 4" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        <MaskFieldSeplag name="numeroConcurso" control={control} label="Número do certame (TCE-MT)" required cols="12 6" mask="99999999999" placeholder="00000000000" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        <TextFieldSeplag name="numeroEditalOrgao" control={control} label="Número do edital do órgão" required cols="12 6" placeholder="Ex.: 001/SEPLAG/2026" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        <TextFieldSeplag name="nomeEdital" control={control} label="Nome do edital" required cols="12" placeholder="[NÚMERO]/[ÓRGÃO]/[ANO] [descrição livre]" disabled={modoVisualizar} getFormErrorMessage={() => null} />
       </div>
      </div>

      <div className={blocoClasse("bloco-orgaos-envolvidos")}>
       <BlocoHeader icone="pi-building" titulo="Órgãos envolvidos" subtitulo="Órgão mandante e órgãos participantes do certame." />
       <div className="grid">
        {!modoNovo
         ? <SpecArea metadata={certameFormBlockSpecifications.mandanteBloqueado}><RotuloSeplag nome="Órgão responsável (mandante)" cols="12 6" obrigatorio><div className="prototype-certame-campo-fixo"><div className="prototype-certame-campo-fixo-valor">{valores.setor}</div><small>Bloqueado após o cadastro — RN-05.</small></div></RotuloSeplag></SpecArea>
         : <DropdownFieldSeplag name="setor" control={control} label="Órgão responsável (mandante)" required cols="12 6" options={ORGAOS_CERTAME.map((item) => ({ label:item, value:item }))} optionLabel="label" optionValue="value" placeholder="Selecione" showClear={false} panelClassName="prototype-certame-dropdown-panel" disabled={modoVisualizar} getFormErrorMessage={() => null} />}
        <MultiSelectFieldSeplag name="setoresParticipantes" control={control} label="Órgãos participantes" cols="12 6" options={ORGAOS_CERTAME.filter((item) => item !== valores.setor).map((item) => ({ label:item, value:item }))} optionLabel="label" optionValue="value" placeholder="(selecione)" display="chip" disabled={modoVisualizar} getFormErrorMessage={() => null} />
       </div>
      </div>

      <div className={blocoClasse("bloco-enquadramento")}>
       <BlocoHeader icone="pi-shield" titulo="Enquadramento funcional e legal" subtitulo="Vínculo funcional, regime jurídico e base legal do certame." />
       <div className="grid prototype-certame-grid-6col">
        {/* Tipo de vínculo vem antes de Regime jurídico — o vínculo funcional determina o regime.
            As opções de cada campo vêm do catálogo TIPOS_VINCULO (dominios.ts): Tipo de vínculo é
            filtrado pela flag concursoPublico/processoSeletivo do tipo de certame atual; Regime
            jurídico é filtrado pelos regimes cadastrados no vínculo já selecionado. */}
        <DropdownFieldSeplag name="tipoVinculo" control={control} label="Tipo de vínculo" required cols={colsEnquadramento} options={opcoesTipoVinculo} optionLabel="label" optionValue="value" placeholder="Selecione" showClear={false} panelClassName="prototype-certame-dropdown-panel" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        <DropdownFieldSeplag name="regimeJuridico" control={control} label="Regime jurídico" required cols={colsEnquadramento} options={opcoesRegimeJuridico} optionLabel="label" optionValue="value" placeholder={tipoVinculoSelecionado ? "Selecione" : "Selecione o tipo de vínculo primeiro"} showClear={false} panelClassName="prototype-certame-dropdown-panel" disabled={modoVisualizar || !tipoVinculoSelecionado} getFormErrorMessage={() => null} />
        <CampoLeiMultiplaSeplag name="leiContratoTemporario" control={control} label={dispensarParaConcurso ? "Lei do concurso" : "Lei de contrato temporário"} required={dispensarParaConcurso || valores.tipoVinculo === "CONTRATO_TEMPORARIO"} cols={colsEnquadramento} opcoes={opcoesLeis} onNovoCadastro={() => irCadastrarLei("leiContratoTemporario")} disabled={modoVisualizar} />
        {dispensarParaProcessoSeletivo && <CampoLeiMultiplaSeplag name="leiProcessoSeletivoSimplificado" control={control} label="Lei do processo seletivo" required cols={colsEnquadramento} opcoes={opcoesLeis} onNovoCadastro={() => irCadastrarLei("leiProcessoSeletivoSimplificado")} disabled={modoVisualizar} />}
       </div>
      </div>

      <div className={blocoClasse("bloco-objetivo")}>
       <BlocoHeader icone="pi-align-left" titulo="Objetivo" subtitulo="Descrição do objetivo do certame." />
       <div className="grid">
        <TextAreaFieldSeplag name="objetivo" control={control} label=" " cols="12" maxLength={1000} placeholder="Descreva o objetivo do certame..." disabled={modoVisualizar} getFormErrorMessage={() => null} />
       </div>
      </div>

     </div></SpecArea>}

     {aba === "CRONOGRAMA" && <SpecArea metadata={certameFormTabSpecifications["Cronograma"]}><div className="col-12">

      <div id="bloco-datas-execucao" className={blocoClasse("bloco-datas-execucao")}>
       <BlocoHeader icone="pi-calendar" titulo="Datas e execução" subtitulo="Marcos temporais do certame, a partir da publicação do edital." />
       <div className={`grid${dispensarParaProcessoSeletivo ? " prototype-certame-grid-6col" : ""}`}>
        <DateFieldSeplag name="dataPublicacaoEdital" control={control} label="Data de publicação do edital" required cols={colsDatasExecucao} disabled={modoVisualizar} getFormErrorMessage={() => null} />
        <DateFieldSeplag name="dataRealizacao" control={control} label="Data de realização" required cols={colsDatasExecucao} validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        <DateFieldSeplag name="dataValidade" control={control} label="Data de validade" required cols={colsDatasExecucao} validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        <DateFieldSeplag name="dataResultado" control={control} label="Data do resultado" required cols={colsDatasExecucao} validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        <DateFieldSeplag name="inicioInscricoesGerais" control={control} label="Início das inscrições gerais" required cols={colsDatasExecucao} validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        <DateFieldSeplag name="fimInscricoesGerais" control={control} label="Fim das inscrições gerais" required cols={colsDatasExecucao} validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        {!dispensarParaProcessoSeletivo && <DateFieldSeplag name="dataProrrogacao" control={control} label="Data de prorrogação" cols={colsDatasExecucao} validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" disabled={modoVisualizar} getFormErrorMessage={() => null} />}
        {!dispensarParaProcessoSeletivo && <DateFieldSeplag name="dataCancelamento" control={control} label="Data de cancelamento" cols={colsDatasExecucao} validateAfterDate={valores.dataPublicacaoEdital} validateAfterMessage="Não pode ser anterior à publicação do edital (RN-07)" disabled={modoVisualizar} getFormErrorMessage={() => null} />}
       </div>
       {/* Grade própria (não a mesma dos campos de data acima) para que estes 3 campos sempre
           comecem em uma linha nova e preencham certinho, em vez de o PrimeFlex encaixá-los na
           sobra da última linha de datas. */}
       <div className="grid">
        <NumberFieldSeplag name="validadeConcursoDias" control={control} label={dispensarParaProcessoSeletivo ? "Validade do processo seletivo (dias)" : "Validade do concurso (dias)"} required={dispensarParaConcurso} cols="12 6 4" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="previsaoProrrogacaoDias" control={control} label="Previsão para prorrogação (dias)" cols="12 6 4" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="prorrogacaoValidadeDias" control={control} label="Prorrogação da validade (dias)" cols="12 6 4" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        <RadioButtonFieldSeplag name="existePrevisaoRecursos" control={control} label="Existe previsão de recursos?" required={dispensarParaConcurso} options={[...OPCOES_SIM_NAO]} cols="12" disabled={modoVisualizar} getFormErrorMessage={() => null} />
       </div>
      </div>

      <SpecArea metadata={certameFormBlockSpecifications.fasesFixas}><div id="bloco-fases" className={`${blocoClasse("bloco-fases")} prototype-certame-fases`}>
       <div className="prototype-certame-fases-head">
        <BlocoHeader icone="pi-sitemap" titulo="Fases do certame" subtitulo="Cronograma editável de fases, com base no catálogo do TCE-MT." />
        {!modoVisualizar && <BotaoAdicionarSeplag type="button" label="Adicionar fase" onClick={adicionarFase} />}
       </div>
       <div className="prototype-certame-fase-header">
        <span />
        <span>Nome da fase</span>
        <span>Data início<em className="obrigatorio" aria-hidden="true">*</em></span>
        <span>Data fim<em className="obrigatorio" aria-hidden="true">*</em></span>
        <span />
       </div>
       <div className="prototype-certame-fase-list">
        {fases.map((fase) => {
         const ehFaseTce = catalogoFases.some((item) => item.situacao === "ATIVO" && Boolean(item.tipoTceId) && item.nome === fase.nome);
         return <div
         key={fase.ordem}
         className="prototype-certame-fase-row"
         draggable={!modoVisualizar}
         onDragStart={() => setFaseArrastada(fase.ordem)}
         onDragOver={(event) => event.preventDefault()}
         onDrop={() => { if (faseArrastada !== null) moverFase(faseArrastada, fase.ordem); setFaseArrastada(null); }}
         onDragEnd={() => setFaseArrastada(null)}
        >
         <i className="pi pi-bars prototype-certame-fase-drag-handle" aria-hidden="true" />
         <label>
          <span className="prototype-certame-fase-visually-hidden">Nome da fase</span>
          <Dropdown
           inputId={`fase-nome-${fase.ordem}`}
           value={fase.nome || null}
           options={opcoesFase}
           optionLabel="label"
           optionValue="value"
           onChange={(event) => atualizarFase(fase.ordem, { nome:event.value ?? "" })}
           filter
           showClear
           placeholder="Selecione uma fase cadastrada"
           className={`w-full${ehFaseTce ? " prototype-certame-fase-tce" : ""}`}
           tooltip={ehFaseTce ? "Fase do catálogo padrão do TCE-MT" : undefined}
           disabled={modoVisualizar}
          />
         </label>
         <label>
          <span className="prototype-certame-fase-visually-hidden">Data início da fase</span>
          <input type="text" aria-label="Data início da fase" aria-required="true" required={!modoVisualizar} placeholder="dd/mm/aaaa" value={fase.dataInicio ?? ""} onChange={(event) => atualizarFase(fase.ordem, { dataInicio:event.target.value })} disabled={modoVisualizar} />
         </label>
         <label>
          <span className="prototype-certame-fase-visually-hidden">Data fim da fase</span>
          <input type="text" aria-label="Data fim da fase" aria-required="true" required={!modoVisualizar} placeholder="dd/mm/aaaa" value={fase.dataFim ?? ""} onChange={(event) => atualizarFase(fase.ordem, { dataFim:event.target.value })} disabled={modoVisualizar} />
         </label>
         {!modoVisualizar && <button type="button" className="prototype-certame-fase-remove" aria-label="Remover fase" title="Remover fase" onClick={() => removerFase(fase.ordem)}>
          <i className="pi pi-times" aria-hidden="true" />
         </button>}
        </div>;
        })}
       </div>
      </div></SpecArea>

      {/* RN-06.3: bloco de Prazos de posse/exercício continua dispensado para Processo Seletivo. */}
      {!dispensarParaProcessoSeletivo && <div id="bloco-prazos" className={blocoClasse("bloco-prazos")}>
       <BlocoHeader icone="pi-clock" titulo="Prazos de posse/exercício" subtitulo="Prazos aplicáveis após o ingresso do candidato aprovado." />
       <div className="grid">
        <NumberFieldSeplag name="diasPrazoPosse" control={control} label="Dias — prazo de posse" cols="12 6 3" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="diasPrazoProrrogacaoPosse" control={control} label="Dias — prorrogação da posse" cols="12 6 3" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="diasPrazoExercicio" control={control} label="Dias — prazo de exercício" cols="12 6 3" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        <NumberFieldSeplag name="diasPrazoProrrogacaoExercicio" control={control} label="Dias — prorrogação do exercício" cols="12 6 3" disabled={modoVisualizar} getFormErrorMessage={() => null} />
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
        <DropdownFieldSeplag name="abrangencia" control={control} label="Abrangência" required={houveContratacaoEmpresa} cols={colsContratacaoCustos} options={[...ABRANGENCIAS]} optionLabel="label" optionValue="value" placeholder="Selecione" showClear={false} panelClassName="prototype-certame-dropdown-panel" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        <DropdownFieldSeplag name="tipoContratacaoExecucao" control={control} label="Tipo de contratação (execução)" required={houveContratacaoEmpresa} cols={colsContratacaoCustos} options={[...TIPOS_CONTRATACAO_EXECUCAO]} optionLabel="label" optionValue="value" placeholder="Selecione" showClear={false} panelClassName="prototype-certame-dropdown-panel" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        {houveContratacaoEmpresa && <DropdownFieldSeplag name="instituicaoRealizadora" control={control} label="Instituição realizadora" required={houveContratacaoEmpresa} cols={colsContratacaoCustos} options={[...EMPRESAS_CADASTRADAS]} optionLabel="label" optionValue="value" placeholder="Selecione a empresa cadastrada" showClear={false} panelClassName="prototype-certame-dropdown-panel" disabled={modoVisualizar} getFormErrorMessage={() => null} />}
        <RadioButtonFieldSeplag name="gerouDespesas" control={control} label="O certame gerou despesas para o fiscalizado?" required={houveContratacaoEmpresa} options={[...OPCOES_SIM_NAO]} cols="12" disabled={modoVisualizar} getFormErrorMessage={() => null} />
        {houveContratacaoEmpresa && <DropdownFieldSeplag name="tipoContrato" control={control} label="Tipo de contrato" required={houveContratacaoEmpresa} cols={colsContratacaoCustos} options={[...TIPOS_CONTRATO_BANCA]} optionLabel="label" optionValue="value" placeholder="Selecione" showClear={false} panelClassName="prototype-certame-dropdown-panel" disabled={modoVisualizar} getFormErrorMessage={() => null} />}
        {houveContratacaoEmpresa && <>
         <TextFieldSeplag name="numeroEmpenho" control={control} label="Número do empenho" required={houveContratacaoEmpresa} cols={colsContratacaoCustos} disabled={modoVisualizar} getFormErrorMessage={() => null} />
         <NumberFieldSeplag name="anoEmpenho" control={control} label="Ano do empenho" required={houveContratacaoEmpresa} cols={colsContratacaoCustos} disabled={modoVisualizar} getFormErrorMessage={() => null} />
         <TextFieldSeplag name="numeroContrato" control={control} label="Número do contrato" required={houveContratacaoEmpresa} cols={colsContratacaoCustos} disabled={modoVisualizar} getFormErrorMessage={() => null} />
         <NumberFieldSeplag name="anoContrato" control={control} label="Ano do contrato" required={houveContratacaoEmpresa} cols={colsContratacaoCustos} disabled={modoVisualizar} getFormErrorMessage={() => null} />
         <TextFieldSeplag name="numeroAditivo" control={control} label="Número do aditivo" required={houveContratacaoEmpresa} cols={colsContratacaoCustos} disabled={modoVisualizar} getFormErrorMessage={() => null} />
         <NumberFieldSeplag name="anoAditivo" control={control} label="Ano do aditivo" required={houveContratacaoEmpresa} cols={colsContratacaoCustos} disabled={modoVisualizar} getFormErrorMessage={() => null} />
         <TextFieldSeplag name="codigoUo" control={control} label="Código da UO" required={houveContratacaoEmpresa} cols={colsContratacaoCustos} disabled={modoVisualizar} getFormErrorMessage={() => null} />
         <TextFieldSeplag name="codigoUg" control={control} label="Código da UG" required={houveContratacaoEmpresa} cols={colsContratacaoCustos} disabled={modoVisualizar} getFormErrorMessage={() => null} />
        </>}
       </div>
      </div>

      <div id="bloco-taxa-inscricao" className={blocoClasse("bloco-taxa-inscricao")}>
       <div className="prototype-certame-taxa-header">
        <BlocoHeader icone="pi-wallet" titulo="Taxa de inscrição" subtitulo="Valor da inscrição e regras de isenção, quando aplicável." />
        {valores.cobraTaxaInscricao === "S" && !modoVisualizar && <BotaoAdicionarSeplag type="button" label="Adicionar taxa" onClick={adicionarTaxa} disabled={Boolean(taxaRascunho)} />}
       </div>
       <div className="grid prototype-certame-taxa-toggle"><CheckboxFieldSeplag name="cobraTaxaInscricao" control={control} label=" " checkboxLabel="O certame cobra taxa de inscrição?" cols="12" disabled={modoVisualizar} getFormErrorMessage={() => null} /></div>
       {valores.cobraTaxaInscricao === "S" && <div className="prototype-certame-taxas-table-wrap">
        <table className="prototype-certame-taxas-table">
         <thead><tr><th>Nº</th><th>Valor da inscrição <span className="required-marker">*</span></th><th>Início da inscrição com isenção <span className="required-marker">*</span></th><th>Fim da inscrição com isenção <span className="required-marker">*</span></th><th>Tipo da isenção <span className="required-marker">*</span></th><th>Lei de isenção <span className="required-marker">*</span></th><th>Ações</th></tr></thead>
         <tbody>
          {taxasInscricao.map((taxa, index) => taxaEmEdicaoId === taxa.id ? null : <tr key={taxa.id}>
           <td>{index + 1}</td><td>{taxa.valor.toLocaleString("pt-BR", { style:"currency", currency:"BRL" })}</td><td>{formatarDataTaxa(taxa.inicioIsencao)}</td><td>{formatarDataTaxa(taxa.fimIsencao)}</td><td>{TIPOS_ISENCAO.find((item) => item.value === taxa.tipoIsencao)?.label ?? "—"}</td><td>{opcoesLeis.find((lei) => lei.id === taxa.leiIsencao)?.titulo ?? "—"}</td>
           <td><div className="prototype-certame-taxa-row-actions"><BotaoIconSeplag type="button" severity="warning" tooltip="Editar taxa" icon="pi pi-pencil" disabled={modoVisualizar || Boolean(taxaRascunho)} onClick={() => editarTaxa(taxa)} /><BotaoIconSeplag type="button" severity="danger" tooltip="Excluir taxa" icon="pi pi-trash" disabled={modoVisualizar || Boolean(taxaRascunho)} onClick={() => excluirTaxa(taxa.id)} /></div></td>
          </tr>)}
          {taxaRascunho && <tr className="is-editing">
           <td>{taxaEmEdicaoId ? taxasInscricao.findIndex((taxa) => taxa.id === taxaEmEdicaoId) + 1 : taxasInscricao.length + 1}</td>
           <td><input ref={taxaValorRef} required aria-required="true" type="number" min="0.01" step="0.01" value={taxaRascunho.valor} onChange={(event) => setTaxaRascunho({ ...taxaRascunho, valor:event.target.value })} placeholder="R$ 0,00" />{errosTaxa.valor && <small>{errosTaxa.valor}</small>}</td>
           <td><input required aria-required="true" type="date" value={taxaRascunho.inicioIsencao} onChange={(event) => setTaxaRascunho({ ...taxaRascunho, inicioIsencao:event.target.value })} placeholder="dd/mm/aaaa" />{errosTaxa.inicioIsencao && <small>{errosTaxa.inicioIsencao}</small>}</td>
           <td><input required aria-required="true" type="date" value={taxaRascunho.fimIsencao} onChange={(event) => setTaxaRascunho({ ...taxaRascunho, fimIsencao:event.target.value })} placeholder="dd/mm/aaaa" />{errosTaxa.fimIsencao && <small>{errosTaxa.fimIsencao}</small>}</td>
           <td><select required aria-required="true" value={taxaRascunho.tipoIsencao} onChange={(event) => setTaxaRascunho({ ...taxaRascunho, tipoIsencao:event.target.value })}><option value="">Selecione</option>{TIPOS_ISENCAO.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>{errosTaxa.tipoIsencao && <small>{errosTaxa.tipoIsencao}</small>}</td>
           <td><select required aria-required="true" value={taxaRascunho.leiIsencao} onChange={(event) => setTaxaRascunho({ ...taxaRascunho, leiIsencao:event.target.value })}><option value="">Buscar lei</option>{opcoesLeis.map((lei) => <option key={lei.id} value={lei.id}>{lei.titulo}</option>)}</select>{errosTaxa.leiIsencao && <small>{errosTaxa.leiIsencao}</small>}</td>
           <td><div className="prototype-certame-taxa-row-actions"><button type="button" className="is-save" title="Salvar taxa" aria-label="Salvar taxa" onClick={salvarTaxa}><i className="pi pi-check" /></button><button type="button" className="is-cancel" title="Cancelar inclusão" aria-label="Cancelar inclusão" onClick={cancelarTaxa}><i className="pi pi-times" /></button></div></td>
          </tr>}
          {!taxasInscricao.length && !taxaRascunho && <tr><td colSpan={7} className="prototype-certame-taxas-empty">Nenhuma taxa de inscrição adicionada.</td></tr>}
         </tbody>
        </table>
        <div className="prototype-certame-taxa-law-action"><BotaoSeplag type="button" label="Cadastrar nova lei" icon="pi pi-plus-circle" outlined onClick={() => irCadastrarLei("leiIsencao")} /></div>
       </div>}
      </div>

     </div></SpecArea>}

     {aba === "VAGAS_COTAS" && <SpecArea metadata={certameFormTabSpecifications["Vagas e Cotas"]}><div className="col-12">

      <div id="bloco-cotas" className={blocoClasse("bloco-cotas")}>
       <BlocoHeader icone="pi-percentage" titulo="Cotas" subtitulo="Tipos de cota previstos em lei para o certame." />
       {!modoVisualizar && <div className="grid align-items-end prototype-certame-subform">
        <DropdownFieldSeplag name="tipo" control={cotaForm.control} label="Tipo de cota" cols="12 6 4" options={[...TIPOS_COTA]} optionLabel="label" optionValue="value" showClear={false} panelClassName="prototype-certame-dropdown-panel" getFormErrorMessage={() => null} />
        <CampoLeiMultiplaSeplag name="lei" control={cotaForm.control} label="Lei cadastrada" cols="12 6 6" opcoes={opcoesLeis} onNovoCadastro={() => irCadastrarLei("cotaLei")} />
        <div className="col-12 md:col-2"><BotaoAdicionarSeplag type="button" label="Adicionar" onClick={adicionarCota} /></div>
       </div>}
       <TablePaginadoSeplag dataKey="id" data={resultadosSemPaginacao(cotas)} rows={50} paginator={false} lazy={false} selectionMode={null} columns={colunasCotas} hasEventoAcao={!modoVisualizar} handleView={null} handleEdit={null} handleDelete={modoVisualizar ? null : (row) => removerCota(row.id)} handleOnPageChange={() => {}} />
      </div>

      <div id="bloco-cargos-vagas" className={blocoClasse("bloco-cargos-vagas")}>
       <BlocoHeader icone="pi-users" titulo="Cargos e vagas" subtitulo="Cadastre os cargos/funções e vagas que estarão disponíveis no edital." />
       {!modoVisualizar && <div className="prototype-certame-subform">
        <div className="prototype-certame-subform-secao">
         <span className="prototype-certame-subform-secao-titulo"><span className="prototype-certame-subform-secao-numero">1</span>Identificação da vaga</span>
         <div className="grid align-items-end">
          <DropdownFieldSeplag name="vinculo" control={cargoForm.control} label="Vínculo da vaga" cols={colsIdentificacaoCargo} options={[{ label:"Vaga nova do certame", value:"NOVO" }, { label:"Vaga existente no quadro", value:"EXISTENTE" }]} optionLabel="label" optionValue="value" showClear={false} panelClassName="prototype-certame-dropdown-panel" disabled={modoVisualizar} getFormErrorMessage={() => null} />
          {mostrarCarreiraCargo && <DropdownFieldSeplag name="carreira" control={cargoForm.control} label="Carreira" cols={colsIdentificacaoCargo} options={[...CARREIRAS_CONCURSO]} optionLabel="label" optionValue="value" placeholder="Selecione" showClear={false} panelClassName="prototype-certame-dropdown-panel" disabled={modoVisualizar} getFormErrorMessage={() => null} />}
          {cargoValores.vinculo === "EXISTENTE"
           ? <DropdownFieldSeplag name="cargoExistenteId" control={cargoForm.control} label="Cargo/função" cols={colsIdentificacaoCargo} options={CARGOS_CADASTRADOS.map((item) => ({ label:item.nome, value:item.id }))} optionLabel="label" optionValue="value" placeholder="Buscar cargo cadastrado" showClear={false} panelClassName="prototype-certame-dropdown-panel" disabled={modoVisualizar} getFormErrorMessage={() => null} />
           : <TextFieldSeplag name="cargoNome" control={cargoForm.control} label="Cargo/função" cols={colsIdentificacaoCargo} placeholder="Nome do novo cargo" disabled={modoVisualizar} getFormErrorMessage={() => null} />}
          {mostrarOrgaoCargo && <DropdownFieldSeplag name="orgaoDestino" control={cargoForm.control} label="Órgão" cols={colsIdentificacaoCargo} options={[{ label:"Todos os órgãos", value:ORGAO_TODOS }, ...valores.setoresParticipantes.map((orgao) => ({ label:orgao, value:orgao }))]} optionLabel="label" optionValue="value" placeholder="Selecione" showClear={false} panelClassName="prototype-certame-dropdown-panel" disabled={modoVisualizar} getFormErrorMessage={() => null} />}
          <SpecArea metadata={certameFormBlockSpecifications.quadroVagasVinculado}><RotuloSeplag nome="Quadro" cols={colsIdentificacaoCargo}><div className="prototype-certame-campo-fixo-valor">{quadroVinculado ? quadroVinculado.quadroCodigo : "—"}</div></RotuloSeplag></SpecArea>
          <NumberFieldSeplag name="quantidadeVagas" control={cargoForm.control} label="Qtd. vagas" cols={colsIdentificacaoCargo} inputStyle={{ width:"100%" }} disabled={modoVisualizar} getFormErrorMessage={() => null} />
         </div>
        </div>

        <div className="prototype-certame-subform-secao">
         <span className="prototype-certame-subform-secao-titulo"><span className="prototype-certame-subform-secao-numero">2</span>Localização e jornada</span>
         <div className="grid align-items-end">
          <DropdownFieldSeplag name="polo" control={cargoForm.control} label="Polo" cols="12 6 6" options={polosOptions} optionLabel="label" optionValue="value" placeholder="Selecione" showClear={false} panelClassName="prototype-certame-dropdown-panel" disabled={modoVisualizar} getFormErrorMessage={() => null} />
          <DropdownFieldSeplag name="jornada" control={cargoForm.control} label="Jornada" cols="12 6 6" options={[...JORNADAS_TRABALHO]} optionLabel="label" optionValue="value" placeholder="Selecione" showClear={false} panelClassName="prototype-certame-dropdown-panel" disabled={modoVisualizar} getFormErrorMessage={() => null} />
          {cargoJornadaRepetida && <div className="col-12"><MensagemSeplag severity="warning" message="Já existe uma vaga cadastrada para este Cargo/função com a mesma Jornada. Altere o vínculo, o cargo ou a jornada para continuar." cols="12" /></div>}
         </div>
        </div>

        <div className="prototype-certame-subform-secao">
         <span className="prototype-certame-subform-secao-titulo"><span className="prototype-certame-subform-secao-numero">3</span>Reserva de cotas</span>
         <div className="grid align-items-end">
          <SpecArea metadata={certameFormBlockSpecifications.cadastroReserva}>
           <div className={`col-12 md:col-6 ${cargoValores.aceitaCadastroReserva === "S" ? "lg:col-2" : "lg:col-3"} flex align-items-center gap-2`} style={{ padding:0 }}>
            <SwitchFieldSeplag name="aceitaCadastroReserva" control={cargoForm.control} label="Cargo aceita CR" cols="12" disabled={modoVisualizar} getFormErrorMessage={() => null} />
            <i className="pi pi-info-circle prototype-certame-subform-secao-info" title="Cadastro Reserva (CR): quantidade de vagas de ampla concorrência que também compõem cadastro reserva." aria-hidden="true" />
           </div>
          </SpecArea>
          {cargoValores.aceitaCadastroReserva === "S" && <NumberFieldSeplag name="quantidadeCadastroReserva" control={cargoForm.control} label="Qtd. CR" required cols="12 6 2" inputStyle={{ width:"100%" }} disabled={modoVisualizar} getFormErrorMessage={() => null} />}
          <DropdownFieldSeplag name="tipoCota" control={cargoForm.control} label="Tipo de cota" cols={cargoValores.aceitaCadastroReserva === "S" ? "12 6 3" : "12 6 4"} options={opcoesTipoCotaReserva} optionLabel="label" optionValue="value" placeholder="Selecione" showClear={false} panelClassName="prototype-certame-dropdown-panel" disabled={modoVisualizar} getFormErrorMessage={() => null} />
          <NumberFieldSeplag name="quantidadeCota" control={cargoForm.control} label="Qtd. cota" cols="12 6 3" inputStyle={{ width:"100%" }} disabled={modoVisualizar} getFormErrorMessage={() => null} />
          <div className="col-12 md:col-6 lg:col-2 prototype-certame-add-cota"><BotaoAdicionarSeplag type="button" label="Adicionar cota" icon="pi pi-user-plus" onClick={adicionarReservaCota} /></div>
          {reservasCotaPendentes.length > 0 && <div className="col-12">
           <span className="prototype-certame-subform-secao-titulo" style={{ fontSize:".8rem", marginBottom:".4rem" }}>Cotas adicionadas</span>
           <div className="prototype-certame-cota-tags">
            {reservasCotaPendentes.map((reserva) => <span key={reserva.id} className="prototype-certame-cota-tag">
             {TIPOS_COTA.find((tipo) => tipo.value === reserva.tipo)?.label ?? reserva.tipo} ({reserva.quantidade})
             <button type="button" aria-label="Remover reserva de cota" onClick={() => removerReservaCota(reserva.id)}><i className="pi pi-times" aria-hidden="true" /></button>
            </span>)}
           </div>
          </div>}
         </div>
        </div>

        <div className="prototype-certame-resumo-vaga">
         <span className="prototype-certame-resumo-vaga-titulo"><span className="prototype-certame-resumo-vaga-icone pi pi-users" aria-hidden="true" />Resumo da vaga</span>
         <div className="prototype-certame-resumo-vaga-pills">
          {resumoVagaPills.map((label) => <BadgeSeplag key={label} label={label} color="#0b6199" bg="#e9f3fc" border="transparent" size="xs" />)}
          {resumoVagaCrPill && <BadgeSeplag label={resumoVagaCrPill} color="#147441" bg="#e2f5e8" border="transparent" size="xs" />}
         </div>
         <BotaoAdicionarSeplag type="button" label="Adicionar vaga" onClick={adicionarCargo} />
        </div>
       </div>}
       <span className="prototype-certame-cargos-tabela-titulo"><i className="pi pi-list" aria-hidden="true" />Vagas adicionadas</span>
       <div className="prototype-certame-cargos-tabela">
        <TablePaginadoSeplag
         dataKey="id"
         data={resultadosSemPaginacao(cargos)}
         rows={50}
         paginator={false}
         lazy={false}
         selectionMode={null}
         columns={colunasCargos}
         expandedRows={cargosExpandidosRows}
         rowExpansionTemplate={(cargo) => <DistribuicaoVagasCargo quantidadeVagas={cargo.quantidadeVagas} reservas={cargo.reservasCota} quantidadeCadastroReserva={cargo.aceitaCadastroReserva ? cargo.quantidadeCadastroReserva : undefined} />}
         hasEventoAcao={!modoVisualizar}
         handleView={null}
         handleEdit={null}
         handleDelete={modoVisualizar ? null : (row) => removerCargo(row.id)}
         handleOnPageChange={() => {}}
        />
       </div>
      </div>

     </div></SpecArea>}

     {aba === "DOCUMENTOS" && <SpecArea metadata={certameFormTabSpecifications["Documentos"]}><div id="bloco-documentos" className={`col-12 ${blocoClasse("bloco-documentos")}`}>
      <BlocoHeader icone="pi-file" titulo="Documentos do certame" subtitulo="Anexos exigidos para a prestação de contas ao TCE-MT." />
      {GRUPOS_DOCUMENTOS_CERTAME_ABA.map((grupo) => <div key={grupo.titulo} className="prototype-certame-documentos-grupo">
       <h4>{grupo.titulo}</h4>
       <DocumentosCertameTabela documentos={grupo.documentos} arquivos={arquivos} onChangeArquivo={onChangeArquivoDocumento} documentoObrigatorio={documentoObrigatorio} onError={setErro} somenteLeitura={modoVisualizar} />
      </div>)}
      <p className="text-sm text-color-secondary">Formato aceito: .pdf | Tamanho máximo: 10MB</p>
     </div></SpecArea>}

    </CardSeplag>
   </form>
  </div>
 </SpecificationMode>;
}
